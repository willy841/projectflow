import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="pf-auth-page">
      <div className="mx-auto flex min-h-[80vh] max-w-lg items-center">
        <section className="pf-card w-full p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">你目前沒有權限進入這個區域</h1>
          <p className="mt-3 text-sm text-slate-400">只有 Admin 才能進入系統設定與帳務中心。如果你需要權限，請找系統管理者處理。</p>
          <div className="mt-6">
            <Link href="/" className="pf-btn-primary px-5 py-3">返回首頁</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
