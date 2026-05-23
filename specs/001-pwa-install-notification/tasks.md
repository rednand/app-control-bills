# Tasks: PWA Install Notification

**Input**: Design documents from `specs/001-pwa-install-notification/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Tests**: Não solicitados — feature de UI sem lógica de negócio testável unitariamente.

**Organization**: Tasks organizadas por user story (US1 + US2 = P1, US3 = P2).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tasks incompletas)
- **[Story]**: A qual user story esta task pertence (US1, US2, US3)
- Todos os caminhos de arquivo são relativos à raiz do repositório

---

## Phase 1: Setup (Ícones PWA)

**Purpose**: Criar os ícones PNG necessários para o Web App Manifest.

- [x] T001 Criar diretório `public/icons/` e gerar ícone PWA 192×192 em `public/icons/icon-192.png`
- [x] T002 [P] Gerar ícone PWA 512×512 em `public/icons/icon-512.png`

> **Nota de implementação**: Os ícones devem ter fundo escuro (#0a0a0a) e texto "CF" em branco. Podem ser gerados com script Node.js usando `sharp` (peer dep do Next.js) ou criados manualmente como PNG sólido.

---

## Phase 2: Foundational (Infraestrutura PWA)

**Purpose**: Infraestrutura mínima que habilita instalabilidade como PWA. DEVE estar completa antes de qualquer user story.

**⚠️ CRITICAL**: O evento `beforeinstallprompt` só dispara quando manifest + service worker estão corretamente configurados. Sem esta fase, o banner não funcionará.

- [x] T003 Criar `public/manifest.json` com name, short_name, icons (192 e 512), start_url, display standalone, theme_color e background_color
- [x] T004 [P] Criar `public/sw.js` com handlers mínimos de install, activate e fetch
- [x] T005 Criar `src/components/PwaInit.tsx` — componente client-side que registra o service worker via `navigator.serviceWorker.register('/sw.js')` no `useEffect`
- [x] T006 Atualizar `src/app/layout.tsx` — adicionar `manifest: '/manifest.json'` ao objeto `metadata` e incluir `<PwaInit />` dentro do `<body>`

**Checkpoint**: Após esta fase, o app é tecnicamente instalável como PWA. Verificar em DevTools > Application > Manifest que não há erros.

---

## Phase 3: US1 + US2 — Banner exibido + Instalação (Priority: P1) 🎯 MVP

**Goal**: Exibir o banner de instalação quando o navegador detectar que o app é instalável, e permitir que o usuário instale o app clicando em "Instalar".

**Independent Test**: Abrir o app em Chrome desktop ou Android. O banner deve aparecer automaticamente na parte inferior da tela. Clicar "Instalar" deve abrir o diálogo nativo do navegador. Após instalação, o banner deve desaparecer.

### Implementation for US1 + US2

- [x] T007 [US1] Criar `src/components/PwaInstallBanner.tsx` — escutar `beforeinstallprompt` e `appinstalled`, exibir banner com nome do app, botão de instalar (chama `deferredPrompt.prompt()`) e banner desaparece ao instalar
- [x] T008 [US2] Adicionar `<PwaInstallBanner />` ao `src/app/layout.tsx` dentro do `<body>`, após `<PwaInit />`

**Checkpoint**: Banner aparece em Chrome com PWA instalável. Clicar "Instalar" abre diálogo nativo. Após instalação, banner desaparece. App abre em modo standalone.

---

## Phase 4: US3 — Dispensar banner (Priority: P2)

**Goal**: Permitir que o usuário feche o banner sem instalar. Banner não reaparece na sessão após ser dispensado.

**Independent Test**: Com o banner visível, clicar no botão X. O banner deve desaparecer imediatamente e não reaparecer ao navegar pelo app na mesma sessão.

### Implementation for US3

- [x] T009 [US3] Adicionar estado `dismissed` e botão de fechar (X) ao `src/components/PwaInstallBanner.tsx` — clicar no botão define `dismissed = true`, o componente retorna `null` se `dismissed` for verdadeiro

**Checkpoint**: Clicar X fecha o banner. Navegar pelo app não o reabre. Recarregar a página pode reabrir (comportamento esperado — controlado pelo navegador).

---

## Phase 5: Polish & Validação

**Purpose**: Garantir qualidade de código e responsividade conforme Princípio VI da Constituição.

- [x] T010 Executar `npm run lint` e corrigir quaisquer erros encontrados
- [x] T011 [P] Executar `npx tsc --noEmit` e corrigir erros de tipo TypeScript
- [ ] T012 Validar layout em viewport mobile (≥375px): banner não deve causar overflow horizontal nem bloquear conteúdo principal
- [ ] T013 [P] Validar layout em desktop: banner posicionado na parte inferior, visível sem bloquear navegação

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente
- **Foundational (Phase 2)**: Depende de Phase 1 (T003 precisa de T001, T002)
- **US1 + US2 (Phase 3)**: Depende de Foundational (Phase 2) — BLOQUEADO até T006 concluir
- **US3 (Phase 4)**: Depende de Phase 3 (T007) — modifica o mesmo componente
- **Polish (Phase 5)**: Depende de todas as phases anteriores

### Parallel Opportunities

- T001 e T002 (ícones): em paralelo entre si
- T003 e T004 (manifest + SW): em paralelo entre si após T001/T002
- T010 e T011 (lint + tsc): em paralelo entre si
- T012 e T013 (validação mobile + desktop): em paralelo entre si

---

## Parallel Example: Phase 2 (Foundational)

```text
# Após T001 e T002 concluídos, iniciar em paralelo:
Task T003: "Criar public/manifest.json"
Task T004: "Criar public/sw.js"

# T005 pode iniciar imediatamente (não depende do manifest):
Task T005: "Criar src/components/PwaInit.tsx"
```

---

## Implementation Strategy

### MVP (US1 + US2)

1. Completar Phase 1: Ícones
2. Completar Phase 2: Infraestrutura PWA
3. Completar Phase 3: Banner + Instalação
4. **VALIDAR**: Banner aparece e fluxo de instalação funciona
5. Se MVP aprovado, prosseguir para US3 (dismiss)

### Incremental Delivery

1. Phase 1 + 2 → App é instalável (sem banner ainda)
2. Phase 3 → Banner aparece com botão instalar (MVP!)
3. Phase 4 → Usuário pode dispensar banner
4. Phase 5 → Código limpo e responsivo

---

## Notes

- T007 e T009 modificam o mesmo arquivo (`PwaInstallBanner.tsx`) — executar sequencialmente
- T006 e T008 modificam `layout.tsx` — executar sequencialmente
- Verificar `chrome://flags/#bypass-app-banner-engagement-checks` para forçar o banner durante desenvolvimento
- [P] = arquivos diferentes, sem dependências entre si
- Cada user story é testável independentemente após sua phase estar completa
