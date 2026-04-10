# CGS Momentum

**An AI agent platform built for CGS Advisors — Ivey School of Business Hackathon**

CGS Momentum is a dual-agent platform that supports CGS Advisors at both ends of a client engagement. It qualifies and onboards prospective clients through a pre-engagement chat, and keeps past clients on track after the project ends through **Aria** — an AI alumni advisor with memory of the client's transformation journey.

---

## The Two Agents

### Pre-Engagement Chat
A lead qualification agent that engages prospective clients, surfaces their strategic challenges, and assesses fit with the CGS transformation methodology before an advisor conversation takes place.

### Aria — Alumni Advisor Agent
A post-engagement AI agent that acts as a persistent coach for past CGS clients. Aria knows the client's history, the transformation framework applied, and the gaps identified during the engagement — and uses that context to help leadership stay accountable and keep momentum after the project ends.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Frontend | Plain HTML, CSS, JavaScript |
| Config | dotenv |

---

## Project Structure

```
CGS-Advisor-Agent/
├── agent/
│   ├── pre-engagement/       # Pre-engagement lead qualification logic
│   └── post-engagement/      # Aria alumni agent logic
├── knowledge-base/
│   ├── *.md                  # CGS framework documents
│   └── clients/
│       └── CLIENT_ID/        # One folder per client — memories & context
├── ui/                       # Frontend chat interface
├── server.js                 # Express server connecting UI to agents
├── .env                      # API keys (never committed)
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

> If port 3000 is unavailable, the server will automatically try the next available port.

---

## API Endpoints

### `POST /chat`
Pre-engagement lead qualification chat.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "We're struggling with alignment across our leadership team." }
  ]
}
```

**Response:**
```json
{
  "reply": "..."
}
```

---

### `POST /alumni-chat`
Aria post-engagement agent. Requires a `clientId` to load the client's memory and context.

**Request body:**
```json
{
  "clientId": "client-abc123",
  "messages": [
    { "role": "user", "content": "We've stalled on the capability build we committed to." }
  ]
}
```

**Response:**
```json
{
  "reply": "..."
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `PORT` | Server port (default: `3000`) |
| `HOST` | Server host (default: `127.0.0.1`) |

> Never commit your `.env` file. It is listed in `.gitignore`.

---

## Team

| Name | Role |
|---|---|
| Sarah | Agent logic & backend |
| Christina | UI & design |
| Steven | Knowledge base & CGS framework |

---

*Built for the Ivey School of Business Hackathon — CGS Advisors challenge.*
