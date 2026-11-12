"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectScrollUpButton, SelectScrollDownButton } from "@/components/ui/select";
import { format } from "date-fns";
import { t } from "@/lib/i18n";
import { generateId } from "@/lib/utils";
import { Client, PREDEFINED_TAGS, getTagColor } from "@/lib/constants";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Client>) => Promise<boolean>;
  client?: Client | null;
  lang: string;
}

export function ClientModal({ open, onClose, onSubmit, client, lang }: ClientModalProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    tags: client?.tags || [] as string[],
    notes: client?.notes || "",
    photoURL: client?.photoURL || "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(client?.photoURL || null);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        tags: client.tags,
        notes: client.notes,
        photoURL: client.photoURL || "",
      });
      setPhotoPreview(client.photoURL || null);
    } else {
      setFormData({ name: "", email: "", phone: "", tags: [], notes: "", photoURL: "" });
      setPhotoPreview(null);
    }
  }, [client]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({ ...prev, photoURL: dataUrl }));
      setPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const validateClientForm = (data: { name: string; email: string; phone: string }) => {
    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!data.name || !data.name.trim()) errors.name = t("validation.required", lang);
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = t("validation.invalidEmail", lang);
    if (data.phone && !/^\+?[\d\s\-()]{7,}$/.test(data.phone)) errors.phone = t("validation.invalidPhone", lang);
    return errors;
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateClientForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const ok = await onSubmit({
      ...formData,
      id: client?.id || generateId(),
      tags: formData.tags,
      totalShoots: client?.totalShoots || 0,
      totalSpent: client?.totalSpent || 0,
      lastContact: format(new Date(), "yyyy-MM-dd"),
    });
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{client ? t("clients.edit", lang) : t("clients.new", lang)}</DialogTitle>
        </DialogHeader>
        <form id="clientForm" onSubmit={handleSubmit} className="space-y-4 py-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-label">{t("form.client", lang)}</Label>
            <Input id="name" placeholder={t("form.clientPlaceholder", lang)} value={formData.name} onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); if (formErrors.name) setFormErrors(prev => { const { name, ...rest } = prev; return rest; }); }} required />
            {formErrors.name && <span className="text-[0.7rem] text-destructive">{formErrors.name}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-label">{t("clients.photo", lang)}</Label>
            <div className="flex flex-col items-center gap-3">
              {photoPreview ? (
                <img src={photoPreview} alt="Client photo" className="w-20 h-20 rounded-full object-cover border border-border/60" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-border/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-data text-muted text-xl">{formData.name ? formData.name.charAt(0).toUpperCase() : "?"}</span>
                </div>
              )}
              <label htmlFor="photo" className="w-full max-w-xs">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-full transition-colors border-0"
                >
                  <span>{photoPreview ? t("clients.changePhoto", lang) : t("clients.uploadPhoto", lang)}</span>
                </button>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-label">{t("clients.email", lang)}</Label>
              <Input id="email" type="email" placeholder={t("clients.emailPlaceholder", lang)} value={formData.email} onChange={(e) => { setFormData(prev => ({ ...prev, email: e.target.value })); if (formErrors.email) setFormErrors(prev => { const { email, ...rest } = prev; return rest; }); }} />
              {formErrors.email && <span className="text-[0.7rem] text-destructive">{formErrors.email}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-label">{t("clients.phone", lang)}</Label>
              <Input id="phone" type="tel" placeholder={t("clients.phonePlaceholder", lang)} value={formData.phone} onChange={(e) => { setFormData(prev => ({ ...prev, phone: e.target.value })); if (formErrors.phone) setFormErrors(prev => { const { phone, ...rest } = prev; return rest; }); }} />
              {formErrors.phone && <span className="text-[0.7rem] text-destructive">{formErrors.phone}</span>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-label">{t("clients.tags", lang)}</Label>
            <Select
              multiple
              value={formData.tags}
              onValueChange={(tags: string[]) => setFormData(prev => ({ ...prev, tags }))}
            >
              <SelectTrigger className="w-full" id="tags">
                <SelectValue placeholder={t("clients.selectTags", lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectScrollUpButton>↑</SelectScrollUpButton>
                <SelectScrollDownButton>↓</SelectScrollDownButton>
                {PREDEFINED_TAGS.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                      <span>{tag}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-label">{t("form.notes", lang)}</Label>
            <Textarea id="notes" placeholder={t("form.notesPlaceholder", lang)} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="whitespace-nowrap">{t("modal.cancel", lang)}</Button>
          <Button type="submit" form="clientForm" disabled={!formData.name || Object.keys(formErrors).length > 0} className="whitespace-nowrap">{t("modal.save", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
