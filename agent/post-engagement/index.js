import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import {
  buildPostEngagementContext,
  loadPostEngagementKnowledge,
  runProjectMemory,
} from "./project_memory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export {
  buildPostEngagementContext,
  loadPostEngagementKnowledge,
  runProjectMemory,
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
