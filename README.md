# 🌟 Asterism Server

Uma API para gerenciamento de favoritos (bookmark manager) construída com **Node.js**, **TypeScript**, **Fastify** e **Prisma**. Permite que usuários organizem e categorizem seus links favoritos da internet com sistema de tags.

## 📚 Sobre o Projeto

Asterism é uma API REST que tem:

- ✅ **Autenticação JWT**

- ✅ **CRUD** de favoritos

- ✅ **Sistema de tags**

- ✅ **Categorização** por tipos (Sites, Tutoriais, Artigos, etc.)

- ✅ **Busca e filtros** avançados

- ✅ **Paginação**

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture**:

```

src/

├── use-cases/ # Regras de negócio

├── repositories/ # Contratos de acesso a dados

├── http/ # Controllers e rotas HTTP

├── factories/ # Injeção de dependências

├── lib/ # Configurações externas

└── utils/ # Utilitários

```

## 🚀 Tecnologias

- **Runtime** | Node.js 18+ | Ambiente de execução |
- **Language** | TypeScript | Tipagem estática |
- **Framework** | Fastify | API REST de alta performance |
- **Database** | PostgreSQL | Banco de dados relacional |
- **ORM** | Prisma | Mapeamento objeto-relacional |
- **Auth** | JWT | Autenticação segura |
- **Testing** | Vitest | Testes unitários e E2E |
- **Validation** | Zod | Validação de schemas |\*

## 🔧 Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm/yarn

### Variáveis de Ambiente

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/asterism"
JWT_SECRET="your-super-secret-key"
```

### Instalação

```bash

# Clone o repositório

git clone https://github.com/lucas-adb/asterism-server.git

cd asterism-server

# Instale as dependências

npm install

# Suba um docker

docker compose up -d

# Configure o banco de dados

npx prisma migrate dev

# Inicie o servidor de desenvolvimento

npm run dev

```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e
```

## 🚀 Deploy

### Scripts Disponíveis

```bash

npm run build # Build para produção

npm start # Iniciar servidor de produção

npm run dev # Desenvolvimento com hot reload

```

## 📈 Próximos Passos

- [ ] Crud de Tags

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

**Desenvolvido por [Lucas Alves](https://github.com/lucas-adb)**
