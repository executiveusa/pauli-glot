import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StoryGeneratorInput {
  learnerLevel: string; // A1, A2, B1, B2
  targetStructures: string[]; // Grammar structures to teach
  personalizedContext?: string; // User interests, background
  ragContext?: string; // Retrieved chunks from uploaded materials
  knownVocabulary?: string[];
  tone?: 'humorous' | 'serious' | 'conversational';
}

export interface GeneratedStory {
  phaseA: string; // Anchor story
  phaseB: string; // Pattern breakdown
  phaseC: string; // Comprehension questions
  targetStructures: string[];
  knownVocabPercentage: number;
  unknownVocabPercentage: number;
  difficulty: string;
}

const SYSTEM_PROMPT = `You are an expert Spanish language acquisition specialist trained in the Natural Approach and TPRS (Teaching Proficiency through Reading and Storytelling).

Your task is to create Mexican Spanish lessons that follow this structure:

**PHASE A: Anchor Story**
- A short, engaging narrative (150-250 words)
- Uses only 1-3 new grammar structures
- 80-90% of vocabulary is comprehensible from context
- High-frequency structures repeated naturally
- Mexican Spanish (vosotros NOT used)
- No vocabulary tables, no grammar explanations
- Story should be emotionally engaging or humorous

**PHASE B: Contextual Pattern Breakdown**
- Explain ONLY the 1-3 new structures that appeared in the story
- Show meaning first, then form
- Use minimal grammatical terminology
- Provide 2-3 examples from the story
- Show the pattern: "Structure + Example = Meaning"

**PHASE C: Active Acquisition Loop**
- 3-5 comprehension questions in simple Spanish
- Questions should check understanding of the story and the new structures
- Include a cloze exercise (fill-in-the-blank)
- Ask learner to self-report: "Did you understand roughly 80-90% intuitively?"
- Ask which sentence disrupted their understanding

**CRITICAL CONSTRAINTS:**
1. NO vocabulary list before the story
2. NO grammar tables upfront
3. HIGH repetition of target structures in Phase A
4. Mexican Spanish throughout
5. Short sentences that are easy to parse
6. Personalize content to learner interests when possible
7. Use "tú" form (Mexico uses tú, not vosotros)
8. Prioritize meaning and flow over grammatical perfection in the story

OUTPUT FORMAT:
Return valid JSON with these exact keys:
{
  "phaseA": "...",
  "phaseB": "...",
  "phaseC": "...",
  "targetStructures": ["structure 1", "structure 2"],
  "knownVocabPercentage": 0.85,
  "unknownVocabPercentage": 0.15,
  "difficulty": "A2"
}`;

export async function generateStory(
  input: StoryGeneratorInput,
): Promise<GeneratedStory> {
  const userPrompt = `Create a Mexican Spanish lesson for a ${input.learnerLevel} learner.

Target structures to teach:
${input.targetStructures.map(s => `- ${s}`).join('\n')}

${input.personalizedContext ? `Learner context: ${input.personalizedContext}` : ''}

${input.knownVocabulary ? `Known vocabulary (sample): ${input.knownVocabulary.slice(0, 20).join(', ')}` : ''}

${
  input.ragContext
    ? `The learner has uploaded the following Spanish materials. Use vocabulary, themes, and settings from these excerpts to personalize the story — but adapt the language to the target CEFR level:

--- LEARNER'S UPLOADED CONTENT ---
${input.ragContext}
--- END OF CONTENT ---`
    : ''
}

Tone: ${input.tone || 'conversational'}

Create a story that teaches these structures naturally through an engaging narrative. Remember: the learner should understand the story before seeing any grammar explanation.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    const parsed = JSON.parse(content);
    return {
      phaseA: parsed.phaseA,
      phaseB: parsed.phaseB,
      phaseC: parsed.phaseC,
      targetStructures: parsed.targetStructures,
      knownVocabPercentage: parsed.knownVocabPercentage,
      unknownVocabPercentage: parsed.unknownVocabPercentage,
      difficulty: parsed.difficulty,
    };
  } catch (e) {
    // If JSON parsing fails, try to extract from the response
    console.error('Failed to parse OpenAI response as JSON:', e);
    throw new Error('Failed to parse story response');
  }
}

export async function analyzeComprehensibility(text: string): Promise<{
  estimatedLevel: string;
  estimatedKnownVocabPct: number;
  newStructures: string[];
  mexicanSpanishScore: number;
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a Spanish language assessment specialist. Analyze the given text and return JSON with:
{
  "estimatedLevel": "CEFR level (A1-C2)",
  "estimatedKnownVocabPct": number 0-1,
  "newStructures": ["structure 1", "structure 2"],
  "mexicanSpanishScore": number 0-1
}`,
      },
      {
        role: 'user',
        content: `Analyze this Spanish text:\n\n${text}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse analysis response');
  }
}
