import { Router } from "express";
import {
  createTestimonial,
  listPublicTestimonials,
} from "../controllers/testimonial.controller";

const router = Router();

// Públicos: los usa la página Aprende del hub.
router.get("/", listPublicTestimonials);
router.post("/", createTestimonial);

export default router;
