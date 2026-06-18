"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  MapPin, 
  Wrench, 
  DollarSign,
  Fuel
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

// Mock data fallbacks
const initialMockServices = [
  { id: "s1", cliente: "João Silva", veiculo: "Honda Civic", valor: 250, data: "2026-06-18", origem: "Centro", destino: "Vila Nova", kmPercorrido: 25 },
  { id: "s2", cliente: "Maria Oliveira", veiculo: "Toyota Corolla", valor: 380, data: "2026-06-17", origem: "Aeroporto", destino: "Jardins", kmPercorrido: 35 }
];
const initialMockFuel = [
  { id: "a1", veiculo: "Guincho 01", location: "Posto Ipiranga", valor: 350, data: "2026-06-18", litros: 60 },
  { id: "a2", veiculo: "Guincho 02", location: "Posto Shell", valor: 310, data: "2026-06-17", litros: 50 }
];
const initialMockMaintenance = [
  { id: "m1", tipo: "Troca de Óleo e Filtros", veiculo: "Guincho 02", valor: 450, data: "2026-06-10", km: 85000 }
];

export default function Dashboard() {
  const { data: servicos, loading: loadingS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM } = useCollection("manutencoes", initialMockMaintenance);

  const loading = loadingS || loadingA || loadingM;

  // Calcula estatísticas
  const faturamentoTotal = useMemo(() => {
    return servicos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [servicos]);

  const custosTotal = useMemo(() => {
    const totalCombustivel = abastecimentos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalManut = manutencoes.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    return totalCombustivel + totalManut;
  }, [abastecimentos, manutencoes]);

  const lucroEstimado = faturamentoTotal - custosTotal;

  const totalKmRodados = useMemo(() => {
    return servicos.reduce((acc, curr) => acc + (Number(curr.kmPercorrido) || 0), 0);
  }, [servicos]);

  const totalCombustivelMes = useMemo(() => {
    return abastecimentos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [abastecimentos]);

  // Lista os 3 últimos serviços cadastrados
  const ultimosServicos = useMemo(() => {
    return servicos.slice(0, 3);
  }, [servicos]);

  // Lista os 3 últimos abastecimentos cadastrados
  const ultimosAbastecimentos = useMemo(() => {
    return abastecimentos.slice(0, 3);
  }, [abastecimentos]);

  // Lista as 2 últimas manutenções cadastradas
  const ultimasManutencoes = useMemo(() => {
    return manutencoes.slice(0, 2);
  }, [manutencoes]);

  // Array de cards de estatísticas dinâmicos
  const stats = useMemo(() => [
    { 
      name: "Faturamento do Mês", 
      value: `R$ ${faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
      change: "Atual", 
      trend: "up", 
      icon: TrendingUp, 
      color: "text-green-500", 
      bg: "bg-green-500/10",
      href: "/financeiro"
    },
    { 
      name: "Custos do Mês", 
      value: `R$ ${custosTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
      change: "Atual", 
      trend: "down", 
      icon: TrendingDown, 
      color: "text-red-500", 
      bg: "bg-red-500/10",
      href: "/financeiro"
    },
    { 
      name: "Lucro Estimado", 
      value: `R$ ${lucroEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
      change: "Líquido", 
      trend: lucroEstimado >= 0 ? "up" : "down", 
      icon: DollarSign, 
      color: lucroEstimado >= 0 ? "text-blue-500" : "text-red-500", 
      bg: lucroEstimado >= 0 ? "bg-blue-500/10" : "bg-red-500/10",
      href: "/financeiro"
    },
    { 
      name: "Quilômetros Rodados", 
      value: `${totalKmRodados.toLocaleString("pt-BR")} km`, 
      change: "Total", 
      trend: "up", 
      icon: MapPin, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      href: "/manutencoes"
    },
  ], [faturamentoTotal, custosTotal, lucroEstimado, totalKmRodados]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumo das operações da Sanga Auto Socorro.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando painel...</div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <Link href={stat.href} key={stat.name} className="block">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-full flex-col overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{stat.name}</span>
                    <div className={`rounded-xl p-2 ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                    <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>

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
                
                {ultimosServicos.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Nenhum serviço recente.</div>
                ) : (
                  <div className="space-y-4">
                    {ultimosServicos.map((servico) => (
                      <div key={servico.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm text-ellipsis overflow-hidden max-w-[150px] whitespace-nowrap">
                            {servico.cliente}
                          </p>
                          <p className="text-xs text-muted-foreground text-ellipsis overflow-hidden max-w-[150px] whitespace-nowrap">
                            {servico.origem} → {servico.destino}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-green-500">R$ {Number(servico.valor).toLocaleString("pt-BR")}</p>
                          <p className="text-[10px] text-muted-foreground">{servico.data}</p>
                        </div>
                      </div>
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

                {/* Total do Mês */}
                <div className="mb-4 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total do Mês</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    R$ {totalCombustivelMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {ultimosAbastecimentos.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Nenhum abastecimento recente.</div>
                ) : (
                  <div className="space-y-4">
                    {ultimosAbastecimentos.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm">{item.veiculo}</p>
                          <p className="text-xs text-muted-foreground">{item.litros} Litros</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-foreground">R$ {Number(item.valor).toLocaleString("pt-BR")}</p>
                          <p className="text-[10px] text-muted-foreground">{item.data}</p>
                        </div>
                      </div>
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
                
                {ultimasManutencoes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">Nenhuma manutenção recente.</div>
                ) : (
                  <div className="space-y-4">
                    {ultimasManutencoes.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-4 rounded-xl p-4 border ${
                          idx === 0 
                            ? "bg-orange-500/10 border-orange-500/20" 
                            : "bg-muted border-border"
                        }`}
                      >
                        <div className={`rounded-full p-2 text-white ${idx === 0 ? "bg-orange-500" : "bg-muted-foreground/40"}`}>
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${idx === 0 ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`}>
                            {item.tipo} - {item.veiculo}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">KM: {item.km?.toLocaleString("pt-BR")} | Realizado em {item.data}</p>
                        </div>
                      </div>
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


