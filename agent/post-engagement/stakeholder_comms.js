// ============================================================
// CGS Momentum — Capability 3: Stakeholder Communication Drafter
// File: agent/post-engagement/stakeholder_comms.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { loadKnowledgeBase, buildSystemPrompt } from "./knowledge_loader.js";
config();

const client = new Anthropic();

// ── Detect stakeholder challenge in message ───────────────────

export function detectStakeholderChallenge(message) {
  const triggers = [
    "resistant",
    "not buying in",
    "pushing back",
    "blocking",
    "won't support",
    "doesn't believe",
    "against the",
    "opposition",
    "convince",
    "get buy-in",
    "win over",
    "persuade",
    "align",
    "struggling with",
    "difficult conversation",
    "talk to"
  ];
  const lower = message.toLowerCase();
  return triggers.some(trigger => lower.includes(trigger));
}

// ── Generate clarifying questions about the stakeholder ──────

export async function generateStakeholderQuestions(
  clientId,
  challengeContext
) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `The client is facing a stakeholder challenge: 
      "${challengeContext}"

      Before drafting the communication strategy, ask exactly 3 
      questions that will allow you to tailor the approach. 
      Check the client context file — if this stakeholder is 
      already documented (e.g. Linda Petersen, Marcus Webb), 
      use what you know and ask only about what has changed.

      Return ONLY a JSON object:
      {
        "acknowledgment": "one sentence showing you understand 
          the challenge and connecting it to a CGS framework 
          (Dominant Logic or Structural Inertia)",
        "questions": [
          "Question 1 — about the stakeholder's specific concern",
          "Question 2 — about what has already been tried",
          "Question 3 — about the desired outcome of the conversation"
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
      acknowledgment: "This sounds like a Structural Inertia challenge.",
      questions: [
        "What specifically is this person concerned about — pace, cost, or the strategic direction?",
        "What have you already tried in terms of engaging them?",
        "What outcome do you need from them — active support, or just removal of active resistance?"
      ]
    };
  }
}

// ── Generate the stakeholder communication package ───────────

export async function generateStakeholderComms(
  clientId,
  challengeContext,
  questionsAndAnswers
) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const qaText = questionsAndAnswers.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`
  ).join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Generate a complete stakeholder communication package.

      CHALLENGE: ${challengeContext}

      CLIENT'S ANSWERS:
      ${qaText}

      Use the CGS Inertia Removal Playbook to diagnose the 
      resistance type and design the approach. Then produce:

      # Stakeholder Communication Strategy
      ## [Stakeholder Name/Role] — [Date]

      ---

      ## Aria's Diagnosis
      [One paragraph. What type of inertia is this — Dominant Logic 
      or Structural? What is driving it based on what the client 
      described? Connect to specific CGS framework language.]

      ## Recommended Approach
      [2-3 paragraphs. Which CGS inertia removal tactics apply here. 
      What to lead with, what to avoid, what outcome to aim for 
      in the conversation.]

      ## Suggested Talking Points
      [5-7 bullet points the client can use verbatim or adapt. 
      Specific, direct, non-confrontational. Address the 
      stakeholder's specific concern head-on.]

      ## Draft Email
      Subject: [Suggested subject line]

      [Complete draft email — professional, specific, 
      using the client's voice not consultant-speak. 
      Should be sendable as-is or with minor edits.]

      ## If the Conversation Gets Difficult
      [2-3 specific responses to likely pushback. 
      Format: "If they say X, you can respond with Y"]

      ---
      *Approach grounded in the CGS Inertia Removal Playbook*`
    }]
  });

  return response.content[0].text;
}