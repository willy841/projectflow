export const projectWorkflowStoreBoundary = {
  mode: "legacy-reexport-facade",
  scope: "local-workflow-readback-only",
} as const;

export { readStoredExecutionSectionState, readStoredExecutionTreeState, type StoredExecutionSectionState, type StoredExecutionTreeState } from "@/components/workflow-local-storage";
