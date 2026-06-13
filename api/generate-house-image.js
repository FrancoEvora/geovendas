function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function dataUrlToBlob(dataUrl) {
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl || '');
  if (!match) throw new Error('Imagem inválida. Envie um dataURL base64.');
  const mime = match[1] || 'image/png';
  const buffer = Buffer.from(match[2], 'base64');
  return new Blob([buffer], { type: mime });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(501).json({
      error: 'OPENAI_API_KEY não configurada no Vercel. O prompt foi preparado, mas a geração automática ainda não está ativa.'
    });
  }

  try {
    const body = parseBody(req);
    const prompt = String(body.prompt || '').trim();
    const lotImage = body.lotImage;
    const houseReference = body.houseReference;

    if (!prompt || !lotImage) {
      return res.status(400).json({ error: 'Envie prompt e lotImage.' });
    }

    const form = new FormData();
    form.append('model', 'gpt-image-2');
    form.append('prompt', prompt);
    form.append('size', '1024x1536');
    form.append('quality', 'medium');
    form.append('output_format', 'png');

    const lotBlob = dataUrlToBlob(lotImage);
    form.append('image[]', lotBlob, 'foto-lote.png');

    if (houseReference) {
      const refBlob = dataUrlToBlob(houseReference);
      form.append('image[]', refBlob, 'referencia-casa.png');
    }

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || 'Falha ao gerar imagem.';
      return res.status(response.status).json({ error: message, details: data });
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(502).json({ error: 'A API não retornou imagem.' });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${b64}`
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Erro interno.' });
  }
};
