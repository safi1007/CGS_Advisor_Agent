import * as postEngagement from "../agent/post-engagement/index.js";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function getRoute(request) {
  const url = new URL(request.url, "http://localhost");

  return (
    request.query?.route ??
    request.body?.route ??
    url.searchParams.get("route")
  );
}

function getLastUserMessage(messages) {
  return [...messages]
    .reverse()
    .find(
      (message) =>
        message?.role === "user" && typeof message.content === "string"
    )?.content;
}

function splitAnswerParts(text) {
  const parts = text
    .split(/\n+/)
    .map((part) => part.replace(/^\s*\d+[\).\s-]*/, "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [text.trim()];
}

function buildGenericQuestionsAndAnswers(text, fallbackQuestions) {
  const answers = splitAnswerParts(text);

  return fallbackQuestions.map((question, index) => ({
    question,
    answer: answers[index] ?? answers[answers.length - 1] ?? "",
  }));
}

function buildHealthQuestionsAndAnswers(text) {
  const answers = splitAnswerParts(text);
  const dimensions = [
    {
      dimension: "Strategy",
      question:
        "How aligned is the leadership team on the transformation direction this month?",
    },
    {
      dimension: "People",
      question:
        "Where does your software engineering headcount stand, and any CDO update?",
    },
    {
      dimension: "Process",
      question:
        "Are the CVCP workstreams running smoothly or are there bottlenecks?",
    },
    {
      dimension: "Technology",
      question: "How are the AWS platform and OTA development progressing?",
    },
    {
      dimension: "Conviction",
      question:
        "On a scale of 1-10, how would you rate leadership energy and commitment to the transformation this month — and what's driving that number?",
    },
  ];

  return dimensions.map((item, index) => ({
    dimension: item.dimension,
    question: item.question,
    answer: answers[index] ?? answers[answers.length - 1] ?? "",
  }));
}

function ensureMethod(request, response, method) {
  if (request.method === method) {
    return null;
  }

  response.setHeader("Allow", method);
  return sendJson(response, 405, {
    error: `Method not allowed. Use ${method}.`,
  });
}

export default async function handler(request, response) {
  const route = getRoute(request);

  if (!route) {
    return sendJson(response, 404, {
      error: "Route not found",
    });
  }

  try {
    if (route === "chat") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const {
        messages,
        conversationState = null,
        stateContext = null,
      } = request.body ?? {};

      if (!Array.isArray(messages) || messages.length === 0) {
        return sendJson(response, 400, {
          error: "Request body must include a non-empty messages array",
        });
      }

      const lastUserMessage = getLastUserMessage(messages);

      if (conversationState === "awaiting_meeting_answers" && lastUserMessage) {
        const questionsAndAnswers = buildGenericQuestionsAndAnswers(
          lastUserMessage,
          [
            "Who specifically will be in the room?",
            "What decision or approval do you need?",
            "What concerns or sensitivities should be considered?",
            "What developments since the last update should be highlighted?",
          ]
        );
        const briefing = await postEngagement.generateMeetingBriefing(
          stateContext,
          questionsAndAnswers
        );
        return sendJson(response, 200, {
          reply: briefing,
          capabilityTriggered: "meeting_briefing",
          conversationState: null,
        });
      }

      if (
        conversationState === "awaiting_stakeholder_answers" &&
        lastUserMessage
      ) {
        const questionsAndAnswers = buildGenericQuestionsAndAnswers(
          lastUserMessage,
          [
            "What is the stakeholder's specific concern?",
            "What has already been tried?",
            "What outcome do you need from the conversation?",
          ]
        );
        const comms = await postEngagement.generateStakeholderComms(
          stateContext,
          questionsAndAnswers
        );
        return sendJson(response, 200, {
          reply: comms,
          capabilityTriggered: "stakeholder_comms",
          conversationState: null,
        });
      }

      if (conversationState === "awaiting_health_answers" && lastUserMessage) {
        const questionsAndAnswers = buildHealthQuestionsAndAnswers(lastUserMessage);
        const scores = await postEngagement.scoreCheckInAnswers(
          questionsAndAnswers
        );
        const result = await postEngagement.generateHealthReport(
          scores,
          questionsAndAnswers,
          typeof stateContext?.previousScore === "number"
            ? stateContext.previousScore
            : 25
        );
        return sendJson(response, 200, {
          reply: result.report,
          report: result.report,
          scores,
          trend: result.trend,
          escalationRequired: result.escalationRequired,
          capabilityTriggered: "health_report",
          conversationState: null,
        });
      }

      if (lastUserMessage && postEngagement.detectMeetingTrigger(lastUserMessage)) {
        const result = await postEngagement.generateMeetingQuestions(
          lastUserMessage
        );
        return sendJson(response, 200, {
          reply:
            result.acknowledgment +
            "\n\n" +
            result.questions.map((q, i) => i + 1 + ". " + q).join("\n"),
          conversationState: "awaiting_meeting_answers",
          stateContext: lastUserMessage,
          capabilityTriggered: "meeting_prep",
        });
      }

      if (
        lastUserMessage &&
        postEngagement.detectStakeholderChallenge(lastUserMessage)
      ) {
        const result = await postEngagement.generateStakeholderQuestions(
          lastUserMessage
        );
        return sendJson(response, 200, {
          reply:
            result.acknowledgment +
            "\n\n" +
            result.questions.map((q, i) => i + 1 + ". " + q).join("\n"),
          conversationState: "awaiting_stakeholder_answers",
          stateContext: lastUserMessage,
          capabilityTriggered: "stakeholder_comms",
        });
      }

      const result = await postEngagement.runProjectMemoryQA(messages);
      return sendJson(response, 200, {
        reply: result.reply,
        escalationDetected: result.escalationDetected,
        capabilityTriggered: "project_memory",
      });
    }

    if (route === "progress-questions") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const result = await postEngagement.generateProgressQuestions();
      return sendJson(response, 200, result);
    }

    if (route === "progress-report") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const { questionsAndAnswers } = request.body ?? {};

      if (!Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
        return sendJson(response, 400, {
          error: "Request body must include a non-empty questionsAndAnswers array",
        });
      }

      const result = await postEngagement.generateProgressReport(
        questionsAndAnswers
      );
      return sendJson(response, 200, { report: result });
    }

    if (route === "meeting-questions") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const { meetingContext } = request.body ?? {};

      if (typeof meetingContext !== "string" || !meetingContext.trim()) {
        return sendJson(response, 400, {
          error: "Request body must include a non-empty meetingContext string",
        });
      }

      const result = await postEngagement.generateMeetingQuestions(meetingContext);
      return sendJson(response, 200, result);
    }

    if (route === "meeting-briefing") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const { meetingContext, questionsAndAnswers } = request.body ?? {};
      const result = await postEngagement.generateMeetingBriefing(
        meetingContext,
        questionsAndAnswers
      );
      return sendJson(response, 200, { briefing: result });
    }

    if (route === "stakeholder-questions") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const { challengeContext } = request.body ?? {};

      if (typeof challengeContext !== "string" || !challengeContext.trim()) {
        return sendJson(response, 400, {
          error: "Request body must include a non-empty challengeContext string",
        });
      }

      const result = await postEngagement.generateStakeholderQuestions(
        challengeContext
      );
      return sendJson(response, 200, result);
    }

    if (route === "stakeholder-comms") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const { challengeContext, questionsAndAnswers } = request.body ?? {};
      const result = await postEngagement.generateStakeholderComms(
        challengeContext,
        questionsAndAnswers
      );
      return sendJson(response, 200, { comms: result });
    }

    if (route === "health-questions") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const result = await postEngagement.generateCheckInQuestions();
      return sendJson(response, 200, result);
    }

    if (route === "health-score") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const { questionsAndAnswers } = request.body ?? {};

      if (!Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
        return sendJson(response, 400, {
          error: "Request body must include a non-empty questionsAndAnswers array",
        });
      }

      const result = await postEngagement.scoreCheckInAnswers(questionsAndAnswers);
      return sendJson(response, 200, result);
    }

    if (route === "health-report") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const {
        scores,
        questionsAndAnswers,
        previousScore = 25,
      } = request.body ?? {};
      const result = await postEngagement.generateHealthReport(
        scores,
        questionsAndAnswers,
        previousScore
      );
      return sendJson(response, 200, result);
    }

    if (route === "health-history") {
      const methodError = ensureMethod(request, response, "GET");
      if (methodError) return methodError;

      return sendJson(response, 200, {
        history: postEngagement.MERIDIAN_HEALTH_HISTORY,
      });
    }

    if (route === "disruption-alert") {
      const methodError = ensureMethod(request, response, "POST");
      if (methodError) return methodError;

      const result = await postEngagement.generateDisruptionAlert();
      return sendJson(response, 200, { alert: result });
    }

    return sendJson(response, 404, {
      error: "Route not found",
    });
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
