"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Fuel, 
  Wrench, 
  CircleDollarSign, 
  MapPin,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

// Mock data fallbacks
const initialMockServices = [
  { id: "s1", cliente: "João Silva", telefone: "(11) 99999-8888", data: "2026-06-18", hora: "14:30", origem: "Centro", destino: "Vila Nova", veiculo: "Honda Civic", placa: "ABC-1234", kmInicial: 100, kmFinal: 125, kmPercorrido: 25, valor: 250, descricao: "Serviço padrão de guincho." },
  { id: "s2", cliente: "Maria Oliveira", telefone: "(11) 98888-7777", data: "2026-06-17", hora: "10:15", origem: "Aeroporto", destino: "Jardins", veiculo: "Toyota Corolla", placa: "XYZ-9876", kmInicial: 200, kmFinal: 235, kmPercorrido: 35, valor: 380, descricao: "Carro com pane mecânica." },
  { id: "s3", cliente: "Carlos Souza", telefone: "(11) 97777-6666", data: "2026-05-12", hora: "08:00", origem: "Bairro Alto", destino: "Oficina Central", veiculo: "Fiat Palio", placa: "MNO-4567", kmInicial: 50, kmFinal: 70, kmPercorrido: 20, valor: 180, descricao: "Bateria arriada." }
];
const initialMockFuel = [
  { id: "a1", veiculo: "Guincho 01", location: "Posto Ipiranga", data: "2026-06-18", km: 145200, litros: 60, valor: 350 },
  { id: "a2", veiculo: "Guincho 02", location: "Posto Shell", data: "2026-06-17", km: 85400, litros: 50, valor: 310 },
  { id: "a3", veiculo: "Guincho 01", location: "Posto Petrobras", data: "2026-05-15", km: 144500, litros: 55, valor: 320 }
];
const initialMockMaintenance = [
  { id: "m1", tipo: "Troca de Óleo e Filtros", veiculo: "Guincho 02", data: "2026-06-10", km: 85000, valor: 450, observacoes: "Revisão preventiva" },
  { id: "m2", tipo: "Revisão de Freios", veiculo: "Guincho 01", data: "2026-05-05", km: 144200, valor: 650, observacoes: "Pastilhas e discos trocados" }
];

const monthNames: { [key: string]: string } = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro"
};

export default function RelatoriosPage() {
  const { data: servicos, loading: loadingS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM } = useCollection("manutencoes", initialMockMaintenance);

  const loading = loadingS || loadingA || loadingM;

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"servicos" | "abastecimentos" | "manutencoes">("servicos");

  // Estrutura agrupada por ano e mês
  const reportsData = useMemo(() => {
    const groups: {
      [year: string]: {
        [month: string]: {
          servicos: any[];
          abastecimentos: any[];
          manutencoes: any[];
          faturamento: number;
          despesasCombustivel: number;
          despesasManutencao: number;
          lucroLiquido: number;
          kmPercorrido: number;
          litrosAbastecidos: number;
        }
      }
    } = {};

    const getYearMonth = (dateStr: string) => {
      if (!dateStr) return { year: "Sem Data", month: "Sem Data" };
      const parts = dateStr.split("-");
      if (parts.length >= 2) {
        return { year: parts[0], month: parts[1] };
      }
      return { year: "Outros", month: "Outros" };
    };

    const ensurePath = (year: string, month: string) => {
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) {
        groups[year][month] = {
          servicos: [],
          abastecimentos: [],
          manutencoes: [],
          faturamento: 0,
          despesasCombustivel: 0,
          despesasManutencao: 0,
          lucroLiquido: 0,
          kmPercorrido: 0,
          litrosAbastecidos: 0,
        };
      }
    };

    servicos.forEach(s => {
      const { year, month } = getYearMonth(s.data);
      ensurePath(year, month);
      const group = groups[year][month];
      group.servicos.push(s);
      group.faturamento += Number(s.valor) || 0;
      group.kmPercorrido += Number(s.kmPercorrido) || 0;
    });

    abastecimentos.forEach(a => {
      const { year, month } = getYearMonth(a.data);
      ensurePath(year, month);
      const group = groups[year][month];
      group.abastecimentos.push(a);
      group.despesasCombustivel += Number(a.valor) || 0;
      group.litrosAbastecidos += Number(a.litros) || 0;
    });

    manutencoes.forEach(m => {
      const { year, month } = getYearMonth(m.data);
      ensurePath(year, month);
      const group = groups[year][month];
      group.manutencoes.push(m);
      group.despesasManutencao += Number(m.valor) || 0;
    });

    Object.keys(groups).forEach(year => {
      Object.keys(groups[year]).forEach(month => {
        const group = groups[year][month];
        group.lucroLiquido = group.faturamento - (group.despesasCombustivel + group.despesasManutencao);
      });
    });

    return groups;
  }, [servicos, abastecimentos, manutencoes]);

  // Lista ordenada de anos disponíveis
  const years = useMemo(() => {
    return Object.keys(reportsData).sort((a, b) => b.localeCompare(a));
  }, [reportsData]);

  // Lista ordenada de meses disponíveis para o ano selecionado
  const months = useMemo(() => {
    if (!selectedYear || !reportsData[selectedYear]) return [];
    return Object.keys(reportsData[selectedYear]).sort((a, b) => b.localeCompare(a));
  }, [reportsData, selectedYear]);

  // Selecionar valores iniciais padrão assim que os dados carregarem
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  useEffect(() => {
    if (selectedYear && months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [selectedYear, months, selectedMonth]);

  // Resumo anual para o ano selecionado
  const annualStats = useMemo(() => {
    if (!selectedYear || !reportsData[selectedYear]) {
      return { faturamento: 0, despesas: 0, lucro: 0 };
    }
    let faturamento = 0;
    let despesas = 0;
    Object.keys(reportsData[selectedYear]).forEach(month => {
      const group = reportsData[selectedYear][month];
      faturamento += group.faturamento;
      despesas += (group.despesasCombustivel + group.despesasManutencao);
    });
    return {
      faturamento,
      despesas,
      lucro: faturamento - despesas
    };
  }, [reportsData, selectedYear]);

  // Dados do mês selecionado
  const activeMonthData = useMemo(() => {
    if (!selectedYear || !selectedMonth || !reportsData[selectedYear]?.[selectedMonth]) {
      return null;
    }
    return reportsData[selectedYear][selectedMonth];
  }, [reportsData, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Relatórios Operacionais
        </h1>
        <p className="text-sm text-muted-foreground">Histórico financeiro e operacional agrupado por ano e mês.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando relatórios...</div>
      ) : years.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
          Nenhum dado registrado para gerar relatórios.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Seletor Lateral (Ano / Mês) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Filtro Temporal
              </h2>

              <div className="space-y-4">
                {/* Seleção do Ano */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ano</label>
                  <div className="flex flex-wrap gap-2">
                    {years.map(y => (
                      <button
                        key={y}
                        onClick={() => {
                          setSelectedYear(y);
                          setSelectedMonth(""); // Reseta o mês ao trocar o ano
                        }}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                          selectedYear === y 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "bg-muted text-muted-foreground hover:bg-border hover:text-foreground"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção do Mês */}
                {selectedYear && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mês</label>
                    <div className="grid grid-cols-2 gap-2">
                      {months.map(m => (
                        <button
                          key={m}
                          onClick={() => setSelectedMonth(m)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm font-medium transition-all ${
                            selectedMonth === m 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
                          }`}
                        >
                          <span>{monthNames[m] || m}</span>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo Anual (Discreto) */}
            {selectedYear && (
              <div className="rounded-2xl bg-muted/40 p-5 border border-border/80">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Resumo Anual ({selectedYear})
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Faturamento:</span>
                    <span className="font-semibold text-foreground">
                      R$ {annualStats.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Despesas Totais:</span>
                    <span className="font-semibold text-red-500">
                      R$ {annualStats.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/85 text-sm">
                    <span className="font-semibold text-muted-foreground">Lucro Líquido:</span>
                    <span className={`font-bold ${annualStats.lucro >= 0 ? "text-green-500" : "text-red-500"}`}>
                      R$ {annualStats.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Painel de Dados Detalhados do Mês */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {activeMonthData ? (
                <motion.div
                  key={`${selectedYear}-${selectedMonth}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
                    <div className="border-b border-border pb-4">
                      <h2 className="text-xl font-bold">
                        Dados de {monthNames[selectedMonth] || selectedMonth} de {selectedYear}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">Estatísticas detalhadas consolidadas do período.</p>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                          Receitas
                        </span>
                        <span className="text-base sm:text-lg font-bold text-green-500 mt-1 block">
                          R$ {activeMonthData.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                          Combustível
                        </span>
                        <span className="text-base sm:text-lg font-bold text-red-500 mt-1 block">
                          R$ {activeMonthData.despesasCombustivel.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                          Manutenção
                        </span>
                        <span className="text-base sm:text-lg font-bold text-red-500 mt-1 block">
                          R$ {activeMonthData.despesasManutencao.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className={`p-4 rounded-xl border ${
                        activeMonthData.lucroLiquido >= 0 
                          ? "bg-green-500/5 border-green-500/10" 
                          : "bg-red-500/5 border-red-500/10"
                      }`}>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                          Lucro Líquido
                        </span>
                        <span className={`text-base sm:text-lg font-bold mt-1 block ${
                          activeMonthData.lucroLiquido >= 0 ? "text-green-600" : "text-red-500"
                        }`}>
                          R$ {activeMonthData.lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* KMs e Litragem */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Distância Rodada</p>
                          <p className="text-base font-bold text-foreground mt-0.5">{activeMonthData.kmPercorrido.toLocaleString("pt-BR")} km</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-500/10 p-2.5 text-amber-500">
                          <Fuel className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Litragem Consumida</p>
                          <p className="text-base font-bold text-foreground mt-0.5">{(activeMonthData.litrosAbastecidos || 0).toLocaleString("pt-BR")} Litros</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Listagem das Transações do Mês */}
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="flex border-b border-border bg-muted/20">
                      <button
                        onClick={() => setActiveTab("servicos")}
                        className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                          activeTab === "servicos" 
                            ? "border-primary text-primary bg-card" 
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Truck className="h-4 w-4" /> Serviços ({activeMonthData.servicos.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("abastecimentos")}
                        className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                          activeTab === "abastecimentos" 
                            ? "border-primary text-primary bg-card" 
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Fuel className="h-4 w-4" /> Combustível ({activeMonthData.abastecimentos.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("manutencoes")}
                        className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                          activeTab === "manutencoes" 
                            ? "border-primary text-primary bg-card" 
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Wrench className="h-4 w-4" /> Manutenções ({activeMonthData.manutencoes.length})
                      </button>
                    </div>

                    <div className="divide-y divide-border max-h-[350px] overflow-y-auto">
                      {activeTab === "servicos" && (
                        activeMonthData.servicos.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum serviço registrado neste mês.</div>
                        ) : (
                          activeMonthData.servicos.map((s, index) => (
                            <div key={s.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/20">
                              <div>
                                <p className="font-semibold text-foreground">{s.cliente} ({s.veiculo})</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{s.origem} → {s.destino} | {s.data}</p>
                              </div>
                              <span className="font-bold text-green-500">R$ {Number(s.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === "abastecimentos" && (
                        activeMonthData.abastecimentos.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum abastecimento registrado neste mês.</div>
                        ) : (
                          activeMonthData.abastecimentos.map((a, index) => (
                            <div key={a.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/20">
                              <div>
                                <p className="font-semibold text-foreground">{a.veiculo || "Geral"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{a.litros} Litros | KM: {(Number(a.km) || 0).toLocaleString("pt-BR")} | {a.data}</p>
                              </div>
                              <span className="font-bold text-red-500">R$ {Number(a.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === "manutencoes" && (
                        activeMonthData.manutencoes.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma manutenção registrada neste mês.</div>
                        ) : (
                          activeMonthData.manutencoes.map((m, index) => (
                            <div key={m.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/20">
                              <div>
                                <p className="font-semibold text-foreground">{m.tipo} ({m.veiculo})</p>
                                <p className="text-xs text-muted-foreground mt-0.5">KM: {(Number(m.km) || 0).toLocaleString("pt-BR")} | {m.data}</p>
                              </div>
                              <span className="font-bold text-red-500">R$ {Number(m.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
                  Selecione um mês e ano ao lado para carregar o relatório.
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
