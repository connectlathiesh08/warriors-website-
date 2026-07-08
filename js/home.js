/* home.js — Home page orchestrator. Mounts the hero carousels, dignitary
   tickets, CircularGallery (Our Projects), DomeGallery (Photo Gallery) + lightbox,
   scroll reveals and smooth scrolling.

   Data is LIVE and district-specific: "Our Projects" / "Photo Gallery" come from
   the district avenue-of-service report + each project's primary photo, and the
   hero from the district banners endpoint. Cross-origin images are routed through
   /MediaProxy.ashx so they are SAME-ORIGIN — required for the WebGL galleries,
   which otherwise taint the canvas and render black. The bundled assets below are
   kept only as a fallback if the API is unreachable. */
// import { initHeroCarousel } from './effects/hero-carousel.js?v=3';
// import { initReveals } from './effects/reveal.js?v=3';
// import { initSmoothScroll, stopScroll, startScroll } from './effects/smooth-scroll.js?v=3';

/* ------------------- banner / ad DEFAULTS (mirror the legacy site) -------------------
   Shown when the district has no uploaded banner / advertisements. Neutral,
   Rotary-branded (never another district's media), so they're safe on every tenant.
   Drop-in replaceable: swap assets/img/banner-default.png or ad-default.png. */
// Main banner default — the neutral Rotary banner (legacy "Bannersdumy").
var fallbackHero = [{ image: 'assets/img/banner-default.png', alt: 'Rotary' }];
// Ad-slot default — the Rotary "Four-Way Test" card (legacy "ClubAdvirtisment"),
// so the 30% ad column is never empty when a district has no advertisements.
var fallbackAds = [{ image: 'assets/img/ad-default.png', alt: 'Rotary — The Four-Way Test' }];
var fallbackWebGallery = [
  { image: 'assets/projects/proj-0.png', title: 'Youth Care Initiative' },
  { image: 'assets/projects/proj-1.png', title: 'Community Support Drive' },
  { image: 'assets/projects/proj-2.png', title: 'Food Distribution Camp' },
  { image: 'assets/projects/proj-3.png', title: 'Warriors Fellowship Meet' },
  { image: 'assets/projects/proj-4.png', title: 'Skill Development Workshop' },
  { image: 'assets/projects/proj-5.png', title: 'Volunteering Leadership Camp' },
  { image: 'assets/projects/proj-6.png', title: 'Cleanliness Awareness Drive' },
  { image: 'assets/projects/proj-7.png', title: 'Rural Development Project' },
  { image: 'assets/projects/proj-8.png', title: 'Education for Everyone' },
  { image: 'assets/projects/proj-9.png', title: 'Free Medical Checkup' },
  { image: 'assets/projects/proj-10.png', title: 'Primary Child Healthcare' },
  { image: 'assets/projects/proj-0.png', title: 'Green Sphere Afforestation' },
  { image: 'assets/projects/proj-1.png', title: 'Blood Donation Camp' },
  { image: 'assets/projects/proj-2.png', title: 'Annadhan Food Drive' },
  { image: 'assets/projects/proj-3.png', title: 'Warrior Lion Mascot Launch' },
  { image: 'assets/projects/proj-4.png', title: 'Literacy Kit Distribution' },
  { image: 'assets/projects/proj-5.png', title: 'Vocal Music Workshop' },
  { image: 'assets/projects/proj-6.png', title: 'Lake Cleaning Campaign' },
  { image: 'assets/projects/proj-7.png', title: 'Youth Leadership Camp' },
  { image: 'assets/projects/proj-8.png', title: 'Digital Literacy for Seniors' }
];
var fallbackProjects = fallbackWebGallery.map(function (p) {
  return { image: p.image, text: p.title };
});
var fallbackGallery = fallbackWebGallery.map(function (p) {
  return { src: p.image, alt: p.title };
});

// Defaults shown immediately; hydrate() overwrites with the SELECTED year's real RI
// President (year-specific from the API) and District Governor (current-year row).
var dignitaries = [
  {
    name: 'Francesco Arezzo',
    role: 'President',
    term: 'Rotary International 2025-26',
    club: '',
    photo:
      'https://rotaryindia.org/Documents/WebsiteData/International_President/PRESIDENT160620251053175875643AM.png',
  },
  {
    name: 'District Governor',
    role: 'District Governor',
    term: '2025-26',
    club: '',
    photo: '',
  },
];

/* ------------------------------ media helpers ------------------------------ */
function resolveMedia(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  var base = (window.RotaryAPI && RotaryAPI.config.mediaBase) || 'https://rizones4567.org/API';
  if (path.charAt(0) === '/') return base + path;
  return base + '/' + path;
}
// Route an API media path through the same-origin proxy so WebGL can use it.
function mediaProxy(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) {
    try {
      var u = new URL(path);
      path = u.pathname + (u.search || '');
    } catch (e) {}
  }
  if (path.charAt(0) !== '/') path = '/' + path;
  return 'MediaProxy.ashx?path=' + encodeURIComponent(path);
}
function projectIdFromUrl(u) {
  var m = /\/project\/(\d+)/.exec(u || '');
  return m ? m[1] : null;
}
// Resolve true/false once we know whether an image URL actually loads.
function probeImage(url) {
  return new Promise(function (resolve) {
    var img = new Image();
    var done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      resolve(ok);
    }
    img.onload = function () { finish(true); };
    img.onerror = function () { finish(false); };
    img.src = url;
    setTimeout(function () { finish(false); }, 6000);
  });
}

/* ----------------------- live "Our Projects" / gallery ----------------------- */
// Resolve up to `limit` newest project photos for ONE specific year. Returns
// [{ id, title, image, year }] (possibly empty). The avenue feed AND each
// project-photo lookup MUST use the SAME year: project ids are reused per year,
// so resolving a photo with a different yearId returns an unrelated project.
function loadProjectsForYear(yearId, limit) {
  if (!window.RotaryAPI || !RotaryAPI.districtProjects) return Promise.resolve([]);
  return RotaryAPI.districtProjects({ yearId: yearId })
    .then(function (rows) {
      rows = rows || [];
      rows.sort(function (a, b) {
        return new Date(b.projectDate || 0) - new Date(a.projectDate || 0);
      });
      var picks = [];
      var seen = {};
      for (var i = 0; i < rows.length && picks.length < limit; i++) {
        // Exclude "Club Service" (internal club administration, e.g. BOD meetings) from
        // the showcase galleries — same rule as the home Projects count.
        if (String(rows[i].moduleKey || '').trim().toLowerCase() === 'club_service') continue;
        var id = projectIdFromUrl(rows[i].publicPhotoUrl);
        if (id && !seen[id] && rows[i].title) {
          seen[id] = 1;
          picks.push({ id: id, title: rows[i].title });
        }
      }
      if (!picks.length) return [];
      return Promise.all(
        picks.map(function (p) {
          return RotaryAPI.publicProject(p.id, yearId)
            .then(function (d) {
              var photos = (d && d.photos) || [];
              var primary = photos.filter(function (x) { return x.isPrimary; })[0] || photos[0];
              var ip = primary && (primary.imagePath || primary.ImagePath);
              if (!ip) return null;
              return { id: p.id, title: p.title, image: mediaProxy(ip), year: yearId };
            })
            .catch(function () { return null; });
        })
      ).then(function (list) {
        return list.filter(Boolean);
      });
    })
    .catch(function () { return []; });
}

// Year-walk for the galleries: the PREVIOUS years only (strictly older than the
// SELECTED year), newest→oldest. "Our Projects" + "Photo Gallery" deliberately show
// the PREVIOUS year's projects, NEVER the current/selected year (which is typically
// new/sparse) — the rest of the home page stays on the current year. The current
// year is excluded entirely from this list.
function buildYearWalk(cfg) {
  var sel = String(cfg.yearLabel || '');
  return (cfg.years || [])
    .filter(function (y) { return /^\d{4}-\d{2}$/.test(y.yearLabel || '') && String(y.yearLabel) < sel; })
    .sort(function (a, b) { return String(b.yearLabel).localeCompare(String(a.yearLabel)); })
    .map(function (y) { return y.id; });
}

// Pull project photos for the galleries from the PREVIOUS year (see buildYearWalk).
// Returns [{ id, title, image, year }], or null when no previous year has any photo.
// project ids are reused per year, so each photo is resolved with the SAME year it
// came from.
function loadLiveProjects(limit) {
  var cfg = window.RotaryAPI && RotaryAPI.config;
  if (!cfg || cfg.yearId == null) return Promise.resolve(null);
  var years = buildYearWalk(cfg);
  // Walk the previous years newest→oldest; the FIRST that has any projects wins
  // ENTIRELY — never mix two years in one gallery. The current/selected year is never
  // in this list, so the galleries always show a PREVIOUS year.
  function step(i) {
    if (i >= years.length) return Promise.resolve(null);
    return loadProjectsForYear(years[i], limit).then(function (list) {
      if (list && list.length) return list;
      return step(i + 1);
    });
  }
  return step(0);
}

// The per-YEAR Rotary theme banner. When a district has no uploaded banner for the
// selected year, we show that year's theme image instead of the generic default.
// Drop images here named by the EXACT Rotary year label, e.g.:
//   assets/img/themes/2025-26.png   assets/img/themes/2026-27.png
function themeBannerUrl() {
  var lbl = (window.RotaryAPI && RotaryAPI.config && RotaryAPI.config.yearLabel) || '';
  return lbl ? 'assets/img/themes/' + lbl + '.png' : '';
}

// Hero: show the district's uploaded banners for the selected year whenever banner
// RECORDS exist. When there are none, fall back to the YEAR THEME banner (if an
// image exists for that year) and finally to the generic default — so it's never a
// broken image, and never another year's banner.
function loadHeroSlides() {
  if (!window.RotaryAPI || !RotaryAPI.get) return Promise.resolve(fallbackHero);

  // Resolve the best "no real banner" fallback up front: this year's theme image
  // if one is present, else the generic default. probeImage avoids broken images.
  var themeUrl = themeBannerUrl();
  var fallbackP = themeUrl
    ? probeImage(themeUrl).then(function (ok) {
        return ok ? [{ image: themeUrl, alt: 'Rotary theme', fallback: fallbackHero[0].image }] : fallbackHero;
      })
    : Promise.resolve(fallbackHero);

  // _t cache-buster: the banner LIST is fetched through ApiProxy.ashx (server
  // memory cache up to ~1h stale) and the browser caches it 300s, so a banner just
  // uploaded in admin could stay invisible for minutes. The unique _t makes the
  // proxy cache key + browser URL change every load, so the freshest list is used
  // (the upstream API ignores the unknown param; the banner JSON is tiny).
  var bannersP = RotaryAPI.get('/api/districts/' + RotaryAPI.config.districtId + '/website-data/banners', { yearId: RotaryAPI.config.yearId, _t: Date.now() })
    .catch(function () { return []; });

  return Promise.all([bannersP, fallbackP]).then(function (r) {
    var rows = r[0], fb = r[1];
    var banners = (rows || [])
      .map(function (b) { return b.bannerImagePath || b.BannerImagePath; })
      .filter(Boolean);
    if (!banners.length) return fb; // no uploaded banner this year -> theme (or default)
    // Resolve each banner to a URL that ACTUALLY loads, probing in order: the
    // legacy website-group path (works for mapped districts' existing banners),
    // then the API's own path via the proxy (a freshly uploaded banner lives there,
    // not yet synced to the legacy folder), then the theme/default. This stops a
    // newly uploaded banner from silently dropping to the dummy when it isn't at
    // the legacy location.
    return Promise.all(banners.map(function (b) {
      var candidates = [];
      var legacy = (RotaryAPI.bannerUrl && RotaryAPI.bannerUrl(b)) || '';
      if (legacy) candidates.push(legacy);
      candidates.push(mediaProxy(b));
      return (function pick(i) {
        if (i >= candidates.length) return { image: fb[0].image, alt: 'District banner', fallback: fb[0].image };
        return probeImage(candidates[i]).then(function (ok) {
          return ok
            ? { image: candidates[i], alt: 'District banner', fallback: fb[0].image }
            : pick(i + 1);
        });
      })(0);
    }));
  });
}

/* ------------------------- dignitary tickets ------------------------- */
function userGlyph() {
  return (
    '<span class="flex h-full w-full items-center justify-center text-white/90">' +
    '<svg class="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
    '</span>'
  );
}
function buildDignitaries() {
  var grid = document.querySelector('.dignitaries-grid');
  if (!grid) return;
  grid.innerHTML = '';
  dignitaries.forEach(function (d, i) {
    var art = document.createElement('article');
    art.className =
      'relative flex min-h-[156px] rounded-2xl bg-slate-50 shadow-card ring-1 ring-divider/60';

    var stubInner = d.photo
      ? '<img src="' +
        d.photo +
        '" alt="' +
        d.name +
        '" loading="lazy" class="absolute inset-0 h-full w-full object-cover object-top" onerror="this.outerHTML=\'' +
        userGlyph().replace(/'/g, "\\'").replace(/"/g, '&quot;') +
        '\'" />'
      : userGlyph();

    art.innerHTML =
      '<div class="relative shrink-0 overflow-hidden rounded-l-2xl bg-gradient-to-b from-brand-blue to-brand-bluedark" style="width:132px">' +
      stubInner +
      '</div>' +
      '<span class="pointer-events-none absolute inset-y-3 z-10 border-l-2 border-dashed border-slate-300" style="left:132px"></span>' +
      '<span class="absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style="left:132px;top:0"></span>' +
      '<span class="absolute z-10 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white" style="left:132px;bottom:0"></span>' +
      '<div class="flex flex-1 flex-col justify-center rounded-r-2xl px-5 py-4 antialiased">' +
      '<p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-brand-blue/60">Dignitary</p>' +
      '<h3 class="font-script text-[30px] font-bold leading-[1.05] text-brand-bluedark">' +
      d.name +
      '</h3>' +
      '<p class="mt-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-gold">' +
      d.role +
      '</p>' +
      '<p class="mt-1 text-[12px] font-medium text-slate-500">' +
      d.term +
      '</p>' +
      (d.club
        ? '<p class="mt-0.5 text-[12px] font-medium text-slate-500">Rotary Club of ' + d.club + '</p>'
        : '') +
      '<a href="DignitaryProfile.aspx?type=' + (i === 0 ? 'president' : 'dg') +
      '" class="mt-2 inline-flex w-fit items-center gap-1 text-[12px] font-semibold text-brand-blue transition-colors hover:text-brand-bluedark">Know More ' +
      '<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>' +
      '</div>';
    // Make the whole ticket clickable (not just the small "Know More" link), so
    // clicking anywhere on a dignitary card opens its profile.
    art.classList.add('cursor-pointer');
    art.addEventListener('click', function () {
      window.location.href = 'DignitaryProfile.aspx?type=' + (i === 0 ? 'president' : 'dg');
    });
    grid.appendChild(art);
  });
}

/* ----------------------------- lightbox ----------------------------- */
function openLightbox(initialIndex, list) {
  if (!list || !list.length) return;
  var currentIndex = initialIndex;

  var overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  overlay.innerHTML =
    '<button type="button" aria-label="Close" class="lb-close absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition duration-200 z-50 ring-1 ring-white/20">' +
    '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
    
    '<!-- Left Arrow -->' +
    '<button type="button" aria-label="Previous image" class="lb-prev absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition duration-200 z-50 ring-1 ring-white/20">' +
    '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>' +
    
    '<!-- Right Arrow -->' +
    '<button type="button" aria-label="Next image" class="lb-next absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition duration-200 z-50 ring-1 ring-white/20">' +
    '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>' +

    '<figure class="lb-figure flex max-h-full max-w-full flex-col items-center relative z-10">' +
    '<img src="" alt="" class="max-h-[80vh] max-w-[85vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/15 transition-all duration-300 transform scale-95 opacity-0" id="lb-image" />' +
    '<figcaption class="mt-4 max-w-[80vw] text-center text-[15px] font-bold text-white/90 font-display tracking-wide" id="lb-caption"></figcaption>' +
    '</figure>';

  var imgElement = overlay.querySelector('#lb-image');
  var captionElement = overlay.querySelector('#lb-caption');

  function update() {
    var item = list[currentIndex];
    if (!item) return;

    // Apply fade-out before loading new src
    imgElement.classList.remove('scale-100', 'opacity-100');
    imgElement.classList.add('scale-95', 'opacity-0');

    setTimeout(function() {
      imgElement.src = item.src || item.image;
      imgElement.alt = item.alt || '';
      captionElement.textContent = item.alt || '';
      
      imgElement.onload = function() {
        imgElement.classList.remove('scale-95', 'opacity-0');
        imgElement.classList.add('scale-100', 'opacity-100');
      };
    }, 150);
  }

  function next(e) {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex + 1) % list.length;
    update();
  }

  function prev(e) {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    update();
  }

  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    startScroll();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }

  overlay.addEventListener('click', close);
  overlay.querySelector('.lb-figure').addEventListener('click', function(e) { e.stopPropagation(); });
  overlay.querySelector('.lb-close').addEventListener('click', function(e) { e.stopPropagation(); close(); });
  overlay.querySelector('.lb-prev').addEventListener('click', prev);
  overlay.querySelector('.lb-next').addEventListener('click', next);

  document.addEventListener('keydown', onKey);
  stopScroll();
  document.body.appendChild(overlay);
  
  // Initial render
  update();
}

/* --------------------------- API hydration (dignitaries) --------------------------- */
// Fallback DG source: the AUTHORITATIVE district_governors feed (public, year-wise).
// Used when /committee/members has no governor row for the selected year — e.g. a new
// Rotary year a district hasn't filled into its committee yet but HAS set the governor
// in admin (the case for 3250's 2026-27 DG). Carries the photo directly, so no extra
// member fetch is needed.
function governorFromPublic() {
  if (!window.RotaryAPI || !RotaryAPI.districtGovernor) return;
  return RotaryAPI.districtGovernor(RotaryAPI.config.yearId)
    .then(function (g) {
      if (!g || !g.memberName) return;
      dignitaries[1] = {
        name: (g.memberName || '').trim() || 'District Governor',
        role: 'District Governor',
        term: g.yearLabel || RotaryAPI.config.yearLabel,
        club: '',
        photo: resolveMedia(g.profilePhoto || g.profilePhotoPath),
      };
      buildDignitaries();
    })
    .catch(function () {});
}

function hydrate() {
  if (!window.RotaryAPI) return;

  // RI President -> dignitaries[0] (public endpoint, no auth).
  RotaryAPI.internationalPresident()
    .then(function (p) {
      if (!p || !p.name) return;
      dignitaries[0] = {
        name: (p.name || '').trim(),
        role: 'President',
        term: 'Rotary International ' + (p.yearLabel || RotaryAPI.config.yearLabel),
        club: '',
        photo: resolveMedia(p.profilePhotoPath || p.profilePhoto),
      };
      buildDignitaries();
    })
    .catch(function () {});

  // Current District Governor -> dignitaries[1].
  RotaryAPI.get(
    '/api/districts/' + RotaryAPI.config.districtId + '/committee/members',
    { yearId: RotaryAPI.config.yearId }
  )
    .then(function (res) {
      var items = (res && res.items) || res || [];
      var dg = items.filter(function (i) {
        return /governor/i.test(i.districtDesignation || '') && !/nominee|elect|past|nominate/i.test(i.districtDesignation || '');
      })[0];
      if (!dg) { governorFromPublic(); return; }
      var base = {
        name: (dg.name || '').trim() || 'District Governor',
        role: 'District Governor',
        term: dg.yearLabel || RotaryAPI.config.yearLabel,
        club: dg.clubName || '',
        photo: resolveMedia(dg.profilePhoto || dg.profile_photo || dg.ProfilePhotoPath || dg.committeePhoto),
      };
      dignitaries[1] = base;
      buildDignitaries();
      // The committee endpoint omits the photo; pull it from the member record
      // (which carries profilePhotoPath) so the DG ticket shows a real picture.
      var mid = dg.memberId || dg.fk_member_id || dg.pk_member_master_profile_id;
      if (!base.photo && mid) {
        RotaryAPI.get('/api/members/' + mid)
          .then(function (m) {
            var pp = m && (m.profilePhotoPath || m.ProfilePhotoPath);
            if (pp) {
              dignitaries[1] = Object.assign({}, base, { photo: resolveMedia(pp) });
              buildDignitaries();
            }
          })
          .catch(function () {});
      }
    })
    .catch(function () { governorFromPublic(); });
}

/* ------------------------------- galleries ------------------------------- */
/* ------------------------------- galleries ------------------------------- */
function initGalleries(projects, gallery) {
  var pg = document.querySelector('.projects-gallery');
  if (pg && projects && projects.length > 0) {
    Promise.resolve(window.initCircularGallery).then(function(initCircularGallery) {
      var m = { initCircularGallery: initCircularGallery };
      m.initCircularGallery(pg, {
        items: projects,
        bend: 0,
        textColor: '#0B2B6B',
        borderRadius: 0.06,
        scrollEase: 0.02,
        onItemClick: function (it) {
          if (it && it.id) {
            var url = 'ProjectDetail.aspx?id=' + encodeURIComponent(it.id);
            if (it.year != null) url += '&year=' + encodeURIComponent(it.year);
            window.location.href = url;
          }
        },
      });
    })
    .catch(function (e) { console.warn('CircularGallery failed to load', e); });
  }
  var dome = document.querySelector('.photo-gallery');
  if (dome) {
    // Force exactly 100 photos for 3D rotating globe visual testing
    var galleryPhotos = [];
    var sourceList = (gallery && gallery.length) ? gallery : [];
    if (!sourceList.length) {
      for (var s = 0; s < 11; s++) {
        sourceList.push({ src: 'assets/projects/proj-' + s + '.png', alt: 'Moment' });
      }
    }
    for (var k = 0; k < 100; k++) {
      var item = sourceList[k % sourceList.length];
      galleryPhotos.push({
        src: item.src || 'assets/projects/proj-0.png',
        alt: (item.alt || 'Warrior Moment') + ' - Moment ' + (k + 1)
      });
    }

    Promise.resolve(window.initDomeGallery).then(function(initDomeGallery) {
      var m = { initDomeGallery: initDomeGallery };
      m.initDomeGallery(dome, {
        images: galleryPhotos,
        grayscale: false,
        overlayBlurColor: '#f5f8fc',
        onImageClick: function (info) {
          openLightbox(info.index, galleryPhotos);
        },
      });
    })
    .catch(function (e) { console.warn('DomeGallery failed to load', e); });
  }
}

function initHero(mainSlides, ads) {
  var main = document.querySelector('.hero-carousel-main');
  if (main)
    initHeroCarousel(main, {
      slides: mainSlides,
      autoplayMs: 5000,
      label: 'District highlights',
      fit: 'contain',
    });
  var ad = document.querySelector('.hero-carousel-ad');
  if (ad) {
    var hasAds = ads && ads.length;
    initHeroCarousel(ad, {
      slides: hasAds ? ads : fallbackAds,
      autoplayMs: 6500,
      // Only label it "Advertisement" when it really is one; the default Rotary
      // card is district content, not a paid ad.
      badge: hasAds ? 'Advertisement' : null,
      label: hasAds ? 'Advertisements' : 'Rotary',
      fit: 'contain',
    });
  }
}

/* --------------------------- upcoming events --------------------------- */
function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function eventDateLabel(s) {
  if (!s) return '';
  var d = new Date(s);
  if (isNaN(d.getTime())) return '';
  try { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch (e) { return d.toDateString(); }
}
function eventIcon() {
  return (
    '<span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">' +
    '<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg></span>'
  );
}
function loadUpcomingEvents() {
  if (!window.RotaryAPI || !RotaryAPI.get) return Promise.resolve([]);
  return RotaryAPI.get('/api/districts/' + RotaryAPI.config.districtId + '/upcoming-events')
    .then(function (res) { return (res && res.items) || res || []; })
    .catch(function () { return []; });
}
// UPCOMING ONLY: keep events dated today or later (compared against the START of
// today, so an event happening today still counts all day), soonest first. Past
// events are dropped entirely, and undated events are excluded (nothing to show).
function sortEvents(list) {
  var cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  var cutoffMs = cutoff.getTime();
  var future = (list || []).filter(function (e) {
    var t = new Date(e.eventDate || '').getTime();
    return !isNaN(t) && t >= cutoffMs;
  });
  future.sort(function (a, b) { return new Date(a.eventDate || 0) - new Date(b.eventDate || 0); });
  return future;
}
// District events have clubId 0 → "District" tag; club events carry a clubId →
// tag with the club's name (resolved once per unique clubId).
function resolveClubNames(events) {
  var ids = {};
  (events || []).forEach(function (e) { if (e.clubId) ids[e.clubId] = true; });
  var list = Object.keys(ids);
  if (!list.length || !window.RotaryAPI || !RotaryAPI.club) return Promise.resolve({});
  var map = {};
  return Promise.all(list.map(function (id) {
    return RotaryAPI.club(id)
      .then(function (res) {
        var c = (res && res.club) || res || {};
        map[id] = c.ClubName || c.clubName || c.name || ('Club ' + id);
      })
      .catch(function () { map[id] = 'Club ' + id; });
  })).then(function () { return map; });
}
function eventCardHtml(e, clubNames) {
  var isDistrict = !e.clubId;
  var tag = isDistrict ? 'District' : (clubNames[e.clubId] || ('Club ' + e.clubId));
  var tagCls = isDistrict ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-gold/20 text-[#9a6b00]';
  var img = e.imagePath
    ? '<img data-evt-img src="' + escHtml(mediaProxy(e.imagePath)) + '" alt="" loading="lazy" class="h-16 w-16 shrink-0 rounded-lg object-cover" />'
    : eventIcon();
  var meta = [eventDateLabel(e.eventDate), e.eventVenue].filter(Boolean).join(' · ');
  // The whole card is a link: to the event's registration page when one exists
  // (opens in a new tab), otherwise to the Calendar page (there is no per-event
  // detail page). This makes every event card navigable, not just ones with a
  // registration link.
  var ext = !!e.registrationLink;
  var href = ext ? e.registrationLink : 'Calendar.aspx';
  var hint = ext ? 'Register →' : 'View in calendar →';
  return (
    '<a href="' + escHtml(href) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') +
    ' class="flex gap-3 rounded-xl border border-divider/50 bg-pagebg/40 p-3 transition-colors hover:bg-pagebg cursor-pointer">' +
    img +
    '<div class="min-w-0 flex-1">' +
    '<span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ' + tagCls + '">' + escHtml(tag) + '</span>' +
    '<h3 class="mt-1 text-[14px] font-bold leading-snug text-brand-bluedark line-clamp-2">' + escHtml(e.title || 'Event') + '</h3>' +
    (meta ? '<p class="mt-0.5 text-[12px] text-muted">' + escHtml(meta) + '</p>' : '') +
    '<span class="mt-1 inline-block text-[12px] font-semibold text-brand-blue">' + hint + '</span>' +
    '</div>' +
    '</a>'
  );
}
function renderEvents() {
  var list = document.querySelector('.events-list');
  if (!list) return;
  list.innerHTML = '<div class="py-10 text-center text-sm font-semibold text-muted">Loading events…</div>';
  loadUpcomingEvents().then(function (events) {
    events = sortEvents(events);
    if (!events.length) {
      list.innerHTML =
        '<div class="flex flex-col items-center gap-2 py-12 text-center">' +
        eventIcon() +
        '<p class="text-sm font-semibold text-muted">No upcoming events.</p></div>';
      return;
    }
    resolveClubNames(events).then(function (clubNames) {
      list.innerHTML = events.map(function (e) { return eventCardHtml(e, clubNames); }).join('');
      Array.prototype.forEach.call(list.querySelectorAll('[data-evt-img]'), function (img) {
        img.onerror = function () { this.outerHTML = eventIcon(); };
      });
    });
  });
}

/* --------------------------- district snapshot --------------------------- */
function snapNum(n) { return Number(n || 0).toLocaleString('en-IN'); }
function snapMoney(n) {
  n = Number(n || 0);
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}
var SNAP_ICONS = {
  projects: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
  clubs: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/>',
  members: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  beneficiaries: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  cost: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  hours: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
};
// A snapshot group ("Projects" / "Membership") rendered as its OWN titled panel —
// distinct surface + ring + an icon-led header with a rule — so the two parts read
// as two clearly separate sections. Each header carries its own accent chip.
function snapGroup(title, colCls, gridCls, cards, iconPaths, chipCls) {
  return (
    '<section class="' + colCls + ' rounded-2xl bg-pagebg/50 p-4 ring-1 ring-divider/60 sm:p-5">' +
    '<div class="mb-4 flex items-center gap-2.5">' +
    '<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ' + chipCls + '">' +
    '<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + iconPaths + '</svg>' +
    '</span>' +
    '<h3 class="text-[15px] font-bold tracking-tight text-brand-bluedark">' + escHtml(title) + '</h3>' +
    '<span class="ml-1 h-px flex-1 rounded bg-divider" aria-hidden="true"></span>' +
    '</div>' +
    '<div class="grid gap-3 ' + gridCls + '">' + cards.join('') + '</div>' +
    '</section>'
  );
}
// Per-metric accent (coloured icon chip + faint card wash + matching ring) so each
// stat reads as its OWN thing instead of six identical blue tiles. Hues are the
// dataviz categorical set — validated colourblind-safe (worst adjacent ΔE 21.3) —
// and every tile is text-labelled too, so identity is never colour-alone. The NUMBER
// stays ink (brand-bluedark); the coloured chip carries identity.
var SNAP_ACCENT = {
  projects:      { wash: 'from-blue-600/10',    ring: 'ring-blue-600/20',    chip: 'bg-blue-600/10 text-blue-600' },
  hours:         { wash: 'from-amber-600/10',   ring: 'ring-amber-600/20',   chip: 'bg-amber-600/10 text-amber-600' },
  cost:          { wash: 'from-emerald-600/10', ring: 'ring-emerald-600/20', chip: 'bg-emerald-600/10 text-emerald-600' },
  beneficiaries: { wash: 'from-rose-600/10',    ring: 'ring-rose-600/20',    chip: 'bg-rose-600/10 text-rose-600' },
  clubs:         { wash: 'from-violet-600/10',  ring: 'ring-violet-600/20',  chip: 'bg-violet-600/10 text-violet-600' },
  members:       { wash: 'from-cyan-600/10',    ring: 'ring-cyan-600/20',    chip: 'bg-cyan-600/10 text-cyan-600' },
};
// When `href` is given the card becomes a link (Projects → the Club Projects page).
// All cards lift on hover; only the linked one shows a corner arrow + pointer.
function snapCard(iconKey, value, label, href) {
  var isLink = !!href;
  var tag = isLink ? 'a' : 'div';
  var attrs = isLink ? ' href="' + href + '" aria-label="View all club projects"' : '';
  var ac = SNAP_ACCENT[iconKey] || SNAP_ACCENT.projects;
  var cls = 'group relative block overflow-hidden rounded-2xl bg-gradient-to-br ' + ac.wash +
    ' to-white p-4 shadow-sm ring-1 ' + ac.ring +
    ' transition-all duration-200 hover:-translate-y-1 hover:shadow-lg' + (isLink ? ' cursor-pointer' : '');
  var arrow = isLink
    ? '<span class="absolute right-3 top-3 text-muted/70 transition-transform group-hover:translate-x-0.5"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>'
    : '';
  return (
    '<' + tag + attrs + ' class="' + cls + '">' +
    arrow +
    '<span class="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ' + ac.chip + '">' +
    '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (SNAP_ICONS[iconKey] || '') + '</svg></span>' +
    '<p class="mt-3.5 text-[26px] font-extrabold leading-none tracking-tight text-brand-bluedark">' + escHtml(value) + '</p>' +
    '<p class="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.07em] text-muted">' + escHtml(label) + '</p>' +
    '</' + tag + '>'
  );
}
function loadDistrictSnapshot() {
  var host = document.querySelector('.district-snapshot');
  if (!host || !window.RotaryAPI) return;
  host.innerHTML = '<div class="col-span-full py-6 text-center text-sm font-semibold text-muted">Loading snapshot…</div>';
  // Project sums (Projects / Beneficiaries / Amount Spent / Man Hours) come from the
  // district avenue-of-service feed — the SAME feed the projects gallery fetches, so
  // it's a proxy cache hit, and its beneficiaries + amount-spent totals match the
  // admin district report EXACTLY (₹18.39 Cr / 397,942). Clubs + Members are the
  // district's TOTAL counts via cheap pageSize:1 totalCount probes — the old code
  // wrongly showed only the ~43 clubs that filed a project this year (vs all 147)
  // and never resolved Members at all (it called a non-existent RotaryAPI.district).
  var aggP = (RotaryAPI.districtProjects ? RotaryAPI.districtProjects() : Promise.resolve([]))
    .then(function (rows) {
      rows = Array.isArray(rows) ? rows : (rows && rows.items) || [];
      var ben = 0, hrs = 0, cost = 0, projectCount = 0;
      rows.forEach(function (r) {
        ben += Number(r.beneficiaries) || 0;
        hrs += Number(r.manHours) || 0;
        cost += Number(r.amountSpent) || 0;
        // "Club Service" = internal club administration (e.g. BOD meetings), not a
        // service project → excluded from the headline Projects count (per user); the
        // impact sums above still cover every row.
        if (String(r.moduleKey || '').trim().toLowerCase() !== 'club_service') projectCount++;
      });
      return { projects: projectCount, beneficiaries: ben, manHours: hrs, cost: cost };
    })
    .catch(function () { return {}; });
  // Total clubs in the district (matches admin's "Clubs" 147, not just clubs with a project).
  var clubsP = (RotaryAPI.clubFinder ? RotaryAPI.clubFinder({ page: 1, pageSize: 1 }) : Promise.resolve(null))
    .then(function (res) { return (res && res.totalCount) || 0; })
    .catch(function () { return 0; });
  // Total members (same roster + count the District Committee directory shows).
  var membersP = (RotaryAPI.districtMembers ? RotaryAPI.districtMembers({ page: 1, pageSize: 1 }) : Promise.resolve(null))
    .then(function (res) { return (res && res.totalCount) || 0; })
    .catch(function () { return 0; });
  Promise.all([aggP, clubsP, membersP]).then(function (r) {
    var a = r[0] || {}, totalClubs = r[1] || 0, totalMembers = r[2] || 0;
    // Two clearly separated panels: PROJECTS (impact metrics) + MEMBERSHIP (clubs & members).
    var ICON_PROJECTS = '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'; // activity / impact
    var ICON_MEMBERS = '<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>'; // community
    host.innerHTML =
      '<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">' +
      snapGroup('Projects', 'lg:col-span-2', 'grid-cols-2 sm:grid-cols-4', [
        snapCard('projects', snapNum(a.projects), 'Projects', 'Projects.aspx'),
        snapCard('hours', snapNum(a.manHours), 'Man Hours'),
        snapCard('cost', snapMoney(a.cost), 'Amount Spent'),
        snapCard('beneficiaries', snapNum(a.beneficiaries), 'Beneficiaries'),
      ], ICON_PROJECTS, 'bg-brand-blue/10 text-brand-blue') +
      snapGroup('Membership', 'lg:col-span-1', 'grid-cols-2', [
        snapCard('clubs', snapNum(totalClubs), 'Clubs'),
        snapCard('members', snapNum(totalMembers), 'Members'),
      ], ICON_MEMBERS, 'bg-brand-gold/15 text-amber-600') +
      '</div>';
  });
}

/* ------------------------------- mount ------------------------------- */
function mount() {
  buildDignitaries();
  initReveals(document);
  initSmoothScroll();
  hydrate();
  renderEvents();
  loadDistrictSnapshot();

  var localProjects = null;
  var localGallery = null;
  try {
    var galleryStr = localStorage.getItem('warriors_gallery');
    if (galleryStr) {
      localGallery = JSON.parse(galleryStr);
    }
  } catch (e) {
    console.error('Error loading gallery from localStorage', e);
  }

  var apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
  console.log('Homepage fetch URL:', apiBase + '/api/projects?status=published');
  fetch(apiBase + '/api/projects?status=published')
    .then(function (res) {
      console.log('Homepage fetch response:', res.status, res.statusText);
      if (res.ok) return res.json();
      throw new Error('API offline');
    })
    .then(function (data) {
      console.log('Homepage fetch data count:', data.length, data);
      localProjects = data.map(function (p) {
        return {
          image: p.cover_image || p.image || 'assets/projects/proj-0.png',
          title: p.title || p.name || 'Untitled Project',
          id: p.id || '',
          year: ''
        };
      });
      runLoadingChain();
    })
    .catch(function (err) {
      console.error('Homepage fetch failed:', err);
      try {
        var localStr = localStorage.getItem('warriors_projects');
        if (localStr) {
          var parsed = JSON.parse(localStr);
          localProjects = parsed.filter(function (p) { return p.status === 'Published' || p.isPublished !== false; }).map(function (p) {
            return {
              image: p.image || p.cover_image || 'assets/projects/proj-0.png',
              title: p.name || p.title || 'Untitled Project',
              id: p.id || '',
              year: ''
            };
          });
        }
      } catch (e) {}
      runLoadingChain();
    });

  function runLoadingChain() {
    loadLiveProjects(14)
      .then(function (live) {
      var baseList = (localProjects !== null) ? localProjects : fallbackWebGallery.map(function (p) {
        return { image: p.image, title: p.title, id: '', year: '' };
      });
      
      if (baseList.length === 0) {
        var pg = document.querySelector('.projects-gallery');
        if (pg) {
          pg.innerHTML = '<div class="flex flex-col items-center justify-center p-8 text-center text-slate-500 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/30 max-w-xl mx-auto my-6"><svg class="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg><p class="text-base font-semibold text-slate-800 mb-1">No Projects Published Yet</p><p class="text-sm text-slate-500 max-w-xs mx-auto">Create a new project in the Admin Portal and mark it as published to see it here!</p></div>';
          pg.style.height = 'auto';
        }
        var gallery = (localGallery && localGallery.length) ? localGallery.map(function(g) { return { src: g.src, alt: g.alt }; }) : [];
        initGalleries([], gallery);
      } else {
        var list = [];
        for (var j = 0; j < 20; j++) {
          var item = baseList[j % baseList.length];
          list.push({
            image: item.image || 'assets/projects/proj-0.png',
            title: item.title || 'Untitled Project',
            id: item.id || ('PRJ-' + j),
            year: item.year || ''
          });
        }
        var galleryLabel = function (s) {
          s = String(s || '').trim();
          return s.length > 32 ? s.slice(0, 31).replace(/\s+\S*$/, '') + '…' : s;
        };
        var projects = list.map(function (p) { return { image: p.image, text: galleryLabel(p.title), id: p.id || '', year: p.year || '' }; });
        var gallery = (localGallery && localGallery.length) ? localGallery.map(function(g) { return { src: g.src, alt: g.alt }; }) : list.map(function (p) { return { src: p.image, alt: p.title }; });
        initGalleries(projects, gallery);
      }

      // District advertisements (often empty); only init the ad carousel if present.
      var adsP =
        window.RotaryAPI && RotaryAPI.get
          ? RotaryAPI.get('/api/districts/' + RotaryAPI.config.districtId + '/website-data/advertisements', { yearId: RotaryAPI.config.yearId })
              .then(function (rows) {
                return (rows || [])
                  .map(function (a) {
                    var p = a.advertisementImagePath || a.imagePath || a.AdvertisementImagePath;
                    return p ? { image: mediaProxy(p), alt: 'Advertisement', href: a.link || '#', fallback: fallbackAds[0].image } : null;
                  })
                  .filter(Boolean);
              })
              .catch(function () { return []; })
          : Promise.resolve([]);

      return Promise.all([loadHeroSlides(live), adsP]).then(function (r) {
        initHero(r[0] && r[0].length ? r[0] : fallbackHero, r[1]);
      });
    })
    .catch(function () {
      var baseList = (localProjects !== null) ? localProjects : fallbackWebGallery.map(function (p) {
        return { image: p.image, title: p.title, id: '', year: '' };
      });
      
      if (baseList.length === 0) {
        var pg = document.querySelector('.projects-gallery');
        if (pg) {
          pg.innerHTML = '<div class="flex flex-col items-center justify-center p-8 text-center text-slate-500 border-2 border-dashed border-red-200 rounded-2xl bg-red-50/30 max-w-xl mx-auto my-6"><svg class="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg><p class="text-base font-semibold text-slate-800 mb-1">No Projects Published Yet</p><p class="text-sm text-slate-500 max-w-xs mx-auto">Create a new project in the Admin Portal and mark it as published to see it here!</p></div>';
          pg.style.height = 'auto';
        }
        var gallery = (localGallery && localGallery.length) ? localGallery.map(function(g) { return { src: g.src, alt: g.alt }; }) : [];
        initGalleries([], gallery);
      } else {
        var list = [];
        for (var j = 0; j < 20; j++) {
          var item = baseList[j % baseList.length];
          list.push({
            image: item.image || 'assets/projects/proj-0.png',
            title: item.title || 'Untitled Project',
            id: item.id || ('PRJ-' + j),
            year: item.year || ''
          });
        }
        var galleryLabel = function (s) {
          s = String(s || '').trim();
          return s.length > 32 ? s.slice(0, 31).replace(/\s+\S*$/, '') + '…' : s;
        };
        var projects = list.map(function (p) { return { image: p.image, text: galleryLabel(p.title), id: '', year: '' }; });
        var gallery = (localGallery && localGallery.length) ? localGallery.map(function(g) { return { src: g.src, alt: g.alt }; }) : list.map(function (p) { return { src: p.image, alt: p.title }; });
        initGalleries(projects, gallery);
      }
      initHero(fallbackHero, null);
    });
  }
}

// Hide the "Our Projects" + "Photo Gallery" home sections (their whole <section>)
// only when NO Rotary year has any project photo — so an empty/new district shows no
// section at all rather than generic stock imagery.
function hideGallerySections() {
  ['.projects-gallery', '.photo-gallery'].forEach(function (sel) {
    var el = document.querySelector(sel);
    var section = el && el.closest ? el.closest('section') : null;
    if (section) section.style.display = 'none';
  });
}

function boot() {
  // Multi-tenant: wait until client.js resolves which district this subdomain
  // serves, so every API call uses the right districtId/Number.
  if (window.RotaryAPI && RotaryAPI.ready) {
    RotaryAPI.ready()
      .then(mount)
      .catch(function (err) {
        console.warn('RotaryAPI ready failed, mounting homepage anyway:', err);
        mount();
      });
  } else {
    mount();
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
