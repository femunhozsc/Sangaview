"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
  X,
  ShoppingCart,
  DollarSign,
  Coins,
  Save,
  Download,
  Phone,
  Clock,
  Eye
} from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

const initialMockServices: any[] = [];
const initialMockFuel: any[] = [];
const initialMockMaintenance: any[] = [];
const initialMockShopping: any[] = [];

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao converter imagem em base64:", error);
    return "";
  }
};

const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 1, height: 1 });
    };
    img.src = base64;
  });
};


const monthNames: { [key: string]: string } = {
  "total": "Total do Ano",
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril", "05": "Maio", "06": "Junho",
  "07": "Julho", "08": "Agosto", "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
};

export default function RelatoriosPage() {
  const { data: servicos, loading: loadingS, updateDocument: updateS, deleteDocument: deleteS } = useCollection("servicos", initialMockServices);
  const { data: abastecimentos, loading: loadingA, updateDocument: updateA, deleteDocument: deleteA } = useCollection("abastecimentos", initialMockFuel);
  const { data: manutencoes, loading: loadingM, updateDocument: updateM, deleteDocument: deleteM } = useCollection("manutencoes", initialMockMaintenance);
  const { data: compras, loading: loadingC, updateDocument: updateC, deleteDocument: deleteC } = useCollection("compras", initialMockShopping);

  const loading = loadingS || loadingA || loadingM || loadingC;

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"servicos" | "abastecimentos" | "manutencoes" | "compras">("servicos");

  // Estados de edição unificada
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<"servico" | "abastecimento" | "manutencao" | "compra" | null>(null);

  // States for Other Costs inside Report's Edit Modal
  const [isOtherCostModalOpen, setIsOtherCostModalOpen] = useState(false);
  const [otherCostDesc, setOtherCostDesc] = useState("");
  const [otherCostValue, setOtherCostValue] = useState("");
  const [editingCostIndex, setEditingCostIndex] = useState<number | null>(null);

  const handleStartEdit = (item: any, type: "servico" | "abastecimento" | "manutencao" | "compra") => {
    setEditingItem({ ...item });
    setEditingType(type);
  };

  const handleOpenAddCost = () => {
    setEditingCostIndex(null);
    setOtherCostDesc("");
    setOtherCostValue("");
    setIsOtherCostModalOpen(true);
  };

  const handleOpenEditCost = (index: number) => {
    if (!editingItem) return;
    setEditingCostIndex(index);
    setOtherCostDesc(editingItem.outrosCustos[index].descricao);
    setOtherCostValue(String(editingItem.outrosCustos[index].valor));
    setIsOtherCostModalOpen(true);
  };

  const handleSaveCostRelatorios = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherCostDesc.trim() || !otherCostValue || !editingItem) return;

    const valueNum = Number(otherCostValue) || 0;
    const newCost = {
      descricao: otherCostDesc.trim(),
      valor: valueNum
    };

    const currentCosts = editingItem.outrosCustos || [];
    let updatedCosts = [];
    if (editingCostIndex !== null) {
      updatedCosts = currentCosts.map((item: any, idx: number) => idx === editingCostIndex ? newCost : item);
    } else {
      updatedCosts = [...currentCosts, newCost];
    }

    setEditingItem({
      ...editingItem,
      outrosCustos: updatedCosts
    });

    setIsOtherCostModalOpen(false);
    setOtherCostDesc("");
    setOtherCostValue("");
    setEditingCostIndex(null);
  };

  const handleRemoveCostRelatorios = (index: number) => {
    if (!editingItem) return;
    const currentCosts = editingItem.outrosCustos || [];
    setEditingItem({
      ...editingItem,
      outrosCustos: currentCosts.filter((_: any, idx: number) => idx !== index)
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingType) return;

    try {
      if (editingType === "servico") {
        const kmIn = Number(editingItem.kmInicial) || 0;
        const kmFi = Number(editingItem.kmFinal) || 0;
        const kmDiff = kmFi - kmIn;
        const kmPerc = kmDiff > 0 ? kmDiff : 0;
        const consL = Number(editingItem.consumoLitros) || 0;
        const medC = (consL > 0 && kmPerc > 0) ? Number((kmPerc / consL).toFixed(2)) : 0;

        await updateS(editingItem.id, {
          cliente: editingItem.cliente,
          veiculo: editingItem.veiculo || "",
          origem: editingItem.origem || "",
          destino: editingItem.destino || "",
          data: editingItem.data || "",
          hora: editingItem.hora || "",
          valor: Number(editingItem.valor) || 0,
          valorPedagio: Number(editingItem.valorPedagio) || 0,
          consumoLitros: consL,
          mediaConsumo: medC,
          kmInicial: kmIn,
          kmFinal: kmFi,
          kmPercorrido: kmPerc,
          descricao: editingItem.descricao || "",
          outrosCustos: editingItem.outrosCustos || []
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
      } else if (editingType === "compra") {
        await updateC(editingItem.id, {
          item: editingItem.item || "",
          quantidade: editingItem.quantidade || "",
          preco: Number(editingItem.preco) || 0,
          compradoEm: editingItem.compradoEm || ""
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

  const handleDeleteItem = async (id: string, type: "servico" | "abastecimento" | "manutencao" | "compra") => {
    const label = type === "servico" 
      ? "serviço" 
      : type === "abastecimento" 
      ? "abastecimento" 
      : type === "manutencao" 
      ? "registro de manutenção" 
      : "item de compra";
      
    if (window.confirm(`Tem certeza de que deseja excluir este ${label}?`)) {
      try {
        if (type === "servico") {
          await deleteS(id);
        } else if (type === "abastecimento") {
          await deleteA(id);
        } else if (type === "manutencao") {
          await deleteM(id);
        } else if (type === "compra") {
          await deleteC(id);
        }
        alert("Registro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar registro:", error);
        alert("Erro ao excluir o registro.");
      }
    }
  };

  const [isGeneratingMonthlyPDF, setIsGeneratingMonthlyPDF] = useState(false);

  const generateMonthlyReportPDF = async (monthNum: string, yearNum: string, monthData: any) => {
    if (!monthData) return;
    setIsGeneratingMonthlyPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const isAnnual = monthNum === "total";
      const monthNameStr = monthNames[monthNum] || monthNum;
      const logoBase64 = await fetchImageAsBase64("/Sanga-Logo-Docs.png");

      // 1. Cabeçalho Corporativo (Silvio Aparecido Sanga)
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 20, 14, 52, 20.8);
        } catch (err) {
          console.error("Erro ao adicionar logo ao PDF:", err);
        }
      } else {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text("SANGA AUTO SOCORRO", 20, 25);
      }

      // Dados da Empresa Silvio
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(33, 33, 33);
      doc.text("21.475.238 SILVIO APARECIDO SANGA", 190, 18, { align: "right" });
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(85, 85, 85);
      doc.text("CNPJ: 21.475.238/0001-43", 190, 22, { align: "right" });
      doc.text("Avenida Comendador Norberto Marcondes, 453", 190, 26, { align: "right" });
      doc.text("Campo Mourão, Paraná", 190, 30, { align: "right" });
      doc.text("sangaautosocorro@hotmail.com", 190, 34, { align: "right" });

      // Linhas Decorativas (Grafite e Dourada)
      doc.setDrawColor(51, 51, 51);
      doc.setLineWidth(1.2);
      doc.line(20, 38, 190, 38);
      
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.6);
      doc.line(20, 39.2, 190, 39.2);

      // Título do Documento
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      const docTitle = isAnnual
        ? `RESUMO OPERACIONAL ANUAL DE ${yearNum}`
        : `RESUMO OPERACIONAL DE ${monthNameStr.toUpperCase()} DE ${yearNum}`;
      doc.text(docTitle, 105, 48, { align: "center" });

      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(119, 119, 119);
      const dateStr = new Date().toLocaleString("pt-BR");
      const docSub = isAnnual
        ? `Relatório Anual Consolidado | Gerado em: ${dateStr}`
        : `Relatório Mensal Consolidado | Gerado em: ${dateStr}`;
      doc.text(docSub, 105, 53, { align: "center" });

      let currentY = 62;

      const drawSectionTitle = (title: string) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        currentY += 4;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(51, 51, 51);
        doc.text(title.toUpperCase(), 20, currentY);
        
        currentY += 2;
        doc.setDrawColor(51, 51, 51);
        doc.setLineWidth(0.4);
        doc.line(20, currentY, 190, currentY);
        currentY += 6;
      };

      // Métricas Financeiras e Operacionais
      const totalAtendimentos = monthData.servicos.length;
      const faturamentoTotal = monthData.faturamento || 0;
      const despesasTotais = (
        monthData.despesasCombustivel + 
        monthData.despesasManutencao + 
        monthData.despesasPedagio + 
        monthData.despesasOutrosCustos +
        monthData.faturamentoDesconto
      );
      const lucroLiquido = monthData.lucroLiquido || (faturamentoTotal - despesasTotais);
      const mediaPorAtendimento = totalAtendimentos > 0 ? faturamentoTotal / totalAtendimentos : 0;

      // 1. Resumo Financeiro & Operacional
      drawSectionTitle(isAnnual ? "1. Resumo Financeiro Anual" : "1. Resumo Financeiro e Geral");
      
      const kpis = [
        { label: isAnnual ? "Total de Atendimentos no Ano" : "Total de Atendimentos Realizados", val: `${totalAtendimentos} chamados` },
        { label: isAnnual ? "Faturamento Bruto Anual" : "Faturamento Bruto Total", val: `R$ ${faturamentoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
        { label: isAnnual ? "Despesas Totais no Ano" : "Despesas Totais Estimadas", val: `R$ ${despesasTotais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
        { label: isAnnual ? "Lucro Líquido Real Anual" : "Lucro Líquido Estimado", val: `R$ ${lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
        { label: "Média de Faturamento por Atendimento", val: `R$ ${mediaPorAtendimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` }
      ];

      if (isAnnual) {
        kpis.push({
          label: "Média Mensal de Faturamento",
          val: `R$ ${(faturamentoTotal / 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        });
      }

      kpis.forEach(kpi => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text(`${kpi.label}:`, 20, currentY);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(33, 33, 33);
        doc.text(kpi.val, 105, currentY);
        currentY += 5.5;
      });
      currentY += 2;

      // Algoritmo de identificação da empresa/cliente que mais chamou
      const topClient = (() => {
        if (!monthData.servicos || monthData.servicos.length === 0) return null;
        
        const clientMap: { [key: string]: { name: string; count: number; valor: number } } = {};
        
        monthData.servicos.forEach((s: any) => {
          const rawName = (s.cliente || "").trim();
          if (!rawName) return;
          
          const normalized = rawName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, "")
            .replace(/\b(LTDA|SA|S\/A|ME|EPP|LOGISTICA|TRANSPORTE|TRANSPORTES|SOCORRO|AUTO)\b/g, "")
            .trim()
            .replace(/\s+/g, " ");

          if (!normalized) return;

          if (!clientMap[normalized]) {
            clientMap[normalized] = { name: rawName, count: 0, valor: 0 };
          }
          clientMap[normalized].count += 1;
          clientMap[normalized].valor += Number(s.valor) || 0;
        });

        const sorted = Object.values(clientMap).sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return b.valor - a.valor;
        });

        if (sorted.length === 0) return null;

        if (sorted.length > 1 && sorted[0].count === 1) {
          return null;
        }

        return sorted[0];
      })();

      let secNum = 2;

      if (topClient) {
        drawSectionTitle(isAnnual ? `${secNum}. Empresa / Cliente Principal do Ano` : `${secNum}. Empresa / Cliente com Maior Volume no Mês`);
        secNum++;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text("Empresa / Cliente Principal:", 20, currentY);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(33, 33, 33);
        doc.text(`${topClient.name}`, 105, currentY);
        currentY += 5.5;

        doc.setFont("Helvetica", "bold");
        doc.setTextColor(102, 102, 102);
        doc.text("Total de Chamados:", 20, currentY);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(33, 33, 33);
        doc.text(`${topClient.count} atendimentos (${Math.round((topClient.count / Math.max(totalAtendimentos, 1)) * 100)}% dos serviços do ${isAnnual ? "ano" : "mês"})`, 105, currentY);
        currentY += 5.5;

        doc.setFont("Helvetica", "bold");
        doc.setTextColor(102, 102, 102);
        doc.text("Faturamento Gerado:", 20, currentY);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(33, 33, 33);
        doc.text(`R$ ${topClient.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 105, currentY);
        currentY += 7.5;
      }

      // 3. Desempenho da Frota & Combustível
      drawSectionTitle(isAnnual ? `${secNum}. Desempenho Anual da Frota e Combustível` : `${secNum}. Desempenho da Frota e Combustível`);
      secNum++;

      const totalKm = monthData.kmPercorrido || 0;
      const totalLitros = monthData.litrosAbastecidos || 0;
      const gastoCombustivel = monthData.despesasCombustivel || 0;
      const mediaKmL = totalLitros > 0 && totalKm > 0 ? (totalKm / totalLitros).toFixed(2) : "0";
      const custoPorKm = totalKm > 0 ? (despesasTotais / totalKm).toFixed(2) : "0";

      const frotaStats = [
        { label: isAnnual ? "Distância Total Rodada no Ano" : "Distância Total Rodada", val: `${totalKm.toLocaleString("pt-BR")} km` },
        { label: isAnnual ? "Volume Anual de Diesel Consumido" : "Volume de Diesel Consumido", val: `${totalLitros.toLocaleString("pt-BR")} Litros` },
        { label: isAnnual ? "Gasto Anual com Combustível" : "Gasto com Combustível", val: `R$ ${gastoCombustivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
        { label: "Média Geral de Consumo", val: `${mediaKmL} km/L` },
        { label: "Custo Médio por KM Rodado", val: `R$ ${custoPorKm} / km` }
      ];

      frotaStats.forEach(st => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text(`${st.label}:`, 20, currentY);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(33, 33, 33);
        doc.text(st.val, 105, currentY);
        currentY += 5.5;
      });
      currentY += 2;

      // 4. Detalhamento de Custos e Despesas
      drawSectionTitle(isAnnual ? `${secNum}. Composição Detalhada das Despesas Anuais` : `${secNum}. Composição Detalhada das Despesas`);
      secNum++;

      const despesasBreakdown = [
        { label: "Abastecimento de Combustível", val: monthData.despesasCombustivel || 0 },
        { label: "Manutenção de Veículos & Peças", val: monthData.despesasManutencao || 0 },
        { label: "Pedágios em Atendimentos", val: monthData.despesasPedagio || 0 },
        { label: "Outros Custos Operacionais", val: monthData.despesasOutrosCustos || 0 },
        { label: "Compras de Insumos Concluídas", val: monthData.faturamentoDesconto || 0 }
      ];

      despesasBreakdown.forEach(item => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text(`${item.label}:`, 20, currentY);

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(153, 51, 51);
        const valStr = `R$ ${Number(item.val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
        doc.text(valStr, 105, currentY);
        currentY += 5.5;
      });
      currentY += 4;

      // Se for relatório ANUAL, imprime o Demonstrativo Mês a Mês do Ano
      if (isAnnual && reportsData[yearNum]) {
        drawSectionTitle(`${secNum}. Demonstrativo Mensal Consolidado do Ano (${yearNum})`);
        secNum++;

        doc.setFillColor(240, 240, 240);
        doc.rect(20, currentY, 170, 6, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(51, 51, 51);
        doc.text("MÊS", 22, currentY + 4);
        doc.text("CHAMADOS", 60, currentY + 4);
        doc.text("FATURAMENTO", 95, currentY + 4);
        doc.text("DESPESAS", 140, currentY + 4);
        doc.text("LUCRO LÍQUIDO", 188, currentY + 4, { align: "right" });
        
        currentY += 8;

        const allMonthsSorted = Object.keys(reportsData[yearNum]).sort((a, b) => a.localeCompare(b));
        allMonthsSorted.forEach(mKey => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }

          const mData = reportsData[yearNum][mKey];
          const mName = monthNames[mKey] || mKey;
          const mCount = mData.servicos.length;
          const mFat = mData.faturamento || 0;
          const mDesp = (
            mData.despesasCombustivel + 
            mData.despesasManutencao + 
            mData.despesasPedagio + 
            mData.despesasOutrosCustos +
            mData.faturamentoDesconto
          );
          const mLucro = mData.lucroLiquido || (mFat - mDesp);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(33, 33, 33);

          doc.text(mName, 22, currentY);
          doc.text(`${mCount} chamados`, 60, currentY);
          doc.text(`R$ ${mFat.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 95, currentY);
          
          doc.setTextColor(153, 51, 51);
          doc.text(`R$ ${mDesp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 140, currentY);
          
          doc.setTextColor(mLucro >= 0 ? 34 : 153, mLucro >= 0 ? 139 : 51, mLucro >= 0 ? 34 : 51);
          doc.text(`R$ ${mLucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 188, currentY, { align: "right" });

          currentY += 6;
        });

        currentY += 4;
      }

      // Tabela Resumida dos Serviços
      if (monthData.servicos && monthData.servicos.length > 0) {
        drawSectionTitle(isAnnual ? `${secNum}. Relação Geral dos Serviços no Ano` : `${secNum}. Relação de Serviços Realizados`);
        
        doc.setFillColor(240, 240, 240);
        doc.rect(20, currentY, 170, 6, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(51, 51, 51);
        doc.text("DATA", 22, currentY + 4);
        doc.text("CLIENTE", 45, currentY + 4);
        doc.text("VEÍCULO", 95, currentY + 4);
        doc.text("PERCURSO", 130, currentY + 4);
        doc.text("VALOR (R$)", 188, currentY + 4, { align: "right" });
        
        currentY += 8;

        monthData.servicos.forEach((s: any) => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(33, 33, 33);

          const dateStrShort = s.data ? s.data.split("-").reverse().join("/") : "-";
          const clientStr = (s.cliente || "").slice(0, 24);
          const vehicleStr = (s.veiculo || "-").slice(0, 16);
          const routeStr = `${s.origem || ""} -> ${s.destino || ""}`.slice(0, 24);
          const valStr = Number(s.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

          doc.text(dateStrShort, 22, currentY);
          doc.text(clientStr, 45, currentY);
          doc.text(vehicleStr, 95, currentY);
          doc.text(routeStr, 130, currentY);
          doc.text(valStr, 188, currentY, { align: "right" });

          currentY += 5;
        });
      }

      // Rodapé dinâmico em todas as páginas
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, 282, 190, 282);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Sanga Auto Socorro - ${docTitle}`, 20, 287);
        doc.text(`Página ${p} de ${totalPages}`, 190, 287, { align: "right" });
      }

      const filename = isAnnual ? `resumo-operacional-anual-${yearNum}.pdf` : `resumo-operacional-${monthNameStr.toLowerCase()}-${yearNum}.pdf`;
      doc.save(filename);

    } catch (err) {
      console.error("Erro ao gerar relatório PDF:", err);
      alert("Ocorreu um erro ao gerar o relatório.");
    } finally {
      setIsGeneratingMonthlyPDF(false);
    }
  };

  const [isGeneratingServicePDF, setIsGeneratingServicePDF] = useState(false);
  const [isOrcamentoOption, setIsOrcamentoOption] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const generateServicePDF = async (service: any, isOrcamento: boolean = false, customDocTitle: string = "") => {
    if (!service) return;
    setIsGeneratingServicePDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const docTitle = customDocTitle.trim()
        ? customDocTitle.trim().toUpperCase()
        : isOrcamento
        ? "ORÇAMENTO DE PRESTAÇÃO DE SERVIÇOS"
        : "ORDEM DE SERVIÇO / COMPROVANTE DE ATENDIMENTO";

      const logoBase64 = await fetchImageAsBase64("/Sanga-Logo-Docs.png");

      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 20, 14, 52, 20.8);
        } catch (err) {
          console.error("Erro ao adicionar logo ao PDF:", err);
        }
      } else {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text("SANGA AUTO SOCORRO", 20, 25);
      }

      const isElizia = service.empresa === "Elizia";
      if (isElizia) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(33, 33, 33);
        doc.text("ELIZIA SANGA", 190, 18, { align: "right" });
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(85, 85, 85);
        doc.text("CNPJ: 14.887.411/0001-08", 190, 22, { align: "right" });
        doc.text("Avenida Comendador Norberto Marcondes, 453", 190, 26, { align: "right" });
        doc.text("Campo Mourão, Paraná", 190, 30, { align: "right" });
        doc.text("sangaautosocorro@hotmail.com", 190, 34, { align: "right" });
      } else {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(33, 33, 33);
        doc.text("21.475.238 SILVIO APARECIDO SANGA", 190, 18, { align: "right" });
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(85, 85, 85);
        doc.text("CNPJ: 21.475.238/0001-43", 190, 22, { align: "right" });
        doc.text("Avenida Comendador Norberto Marcondes, 453", 190, 26, { align: "right" });
        doc.text("Campo Mourão, Paraná", 190, 30, { align: "right" });
        doc.text("sangaautosocorro@hotmail.com", 190, 34, { align: "right" });
      }

      doc.setDrawColor(51, 51, 51);
      doc.setLineWidth(1.2);
      doc.line(20, 38, 190, 38);
      
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.6);
      doc.line(20, 39.2, 190, 39.2);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(51, 51, 51);
      doc.text(docTitle, 105, 48, { align: "center" });

      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(119, 119, 119);
      const dateStr = new Date().toLocaleString("pt-BR");
      doc.text(`Documento emitido em: ${dateStr} | Registro Nº: ${service.id || "001"}`, 105, 53, { align: "center" });

      let currentY = 62;

      const drawSectionTitle = (title: string) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        currentY += 4;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(51, 51, 51);
        doc.text(title.toUpperCase(), 20, currentY);
        
        currentY += 2;
        doc.setDrawColor(51, 51, 51);
        doc.setLineWidth(0.4);
        doc.line(20, currentY, 190, currentY);
        currentY += 6;
      };

      const drawTwoColumnFields = (
        sectionTitle: string,
        fields: { label: string; value: any; isCurrency?: boolean; suffix?: string; hideIfZero?: boolean; fullWidth?: boolean }[]
      ) => {
        const activeFields = fields.filter(f => {
          if (f.value === undefined || f.value === null || f.value === "") return false;
          if (f.hideIfZero && (f.value === 0 || f.value === "0" || Number(f.value) === 0)) return false;
          return true;
        });
        if (activeFields.length === 0) return;

        drawSectionTitle(sectionTitle);

        let idx = 0;
        while (idx < activeFields.length) {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }

          const field1 = activeFields[idx];
          const isFull1 = field1.fullWidth;
          const field2 = !isFull1 ? activeFields[idx + 1] : undefined;

          let valStr1 = String(field1.value);
          if (field1.isCurrency) {
            valStr1 = `R$ ${Number(field1.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
          } else if (field1.suffix) {
            valStr1 = `${field1.value} ${field1.suffix}`;
          }

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(102, 102, 102);
          doc.text(`${field1.label}:`, 20, currentY);
          const w1 = doc.getTextWidth(`${field1.label}: `);
          
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(33, 33, 33);

          const maxW1 = (isFull1 || !field2) ? (170 - w1) : (80 - w1);
          const lines1 = doc.splitTextToSize(valStr1, Math.max(maxW1, 30));
          doc.text(lines1, 20 + w1, currentY);
          let h1 = lines1.length * 5;

          let h2 = 0;
          if (field2) {
            let valStr2 = String(field2.value);
            if (field2.isCurrency) {
              valStr2 = `R$ ${Number(field2.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
            } else if (field2.suffix) {
              valStr2 = `${field2.value} ${field2.suffix}`;
            }
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(102, 102, 102);
            doc.text(`${field2.label}:`, 105, currentY);
            const w2 = doc.getTextWidth(`${field2.label}: `);
            
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(33, 33, 33);
            const lines2 = doc.splitTextToSize(valStr2, Math.max(85 - w2, 30));
            doc.text(lines2, 105 + w2, currentY);
            h2 = lines2.length * 5;
          }

          currentY += Math.max(h1, h2, 6);
          idx += (field2 ? 2 : 1);
        }
        currentY += 2;
      };

      drawTwoColumnFields("Dados do Cliente", [
        { label: "Cliente", value: service.cliente },
        { label: "CNPJ / CPF", value: service.cnpjCliente },
        { label: "Telefone", value: service.telefone },
        { label: "E-mail", value: service.emailCliente },
        { label: "Endereço", value: service.enderecoCliente, fullWidth: true },
        { label: "Cidade / UF", value: service.cidadeCliente, fullWidth: true }
      ]);

      drawTwoColumnFields("Frota & Detalhes", [
        { label: "Veículo", value: service.veiculo },
        { label: "Placa", value: service.placa },
        { label: "Frota", value: service.frota },
        { label: "Tipo", value: service.tipo },
        { label: "Data do Serviço", value: service.data },
        { label: "Horário", value: service.hora }
      ]);

      const percursoFields: any[] = [
        { label: "Origem", value: service.origem },
        { label: "Destino", value: service.destino }
      ];

      if (!service.ocultarDistancia) {
        percursoFields.push(
          { label: "KM Inicial", value: service.kmInicial, hideIfZero: true },
          { label: "KM Final", value: service.kmFinal, hideIfZero: true },
          { label: "Distância Percorrida", value: service.kmPercorrido, suffix: "km", hideIfZero: true }
        );
      }

      drawTwoColumnFields("Percurso & Trajeto", percursoFields);

      if (!service.ocultarConsumo) {
        drawTwoColumnFields("Consumo & Desempenho", [
          { label: "Consumo de Combustível", value: service.consumoLitros, suffix: "Litros", hideIfZero: true },
          { label: "Média de Consumo", value: service.mediaConsumo, suffix: "km/L", hideIfZero: true }
        ]);
      }

      const visibleOutrosCustos = (service.outrosCustos || []).filter((c: any) => !c.ocultarNoDocumento);

      if (visibleOutrosCustos.length > 0) {
        drawSectionTitle("Detalhamento de Outros Custos");
        const totalOutros = visibleOutrosCustos.reduce((acc: number, curr: any) => acc + curr.valor, 0);

        visibleOutrosCustos.forEach((c: any) => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(102, 102, 102);
          doc.text(c.descricao, 20, currentY);
          
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(153, 51, 51);
          const valStr = `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
          doc.text(valStr, 190 - doc.getTextWidth(valStr), currentY);
          currentY += 6;
        });

        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, currentY, 190, currentY);
        currentY += 4;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(33, 33, 33);
        doc.text("Total de Outros Custos", 20, currentY);

        doc.setTextColor(153, 51, 51);
        const totalOutrosStr = `R$ ${totalOutros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
        doc.text(totalOutrosStr, 190 - doc.getTextWidth(totalOutrosStr), currentY);
        currentY += 8;
      }

      if (service.descricao && service.descricao.trim() !== "") {
        drawSectionTitle("Descrição das Atividades");
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 51, 51);
        
        const splitDesc = doc.splitTextToSize(service.descricao, 170);
        splitDesc.forEach((line: string) => {
          if (currentY > 280) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(line, 20, currentY);
          currentY += 5;
        });
        currentY += 4;
      }

      drawTwoColumnFields(
        isOrcamento ? "Valores do Orçamento" : "Resumo Financeiro",
        [
          { label: isOrcamento ? "Valor do Orçamento" : "Valor Cobrado", value: service.valor, isCurrency: true, hideIfZero: true },
          { label: "Prazo de Pagamento", value: service.prazoPagamento },
          { label: "Valor do Pedágio", value: service.valorPedagio, isCurrency: true, hideIfZero: true }
        ]
      );

      const hasImages = service.fotos && service.fotos.length > 0;

      if (hasImages) {
        drawSectionTitle("Galeria de Imagens do Atendimento");

        const colWidth = 50;
        const colHeight = 50;
        const gap = 5;
        const startX = 20;

        for (let i = 0; i < service.fotos.length; i++) {
          const colIndex = i % 3;

          if (colIndex === 0 && currentY + colHeight > 280) {
            doc.addPage();
            currentY = 20;
          }

          const photoX = startX + colIndex * (colWidth + gap);
          
          try {
            const imgData = service.fotos[i];
            const dims = await getImageDimensions(imgData);
            
            let drawWidth = colWidth;
            let drawHeight = colHeight;
            const imgRatio = dims.width / dims.height;
            const targetRatio = colWidth / colHeight;
            
            if (imgRatio > targetRatio) {
              drawWidth = colWidth;
              drawHeight = colWidth / imgRatio;
            } else {
              drawHeight = colHeight;
              drawWidth = colHeight * imgRatio;
            }
            
            const offsetX = photoX + (colWidth - drawWidth) / 2;
            const offsetY = currentY + (colHeight - drawHeight) / 2;

            doc.addImage(imgData, "JPEG", offsetX, offsetY, drawWidth, drawHeight);
          } catch (e) {
            console.error("Erro ao adicionar imagem ao PDF:", e);
          }

          if (colIndex === 2 || i === service.fotos.length - 1) {
            currentY += colHeight + gap;
          }
        }
      }

      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, 282, 190, 282);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Sanga Auto Socorro - ${docTitle}`, 20, 287);
        doc.text(`Página ${p} de ${totalPages}`, 190, 287, { align: "right" });
      }

      const sanitizeForFilename = (str: string) => {
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase();
      };

      const titlePart = sanitizeForFilename(docTitle);
      const clientPart = sanitizeForFilename(service.cliente || service.empresa || "servico");
      const filename = `${titlePart}-${clientPart}-${service.id}.pdf`;
      doc.save(filename);

    } catch (error) {
      console.error("Erro ao gerar PDF do serviço:", error);
      alert("Ocorreu um erro ao gerar o PDF do serviço.");
    } finally {
      setIsGeneratingServicePDF(false);
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
          compras: any[];
          faturamentoOriginal: number;
          faturamentoDesconto: number;
          faturamento: number;
          despesasCombustivel: number;
          despesasManutencao: number;
          despesasPedagio: number;
          despesasOutrosCustos: number;
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
          compras: [],
          faturamentoOriginal: 0,
          faturamentoDesconto: 0,
          faturamento: 0,
          despesasCombustivel: 0,
          despesasManutencao: 0,
          despesasPedagio: 0,
          despesasOutrosCustos: 0,
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
      group.faturamentoOriginal += Number(s.valor) || 0;
      group.kmPercorrido += Number(s.kmPercorrido) || 0;
      group.litrosAbastecidos += Number(s.consumoLitros) || 0;
      // Acumula pedágio e outros custos nas despesas do mês
      group.despesasPedagio += Number(s.valorPedagio) || 0;
      const outros = s.outrosCustos || [];
      const sumOutros = outros.reduce((sum: number, c: any) => sum + (Number(c.valor) || 0), 0);
      group.despesasOutrosCustos += sumOutros;
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

    compras.forEach(c => {
      if (c.comprado && c.compradoEm) {
        const { year, month } = getYearMonth(c.compradoEm);
        ensurePath(year, month);
        const group = groups[year][month];
        group.compras.push(c);
        group.faturamentoDesconto += Number(c.preco) || 0;
      }
    });

    Object.keys(groups).forEach(year => {
      Object.keys(groups[year]).forEach(month => {
        const group = groups[year][month];
        group.faturamento = group.faturamentoOriginal;
        // O lucro líquido abate combustível, manutenções, pedágios, outros custos operacionais dos serviços e compras concluídas
        group.lucroLiquido = group.faturamento - (
          group.despesasCombustivel + 
          group.despesasManutencao + 
          group.despesasPedagio + 
          group.despesasOutrosCustos +
          group.faturamentoDesconto
        );
      });
    });

    return groups;
  }, [servicos, abastecimentos, manutencoes, compras]);

  const years = useMemo(() => {
    return Object.keys(reportsData).sort((a, b) => b.localeCompare(a));
  }, [reportsData]);

  const months = useMemo(() => {
    if (!selectedYear || !reportsData[selectedYear]) return [];
    return Object.keys(reportsData[selectedYear]).sort((a, b) => b.localeCompare(a));
  }, [reportsData, selectedYear]);

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

  const [viewingDetailItem, setViewingDetailItem] = useState<{ item: any; type: "servico" | "abastecimento" | "manutencao" | "compra" } | null>(null);

  const annualStats = useMemo(() => {
    if (!selectedYear || !reportsData[selectedYear]) {
      return { faturamento: 0, faturamentoComNota: 0, faturamentoSemNota: 0, despesas: 0, lucro: 0 };
    }
    let faturamento = 0;
    let faturamentoComNota = 0;
    let faturamentoSemNota = 0;
    let despesas = 0;

    Object.keys(reportsData[selectedYear]).forEach(month => {
      const group = reportsData[selectedYear][month];
      faturamento += group.faturamento;
      despesas += (
        group.despesasCombustivel + 
        group.despesasManutencao + 
        group.despesasPedagio + 
        group.despesasOutrosCustos +
        group.faturamentoDesconto
      );

      group.servicos.forEach((s: any) => {
        const val = Number(s.valor) || 0;
        if (s.comNota) {
          faturamentoComNota += val;
        } else {
          faturamentoSemNota += val;
        }
      });
    });

    return {
      faturamento,
      faturamentoComNota,
      faturamentoSemNota,
      despesas,
      lucro: faturamento - despesas
    };
  }, [reportsData, selectedYear]);

  const activeMonthData = useMemo(() => {
    if (!selectedYear || !selectedMonth || !reportsData[selectedYear]) {
      return null;
    }

    if (selectedMonth === "total") {
      const allServicos: any[] = [];
      const allAbastecimentos: any[] = [];
      const allManutencoes: any[] = [];
      const allCompras: any[] = [];

      let faturamentoOriginal = 0;
      let faturamentoDesconto = 0;
      let despesasCombustivel = 0;
      let despesasManutencao = 0;
      let despesasPedagio = 0;
      let despesasOutrosCustos = 0;
      let kmPercorrido = 0;
      let litrosAbastecidos = 0;

      Object.keys(reportsData[selectedYear]).forEach(m => {
        const grp = reportsData[selectedYear][m];
        allServicos.push(...grp.servicos);
        allAbastecimentos.push(...grp.abastecimentos);
        allManutencoes.push(...grp.manutencoes);
        allCompras.push(...grp.compras);

        faturamentoOriginal += grp.faturamentoOriginal;
        faturamentoDesconto += grp.faturamentoDesconto;
        despesasCombustivel += grp.despesasCombustivel;
        despesasManutencao += grp.despesasManutencao;
        despesasPedagio += grp.despesasPedagio;
        despesasOutrosCustos += grp.despesasOutrosCustos;
        kmPercorrido += grp.kmPercorrido;
        litrosAbastecidos += grp.litrosAbastecidos;
      });

      const faturamento = faturamentoOriginal;
      const despesasTotais = despesasCombustivel + despesasManutencao + despesasPedagio + despesasOutrosCustos + faturamentoDesconto;
      const lucroLiquido = faturamento - despesasTotais;

      return {
        servicos: allServicos,
        abastecimentos: allAbastecimentos,
        manutencoes: allManutencoes,
        compras: allCompras,
        faturamentoOriginal,
        faturamentoDesconto,
        faturamento,
        despesasCombustivel,
        despesasManutencao,
        despesasPedagio,
        despesasOutrosCustos,
        lucroLiquido,
        kmPercorrido,
        litrosAbastecidos
      };
    }

    return reportsData[selectedYear][selectedMonth] || null;
  }, [reportsData, selectedYear, selectedMonth]);

  // Consolidado de despesas extras: Manutenção + Pedágio + Outros Custos dos Serviços + Compras Concluídas
  const despesasExtras = useMemo(() => {
    if (!activeMonthData) return 0;
    return (
      activeMonthData.despesasManutencao + 
      activeMonthData.despesasPedagio + 
      activeMonthData.despesasOutrosCustos +
      activeMonthData.faturamentoDesconto
    );
  }, [activeMonthData]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Relatórios Operacionais
        </h1>
        <p className="text-sm text-muted-foreground">Histórico financeiro consolidado com despesas e pedágios integrados.</p>


      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando relatórios...</div>
      ) : years.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
          Nenhum dado registrado para gerar relatórios.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Filtros */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Filtro Temporal
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ano</label>
                  <div className="flex flex-wrap gap-2">
                    {years.map(y => (
                      <button
                        key={y}
                        onClick={() => {
                          setSelectedYear(y);
                          setSelectedMonth("");
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

                {selectedYear && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mês / Período</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedMonth("total")}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm font-bold transition-all col-span-2 cursor-pointer ${
                          selectedMonth === "total" 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                        }`}
                      >
                        <span>Total do Ano ({selectedYear})</span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </button>

                      {months.map(m => (
                        <button
                          key={m}
                          onClick={() => setSelectedMonth(m)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                            selectedMonth === m 
                              ? "bg-primary/10 text-primary border border-primary/20 font-bold" 
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

            {/* Resumo Anual */}
            {selectedYear && (
              <div className="rounded-2xl bg-muted/40 p-5 border border-border/80 space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Resumo Anual ({selectedYear})
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Faturamento Bruto:</span>
                    <span className="font-semibold text-foreground">
                      R$ {annualStats.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {annualStats.faturamentoComNota > 0 && (
                    <div className="flex justify-between items-center text-xs bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                      <span className="font-semibold text-green-700 dark:text-green-400">Com Nota Fiscal (Emitida):</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        R$ {annualStats.faturamentoComNota.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Despesas Totais:</span>
                    <span className="font-semibold text-red-500">
                      R$ {annualStats.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/85 text-sm">
                    <span className="font-semibold text-muted-foreground">Lucro Líquido Real:</span>
                    <span className={`font-bold ${annualStats.lucro >= 0 ? "text-green-500" : "text-red-500"}`}>
                      R$ {annualStats.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Painel Detalhado */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {activeMonthData ? (
                <motion.div
                  key={`${selectedYear}-${selectedMonth}`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6">
                    <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">
                          Dados de {monthNames[selectedMonth] || selectedMonth} de {selectedYear}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Visão consolidada com custos de compras de R$ {activeMonthData.faturamentoDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} incluídos no lucro</p>
                      </div>

                      <button
                        onClick={() => generateMonthlyReportPDF(selectedMonth, selectedYear, activeMonthData)}
                        disabled={isGeneratingMonthlyPDF}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {isGeneratingMonthlyPDF ? (
                          <>
                            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                            Gerando PDF...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Criar Relatório PDF
                          </>
                        )}
                      </button>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">Faturamento Bruto</span>
                        <span className="text-base sm:text-lg font-bold text-green-500 mt-1 block">
                          R$ {activeMonthData.faturamento.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">Combustível</span>
                        <span className="text-base sm:text-lg font-bold text-red-500 mt-1 block">
                          R$ {activeMonthData.despesasCombustivel.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">Manut. / Pedag. / Compras / Outros</span>
                        <span className="text-base sm:text-lg font-bold text-red-500 mt-1 block">
                          R$ {despesasExtras.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className={`p-4 rounded-xl border ${activeMonthData.lucroLiquido >= 0 ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">Lucro Líquido</span>
                        <span className={`text-base sm:text-lg font-bold mt-1 block ${activeMonthData.lucroLiquido >= 0 ? "text-green-600" : "text-red-500"}`}>
                          R$ {activeMonthData.lucroLiquido.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2.5 text-primary"><MapPin className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Distância Rodada</p>
                          <p className="text-base font-bold text-foreground mt-0.5">{activeMonthData.kmPercorrido.toLocaleString("pt-BR")} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-500/10 p-2.5 text-amber-500"><Fuel className="h-5 w-5" /></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Litragem Consumida</p>
                          <p className="text-base font-bold text-foreground mt-0.5">{activeMonthData.litrosAbastecidos.toLocaleString("pt-BR")} Litros</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="flex border-b border-border bg-muted/20 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab("servicos")}
                        className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 min-w-[100px] ${
                          activeTab === "servicos" ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Truck className="h-4 w-4" /> Serviços ({activeMonthData.servicos.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("abastecimentos")}
                        className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 min-w-[120px] ${
                          activeTab === "abastecimentos" ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Fuel className="h-4 w-4" /> Combustível ({activeMonthData.abastecimentos.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("manutencoes")}
                        className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 min-w-[120px] ${
                          activeTab === "manutencoes" ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Wrench className="h-4 w-4" /> Manutenções ({activeMonthData.manutencoes.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("compras")}
                        className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 min-w-[100px] ${
                          activeTab === "compras" ? "border-primary text-primary bg-card" : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" /> Compras ({activeMonthData.compras.length})
                      </button>
                    </div>

                    <div className="divide-y divide-border max-h-[350px] overflow-y-auto">
                      {activeTab === "servicos" && (
                        activeMonthData.servicos.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum serviço registrado neste mês.</div>
                        ) : (
                          activeMonthData.servicos.map((s, index) => (
                            <div key={s.id || index} className="p-4 flex flex-col justify-between text-sm hover:bg-muted/30 transition-colors gap-2 border-b border-border/40 last:border-0">
                              <div className="flex justify-between items-center w-full gap-4">
                                <div 
                                  onClick={() => setViewingDetailItem({ item: s, type: "servico" })}
                                  className="flex-1 min-w-0 group cursor-pointer"
                                  title="Ver detalhes do serviço"
                                >
                                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                                    {s.cliente} ({s.veiculo || "Geral"})
                                    <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.origem} → {s.destino} | {s.data}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="font-bold text-green-500">R$ {Number(s.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleStartEdit(s, "servico"); }} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(s.id, "servico"); }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              </div>
                              {/* Mostrar detalhe de custos do serviço direto na lista de relatórios */}
                              {(s.valorPedagio > 0 || (s.outrosCustos && s.outrosCustos.length > 0)) && (
                                <div className="bg-muted/50 p-2 rounded-lg text-xs space-y-1">
                                  {s.valorPedagio > 0 && <p className="text-muted-foreground"><span className="font-medium">Pedágio:</span> <span className="text-red-500 font-semibold">R$ {s.valorPedagio}</span></p>}
                                  {s.outrosCustos && s.outrosCustos.map((c: any, cidx: number) => (
                                    <p key={cidx} className="text-muted-foreground"><span className="font-medium">{c.descricao}:</span> <span className="text-red-500 font-semibold">R$ {c.valor}</span></p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )
                      )}

                      {activeTab === "abastecimentos" && (
                        activeMonthData.abastecimentos.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum abastecimento registrado neste mês.</div>
                        ) : (
                          activeMonthData.abastecimentos.map((a, index) => (
                            <div key={a.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors gap-4">
                              <div 
                                onClick={() => setViewingDetailItem({ item: a, type: "abastecimento" })}
                                className="flex-1 min-w-0 group cursor-pointer"
                                title="Ver detalhes do abastecimento"
                              >
                                <p className="font-semibold text-foreground truncate group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                                  {a.veiculo || "Geral"}
                                  <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.litros} Litros | KM: {Number(a.km || 0).toLocaleString("pt-BR")} | {a.data}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-red-500">R$ {Number(a.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <div className="flex gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleStartEdit(a, "abastecimento"); }} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(a.id, "abastecimento"); }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
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
                            <div key={m.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors gap-4">
                              <div 
                                onClick={() => setViewingDetailItem({ item: m, type: "manutencao" })}
                                className="flex-1 min-w-0 group cursor-pointer"
                                title="Ver detalhes da manutenção"
                              >
                                <p className="font-semibold text-foreground truncate group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                                  {m.tipo} ({m.veiculo})
                                  <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">KM: {Number(m.km || 0).toLocaleString("pt-BR")} | {m.data}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-red-500">R$ {Number(m.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <div className="flex gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleStartEdit(m, "manutencao"); }} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(m.id, "manutencao"); }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )
                      )}

                      {activeTab === "compras" && (
                        activeMonthData.compras.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma compra finalizada neste mês.</div>
                        ) : (
                          activeMonthData.compras.map((c, index) => (
                            <div key={c.id || index} className="p-4 flex justify-between items-center text-sm hover:bg-muted/30 transition-colors gap-4">
                              <div 
                                onClick={() => setViewingDetailItem({ item: c, type: "compra" })}
                                className="flex-1 min-w-0 group cursor-pointer"
                                title="Ver detalhes da compra"
                              >
                                <p className="font-semibold text-foreground truncate group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                                  {c.item} ({c.quantidade})
                                  <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">Comprado em: {c.compradoEm}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-amber-600 dark:text-amber-400">R$ {Number(c.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                <div className="flex gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleStartEdit(c, "compra"); }} className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors cursor-pointer" title="Editar"><Edit2 className="h-3.5 w-3.5" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(c.id, "compra"); }} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
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
              className="fixed inset-0 z-55 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-55 flex flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <h2 className="text-xl font-bold">
                  Editar {editingType === 'servico' ? 'Serviço' : editingType === 'abastecimento' ? 'Abastecimento' : editingType === 'manutencao' ? 'Manutenção' : 'Compra'}
                </h2>
                <button onClick={() => { setEditingItem(null); setEditingType(null); }} className="rounded-full bg-muted p-2 hover:bg-border transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 p-6 overflow-y-auto max-h-[65vh] bg-background">
                {editingType === "servico" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Cliente</label>
                      <input type="text" value={editingItem.cliente || ""} onChange={e => setEditingItem({ ...editingItem, cliente: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Veículo</label>
                      <input type="text" value={editingItem.veiculo || ""} onChange={e => setEditingItem({ ...editingItem, veiculo: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Origem</label>
                        <input type="text" value={editingItem.origem || ""} onChange={e => setEditingItem({ ...editingItem, origem: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Destino</label>
                        <input type="text" value={editingItem.destino || ""} onChange={e => setEditingItem({ ...editingItem, destino: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-xl border border-border">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">KM Inicial</label>
                        <input type="number" value={editingItem.kmInicial || 0} onChange={e => setEditingItem({ ...editingItem, kmInicial: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">KM Final</label>
                        <input type="number" value={editingItem.kmFinal || 0} onChange={e => setEditingItem({ ...editingItem, kmFinal: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Valor Cobrado (R$)</label>
                        <input type="number" step="0.01" value={editingItem.valor || 0} onChange={e => setEditingItem({ ...editingItem, valor: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary font-bold text-green-600" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Valor Pedágio (R$)</label>
                        <input type="number" step="0.01" value={editingItem.valorPedagio || 0} onChange={e => setEditingItem({ ...editingItem, valorPedagio: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary font-bold text-red-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-xl border border-border">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Consumo (L)</label>
                        <input type="number" step="0.1" value={editingItem.consumoLitros || 0} onChange={e => setEditingItem({ ...editingItem, consumoLitros: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data</label>
                        <input type="date" value={editingItem.data || ""} onChange={e => setEditingItem({ ...editingItem, data: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>

                    {/* Outros Custos Sub-Edit no Relatório */}
                    <div className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border/80">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Coins className="h-4 w-4" /> Outros Custos</label>
                        <button 
                          type="button" 
                          onClick={handleOpenAddCost}
                          className="text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-1 rounded hover:bg-primary/20 transition-all cursor-pointer"
                        >
                          + Custo
                        </button>
                      </div>

                      {(!editingItem.outrosCustos || editingItem.outrosCustos.length === 0) ? (
                        <p className="text-[10px] text-muted-foreground text-center py-1">Nenhum custo adicional.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                          {editingItem.outrosCustos.map((cost: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-card border border-border rounded-lg text-xs">
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-foreground truncate block">{cost.descricao}</span>
                                <span className="font-bold text-red-500 text-[10px]">R$ {cost.valor}</span>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button type="button" onClick={() => handleOpenEditCost(idx)} className="p-1 text-muted-foreground hover:bg-muted rounded"><Edit2 className="h-3 w-3" /></button>
                                <button type="button" onClick={() => handleRemoveCostRelatorios(idx)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {editingType === "abastecimento" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Veículo</label>
                      <input type="text" value={editingItem.veiculo || ""} onChange={e => setEditingItem({ ...editingItem, veiculo: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data</label>
                        <input type="date" value={editingItem.data || ""} onChange={e => setEditingItem({ ...editingItem, data: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">KM</label>
                        <input type="number" value={editingItem.km || 0} onChange={e => setEditingItem({ ...editingItem, km: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Litros</label>
                        <input type="number" step="0.1" value={editingItem.litros || 0} onChange={e => setEditingItem({ ...editingItem, litros: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Valor</label>
                        <input type="number" step="0.01" value={editingItem.valor || 0} onChange={e => setEditingItem({ ...editingItem, valor: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary font-bold text-red-500" />
                      </div>
                    </div>
                  </>
                )}

                {editingType === "manutencao" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo / Peça</label>
                      <input type="text" value={editingItem.tipo || ""} onChange={e => setEditingItem({ ...editingItem, tipo: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Veículo</label>
                      <input type="text" value={editingItem.veiculo || ""} onChange={e => setEditingItem({ ...editingItem, veiculo: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data</label>
                        <input type="date" value={editingItem.data || ""} onChange={e => setEditingItem({ ...editingItem, data: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">KM</label>
                        <input type="number" value={editingItem.km || 0} onChange={e => setEditingItem({ ...editingItem, km: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Valor</label>
                      <input type="number" step="0.01" value={editingItem.valor || 0} onChange={e => setEditingItem({ ...editingItem, valor: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary font-bold text-red-500" />
                    </div>
                  </>
                )}

                {editingType === "compra" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Nome do Item</label>
                      <input type="text" value={editingItem.item || ""} onChange={e => setEditingItem({ ...editingItem, item: e.target.value })} required className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Quantidade</label>
                      <input type="text" value={editingItem.quantidade || ""} onChange={e => setEditingItem({ ...editingItem, quantidade: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Preço (R$)</label>
                        <input type="number" step="0.01" value={editingItem.preco || 0} onChange={e => setEditingItem({ ...editingItem, preco: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary font-bold text-amber-600" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data da Compra</label>
                        <input type="date" value={editingItem.compradoEm || ""} onChange={e => setEditingItem({ ...editingItem, compradoEm: e.target.value })} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      </div>
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

      {/* Pop-up secundário para Adicionar/Editar Outro Custo no Relatório */}
      <AnimatePresence>
        {isOtherCostModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOtherCostModalOpen(false)}
              className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[150] flex flex-col rounded-2xl bg-card border border-border shadow-2xl p-6 max-w-sm mx-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                  <Coins className="h-5 w-5 text-primary" />
                  {editingCostIndex !== null ? "Editar Custo" : "Adicionar Custo"}
                </h3>
                <button onClick={() => setIsOtherCostModalOpen(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-full"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSaveCostRelatorios} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Descrição / Motivo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Estacionamento, Lanche" 
                    value={otherCostDesc} 
                    onChange={e => setOtherCostDesc(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    value={otherCostValue} 
                    onChange={e => setOtherCostValue(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary font-bold text-red-500"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Save className="h-4.5 w-4.5" /> Salvar Custo
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Item na Tela de Relatórios */}
      <AnimatePresence>
        {viewingDetailItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingDetailItem(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[90vh] flex-col rounded-t-[2rem] bg-background shadow-2xl overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto md:max-h-[85vh] md:w-full md:max-w-2xl md:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-6 bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    {viewingDetailItem.type === "servico" && <Truck className="h-6 w-6" />}
                    {viewingDetailItem.type === "abastecimento" && <Fuel className="h-6 w-6" />}
                    {viewingDetailItem.type === "manutencao" && <Wrench className="h-6 w-6" />}
                    {viewingDetailItem.type === "compra" && <ShoppingCart className="h-6 w-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {viewingDetailItem.type === "servico" && "Detalhes do Atendimento"}
                      {viewingDetailItem.type === "abastecimento" && "Abastecimento de Combustível"}
                      {viewingDetailItem.type === "manutencao" && `Manutenção: ${viewingDetailItem.item.tipo}`}
                      {viewingDetailItem.type === "compra" && "Item da Lista de Compras"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {viewingDetailItem.type === "servico" ? `ID do Serviço: ${viewingDetailItem.item.id}` : `Data: ${viewingDetailItem.item.data || viewingDetailItem.item.compradoEm || "-"}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewingDetailItem(null)} className="rounded-full bg-muted p-2 hover:bg-border transition-colors cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
                {viewingDetailItem.type === "servico" && (
                  <>
                    {/* Cabeçalho */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-4 rounded-xl border border-border/60">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Cliente</span>
                        <span className="text-base font-bold text-foreground block mt-1">{viewingDetailItem.item.cliente}</span>
                        {viewingDetailItem.item.telefone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" /> {viewingDetailItem.item.telefone}
                          </span>
                        )}
                        {viewingDetailItem.item.cnpjCliente && (
                          <span className="text-xs text-muted-foreground block mt-1 font-mono">
                            CPF/CNPJ: {viewingDetailItem.item.cnpjCliente}
                          </span>
                        )}
                      </div>
                      <div className="bg-muted/40 p-4 rounded-xl border border-border/60 text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Valor Cobrado</span>
                        <span className="text-xl font-extrabold text-green-500 block mt-1">
                          R$ {Number(viewingDetailItem.item.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        {viewingDetailItem.item.comNota && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 font-bold text-[10px] rounded-full border border-green-500/30">
                            ✓ Com Nota Fiscal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Percurso */}
                    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Percurso & Trajeto</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase">Origem</p>
                            <p className="text-sm font-semibold text-foreground truncate">{viewingDetailItem.item.origem || "Não fornecido"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase">Destino</p>
                            <p className="text-sm font-semibold text-foreground truncate">{viewingDetailItem.item.destino || "Não fornecido"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pedágio, Consumo e Média */}
                    <div className="grid grid-cols-3 gap-4 bg-muted/40 p-4 rounded-xl border border-border/60">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Pedágio</span>
                        <span className="text-sm font-bold text-red-500 block mt-0.5">
                          R$ {Number(viewingDetailItem.item.valorPedagio || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Consumo</span>
                        <span className="text-sm font-bold text-foreground block mt-0.5">{viewingDetailItem.item.consumoLitros || 0} Litros</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-blue-500 block">Média trajeto</span>
                        <span className="text-sm font-extrabold text-blue-500 block mt-0.5">{viewingDetailItem.item.mediaConsumo || 0} km/L</span>
                      </div>
                    </div>

                    {/* Dados Técnicos e Frota */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Empresa</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingDetailItem.item.empresa || "Silvio"}</span>
                      </div>
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Veículo</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingDetailItem.item.veiculo || "-"}</span>
                      </div>
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Placa</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingDetailItem.item.placa || "-"}</span>
                      </div>
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Frota</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingDetailItem.item.frota || "-"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Tipo</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 truncate">{viewingDetailItem.item.tipo || "-"}</span>
                      </div>
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Data</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" /> {viewingDetailItem.item.data}
                        </span>
                      </div>
                      <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Hora</span>
                        <span className="text-sm font-semibold text-foreground block mt-1 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" /> {viewingDetailItem.item.hora || "-"}
                        </span>
                      </div>
                      {viewingDetailItem.item.prazoPagamento && (
                        <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Prazo Pagamento</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 block mt-1 truncate">{viewingDetailItem.item.prazoPagamento}</span>
                        </div>
                      )}
                    </div>

                    {/* Quilometragem */}
                    <div className="grid grid-cols-3 gap-4 bg-muted/40 p-4 rounded-xl border border-border/60">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">KM Inicial</span>
                        <span className="text-sm font-bold text-foreground block mt-0.5">{viewingDetailItem.item.kmInicial || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">KM Final</span>
                        <span className="text-sm font-bold text-foreground block mt-0.5">{viewingDetailItem.item.kmFinal || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-primary block">Distância</span>
                        <span className="text-sm font-extrabold text-primary block mt-0.5">{viewingDetailItem.item.kmPercorrido || 0} km</span>
                      </div>
                    </div>

                    {/* Outros Custos Detalhados */}
                    {viewingDetailItem.item.outrosCustos && viewingDetailItem.item.outrosCustos.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Outros Custos Operacionais</span>
                        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2.5">
                          {viewingDetailItem.item.outrosCustos.map((cost: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                              <span className="font-semibold text-foreground">{cost.descricao}</span>
                              <span className="font-bold text-red-500">R$ {Number(cost.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-xs text-foreground">
                            <span>Total Outros Custos</span>
                            <span className="text-red-600">
                              R$ {viewingDetailItem.item.outrosCustos.reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Descrição */}
                    {viewingDetailItem.item.descricao && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição do Atendimento</span>
                        <div className="bg-muted/20 p-4 rounded-xl border border-border text-sm text-foreground whitespace-pre-wrap">
                          {viewingDetailItem.item.descricao}
                        </div>
                      </div>
                    )}

                    {/* Fotos salvas */}
                    {viewingDetailItem.item.fotos && viewingDetailItem.item.fotos.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Imagens Anexadas ({viewingDetailItem.item.fotos.length})</span>
                        <div className="grid grid-cols-3 gap-3">
                          {viewingDetailItem.item.fotos.map((photo: string, index: number) => (
                            <div 
                              key={index} 
                              onClick={() => setFullscreenPhoto(photo)}
                              className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in border border-border bg-card group"
                            >
                              <img src={photo} alt={`Atendimento ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Eye className="h-5 w-5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emitir Documento (PDF) do Serviço */}
                    <div className="pt-6 border-t border-border flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={isOrcamentoOption} 
                            onChange={(e) => setIsOrcamentoOption(e.target.checked)}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer" 
                          />
                          <span>Gerar Orçamento</span>
                        </label>

                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Título:</span>
                          <input
                            type="text"
                            placeholder="Personalizado"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value.toUpperCase())}
                            className="w-full rounded-xl bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground uppercase border border-border/40 shadow-inner outline-none transition-all focus:border-primary focus:bg-background placeholder:text-muted-foreground/50 placeholder:normal-case"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => generateServicePDF(viewingDetailItem.item, isOrcamentoOption, customTitle)}
                          disabled={isGeneratingServicePDF}
                          className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {isGeneratingServicePDF ? (
                            <>
                              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                              Gerando PDF...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              {customTitle.trim() ? `Emitir (${customTitle.trim()})` : isOrcamentoOption ? "Emitir Orçamento (PDF)" : "Emitir O.S. (PDF)"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {viewingDetailItem.type === "abastecimento" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Veículo</span>
                        <span className="font-bold text-foreground">{viewingDetailItem.item.veiculo}</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Quilometragem</span>
                        <span className="font-bold text-foreground">{Number(viewingDetailItem.item.km || 0).toLocaleString("pt-BR")} km</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Litros</span>
                        <span className="font-bold text-foreground">{viewingDetailItem.item.litros} Litros</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Valor Pago</span>
                        <span className="font-bold text-red-500">R$ {Number(viewingDetailItem.item.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingDetailItem.type === "manutencao" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Tipo</span>
                        <span className="font-bold text-foreground">{viewingDetailItem.item.tipo}</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Veículo</span>
                        <span className="font-bold text-foreground">{viewingDetailItem.item.veiculo}</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Quilometragem</span>
                        <span className="font-bold text-foreground">{Number(viewingDetailItem.item.km || 0).toLocaleString("pt-BR")} km</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Valor</span>
                        <span className="font-bold text-red-500">R$ {Number(viewingDetailItem.item.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    {viewingDetailItem.item.observacoes && (
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">Observações</span>
                        <p className="text-xs text-foreground">{viewingDetailItem.item.observacoes}</p>
                      </div>
                    )}
                  </div>
                )}

                {viewingDetailItem.type === "compra" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Item</span>
                        <span className="font-bold text-foreground">{viewingDetailItem.item.item}</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Quantidade</span>
                        <span className="font-bold text-foreground">{viewingDetailItem.item.quantidade}</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Preço</span>
                        <span className="font-bold text-amber-500">R$ {Number(viewingDetailItem.item.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Status</span>
                        <span className="font-bold text-green-500">Concluído</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border p-4 bg-card flex justify-end">
                <button
                  onClick={() => setViewingDetailItem(null)}
                  className="px-5 py-2.5 bg-muted text-muted-foreground hover:bg-border text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Secundário: Visualizador de Fotos em Tela Cheia */}
      <AnimatePresence>
        {fullscreenPhoto && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
            <button
              onClick={() => setFullscreenPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <img
                src={fullscreenPhoto}
                alt="Foto em tamanho completo"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
