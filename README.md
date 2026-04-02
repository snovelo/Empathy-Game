# The Empathy Game

> **Strategically Aligning With People's Emotions**
>
> A multiplayer browser-based training game for customer service agents.
> Participants read real-world scenarios, write empathetic responses, and receive instant AI-powered scores.

---

## Features

- 🎮 **Multiplayer** — anyone with a join link can participate (no account needed)
- 🤖 **Automatic scoring** — heuristic engine + optional Claude AI scoring
- ⚡ **Bonus rounds** — double-point rounds for extra challenge
- 📊 **Live leaderboard** — team scores update in near-real-time via SSE
- 🛠️ **Admin dashboard** — create sessions, advance rounds, override scores, export CSV
- 📱 **Mobile-friendly** — works on phones, tablets, and laptops
- ♿ **Accessible** — focus rings, ARIA labels, keyboard navigable

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Realtime | Server-Sent Events (SSE) |
| Scoring | Heuristic engine + optional Anthropic Claude API |
| Deployment | Vercel (recommended) |

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### 1. Clone and install

```bash
git clone <repo>
cd empathy-game
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The defaults work for local SQLite — no changes needed to run locally.

To enable AI scoring, add your Anthropic API key and set the provider:

```env
SCORING_PROVIDER="llm"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Set up the database

```bash
# Create the SQLite database and apply schema
npm run db:push

# Seed the 12 game rounds
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to Run a Game Session

### As Facilitator

1. Go to `/admin`
2. Configure session settings (timer, team visibility, etc.)
3. Click **Create Session**
4. Share the **join code** or **join link** with participants
5. Click **Start Game** when everyone is in the waiting room
6. After each round, click **Next Round →** to advance
7. View all responses on the **Submissions** tab
8. Override scores if needed using the **Override Score** button
9. **Export CSV** for post-session analysis

### As Participant

1. Go to `/join` (or use the direct link with `?code=XXXXXX`)
2. Enter your name and team
3. Wait in the lobby
4. Read the scenario and write your response
5. Submit and see your score and feedback
6. View the leaderboard after each round

---

## Project Structure

```
empathy-game/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seeded rounds/scenarios
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── join/page.tsx      # Participant join form
│   │   ├── game/[sessionId]/
│   │   │   ├── waiting/       # Waiting room
│   │   │   ├── round/         # Active round (submit response)
│   │   │   └── results/       # End-of-game results
│   │   ├── admin/
│   │   │   ├── page.tsx       # Create session
│   │   │   └── sessions/[id]/ # Admin dashboard
│   │   └── api/
│   │       ├── sessions/      # Session CRUD
│   │       ├── participants/  # Join session
│   │       ├── submissions/   # Submit & score responses
│   │       ├── export/        # CSV export
│   │       └── events/        # SSE realtime
│   ├── components/
│   │   ├── ui/                # Button, Card, Badge, Input
│   │   └── game/              # ScoreDisplay, Leaderboard, Timer
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── utils.ts           # Helpers
│   │   └── scoring/
│   │       ├── index.ts       # Provider router
│   │       ├── heuristic.ts   # Rule-based scorer
│   │       └── llm.ts         # Claude API scorer
│   └── types/index.ts         # Shared TypeScript types
```

---

## Scoring Engine

### Heuristic Scoring (default)

Works offline, no API key needed. Scores responses based on:

**Empathy (1–5):** phrase matching against a curated list of empathy indicators
- Strong hits: "I can hear how frustrated you are", "I completely understand"
- Moderate hits: "I apologize", "that must be difficult"
- Penalties: defensive language, policy-first phrasing

**Tone (1–5):** warmth and professionalism indicators
- Positive: "happy to help", "let me personally ensure", "certainly"
- Negative: robotic/generic language, short responses

### LLM Scoring (optional)

Set `SCORING_PROVIDER=llm` + `ANTHROPIC_API_KEY` to use Claude for richer, contextual feedback.

Falls back to heuristic scoring automatically if the API is unavailable.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables:
   ```
   DATABASE_URL=postgresql://...   # Supabase or Neon
   SCORING_PROVIDER=heuristic
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
4. Deploy

### PostgreSQL in Production

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then:
```bash
npx prisma migrate deploy
npm run db:seed
```

### Supabase (Optional Realtime Upgrade)

The current SSE implementation polls every 2.5 seconds. For true push updates, you can swap the SSE endpoint for Supabase Realtime subscriptions without changing the frontend API shape.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./dev.db` | Database connection string |
| `SCORING_PROVIDER` | No | `heuristic` | `heuristic` or `llm` |
| `ANTHROPIC_API_KEY` | If LLM | — | Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Base URL for join links |

---

## Disclaimer

> This app is for **internal training purposes only**. It does not provide legal, trading, investment, or brokerage advice. All scenarios are fictional and designed for educational use. Do not enter real customer data.

---

## Tradeoffs & Future Improvements

| Area | Current | Upgrade Path |
|---|---|---|
| Realtime | SSE polling (2.5s) | Supabase Realtime / Pusher |
| Auth | Session keys in localStorage | NextAuth or Clerk for accounts |
| Database | SQLite (dev) | PostgreSQL / Supabase |
| Scoring | Heuristic + Claude | Fine-tuned model, rubric calibration |
| Analytics | Basic round summary | Per-round charts, trend tracking |
| Sessions | Manual archive | Auto-archive + session templates |
