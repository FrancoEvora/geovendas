# GeoVendas_Casa v3.7

Versão com geração real de imagem por API e banco de dados real hospedado no GitHub.

## Correção principal da v3.7

A v3.7 corrige o problema dos pontos aparecerem apenas no aparelho onde foram cadastrados.

O que mudou:

- adiciona o botão **Sincronizar banco** no menu;
- ao cadastrar um ponto, o app tenta sincronizar imediatamente com o GitHub;
- se a sincronização falhar, a mensagem deixa claro que o ponto ficou salvo apenas no aparelho;
- antes de salvar novos pontos no GitHub, o app carrega o banco remoto para evitar sobrescrever pontos criados em outro aparelho;
- ao abrir o app, ele tenta carregar automaticamente os pontos do GitHub;
- links compartilhados com `?point=<id>` tentam buscar o ponto no banco remoto.

## Banco GitHub

A função serverless é:

```txt
api/db.js
```

Ela grava os pontos em:

```txt
GITHUB_DB_PATH
```

Exemplo:

```txt
data/geovendas-db.json
```

## Variáveis necessárias no Vercel

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
```

Exemplo:

```txt
GITHUB_REPO=FrancoEvora/geovendas
GITHUB_BRANCH=principal
GITHUB_DB_PATH=data/geovendas-db.json
```

O `GITHUB_TOKEN` precisa ter permissão **Contents: Read and write**.

## OpenAI

Para geração de imagem:

```txt
OPENAI_API_KEY
OPENAI_IMAGE_MODEL=gpt-image-1
```

## Mídias

Nesta etapa, o GitHub salva os dados dos pontos. Fotos, vídeos e imagens geradas continuam armazenados no aparelho.

## Publicação

Suba a pasta:

```txt
geovendas-casa-v3-7
```

Depois abra:

```txt
?v=3.7
```

Se ainda aparecer outra versão no cabeçalho, limpe cache ou abra em aba privada.
