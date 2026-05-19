const pptxgen = require('pptxgenjs');
const path = require('path');
const base = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案';
const a2 = path.join(base,'assets-v2');
const a3 = path.join(base,'assets-v3');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenClaw AI Team';
pptx.title = '2026 HP Mario Kart Regression Final Deck v2';
pptx.subject = 'Post-restructure regression test final delivery';
pptx.lang = 'zh-TW';
function top(s,c='4C1D95'){s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:0.34,fill:{color:c},line:{color:c}})}
function head(s,t,sub=''){s.addText(t,{x:0.72,y:0.55,w:8.7,h:0.42,fontSize:25,bold:true,color:'0F172A',margin:0}); if(sub) s.addText(sub,{x:0.74,y:0.96,w:10,h:0.22,fontSize:10.5,color:'64748B',margin:0});}
function foot(s,p){s.addText(`Post-restructure Regression Final Deck v2 | ${p}`,{x:0.72,y:7.08,w:4.2,h:0.2,fontSize:8,color:'64748B',margin:0});}
function bullets(s, arr, x, y, w, fs=15){arr.forEach((t,i)=>s.addText([{text:t,options:{bullet:{indent:12}}}],{x,y:y+i*0.54,w,h:0.3,fontSize:fs,color:'1F2937',margin:0.02}));}

let s = pptx.addSlide(); s.addImage({path:path.join(a3,'hero-cover-v3.png'),x:0,y:0,w:13.33,h:7.5});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'提案概念','把指定區段做成一段從起跑到終點的 Mario Kart 拍照體驗帶'); foot(s,2);
s.addText('這不是一組拍照佈置，而是一段完整體驗。',{x:0.86,y:1.45,w:5.1,h:0.28,fontSize:18,bold:true,color:'1E3A8A'});
bullets(s,['入口先建立主題情境','中段用賽道與障礙節奏形成體驗','終點背板作為照片與記憶收尾','遊戲 / 抽獎延伸同一世界觀'],0.9,1.98,5.0);
s.addImage({path:path.join(a3,'masterplan-v3.png'),x:5.95,y:1.24,w:6.15,h:5.05});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'體驗動線總覽','入口拱門 → 跑道走道 → 終點拍照背板'); foot(s,3); s.addImage({path:path.join(a3,'masterplan-v3.png'),x:0.7,y:1.2,w:12.0,h:5.82});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'入口拱門主畫面','500 x 350 主識別場景'); foot(s,4);
bullets(s,['以起跑門 / 闖關入口作為主語彙','搭配棋盤旗、起跑燈、賽事標題感','以大識別與乾淨結構為主','讓賓客一進場就理解主題'],0.86,1.78,4.95);
s.addImage({path:path.join(a3,'gate-closeup-v3.png'),x:6.0,y:1.28,w:6.0,h:4.9});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'跑道走道主畫面','讓走道成為提案主體的一部分'); foot(s,5);
s.addImage({path:path.join(a2,'corridor-concept.png'),x:0.8,y:1.34,w:6.0,h:4.88});
bullets(s,['地面以賽道線條、起跑格、彎道感建立語言','中段用節奏型障礙物形成競速與闖關氛圍','不是平均鋪滿，而是做前進感與節點','讓客戶看見「這不是普通通道」'],6.98,1.78,5.1);

s = pptx.addSlide(); s.background={color:'0F172A'}; foot(s,6); s.addImage({path:path.join(a2,'obstacles.png'),x:0,y:0,w:13.33,h:7.5});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'終點拍照背板主畫面','終點線 × 衝線感 × 冠軍感的收尾構圖'); foot(s,7);
bullets(s,['位置在區段底部，右貼牆、左側留通道','不做中央舞台式構圖，而做走廊尾端收尾畫面','讓最後的照片成為整案最強記憶點','兼顧遠看識別與近拍合照效果'],0.85,1.82,4.95);
s.addImage({path:path.join(a3,'finish-backdrop-v3.png'),x:6.0,y:1.3,w:6.0,h:4.85});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'遊戲主題包裝','流程不是另外一套，而是主題體驗的延伸'); foot(s,8);
bullets(s,['以命名、主持語氣、頁面視覺與小道具延續 Mario Kart 世界觀','不另開大型重場景，避免預算失焦','讓互動流程與空間提案使用同一套語言','以體驗延伸而不是功能列表方式提案'],0.84,1.8,5.05);
s.addImage({path:path.join(a2,'brand-style.png'),x:6.06,y:1.28,w:5.96,h:4.9});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'抽獎主題包裝','讓抽獎也成為賽事敘事的一部分'); foot(s,9);
bullets(s,['延續賽事進程、排名躍升、闖關獎勵語氣','透過標題、話術與簡報視覺建立主題一致性','不是多一段行政流程，而是整體體驗的延伸','維持成本效率，不另拆第二套重製作'],0.84,1.82,5.05);
s.addImage({path:path.join(a2,'obstacles.png'),x:6.02,y:1.28,w:6.0,h:4.9});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'品牌與風格整合','HP 作為品牌識別層，Mario Kart 作為世界觀層'); foot(s,10); s.addImage({path:path.join(a2,'brand-style.png'),x:0.72,y:1.28,w:12.0,h:5.25});

s = pptx.addSlide(); s.background={color:'F8FAFC'}; top(s); head(s,'提案收斂總結','在約 60 萬預算條件下，集中資源把主場景做成立'); foot(s,11);
bullets(s,['先保入口、走道、背板三大場景的成立','障礙物採代表性節點，不做無上限碎件堆滿','遊戲 / 抽獎以主題語言延伸，不另開重場景','目標是讓客戶先有畫面，再理解規劃'],0.86,1.82,5.0);
s.addImage({path:path.join(a3,'hero-cover-v3.png'),x:6.0,y:1.3,w:6.0,h:4.85});

s = pptx.addSlide(); s.background={color:'FFFFFF'}; top(s); head(s,'交付判讀','這版是用新規格重跑後，硬推到可驗收的回歸測試版'); foot(s,12);
bullets(s,['此版目的不是假裝完美，而是驗證修正後的團隊能否更接近 proposal 成品','若仍與高完成 Sample 差距大，問題將被明確定位為能力層級不足','這版至少應比舊版本更像提案，而不是更像整理文件','本版完成後，應由使用者直接判斷是否足以進入下一輪能力補強'],0.86,1.82,11.2);

pptx.writeFile({ fileName: path.join(base, '2026-HP瑪利歐賽車尾牙案-重構後回歸測試最終版-v2.pptx') });
