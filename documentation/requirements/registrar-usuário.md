## Registrar usuário

### Fluxo de sucesso

 - [x] Necessita uma requisição do tipo **POST** na rota **/api/signup**
 - [x] Valida dados obrigatórios **username**, **email**, **password**, **passwordConfirmation**
 - [x] Verifica se o **username** é um disponível
 - [x] Verifica se existe uma conta existente com o **email** fornecido
 - [x] Valida se **password** e **passwordConfirmation** são iguais
 - [x] Valida se a senha corresponde as restrições.
 - [x] O campo **password** é criptografado
 - [ ] O campo **status** é definido como **inactive**
 - [x] Os **username**, **email**, **hashedPassword** é armazenado no banco de dados
 - [x] O **HTTP status** da resposta é definido como 200
 - [x] O campo **HTTP body** é retornado com os dados do usuário: **id**, **username**, **email** e **hashedPassword**

### Fluxo de exceções

 - [x] Retorna **HTTP status** como 400 se um dos campos não for fornecido pelo cliente
 - [x] Retorna **HTTP status** como 400 se **password** e **passwordConfirmation** forem diferentes
 - [x] Retorna **HTTP status** como 400 caso **username** esteja não disponível
 - [x] Retorna **HTTP status** como 400 caso **email** seja não válido
 - [x] Retorna **HTTP status** como 400 caso **email** não esteja disponível
 - [x] Retorna **HTTP status** como 400 caso **password** não cumpra com as restrições de senha
 - [x] Retorna **HTTP status** como 500 caso a criptografia resulte em erro 
 - [x] Retorna **HTTP status** como 500 caso ao armazenar os dados no banco de dados resulte em erro