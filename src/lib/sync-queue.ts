"use client"

/**
 * Offline Sync Queue for Lente CRM
 *
 * Quando o usuário está off-line, operações de gravação (create/update/delete)
 * são enfileiradas no localStorage e processadas automaticamente quando a
 * conexão é restabelecida. Cada usuário tem sua própria fila, isolada por UID.
 */

export type SyncOperationType = "create" | "update" | "delete";

export type SyncCollection = "shoots" | "clients" | "expenses" | "settings" | "profile" | "hideFinancial";

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  collection: SyncCollection;
  data: any;
  userId: string;
  timestamp: string;
}

const QUEUE_KEY_PREFIX = "lente_sync_queue_";

function getQueueKey(userId: string) {
  return `${QUEUE_KEY_PREFIX}${userId}`;
}

/** Retorna o número de operações pendentes na fila de um usuário. */
export function getPendingCount(userId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(getQueueKey(userId));
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue.length : 0;
  } catch {
    return 0;
  }
}

/** Enfileira uma operação para sincronização posterior. */
export function enqueueOperation(
  userId: string,
  operation: Omit<SyncOperation, "id" | "timestamp">
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(getQueueKey(userId));
    const queue: SyncOperation[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(queue)) return;

    const newOp: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    queue.push(newOp);
    localStorage.setItem(getQueueKey(userId), JSON.stringify(queue));
  } catch (e) {
    console.error("[sync-queue] Falha ao enfileirar operação:", e);
  }
}

/** Remove uma operação específica da fila (após sucesso na sincronização). */
export function removeOperation(userId: string, operationId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(getQueueKey(userId));
    if (!raw) return;
    const queue: SyncOperation[] = JSON.parse(raw);
    if (!Array.isArray(queue)) return;

    const filtered = queue.filter((op) => op.id !== operationId);
    if (filtered.length === 0) {
      localStorage.removeItem(getQueueKey(userId));
    } else {
      localStorage.setItem(getQueueKey(userId), JSON.stringify(filtered));
    }
  } catch (e) {
    console.error("[sync-queue] Falha ao remover operação:", e);
  }
}

/** Limpa toda a fila de um usuário. */
export function clearQueue(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getQueueKey(userId));
  } catch (e) {
    console.error("[sync-queue] Falha ao limpar fila:", e);
  }
}

/** Retorna todas as operações pendentes de um usuário. */
export function getQueue(userId: string): SyncOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getQueueKey(userId));
    if (!raw) return [];
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}
