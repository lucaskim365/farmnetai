import React, { useState, useRef, useEffect } from "react";
import { Menu, MessageSquare, ChevronDown, LogOut, User } from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { ChatRoom, ViewType } from "../types";

interface HeaderProps {
  onMenuClick: () => void;
  activeView: ViewType;
  activeRoomId: string | null;
  chatRooms: ChatRoom[];
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  onShowAuth: () => void;
  onRoomSelect: (roomId: string) => void;
}

export function Header({
  onMenuClick,
  activeView,
  activeRoomId,
  chatRooms,
  user,
  isAuthLoading,
  onShowAuth,
  onRoomSelect
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTitle = () => {
    if (activeRoomId) {
      return chatRooms.find(r => r.id === activeRoomId)?.title;
    }
    switch (activeView) {
      case "appstore": return "Farm App Store";
      case "tools": return "Farm Tools Store";
      case "education": return "농업 교육";
      default: return "FarmNet AI 상담";
    }
  };

  const handleRoomClick = (roomId: string) => {
    onRoomSelect(roomId);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
        >
          <Menu size={20} />
        </button>
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors max-w-[150px] md:max-w-none"
          >
            <MessageSquare size={16} className="text-zinc-500 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium truncate">
              {getTitle()}
            </span>
            <ChevronDown size={14} className={`text-zinc-500 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#1e1e1e] border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-zinc-800">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">내 상담 목록</div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!user ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-zinc-500 mb-3">로그인 후 상담 이력을 확인하세요.</p>
                    <button 
                      onClick={() => {
                        onShowAuth();
                        setIsDropdownOpen(false);
                      }}
                      className="text-xs font-bold text-[#4ade80] hover:underline"
                    >
                      로그인하기
                    </button>
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-zinc-500">상담 내역이 없습니다</p>
                  </div>
                ) : (
                  chatRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomClick(room.id)}
                      className={`p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors border-l-2 ${
                        activeRoomId === room.id ? 'border-[#4ade80] bg-[#4ade80]/5' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare size={16} className={activeRoomId === room.id ? 'text-[#4ade80]' : 'text-zinc-500'} />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-medium text-zinc-200 truncate">{room.title}</div>
                          <div className="text-xs text-zinc-500">
                            {room.createdAt && new Date(room.createdAt.toDate()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAuthLoading ? (
          <div className="w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {user.email?.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold text-zinc-200 leading-none">{user.email?.split("@")[0]}</div>
                <div className="text-[10px] text-zinc-500">{user.email}</div>
              </div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="bg-[#1e1e1e] hover:bg-zinc-800 border border-zinc-800 px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">로그아웃</span>
            </button>
          </>
        ) : (
          <button 
            onClick={onShowAuth}
            className="bg-[#4ade80] text-black px-4 md:px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#3bc76d] transition-all flex items-center gap-2"
          >
            <User size={16} />
            <span className="hidden md:inline">로그인</span>
          </button>
        )}
      </div>
    </header>
  );
}
