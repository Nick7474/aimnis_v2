# AIMNIS POC 구현·검수 정의서 — 개발 구현 계약서 v1.0

> 대상: 백엔드/풀스택 개발자 · QA
> 목적: 이 문서 하나로 **1차 POC 구현 범위**와 **완료(검수) 기준**을 **계약 수준으로 확정**한다.
> 작성 근거: 현재 리포지토리의 실제 코드·라우팅·상태관리·목업 데이터 직접 분석 (화면 추측 아님)
> 작성일: 2026-07-15 · 문서 등급: **구현 계약서 v1.0(확정)** · 기준 브랜치: `main`
> 표기 원칙: **[현재 코드]** = 리포에서 실측된 사실 / **[POC 목표]** = 이번 계약으로 확정된 구현 목표. 둘을 혼동하지 말 것.

---

## 0. 개발 착수 요약 (필독 — POC 목표·인프라·완료 기준)

### 0.1 AIMNIS 1차 POC 최우선 목표
> **Lenovo ThinkStation PGX**(= `AIMNIS 온프레미스 AI POC 서버` · 장비/모델은 후보(검증 전), [0.2](#02-장비모델-표기-규칙-문서-전체-통일) 참조)에 **Gemma 4**를 설치하고, **발전소 폐쇄망 적용을 전제로 외부 클라우드 LLM 없이** AIMNIS의 위젯 생성·편집 기능이 **내부망에서 실제로 동작하는지** 검증한다.

단순 화면 제작이나 외부 LLM API 연동이 목표가 **아니다**. 1차 POC에서 반드시 증명해야 하는 4가지:

1. **ThinkStation PGX에서 Gemma 4가 실제로 구동된다.**
2. **AIMNIS 백엔드가 내부 Gemma 4 추론 API를 호출한다.**
3. **Gemma 4가 위젯 제작 명령을 구조화된 결과(위젯 구성 JSON/도구 호출)로 반환한다.**
4. **내부 DB/API의 더미 데이터를 실제 위젯에 바인딩하고 저장·복원한다.**

### 0.2 장비·모델 표기 규칙 (문서 전체 통일)
> 아래 `후보(검증 전)` 항목은 **확정 사양이 아니다.** 발주/견적·장비 입고·벤치마크로 검증한 뒤 이 표를 갱신할 것. 임의 확정 금지.

| 항목 | 표기 | 상태 | 비고 |
|------|------|------|------|
| 장비명 | **Lenovo ThinkStation PGX** | 후보(검증 전) | 정확한 제품 라인/모델명 견적·발주 시 확인. `Lenovo DGX`·`DNX 서버`·`레노버 DGX` 등 혼용 금지 |
| 용도 표기 | **AIMNIS 온프레미스 AI POC 서버** | 확정 | 용도 명칭 |
| 세부 사양(CPU/GPU/통합메모리/저장장치) | 장비 견적서 확인 필요 | 후보(검증 전) | 임의 사양 확정 금지 |
| Gemma 4 세부 모델 | 후보: **Gemma 4 26B A4B (Instruction-Tuned)** | 후보(검증 전) | 총/활성 파라미터·메모리 요구량 벤치마크 후 확정 |
| 양자화 방식 | 통합메모리 확인 후 결정(후보 모델 적재 가능 여부 포함) | 후보(검증 전) | 실제 메모리·성능 테스트 후 확정 |

> 본문에서는 가독성을 위해 장비를 `Lenovo ThinkStation PGX`로 표기하나, **모델·사양이 확정되기 전까지는 위 표의 `후보(검증 전)` 상태가 우선한다.**

### 0.3 POC 확정 사항
- 대상 솔루션: `AIM Monitoring` / 대표 시나리오: `에너지 시설 통합 관제`(energy)
- AI 추론: **온프레미스 Gemma 4 (외부 클라우드 LLM 미사용, 폐쇄망 전제)**
- 데이터: 실제 발전소 데이터 대신 **내부 더미 데이터 API/DB**. 프론트엔드는 DB 직접 접속 금지.

### 0.4 완료 기준 (Definition of Done)
- [ ] **DoD-1** ThinkStation PGX에서 Gemma 4 로딩 + Health Check 정상
- [ ] **DoD-2** AIMNIS 백엔드 → 내부 Gemma 4 추론 API 호출 성공(**외부 호출 0건**, [2-1](#2-1-폐쇄망-외부-의존성-점검-item-6-7) 폐쇄망 모드)
- [ ] **DoD-3** **위젯 제작 채팅** 명령 → Gemma 4가 **허용 Tool Call([5.4](#54-gemma-4-tool-call-화이트리스트--item-3))** 반환 → 백엔드 검증 후 **10종 위젯([7.1](#71-poc-확정-위젯-10종--gemma-4-제작대상--item-2))** 만 실행 (운영 분석 채팅은 제외 — [5.1](#51-ai-채팅의-정의--위젯-제작-어시스턴트로-한정-item-1))
- [ ] **DoD-4** 내부 더미 데이터 URL(**백엔드 경유만**) 조회 → 위젯 바인딩 → 갱신 → 저장 → 재접속 복원 ([4.7](#47-내부-데이터-url-연동--위젯-바인딩-1차-poc-실제-구현-범위--화면-모의-아님))
- [ ] **DoD-5** **프로젝트·Spec·위젯·데이터 매핑을 서버 DB에 저장**하고 재접속 시 복원 ([6](#6-데이터--상태-관리-영속성-지도))
- [ ] **DoD-6** **Spec Board 결과 → Gemma 4 → 통합 대시보드 1개에 초기 위젯 4~6개(확정 10종 내) 실제 반영** ([4.4](#44-현장-요구spec--gemma-4--실제-위젯-구성-반영-item-4))
- [ ] **DoD-7** **폐쇄망 외부 의존성 0건**: 외부 LLM fallback 차단 + CDN/폰트/이미지/스크립트 내재화 검증 ([2-1](#2-1-폐쇄망-외부-의존성-점검-item-6-7))
- [ ] **DoD-8** **POC 통합 초기화**: 프로젝트 + 더미 데이터 + 로컬 draft를 한 번에 초기화 ([4.12](#412-poc-데이터-초기화--통합-초기화-item-8))
- [ ] **DoD-9** [9. E2E 체크리스트](#9-검수-체크리스트-e2e--단일-흐름) 전 항목 통과
- [ ] **DoD-10** POC 통합 초기화 후 전체 E2E 흐름을 **개발자 개입 없이 3회 연속** 정상 수행([9.1](#91-반복-안정성-기준-dod-10--item-6))
> ⚠️ **[현재 코드]는 외부 클라우드 LLM(Anthropic Claude / Google Gemini)을 호출**한다. **[POC 목표]** Gemma 4 온프레미스 구성은 **미구현 → 신규 개발 대상**. 상세 차이는 [2·5·8(C9)](#8-상위-원칙-대비-충돌확인-필요) 참조.

### 0.5 POC 인프라 역할 구분 (논리적 분리)
ThinkStation PGX 한 대에서 함께 테스트하더라도 아래 3역할을 **논리적으로 분리**해 구현·문서화한다.

**① Gemma 4 AI 서버** (ThinkStation PGX)
- Gemma 4 모델 로딩 · 내부 추론 API 제공
- Spec Board 요구사항 해석 · 위젯 제작 채팅 명령 해석
- **허용된 위젯 구성 JSON 또는 도구 호출 결과** 생성
- 모델 Health Check · 요청/응답 및 추론 시간 기록 · 모델 오류 기록

**② AIMNIS 백엔드**
- 프론트 요청 수신 · Gemma 4 추론 API 호출 · **결과 검증**
- **허용된 위젯 기능만 실행** · 프로젝트/페이지/위젯 설정 저장
- 내부 DB/API 데이터 조회 · 위젯 데이터 바인딩 · 오류/권한 처리

**③ 임시 DB · 내부 데이터 API** (실 발전소 데이터 대체 더미)
- 설비 정보 / 설비 상태 / 온도·진동 등 센서 시계열 / 설비 이상 이벤트 / 정상·주의·위험 상태 / 위젯 바인딩용 필드 정보
- **프론트엔드 DB 직접 접속 금지.**

**권장 데이터 흐름**
```text
AIMNIS Frontend → AIMNIS Backend → Gemma 4 Inference API   (위젯 제작/요구 해석)
AIMNIS Frontend → AIMNIS Backend → 내부 더미 데이터 API/DB → 위젯 데이터 반환   (데이터 바인딩)
```

---

## 0-1. 문서 사용법

- **구현 대상** 항목만 개발/검수한다. `화면 모의`·`POC 제외`는 디자인/클릭 반응만 유지하며 기능 구현 대상이 아니다.
- 각 항목에 **근거 파일**을 명시했다. 코드에서 확인되지 않은 것은 `확인 필요`로 표기했다.
- POC 상위 원칙과 코드가 충돌하는 지점은 [8. 상위 원칙 대비 충돌·확인 필요](#8-상위-원칙-대비-충돌확인-필요)에 별도 정리했다.

---

## 1. POC가 증명해야 하는 단일 흐름

```
로그인 → (홈) 현장 요구 입력 → AI 화면 구성 생성 → 제한된 위젯 편집
      → 제한된 데이터 연결 → 프로젝트 저장 → 재접속 후 복원 → 읽기 전용 결과 확인
```

핵심 명제: **현장 담당자가 요구사항을 입력하면, 사전에 정의된 위젯·데이터 구조 안에서 모니터링 화면이 생성되고, 사용자가 이를 수정·저장·재사용할 수 있다.**

- **실제 구현 대상 솔루션**: `AIM Monitoring` (id: `monitoring`)
- **대표 시나리오**: `에너지 시설 통합 관제` (발전·ESS·전기 설비) — [scenarios.ts:363-387](src/data/scenarios.ts#L363-L387)
- **제외 솔루션**: AIM GUARD, AIM ECO, AIM Physical AI, AIM City, AIM Environment 등

---

## 2. 기술 스택 · 실행 전제

| 항목 | 내용 | 근거 |
|------|------|------|
| Framework | Next.js 14 (App Router) | [package.json](package.json) |
| 상태관리 | Zustand (일부 `persist`) | `src/store/*` |
| 데이터 | **현재: DB 없음·프론트 전용**(Mock JSON+localStorage) → **POC 목표: 내부 더미 DB/데이터 API** | 하단 3·6·4.7 참조 |
| AI (현재 코드) | 외부 클라우드 LLM — Anthropic Claude Haiku `claude-haiku-4-5-20251001` / (하네스는 Google Gemini fallback) | [api/chat](src/app/api/chat/route.ts), [api/home](src/app/api/home/route.ts), [api/harness](src/app/api/harness/route.ts) |
| **AI (POC 목표)** | **온프레미스 Gemma 4** @ Lenovo ThinkStation PGX (외부 클라우드 미사용, 폐쇄망) | [0.1](#01-aimnis-1차-poc-최우선-목표) · 신규 개발 |
| 캔버스 | React Flow (데이터 매핑), 커스텀 그리드(위젯 배치) | `monitoring-editor/*` |

> **⚠️ 아키텍처 전환 핵심**: 현재 코드는 외부 클라우드 LLM을 직접 호출한다. POC 목표는 **AIMNIS 백엔드가 ThinkStation PGX의 내부 Gemma 4 추론 API를 호출**하는 구조다. 프론트가 LLM/DB를 직접 호출하지 않고 백엔드를 경유하도록 재구성해야 한다([0.5](#05-poc-인프라-역할-구분-논리적-분리)).

**실행 전제**
- **POC 목표 구성**: 외부 API 키 대신 **내부 Gemma 4 추론 엔드포인트**(예: `GEMMA_INFERENCE_URL`)를 백엔드 환경변수로 사용. 외부 네트워크 호출 0건이어야 함.
- **현재 코드 구동 시(개발 편의)**: `ANTHROPIC_API_KEY` 필수(없으면 채팅/추천 오류 텍스트), `GOOGLE_API_KEY` 선택(없으면 Claude Haiku fallback — [api/harness/route.ts:161-174](src/app/api/harness/route.ts#L161-L174)).
- 실제 인증 서버는 **POC 범위 아님**. 단, 데이터 계층은 브라우저 로컬 → **내부 더미 DB/API로 승격**(4.7).
- **[디자인 규칙]** UI를 **수정·추가**할 때는 반드시 **`AIMNIS Design System_v2.0.html`([AIMNIS Design System_v2.0.html](AIMNIS%20Design%20System_v2.0.html))의 디자인 시스템**(토큰·컬러·타이포·컴포넌트 패턴)을 사용한다. 임의 스타일 신규 정의 금지. 신규 위젯(`DataTableWidget` 포함)·패널·초기화 UI 등도 이 디자인 시스템을 따른다. (AIM GUARD 디자인은 별도·고정)

---

## 2-1. 폐쇄망 외부 의존성 점검 (item 6·7)

발전소 폐쇄망 전제이므로 **런타임에 외부 네트워크로 나가는 모든 의존성을 차단**한다. 아래는 [현재 코드]에서 실측한 외부 의존성과 [POC 목표] 조치다.

### 2-1-1. 외부 LLM fallback 완전 차단 (item 6)
- **[현재 코드]** `/api/harness`는 Gemini 실패 시 **Claude Haiku로 자동 fallback**, `/api/chat`·`/api/home`은 외부 Claude 직접 호출. — [api/harness/route.ts:161-174](src/app/api/harness/route.ts#L161-L174)
- **[POC 목표]** 백엔드에 **`POC_CLOSED_NETWORK=true` 모드**를 도입. 이 모드에서는 **모든 외부 LLM 경로(Anthropic/Gemini) 호출을 원천 차단**하고, 오직 내부 Gemma 4 추론 API만 사용한다. Gemma 4 호출 실패 시 **외부로 fallback하지 않고** 4.11 오류 처리(안내 메시지)로 종료.
- **검수**: 폐쇄망 모드 구동 중 외부 도메인(api.anthropic.com, generativelanguage.googleapis.com 등)으로의 요청이 **0건**임을 네트워크 로그로 확인.

### 2-1-2. CDN·폰트·이미지·스크립트 내재화 (item 7)
| 의존성 | 위치 | 판정 | 조치 |
|--------|------|------|------|
| Google Fonts `@import url(fonts.googleapis.com)` | [guard-app/aim-guard.css:1](src/guard-app/aim-guard.css#L1) | 런타임 외부 CDN | GUARD는 POC 제외지만 로드 시 외부 호출 → **폐쇄망 빌드에서 제거/자체 호스팅** |
| `next/font/google` (Plus Jakarta Sans·DM Mono·Montserrat) | [layout.tsx:2](src/app/layout.tsx#L2) | **안전** | 빌드타임 self-host(런타임 CDN 호출 없음). 단 빌드 시 폰트 다운로드 네트워크 필요 → **오프라인 빌드 캐시 확보** |
| 레거시 로고 `cdn.imweb.me/...png` | monitoring `LEGACY_LOGO_URLS` | 저위험 | monitoring은 로컬(`/img`)로 자동 대체됨. 잔존 문자열 정리 권장 |
| 외부 링크 `console.anthropic.com/settings/usage` | 사용량 UI 앵커 | 저위험 | 런타임 의존 아님(단순 링크). 폐쇄망에서 숨김/비활성 권장 |
| `http://192.168.1.100:*` | [guard-app Vms.tsx](src/guard-app/pages/admin/Vms.tsx#L32) | 내부 IP | GUARD 전용 placeholder(POC 제외) |
| 이미지/아이콘 | `/public/img/*` (`Aimnis_Symbol.svg`, `ch6.png` 등) | **안전** | 전부 로컬 정적 자산 |

- **검수(item 7)**: 폐쇄망 빌드를 외부 인터넷 차단 환경에서 로드했을 때 **콘솔/네트워크에 외부 요청·폰트 실패가 없어야** 한다. Monitoring(POC 대상) 경로 우선 점검, GUARD 경로는 빌드에서 배제 시 예외.

---

## 3. 라우팅 · 화면 범위 분류

| 경로 | 컴포넌트 | 분류 | 비고 |
|------|----------|------|------|
| `/` | [LoginPage](src/components/auth/LoginPage.tsx) | **구현 대상** | 검증 없음, 900ms 후 `/home` 이동 |
| `/home` | [HomeWorkspace](src/components/home/HomeWorkspace.tsx) → HomeHero / HomeV2 | **구현 대상** | 요구 입력 + Spec Board |
| `/editor?solution=monitoring` | [MonitoringEditorShell](src/components/monitoring-editor/MonitoringEditorShell.tsx) | **구현 대상** | 위젯 편집·데이터 연결·저장·퍼블리시 |
| `/monitoring` | [MonitoringRuntimeView](src/components/monitoring-editor/MonitoringRuntimeView.tsx) | **구현 대상** | 읽기 전용 결과 화면 |
| `/projects` | [ProjectsGrid](src/components/projects/ProjectsGrid.tsx) | **구현 대상(부분)** | 재접속·복원 진입점 |
| `/editor?solution=guard` | [EditorLayout](src/components/editor/EditorLayout.tsx) | `화면 모의` | GUARD 에디터 (POC 제외) |
| `/guard` | [GuardApp](src/components/guard/GuardApp.tsx) | `POC 제외` | Ant Design 별도 앱 |
| 홈 하단 카드: eco/physical/city/env | HomeHero `ROADMAP_SOLUTIONS` | `화면 모의` | `출시 예정` 뱃지, 클릭 비활성 |

> 라우팅 분기: [app/editor/page.tsx:32-40](src/app/editor/page.tsx#L32-L40) — `solution.id === "monitoring"` 일 때만 Monitoring 셸, 그 외 GUARD 셸.

---

## 4. 실제 구현 핵심 범위 (항목별 정의 + 검수 기준)

> 상태 표기: ✅ 구현됨(코드 확인) · 🟡 부분/확인 필요 · ⬜ 미구현

### 4.1 로그인
- **동작**: 이메일/비밀번호 입력 후 `플랫폼 접속` → 900ms 로딩 → `/home`. **인증 검증 없음(데모)**.
- **근거**: [LoginPage.tsx:14-19](src/components/auth/LoginPage.tsx#L14-L19)
- **검수 기준**: 아무 값(또는 빈 값)으로 접속 시 `/home` 진입.
- **상태**: ✅ (단, "테스트 계정" 개념 없음 → [8번](#8-상위-원칙-대비-충돌확인-필요) 참조)

### 4.2 현장 요구사항 입력 (홈)
- **경로 A — 자연어 입력**: 솔루션 칩에서 `AIM Monitoring` 선택 후 요구사항 입력 → `/api/home`(Claude)가 시나리오 1개 추천, 응답 말미 `__SCENARIO__{"id":"..."}` 마커로 시작 버튼 노출.
  - 근거: [HomeHero.tsx:85-129](src/components/home/HomeHero.tsx#L85-L129), [api/home/route.ts](src/app/api/home/route.ts)
- **경로 B — 시나리오 칩 직접 선택**: 칩 클릭 → `setIsWorking(true)` → HomeV2(Spec Board) 전환.
  - 근거: [HomeHero.tsx:63-68](src/components/home/HomeHero.tsx#L63-L68)
- **경로 C — 파일 업로드**: 첨부 시 `harness-schema.json`의 `analysisSteps` 순차 애니메이션 → `harness.md 생성 완료` → `에디터 열기`. **실제 파일 파싱 없음(연출)**.
  - 근거: [HomeHero.tsx:162-179](src/components/home/HomeHero.tsx#L162-L179), [harness-schema.json:69-74](src/solutions/monitoring/harness-schema.json#L69-L74)
- **검수 기준**: monitoring 선택 → 시나리오 진입 → 중앙 Spec Board 렌더.
- **상태**: ✅ (파일 파싱은 🟡 연출)

### 4.3 요구사항 상세 입력 & 저장 (Spec Board)
- **동작**: 시나리오별 질문 그룹([monitoringSpecGroups](src/data/scenarios.ts#L438))에 답변. 진행률 바, 그룹 완료 시 다음 그룹 자동 열림. 답변은 `homeStore.selectedSpecs`에 저장되고 우측 `LiveBlueprint`에 설계서(MD) 실시간 반영.
- **`전문가 추천 세팅`(Magic Setup)**: 시나리오 `defaultSpecs`를 순차 애니메이션으로 자동 채움. **AI 호출 없음(토큰 절약, 정적 기본값)**.
  - 근거: [MagicSetupButton.tsx:54-59](src/components/home/MagicSetupButton.tsx#L54-L59), [homeStore.ts:235-253](src/store/homeStore.ts#L235-L253)
- **검수 기준**: 필수 질문 전부 답변 시 완성도 100% + 완료 배너 + `현장 맞춤 솔루션 생성하기` 버튼 활성화.
- **주의**: Spec 답변은 **세션 메모리(zustand, 비영속)**. 새로고침 시 소실 → [8번](#8-상위-원칙-대비-충돌확인-필요) 참조.
- **상태**: ✅

### 4.4 현장 요구(Spec) → Gemma 4 → 실제 위젯 구성 반영 (item 4)
- **[현재 코드]**
  - `현장 맞춤 솔루션 생성하기` 클릭 → blueprint MD·specs를 `aimnis_harness_draft`(session/local)에 저장 → 1.5s 로더 → `/editor?solution={id}&scenario={id}` 이동. — [CreateHarnessBtn.tsx:31-53](src/components/home/CreateHarnessBtn.tsx#L31-L53)
  - 하네스 MD는 `/api/harness`(외부 Gemini→Claude fallback) 스트리밍 텍스트로만 생성. — [homeStore.ts:275-311](src/store/homeStore.ts#L275-L311)
  - **🟡 한계**: 홈에서 만든 specs/blueprint가 **monitoring 에디터의 실제 위젯 레이아웃으로 반영되지 않음**(에디터는 기본 대시보드로 시작).
- **[POC 목표] (신규 구현 · DoD-6)**: Spec Board 완료 → **AIMNIS 백엔드가 specs를 내부 Gemma 4에 전달** → Gemma 4가 **확정 10종([7.1](#71-poc-확정-위젯-10종--gemma-4-제작대상--item-2)) 중 현장 요구에 적합한 초기 위젯 4~6개**를 선택해 **통합 대시보드 1개**에 배치(Tool Call 결과, [5.4](#54-gemma-4-tool-call-화이트리스트--item-3)) → 백엔드 검증 → **에디터에 실제 위젯으로 반영**.
  - MD 텍스트 설계서는 보조 산출물로 유지 가능하나, **핵심 산출물은 "실제 위젯 구성"**이다.
- **초기 위젯 생성 조건(고정)**
  - 생성 페이지: **통합 대시보드 1개**
  - 초기 생성 위젯: **최소 4개, 최대 6개**
  - 선택 가능 종류: **확정 10종**만 / 동일 목적 위젯 불필요 중복 금지
  - 사전 정의된 그리드 슬롯 안에서만 배치 / **등록된 내부 데이터 소스·실제 필드에 연결 가능한 위젯만** 생성
  - 카탈로그 외 위젯 생성 금지 / 자유 HTML·React 코드 생성 금지
  - ※ **4~6개 초기 생성은 모델 벤치마크 결과와 무관하게 1차 POC 필수 구현 범위**다. (벤치마크로 조정 가능한 것은 모델 크기·정밀도·양자화·성능뿐 — [0.2](#02-장비모델-표기-규칙-문서-전체-통일))
- **검수 기준**
  - [ ] 최소 **4개 이상** 위젯 생성 · [ ] 최대 **6개** 초과하지 않음
  - [ ] 생성 위젯 전부 **확정 10종** 안에 포함 · [ ] 등록된 데이터 소스와 연결 가능
  - [ ] 위젯 위치가 허용 그리드 범위를 벗어나지 않음
- **상태**: ⬜ 미구현(신규) — 현재는 텍스트 MD까지만.

### 4.5 위젯 화면 렌더링 (Monitoring 에디터)
- **동작**: monitoring 에디터는 좌(채팅/위젯) · 중앙(monitor/db/mapping) · 우(설정/매핑) 3영역. 중앙 `monitor` 뷰에 기본 대시보드(Header/Sidebar/기본 위젯 10종)와 사용자 추가 위젯 그리드가 렌더.
  - 기본 위젯 배치: [MonitoringEditorShell.tsx:724-735](src/components/monitoring-editor/MonitoringEditorShell.tsx#L724-L735)
- **검수 기준**: `/editor?solution=monitoring` 진입 시 3영역 + 기본 대시보드 표시.
- **상태**: ✅

### 4.6 제한된 위젯 편집 (위젯 제작 채팅 = 에디터 전용)
> 이 절의 채팅은 **위젯 제작 어시스턴트**다(운영 분석 채팅 아님 — [5.1](#51-ai-채팅의-정의--위젯-제작-어시스턴트로-한정-item-1)). **Gemma 4 제작·검수 대상은 10종([7.1](#71-poc-확정-위젯-10종--gemma-4-제작대상--item-2))** 으로 한정한다.

- **위젯 추가 방식**
  1. 위젯 라이브러리(좌측 `widgets` 탭) **드래그&드롭** — [handleWidgetDrop](src/components/monitoring-editor/MonitoringEditorShell.tsx#L1184-L1200)
  2. 위젯 제작 채팅 명령 → **[현재 코드]는 키워드 매칭**([resolveWidgetIdFromPrompt](src/components/monitoring-editor/MonitoringEditorShell.tsx#L702-L722)) / **[POC 목표]는 Gemma 4 Tool Call**([5.4](#54-gemma-4-tool-call-화이트리스트--item-3))로 대체.
  3. 위젯 카탈로그 라이브러리(20종, [widgets/index.json](src/solutions/monitoring/widgets/index.json))는 **유지**하되, **채팅 생성/수정 및 공식 검수 대상은 10종으로 제한**.
- **편집 범위(제한적)**: 위치/크기(그리드 드래그·리사이즈), 위젯 옵션(데이터소스·갱신주기·경보기준·임계값 등 `getWidgetOptionDefinitions`), 삭제. — [MonitoringEditorShell.tsx:522-687](src/components/monitoring-editor/MonitoringEditorShell.tsx#L522-L687) · 공통/조건부 편집 계약은 [7.2](#72-10종-편집-기능-계약--공통-필수--조건부-item-3)
- **브랜드 편집**: 7종 프리셋 + 컬러/폰트/로고 커스터마이징(CSS 변수 즉시 반영) — [MonitoringEditorShell.tsx:215-346](src/components/monitoring-editor/MonitoringEditorShell.tsx#L215-L346)
- **검수 기준**: 10종 위젯을 드래그/채팅으로 추가, 이동·리사이즈·옵션변경·삭제 가능. **카탈로그 외 임의 위젯 생성 불가**.
- **상태**: [현재 코드] ✅(드래그·키워드) / [POC 목표] Gemma 4 Tool Call 전환 ⬜

### 4.7 내부 데이터 URL 연동 & 위젯 바인딩 ★(1차 POC 실제 구현 범위 — 화면 모의 아님)
> **필수 흐름**: 내부 데이터 URL 등록/선택 → **데이터 조회(fetch)** → 응답 필드 확인 → 위젯 데이터 필드 선택 → 위젯 바인딩 → **데이터 변경 시 위젯 갱신** → 프로젝트 저장 → 재접속 후 동일 연결 복원.
> "내부 DB URL"은 브라우저가 DB에 직접 접속하는 것이 아니라, **읽기 전용 내부 데이터 API URL**(예: `http://내부서버/api/demo/equipment-status`)에서 더미 데이터를 실제로 조회하는 것을 의미한다.

- **현재 코드 상태 (정직한 진단)**
  - 데이터 소스 UI(중앙 `db` 뷰): 5개 프리셋 + 커스텀 소스 등록(엔드포인트 입력) + `연결` 애니메이션 **존재**. — [MonitoringDBCanvas.tsx](src/components/monitoring-editor/MonitoringDBCanvas.tsx)
  - 매핑 UI(중앙 `mapping` 뷰): React Flow로 소스 필드 ↔ 위젯 타겟 **드래그 연결 존재**. — [MonitoringMappingCanvas.tsx](src/components/monitoring-editor/MonitoringDataMapping/MonitoringMappingCanvas.tsx)
  - **❌ 실제 fetch 없음**: `onSourceConnect`는 연결 상태와 endpoint **문자열만 저장**하고 URL을 호출하지 않는다. — [MonitoringEditorShell.tsx:2508-2512](src/components/monitoring-editor/MonitoringEditorShell.tsx#L2508-L2512)
  - **❌ 라이브 데이터 미주입**: `widgetLiveData`를 채우는 `setWidgetLiveData`가 **코드 어디에서도 호출되지 않음** → 항상 `{}`. 위젯은 자체 내장 목업만 표시. — [MonitoringEditorShell.tsx:836](src/components/monitoring-editor/MonitoringEditorShell.tsx#L836)
  - **❌ 필드는 응답이 아닌 정적 카탈로그**: 매핑 필드는 [monitoringMappingData.ts:10-46](src/components/monitoring-editor/MonitoringDataMapping/monitoringMappingData.ts#L10-L46)의 고정값.
  - **❌ 연결 미영속**: `createSnapshot`에 `connectedSourceIds`·`mappingEdges`·`connectedSourceMeta`가 **포함되지 않음** → 저장/복원 안 됨. — [MonitoringEditorShell.tsx:903-936](src/components/monitoring-editor/MonitoringEditorShell.tsx#L903-L936)
- **상태**: ⬜ **미구현 (신규 개발 필요)** — UI 골격만 존재. 아래 스펙대로 구현해야 검수 통과.

- **구현 스펙 (개발 지시)**
  0. **[item 5] 호출 주체·비밀 은닉 고정**: 일반 사용자의 데이터 조회 요청에는 **실제 URL·endpoint를 포함하지 않는다.** 프론트는 **`dataSourceId`만** 백엔드에 전달한다.
     ```text
     POST /api/data/query
     Content-Type: application/json
     { "sourceId": "equipment-status" }
     ```
     흐름: `프론트(dataSourceId만)` → `백엔드가 서버 DB의 DataSource 설정 조회` → `허용 목록에 등록된 내부 API URL 호출` → `응답 검증` → `데이터·필드 정보 반환`.
     프론트엔드는 **실제 내부 API URL · DB 주소 · DB 계정 · 비밀번호 · 인증 토큰 · API Key를 직접 전달하거나 저장하지 않는다**(6.2 DataSource 참조).
  0-1. **소스 등록 API 분리(관리자/개발 모드 전용)**: 내부 데이터 소스 신규 등록은 일반 조회 API와 분리한다 — 예 `POST /api/admin/data-sources`. 이 기능은 **관리자 또는 개발 모드에서만** 사용.
  1. **더미 데이터 API 제공**: 내부 읽기 전용 엔드포인트 준비. POC용은 앱 내부 Next.js 라우트로 대체 가능 — 예 `src/app/api/demo/[source]/route.ts` (GET, JSON 반환, 호출마다 값 변동/타임스탬프 포함). **이 endpoint는 서버 DataSource 설정에만 존재**하고 프론트에 노출하지 않는다.
  2. **조회 & 필드 추출**: 백엔드가 `sourceId`로 조회한 endpoint를 실제 `fetch` → 응답 JSON의 **키를 응답 필드로 추출**하여 프론트에 반환(정적 카탈로그 대체/병합). 실패 시 4.11 오류 처리.
  3. **바인딩**: 사용자가 응답 필드 → 위젯 데이터 필드를 선택(기존 드래그 매핑 UI 재사용).
  4. **갱신**: 바인딩된 위젯은 소스 `refreshInterval`(1s/5s/30s/5m, 기존 옵션)마다 백엔드 재조회로 `setWidgetLiveData(instanceId, {...})` 갱신. 언마운트 시 `clearInterval`.
  5. **영속화(스냅샷 v2 + 서버 DB)**: `DataBinding`(위젯↔dataSourceId·필드)·`mappingEdges`를 스냅샷에 추가하고 **서버 DB에 프로젝트 일부로 저장**([6.2](#62-poc-목표-서버-db-영속화-item-35--dod-5), item 3). `schemaVersion`을 `monitoring.snapshot.v2`로 올리고 v1 하위호환 유지. **연결의 endpoint 자체는 프론트 스냅샷에 저장하지 않고 서버 DataSource에만 둔다.**
  6. **복원**: 재접속 시 서버 DB에서 `DataBinding`(dataSourceId 기준) 로드 → 백엔드가 endpoint를 재조회하여 위젯 갱신 재개.
- **검수 기준(이 항목 통과 조건)** — *브라우저 DevTools로는 `프론트→백엔드` 요청·백엔드 응답만 확인 가능. 백엔드→내부 데이터 API 실제 호출은 아래 서버측 근거로 검수.*
  - [ ] 프론트는 **`sourceId`만** 백엔드에 전달한다(요청 페이로드에 endpoint/URL 없음).
  - [ ] 실제 endpoint는 **서버에서 조회**된다(서버 DataSource 설정).
  - [ ] **백엔드 데이터 조회 로그 / 내부 데이터 API 접근 로그 / DataSource의 `lastFetchedAt`·응답 상태·응답 건수·`lastError`** 중 하나 이상으로 백엔드→내부 API 호출을 확인한다.
  - [ ] 허용 목록에 없는 데이터 소스·URL은 호출되지 않는다.
  - [ ] 인증 정보(URL·계정·토큰·API Key)가 **프론트 및 프로젝트 JSON에 노출되지 않는다**.
  - [ ] 필드→위젯 바인딩 후 위젯에 **조회값 표시** + 데이터 변경 시 **자동 갱신** + 저장/재접속 후 **동일 연결 복원**.
- **범위 경계**: 실제 발전소 운영 데이터는 제외. 더미 데이터 API까지가 POC 대상.

### 4.8 프로젝트 저장 (서버 DB — item 3)
- **[현재 코드]**
  - 저장(`저장`): 에디터 상태를 `MonitoringSnapshot`(`monitoring.snapshot.v1`)으로 직렬화 → **`localStorage`**. — [handleSave](src/components/monitoring-editor/MonitoringEditorShell.tsx#L952-L957), 스키마 [MonitoringEditorShell.tsx:113-143](src/components/monitoring-editor/MonitoringEditorShell.tsx#L113-L143)
  - 퍼블리시: `projectStore.publish()`(zustand `persist: aimnis-projects`, **localStorage**) + 가상 URL. — [handlePublish](src/components/monitoring-editor/MonitoringEditorShell.tsx#L959-L980), [projectStore.ts:46-58](src/store/projectStore.ts#L46-L58)
- **[POC 목표] (신규 · DoD-5)**: **프로젝트·Spec·위젯 구성·데이터 매핑(연결·바인딩)을 AIMNIS 백엔드 서버 DB에 저장**한다. 프론트는 백엔드 API(예: `POST /api/projects`, `PUT /api/projects/{id}`)로 저장하고, localStorage는 오프라인 임시 draft 용도로만(옵션) 사용. 저장 단위:
  - `project`(id·name·solution·brand) / `spec`(Spec Board 답변) / `widgets`(10종 인스턴스·위치·크기·옵션) / `dataMappings`(connectedSources·mappingEdges·바인딩)
- **검수 기준**: 저장 후 **다른 브라우저/세션(또는 localStorage 비운 상태)**에서 서버 DB로부터 동일 프로젝트가 복원되어야 한다(= localStorage 의존 아님).
- **상태**: [현재 코드] ✅(localStorage) / [POC 목표] 서버 DB ⬜

### 4.9 재접속 후 상태 복원
- **[현재 코드]**: `/editor?solution=monitoring`(draft) 또는 `&project={id}`(스냅샷) 진입 시 **localStorage**에서 로드. — [MonitoringEditorShell.tsx:1097-1124](src/components/monitoring-editor/MonitoringEditorShell.tsx#L1097-L1124)
- **[POC 목표]**: `&project={id}` 진입 시 **서버 DB에서** 프로젝트·Spec·위젯·매핑을 로드하여 복원(4.8).
- **검수 기준**: 위젯 추가/편집/데이터연결 → 저장 → **세션/브라우저 교체 후 재접속** → 레이아웃·브랜드·**데이터 연결/바인딩** 동일 복원.
- **상태**: [현재 코드] ✅(동일 브라우저) / [POC 목표] 서버 DB 복원 ⬜

### 4.10 읽기 전용 결과 화면
- **동작**: `/monitoring` 진입 시 `MonitoringApp`(고정 대시보드) 위에 저장된 스냅샷의 사용자 위젯을 **읽기 전용 오버레이**로 렌더. `?project={id}` 있으면 해당 프로젝트, 없으면 draft 또는 첫 monitoring 프로젝트.
  - 근거: [MonitoringRuntimeView.tsx:79-141](src/components/monitoring-editor/MonitoringRuntimeView.tsx#L79-L141)
- **진입 동선**: 런타임 헤더의 `에디터` 버튼 ↔ 에디터. `/projects` 카드 → 런타임/에디터.
- **검수 기준**: 저장한 화면이 `/monitoring`에서 편집 불가 상태로 표시.
- **상태**: ✅

### 4.11 생성 실패 · 기본 오류 처리
- **채팅/시나리오 API 오류**: try/catch로 오류 텍스트 메시지 표시(앱 크래시 없음). — [HomeV2.tsx:109-111](src/components/home/HomeV2.tsx#L109-L111), [MonitoringChatPanel.tsx:136](src/components/monitoring-editor/MonitoringChatPanel.tsx#L136)
- **하네스 생성 실패**: 정적 fallback blueprint 반환. — [api/harness/route.ts:179-184](src/app/api/harness/route.ts#L179-L184)
- **솔루션 로드 실패**: guard로 fallback, 최악의 경우 안내 문구. — [app/editor/page.tsx:19-30](src/app/editor/page.tsx#L19-L30)
- **손상된 스냅샷**: JSON 파싱 실패 시 해당 저장 키 제거. — [MonitoringEditorShell.tsx:1116-1118](src/components/monitoring-editor/MonitoringEditorShell.tsx#L1116-L1118)
- **[POC 목표] Gemma 4 실패 처리**: 폐쇄망 모드에서 Gemma 4 추론 실패 시 **외부 LLM으로 fallback 금지**([2-1-1](#2-1-1-외부-llm-fallback-완전-차단-item-6)) → 안내 메시지만 반환.
- **검수 기준**: 추론/네트워크 오류 시 오류 메시지만 노출, 앱 크래시 없음, **외부 호출 미발생**.
- **상태**: [현재 코드] ✅ / [POC 목표] fallback 차단 ⬜

### 4.12 POC 데이터 초기화 — 통합 초기화 (item 8)
- **[현재 코드]**: `SettingsDrawer`의 `프로젝트 데이터 초기화`는 **published 프로젝트만** 제거. 에디터 draft(`aimnis_monitoring_editor_draft`)·pages(`aimnis-monitoring-pages`)는 **남는다**. 에디터 `전체 초기화(기본값으로)`는 캔버스만. — [SettingsDrawer.tsx:115-123](src/components/layout/SettingsDrawer.tsx#L115-L123), [MonitoringEditorShell.tsx:1860-1883](src/components/monitoring-editor/MonitoringEditorShell.tsx#L1860-L1883)
- **[POC 목표] (DoD-8)**: **`POC 통합 초기화`** 단일 액션으로 아래를 한 번에 비운다.
  - 서버 DB의 POC 프로젝트·Spec·위젯·데이터 매핑
  - 내부 더미 데이터(생성분/상태) 리셋
  - 로컬 draft·pages·세션 키(`aimnis_monitoring_editor_draft`, `aimnis-monitoring-pages`, `aimnis_harness_draft`, `aimnis_active_editor`)
  - 실행 전 **확인 다이얼로그** 1회.
- **검수 기준**: 통합 초기화 1회 실행 후 `/projects`·에디터·런타임·더미데이터가 **모두 초기 상태**로 복귀(잔존 0).
- **상태**: [현재 코드] 🟡(부분) / [POC 목표] 통합 초기화 ⬜

---

## 5. AI 채팅 = 위젯 제작 어시스턴트 (원칙 · 현재 코드 · POC 목표)

### 5.1 AI 채팅의 정의 — 위젯 제작 어시스턴트로 한정 (item 1)
> AIMNIS 1차 POC의 AI 채팅은 **완성된 모니터링 화면에서 설비 상태를 질의·분석하는 운영 분석 채팅이 아니다.**
> AIMNIS **설계·편집 화면**에서 사용자의 자연어 명령을 해석해 **사전 정의 위젯을 생성·수정·삭제하고 데이터 필드를 연결하는 `위젯 제작 어시스턴트`**다.

| 구분 | **위젯 제작 채팅 (POC 대상)** | 운영 분석 채팅 (POC 제외) |
|------|------------------------------|---------------------------|
| 사용 위치 | AIMNIS 에디터 | 완성된 모니터링 화면 |
| 목적 | 위젯 생성·수정·삭제·바인딩 | 설비 현황 질의·분석 |
| 결과 | **실제 화면 구성 변경** | 답변·분석 결과 |
| 1차 POC | **실제 구현** | **제외** |

- **미지원(운영 분석) 질문 예** — 1차 POC에서 지원하지 않음:
  “지금 가장 위험한 설비는?” · “왜 이 펌프 진동이 높아졌나?” · “어떤 설비를 먼저 정비?” · “사고 가능성 예측” · “오늘 운영 상태 요약” · “최근 고장 원인 분석”
- **미지원 요청 처리**: 임의로 분석하지 말고 아래 의미의 안내를 반환.
  > 현재 POC에서는 위젯 생성·수정·삭제 및 데이터 연결 명령만 지원합니다.

### 5.2 [현재 코드] AI 사용 현황 (외부 클라우드 LLM 기준)
| 지점 | AI 사용 | 방식 | 근거 |
|------|---------|------|------|
| 홈 시나리오 추천 (`/api/home`) | ✅ Claude Haiku | 자연어→시나리오 1개 추천(`__SCENARIO__` 마커) | [api/home/route.ts](src/app/api/home/route.ts) |
| 하네스 설계서(`/api/harness`) | ✅ Gemini/Claude | Markdown 텍스트 스트리밍 | [api/harness/route.ts](src/app/api/harness/route.ts) |
| 에디터 위젯 추가(채팅) | ❌ 키워드 매칭 | 프롬프트 키워드→카탈로그 위젯 1개 | [MonitoringEditorShell.tsx:447-473](src/components/monitoring-editor/MonitoringEditorShell.tsx#L447-L473) |
| 에디터 일반 대화 | ✅ Claude Haiku | 위젯 명령 아니면 `/api/chat` 텍스트 | [MonitoringChatPanel.tsx:89-136](src/components/monitoring-editor/MonitoringChatPanel.tsx#L89-L136) |
| 전문가 추천 세팅(Magic) | ❌ 정적 기본값 | 시나리오 `defaultSpecs` 자동 채움 | [MagicSetupButton.tsx](src/components/home/MagicSetupButton.tsx) |
> `/api/chat`에 `__WIDGET_JSON__`(kpi/chart/gauge/alert) 스키마가 있으나 **GUARD 계열**이라 monitoring 카탈로그와 매핑되지 않는다([api/chat/route.ts:15-28](src/app/api/chat/route.ts#L15-L28)). 에디터 일반 대화(자유 텍스트)는 **위젯 제작 범위로 축소**해야 한다(운영 분석 답변 금지).

### 5.3 [POC 목표] Gemma 4 위젯 제작 채팅 (신규 · DoD-3)
1. 프론트 위젯 제작 채팅 → **AIMNIS 백엔드** → **ThinkStation PGX Gemma 4 추론 API**(외부 호출 0건).
2. Gemma 4는 **10종 위젯([7.1](#71-poc-확정-위젯-10종--gemma-4-제작대상--item-2)) 범위에서만** Tool Call([5.4](#54-gemma-4-tool-call-화이트리스트--item-3)) 결과를 반환(자유 코드·신규 컴포넌트 생성 금지).
3. **백엔드가 검증** — 허용 위젯/필드/옵션/Tool 화이트리스트 밖이면 거부 → **허용 기능만 실행**.
4. 요청/응답·추론 시간·모델 오류 로깅 + Health Check.
- **검수**: (a) 내부 Gemma 4로만 추론, (b) 10종 내 구조화 결과, (c) 백엔드 검증 통과분만 반영, (d) 운영 분석 질문은 5.1 안내로 반려.

### 5.4 Gemma 4 Tool Call 화이트리스트 (item 3)
Gemma 4에는 **무제한 기능이 아니라 아래 Tool Call만** 제공한다. 백엔드는 화이트리스트 외 호출을 거부한다.
```text
add_widget                 # 10종 중 1개 추가
delete_widget              # 위젯 삭제
update_widget_title        # 제목 변경
update_widget_description  # 설명 변경
update_widget_binding      # 데이터 소스/필드 연결
update_widget_aggregation  # 집계 방식 변경
update_widget_unit         # 단위 변경
update_widget_threshold    # 임계값 변경(해당 위젯만)
update_widget_sort         # 정렬 기준 변경(해당 위젯만)
move_widget                # 위치 변경
resize_widget              # 크기 변경
```
- Tool 인자의 `widgetType`·`dataSource`·`field`는 **10종 카탈로그·데모 커넥터 필드 화이트리스트**로 제한.
- **경계**: Gemma 4 세부 모델/양자화는 [0.2](#02-장비모델-표기-규칙-문서-전체-통일) 기준 테스트 후 확정(벤치마크로 조정 가능한 것은 **모델 크기·정밀도·양자화·성능**). **Spec 완료 시 초기 위젯 4~6개 생성([4.4](#44-현장-요구spec--gemma-4--실제-위젯-구성-반영-item-4))은 벤치마크와 무관한 필수 범위**다.

---

## 6. 데이터 · 상태 관리 (영속성 지도)

### 6.1 [현재 코드] 브라우저 저장 지도

| 저장 키 | 저장소 | 내용 | 수명 | 근거 |
|---------|--------|------|------|------|
| `homeStore` | 메모리(zustand) | 시나리오·specs·blueprint | **새로고침 시 소실** | [homeStore.ts](src/store/homeStore.ts) |
| `aimnis_harness_draft` | session+localStorage | 홈→에디터 전달 하네스 MD/specs | 브라우저 | [CreateHarnessBtn.tsx:37-46](src/components/home/CreateHarnessBtn.tsx#L37-L46) |
| `aimnis_monitoring_editor_draft` | localStorage | 에디터 스냅샷(v1) | 브라우저 | [MonitoringEditorShell.tsx:179](src/components/monitoring-editor/MonitoringEditorShell.tsx#L179) |
| `aimnis-projects` | localStorage(persist) | 퍼블리시된 프로젝트 목록 | 브라우저 | [projectStore.ts:63](src/store/projectStore.ts#L63) |
| `aimnis-monitoring-pages` | localStorage(persist) | 추가된 모니터링 페이지 | 브라우저 | [monitoringPagesStore.ts:115](src/store/monitoringPagesStore.ts#L115) |
| `aimnis_active_editor` | sessionStorage | 마지막 사용 에디터(Navbar 링크용) | 세션 | [MonitoringEditorShell.tsx:1093-1095](src/components/monitoring-editor/MonitoringEditorShell.tsx#L1093-L1095) |

**스냅샷 스키마 (`monitoring.snapshot.v1`)** — 저장/복원의 계약. 현재 필드: `app`(activePageId/dashboardMode/runtimeView), `editor`(뷰·선택상태), `elements`(header/sidebar/기본위젯), `brand`(preset·settings·customSlots), `widgets`(grid·items[]). — [MonitoringEditorShell.tsx:113-143](src/components/monitoring-editor/MonitoringEditorShell.tsx#L113-L143)

> ⚠️ **누락 필드(4.7 구현 시 추가 필수)**: 현재 스냅샷에는 **데이터 연결 상태가 없다** — `connectedSources`(id·endpoint·fields), `mappingEdges`, 위젯 바인딩이 저장되지 않는다. 4.7의 스냅샷 v2로 확장하여 데이터 연결을 저장/복원 대상에 반드시 포함할 것.

> **주의**: `/projects` 카드 그리드의 기본 3건은 `src/data/projects.json`의 **guard 시드 데이터**이며([ProjectsPage](src/app/projects/page.tsx)), monitoring 프로젝트는 **퍼블리시 후에만** 스토어에서 나타난다. 재접속 복원 검수는 반드시 "퍼블리시된 monitoring 프로젝트" 기준으로 수행.

### 6.2 [POC 목표] 서버 DB 영속화 (item 3·5 · DoD-5)
위 브라우저 저장(localStorage/zustand persist)을 **AIMNIS 백엔드 서버 DB로 이전**한다. **프로젝트의 최종 저장 원본은 서버 DB**이며, localStorage는 오프라인 임시 draft(옵션)로만 쓴다. 프론트는 **백엔드 API로만** 읽고 쓴다(DB 직접 접속 금지).

**서버 DB 최종 엔티티 목록**

| 엔티티 | 내용 | 대체 대상(현재) |
|--------|------|-----------------|
| `Project` | id·name·solution·brand·publishedAt | `aimnis-projects`(localStorage) |
| `SpecAnswer` | Spec Board 답변(specs) | `homeStore`(zustand)·`aimnis_harness_draft` |
| `Page` | 통합 대시보드 등 페이지 메타 | `aimnis-monitoring-pages`(localStorage) |
| `Widget` | 10종 위젯 인스턴스·위치·크기·옵션 | 스냅샷 `widgets.items`(localStorage) |
| `DataSource` | 내부 데이터 소스 설정(아래 상세) | 정적 JSON·프론트 endpoint 입력(신규 서버화) |
| `DataBinding` | 위젯↔dataSourceId·필드·mappingEdges | (현재 미저장, 4.7 신규) |
| `AiAction` | Gemma 4 위젯 제작 명령 처리 이력(아래 상세) | (현재 없음, 신규) |

**`DataSource`** — POC 내부 데이터 소스 설정(서버에서만 관리, item 5)
- 최소 필드: `dataSourceId` · `name` · `endpointKey` · `endpoint` · `refreshInterval` · `responseFields` · `status` · `lastFetchedAt` · `lastError` · `createdAt` · `updatedAt`
- 처리 원칙: **`endpoint`는 서버에서만 관리**(프론트 응답에서 실제 endpoint 숨김 가능) · **인증정보는 일반 필드에 평문 저장 금지**(서버 환경변수/별도 보안 설정) · 프론트는 `dataSourceId` 또는 `endpointKey`만 사용.

**`AiAction`** — Gemma 4 위젯 제작 명령 처리 이력
- 최소 필드: `actionId` · `projectId` · `userPrompt` · `toolName` · `toolArguments` · `modelName` · `modelVersion` · `quantization` · `status` · `schemaValid` · `inferenceDuration` · `errorMessage` · `createdAt`
- 목적: Gemma 4 **실제 호출 여부 확인** · Tool Call 결과 검수 · 성공/실패 기록 · 응답 시간 비교 · 모델·양자화 벤치마크 · 오류 원인 확인 · **외부 LLM이 아닌 내부 Gemma 4 사용 증거 확보**.
- **범위 제한**: 전체 자유 대화 장기 보관 기능으로 확대 금지. **위젯 제작 명령·실행 결과에 필요한 최소 기록만** 저장.

- **검수**: 저장 후 **브라우저 storage를 비우거나 다른 세션**에서 접속해도 서버 DB로부터 프로젝트·Spec·위젯·데이터 매핑이 동일 복원되고, endpoint·인증정보는 프론트/프로젝트 JSON에 노출되지 않는다.

---

## 7. 사전 정의 카탈로그 (구현 계약)

### 7.1 POC 확정 위젯 10종 — Gemma 4 제작대상 (item 2)
> **원칙**: 기존 카탈로그 20종 라이브러리와 사용자 직접 드래그는 **유지**한다. 그러나 **Gemma 4 위젯 제작 채팅의 생성·수정 및 공식 검수 대상은 아래 10종**으로 확정한다. 아래 `대응 컴포넌트`는 [현재 코드]에 실재하는 것만 표기했고, 전용 위젯이 없는 경우 목적이 가장 유사한 실재 위젯으로 **대체(사유 명시)**했다.

| # | POC 위젯 유형 | 현재 코드의 대응 위젯·컴포넌트 | 주요 용도 | 허용 데이터 | 지원 상태 |
|---|---------------|--------------------------------|-----------|-------------|-----------|
| 1 | KPI 카드 | `KpiWidget`([editor/widgets/KpiWidget.tsx]) · `AIMStatTile`([MonitoringChartPrimitives.tsx#L316]) · 매핑 `aim-kpi` | 단일 핵심 지표 | number(value)·unit·trend | ✅ 실재 |
| 2 | 상태 요약 카드 | `KpiSummaryWidget`([monitoring/widgets/KpiSummaryWidget.tsx]) · `MONITORING_CORE_TARGETS.summary-*`([monitoringMappingData.ts#L72-L75]) | 정상/주의/위험 집계 | normalCount·warningCount·dangerCount | ✅ 실재 |
| 3 | 라인 차트 | `LineChartWidget`([editor/widgets/LineChartWidget.tsx]) · `AIMLineChart`([MonitoringChartPrimitives.tsx#L35]) · `aim-line-chart` | 시계열 추이 | timeSeries(array) | ✅ 실재 |
| 4 | 막대차트 | `BarChartWidget`([editor/widgets/BarChartWidget.tsx]) · `AIMBarChart`([MonitoringChartPrimitives.tsx#L133]) · `aim-bar-chart` | 구간/범주 비교 | chartData(array) | ✅ 실재 |
| 5 | 도넛차트 | `DonutChartWidget`([editor/widgets/DonutChartWidget.tsx], Recharts) | 구성 비율 | chartData(array) | ✅ 실재 |
| 6 | 데이터 테이블 | **`DataTableWidget`** (POC 신규 경량 구현) | 설비 이상 이벤트·최근 알림·설비 목록 등 범용 행 데이터 표시 | rows(array) | 🆕 POC 신규 구현 |
| 7 | 게이지 | `GaugeWidget`([editor/widgets/GaugeWidget.tsx]) · `AIMGauge`([MonitoringChartPrimitives.tsx#L203]) · `aim-gauge` | 단일 값/임계 | value·max·threshold | ✅ 실재 |
| 8 | 히트맵 | `AIMHeatmap`([MonitoringChartPrimitives.tsx#L264]) · 카탈로그 `thermal-delta-map`(과열 ΔT 히트맵) | 2D 강도 분포 | cells(matrix)·maxDelta | ✅ 실재 |
| 9 | 알림·이벤트 목록 | `AlertWidget`([editor/widgets/AlertWidget.tsx]) · `AlarmHistoryWidget`([monitoring/widgets/AlarmHistoryWidget.tsx]) · `aim-alert-list` | 실시간 알림 리스트 | alerts·severity·source | ✅ 실재 |
| 10 | 설비 상태·헬스 카드 | `EquipmentHealthWidget`([monitoring/widgets/EquipmentHealthWidget.tsx]) · 카탈로그 `multi-sensor-health`(복합 센서 헬스) | 설비 헬스 요약 | normalCount·warningCount·criticalCount | ✅ 실재 |

- **최종 지원 수: 정확히 10종.** #6 데이터 테이블은 **`DataTableWidget` 신규 경량 구현으로 확정**(MaintenanceScheduleWidget을 범용 테이블로 재사용하지 않음), 나머지 9종은 실재 컴포넌트.
- **10종 비포함(명시)**: 지도, 작업자 위치도(`WorkerMapWidget`/`hazard-zone-map`), 네트워크 그래프(`NetworkTopologyWidget`), 자유 노드 에디터 — 제작·검수 대상 아님.

#### 7.1.1 `DataTableWidget` (POC 신규 경량 구현 — item 4)
- **지원 범위**: 표시 컬럼 선택 · 컬럼 제목 설정 · **단일 컬럼 정렬(오름/내림)** · 최대 표시 행 수 · 텍스트/숫자/날짜·시간 표시 · 빈 데이터 상태 · 데이터 오류 상태 · **읽기 전용 표시**.
- **제외 범위(구현 금지)**: 셀 직접 편집 · 데이터 입력 · 행 추가/삭제 · **다중 정렬** · 복잡한 필터 빌더 · 페이지네이션 · 컬럼 그룹 · 엑셀 다운로드 · 컬럼 드래그 재배치 · 사용자 정의 렌더 함수.

### 7.2 10종 편집 기능 계약 — 공통 필수 / 조건부 (item 3)
**10종 공통 필수 기능** (확정 10종 전부 지원)
- 위젯 추가 · 위젯 삭제 · 제목 변경 · 설명 변경 · **데이터 소스 또는 데이터 바인딩 변경** · 위치 변경 · 크기 변경

**위젯 유형별 조건부 기능** (해당 위젯에서 의미가 있을 때만 지원)
- 값 필드 변경 · 집계 방식 변경 · 단위 변경 · 시간 필드 변경 · 그룹 필드 변경 · 임계값 변경 · 정렬 기준 변경 · 표시 행 수 변경 · 최소값·최대값 변경 · 시리즈 필드 변경 · 컬럼 선택

| 위젯 | 조건부 편집 기능 |
|------|------------------|
| KPI 카드 | 값 필드, 집계, 단위, 임계값 |
| 상태 요약 카드 | 상태 필드, 상태값 매핑 |
| 라인 차트 | 시간 필드, 값 필드, 시리즈 필드, 단위 |
| 막대차트 | 그룹 필드, 값 필드, 집계, 정렬 |
| 도넛차트 | 그룹 필드, 값 필드, 집계 |
| 데이터 테이블 | 컬럼 선택, 정렬, 표시 행 수 |
| 게이지 | 값 필드, 최소값, 최대값, 임계값, 단위 |
| 히트맵 | X 필드, Y 필드, 값 필드, 최대값 |
| 알림·이벤트 목록 | 표시 필드, 심각도 필드, 정렬, 표시 건수 |
| 설비 상태·헬스 카드 | 설비 필드, 상태 필드, 임계값 |

- **처리 규칙**: 사용자가 **해당 위젯에서 지원하지 않는 속성 변경**을 요청하면 명령을 실행하지 않고, *해당 위젯에서는 지원되지 않는 설정임을 안내*한다.
- 각 편집은 [5.4](#54-gemma-4-tool-call-화이트리스트--item-3) Tool Call과 대응하며, 백엔드가 위젯 유형별 지원 여부를 검증.
- **검수 항목**
  - [ ] 지원되는 속성 명령만 실행된다.
  - [ ] 지원되지 않는 속성 명령은 위젯 상태를 변경하지 않는다.
  - [ ] 지원되지 않는 이유를 사용자에게 안내한다.

### 7.3 데이터 커넥터 — 데모 5종 ([monitoringMappingData.ts](src/components/monitoring-editor/MonitoringDataMapping/monitoringMappingData.ts))
`equipment-sensor` · `environment-sensor` · `worker-safety` · `alerts-events` · `system-monitor` (각 소스별 필드·샘플값 고정)

### 7.4 시나리오 — 3종 ([scenarios.ts:363](src/data/scenarios.ts#L363))
`energy`(에너지 시설 통합 관제, **POC 대표**) · `manufacturing` · `smartcity`

> 20종 라이브러리·새 위젯/커넥터/솔루션은 **JSON·데이터 파일 추가로만** 확장(코어 하드코딩 금지) — [marketplace.json:24-34](src/data/marketplace.json#L24-L34), [solutionLoader.ts](src/lib/solutionLoader.ts).

---

## 8. 상위 원칙 대비 충돌·확인 필요

> 코드 분석 결과가 POC 상위 원칙과 충돌하면 **상위 원칙 우선**. 아래는 구현/검수 시 반드시 조정·확인해야 할 지점.

| # | 쟁점 | 코드 현황 | 판정 / 조치 |
|---|------|-----------|-------------|
| C1 | **대표 시나리오 = 에너지** | 홈 monitoring 카드 `시작하기`는 `SOLUTION_TO_SCENARIO`로 **manufacturing** 시나리오 진입 — [HomeHero.tsx:570-573](src/components/home/HomeHero.tsx#L570-L573) | 원칙 우선 → **energy로 진입하도록 수정 권장** 또는 검수 시 시나리오 칩에서 `에너지 시설 통합 관제` 직접 선택 |
| C2 | **AI가 화면 구성 데이터 생성** | 위젯 배치는 드래그/키워드(결정론적). AI 구조화 출력 미구현 | **확정**: 5장 Gemma 4 Tool Call([5.4](#54-gemma-4-tool-call-화이트리스트--item-3))로 구현. **Spec 완료 시 초기 위젯 4~6개 생성은 필수**(벤치마크 무관) |
| C3 | **홈 Spec → 에디터 위젯 반영** | specs/blueprint가 에디터 위젯 레이아웃으로 자동 반영 안 됨 | **확정(DoD-6)**: Spec→Gemma 4→통합 대시보드 1개에 **초기 위젯 4~6개(확정 10종)** 반영 ([4.4](#44-현장-요구spec--gemma-4--실제-위젯-구성-반영-item-4)) |
| C4 | **테스트 계정 로그인** | 인증 없음(아무 값 통과) | POC 데모 허용. "테스트 계정" 명시 필요 시 안내 문구/프리필만 추가 |
| C5 | **요구사항(Spec) 저장 영속성** | Spec 답변은 zustand 메모리 → 새로고침 소실 | **확정(DoD-5)**: Spec을 서버 DB 저장([6.2](#62-poc-목표-서버-db-영속화-item-35--dod-5)) |
| C6 | **완전한 데이터 초기화** | `프로젝트 데이터 초기화`가 draft/pages는 비우지 않음 | **확정(DoD-8)**: POC 통합 초기화([4.12](#412-poc-데이터-초기화--통합-초기화-item-8)) |
| C7 | **제외 솔루션 노출** | GUARD 에디터·`/guard`·roadmap 카드가 화면에 존재 | 원칙대로 `화면 모의`/`POC 제외` 유지. GUARD는 기능 검수 대상 아님 |
| **C8** | **내부 데이터 URL 실연동(신규 필수)** | UI 골격만 존재, 실제 fetch/라이브 갱신/연결 영속 **전부 미구현** ([4.7](#47-내부-데이터-url-연동--위젯-바인딩-1차-poc-실제-구현-범위--화면-모의-아님)) | **확정(DoD-4)**. 백엔드 경유 fetch + refresh + 서버 DB 저장 신규 개발 |
| **C9** | **온프레미스 Gemma 4 추론(POC 핵심 목표)** | 현재 코드는 **외부 클라우드 LLM(Claude/Gemini)** 직접 호출. PGX·Gemma 4·내부 추론 API **전부 미구현** | **최우선 신규 개발(DoD-1~3)**. 프론트→백엔드→내부 Gemma 4, 외부 호출 0건 |
| **C10** | **프론트→백엔드→DB/LLM 경유 구조** | 프론트가 `/api/*`에서 외부 LLM 직접 호출, 데이터는 localStorage/정적 JSON | **확정**: 백엔드가 LLM·DB 게이트웨이([0.5](#05-poc-인프라-역할-구분-논리적-분리)) |
| **C11** | **AI 채팅 운영분석 혼용** | `/api/chat` 에디터 대화가 자유 텍스트 응답 가능(운영 분석형 답변 여지) | **확정**: 위젯 제작 어시스턴트로 한정, 운영 분석 질문은 안내 반려([5.1](#51-ai-채팅의-정의--위젯-제작-어시스턴트로-한정-item-1)) |
| **C12** | **위젯 20종 vs POC 10종** | 카탈로그 20종, Gemma 대상 범위 미정 | **확정**: 라이브러리 20종 유지, Gemma 제작·검수 대상 **10종**([7.1](#71-poc-확정-위젯-10종--gemma-4-제작대상--item-2)), #6 데이터테이블만 대체 |
| **C13** | **폐쇄망 외부 의존성** | guard CSS 폰트 CDN·외부 LLM SDK 등 외부 호출 존재 | **확정(DoD-7)**: 외부 LLM fallback 차단 + 의존성 내재화([2-1](#2-1-폐쇄망-외부-의존성-점검-item-6-7)) |

---

## 9. 검수 체크리스트 (E2E · 단일 흐름)

> 사전(POC 목표 구성): ThinkStation PGX에 Gemma 4 기동, 백엔드에 내부 추론 엔드포인트 설정, **외부 네트워크 차단(폐쇄망)**. 시작 전 데이터 초기화 + 브라우저 storage 정리(C6).
> (현재 코드로 화면 흐름만 점검 시: `.env.local`에 `ANTHROPIC_API_KEY` 설정.)

- [ ] **0. 인프라(DoD-1·2·7)**: PGX Gemma 4 Health Check 정상 · 백엔드→내부 Gemma 4 호출 성공 · **외부 LLM/폰트/CDN 호출 0건**(폐쇄망 네트워크 로그)
- [ ] **1. 로그인**: `/` 접속 → 접속 → `/home` 진입
- [ ] **2. 솔루션 선택**: 입력창 하단에서 `AIM Monitoring` 칩 활성
- [ ] **3. 시나리오**: `에너지 시설 통합 관제` 선택(C1 준수) → Spec Board 전환
- [ ] **4. 요구 입력/자동세팅**: 질문 답변 또는 `전문가 추천 세팅` → 완성도 100%
- [ ] **5. Spec→위젯 생성(DoD-6)**: 생성 실행 → 백엔드 경유 Gemma 4가 **통합 대시보드 1개에 초기 위젯 4~6개(확정 10종 내)** 자동 배치(카탈로그 외 생성 없음)
- [ ] **6. 위젯 제작 채팅(DoD-3, item 1·2·3)**: 위젯 제작 명령 → Gemma 4 Tool Call → **10종 내** 결과만 백엔드 검증 후 반영 · 드래그/이동/리사이즈/옵션변경/삭제 · **운영 분석 질문은 안내 반려**
- [ ] **7. 데이터 URL 연동(DoD-4, item 5)**: 내부 URL 등록/선택 → **백엔드 경유 실제 fetch** → 응답 필드 확인 → 필드↔위젯 바인딩 → 조회값 표시 → 변경 시 자동 갱신
- [ ] **8. 서버 DB 저장(DoD-5, item 3)**: 프로젝트·Spec·위젯·데이터 매핑이 **서버 DB에 저장**(퍼블리시 시 `/projects` 카드)
- [ ] **9. 재접속 복원**: **브라우저/세션 교체 후** 재접속 → 서버 DB로부터 레이아웃·브랜드·**데이터 연결/바인딩** 동일 복원
- [ ] **10. 읽기 전용**: `/monitoring` → 저장 화면이 편집 불가로 렌더
- [ ] **11. 오류/차단 처리**: Gemma 4/네트워크 오류 시 메시지만 노출, 크래시 없음, **외부 fallback 미발생**
- [ ] **12. 통합 초기화(DoD-8, item 8)**: `POC 통합 초기화` 1회 → 프로젝트·더미데이터·로컬 draft **모두 초기 상태**
- [ ] **13. 반복 안정성(DoD-10)**: 통합 초기화부터 읽기 전용 결과 확인까지 전체 흐름을 **개발자 개입 없이 3회 연속** 정상 수행한다.

### 9.1 반복 안정성 기준 (DoD-10 · item 6)
> POC 통합 초기화 후 전체 E2E 흐름을 **개발자의 코드 수정·DB 수동 조작·서버 데이터 직접 수정·브라우저 개발자도구 조작 없이 3회 연속** 정상 수행해야 한다.

- **1회 E2E 범위**: 통합 초기화 → 로그인 → AIM Monitoring 선택 → 에너지 시설 통합 관제 선택 → Spec 입력·**서버 저장** → Gemma 4 초기 위젯 **4~6개** 생성 → 에디터 실제 반영 → 위젯 제작 채팅으로 추가/수정 → 내부 데이터 소스 선택 → 필드 바인딩 → 더미 데이터 위젯 표시 → **프로젝트 서버 DB 저장** → 다른 브라우저/새 세션 재접속 → 프로젝트·위젯·데이터 연결 복원 → 읽기 전용 화면 확인.
- **3회 연속 성공 기준**
  - 각 회차 시작 전 **POC 통합 초기화** 사용 · 개발자 코드 수정 금지 · DB 직접 수정 금지 · 서버 프로세스 수동 재시작에 의존하지 않음 · DevTools storage 삭제 금지
  - Gemma 4 응답 실패 시 **외부 LLM fallback 금지** · 3회 모두 동일 핵심 흐름 완료
  - 생성 위젯 조합은 달라도 되나 **4~6개 범위와 10종 화이트리스트 준수**
  - 각 회차의 Gemma 4 추론 시간·성공 여부를 **`AiAction`에 기록**([6.2](#62-poc-목표-서버-db-영속화-item-35--dod-5))
  - 실패 회차 발생 시 원인을 기록하고 **3회 연속을 다시 시작**

---

## 10. POC 제외 / 비대상 (검수하지 않음)

- **외부 클라우드 LLM 사용** (POC는 온프레미스 Gemma 4 전용, 폐쇄망) — 현재 코드의 Claude/Gemini 호출은 개발 편의용이며 POC 최종 구성에서 제거 대상
- 프론트엔드의 DB/LLM 직접 접속 (반드시 AIMNIS 백엔드 경유)
- **실제 발전소 운영 데이터** 및 실장비 실시간 스트리밍
  - ※ 단, **읽기 전용 내부 더미 데이터 API/DB 조회→위젯 바인딩→갱신은 POC 실제 구현 범위**(4.7). "목업" 아님.
- ThinkStation PGX 세부 사양·Gemma 4 세부 모델·양자화 방식의 **문서상 확정**(견적서/벤치마크 후 기입 — [0.2](#02-장비모델-표기-규칙-문서-전체-통일))
- 실인증·다중 사용자/권한/협업, 배포·CI
- AIM GUARD 앱·에디터(`/guard`, `?solution=guard`), AIM ECO 및 roadmap 솔루션
- 파일(PDF/이미지) 실제 파싱(업로드는 애니메이션 연출)

---

### 부록 A. 주요 파일 인덱스
- 라우팅: [src/app/](src/app/) (`page.tsx`, `home/`, `editor/`, `projects/`, `monitoring/`, `api/`)
- Monitoring 에디터: [src/components/monitoring-editor/](src/components/monitoring-editor/)
- 홈/Spec: [src/components/home/](src/components/home/)
- 상태: [src/store/](src/store/) (`homeStore`, `projectStore`, `monitoringPagesStore`, `monitoringEditorStore`)
- 데이터/카탈로그: [src/data/](src/data/), [src/solutions/monitoring/](src/solutions/monitoring/)
- 로더: [src/lib/solutionLoader.ts](src/lib/solutionLoader.ts)

> 본 문서는 코드 기준 스냅샷이다. 위 파일이 변경되면 해당 항목의 상태·근거 라인을 함께 갱신할 것.
