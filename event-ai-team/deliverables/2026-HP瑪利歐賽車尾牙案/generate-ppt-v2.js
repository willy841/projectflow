const pptxgen = require('pptxgenjs');
const path = require('path');

const base = '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案';
const assets = path.join(base, 'assets-v2');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenClaw AI Team';
pptx.company = 'Kuya';
pptx.subject = '2026 HP Mario Kart Proposal';
pptx.title = '2026 HP 尾牙主題提案 - 設計版 v2';
pptx.lang = 'zh-TW';

function addHeader(slide, title){
  slide.addShape(pptx.ShapeType.rect,{x:0,y:0,w:13.33,h:0.45,fill:{color:'5B21B6'},line:{color:'5B21B6'}});
  slide.addText(title,{x:0.6,y:0.62,w:10,h:0.5,fontSize:24,bold:true,color:'0F172A',margin:0});
}
function addFooter(slide, page){
  slide.addText(`2026 HP Mario Kart Proposal  |  ${page}`,{x:0.6,y:7.1,w:3.5,h:0.2,fontSize:8,color:'64748B',margin:0});
}
function addBullets(slide, bullets, x=0.8, y=1.5, w=5.0){
  bullets.forEach((b,i)=>slide.addText([{text:b,options:{bullet:{indent:12}}}],{x,y:y+i*0.62,w,h:0.38,fontSize:16,color:'1F2937',margin:0.02}));
}

// 1 Cover
let s = pptx.addSlide();
s.addImage({path:path.join(assets,'cover.png'),x:0,y:0,w:13.33,h:7.5});

// 2 concept
s = pptx.addSlide(); s.background={color:'F8FAFC'}; addHeader(s,'提案概念'); addFooter(s,2);
s.addText('從起跑到終點，把一段走廊變成瑪利歐賽車體驗帶',{x:0.8,y:1.25,w:6,h:0.5,fontSize:20,bold:true,color:'1E3A8A'});
addBullets(s,[
  '指定區段不做單點背板，而是做完整體驗動線',
  '入口、走道、終點背板共同構成空間敘事',
  '讓賓客在進場、拍照與移動中感受到世界觀',
  '建立可拍、可看、可記憶的主題體驗'
],0.9,2.0,5.2);
s.addImage({path:path.join(assets,'corridor-concept.png'),x:6.5,y:1.35,w:6.1,h:4.9});

// 3 logic
s = pptx.addSlide(); s.background={color:'FFFFFF'}; addHeader(s,'整體體驗邏輯'); addFooter(s,3);
s.addImage({path:path.join(assets,'corridor-concept.png'),x:0.6,y:1.2,w:7.0,h:5.3});
addBullets(s,[
  '入口拱門：建立正式進入賽道世界的第一印象',
  '跑道走道：以移動中的節奏形成主題氛圍',
  '終點背板：承接合照與主題記憶點',
  '完整體驗順序為「入口 → 跑道 → 終點」'
],7.9,1.7,4.5);

// 4 entry gate
s = pptx.addSlide(); s.background={color:'F8FAFC'}; addHeader(s,'入口拱門規劃'); addFooter(s,4);
s.addText('500cm × 350cm 主識別場景',{x:0.9,y:1.25,w:4,h:0.4,fontSize:22,bold:true,color:'7C3AED'});
addBullets(s,[
  '以起跑門 / 闖關入口作為主語彙',
  '搭配棋盤旗、起跑燈、賽事標題感元素',
  '以大識別與乾淨結構為主',
  '進場即懂主題，不做碎件堆滿'
],0.9,2.0,4.8);
s.addImage({path:path.join(assets,'cover.png'),x:5.8,y:1.3,w:6.7,h:4.6});

// 5 corridor
s = pptx.addSlide(); s.background={color:'FFFFFF'}; addHeader(s,'跑道走道規劃'); addFooter(s,5);
s.addImage({path:path.join(assets,'corridor-concept.png'),x:0.8,y:1.45,w:6.0,h:4.8});
addBullets(s,[
  '走道不是通道，而是拍照區體驗主體',
  '地面可運用賽道線條、起跑格、彎道感',
  '中段以節奏型障礙物形成闖關氛圍',
  '以節奏取勝，不以密度取勝'
],7.1,1.8,5.0);

// 6 obstacles
s = pptx.addSlide(); s.background={color:'0F172A'}; addFooter(s,6);
s.addImage({path:path.join(assets,'obstacles.png'),x:0,y:0,w:13.33,h:7.5});

// 7 backdrop
s = pptx.addSlide(); s.background={color:'F8FAFC'}; addHeader(s,'終點拍照背板規劃'); addFooter(s,7);
s.addText('終點線 × 衝線感 × 冠軍頒獎台語彙',{x:0.9,y:1.2,w:5.5,h:0.4,fontSize:22,bold:true,color:'2563EB'});
addBullets(s,[
  '位置在區段底部，最大寬 500cm / 高 350cm',
  '貼右側牆面，左側保留通道',
  '不做中央舞台型構圖',
  '作為整段體驗的收尾主畫面與合照點'
],0.9,1.95,5.0);
s.addImage({path:path.join(assets,'corridor-concept.png'),x:6.4,y:1.4,w:5.8,h:4.6});

// 8 game package
s = pptx.addSlide(); s.background={color:'FFFFFF'}; addHeader(s,'遊戲主題包裝'); addFooter(s,8);
addBullets(s,[
  '將遊戲包裝進 Mario Kart 世界觀之中',
  '透過命名、主持語氣、簡報視覺與小道具延續主題',
  '不另開大型獨立場景',
  '讓流程互動與空間氛圍保持一致'
],0.9,1.6,5.2);
s.addImage({path:path.join(assets,'brand-style.png'),x:6.0,y:1.3,w:6.3,h:4.8});

// 9 lottery
s = pptx.addSlide(); s.background={color:'F8FAFC'}; addHeader(s,'抽獎主題包裝'); addFooter(s,9);
addBullets(s,[
  '抽獎延續賽事進程、排名躍升、闖關獎勵語氣',
  '讓抽獎成為主題敘事的一部分',
  '以命名、標題、話術與簡報視覺為主',
  '維持成本效率，不另拆重製作模組'
],0.9,1.65,5.2);
s.addImage({path:path.join(assets,'obstacles.png'),x:6.1,y:1.35,w:6.3,h:4.9});

// 10 brand
s = pptx.addSlide(); s.background={color:'FFFFFF'}; addHeader(s,'整體風格與品牌整合'); addFooter(s,10);
s.addImage({path:path.join(assets,'brand-style.png'),x:0.75,y:1.3,w:11.8,h:5.2});

// 11 summary
s = pptx.addSlide(); s.background={color:'F8FAFC'}; addHeader(s,'提案收斂總結'); addFooter(s,11);
s.addText('用有限預算，做出完整而有記憶點的主題體驗',{x:0.9,y:1.2,w:7,h:0.4,fontSize:22,bold:true,color:'7C3AED'});
addBullets(s,[
  '優先把入口、走道、背板三層做好',
  '以大場景成立取代大量碎件堆砌',
  '讓遊戲與抽獎延續同一套語言系統',
  '建立從起跑到終點的完整拍照體驗'
],0.9,1.95,5.0);
s.addImage({path:path.join(assets,'cover.png'),x:6.3,y:1.35,w:5.8,h:4.8});

// 12 notes
s = pptx.addSlide(); s.background={color:'FFFFFF'}; addHeader(s,'後續執行備註'); addFooter(s,12);
addBullets(s,[
  '本版已提升為設計版骨架，可作為提案視覺方向底稿',
  '後續可依現場精準尺寸微調障礙物密度與節奏',
  '若客戶有風格偏好，可往童趣 / 俐落 / 高彩方向細修',
  '下一階段可再補強真實圖片素材與更高完成視覺頁'
],0.9,1.8,5.4);
s.addImage({path:path.join(assets,'brand-style.png'),x:6.1,y:1.4,w:6.0,h:4.7});

pptx.writeFile({ fileName: path.join(base, '2026-HP瑪利歐賽車尾牙案-PPT-設計版-v2.pptx') });
