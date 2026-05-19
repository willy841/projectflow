const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const outDir = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案/assets-v2';
fs.mkdirSync(outDir, { recursive: true });

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function save(name, draw) {
  const canvas = createCanvas(1600, 900);
  const ctx = canvas.getContext('2d');
  draw(ctx, canvas.width, canvas.height);
  fs.writeFileSync(path.join(outDir, name), canvas.toBuffer('image/png'));
}

function bg(ctx,w,h,c1,c2){
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,c1); g.addColorStop(1,c2);
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
}

save('cover.png', (ctx,w,h)=>{
  bg(ctx,w,h,'#0f172a','#312e81');
  ctx.fillStyle = '#7c3aed'; ctx.fillRect(0,0,w,110);
  ctx.fillStyle = '#facc15'; ctx.fillRect(0,760,w,140);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px Sans';
  ctx.fillText('2026 HP 尾牙主題提案', 90, 250);
  ctx.font = '42px Sans';
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText('Mario Kart 瑪利歐賽車主題體驗規劃', 95, 320);
  roundedRect(ctx, 90, 390, 520, 260, 24, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 30px Sans';
  ctx.fillText('提案核心', 125, 445);
  ctx.font = '26px Sans';
  ['入口拱門 → 跑道走道 → 終點背板','沉浸式拍照體驗帶','空間主題化 + 遊戲抽獎包裝'].forEach((t,i)=>ctx.fillText('• '+t,130,500+i*52));
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(980,180); ctx.lineTo(1470,180); ctx.stroke();
  for(let i=0;i<6;i++){ ctx.fillStyle = i%2===0 ? '#ffffff' : '#111827'; ctx.fillRect(980+i*82,120,82,60); }
  ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(1120,420,70,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(1290,500,46,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(1430,360,55,0,Math.PI*2); ctx.fill();
});

save('corridor-concept.png', (ctx,w,h)=>{
  bg(ctx,w,h,'#f8fafc','#dbeafe');
  ctx.fillStyle='#111827'; ctx.font='bold 58px Sans'; ctx.fillText('拍照體驗帶概念', 80, 100);
  ctx.strokeStyle='#475569'; ctx.lineWidth=8; ctx.strokeRect(120,180,1320,520);
  roundedRect(ctx,140,210,280,180,20,'#7c3aed');
  roundedRect(ctx,1180,450,220,180,20,'#2563eb');
  ctx.fillStyle='#fff'; ctx.font='bold 34px Sans'; ctx.fillText('入口拱門', 205, 310);
  ctx.fillText('終點背板', 1225, 555);
  ctx.strokeStyle='#374151'; ctx.lineWidth=18; ctx.setLineDash([28,18]);
  ctx.beginPath(); ctx.moveTo(430,300); ctx.lineTo(1180,300); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#eab308'; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(560+i*100,250+(i%2)*70,20,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(760,420,45,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f59e0b';
  for(let i=0;i<3;i++) roundedRect(ctx,610+i*140,470,90,90,12,'#f59e0b');
});

save('obstacles.png', (ctx,w,h)=>{
  bg(ctx,w,h,'#111827','#1d4ed8');
  ctx.fillStyle='#fff'; ctx.font='bold 60px Sans'; ctx.fillText('障礙物與世界觀元素', 80, 100);
  const cards = [
    ['香蕉皮','#eab308'],['金幣','#facc15'],['彩虹賽道','#a855f7'],['龜殼','#22c55e']
  ];
  cards.forEach((c,i)=>{ const x=90+i*370; roundedRect(ctx,x,190,310,470,26,'rgba(255,255,255,0.1)'); ctx.fillStyle=c[1]; ctx.beginPath(); ctx.arc(x+155,330,70,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.font='bold 36px Sans'; ctx.fillText(c[0],x+95,470); ctx.font='24px Sans'; ctx.fillText('作為代表性節點',x+78,540); ctx.fillText('建立賽道記憶點',x+78,580); });
});

save('brand-style.png', (ctx,w,h)=>{
  bg(ctx,w,h,'#ffffff','#e0f2fe');
  ctx.fillStyle='#0f172a'; ctx.font='bold 58px Sans'; ctx.fillText('品牌整合與風格方向', 80, 100);
  roundedRect(ctx,100,170,540,560,28,'#ffffff');
  roundedRect(ctx,710,170,780,560,28,'#f8fafc');
  ctx.strokeStyle='#cbd5e1'; ctx.strokeRect(100,170,540,560); ctx.strokeRect(710,170,780,560);
  ctx.fillStyle='#2563eb'; ctx.font='bold 52px Sans'; ctx.fillText('HP', 160, 300);
  ctx.fillStyle='#334155'; ctx.font='32px Sans'; ctx.fillText('品牌識別層', 160, 360);
  ctx.fillText('封面 / 頁面識別 / 提案標示', 160, 420);
  ctx.fillStyle='#7c3aed'; ctx.font='bold 44px Sans'; ctx.fillText('Mario Kart World', 770, 300);
  ctx.fillStyle='#334155'; ctx.font='30px Sans';
  ['高辨識、高彩度','競速感與遊戲節奏','企業提案完成度','不讓品牌與世界觀互相打架'].forEach((t,i)=>ctx.fillText('• '+t,770,390+i*64));
});
