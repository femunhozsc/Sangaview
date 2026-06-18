"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Camera, Save, Truck, MapPin, Edit2, Trash2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

type ServiceFormData = {
  cliente: string;
  telefone: string;
  data: string;
  hora: string;
  origem: string;
  destino: string;
  veiculo: string;
  placa: string;
  kmInicial: number;
  kmFinal: number;
  valor: number;
  descricao: string;
};

const initialMockServices = [
  { id: "s1", cliente: "João Silva", telefone: "(11) 99999-8888", data: "2026-06-18", hora: "14:30", origem: "Centro", destino: "Vila Nova", veiculo: "Honda Civic", placa: "ABC-1234", kmInicial: 100, kmFinal: 125, kmPercorrido: 25, valor: 250, descricao: "Serviço padrão de guincho." },
  { id: "s2", cliente: "Maria Oliveira", telefone: "(11) 98888-7777", data: "2026-06-17", hora: "10:15", origem: "Aeroporto", destino: "Jardins", veiculo: "Toyota Corolla", placa: "XYZ-9876", kmInicial: 200, kmFinal: 235, kmPercorrido: 35, valor: 380, descricao: "Carro com pane mecânica." }
];

export default function ServicosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const { data: servicos, loading, addDocument, updateDocument, deleteDocument } = useCollection("servicos", initialMockServices);
  const { register, watch, handleSubmit, reset } = useForm<ServiceFormData>();

  const kmInicial = watch("kmInicial", 0);
  const kmFinal = watch("kmFinal", 0);
  const kmPercorrido = (Number(kmFinal) - Number(kmInicial) > 0) ? (Number(kmFinal) - Number(kmInicial)) : 0;

  const handleEdit = (servico: any) => {
    setEditingService(servico);
    reset({
      cliente: servico.cliente,
      telefone: servico.telefone || "",
      data: servico.data || "",
      hora: servico.hora || "",
      origem: servico.origem || "",
      destino: servico.destino || "",
      veiculo: servico.veiculo || "",
      placa: servico.placa || "",
      kmInicial: Number(servico.kmInicial) || 0,
      kmFinal: Number(servico.kmFinal) || 0,
      valor: Number(servico.valor) || 0,
      descricao: servico.descricao || ""
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteDocument(id);
        alert("Serviço excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
        alert("Erro ao excluir o serviço.");
      }
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const payload = {
        cliente: data.cliente,
        telefone: data.telefone || "",
        data: data.data || new Date().toISOString().split("T")[0],
        hora: data.hora || "",
        origem: data.origem || "",
        destino: data.destino || "",
        veiculo: data.veiculo || "",
        placa: data.placa || "",
        kmInicial: Number(data.kmInicial) || 0,
        kmFinal: Number(data.kmFinal) || 0,
        kmPercorrido: kmPercorrido,
        valor: Number(data.valor) || 0,
        descricao: data.descricao || ""
      };

      if (editingService) {
        await updateDocument(editingService.id, payload);
        alert("Serviço atualizado com sucesso!");
      } else {
        await addDocument(payload);
        alert("Serviço salvo com sucesso!");
      }
      
      setIsFormOpen(false);
      setEditingService(null);
      reset();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar o serviço.");
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">Gerencie os serviços de guincho.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            reset({
              cliente: "",
              telefone: "",
              data: new Date().toISOString().split("T")[0],
              hora: new Date().toTimeString().split(" ")[0].slice(0, 5),
              origem: "",
              destino: "",
              veiculo: "",
              placa: "",
              kmInicial: 0,
              kmFinal: 0,
              valor: 0,
              descricao: ""
            });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Serviço</span>
        </button>
      </div>

      {/* Lista de Serviços */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando serviços...</div>
      ) : servicos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-card">
          Nenhum serviço registrado. Clique em "Novo Serviço" para começar!
        </div>
      ) : (
        <div className="grid gap-4">
          {servicos.map((servico) => (
            <div key={servico.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-card p-5 shadow-sm border border-border gap-4">
              <div className="flex gap-4">
                <div className="rounded-full bg-blue-500/10 p-3 h-fit">
                  <Truck className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{servico.cliente} ({servico.veiculo})</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{servico.origem || "Não informada"} → {servico.destino || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="bg-muted px-2 py-1 rounded-md">{servico.data} {servico.hora}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">{servico.kmPercorrido || 0} km rodados</span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                <p className="text-xl font-bold text-green-500">
                  R$ {Number(servico.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleEdit(servico)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Editar Serviço"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(servico.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Excluir Serviço"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal/Drawer de Formulário */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[90vh] flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-xl font-bold">Cadastrar Serviço</h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full bg-muted p-2 hover:bg-border transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 overscroll-contain">
                <form id="service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cliente</label>
                      <input {...register("cliente", { required: true })} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <input {...register("telefone")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="(00) 00000-0000" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <input type="date" {...register("data")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hora</label>
                      <input type="time" {...register("hora")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Origem</label>
                      <input {...register("origem")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Endereço de coleta" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Destino</label>
                      <input {...register("destino")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Endereço de entrega" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Veículo</label>
                      <input {...register("veiculo")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Modelo do carro" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Placa</label>
                      <input {...register("placa")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" placeholder="ABC-1234" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/50 p-4 rounded-2xl border border-border">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">KM Inicial</label>
                      <input type="number" {...register("kmInicial")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">KM Final</label>
                      <input type="number" {...register("kmFinal")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                      <label className="text-sm font-medium text-muted-foreground">Total Percorrido</label>
                      <div className="w-full rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm font-bold border border-primary/20 text-center">
                        {kmPercorrido} km
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor Cobrado (R$)</label>
                    <input type="number" step="0.01" {...register("valor")} className="w-full sm:w-1/2 rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary text-green-600 dark:text-green-500 font-bold text-lg" placeholder="0,00" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição / Observações</label>
                    <textarea {...register("descricao")} rows={3} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary resize-none" placeholder="Detalhes do serviço..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Fotos do Serviço
                      <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-card hover:bg-muted transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para anexar</span> ou arraste</p>
                        </div>
                        <input type="file" multiple accept="image/*" className="hidden" />
                      </label>
                    </div>
                  </div>

                </form>
              </div>

              <div className="border-t border-border p-6 bg-background rounded-b-2xl">
                <button 
                  type="submit" 
                  form="service-form"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <Save className="h-5 w-5" />
                  Salvar Serviço
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

