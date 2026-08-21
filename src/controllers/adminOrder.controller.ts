import { Response, NextFunction } from "express";
import { Order } from "../models/Order";
import { AuthRequest } from "../types/AuthRequest";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

// GET /api/admin/orders
export async function adminListOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 30);
    const status = ((req.query.status as string) || "").trim();
    const search = ((req.query.search as string) || "").trim();

    const query: Record<string, unknown> = {};
    if (status && STATUSES.includes(status)) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({ data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/orders/:id
export async function adminGetOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Pedido no encontrado" });
      return;
    }
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/orders/:id/status
export async function adminUpdateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      res.status(400).json({ message: "Estado inválido" });
      return;
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: "Pedido no encontrado" });
      return;
    }
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/stats
export async function adminStats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [totalOrders, pendingOrders, revenueAgg] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.json({
      data: {
        totalOrders,
        pendingOrders,
        revenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}
