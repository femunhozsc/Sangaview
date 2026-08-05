import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function useCollection(collectionName: string, initialData: any[] = []) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Caminho da coleção no Firestore (se usuário logado: /users/{uid}/{collectionName}, senão global)
  const firestorePath = user?.uid 
    ? `users/${user.uid}/${collectionName}` 
    : collectionName;

  // Chave do LocalStorage única por usuário (evita vazamento entre contas no mesmo dispositivo)
  const localStorageKey = user?.uid 
    ? `sanga_${user.uid}_${collectionName}` 
    : `sanga_${collectionName}`;

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, firestorePath), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(items);
          if (typeof window !== "undefined") {
            localStorage.setItem(localStorageKey, JSON.stringify(items));
          }
          setLoading(false);
        }, (error) => {
          console.error(`Erro ao buscar coleção ${firestorePath} do Firestore:`, error);
          loadFromServer();
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Erro ao configurar listener do Firestore:", err);
        loadFromServer();
      }
    } else {
      loadFromServer();
    }

    async function loadFromServer() {
      let localDataObj: any[] | null = null;
      if (typeof window !== "undefined") {
        const localData = localStorage.getItem(localStorageKey);
        if (localData) {
          try {
            localDataObj = JSON.parse(localData);
          } catch {}
        }
      }

      try {
        const res = await fetch(`/api/data?collection=${collectionName}&t=${Date.now()}`, {
          cache: "no-store"
        });
        if (!res.ok) throw new Error("Erro ao buscar dados do servidor");
        const result = await res.json();
        
        if (result.initialized) {
          setData(result.data);
          if (typeof window !== "undefined") {
            localStorage.setItem(localStorageKey, JSON.stringify(result.data));
          }
        } else {
          const dataToUse = localDataObj || initialData;
          setData(dataToUse);
          if (typeof window !== "undefined") {
            localStorage.setItem(localStorageKey, JSON.stringify(dataToUse));
          }
        }
      } catch (error) {
        console.error(`Erro ao carregar dados do servidor para ${collectionName}:`, error);
        setData(localDataObj || initialData);
      } finally {
        setLoading(false);
      }
    }
  }, [collectionName, firestorePath, localStorageKey]);

  const addDocument = async (newDoc: any) => {
    const docWithTimestamp = {
      ...newDoc,
      createdAt: new Date().toISOString()
    };
    const docWithId = {
      id: newDoc.id || Math.floor(100000 + Math.random() * 900000).toString(),
      ...docWithTimestamp
    };

    // 1. Atualiza o estado local e localStorage imediatamente
    const updatedData = [docWithId, ...data];
    setData(updatedData);
    if (typeof window !== "undefined") {
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    }

    // 2. Sincronia com Firestore (se configurado)
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, firestorePath), docWithTimestamp);
      } catch (error) {
        console.error(`Erro ao adicionar documento no Firestore (${firestorePath}):`, error);
      }
    }
    return docWithId;
  };

  const updateDocument = async (id: string, updatedFields: any) => {
    const updatedData = data.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    setData(updatedData);
    if (typeof window !== "undefined") {
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    }

    if (isFirebaseConfigured && db) {
      try {
        const itemRef = doc(db, firestorePath, id);
        await updateDoc(itemRef, updatedFields);
      } catch (error) {
        console.error(`Erro ao atualizar documento no Firestore (${firestorePath}):`, error);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    const updatedData = data.filter(item => item.id !== id);
    setData(updatedData);
    if (typeof window !== "undefined") {
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    }

    if (isFirebaseConfigured && db) {
      try {
        const itemRef = doc(db, firestorePath, id);
        await deleteDoc(itemRef);
      } catch (error) {
        console.error(`Erro ao deletar documento no Firestore (${firestorePath}):`, error);
      }
    }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument };
}

