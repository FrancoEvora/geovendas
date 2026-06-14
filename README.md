# Futura Casa + GeoVendas Campo v4.0

Versão integrada com a Futura Casa como início da jornada e o GeoVendas Campo como módulo de apoio presencial no loteamento.

## Conceito

- Futura Casa: onde o cliente começa a jornada e escolhe se quer casa, lote ou lote + casa.
- GeoVendas Campo: suporte em campo, com câmera, GPS, pontos próximos, detalhes, rota, fotos e simulação por IA.

## Módulos da tela inicial

- Início
- Lotes
- Casas
- Simulador
- Jornada
- GeoVendas Campo

## Mantido da versão anterior

- cadastro de pontos;
- pontos flutuantes;
- detalhes do local;
- rota;
- galeria;
- excluir/compartilhar mídia;
- simulação por IA;
- banco GitHub via `/api/db`;
- geração de imagem via `/api/generate-house-image`.

## Variáveis no Vercel

Para geração de imagem:

```txt
OPENAI_API_KEY
OPENAI_IMAGE_MODEL=gpt-image-1
```

Para o banco GitHub:

```txt
GITHUB_TOKEN
GITHUB_REPO
GITHUB_BRANCH
GITHUB_DB_PATH
```

## Publicação

Suba a pasta:

```txt
futura-casa-geovendas-v4-0
```

Abra com:

```txt
?v=4.0
```
