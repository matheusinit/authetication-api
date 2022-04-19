<h2 align="center">Authenticação API</h2>

<p align="center">API Rest de autenticação de usuários desenvolvida em Node.js para aplicar conceitos de TDD e SOLID.</p>

## Status

<h4 align="center">
  :construction: Em desenvolvimento... :construction:
</h4>

## Features
 - [x] Cadastro do usuário
 - [x] Autenticação
 - [ ] Recuperação de senha
 - [x] Enviar código de confirmação
 - [x] Ativar conta
 - [ ] Editar informações do usuário

Para mais detalhes de requisitos e regras de negócio, veja a [documentação](documentation/README.md).

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

## Como rodar

### Pré-requisitos

Antes de tudo, vai precisar ter instalado em sua máquina as ferramentas: 
 + [Git](https://git-scm.com)
 + [Node.js](https://nodejs.org/en/download/) (versão 12 de preferência)
 + [MongoDB](https://www.mongodb.com/)

Recomendado utilização de Docker:
 + [Docker](https://www.docker.com/)
 + [Docker-compose](https://www.docker.com/).

Para instalação do Docker: https://docs.docker.com/get-docker/

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

