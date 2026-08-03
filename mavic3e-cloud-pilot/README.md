# Évora Mavic 3E Cloud Pilot 3.0

Versão sem cabo HDMI para transmitir a câmera do DJI Mavic 3E ao iPhone ou iPad do comprador.

## Produção

- Aplicação: `https://evora-mavic3e-cloud-pilot.vercel.app`
- Estado do deploy: `READY`
- Runtime: bundle verificado por SHA-256 e servido a partir do Supabase
- Rotas verificadas: início, operador, Pilot 2, comprador, diagnóstico e gateway

## Arquitetura

```text
Mavic 3E
  → DJI AirLink
  → RC Pro Enterprise / DJI Pilot 2
  → RTMP por Wi‑Fi
  → MediaMTX no notebook
  → Low-Latency HLS
  → Cloudflare Quick Tunnel HTTPS
  → aplicação Vercel
  → Safari do comprador
```

## O que foi automatizado

- gateway Windows sem Docker;
- download verificado de MediaMTX e cloudflared;
- detecção do IP local;
- criação do túnel HTTPS;
- registro de RTMP/HLS no Supabase;
- heartbeat e detecção de stream ativo;
- carregamento automático das URLs no operador, no Pilot 2 e no comprador;
- link estável do comprador, sem URL temporária na query string;
- player HLS nativo no Safari e HLS.js em Chrome/Edge;
- marcações e telemetria sincronizadas pelo Supabase.

## Modos de envio no controle

### RTMP do Pilot 2

Quando o firmware disponibilizar a opção de livestream/RTMP personalizada, copie o endereço publicado pelo gateway.

### DJI Cloud API / JSBridge

A rota `/pilot2` implementa:

- `platformVerifyLicense`;
- `platformSetWorkspaceId`;
- `platformSetInformation`;
- `platformLoadComponent('liveshare', ...)`;
- configuração RTMP;
- início, parada e consulta de status;
- sincronização do estado com o Supabase.

Esse modo depende de App ID, App Key e App License emitidos pela DJI. As credenciais não são persistidas no banco.

## Rotas

- `/` — entrada;
- `/operador` — console comercial e pontos;
- `/pilot2` — módulo H5 para o controle;
- `/comprador` — experiência no iPhone;
- `/diagnostico` — teste de gateway, Supabase e HLS;
- `/gateway` — instalação do gateway.

## Artefatos

- `runtime/dist-archive.json.gz` — bundle da aplicação;
- `vercel-function/` — função de produção que lê e verifica o bundle no Supabase;
- `release/evora-mavic3e-cloud-pilot-source.zip` — código-fonte completo, sem segredos;
- `docs/` — roteiro operacional e relatório técnico.

## Segurança física

O piloto é estacionário. Remova todas as hélices, retire o protetor do gimbal antes de ligar, mantenha o equipamento em superfície estável e não acione os motores. Realize o teste com adulto responsável ou operador qualificado. A aplicação não envia comandos de voo.
