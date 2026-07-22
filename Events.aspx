<!doctype html>
<html lang="en">
<head>
  <script src="js/under-construction.js"></script>
  <script src="js/udaya-celebration.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/x-icon" href="assets/favicon/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16x16.png" />
  <title>Club Events | Rotaract Bangalore Warriors</title>
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
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Header scroll animation
      var header = document.querySelector('.site-header');
      window.addEventListener('scroll', function() {
        if (window.scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });

      // Mobile toggle button handler
      var toggle = document.querySelector('.mobile-toggle');
      var mobileNav = document.querySelector('.mobile-nav');
      if (toggle && mobileNav) {
        toggle.addEventListener('click', function() {
          var isOpen = !mobileNav.classList.contains('hidden');
          mobileNav.classList.toggle('hidden', isOpen);
          toggle.querySelector('.icon-menu').classList.toggle('hidden', !isOpen);
          toggle.querySelector('.icon-x').classList.toggle('hidden', isOpen);
        });
      }

      // ============================ CONFETTI BLAST ANIMATION ============================
      var canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);

      var ctx = canvas.getContext('2d');
      var particles = [];
      
      // Gold and multi-colored celebration colors mixed
      var colors = ['#FFD700', '#F59E0B', '#D4AF37', '#B8860B', '#8B003A', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FFFFFF'];

      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      var duration = 10000; // 10 seconds
      var animationEnd = Date.now() + duration;

      function spawnConfetti(x, y, count) {
        for (var i = 0; i < count; i++) {
          particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2.2, // horizontal drift
            vy: 1.2 + Math.random() * 2.2,   // gentle downward speed
            size: 6 + Math.random() * 9,     // size of paper sheet
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rSpeed: (Math.random() - 0.5) * 0.08, // slow rotation
            opacity: 1
          });
        }
      }

      // Initial golden papers scattered across the top of the screen width
      setTimeout(function() {
        for (var i = 0; i < 45; i++) {
          spawnConfetti(Math.random() * canvas.width, -20, 1);
        }
        animate();
      }, 300);

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        var timeLeft = animationEnd - Date.now();

        // Spawn golden paper all over the top screen width continuously for 10 seconds
        if (timeLeft > 0) {
          if (Math.random() < 0.45) {
            spawnConfetti(Math.random() * canvas.width, -20, Math.floor(Math.random() * 2) + 1);
          }
        }

        var active = false;
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          if (p.opacity <= 0) continue;
          
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          // Apply wavy horizontal flutter drift
          p.vx += Math.sin(Date.now() / 250 + i) * 0.03;
          p.vy += 0.02; // very low gravity
          if (p.vy > 3) p.vy = 3; // terminal velocity

          p.rotation += p.rSpeed;
          p.opacity -= 0.005; // fade out slowly over time

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          
          if (i % 3 === 0) {
            // Rectangle sheets
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
          } else if (i % 3 === 1) {
            // Square sheets
            ctx.fillRect(-p.size / 2.5, -p.size / 2.5, p.size * 0.8, p.size * 0.8);
          } else {
            // Circular sparkles
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        if (active || timeLeft > 0) {
          requestAnimationFrame(animate);
        } else {
          canvas.remove();
        }
      }
    });
  </script>
</head>
<body class="flex min-h-screen flex-col bg-white">

  <!-- ============================ HEADER / TOP NAV ============================ -->
  <header class="site-header sticky top-0 z-[1000] w-full shrink-0 flex items-center border-b border-transparent">
    <div class="relative flex h-full w-full items-center justify-between px-10">
      
      <!-- Left Logo Branding -->
      <a href="index.html" class="relative z-[2] flex h-full shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]">
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

      <!-- Center Navigation (Home and Events only) -->
      <nav class="main-nav relative z-[2] mx-4 hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex">
        <a href="index.html" data-label="Home" class="relative py-1 text-[15px] font-semibold text-slate-655 hover:text-[#8B003A] transition font-display">Home</a>
        <a href="Events.html" data-label="Events" class="relative py-1 text-[15px] font-bold text-[#8B003A] border-b-2 border-[#8B003A] transition font-display">Events</a>
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
        <li><a href="Events.html" class="block w-fit text-[17px] text-[#8B003A]">Events</a></li>
      </ul>
    </nav>
  </header>

  <!-- ================================ PAGE CONTENT ================================ -->
  <main class="flex-grow flex items-center justify-center bg-gradient-to-b from-[#8B003A]/5 to-[#f0f9ff]/50 relative overflow-hidden py-24 min-h-[calc(100vh-250px)]">
    
    <!-- Background patterns -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#8B003A]/10 via-transparent to-transparent pointer-events-none"></div>

    <div class="max-w-xl px-6 text-center z-10">
      
      <!-- Generated Lion Mascot Character -->
      <div class="flex justify-center mb-8">
        <div class="relative w-44 h-44 bg-white border border-[#8B003A]/10 rounded-[32px] overflow-hidden shadow-lg hover:scale-105 transition duration-300 animate-bounce">
          <img src="assets/img/illustrations/warrior_lion_mascot.png" alt="Warrior Lion Mascot" class="w-full h-full object-cover" />
        </div>
      </div>

      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight font-display">
        I KNOW YOUR EGGAR TO SEE
      </h1>
      
      <p class="text-amber-600 font-display font-extrabold tracking-widest text-sm uppercase mt-6 mb-8 pl-3 border-l-4 border-amber-500">
        KINDLY WAIT WITH PATIENCE
      </p>

      <div class="inline-flex items-center gap-2 rounded-2xl bg-[#8B003A] px-8 py-4 text-sm font-black text-white shadow-xl hover:scale-[1.03] transition duration-300">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
        UPDATE COMING SOON
      </div>

    </div>
  </main>

  <!-- ============================ FOOTER (COPYRIGHT ONLY) ============================ -->
  <footer class="relative border-t border-[#8B003A]/10 bg-[#bae6fd] py-6 z-10 font-sans text-xs shrink-0">
    <div class="mx-auto max-w-[1400px] px-6 text-center text-slate-700 font-semibold flex items-center justify-center gap-1.5 flex-wrap">
      <span>© Copy Right 2026 All Rights Reserved. ❤️ Designed & Managed by</span>
      <a href="#" class="text-[#8B003A] font-black tracking-wide relative group py-0.5">
        N LATHIESH
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B003A] transition-all duration-300 group-hover:w-full"></span>
      </a>
    </div>
  </footer>

</body>
</html>