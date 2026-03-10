import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { ChatMessage } from "../types";

export function useMessages(user: FirebaseUser | null, activeRoomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (user && activeRoomId) {
      const q = query(
        collection(db, "users", user.uid, "rooms", activeRoomId, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
          setMessages(msgs);
        },
        (error) => {
          console.error("Messages listener error:", error);
        }
      );

      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [user, activeRoomId]);

  return messages;
}
