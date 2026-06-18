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
  Edit2,
  Trash2,
  X
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
  const { data: servicos, loading: loadingS, updateDocument: updateS, deleteDocument: deleteS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA, updateDocument: updateA, deleteDocument: deleteA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM, updateDocument: updateM, deleteDocument: deleteM } = useCollection("manutencoes", initialMockMaintenance);

  const loading = loadingS || loadingA || loadingM;

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"servicos" | "abastecimentos" | "manutencoes">("servicos");

  // Estados de edição unificada
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<"servico" | "abastecimento" | "manutencao" | null>(null);

  const handleStartEdit = (item: any, type: "servico" | "abastecimento" | "manutencao") => {
    setEditingItem({ ...item });
    setEditingType(type);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingType) return;

    try {
      if (editingType === "servico") {
        await updateS(editingItem.id, {
          cliente: editingItem.cliente,
          veiculo: editingItem.veiculo || "",
          origem: editingItem.origem || "",
          destino: editingItem.destino || "",
          data: editingItem.data || "",
          hora: editingItem.hora || "",
          valor: Number(editingItem.valor) || 0,
          kmInicial: Number(editingItem.kmInicial) || 0,
          kmFinal: Number(editingItem.kmFinal) || 0,
          kmPercorrido: (Number(editingItem.kmFinal) - Number(editingItem.kmInicial) > 0) ? (Number(editingItem.kmFinal) - Number(editingItem.kmInicial)) : 0,
          descricao: editingItem.descricao || ""
        });
      } else if (editingType === "abastecimento") {
        await updateA(editingItem.id, {
          veiculo: editingItem.veiculo || "",
          data: editingItem.data || "",
          km: Number(editingItem.km) || 0,
          litros: Number(editingItem.litros) || 0,
          valor: Number(editingItem.valor) || 0
        });
      } else if (editingType === "manutencao") {
        await updateM(editingItem.id, {
          tipo: editingItem.tipo || "",
          veiculo: editingItem.veiculo || "",
          data: editingItem.data || "",
          km: Number(editingItem.km) || 0,
          valor: Number(editingItem.valor) || 0,
          observacoes: editingItem.observacoes || ""
        });
      }
      alert("Registro atualizado com sucesso!");
      setEditingItem(null);
      setEditingType(null);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert("Erro ao salvar as alterações.");
    }
  };

  const handleDeleteItem = async (id: string, type: "servico" | "abastecimento" | "manutencao") => {
    const label = type === "servico" ? "serviço" : type === "abastecimento" ? "abastecimento" : "registro de manutenção";
    if (window.confirm(`Tem certeza de que deseja excluir este ${label}?`)) {
      try {
        if (type === "servico") {
          await deleteS(id);
        } else if (type === "abastecimento") {
          await deleteA(id);
        } else if (type === "manutencao") {
          await deleteM(id);
        }
        alert("Registro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar registro:", error);
        alert("Erro ao excluir o registro.");
      }
    }
  };

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
                            <div key={s.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/20 gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{s.cliente} ({s.veiculo})</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.origem} → {s.destino} | {s.data}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-green-500">R$ {Number(s.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => handleStartEdit(s, "servico")} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => handleDeleteItem(s.id, "servico")} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === "abastecimentos" && (
                        activeMonthData.abastecimentos.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum abastecimento registrado neste mês.</div>
                        ) : (
                          activeMonthData.abastecimentos.map((a, index) => (
                            <div key={a.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/20 gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{a.veiculo || "Geral"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.litros} Litros | KM: {(Number(a.km) || 0).toLocaleString("pt-BR")} | {a.data}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-red-500">R$ {Number(a.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => handleStartEdit(a, "abastecimento")} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => handleDeleteItem(a.id, "abastecimento")} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === "manutencoes" && (
                        activeMonthData.manutencoes.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma manutenção registrada neste mês.</div>
                        ) : (
                          activeMonthData.manutencoes.map((m, index) => (
                            <div key={m.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/20 gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{m.tipo} ({m.veiculo})</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">KM: {(Number(m.km) || 0).toLocaleString("pt-BR")} | {m.data}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-red-500">R$ {Number(m.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => handleStartEdit(m, "manutencao")} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => handleDeleteItem(m.id, "manutencao")} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
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

      {/* Modal Unificado de Edição */}
      <AnimatePresence>
        {editingItem && editingType && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setEditingItem(null); setEditingType(null); }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <h2 className="text-xl font-bold">
                  Editar {editingType === 'servico' ? 'Serviço' : editingType === 'abastecimento' ? 'Abastecimento' : 'Manutenção'}
                </h2>
                <button onClick={() => { setEditingItem(null); setEditingType(null); }} className="rounded-full bg-muted p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 p-6 overflow-y-auto max-h-[60vh] bg-background">
                {editingType === "servico" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Cliente</label>
                      <input type="text" value={editingItem.cliente || ""} onChange={e => setEditingItem({ ...editingItem, cliente: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Veículo</label>
                      <input type="text" value={editingItem.veiculo || ""} onChange={e => setEditingItem({ ...editingItem, veiculo: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Origem</label>
                        <input type="text" value={editingItem.origem || ""} onChange={e => setEditingItem({ ...editingItem, origem: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Destino</label>
                        <input type="text" value={editingItem.destino || ""} onChange={e => setEditingItem({ ...editingItem, destino: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data</label>
                        <input type="date" value={editingItem.data || ""} onChange={e => setEditingItem({ ...editingItem, data: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Valor</label>
                        <input type="number" step="0.01" value={editingItem.valor || 0} onChange={e => setEditingItem({ ...editingItem, valor: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary font-bold text-green-600" />
                      </div>
                    </div>
                  </>
                )}

                {editingType === "abastecimento" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Veículo</label>
                      <input type="text" value={editingItem.veiculo || ""} onChange={e => setEditingItem({ ...editingItem, veiculo: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data</label>
                        <input type="date" value={editingItem.data || ""} onChange={e => setEditingItem({ ...editingItem, data: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">KM</label>
                        <input type="number" value={editingItem.km || 0} onChange={e => setEditingItem({ ...editingItem, km: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Litros</label>
                        <input type="number" step="0.1" value={editingItem.litros || 0} onChange={e => setEditingItem({ ...editingItem, litros: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Valor</label>
                        <input type="number" step="0.01" value={editingItem.valor || 0} onChange={e => setEditingItem({ ...editingItem, valor: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary font-bold text-red-500" />
                      </div>
                    </div>
                  </>
                )}

                {editingType === "manutencao" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo / Peça</label>
                      <input type="text" value={editingItem.tipo || ""} onChange={e => setEditingItem({ ...editingItem, tipo: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Veículo</label>
                      <input type="text" value={editingItem.veiculo || ""} onChange={e => setEditingItem({ ...editingItem, veiculo: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data</label>
                        <input type="date" value={editingItem.data || ""} onChange={e => setEditingItem({ ...editingItem, data: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">KM</label>
                        <input type="number" value={editingItem.km || 0} onChange={e => setEditingItem({ ...editingItem, km: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Valor</label>
                      <input type="number" step="0.01" value={editingItem.valor || 0} onChange={e => setEditingItem({ ...editingItem, valor: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary font-bold text-red-500" />
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => { setEditingItem(null); setEditingType(null); }} className="flex-1 py-3 text-sm font-semibold text-muted-foreground bg-muted rounded-xl hover:bg-border transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-all">
                    Salvar
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
