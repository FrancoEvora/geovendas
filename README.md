# GeoVendas_Casa v3.3

Versão real com chamada à OpenAI e limpeza agressiva de cache antigo.

## Correções
- mostra claramente `GeoVendas_Casa v3.3` no cabeçalho;
- desativa service worker para evitar que o celular continue carregando v3.0;
- apaga caches antigos no primeiro carregamento;
- mantém a chamada real para `/api/generate-house-image`;
- envia foto do lote compactada para `gpt-image-1`;
- mantém salvar, ampliar e compartilhar a imagem gerada.

## Vercel
Configure `OPENAI_API_KEY` em Environment Variables.

Opcional: `OPENAI_IMAGE_MODEL=gpt-image-1`.

Depois publique a pasta `geovendas-casa-v3-3` e abra com `?v=3.3`.
