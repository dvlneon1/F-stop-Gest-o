import { ShootStatus } from "@/lib/constants";
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, startOfDay, endOfDay, getDay, getDate, getMonth, getYear, addDays as dateFnsAddDays } from "date-fns";

export function formatCurrency(value: number, lang: string = "pt"): string {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: "BRL" }).format(value);
}

export function getStatusColor(status: ShootStatus): string {
  switch (status) {
    case "inquiry": return "bg-gray-600 text-gray-200 border-gray-500";
    case "booked": return "bg-amber-600 text-amber-50 border-amber-500";
    case "shot": return "bg-blue-600 text-blue-50 border-blue-500";
    case "culled": return "bg-purple-600 text-purple-50 border-purple-500";
    case "proofing": return "bg-orange-600 text-orange-50 border-orange-500";
    case "delivered": return "bg-green-600 text-green-50 border-green-500";
    case "paid": return "bg-emerald-600 text-emerald-50 border-emerald-500";
    case "today": return "bg-amber-500 text-amber-950 border-amber-400";
    default: return "bg-gray-600 text-gray-200 border-gray-500";
  }
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

export function getMonthWeeks(currentDate: Date): (Date | null)[][] {
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const startDay = getDay(firstDay);
  const daysInMonth = getDate(lastDay);

  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(startDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(getYear(currentDate), getMonth(currentDate), i);
    week.push(date);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export function getWeekDays(currentDate: Date): Date[] {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => dateFnsAddDays(weekStart, i));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
