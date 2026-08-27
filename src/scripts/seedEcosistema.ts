import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "../config/mongo";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import {
  ECOSISTEMA_CATEGORIES,
  ECOSISTEMA_PRODUCTS,
  FOTOS_JUAN,
} from "../data/ecosistemaCatalog";

/**
 * Carga el catálogo del ecosistema JRG × PHB.
 *
 * Es aditivo: hace upsert por slug y NO toca el catálogo Kangen existente.
 * Los dos catálogos conviven en la misma tienda.
 *
 *   pnpm seed:ecosistema -- --dry-run
 *   pnpm seed:ecosistema
 */
const DRY = process.argv.includes("--dry-run");

async function main() {
  await dbConnect();

  if (DRY) {
    console.log("DRY RUN — no se escribe nada\n");
    console.log(`categorías: ${ECOSISTEMA_CATEGORIES.map((c) => c.slug).join(", ")}\n`);
    for (const p of ECOSISTEMA_PRODUCTS) {
      const existe = await Product.exists({ slug: p.slug });
      const precio = p.price === 0 ? "sin precio" : `$${p.price} ${p.currency}`;
      console.log(
        `  ${existe ? "actualizaria" : "crearia    "}  ${p.slug.padEnd(34)} ${p.productType.padEnd(11)} ${precio}`
      );
      if (p._pendiente) console.log(`      PENDIENTE: ${p._pendiente}`);
    }
    await mongoose.disconnect();
    return;
  }

  const categoryId: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of ECOSISTEMA_CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: { ...c, isActive: true } },
      { new: true, upsert: true }
    );
    categoryId[c.slug] = doc._id as mongoose.Types.ObjectId;
    console.log(`categoría: ${c.name}`);
  }

  for (const p of ECOSISTEMA_PRODUCTS) {
    // Los campos _fuente y _pendiente son de auditoría, no van a la base.
    const { _fuente, _pendiente, ...datos } = p;
    const principal = p.categorySlugs[0];

    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          ...datos,
          categorySlug: principal,
          category: categoryId[principal],
          // Portada de marca primero (tarjetas consistentes); foto real después.
          images: [
            `/img/products/${p.slug}.svg`,
            ...(FOTOS_JUAN[p.slug] ? [FOTOS_JUAN[p.slug]] : []),
          ],
          isActive: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`producto:  ${p.name}`);
  }

  const pendientes = ECOSISTEMA_PRODUCTS.filter((p) => p._pendiente);
  console.log(
    `\nlisto: ${ECOSISTEMA_CATEGORIES.length} categorías, ${ECOSISTEMA_PRODUCTS.length} productos.`
  );
  if (pendientes.length) {
    console.log(`\n${pendientes.length} productos con datos pendientes del cliente:`);
    for (const p of pendientes) console.log(`  - ${p.name}: ${p._pendiente}`);
    console.log("\nDetalle en COPY-PENDIENTE.md");
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("fallo:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
