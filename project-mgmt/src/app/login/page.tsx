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
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="w-full rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">登入 projectflow</h1>
            <p className="mt-3 text-sm text-slate-500">未來所有人進入系統前，都必須先完成登入。</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error === 'inactive' ? '此帳號目前已被停用。' : '帳號或密碼錯誤。'}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-900" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">密碼</label>
              <input name="password" type="password" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-900" />
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              登入
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
