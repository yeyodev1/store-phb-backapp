import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "../config/mongo";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

/**
 * Retira el catálogo Kangen/Enagic de la tienda.
 *
 * NO borra nada: marca `isActive: false` en productos y categorías, que es
 * como el storefront decide qué mostrar. Los documentos siguen en la base y
 * se recuperan corriendo este mismo script con --restore.
 *
 *   pnpm retire:kangen -- --dry-run
 *   pnpm retire:kangen
 *   pnpm retire:kangen -- --restore
 */
const DRY = process.argv.includes("--dry-run");
const RESTORE = process.argv.includes("--restore");

const CATEGORIAS_KANGEN = ["ionizadores", "spa-ducha", "filtros-repuestos"];

async function main() {
  await dbConnect();

  // Retirar => isActive false. Restaurar => isActive true.
  const activo = RESTORE;
  const verbo = RESTORE ? "reactivar" : "retirar";

  const productos = await Product.find({
    $or: [
      { categorySlug: { $in: CATEGORIAS_KANGEN } },
      { categorySlugs: { $in: CATEGORIAS_KANGEN } },
      { productType: "physical" },
    ],
  })
    .select("slug name isActive")
    .lean();

  console.log(`productos Kangen encontrados: ${productos.length}`);
  for (const p of productos) console.log(`  ${verbo}: ${p.slug}`);
  console.log(`categorías: ${CATEGORIAS_KANGEN.join(", ")}`);

  if (DRY) {
    console.log("\n(dry run: no se escribió nada)");
    await mongoose.disconnect();
    return;
  }

  const ids = productos.map((p) => p._id);
  const rp = await Product.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: activo } }
  );
  const rc = await Category.updateMany(
    { slug: { $in: CATEGORIAS_KANGEN } },
    { $set: { isActive: activo } }
  );

  console.log(`\nproductos actualizados : ${rp.modifiedCount}`);
  console.log(`categorías actualizadas: ${rc.modifiedCount}`);
  console.log(
    RESTORE
      ? "\nCatálogo Kangen reactivado."
      : "\nCatálogo Kangen retirado. Nada se borró: revertir con --restore."
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("fallo:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
