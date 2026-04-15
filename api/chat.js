import {
  detectMeetingTrigger,
  detectStakeholderChallenge,
  generateHealthReport,
  generateMeetingBriefing,
  generateMeetingQuestions,
  generateStakeholderComms,
  generateStakeholderQuestions,
  scoreCheckInAnswers,
} from "../agent/post-engagement/index.js";
import { runProjectMemoryQA } from "../agent/post-engagement/project_memory.js";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
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
      id: "strategy",
      dimension: "Strategy",
      question: "How aligned is the leadership team on the transformation direction this month?",
    },
    {
      id: "people",
      dimension: "People",
      question: "Where does your software engineering headcount stand, and any CDO update?",
    },
    {
      id: "process",
      dimension: "Process",
      question: "Are the CVCP workstreams running smoothly or are there bottlenecks?",
    },
    {
      id: "technology",
      dimension: "Technology",
      question: "How are the AWS platform and OTA development progressing?",
    },
    {
      id: "conviction",
      dimension: "Conviction",
      question: "On a scale of 1-10, how would you rate leadership energy and commitment to the transformation this month — and what's driving that number?",
    },
  ];

  return dimensions.map((item, index) => ({
    dimension: item.dimension,
    question: item.question,
    answer: answers[index] ?? answers[answers.length - 1] ?? "",
  }));
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
      const briefing = await generateMeetingBriefing(
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
      const comms = await generateStakeholderComms(
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
      const scores = await scoreCheckInAnswers(questionsAndAnswers);
      const result = await generateHealthReport(
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

    if (lastUserMessage && detectMeetingTrigger(lastUserMessage)) {
      const result = await generateMeetingQuestions(lastUserMessage);
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

    if (lastUserMessage && detectStakeholderChallenge(lastUserMessage)) {
      const result = await generateStakeholderQuestions(lastUserMessage);
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

    const result = await runProjectMemoryQA(messages);
    return sendJson(response, 200, {
      reply: result.reply,
      escalationDetected: result.escalationDetected,
      capabilityTriggered: "project_memory",
    });
  } catch (error) {
    console.error("Chat request failed:", error);
    return sendJson(response, 500, {
      error: "Something went wrong",
    });
  }
}
