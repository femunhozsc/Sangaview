"use client";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  MapPin, 
  Wrench, 
  DollarSign,
  Fuel,
  Bell,
  ShoppingCart,
  Square,
  Check,
  ListTodo,
  ChevronRight
} from "lucide-react";
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
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const initialMockServices: any[] = [];
const initialMockFuel: any[] = [];
const initialMockMaintenance: any[] = [];
const initialMockShopping: any[] = [];
const initialMockReminders: any[] = [];

export default function Dashboard() {
  const { data: servicos, loading: loadingS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM } = useCollection("manutencoes", initialMockMaintenance);
  const { data: compras, updateDocument: updateCompra } = useCollection("compras", initialMockShopping);
  const { data: lembretes, updateDocument: updateLembrete } = useCollection("lembretes", initialMockReminders);

  const loading = loadingS || loadingA || loadingM;

  // Data atual para cálculo do Mês Atual
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

  // Filtragem dos registros do MÊS ATUAL
  const servicosMesAtual = useMemo(() => {
    return servicos.filter(s => isInCurrentMonth(s.data));
  }, [servicos, currentYear, currentMonth]);

  const abastecimentosMesAtual = useMemo(() => {
    return abastecimentos.filter(a => isInCurrentMonth(a.data));
  }, [abastecimentos, currentYear, currentMonth]);

  const manutencoesMesAtual = useMemo(() => {
    return manutencoes.filter(m => isInCurrentMonth(m.data));
  }, [manutencoes, currentYear, currentMonth]);

  const comprasMesAtual = useMemo(() => {
    return compras.filter(c => c.comprado && isInCurrentMonth(c.compradoEm));
  }, [compras, currentYear, currentMonth]);

  // Faturamento Mês Atual
  const faturamentoMes = useMemo(() => {
    return servicosMesAtual.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [servicosMesAtual]);

  // Custos Mês Atual
  const custosMes = useMemo(() => {
    const totalCombustivel = abastecimentosMesAtual.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalManut = manutencoesMesAtual.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalCompras = comprasMesAtual.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
    
    const totalPedagioServicos = servicosMesAtual.reduce((acc, curr) => acc + (Number(curr.valorPedagio) || 0), 0);
    const totalOutrosCustosServicos = servicosMesAtual.reduce((acc, curr) => {
      const outros = curr.outrosCustos || [];
      const sumOutros = outros.reduce((sum: number, c: any) => sum + (Number(c.valor) || 0), 0);
      return acc + sumOutros;
    }, 0);
    
    return totalCombustivel + totalManut + totalPedagioServicos + totalOutrosCustosServicos + totalCompras;
  }, [abastecimentosMesAtual, manutencoesMesAtual, servicosMesAtual, comprasMesAtual]);

  const lucroEstimadoMes = faturamentoMes - custosMes;

  const totalKmRodadosMes = useMemo(() => {
    return servicosMesAtual.reduce((acc, curr) => acc + (Number(curr.kmPercorrido) || 0), 0);
  }, [servicosMesAtual]);

  const totalLitrosCombustivelMes = useMemo(() => {
    return abastecimentosMesAtual.reduce((acc, curr) => acc + (Number(curr.litros) || 0), 0);
  }, [abastecimentosMesAtual]);

  // Filtros rápidos de pendências para o widget do Dashboard
  const lembretesPendentes = useMemo(() => {
    return lembretes.filter(r => !r.feita).slice(0, 5);
  }, [lembretes]);

  const comprasPendentes = useMemo(() => {
    return compras.filter(c => !c.comprado).slice(0, 5);
  }, [compras]);

  const handleToggleLembrete = async (id: string) => {
    try {
      await updateLembrete(id, { feita: true });
    } catch (err) {
      console.error("Erro ao concluir lembrete:", err);
    }
  };

  const handleToggleCompra = async (item: any) => {
    try {
      await updateCompra(item.id, { 
        comprado: true,
        compradoEm: new Date().toISOString().split("T")[0]
      });
    } catch (err) {
      console.error("Erro ao comprar item:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumo e gestão das operações da Sanga Auto Socorro.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando painel...</div>
      ) : (
        <>
          {/* Resumos Financeiros e Operacionais */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Card 1: Resumo Financeiro (Mês Atual) */}
            <Link href="/financeiro" className="block">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01, translateY: -2 }}
                whileTap={{ scale: 0.99 }}
                className="flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border border-l-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 border-l-primary"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Resumo Financeiro ({currentMonthName})
                      </span>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Mês Atual
                      </span>
                    </div>
                    <div className="rounded-xl p-2 bg-primary/10 text-primary">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Faturamento Bruto</span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-foreground">
                      R$ {faturamentoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/80">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                      <TrendingUp className={`h-3 w-3 ${lucroEstimadoMes >= 0 ? "text-green-500" : "text-red-500"}`} /> Lucro Estimado
                    </span>
                    <p className={`text-base sm:text-lg font-bold ${lucroEstimadoMes >= 0 ? "text-green-500" : "text-red-500"}`}>
                      R$ {lucroEstimadoMes.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500" /> Custos
                    </span>
                    <p className="text-base sm:text-lg font-bold text-foreground">
                      R$ {custosMes.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Card 2: Indicadores Operacionais */}
            <motion.div
              variants={itemVariants}
              className="flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border border-l-4 border-l-blue-500"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Indicadores Operacionais ({currentMonthName})
                  </span>
                  <div className="rounded-xl p-2 bg-blue-500/10 text-blue-500">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-4">
                  Clique nos cards abaixo para visualizar histórico
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link href="/servicos" className="block">
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/60 hover:bg-muted hover:border-blue-500/20 active:scale-[0.98] transition-all cursor-pointer">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-blue-500" /> KM Rodados (Mês)
                    </span>
                    <p className="text-lg sm:text-xl font-extrabold text-foreground mt-1">
                      {totalKmRodadosMes.toLocaleString("pt-BR")} km
                    </p>
                  </div>
                </Link>

                <Link href="/abastecimentos" className="block">
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/60 hover:bg-muted hover:border-amber-500/20 active:scale-[0.98] transition-all cursor-pointer">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-amber-500" /> Combustível (Mês)
                    </span>
                    <p className="text-lg sm:text-xl font-extrabold text-foreground mt-1">
                      {totalLitrosCombustivelMes.toLocaleString("pt-BR")} L
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* CARD GRANDE: WIDGET INTEGRADO DE LEMBRETES E COMPRAS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card p-6 shadow-sm border border-border"
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
              <ListTodo className="h-5 w-5 text-primary" /> Painel de Pendências Rápidas
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Conclua lembretes ou registre compras diretamente da tela inicial.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Coluna Lembretes */}
              <div className="space-y-4 pb-6 md:pb-0">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Bell className="h-4 w-4 text-primary" /> Lembretes Pendentes</span>
                  <Link href="/lembretes" className="text-xs text-blue-500 font-semibold hover:underline">Ver todos</Link>
                </h3>

                {lembretesPendentes.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
                    Nenhum lembrete pendente no momento!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {lembretesPendentes.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors"
                        >
                          <button 
                            onClick={() => handleToggleLembrete(item.id)}
                            className="text-muted-foreground hover:text-primary mt-0.5 shrink-0 cursor-pointer"
                          >
                            <Square className="h-4.5 w-4.5" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">{item.texto}</p>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">Prazo: {item.data}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Coluna Lista de Compras */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-6">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><ShoppingCart className="h-4 w-4 text-amber-500" /> Lista de Compras</span>
                  <Link href="/lista-compras" className="text-xs text-blue-500 font-semibold hover:underline">Ver todos</Link>
                </h3>

                {comprasPendentes.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
                    Nenhum item pendente para comprar!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {comprasPendentes.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button 
                              onClick={() => handleToggleCompra(item)}
                              className="h-5 w-5 rounded-full border-2 border-border hover:border-primary flex items-center justify-center text-transparent hover:text-muted-foreground/30 shrink-0 cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <p className="text-xs font-semibold text-foreground truncate">{item.item}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">{item.quantidade}</span>
                            {item.preco !== undefined && item.preco > 0 && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                R$ {item.preco}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Listas adicionais de histórico de serviços */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Últimos Serviços */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-card p-6 shadow-sm border border-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Últimos Serviços
                  </h2>
                  <Link href="/servicos" className="text-sm font-medium text-blue-500 hover:underline">
                    Ver todos
                  </Link>
                </div>
                
                {servicos.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Nenhum serviço recente.</div>
                ) : (
                  <div className="space-y-2">
                    {servicos.slice(0, 3).map((servico) => (
                      <Link 
                        key={servico.id} 
                        href={`/servicos?id=${servico.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {servico.cliente}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {servico.origem} → {servico.destino}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          <div>
                            <p className="font-semibold text-sm text-green-500">R$ {Number(servico.valor).toLocaleString("pt-BR")}</p>
                            <p className="text-[10px] text-muted-foreground">{servico.data}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Abastecimentos */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl bg-card p-6 shadow-sm border border-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-amber-500" />
                    Abastecimentos
                  </h2>
                  <Link href="/abastecimentos" className="text-sm font-medium text-blue-500 hover:underline">
                    Ver todos
                  </Link>
                </div>

                {/* Total do Mês Atual */}
                <div className="mb-4 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Custos Combustível ({currentMonthName})</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    R$ {custosMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {abastecimentos.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Nenhum abastecimento recente.</div>
                ) : (
                  <div className="space-y-2">
                    {abastecimentos.slice(0, 3).map((item) => (
                      <Link 
                        key={item.id} 
                        href={`/abastecimentos?id=${item.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-semibold text-sm truncate group-hover:text-amber-500 transition-colors">{item.veiculo}</p>
                          <p className="text-xs text-muted-foreground">{item.litros} Litros</p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          <div>
                            <p className="font-semibold text-sm text-foreground">R$ {Number(item.valor).toLocaleString("pt-BR")}</p>
                            <p className="text-[10px] text-muted-foreground">{item.data}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Próximas Manutenções */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card p-6 shadow-sm border border-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-500" />
                    Próximas Manutenções
                  </h2>
                  <Link href="/manutencoes" className="text-sm font-medium text-blue-500 hover:underline">
                    Ver todos
                  </Link>
                </div>
                
                {manutencoes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Nenhuma manutenção recente.</div>
                ) : (
                  <div className="space-y-3">
                    {manutencoes.slice(0, 2).map((item, idx) => (
                      <Link
                        key={item.id} 
                        href={`/manutencoes?id=${item.id}`}
                        className={`flex items-start gap-4 rounded-xl p-4 border transition-all cursor-pointer group ${
                          idx === 0 
                            ? "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20" 
                            : "bg-muted border-border hover:bg-muted/80"
                        }`}
                      >
                        <div className={`rounded-full p-2 text-white shrink-0 ${idx === 0 ? "bg-orange-500" : "bg-muted-foreground/40"}`}>
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold text-sm truncate ${idx === 0 ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`}>
                            {item.tipo} - {item.veiculo}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">KM: {item.km?.toLocaleString("pt-BR")} | {item.data}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

