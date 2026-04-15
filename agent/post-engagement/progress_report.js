// ============================================================
// CGS Momentum — Capability 1: Progress Report Generation
// File: agent/post-engagement/progress_report.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { loadKnowledgeBase, buildSystemPrompt } from "./knowledge_loader.js";
config();

const client = new Anthropic();

// ── Stage 1: Generate the 3 targeted questions ───────────────
// Agent reviews the roadmap and decides what to ask
// based on what should have happened by now

export async function generateProgressQuestions(clientId) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", year: "numeric"
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Today is ${today}. You are initiating the monthly 
      Transformation Progress Check-in for this client.

      Review the transformation roadmap and identify exactly which 
      milestones should have been completed or progressed since 
      the last check-in. Then generate exactly 3 targeted questions 
      that will give you the information you need to write a complete 
      progress report.

      The questions must be:
      - Specific to milestones on the actual roadmap
      - Answerable in 2-3 sentences by a busy executive
      - Ordered from most critical to least critical

      Return ONLY a JSON object in this exact format, nothing else:
      {
        "intro": "one sentence explaining why you are checking in now",
        "questions": [
          "Question 1 text here",
          "Question 2 text here", 
          "Question 3 text here"
        ],
        "context": "one sentence about what milestone period this covers"
      }`
    }]
  });

  try {
    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("Error parsing questions JSON:", error);
    return {
      intro: "Time for your monthly transformation check-in.",
      questions: [
        "Where does the CDO search stand this month?",
        "How many software engineers have been hired to date?",
        "Are there any milestone delays or blockers you want to flag?"
      ],
      context: "Covering Phase A milestones for the current period."
    };
  }
}

// ── Stage 2: Generate the full Progress Report ───────────────
// Takes the client's answers and produces a board-ready document

export async function generateProgressReport(clientId, questionsAndAnswers) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const qaText = questionsAndAnswers.map((qa, i) =>
    `Question ${i + 1}: ${qa.question}\nAnswer: ${qa.answer}`
  ).join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Based on the client's answers to the monthly check-in 
      questions, generate a complete Transformation Progress Report.

      CLIENT RESPONSES:
      ${qaText}

      Generate the report in this exact structure using markdown formatting:

      # Transformation Progress Report
      ## [Client Company Name] — [Month Year]
      *Prepared by Aria, CGS Momentum | Confidential*

      ---

      ## Executive Summary
      [2-3 sentences. Overall status, biggest win this month, 
      biggest risk. Be direct and specific.]

      ## Transformation Health Score
      **Overall: [X]/100 — [Label]**
      
      | Dimension | Score | Status | vs Last Month |
      |-----------|-------|--------|---------------|
      | Strategy  | A[X]  | 🟡/🟢/🔴 | ↑/↓/→ |
      | People    | A[X]  | 🟡/🟢/🔴 | ↑/↓/→ |
      | Process   | A[X]  | 🟡/🟢/🔴 | ↑/↓/→ |
      | Technology| A[X]  | 🟡/🟢/🔴 | ↑/↓/→ |

      ## Milestone Status
      [Table of all active milestones with On Track / At Risk / 
      Complete / Delayed status. Be specific.]

      ## What Is Working
      [2-3 specific things going well. Name the milestone, 
      the person responsible, and why it matters.]

      ## What Needs Attention
      [2-3 specific risks or delays. Name the milestone, 
      the root cause, and the recommended action. Be direct.]

      ## Aria's Top 3 Priorities for Next Month
      1. [Most critical action — specific, owned, time-bound]
      2. [Second priority]
      3. [Third priority]

      ## Escalation Flag
      [Only include if a genuine escalation trigger is detected. 
      If none, omit this section entirely.]

      ---
      *Next check-in: [date one month from now]*
      *CGS Lead Consultant: Sarah Chen | sarah.chen@cgsadvisors.com*`
    }]
  });

  return response.content[0].text;
}