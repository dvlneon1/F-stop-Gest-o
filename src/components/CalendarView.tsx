"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isToday, isPast, getMonth, getYear, getDate, getDay, addWeeks, subMonths, addMonths, subWeeks } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Sun, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getMonthWeeks, getWeekDays, getStatusColor } from "@/lib/utils";
import { Shoot, typeLabels, statusLabels, ShootStatus } from "@/lib/constants";

interface CalendarViewProps {
  shoots: Shoot[];
  lang: string;
  onDateClick: (date: string, dayShoots: Shoot[]) => void;
}

export function CalendarView({ shoots, lang, onDateClick }: CalendarViewProps) {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const monthNames = lang === "pt" ? ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = lang === "pt" ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const shootsByDate: Record<string, Shoot[]> = {};
  shoots.forEach(s => {
    if (!shootsByDate[s.date]) shootsByDate[s.date] = [];
    shootsByDate[s.date].push(s);
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isMonthView = view === "month";

  if (!currentDate) {
    return <div className="calendar-view" aria-busy="true" />;
  }

  const monthLabel = monthNames[getMonth(currentDate)];
  const yearLabel = getYear(currentDate);

  return (
    <div className="calendar-view page-padding space-y-6 max-w-xl mx-auto">
      <header className="calendar-header flex items-center justify-between px-4">
        <Button variant="ghost" size="sm" onClick={() => {
          if (isMonthView) setCurrentDate(subMonths(currentDate, 1));
          else setCurrentDate(subWeeks(currentDate, 1));
        }} aria-label={isMonthView ? t("calendar.prevMonth", lang) : "Semana anterior"}>
          <ChevronLeft className="w-4 h-4 text-amber-500" />
        </Button>
        <div className="calendar-title flex flex-col items-center gap-1">
          {isMonthView ? (
            <>
              <h2 className="calendar-month text-heading text-wrap-balance">{monthLabel}</h2>
              <span className="calendar-year text-label">{yearLabel}</span>
            </>
          ) : (
            <>
              <h2 className="calendar-month text-heading text-wrap-balance">{format(currentDate, "dd MMM", { locale: lang === "pt" ? ptBR : enUS })}</h2>
              <span className="calendar-year text-label">{format(addWeeks(currentDate, 1), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</span>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          if (isMonthView) setCurrentDate(addMonths(currentDate, 1));
          else setCurrentDate(addWeeks(currentDate, 1));
        }} aria-label={isMonthView ? t("calendar.nextMonth", lang) : "Próxima semana"}>
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </Button>
      </header>

      <div className="calendar-view-toggle flex rounded-lg border border-border/60 bg-card/30 px-1">
        <Button variant={isMonthView ? "default" : "ghost"} size="sm" className="flex-1" onClick={() => setView("month")}>{t("calendar.month", lang)}</Button>
        <Button variant={isMonthView ? "ghost" : "default"} size="sm" className="flex-1" onClick={() => setView("week")}>{t("calendar.week", lang)}</Button>
      </div>

      {/* Month view - grid 7 dias alinhados */}
      {isMonthView && (
        <section className="calendar-month-section">
          <div className="calendar-grid px-4">
            <div className="calendar-weekdays grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day, i) => (
                <div key={i} className="calendar-weekday text-center text-label py-2">{day}</div>
              ))}
            </div>

            <div className="calendar-days grid grid-cols-7 gap-[8px]">
              {getMonthWeeks(currentDate).map((week, w) => week.map((date, d) => {
                if (!date) return <div key={`${w}-${d}`} className="calendar-day other-month aspect-square" />;
                const dateStr = format(date, "yyyy-MM-dd");
                const dayShoots = shootsByDate[dateStr] || [];
                const isTodayDay = isToday(date);
                const isPastDay = isPast(date) && !isTodayDay;
                const isOtherMonth = getMonth(date) !== getMonth(currentDate);

                return (
                  <button
                    key={dateStr}
                    className={`calendar-day aspect-square relative rounded-lg border border-border/60 touch-manipulation transition-all duration-150 flex flex-col items-center justify-center p-2 ${isTodayDay ? "border-amber-500 bg-amber-500/10" : ""} ${isPastDay ? "opacity-60" : ""} ${isOtherMonth ? "opacity-40" : ""} hover:border-muted/80 hover:bg-card/30`}
                    onClick={() => onDateClick(dateStr, dayShoots)}
                  >
                    <span className={`calendar-day-number text-data font-medium text-center ${isTodayDay ? "text-amber-500" : "text-foreground"}`}>{getDate(date)}</span>
                    {isTodayDay && <span className="calendar-today-ring absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-500" />}
                    <div className="calendar-day-shoots flex flex-wrap justify-center gap-1 mt-1 w-full items-center min-h-[20px]">
                      {dayShoots.slice(0, 3).map(s => (
                        <span key={s.id} className="calendar-shoot-dot w-2 h-2 flex-shrink-0 rounded-full" style={{ background: `var(--accent-${s.type})` }} />
                      ))}
                      {dayShoots.length > 3 && <span className="calendar-shoot-more text-label">+{dayShoots.length - 3}</span>}
                    </div>
                  </button>
                );
              }))}
            </div>
          </div>
        </section>
      )}

      {/* Week view - dias um abaixo do outro, visual estilo card de cliente */}
      {!isMonthView && (
        <section className="calendar-week-section space-y-3 mb-20">
          {getWeekDays(currentDate).map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayShoots = shootsByDate[dateStr] || [];
            const isTodayDay = isToday(day);
            const isPastDay = isPast(day) && !isTodayDay;

            return (
              <div
                key={dateStr}
                className={`calendar-week-day relative rounded-xl border border-border/60 bg-card/90 backdrop-blur-md touch-manipulation transition-all duration-150 ${isTodayDay ? "border-amber-500 ring-1 ring-amber-500/50" : ""} ${isPastDay ? "opacity-70" : ""} hover:border-muted/80 hover:bg-card/100 cursor-pointer`}
                onClick={() => onDateClick(dateStr, dayShoots)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDateClick(dateStr, dayShoots); }}}
                tabIndex={0}
                role="button"
                aria-label={`${dayNames[getDay(day)]}, ${getDate(day)} de ${monthLabel}, ${dayShoots.length} shoot${dayShoots.length !== 1 ? "s" : ""}`}
              >
                <div className="grid grid-cols-[56px_1fr] gap-3 items-center p-3">
                  {/* Lado esquerdo: dia da semana + número */}
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-label ${isTodayDay ? "text-amber-500" : "text-muted"}`}>{dayNames[getDay(day)]}</span>
                    <span className={`text-heading ${isTodayDay ? "text-amber-500" : "text-foreground"}`}>{getDate(day)}</span>
                  </div>

                  {/* Lado direito: lista de shoots do dia */}
                  <div className="flex flex-col gap-1 min-w-0">
                    {dayShoots.length === 0 ? (
                      <div className="text-center py-3 text-body text-muted/80">{t("empty.text", lang)}</div>
                    ) : (
                      dayShoots.map((s) => (
                        <button
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card/50 text-left transition-colors hover:bg-card/80"
                          onClick={(e) => { e.stopPropagation(); onDateClick(dateStr, [s]); }}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-heading text-wrap-balance text-foreground">{s.client}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span className="text-data text-xs text-foreground/90">{s.time}</span>
                              <span className="w-1 h-1 bg-border rounded-full" aria-hidden="true" />
                              <span className="text-label text-foreground/70">{typeLabels[lang as keyof typeof typeLabels]?.[s.type] || s.type}</span>
                            </div>
                          </div>
                          <span className={`text-data text-xs font-medium ${getStatusColor(s.status as ShootStatus)}`}>{statusLabels[lang as keyof typeof statusLabels]?.[s.status] || s.status}</span>
                        </button>
                      ))
                    )}
                  </div>
                  {isTodayDay && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Descrição sobre como funciona o calendário */}
      <section className="mt-8 mb-20 space-y-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md p-6">
        <h2 className="text-heading mb-2 text-wrap-balance">Como funciona o calendário</h2>
        <div className="space-y-2 text-body text-muted/85">
          <p className="flex items-start gap-2">
            <CalendarDays className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="text-foreground/95">Toque em qualquer dia para ver os shoots agendados nessa data.</span>
          </p>
          <p className="flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="text-foreground/95">No modo <b className="text-foreground font-semibold">Semana</b>, os dias ficam um abaixo do outro com todos os shoots listados.</span>
          </p>
          <p className="flex items-start gap-2">
            <Sun className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="text-foreground/95">O dia de hoje é destacado com um ring laranja.</span>
          </p>
          <p className="flex items-start gap-2">
            <ChevronLeft className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="text-foreground/95">Use as setas para navegar entre meses ou semanas.</span>
          </p>
        </div>
      </section>
    </div>
  );
}
