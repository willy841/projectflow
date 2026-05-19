const pptxgen = require('pptxgenjs');
const path = require('path');
const base = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案';
const a2 = path.join(base,'assets-v2');
const a4 = path.join(base,'assets-v4');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenClaw AI Team';
pptx.title = '2026 HP Mario Kart Visual-first Final Deck v3';
pptx.subject = 'Visual-first mario redo';
pptx.lang = 'zh-TW';
function top(s,c='4C1D95'){s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:0.28,fill:{color:c},line:{color:c}})}
function head(s,t,sub=''){s.addText(t,{x:0.7,y:0.46,w:9.0,h:0.38,fontSize:24,bold:true,color:'0F172A',margin:0}); if(sub) s.addText(sub,{x:0.72,y:0.84,w:10,h:0.2,fontSize:10.5,color:'64748B',margin:0});}
function foot(s,p){s.addText(`Visual-first Mario Redo v3 | ${p}`,{x:0.72,y:7.08,w:3.6,h:0.18,fontSize:8,color:'64748B',margin:0});}
function bullets(s, arr, x, y, w, fs=14.5){arr.forEach((t,i)=>s.addText([{text:t,options:{bullet:{indent:12}}}],{x,y:y+i*0.5,w,h:0.28,fontSize:fs,color:'1F2937',margin:0.02}));}

let s = pptx.addSlide(); s.addImage({path:path.join(a4,'hero-cinematic-v4.png'),x:0,y:0,w:13.33,h:7.5});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'提案概念','不是一組拍照背板，而是一段完整 Mario Kart 拍照體驗帶'); foot(s,2);
s.addText('客戶要買單的，不是單點裝飾，而是完整主題體驗。',{x:0.78,y:1.26,w:5.2,h:0.26,fontSize:18,bold:true,color:'1E3A8A'});
bullets(s,['入口先建立主題情境','走道讓人進入競速與闖關感','終點背板完成合照與主題記憶點','遊戲 / 抽獎用同一世界觀延伸'],0.82,1.72,4.95);
s.addImage({path:path.join(a2,'corridor-concept.png'),x:6.05,y:1.22,w:6.1,h:5.0});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'入口拱門主畫面','500 x 350 主識別場景'); foot(s,3);
s.addImage({path:path.join(a4,'scene-gate-v4.png'),x:0.78,y:1.15,w:7.1,h:5.25});
bullets(s,['用起跑門 / 闖關入口建立進場儀式感','一進場就知道這不是一般尾牙，而是 Mario Kart 主題區','以大識別與氣勢優先，不以碎件堆疊取勝'],8.25,1.95,4.25);

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'跑道走道主畫面','讓移動路徑也變成主題體驗的一部分'); foot(s,4);
s.addImage({path:path.join(a4,'scene-corridor-v4.png'),x:0.78,y:1.15,w:7.1,h:5.25});
bullets(s,['以賽道線條、彎道與障礙節點建立前進感','香蕉皮、金幣、龜殼與道具箱不再是裝飾，而是節奏主體','讓客戶直接想像人走進去會看到什麼'],8.25,1.95,4.25);

s = pptx.addSlide(); s.background={color:'0F172A'}; foot(s,5); s.addImage({path:path.join(a2,'obstacles.png'),x:0,y:0,w:13.33,h:7.5});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'終點背板主畫面','把合照畫面變成最後的主題記憶點'); foot(s,6);
s.addImage({path:path.join(a4,'scene-finish-v4.png'),x:0.78,y:1.15,w:7.1,h:5.25});
bullets(s,['終點線、衝線感與冠軍語彙結合成最後主畫面','背板貼右牆、左側留通道，因此構圖以走廊尾端收尾感為主','目標不是只做背景，而是做出會被記住的照片場景'],8.25,1.9,4.25);

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'活動內容延伸','遊戲與抽獎不是另外一套，而是主題體驗的延伸'); foot(s,7);
bullets(s,['遊戲以關卡、賽道任務、道具感語氣包裝','抽獎延續賽事進程與闖關獎勵語言','讓整體 proposal 不只場景漂亮，也有完整內容'],0.9,1.75,5.2,15);
s.addImage({path:path.join(a2,'brand-style.png'),x:6.0,y:1.2,w:6.05,h:4.95});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'品牌與風格整合','HP 負責品牌識別，Mario Kart 負責世界觀氛圍'); foot(s,8); s.addImage({path:path.join(a2,'brand-style.png'),x:0.8,y:1.22,w:11.9,h:5.25});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'提案總結','在約 60 萬預算下，把最有感的體驗先做出來'); foot(s,9);
bullets(s,['優先讓入口、走道、背板三個大場景成立','障礙物不求亂多，而求節奏與記憶點','遊戲 / 抽獎延續世界觀，不另開第二主場景','整份 proposal 的目的，是讓客戶先看見現場，再理解規劃'],0.9,1.78,5.15,15);
s.addImage({path:path.join(a4,'hero-cinematic-v4.png'),x:6.0,y:1.22,w:6.05,h:4.95});

pptx.writeFile({ fileName: path.join(base, '2026-HP瑪利歐賽車尾牙案-視覺主導重做最終版-v3.pptx') });
