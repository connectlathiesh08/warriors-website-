/**
 * dome-gallery.js — 3D Fibonacci Sphere Photo Gallery
 * Implements a rotating 3D spherical photo cloud for "Echoes of the Warriors".
 */

window.initDomeGallery = function initDomeGallery(container, options) {
  if (!container) return;

  const images = options.images || [];
  if (!images.length) return;

  const onImageClick = options.onImageClick || (() => {});

  // Clear container
  container.innerHTML = '';

  // 1. Create Scene wrapper
  const scene = document.createElement('div');
  scene.className = 'dg-scene';
  container.appendChild(scene);

  // 2. Glow effect overlay background
  const glow = document.createElement('div');
  glow.className = 'dg-glow';
  scene.appendChild(glow);

  // 3. Globe transform base node
  const globe = document.createElement('div');
  globe.className = 'dg-globe';
  scene.appendChild(globe);

  // Globe dimensions config
  let radius = 280;
  const setResponsiveRadius = () => {
    if (window.innerWidth < 640) {
      radius = 180;
    } else if (window.innerWidth < 1024) {
      radius = 240;
    } else {
      radius = 280;
    }
  };
  setResponsiveRadius();

  // 4. Create and position cards on a Fibonacci Sphere
  const count = images.length;
  const cards = [];

  images.forEach((img, i) => {
    // Fibonacci Sphere math
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

    // Spherical coordinates
    const posX = radius * Math.sin(phi) * Math.cos(theta);
    const posY = radius * Math.sin(phi) * Math.sin(theta);
    const posZ = radius * Math.cos(phi);

    // Euler rotation angles to face outer surface
    const rotY = Math.atan2(posX, posZ);
    const rotX = -Math.atan2(posY, Math.sqrt(posX * posX + posZ * posZ));

    const card = document.createElement('div');
    card.className = 'dg-card';

    card.innerHTML = `
      <div class="dg-img-wrap">
        <img src="${img.src}" alt="${img.alt || 'Photo'}" class="dg-img" loading="lazy" />
      </div>
      <div class="dg-content">
        <h4 class="dg-title">${img.alt || 'Warrior Moment'}</h4>
        <span class="dg-footer">Warriors Gallery</span>
      </div>
    `;

    // Apply 3D coordinate transform
    const transformStr = `translate3d(${posX}px, ${posY}px, ${posZ}px) rotateY(${rotY}rad) rotateX(${rotX}rad)`;
    card.style.transform = transformStr;
    card.setAttribute('data-base-transform', transformStr);

    // Save initial coordinates for resize / scroll operations
    card.userData = { phi, theta, posX, posY, posZ, rotY, rotX };

    // Image detail callback
    card.addEventListener('click', (e) => {
      if (wasDragged) return;
      onImageClick({ index: i, ...img });
    });

    globe.appendChild(card);
    cards.push(card);
  });

  // State configurations for auto-rotation and touch dragging
  let angleX = 0;
  let angleY = 0;
  let isDragging = false;
  let wasDragged = false;
  let startX = 0;
  let startY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastTime = 0;
  let lastX = 0;
  let lastY = 0;

  let autoRotateSpeed = 0.006;
  let currentAutoRotateSpeed = autoRotateSpeed;

  const onStart = (e) => {
    isDragging = true;
    wasDragged = false;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    startX = clientX;
    startY = clientY;
    lastX = clientX;
    lastY = clientY;
    lastTime = Date.now();
    velocityX = 0;
    velocityY = 0;
    currentAutoRotateSpeed = 0; // stop auto rotation on grab
  };

  const onMove = (e) => {
    if (!isDragging) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const now = Date.now();
    const timeDelta = now - lastTime;

    const deltaX = clientX - lastX;
    const deltaY = clientY - lastY;

    if (timeDelta > 0) {
      velocityX = deltaX / timeDelta;
      velocityY = deltaY / timeDelta;
    }

    lastX = clientX;
    lastY = clientY;
    lastTime = now;

    if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
      wasDragged = true;
    }

    // Touch movement sensitivity
    angleY += deltaX * 0.005;
    angleX -= deltaY * 0.005;
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    // Decay inertia
    const decay = () => {
      if (isDragging) return;
      if (Math.abs(velocityX) < 0.001 && Math.abs(velocityY) < 0.001) {
        currentAutoRotateSpeed = autoRotateSpeed;
        return;
      }
      angleY += velocityX * 10;
      angleX -= velocityY * 10;

      velocityX *= 0.92;
      velocityY *= 0.92;
      requestAnimationFrame(decay);
    };
    decay();
  };

  // Event bindings
  container.addEventListener('mousedown', onStart);
  container.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  container.addEventListener('touchstart', onStart, { passive: true });
  container.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);

  // Resize handler
  const onResize = () => {
    setResponsiveRadius();
    cards.forEach((card) => {
      const u = card.userData;
      const posX = radius * Math.sin(u.phi) * Math.cos(u.theta);
      const posY = radius * Math.sin(u.phi) * Math.sin(u.theta);
      const posZ = radius * Math.cos(u.phi);

      const transformStr = `translate3d(${posX}px, ${posY}px, ${posZ}px) rotateY(${u.rotY}rad) rotateX(${u.rotX}rad)`;
      card.style.transform = transformStr;
      card.setAttribute('data-base-transform', transformStr);
      card.userData.posX = posX;
      card.userData.posY = posY;
      card.userData.posZ = posZ;
    });
  };
  window.addEventListener('resize', onResize);

  // Render animation Loop
  let reqId;
  const render = () => {
    if (!isDragging) {
      // Auto-spin on Y axis
      angleY += currentAutoRotateSpeed;
    }

    globe.style.transform = `rotateX(${angleX}rad) rotateY(${angleY}rad)`;
    reqId = requestAnimationFrame(render);
  };
  render();

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
