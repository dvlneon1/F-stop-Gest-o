"use client";

import { Home, Users, Calendar as CalendarIcon, BarChart3, User, Plus, Globe } from "lucide-react";
import { t } from "@/lib/i18n";

interface TabBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  lang: string;
  showFAB: boolean;
  onFABClick: () => void;
}

export function TabBar({ currentTab, onTabChange, lang, showFAB, onFABClick }: TabBarProps) {
  const tabs = [
    { id: "today", icon: Home, label: t("tab.today", lang) },
    { id: "platform", icon: Globe, label: t("tab.platform", lang) },
    { id: "clients", icon: Users, label: t("tab.clients", lang) },
    { id: "calendar", icon: CalendarIcon, label: t("tab.calendar", lang) },
    { id: "insights", icon: BarChart3, label: t("tab.insights", lang) },
    { id: "user", icon: User, label: t("tab.user", lang) },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 border-t border-border/60 backdrop-blur-md rounded-t-2xl px-4 py-3 pb-safe pb-[env(safe-area-inset-bottom)]" role="navigation" aria-label={t("menu.actions", lang)}>
        <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab flex flex-col items-center justify-center py-3 min-h-[56px] transition-colors duration-150 touch-manipulation rounded-full flex-1 gap-1 ${currentTab === tab.id ? "bg-card/90 border border-border/80 shadow-sm shadow-amber-500/30" : "text-muted hover:bg-card/20"}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={currentTab === tab.id ? "page" : undefined}
              data-tab={tab.id}
            >
              <tab.icon className={`w-6 h-6 stroke-2 ${currentTab === tab.id ? "text-amber-500" : "text-muted"}`} strokeWidth={2} />
              <span className="text-label text-[0.6rem] leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {showFAB && (
        <div className="fixed bottom-28 right-4 z-40 w-16 h-16 rounded-full bg-amber-500 text-amber-950 shadow-2xl hover:bg-amber-400 transition-colors flex items-center justify-center pb-safe pb-[env(safe-area-inset-bottom)]">
          <button onClick={onFABClick} className="w-full h-full flex items-center justify-center">
            <Plus className="w-7 h-7" />
          </button>
        </div>
      )}
    </>
  );
}
