"use client";

import type { Socket } from "socket.io-client";
import type {
  LiveStatsPayload,
  MatchEndedPayload,
  MatchFoundPayload,
  OpponentUpdatePayload,
  PublicPlayer,
  TypingStats
} from "@/types/game";
import { create } from "zustand";

type QueueState = "idle" | "waiting" | "matched";

type MatchStore = {
  socket?: Socket;
  connected: boolean;
  player?: PublicPlayer;
  liveStats: LiveStatsPayload;
  queueState: QueueState;
  roomCode?: string;
  match?: MatchFoundPayload;
  countdownMs: number;
  started: boolean;
  typed: string;
  selfStats?: TypingStats;
  opponent?: OpponentUpdatePayload;
  summary?: MatchEndedPayload;
  error?: string;
  setSocket: (socket?: Socket) => void;
  setConnected: (connected: boolean) => void;
  setPlayer: (player?: PublicPlayer) => void;
  setLiveStats: (stats: LiveStatsPayload) => void;
  setQueueState: (queueState: QueueState) => void;
  setRoomCode: (roomCode?: string) => void;
  setMatch: (match?: MatchFoundPayload) => void;
  setCountdownMs: (countdownMs: number) => void;
  setStarted: (started: boolean) => void;
  setTyped: (typed: string) => void;
  setSelfStats: (stats?: TypingStats) => void;
  setOpponent: (opponent?: OpponentUpdatePayload) => void;
  setSummary: (summary?: MatchEndedPayload) => void;
  setError: (error?: string) => void;
  resetMatch: () => void;
};

export const useMatchStore = create<MatchStore>((set) => ({
  connected: false,
  liveStats: {
    playersOnline: 0,
    activeMatches: 0,
    queuedPlayers: 0
  },
  queueState: "idle",
  countdownMs: 0,
  started: false,
  typed: "",
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),
  setPlayer: (player) => set({ player }),
  setLiveStats: (liveStats) => set({ liveStats }),
  setQueueState: (queueState) => set({ queueState }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setMatch: (match) =>
    set({
      match,
      queueState: match ? "matched" : "idle",
      typed: "",
      selfStats: undefined,
      opponent: undefined,
      summary: undefined,
      started: false,
      countdownMs: match ? Math.max(match.startsAt - match.serverNow, 0) : 0
    }),
  setCountdownMs: (countdownMs) => set({ countdownMs }),
  setStarted: (started) => set({ started }),
  setTyped: (typed) => set({ typed }),
  setSelfStats: (selfStats) => set({ selfStats }),
  setOpponent: (opponent) => set({ opponent }),
  setSummary: (summary) => set({ summary }),
  setError: (error) => set({ error }),
  resetMatch: () =>
    set({
      match: undefined,
      countdownMs: 0,
      started: false,
      typed: "",
      selfStats: undefined,
      opponent: undefined,
      summary: undefined,
      queueState: "idle",
      error: undefined
    })
}));
