"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { t } from "@/lib/i18n";
import { Shoot } from "@/lib/constants";

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  shoot: Shoot;
  lang: string;
  setShoots: (value: Shoot[] | ((prev: Shoot[]) => Shoot[])) => Promise<boolean>;
  showToast: (message: string, type?: "default" | "success" | "error") => void;
  tLang: (key: string) => string;
}

export function ContractModal({ open, onClose, shoot, lang, setShoots, showToast, tLang }: ContractModalProps) {
  const contractData = shoot.contractData;
  const hasContract = !!shoot.contract;
  const isSigned = !!shoot.contractSigned;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("contract.viewTitle", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-label">{t("panel.contract", lang)}</span>
            <span className={`text-data font-medium ${isSigned ? "text-emerald-500" : hasContract ? "text-amber-500" : "text-muted"}`}>
              {isSigned ? t("status.signed", lang) : hasContract ? t("status.sent", lang) : t("contract.notSent", lang)}
            </span>
          </div>
          {hasContract && contractData && (
            <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-label">
                <FileText className="w-4 h-4" />
                <span>{t("contract.signTitle", lang)}</span>
              </div>
              {isSigned ? (
                <div className="space-y-2">
                  <p className="text-body">{t("contract.signedStatus", lang).replace("{name}", contractData.signedBy ?? shoot.client).replace("{date}", contractData.signedAt ?? "")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-body">{t("contract.sentStatus", lang).replace("{date}", contractData.signedAt ?? "")}</p>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    <Download className="w-4 h-4 mr-2" />{t("contract.download", lang)}
                  </Button>
                </div>
              )}
            </div>
          )}
          {!hasContract && (
            <div className="p-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md text-center">
              <p className="text-muted">{t("contract.notSent", lang)}</p>
              <Button variant="ghost" size="sm" onClick={async () => { onClose(); const ok = await setShoots(prev => prev.map(s => s.id === shoot.id ? { ...s, contract: true } : s)); if (ok) showToast(tLang("toast.contractSent"), "success"); }} className="whitespace-nowrap">
                <FileText className="w-4 h-4 mr-2" />{t("panel.sendContract", lang)}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full whitespace-nowrap">{t("modal.close", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
