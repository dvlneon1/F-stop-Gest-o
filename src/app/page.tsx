"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginAuth from "@/components/LoginAuth";
import { Toaster } from "@/components/ui/toast";

// Extracted components
import { ShootCard } from "@/components/ShootCard";
import { Panel } from "@/components/Panel";
import { TabBar } from "@/components/TabBar";
import { EmptyState } from "@/components/EmptyState";
import { NewShootModal } from "@/components/NewShootModal";
import { ClientModal } from "@/components/ClientModal";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { ContractModal } from "@/components/ContractModal";
import { QuestionnaireModal } from "@/components/QuestionnaireModal";
import { GalleryModal } from "@/components/GalleryModal";
import { InvoiceModal } from "@/components/InvoiceModal";
import { ToastComponent } from "@/components/ToastComponent";
import { CalendarView } from "@/components/CalendarView";
import { InsightsView } from "@/components/InsightsView";
import { UserView } from "@/components/UserView";
import { SettingsView } from "@/components/SettingsView";
import { ClientsView } from "@/components/ClientsView";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { WelcomeTour } from "@/components/WelcomeTour";
import { GrossRevenueModal } from "@/components/GrossRevenueModal";
import { NetRevenueModal } from "@/components/NetRevenueModal";
import { ExpensesModal } from "@/components/ExpensesModal";
import { ExpenseHistoryModal } from "@/components/ExpenseHistoryModal";

import {
  User,
  Settings,
  DollarSign,
  Eye,
  LogOut,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Camera,
  RefreshCw,
  MapPin,
} from "lucide-react";

import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

import {
  Shoot, Client, Expense, ShootStatus,
  typeLabels,
} from "@/lib/constants";
import {
  HIDE_FINANCIAL_VALUES_KEY,
  HAS_SEEN_ONBOARDING_KEY,
} from "@/lib/storage";
import {
  saveUserProfile, getUserProfile, subscribeUserProfile,
  saveSettings, getSettings, subscribeSettings,
  saveShoot, deleteShoot, subscribeShoots,
  saveClient, deleteClient, subscribeClients,
  saveExpense, deleteExpense, subscribeExpenses,
  saveHideFinancialValues, subscribeHideFinancialValues,
  UserProfileData, SettingsData,
} from "@/lib/firestore";
import {
  enqueueOperation, getPendingCount, getQueue, removeOperation, clearQueue,
  type SyncOperation,
} from "@/lib/sync-queue";
import { getStatusColor, generateId } from "@/lib/utils";
import { t } from "@/lib/i18n";

// ===== COMPONENTS =====

export default function LenteApp() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  );
}

function AppContent() {
  // Local state (synchronized with Firestore)
  const [shoots, setShootsLocal] = useState<Shoot[]>([]);
  const [clients, setClientsLocal] = useState<Client[]>([]);
  const [settings, setSettingsLocal] = useState<SettingsData>({
    lang: "pt", theme: "system", lastSync: null, sheetsApiKey: "", sheetsSpreadsheetId: "",
  });
  const [userProfile, setUserProfileLocal] = useState<UserProfileData>({
    name: "", email: "", phone: "", cpf: "", address: "",
  });
  const [hideFinancialValues, setHideFinancialValuesLocal] = useState(false);
  const [expenses, setExpensesLocal] = useState<Expense[]>([]);

  // UI state
  const [financialModal, setFinancialModal] = useState<null | "gross" | "net" | "expenses">(null);
  const [newExpenseOpen, setNewExpenseOpen] = useState(false);
  const [expenseHistoryOpen, setExpenseHistoryOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("today");
  const [panelShoot, setPanelShoot] = useState<Shoot | null>(null);
  const [panelClient, setPanelClient] = useState<Client | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [newShootOpen, setNewShootOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState<Shoot | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"online" | "offline" | "syncing">("offline");
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "default" | "success" | "error" }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [todayStr, setTodayStr] = useState<string>("");
  const [todayDateStr, setTodayDateStr] = useState<string>("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarDayShoots, setCalendarDayShoots] = useState<Shoot[]>([]);
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ type: "shoot" | "client"; id: string } | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [welcomeTourOpen, setWelcomeTourOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firestoreReady, setFirestoreReady] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" && navigator.onLine);

  const lang = settings.lang;
  const tLang = useCallback((key: string) => t(key, lang), [lang]);

  const showToast = useCallback((message: string, type: "default" | "success" | "error" = "default") => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Check if user has seen onboarding (localStorage only — not sensitive user data)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(HAS_SEEN_ONBOARDING_KEY) === "true";
    setHasSeenOnboarding(seen);
  }, []);

  // Initialize today's date strings on client side
  useEffect(() => {
    const now = new Date();
    setTodayStr(format(now, "yyyy-MM-dd"));
    setTodayDateStr(format(now, "dd/MM/yyyy", { locale: lang === "pt" ? ptBR : enUS }));
  }, [lang]);

  // Mobile detection with resize listener
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Firebase Auth + Firestore sync
  const { user: authFirebaseUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const justAuthenticated = !!authFirebaseUser;
    setIsAuthenticated(justAuthenticated);

    if (!justAuthenticated) {
      // User logged out — clear local state
      setShootsLocal([]);
      setClientsLocal([]);
      setExpensesLocal([]);
      setSettingsLocal({ lang: "pt", theme: "system", lastSync: null, sheetsApiKey: "", sheetsSpreadsheetId: "" });
      setUserProfileLocal({ name: "", email: "", phone: "", cpf: "", address: "" });
      setHideFinancialValuesLocal(false);
      setPendingShootDeletes(new Set());
      setPendingClientDeletes(new Set());
      setPendingExpenseDeletes(new Set());
      setFirestoreReady(false);
      return;
    }

    const userId = authFirebaseUser.uid;

    // Subscribe to Firestore collections in real-time
    const unsubShoots = subscribeShoots(userId, (data) => {
      // Filter out any shoots we've optimistically deleted (prevents reappearance on sync failure)
      const filtered = data.filter(s => !pendingShootDeletes.has(s.id));
      setShootsLocal(filtered);
    });

    const unsubClients = subscribeClients(userId, (data) => {
      const filtered = data.filter(c => !pendingClientDeletes.has(c.id));
      setClientsLocal(filtered);
    });

    const unsubExpenses = subscribeExpenses(userId, (data) => {
      const filtered = data.filter(e => !pendingExpenseDeletes.has(e.id));
      setExpensesLocal(filtered);
    });

    const unsubProfile = subscribeUserProfile(userId, (data) => {
      if (data) {
        setUserProfileLocal(data);
      } else {
        // New user - start with EMPTY profile, let them fill it in
        const defaultProfile: UserProfileData = {
          name: "",
          email: authFirebaseUser.email || "",
          phone: "",
          cpf: "",
          address: "",
          photoURL: authFirebaseUser.photoURL || undefined,
        };
        setUserProfileLocal(defaultProfile);
        // DON'T auto-save to Firestore - wait for user to edit and save
      }
    });

    const unsubSettings = subscribeSettings(userId, (data) => {
      if (data) setSettingsLocal(data);
      else {
        const defaultSettings: SettingsData = {
          lang: "pt", theme: "system", lastSync: null, sheetsApiKey: "", sheetsSpreadsheetId: "",
        };
        setSettingsLocal(defaultSettings);
        saveSettings(userId, defaultSettings);
      }
    });

    const unsubHideFinancial = subscribeHideFinancialValues(userId, (value) => {
      setHideFinancialValuesLocal(value);
    });

    setFirestoreReady(true);

    return () => {
      unsubShoots();
      unsubClients();
      unsubExpenses();
      unsubProfile();
      unsubSettings();
      unsubHideFinancial();
    };
  }, [authFirebaseUser, authLoading]);

  // Sync online/offline status + offline queue processing
  const processSyncQueue = useCallback(async () => {
    if (!authFirebaseUser) return;
    const userId = authFirebaseUser.uid;
    const queue = getQueue(userId);
    if (queue.length === 0) return;

    setSyncStatus("syncing");
    for (const op of queue) {
      try {
        switch (op.collection) {
          case "shoots":
            if (op.type === "delete") {
              await deleteShoot(userId, op.data.id);
              setPendingShootDeletes(prev => {
                const next = new Set(prev);
                next.delete(op.data.id);
                return next;
              });
            } else {
              await saveShoot(userId, { ...op.data, id: op.data.id });
              setPendingShootChanges(prev => {
                const next = new Set(prev);
                next.delete(op.data.id);
                return next;
              });
            }
            break;
          case "clients":
            if (op.type === "delete") {
              await deleteClient(userId, op.data.id);
              setPendingClientDeletes(prev => {
                const next = new Set(prev);
                next.delete(op.data.id);
                return next;
              });
            } else {
              await saveClient(userId, { ...op.data, id: op.data.id });
              setPendingClientChanges(prev => {
                const next = new Set(prev);
                next.delete(op.data.id);
                return next;
              });
            }
            break;
          case "expenses":
            if (op.type === "delete") {
              await deleteExpense(userId, op.data.id);
              setPendingExpenseDeletes(prev => {
                const next = new Set(prev);
                next.delete(op.data.id);
                return next;
              });
            } else {
              await saveExpense(userId, { ...op.data, id: op.data.id });
              setPendingExpenseChanges(prev => {
                const next = new Set(prev);
                next.delete(op.data.id);
                return next;
              });
            }
            break;
          case "settings":
            await saveSettings(userId, op.data);
            break;
          case "profile":
            await saveUserProfile(userId, op.data);
            break;
          case "hideFinancial":
            await saveHideFinancialValues(userId, op.data);
            break;
        }
        removeOperation(userId, op.id);
      } catch (err) {
        console.error("[sync-queue] Falha ao processar operação", op.id, err);
        // Leave in queue for retry
      }
    }
    setPendingSyncCount(getPendingCount(userId));
    setSyncStatus("online");
  }, [authFirebaseUser]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("online");
      processSyncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };
    setIsOnline(typeof navigator !== "undefined" && navigator.onLine);
    setSyncStatus(typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, [processSyncQueue]);

  // Welcome tour on first login
  useEffect(() => {
    if (isAuthenticated && hasSeenOnboarding === false) {
      setWelcomeTourOpen(true);
    }
  }, [isAuthenticated, hasSeenOnboarding]);

  // ===== FIRESTORE WRAPPERS (maintain same interface as useLocalStorage) =====
// Fixed: Only save changed items, not entire array. Use batch writes for multiple changes.

  // Track pending local changes to avoid re-saving unchanged items from Firestore subscription
  const [pendingShootChanges, setPendingShootChanges] = useState<Set<string>>(new Set());
  const [pendingClientChanges, setPendingClientChanges] = useState<Set<string>>(new Set());
  const [pendingExpenseChanges, setPendingExpenseChanges] = useState<Set<string>>(new Set());
  // Track pending deletions to prevent subscription from overwriting optimistic updates
  const [pendingShootDeletes, setPendingShootDeletes] = useState<Set<string>>(new Set());
  const [pendingClientDeletes, setPendingClientDeletes] = useState<Set<string>>(new Set());
  const [pendingExpenseDeletes, setPendingExpenseDeletes] = useState<Set<string>>(new Set());

  const saveShootToFirestore = useCallback(async (userId: string, shoot: Shoot, isOffline: boolean) => {
    try {
      if (isOffline) {
        enqueueOperation(userId, {
          type: "update",
          collection: "shoots",
          data: { ...shoot, id: shoot.id },
          userId,
        });
      } else {
        await saveShoot(userId, { ...shoot, id: shoot.id });
      }
      setPendingShootChanges(prev => {
        const next = new Set(prev);
        next.delete(shoot.id);
        return next;
      });
    } catch (err) {
      console.error("[saveShootToFirestore] Falha ao salvar shoot", shoot.id, err);
      showToast(tLang("toast.errorSaving"), "error");
    }
  }, [showToast, tLang]);

  const saveClientToFirestore = useCallback(async (userId: string, client: Client, isOffline: boolean) => {
    try {
      if (isOffline) {
        enqueueOperation(userId, {
          type: "update",
          collection: "clients",
          data: { ...client, id: client.id },
          userId,
        });
      } else {
        await saveClient(userId, { ...client, id: client.id });
      }
      setPendingClientChanges(prev => {
        const next = new Set(prev);
        next.delete(client.id);
        return next;
      });
    } catch (err) {
      console.error("[saveClientToFirestore] Falha ao salvar cliente", client.id, err);
      showToast(tLang("toast.errorSaving"), "error");
    }
  }, [showToast, tLang]);

  const saveExpenseToFirestore = useCallback(async (userId: string, expense: Expense, isOffline: boolean) => {
    try {
      if (isOffline) {
        enqueueOperation(userId, {
          type: "update",
          collection: "expenses",
          data: { ...expense, id: expense.id },
          userId,
        });
      } else {
        await saveExpense(userId, { ...expense, id: expense.id });
      }
      setPendingExpenseChanges(prev => {
        const next = new Set(prev);
        next.delete(expense.id);
        return next;
      });
    } catch (err) {
      console.error("[saveExpenseToFirestore] Falha ao salvar despesa", expense.id, err);
      showToast(tLang("toast.errorSaving"), "error");
    }
  }, [showToast, tLang]);

  const setShoots = useCallback(async (value: Shoot[] | ((prev: Shoot[]) => Shoot[])): Promise<boolean> => {
    const next = value instanceof Function ? value(shoots) : value;
    setShootsLocal(next);
    if (!authFirebaseUser) return false;
    try {
      const changedIds = pendingShootChanges.size > 0 ? pendingShootChanges : new Set(next.map(s => s.id));
      await Promise.all([...changedIds].map(async id => {
        const shoot = next.find(s => s.id === id);
        if (shoot) await saveShootToFirestore(authFirebaseUser.uid, shoot, !isOnline);
      }));
      if (!isOnline) setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      return true;
    } catch (err) {
      console.error("[setShoots] Falha ao salvar shoots", err);
      showToast(tLang("toast.errorSaving"), "error");
      return false;
    }
  }, [shoots, authFirebaseUser, isOnline, pendingShootChanges, saveShootToFirestore, showToast, tLang]);

  const setClients = useCallback(async (value: Client[] | ((prev: Client[]) => Client[])): Promise<boolean> => {
    const next = value instanceof Function ? value(clients) : value;
    setClientsLocal(next);
    if (!authFirebaseUser) return false;
    try {
      const changedIds = pendingClientChanges.size > 0 ? pendingClientChanges : new Set(next.map(c => c.id));
      await Promise.all([...changedIds].map(async id => {
        const client = next.find(c => c.id === id);
        if (client) await saveClientToFirestore(authFirebaseUser.uid, client, !isOnline);
      }));
      if (!isOnline) setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      return true;
    } catch (err) {
      console.error("[setClients] Falha ao salvar clientes", err);
      showToast(tLang("toast.errorSaving"), "error");
      return false;
    }
  }, [clients, authFirebaseUser, isOnline, pendingClientChanges, saveClientToFirestore, showToast, tLang]);

  const setExpenses = useCallback(async (value: Expense[] | ((prev: Expense[]) => Expense[])): Promise<boolean> => {
    const next = value instanceof Function ? value(expenses) : value;
    setExpensesLocal(next);
    if (!authFirebaseUser) return false;
    try {
      const changedIds = pendingExpenseChanges.size > 0 ? pendingExpenseChanges : new Set(next.map(e => e.id));
      await Promise.all([...changedIds].map(async id => {
        const expense = next.find(e => e.id === id);
        if (expense) await saveExpenseToFirestore(authFirebaseUser.uid, expense, !isOnline);
      }));
      if (!isOnline) setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      return true;
    } catch (err) {
      console.error("[setExpenses] Falha ao salvar despesas", err);
      showToast(tLang("toast.errorSaving"), "error");
      return false;
    }
  }, [expenses, authFirebaseUser, isOnline, pendingExpenseChanges, saveExpenseToFirestore, showToast, tLang]);

  const setSettings = useCallback(async (value: SettingsData | ((prev: SettingsData) => SettingsData)): Promise<boolean> => {
    const next = value instanceof Function ? value(settings) : value;
    setSettingsLocal(next);
    if (!authFirebaseUser) return false;
    try {
      if (isOnline) {
        await saveSettings(authFirebaseUser.uid, next);
      } else {
        enqueueOperation(authFirebaseUser.uid, {
          type: "update",
          collection: "settings",
          data: next,
          userId: authFirebaseUser.uid,
        });
        setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      }
      return true;
    } catch (err) {
      console.error("[setSettings] Falha ao salvar configurações", err);
      showToast(tLang("toast.errorSaving"), "error");
      setSettingsLocal(settings);
      return false;
    }
  }, [settings, authFirebaseUser, isOnline, showToast, tLang]);

  const setUserProfile = useCallback(async (value: UserProfileData | ((prev: UserProfileData) => UserProfileData)): Promise<boolean> => {
    const next = value instanceof Function ? value(userProfile) : value;
    setUserProfileLocal(next);
    if (!authFirebaseUser) return false;
    try {
      if (isOnline) {
        await saveUserProfile(authFirebaseUser.uid, next);
      } else {
        enqueueOperation(authFirebaseUser.uid, {
          type: "update",
          collection: "profile",
          data: next,
          userId: authFirebaseUser.uid,
        });
        setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      }
      return true;
    } catch (err) {
      console.error("[setUserProfile] Falha ao salvar perfil", err);
      showToast(tLang("toast.errorSaving"), "error");
      setUserProfileLocal(userProfile);
      return false;
    }
  }, [userProfile, authFirebaseUser, isOnline, showToast, tLang]);

  const setHideFinancialValues = useCallback((value: boolean) => {
    setHideFinancialValuesLocal(value);
    if (authFirebaseUser) {
      if (isOnline) {
        saveHideFinancialValues(authFirebaseUser.uid, value).catch(err => {
          console.error("[setHideFinancialValues] Falha ao salvar", err);
          showToast(tLang("toast.errorSaving"), "error");
        });
      } else {
        enqueueOperation(authFirebaseUser.uid, {
          type: "update",
          collection: "hideFinancial",
          data: value,
          userId: authFirebaseUser.uid,
        });
        setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
      }
    }
  }, [authFirebaseUser, isOnline, showToast, tLang]);

  // ===== HANDLERS =====

  const handleShootClick = (shoot: Shoot) => {
    setPanelShoot(shoot);
    setPanelClient(clients.find(c => c.name === shoot.client) || null);
    setPanelOpen(true);
  };

  const handlePanelAction = (action: string) => {
    if (!panelShoot) return;
    switch (action) {
      case "viewContract":
        setPanelOpen(false);
        setContractModalOpen(true);
        break;
      case "sendContract":
        setShoots(prev => prev.map(s => s.id === panelShoot!.id ? { ...s, contract: true } : s));
        showToast(tLang("toast.contractSent"), "success");
        setPanelOpen(false);
        break;
      case "viewQuestionnaire":
        setPanelOpen(false);
        setQuestionnaireModalOpen(true);
        break;
      case "sendQuestionnaire":
        setShoots(prev => prev.map(s => s.id === panelShoot!.id ? { ...s, questionnaire: true } : s));
        showToast(tLang("toast.questionnaireSent"), "success");
        setPanelOpen(false);
        break;
      case "markPaid":
        setShoots(prev => prev.map(s => s.id === panelShoot!.id ? { ...s, balance: true, status: "paid" } : s));
        showToast(tLang("toast.markedPaid"), "success");
        break;
      case "viewGallery":
        setPanelOpen(false);
        setGalleryModalOpen(true);
        break;
      case "uploadGallery":
        setShoots(prev => prev.map(s => s.id === panelShoot!.id ? { ...s, gallery: `gal_${generateId().slice(-4)}` } : s));
        showToast(tLang("toast.openingGallery"), "success");
        setPanelOpen(false);
        break;
      case "viewInvoice":
        setPanelOpen(false);
        setInvoiceModalOpen(true);
        break;
      case "editShoot":
        setEditingShoot(panelShoot);
        setNewShootOpen(true);
        setPanelOpen(false);
        break;
      case "deleteShoot":
        setPendingDelete({ type: "shoot", id: panelShoot.id });
        setDeleteConfirmOpen(true);
        setPanelOpen(false);
        break;
    }
  };

  const handleNewShoot = async (data: Partial<Shoot>): Promise<boolean> => {
    const newShoot: Shoot = {
      id: data.id || generateId(),
      client: data.client || "",
      date: data.date || format(new Date(), "yyyy-MM-dd"),
      time: data.time || "14:00",
      type: data.type || "portrait",
      location: data.location || "",
      status: "inquiry",
      cover: data.type || "portrait",
      notes: data.notes || "",
      contract: false,
      contractSigned: false,
      questionnaire: false,
      deposit: false,
      balance: false,
      gallery: null,
    };
    try {
      if (editingShoot) {
        const ok = await setShoots(prev => prev.map(s => s.id === editingShoot.id ? { ...s, ...newShoot } : s));
        if (ok) {
          showToast("Shoot atualizado", "success");
          setEditingShoot(null);
          return true;
        }
        return false;
      } else {
        const ok = await setShoots(prev => [newShoot, ...prev]);
        if (ok) {
          showToast(tLang("toast.created"), "success");
          setEditingShoot(null);
          return true;
        }
        return false;
      }
    } catch (err) {
      showToast(tLang("toast.errorSaving"), "error");
      return false;
    }
  };

  const handleNewClient = async (data: Partial<Client>): Promise<boolean> => {
    try {
      if (editingClient) {
        const ok = await setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...data } : c));
        if (ok) {
          showToast(tLang("toast.clientUpdated"), "success");
          setEditingClient(null);
          return true;
        }
        return false;
      } else {
        const newClient: Client = {
          id: generateId(),
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          tags: data.tags || [],
          totalShoots: 0,
          totalSpent: 0,
          lastContact: format(new Date(), "yyyy-MM-dd"),
          notes: data.notes || "",
        };
        const ok = await setClients(prev => [newClient, ...prev]);
        if (ok) {
          showToast(tLang("toast.clientCreated"), "success");
          setEditingClient(null);
          return true;
        }
        return false;
      }
    } catch (err) {
      showToast(tLang("toast.errorSaving"), "error");
      return false;
    }
  };

  const handleDeleteClient = (client: Client) => {
    setPendingDelete({ type: "client", id: client.id });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === "shoot") {
        setPendingShootDeletes(prev => {
          const next = new Set(prev);
          next.add(pendingDelete.id);
          return next;
        });
        setShoots(prev => prev.filter(s => s.id !== pendingDelete.id));
        if (authFirebaseUser) {
          if (isOnline) {
            await deleteShoot(authFirebaseUser.uid, pendingDelete.id);
          } else {
            enqueueOperation(authFirebaseUser.uid, {
              type: "delete",
              collection: "shoots",
              data: { id: pendingDelete.id },
              userId: authFirebaseUser.uid,
            });
            setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
          }
        }
      } else {
        setPendingClientDeletes(prev => {
          const next = new Set(prev);
          next.add(pendingDelete.id);
          return next;
        });
        setClients(prev => prev.filter(c => c.id !== pendingDelete.id));
        if (authFirebaseUser) {
          if (isOnline) {
            await deleteClient(authFirebaseUser.uid, pendingDelete.id);
          } else {
            enqueueOperation(authFirebaseUser.uid, {
              type: "delete",
              collection: "clients",
              data: { id: pendingDelete.id },
              userId: authFirebaseUser.uid,
            });
            setPendingSyncCount(getPendingCount(authFirebaseUser.uid));
          }
        }
      }
      showToast(pendingDelete.type === "shoot" ? tLang("toast.shootDeleted") : tLang("toast.clientDeleted"), "success");
    } catch (err) {
      console.error("[confirmDelete] Falha ao excluir", pendingDelete.id, err);
      showToast(tLang("toast.errorDeleting"), "error");
    } finally {
      setDeleteConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const handleNewExpense = async (data: Partial<Expense>): Promise<boolean> => {
    const newExpense: Expense = {
      id: generateId(),
      title: data.title || "",
      category: data.category || "",
      amount: data.amount || 0,
      date: data.date || format(new Date(), "yyyy-MM-dd"),
      description: data.description || "",
      paymentType: data.paymentType || "",
      installments: data.installments,
      createdAt: format(new Date(), "yyyy-MM-dd HH:mm"),
    };
    try {
      const ok = await setExpenses(prev => [...prev, newExpense]);
      if (ok) {
        showToast("Gasto registrado com sucesso", "success");
        return true;
      }
      return false;
    } catch (err) {
      showToast(tLang("toast.errorSaving"), "error");
      return false;
    }
  };

  const handleCalendarDateClick = (dateStr: string, dayShoots: Shoot[]) => {
    setSelectedCalendarDate(dateStr);
    setCalendarDayShoots(dayShoots);
    setShowCalendarSheet(true);
  };

  const handleCalendarSheetClose = () => {
    setShowCalendarSheet(false);
    setSelectedCalendarDate(null);
    setCalendarDayShoots([]);
  };

  // Filter shoots for current tab
  let filteredShoots = shoots;
  if (currentTab === "today") {
    filteredShoots = shoots.filter(s => s.date === todayStr || s.status === "today");
  } else if (currentTab === "archive") {
    filteredShoots = shoots.filter(s => s.date !== todayStr && s.status !== "today");
  }

  // Futuros shoots
  const futureShoots = [...shoots]
    .filter(s => s.date > todayStr && s.status !== "delivered" && s.status !== "paid")
    .sort((a, b) => a.date.localeCompare(b.date));

  // Unified financial truth: derived from shoots
  const paidOrDeliveredShoots = shoots.filter(s => s.status === "paid" || s.status === "delivered");
  const grossRevenue = paidOrDeliveredShoots.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <>
      {!isAuthenticated && (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoginAuth onAuthSuccess={() => { setIsAuthenticated(true); }} lang={lang} />
        </div>
      )}
      {isAuthenticated && (
        <>
        {/* Confirmation dialogs */}
        {pendingDelete && (
          <ConfirmationDialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            title={t("confirm.title", lang)}
            description={pendingDelete.type === "shoot" ? t("shoot.confirmDelete", lang) : t("clients.confirmDelete", lang)}
            confirmLabel={t("confirm.confirm", lang)}
            onConfirm={confirmDelete}
            lang={lang}
          />
        )}
        <ConfirmationDialog
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          title={t("logout.title", lang)}
          description={t("logout.confirm", lang)}
          confirmLabel={t("logout.title", lang)}
          onConfirm={() => { setLogoutOpen(false); window.location.reload(); }}
          lang={lang}
        />

        {/* Welcome tour - first login only, forced overlay */}
        {hasSeenOnboarding === false && (
          <WelcomeTour
            open={welcomeTourOpen}
            onClose={() => setWelcomeTourOpen(false)}
            onComplete={() => {
              setWelcomeTourOpen(false);
              setHasSeenOnboarding(true);
              if (typeof window !== "undefined") {
                window.localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "true");
              }
            }}
            lang={lang}
          />
        )}
        <div
          className={`app min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden ${
            welcomeTourOpen ? "pointer-events-none select-none opacity-40" : ""
          }`}
        >
          {currentTab === "today" && (
            <div className="mt-6 flex justify-between items-start px-6 mb-8">
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-display text-wrap-balance">{userProfile.name || t("session.today", lang)}</h1>
                <span className="text-label">{todayDateStr}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-card/90 border border-border/60 backdrop-blur-md transition-all duration-300 hover:bg-card/100" aria-label="Menu do usuário" tabIndex={0}>
                    <User className="w-7 h-7 text-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setCurrentTab("user")} className="flex items-center justify-between px-1.5 py-0.5 gap-2"><User className="w-5 h-5 shrink-0" /><span className="truncate">Minha Conta</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentTab("settings")} className="flex items-center justify-between px-1.5 py-0.5 gap-2"><Settings className="w-5 h-5 shrink-0" /><span className="truncate">Configurações</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentTab("insights")} className="flex items-center justify-between px-1.5 py-0.5 gap-2"><DollarSign className="w-5 h-5 shrink-0" /><span className="truncate">Faturamento</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setHideFinancialValues(!hideFinancialValues)} className={`flex items-center justify-between px-1.5 py-0.5 gap-2 ${hideFinancialValues ? "text-amber-500" : ""}`}><Eye className="w-5 h-5 shrink-0" /><span className="truncate">{hideFinancialValues ? t("user.showFinancial", lang) : t("user.hideFinancial", lang)}</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center justify-between px-1.5 py-0.5 gap-2 text-destructive" onClick={() => { setLogoutOpen(true); }}><LogOut className="w-5 h-5 shrink-0" /><span className="truncate">Sair</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {syncStatus === "offline" && (
            <div className="fixed top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-popover/60 border border-border/60 backdrop-blur-md text-[0.75rem] text-muted-foreground shadow-sm">
              <WifiOff className="w-3 h-3 opacity-70" /><span>{tLang("offline.banner")}</span>
              {pendingSyncCount > 0 && (
                <span className="text-amber-500">({pendingSyncCount} pendente(s))</span>
              )}
            </div>
          )}
          {syncStatus === "syncing" && (
            <div className="fixed top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-md text-[0.75rem] text-amber-900 shadow-sm">
              <RefreshCw className="w-3 h-3 animate-spin" /><span>{tLang("offline.syncing")}</span>
            </div>
          )}

          <main className={`flex-1 overflow-y-auto page-padding pb-28 md:pb-0 ${currentTab === "today" ? "pt-4 pb-48" : ""}`} role="main">
            {currentTab === "today" ? (
              <section className="today-carousel space-y-4">
                <div className="today-carousel__header flex items-center justify-between mb-2">
                  <h2 className="text-heading text-wrap-balance">{t("session.today", lang)}</h2>
                  <span className="text-data">{filteredShoots.length} {filteredShoots.length === 1 ? "shoot" : "shoots"} hoje</span>
                </div>
                {filteredShoots.length === 0 ? (
                  <EmptyState
                    icon={Camera}
                    title={tLang("empty.title")}
                    text={tLang("empty.text")}
                    ctaLabel={tLang("empty.cta")}
                    onCtaClick={() => { setEditingShoot(null); setNewShootOpen(true); }}
                  />
                ) : (
                  <>
                    <button
                      className="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 border border-border/60 backdrop-blur-md flex items-center justify-center hover:bg-card/100 transition-colors hidden md:flex"
                      onClick={() => {
                        const container = document.getElementById("todayCarousel");
                        container?.scrollBy({ left: -320, behavior: "smooth" });
                      }}
                      aria-label="Shoots anteriores"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div
                      id="todayCarousel"
                      className="today-carousel__wrap relative flex gap-4 overflow-x-auto scroll-snap-type-x mandatory pb-4 snap-x snap-stop-normal px-6 md:px-0"
                      role="list"
                      aria-label="Shoots de hoje"
                    >
                      {filteredShoots.map((shoot) => (
                        <div
                          key={shoot.id}
                          className="snap-start shrink-0 w-[260px] md:w-[300px] lg:w-[340px] xl:w-[380px]"
                          role="listitem"
                        >
                          <ShootCard shoot={shoot} onClick={() => handleShootClick(shoot)} lang={lang} isToday={shoot.status === "today"} todayStr={todayStr} />
                        </div>
                      ))}
                    </div>
                    <button
                      className="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 border border-border/60 backdrop-blur-md flex items-center justify-center hover:bg-card/100 transition-colors hidden md:flex"
                      onClick={() => {
                        const container = document.getElementById("todayCarousel");
                        container?.scrollBy({ left: 320, behavior: "smooth" });
                      }}
                      aria-label="Próximos shoots"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                    <div className="today-carousel__dots flex justify-center gap-1.5">
                      {filteredShoots.map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${i === 0 ? "bg-amber-500" : "bg-border/60"}`}
                          aria-label={`Shoot ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <section className="mt-8 mb-20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-heading text-wrap-balance">Próximos shoots</h2>
                    <span className="text-data">{futureShoots.length} agendado(s)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {futureShoots.length === 0 ? (
                      <p className="text-muted/80 text-center py-8 col-span-full">Sem shoots agendados para os próximos dias.</p>
                    ) : (
                      futureShoots.map((shoot) => (
                        <div key={shoot.id} className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-4 cursor-pointer hover:bg-card/80 transition-colors" onClick={() => handleShootClick(shoot)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-data text-xs font-medium ${getStatusColor(shoot.status as ShootStatus)}`}>{typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}</span>
                            <span className="text-data text-xs text-foreground/80">{format(parseISO(shoot.date), "dd/MM", { locale: lang === "pt" ? ptBR : enUS })}</span>
                          </div>
                          <h3 className="text-heading mb-1 text-wrap-balance text-foreground">{shoot.client}</h3>
                          <p className="text-label mb-2 text-foreground/75">{shoot.location}</p>
                          <div className="flex items-center gap-2 text-data text-xs">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-foreground/90">{shoot.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </section>
            ) : currentTab === "archive" ? (
              <div className="grid grid-masonry-2" id="shootGrid" role="list" aria-label="Arquivo">
                {filteredShoots.length === 0 ? (
                  <EmptyState
                    icon={Camera}
                    title={tLang("empty.title")}
                    text={tLang("empty.text")}
                    ctaLabel={tLang("empty.cta")}
                    onCtaClick={() => { setEditingShoot(null); setNewShootOpen(true); }}
                    className="col-span-full"
                  />
                ) : (
                  filteredShoots.map(shoot => (
                    <div key={shoot.id} role="listitem" className={shoot.status === "today" ? "grid__item--tall" : ""}>
                      <ShootCard shoot={shoot} onClick={() => handleShootClick(shoot)} lang={lang} isToday={shoot.status === "today"} todayStr={todayStr} />
                    </div>
                  ))
                )}
              </div>
            ) : currentTab === "clients" ? (
              <ClientsView
                clients={clients}
                shoots={shoots}
                lang={lang}
                hideFinancialValues={hideFinancialValues}
                onClientClick={(client) => { setEditingClient(client); setClientModalOpen(true); }}
                onNewClient={() => { setEditingClient(null); setClientModalOpen(true); }}
                onEditClient={(client) => { setEditingClient(client); setClientModalOpen(true); }}
                onDeleteClient={handleDeleteClient}
              />
            ) : currentTab === "calendar" ? (
              <CalendarView
                shoots={shoots}
                lang={lang}
                onDateClick={handleCalendarDateClick}
              />
            ) : currentTab === "insights" ? (
              <InsightsView shoots={shoots} clients={clients} lang={lang} hideFinancialValues={hideFinancialValues} />
            ) : currentTab === "settings" ? (
              <SettingsView
                settings={settings}
                setSettings={setSettings}
                shoots={shoots}
                clients={clients}
                expenses={expenses}
                userProfile={userProfile}
                hideFinancialValues={hideFinancialValues}
                userId={authFirebaseUser?.uid || ""}
                lang={lang}
              />
            ) : currentTab === "user" ? (
              <UserView
                clients={clients}
                expenses={expenses}
                userProfile={userProfile}
                newExpenseOpen={newExpenseOpen}
                setNewExpenseOpen={setNewExpenseOpen}
                handleNewExpense={handleNewExpense}
                onNewExpense={() => setNewExpenseOpen(true)}
                lang={lang}
                hideFinancialValues={hideFinancialValues}
                openGrossModal={() => setFinancialModal("gross")}
                openNetModal={() => setFinancialModal("net")}
                openExpensesModal={() => setFinancialModal("expenses")}
                openExpenseHistoryModal={() => setExpenseHistoryOpen(true)}
                grossRevenue={grossRevenue}
                netRevenue={grossRevenue - expenses.reduce((sum, e) => sum + e.amount, 0)}
                totalExpenses={expenses.reduce((sum, e) => sum + e.amount, 0)}
                onEditProfile={() => setProfileEditOpen(true)}
                profileEditOpen={profileEditOpen}
                setProfileEditOpen={setProfileEditOpen}
                onSaveProfile={(data) => setUserProfile(data)}
              />
            ) : null}
          </main>

          <GrossRevenueModal
            open={financialModal === "gross"}
            onClose={() => setFinancialModal(null)}
            lang={lang}
            clients={clients}
            shoots={shoots}
            hideFinancialValues={hideFinancialValues}
            onClientShootClick={(shoot) => {
              setFinancialModal(null);
              setPanelShoot(shoot);
              setPanelClient(clients.find((c) => c.name === shoot.client) || null);
              setPanelOpen(true);
            }}
          />
          <NetRevenueModal
            open={financialModal === "net"}
            onClose={() => setFinancialModal(null)}
            lang={lang}
            clients={clients}
            expenses={expenses}
            shoots={shoots}
            hideFinancialValues={hideFinancialValues}
          />
          <ExpensesModal
            open={financialModal === "expenses"}
            onClose={() => setFinancialModal(null)}
            lang={lang}
            expenses={expenses}
            hideFinancialValues={hideFinancialValues}
          />
          <ExpenseHistoryModal
            open={expenseHistoryOpen}
            onClose={() => setExpenseHistoryOpen(false)}
            lang={lang}
            expenses={expenses}
            hideFinancialValues={hideFinancialValues}
          />

          {/* Panel */}
          <Panel
            shoot={panelShoot}
            client={panelClient}
            isOpen={panelOpen}
            onClose={() => { setPanelOpen(false); setPanelShoot(null); setPanelClient(null); }}
            onAction={handlePanelAction}
            lang={lang}
          />

          {/* Contract Modal */}
          {panelShoot && (
            <ContractModal
              open={contractModalOpen}
              onClose={() => setContractModalOpen(false)}
              shoot={panelShoot}
              lang={lang}
              setShoots={setShoots}
              showToast={showToast}
              tLang={tLang}
            />
          )}

          {/* Questionnaire Modal */}
          {panelShoot && (
            <QuestionnaireModal
              open={questionnaireModalOpen}
              onClose={() => setQuestionnaireModalOpen(false)}
              shoot={panelShoot}
              lang={lang}
              setShoots={setShoots}
              showToast={showToast}
              tLang={tLang}
            />
          )}

          {/* Gallery Modal */}
          {panelShoot && (
            <GalleryModal
              open={galleryModalOpen}
              onClose={() => setGalleryModalOpen(false)}
              shoot={panelShoot}
              lang={lang}
              setShoots={setShoots}
              showToast={showToast}
              tLang={tLang}
            />
          )}

          {/* Invoice Modal */}
          {panelShoot && (
            <InvoiceModal
              open={invoiceModalOpen}
              onClose={() => setInvoiceModalOpen(false)}
              shoot={panelShoot}
              lang={lang}
              setShoots={setShoots}
              showToast={showToast}
              tLang={tLang}
            />
          )}

          {/* Tab Bar */}
          <TabBar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            lang={lang}
            showFAB={isMobile && (currentTab === "today" || currentTab === "archive" || currentTab === "clients")}
            onFABClick={() => { setEditingShoot(null); setEditingClient(null); setNewShootOpen(true); }}
          />

          {/* FAB for Desktop */}
          {!isMobile && (
            <div className="fixed bottom-10 right-10 z-40">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button className="w-20 h-20 rounded-full bg-amber-500 text-amber-950 shadow-2xl hover:bg-amber-400 transition-colors" aria-label={tLang("menu.create")}>
                    <Plus className="w-8 h-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => { setEditingShoot(null); setNewShootOpen(true); }} className="flex items-center gap-2"><Camera className="w-4 h-4" />{tLang("add.shoot")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setEditingClient(null); setClientModalOpen(true); }} className="flex items-center gap-2"><User className="w-4 h-4" />{tLang("add.client")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentTab("settings")} className="flex items-center gap-2"><Settings className="w-4 h-4" />{tLang("menu.settings")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Calendar Day Sheet */}
          {showCalendarSheet && selectedCalendarDate && (
            <Sheet open={showCalendarSheet} onOpenChange={handleCalendarSheetClose}>
              <SheetContent className="" side="bottom">
                <SheetHeader>
                  <SheetTitle className="text-heading">{format(parseISO(selectedCalendarDate), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</SheetTitle>
                </SheetHeader>
                <div className="space-y-2">
                  {calendarDayShoots.length === 0 ? (
                    <p className="text-center text-muted py-8">{tLang("empty.text")}</p>
                  ) : (
                    calendarDayShoots.map(shoot => (
                      <button key={shoot.id} className="w-full text-left p-3 rounded-lg border border-border/60 bg-card/50 touch-manipulation transition-colors hover:bg-card/80" onClick={() => { handleCalendarSheetClose(); handleShootClick(shoot); }}>
                        <div className="flex items-center justify-between">
                          <span className="text-heading">{shoot.client}</span>
                          <span className="text-label">{typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-data mt-1 text-muted">
                          <Clock className="w-4 h-4" />{shoot.time}
                          <span>·</span>
                          <MapPin className="w-4 h-4" />{shoot.location}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* New Shoot Modal */}
          <NewShootModal
            open={newShootOpen}
            onClose={() => { setNewShootOpen(false); setEditingShoot(null); }}
            onSubmit={handleNewShoot}
            clients={clients}
            lang={lang}
            editingShoot={editingShoot}
          />

          {/* Client Modal */}
          <ClientModal
            open={clientModalOpen}
            onClose={() => { setClientModalOpen(false); setEditingClient(null); }}
            onSubmit={handleNewClient}
            client={editingClient}
            lang={lang}
          />

        </div>
        {/* Toasts - fora da div principal para não ficar por baixo de menus/dropdowns */}
        <Toaster>
          {toasts.map(toast => (
            <ToastComponent key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </Toaster>
        </>
      )}
    </>
  );
}
