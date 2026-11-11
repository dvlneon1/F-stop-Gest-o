# README para o Claude (desenvolvedor)

Este arquivo é um guia interno para o Claude Code continuar o desenvolvimento do projeto **Lente** após resets de sessão ou contexto. Não é para usuários finais — use o `README.md` para isso.

---

## 📍 Estado atual (2026-11-11)

### ✅ Funcionalidades entregas e verificadas
- Firestore backend completo substituindo localStorage (`src/lib/firestore.ts`)
- Multi-usuário por UID com caminhos válidos (ípar = coleção, par = documento)
- Offline sync queue (`src/lib/sync-queue.ts`) com banners online/offline/syncing
- Backup/restore versionado via JSON no Firestore (`src/lib/backup-restore.ts`)
- Geração de faturas com PDF (jspdf) (`src/components/InvoiceModal.tsx`)
- Welcome tour de 6 passos (`src/components/WelcomeTour.tsx`)
- Design system glassmorphism (bordas `border-border/60`, fundos `bg-card/90`, `backdrop-blur-md`)
- i18n pt/en completo
- `next build` aprovado, `tsc --noEmit` limpo

### ⚠️ Shell bloqueado
O classificador de segurança (`claude-sonnet-5`) está com timeout. Comandos `Bash` e `PowerShell` (`npx tsc`, `npx next build`, `npx impeccable detect`, `git commit`) **não executam**. Leitura/edição de arquivos (Read/Edit/Write/Grep/Glob) funciona normalmente.

---

## 🐛 Bugs reportados pelo usuário (não corrigidos)

Documentado em `memory/bugs-reportados-sessao-atual.md`.

| # | Bug | Causa provável | Arquivo |
|---|-----|----------------|---------|
| 1 | Nova conta vem com dados preenchidos (shoots, clients defaults) | Seeding automático no `useEffect` quando `data.length === 0 && !hasSeeded.current` | `src/app/page.tsx:197-216` |
| 2 | Dados pessoais não salvam (ProfileEditModal) | Wrapper `setUserProfile` depende de `userProfile`/`authFirebaseUser`/`isOnline` capturados no `useCallback`; pode falhar silenciosamente | `src/app/page.tsx:413-429` |
| 3 | Clientes excluídos reaparecem | Mesmo seeding do item 1 re-executando após exclusão | `src/app/page.tsx:198-202` |
| 4 | Botões "+ criar primeiro shoot" / "+ adicionar cliente" quebram linha | Texto longo no container do botão (CSS whitespace/max-w) | `EmptyState` / `ClientsView` |
| 5 | NewShootModal não salva, não fecha modal, não dá toast | `handleNewShoot` chama `setShoots` (wrapper Firestore); se `authFirebaseUser` null ou `isOnline` incorreto, falha silenciosamente | `src/app/page.tsx:507-533` |
| 6 | Mesmo problema em ClientModal, ContractModal, QuestionnaireModal, GalleryModal, InvoiceModal, ExpensesModal | Mesmo padrão dos wrappers `setClients`/`setShoots`/`setExpenses` etc. | `src/app/page.tsx:535-598` |

---

## 🏗️ Arquitetura e decisões técnicas

### Caminhos Firestore (validados)
- Coleção: `users/{uid}/{colecao}` → 3 segmentos (ímpar ✓)
- Documento: `users/{uid}/{colecao}/{id}` → 4 segmentos (par ✓)
- Perfil: `users/{uid}` → 2 segmentos (documento ✓)
- Configurações: `settings/{uid}` → 2 segmentos (documento ✓)

### SSR constraints
- Todo código que usa `window`, `navigator`, `new Date()` deve ter guarda `typeof window !== "undefined"` ou rodar dentro de `useEffect`
- `useAuth()` não pode ser chamado dentro do componente que também renderiza `<AuthProvider>` (ver `LenteApp` → `AppContent`)

### Pattern de wrappers Firestore
Os wrappers `setShoots`, `setClients`, `setExpenses`, `setSettings`, `setUserProfile`, `setHideFinancialValues` fazem:
1. Atualiza estado local
2. Se online → grava no Firestore
3. Se offline → enqueue no sync-queue (`localStorage`)

---

## 📁 Arquivos principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/page.tsx` | Componente raiz `LenteApp` + `AppContent` com todo o estado e handlers |
| `src/lib/firestore.ts` | CRUD e subscriptions no Firestore |
| `src/lib/sync-queue.ts` | Fila off-line por usuário |
| `src/lib/backup-restore.ts` | Export/import JSON versionado |
| `src/lib/constants.ts` | Tipos (Shoot, Client, Expense, InvoiceData), defaults, labels |
| `src/lib/i18n.ts` | Dicionário pt/en |
| `src/lib/firebase.ts` | Inicialização Firebase (browser only) |
| `src/components/NewShootModal.tsx` | Formulário de criação/edição de shoot |
| `src/components/ClientsView.tsx` | Listagem de clientes |
| `src/components/Panel.tsx` | Painel de detalhes do shoot |
| `src/components/InvoiceModal.tsx` | Fatura com itens, PDF, status |
| `src/components/SettingsView.tsx` | Configurações, backup, restore |
| `src/components/ProfileEditModal.tsx` | Edição de perfil do usuário |
| `src/components/WelcomeTour.tsx` | Tour de boas-vindas (6 passos) |

---

## 🧪 Comandos úteis (quando o shell estiver disponível)

```bash
cd C:\documents\project_f_v3

# Verificar tipos
npx tsc --noEmit

# Build de produção
npx next build

# Qualidade (Impeccable)
npx impeccable detect

# Rodar dev
npm run dev

# Git
git status
git add <arquivos>
git commit -m "mensagem"
```

---

## 🧠 Memória persistente

Arquivos em `C:\Users\uzuma\.claude\projects\C--documents-project-f-v3\memory\`:

- `MEMORY.md` — índice de todas as memórias
- `firestore-integration-complete.md` — integração Firestore
- `offline-sync-queue.md` — fila off-line
- `backup-restore-complete.md` — backup/restore
- `invoice-generation-complete.md` — faturas
- `firestore-path-fix.md` — correção de caminhos
- `bugs-reportados-sessao-atual.md` — bugs atuais (este ciclo)
- Muitos outros (UI/UX, tipos, modais, panel, etc.)

---

## 🚀 Próximos passos sugeridos (P3 / P4)

1. Corrigir os 6 bugs reportados (começar pelo seeding e wrappers Firestore)
2. Definir escopo de P3 e P4 com o usuário
3. Verificar `npx tsc --noEmit`, `npx next build`, `npx impeccable detect` após cada correção
4. Commitar alterações pendentes (`page.tsx`, `ClientsView.tsx`, `.impeccable/hook.cache.json`)

---

## ⚠️ Limitações do projeto

- **Sem Firebase Storage** (plano gratuito, sem orçamento) — fotos de perfil usam data URLs ou links externos
- **Autenticação**: email/senha + Google popup apenas
- **SimulateSync** foi removido/substituído por status online/offline real
- `.env.local` é usado diretamente (não há `.env.example` no repositório)

---

## 📝 Convenções de commit

```
feat: <descricao>
fix: <descricao>
```

Terminar mensagens com:
```
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

PRs devem terminar com:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```