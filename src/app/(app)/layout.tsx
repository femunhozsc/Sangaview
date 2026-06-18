"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar com botão de menu e logo */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Área de conteúdo rolável */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-5xl h-full">
            {children}
          </div>
        </main>

        {/* Navegação inferior para mobile */}
        <BottomNav />
      </div>

      {/* Sidebar para Desktop e Menu Retrátil para Mobile */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Overlay para fechar o sidebar no mobile quando clicar fora */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
