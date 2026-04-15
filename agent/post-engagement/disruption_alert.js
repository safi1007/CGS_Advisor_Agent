// ============================================================
// CGS Momentum — Capability 5: Competitive Disruption Alert
// File: agent/post-engagement/disruption_alert.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { loadKnowledgeBase, buildSystemPrompt } from "./knowledge_loader.js";
config();

const client = new Anthropic();

export async function generateDisruptionAlert(clientId) {
  const knowledge = loadKnowledgeBase(clientId);
  const systemPrompt = buildSystemPrompt(clientId, knowledge);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: systemPrompt,
    // Enable web search so the alert uses real live signals
    tools: [{
      type: "web_search_20250305",
      name: "web_search"
    }],
    messages: [{
      role: "user",
      content: `Search for the latest competitive and industry 
      disruption signals relevant to this client's sector and 
      transformation programme. 

      Search for:
      1. Recent news about automotive software-defined vehicle 
         developments (last 30 days)
      2. Any announcements from Aptiv, Magna, Bosch, or Mobileye 
         about SDV capabilities
      3. Any Ford, BMW, or Stellantis supplier technology announcements
      4. Any automotive AI or connected vehicle industry developments

      Then generate a Disruption Alert that:
      - Summarises the 2-3 most relevant signals found
      - Explains specifically why each signal matters for this 
        client's transformation roadmap
      - States clearly whether any signal changes or accelerates 
        any CVCP milestone
      - Ends with a clear recommendation: does this require a 
        strategy conversation with Sarah, or is it informational only

      Format as a clean, professional alert document.`
    }]
  });

  // Handle web search tool use in the response
  const fullResponse = response.content
    .map(block => block.type === "text" ? block.text : "")
    .filter(Boolean)
    .join("\n");

  return fullResponse || "No significant disruption signals detected this month.";
}