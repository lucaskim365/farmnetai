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

    const appsQuery = query(collection(db, "farm_apps_store"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      setFarmAppsStore(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreApp[]);
      setIsAppsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Farm Tools Store 리스너
  useEffect(() => {
    setIsToolsLoading(true);

    const toolsQuery = query(collection(db, "farm_tools_store"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(toolsQuery, (snapshot) => {
      setFarmToolsStore(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreApp[]);
      setIsToolsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    farmAppsStore,
    farmToolsStore,
    isAppsLoading,
    isToolsLoading
  };
}
