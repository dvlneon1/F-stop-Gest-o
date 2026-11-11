"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Mail, CheckCircle2, Plus, Trash2, Edit2, Printer } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Shoot, InvoiceData, InvoiceStatus, InvoiceItem } from "@/lib/constants";
import jsPDF from "jspdf";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  shoot: Shoot;
  lang: string;
  setShoots: (value: Shoot[] | ((prev: Shoot[]) => Shoot[])) => void;
  showToast: (message: string, type?: "default" | "success" | "error") => void;
  tLang: (key: string) => string;
}

export function InvoiceModal({ open, onClose, shoot, lang, setShoots, showToast, tLang }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    const existing = shoot.invoiceData;
    if (existing) return existing;
    return {
      status: shoot.balance ? "paid" : shoot.deposit ? "partial" : "pending",
      items: [],
      dueDate: shoot.date,
      taxRate: 0,
    };
  });

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;
  const balance = total - (shoot.deposit ? total * 0.3 : 0); // depósito simplificado 30%
  const isPaid = invoice.status === "paid";

  const statusLabels = {
    pending: t("invoice.statusPending", lang) || "Pendente",
    partial: t("invoice.statusPartial", lang) || "Parcial",
    paid: t("invoice.statusPaid", lang) || "Paga",
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const saveInvoice = () => {
    setShoots(prev => prev.map(s => s.id === shoot.id ? { ...s, invoiceData: invoice } : s));
    showToast(t("invoice.saved", lang), "success");
    onClose();
  };

  const markPaid = () => {
    setInvoice(prev => ({ ...prev, status: "paid" as InvoiceStatus }));
    saveInvoice();
    showToast(t("invoice.markPaid", lang), "success");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(t("invoice.title", lang), 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t("form.client", lang)}: ${shoot.client}`, 20, y);
    doc.text(`${t("invoice.dueDate", lang)}: ${invoice.dueDate}`, pageWidth - 20 - doc.getTextWidth(`${t("invoice.dueDate", lang)}: ${invoice.dueDate}`), y);
    y += 10;
    doc.text(`${t("form.date", lang)}: ${shoot.date}`, 20, y);
    y += 20;

    // Table header
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(t("invoice.items", lang), 20, y);
    doc.text(t("invoice.subtotal", lang), pageWidth - 40, y);
    y += 8;

    invoice.items.forEach((item) => {
      doc.setTextColor(40, 40, 40);
      doc.text(item.description, 20, y);
      doc.text(formatCurrency(item.quantity * item.unitPrice), pageWidth - 40 - doc.getTextWidth(formatCurrency(item.quantity * item.unitPrice)), y);
      y += 8;
    });

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(t("invoice.subtotal", lang), 20, y);
    doc.text(formatCurrency(subtotal), pageWidth - 40 - doc.getTextWidth(formatCurrency(subtotal)), y);
    y += 8;

    if (invoice.taxRate > 0) {
      doc.text(t("invoice.tax", lang), 20, y);
      doc.text(formatCurrency(tax), pageWidth - 40 - doc.getTextWidth(formatCurrency(tax)), y);
      y += 8;
    }

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(13);
    doc.text(t("invoice.total", lang), 20, y);
    doc.text(formatCurrency(total), pageWidth - 40 - doc.getTextWidth(formatCurrency(total)), y);
    y += 15;

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(isPaid ? t("invoice.statusPaid", lang) : t("invoice.statusPending", lang), 20, y);

    doc.save(`fatura_${shoot.client.replace(/\s+/g, "_")}_${shoot.date}.pdf`);
  };

  const sendEmail = () => {
    showToast(`${t("invoice.send", lang)} - Em desenvolvimento`, "default");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-heading">{t("invoice.title", lang)}</DialogTitle>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
              isPaid ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" :
              invoice.status === "partial" ? "border-amber-500 text-amber-500 bg-amber-500/10" :
              "border-border/60 text-muted"
            }`}>
              {statusLabels[invoice.status]}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-label">
              <span className="text-muted">{t("form.client", lang)}:</span>
              <span className="text-foreground">{shoot.client}</span>
            </div>
            <div className="flex items-center gap-2 text-label text-right sm:text-left">
              <span className="text-muted">{t("invoice.dueDate", lang)}:</span>
              <Input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-32 h-8 text-xs border-transparent focus:border-transparent"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-label font-medium">{t("invoice.items", lang)}</span>
              <Button variant="outline" size="sm" onClick={addItem} className="h-8 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-center p-2 rounded-lg border border-border/60 bg-card/50">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    placeholder={t("invoice.items", lang)}
                    className="h-8 text-xs border-transparent focus:border-transparent bg-transparent"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value) || 0)}
                    placeholder="Qtd"
                    className="h-8 text-xs text-right border-transparent focus:border-transparent bg-transparent w-16"
                  />
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value) || 0)}
                    placeholder="R$"
                    className="h-8 text-xs text-right border-transparent focus:border-transparent bg-transparent w-24"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="p-1 h-8 w-8" aria-label="Remover item">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {invoice.items.length === 0 && (
                <p className="text-center text-muted text-sm py-4">{t("invoice.noItems", lang) || "Nenhum item ainda"}</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border/60 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-label">{t("invoice.subtotal", lang)}</span>
              <span className="text-data">{formatCurrency(subtotal)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-label">{t("invoice.tax", lang)}</span>
                <span className="text-data">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold border-t border-border/60 pt-2">
              <span className="text-heading">{t("invoice.total", lang)}</span>
              <span className="text-heading">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-label">{t("invoice.status", lang)}</span>
            <div className="flex gap-2">
              {["pending", "partial", "paid"].map((status) => (
                <Button
                  key={status}
                  variant={invoice.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInvoice(prev => ({ ...prev, status: status as InvoiceStatus }))}
                  className="h-8 px-3 text-xs"
                >
                  {statusLabels[status as keyof typeof statusLabels]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6 pt-6 border-t border-border/60">
          <div className="flex w-full justify-between">
            <Button type="button" variant="outline" onClick={sendEmail} className="flex-1">
              <Mail className="w-4 h-4 mr-2" />{t("invoice.send", lang)}
            </Button>
            <Button type="button" variant="outline" onClick={downloadPDF} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />{t("invoice.download", lang)}
            </Button>
          </div>
          <div className="flex w-full justify-end">
            {!isPaid ? (
              <Button variant="outline" size="sm" onClick={markPaid} className="w-auto">
                <CheckCircle2 className="w-4 h-4 mr-2" />{t("invoice.markPaid", lang)}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled className="w-auto text-muted">
                <CheckCircle2 className="w-4 h-4 mr-2" />{t("invoice.markPaid", lang)}
              </Button>
            )}
            <Button type="button" variant="default" onClick={saveInvoice} className="w-auto bg-amber-500 text-amber-950 hover:bg-amber-400">
              <FileText className="w-4 h-4 mr-2" />Salvar fatura
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
