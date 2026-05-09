export type Difficulty = "easy" | "medium" | "hard";
export type ParagraphCategory = "easy" | "medium" | "hard" | "programming" | "random";
export type RankName = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
export type MatchMode = "quick" | "private" | "bot" | "spectator";
export type MatchStatus = "waiting" | "countdown" | "active" | "completed" | "abandoned";

export type PlayerIdentity = {
  userId?: string;
  guestId?: string;
  name: string;
  avatarUrl?: string;
  isGuest: boolean;
};

export type PublicPlayer = PlayerIdentity & {
  socketId: string;
  rank: RankName;
  mmr: number;
};

export type SharedParagraph = {
  id: string;
  category: ParagraphCategory;
  difficulty: Difficulty;
  body: string;
  estimatedSeconds: number;
  seedTag: string;
};

export type TypingStats = {
  typedLength: number;
  correctChars: number;
  errors: number;
  wpm: number;
  accuracy: number;
  completionPercent: number;
  completed: boolean;
  completionMs?: number;
  suspiciousFlags: string[];
};

export type PlayerMatchState = {
  player: PublicPlayer;
  typed: string;
  lastUpdateAt: number;
  lastTypedLength: number;
  stats: TypingStats;
  ready: boolean;
};

export type MatchFoundPayload = {
  matchId: string;
  mode: MatchMode;
  roomCode?: string;
  paragraph: SharedParagraph;
  seed: string;
  players: PublicPlayer[];
  startsAt: number;
  serverNow: number;
};

export type TypingUpdatePayload = {
  matchId: string;
  typed: string;
  clientSentAt: number;
};

export type OpponentUpdatePayload = {
  matchId: string;
  player: PublicPlayer;
  stats: TypingStats;
  isTyping: boolean;
};

export type MatchResultSummary = {
  player: PublicPlayer;
  stats: TypingStats;
  won: boolean;
  rankDelta: number;
  xpDelta: number;
};

export type MatchEndedPayload = {
  matchId: string;
  winnerSocketId?: string;
  reason: string;
  results: MatchResultSummary[];
  endedAt: number;
};

export type LiveStatsPayload = {
  playersOnline: number;
  activeMatches: number;
  queuedPlayers: number;
};

export type LeaderboardPlayer = {
  id: string;
  username: string;
  avatar_url: string | null;
  avg_wpm: number;
  accuracy: number;
  wins: number;
  losses: number;
  best_streak: number;
  mmr: number;
  rank_name: RankName;
  division: number;
};
