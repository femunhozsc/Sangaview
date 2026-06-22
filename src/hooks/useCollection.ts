import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export function useCollection(collectionName: string, initialData: any[] = []) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(items);
          setLoading(false);
        }, (error) => {
          console.error(`Erro ao buscar coleção ${collectionName} do Firestore:`, error);
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
      try {
        const res = await fetch(`/api/data?collection=${collectionName}`);
        if (!res.ok) throw new Error("Erro ao buscar dados do servidor");
        const result = await res.json();
        
        if (result.initialized) {
          setData(result.data);
        } else {
          // Inicializa a coleção no servidor com os dados mockados padrão
          setData(initialData);
          await fetch(`/api/data?collection=${collectionName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: initialData })
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar dados do servidor para ${collectionName}:`, error);
        // Fallback local caso o servidor esteja inacessível
        if (typeof window !== "undefined") {
          const localData = localStorage.getItem(`sanga_${collectionName}`);
          if (localData) {
            try {
              setData(JSON.parse(localData));
            } catch {
              setData(initialData);
            }
          } else {
            setData(initialData);
          }
        } else {
          setData(initialData);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [collectionName]);

  const addDocument = async (newDoc: any) => {
    const docWithTimestamp = {
      ...newDoc,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, collectionName), {
          ...newDoc,
          createdAt: new Date()
        });
        return;
      } catch (err) {
        console.error("Erro ao adicionar documento no Firestore:", err);
      }
    }

    // Central Server Sync
    try {
      const res = await fetch(`/api/data?collection=${collectionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc)
      });
      if (!res.ok) throw new Error("Erro ao persistir no servidor");
      const savedDoc = await res.json();
      setData(prev => [savedDoc, ...prev]);
      return;
    } catch (err) {
      console.error("Erro de sincronia com servidor, salvando no localStorage:", err);
    }

    // Local Storage Fallback
    if (typeof window !== "undefined") {
      const docWithId = {
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        ...docWithTimestamp
      };
      const updatedData = [docWithId, ...data];
      setData(updatedData);
      localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
    }
  };

  const updateDocument = async (id: string, updatedFields: any) => {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updatedFields);
        return;
      } catch (err) {
        console.error("Erro ao atualizar documento no Firestore:", err);
      }
    }

    // Central Server Sync
    try {
      const res = await fetch(`/api/data?collection=${collectionName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fields: updatedFields })
      });
      if (!res.ok) throw new Error("Erro ao atualizar no servidor");
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
      return;
    } catch (err) {
      console.error("Erro ao atualizar no servidor, salvando no localStorage:", err);
    }

    // Local Storage Fallback
    if (typeof window !== "undefined") {
      const updatedData = data.map(item => 
        item.id === id ? { ...item, ...updatedFields } : item
      );
      setData(updatedData);
      localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
    }
  };

  const deleteDocument = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        console.error("Erro ao deletar documento no Firestore:", err);
      }
    }

    // Central Server Sync
    try {
      const res = await fetch(`/api/data?collection=${collectionName}&id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Erro ao deletar no servidor");
      setData(prev => prev.filter(item => item.id !== id));
      return;
    } catch (err) {
      console.error("Erro ao deletar no servidor, deletando no localStorage:", err);
    }

    // Local Storage Fallback
    if (typeof window !== "undefined") {
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
      localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
    }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument };
}
