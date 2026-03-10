import React from "react";
import { Home, Globe, Wrench, BookOpen, Bookmark, MessageSquare, Plus, X, Edit2, Check } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { ChatRoom, ViewType } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: "chat" | "appstore" | "tools" | "education") => void;
  onNewRoom: () => void;
  chatRooms: ChatRoom[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onRoomDelete: (roomId: string) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  newRoomTitle: string;
  setNewRoomTitle: (title: string) => void;
  onRoomRename: (roomId: string) => void;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  onShowAuth: () => void;
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${active ? "bg-[#4ade80]/10 text-[#4ade80]" : "hover:bg-[#1e1e1e] text-zinc-500"}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function QuickCircle({ icon, label, color }: { icon: string, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white text-lg`}>
        {icon}
      </div>
      <span className="text-[9px] text-zinc-500 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  activeView,
  onViewChange,
  onNewRoom,
  chatRooms,
  activeRoomId,
  onRoomSelect,
  onRoomDelete,
  editingRoomId,
  setEditingRoomId,
  newRoomTitle,
  setNewRoomTitle,
  onRoomRename,
  user,
  isAuthLoading,
  onShowAuth
}: SidebarProps) {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-[#121212] border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={onClose}
          className="flex items-center gap-2 text-[#4ade80] font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-[#4ade80] rounded-lg flex items-center justify-center text-black">
            AI
          </div>
          FarmNet
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 pt-0">
        <nav className="space-y-1">
          <SidebarItem
            icon={<Home size={20} />}
            label="홈"
            active={activeView === "chat" && activeRoomId === null}
            onClick={() => {
              onViewChange("chat");
              onClose();
            }}
          />
          <SidebarItem
            icon={<Globe size={20} />}
            label="Farm App Store"
            active={activeView === "appstore"}
            onClick={() => {
              onViewChange("appstore");
              onClose();
            }}
          />
          <SidebarItem
            icon={<Wrench size={20} />}
            label="Farm Tools Store"
            active={activeView === "tools"}
            onClick={() => {
              onViewChange("tools");
              onClose();
            }}
          />
          <SidebarItem
            icon={<BookOpen size={20} />}
            label="Farm Education"
            active={activeView === "education"}
            onClick={() => {
              onViewChange("education");
              onClose();
            }}
          />
          <SidebarItem icon={<Bookmark size={20} />} label="My Farm" onClick={onClose} />
        </nav>
      </div>

      <div className="mt-4 px-4">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">관심톡</div>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <QuickCircle icon="%" label="초특가 할인" color="bg-indigo-600" />
          <QuickCircle icon="🎟️" label="쿠폰 받기" color="bg-pink-600" />
          <QuickCircle icon="🚜" label="팜톡" color="bg-emerald-600" />
        </div>

        <button
          onClick={onNewRoom}
          className="w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-zinc-800 rounded-xl p-3 flex items-center justify-between transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#4ade80] rounded-full p-1 text-black">
              <Plus size={16} />
            </div>
            <span className="font-medium text-zinc-200">새로운 상담</span>
          </div>
          <span className="text-[10px] text-zinc-500">방금</span>
        </button>
      </div>

      <div className="mt-8 px-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">내 상담 목록</div>
        <div className="space-y-1">
          {isAuthLoading ? (
            <div className="p-4 text-center">
              <div className="w-4 h-4 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : user ? (
            chatRooms.length > 0 ? (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => {
                    onRoomSelect(room.id);
                    onClose();
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-all ${activeRoomId === room.id ? "bg-[#4ade80]/10 text-[#4ade80]" : "hover:bg-[#1e1e1e] text-zinc-500"}`}
                >
                  <MessageSquare size={16} />
                  {editingRoomId === room.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        autoFocus
                        className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full"
                        value={newRoomTitle}
                        onChange={(e) => setNewRoomTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onRoomRename(room.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); onRoomRename(room.id); }} className="p-1 hover:text-[#4ade80]">
                        <Check size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingRoomId(null); }} className="p-1 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                      <span className="text-sm truncate mr-2">{room.title}</span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRoomId(room.id);
                            setNewRoomTitle(room.title);
                          }}
                          className="p-1 hover:text-zinc-200"
                          title="이름 변경"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRoomDelete(room.id);
                          }}
                          className="p-1 hover:text-red-400"
                          title="삭제"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-zinc-600 text-[11px]">상담 내역이 없습니다</p>
              </div>
            )
          ) : (
            <div className="p-4 text-center space-y-3">
              <p className="text-xs text-zinc-600">로그인 후 상담 이력을 확인하세요.</p>
              <button
                onClick={onShowAuth}
                className="text-xs font-bold text-[#4ade80] hover:underline"
              >
                로그인하기
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
