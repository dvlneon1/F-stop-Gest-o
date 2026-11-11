"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, Share2, Download } from "lucide-react";
import { t } from "@/lib/i18n";
import { Shoot } from "@/lib/constants";
import { generateId } from "@/lib/utils";

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  shoot: Shoot;
  lang: string;
  setShoots: React.Dispatch<React.SetStateAction<Shoot[]>>;
  showToast: (message: string, type?: "default" | "success" | "error") => void;
  tLang: (key: string) => string;
}

export function GalleryModal({ open, onClose, shoot, lang, setShoots, showToast, tLang }: GalleryModalProps) {
  const hasGallery = !!shoot.gallery;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-heading">{t("gallery.viewTitle", lang)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-label">{t("panel.gallery", lang)}</span>
            <span className={`text-data font-medium ${hasGallery ? "text-emerald-500" : "text-muted"}`}>
              {hasGallery ? t("status.ready", lang) : t("gallery.noImages", lang)}
            </span>
          </div>
          {hasGallery && (
            <div className="p-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-data font-mono">{shoot.gallery}</span>
                <span className="text-label text-xs">{t("gallery.images", lang)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-border/30 border border-border/60 flex items-center justify-center text-[10px] text-muted/50">
                    <Image className="w-4 h-4 opacity-50" />
                    {i}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  <Share2 className="w-4 h-4 mr-2" />{t("gallery.share", lang)}
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  <Download className="w-4 h-4 mr-2" />{t("gallery.download", lang)}
                </Button>
              </div>
            </div>
          )}
          {!hasGallery && (
            <div className="p-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md text-center">
              <p className="text-muted">{t("gallery.noImages", lang)}</p>
              <Button variant="ghost" size="sm" onClick={() => { onClose(); setShoots(prev => prev.map(s => s.id === shoot.id ? { ...s, gallery: `gal_${generateId().slice(-4)}` } : s)); showToast(tLang("toast.openingGallery"), "success"); }}>
                <Image className="w-4 h-4 mr-2" />{t("gallery.upload", lang)}
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
