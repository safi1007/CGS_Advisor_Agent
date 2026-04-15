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

// ============================================================
// STEP 6: SESSION STARTER
// Generates Aria's opening message when a client first
// opens CGS Momentum — personalised to their current status
// ============================================================

export async function generateSessionOpener() {
  const knowledge = loadKnowledgeBase();
  const systemPrompt = buildSystemPrompt(knowledge);

  const openerPrompt = `Generate a brief, personalised opening message for 
when the client opens CGS Momentum today. 

The message should:
- Welcome them back by name as James Whitfield at Meridian Automotive Group
- Reference one specific, current thing from their transformation 
  (the most pressing upcoming milestone or risk from their roadmap)
- Ask one focused question that invites them to share what is on 
  their mind today
- Be 3-4 sentences maximum
- Sound like a trusted advisor, not a chatbot greeting

Do not use generic phrases like "How can I help you today?" 
Be specific to their situation.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: openerPrompt }],
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Error generating session opener:", error.message);
    return `Welcome back. I'm here to help you track Meridian's 
transformation progress. What's on your mind today?`;
  }
}
