const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenClaw AI Team';
pptx.company = 'Kuya';
pptx.subject = '2026 HP Mario Kart Proposal';
pptx.title = '2026 HP 尾牙主題提案';
pptx.lang = 'zh-TW';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'zh-TW'
};

const slides = [
  {
    title: '2026 HP 尾牙主題提案',
    subtitle: 'Mario Kart 瑪利歐賽車主題體驗規劃',
    bullets: [
      '以瑪利歐賽車作為核心世界觀',
      '打造從起跑到終點的沉浸式拍照體驗帶',
      '讓賓客在進場、移動與拍照中自然感受主題氛圍'
    ]
  },
  {
    title: '提案概念',
    bullets: [
      '將指定區段整體轉化為 Mario Kart 主題動線',
      '不只是單一拍照背板，而是一段完整體驗',
      '入口、走道與終點背板共同組成空間敘事',
      '強化現場拍照、記憶點與分享效果'
    ]
  },
  {
    title: '整體體驗邏輯',
    bullets: [
      '入口拱門：建立正式進入賽道世界的第一印象',
      '跑道走道：以移動中的節奏形成主題氛圍',
      '終點背板：承接合照與主題記憶點',
      '體驗流程為「入口 → 跑道 → 終點」三層式設計'
    ]
  },
  {
    title: '入口拱門規劃',
    bullets: [
      '尺寸設定為 500cm × 350cm',
      '以起跑門 / 闖關入口作為主視覺語彙',
      '可搭配棋盤旗、起跑燈、賽事標題感元素',
      '以大識別與乾淨結構為主，不以碎件堆滿畫面'
    ]
  },
  {
    title: '跑道走道規劃',
    bullets: [
      '走道不是通道，而是整段拍照區的體驗主體',
      '地面可運用賽道線條、起跑格、彎道感做視覺語言',
      '中段以障礙節點建立闖關與競速氛圍',
      '重點是做出節奏與賽道感，而不是零散堆飾'
    ]
  },
  {
    title: '障礙物與世界觀元素',
    bullets: [
      '優先放大元素：香蕉皮、金幣、彩虹賽道、龜殼',
      '香蕉皮與龜殼適合作為強記憶點障礙節點',
      '金幣適合作為節奏型點綴，補強遊戲世界感',
      '彩虹賽道建議作為局部亮點語言，避免整段過花'
    ]
  },
  {
    title: '終點拍照背板規劃',
    bullets: [
      '背板位於區段底部，最大寬度 500cm、高度 350cm',
      '需貼齊右側牆面，左側保留通道',
      '建議以終點線、衝線感、頒獎台語彙作為主視覺',
      '作為整段體驗的收尾主畫面並支撐多人合照'
    ]
  },
  {
    title: '遊戲主題包裝',
    bullets: [
      '將遊戲包裝進 Mario Kart 世界觀之中',
      '透過命名、主持語氣、PPT 視覺與小道具延續主題',
      '不另開大型獨立場景，以控制整體預算密度',
      '讓流程互動與空間氛圍保持一致'
    ]
  },
  {
    title: '抽獎主題包裝',
    bullets: [
      '抽獎段落延續瑪利歐賽車語言系統',
      '可用賽事進程、排名躍升、闖關獎勵等方式包裝',
      '讓抽獎成為主題敘事的一部分',
      '維持成本效率，不另拆重製作模組'
    ]
  },
  {
    title: '整體風格與品牌整合',
    bullets: [
      'HP logo 作為品牌識別層，清楚存在於提案中',
      'Mario Kart 作為主題世界觀層，主導氛圍與語言',
      '保留高辨識、高彩度與競速感',
      '同時維持企業提案應有的乾淨度與完成度'
    ]
  },
  {
    title: '提案收斂總結',
    bullets: [
      '在約 60 萬預算下，優先把入口、走道、背板三層做好',
      '以大場景成立取代大量碎件堆砌',
      '讓遊戲與抽獎延續同一套語言系統',
      '建立一段從起跑到終點的完整主題拍照體驗'
    ]
  },
  {
    title: '後續執行備註',
    bullets: [
      '本版可作為對外提案簡報內容基礎',
      '後續可依現場精準尺寸微調障礙物密度與節奏',
      '若客戶有風格偏好，可再往童趣 / 俐落 / 高彩方向細修',
      '確認後可再進一步補視覺示意與最終排版優化'
    ]
  }
];

function addSlide(slideData, isCover = false) {
  const slide = pptx.addSlide();
  slide.background = { color: isCover ? '111827' : 'F8FAFC' };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.6,
    fill: { color: isCover ? '7C3AED' : '2563EB' },
    line: { color: isCover ? '7C3AED' : '2563EB' }
  });

  slide.addText(slideData.title, {
    x: 0.7,
    y: isCover ? 1.0 : 0.9,
    w: 11.8,
    h: isCover ? 0.8 : 0.6,
    fontFace: 'Aptos Display',
    fontSize: isCover ? 26 : 24,
    bold: true,
    color: isCover ? 'FFFFFF' : '0F172A',
    margin: 0
  });

  if (isCover && slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.7,
      y: 1.9,
      w: 8.5,
      h: 0.5,
      fontSize: 15,
      color: 'E5E7EB',
      margin: 0
    });
  }

  const startY = isCover ? 3.0 : 2.0;
  slideData.bullets.forEach((b, i) => {
    slide.addText([{ text: b, options: { bullet: { indent: 14 } } }], {
      x: 1.0,
      y: startY + i * 0.7,
      w: 11.0,
      h: 0.45,
      fontSize: 18,
      color: isCover ? 'F9FAFB' : '1F2937',
      breakLine: false,
      margin: 0.02,
      valign: 'mid'
    });
  });

  slide.addText(isCover ? 'HP 尾牙主題企劃案' : '2026 HP Mario Kart Proposal', {
    x: 0.7,
    y: 7.0,
    w: 4.5,
    h: 0.3,
    fontSize: 9,
    color: isCover ? 'D1D5DB' : '64748B',
    margin: 0
  });
}

slides.forEach((s, idx) => addSlide(s, idx === 0));

pptx.writeFile({ fileName: '/home/node/.openclaw/workspace/event-ai-team/deliverables/2026-HP瑪利歐賽車尾牙案/2026-HP瑪利歐賽車尾牙案-PPT-交付版-v1.pptx' });
