import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType: "admin" | "user";
  isActive: boolean;
  address?: {
    line1?: string;
    city?: string;
    province?: string;
    country?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    accountType: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    address: {
      line1: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
      country: { type: String, trim: true, default: "Ecuador" },
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.set("toJSON", {
  transform(_doc: any, ret: any) {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);
