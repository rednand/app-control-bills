# Feature Specification: PWA Install Notification

**Feature Branch**: `007-pwa-install-notification`

**Created**: 2026-05-23

**Status**: Draft

**Input**: User description: "adicione uma notificacao para adicionar o app como PWA qndo eu entrar no navegador"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exibir banner de instalação do PWA (Priority: P1)

Quando o usuário acessa o app pelo navegador e o dispositivo suporta instalação como PWA, um banner é exibido convidando-o a instalar o app na tela inicial.

**Why this priority**: Esse é o fluxo principal da funcionalidade. Sem o banner, o usuário não é informado de que pode instalar o app, reduzindo o engajamento e o acesso rápido.

**Independent Test**: Pode ser testado abrindo o app em um navegador compatível com PWA (ex: Chrome no Android ou desktop) pela primeira vez. O banner deve aparecer automaticamente na parte inferior da tela.

**Acceptance Scenarios**:

1. **Given** o usuário acessa o app em um navegador compatível com PWA, **When** o navegador detecta que o app pode ser instalado, **Then** um banner é exibido na parte inferior da tela com opção de instalar e opção de fechar.
2. **Given** o app já está instalado no dispositivo do usuário, **When** o usuário acessa o app pelo navegador, **Then** o banner não é exibido.

---

### User Story 2 - Instalar o app via banner (Priority: P1)

O usuário vê o banner e clica em "Instalar", acionando o fluxo nativo do navegador para adicionar o app à tela inicial.

**Why this priority**: É a ação principal que o banner viabiliza — sem ela, o banner não tem valor.

**Independent Test**: Pode ser testado clicando no botão de instalar no banner e verificando que o diálogo de instalação do navegador é exibido e o app é adicionado à tela inicial após confirmação.

**Acceptance Scenarios**:

1. **Given** o banner de instalação está visível, **When** o usuário clica em "Instalar", **Then** o diálogo nativo de instalação do navegador é exibido.
2. **Given** o usuário confirma a instalação no diálogo nativo, **When** a instalação é concluída, **Then** o banner desaparece automaticamente.
3. **Given** o usuário cancela a instalação no diálogo nativo, **When** o diálogo é fechado, **Then** o banner permanece visível.

---

### User Story 3 - Dispensar o banner (Priority: P2)

O usuário pode fechar o banner sem instalar o app, e o banner não volta a aparecer na sessão atual.

**Why this priority**: Importante para não atrapalhar usuários que não querem instalar o app naquele momento.

**Independent Test**: Pode ser testado clicando no botão de fechar (X) e verificando que o banner desaparece e não reaparece durante a navegação na sessão.

**Acceptance Scenarios**:

1. **Given** o banner de instalação está visível, **When** o usuário clica no botão de fechar, **Then** o banner desaparece imediatamente.
2. **Given** o usuário fechou o banner, **When** navega pelas seções do app na mesma sessão, **Then** o banner não reaparece.

---

### Edge Cases

- O que acontece quando o navegador não suporta PWA? O banner não deve ser exibido.
- O que acontece quando o usuário recarrega a página após dispensar o banner? O banner pode reaparecer (comportamento controlado pelo navegador).
- O que acontece em iOS/Safari, onde o suporte ao evento de instalação é diferente? O banner não será exibido (limitação do sistema operacional, fora de escopo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir um banner de instalação quando o navegador indicar que o app pode ser instalado como PWA.
- **FR-002**: O banner DEVE conter: nome do app, descrição curta, botão de instalar e botão de fechar.
- **FR-003**: O banner DEVE ser exibido na parte inferior da tela, sobreposto ao conteúdo, sem bloquear a navegação principal.
- **FR-004**: Ao clicar em "Instalar", o sistema DEVE acionar o fluxo nativo de instalação do navegador.
- **FR-005**: Após a instalação bem-sucedida, o banner DEVE desaparecer automaticamente.
- **FR-006**: Ao clicar em fechar, o banner DEVE ser dispensado e não reaparecer durante a sessão.
- **FR-007**: O banner NÃO DEVE ser exibido quando o navegador não detectar suporte à instalação como PWA.
- **FR-008**: O banner NÃO DEVE ser exibido quando o app já estiver instalado no dispositivo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O banner de instalação é exibido em menos de 2 segundos após o navegador detectar que o app é instalável.
- **SC-002**: O fluxo completo de instalação (visualizar banner → clicar instalar → confirmar → banner some) é concluído sem erros em 100% das tentativas em navegadores suportados.
- **SC-003**: O banner não interfere na usabilidade do app — o conteúdo principal permanece acessível com o banner visível.
- **SC-004**: O botão de fechar dispensa o banner em 100% das interações sem recarregar a página.

---

## Assumptions & Constraints

- O banner se baseia no evento nativo do navegador (`beforeinstallprompt`), disponível apenas em navegadores baseados em Chromium (Chrome, Edge, Samsung Internet) em Android e desktop. Safari/iOS está fora do escopo desta feature.
- O app já possui ou receberá um Web App Manifest e Service Worker configurados corretamente para ser elegível como PWA instalável.
- O comportamento de reaparecimento do banner após recarga de página é controlado pelo navegador, não pelo app.
- O banner é exibido apenas uma vez por sessão após ser dispensado — persistência entre sessões (ex: via localStorage) está fora do escopo desta versão.
- O design visual do banner segue o estilo existente do app (fundo escuro, tipografia e cores atuais).
