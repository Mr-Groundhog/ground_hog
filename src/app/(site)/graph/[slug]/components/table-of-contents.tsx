"use client";

import { useState, useEffect } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    extractHeadings();

    // 设置观察者监听 DOM 变化
    const article = document.getElementById("article-content");
    if (!article) return;

    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    observer.observe(article, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  function extractHeadings() {
    const article = document.getElementById("article-content");
    if (!article) return;

    const headingElements = article.querySelectorAll("h1, h2, h3");
    const extracted: Heading[] = [];

    headingElements.forEach((el) => {
      if (el.id) {
        extracted.push({
          id: el.id,
          text: el.textContent || "",
          level: parseInt(el.tagName.charAt(1)),
        });
      }
    });

    setHeadings(extracted);
  }

  if (headings.length === 0) {
    return (
      <p className="text-zinc-500">暂无可提取的标题</p>
    );
  }

  return (
    <div className="space-y-2 text-xs text-zinc-400 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={`block cursor-pointer rounded px-2 py-1 hover:bg-zinc-900 hover:text-cyan-300 transition-colors ${
            heading.level === 1 ? "font-semibold text-zinc-200" : ""
          } ${heading.level === 3 ? "pl-4 text-zinc-500" : ""}`}
        >
          {heading.text}
        </a>
      ))}
    </div>
  );
}