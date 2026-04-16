import { redirect } from 'next/navigation';
import { AppShellAuth } from '@/components/app-shell-auth';
import { createInitialPasswordToken, createUser, listUsers, requireAdmin, resetUserToMustChangePassword, updateUserActiveStatus, updateUserRole } from '@/lib/auth';

async function createUserAction(formData: FormData) {
  'use server';
  const actor = await requireAdmin();
  const email = String(formData.get('email') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? 'member') === 'admin' ? 'admin' : 'member';

  if (!email || !name) {
    redirect('/system-settings?error=invalid-create');
  }

  const initialPasswordToken = createInitialPasswordToken();
  await createUser({ email, name, role, initialPasswordToken });
  redirect(`/system-settings?created=1&initialPassword=${encodeURIComponent(initialPasswordToken)}`);
}

async function updateRoleAction(formData: FormData) {
  'use server';
  const actor = await requireAdmin();
  const userId = String(formData.get('userId') ?? '');
  const nextRole = String(formData.get('role') ?? 'member') === 'admin' ? 'admin' : 'member';
  const isOwner = String(formData.get('isOwner') ?? '') === 'true';

  if (isOwner) redirect('/system-settings?error=owner-protected');
  if (actor.id === userId && nextRole !== 'admin') redirect('/system-settings?error=self-protected');

  await updateUserRole(userId, nextRole);
  redirect('/system-settings?updated=role');
}

async function updateActiveAction(formData: FormData) {
  'use server';
  const actor = await requireAdmin();
  const userId = String(formData.get('userId') ?? '');
  const nextActive = String(formData.get('isActive') ?? '') === 'true';
  const isOwner = String(formData.get('isOwner') ?? '') === 'true';

  if (isOwner || actor.id === userId) redirect('/system-settings?error=self-protected');
  await updateUserActiveStatus(userId, nextActive);
  redirect('/system-settings?updated=status');
}

async function resetPasswordStatusAction(formData: FormData) {
  'use server';
  await requireAdmin();
  const userId = String(formData.get('userId') ?? '');
  const token = createInitialPasswordToken();
  await resetUserToMustChangePassword(userId, token);
  redirect(`/system-settings?reset=1&initialPassword=${encodeURIComponent(token)}`);
}

export default async function SystemSettingsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const users = await listUsers();
  const params = (await searchParams) ?? {};
  const initialPassword = typeof params.initialPassword === 'string' ? params.initialPassword : '';
  const error = typeof params.error === 'string' ? params.error : '';

  return (
    <AppShellAuth activePath="/system-settings">
      <section className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-slate-200 lg:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">系統設定</h1>
            <p className="mt-2 text-sm text-slate-500">管理使用者帳號、角色與首次改密碼狀態。</p>
          </div>
        </div>

        {initialPassword ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            本次建立 / 重設後的初始密碼：<span className="font-semibold">{initialPassword}</span>。請安全地提供給對方，對方首次登入後必須自行修改密碼。
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error === 'owner-protected' ? 'Owner 帳號不可被一般管理操作降權。' : error === 'self-protected' ? '不能停用、降權或破壞自己的管理身份。' : '輸入資料不完整。'}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
          <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">使用者列表</h2>
              <span className="text-sm text-slate-500">共 {users.length} 位</span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">姓名 / Email</th>
                    <th className="px-4 py-3 font-medium">角色</th>
                    <th className="px-4 py-3 font-medium">狀態</th>
                    <th className="px-4 py-3 font-medium">密碼狀態</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{user.name}{user.isOwner ? '（Owner）' : ''}</div>
                        <div className="mt-1 text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <form action={updateRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="isOwner" value={String(user.isOwner)} />
                          <select name="role" defaultValue={user.role} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" disabled={user.isOwner}>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                          <button type="submit" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={user.isOwner}>更新</button>
                        </form>
                      </td>
                      <td className="px-4 py-4">
                        <form action={updateActiveAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="isOwner" value={String(user.isOwner)} />
                          <input type="hidden" name="isActive" value={String(!user.isActive)} />
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                            {user.isActive ? '啟用中' : '已停用'}
                          </span>
                          <button type="submit" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={user.isOwner}>
                            {user.isActive ? '停用' : '啟用'}
                          </button>
                        </form>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.mustChangePassword ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                          {user.mustChangePassword ? '首次改密碼中' : '正常'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <form action={resetPasswordStatusAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            重設首次密碼
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">新增使用者</h2>
            <p className="mt-2 text-sm text-slate-500">管理者建立帳號後，系統會產生一組初始密碼，對方首次登入後必須自行修改。</p>
            <form action={createUserAction} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">姓名</label>
                <input name="name" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">角色</label>
                <select name="role" defaultValue="member" className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                建立使用者
              </button>
            </form>
          </section>
        </div>
      </section>
    </AppShellAuth>
  );
}
