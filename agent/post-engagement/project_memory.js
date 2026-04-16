// ============================================================
// CGS Momentum — Aria Post-Engagement Agent
// Capability 1: Project Memory Q&A
// File: agent/post-engagement/project_memory.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import {
  buildSystemPrompt,
  loadKnowledgeBase,
} from "./knowledge_loader.js";

config();

const client = new Anthropic();
export function loadPostEngagementKnowledge() {
  return loadKnowledgeBase();
}

export function buildPostEngagementContext() {
  return loadKnowledgeBase();
}

// ============================================================
// STEP 3: RUN THE CONVERSATION
// Sends the conversation history plus all knowledge to Claude
// and returns Aria's response
// ============================================================

export async function runProjectMemoryQA(conversationHistory) {
  // Load all knowledge for this client
  const knowledge = loadKnowledgeBase();

  // Build the system prompt with all knowledge embedded
  const systemPrompt = buildSystemPrompt(knowledge);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationHistory,
    });

    const reply = response.content[0].text;

    // Detect escalation triggers in the response
    const escalationDetected = detectEscalation(reply, conversationHistory);

    return {
      reply,
      escalationDetected,
    };
  } catch (error) {
    console.error("Error calling Claude API:", error.message);
    throw error;
  }
}

export async function runProjectMemory(conversationHistory) {
  const result = await runProjectMemoryQA(conversationHistory);
  return result.reply;
}

// ============================================================
// STEP 4: ESCALATION DETECTION
// Scans both the conversation content and Aria's response
// for signals that require human consultant involvement
// ============================================================

function detectEscalation(ariaResponse, conversationHistory) {
  // ── Signals in Aria's response that indicate escalation ──
  const escalationPhrases = [
    "sarah should be",
    "bring sarah in",
    "human consultant",
    "escalating this",
    "beyond what aria",
    "beyond my knowledge",
    "requires fresh",
    "needs to be in the room",
    "prepare a briefing for sarah",
    "this warrants",
    "i want to flag",
    "i need to be direct",
    "this goes beyond",
    "qualified legal",
    "legal counsel",
  ];

  const responseLower = ariaResponse.toLowerCase();
  const responseTriggered = escalationPhrases.some((phrase) =>
    responseLower.includes(phrase)
  );

  // ── Signals in the client's most recent message ──────────
  const lastUserMessage = conversationHistory
    .filter((m) => m.role === "user")
    .pop();

  const clientEscalationSignals = [
    "board is questioning",
    "ceo is questioning",
    "northlake",
    "acquisition",
    "legal",
    "lawsuit",
    "compliance",
    "leaving the company",
    "stepping down",
    "thinking of leaving",
    "might resign",
    "conflict between",
    "open disagreement",
    "ford changed their",
    "bmw changed their",
    "lost the contract",
  ];

  let clientTriggered = false;
  if (lastUserMessage) {
    const clientMessageLower = lastUserMessage.content.toLowerCase();
    clientTriggered = clientEscalationSignals.some((signal) =>
      clientMessageLower.includes(signal)
    );
  }

  return responseTriggered || clientTriggered;
}

// ============================================================
// STEP 5: HEALTH CHECK TRIGGER
// Determines if Aria should proactively initiate a health
// check-in based on time since last check-in
// (placeholder for Capability 2 — Health Check-in)
// ============================================================

export function shouldTriggerHealthCheck(lastCheckInDate) {
  if (!lastCheckInDate) return true;

  const daysSinceLastCheckIn = Math.floor(
    (new Date() - new Date(lastCheckInDate)) / (1000 * 60 * 60 * 24)
  );

  // Trigger if more than 28 days since last check-in
  return daysSinceLastCheckIn >= 28;
}
