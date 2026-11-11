"use client";

import { Home, Users, Calendar as CalendarIcon, BarChart3, User, Plus } from "lucide-react";
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
    { id: "today", icon: Home },
    { id: "clients", icon: Users },
    { id: "calendar", icon: CalendarIcon },
    { id: "insights", icon: BarChart3 },
    { id: "user", icon: User },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-background/90 border-t border-border/60 backdrop-blur-md flex items-center justify-center rounded-t-2xl -mb-3 px-6 py-3" role="navigation" aria-label={t("menu.actions", lang)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab flex flex-col items-center justify-center px-6 py-1 min-h-[48px] transition-colors duration-150 touch-manipulation rounded-full ${currentTab === tab.id ? "bg-card/90 border border-border/80 shadow-sm shadow-amber-500/30" : "text-muted hover:bg-card/20"}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={currentTab === tab.id ? "page" : undefined}
            data-tab={tab.id}
          >
            <tab.icon className={`w-7 h-7 stroke-2 ${currentTab === tab.id ? "text-amber-500" : "text-muted"}`} strokeWidth={2} />
          </button>
        ))}
      </nav>
      {showFAB && (
        <button
          onClick={onFABClick}
          className="fixed bottom-32 right-6 z-40 w-20 h-20 rounded-full bg-amber-500 text-amber-950 shadow-2xl hover:bg-amber-400 transition-colors flex items-center justify-center"
          aria-label={t("menu.create", lang)}
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </>
  );
}
