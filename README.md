# Futura Casa v7.0 — Realidade Aumentada

Esta versão mantém os recursos da experiência do comprador e adiciona recursos v7.0 na tela de detalhes do lote.

## Novidades

Na janela de detalhes do lote:
- Botão **Rota**: solicita permissão de localização do usuário e abre o Google Maps para traçar rota até o lote.
- Botão **Realidade aumentada**: solicita câmera, localização e bússola/orientação do aparelho para criar uma visualização AR com pontos de referência.

## Observação importante

As coordenadas dos lotes estão cadastradas como coordenadas demonstrativas no array `LOTS`.
Para produção, substitua `coords.lat` e `coords.lng` pelos pontos oficiais de cada lote.

## Publicação

Suba tudo na raiz do GitHub/Vercel:

```text
index.html
assets/
README.md
```
