import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── 비용 단가 (USD/1M tokens) ─────────────────────────────────
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "claude-haiku":               { input: 0.8, output: 4.0 },
  "claude-sonnet":              { input: 3.0, output: 15.0 },
  "claude-opus":                { input: 15.0, output: 75.0 },
  "gemini-flash-lite":          { input: 0.075, output: 0.3 },
};

export interface DayUsage {
  date: string;          // "2026-05-07"
  calls: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;       // 예상 비용 USD
}

interface UsageState {
  days: DayUsage[];      // 최근 30일

  // 액션
  addCall: (params: { inputTokens: number; outputTokens: number; model?: string }) => void;
  clearAll: () => void;

  // 계산된 값
  todayUsage: () => DayUsage | null;
  totalInputTokens: () => number;
  totalOutputTokens: () => number;
  totalCostUsd: () => number;
  last7Days: () => DayUsage[];
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function calcCost(inputTokens: number, outputTokens: number, model: string) {
  const price = PRICING[model] ?? PRICING["claude-haiku"];
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      days: [],

      addCall: ({ inputTokens, outputTokens, model = "claude-haiku-4-5-20251001" }) => {
        const date = today();
        const cost = calcCost(inputTokens, outputTokens, model);

        set((s) => {
          const existing = s.days.find((d) => d.date === date);
          if (existing) {
            return {
              days: s.days.map((d) =>
                d.date === date
                  ? {
                      ...d,
                      calls: d.calls + 1,
                      inputTokens: d.inputTokens + inputTokens,
                      outputTokens: d.outputTokens + outputTokens,
                      costUsd: d.costUsd + cost,
                    }
                  : d
              ),
            };
          }
          // 30일 초과 시 오래된 항목 제거
          const trimmed = s.days.slice(-29);
          return {
            days: [...trimmed, { date, calls: 1, inputTokens, outputTokens, costUsd: cost }],
          };
        });
      },

      clearAll: () => set({ days: [] }),

      todayUsage: () => get().days.find((d) => d.date === today()) ?? null,

      totalInputTokens: () => get().days.reduce((acc, d) => acc + d.inputTokens, 0),
      totalOutputTokens: () => get().days.reduce((acc, d) => acc + d.outputTokens, 0),
      totalCostUsd: () => get().days.reduce((acc, d) => acc + d.costUsd, 0),

      last7Days: () => {
        const all = get().days.slice(-7);
        // 7일 빈 날짜 채우기
        const result: DayUsage[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          result.push(all.find((x) => x.date === dateStr) ?? {
            date: dateStr, calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0,
          });
        }
        return result;
      },
    }),
    { name: "aimnis-usage-v1" }
  )
);

// ── 헬퍼: API 응답 헤더에서 usage 캡처 ───────────────────────────
export function captureUsageFromResponse(res: Response) {
  const inputTokens = parseInt(res.headers.get("X-Usage-Input") || "0", 10);
  const outputTokens = parseInt(res.headers.get("X-Usage-Output") || "0", 10);
  const model = res.headers.get("X-Usage-Model") || "claude-haiku-4-5-20251001";
  if (inputTokens > 0 || outputTokens > 0) {
    useUsageStore.getState().addCall({ inputTokens, outputTokens, model });
  }
}
