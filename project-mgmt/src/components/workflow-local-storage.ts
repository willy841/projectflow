import type {
  AssignmentReply,
  DesignAssignmentDraft,
  ProcurementAssignmentDraft,
  VendorAssignmentDraft,
} from "@/components/execution-tree";

const TREE_STORAGE_PREFIX = "projectflow-execution-tree:";
const SECTION_STORAGE_PREFIX = "projectflow-execution-section:";

export const workflowLocalStorageBoundary = {
  mode: "legacy-local-execution-universe-persistence",
  storageScope: ["execution-tree", "execution-section"],
  consumerScope: ["local-workflow-readback", "legacy-derived-board", "legacy-cost-bridge"],
  retirementStatus: "surface-minimized-but-still-required-by-active-readback-chain",
} as const;

export type StoredExecutionTreeState = {
  savedDesignAssignments: Record<string, DesignAssignmentDraft>;
  savedProcurementAssignments: Record<string, ProcurementAssignmentDraft>;
  savedVendorAssignments: Record<string, VendorAssignmentDraft>;
};

export type StoredExecutionSectionState = {
  replyOverrides: Record<string, AssignmentReply[]>;
  generatedDesignDocuments: Record<string, number>;
  generatedProcurementDocuments: Record<string, number>;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function getExecutionTreeStorageKey(projectId: string) {
  return `${TREE_STORAGE_PREFIX}${projectId}`;
}

function getExecutionSectionStorageKey(projectId: string) {
  return `${SECTION_STORAGE_PREFIX}${projectId}`;
}

export function readStoredExecutionTreeState(projectId: string): StoredExecutionTreeState {
  return readJson<StoredExecutionTreeState>(getExecutionTreeStorageKey(projectId), {
    savedDesignAssignments: {},
    savedProcurementAssignments: {},
    savedVendorAssignments: {},
  });
}

export function readStoredExecutionSectionState(projectId: string): StoredExecutionSectionState {
  return readJson<StoredExecutionSectionState>(getExecutionSectionStorageKey(projectId), {
    replyOverrides: {},
    generatedDesignDocuments: {},
    generatedProcurementDocuments: {},
  });
}
