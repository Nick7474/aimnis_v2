# UX Panel Refactor — 컨텍스트 기반 패널 전환

**작업일**: 2026-05-04  
**전략**: Claude Advisor (Haiku Plan → Sonnet Execution)

---

## 목표

Claude/Figma 디자인과 동일한 편집 모드 UX 구현.
Chat 패널은 항상 존재하되, 편집 모드 진입 시 딤 처리 후 뒤로 물러남.

---

## 레이아웃 스펙

### Mode A — 기본 (편집 모드 OFF)
```
┌────────────────────┬──────────────────────────────┐
│  Chat (280px)      │  Canvas (flex-1)             │
│  [정상 표시]       │                              │
└────────────────────┴──────────────────────────────┘
```

### Mode B — 편집 모드 (편집 버튼 클릭 or 위젯 선택)
```
◀──210px off-screen──▶
┌──────┬──────────────────────┬────────────┐
│ Chat │  Canvas (flex-1)     │  Settings  │
│ 70px │                      │ (슬라이드인)│
│ 딤드 │                      │   320px    │
└──────┴──────────────────────┴────────────┘
```
- Chat 컨테이너 `margin-left: -210px` → 210px가 뷰포트 왼쪽 밖으로
- 나머지 70px 스트립에 `bg-black/60 backdrop-blur` 오버레이 씌움
- 스트립 hover 시 흰색 ← 화살표 오버레이 우측(보이는 영역)에 나타남
- 스트립 클릭 → Mode A 복귀 (패널 제자리로 슬라이드 복귀)

---

## 트리거

| 액션 | 결과 |
|------|------|
| 헤더 `편집` 버튼 클릭 | Mode B 진입 (토글) |
| 위젯 클릭 (selectedElement 변경) | Mode B 진입 |
| 매핑 탭 클릭 | Mode B 진입 |
| 딤 오버레이 클릭 (← 화살표) | Mode A 복귀 |
| 빈 캔버스 클릭 (monitor 모드) | Mode A 복귀 |

---

## 헤더 편집 버튼

- 위치: 우측 액션 영역 (저장 버튼 앞)
- 비활성: 기본 스타일 (border-white/10 bg-white/5)
- 활성: 보라색 강조 (border-violet-500/40 bg-violet-500/15 text-violet-300)
- 아이콘: Edit3 (lucide)

---

## 딤 오버레이 UX

```
[Chat 패널 위에 absolute 포지션]
- 기본: bg-black/60 backdrop-blur-[1px]
- 호버: 중앙에 흰 ← 화살표 아이콘 페이드인
- 클릭: setShowRightPanel(false)
```

Chat 컨텐츠에 subtle translateX(-8px) 적용 → "뒤로 물러나는" 깊이감

---

## 변경 파일 (2개)

| 파일 | 변경 내용 |
|------|-----------|
| `src/store/editorStore.ts` | `showRightPanel` 상태 (완료) |
| `src/components/editor/EditorLayout.tsx` | 딤 오버레이 + 화살표 + 편집 버튼 |

> ChatPanel, DynamicPanel 내부 로직 수정 없음

---

## 애니메이션 스펙

- Chat 컨테이너 `marginLeft`: `0 → -210px` (spring stiffness:300 damping:30)
- 딤 오버레이: opacity `0 → 1` (duration:0.2s)
- ← 화살표: `group-hover:opacity-100` CSS transition (보이는 70px 스트립 우측 정렬)
- Right panel: `x: 320 → 0` slide-in (AnimatePresence)

---

## 상태

- [x] editorStore.ts — showRightPanel 추가
- [x] MD 내용 수정
- [ ] EditorLayout.tsx — 딤 오버레이 + 편집 버튼 구현
- [ ] 브라우저 확인
- [ ] 커밋
