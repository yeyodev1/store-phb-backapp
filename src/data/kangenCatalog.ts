// Seed catalog for the PowerHouse Biotech — Agua Kangen store.
// Source: "Revista Agua Kangen" (Enagic / PowerHouse Biotech).
// NOTE: prices are editable placeholders (no MSRP appeared in the source
// magazine). Adjust them from the admin portal.

export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  order: number;
}

export interface SeedProduct {
  name: string;
  slug: string;
  modelCode: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  specs: { label: string; value: string }[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured: boolean;
  tags: string[];
}

export const seedCategories: SeedCategory[] = [
  {
    name: "Ionizadores Kangen",
    slug: "ionizadores",
    description:
      "Generadores continuos de agua electrolizada ionizada Enagic. Tecnología médica japonesa que produce hasta 5 tipos de agua.",
    order: 1,
  },
  {
    name: "Spa & Ducha",
    slug: "spa-ducha",
    description:
      "Sistemas de agua mineral ionizada para el hogar. Elimina el cloro y transforma tu ducha en una experiencia de balneario.",
    order: 2,
  },
  {
    name: "Filtros y Repuestos",
    slug: "filtros-repuestos",
    description: "Filtros y consumibles originales Enagic para mantener tu equipo en óptimo estado.",
    order: 3,
  },
];

export const seedProducts: SeedProduct[] = [
  {
    name: "Leveluk R",
    slug: "leveluk-r",
    modelCode: "Leveluk R",
    categorySlug: "ionizadores",
    shortDescription: "El pequeño de Enagic. Ideal para uso individual o en pareja.",
    description:
      "El Ionizador Leveluk R está destinado a uso individual o en pareja. Su cámara de electrólisis cuenta con 3 placas de Titanio bañadas 100% en Platino. Incluye una pantalla LCD que ayuda a elegir el tipo de agua que quieres consumir, con un diseño exterior moderno en tonos plateados que encaja con las cocinas de hoy en día.",
    benefits: [
      "Uso individual o en pareja",
      "Pantalla LCD para elegir el tipo de agua",
      "Diseño moderno en tonos plateados",
      "Produce 3 tipos de agua (Alcalina, Neutra y Beauty)",
    ],
    specs: [
      { label: "Placas", value: "3 placas de Titanio bañadas 100% en Platino" },
      { label: "Tipos de agua", value: "3 (Kangen, Neutra, Beauty)" },
      { label: "Garantía", value: "3 años sin restricciones" },
      { label: "Dimensiones", value: "24 × 28 × 11 cm" },
    ],
    price: 1980,
    stock: 15,
    featured: false,
    tags: ["ionizador", "kangen", "individual"],
  },
  {
    name: "Leveluk JRII",
    slug: "leveluk-jrii",
    modelCode: "Leveluk JRII",
    categorySlug: "ionizadores",
    shortDescription: "Ideal para familias de 2 a 4 personas. Produce las aguas fuertes.",
    description:
      "El JRII tiene tres placas de electrodos sólidos que reducen el consumo de energía. Gracias a las placas de titanio sólido bañadas en 100% platino, esta unidad puede producir las aguas fuertes de Kangen: Agua Súper Alcalina (pH 11.5) y Agua Súper Ácida (pH 2.5). Se recomienda para familias de entre 2 y 4 personas.",
    benefits: [
      "Recomendado para familias de 2 a 4 personas",
      "Menor consumo de energía",
      "Pantalla LCD y aviso de cambio de filtro",
      "Produce las 5 aguas, incluidas las fuertes",
    ],
    specs: [
      { label: "Placas", value: "3 placas de electrodos sólidos de titanio/platino" },
      { label: "Tipos de agua", value: "5 (pH 2.5 a 11.5)" },
      { label: "Garantía", value: "3 años sin restricciones" },
      { label: "Dimensiones", value: "24 × 28 × 15 cm" },
    ],
    price: 2380,
    stock: 12,
    featured: false,
    tags: ["ionizador", "kangen", "familia"],
  },
  {
    name: "Leveluk SD501",
    slug: "leveluk-sd501",
    modelCode: "SD501",
    categorySlug: "ionizadores",
    shortDescription: "El Nº1 en el mundo. Flujo continuo de 5 tipos de agua.",
    description:
      "El SD501 es el aparato más fino de su clase, con la mejor cámara de electrólisis integrada del mercado. Genera un flujo continuo de 5 tipos de agua para numerosos usos en el hogar, con mensajes de voz en inglés y una gran pantalla LCD. Su célula electrolítica, poderosa y compacta, incluye un compartimento para líquido reforzador.",
    benefits: [
      "El aparato más fino de su clase — Nº1 en el mundo",
      "Flujo continuo de 5 tipos de agua",
      "Mensajes de voz en inglés",
      "Gran pantalla LCD",
      "Produce hasta 8 galones de Agua Ácida Fuerte en ~30 min",
    ],
    specs: [
      { label: "Placas", value: "7 placas de titanio" },
      { label: "Tipos de agua", value: "5 (pH 2.5 a 11.5)" },
      { label: "Garantía", value: "5 años sin restricciones" },
      { label: "Dimensiones", value: "26 × 28 × 17 cm" },
    ],
    price: 3980,
    stock: 20,
    featured: true,
    tags: ["ionizador", "kangen", "bestseller", "sd501"],
  },
  {
    name: "Leveluk SD501 Platinum",
    slug: "leveluk-sd501-platinum",
    modelCode: "SD501 Platinum",
    categorySlug: "ionizadores",
    shortDescription: "La potencia del SD501 con diseño premium y voz en 5 idiomas.",
    description:
      "El LeveLuk SD501 PLATINUM se distingue por su diseño moderno que armoniza con las cocinas elegantes actuales. Con la misma potencia y rendimiento que el SD501, pero con un diseño más innovador y mensajes de voz en 5 idiomas: Español, Inglés, Francés, Italiano y Alemán. Líder del sector de sistemas generadores continuos de agua electrolítica ionizada.",
    benefits: [
      "Diseño moderno e innovador",
      "Mensajes de voz en 5 idiomas",
      "Cámara de electrólisis de mayor potencia",
      "Gran pantalla LCD con instrucciones claras",
      "Compartimento para líquido reforzador de electrólisis",
    ],
    specs: [
      { label: "Placas", value: "7 placas de titanio" },
      { label: "Tipos de agua", value: "5 (pH 2.5 a 11.5)" },
      { label: "Idiomas de voz", value: "5" },
      { label: "Garantía", value: "5 años sin restricciones" },
    ],
    price: 4280,
    stock: 10,
    featured: true,
    tags: ["ionizador", "kangen", "premium", "platinum"],
  },
  {
    name: "Leveluk K8 (Kangen 8)",
    slug: "leveluk-k8",
    modelCode: "K8",
    categorySlug: "ionizadores",
    shortDescription: "Máxima potencia antioxidante. 8 placas, pantalla táctil y 8 idiomas.",
    description:
      "El modelo Kangen 8 ha sido diseñado para ofrecer la máxima potencia antioxidante del mercado. Incrementa los niveles de ORP hasta un 10% gracias a sus 8 placas de Titanio Sanitario 100% pureza bañadas en Platino. Fuente de alimentación multi-voltaje con enchufes intercambiables para uso en cualquier país, pantalla táctil y sistema de limpieza automático.",
    benefits: [
      "Máxima potencia antioxidante (ORP hasta 10% mayor)",
      "Multi-voltaje con enchufes intercambiables",
      "Ahorro de hasta 30% de energía con apagado automático",
      "Única de la gama con pantalla táctil",
      "Voz y textos en 8 idiomas",
      "Filtro con memoria: avisa el cambio a los 5.687 litros",
    ],
    specs: [
      { label: "Placas", value: "8 placas de Titanio Sanitario 100% pureza/platino" },
      { label: "Tipos de agua", value: "5 (pH 2.5 a 11.5)" },
      { label: "Idiomas", value: "8" },
      { label: "Vida del filtro", value: "5.687 litros" },
      { label: "Garantía", value: "5 años sin restricciones" },
    ],
    price: 4980,
    compareAtPrice: 5480,
    stock: 18,
    featured: true,
    tags: ["ionizador", "kangen", "top", "k8", "premium"],
  },
  {
    name: "Anespa DX",
    slug: "anespa-dx",
    modelCode: "Anespa DX",
    categorySlug: "spa-ducha",
    shortDescription: "Ionizador para la ducha. Agua mineral ionizada tipo balneario en casa.",
    description:
      "Anespa DX elimina el cloro residual del agua del grifo mientras te duchas y baña la piel con agua mineral ionizada. Contiene una mezcla de ingredientes naturales de aguas termales y minerales (toba recogida de las montañas de Futamata en Hokkaido, Japón) que proporciona una sensación de disfrute similar a la de un balneario.",
    benefits: [
      "Elimina el cloro residual de la ducha",
      "Agua mineral ionizada ligeramente alcalina",
      "Protege el cabello y la piel",
      "Sensación tipo balneario en casa",
      "Propiedades antibacterianas de iones de Calcio",
    ],
    specs: [
      { label: "Filtro", value: "Doble cartucho: carbón activo + neodimio + piedras de Hokkaido" },
      { label: "Caudal", value: "15 litros/min de agua caliente" },
      { label: "Tipo de agua", value: "Mineral ionizada ligeramente alcalina" },
      { label: "Origen", value: "Futamata, Hokkaido, Japón" },
    ],
    price: 2480,
    stock: 14,
    featured: false,
    tags: ["spa", "ducha", "anespa", "piel"],
  },
  {
    name: "Filtro de Ionizador Enagic",
    slug: "filtro-enagic",
    modelCode: "Filtro Enagic",
    categorySlug: "filtros-repuestos",
    shortDescription: "Filtro interno original. Cambio sencillo una vez al año.",
    description:
      "Filtro interno de los ionizadores Enagic que solo tendrá que cambiarse una vez al año (aprox.). Su sustitución es muy sencilla y se puede hacer desde casa. Compuesto de Sulfato de Calcio, Carbón activado granulado antibacteriano y Filtro Mecánico. Convierte el agua del grifo en agua limpia antes de la electrólisis.",
    benefits: [
      "Cambio una vez al año (aprox.)",
      "Sustitución sencilla desde casa",
      "Carbón activado granulado antibacteriano",
    ],
    specs: [
      { label: "Composición", value: "Sulfato de Calcio, Carbón activado, Filtro Mecánico" },
      { label: "Intervalo de cambio", value: "Una vez al año (aprox.)" },
    ],
    price: 100,
    stock: 60,
    featured: false,
    tags: ["filtro", "repuesto", "consumible"],
  },
];
