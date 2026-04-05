"use client";

export type MockDocumentRow = {
  id: number;
  item: string;
  size?: string;
  materialStructure?: string;
  quantity: string;
};

export type MockTaskDocumentPayload = {
  rows: MockDocumentRow[];
  documentLink?: string;
  updatedAt: number;
};

const STORAGE_KEY = "projectflow-mock-task-documents";

function readStore(): Record<string, MockTaskDocumentPayload> {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, MockTaskDocumentPayload>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, MockTaskDocumentPayload>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveMockTaskDocument(taskId: string, payload: MockTaskDocumentPayload) {
  const store = readStore();
  store[taskId] = payload;
  writeStore(store);
}

export function getMockTaskDocument(taskId: string) {
  const store = readStore();
  return store[taskId];
}
