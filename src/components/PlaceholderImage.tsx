"use client";

import { Users2, User, Briefcase, Users, Music, Globe } from "lucide-react";
import { CoverType } from "@/lib/constants";

interface PlaceholderImageProps {
  type: CoverType;
  className?: string;
  size?: "full" | "thumb";
}

export function PlaceholderImage({ type, className = "", size = "full" }: PlaceholderImageProps) {
  const icons: Record<CoverType, React.ReactNode> = {
    wedding: <Users2 className="w-12 h-12" strokeWidth={1.5} />,
    portrait: <User className="w-12 h-12" strokeWidth={1.5} />,
    commercial: <Briefcase className="w-12 h-12" strokeWidth={1.5} />,
    family: <Users className="w-12 h-12" strokeWidth={1.5} />,
    event: <Music className="w-12 h-12" strokeWidth={1.5} />,
    platform: <Globe className="w-12 h-12" strokeWidth={1.5} />,
  };

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      <div className="relative z-10 text-muted/50">{icons[type]}</div>
    </div>
  );
}
