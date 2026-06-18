"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Trash2, Check, ShoppingBag, ListChecks } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

type ShoppingItem = {
  id: string;
  item: string;
  quantidade: string;
  comprado: boolean;
};

const initialMockShopping = [
  { id: "c1", item: "Cabo de aço para Guincho", quantidade: "2 un", comprado: false },
  { id: "c2", item: "Óleo hidráulico 68", quantidade: "20 L", comprado: true },
  { id: "c3", item: "Cinta de reboque 10 ton", quantidade: "1 un", comprado: false }
];

export default function ListaComprasPage() {
  const { data: compras, loading, addDocument, updateDocument, deleteDocument } = useCollection("compras", initialMockShopping);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      await addDocument({
        item: newItem.trim(),
        quantidade: newQty.trim() || "1 un",
        comprado: false
      });
      setNewItem("");
      setNewQty("");
    } catch (error) {
      console.error("Erro ao adicionar item de compra:", error);
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    try {
      await updateDocument(item.id, { comprado: !item.comprado });
    } catch (error) {
      console.error("Erro ao alterar item de compra:", error);
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

  // Cálculo de progresso
  const totalItens = compras.length;
  const compradosCount = useMemo(() => compras.filter(c => c.comprado).length, [compras]);
  const progressoPct = totalItens > 0 ? Math.round((compradosCount / totalItens) * 100) : 0;

  // Separação de itens
  const pendentes = useMemo(() => compras.filter(c => !c.comprado), [compras]);
  const comprados = useMemo(() => compras.filter(c => c.comprado), [compras]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Lista de Compras
        </h1>
        <p className="text-sm text-muted-foreground">Controle de insumos, peças e ferramentas para a frota e oficina.</p>
      </div>

      {/* Barra de progresso */}
      {totalItens > 0 && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" /> Status das Compras
            </span>
            <span className="font-bold text-foreground">{compradosCount} de {totalItens} comprados ({progressoPct}%)</span>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nome do item (ex: Manilha 3/4)"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            required
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
          />
          <input
            type="text"
            placeholder="Qtd (ex: 2 un, 10L)"
            value={newQty}
            onChange={e => setNewQty(e.target.value)}
            className="w-full sm:w-28 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
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
        <div className="text-center py-12 text-muted-foreground">Carregando lista...</div>
      ) : compras.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
          Nenhum item na lista de compras. Adicione o primeiro acima!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Itens Pendentes */}
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
                          className="h-6 w-6 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors cursor-pointer text-transparent hover:text-muted-foreground/30"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
                          <p className="text-sm font-semibold text-foreground break-words">{item.item}</p>
                          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                            {item.quantidade}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5 shrink-0" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Itens Comprados */}
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
                          className="h-6 w-6 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center text-green-500 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
                          <p className="text-sm font-medium text-muted-foreground line-through break-words">{item.item}</p>
                          <span className="text-xs font-medium text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-md shrink-0">
                            {item.quantidade}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5 shrink-0" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
