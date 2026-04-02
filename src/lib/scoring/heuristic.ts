import type { ScoringResult } from '@/types';

// ─── Phrase lists ─────────────────────────────────────────────────────────────

const EMPATHY_STRONG = [
  "i completely understand",
  "i fully understand",
  "i truly understand",
  "i can only imagine",
  "i can hear how",
  "i can see how",
  "i can see why",
  "that must be",
  "must feel",
  "you must be",
  "i'm so sorry",
  "i am so sorry",
  "deeply sorry",
  "sincerely apologize",
  "i sincerely",
  "i genuinely",
  "i truly",
  "you deserve better",
  "you shouldn't have to",
  "you should never have",
  "that's completely understandable",
  "that is completely understandable",
  "i take full",
  "i take personal",
  "i personally",
  "i want to make this right",
  "let me make this right",
  "i'll make sure",
  "i will make sure",
  "feel heard",
  "feel valued",
];

const EMPATHY_MODERATE = [
  "i understand",
  "i can understand",
  "i apologize",
  "i'm sorry",
  "i am sorry",
  "i hear you",
  "you're right",
  "you are right",
  "that's frustrating",
  "that is frustrating",
  "that's disappointing",
  "that is disappointing",
  "frustrating",
  "disappointing",
  "upsetting",
  "i acknowledge",
  "i recognize",
  "i understand your frustration",
  "completely valid",
  "your feelings",
  "your concern",
  "your experience",
  "i know how",
  "this must",
  "how difficult",
];

const TONE_POSITIVE = [
  "happy to help",
  "here to help",
  "let me help",
  "i'd love to",
  "i would love to",
  "we want to make this right",
  "make this right",
  "right away",
  "immediately",
  "top priority",
  "first priority",
  "as a priority",
  "certainly",
  "absolutely",
  "of course",
  "thank you for",
  "appreciate your",
  "we value",
  "you are valued",
  "you're a valued",
  "together",
  "personally",
  "personally ensure",
  "i will personally",
  "i'll personally",
  "we can",
  "i can",
  "let me",
  "allow me",
  "please know",
  "want you to know",
];

const PENALTY_PHRASES = [
  "per our policy",
  "as per",
  "as stated",
  "policy states",
  "policy says",
  "according to policy",
  "you should have",
  "you need to",
  "you must have",
  "you were supposed to",
  "there is nothing we can do",
  "there's nothing we can do",
  "nothing i can do",
  "not our fault",
  "not our problem",
  "not responsible",
  "please be patient",
  "wait your turn",
  "at this time we cannot",
  "we are unable to",
  "we cannot accommodate",
  "that is not possible",
  "that's not possible",
  "as i already said",
  "as i mentioned",
  "as i stated",
  "i already told you",
];

// ─── Scorer ───────────────────────────────────────────────────────────────────

export function scoreHeuristic(
  responseText: string,
  isBonus: boolean,
): ScoringResult {
  const text = responseText.toLowerCase().trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // --- Empathy scoring
  const strongHits = EMPATHY_STRONG.filter((p) => text.includes(p)).length;
  const moderateHits = EMPATHY_MODERATE.filter((p) => text.includes(p)).length;

  let empathyScore = 1;
  if (strongHits >= 3 || (strongHits >= 2 && moderateHits >= 2)) {
    empathyScore = 5;
  } else if (strongHits >= 2 || (strongHits >= 1 && moderateHits >= 2)) {
    empathyScore = 4;
  } else if (strongHits >= 1 || moderateHits >= 3) {
    empathyScore = 3;
  } else if (moderateHits >= 1) {
    empathyScore = 2;
  }

  // --- Tone scoring
  const toneHits = TONE_POSITIVE.filter((p) => text.includes(p)).length;

  let toneScore = 1;
  if (toneHits >= 4) {
    toneScore = 5;
  } else if (toneHits >= 3) {
    toneScore = 4;
  } else if (toneHits >= 2) {
    toneScore = 3;
  } else if (toneHits >= 1 || wordCount >= 40) {
    toneScore = 2;
  }

  // --- Penalties
  const penaltyHits = PENALTY_PHRASES.filter((p) => text.includes(p)).length;
  empathyScore = Math.max(1, empathyScore - penaltyHits);
  toneScore = Math.max(1, toneScore - penaltyHits);

  // --- Length check
  if (wordCount < 15) {
    empathyScore = Math.max(1, empathyScore - 1);
    toneScore = Math.max(1, toneScore - 1);
  }

  // --- Caps
  empathyScore = Math.min(5, Math.max(1, empathyScore));
  toneScore = Math.min(5, Math.max(1, toneScore));

  const totalScore = empathyScore + toneScore;
  const bonusMultiplier = isBonus ? 2 : 1;
  const finalScore = totalScore * bonusMultiplier;

  const feedback = buildFeedback(empathyScore, toneScore, strongHits, moderateHits, penaltyHits);
  const improvementTip = buildTip(empathyScore, toneScore, wordCount);

  return { empathyScore, toneScore, totalScore, finalScore, feedback, improvementTip };
}

function buildFeedback(
  empathy: number,
  tone: number,
  strong: number,
  moderate: number,
  penalties: number,
): string {
  const parts: string[] = [];

  if (empathy >= 4) {
    parts.push('Strong empathy — you clearly acknowledged the customer\'s emotions.');
  } else if (empathy === 3) {
    parts.push('Moderate empathy — you showed some acknowledgment, but could dig deeper into the feeling.');
  } else if (empathy === 2) {
    parts.push('Light empathy — there\'s a hint of acknowledgment, but the emotional connection is thin.');
  } else {
    parts.push('Empathy was missing — the response jumped to solution or policy without validating the customer first.');
  }

  if (tone >= 4) {
    parts.push('The tone is warm and professional — this response would make a customer feel valued.');
  } else if (tone === 3) {
    parts.push('The tone is decent but a bit neutral — a bit more warmth would elevate it.');
  } else if (tone === 2) {
    parts.push('The tone could be warmer — aim for conversational and human over formal or procedural.');
  } else {
    parts.push('The tone feels flat or robotic — try more personal, warm language.');
  }

  if (penalties > 0) {
    parts.push('Watch out for defensive or policy-first phrasing — it undermines the empathy you\'ve built.');
  }

  return parts.join(' ');
}

function buildTip(empathy: number, tone: number, wordCount: number): string {
  if (wordCount < 20) {
    return 'Your response was quite short. A fuller response (2–4 sentences) shows the customer you\'re genuinely engaged.';
  }
  if (empathy < 3) {
    return 'Lead with the feeling first. Try opening with: "I completely understand how [emotion] this must be..."';
  }
  if (tone < 3) {
    return 'Warm up your language. Phrases like "I\'d love to help get this resolved" or "Let me take care of this personally" go a long way.';
  }
  if (empathy === 3) {
    return 'Try naming the specific emotion (frustration, disappointment, confusion) to make the empathy feel more genuine.';
  }
  return 'Great work! To push to a 10, consider adding a brief commitment to follow through — show the customer what happens next.';
}
