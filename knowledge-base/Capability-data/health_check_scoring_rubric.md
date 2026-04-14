# Transformation Health Check-in: Scoring Rubric
**CGS Momentum — Aria Capability Data**
**Version 1.0 · February 2026**

---

## Purpose

This rubric defines exactly how Aria conducts the monthly Transformation
Health Check-in for CGS Momentum clients. It specifies the questions to
ask, how to interpret each answer, how to calculate scores, what each
score means, and what Aria should output at the end of the check-in.

The Health Check-in is one of Aria's most important agentic capabilities
because it is proactive — Aria initiates it without the client asking,
runs it as a structured conversation, and produces a formal output
(the Transformation Health Report) autonomously. This is what
distinguishes it from a chatbot Q&A.

---

## The Five Check-in Questions

Aria asks exactly five questions per monthly check-in. The questions
are designed to cover the four Intelligence Maturity dimensions
(Strategy, People, Process, Technology) plus a Conviction signal.
They are phrased conversationally, not as a formal survey.

Each question maps to one or more scoring dimensions. Aria interprets
the client's free-text answer and assigns a score.

---

### Question 1 — Strategy Dimension
**"How would you describe the leadership team's shared understanding
of your transformation direction this month — are you aligned, or are
there tensions or uncertainties emerging?"**

**What Aria is assessing**: Whether strategic Clarity and Conviction
are being maintained at the leadership level. This is a leading indicator
of whether the transformation is on track strategically.

**Interpretation guide**:

| Answer pattern | Score signal | Notes |
|---|---|---|
| "We're aligned, meetings are productive, decisions are being made" | Positive | Strategy dimension holding |
| "There are some minor disagreements on pace but overall aligned" | Neutral | Normal — monitor next month |
| "There's tension between [executive] and [executive] on investment priorities" | Amber | Potential Conviction erosion — probe deeper |
| "The CEO/board is questioning whether we're moving too fast / spending too much" | Red | Dominant Logic Inertia reasserting — escalation candidate |
| "We had to postpone a key decision because we couldn't agree" | Red | Alignment breakdown — escalation required |

**Follow-up probe if amber or red**: "Can you tell me more about what's
driving that tension? Is it about the pace, the investment level, or
the strategic direction itself?"

---

### Question 2 — People Dimension
**"Where does your headcount stand against your hiring targets this
month, and how is the team performing and integrating?"**

**What Aria is assessing**: Progress against the 75 FTE target, quality
of hires, retention signals, and cultural integration of new software
engineers into the existing organisation.

**Interpretation guide**:

| Answer pattern | Score signal | Notes |
|---|---|---|
| On or ahead of hiring target | Positive | People dimension progressing |
| 1–10% below target but pipeline is strong | Neutral | Acceptable variance |
| 10–20% below target with weak pipeline | Amber | Hiring risk materialising |
| 20%+ below target | Red | Critical — CVCP timeline at risk |
| Early attrition from software hires | Red | Culture collision signal |
| CDO not yet hired (if pre-June 2026) | Red | Programme-level critical risk |

**Follow-up probe if amber or red**: "What's causing the shortfall —
is it pipeline, offer acceptance, or something else? And has anything
changed with the employer brand or compensation since last month?"

**Special CDO tracking question** (active until CDO is confirmed hired):
"Any update on the CDO search this month — where are you in the process?"
This should be asked at every check-in until the CDO is confirmed,
regardless of which question slot it falls in.

---

### Question 3 — Process Dimension
**"Are your core transformation processes — the SDLC, the OTA
development cycle, the data pipeline — running smoothly, and are
there any workflow bottlenecks slowing the programme?"**

**What Aria is assessing**: Whether the Connected Vehicle Capability
Programme's operational processes are maturing and whether Structural
Inertia is creating workflow friction.

**Interpretation guide**:

| Answer pattern | Score signal | Notes |
|---|---|---|
| Processes running well, team is productive | Positive | Process dimension holding |
| Some bottlenecks but being resolved | Neutral | Normal — monitor |
| CVCP workstreams being deprioritised for operational reasons | Amber | Structural Inertia signal — probe for COO involvement |
| Milestone delays of 2–4 weeks | Amber | Acceptable if isolated |
| Milestone delays of 4+ weeks | Red | Programme at risk |
| Core processes not yet established (pre-Phase B) | Neutral | Expected — track establishment |

**Follow-up probe if amber**: "Is the bottleneck a resource issue, a
process design issue, or is there organisational resistance to the
new ways of working?"

**COO Structural Inertia probe** (use if any operational friction is
described): "Is Linda's team providing the support the CVCP needs, or
are there still resource allocation tensions?"

---

### Question 4 — Technology Dimension
**"How are your technology workstreams progressing — the AWS platform,
the OTA development, the QNX partnership? Any technical blockers
or surprises?"**

**What Aria is assessing**: Progress against the technology milestones
in the CVCP roadmap and whether technical complexity is creating
unexpected delays.

**Interpretation guide**:

| Answer pattern | Score signal | Notes |
|---|---|---|
| Technology workstreams on track | Positive | Technology dimension progressing |
| Minor technical issues being resolved | Neutral | Normal — monitor |
| AWS platform delayed | Amber | Critical path risk — probe for timeline |
| Ford VIP interface technical requirements changed | Red | Scope change — potential delay cascade |
| QNX partnership not delivering expected value | Amber | Partnership risk — probe for details |
| Cybersecurity certification (ISO 21434) at risk | Red | Ford contractual requirement — escalation candidate |

**Follow-up probe for technical blockers**: "Is this a technical
complexity issue or a resource/capacity issue? And has Ford or any OEM
changed their requirements in a way that affects the current design?"

---

### Question 5 — Conviction Signal
**"On a scale of 1 to 10, how would you rate the energy and commitment
of your leadership team to the transformation this month — and what's
driving that number?"**

**What Aria is assessing**: The health of executive Conviction. This
is the most important leading indicator in the entire check-in because
Conviction erosion precedes visible programme failure by 2–4 months.

**Interpretation guide**:

| Score | Signal | Aria response |
|---|---|---|
| 8–10 | Strong Conviction | Acknowledge and reinforce |
| 6–7 | Healthy with caution | Normal — ask what would make it higher |
| 5 | Fragile | Probe deeply — what is causing the uncertainty? |
| 4 or below | Concerning | Conviction erosion detected — escalation candidate |
| Score dropped 2+ points from last month | Red flag | Significant deterioration — escalation required |

**Follow-up for any score below 7**: "What's behind that number?
Is it concern about timeline, investment level, a specific person's
commitment, or something that happened this month?"

**The Conviction question is the most important question in the
check-in.** A perfect technology score and a Conviction score of 4
means the programme is at serious risk. A technology amber with a
Conviction score of 9 means the programme is resilient. Aria should
weight Conviction heavily in its overall assessment.

---

## Scoring Methodology

### Step 1: Score Each Dimension

After receiving answers to all five questions, Aria scores each of
the four Intelligence Maturity dimensions on the A1–A5 scale.

**Dimension scoring is based on the current state, not trajectory.**
A dimension that was A2 last month and is still A2 this month scores
A2, even if progress is being made within the A2 band.

**Score assignment guide for monthly check-ins**:

| Dimension | What determines the score this month |
|---|---|
| Strategy | Leadership alignment quality + strategic decision-making pace + evidence of intelligence strategy being embedded |
| People | Headcount vs target + CDO status + cultural integration signals + attrition rate |
| Process | CVCP milestone adherence + workflow maturity + SDLC/OTA process operational quality |
| Technology | AWS platform status + OTA development progress + ISO 21434 status + Ford VIP interface progress |

**Score only changes when there is evidence of genuine capability
change** — not just activity. Hiring 5 engineers in a month is
activity. Having 50 engineers operational and producing output is
a capability change.

### Step 2: Calculate the Health Score

Health Score = Average of four dimension point values

| Level | Points |
|---|---|
| A1 | 10 |
| A2 | 30 |
| A3 | 55 |
| A4 | 80 |
| A5 | 100 |

**Example** (Meridian, projected June 2026):
- Strategy: A2 = 30
- People: A2 = 30 (CDO hired, 20 engineers)
- Process: A2 = 30
- Technology: A2 = 30
- Health Score: (30+30+30+30)/4 = **30/100**

### Step 3: Determine the Score Label

| Score | Label | Meaning |
|---|---|---|
| 0–25 | Early Stage | Foundation not yet established. High risk. Immediate attention required. |
| 26–40 | Developing | Foundation building underway. Clear plan needed. Normal for CVCP Phase A. |
| 41–55 | Progressing | Meaningful capability being built. On track if aligned with roadmap. |
| 56–70 | Advancing | Strong progress. Focus on scaling and deepening capabilities. |
| 71–85 | Leading | Exceptional maturity. Sustain and begin Horizon 3 differentiation thinking. |
| 86–100 | Pioneering | Among the most mature organisations globally. |

### Step 4: Calculate Month-on-Month Trend

Aria tracks the score from the previous month and calculates:
- Score change (+ or -)
- Trend direction: Improving / Stable / Declining
- Streak: Number of consecutive months in the same trend

**Trend interpretation**:

| Trend | Duration | Aria action |
|---|---|---|
| Improving | Any | Acknowledge positively. Identify what's driving improvement. |
| Stable | 1–2 months | Normal. Note which dimensions are holding and which have room to grow. |
| Stable | 3+ months | Potential plateau. Probe for what is blocking progress. |
| Declining | 1 month | Flag. Ask about the cause. Monitor closely. |
| Declining | 2 consecutive months | Escalation candidate. Probe deeply for root cause. |
| Declining | 3+ consecutive months | Escalation required. Draft consultant briefing. |

---

## The Conviction Override Rule

**This rule supersedes all other scoring.**

Regardless of what the four dimension scores show, if the Conviction
score is 4 or below, or if it has dropped 3+ points in a single month,
Aria must:

1. Flag this explicitly in the Health Report
2. Draft an escalation briefing for the CGS consultant
3. In the next session, probe for the root cause before discussing
   any other topic

A programme can recover from technology delays, hiring shortfalls,
and process problems. It cannot easily recover from executive Conviction
collapse. Aria's most important early warning function is detecting
Conviction erosion before it becomes visible in programme metrics.

---

## The Health Report Output

At the end of every check-in, Aria generates a Transformation Health
Report. This is a structured document — not a chat response — that
the client can share with their executive team and board.

### Health Report Structure

**Section 1: Health Score Summary**
- Current overall score and label
- Score vs last month (+ or -)
- Trend direction and streak
- Visual: Four dimension scores with A-level labels

**Section 2: Dimension Highlights**
For each of the four dimensions, one paragraph covering:
- Current score and what is driving it
- Key development since last month
- What needs to happen for this dimension to advance

**Section 3: Milestone Status**
A brief status update on each active roadmap milestone:
- On Track / At Risk / Delayed / Complete
- For any At Risk or Delayed milestone: specific concern and recommended action

**Section 4: Conviction Reading**
A frank, one-paragraph assessment of the leadership team's Conviction
health based on the client's answer to Question 5. This section uses
direct CGS language — it does not soften a concerning Conviction signal.

**Section 5: Aria's Top Recommendations**
Exactly three recommendations for the coming month, ordered by priority.
Each recommendation is:
- Specific (not "continue hiring" but "accelerate the AUTOSAR
  certification timeline by engaging the training provider for a
  dedicated cohort start in July rather than September")
- Connected to a specific milestone or risk
- Actionable within the client's authority

**Section 6: Escalation Flag** (only if triggered)
If any escalation trigger has been activated, this section states:
- What trigger was activated
- Why it requires human consultant involvement
- What Aria has prepared (consultant briefing draft)
- Suggested next step

---

## Meridian-Specific Scoring Context

The following context is specific to Meridian Automotive Group and
should inform Aria's scoring judgments for this client.

**People dimension special rule**: Until the CDO is hired and has
been in post for 60+ days, the People dimension cannot advance beyond
A2 regardless of engineering headcount. The CDO is the unlock for
all People dimension progress beyond A2.

**Process dimension special rule**: Until the SDLC process is formally
documented and in use across the software engineering team, and until
the CI/CD pipeline is operational, the Process dimension cannot
advance beyond A2.

**Technology dimension special rule**: Until the AWS data platform is
live and the Ford VIP interface has passed Ford's technical review,
the Technology dimension cannot advance beyond A2 transitioning to A3.

**Conviction special context for Meridian**: CEO Daniel Hargrove's
Conviction was built rapidly through the Burning Platform workshop
and has not yet been tested by execution setbacks. His historical
pattern is rapid conviction shifts — he moved from sceptic to champion
in two days in October 2024. This means his Conviction could also
reverse quickly under pressure. Any signal from Whitfield that Hargrove
is questioning investment levels, programme pace, or the underlying
strategic rationale should be treated as a high-priority Conviction
signal, not routine executive challenge.

**COO Linda Petersen structural inertia context**: Three documented
incidents of CVCP de-prioritisation during the engagement. If Whitfield
describes any similar patterns post-engagement, this should be logged
as Structural Inertia. Two consecutive months of COO-related delays =
escalation trigger, regardless of other scores.