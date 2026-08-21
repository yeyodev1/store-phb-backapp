import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderItem {
  product?: Types.ObjectId;
  name: string;
  model?: string;
  image?: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrder extends Document {
  orderNumber: string;
  user?: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    notes?: string;
  };
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    items: {
      type: [
        {
          product: { type: Schema.Types.ObjectId, ref: "Product" },
          name: { type: String, required: true },
          model: String,
          image: String,
          price: { type: Number, required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      default: [],
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: String,
      address: String,
      city: String,
      province: String,
      country: { type: String, default: "Ecuador" },
      notes: String,
    },
    paymentMethod: { type: String, default: "manual" },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
