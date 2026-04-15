// ============================================================
// CGS Momentum — Shared Knowledge Loader
// Used by all post-engagement capabilities
// File: agent/post-engagement/knowledge_loader.js
// ============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../");

export function loadFile(filePath) {
  try {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf8");
    }
    console.warn(`Warning: File not found — ${fullPath}`);
    return "";
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return "";
  }
}

export function loadKnowledgeBase(clientId) {
  const frameworkFiles = [
    "knowledge-base/frameworks/cgs_transformation_framework.md",
    "knowledge-base/frameworks/intelligence_maturity_model.md",
    "knowledge-base/frameworks/three_cs_framework.md",
    "knowledge-base/frameworks/inertia_removal_playbook.md",
    "knowledge-base/frameworks/five_service_areas.md",
    "knowledge-base/frameworks/industry_patterns.md",
  ];

  const capabilityFiles = [
    "knowledge-base/capability-data/health_check_scoring_rubric.md",
    "knowledge-base/capability-data/board_briefing_template.md",
    "knowledge-base/capability-data/escalation_taxonomy.md",
  ];

  const clientFiles = [
    `knowledge-base/clients/project_summary.md`,
    `knowledge-base/clients/client_context.md`,
    `knowledge-base/clients/roadmap.md`,
    `knowledge-base/clients/strategic_roadmap_2026_2030.md`,
    `knowledge-base/clients/engagement_notes.md`,
  ];

  let knowledge = "";

  knowledge += "=== CGS ADVISORS FRAMEWORK KNOWLEDGE ===\n\n";
  for (const file of frameworkFiles) {
    const content = loadFile(file);
    if (content) knowledge += `--- ${file} ---\n${content}\n\n`;
  }

  knowledge += "=== CAPABILITY REFERENCE DATA ===\n\n";
  for (const file of capabilityFiles) {
    const content = loadFile(file);
    if (content) knowledge += `--- ${file} ---\n${content}\n\n`;
  }

  knowledge += `=== CLIENT PROJECT MEMORY: ${clientId.toUpperCase()} ===\n\n`;
  for (const file of clientFiles) {
    const content = loadFile(file);
    if (content) knowledge += `--- ${file} ---\n${content}\n\n`;
  }

  return knowledge;
}

export function buildSystemPrompt(clientId, knowledge) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric",
    month: "long", day: "numeric"
  });

  return `You are Aria — the CGS Momentum post-engagement advisor 
built by CGS Advisors LLC. Today is ${today}. You have complete 
memory of the CGS engagement with client ID: ${clientId}.

You speak as a trusted senior advisor who was present throughout 
the engagement. You are direct, specific, and honest. You use 
CGS framework language naturally. You never give generic advice 
when specific advice is possible.

YOUR COMPLETE KNOWLEDGE BASE:
${knowledge}`;
}