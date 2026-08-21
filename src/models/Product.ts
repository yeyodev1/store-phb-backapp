import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  modelCode?: string;
  shortDescription?: string;
  description?: string;
  benefits: string[];
  specs: { label: string; value: string }[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  category?: Types.ObjectId;
  categorySlug?: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    modelCode: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    benefits: { type: [String], default: [] },
    specs: {
      type: [{ label: String, value: String }],
      default: [],
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    images: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    categorySlug: { type: String, trim: true, lowercase: true },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

ProductSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
