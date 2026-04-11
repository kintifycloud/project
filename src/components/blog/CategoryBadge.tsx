"use client";

import React from "react";

type CategoryBadgeProps = {
  category: string;
  className?: string;
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 text-sm font-medium text-indigo-300 ${className}`}
    >
      {category}
    </span>
  );
}
