import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LLMProvider = "gemma4" | "claude-haiku";

export const PROVIDER_META: Record<LLMProvider, { name: string; desc: string; color: string }> = {
  "gemma4":       { name: "Gemma 4",       desc: "로컬 · 무료",       color: "oklch(65% 0.16 145)" },
  "claude-haiku": { name: "Claude Haiku",  desc: "클라우드 · 빠름",   color: "oklch(60% 0.20 285)" },
};

interface LLMState {
  provider: LLMProvider;
  setProvider: (p: LLMProvider) => void;
}

export const useLLMStore = create<LLMState>()(
  persist(
    (set) => ({
      provider: "gemma4",
      setProvider: (provider) => set({ provider }),
    }),
    { name: "aimnis-llm-provider" }
  )
);
