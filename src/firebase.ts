// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCuH_Z70ozC41Dhuzz0tKb5Hx3VoiBFLTY",
  authDomain: "astute-empire.firebaseapp.com",
  projectId: "astute-empire",
  storageBucket: "astute-empire.appspot.com",
  messagingSenderId: "829066508421",
  appId: "1:829066508421:web:c1757761ad50f2515a51ec",
  measurementId: "G-8TV87WQFD3"
};

console.log("Firebase Config:", firebaseConfig);


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const analytics = getAnalytics(app);
