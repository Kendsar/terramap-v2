import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCS7XE0db2PPPa7_OhGrZkFA4UgTjQ_bAk",
  authDomain: "terramap-7aa5c.firebaseapp.com",
  projectId: "terramap-7aa5c",
  storageBucket: "terramap-7aa5c.firebasestorage.app",
  messagingSenderId: "142484933890",
  appId: "1:142484933890:web:40feea5e7c2c5b2177861b",
  measurementId: "G-7XXC2VW64R"
};

// Initialize Firebase only if it hasn't been initialized already (fixes Next.js hot reload issues)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
