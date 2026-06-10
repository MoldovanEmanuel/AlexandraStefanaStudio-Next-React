"use client";

import Image from "next/image";
import { useState } from "react";
import type { Render } from "@/types";

interface RenderCardProps {
  render: Render;
}

export function RenderCard({ render }: RenderCardProps) {
  const [playing, setPlaying] = useState(false);

  if (render.coverImage && !playing) {
    return (
      <div className="flex flex-col gap-4">
        <button
          className="relative block overflow-hidden cursor-pointer"
          style={{ background: "#0f0b09" }}
          onClick={() => setPlaying(true)}
          aria-label={`Play ${render.title}`}
        >
          <Image
            src={render.coverImage}
            alt={render.title}
            width={800}
            height={1067}
            className="w-full object-cover"
            style={{ aspectRatio: "3/4", transition: "transform 0.4s ease" }}
            loading="lazy"
          />
          <div
            className="absolute inset-0 flex items-center justify-center transition-colors duration-300"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            <svg width="64" height="64" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>
              <circle cx="30" cy="30" r="29" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.45)"/>
              <polygon points="23,16 23,44 47,30" fill="white"/>
            </svg>
          </div>
        </button>
        <p className="font-body text-xs uppercase tracking-widest text-text-primary font-semibold">
          {render.title}
        </p>
      </div>
    );
  }

  // No cover image — show a dark placeholder with play button; clicking starts the video
  if (!playing) {
    return (
      <div className="flex flex-col gap-4">
        <button
          className="relative block overflow-hidden cursor-pointer w-full"
          style={{ aspectRatio: "16/9", background: "#0f0b09" }}
          onClick={() => setPlaying(true)}
          aria-label={`Play ${render.title}`}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <svg width="64" height="64" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>
              <circle cx="30" cy="30" r="29" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.45)"/>
              <polygon points="23,16 23,44 47,30" fill="white"/>
            </svg>
          </div>
        </button>
        <p className="font-body text-xs uppercase tracking-widest text-text-primary font-semibold">
          {render.title}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <video
        className="w-full"
        controls
        autoPlay
        preload="auto"
        src={render.videoPath}
        style={{ aspectRatio: "16/9", background: "#0f0b09" }}
        aria-label={render.title}
      />
      <p className="font-body text-xs uppercase tracking-widest text-text-primary font-semibold">
        {render.title}
      </p>
    </div>
  );
}
