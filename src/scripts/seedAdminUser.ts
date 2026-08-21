import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { dbConnect } from "../config/mongo";
import { User } from "../models/User";

const EMAIL = process.env.SEED_ADMIN_EMAIL || "dreyes@bakano.ec";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "123456789";
const NAME = process.env.SEED_ADMIN_NAME || "Diego Reyes";

async function main() {
  await dbConnect();

  const existing = await User.findOne({ email: EMAIL.toLowerCase() });

  if (existing) {
    existing.name = NAME;
    existing.accountType = "admin";
    existing.isActive = true;
    existing.password = PASSWORD;
    await existing.save();
    console.log(`Updated admin user: ${EMAIL}`);
  } else {
    await User.create({ name: NAME, email: EMAIL, password: PASSWORD, accountType: "admin" });
    console.log(`Created admin user: ${EMAIL}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
