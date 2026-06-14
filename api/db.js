function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    path: process.env.GITHUB_DB_PATH || 'data/geovendas-db.json'
  };
}

function missingConfig(config) {
  const missing = [];
  if (!config.token) missing.push('GITHUB_TOKEN');
  if (!config.repo) missing.push('GITHUB_REPO');
  return missing;
}

function contentsUrl(config) {
  const filePath = encodeURIComponent(config.path).replace(/%2F/g, '/');
  return `https://api.github.com/repos/${config.repo}/contents/${filePath}`;
}

async function githubRequest(url, options = {}) {
  const config = githubConfig();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { response, data };
}

function decodeBase64Content(content) {
  const normalized = String(content || '').replace(/\n/g, '');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function normalizePoints(points) {
  return Array.isArray(points) ? points.filter((point) => point && point.id) : [];
}

function mergePoints(existing = [], incoming = []) {
  const byId = new Map();
  for (const point of normalizePoints(existing)) byId.set(point.id, point);
  for (const point of normalizePoints(incoming)) {
    const current = byId.get(point.id);
    if (!current) {
      byId.set(point.id, point);
      continue;
    }
    const currentTime = Number(current.updatedAt || current.createdAt || 0);
    const incomingTime = Number(point.updatedAt || point.createdAt || 0);
    if (incomingTime >= currentTime) {
      byId.set(point.id, { ...current, ...point });
    }
  }
  return Array.from(byId.values()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

async function readDb() {
  const config = githubConfig();
  const url = `${contentsUrl(config)}?ref=${encodeURIComponent(config.branch)}`;
  const { response, data } = await githubRequest(url);

  if (response.status === 404) {
    return { points: [], sha: null, exists: false, updatedAt: null };
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Falha ao ler banco no GitHub.');
  }

  const jsonText = decodeBase64Content(data.content);
  let parsed = {};
  try { parsed = JSON.parse(jsonText); } catch { parsed = {}; }

  return {
    points: normalizePoints(parsed.points),
    updatedAt: parsed.updatedAt || null,
    sha: data.sha,
    exists: true
  };
}

async function writeDb(points) {
  const config = githubConfig();
  const current = await readDb();
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    points: normalizePoints(points)
  };

  const body = {
    message: `Atualiza banco GeoVendas (${new Date().toISOString()})`,
    content: Buffer.from(JSON.stringify(payload, null, 2), 'utf8').toString('base64'),
    branch: config.branch
  };

  if (current.sha) body.sha = current.sha;

  const { response, data } = await githubRequest(contentsUrl(config), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(data?.message || 'Falha ao gravar banco no GitHub.');
  }

  return { ok: true, sha: data?.content?.sha || null, updatedAt: payload.updatedAt, points: payload.points };
}

module.exports = async function handler(req, res) {
  const config = githubConfig();
  const missing = missingConfig(config);

  if (missing.length) {
    return res.status(501).json({
      enabled: false,
      error: `Banco GitHub não configurado. Variáveis ausentes: ${missing.join(', ')}.`
    });
  }

  try {
    if (req.method === 'GET') {
      const db = await readDb();
      return res.status(200).json({
        enabled: true,
        repo: config.repo,
        branch: config.branch,
        path: config.path,
        points: db.points,
        count: db.points.length,
        updatedAt: db.updatedAt || null,
        exists: db.exists
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const incoming = normalizePoints(body.points);
      const action = body.action || (body.replace ? 'replaceAll' : 'merge');

      const current = await readDb();
      let nextPoints;

      if (action === 'replaceAll') {
        nextPoints = incoming;
      } else if (action === 'deletePoint') {
        const pointId = String(body.pointId || '');
        nextPoints = current.points.filter((point) => point.id !== pointId);
      } else if (action === 'upsertPoint') {
        nextPoints = mergePoints(current.points, body.point ? [body.point] : incoming);
      } else {
        nextPoints = mergePoints(current.points, incoming);
      }

      const result = await writeDb(nextPoints);
      return res.status(200).json({ enabled: true, action, count: result.points.length, ...result });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Use GET ou POST.' });
  } catch (error) {
    console.error('api/db error', error);
    return res.status(500).json({ error: error?.message || 'Erro no banco GitHub.' });
  }
};

module.exports.config = {
  api: {
    bodyParser: { sizeLimit: '4mb' }
  }
};
