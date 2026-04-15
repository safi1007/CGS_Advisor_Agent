import {
  detectMeetingTrigger,
  detectStakeholderChallenge,
} from "./agent/post-engagement/index.js";

const meetingTests = [
  {
    message: "I have a board meeting next week",
    expected: true,
  },
  {
    message: "what were our capability gaps",
    expected: false,
  },
  {
    message: "presenting to Northlake on Friday",
    expected: true,
  },
  {
    message: "how is the CDO search going",
    expected: false,
  },
];

const stakeholderTests = [
  {
    message: "Linda is blocking the CVCP workstream",
    expected: true,
  },
  {
    message: "I need help with the board meeting",
    expected: false,
  },
  {
    message: "the COO is not buying in to the timeline",
    expected: true,
  },
  {
    message: "where are we on the AWS contract",
    expected: false,
  },
];

function runTests(label, tests, detector) {
  let passed = 0;

  for (const test of tests) {
    const actual = detector(test.message);
    const success = actual === test.expected;

    if (success) {
      passed += 1;
    }

    console.log(
      `${success ? "PASS" : "FAIL"} | ${label} | ${JSON.stringify(test.message)} | expected=${test.expected} actual=${actual}`
    );
  }

  return {
    passed,
    total: tests.length,
  };
}

const meetingResults = runTests(
  "detectMeetingTrigger",
  meetingTests,
  detectMeetingTrigger
);
const stakeholderResults = runTests(
  "detectStakeholderChallenge",
  stakeholderTests,
  detectStakeholderChallenge
);

const passed = meetingResults.passed + stakeholderResults.passed;
const total = meetingResults.total + stakeholderResults.total;

console.log(`SUMMARY | ${passed}/${total} tests passed`);
