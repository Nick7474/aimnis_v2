/* ════════════════════════════════════════════════════
   AIM Monitoring — Chart Primitives
   Reusable SVG charts with proper axes, 2px strokes
════════════════════════════════════════════════════ */
(function(){
const { useId, useRef, useState, useEffect } = React;

/* 선명한 원본 팔레트 (첨부 기준) */
const C = {
  blue:'#3b82f6', cyan:'#38bdf8', green:'#22c55e', yellow:'#eab308',
  red:'#ef4444', purple:'#a855f7', orange:'#f97316', pink:'#ec4899',
  grid:'rgba(255,255,255,.06)', axis:'rgba(255,255,255,.18)',
  t2:'#94a3b8', t3:'#64748b', t4:'#475569',
};

/* ── LINE CHART (responsive, no distortion) ──────── */
const LineChart = ({ data, color=C.cyan, yUnit='', xLabels=[], yTicks=4, area=true, smooth=true, dots=false, bare=false }) => {
  const uid = useId().replace(/:/g,'');
  const box = useRef(null);
  const [sz,setSz] = useState({w:320,h:140});
  useEffect(()=>{
    if(!box.current) return;
    const ro = new ResizeObserver(es=>{ for(const e of es){ const r=e.contentRect; setSz({w:Math.max(60,Math.round(r.width)),h:Math.max(50,Math.round(r.height))}); } });
    ro.observe(box.current);
    return ()=>ro.disconnect();
  },[]);
  const W = sz.w, H = sz.h;
  const padL = bare?4:30, padR = bare?6:12, padT = bare?10:12, padB = bare?6:19;
  const cw = Math.max(1, W - padL - padR), ch = Math.max(1, H - padT - padB);
  const max = Math.max(...data) * 1.08;
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const xs = data.map((_,i)=> padL + (i/(data.length-1))*cw);
  const ys = data.map(v=> padT + ch - ((v-min)/range)*ch);

  const path = (()=>{
    if(!smooth || data.length<3) return xs.map((x,i)=>`${i?'L':'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    let d = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
    for(let i=0;i<xs.length-1;i++){
      const x0=xs[i-1]??xs[i], y0=ys[i-1]??ys[i];
      const x1=xs[i], y1=ys[i], x2=xs[i+1], y2=ys[i+1];
      const x3=xs[i+2]??x2, y3=ys[i+2]??y2;
      const c1x=x1+(x2-x0)/6, c1y=y1+(y2-y0)/6;
      const c2x=x2-(x3-x1)/6, c2y=y2-(y3-y1)/6;
      d+=` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
    }
    return d;
  })();
  const areaPath = `${path} L${xs[xs.length-1].toFixed(1)},${(padT+ch).toFixed(1)} L${padL},${(padT+ch).toFixed(1)} Z`;
  const yTickVals = Array.from({length:yTicks+1},(_,i)=> min + (range/yTicks)*i);
  const fs = W<260 ? 8 : 9;

  return (
    <div ref={box} style={{width:'100%',height:'100%',minHeight:0}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:'block'}}>
        <defs>
          <linearGradient id={`area${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {!bare && yTickVals.map((v,i)=>{
          const y = padT + ch - (i/yTicks)*ch;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W-padR} y2={y} stroke={C.grid} strokeWidth="1"/>
              <text x={padL-5} y={y+3} fontSize={fs} fill={C.t4} textAnchor="end" fontFamily="'DM Mono',monospace">{Math.round(v)}{yUnit}</text>
            </g>
          );
        })}
        {!bare && xLabels.map((lb,i)=>{
          const x = padL + (i/(xLabels.length-1))*cw;
          return <text key={i} x={x} y={H-6} fontSize={fs} fill={C.t4} textAnchor="middle" fontFamily="'DM Mono',monospace">{lb}</text>;
        })}
        {area && <path d={areaPath} fill={`url(#area${uid})`}/>}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {dots && xs.map((x,i)=>(<circle key={i} cx={x} cy={ys[i]} r="2.5" fill="#0f1420" stroke={color} strokeWidth="1.5"/>))}
        <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3.2" fill={color}/>
        <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="6" fill={color} opacity="0.22"/>
      </svg>
    </div>
  );
};

/* ── BAR CHART (FFT spectrum, responsive) ────────── */
const BarChart = ({ data, colorFn, xLabels=[], yUnit='' }) => {
  const box = useRef(null);
  const [sz,setSz] = useState({w:320,h:140});
  useEffect(()=>{
    if(!box.current) return;
    const ro = new ResizeObserver(es=>{ for(const e of es){ const r=e.contentRect; setSz({w:Math.max(60,Math.round(r.width)),h:Math.max(50,Math.round(r.height))}); } });
    ro.observe(box.current); return ()=>ro.disconnect();
  },[]);
  const W=sz.w, H=sz.h, padL=28, padR=8, padT=10, padB=18;
  const cw=Math.max(1,W-padL-padR), ch=Math.max(1,H-padT-padB);
  const max=Math.max(...data)*1.1;
  const bw=cw/data.length;
  const yTicks=3;
  const fs = W<260?8:9;
  return (
    <div ref={box} style={{width:'100%',height:'100%',minHeight:0}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:'block'}}>
        {Array.from({length:yTicks+1}).map((_,i)=>{
          const y=padT+ch-(i/yTicks)*ch;
          return <g key={i}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke={C.grid} strokeWidth="1"/>
            <text x={padL-5} y={y+3} fontSize={fs} fill={C.t4} textAnchor="end" fontFamily="'DM Mono',monospace">{Math.round((max/yTicks)*i)}{yUnit}</text>
          </g>;
        })}
        {data.map((v,i)=>{
          const h=(v/max)*ch;
          const x=padL+i*bw+bw*0.18;
          const col=colorFn?colorFn(v,i):C.cyan;
          return <rect key={i} x={x} y={padT+ch-h} width={Math.max(1,bw*0.64)} height={h} rx={Math.min(bw*0.3,3)} fill={col}/>;
        })}
        {xLabels.map((lb,i)=>{
          const x=padL+(i/(xLabels.length-1))*cw;
          return <text key={i} x={x} y={H-5} fontSize={fs} fill={C.t4} textAnchor="middle" fontFamily="'DM Mono',monospace">{lb}</text>;
        })}
      </svg>
    </div>
  );
};

/* ── DONUT / GAUGE ───────────────────────────────── */
const Gauge = ({ value, max=100, color=C.blue, size=104, label='', sub='', track='rgba(255,255,255,.07)', thickness=9 }) => {
  const r=(size-thickness)/2 - 2, cx=size/2, cy=size/2;
  const circ=2*Math.PI*r;
  const pct=Math.min(value/max,1);
  const uid=useId().replace(/:/g,'');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color}/>
          <stop offset="100%" stopColor={color} stopOpacity="0.55"/>
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={thickness}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#g${uid})`} strokeWidth={thickness} strokeLinecap="round"
        strokeDasharray={`${circ*pct} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} style={{transition:'stroke-dasharray .6s'}}/>
      <text x={cx} y={cy-1} fontSize="20" fontWeight="700" fill="#f1f5f9" textAnchor="middle" fontFamily="'DM Mono',monospace">{label}</text>
      {sub && <text x={cx} y={cy+14} fontSize="9" fill={C.t3} textAnchor="middle" letterSpacing="0.1em">{sub}</text>}
    </svg>
  );
};

/* ── HEATMAP GRID ────────────────────────────────── */
const Heatmap = ({ rows, cols, cells, gap=3, radius=3 }) => (
  <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${rows},1fr)`,gap,width:'100%',height:'100%'}}>
    {cells.map((c,i)=>(
      <div key={i} style={{background:c,borderRadius:radius,minHeight:0}}/>
    ))}
  </div>
);

/* ── PROGRESS ROW ────────────────────────────────── */
const ProgBar = ({ label, value, color=C.green, suffix='%' }) => (
  <div style={{marginBottom:11}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,gap:8}}>
      <span style={{fontSize:11,color:'var(--t2)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{label}</span>
      <span style={{fontSize:11,color:'#e2e8f0',fontFamily:"'DM Mono',monospace",fontWeight:500,flexShrink:0}}>{value}{suffix}</span>
    </div>
    <div style={{height:6,borderRadius:4,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
      <div style={{height:'100%',width:`${value}%`,borderRadius:4,background:`linear-gradient(90deg,${color},${color}cc)`,transition:'width .5s'}}/>
    </div>
  </div>
);

/* ── STAT TILE ───────────────────────────────────── */
const StatTile = ({ label, value, color='#e2e8f0', sub }) => (
  <div style={{flex:1,background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'13px 15px',minWidth:0}}>
    <div style={{fontSize:10,color:'var(--t3)',marginBottom:7,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{label}</div>
    <div style={{fontSize:22,fontWeight:700,color,fontFamily:"'DM Mono',monospace",letterSpacing:'-0.02em'}}>{value}</div>
    {sub && <div style={{fontSize:9,color:'var(--t4)',marginTop:3}}>{sub}</div>}
  </div>
);

window.AIMCharts = { C, LineChart, BarChart, Gauge, Heatmap, ProgBar, StatTile };
})();
