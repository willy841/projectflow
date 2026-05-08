export type VendorDocumentSnapshotPayload = {
  title?: string;
  requirement_text?: string | null;
  amount?: string | null;
};

export type VendorDocumentLine = {
  itemName: string;
  requirementText: string;
  amountLabel: string | null;
  amountValue: number | null;
};

function parseSnapshotAmount(value: string | null | undefined) {
  if (!value) return null;
  const normalized = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) ? normalized : null;
}

export function mapVendorSnapshotToDocumentLine(
  payload: VendorDocumentSnapshotPayload,
  fallbackIndex: number,
): VendorDocumentLine {
  return {
    itemName: payload.title || `處理方案 ${fallbackIndex + 1}`,
    requirementText: payload.requirement_text ?? '',
    amountLabel: payload.amount ?? null,
    amountValue: parseSnapshotAmount(payload.amount),
  };
}

export function getLatestConfirmationPriorityRule() {
  return {
    source: 'latest-confirmation-snapshot',
    description:
      'Document/package/retained readback must use the latest confirmation snapshot as the current truth source; live plans remain editable state only and older snapshots are retained for history, not current readback.',
  } as const;
}
