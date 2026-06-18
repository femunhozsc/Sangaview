"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

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

export default function FinanceiroPage() {
  const { data: servicos, loading: loadingS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM } = useCollection("manutencoes", initialMockMaintenance);

  const loading = loadingS || loadingA || loadingM;

  // Calcula os totais financeiros
  const totalReceitas = useMemo(() => {
    return servicos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [servicos]);

  const totalDespesas = useMemo(() => {
    const totalCombustivel = abastecimentos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    const totalManut = manutencoes.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    return totalCombustivel + totalManut;
  }, [abastecimentos, manutencoes]);

  const lucroLiquido = totalReceitas - totalDespesas;

  // Combina e ordena o extrato unificado de transações
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
  }, [servicos, abastecimentos, manutencoes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Controle de receitas e despesas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Receitas (Serviços)</span>
            <div className="p-2 rounded-full bg-green-500/10 text-green-500"><ArrowUpRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-green-500">
            R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Despesas (Total)</span>
            <div className="p-2 rounded-full bg-red-500/10 text-red-500"><ArrowDownRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-red-500">
            R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Wallet className="h-5 w-5" /></div>
          </div>
          <p className={`mt-4 text-3xl font-bold ${lucroLiquido >= 0 ? "text-blue-500" : "text-red-500"}`}>
            R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Extrato Recente
          </h2>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Carregando extrato...</div>
          ) : extratoList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Nenhuma transação registrada.</div>
          ) : (
            extratoList.map((item, i) => (
              <div key={i} className="p-4 sm:p-6 flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{item.desc}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.data}</p>
                </div>
                <p className={`font-bold ${item.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                  {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

