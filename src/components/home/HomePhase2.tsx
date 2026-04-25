"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useHomeStore } from "@/store/homeStore";
import StitchInput from "./StitchInput";
import ChatArea from "./ChatArea";
import LiveBlueprint from "./LiveBlueprint";
import CreateHarnessBtn from "./CreateHarnessBtn";

interface AiResponse {
  message: string;
  questions: string[];
  blueprintUpdate?: { section: string; content: string };
  collectedInfo?: Record<string, string>;
  isComplete: boolean;
}

export default function HomePhase2() {
  const {
    messages,
    addMessage,
    isThinking,
    setIsThinking,
    selectedScenario,
    blueprintMd,
    appendBlueprint,
    setBlueprint,
  } = useHomeStore();

  const [inputValue, setInputValue] = useState("");

  // ─── 메시지 전송 & AI 인터뷰 ────────────────────────────────

  const handleSubmit = async () => {
    const text = inputValue.trim();
    if (!text || isThinking) return;
    setInputValue("");

    // 사용자 메시지 추가
    addMessage({ id: Date.now().toString(), role: "user", content: text });
    setIsThinking(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }],
          scenario: selectedScenario ?? "energy",
        }),
      });

      const raw = await res.text();
      let parsed: AiResponse;

      try {
        parsed = JSON.parse(raw);
      } catch {
        // JSON 파싱 실패 → 텍스트 그대로 표시
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: raw,
        });
        return;
      }

      // AI 메시지 추가
      const aiContent = [
        parsed.message,
        ...(parsed.questions?.length ? ["", ...parsed.questions.map((q) => `→ ${q}`)] : []),
      ].join("\n");

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      });

      // 수집된 정보 업데이트
      // Blueprint 업데이트
      if (parsed.blueprintUpdate) {
        const { section, content } = parsed.blueprintUpdate;
        const sectionHeader = `## ${section}`;
        if (blueprintMd.includes(sectionHeader)) {
          // 해당 섹션 뒤에 내용 추가
          setBlueprint(
            blueprintMd.replace(
              new RegExp(`(## ${section}\\n)`),
              `$1${content}`
            )
          );
        } else {
          appendBlueprint(`\n## ${section}\n${content}`);
        }
      }

      // 완료 시 Blueprint 상태 업데이트
      if (parsed.isComplete) {
        setBlueprint(blueprintMd.replace("상태: 인터뷰 진행 중...", "상태: ✅ 설계 완료"));
      }
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ AI 연결 오류가 발생했습니다. Ollama 서버를 확인하세요.",
      });
    } finally {
      setIsThinking(false);
    }
  };

  // ─── 파일 처리 ──────────────────────────────────────────────

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "md" || ext === "txt") {
      setInputValue(`기획서 파일 "${file.name}"을 분석해서 시스템 설계를 도와줘.`);
    } else if (["png", "jpg", "jpeg"].includes(ext ?? "")) {
      setInputValue(`"${file.name}" 이미지를 로고로 적용할까요?`);
    } else if (ext === "pdf") {
      setInputValue(`PDF 문서 "${file.name}"를 분석해서 요구사항을 추출해줘.`);
    } else {
      setInputValue(`기획서나 이미지를 올려주세요. ("${file.name}"은 지원하지 않습니다)`);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden pt-14">
      {/* 3열 레이아웃 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: AI 채팅 (55%) */}
        <div className="flex w-[55%] flex-col gap-0 border-r border-white/5 p-6">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex-shrink-0"
          >
            <h1 className="text-2xl font-bold text-white">
              무엇을 만들어 드릴까요?
            </h1>
            <p className="mt-1 text-sm text-white/40">
              AI 아키텍트가 역질문을 통해 맞춤 설계서를 생성합니다
            </p>
          </motion.div>

          {/* 채팅 영역 */}
          <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
            <ChatArea />
          </div>

          {/* 입력창 + Create Harness */}
          <div className="flex-shrink-0 mt-4 space-y-3">
            <StitchInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              onFileChange={handleFile}
              disabled={isThinking}
            />
            <CreateHarnessBtn />
          </div>
        </div>

        {/* 우측: Live Blueprint (45%) */}
        <div className="flex w-[45%] flex-col p-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 flex-shrink-0"
          >
            <h2 className="text-sm font-semibold text-white/50">Live Blueprint</h2>
            <p className="text-[11px] text-white/25 mt-0.5">
              대화 내용을 바탕으로 실시간으로 설계서가 작성됩니다
            </p>
          </motion.div>
          <div className="flex-1 min-h-0">
            <LiveBlueprint />
          </div>
        </div>
      </div>
    </div>
  );
}
