## Registrar usuário

### Fluxo de sucesso

 - [x] Necessita uma requisição do tipo **POST** na rota **/api/code/confirmation**
 - [ ] Verifica se estar autenticado
 - [x] Valida dados obrigatórios **email**
 - [x] Verifica se o **email** é um válido
 - [x] É gerado um código de letras e números de 8 caracteres
 - [x] Código é salvo no banco de dados
 - [x] Enviar mensagem com o código para o email informado.
 - [x] Retorna **HTTP status** como 200.
 - [x] O campo **HTTP body** é retornado com a mensagem: **Email sent**

### Fluxo de exceções

 - [x] Retorna **HTTP status** como 400 se o email não for fornecido
 - [x] Retorna **HTTP status** como 400 se o email não for válido
 - [x] Retorna **HTTP status** como 500 se o email não pôde ser enviado
 - [x] Retorna **HTTP status** como 404 se o email não estiver registrado