"use client";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

// Mock data fallbacks
const initialMockServices = [
  { id: "s1", cliente: "João Silva", veiculo: "Honda Civic", valor: 250, data: "2026-06-18", hora: "14:30" },
  { id: "s2", cliente: "Maria Oliveira", veiculo: "Toyota Corolla", valor: 380, data: "2026-06-17", hora: "10:15" }
];
const initialMockFuel = [
  { id: "a1", veiculo: "Guincho 01", location: "Posto Ipiranga", valor: 350, data: "2026-06-18" },
  { id: "a2", veiculo: "Guincho 02", location: "Posto Shell", valor: 310, data: "2026-06-17" }
];
const initialMockMaintenance = [
  { id: "m1", tipo: "Troca de Óleo e Filtros", veiculo: "Guincho 02", valor: 450, data: "2026-06-10" }
];
const initialMockShopping = [
  { id: "c1", item: "Cabo de aço para Guincho", quantidade: "2 un", comprado: false, preco: 150 },
  { id: "c2", item: "Óleo hidráulico 68", quantidade: "20 L", comprado: true, preco: 350, compradoEm: "2026-06-18" }
];

export default function FinanceiroPage() {
  const { data: servicos, loading: loadingS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM } = useCollection("manutencoes", initialMockMaintenance);
  const { data: compras, loading: loadingC } = useCollection("compras", initialMockShopping);

  const loading = loadingS || loadingA || loadingM || loadingC;

  // Preço total das compras concluídas
  const totalComprasCompradas = useMemo(() => {
    return compras
      .filter(c => c.comprado)
      .reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
  }, [compras]);

  // Receitas (Faturamento Bruto) = Serviços
  const totalReceitas = useMemo(() => {
    return servicos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [servicos]);

  // Despesas = Combustível + Manutenção + Pedágio de Serviços + Outros Custos de Serviços + Compras Concluídas
  const totalDespesas = useMemo(() => {
    const totalCombustivel = abastecimentos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalManut = manutencoes.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    
    // Pedágio e Outros Custos dos Serviços
    const totalPedagioServicos = servicos.reduce((acc, curr) => acc + (Number(curr.valorPedagio) || 0), 0);
    const totalOutrosCustosServicos = servicos.reduce((acc, curr) => {
      const outros = curr.outrosCustos || [];
      const sumOutros = outros.reduce((sum: number, c: any) => sum + (Number(c.valor) || 0), 0);
      return acc + sumOutros;
    }, 0);
    
    return totalCombustivel + totalManut + totalPedagioServicos + totalOutrosCustosServicos + totalComprasCompradas;
  }, [abastecimentos, manutencoes, servicos, totalComprasCompradas]);

  const lucroLiquido = totalReceitas - totalDespesas;

  // Extrato unificado de transações recentes (últimas 10)
  const extratoList = useMemo(() => {
    const getTimestamp = (item: any) => {
      if (item.createdAt && typeof item.createdAt.toDate === "function") {
        return item.createdAt.toDate();
      }
      return item.createdAt ? new Date(item.createdAt) : new Date();
    };

    const list = [
      ...servicos.map(s => ({
        tipo: "receita",
        desc: `Serviço: ${s.cliente} (${s.veiculo})`,
        valor: Number(s.valor) || 0,
        data: s.data || "",
        dateObj: getTimestamp(s)
      })),
      ...compras.filter(c => c.comprado).map(c => ({
        tipo: "deducao",
        desc: `Compra Concluída: ${c.item}`,
        valor: Number(c.preco) || 0,
        data: c.compradoEm || "",
        dateObj: getTimestamp(c)
      })),
      ...abastecimentos.map(a => ({
        tipo: "despesa",
        desc: `Abastecimento: ${a.veiculo}`,
        valor: Number(a.valor) || 0,
        data: a.data || "",
        dateObj: getTimestamp(a)
      })),
      ...manutencoes.map(m => ({
        tipo: "despesa",
        desc: `Manutenção: ${m.tipo} (${m.veiculo})`,
        valor: Number(m.valor) || 0,
        data: m.data || "",
        dateObj: getTimestamp(m)
      }))
    ];

    return list
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .slice(0, 10);
  }, [servicos, compras, abastecimentos, manutencoes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Controle de faturamento bruto e despesas com compras, combustíveis, pedágios e manutenções.</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <motion.div 
          variants={itemVariants}
          whileHover={{ translateY: -2, scale: 1.01 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Faturamento Bruto</span>
            <div className="p-2 rounded-full bg-green-500/10 text-green-500"><ArrowUpRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-green-500">
            R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
        <motion.div 
          variants={itemVariants}
          whileHover={{ translateY: -2, scale: 1.01 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Despesas (Combustível/Manut./Compras)</span>
            <div className="p-2 rounded-full bg-red-500/10 text-red-500"><ArrowDownRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-red-500">
            R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {totalComprasCompradas > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Inclui R$ {totalComprasCompradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em compras efetuadas.
            </p>
          )}
        </motion.div>
        <motion.div 
          variants={itemVariants}
          whileHover={{ translateY: -2, scale: 1.01 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border border-l-4 border-l-blue-500"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Lucro Líquido Real</span>
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Wallet className="h-5 w-5" /></div>
          </div>
          <p className={`mt-4 text-3xl font-bold ${lucroLiquido >= 0 ? "text-blue-500" : "text-red-500"}`}>
            R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
      </motion.div>

      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Extrato Recente (Unificado)
          </h2>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Carregando extrato...</div>
          ) : extratoList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Nenhuma transação registrada.</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {extratoList.map((item, i) => (
                <motion.div 
                  layout
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6 flex justify-between items-center hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{item.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.data}</p>
                  </div>
                  <p className={`font-bold text-sm ${
                    item.tipo === 'receita' 
                      ? 'text-green-500' 
                      : item.tipo === 'deducao' 
                      ? 'text-amber-500' 
                      : 'text-red-500'
                  }`}>
                    {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
