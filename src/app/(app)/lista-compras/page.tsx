"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Trash2, Edit2, Check, ShoppingBag, ListChecks, X, Save } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

type ShoppingItem = {
  id: string;
  item: string;
  quantidade: string;
  comprado: boolean;
  preco?: number;
  compradoEm?: string | null;
};

const initialMockShopping = [
  { id: "c1", item: "Cabo de aço para Guincho", quantidade: "2 un", comprado: false, preco: 150 },
  { id: "c2", item: "Óleo hidráulico 68", quantidade: "20 L", comprado: true, preco: 350, compradoEm: "2026-06-18" },
  { id: "c3", item: "Cinta de reboque 10 ton", quantidade: "1 un", comprado: false, preco: 80 }
];

export default function ListaComprasPage() {
  const { data: compras, loading, addDocument, updateDocument, deleteDocument } = useCollection("compras", initialMockShopping);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // States for edit modal inputs
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      await addDocument({
        item: newItem.trim(),
        quantidade: newQty.trim() || "1 un",
        preco: Number(newPrice) || 0,
        comprado: false,
        compradoEm: null
      });
      setNewItem("");
      setNewQty("");
      setNewPrice("");
    } catch (error) {
      console.error("Erro ao adicionar item de compra:", error);
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    try {
      const nextComprado = !item.comprado;
      await updateDocument(item.id, { 
        comprado: nextComprado,
        compradoEm: nextComprado ? new Date().toISOString().split("T")[0] : null
      });
    } catch (error) {
      console.error("Erro ao alterar status do item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja remover este item da lista?")) {
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error("Erro ao excluir item de compra:", error);
      }
    }
  };

  const handleStartEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditName(item.item);
    setEditQty(item.quantidade);
    setEditPrice(item.preco !== undefined ? String(item.preco) : "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateDocument(editingItem.id, {
        item: editName.trim(),
        quantidade: editQty.trim(),
        preco: Number(editPrice) || 0
      });
      setEditingItem(null);
    } catch (error) {
      console.error("Erro ao editar item de compra:", error);
    }
  };

  // Progresso geral
  const totalItens = compras.length;
  const compradosCount = useMemo(() => compras.filter(c => c.comprado).length, [compras]);
  const progressoPct = totalItens > 0 ? Math.round((compradosCount / totalItens) * 100) : 0;

  // Divisão dos itens
  const pendentes = useMemo(() => compras.filter(c => !c.comprado), [compras]);
  const comprados = useMemo(() => compras.filter(c => c.comprado), [compras]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Lista de Compras
        </h1>
        <p className="text-sm text-muted-foreground">Insumos, peças e ferramentas com controle de preço e faturamento integrado.</p>
      </div>

      {/* Progresso de Compras */}
      {totalItens > 0 && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 text-primary" /> Status das Compras
            </span>
            <span className="font-bold text-foreground">{compradosCount} de {totalItens} adquiridos ({progressoPct}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressoPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Formulário superior */}
      <form onSubmit={handleAdd} className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Item (ex: Manilha 3/4)"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Qtd (ex: 2 un)"
              value={newQty}
              onChange={e => setNewQty(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="number"
              step="0.01"
              placeholder="Preço R$"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-all font-semibold"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer h-[40px]"
            >
              <Plus className="h-4.5 w-4.5" /> <span className="sm:hidden">Adicionar</span>
            </button>
          </div>
        </div>
      </form>

      {/* Listagem */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando lista...</div>
      ) : compras.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
          Nenhum item na lista. Adicione o primeiro acima!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pendentes */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-500" /> Pendentes ({pendentes.length})
            </h2>
            <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border overflow-hidden">
              <AnimatePresence initial={false}>
                {pendentes.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground bg-muted/10">Tudo comprado! Excelente.</div>
                ) : (
                  pendentes.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => handleToggle(item)}
                          className="h-6 w-6 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors cursor-pointer text-transparent hover:text-muted-foreground/30 shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                          <p className="text-sm font-semibold text-foreground truncate">{item.item}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              {item.quantidade}
                            </span>
                            {item.preco !== undefined && item.preco > 0 && (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                R$ {item.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comprados */}
          {comprados.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 font-extrabold" /> Comprados ({comprados.length})
              </h2>
              <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border overflow-hidden">
                <AnimatePresence initial={false}>
                  {comprados.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 flex items-center justify-between gap-4 bg-muted/10 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => handleToggle(item)}
                          className="h-6 w-6 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center text-green-500 cursor-pointer shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-muted-foreground line-through truncate">{item.item}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-medium text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-md">
                              {item.quantidade}
                            </span>
                            {item.preco !== undefined && item.preco > 0 && (
                              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md line-through">
                                R$ {item.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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
        {editingItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <h2 className="text-xl font-bold">Editar Item de Compra</h2>
                <button onClick={() => setEditingItem(null)} className="rounded-full bg-muted p-2 hover:bg-border transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 p-6 bg-background">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Nome do Item</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Quantidade</label>
                    <input 
                      type="text" 
                      value={editQty} 
                      onChange={e => setEditQty(e.target.value)} 
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editPrice} 
                      onChange={e => setEditPrice(e.target.value)} 
                      className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary font-bold text-amber-600" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-3 text-sm font-semibold text-muted-foreground bg-muted rounded-xl hover:bg-border transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Save className="h-4 w-4" /> Salvar
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
