type WorkflowReplyInput = {
  message?: string;
};

export type ParsedWorkflowReply = {
  title: string;
  vendor: string;
  amount: string;
  confirmed: boolean;
};

function pickLine(message: string, labels: string[]) {
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const loweredLabels = labels.map((label) => label.toLowerCase());

  for (const line of lines) {
    const lower = line.toLowerCase();
    const matchedIndex = loweredLabels.findIndex((label) => lower.startsWith(label));
    if (matchedIndex >= 0) {
      const raw = line.slice(labels[matchedIndex].length).trim();
      return raw.replace(/^[:：-]\s*/, "").trim();
    }
  }

  return "";
}

export function parseCurrency(value: string) {
  const normalized = String(value ?? "").replace(/[^\d.-]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

export function parseReplyMessage(reply: WorkflowReplyInput): ParsedWorkflowReply {
  const message = String(reply?.message ?? "").trim();
  const title = pickLine(message, ["標題", "title"]) || pickLine(message, ["品項", "item"]) || "未命名項目";
  const vendor = pickLine(message, ["廠商", "vendor"]) || "未指定廠商";
  const amount = pickLine(message, ["金額", "amount", "報價", "費用"]) || "0";
  const lower = message.toLowerCase();
  const confirmed = /已確認|確認|confirmed|approve|approved/.test(message) || /confirmed/.test(lower);

  return {
    title,
    vendor,
    amount,
    confirmed,
  };
}
