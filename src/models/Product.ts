import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Tipo de producto. Define cómo se compra y cómo se entrega.
 * 'physical' es el default para no romper el catálogo Kangen existente.
 */
export type ProductType =
  | "physical" // ionizadores, filtros: inventario y envío
  | "digital" // e-book, guía, masterclass, curso: descarga o acceso
  | "assessment" // evaluación PHB: se paga y se continúa en la app de evaluación
  | "program" // ACTÚA: acompañamiento conductual con onboarding
  | "clinical"; // programa regenerativo: NO se compra, se evalúa candidatura

export type DeliveryMethod =
  | "shipping"
  | "download"
  | "platform-access"
  | "external-assessment"
  | "scheduled-consultation";

/** Los tres niveles de exhibición del catálogo. Evita el muro de 40 productos iguales. */
export type DisplayTier = "comienza-aqui" | "populares" | "nuevos";

/** Ejes por los que el visitante navega su preocupación, no el nombre del producto. */
export type Theme =
  | "biomarcadores"
  | "prevencion"
  | "comportamiento"
  | "regeneracion"
  | "longevidad"
  | "innovacion";

export interface IProduct extends Document {
  name: string;
  slug: string;
  modelCode?: string;
  shortDescription?: string;
  description?: string;
  benefits: string[];
  specs: { label: string; value: string }[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  category?: Types.ObjectId;
  categorySlug?: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  rating: number;
  tags: string[];

  // --- Naturaleza del producto ---
  productType: ProductType;
  deliveryMethod: DeliveryMethod;

  /**
   * Los cuatro datos que toda ficha debe mostrar siempre.
   * Requisito explícito del documento del cliente.
   */
  format?: string; // Qué es              → "Guía digital · 42 páginas"
  whatYouLearn?: string; // Qué aprenderás      → "Cuáles son los principales indicadores…"
  idealFor?: string; // Para quién es       → "Recibes estudios pero no sabes qué buscar"
  timeRequired?: string; // Cuánto tiempo       → "Lectura: 60 min"

  // --- Entrega digital ---
  digitalAsset?: {
    url: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  accessUrl?: string;
  /** null o ausente = acceso perpetuo. */
  accessDurationDays?: number | null;

  /**
   * Corta el carrito. Los programas clínicos no se compran: se evalúa candidatura.
   * Requisito del cliente: nada de "Agregar al carrito" en tratamientos médicos.
   */
  requiresEvaluation: boolean;
  evaluationUrl?: string;
  /** Sobrescribe la etiqueta del CTA cuando el default no aplica. */
  ctaLabel?: string;

  /** Producto gratuito de captación: pide email/WhatsApp en vez de cobrar. */
  isLeadMagnet: boolean;

  // --- Taxonomía ---
  /** Multi-categoría. `categorySlug` se conserva como principal para compatibilidad. */
  categorySlugs: string[];
  themes: Theme[];
  displayTier?: DisplayTier;

  // --- Cobro ---
  stripeProductId?: string;
  stripePriceId?: string;
  subscription?: {
    isSubscription: boolean;
    interval?: "month" | "year";
  };

  createdAt: Date;
  updatedAt: Date;

  // Virtuales
  readonly isPurchasable: boolean;
  readonly isDigital: boolean;
  readonly resolvedCtaLabel: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    modelCode: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    benefits: { type: [String], default: [] },
    specs: {
      type: [{ label: String, value: String }],
      default: [],
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    categorySlug: { type: String, trim: true, lowercase: true },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    tags: { type: [String], default: [] },

    productType: {
      type: String,
      enum: ["physical", "digital", "assessment", "program", "clinical"],
      default: "physical",
      index: true,
    },
    deliveryMethod: {
      type: String,
      enum: [
        "shipping",
        "download",
        "platform-access",
        "external-assessment",
        "scheduled-consultation",
      ],
      default: "shipping",
    },

    format: { type: String, trim: true },
    whatYouLearn: { type: String, trim: true },
    idealFor: { type: String, trim: true },
    timeRequired: { type: String, trim: true },

    digitalAsset: {
      url: { type: String, trim: true },
      fileName: { type: String, trim: true },
      mimeType: { type: String, trim: true },
      sizeBytes: { type: Number, min: 0 },
    },
    accessUrl: { type: String, trim: true },
    accessDurationDays: { type: Number, min: 1, default: null },

    requiresEvaluation: { type: Boolean, default: false, index: true },
    evaluationUrl: { type: String, trim: true },
    ctaLabel: { type: String, trim: true },

    isLeadMagnet: { type: Boolean, default: false },

    categorySlugs: { type: [String], default: [], index: true },
    themes: {
      type: [String],
      enum: [
        "biomarcadores",
        "prevencion",
        "comportamiento",
        "regeneracion",
        "longevidad",
        "innovacion",
      ],
      default: [],
      index: true,
    },
    displayTier: {
      type: String,
      enum: ["comienza-aqui", "populares", "nuevos"],
      index: true,
    },

    stripeProductId: { type: String, trim: true },
    stripePriceId: { type: String, trim: true },
    subscription: {
      isSubscription: { type: Boolean, default: false },
      interval: { type: String, enum: ["month", "year"] },
    },
  },
  {
    timestamps: true,
    collection: "products",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** Un producto clínico nunca entra al carrito, sin importar su precio. */
ProductSchema.virtual("isPurchasable").get(function (this: IProduct) {
  if (this.requiresEvaluation || this.productType === "clinical") return false;
  if (this.isLeadMagnet) return false;
  if (this.productType === "physical") return this.stock > 0;
  return true;
});

ProductSchema.virtual("isDigital").get(function (this: IProduct) {
  return this.productType !== "physical";
});

ProductSchema.virtual("resolvedCtaLabel").get(function (this: IProduct) {
  if (this.ctaLabel) return this.ctaLabel;
  if (this.requiresEvaluation || this.productType === "clinical")
    return "Evaluar mi candidatura";
  if (this.isLeadMagnet) return "Descargar gratis";
  switch (this.productType) {
    case "assessment":
      return "Comenzar evaluación";
    case "program":
      return "Inscribirme";
    case "digital":
      return "Comprar";
    default:
      return "Agregar al carrito";
  }
});

/** Mantiene `categorySlugs` y `categorySlug` coherentes en ambos sentidos. */
ProductSchema.pre("save", function (next) {
  const doc = this as unknown as IProduct;

  if (doc.categorySlug && !doc.categorySlugs.includes(doc.categorySlug)) {
    doc.categorySlugs.unshift(doc.categorySlug);
  }
  if (!doc.categorySlug && doc.categorySlugs.length > 0) {
    doc.categorySlug = doc.categorySlugs[0];
  }

  // Un clínico jamás queda comprable por descuido de carga de datos.
  if (doc.productType === "clinical") {
    doc.requiresEvaluation = true;
  }

  next();
});

ProductSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
