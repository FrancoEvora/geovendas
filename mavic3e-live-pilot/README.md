# Évora Mavic 3E Live Pilot

Piloto operacional para transmitir, sem decolagem, a câmera real do DJI Mavic 3E ao iPhone ou iPad do comprador.

## Produção

- Aplicação: `https://evora-mavic3e-live-pilot.vercel.app`
- Diagnóstico: `/diagnostico?room=<token>`
- Operador: `/operador?room=<token>&key=<chave-privada>`
- Comprador: `/comprador?room=<token>`

A chave privada do operador não está neste repositório.

## Arquitetura do primeiro teste

```text
Mavic 3E imóvel e sem hélices
  → DJI RC Pro Enterprise
  → Mini-HDMI
  → placa de captura HDMI/USB UVC
  → Chrome ou Edge no notebook
  → WebRTC ponto a ponto
  → Safari no iPhone
```

O Supabase mantém a sala e as mensagens temporárias de negociação WebRTC. O vídeo não é armazenado no banco nem passa por funções da Vercel.

## Recursos

- diagnóstico de HTTPS, câmera, WebRTC e Supabase;
- captura HDMI/USB compatível com UVC;
- modo de demonstração sem drone;
- transmissão WebRTC direta;
- painel privado do operador;
- página do comprador sem instalação;
- marcação de referências e sincronização pelo canal de dados;
- telemetria manual para o piloto;
- infraestrutura preparada para DJI Cloud API e servidor de mídia.

## Segurança

O teste é exclusivamente estacionário. Remova todas as hélices, retire o protetor do gimbal antes de ligar, mantenha o drone em superfície firme e não acione os motores. A plataforma não envia comandos de voo.
