"use client";

import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";

interface EmptyStateProps {
  title: string;
  text: string;
  ctaLabel: string;
  onCtaClick: () => void;
  icon: React.ElementType;
  className?: string;
}

export function EmptyState({ title, text, ctaLabel, onCtaClick, icon: Icon, className }: EmptyStateProps) {
  return (
    <div className={`empty-state flex flex-col items-center justify-center min-h-[60vh] text-center px-8 ${className || ""}`} role="status">
      <Icon className="empty-state__icon w-20 h-20 text-muted/50 mb-4" strokeWidth={1.5} />
      <h2 className="empty-state__title text-heading mb-2 text-wrap-balance">{title}</h2>
      <p className="empty-state__text text-body max-w-xs text-muted">{text}</p>
      <button className="empty-state__cta mt-5 whitespace-nowrap bg-amber-500 text-amber-950 hover:bg-amber-400 rounded-full px-6 py-2 font-medium shadow-lg transition-colors flex items-center gap-2" onClick={onCtaClick}>
        <Plus className="w-4 h-4" />{ctaLabel}
      </button>
    </div>
  );
}
