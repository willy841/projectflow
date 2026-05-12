export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">projectflow root route probe</h1>
        <p className="text-base text-slate-300">
          如果你現在看得到這頁，代表 `pmis.kuya.tw/` 的 root route 本身可正常回應，問題就不在最外層 route，
          而是在首頁共用 shell / auth / render 鏈。
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          root probe active
        </div>
      </div>
    </main>
  );
}
