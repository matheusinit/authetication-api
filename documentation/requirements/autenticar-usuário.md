## Autenticar usuário

### Fluxo de sucesso

 - [x] Necessita uma requisição **POST** na rota **/api/login**
 - [x] Valida dados obrigatórios **email** e **password**
 - [x] Gera um token de acesso
 - [x] O campo **HTTP body** é retornado com os dados do usuário: **token**

### Fluxo de exceções

 - [x] Retorna **HTTP status** como 400 se um dos campos **email** ou **password** não for fornecido
 - [x] Retorna **HTTP status** como 400 se não existir uma conta com o email fornecido
 - [x] Retorna **HTTP status** como 400 se a senha não conferir
 - [x] Retorna **HTTP status** como 500 caso ocorra um erro interno.