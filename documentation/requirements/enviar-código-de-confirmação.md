## Registrar usuário

### Fluxo de sucesso

 - [ ] Necessita uma requisição do tipo **POST** na rota **/api/code/confirmation**
 - [ ] Valida dados obrigatórios **email**
 - [ ] Verifica se o **email** é um válido
 - [ ] É gerado um código de letras e números de 8 caracteres
 - [ ] Código é salvo no banco de dados
 - [ ] Enviar mensagem com o código para o email informado.
 - [ ] Retorna **HTTP status** como 200.
 - [ ] O campo **HTTP body** é retornado com a mensagem: **Email sent**

### Fluxo de exceções

 - [ ] Retorna **HTTP status** como 400 se o email não for fornecido
 - [ ] Retorna **HTTP status** como 400 se o email não for válido
 - [ ] Retorna **HTTP status** como 500 se o email não pôde ser enviado