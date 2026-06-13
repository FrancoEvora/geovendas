# GeoVendas_Casa v3.4

Versão com integração real da OpenAI para gerar imagens do lote com uma casa simulada.

## O que esta versão corrige

- Atualiza a interface para **GeoVendas_Casa v3.4**.
- Corrige o problema `The string did not match the expected pattern`.
- Troca o modelo padrão para `gpt-image-1`.
- Envia a foto do lote como imagem única no endpoint de edição.
- Comprime a foto antes do envio.
- Mantém exclusão individual de mídias, ampliação da galeria, salvamento e compartilhamento.
- Exibe mensagens de erro mais claras.

## Configuração no Vercel

Configure a variável de ambiente:

`OPENAI_API_KEY`

Opcionalmente:

`OPENAI_IMAGE_MODEL=gpt-image-1`

Depois faça novo deploy e abra com:

`?v=3.4`

## Observação

Se ainda aparecer `GeoVendas_Casa v3.0`, é cache ou deploy antigo. Publique a pasta `geovendas-casa-v3-4` e abra com `?v=3.4`.

## Correção da v3.4
- Atualiza `package.json` para `engines.node = 24.x`, corrigindo falha de build no Vercel por Node 18 descontinuado.
- Mantém a integração real com `/api/generate-house-image`.
