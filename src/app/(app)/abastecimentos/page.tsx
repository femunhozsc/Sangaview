"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Save, Fuel, Calendar } from "lucide-react";

export default function AbastecimentosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log("Novo Abastecimento:", data);
    setIsFormOpen(false);
    reset();
    alert("Abastecimento registrado com sucesso!");
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Abastecimentos</h1>
          <p className="text-sm text-muted-foreground">Controle de combustível da frota.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Registro</span>
        </button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-card p-5 shadow-sm border border-border gap-4">
            <div className="flex gap-4">
              <div className="rounded-full bg-orange-500/10 p-3 h-fit">
                <Fuel className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Guincho 01 - ABC-1234</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>18 Jun 2026</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-2">
                  <span className="bg-muted px-2 py-1 rounded-md">60 Litros</span>
                  <span className="bg-muted px-2 py-1 rounded-md">KM: 145.200</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl font-bold text-red-500">R$ 350,00</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Formulário */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-background shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-xl font-bold">Registrar Abastecimento</h2>
                <button onClick={() => setIsFormOpen(false)} className="rounded-full bg-muted p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="fuel-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <input type="date" {...register("data")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">KM do Veículo</label>
                  <input type="number" {...register("km")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Litros Abastecidos</label>
                  <input type="number" step="0.1" {...register("litros")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Pago (R$)</label>
                  <input type="number" step="0.01" {...register("valor")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary font-bold text-red-500" />
                </div>
              </form>

              <div className="border-t border-border p-6 bg-background rounded-b-2xl">
                <button type="submit" form="fuel-form" className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground">
                  <Save className="h-5 w-5" /> Salvar Registro
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
