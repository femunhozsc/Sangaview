"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";

export default function FinanceiroPage() {
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
          <p className="mt-4 text-3xl font-bold text-green-500">R$ 18.500</p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Despesas (Total)</span>
            <div className="p-2 rounded-full bg-red-500/10 text-red-500"><ArrowDownRight className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-red-500">R$ 6.200</p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Lucro Líquido</span>
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500"><Wallet className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-blue-500">R$ 12.300</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Extrato Recente
          </h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { tipo: 'receita', desc: 'Serviço Guincho - Honda Civic', valor: '250,00', data: '18/06/2026' },
            { tipo: 'despesa', desc: 'Abastecimento Guincho 01', valor: '350,00', data: '18/06/2026' },
            { tipo: 'receita', desc: 'Serviço Guincho - BMW X1', valor: '400,00', data: '17/06/2026' },
            { tipo: 'despesa', desc: 'Troca de Óleo', valor: '450,00', data: '15/06/2026' },
          ].map((item, i) => (
            <div key={i} className="p-4 sm:p-6 flex justify-between items-center hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">{item.desc}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.data}</p>
              </div>
              <p className={`font-bold ${item.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
