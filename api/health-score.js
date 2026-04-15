import { scoreCheckInAnswers } from "../agent/post-engagement/index.js";

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
    const { questionsAndAnswers } = request.body ?? {};

    if (!Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
      return sendJson(response, 400, {
        error: "Request body must include a non-empty questionsAndAnswers array",
      });
    }

    const result = await scoreCheckInAnswers(questionsAndAnswers);
    return sendJson(response, 200, result);
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
