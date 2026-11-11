# Lente — CRM para Fotógrafos

Sistema de gestão de shoots, clientes, finanças e faturamento voltado para fotógrafos autônomos e estúdios pequenos. Construído com Next.js, Firebase (Auth + Firestore) e Tailwind CSS.

> ⚠️ **Este projeto utiliza apenas o plano gratuito (Spark) do Firebase.** Não há Firebase Storage para fotos — imagens de perfil e avatares são armazenadas como URLs externas (base64/data URL ou links hospedados fora do Firebase).

---

## 🚀 Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/) (modo estrito)
- [Firebase Auth](https://firebase.google.com/docs/auth) + [Firestore](https://firebase.google.com/docs/firestore) (SDK v13)
- [date-fns](https://date-fns.org/) (datas)
- [lucide-react](https://lucide.dev/) (ícones)
- [jspdf](https://github.com/MrRio/jsPDF) (PDF de faturas)

---

## 🔐 Configuração inicial

O projeto usa **`.env.local`** diretamente (não há `.env.example`). Crie o arquivo na raiz com as chaves reais do seu projeto Firebase (`f-stop-ef56b`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Não commite o `.env.local`. Ele contém credenciais sensíveis.

---

## 📦 Instalação e execução

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start

# Verificação de tipos
npx tsc --noEmit
```

O app estará disponível em `http://localhost:3000`.

---

## 📱 Funcionalidades

| Módulo | O que faz |
|--------|-----------|
| **Dashboard (Hoje)** | Lista os shoots agendados para hoje com carrossel horizontal e cards de resumo |
| **Arquivo** | Grid de todos os shoots passados com filtros |
| **Clientes** | Cadastro, listagem, edição e exclusão de clientes com totais derivados dos shoots |
| **Calendário** | Visualização de shoots por dia com sheet de detalhes |
| **Insights** | Faturamento bruto, líquido e despesas (única fonte de verdade: `shoots.amount`) |
| **Configurações** | Idioma, tema, perfil do usuário, backup/restauração de dados |
| **Painel do shoot** | Detalhes do cliente, status (contrato, questionário, entrada, saldo, galeria, fatura) |
| **Faturas** | Itens editáveis, subtotal/imposto/total, status pendente/parcial/paga, exportação PDF |
| **Tour de boas-vindas** | 6 passos interativos para primeiro login (não se repete) |
| **Online/offline** | Sincronização automática de operações enfileiradas quando volta a conexão |

---

## 💰 Fonte única de verdade financeira

Os campos `client.totalSpent` e `client.totalShoots` foram removidos. Todos os totais financeiros são **derivados dos shoots** (`shoots.amount` onde `status === "paid" || status === "delivered"`). Isso evita inconsistências entre dados do cliente e dados dos shoots.

---

## 🔄 Backup e restauração

Disponível em **Configurações**:
- **Exportar**: baixa um JSON versionado com todos os seus dados (shoots, clientes, despesas, perfil, configurações, ocultar valores financeiros)
- **Restaurar**: envia um arquivo JSON e grava tudo no Firestore pelo seu UID

---

## 🧱 Regras de dados (Firestore)

Multi-usuário por UID. Todos os dados ficam em `users/{uid}/`:

| Coleção | Caminho | Segmentos |
|---------|---------|-----------|
| Perfil do usuário | `users/{uid}` | 2 (documento) |
| Configurações | `settings/{uid}` | 2 (documento) |
| Shoot | `users/{uid}/shoots/{id}` | 4 (documento) |
| Cliente | `users/{uid}/clients/{id}` | 4 (documento) |
| Despesa | `users/{uid}/expenses/{id}` | 4 (documento) |

Referências de coleção usam número ímpar de segmentos (ex: `users/{uid}/shoots` = 3). Referências de documento usam número par (ex: `users/{uid}/shoots/{id}` = 4).

---

## 🛠️ Estrutura de pastas (principais)

```
src/
  app/              # App Router (page.tsx principal)
  components/       # Componentes de UI e de negócio
  components/ui/    # Primitivos shadcn/base-ui
  context/          # AuthProvider
  lib/
    firebase.ts     # Inicialização do Firebase (browser only)
    firestore.ts    # CRUD e subscriptions no Firestore
    sync-queue.ts   # Fila de operações off-line
    backup-restore.ts
    i18n.ts         # Dicionário pt/en
    constants.ts    # Tipos, defaults, labels
    storage.ts      # useLocalStorage (apenas HAS_SEEN_ONBOARDING_KEY)
    utils.ts        # Helpers (generateId, getStatusColor, formatCurrency...)
```

---

## 🧑‍💻 Contribuição

Este é um projeto pessoal em desenvolvimento ativo. Sinta-se à vontade para abrir issues ou enviar PRs.

---

## 📄 Licença

Uso livre. Desenvolvido com Firebase gratuito — sem custos de infraestrutura.