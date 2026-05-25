# AcquisitionOS Roadmap

## Completed (MVP 1) ✅

- **Story Engine + Learner State + FSRS**
  - TPRS story generation (Phase A/B/C)
  - Comprehensibility scorer (80-90% validation)
  - FSRS spaced repetition scheduler
  - Prisma + SQLite database
  - Core API endpoints
  - Dashboard + lesson creation UI

---

## Remaining Phases

### Phase 2: Upload & RAG (Content Ingestion)
**Objective:** Allow learners to upload personal content and extract lessons from it.

**Features:**
- [ ] Accept PDFs, video transcripts, subtitles (SRT/WebVTT), audio files
- [ ] Extract text and embed chunks using pgvector
- [ ] Detect CEFR level and Mexican Spanish usage
- [ ] Generate mini-lessons from uploaded content
- [ ] Save asset chunks with difficulty scores
- [ ] Vector search over learner's personal materials

**Dependencies:** pgvector, file upload handler, vector embeddings

**Estimated Effort:** 2-3 weeks

---

### Phase 3: Voice Tutor (Live Conversation)
**Objective:** Real-time Spanish conversation with gentle, intelligent feedback.

**Features:**
- [ ] OpenAI Realtime API for WebRTC voice
- [ ] Live speech-to-text transcription
- [ ] Conversational agent responds in learner's level
- [ ] Error detection (pronunciation, grammar, comprehension)
- [ ] Gentle in-the-moment recasting
- [ ] Post-session error summary
- [ ] Generate SRS items from repeated mistakes

**Dependencies:** OpenAI Realtime API, WebRTC, audio processing

**Estimated Effort:** 3-4 weeks

---

### Phase 4: Dual Subtitle Player
**Objective:** Watch videos with on-demand translation and context support.

**Features:**
- [ ] Upload or paste SRT/WebVTT subtitles
- [ ] Spanish subtitle always visible
- [ ] English subtitle (tap-to-reveal or toggle)
- [ ] Click phrase → save to SRS
- [ ] Generate micro-lesson from scene
- [ ] Replay sentence audio
- [ ] Auto-generate easier paraphrase

**Dependencies:** Subtitle parser, audio replay, phrase extraction

**Estimated Effort:** 2-3 weeks

---

### Phase 5: Pronunciation & Correction Analytics
**Objective:** Track and analyze learner errors over time.

**Features:**
- [ ] Pronunciation scoring (OpenAI or Whisper confidence)
- [ ] Grammar error classification
- [ ] Comprehension error tracking
- [ ] Recurring error detection
- [ ] Error heatmap (which structures/sounds are hard?)
- [ ] Personalized focus areas
- [ ] Adaptive lesson generation based on errors

**Dependencies:** Audio analysis, error classification, analytics dashboards

**Estimated Effort:** 3-4 weeks

---

### Phase 6: Authentication & Multi-User
**Objective:** Real user accounts, progress tracking, data persistence.

**Features:**
- [ ] Clerk or Supabase Auth
- [ ] User registration + email verification
- [ ] Progress sync across devices
- [ ] Export learner state (CSV/JSON)
- [ ] Backup & restore
- [ ] Privacy & GDPR compliance

**Dependencies:** Auth provider, session management

**Estimated Effort:** 1-2 weeks

---

## Skill Recommendations

### Best Skill for This Project: **`run`**
- Launches dev server after each phase
- Tests new features in browser immediately
- Catches UI/UX issues early
- Verifies API endpoints work in real app context

### Secondary Skills

| Skill | Use Case |
|-------|----------|
| `claude-api` | Build custom agents for error analysis, personalization |
| `code-review` | Review phase implementations before merge |
| `security-review` | Audit before Phase 6 (auth) goes live |
| `verify` | Confirm each phase meets pedagogical constraints |

---

## Build Sequence

1. ✅ Phase 1: Story engine + FSRS
2. ⬜ Phase 2: Upload/RAG
3. ⬜ Phase 3: Voice tutor
4. ⬜ Phase 4: Subtitle player
5. ⬜ Phase 5: Analytics
6. ⬜ Phase 6: Auth + multi-user

**Critical Path:** Phases 2 → 3 → 5 → 6 (voice depends on story engine being solid)

---

## Testing Checklist

Each phase must pass:

- [ ] **Comprehensibility** – Lessons validate at 80-90%
- [ ] **FSRS Accuracy** – Scheduling matches difficulty curves
- [ ] **Mexican Spanish** – No Spain slang, vosotros, or generic patterns
- [ ] **Affective Filter** – Correction is gentle, optional, low-pressure
- [ ] **Personalization** – Content adapts to learner interests
- [ ] **SLA Grounding** – Every feature backed by research (Krashen, Terrell, Ray, FSRS)

---

## Quick Reference

**Phase 2 Entry Point:** `lib/upload/` + `app/api/upload/`  
**Phase 3 Entry Point:** `lib/voice/` + `app/voice/` + OpenAI Realtime config  
**Phase 4 Entry Point:** `components/SubtitlePlayer.tsx` + `app/video/`  
**Phase 5 Entry Point:** `lib/analytics/` + dashboard charts  
**Phase 6 Entry Point:** Auth provider + `app/(auth)/`  
