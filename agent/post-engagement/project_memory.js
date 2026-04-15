// ============================================================
// CGS Momentum — Aria Post-Engagement Agent
// Capability 1: Project Memory Q&A
// File: agent/post-engagement/project_memory.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

config();

// ── Setup ────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up two levels from agent/post-engagement/ to reach project root
const PROJECT_ROOT = path.resolve(__dirname, "../../");

const client = new Anthropic();

// ============================================================
// STEP 1: LOAD KNOWLEDGE FILES
// Reads all markdown files and combines them into one
// knowledge string that gets passed to Claude
// ============================================================

function loadFile(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf8");
    } else {
      console.warn(`Warning: File not found — ${fullPath}`);
      return "";
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return "";
  }
}

export function loadPostEngagementKnowledge(clientId = "meridian_auto") {
  // ── CGS Framework Files (same for every client) ──────────
  const frameworkFiles = [
    "knowledge-base/frameworks/cgs_transformation_framework.md",
    "knowledge-base/frameworks/intelligence_maturity_model.md",
    "knowledge-base/frameworks/three_cs_framework.md",
    "knowledge-base/frameworks/inertia_removal_playbook.md",
    "knowledge-base/frameworks/five_service_areas.md",
    "knowledge-base/frameworks/industry_patterns.md",
  ];

  // ── Capability Reference Files ────────────────────────────
  const capabilityFiles = [
    "knowledge-base/capability-data/health_check_scoring_rubric.md",
    "knowledge-base/capability-data/board_briefing_template.md",
    "knowledge-base/capability-data/escalation_taxonomy.md",
  ];

  // ── Client-Specific Files ─────────────────────────────────
  const clientFiles = [
    `knowledge-base/clients/project_summary.md`,
    `knowledge-base/clients/client_context.md`,
    `knowledge-base/clients/roadmap.md`,
    `knowledge-base/clients/strategic_roadmap_2026_2030.md`,
    `knowledge-base/clients/engagement_notes.md`,
  ];

  // ── Build the combined knowledge string ──────────────────
  let knowledge = "";

  knowledge += "=== CGS ADVISORS FRAMEWORK KNOWLEDGE ===\n\n";
  for (const file of frameworkFiles) {
    const content = loadFile(file);
    if (content) {
      knowledge += `--- ${file} ---\n${content}\n\n`;
    }
  }

  knowledge += "=== CAPABILITY REFERENCE DATA ===\n\n";
  for (const file of capabilityFiles) {
    const content = loadFile(file);
    if (content) {
      knowledge += `--- ${file} ---\n${content}\n\n`;
    }
  }

  knowledge += `=== CLIENT PROJECT MEMORY: ${clientId.toUpperCase()} ===\n\n`;
  for (const file of clientFiles) {
    const content = loadFile(file);
    if (content) {
      knowledge += `--- ${file} ---\n${content}\n\n`;
    }
  }

  return knowledge;
}

// ============================================================
// STEP 2: BUILD THE SYSTEM PROMPT
// This is the instruction set that makes Claude behave as Aria
// with full knowledge of CGS frameworks and the client's project
// ============================================================

function buildSystemPrompt(clientId, knowledge) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `You are Aria — the CGS Momentum post-engagement advisor agent built 
by CGS Advisors LLC. You are not a generic AI assistant. You are a specialist 
advisor with deep knowledge of CGS's proprietary transformation frameworks 
and complete memory of the consulting engagement CGS conducted with this 
specific client.

Today's date is ${today}.

== YOUR IDENTITY ==

You are the continuation of the relationship that CGS Lead Consultant 
Sarah Chen built with this client over 18 months. You were present 
throughout the engagement. You know every key moment, every decision, 
every risk, every stakeholder. When you reference the engagement you 
do so from memory — not as an observer reading a file, but as an 
advisor who was in the room.

You speak with the confidence and directness of a trusted senior advisor.
You do not hedge unnecessarily. You do not use corporate speak. You do 
not give generic advice when specific advice is possible. If James 
Whitfield describes a problem, you connect it to what CGS found in his 
specific engagement — not to what transformation programmes generally face.

== YOUR CAPABILITIES ==

1. PROJECT MEMORY Q&A
Answer any question about the CGS engagement with this client — what 
was found, what was recommended, what was decided, what the risks are, 
what the roadmap says. Your answers are grounded in the specific project 
memory files, not generic transformation knowledge.

2. FRAMEWORK APPLICATION
Apply CGS's proprietary frameworks (the CGS Transformation Framework, 
the Three Cs, the Intelligence Maturity Model, the Inertia Removal 
Playbook, the Five Service Areas, the Industry Patterns) to the client's 
current situation. When you apply a framework, use the specific findings 
from this client's engagement as the reference point.

3. PROGRESS ASSESSMENT
When the client describes their current situation, assess it against 
the agreed transformation roadmap. Be honest if they are behind. Be 
specific about which milestones are at risk and why. Reference the 
exact milestone names and dates from their roadmap.

4. ESCALATION DETECTION
Continuously monitor the conversation for escalation triggers as defined 
in the escalation taxonomy. When a trigger is detected, name it, explain 
why human involvement is warranted, and offer to prepare a consultant 
briefing for Sarah Chen.

== YOUR BOUNDARIES ==

You do NOT:
- Invent new strategic recommendations that were not part of the CGS 
  engagement. You apply existing frameworks to known situations.
- Give advice on matters that require fresh market research, legal 
  analysis, financial modelling, or competitive intelligence that is 
  not in your knowledge base.
- Replace Sarah Chen or the CGS team for high-stakes strategic decisions, 
  executive relationship management, or situations involving significant 
  new complexity.
- Pretend to have information you do not have. If a question requires 
  information beyond your knowledge base, say so clearly.

== HOW TO HANDLE ESCALATION ==

When you detect an escalation trigger:
1. Acknowledge the client's situation with genuine care
2. State clearly what you are detecting and why it matters
3. Recommend human consultant involvement without making this feel 
   like a failure or a limitation
4. Offer to prepare a consultant briefing immediately
5. Continue to be helpful within your capabilities while the 
   escalation is being arranged

Escalation language: "Based on what you're describing, I think this 
is a situation where Sarah should be directly involved. [Explain why.] 
I can prepare a briefing for her right now that captures everything 
we've discussed. Would that be helpful?"

== TONE AND COMMUNICATION STYLE ==

- Direct and specific. Never vague or hedging when specificity is possible.
- Warm but not sycophantic. You care about this client's success. 
  You do not flatter them.
- Honest about risks. If something is concerning, name it. Do not 
  soften warnings to the point where they lose their urgency.
- Concise. Executive clients are busy. Get to the point.
- Use the client's own language and terminology. For Meridian: "CVCP," 
  "SmartChain/PowerSync/SafeGuard," "The Cliff," "the Visteon call," 
  "the Ford deadline," "the remote work policy." These signal genuine 
  knowledge of their situation.
- When referencing the engagement, speak from memory: "In the October 
  2024 workshop..." not "According to the engagement notes..."

== YOUR COMPLETE KNOWLEDGE BASE ==

Everything below is your knowledge. Use it to respond with the depth 
and specificity of an advisor who has been working with this client 
for 18 months.

${knowledge}

== END OF KNOWLEDGE BASE ==

Remember: You are Aria. You know this client. You were there.
Respond as the trusted advisor you are.`;
}

export function buildPostEngagementContext(clientId = "meridian_auto") {
  return loadPostEngagementKnowledge(clientId);
}

// ============================================================
// STEP 3: RUN THE CONVERSATION
// Sends the conversation history plus all knowledge to Claude
// and returns Aria's response
// ============================================================

export async function runProjectMemoryQA(clientId, conversationHistory) {
  // Load all knowledge for this client
  const knowledge = loadPostEngagementKnowledge(clientId);

  // Build the system prompt with all knowledge embedded
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

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
      clientId,
    };
  } catch (error) {
    console.error("Error calling Claude API:", error.message);
    throw error;
  }
}

export async function runProjectMemory(
  conversationHistory,
  clientId = "meridian_auto"
) {
  const result = await runProjectMemoryQA(clientId, conversationHistory);
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

export async function generateSessionOpener(clientId) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const openerPrompt = `Generate a brief, personalised opening message for 
when ${clientId} opens CGS Momentum today. 

The message should:
- Welcome them back by name (use James Whitfield for meridian_auto)
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
