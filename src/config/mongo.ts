import mongoose from "mongoose";

// Cache the connection across invocations. On Vercel (serverless) each function
// invocation may reuse the same process, so we must not open a new connection
// every time — that would exhaust Atlas connections.
let cached: Promise<typeof mongoose> | null = null;

export async function dbConnect() {
  const DB_URI = process.env.DB_URI;

  if (!DB_URI) {
    throw new Error("DB_URI is not defined in environment variables");
  }

  if (mongoose.connection.readyState === 1) return;

  try {
    if (!cached) {
      cached = mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 8000 });
    }
    await cached;
    console.log("Connected to MongoDB");
  } catch (error) {
    cached = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
