"use client";

import { useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";

const GUARD_ORIGIN = "http://localhost:3004";

export default function CanvasPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastCommand = useEditorStore((s) => s.lastCommand);

  // AI 명령이 올 때마다 iframe에 postMessage 전달
  useEffect(() => {
    if (!lastCommand) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      {
        type: "AIMNIS_COMMAND",
        userText: lastCommand.userText,
        aiResponse: lastCommand.aiResponse,
        timestamp: lastCommand.timestamp,
      },
      GUARD_ORIGIN
    );
  }, [lastCommand]);

  return (
    <div className="h-full w-full">
      <iframe
        ref={iframeRef}
        src={GUARD_ORIGIN}
        className="h-full w-full border-0"
        title="AIM GUARD"
        allow="same-origin"
      />
    </div>
  );
}
