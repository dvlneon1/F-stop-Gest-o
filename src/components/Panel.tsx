"use client";

import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Sun, User, MapPin, Edit, Trash2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { typeLabels, statusLabels, eventSubcategories, photographerPlatforms } from "@/lib/constants";
import { getInitials, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Shoot, Client } from "@/lib/constants";

interface PanelProps {
  shoot: Shoot | null;
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  lang: string;
}

function getStatusText(key: string, value: boolean, shoot: Shoot, lang: string): string {
  const pending = t("status.pending", lang);
  const paid = t("status.paid", lang);
  const signed = t("status.signed", lang);
  const ready = t("status.ready", lang);
  if (key === "contract") return value ? (shoot.contractSigned ? signed : pending) : pending;
  if (key === "questionnaire") return value ? ready : pending;
  if (key === "deposit") return value ? paid : pending;
  if (key === "balance") return value ? paid : pending;
  if (key === "gallery") return value ? ready : pending;
  return pending;
}

export function Panel({ shoot, client, isOpen, onClose, onAction, lang }: PanelProps) {
  if (!shoot || !isOpen) return null;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isTodayShoot = shoot.date === todayStr || shoot.status === "today";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 opacity-0 transition-opacity duration-300 panel__backdrop"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed z-[60] flex flex-col transition-transform duration-350 ease-out ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} ${isOpen ? "" : "pointer-events-none"} bottom-0 left-0 right-0 pb-24 max-h-[calc(100vh-3rem)] md:top-24 md:pb-0 md:left-1/2 md:-translate-x-1/2 md:max-h-[85vh] md:w-[calc(100vw-4rem)] md:max-w-4xl rounded-2xl border border-border/60 bg-popover/60 backdrop-blur-md shadow-2xl overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-label={t("shoot.details", lang)}
      >
        <div className="w-10 h-1 bg-border/60 mx-auto mt-6 mb-3 touch-none rounded-full" aria-hidden="true" />
        <div className="pt-4 p-4 md:p-6 flex flex-col gap-6 items-start w-full min-h-full">
          {/* Client header - photo above name, all aligned left */}
          <div className="flex flex-col items-start gap-2 w-full">
            <div className="flex items-center gap-3 w-full">
              <div className="w-16 h-16 bg-border/60 flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden">
                {client?.photoURL ? (
                  <img src={client.photoURL} alt={client.name} className="w-full h-full object-cover" />
                ) : client ? (
                  <span className="text-data text-muted text-xl">{getInitials(client.name)}</span>
                ) : (
                  <User className="w-8 h-8 text-muted" />
                )}
              </div>
              <div className="flex flex-col items-start gap-1 min-w-0">
                <p className="text-label">{t("form.client", lang)}</p>
                <h2 className="text-heading text-wrap-balance">{shoot.client}</h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-label capitalize">{typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}</span>
                  {shoot.subcategory && (
                    <>
                      <span className="text-label opacity-50">·</span>
                      <span className="text-label capitalize text-amber-500">{eventSubcategories[shoot.subcategory].label}</span>
                    </>
                  )}
                  {shoot.type === "event" && shoot.eventTitle && (
                    <>
                      <span className="text-label opacity-50">·</span>
                      <span className="text-label capitalize text-amber-500">{shoot.eventTitle}</span>
                    </>
                  )}
                  <span className="text-label opacity-50">·</span>
                  <span className="text-label">{format(parseISO(shoot.date), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</span>
                  <span className="text-label opacity-50">·</span>
                  <span className="text-label">{shoot.time}</span>
                </div>
              </div>
            </div>
            {isTodayShoot && (
              <div className="flex items-center gap-1 bg-amber-500/90 text-amber-950 px-2 py-1 text-data text-xs font-medium rounded-md mt-2">
                <Sun className="w-3 h-3" />
                {t("today.shoot", lang)}
              </div>
            )}
          </div>

          {/* Status & Progress - Glass rows with rounded separators */}
          <div className="space-y-0 w-full">
            {/* Contract */}
            <div className="flex items-center justify-between py-3 border-t border-border/60 first:border-t-0 w-full">
              <span className="text-label">{t("panel.contract", lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-data text-right">{getStatusText("contract", shoot.contract, shoot, lang)}</span>
                {shoot.contract ? shoot.contractSigned ? (
                  <Button variant="ghost" size="sm" onClick={() => onAction("viewContract")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.viewContract", lang)}</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAction("sendContract")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.sendContract", lang)}</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAction("sendContract")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.sendContract", lang)}</Button>
                )}
              </div>
            </div>

            {/* Questionnaire */}
            <div className="flex items-center justify-between py-3 border-t border-border/60 first:border-t-0 w-full">
              <span className="text-label">{t("panel.questionnaire", lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-data text-right">{getStatusText("questionnaire", shoot.questionnaire, shoot, lang)}</span>
                {shoot.questionnaire ? (
                  <Button variant="ghost" size="sm" onClick={() => onAction("viewQuestionnaire")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.viewQuestionnaire", lang)}</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAction("sendQuestionnaire")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.sendQuestionnaire", lang)}</Button>
                )}
              </div>
            </div>

            {/* Deposit */}
            <div className="flex items-center justify-between py-3 border-t border-border/60 first:border-t-0 w-full">
              <span className="text-label">{t("panel.deposit", lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-data text-right">{getStatusText("deposit", shoot.deposit, shoot, lang)}</span>
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-center justify-between py-3 border-t border-border/60 first:border-t-0 w-full">
              <span className="text-label">{t("panel.balance", lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-data text-right">{getStatusText("balance", shoot.balance, shoot, lang)}</span>
                {!shoot.balance && (
                  <Button variant="ghost" size="sm" onClick={() => onAction("markPaid")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.markPaid", lang)}</Button>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="flex items-center justify-between py-3 border-t border-border/60 first:border-t-0 w-full">
              <span className="text-label">{t("panel.gallery", lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-data text-right">{getStatusText("gallery", !!shoot.gallery, shoot, lang)}</span>
                {shoot.gallery ? (
                  <Button variant="ghost" size="sm" onClick={() => onAction("viewGallery")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.viewGallery", lang)}</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => onAction("uploadGallery")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.uploadGallery", lang)}</Button>
                )}
              </div>
            </div>
          </div>

          {/* Location & Notes */}
          <div className="space-y-3 pt-3 border-t border-border/60 w-full">
            <div>
              <p className="text-label">{t("form.location", lang)}</p>
              <p className="text-data mt-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-muted" />{shoot.location}</p>
            </div>
            {shoot.notes && (
              <div>
                <p className="text-label">{t("form.notes", lang)}</p>
                <p className="text-data mt-1 whitespace-pre-wrap">{shoot.notes}</p>
              </div>
            )}
            {shoot.type === "event" && shoot.platform && (
              <div>
                <p className="text-label">{t("form.platform", lang)}</p>
                <p className="text-data mt-1 flex items-center gap-2">
                  <DynamicIcon component={photographerPlatforms[shoot.platform].icon} className="w-4 h-4 text-amber-500" />
                  {photographerPlatforms[shoot.platform].label}
                </p>
              </div>
            )}
          </div>

          {/* Actions - Text-only buttons with hairline borders, no rounded */}
          <div className="flex flex-col gap-2 pt-4 border-t border-border/60 w-full">
            <Button onClick={() => onAction("editShoot")} variant="ghost" className="w-full justify-start gap-2 h-10 px-4 text-left text-data border border-border/60 hover:bg-muted/30 rounded-md"><Edit className="w-4 h-4" />{t("edit.shoot", lang)}</Button>
            <Button onClick={() => onAction("deleteShoot")} variant="ghost" className="w-full justify-start gap-2 h-10 px-4 text-left text-data border border-border/60 hover:bg-muted/30 rounded-md text-destructive"><Trash2 className="w-4 h-4" />{t("clients.delete", lang)}</Button>
          </div>
        </div>
      </aside>
    </>
  );
}
