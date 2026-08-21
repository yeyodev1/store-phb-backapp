import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { AuthRequest } from "../types/AuthRequest";

const SHIPPING_FLAT = Number(process.env.SHIPPING_FLAT || 0);

function makeOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `PHB-${stamp}-${rand}`;
}

// POST /api/orders  (guest or authenticated)
export async function createOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items, customer } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "El carrito está vacío" });
      return;
    }
    if (!customer || !customer.name || !customer.email) {
      res.status(400).json({ message: "Nombre y email del cliente son requeridos" });
      return;
    }

    // Rebuild items from DB so prices cannot be tampered client-side.
    const ids = items.map((i: { productId: string }) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: ids }, isActive: true });

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) continue;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      subtotal += product.price * quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        model: product.modelCode,
        image: product.images[0],
        price: product.price,
        quantity,
      });
    }

    if (orderItems.length === 0) {
      res.status(400).json({ message: "Ningún producto válido en el carrito" });
      return;
    }

    const shipping = SHIPPING_FLAT;
    const total = subtotal + shipping;

    const order = await Order.create({
      orderNumber: makeOrderNumber(),
      user: req.user?.userId,
      items: orderItems,
      subtotal,
      shipping,
      total,
      status: "pending",
      customer,
      paymentMethod: "manual",
    });

    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/mine  (protected)
export async function listMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orders = await Order.find({ user: req.user?.userId }).sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:orderNumber  (protected — own order)
export async function getMyOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      user: req.user?.userId,
    });
    if (!order) {
      res.status(404).json({ message: "Pedido no encontrado" });
      return;
    }
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
}
