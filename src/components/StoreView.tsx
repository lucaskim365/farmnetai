import React from "react";
import { Search, Globe, Wrench, Loader2 } from "lucide-react";
import { StoreApp } from "../types";
import { AppStoreItem } from "./AppStoreItem";
import { getIconComponent } from "../utils/iconMapper";

interface StoreViewProps {
  viewType: "appstore" | "tools";
  apps: StoreApp[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, appId: string) => void;
  onAppClick?: (app: StoreApp) => void;
}

export function StoreView({
  viewType,
  apps,
  searchQuery,
  setSearchQuery,
  isLoading,
  favorites,
  onToggleFavorite,
  onAppClick,
}: StoreViewProps) {
  const title = viewType === "appstore" ? "Farm App Store" : "Farm Tools Store";
  const subtitle = `농업인을 위한 스마트 ${viewType === "appstore" ? "앱" : "도구"} 모음`;
  const placeholder = `${viewType === "appstore" ? "필요한 앱" : "필요한 도구"}을 검색해보세요...`;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4ade80]/10 text-[#4ade80] rounded-3xl">
            {viewType === "appstore" ? <Globe size={40} /> : <Wrench size={40} />}
          </div>
          <div>
            <h2 className="text-4xl font-bold text-zinc-100 tracking-tight">{title}</h2>
            <p className="text-zinc-500 mt-1">{subtitle}</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-zinc-200 focus:outline-none focus:border-[#4ade80] transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-[#4ade80]" size={40} />
          <p className="text-zinc-500">{viewType === "appstore" ? "앱" : "도구"} 목록을 불러오는 중...</p>
        </div>
      ) : (
        <>
          {viewType === "tools" && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-zinc-200 mb-6">농업 전문 도구</h3>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apps
              .filter(app =>
                app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.desc.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((app) => (
                <React.Fragment key={app.id}>
                  <AppStoreItem
                    icon={getIconComponent(app.iconType, app.color)}
                    title={app.title}
                    desc={app.desc}
                    isFavorite={favorites.includes(app.id)}
                    onToggleFavorite={(e) => onToggleFavorite(e, app.id)}
                    onClick={() => onAppClick?.(app)}
                  />
                </React.Fragment>
              ))
            }
          </div>
        </>
      )}
    </div>
  );
}
