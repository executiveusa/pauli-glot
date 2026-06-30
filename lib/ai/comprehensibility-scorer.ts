import { getOpenAI } from '@/lib/openai';

export interface ComprehensibilityScore {
  overallScore: number; // 0-100
  isComprehensible: boolean; // >= 80 counts as comprehensible
  reasoning: string;
  knownVocabPercentage: number;
  unknownVocabPercentage: number;
  contextSupport: 'high' | 'medium' | 'low';
  cognitiveLoad: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export async function scoreComprehensibility(
  text: string,
  learnerLevel: string,
  learnerContext?: string,
): Promise<ComprehensibilityScore> {
  const prompt = `You are an SLA (Second Language Acquisition) expert evaluating if a Spanish text is comprehensible for a learner.

Learner level: ${learnerLevel}
${learnerContext ? `Learner context: ${learnerContext}` : ''}

TEXT TO EVALUATE:
${text}

Evaluate comprehensibility using these criteria:
1. Known vocabulary: How much of the vocabulary is appropriate for this level?
2. Unknown vocabulary: Are new words explainable from context?
3. Sentence length and complexity: Are sentences short and parseable?
4. Grammar density: Are there too many new structures?
5. Context support: Can meaning be inferred from context?
6. Emotional load: Is the content low-pressure and engaging?

Return ONLY valid JSON (no markdown, no code blocks):
{
  "overallScore": 0-100,
  "isComprehensible": boolean,
  "reasoning": "explanation",
  "knownVocabPercentage": 0-1,
  "unknownVocabPercentage": 0-1,
  "contextSupport": "high|medium|low",
  "cognitiveLoad": "low|medium|high",
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert in comprehensible input and language acquisition. Your job is to evaluate whether Spanish text is comprehensible for learners. Always respond with valid JSON only.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Try to extract JSON if wrapped in markdown
    let jsonStr = content.trim();
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0];
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0];
    }
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error('Failed to parse comprehensibility score:', e);
    // Return a conservative default if parsing fails
    return {
      overallScore: 50,
      isComprehensible: false,
      reasoning: 'Unable to evaluate - please review text manually',
      knownVocabPercentage: 0.5,
      unknownVocabPercentage: 0.5,
      contextSupport: 'medium',
      cognitiveLoad: 'high',
      recommendations: ['Simplify sentence structure', 'Reduce new vocabulary'],
    };
  }
}
