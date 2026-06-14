# GeoVendas_Casa v3.11

Versão focada em corrigir a sensação de “um banco por sessão/usuário”.

## O que mudou

- O GitHub passa a ser tratado como **banco oficial**.
- Ao abrir o app, ele tenta carregar o banco oficial do GitHub.
- Ao tocar em **Sincronizar banco**, o app carrega o banco oficial, em vez de regravar a cópia local por cima.
- O botão **Enviar locais e mídias** continua existindo para enviar dados que ficaram apenas neste aparelho.
- Depois de enviar dados ao GitHub, o app atualiza a tela com o retorno oficial do banco.
- Se o banco oficial estiver vazio e o aparelho tiver pontos locais, o app não apaga automaticamente esses pontos; ele orienta a enviar os dados locais.
- Mídias em Base64 no JSON continuam disponíveis para desenvolvimento e teste.

## Como testar

1. Cadastre um ponto no aparelho A.
2. Toque em **Enviar locais e mídias**.
3. Verifique se o GitHub mostra o ponto no arquivo JSON.
4. Abra o app no aparelho B.
5. Toque em **Sincronizar banco**.
6. O ponto deve aparecer no aparelho B.

## Variáveis Vercel

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
OPENAI_API_KEY
OPENAI_IMAGE_MODEL=gpt-image-1
```

## Publicação

Suba a pasta:

```txt
geovendas-casa-v3-11
```

Depois abra:

```txt
?v=3.11
```
