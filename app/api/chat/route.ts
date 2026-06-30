import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { getOpenAI } from '@/lib/openai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ItemContext {
  itemType: string;
  content: string;
  answer?: string;
  sourceStory?: string;
}

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`chat:${user.id}`, 60, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached. Max 60 messages per hour.' },
      { status: 429 }
    );
  }

  try {
    const { message, itemContext, history } = (await request.json()) as {
      message: string;
      itemContext: ItemContext;
      history: ChatMessage[];
    };

    if (!message?.trim() || message.length > 2000) {
      return NextResponse.json({ error: 'Message must be 1–2000 characters' }, { status: 400 });
    }

    const systemPrompt = `You are Pauli, a warm and knowledgeable Mexican Spanish tutor. You help learners understand vocabulary, grammar, and cultural nuances.

Current review item the learner is working on:
- Type: ${itemContext.itemType}
- Content: ${itemContext.content}
${itemContext.answer ? `- Target answer: ${itemContext.answer}` : ''}
${itemContext.sourceStory ? `- From story: ${itemContext.sourceStory.slice(0, 200)}` : ''}

Your style:
- Warm, encouraging, concise (2–4 sentences unless asked for more)
- Use Mexican Spanish examples (tú form, no vosotros)
- For vocabulary: give meaning, 1 example sentence (Spanish + English), a memory tip if useful
- For grammar: explain the pattern with a simple example from everyday life
- Occasionally sprinkle a light Spanish phrase naturally (e.g., "¡Exacto!", "Muy bien")`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content ?? '';
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[chat]', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
