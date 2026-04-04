import type { ScoringResult } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countRegexHits(text: string, patterns: RegExp[]): number {
  return patterns.filter((p) => p.test(text)).length;
}

function countPhraseHits(text: string, phrases: string[]): number {
  return phrases.filter((p) => text.includes(p)).length;
}

// ─── G — Go Beyond the Ask: Empathy ──────────────────────────────────────────

const EMPATHY_REGEX: RegExp[] = [
  // Acknowledgment with intensifier — broad modifier list including "really"
  /i\s+(completely|truly|fully|genuinely|deeply|sincerely|really|absolutely|totally|so)\s+understand/,
  // "I'm/I am [really|so|truly|...] sorry" — fixed to catch all common intensifiers
  /i'?m\s+(so|really|truly|deeply|genuinely|sincerely|very|terribly|awfully|extremely|just)\s+sorry/,
  /i\s+am\s+(so|really|truly|deeply|genuinely|sincerely|very|terribly|awfully|extremely)\s+sorry/,
  // Plain apology forms
  /i('m|\s+am)\s+sorry\b/,
  /i\s+(sincerely|deeply|humbly|truly)\s+apologize/,
  // Core understanding/sensing
  /i\s+(can\s+)?(hear|see|feel|sense)\s+(how|that|what)\s+\w/,
  /i\s+can\s+only\s+imagine\s+how/,
  // "That/this/it must be/feel..."
  /(that|this|it)\s+must\s+(be|feel|seem|have\s+been)/,
  // Naming emotion in context — expanded to include "it's"
  /how\s+(frustrating|disappointing|upsetting|stressful|difficult|confusing|infuriating|exhausting|annoying|aggravating)\s+(this|that|it)\s+(must|is|was|sounds|seems)/,
  /(it'?s?|this\s+is|that'?s?)\s+(so\s+)?(frustrating|disappointing|upsetting|stressful|difficult|infuriating|exhausting|confusing|annoying|aggravating)/,
  // Validation phrases
  /(that'?s?|this\s+is)\s+(completely|totally|absolutely|perfectly|entirely|100%)\s+(understandable|valid|fair|reasonable)/,
  /you\s+(have\s+every\s+right|shouldn'?t\s+have\s+to|deserve\s+better|didn'?t\s+deserve)/,
  /your\s+(frustration|concern|disappointment|confusion|feelings?|experience)\s+(is|are|makes?)\s+(completely|totally|absolutely|perfectly)?\s*(valid|understandable|justified|fair)/,
  // "Had to go through" — empathy for repeated/painful experience
  /(had\s+to\s+go\s+through|been\s+through\s+this|gone\s+through\s+this|put\s+through\s+this)/,
  // "Not getting the help you need/deserve"
  /(not\s+get(ting)?\s+the\s+help|without\s+the\s+support|deserve\s+(better|more\s+than\s+this))/,
  // Making it right
  /i\s+(want|need|intend)\s+to\s+make\s+this\s+right/,
  /let\s+me\s+make\s+this\s+right/,
  // Direct emotional acknowledgment
  /i\s+(acknowledge|recognize|validate|hear)\s+(your|this|that|how)/,
  /you\s+(feel|felt)\s+(heard|valued|understood|seen)/,
  /that\s+(is|was)\s+(not\s+okay|unacceptable|not\s+right|not\s+how)/,
  // Appreciating patience — strong empathy + care signal
  /i\s+(appreciate|value|recognize)\s+your\s+(patience|understanding|time|trust|loyalty)/,
  // "I completely/really/fully get how..."
  /i\s+(completely|fully|truly|really|genuinely|totally)\s*(get|understand|see|hear)\s+(how|what|why|that|this)/,
  // Negated empathy (penalty catch — do NOT add to positives)
];

const EMPATHY_PHRASES: string[] = [
  "i understand",
  "i can understand",
  "i hear you",
  "you're right",
  "you are right",
  "i apologize",
  "i'm sorry",
  "i am sorry",
  "i'm so sorry",
  "i'm really sorry",
  "so sorry",
  "that's frustrating",
  "that is frustrating",
  "it's frustrating",
  "it is frustrating",
  "that's disappointing",
  "that is disappointing",
  "it's disappointing",
  "that's upsetting",
  "i know how",
  "this must",
  "that must",
  "how difficult",
  "your experience",
  "your feelings",
  "your concern",
  "completely valid",
  "that's understandable",
  "that is understandable",
  "i empathize",
  "appreciate your patience",
  "appreciate your understanding",
  "had to go through",
  "go through that",
  "go through this",
  "you've had to",
  "repeat yourself",
  "not get the help",
  "shouldn't have to",
];

const EMPATHY_CONCEPT_WORDS: string[] = [
  "frustrating", "frustrated", "frustration",
  "disappointing", "disappointed", "disappointment",
  "upsetting", "upset",
  "confusing", "confused", "confusion",
  "stressful", "stressed",
  "exhausting", "exhausted",
  "annoying", "annoyed",
  "aggravating", "aggravated",
  "empathize", "empathy",
  "validate", "validated",
  "acknowledge", "acknowledged",
  "patience", "patient",
];

// ─── L — Lead with Care: Tone ─────────────────────────────────────────────────

const TONE_REGEX: RegExp[] = [
  // Commitment to help
  /(i'?d?\s+love|i\s+would\s+love|i'?m\s+happy|i\s+am\s+happy)\s+to\s+help/,
  /\b(here|happy|glad|pleased)\s+to\s+help\b/,
  /let\s+me\s+(help|assist|take\s+care|sort\s+this|get\s+this)/,
  // "Let's get this [resolved/sorted/handled]" — collaborative urgency
  /let'?s\s+(get\s+this|work\s+(on\s+this|through|together)|figure\s+this|sort\s+this)/,
  // Appreciation
  /thank\s+you\s+for\s+(bringing|reaching|contacting|your|letting|taking)/,
  /i\s+(appreciate|value)\s+(you|your|this|that)/,
  // Appreciating patience explicitly
  /i\s+(appreciate|value|recognize)\s+your\s+(patience|understanding|time|trust|loyalty)/,
  // Priority language
  /(top|first|high|my)\s+priority/,
  /as\s+a\s+priority/,
  /right\s+(away|now|this\s+moment)/,
  /\bimmediately\b/,
  // Urgency — "as quickly/soon as possible"
  /as\s+(quickly|soon|fast)\s+as\s+possible/,
  // Affirming tone
  /\b(certainly|absolutely|of\s+course|definitely)\b/,
  // Customer value language
  /(you\s+are|you'?re)\s+a?\s*(valued|important|our\s+priority)/,
  /we\s+(value|care\s+about)\s+you/,
  /your\s+trust\s+(means|is\s+important)/,
  // Warm forward-looking language
  /(going|moving)\s+forward/,
  /\brebuild\b|\brestore\b/,
  // Collaborative
  /\btogether\b/,
  /\bpartner\b|\bside\s+by\s+side\b/,
  // Personal warmth
  /please\s+know/,
  /i\s+want\s+you\s+to\s+know/,
  /i\s+care\s+about\s+(you|this|your)/,
  // "You won't/don't have to [worry/explain/deal] again" — reassurance
  /you\s+(won'?t|don'?t)\s+have\s+to\s+(worry|explain|deal|go\s+through|repeat|do\s+this)/,
];

const TONE_PHRASES: string[] = [
  "happy to help",
  "here to help",
  "i'd love to",
  "i would love to",
  "make this right",
  "thank you for",
  "we value",
  "you are valued",
  "of course",
  "certainly",
  "absolutely",
  "right away",
  "immediately",
  "top priority",
  "please know",
  "want you to know",
  "going forward",
  "moving forward",
  "together",
  "i care about",
  "as quickly as possible",
  "as soon as possible",
  "let's get this",
  "let's work",
  "appreciate your patience",
  "appreciate your understanding",
  "you won't have to",
  "you don't have to",
  "won't happen again",
];

// ─── O+D — Own Every Moment + Do It Together: Ownership ───────────────────────

const OWNERSHIP_REGEX: RegExp[] = [
  // Personal ownership with action — fixed contraction handling throughout
  /(i'?ll|i\s+will)\s+personally\s+\w/,
  /let\s+me\s+personally\s+\w/,
  /i\s+personally\s+(will|want|commit|ensure|guarantee|promise)/,
  // Taking ownership explicitly — catches "i'll take ownership/responsibility"
  /(i'?ll|i\s+will|i\s+am\s+going\s+to|i'?m\s+going\s+to)\s+take\s+(ownership|responsibility|charge|the\s+lead|full)/,
  /i\s+take\s+(full|complete|total|personal|ownership|responsibility)/,
  /i\s+(own|accept)\s+(this|that|full|complete)\s*(responsibility|outcome|issue)?/,
  // "Take it/this from here" — handoff ownership
  /(i'?ll|i\s+will)\s+take\s+(it|this)\s+from\s+here/,
  /from\s+here\s+(on|forward|out)/,
  // Specific commitment structures
  /here'?s?\s+(what|my plan|my next step)/,
  /what\s+i\s+('?ll|will|can)\s+do\s+(is|for\s+you|right\s+now)/,
  // Personal follow-through — fixed i'll contractions
  /(i'?ll|i\s+will)\s+(follow\s+up|check\s+back|reach\s+out|get\s+back|update\s+you|keep\s+you\s+posted)/,
  /(i'?ll|i\s+will)\s+see\s+this\s+through/,
  /i\s+won'?t\s+(stop|rest|let\s+this)/,
  // Specific action commitment — fixed contractions
  /(i'?ll|i\s+will)\s+(take\s+care|handle|resolve|fix|address|look\s+into|investigate|get\s+this|sort\s+this)/,
  // "I'll make sure" — strong ownership signal
  /(i'?ll|i\s+will)\s+make\s+sure/,
  // "Let's get this resolved/sorted" — collaborative ownership
  /let'?s\s+(get\s+this\s+(resolved|sorted|fixed|handled|addressed)|resolve\s+this|sort\s+this\s+out)/,
  // "You won't have to explain/repeat again"
  /you\s+(won'?t|don'?t)\s+have\s+to\s+(explain|repeat|go\s+through|deal\s+with)\s+(it|this|that|again)?/,
  // Promise language
  /\b(you\s+have\s+my\s+word|i\s+promise|i\s+commit|i\s+guarantee)\b/,
  // Going above and beyond
  /(go|going)\s+above\s+and\s+beyond/,
  /extra\s+mile/,
  // Next steps
  /\bnext\s+step(s)?\b/,
  /my\s+next\s+step/,
  // Follow through commitment
  /follow\s+through/,
];

const OWNERSHIP_PHRASES: string[] = [
  "i'll look into",
  "i will look into",
  "let me check",
  "i'll find out",
  "i will find out",
  "i'll get this resolved",
  "i'll resolve",
  "i'll update you",
  "i'll keep you posted",
  "i'll handle",
  "i'll work on",
  "we'll fix this",
  "we will fix this",
  "let's get this sorted",
  "let's get this resolved",
  "let's resolve",
  "get this sorted",
  "get this resolved",
  "i'll do my best",
  "let me see what",
  "i can do for you",
  "work together",
  "i'll take care",
  "i will take care",
  "i'll make sure",
  "i will make sure",
  "i'll take ownership",
  "take ownership",
  "take responsibility",
  "take it from here",
  "take this from here",
  "from here on",
  "you won't have to explain",
  "you don't have to explain",
  "won't have to repeat",
  "don't have to repeat",
  "follow through",
  "as quickly as possible",
  "as soon as possible",
];

const OWNERSHIP_CONCEPT_WORDS: string[] = [
  "accountable", "accountability",
  "responsible", "responsibility",
  "committed", "commitment",
  "dedicated", "dedication",
  "promise", "promised",
  "ensure", "ensuring",
  "guarantee", "guaranteeing",
  "resolve", "resolving", "resolution",
  "own", "ownership",
  "personally",
  "immediately",
];

// ─── Penalty patterns ─────────────────────────────────────────────────────────

const PENALTY_PHRASES: string[] = [
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

const PENALTY_REGEX: RegExp[] = [
  // Negated empathy — "I don't understand why you're upset"
  /i\s+(don'?t|cannot|can'?t|do\s+not)\s+understand\s+why\s+you/,
  // Dismissive redirects
  /not\s+(my|our)\s+(fault|problem|issue|responsibility)/,
  // Blaming the customer
  /you\s+(should\s+have|shouldn'?t\s+have|were\s+supposed\s+to|need\s+to\s+have)/,
];

// ─── Scorer ───────────────────────────────────────────────────────────────────

export function scoreHeuristic(
  responseText: string,
  isBonus: boolean,
): ScoringResult {
  const text = responseText.toLowerCase().trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // --- G: Empathy scoring
  const empathyRegexHits  = countRegexHits(text, EMPATHY_REGEX);
  const empathyPhraseHits = countPhraseHits(text, EMPATHY_PHRASES);
  const empathyConceptBonus = Math.floor(countPhraseHits(text, EMPATHY_CONCEPT_WORDS) / 2);
  const empathyTotal = empathyRegexHits + empathyPhraseHits + empathyConceptBonus;

  let empathyScore = 1;
  if (empathyTotal >= 4)      empathyScore = 5;
  else if (empathyTotal >= 3) empathyScore = 4;
  else if (empathyTotal >= 2) empathyScore = 3;
  else if (empathyTotal >= 1) empathyScore = 2;

  // --- L: Tone scoring
  const toneRegexHits  = countRegexHits(text, TONE_REGEX);
  const tonePhraseHits = countPhraseHits(text, TONE_PHRASES);
  const toneTotal = toneRegexHits + tonePhraseHits;

  let toneScore = 1;
  if (toneTotal >= 5)      toneScore = 5;
  else if (toneTotal >= 4) toneScore = 4;
  else if (toneTotal >= 2) toneScore = 3;
  else if (toneTotal >= 1 || wordCount >= 40) toneScore = 2;

  // --- O+D: Ownership scoring
  const ownershipRegexHits  = countRegexHits(text, OWNERSHIP_REGEX);
  const ownershipPhraseHits = countPhraseHits(text, OWNERSHIP_PHRASES);
  const ownershipConceptBonus = Math.floor(countPhraseHits(text, OWNERSHIP_CONCEPT_WORDS) / 2);
  const ownershipTotal = ownershipRegexHits + ownershipPhraseHits + ownershipConceptBonus;

  let ownershipScore = 1;
  if (ownershipTotal >= 4)      ownershipScore = 5;
  else if (ownershipTotal >= 3) ownershipScore = 4;
  else if (ownershipTotal >= 2) ownershipScore = 3;
  else if (ownershipTotal >= 1) ownershipScore = 2;

  // --- Penalties
  const penaltyPhraseHits = countPhraseHits(text, PENALTY_PHRASES);
  const penaltyRegexHits  = countRegexHits(text, PENALTY_REGEX);
  const penaltyTotal = penaltyPhraseHits + penaltyRegexHits;

  empathyScore   = Math.max(1, empathyScore   - penaltyTotal);
  toneScore      = Math.max(1, toneScore      - penaltyTotal);
  ownershipScore = Math.max(1, ownershipScore - penaltyTotal);

  // --- Length check
  if (wordCount < 15) {
    empathyScore   = Math.max(1, empathyScore   - 1);
    toneScore      = Math.max(1, toneScore      - 1);
    ownershipScore = Math.max(1, ownershipScore - 1);
  }

  // --- Caps
  empathyScore   = Math.min(5, Math.max(1, empathyScore));
  toneScore      = Math.min(5, Math.max(1, toneScore));
  ownershipScore = Math.min(5, Math.max(1, ownershipScore));

  const totalScore = empathyScore + toneScore + ownershipScore;
  const bonusMultiplier = isBonus ? 2 : 1;
  const finalScore = totalScore * bonusMultiplier;

  const feedback = buildFeedback(empathyScore, toneScore, ownershipScore, penaltyTotal);
  const improvementTip = buildTip(empathyScore, toneScore, ownershipScore, wordCount);

  return { empathyScore, toneScore, ownershipScore, totalScore, finalScore, feedback, improvementTip };
}

function buildFeedback(
  empathy: number,
  tone: number,
  ownership: number,
  penalties: number,
): string {
  const parts: string[] = [];

  if (empathy >= 4) {
    parts.push('Strong empathy — you went beyond the ask by clearly acknowledging the customer\'s emotions and making them feel seen.');
  } else if (empathy === 3) {
    parts.push('Moderate empathy — you acknowledged the feeling, but going deeper into the specific emotion would truly go beyond the ask.');
  } else if (empathy === 2) {
    parts.push('Light empathy — there\'s a hint of acknowledgment, but the emotional connection is thin. Go beyond surface-level.');
  } else {
    parts.push('Empathy was missing — the response jumped to solution without validating the customer first. Feelings first, solutions second.');
  }

  if (tone >= 4) {
    parts.push('You led with care — the tone is warm, human, and professional. This response would make a customer feel truly valued.');
  } else if (tone === 3) {
    parts.push('Decent tone, but a little neutral. More warmth and personal language would help you lead with care more effectively.');
  } else if (tone === 2) {
    parts.push('The tone could be warmer. Leading with care means sounding human and personal, not formal or procedural.');
  } else {
    parts.push('The tone feels flat. Lead with care by using warmer, more conversational language that puts the customer first.');
  }

  if (ownership >= 4) {
    parts.push('Excellent ownership — you clearly took personal responsibility and showed the customer you\'re in this together.');
  } else if (ownership === 3) {
    parts.push('Good ownership, but be more specific about what you\'ll personally do and when. Own every moment by making concrete commitments.');
  } else if (ownership === 2) {
    parts.push('Ownership was light. Add a clear next step and personal commitment — "Here\'s what I\'ll do..." goes a long way.');
  } else {
    parts.push('Ownership was missing. The GOLD Standard means owning the outcome — commit to a specific action and follow through together.');
  }

  if (penalties > 0) {
    parts.push('Watch out for defensive or policy-first phrasing — it undermines the GOLD Standard and breaks trust with the customer.');
  }

  return parts.join(' ');
}

function buildTip(empathy: number, tone: number, ownership: number, wordCount: number): string {
  if (wordCount < 20) {
    return 'Your response was too brief. A full 2–4 sentence response shows the customer you\'re genuinely engaged and living the GOLD Standard.';
  }
  if (empathy < 3) {
    return 'G — Go Beyond the Ask: Lead with the feeling first. Try: "I completely understand how [emotion] this must be, and I want to make sure we get this right for you."';
  }
  if (ownership < 3) {
    return 'O — Own Every Moment: Add a personal commitment. Try: "I\'ll take ownership of this from here so you don\'t have to explain it again."';
  }
  if (tone < 3) {
    return 'L — Lead with Care: Warm up your language. Phrases like "I appreciate your patience" or "Let\'s get this resolved as quickly as possible" show you lead with care.';
  }
  if (empathy === 3) {
    return 'G — Go Beyond the Ask: Name the specific emotion (frustration, disappointment, confusion) to make the empathy feel genuine and personal.';
  }
  if (ownership === 3) {
    return 'D — Do It Together: Close the loop by showing the customer you\'re partnering with them — "Let\'s get this resolved together" signals teamwork.';
  }
  return 'Strong GOLD response! To reach a perfect 15, make sure you\'ve named the emotion, committed to a specific next step, and ended with a warm collaborative close.';
}
