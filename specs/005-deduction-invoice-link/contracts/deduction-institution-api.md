# Contract: API de Vínculo Subtração ↔ Instituição

## PATCH /api/deductions/[id]

Atualiza o vínculo de instituição de uma subtração.

### Request Body

```json
{
  "institution_id": "string | null"
}
```

- `institution_id`: ID de uma Institution existente, ou `null` para remover o vínculo.

### Response (200 OK)

```json
{
  "id": "string",
  "description": "string",
  "position": 0,
  "institution_id": "string | null",
  "owner": "string"
}
```

### Errors

| Status | Condição |
|--------|----------|
| 401 | Sessão inválida ou ausente |
| 404 | Deduction não encontrada para o owner |

### Mudança em relação à versão anterior

O campo `salary_period` no request body é **removido**. O campo `institution_id` o substitui.
O Mongoose Schema valida que `institution_id` é string ou null (sem FK constraint no MongoDB — validação de existência é client-side).

## POST /api/deductions

Cria uma nova subtração. Resposta inclui `institution_id: null` por padrão.

### Request Body

```json
{
  "description": "string",
  "position": 0
}
```

### Response (201 Created)

```json
{
  "id": "string",
  "description": "string",
  "position": 0,
  "institution_id": null
}
```
