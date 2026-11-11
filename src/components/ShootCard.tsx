"use client";

import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Sun, User, Users, Briefcase, Music } from "lucide-react";
import { t } from "@/lib/i18n";
import { typeLabels, statusLabels, eventSubcategories } from "@/lib/constants";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { Shoot, CoverType } from "@/lib/constants";

interface ShootCardProps {
  shoot: Shoot;
  onClick: () => void;
  lang: string;
  isToday?: boolean;
  todayStr: string;
}

export function ShootCard({ shoot, onClick, lang, isToday, todayStr }: ShootCardProps) {
  const isTodayShoot = shoot.date === todayStr || shoot.status === "today";

  return (
    <article
      className={`shoot-card-aspect relative overflow-hidden cursor-pointer touch-manipulation transition-all duration-200 active:scale-[0.98] min-h-[140px] rounded-lg border border-border/60 bg-card/90 backdrop-blur-md ${isTodayShoot ? "border-amber-500" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }}}
      tabIndex={0}
      role="button"
      aria-label={`${shoot.client}, ${typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}, ${statusLabels[lang as keyof typeof statusLabels]?.[shoot.status] || shoot.status}`}
    >
      <PlaceholderImage type={shoot.cover} className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-heading truncate text-wrap-balance">{shoot.client}</h3>
          <div className="flex items-center gap-2">
            <span className="text-label">{format(parseISO(shoot.date), "dd MMM", { locale: lang === "pt" ? ptBR : enUS })}</span>
            <span className="text-label">·</span>
            <span className="text-label">{shoot.time}</span>
            <span className="text-label capitalize">{typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}</span>
            {shoot.subcategory && (
              <>
                <span className="text-label opacity-50">·</span>
                <span className="text-label capitalize text-amber-500">{eventSubcategories[shoot.subcategory].label}</span>
              </>
            )}
            {shoot.type === "event" && shoot.eventTitle && (
              <>
                <span className="text-label opacity-50">·</span>
                <span className="text-label capitalize text-amber-500">{shoot.eventTitle}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {isTodayShoot && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500/90 text-amber-950 px-2 py-1 text-data text-xs font-medium rounded-md">
          <Sun className="w-3 h-3" />
          {t("today.shoot", lang)}
        </div>
      )}
    </article>
  );
}
