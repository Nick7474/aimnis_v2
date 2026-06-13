"use client";
import React, { useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MessageCircle, LayoutGrid } from "lucide-react";
import { useMonitoringEditorStore } from "@/store/monitoringEditorStore";
import WidgetLibraryPanel from "./WidgetLibraryPanel";
import MonitoringChatPanel from "./MonitoringChatPanel";

export default function MonitoringLeftPanel() {
  const { leftTab, setLeftTab } = useMonitoringEditorStore();

  return (
    <Tabs.Root
      value={leftTab}
      onValueChange={(v) => setLeftTab(v as "chat" | "widgets")}
      className="flex flex-col h-full"
    >
      {/* 탭 헤더 */}
      <Tabs.List className="flex shrink-0 border-b border-white/5 px-2 pt-2">
        <Tabs.Trigger
          value="chat"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t border-b-2 transition-colors mr-1
            data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400
            data-[state=inactive]:border-transparent data-[state=inactive]:text-white/40
            hover:text-white/70`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          채팅
        </Tabs.Trigger>
        <Tabs.Trigger
          value="widgets"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t border-b-2 transition-colors
            data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400
            data-[state=inactive]:border-transparent data-[state=inactive]:text-white/40
            hover:text-white/70`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          위젯
        </Tabs.Trigger>
      </Tabs.List>

      {/* 탭 컨텐츠 */}
      <Tabs.Content value="chat" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
        <MonitoringChatPanel />
      </Tabs.Content>
      <Tabs.Content value="widgets" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
        <WidgetLibraryPanel />
      </Tabs.Content>
    </Tabs.Root>
  );
}
