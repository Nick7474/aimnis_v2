# AIMNIS White-Label MVP Plan

작성일: 2026-04-29

## 1. 목표

AIMNIS/AIM GUARD 데모의 다음 핵심 목표는 단순한 화면 편집 기능이 아니라, VC가 보는 자리에서 다음 명제를 제품으로 증명하는 것이다.

> "AIMNIS는 SI 프로젝트를 매번 새로 만드는 회사가 아니라, 하네스 기반 AI 제어 구조로 엔터프라이즈 솔루션을 2개월 안에 고객사 브랜드로 반복 납품할 수 있는 플랫폼이다."

피치덱의 핵심 메시지와 직접 연결되는 포인트는 다음과 같다.

- Full White-Label
- Headless SDK
- Multi-Tenant SaaS
- No-Code Builder
- 2개월 납품
- Write Once, Sell Twice
- 공공/에너지 엔터프라이즈 레퍼런스 기반 확장

따라서 이번 작업의 목적은 "모든 CSS 속성을 수정 가능한 편집기"가 아니라, 투자자가 3~5분 안에 "이건 반복 납품 가능한 플랫폼이구나"라고 느끼는 데모 흐름을 만드는 것이다.

## 1.1 절대 원칙: 기존 기능 보존

화이트 라벨링 MVP는 기존에 구현된 기능을 대체하거나 훼손하는 작업이 아니다. 아래 기능은 어떤 수정 이후에도 반드시 정상 동작해야 한다.

- 홈 Step 1, Step 2 하네스 설문
- AIM GUARD 초기 화면 자동 구성 흐름
- 에디터 3패널 구조
- 좌측 AI Agent 대화 및 위젯 생성 흐름
- 중앙 AIM GUARD 모니터 프리뷰
- 기존 위젯 추가, 선택, 이동, 삭제, 설정 변경
- 우측 설정/매핑 패널
- 데이터 매핑 화면
- JSON/API/폴더 드래그 앤 드랍 데이터 소스 추가
- 기존 노드와 필드의 사전 연결 상태 표시
- 신규 연결선 생성 및 최근 연결선 하이라이트
- AIM GUARD 헤더, 사이드바, 지도, 알람, 플로어 상태 패널
- 새 페이지 추가/삭제 흐름
- 기존 브랜드 설정 목업 기능
- 샘플 데이터와 데모용 JSON 파일

작업 원칙:

- 기존 기능을 지우고 새 기능으로 갈아엎지 않는다.
- 기존 사용자 흐름 위에 화이트 라벨링 레이어를 얹는다.
- UI 구조를 바꿀 때도 기존 진입점과 기능 의미는 유지한다.
- 새 기능은 점진적으로 추가하고, 기존 동작이 깨지는 리팩토링은 피한다.
- 구현 후에는 최소한 `/home`, `/editor?solution=guard`, 모니터 화면, 데이터 매핑 화면의 기본 동작을 확인한다.
- 기존 파일에 사용자의 다른 변경사항이 있으면 되돌리지 않고 함께 맞춘다.

성공 기준:

> 화이트 라벨링을 추가한 뒤에도 기존 AIMNIS 데모는 그대로 작동해야 하며, 사용자는 기존 기능을 잃지 않고 더 강한 납품형 편집 경험을 얻어야 한다.

## 2. 현재 상태 진단

현재 프로젝트에는 이미 화이트 라벨링의 기본 뼈대가 있다.

- `BrandSettings`에 `primaryColor`, `secondaryColor`, `fontFamily`, `logoUrl`이 존재한다.
- 헤더, 사이드바, 맵, 알람 패널 등 주요 영역이 `EditableSection`으로 선택 가능하다.
- 우측 설정 패널에서 컬러, 폰트, 로고 목업을 변경할 수 있다.
- `src/solutions/guard/harness-schema.json`에 디자인 시스템, 브랜드 가이드, 로고, 폰트, 컬러 입력 개념이 정의되어 있다.
- 데이터 매핑 화면이 추가되어 엔터프라이즈 데이터 연결 구조를 시각적으로 보여줄 수 있다.

하지만 현재 상태는 "화이트 라벨링 엔진"보다는 "브랜드 설정 목업"에 가깝다.

주요 부족점:

- 로고를 업로드해도 AIM GUARD 헤더 전체가 고객사 브랜드로 전환되는 인상이 약하다.
- 컬러 변경이 화면 전체 토큰으로 충분히 전파되지 않는다.
- 패널별 편집 옵션이 아직 납품 가능한 수준의 정보 구조로 정리되어 있지 않다.
- 선택한 영역에 맞는 컨텍스트 인스펙터보다는 설정 항목이 한꺼번에 보이는 느낌이 강하다.
- Before/After 비교 장면이 없어 "브랜드 완전 보존"을 즉시 증명하기 어렵다.
- 고객사별 브랜드 프로필 저장/불러오기 구조가 약하다.

## 3. 핵심 UX 원칙

참조 UX는 Claude Design의 "필요할 때만 집중해서 편집하는 구조"다.

기본 구조:

- 좌측: AI Agent
- 중앙: AIM GUARD 실시간 프리뷰
- 우측: 선택 영역 기반 Inspector

중요한 원칙:

- 중앙 프리뷰가 항상 주인공이어야 한다.
- 좌측 AI Agent는 평소에는 접히거나 얇게 보이고, 자연어 편집이 필요할 때 확장된다.
- 우측 Inspector는 선택한 화면 요소에 필요한 옵션만 보여준다.
- 모든 옵션을 한번에 보여주지 않는다.
- 사용자는 "무엇을 수정할지"를 화면에서 직접 클릭해 선택한다.
- 변경 사항은 즉시 중앙 프리뷰에 반영된다.
- AI 변경과 수동 변경이 함께 작동해야 한다.

## 4. 사용자 저니

### Step 1. 하네스 설문

사용자는 홈 Step 1, Step 2에서 현장 조건을 입력한다.

예:

- 시설 유형
- 면적
- 운영 시간
- CCTV 규모
- 보안 위협 유형
- 데이터 보존 기간
- 운영 인력

AI Agent는 설문 결과를 바탕으로 AIM GUARD 초기 구성을 만든다.

### Step 2. AIM GUARD 자동 구성

AI가 다음을 자동 구성한다.

- 기본 화면 구조
- 지도 기반 모니터링
- 알람 패널
- CCTV/장비 현황
- 운영 인력/위험 이벤트 패널
- 추천 데이터 매핑

이 단계의 메시지:

> "하네스가 현장 조건을 통제하고, AI가 그 안에서 솔루션을 생성한다."

### Step 3. 데이터 매핑 확인

사용자는 데이터 매핑 화면에서 실제 현장 데이터가 어떤 패널과 연결되는지 확인한다.

이 단계의 메시지:

> "AIMNIS는 단순한 UI 빌더가 아니라 엔터프라이즈 데이터 연결 구조를 가진다."

### Step 4. 화이트 라벨 모드 진입

사용자는 AIM GUARD 프리뷰에서 헤더, 사이드바, 맵, 알람 패널 등을 클릭한다.

클릭한 요소에 따라 우측 Inspector가 바뀐다.

- 헤더 클릭: 로고, 서비스명, 고객사명, 헤더 배경, 알림 영역
- 사이드바 클릭: 메뉴명, 아이콘, 활성 컬러, 접힘 여부, 메뉴 순서
- 지도 클릭: 맵 스타일, 마커 컬러, 위험 구역, 범례, 줌 컨트롤
- 알람 패널 클릭: 심각도 컬러, 표시 필드, 카드 밀도, 버튼 문구
- 전체 페이지 클릭: 브랜드 프리셋, 폰트, radius, density, 톤

### Step 5. AI Brand Command

사용자는 좌측 AI Agent에 자연어로 요청한다.

예:

```text
포스코 스마트팩토리 납품용처럼 산업 안전 관제 톤으로 바꿔줘.
```

AI Agent는 실제 구현에서는 프리셋 기반으로 다음을 변경한다.

- 고객사/현장명
- 서비스명
- 로고
- 주 컬러
- 보조 컬러
- 위험/경고/정상 색상
- 헤더/사이드바/탭 톤
- 지도 마커/범례 컬러
- 알람 패널 밀도

이 단계의 메시지:

> "자연어 한 줄로 고객사 납품형 UI가 생성된다."

### Step 6. Before/After 비교

사용자는 다음 두 상태를 토글하거나 분할 비교한다.

- AIM GUARD 기본형
- 고객사 브랜드 적용형

이 장면은 VC 데모에서 가장 중요한 순간이다.

이 단계의 메시지:

> "브랜드 완전 보존이 가능한 Full White-Label 플랫폼이다."

### Step 7. Tenant Profile 저장

최종 브랜드 설정을 고객사 프로필로 저장한다.

예:

- `posco-smart-safety-brand.json`
- `kepco-energy-control-brand.json`
- `busan-digital-twin-brand.json`
- `hanwha-cctv-command-brand.json`

이 단계의 메시지:

> "고객사별 납품 설정이 자산화되고, 다음 납품에 재사용된다."

## 5. MVP 기능 범위

### 반드시 구현할 것

#### 5.1 Brand Kit

브랜드 설정을 단순 색상 2개에서 고객사 납품 프로필로 확장한다.

필드 제안:

```ts
interface BrandSettings {
  tenantName: string;
  serviceName: string;
  productName: string;
  logoUrl: string | null;
  logoMode: "symbol" | "wordmark" | "combined";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  fontFamily: string;
  radius: "sharp" | "soft" | "rounded";
  density: "compact" | "standard" | "spacious";
  mapTone: "deep" | "blueprint" | "satellite" | "mono";
}
```

#### 5.2 Live Theme Tokens

브랜드 설정은 AIM GUARD 화면 전체에 CSS 변수로 즉시 반영되어야 한다.

우선 적용 대상:

- 헤더 배경/보더
- AIM GUARD 로고 영역
- 시스템 타이틀
- 사이드바 배경
- 활성 메뉴 색상
- 탭 활성 상태
- 주요 버튼
- 알람 배지
- 지도 마커
- 범례
- 우측 상태 카드

#### 5.3 Brand Presets

프리셋은 MVP에서 매우 중요하다. 실제 AI 생성보다 더 안정적이고, VC 데모에서 실패 확률이 낮다.

추천 프리셋:

- AIM GUARD Default
- POSCO Smart Safety
- KEPCO Energy Control
- Busan Digital Twin
- Hanwha CCTV Command
- Public Institution Neutral

각 프리셋은 실제 기업명 그대로 쓰기보다 데모용 명칭으로 처리해도 된다.

#### 5.4 Context Inspector

우측 설정 패널을 선택 요소 기반으로 재구성한다.

구조:

- 선택 요소명
- 현재 적용 브랜드 토큰
- 자주 쓰는 옵션
- 고급 옵션 접힘 영역
- AI 제안 변경사항

패널별 옵션:

- Header Inspector: 로고, 기관명, 서비스명, 헤더 톤
- Navigation Inspector: 메뉴 라벨, 아이콘, 활성 색상, 메뉴 밀도
- Map Inspector: 맵 톤, 마커 색상, 범례, 위험 구역
- Alarm Inspector: 심각도 컬러, 카드 밀도, 표시 필드
- Global Brand Inspector: 프리셋, 폰트, 전체 컬러 토큰, radius, density

#### 5.5 AI Brand Agent

좌측 AI Agent는 실제 디자인 생성 엔진처럼 보이되, MVP에서는 안정적인 프리셋/룰 기반으로 동작해도 된다.

필수 동작:

- 자연어에서 산업/기관/톤을 감지한다.
- 적절한 프리셋을 추천한다.
- 변경 전/후 요약을 보여준다.
- 사용자가 적용 버튼을 누르면 브랜드 토큰을 일괄 적용한다.

예시 응답:

```text
산업 안전 관제 톤으로 변경합니다.

적용 항목:
- 헤더: 딥 네이비 + 스틸 블루
- 주요 액션: 시안 계열
- 위험 이벤트: 레드 오렌지
- 정상 상태: 그린
- 지도 마커: 설비/작업자/위험 유형별 컬러 분리
```

#### 5.6 Before/After

투자자 데모 전용으로 반드시 필요하다.

형태:

- 상단 토글: Before / After
- 또는 중앙 분할 비교
- 또는 단축키/버튼으로 원본과 브랜드 적용 상태 전환

표시 문구:

- `AIM GUARD Default`
- `Tenant Branded`
- `White-label profile applied`

#### 5.7 Tenant Brand JSON

고객사별 설정을 JSON으로 저장/불러오기 가능해야 한다.

저장 예시:

```json
{
  "id": "posco-smart-safety",
  "tenantName": "POSCO Smart Factory",
  "serviceName": "Smart Safety Command Center",
  "primaryColor": "#0f766e",
  "secondaryColor": "#38bdf8",
  "dangerColor": "#ef4444",
  "warningColor": "#f59e0b",
  "successColor": "#22c55e",
  "fontFamily": "Noto Sans KR",
  "density": "compact",
  "mapTone": "blueprint"
}
```

## 6. 이번 MVP에서 하지 않을 것

Series A 데모 기준으로 지금 당장 하지 않는 것이 좋은 항목:

- 완전한 Figma 수준의 레이어 패널
- 모든 margin/padding 수동 조정
- 커스텀 폰트 파일 업로드/서빙
- 실제 멀티테넌트 백엔드
- 실제 Headless SDK npm 패키지
- 모든 브레이크포인트 반응형 편집
- 전체 컴포넌트 CSS 속성 편집
- 복잡한 권한/승인 워크플로우

이 항목들은 장기적으로 중요하지만, 지금은 데모를 산만하게 만들 수 있다.

## 7. 작업 단계

### Phase 1. White-Label Foundation

목표:

브랜드 토큰 구조를 확장하고 AIM GUARD 화면 전체에 실제로 반영한다.

작업:

- `BrandSettings` 타입 확장
- 기본 브랜드 프리셋 데이터 추가
- CSS 변수 적용 함수 추가
- 헤더, 사이드바, 탭, 버튼, 알람, 마커, 카드에 토큰 연결
- 로고/기관명/서비스명 실제 반영

완료 기준:

- 프리셋 클릭 한 번으로 화면 전체 분위기가 바뀐다.
- 로고와 서비스명이 헤더에 실제 반영된다.
- 컬러 변경이 주요 UI 전체에 전파된다.

### Phase 2. Focus Inspector

목표:

Claude Design처럼 선택한 요소에 맞는 우측 Inspector를 만든다.

작업:

- 선택 영역별 Inspector 구성
- Header / Navigation / Map / Alarm / Global Brand 섹션 분리
- 고급 옵션 접힘 처리
- 변경 사항 즉시 프리뷰 반영

완료 기준:

- 헤더를 클릭하면 헤더 옵션만 나온다.
- 맵을 클릭하면 맵 옵션만 나온다.
- 알람 패널을 클릭하면 알람 옵션만 나온다.
- 전체 설정이 과하게 한 화면에 노출되지 않는다.

### Phase 3. AI Brand Agent

목표:

자연어로 고객사 브랜드 전환을 수행하는 것처럼 보이는 데모 흐름을 만든다.

작업:

- 자연어 명령 예시 추가
- 프리셋 매칭 로직 추가
- 변경 요약 카드 추가
- 적용/되돌리기 버튼 추가
- 좌측 AI 패널 focus/collapse UX 개선

완료 기준:

- "산업 안전 관제 톤으로 바꿔줘" 명령으로 프리셋이 제안된다.
- 적용하면 중앙 프리뷰가 즉시 바뀐다.
- 변경 요약이 남는다.

### Phase 4. Before/After Demo

목표:

VC가 Full White-Label을 즉시 이해할 수 있는 비교 장면을 만든다.

작업:

- 원본 브랜드 상태 보관
- 적용 브랜드 상태 보관
- Before/After 토글 또는 비교 버튼 추가
- 데모용 설명 뱃지 추가

완료 기준:

- 기본 AIM GUARD와 고객사 브랜드 적용형을 빠르게 전환할 수 있다.
- 투자자가 변화 전후를 즉시 인지할 수 있다.

### Phase 5. Tenant Profile

목표:

반복 납품 가능한 플랫폼이라는 증거를 만든다.

작업:

- 브랜드 프로필 JSON 샘플 추가
- 프로필 불러오기 UI 추가
- 현재 설정 export 형태 정의
- 하네스 산출물과 연결되는 설명 추가

완료 기준:

- 고객사 프리셋을 파일/목록에서 선택할 수 있다.
- 설정이 하나의 납품 프로필처럼 보인다.

## 8. VC 데모 스크립트

권장 데모 흐름:

1. 홈에서 하네스 설문을 입력한다.
2. AI가 AIM GUARD 기본 관제 화면을 구성한다.
3. 데이터 매핑 화면에서 현장 데이터와 패널 연결을 보여준다.
4. AIM GUARD 프리뷰로 돌아온다.
5. "포스코 스마트팩토리 납품용처럼 바꿔줘"라고 입력한다.
6. AI가 브랜드 변경 요약을 보여준다.
7. 적용 버튼을 누른다.
8. 로고, 컬러, 메뉴, 알람, 지도 마커가 모두 고객사 톤으로 바뀐다.
9. Before/After 토글로 변화 전후를 비교한다.
10. Tenant Brand Profile이 저장된다는 점을 보여준다.

이 스크립트의 핵심 문장:

> "저희는 매번 SI를 새로 만드는 것이 아니라, 하네스가 통제하는 범위 안에서 현장 조건, 데이터 구조, 고객사 브랜드를 결합해 납품형 솔루션을 생성합니다."

## 9. 투자 설득 확률 가정

정확한 투자 확률은 VC 성향, 미팅 퀄리티, 계약 증빙, 밸류에이션 조건에 따라 달라진다. 아래는 제품 데모와 피치덱 기준의 주관적 추정이다.

### 현재 상태

- 후속 미팅/관심 확보: 40~45%
- 3억 투자 클로징: 20~28%

이유:

- 누적 실매출 8.32억, 6개 기관 레퍼런스, 67% 납기 단축 메시지는 강하다.
- 다만 현재 데모만으로는 "좋은 SI 팀"과 "반복 가능한 플랫폼"의 차이를 완전히 증명하기 어렵다.

### White-Label MVP 완성 후

- 후속 미팅/관심 확보: 65~75%
- 3억 투자 클로징: 40~55%

이유:

- 하네스 설문, 데이터 매핑, 화이트 라벨링, 납품형 프리뷰가 하나의 흐름으로 연결된다.
- 피치덱의 Full White-Label, Headless SDK, Write Once Sell Twice 주장이 화면에서 증명된다.
- 3억 규모의 시드/프리A 성격 라운드에서는 충분히 현실적인 설득력을 갖는다.

## 10. 우선순위

가장 먼저 할 작업:

1. BrandSettings 확장
2. 브랜드 프리셋 추가
3. AIM GUARD 화면 전체에 브랜드 토큰 연결
4. Header/Navigation/Map/Alarm Inspector 1차 구성
5. AI Brand Command 1차 구현
6. Before/After 토글 추가
7. Tenant Brand JSON 샘플 추가

절대 잊지 말아야 할 기준:

> 기능을 많이 보여주는 것이 목표가 아니다. "반복 납품 가능한 엔터프라이즈 AI 플랫폼"이라는 인상을 3~5분 안에 만드는 것이 목표다.
