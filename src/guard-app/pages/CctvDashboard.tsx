import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import {
  VideoCameraOutlined,
  PlusOutlined,
  FullscreenOutlined,
  CloseOutlined,
  SoundOutlined,
  SoundFilled,
} from '@ant-design/icons';

/* ─── 카메라 데이터 ─────────────────────────────────── */
interface Camera {
  id: string;
  name: string;
  group: string;
  channelId: string;
  status: 'online' | 'offline';
  hasAlarm?: boolean;
}

const CAMERA_GROUPS: { label: string; key: string }[] = [
  { label: '본관 (Main Building)', key: 'main' },
  { label: '외부 (Exterior)', key: 'ext' },
];

const CAMERAS: Camera[] = [
  { id: 'cam-01', name: '1층 로비', channelId: 'CAM_01', group: 'main', status: 'online' },
  { id: 'cam-02', name: '1층 복도', channelId: 'CAM_02', group: 'main', status: 'online' },
  { id: 'cam-03', name: '2층 복도', channelId: 'CAM_03', group: 'main', status: 'online', hasAlarm: true },
  { id: 'cam-04', name: '주차장 입구', channelId: 'CAM_04', group: 'ext', status: 'online' },
  { id: 'cam-05', name: 'NVR/ODM (MediaMTX)', channelId: 'NVR_ODM', group: 'ext', status: 'online' },
  { id: 'cam-06', name: 'NVR 빈 프레임 (Frame)', channelId: 'NVR_FRAME', group: 'ext', status: 'offline' },
  { id: 'cam-07', name: '볼피수거함', channelId: 'CAM_05', group: 'ext', status: 'online' },
];

/* ─── 그리드 레이아웃 설정 ─────────────────────────── */
type Layout = 1 | 4 | 9 | 16 | 32;

interface LayoutConfig {
  label: string;
  cols: number;
  rows: number;
  cells: number;
}

const LAYOUTS: Record<Layout, LayoutConfig> = {
  1:  { label: '1',  cols: 1, rows: 1, cells: 1  },
  4:  { label: '4',  cols: 2, rows: 2, cells: 4  },
  9:  { label: '9',  cols: 3, rows: 3, cells: 9  },
  16: { label: '16', cols: 4, rows: 4, cells: 16 },
  32: { label: '32', cols: 6, rows: 6, cells: 36 },
};

/* ─── 모의 스태틱 노이즈 화면 (canvas) ─────────────── */
const MockVideoFeed: React.FC<{ camera: Camera; muted: boolean }> = ({ camera, muted: _ }) => {
  const noiseColors: Record<string, string[]> = {
    'cam-01': ['#1a2a1a', '#0d1f2d', '#223322'],
    'cam-02': ['#1f2a1f', '#101f30', '#152515'],
    'cam-03': ['#2a1a1a', '#1f0d0d', '#301515'],
    'cam-04': ['#1a1a2a', '#0d0d20', '#151530'],
    'cam-05': ['#1a241a', '#101e10', '#1a2a1a'],
    'cam-06': ['#222222', '#1a1a1a', '#111111'],
    'cam-07': ['#1f1f2a', '#12121f', '#1a1a28'],
  };

  const colors = noiseColors[camera.id] ?? ['#111827', '#0f172a', '#0c1733'];

  const gradients = [
    `radial-gradient(ellipse at 30% 40%, ${colors[0]} 0%, transparent 60%)`,
    `radial-gradient(ellipse at 70% 60%, ${colors[1]} 0%, transparent 55%)`,
    `radial-gradient(ellipse at 50% 20%, ${colors[2]} 0%, transparent 50%)`,
    'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, rgba(0,0,0,0.4) 100%)',
  ].join(', ');

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: `${gradients}, #0a0f1e`,
    }}>
      {/* 스캔라인 효과 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }} />

      {/* 상단 카메라 정보 오버레이 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
        padding: '7px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: 'var(--guard-color-text-strong)', fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          {camera.channelId}
        </span>
        {camera.hasAlarm && (
          <span style={{
            background: 'var(--guard-color-danger)', color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '2px 6px', borderRadius: 3, letterSpacing: 1,
            animation: 'cctv-blink 1s step-end infinite',
          }}>
            ALARM
          </span>
        )}
      </div>

      {/* 하단 정보 오버레이 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
        padding: '7px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: 'var(--guard-color-text)', fontSize: 12, fontWeight: 500,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{camera.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: camera.status === 'online' ? 'var(--guard-color-success)' : 'var(--guard-color-danger)',
            display: 'inline-block',
            boxShadow: camera.status === 'online' ? '0 0 5px var(--guard-color-success)' : '0 0 5px var(--guard-color-danger)',
          }} />
          <span style={{ color: camera.status === 'online' ? 'var(--guard-color-success)' : 'var(--guard-color-danger)', fontSize: 11,
            fontWeight: 600, letterSpacing: 0.5, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {camera.status === 'online' ? 'LIVE' : 'OFFLINE'}
          </span>
        </span>
      </div>

      {/* 알람 상태면 붉은 테두리 */}
      {camera.hasAlarm && (
        <div style={{
          position: 'absolute', inset: 0, border: '2px solid var(--guard-color-danger)',
          pointerEvents: 'none', borderRadius: 1,
          boxShadow: 'inset 0 0 12px rgba(220,38,38,0.4)',
          animation: 'cctv-border-blink 1s step-end infinite',
        }} />
      )}
    </div>
  );
};

/* ─── 빈 셀 (드롭 가능) ────────────────────────────── */
const EmptyCell: React.FC<{
  cellIdx: number;
  compact?: boolean;
  onDrop: (cellIdx: number, cameraId: string) => void;
}> = ({ cellIdx, compact = false, onDrop }) => {
  const [over, setOver] = useState(false);

  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: compact ? 3 : 8,
        background: over ? 'color-mix(in srgb, var(--guard-color-primary) 12%, transparent)' : 'color-mix(in srgb, var(--guard-color-bg) 88%, #000)',
        border: `1.5px dashed ${over ? 'var(--guard-color-primary)' : 'var(--guard-color-border)'}`,
        borderRadius: 4, cursor: 'default', transition: 'all 0.15s',
        color: over ? 'var(--guard-color-accent)' : 'var(--guard-color-text-faint)',
      }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const cameraId = e.dataTransfer.getData('cameraId');
        if (cameraId) onDrop(cellIdx, cameraId);
      }}
    >
      <PlusOutlined style={{ fontSize: compact ? 10 : 20 }} />
      {!compact && <span style={{ fontSize: 13 }}>여기로 드래그 앤 드롭</span>}
    </div>
  );
};

/* ─── 카메라가 할당된 셀 ────────────────────────────── */
const CameraCell: React.FC<{
  camera: Camera;
  cellIdx: number;
  zoomed?: boolean;
  onRemove: (cellIdx: number) => void;
  onFullscreen: (camera: Camera) => void;
  onDoubleClick: (cellIdx: number) => void;
  onDrop: (cellIdx: number, cameraId: string) => void;
}> = ({ camera, cellIdx, zoomed = false, onRemove, onFullscreen, onDoubleClick, onDrop }) => {
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [over, setOver] = useState(false);

  return (
    <div
      style={{
        width: '100%', height: '100%', position: 'relative',
        background: 'var(--guard-map-bg)', borderRadius: 4, overflow: 'hidden',
        border: `1.5px solid ${over ? 'var(--guard-color-primary)' : zoomed ? 'var(--guard-color-primary)' : camera.hasAlarm ? 'var(--guard-color-danger)' : 'var(--guard-color-border)'}`,
        transition: 'border-color 0.15s',
        cursor: 'pointer',
        boxShadow: zoomed ? '0 0 0 2px color-mix(in srgb, var(--guard-color-primary) 50%, transparent)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => onDoubleClick(cellIdx)}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const cameraId = e.dataTransfer.getData('cameraId');
        if (cameraId && cameraId !== camera.id) onDrop(cellIdx, cameraId);
      }}
    >
      <MockVideoFeed camera={camera} muted={muted} />

      {/* 더블클릭 힌트 */}
      {hovered && !zoomed && (
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: 'var(--guard-color-text)', fontSize: 11,
          padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', pointerEvents: 'none',
          fontWeight: 500, letterSpacing: 0.3,
        }}>
          더블클릭: 1분할 전환
        </div>
      )}
      {zoomed && hovered && (
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: 'color-mix(in srgb, var(--guard-color-primary) 85%, transparent)', color: '#fff', fontSize: 11,
          padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', pointerEvents: 'none',
          fontWeight: 500, letterSpacing: 0.3,
        }}>
          더블클릭: 이전 분할로 복귀
        </div>
      )}

      {/* 호버 시 컨트롤 */}
      {hovered && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          display: 'flex', gap: 4,
        }}>
          <Tooltip title={muted ? '음소거 해제' : '음소거'}>
            <button
              style={cellBtnStyle}
              onClick={(e) => { e.stopPropagation(); setMuted((v) => !v); }}
            >
              {muted ? <SoundOutlined style={{ fontSize: 11 }} /> : <SoundFilled style={{ fontSize: 11 }} />}
            </button>
          </Tooltip>
          <Tooltip title="전체화면">
            <button style={cellBtnStyle} onClick={(e) => { e.stopPropagation(); onFullscreen(camera); }}>
              <FullscreenOutlined style={{ fontSize: 11 }} />
            </button>
          </Tooltip>
          <Tooltip title="제거">
            <button style={{ ...cellBtnStyle, background: 'color-mix(in srgb, var(--guard-color-danger) 80%, transparent)' }}
              onClick={(e) => { e.stopPropagation(); onRemove(cellIdx); }}>
              <CloseOutlined style={{ fontSize: 11 }} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

const cellBtnStyle: React.CSSProperties = {
  width: 22, height: 22, borderRadius: 3, border: 'none', cursor: 'pointer',
  background: 'rgba(0,0,0,0.65)', color: 'var(--guard-color-text-strong)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};

/* ─── 전체화면 모달 ─────────────────────────────────── */
const FullscreenModal: React.FC<{
  camera: Camera;
  onClose: () => void;
}> = ({ camera, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.95)',
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', background: 'var(--guard-color-surface)', borderBottom: '1px solid var(--guard-color-border)',
    }}>
      <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 600 }}>
        {camera.channelId} — {camera.name}
      </span>
      <Button
        type="text" icon={<CloseOutlined />} style={{ color: 'var(--guard-color-text-soft)' }}
        onClick={onClose}
      />
    </div>
    <div style={{ flex: 1, padding: 16 }}>
      <MockVideoFeed camera={camera} muted={false} />
    </div>
  </div>
);

/* ─── 메인 컴포넌트 ─────────────────────────────────── */
const CctvDashboard: React.FC = () => {
  const [layout, setLayout] = useState<Layout>(4);
  const [prevLayout, setPrevLayout] = useState<Layout | null>(null);
  const [zoomedCell, setZoomedCell] = useState<number | null>(null);
  const [cells, setCells] = useState<(Camera | null)[]>(Array(32).fill(null));
  const [fullscreenCam, setFullscreenCam] = useState<Camera | null>(null);

  const { cols, cells: totalCells } = LAYOUTS[layout];

  const assignedIds = new Set(cells.filter(Boolean).map((c) => c!.id));

  const handleDoubleClick = (cellIdx: number) => {
    if (zoomedCell === cellIdx) {
      // 이전 분할로 복귀
      if (prevLayout !== null) setLayout(prevLayout);
      setPrevLayout(null);
      setZoomedCell(null);
    } else {
      // 해당 셀을 1분할로 전환
      setPrevLayout(layout);
      setZoomedCell(cellIdx);
      setLayout(1);
      // 1분할 셀[0]에 해당 카메라 배치
      setCells((prev) => {
        const next = [...prev];
        const cam = next[cellIdx];
        if (cam) next[0] = cam;
        return next;
      });
    }
  };

  const handleLayoutChange = (l: Layout) => {
    setLayout(l);
    setPrevLayout(null);
    setZoomedCell(null);
  };

  const handleDrop = (cellIdx: number, cameraId: string) => {
    const camera = CAMERAS.find((c) => c.id === cameraId);
    if (!camera) return;
    setCells((prev) => {
      const next = [...prev];
      const existingIdx = next.findIndex((c) => c?.id === cameraId);
      if (existingIdx !== -1) {
        next[existingIdx] = next[cellIdx];
      }
      next[cellIdx] = camera;
      return next;
    });
  };

  const handleRemove = (cellIdx: number) => {
    setCells((prev) => {
      const next = [...prev];
      next[cellIdx] = null;
      return next;
    });
  };

  const handleAutoFill = () => {
    setCells((prev) => {
      const next = [...prev];
      let camIdx = 0;
      for (let i = 0; i < totalCells; i++) {
        while (camIdx < CAMERAS.length && next.some((c) => c?.id === CAMERAS[camIdx].id)) {
          camIdx++;
        }
        if (!next[i] && camIdx < CAMERAS.length) {
          next[i] = CAMERAS[camIdx++];
        }
      }
      return next;
    });
  };

  const handleClearAll = () => setCells(Array(32).fill(null));

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--guard-color-bg)', overflow: 'hidden' }}>
      <style>{`
        @keyframes cctv-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes cctv-border-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* ── 좌측 장치 목록 패널 ── */}
      <aside style={{
        width: 180, flexShrink: 0, background: 'var(--guard-color-surface)',
        borderRight: '1px solid var(--guard-color-border)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          height: 38, flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 12px', borderBottom: '1px solid var(--guard-color-border)',
          fontSize: 12, fontWeight: 700, color: 'var(--guard-color-text-soft)', letterSpacing: 1, textTransform: 'uppercase',
        }}>
          장치 목록
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {CAMERA_GROUPS.map((group) => {
            const groupCams = CAMERAS.filter((c) => c.group === group.key);
            return (
              <div key={group.key}>
                <div style={{
                  padding: '8px 12px 4px', fontSize: 11, fontWeight: 700,
                  color: 'var(--guard-color-text-faint)', letterSpacing: 0.5,
                }}>
                  {group.label}
                </div>
                {groupCams.map((cam) => {
                  const isAssigned = assignedIds.has(cam.id);
                  return (
                    <div
                      key={cam.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('cameraId', cam.id)}
                      style={{
                        padding: '6px 10px 6px 16px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'grab', userSelect: 'none',
                        background: isAssigned ? 'color-mix(in srgb, var(--guard-color-primary) 10%, transparent)' : 'transparent',
                        borderLeft: isAssigned ? '2px solid var(--guard-color-primary)' : '2px solid transparent',
                        transition: 'background 0.1s',
                        opacity: cam.status === 'offline' ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isAssigned) (e.currentTarget as HTMLDivElement).style.background = 'color-mix(in srgb, var(--guard-color-primary) 7%, transparent)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isAssigned) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      <VideoCameraOutlined style={{
                        fontSize: 13,
                        color: cam.status === 'offline' ? 'var(--guard-color-text-faint)'
                          : cam.hasAlarm ? 'var(--guard-color-danger)'
                          : isAssigned ? 'var(--guard-color-accent)' : 'var(--guard-color-text-soft)',
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, color: isAssigned ? 'var(--guard-color-text-strong)' : 'var(--guard-color-text)',
                          fontWeight: isAssigned ? 600 : 400,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {cam.name} {cam.channelId}
                        </div>
                        {cam.status === 'offline' && (
                          <div style={{ fontSize: 10, color: 'var(--guard-color-danger)' }}>오프라인</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 빠른 작업 버튼 */}
        <div style={{
          padding: '8px 10px', borderTop: '1px solid var(--guard-color-border)',
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          <Button size="small" block onClick={handleAutoFill}
            style={{ fontSize: 12, height: 30, fontWeight: 600, background: 'var(--guard-color-primary)', borderColor: 'var(--guard-color-primary)', color: '#fff' }}>
            자동 배치
          </Button>
          <Button size="small" block onClick={handleClearAll} danger
            style={{ fontSize: 12, height: 30, fontWeight: 600 }}>
            전체 제거
          </Button>
        </div>
      </aside>

      {/* ── 오른쪽 영역 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 상단 툴바 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', background: 'var(--guard-color-surface)', borderBottom: '1px solid var(--guard-color-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <VideoCameraOutlined style={{ color: 'var(--guard-color-primary)', fontSize: 16 }} />
            <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>
              CCTV 통합 관제센터
            </span>
            <span style={{
              fontSize: 10, color: 'var(--guard-color-success)', background: 'color-mix(in srgb, var(--guard-color-success) 15%, transparent)',
              padding: '1px 6px', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--guard-color-success) 30%, transparent)',
            }}>
              ● LIVE
            </span>
            {zoomedCell !== null && (
              <button
                onClick={() => handleDoubleClick(0)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'color-mix(in srgb, var(--guard-color-primary) 20%, transparent)', border: '1px solid var(--guard-color-primary)',
                  borderRadius: 4, padding: '2px 10px', cursor: 'pointer',
                  color: 'var(--guard-color-accent)', fontSize: 11, fontWeight: 600,
                }}
              >
                ↩ {prevLayout}분할 복귀
              </button>
            )}
          </div>

          {/* 레이아웃 선택 */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--guard-color-text-faint)', marginRight: 4, fontWeight: 600 }}>분할</span>
            {([1, 4, 9, 16, 32] as Layout[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLayoutChange(l)}
                style={{
                  minWidth: 36, padding: '3px 8px', fontSize: 12, fontWeight: 700,
                  border: `1px solid ${layout === l ? 'var(--guard-color-primary)' : 'var(--guard-color-border)'}`,
                  borderRadius: 4, cursor: 'pointer',
                  background: layout === l ? 'var(--guard-color-primary)' : 'var(--guard-color-surface-strong)',
                  color: layout === l ? '#fff' : 'var(--guard-color-text-soft)',
                  transition: 'all 0.15s',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* 그리드 영역 */}
        <div style={{ flex: 1, padding: layout >= 16 ? 4 : 8, overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${LAYOUTS[layout].rows}, 1fr)`,
            gap: layout >= 16 ? 3 : 6,
            height: '100%',
          }}>
            {Array.from({ length: totalCells }).map((_, idx) => {
              const cam = cells[idx];
              return (
                <div key={idx} style={{ minHeight: 0, minWidth: 0 }}>
                  {cam ? (
                    <CameraCell
                      camera={cam}
                      cellIdx={idx}
                      zoomed={zoomedCell === idx && layout === 1}
                      onRemove={handleRemove}
                      onFullscreen={setFullscreenCam}
                      onDoubleClick={handleDoubleClick}
                      onDrop={handleDrop}
                    />
                  ) : (
                    <EmptyCell cellIdx={idx} onDrop={handleDrop} compact={layout >= 9} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 전체화면 모달 */}
      {fullscreenCam && (
        <FullscreenModal camera={fullscreenCam} onClose={() => setFullscreenCam(null)} />
      )}
    </div>
  );
};

export default CctvDashboard;
