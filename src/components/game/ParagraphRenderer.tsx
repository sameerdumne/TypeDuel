"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compareTypedCharacters } from "@/utils/typing";
import { cn } from "@/lib/cn";

const VISIBLE_WORDS = 5;

export function ParagraphRenderer({
  paragraph,
  typed
}: {
  paragraph: string;
  typed: string;
}) {
  const words = useMemo(() => paragraph.split(" "), [paragraph]);

  const currentWordIndex = useMemo(() => {
    let pos = 0;
    for (let i = 0; i < words.length; i++) {
      if (pos >= typed.length) return i;
      pos += words[i].length + 1;
    }
    return words.length;
  }, [typed, words]);

  const characters = useMemo(() => compareTypedCharacters(typed, paragraph), [typed, paragraph]);

  const startWord = Math.max(0, currentWordIndex);
  const endWord = Math.min(words.length, startWord + VISIBLE_WORDS);
  const windowWords = words.slice(startWord, endWord);

  const contentRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      const parent = el.parentElement;
      if (parent) setOverflows(el.scrollHeight > parent.clientHeight);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, [windowWords]);

  const wordStartChar = (wordIdx: number) => {
    const globalWordIdx = startWord + wordIdx;
    let pos = 0;
    for (let i = 0; i < globalWordIdx; i++) {
      pos += words[i].length + 1;
    }
    return pos;
  };

  return (
    <div className="rounded-lg border border-white/10 bg-arena-950/70 shadow-inner">
      <div
        key={startWord}
        className="relative max-h-[7rem] animate-floatIn p-5 sm:p-6"
        style={
          overflows
            ? {
                maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 85%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 40%, transparent 85%)"
              }
            : undefined
        }
      >
        <p
          ref={contentRef}
          className="select-none font-mono text-xl font-semibold leading-9 text-slate-500 sm:text-2xl sm:leading-10"
        >
          {currentWordIndex > 0 && (
            <span className="text-slate-600/40">{"\u2026 "}</span>
          )}
          {windowWords.map((word, idx) => {
            const startIdx = wordStartChar(idx);
            const isCurrent = idx === 0;

            return (
              <span
                key={`${startWord + idx}-${word}`}
                className="whitespace-nowrap"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {word.split("").map((ch, ci) => {
                  const globalIdx = startIdx + ci;
                  const state = characters[globalIdx]?.state ?? "pending";
                  return (
                    <span
                      key={ci}
                      className={cn(
                        "rounded-[3px] transition-colors duration-100",
                        isCurrent && state === "correct" && "text-emerald-300",
                        isCurrent && state === "incorrect" && "bg-red-400/20 text-red-200",
                        isCurrent && state === "pending" && "text-white",
                        !isCurrent && "text-slate-500"
                      )}
                    >
                      {ch}
                    </span>
                  );
                })}
                {idx < windowWords.length - 1 && (
                  <span className="text-slate-600">{"\u00A0"}</span>
                )}
              </span>
            );
          })}
        </p>

        {currentWordIndex + VISIBLE_WORDS < words.length && (
          <span className="mt-1 block text-xs font-bold uppercase tracking-[0.15em] text-slate-600/60">
            +{words.length - currentWordIndex - VISIBLE_WORDS} more words
          </span>
        )}
      </div>
    </div>
  );
}
