import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "../config/mongo";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { seedCategories, seedProducts } from "../data/kangenCatalog";

async function main() {
  await dbConnect();

  // Upsert categories, keep a slug -> _id map for product linking.
  const categoryId: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of seedCategories) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: c },
      { new: true, upsert: true }
    );
    categoryId[c.slug] = doc._id as mongoose.Types.ObjectId;
    console.log(`Category upserted: ${c.name}`);
  }

  for (const p of seedProducts) {
    // Product photos live in the frontend at /public/img/products/<slug>.jpg
    const images = [`/img/products/${p.slug}.jpg`];
    await Product.findOneAndUpdate(
      { slug: p.slug },
      { $set: { ...p, images, category: categoryId[p.categorySlug] } },
      { new: true, upsert: true }
    );
    console.log(`Product upserted: ${p.name}`);
  }

  console.log(`\nSeed complete: ${seedCategories.length} categories, ${seedProducts.length} products.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
