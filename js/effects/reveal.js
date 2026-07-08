/* Reveal — one-shot scroll reveal (vanilla port of Reveal.tsx / GSAP ScrollTrigger).
   Targets [data-reveal]. Hidden start: opacity 0, translateY(28px). Reveals when
   the element top crosses 88% of the viewport (ScrollTrigger start "top 88%"),
   once. 700ms ease-out. Honors prefers-reduced-motion (renders final immediately). */
window.initReveals = function initReveals(root) {
  root = root || document;
  var reduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
  if (!els.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) {
      el.style.opacity = '';
      el.style.transform = '';
    });
    return;
  }

  els.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.willChange = 'opacity, transform';
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transition =
          'opacity 0.7s cubic-bezier(0.165,0.84,0.44,1), transform 0.7s cubic-bezier(0.165,0.84,0.44,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.addEventListener(
          'transitionend',
          function () {
            el.style.willChange = '';
          },
          { once: true }
        );
        io.unobserve(el);
      });
    },
    // start: "top 88%" -> fire when the element's top reaches 88% of viewport
    // height, i.e. once it is 12% up from the bottom edge.
    { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0 }
  );

  els.forEach(function (el) {
    io.observe(el);
  });
}

// export default initReveals;
