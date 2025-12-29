"use client";

import { useState } from "react";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm?: () => void;
}

export function useConfirm() {
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Підтвердити",
    cancelText: "Скасувати",
    type: "danger",
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: "danger" | "warning" | "info";
    }
  ) => {
    setConfirm({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText || "Підтвердити",
      cancelText: options?.cancelText || "Скасувати",
      type: options?.type || "danger",
    });
  };

  const hideConfirm = () => {
    setConfirm((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleConfirm = () => {
    if (confirm.onConfirm) {
      confirm.onConfirm();
    }
    hideConfirm();
  };

  return {
    confirm,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
}
