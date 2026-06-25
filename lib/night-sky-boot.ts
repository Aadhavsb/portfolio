// @ts-nocheck — prototype canvas runtime; typed at React/sky-ui boundary
/* eslint-disable prefer-const -- force simulation vars match prototype style */
import type { SiteData } from "@/data/types";
import type { trapFocus as TrapFocusFn } from "@/lib/focus-trap";
import type {
  appendMetrics as AppendMetricsFn,
  appendTags as AppendTagsFn,
  linkActions as LinkActionsFn,
  projectActions as ProjectActionsFn,
  renderSpotlight as RenderSpotlightFn,
  setRoleFooter as SetRoleFooterFn,
} from "@/lib/sky-ui";

const CONST_KEYS = {
  instrument: { name: "The Instrument", color: "#9bb8ff", c: [0.8, 0.28] },
  presence: { name: "The Presence", color: "#7ee0d0", c: [0.54, 0.5] },
  arena: { name: "The Arena", color: "#c2a6ff", c: [0.32, 0.24] },
  platform: { name: "The Platform", color: "#f3b14e", c: [0.3, 0.76] },
  shelf: { name: "The Shelf", color: "#fde4b8", c: [0.13, 0.5] },
  lab: { name: "The Lab", color: "#bcd0ff", c: [0.84, 0.8] },
};

export type NightSkyUi = {
  trapFocus: typeof TrapFocusFn;
  renderSpotlight: typeof RenderSpotlightFn;
  appendMetrics: typeof AppendMetricsFn;
  appendTags: typeof AppendTagsFn;
  linkActions: typeof LinkActionsFn;
  setRoleFooter: typeof SetRoleFooterFn;
  projectActions: typeof ProjectActionsFn;
};

export function bootNightSky(site: SiteData, ui: NightSkyUi) {
    // ============================================================
    //  CONSTELLATION LAYOUT (aesthetic; ids match site.json)
    // ============================================================
    const CONST = CONST_KEYS;
    const { trapFocus, renderSpotlight, appendMetrics, appendTags, linkActions, setRoleFooter, projectActions } = ui;
    const COL = { project: "#a78bfa", experience: "#ffcf7a", skill: "#ff7e60" };
    const STRUCT: [string, string][] = [
      ["blackbox-qa","abeyon-llm"], ["ml-research","knowledge-distillation-lab"],
      ["inventory360","palate"], ["palate","brickd-up"], ["brickd-up","expressink"], ["expressink","inventory360"]
    ];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const hexToRgb = (h: string): [number, number, number] => {
      const n = parseInt(h.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    const cv=document.getElementById('sky'); if(!cv) return;
    const ctx=cv.getContext('2d',{alpha:false, desynchronized:true});
    if(!ctx) return;
    let W=0,H=0,DPR=1,CW=0,CH=0,area=0;
    let bgStars=[], neb=null, grainTiles=[], grainPats=[], gi=0, vignette=null, bgGrad=null;
    let sprites=[], spikeSprite=null, meteors=[], nextMeteor=4, lastT=0;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let motionOn=!reduce;
    let NODES: GraphNode[] = [], NMAP: Record<string, GraphNode> = {}, EDGES: GraphNode[] = [], ADJ: Record<string, Set<string>> = {}, ROLE: Record<string, GraphNode> = {}, ROLE_STAR: Record<string, string | null> = {}, TS={featured:1.45,gallery:1.0,labs:0.92};
    let ready=false;
    let dragNode: GraphNode | null = null;
    let hot: GraphNode | null = null;

    // lifecycle
    let killed=false, rafId=0, rzTimer=0;
    const prevOverflow=document.body.style.overflow; document.body.style.overflow='hidden';

    // ---------- decorative sky ----------
    const STELLAR=[[[155,184,255],.10],[[202,216,255],.18],[[248,247,255],.32],[[252,243,210],.20],[[255,214,160],.12],[[255,170,140],.08]];
    function pickStellarIdx(){let r=Math.random(),acc=0;for(let i=0;i<STELLAR.length;i++){acc+=STELLAR[i][1];if(r<=acc)return i;}return 2;}
    function makeSprite(rgb,spike){
      const S=64,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');const k=S/2,[r,gg,b]=rgb;
      const rad=g.createRadialGradient(k,k,0,k,k,k);
      rad.addColorStop(0,'rgba(255,255,255,1)');rad.addColorStop(0.15,`rgba(${r},${gg},${b},0.95)`);
      rad.addColorStop(0.4,`rgba(${r},${gg},${b},0.26)`);rad.addColorStop(1,`rgba(${r},${gg},${b},0)`);
      g.fillStyle=rad;g.beginPath();g.arc(k,k,k,0,7);g.fill();
      if(spike){g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(${r},${gg},${b},0.5)`;g.lineWidth=1.1;
        g.beginPath();g.moveTo(2,k);g.lineTo(S-2,k);g.moveTo(k,2);g.lineTo(k,S-2);g.stroke();}
      return c;
    }
    function buildSprites(){sprites=STELLAR.map(([rgb])=>makeSprite(rgb,false));spikeSprite=makeSprite([248,247,255],true);}
    function buildBg(){
      bgStars=[];const count=clamp(Math.round(area/1100),900,3200);
      for(let i=0;i<count;i++){const depth=Math.random();const r=rand(.35,1.25)*(0.6+depth)*DPR,spike=Math.random()<0.035;
        bgStars.push({x:Math.random()*W,y:Math.random()*H,ci:pickStellarIdx(),size:r*(spike?12:6),
          base:rand(.22,.9)*(0.4+depth*0.7),tw:rand(.6,2.4),ph:rand(0,Math.PI*2),depth,spike});}
    }
    function buildNebula(){
      neb=document.createElement('canvas');neb.width=W;neb.height=H;const g=neb.getContext('2d');g.globalCompositeOperation='lighter';
      const band=[[54,214,195],[120,108,200],[206,120,150],[80,120,210]];const cx=W*0.62,cy=H*0.30,ang=-0.62,N=Math.round(area/30000)+16;
      for(let i=0;i<N;i++){const t=rand(-1,1);
        const px=cx+Math.cos(ang)*t*W*0.7+rand(-1,1)*W*0.10,py=cy+Math.sin(ang)*t*W*0.7+rand(-1,1)*H*0.16;
        const rad=rand(W*0.06,W*0.18),col=band[(Math.random()*band.length)|0],a=rand(.008,.035);
        const rg=g.createRadialGradient(px,py,0,px,py,rad);
        rg.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);rg.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
        g.fillStyle=rg;g.beginPath();g.arc(px,py,rad,0,7);g.fill();}
    }
    function buildGrain(){grainTiles=[];const S=140;
      for(let k=0;k<3;k++){const t=document.createElement('canvas');t.width=S;t.height=S;const c=t.getContext('2d');const img=c.createImageData(S,S);
        for(let i=0;i<img.data.length;i+=4){const v=200+Math.random()*55;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=Math.random()*14;}
        c.putImageData(img,0,0);grainTiles.push(t);}
      grainPats=grainTiles.map(t=>ctx.createPattern(t,'repeat'));}
    function buildVignette(){
      vignette=document.createElement('canvas');vignette.width=W;vignette.height=H;const g=vignette.getContext('2d');
      const vg=g.createRadialGradient(W*0.5,H*0.46,Math.min(W,H)*0.28,W*0.5,H*0.5,Math.max(W,H)*0.78);
      vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(2,3,8,.7)');g.fillStyle=vg;g.fillRect(0,0,W,H);
      bgGrad=ctx.createLinearGradient(0,0,W,H);bgGrad.addColorStop(0,'#05060d');bgGrad.addColorStop(.5,'#04050a');bgGrad.addColorStop(1,'#070510');
    }

    // ---------- model ----------
    const conOf = (p: { constellation?: string; tier?: string }) =>
      p.constellation || (p.tier === "gallery" ? "shelf" : p.tier === "labs" ? "lab" : null);
    function buildModel(d: SiteData){
      if(d.visual&&d.visual.tierScale) TS=d.visual.tierScale;
      ROLE={}; ROLE_STAR={};
      (d.experience||[]).forEach(r=>{ ROLE[r.id]=r; ROLE_STAR[r.id]=r.skyStarId||null; });
      NODES=[]; NMAP={};
      for(const p of d.projects){
        const n={...p, kind:'proj', con:conOf(p), deg:0, color:COL[p.starKind]||COL.project};
        NODES.push(n); NMAP[p.id]=n;
      }
      for(const e of (d.experience||[])){
        if(!e.onSky || NMAP[e.id]) continue;
        const n={ id:e.id, kind:'proj', tier:e.skyTier||'labs', con:e.constellation||'lab',
          starKind:'experience', color:COL.experience, title:e.skyTitle||e.org,
          subtitle:`${e.role}${e.location?' · '+e.location:''} · ${e.period}`,
          hook:e.hook||(e.highlights&&e.highlights[0])||'', stack:e.stack||[], metrics:[],
          links:{}, spanName:'experience.'+e.id, linkedExperience:e.id, deg:0 };
        NODES.push(n); NMAP[e.id]=n;
      }
      for(const s of d.skills){
        const tg=new Set();
        for(const l of (s.links||[])){ if(NMAP[l]&&NMAP[l].kind==='proj') tg.add(l); else if(ROLE_STAR[l]) tg.add(ROLE_STAR[l]); }
        if(!tg.size) continue;
        const n={id:s.id, title:s.label, kind:'skill', con:null, to:[...tg], deg:0, writeup:s.writeup||'', color:COL.skill};
        NODES.push(n); NMAP[s.id]=n;
      }
      NODES.forEach(n=>{ if(n.kind!=='skill')return; const cnt={};
        n.to.forEach(id=>{const c=NMAP[id]&&NMAP[id].con; if(c)cnt[c]=(cnt[c]||0)+1;});
        let best=null,bv=0; for(const c in cnt) if(cnt[c]>bv){bv=cnt[c];best=c;} n.home=best;
        n.span=new Set(n.to.map(id=>NMAP[id]&&NMAP[id].con).filter(Boolean)).size; });
      EDGES=[];
      const add=(a,b,type)=>{ if(NMAP[a]&&NMAP[b]){ EDGES.push({a:NMAP[a],b:NMAP[b],type}); NMAP[a].deg++; NMAP[b].deg++; } };
      for(const [a,b] of STRUCT) add(a,b,'struct');
      for(const e of (d.experience||[])){ if(e.onSky && e.linkedProjects) for(const p of e.linkedProjects) add(e.id,p,'struct'); }
      for(const n of NODES) if(n.kind==='skill') for(const t of n.to) add(n.id,t,'skill');
      const ec=n=>n.con||n.home||null;
      EDGES.forEach(e=>{ const a=ec(e.a),b=ec(e.b); e.cross=!(a&&b&&a===b); });
      ADJ={}; NODES.forEach(n=>ADJ[n.id]=new Set([n.id]));
      EDGES.forEach(e=>{ ADJ[e.a.id].add(e.b.id); ADJ[e.b.id].add(e.a.id); });
      NODES.forEach(n=>{
        n.r = n.kind==='proj' ? 8*(TS[n.tier]||1)+Math.sqrt(n.deg)*0.9 : 2.6+Math.sqrt(n.deg)*1.5;
        n.hub = n.kind==='skill' && (n.deg>=4 || (n.deg>=3 && n.span>=2));
        n.labelAlways = n.kind==='proj';
        n.spike = n.tier==='featured';
        n.bzp=rand(0,6.283); n.bzp2=rand(0,6.283); n.bzs=rand(0.45,0.9); n.bzs2=rand(0.4,0.85); n.rx=0; n.ry=0;
      });
    }
    const ECOF=n=>n.con||n.home||null;

    // ---------- physics ----------
    const SIM={alpha:0.9, alphaMin:0.003, alphaDecay:0.018, velocityDecay:0.62,
               projCenterK:0.075, freeCenterK:0.005, chargeK:7200, chargeMax:3.7, collidePad:18};
    function conCenter(con: ConstKey){const c=CONST[con].c;return[c[0]*CW,c[1]*CH];}
    function linkDist(e){ const sk=(e.a.kind==='skill'||e.b.kind==='skill'); return (sk?82:132)+e.a.r+e.b.r; }
    function place(){
      for(const n of NODES){
        let bx,by;
        if(n.con){const c=conCenter(n.con);bx=c[0];by=c[1];}
        else if(n.to){let sx=0,sy=0,k=0;for(const id of n.to){const m=NMAP[id];if(m&&m.con){const c=conCenter(m.con);sx+=c[0];sy+=c[1];k++;}}bx=k?sx/k:CW/2;by=k?sy/k:CH/2;}
        else {bx=CW/2;by=CH/2;}
        n.x=bx+rand(-1,1)*CW*0.05;n.y=by+rand(-1,1)*CH*0.05;n.vx=0;n.vy=0;n.fx=null;n.fy=null;
      }
    }
    function reheat(v){ SIM.alpha=Math.max(SIM.alpha,v); }
    function tick(){
      let a=SIM.alpha;
      if(a<SIM.alphaMin && !dragNode) return;
      a=Math.max(a, dragNode?0.25:a);
      for(const n of NODES){ if(n.fx!=null)continue;
        if(n.con){const c=conCenter(n.con);n.vx+=(c[0]-n.x)*SIM.projCenterK*a;n.vy+=(c[1]-n.y)*SIM.projCenterK*a;}
        else {n.vx+=(CW*0.5-n.x)*SIM.freeCenterK*a;n.vy+=(CH*0.5-n.y)*SIM.freeCenterK*a;} }
      for(const e of EDGES){ let dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,d=Math.hypot(dx,dy)||1; const L=linkDist(e),st=e.type==='struct'?0.18:0.1;
        const f=((d-L)/d)*st*a; dx*=f;dy*=f; if(e.a.fx==null){e.a.vx+=dx*0.5;e.a.vy+=dy*0.5;} if(e.b.fx==null){e.b.vx-=dx*0.5;e.b.vy-=dy*0.5;} }
      for(let i=0;i<NODES.length;i++)for(let j=i+1;j<NODES.length;j++){const A=NODES[i],B=NODES[j];
        let dx=A.x-B.x,dy=A.y-B.y,d2=dx*dx+dy*dy+0.01,d=Math.sqrt(d2);let f=Math.min(SIM.chargeK/d2,SIM.chargeMax)*a,ux=dx/d*f,uy=dy/d*f;
        if(A.fx==null){A.vx+=ux;A.vy+=uy;} if(B.fx==null){B.vx-=ux;B.vy-=uy;}}
      for(const n of NODES){ if(n.fx!=null){n.x=n.fx;n.y=n.fy;n.vx=0;n.vy=0;continue;} n.vx*=SIM.velocityDecay;n.vy*=SIM.velocityDecay;n.x+=n.vx;n.y+=n.vy; }
      for(let k=0;k<2;k++)for(let i=0;i<NODES.length;i++)for(let j=i+1;j<NODES.length;j++){const A=NODES[i],B=NODES[j],minD=A.r+B.r+SIM.collidePad;
        let dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1;if(d<minD){const p=((minD-d)/d)*0.5,ox=dx*p,oy=dy*p;
          if(A.fx==null){A.x-=ox;A.y-=oy;} if(B.fx==null){B.x+=ox;B.y+=oy;}}}
      for(const n of NODES){const m=8+n.r;n.x=clamp(n.x,m,CW-m);n.y=clamp(n.y,m,CH-m);}
      if(!dragNode) SIM.alpha += (0-SIM.alpha)*SIM.alphaDecay;
    }

    // ---------- draw ----------
    function conColorRGB(con: string | null){return hexToRgb(con?CONST[con].color:"#ff7e60");}
    let litSet: Set<string> | null = null;
    let litAmt=0;
    function isLit(n: GraphNode){ return !litSet || litSet.has(n.id); }
    function drawConstLabels(){
      ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.textAlign='center'; ctx.textBaseline='middle';
      for(const key in CONST){
        const members=NODES.filter(n=>n.con===key && n.kind==='proj');
        if(!members.length)continue;
        let sx=0; members.forEach(m=>{sx+=m.rx;}); sx/=members.length;
        const minY=Math.min(...members.map(m=>m.ry-m.r));
        const lx=sx*DPR, ly=(minY-30)*DPR;
        const isHotCon = hot && hot.con===key;
        const dim = isHotCon ? 0.42 : (0.30 - 0.16*litAmt);
        ctx.font=`340 ${15*DPR}px "Fraunces", Georgia, serif`;
        ctx.fillStyle=`rgba(233,236,245,${dim})`; ctx.shadowColor='rgba(2,3,8,.8)'; ctx.shadowBlur=10*DPR;
        ctx.fillText(CONST[key].name.toUpperCase(), lx, ly); ctx.shadowBlur=0;
      }
      ctx.restore();
    }
    function drawEdges(){
      for(const e of EDGES){
        const ax=e.a.rx*DPR, ay=e.a.ry*DPR, bx=e.b.rx*DPR, by=e.b.ry*DPR;
        const bothLit = litSet ? (litSet.has(e.a.id) && litSet.has(e.b.id)) : false;
        const rest = e.cross ? 0.16 : 0.46;
        const target = bothLit ? (e.cross?0.5:0.82) : 0.05;
        const alpha = rest + (target-rest)*litAmt;
        if(alpha<=0.012) continue;
        const ca=conColorRGB(ECOF(e.a)), cb=conColorRGB(ECOF(e.b));
        const grd=ctx.createLinearGradient(ax,ay,bx,by);
        grd.addColorStop(0,`rgba(${ca[0]},${ca[1]},${ca[2]},${alpha})`);
        grd.addColorStop(1,`rgba(${cb[0]},${cb[1]},${cb[2]},${alpha})`);
        ctx.strokeStyle=grd; ctx.lineWidth=DPR*((e.cross?0.85:1.15)+(bothLit?0.9*litAmt:0));
        if(bothLit && litAmt>0.03){ ctx.shadowColor=`rgba(${ca[0]},${ca[1]},${ca[2]},0.85)`; ctx.shadowBlur=8*DPR*litAmt; }
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke(); ctx.shadowBlur=0;
      }
    }
    function drawNode(n,t){
      const lit=isLit(n), hov=(n===hot);
      const x=n.rx*DPR, y=n.ry*DPR; const [r,g,b]=hexToRgb(n.color);
      const tw = motionOn ? (0.8+0.2*Math.sin(t*(n.kind==='skill'?1.7:1.1)+n.x*0.7)) : 1;
      const pulse = (n.tier==='featured'&&motionOn) ? (1+0.07*Math.sin(t*1.4+n.bzp)) : 1;
      const dim = lit ? 1 : (1 - litAmt*0.6);
      const glowBoost = lit ? (1 + 0.45*litAmt) : 1;
      const R=n.r*DPR*(hov?1.22:1)*tw;
      const glow=R*(hov?4.2:2.6)*glowBoost*pulse;
      const ga=(hov?.55:(n.tier==='featured'?.4:.28))*dim*(lit?(1+0.3*litAmt):1)*pulse;
      const rg=ctx.createRadialGradient(x,y,0,x,y,glow);
      rg.addColorStop(0,`rgba(${r},${g},${b},${ga})`);rg.addColorStop(.4,`rgba(${r},${g},${b},${ga*0.3})`);rg.addColorStop(1,`rgba(${r},${g},${b},0)`);
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(x,y,glow,0,7); ctx.fill();
      if((n.spike || n.deg>=5 || hov) && lit){
        ctx.strokeStyle=`rgba(${r},${g},${b},${(hov?.5:.26)*dim})`; ctx.lineWidth=DPR*0.7; const L=glow*0.95;
        ctx.beginPath(); ctx.moveTo(x-L,y);ctx.lineTo(x+L,y);ctx.moveTo(x,y-L);ctx.lineTo(x,y+L); ctx.stroke();
      }
      ctx.fillStyle=`rgba(${r},${g},${b},${0.96*dim})`; ctx.beginPath(); ctx.arc(x,y,R*0.95,0,7); ctx.fill();
      ctx.fillStyle=`rgba(255,255,255,${(hov?1:.9)*dim})`; ctx.beginPath(); ctx.arc(x,y,R*0.42,0,7); ctx.fill();
    }
    function drawLabel(n){
      const lit=isLit(n), hov=(n===hot);
      const always = n.labelAlways || n.hub;
      const baseA = n.tier==='featured'?0.8:(n.hub?0.62:0.5);
      let alpha;
      if(hov) alpha=1;
      else if(always){ alpha = litSet ? (lit ? Math.max(baseA,0.85) : baseA*(1-0.6*litAmt)) : baseA; }
      else { if(!litSet || !lit) return; alpha = 0.85*litAmt; }
      if(hot && n!==hot){ const dd=Math.hypot(n.rx-hot.rx,n.ry-hot.ry); if(dd < hot.r+n.r+76) alpha *= (1-litAmt); }
      if(alpha<=0.05) return;
      const x=n.rx*DPR, y=(n.ry+n.r+7)*DPR;
      ctx.save(); ctx.globalCompositeOperation='source-over';
      const size=(n.tier==='featured'?12.5:n.kind==='skill'?(n.hub?10.5:9.5):11);
      ctx.font=`340 ${size*DPR}px "Fraunces", Georgia, serif`; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.shadowColor='rgba(2,3,8,.92)'; ctx.shadowBlur=7*DPR; ctx.fillStyle=`rgba(233,236,245,${alpha})`;
      ctx.fillText(n.title, x, y); ctx.restore();
    }

    // ---------- interaction ----------
    let dragMoved=false, downX=0, downY=0;
    const tip=document.getElementById('tip');
    function nodeAt(cx,cy){ let best=null,bd=1e9; for(const n of NODES){const d=Math.hypot(cx-n.x,cy-n.y);const hit=Math.max(n.r+7,11);if(d<hit&&d<bd){best=n;bd=d;}} return best; }
    function setHot(n){
      if(n===hot)return; hot=n;
      if(n){ litSet=new Set(ADJ[n.id]); if(n.con) NODES.forEach(m=>{ if(m.con===n.con) litSet.add(m.id); }); }
      cv.style.cursor=n?(dragNode?'grabbing':'grab'):'default';
      if(n && !n.labelAlways){
        tip.querySelector('.nm').textContent=n.title;
        tip.querySelector('.tier').textContent = n.kind==='skill' ? (n.deg+' connections') : (n.con?CONST[n.con].name:'');
        tip.style.left=n.x+'px'; tip.style.top=n.y+'px'; tip.style.opacity='1';
      } else tip.style.opacity='0';
    }
    let tmx=0,tmy=0,pmx=0,pmy=0;
    const onMove=e=>{
      const cx=e.clientX,cy=e.clientY;
      if(dragNode){ dragNode.fx=cx; dragNode.fy=cy; reheat(0.35); if(Math.hypot(cx-downX,cy-downY)>4)dragMoved=true; tip.style.opacity='0'; return; }
      tmx=(cx/innerWidth-.5); tmy=(cy/innerHeight-.5);
      setHot(nodeAt(cx,cy));
      if(hot && !hot.labelAlways){ tip.style.left=hot.x+'px'; tip.style.top=hot.y+'px'; }
    };
    const onDown=e=>{
      if(!ready)return; const cx=e.clientX,cy=e.clientY,n=nodeAt(cx,cy);
      if(n && !reduce){ dragNode=n;dragMoved=false;downX=cx;downY=cy;n.fx=n.x;n.fy=n.y;reheat(0.5);cv.style.cursor='grabbing';cv.setPointerCapture(e.pointerId);dismissThesis(); }
      else if(n && reduce){ openFor(n); }
    };
    const onUp=e=>{
      if(dragNode){ const n=dragNode;dragNode=null;n.fx=null;n.fy=null;reheat(0.28);cv.style.cursor=nodeAt(e.clientX,e.clientY)?'grab':'default'; if(!dragMoved) openFor(n); }
    };
    const onCancel=()=>{ if(dragNode){dragNode.fx=null;dragNode.fy=null;dragNode=null;reheat(0.5);} };
    const onLeave=()=>{ if(!dragNode) setHot(null); };
    cv.addEventListener('pointermove',onMove);
    cv.addEventListener('pointerdown',onDown);
    cv.addEventListener('pointerup',onUp);
    cv.addEventListener('pointercancel',onCancel);
    cv.addEventListener('pointerleave',onLeave);
    function openFor(n){ if(n.kind==='proj' && n.tier==='featured') openSpotlight(n); else openPanel(n); }

    // ---------- spotlight ----------
    const spot=document.getElementById('spot'), spotCard=document.getElementById('spot-card');
    let releaseSpotTrap: (() => void) | null = null;
    function openSpotlight(n){
      if(!spot || !spotCard) return;
      const con=n.con?CONST[n.con]:null;
      renderSpotlight(spotCard, {
        title: n.title,
        subtitle: n.subtitle,
        hook: n.hook,
        writeup: n.writeup,
        spanName: n.spanName,
        id: n.id,
        starKind: n.starKind,
        color: n.color,
        stack: n.stack,
        metricsPinned: n.metricsPinned,
        metricsScroll: n.metricsScroll,
        metrics: n.metrics,
        constellationName: con?.name,
        constellationColor: con?.color,
        actions: projectActions(n),
      }, closeSpot);
      spot.classList.add('on');
      spot.setAttribute('aria-hidden','false');
      releaseSpotTrap?.();
      releaseSpotTrap = trapFocus(spotCard);
      dismissThesis();
    }
    function closeSpot(){
      if(!spot) return;
      releaseSpotTrap?.();
      releaseSpotTrap = null;
      spot.classList.remove('on');
      spot.setAttribute('aria-hidden','true');
    }
    spot?.addEventListener('click', e=>{ if(e.target===spot) closeSpot(); });

    // ---------- side panel ----------
    const panel=document.getElementById('panel'), scrim=document.getElementById('scrim');
    const $=id=>document.getElementById(id);
    let releasePanelTrap: (() => void) | null = null;
    const showEl=(el,on)=>{ if(el) el.style.display=on?'':'none'; };
    function openPanel(n){
      if(!panel) return;
      const con=n.con?CONST[n.con]:{name:n.kind==='skill'?'Skill / tech':'',color:n.color};
      const cdot=$('p-cdot'), cname=$('p-cname'), ptitle=$('p-title'), pspan=$('p-span'), phook=$('p-hook');
      const pmetrics=$('p-metrics'), ptags=$('p-tags'), ptaglabel=$('p-taglabel'), prolefoot=$('p-rolefoot'), pacts=$('p-acts');
      if(cdot){ cdot.style.background=con.color; cdot.style.boxShadow=`0 0 8px ${con.color}`; }
      if(cname) cname.textContent=con.name||'';
      if(ptitle) ptitle.textContent=n.title;
      if(n.kind==='skill'){
        if(pspan) pspan.textContent='// skill.'+n.id;
        if(phook) phook.textContent=n.writeup||`Connects ${n.deg} systems.`;
        showEl($('p-metricwrap'),false);
        if(ptaglabel) ptaglabel.textContent='Used in';
        if(ptags) appendTags(ptags, n.to.map(id=>(NMAP[id]?NMAP[id].title:id)));
        showEl($('p-tagwrap'),true); showEl($('p-rolewrap'),false);
        if(pacts) linkActions(pacts, []);
      } else {
        if(pspan) pspan.textContent='// '+(n.spanName||n.id);
        if(phook) phook.textContent=n.hook||'';
        if(pmetrics) appendMetrics(pmetrics, n.metrics||[]);
        showEl($('p-metricwrap'),(n.metrics||[]).length>0);
        if(ptaglabel) ptaglabel.textContent='Stack';
        if(ptags) appendTags(ptags, n.stack||[]);
        showEl($('p-tagwrap'),true);
        const r=n.linkedExperience&&ROLE[n.linkedExperience];
        if(r && prolefoot){ setRoleFooter(prolefoot, r); showEl($('p-rolewrap'),true); }
        else showEl($('p-rolewrap'),false);
        if(pacts) linkActions(pacts, projectActions(n));
      }
      panel.classList.add('open');
      panel.setAttribute('aria-hidden','false');
      scrim?.classList.add('on');
      releasePanelTrap?.();
      releasePanelTrap = trapFocus(panel);
      dismissThesis();
    }
    function closePanel(){
      if(!panel) return;
      releasePanelTrap?.();
      releasePanelTrap = null;
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
      scrim?.classList.remove('on');
    }
    $('p-close')?.addEventListener('click', closePanel);
    scrim?.addEventListener('click', closePanel);

    // ---------- readme / thesis / motion ----------
    const readme=$('readme'), RKEY='portfolio.readme.dismissed';
    const forceReadme=new URLSearchParams(location.search).get('readme')==='1';
    function showReadme(){ readme.classList.add('on'); readme.setAttribute('aria-hidden','false'); }
    function hideReadme(){ readme.classList.remove('on'); readme.setAttribute('aria-hidden','true');
      if($('rd-dna').checked){try{localStorage.setItem(RKEY,'1');}catch{}} startThesis(); }
    $('rd-enter').onclick=hideReadme; $('readme-btn').onclick=()=>{ $('rd-dna').checked=false; showReadme(); };
    readme.onclick=e=>{ if(e.target===readme) hideReadme(); };

    const thesis=$('thesis'), veil=$('thesisveil'), hint=$('hint'); let thesisDone=false, thesisStarted=false;
    function dismissThesis(){ if(!thesisStarted||thesisDone)return; thesisDone=true; thesis.style.opacity='0'; veil.classList.remove('on'); }
    function startThesis(){ if(thesisStarted)return; thesisStarted=true;
      setTimeout(()=>{thesis.style.opacity='1'; veil.classList.add('on');},200);
      setTimeout(()=>{dismissThesis();hint.style.opacity='1';},4800);
      setTimeout(()=>hint.style.opacity='0',11000); }

    const motionBtn=$('motion'); if(!motionOn)motionBtn.classList.add('off');
    motionBtn.onclick=()=>{ motionOn=!motionOn; motionBtn.classList.toggle('off',!motionOn); };
    const legendHead=document.querySelector('#legend .head');
    if(legendHead) legendHead.onclick=()=>document.getElementById('legend').classList.toggle('collapsed');
    const onKey=e=>{ if(e.key==='Escape'){ if(readme.classList.contains('on'))hideReadme(); else if(spot.classList.contains('on'))closeSpot(); else if(panel.classList.contains('open'))closePanel(); }};
    window.addEventListener('keydown',onKey);

    // ---------- resize / loop / boot ----------
    function resize(first){
      DPR=Math.min(window.devicePixelRatio||1,2); CW=innerWidth; CH=innerHeight;
      W=cv.width=Math.floor(innerWidth*DPR); H=cv.height=Math.floor(innerHeight*DPR);
      cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px'; area=innerWidth*innerHeight;
      if(!sprites.length) buildSprites();
      buildBg(); buildNebula(); buildVignette(); if(!grainTiles.length)buildGrain();
      if(ready){ if(first) place(); reheat(first?0.9:0.4); }
    }
    const t0=performance.now();
    function frame(now){
      if(killed) return;
      const t=(now-t0)/1000;
      pmx+=(tmx-pmx)*0.04; pmy+=(tmy-pmy)*0.04;
      const drift=motionOn?Math.sin(t*0.03)*W*0.01:0;
      const ox=(pmx*16*DPR)+drift, oy=(pmy*12*DPR)+(motionOn?Math.cos(t*0.025)*H*0.006:0);

      ctx.fillStyle=bgGrad; ctx.fillRect(0,0,W,H);
      if(neb){ctx.globalAlpha=1;ctx.drawImage(neb,ox*0.4,oy*0.4);}

      ctx.globalCompositeOperation='lighter';
      for(const s of bgStars){
        const tw=motionOn?(0.6+0.4*Math.sin(t*s.tw+s.ph)):0.85;
        ctx.globalAlpha=clamp(s.base*tw,0,1);
        const x=s.x+ox*s.depth-s.size/2, y=s.y+oy*s.depth-s.size/2;
        ctx.drawImage(s.spike?spikeSprite:sprites[s.ci], x, y, s.size, s.size);
      }
      ctx.globalAlpha=1;

      const dt=Math.min(t-lastT,0.05); lastT=t;
      if(motionOn && !reduce){
        if(t>nextMeteor){ nextMeteor=t+9+Math.random()*16; const ang=Math.PI*(0.62+Math.random()*0.26); const sp=(380+Math.random()*260)*DPR;
          meteors.push({x:Math.random()*W*0.9+W*0.05,y:Math.random()*H*0.35,nx:Math.cos(ang),ny:Math.sin(ang),sp,len:(90+Math.random()*120)*DPR,age:0,life:0.9+Math.random()*0.7}); }
        for(const m of meteors){ m.age+=dt; m.x+=m.nx*m.sp*dt; m.y+=m.ny*m.sp*dt; }
        meteors=meteors.filter(m=>m.age<m.life && m.x<W+200 && m.y<H+200);
        for(const m of meteors){ const a=Math.sin(Math.PI*clamp(m.age/m.life,0,1))*0.18; if(a<=0.004)continue;
          const tx=m.x-m.nx*m.len,ty=m.y-m.ny*m.len; const g=ctx.createLinearGradient(m.x,m.y,tx,ty);
          g.addColorStop(0,`rgba(214,230,255,${a})`); g.addColorStop(1,'rgba(214,230,255,0)');
          ctx.strokeStyle=g; ctx.lineWidth=DPR*1.1; ctx.beginPath(); ctx.moveTo(m.x,m.y); ctx.lineTo(tx,ty); ctx.stroke(); }
      }

      if(ready){
        litAmt += ((hot?1:0)-litAmt)*0.09;
        if(!hot && litAmt<0.02 && litSet) litSet=null;
        tick();
        const BUZZ=(motionOn&&!reduce)?3.0:0;
        for(const n of NODES){ if(BUZZ && n.fx==null){ n.rx=n.x+Math.sin(t*n.bzs+n.bzp)*BUZZ; n.ry=n.y+Math.cos(t*n.bzs2+n.bzp2)*BUZZ; } else { n.rx=n.x; n.ry=n.y; } }
        ctx.globalCompositeOperation='source-over';
        drawConstLabels(); drawEdges();
        ctx.globalCompositeOperation='lighter';
        for(const n of NODES) if(n.kind==='skill') drawNode(n,t);
        for(const n of NODES) if(n.kind!=='skill' && n.tier!=='featured') drawNode(n,t);
        for(const n of NODES) if(n.tier==='featured') drawNode(n,t);
        ctx.globalCompositeOperation='source-over';
        for(const n of NODES) drawLabel(n);
      }

      if(vignette) ctx.drawImage(vignette,0,0);
      if(grainPats.length){ctx.globalAlpha=0.45;ctx.fillStyle=grainPats[(gi++>>1)%grainPats.length];ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
      rafId=requestAnimationFrame(frame);
    }

    resize(false);
    const onResize=()=>{clearTimeout(rzTimer);rzTimer=window.setTimeout(()=>resize(false),150);};
    window.addEventListener('resize',onResize);
    rafId=requestAnimationFrame(frame);

    // boot model synchronously from imported JSON
    buildModel(site); CW=innerWidth; CH=innerHeight; place();
    if(reduce){ for(let i=0;i<520;i++) tick(); SIM.alpha=0; }
    ready=true; reheat(0.9);
    let dismissed=false; try{dismissed=!!localStorage.getItem(RKEY);}catch{}
    if(forceReadme||!dismissed) setTimeout(showReadme,650); else startThesis();


  return () => {
    /* eslint-enable prefer-const */
    killed=true; cancelAnimationFrame(rafId); clearTimeout(rzTimer);
    window.removeEventListener('resize',onResize); window.removeEventListener('keydown',onKey);
    cv.removeEventListener('pointermove',onMove); cv.removeEventListener('pointerdown',onDown);
    cv.removeEventListener('pointerup',onUp); cv.removeEventListener('pointercancel',onCancel); cv.removeEventListener('pointerleave',onLeave);
    document.body.style.overflow=prevOverflow;
  };
}
