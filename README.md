# GeoVendas_Casa v3.9

Versão focada em corrigir a situação em que os pontos aparecem apenas no celular onde foram cadastrados.

## O que mudou

- adiciona o botão **Enviar locais deste aparelho**;
- esse botão força o envio dos pontos locais para o GitHub e mostra uma mensagem detalhada de sucesso ou erro;
- o botão **Status do banco** agora mostra também quantos pontos existem neste aparelho e quantos existem no banco;
- ao cadastrar um ponto, o app tenta enviar imediatamente ao GitHub e avisa se ficou apenas local;
- mantém o botão **Sincronizar banco** para carregar dados do GitHub em outro aparelho;
- mantém compartilhamento do local com Google Maps e link do app;
- mantém `?point=<id>` para abrir ponto compartilhado.

## Como testar

1. Cadastre um ponto.
2. Abra o menu.
3. Toque em **Enviar locais deste aparelho**.
4. Depois toque em **Status do banco**.
5. O campo **Pontos no banco** deve aumentar.
6. Em outro aparelho, abra o app e toque em **Sincronizar banco**.

## Variáveis necessárias no Vercel

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
OPENAI_API_KEY
OPENAI_IMAGE_MODEL
```

Exemplo:

```txt
GITHUB_REPO=FrancoEvora/geovendas
GITHUB_BRANCH=principal
GITHUB_DB_PATH=data/geovendas-db.json
```

## Publicação

Suba a pasta:

```txt
geovendas-casa-v3-9
```

Depois abra:

```txt
?v=3.9
```
