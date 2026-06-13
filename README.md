# GeoVendas_Casa v3.0

Versão com a nova visão comercial: **simulação de casa no lote por IA**, usando uma foto real do lote como base.

## O que mudou

- Mantém câmera, GPS, bússola, pontos flutuantes, cadastro de locais, fotos, vídeos, detalhes e rota.
- Substitui a tentativa de AR/casa sobreposta por uma jornada de geração de imagem:
  1. escolher ou capturar foto do lote;
  2. escolher modelo/estilo de casa;
  3. montar prompt profissional;
  4. gerar imagem por IA;
  5. salvar na galeria do lote;
  6. compartilhar com cliente, cônjuge ou família.

## Geração de imagem

A geração automática usa a função:

`/api/generate-house-image`

Ela precisa da variável de ambiente:

`OPENAI_API_KEY`

Se a chave não estiver configurada, o app ainda funciona e mostra o prompt completo para copiar.

## Publicação no Vercel

Suba a pasta `geovendas-casa-v3-0` no Vercel.

Depois configure:

- Project Settings
- Environment Variables
- `OPENAI_API_KEY`

Abra com:

`?v=3.0`

## Observação comercial

Toda simulação é conceitual. Ela não substitui projeto arquitetônico, aprovação legal ou estudo técnico.
