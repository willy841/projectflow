import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getStatusClass, projects } from "@/components/project-data";

const stats = [
  { label: "進行中專案", value: "18", change: "+3 本週" },
  { label: "待處理設計交辦", value: "27", change: "8 件逾期" },
  { label: "待採購備品", value: "14", change: "5 件待下單" },
  { label: "未付款項", value: "9", change: "NT$ 486,000" },
];

const tasks = [
  {
    type: "設計",
    title: "主背板輸出完稿",
    project: "春季品牌快閃活動",
    assignee: "設計部 / Aster",
    due: "明天 14:00",
    status: "進行中",
  },
  {
    type: "備品",
    title: "壓克力展示架採購",
    project: "百貨檔期陳列與贈品備品整合",
    assignee: "採購 / Momo",
    due: "3/28",
    status: "待下單",
  },
  {
    type: "帳務",
    title: "廠商尾款匯款確認",
    project: "新品發表會主視覺與會場製作",
    assignee: "財務 / Una",
    due: "今天",
    status: "待處理",
  },
];

const vendors = [
  { name: "星澄輸出", category: "輸出製作", status: "合作中", balance: "NT$ 82,000" },
  { name: "木與光工坊", category: "木作施工", status: "待付款", balance: "NT$ 146,000" },
  { name: "映彩視覺", category: "平面設計", status: "合作中", balance: "NT$ 38,500" },
];

const finance = [
  { label: "本月已收款", value: "NT$ 1,280,000" },
  { label: "本月未收款", value: "NT$ 620,000" },
  { label: "本月已付款", value: "NT$ 734,000" },
  { label: "本月預估毛利", value: "NT$ 546,000" },
];

export default function Home() {
  return (
    <AppShell activePath="/">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-slate-500">MVP Dashboard</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              專案執行、採購與帳務一站式看板
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              這是第一版可用管理介面雛形，先聚焦在專案列表、需求拆解、設計交辦、備品採購、廠商管理與財務摘要。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              + 新增專案
            </Link>
            <Link
              href="/projects"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              查看專案列表
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.change}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">近期專案</h3>
              <p className="mt-1 text-sm text-slate-500">依活動日期排序，快速追蹤進度與責任人。</p>
            </div>
            <Link href="/projects" className="text-sm font-medium text-slate-700">
              查看全部
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">專案</th>
                  <th className="px-4 py-3 font-medium">客戶</th>
                  <th className="px-4 py-3 font-medium">日期</th>
                  <th className="px-4 py-3 font-medium">狀態</th>
                  <th className="px-4 py-3 font-medium">進度</th>
                  <th className="px-4 py-3 font-medium">負責人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {projects.map((project) => (
                  <tr key={project.code} className="align-top">
                    <td className="px-4 py-4">
                      <Link href={`/projects/${project.id}`} className="font-medium text-slate-900 underline-offset-4 hover:underline">
                        {project.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{project.code}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{project.client}</td>
                    <td className="px-4 py-4 text-slate-600">{project.eventDate}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-28 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${project.progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{project.progress}%</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{project.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5">
            <h3 className="text-xl font-semibold">本月財務摘要</h3>
            <p className="mt-1 text-sm text-slate-500">先提供管理層快速查看帳務壓力與毛利概況。</p>
          </div>

          <div className="space-y-3">
            {finance.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">待辦交辦</h3>
              <p className="mt-1 text-sm text-slate-500">整合設計、備品、帳務任務，作為首頁工作入口。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">建立交辦</button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{task.type}</p>
                    <h4 className="mt-1 font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">{task.project}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span>負責：{task.assignee}</span>
                  <span>期限：{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">合作廠商與帳款</h3>
              <p className="mt-1 text-sm text-slate-500">後續可延伸成完整廠商主檔、匯款資訊與發包歷史。</p>
            </div>
            <button className="text-sm font-medium text-slate-700">管理廠商</button>
          </div>

          <div className="space-y-3">
            {vendors.map((vendor) => (
              <div key={vendor.name} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{vendor.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">{vendor.category}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">未結帳款</span>
                  <span className="font-medium text-slate-900">{vendor.balance}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
