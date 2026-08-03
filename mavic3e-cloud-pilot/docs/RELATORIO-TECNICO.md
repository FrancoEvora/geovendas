# Relatório técnico — Évora Mavic 3E Cloud Pilot 3.0

## Escopo

- transmissão sem cabo Mini-HDMI e sem placa de captura;
- gateway Windows automatizado, sem Docker;
- MediaMTX RTMP → Low-Latency HLS;
- túnel HTTPS temporário via cloudflared;
- registro automático das URLs e heartbeat no Supabase;
- painel do operador com status de gateway e Pilot 2;
- módulo H5 para DJI Pilot 2 / Cloud API JSBridge;
- experiência do comprador no Safari;
- player HLS.js para Chrome/Edge;
- sincronização de pontos e telemetria;
- nenhuma função de pilotagem ou acionamento dos motores.

## Validações automatizadas

- JavaScript e módulos Node: sintaxe aprovada;
- JSON e configuração Vercel: aprovados;
- arquivos obrigatórios: presentes;
- chave privada do operador: ausente do código público;
- Supabase: contexto público e contexto privado validados;
- stream seguro vinculado à sala;
- rotas locais: `/`, `/operador`, `/pilot2`, `/comprador`, `/diagnostico` e `/gateway` respondendo;
- pacote público do gateway: gerado.

## Limite da validação

A cadeia física Mavic 3E → DJI Pilot 2 → RTMP → gateway → Safari depende do equipamento, da rede e, no modo Cloud API, das credenciais emitidas pela DJI. Ela deve ser validada no local, com o drone estacionário, sem hélices e sob responsabilidade de adulto ou operador qualificado.
