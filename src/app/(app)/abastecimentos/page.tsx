"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Save, Fuel, Calendar } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

type FuelFormData = {
  data: string;
  km: number;
  litros: number;
  valor: number;
  veiculo: string;
};

const initialMockFuel = [
  { id: "a1", veiculo: "Guincho 01", location: "Posto Ipiranga", data: "2026-06-18", km: 145200, litros: 60, valor: 350 },
  { id: "a2", veiculo: "Guincho 02", location: "Posto Shell", data: "2026-06-17", km: 85400, litros: 50, valor: 310 }
];

export default function AbastecimentosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: abastecimentos, loading, addDocument } = useCollection("abastecimentos", initialMockFuel);
  const { register, handleSubmit, reset } = useForm<FuelFormData>();

  const onSubmit = async (data: FuelFormData) => {
    try {
      await addDocument({
        data: data.data || new Date().toISOString().split("T")[0],
        km: Number(data.km) || 0,
        litros: Number(data.litros) || 0,
        valor: Number(data.valor) || 0,
        veiculo: data.veiculo || "Geral"
      });
      setIsFormOpen(false);
      reset();
      alert("Abastecimento registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      alert("Erro ao salvar o abastecimento.");
    }
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

      {/* Lista de registros */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando abastecimentos...</div>
      ) : abastecimentos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-card">
          Nenhum abastecimento registrado. Clique em "Novo Registro" para começar!
        </div>
      ) : (
        <div className="grid gap-4">
          {abastecimentos.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-card p-5 shadow-sm border border-border gap-4">
              <div className="flex gap-4">
                <div className="rounded-full bg-orange-500/10 p-3 h-fit">
                  <Fuel className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.veiculo}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{item.data}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-2">
                    <span className="bg-muted px-2 py-1 rounded-md">{item.litros} Litros</span>
                    <span className="bg-muted px-2 py-1 rounded-md">KM: {(Number(item.km) || 0).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl font-bold text-red-500">
                  R$ {Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

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
                  <label className="text-sm font-medium">Veículo / Identificação</label>
                  <input {...register("veiculo", { required: true })} placeholder="Ex: Guincho 01" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
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
                <button type="submit" form="fuel-form" className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98]">
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

