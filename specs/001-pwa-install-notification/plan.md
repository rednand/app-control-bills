# Implementation Plan: PWA Install Notification

**Branch**: `007-pwa-install-notification` | **Date**: 2026-05-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-pwa-install-notification/spec.md`

## Summary

Adicionar suporte a instalação como PWA ao app "Controle de Faturas". A feature inclui infraestrutura mínima de PWA (Web App Manifest + Service Worker mínimo), um banner de instalação exibido automaticamente quando o navegador detecta que o app é instalável, e o fluxo de instalação via API nativa do navegador (`beforeinstallprompt`). Sem mudanças no banco de dados, API, ou lógica de negócio.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)

**Primary Dependencies**: Next.js 15 App Router, React 19, Tailwind CSS 4, Lucide React

**Storage**: N/A

**Testing**: N/A (componente UI sem lógica de negócio testável unitariamente)

**Target Platform**: Navegadores Chromium (Chrome 67+, Edge 79+, Samsung Internet 8+) em Android e desktop. Safari/iOS fora de escopo.

**Project Type**: Web application — Next.js App Router

**Performance Goals**: Banner visível em menos de 2 segundos após o evento `beforeinstallprompt`.

**Constraints**: Service Worker deve estar em `/sw.js` (raiz do domínio) para ter escopo global. Sem dependências externas adicionais.

**Scale/Scope**: 2 novos componentes, 3 novos arquivos estáticos, 1 arquivo modificado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Calculation Integrity | Sem mudanças em cálculos financeiros — não aplicável. | ✅ N/A |
| II. Optimistic UI | Sem writes ao banco de dados — não aplicável. | ✅ N/A |
| III. Single-User Simplicity | Não introduz routing, multi-tenancy ou auth flows. | ✅ Pass |
| IV. Data Integrity | Sem novas collections ou writes — não aplicável. | ✅ N/A |
| V. No Dead Code | Apenas 2 novos componentes focados; nenhum código existente duplicado. | ✅ Pass |
| VI. Responsividade | Banner usa classes Tailwind responsivas. Validar em ≥375px. | ✅ Pass (validar na implementação) |

## Project Structure

### Documentation (this feature)

```text
specs/001-pwa-install-notification/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas (Phase 0)
├── spec.md              # Especificação da feature
└── checklists/
    └── requirements.md  # Checklist de qualidade da spec
```

### Source Code (repository root)

```text
public/
├── manifest.json                  # CRIAR — Web App Manifest
├── sw.js                          # CRIAR — Service Worker mínimo
└── icons/
    ├── icon-192.png               # CRIAR — Ícone PWA 192×192
    └── icon-512.png               # CRIAR — Ícone PWA 512×512

src/
└── components/
    ├── PwaInstallBanner.tsx       # CRIAR — Banner de instalação
    └── PwaInit.tsx                # CRIAR — Registro do service worker

src/app/
└── layout.tsx                     # MODIFICAR — manifest metadata + novos componentes
```

**Structure Decision**: Single-page Next.js App Router. Artefatos estáticos em `public/`, componentes em `src/components/`, modificação mínima ao layout raiz.

## Implementation Steps

### Step 1 — Web App Manifest (`public/manifest.json`)

```json
{
  "name": "Controle de Faturas",
  "short_name": "Faturas",
  "description": "Controle pessoal de faturas e despesas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### Step 2 — Service Worker (`public/sw.js`)

Service Worker mínimo para habilitar instalabilidade:

```js
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
```

### Step 3 — Ícones PWA (`public/icons/`)

Gerar ícones simples 192×192 e 512×512 em PNG com fundo escuro (#0a0a0a) e texto "CF" em branco, usando a API Canvas via script Node.js ou substituindo com ícone existente.

### Step 4 — PwaInit component (`src/components/PwaInit.tsx`)

```tsx
"use client"
import { useEffect } from "react"

export default function PwaInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }
  }, [])
  return null
}
```

### Step 5 — PwaInstallBanner component (`src/components/PwaInstallBanner.tsx`)

Baseado na referência do usuário, adaptado:
- Nome do app: "Controle de Faturas"
- Ícone: imagem do manifest ou substituir por ícone Lucide
- Responsividade: `pb-20 md:pb-4` para respeitar nav mobile

### Step 6 — Modificar layout.tsx

- Adicionar `manifest: "/manifest.json"` ao objeto `metadata`
- Incluir `<PwaInit />` e `<PwaInstallBanner />` dentro do `<body>`

## Validation Checklist

- [ ] Banner aparece automaticamente em Chrome desktop/Android
- [ ] Clicar "Instalar" abre diálogo nativo do navegador
- [ ] Após instalação, banner desaparece automaticamente
- [ ] Clicar X fecha o banner
- [ ] App instalado abre em modo `standalone`
- [ ] `npm run lint` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Layout correto em viewport ≥375px (mobile)
- [ ] Layout correto em desktop
