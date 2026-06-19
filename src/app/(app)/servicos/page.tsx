"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  X, 
  Camera, 
  Save, 
  Truck, 
  MapPin, 
  Edit2, 
  Trash2, 
  Eye, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Calendar,
  Clock,
  Phone
} from "lucide-react";
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
  { id: "s1", cliente: "João Silva", telefone: "(11) 99999-8888", data: "2026-06-18", hora: "14:30", origem: "Centro", destino: "Vila Nova", veiculo: "Honda Civic", placa: "ABC-1234", kmInicial: 100, kmFinal: 125, kmPercorrido: 25, valor: 250, descricao: "Serviço padrão de guincho.", fotos: [] },
  { id: "s2", cliente: "Maria Oliveira", telefone: "(11) 98888-7777", data: "2026-06-17", hora: "10:15", origem: "Aeroporto", destino: "Jardins", veiculo: "Toyota Corolla", placa: "XYZ-9876", kmInicial: 200, kmFinal: 235, kmPercorrido: 35, valor: 380, descricao: "Carro com pane mecânica.", fotos: [] }
];

// Helper to compress image using HTML5 Canvas
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max_size = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // Compressed JPEG (quality 0.6)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function ServicosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [viewingService, setViewingService] = useState<any | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [tempPhotos, setTempPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const { data: servicos, loading, addDocument, updateDocument, deleteDocument } = useCollection("servicos", initialMockServices);
  const { register, watch, handleSubmit, reset } = useForm<ServiceFormData>();

  const kmInicial = watch("kmInicial", 0);
  const kmFinal = watch("kmFinal", 0);
  const kmPercorrido = (Number(kmFinal) - Number(kmInicial) > 0) ? (Number(kmFinal) - Number(kmInicial)) : 0;

  const handleEdit = (servico: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open details modal
    setEditingService(servico);
    setTempPhotos(servico.fotos || []);
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteDocument(id);
        alert("Serviço excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsCompressing(true);
    const files = Array.from(e.target.files);
    try {
      const compressedBase64s = await Promise.all(
        files.map(file => compressImage(file))
      );
      setTempPhotos(prev => [...prev, ...compressedBase64s]);
    } catch (err) {
      console.error("Erro ao processar imagens:", err);
      alert("Erro ao processar imagens.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveTempPhoto = (index: number) => {
    setTempPhotos(prev => prev.filter((_, i) => i !== index));
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
        descricao: data.descricao || "",
        fotos: tempPhotos
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
      setTempPhotos([]);
      reset();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar o serviço.");
    }
  };

  const openFullscreenPhoto = (photo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoRotation(0);
    setPhotoZoom(1);
    setActivePhoto(photo);
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">Gerencie atendimentos e guinchos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setTempPhotos([]);
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
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Serviço</span>
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
            <div 
              key={servico.id} 
              onClick={() => setViewingService(servico)}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-card p-5 shadow-sm border border-border gap-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex gap-4">
                <div className="rounded-full bg-blue-500/10 p-3 h-fit shrink-0">
                  <Truck className="h-6 w-6 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate">{servico.cliente} ({servico.veiculo})</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{servico.origem || "Não informada"} → {servico.destino || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="bg-muted px-2 py-1 rounded-md">{servico.data} {servico.hora}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">{servico.kmPercorrido || 0} km rodados</span>
                    {servico.fotos && servico.fotos.length > 0 && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-semibold">
                        {servico.fotos.length} {servico.fotos.length === 1 ? "foto" : "fotos"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <p className="text-xl font-bold text-green-500">
                  R$ {Number(servico.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => handleEdit(servico, e)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Editar Serviço"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(servico.id, e)}
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

      {/* Modal/Drawer de Formulário de Cadastro/Edição */}
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
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <h2 className="text-xl font-bold">{editingService ? "Editar Serviço" : "Cadastrar Serviço"}</h2>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full bg-muted p-2 hover:bg-border transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 overscroll-contain bg-background">
                <form id="service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cliente</label>
                      <input {...register("cliente", { required: true })} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <input {...register("telefone")} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary" placeholder="(00) 00000-0000" />
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

                  {/* Upload de Fotos com Compactação e Previews */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>Fotos do Serviço</span>
                      {isCompressing && <span className="text-xs text-primary animate-pulse font-semibold">Compactando fotos...</span>}
                    </label>
                    
                    {/* Lista de Previews */}
                    {tempPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 border border-border rounded-xl">
                        {tempPhotos.map((photo, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-border bg-card">
                            <img src={photo} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTempPhoto(index)}
                              className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 hover:bg-black/80 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-card hover:bg-muted transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold text-primary">Anexar Fotos</span></p>
                          <p className="text-[10px] text-muted-foreground">(Serão compactadas automaticamente)</p>
                        </div>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isCompressing} />
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-border p-6 bg-background rounded-b-2xl">
                <button 
                  type="submit" 
                  form="service-form"
                  disabled={isCompressing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  Salvar Serviço
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Visualização de Detalhes do Serviço */}
      <AnimatePresence>
        {viewingService && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingService(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[90vh] flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto md:max-h-[85vh] md:w-full md:max-w-2xl md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Detalhes do Atendimento</h2>
                    <p className="text-xs text-muted-foreground">ID do Serviço: {viewingService.id}</p>
                  </div>
                </div>
                <button onClick={() => setViewingService(null)} className="rounded-full bg-muted p-2 hover:bg-border transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
                {/* Cabeçalho */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/60">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Cliente</span>
                    <span className="text-base font-bold text-foreground block mt-1">{viewingService.cliente}</span>
                    {viewingService.telefone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" /> {viewingService.telefone}
                      </span>
                    )}
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/60 text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Valor Cobrado</span>
                    <span className="text-xl font-extrabold text-green-500 block mt-1">
                      R$ {Number(viewingService.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Percurso */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Percurso & Trajeto</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase">Origem</p>
                        <p className="text-sm font-semibold text-foreground truncate">{viewingService.origem || "Não fornecido"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase">Destino</p>
                        <p className="text-sm font-semibold text-foreground truncate">{viewingService.destino || "Não fornecido"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados Técnicos e Frota */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Veículo</span>
                    <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingService.veiculo || "-"}</span>
                  </div>
                  <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Placa</span>
                    <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingService.placa || "-"}</span>
                  </div>
                  <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Data</span>
                    <span className="text-sm font-semibold text-foreground block mt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" /> {viewingService.data}
                    </span>
                  </div>
                  <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Hora</span>
                    <span className="text-sm font-semibold text-foreground block mt-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {viewingService.hora || "-"}
                    </span>
                  </div>
                </div>

                {/* Quilometragem */}
                <div className="grid grid-cols-3 gap-4 bg-muted/40 p-4 rounded-xl border border-border/60">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">KM Inicial</span>
                    <span className="text-sm font-bold text-foreground block mt-0.5">{viewingService.kmInicial || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">KM Final</span>
                    <span className="text-sm font-bold text-foreground block mt-0.5">{viewingService.kmFinal || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-primary block">Distância</span>
                    <span className="text-sm font-extrabold text-primary block mt-0.5">{viewingService.kmPercorrido || 0} km</span>
                  </div>
                </div>

                {/* Descrição */}
                {viewingService.descricao && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição do Atendimento</span>
                    <div className="bg-muted/20 p-4 rounded-xl border border-border text-sm text-foreground whitespace-pre-wrap">
                      {viewingService.descricao}
                    </div>
                  </div>
                )}

                {/* Fotos salvas */}
                {viewingService.fotos && viewingService.fotos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Imagens Anexadas ({viewingService.fotos.length})</span>
                    <div className="grid grid-cols-3 gap-3">
                      {viewingService.fotos.map((photo: string, index: number) => (
                        <div 
                          key={index} 
                          onClick={(e) => openFullscreenPhoto(photo, e)}
                          className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in border border-border bg-card group"
                        >
                          <img src={photo} alt={`Atendimento ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Secundário: Visualizador de Fotos em Tela Cheia (com Zoom e Rotação) */}
      <AnimatePresence>
        {activePhoto && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="fixed inset-0 z-[60] bg-black/95 flex flex-col justify-between items-center"
            >
              {/* Barra superior */}
              <div className="w-full flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-[62] text-white">
                <span className="text-xs font-bold uppercase tracking-wider opacity-85">Visualizador de Imagens</span>
                <button 
                  onClick={() => setActivePhoto(null)}
                  className="rounded-full bg-white/10 p-2.5 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Área central da foto */}
              <div className="flex-1 flex items-center justify-center w-full overflow-hidden p-6 relative">
                <motion.img 
                  src={activePhoto} 
                  alt="Fullscreen"
                  style={{
                    rotate: `${photoRotation}deg`,
                    scale: photoZoom
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  className="max-w-full max-h-[70vh] object-contain shadow-2xl select-none"
                  onClick={(e) => e.stopPropagation()} // Prevent close on image click
                />
              </div>

              {/* Barra de controle inferior */}
              <div className="w-full bg-gradient-to-t from-black/90 to-transparent p-6 z-[62] flex justify-center items-center gap-5 text-white">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoZoom(prev => Math.max(prev - 0.25, 0.5)); }}
                  className="rounded-xl bg-white/10 p-3 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoRotation(prev => prev - 90); }}
                  className="rounded-xl bg-white/10 p-3 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                  title="Girar Esquerda / Deitar"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoRotation(0); setPhotoZoom(1); }}
                  className="rounded-xl bg-primary px-4 py-3 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Resetar
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoRotation(prev => prev + 90); }}
                  className="rounded-xl bg-white/10 p-3 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                  title="Girar Direita / Deitar"
                >
                  <RotateCw className="h-5 w-5" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoZoom(prev => Math.min(prev + 0.25, 3)); }}
                  className="rounded-xl bg-white/10 p-3 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
