import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { EducationCourse } from "../data/educationData";

export function useEducationCourses() {
  const [courses, setCourses] = useState<EducationCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const coursesQuery = query(collection(db, "education_courses"), orderBy("order", "asc"));
    
    const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as EducationCourse[];
      
      setCourses(coursesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    courses,
    isLoading
  };
}
