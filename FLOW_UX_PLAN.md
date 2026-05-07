# 홈 채팅 플로우 + API 사용량 대시보드

**작성일**: 2026-05-07  
**원칙**: 물 흐르듯 자연스러운 UX — 막힘 없이, 에임이가 이끈다

---

## 핵심 변경사항

### A. 홈 채팅 → 시나리오 자연 유도

```
사용자 입력 (자연어)
    ↓
에임이가 현장 파악 → 적합한 솔루션 추천
    ↓
__SCENARIO__{"id":"energy"} 마커 반환
    ↓
[에너지 시설 통합 관제로 시작하기] 버튼 자동 표시
    ↓
클릭 → setSelectedScenario + setIsWorking → Step2 자동 진입
```

**핵심**: VC 앞에서 시나리오를 "설명"이 아닌 "대화"로 자연스럽게 도달

### B. Claude API 사용량 대시보드

- `/api/chat` (non-streaming): `resp.usage` → X-Usage 헤더로 클라이언트 전달
- `/api/home` (streaming): 완료 후 클라이언트에서 응답 길이로 토큰 추정
- usageStore (zustand persist): 날짜별 토큰 + 비용 누적 저장
- SettingsDrawer에 대시보드 추가

---

## 변경 파일

| 파일 | 작업 |
|------|------|
| `src/app/api/home/route.ts` | 시나리오 발견 전용 시스템 프롬프트 + usage 헤더 |
| `src/app/api/chat/route.ts` | X-Usage 헤더 추가 |
| `src/components/home/HomeHero.tsx` | __SCENARIO__ 파싱 + 추천 버튼 + usage 캡처 |
| `src/components/home/HomeV2.tsx` | usage 캡처 |
| `src/store/usageStore.ts` | 신규: 토큰/비용 추적 |
| `src/components/layout/SettingsDrawer.tsx` | usage 대시보드 섹션 추가 |

---

## 시나리오 추천 시스템 프롬프트 설계

```
[솔루션 ID → 현장 키워드]
energy:        전력, 발전소, 변전소, 에너지, KEPCO, 데이터센터, 전기
manufacturing: 공장, 제조, 생산, 라인, 창고, 품질, 작업자, 설비
smartcity:     도시, 지자체, 공공, 건물, 스마트시티, 주차장, 상업

[응답 규칙]
1. 2~3문장으로 추천 이유 설명 (전문적, 이모지 없음)
2. 마지막에 반드시 __SCENARIO__{"id":"ID"} 포함
3. 불확실하면 질문만 (마커 없음)
```

---

## 사용량 추적 설계

```typescript
interface DayUsage {
  date: string;        // "2026-05-07"
  calls: number;
  inputTokens: number;
  outputTokens: number;
}
// 비용 = (input * 0.8 + output * 4) / 1_000_000 (Haiku 기준)
```

---

## 체크리스트

- [ ] /api/home 시스템 프롬프트 교체
- [ ] /api/chat X-Usage 헤더 추가
- [ ] HomeHero __SCENARIO__ 파싱 + 버튼 + usage 캡처
- [ ] HomeV2 usage 캡처
- [ ] usageStore.ts 신규
- [ ] SettingsDrawer usage 대시보드
- [ ] TS 체크 + 커밋
