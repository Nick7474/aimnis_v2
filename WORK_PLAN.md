# AIMNIS MVP 고도화 작업 계획서

**작성일**: 2026-05-05  
**목표**: 시리즈 A 투자 유치 — 퀄리티·친근함·설득력·현장 즉시 적용  
**전략**: Claude Advisor (OpusPlan → Sonnet Execution)

---

## 작업 목록

| # | 작업 | 파일 | 상태 | 우선순위 |
|---|------|------|------|---------|
| T1 | 로딩 디자인 피그마 스펙 적용 | AIMILoader.tsx | ⬜ | P1 |
| T2 | 용어 수정 3개 | scenarios.ts | ⬜ | P1 |
| T3 | 에임이 캐릭터 전 패널 일관 등장 | HomeHero/HomeV2/ChatPanel | ⬜ | P1 |
| T4 | 전문가 추천 세팅 자연어 감지 | homeStore/HomeV2 | ⬜ | P2 |
| T5 | 에디터 Intent Parser | intentParser/ChatPanel | ⬜ | P2 |

---

## 목표 품질 기준

- **퀄리티**: 버그 없고 애니메이션 자연스러움
- **친근함**: 에임이 캐릭터로 사람 같은 AI 경험
- **설득력**: VC가 "이거 실제로 쓸 수 있겠다" 느끼는 완성도
- **명쾌함**: 버튼 한 번, 말 한 마디로 동작
- **현장 적용**: 실제 산업 용어, 실제 시나리오

---

## T1 — 로딩 디자인 피그마 스펙 적용

### 피그마 스펙 (node: 87:41, fileKey: EhasarVZqEsYRZmbUnMEss)

```
오버레이 BG: #131316 (createPortal → body)

카드: 200×200px
  bg: rgba(30,33,36,0.2)
  backdrop-blur: 10px
  border: 1px solid rgba(255,255,255,0.05)
  border-radius: 10px

카드 내부:
  글로우: absolute, 캐릭터 뒤 radial gradient
  캐릭터: top 39px, height ~85px, 가로 중앙
  "Loading...": top 134px, 12px, #b1b8be, 중앙
  서브타이틀: top 164px, 12px, white, 중앙
```

### 5개 카드 컨텍스트 배정

| 캐릭터 | 글로우 색 | 컨텍스트 | 적용 위치 |
|--------|---------|---------|---------|
| ch5 (AI 클라우드) | 빨강/오렌지 | AI 명령 처리 | ChatPanel 스트리밍 (선택) |
| ch1 (태블릿 작업) | 파랑 | Step2 하네스 생성 | CreateHarnessBtn |
| ch4 (만세/점프) | 보라 | 전문가 추천 완료 | homeStore magic |
| ch3 (팔짱) | 보라 | 에디터 분석 중 | (선택) |
| ch2 (손 흔들기) | 다크 | Guard 초기 진입 | guard/page.tsx |

### 서브타이틀 (컨텍스트별 순환)

```
ch1 (하네스):  "현장 데이터 구조 분석 중"
               "맞춤 위젯 레이아웃 구성 중"
               "최적 하네스 패턴 적용 중"
               "마지막 검수 진행 중"

ch2 (Guard):   "실시간 모니터링 활성화 중"
               "센서 장비 연결 확인 중"
               "알람 규칙 로드 중"
```

### 변경 파일
- `src/components/shared/AIMILoader.tsx` — 피그마 스펙 완전 재작성
- `src/components/home/CreateHarnessBtn.tsx` — HarnessLoader(ch1) 유지
- `src/app/guard/page.tsx` — GuardLoader(ch2) 유지

---

## T2 — 용어 수정

**파일**: `src/data/scenarios.ts`

| 필드 | 현재 | 수정 |
|------|------|------|
| scenarios[0].label | 국가 에너지 관제 | **에너지 시설 통합 관제** |
| scenarios[1].label | 하이테크 제조 관제 | **스마트 제조 이상 감지** |
| scenarios[2].label | 스마트시티 재난 대응 | **스마트시티 안전 관제** |

---

## T3 — 에임이 캐릭터 전 패널 일관 등장

### 목표
시리즈 A MVP에서 AI 어시스턴트의 인격을 통일해 친근함과 신뢰를 동시에 전달.
ch6.png (원형 아바타)를 모든 채팅 패널 헤더에 일관 배치.

### UI 공통 규격
```
헤더:
[ch6 40px 원형 아바타] [에임이 · AIMI]  ● 온라인(emerald animate-pulse)
                       [컨텍스트 뱃지]

아바타: w-10 h-10 rounded-full ring-2 ring-violet-500/30
이름: 13px font-semibold text-white/80
상태: 2px h-2 w-2 rounded-full bg-emerald-400 animate-pulse
```

### 이름 통일 원칙
- 채팅 버블 내: **에임이**
- 헤더 표기: **에임이 · AIMI**
- GNB/공식: **AIMNIS** 유지
- 로딩카드: **AIMI**

### Step1 — HomeHero 채팅 입력창 위 (첫 인상)

```
[에임이 프로필] 에임이 · AIMI  ● 온라인

환영 버블:
"안녕하세요! 저는 에임이예요 🦊
보안·에너지·스마트시티, 어떤 현장이든
맞춤 관제 시스템을 함께 만들어 드릴게요.

어떤 현장을 구축하고 싶으신가요?"
```

### Step2 — HomeV2 LeftPanel (전문가 어시스턴트)

```
[시나리오 미선택]
"에임이가 현장에 맞는 최적 설정을 도와드릴게요.
왼쪽에서 시나리오를 선택해 주세요 👆"

[에너지 선택 후 → 동적 변경]
"에너지 시설 전문가 모드예요 ⚡
항목을 직접 선택하거나
'전문가 추천으로 해줘'라고 말씀하세요."

[제조 선택 후]
"스마트 제조 현장 전문가 모드예요 🏭
항목을 채우거나 자유롭게 말씀하세요."

[스마트시티 선택 후]
"스마트시티 관제 전문가 모드예요 🏙
지자체 표준 설정을 바로 적용할 수 있어요."
```

### 에디터 — ChatPanel (숙련된 실무 어시스턴트)

```
초기 메시지:
"안녕하세요! AIMNIS 에디터예요 ✨
자연어로 말씀하시면 바로 실행해 드릴게요.

💡 이런 것도 가능해요
• '에너지 KPI 카드 추가해줘'
• '고객사를 포스코로 바꿔줘'
• '실시간 라인 차트 보여줘'
• '포스코 스타일로 전체 변경해줘'"
```

### 변경 파일
- `src/components/home/HomeHero.tsx` — 에임이 헤더 + 환영 버블
- `src/components/home/HomeV2.tsx` — LeftPanel 헤더 + 동적 메시지
- `src/components/editor/ChatPanel.tsx` — 헤더 + 초기 메시지 개선
- `src/store/editorStore.ts` — 초기 메시지 content 수정

---

## T4 — 전문가 추천 세팅 자연어 감지

### 목표
홈 Step2 채팅에서 감지 즉시 applyMagicDefault() 실행 → SpecBoard 순차 체크 애니메이션

### 감지 키워드 (클라이언트 사이드, API 호출 없음)
```typescript
const EXPERT_TRIGGERS = [
  "전문가 추천", "추천 세팅", "추천 설정", "추천으로",
  "자동으로", "알아서 해줘", "다 선택해줘", "한번에",
  "빠르게 설정", "기본값", "디폴트", "최적으로",
  "전문가처럼", "포스코 세팅", "kepco", "그냥 해줘",
  "빠르게", "바로 해줘", "알아서",
];
```

### 에임이 응답 메시지 (시나리오별)
```
energy:
"⚡ 에너지 시설 전문가 추천 세팅을 적용했어요!
500대+ CCTV, 24/365 운영, 하이브리드 스토리지로
자동 구성했습니다. 우측에서 세부 조정 가능해요."

manufacturing:
"🏭 스마트 제조 추천 세팅을 적용했어요!
Hanwha Wisenet VMS, 2교대 운영, 화재·침입
중점 관제로 구성했습니다."

smartcity:
"🏙 스마트시티 표준 추천 세팅을 적용했어요!
Milestone XProtect, 경찰/소방 자동 신고 연동,
24/365 관제로 구성했습니다."
```

### 변경 파일
- `src/components/home/HomeV2.tsx` — LeftPanel ChatInput submit 핸들러

---

## T5 — 에디터 ChatPanel Intent Parser

### 카테고리 & 키워드

```typescript
// A. 브랜드/테마
"포스코": selectBrandPreset("posco") + setSystemTitle("포스코 통합관제")
"KEPCO": selectBrandPreset("kepco-white") + setSystemTitle("KEPCO 관제센터")
"어두운 톤": updateBrand({backgroundColor: "#060810"})
"밝은 톤": updateBrand 라이트 계열

// B. 위젯 일괄
"모두 지워": removeAllOverlayWidgets
"초기화": reset overlayWidgets

// C. 시스템 메타
"고객사를 X로": updateBrand({tenantName: X})
"시스템 이름을 X로": setSystemTitle(X)

// D. 뷰 전환
"데이터 연결": setCenterView("mapping")
"모니터링으로": setCenterView("monitor")
```

### 신규 파일
- `src/lib/intentParser.ts`

### 변경 파일
- `src/components/editor/ChatPanel.tsx`

---

## 체크리스트

```
[ ] T1: AIMILoader 피그마 스펙 재작성
[ ] T2: scenarios.ts 용어 3개
[ ] T3-A: HomeHero 에임이 헤더 + 버블
[ ] T3-B: HomeV2 LeftPanel 에임이 + 동적 메시지
[ ] T3-C: ChatPanel 에임이 헤더 + 초기 메시지
[ ] T4: HomeV2 전문가 추천 감지
[ ] T5: intentParser.ts + ChatPanel 연결
[ ] 최종: TS 체크 + 전체 커밋
```

---

## 커밋 계획

```
feat: 피그마 스펙 AIMI 로딩 카드 재설계
fix:  시나리오 용어 3개 수정
feat: 에임이 캐릭터 전 패널 일관 등장 (Step1/2 + 에디터)
feat: 전문가 추천 세팅 자연어 감지 + 애니메이션
feat: 에디터 Intent Parser — 브랜드/위젯/메타 자연어 직접 실행
```
