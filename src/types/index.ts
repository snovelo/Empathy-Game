export type SessionStatus = 'WAITING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type RoundStatus = 'PENDING' | 'ACTIVE' | 'CLOSED';

export interface SessionSettings {
  timerEnabled: boolean;
  timerDuration: number; // seconds
  anonymousMode: boolean;
  allowLateJoin: boolean;
  allowEdits: boolean;
  revealAfterEach: boolean;
}

export interface ScoringResult {
  empathyScore: number;    // 1–5
  toneScore: number;       // 1–5
  ownershipScore: number;  // 1–5
  totalScore: number;      // empathy + tone + ownership (3–15)
  finalScore: number;      // totalScore * bonusMultiplier
  feedback: string;
  improvementTip: string;
}

export interface LeaderboardEntry {
  teamName: string;
  totalScore: number;
  memberCount: number;
  members: {
    displayName: string;
    totalScore: number;
  }[];
}

export interface ParticipantState {
  id: string;
  displayName: string;
  teamName: string;
  sessionKey: string;
}

// Shape returned by the /api/sessions/[id] GET for the game UI
export interface GameSession {
  id: string;
  code: string;
  title: string;
  status: SessionStatus;
  currentRoundIndex: number;
  timerEnabled: boolean;
  timerDuration: number;
  allowEdits: boolean;
  revealAfterEach: boolean;
  participants: {
    id: string;
    displayName: string;
    teamName: string;
  }[];
  sessionRounds: {
    id: string;
    orderIndex: number;
    status: RoundStatus;
    startedAt: string | null;
    closedAt: string | null;
    round: {
      id: string;
      title: string;
      scenario: string;
      task: string;
      isBonus: boolean;
      roboticResponse: string | null;
      facilitatorNote: string | null;
    };
  }[];
}
