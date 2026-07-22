(function () {
  'use strict';

  function initUdayaCelebration() {
    // 1. Expiry Check: Only run until July 29, 2026 23:59:59 (End of July 29)
    var now = new Date();
    var expiryDate = new Date(2026, 6, 30, 0, 0, 0); // Month is 0-indexed: 6 = July 30 00:00:00
    if (now >= expiryDate) {
      // Past July 29th, 2026 - Do not run celebration blast
      return;
    }

    if (document.getElementById('udaya-celebration-container')) return;

    // Create Container
    var container = document.createElement('div');
    container.id = 'udaya-celebration-container';
    container.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 999990; overflow: hidden;';

    // Create Canvas for Confetti & Fireworks
    var canvas = document.createElement('canvas');
    canvas.id = 'udaya-confetti-canvas';
    canvas.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999991;';
    container.appendChild(canvas);

    // Inject Styles for Banner & Animations
    var style = document.createElement('style');
    style.innerHTML = '\
      @keyframes udayaSlideDown {\
        0% { transform: translate(-50%, -100%) scale(0.8); opacity: 0; }\
        100% { transform: translate(-50%, 0) scale(1); opacity: 1; }\
      }\
      @keyframes udayaPulseGlow {\
        0%, 100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6), 0 12px 45px rgba(139, 0, 58, 0.35); }\
        50% { box-shadow: 0 0 45px rgba(255, 215, 0, 0.95), 0 18px 65px rgba(139, 0, 58, 0.6); }\
      }\
      @keyframes udayaShimmer {\
        0% { background-position: -200% 0; }\
        100% { background-position: 200% 0; }\
      }\
      @keyframes udayaFloatText {\
        0%, 100% { transform: translateY(0px); }\
        50% { transform: translateY(-4px); }\
      }\
      @keyframes udayaPulse {\
        0%, 100% { transform: scale(1); opacity: 1; }\
        50% { transform: scale(1.4); opacity: 0.6; }\
      }\
      .udaya-banner-card {\
        position: fixed;\
        top: 20px;\
        left: 50%;\
        transform: translateX(-50%);\
        z-index: 999995;\
        pointer-events: auto;\
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 249, 242, 0.98) 100%);\
        backdrop-filter: blur(16px);\
        -webkit-backdrop-filter: blur(16px);\
        border: 2.5px solid #FFD700;\
        border-radius: 28px;\
        padding: 18px 28px;\
        text-align: center;\
        font-family: "Poppins", "Inter", system-ui, sans-serif;\
        animation: udayaSlideDown 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), udayaPulseGlow 3s infinite;\
        max-width: 92vw;\
        width: 500px;\
        box-sizing: border-box;\
        max-height: 90vh;\
        overflow-y: auto;\
        transition: opacity 0.5s ease, transform 0.5s ease;\
      }\
      .udaya-title-text {\
        font-size: 38px;\
        font-weight: 900;\
        letter-spacing: 4px;\
        background: linear-gradient(90deg, #8B003A 0%, #D4AF37 35%, #8B003A 70%, #D4AF37 100%);\
        background-size: 200% auto;\
        -webkit-background-clip: text;\
        -webkit-text-fill-color: transparent;\
        animation: udayaShimmer 3s linear infinite, udayaFloatText 2.5s ease-in-out infinite;\
        line-height: 1.05;\
        margin: 6px 0 2px 0;\
      }\
      .udaya-welcome-badge {\
        display: inline-flex;\
        align-items: center;\
        gap: 6px;\
        background: linear-gradient(90deg, #8B003A, #70002E);\
        color: #FFD700;\
        font-size: 11px;\
        font-weight: 800;\
        text-transform: uppercase;\
        letter-spacing: 2px;\
        padding: 5px 16px;\
        border-radius: 99px;\
        box-shadow: 0 4px 14px rgba(139, 0, 58, 0.3);\
      }\
      .udaya-subtitle {\
        color: #1E293B;\
        font-size: 12px;\
        font-weight: 800;\
        letter-spacing: 0.8px;\
        text-transform: uppercase;\
        line-height: 1.4;\
        margin-top: 2px;\
      }\
      .udaya-photo-wrap {\
        margin-top: 10px;\
        border-radius: 16px;\
        overflow: hidden;\
        border: 2px solid rgba(212, 175, 55, 0.4);\
        box-shadow: 0 10px 25px rgba(139, 0, 58, 0.15);\
        max-height: 200px;\
        background: #f8fafc;\
      }\
      .udaya-photo-img {\
        width: 100%;\
        height: 100%;\
        max-height: 200px;\
        object-fit: cover;\
        display: block;\
        transition: transform 0.5s ease;\
      }\
      .udaya-photo-wrap:hover .udaya-photo-img {\
        transform: scale(1.03);\
      }\
      .udaya-thankyou-msg {\
        color: #8B003A;\
        font-size: 13px;\
        font-weight: 700;\
        line-height: 1.4;\
        margin-top: 10px;\
        padding: 0 8px;\
      }\
      .udaya-timer-bar-wrap {\
        width: 100%;\
        height: 5px;\
        background: rgba(139, 0, 58, 0.1);\
        border-radius: 99px;\
        margin-top: 10px;\
        overflow: hidden;\
      }\
      .udaya-timer-bar-fill {\
        height: 100%;\
        background: linear-gradient(90deg, #FFD700, #8B003A);\
        width: 100%;\
        transition: width 1s linear;\
      }\
      .udaya-close-btn {\
        position: absolute;\
        top: 10px;\
        right: 12px;\
        background: rgba(139, 0, 58, 0.08);\
        border: none;\
        color: #8B003A;\
        font-size: 18px;\
        font-weight: bold;\
        width: 30px;\
        height: 30px;\
        border-radius: 50%;\
        cursor: pointer;\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        transition: all 0.2s ease;\
      }\
      .udaya-close-btn:hover {\
        background: #8B003A;\
        color: #FFFFFF;\
      }\
    ';
    document.head.appendChild(style);

    // Create Banner HTML
    var banner = document.createElement('div');
    banner.className = 'udaya-banner-card';
    banner.innerHTML = '\
      <button class="udaya-close-btn" id="udaya-close" title="Close Banner">&times;</button>\
      <div class="udaya-welcome-badge">\
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>\
        WELCOME\
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>\
      </div>\
      <div class="udaya-title-text">UDAYA</div>\
      <div class="udaya-subtitle">THE 4TH INSTALLATION OF ROTARACT CLUB OF BANGALORE WARRIORS</div>\
      <div class="udaya-photo-wrap">\
        <img src="assets/img/inauguration_group.png?v=2" alt="Website Inauguration Group Photo" class="udaya-photo-img" onerror="this.src=\'/api/project-image/1F2GHR7hognIvng47WpVFDbGTrHB85M6I\'" />\
      </div>\
      <div class="udaya-thankyou-msg">\
        A heartfelt thank you to our esteemed dignitaries for inaugurating our official website.\
      </div>\
      <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">\
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; animation: udayaPulse 1s infinite;"></span>\
        <span id="udaya-countdown-text">Celebration Blast active (60s)</span>\
      </div>\
      <div class="udaya-timer-bar-wrap">\
        <div class="udaya-timer-bar-fill" id="udaya-timer-fill"></div>\
      </div>\
    ';
    container.appendChild(banner);
    document.body.appendChild(container);

    // Canvas Confetti & Particle Engine
    var ctx = canvas.getContext('2d');
    var width = (canvas.width = window.innerWidth);
    var height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    var colors = ['#8B003A', '#FFD700', '#E6007E', '#005DAA', '#FFFFFF', '#FF7A00', '#00C853'];
    var particles = [];
    var udayaFloaters = [];
    var totalTime = 60; // 60 seconds full blast duration
    var remainingTime = totalTime;
    var isRunning = true;

    // Create standard confetti particle
    function createParticle(x, y) {
      return {
        x: x !== undefined ? x : Math.random() * width,
        y: y !== undefined ? y : -20,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 6 - 3,
        vy: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        shape: Math.random() > 0.3 ? 'rect' : 'circle',
        opacity: 1
      };
    }

    // Create floating "UDAYA" text particle
    function createUdayaFloater() {
      return {
        x: Math.random() * (width - 140) + 70,
        y: height + 30,
        vy: -(Math.random() * 2 + 1.5),
        vx: Math.random() * 1.5 - 0.75,
        size: Math.floor(Math.random() * 10) + 20,
        color: Math.random() > 0.5 ? '#8B003A' : '#D4AF37',
        opacity: 1,
        text: 'UDAYA'
      };
    }

    // Initial Burst
    for (var i = 0; i < 160; i++) {
      particles.push(createParticle(Math.random() * width, Math.random() * height * 0.7));
    }

    // Continuous Blast Spawner (runs for 60s)
    var spawnInterval = setInterval(function () {
      if (!isRunning) return;
      for (var k = 0; k < 6; k++) {
        particles.push(createParticle());
      }
      if (Math.random() < 0.4 && udayaFloaters.length < 10) {
        udayaFloaters.push(createUdayaFloater());
      }
    }, 150);

    // Cannon Explosions (bottom corners - runs for 60s)
    var cannonInterval = setInterval(function () {
      if (!isRunning) return;
      for (var c1 = 0; c1 < 25; c1++) {
        var p1 = createParticle(10, height - 10);
        p1.vx = Math.random() * 12 + 4;
        p1.vy = -(Math.random() * 14 + 8);
        particles.push(p1);
      }
      for (var c2 = 0; c2 < 25; c2++) {
        var p2 = createParticle(width - 10, height - 10);
        p2.vx = -(Math.random() * 12 + 4);
        p2.vy = -(Math.random() * 14 + 8);
        particles.push(p2);
      }
    }, 2500);

    // Render Animation Loop
    function render() {
      if (!isRunning && particles.length === 0 && udayaFloaters.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Render Confetti
      for (var j = particles.length - 1; j >= 0; j--) {
        var p = particles[j];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (p.y > height + 20) {
          particles.splice(j, 1);
        }
      }

      // Render Floating "UDAYA" Text
      for (var u = udayaFloaters.length - 1; u >= 0; u--) {
        var uf = udayaFloaters[u];
        uf.x += uf.vx;
        uf.y += uf.vy;

        ctx.save();
        ctx.font = '900 ' + uf.size + "px 'Poppins', sans-serif";
        ctx.fillStyle = uf.color;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(uf.text, uf.x, uf.y);
        ctx.restore();

        if (uf.y < -30) {
          udayaFloaters.splice(u, 1);
        }
      }

      requestAnimationFrame(render);
    }

    render();

    // 60-Second Countdown & Progress Bar
    var timerFill = document.getElementById('udaya-timer-fill');
    var timerText = document.getElementById('udaya-countdown-text');

    var countdownInterval = setInterval(function () {
      remainingTime--;
      if (timerText) {
        timerText.innerText = 'Celebration Blast active (' + remainingTime + 's)';
      }
      if (timerFill) {
        timerFill.style.width = (remainingTime / totalTime) * 100 + '%';
      }

      if (remainingTime <= 0) {
        stopCelebration();
      }
    }, 1000);

    // Stop Celebration Handler (Fires after 60s)
    function stopCelebration() {
      isRunning = false;
      clearInterval(spawnInterval);
      clearInterval(cannonInterval);
      clearInterval(countdownInterval);

      if (container && container.parentNode) {
        container.style.transition = 'opacity 1s ease, transform 1s ease';
        container.style.opacity = '0';
        setTimeout(function () {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }, 1000);
      }
    }

    // Close Popup Banner ONLY (Confetti & Blast CONTINUE for full 60 seconds)
    var closeBtn = document.getElementById('udaya-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (banner && banner.parentNode) {
          banner.style.opacity = '0';
          banner.style.transform = 'translate(-50%, -20px) scale(0.9)';
          setTimeout(function () {
            if (banner.parentNode) {
              banner.parentNode.removeChild(banner);
            }
          }, 500);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUdayaCelebration);
  } else {
    initUdayaCelebration();
  }
})();
