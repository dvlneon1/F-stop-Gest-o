"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { t } from "@/lib/i18n";
import { Shoot } from "@/lib/constants";

interface QuestionnaireModalProps {
  open: boolean;
  onClose: () => void;
  shoot: Shoot;
  lang: string;
  setShoots: React.Dispatch<React.SetStateAction<Shoot[]>>;
  showToast: (message: string, type?: "default" | "success" | "error") => void;
  tLang: (key: string) => string;
}

export function QuestionnaireModal({ open, onClose, shoot, lang, setShoots, showToast, tLang }: QuestionnaireModalProps) {
  const hasQuestionnaire = !!shoot.questionnaire;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("questionnaire.viewTitle", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-label">{t("panel.questionnaire", lang)}</span>
            <span className={`text-data font-medium ${hasQuestionnaire ? "text-emerald-500" : "text-muted"}`}>
              {hasQuestionnaire ? t("status.sent", lang) : t("questionnaire.notSent", lang)}
            </span>
          </div>
          {hasQuestionnaire && (
            <div className="p-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-label mb-3">
                <FileText className="w-4 h-4" />
                <span>{t("questionnaire.title", lang)}</span>
              </div>
              <p className="text-body">{t("questionnaire.prefill", lang)}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  <Download className="w-4 h-4 mr-2" />{t("questionnaire.download", lang)}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>{t("questionnaire.save", lang)}</Button>
              </div>
            </div>
          )}
          {!hasQuestionnaire && (
            <div className="p-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md text-center">
              <p className="text-muted">{t("questionnaire.notSent", lang)}</p>
              <Button variant="ghost" size="sm" onClick={() => { onClose(); setShoots(prev => prev.map(s => s.id === shoot.id ? { ...s, questionnaire: true } : s)); showToast(tLang("toast.questionnaireSent"), "success"); }}>
                <FileText className="w-4 h-4 mr-2" />{t("panel.sendQuestionnaire", lang)}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">{t("modal.close", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
