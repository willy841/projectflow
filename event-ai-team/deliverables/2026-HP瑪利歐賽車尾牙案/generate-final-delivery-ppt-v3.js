const pptxgen = require('pptxgenjs');
const path = require('path');
const base = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案';
const assets2 = path.join(base, 'assets-v2');
const assets3 = path.join(base, 'assets-v3');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenClaw AI Team';
pptx.company = 'Kuya';
pptx.title = '2026 HP 尾牙主題提案 - AI 團隊測試最終交付版 v3';
pptx.subject = 'AI Team Final Delivery Test';
pptx.lang = 'zh-TW';

function head(slide,title,sub){
  slide.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:0.42,fill:{color:'4C1D95'},line:{color:'4C1D95'}});
  slide.addText(title,{x:0.65,y:0.6,w:8.5,h:0.4,fontSize:25,bold:true,color:'0F172A',margin:0});
  if(sub) slide.addText(sub,{x:0.68,y:1.0,w:9,h:0.25,fontSize:11,color:'64748B',margin:0});
}
function footer(slide,page){ slide.addText(`AI Team Final Delivery Test v3  |  ${page}`,{x:0.65,y:7.08,w:4,h:0.2,fontSize:8,color:'64748B',margin:0}); }
function bullets(slide, arr, x, y, w, fs=15.5, color='1F2937'){
  arr.forEach((t,i)=>slide.addText([{text:t,options:{bullet:{indent:12}}}],{x,y:y+i*0.58,w,h:0.34,fontSize:fs,color,margin:0.02}));
}

// Cover
let s = pptx.addSlide(); s.addImage({path:path.join(assets3,'hero-cover-v3.png'),x:0,y:0,w:13.33,h:7.5});

// 2 concept
s = pptx.addSlide(); s.background={color:'F8FAFC'}; head(s,'提案概念','從起跑到終點，把一段走廊變成瑪利歐賽車體驗帶'); footer(s,2);
bullets(s,[
  '指定區段不做單點背板，而是做完整體驗動線',
  '入口、走道、終點背板共同構成空間敘事',
  '讓賓客在進場、移動、拍照時自然感受世界觀',
  '建立強記憶點與可分享的拍照體驗'
],0.8,1.7,4.9);
s.addImage({path:path.join(assets3,'masterplan-v3.png'),x:5.85,y:1.25,w:6.8,h:5.15});

// 3 masterplan
s = pptx.addSlide(); s.background={color:'FFFFFF'}; head(s,'區段動線總覽','入口拱門 → 跑道走道 → 終點拍照背板'); footer(s,3);
s.addImage({path:path.join(assets3,'masterplan-v3.png'),x:0.65,y:1.25,w:12,h:5.8});

// 4 gate
s = pptx.addSlide(); s.background={color:'F8FAFC'}; head(s,'入口拱門','500cm × 350cm 主識別場景'); footer(s,4);
s.addImage({path:path.join(assets3,'gate-closeup-v3.png'),x:6.2,y:1.25,w:5.9,h:4.95});
bullets(s,[
  '以起跑門 / 闖關入口作為主語彙',
  '搭配棋盤旗、起跑燈、賽事標題感元素',
  '優先做大識別與乾淨結構，不做碎件堆滿',
  '讓賓客一進場就知道主題成立'
],0.8,1.75,4.9);

// 5 walkway
s = pptx.addSlide(); s.background={color:'FFFFFF'}; head(s,'跑道走道','讓移動過程成為主題的一部分'); footer(s,5);
s.addImage({path:path.join(assets2,'corridor-concept.png'),x:0.75,y:1.35,w:6.0,h:4.9});
bullets(s,[
  '走道不是通道，而是整段拍照區的體驗主體',
  '地面可用賽道線條、起跑格、彎道感建立語言',
  '中段用節奏型障礙物形成競速與闖關氛圍',
  '重點是像賽道，不像零散堆飾'
],7.0,1.75,5.0);

// 6 obstacles
s = pptx.addSlide(); s.background={color:'0F172A'}; footer(s,6); s.addImage({path:path.join(assets2,'obstacles.png'),x:0,y:0,w:13.33,h:7.5});

// 7 backdrop
s = pptx.addSlide(); s.background={color:'F8FAFC'}; head(s,'終點拍照背板','終點線 × 衝線感 × 冠軍頒獎台語彙'); footer(s,7);
s.addImage({path:path.join(assets3,'finish-backdrop-v3.png'),x:6.1,y:1.3,w:6.0,h:4.8});
bullets(s,[
  '位置在區段底部，最大寬 500cm / 高 350cm',
  '貼右側牆面，左側保留通道',
  '不做中央舞台型構圖，改做走廊尾端收尾畫面',
  '作為整段體驗的最終記憶點與多人合照主畫面'
],0.8,1.8,4.9);

// 8 game
s = pptx.addSlide(); s.background={color:'FFFFFF'}; head(s,'遊戲主題包裝','讓流程互動延續 Mario Kart 世界觀'); footer(s,8);
bullets(s,[
  '用命名、主持語氣、PPT 視覺與小道具延續主題',
  '不另開大型獨立場景，以控制整體預算密度',
  '讓賽車語言延伸到流程，而不是只停在場地佈置',
  '維持空間主題化優先，不讓遊戲反客為主'
],0.85,1.8,5.0);
s.addImage({path:path.join(assets2,'brand-style.png'),x:6.15,y:1.35,w:5.9,h:4.85});

// 9 lottery
s = pptx.addSlide(); s.background={color:'F8FAFC'}; head(s,'抽獎主題包裝','把抽獎變成賽事敘事的一部分'); footer(s,9);
bullets(s,[
  '延續賽事進程、排名躍升、闖關獎勵等語氣',
  '以命名、標題、話術與簡報視覺作為主軸',
  '讓抽獎不只是流程功能，而是主題體驗延伸',
  '維持成本效率，不另拆重製作模組'
],0.85,1.8,5.0);
s.addImage({path:path.join(assets2,'obstacles.png'),x:6.05,y:1.3,w:6.0,h:4.85});

// 10 brand
s = pptx.addSlide(); s.background={color:'FFFFFF'}; head(s,'品牌與風格整合','HP 作為品牌識別層，Mario Kart 作為主題世界觀層'); footer(s,10);
s.addImage({path:path.join(assets2,'brand-style.png'),x:0.7,y:1.3,w:12,h:5.25});

// 11 summary
s = pptx.addSlide(); s.background={color:'F8FAFC'}; head(s,'提案收斂總結','用有限預算，做出完整而有記憶點的主題體驗'); footer(s,11);
bullets(s,[
  '先把入口、走道、背板三層大場景做成立',
  '以大場景說服力取代大量碎件堆疊',
  '讓遊戲與抽獎延續同一套世界觀語言',
  '建立從起跑到終點的一段完整拍照體驗帶'
],0.85,1.85,5.1);
s.addImage({path:path.join(assets3,'hero-cover-v3.png'),x:6.0,y:1.35,w:6.0,h:4.85});

// 12 notes
s = pptx.addSlide(); s.background={color:'FFFFFF'}; head(s,'交付說明','AI 團隊測試最終交付版（以現有資料條件硬推成品）'); footer(s,12);
bullets(s,[
  '本版目的：讓使用者評估在現有資料下，AI 團隊最終可交付樣貌',
  '此版已不是中間稿，而是強制推到可對客展示層級的測試版',
  '若要追上高完成 Sample，下一階段仍需真實提案級視覺素材與更細版面調校',
  '但就測試目的而言，本版已足以拿來比較 AI 交付極限與人工 Sample 差距'
],0.85,1.75,11.2);

pptx.writeFile({ fileName: path.join(base, '2026-HP瑪利歐賽車尾牙案-AI團隊測試最終交付版-v3.pptx') });
