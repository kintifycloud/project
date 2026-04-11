"use client";

import React from "react";

type TableOfContentsProps = {
  items: Array<{
    id: string;
    title: string;
    level: number;
  }>;
  activeSection: string;
};

export function TableOfContents({ items, activeSection }: TableOfContentsProps) {
  return (
    <div className="bg-[#111117] rounded-xl border border-white/10 p-4 sticky top-24">
      <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-400">
        Contents
      </h4>
      <nav className="space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block text-sm py-1 transition-colors ${
              activeSection === item.id
                ? "text-indigo-400 font-medium"
                : "text-gray-400 hover:text-white"
            }`}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
