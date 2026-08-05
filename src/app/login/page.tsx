"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatCpf } from "@/lib/cpf";
import { ShieldCheck, UserCheck, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCpf, registerWithCpf } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setCpf(formatCpf(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await registerWithCpf(cpf, name, password);
      } else {
        await loginWithCpf(cpf, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("CPF ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este CPF já está cadastrado. Faça login.");
      } else {
        setError(err.message || "Ocorreu um erro ao realizar a autenticação.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-graphite p-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 rounded-3xl bg-[#1e1e24] p-8 border border-white/10 shadow-2xl backdrop-blur-md"
      >
        {/* Topo Logo & Título */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {isRegister ? <UserCheck className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isRegister ? "Criar sua Conta" : "Acessar o Sanga View"}
          </h1>
          <p className="text-sm text-white/50">
            {isRegister
              ? "Informe seu CPF para salvar seus serviços em sua conta"
              : "Digite seu CPF e senha para acessar seus dados"}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome (apenas Cadastro) */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-white/30 border border-white/10 outline-none transition duration-200 focus:border-amber-500 focus:bg-white/10"
                />
              </div>
            </div>
          )}

          {/* CPF com Máscara */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              CPF
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold tracking-widest text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                CPF
              </span>
              <input
                type="text"
                required
                maxLength={14}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className="w-full rounded-2xl bg-white/5 py-3.5 pl-16 pr-4 text-white placeholder-white/30 border border-white/10 outline-none transition duration-200 focus:border-amber-500 focus:bg-white/10 font-mono"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-white/30 border border-white/10 outline-none transition duration-200 focus:border-amber-500 focus:bg-white/10"
              />
            </div>
          </div>

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-semibold text-graphite shadow-lg transition duration-200 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? "Cadastrar Conta" : "Entrar na Conta"}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Alternar modo */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-sm font-medium text-amber-500 hover:underline"
          >
            {isRegister
              ? "Já possui uma conta? Faça login"
              : "Não tem uma conta? Cadastre-se com seu CPF"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
