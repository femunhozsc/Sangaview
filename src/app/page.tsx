"use client";

import { useEffect, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [router, user, loading]);


  return (
    <div className="flex h-screen w-full flex-col items-center justify-between bg-graphite p-8 select-none">
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Logo Sanga */}
          <div className="relative flex max-w-[280px] md:max-w-xs items-center justify-center rounded-2xl p-4 transition-all duration-300">
            <ViewTransition name="sanga-logo">
              <img 
                src="/Sanga-Logo.png" 
                alt="Sanga Auto Socorro" 
                className="h-auto w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              />
            </ViewTransition>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col items-center gap-2.5 select-none"
      >
        <span className="text-[10px] text-white/30 tracking-wide font-medium">
          © {new Date().getFullYear()} Sanga View. Todos os direitos reservados.
        </span>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[9px] uppercase tracking-[0.15em] text-white/50">powered by</span>
          <img 
            src="/clearview-logo.png" 
            alt="Clearview Logo" 
            className="h-5 object-contain" 
          />
        </div>
      </motion.div>
    </div>
  );
}

