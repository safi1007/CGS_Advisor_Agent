// ============================================================
// CGS Momentum — Capability 4: Transformation Health Score
// File: agent/post-engagement/health_check.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { loadKnowledgeBase, buildSystemPrompt } from "./knowledge_loader.js";
config();

const client = new Anthropic();

// ── Hardcoded health history for Meridian demo ───────────────
// In production this would be stored in a database.
// For the demo we hardcode it so the trend graph works.

export const MERIDIAN_HEALTH_HISTORY = [
  {
    month: "October 2024",
    overall: 25,
    strategy: 30, people: 10, process: 30, technology: 30,
    label: "Early Stage"
  },
  {
    month: "January 2026",
    overall: 25,
    strategy: 30, people: 10, process: 30, technology: 30,
    label: "Early Stage"
  },
  {
    month: "February 2026",
    overall: 25,
    strategy: 30, people: 10, process: 30, technology: 30,
    label: "Early Stage — Engagement Close"
  },
  {
    month: "March 2026",
    overall: 27,
    strategy: 30, people: 10, process: 30, technology: 38,
    label: "Early Stage"
  },
  {
    month: "April 2026",
    overall: 29,
    strategy: 30, people: 10, process: 30, technology: 45,
    label: "Developing"
  }
];

// ── Score conversion ──────────────────────────────────────────

export function levelToPoints(level) {
  const map = { "A1": 10, "A2": 30, "A3": 55, "A4": 80, "A5": 100 };
  return map[level] || 10;
}

export function pointsToLabel(score) {
  if (score <= 25) return "Early Stage";
  if (score <= 40) return "Developing";
  if (score <= 55) return "Progressing";
  if (score <= 70) return "Advancing";
  if (score <= 85) return "Leading";
  return "Pioneering";
}

// ── Stage 1: Generate the 5 check-in questions ───────────────

export async function generateCheckInQuestions(clientId) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Generate the monthly Transformation Health Check-in 
      questions for this client following the Health Check Scoring 
      Rubric in your knowledge base.

      The 5 questions must cover:
      1. Strategy dimension — leadership alignment and direction
      2. People dimension — headcount progress and CDO status
      3. Process dimension — programme workflow and bottlenecks
      4. Technology dimension — AWS, OTA, Ford VIP progress
      5. Conviction signal — leadership energy on a 1-10 scale

      Make the questions specific to this client's current roadmap 
      phase. They should be conversational, not survey-like.

      Return ONLY a JSON object:
      {
        "opening": "2-sentence opening explaining this is the monthly 
          check-in and what it covers",
        "questions": [
          {
            "id": "strategy",
            "dimension": "Strategy",
            "question": "question text here"
          },
          {
            "id": "people", 
            "dimension": "People",
            "question": "question text here"
          },
          {
            "id": "process",
            "dimension": "Process", 
            "question": "question text here"
          },
          {
            "id": "technology",
            "dimension": "Technology",
            "question": "question text here"
          },
          {
            "id": "conviction",
            "dimension": "Conviction",
            "question": "question text here — must ask for a 1-10 score"
          }
        ]
      }`
    }]
  });

  try {
    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    return {
      opening: "Time for your monthly Transformation Health Check-in. Five quick questions.",
      questions: [
        { id: "strategy", dimension: "Strategy", question: "How aligned is the leadership team on the transformation direction this month?" },
        { id: "people", dimension: "People", question: "Where does your software engineering headcount stand, and any CDO update?" },
        { id: "process", dimension: "Process", question: "Are the CVCP workstreams running smoothly or are there bottlenecks?" },
        { id: "technology", dimension: "Technology", question: "How are the AWS platform and OTA development progressing?" },
        { id: "conviction", dimension: "Conviction", question: "On a scale of 1-10, how would you rate leadership energy and commitment to the transformation this month — and what's driving that number?" }
      ]
    };
  }
}

// ── Stage 2: Score the answers ────────────────────────────────

export async function scoreCheckInAnswers(clientId, questionsAndAnswers) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const qaText = questionsAndAnswers.map(qa =>
    `Dimension: ${qa.dimension}\nQuestion: ${qa.question}\nAnswer: ${qa.answer}`
  ).join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Score this month's health check-in answers using the 
      Intelligence Maturity Model scoring rubric in your knowledge base.

      ANSWERS:
      ${qaText}

      For each of the four dimensions (Strategy, People, Process, 
      Technology), assign an A-level score (A1-A5) and a brief 
      one-sentence rationale.

      Also extract the Conviction score (1-10) from the answer 
      to the conviction question.

      Return ONLY a JSON object:
      {
        "strategy": { "level": "A2", "points": 30, "rationale": "..." },
        "people": { "level": "A1", "points": 10, "rationale": "..." },
        "process": { "level": "A2", "points": 30, "rationale": "..." },
        "technology": { "level": "A2", "points": 30, "rationale": "..." },
        "conviction": { "score": 7, "signal": "healthy/fragile/concerning" },
        "overall": 25,
        "label": "Early Stage",
        "escalationRequired": false,
        "escalationReason": ""
      }`
    }]
  });

  try {
    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    return {
      strategy: { level: "A2", points: 30, rationale: "Leadership broadly aligned." },
      people: { level: "A1", points: 10, rationale: "CDO not yet hired." },
      process: { level: "A2", points: 30, rationale: "CVCP running with minor delays." },
      technology: { level: "A2", points: 30, rationale: "AWS contract in progress." },
      conviction: { score: 7, signal: "healthy" },
      overall: 25,
      label: "Early Stage",
      escalationRequired: false,
      escalationReason: ""
    };
  }
}

// ── Stage 3: Generate the health report ──────────────────────

export async function generateHealthReport(
  clientId,
  scores,
  questionsAndAnswers,
  previousScore
) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const trend = scores.overall > previousScore ? "↑ Improving"
    : scores.overall < previousScore ? "↓ Declining"
    : "→ Stable";

  const qaText = questionsAndAnswers.map(qa =>
    `${qa.dimension}: ${qa.answer}`
  ).join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Generate the monthly Transformation Health Report.

      THIS MONTH'S SCORES:
      Strategy: ${scores.strategy.level} (${scores.strategy.points}/100)
      People: ${scores.people.level} (${scores.people.points}/100)
      Process: ${scores.process.level} (${scores.process.points}/100)
      Technology: ${scores.technology.level} (${scores.technology.points}/100)
      Overall: ${scores.overall}/100 — ${scores.label}
      Trend: ${trend} (previous: ${previousScore}/100)
      Conviction: ${scores.conviction.score}/10 — ${scores.conviction.signal}

      CLIENT'S ANSWERS SUMMARY:
      ${qaText}

      Generate the complete health report following the structure 
      in the Health Check Scoring Rubric. Be direct about risks.
      If conviction is below 6 or declining, flag it prominently.
      
      Format as clean markdown with clear sections.
      End with Aria's 3 priorities for next month — specific and 
      actionable, not generic.
      
      ${scores.escalationRequired ? 
        "IMPORTANT: Include an escalation flag section — " + 
        scores.escalationReason : ""
      }`
    }]
  });

  return {
    report: response.content[0].text,
    scores,
    trend,
    escalationRequired: scores.escalationRequired
  };
}