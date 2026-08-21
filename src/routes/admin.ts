import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/adminOnly.middleware";
import {
  adminListUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
} from "../controllers/adminUser.controller";
import {
  adminListProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../controllers/adminProduct.controller";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../controllers/adminCategory.controller";
import {
  adminListOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminStats,
} from "../controllers/adminOrder.controller";

const router = Router();

router.use(authMiddleware, adminOnly);

// Dashboard
router.get("/stats", adminStats);

// Users
router.get("/users", adminListUsers);
router.post("/users", adminCreateUser);
router.put("/users/:id", adminUpdateUser);
router.delete("/users/:id", adminDeleteUser);

// Products
router.get("/products", adminListProducts);
router.post("/products", adminCreateProduct);
router.get("/products/:id", adminGetProduct);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);

// Categories
router.get("/categories", adminListCategories);
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

// Orders
router.get("/orders", adminListOrders);
router.get("/orders/:id", adminGetOrder);
router.put("/orders/:id/status", adminUpdateOrderStatus);

export default router;
