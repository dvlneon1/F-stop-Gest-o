"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { t } from "@/lib/i18n";
import { Wallet, FileText, CreditCard, Monitor, DollarSign, Camera, Megaphone, MapPin, Utensils, Code2, Building2, MoreHorizontal } from "lucide-react";
import { Expense } from "@/lib/constants";

interface NewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Expense>) => Promise<boolean>;
  lang: string;
}

// Categorias padrão de despesas
const expenseCategories: Record<string, { translationKey: string; icon: React.ElementType }> = {
  equipment: { translationKey: "expense.equipment", icon: Camera },
  marketing: { translationKey: "expense.marketing", icon: Megaphone },
  transport: { translationKey: "expense.transport", icon: MapPin },
  food: { translationKey: "expense.food", icon: Utensils },
  software: { translationKey: "expense.software", icon: Code2 },
  studio: { translationKey: "expense.studio", icon: Building2 },
  other: { translationKey: "expense.other", icon: MoreHorizontal },
};

// Tipos de pagamento
const expensePaymentTypes: Record<string, { translationKey: string; icon: React.ElementType }> = {
  pix: { translationKey: "expense.pix", icon: Wallet },
  boleto: { translationKey: "expense.boleto", icon: FileText },
  debito: { translationKey: "expense.debito", icon: CreditCard },
  credito: { translationKey: "expense.credito", icon: CreditCard },
  cripto: { translationKey: "expense.cripto", icon: Monitor },
  dinheiro: { translationKey: "expense.dinheiro", icon: DollarSign },
};

export function NewExpenseModal({ open, onClose, onSubmit, lang }: NewExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    paymentType: "",
    installments: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSubmit({
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount) || 0,
      date: formData.date,
      description: formData.description,
      paymentType: formData.paymentType,
      installments: formData.paymentType === "credito" ? formData.installments : undefined,
    });
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("expenses.new", lang)}</DialogTitle>
        </DialogHeader>
        <form id="expenseForm" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="expenseTitle" className="text-label">{t("expenses.title", lang)}</Label>
            <Input id="expenseTitle" placeholder={t("expenses.titlePlaceholder", lang)} value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenseCategory" className="text-label">{t("expenses.category", lang)}</Label>
            <Select id="expenseCategory" value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v || "" }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("expenses.selectCategory", lang)} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(expenseCategories).map(([key, cat]) => (
                  <SelectItem key={key} value={key} className="flex items-center gap-2">
                    <cat.icon className="w-3 h-3 text-amber-500" />
                    {t(cat.translationKey, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expenseAmount" className="text-label">{t("expenses.amount", lang)}</Label>
              <Input id="expenseAmount" type="number" placeholder="0,00" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate" className="text-label">{t("expenses.date", lang)}</Label>
              <Input id="expenseDate" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expensePaymentType" className="text-label">{t("expenses.paymentType", lang)}</Label>
            <Select id="expensePaymentType" value={formData.paymentType} onValueChange={(v) => setFormData(prev => ({ ...prev, paymentType: v || "" }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("expenses.selectPaymentType", lang)} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(expensePaymentTypes).map(([key, pay]) => (
                  <SelectItem key={key} value={key} className="flex items-center gap-2">
                    <pay.icon className="w-3 h-3 text-amber-500" />
                    {t(pay.translationKey, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.paymentType === "credito" && (
            <div className="space-y-2">
              <Label htmlFor="expenseInstallments" className="text-label">{t("expenses.installments", lang)}</Label>
              <Select id="expenseInstallments" value={String(formData.installments || 1)} onValueChange={(v) => setFormData(prev => ({ ...prev, installments: Number(v) }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("expenses.selectInstallments", lang)} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)} className="flex items-center gap-2">
                      {n}x {t("expenses.installmentsX", lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="expenseDescription" className="text-label">{t("expenses.description", lang)}</Label>
            <Textarea id="expenseDescription" placeholder={t("expenses.descriptionPlaceholder", lang)} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="whitespace-nowrap">{t("modal.cancel", lang)}</Button>
          <Button type="submit" form="expenseForm" disabled={!formData.title || !formData.category || !formData.amount || !formData.paymentType || (formData.paymentType === "credito" && !formData.installments)} className="bg-amber-500 text-amber-950 hover:bg-amber-400 whitespace-nowrap">{t("modal.save", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
