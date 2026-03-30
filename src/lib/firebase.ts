import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQFjvttmeWYhfpTcpyN3iolphmcVuOujY",
  authDomain: "nmmart-ca8f7.firebaseapp.com",
  projectId: "nmmart-ca8f7",
  storageBucket: "nmmart-ca8f7.appspot.com",
  messagingSenderId: "594732155632",
  appId: "1:594732155632:web:96e98b049389f46b40552b",
  measurementId: "G-GZ0L6D76LS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
