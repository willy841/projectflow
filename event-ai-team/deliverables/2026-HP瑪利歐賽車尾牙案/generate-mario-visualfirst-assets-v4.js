const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const outDir = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案/assets-v4';
fs.mkdirSync(outDir, { recursive: true });
function rr(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function bg(ctx,w,h,a,b){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function save(name, draw){const c=createCanvas(1600,900);const ctx=c.getContext('2d');draw(ctx,c.width,c.height);fs.writeFileSync(path.join(outDir,name), c.toBuffer('image/png'));}

save('hero-cinematic-v4.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#0f172a','#1d4ed8');
  ctx.fillStyle='#ef4444'; ctx.fillRect(0,0,w,110);
  ctx.fillStyle='#fff'; ctx.font='bold 92px Sans'; ctx.fillText('2026 HP YEAR END PARTY',80,180);
  ctx.font='bold 78px Sans'; ctx.fillStyle='#facc15'; ctx.fillText('MARIO KART EXPERIENCE',82,270);
  ctx.font='30px Sans'; ctx.fillStyle='#e2e8f0'; ctx.fillText('從起跑到終點的主題拍照體驗帶',86,330);
  // cinematic scene
  rr(ctx,60,390,1480,420,30,'rgba(255,255,255,0.06)');
  ctx.strokeStyle='#f8fafc'; ctx.lineWidth=16; ctx.beginPath(); ctx.moveTo(180,720); ctx.bezierCurveTo(450,640,650,790,980,680); ctx.bezierCurveTo(1180,620,1320,650,1490,560); ctx.stroke();
  ctx.strokeStyle='#facc15'; ctx.lineWidth=8; ctx.setLineDash([22,18]); ctx.beginPath(); ctx.moveTo(190,715); ctx.bezierCurveTo(450,640,650,790,980,680); ctx.bezierCurveTo(1180,620,1320,650,1490,560); ctx.stroke(); ctx.setLineDash([]);
  // gate
  rr(ctx,190,440,330,180,22,'#7c3aed');
  for(let i=0;i<6;i++){ctx.fillStyle=i%2===0?'#fff':'#111827';ctx.fillRect(220+i*45,445,45,35);} 
  ctx.fillStyle='#fff'; ctx.font='bold 34px Sans'; ctx.fillText('START',300,555);
  // obstacles
  ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(720,640,58,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#eab308'; for(let i=0;i<5;i++){ctx.beginPath(); ctx.arc(920+i*55,560-(i%2)*35,18,0,Math.PI*2); ctx.fill();}
  ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(1260,620,46,0,Math.PI*2); ctx.fill();
  rr(ctx,1260,440,230,130,20,'#2563eb'); ctx.fillStyle='#fff'; ctx.font='bold 38px Sans'; ctx.fillText('FINISH',1315,520);
});

save('scene-gate-v4.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#ede9fe','#dbeafe');
  ctx.fillStyle='#111827'; ctx.font='bold 64px Sans'; ctx.fillText('ENTRY GATE SCENE',70,95);
  rr(ctx,210,180,1180,460,28,'#6d28d9');
  for(let i=0;i<10;i++){ctx.fillStyle=i%2===0?'#fff':'#111827'; ctx.fillRect(270+i*74,205,74,46);} 
  ctx.fillStyle='#fff'; ctx.font='bold 72px Sans'; ctx.fillText('MARIO KART',510,405);
  ctx.font='32px Sans'; ctx.fillText('STARTING GATE EXPERIENCE',520,470);
  ctx.fillStyle='#facc15'; ctx.beginPath(); ctx.arc(410,540,28,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(1190,540,28,0,Math.PI*2); ctx.fill();
});

save('scene-corridor-v4.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#eff6ff','#e0f2fe');
  ctx.fillStyle='#111827'; ctx.font='bold 64px Sans'; ctx.fillText('RACE CORRIDOR SCENE',70,90);
  rr(ctx,100,170,1420,590,28,'#ffffff');
  ctx.strokeStyle='#334155'; ctx.lineWidth=28; ctx.beginPath(); ctx.moveTo(180,600); ctx.bezierCurveTo(420,430,720,740,1110,520); ctx.bezierCurveTo(1260,430,1380,430,1490,360); ctx.stroke();
  ctx.strokeStyle='#facc15'; ctx.lineWidth=10; ctx.setLineDash([30,20]); ctx.beginPath(); ctx.moveTo(180,600); ctx.bezierCurveTo(420,430,720,740,1110,520); ctx.bezierCurveTo(1260,430,1380,430,1490,360); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(650,560,52,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f59e0b'; rr(ctx,860,580,90,90,14,'#f59e0b'); rr(ctx,980,440,90,90,14,'#f59e0b');
  ctx.fillStyle='#facc15'; for(let i=0;i<4;i++){ctx.beginPath(); ctx.arc(1080+i*60,300+(i%2)*45,18,0,Math.PI*2); ctx.fill();}
});

save('scene-finish-v4.png',(ctx,w,h)=>{
  bg(ctx,w,h,'#dbeafe','#ffffff');
  ctx.fillStyle='#111827'; ctx.font='bold 64px Sans'; ctx.fillText('FINISH BACKDROP SCENE',70,92);
  rr(ctx,260,180,1040,420,28,'#2563eb');
  for(let i=0;i<12;i++){ctx.fillStyle=i%2===0?'#fff':'#111827'; ctx.fillRect(300+i*80,210,80,36);} 
  ctx.fillStyle='#fff'; ctx.font='bold 70px Sans'; ctx.fillText('FINISH LINE',540,365);
  ctx.font='34px Sans'; ctx.fillText('PHOTO MOMENT / WINNER ENERGY / GROUP SHOT',365,445);
  rr(ctx,660,500,250,70,14,'rgba(255,255,255,0.22)'); ctx.fillStyle='#fff'; ctx.font='bold 28px Sans'; ctx.fillText('GROUP PHOTO AREA',685,545);
});
