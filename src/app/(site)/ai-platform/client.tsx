"use client";

import { useState } from "react";
import { AiHero } from "./components/ai-hero";
import { AiSidebar } from "./components/ai-sidebar";
import { AiGrid } from "./components/ai-grid";
import { AiApplyFab } from "./components/ai-apply-fab";

interface AiPlatformClientProps {
  initialTools: any[];
}

export function AiPlatformClient({ initialTools }: AiPlatformClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedTag, setSelectedTag] = useState("");

  // Client-side filtering logic
  const filteredTools = initialTools.filter(tool => {
    // 1. Filter by Category
    if (selectedCategory !== "全部" && tool.category !== selectedCategory) {
      return false;
    }

    // 2. Filter by Search (Name, Description, Tags)
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower) ||
        (tool.tags && tool.tags.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // 3. Filter by Tag
    if (selectedTag) {
      if (!tool.tags || !tool.tags.includes(selectedTag)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen text-zinc-100">
      <AiHero search={search} onSearchChange={setSearch} />
      
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <AiSidebar 
          selectedCategory={selectedCategory} 
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedTag(""); // Reset tag when category changes
          }}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
        
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100">
              {selectedCategory === "全部" ? "精选工具" : selectedCategory}
              <span className="ml-2 text-sm font-normal text-zinc-500">
                共 {filteredTools.length} 款
              </span>
            </h2>
            {/* Sort dropdown could go here */}
          </div>
          
          <AiGrid tools={filteredTools} />
        </div>
      </div>

      <AiApplyFab />
    </div>
  );
}
