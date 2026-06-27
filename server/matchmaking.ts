import crypto from "node:crypto";
import type { Server, Socket } from "socket.io";
import { makeMatchSeed, selectParagraph } from "../src/services/paragraphs";
import type {
  LiveStatsPayload,
  MatchEndedPayload,
  MatchMode,
  MatchResultSummary,
  PublicPlayer,
  SharedParagraph,
  TypingUpdatePayload
} from "../src/types/game";
import { calculateMmrDelta, xpForResult } from "../src/utils/ranking";
import { calculateTypingStats, normalizeTypedValue } from "../src/utils/typing";
import {
  getPlayerProfile,
  getSupabaseAdmin,
  isUuid,
  loadParagraphPool,
  updateUserAfterMatch,
  verifyAccessToken
} from "./supabase";

type HelloPayload = {
  accessToken?: string;
  guestId?: string;
  name?: string;
  avatarUrl?: string;
};

type PrivateRoom = {
  code: string;
  hostSocketId: string;
  status: "waiting" | "playing" | "closed";
  createdAt: number;
};

type MatchPlayerState = {
  player: PublicPlayer;
  typed: string;
  lastUpdateAt: number;
  lastTypedLength: number;
  lastBroadcastAt: number;
  ready: boolean;
  stats: ReturnType<typeof calculateTypingStats>;
};

type MatchState = {
  id: string;
  dbMatchPersisted: boolean;
  mode: MatchMode;
  roomCode?: string;
  paragraph: SharedParagraph;
  seed: string;
  status: "countdown" | "active" | "completed" | "abandoned";
  startsAt: number;
  startedAt: number;
  players: Map<string, MatchPlayerState>;
  endTimer?: NodeJS.Timeout;
};

const MATCH_ROOM_PREFIX = "match:";
const COUNTDOWN_MS = 5_000;
const FINISH_GRACE_MS = 2_000;
const MAX_MATCH_MS = 180_000;
const RECONNECT_GRACE_MS = 12_000;

export class MatchmakingEngine {
  private readonly io: Server;
  private readonly players = new Map<string, PublicPlayer>();
  private readonly identitySockets = new Map<string, string>();
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();
  private readonly playerMatch = new Map<string, string>();
  private readonly quickQueue: string[] = [];
  private readonly privateRooms = new Map<string, PrivateRoom>();
  private readonly matches = new Map<string, MatchState>();
  private paragraphPool: SharedParagraph[] = [];

  constructor(io: Server) {
    this.io = io;
  }

  async bootstrap() {
    this.paragraphPool = await loadParagraphPool();
    setInterval(() => this.emitLiveStats(), 4_000).unref();
    setInterval(() => this.cleanupRooms(), 60_000).unref();
  }

  bind(socket: Socket) {
    socket.on("player:hello", async (payload: HelloPayload = {}) => {
      const player = await this.resolvePlayer(socket, payload);
      this.reattachIfPossible(socket, player);
      this.players.set(socket.id, player);
      this.identitySockets.set(identityKey(player), socket.id);
      socket.emit("player:ready", player);
      this.emitLiveStats();
    });

    socket.on("queue:join", async () => {
      if (!this.players.has(socket.id)) {
        socket.emit("match:error", "Join as a player before queueing.");
        return;
      }

      this.removeFromQueue(socket.id);
      this.quickQueue.push(socket.id);
      socket.emit("queue:waiting", { queuedAt: Date.now() });
      await this.tryPairQuickMatch();
      this.emitLiveStats();
    });

    socket.on("queue:leave", () => {
      this.removeFromQueue(socket.id);
      socket.emit("queue:left");
      this.emitLiveStats();
    });

    socket.on("room:create", async () => {
      const player = this.players.get(socket.id);
      if (!player) {
        socket.emit("match:error", "Join as a player before creating a room.");
        return;
      }

      const code = this.createRoomCode();
      this.privateRooms.set(code, {
        code,
        hostSocketId: socket.id,
        status: "waiting",
        createdAt: Date.now()
      });

      await this.persistRoom(code, player);
      socket.emit("room:created", { code });
      this.emitLiveStats();
    });

    socket.on("room:join", async ({ code }: { code?: string } = {}) => {
      const roomCode = String(code ?? "").trim().toUpperCase();
      const room = this.privateRooms.get(roomCode);
      const host = room ? this.players.get(room.hostSocketId) : null;
      const player = this.players.get(socket.id);

      if (!room || !host || !player || room.status !== "waiting") {
        socket.emit("match:error", "That room is no longer available.");
        return;
      }

      if (room.hostSocketId === socket.id) {
        socket.emit("match:error", "Waiting for another duelist to join.");
        return;
      }

      room.status = "playing";
      socket.emit("room:joined", { code: roomCode });
      await this.createMatch([room.hostSocketId, socket.id], "private", roomCode);
      this.emitLiveStats();
    });

    socket.on("match:ready", ({ matchId }: { matchId?: string } = {}) => {
      const match = matchId ? this.matches.get(matchId) : null;
      const playerState = match?.players.get(socket.id);
      if (!match || !playerState) {
        return;
      }

      playerState.ready = true;
    });

    socket.on("typing:update", (payload: TypingUpdatePayload) => {
      this.handleTypingUpdate(socket, payload);
    });

    socket.on("match:leave", () => {
      this.handleLeave(socket.id, "Player left the arena.");
    });

    socket.on("disconnect", () => {
      this.removeFromQueue(socket.id);
      this.handleDisconnect(socket.id);
      this.emitLiveStats();
    });
  }

  getStats(): LiveStatsPayload {
    return {
      playersOnline: this.players.size,
      activeMatches: Array.from(this.matches.values()).filter((match) => match.status === "active")
        .length,
      queuedPlayers: this.quickQueue.length
    };
  }

  private async resolvePlayer(socket: Socket, payload: HelloPayload): Promise<PublicPlayer> {
    const authUser = await verifyAccessToken(payload.accessToken);

    if (authUser) {
      const profile = await getPlayerProfile(authUser.id);
      return {
        socketId: socket.id,
        userId: authUser.id,
        name: profile?.username ?? payload.name ?? "Duelist",
        avatarUrl: profile?.avatarUrl ?? payload.avatarUrl,
        isGuest: false,
        rank: profile?.rank ?? "Bronze",
        mmr: profile?.mmr ?? 1000
      };
    }

    return {
      socketId: socket.id,
      guestId: payload.guestId || `guest_${crypto.randomUUID()}`,
      name: payload.name?.slice(0, 24) || `Guest ${socket.id.slice(0, 4).toUpperCase()}`,
      avatarUrl: payload.avatarUrl,
      isGuest: true,
      rank: "Bronze",
      mmr: 1000
    };
  }

  private async tryPairQuickMatch() {
    while (this.quickQueue.length >= 2) {
      const first = this.quickQueue.shift();
      const second = this.quickQueue.shift();

      if (!first || !second) {
        return;
      }

      if (!this.players.has(first) || !this.players.has(second)) {
        continue;
      }

      await this.createMatch([first, second], "quick");
    }
  }

  private async createMatch(socketIds: string[], mode: MatchMode, roomCode?: string) {
    const players = socketIds.map((socketId) => this.players.get(socketId)).filter(Boolean);
    if (players.length !== 2) {
      return;
    }

    const seed = makeMatchSeed(mode);
    const paragraph = selectParagraph({ seed, pool: this.paragraphPool });
    const id = crypto.randomUUID();
    const startsAt = Date.now() + COUNTDOWN_MS;
    const matchPlayers = new Map<string, MatchPlayerState>();

    for (const player of players) {
      if (!player) {
        continue;
      }

      matchPlayers.set(player.socketId, {
        player,
        typed: "",
        lastUpdateAt: startsAt,
        lastTypedLength: 0,
        lastBroadcastAt: 0,
        ready: false,
        stats: calculateTypingStats({
          typed: "",
          paragraph: paragraph.body,
          startedAt: startsAt,
          now: startsAt
        })
      });
      this.playerMatch.set(player.socketId, id);
      this.removeFromQueue(player.socketId);
      this.io.sockets.sockets.get(player.socketId)?.join(`${MATCH_ROOM_PREFIX}${id}`);
    }

    const match: MatchState = {
      id,
      dbMatchPersisted: false,
      mode,
      roomCode,
      paragraph,
      seed,
      status: "countdown",
      startsAt,
      startedAt: startsAt,
      players: matchPlayers
    };

    this.matches.set(id, match);
    match.dbMatchPersisted = await this.persistMatchStart(match);

    this.io.to(`${MATCH_ROOM_PREFIX}${id}`).emit("match:found", {
      matchId: id,
      mode,
      roomCode,
      paragraph,
      seed,
      players,
      startsAt,
      serverNow: Date.now()
    });

    this.runCountdown(match);
    setTimeout(() => {
      if (match.status !== "countdown") {
        return;
      }

      match.status = "active";
      this.io.to(`${MATCH_ROOM_PREFIX}${id}`).emit("match:started", {
        matchId: id,
        startedAt: match.startedAt,
        serverNow: Date.now()
      });
      this.emitLiveStats();
    }, COUNTDOWN_MS).unref();

    setTimeout(() => {
      if (match.status === "active") {
        this.endMatch(match, "Time limit reached.");
      }
    }, COUNTDOWN_MS + MAX_MATCH_MS).unref();
  }

  private runCountdown(match: MatchState) {
    const interval = setInterval(() => {
      const remainingMs = Math.max(match.startsAt - Date.now(), 0);
      this.io.to(`${MATCH_ROOM_PREFIX}${match.id}`).emit("match:countdown", {
        matchId: match.id,
        remainingMs,
        serverNow: Date.now()
      });

      if (remainingMs <= 0 || match.status !== "countdown") {
        clearInterval(interval);
      }
    }, 250);
    interval.unref();
  }

  private handleTypingUpdate(socket: Socket, payload: TypingUpdatePayload) {
    const matchId = this.playerMatch.get(socket.id);
    const match = matchId ? this.matches.get(matchId) : null;
    const playerState = match?.players.get(socket.id);

    if (!match || !playerState || payload.matchId !== match.id || match.status === "completed") {
      return;
    }

    const now = Date.now();
    if (now < match.startedAt - 100) {
      playerState.stats.suspiciousFlags = Array.from(
        new Set([...playerState.stats.suspiciousFlags, "early_start"])
      );
      return;
    }

    if (match.status !== "active") {
      return;
    }

    const typed = normalizeTypedValue(payload.typed, match.paragraph.body);

    playerState.typed = typed;
    playerState.lastTypedLength = typed.length;
    playerState.lastUpdateAt = now;
    playerState.stats = calculateTypingStats({
      typed,
      paragraph: match.paragraph.body,
      startedAt: match.startedAt,
      now,
      existingFlags: playerState.stats.suspiciousFlags
    });

    const shouldBroadcast =
      now - playerState.lastBroadcastAt > 80 || playerState.stats.completed || typed.length === 0;
    if (shouldBroadcast) {
      playerState.lastBroadcastAt = now;
      socket.to(`${MATCH_ROOM_PREFIX}${match.id}`).emit("opponent:update", {
        matchId: match.id,
        player: playerState.player,
        stats: playerState.stats,
        isTyping: true
      });
      socket.emit("self:update", {
        matchId: match.id,
        stats: playerState.stats
      });
    }

    if (playerState.stats.completed) {
      const allCompleted = Array.from(match.players.values()).every((state) => state.stats.completed);
      if (allCompleted) {
        this.endMatch(match, "Both duelists completed the paragraph.");
        return;
      }

      if (!match.endTimer) {
        match.endTimer = setTimeout(() => {
          this.endMatch(match, "First completion grace period ended.");
        }, FINISH_GRACE_MS);
        match.endTimer.unref();
      }
    }
  }

  private handleLeave(socketId: string, reason: string) {
    const matchId = this.playerMatch.get(socketId);
    const match = matchId ? this.matches.get(matchId) : null;

    if (!match || match.status === "completed" || match.status === "abandoned") {
      return;
    }

    match.status = "abandoned";
    const leaver = match.players.get(socketId);
    if (leaver) {
      leaver.stats.suspiciousFlags = Array.from(
        new Set([...leaver.stats.suspiciousFlags, "left_match"])
      );
    }
    this.endMatch(match, reason);
  }

  private handleDisconnect(socketId: string) {
    const player = this.players.get(socketId);
    const key = player ? identityKey(player) : undefined;
    const matchId = this.playerMatch.get(socketId);

    this.players.delete(socketId);

    if (!matchId) {
      if (key) {
        this.identitySockets.delete(key);
      }
      return;
    }

    const match = this.matches.get(matchId);
    if (!match || match.status === "completed" || !key) {
      return;
    }
    const state = match.players.get(socketId);
    if (!player || !state) {
      return;
    }

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(key);
      this.identitySockets.delete(key);
      this.handleLeave(socketId, "Opponent disconnected.");
    }, RECONNECT_GRACE_MS);
    timer.unref();
    this.disconnectTimers.set(key, timer);

    this.io.to(`${MATCH_ROOM_PREFIX}${match.id}`).emit("opponent:update", {
      matchId: match.id,
      player,
      stats: state.stats,
      isTyping: false
    });
  }

  private reattachIfPossible(socket: Socket, player: PublicPlayer) {
    const key = identityKey(player);
    const previousSocketId = this.identitySockets.get(key);
    const timer = this.disconnectTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(key);
    }

    if (!previousSocketId || previousSocketId === socket.id) {
      return;
    }

    const matchId = this.playerMatch.get(previousSocketId);
    const match = matchId ? this.matches.get(matchId) : null;
    const previousState = match?.players.get(previousSocketId);

    if (!match || !previousState || match.status === "completed") {
      this.playerMatch.delete(previousSocketId);
      return;
    }

    const reattachedPlayer = {
      ...previousState.player,
      socketId: socket.id
    };
    previousState.player = reattachedPlayer;
    match.players.delete(previousSocketId);
    match.players.set(socket.id, previousState);
    this.playerMatch.delete(previousSocketId);
    this.playerMatch.set(socket.id, match.id);
    socket.join(`${MATCH_ROOM_PREFIX}${match.id}`);

    socket.emit("match:found", {
      matchId: match.id,
      mode: match.mode,
      roomCode: match.roomCode,
      paragraph: match.paragraph,
      seed: match.seed,
      players: Array.from(match.players.values()).map((state) => state.player),
      startsAt: match.startsAt,
      serverNow: Date.now()
    });
    socket.emit("self:update", { matchId: match.id, stats: previousState.stats });
    if (match.status === "active") {
      socket.emit("match:started", {
        matchId: match.id,
        startedAt: match.startedAt,
        serverNow: Date.now()
      });
    }
  }

  private endMatch(match: MatchState, reason: string) {
    if (match.status === "completed") {
      return;
    }

    if (match.endTimer) {
      clearTimeout(match.endTimer);
    }

    match.status = "completed";
    const states = Array.from(match.players.values());
    const winner = determineWinner(states);
    const results: MatchResultSummary[] = states.map((state) => {
      const opponent = states.find((candidate) => candidate.player.socketId !== state.player.socketId);
      const won = winner?.player.socketId === state.player.socketId;
      const rankDelta = state.player.isGuest
        ? 0
        : calculateMmrDelta({
            playerMmr: state.player.mmr,
            opponentMmr: opponent?.player.mmr ?? 1000,
            won
          });
      const xpDelta = xpForResult({
        won,
        wpm: state.stats.wpm,
        accuracy: state.stats.accuracy,
        completed: state.stats.completed,
        suspicious: state.stats.suspiciousFlags.length > 0
      });

      return {
        player: state.player,
        stats: state.stats,
        won,
        rankDelta,
        xpDelta
      };
    });

    const payload: MatchEndedPayload = {
      matchId: match.id,
      winnerSocketId: winner?.player.socketId,
      reason,
      results,
      endedAt: Date.now()
    };

    this.io.to(`${MATCH_ROOM_PREFIX}${match.id}`).emit("match:ended", payload);
    this.persistMatchEnd(match, payload).catch((error) => {
      console.error("[match] failed to persist result", error);
    });

    for (const state of states) {
      this.playerMatch.delete(state.player.socketId);
      this.io.sockets.sockets.get(state.player.socketId)?.leave(`${MATCH_ROOM_PREFIX}${match.id}`);
    }

    this.matches.delete(match.id);
    this.emitLiveStats();
  }

  private emitLiveStats() {
    this.io.emit("stats:update", this.getStats());
  }

  private removeFromQueue(socketId: string) {
    const index = this.quickQueue.indexOf(socketId);
    if (index >= 0) {
      this.quickQueue.splice(index, 1);
    }
  }

  private createRoomCode() {
    let code = "";
    do {
      code = crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
    } while (this.privateRooms.has(code));
    return code;
  }

  private cleanupRooms() {
    const cutoff = Date.now() - 30 * 60_000;
    for (const [code, room] of this.privateRooms) {
      if (room.status !== "playing" && room.createdAt < cutoff) {
        room.status = "closed";
        this.privateRooms.delete(code);
      }
    }
  }

  private async persistRoom(code: string, host: PublicPlayer) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return;
    }

    await supabase.from("rooms").insert({
      code,
      host_user_id: host.userId ?? null,
      host_guest_id: host.guestId ?? null,
      status: "waiting"
    });
  }

  private async persistMatchStart(match: MatchState) {
    const supabase = getSupabaseAdmin();
    if (!supabase || !isUuid(match.paragraph.id)) {
      return false;
    }

    const { error } = await supabase.from("matches").insert({
      id: match.id,
      mode: match.mode,
      status: "countdown",
      paragraph_id: match.paragraph.id,
      seed: match.seed,
      started_at: new Date(match.startedAt).toISOString()
    });

    if (error) {
      console.error("[match] failed to persist match start", error.message);
      return false;
    }

    if (match.roomCode) {
      await supabase
        .from("rooms")
        .update({
          status: "playing",
          match_id: match.id,
          paragraph_id: match.paragraph.id
        })
        .eq("code", match.roomCode);
    }

    return true;
  }

  private async persistMatchEnd(match: MatchState, payload: MatchEndedPayload) {
    const supabase = getSupabaseAdmin();
    if (!supabase || !match.dbMatchPersisted) {
      return;
    }

    const winner = payload.results.find((result) => result.won);
    await supabase
      .from("matches")
      .update({
        status: "completed",
        ended_at: new Date(payload.endedAt).toISOString(),
        winner_user_id: winner?.player.userId ?? null,
        winner_guest_id: winner?.player.guestId ?? null,
        winner_reason: payload.reason
      })
      .eq("id", match.id);

    await supabase.from("match_results").insert(
      payload.results.map((result) => ({
        match_id: match.id,
        user_id: result.player.userId ?? null,
        guest_id: result.player.guestId ?? null,
        display_name: result.player.name,
        wpm: result.stats.wpm,
        accuracy: result.stats.accuracy,
        completion_percent: result.stats.completionPercent,
        completed_at: result.stats.completed
          ? new Date(match.startedAt + (result.stats.completionMs ?? 0)).toISOString()
          : null,
        completion_ms: result.stats.completionMs ?? null,
        rank_delta: result.rankDelta,
        xp_delta: result.xpDelta,
        suspicious_flags: result.stats.suspiciousFlags,
        won: result.won
      }))
    );

    await Promise.all(
      payload.results
        .filter((result) => result.player.userId)
        .map((result) =>
          updateUserAfterMatch({
            userId: result.player.userId as string,
            won: result.won,
            wpm: result.stats.wpm,
            accuracy: result.stats.accuracy,
            mmrDelta: result.rankDelta,
            xpDelta: result.xpDelta
          })
        )
    );

    if (match.roomCode) {
      await supabase.from("rooms").update({ status: "closed" }).eq("code", match.roomCode);
    }
  }
}

function determineWinner(states: MatchPlayerState[]) {
  return [...states].sort((a, b) => {
    if (a.stats.completed !== b.stats.completed) {
      return Number(b.stats.completed) - Number(a.stats.completed);
    }

    if (a.stats.wpm !== b.stats.wpm) {
      return b.stats.wpm - a.stats.wpm;
    }

    if (a.stats.accuracy !== b.stats.accuracy) {
      return b.stats.accuracy - a.stats.accuracy;
    }

    const aCompletion = a.stats.completionMs ?? Number.MAX_SAFE_INTEGER;
    const bCompletion = b.stats.completionMs ?? Number.MAX_SAFE_INTEGER;
    if (aCompletion !== bCompletion) {
      return aCompletion - bCompletion;
    }

    return b.stats.completionPercent - a.stats.completionPercent;
  })[0];
}

function identityKey(player: PublicPlayer) {
  return player.userId ? `user:${player.userId}` : `guest:${player.guestId}`;
}
