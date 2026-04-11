"use client";

import React from "react";
import { Share2, Twitter, Linkedin, Link2, Bookmark } from "lucide-react";

type ShareButtonsProps = {
  url?: string;
  title?: string;
  className?: string;
};

export function ShareButtons({ url, title, className = "" }: ShareButtonsProps) {
  const handleShare = (platform: string) => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={() => handleShare("copy")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
      <button
        onClick={() => handleShare("twitter")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleShare("linkedin")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleShare("copy")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm">
        <Bookmark className="w-4 h-4" />
      </button>
    </div>
  );
}
