import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

config();

const client = new Anthropic();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const POST_ENGAGEMENT_KNOWLEDGE_DIRECTORY_NAMES = [
  "frameworks",
  "Capability-data",
  "clients",
];

async function assertDirectoryExists(directoryPath) {
  let stats;

  try {
    stats = await fs.stat(directoryPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Knowledge directory not found: ${directoryPath}`);
    }

    throw error;
  }

  if (!stats.isDirectory()) {
    throw new Error(`Knowledge path is not a directory: ${directoryPath}`);
  }
}

function getKnowledgeDirectoryPath(directoryName) {
  return path.join(repoRoot, "knowledge-base", directoryName);
}

async function readMarkdownDirectory(directoryPath) {
  await assertDirectoryExists(directoryPath);

  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

  if (markdownFiles.length === 0) {
    throw new Error(`No markdown files found in ${directoryPath}`);
  }

  const documents = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const fullPath = path.join(directoryPath, fileName);
      const content = await fs.readFile(fullPath, "utf8");

      return {
        fileName,
        fullPath,
        content,
      };
    })
  );

  return documents;
}

export async function loadPostEngagementKnowledge() {
  const directoryDocuments = await Promise.all(
    POST_ENGAGEMENT_KNOWLEDGE_DIRECTORY_NAMES.map(async (directoryName) => {
      const directoryPath = getKnowledgeDirectoryPath(directoryName);

      return {
      directoryPath,
      documents: await readMarkdownDirectory(directoryPath),
      };
    })
  );

  return directoryDocuments.flatMap(({ documents }) => documents);
}

export async function buildPostEngagementContext() {
  const documents = await loadPostEngagementKnowledge();

  return documents
    .map(
      ({ fileName, fullPath, content }) =>
        `# ${fileName}\nSource: ${path.relative(repoRoot, fullPath)}\n\n${content}`
    )
    .join("\n\n");
}

export async function runProjectMemory(conversationHistory) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    throw new Error(
      "runProjectMemory requires a non-empty conversation history array."
    );
  }

  const knowledgeContext = await buildPostEngagementContext();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1400,
    system: `You are the CGS Post-Engagement Advisor.

Use the provided CGS client and capability documents as your working memory.
Help the user synthesize what has already happened in the engagement, identify
open risks, and propose grounded next steps. Prefer information from the
knowledge files when it is available, and be explicit when information is
missing.

Knowledge base:

    ${knowledgeContext}`,
    messages: conversationHistory,
  });

  if (!response.content?.[0]?.text) {
    throw new Error("Anthropic response did not include text content.");
  }

  return response.content[0].text;
}
