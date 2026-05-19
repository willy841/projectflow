const pptxgen = require('pptxgenjs');
const path = require('path');
const base = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案';
const a2 = path.join(base,'assets-v2');
const a3 = path.join(base,'assets-v3');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenClaw AI Team';
pptx.title = '2026 HP Mario Kart Regression Final Deck v1';
pptx.subject = 'Post-restructure regression test';
pptx.lang = 'zh-TW';

function topbar(s,color='4C1D95'){s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:0.36,fill:{color},line:{color}})}
function title(s,t,sub=''){s.addText(t,{x:0.68,y:0.56,w:8.5,h:0.42,fontSize:24,bold:true,color:'0F172A',margin:0}); if(sub) s.addText(sub,{x:0.7,y:0.95,w:10,h:0.22,fontSize:10.5,color:'64748B',margin:0});}
function footer(s,p){s.addText(`Regression Test Final Deck v1 | ${p}`,{x:0.68,y:7.08,w:3.5,h:0.2,fontSize:8,color:'64748B',margin:0});}
function bullets(s, arr, x, y, w){arr.forEach((t,i)=>s.addText([{text:t,options:{bullet:{indent:12}}}],{x,y:y+i*0.56,w,h:0.32,fontSize:15,color:'1F2937',margin:0.02}));}

let s = pptx.addSlide(); s.addImage({path:path.join(a3,'hero-cover-v3.png'),x:0,y:0,w:13.33,h:7.5});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; topbar(s); title(s,'提案概念','把拍照區從單一背板，升級成完整 Mario Kart 體驗帶'); footer(s,2);
s.addText('這不是單點佈置，而是一段從起跑到終點的主題空間體驗。',{x:0.85,y:1.45,w:5.3,h:0.32,fontSize:18,bold:true,color:'1E3A8A'});
bullets(s,['入口建立情境','走道承接賽道氛圍','終點背板完成拍照記憶點','遊戲與抽獎延續同一套世界觀'],0.9,2.0,5.0);
s.addImage({path:path.join(a3,'masterplan-v3.png'),x:6.0,y:1.25,w:6.2,h:5.0});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; topbar(s); title(s,'體驗動線總覽','入口拱門 → 跑道走道 → 終點拍照背板'); footer(s,3); s.addImage({path:path.join(a3,'masterplan-v3.png'),x:0.7,y:1.2,w:12,h:5.8});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; topbar(s); title(s,'入口拱門主畫面','500 x 350 的大尺度主識別場景'); footer(s,4);
bullets(s,['起跑門 / 闖關入口語彙','棋盤旗、起跑燈、賽事標題感','不做碎件堆滿，先做一眼辨識','進場就讓主題成立'],0.85,1.75,4.8);
s.addImage({path:path.join(a3,'gate-closeup-v3.png'),x:6.0,y:1.28,w:6.0,h:4.9});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; topbar(s); title(s,'跑道走道主畫面','讓移動路徑變成提案主體的一部分'); footer(s,5);
s.addImage({path:path.join(a2,'corridor-concept.png'),x:0.75,y:1.35,w:6.0,h:4.9});
bullets(s,['賽道線條、起跑格、彎道語彙建立體驗感','障礙物要形成節奏，不是平均亂塞','中段以節點式方式建立闖關與競速氣氛','走道要像場景，不像裝飾通道'],7.0,1.75,5.0);

s = pptx.addSlide(); s.background={color:'0F172A'}; footer(s,6); s.addImage({path:path.join(a2,'obstacles.png'),x:0,y:0,w:13.33,h:7.5});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; topbar(s); title(s,'終點背板主畫面','終點線 × 衝線感 × 冠軍感的拍照收尾'); footer(s,7);
bullets(s,['背板位於區段底部，右貼牆、左側留通道','不做中央舞台式構圖，改做走廊尾端收尾畫面','讓拍照畫面成為整段體驗的最後記憶點','兼顧遠看識別與近拍合照效果'],0.82,1.8,4.9);
s.addImage({path:path.join(a3,'finish-backdrop-v3.png'),x:6.0,y:1.3,w:6.0,h:4.85});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; topbar(s); title(s,'遊戲主題包裝','讓流程延續 Mario Kart 世界觀'); footer(s,8);
bullets(s,['命名、主持語氣與小道具延續賽車語言','不另開大型獨立場景，避免預算失焦','讓互動流程和場景提案使用同一套世界觀','維持空間主題化優先'],0.85,1.8,5.0);
s.addImage({path:path.join(a2,'brand-style.png'),x:6.05,y:1.28,w:6.0,h:4.9});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; topbar(s); title(s,'抽獎主題包裝','讓抽獎也成為賽事敘事的一部分'); footer(s,9);
bullets(s,['延續賽事進程、排名、闖關獎勵的語氣','以標題、話術與簡報視覺做主題整合','避免拆出另一套重製作內容','讓抽獎也具備體驗感與一致性'],0.85,1.8,5.0);
s.addImage({path:path.join(a2,'obstacles.png'),x:6.02,y:1.28,w:6.0,h:4.9});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; topbar(s); title(s,'品牌與風格整合','HP 是品牌識別層，Mario Kart 是主題世界觀層'); footer(s,10); s.addImage({path:path.join(a2,'brand-style.png'),x:0.72,y:1.28,w:12,h:5.25});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; topbar(s); title(s,'提案收斂總結','在約 60 萬條件下，集中資源把主場景做成立'); footer(s,11);
bullets(s,['先保入口、走道、背板三大場景的成立','障礙物以代表性節點帶出節奏，不做無上限堆滿','遊戲 / 抽獎用主題語言延伸，不另開重場景','目標是讓客戶先有畫面，再理解內容'],0.85,1.8,5.0);
s.addImage({path:path.join(a3,'hero-cover-v3.png'),x:6.0,y:1.3,w:6.0,h:4.85});

pptx.writeFile({ fileName: path.join(base, '2026-HP瑪利歐賽車尾牙案-重構後回歸測試最終版-v1.pptx') });
