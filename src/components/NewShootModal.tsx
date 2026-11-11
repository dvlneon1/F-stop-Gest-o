"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

export function NewShootModal({ open, onClose, onSubmit, clients, lang, editingShoot }: NewShootModalProps) {
  const [formData, setFormData] = useState<{
    client: string;
    date: string;
    time: string;
    type: ShootType;
    subcategory?: ShootSubcategory;
    eventTitle?: string;
    platform?: string;
    location: string;
    notes: string;
  }>({
    client: editingShoot?.client || "",
    date: "",
    time: editingShoot?.time || "14:00",
    type: (editingShoot?.type as ShootType) || "portrait",
    subcategory: editingShoot?.subcategory || undefined,
    eventTitle: editingShoot?.eventTitle || undefined,
    platform: editingShoot?.platform || undefined,
    location: editingShoot?.location || "",
    notes: editingShoot?.notes || "",
  });
  const [shootFormErrors, setShootFormErrors] = useState<{ client?: string; date?: string }>({});
  // Cores por tipo de shoot seguindo a identidade da marca
  const typeColorMap: Record<ShootType, string> = {
    wedding: "var(--accent-urgent)",   // #ff453a - amor/paixão
    portrait: "var(--accent-shoot-portrait)", // azul - clássico/elegância
    commercial: "var(--accent-shoot-commercial)", // índigo - profissional/corporativo
    family: "var(--accent-paid)",       // #32d74b - vida/família
    event: "var(--accent-shoot-event)",                   // roxo - celebração/evento
  };

  const typeColor = typeColorMap[formData.type] || "var(--accent-urgent)";

  useEffect(() => {
    if (editingShoot) {
      setFormData({
        client: editingShoot.client,
        date: editingShoot.date,
        time: editingShoot.time,
        type: editingShoot.type,
        subcategory: editingShoot.subcategory,
        eventTitle: editingShoot.eventTitle,
        platform: editingShoot.platform,
        location: editingShoot.location,
        notes: editingShoot.notes,
      });
    } else if (!formData.date) {
      setFormData(prev => ({ ...prev, date: format(new Date(), "yyyy-MM-dd") }));
    }
  }, [editingShoot]);

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

  const validateShootForm = (data: { client: string; date: string }) => {
    const errors: { client?: string; date?: string } = {};
    if (!data.client || !data.client.trim()) errors.client = t("validation.required", lang);
    if (!data.date) errors.date = t("validation.required", lang);
    return errors;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{editingShoot ? t("edit.shoot", lang) : t("modal.newShoot", lang)}</DialogTitle>
        </DialogHeader>
        <form id="formNewShoot" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-label">{t("form.client", lang)}</Label>
            <Select value={formData.client} onValueChange={(v) => { setFormData(prev => ({ ...prev, client: v || "" })); if (shootFormErrors.client) setShootFormErrors(prev => { const { client, ...rest } = prev; return rest; }); }}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectType", lang)} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shootFormErrors.client && <span className="text-[0.7rem] text-destructive">{shootFormErrors.client}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-label">{t("form.date", lang)}</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => { setFormData(prev => ({ ...prev, date: e.target.value })); if (shootFormErrors.date) setShootFormErrors(prev => { const { date, ...rest } = prev; return rest; }); }} required />
              {shootFormErrors.date && <span className="text-[0.7rem] text-destructive">{shootFormErrors.date}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-label">{t("form.time", lang)}</Label>
              <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-label">{t("form.type", lang)}</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as ShootType }))}>
              <SelectTrigger className="flex items-center gap-2">
                <SelectValue placeholder={t("form.selectType", lang)} />
                <span className="w-2 h-2 rounded-full" style={{ background: typeColor }} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wedding" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.wedding }} />{t("form.wedding", lang)}</SelectItem>
                <SelectItem value="portrait" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.portrait }} />{t("form.portrait", lang)}</SelectItem>
                <SelectItem value="commercial" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.commercial }} />{t("form.commercial", lang)}</SelectItem>
                <SelectItem value="family" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.family }} />{t("form.family", lang)}</SelectItem>
                <SelectItem value="event" className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: typeColorMap.event }} />{t("form.event", lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.type === "event" && (
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-label">{t("form.subcategory", lang)}</Label>
              <Select id="subcategory" value={formData.subcategory || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, subcategory: v as ShootSubcategory | undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectSubcategory", lang)} />
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
              <div className="space-y-2">
                <Label htmlFor="eventTitle" className="text-label">{t("form.eventTitle", lang)}</Label>
                <Input id="eventTitle" placeholder={t("form.eventTitlePlaceholder", lang)} value={formData.eventTitle || ""} onChange={(e) => setFormData(prev => ({ ...prev, eventTitle: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-label">{t("form.platform", lang)}</Label>
                <Select id="platform" value={formData.platform || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, platform: v || undefined }))}>
                  <SelectTrigger>
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
          <div className="space-y-2">
            <Label htmlFor="location" className="text-label">{t("form.location", lang)}</Label>
            <Input id="location" placeholder={t("form.location", lang)} value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-label">{t("form.notes", lang)}</Label>
            <Textarea id="notes" placeholder={t("form.notes", lang)} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="whitespace-nowrap">{t("modal.cancel", lang)}</Button>
          <Button type="submit" form="formNewShoot" disabled={!formData.client || !formData.date} className="bg-amber-500 text-amber-950 hover:bg-amber-400 whitespace-nowrap">{editingShoot ? t("modal.save", lang) : t("modal.create", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
