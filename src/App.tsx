/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  Plus, 
  MessageSquare, 
  Home, 
  Search, 
  Wrench, 
  Gift, 
  Bookmark, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  TrendingUp, 
  Bug, 
  CloudSun, 
  Building2, 
  BookOpen, 
  Calculator, 
  ClipboardList, 
  FlaskConical,
  LogOut,
  ChevronDown,
  Globe,
  Loader2,
  User,
  X,
  Edit2,
  Check,
  Paperclip,
  Play,
  LayoutGrid,
  Star,
  Sparkles,
  FileText,
  PenTool
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  setDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, googleProvider } from "./firebase";

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ChatMessage {
  id?: string;
  role: "user" | "model";
  text: string;
  timestamp?: any;
  imageUrl?: string;
}

interface ChatRoom {
  id: string;
  title: string;
  createdAt: any;
  userId: string;
}

interface StoreApp {
  id: string;
  title: string;
  desc: string;
  iconType: string;
  color: string;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [isSearchOn, setIsSearchOn] = useState(false);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "appstore" | "tools">("chat");
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [tools, setTools] = useState<StoreApp[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [isAppsLoading, setIsAppsLoading] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRoomTitle, setNewRoomTitle] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (!currentUser) {
        setChatRooms([]);
        setActiveRoomId(null);
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Apps & Tools Listener & Seeding
  useEffect(() => {
    setIsAppsLoading(true);
    
    // Tools (Colorful cards)
    const unsubscribeTools = onSnapshot(collection(db, "farm_tools"), async (snapshot) => {
      if (snapshot.empty) {
        const initialTools = [
          { title: "오늘의 농산물 시세", desc: "전국 도매시장 경매 가격을 실시간으로 확인하세요.", iconType: "Search", color: "text-orange-400" },
          { title: "병해충 진단 갤러리", desc: "AI가 분석한 병해충 사례와 대처법을 확인해보세요.", iconType: "Image", color: "text-emerald-400" },
          { title: "정부 지원 사업", desc: "농업인을 위한 최신 보조금 및 지원 정책 정보", iconType: "Sparkles", color: "text-yellow-400" },
          { title: "농업 기술 뉴스", desc: "스마트팜, 신품종 등 최신 농업 기술 동향", iconType: "FileText", color: "text-blue-400" },
          { title: "농사 꿀팁 영상", desc: "전문가들이 알려주는 작물별 재배 노하우 요약", iconType: "Play", color: "text-red-400" },
          { title: "귀농/귀촌 가이드", desc: "성공적인 농촌 정착을 위한 단계별 안내", iconType: "PenTool", color: "text-teal-400" },
        ];
        for (const tool of initialTools) {
          await addDoc(collection(db, "farm_tools"), { ...tool, createdAt: serverTimestamp() });
        }
      } else {
        setTools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreApp[]);
      }
    });

    // Marketplace Apps (Wrench cards)
    const unsubscribeApps = onSnapshot(collection(db, "store_apps"), async (snapshot) => {
      if (snapshot.empty) {
        const initialApps = [
          { title: "토양 분석", desc: "토양 성분 분석 및 시비 처방", iconType: "Wrench", color: "text-zinc-400" },
          { title: "출하 시기 예측", desc: "빅데이터 기반 최적 출하 시기 예측", iconType: "Wrench", color: "text-zinc-400" },
          { title: "날씨 알림", desc: "지역별 맞춤형 영농 기상 정보", iconType: "Wrench", color: "text-zinc-400" },
          { title: "농약 정보", desc: "안전한 농약 사용 정보 및 검색", iconType: "Wrench", color: "text-zinc-400" },
          { title: "농기계 대여", desc: "가까운 농기계 임대 사업소 정보", iconType: "Wrench", color: "text-zinc-400" },
          { title: "영농 일지", desc: "간편한 디지털 영농 기록 관리", iconType: "Wrench", color: "text-zinc-400" },
          { title: "유통 경로", desc: "효율적인 농산물 유통 및 판로 정보", iconType: "Wrench", color: "text-zinc-400" },
          { title: "시세 분석", desc: "전국 도매시장 농산물 시세 분석", iconType: "Wrench", color: "text-zinc-400" },
        ];
        for (const app of initialApps) {
          await addDoc(collection(db, "store_apps"), { ...app, createdAt: serverTimestamp() });
        }
      } else {
        setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreApp[]);
      }
      setIsAppsLoading(false);
    });

    return () => {
      unsubscribeTools();
      unsubscribeApps();
    };
  }, []);

  // Favorites Listener
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, "users", user.uid, "favorites"), (snapshot) => {
        setFavorites(snapshot.docs.map(doc => doc.id));
      });
      return () => unsubscribe();
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Migration & Rooms Listener
  useEffect(() => {
    if (user) {
      // 1. Migration from old structure to new structure
      const migrateData = async () => {
        try {
          const oldRoomsQuery = query(collection(db, "rooms"), where("userId", "==", user.uid));
          const oldSnapshot = await getDocs(oldRoomsQuery);
          
          if (!oldSnapshot.empty) {
            console.log(`Migrating ${oldSnapshot.size} rooms for user ${user.uid}`);
            for (const roomDoc of oldSnapshot.docs) {
              const roomData = roomDoc.data();
              const roomId = roomDoc.id;
              
              // Copy room to new location
              await setDoc(doc(db, "users", user.uid, "rooms", roomId), roomData);
              
              // Copy messages
              const oldMsgsSnapshot = await getDocs(collection(db, "rooms", roomId, "messages"));
              for (const msgDoc of oldMsgsSnapshot.docs) {
                await setDoc(doc(db, "users", user.uid, "rooms", roomId, "messages", msgDoc.id), msgDoc.data());
                // Delete old message
                try {
                  await deleteDoc(doc(db, "rooms", roomId, "messages", msgDoc.id));
                } catch (e) {
                  console.warn("Could not delete old message:", e);
                }
              }
              
              // Delete old room doc
              try {
                await deleteDoc(doc(db, "rooms", roomId));
              } catch (e) {
                console.warn("Could not delete old room:", e);
              }
            }
            console.log("Migration completed successfully");
          }
        } catch (error) {
          console.error("Migration error:", error);
        }
      };
      migrateData();

      // 2. Real-time listener for new structure
      const q = query(
        collection(db, "users", user.uid, "rooms"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
          setChatRooms(rooms);
        },
        (error) => {
          console.error("Rooms listener error:", error);
        }
      );
      return () => unsubscribe();
    }
  }, [user]);

  // Messages Listener
  useEffect(() => {
    if (user && activeRoomId) {
      const q = query(
        collection(db, "users", user.uid, "rooms", activeRoomId, "messages"),
        orderBy("timestamp", "asc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        setMessages(msgs);
      });
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [user, activeRoomId]);

  const recordLoginHistory = async (user: FirebaseUser, method: string) => {
    try {
      await addDoc(collection(db, "login_history"), {
        userId: user.uid,
        email: user.email,
        loginTime: serverTimestamp(),
        method: method,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error("Error recording login history:", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      let userCredential;
      if (authMode === "login") {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await recordLoginHistory(userCredential.user, "email");
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await recordLoginHistory(userCredential.user, "email_signup");
      }
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const favRef = doc(db, "users", user.uid, "favorites", appId);
    if (favorites.includes(appId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, { createdAt: serverTimestamp() });
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await recordLoginHistory(userCredential.user, "google");
      setShowAuthModal(false);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const createNewRoom = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const docRef = await addDoc(collection(db, "users", user.uid, "rooms"), {
      title: "새로운 상담",
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    setActiveRoomId(docRef.id);
    setIsSidebarOpen(false);
  };

  const renameRoom = async (roomId: string) => {
    if (!newRoomTitle.trim() || !user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
        title: newRoomTitle
      });
      setEditingRoomId(null);
    } catch (error) {
      console.error("Error renaming room:", error);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!window.confirm("정말로 이 상담을 삭제하시겠습니까?") || !user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "rooms", roomId));
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    let roomId = activeRoomId;
    if (!roomId) {
      // Create a room if none active
      const docRef = await addDoc(collection(db, "users", user.uid, "rooms"), {
        title: input.slice(0, 20) || "이미지 상담",
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      roomId = docRef.id;
      setActiveRoomId(roomId);
    }

    setIsLoading(true);
    const currentInput = input;
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);

    try {
      let imageUrl = "";
      if (currentImage) {
        const storageRef = ref(storage, `users/${user.uid}/rooms/${roomId}/${Date.now()}_${currentImage.name}`);
        await uploadBytes(storageRef, currentImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Save user message to Firestore
      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), {
        role: "user",
        text: currentInput,
        imageUrl: imageUrl,
        timestamp: serverTimestamp()
      });

      // Prepare Gemini Parts
      const parts: any[] = [];
      if (currentInput) parts.push({ text: currentInput });
      if (currentImage) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(currentImage);
        });
        parts.push({
          inlineData: {
            data: base64,
            mimeType: currentImage.type
          }
        });
      }

      // Get history for context
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await genAI.models.generateContent({
        model: selectedModel,
        contents: [...chatHistory, { role: "user", parts }],
        config: {
          systemInstruction: "당신은 스마트 농업 비서 'FarmNet'입니다. 농민들에게 작물 재배, 병해충 진단, 농산물 시세, 정부 지원 사업 등에 대해 친절하고 전문적으로 답변해 주세요. 한국어로 답변하세요.",
          tools: isSearchOn ? [{ googleSearch: {} }] : undefined
        }
      });

      const modelText = response.text || "답변을 생성할 수 없습니다.";
      
      // If it's the first message, generate a better title
      if (messages.length === 0) {
        try {
          const promptText = currentInput || "이미지 상담";
          let generatedTitle = promptText;
          
          if (currentInput) {
            const titleResponse = await genAI.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: `다음 질문에 대해 10자 이내의 아주 짧고 명확한 상담 제목을 하나만 생성해 주세요. 다른 설명 없이 제목만 출력하세요: "${currentInput}"`,
            });
            generatedTitle = titleResponse.text?.trim().replace(/["']/g, "") || currentInput.slice(0, 20);
          }
          
          await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
            title: generatedTitle
          });
        } catch (e) {
          console.error("Title generation error:", e);
        }
      }

      // Save model response to Firestore
      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), {
        role: "model",
        text: modelText,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error("AI Error:", error);
      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), {
        role: "model",
        text: "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        timestamp: serverTimestamp()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden relative">
      {/* Sidebar Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#121212] border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 flex items-center justify-between">
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2 text-[#4ade80] font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-[#4ade80] rounded-lg flex items-center justify-center text-black">
              AI
            </div>
            FarmNet
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
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
                setActiveView("chat");
                setActiveRoomId(null);
                setIsSidebarOpen(false);
              }} 
            />
            <SidebarItem 
              icon={<Globe size={20} />} 
              label="Farm App Store" 
              active={activeView === "appstore"}
              onClick={() => {
                setActiveView("appstore");
                setIsSidebarOpen(false);
              }} 
            />
            <SidebarItem 
              icon={<Wrench size={20} />} 
              label="도구" 
              active={activeView === "tools"}
              onClick={() => {
                setActiveView("tools");
                setIsSidebarOpen(false);
              }} 
            />
            <SidebarItem icon={<Gift size={20} />} label="혜택" onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={<Bookmark size={20} />} label="저장됨" onClick={() => setIsSidebarOpen(false)} />
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
            onClick={createNewRoom}
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
                  setActiveRoomId(room.id);
                  setIsSidebarOpen(false);
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
                          onKeyDown={(e) => e.key === "Enter" && renameRoom(room.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button onClick={(e) => { e.stopPropagation(); renameRoom(room.id); }} className="p-1 hover:text-[#4ade80]">
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
                              deleteRoom(room.id);
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
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs font-bold text-[#4ade80] hover:underline"
                >
                  로그인하기
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
            >
              <Menu size={20} />
            </button>
            <div 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1.5 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors max-w-[150px] md:max-w-none"
            >
              <MessageSquare size={16} className="text-zinc-500 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium truncate">
                {activeRoomId 
                  ? chatRooms.find(r => r.id === activeRoomId)?.title 
                  : activeView === "appstore" 
                    ? "Farm App Store" 
                    : activeView === "tools"
                      ? "도구"
                      : "FarmNet AI 상담"}
              </span>
              <ChevronDown size={14} className="text-zinc-500 flex-shrink-0" />
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
                onClick={() => setShowAuthModal(true)}
                className="bg-[#4ade80] text-black px-4 md:px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#3bc76d] transition-all flex items-center gap-2"
              >
                <User size={16} />
                <span className="hidden md:inline">로그인</span>
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeView === "appstore" || activeView === "tools" ? (
            <div className="max-w-4xl mx-auto py-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-[#4ade80]/10 text-[#4ade80] rounded-3xl">
                    {activeView === "appstore" ? <Globe size={40} /> : <Wrench size={40} />}
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-zinc-100 tracking-tight">
                      {activeView === "appstore" ? "Farm App Store" : "도구"}
                    </h2>
                    <p className="text-zinc-500 mt-1">농업인을 위한 스마트 {activeView === "appstore" ? "앱" : "도구"} 모음</p>
                  </div>
                </div>
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="text"
                    placeholder={`${activeView === "appstore" ? "필요한 앱" : "필요한 도구"}을 검색해보세요...`}
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-zinc-200 focus:outline-none focus:border-[#4ade80] transition-all"
                  />
                </div>
              </div>

              {isAppsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="animate-spin text-[#4ade80]" size={40} />
                  <p className="text-zinc-500">{activeView === "appstore" ? "앱" : "도구"} 목록을 불러오는 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(activeView === "appstore" ? apps : tools)
                    .filter(app => 
                      app.title.toLowerCase().includes(appSearchQuery.toLowerCase()) || 
                      app.desc.toLowerCase().includes(appSearchQuery.toLowerCase())
                    )
                    .map((app) => (
                      <AppStoreItem 
                        key={app.id}
                        icon={getIconComponent(app.iconType, app.color)} 
                        title={app.title} 
                        desc={app.desc}
                        isFavorite={favorites.includes(app.id)}
                        onToggleFavorite={(e) => toggleFavorite(e, app.id)}
                      />
                    ))
                  }
                  {(activeView === "appstore" ? apps : tools).filter(app => 
                    app.title.toLowerCase().includes(appSearchQuery.toLowerCase()) || 
                    app.desc.toLowerCase().includes(appSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <div className="text-zinc-600 mb-2">검색 결과가 없습니다.</div>
                      <div className="text-zinc-500 text-sm">다른 검색어를 입력해보세요.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : messages.length === 0 && !activeRoomId ? (
            <div className="min-h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto pb-40">
              <div className="flex items-center gap-3 text-[#4ade80] font-bold text-5xl mb-2">
                <div className="w-16 h-16 bg-[#4ade80] rounded-2xl flex items-center justify-center text-black">
                  AI
                </div>
                FarmNet
              </div>
              <p className="text-zinc-400 text-lg">농업의 미래를 함께하는 스마트 비서, FarmNet</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 w-full">
                <ToolItem 
                  icon={<Search className="text-orange-400" />} 
                  label="오늘의 농산물 시세" 
                  desc="전국 도매시장 경매 가격을 실시간으로 확인하세요."
                  onClick={() => setActiveView("tools")}
                />
                <ToolItem 
                  icon={<ImageIcon className="text-emerald-400" />} 
                  label="병해충 진단 갤러리" 
                  desc="AI가 분석한 병해충 사례와 대처법을 확인해보세요."
                  onClick={() => setActiveView("tools")}
                />
                <ToolItem 
                  icon={<Sparkles className="text-yellow-400" />} 
                  label="정부 지원 사업" 
                  desc="농업인을 위한 최신 보조금 및 지원 정책 정보"
                  onClick={() => setActiveView("tools")}
                />
                <ToolItem 
                  icon={<FileText className="text-blue-400" />} 
                  label="농업 기술 뉴스" 
                  desc="스마트팜, 신품종 등 최신 농업 기술 동향"
                  onClick={() => setActiveView("tools")}
                />
                <ToolItem 
                  icon={<Play className="text-red-400" />} 
                  label="농사 꿀팁 영상" 
                  desc="전문가들이 알려주는 작물별 재배 노하우 요약"
                  onClick={() => setActiveView("tools")}
                />
                <ToolItem 
                  icon={<PenTool className="text-teal-400" />} 
                  label="귀농/귀촌 가이드" 
                  desc="성공적인 농촌 정착을 위한 단계별 안내"
                  onClick={() => setActiveView("tools")}
                />
              </div>

              {favorites.length > 0 && (
                <div className="w-full max-w-4xl mt-16 text-left">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-zinc-200 flex items-center gap-2">
                      <Star size={20} className="text-yellow-400 fill-yellow-400" />
                      즐겨찾는 영농 도구
                    </h3>
                    <button 
                      onClick={() => setActiveView("appstore")}
                      className="text-sm text-[#4ade80] hover:underline"
                    >
                      전체보기
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {apps
                      .filter(app => favorites.includes(app.id))
                      .map(app => (
                        <div 
                          key={app.id}
                          onClick={() => setActiveView("appstore")}
                          className="bg-[#1e1e1e] border border-zinc-800 p-6 rounded-3xl flex flex-col items-center text-center gap-3 hover:border-zinc-600 transition-all cursor-pointer group"
                        >
                          <div className="w-14 h-14 bg-zinc-900/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-zinc-800">
                            {getIconComponent(app.iconType, app.color)}
                          </div>
                          <div className="text-sm font-bold text-zinc-200 truncate w-full">{app.title}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              <div className="w-full max-w-xl mt-12">
                <div className="grid grid-cols-2 gap-4">
                  <QuickAction icon={<TrendingUp className="text-orange-400" />} label="농산물 시세" />
                  <QuickAction icon={<Bug className="text-emerald-400" />} label="병해충 진단" />
                  <QuickAction icon={<CloudSun className="text-blue-400" />} label="날씨/영농정보" />
                  <QuickAction icon={<Building2 className="text-yellow-400" />} label="정부 지원사업" />
                </div>
              </div>

              {user && chatRooms.length > 0 && (
                <div className="w-full max-w-xl mt-16 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-zinc-200">최근 상담 내역</h3>
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="text-xs text-[#4ade80] hover:underline"
                    >
                      전체보기
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chatRooms.slice(0, 4).map((room) => (
                      <div 
                        key={room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className="bg-[#1e1e1e] border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-zinc-600 cursor-pointer transition-all group"
                      >
                        <div className="p-2 bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform text-[#4ade80]">
                          <MessageSquare size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-bold text-zinc-300 truncate">{room.title}</div>
                          <div className="text-[10px] text-zinc-500">
                            {new Date(room.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id || idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="Uploaded" 
                        className="max-w-sm rounded-2xl border border-zinc-800 shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className={`p-4 rounded-2xl shadow-lg ${
                      msg.role === "user" 
                        ? "bg-[#4ade80] text-black font-medium" 
                        : "bg-[#1e1e1e] border border-zinc-800 text-zinc-200"
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1e1e1e] border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-[#4ade80]" />
                    <span className="text-sm text-zinc-400">FarmNet이 생각 중입니다...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="max-w-3xl mx-auto bg-[#1a1a1a] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden focus-within:border-zinc-600 transition-all">
            <AnimatePresence>
              {imagePreview && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pt-4 flex items-center gap-4"
                >
                  <div className="relative">
                    <img src={imagePreview} className="w-20 h-20 object-cover rounded-xl border border-zinc-700" />
                    <button 
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="text-xs text-zinc-500">
                    <p className="font-bold text-zinc-300">{selectedImage?.name}</p>
                    <p>{(selectedImage?.size || 0) / 1024 > 1024 ? `${((selectedImage?.size || 0) / (1024 * 1024)).toFixed(2)} MB` : `${((selectedImage?.size || 0) / 1024).toFixed(2)} KB`}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 px-6 pt-4 pb-2 border-b border-zinc-800/50">
              <div className="flex bg-[#121212] p-1 rounded-xl gap-1">
                <button 
                  onClick={() => setSelectedModel("gemini-3-flash-preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedModel === "gemini-3-flash-preview" ? "bg-[#4ade80] text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Flash 2.0
                </button>
                <button 
                  onClick={() => setSelectedModel("gemini-3.1-pro-preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedModel === "gemini-3.1-pro-preview" ? "bg-[#4ade80] text-black" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Pro 1.5
                </button>
              </div>
              <div className="h-4 w-px bg-zinc-800" />
              <button 
                onClick={() => setIsSearchOn(!isSearchOn)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${isSearchOn ? "text-[#4ade80]" : "text-zinc-500"}`}
              >
                <Globe size={14} />
                실시간 검색 {isSearchOn ? "ON" : "OFF"}
              </button>
            </div>

            <div className="p-4 flex items-end gap-3">
              <div className="flex gap-2 mb-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Mic size={20} />
                </button>
              </div>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="작물 상태나 시세 등 궁금한 점을 물어보세요..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-200 placeholder-zinc-600 resize-none py-2 max-h-32 min-h-[44px]"
                rows={1}
              />

              <button 
                onClick={handleSendMessage}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className={`p-3 rounded-2xl transition-all ${ (input.trim() || selectedImage) && !isLoading ? "bg-[#4ade80] text-black shadow-lg shadow-[#4ade80]/20" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-8"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-[#4ade80] rounded-2xl flex items-center justify-center text-black text-3xl font-bold">
                  AI
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">FarmNet</h1>
                <p className="text-zinc-500">로그인하고 모든 기능을 이용해 보세요</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">이메일</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] outline-none transition-all"
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">비밀번호</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {authError && (
                  <div className="text-rose-500 text-xs font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    {authError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#4ade80] text-black font-bold py-4 rounded-xl hover:bg-[#3bc76d] transition-all shadow-lg shadow-[#4ade80]/20"
                >
                  {authMode === "login" ? "로그인" : "회원가입"}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#121212] px-2 text-zinc-500 font-bold tracking-widest">또는</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={async () => {
                    await handleGoogleLogin();
                    setShowAuthModal(false);
                  }}
                  className="w-full bg-[#1a1a1a] border border-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  구글로 계속하기
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="text-sm text-zinc-500 hover:text-[#4ade80] transition-colors"
                >
                  {authMode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getIconComponent(type: string, colorClass: string) {
  switch (type) {
    case "Search": return <Search className={colorClass} />;
    case "Image": return <ImageIcon className={colorClass} />;
    case "Sparkles": return <Sparkles className={colorClass} />;
    case "FileText": return <FileText className={colorClass} />;
    case "Play": return <Play className={colorClass} />;
    case "PenTool": return <PenTool className={colorClass} />;
    case "Gift": return <Gift className={colorClass} />;
    case "BookOpen": return <BookOpen className={colorClass} />;
    case "Edit2": return <Edit2 className={colorClass} />;
    case "Wrench": return <Wrench className={colorClass} />;
    default: return <LayoutGrid className={colorClass} />;
  }
}

function AppStoreItem({ icon, title, desc, isFavorite, onToggleFavorite }: { 
  icon: React.ReactNode; 
  title: string; 
  desc?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  key?: string;
}) {
  return (
    <div className="bg-[#1e1e1e] border border-zinc-800/50 p-6 rounded-2xl hover:border-zinc-700 transition-all cursor-pointer group relative flex flex-col items-start text-left gap-4">
      <button 
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors z-10"
      >
        <Star 
          size={16} 
          className={isFavorite ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"} 
        />
      </button>
      <div className="w-10 h-10 bg-zinc-900/80 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">{title}</h3>
        {desc && <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? "bg-[#4ade80]/10 text-[#4ade80]" : "text-zinc-500 hover:bg-[#1e1e1e] hover:text-zinc-300"}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function QuickCircle({ icon, label, color }: { icon: string, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] text-zinc-500 font-medium">{label}</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-[#1e1e1e] border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-zinc-600 cursor-pointer transition-all group">
      <div className="p-2 bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-sm font-bold text-zinc-300">{label}</span>
    </div>
  );
}

function ToolItem({ icon, label, desc, onClick }: { icon: React.ReactNode, label: string, desc: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#1e1e1e] border border-zinc-800/50 p-6 rounded-2xl flex flex-col items-start text-left gap-4 hover:border-zinc-700 transition-all cursor-pointer group"
    >
      <div className="w-10 h-10 bg-zinc-900/80 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="space-y-1">
        <div className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">{label}</div>
        <div className="text-xs text-zinc-500 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}



