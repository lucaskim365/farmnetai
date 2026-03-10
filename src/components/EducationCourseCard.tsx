import React from "react";
import { EducationCourse } from "../data/educationData";
import { getIconComponent } from "../utils/iconMapper";

interface EducationCourseCardProps {
  course: EducationCourse;
}

export function EducationCourseCard({ course }: EducationCourseCardProps) {
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "수강중":
        return "bg-blue-500";
      case "수강완료":
        return "bg-gray-500";
      case "수강신청":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 transition-all cursor-pointer group">
      <div className={`relative h-48 bg-gradient-to-br ${course.gradientFrom} ${course.gradientTo} flex items-center justify-center`}>
        {course.badge && (
          <div className={`absolute top-4 right-4 ${course.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {course.badge}
          </div>
        )}
        <div className={`absolute top-4 left-4 ${getStatusBadgeStyle(course.enrollmentStatus)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
          {course.enrollmentStatus}
        </div>
        {getIconComponent(course.iconType, course.iconColor, 64)}
      </div>
      <div className="p-6">
        <div className="text-xs text-zinc-500 mb-2">
          {course.category} · {course.duration} · {course.level}
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-2">{course.title}</h3>
        <p className="text-sm text-zinc-500">{course.description}</p>
      </div>
    </div>
  );
}
