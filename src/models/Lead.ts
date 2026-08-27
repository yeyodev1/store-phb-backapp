import mongoose, { Schema, Document } from "mongoose";

/** Las seis intenciones del funnel de discriminación del hub. */
export type LeadIntent =
  | "aprender"
  | "evaluar"
  | "cambiar"
  | "regenerar"
  | "conferencia"
  | "empresa";

export interface ILead extends Document {
  intent: LeadIntent;
  /** Respuestas del quiz de 3 pasos, tal cual las mandó el hub. */
  answers: Record<string, string>;
  name: string;
  email: string;
  whatsapp: string;
  consent: boolean;
  /** De dónde vino: hub, tienda, campaña. */
  source: string;
  /** Estado de la sincronización con GoHighLevel. */
  crmStatus: "pending" | "synced" | "failed" | "skipped";
  crmContactId?: string;
  crmError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    intent: {
      type: String,
      enum: ["aprender", "evaluar", "cambiar", "regenerar", "conferencia", "empresa"],
      required: true,
      index: true,
    },
    answers: { type: Schema.Types.Mixed, default: {} },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    whatsapp: { type: String, required: true, trim: true },
    consent: { type: Boolean, default: false },
    source: { type: String, default: "hub", trim: true },
    crmStatus: {
      type: String,
      enum: ["pending", "synced", "failed", "skipped"],
      default: "pending",
      index: true,
    },
    crmContactId: { type: String, trim: true },
    crmError: { type: String, trim: true },
  },
  { timestamps: true, collection: "leads" }
);

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
