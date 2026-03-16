/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Components
import EducationPage from "./EducationPage";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatInput } from "./components/ChatInput";
import { AuthModal } from "./components/AuthModal";
import { StoreView } from "./components/StoreView";
import { HomeDashboard } from "./components/HomeDashboard";
import { ChatView } from "./components/ChatView";
import { InterviewView } from "./components/InterviewView";
import MyFarmDashboard from "./components/myfarm/MyFarmDashboard";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useChatRooms } from "./hooks/useChatRooms";
import { useMessages } from "./hooks/useMessages";
import { useFavorites } from "./hooks/useFavorites";
import { useStoreData } from "./hooks/useStoreData";
import { useEducationCourses } from "./hooks/useEducationCourses";

// Services
import { generateAIResponse, generateRoomTitle } from "./services/aiService";
import { uploadFileToStorage, isImageFile, validateFile } from "./services/storageService";

// Types
import { ViewType, FileAttachment, StoreApp, InterviewSessionDoc } from "./types";

// Hooks
import { useInterview } from "./hooks/useInterview";
import { useInterviewSessions } from "./hooks/useInterviewSessions";

export default function App() {
  const { user, isAuthLoading, handleEmailAuth, handleGoogleLogin } = useAuth();
  const {
    chatRooms,
    isChatRoomsLoading,
    activeRoomId,
    setActiveRoomId,
    editingRoomId,
    setEditingRoomId,
    newRoomTitle,
    setNewRoomTitle,
    createNewRoom,
    renameRoom,
    deleteRoom
  } = useChatRooms(user);
  const messages = useMessages(user, activeRoomId);
  const { favorites, toggleFavorite } = useFavorites(user);
  const { farmAppsStore, farmToolsStore, isAppsLoading, isToolsLoading } = useStoreData();
  const { courses } = useEducationCourses();
  const {
    sessions: interviewSessions,
    createSession,
    updateSessionTitle,
    updateSessionStep,
    completeSession,
    saveMessages,
    renameSession,
    deleteSession,
    loadSessionMessages,
  } = useInterviewSessions(user);

  const { session: interviewSession, isLoading: interviewLoading, saveStatus, startInterview, sendMessage: sendInterviewMessage, resetInterview, resumeSession } = useInterview(
    user,
    createSession,
    updateSessionStep,
    updateSessionTitle,
    completeSession,
    saveMessages
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("chat");

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-flash-latest");
  const [isSearchOn, setIsSearchOn] = useState(false);

  const [attachment, setAttachment] = useState<FileAttachment | null>(null);

  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [toolsSearchQuery, setToolsSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      setActiveRoomId(null);
    }
  }, [user, setActiveRoomId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      const isImage = isImageFile(file);
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachment({
            file,
            preview: e.target?.result as string,
            isImage: true,
          });
        };
        reader.readAsDataURL(file);
      } else {
        setAttachment({
          file,
          preview: null,
          isImage: false,
        });
      }
    }
  };

  const handleFileDrop = (file: File) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    const isImage = isImageFile(file);
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachment({
          file,
          preview: e.target?.result as string,
          isImage: true,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment({
        file,
        preview: null,
        isImage: false,
      });
    }
  };

  const handleFileRemove = () => {
    setAttachment(null);
  };

  const handleAppClick = (app: StoreApp) => {
    if (app.appType === "interview") {
      resetInterview();
      setActiveView("interview");
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await toggleFavorite(appId);
  };

  const handleNewRoom = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await createNewRoom();
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    let roomId = activeRoomId;
    if (!roomId) {
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
    const currentAttachment = attachment;
    setInput("");
    setAttachment(null);

    try {
      let fileData: { url: string; name: string; size: number; type: string } | null = null;
      if (currentAttachment) {
        fileData = await uploadFileToStorage(user.uid, roomId, currentAttachment.file);
      }

      const messageData: Record<string, any> = {
        role: "user",
        text: currentInput,
        timestamp: serverTimestamp(),
      };

      if (fileData) {
        if (fileData.type.startsWith("image/")) {
          messageData.imageUrl = fileData.url;
        }
        messageData.fileUrl = fileData.url;
        messageData.fileName = fileData.name;
        messageData.fileSize = fileData.size;
        messageData.fileType = fileData.type;
      }

      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), messageData);

      const modelText = await generateAIResponse(
        messages,
        currentInput,
        currentAttachment?.isImage ? currentAttachment.file : null,
        selectedModel,
        isSearchOn
      );

      if (messages.length === 0 && currentInput) {
        const generatedTitle = await generateRoomTitle(currentInput);
        await updateDoc(doc(db, "users", user.uid, "rooms", roomId), {
          title: generatedTitle
        });
      }

      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), {
        role: "model",
        text: modelText,
        timestamp: serverTimestamp()
      });

    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), {
        role: "model",
        text: `${errorMessage} 잠시 후 다시 시도해 주세요.`,
        timestamp: serverTimestamp()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-300 font-sans overflow-hidden relative">
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

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          if (view === "chat") setActiveRoomId(null);
        }}
        onNewRoom={handleNewRoom}
        chatRooms={chatRooms}
        activeRoomId={activeRoomId}
        onRoomSelect={(roomId) => setActiveRoomId(roomId)}
        onRoomDelete={deleteRoom}
        editingRoomId={editingRoomId}
        setEditingRoomId={setEditingRoomId}
        newRoomTitle={newRoomTitle}
        setNewRoomTitle={setNewRoomTitle}
        onRoomRename={renameRoom}
        user={user}
        isAuthLoading={isAuthLoading || isChatRoomsLoading}
        onShowAuth={() => setShowAuthModal(true)}
      />

      <main className="flex-1 flex flex-col relative">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          activeView={activeView}
          activeRoomId={activeRoomId}
          chatRooms={chatRooms}
          user={user}
          isAuthLoading={isAuthLoading}
          onShowAuth={() => setShowAuthModal(true)}
          onRoomSelect={(roomId) => {
            setActiveRoomId(roomId);
            setActiveView("chat");
          }}
        />

        <div className={`flex-1 ${(activeView === "interview" || activeView === "myfarm") ? "overflow-hidden" : "overflow-y-auto p-6 space-y-8"}`}>
          {activeView === "interview" ? (
            <InterviewView
              session={interviewSession}
              isLoading={interviewLoading}
              saveStatus={saveStatus}
              onSendMessage={sendInterviewMessage}
              onReset={() => {
                resetInterview();
                setActiveView("appstore");
              }}
              sessions={interviewSessions}
              onNewInterview={() => startInterview("sowi")}
              onResumeSession={async (s: InterviewSessionDoc) => {
                const msgs = await loadSessionMessages(s.id);
                resumeSession(s, msgs);
              }}
              onRenameSession={renameSession}
              onDeleteSession={deleteSession}
              isLoggedIn={!!user}
              onBackToList={() => setActiveView("appstore")}
            />
          ) : activeView === "myfarm" ? (
            <MyFarmDashboard 
              onMenuClick={() => setIsSidebarOpen(true)} 
              user={user} 
            />
          ) : activeView === "education" ? (
            <EducationPage />
          ) : activeView === "appstore" ? (
            <StoreView
              viewType="appstore"
              apps={farmAppsStore}
              searchQuery={appSearchQuery}
              setSearchQuery={setAppSearchQuery}
              isLoading={isAppsLoading}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onAppClick={handleAppClick}
            />
          ) : activeView === "tools" ? (
            <StoreView
              viewType="tools"
              apps={farmToolsStore}
              searchQuery={toolsSearchQuery}
              setSearchQuery={setToolsSearchQuery}
              isLoading={isToolsLoading}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : messages.length === 0 && !activeRoomId ? (
            <HomeDashboard
              farmAppsStore={farmAppsStore}
              farmToolsStore={farmToolsStore}
              courses={courses}
              favorites={favorites}
              chatRooms={chatRooms}
              isChatRoomsLoading={isChatRoomsLoading}
              user={user}
              onViewChange={setActiveView}
              onRoomSelect={(roomId) => {
                setActiveRoomId(roomId);
                setActiveView("chat");
              }}
              onSidebarOpen={() => setIsSidebarOpen(true)}
            />
          ) : (
            <ChatView
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {activeView !== "interview" && activeView !== "myfarm" && (
          <ChatInput
            input={input}
            setInput={setInput}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isSearchOn={isSearchOn}
            setIsSearchOn={setIsSearchOn}
            attachment={attachment}
            onFileSelect={handleFileSelect}
            onFileDrop={handleFileDrop}
            onFileRemove={handleFileRemove}
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        )}
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onEmailAuth={async (email, password, mode) => { await handleEmailAuth(email, password, mode); }}
            onGoogleLogin={async () => { await handleGoogleLogin(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
