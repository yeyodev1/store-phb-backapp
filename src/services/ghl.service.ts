import axios from "axios";
import type { ILead } from "../models/Lead";

const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

/** Etiqueta que se pone en GoHighLevel según lo que el visitante buscaba. */
const TAG_POR_INTENCION: Record<string, string> = {
  aprender: "hub-aprender",
  evaluar: "hub-evaluar",
  cambiar: "hub-actuar",
  regenerar: "hub-regeneracion",
  conferencia: "hub-conferencia",
  empresa: "hub-empresa",
};

export interface GhlResult {
  status: "synced" | "failed" | "skipped";
  contactId?: string;
  error?: string;
}

/** Deja el teléfono en formato E.164, que es lo que espera GoHighLevel. */
function normalizarTelefono(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Sin código de país asumimos México (52), que es el mercado del ecosistema.
  if (raw.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+52${digits}`;
  return `+${digits}`;
}

function partirNombre(nombre: string): { firstName: string; lastName: string } {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return { firstName: partes[0], lastName: "" };
  return { firstName: partes[0], lastName: partes.slice(1).join(" ") };
}

/**
 * Crea o actualiza el contacto en GoHighLevel.
 *
 * Nunca lanza: devuelve el resultado para que el lead se guarde igual en
 * nuestra base aunque el CRM esté caído o sin configurar.
 */
/**
 * Vía alternativa: un webhook de GoHighLevel.
 * No requiere scopes en el token, solo que exista el trigger en la cuenta.
 * Se usa cuando `GHL_LEADS_WEBHOOK` está configurado.
 */
async function enviarPorWebhook(lead: ILead, url: string): Promise<GhlResult> {
  const { firstName, lastName } = partirNombre(lead.name);
  try {
    await axios.post(
      url,
      {
        first_name: firstName,
        last_name: lastName,
        email: lead.email,
        phone: normalizarTelefono(lead.whatsapp),
        intent: lead.intent,
        source: lead.source || "hub",
        consent: lead.consent,
        ...lead.answers,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );
    return { status: "synced" };
  } catch (error: any) {
    const mensaje = error?.response?.data?.message || error?.message || "error desconocido";
    // Pista accionable: el token existe pero le falta permiso de escritura.
    const sinScope = /not authorized for this scope/i.test(String(mensaje));
    return {
      status: "failed",
      error: sinScope
        ? "El token de GoHighLevel no tiene el scope contacts.write. Agrégalo en la Private Integration, o configura GHL_LEADS_WEBHOOK."
        : String(mensaje).slice(0, 400),
    };
  }
}

export async function enviarLeadAGhl(lead: ILead): Promise<GhlResult> {
  const webhook = process.env.GHL_LEADS_WEBHOOK;
  if (webhook) return enviarPorWebhook(lead, webhook);

  const token = process.env.GHL_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token || !locationId) {
    return {
      status: "skipped",
      error: "Configura GHL_LEADS_WEBHOOK, o GHL_TOKEN + GHL_LOCATION_ID",
    };
  }

  const { firstName, lastName } = partirNombre(lead.name);
  const tags = ["hub-phb", TAG_POR_INTENCION[lead.intent]].filter(Boolean);

  // Las respuestas del quiz viajan como nota para no depender de campos
  // personalizados que quizá no existan en la cuenta.
  const respuestas = Object.entries(lead.answers || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" | ");

  try {
    const { data } = await axios.post(
      `${BASE_URL}/contacts/`,
      {
        locationId,
        firstName,
        lastName,
        email: lead.email,
        phone: normalizarTelefono(lead.whatsapp),
        source: lead.source || "hub",
        tags,
        customFields: [],
        notes: respuestas ? `Quiz (${lead.intent}) — ${respuestas}` : undefined,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: API_VERSION,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return { status: "synced", contactId: data?.contact?.id };
  } catch (error: any) {
    // GoHighLevel responde 400 con "duplicated contact" cuando ya existe:
    // eso no es un fallo, el contacto está en el CRM.
    const mensaje =
      error?.response?.data?.message || error?.message || "error desconocido";
    const duplicado =
      typeof mensaje === "string" && /duplicat/i.test(mensaje);

    if (duplicado) {
      return {
        status: "synced",
        contactId: error?.response?.data?.meta?.contactId,
      };
    }

    return { status: "failed", error: String(mensaje).slice(0, 400) };
  }
}
