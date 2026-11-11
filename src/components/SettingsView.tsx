"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, Upload } from "lucide-react";
import { t } from "@/lib/i18n";
import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { exportShootsToSheets, exportClientsToSheets, importShootsFromSheets, importClientsFromSheets } from "@/lib/google-sheets";
import { backupData, readBackupFile, restoreDataToFirestore } from "@/lib/backup-restore";

interface SettingsViewProps {
  settings: { lang: string; theme: string; lastSync: string | null; sheetsApiKey: string; sheetsSpreadsheetId: string };
  setSettings: React.Dispatch<React.SetStateAction<{ lang: string; theme: string; lastSync: string | null; sheetsApiKey: string; sheetsSpreadsheetId: string }>>;
  shoots: any[];
  clients: any[];
  expenses: any[];
  userProfile: { name: string; email: string; phone: string; cpf: string; address: string };
  hideFinancialValues: boolean;
  userId: string;
  lang: string;
}

export function SettingsView({ settings, setSettings, shoots, clients, expenses, userProfile, hideFinancialValues, userId, lang }: SettingsViewProps) {
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handleClearAllSettings = () => {
    setClearAllOpen(false);
    window.location.reload();
  };

  const handleBackup = () => {
    backupData({
      shoots,
      clients,
      expenses,
      userProfile,
      settings,
      hideFinancialValues,
      userId,
    });
  };

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRestoreFile(file);
    if (!file) return;
    setRestoreOpen(true);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRestoreConfirm = async () => {
    if (!restoreFile) return;
    setRestoring(true);
    const data = await readBackupFile(restoreFile);
    if (!data) {
      alert(t("settings.invalidFile", lang));
      setRestoring(false);
      setRestoreFile(null);
      setRestoreOpen(false);
      return;
    }
    const result = await restoreDataToFirestore(userId, data);
    setRestoring(false);
    setRestoreFile(null);
    setRestoreOpen(false);
    if (result.success) {
      alert(t("settings.restoreSuccess", lang));
      window.location.reload();
    } else {
      alert(`${t("settings.restoreError", lang)}\n${result.error}`);
    }
  };

  return (
    <div className="page-padding space-y-6 max-w-3xl mx-auto">
      <h1 className="text-display">{t("menu.settings", lang)}</h1>

      <Card>
        <CardContent className="p-4 space-y-6">
          <div>
            <h2 className="text-heading mb-3 text-wrap-balance">{t("settings.language", lang)}</h2>
            <Select value={settings.lang} onValueChange={(v) => setSettings(prev => ({ ...prev, lang: v as string }))}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("settings.language", lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">{t("settings.pt", lang)}</SelectItem>
                <SelectItem value="en">{t("settings.en", lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h2 className="text-heading mb-3 text-wrap-balance">{t("settings.theme", lang)}</h2>
            <Select value={settings.theme} onValueChange={(v) => setSettings(prev => ({ ...prev, theme: v as string }))}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("settings.theme", lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("settings.light", lang)}</SelectItem>
                <SelectItem value="dark">{t("settings.dark", lang)}</SelectItem>
                <SelectItem value="system">{t("settings.system", lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h2 className="text-heading mb-3 text-wrap-balance">{t("settings.data", lang)}</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleBackup}>
                  <Download className="w-4 h-4 mr-2" />{t("settings.backup", lang)}
                </Button>
                <label className="flex items-center justify-center gap-2 px-3 py-2 border border-border/60 rounded-lg bg-card/90 hover:bg-card/80 cursor-pointer text-sm transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{t("settings.restore", lang)}</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestoreFileChange}
                  />
                </label>
                <Button variant="destructive" onClick={() => { setClearAllOpen(true); }}>
                  <Trash2 className="w-4 h-4 mr-2" />{t("settings.clear", lang)}
                </Button>
              </div>
              <p className="text-data text-xs text-muted">{t("settings.backupInfo", lang)}</p>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h2 className="text-heading mb-3 text-wrap-balance">{t("settings.sheets", lang)}</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="sheetsApiKey" className="text-label">{t("settings.sheetsApiKey", lang)}</Label>
                <Input id="sheetsApiKey" type="password" placeholder={t("settings.sheetsApiKeyPlaceholder", lang)} value={settings.sheetsApiKey} onChange={(e) => setSettings(prev => ({ ...prev, sheetsApiKey: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetsSpreadsheetId" className="text-label">{t("settings.sheetsSpreadsheetId", lang)}</Label>
                <Input id="sheetsSpreadsheetId" placeholder={t("settings.sheetsSpreadsheetIdPlaceholder", lang)} value={settings.sheetsSpreadsheetId} onChange={(e) => setSettings(prev => ({ ...prev, sheetsSpreadsheetId: e.target.value }))} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={async () => {
                  if (!settings.sheetsApiKey || !settings.sheetsSpreadsheetId) {
                    alert(t("settings.sheetsMissingConfig", lang));
                    return;
                  }
                  const shoots = JSON.parse(localStorage.getItem("lente_shoots_v1") || "[]");
                  const clients = JSON.parse(localStorage.getItem("lente_clients_v1") || "[]");
                  const [r1, r2] = await Promise.all([
                    exportShootsToSheets({ apiKey: settings.sheetsApiKey, spreadsheetId: settings.sheetsSpreadsheetId }, shoots),
                    exportClientsToSheets({ apiKey: settings.sheetsApiKey, spreadsheetId: settings.sheetsSpreadsheetId }, clients),
                  ]);
                  if (r1.success && r2.success) {
                    alert(t("settings.sheetsExported", lang));
                    setSettings(prev => ({ ...prev, lastSync: new Date().toISOString() }));
                  } else {
                    alert(`${t("settings.sheetsError", lang)}\n${r1.error ?? r2.error}`);
                  }
                }}>
                  <Upload className="w-4 h-4 mr-2" />{t("settings.sheetsExport", lang)}
                </Button>
                <Button variant="outline" onClick={async () => {
                  if (!settings.sheetsApiKey || !settings.sheetsSpreadsheetId) {
                    alert(t("settings.sheetsMissingConfig", lang));
                    return;
                  }
                  const [r1, r2] = await Promise.all([
                    importShootsFromSheets({ apiKey: settings.sheetsApiKey, spreadsheetId: settings.sheetsSpreadsheetId }),
                    importClientsFromSheets({ apiKey: settings.sheetsApiKey, spreadsheetId: settings.sheetsSpreadsheetId }),
                  ]);
                  if (r1.success && r2.success) {
                    alert(t("settings.sheetsImported", lang));
                    setSettings(prev => ({ ...prev, lastSync: new Date().toISOString() }));
                    window.location.reload();
                  } else {
                    alert(`${t("settings.sheetsError", lang)}\n${r1.error ?? r2.error}`);
                  }
                }}>
                  <Download className="w-4 h-4 mr-2" />{t("settings.sheetsImport", lang)}
                </Button>
              </div>
              <p className="text-data text-xs text-muted">{t("settings.sheetsInfo", lang)}</p>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6">
            <div className="text-body text-muted space-y-1">
              <p>{t("app.name", lang)} — {t("app.tagline", lang)}</p>
              <p>v1.0.0</p>
              <p className="text-data text-xs">Última sincronização: {settings.lastSync ? format(parseISO(settings.lastSync), "dd MMM yyyy HH:mm", { locale: lang === "pt" ? ptBR : enUS }) : t("never.synced", lang)}</p>
            </div>
          </div>
          <ConfirmationDialog
            open={clearAllOpen}
            onClose={() => setClearAllOpen(false)}
            title={t("confirm.title", lang)}
            description={t("settings.clearConfirm", lang)}
            confirmLabel={t("settings.clear", lang)}
            onConfirm={handleClearAllSettings}
            lang={lang}
          />
          <ConfirmationDialog
            open={restoreOpen}
            onClose={() => { setRestoreOpen(false); setRestoreFile(null); }}
            title={t("confirm.title", lang)}
            description={t("settings.restoreConfirm", lang)}
            confirmLabel={t("settings.restore", lang)}
            onConfirm={handleRestoreConfirm}
            lang={lang}
          />
        </CardContent>
      </Card>
    </div>
  );
}
