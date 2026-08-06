"use client";

import { ViewTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu,
  LayoutDashboard, 
  Truck, 
  Fuel, 
  Wrench, 
  CircleDollarSign,
  BarChart3,
  Bell,
  ShoppingCart
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

const desktopMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Serviços", href: "/servicos", icon: Truck },
  { name: "Abastecimentos", href: "/abastecimentos", icon: Fuel },
  { name: "Manutenções", href: "/manutencoes", icon: Wrench },
  { name: "Financeiro", href: "/financeiro", icon: CircleDollarSign },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Lembretes", href: "/lembretes", icon: Bell },
  { name: "Lista de Compras", href: "/lista-compras", icon: ShoppingCart },
];

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-graphite shadow-md select-none">
      {/* Top Bar Principal */}
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo no lado esquerdo (clicável para retornar ao Dashboard) */}
        <Link href="/dashboard" className="block focus:outline-none">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center py-1 transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            <ViewTransition name="sanga-logo">
              <img 
                src="/Sanga-Logo.png" 
                alt="Sanga Auto Socorro" 
                className="h-12 md:h-14 w-auto object-contain cursor-pointer"
              />
            </ViewTransition>
          </motion.div>
        </Link>

        {/* Botão de Menu no lado direito */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Sub-bar de botões de atalho (visível APENAS no computador / desktop) */}
      <nav className="hidden md:flex items-center gap-1 border-t border-white/10 px-4 py-2 overflow-x-auto scrollbar-none bg-graphite-dark/60 backdrop-blur-sm">
        {desktopMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-white/20 text-white shadow-sm ring-1 ring-white/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-white/70")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}




