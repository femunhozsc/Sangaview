"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Save, Wrench, CalendarCheck, Edit2, Trash2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

type MaintenanceFormData = {
  tipo: string;
  data: string;
  km: number;
  valor: number;
  observacoes: string;
  veiculo: string;
};

const initialMockMaintenance = [
  { id: "m1", tipo: "Troca de Óleo e Filtros", veiculo: "Guincho 02", data: "2026-06-10", km: 85000, valor: 450, observacoes: "Revisão preventiva" },
  { id: "m2", tipo: "Revisão de Freios", veiculo: "Guincho 01", data: "2026-06-05", km: 144200, valor: 650, observacoes: "Pastilhas e discos trocados" }
];

export default function ManutencoesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<any | null>(null);
  const { data: manutencoes, loading, addDocument, updateDocument, deleteDocument } = useCollection("manutencoes", initialMockMaintenance);
  const { register, handleSubmit, reset } = useForm<MaintenanceFormData>();

  const handleEdit = (item: any) => {
    setEditingMaintenance(item);
    reset({
      tipo: item.tipo,
      data: item.data || "",
      km: Number(item.km) || 0,
      valor: Number(item.valor) || 0,
      observacoes: item.observacoes || "",
      veiculo: item.veiculo
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro de manutenção?")) {
      try {
        await deleteDocument(id);
        alert("Manutenção excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir manutenção:", error);
      }
    }
  };

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const payload = {
        tipo: data.tipo,
        data: data.data || new Date().toISOString().split("T")[0],
        km: Number(data.km) || 0,
        valor: Number(data.valor) || 0,
        observacoes: data.observacoes || "",
        veiculo: data.veiculo || "Geral"
      };

      if (editingMaintenance) {
        await updateDocument(editingMaintenance.id, payload);
        alert("Manutenção atualizada com sucesso!");
      } else {
        await addDocument(payload);
        alert("Manutenção registrada com sucesso!");
      }
      setIsFormOpen(false);
      setEditingMaintenance(null);
      reset();
    } catch (error) {
      console.error("Erro ao salvar manutenção:", error);
      alert("Erro ao salvar a manutenção.");
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manutenções</h1>
          <p className="text-sm text-muted-foreground">Histórico e previsão de revisões da frota.</p>
        </div>
        <button 
          onClick={() => {
            setEditingMaintenance(null);
            reset({
              tipo: "",
              veiculo: "",
              data: new Date().toISOString().split("T")[0],
              km: 0,
              valor: 0,
              observacoes: ""
            });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Manutenção</span>
        </button>
      </div>

      {/* Lista de manutenções */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando manutenções...</div>
      ) : manutencoes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-card">
          Nenhuma manutenção registrada. Clique em "Nova Manutenção" para começar!
        </div>
      ) : (
        <div className="grid gap-4">
          {manutencoes.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-card p-5 shadow-sm border border-border gap-4">
              <div className="flex gap-4">
                <div className="rounded-full bg-blue-500/10 p-3 h-fit">
                  <Wrench className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.tipo}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <CalendarCheck className="h-3 w-3" />
                    <span>Realizada em: {item.data}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-2">
                    <span className="bg-muted px-2 py-1 rounded-md">{item.veiculo}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">KM: {(Number(item.km) || 0).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                <p className="text-xl font-bold text-red-500">
                  R$ {Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Editar Manutenção"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Excluir Manutenção"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-background shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <h2 className="text-xl font-bold">
                  {editingMaintenance ? "Editar Manutenção" : "Registrar Manutenção"}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="rounded-full bg-muted p-2 hover:bg-border transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 overflow-y-auto max-h-[60vh] bg-background">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Veículo</label>
                  <input {...register("veiculo", { required: true })} placeholder="Ex: Guincho 02" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Manutenção / Peça</label>
                  <input {...register("tipo", { required: true })} placeholder="Ex: Troca de Óleo e Filtros" className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <input type="date" {...register("data")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quilometragem</label>
                    <input type="number" {...register("km")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <input type="number" step="0.01" {...register("valor")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary font-bold text-red-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea {...register("observacoes")} rows={3} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
                </div>
              </form>

              <div className="border-t border-border p-6 bg-background rounded-b-2xl">
                <button type="submit" form="maintenance-form" className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98]">
                  <Save className="h-5 w-5" /> Salvar Manutenção
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
