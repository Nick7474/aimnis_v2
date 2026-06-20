"use client";
import { BaseEdge, type EdgeProps } from "reactflow";

export default function ProjectLineEdge({ sourceX, sourceY, targetX, targetY, style, label, labelStyle, labelBgStyle, labelBgPadding, data }: EdgeProps) {
  const dir = targetX >= sourceX ? 1 : -1;
  const dist = Math.abs(targetX - sourceX);
  const lead = Math.max(28, Math.min(96, dist * 0.16));
  const sx = sourceX + lead * dir;
  const ex = targetX - lead * dir;
  const lx = (sx + ex) / 2;
  const ly = (sourceY + targetY) / 2;
  const isLatest = !!data?.isLatest;
  const path = `M ${sourceX} ${sourceY} L ${sx} ${sourceY} L ${ex} ${targetY} L ${targetX} ${targetY}`;
  return (
    <>
      <BaseEdge path={path} style={{ stroke: "rgba(4,7,18,0.9)", strokeWidth: 4.5, strokeLinecap: "round", strokeLinejoin: "round" }} />
      <BaseEdge path={path} label={label} labelX={lx} labelY={ly} labelStyle={labelStyle} labelBgStyle={labelBgStyle} labelBgPadding={labelBgPadding}
        style={{ ...style, strokeLinecap: "round", strokeLinejoin: "round", filter: isLatest ? "drop-shadow(0 0 5px rgba(20,184,166,0.38))" : undefined }} />
      {isLatest && (<circle r="2.5" fill="#14b8a6"><animateMotion dur="1.4s" repeatCount="indefinite" path={path} /></circle>)}
    </>
  );
}
