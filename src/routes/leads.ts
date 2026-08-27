import { Router } from "express";
import { createLead } from "../controllers/lead.controller";

const router = Router();

// Público: lo llama el funnel del hub.
router.post("/", createLead);

export default router;
