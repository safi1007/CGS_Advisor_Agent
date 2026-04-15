import { generateMeetingQuestions } from "../agent/post-engagement/index.js";

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
    const { meetingContext } = request.body ?? {};

    if (typeof meetingContext !== "string" || !meetingContext.trim()) {
      return sendJson(response, 400, {
        error: "Request body must include a non-empty meetingContext string",
      });
    }

    const result = await generateMeetingQuestions(meetingContext);
    return sendJson(response, 200, result);
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
