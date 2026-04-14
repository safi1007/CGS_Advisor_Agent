import express from "express";
import { runProjectMemory } from "./agent/Post-engagment/index.js";
import { config } from "dotenv";

config();

const app = express();
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const MAX_PORT_ATTEMPTS = 10;
app.use(express.json());

// Serve the UI files
app.use(express.static("ui"));

// The chat endpoint — UI calls this, it calls Claude
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Request body must include a non-empty messages array",
      });
    }

    const reply = await runProjectMemory(messages);
    res.json({ reply });
  } catch (error) {
    console.error("Chat request failed:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

function startServer(port, attemptsRemaining = MAX_PORT_ATTEMPTS) {
  const server = app.listen(port, HOST);

  server.on("listening", () => {
    console.log(`CGS Advisor Agent running at http://${HOST}:${port}`);
  });

  server.on("error", (error) => {
    const canRetry =
      attemptsRemaining > 1 &&
      (error.code === "EADDRINUSE" || error.code === "EPERM");

    if (canRetry) {
      const nextPort = port + 1;
      console.error(
        `Port ${port} is unavailable (${error.code}). Retrying on ${nextPort}...`
      );
      startServer(nextPort, attemptsRemaining - 1);
      return;
    }

    console.error("Server failed to start:", error);
    process.exit(1);
  });
}

startServer(PORT);
