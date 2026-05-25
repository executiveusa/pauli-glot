# MCP Reference Guide for AcquisitionOS

This document maps useful patterns from `modelcontextprotocol/ext-apps` to each phase of AcquisitionOS.

**Cloned Repo:** `/tmp/ext-apps/`

---

## Phase 2: Upload & RAG

### Relevant Examples
- **`pdf-server`** – PDF ingestion, text extraction, chunking
  - Pattern: Parse file → chunk → embed → store
  - Useful for: PDF lesson materials
  
- **`transcript-server`** – Process transcripts with structured data
  - Pattern: Ingest text → parse structure → extract meaning
  - Useful for: Video transcript processing
  
- **`video-resource-server`** – Handle video metadata and resources
  - Pattern: Manage file metadata, indexing, retrieval
  - Useful for: Subtitle and video file management

### Implementation Guide
```
lib/upload/
├── file-parser.ts        (Use pdf-server patterns)
├── chunk-embedder.ts     (Vector embeddings)
├── difficulty-scorer.ts  (Analyze CEFR level)
└── asset-manager.ts      (Database ops)

app/api/upload/
├── route.ts              (File handler)
└── process.ts            (Async processing)
```

---

## Phase 3: Voice Tutor

### Relevant Examples
- **`transcript-server`** – Parse and analyze speech
  - Pattern: Ingest audio/transcripts → structure data → analyze
  - Useful for: Speech-to-text processing
  
- **`basic-server-react`** – Real-time bidirectional communication
  - Pattern: WebSocket setup, message routing, state management
  - Useful for: Live conversation framework

### Implementation Guide
```
lib/voice/
├── openai-realtime.ts    (Realtime API wrapper)
├── tutor-agent.ts        (Conversational logic)
├── error-detector.ts     (Grammar/pronunciation analysis)
└── feedback-generator.ts (Gentle correction logic)

app/voice/
└── route.ts              (WebSocket handler)
```

---

## Phase 4: Dual Subtitle Player

### Relevant Examples
- **`transcript-server`** – Parse structured data (transcripts)
  - Pattern: Ingest → parse format → expose via API
  - Useful for: SRT/WebVTT parsing
  
- **`video-resource-server`** – Manage media assets and metadata
  - Pattern: Resource management, metadata associations
  - Useful for: Link subtitles to videos

- **`basic-server-react`** – Interactive UI with media controls
  - Pattern: Real-time UI updates, media playback
  - Useful for: Player UI framework

### Implementation Guide
```
components/
├── SubtitlePlayer.tsx    (React player)
├── SubtitleTrack.tsx     (Single track)
└── TranslationToggle.tsx (Tap-to-reveal English)

lib/subtitles/
├── parser.ts             (SRT/WebVTT parsing)
├── phrase-extractor.ts   (Save phrase → SRS item)
└── context-generator.ts  (Generate micro-lesson)

app/api/subtitles/
└── parse.ts              (Parse uploaded subtitles)
```

---

## Phase 5: Pronunciation & Analytics

### Relevant Examples
- **`cohort-heatmap-server`** – Visualize multi-dimensional data
  - Pattern: Aggregate data → heatmap visualization
  - Useful for: Error pattern heatmap ("which sounds/structures are hard?")
  
- **`customer-segmentation-server`** – Segment and analyze learners
  - Pattern: Cluster data → generate insights
  - Useful for: Personalized focus areas (which learner types struggle with what?)
  
- **`system-monitor-server`** – Real-time monitoring and metrics
  - Pattern: Track metrics over time → dashboard display
  - Useful for: Progress tracking, error frequency monitoring

### Implementation Guide
```
lib/analytics/
├── error-classifier.ts    (Grammar, pronunciation, comprehension)
├── pattern-detector.ts    (Recurring errors)
├── learner-profiler.ts    (Weak areas analysis)
└── recommendation-engine.ts (Adaptive lesson focus)

app/analytics/
├── dashboard/
│   ├── error-heatmap.tsx  (Which structures/sounds are hard)
│   ├── progress-chart.tsx (Comprehension over time)
│   └── focus-areas.tsx    (Recommended next lessons)
└── api/
    └── analyze.ts         (Compute analytics)
```

---

## Phase 6: Auth & Multi-User

### Relevant Patterns
- **`basic-server-react`** – State management with real-time sync
  - Pattern: User state → persistence → sync
  - Useful for: Session management, learner state sync

- **`integration-server`** – Multi-service integration
  - Pattern: External auth provider integration
  - Useful for: Clerk/Supabase Auth integration

### Implementation Guide
```
app/(auth)/
├── login/
├── register/
└── callback.ts

lib/auth/
├── session.ts            (Session management)
└── permissions.ts        (User roles/access)

api/auth/
└── route.ts              (Auth provider callback)
```

---

## Architecture Patterns from ext-apps

### 1. **File Processing Pipeline**
```
Input → Validate → Parse → Chunk → Embed → Store → Index
```
Use for: Phase 2 (upload) and Phase 4 (subtitles)

### 2. **Real-Time Communication**
```
Client → WebSocket → Server → OpenAI/Service → Response → Stream back
```
Use for: Phase 3 (voice tutor)

### 3. **Data Aggregation & Visualization**
```
Collect Data → Aggregate → Analyze → Visualize → Recommend
```
Use for: Phase 5 (analytics)

### 4. **Resource Management**
```
Upload → Store Metadata → Index → Retrieve → Display
```
Use for: All phases (centralize in `lib/resources/`)

---

## Recommended Learning Path

1. **Start with `pdf-server` example** → understand file chunking
2. **Study `basic-server-react` example** → WebSocket + React patterns
3. **Review `transcript-server` example** → text parsing + structure
4. **Explore `cohort-heatmap-server`** → data visualization patterns
5. **Check `integration-server`** → external service integration

---

## Testing Patterns from ext-apps

The ext-apps repo uses:
- Unit tests (Jest)
- Integration tests (file processing end-to-end)
- Example servers (runnable demonstrations)

**For AcquisitionOS:**
```
tests/
├── phases/
│   ├── phase2-upload.test.ts
│   ├── phase3-voice.test.ts
│   └── phase5-analytics.test.ts
└── integration/
    └── end-to-end.test.ts
```

---

## Quick Reference: Which Example Maps to Which Phase?

| Phase | Example | Key Pattern |
|-------|---------|------------|
| 2 | `pdf-server`, `transcript-server` | File parsing + chunking |
| 3 | `basic-server-react`, `transcript-server` | WebSocket + real-time |
| 4 | `transcript-server`, `video-resource-server` | Subtitle parsing + media mgmt |
| 5 | `cohort-heatmap-server`, `system-monitor-server` | Data aggregation + visualization |
| 6 | `basic-server-react`, `integration-server` | State sync + auth integration |

---

## Next Steps

1. Run `/tmp/ext-apps/examples/` locally to see each pattern in action
2. Copy relevant TypeScript patterns into `lib/` as we build each phase
3. Reference `src/app.ts` for message protocol if building MCP servers
4. Use `/tmp/ext-apps/tests/` as template for our test suite

---

*Reference cloned from: `https://github.com/modelcontextprotocol/ext-apps`*
