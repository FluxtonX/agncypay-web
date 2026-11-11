"use client";

import { useState } from "react";
import { Banner, Button, Modal } from "./ui";

/** Built-in confirmation step for actions that are hard to undo. */
export function Confirm({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    setError(null);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Keep it
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await onConfirm();
                close();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-ink/75">{body}</div>
      {error && (
        <Banner tone="danger" className="mt-4">
          {error}
        </Banner>
      )}
    </Modal>
  );
}
