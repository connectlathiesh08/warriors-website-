<!DOCTYPE html>
<html lang="en">
<head>
  <script src="js/under-construction.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Projects | Rotaract Club of Bangalore Warriors</title>
  <meta name="description" content="Explore community service, leadership, and professional development projects executed by the Rotaract Club of Bangalore Warriors.">
  <style>
/* ==========================================================================
   Rotary District 3011 — site.css
   Verbatim custom CSS blocks ported from the React app's src/index.css.
   Tailwind utilities are supplied separately (Tailwind config + Preflight).
   Hex values, easings and timings are copied exactly — do NOT paraphrase.
   ========================================================================== */

:root {
  color-scheme: light;
}

html {
  height: 100%;
}

/* Body must GROW with content (min-height), not be locked to a fixed 100% height.
   It is a flex column, so a fixed height makes the browser shrink the children to
   fit — squashing the fixed-height header/contact strip on inner pages. The home
   page only escaped this because Lenis sets `html.lenis body { height: auto }`. */
body {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: 'Poppins', 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  color: #1a2b4a;
}

/* Light-blue page with a subtle dotted texture (matches the design background) */
.page-texture {
  background-color: #eef3fb;
  background-image: radial-gradient(rgba(22, 66, 155, 0.06) 1px, transparent 1px);
  background-size: 22px 22px;
}

/* Slim custom scrollbar used inside the list cards */
.slim-scroll {
  scrollbar-width: thin;
  scrollbar-color: #c7d2e6 transparent;
}
.slim-scroll::-webkit-scrollbar {
  width: 6px;
}
.slim-scroll::-webkit-scrollbar-track {
  background: transparent;
  margin: 6px 0;
}
.slim-scroll::-webkit-scrollbar-thumb {
  background: #c7d2e6;
  border-radius: 9999px;
}
.slim-scroll::-webkit-scrollbar-thumb:hover {
  background: #a9b7ce;
}

/* Lenis smooth scrolling (see js/effects/smooth-scroll.js). */
html.lenis,
html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
.lenis.lenis-smooth iframe {
  pointer-events: none;
}

/* Header: white logo wedge. The clip-path lives on this white layer (never on
   the logo content). The blue header shows wherever the wedge is clipped away,
   so the diagonal is the white->blue transition on the left. */
/* The wedge bottom edge is fixed to the header height (Site.Master h-[70px] /
   md:h-20 = 70/80px). If you change the header height, recompute these paths or
   blue shows through below the white wedge. */
.logo-curve {
  clip-path: path('M 0 0 H 180 C 232 18, 225 62, 255 80 L 0 80 Z');
}
@media (max-width: 767px) {
  .logo-curve {
    clip-path: path('M 0 0 H 150 C 195 16, 190 54, 214 70 L 0 70 Z');
  }
}

/* Desktop nav "slot machine" hover: each letter is a 4-deep vertical reel of
   the same letter. On hover the reel scrolls down through 3 rows and decelerates
   to rest on an identical copy (so rest/end look seamless), staggered left->right
   via an inline --d delay so the reels stop one after another — jackpot style. */
.slot-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
.slot-text {
  display: inline-flex;
  align-items: center;
}
.slot-col {
  display: inline-block;
  height: 1.25em;
  overflow: hidden;
  vertical-align: middle;
}
.slot-col > .slot-reel {
  display: block;
  transform: translateY(0);
}
.slot-col > .slot-reel > span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.25em;
  line-height: 1;
  white-space: pre;
}
.slot-link:hover .slot-reel,
.slot-link:focus-visible .slot-reel {
  animation: slot-spin 0.6s cubic-bezier(0.18, 0.7, 0.12, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes slot-spin {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-75%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .slot-link:hover .slot-reel,
  .slot-link:focus-visible .slot-reel {
    animation: none;
  }
}

/* --- Entrance animations --- */

/* Cards fade + rise in on first paint. Stagger is set via inline
   animation-delay where the cards are rendered. */
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.card-enter {
  animation: card-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* List rows fade + rise as they scroll into view inside a card. Scroll-driven
   where supported (Chrome 115+); elsewhere rows simply render in their final
   visible state, so content is never hidden. */
@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@supports (animation-timeline: view()) {
  .row-animate {
    animation: row-in linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 34%;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
  .card-enter,
  .row-animate {
    animation: none !important;
  }
}

/* ===========================================================================
   DOUBLE STAIRCASE PAGE TRANSITION
   Eight full-height columns split into two interlocking staircases:
   even columns = brand blue, enter from the TOP; odd columns = brand gold,
   enter from the BOTTOM. A left-to-right per-column stagger (set inline via
   animation-delay) gives the stepped staircase rhythm.

   Timing here MUST match js/effects/staircase.js:
     COLUMNS=8  SLIDE_MS=380 (--pt-slide)  STAGGER_MS=60 (inline)  HOLD_MS=90
   Overlay z-index 3000 clears the sticky header (z-1000) and modals (z-2000).
   =========================================================================== */
.pt-overlay {
  --pt-slide: 380ms;
  --pt-ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: fixed;
  inset: 0;
  z-index: 3000;
  overflow: hidden;
  pointer-events: none;
}
.pt-overlay.pt-idle {
  display: none;
}
.pt-col {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  will-change: transform;
}
.pt-top {
  transform: translateY(-100%);
}
.pt-bottom {
  transform: translateY(100%);
}
.pt-blue {
  background: #16429b;
}
.pt-gold {
  background: #f5a623;
}
.pt-overlay[data-stage='cover'] .pt-top {
  animation: pt-cover-top var(--pt-slide) var(--pt-ease) both;
}
.pt-overlay[data-stage='cover'] .pt-bottom {
  animation: pt-cover-bottom var(--pt-slide) var(--pt-ease) both;
}
.pt-overlay[data-stage='reveal'] .pt-top {
  animation: pt-reveal-top var(--pt-slide) var(--pt-ease) both;
}
.pt-overlay[data-stage='reveal'] .pt-bottom {
  animation: pt-reveal-bottom var(--pt-slide) var(--pt-ease) both;
}
@keyframes pt-cover-top {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes pt-cover-bottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes pt-reveal-top {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}
@keyframes pt-reveal-bottom {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pt-overlay,
  .pt-overlay.pt-active {
    display: none !important;
  }
  .pt-col {
    animation: none !important;
  }
}

/* CircularGallery (Our Projects) — from React CircularGallery.css */
.circular-gallery {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}
.circular-gallery:active {
  cursor: grabbing;
}
.circular-gallery:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

/* Responsive header nav spacing to prevent collision on medium screens */
@media (min-width: 1440px) and (max-width: 1535px) {
  .site-header .main-nav {
    gap: 0.25rem !important;
  }
  .site-header .main-nav .slot-link {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    font-size: 12px !important;
  }
  .site-header .header-actions {
    gap: 0.5rem !important;
  }
  .site-header .header-actions .slot-link {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
    font-size: 12px !important;
  }
  .site-header > div {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
}



/* ==========================================================================
   Galleries Fallback Layout Styles (when Tailwind CDN is blocked or offline)
   ========================================================================== */

/* Circular Gallery styling */
.projects-gallery {
  overflow: hidden;
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  width: 100%;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  position: relative;
  height: 420px;
}
@media (max-width: 639px) {
  .projects-gallery {
    height: 380px;
  }
}
.cg-track {
  display: flex;
  gap: 1.5rem;
  padding-left: 3rem;
  padding-right: 3rem;
  transition: transform 100ms ease-out;
  height: 100%;
  align-items: center;
  width: max-content;
  will-change: transform;
}
.cg-card {
  width: 240px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(241, 245, 249, 0.5);
  padding: 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 300ms ease-out, box-shadow 300ms ease-out;
  cursor: default;
}
@media (max-width: 639px) {
  .cg-card {
    width: 200px;
  }
}
.cg-card:hover {
  transform: translateY(-0.5rem);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.cg-img-wrap {
  width: 100%;
  height: 180px;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: #f8fafc;
  position: relative;
}
@media (max-width: 639px) {
  .cg-img-wrap {
    height: 150px;
  }
}
.cg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms;
}
.cg-img:hover {
  transform: scale(1.05);
}
.cg-text-wrap {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.cg-category {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.cg-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  color: #0B2B6B;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dome Gallery styling */
.photo-gallery {
  position: relative;
  width: 100%;
  height: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}
@media (max-width: 639px) {
  .photo-gallery {
    height: 550px;
  }
}
.dg-scene {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  transform-style: preserve-3d;
}
.dg-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(80px);
  opacity: 0.4;
  transition: all 1000ms;
  width: 70%;
  height: 70%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 0, 58, 0.15) 50%, transparent 100%);
  transform: translateZ(-300px);
}
.dg-globe {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms;
  width: 0px;
  height: 0px;
  transform-style: preserve-3d;
}
.dg-card {
  position: absolute;
  width: 110px;
  height: 150px;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 300ms ease-out;
  transform-origin: center;
}
@media (max-width: 639px) {
  .dg-card {
    width: 95px;
    height: 130px;
  }
}
.dg-img-wrap {
  width: 100%;
  height: 85px;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f8fafc;
  position: relative;
}
@media (max-width: 639px) {
  .dg-img-wrap {
    height: 70px;
  }
}
.dg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.dg-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.25rem;
  user-select: none;
  pointer-events: none;
}
.dg-title {
  font-size: 9px;
  font-weight: 700;
  line-height: 1.25;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dg-footer {
  font-size: 7px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

</style>
</head>
<body>

  <!-- Dynamic Header -->
  <header id="site-header"></header>

  <!-- Background Orbs -->
  <div class="bg-glow-orb orb-1"></div>
  <div class="bg-glow-orb orb-2"></div>

  <!-- Page Header -->
  <section class="section" style="padding-top: 8rem; padding-bottom: 2rem;">
    <div class="container text-center">
      <span class="section-tagline">Making a Difference</span>
      <h1 class="gradient-text" style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">Our Projects</h1>
      <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto; margin-bottom: 2rem;">We take pride in conceptualizing and executing projects that drive sustainable positive changes in society.</p>
      
      <!-- Search input -->
      <div style="max-width: 450px; margin: 0 auto; position: relative;">
        <input type="text" id="project-search" class="form-control" placeholder="Search projects by title or keyword..." style="padding-right: 2.5rem; text-align: center; border-radius: var(--radius-full);">
      </div>
    </div>
  </section>

  <!-- Projects Grid Section -->
  <section class="section" style="padding-top: 1rem;">
    <div class="container">
      
      <!-- Category Filter Pills -->
      <div class="filter-bar" id="category-filters">
        <button class="filter-btn active" data-filter="all">All Avenue Projects</button>
        <button class="filter-btn" data-filter="Community Service">Community Service</button>
        <button class="filter-btn" data-filter="Professional Development">Professional Development</button>
        <button class="filter-btn" data-filter="Club Service">Club Service</button>
        <button class="filter-btn" data-filter="International Service">International Service</button>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-3" id="projects-grid">
        <!-- Rendered Dynamically by JS -->
      </div>
      
      <!-- No Projects Placeholder -->
      <div id="no-projects-message" style="display: none; text-align: center; padding: 4rem 0; color: var(--text-muted);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <p>No projects match your search criteria. Try a different filter!</p>
      </div>
    </div>
  </section>

  <!-- Detailed Project Modal Overlay -->
  <div class="modal-overlay" id="project-modal">
    <div class="modal-content">
      <button class="modal-close" id="modal-close-btn" aria-label="Close details">&times;</button>
      <div class="modal-hero" id="modal-hero-container">
        <!-- Filled Dynamically -->
      </div>
      <div class="modal-body">
        <h2 id="modal-title" style="margin-bottom: 1.5rem; font-size: 2rem;">Project Title</h2>
        <div class="modal-meta-grid">
          <div class="modal-meta-item">
            <h5>Avenue / Category</h5>
            <p id="modal-category">Community Service</p>
          </div>
          <div class="modal-meta-item">
            <h5>Execution Date</h5>
            <p id="modal-date">June 15, 2026</p>
          </div>
          <div class="modal-meta-item">
            <h5>Impact / Metrics</h5>
            <p id="modal-impact">250+ Beneficiaries</p>
          </div>
        </div>
        <div class="modal-desc" id="modal-description">
          Project description details will load here.
        </div>
      </div>
    </div>
  </div>

  <!-- Dynamic Footer -->
  <footer id="site-footer"></footer>

  <script src="js/main.js"></script>
  <script>
// Default Mock Projects Dataset
const DEFAULT_PROJECTS = [
  {
    id: "p1",
    title: "Annual Mega Blood Donation Drive",
    category: "Community Service",
    date: "2026-06-14",
    impact: "250+ blood units collected",
    excerpt: "In collaboration with the Rotary Club of Bangalore, we successfully collected 250+ units of blood for government hospitals.",
    description: "Our Mega Blood Donation Drive is one of our flagship community service initiatives. Conducted at the Bangalore Central Town Hall, we saw participation from college students, working professionals, and local residents. With a team of 30 Rotaractors running coordination, registration, and post-donation care, the collected blood units were safely cataloged and transferred to the Bowring Hospital Blood Bank, helping bridge critical seasonal shortages.",
    hue: 342 // Red-Cranberry theme
  },
  {
    id: "p2",
    title: "Ignite: Youth Leadership Summit",
    category: "Professional Development",
    date: "2026-05-20",
    impact: "180+ attendees trained",
    excerpt: "A day-long conference hosting industry leaders, networking panels, and soft skill workshops for college graduates.",
    description: "Ignite 2026 was organized with the goal of bridging the gap between college education and corporate readiness. Featuring three keynotes from top tech entrepreneurs, panel discussions on artificial intelligence, and interactive break-out rooms focusing on resume writing and professional communication, the summit provided concrete professional mentorship to graduating students in Bangalore.",
    hue: 217 // Blue theme
  },
  {
    id: "p3",
    title: "Green Warriors: Sapling Plantation",
    category: "Community Service",
    date: "2026-04-18",
    impact: "500 saplings planted & geotagged",
    excerpt: "Planting and pledging protection to 500 indigenous saplings along public spaces in North Bangalore.",
    description: "In response to urban heating challenges, the Green Warriors project saw our members plant 500 saplings across parks and residential layouts. We did not stop at planting: each tree was geotagged, assigned a neighborhood volunteer guardian, and protected by a robust biodegradable tree guard to ensure high survival rates over the upcoming monsoon.",
    hue: 142 // Green theme
  },
  {
    id: "p4",
    title: "Project Saksham: Sign Language Basic Workshop",
    category: "Professional Development",
    date: "2026-03-10",
    impact: "60+ certified learners",
    excerpt: "An inclusive workshop educating members and students in the basics of Indian Sign Language.",
    description: "Project Saksham focused on community inclusion. By partnering with certified interpreters, we hosted a 2-day workshop teaching fingerspelling, common expressions, and conversations in Indian Sign Language (ISL). The goal is to make our community service projects and daily interactions more inclusive for deaf and hard-of-hearing citizens.",
    hue: 43 // Gold theme
  },
  {
    id: "p5",
    title: "Global Harmony: Virtual Joint Meeting",
    category: "International Service",
    date: "2026-02-15",
    impact: "4 international clubs connected",
    excerpt: "A collaborative virtual exchange sharing cultural traditions, project ideas, and global fellowship goals.",
    description: "Recognizing that Rotaract is a global family, we organized a Virtual Joint Meeting with Rotaract clubs in Germany, Brazil, and Nepal. Each club presented a local community challenge and their implementation strategy, fostering cross-border learning, sharing of ideas, and international camaraderie.",
    hue: 280 // Purple theme
  }
];

document.addEventListener('DOMContentLoaded', () => {
  let projects = [];
  const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000' : '';
  
  const loadProjectsFromAPI = async () => {
    try {
      const res = await fetch(`${apiBase}/api/projects?status=published`);
      if (res.ok) {
        projects = await res.json();
      } else {
        throw new Error('API Offline');
      }
    } catch (err) {
      console.warn('Failed to load projects from REST API, falling back to localStorage:', err);
      try {
        const localStr = localStorage.getItem('warriors_projects');
        if (localStr) {
          const parsed = JSON.parse(localStr);
          projects = parsed.filter(p => p.status === 'Published' || p.isPublished !== false);
        }
      } catch (e) {}
    }
    renderProjects();
  };

  const projectsGrid = document.getElementById('projects-grid');
  const searchInput = document.getElementById('project-search');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const noProjectsMsg = document.getElementById('no-projects-message');
  
  // Modal Elements
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalHero = document.getElementById('modal-hero-container');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDate = document.getElementById('modal-date');
  const modalImpact = document.getElementById('modal-impact');
  const modalDesc = document.getElementById('modal-description');

  let activeFilter = 'all';
  let searchQuery = '';

  // Render Function
  function renderProjects() {
    projectsGrid.innerHTML = '';
    
    const filtered = projects.filter(p => {
      if (p.isPublished === false) return false;
      const titleText = p.title || p.name || '';
      const excerptText = p.excerpt || p.description || '';
      const categoryText = p.category || '';
      
      const matchesFilter = activeFilter === 'all' || categoryText === activeFilter;
      const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            excerptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            categoryText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      noProjectsMsg.style.display = 'block';
      return;
    } else {
      noProjectsMsg.style.display = 'none';
    }

    filtered.forEach(project => {
      const card = document.createElement('div');
      card.className = 'glass-panel project-card animate-fade-in';
      const title = project.title || project.name || 'Untitled Project';
      const excerpt = project.excerpt || project.description || 'No description available.';
      const dateVal = project.date || new Date().toISOString().split('T')[0];
      const category = project.category || 'General';
      const displayTitle = title.length > 24 ? title.substring(0, 24) + '...' : title;
      
      card.innerHTML = `
        <div class="project-thumbnail" style="position: relative; overflow: hidden; height: 200px;">
          <div class="project-tag" style="z-index: 10;">${category}</div>
          <img src="${project.cover_image || project.image || 'assets/projects/proj-0.png'}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index: 5;" onError="this.style.display='none';" />
          <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: hsl(${project.hue || 217}, 45%, 12%);">
            <circle cx="200" cy="100" r="80" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.15" />
            <circle cx="200" cy="100" r="50" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.25" />
            <path d="M50 150 Q200 80 350 150" stroke="hsl(${project.hue || 217}, 80%, 60%)" stroke-width="3" fill="none" stroke-dasharray="10 5" />
            <text x="200" y="105" fill="white" font-size="14" text-anchor="middle" font-weight="600" font-family="sans-serif">${displayTitle}</text>
          </svg>
        </div>
        <div class="project-content">
          <h3 class="project-title">${title}</h3>
          <p class="project-excerpt">${excerpt}</p>
          <div class="project-footer">
            <span class="project-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${formatDate(dateVal)}
            </span>
            <button class="btn btn-outline view-details-btn" data-id="${project.id}" style="padding: 0.45rem 1rem; font-size: 0.8rem;">Read More</button>
          </div>
        </div>
      `;
      projectsGrid.appendChild(card);
    });

    // Add listeners to Detail Buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openProjectModal(id);
      });
    });
  }

  // Formatting Date Utility
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }

  // Filter Buttons Click Handling
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      renderProjects();
    });
  });

  // Search Input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProjects();
    });
  }

  // Open Detailed Modal
  function openProjectModal(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    modalTitle.innerText = project.title || project.name || 'Untitled Project';
    modalCategory.innerText = project.category || project.avenue || 'General';
    modalDate.innerText = formatDate(project.date || new Date().toISOString().split('T')[0]);
    modalImpact.innerText = project.impact || "N/A";
    modalDesc.innerText = project.description || project.full_description || project.excerpt || 'No description available.';

    // Draw modal hero background SVG based on theme color
    modalHero.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
        <img src="${project.cover_image || project.image || 'assets/projects/proj-0.png'}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index: 5;" onError="this.style.display='none';" />
        <svg width="100%" height="100%" viewBox="0 0 800 350" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: hsl(${project.hue || 217}, 45%, 8%); width: 100%; height: 100%;">
          <circle cx="400" cy="175" r="150" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.15" />
          <circle cx="400" cy="175" r="100" fill="hsl(${project.hue || 217}, 80%, 40%)" opacity="0.25" />
          <path d="M100 250 Q400 100 700 250" stroke="hsl(${project.hue || 217}, 80%, 65%)" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M150 270 Q400 150 650 270" stroke="hsl(${project.hue || 217}, 80%, 55%)" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="10 10" />
          <text x="400" y="185" fill="white" font-size="32" font-weight="800" text-anchor="middle" font-family="Poppins, sans-serif" opacity="0.8">PROJECT WARRIORS</text>
        </svg>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop page scroll
  }

  // Close Modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable page scroll
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside content area
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Initial Render
  loadProjectsFromAPI();
});

</script>
</body>
</html>
