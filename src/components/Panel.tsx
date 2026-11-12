"use client";

import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Sun, User, MapPin, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { t } from "@/lib/i18n";
import { typeLabels, eventSubcategories, photographerPlatforms, platformStatusLabels } from "@/lib/constants";import { getInitials } from "@/lib/utils";
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

function invoiceDataStatus(status: string, lang: string): string {
  const labels: Record<string, string> = {
    pending: t("invoice.statusPending", lang),
    partial: t("invoice.statusPartial", lang),
    paid: t("invoice.statusPaid", lang),
  };
  return labels[status] ?? labels.pending;
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
        className={`fixed z-[60] flex flex-col transition-transform duration-350 ease-out ${isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} ${isOpen ? "" : "pointer-events-none"} bottom-0 left-0 right-0 pb-24 max-h-screen rounded-2xl border border-border/60 bg-popover/60 backdrop-blur-md shadow-2xl overflow-y-auto`}
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
                {shoot.type === "platform" && shoot.platform && (
                  <DynamicIcon component={photographerPlatforms[shoot.platform].icon} className="w-8 h-8 text-amber-500" />
                )}
                {shoot.type !== "platform" && (
                  <>
                    {client?.photoURL ? (
                      <img src={client.photoURL} alt={client.name} className="w-full h-full object-cover" />
                    ) : client ? (
                      <span className="text-data text-muted text-xl">{getInitials(client.name)}</span>
                    ) : (
                      <User className="w-8 h-8 text-muted" />
                    )}
                  </>
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
                  {shoot.type === "platform" && shoot.platformJobId && (
                    <>
                      <span className="text-label opacity-50">·</span>
                      <span className="text-label text-cyan-500 font-mono text-xs">#{shoot.platformJobId}</span>
                    </>
                  )}
                  <span className="text-label opacity-50">·</span>
                  <span className="text-label flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500" />{format(parseISO(shoot.date), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</span>
                  <span className="text-label opacity-50">·</span>
                  <span className="text-label flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{shoot.time}</span>
                </div>
                {shoot.type === "platform" && shoot.platformStatus && (
                  <div className="flex items-center gap-1 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2 py-1 text-data text-xs font-medium rounded-md mt-2">
                    <span className="text-label">{t("form.platformStatus", lang)}:</span>
                    <span className="capitalize">{platformStatusLabels[lang as keyof typeof platformStatusLabels]?.[shoot.platformStatus] || shoot.platformStatus}</span>
                  </div>
                )}
              {shoot.type === "platform" && shoot.subcategory && (
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1 text-data text-xs font-medium rounded-md mt-2">
                    <span className="text-label">{t("form.subcategory", lang)}:</span>
                    <span className="capitalize">{eventSubcategories[shoot.subcategory].label}</span>
                  </div>
                )}
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

            {/* Invoice */}
            <div className="flex items-center justify-between py-3 border-t border-border/60 first:border-t-0 w-full">
              <span className="text-label">{t("panel.invoice", lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-data text-right">{shoot.invoiceData ? invoiceDataStatus(shoot.invoiceData.status, lang) : t("status.pending", lang)}</span>
                <Button variant="ghost" size="sm" onClick={() => onAction("viewInvoice")} className="h-8 px-2 text-data border border-border/60 hover:bg-muted/30 rounded-md">{t("panel.viewInvoice", lang)}</Button>
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

          {/* Platform-specific financial info */}
          {shoot.type === "platform" && (
            <div className="space-y-3 pt-3 border-t border-border/60 w-full bg-cyan-500/5 rounded-lg p-3">
              <h3 className="text-label font-medium text-cyan-700 dark:text-cyan-300">{t("panel.platformFinancials", lang)}</h3>
              {shoot.platformStatus && (
                <div className="flex items-center gap-1 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2 py-1 text-data text-xs font-medium rounded-md">
                  <span className="text-label">{t("form.platformStatus", lang)}:</span>
                  <span className="capitalize">{platformStatusLabels[lang as keyof typeof platformStatusLabels]?.[shoot.platformStatus] || shoot.platformStatus}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-label opacity-70">{t("form.platformFee", lang)}</p>
                  <p className="text-data font-medium">{shoot.platformFee ? `R$ ${Number(shoot.platformFee).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}</p>
                </div>
                <div>
                  <p className="text-label opacity-70">{t("form.commissionRate", lang)}</p>
                  <p className="text-data font-medium">{shoot.commissionRate ? `${shoot.commissionRate}%` : "-"}</p>
                </div>
                <div>
                  <p className="text-label opacity-70">{t("form.estimatedSales", lang)}</p>
                  <p className="text-data font-medium">{shoot.estimatedSales ? `R$ ${Number(shoot.estimatedSales).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}</p>
                </div>
                <div>
                  <p className="text-label opacity-70">{t("form.actualSales", lang)}</p>
                  <p className="text-data font-medium">{shoot.actualSales ? `R$ ${Number(shoot.actualSales).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}</p>
                </div>
                <div>
                  <p className="text-label opacity-70">{t("form.uploadDeadline", lang)}</p>
                  <p className="text-data font-medium flex items-center gap-1">{shoot.uploadDeadline ? <><Calendar className="w-3 h-3 text-amber-500" />{format(parseISO(shoot.uploadDeadline), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</> : "-"}</p>
                </div>
                <div>
                  <p className="text-label opacity-70">{t("form.salesPeriodEnd", lang)}</p>
                  <p className="text-data font-medium flex items-center gap-1">{shoot.salesPeriodEnd ? <><Calendar className="w-3 h-3 text-amber-500" />{format(parseISO(shoot.salesPeriodEnd), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</> : "-"}</p>
                </div>
              </div>
              {shoot.platformFee && shoot.commissionRate && (shoot.actualSales || shoot.estimatedSales) && (
                <div className="pt-2 border-t border-cyan-500/30">
                  <p className="text-label font-medium">{t("panel.projectedRevenue", lang)}</p>
                  <p className="text-data text-lg font-semibold text-cyan-700 dark:text-cyan-300">
                    R$ {(shoot.platformFee + ((shoot.actualSales || shoot.estimatedSales || 0) * (shoot.commissionRate || 0) / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          )}

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