import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

export function useFavorites(user: FirebaseUser | null) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, "users", user.uid, "favorites"), (snapshot) => {
        setFavorites(snapshot.docs.map(doc => doc.id));
      });
      return () => unsubscribe();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (appId: string) => {
    if (!user) return false;

    try {
      const favRef = doc(db, "users", user.uid, "favorites", appId);
      if (favorites.includes(appId)) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, { createdAt: serverTimestamp() });
      }
      return true;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  };

  return {
    favorites,
    toggleFavorite
  };
}
