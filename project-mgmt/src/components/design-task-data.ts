import { projects } from "@/components/project-data";

export type DesignTaskPlan = {
  id: string;
  title: string;
  size: string;
  material: string;
  structure: string;
  quantity: string;
  amount: string;
  previewUrl: string;
  vendor: string;
};

export type DesignDocumentRow = {
  id: number;
  item: string;
  size: string;
  materialStructure: string;
  quantity: string;
};

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
  plans: DesignTaskPlan[];
  documentRows: DesignDocumentRow[];
  documentLink: string;
};

export const designTaskGroups: DesignTaskRecord[] = projects.flatMap((project) =>
  project.designTasks.map((task, index) => {
    const isPrimary = index === 0;
    const size = isPrimary ? "W240 x H300 cm" : "A1 / 594 x 841 mm";
    const material = isPrimary ? "珍珠板 + 輸出貼圖" : "海報紙 + 霧膜";
    const quantity = isPrimary ? "1 式" : "2 張";
    const structureRequired = isPrimary ? "需要" : "不需要";
    const note = isPrimary ? "請延續主視覺，需搭配現場燈箱與入口動線。" : "需保留二次修改空間，週五前送審。";

    return {
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
      size,
      material,
      quantity,
      referenceUrl: "https://example.com/reference",
      structureRequired,
      outsourceStatus: isPrimary ? "已發包" : "待發包",
      outsourceTarget: isPrimary ? "星澄輸出" : "尚未指定",
      cost: isPrimary ? "NT$ 18,000" : "NT$ 6,800",
      note,
      plans: [
        {
          id: `${project.id}-${index}-plan-a`,
          title: isPrimary ? "主視覺輸出方案" : "海報主稿方案",
          size,
          material,
          structure: structureRequired,
          quantity,
          amount: isPrimary ? "NT$ 18,000" : "NT$ 6,800",
          previewUrl: isPrimary ? "https://example.com/design-preview-a" : "https://example.com/design-preview-b",
          vendor: isPrimary ? "星澄輸出" : "光域輸出",
        },
        {
          id: `${project.id}-${index}-plan-b`,
          title: isPrimary ? "入口延伸版型方案" : "審稿備案方案",
          size: isPrimary ? "A1 / 594 x 841 mm" : size,
          material: isPrimary ? "海報紙" : material,
          structure: isPrimary ? "立架展示" : structureRequired,
          quantity: isPrimary ? "2 張" : quantity,
          amount: isPrimary ? "NT$ 6,800" : "NT$ 5,900",
          previewUrl: isPrimary ? "https://example.com/design-preview-b" : "https://example.com/design-preview-c",
          vendor: isPrimary ? "光域輸出" : "星澄輸出",
        },
      ],
      documentRows: [
        {
          id: 1,
          item: isPrimary ? "主背板輸出" : "海報主稿輸出",
          size,
          materialStructure: `${material} + ${structureRequired}`,
          quantity,
        },
        {
          id: 2,
          item: isPrimary ? "入口海報輸出" : "審稿備案輸出",
          size: isPrimary ? "A1 / 594 x 841 mm" : size,
          materialStructure: isPrimary ? "海報紙 + 立架展示" : `${material} + ${structureRequired}`,
          quantity: isPrimary ? "2 張" : quantity,
        },
      ],
      documentLink: "https://example.com/design-final-file",
    };
  })
);

export function getDesignTaskById(id: string) {
  return designTaskGroups.find((task) => task.id === id);
}
