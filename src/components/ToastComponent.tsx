"use client";

import { Info, CheckCircle, AlertCircle } from "lucide-react";

interface ToastComponentProps {
  message: string;
  type?: "default" | "success" | "error";
}

export function ToastComponent({ message, type = "default" }: ToastComponentProps) {
  const icons = {
    default: <Info className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-card/90 backdrop-blur-md">
      {icons[type]}
      <div className="flex-1">
        <p className="text-body">{message}</p>
      </div>
    </div>
  );
}
