import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Badge, Button, Input, Modal, Space, Switch, Tabs, Tag, Tooltip } from 'antd';
import {
  AimOutlined, AlertOutlined, VideoCameraOutlined,
  ReloadOutlined, ZoomInOutlined, ZoomOutOutlined,
  LeftOutlined, RightOutlined, DownOutlined, CaretRightOutlined,
  CloseOutlined, FullscreenOutlined, SoundOutlined,
  WifiOutlined, ThunderboltOutlined, ApiOutlined, NodeIndexOutlined,
  SearchOutlined, BellOutlined, LockOutlined, DesktopOutlined,
} from '@ant-design/icons';
import SeverityBadge from '../components/SeverityBadge';
import { useAlarmStore, useDeviceStore, useVmsStore, useMapPlacementStore, type ZonePlacedItem, type CctvPopup } from '../stores';
import { MOCK_MAPS } from '../mock/data';
import {
  FLOOR_DATA,
  type FloorData,
  type CctvMarker,
  type SensorLine,
  type DeviceMarker,
} from '../mock/floorData';
import { MOCK_EVENTS, MOCK_PRESETS, MOCK_CAMERAS } from '../mock/data';
import { useEditorStore } from '@/store/editorStore';
import { brandToCssVars } from '@/lib/brandPresets';
const SEV_COLOR: Record<string, string> = {
  CRITICAL: 'var(--guard-color-danger)', HIGH: 'var(--guard-color-warning)', MEDIUM: 'var(--guard-color-accent)', LOW: 'var(--guard-color-primary)',
};
const SEV_GLOW: Record<string, string> = {
  CRITICAL: 'color-mix(in srgb, var(--guard-color-danger) 70%, transparent)',
  HIGH: 'color-mix(in srgb, var(--guard-color-warning) 60%, transparent)',
  MEDIUM: 'color-mix(in srgb, var(--guard-color-accent) 50%, transparent)',
  LOW: 'color-mix(in srgb, var(--guard-color-primary) 40%, transparent)',
};

/** 모니터 우측 「장비 상태」: 등록 장비 + 등록 CCTV 한 목록 */
interface MonitorAssetRow {
  key: string;
  kind: 'device' | 'camera';
  name: string;
  sub: string;
  status: 'CONNECTED' | 'DISCONNECTED';
}

/* ══════════════════════════════════════
   CCTV 오버레이 팝업 (Map 위에 floating)
══════════════════════════════════════ */
const SEV_BORDER: Record<string, string> = {
  CRITICAL: 'var(--guard-color-danger)', HIGH: 'var(--guard-color-warning)', MEDIUM: 'var(--guard-color-accent)', LOW: 'var(--guard-color-primary)',
};

const CctvOverlayCard: React.FC<{
  popup: CctvPopup;
  index: number;
  onClose: (id: string) => void;
  onPreset: (id: string, token: string) => void;
}> = ({ popup, index, onClose, onPreset }) => {
  const [pos, setPos]       = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    setPos({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx),
      y: dragStart.current.py + (e.clientY - dragStart.current.my),
    });
  };
  const onMouseUp = () => { dragStart.current = null; setDragging(false); };

  const camera = MOCK_CAMERAS.find((c) => c.id === popup.cameraId);
  const borderColor = SEV_BORDER[popup.severity] ?? 'var(--guard-color-border)';
  const CARD_W = 210;
  const right   = 12 + index * (CARD_W + 8);

  return (
    <div
      style={{
        position: 'absolute', bottom: 44, right,
        width: CARD_W, zIndex: 200,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{
        background: 'var(--guard-color-surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 6,
        boxShadow: `0 0 12px ${borderColor}55`,
        overflow: 'hidden',
      }}>
        {/* 헤더 (드래그 핸들) */}
        <div
          style={{
            background: 'var(--guard-color-surface-strong)', padding: '5px 8px',
            display: 'flex', alignItems: 'center', gap: 6,
            borderBottom: `1px solid ${borderColor}33`,
            cursor: 'grab',
          }}
          onMouseDown={onMouseDown}
        >
          <VideoCameraOutlined style={{ color: borderColor, fontSize: 11 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--guard-color-text-strong)', flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {popup.cameraName}
          </span>
          <span style={{
            fontSize: 9, color: 'var(--guard-color-success)',
            background: 'color-mix(in srgb, var(--guard-color-success) 15%, transparent)', padding: '1px 4px',
            borderRadius: 3, flexShrink: 0,
          }}>● LIVE</span>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--guard-color-text-faint)',
              cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}
            onClick={() => onClose(popup.id)}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* 모의 영상 영역 */}
        <div style={{
          height: 118, position: 'relative',
          background: `radial-gradient(ellipse at 30% 40%, #1a1f2e 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 60%, #0d1525 0%, transparent 55%),
                       var(--guard-map-bg)`,
          overflow: 'hidden',
        }}>
          {/* 스캔라인 */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
          }} />
          {/* 채널 ID */}
          <div style={{
            position: 'absolute', top: 5, left: 7, fontSize: 9,
            color: 'var(--guard-color-text-soft)', fontWeight: 600, letterSpacing: 0.5,
          }}>
            {popup.channelId}
          </div>
          {/* 알람 배지 */}
          <div style={{
            position: 'absolute', top: 5, right: 7,
            background: borderColor, color: '#fff', fontSize: 8,
            fontWeight: 700, padding: '1px 4px', borderRadius: 2,
            letterSpacing: 1, animation: 'cctv-blink 1s step-end infinite',
          }}>
            {popup.severity}
          </div>
          {/* 알람 테두리 글로우 */}
          <div style={{
            position: 'absolute', inset: 0,
            border: `1.5px solid ${borderColor}`,
            boxShadow: `inset 0 0 8px ${borderColor}44`,
            animation: 'cctv-border-blink 1s step-end infinite',
            pointerEvents: 'none',
          }} />
        </div>

        {/* 프리셋 버튼 (PTZ만) */}
        {popup.supportsPtz && (
          <div style={{
            padding: '6px 8px', borderTop: '1px solid var(--guard-color-border)',
            display: 'flex', gap: 4, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 10, color: 'var(--guard-color-text-faint)', width: '100%', marginBottom: 2 }}>
              PTZ 프리셋
            </span>
            {MOCK_PRESETS.map((p) => (
              <button
                key={p.presetToken}
                onClick={() => onPreset(popup.id, p.presetToken)}
                style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 3, cursor: 'pointer',
                  border: `1px solid ${popup.activePreset === p.presetToken ? 'var(--guard-color-primary)' : 'var(--guard-color-border)'}`,
                  background: popup.activePreset === p.presetToken ? 'var(--guard-color-primary)' : 'var(--guard-color-surface-strong)',
                  color: popup.activePreset === p.presetToken ? '#fff' : 'var(--guard-color-text-soft)',
                  transition: 'all 0.15s',
                }}
              >
                {p.presetName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const SEV_LINE_COLOR: Record<string, string> = {
  CRITICAL: 'var(--guard-color-danger)', HIGH: 'var(--guard-color-warning)', MEDIUM: 'var(--guard-color-accent)', LOW: 'var(--guard-color-success)',
};

const SensorLineLayer: React.FC<{
  lines: SensorLine[];
  width: number;
  height: number;
  alarmLineIds: Set<string>;
  onLineClick: (line: SensorLine) => void;
}> = ({ lines, width, height, alarmLineIds, onLineClick }) => {
  if (width === 0 || height === 0) return null;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {lines.map((line) => {
          const isAlarm = alarmLineIds.has(line.id) || line.alarm;
          return (
            <filter key={`glow-${line.id}`} id={`glow-${line.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={isAlarm ? '5' : '1.5'} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          );
        })}
      </defs>

      {lines.map((line) => {
        const isAlarm = alarmLineIds.has(line.id) || line.alarm;
        const color = SEV_LINE_COLOR[line.severity];
        const pts = line.points
          .map((p) => `${(p.x / 100) * width},${(p.y / 100) * height}`)
          .join(' ');

        return (
          <g key={line.id}>
            {/* 클릭 히트 영역 (두꺼운 투명 라인) */}
            <polyline
              points={pts}
              fill="none"
              stroke="transparent"
              strokeWidth="20"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={() => onLineClick(line)}
            />

            {/* 배경 글로우 라인 */}
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth={isAlarm ? 10 : 4}
              strokeOpacity={isAlarm ? 0.25 : 0.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#glow-${line.id})`}
            />

            {/* 메인 라인 */}
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth={isAlarm ? 3 : 1.5}
              strokeOpacity={isAlarm ? 1 : 0.55}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isAlarm ? 'none' : '8 5'}
              filter={`url(#glow-${line.id})`}
            />

            {/* 알람 시: 라인 전체가 깜빡임 */}
            {isAlarm && (
              <polyline
                points={pts}
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.9;0;0.9"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </polyline>
            )}

            {/* 꼭짓점 마커 */}
            {line.points.map((p, i) => (
              <circle
                key={i}
                cx={(p.x / 100) * width}
                cy={(p.y / 100) * height}
                r={isAlarm ? 4 : 2.5}
                fill={color}
                opacity={isAlarm ? 1 : 0.45}
              >
                {isAlarm && (
                  <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" />
                )}
              </circle>
            ))}

            {/* 라벨 */}
            <text
              x={(line.points[0].x / 100) * width + 7}
              y={(line.points[0].y / 100) * height - 6}
              fontSize="10"
              fill={color}
              opacity={isAlarm ? 1 : 0.65}
              fontWeight={isAlarm ? 'bold' : 'normal'}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {isAlarm ? `⚠ ${line.label}` : line.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ══════════════════════════════════════
   FOV 콘 SVG 레이어
══════════════════════════════════════ */
const FovLayer: React.FC<{ cameras: CctvMarker[]; width: number; height: number }> = ({
  cameras, width, height,
}) => {
  const coneLen = Math.min(width, height) * 0.18; // 콘 길이 (이미지 비율)
  return (
    <svg
      className="fov-layer"
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        {cameras.map((cam) => (
          <radialGradient key={`rg-${cam.id}`} id={`rg-${cam.id}`} cx="0%" cy="50%" r="100%">
            <stop offset="0%"   stopColor={cam.supportsPtz ? 'var(--guard-color-success)' : 'var(--guard-color-primary)'} stopOpacity="0.45" />
            <stop offset="70%"  stopColor={cam.supportsPtz ? 'var(--guard-color-success)' : 'var(--guard-color-primary)'} stopOpacity="0.12" />
            <stop offset="100%" stopColor={cam.supportsPtz ? 'var(--guard-color-success)' : 'var(--guard-color-primary)'} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {cameras.map((cam) => {
        const cx = (parseFloat(cam.left) / 100) * width;
        const cy = (parseFloat(cam.top)  / 100) * height;
        const halfFov  = (cam.fov / 2) * (Math.PI / 180);
        const angleDeg = cam.angle - 90; // SVG 기준 조정
        const centerR  = angleDeg * (Math.PI / 180);
        const r1 = (angleDeg - cam.fov / 2) * (Math.PI / 180);
        const r2 = (angleDeg + cam.fov / 2) * (Math.PI / 180);

        const px1 = cx + coneLen * Math.cos(r1);
        const py1 = cy + coneLen * Math.sin(r1);
        const px2 = cx + coneLen * Math.cos(r2);
        const py2 = cy + coneLen * Math.sin(r2);

        // 중심선 끝점
        const pCenter = {
          x: cx + coneLen * Math.cos(centerR),
          y: cy + coneLen * Math.sin(centerR),
        };

        return (
          <g key={cam.id}>
            {/* 콘 면 */}
            <path
              d={`M ${cx} ${cy} L ${px1} ${py1} A ${coneLen} ${coneLen} 0 0 1 ${px2} ${py2} Z`}
              fill={`url(#rg-${cam.id})`}
              stroke={cam.supportsPtz ? 'var(--guard-color-success)' : 'var(--guard-color-primary)'}
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            {/* 중심 방향선 */}
            <line
              x1={cx} y1={cy} x2={pCenter.x} y2={pCenter.y}
              stroke={cam.supportsPtz ? 'var(--guard-color-success)' : 'var(--guard-color-accent)'}
              strokeWidth="1"
              strokeDasharray="4 3"
              strokeOpacity="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
};


/* ══════════════════════════════════════
   카메라 마커 (호버 프리뷰 + 레이더 스윕)
══════════════════════════════════════ */
const CctvMarkerNode: React.FC<{
  cam: CctvMarker;
  hasAlarm: boolean;
  onClick: (c: CctvMarker) => void;
}> = ({ cam, hasAlarm, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const cls = hasAlarm ? 'cctv-marker cctv-marker--alarm'
    : cam.supportsPtz ? 'cctv-marker cctv-marker--ptz'
    : 'cctv-marker';

  return (
    <div
      style={{ position: 'absolute', top: cam.top, left: cam.left }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 호버 프리뷰 카드 */}
      {hovered && (
        <div className="cam-preview-card">
          <div className="cam-preview-title">
            <VideoCameraOutlined style={{ marginRight: 5, color: cam.supportsPtz ? 'var(--guard-color-success)' : 'var(--guard-color-accent)' }} />
            {cam.label}
          </div>
          <div className="cam-preview-meta">
            채널: <span style={{ color: 'var(--guard-color-text-soft)' }}>{cam.channelId}</span><br />
            위치: <span style={{ color: 'var(--guard-color-text-soft)' }}>{cam.location}</span><br />
            {cam.supportsPtz
              ? <span style={{ color: 'var(--guard-color-success)', fontWeight: 600 }}>✦ PTZ 지원 · 360° 제어</span>
              : <span style={{ color: 'var(--guard-color-accent)' }}>고정형 카메라 (FOV {cam.fov}°)</span>
            }
          </div>
          <div className="cam-preview-live">LIVE STREAM READY</div>
        </div>
      )}

      {/* 레이더 스윕 링 */}
      <div className="cam-radar-sweep" style={{ position: 'absolute', inset: -10 }} />

      {/* 마커 아이콘 */}
      <div className={cls} onClick={() => onClick(cam)}>
        <VideoCameraOutlined style={{ fontSize: 14, color: '#fff' }} />
      </div>

      {/* PTZ 배지 */}
      {cam.supportsPtz && !hasAlarm && (
        <div style={{
          position: 'absolute', top: -7, right: -7,
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--guard-color-success) 60%, #000), var(--guard-color-success))',
          borderRadius: '50%', width: 14, height: 14,
          fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700,
          border: '1.5px solid var(--guard-color-surface)',
          boxShadow: '0 0 5px color-mix(in srgb, var(--guard-color-success) 70%, transparent)',
          pointerEvents: 'none',
        }}>P</div>
      )}

      {/* 채널 ID 라벨 */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
          fontSize: 9, color: 'var(--guard-color-secondary)', whiteSpace: 'nowrap',
          letterSpacing: 1, fontWeight: 600, pointerEvents: 'none',
        }}>
          {cam.channelId}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   장비 아이콘 마커 (Device Icon on Map)
══════════════════════════════════════ */
const DEV_TYPE_CFG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PERIMETER:      { icon: <WifiOutlined />,       color: 'var(--guard-color-warning)', label: '침입감지' },
  IO_MODULE:      { icon: <ThunderboltOutlined />, color: 'var(--guard-color-primary)', label: 'I/O 모듈' },
  ACCESS_CONTROL: { icon: <ApiOutlined />,         color: 'var(--guard-color-accent)', label: '출입통제' },
};

const DeviceMarkerNode: React.FC<{
  device: DeviceMarker;
  hasAlarm: boolean;
  onClick: (d: DeviceMarker) => void;
}> = ({ device, hasAlarm, onClick }) => {
  const cfg   = DEV_TYPE_CFG[device.type] ?? { icon: <NodeIndexOutlined />, color: 'var(--guard-color-text-faint)', label: '장비' };
  const color = hasAlarm ? 'var(--guard-color-danger)' : device.status === 'CONNECTED' ? cfg.color : 'var(--guard-color-text-faint)';

  return (
    <div
      style={{
        position: 'absolute',
        top: device.top, left: device.left,
        transform: 'translate(-50%, -50%)',
        zIndex: 25, cursor: 'pointer',
      }}
      onClick={() => onClick(device)}
    >
      {/* 알람 펄스 링 */}
      {hasAlarm && (
        <div style={{
          position: 'absolute', inset: -8,
          borderRadius: 10,
          border: `2px solid var(--guard-color-danger)`,
          animation: 'ping 1.2s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* 아이콘 칩 */}
      <Tooltip
        title={
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{device.label}</div>
            <div style={{ color: 'var(--guard-color-text-soft)' }}>{cfg.label}</div>
            <div style={{ color: device.status === 'CONNECTED' ? 'var(--guard-color-success)' : 'var(--guard-color-danger)', marginTop: 2 }}>
              {device.status === 'CONNECTED' ? '● 연결됨' : '● 연결 끊김'}
            </div>
            {hasAlarm && (
              <div style={{ color: 'var(--guard-color-danger)', fontWeight: 700, marginTop: 4 }}>⚠ 알람 발생!</div>
            )}
          </div>
        }
        placement="top"
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: hasAlarm ? 'color-mix(in srgb, var(--guard-color-danger) 40%, transparent)' : `color-mix(in srgb, ${color} 40%, transparent)`,
          border: `2px solid ${hasAlarm ? 'color-mix(in srgb, var(--guard-color-danger) 45%, #fff)' : color}`,
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
          boxShadow: hasAlarm
            ? `0 0 16px color-mix(in srgb, var(--guard-color-danger) 80%, transparent), 0 0 6px color-mix(in srgb, var(--guard-color-danger) 50%, transparent)`
            : `0 2px 8px rgba(0,0,0,.5), 0 0 10px color-mix(in srgb, ${color} 40%, transparent)`,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.zIndex = '50'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '1'; }}
        >
          {cfg.icon}
        </div>
      </Tooltip>

      {/* 라벨 */}
      <div style={{
        position: 'absolute', top: '100%', left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 3, whiteSpace: 'nowrap',
        fontSize: 9, fontWeight: 700,
        color: hasAlarm ? 'var(--guard-color-danger)' : 'var(--guard-color-text-soft)',
        background: 'var(--guard-color-overlay)',
        borderRadius: 3, padding: '1px 5px', letterSpacing: 0.3,
        border: hasAlarm ? '1px solid color-mix(in srgb, var(--guard-color-danger) 38%, transparent)' : '1px solid var(--guard-color-border)',
      }}>
        {device.label}
      </div>

      {/* 알람 뱃지 */}
      {hasAlarm && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          width: 15, height: 15, borderRadius: '50%',
          background: 'var(--guard-color-danger)', border: '2px solid var(--guard-color-surface-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: '#fff', fontWeight: 800,
          animation: 'blink 0.8s step-end infinite',
        }}>!</div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   전체 맵 오버레이
══════════════════════════════════════ */
const FloorOverlay: React.FC<{
  floor: FloorData;
  mapWidth: number;
  mapHeight: number;
  onCctvClick: (c: CctvMarker) => void;
  alarmLineIds: Set<string>;
  onLineClick: (line: SensorLine) => void;
  alarmDeviceNames: Set<string>;
  onDeviceClick: (d: DeviceMarker) => void;
}> = ({ floor, mapWidth, mapHeight, onCctvClick, alarmLineIds, onLineClick, alarmDeviceNames, onDeviceClick }) => (
  <>
    {/* 센서 라인 (Senstar) */}
    <SensorLineLayer
      lines={floor.lines}
      width={mapWidth}
      height={mapHeight}
      alarmLineIds={alarmLineIds}
      onLineClick={onLineClick}
    />

    {/* FOV 콘 SVG */}
    {mapWidth > 0 && (
      <FovLayer cameras={floor.cctv} width={mapWidth} height={mapHeight} />
    )}

    {/* 카메라 마커 */}
    {floor.cctv.map((c) => (
      <CctvMarkerNode key={c.id} cam={c} hasAlarm={false} onClick={onCctvClick} />
    ))}

    {/* 장비 마커 */}
    {floor.devices.map((d) => (
      <DeviceMarkerNode
        key={d.id}
        device={d}
        hasAlarm={alarmDeviceNames.has(d.label)}
        onClick={onDeviceClick}
      />
    ))}
  </>
);

/* ══════════════════════════════════════
   미니맵 네비게이터
══════════════════════════════════════ */
const MINI_W = 180;

const MinimapNav: React.FC<{
  image: string;
  mapW: number;
  mapH: number;
  containerW: number;
  containerH: number;
  scale: number;
  offset: { x: number; y: number };
  onNavigate: (offsetX: number, offsetY: number) => void;
}> = ({ image, mapW, mapH, containerW, containerH, scale, offset, onNavigate }) => {
  if (mapW === 0 || mapH === 0) return null;

  const aspect  = mapH / mapW;
  const miniW   = MINI_W;
  const miniH   = Math.round(MINI_W * aspect);
  const miniScale = miniW / mapW;

  /* 현재 뷰포트가 맵 이미지 위에서 차지하는 영역 (map px 단위) */
  const vpX = -offset.x / scale;
  const vpY = -offset.y / scale;
  const vpW =  containerW / scale;
  const vpH =  containerH / scale;

  /* 미니맵 좌표로 변환 */
  const rx = Math.max(0, vpX * miniScale);
  const ry = Math.max(0, vpY * miniScale);
  const rw = Math.min(miniW - rx, vpW * miniScale);
  const rh = Math.min(miniH - ry, vpH * miniScale);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    /* 클릭한 맵 픽셀을 화면 중앙에 오도록 offset 계산 */
    const mapPxX = mx / miniScale;
    const mapPxY = my / miniScale;
    onNavigate(
      containerW / 2 - mapPxX * scale,
      containerH / 2 - mapPxY * scale,
    );
  };

  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      ox: offset.x, oy: offset.y,
    };
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = (mv.clientX - dragRef.current.startX) / miniScale * scale;
      const dy = (mv.clientY - dragRef.current.startY) / miniScale * scale;
      onNavigate(dragRef.current.ox - dx, dragRef.current.oy - dy);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      style={{
        position: 'absolute', bottom: 14, right: 14,
        width: miniW, height: miniH,
        border: '1px solid var(--guard-color-border)',
        borderRadius: 4, overflow: 'hidden',
        background: 'var(--guard-map-bg)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.7)',
        cursor: 'crosshair',
        zIndex: 50,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* 맵 이미지 썸네일 */}
      <img
        src={image}
        alt="minimap"
        style={{
          width: miniW, height: miniH,
          objectFit: 'fill',
          display: 'block', pointerEvents: 'none',
          filter: 'brightness(0.6) contrast(1.1)',
          userSelect: 'none',
        }}
        draggable={false}
      />

      {/* 뷰포트 표시 사각형 */}
      <div style={{
        position: 'absolute',
        left: rx, top: ry,
        width: Math.max(4, rw), height: Math.max(4, rh),
        border: '1.5px solid var(--guard-color-accent)',
        borderRadius: 2,
        background: 'color-mix(in srgb, var(--guard-color-primary) 15%, transparent)',
        boxShadow: '0 0 0 1px color-mix(in srgb, var(--guard-color-primary) 30%, transparent)',
        pointerEvents: 'none',
      }} />

      {/* 미니맵 라벨 */}
      <div style={{
        position: 'absolute', bottom: 3, left: 5,
        fontSize: 8, color: 'var(--guard-color-text-faint)', letterSpacing: 0.5,
        pointerEvents: 'none', fontWeight: 700,
      }}>
        NAV
      </div>

      {/* 스케일 표시 */}
      <div style={{
        position: 'absolute', bottom: 3, right: 5,
        fontSize: 8, color: 'var(--guard-color-primary)', letterSpacing: 0.5,
        pointerEvents: 'none',
      }}>
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};


const PtzPanel: React.FC = () => {
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(30);
  const move = (dp: number, dt: number) => {
    setPan((v) => Math.max(-100, Math.min(100, v + dp)));
    setTilt((v) => Math.max(-100, Math.min(100, v + dt)));
  };
  const BTNS: [string, number, number, number, number][] = [
    ['↖',-7,7,0,0],['↑',0,7,0,37],['↗',7,7,0,74],
    ['←',-10,0,37,0],['■',0,0,37,37],['→',10,0,37,74],
    ['↙',-7,-7,74,0],['↓',0,-7,74,37],['↘',7,-7,74,74],
  ];
  return (
    <div style={{ marginTop: 12, background: 'var(--guard-color-bg)', borderRadius: 8, padding: 12, border: '1px solid var(--guard-color-border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--guard-color-secondary)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>
        PTZ Control
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div className="ptz-dpad">
          {BTNS.map(([lbl, dp, dt, top, left]) => (
            <button key={lbl} className="ptz-dpad-btn"
              style={{ top, left, ...(lbl==='■' ? { background:'var(--guard-color-border)', color:'var(--guard-color-text-faint)', cursor:'default' } : {}) }}
              onClick={() => lbl !== '■' && move(dp, dt)}>
              {lbl}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <Space wrap style={{ marginBottom: 8 }}>
            <Button size="small" onClick={() => setZoom((v) => Math.min(100, v + 10))}><ZoomInOutlined /> +</Button>
            <Button size="small" onClick={() => setZoom((v) => Math.max(0, v - 10))}><ZoomOutOutlined /> −</Button>
            <Button size="small" icon={<ReloadOutlined />}>홈</Button>
          </Space>
          <div style={{ fontSize: 11, color: 'var(--guard-color-text-faint)', lineHeight: 2, fontFamily: 'monospace' }}>
            <div>Pan : {(pan / 100).toFixed(2)}</div>
            <div>Tilt: {(tilt / 100).toFixed(2)}</div>
            <div>Zoom: {zoom}%</div>
            <div style={{ color: 'var(--guard-color-secondary)' }}>● IDLE</div>
          </div>
        </div>
        <div style={{ fontSize: 12 }}>
          <div style={{ fontWeight: 600, color: 'var(--guard-color-text-soft)', marginBottom: 6, fontSize: 11 }}>프리셋</div>
          {['출입구 전면', '복도 전체', '비상구'].map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
              <span style={{ flex: 1, fontSize: 11, color: 'var(--guard-color-text-soft)' }}>{i + 1}. {name}</span>
              <Button size="small">이동</Button>
            </div>
          ))}
          <Button size="small" type="dashed" block style={{ marginTop: 4 }}>+ 저장</Button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   맵 마커 SVG 라인 아이콘
══════════════════════════════════════ */
const MapMarkerIcon: React.FC<{
  kind: string; iconType?: string; devicePluginType?: string; r: number;
}> = ({ kind, iconType, devicePluginType, r }) => {
  const s = r / 15;
  const p = { fill: 'none', stroke: 'rgba(255,255,255,0.93)', strokeWidth: 1.5 / s,
              strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (kind === 'CAMERA') {
    if (iconType === 'ptz') return (
      <g {...p} transform={`scale(${s})`}>
        <rect x="-8" y="-5.5" width="12" height="9" rx="1.5" />
        <circle cx="-2" cy="-1" r="2.5" />
        <polygon points="4,-4.5 9,-7 9,5 4,2.5" />
        <path d="M -7,5.5 a 7,3 0 0 0 10,0" />
        <polyline points="-8,4.5 -7,5.5 -6,4.5" />
      </g>
    );
    if (iconType === 'dome') return (
      <g {...p} transform={`scale(${s})`}>
        <path d="M -8,2 a 8,7 0 0 1 16,0" />
        <line x1="-8" y1="2" x2="8" y2="2" />
        <circle cx="0" cy="-1.5" r="2.5" />
        <line x1="-3" y1="-9" x2="3" y2="-9" />
        <line x1="0" y1="-9" x2="0" y2="-6.5" />
      </g>
    );
    return (
      <g {...p} transform={`scale(${s})`}>
        <rect x="-8" y="-4.5" width="12" height="9" rx="1.5" />
        <circle cx="-2" cy="0" r="2.5" />
        <polygon points="4,-3.5 9,-6 9,6 4,3.5" />
      </g>
    );
  }

  if (kind === 'DOOR') {
    if (iconType === 'pin') return (
      <g {...p} transform={`scale(${s})`}>
        <path d="M -4,-2.5 C -4,-9.5 4,-9.5 4,-2.5" />
        <rect x="-6.5" y="-2.5" width="13" height="9.5" rx="1.5" />
        <circle cx="0" cy="2.5" r="1.5" />
        <line x1="0" y1="4" x2="0" y2="6.5" />
      </g>
    );
    return (
      <g {...p} transform={`scale(${s})`}>
        <path d="M -7,-9 h 14 v 18 h -14" />
        <line x1="-7" y1="-9" x2="-7" y2="9" />
        <circle cx="3.5" cy="0.5" r="1.5" />
      </g>
    );
  }

  if (kind === 'DEVICE') {
    if (devicePluginType === 'SenstarFlexZone') return (
      <g {...p} transform={`scale(${s})`}>
        <circle cx="0" cy="5" r="1.5" />
        <path d="M -3.5,1.5 a 3.8,3.8 0 0 1 7,0" />
        <path d="M -6.5,-2 a 7,7 0 0 1 13,0" />
        <path d="M -9,-5.5 a 9.5,9.5 0 0 1 18,0" />
      </g>
    );
    if (devicePluginType === 'AdamModbus') return (
      <g {...p} transform={`scale(${s})`}>
        <rect x="-6" y="-6" width="12" height="12" rx="1" />
        <line x1="-9" y1="-3.5" x2="-6" y2="-3.5" />
        <line x1="-9" y1="0" x2="-6" y2="0" />
        <line x1="-9" y1="3.5" x2="-6" y2="3.5" />
        <line x1="6" y1="-3.5" x2="9" y2="-3.5" />
        <line x1="6" y1="0" x2="9" y2="0" />
        <line x1="6" y1="3.5" x2="9" y2="3.5" />
        <circle cx="0" cy="0" r="2" />
      </g>
    );
    return (
      <g {...p} transform={`scale(${s})`}>
        <rect x="-8" y="-7" width="16" height="11" rx="1.5" />
        <line x1="0" y1="4" x2="0" y2="7.5" />
        <line x1="-4" y1="7.5" x2="4" y2="7.5" />
        <circle cx="0" cy="-1.5" r="2.5" />
      </g>
    );
  }

  return (
    <g {...p} transform={`scale(${s})`}>
      <path d="M 0,-9 C -5,-9 -5,-2 0,-2 C 5,-2 5,-9 0,-9 Z" />
      <line x1="0" y1="-2" x2="0" y2="7" />
    </g>
  );
};

/* ══════════════════════════════════════
   배치 아이템 오버레이 (Zone 편집 → 모니터링)
══════════════════════════════════════ */
const ptStr = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

const ZoneOverlay: React.FC<{
  items: ZonePlacedItem[];
  mapW: number; mapH: number;
  onCameraClick?: (item: ZonePlacedItem) => void;
}> = ({ items, mapW, mapH, onCameraClick }) => {
  if (!mapW || !mapH) return null;
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: mapW, height: mapH, overflow: 'visible', pointerEvents: 'none' }}>
      {/* Camera FOV */}
      {items.filter((i) => i.kind === 'CAMERA').map((item) => {
        const p = item.points[0]; if (!p) return null;
        const dir   = item.direction  ?? 270;
        const half  = (item.fovAngle  ?? 90) / 2;
        const range = item.fovRange   ?? 120;
        const lRad = dir * Math.PI / 180 - half * Math.PI / 180;
        const rRad = dir * Math.PI / 180 + half * Math.PI / 180;
        const lx = p.x + range * Math.cos(lRad), ly = p.y + range * Math.sin(lRad);
        const rx = p.x + range * Math.cos(rRad), ry = p.y + range * Math.sin(rRad);
        const la = half * 2 > 180 ? 1 : 0;
        return (
          <path key={`fov-${item.id}`}
            d={`M ${p.x} ${p.y} L ${lx} ${ly} A ${range} ${range} 0 ${la} 1 ${rx} ${ry} Z`}
            fill={item.color} fillOpacity={0.15} stroke={item.color} strokeWidth={1} strokeOpacity={0.5} />
        );
      })}

      {/* LINE sensors */}
      {items.filter((i) => i.placementType === 'LINE' && i.points.length >= 2).map((item) => {
        const sw = item.lineWidth ?? 3;
        const mid = item.points[Math.floor(item.points.length / 2)];
        return (
          <g key={item.id}>
            <polyline points={ptStr(item.points)} fill="none" stroke={item.color} strokeWidth={sw}
              strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            {item.labelVisible !== false && (
              <text x={mid.x} y={mid.y - sw - 4} textAnchor="middle" fontSize={10} fill={item.color} fontWeight={700}
                style={{ textShadow: '0 1px 4px rgba(0,0,0,.9)' }}>{item.label}</text>
            )}
          </g>
        );
      })}

      {/* Icon markers (Camera / Device / Door / Point sensor) */}
      {items.filter((i) => i.placementType !== 'LINE').map((item) => {
        const p = item.points[0]; if (!p) return null;
        const r = 15 * (item.size ?? 1);
        const isCamera = item.kind === 'CAMERA';
        return (
          <g key={item.id} transform={`translate(${p.x},${p.y})`}
            style={{ cursor: isCamera ? 'pointer' : 'default', pointerEvents: isCamera ? 'auto' : 'none' }}
            onClick={() => isCamera && onCameraClick?.(item)}>
            <circle r={r} fill={item.color} opacity={0.9} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <g style={{ pointerEvents: 'none' }}>
              <MapMarkerIcon kind={item.kind} iconType={item.iconType} devicePluginType={item.devicePluginType} r={r} />
            </g>
            {item.labelVisible !== false && (
              <text y={r + 8} textAnchor="middle" fontSize={9} fill="var(--guard-color-text-strong)"
                style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,.9)' }}>
                {item.label.length > 10 ? item.label.slice(0, 10) + '…' : item.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ══════════════════════════════════════
   메인 모니터링 페이지
══════════════════════════════════════ */
const MonitorPage: React.FC = () => {
  const alarms                            = useAlarmStore((s) => s.alarms);
  const ackAlarm                          = useAlarmStore((s) => s.ackAlarm);
  const registeredDevices                 = useDeviceStore((s) => s.devices);
  const savedMapItems                     = useMapPlacementStore((s) => s.savedItems);
  const { popups, openPopup, closePopup, setActivePreset } = useVmsStore();
  const brand = useEditorStore((s) => s.brand);
  const sectionStyles = useEditorStore((s) => s.sectionStyles);
  const mapVars = brandToCssVars({ ...brand, ...(sectionStyles.map ?? {}) }) as CSSProperties;
  const alarmVars = brandToCssVars({ ...brand, ...(sectionStyles["alarm-panel"] ?? {}) }) as CSSProperties;
  const floorVars = brandToCssVars({ ...brand, ...(sectionStyles["floor-status"] ?? {}) }) as CSSProperties;

  const [selectedFloor, setSelectedFloor] = useState('floor1');
  const [autoFocus, setAutoFocus]         = useState(true);
  const [activeCam, setActiveCam]         = useState<CctvMarker | null>(null);
  const [ptzOpen, setPtzOpen]             = useState(false);
  const [scale, setScale]                 = useState(1);
  const [offset, setOffset]               = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging]       = useState(false);
  const [mapDims, setMapDims]             = useState({ w: 0, h: 0 });
  const [containerDims, setContainerDims] = useState({ w: 0, h: 0 });
  const [alarmLineIds, setAlarmLineIds]   = useState<Set<string>>(new Set());
  const mapRef                            = useRef<HTMLImageElement>(null);
  const containerRef                      = useRef<HTMLDivElement>(null);
  const dragStart                         = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  /* 맵 컨테이너 크기 (우측 패널 접기/펼치기 등으로 변할 때 미니맵·줌 기준 갱신) */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      setContainerDims({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── 최소 스케일: 맵이 컨테이너를 벗어나지 않는 fit-to-screen 값 ── */
  const getMinScale = () => {
    const container = containerRef.current;
    const img = mapRef.current;
    if (!container || !img || img.naturalWidth === 0) return 0.3;
    return Math.min(
      container.clientWidth  / img.naturalWidth,
      container.clientHeight / img.naturalHeight,
    );
  };

  /* ── 오프셋 경계 클램프: 맵이 컨테이너 밖으로 사라지지 않도록 ── */
  const clampOffset = (ox: number, oy: number, s: number) => {
    const container = containerRef.current;
    if (!container || mapDims.w === 0) return { x: ox, y: oy };
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const mw = mapDims.w * s;
    const mh = mapDims.h * s;

    /* 맵이 컨테이너보다 크면 → 맵 가장자리가 컨테이너를 벗어나지 않도록
       맵이 컨테이너보다 작으면 → 중앙 고정 */
    const cx = mw >= cw
      ? Math.min(0, Math.max(cw - mw, ox))
      : (cw - mw) / 2;
    const cy = mh >= ch
      ? Math.min(0, Math.max(ch - mh, oy))
      : (ch - mh) / 2;

    return { x: cx, y: cy };
  };

  /* ── 맵 네비게이션 핸들러 ── */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor   = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const minScale = getMinScale();
    const newScale = Math.max(minScale, Math.min(6, scale * factor));
    const ratio = newScale / scale;
    const rawX = mouseX - ratio * (mouseX - offset.x);
    const rawY = mouseY - ratio * (mouseY - offset.y);
    setOffset(clampOffset(rawX, rawY, newScale));
    setScale(newScale);
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    setIsDragging(true);
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const rawX = dragStart.current.ox + (e.clientX - dragStart.current.mx);
    const rawY = dragStart.current.oy + (e.clientY - dragStart.current.my);
    setOffset(clampOffset(rawX, rawY, scale));
  };

  const handleMapMouseUp = () => {
    dragStart.current = null;
    setIsDragging(false);
  };

  const zoomIn = () => {
    const container = containerRef.current;
    if (!container) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const factor   = 1.25;
    const newScale = Math.min(6, +(scale * factor).toFixed(3));
    const ratio = newScale / scale;
    const rawX = cx - ratio * (cx - offset.x);
    const rawY = cy - ratio * (cy - offset.y);
    setOffset(clampOffset(rawX, rawY, newScale));
    setScale(newScale);
  };

  const zoomOut = () => {
    const container = containerRef.current;
    if (!container) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const factor   = 1 / 1.25;
    const minScale = getMinScale();
    const newScale = Math.max(minScale, +(scale * factor).toFixed(3));
    const ratio = newScale / scale;
    const rawX = cx - ratio * (cx - offset.x);
    const rawY = cy - ratio * (cy - offset.y);
    setOffset(clampOffset(rawX, rawY, newScale));
    setScale(newScale);
  };

  const resetView = () => {
    const container = containerRef.current;
    const img = mapRef.current;
    if (container && img && img.naturalWidth > 0) {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const fitScale = Math.min(cw / natW, ch / natH);
      setScale(fitScale);
      setOffset({ x: (cw - natW * fitScale) / 2, y: (ch - natH * fitScale) / 2 });
    } else {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  };

  // 패널 토글 상태
  const [rightPanelOpen,  setRightPanelOpen]  = useState(true);
  const [alarmSectionOpen, setAlarmSectionOpen] = useState(true);
  const [feedSectionOpen,  setFeedSectionOpen]  = useState(true);
  const [deviceSectionOpen, setDeviceSectionOpen] = useState(true);
  const [deviceStatusSearch, setDeviceStatusSearch] = useState('');
  const [expandedMonDevIds, setExpandedMonDevIds] = useState<string[]>([]);
  const toggleMonDev = (id: string) =>
    setExpandedMonDevIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const floor        = FLOOR_DATA.find((f) => f.id === selectedFloor)!;
  const currentZoneItems = savedMapItems[selectedFloor] ?? [];
  const hasZoneItems = currentZoneItems.length > 0;
  /* Zone 편집에서 저장된 아이템이 있으면 MOCK_MAPS 이미지 사용 (동일 좌표계) */
  const mapImageSrc  = (() => {
    const mockMap = MOCK_MAPS.find((m) => m.id === selectedFloor);
    return (hasZoneItems && mockMap?.imageUrl) ? mockMap.imageUrl : floor.image;
  })();
  const alarmFloors  = new Set<string>();
  const feedItems    = MOCK_EVENTS.slice(0, 7);

  /* 알람 발생 장비 이름 세트 (DeviceMarker.label 과 매칭) */
  const alarmDeviceNames = useMemo(() => {
    const s = new Set<string>();
    alarms.forEach((a) => { if (a.ackStatus === 'UNACKED') s.add(a.deviceName); });
    return s;
  }, [alarms]);

  /* ── 장비 그룹 분류 ── */
  const camAssets     = MOCK_CAMERAS;
  const doorDevices   = registeredDevices.filter((d) => d.pluginType === 'AccessControl');
  const sensorDevices = registeredDevices.filter((d) => d.pluginType !== 'AccessControl');

  const monitorAssetRows = useMemo(() => {
    const rows: MonitorAssetRow[] = [];
    registeredDevices.forEach((d) => rows.push({
      key: `dev-${d.id}`, kind: 'device', name: d.deviceName,
      sub: `${d.pluginType} · ${d.ip}:${d.port}`,
      status: d.status === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED',
    }));
    MOCK_CAMERAS.forEach((c) => rows.push({
      key: `cam-${c.id}`, kind: 'camera', name: c.cameraName,
      sub: [c.channelId, c.vmsName].filter(Boolean).join(' · '),
      status: 'CONNECTED',
    }));
    return rows;
  }, [registeredDevices]);

  const searchLc = deviceStatusSearch.trim().toLowerCase();
  const filteredMonitorAssets = useMemo(() => {
    if (!searchLc) return monitorAssetRows;
    return monitorAssetRows.filter((r) => r.name.toLowerCase().includes(searchLc) || r.sub.toLowerCase().includes(searchLc));
  }, [monitorAssetRows, searchLc]);

  const [selectedDevice, setSelectedDevice] = useState<DeviceMarker | null>(null);

  const handleDeviceClick = (d: DeviceMarker) => setSelectedDevice(d);

  const handleLineClick = (line: SensorLine) => {
    setAlarmLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(line.id)) {
        next.delete(line.id);
      } else {
        next.add(line.id);
      }
      return next;
    });
  };

  const handleImgLoad = () => {
    if (!mapRef.current) return;
    const natW = mapRef.current.naturalWidth;
    const natH = mapRef.current.naturalHeight;
    setMapDims({ w: natW, h: natH });
    const container = containerRef.current;
    if (container && natW > 0 && natH > 0) {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      setContainerDims({ w: cw, h: ch });
      const fitScale = Math.min(cw / natW, ch / natH);
      const ox = (cw - natW * fitScale) / 2;
      const oy = (ch - natH * fitScale) / 2;
      setScale(fitScale);
      setOffset({ x: ox, y: oy });
    }
  };

  const handleCctvClick = (cam: CctvMarker) => {
    setActiveCam(cam);
    setPtzOpen(false);
  };

  const handleClose = () => {
    setActiveCam(null);
    setPtzOpen(false);
    popups.forEach((p) => closePopup(p.id));
  };

  const alarmZoneCount = floor.zones.filter((z) => z.alarm).length;

  return (
    <div className="monitor-layout">
      {/* ══ 왼쪽: 맵 영역 ══ */}
      <div className="monitor-map-area" style={{ ...mapVars, background: 'var(--guard-map-bg)' }}>

        {/* 알람 배너 */}
        {alarms.length > 0 && (
          <div className="alarm-banner">
            <AlertOutlined />
            <strong>미확인 알람 {alarms.length}건</strong>
            <span style={{ color: 'color-mix(in srgb, var(--guard-color-danger) 35%, #fff)', fontSize: 12 }}>— {floor.label} 이상 감지</span>
            <Button size="small" ghost onClick={() => ackAlarm(alarms[0].eventId)}
              style={{ marginLeft: 'auto', borderColor: 'color-mix(in srgb, var(--guard-color-danger) 45%, #fff)', color: 'color-mix(in srgb, var(--guard-color-danger) 35%, #fff)' }}>
              최신 알람 확인
            </Button>
          </div>
        )}

        {/* 층 탭 */}
        <div className="map-tab-bar">
          <Tabs
            size="small"
            activeKey={selectedFloor}
            onChange={(k) => { setSelectedFloor(k); setMapDims({ w: 0, h: 0 }); resetView(); }}
            tabBarStyle={{ borderBottom: 'none', marginBottom: 0 }}
            items={FLOOR_DATA.map((f) => ({
              key: f.id,
              label: (
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--guard-color-text-strong)' }}>
                  {alarmFloors.has(f.id) && (
                    <span style={{
                      display: 'inline-block', width: 7, height: 7,
                      borderRadius: '50%', background: 'var(--guard-color-danger)', marginRight: 5,
                      boxShadow: '0 0 5px var(--guard-color-danger)',
                      animation: 'text-blink 1s step-end infinite',
                    }} />
                  )}
                  {f.label}
                </span>
              ),
            }))}
            tabBarExtraContent={
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* 그룹 1: 알림·확대·축소·새로고침 */}
                <Space size={4}>
                  <Tooltip title={rightPanelOpen ? '알람 패널 접기' : '알람 패널 펼치기'}>
                    <Button
                      size="small"
                      type={rightPanelOpen ? 'default' : 'primary'}
                      icon={<BellOutlined />}
                      onClick={() => setRightPanelOpen((v) => !v)}
                      style={!rightPanelOpen ? { boxShadow: '0 0 10px color-mix(in srgb, var(--guard-color-primary) 45%, transparent)' } : undefined}
                    />
                  </Tooltip>
                  <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} />
                  <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} />
                  <Button size="small" icon={<ReloadOutlined />} onClick={resetView}
                    style={{ fontSize: 11 }} title="뷰 초기화" />
                </Space>

                {/* 그룹 2: 배율 표시 */}
                <span style={{ fontSize: 11, color: 'var(--guard-color-text-soft)', minWidth: 40, textAlign: 'center', marginLeft: 10 }}>
                  {Math.round(scale * 100)}%
                </span>

                {/* 그룹 3: 자동이동 스위치 */}
                <Switch
                  checked={autoFocus}
                  onChange={setAutoFocus}
                  style={{ marginLeft: 10, height: 22, lineHeight: '22px' }}
                  checkedChildren={<span style={{ fontSize: 10 }}>자동이동</span>}
                  unCheckedChildren={<span style={{ fontSize: 10 }}>수동</span>}
                />
              </div>
            }
          />
        </div>

        {/* ── 맵 캔버스 ── */}
        <div
          ref={containerRef}
          className="map-container"
          style={{
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            background: 'var(--guard-map-bg)',
            userSelect: 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          onMouseLeave={handleMapMouseUp}
        >
          <div
            style={{
              position: 'absolute',
              transformOrigin: '0 0',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
              willChange: 'transform',
            }}
          >
            {/* 배경 평면도 이미지 */}
            <img
              ref={mapRef}
              src={mapImageSrc}
              alt={floor.label}
              onLoad={handleImgLoad}
              style={{
                display: 'block',
                maxWidth: 'none',
                userSelect: 'none', pointerEvents: 'none',
                filter: 'var(--guard-map-filter)',
              }}
              draggable={false}
            />

            {/* 스캔라인 + 빔 오버레이 */}
            <div className="map-scan-beam" style={{ display: 'none' }} />

            {/* Zone 편집 배치 오버레이 (저장된 아이템) */}
            {hasZoneItems && mapDims.w > 0 && (
              <ZoneOverlay
                items={currentZoneItems}
                mapW={mapDims.w} mapH={mapDims.h}
                onCameraClick={(item) => {
                  const cam = MOCK_CAMERAS.find((c) => c.id === item.cameraId);
                  if (cam) handleCctvClick({
                    id: cam.id, label: cam.cameraName, channelId: cam.channelId,
                    supportsPtz: !!cam.supportsPtz, rtspUrl: `rtsp://${cam.channelId}`,
                    location: item.label, top: '0', left: '0', angle: 0, fov: item.fovAngle ?? 90,
                  });
                }}
              />
            )}

            {/* Zone / FOV / 마커 오버레이 (FLOOR_DATA — Zone 편집 배치 없을 때) */}
            {!hasZoneItems && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <FloorOverlay
                floor={floor}
                mapWidth={mapDims.w}
                mapHeight={mapDims.h}
                onCctvClick={handleCctvClick}
                alarmLineIds={alarmLineIds}
                onLineClick={handleLineClick}
                alarmDeviceNames={alarmDeviceNames}
                onDeviceClick={handleDeviceClick}
              />
            </div>
            )}
          </div>


          {/* ── 미니맵 네비게이터 (확대 시 표시) ── */}
          {scale > 1.05 && mapDims.w > 0 && (
            <MinimapNav
              image={mapImageSrc}
              mapW={mapDims.w}
              mapH={mapDims.h}
              containerW={containerRef.current?.clientWidth ?? containerDims.w}
              containerH={containerRef.current?.clientHeight ?? containerDims.h}
              scale={scale}
              offset={offset}
              onNavigate={(x, y) => setOffset(clampOffset(x, y, scale))}
            />
          )}

          {/* ── CCTV 오버레이 팝업 ── */}
          {popups.map((popup, i) => (
            <CctvOverlayCard
              key={popup.id}
              popup={popup}
              index={i}
              onClose={closePopup}
              onPreset={setActivePreset}
            />
          ))}


          {/* 우상단: 층 현황 HUD */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'color-mix(in srgb, var(--guard-color-surface) 88%, transparent)',
            border: '1px solid var(--guard-color-border)',
            borderRadius: 6, padding: '8px 12px', fontSize: 11,
            display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: '0 0 16px rgba(0,0,0,.5)',
          }}>
            <div style={{ color: 'var(--guard-color-secondary)', fontWeight: 700, fontSize: 10,
                           letterSpacing: 2, marginBottom: 2, textTransform: 'uppercase' }}>
              Floor Status
            </div>
            <div style={{ color: 'var(--guard-color-muted)' }}>Zone &nbsp;<b style={{ color: 'var(--guard-color-text-strong)' }}>{floor.zones.length}</b></div>
            <div style={{ color: 'var(--guard-color-muted)' }}>CCTV &nbsp;<b style={{ color: 'var(--guard-color-accent)' }}>{floor.cctv.length}</b></div>
            <div style={{ color: 'var(--guard-color-muted)' }}>출입문 <b style={{ color: 'var(--guard-color-secondary)' }}>{floor.doors.length}</b></div>
            <div style={{ color: 'var(--guard-color-muted)' }}>장비 &nbsp;<b style={{ color: 'var(--guard-color-text-strong)' }}>{floor.devices.length}</b></div>
            <div style={{
              color: alarmZoneCount > 0 ? 'var(--guard-color-danger)' : 'var(--guard-color-success)',
              fontWeight: 700,
              textShadow: alarmZoneCount > 0 ? '0 0 6px color-mix(in srgb, var(--guard-color-danger) 70%, transparent)' : 'none',
            }}>
              알람 {alarmZoneCount}건
            </div>
          </div>

          {/* 좌하단: 범례 */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: 'color-mix(in srgb, var(--guard-color-surface) 88%, transparent)', color: 'var(--guard-color-muted)',
            padding: '6px 10px', borderRadius: 6, fontSize: 10,
            display: 'flex', flexDirection: 'column', gap: 3,
            border: '1px solid var(--guard-color-border)', pointerEvents: 'none',
          }}>
            {[
              { color: 'var(--guard-color-danger)', label: 'CRITICAL 알람', glow: true },
              { color: 'var(--guard-color-warning)', label: 'HIGH 알람',     glow: true },
              { color: 'var(--guard-color-accent)', label: 'MEDIUM 알람',   glow: false },
              { color: 'var(--guard-color-primary)', label: '정상 Zone',     glow: false },
            ].map((i) => (
              <span key={i.color} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 2, background: i.color, flexShrink: 0,
                  boxShadow: i.glow ? `0 0 4px ${i.color}` : 'none',
                }} />
                {i.label}
              </span>
            ))}
            <span style={{ marginTop: 2, paddingTop: 3, borderTop: '1px solid var(--guard-color-border)',
                            display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span><span style={{ color: 'var(--guard-color-accent)' }}>● </span>일반 CCTV (고정)</span>
              <span><span style={{ color: 'var(--guard-color-success)' }}>● </span>PTZ CCTV (회전)</span>
              <span><span style={{ color: 'var(--guard-color-success)' }}>⚡ </span>연결된 장비</span>
              <span style={{ borderTop: '1px solid var(--guard-color-border)', paddingTop: 2, marginTop: 2 }}>
                <span style={{ color: 'var(--guard-color-success)' }}>🚪 </span>잠김 &nbsp;
                <span style={{ color: 'var(--guard-color-accent)' }}>🚪 </span>열림
              </span>
              <span>
                <span style={{ color: 'var(--guard-color-danger)' }}>🚪 </span>강제개방 &nbsp;
                <span style={{ color: 'var(--guard-color-warning)' }}>🚪 </span>장시간열림
              </span>
            </span>
          </div>
        </div>

        {/* 하단 통계 바 */}
        <div className="map-stats-bar">
          <span>오늘 이벤트: <b style={{ color: 'var(--guard-color-text-strong)' }}>142</b></span>
          <span style={{ color: 'var(--guard-color-danger)', textShadow: '0 0 5px color-mix(in srgb, var(--guard-color-danger) 50%, transparent)' }}>
            위험: <b>3</b>
          </span>
          <span style={{ color: 'var(--guard-color-warning)' }}>미확인: <b>{alarms.length}</b></span>
          {FLOOR_DATA.map((f) => (
            <Tag
              key={f.id}
              color={f.id === selectedFloor ? 'blue' : 'default'}
              style={{ cursor: 'pointer', fontSize: 11 }}
              onClick={() => setSelectedFloor(f.id)}
            >
              {f.label.replace(' 평면도', '')}:&nbsp;
              <b style={{ color: f.zones.filter((z) => z.alarm).length > 0 ? 'color-mix(in srgb, var(--guard-color-danger) 35%, #fff)' : undefined }}>
                {f.zones.filter((z) => z.alarm).length}건
              </b>
            </Tag>
          ))}
          <span style={{ marginLeft: 'auto' }}>
            <span className="hud-scan-text" style={{ fontSize: 10 }}>● LIVE</span>
          </span>
        </div>
      </div>

      {/* ══ 오른쪽: 알람 패널 ══ */}
      <div style={{
        width: rightPanelOpen ? 300 : 0,
        flexShrink: 0,
        background: 'var(--guard-color-surface)',
        borderLeft: rightPanelOpen ? '1px solid var(--guard-color-border)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        position: 'relative',
      }}>
        {/* 패널 닫기/열기 토글 버튼 */}
        <Tooltip title={rightPanelOpen ? '패널 숨기기' : '패널 펼치기'} placement="left">
          <button
            onClick={() => setRightPanelOpen((v) => !v)}
            style={{
              position: 'absolute',
              top: '50%',
              left: rightPanelOpen ? -16 : -20,
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 20,
              height: 48,
              background: 'var(--guard-color-surface)',
              border: '1px solid var(--guard-color-border)',
              borderRight: rightPanelOpen ? 'none' : undefined,
              borderRadius: rightPanelOpen ? '4px 0 0 4px' : '4px',
              color: 'var(--guard-color-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transition: 'left 0.25s ease, color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--guard-color-text-strong)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--guard-color-muted)')}
          >
            {rightPanelOpen ? <LeftOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
          </button>
        </Tooltip>

        <div style={{ width: 300, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        <div style={{
          ...alarmVars,
          background: 'var(--guard-color-surface)',
          borderBottom: '1px solid var(--guard-color-border)',
          flexShrink: 0,
        }}>
          {/* ── 알람 섹션 헤더 ── */}
          <div className="alarm-panel-header" style={{ cursor: 'pointer' }}
            onClick={() => setAlarmSectionOpen((v) => !v)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {alarmSectionOpen
                ? <DownOutlined style={{ fontSize: 10, color: 'var(--guard-color-text-faint)' }} />
                : <CaretRightOutlined style={{ fontSize: 10, color: 'var(--guard-color-text-faint)' }} />}
              알람 패널
            </span>
            {alarms.length > 0 && (
              <Badge count={alarms.length}
                styles={{ indicator: { background: 'var(--guard-color-danger)', boxShadow: '0 0 6px var(--guard-color-danger)' } }}>
                <AlertOutlined style={{ color: 'var(--guard-color-text-soft)' }} />
              </Badge>
            )}
          </div>

          {alarmSectionOpen && (
          <div className="alarm-panel">
            {alarms.length === 0 ? null : (
              alarms.map((alarm) => (
                <div key={alarm.eventId}
                  className={`alarm-card alarm-card--${alarm.severity.toLowerCase()}`}>
                  <div className="alarm-card-title">
                    <SeverityBadge severity={alarm.severity} />
                    <span style={{ marginLeft: 6 }}>{alarm.zoneName}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--guard-color-text-faint)', margin: '3px 0' }}>{alarm.deviceName}</div>
                  <div className="alarm-card-time">{alarm.occurredAt.slice(11, 19)}</div>
                  <Space style={{ marginTop: 6 }}>
                    <Button size="small" type="primary" onClick={() => ackAlarm(alarm.eventId)}>확인</Button>
                    <Button size="small" icon={<VideoCameraOutlined />}
                      onClick={() => {
                        const cam = MOCK_CAMERAS[0];
                        openPopup({
                          eventId:     alarm.eventId,
                          cameraId:    cam.id,
                          cameraName:  `${alarm.zoneName} CCTV`,
                          channelId:   cam.channelId,
                          severity:    alarm.severity,
                          supportsPtz: cam.supportsPtz,
                        });
                      }}>영상</Button>
                  </Space>
                </div>
              ))
            )}
          </div>
          )}

          {/* ── 이벤트 피드 섹션 ── */}
          <div className="event-feed-header" style={{ cursor: 'pointer', borderTop: '1px solid var(--guard-color-border)' }}
            onClick={() => setFeedSectionOpen((v) => !v)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {feedSectionOpen
                ? <DownOutlined style={{ fontSize: 10, color: 'var(--guard-color-text-faint)' }} />
                : <CaretRightOutlined style={{ fontSize: 10, color: 'var(--guard-color-text-faint)' }} />}
              이벤트 피드
            </span>
            <a href="/events" style={{ fontSize: 12, color: 'var(--guard-color-primary)' }}
              onClick={(e) => e.stopPropagation()}>전체 →</a>
          </div>
          {feedSectionOpen && (
          <div className="event-feed" style={{ borderTop: 'none' }}>
            {feedItems.map((e) => (
              <div key={e.id} className="feed-item">
                <div className={`feed-dot feed-dot--${e.severity.toLowerCase()}`} />
                <span style={{ color: 'var(--guard-color-text-faint)', flexShrink: 0, fontSize: 11 }}>{e.occurredAt.slice(11)}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap', fontSize: 13, color: 'var(--guard-color-text)' }}>
                  {e.zoneName}
                </span>
                <SeverityBadge severity={e.severity} />
              </div>
            ))}
          </div>
          )}
        </div>

        {/* ── 장비 상태 섹션 ── */}
        <div style={{
          ...floorVars,
          background: 'var(--guard-color-surface)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}>
        <div style={{
            padding: '8px 12px', borderTop: '1px solid var(--guard-color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
            color: 'var(--guard-color-muted)', letterSpacing: 0.5, textTransform: 'uppercase',
          }}
          onClick={() => setDeviceSectionOpen((v) => !v)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {deviceSectionOpen
              ? <DownOutlined style={{ fontSize: 10 }} />
              : <CaretRightOutlined style={{ fontSize: 10 }} />}
            장비·CCTV 상태
          </span>
          <span style={{ fontSize: 11, color: 'var(--guard-color-border)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
            {monitorAssetRows.length}
          </span>
        </div>
        {deviceSectionOpen && (
        <div className="device-status-section">
          <div className="device-status-search">
            <Input
              size="small"
              allowClear
              value={deviceStatusSearch}
              onChange={(e) => setDeviceStatusSearch(e.target.value)}
              placeholder="이름·채널·종류 검색"
              prefix={<SearchOutlined style={{ color: 'var(--guard-color-muted)', fontSize: 13 }} />}
            />
          </div>
          <div className="device-status-list">
            {/* ── CCTV ── */}
            {(!searchLc || camAssets.some((c) => c.cameraName.toLowerCase().includes(searchLc) || c.channelId.toLowerCase().includes(searchLc))) && (
              <div style={{ fontSize: 10, color: 'var(--guard-color-muted)', fontWeight: 700, letterSpacing: 1, padding: '6px 8px 3px', textTransform: 'uppercase' }}>
                CCTV ({camAssets.length})
              </div>
            )}
            {camAssets
              .filter((c) => !searchLc || c.cameraName.toLowerCase().includes(searchLc) || c.channelId.toLowerCase().includes(searchLc))
              .map((c) => {
                const hasAlarm = alarmDeviceNames.has(c.cameraName);
                return (
                  <div key={`cam-${c.id}`} className="device-status-row">
                    <span style={{ fontSize: 15, flexShrink: 0, color: 'var(--guard-color-accent)', display: 'flex', alignItems: 'center' }}><VideoCameraOutlined /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.cameraName}</span>
                        {c.supportsPtz && <Tag style={{ margin: 0, fontSize: 9, padding: '0 4px', background: 'color-mix(in srgb, var(--guard-color-success) 18%, transparent)', color: 'var(--guard-color-success)', border: 'none' }}>PTZ</Tag>}
                        {hasAlarm && <Tag color="red" style={{ margin: 0, fontSize: 9, padding: '0 4px' }}>알람</Tag>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--guard-color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.channelId}{c.vmsName ? ` · ${c.vmsName}` : ''}</div>
                    </div>
                    <span className="dot-connected" style={{ fontSize: 11, flexShrink: 0 }}>● 연결</span>
                  </div>
                );
              })}

            {/* ── 출입통제 ── */}
            {doorDevices.length > 0 && (!searchLc || doorDevices.some((d) => d.deviceName.toLowerCase().includes(searchLc))) && (
              <div style={{ fontSize: 10, color: 'var(--guard-color-muted)', fontWeight: 700, letterSpacing: 1, padding: '6px 8px 3px', borderTop: '1px solid var(--guard-color-border)', textTransform: 'uppercase' }}>
                출입통제 ({doorDevices.length})
              </div>
            )}
            {doorDevices
              .filter((d) => !searchLc || d.deviceName.toLowerCase().includes(searchLc) || d.ip.includes(searchLc))
              .map((d) => {
                const hasAlarm = alarmDeviceNames.has(d.deviceName);
                const statusConnected = d.status !== 'offline';
                return (
                  <div key={`door-${d.id}`} className="device-status-row">
                    <span style={{ fontSize: 15, flexShrink: 0, color: 'var(--guard-color-muted)', display: 'flex', alignItems: 'center' }}><LockOutlined /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.deviceName}</span>
                        {hasAlarm && <Tag color="red" style={{ margin: 0, fontSize: 9, padding: '0 4px' }}>알람</Tag>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--guard-color-muted)' }}>{d.ip}:{d.port}</div>
                    </div>
                    <span className={statusConnected ? 'dot-connected' : 'dot-disconnected'} style={{ fontSize: 11, flexShrink: 0 }}>
                      {statusConnected ? '● 연결' : '● 단절'}
                    </span>
                  </div>
                );
              })}

            {/* ── 센서 장비 (Senstar / ADAM 등) ── */}
            {sensorDevices.length > 0 && (!searchLc || sensorDevices.some((d) => d.deviceName.toLowerCase().includes(searchLc) || d.pluginType.toLowerCase().includes(searchLc) || d.sensors.some((s) => s.label.toLowerCase().includes(searchLc)))) && (
              <div style={{ fontSize: 10, color: 'var(--guard-color-muted)', fontWeight: 700, letterSpacing: 1, padding: '6px 8px 3px', borderTop: '1px solid var(--guard-color-border)', textTransform: 'uppercase' }}>
                센서 장비 ({sensorDevices.length})
              </div>
            )}
            {sensorDevices
              .filter((d) => !searchLc || d.deviceName.toLowerCase().includes(searchLc) || d.pluginType.toLowerCase().includes(searchLc) || d.sensors.some((s) => s.label.toLowerCase().includes(searchLc)))
              .map((device) => {
                const hasAlarm = alarmDeviceNames.has(device.deviceName);
                const isExpanded = expandedMonDevIds.includes(device.id);
                const statusConnected = device.status !== 'offline';
                const activeSensors = device.sensors.filter((s) => s.active);
                const devIcon = device.pluginType === 'SenstarFlexZone'
                  ? <WifiOutlined style={{ color: 'var(--guard-color-warning)' }} />
                  : device.pluginType === 'AdamModbus'
                  ? <ApiOutlined style={{ color: 'var(--guard-color-accent)' }} />
                  : <DesktopOutlined style={{ color: 'var(--guard-color-primary)' }} />;
                const devColor = device.pluginType === 'SenstarFlexZone' ? 'var(--guard-color-warning)' : device.pluginType === 'AdamModbus' ? 'var(--guard-color-accent)' : 'var(--guard-color-primary)';
                return (
                  <div key={`dev-${device.id}`} style={{ marginBottom: 2 }}>
                    <div
                      onClick={() => toggleMonDev(device.id)}
                      className="device-status-row"
                      style={{ cursor: 'pointer', borderLeft: `3px solid ${isExpanded ? devColor : 'var(--guard-color-border)'}`, paddingLeft: 5 }}
                    >
                      <span style={{ fontSize: 15, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{devIcon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.deviceName}</span>
                          {hasAlarm && <Tag color="red" style={{ margin: 0, fontSize: 9, padding: '0 4px' }}>알람</Tag>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--guard-color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {device.pluginType} · {device.ip}:{device.port}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        <span className={statusConnected ? 'dot-connected' : 'dot-disconnected'} style={{ fontSize: 11 }}>
                          {statusConnected ? '● 연결' : '● 단절'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--guard-color-muted)' }}>
                          {isExpanded ? '▲' : '▼'} {activeSensors.length}채널
                        </span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ marginLeft: 10, paddingLeft: 8, borderLeft: `1px solid ${devColor}44` }}>
                        {activeSensors
                          .filter((s) => !searchLc || s.label.toLowerCase().includes(searchLc))
                          .map((sensor) => {
                            const sensorAlarm = alarmDeviceNames.has(sensor.label);
                            const isLine = sensor.mapPlacement === 'LINE';
                            const sColor = isLine ? 'var(--guard-color-primary)' : sensor.mapPlacement === 'ZONE' ? 'var(--guard-color-accent)' : 'var(--guard-color-success)';
                            return (
                              <div key={sensor.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4, marginBottom: 1 }}>
                                <span style={{ fontSize: 11, color: sColor, flexShrink: 0 }}>{isLine ? '〰' : '📍'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, color: sensorAlarm ? 'color-mix(in srgb, var(--guard-color-danger) 35%, #fff)' : 'var(--guard-color-text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sensor.label}</div>
                                  <div style={{ fontSize: 10, color: 'var(--guard-color-text-faint)' }}>{sensor.mapPlacement}{sensor.startMeter != null ? ` · ${sensor.startMeter}~${sensor.endMeter}m` : ''}</div>
                                </div>
                                {sensorAlarm && <Tag color="red" style={{ margin: 0, fontSize: 9, padding: '0 3px' }}>알람</Tag>}
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: sensor.active ? 'var(--guard-color-success)' : 'var(--guard-color-text-faint)', flexShrink: 0 }} />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}

            {filteredMonitorAssets.length === 0 && searchLc && (
              <div style={{ textAlign: 'center', color: 'var(--guard-color-text-faint)', fontSize: 12, padding: '12px 4px' }}>검색 결과 없음</div>
            )}
          </div>
        </div>
        )}
        </div>

        </div>
      </div>

      {/* ══ CCTV 실시간 팝업 ══ */}
      <Modal
        open={!!activeCam || popups.length > 0}
        onCancel={handleClose}
        footer={null}
        width={580}
        styles={{
          body: { padding: 20, background: 'var(--guard-color-surface)' },
          header: { background: 'var(--guard-color-surface-strong)', borderBottom: '1px solid var(--guard-color-border)', padding: '12px 20px' },
          mask: { backdropFilter: 'blur(3px)' },
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VideoCameraOutlined style={{ color: 'var(--guard-color-primary)' }} />
            <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 700 }}>
              {activeCam?.label ?? popups[0]?.cameraName ?? 'CCTV 영상'}
            </span>
            {activeCam?.supportsPtz && <Tag color="green" style={{ fontSize: 10, margin: 0 }}>PTZ</Tag>}
            <div style={{ marginLeft: 'auto' }}>
              <div className="video-live-badge">● LIVE</div>
            </div>
          </div>
        }
      >
        {(activeCam || popups.length > 0) && (() => {
          const cam = activeCam ?? {
            id: popups[0].eventId, label: popups[0].cameraName,
            channelId: popups[0].channelId, supportsPtz: false,
            rtspUrl: 'rtsp://auto', location: '자동연결',
            top: '', left: '', angle: 0, fov: 90,
          };
          return (
            <>
              <div className="video-placeholder" style={{ height: 290, borderRadius: 8 }}>
                <VideoCameraOutlined style={{ fontSize: 52, color: 'var(--guard-color-border)' }} />
                <div style={{ color: 'var(--guard-color-text-faint)', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>WebRTC 스트림 연결 중</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--guard-color-primary)' }}>{cam.rtspUrl}</div>
                </div>
                <Space>
                  <Button size="small" type="primary">▶ 라이브</Button>
                  <Button size="small">◀ 30초 전</Button>
                  <Button size="small">30초 후 ▶</Button>
                  <Button size="small">⏹ 녹화</Button>
                </Space>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 12, padding: '8px 0',
                borderBottom: '1px solid var(--guard-color-border)', fontSize: 12, color: 'var(--guard-color-text-faint)',
              }}>
                <Space>
                  <Tag color="blue">{cam.channelId}</Tag>
                  <span>{cam.location}</span>
                </Space>
                <Space>
                  {cam.supportsPtz && (
                    <Button size="small" icon={<AimOutlined />}
                      type={ptzOpen ? 'primary' : 'default'}
                      onClick={() => setPtzOpen((v) => !v)}>
                      PTZ 제어
                    </Button>
                  )}
                  <Button size="small" danger onClick={handleClose}>닫기</Button>
                </Space>
              </div>

              {ptzOpen && cam.supportsPtz && <PtzPanel />}

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--guard-color-text-faint)' }}>
                <span style={{ color: 'var(--guard-color-secondary)', fontWeight: 600, letterSpacing: 1 }}>최근 이벤트</span>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['침입 감지 — 09:30:05', '움직임 감지 — 09:15:22', '연결 확인 — 09:00:00'].map((e) => (
                    <div key={e} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="feed-dot feed-dot--medium" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ══ 장비 상세 모달 ══ */}
      <Modal
        open={!!selectedDevice}
        onCancel={() => setSelectedDevice(null)}
        footer={<Button onClick={() => setSelectedDevice(null)}>닫기</Button>}
        width={420}
        styles={{
          body: { padding: 20, background: 'var(--guard-color-surface)' },
          header: { background: 'var(--guard-color-surface-strong)', borderBottom: '1px solid var(--guard-color-border)', padding: '12px 20px' },
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {selectedDevice && (() => {
              const cfg = DEV_TYPE_CFG[selectedDevice.type] ?? { icon: <NodeIndexOutlined />, color: 'var(--guard-color-text-faint)', label: '장비' };
              const hasAlarm = alarmDeviceNames.has(selectedDevice.label);
              return (
                <>
                  <span style={{ color: hasAlarm ? 'var(--guard-color-danger)' : cfg.color, fontSize: 16 }}>{cfg.icon}</span>
                  <span style={{ color: 'var(--guard-color-text-strong)', fontWeight: 700 }}>{selectedDevice.label}</span>
                  <Tag color={selectedDevice.status === 'CONNECTED' ? 'success' : 'error'} style={{ fontSize: 10, margin: 0 }}>
                    {selectedDevice.status === 'CONNECTED' ? '연결됨' : '끊김'}
                  </Tag>
                  {hasAlarm && <Tag color="red" style={{ fontSize: 10, margin: 0 }}>⚠ 알람</Tag>}
                </>
              );
            })()}
          </div>
        }
      >
        {selectedDevice && (() => {
          const cfg = DEV_TYPE_CFG[selectedDevice.type] ?? { icon: <NodeIndexOutlined />, color: 'var(--guard-color-text-faint)', label: '장비' };
          const hasAlarm = alarmDeviceNames.has(selectedDevice.label);
          const relatedAlarms = alarms.filter((a) => a.deviceName === selectedDevice.label && a.ackStatus === 'UNACKED');
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 장비 기본 정보 */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: '종류', value: cfg.label },
                  { label: '맵 위치', value: `${selectedDevice.top} / ${selectedDevice.left}` },
                  { label: '상태', value: selectedDevice.status, color: selectedDevice.status === 'CONNECTED' ? 'var(--guard-color-success)' : 'var(--guard-color-danger)' },
                ].map((item) => (
                  <div key={item.label} style={{
                    flex: 1, background: 'var(--guard-color-bg)', border: '1px solid var(--guard-color-border)',
                    borderRadius: 6, padding: '8px 12px',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--guard-color-text-faint)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.color ?? 'var(--guard-color-text-strong)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* 발생 알람 목록 */}
              {relatedAlarms.length > 0 ? (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--guard-color-danger)', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertOutlined /> 미처리 알람 ({relatedAlarms.length}건)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {relatedAlarms.map((a) => (
                      <div key={a.eventId} style={{
                        background: 'var(--guard-color-bg)', border: `1px solid color-mix(in srgb, ${SEV_COLOR[a.severity] ?? 'var(--guard-color-border)'} 36%, transparent)`,
                        borderLeft: `3px solid ${SEV_COLOR[a.severity] ?? 'var(--guard-color-border)'}`,
                        borderRadius: 5, padding: '7px 12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--guard-color-text-strong)' }}>{a.zoneName}</div>
                          <div style={{ fontSize: 10, color: 'var(--guard-color-text-faint)', marginTop: 1 }}>
                            {new Date(a.occurredAt).toLocaleString('ko-KR')}
                          </div>
                        </div>
                        <SeverityBadge severity={a.severity} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--guard-color-bg)', border: '1px solid color-mix(in srgb, var(--guard-color-border) 22%, transparent)',
                  borderRadius: 6, padding: '12px 16px', textAlign: 'center',
                  fontSize: 12, color: 'var(--guard-color-text-faint)',
                }}>
                  현재 발생한 알람이 없습니다
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

    </div>
  );
};

export default MonitorPage;
