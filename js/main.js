document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Common Components (Header & Footer)
  initHeader();
  initFooter();

  // 2. Navigation Scroll Shadow Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isActive = navMenu.classList.toggle('active');
      mobileToggle.innerHTML = isActive 
        ? `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.innerHTML = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }

  // 4. Smooth scroll handling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});

// Function to dynamically build the header
function initHeader() {
  const headerContainer = document.getElementById('site-header');
  if (!headerContainer) return;

  const currentPath = window.location.pathname;
  const isCalendar = currentPath.toLowerCase().includes('calendar');

  headerContainer.className = 'site-header';

  if (isCalendar) {
    // Specialized header for Calendar page (Home and Calendar only)
    headerContainer.innerHTML = `
      <div class="container nav-container">
        <a href="index.html" class="brand-logo">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: rotate 30s linear infinite">
            <circle cx="50" cy="50" r="45" stroke="#f9a825" stroke-width="6" fill="transparent" />
            <circle cx="50" cy="50" r="30" stroke="#d81b60" stroke-width="6" fill="transparent" />
            <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M82 18 L18 82" stroke="#0d47a1" stroke-width="4" />
            <circle cx="50" cy="50" r="15" fill="#f9a825" />
          </svg>
          <span>WARRIORS</span>
        </a>
        
        <ul class="nav-menu">
          <li><a href="index.html" class="nav-link">Home</a></li>
          <li><a href="calendar.html" class="nav-link active">Events Calendar</a></li>
        </ul>

        <button type="button" class="mobile-toggle" aria-label="Toggle Navigation">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  } else {
    // Standard header for other pages
    const getActive = (path) => currentPath.includes(path) ? 'active' : '';
    headerContainer.innerHTML = `
      <div class="container nav-container">
        <a href="index.html" class="brand-logo">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: rotate 30s linear infinite">
            <circle cx="50" cy="50" r="45" stroke="#f9a825" stroke-width="6" fill="transparent" />
            <circle cx="50" cy="50" r="30" stroke="#d81b60" stroke-width="6" fill="transparent" />
            <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M82 18 L18 82" stroke="#0d47a1" stroke-width="4" />
            <circle cx="50" cy="50" r="15" fill="#f9a825" />
          </svg>
          <span>WARRIORS</span>
        </a>
        
        <ul class="nav-menu">
          <li><a href="index.html" class="nav-link ${currentPath === '/' || currentPath.endsWith('index.html') ? 'active' : ''}">Home</a></li>
          <li><a href="about.html" class="nav-link ${getActive('about.html')}">About Us</a></li>
          <li><a href="projects.html" class="nav-link ${getActive('projects.html')}">Projects</a></li>
          <li><a href="calendar.html" class="nav-link ${getActive('calendar.html')}">Events Calendar</a></li>
          <li><a href="join.html" class="nav-link ${getActive('join.html')}">Join Us</a></li>
          <li><a href="admin.html" class="nav-link ${getActive('admin.html')}">Admin Portal</a></li>
          <li class="nav-actions-mobile" style="display:none;">
            <a href="join.html" class="btn btn-secondary" style="width:100%;">JOIN ROTARACT</a>
          </li>
        </ul>

        <div class="nav-actions">
          <a href="join.html" class="btn btn-secondary">JOIN US</a>
        </div>

        <button type="button" class="mobile-toggle" aria-label="Toggle Navigation">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }
}

// Function to dynamically build the footer
function initFooter() {
  const footerContainer = document.getElementById('site-footer');
  if (!footerContainer) return;

  footerContainer.className = 'site-footer';
  footerContainer.innerHTML = `
    <div class="container">
      <div class="footer-columns-grid" style="margin-bottom: 3rem;">
        <!-- Column 1: Rotary Logo -->
        <div class="footer-rotary-section">
          <svg width="150" height="50" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Rotary cogwheel -->
            <circle cx="30" cy="30" r="20" stroke="#f9a825" stroke-width="4" fill="transparent"/>
            <circle cx="30" cy="30" r="10" stroke="#f9a825" stroke-width="3" fill="transparent"/>
            <path d="M30 5 L30 55 M5 30 L55 30 M12 12 L48 48 M48 12 L12 48" stroke="#f9a825" stroke-width="2"/>
            <text x="65" y="38" fill="white" font-size="28" font-weight="bold" font-family="'Poppins', sans-serif">Rotary</text>
          </svg>
          <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 200px; margin-top: 0.5rem; line-height: 1.4;">Rotaract Bangalore Warriors, sponsored by Rotary Bangalore.</p>
        </div>

        <!-- Column 2: Rotary Links -->
        <div>
          <div class="footer-link-group-title">
            <span class="footer-link-group-title-icon">🔗</span>
            <span>Rotary Links</span>
          </div>
          <div style="display:flex; flex-direction:column;">
            <a href="https://www.rotary.org" class="footer-arrow-link" target="_blank" rel="noopener"><span>❯</span> Rotary.org</a>
            <a href="#" class="footer-arrow-link"><span>❯</span> Rotary Zones 4, 5, 6, 7 & 8</a>
            <a href="#" class="footer-arrow-link"><span>❯</span> Rotary Fellowship</a>
            <a href="#" class="footer-arrow-link"><span>❯</span> Rotary Blog</a>
          </div>
        </div>

        <!-- Column 3: Quick Links -->
        <div>
          <div class="footer-link-group-title">
            <span class="footer-link-group-title-icon">⚡</span>
            <span>Quick Links</span>
          </div>
          <div style="display:flex; flex-direction:column;">
            <a href="index.html" class="footer-arrow-link"><span>❯</span> Home</a>
            <a href="about.html" class="footer-arrow-link"><span>❯</span> District Committee</a>
            <a href="projects.html" class="footer-arrow-link"><span>❯</span> Clubs Finder</a>
            <a href="projects.html" class="footer-arrow-link"><span>❯</span> Club Projects</a>
          </div>
        </div>

        <!-- Column 4: Social Media Links -->
        <div>
          <div class="footer-link-group-title">
            <span class="footer-link-group-title-icon">📢</span>
            <span>Social Media Links</span>
          </div>
          <div style="display:flex; flex-direction:column;">
            <a href="#" class="footer-arrow-link"><span>❯</span> Facebook</a>
            <a href="#" class="footer-arrow-link"><span>❯</span> Twitter / X</a>
            <a href="#" class="footer-arrow-link"><span>❯</span> Instagram</a>
            <a href="#" class="footer-arrow-link"><span>❯</span> Linkedin</a>
          </div>
        </div>

        <!-- Column 5: Change Banner Card -->
        <div class="footer-change-banner" style="border-radius:12px; overflow:hidden;">
          <p>Together, we</p>
          <h3>Create Change</h3>
          <!-- Hands silhouettes SVG -->
          <svg width="120" height="50" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.35; margin-top: 0.5rem;">
            <path d="M10 45 Q25 30 40 45 T70 45 T100 45" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <circle cx="25" cy="22" r="6" fill="white"/>
            <circle cx="55" cy="22" r="6" fill="white"/>
            <circle cx="85" cy="22" r="6" fill="white"/>
          </svg>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">&copy; 2026 Rotaract Club of Bangalore Warriors. Sponsoring Sponsor: Rotary Bangalore. All rights reserved.</p>
        <div class="footer-socials">
          <a href="#" class="footer-social-link" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" class="footer-social-link" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" class="footer-social-link" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}
