import { redirect } from 'next/navigation';
import { authenticateUser, createSession, getCurrentUser } from '@/lib/auth';

async function loginAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/');

  const result = await authenticateUser(email, password);
  if (!result.ok) {
    redirect(`/login?error=${result.reason}`);
  }

  await createSession(result.user.id);
  if (result.user.mustChangePassword) {
    redirect('/reset-password');
  }
  redirect(next.startsWith('/') ? next : '/');
}

export default async function LoginPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const currentUser = await getCurrentUser();
  if (currentUser && !currentUser.mustChangePassword) {
    redirect('/');
  }

  const params = (await searchParams) ?? {};
  const error = typeof params.error === 'string' ? params.error : '';
  const next = typeof params.next === 'string' ? params.next : '/';

  return (
    <main className="pf-auth-page">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="pf-card w-full p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">登入 projectflow</h1>
            <p className="mt-3 text-sm text-slate-400">未來所有人進入系統前，都必須先完成登入。</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error === 'inactive' ? '此帳號目前已被停用。' : '帳號或密碼錯誤。'}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input id="login-email" name="email" type="email" required className="pf-input" />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-300">密碼</label>
              <input id="login-password" name="password" type="password" required className="pf-input" />
            </div>
            <button type="submit" className="pf-btn-primary w-full py-3.5">
              登入
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
