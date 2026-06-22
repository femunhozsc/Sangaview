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
      // 1. Ler do LocalStorage primeiro para uma resposta instantânea e persistente
      let localDataObj: any[] | null = null;
      if (typeof window !== "undefined") {
        const localData = localStorage.getItem(`sanga_${collectionName}`);
        if (localData) {
          try {
            localDataObj = JSON.parse(localData);
          } catch {}
        }
      }

      try {
        const res = await fetch(`/api/data?collection=${collectionName}`);
        if (!res.ok) throw new Error("Erro ao buscar dados do servidor");
        const result = await res.json();
        
        if (result.initialized) {
          // Se o localStorage local tiver mais registros que o servidor (ex: servidor resetou/wipou o arquivo temporário),
          // nós mantemos os do localStorage e ressincronizamos para o servidor.
          if (localDataObj && localDataObj.length > result.data.length) {
            setData(localDataObj);
            await fetch(`/api/data?collection=${collectionName}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ initData: localDataObj })
            });
          } else {
            setData(result.data);
            if (typeof window !== "undefined") {
              localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(result.data));
            }
          }
        } else {
          // Servidor não inicializado. Usar dados do localStorage ou mockados.
          const dataToUse = localDataObj || initialData;
          setData(dataToUse);
          await fetch(`/api/data?collection=${collectionName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: dataToUse })
          });
          if (typeof window !== "undefined" && !localDataObj) {
            localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(initialData));
          }
        }
      } catch (error) {
        console.error(`Erro ao carregar dados do servidor para ${collectionName}:`, error);
        // Fallback local se o servidor estiver inacessível
        setData(localDataObj || initialData);
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
    const docWithId = {
      id: newDoc.id || Math.floor(100000 + Math.random() * 900000).toString(),
      ...docWithTimestamp
    };

    // 1. Atualiza o estado local e localStorage imediatamente (Local-first / Optimistic UI)
    const updatedData = [docWithId, ...data];
    setData(updatedData);
    if (typeof window !== "undefined") {
      localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
    }

    // 2. Sincronia com Firestore (se configurado)
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, collectionName), {
          ...docWithId,
          createdAt: new Date()
        });
        return;
      } catch (err) {
        console.error("Erro ao adicionar documento no Firestore:", err);
      }
    }

    // 3. Sincronia com o Servidor Central
    try {
      await fetch(`/api/data?collection=${collectionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docWithId)
      });
    } catch (err) {
      console.error("Erro de sincronia com servidor:", err);
    }
  };

  const updateDocument = async (id: string, updatedFields: any) => {
    // 1. Atualiza o estado local e localStorage imediatamente
    const updatedData = data.map(item => 
      item.id === id ? { ...item, ...updatedFields } : item
    );
    setData(updatedData);
    if (typeof window !== "undefined") {
      localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
    }

    // 2. Sincronia com Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updatedFields);
        return;
      } catch (err) {
        console.error("Erro ao atualizar documento no Firestore:", err);
      }
    }

    // 3. Sincronia com o Servidor Central
    try {
      await fetch(`/api/data?collection=${collectionName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fields: updatedFields })
      });
    } catch (err) {
      console.error("Erro ao atualizar no servidor:", err);
    }
  };

  const deleteDocument = async (id: string) => {
    // 1. Atualiza o estado local e localStorage imediatamente
    const updatedData = data.filter(item => item.id !== id);
    setData(updatedData);
    if (typeof window !== "undefined") {
      localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
    }

    // 2. Sincronia com Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        console.error("Erro ao deletar documento no Firestore:", err);
      }
    }

    // 3. Sincronia com o Servidor Central
    try {
      await fetch(`/api/data?collection=${collectionName}&id=${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.error("Erro ao deletar no servidor:", err);
    }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument };
}
