-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "pauli_user" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pauli_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_learner_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nativeLanguage" TEXT NOT NULL DEFAULT 'English',
    "targetDialect" TEXT NOT NULL DEFAULT 'Mexican Spanish',
    "preferredTopics" TEXT NOT NULL DEFAULT 'travel,work,culture',
    "anxietyLevel" INTEGER NOT NULL DEFAULT 5,
    "correctionPreference" TEXT NOT NULL DEFAULT 'gentle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pauli_learner_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_learner_state" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "knownWords" TEXT NOT NULL DEFAULT '',
    "knownStructures" TEXT NOT NULL DEFAULT '',
    "emergingStructures" TEXT NOT NULL DEFAULT '',
    "fossilizedErrors" TEXT NOT NULL DEFAULT '',
    "comprehensionScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "speakingConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "listeningConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pauli_learner_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_uploaded_asset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "originalUrl" TEXT,
    "storagePath" TEXT,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_uploaded_asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_asset_chunk" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'A2',
    "detectedDialect" TEXT NOT NULL DEFAULT 'Mexican',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_asset_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_story_module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phaseA" TEXT NOT NULL,
    "phaseB" TEXT NOT NULL,
    "phaseC" TEXT NOT NULL,
    "targetStructures" TEXT NOT NULL DEFAULT '',
    "knownVocabPct" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "unknownVocabPct" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "personalizedFor" TEXT,
    "contentSource" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'A2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_story_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_story_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyModuleId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "phaseAComprehension" DOUBLE PRECISION,
    "phaseBUnderstanding" DOUBLE PRECISION,
    "phaseCResponses" TEXT,
    "userFeedback" TEXT,

    CONSTRAINT "pauli_story_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_target_structure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "mexSpanishExample" TEXT NOT NULL,
    "englishTranslation" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'A2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_target_structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_voice_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "transcript" TEXT,
    "correctionSummary" TEXT,

    CONSTRAINT "pauli_voice_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_voice_turn" (
    "id" TEXT NOT NULL,
    "voiceSessionId" TEXT NOT NULL,
    "userSpeech" TEXT NOT NULL,
    "userAudio" TEXT,
    "tutorResponse" TEXT NOT NULL,
    "tutorAudio" TEXT,
    "errorDetected" BOOLEAN NOT NULL DEFAULT false,
    "errorType" TEXT,
    "errorNote" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_voice_turn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_correction_event" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "storyModuleId" TEXT,
    "voiceSessionId" TEXT,
    "errorContent" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "correctionNote" TEXT NOT NULL,
    "recurringError" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_correction_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_srs_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT,
    "sourceStory" TEXT,
    "sourceError" TEXT,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "retrievability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pauli_srs_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pauli_review_event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "srsItemId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "responseTime" INTEGER,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pauli_review_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pauli_user_clerkId_key" ON "pauli_user"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "pauli_user_email_key" ON "pauli_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pauli_learner_profile_userId_key" ON "pauli_learner_profile"("userId");

-- CreateIndex
CREATE INDEX "pauli_learner_profile_userId_idx" ON "pauli_learner_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pauli_learner_state_userId_key" ON "pauli_learner_state"("userId");

-- CreateIndex
CREATE INDEX "pauli_uploaded_asset_userId_idx" ON "pauli_uploaded_asset"("userId");

-- CreateIndex
CREATE INDEX "pauli_asset_chunk_assetId_idx" ON "pauli_asset_chunk"("assetId");

-- CreateIndex
CREATE INDEX "pauli_story_session_userId_idx" ON "pauli_story_session"("userId");

-- CreateIndex
CREATE INDEX "pauli_story_session_storyModuleId_idx" ON "pauli_story_session"("storyModuleId");

-- CreateIndex
CREATE INDEX "pauli_voice_session_userId_idx" ON "pauli_voice_session"("userId");

-- CreateIndex
CREATE INDEX "pauli_voice_turn_voiceSessionId_idx" ON "pauli_voice_turn"("voiceSessionId");

-- CreateIndex
CREATE INDEX "pauli_srs_item_userId_idx" ON "pauli_srs_item"("userId");

-- CreateIndex
CREATE INDEX "pauli_srs_item_userId_nextReviewAt_idx" ON "pauli_srs_item"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "pauli_review_event_userId_idx" ON "pauli_review_event"("userId");

-- CreateIndex
CREATE INDEX "pauli_review_event_srsItemId_idx" ON "pauli_review_event"("srsItemId");

-- CreateIndex
CREATE INDEX "pauli_review_event_userId_createdAt_idx" ON "pauli_review_event"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "pauli_learner_profile" ADD CONSTRAINT "pauli_learner_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_learner_state" ADD CONSTRAINT "pauli_learner_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_uploaded_asset" ADD CONSTRAINT "pauli_uploaded_asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_asset_chunk" ADD CONSTRAINT "pauli_asset_chunk_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "pauli_uploaded_asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_story_session" ADD CONSTRAINT "pauli_story_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_story_session" ADD CONSTRAINT "pauli_story_session_storyModuleId_fkey" FOREIGN KEY ("storyModuleId") REFERENCES "pauli_story_module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_voice_session" ADD CONSTRAINT "pauli_voice_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_voice_turn" ADD CONSTRAINT "pauli_voice_turn_voiceSessionId_fkey" FOREIGN KEY ("voiceSessionId") REFERENCES "pauli_voice_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_correction_event" ADD CONSTRAINT "pauli_correction_event_storyModuleId_fkey" FOREIGN KEY ("storyModuleId") REFERENCES "pauli_story_module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_correction_event" ADD CONSTRAINT "pauli_correction_event_voiceSessionId_fkey" FOREIGN KEY ("voiceSessionId") REFERENCES "pauli_voice_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_srs_item" ADD CONSTRAINT "pauli_srs_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_review_event" ADD CONSTRAINT "pauli_review_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pauli_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pauli_review_event" ADD CONSTRAINT "pauli_review_event_srsItemId_fkey" FOREIGN KEY ("srsItemId") REFERENCES "pauli_srs_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
