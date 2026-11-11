"use client";

import { useState, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, CheckCircle, Sparkles, LayoutDashboard, Calendar, Users, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface WelcomeTourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlightId?: string;
}

const STEPS: WelcomeTourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Lente",
    description: "Seu CRM para fotógrafos. Vamos fazer um tour rápido pelas principais áreas do app.",
    icon: Sparkles,
  },
  {
    id: "today",
    title: "Shoots de Hoje",
    description: "Aqui você vê os shoots agendados para hoje. Toque em qualquer card para abrir o painel de ações.",
    icon: LayoutDashboard,
    highlightId: "today-section",
  },
  {
    id: "calendar",
    title: "Calendário",
    description: "Acompanhe todos os seus shoots agendados por mês e clique em um dia para ver os detalhes.",
    icon: Calendar,
    highlightId: "tab-calendar",
  },
  {
    id: "clients",
    title: "Clientes",
    description: "Gerencie sua base de clientes, veja o histórico de shoots e crie novos contatos.",
    icon: Users,
    highlightId: "tab-clients",
  },
  {
    id: "insights",
    title: "Insights Financeiros",
    description: "Acompanhe faturamento bruto, líquido e gastos por categoria em tempo real.",
    icon: DollarSign,
    highlightId: "tab-insights",
  },
  {
    id: "profile",
    title: "Seu Perfil",
    description: "Complete seus dados cadastrais em Minha Conta. Essas informações aparecem nos contratos e questionários.",
    icon: User,
    highlightId: "tab-user",
  },
];

interface WelcomeTourProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  lang: string;
}

export function WelcomeTour({ open, onClose, onComplete, lang }: WelcomeTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const tLang = (key: string) => t(key, lang);

  const currentStep = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md" />

      {/* Tour panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4 sm:mx-6 lg:mx-10 mt-4 mb-4 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <currentStep.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {tLang("onboarding.stepLabel")} {stepIndex + 1} {tLang("onboarding.of")} {STEPS.length}
              </p>
              <h2 className="text-heading mb-1">{currentStep.title}</h2>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
            {tLang("onboarding.skip")}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-border/60 mb-8 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <p className="text-body text-foreground/90 leading-relaxed">{currentStep.description}</p>

          {/* Visual hint based on step */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mt-0.5">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {stepIndex === 0 && tLang("onboarding.tipWelcome")}
                {stepIndex === 1 && tLang("onboarding.tipToday")}
                {stepIndex === 2 && tLang("onboarding.tipCalendar")}
                {stepIndex === 3 && tLang("onboarding.tipClients")}
                {stepIndex === 4 && tLang("onboarding.tipInsights")}
                {stepIndex === 5 && tLang("onboarding.tipProfile")}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border/60">
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={handlePrev}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tLang("onboarding.previous")}
            </Button>
          ) : null}

          <div className="flex items-center gap-2">
            {!isLast ? (
              <Button type="button" size="sm" onClick={handleNext} className="bg-amber-500 text-amber-950 hover:bg-amber-400">
                {tLang("onboarding.next")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={handleComplete} className="bg-amber-500 text-amber-950 hover:bg-amber-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {tLang("onboarding.finish")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  function handleComplete() {
    onComplete();
  }
}
