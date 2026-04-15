import { generateMeetingBriefing } from "../agent/post-engagement/index.js";

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
    const { meetingContext, questionsAndAnswers } = request.body ?? {};
    const result = await generateMeetingBriefing(
      meetingContext,
      questionsAndAnswers
    );
    return sendJson(response, 200, { briefing: result });
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
