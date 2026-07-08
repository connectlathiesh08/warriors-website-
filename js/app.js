/* ==========================================================================
   Rotary District 3011 — shared chrome behaviour (vanilla port of TopNav.tsx,
   YearSelect.tsx, VisitorCount.tsx). No framework. Runs on every page.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     1. Slot-machine nav reels — build the per-letter reel markup from the
        plain label so the .slot-* CSS hover animation works (TopNav §2.6).
        Each .slot-link carries data-label="HOME".
     ---------------------------------------------------------------------- */
  function buildSlotReels() {
    document.querySelectorAll('.slot-link[data-label]').forEach(function (link) {
      if (link.querySelector('.slot-text')) return; // already built
      var label = link.getAttribute('data-label');
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = label;

      var text = document.createElement('span');
      text.className = 'slot-text';
      text.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < label.length; i++) {
        var ch = label[i] === ' ' ? '\u00A0' : label[i];
        var col = document.createElement('span');
        col.className = 'slot-col';
        var reel = document.createElement('span');
        reel.className = 'slot-reel';
        reel.style.setProperty('--d', i * 45 + 'ms');
        for (var k = 0; k < 4; k++) {
          var s = document.createElement('span');
          s.textContent = ch;
          reel.appendChild(s);
        }
        col.appendChild(reel);
        text.appendChild(col);
      }
      // Insert reels + sr-only label before any trailing caret svg.
      var caret = link.querySelector('svg');
      link.insertBefore(sr, caret || null);
      link.insertBefore(text, caret || null);
    });
  }

  /* ----------------------------------------------------------------------
     2. Active nav state — match <body data-page> against link data-nav.
     ---------------------------------------------------------------------- */
  var DESKTOP_ACTIVE = ['font-bold', 'text-white'];
  var DESKTOP_IDLE = ['font-bold', 'text-[#8B003A]', 'hover:text-[#8B003A]/80'];

  function navFromUrl() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!file || file === 'index.html' || file === 'default.aspx' || file === 'home.aspx') return 'home';
    if (file.indexOf('about') === 0) return 'about';
    if (file.indexOf('districtcommittee') === 0 || file.indexOf('director') === 0) return 'district-committee';
    if (file.indexOf('clubservice') === 0) return 'club-service';
    if (file.indexOf('clubfinder') === 0 || file.indexOf('club') === 0) return 'club-finder';
    if (file.indexOf('calendar') === 0) return 'calendar';
    if (file.indexOf('projects') === 0) return 'club-projects';
    if (file.indexOf('newsletters') === 0) return 'newsletters';
    return 'home';
  }

  // Reveal the (default-hidden) "About Us" nav link only for districts that have
  // About content configured (/website-data/about). Re-applies active state + the
  // magic pill once the link appears.
  function hydrateAboutLink(districtId) {
    if (!window.RotaryAPI || !RotaryAPI.get) return;
    RotaryAPI.get('/api/districts/' + (districtId || RotaryAPI.config.districtId) + '/website-data/about')
      .then(function (rows) {
        var items = (rows && rows.items) ? rows.items : (Array.isArray(rows) ? rows : []);
        var has = items.some(function (x) {
          return (x.isActive === undefined || x.isActive) && (x.content || x.Content);
        });
        if (!has) return;
        document.querySelectorAll('.about-nav-link').forEach(function (el) { el.style.display = ''; });
        applyActiveState();
        positionPill();
      })
      .catch(function () {});
  }

  function applyActiveState() {
    var page = document.body.getAttribute('data-page') || navFromUrl();
    document.querySelectorAll('.main-nav a.slot-link[data-nav]').forEach(function (a) {
      var active = a.getAttribute('data-nav') === page;
      (active ? DESKTOP_ACTIVE : DESKTOP_IDLE).forEach(function (c) {
        a.classList.toggle(c, true);
      });
      // remove the opposite set
      (active ? DESKTOP_IDLE : DESKTOP_ACTIVE).forEach(function (c) {
        a.classList.remove(c);
      });
      if (active) a.setAttribute('data-active', 'true');
    });
    // Mobile plain links active colour.
    document.querySelectorAll('.mobile-nav a.slot-link[data-nav]').forEach(function (a) {
      var active = a.getAttribute('data-nav') === page;
      a.classList.toggle('underline', active);
      a.classList.toggle('text-[#8B003A]', true);
    });
  }

  /* ----------------------------------------------------------------------
     3. Desktop "magic pill" — slide a pill behind the active nav item.
     ---------------------------------------------------------------------- */
  function positionPill() {
    var nav = document.querySelector('.main-nav');
    var pill = document.querySelector('.nav-pill');
    if (!nav || !pill) return;
    var active = nav.querySelector('a.slot-link[data-active="true"]');
    if (!active) {
      pill.style.opacity = '0';
      return;
    }
    pill.style.left = active.offsetLeft + 'px';
    pill.style.top = active.offsetTop + 'px';
    pill.style.width = active.offsetWidth + 'px';
    pill.style.height = active.offsetHeight + 'px';
    pill.style.opacity = '1';
  }

  /* ----------------------------------------------------------------------
     4. Mobile menu toggle + single-open accordion.
     ---------------------------------------------------------------------- */
  function wireMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!toggle || !menu) return;
    var iconMenu = toggle.querySelector('.icon-menu');
    var iconX = toggle.querySelector('.icon-x');

    function setOpen(open) {
      menu.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (iconMenu) iconMenu.classList.toggle('hidden', open);
      if (iconX) iconX.classList.toggle('hidden', !open);
    }
    toggle.addEventListener('click', function () {
      setOpen(menu.classList.contains('hidden'));
    });

    // Sub-accordion (only one open).
    menu.querySelectorAll('.mobile-sub-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sub = btn.nextElementSibling;
        var caret = btn.querySelector('svg');
        var isOpen = sub && !sub.classList.contains('hidden');
        // close all
        menu.querySelectorAll('.mobile-sub').forEach(function (s) {
          s.classList.add('hidden');
        });
        menu.querySelectorAll('.mobile-sub-toggle svg').forEach(function (c) {
          c.classList.remove('rotate-180');
        });
        if (sub && !isOpen) {
          sub.classList.remove('hidden');
          if (caret) caret.classList.add('rotate-180');
          btn.setAttribute('aria-expanded', 'true');
        } else if (btn) {
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Any leaf link closes the whole menu.
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. Year select — persist across page loads (localStorage).
     ---------------------------------------------------------------------- */
  // Session-scoped so a fresh visit always defaults to the CURRENT Rotary year;
  // within a session the choice persists across page-to-page navigation.
  var YEAR_KEY = 'rid-year';
  function wireYearSelect() {
    var sel = document.querySelector('.year-select');
    if (!sel) return;
    // Changing the year stores the choice (short label, e.g. "2024-25") and
    // reloads, so every page re-fetches for that year — client.js ready() reads
    // this and sets config.yearId/yearLabel BEFORE any data is fetched.
    sel.addEventListener('change', function () {
      var m = /^(\d{4})-(\d{4})$/.exec(sel.value); // "2024-2025" -> "2024-25"
      var shortLbl = m ? m[1] + '-' + m[2].slice(2) : sel.value;
      try {
        sessionStorage.setItem(YEAR_KEY, shortLbl);
      } catch (e) {}
      window.location.reload();
    });
  }

  // Immediately point the year dropdown at the TRUE current Rotary year (computed
  // from today's date) — or the user's remembered choice — before the API resolves.
  // This removes any flash of last year's label and keeps the selection correct even
  // if the live year list is slow or unavailable. buildYearOptions() later rebuilds
  // the full option list from the live API. No hardcoded year is involved.
  function presetYearSelect() {
    var sel = document.querySelector('.year-select');
    if (!sel) return;
    var pick = null;
    try { pick = sessionStorage.getItem(YEAR_KEY); } catch (e) {}
    if (!pick && window.RotaryAPI && RotaryAPI.currentRotaryYearLabel) {
      pick = RotaryAPI.currentRotaryYearLabel();
    }
    if (!pick) return;
    var has = Array.prototype.some.call(sel.options, function (o) { return o.value === pick; });
    if (!has) {
      var opt = document.createElement('option');
      opt.value = pick;
      opt.textContent = pick;
      sel.appendChild(opt);
    }
    sel.value = pick;
  }

  /* ----------------------------------------------------------------------
     7. Chrome-wide API hydration — the ContactStrip (email/phone) and the
        YearSelect options live in Site.Master, so hydrate them here for EVERY
        page. Progressive enhancement: static fallbacks already render.
     ---------------------------------------------------------------------- */
  function toLongYear(lbl) {
    var m = /^(\d{4})-(\d{2})$/.exec(lbl || '');
    return m ? m[1] + '-' + m[1].slice(0, 2) + m[2] : lbl;
  }
  function hydrateChrome() {
    if (!window.RotaryAPI) return;

    // Multi-tenant: once the subdomain's district is resolved, reflect it in the
    // page title and any district-name slots (logo image stays the Rotary mark).
    if (RotaryAPI.ready) {
      RotaryAPI.ready().then(function () {
        var cfg = RotaryAPI.config || {};
        var name = cfg.districtName;
        if (name) {
          document.title = name;
          document.querySelectorAll('.district-name').forEach(function (el) {
            el.textContent = name;
          });
          document.querySelectorAll('[data-district-alt]').forEach(function (el) {
            el.setAttribute('alt', name);
          });
        }
        // Fill any "District <NNNN>" slots with the resolved district number.
        if (cfg.districtNumber) {
          document.querySelectorAll('.district-number').forEach(function (el) {
            el.textContent = cfg.districtNumber;
          });
        }
        // Swap the neutral Rotary logo for the district's own logo once the
        // backend provides one (empty for every district today → stays neutral).
        if (cfg.districtLogo) {
          var lp = cfg.districtLogo;
          var url = /^https?:\/\//.test(lp)
            ? lp
            : (cfg.mediaBase || '') + (lp.charAt(0) === '/' ? '' : '/') + lp;
          document.querySelectorAll('[data-district-logo]').forEach(function (el) {
            el.src = url;
            if (name) el.alt = name;
          });
        }
        // "About Us" nav link is hidden by default and only revealed for districts
        // that actually have About content configured.
        hydrateAboutLink(cfg.districtId);
      });
    }

    // Year selector — a fixed window around the CURRENT Rotary year (previous 10
    // + next 5 = 16 options, newest first). The option that's pre-selected is the
    // year the data is ACTUALLY showing (config.yearLabel = selected-or-current,
    // resolved by client.js ready()), so the dropdown and the data never disagree.
    function buildYearOptions() {
      var sel = document.querySelector('.year-select');
      if (!sel) return;
      var cfg = RotaryAPI.config || {};
      // Date-derived current Rotary year (Jul 1 – Jun 30) as the ultimate fallback,
      // so nothing here is ever pinned to a hardcoded/stale year.
      var curYear = (RotaryAPI.currentRotaryYearLabel && RotaryAPI.currentRotaryYearLabel()) || '';
      var shown = cfg.yearLabel || cfg.currentYearLabel || curYear; // short form e.g. "2026-27"
      var m = /^(\d{4})/.exec(cfg.currentYearLabel || cfg.yearLabel || curYear || '');
      var cur = m ? parseInt(m[1], 10) : new Date().getFullYear();
      // Build ONLY from the real Rotary years the API actually knows, so the option
      // VALUE is the exact API label (e.g. "2026-27"). client.js ready() matches that
      // label directly, so the selected year ALWAYS takes effect — no string-format
      // drift, and we never offer a year the API can't resolve. Window: current-10 ..
      // current+1, so the upcoming year is selectable and correctly shows BLANK when it
      // has no data yet (never the previous year's data).
      var opts = (cfg.years || [])
        .filter(function (y) {
          var mm = /^(\d{4})-\d{2}$/.exec(y.yearLabel || '');
          if (!mm) return false;
          var yy = parseInt(mm[1], 10);
          return yy >= cur - 10 && yy <= cur + 1;
        })
        .sort(function (a, b) { return parseInt(b.yearLabel, 10) - parseInt(a.yearLabel, 10); });
      if (!opts.length) return; // API years unavailable -> keep the static fallback options
      sel.innerHTML = '';
      opts.forEach(function (y) {
        var opt = document.createElement('option');
        opt.value = y.yearLabel;       // EXACT API label
        opt.textContent = y.yearLabel;
        if (y.yearLabel === shown) { opt.selected = true; opt.setAttribute('selected', 'selected'); }
        sel.appendChild(opt);
      });
      sel.value = shown;
    }
    if (RotaryAPI.ready) {
      RotaryAPI.ready().then(buildYearOptions);
    } else {
      buildYearOptions();
    }

    // Contact details are YEAR-SPECIFIC (each Rotary year's DG has their own
    // email/phone — e.g. 2025-26 vs 2026-27 differ). Wait for the tenant/year to
    // resolve so config.yearId is the SELECTED year, request that year, and fall
    // back to the current year's contact only if the selected year has none.
    RotaryAPI.ready()
      .then(function () {
        var cfg = RotaryAPI.config;
        function fetchContact(yearId) {
          return RotaryAPI.get('/api/districts/' + cfg.districtId + '/website-data/contact-details', { yearId: yearId })
            .then(function (rows) { return (rows && rows[0]) || null; });
        }
        // No year-fallback: show ONLY the selected year's contact (blank if that
        // year has none), so a future/empty year never displays the previous
        // year's DG email/phone.
        return fetchContact(cfg.yearId);
      })
      .then(function (c) {
        var em = document.querySelector('.contact-email');
        var emt = document.querySelector('.contact-email-text');
        var ph = document.querySelector('.contact-phone');
        var pht = document.querySelector('.contact-phone-text');
        var email = c && c.email, phone = c && c.phone;
        // Hide a chip entirely when that detail isn't configured for the
        // district/year (e.g. demo districts like 5656) rather than showing an
        // empty icon-only chip.
        if (em) { em.classList.toggle('hidden', !email); if (email) { em.href = 'mailto:' + email; if (emt) emt.textContent = email; } }
        if (ph) { ph.classList.toggle('hidden', !phone); if (phone) { ph.href = 'tel:' + phone; if (pht) pht.textContent = phone; } }
      })
      .catch(function () {});

    hydrateSocialLinks();
  }

  /* Footer social media links — live from the district's social-links endpoint
     (the API returns [{ platform, linkUrl, isActive }]). Renders one icon row
     per active platform; hides the list entirely if none are configured. */
  var SOCIAL_ICONS = {
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    twitter: '<path d="M4 4l11.5 16h4.5l-11.5 -16z"/><path d="M4 20l6.5 -7.5"/><path d="M13.5 11l6.5 -7"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9"/>',
    website: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  };
  function socialLabel(platform) {
    var p = String(platform || '').toLowerCase();
    if (p === 'twitter') return 'Twitter / X';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }
  function hydrateSocialLinks() {
    var list = document.querySelector('[data-footer-social]');
    if (!list) return;
    RotaryAPI.get('/api/districts/' + RotaryAPI.config.districtId + '/website-data/social-links')
      .then(function (rows) {
        var links = (rows || []).filter(function (r) {
          return (r.isActive === undefined || r.isActive) && (r.linkUrl || r.url);
        });
        if (!links.length) {
          list.innerHTML = '';
          return;
        }
        list.innerHTML = links
          .map(function (r) {
            var platform = String(r.platform || '').toLowerCase();
            var url = r.linkUrl || r.url;
            var paths = SOCIAL_ICONS[platform] || SOCIAL_ICONS.website;
            var fillRule = platform === 'instagram' ? 'fill="none"' : 'fill="none"';
            return (
              '<li><a href="' + url + '" target="_blank" rel="noopener noreferrer" ' +
              'class="flex items-center gap-2.5 text-sm text-white/85 transition-colors hover:text-white">' +
              '<svg class="h-4 w-4" viewBox="0 0 24 24" ' + fillRule + ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              paths + '</svg>' + socialLabel(platform) + '</a></li>'
            );
          })
          .join('');
      })
      .catch(function () {
        list.innerHTML = '';
      });
  }

  /* ---------------------------------------------------------------------- */
  function init() {
    // Local environment compatibility: rewrite .aspx links to .html for local testing
    if (window.location.protocol === 'file:' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      document.querySelectorAll('a[href]').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href) {
          if (href.toLowerCase() === 'default.aspx') {
            a.setAttribute('href', 'index.html');
          } else if (href.toLowerCase().endsWith('.aspx')) {
            a.setAttribute('href', href.replace(/\.aspx$/i, '.html'));
          }
        }
      });
    }

    buildSlotReels();
    applyActiveState();
    wireMobileMenu();
    wireYearSelect();
    presetYearSelect();
    hydrateChrome();
    // Pill needs layout + fonts settled.
    positionPill();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(positionPill);
    }
    window.addEventListener('resize', positionPill);
    window.addEventListener('load', positionPill);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
