import { Request, Response, NextFunction } from "express";
import { Category } from "../models/Category";

// GET /api/categories
export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories/:slug
export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada" });
      return;
    }
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
}
