"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types";

interface ProjectGalleryProps {
  images: GalleryImage[];
  layout?: string | null;
}

function BeforeAfterSlider({ before, after, index }: { before: string; after: string; index: number }) {
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const move = useCallback((clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setPct(p);
  }, []);

  return (
    <div
      ref={sliderRef}
      className="relative select-none overflow-hidden cursor-ew-resize"
      style={{ height: "80vh", maxHeight: "850px", background: "#221813" }}
      onMouseDown={(e) => { dragging.current = true; move(e.clientX); e.preventDefault(); }}
      onMouseMove={(e) => { if (dragging.current) move(e.clientX); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchStart={(e) => { dragging.current = true; move(e.touches[0].clientX); }}
      onTouchMove={(e) => { if (dragging.current) move(e.touches[0].clientX); }}
      onTouchEnd={() => { dragging.current = false; }}
    >
      {/* Before image */}
      <div className="absolute inset-0">
        <Image
          src={before}
          alt={`Before ${index + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
          style={{ pointerEvents: "none" }}
        />
        <span
          className="font-body"
          style={{ position: "absolute", bottom: "14px", left: "16px", fontSize: "9px", letterSpacing: "3px", fontWeight: 600, textTransform: "uppercase", color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.55)", pointerEvents: "none" }}
        >
          BEFORE
        </span>
      </div>

      {/* After image clipped */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}>
        <Image
          src={after}
          alt={`After ${index + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
          style={{ pointerEvents: "none" }}
        />
        <span
          className="font-body"
          style={{ position: "absolute", bottom: "14px", right: "16px", fontSize: "9px", letterSpacing: "3px", fontWeight: 600, textTransform: "uppercase", color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.55)", pointerEvents: "none" }}
        >
          AFTER
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 flex flex-col items-center z-10 pointer-events-none"
        style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
      >
        <div style={{ flex: 1, width: "2px", background: "rgba(255,255,255,0.75)" }} />
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fff", color: "#2a1a10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.35)" }}>
          ↔
        </div>
        <div style={{ flex: 1, width: "2px", background: "rgba(255,255,255,0.75)" }} />
      </div>
    </div>
  );
}

export function ProjectGallery({ images, layout }: ProjectGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % images.length,
    );
  }, [images.length]);

  if (images.length === 0) return null;

  if (layout === "before-after") {
    const pairs: [string, string][] = [];
    for (let i = 0; i + 1 < images.length; i += 2) {
      pairs.push([images[i].src, images[i + 1].src]);
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {pairs.map((pair, i) => (
          <BeforeAfterSlider key={i} before={pair[0]} after={pair[1]} index={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "260px",
          gridAutoFlow: "row dense",
          gap: "12px",
          width: "100%",
        }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group overflow-hidden cursor-pointer"
            style={{
              background: "#1b120e",
              gridColumn: img.orientation === "landscape" ? "span 2" : undefined,
              gridRow: img.orientation === "portrait" ? "span 2" : undefined,
              position: "relative",
            }}
          >
            <Image
              src={img.src}
              alt={`Gallery image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ display: "block" }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 p-4"
            onClick={closeLightbox}
          >
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex].src}
                alt={`Image ${lightboxIndex + 1}`}
                width={1400}
                height={900}
                className={cn(
                  "object-contain",
                  images[lightboxIndex].orientation === "portrait"
                    ? "max-h-[85vh] w-auto"
                    : "max-w-[85vw] h-auto",
                )}
              />
            </motion.div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-text-secondary hover:text-accent transition-colors"
                  aria-label="Previous image"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-text-secondary hover:text-accent transition-colors"
                  aria-label="Next image"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 p-3 text-text-secondary hover:text-accent transition-colors"
              aria-label="Close lightbox"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-body text-xs text-text-muted">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
