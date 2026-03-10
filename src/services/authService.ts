import { User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const recordLoginHistory = async (user: FirebaseUser, method: string) => {
  try {
    await addDoc(collection(db, "login_history"), {
      userId: user.uid,
      email: user.email,
      loginTime: serverTimestamp(),
      method: method,
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error("Error recording login history:", error);
  }
};
