/* ==========================================================================
   Rotaract Bangalore Warriors — blog-logic.js
   Handles real-time search, category filtering, newsletter form submissions,
   video modal player popups, and dynamic page interactions.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // State Management
  var activeCategory = 'All';
  var searchQuery = '';
  
  // DOM Elements
  var searchInput = document.getElementById('blog-search');
  var categoryPills = document.querySelectorAll('.category-pill');
  var blogCards = document.querySelectorAll('.blog-card');
  var videoModal = document.getElementById('video-modal');
  var videoModalClose = document.querySelectorAll('[data-video-close]');
  var videoIframe = document.getElementById('modal-video-iframe');
  var newsletterForm = document.getElementById('newsletter-form');
  var loadMoreBtn = document.getElementById('load-more-btn');

  // Video Mapping Data
  var videoData = {
    'annadhan': {
      type: 'reel',
      url: 'https://www.instagram.com/reel/C5Yo7b9SP5W/'
    },
    'flavours': {
      type: 'reel',
      url: 'https://www.instagram.com/reel/C3f5O9zyp8a/'
    }
  };

  /* ----------------------------------------------------------------------
     1. Search & Filter Cards Core Handler
     ---------------------------------------------------------------------- */
  function filterBlogCards() {
    blogCards.forEach(function(card) {
      var title = (card.querySelector('.card-title').textContent || '').toLowerCase();
      var desc = (card.querySelector('.card-desc').textContent || '').toLowerCase();
      var categories = (card.getAttribute('data-categories') || '').split(',');

      var matchesSearch = title.indexOf(searchQuery) !== -1 || desc.indexOf(searchQuery) !== -1;
      
      var matchesCategory = false;
      if (activeCategory === 'All') {
        matchesCategory = true;
      } else {
        matchesCategory = categories.indexOf(activeCategory) !== -1;
      }

      if (matchesSearch && matchesCategory) {
        card.style.display = '';
        card.classList.remove('opacity-0', 'scale-95');
        card.classList.add('opacity-100', 'scale-100');
      } else {
        card.style.display = 'none';
        card.classList.remove('opacity-100', 'scale-100');
        card.classList.add('opacity-0', 'scale-95');
      }
    });
  }

  // Handle Search Input
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchQuery = (e.target.value || '').toLowerCase().trim();
      filterBlogCards();
    });
  }

  // Handle Category Pills
  categoryPills.forEach(function(pill) {
    pill.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update UI active class
      categoryPills.forEach(function(p) {
        p.classList.remove('bg-[#8B003A]', 'text-white');
        p.classList.add('bg-white', 'text-slate-655', 'hover:bg-slate-50');
      });

      pill.classList.remove('bg-white', 'text-slate-655', 'hover:bg-slate-50');
      pill.classList.add('bg-[#8B003A]', 'text-white');

      // Update State
      activeCategory = pill.getAttribute('data-category');
      filterBlogCards();
    });
  });

  /* ----------------------------------------------------------------------
     2. Video Modal Player Popup (Official Instagram Reel Embeds)
     ---------------------------------------------------------------------- */
  function setupCardClickListeners() {
    blogCards.forEach(function(card) {
      // Remove any existing listeners first
      var newCard = card.cloneNode(true);
      if (card.parentNode) {
        card.parentNode.replaceChild(newCard, card);
      }
    });

    // Re-select cards and bind events
    blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        var id = card.getAttribute('data-id');
        var item = videoData[id];
        if (!item || !videoModal) return;

        e.preventDefault();
        
        // Open Modal
        videoModal.classList.remove('opacity-0', 'pointer-events-none');
        var cardContent = videoModal.querySelector('.modal-card-content');
        if (cardContent) {
          cardContent.classList.remove('scale-95', 'translate-y-4');
          cardContent.classList.add('scale-100', 'translate-y-0');
        }

        if (videoIframe) {
          // Format base URL (ensuring it ends with /embed/)
          var baseReelUrl = item.url.split('?')[0];
          if (baseReelUrl.substr(-1) !== '/') {
            baseReelUrl += '/';
          }
          videoIframe.src = baseReelUrl + 'embed/';
        }
      });
    });
  }

  setupCardClickListeners();

  // Close Modal Handler
  function closeModal() {
    if (!videoModal) return;
    var cardContent = videoModal.querySelector('.modal-card-content');
    if (cardContent) {
      cardContent.classList.add('scale-95', 'translate-y-4');
      cardContent.classList.remove('scale-100', 'translate-y-0');
    }
    
    setTimeout(function() {
      videoModal.classList.add('opacity-0', 'pointer-events-none');
      if (videoIframe) videoIframe.src = '';
    }, 250);
  }

  videoModalClose.forEach(function(b) {
    b.addEventListener('click', closeModal);
  });

  /* ----------------------------------------------------------------------
     3. Newsletter Toast Notifications
     ---------------------------------------------------------------------- */
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      if (!input || !input.value) return;

      var email = input.value.trim();
      
      // Render Toast
      var toast = document.createElement('div');
      toast.className = 'fixed bottom-8 right-8 z-[9000] flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl transition duration-300 transform translate-y-12 opacity-0 font-display text-xs border border-white/10';
      toast.innerHTML = '🎉 <span class="font-bold text-amber-500">Subscribed successfully!</span> Thank you for joining our journey.';
      document.body.appendChild(toast);

      // Slide in
      setTimeout(function() {
        toast.classList.remove('translate-y-12', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
      }, 10);

      // Reset Input
      input.value = '';

      // Slide out and remove
      setTimeout(function() {
        toast.classList.add('translate-y-12', 'opacity-0');
        setTimeout(function() {
          toast.remove();
        }, 300);
      }, 4000);
    });
  }

  /* ----------------------------------------------------------------------
     4. Load More Spinner Simulation
     ---------------------------------------------------------------------- */
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      var icon = loadMoreBtn.querySelector('svg');
      if (icon) icon.classList.add('animate-spin');
      loadMoreBtn.classList.add('pointer-events-none', 'opacity-80');
      var btnText = loadMoreBtn.querySelector('span');
      if (btnText) btnText.textContent = 'Loading Stories...';

      // Simulate API fetch delay
      setTimeout(function() {
        if (icon) icon.classList.remove('animate-spin');
        loadMoreBtn.classList.remove('pointer-events-none', 'opacity-80');
        if (btnText) btnText.textContent = 'Load More';
        
        // Show success/no-more toast
        var toast = document.createElement('div');
        toast.className = 'fixed bottom-8 right-8 z-[9000] flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl transition duration-300 transform translate-y-12 opacity-0 font-display text-xs border border-[#8B003A]/25';
        toast.innerHTML = '✨ <span class="font-bold text-amber-500">You are all caught up!</span> No additional posts available.';
        document.body.appendChild(toast);

        setTimeout(function() {
          toast.classList.remove('translate-y-12', 'opacity-0');
          toast.classList.add('translate-y-0', 'opacity-100');
        }, 10);

        setTimeout(function() {
          toast.classList.add('translate-y-12', 'opacity-0');
          setTimeout(function() {
            toast.remove();
          }, 300);
        }, 3500);

      }, 1500);
    });
  }

  /* ----------------------------------------------------------------------
     5. Live Instagram Reels Auto-Sync Loader
     ---------------------------------------------------------------------- */
  // Paste your RSS.app Instagram feed URL here (e.g. from rss.app or similar feed generator)
  // This converts your Instagram feed into JSON dynamically and updates the website!
  var INSTAGRAM_FEED_RSS = ''; // e.g. 'https://rss.app/feeds/v1/open/YOUR_FEED_ID'

  function loadLiveInstagramReels() {
    if (!INSTAGRAM_FEED_RSS) {
      console.log('Instagram Live Feed RSS not configured. Displaying static mockup reels.');
      return;
    }

    var apiEndpoint = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(INSTAGRAM_FEED_RSS);

    fetch(apiEndpoint)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.status === 'ok' && data.items) {
          // Remove static fallback Reel cards from the DOM (cards with data-type="reel")
          var staticReels = document.querySelectorAll('.blog-card[data-type="reel"]');
          staticReels.forEach(function(el) { el.remove(); });

          var gridContainer = document.querySelector('#blog-grid .grid');
          if (!gridContainer) return;

          // Parse and render the latest items from Instagram
          var reelsCount = 0;
          data.items.forEach(function(item) {
            reelsCount++;
            if (reelsCount > 6) return; // Limit to 6 items

            var pubDate = new Date(item.pubDate);
            var dateStr = pubDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            
            var uniqueId = 'live-reel-' + reelsCount;
            var title = item.title || 'Rotaract Warriors Reel';
            var desc = item.description || 'Watch our latest reel on Instagram.';
            
            // Clean description if it contains HTML
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = desc;
            desc = tempDiv.textContent || tempDiv.innerText || desc;
            if (desc.length > 100) desc = desc.substring(0, 97) + '...';

            var link = item.link || 'https://www.instagram.com/racb_warriors/';
            var img = item.thumbnail || item.enclosure?.link || 'assets/img/blog/blog_annadhan.png';

            // Register this live item inside videoData mapping
            videoData[uniqueId] = {
              type: 'reel',
              url: link,
              title: title,
              duration: 'Reel',
              likes: 'Live',
              comments: 'Live',
              img: img
            };

            // Build dynamic card element
            var card = document.createElement('div');
            card.className = 'blog-card flex flex-col bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition duration-300 cursor-pointer';
            card.setAttribute('data-id', uniqueId);
            card.setAttribute('data-type', 'reel');
            card.setAttribute('data-categories', 'Projects,Reels');

            card.innerHTML = 
              '<div class="relative aspect-video w-full overflow-hidden card-zoom bg-slate-900">' +
                '<img src="' + img + '" alt="' + title + '" class="h-full w-full object-cover transition duration-500" />' +
                '<span class="absolute top-4 left-4 bg-pink-600/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider text-white uppercase flex items-center gap-1.5">' +
                  '<span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>' +
                  'Reels' +
                '</span>' +
                '<span class="absolute top-4 right-4 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-bold text-white">Reel</span>' +
                '<div class="play-overlay absolute inset-0 bg-black/35 flex items-center justify-center">' +
                  '<span class="h-14 w-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#8B003A] shadow-lg transform scale-90 hover:scale-100 transition duration-300">' +
                    '<svg class="h-7 w-7 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
                  '</span>' +
                '</div>' +
              '</div>' +
              '<div class="p-6.5 text-left flex flex-col justify-between flex-grow">' +
                '<div>' +
                  '<h3 class="card-title text-base font-extrabold text-slate-900 tracking-tight leading-snug">' + title + '</h3>' +
                  '<p class="card-desc text-slate-550 text-xs mt-3 leading-relaxed">' + desc + '</p>' +
                '</div>' +
                '<div class="border-t border-slate-100 pt-5 mt-6 flex flex-col gap-3">' +
                  '<div class="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">' +
                    '<span>📅 ' + dateStr + '</span>' +
                    '<span>👁️ Instagram Live</span>' +
                  '</div>' +
                  '<span class="text-[11px] font-black text-[#8B003A] tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all">' +
                    'Watch on Instagram Reels →' +
                  '</span>' +
                '</div>' +
              '</div>';

            // Add click listener to open live reel in our modal
            card.addEventListener('click', function(e) {
              e.preventDefault();
              if (!videoModal) return;

              videoModal.classList.remove('opacity-0', 'pointer-events-none');
              var cardContent = videoModal.querySelector('.modal-card-content');
              if (cardContent) {
                cardContent.classList.remove('scale-95', 'translate-y-4');
                cardContent.classList.add('scale-100', 'translate-y-0');
              }

              if (videoIframe) {
                var baseReelUrl = link.split('?')[0];
                if (baseReelUrl.substr(-1) !== '/') {
                  baseReelUrl += '/';
                }
                videoIframe.src = baseReelUrl + 'embed/';
              }
            });

            gridContainer.appendChild(card);
          });

          // Refresh query selectors
          blogCards = document.querySelectorAll('.blog-card');
          filterBlogCards();
        }
      })
      .catch(function(err) {
        console.error('Error loading live Instagram Reels feed:', err);
      });
  }

  // Initial load
  loadLiveInstagramReels();
});
