import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { StoreApp } from "../types";
import { seedDatabaseOnce } from "../services/seedDatabase";

export function useStoreData() {
  const [farmAppsStore, setFarmAppsStore] = useState<StoreApp[]>([]);
  const [farmToolsStore, setFarmToolsStore] = useState<StoreApp[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState(true);
  const [isToolsLoading, setIsToolsLoading] = useState(true);
  const seedingRef = useRef(false);

  // 앱 시작 시 한 번만 시딩 확인 및 실행
  useEffect(() => {
    if (!seedingRef.current) {
      seedingRef.current = true;
      seedDatabaseOnce().then((result) => {
        if (result.alreadySeeded) {
          console.log("Using existing database data");
        } else if (result.success) {
          console.log("Database seeded successfully");
        }
      });
    }
  }, []);

  // Farm App Store 리스너
  useEffect(() => {
    setIsAppsLoading(true);
    console.log("Starting Farm App Store listener...");

    const appsQuery = query(collection(db, "farm_apps_store"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(appsQuery, 
      (snapshot) => {
        console.log(`Received Farm Apps: ${snapshot.size} items`);
        setFarmAppsStore(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreApp[]);
        setIsAppsLoading(false);
      },
      (error) => {
        console.error("Farm App Store onSnapshot Error:", error);
        setIsAppsLoading(false); // 에러 발생 시에도 로딩 해제
      }
    );

    // 타임아웃 처리 (15초 후 강제 로딩 해제)
    const timeoutId = setTimeout(() => {
      if (isAppsLoading) {
        console.warn("Farm App Store loading timed out");
        setIsAppsLoading(false);
      }
    }, 15000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Farm Tools Store 리스너
  useEffect(() => {
    setIsToolsLoading(true);
    console.log("Starting Farm Tools Store listener...");

    const toolsQuery = query(collection(db, "farm_tools_store"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(toolsQuery, 
      (snapshot) => {
        console.log(`Received Farm Tools: ${snapshot.size} items`);
        setFarmToolsStore(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreApp[]);
        setIsToolsLoading(false);
      },
      (error) => {
        console.error("Farm Tools Store onSnapshot Error:", error);
        setIsToolsLoading(false); // 에러 발생 시에도 로딩 해제
      }
    );

    // 타임아웃 처리 (15초 후 강제 로딩 해제)
    const timeoutId = setTimeout(() => {
      if (isToolsLoading) {
        console.warn("Farm Tools Store loading timed out");
        setIsToolsLoading(false);
      }
    }, 15000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    farmAppsStore,
    farmToolsStore,
    isAppsLoading,
    isToolsLoading
  };
}
