export default function ProjectDetailBlueprintV1Page() {
  const summaryItems = [
    { label: '活動日期', value: '2026-05-12' },
    { label: '活動地點', value: '松山文創園區' },
    { label: '進場時間', value: '08:30' },
    { label: '專案預算', value: 'NT$ 1,280,000' },
    { label: '目前成本', value: 'NT$ 742,500' },
  ];

  const infoItems = [
    ['客戶名稱', '森野生活'],
    ['活動類型', '品牌快閃'],
    ['聯繫人', '林雅晴'],
    ['電話', '0912-345-678'],
    ['Email', 'brand-team@example.com'],
    ['LINE', 'brand-team'],
  ];

  const requirementItems = [
    '入口主背板需搭配春季主題色與產品燈箱，主視覺延續清爽高級感。',
    '收銀台與體驗桌需保留雙人並行動線，避免尖峰時段卡住。',
    '拍照區需與品牌主視覺一致，但不能搶主商品展示焦點。',
  ];

  const executionCols = [
    {
      title: '專案設計',
      count: 4,
      accent: 'from-sky-400/28 to-blue-500/6',
      active: true,
    },
    {
      title: '專案備品',
      count: 3,
      accent: 'from-amber-300/20 to-orange-400/5',
      active: false,
    },
    {
      title: '專案廠商',
      count: 5,
      accent: 'from-violet-400/20 to-fuchsia-500/5',
      active: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(74,144,226,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(80,120,255,0.1),transparent_22%),linear-gradient(180deg,#07111d_0%,#0b1320_42%,#0f1724_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-60 shrink-0 rounded-[32px] bg-[linear-gradient(180deg,rgba(6,12,20,0.92),rgba(10,18,30,0.88))] p-6 text-white shadow-[0_32px_80px_-44px_rgba(0,0,0,0.7)] lg:flex lg:min-h-[calc(100vh-3rem)] lg:flex-col">
          <div className="mb-6 flex min-h-10 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-wide text-white/96">任務版</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {['首頁總覽', '專案管理', '設計任務版', '採購備品板', '廠商發包板', '廠商資料', '報價成本', '結案紀錄'].map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-3 transition ${
                  index === 1
                    ? 'bg-[linear-gradient(180deg,rgba(75,132,220,0.2),rgba(34,53,92,0.14))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_-18px_rgba(59,130,246,0.48)]'
                    : 'text-slate-300/88 hover:bg-white/6'
                }`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-sm font-semibold text-white/92">Blueprint mock</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">這是純視覺示意頁，不接正式資料、不代表最終像素稿，只用來校正層次、材質與節奏方向。</p>
          </div>
        </aside>

        <section className="flex-1">
          <div className="rounded-[36px] bg-[linear-gradient(180deg,rgba(10,18,30,0.72),rgba(10,17,28,0.58))] p-4 shadow-[0_38px_100px_-52px_rgba(0,0,0,0.82)] backdrop-blur-xl sm:p-5 xl:p-6">
            <div className="space-y-6 rounded-[30px] bg-[linear-gradient(180deg,rgba(11,19,31,0.78),rgba(13,20,32,0.66))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] sm:p-5 xl:p-6">
              <header className="rounded-[32px] bg-[linear-gradient(180deg,rgba(18,29,46,0.9),rgba(16,25,40,0.84))] p-5 shadow-[0_28px_72px_-42px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.05)] xl:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 inline-flex items-center rounded-full bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      Project detail blueprint
                    </div>
                    <h2 className="text-3xl font-semibold tracking-tight text-white xl:text-[2rem]">春季品牌快閃活動</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">示意重點：去掉過多外框，改用材質、明暗與節奏建立高級感，讓這頁先成為高質感 SaaS benchmark，而不是單純 dark mode。</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/[0.05] px-4 text-sm font-semibold text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-white/[0.08]">
                      複製活動資訊
                    </button>
                    <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/[0.03] px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]">
                      返回列表
                    </button>
                    <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(87,145,255,0.32),rgba(39,79,170,0.22))] px-4 text-sm font-semibold text-white shadow-[0_18px_38px_-24px_rgba(59,130,246,0.64),inset_0_1px_0_rgba(255,255,255,0.1)] transition hover:brightness-105">
                      編輯專案
                    </button>
                  </div>
                </div>
              </header>

              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {summaryItems.map((item, index) => (
                  <article
                    key={item.label}
                    className={`rounded-[28px] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
                      index === 0
                        ? 'bg-[linear-gradient(180deg,rgba(23,37,58,0.92),rgba(17,28,46,0.86))] shadow-[0_22px_48px_-34px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.05)]'
                        : 'bg-[linear-gradient(180deg,rgba(18,27,43,0.74),rgba(15,24,37,0.68))]'
                    }`}
                  >
                    <p className="text-xs font-medium tracking-[0.08em] text-slate-400">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
                <article className="rounded-[30px] bg-[linear-gradient(180deg,rgba(18,26,40,0.84),rgba(14,22,34,0.78))] p-6 shadow-[0_24px_56px_-38px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <div className="mb-5 flex min-h-11 items-center">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold leading-none text-white">專案基本資訊</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {infoItems.map(([label, value]) => (
                      <div key={label} className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.022))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <p className="text-xs font-medium tracking-[0.06em] text-slate-400">{label}</p>
                        <p className="mt-2 font-medium text-slate-100">{value}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-[30px] bg-[linear-gradient(180deg,rgba(18,26,40,0.84),rgba(14,22,34,0.78))] p-6 shadow-[0_24px_56px_-38px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <div className="mb-4 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold leading-none text-white">需求溝通</h3>
                    </div>
                    <button className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]">
                      + 新增紀錄
                    </button>
                  </div>

                  <div className="mb-4 rounded-[24px] bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                    <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(11,17,27,0.68),rgba(12,18,29,0.6))] px-4 py-4 text-sm leading-7 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      這裡示意為 create / edit 的弱卡層。正式實作時不改功能，只提升內外層材質、專注密度節奏與閱讀安定感。
                    </div>
                  </div>

                  <div className="space-y-3">
                    {requirementItems.map((item, index) => (
                      <div key={index} className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.018))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                        <p className="text-xs font-medium text-slate-500">2026-04-26 19:10</p>
                        <p className="mt-2 text-sm leading-7 text-slate-100">{item}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="space-y-6 rounded-[32px] bg-[linear-gradient(180deg,rgba(15,23,36,0.88),rgba(11,18,30,0.8))] p-6 shadow-[0_30px_70px_-42px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.016))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">專案執行項目</h3>
                      <p className="mt-2 text-sm text-slate-400">這塊示意為整頁最重要的 command workspace，正式實作時不改流程，只重做視覺分層。</p>
                    </div>
                    <div className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">Primary work surface</div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(10,16,26,0.76),rgba(12,18,27,0.66))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                      <div className="mb-3 text-sm font-semibold text-slate-200">主項目 / 子項目層次</div>
                      <div className="space-y-3">
                        {['主視覺輸出與材質確認', '入口背板與燈箱製作', '收銀台與動線配置'].map((item, index) => (
                          <div key={item} className={`rounded-[20px] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${index === 0 ? 'bg-sky-400/[0.08]' : 'bg-white/[0.025]'}`}>
                            <div className="text-sm font-semibold text-white">{item}</div>
                            <div className="mt-2 text-xs leading-6 text-slate-400">示意：這裡應用主列 / 次列 / 狀態與操作群的節奏，而不是改任何行為。</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(10,16,26,0.76),rgba(12,18,27,0.66))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                      <div className="mb-3 text-sm font-semibold text-slate-200">交辦表單 / 操作容器</div>
                      <div className="space-y-3">
                        {['需求描述欄位', '規格與數量欄位', '送出按鈕群'].map((item) => (
                          <div key={item} className="rounded-[18px] bg-white/[0.03] px-4 py-3 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                            {item}
                          </div>
                        ))}
                        <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(87,145,255,0.16),rgba(39,79,170,0.06))] px-4 py-3 text-sm text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                          active / focus 狀態只示意為藍色能量，不代表新增互動。
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(18,26,40,0.8),rgba(14,21,33,0.74))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">專案分類檢視</h3>
                      <p className="mt-2 text-sm text-slate-400">這塊示意三種 category 卡應該是 mode selector，不是普通白卡。</p>
                    </div>
                    <div className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">Secondary command zone</div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    {executionCols.map((item) => (
                      <div
                        key={item.title}
                        className={`rounded-[26px] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${
                          item.active
                            ? 'bg-[linear-gradient(180deg,rgba(21,35,56,0.9),rgba(16,26,42,0.84))] shadow-[0_20px_48px_-32px_rgba(59,130,246,0.36),inset_0_1px_0_rgba(255,255,255,0.04)]'
                            : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.016))]'
                        }`}
                      >
                        <div className={`mb-4 h-16 rounded-2xl bg-gradient-to-br ${item.accent}`} />
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-white">{item.title}</p>
                          <span className={`inline-flex min-w-[38px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${item.active ? 'bg-sky-400/18 text-sky-100' : 'bg-white/8 text-slate-300'}`}>
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[26px] bg-[linear-gradient(180deg,rgba(9,15,24,0.8),rgba(12,18,28,0.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                    <div className="mb-4 flex items-center justify-between gap-3 pb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">專案設計</h4>
                        <p className="mt-2 text-sm text-slate-400">共 4 筆 — 這個 panel 應該是 category 明確擁有的內容區，而不是普通列表盒。</p>
                      </div>
                      <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">已儲存，正在重新整理任務資料。</div>
                    </div>

                    <div className="space-y-3">
                      {['主視覺看板與輸出稿', '入口背板施工圖', '收銀台主視覺與動線圖', '拍照區裝置與導視確認'].map((item) => (
                        <div key={item} className="rounded-[22px] bg-white/[0.028] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-100">{item}</p>
                              <p className="mt-2 text-sm text-slate-400">示意：row 需要更穩的密度節奏與 ownership，而不是只換底色。</p>
                            </div>
                            <div className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">前往任務詳情</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
