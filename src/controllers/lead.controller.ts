import { Request, Response, NextFunction } from "express";
import { Lead, type LeadIntent } from "../models/Lead";
import { enviarLeadAGhl } from "../services/ghl.service";

const INTENCIONES: LeadIntent[] = [
  "aprender",
  "evaluar",
  "cambiar",
  "regenerar",
  "conferencia",
  "empresa",
];

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * POST /api/leads — recibe el lead del funnel de discriminación del hub.
 *
 * Guarda SIEMPRE en nuestra base antes de intentar el CRM: si GoHighLevel
 * está caído o sin configurar, el lead no se pierde.
 */
export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { intent, answers, name, email, whatsapp, consent, source } = req.body || {};

    if (!INTENCIONES.includes(intent)) {
      res.status(400).json({ message: "Intención inválida" });
      return;
    }
    if (typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ message: "Nombre inválido" });
      return;
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ message: "Email inválido" });
      return;
    }
    if (typeof whatsapp !== "string" || whatsapp.replace(/\D/g, "").length < 8) {
      res.status(400).json({ message: "WhatsApp inválido" });
      return;
    }

    const lead = await Lead.create({
      intent,
      answers: answers && typeof answers === "object" ? answers : {},
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      consent: Boolean(consent),
      source: typeof source === "string" && source ? source.trim() : "hub",
      crmStatus: "pending",
    });

    // Respondemos ya: el visitante no debe esperar al CRM.
    res.status(201).json({ id: lead._id, message: "Lead recibido" });

    // Sincronización en segundo plano.
    const resultado = await enviarLeadAGhl(lead);
    await Lead.updateOne(
      { _id: lead._id },
      {
        $set: {
          crmStatus: resultado.status,
          crmContactId: resultado.contactId,
          crmError: resultado.error,
        },
      }
    );
  } catch (error) {
    next(error);
  }
}

/** GET /api/admin/leads — listado para el panel. */
export async function listLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 25);
    const filtro: Record<string, unknown> = {};

    if (typeof req.query.intent === "string" && req.query.intent) {
      filtro.intent = req.query.intent;
    }
    if (typeof req.query.crmStatus === "string" && req.query.crmStatus) {
      filtro.crmStatus = req.query.crmStatus;
    }

    const [leads, total] = await Promise.all([
      Lead.find(filtro)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filtro),
    ]);

    res.json({ leads, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

/** POST /api/admin/leads/:id/resync — reintenta el envío al CRM. */
export async function resyncLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ message: "Lead no encontrado" });
      return;
    }

    const resultado = await enviarLeadAGhl(lead);
    lead.crmStatus = resultado.status;
    lead.crmContactId = resultado.contactId;
    lead.crmError = resultado.error;
    await lead.save();

    res.json({ crmStatus: lead.crmStatus, crmContactId: lead.crmContactId });
  } catch (error) {
    next(error);
  }
}
