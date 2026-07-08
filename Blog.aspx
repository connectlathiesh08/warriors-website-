<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/x-icon" href="assets/favicon/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png" />
  <title>Blog & Stories | Rotaract Bangalore Warriors</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Caveat:wght@600;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="js/tailwind-config.js?v=11"></script>
  <link rel="stylesheet" href="css/site.css?v=14" />
  <style>
    .site-header {
      height: 90px;
      background-color: #ffffff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .site-header.scrolled {
      height: 75px;
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px) saturate(190%);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid #e2e8f0;
    }
    .font-display {
      font-family: 'Poppins', sans-serif;
    }
    /* Simulated top bar hide rule to match mockup */
    .contact-phone, .contact-email, .year-select {
      display: none !important;
    }
    .card-zoom:hover img {
      transform: scale(1.04);
    }
    /* Custom video overlay hover transition */
    .play-overlay {
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .blog-card:hover .play-overlay {
      opacity: 1;
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var header = document.querySelector('.site-header');
      window.addEventListener('scroll', function() {
        if (window.scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });

    });
  </script>
</head>
<body class="flex min-h-screen flex-col bg-white">

  <!-- ============================ HEADER / TOP NAV ============================ -->
  <header class="site-header sticky top-0 z-[1000] w-full shrink-0 flex items-center border-b border-transparent">
    <div class="relative flex h-full w-full items-center justify-between px-10">
      
      <!-- Left Logo Branding -->
      <a href="index.html" class="relative z-[2] flex h-full shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]">
        <!-- Custom Rotaract Logo cogwheel -->
        <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <defs>
            <path id="tooth" d="M46 12 L48 3 L52 3 L54 12 Z" fill="#8B003A" />
            <rect id="spoke" x="48" y="20" width="4" height="12" fill="#8B003A" />
          </defs>
          <g>
            <use href="#tooth" />
            <use href="#tooth" transform="rotate(15 50 50)" />
            <use href="#tooth" transform="rotate(30 50 50)" />
            <use href="#tooth" transform="rotate(45 50 50)" />
            <use href="#tooth" transform="rotate(60 50 50)" />
            <use href="#tooth" transform="rotate(75 50 50)" />
            <use href="#tooth" transform="rotate(90 50 50)" />
            <use href="#tooth" transform="rotate(105 50 50)" />
            <use href="#tooth" transform="rotate(120 50 50)" />
            <use href="#tooth" transform="rotate(135 50 50)" />
            <use href="#tooth" transform="rotate(150 50 50)" />
            <use href="#tooth" transform="rotate(165 50 50)" />
            <use href="#tooth" transform="rotate(180 50 50)" />
            <use href="#tooth" transform="rotate(195 50 50)" />
            <use href="#tooth" transform="rotate(210 50 50)" />
            <use href="#tooth" transform="rotate(225 50 50)" />
            <use href="#tooth" transform="rotate(240 50 50)" />
            <use href="#tooth" transform="rotate(255 50 50)" />
            <use href="#tooth" transform="rotate(270 50 50)" />
            <use href="#tooth" transform="rotate(285 50 50)" />
            <use href="#tooth" transform="rotate(300 50 50)" />
            <use href="#tooth" transform="rotate(315 50 50)" />
            <use href="#tooth" transform="rotate(330 50 50)" />
            <use href="#tooth" transform="rotate(345 50 50)" />
          </g>
          <circle cx="50" cy="50" r="39" fill="none" stroke="#8B003A" stroke-width="2.5" />
          <circle cx="50" cy="50" r="33.5" fill="none" stroke="#8B003A" stroke-width="8.5" />
          <circle cx="50" cy="50" r="33.5" fill="none" stroke="white" stroke-width="6.5" />
          <circle cx="50" cy="50" r="29" fill="none" stroke="#8B003A" stroke-width="2.5" />
          <g>
            <use href="#spoke" />
            <use href="#spoke" transform="rotate(60 50 50)" />
            <use href="#spoke" transform="rotate(120 50 50)" />
            <use href="#spoke" transform="rotate(180 50 50)" />
            <use href="#spoke" transform="rotate(240 50 50)" />
            <use href="#spoke" transform="rotate(300 50 50)" />
          </g>
          <circle cx="50" cy="50" r="13" fill="#8B003A" />
          <circle cx="50" cy="50" r="7.5" fill="white" />
          <circle cx="50" cy="50" r="4.5" fill="#8B003A" />
          <rect x="48" y="41.5" width="4" height="4.5" fill="#8B003A" />
        </svg>
        <div class="text-left font-display ml-3">
          <h1 class="font-extrabold text-[20px] md:text-[22px] text-[#8B003A] leading-[1.05] tracking-tight">Rotaract</h1>
          <div class="flex flex-col">
            <p class="font-semibold text-[11px] md:text-[12px] text-[#8B003A] leading-none tracking-wide uppercase">Bangalore Warriors</p>
          </div>
        </div>
      </a>

      <!-- Center Navigation (Home and Blog only) -->
      <nav class="main-nav relative z-[2] mx-4 hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex">
        <a href="index.html" data-label="Home" class="relative py-1 text-[15px] font-semibold text-slate-655 hover:text-[#8B003A] transition font-display">Home</a>
        <a href="Blog.html" data-label="Blog" class="relative py-1 text-[15px] font-bold text-[#8B003A] border-b-2 border-[#8B003A] transition font-display">Blog</a>
      </nav>

      <!-- Mobile menu toggle -->
      <button type="button" class="mobile-toggle relative z-[2] ml-auto flex h-10 w-10 items-center justify-center rounded-md text-slate-800 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation menu">
        <svg class="icon-menu h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        <svg class="icon-x hidden h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>

    <!-- Mobile Nav menu -->
    <nav class="mobile-nav hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 pb-8 pt-5 lg:hidden w-full absolute top-[70px] left-0 shadow-lg z-50">
      <ul class="flex flex-col gap-4 font-display font-bold text-slate-700">
        <li><a href="index.html" class="block w-fit text-[17px] hover:text-[#8B003A]">Home</a></li>
        <li><a href="Blog.html" class="block w-fit text-[17px] text-[#8B003A]">Blog</a></li>
      </ul>
    </nav>
  </header>

  <!-- ================================ PAGE CONTENT ================================ -->
  <main class="flex-grow">
    
    <!-- Section 1: Hero Banner -->
    <section class="relative py-16 lg:py-20 overflow-hidden bg-white">
      <div class="mx-auto max-w-[1400px] px-6 relative z-10">
        <div class="grid gap-12 lg:grid-cols-12 items-center">
          
          <!-- Left Column: Content -->
          <div class="lg:col-span-6 flex flex-col items-start text-left hero-text-animate">
            <div class="flex items-center gap-2 bg-amber-500/10 px-3.5 py-1.5 rounded-full mb-6">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span class="text-[10px] font-black tracking-widest text-amber-500 uppercase">OUR REELS</span>
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Stories that Inspire,<br/>
              <span class="text-[#8B003A] block mt-1">Reels that Drive Change.</span>
            </h1>
            <p class="text-slate-550 font-medium leading-relaxed text-sm mt-6 max-w-xl">
              Explore our journey through Instagram Reels. Every project, every smile and every moment of service - captured and shared with the world.
            </p>
            <div class="flex flex-wrap gap-4 mt-8">
              <a href="#blog-grid" class="flex items-center justify-center gap-2 rounded-xl bg-[#8B003A] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#78002E] transition">
                <svg class="h-4 w-4 fill-current text-white" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/></svg>
                View Reels
              </a>
            </div>
          </div>
          
          <!-- Right Column: Mockup Illustration -->
          <div class="lg:col-span-6 flex items-center justify-center hero-img-animate">
            <div class="relative w-full max-w-lg">
              <img src="assets/img/illustrations/hero_blog.png" alt="Volunteers recording tree planting" class="w-full h-auto object-contain rounded-[24px]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Interactive Controls (Categories & Search) -->
    <section id="blog-grid" class="py-6 border-t border-slate-100 bg-[#fafbfc]">
      <div class="mx-auto max-w-[1400px] px-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <!-- Filter Pills -->
          <div class="flex flex-wrap gap-2.5 items-center">
            <button type="button" data-category="All" class="category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-sm bg-[#8B003A] text-white">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              All Reels
            </button>
            <button type="button" data-category="Projects" class="category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-sm bg-white text-slate-655 hover:bg-slate-50 border border-slate-200">
              Projects
            </button>
            <button type="button" data-category="Events" class="category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-sm bg-white text-slate-655 hover:bg-slate-50 border border-slate-200">
              Events
            </button>
            <button type="button" data-category="Community Service" class="category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-sm bg-white text-slate-655 hover:bg-slate-50 border border-slate-200">
              Community Service
            </button>
            <button type="button" data-category="Fellowship" class="category-pill flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-sm bg-white text-slate-655 hover:bg-slate-50 border border-slate-200">
              Fellowship
            </button>
          </div>

          <!-- Search Input Bar -->
          <div class="relative w-full md:max-w-xs shrink-0 font-display">
            <input type="text" id="blog-search" placeholder="Search reels..." class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#8B003A] focus:outline-none focus:ring-1 focus:ring-[#8B003A]" />
            <svg class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

        </div>

        <!-- Section 3: Blog Grid (Responsive layout matching mockup) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 mb-16">
          
          <!-- Card 1: Annadhan 5.0 (Reels Skeleton) -->
          <div class="blog-card flex flex-col bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition duration-300 cursor-pointer" data-id="annadhan" data-type="reel" data-categories="Projects,Community Service">
            <!-- Thumbnail wrapper -->
            <div class="relative aspect-video w-full overflow-hidden bg-gradient-to-tr from-purple-100 to-pink-50 flex items-center justify-center">
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-40"></div>
              <svg class="h-12 w-12 text-[#8B003A]/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <!-- Pink Reels badge -->
              <span class="absolute top-4 left-4 bg-pink-600/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Reels
              </span>
            </div>
            <!-- Details content -->
            <div class="p-6.5 text-left flex flex-col justify-between flex-grow">
              <div>
                <h3 class="card-title text-base font-extrabold text-slate-900 tracking-tight leading-snug">Annadhan 5.0 - Spreading Smiles & Hope</h3>
                <p class="card-desc text-slate-500 text-xs mt-3 leading-relaxed">Because a small meal can bring a big smile.</p>
              </div>
              <div class="border-t border-slate-100 pt-5 mt-6 flex flex-col gap-3">
                <div class="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>📅 5 Apr 2024</span>
                  <span>👁️ Instagram Live</span>
                </div>
                <span class="text-[11px] font-black text-[#8B003A] tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all">
                  Watch on Instagram Reels →
                </span>
              </div>
            </div>
          </div>

          <!-- Card 2: Flavours Beyond Borders (Reels Skeleton) -->
          <div class="blog-card flex flex-col bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition duration-300 cursor-pointer" data-id="flavours" data-type="reel" data-categories="Events,Fellowship">
            <!-- Thumbnail wrapper -->
            <div class="relative aspect-video w-full overflow-hidden bg-gradient-to-tr from-purple-100 to-pink-50 flex items-center justify-center">
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-40"></div>
              <svg class="h-12 w-12 text-[#8B003A]/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <!-- Pink Reels badge -->
              <span class="absolute top-4 left-4 bg-pink-600/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Reels
              </span>
            </div>
            <!-- Details content -->
            <div class="p-6.5 text-left flex flex-col justify-between flex-grow">
              <div>
                <h3 class="card-title text-base font-extrabold text-slate-900 tracking-tight leading-snug">Flavours Beyond Borders - Food Behind Friendship</h3>
                <p class="card-desc text-slate-500 text-xs mt-3 leading-relaxed">Different cultures, one table, endless connections.</p>
              </div>
              <div class="border-t border-slate-100 pt-5 mt-6 flex flex-col gap-3">
                <div class="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>📅 18 Feb 2024</span>
                  <span>👁️ Instagram Live</span>
                </div>
                <span class="text-[11px] font-black text-[#8B003A] tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all">
                  Watch on Instagram Reels →
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Load More Pagination Button -->
        <div class="flex justify-center mb-20">
          <button type="button" id="load-more-btn" class="flex items-center gap-2 rounded-2xl bg-[#8B003A] hover:bg-[#78002E] text-white px-7 py-3 text-xs font-black shadow transition duration-200">
            <svg class="h-4 w-4 fill-current text-white" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            <span>Load More</span>
          </button>
        </div>

      </div>
    </section>

    <!-- Section 4: Newsletter Strip -->
    <section class="relative bg-[#8B003A] py-10 text-white overflow-hidden select-none">
      <!-- Background Ambient Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      <div class="mx-auto max-w-[1400px] px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4 text-left">
          <div class="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
            ✉️
          </div>
          <div>
            <h3 class="text-base font-extrabold tracking-tight">Stay Updated with Our Journey</h3>
            <p class="text-white/70 text-xs font-medium mt-1">Subscribe to never miss our latest stories, projects and impact.</p>
          </div>
        </div>
        
        <form id="newsletter-form" class="w-full lg:max-w-md flex gap-2 font-display">
          <input type="email" required placeholder="Enter your email address" class="flex-grow rounded-xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-medium text-white placeholder-white/50 focus:bg-white/20 focus:border-white focus:outline-none" />
          <button type="submit" class="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-[#8B003A] px-6 py-3 text-xs font-black shadow transition shrink-0">
            <svg class="h-3.5 w-3.5 fill-current text-[#8B003A]" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            Subscribe
          </button>
        </form>
      </div>
    </section>

  </main>

  <!-- ============================ FOOTER ============================ -->
  <footer class="relative bg-gradient-to-br from-[#f0f9ff] via-[#e6f4fe] to-[#d0ecfc] text-slate-700 border-t border-[#8B003A]/10 overflow-hidden select-none font-sans mt-auto">
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#8B003A]/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none"></div>
    
    <div class="relative mx-auto max-w-[1400px] px-6 py-16 md:py-20 z-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 items-start">
        
        <!-- Column 1 -->
        <div class="flex flex-col items-start gap-4">
          <div class="flex items-center gap-3">
            <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
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
              <circle cx="50" cy="50" r="39" fill="none" stroke="#8B003A" stroke-width="2.5" />
              <circle cx="50" cy="50" r="33.5" fill="none" stroke="#8B003A" stroke-width="8.5" />
              <circle cx="50" cy="50" r="33.5" fill="none" stroke="white" stroke-width="6.5" />
              <circle cx="50" cy="50" r="29" fill="none" stroke="#8B003A" stroke-width="2.5" />
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
            <div class="text-left font-display">
              <h3 class="text-base font-extrabold tracking-wide text-slate-800 leading-none">Rotaract</h3>
              <p class="text-[10px] font-black text-slate-655 tracking-wider uppercase mt-1">Bangalore Warriors</p>
              <p class="text-[9px] font-bold text-[#8B003A] mt-0.5">RID 3192</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 font-semibold leading-relaxed">
            We are a family of young changemakers, creating impact through service, leadership and fellowship.
          </p>
          <span class="font-script text-2xl text-amber-600 tracking-wide mt-1 block" style="font-family: 'Dancing Script', cursive">
            Service Above Self
          </span>
        </div>

        <!-- Column 2 -->
        <div class="flex flex-col items-start gap-4 w-full">
          <h4 class="text-xs font-black tracking-widest text-[#8B003A] uppercase border-l-2 border-[#8B003A] pl-3">Quick Links</h4>
          <ul class="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-bold text-slate-600 w-full">
            <li>
              <a href="index.html" class="hover:text-[#8B003A] transition-colors duration-200 relative group py-0.5 inline-block">
                Home
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
            <li>
              <a href="about.html" class="hover:text-[#8B003A] transition-colors duration-200 relative group py-0.5 inline-block">
                About Us
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
            <li>
              <a href="projects.html" class="hover:text-[#8B003A] transition-colors duration-200 relative group py-0.5 inline-block">
                Projects
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
            <li>
              <a href="Blog.html" class="hover:text-[#8B003A] transition-colors duration-200 relative group py-0.5 inline-block">
                Blog
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
            <li>
              <a href="join.html" class="hover:text-[#8B003A] transition-colors duration-200 relative group py-0.5 inline-block">
                Become a Warrior
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 3 -->
        <div class="flex flex-col items-start gap-4 w-full">
          <h4 class="text-xs font-black tracking-widest text-[#8B003A] uppercase border-l-2 border-[#8B003A] pl-3">Connect With Us</h4>
          <ul class="flex flex-col gap-2 text-xs font-bold text-slate-600 w-full">
            <li>
              <a href="https://www.instagram.com/racb_warriors/?hl=en" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#8B003A]/10 bg-white/40 transition hover:text-[#8B003A] hover:bg-[#8B003A]/5 group">
                <span class="text-xs">Instagram</span>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/rotaract-club-of-bangalore-warriors-a89447318/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#8B003A]/10 bg-white/40 transition hover:text-[#8B003A] hover:bg-[#8B003A]/5 group">
                <span class="text-xs">LinkedIn</span>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@RotaractclubofBangaloreWarrior" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#8B003A]/10 bg-white/40 transition hover:text-[#8B003A] hover:bg-[#8B003A]/5 group">
                <span class="text-xs">YouTube</span>
              </a>
            </li>
            <li>
              <a href="https://x.com/_RCBW_" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#8B003A]/10 bg-white/40 transition hover:text-[#8B003A] hover:bg-[#8B003A]/5 group">
                <span class="text-xs">X (Twitter)</span>
              </a>
            </li>
            <li>
              <a href="https://www.threads.com/@racb_warriors" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-[#8B003A]/10 bg-white/40 transition hover:text-[#8B003A] hover:bg-[#8B003A]/5 group">
                <span class="text-xs">Threads</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 4 -->
        <div class="flex flex-col items-start gap-4">
          <h4 class="text-xs font-black tracking-widest text-[#8B003A] uppercase border-l-2 border-[#8B003A] pl-3">Contact Us</h4>
          <div class="flex flex-col gap-3.5 text-xs font-semibold text-slate-550 leading-relaxed">
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase block mb-0.5">Email</span>
              <a href="mailto:racwarriors2023@gmail.com" class="text-slate-700 hover:text-[#8B003A] transition">racwarriors2023@gmail.com</a>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase block mb-0.5">President</span>
              <p class="text-slate-800 font-bold">Rtr. Rishabh Gupta</p>
            </div>
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase block mb-0.5">WhatsApp</span>
              <a href="https://wa.me/918884669102" class="text-slate-800 hover:text-[#8B003A] transition font-bold">+91 88846 69102</a>
            </div>
          </div>
        </div>

        <!-- Column 5 -->
        <div class="flex flex-col items-start lg:items-end justify-center w-full relative min-h-[160px]">
          <p class="text-sm font-medium text-slate-500">Together, we</p>
          <h3 class="text-4xl font-extrabold text-amber-500 tracking-wide mt-1 animate-pulse" style="font-family: 'Dancing Script', cursive;">
            Create Change
          </h3>
        </div>

      </div>
    </div>

    <!-- Bottom Copyright Strip -->
    <div class="relative border-t border-[#8B003A]/10 bg-[#bae6fd] py-6 z-10 font-sans text-xs">
      <div class="mx-auto max-w-[1400px] px-6 text-center text-slate-700 font-semibold flex items-center justify-center gap-1.5 flex-wrap">
        <span>© Copy Right 2026 All Rights Reserved. ❤️ Designed & Managed by</span>
        <a href="#" class="text-[#8B003A] font-black tracking-wide relative group py-0.5" data-portfolio-trigger>
          N LATHIESH
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full"></span>
        </a>
      </div>
    </div>
  </footer>

  <!-- ============================ MODAL VIDEO PLAYER ============================ -->
  <div id="video-modal" class="fixed inset-0 z-[6000] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300 bg-black/60 backdrop-blur-sm">
    <div class="absolute inset-0" data-video-close></div>
    
    <!-- Modal Glassmorphic Card Container -->
    <div class="relative w-full max-w-[420px] bg-[#f0f9ff] border border-[#8B003A]/25 rounded-[32px] shadow-[0_20px_50px_rgba(139,0,58,0.15)] overflow-hidden backdrop-blur-2xl p-6 text-slate-800 z-10 flex flex-col gap-4 transform scale-95 translate-y-4 transition-all duration-300 modal-card-content">
      
      <!-- Close Button -->
      <button type="button" data-video-close class="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#8B003A]/10 border border-[#8B003A]/20 text-[#8B003A] hover:bg-[#8B003A]/25 transition duration-200 z-50">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <!-- Vertical Instagram Reel Embed Wrapper -->
      <div id="modal-video-player-wrapper" class="w-full aspect-[9/16] rounded-[24px] overflow-hidden border border-[#8B003A]/15 bg-white shadow-lg relative">
        <iframe id="modal-video-iframe" class="h-full w-full absolute inset-0" src="" frameborder="0" allowtransparency="true" scrolling="no"></iframe>
      </div>
    </div>
  </div>

  <!-- Portfolio Popup Glassmorphic Modal Card -->
  <div id="portfolio-modal" class="fixed inset-0 z-[6000] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300 bg-black/40 backdrop-blur-sm">
    <div class="absolute inset-0" data-portfolio-close></div>
    <div class="relative w-full max-w-[500px] bg-[#f0f9ff] border border-[#8B003A]/20 rounded-[24px] shadow-[0_20px_50px_rgba(139,0,58,0.1)] overflow-hidden backdrop-blur-2xl p-6 sm:p-7 text-slate-800 z-10 flex flex-col gap-6 transform scale-95 translate-y-4 transition-all duration-300 modal-card-content">
      <button type="button" data-portfolio-close class="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#8B003A]/5 border border-[#8B003A]/10 text-slate-650 hover:bg-[#8B003A]/15 hover:text-[#8B003A] transition duration-200">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <div class="flex gap-4 items-center">
        <div class="h-16 w-16 rounded-full overflow-hidden border border-[#8B003A]/20 shadow bg-white shrink-0">
          <img src="assets/img/lathiesh_profile.png" alt="N Lathiesh Profile" class="h-full w-full object-cover">
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-black tracking-wide text-slate-900">N LATHIESH</h3>
          <p class="text-[10px] font-black text-[#8B003A] tracking-wider uppercase mt-0.5">
            Aerospace Engineer • UI/UX Designer • SCM Analyst • Full Stack Developer
          </p>
        </div>
      </div>
      <p class="text-xs text-slate-600 leading-relaxed font-medium">
        Building premium digital experiences for startups, NGOs, brands and organizations through modern web design, creative branding, App development and scalable applications.
      </p>
      <div class="grid grid-cols-4 gap-2 bg-[#8B003A]/5 border border-[#8B003A]/5 rounded-2xl p-3 text-center">
        <div><h4 class="text-sm font-black text-[#8B003A]">10+</h4><p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Projects</p></div>
        <div><h4 class="text-sm font-black text-[#8B003A]">3+</h4><p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Experience</p></div>
        <div><h4 class="text-sm font-black text-[#8B003A]">5+</h4><p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Clients</p></div>
        <div><h4 class="text-sm font-black text-[#8B003A]">100%</h4><p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Creativity</p></div>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <a href="https://wa.me/918197176867" target="_blank" class="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[11px] font-black shadow-md transition duration-200">💬 WhatsApp</a>
        <a href="#" class="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#8B003A]/10 hover:bg-[#8B003A]/20 border border-[#8B003A]/10 text-[#8B003A] text-[11px] font-black transition duration-200">📄 Resume</a>
        <a href="mailto:connectlathiesh@gmail.com" class="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#8B003A] hover:bg-[#6e002e] text-white text-[11px] font-black shadow-md transition duration-200">📧 Contact</a>
      </div>
    </div>
  </div>

  <script src="js/api/client.js?v=17"></script>
  <script src="js/app.js?v=16"></script>
  <script src="js/blog-logic.js?v=2"></script>
  <script>
    // Handle Portfolio Modal Popup
    document.addEventListener('DOMContentLoaded', function() {
      var modal = document.getElementById('portfolio-modal');
      var triggers = document.querySelectorAll('[data-portfolio-trigger]');
      var closeButtons = document.querySelectorAll('[data-portfolio-close]');
      var card = modal ? modal.querySelector('.modal-card-content') : null;

      if (triggers.length && modal) {
        triggers.forEach(function(t) {
          t.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('opacity-0', 'pointer-events-none');
            setTimeout(function() {
              if (card) {
                card.classList.remove('scale-95', 'translate-y-4');
                card.classList.add('scale-100', 'translate-y-0');
              }
            }, 10);
          });
        });
      }
      if (closeButtons.length && modal) {
        closeButtons.forEach(function(b) {
          b.addEventListener('click', function() {
            if (card) {
              card.classList.add('scale-95', 'translate-y-4');
              card.classList.remove('scale-100', 'translate-y-0');
            }
            setTimeout(function() {
              modal.classList.add('opacity-0', 'pointer-events-none');
            }, 250);
          });
        });
      }
    });
  </script>
</body>
</html>
