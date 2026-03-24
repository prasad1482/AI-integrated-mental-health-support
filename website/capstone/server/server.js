import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createRequire } from "module";
import admin from "firebase-admin";

import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import userRouter from "./routes/userRouter.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

dotenv.config();

const app = express();

/* ==============================
   FIREBASE ADMIN INITIALIZATION
================================= */

try {
  const require = createRequire(import.meta.url);
  const serviceAccount = require("./serviceAccountKey.json");

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  console.log("🔥 Firebase Admin Initialized");
} catch (error) {
  console.error("Firebase Init Error ❌:", error.message);
}

/* ==============================
   MIDDLEWARE
================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ==============================
   CORS CONFIGURATION
================================= */

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ==============================
   ROUTES
================================= */

app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/user", userRouter);
app.use("/api/chatbot", chatbotRoutes);

/* ==============================
   HEALTH CHECK ROUTE
================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

/* ==============================
   MONGODB CONNECTION
================================= */

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Atlas Connected ✔️"))
  .catch((err) => console.error("MongoDB Error ❌:", err.message));

/* ==============================
   GLOBAL ERROR HANDLER
================================= */

app.use((err, req, res, next) => {
  console.error("Server Error ❌:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ==============================
   START SERVER
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});