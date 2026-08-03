# Roteiro do teste real em solo — Mavic 3E

## Antes de começar

O teste é estacionário e deve ser realizado com supervisão de um adulto responsável ou operador qualificado. Não decole e não acione os motores.

## Equipamentos

1. DJI Mavic 3E e DJI RC Pro Enterprise.
2. Cabo Mini-HDMI para HDMI.
3. Placa de captura HDMI/USB compatível com UVC.
4. Notebook com Chrome ou Edge.
5. iPhone ou iPad com Safari.
6. Mesma rede Wi-Fi ou hotspot para notebook e iPhone.

## Preparação física

1. Desligue o drone e remova todas as hélices.
2. Retire o protetor do gimbal antes de ligar.
3. Apoie o Mavic em superfície firme, seca e ventilada.
4. Conecte a saída Mini-HDMI do controle à entrada HDMI da placa de captura.
5. Conecte a placa de captura ao notebook.
6. Ligue o controle e o Mavic apenas para receber a imagem; não execute comando de partida dos motores.
7. Confirme no DJI Pilot 2 que a imagem da câmera está normal.
8. Coloque notebook e iPhone na mesma rede, sem VPN.

## Diagnóstico no notebook

Abra `https://evora-mavic3e-live-pilot.vercel.app/diagnostico?room=<token>`.

1. Clique em **Executar novamente**.
2. Autorize o acesso do navegador à câmera.
3. Verifique HTTPS, MediaDevices, WebRTC e Supabase.
4. Localize a entrada “HDMI Capture”, “USB Video”, “UVC” ou equivalente.

## Painel do operador

Abra `https://evora-mavic3e-live-pilot.vercel.app/operador?room=<token>`.

1. Cole a chave privada entregue separadamente.
2. Clique em **Validar**.
3. Marque os itens de segurança.
4. Clique em **Detectar** e escolha a placa de captura.
5. Clique em **Abrir HDMI**.
6. Confirme que a imagem real do controle aparece no notebook.
7. Clique em **Iniciar transmissão**.

## iPhone ou iPad do comprador

Abra no Safari `https://evora-mavic3e-live-pilot.vercel.app/comprador?room=<token>`.

1. Toque em **Iniciar conexão**.
2. Aguarde o indicador **AO VIVO**.
3. Mantenha o Safari aberto durante o teste.

## Marcação de referências

1. No notebook, clique em **Marcar ponto**.
2. Toque sobre mesa, porta, cafeteira, árvore ou outra referência.
3. Informe o nome.
4. Confirme que a etiqueta aparece no iPhone.
5. Mantenha o drone imóvel; mova apenas o gimbal lentamente, sem acionar os motores.

## Critérios de aprovação

- imagem real do Mavic recebida no notebook pela captura HDMI/USB;
- vídeo exibido no iPhone;
- pelo menos três referências visíveis nos dois dispositivos;
- conexão estável por dez minutos na mesma rede;
- atraso aceitável para apresentação comercial.

## Diagnóstico rápido

- **Tela preta:** confirme a entrada selecionada, o Mini-HDMI e a compatibilidade do sinal.
- **Captura não aparece:** troque a porta USB e feche outros programas que usem a placa.
- **iPhone não conecta:** desative VPN e verifique se o roteador não isola clientes.
- **Acesso fora da mesma rede falha:** será necessário TURN ou gateway de mídia persistente.
- **Atraso excessivo:** reduza a captura para 1080p30 e evite rede congestionada.
