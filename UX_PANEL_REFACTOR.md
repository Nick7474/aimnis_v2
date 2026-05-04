# UX Panel Refactor — 컨텍스트 기반 패널 전환

**작업일**: 2026-05-04  
**전략**: Claude Advisor (Haiku Plan → Sonnet Execution)  
**예상 소요**: ~1시간

---

## 목표

현재 항상 열려 있는 3패널(Chat + Canvas + Settings)을
컨텍스트 기반으로 전환되는 2+1 패널 구조로 변경.

---

## 레이아웃 스펙

### Mode A — 기본 (우측 패널 닫힘)
```
┌────────────────────┬──────────────────────────────┐
│  Chat (280px)      │  Canvas (flex-1)             │
│  [항상 표시]       │                              │
└────────────────────┴──────────────────────────────┘
```

### Mode B — 설정 활성화 (우측 패널 열림 → 챗 축소)
```
┌──────────┬──────────────────────────┬─────────────┐
│ Chat     │  Canvas (flex-1)         │ Settings    │
│ (160px)  │                          │ (320px)     │
│ ← 클릭시 │                          │ 슬라이드인  │
│  Mode A  │                          │             │
└──────────┴──────────────────────────┴─────────────┘
```

---

## 트리거 매핑

| 액션 | 결과 |
|------|------|
| 위젯 클릭 (selectedElement 변경) | Mode B 진입 |
| 매핑 탭 클릭 (centerView=mapping) | Mode B 진입 |
| 빈 캔버스 클릭 (monitor 모드) | Mode A 복귀 |
| 축소된 Chat 헤더 클릭 | Mode A 복귀 |

---

## 변경 파일 (3개)

| 파일 | 변경 내용 |
|------|-----------|
| `src/store/editorStore.ts` | `showRightPanel: boolean` + `setShowRightPanel` 추가 |
| `src/components/editor/EditorLayout.tsx` | 패널 조건부 렌더링 + 애니메이션 |

> ChatPanel, DynamicPanel 내부 로직 수정 없음

---

## 애니메이션 스펙

- Chat width: `280 → 160` (spring stiffness:300 damping:30)
- Right panel: `x: 320 → 0` slide-in (AnimatePresence)
- 드래그 핸들: Mode A에서만 표시

---

## 상태

- [ ] editorStore.ts 수정
- [ ] EditorLayout.tsx 수정
- [ ] 브라우저 확인
- [ ] 커밋
