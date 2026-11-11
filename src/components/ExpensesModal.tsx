"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/lib/constants";

interface ExpensesModalProps {
  open: boolean;
  onClose: () => void;
  lang: string;
  expenses: Expense[];
  hideFinancialValues: boolean;
}

export function ExpensesModal({ open, onClose, lang, expenses, hideFinancialValues }: ExpensesModalProps) {
  const sorted = [...expenses].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("user.totalExpenses", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <CreditCard className="w-10 h-10 text-amber-500" />
            <p className="text-label">{t("user.totalExpensesSubtitle", lang)}</p>
          </div>
          <p className="text-display text-center">{hideFinancialValues ? "***" : formatCurrency(total, lang)}</p>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-3 max-h-[300px] overflow-y-auto">
            {sorted.length === 0 ? (
              <p className="text-muted text-center py-8">{t("user.noExpenses", lang)}</p>
            ) : (
              sorted.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border-b border-border/60 last:border-b-0">
                  <div>
                    <p className="text-body">{expense.title || expense.category}</p>
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
                    <p className="text-label">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-heading text-destructive">-{hideFinancialValues ? "***" : formatCurrency(expense.amount, lang)}</p>
                  </div>
                </div>
              ))
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
