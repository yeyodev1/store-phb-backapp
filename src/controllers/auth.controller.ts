import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../types/AuthRequest";

function signToken(userId: string, email: string, accountType: string): string {
  return jwt.sign(
    { userId, email, accountType },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: "El email ya está registrado" });
      return;
    }

    const user = await User.create({ name, email, password, phone });
    const token = signToken(user.id, user.email, user.accountType);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, accountType: user.accountType },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email y contraseña son requeridos" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = signToken(user.id, user.email, user.accountType);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, accountType: user.accountType },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me  (protected)
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?.userId).select("-password -__v");
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/me  (protected — update own profile)
export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, phone, address, password } = req.body || {};
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = { ...user.address, ...address };
    if (password) {
      if (String(password).length < 6) {
        res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        return;
      }
      user.password = password;
    }

    await user.save();
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}
