"use client";

// ===== TIPOS =====

import React from "react";
import {
  Music,
  Users2,
  User,
  Users,
  Briefcase,
  Cake,
  GraduationCap,
  Heart,
  Trophy,
  Theater,
  Globe,
  Camera as CameraIcon,
  Image,
  Target,
} from "lucide-react";

export type ShootType = "wedding" | "portrait" | "commercial" | "family" | "event";
export type ShootStatus = "inquiry" | "booked" | "shot" | "culled" | "proofing" | "delivered" | "paid" | "today";
export type CoverType = "wedding" | "portrait" | "commercial" | "family" | "event";

export type ShootSubcategory =
  | "show"
  | "festival"
  | "corporate"
  | "birthday"
  | "wedding-party"
  | "graduation"
  | "sports"
  | "cultural";

export interface ContractData {
  template: ShootType;
  signedAt: string;
  signedBy: string;
  signature: string;
}

export interface Shoot {
  id: string;
  client: string;
  date: string;
  time: string;
  type: ShootType;
  subcategory?: ShootSubcategory;
  eventTitle?: string;
  platform?: string;
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
  amount?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  totalShoots: number;
  totalSpent: number;
  lastContact: string;
  notes: string;
  photoURL?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentType: string;
  installments?: number;
  createdAt: string;
}

export interface GallerySection {
  name: string;
  order: number;
  images: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  selected: boolean;
  favorite: boolean;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

// ===== MAPAS =====

export const eventSubcategories: Record<ShootSubcategory, { label: string; icon: React.ElementType }> = {
  show: { label: "Show / Concerto", icon: Music },
  festival: { label: "Festival", icon: Users2 },
  corporate: { label: "Evento Corporativo", icon: Briefcase },
  birthday: { label: "Aniversário", icon: Cake },
  graduation: { label: "Formatura", icon: GraduationCap },
  "wedding-party": { label: "Festa de Casamento", icon: Heart },
  sports: { label: "Esportivo", icon: Trophy },
  cultural: { label: "Cultural / Teatro", icon: Theater },
};

export const photographerPlatforms: Record<string, { label: string; icon: React.ElementType }> = {
  "portfolio-web": { label: "Portfolio Web", icon: Globe },
  fotop: { label: "Fotop", icon: CameraIcon },
  banlek: { label: "Banlek", icon: Image },
  "foco-radical": { label: "Foco Radical", icon: Target },
  fotto: { label: "Fotto", icon: Image },
};

// ===== SMALL MAPS (kept in page for now, may move here) =====

export const typeIcons: Record<ShootType, React.ReactNode> = {
  wedding: <Users2 className="w-6 h-6" strokeWidth={1.5} />,
  portrait: <User className="w-6 h-6" strokeWidth={1.5} />,
  commercial: <Briefcase className="w-6 h-6" strokeWidth={1.5} />,
  family: <Users className="w-6 h-6" strokeWidth={1.5} />,
  event: <Music className="w-6 h-6" strokeWidth={1.5} />,
};

export const statusLabels = {
  pt: { inquiry: "Contato", booked: "Agendado", shot: "Fotografado", culled: "Selecionado", proofing: "Prova", delivered: "Entregue", paid: "Pago", today: "Hoje" },
  en: { inquiry: "Inquiry", booked: "Booked", shot: "Shot", culled: "Culled", proofing: "Proofing", delivered: "Delivered", paid: "Paid", today: "Today" },
};

export const typeLabels = {
  pt: { wedding: "Casamento", portrait: "Retrato", commercial: "Comercial", family: "Família", event: "Evento" },
  en: { wedding: "Wedding", portrait: "Portrait", commercial: "Commercial", family: "Family", event: "Event" },
};

// ===== DEFAULTS =====

export const defaultShoots: Shoot[] = [
  { id: "1", client: "Maria & João", date: "2026-11-15", time: "14:00", type: "wedding", location: "Igreja São Francisco, SP", status: "booked", cover: "wedding", notes: "Cerimônia 16h, festa 20h. First look no jardim. Drone autorizado.", contract: true, contractSigned: true, contractData: { template: "wedding", signedAt: "2026-11-01", signedBy: "Maria Silva", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: false, gallery: null, amount: 8500 },
  { id: "2", client: "Ana Silva", date: "2026-11-10", time: "10:00", type: "portrait", location: "Estúdio Luz Natural, SP", status: "shot", cover: "portrait", notes: "Retrato corporativo. 3 trocas de look. Fundo cinza e branco.", contract: true, contractSigned: true, contractData: { template: "portrait", signedAt: "2026-11-05", signedBy: "Ana Silva", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: true, gallery: "gal_002", amount: 1200 },
  { id: "3", client: "TechStart Inc.", date: "2026-11-20", time: "09:00", type: "commercial", location: "Escritório Vila Madalena", status: "inquiry", cover: "commercial", notes: "Headshots team (12 pessoas). Produto em uso. Lifestyle office.", contract: false, contractSigned: false, questionnaire: false, deposit: false, balance: false, gallery: null, amount: 4500 },
  { id: "4", client: "Família Oliveira", date: "2026-11-05", time: "16:30", type: "family", location: "Parque Ibirapuera", status: "delivered", cover: "family", notes: "Sessão lifestyle ao ar livre. Golden hour 17h30. Crianças 4 e 7 anos.", contract: true, contractSigned: true, contractData: { template: "family", signedAt: "2026-10-28", signedBy: "João Oliveira", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: true, gallery: "gal_004", amount: 1500 },
  { id: "5", client: "Banda Aurora", date: "2026-11-25", time: "20:00", type: "event", subcategory: "show", location: "Audio Club, SP", status: "proofing", cover: "event", notes: "Show lançamento álbum. Palco + backstage. Baixa luz, ISO alto.", contract: true, contractSigned: false, questionnaire: true, deposit: true, balance: false, gallery: "gal_005", amount: 2800 },
  { id: "6", client: "Carolina Mendes", date: "2026-11-08", time: "15:00", type: "portrait", location: "Estúdio Casa", status: "today", cover: "portrait", notes: "Book 15 anos. 4 looks. Maquiagem inclusa. Entrega 15 dias.", contract: true, contractSigned: true, contractData: { template: "portrait", signedAt: "2026-11-07", signedBy: "Carolina Mendes", signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" }, questionnaire: true, deposit: true, balance: true, gallery: null, amount: 1200 },
];

export const defaultClients: Client[] = [
  { id: "c1", name: "Maria & João", email: "maria.joao@email.com", phone: "(11) 99999-1111", tags: ["casamento", "vip"], totalShoots: 1, totalSpent: 12500, lastContact: "2026-11-10", notes: "Casamento 15/11. Primeira dança coreografada. Alergia a camarão (bufê)." },
  { id: "c2", name: "Ana Silva", email: "ana.silva@corp.com", phone: "(11) 98888-2222", tags: ["corporativo", "recorrente"], totalShoots: 3, totalSpent: 8500, lastContact: "2026-11-05", notes: "Headshots trimestrais. Prefere fundo cinza. Empresa: TechStart." },
  { id: "c3", name: "TechStart Inc.", email: "rh@techstart.io", phone: "(11) 97777-3333", tags: ["comercial", "b2b"], totalShoots: 1, totalSpent: 0, lastContact: "2026-11-01", notes: "Proposta enviada 01/11. 12 headshots team. Aguardando aprovação orçamento." },
  { id: "c4", name: "Família Oliveira", email: "oliveira.familia@gmail.com", phone: "(11) 96666-4444", tags: ["família", "lifestyle"], totalShoots: 2, totalSpent: 4200, lastContact: "2026-10-28", notes: "Sessão parque 05/11. Crianças 4 e 7 anos. Golden hour 17h30." },
  { id: "c5", name: "Banda Aurora", email: "contato@bandaaurora.com", phone: "(11) 95555-5555", tags: ["evento", "música"], totalShoots: 1, totalSpent: 3800, lastContact: "2026-11-12", notes: "Show 25/11 Audio Club. Backstage + palco. Baixa luz." },
  { id: "c6", name: "Carolina Mendes", email: "carol.mendes@email.com", phone: "(11) 94444-6666", tags: ["retrato", "15anos"], totalShoots: 1, totalSpent: 2800, lastContact: "2026-11-07", notes: "Book 15 anos hoje. 4 looks. Maquiagem inclusa." },
];

// ===== TEMPLATES =====

export const contractTemplates: Record<ShootType, { title: string; clauses: { title: string; text: string }[] }> = {
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

export const questionnaireTemplates: Record<ShootType, { title: string; sections: { title: string; fields: any[] }[] }> = {
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

export const galleryTemplates: Record<ShootType, { title: string; sections: { name: string; order: number }[] }> = {
  wedding: { title: "Galeria de Casamento", sections: [{ name: "Making Of", order: 1 }, { name: "Cerimônia", order: 2 }, { name: "Retratos", order: 3 }, { name: "Recepção", order: 4 }, { name: "Detalhes", order: 5 }, { name: "Festa", order: 6 }] },
  portrait: { title: "Galeria de Retrato", sections: [{ name: "Look 1", order: 1 }, { name: "Look 2", order: 2 }, { name: "Look 3", order: 3 }, { name: "Variados", order: 4 }] },
  commercial: { title: "Galeria Comercial", sections: [{ name: "Headshots", order: 1 }, { name: "Produto", order: 2 }, { name: "Lifestyle", order: 3 }, { name: "Ambiente", order: 4 }] },
  family: { title: "Galeria Família", sections: [{ name: "Posadas", order: 1 }, { name: "Espontâneas", order: 2 }, { name: "Detalhes", order: 3 }, { name: "Pets", order: 4 }] },
  event: { title: "Galeria de Evento", sections: [{ name: "Palco", order: 1 }, { name: "Backstage", order: 2 }, { name: "Público", order: 3 }, { name: "Detalhes", order: 4 }, { name: "VIPs", order: 5 }] },
};

export const invoiceTemplates: Record<ShootType, { title: string; items: InvoiceItem[] }> = {
  wedding: { title: "Fatura — Casamento", items: [{ description: "Cobertura fotográfica (até 10h)", quantity: 1, unitPrice: 8500 }, { description: "Tratamento de 600+ imagens", quantity: 1, unitPrice: 0 }, { description: "Galeria online (12 meses)", quantity: 1, unitPrice: 0 }, { description: "Álbum 30x30cm (opcional)", quantity: 1, unitPrice: 1200 }] },
  portrait: { title: "Fatura — Retrato / Book", items: [{ description: "Sessão fotográfica (até 2h)", quantity: 1, unitPrice: 1200 }, { description: "15 imagens finais tratadas", quantity: 1, unitPrice: 0 }, { description: "5 versões web otimizadas", quantity: 1, unitPrice: 0 }, { description: "Galeria online (12 meses)", quantity: 1, unitPrice: 0 }, { description: "Licença comercial (opcional)", quantity: 1, unitPrice: 360 }] },
  commercial: { title: "Fatura — Comercial / Corporativo", items: [{ description: "Produção fotográfica (4h)", quantity: 1, unitPrice: 4500 }, { description: "150+ imagens tratadas", quantity: 1, unitPrice: 0 }, { description: "Licença comercial perpétua (2 anos exclusiva)", quantity: 1, unitPrice: 0 }, { description: "Entrega via link seguro + backup", quantity: 1, unitPrice: 0 }, { description: "Despesas extras (deslocamento, hospedagem)", quantity: 1, unitPrice: 0 }] },
  family: { title: "Fatura — Família / Lifestyle", items: [{ description: "Sessão lifestyle (1.5h)", quantity: 1, unitPrice: 1800 }, { description: "50+ imagens tratadas", quantity: 1, unitPrice: 0 }, { description: "Galeria online (12 meses)", quantity: 1, unitPrice: 0 }, { description: "Álbum 20x20cm (opcional)", quantity: 1, unitPrice: 800 }, { description: "Impressões 15x21cm x10 (opcional)", quantity: 1, unitPrice: 250 }] },
  event: { title: "Fatura — Evento / Show", items: [{ description: "Cobertura de evento (até 5h)", quantity: 1, unitPrice: 2800 }, { description: "200+ imagens tratadas", quantity: 1, unitPrice: 0 }, { description: "Seleção urgente 48h (50 imagens)", quantity: 1, unitPrice: 0 }, { description: "Galeria protegida por senha", quantity: 1, unitPrice: 0 }, { description: "Deslocamento >50km (R$ 2/km)", quantity: 1, unitPrice: 0 }] },
};
