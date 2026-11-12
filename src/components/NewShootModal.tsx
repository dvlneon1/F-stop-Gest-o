"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { t } from "@/lib/i18n";
import { typeLabels, eventSubcategories, photographerPlatforms, Shoot, Client, ShootType, ShootSubcategory } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { DynamicIcon } from "@/components/DynamicIcon";

interface NewShootModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Shoot>) => Promise<boolean>;
  clients: Client[];
  lang: string;
  editingShoot?: Shoot | null;
  defaultMode?: "client" | "platform";
}

// Tipo para o toggle: "client" | "platform"
type ShootMode = "client" | "platform";

export function NewShootModal({ open, onClose, onSubmit, clients, lang, editingShoot, defaultMode = "client" }: NewShootModalProps) {
  const [mode, setMode] = useState<ShootMode>(defaultMode);

  const [formData, setFormData] = useState<{
    client: string;
    date: string;
    time: string;
    type: ShootType;
    subcategory?: ShootSubcategory;
    eventTitle?: string;
    platform?: string;
    platformJobId?: string;
    platformFee?: number;
    commissionRate?: number;
    estimatedSales?: number;
    uploadDeadline?: string;
    salesPeriodEnd?: string;
    platformStatus?: "assigned" | "shot" | "uploaded" | "selling" | "closed" | "paid";
    location: string;
    notes: string;
    deposit: boolean;
    depositAmount?: number;
    totalAmount?: number;
  }>({
    client: editingShoot?.client || "",
    date: "",
    time: editingShoot?.time || "14:00",
    type: (editingShoot?.type as ShootType) || "portrait",
    subcategory: editingShoot?.subcategory || undefined,
    eventTitle: editingShoot?.eventTitle || undefined,
    platform: editingShoot?.platform || undefined,
    platformJobId: editingShoot?.platformJobId || undefined,
    platformFee: editingShoot?.platformFee || undefined,
    commissionRate: editingShoot?.commissionRate || undefined,
    estimatedSales: editingShoot?.estimatedSales || undefined,
    uploadDeadline: editingShoot?.uploadDeadline || undefined,
    salesPeriodEnd: editingShoot?.salesPeriodEnd || undefined,
    platformStatus: editingShoot?.platformStatus || "assigned",
    location: editingShoot?.location || "",
    notes: editingShoot?.notes || "",
    deposit: editingShoot?.deposit || false,
    depositAmount: editingShoot?.deposit ? (editingShoot as any).depositAmount : undefined,
    totalAmount: editingShoot?.amount || undefined,
  });

  const [shootFormErrors, setShootFormErrors] = useState<{
    client?: string;
    date?: string;
    platform?: string;
    subcategory?: string;
    type?: string;
  }>({});

  const typeColorMap: Record<ShootType, string> = {
    wedding: "var(--accent-urgent)",
    portrait: "var(--accent-shoot-portrait)",
    commercial: "var(--accent-shoot-commercial)",
    family: "var(--accent-paid)",
    event: "var(--accent-shoot-event)",
    platform: "var(--accent-shoot-platform)",
  };

  const platformStatusLabels = {
    pt: { assigned: "Atribuído", shot: "Fotografado", uploaded: "Enviado", selling: "Em vendas", closed: "Fechado", paid: "Pago" },
    en: { assigned: "Assigned", shot: "Shot", uploaded: "Uploaded", selling: "Selling", closed: "Closed", paid: "Paid" },
  };

  const typeColor = typeColorMap[formData.type] || "var(--accent-urgent)";

  useEffect(() => {
    if (editingShoot) {
      const isPlatform = editingShoot.type === "platform";
      setMode(isPlatform ? "platform" : "client");
      setFormData({
        client: editingShoot.client,
        date: editingShoot.date,
        time: editingShoot.time,
        type: editingShoot.type,
        subcategory: editingShoot.subcategory,
        eventTitle: editingShoot.eventTitle,
        platform: editingShoot.platform,
        platformJobId: editingShoot.platformJobId,
        platformFee: editingShoot.platformFee,
        commissionRate: editingShoot.commissionRate,
        estimatedSales: editingShoot.estimatedSales,
        uploadDeadline: editingShoot.uploadDeadline,
        salesPeriodEnd: editingShoot.salesPeriodEnd,
        platformStatus: editingShoot.platformStatus || "assigned",
        location: editingShoot.location,
        notes: editingShoot.notes,
        deposit: editingShoot.deposit || false,
        depositAmount: editingShoot.deposit ? (editingShoot as any).depositAmount : undefined,
        totalAmount: editingShoot.amount || undefined,
      });
    } else if (!formData.date) {
      setFormData(prev => ({ ...prev, date: format(new Date(), "yyyy-MM-dd") }));
    }
  }, [editingShoot]);

  // Sync mode with defaultMode when opening for a new shoot (not editing)
  useEffect(() => {
    if (!editingShoot) {
      setMode(defaultMode);
    }
  }, [defaultMode, editingShoot]);

  // Auto-set client to platform name when platform type is selected and platform changes
  useEffect(() => {
    if (mode === "platform" && formData.platform) {
      const platformLabel = photographerPlatforms[formData.platform]?.label;
      if (platformLabel && formData.client !== platformLabel) {
        setFormData(prev => ({ ...prev, client: platformLabel, type: "platform" }));
      }
    }
  }, [mode, formData.platform]);

  // When mode changes, reset relevant fields
  useEffect(() => {
    if (mode === "platform") {
      setFormData(prev => ({
        ...prev,
        type: "platform",
        client: formData.platform ? photographerPlatforms[formData.platform]?.label || formData.platform : "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        type: prev.type === "platform" ? "portrait" : prev.type,
        platform: undefined,
        subcategory: undefined,
        platformJobId: undefined,
        platformFee: undefined,
        commissionRate: undefined,
        estimatedSales: undefined,
        uploadDeadline: undefined,
        salesPeriodEnd: undefined,
        platformStatus: "assigned",
      }));
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateShootForm(formData);
    if (Object.keys(errors).length > 0) {
      setShootFormErrors(errors);
      return;
    }
    setShootFormErrors({});
    const ok = await onSubmit({ ...formData, id: editingShoot?.id || generateId() });
    if (ok) onClose();
  };

  const validateShootForm = (data: typeof formData) => {
    const errors: { client?: string; date?: string; platform?: string; subcategory?: string; type?: string } = {};
    if (mode === "platform") {
      if (!data.platform) errors.platform = t("validation.required", lang);
      if (!data.subcategory) errors.subcategory = t("validation.required", lang);
    } else {
      if (!data.client || !data.client.trim()) errors.client = t("validation.required", lang);
      if (!data.type) errors.type = t("validation.required", lang);
    }
    if (!data.date) errors.date = t("validation.required", lang);
    return errors;
  };

  const platformStatusColors = {
    assigned: "#8e8e93",    // gray
    shot: "#007aff",        // blue
    uploaded: "#5856d6",    // purple
    selling: "#ff9f0a",     // orange
    closed: "#ff3b30",      // red
    paid: "#34c759",        // green
  };

  const isClientRequired = mode === "client";
  const canSubmit = formData.date && (isClientRequired ? formData.client && formData.type : formData.platform && formData.subcategory);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg top-[10vh] -translate-x-1/2 -translate-y-0 animate-in fade-in-0 slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-heading">{editingShoot ? t("edit.shoot", lang) : t("modal.newShoot", lang)}</DialogTitle>
        </DialogHeader>
        <form id="formNewShoot" onSubmit={handleSubmit} className="space-y-5 py-4">

          {/* Toggle Cliente / Plataforma */}
          <div className="space-y-2">
            <Label className="text-label">{t("form.mode", lang) || "Tipo de Trabalho"}</Label>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
              <div className="flex items-center gap-3">
                <span className={`text-label capitalize ${mode === "client" ? "font-medium text-amber-500" : "text-white/70"}`}>
                  {t("form.client", lang) || "Cliente"}
                </span>
              </div>
              <Switch
                variant="amber"
                checked={mode === "platform"}
                onCheckedChange={(checked) => setMode(checked ? "platform" : "client")}
                aria-label={t("form.mode", lang)}
              />
              <div className="flex items-center gap-3">
                <span className={`text-label capitalize ${mode === "platform" ? "font-medium text-amber-500" : "text-white/70"}`}>
                  {t("form.platformShort", lang) || "Plataforma"}
                </span>
              </div>
            </div>
          </div>

          {/* Cliente + Tipo (mesma linha) OU Plataforma + Subcategoria (mesma linha) */}
          {mode === "client" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-label">{t("form.client", lang)} *</Label>
                <Select value={formData.client} onValueChange={(v) => {
                  setFormData(prev => ({ ...prev, client: v || "" }));
                  if (shootFormErrors.client) setShootFormErrors(prev => { const { client, ...rest } = prev; return rest; });
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.selectClient", lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shootFormErrors.client && <span className="text-[0.7rem] text-destructive">{shootFormErrors.client}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-label">{t("form.type", lang)} *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as ShootType }))}>
                  <SelectTrigger className="w-full flex items-center gap-2">
                    <SelectValue placeholder={t("form.selectType", lang)} />
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: typeColor }} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.wedding }} />{t("form.wedding", lang)}</SelectItem>
                    <SelectItem value="portrait" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.portrait }} />{t("form.portrait", lang)}</SelectItem>
                    <SelectItem value="commercial" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.commercial }} />{t("form.commercial", lang)}</SelectItem>
                    <SelectItem value="family" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.family }} />{t("form.family", lang)}</SelectItem>
                    <SelectItem value="event" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.event }} />{t("form.event", lang)}</SelectItem>
                    <SelectItem value="platform" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.platform }} />{t("form.platform", lang)}</SelectItem>
                  </SelectContent>
                </Select>
                {shootFormErrors.type && <span className="text-[0.7rem] text-destructive">{shootFormErrors.type}</span>}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-label">{t("form.platformShort", lang) || "Plataforma"} *</Label>
                <Select id="platform" value={formData.platform || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, platform: v || undefined }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.selectPlatform", lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(photographerPlatforms).map(([key, plat]) => (
                      <SelectItem key={key} value={key} className="flex items-center gap-2">
                        <DynamicIcon component={plat.icon} className="w-3 h-3 text-amber-500" />
                        {plat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shootFormErrors.platform && <span className="text-[0.7rem] text-destructive">{shootFormErrors.platform}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-label">{t("form.category", lang) || "Categoria"} *</Label>
                <Select id="subcategory" value={formData.subcategory || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, subcategory: v as ShootSubcategory | undefined }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.selectCategory", lang) || "Selecione a categoria"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventSubcategories).map(([key, sub]) => (
                      <SelectItem key={key} value={key} className="flex items-center gap-2">
                        <DynamicIcon component={sub.icon} className="w-3 h-3 text-amber-500" />
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shootFormErrors.subcategory && <span className="text-[0.7rem] text-destructive">{shootFormErrors.subcategory}</span>}
              </div>
            </div>
          )}

          {/* Data + Horário (mesma linha) + Local (abaixo) */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-label">{t("form.date", lang)} *</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value }));
                  if (shootFormErrors.date) setShootFormErrors(prev => { const { date, ...rest } = prev; return rest; });
                }} required />
                {shootFormErrors.date && <span className="text-[0.7rem] text-destructive">{shootFormErrors.date}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-label">{t("form.time", lang)}</Label>
                <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-label">{t("form.location", lang)}</Label>
              <Input id="location" placeholder={t("form.location", lang)} value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} />
            </div>
          </div>

          {/* Sinal (toggle) + Valor do sinal + Valor total - APENAS MODO CLIENTE */}
          {mode === "client" && (
            <div className="space-y-3 p-3 rounded-lg border border-border/60 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className={`text-label mb-0 ${formData.deposit ? "text-amber-500" : "text-white/70"}`}>
                  {t("form.deposit", lang) || "Sinal"}
                </span>
                <Switch
                  variant="amber"
                  checked={formData.deposit}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, deposit: checked }))}
                  aria-label={t("form.deposit", lang)}
                />
              </div>
              {formData.deposit && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount" className="text-label">{t("form.depositAmount", lang) || "Valor do Sinal (R$)"}</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.depositAmount || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: Number(e.target.value) || undefined }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount" className="text-label">{t("form.totalAmount", lang) || "Valor Total (R$)"}</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.totalAmount || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) || undefined }))}
                    />
                  </div>
                </div>
              )}
              {!formData.deposit && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="totalAmount" className="text-label">{t("form.totalAmount", lang) || "Valor Total (R$)"}</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmount || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) || undefined }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* Campos extras para Plataforma */}
          {mode === "platform" && (
            <div className="space-y-3 p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
              <h4 className="text-label font-medium text-cyan-700 dark:text-cyan-300">{t("form.eventDetails", lang) || "Detalhes do Evento"}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="platformJobId" className="text-label">{t("form.eventId", lang)}</Label>
                  <Input id="platformJobId" placeholder="Ex: EVT-2026-001234" value={formData.platformJobId || ""} onChange={(e) => setFormData(prev => ({ ...prev, platformJobId: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformStatus" className="text-label">{t("form.platformStatus", lang)}</Label>
                  <Select id="platformStatus" value={formData.platformStatus || "assigned"} onValueChange={(v) => setFormData(prev => ({ ...prev, platformStatus: v as "assigned" | "shot" | "uploaded" | "selling" | "closed" | "paid" }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("form.selectStatus", lang)} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(platformStatusLabels[lang as keyof typeof platformStatusLabels]).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platformStatusColors[key as keyof typeof platformStatusColors] }} />
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="estimatedSales" className="text-label">{t("form.estimatedSales", lang)} (R$)</Label>
                  <Input id="estimatedSales" type="number" step="0.01" min="0" value={formData.estimatedSales || ""} onChange={(e) => setFormData(prev => ({ ...prev, estimatedSales: Number(e.target.value) || undefined }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploadDeadline" className="text-label">{t("form.uploadDeadline", lang)}</Label>
                  <Input id="uploadDeadline" type="date" value={formData.uploadDeadline || ""} onChange={(e) => setFormData(prev => ({ ...prev, uploadDeadline: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesPeriodEnd" className="text-label">{t("form.salesPeriodEnd", lang)}</Label>
                <Input id="salesPeriodEnd" type="date" value={formData.salesPeriodEnd || ""} onChange={(e) => setFormData(prev => ({ ...prev, salesPeriodEnd: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Campos extras para Evento */}
          {mode === "client" && formData.type === "event" && (
            <div className="space-y-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <h4 className="text-label font-medium text-amber-700 dark:text-amber-300">{t("form.eventDetails", lang) || "Detalhes do Evento"}</h4>
              <div className="space-y-2">
                <Label htmlFor="eventTitle" className="text-label">{t("form.eventTitle", lang)}</Label>
                <Input id="eventTitle" placeholder={t("form.eventTitlePlaceholder", lang)} value={formData.eventTitle || ""} onChange={(e) => setFormData(prev => ({ ...prev, eventTitle: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-label">{t("form.platform", lang)}</Label>
                <Select id="platform" value={formData.platform || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, platform: v || undefined }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.selectPlatform", lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(photographerPlatforms).map(([key, plat]) => (
                      <SelectItem key={key} value={key} className="flex items-center gap-2">
                        <DynamicIcon component={plat.icon} className="w-3 h-3 text-amber-500" />
                        {plat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Valor Total - apenas modo plataforma, habilitado após preencher fim do período de vendas */}
          {mode === "platform" && (
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-label">{t("form.totalAmount", lang) || "Valor Total (R$)"}</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.totalAmount || ""}
                disabled={!formData.salesPeriodEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) || undefined }))}
              />
              {!formData.salesPeriodEnd && <span className="text-[0.7rem] text-muted-foreground">{t("form.totalAmountHint", lang) || "Preencha o fim do período de vendas para habilitar"}</span>}
            </div>
          )}

          {/* Notas / Descrição */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-label">{t("form.notes", lang)}</Label>
            <Textarea id="notes" placeholder={t("form.notes", lang)} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="whitespace-nowrap">{t("modal.cancel", lang)}</Button>
          <Button type="submit" form="formNewShoot" disabled={!canSubmit} className="bg-amber-500 text-amber-950 hover:bg-amber-400 whitespace-nowrap">{editingShoot ? t("modal.save", lang) : t("modal.create", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}