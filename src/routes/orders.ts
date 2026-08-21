import { Router } from "express";
import { createOrder, listMyOrders, getMyOrder } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { optionalAuth } from "../middlewares/optionalAuth.middleware";

const router = Router();

// Guest or authenticated checkout
router.post("/", optionalAuth, createOrder);

// Authenticated customer portal
router.get("/mine", authMiddleware, listMyOrders);
router.get("/:orderNumber", authMiddleware, getMyOrder);

export default router;
