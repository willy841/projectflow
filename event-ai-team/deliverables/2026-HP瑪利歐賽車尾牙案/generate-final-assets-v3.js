const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const outDir = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案/assets-v3';
fs.mkdirSync(outDir, { recursive: true });

function rr(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function bg(ctx,w,h,a,b){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function save(name, draw){const c=createCanvas(1600,900);const ctx=c.getContext('2d');draw(ctx,c.width,c.height);fs.writeFileSync(path.join(outDir,name), c.toBuffer('image/png'));}

save('hero-cover-v3.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#111827','#1d4ed8');
  ctx.fillStyle='#7c3aed'; ctx.fillRect(0,0,w,120);
  ctx.fillStyle='#ffffff'; ctx.font='bold 88px Sans'; ctx.fillText('2026 HP 尾牙主題提案',90,220);
  ctx.font='42px Sans'; ctx.fillStyle='#dbeafe'; ctx.fillText('Mario Kart 瑪利歐賽車主題體驗規劃',95,290);
  rr(ctx,90,355,560,250,26,'rgba(255,255,255,0.10)');
  ctx.fillStyle='#fff'; ctx.font='bold 30px Sans'; ctx.fillText('拍照體驗帶主軸',120,410);
  ctx.font='25px Sans'; ['入口拱門','跑道走道','終點拍照背板','遊戲 / 抽獎主題包裝'].forEach((t,i)=>ctx.fillText('• '+t,125,470+i*48));
  // pseudo scene
  ctx.strokeStyle='#facc15'; ctx.lineWidth=14; ctx.beginPath(); ctx.moveTo(920,680); ctx.lineTo(1500,680); ctx.stroke();
  for(let i=0;i<8;i++){ ctx.fillStyle=i%2===0?'#ffffff':'#111827'; ctx.fillRect(930+i*70,130,70,55); }
  rr(ctx,960,170,460,170,24,'rgba(255,255,255,0.08)');
  ctx.fillStyle='#fff'; ctx.font='bold 40px Sans'; ctx.fillText('START GATE',1080,275);
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=12; ctx.setLineDash([26,18]); ctx.beginPath(); ctx.moveTo(1040,430); ctx.lineTo(1420,430); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(1160,540,56,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#eab308'; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(1260+i*60,500-(i%2)*35,20,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(1460,560,42,0,Math.PI*2); ctx.fill();
  rr(ctx,1200,610,220,110,18,'#2563eb'); ctx.fillStyle='#fff'; ctx.font='bold 34px Sans'; ctx.fillText('FINISH',1255,678);
});

save('masterplan-v3.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#f8fafc','#e0f2fe');
  ctx.fillStyle='#0f172a'; ctx.font='bold 62px Sans'; ctx.fillText('體驗動線總覽',70,90);
  rr(ctx,90,160,1420,610,28,'#ffffff');
  ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=4; ctx.strokeRect(90,160,1420,610);
  rr(ctx,130,235,270,160,18,'#7c3aed'); ctx.fillStyle='#fff'; ctx.font='bold 34px Sans'; ctx.fillText('入口拱門',195,325);
  ctx.strokeStyle='#334155'; ctx.lineWidth=18; ctx.setLineDash([30,20]); ctx.beginPath(); ctx.moveTo(420,315); ctx.lineTo(1160,315); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#eab308'; for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(560+i*110,255+(i%2)*75,20,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(860,465,52,0,Math.PI*2); ctx.fill();
  rr(ctx,1170,470,240,170,18,'#2563eb'); ctx.fillStyle='#fff'; ctx.font='bold 38px Sans'; ctx.fillText('終點背板',1228,565);
  ctx.fillStyle='#334155'; ctx.font='28px Sans';
  ['從進場就建立主題感','中段以障礙節奏形成世界觀','走到底完成拍照與記憶點'].forEach((t,i)=>ctx.fillText('• '+t,180,690+i*0));
});

save('gate-closeup-v3.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#ede9fe','#dbeafe');
  ctx.fillStyle='#1f2937'; ctx.font='bold 60px Sans'; ctx.fillText('入口拱門主視覺',70,95);
  rr(ctx,260,180,1080,430,26,'#5b21b6');
  for(let i=0;i<10;i++){ ctx.fillStyle=i%2===0?'#fff':'#111827'; ctx.fillRect(320+i*70,205,70,55); }
  ctx.fillStyle='#fff'; ctx.font='bold 72px Sans'; ctx.fillText('MARIO KART PARTY',470,410);
  ctx.fillStyle='#fde68a'; ctx.beginPath(); ctx.arc(450,500,35,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(1150,500,35,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#334155'; ctx.font='30px Sans'; ctx.fillText('500 x 350 大尺度主識別場景',470,515);
});

save('finish-backdrop-v3.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#dbeafe','#eff6ff');
  ctx.fillStyle='#0f172a'; ctx.font='bold 60px Sans'; ctx.fillText('終點拍照背板主畫面',70,90);
  rr(ctx,260,190,1040,410,24,'#2563eb');
  ctx.strokeStyle='#f8fafc'; ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(300,250); ctx.lineTo(1260,250); ctx.stroke();
  for(let i=0;i<12;i++){ ctx.fillStyle=i%2===0?'#fff':'#111827'; ctx.fillRect(300+i*80,230,80,40); }
  ctx.fillStyle='#fff'; ctx.font='bold 64px Sans'; ctx.fillText('FINISH LINE',560,385);
  ctx.font='34px Sans'; ctx.fillText('終點線 / 衝線感 / 冠軍頒獎台語彙',460,460);
  rr(ctx,660,500,250,70,16,'rgba(255,255,255,0.18)'); ctx.fillStyle='#fff'; ctx.font='bold 28px Sans'; ctx.fillText('多人合照主畫面',705,545);
});
