import { h, render } from 'https://esm.sh/preact';
import { useState, useEffect, useRef } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

// --- INITIALIZE LOCAL STORAGE ---
const initDatabase = () => {
  if (!localStorage.getItem('warriors_members')) {
    const defaultMembers = [
      { id: 'WR-001', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', name: 'Lathiesh Kumar', email: 'Racwarriors2023@gmail.com', phone: '9876543210', role: 'Super Admin', position: 'Secretary', status: 'Active', payment: 'Paid', isSecretaryAdmin: true },
      { id: 'WR-002', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', name: 'Anil Gupta', email: 'anil.gupta@gmail.com', phone: '9876543211', role: 'President', position: 'President', status: 'Active', payment: 'Paid', isSecretaryAdmin: false },
      { id: 'WR-003', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', name: 'Priya Sharma', email: 'priya.sharma@yahoo.com', phone: '9876543212', role: 'Treasurer', position: 'Treasurer', status: 'Active', payment: 'Paid', isSecretaryAdmin: false },
      { id: 'WR-004', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', name: 'Rohan Das', email: 'rohan.das@outlook.com', phone: '9876543213', role: 'Director', position: 'Community Service Director', status: 'Active', payment: 'Paid', isSecretaryAdmin: false },
      { id: 'WR-005', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', name: 'Sneha Roy', email: 'sneha.roy@gmail.com', phone: '9876543214', role: 'Member', position: 'Public Relations Chair', status: 'Active', payment: 'Paid', isSecretaryAdmin: false },
      { id: 'WR-006', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '9876543215', role: 'Member', position: 'General Member', status: 'Inactive', payment: 'Unpaid', isSecretaryAdmin: false },
    ];
    localStorage.setItem('warriors_members', JSON.stringify(defaultMembers));
  } else {
    try {
      const existing = localStorage.getItem('warriors_members');
      if (existing) {
        const parsed = JSON.parse(existing);
        let updated = false;
        const migrated = parsed.map(m => {
          if (m.isSecretaryAdmin === undefined) {
            updated = true;
            const isSec = m.id === 'WR-001' || m.role === 'Super Admin' || m.position === 'Secretary';
            return { ...m, isSecretaryAdmin: isSec };
          }
          return m;
        });
        if (updated) {
          localStorage.setItem('warriors_members', JSON.stringify(migrated));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  try {
    const rawP = localStorage.getItem('warriors_projects');
    if (rawP) {
      const parsed = JSON.parse(rawP);
      const cleaned = parsed.filter(p => p.id && !p.id.startsWith('PRJ-') && !p.id.startsWith('p'));
      localStorage.setItem('warriors_projects', JSON.stringify(cleaned));
    } else {
      localStorage.setItem('warriors_projects', JSON.stringify([]));
    }
  } catch (e) {
    localStorage.setItem('warriors_projects', JSON.stringify([]));
  }

  if (!localStorage.getItem('warriors_events')) {
    const defaultEvents = [
      { id: 'EVT-201', name: 'Installation Ceremony', date: '2026-07-01', venue: 'Ritz Carlton Ballroom', registrations: 150, budget: 45000, status: 'Completed', attendance: 92 },
      { id: 'EVT-202', name: 'Core Committee Meeting', date: '2026-07-10', venue: 'Club House', registrations: 15, budget: 500, status: 'Upcoming', attendance: 0 },
      { id: 'EVT-203', name: 'Speaker Session on Leadership', date: '2026-07-15', venue: 'Zoom Meeting', registrations: 85, budget: 2000, status: 'Upcoming', attendance: 0 },
    ];
    localStorage.setItem('warriors_events', JSON.stringify(defaultEvents));
  }

  if (!localStorage.getItem('warriors_finances')) {
    localStorage.setItem('warriors_finances', JSON.stringify([]));
  }

  if (!localStorage.getItem('warriors_cms')) {
    const defaultCms = {
      heroTitle: 'Welcome to Rotaract Bangalore Warriors',
      presidentMessage: 'Service above self is our ultimate motto. Let us work together to make a difference.',
      announcements: 'New Member Induction Ceremony will take place on July 25th at 6:00 PM.',
    };
    localStorage.setItem('warriors_cms', JSON.stringify(defaultCms));
  }

  if (!localStorage.getItem('warriors_gallery')) {
    const defaultGallery = [
      { id: 'IMG-301', src: 'assets/projects/proj-0.png', alt: 'Youth Care Initiative', date: '2026-07-01' },
      { id: 'IMG-302', src: 'assets/projects/proj-1.png', alt: 'Community Support Drive', date: '2026-07-02' },
      { id: 'IMG-303', src: 'assets/projects/proj-2.png', alt: 'Food Distribution Camp', date: '2026-07-03' },
      { id: 'IMG-304', src: 'assets/projects/proj-3.png', alt: 'Warriors Fellowship Meet', date: '2026-07-04' },
      { id: 'IMG-305', src: 'assets/projects/proj-4.png', alt: 'Skill Development Workshop', date: '2026-07-05' },
      { id: 'IMG-306', src: 'assets/projects/proj-5.png', alt: 'Volunteering Leadership Camp', date: '2026-07-06' }
    ];
    localStorage.setItem('warriors_gallery', JSON.stringify(defaultGallery));
  }
};

initDatabase();

// --- ROOT APP CONTAINER ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('warriors_admin_logged_in') === 'true');
  const [role, setRole] = useState(sessionStorage.getItem('warriors_admin_role') || 'Super Admin');
  
  if (!isLoggedIn) {
    return html`<${WarriorLoginCard} onLoginSuccess=${(r) => {
      setRole(r);
      setIsLoggedIn(true);
    }} />`;
  }
  
  return html`<${AdminDashboard} role=${role} onLogout=${() => setIsLoggedIn(false)} />`;
}

// --- LOGIN CARD COMPONENT ---
function WarriorLoginCard({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username === 'Racwarriors2023@gmail.com' && password === 'Lathiesh@2002') {
      setErrorMsg('');
      sessionStorage.setItem('warriors_admin_logged_in', 'true');
      sessionStorage.setItem('warriors_admin_role', 'Super Admin');
      onLoginSuccess('Super Admin');
    } else if (username === 'secwarriors@2026' && password === 'Ilovewarriors') {
      setErrorMsg('');
      sessionStorage.setItem('warriors_admin_logged_in', 'true');
      sessionStorage.setItem('warriors_admin_role', 'Secretary');
      onLoginSuccess('Secretary');
    } else {
      setErrorMsg('Invalid email or password. Try again!');
    }
  };

  return html`
    <div class="fixed inset-0 bg-[#eef2f6] flex justify-center items-center z-[2000] overflow-y-auto p-6 font-sans">
      <div class="w-full max-w-[500px] bg-white rounded-[20px] border border-slate-200/60 shadow-[0_15px_45px_rgba(0,0,0,0.08)] overflow-hidden">
        
        <!-- Header -->
        <div class="bg-burgundy-600 text-white p-8 pb-6 flex flex-col items-center text-center relative border-b-4 border-[#f9a825] overflow-hidden">
          <!-- Wave Pattern -->
          <svg class="pointer-events-none absolute right-[-20px] bottom-[-40px] h-[160%] opacity-15 z-1" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M200 150 C 150 140, 120 100, 110 50 C 100 0, 110 -50, 120 -100" stroke="white" stroke-width="1.5" fill="none" />
            <path d="M200 150 C 160 140, 140 100, 130 50 C 120 0, 130 -50, 140 -100" stroke="white" stroke-width="1.5" fill="none" />
            <path d="M200 150 C 170 140, 160 100, 150 50 C 140 0, 150 -50, 160 -100" stroke="white" stroke-width="1.5" fill="none" />
            <path d="M200 150 C 180 140, 180 100, 170 50 C 160 0, 170 -50, 180 -100" stroke="white" stroke-width="1.5" fill="none" />
          </svg>
          
          <div class="flex items-center justify-center gap-4 w-full mb-3 z-10 relative">
            <svg width="46" height="46" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
              <circle cx="50" cy="50" r="45" fill="white" />
              <circle cx="50" cy="50" r="38" fill="#8B003A" />
              <circle cx="50" cy="50" r="28" stroke="white" stroke-width="2.5" fill="transparent" />
              <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50 M23 23 L29 29 M71 71 L77 77 M71 23 L65 29 M29 71 L23 77" stroke="white" stroke-width="4.5" stroke-linecap="round" />
              <circle cx="50" cy="50" r="16" fill="white" />
              <circle cx="50" cy="50" r="10" fill="#8B003A" />
              <rect x="47" y="47" width="6" height="6" fill="white" />
            </svg>
            <div class="text-left font-display">
              <h2 class="font-extrabold text-[2rem] leading-none">Rotaract</h2>
              <p class="font-light text-base tracking-[0.5px] mt-0.5">Bangalore Warriors</p>
            </div>
          </div>
          
          <div class="flex items-center justify-center gap-3 w-full border-t border-white/20 pt-3 mt-1.5 z-10 relative">
            <div class="h-[1px] bg-white/20 grow max-w-[80px]"></div>
            <span class="text-sm font-light tracking-[0.5px]">District 3192 | Zone PRAVAHA</span>
            <div class="h-[1px] bg-white/20 grow max-w-[80px]"></div>
          </div>
        </div>

        <!-- Body -->
        <div class="p-8">
          <h3 class="text-2xl font-bold text-slate-800 text-center mb-1">Welcome Back, <span class="text-burgundy-500">Warrior!</span></h3>
          <p class="text-sm text-slate-500 text-center mb-6">Sign in to continue your Rotaract journey.</p>
          
          <form onSubmit=${handleLoginSubmit} class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Email or Mobile Number</label>
              <div class="relative flex items-center">
                <span class="absolute left-3.5 text-burgundy-500 text-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input type="text" value=${username} onInput=${(e) => setUsername(e.target.value)} class="w-full pl-11 pr-4 py-3 border border-pink-200/80 rounded-xl bg-slate-50/30 text-slate-800 text-sm focus:outline-none focus:border-burgundy-500 focus:bg-white focus:ring-4 focus:ring-burgundy-500/10 transition-all" placeholder="Enter email or mobile number" required />
              </div>
              <p class="text-xs text-slate-400 mt-1">Start typing: digits for mobile, letters for email</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div class="relative flex items-center">
                <span class="absolute left-3.5 text-burgundy-500 text-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input type=${showPassword ? 'text' : 'password'} value=${password} onInput=${(e) => setPassword(e.target.value)} class="w-full pl-11 pr-11 py-3 border border-pink-200/80 rounded-xl bg-slate-50/30 text-slate-800 text-sm focus:outline-none focus:border-burgundy-500 focus:bg-white focus:ring-4 focus:ring-burgundy-500/10 transition-all" placeholder="Enter your password" required />
                <button type="button" onClick=${() => setShowPassword(!showPassword)} class="absolute right-3.5 text-slate-400 hover:text-burgundy-500 transition-colors">
                  ${showPassword
                    ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
                    : html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
                  }
                </button>
              </div>
            </div>

            ${errorMsg && html`
              <div class="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 text-center">
                ${errorMsg}
              </div>
            `}

            <div class="flex justify-between items-center text-xs">
              <label class="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" checked class="accent-burgundy-500 rounded cursor-pointer w-4 h-4" /> Remember Me
              </label>
              <a href="#" class="text-burgundy-500 hover:underline font-semibold">Forgot Password?</a>
            </div>

            <button type="submit" class="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(139,0,58,0.2)] hover:shadow-[0_6px_16px_rgba(139,0,58,0.3)] active:translate-y-[1px] flex items-center justify-center gap-2 text-sm">
              Sign In ➔
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="text-center p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-1">
          <a href="index.html" class="text-xs font-bold text-burgundy-500 hover:text-burgundy-600 transition-colors flex items-center justify-center gap-1.5 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Website Home
          </a>
          <div class="text-xs font-bold text-burgundy-500 uppercase tracking-wider">Rotaract Bangalore Warriors</div>
          <div class="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-2">
            <div class="w-5 h-[1px] bg-slate-200"></div>
            <span>Service Above Self</span>
            <div class="w-5 h-[1px] bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- MAIN DASHBOARD CONTAINER ---
function AdminDashboard({ role, onLogout }) {
  const adminRole = role || sessionStorage.getItem('warriors_admin_role') || 'Super Admin';
  const [currentTab, setCurrentTab] = useState(adminRole === 'Secretary' ? 'secretary_mom_records' : 'dashboard');
  const [adminName, setAdminName] = useState(adminRole === 'Secretary' ? 'Secretary Admin' : 'WARRIORS');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database states
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [finances, setFinances] = useState([]);
  const [cms, setCms] = useState(JSON.parse(localStorage.getItem('warriors_cms')));
  const [gallery, setGallery] = useState(JSON.parse(localStorage.getItem('warriors_gallery')) || []);
  const [googleCalendarId, setGoogleCalendarId] = useState('');
  const [secretaryExpanded, setSecretaryExpanded] = useState(currentTab.startsWith('secretary_'));
  const [activeEditMomId, setActiveEditMomId] = useState(null);

  // Access controls using PIN codes
  const [isSecretaryUnlocked, setIsSecretaryUnlocked] = useState(sessionStorage.getItem('warriors_secretary_unlocked') === 'true' || adminRole === 'Secretary');
  const [isFinanceUnlocked, setIsFinanceUnlocked] = useState(sessionStorage.getItem('warriors_finance_unlocked') === 'true');
  const [pinLockType, setPinLockType] = useState(null); // 'secretary' | 'finance' | null
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSecretaryAccordionClick = () => {
    if (adminRole === 'Secretary' || isSecretaryUnlocked) {
      setSecretaryExpanded(!secretaryExpanded);
    } else {
      setPinLockType('secretary');
      setEnteredPin('');
      setPinError('');
    }
  };

  const handlePinUnlockSubmit = (e) => {
    e.preventDefault();
    if (pinLockType === 'secretary') {
      if (enteredPin === '2006') {
        sessionStorage.setItem('warriors_secretary_unlocked', 'true');
        setIsSecretaryUnlocked(true);
        setPinLockType(null);
        setSecretaryExpanded(true);
      } else {
        setPinError('Invalid Secretary PIN number!');
      }
    } else if (pinLockType === 'finance') {
      if (enteredPin === '2023') {
        sessionStorage.setItem('warriors_finance_unlocked', 'true');
        setIsFinanceUnlocked(true);
        setPinLockType(null);
      } else {
        setPinError('Invalid Finance PIN number!');
      }
    }
  };

  useEffect(() => {
    // Secretary Auto-lock
    if (currentTab.startsWith('secretary_')) {
      setSecretaryExpanded(true);
    } else if (adminRole !== 'Secretary') {
      setSecretaryExpanded(false);
      setIsSecretaryUnlocked(false);
      sessionStorage.removeItem('warriors_secretary_unlocked');
    }

    // Finance Auto-lock
    if (currentTab !== 'finances') {
      setIsFinanceUnlocked(false);
      sessionStorage.removeItem('warriors_finance_unlocked');
    }
  }, [currentTab, adminRole]);

  const fetchMembers = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(apiBase + '/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch members from backend', err);
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('DEBUG apiBase eval:', window.location.protocol, window.location.hostname, window.location.port, '->', (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000' : 'empty');
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(apiBase + '/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects from backend', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(apiBase + '/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events from backend', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(apiBase + '/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.google_calendar_id !== undefined) {
          setGoogleCalendarId(data.google_calendar_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings from backend', err);
    }
  };

  const fetchFinances = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(apiBase + '/api/finances');
      if (res.ok) {
        const data = await res.json();
        setFinances(data);
      }
    } catch (err) {
      console.error('Failed to fetch finances from backend', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    fetchMembers();
    fetchProjects();
    fetchEvents();
    fetchSettings();
    fetchFinances();
    return () => clearInterval(timer);
  }, [currentTab]);

  const handleLogoutClick = () => {
    sessionStorage.removeItem('warriors_admin_logged_in');
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>` },
    { id: 'members', label: 'Members', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>` },
    { id: 'projects', label: 'Project', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` },
    { id: 'calendar', label: 'Calendar', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>` },
    { id: 'finances', label: 'Finance', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` },
    { id: 'gallery', label: 'Echoes of the Warriors cloud', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><circle cx="12" cy="13" r="3"></circle></svg>` },
    { id: 'reports', label: 'Reports', icon: html`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` },
  ];

  return html`
    <div class="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <!-- Backdrop Overlay for Mobile Navigation -->
      ${mobileMenuOpen && html`
        <div onClick=${() => setMobileMenuOpen(false)} class="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-40 lg:hidden"></div>
      `}
      <!-- SIDEBAR -->
      <aside class="fixed inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex">
        <!-- Logo -->
        <div class="p-6 border-b border-slate-100 flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
            <circle cx="50" cy="50" r="45" fill="#8B003A" />
            <circle cx="50" cy="50" r="38" fill="white" />
            <circle cx="50" cy="50" r="28" stroke="#8B003A" stroke-width="2.5" fill="transparent" />
            <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50 M23 23 L29 29 M71 71 L77 77 M71 23 L65 29 M29 71 L23 77" stroke="#8B003A" stroke-width="4.5" stroke-linecap="round" />
            <circle cx="50" cy="50" r="16" fill="#8B003A" />
            <circle cx="50" cy="50" r="10" fill="white" />
            <rect x="47" y="47" width="6" height="6" fill="#8B003A" />
          </svg>
          <div class="text-left font-display">
            <h2 class="font-bold text-lg text-burgundy-500 leading-none">Rotaract</h2>
            <p class="font-medium text-xs text-slate-500 mt-0.5">Bangalore Warriors</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          ${adminRole === 'Secretary' ? html`
            <div class="space-y-1 text-left">
              <!-- Divider Label -->
              <div class="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z"></path></svg>
                Secretary Admin
              </div>
              
              <button
                onClick=${() => { setActiveEditMomId(null); setCurrentTab('secretary_mom_generate'); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'secretary_mom_generate'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                📝 Generate MoM
              </button>
              <button
                onClick=${() => { setActiveEditMomId(null); setCurrentTab('secretary_project_report_generate'); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'secretary_project_report_generate'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                📊 Project Report
              </button>
              <button
                onClick=${() => { setCurrentTab('secretary_mom_records'); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'secretary_mom_records'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                📁 MoM Records
              </button>
              <button
                onClick=${() => { setCurrentTab('secretary_action_items'); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'secretary_action_items'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                📋 Action Items
              </button>
              <button
                onClick=${() => { setCurrentTab('secretary_approvals'); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'secretary_approvals'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                ✅ Approvals
              </button>
              <button
                onClick=${() => { setCurrentTab('secretary_admin'); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentTab === 'secretary_admin'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                ⚙️ Profile & Settings
              </button>
            </div>
          ` : html`
            <!-- General admin tabs -->
            ${menuItems.map((item) => html`
              <button
                onClick=${() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  currentTab === item.id
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                <span class="${
                  currentTab === item.id ? 'text-burgundy-500' : 'text-slate-400 group-hover:text-slate-600'
                }">${item.icon}</span>
                ${item.label}
              </button>
            `)}
            
            <!-- Accordion: Secretary Admin -->
            <div class="space-y-1">
              <button
                onClick=${handleSecretaryAccordionClick}
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  currentTab.startsWith('secretary_') || currentTab === 'secretary_admin'
                    ? 'bg-burgundy-50 text-burgundy-500 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }"
              >
                <div class="flex items-center gap-3.5">
                  <span class="${
                    currentTab.startsWith('secretary_') || currentTab === 'secretary_admin' ? 'text-burgundy-500' : 'text-slate-400 group-hover:text-slate-600'
                  }">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z"></path></svg>
                  </span>
                  <span>Secretary Admin</span>
                </div>
                <span>
                  <svg class="w-4 h-4 transform transition-transform duration-200 ${secretaryExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </button>
              
              ${secretaryExpanded && html`
                <div class="pl-6 pr-2 py-1 space-y-1 text-left">
                  <!-- Divider Label -->
                  <div class="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minutes of Meeting</div>
                  
                  <button
                    onClick=${() => { setActiveEditMomId(null); setCurrentTab('secretary_mom_generate'); setMobileMenuOpen(false); }}
                    class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentTab === 'secretary_mom_generate'
                        ? 'bg-burgundy-50/50 text-burgundy-600 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }"
                  >
                    Generate MoM
                  </button>
                  <button
                    onClick=${() => { setActiveEditMomId(null); setCurrentTab('secretary_project_report_generate'); setMobileMenuOpen(false); }}
                    class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentTab === 'secretary_project_report_generate'
                        ? 'bg-burgundy-50/50 text-burgundy-600 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }"
                  >
                    Project Report
                  </button>
                  <button
                    onClick=${() => { setCurrentTab('secretary_mom_records'); setMobileMenuOpen(false); }}
                    class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentTab === 'secretary_mom_records'
                        ? 'bg-burgundy-50/50 text-burgundy-600 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }"
                  >
                    MoM Records
                  </button>
                  <button
                    onClick=${() => { setCurrentTab('secretary_action_items'); setMobileMenuOpen(false); }}
                    class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentTab === 'secretary_action_items'
                        ? 'bg-burgundy-50/50 text-burgundy-600 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }"
                  >
                    Action Items
                  </button>
                  <button
                    onClick=${() => { setCurrentTab('secretary_approvals'); setMobileMenuOpen(false); }}
                    class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentTab === 'secretary_approvals'
                        ? 'bg-burgundy-50/50 text-burgundy-600 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }"
                  >
                    Approvals
                  </button>
                  <button
                    onClick=${() => { setCurrentTab('secretary_admin'); setMobileMenuOpen(false); }}
                    class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      currentTab === 'secretary_admin'
                        ? 'bg-burgundy-50/50 text-burgundy-600 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }"
                  >
                    Profile & Settings
                  </button>
                </div>
              `}
            </div>
          `}
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-100 space-y-1.5">
          <a href="index.html" class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>
            Back to Website
          </a>
          <button onClick=${() => { handleLogoutClick(); setMobileMenuOpen(false); }} class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></span>
            Logout
          </button>
        </div>
      </aside>

      <!-- MAIN CONTAINER -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <!-- HEADER -->
        <header class="bg-white border-b border-slate-200/80 h-16 shrink-0 flex items-center justify-between px-4 sm:px-8 z-10 relative">
          <!-- Left: Title -->
          <div class="flex items-center gap-2 sm:gap-3">
            <button onClick=${() => setMobileMenuOpen(true)} class="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors mr-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="12" y2="12"></line><line x1="3" x2="21" y1="6" y2="6"></line><line x1="3" x2="21" y1="18" y2="18"></line></svg>
            </button>
            <span class="text-[10px] sm:text-xs font-bold bg-burgundy-50 text-burgundy-500 px-2 sm:px-2.5 py-1 rounded-md border border-burgundy-100 uppercase tracking-wide">District 3192</span>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center gap-4">
            <!-- Clock -->
            <span class="text-xs text-slate-400 font-medium hidden sm:inline">
              ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
            
            <!-- Profile Dropdown -->
            <div class="relative">
              <button onClick=${() => setShowProfileDropdown(!showProfileDropdown)} class="flex items-center gap-2.5 p-1 px-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200/60">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" class="w-8 h-8 rounded-full border border-slate-200" />
                <div class="text-left hidden md:block">
                  <div class="text-sm font-semibold text-slate-800 leading-none">${adminName}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${adminRole === 'Secretary' ? 'Secretary Administrator' : 'Super Administrator'}</div>
                </div>
                <span class="text-slate-400"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></span>
              </button>

              ${showProfileDropdown && html`
                <div class="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-dropdown p-1.5 z-50">
                  <button onClick=${() => { handleLogoutClick(); setMobileMenuOpen(false); }} class="w-full text-left px-3.5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 font-semibold">
                    🚪 Sign Out
                  </button>
                </div>
              `}
            </div>
          </div>
        </header>

        <!-- TAB VIEWER CONTAINER -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          ${currentTab === 'dashboard' && html`<${DashboardHome} members=${members} projects=${projects} events=${events} finances=${finances} onTabChange=${setCurrentTab} />`}
          ${currentTab === 'members' && html`<${MemberManagement} members=${members} fetchMembers=${fetchMembers} />`}
          ${currentTab === 'projects' && html`<${ProjectManagement} projects=${projects} setProjects=${setProjects} fetchProjects=${fetchProjects} />`}
          ${currentTab === 'calendar' && html`<${EventsModule} events=${events} fetchEvents=${fetchEvents} />`}
          
          ${currentTab === 'finances' && !isFinanceUnlocked ? html`
            <div class="flex flex-col items-center justify-center py-20 text-center font-sans space-y-4">
              <div class="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-800">Finance Restricted Access</h3>
              <p class="text-sm text-slate-400 max-w-sm">This section is PIN protected. Please verify your Finance access code to view the treasury sheets.</p>
              <button onClick=${() => { setPinLockType('finance'); setEnteredPin(''); setPinError(''); }} class="px-5 py-2.5 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 shadow-md transition-all">
                🔓 Enter PIN Code
              </button>
            </div>
          ` : currentTab === 'finances' && html`<${FinanceDashboard} finances=${finances} fetchFinances=${fetchFinances} />`}
          
          ${currentTab === 'gallery' && html`<${GalleryManagement} />`}
          ${currentTab === 'reports' && html`<${ReportsGenerator} members=${members} projects=${projects} finances=${finances} />`}
          
          ${currentTab.startsWith('secretary_') && adminRole !== 'Secretary' && !isSecretaryUnlocked ? html`
            <div class="flex flex-col items-center justify-center py-20 text-center font-sans space-y-4">
              <div class="w-16 h-16 rounded-full bg-burgundy-50 border border-burgundy-100 flex items-center justify-center text-burgundy-500 mb-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-800">Secretary Admin Restricted</h3>
              <p class="text-sm text-slate-400 max-w-sm">This section is PIN protected. Please verify your Secretary access code to view the portal files.</p>
              <button onClick=${() => { setPinLockType('secretary'); setEnteredPin(''); setPinError(''); }} class="px-5 py-2.5 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 shadow-md transition-all">
                🔓 Enter PIN Code
              </button>
            </div>
          ` : html`
            ${currentTab === 'secretary_mom_generate' && html`<${MinutesOfMeetingGenerator} members=${members} momId=${activeEditMomId} clearEditMomId=${() => setActiveEditMomId(null)} onTabChange=${setCurrentTab} />`}
            ${currentTab === 'secretary_project_report_generate' && html`<${MinutesOfMeetingGenerator} members=${members} defaultType="Project Report" momId=${activeEditMomId} clearEditMomId=${() => setActiveEditMomId(null)} onTabChange=${setCurrentTab} />`}
            ${currentTab === 'secretary_mom_records' && html`<${MoMRecords} onEdit=${(momId, type) => { setActiveEditMomId(momId); if (type === 'Project Report') { setCurrentTab('secretary_project_report_generate'); } else { setCurrentTab('secretary_mom_generate'); } }} onTabChange=${setCurrentTab} />`}
            ${currentTab === 'secretary_action_items' && html`<${ActionItemsTracker} members=${members} />`}
            ${currentTab === 'secretary_approvals' && html`<${ApprovalsPanel} onEdit=${(momId, type) => { setActiveEditMomId(momId); if (type === 'Project Report') { setCurrentTab('secretary_project_report_generate'); } else { setCurrentTab('secretary_mom_generate'); } }} />`}
            ${currentTab === 'secretary_admin' && html`<${SecretaryAdminPanel} adminName=${adminName} setAdminName=${setAdminName} googleCalendarId=${googleCalendarId} fetchSettings=${fetchSettings} />`}
          `}
        </main>

        <!-- FOOTER -->
        <footer class="bg-white border-t border-slate-200/80 px-8 py-3.5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-medium z-10">
          <span>© 2026 Rotaract Bangalore Warriors (District 3192)</span>
          <span class="flex items-center gap-1">Made with <span class="text-rose-500">❤️</span> for Service Above Self</span>
        </footer>
      </div>

      <!-- Unified PIN Verification Lock Modal -->
      ${pinLockType && html`
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-center items-center z-[4000] p-6 font-sans">
          <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium w-full max-w-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-burgundy-600 text-white">
              <div class="flex items-center gap-2 font-bold text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2a5 5 0 0 0-5 5v4h10V7a5 5 0 0 0-5-5z"></path></svg>
                ${pinLockType === 'secretary' ? 'Secretary Admin' : 'Finance Access'} Verification
              </div>
              <button onClick=${() => setPinLockType(null)} class="text-white/80 hover:text-white text-lg">✕</button>
            </div>
            
            <form onSubmit=${handlePinUnlockSubmit} class="p-6 space-y-4 text-left">
              <p class="text-xs text-slate-500 font-medium leading-relaxed">
                Please enter the 4-digit PIN access code to unlock the ${pinLockType === 'secretary' ? 'Secretary Admin files' : 'Finance treasury reports'}.
              </p>
              
              ${pinError && html`
                <div class="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                  ⚠️ ${pinError}
                </div>
              `}
              
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Enter PIN Code</label>
                <input
                  type="password"
                  maxlength="4"
                  pattern="[0-9]{4}"
                  value=${enteredPin}
                  onInput=${(e) => setEnteredPin(e.target.value)}
                  class="w-full text-center tracking-[1.5em] font-extrabold text-lg px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-burgundy-500"
                  placeholder="••••"
                  required
                  autoFocus
                />
              </div>
              
              <div class="pt-3 flex justify-end gap-3">
                <button type="button" onClick=${() => setPinLockType(null)} class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-5 py-2 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}

// --- SUB-TABS COMPONENTS ---

// 1. DASHBOARD HOME OVERVIEW
function DashboardHome({ members, projects, events, finances, onTabChange }) {
  const [greeting, setGreeting] = useState('Welcome');
  
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning');
    else if (hrs < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').length;

  const totalIncome = finances.filter(f => f.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // Chart References
  useEffect(() => {
    // Avenue Distribution chart
    const projCtx = document.getElementById('avenueChart');
    if (projCtx) {
      if (window.avenueChartInst) window.avenueChartInst.destroy();
      const avenues = {};
      projects.forEach(p => {
        avenues[p.category] = (avenues[p.category] || 0) + 1;
      });
      window.avenueChartInst = new Chart(projCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(avenues).length ? Object.keys(avenues) : ['Club Service', 'Community Service', 'Vocational', 'Professional'],
          datasets: [{
            data: Object.keys(avenues).length ? Object.values(avenues) : [1, 2, 0, 1],
            backgroundColor: '#8B003A',
            borderRadius: 6,
            barThickness: 24,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Finance Cashflow
    const finCtx = document.getElementById('cashflowChart');
    if (finCtx) {
      if (window.cashflowChartInst) window.cashflowChartInst.destroy();
      window.cashflowChartInst = new Chart(finCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            { label: 'Income', data: [15000, 20000, 18000, 30000, 25000, 42000, totalIncome], borderColor: '#10b981', tension: 0.3, fill: false, borderWidth: 3 },
            { label: 'Expense', data: [10000, 12000, 15000, 22000, 14000, 30000, totalExpense], borderColor: '#ef4444', tension: 0.3, fill: false, borderWidth: 3 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            y: { grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }, [projects, finances]);

  return html`
    <div class="space-y-8">
      <!-- Welcome Card -->
      <div class="bg-gradient-to-r from-burgundy-600 to-burgundy-700 rounded-[20px] p-6 sm:p-8 text-white relative shadow-card overflow-hidden">
        <svg class="pointer-events-none absolute right-[-20px] bottom-[-40px] h-[180%] opacity-10" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 150 C 150 140, 120 100, 110 50 C 100 0, 110 -50, 120 -100" stroke="white" stroke-width="1.5" />
          <path d="M200 150 C 160 140, 140 100, 130 50 C 120 0, 130 -50, 140 -100" stroke="white" stroke-width="1.5" />
        </svg>
        <div class="relative z-10 max-w-lg">
          <h2 class="text-2xl sm:text-3xl font-extrabold font-display leading-tight">${greeting}, Administrator</h2>
          <p class="text-pink-100/95 text-base mt-2 font-medium">"Together We Lead, Together We Serve."</p>
          <div class="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold mt-6 tracking-wide backdrop-blur-xs">
            📅  ${new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6 hover:translate-y-[-4px] hover:shadow-card transition-all duration-300">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-semibold text-slate-500">Total Members</p>
              <h3 class="text-3xl font-extrabold text-slate-800 mt-2 font-display">${totalMembers}</h3>
            </div>
            <span class="p-3 bg-burgundy-50 text-burgundy-500 rounded-xl"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></span>
          </div>
          <div class="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1">🟢 ${activeMembers} Active members</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6 hover:translate-y-[-4px] hover:shadow-card transition-all duration-300">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-semibold text-slate-500">Projects Completed</p>
              <h3 class="text-3xl font-extrabold text-slate-800 mt-2 font-display">${completedProjects}</h3>
            </div>
            <span class="p-3 bg-burgundy-50 text-burgundy-500 rounded-xl"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span>
          </div>
          <div class="text-xs font-medium text-slate-400 mt-4">${projects.length - completedProjects} projects in progress</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6 hover:translate-y-[-4px] hover:shadow-card transition-all duration-300">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-semibold text-slate-500">Calendar Schedules</p>
              <h3 class="text-3xl font-extrabold text-slate-800 mt-2 font-display">${upcomingEvents}</h3>
            </div>
            <span class="p-3 bg-burgundy-50 text-burgundy-500 rounded-xl"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg></span>
          </div>
          <div class="text-xs font-medium text-slate-400 mt-4">Core meetings & projects scheduled</div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6 hover:translate-y-[-4px] hover:shadow-card transition-all duration-300">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-semibold text-slate-500">Funds Available</p>
              <h3 class="text-3xl font-extrabold text-slate-800 mt-2 font-display">₹${currentBalance.toLocaleString()}</h3>
            </div>
            <span class="p-3 bg-burgundy-50 text-burgundy-500 rounded-xl"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
          </div>
          <div class="text-xs font-medium text-emerald-600 mt-4 flex items-center gap-1">💸 Surplus balance available</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-premium">
        <h3 class="text-base font-bold text-slate-800 mb-4">Quick Administration Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick=${() => onTabChange('members')} class="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-burgundy-50 hover:text-burgundy-500 border border-slate-200/50 rounded-xl transition-all group">
            <span class="text-2xl mb-2 text-slate-500 group-hover:text-burgundy-500">👤</span>
            <span class="text-xs font-bold">Add Member</span>
          </button>
          <button onClick=${() => onTabChange('projects')} class="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-burgundy-50 hover:text-burgundy-500 border border-slate-200/50 rounded-xl transition-all group">
            <span class="text-2xl mb-2 text-slate-500 group-hover:text-burgundy-500">🛠</span>
            <span class="text-xs font-bold">Start Project</span>
          </button>
          <button onClick=${() => onTabChange('calendar')} class="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-burgundy-50 hover:text-burgundy-500 border border-slate-200/50 rounded-xl transition-all group">
            <span class="text-2xl mb-2 text-slate-500 group-hover:text-burgundy-500">📅</span>
            <span class="text-xs font-bold">Add Calendar</span>
          </button>
          <button onClick=${() => onTabChange('finances')} class="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-burgundy-50 hover:text-burgundy-500 border border-slate-200/50 rounded-xl transition-all group">
            <span class="text-2xl mb-2 text-slate-500 group-hover:text-burgundy-500">💵</span>
            <span class="text-xs font-bold">Record Cash</span>
          </button>
        </div>
      </div>

      <!-- Charts & Activities Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Project Chart -->
        <div class="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-premium lg:col-span-2">
          <h3 class="text-base font-bold text-slate-800 mb-1">Project Distribution by Avenue</h3>
          <p class="text-xs text-slate-400 mb-6">Completed and ongoing projects across service pathways.</p>
          <div class="h-[260px] relative">
            <canvas id="avenueChart"></canvas>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-premium">
          <h3 class="text-base font-bold text-slate-800 mb-4">Recent Club Activities</h3>
          <div class="flow-root">
            <ul class="-mb-8">
              <li class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-burgundy-50 flex items-center justify-center text-sm">👤</span>
                  </div>
                  <div class="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-xs text-slate-600 font-semibold">New Member joined: Sneha Roy</p>
                    </div>
                    <div class="text-right text-[10px] whitespace-nowrap text-slate-400">2h ago</div>
                  </div>
                </div>
              </li>
              <li class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-sm">🛠</span>
                  </div>
                  <div class="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-xs text-slate-600 font-semibold">Project Started: Literacy for All</p>
                    </div>
                    <div class="text-right text-[10px] whitespace-nowrap text-slate-400">1d ago</div>
                  </div>
                </div>
              </li>
              <li class="relative pb-8">
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-sm">💵</span>
                  </div>
                  <div class="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-xs text-slate-600 font-semibold">Corporate Sponsor payment received</p>
                    </div>
                    <div class="text-right text-[10px] whitespace-nowrap text-slate-400">3d ago</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Financial Chart -->
      <div class="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-premium">
        <h3 class="text-base font-bold text-slate-800 mb-1">Financial Cashflow Timeline</h3>
        <p class="text-xs text-slate-400 mb-6">Income and expense comparison over time.</p>
        <div class="h-[260px] relative">
          <canvas id="cashflowChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

// 2. MEMBER MANAGEMENT
function MemberManagement({ members, fetchMembers }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetLink, setSheetLink] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Member');
  const [formPosition, setFormPosition] = useState('General Member');
  const [formStatus, setFormStatus] = useState('Active');
  const [formPayment, setFormPayment] = useState('Paid');
  const [formSecretaryAdmin, setFormSecretaryAdmin] = useState(false);

  const filteredMembers = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.id.includes(search);
    const matchRole = filterRole === 'All' || m.role === filterRole;
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Member');
    setFormPosition('General Member');
    setFormStatus('Active');
    setFormPayment('Paid');
    setFormSecretaryAdmin(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (m) => {
    setIsEditing(true);
    setEditId(m.id);
    setFormName(m.name);
    setFormEmail(m.email);
    setFormPhone(m.phone);
    setFormRole(m.role);
    setFormPosition(m.position);
    setFormStatus(m.status);
    setFormPayment(m.payment);
    setFormSecretaryAdmin(m.isSecretaryAdmin || false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const res = await fetch(`${apiBase}/api/members/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          if (fetchMembers) fetchMembers();
        } else {
          alert('Failed to delete member.');
        }
      } catch (err) {
        console.error('Delete member error:', err);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      position: formPosition,
      status: formStatus,
      payment: formPayment,
      isSecretaryAdmin: formSecretaryAdmin
    };

    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      if (isEditing) {
        // Edit mode (PUT)
        const res = await fetch(`${apiBase}/api/members/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          if (fetchMembers) fetchMembers();
        } else {
          alert('Failed to update member.');
        }
      } else {
        // Add mode (POST)
        const res = await fetch(`${apiBase}/api/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          if (fetchMembers) fetchMembers();
        } else {
          alert('Failed to create member.');
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save member error:', err);
      alert('Error saving member data.');
    }
  };

  const handleSyncSheet = async () => {
    setIsSyncing(true);
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/members/sync`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSheetLink(data.link);
        alert('Successfully synchronized members data to Google Sheet!');
      } else {
        alert('Failed to synchronize with Google Sheet.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server.');
    } finally {
      setIsSyncing(false);
    }
  };

  const exportToExcel = () => {
    if (!window.XLSX) {
      alert("Excel library is loading, please try again in a moment.");
      return;
    }
    const data = members.map(m => ({
      'Member ID': m.id,
      'Name': m.name,
      'Email': m.email,
      'Phone': m.phone,
      'Role': m.role,
      'Position': m.position,
      'Secretary Admin': m.isSecretaryAdmin ? 'Yes' : 'No',
      'Status': m.status,
      'Payment': m.payment
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, `rotaract_warriors_members_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (!window.jspdf) {
      alert("PDF library is loading, please try again in a moment.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    doc.setFillColor(139, 0, 58);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ROTARACT CLUB OF BANGALORE WARRIORS", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("District 3192 | Club Roster Directory", 15, 26);
    doc.text(`Generated: ${timestamp}`, 195, 26, { align: 'right' });
    
    const headers = [['ID', 'Name', 'Email & Phone', 'Designation', 'Status', 'Dues']];
    const body = members.map(m => [
      m.id,
      m.name,
      `${m.email}\n${m.phone}`,
      `${m.role}\n${m.position}`,
      m.status,
      m.payment
    ]);
    
    doc.autoTable({
      startY: 42,
      head: headers,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [139, 0, 58] },
      styles: { fontSize: 8.5, cellPadding: 3.5 },
      columnStyles: {
        2: { cellWidth: 45 },
        3: { cellWidth: 40 }
      },
      didDrawPage: function(data) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text(`Report Generated on: ${timestamp}`, 15, 287);
        doc.text(`Page ${data.pageNumber}`, 195, 287, { align: 'right' });
      }
    });
    
    doc.save(`rotaract_warriors_members_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.XLSX) {
      alert("Excel library is loading, please try again.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const importedMembers = jsonData.map((row, index) => {
          const idVal = row['Member ID'] || row['ID'] || ('WR-' + String(members.length + index + 1).padStart(3, '0'));
          return {
            id: idVal,
            photo: row['Photo'] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            name: row['Name'] || row['Full Name'] || 'Unknown Member',
            email: row['Email'] || row['Email Address'] || '',
            phone: row['Phone'] || row['Phone Number'] || '',
            role: row['Role'] || row['Access Role'] || 'Member',
            position: row['Position'] || row['Club Position'] || 'General Member',
            status: row['Status'] || row['Membership Status'] || 'Active',
            payment: row['Payment'] || row['Payment Status'] || row['Payment Dues'] || 'Paid',
            isSecretaryAdmin: (String(row['Secretary Admin'] || '').toLowerCase() === 'yes' || row['isSecretaryAdmin'] === true)
          };
        });
        
        if (importedMembers.length > 0) {
          const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
          const existingIds = new Set(members.map(m => m.id));
          const filteredImported = importedMembers.filter(m => !existingIds.has(m.id));
          
          (async () => {
            let count = 0;
            for (const m of filteredImported) {
              try {
                const res = await fetch(`${apiBase}/api/members`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(m)
                });
                if (res.ok) count++;
              } catch (err) {
                console.error(err);
              }
            }
            if (fetchMembers) fetchMembers();
            alert(`Successfully imported ${count} new members!`);
          })();
        } else {
          alert("No valid member rows found in the sheet.");
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing Excel file. Please verify formatting.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return html`
    <div class="space-y-6">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">Member Roster</h2>
          <p class="text-sm text-slate-400">Add, edit, import and export club member records.</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <input type="file" id="importExcelInput" accept=".xlsx, .xls" onChange=${handleImportExcel} style="display:none;" />
          <button onClick=${handleSyncSheet} disabled=${isSyncing} class="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50">
            ${isSyncing ? 'Syncing...' : '🔄 Sync to Google Sheet'}
          </button>
          ${sheetLink && html`
            <a href=${sheetLink} target="_blank" class="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-sm transition-all flex items-center gap-1.5">
              🟢 View Google Sheet
            </a>
          `}
          <button onClick=${() => document.getElementById('importExcelInput').click()} class="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5">
            📥 Import Excel
          </button>
          <button onClick=${exportToExcel} class="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5">
            📊 Export Excel
          </button>
          <button onClick=${exportToPDF} class="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5">
            📄 Export PDF
          </button>
          <button onClick=${handleOpenAddModal} class="px-3.5 py-2 bg-burgundy-500 text-white rounded-xl text-xs font-bold hover:bg-burgundy-600 shadow-sm transition-all flex items-center gap-1.5">
            ➕ Add Member
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 border border-slate-200/60 rounded-2xl shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:max-w-xs flex items-center">
          <span class="absolute left-3 text-slate-400">🔍</span>
          <input type="text" value=${search} onInput=${(e) => setSearch(e.target.value)} class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 focus:bg-white transition-all" placeholder="Search members..." />
        </div>
        
        <div class="flex gap-4 w-full md:w-auto items-center justify-end">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-semibold">Role:</span>
            <select value=${filterRole} onChange=${(e) => setFilterRole(e.target.value)} class="border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-burgundy-500">
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="President">President</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Director">Director</option>
              <option value="Member">Member</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-semibold">Status:</span>
            <select value=${filterStatus} onChange=${(e) => setFilterStatus(e.target.value)} class="border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-burgundy-500">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Honorary">Honorary</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Members Table -->
      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th class="p-4 pl-6">Member ID</th>
                <th class="p-4">Profile</th>
                <th class="p-4">Name</th>
                <th class="p-4">Contact Info</th>
                <th class="p-4">Club Designation</th>
                <th class="p-4 text-center">Dues</th>
                <th class="p-4">Status</th>
                <th class="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              ${filteredMembers.length === 0
                ? html`<tr><td colspan="8" class="p-8 text-center text-slate-400 font-medium">No members found matching filters.</td></tr>`
                : filteredMembers.map((m) => html`
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4 pl-6 font-mono text-xs font-semibold text-slate-500">${m.id}</td>
                      <td class="p-4">
                        <img src=${m.photo} class="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                      </td>
                      <td class="p-4 font-bold text-slate-800">${m.name}</td>
                      <td class="p-4">
                        <div class="text-xs font-medium text-slate-500">${m.email}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${m.phone}</div>
                      </td>
                      <td class="p-4">
                        <div class="font-semibold text-xs text-burgundy-500">${m.role}</div>
                        <div class="text-xs text-slate-400 font-medium mt-0.5">${m.position}</div>
                      </td>
                      <td class="p-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                          m.payment === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }">${m.payment}</span>
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          m.status === 'Honorary' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }">
                          <span class="w-1.5 h-1.5 rounded-full ${
                            m.status === 'Active' ? 'bg-emerald-500' :
                            m.status === 'Honorary' ? 'bg-purple-500' :
                            'bg-slate-400'
                          }"></span>
                          ${m.status}
                        </span>
                      </td>
                      <td class="p-4 pr-6 text-right space-x-2">
                        <button onClick=${() => handleOpenEditModal(m)} class="text-slate-400 hover:text-burgundy-500 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block" title="Edit">✏️</button>
                        <button onClick=${() => handleDelete(m.id)} class="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block" title="Delete">🗑</button>
                      </td>
                    </tr>
                  `)
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      ${showModal && html`
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-[3000] p-6 font-sans">
          <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium w-full max-w-lg overflow-hidden animate-fade-in">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-slate-800">${isEditing ? 'Modify Member Profile' : 'Add New Club Member'}</h3>
              <button onClick=${() => setShowModal(false)} class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <form onSubmit=${handleFormSubmit} class="p-6 space-y-4 text-left">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Full Name</label>
                <input type="text" value=${formName} onInput=${(e) => setFormName(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Email Address</label>
                  <input type="email" value=${formEmail} onInput=${(e) => setFormEmail(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Phone Number</label>
                  <input type="text" value=${formPhone} onInput=${(e) => setFormPhone(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Access Role</label>
                  <select value=${formRole} onChange=${(e) => setFormRole(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="Super Admin">Super Admin</option>
                    <option value="President">President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Director">Director</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Club Position</label>
                  <input type="text" value=${formPosition} onInput=${(e) => setFormPosition(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="e.g. Community Service Director" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Membership Status</label>
                  <select value=${formStatus} onChange=${(e) => setFormStatus(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Honorary">Honorary</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Payment Status</label>
                  <select value=${formPayment} onChange=${(e) => setFormPayment(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>



              <div class="p-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <button type="button" onClick=${() => setShowModal(false)} class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-5 py-2 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}

// 3. PROJECT MANAGEMENT
function ProjectManagement({ projects, setProjects, fetchProjects }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Community Service');
  const [formBudget, setFormBudget] = useState(0);
  const [formImpact, setFormImpact] = useState(0);
  const [formProgress, setFormProgress] = useState(10);
  const [formStatus, setFormStatus] = useState('Planning');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formPublished, setFormPublished] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const loadFilteredProjects = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      let url = apiBase + '/api/projects?sort=' + sortBy;
      if (statusFilter === 'Trash') {
        url += '&trash=true';
      } else if (statusFilter !== 'All') {
        url += '&status=' + statusFilter;
      }
      if (searchTerm) {
        url += '&q=' + encodeURIComponent(searchTerm);
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load filtered projects', err);
    }
  };

  useEffect(() => {
    loadFilteredProjects();
  }, [searchTerm, statusFilter, sortBy]);

  // Autosave Draft every 30 seconds
  useEffect(() => {
    if (!showModal || isEditing || !formName) return;
    
    const autosaveTimer = setInterval(async () => {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const formData = new FormData();
        formData.append('title', formName);
        formData.append('avenue', formCategory);
        formData.append('budget', formBudget);
        formData.append('impact', formImpact);
        formData.append('progress', formProgress);
        formData.append('status', 'Draft');
        formData.append('short_description', formDesc.substring(0, 150));
        formData.append('full_description', formDesc);
        formData.append('date', formDate);
        formData.append('cover_image', formImage);

        const res = await fetch(apiBase + '/api/projects', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setIsEditing(true);
          setEditId(data.id);
          console.log('Draft autosaved successfully:', data.id);
          if (fetchProjects) fetchProjects();
        }
      } catch (err) {
        console.warn('Autosave failed:', err);
      }
    }, 30000);

    return () => clearInterval(autosaveTimer);
  }, [showModal, isEditing, formName, formCategory, formBudget, formImpact, formProgress, formDesc, formDate, formImage]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormName('');
    setFormCategory('Community Service');
    setFormBudget(0);
    setFormImpact(0);
    setFormProgress(10);
    setFormStatus('Planning');
    setFormDesc('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormImage('assets/projects/proj-0.png');
    setFormPublished(true);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditId(p.id);
    setFormName(p.name || p.title || '');
    setFormCategory(p.category || p.avenue || 'Community Service');
    setFormBudget(p.budget || 0);
    setFormImpact(p.impact || 0);
    setFormProgress(p.progress || 0);
    setFormStatus(p.status || 'Planning');
    setFormDesc(p.description || p.full_description || '');
    setFormDate(p.date || new Date().toISOString().split('T')[0]);
    setFormImage(p.image || p.cover_image || 'assets/projects/proj-0.png');
    setFormPublished(p.status === 'Published');
    setShowModal(true);
  };

  const togglePublish = async (pId) => {
    const proj = projects.find(p => p.id === pId);
    if (!proj) return;
    const newPublish = proj.status !== 'Published';
    const newStatus = newPublish ? 'Published' : 'Draft';
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const formData = new FormData();
      formData.append('status', newStatus);
      const res = await fetch(apiBase + '/api/projects/' + pId, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        loadFilteredProjects();
        if (fetchProjects) fetchProjects();
      }
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleRestore = async (pId) => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(apiBase + '/api/projects/' + pId + '/restore', {
        method: 'POST'
      });
      if (res.ok) {
        loadFilteredProjects();
        if (fetchProjects) fetchProjects();
      }
    } catch (err) {
      console.error('Failed to restore project', err);
    }
  };

  const handleDeletePermanent = async (pId) => {
    if (confirm('Are you sure you want to PERMANENTLY delete this project? This cannot be undone.')) {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const res = await fetch(apiBase + '/api/projects/' + pId, {
          method: 'DELETE'
        });
        if (res.ok) {
          loadFilteredProjects();
          if (fetchProjects) fetchProjects();
        }
      } catch (err) {
        console.error('Failed to permanently delete project', err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this project? It will be moved to the Trash Bin.')) {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const res = await fetch(apiBase + '/api/projects/' + id, {
          method: 'DELETE'
        });
        if (res.ok) {
          loadFilteredProjects();
          if (fetchProjects) fetchProjects();
        }
      } catch (err) {
        console.error('Failed to delete project', err);
      }
    }
  };

  const exportProjectsToExcel = () => {
    if (!window.XLSX) {
      alert("Excel library is loading, please try again.");
      return;
    }
    const data = projects.map(p => ({
      'Project ID': p.id,
      'Project Name': p.title || p.name,
      'Avenue of Service': p.avenue || p.category,
      'Budget (INR)': p.budget,
      'Impact (People)': p.impact,
      'Progress (%)': p.progress,
      'Status': p.status,
      'Published': p.status === 'Published' ? 'Yes' : 'No',
      'Date': p.date || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    XLSX.writeFile(workbook, `rotaract_warriors_projects_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportProjectsToPDF = () => {
    if (!window.jspdf) {
      alert("PDF library is loading, please try again.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    doc.setFillColor(139, 0, 58);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ROTARACT CLUB OF BANGALORE WARRIORS", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("District 3192 | Project Portfolio Directory", 15, 26);
    doc.text(`Generated: ${timestamp}`, 195, 26, { align: 'right' });
    
    const headers = [['ID', 'Project Name', 'Avenue', 'Budget', 'Impact', 'Progress', 'Status', 'Published']];
    const body = projects.map(p => [
      p.id,
      p.title || p.name,
      p.avenue || p.category,
      `INR ${p.budget}`,
      `${p.impact} people`,
      `${p.progress}%`,
      p.status,
      p.status === 'Published' ? 'Yes' : 'No'
    ]);
    
    doc.autoTable({
      startY: 42,
      head: headers,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [139, 0, 58] },
      styles: { fontSize: 8.5, cellPadding: 3.5 },
      didDrawPage: function(data) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text(`Report Generated on: ${timestamp}`, 15, 287);
        doc.text(`Page ${data.pageNumber}`, 195, 287, { align: 'right' });
      }
    });
    
    doc.save(`rotaract_warriors_projects_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const formData = new FormData();
      formData.append('title', formName);
      formData.append('avenue', formCategory);
      formData.append('budget', formBudget);
      formData.append('impact', formImpact);
      formData.append('progress', formProgress);
      formData.append('status', formPublished ? 'Published' : formStatus);
      formData.append('short_description', formDesc.substring(0, 150));
      formData.append('full_description', formDesc);
      formData.append('date', formDate);
      formData.append('cover_image', formImage);

      let res;
      if (isEditing) {
        res = await fetch(apiBase + '/api/projects/' + editId, {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch(apiBase + '/api/projects', {
          method: 'POST',
          body: formData
        });
      }

      if (res.ok) {
        setShowModal(false);
        loadFilteredProjects();
        if (fetchProjects) fetchProjects();
      } else {
        const err = await res.json();
        alert('Failed to save project: ' + (err.error || 'Server error'));
      }
    } catch (err) {
      console.error('Error saving project', err);
      alert('Error connecting to backend database server.');
    }
  };

  return html`
    <div class="space-y-6">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">Avenue Projects</h2>
          <p class="text-sm text-slate-400">Track, report, import and export club projects.</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button onClick=${exportProjectsToExcel} class="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5">
            📊 Export Excel
          </button>
          <button onClick=${exportProjectsToPDF} class="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5">
            📄 Export PDF
          </button>
          <button onClick=${handleOpenAdd} class="px-3.5 py-2 bg-burgundy-500 text-white rounded-xl text-xs font-bold hover:bg-burgundy-600 shadow-sm transition-all flex items-center gap-1.5">
            ➕ Start Project
          </button>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="flex flex-wrap items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm justify-between">
        <div class="flex items-center gap-3 flex-1 min-w-[280px]">
          <span class="text-slate-400">🔍</span>
          <input type="text" value=${searchTerm} onInput=${(e) => setSearchTerm(e.target.value)} placeholder="Search projects by name, lead, avenue, date..." class="w-full text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400" />
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <select value=${statusFilter} onChange=${(e) => setStatusFilter(e.target.value)} class="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none bg-slate-50 text-slate-700">
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
            <option value="Trash">Trash Bin</option>
          </select>
          <select value=${sortBy} onChange=${(e) => setSortBy(e.target.value)} class="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none bg-slate-50 text-slate-700">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${projects.map((p) => html`
          <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium p-6 flex flex-col justify-between hover:shadow-card hover:translate-y-[-2px] transition-all duration-300">
            <div>
              <!-- Project Thumbnail Image Banner -->
              <div class="h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl relative bg-slate-100">
                <img src=${p.cover_image || p.image || 'assets/projects/proj-0.png'} class="w-full h-full object-cover" onError=${(e) => { e.target.src = 'assets/projects/proj-0.png'; }} />
                <div class="absolute top-3 left-3 flex gap-2">
                  <span class="text-[9px] font-bold uppercase bg-white/95 text-burgundy-600 px-2 py-0.5 rounded-md shadow-sm border border-burgundy-100/50">${p.avenue || p.category}</span>
                </div>
                <div class="absolute top-3 right-3 flex gap-2">
                  <span class="px-2 py-0.5 rounded-md text-[9px] font-extrabold shadow-sm ${
                    p.status === 'Published' ? 'bg-emerald-600 text-white' : p.status === 'Archived' ? 'bg-amber-600 text-white' : 'bg-slate-500 text-white'
                  }">${p.status}</span>
                </div>
              </div>

              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-mono text-slate-400 font-semibold">ID: ${p.id}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">${p.date}</span>
              </div>
              
              <h3 class="text-base font-bold text-slate-800 mb-4 line-clamp-1">${p.title || p.name || 'Untitled Project'}</h3>

              <!-- Progress Bar -->
              <div class="space-y-2 mb-6">
                <div class="flex justify-between text-xs font-bold text-slate-500">
                  <span>Development Progress</span>
                  <span>${p.progress}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-burgundy-500 h-2 rounded-full transition-all duration-500" style="width: ${p.progress}%;"></div>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
              <div class="flex gap-4">
                <div>
                  <p class="text-slate-400 font-medium">Budget</p>
                  <p class="font-extrabold text-slate-700 mt-0.5">₹${(p.budget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p class="text-slate-400 font-medium">Impact</p>
                  <p class="font-extrabold text-slate-700 mt-0.5">${p.impact || 0} Lives</p>
                </div>
              </div>

              <div class="space-x-0.5 flex items-center">
                ${statusFilter === 'Trash' ? html`
                  <button onClick=${() => handleRestore(p.id)} class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors" title="Restore Project">
                    Restore
                  </button>
                  <button onClick=${() => handleDeletePermanent(p.id)} class="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors" title="Delete Permanently">
                    Delete
                  </button>
                ` : html`
                  <button onClick=${() => togglePublish(p.id)} class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors inline-block" title=${p.status === 'Published' ? 'Unpublish (Make Draft)' : 'Publish (Make Public)'}>
                    ${p.status === 'Published' ? '🌐' : '👁️'}
                  </button>
                  <button onClick=${() => handleOpenEdit(p)} class="p-1.5 text-slate-400 hover:text-burgundy-500 hover:bg-slate-50 rounded-lg transition-colors inline-block" title="Edit">✏️</button>
                  <button onClick=${() => handleDelete(p.id)} class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors inline-block" title="Delete">🗑</button>
                `}
              </div>
            </div>
          </div>
        `)}
      </div>

      <!-- Add/Edit Modal -->
      ${showModal && html`
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-[3000] p-6 font-sans">
          <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium w-full max-w-lg overflow-hidden animate-fade-in">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-slate-800">${isEditing ? 'Update Project Metrics' : 'Launch New Service Project'}</h3>
              <button onClick=${() => setShowModal(false)} class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <form onSubmit=${handleFormSubmit} class="p-6 space-y-4 text-left">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Project Name</label>
                <input type="text" value=${formName} onInput=${(e) => setFormName(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Avenue of Service</label>
                  <select value=${formCategory} onChange=${(e) => setFormCategory(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="Club Service">Club Service</option>
                    <option value="Community Service">Community Service</option>
                    <option value="Vocational Service">Vocational Service</option>
                    <option value="International Service">International Service</option>
                    <option value="Professional Dev">Professional Development</option>
                    <option value="Environmental">Environmental Service</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Execution Date</label>
                  <input type="date" value=${formDate} onInput=${(e) => setFormDate(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Upload Image / Photo</label>
                  <div class="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange=${(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 400;
                            const MAX_HEIGHT = 300;
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                            setFormImage(compressedBase64);
                          };
                          img.src = ev.target.result;
                        };
                        reader.readAsDataURL(file);
                      }
                    }} class="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-burgundy-50 file:text-burgundy-700 hover:file:bg-burgundy-100" />
                    ${formImage && html`<img src=${formImage} class="w-8 h-8 rounded-lg object-cover border border-slate-200" onError=${(e) => { e.target.style.display = 'none'; }} />`}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Status</label>
                  <select value=${formStatus} onChange=${(e) => setFormStatus(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Budget (INR)</label>
                  <input type="number" value=${formBudget} onInput=${(e) => setFormBudget(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Impact (People)</label>
                  <input type="number" value=${formImpact} onInput=${(e) => setFormImpact(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Progress (%)</label>
                  <input type="number" min="0" max="100" value=${formProgress} onInput=${(e) => setFormProgress(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Project Description</label>
                <textarea value=${formDesc} onInput=${(e) => setFormDesc(e.target.value)} rows="3" class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="Enter detailed project description here..."></textarea>
              </div>

              <div class="flex items-center gap-2 py-1">
                <input type="checkbox" id="projectPublishedCheckbox" checked=${formPublished} onChange=${(e) => setFormPublished(e.target.checked)} class="w-4 h-4 text-burgundy-600 border-slate-300 rounded focus:ring-burgundy-500" />
                <label for="projectPublishedCheckbox" class="text-xs font-bold text-slate-600 cursor-pointer select-none">Publish Project (Make visible on public website)</label>
              </div>

              <div class="p-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <button type="button" onClick=${() => setShowModal(false)} class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-5 py-2 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}

// 4. EVENTS MODULE
function EventsModule({ events, fetchEvents }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formRegistrations, setFormRegistrations] = useState(0);
  const [formBudget, setFormBudget] = useState(0);
  const [formStatus, setFormStatus] = useState('Upcoming');
  const [formCategory, setFormCategory] = useState('meeting');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormName('');
    setFormDate('');
    setFormVenue('');
    setFormRegistrations(0);
    setFormBudget(0);
    setFormStatus('Upcoming');
    setFormCategory('meeting');
    setFormDescription('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleOpenEdit = (e) => {
    setIsEditing(true);
    setEditId(e.id);
    setFormName(e.name);
    setFormDate(e.date);
    setFormVenue(e.venue);
    setFormRegistrations(e.registrations);
    setFormBudget(e.budget);
    setFormStatus(e.status);
    setFormCategory(e.category || 'meeting');
    setFormDescription(e.description || '');
    setSubmitError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      
      const payload = {
        name: formName,
        date: formDate,
        venue: formVenue,
        registrations: parseInt(formRegistrations),
        budget: parseInt(formBudget),
        status: formStatus,
        category: formCategory,
        description: formDescription
      };

      const url = isEditing 
        ? `${apiBase}/api/events/${editId}` 
        : `${apiBase}/api/events`;
        
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchEvents();
      } else {
        const errorData = await res.json();
        setSubmitError(errorData.error || 'Failed to save event metadata.');
      }
    } catch (err) {
      setSubmitError('Connection error: Failed to connect to server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to cancel this event?')) {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const res = await fetch(`${apiBase}/api/events/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchEvents();
        } else {
          alert('Failed to delete event from backend.');
        }
      } catch (err) {
        alert('Connection error: Failed to connect to server.');
        console.error(err);
      }
    }
  };

  const exportToExcel = () => {
    if (!window.XLSX) {
      alert("Excel library is loading, please try again in a moment.");
      return;
    }
    const data = events.map(e => ({
      'Event ID': e.id,
      'Event Title': e.name,
      'Date': e.date,
      'Time': e.time,
      'Venue / Location': e.venue,
      'Category': e.category || 'meeting',
      'Target Budget (INR)': e.budget,
      'Registrations': e.registrations,
      'Status': e.status,
      'Attendance': e.attendance || 0,
      'Description': e.description || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events Calendar");
    XLSX.writeFile(workbook, `warriors_events_calendar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (!window.jspdf) {
      alert("PDF library is loading, please try again in a moment.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    doc.setFillColor(139, 0, 58);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ROTARACT CLUB OF BANGALORE WARRIORS", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("District 3192 | Events Schedule Directory", 15, 26);
    doc.text(`Generated: ${timestamp}`, 195, 26, { align: 'right' });
    
    const headers = [['ID', 'Event Title', 'Date & Time', 'Venue', 'Category', 'Status']];
    const body = events.map(e => [
      e.id,
      e.name,
      `${e.date}\n${e.time || '18:00'}`,
      e.venue,
      e.category || 'meeting',
      e.status
    ]);
    
    doc.autoTable({
      head: headers,
      body: body,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [139, 0, 58], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 45 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' }
      },
      styles: { fontSize: 9 }
    });
    
    doc.save(`warriors_events_calendar_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return html`
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">Event Calendars</h2>
          <p class="text-sm text-slate-400">Schedule meetings, ceremonies, and general assemblies.</p>
        </div>
        <div class="flex items-center gap-3">
          <button onClick=${exportToExcel} class="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5" title="Export Excel">
            📊 Export Excel
          </button>
          <button onClick=${exportToPDF} class="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5" title="Export PDF">
            📄 Export PDF
          </button>
          <button onClick=${handleOpenAdd} class="px-4 py-2.5 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 shadow-[0_4px_12px_rgba(139,0,58,0.15)] transition-all flex items-center gap-2">
            ➕ Create Event
          </button>
        </div>
      </div>

      <!-- Events List -->
      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th class="p-4 pl-6">ID</th>
                <th class="p-4">Event Details</th>
                <th class="p-4">Date</th>
                <th class="p-4">Venue</th>
                <th class="p-4 text-center">Registrations</th>
                <th class="p-4 text-center">Budget</th>
                <th class="p-4">Status</th>
                <th class="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              ${events.map((e) => html`
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="p-4 pl-6 font-mono text-xs font-semibold text-slate-500">${e.id}</td>
                  <td class="p-4 font-bold text-slate-800">${e.name}</td>
                  <td class="p-4 text-xs font-medium text-slate-600">${new Date(e.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td class="p-4 text-xs font-medium text-slate-500">${e.venue}</td>
                  <td class="p-4 text-center font-bold text-slate-800">${e.registrations} Users</td>
                  <td class="p-4 text-center font-semibold text-slate-700">₹${e.budget.toLocaleString()}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${
                      e.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-burgundy-50 text-burgundy-600 border-burgundy-100'
                    }">${e.status}</span>
                  </td>
                  <td class="p-4 pr-6 text-right space-x-2">
                    <button onClick=${() => handleOpenEdit(e)} class="text-slate-400 hover:text-burgundy-500 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block" title="Edit">✏️</button>
                    <button onClick=${() => handleDelete(e.id)} class="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block" title="Cancel">🗑</button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      ${showModal && html`
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center z-[3000] p-6 font-sans">
          <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium w-full max-w-md overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-slate-800">${isEditing ? 'Modify Event Metadata' : 'Schedule New Event'}</h3>
              <button onClick=${() => setShowModal(false)} class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <form onSubmit=${handleFormSubmit} class="p-6 space-y-4 text-left">
              ${submitError && html`
                <div class="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 text-center">
                  ⚠️ ${submitError}
                </div>
              `}

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Event Title</label>
                <input type="text" value=${formName} onInput=${(e) => setFormName(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Date</label>
                  <input type="date" value=${formDate} onInput=${(e) => setFormDate(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Target Budget (INR)</label>
                  <input type="number" value=${formBudget} onInput=${(e) => setFormBudget(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Venue / Platform</label>
                <input type="text" value=${formVenue} onInput=${(e) => setFormVenue(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="e.g. Zoom link or City Hall" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Category</label>
                  <select value=${formCategory} onChange=${(e) => setFormCategory(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="meeting">Meeting / Seminar</option>
                    <option value="fellowship">Fellowship Event</option>
                    <option value="club">Club Project</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Status</label>
                  <select value=${formStatus} onChange=${(e) => setFormStatus(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Initial Registrations</label>
                  <input type="number" value=${formRegistrations} onInput=${(e) => setFormRegistrations(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Description / Details</label>
                <textarea value=${formDescription} onInput=${(e) => setFormDescription(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" rows="3" placeholder="Enter event details..."></textarea>
              </div>

              <div class="p-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <button type="button" onClick=${() => setShowModal(false)} class="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled=${isSubmitting} class="px-5 py-2 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 disabled:opacity-50">
                  ${isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}

// 5. FINANCE DASHBOARD
function FinanceDashboard({ finances, fetchFinances }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Membership Dues');
  const [type, setType] = useState('Income');
  const [amount, setAmount] = useState(0);
  const [referenceNote, setReferenceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [invoiceImage, setInvoiceImage] = useState('');

  const totalIncome = finances.filter(f => f.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const handleInvoiceImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        setInvoiceImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddTxn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      
      const payload = {
        desc,
        category,
        type,
        amount: parseInt(amount),
        reference_note: referenceNote,
        invoice_image: invoiceImage
      };
      
      const res = await fetch(`${apiBase}/api/finances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowAddForm(false);
        setDesc('');
        setAmount(0);
        setReferenceNote('');
        setInvoiceImage('');
        fetchFinances();
      } else {
        const errorData = await res.json();
        setSubmitError(errorData.error || 'Failed to save transaction entry.');
      }
    } catch (err) {
      setSubmitError('Connection error: Failed to connect to server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTxn = async (id) => {
    if (confirm('Are you sure you want to delete this financial ledger entry?')) {
      const reason = prompt('Why do you want to delete this transaction? (Required for audit log)');
      if (reason === null) {
        alert('Deletion cancelled.');
        return;
      }
      if (!reason.trim()) {
        alert('Deletion cancelled. A valid reason is required.');
        return;
      }
      
      const adminNameInput = prompt('Please enter your name: (Required for audit log)');
      if (adminNameInput === null) {
        alert('Deletion cancelled.');
        return;
      }
      if (!adminNameInput.trim()) {
        alert('Deletion cancelled. Your name is required.');
        return;
      }
      
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const url = `${apiBase}/api/finances/${id}?reason=${encodeURIComponent(reason.trim())}&deleted_by=${encodeURIComponent(adminNameInput.trim())}`;
        const res = await fetch(url, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchFinances();
        } else {
          alert('Failed to delete transaction from backend.');
        }
      } catch (err) {
        alert('Connection error: Failed to connect to server.');
        console.error(err);
      }
    }
  };

  const exportToExcel = () => {
    if (!window.XLSX) {
      alert("Excel library is loading, please try again in a moment.");
      return;
    }
    const data = finances.map(f => ({
      'Transaction ID': f.id,
      'Description': f.desc,
      'Flow Type': f.type,
      'Category': f.category,
      'Date': f.date,
      'Amount (INR)': f.amount,
      'Reference Note': f.reference_note || '',
      'Invoice Link': f.invoice_url ? (f.invoice_url.startsWith('http') ? f.invoice_url : (window.location.origin === 'null' || window.location.protocol === 'file:' ? 'http://localhost:5000' + f.invoice_url : window.location.origin + f.invoice_url)) : ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finances Ledger");
    XLSX.writeFile(workbook, `warriors_finance_ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    if (!window.jspdf) {
      alert("PDF library is loading, please try again in a moment.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    doc.setFillColor(139, 0, 58);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ROTARACT CLUB OF BANGALORE WARRIORS", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("District 3192 | Financial Ledger Directory", 15, 26);
    doc.text(`Generated: ${timestamp}`, 195, 26, { align: 'right' });
    
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 42, 180, 20, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 42, 180, 20, 'S');
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.text("TOTAL INCOME", 25, 49);
    doc.text("TOTAL EXPENSES", 85, 49);
    doc.text("NET BALANCE", 145, 49);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(`Rs. ${totalIncome.toLocaleString()}`, 25, 56);
    doc.setTextColor(239, 68, 68);
    doc.text(`Rs. ${totalExpense.toLocaleString()}`, 85, 56);
    doc.setTextColor(30, 41, 59);
    doc.text(`Rs. ${currentBalance.toLocaleString()}`, 145, 56);
    
    const headers = [['ID', 'Description', 'Category', 'Date', 'Type', 'Amount', 'Reference Note', 'Invoice Link']];
    const body = finances.map(f => [
      f.id,
      f.desc,
      f.category,
      f.date,
      f.type,
      `Rs. ${f.amount.toLocaleString()}`,
      f.reference_note || '',
      f.invoice_url ? (f.invoice_url.startsWith('http') ? f.invoice_url : (window.location.origin === 'null' || window.location.protocol === 'file:' ? 'http://localhost:5000' + f.invoice_url : window.location.origin + f.invoice_url)) : '-'
    ]);
    
    doc.autoTable({
      head: headers,
      body: body,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [139, 0, 58], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 25 },
        7: { cellWidth: 35 }
      },
      styles: { fontSize: 7.5 }
    });
    
    doc.save(`warriors_finance_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return html`
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">Finance Control</h2>
          <p class="text-sm text-slate-400">Record cashflows, sponsorship deals, and membership collections.</p>
        </div>
        <div class="flex items-center gap-3">
          <button onClick=${exportToExcel} class="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5" title="Export Excel">
            📊 Export Excel
          </button>
          <button onClick=${exportToPDF} class="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-1.5" title="Export PDF">
            📄 Export PDF
          </button>
          <button onClick=${() => setShowAddForm(!showAddForm)} class="px-4 py-2.5 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 shadow-[0_4px_12px_rgba(139,0,58,0.15)] transition-all flex items-center gap-2">
            ${showAddForm ? 'Close Entry Form' : '➕ Record Transaction'}
          </button>
        </div>
      </div>

      <!-- Cash Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Dues Collected (Income)</p>
          <h3 class="text-2xl font-extrabold text-emerald-600 mt-2 font-display">₹${totalIncome.toLocaleString()}</h3>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Disbursements (Expenses)</p>
          <h3 class="text-2xl font-extrabold text-rose-600 mt-2 font-display">₹${totalExpense.toLocaleString()}</h3>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200/60 shadow-premium p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Net Liquidity (Balance)</p>
          <h3 class="text-2xl font-extrabold text-slate-800 mt-2 font-display">₹${currentBalance.toLocaleString()}</h3>
        </div>
      </div>

      <!-- Add Form overlay/card -->
      ${showAddForm && html`
        <div class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-premium max-w-lg animate-fade-in text-left">
          <h3 class="text-sm font-bold text-slate-800 mb-4 uppercase">New Financial Ledger Entry</h3>
          <form onSubmit=${handleAddTxn} class="space-y-4">
            ${submitError && html`
              <div class="bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl border border-rose-100 text-center">
                ⚠️ ${submitError}
              </div>
            `}

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
              <input type="text" value=${desc} onInput=${(e) => setDesc(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="e.g. Zoom monthly subscription fee" required />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Flow Type</label>
                <select value=${type} onChange=${(e) => setType(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                  <option value="Income">Income (+)</option>
                  <option value="Expense">Expense (-)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Category</label>
                <select value=${category} onChange=${(e) => setCategory(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 bg-white">
                  <option value="Membership Dues">Membership Dues</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Donation">Donations / Gifts</option>
                  <option value="Projects">Project Expense</option>
                  <option value="Events">Event Logistics</option>
                  <option value="Administrative">Office / Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Transaction Amount (INR)</label>
              <input type="number" value=${amount} onInput=${(e) => setAmount(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Reference Note (For Reference)</label>
              <input type="text" value=${referenceNote} onInput=${(e) => setReferenceNote(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="e.g. Transaction receipt ID or bank details" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Upload Invoice Picture (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange=${handleInvoiceImageChange}
                class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-burgundy-50 file:text-burgundy-700 hover:file:bg-burgundy-100"
              />
              ${invoiceImage && html`
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-semibold">✓ Invoice Image Loaded</span>
                  <button type="button" onClick=${() => setInvoiceImage('')} class="text-rose-500 text-xs font-bold hover:underline">Remove</button>
                </div>
              `}
            </div>

            <button type="submit" disabled=${isSubmitting} class="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50">
              ${isSubmitting ? 'Publishing...' : 'Publish Entry'}
            </button>
          </form>
        </div>
      `}

      <!-- Transactions List -->
      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden text-left">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wide">Recent Financial Activity</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th class="p-4 pl-6">ID</th>
                <th class="p-4">Description</th>
                <th class="p-4">Category</th>
                <th class="p-4">Reference Note</th>
                <th class="p-4">Date</th>
                <th class="p-4 text-right">Amount</th>
                <th class="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              ${finances.map((f) => html`
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="p-4 pl-6 font-mono text-xs font-semibold text-slate-500">${f.id}</td>
                  <td class="p-4 font-bold text-slate-800">${f.desc}</td>
                  <td class="p-4"><span class="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">${f.category}</span></td>
                  <td class="p-4 text-xs font-medium text-slate-500">${f.reference_note || '-'}</td>
                  <td class="p-4 text-xs font-medium text-slate-500">${new Date(f.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td class="p-4 text-right font-extrabold ${
                    f.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                  }">
                    ${f.type === 'Income' ? '+' : '-'} ₹${f.amount.toLocaleString()}
                  </td>
                  <td class="p-4 pr-6 text-right flex justify-end items-center gap-1.5">
                    ${f.invoice_url && html`
                      <a
                        href=${f.invoice_url.startsWith('http') ? f.invoice_url : (f.invoice_url.startsWith('/') ? (window.location.port === '5000' ? f.invoice_url : 'http://localhost:5000' + f.invoice_url) : f.invoice_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-slate-400 hover:text-burgundy-500 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block text-xs"
                        title="View Invoice"
                      >
                        🧾
                      </a>
                    `}
                    <button onClick=${() => handleDeleteTxn(f.id)} class="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block" title="Delete Entry">🗑</button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 6. WEBSITE CMS
function WebsiteCms({ cms, setCms }) {
  const [heroTitle, setHeroTitle] = useState(cms.heroTitle);
  const [presidentMessage, setPresidentMessage] = useState(cms.presidentMessage);
  const [announcements, setAnnouncements] = useState(cms.announcements);
  const [msgStatus, setMsgStatus] = useState('');

  const handleCmsSave = (e) => {
    e.preventDefault();
    setCms({ heroTitle, presidentMessage, announcements });
    setMsgStatus('Website settings saved successfully!');
    setTimeout(() => setMsgStatus(''), 3000);
  };

  return html`
    <div class="space-y-6 text-left max-w-2xl">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">Website CMS</h2>
        <p class="text-sm text-slate-400">Edit dynamic headers and messages served on the public club page.</p>
      </div>

      <form onSubmit=${handleCmsSave} class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-premium space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Hero Banner Title</label>
          <input type="text" value=${heroTitle} onInput=${(e) => setHeroTitle(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">President message</label>
          <textarea rows="4" value=${presidentMessage} onInput=${(e) => setPresidentMessage(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Latest Announcement Notice</label>
          <input type="text" value=${announcements} onInput=${(e) => setAnnouncements(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
        </div>

        ${msgStatus && html`
          <div class="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 text-center">
            ${msgStatus}
          </div>
        `}

        <button type="submit" class="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm">
          Publish Changes to Live Site
        </button>
      </form>
    </div>
  `;
}

// 6.5. ABOUT US CMS
function AboutUsCms() {
  const [heroDesc, setHeroDesc] = useState('');
  const [whoTitle, setWhoTitle] = useState('');
  const [whoDesc, setWhoDesc] = useState('');
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [purpose, setPurpose] = useState('');
  const [msgStatus, setMsgStatus] = useState('');

  useEffect(() => {
    const rawData = localStorage.getItem('warriors_about_us');
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        setHeroDesc(data.heroDesc || '');
        setWhoTitle(data.whoTitle || '');
        setWhoDesc(data.whoDesc || '');
        setMission(data.mission || '');
        setVision(data.vision || '');
        setPurpose(data.purpose || '');
      } catch (e) {
        console.error(e);
      }
    } else {
      // Set visually stunning defaults matching mockup
      setHeroDesc('Rotaract Bangalore Warriors is a family of passionate young leaders committed to creating positive change through service, leadership, fellowship and innovation.');
      setWhoTitle('More than a Club,\nWe are a Movement');
      setWhoDesc('We are a team of passionate individuals who believe in the power of service and the impact of togetherness. Through meaningful projects and initiatives, we strive to build a better community and a stronger tomorrow.');
      setMission('To empower young leaders to drive positive community impact through service and fellowship.');
      setVision('To build a legacy of change, leadership excellence, and collaborative youth action in Bangalore.');
      setPurpose('Service Above Self - creating a cooperative platform for young minds to develop and grow.');
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { heroDesc, whoTitle, whoDesc, mission, vision, purpose };
    localStorage.setItem('warriors_about_us', JSON.stringify(data));
    setMsgStatus('About Us CMS changes published successfully!');
    setTimeout(() => setMsgStatus(''), 3000);
  };

  return html`
    <div class="space-y-6 text-left max-w-2xl">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">About Us CMS</h2>
        <p class="text-sm text-slate-400">Edit dynamic headings, descriptive bio, mission and vision served on the standalone About Us page.</p>
      </div>

      <form onSubmit=${handleSave} class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-premium space-y-6">
        <div>
          <h3 class="text-xs font-bold text-burgundy-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Hero Section</h3>
          <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Hero Description Text</label>
          <textarea rows="3" value=${heroDesc} onInput=${(e) => setHeroDesc(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
        </div>

        <div>
          <h3 class="text-xs font-bold text-burgundy-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Who We Are Section</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Who We Are Title (Use new lines for breaks)</label>
              <textarea rows="2" value=${whoTitle} onInput=${(e) => setWhoTitle(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Who We Are Description</label>
              <textarea rows="4" value=${whoDesc} onInput=${(e) => setWhoDesc(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-bold text-burgundy-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Core Principles</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Mission Statement</label>
              <textarea rows="2" value=${mission} onInput=${(e) => setMission(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Vision Statement</label>
              <textarea rows="2" value=${vision} onInput=${(e) => setVision(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Core Purpose / Motto</label>
              <textarea rows="2" value=${purpose} onInput=${(e) => setPurpose(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required></textarea>
            </div>
          </div>
        </div>

        ${msgStatus && html`
          <div class="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 text-center animate-pulse">
            ${msgStatus}
          </div>
        `}

        <button type="submit" class="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm">
          Publish Changes to Live About Page
        </button>
      </form>
    </div>
  `;
}

// 7. NOTIFICATIONS CENTER
function NotificationsCenter() {
  const notifications = [
    { type: '🎂', text: 'Birthday Alert: Rohan Das is celebrating today!', time: 'Today' },
    { type: '⏰', text: 'Secretary reminder: Core meeting minutes are due in 24 hours.', time: 'Today' },
    { type: '⚠️', text: 'Unpaid Dues Warning: Vikram Singh has outstanding membership charges.', time: '1d ago' },
    { type: '📩', text: 'District Circular: Joint assembly invites received.', time: '3d ago' },
  ];

  return html`
    <div class="space-y-6 text-left max-w-2xl">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">Notifications Centre</h2>
        <p class="text-sm text-slate-400">Warnings, birthday alerts, and due notices.</p>
      </div>

      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden divide-y divide-slate-100">
        ${notifications.map((n) => html`
          <div class="p-5 flex gap-4 items-start hover:bg-slate-50/50 transition-colors">
            <span class="text-xl p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0">${n.type}</span>
            <div class="flex-grow">
              <p class="text-sm font-semibold text-slate-700">${n.text}</p>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">${n.time}</span>
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
}

// 8. REPORTS GENERATOR
function ReportsGenerator({ members, projects, finances }) {
  const handleExport = (reportType) => {
    let csv = '';
    let fileName = '';

    if (reportType === 'membership') {
      csv = 'ID,Name,Email,Role,Status,Payment\n';
      members.forEach(m => csv += `${m.id},"${m.name}",${m.email},${m.role},${m.status},${m.payment}\n`);
      fileName = 'membership_report';
    } else if (reportType === 'projects') {
      csv = 'ID,Name,Category,Budget,Impact,Progress,Status\n';
      projects.forEach(p => csv += `${p.id},"${p.name}",${p.category},${p.budget},${p.impact},${p.progress}%,${p.status}\n`);
      fileName = 'projects_report';
    } else {
      csv = 'ID,Description,Category,Type,Amount,Date\n';
      finances.forEach(f => csv += `${f.id},"${f.desc}",${f.category},${f.type},${f.amount},${f.date}\n`);
      fileName = 'finance_ledger_report';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rotaract_warriors_${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return html`
    <div class="space-y-6 text-left max-w-2xl">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">Export Reports</h2>
        <p class="text-sm text-slate-400">Generate and download official CSV spreadsheets for audits and files.</p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-premium flex justify-between items-center hover:shadow-card transition-all">
          <div>
            <h4 class="text-sm font-bold text-slate-700 uppercase">Club Membership Ledger</h4>
            <p class="text-xs text-slate-400 mt-1">Full details of registered members, designation roles, and dues.</p>
          </div>
          <button onClick=${() => handleExport('membership')} class="px-4 py-2 bg-burgundy-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-burgundy-600">Export CSV</button>
        </div>

        <div class="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-premium flex justify-between items-center hover:shadow-card transition-all">
          <div>
            <h4 class="text-sm font-bold text-slate-700 uppercase">Service Projects Ledger</h4>
            <p class="text-xs text-slate-400 mt-1">Report containing developmental progress, impact figures, and budgets.</p>
          </div>
          <button onClick=${() => handleExport('projects')} class="px-4 py-2 bg-burgundy-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-burgundy-600">Export CSV</button>
        </div>

        <div class="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-premium flex justify-between items-center hover:shadow-card transition-all">
          <div>
            <h4 class="text-sm font-bold text-slate-700 uppercase">Financial Cashflow Statements</h4>
            <p class="text-xs text-slate-400 mt-1">Full ledger listing collections, sponsorship payouts, and logistics costs.</p>
          </div>
          <button onClick=${() => handleExport('finances')} class="px-4 py-2 bg-burgundy-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-burgundy-600">Export CSV</button>
        </div>
      </div>
    </div>
  `;
}

// 9. SECRETARY ADMIN PANEL
function SecretaryAdminPanel({ adminName, setAdminName, googleCalendarId, fetchSettings }) {
  const [inputName, setInputName] = useState(adminName);
  const [inputCalendarId, setInputCalendarId] = useState(googleCalendarId);
  const [clubName, setClubName] = useState('Rotaract Bangalore Warriors');
  const [district, setDistrict] = useState('3192');
  const [zone, setZone] = useState('Zone PRAVAHA');
  const [msg, setMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInputCalendarId(googleCalendarId);
  }, [googleCalendarId]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');
    
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      
      const res = await fetch(`${apiBase}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          google_calendar_id: inputCalendarId
        })
      });
      
      if (res.ok) {
        setAdminName(inputName);
        setMsg('Settings updated successfully!');
        fetchSettings();
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg('Failed to save settings to server.');
      }
    } catch (err) {
      setMsg('Connection error: Failed to save settings.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return html`
    <div class="space-y-6 text-left max-w-2xl">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">Secretary Admin Panel</h2>
        <p class="text-sm text-slate-400">Configure administrative profile details and club credentials.</p>
      </div>

      <form onSubmit=${handleSettingsSubmit} class="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-premium space-y-6">
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Admin Profile Details</h3>
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Administrator Display Name</label>
            <input type="text" value=${inputName} onInput=${(e) => setInputName(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
          </div>
        </div>

        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Google Calendar Integration</h3>
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Google Calendar ID</label>
            <input type="text" value=${inputCalendarId} onInput=${(e) => setInputCalendarId(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="e.g. primary or your-custom-id@group.calendar.google.com" />
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Make sure you share this calendar with the service account email: <strong class="text-burgundy-500 select-all">rotaract-drive-uploader@warr-501710.iam.gserviceaccount.com</strong> with <strong>"Make changes to events"</strong> access permissions.
            </p>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">Rotaract Club Identity</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Club Name</label>
              <input type="text" value=${clubName} onInput=${(e) => setClubName(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Rotary District</label>
                <input type="text" value=${district} onInput=${(e) => setDistrict(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Zone</label>
                <input type="text" value=${zone} onInput=${(e) => setZone(e.target.value)} class="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
              </div>
            </div>
          </div>
        </div>
        ${msg && html`
          <div class="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 text-center">
            ${msg}
          </div>
        `}

        <button type="submit" disabled=${isSaving} class="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm disabled:opacity-50">
          ${isSaving ? 'Saving settings...' : 'Save Settings'}
        </button>
      </form>
    </div>
  `;
}

// 10. MINUTES OF MEETING GENERATOR MODULE
function MinutesOfMeetingGenerator({ members = [], momId = null, clearEditMomId = null, onTabChange = null, defaultType = null }) {
  const [activeTab, setActiveTab] = useState('details');
  const [title, setTitle] = useState(defaultType === 'Project Report' ? 'Project Service Activity' : 'Board Meeting');
  const [type, setType] = useState(defaultType || 'Board Meeting');
  const [number, setNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('03:00 PM');
  const [venue, setVenue] = useState('Google Meet');
  const [chairedBy, setChairedBy] = useState('Rtr. Rishabh Guptha (President)');
  const [recordedBy, setRecordedBy] = useState('Rtr. Lathiesh Kumar (Secretary)');
  const [link, setLink] = useState('');
  
  const [agenda, setAgenda] = useState(['Welcome Address', 'Confirmation of Previous MoM', 'Project Updates', 'Finance Update', 'New Proposals', 'Any Other Business']);
  const [discussions, setDiscussions] = useState([]);
  
  // Attendance
  const [presentIds, setPresentIds] = useState([]);
  const [absentIds, setAbsentIds] = useState([]);
  const [guests, setGuests] = useState(['Rtr. Lathiesh Kumar', 'Rtr. Rishabh Guptha']);
  const [newGuest, setNewGuest] = useState('');
  
  // Action Items
  const [actionItems, setActionItems] = useState([
    { id: 'ACT-1', task: 'Send blood drive certificates', assigned_to_id: '', assigned_to_name: 'Rtr. Lathiesh Kumar', due_date: '2026-07-15', status: 'Pending' }
  ]);
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  
  // President/Secretary names, modes and money involved
  const [presidentName, setPresidentName] = useState('Rtr. Rishabh Guptha');
  const [secretaryName, setSecretaryName] = useState('Rtr. Lathiesh Kumar');
  const [presidentSelectMode, setPresidentSelectMode] = useState('select');
  const [secretarySelectMode, setSecretarySelectMode] = useState('select');
  const [excludedAgendaIndices, setExcludedAgendaIndices] = useState([]);
  const [momPictures, setMomPictures] = useState([]);
  const [moneyInvolved, setMoneyInvolved] = useState({ has_money: false, amount: 0, description: '', type: 'Expense' });
  const [uploadToDrive, setUploadToDrive] = useState(true);
  
  const [status, setStatus] = useState('Draft');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch MoM details for editing
  useEffect(() => {
    if (momId) {
      const fetchMomDetails = async () => {
        try {
          const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
          const res = await fetch(`${apiBase}/api/moms/${momId}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title || '');
            setType(data.type || '');
            setNumber(data.number || '');
            setDate(data.date || '');
            setTime(data.time || '');
            setVenue(data.venue || '');
            setChairedBy(data.chaired_by || '');
            setRecordedBy(data.recorded_by || '');
            setLink(data.link || '');
            setAgenda(data.agenda || []);
            setDiscussions(data.discussions || []);
            setPresentIds(data.attendance?.present_ids || []);
            setAbsentIds(data.attendance?.absent_ids || []);
            setGuests(data.attendance?.guests || []);
            setActionItems(data.action_items || []);
            setStatus(data.status || 'Draft');
            
            const pName = data.president_name || 'Rtr. Rishabh Guptha';
            const sName = data.secretary_name || 'Rtr. Lathiesh Kumar';
            setPresidentName(pName);
            setSecretaryName(sName);
            
            const moneyObj = data.money_involved || { has_money: false, amount: 0, description: '', type: 'Expense' };
            setMoneyInvolved(moneyObj);
            setExcludedAgendaIndices(moneyObj.excluded_agenda_indices || []);
            setMomPictures(moneyObj.pictures || []);
            
            if (members.length > 0) {
              const hasP = members.some(m => m.name === pName);
              setPresidentSelectMode(hasP ? 'select' : 'manual');
              const hasS = members.some(m => m.name === sName);
              setSecretarySelectMode(hasS ? 'select' : 'manual');
            }
          }
        } catch (err) {
          console.error('Failed to fetch MoM details:', err);
        }
      };
      fetchMomDetails();
    } else {
      // Clear for new
      setTitle('Board Meeting');
      setType('Board Meeting');
      // Generate meeting number dynamically if creating new
      setNumber(`BM/2026-27/0${Math.floor(Math.random() * 9) + 1}`);
      setDate(new Date().toISOString().split('T')[0]);
      setTime('03:00 PM');
      setVenue('Google Meet');
      setChairedBy('Rtr. Rishabh Guptha (President)');
      setRecordedBy('Rtr. Lathiesh Kumar (Secretary)');
      setLink('https://meet.google.com/abc-defg-hij');
      setAgenda(['Welcome Address', 'Confirmation of Previous MoM', 'Project Updates', 'Finance Update', 'New Proposals', 'Any Other Business']);
      setDiscussions([
        'The meeting was called to order by the President. All members were welcomed.',
        'Minutes of the previous board meeting were read and confirmed unanimously.',
        '',
        '',
        '',
        ''
      ]);
      setPresentIds([]);
      setAbsentIds([]);
      setGuests(['Rtr. Lathiesh Kumar', 'Rtr. Rishabh Guptha']);
      setActionItems([
        { id: 'ACT-1', task: 'Send blood drive certificates', assigned_to_id: '', assigned_to_name: 'Rtr. Lathiesh Kumar', due_date: '2026-07-15', status: 'Pending' }
      ]);
      setPresidentName('Rtr. Rishabh Guptha');
      setSecretaryName('Rtr. Lathiesh Kumar');
      setExcludedAgendaIndices([]);
      setMomPictures([]);
      setMoneyInvolved({ has_money: false, amount: 0, description: '', type: 'Expense' });
      
      if (members.length > 0) {
        const hasP = members.some(m => m.name === 'Rtr. Rishabh Guptha');
        setPresidentSelectMode(hasP ? 'select' : 'manual');
        const hasS = members.some(m => m.name === 'Rtr. Lathiesh Kumar');
        setSecretarySelectMode(hasS ? 'select' : 'manual');
      }
    }
  }, [momId, members]);

  // Adjust discussions list if agenda size changes
  useEffect(() => {
    if (discussions.length < agenda.length) {
      const diff = agenda.length - discussions.length;
      const extra = Array(diff).fill('');
      setDiscussions([...discussions, ...extra]);
    }
  }, [agenda]);

  const handleAddAgenda = () => {
    setAgenda([...agenda, 'New Agenda Item']);
  };

  const handleUpdateAgendaItem = (index, value) => {
    const updated = [...agenda];
    updated[index] = value;
    setAgenda(updated);
  };

  const handleRemoveAgendaItem = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
    setDiscussions(discussions.filter((_, i) => i !== index));
  };

  const handleAddGuest = () => {
    if (newGuest.trim()) {
      setGuests([...guests, newGuest.trim()]);
      setNewGuest('');
    }
  };

  const handleRemoveGuest = (index) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMomPictures([...momPictures, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = (idx) => {
    setMomPictures(momPictures.filter((_, i) => i !== idx));
  };

  const handleAddActionItem = () => {
    if (newActionTask.trim() && newActionAssignee) {
      // Find assignee
      const member = members.find(m => m.id === newActionAssignee);
      const assigneeName = member ? member.name : newActionAssignee;
      const newItem = {
        id: `ACT-${actionItems.length + 1}`,
        task: newActionTask.trim(),
        assigned_to_id: newActionAssignee,
        assigned_to_name: assigneeName,
        due_date: newActionDueDate || new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      setActionItems([...actionItems, newItem]);
      setNewActionTask('');
      setNewActionAssignee('');
      setNewActionDueDate('');
    }
  };

  const handleRemoveActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const saveMoM = async (finalStatus) => {
    setIsSaving(true);
    setSaveMessage('Generating PDF copy & synchronizing with Drive...');
    
    // Generate PDF client side if option is active
    let pdfBase64 = '';
    if (uploadToDrive) {
      try {
        const element = document.getElementById('mom-preview-document');
        const opt = {
          margin:       8,
          filename:     `MoM_${number.replace(/[\/\s]/g, '_')}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        const pdfDataUri = await html2pdf().set(opt).from(element).outputPdf('datauristring');
        pdfBase64 = pdfDataUri.split(',')[1];
      } catch (pdfErr) {
        console.error('Failed to generate PDF client-side:', pdfErr);
      }
    }
    
    const payload = {
      title,
      type,
      number,
      date,
      time,
      venue,
      chaired_by: chairedBy,
      recorded_by: recordedBy,
      link,
      attendance: {
        present_ids: presentIds,
        absent_ids: absentIds,
        guests
      },
      agenda,
      discussions,
      action_items: actionItems,
      status: finalStatus,
      president_name: presidentName,
      secretary_name: secretaryName,
      money_involved: {
        ...moneyInvolved,
        excluded_agenda_indices: excludedAgendaIndices,
        pictures: momPictures
      },
      pdf_base64: pdfBase64
    };

    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const method = momId ? 'PUT' : 'POST';
      const endpoint = momId ? `${apiBase}/api/moms/${momId}` : `${apiBase}/api/moms`;
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSaveMessage(finalStatus === 'Draft' ? 'MoM draft saved successfully!' : 'MoM submitted and saved to Drive folder!');
        if (clearEditMomId) clearEditMomId();
        setTimeout(() => {
          setSaveMessage('');
          if (onTabChange) onTabChange('secretary_mom_records');
        }, 2000);
      } else {
        setSaveMessage('Failed to save Minutes of Meeting.');
      }
    } catch (err) {
      setSaveMessage('Connection error: Failed to save to database.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('mom-preview-document').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Minutes of Meeting - ${number}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #334155; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="max-w-4xl mx-auto border border-slate-200 p-8 rounded-xl bg-white shadow-sm">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleWordExport = () => {
    const htmlContent = document.getElementById('mom-preview-document').innerHTML;
    const docHeader = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>Minutes of Meeting</title><style>
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
      h1, h2, h3 { color: #8B003A; }
    </style></head><body>`;
    const docFooter = "</body></html>";
    const fullDoc = docHeader + htmlContent + docFooter;
    
    const blob = new Blob(['\ufeff' + fullDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoM_${number.replace(/[\/\s]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToList = () => {
    if (clearEditMomId) clearEditMomId();
    if (onTabChange) onTabChange('secretary_mom_records');
  };

  return html`
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">Minutes of Meeting Generator</h2>
          <p class="text-sm text-slate-400">Secretary Admin > Minutes of Meeting > ${momId ? 'Edit MoM' : 'Generate MoM'}</p>
        </div>
        <button onClick=${handleBackToList} class="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
          ⬅ Back to Records List
        </button>
      </div>

      <!-- Tab Pill Navigation -->
      <div class="flex border-b border-slate-200">
        ${[
          { id: 'details', label: type === 'Project Report' ? '📋 Report Details' : '📅 Meeting Details' },
          { id: 'attendance', label: '👥 Attendance' },
          { id: 'discussions', label: type === 'Project Report' ? '💬 Agenda & Activities' : '💬 Agenda & Discussion' },
          { id: 'actions', label: '📋 Action Items' },
          { id: 'preview', label: '📥 Preview & Save' }
        ].map(t => html`
          <button onClick=${() => setActiveTab(t.id)} class="px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === t.id ? 'border-burgundy-500 text-burgundy-500' : 'border-transparent text-slate-500 hover:text-slate-800'
          }">${t.label}</button>
        `)}
      </div>

      <!-- Two-Column Generator + Live Preview Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Active Form wizard tab -->
        <div class="lg:col-span-7 bg-white p-6 border border-slate-200/60 rounded-2xl shadow-premium text-left space-y-6">
          
          ${activeTab === 'details' && html`
            <div class="space-y-4">
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">${type === 'Project Report' ? 'Report Details' : 'Meeting Details'}</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">${type === 'Project Report' ? 'Project Title *' : 'Meeting Title *'}</label>
                  <input type="text" value=${title} onInput=${(e) => setTitle(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">${type === 'Project Report' ? 'Report Type *' : 'Meeting Type *'}</label>
                  <select value=${type} onChange=${(e) => setType(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500">
                    <option value="Board Meeting">Board Meeting</option>
                    <option value="General Body Meeting">General Body Meeting</option>
                    <option value="Committee Meeting">Committee Meeting</option>
                    <option value="Emergency Meeting">Emergency Meeting</option>
                    <option value="Project Report">Project Report</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">${type === 'Project Report' ? 'Reference Number *' : 'Meeting Number *'}</label>
                  <input type="text" value=${number} onInput=${(e) => setNumber(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Date *</label>
                  <input type="date" value=${date} onInput=${(e) => setDate(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Time *</label>
                  <input type="text" value=${time} onInput=${(e) => setTime(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="e.g. 03:00 PM" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">${type === 'Project Report' ? 'Project Venue *' : 'Meeting Venue / Platform *'}</label>
                  <input type="text" value=${venue} onInput=${(e) => setVenue(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">${type === 'Project Report' ? 'Project Chairman / Lead *' : 'Chaired By (Role) *'}</label>
                  <input type="text" value=${chairedBy} onInput=${(e) => setChairedBy(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">${type === 'Project Report' ? 'Report Compiled By *' : 'Recorded By (Role) *'}</label>
                  <input type="text" value=${recordedBy} onInput=${(e) => setRecordedBy(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">President Name (Signatory) *</label>
                  <select value=${presidentSelectMode === 'manual' ? 'custom' : presidentName} 
                          onChange=${(e) => {
                            if (e.target.value === 'custom') {
                              setPresidentSelectMode('manual');
                            } else {
                              setPresidentSelectMode('select');
                              setPresidentName(e.target.value);
                            }
                          }} 
                          class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 mb-2">
                    <option value="">-- Select President --</option>
                    ${members.map(m => html`<option value=${m.name}>${m.name} (${m.position})</option>`)}
                    <option value="custom">✍️ Type custom name manually...</option>
                  </select>
                  ${presidentSelectMode === 'manual' && html`
                    <input type="text" value=${presidentName} onInput=${(e) => setPresidentName(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="Type president name" required />
                  `}
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Secretary Name (Signatory) *</label>
                  <select value=${secretarySelectMode === 'manual' ? 'custom' : secretaryName} 
                          onChange=${(e) => {
                            if (e.target.value === 'custom') {
                              setSecretarySelectMode('manual');
                            } else {
                              setSecretarySelectMode('select');
                              setSecretaryName(e.target.value);
                            }
                          }} 
                          class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500 mb-2">
                    <option value="">-- Select Secretary --</option>
                    ${members.map(m => html`<option value=${m.name}>${m.name} (${m.position})</option>`)}
                    <option value="custom">✍️ Type custom name manually...</option>
                  </select>
                  ${secretarySelectMode === 'manual' && html`
                    <input type="text" value=${secretaryName} onInput=${(e) => setSecretaryName(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="Type secretary name" required />
                  `}
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Meeting Link (if online)</label>
                <input type="text" value=${link} onInput=${(e) => setLink(e.target.value)} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="https://meet.google.com/abc-defg-hij" />
              </div>

              <!-- Money Involved block -->
              <div class="pt-4 border-t border-slate-100 space-y-3">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked=${moneyInvolved.has_money} onChange=${(e) => setMoneyInvolved({...moneyInvolved, has_money: e.target.checked})} class="rounded text-burgundy-500 focus:ring-burgundy-500/20 w-4 h-4" />
                  <span class="text-xs font-bold text-slate-700 uppercase">💰 Money / Finance Involved in this MoM</span>
                </label>
                
                ${moneyInvolved.has_money && html`
                  <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-500 mb-1">Amount (Rs) *</label>
                      <input type="number" value=${moneyInvolved.amount} onInput=${(e) => setMoneyInvolved({...moneyInvolved, amount: parseFloat(e.target.value) || 0})} class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" required />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-500 mb-1">Transaction Type *</label>
                      <select value=${moneyInvolved.type} onChange=${(e) => setMoneyInvolved({...moneyInvolved, type: e.target.value})} class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs">
                        <option value="Expense">Expense / Payment</option>
                        <option value="Income">Income / Collection</option>
                        <option value="Budget Allocation">Budget Allocation</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-500 mb-1">Purpose / Remarks *</label>
                      <input type="text" value=${moneyInvolved.description} onInput=${(e) => setMoneyInvolved({...moneyInvolved, description: e.target.value})} class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" placeholder="e.g. Approved food budget" required />
                    </div>
                  </div>
                `}
              </div>

              <!-- Agenda list builder -->
              <div class="space-y-3 pt-4 border-t border-slate-100">
                <div class="flex justify-between items-center">
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Agenda Items</h4>
                  <button onClick=${handleAddAgenda} class="px-3 py-1 bg-burgundy-500 text-white rounded-lg text-xs font-bold hover:bg-burgundy-600 transition-colors">
                    + Add Agenda Item
                  </button>
                </div>
                
                <div class="space-y-2">
                  ${agenda.map((item, idx) => {
                    const isExcluded = excludedAgendaIndices.includes(idx);
                    return html`
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-400 w-6">${idx + 1}.</span>
                        <input type="text" value=${item} onInput=${(e) => handleUpdateAgendaItem(idx, e.target.value)} class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-burgundy-500" />
                        <label class="flex items-center gap-1.5 cursor-pointer select-none border border-slate-150 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-600">
                          <input type="checkbox" checked=${!isExcluded} onChange=${(e) => {
                            if (e.target.checked) {
                              setExcludedAgendaIndices(excludedAgendaIndices.filter(i => i !== idx));
                            } else {
                              setExcludedAgendaIndices([...excludedAgendaIndices, idx]);
                            }
                          }} class="rounded text-burgundy-500 focus:ring-burgundy-500/20 w-3 h-3" />
                          <span>Show in MoM</span>
                        </label>
                        <button onClick=${() => handleRemoveAgendaItem(idx)} class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          ✕
                        </button>
                      </div>
                    `;
                  })}
                </div>
              </div>
              <!-- Meeting Pictures block -->
              <div class="pt-4 border-t border-slate-100 space-y-3">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">📸 Meeting Pictures</label>
                <div class="flex gap-4 items-center">
                  <label class="cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors">
                    <span>📤 Upload Picture</span>
                    <input type="file" accept="image/*" onChange=${handlePictureUpload} class="hidden" />
                  </label>
                  <p class="text-[10px] text-slate-400">Add photos of the meeting to embed inside the MoM document.</p>
                </div>
                
                ${momPictures && momPictures.length > 0 && html`
                  <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    ${momPictures.map((pic, idx) => html`
                      <div class="relative group border border-slate-150 rounded-xl overflow-hidden bg-slate-50/30 h-20 shadow-sm">
                        <img src=${pic} class="w-full h-full object-cover" />
                        <button onClick=${() => handleRemovePicture(idx)} class="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full text-[10px] hover:bg-rose-600 transition-colors shadow">
                          ✕
                        </button>
                      </div>
                    `)}
                  </div>
                `}
              </div>

            </div>
          `}

          ${activeTab === 'attendance' && html`
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Present Members Checklist</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                  ${members.map(m => {
                    const isPresent = presentIds.includes(m.id);
                    return html`
                      <label class="flex items-center gap-2.5 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl cursor-pointer text-xs font-semibold select-none">
                        <input type="checkbox" checked=${isPresent} onChange=${(e) => {
                          if (e.target.checked) {
                            setPresentIds([...presentIds, m.id]);
                            setAbsentIds(absentIds.filter(id => id !== m.id));
                          } else {
                            setPresentIds(presentIds.filter(id => id !== m.id));
                            setAbsentIds([...absentIds, m.id]);
                          }
                        }} class="rounded text-burgundy-500 focus:ring-burgundy-500/20" />
                        <span>${m.name}</span>
                      </label>
                    `;
                  })}
                </div>
              </div>

              <div>
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Guests & Visitors</h3>
                <div class="flex gap-2 mb-3">
                  <input type="text" value=${newGuest} onInput=${(e) => setNewGuest(e.target.value)} class="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-burgundy-500" placeholder="Enter guest or visitor name" />
                  <button type="button" onClick=${handleAddGuest} class="px-4 py-2 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 transition-all">Add Guest</button>
                </div>
                
                <div class="flex flex-wrap gap-2">
                  ${guests.map((g, idx) => html`
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-burgundy-50 border border-burgundy-100/50 text-burgundy-700 rounded-full text-xs font-semibold">
                      ${g}
                      <button type="button" onClick=${() => handleRemoveGuest(idx)} class="text-burgundy-400 hover:text-burgundy-700 font-bold">&times;</button>
                    </span>
                  `)}
                  ${guests.length === 0 && html`<p class="text-xs text-slate-400 italic">No guests added yet.</p>`}
                </div>
              </div>
            </div>
          `}

          ${activeTab === 'discussions' && html`
            <div class="space-y-5">
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Agenda Discussions Summary</h3>
              
              <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                ${agenda.map((item, idx) => html`
                  <div class="space-y-1.5">
                    <label class="block text-xs font-extrabold text-slate-600 uppercase tracking-wide">${idx + 1}. ${item}</label>
                    <textarea value=${discussions[idx] || ''} onInput=${(e) => {
                      const updated = [...discussions];
                      updated[idx] = e.target.value;
                      setDiscussions(updated);
                    }} class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-burgundy-500 min-h-[60px]" placeholder="Summary of discussion points, remarks and conclusions..."></textarea>
                  </div>
                `)}
              </div>
            </div>
          `}

          ${activeTab === 'actions' && html`
            <div class="space-y-5">
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Assign Action Items</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Task / Action Item</label>
                  <input type="text" value=${newActionTask} onInput=${(e) => setNewActionTask(e.target.value)} class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none" placeholder="e.g. Draft newsletters" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Assign To Member</label>
                  <select value=${newActionAssignee} onChange=${(e) => setNewActionAssignee(e.target.value)} class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none">
                    <option value="">-- Select Member --</option>
                    ${members.map(m => html`<option value=${m.id}>${m.name} (${m.position})</option>`)}
                  </select>
                </div>
                <div class="flex items-end gap-2">
                  <div class="flex-1">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Due Date</label>
                    <input type="date" value=${newActionDueDate} onInput=${(e) => setNewActionDueDate(e.target.value)} class="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none" />
                  </div>
                  <button type="button" onClick=${handleAddActionItem} class="px-4 py-1.5 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-lg text-xs font-bold transition-all shrink-0">Add</button>
                </div>
              </div>

              <div class="pt-4">
                <table class="w-full border-collapse text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="p-3 font-semibold text-slate-600 border-b border-slate-150">Task</th>
                      <th class="p-3 font-semibold text-slate-600 border-b border-slate-150">Assignee</th>
                      <th class="p-3 font-semibold text-slate-600 border-b border-slate-150">Due Date</th>
                      <th class="p-3 font-semibold text-slate-600 border-b border-slate-150 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${actionItems.map((item, idx) => html`
                      <tr class="hover:bg-slate-50/50">
                        <td class="p-3 border-b border-slate-100 font-medium text-slate-800">${item.task}</td>
                        <td class="p-3 border-b border-slate-100 text-slate-600">${item.assigned_to_name}</td>
                        <td class="p-3 border-b border-slate-100 text-slate-500">${item.due_date}</td>
                        <td class="p-3 border-b border-slate-100 text-center">
                          <button onClick=${() => handleRemoveActionItem(idx)} class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
                        </td>
                      </tr>
                    `)}
                    ${actionItems.length === 0 && html`
                      <tr>
                        <td colspan="4" class="p-4 text-center text-slate-400 italic">No action items assigned yet.</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>
          `}

          ${activeTab === 'preview' && html`
            <div class="space-y-6">
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Save MoM Document</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Review your formatted Minutes of Meeting document on the right. Below you can customize exports or trigger instant Google Drive synchronization.
              </p>
              
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label class="flex items-center gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked=${uploadToDrive} onChange=${(e) => setUploadToDrive(e.target.checked)} class="rounded text-burgundy-500 focus:ring-burgundy-500/20 w-4 h-4" />
                  <span class="text-xs font-bold text-slate-700 uppercase">☁️ Automatically Upload PDF to Google Drive Folder</span>
                </label>
                <p class="text-[10px] text-slate-400 pl-6">When saved, a PDF copy is compiled client-side and saved into your shared "Rotaract Warriors MoM Records" drive folder.</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <button onClick=${handlePrint} class="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all">
                  🖨️ PDF / Print Document
                </button>
                <button onClick=${handleWordExport} class="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all">
                  📝 Word Document (.doc)
                </button>
              </div>

              <div class="pt-4 space-y-3">
                ${saveMessage && html`<div class="p-3.5 bg-emerald-55 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-xl text-center animate-pulse">${saveMessage}</div>`}
                <div class="flex gap-4">
                  <button onClick=${() => saveMoM('Draft')} disabled=${isSaving} class="flex-1 py-3 border border-burgundy-500 text-burgundy-500 hover:bg-burgundy-50 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                    💾 Save as Draft
                  </button>
                  <button onClick=${() => saveMoM('Approved')} disabled=${isSaving} class="flex-1 py-3 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm">
                    🚀 Save & Upload MoM
                  </button>
                </div>
              </div>
            </div>
          `}
        </div>

        <!-- Right: Styled Live Preview card -->
        <div class="lg:col-span-5 flex flex-col">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Live Preview</h3>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-md text-[10px] font-bold">
              ● Ready
            </span>
          </div>

          <!-- Document Page container -->
          <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium max-h-[650px] overflow-y-auto custom-scrollbar flex-1">
            <div id="mom-preview-document" class="space-y-6 text-left text-xs text-slate-700 p-4 relative overflow-hidden bg-white min-h-[842px]">
              
              <!-- Nautical Background Watermark (Anchor) -->
              <div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); opacity: 0.025; pointer-events: none; z-index: 0;">
                <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#0077b6" stroke-width="1.2">
                  <circle cx="12" cy="5" r="2.5" />
                  <line x1="12" y1="7.5" x2="12" y2="21" />
                  <line x1="8.5" y1="11" x2="15.5" y2="11" />
                  <path d="M5 12.5a7 7 0 0 0 14 0" />
                  <path d="M5 12.5l-2-1M19 12.5l2-1" />
                </svg>
              </div>

              <!-- Top Nautical Waves Header Banner -->
              <div class="w-full overflow-hidden leading-none -mt-4 -mx-4 mb-4 select-none">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="relative block w-full h-[28px]" style="transform: rotate(180deg);">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#0077b6" opacity="0.85"></path>
                  <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#dfb26f" opacity="0.25"></path>
                  <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#0096c7" opacity="0.45"></path>
                </svg>
              </div>

              <!-- Letterhead Header with center alignment in maroon -->
              <div class="relative z-10 text-center pb-2">
                <div class="text-xs font-black text-[#8B003A] tracking-wider uppercase font-display">Rotaract Club of Bangalore Warriors</div>
                <div class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">RI DISTRICT 3192 • CLUB ID: 8825975</div>
                <div class="text-[8px] font-bold text-slate-500 mt-0.5">CLUB EMAIL: racwarriors2023@gmail.com</div>
              </div>

              <!-- Shoreline Sand-to-Sea Gradient separator line -->
              <div class="w-full h-[3px] rounded-full z-10 relative" style="background: linear-gradient(90deg, #dfb26f 0%, #f3d299 35%, #00b4d8 65%, #0077b6 100%);"></div>

              <!-- Title -->
              <div class="text-center space-y-1 pt-1.5 z-10 relative">
                <h2 class="text-xs font-extrabold text-[#8B003A] uppercase tracking-widest">
                  ${type === 'Project Report' ? 'PROJECT REPORT' : 'MOM (Minutes of Meeting)'}
                </h2>
                <p class="text-[10px] text-slate-500 font-bold">${title} • Ref: ${number}</p>
              </div>

              <!-- Details Metadata Table -->
              <table class="w-full border-collapse text-[9.5px] border border-slate-200 rounded-lg overflow-hidden shadow-sm z-10 relative bg-white/90">
                <tbody>
                  <tr class="bg-slate-50/50">
                    <td class="p-2 border border-slate-200 font-bold text-slate-650 w-24">${type === 'Project Report' ? 'Project Title' : 'Meeting Title'}</td>
                    <td class="p-2 border border-slate-200 text-slate-800 font-semibold">${title}</td>
                  </tr>
                  <tr>
                    <td class="p-2 border border-slate-200 font-bold text-slate-650">${type === 'Project Report' ? 'Report Type' : 'Meeting Type'}</td>
                    <td class="p-2 border border-slate-200 text-slate-700 font-medium">${type}</td>
                  </tr>
                  <tr class="bg-slate-50/50">
                    <td class="p-2 border border-slate-200 font-bold text-slate-650">${type === 'Project Report' ? 'Reference Number' : 'Meeting Number'}</td>
                    <td class="p-2 border border-slate-200 text-slate-700 font-medium">${number}</td>
                  </tr>
                  <tr>
                    <td class="p-2 border border-slate-200 font-bold text-slate-650">Date & Time</td>
                    <td class="p-2 border border-slate-200 text-slate-700 font-medium">${date} at ${time}</td>
                  </tr>
                  <tr class="bg-slate-50/50">
                    <td class="p-2 border border-slate-200 font-bold text-slate-650">${type === 'Project Report' ? 'Project Venue' : 'Venue / Platform'}</td>
                    <td class="p-2 border border-slate-200 text-slate-750 font-medium">
                      ${venue} ${link && html`(<a href=${link} target="_blank" class="text-burgundy-500 underline">${link}</a>)`}
                    </td>
                  </tr>
                  <tr>
                    <td class="p-2 border border-slate-200 font-bold text-slate-650">${type === 'Project Report' ? 'Chaired / Led By' : 'Chaired By'}</td>
                    <td class="p-2 border border-slate-200 text-slate-700 font-medium">${chairedBy}</td>
                  </tr>
                  <tr class="bg-slate-50/50">
                    <td class="p-2 border border-slate-200 font-bold text-slate-650">${type === 'Project Report' ? 'Report Compiled By' : 'Recorded By'}</td>
                    <td class="p-2 border border-slate-200 text-slate-700 font-medium">${recordedBy}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Financial decisions highlight if active -->
              ${moneyInvolved.has_money && html`
                <div class="p-3.5 bg-burgundy-50/30 border-l-4 border-burgundy-500 rounded-r-xl space-y-1 shadow-sm z-10 relative">
                  <div class="flex items-center gap-1.5 text-burgundy-650 font-extrabold text-[10px] uppercase tracking-wider">
                    <span>💰</span> Financial Decisions & Transactions
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-[9.5px]">
                    <div>
                      <span class="font-bold text-slate-500">Transaction Type:</span>
                      <span class="ml-1 inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        moneyInvolved.type === 'Income'
                          ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                          : moneyInvolved.type === 'Expense'
                          ? 'bg-rose-50 border-rose-150 text-rose-700'
                          : 'bg-blue-50 border-blue-150 text-blue-700'
                      }">${moneyInvolved.type}</span>
                    </div>
                    <div>
                      <span class="font-bold text-slate-500">Amount:</span>
                      <span class="ml-1.5 font-bold text-slate-800">Rs. ${moneyInvolved.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div class="text-[9.5px] text-slate-600 pt-0.5 border-t border-burgundy-100/50 mt-1">
                    <span class="font-bold text-slate-500">Financial Remarks:</span> ${moneyInvolved.description}
                  </div>
                </div>
              `}

              <!-- Agenda list section (filtered) -->
              <div class="space-y-1.5 z-10 relative">
                <h3 class="text-[10px] font-extrabold text-burgundy-600 uppercase border-b border-burgundy-100 pb-1 tracking-wide flex items-center gap-1.5">
                  <span>⚓</span> ${type === 'Project Report' ? 'Project Agenda / Phases' : 'Agenda'}
                </h3>
                <ol class="list-decimal pl-4 space-y-1 font-semibold text-slate-750">
                  ${agenda.map((item, idx) => !excludedAgendaIndices.includes(idx) && html`<li>${item}</li>`)}
                </ol>
              </div>

              <!-- Discussions summary section (filtered) -->
              <div class="space-y-3 z-10 relative">
                <h3 class="text-[10px] font-extrabold text-burgundy-600 uppercase border-b border-burgundy-100 pb-1 tracking-wide flex items-center gap-1.5">
                  <span>💬</span> ${type === 'Project Report' ? 'Project Discussion / Activity Summary' : 'Discussion Summary'}
                </h3>
                <div class="space-y-2.5">
                  ${agenda.map((item, idx) => !excludedAgendaIndices.includes(idx) && html`
                    <div class="space-y-0.5">
                      <div class="font-bold text-slate-800 text-[10px]">${idx + 1}. ${item}</div>
                      <p class="text-slate-550 pl-3 border-l-2 border-slate-200 italic leading-relaxed text-[9.5px]">
                        ${discussions[idx] || 'No summary recorded.'}
                      </p>
                    </div>
                  `)}
                </div>
              </div>

              <!-- Attendance summary section -->
              <div class="space-y-1.5 z-10 relative">
                <h3 class="text-[10px] font-extrabold text-burgundy-600 uppercase border-b border-burgundy-100 pb-1 tracking-wide">${type === 'Project Report' ? 'Volunteers & Attendees Summary' : 'Attendance Summary'}</h3>
                <div class="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div>
                    <span class="font-bold text-slate-500">${type === 'Project Report' ? 'Present Volunteers: ' : 'Present Members: '}</span>
                    <span class="text-slate-800 font-bold">${presentIds.length}</span>
                  </div>
                  <div>
                    <span class="font-bold text-slate-500">${type === 'Project Report' ? 'Absent Volunteers: ' : 'Absent Members: '}</span>
                    <span class="text-slate-800 font-bold">${absentIds.length}</span>
                  </div>
                </div>
                ${guests.length > 0 && html`
                  <div class="text-[9.5px] mt-1">
                    <span class="font-bold text-slate-555">Guests / Visitors: </span>
                    <span class="text-slate-750">${guests.join(', ')}</span>
                  </div>
                `}
              </div>

              <!-- Action items table section -->
              <div class="space-y-1.5 z-10 relative">
                <h3 class="text-[10px] font-extrabold text-burgundy-600 uppercase border-b border-burgundy-100 pb-1 tracking-wide">Action Items</h3>
                <table class="w-full border-collapse border border-slate-200 text-[9.5px] shadow-sm rounded-lg overflow-hidden bg-white/95">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="p-2 border border-slate-200 text-slate-600 font-bold">Task</th>
                      <th class="p-2 border border-slate-200 text-slate-600 font-bold">Assigned To</th>
                      <th class="p-2 border border-slate-200 text-slate-600 font-bold">Due Date</th>
                      <th class="p-2 border border-slate-200 text-slate-600 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${actionItems.map(item => html`
                      <tr>
                        <td class="p-2 border border-slate-200 font-semibold text-slate-800">${item.task}</td>
                        <td class="p-2 border border-slate-200 text-slate-700 font-medium">${item.assigned_to_name}</td>
                        <td class="p-2 border border-slate-200 text-slate-550">${item.due_date}</td>
                        <td class="p-2 border border-slate-200 text-center font-extrabold text-amber-600 uppercase text-[8px]">${item.status}</td>
                      </tr>
                    `)}
                    ${actionItems.length === 0 && html`
                      <tr>
                        <td colspan="4" class="p-2 text-center text-slate-400 italic">No action items assigned.</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>

              <!-- Meeting Pictures preview section -->
              ${momPictures && momPictures.length > 0 && html`
                <div class="space-y-1.5 z-10 relative">
                  <h3 class="text-[10px] font-extrabold text-[#8B003A] uppercase border-b border-burgundy-100 pb-1 tracking-wide">📸 ${type === 'Project Report' ? 'Project Gallery' : 'Meeting Gallery'}</h3>
                  <div class="grid grid-cols-2 gap-3 pt-1">
                    ${momPictures.map(pic => html`
                      <div class="border border-slate-200 rounded-lg overflow-hidden h-36 bg-slate-50/50 shadow-sm flex items-center justify-center p-1.5">
                        <img src=${pic} class="max-w-full max-h-full object-contain rounded-md" />
                      </div>
                    `)}
                  </div>
                </div>
              `}

              <!-- Digital signature and verification certificate -->
              <div class="p-3.5 bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl space-y-1.5 text-center z-10 relative">
                <div class="text-[9.5px] font-extrabold text-emerald-700 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  🛡️ Digital Verification Certificate
                </div>
                <p class="text-[8.5px] text-slate-450 leading-relaxed max-w-sm mx-auto">
                  This document has been digitally compiled, verified and archived securely by the Rotaract Bangalore Warriors Portal. No physical signature is required.
                </p>
                <div class="grid grid-cols-2 gap-4 text-[9px] border-t border-slate-100 pt-1.5 font-bold text-slate-600">
                  <div>
                    <div class="text-[7px] uppercase text-slate-400 font-bold">President Signatory</div>
                    <div class="mt-0.5 text-slate-800">${presidentName}</div>
                  </div>
                  <div>
                    <div class="text-[7px] uppercase text-slate-400 font-bold">Secretary Signatory</div>
                    <div class="mt-0.5 text-slate-800">${secretaryName}</div>
                  </div>
                </div>
                <div class="text-[8px] text-slate-400 border-t border-slate-100 pt-1 mt-1 flex justify-between px-2 font-medium">
                  <span>Generated: ${new Date().toLocaleString()}</span>
                  <span>Website Admin Portal</span>
                </div>
              </div>

              <!-- Bottom waves graphic to match header -->
              <div class="w-full overflow-hidden leading-none -mx-4 -mb-4 mt-4 select-none">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="relative block w-full h-[24px]">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#0077b6" opacity="0.85"></path>
                  <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#dfb26f" opacity="0.25"></path>
                </svg>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// HTML Generator helper for exporting saved MoM records to PDF or Word
function getMomDocumentHtml(mom) {
  const presentCount = mom.attendance?.present_ids?.length || 0;
  const absentCount = mom.attendance?.absent_ids?.length || 0;
  const guestsList = mom.attendance?.guests || [];
  const moneyObj = mom.money_involved || { has_money: false, amount: 0, description: '', type: 'Expense' };
  const excludedIndices = moneyObj.excluded_agenda_indices || [];
  const picturesList = moneyObj.pictures || [];
  
  const displayAgenda = (mom.agenda || []).filter((_, idx) => !excludedIndices.includes(idx));
  const discussionsHtml = (mom.agenda || []).map((item, idx) => {
    if (excludedIndices.includes(idx)) return '';
    return `
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #1e293b; font-size: 10px;">${idx + 1}. ${item}</div>
        <p style="color: #475569; margin: 2px 0 0 12px; border-left: 2px solid #cbd5e1; padding-left: 8px; font-style: italic; font-size: 9.5px;">
          ${mom.discussions?.[idx] || 'No summary recorded.'}
        </p>
      </div>
    `;
  }).join('');

  const actionItemsHtml = (mom.action_items || []).map(item => `
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: 600; color: #1e293b;">${item.task}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; color: #334155;">${item.assigned_to_name}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; color: #64748b;">${item.due_date}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: 800; color: #d97706; text-transform: uppercase; font-size: 8px;">${item.status}</td>
    </tr>
  `).join('');

  const picturesHtml = picturesList.length > 0 ? `
    <div style="margin-top: 14px; page-break-inside: avoid;">
      <h3 style="font-size: 10.5px; font-weight: 800; color: #8B003A; border-b: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; margin-bottom: 8px;">📸 Meeting Gallery</h3>
      <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <tr>
          ${picturesList.map((pic, idx) => `
            <td style="width: 50%; padding: 6px; text-align: center; vertical-align: middle;">
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; padding: 6px; background-color: #f8fafc; text-align: center; display: block;">
                <img src="${pic}" style="max-width: 100%; max-height: 180px; width: auto; height: auto; display: inline-block; vertical-align: middle; border-radius: 4px;" />
              </div>
            </td>
            ${(idx + 1) % 2 === 0 && idx < picturesList.length - 1 ? '</tr><tr>' : ''}
          `).join('')}
          ${picturesList.length % 2 !== 0 ? '<td style="width: 50%;"></td>' : ''}
        </tr>
      </table>
    </div>
  ` : '';

  return `
    <div style="font-family: 'Inter', sans-serif; color: #334155; padding: 16px; position: relative; overflow: hidden; background: white; min-height: 800px; text-align: left;">
      <!-- Watermark -->
      <div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); opacity: 0.025; pointer-events: none; z-index: 0;">
        <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#0077b6" stroke-width="1.2">
          <circle cx="12" cy="5" r="2.5" />
          <line x1="12" y1="7.5" x2="12" y2="21" />
          <line x1="8.5" y1="11" x2="15.5" y2="11" />
          <path d="M5 12.5a7 7 0 0 0 14 0" />
        </svg>
      </div>

      <!-- Waves Header -->
      <div style="margin: -16px -16px 16px -16px; overflow: hidden; line-height: 0;">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="display: block; width: 100%; height: 28px; transform: rotate(180deg);">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#0077b6" opacity="0.85"></path>
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#dfb26f" opacity="0.25"></path>
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#0096c7" opacity="0.45"></path>
        </svg>
      </div>

      <!-- Letterhead Header -->
      <div style="text-align: center; margin-bottom: 8px; position: relative; z-index: 10;">
        <div style="font-weight: 900; color: #8B003A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Rotaract Club of Bangalore Warriors</div>
        <div style="font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-top: 2px;">RI DISTRICT 3192 &bull; CLUB ID: 8825975</div>
        <div style="font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px;">CLUB EMAIL: racwarriors2023@gmail.com</div>
      </div>

      <!-- Shoreline border line -->
      <div style="width: 100%; height: 3px; border-radius: 3px; background: linear-gradient(90deg, #dfb26f 0%, #f3d299 35%, #00b4d8 65%, #0077b6 100%); margin-bottom: 10px; position: relative; z-index: 10;"></div>

      <!-- Title -->
      <div style="text-align: center; margin-bottom: 12px; position: relative; z-index: 10;">
        <h2 style="font-weight: 800; color: #8B003A; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; margin: 0 0 2px 0;">
          ${mom.type === 'Project Report' ? 'PROJECT REPORT' : 'MOM (Minutes of Meeting)'}
        </h2>
        <div style="font-weight: bold; color: #64748b; font-size: 9px;">${mom.title} &bull; Ref: ${mom.number}</div>
      </div>

      <!-- Metadata Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5px; border: 1px solid #e2e8f0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569; width: 30%;">${mom.type === 'Project Report' ? 'Project Title' : 'Meeting Title'}</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${mom.title}</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">${mom.type === 'Project Report' ? 'Report Type' : 'Meeting Type'}</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155;">${mom.type}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">${mom.type === 'Project Report' ? 'Reference Number' : 'Meeting Number'}</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155;">${mom.number}</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Date & Time</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155;">${mom.date} at ${mom.time}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">${mom.type === 'Project Report' ? 'Project Venue' : 'Venue / Platform'}</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155; font-weight: 500;">${mom.venue}</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">${mom.type === 'Project Report' ? 'Chaired / Led By' : 'Chaired By'}</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155;">${mom.chaired_by}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">${mom.type === 'Project Report' ? 'Report Compiled By' : 'Recorded By'}</td>
          <td style="padding: 6px; border: 1px solid #e2e8f0; color: #334155;">${mom.recorded_by}</td>
        </tr>
      </table>

      <!-- Financial decisions highlight if active -->
      ${moneyObj.has_money ? `
        <div style="padding: 10px; background-color: #fdf2f8; border-left: 4px solid #8b003a; border-radius: 0 8px 8px 0; margin-bottom: 14px; font-size: 9.5px;">
          <div style="font-weight: 800; color: #8b003a; text-transform: uppercase; font-size: 10px; margin-bottom: 4px;">💰 Financial Decisions & Transactions</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #64748b; font-weight: bold;">Transaction Type:</td>
              <td style="color: #8b003a; font-weight: bold; text-transform: uppercase;">${moneyObj.type}</td>
              <td style="color: #64748b; font-weight: bold; text-align: right;">Amount:</td>
              <td style="color: #1e293b; font-weight: bold; text-align: right;">Rs. ${moneyObj.amount.toLocaleString()}</td>
            </tr>
          </table>
          <div style="margin-top: 4px; color: #334155; border-top: 1px solid #fbcfe8; padding-top: 4px;">
            <span style="font-weight: bold; color: #64748b;">Purpose:</span> ${moneyObj.description}
          </div>
        </div>
      ` : ''}

      <!-- Agenda Section -->
      <div style="margin-bottom: 14px;">
        <h3 style="font-size: 10.5px; font-weight: 800; color: #8B003A; border-b: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; margin-bottom: 6px;">⚓ ${mom.type === 'Project Report' ? 'Project Agenda / Phases' : 'Agenda'}</h3>
        <ol style="margin: 0; padding-left: 20px; font-weight: 600; font-size: 9.5px; color: #1e293b;">
          ${displayAgenda.map(item => `<li>${item}</li>`).join('')}
        </ol>
      </div>

      <!-- Discussions Section -->
      <div style="margin-bottom: 14px;">
        <h3 style="font-size: 10.5px; font-weight: 800; color: #8B003A; border-b: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; margin-bottom: 6px;">💬 ${mom.type === 'Project Report' ? 'Project Discussion / Activity Summary' : 'Discussion Summary'}</h3>
        ${discussionsHtml}
      </div>

      <!-- Attendance Section -->
      <div style="margin-bottom: 14px; font-size: 9.5px;">
        <h3 style="font-size: 10.5px; font-weight: 800; color: #8B003A; border-b: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; margin-bottom: 6px;">${mom.type === 'Project Report' ? 'Volunteers & Attendees Summary' : 'Attendance Summary'}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
          <tr>
            <td style="color: #475569; font-weight: bold;">Present count: <span style="color: #1e293b; font-weight: 800;">${presentCount}</span></td>
            <td style="color: #475569; font-weight: bold;">Absent count: <span style="color: #1e293b; font-weight: 800;">${absentCount}</span></td>
          </tr>
        </table>
        ${guestsList.length > 0 ? `
          <div style="color: #334155;"><span style="font-weight: bold; color: #475569;">Guests / Visitors:</span> ${guestsList.join(', ')}</div>
        ` : ''}
      </div>

      <!-- Action Items Section -->
      ${(mom.action_items || []).length > 0 ? `
        <div style="margin-bottom: 14px;">
          <h3 style="font-size: 10.5px; font-weight: 800; color: #8B003A; border-b: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase; margin-bottom: 6px;">Action Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; color: #475569;">Task</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; color: #475569;">Assigned To</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; color: #475569;">Due Date</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #475569;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${actionItemsHtml}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${picturesHtml}

      <!-- Verification Certificate -->
      <div style="padding: 12px; background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; text-align: center; margin-top: 20px; font-size: 9px; page-break-inside: avoid;">
        <div style="font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 4px;">🛡️ Digital Verification Certificate</div>
        <p style="color: #64748b; margin: 0 0 8px 0; font-size: 8.5px; line-height: 1.3;">
          This document has been digitally compiled, verified and archived securely by the Rotaract Bangalore Warriors Portal. No physical signature is required.
        </p>
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
          <tr>
            <td style="width: 50%; text-align: center; padding-top: 4px;">
              <div style="font-size: 7.5px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">President Signatory</div>
              <div style="font-weight: bold; color: #334155; margin-top: 2px;">${mom.president_name || 'Rtr. Rishabh Guptha'}</div>
            </td>
            <td style="width: 50%; text-align: center; padding-top: 4px; border-left: 1px solid #e2e8f0;">
              <div style="font-size: 7.5px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Secretary Signatory</div>
              <div style="font-weight: bold; color: #334155; margin-top: 2px;">${mom.secretary_name || 'Rtr. Lathiesh Kumar'}</div>
            </td>
          </tr>
        </table>
        <div style="font-size: 7.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 8px; display: flex; justify-content: space-between; font-weight: 500;">
          <span>Generated: ${new Date().toLocaleString()}</span>
          <span>Website Admin Portal</span>
        </div>
      </div>

      <!-- Waves Footer -->
      <div style="margin: 16px -16px -16px -16px; overflow: hidden; line-height: 0; page-break-inside: avoid;">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="display: block; width: 100%; height: 24px;">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#0077b6" opacity="0.85"></path>
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#dfb26f" opacity="0.25"></path>
        </svg>
      </div>
    </div>
  `;
}

// 11. MOM RECORDS LIST COMPONENT
function MoMRecords({ onEdit, onTabChange }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/moms`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch MoM records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this Minutes of Meeting record from the cloud?')) {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const res = await fetch(`${apiBase}/api/moms/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchRecords();
        } else {
          alert('Failed to delete MoM from server.');
        }
      } catch (err) {
        alert('Connection error: Failed to connect to server.');
      }
    }
  };

  const downloadPdfDirectly = async (mom) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = getMomDocumentHtml(mom);
    document.body.appendChild(tempDiv);
    
    try {
      const opt = {
        margin:       8,
        filename:     `MoM_${mom.number.replace(/[\/\s]/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(tempDiv).save();
    } catch (err) {
      console.error('Failed to export PDF client-side:', err);
      alert('Error: Failed to compile PDF document.');
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const downloadWordDirectly = (mom) => {
    const htmlContent = getMomDocumentHtml(mom);
    const docHeader = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>Minutes of Meeting</title><style>
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
      h1, h2, h3 { color: #8B003A; }
    </style></head><body>`;
    const docFooter = "</body></html>";
    const fullDoc = docHeader + htmlContent + docFooter;
    
    const blob = new Blob(['\ufeff' + fullDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filenamePrefix = mom.type === 'Project Report' ? 'ProjectReport' : 'MoM';
    a.download = `${filenamePrefix}_${mom.number.replace(/[\/\s]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return html`
      <div class="flex justify-center items-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy-500"></div>
      </div>
    `;
  }

  return html`
    <div class="space-y-6 animate-fadeIn">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">MoM & Project Report Records</h2>
          <p class="text-sm text-slate-400">View, edit, print, or manage all historical meeting minutes and project report documents.</p>
        </div>
        <div class="flex gap-2">
          <button onClick=${() => onTabChange('secretary_mom_generate')} class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2">
            ➕ Generate New MoM
          </button>
          <button onClick=${() => onTabChange('secretary_project_report_generate')} class="px-4 py-2.5 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 shadow-sm transition-all flex items-center gap-2">
            ➕ Generate Project Report
          </button>
        </div>
      </div>

      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-sm min-w-[800px]">
          <thead class="bg-slate-50/70 border-b border-slate-200">
            <tr>
              <th class="p-4 font-bold text-slate-700">Ref ID</th>
              <th class="p-4 font-bold text-slate-700">Record Info</th>
              <th class="p-4 font-bold text-slate-700">Date & Time</th>
              <th class="p-4 font-bold text-slate-700">Drive PDF</th>
              <th class="p-4 font-bold text-slate-700 w-24">Status</th>
              <th class="p-4 font-bold text-slate-700 text-center w-56">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(mom => html`
              <tr class="hover:bg-slate-50/50 border-b border-slate-100 last:border-0">
                <td class="p-4 font-semibold text-burgundy-600">${mom.id}</td>
                <td class="p-4">
                  <div class="font-bold text-slate-800">${mom.title}</div>
                  <div class="text-xs text-slate-400 font-semibold">${mom.number} • ${mom.type}</div>
                  ${mom.money_involved && mom.money_involved.has_money && html`
                    <div class="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      💰 Rs. ${mom.money_involved.amount.toLocaleString()} (${mom.money_involved.type})
                    </div>
                  `}
                </td>
                <td class="p-4 text-slate-600 font-medium">
                  <div>📅 ${mom.date}</div>
                  <div class="text-xs text-slate-400">⏰ ${mom.time}</div>
                </td>
                <td class="p-4">
                  ${mom.pdf_url ? html`
                    <a href=${mom.pdf_url} target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1 bg-burgundy-50 border border-burgundy-100 text-burgundy-650 hover:bg-burgundy-100 rounded-lg text-xs font-bold transition-all">
                      📄 Open PDF
                    </a>
                  ` : html`
                    <span class="text-xs text-slate-400 italic">No PDF Sync</span>
                  `}
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                    mom.status === 'Approved'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : mom.status === 'Submitted'
                      ? 'bg-blue-50 border-blue-100 text-blue-700'
                      : 'bg-slate-50 border-slate-150 text-slate-500'
                  }">
                    ${mom.status}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <div class="flex justify-center gap-1.5">
                    <button onClick=${() => onEdit(mom.id, mom.type)} class="px-2 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-650 transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick=${() => downloadPdfDirectly(mom)} class="px-2 py-1 bg-burgundy-50 border border-burgundy-150 hover:bg-burgundy-100 rounded-lg text-xs font-bold text-burgundy-750 transition-all flex items-center gap-1">
                      📥 PDF
                    </button>
                    <button onClick=${() => downloadWordDirectly(mom)} class="px-2 py-1 bg-sky-50 border border-sky-150 hover:bg-sky-100 rounded-lg text-xs font-bold text-sky-750 transition-all flex items-center gap-1">
                      📥 Word
                    </button>
                    <button onClick=${() => handleDelete(mom.id)} class="px-2 py-1 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold text-rose-500 transition-all">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `)}
            ${records.length === 0 && html`
              <tr>
                <td colspan="6" class="p-16 text-center text-slate-400 italic">No meeting minutes saved yet. Click "Generate New MoM" to start!</td>
              </tr>
            `}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  `;
}

// 12. ACTION ITEMS TRACKER COMPONENT
function ActionItemsTracker({ members = [] }) {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActionItems = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/moms`);
      if (res.ok) {
        const data = await res.json();
        
        // Aggregate action items across all approved/saved MoMs
        const aggregated = [];
        data.forEach(mom => {
          if (mom.action_items && mom.action_items.length) {
            mom.action_items.forEach(item => {
              aggregated.push({
                ...item,
                mom_id: mom.id,
                mom_number: mom.number,
                mom_title: mom.title
              });
            });
          }
        });
        setActionItems(aggregated);
      }
    } catch (err) {
      console.error('Failed to fetch action items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, []);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/moms/${item.mom_id}/action-items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_item_id: item.id,
          status: nextStatus
        })
      });
      if (res.ok) {
        // Toggle local state
        setActionItems(actionItems.map(ai => {
          if (ai.id === item.id && ai.mom_id === item.mom_id) {
            return { ...ai, status: nextStatus };
          }
          return ai;
        }));
      } else {
        alert('Failed to update action item status.');
      }
    } catch (err) {
      alert('Connection error: Failed to sync update.');
    }
  };

  if (loading) {
    return html`
      <div class="flex justify-center items-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy-500"></div>
      </div>
    `;
  }

  return html`
    <div class="space-y-6 animate-fadeIn">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">Action Items Tracker</h2>
        <p class="text-sm text-slate-400">Track and update the completion status of all tasks assigned during board and general body meetings.</p>
      </div>

      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-sm min-w-[800px]">
          <thead class="bg-slate-50/70 border-b border-slate-200">
            <tr>
              <th class="p-4 font-bold text-slate-700 w-12 text-center">Status</th>
              <th class="p-4 font-bold text-slate-700">Task Details</th>
              <th class="p-4 font-bold text-slate-700">Assigned Member</th>
              <th class="p-4 font-bold text-slate-700">Due Date</th>
              <th class="p-4 font-bold text-slate-700">Source Meeting</th>
            </tr>
          </thead>
          <tbody>
            ${actionItems.map(item => html`
              <tr class="hover:bg-slate-50/50 border-b border-slate-100 last:border-0 ${item.status === 'Completed' ? 'opacity-65' : ''}">
                <td class="p-4 text-center">
                  <input type="checkbox" checked=${item.status === 'Completed'} onChange=${() => handleToggleStatus(item)} class="rounded text-burgundy-500 focus:ring-burgundy-500/20 cursor-pointer w-4.5 h-4.5" />
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-850 ${item.status === 'Completed' ? 'line-through text-slate-400' : ''}">${item.task}</div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${item.id}</div>
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-700">${item.assigned_to_name}</div>
                </td>
                <td class="p-4 text-slate-500 font-semibold">${item.due_date}</td>
                <td class="p-4 text-slate-400 font-semibold text-xs">
                  <div>${item.mom_title}</div>
                  <div class="text-[10px] text-slate-400">${item.mom_number}</div>
                </td>
              </tr>
            `)}
            ${actionItems.length === 0 && html`
              <tr>
                <td colspan="5" class="p-16 text-center text-slate-400 italic">No active action items assigned from meetings.</td>
              </tr>
            `}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  `;
}

// 13. APPROVALS PANEL COMPONENT
function ApprovalsPanel({ onEdit }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmittedMoms = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/moms`);
      if (res.ok) {
        const data = await res.json();
        // filter forSubmitted drafts
        setRecords(data.filter(mom => mom.status === 'Submitted'));
      }
    } catch (err) {
      console.error('Failed to fetch pending MoM approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedMoms();
  }, []);

  const handleApprove = async (id) => {
    try {
      // Fetch current details
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const getRes = await fetch(`${apiBase}/api/moms/${id}`);
      if (!getRes.ok) return;
      const mom = await getRes.json();
      
      // Update status
      mom.status = 'Approved';
      
      const updateRes = await fetch(`${apiBase}/api/moms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mom)
      });
      if (updateRes.ok) {
        fetchSubmittedMoms();
      } else {
        alert('Failed to approve MoM.');
      }
    } catch (err) {
      alert('Connection error: Failed to connect to server.');
    }
  };

  if (loading) {
    return html`
      <div class="flex justify-center items-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy-500"></div>
      </div>
    `;
  }

  return html`
    <div class="space-y-6 animate-fadeIn">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-800 font-display">MoM Approvals</h2>
        <p class="text-sm text-slate-400">Review and approve submitted Minutes of Meeting documents before publication.</p>
      </div>

      <div class="bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-sm min-w-[800px]">
          <thead class="bg-slate-50/70 border-b border-slate-200">
            <tr>
              <th class="p-4 font-bold text-slate-700">Meeting Info</th>
              <th class="p-4 font-bold text-slate-700">Date & Time</th>
              <th class="p-4 font-bold text-slate-700">Recorded By</th>
              <th class="p-4 font-bold text-slate-700 text-center w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(mom => html`
              <tr class="hover:bg-slate-50/50 border-b border-slate-100 last:border-0">
                <td class="p-4">
                  <div class="font-bold text-slate-800">${mom.title}</div>
                  <div class="text-xs text-slate-400 font-semibold">${mom.number} • ${mom.type}</div>
                </td>
                <td class="p-4 text-slate-600 font-medium">
                  <div>📅 ${mom.date}</div>
                  <div class="text-xs text-slate-400">⏰ ${mom.time}</div>
                </td>
                <td class="p-4 text-slate-600 font-medium">${mom.recorded_by}</td>
                <td class="p-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button onClick=${() => handleApprove(mom.id)} class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                      ✓ Approve
                    </button>
                    <button onClick=${() => onEdit(mom.id, mom.type)} class="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 transition-colors">
                      🔎 Review
                    </button>
                  </div>
                </td>
              </tr>
            `)}
            ${records.length === 0 && html`
              <tr>
                <td colspan="4" class="p-16 text-center text-slate-400 italic">No pending meeting minutes waiting for approval.</td>
              </tr>
            `}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  `;
}

// 14. GALLERY MANAGEMENT MODULE
function GalleryManagement() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formImage, setFormImage] = useState('');
  const [formAlt, setFormAlt] = useState('');
  const [formDate, setFormDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchGallery = async () => {
    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/gallery`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAdd = () => {
    setFormImage('');
    setFormAlt('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setSubmitError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formImage) {
      setSubmitError('Please select and upload an image file.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
      const res = await fetch(`${apiBase}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: formImage,
          caption: formAlt,
          date: formDate
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchGallery();
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || 'Failed to upload photo to server.');
      }
    } catch (err) {
      setSubmitError('Connection error: Failed to connect to server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this photo from the cloud? This will also delete it from your Google Drive folder.')) {
      try {
        const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
        const res = await fetch(`${apiBase}/api/gallery/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchGallery();
        } else {
          alert('Failed to delete photo from server.');
        }
      } catch (err) {
        alert('Connection error: Failed to connect to server.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return html`
      <div class="flex justify-center items-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-burgundy-500"></div>
      </div>
    `;
  }

  return html`
    <div class="space-y-6 animate-fadeIn">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 font-display">Echoes of the Warriors Cloud</h2>
          <p class="text-sm text-slate-400">Upload and manage photo moments displayed on the 3D rotating dome gallery.</p>
        </div>
        <button onClick=${handleOpenAdd} class="px-4 py-2.5 bg-burgundy-500 text-white rounded-xl text-sm font-bold hover:bg-burgundy-600 shadow-[0_4px_12px_rgba(139,0,58,0.15)] transition-all flex items-center gap-2">
          ➕ Add Photo
        </button>
      </div>

      <!-- Gallery Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${gallery.map((img) => {
          const apiBase = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.')) && window.location.port !== '5000' ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + window.location.hostname + ':5000') : '';
          const imageSrc = (img.src.startsWith('/') && !img.src.startsWith('/uploads')) ? `${apiBase}${img.src}` : img.src;
          return html`
            <div class="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-premium hover:shadow-card transition-all group flex flex-col justify-between">
              <div class="relative aspect-video bg-slate-100 overflow-hidden">
                <img src=${imageSrc} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError=${(e) => { e.target.src = 'assets/projects/proj-0.png'; }} />
                <button onClick=${() => handleDelete(img.id)} class="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-500 hover:text-white rounded-lg text-rose-500 shadow-sm hover:shadow-md transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
              <div class="p-4 flex-1 flex flex-col justify-between">
                <p class="text-sm font-semibold text-slate-800 line-clamp-2">${img.alt || 'Warrior Moment'}</p>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>${img.id}</span>
                  <span>📅 ${img.date}</span>
                </div>
              </div>
            </div>
          `;
        })}
      </div>

      ${gallery.length === 0 && html`
        <div class="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <p class="text-slate-400 text-sm">No photos in the cloud yet. Click "Add Photo" to publish your first moment!</p>
        </div>
      `}

      <!-- Add Photo Modal -->
      ${showModal && html`
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[3000] p-4">
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-dropdown w-full max-w-lg overflow-hidden animate-scaleUp">
            <div class="bg-burgundy-600 text-white p-6 border-b-4 border-[#f9a825] flex justify-between items-center">
              <h3 class="text-lg font-bold font-display">Add Photo to Cloud</h3>
              <button onClick=${() => setShowModal(false)} class="text-white/80 hover:text-white text-xl">&times;</button>
            </div>
            <form onSubmit=${handleFormSubmit} class="p-6 space-y-5">
              ${submitError && html`<div class="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg">${submitError}</div>`}
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Upload Image File</label>
                <input type="file" accept="image/*" onChange=${(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      let width = img.width;
                      let height = img.height;
                      const maxDim = 800;
                      if (width > maxDim || height > maxDim) {
                        if (width > height) {
                          height = Math.round((height * maxDim) / width);
                          width = maxDim;
                        } else {
                          width = Math.round((width * maxDim) / height);
                          height = maxDim;
                        }
                      }
                      canvas.width = width;
                      canvas.height = height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0, width, height);
                      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                      setFormImage(compressedBase64);
                    };
                    img.src = event.target.result;
                  };
                  reader.readAsDataURL(file);
                }} class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:border-burgundy-500 focus:bg-white focus:ring-4 focus:ring-burgundy-500/10 transition-all" required />
                ${formImage && html`
                  <div class="mt-2 flex items-center gap-2">
                    <img src=${formImage} class="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <span class="text-xs text-emerald-600 font-semibold">✓ Image selected and compressed</span>
                  </div>
                `}
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Caption / Description</label>
                <input type="text" value=${formAlt} onInput=${(e) => setFormAlt(e.target.value)} class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:border-burgundy-500 focus:bg-white focus:ring-4 focus:ring-burgundy-500/10 transition-all" placeholder="e.g. Blood donation volunteer service" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">Upload Date</label>
                <input type="date" value=${formDate} onInput=${(e) => setFormDate(e.target.value)} class="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:border-burgundy-500 focus:bg-white focus:ring-4 focus:ring-burgundy-500/10 transition-all" required />
              </div>
              <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick=${() => setShowModal(false)} class="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all" disabled=${isSubmitting}>Cancel</button>
                <button type="submit" class="px-5 py-2 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(139,0,58,0.15)] transition-all" disabled=${isSubmitting}>
                  ${isSubmitting ? 'Uploading...' : 'Add Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}

// --- RENDER APP ---
render(html`<${App} />`, document.getElementById('admin-root'));
