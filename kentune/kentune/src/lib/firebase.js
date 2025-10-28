// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA4LX1FPdZ0c7GWeNUWr0U_EnXwjRNVu3c",
  authDomain: "astute-pro-music-hub.firebaseapp.com",
  projectId: "astute-pro-music-hub",
  storageBucket: "astute-pro-music-hub.firebasestorage.app",
  messagingSenderId: "171987694193",
  appId: "1:171987694193:web:0232fc3ff4d6efa791a1d0"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
