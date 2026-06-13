"use client";
import React from "react";
import { motion } from "framer-motion";
import { X, Sliders, RefreshCw, Palette, Link2 } from "lucide-react";
import { useMonitoringEditorStore } from "@/store/monitoringEditorStore";

export default function MonitoringRightPanel() {
  const {
    selectedGridItem, selectedAppWidget,
    widgetProps, updateWidgetProps,
    setShowRightPanel, removeWidget,
  } = useMonitoringEditorStore();

  const selected = selectedGridItem ?? selectedAppWidget;
  const instanceId = selectedGridItem?.instanceId ?? null;
  const props = instanceId ? widgetProps[instanceId] : null;

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
        <Sliders className="w-8 h-8" />
        <p className="text-xs">오브젝트를 선택하세요</p>
      </div>
    );
  }

  const title = instanceId
    ? (props?.title ?? selectedGridItem?.widgetId ?? "위젯")
    : (selectedAppWidget?.label ?? "컴포넌트");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-sm font-medium text-white/80 flex-1 truncate">{title}</span>
        <button
          onClick={() => setShowRightPanel(false)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/40" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3 flex flex-col gap-5">
        {/* 기본 설정 */}
        <section>
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">기본 설정</h3>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-white/50">위젯 제목</span>
              <input
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                value={props?.title ?? title}
                onChange={(e) =>
                  instanceId && updateWidgetProps(instanceId, { title: e.target.value })
                }
                placeholder="제목 입력"
              />
            </label>
          </div>
        </section>

        {/* 색상 */}
        <section>
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Palette className="w-3 h-3" /> 색상
          </h3>
          <div className="flex gap-2 flex-wrap">
            {["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#f97316"].map((c) => (
              <button
                key={c}
                onClick={() => instanceId && updateWidgetProps(instanceId, { color: c })}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: props?.color === c ? "white" : "transparent",
                }}
              />
            ))}
          </div>
        </section>

        {/* 갱신 주기 */}
        <section>
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> 갱신 주기
          </h3>
          <div className="flex gap-2">
            {[1000, 2000, 5000, 10000].map((ms) => (
              <button
                key={ms}
                onClick={() => instanceId && updateWidgetProps(instanceId, { refreshInterval: ms })}
                className={`flex-1 py-1 rounded text-[11px] border transition-colors ${
                  props?.refreshInterval === ms
                    ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/5 text-white/40"
                }`}
              >
                {ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}
              </button>
            ))}
          </div>
        </section>

        {/* 임계값 */}
        <section>
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">임계값</h3>
          <div className="flex flex-col gap-2">
            {[
              { key: "warning", label: "경고", default: 7.1 },
              { key: "critical", label: "위험", default: 11.2 },
            ].map((t) => (
              <label key={t.key} className="flex items-center gap-2">
                <span className="text-[11px] text-white/50 w-10 shrink-0">{t.label}</span>
                <input
                  type="number"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400/50"
                  defaultValue={props?.thresholds?.[t.key] ?? t.default}
                  onChange={(e) =>
                    instanceId &&
                    updateWidgetProps(instanceId, {
                      thresholds: { ...props?.thresholds, [t.key]: parseFloat(e.target.value) },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </section>

        {/* 데이터 소스 */}
        <section>
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Link2 className="w-3 h-3" /> 데이터 소스
          </h3>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-cyan-400/50"
            defaultValue=""
          >
            <option value="">소스 선택...</option>
            <option value="vibration-sensor">진동 센서</option>
            <option value="gas-sensor">가스 센서</option>
            <option value="temperature-sensor">온도 센서</option>
            <option value="ultrasound-sensor">초음파 센서</option>
            <option value="worker-safety">작업자 안전</option>
            <option value="communication">통신</option>
          </select>
        </section>

        {/* 삭제 */}
        {instanceId && (
          <button
            onClick={() => {
              removeWidget(instanceId);
              setShowRightPanel(false);
            }}
            className="w-full py-2 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-sm hover:bg-red-500/15 transition-colors"
          >
            위젯 삭제
          </button>
        )}
      </div>
    </div>
  );
}
