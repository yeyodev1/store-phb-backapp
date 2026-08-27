# Leads del funnel — cómo funciona y qué falta

El hub (`salud.powerhousebiotech.com`) pregunta *"¿Qué estás buscando hoy?"*, hace 3 preguntas
de segmentación y pide nombre, email y WhatsApp. Ese lead llega aquí.

## El flujo

```
Hub → POST https://store-phb-backapp.vercel.app/api/leads
        │
        ├─ 1. Guarda en Mongo (colección `leads`)   ← siempre, pase lo que pase
        ├─ 2. Responde 201 al visitante             ← no espera al CRM
        └─ 3. Sincroniza con GoHighLevel en segundo plano
```

**El orden importa.** El lead se guarda antes de tocar el CRM, así que si GoHighLevel
está caído, mal configurado o sin permisos, el lead sigue siendo tuyo. `crmStatus`
registra qué pasó y `POST /api/admin/leads/:id/resync` reintenta.

## Estados de `crmStatus`

| Estado | Significa |
|---|---|
| `pending` | Recién creado, aún no se intentó |
| `synced` | Está en GoHighLevel |
| `failed` | Se intentó y falló. El motivo queda en `crmError` |
| `skipped` | No hay credenciales configuradas |

## Estado actual: FALLA por permisos

La prueba de integración devolvió:

```
crmStatus : failed
crmError  : The token is not authorized for this scope.
```

El token `GHL_TOKEN` existe y es válido, pero **le falta el scope `contacts.write`**.

## Cómo arreglarlo — dos vías, con cualquiera funciona

### Vía A — dar permiso al token (recomendada)

1. GoHighLevel → Settings → **Private Integrations**
2. Abre la integración cuyo token empieza con `pit-c68a57c4`
3. Agrega el scope **`contacts.write`** (y `contacts.readonly` si lo pide)
4. Guarda. Si genera un token nuevo, actualízalo:
   ```bash
   vercel env rm GHL_TOKEN production
   vercel env add GHL_TOKEN production
   ```
5. Redespliega el backend

### Vía B — usar un webhook (si no puedes tocar el token)

1. GoHighLevel → Automation → crea un workflow con trigger **Inbound Webhook**
2. Copia la URL del webhook
3. ```bash
   vercel env add GHL_LEADS_WEBHOOK production
   ```
4. Redespliega

`GHL_LEADS_WEBHOOK` tiene prioridad sobre el token. El webhook recibe:

```json
{
  "first_name": "...", "last_name": "...",
  "email": "...", "phone": "+52...",
  "intent": "evaluar", "source": "hub", "consent": true,
  "situacion": "tengo-analisis", "urgencia": "sintomas", "estudios": "reciente"
}
```

Las respuestas del quiz van al mismo nivel para que puedas mapearlas a campos
personalizados directo en el workflow.

## Después de arreglarlo

Reintenta los leads que quedaron en `failed`:

```
POST /api/admin/leads/:id/resync     (requiere sesión de admin)
```

## Etiquetas en GoHighLevel

Cada contacto entra con `hub-phb` más la etiqueta de su intención:
`hub-aprender` · `hub-evaluar` · `hub-actuar` · `hub-regeneracion` ·
`hub-conferencia` · `hub-empresa`.

Con eso puedes disparar un workflow distinto por tipo de interés.
