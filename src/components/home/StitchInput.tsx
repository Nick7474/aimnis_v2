"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Paperclip } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { cn } from "@/lib/utils";
import ScenarioChips from "./ScenarioChips";

interface StitchInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onFileChange: (file: File) => void;
  disabled?: boolean;
}

const TYPEWRITER_SPEED = 30; // ms/글자

export default function StitchInput({
  value,
  onChange,
  onSubmit,
  onFileChange,
  disabled,
}: StitchInputProps) {
  const { isThinking } = useHomeStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 타이핑 효과로 텍스트 삽입
  const typewriterInsert = (text: string) => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    onChange("");
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        onChange(text.slice(0, i));
        i++;
        typewriterRef.current = setTimeout(type, TYPEWRITER_SPEED);
      }
    };
    type();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };

  // textarea 높이 자동조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div
      className="rounded-2xl border bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
      style={{ borderColor: "rgba(0,212,255,0.2)" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isThinking}
        placeholder="솔루션 시나리오를 선택하거나 요구사항을 직접 입력하세요"
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none min-h-[80px]"
        style={{ maxHeight: 240 }}
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 파일 첨부 */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileRef.current?.click()}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </motion.button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.txt,.pdf,.png,.jpg,.jpeg"
            onChange={handleFile}
            className="hidden"
          />

          {/* 시나리오 칩 */}
          <ScenarioChips onSelect={typewriterInsert} />
        </div>

        {/* 전송 버튼 */}
        <motion.button
          type="button"
          onClick={onSubmit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!value.trim() || isThinking}
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all",
            value.trim() && !isThinking
              ? "text-white shadow-lg shadow-cyan-500/30"
              : "bg-white/5 text-white/20"
          )}
          style={
            value.trim() && !isThinking
              ? {
                  background: "linear-gradient(135deg, #0891b2, #00d4ff)",
                  boxShadow: "0 0 16px rgba(0,212,255,0.4)",
                }
              : undefined
          }
        >
          {isThinking ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
            />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
