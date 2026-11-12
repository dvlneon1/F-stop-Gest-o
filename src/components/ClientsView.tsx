"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Users, Eye, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { t } from "@/lib/i18n";
import { formatCurrency, getInitials, getStatusColor } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Client, Shoot, getTagColor } from "@/lib/constants";

interface ClientsViewProps {
  clients: Client[];
  shoots: Shoot[];
  lang: string;
  hideFinancialValues: boolean;
  onClientClick: (client: Client) => void;
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

export function ClientsView({ clients, shoots, lang, hideFinancialValues, onClientClick, onNewClient, onEditClient, onDeleteClient }: ClientsViewProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");

  const allTags = Array.from(new Set(clients.flatMap(c => c.tags))).sort();

  let filtered = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "todos" || c.tags.includes(category);
    return matchesSearch && matchesCategory;
  });

  filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  if (filtered.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto page-padding pb-40">
        <h1 className="mb-6 text-display text-wrap-balance">{t("session.clients", lang)}</h1>
        <EmptyState
          icon={Users}
          title={t("clients.empty.title", lang)}
          text={t("clients.empty.text", lang)}
          ctaLabel={t("clients.empty.cta", lang)}
          onCtaClick={onNewClient}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto page-padding pb-40">
      <div className="clients-header sticky top-0 z-10 bg-background border-b border-border px-4 py-3 mb-4 flex flex-col gap-3 w-full">
        <Button onClick={onNewClient} className="w-full bg-amber-500 text-amber-950 hover:bg-amber-400 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />{t("clients.new", lang)}
        </Button>
        <Input
          placeholder={t("clients.search", lang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
          aria-label={t("clients.search", lang)}
        />
        <Select value={category} onValueChange={(v) => setCategory(v ?? "todos")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("clients.filter", lang)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{t("clients.filterAll", lang)}</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="clients-list space-y-2 mb-24">
        {filtered.map(client => {
          const clientShoots = shoots.filter(s => s.client === client.name);
          // Unified financial truth: derive totals from shoots, not from stored client fields
          const clientTotalShoots = clientShoots.length;
          const clientTotalSpent = clientShoots
            .filter(s => s.status === "paid" || s.status === "delivered")
            .reduce((sum, s) => sum + (s.amount || 0), 0);
          const upcomingShoots = clientShoots.filter(s => s.date >= format(new Date(), "yyyy-MM-dd") && s.status !== "delivered" && s.status !== "paid").length;
          const statusBadge = upcomingShoots > 0 ? "booked" : clientTotalShoots > 0 ? "delivered" : "inquiry";
          const statusText = upcomingShoots > 0 ? `${upcomingShoots} ${t("clients.upcoming", lang)}` : clientTotalShoots > 0 ? t("clients.completed", lang) : t("clients.new", lang);

          return (
            <article
              key={client.id}
              className="client-card grid grid-cols-[auto_1fr_auto] gap-3 items-start rounded-lg border border-border/60 bg-card/80 backdrop-blur-md p-2 touch-manipulation transition-all duration-150 hover:border-muted/80 hover:bg-card/90 cursor-pointer"
              onClick={() => onClientClick(client)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClientClick(client); }}}
              tabIndex={0}
              role="listitem"
              aria-label={`${client.name}, ${clientTotalShoots} ${t("clients.shoots", lang)}, ${hideFinancialValues ? "***" : formatCurrency(clientTotalSpent, lang)}`}
            >
              <div className="client-card__avatar w-10 h-10 bg-border/60 flex items-center justify-center flex-shrink-0 rounded-lg overflow-hidden border border-border/60">
                {client.photoURL ? (
                  <img src={client.photoURL} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="client-initial text-data text-muted">{getInitials(client.name)}</span>
                )}
              </div>
              <div className="client-card__info min-w-0">
                <h3 className="client-card__name text-heading truncate text-wrap-balance">{client.name}</h3>
                <div className="client-card__meta flex flex-col gap-0.5 mt-0.5">
                  <span className="client-card__email text-data/90 truncate text-sm">{client.email}</span>
                  <span className="client-card__phone text-data/70 text-xs">{client.phone}</span>
                </div>
                <div className="client-card__tags flex flex-wrap gap-1 mt-1.5">
                  {client.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-label border border-border/60 px-1.5 py-0.5 rounded-md">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTagColor(tag) }} />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="client-card__stats flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="client-stat text-data/90 text-xs">{clientTotalShoots} {t("clients.shoots", lang)}</span>
                  <span className="client-stat text-data/90 text-xs">{hideFinancialValues ? "***" : formatCurrency(clientTotalSpent, lang)}</span>
                  <span className={`${getStatusColor(statusBadge as "booked" | "delivered" | "inquiry")} text-label px-2 py-0.5 border border-border/60 rounded-md text-xs`}>{statusText}</span>
                </div>
              </div>
              <div className="flex items-start justify-center pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="client-card__actions w-8 h-8 flex items-center justify-center bg-white/50 border border-white/30 text-white/80 hover:bg-white/70 hover:border-white/40 hover:text-white transition-colors rounded-full" aria-label={t("clients.actions", lang)} tabIndex={0}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEditClient(client); }} className="flex items-center gap-2"><Edit className="w-4 h-4" />{t("clients.edit", lang)}</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); onClientClick(client); }} className="flex items-center gap-2"><Eye className="w-4 h-4" />{t("clients.viewShoots", lang)}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => { e.preventDefault(); onDeleteClient(client); }} className="flex items-center gap-2 text-red-500 focus:text-red-500"><Trash2 className="w-4 h-4" />{t("clients.delete", lang)}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
