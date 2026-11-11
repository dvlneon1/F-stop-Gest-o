"use client";

import { LayoutGrid, CalendarDays, Camera, CheckCircle, DollarSign, AlertCircle, BarChart3, Users2, User, Briefcase, Music } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Shoot, Client, ShootType, eventSubcategories, photographerPlatforms, typeIcons, typeLabels } from "@/lib/constants";

interface InsightsViewProps {
  shoots: Shoot[];
  clients: Client[];
  lang: string;
  hideFinancialValues: boolean;
}

export function InsightsView({ shoots, clients, lang, hideFinancialValues }: InsightsViewProps) {
  const total = shoots.length;
  const booked = shoots.filter(s => s.status === "booked").length;
  const shot = shoots.filter(s => s.status === "shot").length;
  const delivered = shoots.filter(s => s.status === "delivered" || s.status === "paid").length;
  const paid = shoots.filter(s => s.status === "paid").length;
  const pending = shoots.filter(s => s.status === "booked" && s.deposit && !s.balance).length;
  // Unified financial truth: revenue derived from shoots.amount, not client.totalSpent
  const revenue = shoots.filter(s => s.status === "paid" || s.status === "delivered")
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const conversion = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const stats = [
    { label: t("insights.total", lang), value: total, icon: LayoutGrid },
    { label: t("insights.booked", lang), value: booked, icon: CalendarDays },
    { label: t("insights.shot", lang), value: shot, icon: Camera },
    { label: t("insights.delivered", lang), value: delivered, icon: CheckCircle },
    { label: t("insights.paid", lang), value: paid, icon: DollarSign },
    { label: t("insights.pending", lang), value: pending, icon: AlertCircle },
    { label: t("insights.revenue", lang), value: hideFinancialValues ? "***" : formatCurrency(revenue, lang), icon: DollarSign },
    { label: t("insights.conversion", lang), value: `${conversion}%`, icon: BarChart3 },
  ];

  return (
    <div className="page-padding space-y-6 max-w-6xl mx-auto">
      <h1 className="text-display">{t("tab.insights", lang)}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-heading">{stat.value}</p>
            <p className="text-label mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline by type */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-4">
        <h2 className="text-heading mb-4 text-wrap-balance">{t("insights.total", lang)} por tipo</h2>
        <div className="space-y-3">
          {(["wedding", "portrait", "commercial", "family", "event"] as ShootType[]).map(type => {
            const typeShoots = shoots.filter(s => s.type === type);
            const count = typeShoots.length;
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {typeIcons[type]}
                </div>
                <span className="text-label flex-1">{typeLabels[lang as keyof typeof typeLabels]?.[type] || type}</span>
                <div className="flex-1 h-2 bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
                </div>
                <span className="text-data w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event subcategories */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-4">
        <h2 className="text-heading mb-4 text-wrap-balance">{t("insights.bySubcategory", lang)}</h2>
        <div className="space-y-3">
          {Object.entries(eventSubcategories).map(([key, sub]) => {
            const count = shoots.filter(s => s.type === "event" && s.subcategory === key).length;
            return (
              <div key={key} className="flex items-center gap-3">
                <sub.icon className="w-6 h-6 text-amber-500 shrink-0" />
                <span className="text-label flex-1 capitalize">{sub.label}</span>
                <div className="flex-1 h-2 bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
                </div>
                <span className="text-data w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photographer platforms */}
      <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-4 mb-24">
        <h2 className="text-heading mb-4 text-wrap-balance">{t("insights.byPlatform", lang)}</h2>
        <div className="space-y-3">
          {Object.entries(photographerPlatforms).map(([key, plat]) => {
            const count = shoots.filter(s => s.type === "event" && s.platform === key).length;
            return (
              <div key={key} className="flex items-center gap-3">
                <plat.icon className="w-6 h-6 text-amber-500 shrink-0" />
                <span className="text-label flex-1 capitalize">{plat.label}</span>
                <div className="flex-1 h-2 bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
                </div>
                <span className="text-data w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
