"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from "date-fns";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Client, Expense, Shoot } from "@/lib/constants";

interface NetRevenueModalProps {
  open: boolean;
  onClose: () => void;
  lang: string;
  clients: Client[];
  expenses: Expense[];
  shoots: Shoot[];
  hideFinancialValues: boolean;
}

export function NetRevenueModal({ open, onClose, lang, clients, expenses, shoots, hideFinancialValues }: NetRevenueModalProps) {
  // Unified financial truth: gross derived from shoots.amount (paid/delivered), not client.totalSpent
  const gross = shoots.filter(s => s.status === "paid" || s.status === "delivered")
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = gross - totalExp;
  const paidShoots = shoots.filter(s => s.status === "paid" || s.status === "delivered").sort((a, b) => b.date.localeCompare(a.date));

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthRevenue = paidShoots.reduce((sum, s) => {
    const d = parseISO(s.date);
    if (d >= currentMonthStart && d <= currentMonthEnd) return sum + (s.amount || 0);
    return sum;
  }, 0);
  const previousMonthRevenue = paidShoots.reduce((sum, s) => {
    const d = parseISO(s.date);
    if (d >= previousMonthStart && d <= previousMonthEnd) return sum + (s.amount || 0);
    return sum;
  }, 0);

  const monthChange = previousMonthRevenue === 0
    ? (currentMonthRevenue > 0 ? 100 : 0)
    : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  const payingClientCount = clients.filter(c => c.totalSpent > 0).length;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("user.netRevenue", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="w-10 h-10 text-amber-500" />
            <p className="text-label">{t("user.netRevenueSubtitle", lang)}</p>
          </div>
          <p className="text-display text-center">{hideFinancialValues ? "***" : formatCurrency(net, lang)}</p>
          <div className="flex items-center justify-center gap-2 text-xs mt-2">
            <span className="text-label">{t("user.currentMonth", lang)}:</span>
            <span className="text-data">{hideFinancialValues ? "***" : formatCurrency(currentMonthRevenue, lang)}</span>
            <span className="text-label opacity-60">·</span>
            <span className="text-label">{t("user.previousMonth", lang)}:</span>
            <span className="text-data">{hideFinancialValues ? "***" : formatCurrency(previousMonthRevenue, lang)}</span>
            <span className={`text-data font-medium ${monthChange >= 0 ? "text-emerald-500" : "text-destructive"}`}>
              {monthChange >= 0 ? "+" : ""}{monthChange.toFixed(0)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl border border-border/60 bg-card/90 backdrop-blur-md">
              <p className="text-label mb-1">{t("user.grossRevenue", lang)}</p>
              <p className="text-heading">{hideFinancialValues ? "***" : formatCurrency(gross, lang)}</p>
              <p className="text-label mt-1">{payingClientCount} {t("clients.shoots", lang)}</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-card/90 backdrop-blur-md">
              <p className="text-label mb-1">{t("user.totalExpenses", lang)}</p>
              <p className="text-heading">{hideFinancialValues ? "***" : formatCurrency(totalExp, lang)}</p>
              <p className="text-label mt-1">{expenses.length} {t("expenses.new", lang)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-3 max-h-[220px] overflow-y-auto">
            <p className="text-label mb-2">{t("user.recentMovements", lang)}</p>
            {paidShoots.slice(0, 5).map((shoot) => (
              <div key={shoot.id} className="flex items-center justify-between p-2 border-b border-border/60 last:border-b-0">
                <div>
                  <p className="text-body text-xs">{shoot.client}</p>
                  <p className="text-label">{shoot.date} {shoot.time}</p>
                </div>
                <p className="text-label">{t("clients.completed", lang)}</p>
              </div>
            ))}
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-2 border-b border-border/60 last:border-b-0">
                <div>
                  <p className="text-body text-xs">{expense.title || expense.category}</p>
                  <div className="flex items-center gap-1 text-label mt-1">
                    <span className="text-muted">{expense.createdAt}</span>
                    <span className="text-muted">·</span>
                    <span>{t(`expense.${expense.paymentType}`, lang) || expense.paymentType}</span>
                    {expense.installments && expense.paymentType === "credito" && (
                      <>
                        <span className="text-muted">·</span>
                        <span>{expense.installments}x {t("expenses.installmentsX", lang)}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-data text-xs text-destructive">-{hideFinancialValues ? "***" : formatCurrency(expense.amount, lang)}</p>
              </div>
            ))}
            {(paidShoots.length === 0 && expenses.length === 0) && (
              <p className="text-muted text-center py-4">{t("user.noExpenses", lang)}</p>
            )}
          </div>
          <div className="pt-4 border-t border-border/60">
            <p className="text-label mb-1">{t("user.formula", lang)}</p>
            <p className="text-data mt-1">{t("user.grossRevenue", lang)} − {t("user.totalExpenses", lang)} = {t("user.netRevenue", lang)}</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">{t("modal.close", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
