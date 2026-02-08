
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBysYPZM5N41E5mqwdJZhIq0wEB51FGYZ4",
  authDomain: "clipscript-72988.firebaseapp.com",
  projectId: "clipscript-72988",
  storageBucket: "clipscript-72988.firebasestorage.app",
  messagingSenderId: "60717540083",
  appId: "1:60717540083:web:c1d69e6b242b4ed20b8d86"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Setting up global access as requested for direct script usage if needed
(window as any).googleLogin = async () => {
  const { signInWithPopup } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  return signInWithPopup(auth, googleProvider);
};
