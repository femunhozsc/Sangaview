"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Edit2, CheckSquare, Square, Calendar, Clock, X, Save } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

type Reminder = {
  id: string;
  texto: string;
  feita: boolean;
  data: string;
};

const initialMockReminders = [
  { id: "r1", texto: "Revisar óleo do Guincho 01", feita: false, data: "2026-06-19" },
  { id: "r2", texto: "Cobrar faturamento do cliente João Silva", feita: true, data: "2026-06-18" },
  { id: "r3", texto: "Renovar seguro do Guincho 02", feita: false, data: "2026-06-25" }
];

export default function LembretesPage() {
  const { data: lembretes, loading, addDocument, updateDocument, deleteDocument } = useCollection("lembretes", initialMockReminders);
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // States for edit modal inputs
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      await addDocument({
        texto: newText.trim(),
        feita: false,
        data: newDate || new Date().toISOString().split("T")[0]
      });
      setNewText("");
      setNewDate("");
    } catch (error) {
      console.error("Erro ao adicionar lembrete:", error);
    }
  };

  const handleToggle = async (item: Reminder) => {
    try {
      await updateDocument(item.id, { feita: !item.feita });
    } catch (error) {
      console.error("Erro ao alterar lembrete:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja excluir este lembrete?")) {
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error("Erro ao excluir lembrete:", error);
      }
    }
  };

  const handleStartEdit = (item: Reminder) => {
    setEditingReminder(item);
    setEditText(item.texto);
    setEditDate(item.data);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;

    try {
      await updateDocument(editingReminder.id, {
        texto: editText.trim(),
        data: editDate
      });
      setEditingReminder(null);
    } catch (error) {
      console.error("Erro ao salvar lembrete:", error);
    }
  };

  // Separação de tarefas
  const pendentes = useMemo(() => lembretes.filter(r => !r.feita), [lembretes]);
  const concluidos = useMemo(() => lembretes.filter(r => r.feita), [lembretes]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Lembretes e Tarefas
        </h1>
        <p className="text-sm text-muted-foreground">Monitore compromissos e tarefas operacionais de forma organizada.</p>
      </div>

      {/* Formulário superior */}
      <form onSubmit={handleAdd} className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nova tarefa... (ex: Renovar Licença de Guincho)"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            required
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
          />
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" /> Adicionar
          </button>
        </div>
      </form>

      {/* Listagem */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando lembretes...</div>
      ) : lembretes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
          Nenhum lembrete registrado. Comece adicionando um acima!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Seção Pendentes */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pendentes ({pendentes.length})
            </h2>
            <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border overflow-hidden">
              <AnimatePresence initial={false}>
                {pendentes.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground bg-muted/10">Muito bem! Sem pendências.</div>
                ) : (
                  pendentes.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => handleToggle(item)}
                          className="text-muted-foreground hover:text-primary transition-colors mt-0.5 cursor-pointer shrink-0"
                        >
                          <Square className="h-5 w-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground break-words">{item.texto}</p>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                            <Calendar className="h-3 w-3" /> Limite: {item.data}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Seção Concluídos */}
          {concluidos.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500" /> Concluídos ({concluidos.length})
              </h2>
              <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border overflow-hidden">
                <AnimatePresence initial={false}>
                  {concluidos.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 flex items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => handleToggle(item)}
                          className="text-green-500 transition-colors mt-0.5 cursor-pointer shrink-0"
                        >
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground line-through break-words">{item.texto}</p>
                          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1 font-medium">
                            <Calendar className="h-3 w-3" /> Concluído em: {item.data}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingReminder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingReminder(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <h2 className="text-xl font-bold">Editar Lembrete</h2>
                <button onClick={() => setEditingReminder(null)} className="rounded-full bg-muted p-2 hover:bg-border transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 p-6 bg-background">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Texto do Lembrete</label>
                  <input 
                    type="text" 
                    value={editText} 
                    onChange={e => setEditText(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Data Limite</label>
                  <input 
                    type="date" 
                    value={editDate} 
                    onChange={e => setEditDate(e.target.value)} 
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" 
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setEditingReminder(null)} className="flex-1 py-3 text-sm font-semibold text-muted-foreground bg-muted rounded-xl hover:bg-border transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Save className="h-4.5 w-4.5" /> Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
