# GeoVendas_Casa v3.12

Versão focada em resolver divergência entre aparelhos.

## O que mudou

- O GitHub passa a ser tratado como **banco oficial**.
- O app usa uma nova chave de cache local, separada das versões antigas.
- Ao abrir o app, ele tenta baixar o banco oficial do GitHub.
- O botão **Sincronizar banco** baixa o banco oficial.
- O botão **Baixar banco oficial** limpa o cache local atual e baixa novamente o banco central.
- O botão **Enviar locais e mídias** envia para o GitHub os pontos que estão no aparelho.
- O botão **Importar cache antigo** tenta recuperar pontos salvos localmente por versões anteriores.
- Depois de cadastrar um ponto, o app tenta salvar somente aquele ponto no banco oficial.
- Depois de excluir um ponto, o app tenta excluir o ponto no banco oficial.

## Como testar

1. Publique a pasta `geovendas-casa-v3-12`.
2. Abra com `?v=3.12`.
3. Em um aparelho que já tenha pontos antigos, toque em **Importar cache antigo**.
4. Depois toque em **Enviar locais e mídias**.
5. Em outro aparelho, toque em **Baixar banco oficial** ou **Sincronizar banco**.
6. Os aparelhos devem ficar iguais.

## Variáveis Vercel

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
OPENAI_API_KEY
OPENAI_IMAGE_MODEL=gpt-image-1
```

## Observação

A partir desta versão, o objetivo é parar de depender de caches antigos de cada celular. O GitHub passa a ser a referência principal.
