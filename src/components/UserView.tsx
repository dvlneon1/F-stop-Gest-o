"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Clock } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { Client, Expense } from "@/lib/constants";
import { NewExpenseModal } from "@/components/NewExpenseModal";
import { ProfileEditModal } from "@/components/ProfileEditModal";

interface UserViewProps {
  clients: Client[];
  expenses: Expense[];
  userProfile: { name: string; email: string; phone: string; cpf: string; address: string; photoURL?: string };
  newExpenseOpen: boolean;
  setNewExpenseOpen: (v: boolean) => void;
  handleNewExpense: (data: Partial<Expense>) => void;
  onNewExpense: () => void;
  lang: string;
  hideFinancialValues: boolean;
  openGrossModal: () => void;
  openNetModal: () => void;
  openExpensesModal: () => void;
  openExpenseHistoryModal: () => void;
  grossRevenue: number;
  netRevenue: number;
  totalExpenses: number;
  onEditProfile: () => void;
  profileEditOpen: boolean;
  setProfileEditOpen: (v: boolean) => void;
  onSaveProfile: (data: { name: string; email: string; phone: string; cpf: string; address: string; photoURL?: string }) => Promise<boolean>;
}

export function UserView({ clients, expenses, userProfile, newExpenseOpen, setNewExpenseOpen, handleNewExpense, onNewExpense, lang, hideFinancialValues, openGrossModal, openNetModal, openExpensesModal, openExpenseHistoryModal, grossRevenue, netRevenue, totalExpenses, onEditProfile, profileEditOpen, setProfileEditOpen, onSaveProfile }: UserViewProps) {
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  return (
    <div className="page-padding space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-border/60 flex items-center justify-center overflow-hidden">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-data text-muted text-xl">{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "?"}</span>
            )}
          </div>
          <h1 className="text-display">{userProfile.name || t("user.profile", lang)}</h1>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-2 gap-2">
        <Card onClick={openGrossModal} className="cursor-pointer hover:bg-card/100 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">{t("user.grossRevenue", lang)}</p>
                <p className="text-heading">{hideFinancialValues ? "***" : formatCurrency(grossRevenue, lang)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
          </CardContent>
        </Card>
        <Card onClick={openNetModal} className="cursor-pointer hover:bg-card/100 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">{t("user.netRevenue", lang)}</p>
                <p className="text-heading text-green-500">{hideFinancialValues ? "***" : formatCurrency(netRevenue, lang)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
          </CardContent>
        </Card>
        <Card onClick={openExpensesModal} className="cursor-pointer hover:bg-card/100 transition-colors col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">{t("user.totalExpenses", lang)}</p>
                <p className="text-heading">{hideFinancialValues ? "***" : formatCurrency(totalExpenses, lang)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-label text-center mt-3">{t("user.clickForDetails", lang)}</p>

      {/* Botões novo gasto e histórico */}
      <div className="flex gap-2 justify-center mb-2">
        <Button onClick={onNewExpense} className="bg-amber-500 text-amber-950 hover:bg-amber-400">
          <Plus className="w-4 h-4 mr-2" />{t("expenses.register", lang)}
        </Button>
        <Button onClick={openExpenseHistoryModal} className="border border-white/50 bg-transparent text-white hover:bg-white/10 transition-colors">
          <Clock className="w-4 h-4 mr-2" />{t("user.expenseHistory", lang)}
        </Button>
      </div>

      {/* Gastos por categoria */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-heading mb-4 text-wrap-balance">{t("user.expensesByCategory", lang)}</h2>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).length === 0 ? (
              <p className="text-muted text-center py-8">{t("user.noExpenses", lang)}</p>
            ) : (
              Object.entries(expensesByCategory).map(([category, total]) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
                  <span className="text-body">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-data">{hideFinancialValues ? "***" : formatCurrency(total, lang)}</span>
                    <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full bg-primary ${total > 0 ? 'transition-all duration-500' : ''}`} style={{ width: grossRevenue > 0 ? Math.min((total / grossRevenue) * 100, 100) : 0 }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados cadastrais */}
      <Card className="mb-16">
        <CardContent className="p-4">
          <h2 className="text-heading mb-4 text-wrap-balance">{t("user.personalData", lang)}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
              <div>
                <p className="text-label">{t("user.name", lang)}</p>
                <p className="text-body">{userProfile.name || "—"}</p>
              </div>
              <button className="text-amber-500 text-xs hover:underline" onClick={onEditProfile}>{t("user.edit", lang)}</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
              <div>
                <p className="text-label">{t("user.email", lang)}</p>
                <p className="text-body">{userProfile.email || "—"}</p>
              </div>
              <button className="text-amber-500 text-xs hover:underline" onClick={onEditProfile}>{t("user.edit", lang)}</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
              <div>
                <p className="text-label">{t("user.phone", lang)}</p>
                <p className="text-body">{userProfile.phone || "—"}</p>
              </div>
              <button className="text-amber-500 text-xs hover:underline" onClick={onEditProfile}>{t("user.edit", lang)}</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
              <div>
                <p className="text-label">{t("user.cpf", lang)}</p>
                <p className="text-body">{userProfile.cpf || "—"}</p>
              </div>
              <button className="text-amber-500 text-xs hover:underline" onClick={onEditProfile}>{t("user.edit", lang)}</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/50">
              <div>
                <p className="text-label">{t("user.address", lang)}</p>
                <p className="text-body">{userProfile.address || "—"}</p>
              </div>
              <button className="text-amber-500 text-xs hover:underline" onClick={onEditProfile}>{t("user.edit", lang)}</button>
            </div>
          </div>
        </CardContent>
      </Card>

      <NewExpenseModal
        open={newExpenseOpen}
        onClose={() => setNewExpenseOpen(false)}
        onSubmit={(data) => {
          handleNewExpense(data);
          return Promise.resolve(true);
        }}
        lang={lang}
      />

      <ProfileEditModal
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        onSubmit={async (data) => {
          const ok = await onSaveProfile(data);
          if (ok) setProfileEditOpen(false);
          return ok;
        }}
        profile={userProfile}
        lang={lang}
      />
    </div>
  );
}
