import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { recordLoginHistory } from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (
    email: string, 
    password: string, 
    mode: "login" | "signup"
  ) => {
    let userCredential;
    if (mode === "login") {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      await recordLoginHistory(userCredential.user, "email");
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await recordLoginHistory(userCredential.user, "email_signup");
    }
    return userCredential;
  };

  const handleGoogleLogin = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await recordLoginHistory(userCredential.user, "google");
    return userCredential;
  };

  return {
    user,
    isAuthLoading,
    handleEmailAuth,
    handleGoogleLogin
  };
}
