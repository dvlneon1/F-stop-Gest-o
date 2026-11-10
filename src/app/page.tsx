"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, Toaster } from "@/components/ui/toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuIndicator } from "@/components/ui/navigation-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  LayoutGrid,
  Archive,
  Users,
  Calendar as CalendarIcon,
  BarChart3,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Settings,
  Mic,
  MicOff,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  CalendarRange,
  Search,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Home,
  Menu,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Globe,
  ChevronLeft,
  ChevronRight,
  Hash,
  Tag,
  Mail,
  Phone,
  Clock,
  MapPin,
  PenTool,
  Signature,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle,
  Star,
  Heart,
  Zap,
  MoonStar,
  Music,
  Briefcase,
  User,
  Users2,
  Building2,
  Camera as CameraIcon,
  Palette,
  RefreshCcw,
  Save,
  Send,
  FileDown,
  FileUp,
  Type,
  Eraser,
  Minimize,
  Maximize2,
  PanelRight,
  PanelLeft,
  GripVertical,
  MoreVertical,
  EllipsisVertical,
  Loader2,
  Wifi,
  WifiOff,
  Database,
  Cloud,
  CloudOff,
} from "lucide-react";

import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isPast, isFuture, addMonths, subMonths, addWeeks, subWeeks, startOfDay, endOfDay, getDay, getDate, getMonth, getYear } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

// ===== TYPES =====
interface Shoot {
  id: string;
  client: string;
  date: string;
  time: string;
  type: ShootType;
  location: string;
  status: ShootStatus;
  cover: CoverType;
  notes: string;
  contract: boolean;
  contractSigned: boolean;
  contractData?: ContractData;
  questionnaire: boolean;
  deposit: boolean;
  balance: boolean;
  gallery: string | null;
}

type ShootType = "wedding" | "portrait" | "commercial" | "family" | "event";
type ShootStatus = "inquiry" | "booked" | "shot" | "culled" | "proofing" | "delivered" | "paid" | "today";
type CoverType = "wedding" | "portrait" | "commercial" | "family" | "event";

interface ContractData {
  template: ShootType;
  signedAt: string;
  signedBy: string;
  signature: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  totalShoots: number;
  totalSpent: number;
  lastContact: string;
  notes: string;
}

interface GallerySection {
  name: string;
  order: number;
  images: GalleryImage[];
}

interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  selected: boolean;
  favorite: boolean;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

// ===== CONSTANTS =====
const SHOOTS_KEY = "lente_shoots_v1";
const CLIENTS_KEY = "lente_clients_v1";
const SETTINGS_KEY = "lente_settings_v1";
const GALLERIES_KEY = "lente_galleries_v1";
const INVOICES_KEY = "lente_invoices_v1";
const QUESTIONNAIRES_KEY = "lente_questionnaires_v1";

const defaultShoots: Shoot[] = [
  { id: "1", client: "Maria & João", date: "2026-11-15", time: "14:00", type: "wedding", location: "Igreja São Francisco, SP", status: "booked", cover: "wedding", notes: "Cerimônia 16h, festa 20h. First look no jardim. Drone autorizado.", contract: true, contractSigned: true, contractData: { template: "wedding", signedAt: "2026-11-01", signedBy: "Maria Silva", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: false, gallery: null },
  { id: "2", client: "Ana Silva", date: "2026-11-10", time: "10:00", type: "portrait", location: "Estúdio Luz Natural, SP", status: "shot", cover: "portrait", notes: "Retrato corporativo. 3 trocas de look. Fundo cinza e branco.", contract: true, contractSigned: true, contractData: { template: "portrait", signedAt: "2026-11-05", signedBy: "Ana Silva", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: true, gallery: "gal_002" },
  { id: "3", client: "TechStart Inc.", date: "2026-11-20", time: "09:00", type: "commercial", location: "Escritório Vila Madalena", status: "inquiry", cover: "commercial", notes: "Headshots team (12 pessoas). Produto em uso. Lifestyle office.", contract: false, contractSigned: false, questionnaire: false, deposit: false, balance: false, gallery: null },
  { id: "4", client: "Família Oliveira", date: "2026-11-05", time: "16:30", type: "family", location: "Parque Ibirapuera", status: "delivered", cover: "family", notes: "Sessão lifestyle ao ar livre. Golden hour 17h30. Crianças 4 e 7 anos.", contract: true, contractSigned: true, contractData: { template: "family", signedAt: "2026-10-28", signedBy: "João Oliveira", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: true, gallery: "gal_004" },
  { id: "5", client: "Banda Aurora", date: "2026-11-25", time: "20:00", type: "event", location: "Audio Club, SP", status: "proofing", cover: "event", notes: "Show lançamento álbum. Palco + backstage. Baixa luz, ISO alto.", contract: true, contractSigned: false, questionnaire: true, deposit: true, balance: false, gallery: "gal_005" },
  { id: "6", client: "Carolina Mendes", date: "2026-11-08", time: "15:00", type: "portrait", location: "Estúdio Casa", status: "today", cover: "portrait", notes: "Book 15 anos. 4 looks. Maquiagem inclusa. Entrega 15 dias.", contract: true, contractSigned: true, contractData: { template: "portrait", signedAt: "2026-11-07", signedBy: "Carolina Mendes", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: true, gallery: null },
];

const defaultClients: Client[] = [
  { id: "c1", name: "Maria & João", email: "maria.joao@email.com", phone: "(11) 99999-1111", tags: ["casamento", "vip"], totalShoots: 1, totalSpent: 12500, lastContact: "2026-11-10", notes: "Casamento 15/11. Primeira dança coreografada. Alergia a camarão (bufê)." },
  { id: "c2", name: "Ana Silva", email: "ana.silva@corp.com", phone: "(11) 98888-2222", tags: ["corporativo", "recorrente"], totalShoots: 3, totalSpent: 8500, lastContact: "2026-11-05", notes: "Headshots trimestrais. Prefere fundo cinza. Empresa: TechStart." },
  { id: "c3", name: "TechStart Inc.", email: "rh@techstart.io", phone: "(11) 97777-3333", tags: ["comercial", "b2b"], totalShoots: 1, totalSpent: 0, lastContact: "2026-11-01", notes: "Proposta enviada 01/11. 12 headshots team. Aguardando aprovação orçamento." },
  { id: "c4", name: "Família Oliveira", email: "oliveira.familia@gmail.com", phone: "(11) 96666-4444", tags: ["família", "lifestyle"], totalShoots: 2, totalSpent: 4200, lastContact: "2026-10-28", notes: "Sessão parque 05/11. Crianças 4 e 7 anos. Golden hour 17h30." },
  { id: "c5", name: "Banda Aurora", email: "contato@bandaaurora.com", phone: "(11) 95555-5555", tags: ["evento", "música"], totalShoots: 1, totalSpent: 3800, lastContact: "2026-11-12", notes: "Show 25/11 Audio Club. Backstage + palco. Baixa luz." },
  { id: "c6", name: "Carolina Mendes", email: "carol.mendes@email.com", phone: "(11) 94444-6666", tags: ["retrato", "15anos"], totalShoots: 1, totalSpent: 2800, lastContact: "2026-11-07", notes: "Book 15 anos hoje. 4 looks. Maquiagem inclusa." },
];

const typeGradients: Record<CoverType, string> = {
  wedding: "linear-gradient(135deg, #2d1b3d 0%, #1a1a2e 50%, #16213e 100%)",
  portrait: "linear-gradient(135deg, #1a3d2e 0%, #0d2b1f 50%, #0a1f1a 100%)",
  commercial: "linear-gradient(135deg, #2d2d3d 0%, #1a1a2e 50%, #0f0f1a 100%)",
  family: "linear-gradient(135deg, #3d2d1a 0%, #2e1f0d 50%, #1a120a 100%)",
  event: "linear-gradient(135deg, #3d1a1a 0%, #2e0d0d 50%, #1a0a0a 100%)",
};

const typeIcons: Record<ShootType, React.ReactNode> = {
  wedding: <Users2 className="w-6 h-6" strokeWidth={1.5} />,
  portrait: <User className="w-6 h-6" strokeWidth={1.5} />,
  commercial: <Briefcase className="w-6 h-6" strokeWidth={1.5} />,
  family: <Users className="w-6 h-6" strokeWidth={1.5} />,
  event: <Music className="w-6 h-6" strokeWidth={1.5} />,
};

const statusLabels = {
  pt: { inquiry: "Contato", booked: "Agendado", shot: "Fotografado", culled: "Selecionado", proofing: "Prova", delivered: "Entregue", paid: "Pago", today: "Hoje" },
  en: { inquiry: "Inquiry", booked: "Booked", shot: "Shot", culled: "Culled", proofing: "Proofing", delivered: "Delivered", paid: "Paid", today: "Today" },
};

const typeLabels = {
  pt: { wedding: "Casamento", portrait: "Retrato", commercial: "Comercial", family: "Família", event: "Evento" },
  en: { wedding: "Wedding", portrait: "Portrait", commercial: "Commercial", family: "Family", event: "Event" },
};

const i18n = {
  pt: {
    "tab.today": "Hoje", "tab.archive": "Arquivo", "tab.clients": "Clientes", "tab.calendar": "Calendário", "tab.insights": "Insights",
    "form.client": "Cliente", "form.date": "Data", "form.time": "Horário", "form.type": "Tipo", "form.location": "Local", "form.notes": "Notas",
    "form.selectType": "Selecione", "form.portrait": "Retrato", "form.wedding": "Casamento", "form.commercial": "Comercial", "form.family": "Família", "form.event": "Evento",
    "modal.newShoot": "Novo Shoot", "modal.cancel": "Cancelar", "modal.create": "Criar", "modal.save": "Salvar",
    "panel.contract": "Contrato", "panel.questionnaire": "Questionário", "panel.deposit": "Sinal", "panel.balance": "Saldo", "panel.gallery": "Galeria",
    "panel.actions": "Ações", "panel.viewGallery": "Ver Galeria", "panel.sendContract": "Enviar Contrato", "panel.sendQuestionnaire": "Enviar Questionário", "panel.markPaid": "Marcar Pago", "panel.viewContract": "Ver Contrato", "panel.viewQuestionnaire": "Ver Questionário", "panel.viewInvoice": "Ver Fatura", "panel.uploadGallery": "Enviar imagens",
    "toast.created": "Shoot criado com sucesso", "toast.synced": "Sincronizado", "toast.offline": "Offline — alterações salvas localmente",
    "empty.title": "Nenhum shoot ainda", "empty.text": "Toque em + para criar seu primeiro shoot. Suas capas aparecerão aqui.",
    "empty.cta": "Criar primeiro shoot",
    "sync.online": "Online", "sync.offline": "Offline", "sync.syncing": "Sincronizando...",
    "menu.actions": "Ações", "menu.create": "Criar", "menu.tools": "Ferramentas", "menu.settings": "Configurações",
    "menu.newShoot": "Novo Shoot", "menu.voice": "Entrada de voz", "menu.sync": "Sincronizar",
    "settings.language": "Idioma", "settings.theme": "Tema", "settings.data": "Dados", "settings.about": "Sobre",
    "settings.pt": "PT-BR", "settings.en": "EN", "settings.dark": "Escuro", "settings.light": "Claro", "settings.system": "Sistema",
    "settings.export": "Exportar dados (JSON)", "settings.clear": "Limpar todos os dados",
    "voice.listening": "Ouvindo...", "voice.result": "Comando reconhecido: ", "voice.error": "Erro no reconhecimento",
    "insights.total": "Total", "insights.booked": "Agendados", "insights.shot": "Fotografados", "insights.delivered": "Entregues",
    "insights.paid": "Pagos", "insights.pending": "Pendentes", "insights.revenue": "Receita", "insights.conversion": "Conversão",
    "calendar.month": "Mês", "calendar.week": "Semana", "calendar.view": "Visualização", "calendar.prevMonth": "Mês anterior", "calendar.nextMonth": "Próximo mês",
    "calendar.day": "dia", "calendar.shoots": "shoots", "calendar.shootsOn": "Shoots em",
    "clients.empty.title": "Nenhum cliente", "clients.empty.text": "Toque em + para adicionar seu primeiro cliente.", "clients.empty.cta": "Adicionar cliente",
    "clients.search": "Buscar clientes...", "clients.new": "Novo Cliente", "clients.edit": "Editar Cliente", "clients.delete": "Excluir",
    "clients.confirmDelete": "Excluir este cliente? Shoots vinculados permanecerão.", "clients.contact": "Contato", "clients.stats": "Estatísticas",
    "clients.totalShoots": "Total de shoots", "clients.totalSpent": "Total gasto", "clients.lastContact": "Último contato", "clients.shoots": "shoots",
    "clients.history": "Histórico", "clients.noShoots": "Nenhum shoot ainda", "clients.upcoming": "próximos", "clients.completed": "Concluídos",
    "clients.actions": "Ações", "clients.newShoot": "Novo Shoot", "clients.viewShoots": "Ver Shoots", "clients.email": "E-mail", "clients.phone": "Telefone", "clients.tags": "Tags",
    "toast.clientCreated": "Cliente criado", "toast.clientUpdated": "Cliente atualizado", "toast.clientDeleted": "Cliente excluído",
    "contract.title": "Contrato", "contract.download": "Baixar PDF", "contract.sign": "Assinar", "contract.signTitle": "Assinatura Digital",
    "contract.signInstruction": "Assine abaixo com o dedo ou mouse. Esta assinatura tem validade jurídica (MP 2.200-2/2001).",
    "contract.clear": "Limpar", "contract.typeName": "Digitar Nome", "contract.confirm": "Confirmar Assinatura",
    "contract.signed": "Contrato assinado por {name} em {date}", "contract.sent": "Contrato enviado para assinatura",
    "status.sent": "Enviado", "status.pending": "Pendente", "status.received": "Recebido", "status.paid": "Pago", "status.ready": "Pronto", "status.signed": "Assinado",
    "toast.contractSent": "Contrato enviado", "toast.questionnaireSent": "Questionário enviado", "toast.markedPaid": "Marcado como pago", "toast.openingGallery": "Abrindo galeria...", "toast.contractSigned": "Contrato assinado",
    "questionnaire.title": "Questionário", "questionnaire.download": "Baixar PDF", "questionnaire.save": "Salvar Respostas", "questionnaire.prefill": "Preencher do CRM", "questionnaire.new": "Novo Questionário",
    "gallery.title": "Galeria", "gallery.sections": "Seções", "gallery.images": "Imagens", "gallery.upload": "Enviar imagens", "gallery.share": "Compartilhar link", "gallery.password": "Senha", "gallery.clientSelect": "Seleção do cliente", "gallery.download": "Baixar seleção", "gallery.new": "Nova Galeria",
    "invoice.title": "Fatura", "invoice.items": "Itens", "invoice.subtotal": "Subtotal", "invoice.tax": "Impostos", "invoice.total": "Total", "invoice.deposit": "Sinal pago", "invoice.balance": "Saldo devedor", "invoice.dueDate": "Vencimento", "invoice.status": "Status", "invoice.download": "Baixar PDF", "invoice.send": "Enviar por e-mail", "invoice.markPaid": "Marcar como paga", "invoice.new": "Nova Fatura",
    "app.name": "Lente",
    "app.tagline": "CRM para Fotógrafos",
    "today.shoot": "Shoot de hoje",
    "shoot.details": "Detalhes do shoot",
    "client.details": "Detalhes do cliente",
    "add.shoot": "Adicionar shoot",
    "add.client": "Adicionar cliente",
    "edit.shoot": "Editar shoot",
    "edit.client": "Editar cliente",
    "delete.confirm": "Tem certeza?",
    "offline.banner": "Você está offline. As alterações serão sincronizadas quando voltar online.",
    "sync.now": "Sincronizar agora",
    "last.synced": "Última sincronização",
    "never.synced": "Nunca sincronizado",
  },
  en: {
    "tab.today": "Today", "tab.archive": "Archive", "tab.clients": "Clients", "tab.calendar": "Calendar", "tab.insights": "Insights",
    "form.client": "Client", "form.date": "Date", "form.time": "Time", "form.type": "Type", "form.location": "Location", "form.notes": "Notes",
    "form.selectType": "Select", "form.portrait": "Portrait", "form.wedding": "Wedding", "form.commercial": "Commercial", "form.family": "Family", "form.event": "Event",
    "modal.newShoot": "New Shoot", "modal.cancel": "Cancel", "modal.create": "Create", "modal.save": "Save",
    "panel.contract": "Contract", "panel.questionnaire": "Questionnaire", "panel.deposit": "Deposit", "panel.balance": "Balance", "panel.gallery": "Gallery",
    "panel.actions": "Actions", "panel.viewGallery": "View Gallery", "panel.sendContract": "Send Contract", "panel.sendQuestionnaire": "Send Questionnaire", "panel.markPaid": "Mark Paid", "panel.viewContract": "View Contract", "panel.viewQuestionnaire": "View Questionnaire", "panel.viewInvoice": "View Invoice", "panel.uploadGallery": "Upload images",
    "toast.created": "Shoot created", "toast.synced": "Synced", "toast.offline": "Offline — changes saved locally",
    "empty.title": "No shoots yet", "empty.text": "Tap + to create your first shoot. Your covers will appear here.",
    "empty.cta": "Create first shoot",
    "sync.online": "Online", "sync.offline": "Offline", "sync.syncing": "Syncing...",
    "menu.actions": "Actions", "menu.create": "Create", "menu.tools": "Tools", "menu.settings": "Settings",
    "menu.newShoot": "New Shoot", "menu.voice": "Voice Input", "menu.sync": "Sync",
    "settings.language": "Language", "settings.theme": "Theme", "settings.data": "Data", "settings.about": "About",
    "settings.pt": "PT-BR", "settings.en": "EN", "settings.dark": "Dark", "settings.light": "Light", "settings.system": "System",
    "settings.export": "Export data (JSON)", "settings.clear": "Clear all data",
    "voice.listening": "Listening...", "voice.result": "Command recognized: ", "voice.error": "Recognition error",
    "insights.total": "Total", "insights.booked": "Booked", "insights.shot": "Shot", "insights.delivered": "Delivered",
    "insights.paid": "Paid", "insights.pending": "Pending", "insights.revenue": "Revenue", "insights.conversion": "Conversion",
    "calendar.month": "Month", "calendar.week": "Week", "calendar.view": "View", "calendar.prevMonth": "Previous month", "calendar.nextMonth": "Next month",
    "calendar.day": "day", "calendar.shoots": "shoots", "calendar.shootsOn": "Shoots on",
    "clients.empty.title": "No clients", "clients.empty.text": "Tap + to add your first client.", "clients.empty.cta": "Add client",
    "clients.search": "Search clients...", "clients.new": "New Client", "clients.edit": "Edit Client", "clients.delete": "Delete",
    "clients.confirmDelete": "Delete this client? Linked shoots will remain.", "clients.contact": "Contact", "clients.stats": "Stats",
    "clients.totalShoots": "Total shoots", "clients.totalSpent": "Total spent", "clients.lastContact": "Last contact", "clients.shoots": "shoots",
    "clients.history": "History", "clients.noShoots": "No shoots yet", "clients.upcoming": "upcoming", "clients.completed": "Completed",
    "clients.actions": "Actions", "clients.newShoot": "New Shoot", "clients.viewShoots": "View Shoots", "clients.email": "Email", "clients.phone": "Phone", "clients.tags": "Tags",
    "toast.clientCreated": "Client created", "toast.clientUpdated": "Client updated", "toast.clientDeleted": "Client deleted",
    "contract.title": "Contract", "contract.download": "Download PDF", "contract.sign": "Sign", "contract.signTitle": "Digital Signature",
    "contract.signInstruction": "Sign below with finger or mouse. This signature has legal validity (ESIGN Act / UETA).",
    "contract.clear": "Clear", "contract.typeName": "Type Name", "contract.confirm": "Confirm Signature",
    "contract.signed": "Contract signed by {name} on {date}", "contract.sent": "Contract sent for signature",
    "status.sent": "Sent", "status.pending": "Pending", "status.received": "Received", "status.paid": "Paid", "status.ready": "Ready", "status.signed": "Signed",
    "toast.contractSent": "Contract sent", "toast.questionnaireSent": "Questionnaire sent", "toast.markedPaid": "Marked as paid", "toast.openingGallery": "Opening gallery...", "toast.contractSigned": "Contract signed",
    "questionnaire.title": "Questionnaire", "questionnaire.download": "Download PDF", "questionnaire.save": "Save Responses", "questionnaire.prefill": "Prefill from CRM", "questionnaire.new": "New Questionnaire",
    "gallery.title": "Gallery", "gallery.sections": "Sections", "gallery.images": "Images", "gallery.upload": "Upload images", "gallery.share": "Share link", "gallery.password": "Password", "gallery.clientSelect": "Client selection", "gallery.download": "Download selection", "gallery.new": "New Gallery",
    "invoice.title": "Invoice", "invoice.items": "Items", "invoice.subtotal": "Subtotal", "invoice.tax": "Tax", "invoice.total": "Total", "invoice.deposit": "Deposit paid", "invoice.balance": "Balance due", "invoice.dueDate": "Due date", "invoice.status": "Status", "invoice.download": "Download PDF", "invoice.send": "Send by email", "invoice.markPaid": "Mark as paid", "invoice.new": "New Invoice",
    "app.name": "Lente",
    "app.tagline": "CRM for Photographers",
    "today.shoot": "Today's shoot",
    "shoot.details": "Shoot details",
    "client.details": "Client details",
    "add.shoot": "Add shoot",
    "add.client": "Add client",
    "edit.shoot": "Edit shoot",
    "edit.client": "Edit client",
    "delete.confirm": "Are you sure?",
    "offline.banner": "You are offline. Changes will sync when back online.",
    "sync.now": "Sync now",
    "last.synced": "Last synced",
    "never.synced": "Never synced",
  },
};

const contractTemplates: Record<ShootType, { title: string; clauses: { title: string; text: string }[] }> = {
  wedding: {
    title: "Contrato de Fotografia — Casamento",
    clauses: [
      { title: "1. Partes", text: "Fotógrafo: [Seu Nome/Empresa], doravante \"FOTÓGRAFO\". Cliente: {client}, doravante \"CLIENTE\"." },
      { title: "2. Objeto", text: "Cobertura fotográfica do casamento em {date} às {time} em {location}. Inclui: making of, cerimônia, recepção, primeira dança, até 10h de cobertura." },
      { title: "3. Entregáveis", text: "Mínimo 600 imagens tratadas em alta resolução (JPEG), entregues via galeria online em até 60 dias úteis. Inclui 50 imagens em formato RAW (opcional)." },
      { title: "4. Direitos de Uso", text: "O CLIENTE recebe licença pessoal, não exclusiva, para uso não comercial (redes sociais, impressão pessoal, álbum). Direitos comerciais permanecem com o FOTÓGRAFO." },
      { title: "5. Investimento", text: "Total: R$ 8.500,00. Sinal de 30% (R$ 2.550,00) na assinatura. Saldo até 7 dias antes do evento. Parcelamento em até 3x sem juros." },
      { title: "6. Cancelamento", text: "Por parte do CLIENTE: sinal não reembolsável. Por parte do FOTÓGRAFO: devolução integral + 20% de multa. Força maior: reagendamento sem custo." },
      { title: "7. Prazo de Entrega", text: "Até 60 dias úteis após o evento. Atraso superior a 30 dias: desconto de 10% no saldo." },
      { title: "8. Disposições Gerais", text: "Este contrato rege-se pelas leis brasileiras. Foro: comarca de residência do FOTÓGRAFO. Assinatura digital tem validade jurídica (MP 2.200-2/2001)." },
    ],
  },
  portrait: {
    title: "Contrato de Fotografia — Retrato / Book",
    clauses: [
      { title: "1. Partes", text: "Fotógrafo: [Seu Nome/Empresa], \"FOTÓGRAFO\". Cliente: {client}, \"CLIENTE\"." },
      { title: "2. Objeto", text: "Sessão de retrato em {date} às {time} em {location}. Duração: até 2h. Inclui: 3 trocas de look, direção de pose, 15 imagens finais tratadas." },
      { title: "3. Entregáveis", text: "15 imagens em alta resolução (JPEG) + 5 versões web. Galeria online por 12 meses. Arquivos RAW não incluídos." },
      { title: "4. Direitos de Uso", text: "Uso pessoal ilimitado. Uso comercial (linkedin, portfólio profissional, marketing): licença adicional de 30% do valor." },
      { title: "5. Investimento", text: "Total: R$ 1.200,00. Sinal 50% na assinatura. Saldo na entrega. Reagendamento: 48h de antecedência sem custo." },
      { title: "6. Cancelamento", text: "Sinal não reembolsável. FOTÓGRAFO cancela: devolução integral + 1 ensaio extra de 1h." },
      { title: "7. Prazo de Entrega", text: "Até 15 dias úteis. Seleção de 15 imagens pelo cliente em até 7 dias após galeria de provas." },
      { title: "8. Disposições Gerais", text: "Válido pela legislação brasileira. Assinatura digital juridicamente válida." },
    ],
  },
  commercial: {
    title: "Contrato de Fotografia — Comercial / Corporativo",
    clauses: [
      { title: "1. Partes", text: "Fotógrafo: [Seu Nome/Empresa], \"FOTÓGRAFO\". Cliente: {client}, \"CLIENTE\"." },
      { title: "2. Objeto", text: "Produção de {type} em {date} às {time} em {location}. Escopo: headshots team (12 pessoas), produto em uso, lifestyle office. Estimado 4h." },
      { title: "3. Entregáveis", text: "Todas as imagens tratadas em alta resolução (mín. 150 finalizadas). Licença comercial perpétua, mundial, exclusiva por 2 anos. Entrega via link seguro + backup." },
      { title: "4. Direitos de Uso", text: "CLIENTE: uso comercial ilimitado (marketing, site, impressão, anúncios). FOTÓGRAFO: direito de usar em portfólio/promoção própria (exceto se NDA assinado)." },
      { title: "5. Investimento", text: "Total: R$ 4.500,00. 50% na assinatura, 50% na entrega. Nota fiscal emitida. Despesas extras (deslocamento, hospedagem, assistentes) à parte." },
      { title: "6. Cancelamento", text: "Até 7 dias: 50% do sinal retido. Menos de 7 dias: sinal integral. FOTÓGRAFO: devolução + 30%." },
      { title: "7. Prazo de Entrega", text: "Até 10 dias úteis. Seleção prévia em 48h para aprovação de direção de tratamento." },
      { title: "8. Disposições Gerais", text: "Confidencialidade: imagens não publicadas antes de aprovação. Lei aplicável: brasileira. Assinatura digital válida." },
    ],
  },
  family: {
    title: "Contrato de Fotografia — Família / Lifestyle",
    clauses: [
      { title: "1. Partes", text: "Fotógrafo: [Seu Nome/Empresa], \"FOTÓGRAFO\". Cliente: {client}, \"CLIENTE\"." },
      { title: "2. Objeto", text: "Sessão lifestyle em {date} às {time} em {location}. Duração: até 1h30. Foco: interação natural, golden hour. Crianças: pausas conforme necessidade." },
      { title: "3. Entregáveis", text: "Mínimo 50 imagens tratadas (JPEG alta resolução). Galeria online 12 meses. 10 impressões 15x21cm inclusas (opcional: álbum 20x20cm +R$ 350)." },
      { title: "4. Direitos de Uso", text: "Uso pessoal e familiar ilimitado. Compartilhamento em redes sociais permitido com crédito @seuusuario. Uso comercial: licença separada." },
      { title: "5. Investimento", text: "Total: R$ 1.500,00. Sinal 40% na assinatura. Saldo na entrega. Chuva: reagendamento sem custo (1x)." },
      { title: "6. Cancelamento", text: "Sinal: 50% reembolsável se >7 dias. FOTÓGRAFO cancela: devolução integral + sessão mini (30min) de cortesia." },
      { title: "7. Prazo de Entrega", text: "Até 20 dias úteis. Galeria de provas em 72h para seleção de favoritas (opcional)." },
      { title: "8. Disposições Gerais", text: "Menores de 18: assinatura de responsável. Lei brasileira. Assinatura digital válida." },
    ],
  },
  event: {
    title: "Contrato de Fotografia — Evento / Show",
    clauses: [
      { title: "1. Partes", text: "Fotógrafo: [Seu Nome/Empresa], \"FOTÓGRAFO\". Cliente: {client}, \"CLIENTE\"." },
      { title: "2. Objeto", text: "Cobertura de {type} em {date} às {time} em {location}. Acesso: palco, backstage, camarotes. Duração: até 5h. Baixa luz / ISO alto esperado." },
      { title: "3. Entregáveis", text: "Mínimo 200 imagens tratadas (JPEG alta resolução). Entrega em 48h (seleção urgente) + completa em 10 dias. Galeria protegida por senha." },
      { title: "4. Direitos de Uso", text: "CLIENTE: uso promocional, imprensa, redes sociais da banda/produção. FOTÓGRAFO: portfólio próprio + venda de fine art (acordo prévio). Crédito obrigatório: @seuusuario." },
      { title: "5. Investimento", text: "Total: R$ 2.800,00. Sinal 50% na assinatura. Saldo no dia. Deslocamento >50km: R$ 2/km. Equipamento extra (flash, lente) incluso." },
      { title: "6. Cancelamento", text: "Até 14 dias: sinal 50% retido. <14 dias: sinal integral. FOTÓGRAFO: devolução + 25%. Força maior: reagendamento." },
      { title: "7. Prazo de Entrega", text: "Seleção urgente (50 imagens) em 48h. Completa em 10 dias úteis. Aprovação de tratamento em lote." },
      { title: "8. Disposições Gerais", text: "Credenciamento responsabilidade do CLIENTE. Seguro equipamento: FOTÓGRAFO. Lei brasileira. Assinatura digital válida." },
    ],
  },
};

const questionnaireTemplates: Record<ShootType, { title: string; sections: { title: string; fields: any[] }[] }> = {
  wedding: {
    title: "Questionário — Casamento",
    sections: [
      { title: "Informações Gerais", fields: [
        { id: "weddingDate", type: "date", label: "Data do casamento", required: true },
        { id: "ceremonyTime", type: "time", label: "Horário da cerimônia", required: true },
        { id: "receptionTime", type: "time", label: "Horário da recepção" },
        { id: "ceremonyLocation", type: "text", label: "Local da cerimônia (endereço completo)", required: true },
        { id: "receptionLocation", type: "text", label: "Local da recepção (endereço completo)" },
        { id: "gettingReadyLocation", type: "text", label: "Local do making of (noiva/noivo)" },
        { id: "guestCount", type: "number", label: "Número aproximado de convidados" },
      ]},
      { title: "Timeline & Logística", fields: [
        { id: "firstLook", type: "select", label: "Vai ter First Look?", options: ["Sim, antes da cerimônia", "Não, só na cerimônia", "Ainda não decidimos"] },
        { id: "drone", type: "select", label: "Drone autorizado no local?", options: ["Sim", "Não", "Verificar com local"] },
        { id: "flashAllowed", type: "select", label: "Flash permitido na cerimônia?", options: ["Sim", "Não", "Apenas discreto"] },
        { id: "coordinator", type: "text", label: "Nome/contato do assessor/cerimonialista" },
        { id: "vendorContacts", type: "textarea", label: "Contatos de outros fornecedores (vídeo, decoração, bufê)" },
      ]},
      { title: "Família & Grupos", fields: [
        { id: "familyFormals", type: "textarea", label: "Lista de combinações formais obrigatórias (ex: noiva+pais, noivo+irmãos, padrinhos, etc.)" },
        { id: "divorcedParents", type: "select", label: "Pais divorciados? Como lidar nas fotos?", options: ["Separados", "Juntos sem problema", "Evitar juntos", "Não se aplica"] },
        { id: "specialPeople", type: "textarea", label: "Pessoas especiais que devem aparecer (avós, pets, amigos de infância)" },
      ]},
      { title: "Preferências de Estilo", fields: [
        { id: "photoStyle", type: "select", label: "Estilo preferido", options: ["Documental/espontâneo", "Clássico/posado", "Misto (metade cada)", "Artístico/editorial"] },
        { id: "mustHaveShots", type: "textarea", label: "Fotos que NÃO podem faltar (detalhes, momentos específicos)" },
        { id: "avoidShots", type: "textarea", label: "O que evitar (poses forçadas, certas pessoas juntas, etc.)" },
        { id: "colorPrefs", type: "text", label: "Cores/tema do casamento (para direcionar edição)" },
      ]},
      { title: "Entrega & Extras", fields: [
        { id: "albumWanted", type: "select", label: "Álbum impresso?", options: ["Sim, quero orçamento", "Já incluso no pacote", "Não, apenas digital"] },
        { id: "rushDelivery", type: "select", label: "Entrega urgente de algumas fotos?", options: ["Sim, 48h (sneak peek)", "Não, prazo normal", "Apenas para redes sociais"] },
        { id: "socialMediaTag", type: "text", label: "Hashtag do casamento / @ para marcar" },
      ]},
    ],
  },
  portrait: {
    title: "Questionário — Retrato / Book",
    sections: [
      { title: "Perfil & Objetivo", fields: [
        { id: "shootPurpose", type: "select", label: "Objetivo das fotos", options: ["Perfil profissional/LinkedIn", "Book modelo/ator", "Pessoal/autoestima", "Marca pessoal/influencer", "Outro"] },
        { id: "usage", type: "select", label: "Onde serão usadas", options: ["Redes sociais", "Site/portfolio", "Impressão/currículo", "Material de marketing", "Uso interno empresa"] },
        { id: "vibe", type: "select", label: "Vibe desejada", options: ["Natural/espontâneo", "Polido/corporativo", "Criativo/artístico", "Dramático/moody", "Leve/alegre"] },
      ]},
      { title: "Aparência & Preparação", fields: [
        { id: "outfitCount", type: "number", label: "Quantas trocas de look pretende levar", default: 3 },
        { id: "outfitDetails", type: "textarea", label: "Descreva os looks (cores, estilos, formalidade)" },
        { id: "hairMakeup", type: "select", label: "Cabelo/maquiagem", options: ["Faço eu mesmo", "Contrato profissional", "Gostaria de indicação", "Incluso no pacote"] },
        { id: "glasses", type: "select", label: "Usa óculos?", options: ["Sim, vou usar", "Sim, mas tiro para fotos", "Não uso", "Lentes de contato"] },
        { id: "features", type: "textarea", label: "Pontos fortes a destacar / inseguranças a suavizar" },
      ]},
      { title: "Logística", fields: [
        { id: "locationPref", type: "select", label: "Preferência de local", options: ["Estúdio (fundo neutro)", "Externo/urbano", "Natureza/parque", "Local de trabalho", "Em casa", "Sem preferência"] },
        { id: "timePref", type: "select", label: "Horário preferido", options: ["Manhã (luz suave)", "Tarde (golden hour)", "Meio-dia (luz dura)", "Flexível"] },
        { id: "props", type: "textarea", label: "Objetos/acessórios que quer trazer (instrumento, laptop, livro, pet)" },
      ]},
      { title: "Referências", fields: [
        { id: "inspoLinks", type: "textarea", label: "Links de referências (Pinterest, Instagram, portfólios)" },
        { id: "poseComfort", type: "select", label: "Conforto com direção de pose", options: ["Totamente confortável", "Preciso de muita direção", "Meio termo", "Prefiro posar naturalmente"] },
      ]},
    ],
  },
  commercial: {
    title: "Questionário — Comercial / Corporativo",
    sections: [
      { title: "Briefing da Empresa", fields: [
        { id: "companyName", type: "text", label: "Nome da empresa", required: true },
        { id: "companySegment", type: "text", label: "Segmento/indústria" },
        { id: "brandValues", type: "textarea", label: "Valores/missão da marca (para guiar tom visual)" },
        { id: "targetAudience", type: "textarea", label: "Público-alvo das imagens" },
        { id: "competitors", type: "textarea", label: "Concorrentes principais (referência visual)" },
      ]},
      { title: "Escopo do Projeto", fields: [
        { id: "shotTypes", type: "textarea", label: "Tipos de foto necessários (headshots, produto, lifestyle, ambiente, detalhes)" },
        { id: "peopleCount", type: "number", label: "Número de pessoas a fotografar" },
        { id: "peopleDetails", type: "textarea", label: "Nomes/cargos das pessoas (para headshots)" },
        { id: "productDetails", type: "textarea", label: "Produtos a fotografar (qtd, tamanhos, materiais)" },
        { id: "usageRights", type: "select", label: "Direitos de uso necessários", options: ["Uso interno apenas", "Marketing digital", "Impressão/catálogo", "Publicidade paga", "Todos (licença ampla)"] },
      ]},
      { title: "Produção", fields: [
        { id: "locationDetails", type: "textarea", label: "Detalhes do local (endereço, acessos, restrições, estacionamento)" },
        { id: "styling", type: "select", label: "Estilista/figurino", options: ["Empresa fornece", "Fotógrafo indica", "Pessoas trazem próprio", "Não se aplica"] },
        { id: "propsEquipment", type: "textarea", label: "Equipamentos/cenários necessários (mesas, cadeiras, fundos, iluminação extra)" },
        { id: "schedule", type: "textarea", label: "Cronograma do dia (horários por pessoa/setup)" },
      ]},
      { title: "Entrega & Técnico", fields: [
        { id: "deliveryFormat", type: "select", label: "Formato de entrega", options: ["JPEG alta + web", "RAW + JPEG", "TIFF para impressão", "Todos os acima"] },
        { id: "retouchLevel", type: "select", label: "Nível de retoque", options: ["Natural (pele real)", "Leve (limpeza)", "Moderado (padrão corporativo)", "Alto (editorial/beauty)"] },
        { id: "colorProfile", type: "select", label: "Perfil de cor", options: ["sRGB (web)", "Adobe RGB (impressão)", "Ambos", "Conforme especificação"] },
        { id: "deadline", type: "date", label: "Prazo de entrega desejado" },
        { id: "approvalProcess", type: "textarea", label: "Processo de aprovação (quem aprova, quantas rodadas)" },
      ]},
    ],
  },
  family: {
    title: "Questionário — Família / Lifestyle",
    sections: [
      { title: "Quem Participa", fields: [
        { id: "adults", type: "number", label: "Adultos", default: 2 },
        { id: "kids", type: "number", label: "Crianças (idades)", default: 0 },
        { id: "kidsAges", type: "text", label: "Idades das crianças" },
        { id: "pets", type: "text", label: "Pets (tipo, nome, temperamento)" },
        { id: "specialNeeds", type: "textarea", label: "Necessidades especiais (mobilidade, alergias, timidez, TDAH, etc.)" },
      ]},
      { title: "Dinâmica & Personalidade", fields: [
        { id: "familyVibe", type: "select", label: "Como a família se descreve", options: ["Animada/brincalhona", "Calma/afetuosa", "Mista", "Tímida/reservada", "Caótica (no bom sentido)"] },
        { id: "activities", type: "textarea", label: "Coisas que gostam de fazer juntos (ler, cozinhar, brincar, caminhar, abraçar)" },
        { id: "kidsPersonality", type: "textarea", label: "Personalidade de cada criança (o que faz rir, o que acalma, medos)" },
        { id: "comfortTouch", type: "select", label: "Conforto com toque físico/afeto nas fotos", options: ["Muito à vontade", "Normal", "Um pouco reservados", "Preferem não posar abraçados"] },
      ]},
      { title: "Local & Logística", fields: [
        { id: "locationType", type: "select", label: "Tipo de local preferido", options: ["Casa deles (lifestyle real)", "Parque/natureza", "Praia/lago", "Urbano/ruas", "Estúdio", "Sem preferência"] },
        { id: "homeDetails", type: "textarea", label: "Se em casa: cômodos favoritos, luz natural, cantinhos especiais" },
        { id: "timeOfDay", type: "select", label: "Melhor horário para as crianças", options: ["Manhã (mais dispostas)", "Após soneca", "Final de tarde (golden hour)", "Flexível"] },
        { id: "weatherPlan", type: "select", label: "Plano B para chuva", options: ["Remarcar", "Fazer em casa/coberto", "Topam chuva (guarda-chuva/botas)", "Decidir no dia"] },
      ]},
      { title: "Entrega & Memórias", fields: [
        { id: "printsWanted", type: "select", label: "Impressões/álbum", options: ["Sim, quero orçamento", "Já incluso", "Apenas digital", "Presente para avós"] },
        { id: "milestones", type: "textarea", label: "Marcos recentes (aniversário, primeiros passos, dente, escola, adoção)" },
        { id: "yearlyTradition", type: "select", label: "Fazem ensaio anual?", options: ["Sim, todo ano", "Às vezes", "Primeira vez", "Queremos começar"] },
      ]},
    ],
  },
  event: {
    title: "Questionário — Evento / Show",
    sections: [
      { title: "Detalhes do Evento", fields: [
        { id: "eventName", type: "text", label: "Nome do evento/show", required: true },
        { id: "eventType", type: "select", label: "Tipo", options: ["Show/banda", "Festival", "Corporativo", "Formatura", "Aniversário", "Esportivo", "Cultural/teatro", "Outro"] },
        { id: "venue", type: "text", label: "Local (nome + endereço)", required: true },
        { id: "capacity", type: "number", label: "Capacidade/público esperado" },
        { id: "stageLayout", type: "textarea", label: "Layout do palco (banda, DJ, palestrante, painel, passarela)" },
      ]},
      { title: "Acesso & Credenciamento", fields: [
        { id: "accessType", type: "select", label: "Tipo de acesso fotógrafo", options: ["Credencial total (palco+backstage+plateia)", "Palco + plateia", "Apenas plateia", "A definir"] },
        { id: "backstageAccess", type: "select", label: "Acesso ao backstage/camarim", options: ["Sim, completo", "Apenas 15min antes", "Não", "Não sei"] },
        { id: "contactPerson", type: "text", label: "Pessoa de contato no dia (nome + telefone)" },
        { id: "securityNotes", type: "textarea", label: "Restrições de segurança (áreas proibidas, flash, equipamento)" },
      ]},
      { title: "Programação & Momentos-Chave", fields: [
        { id: "schedule", type: "textarea", label: "Cronograma detalhado (horários: soundcheck, abertura, atrações, encerramento)" },
        { id: "keyMoments", type: "textarea", label: "Momentos que NÃO podem perder (entrada especial, solo, discurso, premiação, surpresa)" },
        { id: "vipGuests", type: "textarea", label: "Convidados VIP / imprensa / influenciadores a registrar" },
        { id: "lightingInfo", type: "select", label: "Informação de iluminação", options: ["Luz de show (móvel, colorida, strobe)", "Teatro (spots fixos)", "Luz natural/diurna", "Mista", "Não sei"] },
      ]},
      { title: "Entrega Urgente", fields: [
        { id: "sameDaySelect", type: "select", label: "Seleção no mesmo dia (redes sociais)", options: ["Sim, 30-50 fotos em 2h", "Sim, 10-15 fotos em 30min", "Não, prazo normal", "Apenas stories/Reels"] },
        { id: "socialTags", type: "textarea", label: "@handles e hashtags oficiais do evento/artista" },
        { id: "pressKit", type: "select", label: "Press kit necessário?", options: ["Sim, seleção para imprensa", "Não", "Apenas para artista/management"] },
      ]},
    ],
  },
};

const galleryTemplates: Record<ShootType, { title: string; sections: { name: string; order: number }[] }> = {
  wedding: { title: "Galeria de Casamento", sections: [{ name: "Making Of", order: 1 }, { name: "Cerimônia", order: 2 }, { name: "Retratos", order: 3 }, { name: "Recepção", order: 4 }, { name: "Detalhes", order: 5 }, { name: "Festa", order: 6 }] },
  portrait: { title: "Galeria de Retrato", sections: [{ name: "Look 1", order: 1 }, { name: "Look 2", order: 2 }, { name: "Look 3", order: 3 }, { name: "Variados", order: 4 }] },
  commercial: { title: "Galeria Comercial", sections: [{ name: "Headshots", order: 1 }, { name: "Produto", order: 2 }, { name: "Lifestyle", order: 3 }, { name: "Ambiente", order: 4 }] },
  family: { title: "Galeria Família", sections: [{ name: "Posadas", order: 1 }, { name: "Espontâneas", order: 2 }, { name: "Detalhes", order: 3 }, { name: "Pets", order: 4 }] },
  event: { title: "Galeria de Evento", sections: [{ name: "Palco", order: 1 }, { name: "Backstage", order: 2 }, { name: "Público", order: 3 }, { name: "Detalhes", order: 4 }, { name: "VIPs", order: 5 }] },
};

const invoiceTemplates: Record<ShootType, { title: string; items: InvoiceItem[] }> = {
  wedding: { title: "Fatura — Casamento", items: [{ description: "Cobertura fotográfica (até 10h)", quantity: 1, unitPrice: 8500 }, { description: "Tratamento de 600+ imagens", quantity: 1, unitPrice: 0 }, { description: "Galeria online (12 meses)", quantity: 1, unitPrice: 0 }, { description: "Álbum 30x30cm (opcional)", quantity: 1, unitPrice: 1200 }] },
  portrait: { title: "Fatura — Retrato / Book", items: [{ description: "Sessão fotográfica (até 2h)", quantity: 1, unitPrice: 1200 }, { description: "15 imagens finais tratadas", quantity: 1, unitPrice: 0 }, { description: "5 versões web otimizadas", quantity: 1, unitPrice: 0 }, { description: "Galeria online (12 meses)", quantity: 1, unitPrice: 0 }, { description: "Licença comercial (opcional)", quantity: 1, unitPrice: 360 }] },
  commercial: { title: "Fatura — Comercial / Corporativo", items: [{ description: "Produção fotográfica (4h)", quantity: 1, unitPrice: 4500 }, { description: "150+ imagens tratadas", quantity: 1, unitPrice: 0 }, { description: "Licença comercial perpétua (2 anos exclusiva)", quantity: 1, unitPrice: 0 }, { description: "Entrega via link seguro + backup", quantity: 1, unitPrice: 0 }, { description: "Despesas extras (deslocamento, hospedagem)", quantity: 1, unitPrice: 0 }] },
  family: { title: "Fatura — Família / Lifestyle", items: [{ description: "Sessão lifestyle (1.5h)", quantity: 1, unitPrice: 1800 }, { description: "50+ imagens tratadas", quantity: 1, unitPrice: 0 }, { description: "Galeria online (12 meses)", quantity: 1, unitPrice: 0 }, { description: "Álbum 20x20cm (opcional)", quantity: 1, unitPrice: 800 }, { description: "Impressões 15x21cm x10 (opcional)", quantity: 1, unitPrice: 250 }] },
  event: { title: "Fatura — Evento / Show", items: [{ description: "Cobertura de evento (até 5h)", quantity: 1, unitPrice: 2800 }, { description: "200+ imagens tratadas", quantity: 1, unitPrice: 0 }, { description: "Seleção urgente 48h (50 imagens)", quantity: 1, unitPrice: 0 }, { description: "Galeria protegida por senha", quantity: 1, unitPrice: 0 }, { description: "Deslocamento >50km (R$ 2/km)", quantity: 1, unitPrice: 0 }] },
};

// ===== UTILITIES =====
function t(key: string, lang: string): string {
  const dict = i18n[lang as keyof typeof i18n] as Record<string, string> | undefined;
  const fallback = i18n.pt as Record<string, string>;
  return dict?.[key] ?? fallback[key] ?? key;
}

function formatCurrency(value: number, lang: string = "pt"): string {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: "BRL" }).format(value);
}

function getStatusColor(status: ShootStatus): string {
  switch (status) {
    case "inquiry": return "bg-gray-600 text-gray-200 border-gray-500";
    case "booked": return "bg-amber-600 text-amber-50 border-amber-500";
    case "shot": return "bg-blue-600 text-blue-50 border-blue-500";
    case "culled": return "bg-purple-600 text-purple-50 border-purple-500";
    case "proofing": return "bg-orange-600 text-orange-50 border-orange-500";
    case "delivered": return "bg-green-600 text-green-50 border-green-500";
    case "paid": return "bg-emerald-600 text-emerald-50 border-emerald-500";
    case "today": return "bg-amber-500 text-amber-950 border-amber-400";
    default: return "bg-gray-600 text-gray-200 border-gray-500";
  }
}

function getStatusBadge(status: ShootStatus, lang: string): React.ReactElement {
  const labels = statusLabels[lang as keyof typeof statusLabels] || statusLabels.pt;
  return (
    <Badge className={`${getStatusColor(status)} text-xs font-mono uppercase tracking-wider px-2 py-0.5`}>
      {labels[status]}
    </Badge>
  );
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ===== HOOKS =====
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

// ===== COMPONENTS =====

// Placeholder Image Component
function PlaceholderImage({ type, className = "", size = "full" }: { type: CoverType; className?: string; size?: "full" | "thumb" }) {
  const gradients = {
    full: typeGradients[type],
    thumb: typeGradients[type],
  };
  const icons: Record<CoverType, React.ReactNode> = {
    wedding: <Users2 className="w-12 h-12" strokeWidth={1.5} />,
    portrait: <User className="w-12 h-12" strokeWidth={1.5} />,
    commercial: <Briefcase className="w-12 h-12" strokeWidth={1.5} />,
    family: <Users className="w-12 h-12" strokeWidth={1.5} />,
    event: <Music className="w-12 h-12" strokeWidth={1.5} />,
  };

  return (
    <div
      className={`relative overflow-hidden bg-elevated flex items-center justify-center ${className}`}
      style={{ background: gradients[size] }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
      <div className="relative z-10 text-muted/50">{icons[type]}</div>
      <div className="absolute bottom-2 right-2 text-xs font-mono text-muted/50 uppercase tracking-wider">
        {t(`form.${type}`, "pt")}
      </div>
    </div>
  );
}

// Shoot Card Component
interface ShootCardProps {
  shoot: Shoot;
  onClick: () => void;
  lang: string;
  isToday?: boolean;
}

function ShootCard({ shoot, onClick, lang, isToday, todayStr }: ShootCardProps & { todayStr: string }) {
  const isTodayShoot = shoot.date === todayStr || shoot.status === "today";

  return (
    <article
      className={`shoot-card-aspect relative overflow-hidden bg-elevated border border-border cursor-pointer touch-manipulation transition-all duration-200 active:scale-[0.98] ${isTodayShoot ? "border-2 border-amber-500 shadow-[0_0_0_2px_theme(colors.amber.500)]" : ""} ${shoot.status === "inquiry" ? "border-l-4 border-red-500" : shoot.status === "paid" ? "border-l-4 border-green-500" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }}}
      tabIndex={0}
      role="button"
      aria-label={`${shoot.client}, ${typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}, ${statusLabels[lang as keyof typeof statusLabels]?.[shoot.status] || shoot.status}`}
    >
      <PlaceholderImage type={shoot.cover} className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-medium text-lg text-foreground">{shoot.client}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-muted uppercase tracking-wider">{format(parseISO(shoot.date), "dd MMM", { locale: lang === "pt" ? ptBR : enUS })}</span>
            <span className="font-mono text-muted">·</span>
            <span className="font-mono text-muted">{shoot.time}</span>
          </div>
        </div>
      </div>
      {isTodayShoot && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-amber-950 px-2 py-1 rounded font-mono text-xs font-medium">
          <Sun className="w-3 h-3" />
          {t("today.shoot", lang)}
        </div>
      )}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {shoot.contract && !shoot.contractSigned && <Badge className="bg-red-600/90 text-red-50 text-xs" variant="outline"><FileText className="w-3 h-3 mr-1" />{t("panel.contract", lang)}</Badge>}
        {shoot.contractSigned && <Badge className="bg-green-600/90 text-green-50 text-xs" variant="outline"><CheckCircle className="w-3 h-3 mr-1" />{t("status.signed", lang)}</Badge>}
        {shoot.deposit && !shoot.balance && <Badge className="bg-amber-600/90 text-amber-50 text-xs" variant="outline"><DollarSign className="w-3 h-3 mr-1" />{t("panel.deposit", lang)}</Badge>}
        {shoot.balance && <Badge className="bg-emerald-600/90 text-emerald-50 text-xs" variant="outline"><CheckCircle className="w-3 h-3 mr-1" />{t("panel.balance", lang)}</Badge>}
        {shoot.gallery && <Badge className="bg-blue-600/90 text-blue-50 text-xs" variant="outline"><ImageIcon className="w-3 h-3 mr-1" />{t("panel.gallery", lang)}</Badge>}
      </div>
    </article>
  );
}

// Panel Component (Wall Label)
interface PanelProps {
  shoot: Shoot | null;
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  lang: string;
}

function Panel({ shoot, client, isOpen, onClose, onAction, lang }: PanelProps) {
  if (!shoot || !isOpen) return null;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isTodayShoot = shoot.date === todayStr || shoot.status === "today";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 opacity-0 transition-opacity duration-300 panel__backdrop"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border panel-max-h flex flex-col overscroll-contain transition-transform duration-350 ease-out ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("shoot.details", lang)}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2 touch-none" aria-hidden="true" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid gap-5 md:grid-cols-[60%_40%] md:gap-6">
          {/* Image Side */}
          <div className="md:col-span-1">
            <div className="shoot-card-aspect relative overflow-hidden bg-elevated">
              <PlaceholderImage type={shoot.cover} className="w-full h-full" />
              {isTodayShoot && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-amber-950 px-2 py-1 rounded font-mono text-xs font-medium">
                  <Sun className="w-3 h-3" />
                  {t("today.shoot", lang)}
                </div>
              )}
            </div>
          </div>

          {/* Metadata Side */}
          <div className="md:col-span-1 md:border-l md:border-border md:pl-6 pt-2 space-y-5">
            {/* Client & Type */}
            <div>
              <p className="font-mono text-xs text-muted uppercase tracking-widest">{t("form.client", lang)}</p>
              <h2 className="font-display font-medium text-2xl text-foreground mt-1">{shoot.client}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="font-mono text-xs">{typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}</Badge>
                <Badge variant="outline" className="font-mono text-xs">{format(parseISO(shoot.date), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</Badge>
                <Badge variant="outline" className="font-mono text-xs">{shoot.time}</Badge>
              </div>
            </div>

            {/* Status & Progress */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">{t("panel.contract", lang)}</span>
                <div className="flex items-center gap-2">
                  {shoot.contract ? (
                    shoot.contractSigned ? (
                      <>
                        <Badge className="bg-green-600/20 text-green-400 border-green-500/50 text-xs font-mono"><CheckCircle className="w-3 h-3 mr-1" />{t("status.signed", lang)}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => onAction("viewContract")} className="h-8 px-2">{t("panel.viewContract", lang)}</Button>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-red-600/20 text-red-400 border-red-500/50 text-xs font-mono"><FileText className="w-3 h-3 mr-1" />{t("status.pending", lang)}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => onAction("sendContract")} className="h-8 px-2">{t("panel.sendContract", lang)}</Button>
                      </>
                    )
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => onAction("sendContract")} className="h-8 px-2">{t("panel.sendContract", lang)}</Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">{t("panel.questionnaire", lang)}</span>
                <div className="flex items-center gap-2">
                  {shoot.questionnaire ? (
                    <>
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50 text-xs font-mono"><CheckCircle className="w-3 h-3 mr-1" />{t("status.ready", lang)}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => onAction("viewQuestionnaire")} className="h-8 px-2">{t("panel.viewQuestionnaire", lang)}</Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => onAction("sendQuestionnaire")} className="h-8 px-2">{t("panel.sendQuestionnaire", lang)}</Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">{t("panel.deposit", lang)}</span>
                <div className="flex items-center gap-2">
                  {shoot.deposit ? (
                    <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/50 text-xs font-mono"><DollarSign className="w-3 h-3 mr-1" />{t("status.paid", lang)}</Badge>
                  ) : (
                    <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/50 text-xs font-mono">{t("status.pending", lang)}</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">{t("panel.balance", lang)}</span>
                <div className="flex items-center gap-2">
                  {shoot.balance ? (
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/50 text-xs font-mono"><CheckCircle className="w-3 h-3 mr-1" />{t("status.paid", lang)}</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => onAction("markPaid")} className="h-8 px-2">{t("panel.markPaid", lang)}</Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">{t("panel.gallery", lang)}</span>
                <div className="flex items-center gap-2">
                  {shoot.gallery ? (
                    <Button variant="ghost" size="sm" onClick={() => onAction("viewGallery")} className="h-8 px-2">{t("panel.viewGallery", lang)}</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => onAction("uploadGallery")} className="h-8 px-2">{t("panel.uploadGallery", lang)}</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Notes */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <p className="font-mono text-xs text-muted uppercase tracking-wider">{t("form.location", lang)}</p>
                <p className="text-sm text-foreground mt-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-muted" />{shoot.location}</p>
              </div>
              {shoot.notes && (
                <div>
                  <p className="font-mono text-xs text-muted uppercase tracking-wider">{t("form.notes", lang)}</p>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{shoot.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button onClick={() => onAction("editShoot")} variant="outline" className="w-full justify-start gap-2"><Edit className="w-4 h-4" />{t("edit.shoot", lang)}</Button>
              <Button onClick={() => onAction("deleteShoot")} variant="destructive" className="w-full justify-start gap-2"><Trash2 className="w-4 h-4" />{t("clients.delete", lang)}</Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Tab Bar Component
function TabBar({ currentTab, onTabChange, lang, showFAB, onFABClick }: { currentTab: string; onTabChange: (tab: string) => void; lang: string; showFAB: boolean; onFABClick: () => void }) {
  const tabs = [
    { id: "today", icon: Home, label: t("tab.today", lang) },
    { id: "archive", icon: Archive, label: t("tab.archive", lang) },
    { id: "clients", icon: Users, label: t("tab.clients", lang) },
    { id: "calendar", icon: CalendarIcon, label: t("tab.calendar", lang) },
    { id: "insights", icon: BarChart3, label: t("tab.insights", lang) },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-around tab-bar-h" role="navigation" aria-label={t("menu.actions", lang)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab flex flex-col items-center gap-1 px-3 py-1 transition-colors duration-150 touch-manipulation ${currentTab === tab.id ? "text-foreground" : "text-muted"}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={currentTab === tab.id ? "page" : undefined}
            data-tab={tab.id}
          >
            <tab.icon className="w-5 h-5 stroke-2" strokeWidth={2} />
            <span className="tab__label hidden sm:block font-ui font-medium text-xs">{tab.label}</span>
          </button>
        ))}
      </nav>
      {showFAB && (
        <Button
          onClick={onFABClick}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg"
          aria-label={t("menu.create", lang)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}

// Empty State
function EmptyState({ title, text, ctaLabel, onCtaClick, icon: Icon, className }: { title: string; text: string; ctaLabel: string; onCtaClick: () => void; icon: React.ElementType; className?: string }) {
  return (
    <div className={`empty-state flex flex-col items-center justify-center min-h-[60vh] text-center px-8 ${className || ""}`} role="status">
      <Icon className="empty-state__icon w-20 h-20 text-muted/50 mb-4" strokeWidth={1.5} />
      <h2 className="empty-state__title font-display font-light text-2xl mb-2 text-foreground">{title}</h2>
      <p className="empty-state__text text-base max-w-xs leading-loose text-muted">{text}</p>
      <Button className="empty-state__cta mt-5" onClick={onCtaClick} size="lg">
        <Plus className="w-4 h-4 mr-2" />{ctaLabel}
      </Button>
    </div>
  );
}

// New Shoot Modal
interface NewShootModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Shoot>) => void;
  clients: Client[];
  lang: string;
  editingShoot?: Shoot | null;
}

function NewShootModal({ open, onClose, onSubmit, clients, lang, editingShoot }: NewShootModalProps) {
  const [formData, setFormData] = useState<{
    client: string;
    date: string;
    time: string;
    type: ShootType;
    location: string;
    notes: string;
  }>({
    client: editingShoot?.client || "",
    date: "",
    time: editingShoot?.time || "14:00",
    type: (editingShoot?.type as ShootType) || "portrait",
    location: editingShoot?.location || "",
    notes: editingShoot?.notes || "",
  });

  useEffect(() => {
    if (editingShoot) {
      setFormData({
        client: editingShoot.client,
        date: editingShoot.date,
        time: editingShoot.time,
        type: editingShoot.type,
        location: editingShoot.location,
        notes: editingShoot.notes,
      });
    } else if (!formData.date) {
      setFormData(prev => ({ ...prev, date: format(new Date(), "yyyy-MM-dd") }));
    }
  }, [editingShoot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: editingShoot?.id || generateId() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{editingShoot ? t("edit.shoot", lang) : t("modal.newShoot", lang)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.client", lang)}</Label>
            <Select value={formData.client} onValueChange={(v) => setFormData(prev => ({ ...prev, client: v || "" }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectType", lang)} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.date", lang)}</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.time", lang)}</Label>
              <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.type", lang)}</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as ShootType }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectType", lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wedding">{t("form.wedding", lang)}</SelectItem>
                <SelectItem value="portrait">{t("form.portrait", lang)}</SelectItem>
                <SelectItem value="commercial">{t("form.commercial", lang)}</SelectItem>
                <SelectItem value="family">{t("form.family", lang)}</SelectItem>
                <SelectItem value="event">{t("form.event", lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.location", lang)}</Label>
            <Input id="location" placeholder={t("form.location", lang)} value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.notes", lang)}</Label>
            <Textarea id="notes" placeholder={t("form.notes", lang)} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("modal.cancel", lang)}</Button>
          <Button type="submit" form="formNewShoot" disabled={!formData.client || !formData.date}>{editingShoot ? t("modal.save", lang) : t("modal.create", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Client Modal
interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Client>) => void;
  client?: Client | null;
  lang: string;
}

function ClientModal({ open, onClose, onSubmit, client, lang }: ClientModalProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    tags: client?.tags.join(", ") || "",
    notes: client?.notes || "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        tags: client.tags.join(", "),
        notes: client.notes,
      });
    } else {
      setFormData({ name: "", email: "", phone: "", tags: "", notes: "" });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: client?.id || generateId(),
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      totalShoots: client?.totalShoots || 0,
      totalSpent: client?.totalSpent || 0,
      lastContact: format(new Date(), "yyyy-MM-dd"),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{client ? t("clients.edit", lang) : t("clients.new", lang)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.client", lang)}</Label>
            <Input id="name" placeholder={t("form.client", lang)} value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted">{t("clients.email", lang)}</Label>
              <Input id="email" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-mono text-xs uppercase tracking-wider text-muted">{t("clients.phone", lang)}</Label>
              <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags" className="font-mono text-xs uppercase tracking-wider text-muted">{t("clients.tags", lang)}</Label>
            <Input id="tags" placeholder={t("clients.tags", lang)} value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-mono text-xs uppercase tracking-wider text-muted">{t("form.notes", lang)}</Label>
            <Textarea id="notes" placeholder={t("form.notes", lang)} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
          </div>
        </form>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("modal.cancel", lang)}</Button>
          <Button type="submit" form="clientForm" disabled={!formData.name}>{t("modal.save", lang)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Toast Component
function ToastComponent({ message, type = "default" }: { message: string; type?: "default" | "success" | "error" }) {
  const icons = {
    default: <Info className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };
  return (
    <div className="flex items-start gap-3 p-4 bg-popover border border-border rounded-xl shadow-lg">
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

// Calendar View
interface CalendarViewProps {
  shoots: Shoot[];
  lang: string;
  onDateClick: (date: string, dayShoots: Shoot[]) => void;
}

function CalendarView({ shoots, lang, onDateClick }: CalendarViewProps) {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const monthNames = lang === "pt" ? ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = lang === "pt" ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const shootsByDate: Record<string, Shoot[]> = {};
  shoots.forEach(s => {
    if (!shootsByDate[s.date]) shootsByDate[s.date] = [];
    shootsByDate[s.date].push(s);
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isMonthView = view === "month";

  if (!currentDate) {
    return <div className="calendar-view" aria-busy="true" />;
  }

  if (isMonthView) {
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const startDay = getDay(firstDay);
    const daysInMonth = getDate(lastDay);
    const prevMonthDays = getDate(endOfMonth(subMonths(currentDate, 1)));

    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = Array(startDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(getYear(currentDate), getMonth(currentDate), i);
      week.push(date);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return (
      <div className="calendar-view space-y-4">
        <header className="calendar-header flex items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))} aria-label={t("calendar.prevMonth", lang)}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="calendar-title flex flex-col items-center gap-1">
            <h2 className="calendar-month font-display text-2xl text-foreground">{monthNames[getMonth(currentDate)]}</h2>
            <span className="calendar-year font-mono text-xs text-muted">{getYear(currentDate)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))} aria-label={t("calendar.nextMonth", lang)}><ChevronRight className="w-4 h-4" /></Button>
        </header>

        <div className="calendar-view-toggle flex bg-muted border border-border rounded px-1">
          <Button variant={isMonthView ? "default" : "ghost"} size="sm" className="flex-1" onClick={() => setView("month")}>{t("calendar.month", lang)}</Button>
          <Button variant={isMonthView ? "ghost" : "default"} size="sm" className="flex-1" onClick={() => setView("week")}>{t("calendar.week", lang)}</Button>
        </div>

        <div className="calendar-grid overflow-x-auto px-4">
          <div className="calendar-weekdays grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day, i) => (
              <div key={i} className="calendar-weekday text-center font-mono text-xs uppercase tracking-wider text-muted py-2">{day}</div>
            ))}
          </div>
          <div className="calendar-days grid grid-cols-7 gap-1">
            {weeks.map((week, w) => week.map((date, d) => {
              if (!date) return <div key={`${w}-${d}`} className="calendar-day other-month aspect-square" />;
              const dateStr = format(date, "yyyy-MM-dd");
              const dayShoots = shootsByDate[dateStr] || [];
              const isTodayDay = isToday(date);
              const isPastDay = isPast(date) && !isTodayDay;
              const isOtherMonth = getMonth(date) !== getMonth(currentDate);

              return (
                <button
                  key={dateStr}
                  className={`calendar-day aspect-square relative bg-elevated border border-border rounded touch-manipulation transition-all duration-150 ${isTodayDay ? "border-amber-500" : ""} ${isPastDay ? "opacity-60" : ""} ${isOtherMonth ? "opacity-40" : ""} hover:border-muted hover:bg-background`}
                  onClick={() => onDateClick(dateStr, dayShoots)}
                >
                  <span className={`calendar-day-number font-mono font-medium ${isTodayDay ? "text-amber-500" : "text-foreground"}`}>{getDate(date)}</span>
                  {isTodayDay && <span className="calendar-today-ring absolute top-1 right-1 w-2 h-2 border-2 border-amber-500 rounded-full" />}
                  <div className="calendar-day-shoots flex flex-wrap justify-center gap-1 mt-1 w-full">
                    {dayShoots.slice(0, 3).map(s => (
                      <span key={s.id} className="calendar-shoot-dot w-2 h-2 rounded-full flex-shrink-0" style={{ background: `var(--accent-${s.type})` }} />
                    ))}
                    {dayShoots.length > 3 && <span className="calendar-shoot-more font-mono text-xs text-muted">+{dayShoots.length - 3}</span>}
                  </div>
                </button>
              );
            }))}
          </div>
        </div>
      </div>
    );
  } else {
    // Week view
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="calendar-view space-y-4">
        <header className="calendar-header flex items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subWeeks(currentDate, 1))} aria-label={t("calendar.prevMonth", lang)}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="calendar-title flex flex-col items-center gap-1">
            <h2 className="calendar-month font-display text-2xl text-foreground">{format(weekStart, "dd MMM", { locale: lang === "pt" ? ptBR : enUS })} - {format(endOfWeek(currentDate, { weekStartsOn: 0 }), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addWeeks(currentDate, 1))} aria-label={t("calendar.nextMonth", lang)}><ChevronRight className="w-4 h-4" /></Button>
        </header>

        <div className="calendar-view-toggle flex bg-muted border border-border rounded px-1">
          <Button variant={isMonthView ? "default" : "ghost"} size="sm" className="flex-1" onClick={() => setView("month")}>{t("calendar.month", lang)}</Button>
          <Button variant={isMonthView ? "ghost" : "default"} size="sm" className="flex-1" onClick={() => setView("week")}>{t("calendar.week", lang)}</Button>
        </div>

        <div className="calendar-week grid grid-cols-7 gap-1 px-4 overflow-x-auto">
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayShoots = shootsByDate[dateStr] || [];
            const isTodayDay = isToday(day);
            const isPastDay = isPast(day) && !isTodayDay;

            return (
              <div key={dateStr} className={`calendar-week-day bg-elevated border border-border rounded flex flex-col min-h-[200px] relative ${isTodayDay ? "border-amber-500" : ""} ${isPastDay ? "opacity-60" : ""}`}>
                <div className="calendar-week-day-header flex flex-col items-center p-2 border-b border-border">
                  <span className={`calendar-week-day-name font-mono text-xs uppercase tracking-wider ${isTodayDay ? "text-amber-500" : "text-muted"}`}>{dayNames[getDay(day)]}</span>
                  <span className={`calendar-week-day-number font-display font-medium text-xl ${isTodayDay ? "text-amber-500" : "text-foreground"}`}>{getDate(day)}</span>
                </div>
                {isTodayDay && <div className="calendar-week-today-line absolute top-0 left-0 right-0 h-1 bg-amber-500 rounded-t" />}
                <div className="calendar-week-day-body flex-1 p-2 overflow-y-auto">
                  <div className="calendar-week-shoots flex flex-col gap-1">
                    {dayShoots.map(s => (
                      <button key={s.id} className="calendar-week-shoot flex items-center gap-2 p-2 bg-background border border-border rounded touch-manipulation text-left w-full transition-colors hover:border-muted" onClick={(e) => { e.stopPropagation(); onDateClick(dateStr, [s]); }}>
                        <span className="calendar-week-shoot-time font-mono text-xs text-muted min-w-[40px]">{s.time}</span>
                        <span className="calendar-week-shoot-client font-ui text-sm font-medium text-foreground truncate">{s.client}</span>
                        <Badge className="ml-auto text-xs font-mono" variant="outline">{typeLabels[lang as keyof typeof typeLabels]?.[s.type] || s.type}</Badge>
                      </button>
                    ))}
                    {dayShoots.length === 0 && (
                      <div className="text-center py-4 text-muted text-sm">{t("empty.text", lang)}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

// Helper function for addDays
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Insights View
function InsightsView({ shoots, clients, lang }: { shoots: Shoot[]; clients: Client[]; lang: string }) {
  const total = shoots.length;
  const booked = shoots.filter(s => s.status === "booked").length;
  const shot = shoots.filter(s => s.status === "shot").length;
  const delivered = shoots.filter(s => s.status === "delivered" || s.status === "paid").length;
  const paid = shoots.filter(s => s.status === "paid").length;
  const pending = shoots.filter(s => s.status === "booked" && s.deposit && !s.balance).length;
  const revenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const conversion = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const stats = [
    { label: t("insights.total", lang), value: total, icon: LayoutGrid },
    { label: t("insights.booked", lang), value: booked, icon: CalendarDays },
    { label: t("insights.shot", lang), value: shot, icon: Camera },
    { label: t("insights.delivered", lang), value: delivered, icon: CheckCircle },
    { label: t("insights.paid", lang), value: paid, icon: DollarSign },
    { label: t("insights.pending", lang), value: pending, icon: AlertCircle },
    { label: t("insights.revenue", lang), value: formatCurrency(revenue, lang), icon: DollarSign },
    { label: t("insights.conversion", lang), value: `${conversion}%`, icon: BarChart3 },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="font-display text-2xl text-foreground">{t("tab.insights", lang)}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-elevated border border-border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-muted" />
            </div>
            <p className="font-display text-2xl font-medium text-foreground">{stat.value}</p>
            <p className="font-mono text-xs text-muted uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline by type */}
      <div className="bg-elevated border border-border rounded p-4">
        <h2 className="font-display text-lg mb-4">{t("insights.total", lang)} por tipo</h2>
        <div className="space-y-3">
          {(["wedding", "portrait", "commercial", "family", "event"] as ShootType[]).map(type => {
            const typeShoots = shoots.filter(s => s.type === type);
            const count = typeShoots.length;
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: typeGradients[type] }}>
                  {typeIcons[type]}
                </div>
                <span className="font-ui font-medium text-sm flex-1">{typeLabels[lang as keyof typeof typeLabels]?.[type] || type}</span>
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-primary rounded" style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
                </div>
                <span className="font-mono text-sm text-muted w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Clients View
function ClientsView({ clients, shoots, lang, onClientClick, onNewClient, onEditClient, onDeleteClient }: {
  clients: Client[];
  shoots: Shoot[];
  lang: string;
  onClientClick: (client: Client) => void;
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (filtered.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="clients-header sticky top-0 z-10 bg-background border-b border-border px-4 py-3 mb-4 -mx-4">
          <Input
            placeholder={t("clients.search", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            aria-label={t("clients.search", lang)}
          />
        </div>
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
    <div className="flex-1 overflow-y-auto p-4 pb-20">
      <div className="clients-header sticky top-0 z-10 bg-background border-b border-border px-4 py-3 mb-4 -mx-4">
        <Input
          placeholder={t("clients.search", lang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
          aria-label={t("clients.search", lang)}
        />
      </div>
      <div className="clients-list space-y-3">
        {filtered.map(client => {
          const clientShoots = shoots.filter(s => s.client === client.name);
          const upcomingShoots = clientShoots.filter(s => s.date >= format(new Date(), "yyyy-MM-dd") && s.status !== "delivered" && s.status !== "paid").length;
          const statusBadge = upcomingShoots > 0 ? "booked" : clientShoots.length > 0 ? "delivered" : "inquiry";
          const statusText = upcomingShoots > 0 ? `${upcomingShoots} ${t("clients.upcoming", lang)}` : clientShoots.length > 0 ? t("clients.completed", lang) : t("clients.new", lang);

          return (
            <article
              key={client.id}
              className="client-card grid grid-cols-[56px_1fr_48px] gap-3 items-center bg-elevated border border-border rounded p-3 touch-manipulation transition-all duration-150 hover:border-muted hover:bg-background cursor-pointer"
              onClick={() => onClientClick(client)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClientClick(client); }}}
              tabIndex={0}
              role="listitem"
              aria-label={`${client.name}, ${client.totalShoots} ${t("clients.shoots", lang)}, ${formatCurrency(client.totalSpent, lang)}`}
            >
              <div className="client-card__avatar w-14 h-14 rounded-full bg-border flex items-center justify-center flex-shrink-0">
                <span className="client-initial font-display font-medium text-xl text-muted">{getInitials(client.name)}</span>
              </div>
              <div className="client-card__info min-w-0">
                <h3 className="client-card__name font-display font-medium text-lg text-foreground truncate">{client.name}</h3>
                <div className="client-card__meta flex flex-col gap-1 mt-1">
                  <span className="client-card__email text-sm text-muted truncate">{client.email}</span>
                  <span className="client-card__phone font-mono text-xs text-muted">{client.phone}</span>
                </div>
                <div className="client-card__tags flex flex-wrap gap-1 mt-2">
                  {client.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="font-mono text-xs text-muted border-border">{tag}</Badge>
                  ))}
                </div>
                <div className="client-card__stats flex flex-wrap items-center gap-2 mt-2">
                  <span className="client-stat font-mono text-xs text-muted">{client.totalShoots} {t("clients.shoots", lang)}</span>
                  <span className="client-stat font-mono text-xs text-muted">{formatCurrency(client.totalSpent, lang)}</span>
                  <Badge className={`${getStatusColor(statusBadge as ShootStatus)} text-xs font-mono uppercase tracking-wider px-2 py-0.5`}>{statusText}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="client-card__actions w-10 h-10 flex items-center justify-center bg-transparent border border-border rounded text-muted hover:border-foreground hover:text-foreground transition-colors" aria-label={t("clients.actions", lang)}>
                      <MoreHorizontal className="w-5 h-5" />
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

// Main App Component
export default function LenteApp() {
  const [shoots, setShoots] = useLocalStorage<Shoot[]>(SHOOTS_KEY, defaultShoots);
  const [clients, setClients] = useLocalStorage<Client[]>(CLIENTS_KEY, defaultClients);
  const [settings, setSettings] = useLocalStorage<{ lang: string; theme: string; lastSync: string | null }>(SETTINGS_KEY, { lang: "pt", theme: "system", lastSync: null });
  const [currentTab, setCurrentTab] = useState("today");
  const [panelShoot, setPanelShoot] = useState<Shoot | null>(null);
  const [panelClient, setPanelClient] = useState<Client | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [newShootOpen, setNewShootOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState<Shoot | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [syncStatus, setSyncStatus] = useState<"online" | "offline" | "syncing">("offline");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "default" | "success" | "error" }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [todayStr, setTodayStr] = useState<string>("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarDayShoots, setCalendarDayShoots] = useState<Shoot[]>([]);
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);

  // Initialize calendarDate and todayStr on client side
  useEffect(() => {
    const now = new Date();
    setCalendarDate(now);
    setTodayStr(format(now, "yyyy-MM-dd"));
  }, []);

  const lang = settings.lang;
  const tLang = (key: string) => t(key, lang);

  // Sync simulation
  useEffect(() => {
    const handleOnline = () => { setSyncStatus("online"); simulateSync(); };
    const handleOffline = () => setSyncStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setSyncStatus(navigator.onLine ? "online" : "offline");
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  const simulateSync = useCallback(() => {
    setSyncStatus("syncing");
    setTimeout(() => {
      setSyncStatus("online");
      setSettings(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      showToast(tLang("toast.synced"), "success");
    }, 1000);
  }, [setSettings, lang]);

  const showToast = useCallback((message: string, type: "default" | "success" | "error" = "default") => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handlers
  const handleShootClick = (shoot: Shoot) => {
    setPanelShoot(shoot);
    setPanelClient(clients.find(c => c.name === shoot.client) || null);
    setPanelOpen(true);
  };

  const handlePanelAction = (action: string) => {
    if (!panelShoot) return;
    switch (action) {
      case "viewContract":
        // Open contract modal
        showToast(tLang("toast.openingGallery"), "default");
        break;
      case "sendContract":
        setShoots(prev => prev.map(s => s.id === panelShoot.id ? { ...s, contract: true } : s));
        showToast(tLang("toast.contractSent"), "success");
        break;
      case "viewQuestionnaire":
        showToast(tLang("toast.openingGallery"), "default");
        break;
      case "sendQuestionnaire":
        setShoots(prev => prev.map(s => s.id === panelShoot.id ? { ...s, questionnaire: true } : s));
        showToast(tLang("toast.questionnaireSent"), "success");
        break;
      case "markPaid":
        setShoots(prev => prev.map(s => s.id === panelShoot.id ? { ...s, balance: true, status: "paid" } : s));
        showToast(tLang("toast.markedPaid"), "success");
        break;
      case "viewGallery":
        showToast(tLang("toast.openingGallery"), "default");
        break;
      case "uploadGallery":
        showToast(tLang("toast.openingGallery"), "default");
        break;
      case "editShoot":
        setEditingShoot(panelShoot);
        setNewShootOpen(true);
        setPanelOpen(false);
        break;
      case "deleteShoot":
        if (confirm(tLang("delete.confirm"))) {
          setShoots(prev => prev.filter(s => s.id !== panelShoot.id));
          setPanelOpen(false);
          showToast("Shoot excluído", "success");
        }
        break;
    }
  };

  const handleNewShoot = (data: Partial<Shoot>) => {
    const clientData = clients.find(c => c.name === data.client);
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
    if (editingShoot) {
      setShoots(prev => prev.map(s => s.id === editingShoot.id ? { ...s, ...newShoot } : s));
      showToast("Shoot atualizado", "success");
    } else {
      setShoots(prev => [newShoot, ...prev]);
      showToast(tLang("toast.created"), "success");
    }
    setEditingShoot(null);
  };

  const handleNewClient = (data: Partial<Client>) => {
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...data } : c));
      showToast(tLang("toast.clientUpdated"), "success");
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
      setClients(prev => [newClient, ...prev]);
      showToast(tLang("toast.clientCreated"), "success");
    }
    setEditingClient(null);
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(tLang("clients.confirmDelete"))) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      showToast(tLang("toast.clientDeleted"), "success");
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

  return (
    <TooltipProvider>
      <div className="app min-h-screen flex flex-col bg-background text-foreground">
        {/* Sync Indicator */}
        <div className="fixed top-2 right-2 z-30 flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-full text-xs font-mono text-muted transition-all duration-300">
          <span className={`w-2 h-2 rounded-full ${syncStatus === "online" ? "bg-green-500" : syncStatus === "syncing" ? "bg-amber-500 animate-pulse" : "bg-muted-foreground"}`} />
          <span>{syncStatus === "online" ? tLang("sync.online") : syncStatus === "syncing" ? tLang("sync.syncing") : tLang("sync.offline")}</span>
          {syncStatus === "offline" && <Button variant="ghost" size="sm" className="h-6 px-2 py-0" onClick={simulateSync}>{tLang("sync.now")}</Button>}
        </div>

        {/* Offline Banner */}
        {syncStatus === "offline" && (
          <div className="fixed top-16 left-2 right-2 z-20 bg-amber-600/90 backdrop-blur-sm text-amber-950 px-4 py-2 rounded-lg text-sm font-medium text-center border border-amber-500/50">
            <WifiOff className="w-4 h-4 inline mr-2" />{tLang("offline.banner")}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-0" role="main">
          {currentTab === "today" || currentTab === "archive" ? (
            <div className="grid grid-masonry-2" id="shootGrid" role="list" aria-label={tLang("tab.today") === "Hoje" ? "Hoje" : "Arquivo"}>
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
              onClientClick={(client) => { setPanelClient(client); setPanelShoot(null); setPanelOpen(true); }}
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
            <InsightsView shoots={shoots} clients={clients} lang={lang} />
          ) : null}
        </main>

        {/* Panel */}
        <Panel
          shoot={panelShoot}
          client={panelClient}
          isOpen={panelOpen}
          onClose={() => { setPanelOpen(false); setPanelShoot(null); setPanelClient(null); }}
          onAction={handlePanelAction}
          lang={lang}
        />

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
          <div className="fixed bottom-4 right-4 z-40">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button className="w-14 h-14 rounded-full shadow-lg" aria-label={tLang("menu.create")}>
                  <Plus className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => { setEditingShoot(null); setNewShootOpen(true); }} className="flex items-center gap-2"><Camera className="w-4 h-4" />{tLang("add.shoot")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setEditingClient(null); setClientModalOpen(true); }} className="flex items-center gap-2"><User className="w-4 h-4" />{tLang("add.client")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => simulateSync()} className="flex items-center gap-2"><RefreshCw className="w-4 h-4" />{tLang("menu.sync")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentTab("settings")} className="flex items-center gap-2"><Settings className="w-4 h-4" />{tLang("menu.settings")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Calendar Day Sheet */}
        {showCalendarSheet && selectedCalendarDate && (
          <Sheet open={showCalendarSheet} onOpenChange={handleCalendarSheetClose}>
            <SheetContent className="max-h-[60vh]" side="bottom">
              <SheetHeader>
                <SheetTitle className="font-display">{format(parseISO(selectedCalendarDate), "dd MMM yyyy", { locale: lang === "pt" ? ptBR : enUS })}</SheetTitle>
              </SheetHeader>
              <div className="space-y-2">
                {calendarDayShoots.length === 0 ? (
                  <p className="text-center text-muted py-8">{tLang("empty.text")}</p>
                ) : (
                  calendarDayShoots.map(shoot => (
                    <button key={shoot.id} className="w-full text-left p-3 bg-elevated border border-border rounded touch-manipulation transition-colors hover:border-muted" onClick={() => { handleCalendarSheetClose(); handleShootClick(shoot); }}>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-medium">{shoot.client}</span>
                        <Badge variant="outline" className="font-mono text-xs">{typeLabels[lang as keyof typeof typeLabels]?.[shoot.type] || shoot.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted mt-1">
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

        {/* Toasts */}
        <Toaster>
          {toasts.map(toast => (
            <ToastComponent key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </Toaster>
      </div>
    </TooltipProvider>
  );
}