import { runAssessment } from "./agent/assessment_flow.js";

const history = [
  { role: "user", content: "Hi, I'd like to assess my transformation readiness" }
];

const response = await runAssessment(history);
console.log("Agent says:", response);
