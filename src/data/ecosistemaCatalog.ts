/**
 * Catálogo de arranque del ecosistema JRG × PHB.
 *
 * REGLA DE ESTE ARCHIVO: nada inventado.
 * Cada campo sale de los documentos del cliente y lleva su fuente anotada.
 * Lo que los documentos no definen queda VACÍO y marcado con TODO,
 * para que el cliente lo complete — no para que lo rellene quien programe.
 *
 * Fuentes:
 *   BRIEF  = estructura del ecosistema enviada por el cliente (§1-§14)
 *   PDF-2  = "JRG Tienda Online (2).pdf"  (sección Aprende)
 *   PDF-EV = "EVALUATE - JRG Tienda Online.pdf"
 *
 * El cliente pidió arrancar con ~10 productos "construyendo desde el principio
 * la arquitectura capaz de contener cien" (BRIEF, cierre).
 */
import type { ProductType, DeliveryMethod, DisplayTier, Theme } from "../models/Product";

export interface SeedProduct {
  name: string;
  slug: string;
  productType: ProductType;
  deliveryMethod: DeliveryMethod;
  price: number;
  currency: string;
  shortDescription?: string;
  format?: string;
  whatYouLearn?: string;
  idealFor?: string;
  timeRequired?: string;
  requiresEvaluation?: boolean;
  isLeadMagnet?: boolean;
  priceOnRequest?: boolean;
  categorySlugs: string[];
  themes: Theme[];
  displayTier?: DisplayTier;
  featured?: boolean;
  /** Origen de los datos, para auditar después. */
  _fuente: string;
  /** Qué falta por definir con el cliente. */
  _pendiente?: string;
  /** Campos redactados por nosotros y todavía sin aprobación del cliente. */
  _propuesta?: string[];
}

export const ECOSISTEMA_CATEGORIES = [
  { name: "Aprende", slug: "aprende", order: 1 },
  { name: "Fórmate", slug: "formate", order: 2 },
  { name: "Actúa", slug: "actua", order: 3 },
  { name: "Evalúate", slug: "evaluate", order: 4 },
  { name: "Regeneración", slug: "regeneracion", order: 5 },
];

export const ECOSISTEMA_PRODUCTS: SeedProduct[] = [
  // ---------- GRATUITO / CAPTACIÓN ----------
  {
    name: "PHB Health Check™",
    slug: "phb-health-check",
    productType: "assessment",
    deliveryMethod: "external-assessment",
    price: 0,
    currency: "MXN",
    isLeadMagnet: true,
    format: "Cuestionario · 10-15 preguntas",
    whatYouLearn:
      "Nivel orientativo de riesgo, áreas que vale la pena evaluar y qué PHB realizar.",
    idealFor:
      "No sabes por dónde empezar y quieres una primera señal antes de invertir en algo.",
    timeRequired: "3 minutos",
    categorySlugs: ["evaluate"],
    themes: ["prevencion"],
    displayTier: "comienza-aqui",
    featured: true,
    _fuente: "PDF-EV: 'PHB Health Check™ Gratis. 10-15 preguntas.'",
    _propuesta: ["idealFor", "timeRequired"],
    _pendiente: "Confirmar la duración real contra el cuestionario.",
  },

  // ---------- APRENDE ----------
  {
    name: "Todavía no estoy tan mal",
    slug: "todavia-no-estoy-tan-mal",
    productType: "digital",
    deliveryMethod: "download",
    price: 299,
    currency: "MXN",
    shortDescription:
      "Guía para reconocer las señales de deterioro que muchas veces normalizamos o postergamos.",
    format: "PDF / E-book",
    whatYouLearn:
      "A reconocer las señales que el cuerpo lleva tiempo dando y que solemos normalizar, y por qué postergamos actuar aun sabiendo que algo no anda bien.",
    idealFor: "Sospechas que algo no anda bien, pero nada duele lo suficiente todavía.",
    categorySlugs: ["aprende"],
    themes: ["prevencion", "comportamiento"],
    displayTier: "comienza-aqui",
    featured: true,
    _fuente: "PDF-2: título, descripción y precio $299 MXN textuales.",
    _propuesta: ["whatYouLearn", "idealFor"],
    _pendiente: "Falta timeRequired: necesito el número de páginas del PDF.",
  },
  {
    name: "50 biomarcadores que deberías conocer",
    slug: "50-biomarcadores",
    productType: "digital",
    deliveryMethod: "download",
    price: 399,
    currency: "MXN",
    shortDescription:
      "Una guía práctica para comprender qué pueden decir tus análisis acerca de tu salud metabólica, cardiovascular, inflamatoria y funcional.",
    format: "Guía digital · 42 páginas",
    whatYouLearn:
      "Cuáles son los principales indicadores que pueden ayudarte a entender tu estado metabólico, cardiovascular e inflamatorio.",
    idealFor:
      "Recibes estudios de laboratorio pero no sabes qué información importante buscar.",
    timeRequired: "Lectura: 60 min",
    categorySlugs: ["aprende"],
    themes: ["biomarcadores", "prevencion", "longevidad"],
    displayTier: "comienza-aqui",
    featured: true,
    _fuente:
      "PDF-2: los cuatro datos, el precio $399 MXN y las tres categorías son textuales.",
  },
  {
    name: "Cómo entender mejor tus análisis clínicos",
    slug: "entender-analisis-clinicos",
    productType: "digital",
    deliveryMethod: "platform-access",
    price: 790,
    currency: "MXN",
    shortDescription:
      "Aprende qué estás viendo cuando recibes tus resultados y qué preguntas deberías hacer antes de ignorarlos o interpretarlos por tu cuenta.",
    format: "Masterclass",
    whatYouLearn:
      "A leer un reporte de laboratorio sin depender de que alguien te lo traduzca, y qué preguntar en tu siguiente consulta.",
    idealFor: "Ya te hiciste estudios, los guardaste y no volviste a abrirlos.",
    categorySlugs: ["aprende"],
    themes: ["biomarcadores"],
    displayTier: "comienza-aqui",
    _fuente: "PDF-2: título, descripción y precio $790 MXN textuales.",
    _propuesta: ["whatYouLearn", "idealFor"],
    _pendiente: "Falta timeRequired: necesito la duración real del video.",
  },

  // ---------- FÓRMATE ----------
  {
    name: "PHB Health Intelligence™",
    slug: "phb-health-intelligence",
    productType: "digital",
    deliveryMethod: "platform-access",
    price: 0,
    currency: "MXN",
    shortDescription:
      "Aprende a interpretar tu salud desde una perspectiva multisistémica.",
    format: "Curso",
    priceOnRequest: true,
    categorySlugs: ["formate"],
    themes: ["biomarcadores", "longevidad"],
    _fuente: "BRIEF §3: nombre y descripción textuales.",
    _pendiente:
      "PRECIO SIN DEFINIR (rango de cursos: $1,500-$15,000 MXN) y temario sin definir. Se muestra como 'Precio a confirmar' y no es comprable.",
  },

  // ---------- EVALÚATE ----------
  {
    name: "PHB Basic™",
    slug: "phb-basic",
    productType: "assessment",
    deliveryMethod: "external-assessment",
    price: 690,
    currency: "MXN",
    shortDescription: "Empieza por conocer tu situación actual.",
    format: "Cuestionario + perfil inicial + reporte digital",
    idealFor:
      "Personas que quieren una primera orientación antes de profundizar.",
    whatYouLearn: "Una primera fotografía estructurada de tu salud.",
    categorySlugs: ["evaluate"],
    themes: ["prevencion"],
    displayTier: "populares",
    featured: true,
    _fuente: "PDF-EV: nombre, tagline, ideal para, resultado y precio $690 MXN.",
  },
  {
    name: "PHB Biomarkers™",
    slug: "phb-biomarkers",
    productType: "assessment",
    deliveryMethod: "external-assessment",
    price: 1690,
    currency: "MXN",
    shortDescription: "Entiende mejor lo que dicen tus estudios.",
    format: "Carga de estudios + análisis estructurado + reporte",
    idealFor:
      "Personas que ya cuentan con análisis clínicos y quieren organizarlos e interpretarlos dentro de un contexto más amplio.",
    whatYouLearn:
      "Una visión estructurada de tus principales biomarcadores y áreas que podrían requerir seguimiento profesional.",
    categorySlugs: ["evaluate"],
    themes: ["biomarcadores"],
    displayTier: "populares",
    _fuente: "PDF-EV: todo textual, precio $1,690 MXN.",
  },

  // ---------- ACTÚA ----------
  {
    name: "PHB ACTÚA 30",
    slug: "phb-actua-30",
    productType: "program",
    deliveryMethod: "platform-access",
    price: 0,
    currency: "MXN",
    shortDescription: "30 días para convertir conciencia en acción.",
    format: "Programa base · 30 días",
    idealFor: "Ya sabes qué deberías hacer, pero no logras sostenerlo.",
    timeRequired: "30 días",
    priceOnRequest: true,
    categorySlugs: ["actua"],
    themes: ["comportamiento"],
    displayTier: "populares",
    featured: true,
    _fuente: "BRIEF §4: nombre y descripción 'Programa base' textuales.",
    _propuesta: ["idealFor"],
    _pendiente:
      "PRECIO SIN DEFINIR (rango $990-$15,000+ según acompañamiento). Falta definir qué incluye. Se muestra como 'Precio a confirmar' y no es comprable.",
  },

  // ---------- REGENERACIÓN (nunca se compra) ----------
  {
    name: "Programa Regenerativo Metabólico",
    slug: "programa-regenerativo-metabolico",
    productType: "clinical",
    deliveryMethod: "scheduled-consultation",
    price: 0,
    currency: "MXN",
    requiresEvaluation: true,
    format: "Programa clínico",
    categorySlugs: ["regeneracion"],
    themes: ["regeneracion"],
    _fuente: "BRIEF §6: nombre textual y CTA 'Evaluar mi candidatura'.",
    _pendiente:
      "Sin precio por diseño: el flujo es Evaluación → Estudios → Consulta → Candidatura → Propuesta clínica.",
  },
];

/** Productos cuyo precio o copy todavía depende del cliente. */
export const PENDIENTES = ECOSISTEMA_PRODUCTS.filter((p) => p._pendiente);
