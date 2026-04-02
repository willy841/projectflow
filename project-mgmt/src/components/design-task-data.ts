import { projects } from "@/components/project-data";

export type DesignTaskRecord = {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  client: string;
  owner: string;
  title: string;
  assignee: string;
  due: string;
  status: string;
  size: string;
  material: string;
  quantity: string;
  referenceUrl: string;
  structureRequired: string;
  outsourceStatus: string;
  outsourceTarget: string;
  cost: string;
  note: string;
};

export const designTaskGroups: DesignTaskRecord[] = projects.flatMap((project) =>
  project.designTasks.map((task, index) => ({
    id: `${project.id}-${index}`,
    projectId: project.id,
    projectName: project.name,
    projectCode: project.code,
    client: project.client,
    owner: project.owner,
    title: task.title,
    assignee: task.assignee,
    due: task.due,
    status: task.status,
    size: index === 0 ? "W240 x H300 cm" : "A1 / 594 x 841 mm",
    material: index === 0 ? "珍珠板 + 輸出貼圖" : "海報紙 + 霧膜",
    quantity: index === 0 ? "1 式" : "2 張",
    referenceUrl: "https://example.com/reference",
    structureRequired: index === 0 ? "需要" : "不需要",
    outsourceStatus: index === 0 ? "已發包" : "待發包",
    outsourceTarget: index === 0 ? "星澄輸出" : "尚未指定",
    cost: index === 0 ? "NT$ 18,000" : "NT$ 6,800",
    note: index === 0 ? "請延續主視覺，需搭配現場燈箱與入口動線。" : "需保留二次修改空間，週五前送審。",
  }))
);

export function getDesignTaskById(id: string) {
  return designTaskGroups.find((task) => task.id === id);
}
