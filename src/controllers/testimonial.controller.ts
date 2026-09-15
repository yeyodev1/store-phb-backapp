import { Request, Response, NextFunction } from "express";
import { Testimonial, type TestimonialStatus } from "../models/Testimonial";

const ESTADOS: TestimonialStatus[] = ["pending", "approved", "rejected"];

/**
 * POST /api/testimonials — opinión de quien descargó o compró un recurso.
 * Entra como `pending`: solo se publica cuando un admin la aprueba.
 */
export async function createTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, city, resource, rating, comment, source, website } = req.body || {};

    // Campo trampa: las personas no lo ven, los bots lo llenan.
    if (typeof website === "string" && website.trim()) {
      res.status(201).json({ message: "Gracias por tu opinión" });
      return;
    }
    if (typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ message: "Nombre inválido" });
      return;
    }
    if (typeof resource !== "string" || !resource.trim()) {
      res.status(400).json({ message: "Elige el recurso que usaste" });
      return;
    }
    if (typeof comment !== "string" || comment.trim().length < 10) {
      res.status(400).json({ message: "Cuéntanos un poco más (mínimo 10 caracteres)" });
      return;
    }

    const estrellas = Number(rating);
    const testimonial = await Testimonial.create({
      name: name.trim(),
      city: typeof city === "string" ? city.trim() : undefined,
      resource: resource.trim(),
      rating: estrellas >= 1 && estrellas <= 5 ? Math.round(estrellas) : 5,
      comment: comment.trim().slice(0, 1000),
      source: typeof source === "string" && source ? source.trim() : "aprende",
    });

    res.status(201).json({ id: testimonial._id, message: "Gracias por tu opinión" });
  } catch (error) {
    next(error);
  }
}

/** GET /api/testimonials — solo los aprobados, para mostrarlos en el sitio. */
export async function listPublicTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const filtro: Record<string, unknown> = { status: "approved" };
    if (typeof req.query.source === "string" && req.query.source) {
      filtro.source = req.query.source;
    }

    const testimonials = await Testimonial.find(filtro)
      .select("name city resource rating comment createdAt")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.json({ testimonials });
  } catch (error) {
    next(error);
  }
}

/** GET /api/admin/testimonials — moderación. */
export async function adminListTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const filtro: Record<string, unknown> = {};
    if (typeof req.query.status === "string" && ESTADOS.includes(req.query.status as TestimonialStatus)) {
      filtro.status = req.query.status;
    }

    const testimonials = await Testimonial.find(filtro).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ testimonials });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/admin/testimonials/:id/status — aprobar o rechazar. */
export async function adminUpdateTestimonialStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body || {};
    if (!ESTADOS.includes(status)) {
      res.status(400).json({ message: "Estado inválido" });
      return;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!testimonial) {
      res.status(404).json({ message: "Testimonio no encontrado" });
      return;
    }

    res.json({ testimonial });
  } catch (error) {
    next(error);
  }
}
