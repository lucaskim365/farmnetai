import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { StoreApp, ChatRoom, ViewType } from "../types";
import { EducationCourse } from "../data/educationData";
import { getIconComponent } from "../utils/iconMapper";

interface HomeDashboardProps {
    farmAppsStore: StoreApp[];
    farmToolsStore: StoreApp[];
    courses: EducationCourse[];
    favorites: string[];
    chatRooms: ChatRoom[];
    user: any;
    onViewChange: (view: ViewType) => void;
    onRoomSelect: (roomId: string) => void;
    onSidebarOpen: () => void;
}

export function HomeDashboard({
    farmAppsStore,
    farmToolsStore,
    courses,
    favorites,
    chatRooms,
    user,
    onViewChange,
    onRoomSelect,
    onSidebarOpen,
}: HomeDashboardProps) {
    return (
        <div className="min-h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto pb-40">
            <div className="flex items-center gap-3 text-[#4ade80] font-bold text-5xl mb-2">
                <div className="w-16 h-16 bg-[#4ade80] rounded-2xl flex items-center justify-center text-black">
                    AI
                </div>
                FarmNet
            </div>
            <p className="text-zinc-400 text-lg">농업의 미래를 함께하는 스마트 비서, FarmNet</p>

            {/* My Farm Apps */}
            {farmAppsStore.length > 0 && (
                <div className="w-full max-w-6xl mt-16 text-left">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            My Farm Apps
                        </h3>
                        <button
                            onClick={() => onViewChange("appstore")}
                            className="text-sm text-[#4ade80] hover:underline"
                        >
                            전체보기
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {(favorites.filter(id => farmAppsStore.some(app => app.id === id)).length > 0
                            ? farmAppsStore.filter(app => favorites.includes(app.id))
                            : farmAppsStore.slice(0, 4)
                        ).map(app => (
                            <div
                                key={app.id}
                                onClick={() => onViewChange("appstore")}
                                className="bg-[#1e1e1e] border border-zinc-800 p-6 rounded-3xl hover:border-zinc-600 transition-all cursor-pointer group relative"
                            >
                                <div className="mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/50">
                                        {getIconComponent(app.iconType, app.color)}
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-zinc-100 mb-2.5 whitespace-pre-line leading-tight">{app.title}</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">{app.desc}</p>
                            </div>
                        ))
                        }
                    </div>
                </div>
            )}

            {/* My Farm Tools */}
            {farmToolsStore.length > 0 && (
                <div className="w-full max-w-6xl mt-16 text-left">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            My Farm Tools
                        </h3>
                        <button
                            onClick={() => onViewChange("tools")}
                            className="text-sm text-[#4ade80] hover:underline"
                        >
                            전체보기
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {(favorites.filter(id => farmToolsStore.some(tool => tool.id === id)).length > 0
                            ? farmToolsStore.filter(tool => favorites.includes(tool.id))
                            : farmToolsStore.slice(0, 4)
                        ).map(tool => (
                            <div
                                key={tool.id}
                                onClick={() => onViewChange("tools")}
                                className="bg-[#1e1e1e] border border-zinc-800 p-6 rounded-3xl hover:border-zinc-600 transition-all cursor-pointer group relative"
                            >
                                <div className="mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/50">
                                        {getIconComponent(tool.iconType, tool.color)}
                                    </div>
                                </div>
                                <h4 className="text-base font-bold text-zinc-100 mb-2">{tool.title}</h4>
                                <p className="text-xs text-zinc-500 leading-relaxed">{tool.desc}</p>
                            </div>
                        ))
                        }
                    </div>
                </div>
            )}

            {/* Farm Education — 수강중인 강좌만 표시 */}
            {courses.filter(course => course.enrollmentStatus === "수강중").length > 0 && (
                <div className="w-full max-w-6xl mt-16 text-left">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            My Farm Edu
                        </h3>
                        <button
                            onClick={() => onViewChange("education")}
                            className="text-sm text-[#4ade80] hover:underline"
                        >
                            전체보기
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {courses
                            .filter(course => course.enrollmentStatus === "수강중")
                            .map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => onViewChange("education")}
                                    className="bg-[#1e1e1e] border border-zinc-800 p-6 rounded-3xl hover:border-zinc-600 transition-all cursor-pointer group relative"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800/50">
                                            {getIconComponent(course.iconType, course.iconColor.replace('text-', ''))}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">수강중</span>
                                                {course.badge && (
                                                    <span className={`${course.badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                                                        {course.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-base font-bold text-zinc-100 mb-2">{course.title}</h4>
                                            <p className="text-xs text-zinc-500 mb-2">{course.description}</p>
                                            <div className="text-xs text-zinc-600">
                                                {course.category} · {course.duration}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* 최근 상담 내역 */}
            {user && chatRooms.length > 0 && (
                <div className="w-full max-w-xl mt-16 text-left">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-zinc-200">최근 상담 내역</h3>
                        <button
                            onClick={onSidebarOpen}
                            className="text-xs text-[#4ade80] hover:underline"
                        >
                            전체보기
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {chatRooms.slice(0, 4).map((room) => (
                            <div
                                key={room.id}
                                onClick={() => onRoomSelect(room.id)}
                                className="bg-[#1e1e1e] border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-zinc-600 cursor-pointer transition-all group"
                            >
                                <div className="p-2 bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform text-[#4ade80]">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-bold text-zinc-300 truncate">{room.title}</div>
                                    <div className="text-[10px] text-zinc-500">
                                        {room.createdAt && new Date(room.createdAt.toDate()).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
