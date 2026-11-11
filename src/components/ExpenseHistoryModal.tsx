"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/lib/constants";

interface ExpenseHistoryModalProps {
  open: boolean;
  onClose: () => void;
  lang: string;
  expenses: Expense[];
  hideFinancialValues: boolean;
}

export function ExpenseHistoryModal({ open, onClose, lang, expenses, hideFinancialValues }: ExpenseHistoryModalProps) {
  const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("month");

  const sorted = [...expenses].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const groupKey = (expense: Expense) => {
    const d = new Date(expense.createdAt || expense.date);
    if (groupBy === "day") return format(d, "yyyy-MM-dd");
    if (groupBy === "year") return format(d, "yyyy");
    return format(d, "yyyy-MM");
  };

  const grouped: Record<string, Expense[]> = {};
  sorted.forEach(e => {
    const key = groupKey(e);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const groupLabel = (key: string) => {
    if (groupBy === "day") return format(parseISO(key), "dd/MM/yyyy", { locale: lang === "pt" ? ptBR : enUS });
    if (groupBy === "year") return key;
    return format(parseISO(key + "-01"), "MMMM yyyy", { locale: lang === "pt" ? ptBR : enUS });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("user.expenseHistory", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-data">{t("user.expenseHistoryGroupBy", lang)}:</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setGroupBy("day")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${groupBy === "day" ? "bg-amber-500 text-amber-950 border-amber-500" : "text-muted border-border/60 hover:bg-muted/30"}`}
              >{t("user.groupByDay", lang)}</button>
              <button
                onClick={() => setGroupBy("month")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${groupBy === "month" ? "bg-amber-500 text-amber-950 border-amber-500" : "text-muted border-border/60 hover:bg-muted/30"}`}
              >{t("user.groupByMonth", lang)}</button>
              <button
                onClick={() => setGroupBy("year")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${groupBy === "year" ? "bg-amber-500 text-amber-950 border-amber-500" : "text-muted border-border/60 hover:bg-muted/30"}`}
              >{t("user.groupByYear", lang)}</button>
            </div>
          </div>
          <p className="text-display text-center">{hideFinancialValues ? "***" : formatCurrency(total, lang)}</p>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-3 max-h-[400px] overflow-y-auto">
            {sorted.length === 0 ? (
              <p className="text-muted text-center py-8">{t("user.noExpenses", lang)}</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(grouped).map(([group, items]) => {
                  const groupTotal = items.reduce((sum, e) => sum + e.amount, 0);
                  return (
                    <div key={group} className="border-b border-border/60 last:border-b-0 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-label font-medium">{groupLabel(group)}</p>
                        <p className="text-data text-xs">{hideFinancialValues ? "***" : formatCurrency(groupTotal, lang)}</p>
                      </div>
                      <div className="space-y-1">
                        {items.map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                            <div>
                              <p className="text-body text-xs">{expense.title || expense.category}</p>
                              <div className="flex items-center gap-1 text-label text-[10px]">
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
                            <div className="text-right">
                              <p className="text-data text-xs text-destructive">-{hideFinancialValues ? "***" : formatCurrency(expense.amount, lang)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">{t("modal.close", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
