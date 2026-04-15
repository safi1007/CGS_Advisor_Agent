import { runProjectMemory } from "../agent/post-engagement/index.js";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, {
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const { messages } = request.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return sendJson(response, 400, {
        error: "Request body must include a non-empty messages array",
      });
    }

    const reply = await runProjectMemory(messages);
    return sendJson(response, 200, { reply });
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
