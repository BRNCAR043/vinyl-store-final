// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_snLVtQfhaHhbiyGnH-9Meqjq6npQC0c",
  authDomain: "vinyl-store-5dacb.firebaseapp.com",
  projectId: "vinyl-store-5dacb",
  storageBucket: "vinyl-store-5dacb.firebasestorage.app",
  messagingSenderId: "309226868343",
  appId: "1:309226868343:web:b17df477fc93dfb1ff0072"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings that avoid connectivity issues
// (helps in some dev environments / proxies by forcing long polling)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
export const auth = getAuth(app);
export const storage = getStorage(app);