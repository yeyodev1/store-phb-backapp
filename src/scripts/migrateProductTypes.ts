/**
 * Migración idempotente: prepara los productos existentes (catálogo Kangen)
 * para convivir con los productos digitales del ecosistema JRG × PHB.
 *
 * No borra ni reescribe nada del catálogo actual: solo rellena los campos
 * nuevos con valores coherentes para un bien físico.
 *
 *   pnpm migrate:products
 *   pnpm migrate:products -- --dry-run
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "../config/mongo";
import { Product } from "../models/Product";

const DRY = process.argv.includes("--dry-run");

async function main() {
  await dbConnect();
  console.log("conectado\n");

  // Todo lo que ya existe es físico: son ionizadores, filtros y duchas.
  const sinTipo = await Product.find({ productType: { $exists: false } }).lean();
  const sinCategorias = await Product.find({
    $or: [{ categorySlugs: { $exists: false } }, { categorySlugs: { $size: 0 } }],
    categorySlug: { $exists: true, $ne: null },
  }).lean();

  console.log(`productos sin productType     : ${sinTipo.length}`);
  console.log(`productos sin categorySlugs   : ${sinCategorias.length}`);

  if (DRY) {
    for (const p of sinTipo) console.log(`  marcaria physical  ${p.slug}`);
    for (const p of sinCategorias)
      console.log(`  copiaria categoria ${p.slug} -> [${p.categorySlug}]`);
    console.log("\n(dry run: no se escribió nada)");
    await mongoose.disconnect();
    return;
  }

  const r1 = await Product.updateMany(
    { productType: { $exists: false } },
    {
      $set: {
        productType: "physical",
        deliveryMethod: "shipping",
        requiresEvaluation: false,
        isLeadMagnet: false,
        themes: [],
      },
    }
  );
  console.log(`\nmarcados como physical: ${r1.modifiedCount}`);

  let copiadas = 0;
  for (const p of sinCategorias) {
    await Product.updateOne(
      { _id: p._id },
      { $set: { categorySlugs: [p.categorySlug] } }
    );
    copiadas++;
  }
  console.log(`categorySlugs rellenados: ${copiadas}`);

  // Red de seguridad: ningún clínico puede quedar comprable.
  const r2 = await Product.updateMany(
    { productType: "clinical", requiresEvaluation: { $ne: true } },
    { $set: { requiresEvaluation: true } }
  );
  console.log(`clínicos protegidos: ${r2.modifiedCount}`);

  await mongoose.disconnect();
  console.log("\nlisto");
}

main().catch(async (err) => {
  console.error("fallo:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
