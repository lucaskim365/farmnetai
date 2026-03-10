import { collection, doc, setDoc, getDoc, writeBatch, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { 
  INITIAL_FARM_APPS_STORE,
  INITIAL_FARM_TOOLS_STORE 
} from "../data/initialData";
import { EDUCATION_COURSES } from "../data/educationData";

/**
 * 데이터베이스 시딩 상태를 확인하는 함수
 */
export const checkSeedStatus = async () => {
  const seedStatusRef = doc(db, "_system", "seed_status");
  const seedStatusDoc = await getDoc(seedStatusRef);
  return seedStatusDoc.exists() ? seedStatusDoc.data() : null;
};

/**
 * 기존 컬렉션 데이터를 모두 삭제하는 함수
 */
const clearCollection = async (collectionName: string) => {
  const snapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  if (snapshot.docs.length > 0) {
    await batch.commit();
    console.log(`Cleared ${snapshot.docs.length} documents from ${collectionName}`);
  }
};

/**
 * 데이터베이스에 초기 데이터를 한 번만 시딩하는 함수
 * 배치 쓰기를 사용하여 성능 최적화
 */
export const seedDatabaseOnce = async () => {
  try {
    // 이미 시딩되었는지 확인
    const seedStatus = await checkSeedStatus();
    if (seedStatus?.completed) {
      console.log("Database already seeded, skipping...");
      return { success: true, alreadySeeded: true };
    }

    console.log("Starting database seeding...");
    
    // 기존 데이터 삭제
    await clearCollection("farm_apps_store");
    await clearCollection("farm_tools_store");
    await clearCollection("education_courses");
    
    const batch = writeBatch(db);

    // Farm App Store 시딩
    INITIAL_FARM_APPS_STORE.forEach((app, index) => {
      const docRef = doc(collection(db, "farm_apps_store"));
      batch.set(docRef, {
        ...app,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Farm Tools Store 시딩
    INITIAL_FARM_TOOLS_STORE.forEach((tool, index) => {
      const docRef = doc(collection(db, "farm_tools_store"));
      batch.set(docRef, {
        ...tool,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Education Courses 시딩
    EDUCATION_COURSES.forEach((course, index) => {
      const docRef = doc(db, "education_courses", course.id);
      batch.set(docRef, {
        ...course,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // 배치 커밋
    await batch.commit();

    // 시딩 완료 상태 저장
    await setDoc(doc(db, "_system", "seed_status"), {
      completed: true,
      timestamp: new Date(),
      version: "2.0.0"
    });

    console.log("Database seeding completed successfully!");
    return { success: true, alreadySeeded: false };

  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
};

/**
 * 강제로 데이터베이스를 재시딩하는 함수 (개발/테스트용)
 */
export const reseedDatabase = async () => {
  try {
    // 시딩 상태 초기화
    await setDoc(doc(db, "_system", "seed_status"), {
      completed: false,
      timestamp: new Date()
    });

    // 재시딩 실행
    return await seedDatabaseOnce();
  } catch (error) {
    console.error("Error reseeding database:", error);
    return { success: false, error };
  }
};
