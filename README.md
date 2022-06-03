<h2 align="center">Authenticação API</h2>

<p align="center">API Rest de autenticação de usuários desenvolvida em Node.js para aplicar conceitos de Test Driven Development (TDD) e SOLID. E aplicar os conceitos de autenticação utilizando tokens e praticar com algumas tecnologias, como: <b>MongoDB</b>, <b>Docker</b>, <b>Nodemailer</b>, <b>Swagger</b></p>

## Status

<h4 align="center">
  :heavy_check_mark: Concluído :heavy_check_mark:
</h4>

## Features
 - [x] Cadastro do usuário
 - [x] Autenticação
 - [x] Enviar email de redefinição da senha 
 - [x] Recuperação de senha
 - [x] Enviar código de confirmação
 - [x] Ativar conta

Para mais detalhes de requisitos e regras de negócio, veja a [documentação](documentation/README.md).
Toda nova feature deve ser utilizada com Pull Requests

## Tecnologias
 + Node.js - v12.22.10
 + Typescript (Tipagem para Javascript)
 + Express
 + MongoDB
 + jsonwebtokens
 + Jest (Teste automatizados)
 + Docker
 + lint-staged
 + husky
 + Eslint
 + validator
 + fast-glob
 + Nodemailer
 + Handlebars Template
 + Swagger

## Documentação

Ao executar a aplicação, é possível visualizar a documentação das rotas em **localhost:3000/api-docs**.

## Como rodar

### Pré-requisitos

Antes de tudo, vai precisar ter instalado em sua máquina as ferramentas: 
 + [Git](https://git-scm.com)
 + [Node.js](https://nodejs.org/en/download/) (versão 12 de preferência)
 + [MongoDB](https://www.mongodb.com/)

Recomendado utilização de Docker:
 + [Docker](https://www.docker.com/)
 + [Docker-compose](https://www.docker.com/)

Para instalação do Docker: https://docs.docker.com/get-docker/

### Configurar ambiente

```env

# Jwt
SECRET = secret to use in jwt
EXPIRES_IN = 1d # example

# MongoDB

MONGO_URL = mongodb://username:password@localhost:27017/?authMechanism=DEFAULT # example

MONGO_USER = username # example
MONGO_PASS = password # example

# Mail Service

SMTP_HOST =
SMTP_PORT =
SMTP_USER =
SMTP_PASS =

```

+ Para gerar *SECRET* para JsonWebToken:
  + Pega uma chave em [Random Keygen](https://randomkeygen.com/)
  + Coloque em *SECRET*

+ *EXPIRES_IN* é o tempo em que o token JWT se expira
  + 10h para 10 horas
  + 20d para 20 dias
  + 60s para 60 segundos

+ *MONGO_URL* é a URI do MongoDB
  + Utilize os paramêtros usado em *MONGO_USER* e *MONGO_PASS*

+ *MONG0_USER* é nome do administrador do banco de dados
+ *MONGO_PASS* é a senha do administrador do banco de dados

+ *SMTP* é sobre o serviço de email
  + Para desenvolvimento, eu recomendo utilizar [Ethereal](https://ethereal.email/)

### Gerenciamento de containers 

+ Para construir os containers:

```bash
npm run up
```

+ Para destruir os containers

```bash
npm run down
```

*Obs.: A utilização de containers é opcional, mas recomendado*

### Utilização sem containers

+ Para executar a aplicação sem os containers, configure o ambiente de desenvolvimento (arquivo *.env*) com o seu MongoDB. E prossiga seguindo a documentação.

### Rodando API (passa-a-passo)

+ Clone o repositório

```bash
git clone https://github.com/matheusinit/authetication-api.git
```

+ Acesse a pasta do projeto
```bash
cd authentication-api
```

+ Instale as dependências
```bash
npm install
```

+ Execute a aplicação em desenvolvimento
```bash
npm run dev
```
**O servidor estará rodando por padrão em http://localhost:3000**

### Executar testes

+ Executar testes unitários
```bash
npm run test:unit
```

+ Executar testes de integração
```bash
npm run test:integration
```

+ Executar todos os testes
```bash
npm run test
```

## Autor

<img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/68296035?v=4" width="100px" />

Feito com :heart: por Matheus Oliveira

[![Linkedin Badge](https://img.shields.io/badge/-Matheus-blue?style=for-the-badge&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/matheus-silva13/)](https://www.linkedin.com/in/matheus-silva13/) 

