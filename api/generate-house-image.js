const fs = require('fs');
const path = require('path');

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function dataUrlToParts(dataUrl) {
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl || '');
  if (!match) throw new Error('Imagem do lote inválida. Reenvie a foto.');
  return { mime: match[1] || 'image/jpeg', buffer: Buffer.from(match[2], 'base64') };
}

function readLocalReference(style) {
  const map = {
    cleoni: 'casa-cleoni-referencia.png'
  };
  const fileName = map[style];
  if (!fileName) return null;
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return null;
  return { buffer: fs.readFileSync(filePath), mime: 'image/png', fileName };
}

async function callOpenAI({ apiKey, prompt, lotImage, modelStyle }) {
  const lot = dataUrlToParts(lotImage);
  const form = new FormData();

  form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('size', '1024x1536');
  form.append('quality', 'medium');
  form.append('output_format', 'png');

  // Uma única imagem de entrada evita o erro de padrão com arrays multipart em alguns ambientes.
  // A referência da Casa Cleoni fica descrita no prompt e pode ser reativada em outra versão se necessário.
  form.append('image', new Blob([lot.buffer], { type: lot.mime }), 'foto-lote.jpg');

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    return { ok: false, status: 502, error: `Resposta inválida da OpenAI: ${raw.slice(0, 300)}` };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || 'Falha ao gerar imagem.',
      details: data
    };
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    return { ok: false, status: 502, error: 'A API não retornou a imagem gerada.', details: data };
  }

  return { ok: true, image: `data:image/png;base64,${b64}`, usage: data?.usage || null };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada no projeto Vercel.' });
  }

  try {
    const body = parseBody(req);
    const prompt = String(body.prompt || '').trim();
    const lotImage = String(body.lotImage || '');
    const modelStyle = String(body.modelStyle || 'cleoni');

    if (!prompt) return res.status(400).json({ error: 'Prompt ausente.' });
    if (!lotImage) return res.status(400).json({ error: 'Foto do lote ausente.' });

    const result = await callOpenAI({ apiKey, prompt, lotImage, modelStyle });
    if (!result.ok) {
      return res.status(result.status || 500).json({ error: result.error, details: result.details || null });
    }

    return res.status(200).json({ image: result.image, usage: result.usage });
  } catch (error) {
    console.error('generate-house-image error', error);
    return res.status(500).json({ error: error?.message || 'Erro interno ao gerar imagem.' });
  }
};

module.exports.config = {
  api: {
    bodyParser: { sizeLimit: '12mb' },
    responseLimit: false
  }
};
