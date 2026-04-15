import express from "express";
import apiHandler from "./api/index.js";
import { config } from "dotenv";

config();

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const MAX_PORT_ATTEMPTS = 10;
app.use(express.json());

import { generateProgressQuestions, generateProgressReport } 
  from "./agent/post-engagement/progress_report.js";
import { detectMeetingTrigger, generateMeetingQuestions, 
  generateMeetingBriefing } 
  from "./agent/post-engagement/meeting_prep.js";
import { detectStakeholderChallenge, generateStakeholderQuestions, 
  generateStakeholderComms } 
  from "./agent/post-engagement/stakeholder_comms.js";
import { generateCheckInQuestions, scoreCheckInAnswers, 
  generateHealthReport, MERIDIAN_HEALTH_HISTORY } 
  from "./agent/post-engagement/health_check.js";
import { generateDisruptionAlert } 
  from "./agent/post-engagement/disruption_alert.js";

// Capability 1 — Progress Report
app.post("/progress-questions", async (_req, res) => {
  const result = await generateProgressQuestions();
  res.json(result);
});

app.post("/progress-report", async (req, res) => {
  const { questionsAndAnswers } = req.body;
  const report = await generateProgressReport(questionsAndAnswers);
  res.json({ report });
});

// Capability 2 — Meeting Prep
app.post("/meeting-questions", async (req, res) => {
  const { meetingContext } = req.body;
  const result = await generateMeetingQuestions(meetingContext);
  res.json(result);
});

app.post("/meeting-briefing", async (req, res) => {
  const { meetingContext, questionsAndAnswers } = req.body;
  const briefing = await generateMeetingBriefing(meetingContext, questionsAndAnswers);
  res.json({ briefing });
});

// Capability 3 — Stakeholder Comms
app.post("/stakeholder-questions", async (req, res) => {
  const { challengeContext } = req.body;
  const result = await generateStakeholderQuestions(challengeContext);
  res.json(result);
});

app.post("/stakeholder-comms", async (req, res) => {
  const { challengeContext, questionsAndAnswers } = req.body;
  const comms = await generateStakeholderComms(challengeContext, questionsAndAnswers);
  res.json({ comms });
});

// Capability 4 — Health Check
app.post("/health-questions", async (_req, res) => {
  const result = await generateCheckInQuestions();
  res.json(result);
});

app.post("/health-score", async (req, res) => {
  const { questionsAndAnswers } = req.body;
  const scores = await scoreCheckInAnswers(questionsAndAnswers);
  res.json(scores);
});

app.post("/health-report", async (req, res) => {
  const { scores, questionsAndAnswers, previousScore = 25 } = req.body;
  const result = await generateHealthReport(scores, questionsAndAnswers, previousScore);
  res.json(result);
});

app.get("/health-history/:clientId", (req, res) => {
  res.json({ history: MERIDIAN_HEALTH_HISTORY });
});

// Capability 5 — Disruption Alert
app.post("/disruption-alert", async (_req, res) => {
  const alert = await generateDisruptionAlert();
  res.json({ alert });
});

// Serve the UI files
app.use(express.static("public"));

// Unified API endpoint for local development
app.all("/api/index", async (req, res) => {
  return apiHandler(req, res);
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
