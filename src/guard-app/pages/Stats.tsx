import React, { useMemo } from 'react';
import { Col, DatePicker, Row, Select, Space, Table, Tag } from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined,
  AlertOutlined, CheckCircleOutlined,
  ThunderboltOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { MOCK_STATS } from '../mock/data';

const { RangePicker } = DatePicker;

const DEV_COLORS = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706'];

/* ── KPI 카드 ─────────────────────────────────── */
const KpiCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { label: string; up: boolean };
  glow?: boolean;
}> = ({ title, value, unit, icon, color, trend, glow }) => (
  <div style={{
    background: '#0C1733',
    border: `1px solid ${color}44`,
    borderLeft: `3px solid ${color}`,
    borderRadius: 8,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: glow ? `0 0 18px ${color}22` : 'none',
    height: '100%',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{title}</span>
      <span style={{ color, fontSize: 16, opacity: 0.8 }}>{icon}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{
        fontSize: 32, fontWeight: 800, color,
        textShadow: glow ? `0 0 12px ${color}88` : 'none',
        lineHeight: 1,
      }}>{value}</span>
      {unit && <span style={{ fontSize: 14, color: '#94a3b8' }}>{unit}</span>}
    </div>
    {trend && (
      <div style={{ fontSize: 11, color: trend.up ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 3 }}>
        {trend.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {trend.label}
      </div>
    )}
  </div>
);

/* ── 바 차트 ──────────────────────────────────── */
const BarChart: React.FC<{
  data: { name: string; value: number; color?: string }[];
  height?: number;
  showValue?: boolean;
}> = ({ data, height = 180, showValue = true }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => {
        const barH = Math.max(Math.round((d.value / max) * (height - 36)), 4);
        const color = d.color ?? '#2563EB';
        return (
          <div key={d.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {showValue && (
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{d.value}</span>
            )}
            <div style={{ width: '100%', position: 'relative' }}>
              <div style={{
                width: '100%',
                height: barH,
                background: `linear-gradient(180deg, ${color}ee 0%, ${color}88 100%)`,
                borderRadius: '3px 3px 0 0',
                boxShadow: `0 0 8px ${color}44`,
                transition: 'height .3s',
              }} />
            </div>
            <span style={{
              fontSize: 9, color: '#475569', textAlign: 'center',
              lineHeight: 1.2, whiteSpace: 'nowrap',
            }}>{d.name}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── 도넛 차트 ────────────────────────────────── */
const DonutChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const segments = useMemo(() => {
    let acc = 0;
    return data.map((d, i) => {
      const pct = (d.value / total) * 100;
      const start = acc;
      acc += pct;
      return { ...d, pct, start, color: DEV_COLORS[i % DEV_COLORS.length] };
    });
  }, [data, total]);

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(', ');

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 140, height: 140,
          borderRadius: '50%',
          background: `conic-gradient(${gradientStops})`,
          boxShadow: '0 0 24px rgba(37,99,235,.25)',
        }} />
        <div style={{
          position: 'absolute', inset: 28,
          borderRadius: '50%',
          background: '#0C1733',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>총계</span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: '#cbd5e1' }}>{s.name}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 12, color: '#64748b', minWidth: 40, textAlign: 'right' }}>
              ({s.pct.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 섹션 헤더 ────────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 12, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottom: '1px solid #1E3A5F',
    display: 'flex', alignItems: 'center', gap: 6,
  }}>
    <span style={{ width: 3, height: 12, background: '#2563EB', borderRadius: 2, display: 'inline-block' }} />
    {children}
  </div>
);

/* ── 패널 래퍼 ────────────────────────────────── */
const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: '#0C1733',
    border: '1px solid #1E3A5F',
    borderRadius: 8,
    padding: '16px 18px',
    height: '100%',
    ...style,
  }}>
    {children}
  </div>
);

/* ── 메인 ─────────────────────────────────────── */
const StatsPage: React.FC = () => {
  const s = MOCK_STATS;

  const hourlyData = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      name: `${i}시`,
      value: Math.round(Math.random() * 70 + 5),
      color: '#2563EB',
    })), []);

  const topZoneTotal = s.topZones.reduce((a, z) => a + z.count, 0);

  const topZoneColumns = [
    {
      title: 'Zone',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <span style={{ color: '#e2e8f0', fontSize: 12 }}>{v}</span>,
    },
    {
      title: '이벤트',
      dataIndex: 'count',
      key: 'count',
      width: 70,
      render: (v: number) => <span style={{ color: '#2563EB', fontWeight: 700 }}>{v}</span>,
    },
    {
      title: '비율',
      key: 'bar',
      render: (_: unknown, r: { count: number }) => {
        const pct = Math.round((r.count / topZoneTotal) * 100);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ flex: 1, height: 6, background: '#0F1E3D', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: 'linear-gradient(90deg, #2563EB, #60A5FA)',
                borderRadius: 3,
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#64748b', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-container" style={{ padding: '16px 20px', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── 헤더 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', letterSpacing: 0.5 }}>통계 대시보드</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>실시간 보안 이벤트 현황</div>
        </div>
        <Space wrap>
          <Select
            defaultValue="today"
            style={{ width: 110 }}
            options={[
              { label: '오늘', value: 'today' },
              { label: '어제', value: 'yesterday' },
              { label: '최근 7일', value: 'week' },
              { label: '이번 달', value: 'month' },
            ]}
          />
          <RangePicker placeholder={['시작일', '종료일']} />
        </Space>
      </div>

      {/* ── KPI 카드 ── */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="전체 이벤트"
            value={s.totalEvents.toLocaleString()}
            unit="건"
            icon={<ThunderboltOutlined />}
            color="#2563EB"
            trend={{ label: '전일 대비 +87건', up: true }}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="위험 (CRITICAL)"
            value={s.critical}
            unit="건"
            icon={<AlertOutlined />}
            color="#DC2626"
            trend={{ label: '전일 대비 +3건', up: false }}
            glow
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="미확인 알람"
            value={s.unacked}
            unit="건"
            icon={<ClockCircleOutlined />}
            color="#EA580C"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="확인 처리율"
            value={s.ackRate}
            unit="%"
            icon={<CheckCircleOutlined />}
            color="#16A34A"
            trend={{ label: '전일 대비 +2.1%', up: true }}
          />
        </Col>
      </Row>

      {/* ── 시간대별 + 장비별 ── */}
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={16}>
          <Panel>
            <SectionTitle>시간대별 이벤트 발생 추이 (오늘)</SectionTitle>
            <BarChart data={hourlyData} height={190} />
          </Panel>
        </Col>
        <Col xs={24} lg={8}>
          <Panel>
            <SectionTitle>장비 종류별 이벤트 비율</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <DonutChart data={s.byDeviceType} />
            </div>
          </Panel>
        </Col>
      </Row>

      {/* ── Zone 순위 ── */}
      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <Panel>
            <SectionTitle>Zone별 이벤트 Top 5</SectionTitle>
            <Table
              rowKey="name"
              dataSource={s.topZones}
              columns={topZoneColumns}
              size="small"
              pagination={false}
              style={{ fontSize: 12 }}
              className="stats-table"
            />
          </Panel>
        </Col>
      </Row>

    </div>
  );
};

export default StatsPage;
