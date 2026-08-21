import express, { Application } from "express";
import authRouter from "./auth";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import adminRouter from "./admin";

function routerApi(app: Application) {
  const router = express.Router();
  app.use("/api", router);

  router.use("/auth", authRouter);
  router.use("/products", productsRouter);
  router.use("/categories", categoriesRouter);
  router.use("/orders", ordersRouter);
  router.use("/admin", adminRouter);
}

export default routerApi;
