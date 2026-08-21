import { Response, NextFunction } from "express";
import { Category } from "../models/Category";
import { AuthRequest } from "../types/AuthRequest";
import { slugify } from "../utils/slugify";

// GET /api/admin/categories
export async function adminListCategories(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await Category.find({}).sort({ order: 1, name: 1 });
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/categories
export async function adminCreateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body || {};
    if (!body.name) {
      res.status(400).json({ message: "El nombre es requerido" });
      return;
    }
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(409).json({ message: "Ya existe una categoría con ese slug" });
      return;
    }
    const category = await Category.create({ ...body, slug });
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/categories/:id
export async function adminUpdateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body || {};
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada" });
      return;
    }
    if (body.slug) body.slug = slugify(body.slug);
    Object.assign(category, body);
    await category.save();
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/categories/:id
export async function adminDeleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada" });
      return;
    }
    res.json({ message: "Categoría eliminada", data: { id: category.id } });
  } catch (error) {
    next(error);
  }
}
