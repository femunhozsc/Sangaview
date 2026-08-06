"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Calendar, RotateCw } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { cn } from "@/lib/utils";

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

const initialMockServices: any[] = [];
const initialMockFuel: any[] = [];
const initialMockMaintenance: any[] = [];
const initialMockShopping: any[] = [];

type PeriodoFiltro = "mes" | "ano" | "total";

export default function FinanceiroPage() {
  const { data: servicos, loading: loadingS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM } = useCollection("manutencoes", initialMockMaintenance);
  const { data: compras, loading: loadingC } = useCollection("compras", initialMockShopping);

  const loading = loadingS || loadingA || loadingM || loadingC;

  // Estado do período selecionado (Padrão: "mes" = Mês Atual)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("mes");

  // Data atual para filtro de mês e ano
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthNameRaw = now.toLocaleDateString("pt-BR", { month: "long" });
  const currentMonthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);

  const isInCurrentMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split("-");
    if (parts.length < 2) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === currentYear && m === currentMonth;
  };

  const isInCurrentYear = (dateStr?: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split("-");
    if (parts.length < 1) return false;
    const y = parseInt(parts[0], 10);
    return y === currentYear;
  };

  // Alterna o período ao clicar no card de Faturamento Bruto (Mês -> Ano -> Total -> Mês)
  const handleTogglePeriodo = () => {
    if (periodo === "mes") setPeriodo("ano");
    else if (periodo === "ano") setPeriodo("total");
    else setPeriodo("mes");
  };

  // Filtragem conforme o período selecionado
  const servicosFiltrados = useMemo(() => {
    if (periodo === "mes") return servicos.filter(s => isInCurrentMonth(s.data));
    if (periodo === "ano") return servicos.filter(s => isInCurrentYear(s.data));
    return servicos;
  }, [servicos, periodo, currentYear, currentMonth]);

  const abastecimentosFiltrados = useMemo(() => {
    if (periodo === "mes") return abastecimentos.filter(a => isInCurrentMonth(a.data));
    if (periodo === "ano") return abastecimentos.filter(a => isInCurrentYear(a.data));
    return abastecimentos;
  }, [abastecimentos, periodo, currentYear, currentMonth]);

  const manutencoesFiltradas = useMemo(() => {
    if (periodo === "mes") return manutencoes.filter(m => isInCurrentMonth(m.data));
    if (periodo === "ano") return manutencoes.filter(m => isInCurrentYear(m.data));
    return manutencoes;
  }, [manutencoes, periodo, currentYear, currentMonth]);

  const comprasFiltradas = useMemo(() => {
    const comprasConcluidas = compras.filter(c => c.comprado);
    if (periodo === "mes") return comprasConcluidas.filter(c => isInCurrentMonth(c.compradoEm));
    if (periodo === "ano") return comprasConcluidas.filter(c => isInCurrentYear(c.compradoEm));
    return comprasConcluidas;
  }, [compras, periodo, currentYear, currentMonth]);

  // Preço total das compras concluídas filtradas
  const totalComprasCompradas = useMemo(() => {
    return comprasFiltradas.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
  }, [comprasFiltradas]);

  // Receitas (Faturamento Bruto) = Serviços
  const totalReceitas = useMemo(() => {
    return servicosFiltrados.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [servicosFiltrados]);

  // Despesas = Combustível + Manutenção + Pedágio de Serviços + Outros Custos de Serviços + Compras Concluídas
  const totalDespesas = useMemo(() => {
    const totalCombustivel = abastecimentosFiltrados.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalManut = manutencoesFiltradas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    
    // Pedágio e Outros Custos dos Serviços filtrados
    const totalPedagioServicos = servicosFiltrados.reduce((acc, curr) => acc + (Number(curr.valorPedagio) || 0), 0);
    const totalOutrosCustosServicos = servicosFiltrados.reduce((acc, curr) => {
      const outros = curr.outrosCustos || [];
      const sumOutros = outros.reduce((sum: number, c: any) => sum + (Number(c.valor) || 0), 0);
      return acc + sumOutros;
    }, 0);
    
    return totalCombustivel + totalManut + totalPedagioServicos + totalOutrosCustosServicos + totalComprasCompradas;
  }, [abastecimentosFiltrados, manutencoesFiltradas, servicosFiltrados, totalComprasCompradas]);

  const lucroLiquido = totalReceitas - totalDespesas;

  // Extrato unificado de transações filtradas conforme o período selecionado
  const extratoList = useMemo(() => {
    const getTimestamp = (item: any) => {
      if (item.createdAt && typeof item.createdAt.toDate === "function") {
        return item.createdAt.toDate();
      }
      return item.createdAt ? new Date(item.createdAt) : new Date();
    };

    const list = [
      ...servicosFiltrados.map(s => ({
        tipo: "receita",
        desc: `Serviço: ${s.cliente} (${s.veiculo || "Geral"})`,
        valor: Number(s.valor) || 0,
        data: s.data || "",
        dateObj: getTimestamp(s)
      })),
      ...comprasFiltradas.map(c => ({
        tipo: "deducao",
        desc: `Compra Concluída: ${c.item}`,
        valor: Number(c.preco) || 0,
        data: c.compradoEm || "",
        dateObj: getTimestamp(c)
      })),
      ...abastecimentosFiltrados.map(a => ({
        tipo: "despesa",
        desc: `Abastecimento: ${a.veiculo}`,
        valor: Number(a.valor) || 0,
        data: a.data || "",
        dateObj: getTimestamp(a)
      })),
      ...manutencoesFiltradas.map(m => ({
        tipo: "despesa",
        desc: `Manutenção: ${m.tipo} (${m.veiculo})`,
        valor: Number(m.valor) || 0,
        data: m.data || "",
        dateObj: getTimestamp(m)
      }))
    ];

    return list.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [servicosFiltrados, comprasFiltradas, abastecimentosFiltrados, manutencoesFiltradas]);

  const getLabelPeriodo = () => {
    if (periodo === "mes") return currentMonthName;
    if (periodo === "ano") return `${currentYear}`;
    return "Total";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Controle de faturamento bruto e despesas operacionais.</p>
        </div>

        {/* Seletor de Período Rápido */}
        <div className="flex items-center gap-1.5 bg-card p-1.5 rounded-2xl border border-border shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setPeriodo("mes")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              periodo === "mes" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {currentMonthName}
          </button>
          <button
            onClick={() => setPeriodo("ano")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              periodo === "ano" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {currentYear}
          </button>
          <button
            onClick={() => setPeriodo("total")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              periodo === "total" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Total
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {/* Card 1: Faturamento Bruto (Clicável para alternar Mês -> Ano -> Total) */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ translateY: -2, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleTogglePeriodo}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-green-500/40 relative group transition-all"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Faturamento Bruto</span>
              <span className="text-[10px] font-extrabold bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                {getLabelPeriodo()}
                <RotateCw className="h-2.5 w-2.5 opacity-60 group-hover:rotate-180 transition-transform duration-500" />
              </span>
            </div>
            <div className="p-2 rounded-full bg-green-500/10 text-green-500"><ArrowUpRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-green-500 tracking-tight">
            R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>

        {/* Card 2: Despesas */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ translateY: -2, scale: 1.01 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Despesas</span>
              <span className="text-[10px] font-semibold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                {getLabelPeriodo()}
              </span>
            </div>
            <div className="p-2 rounded-full bg-red-500/10 text-red-500"><ArrowDownRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-red-500 tracking-tight">
            R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {totalComprasCompradas > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
              Inclui R$ {totalComprasCompradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em compras efetuadas.
            </p>
          )}
        </motion.div>

        {/* Card 3: Lucro Líquido Real */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ translateY: -2, scale: 1.01 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border border-l-4 border-l-blue-500"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lucro Líquido Real</span>
              <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                {getLabelPeriodo()}
              </span>
            </div>
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Wallet className="h-5 w-5" /></div>
          </div>
          <p className={`mt-4 text-3xl font-extrabold tracking-tight ${lucroLiquido >= 0 ? "text-blue-500" : "text-red-500"}`}>
            R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
      </motion.div>

      {/* Extrato Recente Filtrado pelo Período Selecionado */}
      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Extrato Recente {getLabelPeriodo()}
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Exibindo {extratoList.length} transações no período selecionado
          </span>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Carregando extrato...</div>
          ) : extratoList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhuma transação encontrada para {getLabelPeriodo().toLowerCase()}.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {extratoList.map((item, i) => (
                <motion.div 
                  layout
                  key={`${item.desc}-${item.data}-${i}`} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6 flex justify-between items-center hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {item.data}
                    </p>
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

