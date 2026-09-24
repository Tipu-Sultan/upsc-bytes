import { env } from '@/lib/config/env';

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

type AssistInput = {
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
};

export type AssistOutput = {
  summary: string;
  tags: string[];
  examAngle: string;
  keyPoints: string[];
};

async function callGroq(prompt: string, system: string): Promise<AssistOutput> {
  if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured.');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.GROQ_MODEL || DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    }),
    cache: 'no-store',
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || 'Groq request failed.');
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned an empty response.');
  const parsed = JSON.parse(content) as Partial<AssistOutput>;
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 700) : '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 10) : [],
    examAngle: typeof parsed.examAngle === 'string' ? parsed.examAngle.slice(0, 700) : '',
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter((point): point is string => typeof point === 'string').slice(0, 5) : [],
  };
}

export async function generateByteAssist(input: AssistInput): Promise<AssistOutput> {
  return callGroq(`You are an UPSC content editor. Return ONLY valid JSON with this exact shape:\n{"summary":"...","tags":["..."],"examAngle":"...","keyPoints":["...","...","..."]}\nRules:\n- summary: 1-2 concise factual sentences, max 400 characters.\n- tags: 4-8 short lowercase search tags, no hashtags.\n- examAngle: one concise sentence describing where the concept helps in UPSC Prelims/Mains.\n- keyPoints: exactly 3 short revision points.\n- Do not invent facts.\n\nTitle: ${input.title}\nCategory: ${input.category || 'Unknown'}\nDescription: ${input.description || 'Not provided'}\nExisting tags: ${(input.tags || []).join(', ') || 'None'}`, 'You produce accurate, concise UPSC revision metadata. Output JSON only.');
}

export async function generateByteStudy(input: AssistInput): Promise<AssistOutput> {
  return callGroq(`You are the study-explanation engine for UPSC Bytes. Turn the supplied visual/post metadata into a useful UPSC revision note. Return ONLY valid JSON with this exact shape:\n{"summary":"...","tags":["..."],"examAngle":"...","keyPoints":["...","...","...","..."]}\nRules:\n- summary: 2-4 factual sentences that explain the topic clearly to a UPSC aspirant.\n- examAngle: explain how the topic connects to Prelims and/or Mains, without inventing a syllabus link.\n- keyPoints: 4-6 concise, high-value revision points.\n- tags: 4-8 lowercase topic tags.\n- If the source is incomplete, explicitly stay within the provided facts instead of guessing.\n\nTitle: ${input.title}\nCategory: ${input.category || 'Unknown'}\nDescription: ${input.description || 'Not provided'}\nExisting tags: ${(input.tags || []).join(', ') || 'None'}`, 'You are an accurate UPSC study-note writer. Never fabricate facts. Output JSON only.');
}
