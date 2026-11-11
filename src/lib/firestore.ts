"use client"

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { generateId } from "@/lib/utils"
import type { Shoot, Client, Expense } from "@/lib/constants"

// ===== HELPERS =====

function requireDb() {
  if (!db) {
    throw new Error("Firestore not initialized: db is null. Make sure this code runs in the browser.")
  }
  return db
}

// Converte snapshot do Firestore para array, adicionando o id do documento
function snapToArray<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...snap.data() } as T
}

// Caminhos de subcoleção válidos (3 segmentos: ímpar = coleção)
// Ex: users/{uid}/shoots
function shootsColPath(userId: string) {
  return collection(requireDb(), "users", userId, "shoots")
}

function clientsColPath(userId: string) {
  return collection(requireDb(), "users", userId, "clients")
}

function expensesColPath(userId: string) {
  return collection(requireDb(), "users", userId, "expenses")
}

// Caminho de documento dentro da subcoleção (4 segmentos: par = documento)
// Ex: users/{uid}/shoots/{id}
function shootsDocPath(userId: string, id: string) {
  return doc(requireDb(), "users", userId, "shoots", id)
}

function clientsDocPath(userId: string, id: string) {
  return doc(requireDb(), "users", userId, "clients", id)
}

function expensesDocPath(userId: string, id: string) {
  return doc(requireDb(), "users", userId, "expenses", id)
}

// ===== USER PROFILE (documento por usuário) =====
// users/{uid} — 2 segmentos (par = documento) ✓

export interface UserProfileData {
  name: string
  email: string
  phone: string
  cpf: string
  address: string
  photoURL?: string
}

export function getUserProfileDocPath(userId: string) {
  return doc(requireDb(), "users", userId)
}

export async function saveUserProfile(userId: string, data: UserProfileData) {
  const userDoc = doc(requireDb(), "users", userId)
  await setDoc(userDoc, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const userDoc = doc(requireDb(), "users", userId)
  const snap = await getDoc(userDoc)
  if (!snap.exists()) return null
  return snap.data() as UserProfileData
}

export function subscribeUserProfile(
  userId: string,
  callback: (data: UserProfileData | null) => void
) {
  const userDoc = doc(requireDb(), "users", userId)
  return onSnapshot(userDoc, (snap) => {
    if (!snap.exists()) {
      callback(null)
    } else {
      callback(snap.data() as UserProfileData)
    }
  })
}

// ===== SETTINGS (documento por usuário) =====
// settings/{uid} — 2 segmentos (par = documento) ✓

export interface SettingsData {
  lang: string
  theme: string
  lastSync: string | null
  sheetsApiKey: string
  sheetsSpreadsheetId: string
}

export function getSettingsDocPath(userId: string) {
  return doc(requireDb(), "settings", userId)
}

export async function saveSettings(userId: string, data: SettingsData) {
  const settingsDoc = doc(requireDb(), "settings", userId)
  await setDoc(settingsDoc, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getSettings(userId: string): Promise<SettingsData | null> {
  const settingsDoc = doc(requireDb(), "settings", userId)
  const snap = await getDoc(settingsDoc)
  if (!snap.exists()) return null
  return snap.data() as SettingsData
}

export function subscribeSettings(
  userId: string,
  callback: (data: SettingsData | null) => void
) {
  const settingsDoc = doc(requireDb(), "settings", userId)
  return onSnapshot(settingsDoc, (snap) => {
    if (!snap.exists()) {
      callback(null)
    } else {
      callback(snap.data() as SettingsData)
    }
  })
}

// ===== SHOOTS (subcoleção por usuário) =====
// users/{uid}/shoots — 3 segmentos (ímpar = coleção) ✓
// users/{uid}/shoots/{id} — 4 segmentos (par = documento) ✓

export async function saveShoot(userId: string, shoot: Omit<Shoot, "id"> & { id?: string }) {
  const id = shoot.id || generateId()
  const shootDoc = shootsDocPath(userId, id)
  await setDoc(shootDoc, { ...shoot, id, updatedAt: serverTimestamp() }, { merge: true })
  return id
}

export async function deleteShoot(userId: string, id: string) {
  const shootDoc = shootsDocPath(userId, id)
  await deleteDoc(shootDoc)
}

export function subscribeShoots(
  userId: string,
  callback: (shoots: Shoot[]) => void
) {
  const shootsCol = shootsColPath(userId)
  const q = query(shootsCol)
  return onSnapshot(q, (snap) => {
    const shoots: Shoot[] = snap.docs.map(snapToArray<Shoot>)
    callback(shoots)
  })
}

// ===== CLIENTS (subcoleção por usuário) =====
// users/{uid}/clients — 3 segmentos (ímpar = coleção) ✓
// users/{uid}/clients/{id} — 4 segmentos (par = documento) ✓

export async function saveClient(userId: string, client: Omit<Client, "id"> & { id?: string }) {
  const id = client.id || generateId()
  const clientDoc = clientsDocPath(userId, id)
  await setDoc(clientDoc, { ...client, id, updatedAt: serverTimestamp() }, { merge: true })
  return id
}

export async function deleteClient(userId: string, id: string) {
  const clientDoc = clientsDocPath(userId, id)
  await deleteDoc(clientDoc)
}

export function subscribeClients(
  userId: string,
  callback: (clients: Client[]) => void
) {
  const clientsCol = clientsColPath(userId)
  const q = query(clientsCol)
  return onSnapshot(q, (snap) => {
    const clients: Client[] = snap.docs.map(snapToArray<Client>)
    callback(clients)
  })
}

// ===== EXPENSES (subcoleção por usuário) =====
// users/{uid}/expenses — 3 segmentos (ímpar = coleção) ✓
// users/{uid}/expenses/{id} — 4 segmentos (par = documento) ✓

export async function saveExpense(userId: string, expense: Omit<Expense, "id"> & { id?: string }) {
  const id = expense.id || generateId()
  const expenseDoc = expensesDocPath(userId, id)
  await setDoc(expenseDoc, { ...expense, id, updatedAt: serverTimestamp() }, { merge: true })
  return id
}

export async function deleteExpense(userId: string, id: string) {
  const expenseDoc = expensesDocPath(userId, id)
  await deleteDoc(expenseDoc)
}

export function subscribeExpenses(
  userId: string,
  callback: (expenses: Expense[]) => void
) {
  const expensesCol = expensesColPath(userId)
  const q = query(expensesCol)
  return onSnapshot(q, (snap) => {
    const expenses: Expense[] = snap.docs.map(snapToArray<Expense>)
    callback(expenses)
  })
}

// ===== HIDE FINANCIAL VALUES (documento por usuário) =====
// settings/{uid} — 2 segmentos (par = documento) ✓

export async function saveHideFinancialValues(userId: string, value: boolean) {
  const docRef = doc(requireDb(), "settings", userId)
  await setDoc(docRef, { hideFinancialValues: value, updatedAt: serverTimestamp() }, { merge: true })
}

export function subscribeHideFinancialValues(
  userId: string,
  callback: (value: boolean) => void
) {
  const docRef = doc(requireDb(), "settings", userId)
  return onSnapshot(docRef, (snap) => {
    if (!snap.exists()) {
      callback(false)
    } else {
      callback(!!snap.data().hideFinancialValues)
    }
  })
}

// ===== HAS_SEEN_ONBOARDING (mantido no localStorage — não é dado de usuário sensível) =====
// Mantido no localStorage por simplicidade e porque não é dado do backend
