import { MatchArena } from "@/components/game/MatchArena";

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <MatchArena autoJoinCode={code.toUpperCase()} />;
}
