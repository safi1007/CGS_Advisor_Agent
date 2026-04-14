import { runProjectMemory } from "./agent/Post-engagment/index.js";

const history = [
  { role: "user", content: "Hi, I'd like to assess my transformation readiness" }
];

const response = await runProjectMemory(history);
console.log("Agent says:", response);
