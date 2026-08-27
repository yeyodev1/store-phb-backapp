import express from "express";
import cors from "cors";
import http from "http";
import routerApi from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware";

const whitelist = [
  "http://localhost:8100",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8101",
  "https://store.powerhousebiotech.com",
  "https://www.powerhousebiotech.com",
  // Hub del ecosistema: de ahí llegan los leads del funnel.
  "https://salud.powerhousebiotech.com",
  "https://phb.juanromangarza.com",
  process.env.FRONTEND_URL || "",
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin (curl/server), the whitelist, and any *.vercel.app preview.
    if (!origin || whitelist.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "50mb" }));

  app.get("/", (_req, res) => {
    res.send("Server is alive");
  });

  routerApi(app);

  app.use(globalErrorHandler);

  const server = http.createServer(app);

  return { app, server };
}
