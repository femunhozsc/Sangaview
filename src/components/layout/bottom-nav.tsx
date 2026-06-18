"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, Fuel, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { name: "Início", href: "/dashboard", icon: LayoutDashboard },
  { name: "Serviços", href: "/servicos", icon: Truck },
  { name: "Combustível", href: "/abastecimentos", icon: Fuel },
  { name: "Finanças", href: "/financeiro", icon: CircleDollarSign },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-40 flex w-full justify-around border-t border-border bg-card/90 pb-safe pt-2 backdrop-blur-lg md:hidden">
      {bottomNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full px-2 py-2 pb-4 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
              isActive ? "bg-primary/10 scale-110" : ""
            )}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
