// Google Calendar Format Logic for Rotaract Club of Bangalore Warriors (Linked to Admin Dashboard)
document.addEventListener('DOMContentLoaded', function () {
  var hostname = window.location.hostname;
  var isLocal = hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') || 
                hostname.startsWith('10.') || 
                hostname.startsWith('172.') || 
                window.location.protocol === 'file:';
                
  var apiBase = (isLocal && window.location.port !== '5000') 
    ? (window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.protocol + '//' + hostname + ':5000') 
    : '';

  
  function getRelativeDate(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + offsetDays);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var r = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + r;
  }

  // Initialize warriors_events in localStorage if not exists (sync with admin database)
  if (!localStorage.getItem('warriors_events')) {
    var defaultEvents = [
      { id: 'EVT-201', name: 'Installation Ceremony', date: getRelativeDate(-2), venue: 'Ritz Carlton Ballroom', registrations: 150, budget: 45000, status: 'Completed', attendance: 92 },
      { id: 'EVT-202', name: 'Core Committee Meeting', date: getRelativeDate(2), venue: 'Club House', registrations: 15, budget: 500, status: 'Upcoming', attendance: 0 },
      { id: 'EVT-203', name: 'Speaker Session on Leadership', date: getRelativeDate(5), venue: 'Zoom Meeting', registrations: 85, budget: 2000, status: 'Upcoming', attendance: 0 },
      { id: 'EVT-204', name: 'Community Blood Donation Drive', date: getRelativeDate(8), venue: 'Rotary Hall, Bangalore', registrations: 120, budget: 6000, status: 'Upcoming', attendance: 0 }
    ];
    localStorage.setItem('warriors_events', JSON.stringify(defaultEvents));
  }

  // Load from localStorage and map to display format
  var events = [];
  var isFetching = false;
  
  function parseAndMapRawEvents(raw) {
    return raw.map(function(e) {
      var cat = 'meeting';
      var nameLower = (e.name || '').toLowerCase();
      if (nameLower.indexOf('meet') !== -1 || nameLower.indexOf('fellowship') !== -1 || nameLower.indexOf('dinner') !== -1 || nameLower.indexOf('social') !== -1) {
        cat = 'fellowship';
      } else if (nameLower.indexOf('camp') !== -1 || nameLower.indexOf('drive') !== -1 || nameLower.indexOf('plant') !== -1 || nameLower.indexOf('project') !== -1 || nameLower.indexOf('annapurna') !== -1 || nameLower.indexOf('donation') !== -1) {
        cat = 'club';
      } else {
        cat = 'meeting';
      }
      
      return {
        id: e.id || ('EVT-' + Math.random()),
        title: e.name || 'Untitled Event',
        category: cat,
        date: e.date || '',
        time: '18:00',
        location: e.venue || 'TBD',
        desc: 'Status: ' + (e.status || 'Upcoming') + '. Budget: Rs. ' + (e.budget || 0) + '. Registrations: ' + (e.registrations || 0) + '.'
      };
    });
  }

  function loadAndMapEvents() {
    if (isFetching) return;
    isFetching = true;
    
    fetch(apiBase + '/api/events')
      .then(function(res) { 
        if (!res.ok) throw new Error("API error status " + res.status);
        return res.json(); 
      })
      .then(function(raw) {
        events = parseAndMapRawEvents(raw || []);
        isFetching = false;
        // Re-render display if elements exist
        if (document.getElementById('mini-calendar-grid')) {
          renderMiniCalendar();
          renderMainCalendar();
        }
      })
      .catch(function(err) {
        console.warn("Failed to load calendar events from REST API, falling back to localStorage:", err);
        isFetching = false;
        try {
          var saved = localStorage.getItem('warriors_events');
          if (saved) {
            events = parseAndMapRawEvents(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Failed to load events from localStorage:', e);
          events = [];
        }
      });
  }

  // Load initial events
  loadAndMapEvents();

  // 2. Navigation State
  var currentDate = new Date(); // Date displayed in main calendar
  var miniCalendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  var selectedEvent = null;

  // DOM Elements
  var miniMonthYear = document.getElementById('mini-month-year');
  var miniGrid = document.getElementById('mini-calendar-grid');
  var prevMiniBtn = document.getElementById('prev-mini-month');
  var nextMiniBtn = document.getElementById('next-mini-month');

  var mainMonthYear = document.getElementById('main-month-year');
  var mainGrid = document.getElementById('main-calendar-grid');
  var prevMonthBtn = document.getElementById('prev-month-btn');
  var nextMonthBtn = document.getElementById('next-month-btn');
  var todayBtn = document.getElementById('today-btn');

  var filterClub = document.getElementById('filter-club');
  var filterFellowship = document.getElementById('filter-fellowship');
  var filterMeetings = document.getElementById('filter-meetings');

  var detailsModal = document.getElementById('event-details-modal');
  var detailBadge = document.getElementById('detail-category-badge');
  var detailTitle = document.getElementById('detail-title');
  var detailDateTime = document.getElementById('detail-datetime');
  var detailLocationContainer = document.getElementById('detail-location-container');
  var detailLocation = document.getElementById('detail-location');
  var detailDesc = document.getElementById('detail-desc');
  var deleteBtn = document.getElementById('delete-event-btn');
  var addToGoogleBtn = document.getElementById('add-to-google-btn');
  var closeBtns = document.querySelectorAll('.close-modal-btn');

  // Month names
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // 3. Render Helpers
  function renderAll() {
    loadAndMapEvents();
    renderMiniCalendar();
    renderMainCalendar();
  }

  // Mini Side Calendar
  function renderMiniCalendar() {
    var year = miniCalendarDate.getFullYear();
    var month = miniCalendarDate.getMonth();
    miniMonthYear.textContent = monthNames[month] + ' ' + year;

    miniGrid.innerHTML = '';
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevDaysInMonth = new Date(year, month, 0).getDate();

    // Padding from prev month
    for (var i = firstDay - 1; i >= 0; i--) {
      var day = prevDaysInMonth - i;
      var el = document.createElement('div');
      el.className = 'text-slate-300 py-1.5 cursor-pointer hover:bg-slate-100 rounded-full transition-colors';
      el.textContent = day;
      (function(y, m, d) {
        el.addEventListener('click', function() {
          currentDate = new Date(y, m, d);
          miniCalendarDate = new Date(y, m, 1);
          renderAll();
        });
      })(year, month - 1, day);
      miniGrid.appendChild(el);
    }

    // Days of current month
    var today = new Date();
    for (var day = 1; day <= daysInMonth; day++) {
      var el = document.createElement('div');
      var isCurrent = day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
      var isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      
      var classes = 'py-1.5 cursor-pointer rounded-full transition-colors';
      if (isCurrent) {
        classes += ' bg-[#8B003A] text-white font-bold';
      } else if (isToday) {
        classes += ' border border-[#8B003A] text-[#8B003A] font-bold';
      } else {
        classes += ' text-slate-700 hover:bg-slate-100';
      }
      
      el.className = classes;
      el.textContent = day;
      (function(y, m, d) {
        el.addEventListener('click', function() {
          currentDate = new Date(y, m, d);
          renderAll();
        });
      })(year, month, day);
      miniGrid.appendChild(el);
    }

    // Padding for next month
    var totalCells = firstDay + daysInMonth;
    var nextPadding = 42 - totalCells; // 6 rows grid
    for (var day = 1; day <= nextPadding; day++) {
      var el = document.createElement('div');
      el.className = 'text-slate-300 py-1.5 cursor-pointer hover:bg-slate-100 rounded-full transition-colors';
      el.textContent = day;
      (function(y, m, d) {
        el.addEventListener('click', function() {
          currentDate = new Date(y, m, d);
          miniCalendarDate = new Date(y, m, 1);
          renderAll();
        });
      })(year, month + 1, day);
      miniGrid.appendChild(el);
    }
  }

  // Filter conditions
  function isEventVisible(evt) {
    if (evt.category === 'club' && !filterClub.checked) return false;
    if (evt.category === 'fellowship' && !filterFellowship.checked) return false;
    if (evt.category === 'meeting' && !filterMeetings.checked) return false;
    return true;
  }

  // Main Google Calendar view
  function renderMainCalendar() {
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth();
    mainMonthYear.textContent = monthNames[month] + ' ' + year;

    mainGrid.innerHTML = '';
    
    // Config month grid
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevDaysInMonth = new Date(year, month, 0).getDate();

    // 1. Previous Month Padding days
    for (var i = firstDay - 1; i >= 0; i--) {
      var day = prevDaysInMonth - i;
      var dateStr = formatDateStr(year, month - 1, day);
      var dayCell = createDayCell(day, false, dateStr);
      mainGrid.appendChild(dayCell);
    }

    // 2. Current Month days
    var today = new Date();
    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = formatDateStr(year, month, day);
      var isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      var dayCell = createDayCell(day, true, dateStr, isToday);
      mainGrid.appendChild(dayCell);
    }

    // 3. Next Month Padding days
    var totalCells = firstDay + daysInMonth;
    var nextPadding = 42 - totalCells;
    for (var day = 1; day <= nextPadding; day++) {
      var dateStr = formatDateStr(year, month + 1, day);
      var dayCell = createDayCell(day, false, dateStr);
      mainGrid.appendChild(dayCell);
    }
  }

  function formatDateStr(y, m, d) {
    var dateObj = new Date(y, m, d);
    var rY = dateObj.getFullYear();
    var rM = String(dateObj.getMonth() + 1).padStart(2, '0');
    var rD = String(dateObj.getDate()).padStart(2, '0');
    return rY + '-' + rM + '-' + rD;
  }

  function createDayCell(dayNum, isCurrentMonth, dateStr, isToday) {
    var cell = document.createElement('div');
    cell.className = 'border-r border-b border-slate-100 p-2 min-h-[90px] flex flex-col justify-between transition-all hover:bg-slate-50/50 relative';
    
    // Day number label
    var labelContainer = document.createElement('div');
    labelContainer.className = 'flex justify-end';
    
    var label = document.createElement('span');
    var isCurrentDay = dateStr === formatDateStr(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    if (isToday) {
      label.className = 'w-6 h-6 rounded-full flex items-center justify-center bg-[#8B003A] text-white font-bold text-xs shadow-sm';
    } else if (isCurrentDay) {
      label.className = 'w-6 h-6 rounded-full flex items-center justify-center border border-[#8B003A] text-[#8B003A] font-bold text-xs';
    } else {
      label.className = isCurrentMonth ? 'text-slate-800 text-xs font-semibold' : 'text-slate-300 text-xs';
    }
    label.textContent = dayNum;
    labelContainer.appendChild(label);
    cell.appendChild(labelContainer);

    // Event container
    var list = document.createElement('div');
    list.className = 'flex flex-col gap-1 mt-1 overflow-hidden max-h-[70px] select-none';
    
    // Find matching events
    var dayEvents = events.filter(function (e) { return e.date === dateStr && isEventVisible(e); });
    
    dayEvents.forEach(function (evt) {
      var badge = document.createElement('div');
      var colorClasses = '';
      if (evt.category === 'club') {
        colorClasses = 'bg-rose-50 border-l-2 border-rose-500 text-rose-700';
      } else if (evt.category === 'fellowship') {
        colorClasses = 'bg-blue-50 border-l-2 border-blue-500 text-blue-700';
      } else {
        colorClasses = 'bg-amber-50 border-l-2 border-amber-500 text-amber-700';
      }
      badge.className = colorClasses + ' px-1.5 py-0.5 rounded text-[10px] font-bold truncate tracking-tight cursor-pointer transition-all hover:brightness-95';
      badge.textContent = evt.time + ' ' + evt.title;
      
      badge.addEventListener('click', function (e) {
        e.stopPropagation();
        openEventDetails(evt);
      });
      list.appendChild(badge);
    });
    
    cell.appendChild(list);
    return cell;
  }

  // 4. Modal and popover details
  function openEventDetails(evt) {
    selectedEvent = evt;
    
    detailTitle.textContent = evt.title;
    detailDateTime.textContent = evt.date + ' at ' + evt.time;
    if (evt.location) {
      detailLocation.textContent = evt.location;
      detailLocationContainer.style.display = 'flex';
    } else {
      detailLocationContainer.style.display = 'none';
    }
    detailDesc.textContent = evt.desc || 'No description provided.';

    // Set badge style
    if (evt.category === 'club') {
      detailBadge.textContent = 'Club Project';
      detailBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700';
    } else if (evt.category === 'fellowship') {
      detailBadge.textContent = 'Fellowship Event';
      detailBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700';
    } else {
      detailBadge.textContent = 'Meeting / Seminar';
      detailBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700';
    }

    detailsModal.classList.remove('opacity-0', 'pointer-events-none');
    detailsModal.querySelector('.bg-white').classList.remove('scale-95');
    detailsModal.querySelector('.bg-white').classList.add('scale-100');
  }

  function closeAllModals() {
    if (detailsModal) {
      detailsModal.classList.add('opacity-0', 'pointer-events-none');
      var card = detailsModal.querySelector('.bg-white');
      if (card) {
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
      }
    }
    selectedEvent = null;
  }

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', closeAllModals);
  });

  if (detailsModal) {
    detailsModal.addEventListener('click', function (e) {
      if (e.target === detailsModal) {
        closeAllModals();
      }
    });
  }

  // Handle Delete Event (Sync back to localStorage)
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      if (selectedEvent) {
        try {
          var saved = localStorage.getItem('warriors_events');
          if (saved) {
            var raw = JSON.parse(saved);
            raw = raw.filter(function (e) { return e.id !== selectedEvent.id; });
            localStorage.setItem('warriors_events', JSON.stringify(raw));
          }
        } catch (e) {
          console.error(e);
        }
        closeAllModals();
        renderAll();
      }
    });
  }

  // Google Calendar integration exports
  if (addToGoogleBtn) {
    addToGoogleBtn.addEventListener('click', function () {
      if (selectedEvent) {
        var title = encodeURIComponent(selectedEvent.title);
        var desc = encodeURIComponent(selectedEvent.desc || '');
        var loc = encodeURIComponent(selectedEvent.location || '');
        
        var d = selectedEvent.date.replace(/-/g, '');
        var t = selectedEvent.time.replace(/:/g, '') + '00';
        var dates = d + 'T' + t + '/' + d + 'T' + t;
        
        var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + dates + '&details=' + desc + '&location=' + loc;
        window.open(url, '_blank');
      }
    });
  }

  // 5. Navigation Control Buttons
  prevMiniBtn.addEventListener('click', function () {
    miniCalendarDate.setMonth(miniCalendarDate.getMonth() - 1);
    renderMiniCalendar();
  });

  nextMiniBtn.addEventListener('click', function () {
    miniCalendarDate.setMonth(miniCalendarDate.getMonth() + 1);
    renderMiniCalendar();
  });

  prevMonthBtn.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    miniCalendarDate.setMonth(miniCalendarDate.getMonth() - 1);
    renderAll();
  });

  nextMonthBtn.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    miniCalendarDate.setMonth(miniCalendarDate.getMonth() + 1);
    renderAll();
  });

  todayBtn.addEventListener('click', function () {
    currentDate = new Date();
    miniCalendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    renderAll();
  });

  // Checkboxes trigger redraw on click
  [filterClub, filterFellowship, filterMeetings].forEach(function (chk) {
    chk.addEventListener('change', renderAll);
  });

  // Listen for storage change events (in case admin page changes events in another tab!)
  window.addEventListener('storage', function (e) {
    if (e.key === 'warriors_events') {
      renderAll();
    }
  });

  // Initial render boot
  renderAll();
});
