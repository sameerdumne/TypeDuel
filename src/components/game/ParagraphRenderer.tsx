"use client";

import { compareTypedCharacters } from "@/utils/typing";
import { cn } from "@/lib/cn";

export function ParagraphRenderer({
  paragraph,
  typed
}: {
  paragraph: string;
  typed: string;
}) {
  const characters = compareTypedCharacters(typed, paragraph);

  return (
    <div className="rounded-lg border border-white/10 bg-arena-950/70 p-5 shadow-inner sm:p-6">
      <p className="select-none font-mono text-xl font-semibold leading-9 text-slate-500 sm:text-2xl sm:leading-10">
        {characters.map(({ character, state }, index) => (
          <span
            key={`${character}-${index}`}
            className={cn(
              "rounded-[3px] transition-colors duration-100",
              state === "correct" && "text-emerald-300",
              state === "incorrect" && "bg-red-400/20 text-red-200",
              state === "pending" && "text-slate-500",
              index === typed.length && "typing-caret text-white"
            )}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        ))}
        {typed.length >= paragraph.length && <span className="typing-caret">&nbsp;</span>}
      </p>
    </div>
  );
}
