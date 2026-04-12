/**
 * Zones.tsx — 인터랙티브 맵 배치 에디터
 *  · Monitor.tsx 와 동일한 맵 컨트롤 (fit-to-screen, clampOffset, 미니맵)
 *  · 카메라 FOV 시야각 (방향/화각/범위 드래그 조절)
 *  · LINE 센서: 드롭 → 꺾은선 그리기 (클릭:추가, 더블클릭:완료, ESC:취소)
 *  · 장비→센서 계층 팔레트 / Undo-Redo / 우클릭 컨텍스트 메뉴
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input, InputNumber, Select, Tag, Tooltip, Modal } from 'antd';
import {
  DeleteOutlined, DragOutlined, RedoOutlined, UndoOutlined,
  CheckCircleOutlined, PlusOutlined, MinusOutlined,
  FullscreenOutlined, RightOutlined, DownOutlined, SearchOutlined,
  VideoCameraOutlined, LockOutlined, WifiOutlined, ApiOutlined,
  DesktopOutlined, SettingOutlined, NodeIndexOutlined,
} from '@ant-design/icons';
import { MOCK_MAPS, MOCK_CAMERAS } from '../../mock/data';
import { useDeviceStore, useMapPlacementStore, type Sensor, type Device } from '../../stores';

/* ─────────────────────────────────────────────
   타입
───────────────────────────────────────────── */
type ItemKind = 'CAMERA' | 'DEVICE' | 'DOOR' | 'SENSOR';
interface Pt { x: number; y: number }

interface PlacedItem {
  id: string;
  kind: ItemKind;
  label: string;
  color: string;
  points: Pt[];
  iconType?: string;
  sensorId?: string;
  placementType?: string;
  direction?: number;
  fovAngle?: number;
  fovRange?: number;
  cameraId?: string;
  doorDeviceId?: string;
  deviceId?: string;
  devicePluginType?: string;
  size?: number;
  lineWidth?: number;
  labelVisible?: boolean;
}

/** 우측 팔레트에서 맵으로 드래그하는 카메라·출입 항목 (등록 장비 기준) */
interface PaletteDragItem {
  paletteId: string;
  kind: 'CAMERA' | 'DOOR';
  label: string;
  icon: React.ReactNode;
  iconType: string;
  color: string;
  subLabel?: string;
  cameraId?: string;
  doorDeviceId?: string;
}

interface DrawingLine { sensorId: string; label: string; color: string; points: Pt[] }
interface DragState {
  id: string;
  mode: 'MOVE' | 'ROTATE' | 'RESIZE';
  ox: number; oy: number; pts: Pt[];
}

const DEFAULT_CAM = { direction: 270, fovAngle: 90, fovRange: 120 };
const DOOR_ICON_ROT = ['card', 'face', 'pin'] as const;
const MINI_W = 160;

/* ─────────────────────────────────────────────
   유틸
───────────────────────────────────────────── */
const uid = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const ptStr = (pts: Pt[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');
const sensorIcon = (t?: string): React.ReactNode =>
  t === 'LINE' ? <NodeIndexOutlined /> : t === 'ZONE' ? <ApiOutlined /> : <WifiOutlined />;
const sensorColor = (t?: string) => t === 'LINE' ? '#2563EB' : t === 'ZONE' ? '#7C3AED' : '#059669';
const deg2rad = (d: number) => d * Math.PI / 180;
const normDeg = (d: number) => ((d % 360) + 360) % 360;

const deviceColor = (pluginType?: string) => {
  if (pluginType === 'SenstarFlexZone') return '#F59E0B';
  if (pluginType === 'AdamModbus')      return '#EAB308';
  if (pluginType === 'AccessControl')   return '#16A34A';
  return '#6366F1';
};
const deviceIcon = (pluginType?: string): React.ReactNode => {
  if (pluginType === 'SenstarFlexZone') return <WifiOutlined />;
  if (pluginType === 'AdamModbus')      return <ApiOutlined />;
  if (pluginType === 'AccessControl')   return <LockOutlined />;
  return <DesktopOutlined />;
};
const deviceStatusColor = (status?: string) => {
  if (status === 'online' || status === '정상') return '#22C55E';
  if (status === 'alarm')  return '#EF4444';
  if (status === 'fault')  return '#F59E0B';
  return '#64748b';
};

/* ─────────────────────────────────────────────
   미니맵 네비게이터 (Monitor.tsx 동일)
───────────────────────────────────────────── */
const MinimapNav: React.FC<{
  image: string; mapW: number; mapH: number;
  containerW: number; containerH: number;
  scale: number; offset: { x: number; y: number };
  onNavigate: (x: number, y: number) => void;
}> = ({ image, mapW, mapH, containerW, containerH, scale, offset, onNavigate }) => {
  if (mapW === 0 || mapH === 0) return null;
  const aspect = mapH / mapW;
  const miniW = MINI_W;
  const miniH = Math.round(miniW * aspect);
  const miniScale = miniW / mapW;

  const vpX = -offset.x / scale;
  const vpY = -offset.y / scale;
  const vpW =  containerW / scale;
  const vpH =  containerH / scale;
  const rx = Math.max(0, vpX * miniScale);
  const ry = Math.max(0, vpY * miniScale);
  const rw = Math.min(miniW - rx, vpW * miniScale);
  const rh = Math.min(miniH - ry, vpH * miniScale);

  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    onNavigate(containerW / 2 - (mx / miniScale) * scale, containerH / 2 - (my / miniScale) * scale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = (mv.clientX - dragRef.current.sx) / miniScale * scale;
      const dy = (mv.clientY - dragRef.current.sy) / miniScale * scale;
      onNavigate(dragRef.current.ox - dx, dragRef.current.oy - dy);
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div style={{
      position: 'absolute', bottom: 44, right: 12,
      width: miniW, height: miniH,
      border: '1px solid #1E3A5F', borderRadius: 4, overflow: 'hidden',
      background: '#030810', boxShadow: '0 2px 12px rgba(0,0,0,.7)',
      cursor: 'crosshair', zIndex: 50,
    }}
      onClick={handleClick} onMouseDown={handleMouseDown}
    >
      <img src={image} alt="minimap"
        style={{ width: miniW, height: miniH, objectFit: 'fill', display: 'block',
          pointerEvents: 'none', filter: 'brightness(0.6) contrast(1.1)', userSelect: 'none' }}
        draggable={false} />
      <div style={{
        position: 'absolute', left: rx, top: ry,
        width: Math.max(4, rw), height: Math.max(4, rh),
        border: '1.5px solid #60a5fa', borderRadius: 2,
        background: 'rgba(37,99,235,0.15)', pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', bottom: 3, left: 5, fontSize: 8, color: '#475569', fontWeight: 700, pointerEvents: 'none' }}>NAV</div>
      <div style={{ position: 'absolute', bottom: 3, right: 5, fontSize: 8, color: '#2563EB', pointerEvents: 'none' }}>
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   카메라 FOV
───────────────────────────────────────────── */
const CameraFov: React.FC<{
  item: PlacedItem; selected: boolean;
  onDirectionDown: (e: React.MouseEvent) => void;
  onRangeDown: (e: React.MouseEvent) => void;
}> = ({ item, selected, onDirectionDown, onRangeDown }) => {
  const p = item.points[0];
  if (!p) return null;
  const dir   = item.direction  ?? DEFAULT_CAM.direction;
  const half  = (item.fovAngle  ?? DEFAULT_CAM.fovAngle) / 2;
  const range = item.fovRange   ?? DEFAULT_CAM.fovRange;
  const color = item.color;
  const lRad = deg2rad(dir - half), rRad = deg2rad(dir + half), mRad = deg2rad(dir);
  const lx = p.x + range * Math.cos(lRad), ly = p.y + range * Math.sin(lRad);
  const rx = p.x + range * Math.cos(rRad), ry = p.y + range * Math.sin(rRad);
  const mx = p.x + range * Math.cos(mRad), my = p.y + range * Math.sin(mRad);
  const largeArc = half * 2 > 180 ? 1 : 0;
  const pathD = `M ${p.x} ${p.y} L ${lx} ${ly} A ${range} ${range} 0 ${largeArc} 1 ${rx} ${ry} Z`;
  return (
    <g>
      <path d={pathD} fill={color} fillOpacity={selected ? 0.22 : 0.13}
        stroke={color} strokeWidth={selected ? 1.5 : 1} strokeOpacity={0.55}
        style={{ pointerEvents: 'none' }} />
      <line x1={p.x} y1={p.y} x2={mx} y2={my}
        stroke={color} strokeWidth={1} strokeDasharray="4,3" opacity={0.5}
        style={{ pointerEvents: 'none' }} />
      {selected && (
        <>
          <circle cx={mx} cy={my} r={7} fill={color} stroke="#fff" strokeWidth={2} opacity={0.95}
            style={{ cursor: 'grab' }} onMouseDown={onDirectionDown}
            onClick={(e) => e.stopPropagation()} />
          <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
            fontSize={8} fill="#fff" style={{ pointerEvents: 'none', userSelect: 'none' }}>↑</text>
          <circle cx={rx} cy={ry} r={5} fill="#fff" stroke={color} strokeWidth={2} opacity={0.9}
            style={{ cursor: 'nesw-resize' }} onMouseDown={onRangeDown}
            onClick={(e) => e.stopPropagation()} />
        </>
      )}
    </g>
  );
};

/* ─────────────────────────────────────────────
   아이콘 마커
───────────────────────────────────────────── */
const IconMarker: React.FC<{
  item: PlacedItem; selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}> = ({ item, selected, onMouseDown, onContextMenu }) => {
  const p = item.points[0];
  if (!p) return null;
  let iconNode: React.ReactNode;
  if (item.kind === 'SENSOR')      iconNode = sensorIcon(item.placementType);
  else if (item.kind === 'CAMERA') iconNode = <VideoCameraOutlined />;
  else if (item.kind === 'DEVICE') iconNode = deviceIcon(item.devicePluginType);
  else                             iconNode = <LockOutlined />;
  const r = 15 * (item.size ?? 1);
  const iconSize = Math.round(14 * (item.size ?? 1));
  return (
    <g transform={`translate(${p.x},${p.y})`} onMouseDown={onMouseDown} onContextMenu={onContextMenu}
      onClick={(e) => e.stopPropagation()} style={{ cursor: 'move' }}>
      {selected && <circle r={r + 8} fill="none" stroke="#00C8FF" strokeWidth={2} strokeDasharray="5,3" />}
      <circle r={r} fill={item.color} opacity={0.92} stroke={selected ? '#00C8FF' : '#ffffff55'} strokeWidth={selected ? 2 : 1} />
      <foreignObject x={-iconSize / 2} y={-iconSize / 2} width={iconSize} height={iconSize} style={{ pointerEvents: 'none', overflow: 'visible' }}>
        <div style={{ width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: iconSize * 0.85, lineHeight: 1 }}>
          {iconNode}
        </div>
      </foreignObject>
      {item.kind === 'DEVICE' && (
        <circle cx={r * 0.72} cy={-r * 0.72} r={4} fill={item.color} stroke="#070F24" strokeWidth={1.5} />
      )}
      {(item.labelVisible !== false) && (
        <text y={r + 8} textAnchor="middle" fontSize={Math.max(8, Math.round(9 * (item.size ?? 1)))} fill="#e2e8f0" style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,.9)' }}>
          {item.label.length > 10 ? item.label.slice(0, 10) + '…' : item.label}
        </text>
      )}
    </g>
  );
};

/* ─────────────────────────────────────────────
   꺾은선 아이템
───────────────────────────────────────────── */
const LineItem: React.FC<{
  item: PlacedItem; selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}> = ({ item, selected, onMouseDown, onContextMenu }) => {
  if (item.points.length < 2) return null;
  const sw = item.lineWidth ?? 3;
  const mid = item.points[Math.floor(item.points.length / 2)];
  const a = item.points[Math.floor(item.points.length / 2) - 1] ?? item.points[0];
  const ang = Math.atan2(mid.y - a.y, mid.x - a.x) * 180 / Math.PI;
  const cx = (a.x + mid.x) / 2, cy = (a.y + mid.y) / 2;
  return (
    <g onMouseDown={onMouseDown} onContextMenu={onContextMenu}
      onClick={(e) => e.stopPropagation()} style={{ cursor: 'move' }}>
      <polyline points={ptStr(item.points)} fill="none" stroke="transparent" strokeWidth={Math.max(18, sw * 4)} />
      {selected && <polyline points={ptStr(item.points)} fill="none" stroke={item.color} strokeWidth={sw * 3} opacity={0.2} strokeLinecap="round" strokeLinejoin="round" />}
      <polyline points={ptStr(item.points)} fill="none" stroke={item.color} strokeWidth={selected ? sw + 1 : sw} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
      {selected && item.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={Math.max(4, sw)} fill="#fff" stroke={item.color} strokeWidth={2} />)}
      <g transform={`translate(${cx},${cy}) rotate(${ang})`} style={{ pointerEvents: 'none' }}>
        <polygon points={`0,-${sw} ${sw * 2.5},0 0,${sw}`} fill={item.color} opacity={0.8} />
      </g>
      {(item.labelVisible !== false) && (
        <text x={mid.x} y={mid.y - sw - 6} textAnchor="middle" fontSize={10} fill={item.color} fontWeight={700}
          style={{ pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,.9)' }}>
          {item.label}
        </text>
      )}
    </g>
  );
};

/* ─────────────────────────────────────────────
   팔레트 행
───────────────────────────────────────────── */
const PalRow: React.FC<{ icon: React.ReactNode; label: string; color: string; subLabel?: string; isDragging?: boolean; onDragStart: () => void; onDragEnd: () => void }> = ({ icon, label, color, subLabel, isDragging = false, onDragStart, onDragEnd }) => (
  <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', borderRadius: 6, cursor: 'grab', background: isDragging ? '#1E3A5F' : 'rgba(30,58,95,.25)', border: `1px solid ${isDragging ? color : '#1E3A5F'}`, marginBottom: 3, userSelect: 'none', transition: 'all .13s' }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#1E3A5F'; e.currentTarget.style.borderColor = color; }}
    onMouseLeave={(e) => { if (!isDragging) { e.currentTarget.style.background = 'rgba(30,58,95,.25)'; e.currentTarget.style.borderColor = '#1E3A5F'; }}}
  >
    <span style={{ width: 26, height: 26, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}>{icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontSize: 10, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subLabel ?? '드래그하여 배치'}</div>
    </div>
    <DragOutlined style={{ color: '#475569', fontSize: 12, flexShrink: 0 }} />
  </div>
);

/* ══════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════ */
const ZonesPage: React.FC = () => {
  const { devices, markSensorPlaced } = useDeviceStore();
  const saveMapItems = useMapPlacementStore((s) => s.saveMapItems);

  /* ── 맵/배치 ── */
  const [selectedMap, setSelectedMap] = useState('floor1');
  const [items, setItems]             = useState<PlacedItem[]>([]);
  const [history, setHistory]         = useState<PlacedItem[][]>([[]]);
  const [histIdx, setHistIdx]         = useState(0);
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  /* ── 맵 뷰 (Monitor.tsx 동일) ── */
  const [scale, setScale]   = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mapDims, setMapDims] = useState({ w: 0, h: 0 });
  const [containerDims, setContainerDims] = useState({ w: 0, h: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapImgRef    = useRef<HTMLImageElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const dragStart    = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  /* ── 꺾은선 그리기 ── */
  const [drawingLine, setDrawingLine_] = useState<DrawingLine | null>(null);
  const drawingRef = useRef<DrawingLine | null>(null);
  const setDrawingLine = (v: DrawingLine | null) => { drawingRef.current = v; setDrawingLine_(v); };
  const [cursorWorld, setCursorWorld] = useState<Pt | null>(null);

  /* ── 아이템 드래그 ── */
  const [dragging, setDragging] = useState<DragState | null>(null);

  /* ── 팔레트 드래그 ── */
  const [dragPal,    setDragPal]    = useState<PaletteDragItem | null>(null);
  const [dragSensor, setDragSensor] = useState<{ sensor: Sensor } | null>(null);
  const [dragDevice, setDragDevice] = useState<{ device: Device } | null>(null);
  const [dropPrev,   setDropPrev]   = useState<Pt | null>(null);
  const [paletteSearch, setPaletteSearch] = useState('');

  /* ── 컨텍스트/모달 ── */
  const [ctxMenu,     setCtxMenu]     = useState<{ x: number; y: number; id: string } | null>(null);
  const [renameModal, setRenameModal] = useState<{ id: string; label: string } | null>(null);

  /* ── 계층 팔레트 ── */
  const [expandedDevIds, setExpandedDevIds] = useState<string[]>([]);
  const toggleDevice = (id: string) => setExpandedDevIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const searchLc = paletteSearch.trim().toLowerCase();
  const isPaletteSearching = searchLc.length > 0;
  const textMatch = useCallback((s: string) => !searchLc || s.toLowerCase().includes(searchLc), [searchLc]);

  const cameraPaletteItems: PaletteDragItem[] = useMemo(() => MOCK_CAMERAS.map((cam) => {
    const ptz = !!cam.supportsPtz;
    return {
      paletteId: `cam-${cam.id}`,
      kind: 'CAMERA' as const,
      label: cam.cameraName,
      icon: <VideoCameraOutlined />,
      iconType: ptz ? 'ptz' : 'fixed',
      color: ptz ? '#10B981' : '#3B82F6',
      subLabel: `${cam.channelId}${cam.vmsName ? ` · ${cam.vmsName}` : ''}`,
      cameraId: cam.id,
    };
  }), []);

  const filteredCameras = useMemo(
    () => cameraPaletteItems.filter((p) => textMatch(p.label) || textMatch(p.subLabel ?? '')),
    [cameraPaletteItems, textMatch],
  );

  const doorPaletteItems: PaletteDragItem[] = useMemo(
    () => devices
      .filter((d) => d.pluginType === 'AccessControl')
      .map((d, i) => ({
        paletteId: `door-${d.id}`,
        kind: 'DOOR' as const,
        label: d.deviceName,
        icon: <LockOutlined />,
        iconType: DOOR_ICON_ROT[i % 3],
        color: ['#16A34A', '#0EA5E9', '#6366F1'][i % 3],
        subLabel: `${d.ip}:${d.port} · ${d.status}`,
        doorDeviceId: d.id,
      })),
    [devices],
  );

  const filteredDoors = useMemo(
    () => doorPaletteItems.filter((p) => textMatch(p.label) || textMatch(p.subLabel ?? '')),
    [doorPaletteItems, textMatch],
  );

  type DeviceWithFilteredSensors = { device: (typeof devices)[0]; sensors: Sensor[] };

  const filteredSensorDevices: DeviceWithFilteredSensors[] = useMemo(() => {
    const out: DeviceWithFilteredSensors[] = [];
    for (const device of devices) {
      const active = device.sensors.filter((s) => s.active);
      if (active.length === 0) continue;
      if (!isPaletteSearching) {
        out.push({ device, sensors: active });
        continue;
      }
      if (textMatch(device.deviceName)) {
        out.push({ device, sensors: active });
        continue;
      }
      const sens = active.filter((s) => textMatch(s.label) || textMatch(s.description));
      if (sens.length > 0) out.push({ device, sensors: sens });
    }
    return out;
  }, [devices, isPaletteSearching, textMatch]);

  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  /* ─── 맵 컨트롤 (Monitor.tsx 동일) ─── */
  const getMinScale = useCallback(() => {
    const c = containerRef.current, img = mapImgRef.current;
    if (!c || !img || img.naturalWidth === 0) return 0.1;
    return Math.min(c.clientWidth / img.naturalWidth, c.clientHeight / img.naturalHeight);
  }, []);

  const clampOffset = useCallback((ox: number, oy: number, s: number) => {
    const c = containerRef.current;
    if (!c || mapDims.w === 0) return { x: ox, y: oy };
    const cw = c.clientWidth, ch = c.clientHeight;
    const mw = mapDims.w * s, mh = mapDims.h * s;
    const cx = mw >= cw ? Math.min(0, Math.max(cw - mw, ox)) : (cw - mw) / 2;
    const cy = mh >= ch ? Math.min(0, Math.max(ch - mh, oy)) : (ch - mh) / 2;
    return { x: cx, y: cy };
  }, [mapDims]);

  const handleImgLoad = useCallback(() => {
    const img = mapImgRef.current, c = containerRef.current;
    if (!img || !c || img.naturalWidth === 0) return;
    const natW = img.naturalWidth, natH = img.naturalHeight;
    setMapDims({ w: natW, h: natH });
    const cw = c.clientWidth, ch = c.clientHeight;
    setContainerDims({ w: cw, h: ch });
    const fitScale = Math.min(cw / natW, ch / natH);
    setScale(fitScale);
    setOffset({ x: (cw - natW * fitScale) / 2, y: (ch - natH * fitScale) / 2 });
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const c = containerRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const minScale = getMinScale();
    setScale((prev) => {
      const ns = Math.max(minScale, Math.min(6, prev * factor));
      const ratio = ns / prev;
      setOffset((off) => clampOffset(mx - ratio * (mx - off.x), my - ratio * (my - off.y), ns));
      return ns;
    });
  }, [getMinScale, clampOffset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const zoomIn = () => {
    const c = containerRef.current;
    if (!c) return;
    const cx = c.clientWidth / 2, cy = c.clientHeight / 2;
    const ns = Math.min(6, scale * 1.25);
    const ratio = ns / scale;
    setOffset(clampOffset(cx - ratio * (cx - offset.x), cy - ratio * (cy - offset.y), ns));
    setScale(ns);
  };
  const zoomOut = () => {
    const c = containerRef.current;
    if (!c) return;
    const cx = c.clientWidth / 2, cy = c.clientHeight / 2;
    const ns = Math.max(getMinScale(), scale / 1.25);
    const ratio = ns / scale;
    setOffset(clampOffset(cx - ratio * (cx - offset.x), cy - ratio * (cy - offset.y), ns));
    setScale(ns);
  };
  const resetView = () => {
    const img = mapImgRef.current, c = containerRef.current;
    if (!img || !c || img.naturalWidth === 0) return;
    const cw = c.clientWidth, ch = c.clientHeight;
    const fs = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    setScale(fs);
    setOffset({ x: (cw - img.naturalWidth * fs) / 2, y: (ch - img.naturalHeight * fs) / 2 });
  };

  /* ─── 좌표 변환: 화면 → 맵 자연 픽셀 ─── */
  const toWorld = useCallback((clientX: number, clientY: number): Pt => {
    const c = containerRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: (clientX - r.left - offset.x) / scale, y: (clientY - r.top - offset.y) / scale };
  }, [offset, scale]);

  /* ─── Commit ─── */
  const commit = useCallback((next: PlacedItem[], prev: PlacedItem[]) => {
    prev.filter((o) => o.sensorId && !next.some((n) => n.id === o.id))
        .forEach((o) => markSensorPlaced(o.sensorId!, false));
    setItems(next);
    setHistory((h) => { const trimmed = h.slice(0, histIdx + 1); const newH = [...trimmed, next].slice(-40); setHistIdx(newH.length - 1); return newH; });
  }, [histIdx, markSensorPlaced]);

  const undo = useCallback(() => setHistIdx((idx) => { if (idx <= 0) return idx; const ni = idx - 1; setHistory((h) => { setItems(h[ni]); return h; }); return ni; }), []);
  const redo = useCallback(() => setHistIdx((idx) => { setHistory((h) => { if (idx < h.length - 1) setItems(h[idx + 1]); return h; }); return Math.min(idx + 1, history.length - 1); }), [history.length]);

  const updateItemProp = useCallback((id: string, key: keyof PlacedItem, value: unknown) => {
    const next = itemsRef.current.map((i) => i.id === id ? { ...i, [key]: value } : i);
    commit(next, itemsRef.current);
  }, [commit]);

  /* ─── 꺾은선 완료 ─── */
  const finishLine = useCallback((dl: DrawingLine, removeLast = false) => {
    const pts = removeLast ? dl.points.slice(0, -1) : dl.points;
    if (pts.length < 2) { markSensorPlaced(dl.sensorId, false); setDrawingLine(null); setCursorWorld(null); return; }
    const next = [...itemsRef.current, { id: uid(), kind: 'SENSOR' as ItemKind, label: dl.label, color: dl.color, points: pts, sensorId: dl.sensorId, placementType: 'LINE' }];
    commit(next, itemsRef.current);
    setDrawingLine(null); setCursorWorld(null);
  }, [commit, markSensorPlaced]);

  /* ─── 키보드 ─── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const dl = drawingRef.current;
      if (e.key === 'Escape') { if (dl) { markSensorPlaced(dl.sensorId, false); setDrawingLine(null); setCursorWorld(null); } return; }
      if (e.key === 'Enter' && dl) { finishLine(dl); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !dl && selectedId) {
        commit(itemsRef.current.filter((i) => i.id !== selectedId), itemsRef.current); setSelectedId(null);
      }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) undo();
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && e.shiftKey)  redo();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedId, commit, undo, redo, finishLine, markSensorPlaced]);

  /* ─── 컨테이너 마우스 이벤트 ─── */
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || drawingRef.current) return;
    // 아이템 클릭은 stopPropagation → 여기까지 오면 빈 배경
    setSelectedId(null);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    setIsDraggingMap(true);
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    const wp = toWorld(e.clientX, e.clientY);
    if (drawingRef.current) setCursorWorld(wp);

    // 맵 패닝
    if (dragStart.current && isDraggingMap) {
      const rawX = dragStart.current.ox + (e.clientX - dragStart.current.mx);
      const rawY = dragStart.current.oy + (e.clientY - dragStart.current.my);
      setOffset(clampOffset(rawX, rawY, scale));
    }

    // 아이템 드래그
    if (dragging) {
      if (dragging.mode === 'MOVE') {
        const dx = wp.x - dragging.ox, dy = wp.y - dragging.oy;
        setItems((prev) => prev.map((item) => item.id === dragging.id ? { ...item, points: dragging.pts.map((p) => ({ x: p.x + dx, y: p.y + dy })) } : item));
      } else if (dragging.mode === 'ROTATE') {
        const item = itemsRef.current.find((i) => i.id === dragging.id);
        if (item?.points[0]) { const { x: cx, y: cy } = item.points[0]; setItems((prev) => prev.map((i) => i.id === dragging.id ? { ...i, direction: Math.atan2(wp.y - cy, wp.x - cx) * 180 / Math.PI } : i)); }
      } else if (dragging.mode === 'RESIZE') {
        const item = itemsRef.current.find((i) => i.id === dragging.id);
        if (item?.points[0]) { const { x: cx, y: cy } = item.points[0]; setItems((prev) => prev.map((i) => i.id === dragging.id ? { ...i, fovRange: Math.max(30, Math.hypot(wp.x - cx, wp.y - cy)) } : i)); }
      }
    }

    if ((dragPal || dragSensor || dragDevice) && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setDropPrev({ x: e.clientX - r.left, y: e.clientY - r.top });
    }
  };

  const handleContainerMouseUp = () => {
    dragStart.current = null;
    setIsDraggingMap(false);
    if (dragging) { commit(itemsRef.current, itemsRef.current); setDragging(null); }
  };

  /* SVG 클릭 (꺾은선 점 추가) */
  const handleSvgClick = (e: React.MouseEvent) => {
    const dl = drawingRef.current;
    if (!dl) {
      // 그리기 모드 아닐 때 SVG 빈 배경 클릭 → deselect (버블링 차단)
      if (e.target === e.currentTarget || (e.target as SVGElement).tagName === 'svg') {
        setSelectedId(null);
      }
      return;
    }
    e.stopPropagation();
    const wp = toWorld(e.clientX, e.clientY);
    setDrawingLine({ ...dl, points: [...dl.points, wp] });
  };
  const handleSvgDblClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const dl = drawingRef.current;
    if (dl) finishLine(dl, true);
  };
  const handleContainerClick = (e: React.MouseEvent) => {
    // 아이템 위 클릭이 버블링된 경우는 무시 — 컨테이너 배경 직접 클릭만 처리
    if (e.target !== e.currentTarget) return;
    if (!drawingRef.current) setSelectedId(null);
  };

  /* 아이템 mousedown */
  const handleItemMouseDown = (e: React.MouseEvent, item: PlacedItem) => {
    if (drawingRef.current) return;
    e.stopPropagation();
    setSelectedId(item.id);
    const wp = toWorld(e.clientX, e.clientY);
    setDragging({ id: item.id, mode: 'MOVE', ox: wp.x, oy: wp.y, pts: item.points });
  };
  const handleDirectionDown = (e: React.MouseEvent, item: PlacedItem) => { e.stopPropagation(); setSelectedId(item.id); const wp = toWorld(e.clientX, e.clientY); setDragging({ id: item.id, mode: 'ROTATE', ox: wp.x, oy: wp.y, pts: item.points }); };
  const handleRangeDown     = (e: React.MouseEvent, item: PlacedItem) => { e.stopPropagation(); setSelectedId(item.id); const wp = toWorld(e.clientX, e.clientY); setDragging({ id: item.id, mode: 'RESIZE', ox: wp.x, oy: wp.y, pts: item.points }); };
  const handleItemRightClick = (e: React.MouseEvent, item: PlacedItem) => { if (drawingRef.current) return; e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, id: item.id }); setSelectedId(item.id); };

  /* 팔레트 드롭 */
  const handleMapDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setDropPrev({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const handleMapDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const wp = toWorld(e.clientX, e.clientY);

    /* 장비(Device) 드롭 */
    if (dragDevice) {
      const { device } = dragDevice;
      const alreadyPlaced = itemsRef.current.some((i) => i.deviceId === device.id);
      if (!alreadyPlaced) {
        const newItem: PlacedItem = {
          id: uid(), kind: 'DEVICE', label: device.deviceName,
          color: deviceColor(device.pluginType), points: [wp],
          deviceId: device.id, devicePluginType: device.pluginType,
        };
        commit([...itemsRef.current, newItem], itemsRef.current);
        setSelectedId(newItem.id);
      }
      setDragDevice(null); setDropPrev(null); return;
    }

    if (dragSensor) {
      const { sensor } = dragSensor;
      if (sensor.mapPlacement === 'LINE') {
        setDrawingLine({ sensorId: sensor.id, label: sensor.label, color: sensorColor('LINE'), points: [wp] });
        markSensorPlaced(sensor.id, true);
      } else {
        const next = [...itemsRef.current, { id: uid(), kind: 'SENSOR' as ItemKind, label: sensor.label, color: sensorColor(sensor.mapPlacement), points: [wp], sensorId: sensor.id, placementType: sensor.mapPlacement }];
        commit(next, itemsRef.current); markSensorPlaced(sensor.id, true);
      }
      setDragSensor(null); setDropPrev(null); return;
    }
    if (dragPal) {
      const isCamera = dragPal.kind === 'CAMERA';
      const newItem: PlacedItem = {
        id: uid(),
        kind: dragPal.kind,
        label: dragPal.label,
        color: dragPal.color,
        iconType: dragPal.iconType,
        points: [wp],
        ...(isCamera ? DEFAULT_CAM : {}),
        ...(dragPal.cameraId ? { cameraId: dragPal.cameraId } : {}),
        ...(dragPal.doorDeviceId ? { doorDeviceId: dragPal.doorDeviceId } : {}),
      };
      const next = [...itemsRef.current, newItem];
      commit(next, itemsRef.current);
      if (isCamera) setSelectedId(newItem.id);
      setDragPal(null); setDropPrev(null);
    }
  };

  const mapRow = MOCK_MAPS.find((m) => m.id === selectedMap);
  const selItem = items.find((i) => i.id === selectedId);
  const isDrawing = !!drawingLine;
  const isCamSelected = selItem?.kind === 'CAMERA';
  const isDevSelected = selItem?.kind === 'DEVICE';

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', background: '#070F24' }}>

      {/* ══ 좌측 툴바 ══ */}
      <div style={{ width: 48, background: '#0A1428', borderRight: '1px solid #1E3A5F', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 4, flexShrink: 0 }}>
        <Tooltip title="확대" placement="right"><button onClick={zoomIn} style={toolBtn()}><PlusOutlined /></button></Tooltip>
        <Tooltip title="축소" placement="right"><button onClick={zoomOut} style={toolBtn()}><MinusOutlined /></button></Tooltip>
        <Tooltip title="화면 맞춤" placement="right"><button onClick={resetView} style={toolBtn()}><FullscreenOutlined /></button></Tooltip>
        <div style={{ width: 28, height: 1, background: '#1E3A5F', margin: '4px 0' }} />
        <Tooltip title="실행취소 (Ctrl+Z)" placement="right"><button onClick={undo} disabled={histIdx <= 0} style={toolBtn(histIdx <= 0)}><UndoOutlined /></button></Tooltip>
        <Tooltip title="다시실행" placement="right"><button onClick={redo} disabled={histIdx >= history.length - 1} style={toolBtn(histIdx >= history.length - 1)}><RedoOutlined /></button></Tooltip>
        <div style={{ flex: 1 }} />
        {selectedId && !isDrawing && (
          <Tooltip title="삭제 (Del)" placement="right">
            <button onClick={() => { commit(itemsRef.current.filter((i) => i.id !== selectedId), itemsRef.current); setSelectedId(null); }}
              style={{ ...toolBtn(), background: '#7F1D1D', color: '#FCA5A5', marginBottom: 4 }}><DeleteOutlined /></button>
          </Tooltip>
        )}
        <Tooltip title="저장 (모니터링에 반영)" placement="right">
          <button
            onClick={() => { saveMapItems(selectedMap, itemsRef.current); }}
            style={{ ...toolBtn(), background: '#1E40AF', color: '#93C5FD', marginBottom: 4 }}>💾</button>
        </Tooltip>
      </div>

      {/* ══ 맵 캔버스 ══ */}
      <div
        ref={containerRef}
        style={{
          flex: 1, minWidth: 0, minHeight: 0, position: 'relative', overflow: 'hidden',
          cursor: isDrawing ? 'crosshair' : isDraggingMap ? 'grabbing' : 'grab',
          background: '#030810', userSelect: 'none',
        }}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleContainerMouseUp}
        onMouseLeave={handleContainerMouseUp}
        onClick={handleContainerClick}
        onDragOver={handleMapDragOver}
        onDrop={handleMapDrop}
      >
        {/* 변환 래퍼 (Monitor.tsx와 동일) */}
        <div style={{
          position: 'absolute', transformOrigin: '0 0',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: isDraggingMap ? 'none' : 'transform 0.08s ease-out',
          willChange: 'transform',
        }}>
          {/* 배경 이미지 (자연 크기) */}
          <img
            ref={mapImgRef}
            src={mapRow?.imageUrl}
            alt={mapRow?.mapName}
            onLoad={handleImgLoad}
            style={{ display: 'block', maxWidth: 'none', userSelect: 'none', pointerEvents: 'none', filter: 'brightness(0.88) contrast(1.05)' }}
            draggable={false}
          />

          {/* SVG 오버레이 (이미지와 동일 크기) */}
          {mapDims.w > 0 && (
            <svg
              ref={svgRef}
              style={{ position: 'absolute', top: 0, left: 0, width: mapDims.w, height: mapDims.h, overflow: 'visible' }}
              onClick={handleSvgClick}
              onDoubleClick={handleSvgDblClick}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* 카메라 FOV */}
              {items.filter((i) => i.kind === 'CAMERA').map((item) => (
                <CameraFov key={`fov-${item.id}`} item={item} selected={item.id === selectedId}
                  onDirectionDown={(e) => handleDirectionDown(e, item)}
                  onRangeDown={(e) => handleRangeDown(e, item)} />
              ))}

              {/* 배치된 아이템 */}
              {items.map((item) => {
                const sel = item.id === selectedId;
                const md = (e: React.MouseEvent) => handleItemMouseDown(e, item);
                const rc = (e: React.MouseEvent) => handleItemRightClick(e, item);
                if (item.placementType === 'LINE' && item.points.length >= 2)
                  return <LineItem key={item.id} item={item} selected={sel} onMouseDown={md} onContextMenu={rc} />;
                return <IconMarker key={item.id} item={item} selected={sel} onMouseDown={md} onContextMenu={rc} />;
              })}

              {/* 꺾은선 드로잉 프리뷰 */}
              {drawingLine && (() => {
                const dl = drawingLine;
                const pp = cursorWorld ? [...dl.points, cursorWorld] : dl.points;
                return (
                  <g style={{ pointerEvents: 'none' }}>
                    {dl.points.length >= 2 && <polyline points={ptStr(dl.points)} fill="none" stroke={dl.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />}
                    {pp.length >= 2 && <polyline points={ptStr(pp)} fill="none" stroke={dl.color} strokeWidth={2} strokeDasharray="8,5" strokeLinecap="round" opacity={0.65} />}
                    {dl.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 6 : 4} fill={i === 0 ? dl.color : '#fff'} stroke={dl.color} strokeWidth={2} />)}
                    {cursorWorld && <circle cx={cursorWorld.x} cy={cursorWorld.y} r={4} fill="none" stroke={dl.color} strokeWidth={1.5} strokeDasharray="3,2" />}
                    {dl.points[0] && <text x={dl.points[0].x + 8} y={dl.points[0].y - 10} fontSize={10} fill={dl.color} fontWeight={700} style={{ textShadow: '0 1px 4px rgba(0,0,0,.9)' }}>{dl.label}</text>}
                  </g>
                );
              })()}

              {/* 드롭 프리뷰 (스크린 → 이미지 좌표 변환) */}
              {(dragPal || dragSensor || dragDevice) && dropPrev && (() => {
                const wx = (dropPrev.x - offset.x) / scale;
                const wy = (dropPrev.y - offset.y) / scale;
                let color: string, iconNode: React.ReactNode;
                if (dragDevice) {
                  color = deviceColor(dragDevice.device.pluginType);
                  iconNode = deviceIcon(dragDevice.device.pluginType);
                } else if (dragSensor) {
                  color = sensorColor(dragSensor.sensor.mapPlacement);
                  iconNode = sensorIcon(dragSensor.sensor.mapPlacement);
                } else {
                  color = dragPal?.color ?? '#888';
                  iconNode = dragPal?.icon ?? <VideoCameraOutlined />;
                }
                return (
                  <g transform={`translate(${wx},${wy})`} style={{ pointerEvents: 'none' }} opacity={0.72}>
                    <circle r={15} fill={color} stroke="#fff" strokeWidth={1.5} strokeDasharray="4,3" />
                    <foreignObject x={-8} y={-8} width={16} height={16} style={{ overflow: 'visible' }}>
                      <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>{iconNode}</div>
                    </foreignObject>
                  </g>
                );
              })()}
            </svg>
          )}
        </div>

        {/* HUD 코너 브라켓 */}
        {['tl','tr','bl','br'].map((pos) => (
          <div key={pos} className={`hud-corner hud-corner--${pos}`} />
        ))}

        {/* 그리기 안내 바 */}
        {isDrawing && (
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(14,30,76,.92)', color: '#60A5FA', padding: '7px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #2563EB', zIndex: 10, whiteSpace: 'nowrap', backdropFilter: 'blur(6px)', boxShadow: '0 0 16px rgba(37,99,235,.4)' }}>
            <span style={{ color: '#2563EB', marginRight: 6 }}>〰</span>
            <b style={{ color: '#e2e8f0' }}>{drawingLine?.label}</b>
            <span style={{ color: '#64748b', marginLeft: 8 }}>클릭: 꼭짓점 추가 ({drawingLine?.points.length}개)</span>
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>더블클릭/Enter: 완료</span>
            <span style={{ color: '#EF4444', marginLeft: 8, cursor: 'pointer' }}
              onClick={() => { if (drawingLine) markSensorPlaced(drawingLine.sensorId, false); setDrawingLine(null); setCursorWorld(null); }}>
              ESC: 취소
            </span>
          </div>
        )}

        {/* 미니맵 (확대 시) */}
        {scale > 1.05 && mapDims.w > 0 && mapRow?.imageUrl && (
          <MinimapNav
            image={mapRow.imageUrl}
            mapW={mapDims.w} mapH={mapDims.h}
            containerW={containerRef.current?.clientWidth ?? containerDims.w}
            containerH={containerRef.current?.clientHeight ?? containerDims.h}
            scale={scale} offset={offset}
            onNavigate={(x, y) => setOffset(clampOffset(x, y, scale))}
          />
        )}

        {/* 줌 컨트롤 */}
        <div style={{ position: 'absolute', right: 12, bottom: 36, zIndex: 5, display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={zoomOut} style={floatBtn()}>−</button>
          <div style={{ background: 'rgba(7,15,36,.85)', border: '1px solid #1E3A5F', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#64748b', minWidth: 52, textAlign: 'center', fontFamily: 'monospace' }}>
            {Math.round(scale * 100)}%
          </div>
          <button onClick={zoomIn} style={floatBtn()}>+</button>
          <button onClick={resetView} style={{ ...floatBtn(), marginLeft: 2 }}>⌂</button>
        </div>

        {/* 하단 상태 바 */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(7,15,36,.95)', borderTop: '1px solid #1E3A5F', padding: '5px 14px', display: 'flex', gap: 16, alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: '#94a3b8' }}>배치: <b style={{ color: '#e2e8f0' }}>{items.length}</b></span>
          {selItem && !isDrawing && (
            <span style={{ color: selItem.color, fontWeight: 700 }}>
              {selItem.label}
              {isCamSelected && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>방향:{Math.round(normDeg(selItem.direction ?? 0))}° · 화각:{selItem.fovAngle ?? 90}° · <span style={{ color: '#60A5FA' }}>●</span> 방향조절 <span style={{ color: '#94a3b8' }}>○</span> 범위조절</span>}
              {!isCamSelected && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>드래그:이동 · Del:삭제 · 우클릭:메뉴</span>}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ color: '#64748b' }}>{mapRow?.mapName} · 휠:줌 · 드래그:이동</span>
        </div>

        {/* 컨텍스트 메뉴 */}
        {ctxMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setCtxMenu(null)} />
            <div style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, background: '#0F2040', border: '1px solid #1E3A5F', borderRadius: 8, zIndex: 1000, minWidth: 160, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.7)' }}>
              {[
                { label: '✏️  레이블 편집', action: () => { const it = items.find((i) => i.id === ctxMenu.id); if (it) setRenameModal({ id: it.id, label: it.label }); setCtxMenu(null); }},
                { label: '⬆️  맨 앞으로', action: () => { setItems((prev) => { const i = prev.findIndex((x) => x.id === ctxMenu.id); if (i < 0) return prev; const n = [...prev]; n.push(n.splice(i, 1)[0]); return n; }); setCtxMenu(null); }},
                { label: '⬇️  맨 뒤로', action: () => { setItems((prev) => { const i = prev.findIndex((x) => x.id === ctxMenu.id); if (i < 0) return prev; const n = [...prev]; n.unshift(n.splice(i, 1)[0]); return n; }); setCtxMenu(null); }},
                { label: '🗑️  삭제', action: () => { commit(itemsRef.current.filter((i) => i.id !== ctxMenu.id), itemsRef.current); setSelectedId(null); setCtxMenu(null); }},
              ].map((m, i) => (
                <button key={i} onClick={m.action} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 16px', color: '#e2e8f0', fontSize: 13, borderBottom: i < 3 ? '1px solid #1E3A5F' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1E3A5F')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                  {m.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══ 우측 패널 ══ */}
      <div style={{ width: 248, background: '#0A1428', borderLeft: '1px solid #1E3A5F', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, minHeight: 0 }}>
        {/* 맵 선택 */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E3A5F', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, letterSpacing: 1 }}>MAP</div>
          <Select value={selectedMap}
            onChange={(v) => { setSelectedMap(v); setItems([]); setScale(1); setOffset({ x: 0, y: 0 }); setMapDims({ w: 0, h: 0 }); }}
            style={{ width: '100%' }} size="small"
            options={MOCK_MAPS.map((m) => ({ label: m.mapName, value: m.id }))} />
        </div>

        {/* 장비 상태 정보 패널 (DEVICE 선택 시) */}
        {isDevSelected && selItem && (() => {
          const device = devices.find((d) => d.id === selItem.deviceId);
          if (!device) return null;
          const statusC = deviceStatusColor(device.status);
          const devSensors = device.sensors.filter((s) => s.active);
          const placedSensors = devSensors.filter((s) => items.some((i) => i.sensorId === s.id));
          return (
            <div style={{ padding: '12px', borderBottom: '1px solid #1E3A5F', background: 'linear-gradient(135deg, #1A0E00 0%, #0C1310 100%)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{deviceEmoji(device.pluginType)}</span>
                <div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700 }}>{device.deviceName}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{device.pluginType}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusC }} />
                  <span style={{ fontSize: 10, color: statusC, fontWeight: 600 }}>{device.status ?? 'unknown'}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                <div style={{ background: '#070F24', borderRadius: 4, padding: '5px 8px' }}>
                  <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>IP</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{device.ip}:{device.port}</div>
                </div>
                <div style={{ background: '#070F24', borderRadius: 4, padding: '5px 8px' }}>
                  <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>센서</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{placedSensors.length}/{devSensors.length} 배치됨</div>
                </div>
                {device.cableLength != null && (
                  <div style={{ background: '#070F24', borderRadius: 4, padding: '5px 8px', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>케이블 길이</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{device.cableLength}m</div>
                  </div>
                )}
              </div>
              <div style={{ background: '#070F24', borderRadius: 4, padding: '6px 8px' }}>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 4, letterSpacing: 0.5 }}>장비 이벤트 (모의)</div>
                {[
                  { time: '14:32', msg: '정상 운영 중', color: '#22C55E' },
                  { time: '09:15', msg: 'Zone 3 동작 감지', color: '#F59E0B' },
                  { time: '08:02', msg: '장비 연결 확인', color: '#3B82F6' },
                ].map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', flexShrink: 0 }}>{ev.time}</span>
                    <span style={{ fontSize: 9, color: ev.color }}>{ev.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 카메라 FOV 설정 */}
        {isCamSelected && selItem && (
          <div style={{ padding: '14px', borderBottom: '1px solid #1E3A5F', background: 'linear-gradient(135deg, #0A1E3D 0%, #0C1733 100%)', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#60A5FA', marginBottom: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <VideoCameraOutlined /><span>{selItem.label} — 시야 설정</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 5, fontWeight: 600 }}>방향 (°)</div>
                <InputNumber size="small" min={0} max={360} value={Math.round(normDeg(selItem.direction ?? DEFAULT_CAM.direction))}
                  onChange={(v) => updateItemProp(selItem.id, 'direction', v ?? 0)} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 5, fontWeight: 600 }}>화각 (°)</div>
                <InputNumber size="small" min={10} max={180} value={selItem.fovAngle ?? DEFAULT_CAM.fovAngle}
                  onChange={(v) => updateItemProp(selItem.id, 'fovAngle', v ?? 90)} style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 5, fontWeight: 600 }}>감시 범위 (px)</div>
                <InputNumber size="small" min={20} max={400} value={Math.round(selItem.fovRange ?? DEFAULT_CAM.fovRange)}
                  onChange={(v) => updateItemProp(selItem.id, 'fovRange', v ?? 120)} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width={52} height={52} viewBox="-26 -26 52 52">
                <circle r={24} fill="#070F24" stroke="#1E3A5F" strokeWidth={1} />
                {['N','E','S','W'].map((d, i) => { const a = i * 90 - 90; return <text key={d} x={17 * Math.cos(deg2rad(a))} y={17 * Math.sin(deg2rad(a))} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="#64748b">{d}</text>; })}
                {(() => {
                  const dir = selItem.direction ?? DEFAULT_CAM.direction;
                  const half = (selItem.fovAngle ?? DEFAULT_CAM.fovAngle) / 2;
                  const r = 20;
                  const lRad = deg2rad(dir - half), rRad = deg2rad(dir + half);
                  const lx = r * Math.cos(lRad), ly = r * Math.sin(lRad);
                  const rx = r * Math.cos(rRad), ry = r * Math.sin(rRad);
                  const la = half * 2 > 180 ? 1 : 0;
                  return (<><path d={`M 0 0 L ${lx} ${ly} A ${r} ${r} 0 ${la} 1 ${rx} ${ry} Z`} fill={selItem.color} fillOpacity={0.35} stroke={selItem.color} strokeWidth={1.5} /><circle r={3} fill={selItem.color} opacity={0.9} /></>);
                })()}
              </svg>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 2 }}>
                <div>● 드래그: 방향 조절</div><div>○ 드래그: 범위 조절</div>
              </div>
            </div>
          </div>
        )}

        {/* ── 아이템 속성 패널 (선택 시) ── */}
        {selItem && !isDrawing && (
          <div style={{ padding: '14px', borderBottom: '1px solid #1E3A5F', background: '#070F24', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <SettingOutlined /><span>속성 — <span style={{ color: selItem.color }}>{selItem.label}</span></span>
            </div>

            {/* 아이콘 크기 (LINE 제외) */}
            {selItem.placementType !== 'LINE' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>아이콘 크기</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="range" min={0.4} max={2.5} step={0.1}
                    value={selItem.size ?? 1}
                    onChange={(e) => updateItemProp(selItem.id, 'size', parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: selItem.color, cursor: 'pointer' }} />
                  <span style={{ fontSize: 12, color: '#e2e8f0', minWidth: 36, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                    ×{((selItem.size ?? 1)).toFixed(1)}
                  </span>
                  <button onClick={() => updateItemProp(selItem.id, 'size', 1)}
                    style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: '1px solid #334155', borderRadius: 4, cursor: 'pointer', padding: '2px 8px' }}>↺</button>
                </div>
              </div>
            )}

            {/* 선 굵기 (LINE만) */}
            {selItem.placementType === 'LINE' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>선 굵기 (px)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="range" min={1} max={12} step={0.5}
                    value={selItem.lineWidth ?? 3}
                    onChange={(e) => updateItemProp(selItem.id, 'lineWidth', parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: selItem.color, cursor: 'pointer' }} />
                  <InputNumber size="small" min={1} max={12} step={0.5}
                    value={selItem.lineWidth ?? 3}
                    onChange={(v) => updateItemProp(selItem.id, 'lineWidth', v ?? 3)}
                    style={{ width: 64 }} />
                </div>
              </div>
            )}

            {/* 레이블 표시/숨기기 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>레이블 표시</span>
              <button
                onClick={() => updateItemProp(selItem.id, 'labelVisible', !(selItem.labelVisible !== false))}
                style={{
                  fontSize: 12, padding: '4px 12px', borderRadius: 5, cursor: 'pointer', border: 'none',
                  background: selItem.labelVisible !== false ? selItem.color + '33' : '#1E3A5F',
                  color: selItem.labelVisible !== false ? selItem.color : '#94a3b8',
                  fontWeight: 700,
                }}>
                {selItem.labelVisible !== false ? '표시 중' : '숨김'}
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: '8px 12px', borderBottom: '1px solid #1E3A5F', flexShrink: 0 }}>
          <Input
            allowClear
            size="small"
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            placeholder="장비·센서 검색"
            prefix={<SearchOutlined style={{ color: '#475569', fontSize: 12 }} />}
            style={{ width: '100%' }}
          />
        </div>

        {/* 팔레트 (스크롤) */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 12px' }}>
          <GroupHeader label="등록된 카메라" />
          {filteredCameras.length === 0 ? (
            <div style={{ color: '#334155', fontSize: 10, padding: '4px 0 8px' }}>{isPaletteSearching ? '검색 결과 없음' : '등록된 카메라 없음'}</div>
          ) : filteredCameras.map((pal) => (
            <PalRow key={pal.paletteId} icon={pal.icon} label={pal.label} color={pal.color} subLabel={pal.subLabel}
              isDragging={dragPal?.paletteId === pal.paletteId}
              onDragStart={() => setDragPal(pal)} onDragEnd={() => { setDragPal(null); setDropPrev(null); }} />
          ))}
          <GroupHeader label="등록된 출입통제" style={{ marginTop: 10 }} />
          {filteredDoors.length === 0 ? (
            <div style={{ color: '#334155', fontSize: 10, padding: '4px 0 8px' }}>{isPaletteSearching ? '검색 결과 없음' : '등록된 출입 장비 없음'}</div>
          ) : filteredDoors.map((pal) => (
            <PalRow key={pal.paletteId} icon={pal.icon} label={pal.label} color={pal.color} subLabel={pal.subLabel}
              isDragging={dragPal?.paletteId === pal.paletteId}
              onDragStart={() => setDragPal(pal)} onDragEnd={() => { setDragPal(null); setDropPrev(null); }} />
          ))}

          {filteredSensorDevices.length > 0 && (
            <>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #1E3A5F', fontSize: 9, color: '#2563EB', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>등록된 센서</div>
              {filteredSensorDevices.map(({ device, sensors: activeSensors }) => {
                const isExpanded = isPaletteSearching || expandedDevIds.includes(device.id);
                const placedCount = activeSensors.filter((s) => items.some((i) => i.sensorId === s.id)).length;
                const devicePlaced = items.some((i) => i.deviceId === device.id);
                const devColor = deviceColor(device.pluginType);
                const devIconNode = deviceIcon(device.pluginType);
                const statusColor = deviceStatusColor(device.status);
                return (
                  <div key={device.id} style={{ marginBottom: 4 }}>
                    {/* 장비 헤더: 클릭=펼치기, 드래그=맵배치 */}
                    <div
                      draggable={!devicePlaced}
                      onDragStart={(e) => { if (!devicePlaced) { e.stopPropagation(); setDragDevice({ device }); }}}
                      onDragEnd={() => { setDragDevice(null); setDropPrev(null); }}
                      onClick={() => !isPaletteSearching && toggleDevice(device.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
                        borderRadius: 6,
                        cursor: devicePlaced ? 'pointer' : 'grab',
                        background: isExpanded ? '#0F1E3D' : 'rgba(30,58,95,.18)',
                        border: `1px solid ${isExpanded ? devColor + '55' : '#1E3A5F'}`,
                        borderLeft: `3px solid ${devicePlaced ? statusColor : (isExpanded ? devColor : '#334155')}`,
                        userSelect: 'none', transition: 'all .15s',
                        opacity: devicePlaced && dragDevice?.device.id === device.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#0F1E3D'; }}
                      onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'rgba(30,58,95,.18)'; }}
                    >
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: devColor + '22', border: `1px solid ${devColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: devColor, flexShrink: 0 }}>{devIconNode}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.deviceName}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{device.pluginType}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        {devicePlaced
                          ? <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 11 }} />
                          : <DragOutlined style={{ color: '#334155', fontSize: 10 }} />
                        }
                        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                          {placedCount > 0 && <span style={{ fontSize: 9, color: '#16A34A' }}>S:{placedCount}</span>}
                          {!isPaletteSearching && (isExpanded
                            ? <DownOutlined style={{ fontSize: 8, color: '#2563EB' }} />
                            : <RightOutlined style={{ fontSize: 8, color: '#475569' }} />
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ marginLeft: 8, marginTop: 2, paddingLeft: 8, borderLeft: '1px solid #1E3A5F' }}>
                        {activeSensors.map((sensor) => {
                          const placedOnMap = items.some((i) => i.sensorId === sensor.id);
                          const isLine = sensor.mapPlacement === 'LINE';
                          const color = sensorColor(sensor.mapPlacement);
                          const sensorIconNode = sensorIcon(sensor.mapPlacement);
                          return (
                            <div key={sensor.id} draggable={!placedOnMap}
                              onDragStart={() => !placedOnMap && setDragSensor({ sensor })}
                              onDragEnd={() => { setDragSensor(null); setDropPrev(null); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 7px', borderRadius: 5, marginBottom: 2, cursor: placedOnMap ? 'default' : 'grab', background: dragSensor?.sensor.id === sensor.id ? '#1E3A5F' : 'transparent', border: `1px solid ${placedOnMap ? '#1E3A5F' : color + '44'}`, opacity: placedOnMap ? 0.45 : 1, userSelect: 'none', transition: 'all .12s' }}
                              onMouseEnter={(e) => { if (!placedOnMap) { e.currentTarget.style.background = '#0F1E3D'; e.currentTarget.style.borderColor = color + '88'; }}}
                              onMouseLeave={(e) => { if (dragSensor?.sensor.id !== sensor.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = placedOnMap ? '#1E3A5F' : color + '44'; }}}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', background: color + '25', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color, flexShrink: 0 }}>{sensorIconNode}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 10, color: '#c1cfe8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sensor.label}</div>
                                <div style={{ fontSize: 9, color: isLine ? '#2563EB' : '#475569' }}>
                                  {sensor.mapPlacement}{isLine && <span style={{ color: '#334155' }}> · 꺾은선</span>}
                                  {sensor.startMeter != null ? ` · ${sensor.startMeter}~${sensor.endMeter}m` : ''}
                                </div>
                              </div>
                              {placedOnMap ? <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 11, flexShrink: 0 }} /> : <DragOutlined style={{ color: '#334155', fontSize: 10, flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {isPaletteSearching && filteredSensorDevices.length === 0 && (
            <div style={{ marginTop: 8, color: '#334155', fontSize: 10 }}>센서 검색 결과 없음</div>
          )}
        </div>

        {/* 배치 목록 */}
        <div style={{ borderTop: '1px solid #1E3A5F', padding: '8px 12px', maxHeight: 160, overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, letterSpacing: 1, fontWeight: 700 }}>배치 목록 ({items.length})</div>
          {items.length === 0 ? (
            <div style={{ color: '#334155', fontSize: 11, textAlign: 'center', padding: '8px 0' }}>아직 배치된 아이템 없음</div>
          ) : items.map((item) => (
            <div key={item.id} onClick={() => setSelectedId(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4, cursor: 'pointer', marginBottom: 2, background: selectedId === item.id ? '#1E3A5F' : 'transparent' }}>
              <div style={{ width: item.placementType === 'LINE' ? 14 : 7, height: 7, borderRadius: item.placementType === 'LINE' ? 2 : '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#c1cfe8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              <Tag style={{ fontSize: 9, padding: '0 4px', background: 'transparent', color: '#475569', border: '1px solid #334155', margin: 0 }}>{item.kind === 'CAMERA' ? 'CAM' : item.placementType ?? item.kind}</Tag>
              <button onClick={(e) => { e.stopPropagation(); commit(itemsRef.current.filter((i) => i.id !== item.id), itemsRef.current); if (selectedId === item.id) setSelectedId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, fontSize: 12 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* 레이블 편집 모달 */}
      <Modal open={!!renameModal} title="레이블 편집" okText="확인" cancelText="취소"
        onCancel={() => setRenameModal(null)}
        onOk={() => { if (!renameModal) return; commit(itemsRef.current.map((i) => i.id === renameModal.id ? { ...i, label: renameModal.label } : i), itemsRef.current); setRenameModal(null); }}>
        <Input value={renameModal?.label ?? ''} autoFocus onChange={(e) => setRenameModal((prev) => prev ? { ...prev, label: e.target.value } : null)} />
      </Modal>
    </div>
  );
};

/* ── 스타일 헬퍼 ── */
const toolBtn = (disabled = false): React.CSSProperties => ({
  width: 36, height: 36, border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
  background: 'transparent', color: disabled ? '#334155' : '#94a3b8',
  fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
});
const floatBtn = (): React.CSSProperties => ({
  width: 26, height: 26, border: '1px solid #1E3A5F', borderRadius: 4,
  background: 'rgba(7,15,36,.85)', color: '#64748b', cursor: 'pointer',
  fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
});
const GroupHeader: React.FC<{ label: string; style?: React.CSSProperties }> = ({ label, style }) => (
  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 700, letterSpacing: 1, ...style }}>{label}</div>
);

export default ZonesPage;
