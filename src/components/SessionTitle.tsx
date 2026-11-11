"use client";

import { t } from "@/lib/i18n";

interface SessionTitleProps {
  currentTab: string;
  lang: string;
}

export function SessionTitle({ currentTab, lang }: SessionTitleProps) {
  const titles: Record<string, string> = {
    today: t("session.today", lang),
    archive: t("session.archive", lang),
    clients: t("session.clients", lang),
    calendar: t("session.calendar", lang),
    insights: t("session.insights", lang),
    settings: t("session.settings", lang),
  };
  return (
    <div className="mb-6">
      <h1 className="text-display text-wrap-balance">{titles[currentTab] || t("session.today", lang)}</h1>
    </div>
  );
}
