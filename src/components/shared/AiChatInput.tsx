"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Mic, MicOff, X, Image as ImageIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  attachedImages?: string[];
  onImagesChange?: (imgs: string[]) => void;
  className?: string;
}

// Web Speech API 타입 선언
interface ISpeechRecognitionEvent { resultIndex: number; results: { isFinal: boolean; [0]: { transcript: string } }[] }
interface ISpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function AiChatInput({
  value, onChange, onSubmit, isLoading = false,
  placeholder = "메시지를 입력하세요...",
  attachedImages = [], onImagesChange,
  className = "",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // ── 이미지 첨부 ────────────────────────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target?.result as string;
        onImagesChange?.([...attachedImages, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
    // 같은 파일 재선택 허용
    e.target.value = "";
  }, [attachedImages, onImagesChange]);

  const removeImage = (idx: number) => {
    onImagesChange?.(attachedImages.filter((_, i) => i !== idx));
  };

  // ── 음성 인식 ─────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const rec = new SpeechRec();
    rec.lang = "ko-KR";
    rec.continuous = false;
    rec.interimResults = true;

    let finalText = value;

    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e: ISpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript;
          onChange(finalText);
        } else {
          interim = e.results[i][0].transcript;
          onChange(finalText + interim);
        }
      }
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
  }, [isRecording, value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 focus-within:border-purple-500/30 transition-colors ${className}`}>
      {/* 첨부 이미지 미리보기 */}
      {attachedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-2.5">
          {attachedImages.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} alt="" className="h-14 w-14 rounded-lg object-cover border border-white/10" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? "🎤 음성 인식 중..." : placeholder}
        rows={2}
        className="w-full resize-none bg-transparent px-3 pt-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
        style={{ maxHeight: 100 }}
      />

      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center gap-1">
          {/* 이미지 첨부 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:text-violet-400 hover:bg-white/5 transition-colors"
            title="이미지 첨부"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 음성 인식 */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
              isRecording
                ? "text-red-400 bg-red-500/15 hover:bg-red-500/25"
                : "text-white/30 hover:text-violet-400 hover:bg-white/5"
            }`}
            title={isRecording ? "음성 인식 중지" : "음성 입력"}
          >
            {isRecording ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                <MicOff className="h-3.5 w-3.5" />
              </motion.div>
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* 전송 버튼 */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={(!value.trim() && attachedImages.length === 0) || isLoading}
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
            (value.trim() || attachedImages.length > 0) && !isLoading
              ? "bg-purple-600 text-white hover:bg-purple-500"
              : "bg-white/5 text-white/20"
          }`}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white"
            />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}
