"use client"

import { useState, useCallback } from "react"

// ===== STORAGE KEYS =====
export const SHOOTS_KEY = "lente_shoots_v1"
export const CLIENTS_KEY = "lente_clients_v1"
export const SETTINGS_KEY = "lente_settings_v1"
export const USER_PROFILE_KEY = "lente_user_profile_v1"
export const EXPENSES_KEY = "lente_expenses_v1"
export const HIDE_FINANCIAL_VALUES_KEY = "lente_hide_financial_v1"
export const GALLERIES_KEY = "lente_galleries_v1"
export const INVOICES_KEY = "lente_invoices_v1"
export const QUESTIONNAIRES_KEY = "lente_questionnaires_v1"
export const HAS_SEEN_ONBOARDING_KEY = "lente_has_seen_onboarding_v1"

// ===== HOOKS =====
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
