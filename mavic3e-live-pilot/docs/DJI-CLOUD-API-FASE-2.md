# Integração direta com DJI Cloud API — fase 2

O piloto inicial usa a saída Mini-HDMI porque isso permite provar a experiência com a câmera real sem esperar credenciais DJI.

A rota definitiva será:

```text
Mavic 3E → DJI Pilot 2 → DJI Cloud API → MQTT + servidor de mídia → aplicação Évora
```

Requisitos:

- cadastro no portal DJI Developer;
- criação de aplicação Cloud API;
- App ID, App Key e App License;
- página da plataforma carregada no WebView do DJI Pilot 2;
- validação da licença por JSBridge;
- broker MQTT;
- servidor de mídia RTMP/RTSP/GB28181/Agora ou arquitetura WebRTC compatível;
- backend persistente fora das Functions serverless da Vercel.

A aplicação entregue separa vídeo, sinalização, telemetria e pontos para permitir essa troca de ingestão sem refazer a experiência do comprador.
