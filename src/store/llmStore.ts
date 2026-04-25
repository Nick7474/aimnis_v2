import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LLMProvider = "gemini-flash-lite" | "claude-haiku" | "claude-sonnet" | "claude-opus";

export const PROVIDER_META: Record<LLMProvider, { name: string; desc: string; color: string; badge?: string }> = {
  "gemini-flash-lite": { name: "Gemini Flash-Lite", desc: "클라우드 · 빠름 · 무료한도", color: "oklch(65% 0.18 250)" },
  "claude-haiku":      { name: "Claude Haiku",      desc: "클라우드 · 빠름 · 저비용",     color: "oklch(60% 0.20 285)" },
  "claude-sonnet":     { name: "Claude Sonnet",     desc: "클라우드 · 고품질 · 추천",    color: "oklch(70% 0.14 210)", badge: "추천" },
  "claude-opus":       { name: "Claude Opus 4.6",   desc: "클라우드 · 최고성능",         color: "oklch(75% 0.18 45)" },
};

// API 라우트로 전달할 때 사용하는 값
export function toApiProvider(p: LLMProvider): string {
  return p; // "gemma4" | "claude-haiku" | "claude-sonnet"
}

interface LLMState {
  provider: LLMProvider;
  setProvider: (p: LLMProvider) => void;
}

export const useLLMStore = create<LLMState>()(
  persist(
    (set) => ({
    provider: "gemini-flash-lite",
      setProvider: (provider) => set({ provider }),
    }),
    { name: "aimnis-llm-provider" }
  )
);
