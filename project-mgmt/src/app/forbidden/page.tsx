import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <section className="w-full rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">你目前沒有權限進入這個區域</h1>
          <p className="mt-3 text-sm text-slate-500">只有 Admin 才能進入系統設定與帳務中心。如果你需要權限，請找系統管理者處理。</p>
          <div className="mt-6">
            <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">返回首頁</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
