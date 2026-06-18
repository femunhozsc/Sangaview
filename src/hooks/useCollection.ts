import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
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
          fallbackToLocalStorage();
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Erro ao configurar listener do Firestore:", err);
        fallbackToLocalStorage();
      }
    } else {
      fallbackToLocalStorage();
    }

    function fallbackToLocalStorage() {
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
          localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(initialData));
        }
      } else {
        setData(initialData);
      }
      setLoading(false);
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
      } catch (err) {
        console.error("Erro ao adicionar documento no Firestore:", err);
        saveLocally();
      }
    } else {
      saveLocally();
    }

    function saveLocally() {
      if (typeof window !== "undefined") {
        const docWithId = {
          id: Math.random().toString(36).substring(2, 11),
          ...docWithTimestamp
        };
        const updatedData = [docWithId, ...data];
        setData(updatedData);
        localStorage.setItem(`sanga_${collectionName}`, JSON.stringify(updatedData));
      }
    }
  };

  return { data, loading, addDocument };
}
