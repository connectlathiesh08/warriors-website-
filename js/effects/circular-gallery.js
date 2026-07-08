/**
 * circular-gallery.js — Horizontal Draggable Project Showcase Gallery
 * Implements a responsive, interactive, touch-draggable horizontal showcase
 * for the "Our Projects" section.
 */

window.initCircularGallery = function initCircularGallery(container, options) {
  if (!container) return;

  const items = options.items || [];
  if (!items.length) return;

  const onItemClick = options.onItemClick || (() => {});
  const textColor = options.textColor || '#0B2B6B';

  // Clear container
  container.innerHTML = '';

  // Track wrapper
  const track = document.createElement('div');
  track.className = 'cg-track';
  container.appendChild(track);

  // Render items
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'cg-card';
    
    card.innerHTML = `
      <div class="cg-img-wrap">
        <img src="${item.image}" alt="${item.text || 'Project'}" class="cg-img" loading="lazy" />
      </div>
      <div class="cg-text-wrap">
        <span class="cg-category">Warriors Project</span>
        <h4 class="cg-title" style="color: ${textColor}">${item.text || 'Warrior Project'}</h4>
      </div>
    `;

    // Click event
    card.addEventListener('click', (e) => {
      // If user dragged, don't trigger click action
      if (wasDragged) return;
      onItemClick(item);
    });

    track.appendChild(card);
  });

  // State variables for dragging
  let isDragging = false;
  let startX = 0;
  let scrollLeftX = 0;
  let walkX = 0;
  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let wasDragged = false;
  let velocityX = 0;
  let lastTime = 0;
  let lastX = 0;

  const dragDamping = 0.92;

  const getClientX = (e) => {
    return e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const onStart = (e) => {
    isDragging = true;
    container.style.cursor = 'grabbing';
    startX = getClientX(e);
    scrollLeftX = currentTranslateX;
    wasDragged = false;
    velocityX = 0;
    lastTime = Date.now();
    lastX = startX;
  };

  const onMove = (e) => {
    if (!isDragging) return;
    
    const clientX = getClientX(e);
    const now = Date.now();
    const timeDelta = now - lastTime;
    const distanceDelta = clientX - lastX;

    if (timeDelta > 0) {
      velocityX = distanceDelta / timeDelta;
    }

    lastTime = now;
    lastX = clientX;

    const deltaX = clientX - startX;
    if (Math.abs(deltaX) > 5) {
      wasDragged = true;
    }

    targetTranslateX = scrollLeftX + deltaX;
    
    // Bounds constraints
    const maxScroll = 0;
    const minScroll = -(track.offsetWidth - container.offsetWidth + 48); // 48px padding
    
    if (targetTranslateX > maxScroll) {
      targetTranslateX = maxScroll + (targetTranslateX - maxScroll) * 0.3; // Elastic bounce limit
    } else if (targetTranslateX < minScroll) {
      targetTranslateX = minScroll + (targetTranslateX - minScroll) * 0.3;
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    container.style.cursor = 'grab';

    // Apply inertia based on drag velocity
    const inertiaScale = 120;
    targetTranslateX += velocityX * inertiaScale;

    // Bounce back into boundaries
    const maxScroll = 0;
    const minScroll = -(track.offsetWidth - container.offsetWidth + 48);
    
    if (targetTranslateX > maxScroll) {
      targetTranslateX = maxScroll;
    } else if (targetTranslateX < minScroll) {
      targetTranslateX = minScroll;
    }
  };

  // Drag event listeners
  container.addEventListener('mousedown', onStart);
  container.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  container.addEventListener('touchstart', onStart, { passive: true });
  container.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);

  // Resize handler
  const onResize = () => {
    const maxScroll = 0;
    const minScroll = -(track.offsetWidth - container.offsetWidth + 48);
    if (targetTranslateX > maxScroll) targetTranslateX = maxScroll;
    if (targetTranslateX < minScroll) targetTranslateX = minScroll;
  };
  window.addEventListener('resize', onResize);

  // Auto-scroll configurations
  let scrollDirection = -1; // -1 for left, 1 for right
  const autoScrollSpeed = 1.0;

  // Animation Loop
  let reqId;
  const tick = () => {
    if (!isDragging) {
      targetTranslateX += scrollDirection * autoScrollSpeed;
      
      const maxScroll = 0;
      const minScroll = -(track.offsetWidth - container.offsetWidth + 48);
      
      if (track.offsetWidth > container.offsetWidth) {
        if (targetTranslateX <= minScroll) {
          targetTranslateX = minScroll;
          scrollDirection = 1; // reverse to right
        } else if (targetTranslateX >= maxScroll) {
          targetTranslateX = maxScroll;
          scrollDirection = -1; // reverse to left
        }
      } else {
        targetTranslateX = 0;
      }
    }

    // Lerp translation for fluid elastic motion
    currentTranslateX = currentTranslateX * 0.88 + targetTranslateX * 0.12;
    track.style.transform = `translateX(${currentTranslateX}px)`;
    reqId = requestAnimationFrame(tick);
  };
  tick();

  return () => {
    cancelAnimationFrame(reqId);
    container.removeEventListener('mousedown', onStart);
    container.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    container.removeEventListener('touchstart', onStart);
    container.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);
    window.removeEventListener('resize', onResize);
  };
};
