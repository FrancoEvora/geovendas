# Évora Mavic 3E Pilot v4

Reconstrução integral do piloto **estacionário** para transmitir a câmera do DJI Mavic 3E ao navegador do comprador sem cabo HDMI.

## Produção

- aplicação: `https://evora-mavic3e-pilot-v4.vercel.app`
- branch: `agent/mavic3e-pilot-v4`
- pacote-fonte validado: `EVORA-MAVIC3E-PILOT-V4-FONTE.zip`
- SHA-256 do pacote-fonte: `d59bc05cd6fa32cfb896fa99f7ee77558da23e8d04d4b73e24f0454fd059b3bc`

O pacote-fonte integral e o kit privado de operação foram entregues separadamente. Esta branch mantém a documentação e os componentes críticos que demonstram a mudança arquitetural, sem versionar a chave privada.

## Mudança central da v4

As versões anteriores usavam MediaMTX como receptor RTMP. Nos testes reais, o DJI Pilot 2 concluía a conexão TCP, mas permanecia em estado RTMP `idle`, sem publicar o caminho. A v4 remove esse ponto de ambiguidade e usa o FFmpeg em modo servidor (`-listen 1`) diretamente no endereço único:

```text
rtmp://IP_DO_NOTEBOOK:1935/live
```

O FFmpeg recebe o RTMP, normaliza o vídeo em H.264 e produz HLS para o navegador.

## Fluxo

```text
Mavic 3E imóvel e sem hélices
  → RC Pro Enterprise / DJI Pilot 2
  → RTMP por Wi-Fi: rtmp://IP:1935/live
  → FFmpeg listener no notebook
  → HLS local: http://IP:8787/live/index.m3u8
  → Cloudflare Quick Tunnel opcional
  → aplicação Évora Spatial na Vercel
  → Safari do iPhone/iPad
```

## Um único BAT

Execute `gateway/INICIAR-TUDO.bat`. O processo:

1. solicita elevação administrativa;
2. valida a configuração privada;
3. limpa processos antigos e verifica portas;
4. detecta IP e interface de rede;
5. altera a rede para perfil privado, quando permitido;
6. cria regras de firewall limitadas à sub-rede local;
7. baixa FFmpeg e valida o SHA-256 oficial;
8. baixa cloudflared e valida o digest quando disponibilizado;
9. inicia o servidor HTTP local;
10. executa um autoteste sintético RTMP → H.264 → HLS → HTTP;
11. somente após o autoteste, abre o receptor RTMP real;
12. cria túnel HTTPS opcional;
13. sincroniza status e URLs no Supabase;
14. copia o RTMP correto para a área de transferência;
15. abre o visualizador local e o console do operador;
16. monitora e reinicia os componentes enquanto a janela permanece aberta.

## Segurança e segredos

O piloto é exclusivamente estacionário. Remova todas as hélices, retire o protetor do gimbal antes de ligar, mantenha o equipamento em superfície firme e não acione os motores. A aplicação não pilota o drone nem envia comandos à aeronave.

O arquivo `evora-gateway.private.json` não deve ser versionado. A branch contém apenas `evora-gateway.example.json`.

## Validações realizadas

- sintaxe JavaScript aprovada;
- documentos HTML e seletores conferidos;
- balanceamento estático dos scripts PowerShell aprovado;
- ausência de padrões ambíguos de variável PowerShell validada;
- pipeline FFmpeg em modo servidor testado com publicação RTMP sintética;
- playlist e cinco segmentos HLS gerados;
- playlist entregue por HTTP 200;
- migração Supabase aplicada e RPCs testadas;
- acesso direto anônimo às tabelas bloqueado;
- Vercel em estado `READY`, com rotas principais respondendo 200;
- ZIP privado e pacote-fonte testados quanto à integridade;
- chave privada ausente do pacote público.

A etapa que exige o hardware permanece a prova física no Windows com o DJI Pilot 2, usando exatamente `/live`.
