import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  VideoCameraOutlined, BellOutlined, BarChartOutlined,
  ThunderboltOutlined, SettingOutlined, PlusOutlined, CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { AVAILABLE_PAGES, useGuardPagesStore } from "@/store/guardPagesStore";

const ICON_MAP: Record<string, React.ReactNode> = {
  VideoCameraOutlined: <VideoCameraOutlined />,
  BellOutlined: <BellOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  SettingOutlined: <SettingOutlined />,
};

interface Props {
  onClose: () => void;
  onAdded: (key: string) => void;
}

const PageBuilder: React.FC<Props> = ({ onClose, onAdded }) => {
  const { addedPages, addPage } = useGuardPagesStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const available = AVAILABLE_PAGES.filter(
    (p) => !addedPages.some((a) => a.key === p.key)
  );

  const handleAdd = () => {
    if (!selected) return;
    addPage(selected);
    setJustAdded(selected);
    onAdded(selected);
    setTimeout(() => {
      setJustAdded(null);
      setSelected(null);
      onClose();
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: 360,
        background: "#0C1733",
        borderLeft: "1px solid #1E3A5F",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* 헤더 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid #1E3A5F",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            페이지 추가
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            추가할 페이지를 선택하세요
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 7,
            border: "1px solid #1E3A5F", background: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#64748b", fontSize: 12,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#93c5fd"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; }}
        >
          <CloseOutlined />
        </button>
      </div>

      {/* 페이지 목록 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {available.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: 200, gap: 10,
          }}>
            <CheckOutlined style={{ fontSize: 28, color: "#16A34A" }} />
            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
              모든 페이지가 추가되었습니다
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {available.map((page) => {
              const isSelected = selected === page.key;
              return (
                <motion.button
                  key={page.key}
                  onClick={() => setSelected(isSelected ? null : page.key)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? "rgba(37,99,235,0.6)" : "#1E3A5F"}`,
                    background: isSelected ? "rgba(37,99,235,0.14)" : "#070F24",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .15s",
                    boxShadow: isSelected ? "0 0 0 1px rgba(37,99,235,0.25)" : "none",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = "#1E3A5F";
                  }}
                >
                  {/* 아이콘 */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    background: isSelected ? "rgba(37,99,235,0.22)" : "rgba(37,99,235,0.08)",
                    border: `1px solid ${isSelected ? "rgba(37,99,235,0.5)" : "rgba(37,99,235,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isSelected ? "#60A5FA" : "#3b82f6",
                    fontSize: 16,
                    transition: "all .15s",
                  }}>
                    {ICON_MAP[page.icon]}
                  </div>

                  {/* 텍스트 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? "#e2e8f0" : "#94a3b8",
                      marginBottom: 3,
                    }}>
                      {page.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.4 }}>
                      {page.desc}
                    </div>
                  </div>

                  {/* 선택 인디케이터 */}
                  {isSelected && (
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#2563EB", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <CheckOutlined style={{ fontSize: 10, color: "white" }} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 추가 버튼 */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid #1E3A5F",
        flexShrink: 0,
      }}>
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.div
              key="done"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, height: 40, borderRadius: 9,
                background: "rgba(22,163,74,0.18)",
                border: "1px solid rgba(22,163,74,0.4)",
                color: "#4ade80", fontSize: 13, fontWeight: 600,
              }}
            >
              <CheckOutlined /> 페이지 추가 완료
            </motion.div>
          ) : (
            <motion.button
              key="add"
              onClick={handleAdd}
              disabled={!selected}
              whileTap={selected ? { scale: 0.98 } : {}}
              style={{
                width: "100%", height: 40,
                borderRadius: 9, border: "none", cursor: selected ? "pointer" : "not-allowed",
                background: selected
                  ? "linear-gradient(135deg, #1d4ed8, #2563EB)"
                  : "rgba(37,99,235,0.08)",
                color: selected ? "white" : "#334155",
                fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all .2s",
                boxShadow: selected ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
              }}
            >
              <PlusOutlined />
              {selected
                ? `"${AVAILABLE_PAGES.find((p) => p.key === selected)?.label}" 페이지 추가`
                : "페이지를 선택하세요"}
            </motion.button>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 8, fontSize: 10, color: "#334155", textAlign: "center" }}>
          추가된 페이지는 좌측 메뉴에 즉시 반영됩니다
        </div>
      </div>
    </motion.div>
  );
};

export default PageBuilder;
