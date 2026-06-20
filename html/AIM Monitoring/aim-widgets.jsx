/* ════════════════════════════════════════════════════
   AIM Monitoring — 20 Widgets (full render + mini preview)
════════════════════════════════════════════════════ */
(function(){
const { useState, useEffect, useRef } = React;
const { C, LineChart, BarChart, Gauge, Heatmap, ProgBar, StatTile } = window.AIMCharts;

/* ── small icon helper ─────────────────────────── */
const I = {
  wave:<><path d="M2 12h3l2-7 4 14 3-9 2 4h6"/></>,
  bars:<><line x1="6" y1="20" x2="6" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></>,
  thermo:<><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></>,
  gas:<><path d="M12 2C8 6 6 9 6 13a6 6 0 0 0 12 0c0-4-2-7-6-11z"/></>,
  map:<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
  grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  battery:<><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="10" x2="23" y2="14"/></>,
  cpu:<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></>,
  brain:<><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></>,
  activity:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  alert:<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  report:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></>,
  heart:<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  fall:<><circle cx="12" cy="5" r="2"/><path d="M5 19l4-7 3 2 2-3 5 4"/></>,
  wifi:<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  play:<><polygon points="5 3 19 12 5 21 5 3"/></>,
  flag:<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
  check:<polyline points="20 6 9 17 4 12"/>,
  layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
};
const Ic = ({n,s=14,c='currentColor',sw=1.8})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{I[n]}</svg>
);

/* ── WIDGET CARD SHELL ─────────────────────────── */
const Card = ({ title, sub, icon, color=C.blue, live=true, children, foot })=>(
  <div style={{
    background:'var(--wbg, linear-gradient(180deg,#0f151f,#0b0f17))',
    border:'1px solid var(--wborder, rgba(255,255,255,.07))', borderRadius:'var(--wradius, 18px)', padding:18,
    display:'flex', flexDirection:'column', height:'100%', minHeight:0, overflow:'hidden',
    boxShadow:'0 10px 30px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.035)',
  }}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexShrink:0}}>
      <div style={{display:'flex',alignItems:'center',gap:11,minWidth:0}}>
        <div style={{width:34,height:34,borderRadius:11,flexShrink:0,
          background:`linear-gradient(145deg, ${color}30, ${color}0d)`,
          border:`1px solid ${color}3a`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Ic n={icon} s={16} c={color} sw={1.9}/>
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:'#f1f5f9',letterSpacing:'-0.01em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</div>
          {sub && <div style={{fontSize:10.5,color:'var(--t3,#64748b)',marginTop:1}}>{sub}</div>}
        </div>
      </div>
      {live && (
        <div style={{display:'flex',alignItems:'center',padding:'3px 11px',borderRadius:20,flexShrink:0,
          background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.4)'}}>
          <span style={{fontSize:10.5,fontWeight:600,color:C.green,letterSpacing:'0.02em'}}>Live</span>
        </div>
      )}
    </div>
    <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',overflow:'hidden'}}>{children}</div>
    {foot}
  </div>
);

/* ── MINI PREVIEW SHELL (library card thumbnail) ─── */
const Mini = ({children})=>(
  <div style={{height:50,borderRadius:7,background:'linear-gradient(160deg,#0e1422,#0a0f1a)',
    border:'1px solid rgba(255,255,255,.06)',padding:6,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
    {children}
  </div>
);

/* generate helpers */
const rnd = (seed)=>{ let s=seed; return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; };
const series = (n,base,amp,seed=7)=>{ const r=rnd(seed); return Array.from({length:n},(_, i)=> Math.max(0, base + Math.sin(i/2.2)*amp*0.5 + (r()-0.5)*amp)); };

const heatColor = (v)=>{ // 0..1 → green→yellow→red
  if(v<0.4) return C.green;
  if(v<0.55) return '#3b6e4a';
  if(v<0.7) return C.blue;
  if(v<0.82) return C.yellow;
  return C.red;
};

/* ════════════════════════════════════════════════
   THE 20 WIDGETS
════════════════════════════════════════════════ */
const WIDGETS = [

/* 1. 초음파 아크 위험도 */
{ id:'arc', cat:'초음파', name:'초음파 아크 위험도', size:'6x4', span:6, color:C.red,
  Full:()=>{
    const d=[18,21,20,24,22,28,26,38,30,52,36,30,44,40,46,34,42].map(v=>v); // rising w/ peak
    return (
      <Card title="초음파 아크 위험도" sub="초음파" icon="wave" color={C.red}>
        <div style={{flex:1,display:'flex',gap:18,minHeight:0,alignItems:'stretch'}}>
          <div style={{flex:1,minHeight:90}}>
            <LineChart data={d} color={C.red} height={150} bare area smooth/>
          </div>
          <div style={{flexShrink:0,display:'flex',alignItems:'center'}}>
            <Gauge value={73} max={100} color={C.red} size={118} thickness={11} label="73%" sub="ARC"/>
          </div>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const d=[3,4,3,5,4,7,5,4]; const m=Math.max(...d),mn=Math.min(...d);
    const pts=d.map((v,i)=>`${i/(d.length-1)*100},${100-(v-mn)/(m-mn)*60-20}`).join(' ');
    return (<Mini><svg width="86%" height="38" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg></Mini>);
  },
},

/* 2. 진동 FFT 스펙트럼 */
{ id:'fft', cat:'진동', name:'진동 FFT 스펙트럼', size:'6x5', span:6, color:C.blue,
  Full:()=>{
    const d = series(28, 22, 38, 13).map((v,i)=> i%7===3? v*1.8 : v);
    return (
      <Card title="진동 FFT 스펙트럼" sub="진동 · Vibration" icon="bars" color={C.blue}>
        <div style={{flex:1,minHeight:120}}>
          <BarChart data={d} height={170} yUnit="" xLabels={['0','1k','2k','3k','4k','5k Hz']}
            colorFn={(v)=> v>55?C.red : v>40?C.yellow : C.blue}/>
        </div>
        <div style={{display:'flex',gap:16,marginTop:8,fontSize:10,color:'var(--t3)'}}>
          <span>피크 <b style={{color:'#e2e8f0',fontFamily:"'DM Mono'"}}>2.1 kHz</b></span>
          <span>RMS <b style={{color:'#e2e8f0',fontFamily:"'DM Mono'"}}>4.7 mm/s</b></span>
          <span style={{color:C.yellow}}>● 베어링 고조파 감지</span>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const d=[3,5,4,7,5,9,6,8,5,4]; const m=Math.max(...d);
    return (<Mini><div style={{display:'flex',alignItems:'flex-end',gap:3,height:40}}>
      {d.map((v,i)=>(<div key={i} style={{width:5,height:`${v/m*100}%`,borderRadius:2,background:v>7?C.red:v>5?C.yellow:C.blue}}/>))}
    </div></Mini>);
  },
},

/* 3. 과열 ΔT 히트맵 */
{ id:'dt', cat:'열', name:'과열 ΔT 히트맵', size:'6x4', span:6, color:C.orange,
  Full:()=>{
    const r=rnd(31); const cells=Array.from({length:24},()=> heatColor(r()));
    return (
      <Card title="과열 ΔT 히트맵" sub="열 · Thermal" icon="thermo" color={C.orange}>
        <div style={{flex:1,display:'flex',gap:14,minHeight:0}}>
          <div style={{flex:1,minHeight:90}}><Heatmap rows={4} cols={6} cells={cells}/></div>
          <div style={{width:78,flexShrink:0,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:9,padding:'8px 10px'}}>
              <div style={{fontSize:9,color:'var(--t3)'}}>Max ΔT</div>
              <div style={{fontSize:16,fontWeight:700,color:C.red,fontFamily:"'DM Mono'"}}>18.6°C</div>
            </div>
            <div style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:9,padding:'8px 10px'}}>
              <div style={{fontSize:9,color:'var(--t3)'}}>Hotspot</div>
              <div style={{fontSize:16,fontWeight:700,color:'#e2e8f0',fontFamily:"'DM Mono'"}}>A-03</div>
            </div>
          </div>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const r=rnd(5); const cells=Array.from({length:18},()=>heatColor(r()));
    return (<Mini><div style={{width:'100%',height:44}}><Heatmap rows={3} cols={6} cells={cells} gap={2}/></div></Mini>);
  },
},

/* 4. 열화 가스 분해 패널 */
{ id:'gas', cat:'가스', name:'열화 가스 분해 패널', size:'4x5', span:4, color:C.green,
  Full:()=>(
    <Card title="열화 가스 분해 패널" sub="가스 · DGA" icon="gas" color={C.green}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <ProgBar label="CO" value={42} color={C.green}/>
        <ProgBar label="CH₄ (메탄)" value={64} color={C.yellow}/>
        <ProgBar label="H₂ (수소)" value={31} color={C.cyan}/>
        <ProgBar label="C₂H₂ (아세틸렌)" value={78} color={C.red}/>
      </div>
      <div style={{marginTop:6,padding:'8px 11px',borderRadius:8,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.25)',fontSize:11,color:C.red,display:'flex',alignItems:'center',gap:7}}>
        <Ic n="alert" s={13} c={C.red}/> C₂H₂ 임계 초과 — 아크 방전 의심
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><div style={{width:'80%',display:'flex',flexDirection:'column',gap:6}}>
    {[[C.green,'70%'],[C.yellow,'50%'],[C.red,'85%']].map(([c,w],i)=>(
      <div key={i} style={{height:7,borderRadius:4,background:'rgba(255,255,255,.08)'}}>
        <div style={{height:'100%',width:w,borderRadius:4,background:c}}/></div>))}
  </div></Mini>),
},

/* 5. 유해 환경 구역 맵 */
{ id:'zone', cat:'가스', name:'유해 환경 구역 맵', size:'6x5', span:6, color:C.yellow,
  Full:()=>{
    const dots=[{x:'18%',y:'30%',c:C.green,l:'Z1'},{x:'62%',y:'22%',c:C.yellow,l:'Z2'},{x:'78%',y:'62%',c:C.red,l:'Z3'},{x:'34%',y:'70%',c:C.green,l:'Z4'},{x:'50%',y:'45%',c:C.cyan,l:'Z5'}];
    return (
      <Card title="유해 환경 구역 맵" sub="가스 · Zone Map" icon="map" color={C.yellow}>
        <div style={{flex:1,position:'relative',borderRadius:10,overflow:'hidden',minHeight:120,
          background:'radial-gradient(circle at 30% 40%, rgba(56,189,248,.06), transparent 60%), #0b1019',
          border:'1px solid rgba(255,255,255,.05)'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
          {dots.map((d,i)=>(
            <div key={i} style={{position:'absolute',left:d.x,top:d.y,transform:'translate(-50%,-50%)'}}>
              <div style={{width:14,height:14,borderRadius:'50%',background:d.c,boxShadow:`0 0 16px ${d.c}`,border:'2px solid rgba(0,0,0,.3)'}}/>
              <div style={{position:'absolute',top:18,left:'50%',transform:'translateX(-50%)',fontSize:9,color:'var(--t3)',fontFamily:"'DM Mono'",whiteSpace:'nowrap'}}>{d.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:14,marginTop:10,fontSize:10,color:'var(--t3)'}}>
          <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:7,height:7,borderRadius:'50%',background:C.green}}/>안전 3</span>
          <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:7,height:7,borderRadius:'50%',background:C.yellow}}/>주의 1</span>
          <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:7,height:7,borderRadius:'50%',background:C.red}}/>위험 1</span>
        </div>
      </Card>
    );
  },
  Mini:()=>(<Mini><div style={{width:'100%',height:44,position:'relative',borderRadius:6,background:'#0b1019',backgroundImage:'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',backgroundSize:'14px 14px'}}>
    {[['25%','35%',C.green],['65%','30%',C.yellow],['75%','65%',C.red]].map(([x,y,c],i)=>(
      <div key={i} style={{position:'absolute',left:x,top:y,width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 8px ${c}`}}/>))}
  </div></Mini>),
},

/* 6. 복합 센서 헬스 매트릭스 */
{ id:'health', cat:'계측기', name:'복합 센서 헬스 매트릭스', size:'6x4', span:6, color:C.green,
  Full:()=>{
    const r=rnd(19); const cells=Array.from({length:40},()=>{ const v=r(); return v>0.88?C.red:v>0.78?C.yellow:C.green; });
    return (
      <Card title="복합 센서 헬스 매트릭스" sub="계측기 · 40 nodes" icon="grid" color={C.green}>
        <div style={{flex:1,minHeight:90}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gridTemplateRows:'repeat(4,1fr)',gap:5,height:'100%'}}>
            {cells.map((c,i)=>(<div key={i} style={{borderRadius:5,background:`${c}22`,border:`1px solid ${c}66`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:c}}/></div>))}
          </div>
        </div>
        <div style={{display:'flex',gap:16,marginTop:10,fontSize:10,color:'var(--t3)'}}>
          <span>정상 <b style={{color:C.green,fontFamily:"'DM Mono'"}}>34</b></span>
          <span>주의 <b style={{color:C.yellow,fontFamily:"'DM Mono'"}}>4</b></span>
          <span>점검 <b style={{color:C.red,fontFamily:"'DM Mono'"}}>2</b></span>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const r=rnd(9); const cells=Array.from({length:20},()=>{const v=r();return v>0.85?C.yellow:C.green;});
    return (<Mini><div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:3,width:'90%'}}>
      {cells.map((c,i)=>(<div key={i} style={{aspectRatio:'1',borderRadius:3,background:c}}/>))}
    </div></Mini>);
  },
},

/* 7. 계측기 전원/배터리 */
{ id:'battery', cat:'계측기', name:'계측기 전원/배터리', size:'4x4', span:4, color:C.green,
  Full:()=>(
    <Card title="계측기 전원/배터리" sub="계측기 · Power" icon="battery" color={C.green}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <ProgBar label="휴대형 계측기" value={86} color={C.green}/>
        <ProgBar label="고정형 노드" value={72} color={C.cyan}/>
        <ProgBar label="교체 필요" value={14} color={C.red}/>
      </div>
      <div style={{display:'flex',gap:10,marginTop:4}}>
        <StatTile label="평균 잔량" value="74%" color={C.green}/>
        <StatTile label="저전력 노드" value="6" color={C.yellow}/>
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><div style={{width:'78%',display:'flex',flexDirection:'column',gap:7}}>
    {[[C.green,'82%'],[C.cyan,'62%'],[C.yellow,'40%']].map(([c,w],i)=>(
      <div key={i} style={{height:7,borderRadius:4,background:'rgba(255,255,255,.08)'}}><div style={{height:'100%',width:w,borderRadius:4,background:c}}/></div>))}
  </div></Mini>),
},

/* 8. 복합 계측기 배치 현황 */
{ id:'deploy', cat:'계측기', name:'복합 계측기 배치 현황', size:'6x4', span:6, color:C.cyan,
  Full:()=>(
    <Card title="복합 계측기 배치 현황" sub="계측기 · Deployment" icon="layers" color={C.cyan}>
      <div style={{flex:1,display:'flex',gap:11,alignItems:'stretch'}}>
        <StatTile label="총 계측기" value="154" sub="등록 기준"/>
        <StatTile label="온라인" value="148" color={C.green} sub="96.1%"/>
        <StatTile label="점검" value="6" color={C.yellow} sub="정기"/>
        <StatTile label="오프라인" value="0" color={C.t3} sub="없음"/>
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><div style={{display:'flex',gap:5,width:'88%'}}>
    {['154','148','6','0'].map((v,i)=>(<div key={i} style={{flex:1,background:'rgba(255,255,255,.04)',borderRadius:5,padding:'5px 0',textAlign:'center',border:'1px solid rgba(255,255,255,.06)'}}>
      <div style={{fontSize:11,fontWeight:700,color:i===1?C.green:'#cbd5e1',fontFamily:"'DM Mono'"}}>{v}</div></div>))}
  </div></Mini>),
},

/* 9. 고장 진행 단계 */
{ id:'stage', cat:'AI', name:'고장 진행 단계', size:'4x4', span:4, color:C.purple,
  Full:()=>{
    const stages=['정상','초기','진행','임박']; const cur=2;
    return (
      <Card title="고장 진행 단계" sub="AI · Prognosis" icon="activity" color={C.purple}>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:0}}>
            {stages.map((s,i)=>(
              <React.Fragment key={s}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flexShrink:0}}>
                  <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                    background:i<=cur?(i===cur?C.purple:`${C.purple}33`):'rgba(255,255,255,.05)',
                    border:`1.5px solid ${i<=cur?C.purple:'rgba(255,255,255,.12)'}`,
                    fontSize:11,fontWeight:700,color:i===cur?'#fff':i<cur?C.purple:'var(--t4)',fontFamily:"'DM Mono'"}}>{i+1}</div>
                  <span style={{fontSize:10,color:i===cur?'#e2e8f0':'var(--t4)',fontWeight:i===cur?600:400}}>{s}</span>
                </div>
                {i<stages.length-1 && <div style={{flex:1,height:2,background:i<cur?C.purple:'rgba(255,255,255,.1)',margin:'0 2px',marginBottom:18}}/>}
              </React.Fragment>
            ))}
          </div>
          <div style={{padding:'10px 12px',borderRadius:9,background:`${C.purple}14`,border:`1px solid ${C.purple}33`}}>
            <div style={{fontSize:10,color:'var(--t3)',marginBottom:2}}>현재 단계 · 잔여 수명 추정</div>
            <div style={{fontSize:13,fontWeight:700,color:'#e2e8f0'}}>진행 단계 · 약 <span style={{color:C.purple,fontFamily:"'DM Mono'"}}>46일</span></div>
          </div>
        </div>
      </Card>
    );
  },
  Mini:()=>(<Mini><div style={{display:'flex',alignItems:'center',width:'82%'}}>
    {[0,1,2,3].map(i=>(<React.Fragment key={i}>
      <div style={{width:14,height:14,borderRadius:'50%',background:i<=2?C.purple:'rgba(255,255,255,.1)',flexShrink:0}}/>
      {i<3&&<div style={{flex:1,height:2,background:i<2?C.purple:'rgba(255,255,255,.1)'}}/>}
    </React.Fragment>))}
  </div></Mini>),
},

/* 10. Autoencoder 이상 점수 */
{ id:'ae', cat:'AI', name:'Autoencoder 이상 점수', size:'4x4', span:4, color:C.purple,
  Full:()=>{
    const d=series(24,30,30,42).map((v,i)=> i>18? v*1.5 : v);
    return (
      <Card title="Autoencoder 이상 점수" sub="AI · Anomaly" icon="brain" color={C.purple}>
        <div style={{flex:1,display:'flex',gap:14,minHeight:0}}>
          <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <Gauge value={64} max={100} color={C.purple} size={96} label="64%" sub="ERROR"/>
          </div>
          <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
            <div style={{flex:1,minHeight:80}}>
              <LineChart data={d} color={C.purple} height={100} yUnit="" xLabels={['-24h','-12h','now']} yTicks={3}/>
            </div>
            <div style={{fontSize:10,color:C.purple,marginTop:6,display:'flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,borderRadius:'50%',background:C.purple,flexShrink:0}}/>재구성 오차 급증 감지</div>
          </div>
        </div>
      </Card>
    );
  },
  Mini:()=>(<Mini><Gauge value={64} max={100} color={C.purple} size={48} thickness={6} label=""/></Mini>),
},

/* 11. LSTM 잔여수명 예측 */
{ id:'lstm', cat:'AI', name:'LSTM 잔여수명 예측', size:'6x5', span:6, color:C.cyan,
  Full:()=>{
    const d=[20,24,22,28,26,32,30,35,33,38,36,42,40,45,43,48,46,52,50,55,53,58,56,60];
    return (
      <Card title="LSTM 잔여수명 예측" sub="AI · RUL Prediction" icon="brain" color={C.cyan}>
        <div style={{flex:1,display:'flex',gap:14,minHeight:0}}>
          <div style={{flex:1,minHeight:130}}>
            <LineChart data={d} color={C.cyan} height={180} yUnit="" yTicks={4}
              xLabels={['D-30','D-20','D-10','오늘','D+10']}/>
          </div>
          <div style={{width:88,flexShrink:0,display:'flex',flexDirection:'column',gap:9}}>
            <div style={{background:`${C.cyan}12`,border:`1px solid ${C.cyan}33`,borderRadius:10,padding:'10px 11px'}}>
              <div style={{fontSize:9,color:'var(--t3)'}}>RUL</div>
              <div style={{fontSize:18,fontWeight:700,color:C.cyan,fontFamily:"'DM Mono'"}}>46일</div>
            </div>
            <div style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'10px 11px'}}>
              <div style={{fontSize:9,color:'var(--t3)'}}>Next PM</div>
              <div style={{fontSize:18,fontWeight:700,color:'#e2e8f0',fontFamily:"'DM Mono'"}}>06.22</div>
            </div>
            <div style={{fontSize:9,color:'var(--t4)',lineHeight:1.5}}>신뢰구간<br/><span style={{color:C.green,fontFamily:"'DM Mono'"}}>±3.2일</span></div>
          </div>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const d=[2,4,3,6,5,8,7,9]; const m=Math.max(...d),mn=Math.min(...d);
    const pts=d.map((v,i)=>`${i/(d.length-1)*100},${100-(v-mn)/(m-mn)*80-10}`).join(' ');
    return (<Mini><svg width="86%" height="40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={C.cyan} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
    </svg></Mini>);
  },
},

/* 12. CNN-LSTM 스펙트로그램 진단 */
{ id:'spec', cat:'AI', name:'CNN-LSTM 스펙트로그램 진단', size:'6x5', span:6, color:C.blue,
  Full:()=>{
    const r=rnd(77); const cells=Array.from({length:60},()=>{ const v=r(); return v>0.78?C.red:v>0.62?C.blue:'#1e4536'; });
    return (
      <Card title="CNN-LSTM 스펙트로그램 진단" sub="AI · Spectrogram" icon="layers" color={C.blue}>
        <div style={{flex:1,display:'flex',gap:14,minHeight:0}}>
          <div style={{flex:1,minHeight:110}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gridTemplateRows:'repeat(5,1fr)',gap:3,height:'100%'}}>
              {cells.map((c,i)=>(<div key={i} style={{borderRadius:2,background:c}}/>))}
            </div>
          </div>
          <div style={{width:88,flexShrink:0,display:'flex',flexDirection:'column',gap:9}}>
            <div style={{background:`${C.blue}12`,border:`1px solid ${C.blue}33`,borderRadius:10,padding:'10px 11px'}}>
              <div style={{fontSize:9,color:'var(--t3)'}}>Class</div>
              <div style={{fontSize:15,fontWeight:700,color:'#e2e8f0'}}>Bearing</div>
            </div>
            <div style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'10px 11px'}}>
              <div style={{fontSize:9,color:'var(--t3)'}}>Conf.</div>
              <div style={{fontSize:18,fontWeight:700,color:C.green,fontFamily:"'DM Mono'"}}>91%</div>
            </div>
          </div>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const r=rnd(3); const cells=Array.from({length:24},()=>{const v=r();return v>0.7?C.red:v>0.5?C.blue:'#1e4536';});
    return (<Mini><div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:2,width:'90%'}}>
      {cells.map((c,i)=>(<div key={i} style={{aspectRatio:'1',borderRadius:1.5,background:c}}/>))}
    </div></Mini>);
  },
},

/* 13. F1/F2 모델 운용 모드 */
{ id:'f1f2', cat:'AI', name:'F1/F2 모델 운용 모드', size:'4x4', span:4, color:C.purple,
  Full:()=>(
    <Card title="F1/F2 모델 운용 모드" sub="AI · Model Mode" icon="cpu" color={C.purple}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <ProgBar label="F1 균형" value={82} color={C.purple}/>
        <ProgBar label="F2 안전 우선" value={94} color={C.cyan}/>
      </div>
      <div style={{padding:'9px 12px',borderRadius:9,background:'rgba(168,85,247,.1)',border:'1px solid rgba(168,85,247,.28)',display:'flex',alignItems:'center',gap:8}}>
        <span style={{width:7,height:7,borderRadius:'50%',background:C.purple,animation:'aimPulse 1.6s infinite'}}/>
        <span style={{fontSize:11,color:'#e2e8f0'}}>현재 모드 · <b style={{color:C.purple}}>오검출 최소화 (F2)</b></span>
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><Gauge value={82} max={100} color={C.purple} size={48} thickness={6} label=""/></Mini>),
},

/* 14. 예지보전 리포트 요약 */
{ id:'pdm', cat:'AI', name:'예지보전 리포트 요약', size:'6x4', span:6, color:C.green,
  Full:()=>(
    <Card title="예지보전 리포트 요약" sub="AI · PdM Report" icon="report" color={C.green}>
      <div style={{flex:1,display:'flex',gap:11,minHeight:0}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
          {[['정상 설비','128',C.green],['예방정비 권고','9',C.yellow],['긴급 점검','2',C.red]].map(([k,v,c])=>(
            <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',borderRadius:9,background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)'}}>
              <span style={{display:'flex',alignItems:'center',gap:8,fontSize:11.5,color:'var(--t2)'}}><span style={{width:7,height:7,borderRadius:'50%',background:c}}/>{k}</span>
              <span style={{fontSize:15,fontWeight:700,color:c,fontFamily:"'DM Mono'"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{width:120,flexShrink:0,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:6,background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.2)',borderRadius:10}}>
          <Gauge value={89} max={100} color={C.green} size={80} label="89%" sub="가동률"/>
          <span style={{fontSize:10,color:'var(--t3)'}}>주간 종합 점수</span>
        </div>
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><div style={{display:'flex',flexDirection:'column',gap:5,width:'80%'}}>
    {[C.green,C.yellow,C.red].map((c,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:c}}/>
      <div style={{flex:1,height:5,borderRadius:3,background:'rgba(255,255,255,.08)'}}><div style={{height:'100%',width:`${[80,40,20][i]}%`,borderRadius:3,background:c}}/></div></div>))}
  </div></Mini>),
},

/* 15. 작업자 SpO2 안전 */
{ id:'spo2', cat:'작업자', name:'작업자 SpO2 안전', size:'4x4', span:4, color:C.red,
  Full:()=>{
    const d=[97,98,97,96,97,95,96,94,95,93,94,96];
    return (
      <Card title="작업자 SpO₂ 안전" sub="작업자 · Vitals" icon="heart" color={C.red}>
        <div style={{flex:1,display:'flex',gap:14,minHeight:0}}>
          <div style={{flexShrink:0,textAlign:'center',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{fontSize:32,fontWeight:700,color:C.green,fontFamily:"'DM Mono'",lineHeight:1}}>96<span style={{fontSize:14,color:'var(--t3)'}}>%</span></div>
            <div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>SpO₂ 평균</div>
            <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',marginTop:10,fontFamily:"'DM Mono'"}}>72 <span style={{fontSize:9,color:'var(--t4)'}}>BPM</span></div>
          </div>
          <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
            <div style={{flex:1,minHeight:70}}><LineChart data={d} color={C.red} height={90} yUnit="" xLabels={['-1h','-30m','now']} yTicks={2}/></div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:6}}>
          <span style={{flex:1,fontSize:10,textAlign:'center',padding:'5px 0',borderRadius:6,background:'rgba(34,197,94,.1)',color:C.green,border:'1px solid rgba(34,197,94,.25)'}}>정상 12명</span>
          <span style={{flex:1,fontSize:10,textAlign:'center',padding:'5px 0',borderRadius:6,background:'rgba(234,179,8,.1)',color:C.yellow,border:'1px solid rgba(234,179,8,.25)'}}>주의 1명</span>
        </div>
      </Card>
    );
  },
  Mini:()=>{ const d=[5,6,5,4,5,3,4,6]; const m=Math.max(...d),mn=Math.min(...d);
    const pts=d.map((v,i)=>`${i/(d.length-1)*100},${100-(v-mn)/(m-mn)*70-15}`).join(' ');
    return (<Mini><svg width="86%" height="40" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg></Mini>);
  },
},

/* 16. 작업자 컨텍스트 융합 */
{ id:'ctx', cat:'작업자', name:'작업자 컨텍스트 융합', size:'6x4', span:6, color:C.cyan,
  Full:()=>(
    <Card title="작업자 컨텍스트 융합" sub="작업자 · Context Fusion" icon="user" color={C.cyan}>
      <div style={{flex:1,display:'flex',gap:11,minHeight:0}}>
        {[
          {n:'위치',v:'B동 3F',c:C.cyan,d:'GPS+UWB'},
          {n:'활동',v:'점검 중',c:C.green,d:'IMU 분류'},
          {n:'환경',v:'안전',c:C.green,d:'가스+온도'},
          {n:'피로도',v:'보통',c:C.yellow,d:'HRV 추정'},
        ].map(s=>(
          <div key={s.n} style={{flex:1,background:'rgba(255,255,255,.025)',border:`1px solid ${s.c}22`,borderRadius:10,padding:'12px 13px',display:'flex',flexDirection:'column',gap:6,minWidth:0}}>
            <div style={{fontSize:10,color:'var(--t3)'}}>{s.n}</div>
            <div style={{fontSize:15,fontWeight:700,color:s.c,whiteSpace:'nowrap'}}>{s.v}</div>
            <div style={{fontSize:9,color:'var(--t4)'}}>{s.d}</div>
          </div>
        ))}
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><div style={{display:'flex',gap:5,width:'88%'}}>
    {[C.cyan,C.green,C.green,C.yellow].map((c,i)=>(<div key={i} style={{flex:1,height:34,borderRadius:5,background:`${c}1f`,border:`1px solid ${c}44`}}/>))}
  </div></Mini>),
},

/* 17. 쓰러짐 감지 플로우 */
{ id:'fall', cat:'IMU', name:'쓰러짐 감지 플로우', size:'4x5', span:4, color:C.orange,
  Full:()=>{
    const steps=[['IMU 수신','done'],['낙하 가속 감지','done'],['자세 분석','active'],['SOP 트리거','wait']];
    return (
      <Card title="쓰러짐 감지 플로우" sub="IMU · Fall Detection" icon="fall" color={C.orange}>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:0}}>
          {steps.map(([s,st],i)=>(
            <div key={s} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{width:24,height:24,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                  background:st==='done'?C.green:st==='active'?C.orange:'rgba(255,255,255,.05)',
                  border:`1.5px solid ${st==='done'?C.green:st==='active'?C.orange:'rgba(255,255,255,.12)'}`}}>
                  {st==='done'?<Ic n="check" s={12} c="#fff" sw={2.5}/>:<span style={{width:7,height:7,borderRadius:'50%',background:st==='active'?'#fff':'transparent',animation:st==='active'?'aimPulse 1.4s infinite':'none'}}/>}
                </div>
                {i<steps.length-1 && <div style={{width:2,height:22,background:st==='done'?C.green:'rgba(255,255,255,.1)'}}/>}
              </div>
              <div style={{paddingTop:2,paddingBottom:14}}>
                <div style={{fontSize:12.5,fontWeight:st==='active'?700:500,color:st==='wait'?'var(--t4)':'#e2e8f0'}}>{s}</div>
                <div style={{fontSize:10,color:'var(--t3)',marginTop:1}}>{st==='done'?'완료':st==='active'?'진행 중':'대기'}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  },
  Mini:()=>(<Mini><div style={{display:'flex',flexDirection:'column',gap:4,width:'70%'}}>
    {['done','done','active','wait'].map((st,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:7}}>
      <span style={{width:9,height:9,borderRadius:'50%',background:st==='done'?C.green:st==='active'?C.orange:'rgba(255,255,255,.12)'}}/>
      <div style={{flex:1,height:4,borderRadius:2,background:st==='wait'?'rgba(255,255,255,.08)':st==='active'?C.orange:C.green}}/></div>))}
  </div></Mini>),
},

/* 18. 통신 게이트웨이 상태 */
{ id:'gw', cat:'통신', name:'통신 게이트웨이 상태', size:'4x4', span:4, color:C.green,
  Full:()=>(
    <Card title="통신 게이트웨이 상태" sub="통신 · Gateway" icon="wifi" color={C.green}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:11}}>
        {[['LoRa','연결',98,C.green],['LTE-M','연결',91,C.green],['Wi-Fi Mesh','약함',64,C.yellow]].map(([n,s,v,c])=>(
          <div key={n}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:11,color:'var(--t2)',display:'flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,borderRadius:'50%',background:c}}/>{n}</span>
              <span style={{fontSize:10,color:c,fontWeight:600}}>{s} · {v}%</span>
            </div>
            <div style={{height:5,borderRadius:3,background:'rgba(255,255,255,.06)'}}><div style={{height:'100%',width:`${v}%`,borderRadius:3,background:c}}/></div>
          </div>
        ))}
      </div>
      <div style={{fontSize:10,color:'var(--t3)',marginTop:4,fontFamily:"'DM Mono'"}}>패킷 손실 0.2% · 지연 28ms</div>
    </Card>
  ),
  Mini:()=>(<Mini><Ic n="wifi" s={30} c={C.green} sw={1.6}/></Mini>),
},

/* 19. SOP 자동 실행 */
{ id:'sop', cat:'SOP', name:'SOP 자동 실행', size:'6x5', span:6, color:C.blue,
  Full:()=>{
    const items=[['이상 감지 → 알림 발송','완료',C.green],['담당자 자동 배정','완료',C.green],['현장 격리 안내 푸시','진행 중',C.blue],['보고서 자동 생성','대기',C.t3]];
    return (
      <Card title="SOP 자동 실행" sub="SOP · Auto Response" icon="play" color={C.blue}>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:8,justifyContent:'center'}}>
          {items.map(([t,s,c],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:11,padding:'10px 13px',borderRadius:9,
              background:c===C.blue?'rgba(59,130,246,.08)':'rgba(255,255,255,.025)',
              border:`1px solid ${c===C.blue?'rgba(59,130,246,.28)':'rgba(255,255,255,.06)'}`}}>
              <div style={{width:22,height:22,borderRadius:6,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:`${c}22`,border:`1px solid ${c}44`,fontSize:10,fontWeight:700,color:c,fontFamily:"'DM Mono'"}}>{i+1}</div>
              <span style={{flex:1,fontSize:12,color:'#e2e8f0'}}>{t}</span>
              <span style={{fontSize:10,fontWeight:600,color:c,padding:'2px 9px',borderRadius:5,background:`${c}1a`}}>{s}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  },
  Mini:()=>(<Mini><div style={{display:'flex',flexDirection:'column',gap:5,width:'82%'}}>
    {[C.green,C.green,C.blue,'rgba(255,255,255,.12)'].map((c,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:7}}>
      <span style={{width:5,height:5,borderRadius:1,background:c}}/><div style={{flex:1,height:6,borderRadius:3,background:c==='rgba(255,255,255,.12)'?'rgba(255,255,255,.08)':c}}/></div>))}
  </div></Mini>),
},

/* 20. 현장 실증 진행률 */
{ id:'poc', cat:'실증', name:'현장 실증 진행률', size:'4x4', span:4, color:C.green,
  Full:()=>(
    <Card title="현장 실증 진행률" sub="실증 · PoC Progress" icon="flag" color={C.green}>
      <div style={{flex:1,display:'flex',alignItems:'center',gap:16}}>
        <Gauge value={72} max={100} color={C.green} size={104} label="72%" sub="전체"/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:10}}>
          {[['설치','100%',C.green],['데이터 수집','84%',C.cyan],['검증','52%',C.yellow]].map(([k,v,c])=>(
            <div key={k}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--t2)'}}>{k}</span>
                <span style={{fontSize:10,color:c,fontFamily:"'DM Mono'",fontWeight:600}}>{v}</span>
              </div>
              <div style={{height:5,borderRadius:3,background:'rgba(255,255,255,.06)'}}><div style={{height:'100%',width:v,borderRadius:3,background:c}}/></div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  ),
  Mini:()=>(<Mini><Gauge value={72} max={100} color={C.green} size={48} thickness={6} label=""/></Mini>),
},

];

window.AIM_WIDGETS = WIDGETS;
window.AIMIc = Ic;
})();
