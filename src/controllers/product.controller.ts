import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";

// GET /api/products
export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(60, parseInt(req.query.limit as string) || 24);
    const search = ((req.query.search as string) || "").trim();
    const category = ((req.query.category as string) || "").trim();
    const featured = req.query.featured as string;
    const sort = (req.query.sort as string) || "-createdAt";

    const query: Record<string, unknown> = { isActive: true };
    if (category) query.categorySlug = category.toLowerCase();
    if (featured === "true") query.featured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { modelCode: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.json({
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:slug
export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    const related = await Product.find({
      isActive: true,
      categorySlug: product.categorySlug,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select("name slug modelCode price compareAtPrice images rating");

    res.json({ data: product, related });
  } catch (error) {
    next(error);
  }
}
