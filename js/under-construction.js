(function() {
    if (localStorage.getItem('dev_bypass') === '8197176867') {
        return;
    }

    // Hide original page content scroll and prepare for overlay
    const style = document.createElement('style');
    style.id = 'construction-hide-style';
    style.innerHTML = `
        html, body { 
            overflow: hidden !important; 
            height: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important; 
        }
        body > * {
            display: none !important;
        }
        #construction-overlay {
            display: flex !important;
        }
        #construction-overlay * {
            display: flex;
        }
    `;
    
    // Inject stylesheet immediately in head
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(style);
        });
    }

    // Injections to build the under construction screen
    document.addEventListener('DOMContentLoaded', () => {
        // Ensure body is clean of other displayed items
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (child.id !== 'construction-overlay') {
                child.style.display = 'none';
            }
        });

        const overlay = document.createElement('div');
        overlay.id = 'construction-overlay';
        
        // CSS Style for the Construction screen
        const overlayStyle = document.createElement('style');
        overlayStyle.innerHTML = `
            #construction-overlay {
                position: fixed;
                inset: 0;
                background: radial-gradient(circle at center, #0B192C 0%, #000814 100%);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #FFFFFF;
                font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                text-align: center;
                padding: 1.5rem;
                overflow: hidden;
            }
            .mandala-bg {
                position: absolute;
                width: 100%;
                height: 100%;
                opacity: 0.08;
                pointer-events: none;
                z-index: 0;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M50 0 C55 20, 45 20, 50 40 C55 45, 55 55, 50 60 C45 80, 55 80, 50 100' stroke='%23D4AF37' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0 50 C20 55, 20 45, 40 50 C45 55, 55 55, 60 50 C80 45, 80 55, 100 50' stroke='%23D4AF37' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='50' cy='50' r='12' stroke='%23D4AF37' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='50' cy='50' r='25' stroke='%23D4AF37' stroke-width='0.5' fill='none'/%3E%3C/svg%3E");
            }
            .bell {
                position: absolute;
                top: 0;
                width: 60px;
                height: 150px;
                opacity: 0.85;
                z-index: 1;
                pointer-events: none;
                animation: swing 3s ease-in-out infinite alternate;
                transform-origin: top center;
            }
            .bell-left { left: 8%; }
            .bell-right { right: 8%; animation-delay: -1.5s; }
            @media (max-width: 639px) {
                .bell { width: 35px; height: 100px; }
                .bell-left { left: 4%; }
                .bell-right { right: 4%; }
            }
            .header-logos {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1.5rem;
                margin-bottom: 2rem;
                z-index: 2;
                flex-wrap: wrap;
            }
            .header-logos img {
                height: 32px;
                object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }
            @media (max-width: 639px) {
                .header-logos img { height: 20px; }
                .header-logos { gap: 0.75rem; margin-bottom: 1.5rem; }
            }
            .main-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 2;
                max-w-2xl;
            }
            .invitation-text {
                font-size: 0.875rem;
                font-weight: 600;
                letter-spacing: 0.2em;
                color: #C5A880;
                text-transform: uppercase;
                margin-bottom: 0.5rem;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            }
            .invitation-sub {
                font-size: 1.125rem;
                font-weight: 500;
                letter-spacing: 0.05em;
                color: #E2E8F0;
                margin-bottom: 1.5rem;
            }
            .udaya-logo-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 2rem;
            }
            .sun-emblem {
                width: 100px;
                height: 50px;
                background: radial-gradient(ellipse at bottom, #FFD700 0%, #FFA500 70%, transparent 100%);
                border-radius: 100px 100px 0 0;
                position: relative;
                box-shadow: 0 -15px 30px rgba(255, 215, 0, 0.4);
                margin-bottom: 0.25rem;
            }
            .sun-emblem::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 140px;
                height: 1px;
                background: linear-gradient(90deg, transparent, #FFD700, transparent);
            }
            .udaya-title {
                font-size: 4rem;
                font-weight: 900;
                letter-spacing: 0.15em;
                line-height: 1.1;
                background: linear-gradient(135deg, #FFE07D 0%, #D4AF37 50%, #B8860B 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-transform: uppercase;
                margin: 0;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            }
            .udaya-tagline {
                font-size: 0.75rem;
                font-weight: 800;
                letter-spacing: 0.35em;
                color: #FFD700;
                text-transform: uppercase;
                margin-top: 0.5rem;
            }
            @media (max-width: 639px) {
                .udaya-title { font-size: 2.75rem; }
                .sun-emblem { width: 70px; height: 35px; }
                .udaya-tagline { font-size: 0.65rem; letter-spacing: 0.25em; }
            }
            .construction-banner {
                background: rgba(139, 0, 58, 0.2);
                border: 1px solid rgba(139, 0, 58, 0.4);
                border-radius: 1rem;
                padding: 1rem 2rem;
                margin-bottom: 2rem;
                backdrop-filter: blur(8px);
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            }
            .construction-title {
                font-size: 1.125rem;
                font-weight: 800;
                color: #FF4A82;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                margin-bottom: 0.25rem;
            }
            .construction-desc {
                font-size: 0.875rem;
                font-weight: 500;
                color: #E2E8F0;
            }
            @media (max-width: 639px) {
                .construction-banner { padding: 0.75rem 1.25rem; margin-bottom: 1.5rem; }
                .construction-title { font-size: 0.95rem; }
                .construction-desc { font-size: 0.75rem; }
            }
            
            /* Countdown grid style */
            .countdown-container {
                display: flex;
                gap: 1rem;
                margin-bottom: 2.5rem;
            }
            .countdown-box {
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 1rem;
                width: 90px;
                height: 90px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                backdrop-filter: blur(4px);
                position: relative;
            }
            .countdown-box::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: rgba(255, 255, 255, 0.015);
                border-radius: 1rem 1rem 0 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            }
            .countdown-num {
                font-size: 2.25rem;
                font-weight: 800;
                color: #FFD700;
                line-height: 1.1;
                z-index: 1;
            }
            .countdown-lbl {
                font-size: 0.625rem;
                font-weight: 700;
                color: #94A3B8;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-top: 0.25rem;
                z-index: 1;
            }
            @media (max-width: 639px) {
                .countdown-container { gap: 0.5rem; margin-bottom: 2rem; }
                .countdown-box { width: 68px; height: 68px; border-radius: 0.75rem; }
                .countdown-num { font-size: 1.5rem; }
                .countdown-lbl { font-size: 0.5rem; }
            }
            
            /* Pincode developer access style */
            .dev-access-trigger {
                font-size: 0.75rem;
                color: #475569;
                cursor: pointer;
                transition: color 0.2s;
                text-decoration: underline;
                z-index: 10;
                user-select: none;
                margin-top: 1rem;
            }
            .dev-access-trigger:hover {
                color: #94A3B8;
            }
            .pincode-panel {
                display: none;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                margin-top: 1rem;
                z-index: 10;
                animation: fadeIn 0.3s ease-out;
            }
            .pincode-input {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #475569;
                border-radius: 0.5rem;
                color: #FFFFFF;
                font-size: 0.875rem;
                font-weight: bold;
                letter-spacing: 0.3em;
                padding: 0.5rem 1rem;
                text-align: center;
                width: 150px;
                outline: none;
                transition: border-color 0.2s;
            }
            .pincode-input:focus {
                border-color: #D4AF37;
            }
            .pincode-error {
                color: #FF4A82;
                font-size: 0.675rem;
                font-weight: 700;
                display: none;
            }

            @keyframes swing {
                0% { transform: rotate(-5deg); }
                100% { transform: rotate(5deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(overlayStyle);

        // Build HTML content structure
        overlay.innerHTML = `
            <div class="mandala-bg"></div>
            
            <!-- Suspension Bells SVG -->
            <svg class="bell bell-left" viewBox="0 0 60 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="30" y1="0" x2="30" y2="100" stroke="%23D4AF37" stroke-width="2"/>
                <path d="M15,100 C15,80 45,80 45,100 L48,115 C50,122 42,130 30,130 C18,130 10,122 12,115 Z" fill="%23D4AF37"/>
                <circle cx="30" cy="138" r="4" fill="%23D4AF37"/>
            </svg>
            <svg class="bell bell-right" viewBox="0 0 60 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="30" y1="0" x2="30" y2="100" stroke="%23D4AF37" stroke-width="2"/>
                <path d="M15,100 C15,80 45,80 45,100 L48,115 C50,122 42,130 30,130 C18,130 10,122 12,115 Z" fill="%23D4AF37"/>
                <circle cx="30" cy="138" r="4" fill="%23D4AF37"/>
            </svg>

            <!-- Rotary & Club Logos Header -->
            <div class="header-logos">
                <img src="assets/logos/rotary-left.png" onerror="this.style.display='none'" />
                <img src="assets/logos/rotaract-logo.png" onerror="this.style.display='none'" />
                <img src="assets/logos/manyata-logo.png" onerror="this.style.display='none'" />
                <img src="assets/logos/rotaract-right.png" onerror="this.style.display='none'" />
            </div>

            <div class="main-content">
                <span class="invitation-text">4th Installation Ceremony</span>
                <span class="invitation-sub">Rotaract Club of Bangalore Warriors</span>

                <!-- Udaya Sunrise Emblem -->
                <div class="udaya-logo-container">
                    <div class="sun-emblem"></div>
                    <h1 class="udaya-title">Udaya</h1>
                    <span class="udaya-tagline">Rise • Serve • Inspire</span>
                </div>

                <!-- Construction announcement -->
                <div class="construction-banner">
                    <div class="construction-title">⚠️ Under Construction</div>
                    <div class="construction-desc">Website will go live at 3:00 PM on 25th July 2026. See you all at UDAYA!</div>
                </div>

                <!-- Countdown Timer -->
                <div class="countdown-container">
                    <div class="countdown-box">
                        <span class="countdown-num" id="cd-days">00</span>
                        <span class="countdown-lbl">Days</span>
                    </div>
                    <div class="countdown-box">
                        <span class="countdown-num" id="cd-hours">00</span>
                        <span class="countdown-lbl">Hrs</span>
                    </div>
                    <div class="countdown-box">
                        <span class="countdown-num" id="cd-mins">00</span>
                        <span class="countdown-lbl">Mins</span>
                    </div>
                    <div class="countdown-box">
                        <span class="countdown-num" id="cd-secs">00</span>
                        <span class="countdown-lbl">Secs</span>
                    </div>
                </div>

                <!-- Developer Access -->
                <span class="dev-access-trigger" id="dev-trigger">Developer Bypass</span>
                <div class="pincode-panel" id="pin-panel">
                    <input type="password" maxlength="10" placeholder="••••••••••" class="pincode-input" id="pin-input" />
                    <span class="pincode-error" id="pin-err">Incorrect Pincode</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // ------------------------------------------
        // Timer Mechanics (July 25, 2026, 3:00 PM IST)
        // ------------------------------------------
        const targetDate = new Date("2026-07-25T15:00:00+05:30").getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                // Timer finished, bypass automatically
                localStorage.setItem('dev_bypass', '8197176867');
                location.reload();
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('cd-days').textContent = days.toString().padStart(2, '0');
            document.getElementById('cd-hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('cd-mins').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('cd-secs').textContent = seconds.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // ------------------------------------------
        // Pincode Panel Mechanics (Pincode: 8197176867)
        // ------------------------------------------
        const trigger = document.getElementById('dev-trigger');
        const panel = document.getElementById('pin-panel');
        const input = document.getElementById('pin-input');
        const err = document.getElementById('pin-err');
        
        trigger.addEventListener('click', () => {
            panel.style.display = 'flex';
            trigger.style.display = 'none';
            input.focus();
        });
        
        input.addEventListener('input', () => {
            err.style.display = 'none';
            if (input.value === '8197176867') {
                localStorage.setItem('dev_bypass', '8197176867');
                location.reload();
            } else if (input.value.length >= 10) {
                err.style.display = 'block';
                input.value = '';
            }
        });
    });
})();
