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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

// Components
import EducationPage from "./EducationPage";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatInput } from "./components/ChatInput";
import { AuthModal } from "./components/AuthModal";
import { StoreView } from "./components/StoreView";
import { HomeDashboard } from "./components/HomeDashboard";
import { ChatView } from "./components/ChatView";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useChatRooms } from "./hooks/useChatRooms";
import { useMessages } from "./hooks/useMessages";
import { useFavorites } from "./hooks/useFavorites";
import { useStoreData } from "./hooks/useStoreData";
import { useEducationCourses } from "./hooks/useEducationCourses";

// Services
import { generateAIResponse, generateRoomTitle } from "./services/aiService";

// Types
import { ViewType } from "./types";

export default function App() {
  const { user, isAuthLoading, handleEmailAuth, handleGoogleLogin } = useAuth();
  const {
    chatRooms,
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("chat");

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [isSearchOn, setIsSearchOn] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
    if ((!input.trim() && !selectedImage) || isLoading) return;

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

      await addDoc(collection(db, "users", user.uid, "rooms", roomId, "messages"), {
        role: "user",
        text: currentInput,
        imageUrl: imageUrl,
        timestamp: serverTimestamp()
      });

      const modelText = await generateAIResponse(
        messages,
        currentInput,
        currentImage,
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
        isAuthLoading={isAuthLoading}
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
          onRoomSelect={(roomId) => setActiveRoomId(roomId)}
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeView === "education" ? (
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
              user={user}
              onViewChange={setActiveView}
              onRoomSelect={setActiveRoomId}
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

        <ChatInput
          input={input}
          setInput={setInput}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isSearchOn={isSearchOn}
          setIsSearchOn={setIsSearchOn}
          selectedImage={selectedImage}
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
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
