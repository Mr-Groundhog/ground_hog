"use client";

import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { toggleInteraction } from "@/app/(site)/graph/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InteractionButtonsProps {
  postId: string;
  initialLiked: boolean;
  initialFavorited: boolean;
  currentUser: { id: string } | null;
}

export function InteractionButtons({
  postId,
  initialLiked,
  initialFavorited,
  currentUser,
}: InteractionButtonsProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleInteraction = async (type: "LIKE" | "FAVORITE") => {
    if (!currentUser) {
      toast.error("ACCESS DENIED: PLEASE LOGIN");
      return;
    }
    if (loading) return;

    const nextLiked = type === "LIKE" ? !liked : liked;
    const nextFavorited = type === "FAVORITE" ? !favorited : favorited;

    setLiked(nextLiked);
    setFavorited(nextFavorited);

    setLoading(true);
    try {
      await toggleInteraction(postId, type);
    } catch {
      setLiked(liked);
      setFavorited(favorited);
      toast.error("SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-zinc-300">
      <button
        onClick={() => handleInteraction("LIKE")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1 rounded-md py-2 font-medium transition-colors",
          liked
            ? "bg-cyan-500 text-black hover:bg-cyan-400"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white",
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-current")} />
        {liked ? "LIKED" : "LIKE"}
      </button>
      <button
        onClick={() => handleInteraction("FAVORITE")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1 rounded-md border py-2 font-medium transition-colors",
          favorited
            ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
            : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white",
        )}
      >
        <MessageCircle className="h-4 w-4" />
        {favorited ? "SAVED" : "SAVE"}
      </button>
    </div>
  );
}
