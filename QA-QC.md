# AIMNIS QA/QC Harness

## 목적

기존 데모 기능과 디자인을 유지하면서 라우트, 브라우저 런타임, Monitoring UI 상태, 시각적 변경을 자동 회귀 검사한다.

## 실행

```bash
# 정적 검사 + 11개 브라우저 스모크 + 4개 시각 회귀
npm run qa

# TypeScript·솔루션 패키지·JSON 스키마
npm run qa:static

# 라우트·로그인·콘솔 오류·Monitoring UI 계약
npm run qa:smoke

# 승인된 1280px 기준 스크린샷 비교
npm run qa:visual

# 의도한 디자인 변경을 검수한 후에만 기준선 갱신
npm run qa:visual:update
```

## 현재 검사 범위

- `/`, `/home`, `/editor`, `/editor?solution=monitoring`, `/projects`, `/guard`, `/monitoring`
- 모든 라우트의 HTTP 상태, 서버 오류 오버레이, `pageerror`, `console.error`
- 빈 입력값을 포함한 데모 로그인의 `/home` 진입
- Monitoring 사이드바 접기 후 72px, 헤더 로고 영역 220px 유지
- Monitoring 확대·실행 화면의 `페이지 추가` 숨김
- 선택한 기본 위젯의 `패널 라인` 색상이 실제 computed style에 반영되는지 검사
- 로그인, 홈, Monitoring 편집, Monitoring 실행 화면의 1280px 시각 기준선
- marketplace에 등록된 솔루션의 manifest/schema/template/widget registry 계약

## 운영 규칙

- `next dev`와 `next build`를 동시에 실행하지 않는다. 같은 `.next` 캐시를 공유해 서버 청크가 유실될 수 있다.
- 시각 기준선은 디자인 변경을 사람이 검수한 후에만 갱신한다.
- 버그를 수정할 때 같은 상황의 회귀 테스트를 함께 추가한다.
- 500줄 초과 파일은 현재 경고로 보고한다. 기능별 회귀 테스트가 추가된 후 작은 단위로 분리한다.
