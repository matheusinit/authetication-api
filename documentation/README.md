## Documentação

## Requisitos funcionais
 + Criar cadastro do usuário
 + Autenticar-se com credenciais
 + Recuperar senha
 + Enviar código de confirmação
 + Ativar conta
 + Editar informações do usuário (mudar email, mudar avatar)

## Requisitos não funcionais
 + Utilização do framework Express (Node.js).
 + Encriptação da senha para então ser armazenada no banco de dados.
 + Utilização do MongoDB como banco de dados.
 + A API pode ser utilizada em qualquer navegador ou cliente HTTP com leitura JSON.
 + Utilizar Arquitetura Limpa como modelo para arquitetura de software.

## Regras de negócio

 + Para o cadastro ser realizado, é necessário nome de usuário, email e senha e confirmação de senha.
 + O endereço de email deve ser válido.
 + O nome de usuário deve ser único, então deve ser um não registrado no sistema.
 + O email deve ser único, então deve ser um não registrado no sistema.
 + Ao cadastrar-se, o usuário precisa confirmar a senha. E as senhas devem ser iguais.
 + A senha deve ter pelo menos 8 caracteres, letras minúsculas e maiúsculas, números e pelo menos um caractere especial (sem ser < e >).
 + Ao cadastrar-se, a conta se mantém inativa até que seja ativada.
 + O email de confirmação tem validade de 24 horas.
 + Para confirmar o email, é preciso confirmar a senha.
 + Para se autenticar é necessário endereço de email e senha.
 + Para recuperar a senha, é necessário informar o email cadastrado da conta. Uma mensagem de email é enviada para restaurar a senha.
 + O email de restauração de senha tem validade de 48 horas.
 + Ao definir uma nova senha, a senha deve ser confirmada e devem ser iguais.
 + O login automático tem tempo de vida de 1 semana. Quando se autenticar, o tempo de vida é restaurado.
 + Para fazer a mudança do email, o email precisa ser confirmado em até 48 horas, senão será desconsiderado.
