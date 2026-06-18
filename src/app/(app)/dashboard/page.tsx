"use client";

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

const stats = [
  { 
    name: "Faturamento do Mês", 
    value: "R$ 18.500", 
    change: "+12%", 
    trend: "up", 
    icon: TrendingUp, 
    color: "text-green-500", 
    bg: "bg-green-500/10",
    href: "/financeiro"
  },
  { 
    name: "Custos do Mês", 
    value: "R$ 6.200", 
    change: "-2%", 
    trend: "down", 
    icon: TrendingDown, 
    color: "text-red-500", 
    bg: "bg-red-500/10",
    href: "/financeiro"
  },
  { 
    name: "Lucro Estimado", 
    value: "R$ 12.300", 
    change: "+8%", 
    trend: "up", 
    icon: DollarSign, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10",
    href: "/financeiro"
  },
  { 
    name: "Quilômetros Rodados", 
    value: "3.240 km", 
    change: "+150km", 
    trend: "up", 
    icon: MapPin, 
    color: "text-orange-500", 
    bg: "bg-orange-500/10",
    href: "/manutencoes"
  },
];

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

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumo das operações da Sanga Auto Socorro.</p>
      </div>

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
                <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">Guincho - Honda Civic</p>
                    <p className="text-xs text-muted-foreground">Centro → Vila Nova</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-500">R$ 250</p>
                    <p className="text-[10px] text-muted-foreground">Hoje, 14:30</p>
                  </div>
                </div>
              ))}
            </div>
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
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">R$ 3.450</p>
            </div>

            <div className="space-y-4">
              {[
                { vehicle: "Guincho 01", location: "Posto Ipiranga", amount: "R$ 350", date: "Hoje, 09:15" },
                { vehicle: "Guincho 02", location: "Posto Shell", amount: "R$ 420", date: "Ontem, 17:30" },
                { vehicle: "Guincho 01", location: "Posto BR", amount: "R$ 380", date: "15 Jun, 11:20" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-foreground">{item.amount}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-xl bg-orange-500/10 p-4 border border-orange-500/20">
                <div className="rounded-full bg-orange-500 p-2 text-white">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-orange-600 dark:text-orange-400 text-sm">Troca de Óleo - Guincho 01</p>
                  <p className="text-xs text-muted-foreground mt-1">Faltam 800 km para a próxima troca (Previsto para esta semana).</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-muted p-4">
                <div className="rounded-full bg-muted-foreground/20 p-2 text-muted-foreground">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Revisão Freios - Guincho 02</p>
                  <p className="text-xs text-muted-foreground mt-1">Agendado para 25/06.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

