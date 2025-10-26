import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-g-zwokuQpS_u8S1KgR_q1MdjjDi2PyM",
  authDomain: "gpt-auth-bfc69.firebaseapp.com",
  databaseURL: "https://gpt-auth-bfc69-default-rtdb.firebaseio.com",
  projectId: "gpt-auth-bfc69",
  storageBucket: "gpt-auth-bfc69.firebasestorage.app",
  messagingSenderId: "1028993623769",
  appId: "1:1028993623769:web:2712eb2c41cbf4988c80c8",
  measurementId: "G-DJJFL741W1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting auth persistence:", error);
  });
}

export default app;
