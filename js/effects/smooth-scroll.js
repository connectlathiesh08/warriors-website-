/* Smooth scroll — Lenis (vanilla port of SmoothScroll.tsx + lib/smoothScroll.ts).
   Single shared instance; exposes stop/start for modal/lightbox scroll-lock.
   Disabled under prefers-reduced-motion. */
var Lenis = window.Lenis;

var lenis = null;
var rafId = null;

window.initSmoothScroll = function initSmoothScroll() {
  var reduce =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || lenis) return lenis;

  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);
  return lenis;
}

window.stopScroll = function stopScroll() {
  if (lenis) lenis.stop();
  else document.documentElement.classList.add('lenis-stopped');
}

window.startScroll = function startScroll() {
  if (lenis) lenis.start();
  else document.documentElement.classList.remove('lenis-stopped');
}

window.scrollToTopImmediate = function scrollToTopImmediate() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

window.getLenis = function getLenis() {
  return lenis;
}

// export default initSmoothScroll;
