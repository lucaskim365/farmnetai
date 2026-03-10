import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

export const migrateUserData = async (userId: string) => {
  try {
    // 이미 마이그레이션이 완료되었는지 확인
    const migrationRef = doc(db, "_system", `migration_${userId}`);
    const migrationDoc = await getDoc(migrationRef);
    if (migrationDoc.exists() && migrationDoc.data()?.completed) {
      return; // 이미 완료됨 — 스킵
    }

    const oldRoomsQuery = query(collection(db, "rooms"), where("userId", "==", userId));
    const oldSnapshot = await getDocs(oldRoomsQuery);

    if (!oldSnapshot.empty) {
      console.log(`Migrating ${oldSnapshot.size} rooms for user ${userId}`);

      for (const roomDoc of oldSnapshot.docs) {
        const roomData = roomDoc.data();
        const roomId = roomDoc.id;

        await setDoc(doc(db, "users", userId, "rooms", roomId), roomData);

        const oldMsgsSnapshot = await getDocs(collection(db, "rooms", roomId, "messages"));
        for (const msgDoc of oldMsgsSnapshot.docs) {
          await setDoc(doc(db, "users", userId, "rooms", roomId, "messages", msgDoc.id), msgDoc.data());

          try {
            await deleteDoc(doc(db, "rooms", roomId, "messages", msgDoc.id));
          } catch (e) {
            console.warn("Could not delete old message:", e);
          }
        }

        try {
          await deleteDoc(doc(db, "rooms", roomId));
        } catch (e) {
          console.warn("Could not delete old room:", e);
        }
      }

      console.log("Migration completed successfully");
    }

    // 마이그레이션 완료 플래그 저장
    await setDoc(migrationRef, {
      completed: true,
      timestamp: new Date(),
      userId,
    });
  } catch (error) {
    console.error("Migration error:", error);
  }
};
