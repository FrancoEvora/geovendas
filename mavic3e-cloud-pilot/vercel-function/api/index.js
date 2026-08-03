const zlib = require('node:zlib');
const crypto = require('node:crypto');

const SUPABASE_URL = 'https://qsdffayasuzsmngteika.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nMCXNDXMvU0EbMSSmnEfQg_0uE_lVOW';
const VERSION = 'cloud-pilot-3.0';
const EXPECTED_SHA256 = '301c1d510a304281dc6cabdb9809957ee80161da521fdaf01731f603a2e6d71a';
let filesPromise;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ps1': 'text/plain; charset=utf-8',
  '.bat': 'text/plain; charset=utf-8',
  '.sh': 'text/x-shellscript; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

async function loadFiles() {
  if (!filesPromise) {
    filesPromise = fetch(`${SUPABASE_URL}/rest/v1/rpc/spatial_cloud_runtime_bundle`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_version: VERSION })
    }).then(async response => {
      if (!response.ok) throw new Error(`runtime RPC HTTP ${response.status}: ${await response.text()}`);
      const bundle = await response.json();
      if (!bundle || !bundle.data) throw new Error('runtime bundle ausente');
      const compressed = Buffer.from(bundle.data, 'base64');
      const digest = crypto.createHash('sha256').update(compressed).digest('hex');
      if (digest !== EXPECTED_SHA256 || digest !== bundle.sha256) throw new Error(`runtime sha256 mismatch: ${digest}`);
      return JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
    }).catch(error => {
      filesPromise = undefined;
      throw error;
    });
  }
  return filesPromise;
}

function extension(path) {
  const index = path.lastIndexOf('.');
  return index >= 0 ? path.slice(index).toLowerCase() : '';
}

function resolvePath(rawPath) {
  const clean = decodeURIComponent(rawPath || '').replace(/^\/+|\/+$/g, '');
  const routes = {
    '': 'index.html',
    'index.html': 'index.html',
    'operador': 'operator.html',
    'operator': 'operator.html',
    'pilot2': 'pilot2.html',
    'comprador': 'viewer.html',
    'viewer': 'viewer.html',
    'diagnostico': 'diagnostics.html',
    'diagnostics': 'diagnostics.html',
    'gateway': 'gateway.html'
  };
  return routes[clean] || clean;
}

module.exports = async (request, response) => {
  try {
    const url = new URL(request.url, 'https://evora.invalid');
    const key = resolvePath(url.searchParams.get('path'));
    const item = (await loadFiles())[key];

    if (!item) {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return response.end('Arquivo não encontrado.');
    }

    const ext = extension(key);
    const body = item.t === 'base64' ? Buffer.from(item.d, 'base64') : Buffer.from(item.d, 'utf8');
    response.statusCode = 200;
    response.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https: http:; connect-src 'self' https: http: ws: wss:; frame-src 'self' https: http:; object-src 'none'; base-uri 'self'; frame-ancestors *");
    response.setHeader('Cache-Control', ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=300, s-maxage=3600');
    response.setHeader('X-Evora-Cloud-Pilot', VERSION);
    if (ext === '.zip') response.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
    response.setHeader('Content-Length', String(body.length));
    return response.end(body);
  } catch (error) {
    console.error('evora-cloud-pilot', error);
    response.statusCode = 502;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return response.end('A aplicação está temporariamente indisponível.');
  }
};
