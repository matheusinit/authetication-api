## Autenticar usuário

### Fluxo de sucesso

 - [ ] Necessita uma requisição **POST** na rota **/api/login**
 - [ ] Valida dados obrigatórios **email** e **password**
 - [ ] Gera um token de acesso
 - [ ] O campo **HTTP body** é retornado com os dados do usuário: **token**, **id**, **email**, **password**

### Fluxo de exceções

 - [ ] Retorna **HTTP status** como 400 se um dos campos **email** ou **password** não for fornecido
 - [ ] Retorna **HTTP status** como 404 se a conta não for encontrada.
 - [ ] Retorna **HTTP status** como 400 se a conta estiver inativa.
 - [ ] Retorna **HTTP status** como 500 caso ocorra um erro interno.