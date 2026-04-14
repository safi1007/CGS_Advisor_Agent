# Board Meeting Briefing Template
**CGS Momentum — Aria Capability Data**
**Version 1.0 · February 2026**

---

## Purpose

This template defines the structure, content, tone, and length of
the board briefing documents that Aria generates when a client mentions
an upcoming board meeting or investor presentation. It is one of Aria's
highest-value agentic outputs — a professionally structured document
that would previously have required a CGS consultant or senior internal
strategist to prepare.

Aria uses this template in combination with the client's project memory,
current Health Check-in data, and any context the client provides about
the specific board meeting to generate a customised, client-specific
briefing document.

---

## When Aria Generates a Board Briefing

Aria initiates board briefing generation when the client says anything
that signals an upcoming board, executive, or investor presentation:

**Trigger phrases**:
- "I have a board meeting coming up"
- "We're presenting to the board next month"
- "Northlake wants an update"
- "I need to prepare for our quarterly executive review"
- "The investors are coming in next week"
- "I need to brief the CEO on programme status"
- "We have a steering committee presentation"

**Aria's response to these triggers**:
Before generating the briefing, Aria asks three targeted questions:

1. "When is the meeting and who specifically will be in the room?"
2. "What is the primary question they will be asking — are they
   looking for a progress update, a go/no-go decision, or something
   else?"
3. "Is there anything specific that has happened since our last
   check-in that you want the briefing to address?"

These three questions give Aria enough context to customise the
template for the specific meeting. Aria should not ask more than
three questions — the client is busy and the briefing should be
generatable from the project memory plus minimal additional input.

---

## Board Briefing Document Structure

### Document Header
[CLIENT COMPANY NAME]
Transformation Progress Briefing
[BOARD / INVESTOR / STEERING COMMITTEE] — [DATE]
Prepared by: [CLIENT NAME], [TITLE]
Intelligence support: CGS Momentum / Aria
CONFIDENTIAL
---

### Section 1: Executive Summary (half page maximum)

**Purpose**: Give the reader the complete picture in 90 seconds.
Board members and investors often read only this section.

**Content**:
- One sentence stating where the transformation stands overall
  (use the Health Score label and number: "Meridian's transformation
  is currently Developing at 30/100, on track with the CGS projected
  trajectory")
- Two sentences on what has been achieved since the last briefing
- One sentence on the single most important upcoming milestone
- One sentence on the primary risk and what is being done about it

**Tone**: Direct, confident, and honest. No hedging. No corporate
speak. The executive summary should sound like a briefing from
someone who knows the situation completely and is not afraid to
state it clearly.

**Aria instruction**: Pull the current Health Score and label from
the most recent check-in. Pull the most recently completed milestone
from the roadmap. Pull Risk #1 from the project summary open risks.
Customise with any context the client provided about what has changed.

---

### Section 2: Transformation Status — The Four Dimensions (one page)

**Purpose**: Give the board a clear, structured view of where the
organisation stands across the four Intelligence Maturity dimensions.

**Format**: A 2x2 or linear layout with each dimension showing:
- Current A-level score
- One-sentence description of what that means
- What needs to happen to advance to the next level
- Traffic light status: Green (on projected trajectory),
  Amber (slightly behind), Red (at risk)

**Content for each dimension**:

**Strategy**
Current score: [A-level]
Status: [Green/Amber/Red]
This month: [One sentence on what happened in the Strategy dimension]
To advance: [One sentence on what is needed for the next level]

**People**
Current score: [A-level]
Status: [Green/Amber/Red]
This month: [Headcount update — X of 75 FTE target hired]
CDO status: [Hired and onboarded / Search in progress / Not yet started]
To advance: [One sentence on what is needed]

**Process**
Current score: [A-level]
Status: [Green/Amber/Red]
This month: [SDLC/OTA/CI-CD status in one sentence]
To advance: [One sentence on what is needed]

**Technology**
Current score: [A-level]
Status: [Green/Amber/Red]
This month: [AWS/OTA/ISO 21434/Ford VIP status in one sentence]
To advance: [One sentence on what is needed]

**Aria instruction**: Pull dimension scores from the most recent
Health Check-in. Pull milestone status from the roadmap. Traffic
light assignment: Green = on projected trajectory ± 2 weeks.
Amber = 2–6 weeks behind projected trajectory. Red = 6+ weeks
behind or a milestone has been missed.

---

### Section 3: Milestone Scorecard (one page)

**Purpose**: Give the board a concrete, visual account of programme
progress against the agreed roadmap.

**Format**: A table with all active and recently completed milestones.
**Format**: A table with all active and recently completed milestones.

```
| Milestone                  | Target Date  | Status              | Notes                        |
|---------------------------|--------------|---------------------|------------------------------|
| A1: CDO Hired              | May 31, 2026 | In Progress         | 3 candidates shortlisted     |
| A2: CVCP Governance Launch | May 15, 2026 | Complete            | ✓                            |
| A3: 20 Engineers Hired     | Jun 30, 2026 | In Progress         | 6 hired, 14 in pipeline      |
| A4: Employer Brand Live    | Jun 15, 2026 | In Progress         | Agency briefed               |
| A5: AWS Data Contract      | May 31, 2026 | In Progress         | Contract review underway     |
| B1: CDO First 90 Days      | Aug 31, 2026 | Not Started         | Awaiting A1 completion       |
| B2: 50 Engineers Hired     | Aug 31, 2026 | Not Started         | Awaiting CDO hire            |
| B3: AUTOSAR Cert x20       | Sep 30, 2026 | Not Started         | Training provider engaged    |
| B4: AWS Data Platform Live | Sep 30, 2026 | Not Started         | Contract pending             |
| B5: OTA Capability Built   | Oct 31, 2026 | Not Started         | Design phase not yet started |
| B6: QNX Partnership Live   | Aug 31, 2026 | In Progress         | LOI signed Jan 28, 2026      |
| B7: ISO 21434 Certified    | Oct 31, 2026 | Not Started         | Gap analysis not started     |
| C1: Ford OTA Pilot         | Nov 30, 2026 | Not Started         | Dependent on B4 + B5         |
| C2: 75 Engineers Hired     | Dec 31, 2026 | Not Started         | Dependent on B2              |
| C3: Ford VIP Interface     | Dec 31, 2026 | Not Started         | Dependent on C1              |
| C4: Health Score 65/100    | Jan 31, 2027 | Not Started         | Programme-wide target        |
| D1: Ford VIP Validated     | Mar 31, 2027 | Not Started         | Primary programme deliverable|
| D2: CVCP Complete          | Apr 30, 2027 | Not Started         | Ford model year 2027 deadline|
```

**Status options**:
- ✓ Complete
- In Progress — On Track
- In Progress — At Risk
- Delayed — [reason in one phrase]
- Not Started — [expected start date]

**Aria instruction**: Pull all Phase A and B milestones from the
roadmap file. Assign status based on the most recent check-in answers
and any client context provided. Never leave the Notes column empty
for In Progress milestones — always include one specific detail.

---

### Section 4: Financial Snapshot (half page)

**Purpose**: Connect programme progress to financial outcomes.
Board members and investors think financially. Every operational
update needs a financial translation.

**Content**:

**Programme investment to date**:
- Total CVCP budget: $12.4M
- Spent to date: [amount — calculate from programme timeline]
- Remaining: [amount]
- Projected final cost vs budget: [on budget / X% over/under]

**Revenue protection status**:
- Ford revenue at risk (total): $820M annually
- Status of Ford VIP certification: [on track for April 2027 /
  at risk — projected date / complete]
- Estimated revenue at risk if Ford deadline missed: [calculate
  from "Slow Response" scenario in project summary]

**Investment return projection**:
- Enterprise value increase from transformation (CGS model):
  From 5.2x EBITDA (pre-transformation) to projected 8.4x EBITDA
  (post-transformation)
- Net value creation at current revenue and margin: [calculate]

**Aria instruction**: The financial figures in the project summary
(The Cliff analysis, the Northlake enterprise value model) are the
source of truth for this section. Pull the investment to date from
the programme timeline (CVCP launched May 2026, spending rate
approximately $880K/month). Update revenue protection status based
on Ford VIP milestone progress.

---

### Section 5: Top Three Risks (half page)

**Purpose**: Give the board an honest, prioritised view of what
could go wrong and what is being done about it.

**Format**: Three risks only. More than three creates noise and
signals unclear prioritisation to the board.

For each risk:
- Risk name and one-sentence description
- Likelihood: High / Medium / Low
- Impact if materialised: High / Medium / Low
- Current mitigation action
- Owner

**Risk selection**: Aria selects the three highest-priority risks
from the project summary open risks list, updated with any new
context from the most recent check-in.

**Tone**: Honest and specific. Do not soften risks for a board
audience. A board that is surprised by a risk that management knew
about loses confidence in management. A board that is briefed on
real risks with credible mitigation actions gains confidence.

**Standard Risk 1 for Meridian briefings (until CDO is hired)**:
Risk: CDO Hire Delay
The CVCP programme timeline has a hard dependency on the CDO being
hired and functional by May 31, 2026. Every 6 weeks of delay
cascades approximately 4 weeks across Phase B milestones.
Likelihood: Medium (search is active, 3 candidates shortlisted)
Impact: High (Ford deadline at risk if delay exceeds 10 weeks)
Mitigation: Spencer Stuart search on accelerated timeline.
Weekly steering committee review of search status.
Bridget Larson (interim programme director) providing continuity.
Owner: Daniel Hargrove / Sandra Okafor
---

### Section 6: Decisions Required from This Meeting (quarter page)

**Purpose**: Make it explicit what the board or investor group is
being asked to decide, approve, or endorse. This is the most
important section for the client — it is the reason the meeting exists.

**Format**: A numbered list of maximum three decisions.

Each decision item includes:
- The specific decision to be made
- The recommended option (from management's perspective)
- The consequence of not deciding at this meeting

**Examples of decision types Aria might identify**:
- Approve additional budget for a scope expansion
- Endorse a change to the CDO search criteria
- Approve the Northlake exit timing conversation
- Endorse the BMW engagement strategy for Horizon 2
- Approve the remote work policy extension to additional roles

**If no decisions are required**: State explicitly: "No decisions
are required from this meeting. This is a progress briefing. Management
is seeking the board's endorsement of the current direction and
awareness of the risks outlined above."

**Aria instruction**: Ask the client in the pre-briefing questions
what they need from the meeting. If they say "just an update," use
the "no decisions required" language. If they identify a decision,
structure it using the format above.

---

### Section 7: Appendix (optional, include only if client requests)

**A: Full Roadmap Milestone Table**
Complete milestone list from the CVCP roadmap, with all statuses.

**B: The Cliff — Revenue At Risk Analysis**
David Park's three-scenario revenue projection from the CGS engagement.
Updated with current timeline status.
Note: "This analysis was prepared by CGS Advisors in October 2024
and updated for this briefing based on current programme status."

**C: Transformation Health Score Trend**
Monthly Health Score history showing the trend since CGS Momentum
activation (February 2026 to present).

**D: Intelligence Maturity Model Reference**
A one-page summary of the A1–A5 model for board members who need
context for the dimension scores.

---

## Tone and Language Guide for Board Briefings

**Always use**:
- Active voice: "The team hired 6 engineers" not "6 engineers were hired"
- Specific numbers: "23 of 75 target FTEs" not "approximately a third"
- Honest traffic lights: if something is at risk, call it at risk
- CGS framework language: "Structural Inertia," "Dominant Logic,"
  "Intelligence Maturity" — the board has been briefed on these
  and the consistent language reinforces the strategic narrative
- Present tense for current status, future tense for projections

**Never use**:
- Corporate hedging: "we are cautiously optimistic" / "broadly on track"
- Passive voice when something went wrong: own it directly
- Jargon the board hasn't been introduced to
- More than three risks, three recommendations, or three decisions
  in their respective sections — prioritisation is management's job
- Qualifiers that obscure reality: "somewhat" / "relatively" /
  "in most respects"

**On the financial section specifically**:
Always connect programme status to the revenue-at-risk analysis
from the CGS engagement. The board approved this investment because
of The Cliff — the revenue at risk if Meridian fails to transform.
Every briefing should remind the board what that risk is and how
the programme is mitigating it.

---

## Meridian-Specific Briefing Notes

**For Northlake Growth Capital briefings**:
Lead with enterprise value creation. Rachel Yoon thinks in multiples
and investment returns. Open with the current projected exit multiple
(should be improving as the transformation progresses) before any
operational detail. Close with the narrative: "Every milestone we
hit in the CVCP adds to the enterprise value story. Here is where
we are against that trajectory."

**For family board members (Hargrove family)**:
Lead with legacy and competitive position. Thomas Hargrove (founder)
cares about what Meridian stands for and whether it will survive.
Frame the transformation in terms of protecting what the family built:
"Meridian's transformation is the decision that ensures the company
your father built remains competitive for another 37 years."

**For the executive steering committee** (monthly internal):
More operational detail than a board briefing. Include the full
milestone table, the headcount detail, and the process status.
Less financial framing — this audience knows the financials.
More focus on what decisions or unblocking they can provide.

**On Daniel Hargrove's communication style**:
He does not read long documents. If Whitfield is presenting to
Hargrove alone, prepare a one-page version of Section 1 (Executive
Summary), Section 3 (Milestone Scorecard), and Section 5 (Top Three
Risks) only. Everything else in appendix. Hargrove will ask
for more detail if he wants it.