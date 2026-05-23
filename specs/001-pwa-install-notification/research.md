# Research: PWA Install Notification

**Branch**: `007-pwa-install-notification` | **Date**: 2026-05-23

## Decision 1: Abordagem de Service Worker

**Decision**: Service Worker manual mínimo (`public/sw.js`) sem biblioteca externa (não usar `next-pwa`).

**Rationale**: O evento `beforeinstallprompt` só é disparado pelo navegador quando o app satisfaz os critérios de instalabilidade:
1. Servido via HTTPS (ou localhost)
2. Tem um Web App Manifest válido com `name`, `short_name`, `icons`, `start_url`, `display`
3. Tem um Service Worker registrado

`next-pwa` é a solução mais robusta, mas adiciona complexidade de configuração e bundles maiores. Para este caso (apenas habilitar instalabilidade via banner), um service worker mínimo é suficiente — a estratégia de cache avançada é opcional e pode ser adicionada depois.

**Alternatives considered**:
- `next-pwa` (workbox-based): Mais completo mas adiciona dependência e configuração extra. Rejeitado — complexidade desnecessária para a feature atual.
- `@ducanh2912/next-pwa`: Fork mais ativo do next-pwa. Mesma razão de rejeição.

---

## Decision 2: Localização dos artefatos PWA

**Decision**: Todos os artefatos estáticos em `public/`:
- `public/manifest.json` — Web App Manifest
- `public/sw.js` — Service Worker mínimo
- `public/icons/icon-192.png` e `public/icons/icon-512.png` — Ícones PWA

**Rationale**: O diretório `public/` é servido diretamente pelo Next.js na raiz do domínio. O manifest precisa estar em `/manifest.json` (ou referenciado via `<link>`). O service worker **deve** estar na raiz (`/sw.js`) para ter escopo sobre o domínio inteiro — não pode estar em subdiretórios.

**Note sobre ícones**: O projeto tem `src/app/favicon.ico` mas não tem ícones SVG/PNG adequados para PWA. Serão criados ícones simples 192×192 e 512×512. Se já existir `public/icon.svg`, pode ser usado como fonte.

---

## Decision 3: Registro do Service Worker

**Decision**: Registrar via componente client-side dedicado (`src/components/PwaInit.tsx`) incluído no layout raiz.

**Rationale**: O Next.js App Router executa layouts como Server Components por padrão. O registro de Service Worker requer `navigator.serviceWorker`, que só existe no navegador — portanto exige `"use client"` e `useEffect`. Separar em um componente dedicado mantém o layout limpo e segue o padrão `providers.tsx` já existente no projeto.

**Alternatives considered**:
- Registrar inline em `layout.tsx`: Forçaria todo o layout a ser client component. Rejeitado — viola o modelo App Router.
- Script `<Script>` do Next.js com `strategy="afterInteractive"`: Possível, mas menos type-safe. Rejeitado — componente React é mais consistente com o restante do projeto.

---

## Decision 4: Componente PwaInstallBanner

**Decision**: Criar `src/components/PwaInstallBanner.tsx` baseado no padrão fornecido pelo usuário, adaptado ao estilo visual atual do app.

**Rationale**: O usuário já tem uma implementação de referência que segue o padrão correto:
- Escuta `beforeinstallprompt` e `appinstalled` via `addEventListener`
- Chama `deferredPrompt.prompt()` ao clicar em instalar
- Remove o banner após instalação ou dismissal
- Não aparece quando não há suporte (condicional `if (!deferredPrompt || dismissed) return null`)

Adaptações necessárias:
- Remover referência a `/icon.svg` (não existe) — substituir pelo ícone que será criado ou usar texto/ícone Lucide
- Ajustar nome do app para "Controle de Faturas"
- Verificar responsividade mobile/desktop (Princípio VI)

---

## Decision 5: Metadata e link para manifest

**Decision**: Adicionar `<link rel="manifest">` via `metadata` do Next.js em `src/app/layout.tsx` usando a API de `metadata` do App Router.

**Rationale**: Next.js 15 App Router suporta `manifest` na configuração de `metadata`:
```ts
export const metadata: Metadata = {
  manifest: '/manifest.json',
}
```
Isso gera automaticamente `<link rel="manifest" href="/manifest.json">` no `<head>`. É a abordagem idiomática para o App Router — sem necessidade de editar HTML diretamente.

**Alternatives considered**:
- Adicionar `<link>` manual em `layout.tsx`: Funciona mas duplica o que `metadata.manifest` faz. Rejeitado.

---

## Summary of Required Changes

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `public/manifest.json` | Criar | Web App Manifest com ícones e metadados |
| `public/sw.js` | Criar | Service Worker mínimo (install + fetch handler vazio) |
| `public/icons/icon-192.png` | Criar | Ícone PWA 192×192 (gerado via canvas ou placeholder) |
| `public/icons/icon-512.png` | Criar | Ícone PWA 512×512 |
| `src/components/PwaInstallBanner.tsx` | Criar | Banner de instalação |
| `src/components/PwaInit.tsx` | Criar | Registro do service worker (client component) |
| `src/app/layout.tsx` | Modificar | Adicionar `manifest` em `metadata` e incluir os dois novos componentes |
