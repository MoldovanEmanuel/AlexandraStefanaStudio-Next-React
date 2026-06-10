"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HeroSlide } from "@/types";

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt="Alexandra Stefana Studio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content — right-aligned, vertically centered */}
      <div
        className="absolute z-10"
        style={{ textAlign: "right", width: "520px", right: "22%", top: "50%", transform: "translateY(-50%) translateY(10px)" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-display"
          style={{ fontSize: "clamp(22px, 3vw, 46px)", fontWeight: 600, letterSpacing: "6px", lineHeight: 1.25, color: "var(--text-muted)", textAlign: "right" }}
        >
          <span style={{ whiteSpace: "nowrap" }}>INTERIOR DESIGN &amp;</span>
          <br />
          <span>VISUALIZATION</span>
        </motion.h1>
      </div>

      {/* Bottom-left nav */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: "36px", left: "28px", zIndex: 2, display: "flex", gap: "10px" }}>
          <button
            onClick={prev}
            aria-label="Previous slide"
            style={{ width: "34px", height: "34px", border: "1px solid rgba(166,133,105,0.28)", color: "rgba(166,133,105,0.6)", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.3s ease, color 0.3s ease" }}
            className="hover:text-text-secondary"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            style={{ width: "34px", height: "34px", border: "1px solid rgba(166,133,105,0.28)", color: "rgba(166,133,105,0.6)", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.3s ease, color 0.3s ease" }}
            className="hover:text-text-secondary"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
