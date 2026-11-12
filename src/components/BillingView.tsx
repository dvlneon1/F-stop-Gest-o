"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import {
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  BarChart2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Shoot, InvoiceData, InvoiceItem, InvoiceStatus } from "@/lib/constants";

interface BillingViewProps {
  shoots: Shoot[];
  clients: { name: string }[];
  lang: string;
  hideFinancialValues: boolean;
  onViewInvoice: (shoot: Shoot) => void;
  onEditInvoice: (shoot: Shoot) => void;
  onSendInvoice: (shoot: Shoot) => void;
  onDownloadInvoice: (shoot: Shoot) => void;
  onDeleteInvoice: (shoot: Shoot) => void;
}

export function BillingView({
  shoots,
  clients,
  lang,
  hideFinancialValues,
  onViewInvoice,
  onEditInvoice,
  onSendInvoice,
  onDownloadInvoice,
  onDeleteInvoice,
}: BillingViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "thisMonth" | "lastMonth" | "thisYear">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "client" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showStats, setShowStats] = useState(true);

  const statusLabels = {
    pt: { pending: "Pendente", partial: "Parcial", paid: "Paga" },
    en: { pending: "Pending", partial: "Partial", paid: "Paid" },
  };

  const statusIcons = {
    pending: AlertCircle,
    partial: Clock,
    paid: CheckCircle,
  };

  const statusColors = {
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    partial: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    paid: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  // Filter shoots that have invoice data
  const invoicedShoots = useMemo(() => {
    return shoots.filter((s) => s.invoiceData && s.invoiceData.items.length > 0);
  }, [shoots]);

  const filteredShoots = useMemo(() => {
    let result = [...invoicedShoots];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.client.toLowerCase().includes(searchLower) ||
          s.invoiceData?.items.some((item) => item.description.toLowerCase().includes(searchLower)) ||
          (s.eventTitle?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.invoiceData?.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      result = result.filter((s) => {
        const shootDate = new Date(s.date);
        if (dateFilter === "thisMonth") {
          return shootDate.getMonth() === currentMonth && shootDate.getFullYear() === currentYear;
        }
        if (dateFilter === "lastMonth") {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return shootDate.getMonth() === lastMonth && shootDate.getFullYear() === lastMonthYear;
        }
        if (dateFilter === "thisYear") {
          return shootDate.getFullYear() === currentYear;
        }
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount") {
        const amountA = a.invoiceData?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;
        const amountB = b.invoiceData?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;
        comparison = amountA - amountB;
      } else if (sortBy === "client") {
        comparison = a.client.localeCompare(b.client);
      } else if (sortBy === "status") {
        const statusOrder = { pending: 0, partial: 1, paid: 2 };
        comparison = (statusOrder[a.invoiceData?.status ?? "pending"] ?? 0) - (statusOrder[b.invoiceData?.status ?? "pending"] ?? 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [invoicedShoots, search, statusFilter, dateFilter, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = invoicedShoots.reduce((sum, s) => {
      const itemsTotal = s.invoiceData?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0;
      return sum + itemsTotal;
    }, 0);

    const paid = invoicedShoots
      .filter((s) => s.invoiceData?.status === "paid")
      .reduce((sum, s) => sum + (s.invoiceData?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0), 0);

    const pending = invoicedShoots
      .filter((s) => s.invoiceData?.status === "pending")
      .reduce((sum, s) => sum + (s.invoiceData?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0), 0);

    const partial = invoicedShoots
      .filter((s) => s.invoiceData?.status === "partial")
      .reduce((sum, s) => sum + (s.invoiceData?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0), 0);

    const overdue = invoicedShoots.filter((s) => {
      if (s.invoiceData?.status === "paid") return false;
      const dueDate = new Date(s.invoiceData?.dueDate ?? "");
      return dueDate < new Date() && !isNaN(dueDate.getTime());
    }).length;

    return { total, paid, pending, partial, overdue, count: invoicedShoots.length };
  }, [invoicedShoots]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: lang === "pt" ? ptBR : enUS });
    } catch {
      return dateStr;
    }
  };

  if (filteredShoots.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto page-padding pb-40 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-heading text-wrap-balance">{t("billing.empty.title", lang)}</h2>
          <p className="text-body text-muted-foreground">{t("billing.empty.text", lang)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto page-padding pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60 px-4 py-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-display text-wrap-balance">{t("billing.title", lang)}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="whitespace-nowrap">
              <BarChart2 className="w-4 h-4 mr-1" />
              {showStats ? t("billing.hideStats", lang) : t("billing.showStats", lang)}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            <StatCard
              label={t("billing.stats.total", lang)}
              value={hideFinancialValues ? "***" : formatCurrency(stats.total, lang)}
              icon={<DollarSign className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              label={t("billing.stats.paid", lang)}
              value={hideFinancialValues ? "***" : formatCurrency(stats.paid, lang)}
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            />
            <StatCard
              label={t("billing.stats.pending", lang)}
              value={hideFinancialValues ? "***" : formatCurrency(stats.pending, lang)}
              icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              label={t("billing.stats.partial", lang)}
              value={hideFinancialValues ? "***" : formatCurrency(stats.partial, lang)}
              icon={<Clock className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              label={t("billing.stats.overdue", lang)}
              value={stats.overdue}
              icon={<XCircle className="w-5 h-5 text-red-500" />}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("billing.search", lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("billing.filterStatus", lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("billing.filterAll", lang)}</SelectItem>
              <SelectItem value="pending">{statusLabels[lang as keyof typeof statusLabels].pending}</SelectItem>
              <SelectItem value="partial">{statusLabels[lang as keyof typeof statusLabels].partial}</SelectItem>
              <SelectItem value="paid">{statusLabels[lang as keyof typeof statusLabels].paid}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("billing.filterDate", lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("billing.filterAllTime", lang)}</SelectItem>
              <SelectItem value="thisMonth">{t("billing.filterThisMonth", lang)}</SelectItem>
              <SelectItem value="lastMonth">{t("billing.filterLastMonth", lang)}</SelectItem>
              <SelectItem value="thisYear">{t("billing.filterThisYear", lang)}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
            if (!v) return;
            const [sb, so] = v.split("-");
            setSortBy(sb as any);
            setSortOrder(so as any);
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("billing.sortBy", lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">{t("billing.sort.dateNewest", lang)}</SelectItem>
              <SelectItem value="date-asc">{t("billing.sort.dateOldest", lang)}</SelectItem>
              <SelectItem value="amount-desc">{t("billing.sort.amountHigh", lang)}</SelectItem>
              <SelectItem value="amount-asc">{t("billing.sort.amountLow", lang)}</SelectItem>
              <SelectItem value="client-asc">{t("billing.sort.clientAZ", lang)}</SelectItem>
              <SelectItem value="client-desc">{t("billing.sort.clientZA", lang)}</SelectItem>
              <SelectItem value="status-asc">{t("billing.sort.statusAsc", lang)}</SelectItem>
              <SelectItem value="status-desc">{t("billing.sort.statusDesc", lang)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3 mb-24">
        {filteredShoots.map((shoot) => {
          const invoice = shoot.invoiceData!;
          const itemsTotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
          const taxAmount = itemsTotal * (invoice.taxRate / 100);
          const totalAmount = itemsTotal + taxAmount;
          const status = invoice.status;
          const StatusIcon = statusIcons[status];
          const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
          const isOverdue = dueDate && dueDate < new Date() && status !== "paid";

          return (
            <article
              key={shoot.id}
              className="billing-card rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-4 hover:border-muted/80 hover:bg-card/90 transition-all duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-heading text-wrap-balance truncate pr-4">{shoot.client}</h3>
                      {shoot.eventTitle && (
                        <p className="text-label text-muted-foreground truncate">{shoot.eventTitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabels[lang as keyof typeof statusLabels][status]}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                          <AlertCircle className="w-3 h-3" />
                          {t("billing.overdue", lang)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(shoot.date)}
                    </span>
                    {invoice.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t("billing.dueDate", lang)}: {formatDate(invoice.dueDate)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {t("billing.itemsCount", lang)}: {invoice.items.length}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                    {invoice.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                        <span className="truncate pr-2">{item.description}</span>
                        <span className="font-mono text-data whitespace-nowrap">{hideFinancialValues ? "***" : formatCurrency(item.quantity * item.unitPrice, lang)}</span>
                      </div>
                    ))}
                    {invoice.items.length > 3 && (
                      <div className="text-xs text-muted-foreground text-right py-1">
                        +{invoice.items.length - 3} {t("billing.moreItems", lang)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals & Actions */}
                <div className="flex flex-col items-end gap-3 sm:w-64 shrink-0">
                  <div className="text-right w-full space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("billing.subtotal", lang)}</span>
                      <span className="font-mono text-data">{hideFinancialValues ? "***" : formatCurrency(itemsTotal, lang)}</span>
                    </div>
                    {invoice.taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("billing.tax", lang)} ({invoice.taxRate}%)</span>
                        <span className="font-mono text-data">{hideFinancialValues ? "***" : formatCurrency(taxAmount, lang)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold border-t border-border/60 pt-2">
                      <span className="text-foreground">{t("billing.total", lang)}</span>
                      <span className="font-mono text-data">{hideFinancialValues ? "***" : formatCurrency(totalAmount, lang)}</span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => onViewInvoice(shoot)} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {t("billing.view", lang)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditInvoice(shoot)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        {t("billing.edit", lang)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendInvoice(shoot)} className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t("billing.send", lang)}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownloadInvoice(shoot)} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {t("billing.download", lang)}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteInvoice(shoot)} className="flex items-center gap-2 text-red-500 focus:text-red-500">
                        <Trash2 className="w-4 h-4" />
                        {t("billing.delete", lang)}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-3 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-label text-muted-foreground">
            {filteredShoots.length} {t("billing.of", lang)} {invoicedShoots.length} {t("billing.invoices", lang)}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{t("billing.totalValue", lang)}:</span>
            <span className="font-mono text-data font-semibold">
              {hideFinancialValues ? "***" : formatCurrency(
                filteredShoots.reduce((sum, s) => {
                  const itemsTotal = s.invoiceData?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0;
                  const taxAmount = itemsTotal * ((s.invoiceData?.taxRate ?? 0) / 100);
                  return sum + itemsTotal + taxAmount;
                }, 0),
                lang
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/80 backdrop-blur-md p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-label text-muted-foreground">{label}</span>
        <span className="text-amber-500">{icon}</span>
      </div>
      <p className="text-heading font-mono text-foreground">{value}</p>
    </div>
  );
}

// Import Calendar icon
