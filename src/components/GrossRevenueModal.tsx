"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Download } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Client, Shoot } from "@/lib/constants";

interface GrossRevenueModalProps {
  open: boolean;
  onClose: () => void;
  lang: string;
  clients: Client[];
  shoots: Shoot[];
  hideFinancialValues: boolean;
  onClientShootClick?: (shoot: Shoot) => void;
}

export function GrossRevenueModal({ open, onClose, lang, clients, shoots, hideFinancialValues, onClientShootClick }: GrossRevenueModalProps) {
  // Unified financial truth: per-client totals derived from shoots, not client.totalSpent
  const clientShootMap: Record<string, { spent: number; count: number }> = {};
  shoots.forEach(s => {
    if (s.status === "paid" || s.status === "delivered") {
      if (!clientShootMap[s.client]) clientShootMap[s.client] = { spent: 0, count: 0 };
      clientShootMap[s.client].spent += s.amount || 0;
      clientShootMap[s.client].count += 1;
    }
  });
  const payingClients = [...clients]
    .filter(c => (clientShootMap[c.name]?.spent || 0) > 0)
    .sort((a, b) => (clientShootMap[b.name]?.spent || 0) - (clientShootMap[a.name]?.spent || 0));
  const clientLastShoot: Record<string, string> = {};
  const clientLastShootObj: Record<string, Shoot | null> = {};
  shoots.forEach(s => {
    const prev = clientLastShoot[s.client];
    if (!prev || s.date > prev) {
      clientLastShoot[s.client] = s.date;
      clientLastShootObj[s.client] = s;
    } else if (prev === s.date && !clientLastShootObj[s.client]) {
      clientLastShootObj[s.client] = s;
    }
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("user.grossRevenue", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-amber-500" />
            <p className="text-label">{t("user.grossRevenueSubtitle", lang)}</p>
          </div>
          <p className="text-display text-center">{hideFinancialValues ? "***" : formatCurrency(clients.reduce((sum, c) => sum + (clientShootMap[c.name]?.spent || 0), 0), lang)}</p>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-3 max-h-[300px] overflow-y-auto">
            {payingClients.length === 0 ? (
              <p className="text-muted text-center py-8">{t("clients.noShoots", lang)}</p>
            ) : (
              payingClients.map((client) => {
                const stats = clientShootMap[client.name] || { spent: 0, count: 0 };
                const lastDate = clientLastShoot[client.name] || client.lastContact;
                const lastShoot = clientLastShootObj[client.name];
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border-b border-border/60 last:border-b-0 cursor-pointer hover:bg-card/100 transition-colors rounded-lg"
                    onClick={() => { onClose(); if (lastShoot && onClientShootClick) onClientShootClick(lastShoot); }}
                  >
                    <div>
                      <p className="text-body">{client.name}</p>
                      <div className="flex items-center gap-1 text-label mt-1">
                        <span className="text-muted">{lastDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-heading">{hideFinancialValues ? "***" : formatCurrency(stats.spent, lang)}</p>
                      <p className="text-label">{stats.count} {t("clients.shoots", lang)}</p>
                    </div>
                  </div>
                );
              })
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
