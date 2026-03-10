import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { ChatRoom } from "../types";
import { migrateUserData } from "../services/migrationService";

export function useChatRooms(user: FirebaseUser | null) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRoomTitle, setNewRoomTitle] = useState("");

  useEffect(() => {
    if (user) {
      migrateUserData(user.uid);

      const q = query(
        collection(db, "users", user.uid, "rooms"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
          setChatRooms(rooms);
        },
        (error) => {
          console.error("Rooms listener error:", error);
        }
      );
      return () => unsubscribe();
    } else {
      setChatRooms([]);
      setActiveRoomId(null);
    }
  }, [user]);

  const createNewRoom = async () => {
    if (!user) return null;

    const docRef = await addDoc(collection(db, "users", user.uid, "rooms"), {
      title: "새로운 상담",
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    setActiveRoomId(docRef.id);
    return docRef.id;
  };

  const renameRoom = async (roomId: string) => {
    if (!newRoomTitle.trim() || !user) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
        title: newRoomTitle
      });
      setEditingRoomId(null);
    } catch (error) {
      console.error("Error renaming room:", error);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!window.confirm("정말로 이 상담을 삭제하시겠습니까?") || !user) return;

    try {
      // 하위 messages 서브컬렉션 먼저 삭제
      const messagesSnapshot = await getDocs(
        collection(db, "users", user.uid, "rooms", roomId, "messages")
      );
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach((msgDoc) => {
        batch.delete(msgDoc.ref);
      });
      if (messagesSnapshot.docs.length > 0) {
        await batch.commit();
      }

      // 룸 문서 삭제
      await deleteDoc(doc(db, "users", user.uid, "rooms", roomId));
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return {
    chatRooms,
    activeRoomId,
    setActiveRoomId,
    editingRoomId,
    setEditingRoomId,
    newRoomTitle,
    setNewRoomTitle,
    createNewRoom,
    renameRoom,
    deleteRoom
  };
}
