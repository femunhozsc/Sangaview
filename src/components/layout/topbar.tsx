"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-graphite px-4 shadow-md md:px-6 select-none">
      {/* Logo no lado esquerdo (clicável para retornar ao Dashboard) */}
      <Link href="/dashboard" className="block focus:outline-none">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center py-1 transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          <img 
            src="/Sanga-Logo.png" 
            alt="Sanga Auto Socorro" 
            className="h-12 md:h-14 w-auto object-contain cursor-pointer"
          />
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
    </header>
  );
}



