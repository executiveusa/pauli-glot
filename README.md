# AcquisitionOS: Mexican Spanish

A scientific language acquisition app grounded in **Krashen's Input Hypothesis**, **Terrell's Natural Approach**, **Ray's TPRS**, and **spaced repetition** (FSRS).

## Core Principle

> Every lesson begins with **comprehensible, personalized Mexican Spanish input** (80–90% intuitive comprehension). Grammar explanation comes **only after** you experience the pattern in context.

## MVP 1: Story Engine + Learner State + FSRS

### Completed

- ✅ **Database schema** (Prisma + SQLite) with full learner tracking
- ✅ **Story generator** using OpenAI (TPRS framework)
- ✅ **Comprehensibility scorer** to validate 80–90% comprehension target
- ✅ **FSRS scheduler** for long-term retention
- ✅ **Core API endpoints**:
  - `POST /api/lesson/generate` – Generate a TPRS lesson
  - `GET /api/review/due` – Get due SRS items
  - `POST /api/review/grade` – Grade a review and update FSRS metrics
- ✅ **Dashboard** with stats and lesson creation UI
- ✅ **Lesson player** showing Phase A (story), Phase B (patterns), Phase C (practice)

### Next Steps (MVP 2, 3)

1. **Voice tutor** – Live conversation using OpenAI Realtime API
2. **Dual subtitle player** – Watch videos with context-aware translation
3. **Correction analytics** – Track pronunciation, grammar, comprehension errors

---

## Architecture

```
app/
├── (auth)/              # Authentication (future)
├── dashboard/           # Main dashboard
├── lesson/new           # Lesson creation
├── lesson/[id]          # Lesson player
├── review/              # SRS review session
└── api/
    ├── lesson/generate  # Story generation
    ├── learner/*        # Learner profile & state
    └── review/*         # SRS management

lib/
├── ai/
│   ├── story-generator.ts       # TPRS story engine
│   └── comprehensibility-scorer.ts  # Validates ~80–90% comprehension
├── fsrs/
│   └── scheduler.ts             # FSRS scheduling algorithm
├── db/
│   └── prisma.ts                # Prisma client
└── types/
    └── index.ts                 # TypeScript interfaces

prisma/
├── schema.prisma        # Database models
└── dev.db               # SQLite database (local)

styles/
└── globals.css          # Tailwind + base styles

components/             # Reusable React components (future)
```

---

## Database Schema

**Core Models:**

- `User` – App user
- `LearnerProfile` – Goals, dialect, anxiety level, correction preference
- `LearnerState` – Known words, structures, confidence scores
- `StoryModule` – Generated lessons (Phase A, B, C)
- `StorySession` – Learner's completion of a lesson
- `TargetStructure` – Grammar patterns (e.g., "tener que + infinitive")
- `SRSItem` – Individual spaced repetition card
- `ReviewEvent` – Learner's grade on each review
- `VoiceSession` / `VoiceTurn` – Voice conversation logs
- `CorrectionEvent` – Errors detected, feedback given
- `UploadedAsset` / `AssetChunk` – User-uploaded content (PDFs, videos, etc.)

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- OpenAI API key (for story generation)

### Installation

```bash
git clone <repo>
cd pauli-glot

npm install
npm run prisma:generate
npx prisma db push --url "file:./prisma/dev.db"
```

### Setup Environment

Create `.env.local`:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# OpenAI
OPENAI_API_KEY="sk-..."

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Run Locally

```bash
npm run dev
```

Visit http://localhost:3000.

---

## How It Works

### Phase A: Anchor Story

- Short, engaging narrative (150–250 words)
- 80–90% comprehensible from context
- Teaches 1–3 target structures naturally
- Mexican Spanish (no Spain slang, no vosotros)
- No vocabulary tables, no grammar upfront

### Phase B: Contextual Pattern Breakdown

- Explain only the structures that appeared in Phase A
- Show meaning first, then form
- Use minimal grammatical terminology
- Examples straight from the story

### Phase C: Active Acquisition Loop

- Comprehension questions in simple Spanish
- Cloze exercises (fill-in-the-blank)
- Self-report: "Did you understand ~80–90%?"
- Which sentence disrupted your flow?

### SRS Scheduling

- FSRS algorithm adjusts difficulty and stability
- Reviews schedule based on **difficulty** + **stability** + **retrievability**
- Review types: cloze, audio recall, shadowing, conversation, mistake repair, micro-story
- Learner rates: 1=forget, 2=hard, 3=good, 4=easy

---

## API Routes

### Lessons

**`POST /api/lesson/generate`**

Generate a TPRS lesson.

```json
{
  "learnerLevel": "A2",
  "targetStructures": ["tener que + infinitive", "ir + a"],
  "personalizedContext": "Software engineer, interested in travel",
  "userId": "demo-user"
}
```

Response:

```json
{
  "success": true,
  "story": {
    "id": "uuid",
    "title": "Lesson: tener que + infinitive, ir + a",
    "phaseA": "...",
    "phaseB": "...",
    "phaseC": "...",
    "targetStructures": ["tener que + infinitive", "ir + a"],
    "difficulty": "A2",
    "comprehensibilityScore": {
      "overallScore": 85,
      "isComprehensible": true,
      "reasoning": "..."
    }
  }
}
```

### Reviews

**`GET /api/review/due?userId=demo-user&limit=10`**

Get due SRS items.

Response:

```json
{
  "dueItems": [
    { "id": "uuid", "itemType": "cloze", "content": "...", "difficulty": 5.0 }
  ],
  "schedule": {
    "today": 5,
    "tomorrow": 3,
    "thisWeek": 12,
    "later": 20
  }
}
```

**`POST /api/review/grade`**

Grade a review and update FSRS metrics.

```json
{
  "srsItemId": "uuid",
  "userId": "demo-user",
  "rating": 3,
  "responseTime": 2500,
  "response": "Tengo que terminar el proyecto."
}
```

Response:

```json
{
  "success": true,
  "feedback": "Great! You're building fluency with this pattern.",
  "nextReviewAt": "2026-05-27T08:00:00Z",
  "reviewCount": 5
}
```

---

## Scientific Foundation

### Krashen's Five Hypotheses

1. **Acquisition–Learning** – You acquire fluency through meaningful input, not rules.
2. **Monitor** – Conscious grammar works only with time + focus (weak for spontaneous speech).
3. **Natural Order** – Some structures are acquired before others; no curriculum can change this.
4. **Input Hypothesis** – You progress when you understand input slightly above your level (i+1).
5. **Affective Filter** – Anxiety, embarrassment, and pressure reduce acquisition efficiency.

### Natural Approach (Terrell)

- Delay forced output.
- Provide comprehensible input.
- Keep anxiety low.
- Personalize content.
- Use gestures, visuals, and context.

### TPRS (Ray)

- **Establish meaning** of target structures.
- **Tell a story** using repeated structures.
- **Read** a parallel or extended text.
- Frequent comprehension checks.
- Pop-up grammar (brief explanations after the story).

### Spaced Repetition (FSRS)

- Review items just as recall strength weakens.
- Difficulty, stability, and retrievability drive scheduling.
- Exponential review intervals (1 day, 3 days, 7 days, 14 days, ...).

---

## Testing the Story Generator

### With curl

```bash
curl -X POST http://localhost:3000/api/lesson/generate \
  -H "Content-Type: application/json" \
  -d '{
    "learnerLevel": "A2",
    "targetStructures": ["tener que + infinitive"],
    "personalizedContext": "I love travel and coffee",
    "userId": "demo-user"
  }'
```

### Via the UI

1. Go to http://localhost:3000
2. Click "Get Started" → Dashboard
3. Click "Start a New Lesson"
4. Select structures, optionally add context
5. Click "Generate Lesson"

---

## Non-Negotiable Constraints

✅ **Do**

- Keep input 80–90% comprehensible.
- Teach through story first.
- Use grammar only after context.
- Track structures, not just words.
- Personalize content.
- Delay forced speech.
- Use FSRS for retention.
- Prefer Mexican Spanish.

❌ **Don't**

- Start with grammar tables.
- Generate random vocabulary lists.
- Overcorrect live speech.
- Translate everything by default.
- Treat flashcards as the whole course.
- Overload lessons with new structures.

---

## Future Roadmap

- **Phase 1 (Done)** – Story engine + learner state + FSRS
- **Phase 2** – Voice tutor + OpenAI Realtime API
- **Phase 3** – Dual subtitle player + video ingestion
- **Phase 4** – Pronunciation + grammar analytics
- **Phase 5** – RAG over user-uploaded content
- **Phase 6** – Mobile app (React Native)
- **Phase 7** – Multimodal lessons (audio + video + text)

---

## Development

### Prisma Migrations

```bash
# Generate new migration
npx prisma migrate dev --name add_field

# Reset database (local only!)
npx prisma migrate reset

# Apply schema to database
npx prisma db push --url "file:./prisma/dev.db"
```

### Linting & Type Checking

```bash
npm run lint
npx tsc --noEmit
```

### Build for Production

```bash
npm run build
npm start
```

---

## Contributing

This project follows SLA research best practices:

- Every lesson must pass the comprehensibility scorer.
- Every SRS item must be tracked and scheduled via FSRS.
- Correction is gentle and optional; never forced.
- Grammar explanation is contextual, not a prerequisite.

---

## License

MIT

---

**Questions?** This project is documented for rapid iteration. See `/lib` for implementation details, `/app/api` for API contracts, and `/prisma/schema.prisma` for the data model.