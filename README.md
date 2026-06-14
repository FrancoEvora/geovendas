# GeoVendas_Casa v3.10

Versão de desenvolvimento com pontos e mídias armazenados no GitHub.

## O que entrou

- fotos, vídeos e imagens geradas passam a ser enviados para o arquivo JSON do GitHub em Base64;
- outros aparelhos conseguem carregar a galeria junto com os pontos;
- o botão **Enviar locais e mídias** força o envio dos dados locais para o GitHub;
- o status do banco mostra também a quantidade de mídias no banco;
- continua usando o GitHub como banco de desenvolvimento.

## Atenção

Esta solução é adequada para teste e desenvolvimento. Como as mídias ficam em Base64 dentro do JSON, o arquivo pode crescer rapidamente.

## Variáveis necessárias

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
OPENAI_API_KEY
OPENAI_IMAGE_MODEL=gpt-image-1
```

## Publicação

Suba a pasta `geovendas-casa-v3-10` e abra com:

```txt
?v=3.10
```
