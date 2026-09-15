import mongoose, { Schema, Document } from "mongoose";

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface ITestimonial extends Document {
  name: string;
  city?: string;
  /** Recurso que la persona descargó o compró. */
  resource: string;
  rating: number;
  comment: string;
  /** Página desde donde se dejó (aprende, tienda...). */
  source: string;
  /** Nada se publica sin revisión. */
  status: TestimonialStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, trim: true, maxlength: 80 },
    resource: { type: String, required: true, trim: true, maxlength: 160 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    source: { type: String, default: "aprende", trim: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true, collection: "testimonials" }
);

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
