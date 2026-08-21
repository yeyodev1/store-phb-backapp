import { Response, NextFunction } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../types/AuthRequest";

// GET /api/admin/users
export async function adminListUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const search = ((req.query.search as string) || "").trim();

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -__v"),
      User.countDocuments(query),
    ]);

    res.json({ data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/users
export async function adminCreateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, password, accountType, phone } = req.body || {};

    if (!name || !email || !password) {
      res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      res.status(409).json({ message: "El email ya está registrado" });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      accountType: accountType === "admin" ? "admin" : "user",
    });

    res.status(201).json({
      data: { id: user.id, name: user.name, email: user.email, accountType: user.accountType },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/users/:id
export async function adminUpdateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, accountType, isActive, password, phone } = req.body || {};
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (accountType !== undefined) user.accountType = accountType === "admin" ? "admin" : "user";
    if (isActive !== undefined) user.isActive = !!isActive;
    if (password) {
      if (String(password).length < 6) {
        res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        return;
      }
      user.password = password;
    }

    await user.save();

    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/users/:id
export async function adminDeleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user?.userId === req.params.id) {
      res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.json({ message: "Usuario eliminado", data: { id: user.id } });
  } catch (error) {
    next(error);
  }
}
