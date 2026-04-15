import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import {
  buildPostEngagementContext,
  generateSessionOpener,
  loadPostEngagementKnowledge,
  runProjectMemory,
} from "./project_memory.js";
import {
  generateProgressQuestions,
  generateProgressReport,
} from "./progress_report.js";
import {
  detectMeetingTrigger,
  generateMeetingBriefing,
  generateMeetingQuestions,
} from "./meeting_prep.js";
import {
  detectStakeholderChallenge,
  generateStakeholderComms,
  generateStakeholderQuestions,
} from "./stakeholder_comms.js";
import {
  generateCheckInQuestions,
  generateHealthReport,
  levelToPoints,
  MERIDIAN_HEALTH_HISTORY,
  pointsToLabel,
  scoreCheckInAnswers,
} from "./health_check.js";
import { generateDisruptionAlert } from "./disruption_alert.js";
import {
  buildSystemPrompt,
  loadKnowledgeBase,
} from "./knowledge_loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export {
  buildPostEngagementContext,
  generateSessionOpener,
  loadPostEngagementKnowledge,
  runProjectMemory,
  generateProgressQuestions,
  generateProgressReport,
  detectMeetingTrigger,
  generateMeetingQuestions,
  generateMeetingBriefing,
  detectStakeholderChallenge,
  generateStakeholderQuestions,
  generateStakeholderComms,
  generateCheckInQuestions,
  scoreCheckInAnswers,
  generateHealthReport,
  MERIDIAN_HEALTH_HISTORY,
  levelToPoints,
  pointsToLabel,
  generateDisruptionAlert,
  loadKnowledgeBase,
  buildSystemPrompt,
};

export async function loadPostEngagementModules() {
  const entries = await fs.readdir(__dirname, { withFileTypes: true });
  const moduleFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".js") &&
        entry.name !== "index.js"
    )
    .map((entry) => entry.name)
    .sort();

  const modules = await Promise.all(
    moduleFiles.map(async (fileName) => {
      const moduleUrl = pathToFileURL(path.join(__dirname, fileName)).href;
      const loadedModule = await import(moduleUrl);

      return {
        fileName,
        module: loadedModule,
      };
    })
  );

  return modules;
}
