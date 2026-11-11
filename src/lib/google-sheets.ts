"use client"

/**
 * Google Sheets integration for Lente CRM
 * Exporta e importa dados (shoots, clients) para/do Google Sheets via API v4.
 * Configuração necessária: Google Sheets API Key + Spreadsheet ID.
 */

export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
}

export interface SheetRow {
  values: any[];
}

/**
 * Converte um array de dados em linhas para o Google Sheets
 */
function rowsToValues<T extends Record<string, unknown>>(data: T[], columns: (keyof T)[]): SheetRow[] {
  return data.map(item => ({
    values: columns.map(col => item[col] ?? ""),
  }));
}

/**
 * Monta o corpo da requisição para batch update no Google Sheets
 */
function buildBatchUpdateBody(rows: SheetRow[], startRow: number): Record<string, unknown> {
  return {
    valueInputOption: "USER_ENTERED",
    data: [
      {
        range: `A${startRow}`,
        majorDimension: "ROWS",
        values: rows.map(r => r.values),
      },
    ],
  };
}

/**
 * Exporta shoots para o Google Sheets (cria/atualiza a aba "Shoots")
 */
export async function exportShootsToSheets(
  config: GoogleSheetsConfig,
  shoots: Array<{
    id: string;
    client: string;
    date: string;
    time: string;
    type: string;
    location: string;
    notes: string;
    status: string;
    contract: boolean;
    contractSigned: boolean;
    questionnaire: boolean;
    deposit: boolean;
    balance: boolean;
    gallery: boolean;
    cover: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  const columns: (keyof typeof shoots[0])[] = [
    "id", "client", "date", "time", "type", "location", "notes",
    "status", "contract", "contractSigned", "questionnaire", "deposit",
    "balance", "gallery", "cover",
  ];

  const headerRow: SheetRow = { values: columns };
  const dataRows = rowsToValues(shoots, columns);

  try {
    // Cria ou limpa a aba "Shoots"
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Shoots!A1:Z1000:clear?key=${config.apiKey}`,
      { method: "POST" }
    );

    // Escreve o cabeçalho
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Shoots!A1:Z1?valueInputOption=USER_ENTERED&key=${config.apiKey}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [headerRow.values] }),
      }
    );

    // Escreve os dados
    if (dataRows.length > 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Shoots!A2:Z${dataRows.length + 1}?valueInputOption=USER_ENTERED&key=${config.apiKey}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: dataRows.map(r => r.values) }),
        }
      );
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}

/**
 * Exporta clients para o Google Sheets (aba "Clients")
 */
export async function exportClientsToSheets(
  config: GoogleSheetsConfig,
  clients: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    tags: string[];
    notes: string;
    totalShoots: number;
    totalSpent: number;
    lastContact: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  const columns: (keyof typeof clients[0])[] = [
    "id", "name", "email", "phone", "tags", "notes", "totalShoots", "totalSpent", "lastContact",
  ];

  const headerRow: SheetRow = { values: columns };
  const dataRows = rowsToValues(clients, columns).map(r => ({
    values: r.values.map(v => (Array.isArray(v) ? v.join(", ") : v)),
  }));

  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Clients!A1:Z1000:clear?key=${config.apiKey}`,
      { method: "POST" }
    );

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Clients!A1:Z1?valueInputOption=USER_ENTERED&key=${config.apiKey}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [headerRow.values] }),
      }
    );

    if (dataRows.length > 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Clients!A2:Z${dataRows.length + 1}?valueInputOption=USER_ENTERED&key=${config.apiKey}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: dataRows.map(r => r.values) }),
        }
      );
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}

/**
 * Importa shoots do Google Sheets
 */
export async function importShootsFromSheets(
  config: GoogleSheetsConfig
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Shoots!A:Z?key=${config.apiKey}`
    );
    if (!res.ok) throw new Error(`Falha na API: ${res.status}`);
    const json = await res.json();
    const rows = json.values || [];
    if (rows.length < 2) return { success: true, data: [] };

    const headers = rows[0] as string[];
    const data = rows.slice(1).map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
      return obj;
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}

/**
 * Importa clients do Google Sheets
 */
export async function importClientsFromSheets(
  config: GoogleSheetsConfig
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Clients!A:Z?key=${config.apiKey}`
    );
    if (!res.ok) throw new Error(`Falha na API: ${res.status}`);
    const json = await res.json();
    const rows = json.values || [];
    if (rows.length < 2) return { success: true, data: [] };

    const headers = rows[0] as string[];
    const data = rows.slice(1).map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
      return obj;
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}
