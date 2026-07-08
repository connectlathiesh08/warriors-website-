/* ==========================================================================
   Rotary District 3011 — API client
   Talks to the live REST API at rizones4567.org/API (JWT bearer auth).
   CORS is open on the API, so direct browser fetch works in local preview AND
   in production (where the site and API share the rizones4567.org origin).

   SECURITY: requests go same-origin through /ApiProxy.ashx, which injects the
   bearer token server-side (token lives in Web.config appSettings, NEVER in the
   browser) and briefly caches responses. To talk to the API directly instead
   (e.g. a quick local test), set proxy:null and put the token back in `token`.
   ========================================================================== */
(function (global) {
  'use strict';

  // The Rotary year runs 1 July – 30 June; its label is "<startYear>-<endYY>"
  // (e.g. any date on/after 1 Jul 2026 -> "2026-27", before that -> "2025-26").
  // Deriving the CURRENT year from the calendar — NOT from the backend's isCurrent
  // flag — is what makes the site roll over to the new year automatically at local
  // midnight on 1 July, even if the API hasn't flipped the flag yet or a cached
  // year list is briefly stale. This is the single source of truth for "what year
  // is it now"; no year value is hardcoded anywhere.
  function rotaryYearLabelForDate(d) {
    d = d || new Date();
    var startYear = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1; // getMonth() 6 = July
    return startYear + '-' + ('0' + ((startYear + 1) % 100)).slice(-2);
  }

  var config = {
    base: 'https://rizones4567.org/API',
    // Same-origin proxy: requests go to `${proxy}?path=<encoded path+query>` and
    // NO token is sent from the browser (ApiProxy.ashx adds it server-side).
    proxy: 'https://rid3191.rotaryindia.org/ApiProxy.ashx',
    token: '',

    // District identity (Rotary District 3191)
    districtId: 471,
    districtNumber: '3191',
    // Reference club used by the public/club/* endpoints (RI President, etc.).
    refClubId: 34297,
    // Media base for /Documents/* asset paths (404 without the /API segment).
    mediaBase: 'https://rizones4567.org/API',

    // Current Rotary year LABEL, computed from today's date (Jul 1 – Jun 30) so it is
    // never a stale hardcoded year — it self-updates at the 1 July rollover. The
    // numeric yearId is NOT declared here on purpose: it's a database key that can't be
    // derived from a date, so resolveTenant() sets config.yearId purely from the live
    // /api/rotary-years list at boot (every data fetch waits for that via ready()). No
    // hardcoded year id or label anywhere.
    yearLabel: rotaryYearLabelForDate(),
  };

  /* WORKAROUND for a backend path bug: each district's banners and Governor's
     Monthly Letters physically live under /Documents/WebsiteData/Group{N}/ on
     rotaryindia.org, but the API returns banner paths as /uploads/banner/* and GML
     paths as Group{districtId}/* (both 404), and never exposes this group id. These
     ids are harvested from the districts' existing legacy sites. Remove this map +
     the *Url() helpers once the API returns correct media paths. */
  var DISTRICT_GROUPS = {
    '2981': '31689', '2982': '31157', '3000': '31690', '3011': '31091', '3012': '31092', '3020': '32020',
    '3030': '31085', '3040': '31370', '3053': '32021', '3055': '34307', '3056': '34308', '3060': '31234',
    '3070': '31525', '3080': '31709', '3090': '31115', '3100': '31680', '3110': '31116', '3120': '31691',
    '3131': '31683', '3132': '31552', '3141': '31093', '3142': '31072', '3150': '31138', '3160': '31096',
    '3170': '31685', '3181': '31303', '3182': '31094', '3191': '34309', '3192': '34310', '3203': '31095',
    '3204': '33415', '3205': '35015', '3206': '34991', '3211': '31681', '3212': '31687', '3231': '31114',
    '3233': '31682', '3234': '34732', '3240': '31113', '3250': '31088', '3261': '31684', '3262': '31375',
    '3291': '31083',
  };
  // District header logos ("Rotary Dist NNNN") — the API returns districtLogoPath
  // null, so these full URLs are harvested from the districts' legacy sites. (The
  // club RotaryLogoPath is a CLUB-specific logo, not the district's, so it's not used.)
  var DISTRICT_LOGOS = {
    '2981': 'https://rotaryindia.org/Documents/WebsiteData/Group31689/LOGO/UpperLogo030520240456492989307PM.png',
    '2982': 'https://rotaryindia.org/Documents/WebsiteData/Group31157/LOGO/UpperLogo030520240459251122790PM.png',
    '3000': 'https://rotaryindia.org/Documents/WebsiteData/Group31690/LOGO/UpperLogo030520240510119432851PM.png',
    '3011': 'https://rotaryindia.org/Documents/WebsiteData/Group31091/LOGO/UpperLogo030520240513523814219PM.png',
    '3012': 'https://rotaryindia.org/Documents/WebsiteData/Group31092/LOGO/UpperLogo030520240543313348299PM.png',
    '3020': 'https://rotaryindia.org/Documents/WebsiteData/Group32020/LOGO/UpperLogo030520240600594633488PM.png',
    '3030': 'https://rotaryindia.org/Documents/WebsiteData/Group31085/LOGO/UpperLogo030520240604037453816PM.png',
    '3040': 'https://rotaryindia.org/Documents/WebsiteData/Group31370/LOGO/UpperLogo030520240606050896432PM.png',
    '3053': 'https://rotaryindia.org/Documents/WebsiteData/Group32021/LOGO/UpperLogo030520240610239973244PM.png',
    '3055': 'https://rotaryindia.org/Documents/WebsiteData/Group34307/LOGO/UpperLogo030520240618480777387PM.png',
    '3056': 'https://rotaryindia.org/Documents/WebsiteData/Group34308/LOGO/UpperLogo030520240622043284655PM.png',
    '3060': 'https://rotaryindia.org/Documents/WebsiteData/Group31234/LOGO/UpperLogo030520240625217514940PM.png',
    '3070': 'https://rotaryindia.org/Documents/WebsiteData/Group31525/LOGO/UpperLogo030520240631027683186PM.png',
    '3080': 'https://rotaryindia.org/Documents/WebsiteData/Group31709/LOGO/UpperLogo030520240634544099954PM.png',
    '3090': 'https://rotaryindia.org/Documents/WebsiteData/Group31115/LOGO/UpperLogo030520240635428165404PM.png',
    '3100': 'https://rotaryindia.org/Documents/WebsiteData/Group31680/LOGO/UpperLogo030520240639333020021PM.png',
    '3110': 'https://rotaryindia.org/Documents/WebsiteData/Group31116/LOGO/UpperLogo260720241210139305155PM.png',
    '3120': 'https://rotaryindia.org/Documents/WebsiteData/Group31691/LOGO/UpperLogo030520240644556626029PM.png',
    '3131': 'https://rotaryindia.org/Documents/WebsiteData/Group31683/LOGO/UpperLogo030520240648121638588PM.png',
    '3132': 'https://rotaryindia.org/Documents/WebsiteData/Group31552/LOGO/UpperLogo030520240652322274130PM.png',
    '3141': 'https://rotaryindia.org/Documents/WebsiteData/Group31093/LOGO/UpperLogo030520240653590088347PM.png',
    '3142': 'https://rotaryindia.org/Documents/WebsiteData/Group31072/LOGO/UpperLogo030520240453020947672PM.png',
    '3150': 'https://rotaryindia.org/Documents/WebsiteData/Group31138/LOGO/UpperLogo030520240656207597360PM.png',
    '3160': 'https://rotaryindia.org/Documents/WebsiteData/Group31096/LOGO/UpperLogo030520240657015877292PM.png',
    '3170': 'https://rotaryindia.org/Documents/WebsiteData/Group31685/LOGO/UpperLogo030520240658014629938PM.png',
    '3181': 'https://rotaryindia.org/Documents/WebsiteData/Group31303/LOGO/UpperLogo030520240659192917671PM.png',
    '3182': 'https://rotaryindia.org/Documents/WebsiteData/Group31094/LOGO/UpperLogo030520240659566510230PM.png',
    '3191': 'https://rotaryindia.org/Documents/WebsiteData/Group34309/LOGO/UpperLogo120920250737240087837AM.png',
    '3192': 'https://rotaryindia.org/Documents/WebsiteData/Group34310/LOGO/UpperLogo040520240249233531560PM.png',
    '3203': 'https://rotaryindia.org/Documents/WebsiteData/Group31095/LOGO/UpperLogo040520240300241529011PM.png',
    '3204': 'https://rotaryindia.org/Documents/WebsiteData/Group33415/LOGO/UpperLogo040520240302356690289PM.png',
    '3205': 'https://rotaryindia.org/Documents/WebsiteData/Group35015/LOGO/UpperLogo311020250444269586447PM.png',
    '3206': 'https://rotaryindia.org/Documents/WebsiteData/Group34991/LOGO/UpperLogo020720251211526880902PM.png',
    '3211': 'https://rotaryindia.org/Documents/WebsiteData/Group31681/LOGO/UpperLogo040520240307411859505PM.png',
    '3212': 'https://rotaryindia.org/Documents/WebsiteData/Group31687/LOGO/UpperLogo040520240310501394740PM.png',
    '3231': 'https://rotaryindia.org/Documents/WebsiteData/Group31114/LOGO/UpperLogo040520240319382824578PM.png',
    '3233': 'https://rotaryindia.org/Documents/WebsiteData/Group31682/LOGO/UpperLogo010720240410598720353PM.png',
    '3234': 'https://rotaryindia.org/Documents/WebsiteData/Group34732/LOGO/UpperLogo010720240436000464055PM.png',
    '3240': 'https://rotaryindia.org/Documents/WebsiteData/Group31113/LOGO/UpperLogo040520240322388301016PM.png',
    '3250': 'https://rotaryindia.org/Documents/WebsiteData/Group31088/LOGO/UpperLogo040520240324316275086PM.png',
    '3261': 'https://rotaryindia.org/Documents/WebsiteData/Group31684/LOGO/UpperLogo030520240655247125897PM.png',
    '3262': 'https://rotaryindia.org/Documents/WebsiteData/Group31375/LOGO/UpperLogo030520240650205550877PM.png',
    '3291': 'https://rotaryindia.org/Documents/WebsiteData/Group31083/LOGO/UpperLogo030520240646093659485PM.png',
  };
  function groupOf() { return DISTRICT_GROUPS[String(config.districtNumber)] || ''; }
  function logoOf() { return DISTRICT_LOGOS[String(config.districtNumber)] || ''; }
  function baseName(p) { return String(p || '').split(/[\\/]/).pop(); }
  config.districtLogo = logoOf(); // default district's header logo (updated on tenant resolve)

  function buildUrl(path, params) {
    var qs = '';
    if (params) {
      var parts = [];
      Object.keys(params).forEach(function (k) {
        var v = params[k];
        if (v === undefined || v === null || v === '') return;
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
      });
      qs = parts.length ? '?' + parts.join('&') : '';
    }
    if (config.proxy) {
      return config.proxy + '?path=' + encodeURIComponent(path + qs);
    }
    return config.base + path + qs;
  }

  // Low-level fetch — does NOT wait for tenant resolution. Used internally to
  // bootstrap the district, and by the public `request` once we're ready.
  function rawRequest(path, params, options) {
    options = options || {};
    var headers = { Accept: 'application/json' };
    if (!config.proxy && config.token) {
      headers.Authorization = 'Bearer ' + config.token;
    }
    return fetch(buildUrl(path, params), {
      method: options.method || 'GET',
      headers: headers,
    }).then(function (res) {
      if (!res.ok) {
        var err = new Error('API ' + res.status + ' for ' + path);
        err.status = res.status;
        throw err;
      }
      var ct = res.headers.get('content-type') || '';
      return ct.indexOf('application/json') !== -1 ? res.json() : res.text();
    });
  }

  /* ----------------------------------------------------------------------
     MULTI-TENANT RESOLUTION
     One deployment serves every district. Production: the SUBDOMAIN decides
     (rid3011.rotaryindia.org → "3011"). For local testing without subdomains,
     a path segment (/3011/...) or ?district=3011 also works and is remembered
     across page-to-page navigation (sessionStorage), so you only set it once.
     Resolution order: subdomain → path segment → ?district= → remembered → default.
     ---------------------------------------------------------------------- */
  var DEV_KEY = 'rid-dev-district';

  function numFromSubdomain() {
    var host = ((global.location && global.location.hostname) || '').split(':')[0];
    if (!host || /^[0-9.]+$/.test(host)) return null; // ignore bare IPs / empty
    var m = /(?:^|[^0-9])(\d{3,5})(?:[^0-9]|$)/.exec(host);
    return m ? m[1] : null;
  }
  function numFromPath() {
    var loc = global.location || {};
    var segs = ((loc.pathname || '') + '').split('/').filter(Boolean);
    return segs.length && /^\d{3,5}$/.test(segs[0]) ? segs[0] : null;
  }
  function numFromQuery() {
    var loc = global.location || {};
    try {
      var q = new URLSearchParams(loc.search || '');
      var v = q.get('district') || q.get('d');
      return v && /^\d{3,5}$/.test(v) ? v : null;
    } catch (e) {
      return null;
    }
  }
  function remember(num) {
    try {
      global.sessionStorage.setItem(DEV_KEY, num);
    } catch (e) {}
  }
  function recall() {
    try {
      return global.sessionStorage.getItem(DEV_KEY);
    } catch (e) {
      return null;
    }
  }

  // Returns the district number for this request, or null to use the default.
  function resolveDistrictNumber() {
    var sub = numFromSubdomain();
    if (sub) return sub; // production — never overridden by query/path
    // Local testing helpers (only when not on a real district subdomain):
    var dev = numFromPath() || numFromQuery();
    if (dev) {
      remember(dev); // persist so further navigation keeps the district
      return dev;
    }
    return recall(); // a district set earlier this session
  }

  var readyPromise = null;
  function resolveTenant() {
    var num = resolveDistrictNumber();

    // 1. district number → numeric districtId (+ confirm it exists).
    var pId = num
      ? rawRequest('/api/Districts', { page: 1, pageSize: 500 })
          .then(function (res) {
            var items = (res && res.items) || res || [];
            var row = items.filter(function (d) {
              return String(d.districtNumber) === String(num);
            })[0];
            if (row && row.id) {
              config.districtNumber = String(num);
              config.districtId = row.id;
              config.districtName = 'Rotary District ' + num;
              // Per-district header logo: prefer the harvested district logo, then
              // any API-provided logo. app.js swaps it into the header.
              config.districtLogo = logoOf() || row.districtLogoPath || row.DistrictLogoPath || '';
            }
          })
          .catch(function () {})
      : Promise.resolve();

    // 2. Rotary years: resolve the CURRENT year, then apply the user's selected
    //    year for this session (the year dropdown stores a short label like
    //    "2024-25" in sessionStorage). Data endpoints use config.yearId, so this
    //    is what actually makes the year filter change the data.
    var pYear = rawRequest('/api/rotary-years')
      .then(function (res) {
        var years = (res && res.items) || res || [];
        config.years = years;
        // Determine the CURRENT Rotary year by the CALENDAR (Jul 1 – Jun 30), not by
        // the backend's isCurrent flag. The flag can lag the 1 July rollover (a job
        // flips it) and a cached year list can be briefly stale, either of which would
        // wrongly leave the site on last year on 1 July. The date is authoritative; we
        // just look up the row whose label matches to get its API id. Fall back to the
        // isCurrent flag only if no row matches today's label (shouldn't happen once
        // the new year row exists — it already does).
        var todayLabel = rotaryYearLabelForDate();
        var current =
          years.filter(function (y) { return y.yearLabel === todayLabel; })[0] ||
          years.filter(function (y) { return y.isCurrent; })[0];
        if (current) {
          config.currentYearId = current.id;
          config.currentYearLabel = current.yearLabel;
          config.yearId = current.id;       // default = current
          config.yearLabel = current.yearLabel;
        }
        var selected = null;
        try { selected = global.sessionStorage.getItem('rid-year'); } catch (e) {}
        if (selected) {
          var row = years.filter(function (y) { return y.yearLabel === selected; })[0];
          if (row && row.id) {
            config.yearId = row.id;
            config.yearLabel = row.yearLabel;
          }
        }
      })
      .catch(function () {});

    return Promise.all([pId, pYear]).then(function () {
      // 3. reference club for this district (RI President is global, but the
      //    newsletters page defaults to this club). Pick the first club.
      return rawRequest('/api/mobile/club-finder', {
        districtNumber: config.districtNumber,
        page: 1,
        pageSize: 1,
      })
        .then(function (res) {
          var c = res && res.items && res.items[0];
          if (c && c.clubId) config.refClubId = c.clubId;
        })
        .catch(function () {});
    });
  }

  function timeoutPromise(ms, promise) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error('Timeout after ' + ms + ' ms'));
      }, ms);
      promise
        .then(function (value) {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /** Resolves once the tenant district + current year are known. */
  function ready() {
    if (!readyPromise) readyPromise = timeoutPromise(2500, resolveTenant());
    return readyPromise;
  }

  // Public request — waits for tenant resolution so config.districtId /
  // districtNumber / refClubId are correct before any page fetches data.
  function request(path, params, options) {
    return ready().then(function () {
      return rawRequest(path, params, options);
    });
  }

  var RotaryAPI = {
    config: config,
    get: request,
    ready: ready,

    // ---- Reference data ----
    rotaryYears: function () {
      return request('/api/rotary-years');
    },
    currentYear: function () {
      return request('/api/rotary-years/current');
    },
    district: function (id) {
      return request('/api/Districts/' + (id || config.districtId));
    },

    // ---- Clubs / Club Finder (public, district-scoped) ----
    // NOTE: club-finder pageSize caps at 100 server-side; use clubFinderAll to page.
    clubFinder: function (params) {
      var p = Object.assign(
        { districtNumber: config.districtNumber, page: 1, pageSize: 100 },
        params || {}
      );
      return request('/api/mobile/club-finder', p);
    },
    clubFinderAll: function (filter) {
      var acc = [];
      function page(p) {
        var params = Object.assign(
          { districtNumber: config.districtNumber, page: p, pageSize: 100 },
          filter || {}
        );
        return request('/api/mobile/club-finder', params).then(function (res) {
          var items = (res && res.items) || [];
          acc = acc.concat(items);
          var total = (res && res.totalCount) || acc.length;
          if (acc.length < total && items.length) return page(p + 1);
          return { items: acc, totalCount: total };
        });
      }
      return page(1);
    },
    club: function (clubId) {
      return request('/api/mobile/club-finder/' + clubId);
    },
    // ---- Club board of directors (YEAR-SCOPED, lightweight ~1KB) ----
    // Office bearers for the SELECTED Rotary year (President, Secretary, Treasurer,
    // …) so the Club Leadership section changes with the year selector. The
    // club-finder detail above returns .president/.secretary that are NOT
    // year-scoped (always the CURRENT year's officers) — using this for leadership
    // is what makes the club profile reflect the chosen year. Returns a bare array
    // of { memberName, profilePhotoPath, designationId, designationName, yearLabel }.
    clubBoard: function (clubId, yearId) {
      return request('/api/clubs/' + clubId + '/board-of-directors', {
        yearId: yearId != null ? yearId : config.yearId,
      });
    },

    // ---- District committee / governors / directory ----
    districtDirectory: function (rotaryYear, districtNumber) {
      return request('/api/district-directory/' + (districtNumber || config.districtNumber), {
        rotaryYear: rotaryYear || config.yearLabel,
      });
    },
    committeeMembers: function (params) {
      return request(
        '/api/districts/' + config.districtId + '/committee/members',
        Object.assign({ yearId: config.yearId }, params || {})
      );
    },
    // ---- Full district member roster (the public "directory") ----
    // Server-side paginated + searchable. Powers the District Committee page,
    // which lists EVERY member of the district (not just committee appointees) —
    // mirrors the admin panel's /districts/{id}/members listing.
    districtMembers: function (params) {
      return request(
        '/api/districts/' + config.districtId + '/members',
        Object.assign({ page: 1, pageSize: 24 }, params || {})
      );
    },
    // ---- District committee groups (the "committees" the directory filters by) ----
    // committeeGroups: the list (id, groupName, memberCount). committeeGroupMembers:
    // a single committee's members (paginated + searchable). Year-scoped to config.yearId.
    committeeGroups: function (params) {
      return request(
        '/api/districts/' + config.districtId + '/committee/groups',
        Object.assign({ yearId: config.yearId, page: 1, pageSize: 200 }, params || {})
      );
    },
    committeeGroupMembers: function (groupId, params) {
      return request(
        '/api/districts/' + config.districtId + '/committee/groups/' + groupId + '/members',
        Object.assign({ page: 1, pageSize: 24 }, params || {})
      );
    },
    districtGovernors: function (params) {
      return request('/api/district-governors', params);
    },

    // ---- Calendar (birthdays / anniversaries / events) — month-scoped ----
    districtCalendar: function (month, year, districtId) {
      return request('/api/mobile/district-calendar/' + (districtId || config.districtId), {
        month: month,
        year: year,
      });
    },

    // ---- Projects (district-wide avenue-of-service report; moduleKey filters) ----
    districtProjects: function (params) {
      return request(
        '/api/districts/' + config.districtId + '/district-report/avenue-of-service-all-clubs',
        Object.assign({ yearId: config.yearId }, params || {})
      );
    },

    // ---- Newsletters (public, per club; default the reference club) ----
    // NOT year-scoped (per user decision): list ALL of a club's bulletins across
    // every Rotary year, so the Newsletters page shows everything regardless of the
    // header year selector. (Passing yearId would filter on fk_year_id and hide a
    // club's older years — e.g. Activa Delhi's are all 2023-24 — which is exactly
    // what the user asked to remove. yearId=0 returns NOTHING for this endpoint, so
    // we OMIT the param entirely to get all years.)
    // WORKAROUND for a BACKEND bug: the public feed /api/public/club/{id}/newsletters
    // drops any row where ExpiryDateTime < NOW(). The club dashboard has NO expiry
    // field, so newly-added newsletters are stored with ExpiryDateTime == PublishDateTime
    // and expire the instant they're published → they never reach the public site
    // (verified: club 2765's 3 July-1 adds return via admin but not via /public). The
    // admin LIST endpoint has NO expiry gate, filters the year by publish-date RANGE
    // (so untagged yearId=0 rows still resolve), and resolves file paths identically.
    // We do NOT pass status=Published: the original public feed showed FUTURE-dated
    // (scheduled) newsletters too (e.g. Dombivli East's 5-Sep bulletin), and status=
    // Published would hide them — so we fetch all non-deleted rows to match that intent.
    // Unwrap {items} to keep the array the page expects. REVERT to /api/public/... once
    // the create API stops defaulting expiry to the publish time. See known-issues Session 9.
    clubNewsletters: function (clubId) {
      return request('/api/clubs/' + (clubId || config.refClubId) + '/newsletters', {
        pageSize: 200,
      }).then(function (r) { return (r && r.items) || (Array.isArray(r) ? r : []); });
    },
    // District-level newsletters = the Governor's Monthly Letters (GMLs), stored
    // in the same ebulletin infrastructure under the district's group.
    // IMPORTANT: GML rows carry NO Rotary year (fk_year_id is 0/empty on every
    // record, across all districts), so filtering by yearId server-side returns
    // ZERO. We therefore fetch ALL of them (no yearId) and the Newsletters page
    // filters by the Rotary year DERIVED from each letter's publishDateTime.
    // (Club newsletters DO carry a real yearId, so those stay server-filtered.)
    districtNewsletters: function () {
      return request('/api/districts/' + config.districtId + '/newsletters', {
        pageSize: 200,
      });
    },
    // Resolve a banner record path to its REAL working URL via the district's
    // website group (the API's /uploads/banner/* 404s). '' if the group is unknown.
    bannerUrl: function (path) {
      var g = groupOf();
      return g ? 'https://rotaryindia.org/Documents/WebsiteData/Group' + g + '/BANNERS/' + baseName(path) : '';
    },
    // Resolve a GML (district ebulletin) path to its REAL working URL via the group.
    gmlUrl: function (path) {
      var g = groupOf();
      return g ? 'https://rotaryindia.org/Documents/ebulletin/Group' + g + '/' + baseName(path) : '';
    },

    // ---- RI President (public, no auth needed) ----
    // Year-specific: the API returns the president for `yearId` (e.g. 2024-25 →
    // Stephanie Urchick, 2025-26 → Francesco Arezzo). Without it the API defaults
    // to the current year, which made the card look "stuck" when the year changed.
    // The RI President is GLOBAL (one record per Rotary year), but the only public
    // endpoint is club-scoped and returns 404 when the club isn't "serviceable" —
    // and MANY districts' first club isn't, which left the President stuck on the
    // hardcoded default (showing the wrong year's president). So: try this district's
    // club, and on ANY failure retry via a known always-serviceable club (34297) —
    // the president returned is identical regardless of which club is used.
    internationalPresident: function (clubId) {
      var FALLBACK_CLUB = 34297;
      var primary = clubId || config.refClubId || FALLBACK_CLUB;
      function fetchFor(cid) {
        return request('/api/public/club/' + cid + '/international-president', { yearId: config.yearId });
      }
      return fetchFor(primary).catch(function () {
        return String(primary) === String(FALLBACK_CLUB) ? null : fetchFor(FALLBACK_CLUB);
      });
    },

    // ---- District Governor (authoritative, public, year-wise) ----
    // The home page + dignitary page normally read the DG from /committee/members,
    // but that table is only populated for years a district has filled into its
    // committee. The AUTHORITATIVE DG is the admin-entered district_governors record,
    // exposed publicly (no auth) at /api/public/club/{clubId}/district-governor?yearId=.
    // That endpoint resolves the DISTRICT from the club, so ANY serviceable club in the
    // district returns THIS district's governor — but the club must have a website
    // record (else 404), so we try the reference club first and then a few more of the
    // district's clubs until one resolves. They all resolve to the same governor.
    // Returns { memberId, memberName, profilePhoto, description, email, mobileNumber,
    // yearLabel, designation } or null. (Distinct from districtGovernors() above, which
    // hits the admin-only /api/district-governors and is 403 for the site token.)
    districtGovernor: function (yearId) {
      var yr = yearId != null ? yearId : config.yearId;
      function tryClub(cid) {
        if (!cid) return Promise.resolve(null);
        return request('/api/public/club/' + cid + '/district-governor', { yearId: yr })
          .then(function (d) { return d && d.memberName ? d : null; })
          .catch(function () { return null; });
      }
      return tryClub(config.refClubId).then(function (dg) {
        if (dg) return dg;
        // Reference club has no public website → try other district clubs (capped).
        return request('/api/mobile/club-finder', {
          districtNumber: config.districtNumber, page: 1, pageSize: 25,
        })
          .then(function (res) {
            var items = (res && res.items) || [];
            var ids = [];
            for (var i = 0; i < items.length && ids.length < 10; i++) {
              if (items[i].clubId && items[i].clubId !== config.refClubId) ids.push(items[i].clubId);
            }
            return (function next(i) {
              if (i >= ids.length) return null;
              return tryClub(ids[i]).then(function (d) { return d || next(i + 1); });
            })(0);
          })
          .catch(function () { return null; });
      });
    },

    // ---- Public projects ----
    // YEAR-SCOPED: the public-projects endpoint reuses the same numeric id across
    // Rotary years, so the id parsed from the avenue feed's publicPhotoUrl only
    // resolves to the SAME project when yearId is supplied. Without it the API
    // returns a different year's project entirely (wrong club/date/location/photos)
    // — which is why the detail page and card thumbnails showed unrelated projects.
    // (Note: the API honours `yearId`, NOT the `year=` param embedded in publicPhotoUrl.)
    publicProject: function (id, yearId) {
      return request('/api/public/projects/' + id, { yearId: yearId != null ? yearId : config.yearId });
    },
    clubProjectsPublic: function (clubId, params) {
      return request('/api/public/clubs/' + clubId + '/projects', params);
    },
  };

  // The current Rotary year label derived from today's date (Jul 1 – Jun 30).
  // Lets app.js/home.js show the right year IMMEDIATELY, before the API resolves
  // (and even if it never does), with no hardcoded fallback year.
  RotaryAPI.currentRotaryYearLabel = function () { return rotaryYearLabelForDate(); };

  // Resolve the live current Rotary year on boot (non-blocking; updates config).
  RotaryAPI.resolveCurrentYear = function () {
    return RotaryAPI.currentYear()
      .then(function (y) {
        if (y && y.id) {
          config.yearId = y.id;
          config.yearLabel = y.yearLabel;
        }
        return y;
      })
      .catch(function () {
        /* keep defaults on failure */
      });
  };

  global.RotaryAPI = RotaryAPI;
})(window);
