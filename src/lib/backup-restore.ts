"use client"

/**
 * Backup/Restore para F-Stop Gestão CRM
 *
 * Exporta todos os dados do usuário (shoots, clients, expenses, profile,
 * settings, hideFinancialValues) para um arquivo JSON e permite restaurar
 * a partir desse arquivo, gravando tudo no Firestore.
 */

import type { Shoot, Client, Expense } from "@/lib/constants";
import type { UserProfileData, SettingsData } from "@/lib/firestore";
import {
  saveShoot, saveClient, saveExpense, saveUserProfile, saveSettings,
  saveHideFinancialValues,
} from "@/lib/firestore";

export interface BackupData {
  version: number;
  exportedAt: string;
  userId?: string;
  shoots: Shoot[];
  clients: Client[];
  expenses: Expense[];
  userProfile: UserProfileData;
  settings: SettingsData;
  hideFinancialValues: boolean;
}

const BACKUP_VERSION = 1;
const BACKUP_FILENAME = "lente-backup.json";

/**
 * Gera e dispara o download de um arquivo JSON com todos os dados.
 */
export function backupData(data: Omit<BackupData, "version" | "exportedAt">): void {
  const payload: BackupData = {
    ...data,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = BACKUP_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Lê e valida um arquivo de backup. Retorna os dados ou null se inválido.
 */
export async function readBackupFile(file: File): Promise<BackupData | null> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as BackupData;

    if (!data || data.version !== BACKUP_VERSION) {
      return null;
    }
    if (!Array.isArray(data.shoots) || !Array.isArray(data.clients) || !Array.isArray(data.expenses)) {
      return null;
    }
    if (!data.settings || !data.userProfile) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Restaura todos os dados do backup no Firestore do usuário informado.
 * Substitui os dados existentes (cria/atualiza cada documento).
 */
export async function restoreDataToFirestore(
  userId: string,
  data: BackupData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Restaura shoots
    for (const shoot of data.shoots) {
      await saveShoot(userId, { ...shoot, id: shoot.id });
    }
    // Restaura clients
    for (const client of data.clients) {
      await saveClient(userId, { ...client, id: client.id });
    }
    // Restaura expenses
    for (const expense of data.expenses) {
      await saveExpense(userId, { ...expense, id: expense.id });
    }
    // Restaura profile
    await saveUserProfile(userId, data.userProfile);
    // Restaura settings
    await saveSettings(userId, data.settings);
    // Restaura hideFinancialValues
    await saveHideFinancialValues(userId, data.hideFinancialValues);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido ao restaurar",
    };
  }
}
