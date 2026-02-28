import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database";
import identifyRouter from "./routes/identify";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    message: "Bitespeed Identity Reconciliation Service",
    endpoints: {
      identify: "POST /identify",
    },
  });
});

app.use("/identify", identifyRouter);

// ── Start ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Sync tables (creates them if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("Database tables synced.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
