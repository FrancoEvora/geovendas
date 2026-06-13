# GeoVendas_Casa v3.5

Versão com integração real da OpenAI para gerar imagens do lote com uma casa simulada.

## Novidades da v3.5

- impede que uma imagem gerada por IA vire automaticamente a próxima foto-base;
- usa apenas fotos originais do lote como base automática;
- permite compartilhar a imagem gerada com o Web Share API;
- permite compartilhar mídias salvas na galeria;
- permite compartilhar os dados do local cadastrado;
- exibe confirmação quando a imagem gerada é salva;
- confirma o cadastro do local com mensagem visível;
- mantém exclusão individual de imagens e vídeos;
- mantém ampliação de imagens e vídeos.

## Configuração no Vercel

Configure:

`OPENAI_API_KEY`

Opcional:

`OPENAI_IMAGE_MODEL=gpt-image-1`

Depois faça novo deploy e abra com:

`?v=3.5`

## Observação

Se ainda aparecer outra versão no cabeçalho, limpe cache/abra em aba privada e confirme que a pasta publicada foi `geovendas-casa-v3-5`.
