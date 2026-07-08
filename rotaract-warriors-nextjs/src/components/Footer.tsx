"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => setIsModalOpen(false);
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#f0f9ff] via-[#e6f4fe] to-[#d0ecfc] text-slate-700 border-t border-[#8B003A]/10 overflow-hidden select-none font-sans">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#8B003A]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Dotted World Map overlay pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(#8B003A 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 py-16 md:py-20 z-10">
        
        {/* 5-Column Grid Layout - Perfectly aligned items-start */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 items-start">
          
          {/* Column 1: Club Branding */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              {/* Custom High-Fidelity Rotaract Logo cogwheel */}
              <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <defs>
                  <path id="tooth-footer-rx" d="M46 12 L48 3 L52 3 L54 12 Z" fill="#8B003A" />
                  <rect id="spoke-footer-rx" x="48" y="20" width="4" height="12" fill="#8B003A" />
                </defs>
                <g>
                  <use href="#tooth-footer-rx" />
                  <use href="#tooth-footer-rx" transform="rotate(15 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(30 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(45 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(60 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(75 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(90 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(105 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(120 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(135 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(150 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(165 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(180 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(195 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(210 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(225 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(240 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(255 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(270 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(285 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(300 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(315 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(330 50 50)" />
                  <use href="#tooth-footer-rx" transform="rotate(345 50 50)" />
                </g>
                <circle cx="50" cy="50" r="39" fill="none" stroke="#8B003A" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="33.5" fill="none" stroke="#8B003A" strokeWidth="8.5" />
                <circle cx="50" cy="50" r="33.5" fill="none" stroke="white" strokeWidth="6.5" />
                <circle cx="50" cy="50" r="29" fill="none" stroke="#8B003A" strokeWidth="2.5" />
                <g>
                  <use href="#spoke-footer-rx" />
                  <use href="#spoke-footer-rx" transform="rotate(60 50 50)" />
                  <use href="#spoke-footer-rx" transform="rotate(120 50 50)" />
                  <use href="#spoke-footer-rx" transform="rotate(180 50 50)" />
                  <use href="#spoke-footer-rx" transform="rotate(240 50 50)" />
                  <use href="#spoke-footer-rx" transform="rotate(300 50 50)" />
                </g>
                <circle cx="50" cy="50" r="13" fill="#8B003A" />
                <circle cx="50" cy="50" r="7.5" fill="white" />
                <circle cx="50" cy="50" r="4.5" fill="#8B003A" />
                <rect x="48" y="41.5" width="4" height="4.5" fill="#8B003A" />
              </svg>
              <div className="text-left font-display">
                <h3 className="text-base font-extrabold tracking-wide text-slate-800 leading-none">Rotaract</h3>
                <p className="text-[10px] font-black text-slate-650 tracking-wider uppercase mt-1">Bangalore Warriors</p>
                <p className="text-[9px] font-bold text-[#8B003A] mt-0.5">RID 3192</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              We are a family of young changemakers, creating impact through service, leadership and fellowship.
            </p>
            
            {/* Elegant gold handwritten signature */}
            <span className="font-script text-2xl text-amber-600 tracking-wide mt-1 block" style={{ fontFamily: "'Dancing Script', cursive" }}>
              Service Above Self
            </span>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-start gap-4 w-full">
            <h4 className="text-xs font-black tracking-widest text-[#8B003A] uppercase border-l-2 border-[#8B003A] pl-3">
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-bold text-slate-600 w-full">
              {["Home", "About Us", "Warriors Council", "Projects", "Events", "Gallery", "Contact Us", "Become a Warrior", "Admin Portal", "RI Login"].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="hover:text-[#8B003A] transition-colors duration-200 relative group py-0.5 inline-block"
                  >
                    {link}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect With Us */}
          <div className="flex flex-col items-start gap-4 w-full">
            <h4 className="text-xs font-black tracking-widest text-[#8B003A] uppercase border-l-2 border-[#8B003A] pl-3">
              Connect With Us
            </h4>
            <ul className="flex flex-col gap-2 text-xs font-bold text-slate-600 w-full">
              {[
                { name: "Instagram", url: "https://www.instagram.com/racb_warriors/?hl=en", color: "hover:text-[#E1306C] hover:bg-[#E1306C]/10 hover:ring-[#E1306C]/30", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                { name: "LinkedIn", url: "https://www.linkedin.com/in/rotaract-club-of-bangalore-warriors-a89447318/", color: "hover:text-[#0077B5] hover:bg-[#0077B5]/10 hover:ring-[#0077B5]/30", icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
                { name: "YouTube", url: "https://www.youtube.com/@RotaractclubofBangaloreWarrior", color: "hover:text-[#FF0000] hover:bg-[#FF0000]/10 hover:ring-[#FF0000]/30", icon: "M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
                { name: "X (Twitter)", url: "https://x.com/_RCBW_", color: "hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 hover:ring-[#1A1A1A]/20", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { name: "Threads", url: "https://www.threads.com/@racb_warriors", color: "hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 hover:ring-[#1A1A1A]/20", icon: "M12.5 22c-5.5 0-10-4.5-10-10S7 2 12.5 2h.2c5.3 0 9.3 4.1 9.3 9.3 0 2.2-1 4.3-2.6 5.8-1.5 1.4-3.5 2.1-5.7 1.9-2.3-.2-4.2-1.3-5.2-3.1-1-1.7-.9-3.9.2-5.4 1.1-1.5 3-2.3 5.3-2.2 1.4 0 2.6.3 3.4.9.4.3.9.7 1.2 1.2V9.3h-1.5c-.3 0-.6.1-.8.3-.2.2-.3.5-.3.8s.1.6.3.8c.2.2.5.3.8.3h3.5c.3 0 .6-.1.8-.3.2-.2.3-.5.3-.8V10c-.1-4.7-3.9-8.5-8.8-8.5h-.2c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5h.3c1.7 0 3.3-.5 4.6-1.5.3-.2.4-.6.2-.9-.2-.3-.6-.4-.9-.2-1.1.8-2.4 1.2-3.8 1.2h-.1z" }
              ].map((social) => (
                <li key={social.name}>
                  <a 
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#8B003A]/10 bg-white/40 transition-all duration-300 ring-1 ring-transparent ${social.color} hover:scale-[1.01] group`}
                  >
                    <svg className="h-5 w-5 shrink-0 fill-current text-slate-500 group-hover:text-current" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                    <span>{social.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col items-start gap-4">
            <h4 className="text-xs font-black tracking-widest text-[#8B003A] uppercase border-l-2 border-[#8B003A] pl-3">
              Contact Us
            </h4>
            <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-500 leading-relaxed">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Email</span>
                <a href="mailto:racwarriors2023@gmail.com" className="text-slate-700 hover:text-[#8B003A] transition">
                  racwarriors2023@gmail.com
                </a>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">President</span>
                <p className="text-slate-800 font-bold">Rtr. Rishabh Gupta</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">President Contact</span>
                <p className="text-slate-800 font-bold">+91 88846 69102</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">WhatsApp</span>
                <a href="https://wa.me/918884669102" className="text-slate-800 hover:text-[#8B003A] transition font-bold">
                  +91 88846 69102
                </a>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Location</span>
                <p className="text-slate-755 font-bold">Bengaluru, Karnataka, India</p>
              </div>
            </div>
          </div>

          {/* Column 5: Large Decorative Artwork */}
          <div className="flex flex-col items-start lg:items-end justify-center w-full text-left lg:text-right relative min-h-[160px] overflow-hidden">
            {/* Transparent background rotating wheel */}
            <svg 
              className="absolute pointer-events-none opacity-[0.02] text-[#8B003A] -right-12 -bottom-12 w-48 h-48 animate-spin" 
              style={{ animationDuration: '60s' }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="6"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>

            {/* People holding hands outline SVG */}
            <svg className="h-9 w-auto text-[#8B003A]/10 mb-4 self-start lg:self-end" viewBox="0 0 120 40" fill="currentColor">
              <path d="M15,10 C17.2,10 19,8.2 19,6 C19,3.8 17.2,2 15,2 C12.8,2 11,3.8 11,6 C11,8.2 12.8,10 15,10 Z M15,12 C10,12 8,16 8,24 L8,38 L12,38 L12,28 L14,28 L14,38 L18,38 L18,28 L20,28 L20,38 L24,38 L24,24 C24,16 22,12 15,12 Z" />
              <path d="M45,10 C47.2,10 49,8.2 49,6 C49,3.8 47.2,2 45,2 C42.8,2 41,3.8 41,6 C41,8.2 42.8,10 45,10 Z M45,12 C40,12 38,16 38,24 L38,38 L42,38 L42,28 L44,28 L44,38 L48,38 L48,28 L50,28 L50,38 L54,38 L54,24 C54,16 52,12 45,12 Z" />
              <path d="M75,10 C77.2,10 79,8.2 79,6 C79,3.8 77.2,2 75,2 C72.8,2 71,3.8 71,6 C71,8.2 72.8,10 75,10 Z M75,12 C70,12 68,16 68,24 L68,38 L72,38 L72,28 L74,28 L74,38 L78,38 L78,28 L80,28 L80,38 L84,38 L84,24 C84,16 82,12 75,12 Z" />
              <path d="M105,10 C107.2,10 109,8.2 109,6 C109,3.8 107.2,2 105,2 C102.8,2 101,3.8 101,6 C101,8.2 102.8,10 105,10 Z M105,12 C100,12 98,16 98,24 L98,38 L102,38 L102,28 L104,28 L104,38 L108,38 L108,28 L110,28 L110,38 L114,38 L114,24 C114,16 112,12 105,12 Z" />
              <rect x="23" y="16" width="16" height="4" />
              <rect x="53" y="16" width="16" height="4" />
              <rect x="83" y="16" width="16" height="4" />
            </svg>
            
            <p className="text-sm font-medium text-slate-500">Together, we</p>
            <h3 
              className="font-script text-4xl font-extrabold text-amber-500 tracking-wide mt-1 animate-pulse" 
              style={{ fontFamily: "'Dancing Script', cursive", animationDuration: '4s' }}
            >
              Create Change
            </h3>
          </div>

        </div>

      </div>

      {/* Bottom Copyright Bar - slightly darker light blue strip */}
      <div className="relative border-t border-[#8B003A]/10 bg-[#bae6fd] py-6 z-10 font-sans text-xs">
        <div className="mx-auto max-w-[1400px] px-6 text-center text-slate-700 font-semibold flex items-center justify-center gap-1.5 flex-wrap">
          <span>© Copy Right 2026 All Rights Reserved. ❤️ Designed & Managed by</span>
          <a 
            href="#" 
            onClick={handleOpen}
            className="text-[#8B003A] font-black tracking-wide relative group py-0.5"
          >
            N LATHIESH
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
          </a>
        </div>
      </div>

      {/* Portfolio Popup Glassmorphic Modal Card */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            {/* Modal backdrop with blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Glassmorphic Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[500px] bg-[#f0f9ff] border border-[#8B003A]/20 rounded-[24px] shadow-[0_20px_50px_rgba(139,0,58,0.1)] overflow-hidden backdrop-blur-2xl p-6 sm:p-7 text-slate-800 z-10 flex flex-col gap-6"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#8B003A]/5 border border-[#8B003A]/10 text-slate-600 hover:bg-[#8B003A]/15 hover:text-[#8B003A] transition duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              {/* Developer Info Profile Row */}
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-[#8B003A]/20 shadow bg-white shrink-0">
                  <img 
                    src="/assets/img/lathiesh_profile.png" 
                    alt="N Lathiesh Profile" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div class="flex-1">
                  <h3 className="text-lg font-black tracking-wide text-slate-900 font-display">N LATHIESH</h3>
                  <p className="text-[10px] font-black text-[#8B003A] tracking-wider uppercase mt-0.5">
                    Aerospace Engineer • UI/UX Designer • SCM Analyst • Full Stack Developer
                  </p>
                </div>
              </div>

              {/* Developer Short Bio */}
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Building premium digital experiences for startups, NGOs, brands and organizations through modern web design, creative branding, App development and scalable applications.
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-2 bg-[#8B003A]/5 border border-[#8B003A]/5 rounded-2xl p-3 text-center">
                <div>
                  <h4 className="text-sm font-black text-[#8B003A] font-display">10+</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Projects</p>
                </div>
                <div>
                  <h4 class="text-sm font-black text-[#8B003A] font-display">3+</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Experience</p>
                </div>
                <div>
                  <h4 class="text-sm font-black text-[#8B003A] font-display">5+</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Clients</p>
                </div>
                <div>
                  <h4 class="text-sm font-black text-[#8B003A] font-display">100%</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Creativity</p>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href="https://wa.me/918197176867"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[11px] font-black shadow-md transition duration-200"
                >
                  💬 WhatsApp
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#8B003A]/10 hover:bg-[#8B003A]/20 border border-[#8B003A]/10 text-[#8B003A] text-[11px] font-black transition duration-200"
                >
                  📄 Resume
                </a>
                <a
                  href="mailto:connectlathiesh@gmail.com"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#8B003A] hover:bg-[#6e002e] text-white text-[11px] font-black shadow-md transition duration-200"
                >
                  📧 Contact
                </a>
              </div>

              {/* Social Icons row */}
              <div className="flex items-center justify-center gap-4 border-t border-[#8B003A]/10 pt-4.5">
                {[
                  { name: "LinkedIn", url: "https://www.linkedin.com/in/n-lathiesh-817836223/", icon: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
                  { name: "GitHub", url: "#", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
                  { name: "Instagram", url: "https://www.instagram.com/princelathiesh/?hl=en", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                  { name: "Behance", url: "#", icon: "M22 10.3h-4v.8h4v-.8zm-.3 1.9c-.3-.2-.7-.3-1.2-.3-.5 0-.9.2-1.2.5-.3.3-.4.8-.4 1.4h3.2c0-.5-.1-.9-.2-1.2-.1-.2-.2-.3-.4-.4zm1.9 1.7c0-.9-.3-1.6-.8-2.1-.6-.6-1.4-.9-2.4-.9-1 0-1.8.3-2.4.9-.6.6-1 1.4-1 2.5 0 1 .3 1.8.9 2.4.6.6 1.4.9 2.5.9 1.1 0 1.9-.3 2.5-.9.4-.4.7-.9.8-1.5h-1.8c-.1.3-.3.5-.5.7-.3.2-.6.3-1 .3-.5 0-.9-.2-1.1-.5-.2-.3-.3-.7-.3-1.2h6.5v-.6zm-12.1-4c.4.3.5.8.5 1.3 0 .4-.1.7-.3.9-.2.2-.5.4-.9.5.6.1 1 .3 1.3.7.3.3.4.8.4 1.4 0 .8-.3 1.4-.9 1.8-.6.4-1.5.6-2.7.6H3.6V8.6h5c1.1.1 1.9.3 2.3.7l.1.2zm-2.7 2.1c.3 0 .5-.1.6-.2.1-.1.2-.3.2-.6 0-.3-.1-.5-.2-.6-.1-.1-.3-.2-.6-.2H5.6v1.6h2.9zm.2 3.6c.3 0 .6-.1.7-.3.1-.2.2-.4.2-.7 0-.3-.1-.5-.2-.7-.1-.2-.4-.3-.7-.3H5.6v2h3.1z" }
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-[#8B003A] transition duration-200 fill-current"
                    aria-label={s.name}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d={s.icon} />
                    </svg>
                  </a>
                ))}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
}
