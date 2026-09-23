import { env } from '@/lib/config/env';

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

type AssistInput = {
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
};

type AssistOutput = {
  summary: string;
  tags: string[];
  examAngle: string;
  keyPoints: string[];
};

export async function generateByteAssist(input: AssistInput): Promise<AssistOutput> {
  if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured.');

  const prompt = `You are an UPSC content editor. Improve metadata for a visual study card.
Return ONLY valid JSON with this exact shape:
{"summary":"...","tags":["..."],"examAngle":"...","keyPoints":["...","...","..."]}
Rules:
- summary: 1-2 concise factual sentences, max 280 characters.
- tags: 4-8 short lowercase search tags, no hashtags.
- examAngle: one concise sentence describing where the concept helps in UPSC Prelims/Mains.
- keyPoints: exactly 3 short revision points.
- Do not invent facts. If the supplied material is insufficient, keep the wording general.

Title: ${input.title}
Category: ${input.category || 'Unknown'}
Description: ${input.description || 'Not provided'}
Existing tags: ${(input.tags || []).join(', ') || 'None'}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You produce accurate, concise UPSC revision metadata. Output JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
    cache: 'no-store',
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Groq request failed.');
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned an empty response.');

  const parsed = JSON.parse(content) as Partial<AssistOutput>;
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 500) : '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 10) : [],
    examAngle: typeof parsed.examAngle === 'string' ? parsed.examAngle.slice(0, 500) : '',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter((point): point is string => typeof point === 'string').slice(0, 3) : [],
  };
}
