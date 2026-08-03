# Teste real do Mavic 3E sem cabo HDMI

## Objetivo

Validar a rota câmera do Mavic 3E → DJI Pilot 2 → RTMP por Wi‑Fi → MediaMTX → HLS por HTTPS → Safari do comprador.

## Segurança obrigatória

- acompanhamento de adulto responsável ou operador qualificado;
- teste exclusivamente estacionário;
- todas as hélices removidas;
- protetor do gimbal retirado antes de ligar;
- drone apoiado em superfície firme;
- nenhum comando de partida dos motores.

A plataforma não pilota o drone e não envia comandos à aeronave.

## 1. Gateway no notebook Windows

1. Extraia o kit privado.
2. Execute `INICIAR-GATEWAY.bat`.
3. Autorize rede privada no Firewall do Windows, se solicitado.
4. Aguarde a mensagem **GATEWAY PRONTO**.
5. O RTMP será copiado para a área de transferência.
6. O painel do operador e o módulo Pilot 2 serão abertos automaticamente.

Na primeira execução, o script baixa MediaMTX e cloudflared dos repositórios oficiais.

## 2. Controle DJI

1. Conecte o RC Pro Enterprise à mesma rede Wi‑Fi do notebook.
2. Ligue o conjunto apenas no modo estacionário e confirme a imagem no Pilot 2.
3. Valide a chave privada na página `/pilot2`.
4. Use uma das duas rotas:
   - **RTMP personalizada**, se o menu estiver disponível no seu Pilot 2;
   - **Cloud API / Open Platforms**, após cadastrar a aplicação e inserir App ID, App Key e App License.
5. Cole/configure o RTMP publicado pelo gateway.
6. Inicie a transmissão de vídeo, sem acionar os motores.

## 3. Operador

1. Abra `/operador`.
2. Cole a chave privada.
3. Confirme os estados **Gateway conectado** e **Pilot 2 pronto/transmitindo**.
4. Clique em **Carregar vídeo**.
5. Cadastre pelo menos três referências.
6. Compartilhe o link estável do comprador.

## 4. iPhone ou iPad

1. Abra `/comprador` no Safari.
2. Toque em **Iniciar conexão**.
3. Confirme vídeo, etiquetas e telemetria.
4. Mantenha a sessão por dez minutos.

## Aprovação

- imagem real recebida no Safari;
- três referências sincronizadas;
- atraso comercialmente aceitável;
- estabilidade por dez minutos;
- reconexão após atualizar a página;
- alteração automática do status quando o RTMP começa e termina.

## Limites do piloto

O Quick Tunnel é temporário e não oferece SLA. A versão comercial deverá usar domínio permanente e gateway de mídia gerenciado. A integração automática dentro do Pilot 2 depende das credenciais oficiais da DJI.
