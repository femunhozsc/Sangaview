"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Truck, 
  Fuel, 
  Wrench, 
  CircleDollarSign,
  Moon,
  Sun,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Serviços", href: "/servicos", icon: Truck },
  { name: "Abastecimentos", href: "/abastecimentos", icon: Fuel },
  { name: "Manutenções", href: "/manutencoes", icon: Wrench },
  { name: "Financeiro", href: "/financeiro", icon: CircleDollarSign },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-card shadow-2xl md:relative md:flex md:w-64"
          >
            <div className="flex items-center justify-between border-b border-border p-4 h-16">
              <span className="text-lg font-bold text-foreground">Menu</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border p-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>Modo {theme === "dark" ? "Escuro" : "Claro"}</span>
                </div>
                <div className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
                )}>
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      theme === "dark" ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
