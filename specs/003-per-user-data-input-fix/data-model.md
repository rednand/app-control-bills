# Data Model: Isolamento de Dados por Usuário

**Date**: 2026-05-20 | **Branch**: `003-per-user-data-input-fix`

## Mudanças em todos os Models

### Campo `owner` — adicionado a todos os 5 models

```typescript
owner: { type: String, required: true, index: true }
```

| Model | Arquivo | Mudança |
|-------|---------|---------|
| Institution | `src/lib/models/Institution.ts` | + `owner` |
| Invoice | `src/lib/models/Invoice.ts` | + `owner` |
| Deduction | `src/lib/models/Deduction.ts` | + `owner` |
| MonthlyDeduction | `src/lib/models/MonthlyDeduction.ts` | + `owner` |
| SalaryConfig | `src/lib/models/SalaryConfig.ts` | + `owner` + índice atualizado |

---

## Mudança de Índice — SalaryConfig

**Antes**: `schema.index({ month: 1, year: 1 }, { unique: true })`

**Depois**: `schema.index({ month: 1, year: 1, owner: 1 }, { unique: true })`

**Impacto**: O upsert em `/api/salary` deve incluir `owner` no filtro de busca:
```
{ month, year, owner }
```

---

## TypeScript — src/lib/types.ts

Nenhuma mudança necessária. O campo `owner` é interno ao servidor (nunca enviado ao
cliente). O tipo `Institution`, `Deduction`, `SalaryConfig`, etc. não precisam incluir
`owner` pois ele é omitido no `toPlain()` do `/api/data`.

Opcionalmente, pode-se omitir `owner` ao serializar para o cliente adicionando
`const { owner: _owner, ...rest } = doc` no `toPlain`, mas o comportamento padrão do
`lean()` + spread já funciona sem exposição de risco.

---

## Padrão de Query com owner

Todas as rotas usam o seguinte padrão:

```typescript
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const owner = session.user?.email!;

// Reads:
Model.find({ owner }).lean()

// Writes (create):
Model.create({ ...data, owner })

// Writes (upsert):
Model.findOneAndUpdate({ ...uniqueFilter, owner }, { $set: data }, { upsert: true })

// Writes (delete/update by id):
Model.findOneAndDelete({ _id: id, owner })   // owner garante que só deleta o próprio
Model.findOneAndUpdate({ _id: id, owner }, update, ...)
```
