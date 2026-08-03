# Évora Mavic 3E Pilot v4

Reconstrução integral do piloto estacionário para transmitir a câmera do DJI Mavic 3E ao navegador do comprador sem cabo HDMI.

## Mudança central da v4

As versões anteriores usavam MediaMTX como receptor RTMP. Nos testes reais, o DJI Pilot 2 concluía a conexão TCP, mas permanecia em estado RTMP `idle`, sem publicar o caminho. A v4 remove esse ponto de ambiguidade e usa o FFmpeg em modo servidor (`-listen 1`) diretamente no endereço único:

```text
rtmp://IP_DO_NOTEBOOK:1935/live
```

O FFmpeg recebe o RTMP, normaliza o vídeo em H.264 e produz HLS para o navegador.

## Fluxo

```text
Mavic 3E parado e sem hélices
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

## Arquivos principais

- `gateway/INICIAR-TUDO.bat` — operação completa;
- `gateway/DIAGNOSTICO-COMPLETO.bat` — validação sem iniciar a operação real;
- `gateway/PARAR-TUDO.bat` — encerramento limpo;
- `gateway/scripts/RTMP-LISTENER.ps1` — receptor FFmpeg e geração HLS;
- `gateway/scripts/HTTP-SERVER.ps1` — servidor local do player e segmentos;
- `app/` — portal do operador, comprador e diagnóstico;
- `supabase/migration.sql` — backend isolado da v4 com RLS e RPCs autenticadas por token.

## Segurança

O piloto é exclusivamente estacionário. Remova todas as hélices, retire o protetor do gimbal antes de ligar, mantenha o equipamento em superfície firme e não acione os motores. A aplicação não pilota o drone nem envia comandos à aeronave.

O arquivo `evora-gateway.private.json` não deve ser versionado. O repositório contém somente `evora-gateway.example.json`.

## Validações realizadas

- sintaxe JavaScript aprovada;
- parsing dos documentos HTML aprovado;
- balanceamento estático dos scripts PowerShell aprovado;
- ausência de padrões ambíguos de variável PowerShell validada;
- pipeline FFmpeg em modo servidor testado com publicação RTMP sintética e geração real de playlist e segmentos HLS;
- migração Supabase aplicada e RPCs testadas;
- acesso direto anônimo às tabelas bloqueado;
- ZIP privado e ZIP público testados quanto à integridade;
- segredo privado ausente do pacote público.

A etapa que exige o hardware permanece a prova física no Windows com o DJI Pilot 2, usando exatamente `/live`.
