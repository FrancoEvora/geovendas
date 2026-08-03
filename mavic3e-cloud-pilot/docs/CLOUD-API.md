# Integração DJI Cloud API

## Página H5

A rota `/pilot2` foi preparada para ser cadastrada como página da plataforma de terceiros no DJI Pilot 2.

## Fluxo implementado

1. validar a sala segura Évora;
2. obter RTMP e HLS publicados pelo gateway;
3. verificar App ID, App Key e App License;
4. definir workspace UUID;
5. definir informações da plataforma;
6. carregar o componente `liveshare` em modo manual;
7. configurar RTMP;
8. iniciar/parar e consultar o status;
9. refletir o estado no Supabase e na página do comprador.

## Credenciais

As credenciais DJI são digitadas pelo operador e permanecem somente em memória. Quando a opção “guardar nesta sessão” é marcada, são mantidas em `sessionStorage` até o fechamento da sessão. Elas não são enviadas ao Supabase e não fazem parte do código-fonte.

## Dependência externa

Para habilitar esse fluxo dentro do controle, é necessário criar uma aplicação Cloud API no portal de desenvolvedores DJI e cadastrar a URL de produção da rota `/pilot2`.
