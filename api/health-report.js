import { generateHealthReport } from "../agent/post-engagement/index.js";

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
    const {
      scores,
      questionsAndAnswers,
      previousScore = 25,
    } = request.body ?? {};

    const result = await generateHealthReport(
      scores,
      questionsAndAnswers,
      previousScore
    );
    return sendJson(response, 200, result);
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
