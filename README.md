# GeoVendas_Casa v3.8

Versão focada em diagnóstico e correção da sincronização com GitHub.

## Correção principal

A v3.8 melhora a sincronização dos pontos entre aparelhos.

## Novidades

- adiciona botão **Status do banco** no menu;
- mostra repositório, branch, arquivo e quantidade de pontos no GitHub;
- adiciona mensagens mais claras quando a sincronização falha;
- remove o bloqueio permanente do banco quando uma leitura falha;
- o botão **Sincronizar banco** agora carrega e salva explicitamente;
- o app envia `replace=true` quando precisa substituir o banco remoto, como em exclusões;
- mantém compartilhamento do local com link Google Maps e link do app;
- mantém `?point=<id>` para abrir ponto compartilhado.

## Variáveis necessárias no Vercel

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
OPENAI_API_KEY
OPENAI_IMAGE_MODEL
```

Exemplo do banco:

```txt
GITHUB_REPO=FrancoEvora/geovendas
GITHUB_BRANCH=principal
GITHUB_DB_PATH=data/geovendas-db.json
```

## Publicação

Suba a pasta:

```txt
geovendas-casa-v3-8
```

Depois abra:

```txt
?v=3.8
```

## Teste

1. Abra o menu.
2. Toque em **Status do banco**.
3. Confirme se mostra o repositório e a quantidade de pontos.
4. Cadastre um ponto.
5. Toque em **Sincronizar banco**.
6. Abra outro aparelho e toque em **Sincronizar banco**.
