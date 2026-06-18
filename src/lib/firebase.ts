import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: O usuário deve substituir as configurações abaixo pelas chaves do seu projeto Firebase.
// Siga o Guia de Implantação criado para encontrar essas chaves.
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "COLE_SEU_AUTH_DOMAIN_AQUI",
  projectId: "COLE_SEU_PROJECT_ID_AQUI",
  storageBucket: "COLE_SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "COLE_SEU_SENDER_ID_AQUI",
  appId: "COLE_SEU_APP_ID_AQUI"
};

// Inicializa o Firebase apenas se ele não tiver sido inicializado antes (evita erros no Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exporta o banco de dados para ser usado nos serviços
export const db = getFirestore(app);
