"use client";

export function DynamicIcon({ component: Icon, className }: { component: React.ElementType; className?: string }) {
  return <Icon className={className} />;
}
