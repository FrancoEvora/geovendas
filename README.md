# GeoVendas_Casa v3.6

Versão com geração real de imagem por API e banco de dados real hospedado no GitHub.

## Novidades da v3.6

- O botão **Compartilhar local** agora envia:
  - link de rota no Google Maps;
  - link do próprio GeoVendas para abrir o ponto no aplicativo.
- O aplicativo reconhece links com `?point=<id>` e abre o ponto compartilhado.
- Foi criado um banco de dados real via GitHub, usando uma função serverless:
  - `api/db.js`
- Pontos cadastrados são sincronizados em um arquivo JSON no GitHub.
- Ao salvar/cadastrar/excluir, o app tenta sincronizar o banco remoto.
- Mídias continuam no aparelho nesta etapa; o GitHub salva os dados dos pontos.

## Variáveis necessárias no Vercel

Para geração de imagem:

```txt
OPENAI_API_KEY
```

Opcional:

```txt
OPENAI_IMAGE_MODEL=gpt-image-1
```

Para o banco de dados GitHub:

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
```

Exemplo:

```txt
GITHUB_REPO=seu-usuario/geovendas-db
GITHUB_BRANCH=main
GITHUB_DB_PATH=data/geovendas-db.json
```

`GITHUB_TOKEN` deve ter permissão de leitura e escrita em Contents no repositório escolhido.

## Como funciona o banco GitHub

A função `/api/db` lê e grava um arquivo JSON no GitHub.

Formato básico:

```json
{
  "version": 1,
  "updatedAt": "2026-06-13T00:00:00.000Z",
  "points": []
}
```

Se o arquivo ainda não existir, a API cria automaticamente no primeiro salvamento.

## Publicação

Suba a pasta:

```txt
geovendas-casa-v3-6
```

Depois abra:

```txt
?v=3.6
```

## Observação

O GitHub funciona bem como banco inicial para protótipo e uso controlado. Em uma fase futura, o ideal será migrar para Supabase, Firebase, Neon ou outro banco com autenticação e storage de mídias.
