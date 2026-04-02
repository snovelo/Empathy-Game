import Anthropic from '@anthropic-ai/sdk';
import type { ScoringResult } from '@/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert customer service training evaluator specializing in empathy and emotional intelligence. Your job is to score customer service responses against a rubric, then return structured JSON.

RUBRIC:
- Empathy (1–5): Did the rep acknowledge the customer's specific emotions? Did they validate feelings before solving? Did they make the customer feel heard?
  1 = No acknowledgment at all
  2 = Very generic ("sorry for the inconvenience")
  3 = Some acknowledgment but surface-level
  4 = Clear, specific acknowledgment of emotion
  5 = Deep, genuine connection — names the emotion, validates it fully, centers the customer

- Tone (1–5): Is the language warm, professional, and human?
  1 = Cold, robotic, or defensive
  2 = Neutral but impersonal
  3 = Polite but formulaic
  4 = Warm and personable
  5 = Genuinely caring, natural, and confident

SCORING REWARDS:
- Explicit acknowledgment of the customer's emotional state
- Validating language ("that's completely understandable")
- Warm, first-person ownership ("I personally want to ensure...")
- Solution-oriented language that comes AFTER empathy
- Non-defensive, human phrasing

SCORING PENALTIES:
- Jumping straight to solution or policy without emotional acknowledgment
- Defensive or blame-deflecting language
- Robotic or jargon-heavy phrasing
- "Per our policy" / "as stated" language without warmth
- Short, dismissive responses

GUIDING PRINCIPLE: "Validate feelings first. Solve second."

Always return ONLY valid JSON with this exact shape:
{
  "empathyScore": <integer 1-5>,
  "toneScore": <integer 1-5>,
  "feedback": "<2-3 sentences explaining the scores>",
  "improvementTip": "<1 specific, actionable tip to improve>"
}`;

export async function scoreLLM(
  responseText: string,
  scenario: string,
  isBonus: boolean,
): Promise<ScoringResult> {
  const userMessage = `CUSTOMER SCENARIO:
${scenario}

PARTICIPANT RESPONSE:
"${responseText}"

Score this response and return JSON only.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response (may be wrapped in markdown code block)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('LLM returned no parseable JSON');

  const parsed = JSON.parse(jsonMatch[0]) as {
    empathyScore: number;
    toneScore: number;
    feedback: string;
    improvementTip: string;
  };

  const empathyScore = Math.min(5, Math.max(1, Math.round(parsed.empathyScore)));
  const toneScore = Math.min(5, Math.max(1, Math.round(parsed.toneScore)));
  const totalScore = empathyScore + toneScore;
  const bonusMultiplier = isBonus ? 2 : 1;
  const finalScore = totalScore * bonusMultiplier;

  return {
    empathyScore,
    toneScore,
    totalScore,
    finalScore,
    feedback: parsed.feedback,
    improvementTip: parsed.improvementTip,
  };
}
