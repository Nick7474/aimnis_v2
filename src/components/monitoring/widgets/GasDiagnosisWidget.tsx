"use client";
import React, { useEffect, useState } from "react";
import { generateGasHistory, diagnoseGas, GasData, GasDiagnosis } from "@/monitoring-app/mock/data";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function GasDiagnosisWidget() {
  const [gas, setGas] = useState<GasData>(() => generateGasHistory(1)[0]);
  const [diag, setDiag] = useState<GasDiagnosis>(() => diagnoseGas(generateGasHistory(1)[0]));

  useEffect(() => {
    const t = setInterval(() => {
      const g = generateGasHistory(1)[0];
      setGas(g);
      setDiag(diagnoseGas(g));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const colors: Record<string, string> = {
    normal: "#10b981", warning: "#f59e0b", critical: "#ef4444"
  };
  const c = colors[diag.severity] ?? "#06b6d4";

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: `${c}40`, background: `${c}10` }}>
        {diag.severity === "normal"
          ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: c }} />
          : <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: c }} />}
        <div>
          <div className="text-xs font-bold" style={{ color: c }}>{diag.label}</div>
          <div className="text-[10px] text-white/40 leading-tight">{diag.detail}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        {[
          { key: "co",   label: "CO",   val: gas.co,   unit: "ppm" },
          { key: "ch4",  label: "CH₄",  val: gas.ch4,  unit: "ppm" },
          { key: "h2",   label: "H₂",   val: gas.h2,   unit: "ppm" },
          { key: "c2h2", label: "C₂H₂", val: gas.c2h2, unit: "ppm" },
        ].map((g) => (
          <div key={g.key} className="rounded bg-white/[0.03] border border-white/5 p-1.5">
            <div className="text-[9px] text-white/40">{g.label}</div>
            <div className="text-sm font-bold text-white">
              {g.val.toFixed(1)}
              <span className="text-[9px] font-normal text-white/30 ml-0.5">{g.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
