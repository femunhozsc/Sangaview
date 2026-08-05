"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User 
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { cleanCpf, cpfToEmail, formatCpf, validateCpf } from "@/lib/cpf";

interface UserProfile {
  uid: string;
  cpf: string;
  name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithCpf: (cpf: string, pass: string) => Promise<void>;
  registerWithCpf: (cpf: string, name: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const MOCK_USER_STORAGE_KEY = "sanga_mock_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          // Extrai o CPF a partir do e-mail do Firebase (ex: 12345678900@sangaview.app -> 12345678900)
          const cpfRaw = firebaseUser.email?.split("@")[0] || "";
          setUser({
            uid: firebaseUser.uid,
            cpf: formatCpf(cpfRaw),
            name: firebaseUser.displayName || "Usuário",
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo Mock Local se Firebase não estiver configurado
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {}
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithCpf = async (cpfInput: string, pass: string) => {
    if (!validateCpf(cpfInput)) {
      throw new Error("CPF inválido. Verifique os números digitados.");
    }

    const email = cpfToEmail(cpfInput);

    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const cpfRaw = cleanCpf(cpfInput);
      setUser({
        uid: cred.user.uid,
        cpf: formatCpf(cpfRaw),
        name: cred.user.displayName || "Usuário",
      });
    } else {
      // Login Mock Local
      const mockCpfClean = cleanCpf(cpfInput);
      const mockUser: UserProfile = {
        uid: `user_${mockCpfClean}`,
        cpf: formatCpf(mockCpfClean),
        name: "Usuário Sanga",
      };
      setUser(mockUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser));
      }
    }
  };

  const registerWithCpf = async (cpfInput: string, name: string, pass: string) => {
    if (!validateCpf(cpfInput)) {
      throw new Error("CPF inválido. Por favor, insira um CPF válido.");
    }
    if (!name || name.trim().length < 2) {
      throw new Error("Por favor, informe seu nome completo.");
    }
    if (!pass || pass.length < 6) {
      throw new Error("A senha deve conter no mínimo 6 caracteres.");
    }

    const email = cpfToEmail(cpfInput);

    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      const cpfRaw = cleanCpf(cpfInput);
      setUser({
        uid: cred.user.uid,
        cpf: formatCpf(cpfRaw),
        name: name,
      });
    } else {
      // Registro Mock Local
      const mockCpfClean = cleanCpf(cpfInput);
      const mockUser: UserProfile = {
        uid: `user_${mockCpfClean}`,
        cpf: formatCpf(mockCpfClean),
        name: name,
      };
      setUser(mockUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser));
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithCpf, registerWithCpf, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
