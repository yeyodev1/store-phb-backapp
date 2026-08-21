import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app";
import { dbConnect } from "../src/config/mongo";

// Build the Express app once per warm serverless instance.
const { app } = createApp();
let ready: Promise<void> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!ready) ready = dbConnect();
    await ready;
  } catch (error) {
    ready = null;
    res.status(500).json({ message: "Database connection failed" });
    return;
  }
  // Delegate the request to the Express app.
  return (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
