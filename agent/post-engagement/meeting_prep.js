// ============================================================
// CGS Momentum — Capability 2: Meeting Preparation Agent
// File: agent/post-engagement/meeting_prep.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import {
  buildSystemPrompt,
  loadKnowledgeBase,
} from "./knowledge_loader.js";
config();

const client = new Anthropic();

// ── Detect if a message is a meeting prep trigger ────────────

export function detectMeetingTrigger(message) {
  const triggers = [
    "board meeting",
    "board presentation",
    "investor meeting",
    "northlake",
    "executive review",
    "steering committee",
    "presenting to",
    "briefing the board",
    "board update",
    "preparing for",
    "meeting in",
    "meeting next",
    "meeting tomorrow",
    "meeting this week",
  ];
  const lower = message.toLowerCase();
  return triggers.some((trigger) => lower.includes(trigger));
}

// ── Generate the 4 clarifying questions ──────────────────────

export async function generateMeetingQuestions(meetingContext) {
  const knowledge = loadKnowledgeBase();
  const systemPrompt = buildSystemPrompt(knowledge);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `The client has mentioned an upcoming meeting: "${meetingContext}"

      Before generating the briefing document, you need to ask exactly 
      4 quick clarifying questions. These should be answerable in one 
      sentence each and will allow you to customise the briefing.

      Return ONLY a JSON object in this exact format:
      {
        "acknowledgment": "one sentence acknowledging the meeting and 
          that you will prepare their briefing",
        "questions": [
          "Question 1 — about who will be in the room",
          "Question 2 — about the primary decision or approval needed",
          "Question 3 — about any specific concerns or sensitivities",
          "Question 4 — about any developments since the last update"
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
      acknowledgment: "I'll prepare your board briefing right away.",
      questions: [
        "Who specifically will be in the room — board members, Northlake, or both?",
        "Is there a specific decision or approval you need from this meeting?",
        "Any sensitivities or concerns from previous board conversations I should be aware of?",
        "Any significant developments since the last update that should be highlighted?"
      ],
    };
  }
}

// ── Generate the full board briefing document ────────────────

export async function generateMeetingBriefing(
  meetingContext,
  questionsAndAnswers
) {
  const knowledge = loadKnowledgeBase();
  const systemPrompt = buildSystemPrompt(knowledge);

  const qaText = questionsAndAnswers.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`
  ).join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Generate a complete board meeting briefing document in markdown.

      MEETING CONTEXT: ${meetingContext}

      CLIENT RESPONSES TO CLARIFYING QUESTIONS:
      ${qaText}

      Use the board briefing template from your knowledge base and 
      customise it fully for this specific meeting. The document must be:
      - Paste-ready into slides or a Word document
      - Specific to this client's actual situation and data
      - Honest about risks — do not soften concerns for the board
      - Written in the voice of senior management presenting to the board

      Structure:

      # Board Briefing: Digital Transformation Progress
      ## [Company] | [Date] | CONFIDENTIAL

      ---

      ## Executive Summary
      [3-4 sentences. Where we stand, what we have achieved, 
      what the primary risk is, what we need from this meeting.]

      ## Transformation Status — The Four Dimensions
      [One paragraph per dimension with current score, 
      traffic light, and key development this month]

      ## Milestone Scorecard
      [Full table of active milestones with status and notes]

      ## Financial Snapshot
      [Investment to date, revenue protection status, 
      projected return on transformation investment]

      ## Top Three Risks
      [Three risks with likelihood, impact, mitigation, owner]

      ## Decisions Required
      [Numbered list of what the board needs to decide or endorse.
      If no decisions required, state that explicitly.]

      ---
      *Prepared with intelligence support from CGS Momentum / Aria*
      *CGS Lead Consultant: Sarah Chen*`
    }]
  });

  return response.content[0].text;
}
