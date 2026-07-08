"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchPublishedImages, onImagesUpdate, GalleryItem } from "@/lib/firebase";
import MemoryGlobe from "@/components/MemoryGlobe";
import Lightbox from "@/components/Lightbox";
import Footer from "@/components/Footer";

export default function Home() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  // Subscribe to realtime updates from Firestore (falls back to mock data)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onImagesUpdate((newItems) => {
      setItems(newItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    if (!activeItem) return;
    const currentIndex = items.findIndex((i) => i.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setActiveItem(items[nextIndex] || null);
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const currentIndex = items.findIndex((i) => i.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setActiveItem(items[prevIndex] || null);
  };

  return (
    <>
      <main className="relative min-h-[90vh] w-full overflow-hidden flex flex-col justify-between pt-16 pb-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-[#fafbfc] to-[#f4eef1]">
        
        {/* Header Info Section */}
        <div className="mx-auto max-w-[800px] text-center relative z-10 flex flex-col items-center">
          {/* Top Tagline */}
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm font-black tracking-widest text-burgundy-500 uppercase font-sans mb-3 block"
          >
            Our Memories
          </motion.span>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[32px] sm:text-[44px] md:text-[54px] font-black text-slate-800 leading-tight font-display tracking-tight"
          >
            Echoes of the <span className="text-burgundy-500">Warriors</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 max-w-2xl text-[14px] sm:text-[16px] leading-relaxed text-slate-500 font-medium"
          >
            Relive our journey through every project, celebration, and moment of service. 
            Our memory globe rotates automatically, bringing our stories to life. Drag to explore, 
            or click any image to view it in full size.
          </motion.p>
        </div>

        {/* Main interactive 3D Globe area */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-[1200px] mx-auto z-10 my-4">
          {loading ? (
            /* Premium Shimmer Skeleton Loading State */
            <div className="w-full max-w-[500px] aspect-square rounded-full flex items-center justify-center p-8 bg-white/40 border border-white/50 shadow-premium backdrop-blur-sm animate-pulse">
              <div className="w-full h-full rounded-full border-4 border-dashed border-burgundy-500/10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-burgundy-500/10 animate-bounce" />
                <p className="text-xs font-bold text-slate-400 tracking-wider">LOADING MEMORY GLOBE...</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <MemoryGlobe items={items} onItemClick={(item) => setActiveItem(item)} />
            </motion.div>
          )}
        </div>

        {/* Dynamic Interaction Helper Tag */}
        <div className="relative z-10 mx-auto -mt-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/90 border border-white/60 shadow-lg text-[13px] font-bold text-slate-600 backdrop-blur-md"
          >
            {/* Circular Grab Hand Icon */}
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-burgundy-500/10 text-burgundy-500">
              <svg className="h-3 w-3 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </span>
            Drag to rotate the globe
          </motion.div>
        </div>

        {/* Lightbox Modal display */}
        <Lightbox
          item={activeItem}
          items={items}
          onClose={() => setActiveItem(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />

        {/* Premium Bottom Decorative Wave Gradients */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[180px] pointer-events-none select-none overflow-hidden z-0">
          {/* Layer 1 (Burgundy accent wave) */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[120px] animate-wave-1 opacity-70"
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 80C120 40 360 40 600 90C840 140 1080 160 1320 120C1360 110 1400 100 1440 90V200H0V80Z"
              fill="url(#wave-grad-1)"
            />
            <defs>
              <linearGradient id="wave-grad-1" x1="720" y1="50" x2="720" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B003A" stopOpacity="0.4" />
                <stop offset="1" stopColor="#5c0022" />
              </linearGradient>
            </defs>
          </svg>

          {/* Layer 2 (Lighter maroon main wave) */}
          <svg
            className="absolute bottom-0 left-0 w-full h-[140px] animate-wave-2 opacity-85"
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120C180 80 420 160 660 140C900 120 1140 40 1320 60C1360 65 1400 70 1440 80V200H0V120Z"
              fill="url(#wave-grad-2)"
            />
            <defs>
              <linearGradient id="wave-grad-2" x1="720" y1="20" x2="720" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B003A" />
                <stop offset="1" stopColor="#3d0016" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </main>
      <Footer />
    </>
  );
}
