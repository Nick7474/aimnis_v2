# AIMNIS Demo — Project Harness v3

## 매 세션 시작 시 필수 (순서 지킬 것)

```bash
pwd
cat claude-progress.txt
node -e "const f=require('./feature_list.json');const p=f.filter(x=>!x.passes);console.log('남은 작업:',p.length,'개');p.slice(0,3).forEach(x=>console.log('[P'+x.priority+']',x.id,x.description))"
git log --oneline -5
```

→ passes:false + 최저 priority 항목 하나만 선택해서 작업

---

## 프로젝트 개요

AIMNIS 엔터프라이즈 AI 플랫폼 VC 데모.
**앱스토어 구조**: AIMNIS = 플랫폼, AIM GUARD/ECO = 앱(솔루션)

---

## 핵심 아키텍처 — 절대 벗어나지 말 것

```
AIMNIS Platform (core)
├── 에디터, 인증, 프로젝트DB, 마켓플레이스  ← 공통 코어
│
└── src/solutions/                          ← 솔루션 패키지들
    ├── guard/                              ← AIM GUARD
    │   ├── manifest.json                   ← 솔루션 메타데이터
    │   ├── harness-schema.json             ← 데이터 구조 정의
    │   ├── templates/default.json          ← 기본 레이아웃
    │   └── widgets/index.json              ← 전용 위젯 목록
    │
    ├── eco/                                ← AIM ECO
    │   ├── manifest.json
    │   ├── harness-schema.json
    │   ├── templates/default.json
    │   └── widgets/index.json
    │
    └── [추후 솔루션]/                      ← 폴더만 추가하면 끝
```
**프로젝트 전략**: Claude Advisor (Cost-Efficiency)
모든 작업은 토큰 절약과 품질 보장을 위해 아래 모델 전략을 엄격히 준수한다.

Phase 1: OpusPlan (Model: Opus 4.6)

고차원 아키텍처 설계, 비즈니스 로직 설계, 복잡한 리팩토링 계획 수립 시 사용.

코드를 작성하기 전, 반드시 전체 구조와 하네스(Harness) 설계를 포함한 Blueprint를 먼저 제안한다.

Phase 2: Execution (Model: Sonnet 4.6 / Haiku)

Opus 4.6이 수립한 계획에 따른 단순 코드 구현, 보일러플레이트 작성, 유닛 테스트 생성 시 사용.

Haiku + Opus 전략: 단순 루틴 작업은 Haiku로, 로직 검증이 필요한 구현은 Sonnet 4.6으로 이원화하여 $50 크레딧 소모를 최적화한다.

**규칙**: 솔루션 전용 데이터/위젯은 반드시 solutions/[name]/ 안에만 존재
**규칙**: core는 solutions/를 동적으로 읽음. 하드코딩 절대 금지
**규칙**: 모든 솔루션은 동일한 manifest.json 인터페이스를 가짐

---

## 기술 스택

- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Components: Shadcn/ui (Radix UI)
- Node Canvas: React Flow
- Charts: Recharts
- Animation: Framer Motion
- State: Zustand
- AI: Anthropic Claude API (스트리밍)
- Data: Mock JSON (DB 없음, 프론트 전용)

**AIM GUARD 결과물**: 별도 프로젝트 (Ant Design 기반), 디자인 고정

---

## 디자인 기준

- AIMNIS 에디터: 다크 + 퍼플/인디고 오로라 (Stitch + Linear 레퍼런스)
- AIM GUARD 뷰: 다크 네이비 + 시안/틸 (기존 디자인 고정, 절대 변경 금지)
- 토큰: src/styles/tokens.css 참조

---

## 페이지 구조

| 경로 | 페이지 |
|------|--------|
| `/` | 로그인 |
| `/home` | 홈 (AI 입력창 + 솔루션 카드) |
| `/editor` | 에디터 (3패널) |
| `/projects` | 프로젝트 DB |
| `/guard` | AIM GUARD 뷰 |
| `/eco` | AIM ECO 뷰 (추후) |

---

## 솔루션 추가 방법 (AIM ECO 등)

```
1. src/solutions/eco/ 폴더 생성
2. manifest.json 작성 (guard 것 복사 후 수정)
3. harness-schema.json 작성
4. templates/default.json 작성
5. widgets/index.json 작성
6. src/data/marketplace.json에 등록
→ 끝. core 코드 수정 불필요
```

---

## 코딩 규칙

- 파일 500줄 초과 금지 → 모듈 분리
- 솔루션 데이터 하드코딩 절대 금지 → solutions/ JSON 참조
- Tailwind 클래스만, 인라인 style 금지
- Framer Motion으로만 애니메이션
- TypeScript 필수
- AIM GUARD 디자인 수정 절대 금지
- 1280px 데스크톱 기준

---

## 세션 종료 전 필수

```bash
git add -A && git commit -m "feat: [feature명] - [요약]"
# claude-progress.txt 업데이트
# feature_list.json에서 완료 항목 passes: true, completedAt 업데이트
```
