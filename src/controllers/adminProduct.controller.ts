import { Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { AuthRequest } from "../types/AuthRequest";
import { slugify } from "../utils/slugify";

// GET /api/admin/products
export async function adminListProducts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const search = ((req.query.search as string) || "").trim();

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { modelCode: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.json({ data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/products/:id
export async function adminGetProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/products
export async function adminCreateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body || {};
    if (!body.name || body.price === undefined) {
      res.status(400).json({ message: "Nombre y precio son requeridos" });
      return;
    }

    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      res.status(409).json({ message: "Ya existe un producto con ese slug" });
      return;
    }

    const product = await Product.create({ ...body, slug });
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/products/:id
export async function adminUpdateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body || {};
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    if (body.slug) body.slug = slugify(body.slug);
    Object.assign(product, body);
    await product.save();

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/products/:id
export async function adminDeleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    res.json({ message: "Producto eliminado", data: { id: product.id } });
  } catch (error) {
    next(error);
  }
}
