"use client";

import { type ReactNode } from "react";
import { useSocketBoot } from "@/hooks/useGameSocket";

export function Providers({ children }: { children: ReactNode }) {
  useSocketBoot();
  return children;
}
