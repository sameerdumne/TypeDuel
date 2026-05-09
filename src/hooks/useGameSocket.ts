"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { env, hasSupabaseEnv } from "@/lib/env";
import { getGuestName, getOrCreateGuestId } from "@/lib/guest";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMatchStore } from "@/store/useMatchStore";
import type {
  LiveStatsPayload,
  MatchEndedPayload,
  MatchFoundPayload,
  OpponentUpdatePayload,
  PublicPlayer,
  TypingStats,
  TypingUpdatePayload
} from "@/types/game";

export function useSocketBoot() {
  const router = useRouter();
  const setSocket = useMatchStore((state) => state.setSocket);
  const setConnected = useMatchStore((state) => state.setConnected);
  const setPlayer = useMatchStore((state) => state.setPlayer);
  const setLiveStats = useMatchStore((state) => state.setLiveStats);
  const setQueueState = useMatchStore((state) => state.setQueueState);
  const setRoomCode = useMatchStore((state) => state.setRoomCode);
  const setMatch = useMatchStore((state) => state.setMatch);
  const setCountdownMs = useMatchStore((state) => state.setCountdownMs);
  const setStarted = useMatchStore((state) => state.setStarted);
  const setSelfStats = useMatchStore((state) => state.setSelfStats);
  const setOpponent = useMatchStore((state) => state.setOpponent);
  const setSummary = useMatchStore((state) => state.setSummary);
  const setError = useMatchStore((state) => state.setError);

  useEffect(() => {
    const socket = io(env.socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true
    });

    setSocket(socket);

    const identify = async () => {
      let accessToken: string | undefined;
      let name = getGuestName();

      if (hasSupabaseEnv()) {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data } = await supabase.auth.getSession();
          accessToken = data.session?.access_token;
          name =
            data.session?.user.user_metadata?.username ??
            data.session?.user.email?.split("@")[0] ??
            name;
        } catch {
          accessToken = undefined;
        }
      }

      socket.emit("player:hello", {
        accessToken,
        guestId: getOrCreateGuestId(),
        name
      });
    };

    socket.on("connect", () => {
      setConnected(true);
      void identify();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("player:ready", (player: PublicPlayer) => setPlayer(player));
    socket.on("stats:update", (stats: LiveStatsPayload) => setLiveStats(stats));
    socket.on("queue:waiting", () => setQueueState("waiting"));
    socket.on("queue:left", () => setQueueState("idle"));
    socket.on("room:created", ({ code }: { code: string }) => {
      setRoomCode(code);
      setQueueState("waiting");
    });
    socket.on("room:joined", ({ code }: { code: string }) => setRoomCode(code));
    socket.on("match:found", (match: MatchFoundPayload) => {
      setMatch(match);
      setRoomCode(match.roomCode);
      if (window.location.pathname !== "/match") {
        router.push("/match");
      }
    });
    socket.on(
      "match:countdown",
      ({ remainingMs }: { matchId: string; remainingMs: number; serverNow: number }) => {
        setCountdownMs(remainingMs);
      }
    );
    socket.on("match:started", () => {
      setStarted(true);
      setCountdownMs(0);
    });
    socket.on("self:update", ({ stats }: { stats: TypingStats; matchId: string }) => {
      setSelfStats(stats);
    });
    socket.on("opponent:update", (payload: OpponentUpdatePayload) => setOpponent(payload));
    socket.on("match:ended", (payload: MatchEndedPayload) => {
      setSummary(payload);
      setStarted(false);
    });
    socket.on("match:error", (message: string) => setError(message));

    return () => {
      socket.disconnect();
      setSocket(undefined);
    };
  }, [
    router,
    setConnected,
    setCountdownMs,
    setError,
    setLiveStats,
    setMatch,
    setOpponent,
    setPlayer,
    setQueueState,
    setRoomCode,
    setSelfStats,
    setSocket,
    setStarted,
    setSummary
  ]);
}

export function useGameActions() {
  const socket = useMatchStore((state) => state.socket);
  const match = useMatchStore((state) => state.match);
  const setQueueState = useMatchStore((state) => state.setQueueState);
  const resetMatch = useMatchStore((state) => state.resetMatch);

  return useMemo(
    () => ({
      joinQuickMatch() {
        setQueueState("waiting");
        socket?.emit("queue:join");
      },
      leaveQueue() {
        setQueueState("idle");
        socket?.emit("queue:leave");
      },
      createRoom() {
        setQueueState("waiting");
        socket?.emit("room:create");
      },
      joinRoom(code: string) {
        setQueueState("waiting");
        socket?.emit("room:join", { code });
      },
      sendTyping(typed: string) {
        if (!match) {
          return;
        }

        const payload: TypingUpdatePayload = {
          matchId: match.matchId,
          typed,
          clientSentAt: Date.now()
        };
        socket?.emit("typing:update", payload);
      },
      leaveMatch() {
        socket?.emit("match:leave");
        resetMatch();
      }
    }),
    [match, resetMatch, setQueueState, socket]
  );
}
