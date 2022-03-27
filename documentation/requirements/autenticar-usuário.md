## Autenticar usuário

### Fluxo de sucesso

 - [ ] Necessita uma requisição **POST** na rota **/api/login**
 - [ ] Valida dados obrigatórios **email** e **password**
 - [ ] Gera um token de acesso
 - [ ] O campo **HTTP body** é retornado com os dados do usuário: **token**

### Fluxo de exceções

 - [ ] Retorna **HTTP status** como 400 se um dos campos **email** ou **password** não for fornecido
 - [ ] Retorna **HTTP status** como 400 se não existir uma conta com o email fornecido
 - [ ] Retorna **HTTP status** como 400 se a senha não conferir
 - [ ] Retorna **HTTP status** como 400 se a conta estiver inativa.
 - [ ] Retorna **HTTP status** como 500 caso ocorra um erro interno.