import type { ScoringResult } from '@/types';
import { scoreHeuristic } from './heuristic';

export async function scoreResponse(
  responseText: string,
  scenario: string,
  isBonus: boolean,
): Promise<ScoringResult> {
  const provider = process.env.SCORING_PROVIDER ?? 'heuristic';

  if (provider === 'llm' && process.env.ANTHROPIC_API_KEY) {
    try {
      const { scoreLLM } = await import('./llm');
      return await scoreLLM(responseText, scenario, isBonus);
    } catch (err) {
      console.warn('[scoring] LLM scorer failed, falling back to heuristic:', err);
    }
  }

  return scoreHeuristic(responseText, isBonus);
}
