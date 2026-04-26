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

  const designFormFields = [
    ['負責人', '例如：Aster'],
    ['尺寸', '例如：W240 x H300 cm'],
    ['材質 + 結構', '例如：珍珠板＋輸出＋木作結構'],
    ['數量', '例如：1 式'],
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_20%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.08),transparent_26%),linear-gradient(180deg,#020617_0%,#030712_36%,#020b17_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 px-4 py-6 lg:px-6 xl:px-8">
        <aside className="hidden w-60 shrink-0 rounded-[32px] bg-[linear-gradient(180deg,rgba(15,23,42,0.52),rgba(15,23,42,0.34))] p-6 text-white shadow-[0_32px_80px_-44px_rgba(0,0,0,0.7)] backdrop-blur-2xl lg:flex lg:min-h-[calc(100vh-3rem)] lg:flex-col">
          <div className="mb-6 flex min-h-10 items-center justify-center text-center">
            <h1 className="text-2xl font-semibold tracking-wide text-white/96">任務版</h1>
          </div>

          <nav className="space-y-2 text-sm">
            {['首頁總覽', '專案管理', '設計任務版', '採購備品板', '廠商發包板', '廠商資料', '報價成本', '結案紀錄'].map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-3 transition ${
                  index === 1
                    ? 'bg-[linear-gradient(180deg,rgba(75,132,220,0.24),rgba(34,53,92,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_28px_rgba(59,130,246,0.18)]'
                    : 'text-slate-300/88 hover:bg-white/6 hover:shadow-[0_0_22px_rgba(96,165,250,0.08)]'
                }`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" />
        </aside>

        <section className="flex-1 space-y-6">
          <header className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.62),rgba(15,23,42,0.42))] p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl xl:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-50 xl:text-[2rem]">春季品牌快閃活動</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 text-sm font-semibold text-slate-100 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:bg-slate-900/70 hover:shadow-[0_0_24px_rgba(96,165,250,0.16)]">
                  複製活動資訊
                </button>
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 text-sm font-semibold text-slate-200 shadow-2xl shadow-black/15 backdrop-blur-xl transition hover:bg-slate-900/60 hover:shadow-[0_0_20px_rgba(96,165,250,0.12)]">
                  返回列表
                </button>
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.42),rgba(37,99,235,0.24))] px-4 text-sm font-semibold text-white shadow-2xl shadow-blue-950/40 backdrop-blur-xl transition hover:brightness-105 hover:shadow-[0_0_28px_rgba(96,165,250,0.24)]">
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
                    ? 'border border-white/10 bg-slate-900/50 shadow-2xl shadow-black/35 backdrop-blur-xl'
                    : 'border border-white/10 bg-slate-900/40 shadow-2xl shadow-black/25 backdrop-blur-xl'
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
                <p className="mt-3 text-[1.15rem] font-semibold tracking-tight text-slate-100">{item.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <article className="rounded-[30px] border border-white/10 bg-slate-900/50 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="mb-5 flex min-h-11 items-center">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold leading-none text-white">專案基本資訊</h3>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {infoItems.map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-white/10 bg-slate-900/40 px-4 py-4 shadow-2xl shadow-black/15 backdrop-blur-xl">
                    <p className="text-xs font-medium tracking-[0.06em] text-slate-400">{label}</p>
                    <p className="mt-2 font-medium text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] border border-white/10 bg-slate-900/50 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="mb-4 flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold leading-none text-white">需求溝通</h3>
                </div>
                <button className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]">
                  + 新增紀錄
                </button>
              </div>

              <div className="space-y-3">
                {requirementItems.map((item, index) => (
                  <div key={index} className="rounded-[22px] border border-white/10 bg-slate-900/40 px-4 py-4 shadow-2xl shadow-black/15 backdrop-blur-xl hover:shadow-[0_0_24px_rgba(96,165,250,0.12)] transition-shadow">
                    <p className="text-xs font-medium text-slate-500">2026-04-26 19:10</p>
                    <p className="mt-2 text-sm leading-7 text-slate-100">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="space-y-6 rounded-[32px] bg-[linear-gradient(180deg,rgba(15,23,36,0.88),rgba(11,18,30,0.8))] p-6 shadow-[0_30px_70px_-42px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/45 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">專案執行項目</h3>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="mb-3 text-sm font-semibold text-slate-200">主項目 / 子項目層次</div>
                  <div className="space-y-3">
                    {['主視覺輸出與材質確認', '入口背板與燈箱製作', '收銀台與動線配置'].map((item, index) => (
                      <div key={item} className={`rounded-[20px] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${index === 0 ? 'bg-sky-400/[0.08]' : 'bg-white/[0.025]'}`}>
                        <div className="text-sm font-semibold text-white">{item}</div>
                        <div className="mt-2 text-xs leading-6 text-slate-400">待補充執行說明。</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100">設計交辦</p>
                    <span className="inline-flex items-center justify-center rounded-full bg-sky-400/14 px-3 py-1 text-xs font-medium text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      設計
                    </span>
                    <span className="text-sm text-slate-400">來源項目：主視覺輸出與材質確認</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {designFormFields.map(([label, placeholder]) => (
                      <label key={label} className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-slate-300">{label}</span>
                        <div className="flex h-11 items-center rounded-2xl border border-white/10 bg-slate-900/45 px-4 text-sm text-slate-500 shadow-2xl shadow-black/10 backdrop-blur-xl">
                          {placeholder}
                        </div>
                      </label>
                    ))}

                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-medium text-slate-300">參考連結</span>
                      <div className="flex h-11 items-center rounded-2xl border border-white/10 bg-slate-900/45 px-4 text-sm text-slate-500 shadow-2xl shadow-black/10 backdrop-blur-xl">
                        例如：https://...
                      </div>
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-medium text-slate-300">需求說明</span>
                      <div className="min-h-28 rounded-2xl border border-white/10 bg-slate-900/45 px-4 py-3 text-sm leading-7 text-slate-400 shadow-2xl shadow-black/10 backdrop-blur-xl">
                        請描述此設計項目的尺寸、材質與現場需求
                      </div>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.42),rgba(37,99,235,0.24))] px-4 py-2.5 text-sm font-semibold text-white shadow-2xl shadow-blue-950/40 backdrop-blur-xl hover:shadow-[0_0_26px_rgba(96,165,250,0.24)] transition-shadow">
                      儲存設計交辦
                    </button>
                    <button className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-2xl shadow-black/15 backdrop-blur-xl hover:shadow-[0_0_18px_rgba(96,165,250,0.1)] transition-shadow">
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/45 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">專案分類檢視</h3>
                </div>
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
                    <div className={`mb-4 flex h-16 items-center justify-between rounded-2xl bg-gradient-to-br px-4 ${item.accent}`}>
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
                    <p className="mt-2 text-sm text-slate-400">共 4 筆</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">已儲存，正在重新整理任務資料。</div>
                </div>

                <div className="space-y-3">
                  {['主視覺看板與輸出稿', '入口背板施工圖', '收銀台主視覺與動線圖', '拍照區裝置與導視確認'].map((item) => (
                    <div key={item} className="rounded-[22px] bg-white/[0.028] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-100">{item}</p>
                          <p className="mt-2 text-sm text-slate-400">已建立</p>
                        </div>
                        <div className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">前往任務詳情</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
