"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; cpf: string; address: string; photoURL?: string }) => void;
  profile: { name: string; email: string; phone: string; cpf: string; address: string; photoURL?: string };
  lang: string;
}

export function ProfileEditModal({ open, onClose, onSubmit, profile, lang }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    cpf: profile.cpf,
    address: profile.address,
    photoURL: profile.photoURL || "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photoURL || null);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string; cpf?: string }>({});

  useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      cpf: profile.cpf,
      address: profile.address,
      photoURL: profile.photoURL || "",
    });
    setPhotoPreview(profile.photoURL || null);
  }, [profile]);

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

  const validateProfileForm = (data: { name: string; email: string; phone: string; cpf: string }) => {
    const errors: { name?: string; email?: string; phone?: string; cpf?: string } = {};
    if (!data.name || !data.name.trim()) errors.name = t("validation.required", lang);
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = t("validation.invalidEmail", lang);
    if (data.phone && !/^\+?[\d\s\-()]{7,}$/.test(data.phone)) errors.phone = t("validation.invalidPhone", lang);
    if (data.cpf && !/^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/.test(data.cpf)) errors.cpf = t("validation.invalidCpf", lang);
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfileForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    onSubmit(formData);
    onClose();
  };

  const tLang = (key: string) => t(key, lang);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading">{tLang("user.editProfile")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 mb-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-label">{tLang("user.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (formErrors.name) setFormErrors(prev => { const { name, ...rest } = prev; return rest; });
              }}
              required
            />
            {formErrors.name && <span className="text-[0.7rem] text-destructive">{formErrors.name}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="text-label">{tLang("user.photo")}</Label>
            <div className="flex flex-col items-center gap-3">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile photo" className="w-20 h-20 rounded-full object-cover border border-border/60" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-border/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-data text-muted text-xl">{formData.name ? formData.name.charAt(0).toUpperCase() : "?"}</span>
                </div>
              )}
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-amber-950 hover:file:bg-amber-400"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-label">{tLang("user.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (formErrors.email) setFormErrors(prev => { const { email, ...rest } = prev; return rest; });
                }}
              />
              {formErrors.email && <span className="text-[0.7rem] text-destructive">{formErrors.email}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-label">{tLang("user.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, phone: e.target.value }));
                  if (formErrors.phone) setFormErrors(prev => { const { phone, ...rest } = prev; return rest; });
                }}
              />
              {formErrors.phone && <span className="text-[0.7rem] text-destructive">{formErrors.phone}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-label">{tLang("user.cpf")}</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, cpf: e.target.value }));
                  if (formErrors.cpf) setFormErrors(prev => { const { cpf, ...rest } = prev; return rest; });
                }}
              />
              {formErrors.cpf && <span className="text-[0.7rem] text-destructive">{formErrors.cpf}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-label">{tLang("user.address")}</Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro, cidade"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {tLang("modal.cancel")}
          </Button>
          <Button type="submit" form="profileEditForm" disabled={!formData.name || Object.keys(formErrors).length > 0}>
            {tLang("modal.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
