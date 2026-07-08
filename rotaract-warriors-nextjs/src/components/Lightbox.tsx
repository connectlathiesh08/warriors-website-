"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryItem } from "@/lib/firebase";

interface LightboxProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ item, items, onClose, onNext, onPrev }: LightboxProps) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Lock scroll

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // Restore scroll
    };
  }, [item, onClose, onNext, onPrev]);

  if (!item) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = item.image;
    link.download = `${item.title.replace(/\s+/g, "_")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md select-none font-sans"
      >
        {/* Top Control Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-white z-50">
          <div className="text-left">
            <span className="text-[10px] font-extrabold uppercase bg-burgundy-500 text-white px-2.5 py-1 rounded-md tracking-wider shadow-sm">
              {item.category}
            </span>
            <p className="text-xs text-slate-400 mt-1.5 font-mono">{item.date}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Toggle */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setZoom(!zoom); }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition ring-1 ring-white/15"
              aria-label="Toggle zoom"
            >
              {zoom ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5M15 9h4.5M15 9l6-6M9 15v4.5M9 15H4.5M9 15l-6 6m12-6v4.5M15 15h4.5M15 15l6 6" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                </svg>
              )}
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition ring-1 ring-white/15"
              aria-label="Download image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition ring-1 ring-white/15"
              aria-label="Close Lightbox"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition duration-200 z-50 ring-1 ring-white/20"
          aria-label="Previous image"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition duration-200 z-50 ring-1 ring-white/20"
          aria-label="Next image"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Content Area */}
        <div className="flex flex-col items-center justify-center max-w-[85vw] max-h-[75vh] mt-10">
          <motion.img
            key={item.id}
            src={item.image}
            alt={item.title}
            className={`rounded-2xl object-contain shadow-2xl transition-all duration-300 ${
              zoom ? "max-h-[90vh] max-w-[90vw] scale-105" : "max-h-[68vh] max-w-full"
            }`}
            onClick={(e) => e.stopPropagation()}
            layoutId={`globe-card-${item.id}`}
          />
          <div className="mt-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg md:text-xl font-bold text-white tracking-wide font-display">{item.title}</h4>
            {item.event && <p className="text-sm font-semibold text-[#8B003A] mt-1.5">{item.event}</p>}
            {item.description && (
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">{item.description}</p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
