import React, { useState, useMemo } from "react";
import { BookOpen, Loader2, Search } from "lucide-react";
import { useEducationCourses } from "./hooks/useEducationCourses";
import { EducationCourseCard } from "./components/EducationCourseCard";

type EnrollmentFilter = "전체" | "수강중" | "수강완료" | "수강신청";

export default function EducationPage() {
  const { courses, isLoading } = useEducationCourses();
  const [selectedFilter, setSelectedFilter] = useState<EnrollmentFilter>("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // 수강 상태 필터링
    if (selectedFilter !== "전체") {
      filtered = filtered.filter(course => course.enrollmentStatus === selectedFilter);
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [courses, selectedFilter, searchQuery]);

  const filters: EnrollmentFilter[] = ["전체", "수강중", "수강완료", "수강신청"];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4ade80]/10 text-[#4ade80] rounded-3xl">
            <BookOpen size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-zinc-100 tracking-tight">Farm Education</h2>
            <p className="text-zinc-500 mt-1">최첨단 농업 기술로 역량을 키워보세요</p>
          </div>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="강좌 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#4ade80]/50 transition-colors"
          />
        </div>
      </div>

      {/* 필터 버튼 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedFilter === filter
              ? "bg-[#4ade80] text-black"
              : "bg-[#1e1e1e] text-zinc-400 hover:bg-[#2a2a2a] border border-zinc-800"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-[#4ade80]" size={40} />
          <p className="text-zinc-500">교육 과정을 불러오는 중...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-zinc-500">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <React.Fragment key={course.id}>
              <EducationCourseCard course={course} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
