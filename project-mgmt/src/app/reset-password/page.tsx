import { redirect } from 'next/navigation';
import { changePassword, getCurrentUser } from '@/lib/auth';

async function resetPasswordAction(formData: FormData) {
  'use server';

  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!password || password.length < 8 || password !== confirmPassword) {
    redirect('/reset-password?error=invalid');
  }

  await changePassword(user.id, password);
  redirect('/');
}

export default async function ResetPasswordPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const params = (await searchParams) ?? {};
  const error = typeof params.error === 'string' ? params.error : '';

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="w-full rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">首次登入，先修改密碼</h1>
            <p className="mt-3 text-sm text-slate-500">這個帳號目前被標記為首次登入狀態，需先完成改密碼後才能進入系統。</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              密碼至少 8 碼，且兩次輸入必須一致。
            </div>
          ) : null}

          <form action={resetPasswordAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">新密碼</label>
              <input name="password" type="password" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">再次輸入新密碼</label>
              <input name="confirmPassword" type="password" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900" />
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              更新密碼並進入系統
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
