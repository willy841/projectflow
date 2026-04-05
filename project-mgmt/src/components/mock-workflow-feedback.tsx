"use client";

import { useState } from "react";

type FeedbackActionButtonsProps = {
  saveLabel?: string;
  confirmLabel: string;
  confirmMessage: string;
  saveMessage?: string;
  className?: string;
  hideSave?: boolean;
};

export function FeedbackActionButtons({
  saveLabel = "儲存",
  confirmLabel,
  confirmMessage,
  saveMessage = "已儲存目前方案內容。",
  className = "",
  hideSave = false,
}: FeedbackActionButtonsProps) {
  const [message, setMessage] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!hideSave ? (
          <button
            type="button"
            onClick={() => setMessage(saveMessage)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            {saveLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setConfirmed(true);
            setMessage(confirmMessage);
          }}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {confirmed ? "已確認" : confirmLabel}
        </button>
      </div>
      {message ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
    </div>
  );
}

type QuickFeedbackButtonsProps = {
  primaryLabel: string;
  primaryMessage: string;
  secondaryLabel?: string;
  secondaryMessage?: string;
};

export function QuickFeedbackButtons({
  primaryLabel,
  primaryMessage,
  secondaryLabel,
  secondaryMessage,
}: QuickFeedbackButtonsProps) {
  const [message, setMessage] = useState<string>("");

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {secondaryLabel && secondaryMessage ? (
          <button
            type="button"
            onClick={() => setMessage(secondaryMessage)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMessage(primaryMessage)}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {primaryLabel}
        </button>
      </div>
      {message ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}
    </div>
  );
}
