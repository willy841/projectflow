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
    <main className="pf-auth-page">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="pf-card w-full p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">首次登入，先修改密碼</h1>
            <p className="mt-3 text-sm text-slate-400">這個帳號目前被標記為首次登入狀態，需先完成改密碼後才能進入系統。</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              密碼至少 8 碼，且兩次輸入必須一致。
            </div>
          ) : null}

          <form action={resetPasswordAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">新密碼</label>
              <input name="password" type="password" required className="pf-input" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">再次輸入新密碼</label>
              <input name="confirmPassword" type="password" required className="pf-input" />
            </div>
            <button type="submit" className="pf-btn-primary w-full py-3.5">
              更新密碼並進入系統
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
