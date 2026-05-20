# API Contract: Owner Filter em Todas as Rotas

**Feature**: 003-per-user-data-input-fix | **Date**: 2026-05-20

## Regra Universal

Todas as rotas verificam autenticação via `getServerSession`. Após a verificação,
extraem `owner = session.user?.email!` e usam em todas as operações de DB.

---

## GET /api/data

```
Antes: Institution.find().sort('position')
Depois: Institution.find({ owner }).sort('position')

Antes: Deduction.find().sort('position')
Depois: Deduction.find({ owner }).sort('position')

Antes: SalaryConfig.find({ year })
Depois: SalaryConfig.find({ year, owner })

Invoice e MonthlyDeduction: filtro indireto via institution_id / deduction_id
(já scoped ao owner pois institutions e deductions são filtrados por owner)
```

---

## POST /api/institutions

```
Antes: Institution.create({ name, due_day, payment_installment, position })
Depois: Institution.create({ name, due_day, payment_installment, position, owner })
```

## DELETE /api/institutions/[id]

```
Antes: Institution.findByIdAndDelete(id)
Depois: Institution.findOneAndDelete({ _id: id, owner })
```

## PATCH /api/institutions/[id]

```
Antes: Institution.findByIdAndUpdate(id, update, ...)
Depois: Institution.findOneAndUpdate({ _id: id, owner }, update, ...)
```

---

## PUT /api/invoices

```
Antes: Invoice.findOneAndUpdate({ institution_id, month, year }, { $set: { amount } }, { upsert: true })
Depois: Invoice.findOneAndUpdate({ institution_id, month, year, owner }, { $set: { amount, owner } }, { upsert: true })
```

---

## POST /api/deductions

```
Antes: Deduction.create({ description, position })
Depois: Deduction.create({ description, position, owner })
```

## DELETE /api/deductions/[id]

```
Antes: Deduction.findByIdAndDelete(id)
Depois: Deduction.findOneAndDelete({ _id: id, owner })
```

---

## PUT /api/monthly-deductions

```
Antes: MonthlyDeduction.findOneAndUpdate({ deduction_id, month, year }, ...)
Depois: MonthlyDeduction.findOneAndUpdate({ deduction_id, month, year, owner }, { $set: { amount, note, owner } }, { upsert: true })
```

---

## PUT /api/salary

```
Antes: SalaryConfig.findOneAndUpdate({ month, year }, ...)
Depois: SalaryConfig.findOneAndUpdate({ month, year, owner }, { $set: { [field]: value, owner } }, { upsert: true })
```
