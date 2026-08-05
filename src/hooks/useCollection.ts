import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, setDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
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

  useEffect(() => {
    // Caso o usuário não esteja logado e nem tenhamos Firebase ativo, encerra o carregamento
    if (!isFirebaseConfigured || !db || !user?.uid) {
      setData(initialData);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void = () => {};

    try {
      const colRef = collection(db, firestorePath);
      const q = query(colRef, orderBy("createdAt", "desc"));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data(),
        }));
        setData(items);
        setLoading(false);
      }, (error) => {
        console.warn(`Erro com orderBy("createdAt") na coleção ${firestorePath}, tentando consulta sem ordenação:`, error);
        // Fallback para buscar sem orderBy se faltar índice
        const unsubFallback = onSnapshot(colRef, (snapshot) => {
          const items = snapshot.docs.map(docItem => ({
            id: docItem.id,
            ...docItem.data(),
          }));
          setData(items);
          setLoading(false);
        }, (err2) => {
          console.error("Erro no fallback de busca Firestore:", err2);
          setLoading(false);
        });
        unsubscribe = unsubFallback;

      });
    } catch (err) {
      console.error("Erro ao configurar listener do Firestore:", err);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [collectionName, firestorePath, user?.uid]);


  const addDocument = async (newDoc: any) => {
    const { id: customId, ...dataWithoutId } = newDoc;
    const docWithTimestamp = {
      ...dataWithoutId,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db && user?.uid) {
      try {
        if (customId) {
          const customDocRef = doc(db, firestorePath, String(customId));
          await setDoc(customDocRef, docWithTimestamp);
          return { id: String(customId), ...docWithTimestamp };
        } else {
          const docRef = await addDoc(collection(db, firestorePath), docWithTimestamp);
          return { id: docRef.id, ...docWithTimestamp };
        }
      } catch (error) {
        console.error(`Erro ao adicionar documento no Firestore (${firestorePath}):`, error);
        throw error;
      }
    } else {
      const docWithId = {
        id: customId || Math.floor(100000 + Math.random() * 900000).toString(),
        ...docWithTimestamp
      };
      setData(prev => [docWithId, ...prev]);
      return docWithId;
    }
  };


  const updateDocument = async (id: string, updatedFields: any) => {
    if (isFirebaseConfigured && db && user?.uid) {
      try {
        const itemRef = doc(db, firestorePath, id);
        await updateDoc(itemRef, updatedFields);
      } catch (error) {
        console.error(`Erro ao atualizar documento no Firestore (${firestorePath}):`, error);
        throw error;
      }
    } else {
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
    }
  };

  const deleteDocument = async (id: string) => {
    if (isFirebaseConfigured && db && user?.uid) {
      try {
        const itemRef = doc(db, firestorePath, id);
        await deleteDoc(itemRef);
      } catch (error) {
        console.error(`Erro ao deletar documento no Firestore (${firestorePath}):`, error);
        throw error;
      }
    } else {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  return { data, loading, addDocument, updateDocument, deleteDocument };
}


