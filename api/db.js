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

async function readDb() {
  const config = githubConfig();
  const url = `https://api.github.com/repos/${config.repo}/contents/${encodeURIComponent(config.path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(config.branch)}`;
  const { response, data } = await githubRequest(url);

  if (response.status === 404) {
    return { points: [], sha: null, exists: false };
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Falha ao ler banco no GitHub.');
  }

  const jsonText = decodeBase64Content(data.content);
  let parsed = {};
  try { parsed = JSON.parse(jsonText); } catch { parsed = {}; }

  return {
    points: Array.isArray(parsed.points) ? parsed.points : [],
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
    points: Array.isArray(points) ? points : []
  };

  const body = {
    message: `Atualiza banco GeoVendas (${new Date().toISOString()})`,
    content: Buffer.from(JSON.stringify(payload, null, 2), 'utf8').toString('base64'),
    branch: config.branch
  };

  if (current.sha) body.sha = current.sha;

  const url = `https://api.github.com/repos/${config.repo}/contents/${encodeURIComponent(config.path).replace(/%2F/g, '/')}`;
  const { response, data } = await githubRequest(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(data?.message || 'Falha ao gravar banco no GitHub.');
  }

  return { ok: true, sha: data?.content?.sha || null, updatedAt: payload.updatedAt };
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
      return res.status(200).json({ enabled: true, points: db.points, updatedAt: db.updatedAt || null });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const points = Array.isArray(body.points) ? body.points : [];
      const result = await writeDb(points);
      return res.status(200).json({ enabled: true, ...result });
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
