// ============================================
//   STADIUMAI — CORE APPLICATION
//   Router, State Management, UI Orchestration
// ============================================

const App = (function () {

  // ── STATE ────────────────────────────────────
  const state = {
    currentPage: 'dashboard',
    currentLang: 'en',
    matchTime: 67,
    matchScore: { home: 2, away: 1 },
    notifications: [],
    crowdUpdateInterval: null,
    clockInterval: null,
    initialized: false
  };

  // ── PAGE REGISTRY ────────────────────────────
  const pages = {
    dashboard:      { label: 'Dashboard',      icon: '🏠', breadcrumb: 'Overview' },
    assistant:      { label: 'AI Assistant',   icon: '🤖', breadcrumb: 'ARIA — AI Assistant' },
    navigation:     { label: 'Navigation',     icon: '🗺️', breadcrumb: 'Smart Navigation' },
    crowd:          { label: 'Crowd Manager',  icon: '📊', breadcrumb: 'Crowd Intelligence' },
    multilingual:   { label: 'Language Hub',   icon: '🌍', breadcrumb: 'Multilingual Assistant' },
    transport:      { label: 'Transport',      icon: '🚌', breadcrumb: 'Smart Transport Planner' },
    accessibility:  { label: 'Accessibility',  icon: '♿', breadcrumb: 'Accessibility Center' },
    sustainability: { label: 'Sustainability', icon: '🌱', breadcrumb: 'Sustainability Intelligence' },
    operations:     { label: 'Operations',     icon: '⚡', breadcrumb: 'Operational Command' },
    tests:          { label: 'Test Suite',     icon: '🧪', breadcrumb: 'Automated Test Suite' }
  };

  // ── NAVIGATION ───────────────────────────────
  function navigate(pageId) {
    if (!pages[pageId]) return;
    state.currentPage = pageId;

    // Update nav items with aria-current
    document.querySelectorAll('.nav-item').forEach(el => {
      const isActive = el.dataset.page === pageId;
      el.classList.toggle('active', isActive);
      if (isActive) {
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('aria-current');
      }
    });

    // Update breadcrumb
    const breadcrumb = document.getElementById('page-breadcrumb-name');
    if (breadcrumb) {
      breadcrumb.textContent = pages[pageId].breadcrumb;
      breadcrumb.setAttribute('aria-current', 'page');
    }

    // Show page
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const pageEl = document.getElementById(`page-${pageId}`);
    if (pageEl) {
      pageEl.classList.add('active');
      // Trigger page-specific init
      PageInits[pageId]?.();
    }

    // Announce page change to screen readers
    if (typeof announceToScreenReader === 'function') {
      announceToScreenReader(`Navigated to ${pages[pageId].breadcrumb}`);
    }
  }

  // ── PAGE INITIALIZERS ─────────────────────────
  const PageInits = {
    dashboard:      initDashboard,
    assistant:      initAssistant,
    navigation:     initNavigation,
    crowd:          initCrowd,
    multilingual:   initMultilingual,
    transport:      initTransport,
    accessibility:  initAccessibility,
    sustainability: initSustainability,
    operations:     initOperations,
    tests:          initTests
  };

  // ── CLOCK ────────────────────────────────────
  function startClock() {
    // Cache element once — getElementById inside a 1-second interval is wasteful
    const timeEl = document.getElementById('live-clock');
    function update() {
      if (timeEl) {
        timeEl.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    update();
    state.clockInterval = setInterval(update, 1000);
  }

  // ── LIVE MATCH TICKER ─────────────────────────
  function startMatchTicker() {
    // Cache NodeList once; the set of .match-minute elements doesn't change at runtime
    const minuteEls = document.querySelectorAll('.match-minute');
    setInterval(() => {
      if (state.matchTime < 90) {
        state.matchTime++;
        const label = `${state.matchTime}'`;
        minuteEls.forEach(el => { el.textContent = label; });
      }
    }, 15000); // advance 1 minute every 15 seconds
  }

  // ── TOAST NOTIFICATIONS ───────────────────────
  function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size:1.2rem;flex-shrink:0;">${icons[type] || '📢'}</span>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px;">${message.title || 'Notification'}</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);">${message.body || message}</div>
      </div>
      <button onclick="this.closest('.toast').remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;font-size:1rem;flex-shrink:0;">✕</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ── RIPPLE EFFECT ────────────────────────────
  function addRipple(element) {
    element.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // ── ANIMATED COUNTER ─────────────────────────
  function animateCounter(element, target, suffix = '', duration = 1500) {
    const start = parseInt(element.textContent) || 0;
    const range = target - start;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(start + range * eased) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ── PARTICLE BACKGROUND ───────────────────────
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '0,212,255' : '255,107,53'
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,212,255,${0.05 * (1 - dist/120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // ── SIDEBAR BUILD ────────────────────────────
  function buildSidebar() {
    const navEl = document.querySelector('.sidebar-nav');
    if (!navEl) return;

    const sections = [
      { label: 'Fan Experience', items: ['dashboard', 'assistant', 'navigation', 'multilingual'] },
      { label: 'Stadium Intel', items: ['crowd', 'transport', 'accessibility'] },
      { label: 'Management', items: ['sustainability', 'operations'] },
      { label: 'Quality Assurance', items: ['tests'] }
    ];

    const alertBadges = { crowd: '3', operations: '6' };

    sections.forEach(section => {
      const label = document.createElement('div');
      label.className = 'nav-section-label';
      label.textContent = section.label;
      navEl.appendChild(label);

      section.items.forEach(pageId => {
        const page = pages[pageId];
        const isActive = pageId === 'dashboard';
        const item = document.createElement('div');
        item.className = `nav-item ${isActive ? 'active' : ''}`;
        item.dataset.page = pageId;
        item.setAttribute('role', 'link');
        item.setAttribute('tabindex', '0');
        if (isActive) item.setAttribute('aria-current', 'page');
        item.setAttribute('aria-label', `Navigate to ${page.label}`);
        item.innerHTML = `
          <span class="nav-icon" aria-hidden="true">${page.icon}</span>
          <span>${page.label}</span>
          ${alertBadges[pageId] ? `<span class="nav-badge" aria-label="${alertBadges[pageId]} alerts">${alertBadges[pageId]}</span>` : ''}
        `;
        item.addEventListener('click', () => navigate(pageId));
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(pageId);
          }
        });
        addRipple(item);
        navEl.appendChild(item);
      });
    });
  }

  // ── DASHBOARD INIT ────────────────────────────
  function initDashboard() {
    const statsEl = document.getElementById('dashboard-stats');
    if (!statsEl || statsEl.dataset.initialized) return;
    statsEl.dataset.initialized = 'true';

    const stats = [
      { label: 'Fans Inside', value: 68714, suffix: '', icon: '👥', color: '#00D4FF', change: '+1,240', up: true },
      { label: 'Staff On Duty', value: 2847, suffix: '', icon: '🦺', color: '#FF6B35', change: '+120', up: true },
      { label: 'AI Queries/hr', value: 4392, suffix: '', icon: '🤖', color: '#7B2FBE', change: '+892', up: true },
      { label: 'Green Score', value: 8, suffix: '.4/10', icon: '🌱', color: '#00E676', change: '+0.3', up: true },
    ];

    stats.forEach((stat, i) => {
      const card = document.createElement('div');
      card.className = `glass-card stat-card animate-slide-up delay-${(i+1)*100} hover-lift shine-effect`;
      card.style.cssText = `border-left:3px solid ${stat.color};`;
      card.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:4px;">
          <span class="stat-label">${stat.label}</span>
          <span style="font-size:1.3rem;">${stat.icon}</span>
        </div>
        <div class="stat-value" style="color:${stat.color};" data-target="${stat.value}" data-suffix="${stat.suffix}">0</div>
        <div class="stat-change ${stat.up ? 'up' : 'down'}">${stat.up ? '↑' : '↓'} ${stat.change} today</div>
      `;
      statsEl.appendChild(card);
      setTimeout(() => {
        const valueEl = card.querySelector('.stat-value');
        animateCounter(valueEl, stat.value, stat.suffix);
      }, i * 150 + 300);
    });

    // Live crowd heatmap in dashboard
    renderMiniCrowdHeatmap();

    // AI insights ticker
    startInsightsTicker();

    // Notifications
    setTimeout(() => {
      showToast({ title: '🔴 AI Alert', body: 'West Entrance approaching critical capacity (97%)' }, 'danger', 5000);
    }, 2000);
    setTimeout(() => {
      showToast({ title: '🤖 ARIA Insight', body: 'Post-match exodus predicted for 22:15–23:00. Transport hub advised.' }, 'warning', 5000);
    }, 5000);
  }

  function renderMiniCrowdHeatmap() {
    const container = document.getElementById('mini-heatmap');
    if (!container) return;
    const data = AI.generateCrowdData();
    // Batch all DOM writes in a DocumentFragment — single reflow instead of one per zone
    const frag = document.createDocumentFragment();
    const fills = [];
    data.forEach(zone => {
      const color = zone.capacity > 90 ? 'var(--color-danger)' : zone.capacity > 75 ? 'var(--color-warning)' : 'var(--color-success)';
      const bar = document.createElement('div');
      bar.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:6px;">
          <span style="font-size:0.78rem;color:var(--text-secondary);width:110px;flex-shrink:0;">${zone.name}</span>
          <div class="progress-bar flex-1 mx-2" style="margin:0 8px;">
            <div class="progress-fill" style="width:0%;background:${color};" data-target="${zone.capacity}"></div>
          </div>
          <span style="font-size:0.78rem;font-family:var(--font-heading);color:${color};">${zone.capacity}%</span>
        </div>
      `;
      fills.push({ el: bar.querySelector('.progress-fill'), pct: zone.capacity });
      frag.appendChild(bar);
    });
    container.appendChild(frag);
  }

  function startInsightsTicker() {
    const insights = [
      "🤖 AI predicts 15% capacity reduction in North Stand by 21:45",
      "🌱 Stadium using 57% renewable energy — on track for green targets",
      "🚇 Metro Line 3 running at 92% efficiency — recommended for post-match exit",
      "⚽ Brazil maintaining 73% win probability based on live match stats",
      "♿ All accessibility services operational — 12 fan assistance requests completed",
      "📊 Food Court 2 & 4 have shortest queue times right now (3–5 min)",
    ];
    let idx = 0;
    const tickerEl = document.getElementById('insights-ticker');
    if (!tickerEl) return;

    function showNext() {
      tickerEl.style.opacity = '0';
      tickerEl.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        tickerEl.textContent = insights[idx % insights.length];
        tickerEl.style.opacity = '1';
        tickerEl.style.transform = 'translateY(0)';
        idx++;
      }, 400);
    }

    Object.assign(tickerEl.style, { transition: 'all 0.4s ease' });
    showNext();
    setInterval(showNext, 5000);
  }

  // ── ASSISTANT INIT ────────────────────────────
  function initAssistant() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages || chatMessages.dataset.initialized) return;
    chatMessages.dataset.initialized = 'true';

    // Welcome message
    addAIMessage(AI.getGreeting(state.currentLang), chatMessages);

    // Input handler
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    function sendMessage() {
      const rawText = inputEl.value;

      // Validate and sanitize input
      const sanitized = typeof sanitizeInput === 'function'
        ? sanitizeInput(rawText)
        : { valid: rawText.trim().length > 0, value: rawText.trim(), error: null };

      if (!sanitized.valid) {
        if (sanitized.error && rawText.trim().length > 0) {
          showToast({ title: '⚠️ Input Error', body: sanitized.error }, 'warning');
        }
        return;
      }

      // Rate limiting check
      const rateCheck = typeof checkRateLimit === 'function'
        ? checkRateLimit()
        : { allowed: true };

      if (!rateCheck.allowed) {
        showToast({
          title: '⏳ Rate Limited',
          body: `Too many messages. Please wait ${rateCheck.resetIn}s before sending again.`
        }, 'warning');
        return;
      }

      const text = sanitized.value;
      addUserMessage(text, chatMessages);
      inputEl.value = '';
      inputEl.style.height = 'auto';
      sendBtn.disabled = true;
      sendBtn.setAttribute('aria-disabled', 'true');
      showTypingIndicator(chatMessages);

      if (typeof announceToScreenReader === 'function') {
        announceToScreenReader('ARIA is processing your message, please wait.');
      }

      setTimeout(async () => {
        removeTypingIndicator(chatMessages);
        const response = AI.generateResponse(text, state.currentLang);
        await addAIMessageStream(response, chatMessages);
        sendBtn.disabled = false;
        sendBtn.removeAttribute('aria-disabled');
        if (typeof announceToScreenReader === 'function') {
          announceToScreenReader('ARIA has responded to your message.');
        }
      }, 800 + Math.random() * 600);
    }

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
    });

    // Quick prompts
    document.querySelectorAll('.quick-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        inputEl.value = btn.textContent.trim();
        sendMessage();
      });
    });

    // Language selector in assistant
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentLang = btn.dataset.lang;
        document.querySelectorAll('.lang-btn[data-lang]').forEach(b => {
          b.classList.remove('active');
          b.removeAttribute('aria-pressed');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        const langName = btn.querySelector('.lang-name') ? btn.querySelector('.lang-name').textContent : btn.dataset.lang;
        showToast({ title: '🌍 Language Changed', body: `Assistant switched to ${langName}` }, 'success');
        if (typeof announceToScreenReader === 'function') {
          announceToScreenReader(`Language changed to ${langName}`);
        }
      });
    });
  }

  function addUserMessage(text, container) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const safeText = escapeHtml(text);
    const msg = document.createElement('div');
    msg.className = 'message user';
    msg.setAttribute('role', 'listitem');
    msg.innerHTML = `
      <div class="message-avatar user" aria-hidden="true">👤</div>
      <div>
        <div class="message-bubble">${safeText}</div>
        <div class="message-time" aria-label="Sent at ${time}">${time}</div>
      </div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function addAIMessage(text, container) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const safeHtml = markdownToHtml(text);
    const msg = document.createElement('div');
    msg.className = 'message ai';
    msg.setAttribute('role', 'listitem');
    msg.innerHTML = `
      <div class="message-avatar ai" aria-hidden="true">🤖</div>
      <div>
        <div class="message-bubble">${safeHtml}</div>
        <div class="message-time" aria-label="ARIA responded at ${time}">ARIA · ${time}</div>
      </div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
  }

  async function addAIMessageStream(text, container) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const msg = document.createElement('div');
    msg.className = 'message ai';
    msg.setAttribute('role', 'listitem');
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = '<span class="cursor-blink" aria-hidden="true"></span>';
    const avatarEl = document.createElement('div');
    avatarEl.className = 'message-avatar ai';
    avatarEl.textContent = '🤖';
    avatarEl.setAttribute('aria-hidden', 'true');
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = `ARIA · ${time}`;
    timeEl.setAttribute('aria-label', `ARIA responded at ${time}`);
    const contentDiv = document.createElement('div');
    contentDiv.appendChild(bubble);
    contentDiv.appendChild(timeEl);
    msg.appendChild(avatarEl);
    msg.appendChild(contentDiv);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    // Accumulate raw text during streaming; only call markdownToHtml once on complete.
    // This avoids re-parsing the full growing string on every 3-char chunk tick.
    let fullText = '';
    const cursor = '<span class="cursor-blink" aria-hidden="true"></span>';
    await AI.streamResponse(text, (chunk) => {
      fullText += chunk;
      // Show plain text while streaming (fast, no markdown overhead)
      bubble.textContent = fullText;
      bubble.insertAdjacentHTML('beforeend', cursor);
      container.scrollTop = container.scrollHeight;
    }, () => {
      // Final render: parse markdown exactly once
      bubble.innerHTML = window.markdownToHtml(fullText);
    });
  }

  function showTypingIndicator(container) {
    const el = document.createElement('div');
    el.className = 'message ai';
    el.id = 'typing-indicator';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', 'ARIA is thinking');
    el.innerHTML = `
      <div class="message-avatar ai" aria-hidden="true">🤖</div>
      <div class="message-bubble" style="padding:8px 16px;">
        <div class="typing-indicator" aria-hidden="true">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <span style="font-size:0.72rem;color:var(--text-muted);margin-left:6px;">ARIA is thinking...</span>
        </div>
      </div>
    `;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator(container) {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  // ── NAVIGATION PAGE ───────────────────────────
  function initNavigation() {
    const container = document.getElementById('nav-map-container');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    renderStadiumMap(container);
  }

  function renderStadiumMap(container) {
    const width = container.clientWidth || 700;
    const height = Math.round(width * 0.62);
    container.style.height = height + 'px';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 700 435`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.inset = '0';

    // Stadium field
    svg.innerHTML = `
      <!-- Background -->
      <rect width="700" height="435" fill="#0a1628"/>

      <!-- Outer stadium ring -->
      <ellipse cx="350" cy="217" rx="320" ry="195" fill="none" stroke="rgba(0,212,255,0.15)" stroke-width="2"/>
      <ellipse cx="350" cy="217" rx="290" ry="170" fill="rgba(0,212,255,0.02)" stroke="rgba(0,212,255,0.1)" stroke-width="1"/>

      <!-- Field -->
      <rect x="165" y="115" width="370" height="205" rx="12" fill="#1a4a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <rect x="180" y="128" width="340" height="179" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <!-- Center line -->
      <line x1="350" y1="128" x2="350" y2="307" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <!-- Center circle -->
      <circle cx="350" cy="217" r="35" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <circle cx="350" cy="217" r="3" fill="rgba(255,255,255,0.5)"/>
      <!-- Goal areas -->
      <rect x="165" y="173" width="45" height="88" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <rect x="490" y="173" width="45" height="88" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

      <!-- Stands: North -->
      <rect x="130" y="30" width="440" height="75" rx="8" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" stroke-width="1" class="heatmap-zone-svg" data-zone="North Stand" style="cursor:pointer;"/>
      <text x="350" y="60" text-anchor="middle" fill="rgba(0,212,255,0.9)" font-size="11" font-weight="700" font-family="Orbitron,sans-serif">NORTH STAND</text>
      <text x="350" y="76" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9">Capacity: 18,400</text>

      <!-- Stands: South -->
      <rect x="130" y="330" width="440" height="75" rx="8" fill="rgba(255,107,53,0.08)" stroke="rgba(255,107,53,0.2)" stroke-width="1" class="heatmap-zone-svg" data-zone="South Stand" style="cursor:pointer;"/>
      <text x="350" y="365" text-anchor="middle" fill="rgba(255,107,53,0.9)" font-size="11" font-weight="700" font-family="Orbitron,sans-serif">SOUTH STAND</text>
      <text x="350" y="381" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9">Capacity: 16,800</text>

      <!-- Stands: East -->
      <rect x="545" y="100" width="100" height="235" rx="8" fill="rgba(0,230,118,0.08)" stroke="rgba(0,230,118,0.2)" stroke-width="1" class="heatmap-zone-svg" data-zone="East Wing" style="cursor:pointer;"/>
      <text x="595" y="215" text-anchor="middle" fill="rgba(0,230,118,0.9)" font-size="10" font-weight="700" font-family="Orbitron,sans-serif" transform="rotate(90,595,215)">EAST WING</text>

      <!-- Stands: West -->
      <rect x="55" y="100" width="100" height="235" rx="8" fill="rgba(244,67,54,0.12)" stroke="rgba(244,67,54,0.3)" stroke-width="1.5" class="heatmap-zone-svg" data-zone="West Wing" style="cursor:pointer;"/>
      <text x="105" y="215" text-anchor="middle" fill="rgba(244,67,54,0.9)" font-size="10" font-weight="700" font-family="Orbitron,sans-serif" transform="rotate(-90,105,215)">WEST WING</text>
      <text x="105" y="240" text-anchor="middle" fill="rgba(244,67,54,0.7)" font-size="8" transform="rotate(-90,105,240)">CRITICAL</text>

      <!-- Gate markers -->
      <g fill="var(--color-primary)" font-size="9" font-family="Inter,sans-serif">
        <!-- Top gates -->
        <circle cx="230" cy="108" r="5" fill="rgba(0,212,255,0.8)"/><text x="230" y="98" text-anchor="middle" fill="rgba(255,255,255,0.7)">G1</text>
        <circle cx="350" cy="108" r="5" fill="rgba(0,212,255,0.8)"/><text x="350" y="98" text-anchor="middle" fill="rgba(255,255,255,0.7)">G2</text>
        <circle cx="470" cy="108" r="5" fill="rgba(0,212,255,0.8)"/><text x="470" y="98" text-anchor="middle" fill="rgba(255,255,255,0.7)">G3</text>
        <!-- Bottom gates -->
        <circle cx="230" cy="327" r="5" fill="rgba(255,107,53,0.8)"/><text x="230" y="345" text-anchor="middle" fill="rgba(255,255,255,0.7)">G7</text>
        <circle cx="350" cy="327" r="5" fill="rgba(255,107,53,0.8)"/><text x="350" y="345" text-anchor="middle" fill="rgba(255,255,255,0.7)">G8</text>
        <circle cx="470" cy="327" r="5" fill="rgba(255,107,53,0.8)"/><text x="470" y="345" text-anchor="middle" fill="rgba(255,255,255,0.7)">G9</text>
        <!-- Side gates -->
        <circle cx="648" cy="180" r="5" fill="rgba(0,230,118,0.8)"/><text x="662" y="183" fill="rgba(255,255,255,0.7)">G4</text>
        <circle cx="648" cy="255" r="5" fill="rgba(0,230,118,0.8)"/><text x="662" y="258" fill="rgba(255,255,255,0.7)">G5</text>
        <circle cx="52" cy="180" r="5" fill="rgba(244,67,54,0.9)"/><text x="15" y="183" fill="rgba(255,255,255,0.7)">G10</text>
        <circle cx="52" cy="255" r="5" fill="rgba(244,67,54,0.9)"/><text x="15" y="258" fill="rgba(255,255,255,0.7)">G11</text>
      </g>

      <!-- Facilities icons -->
      <g font-size="14" text-anchor="middle">
        <text x="350" y="150" fill="rgba(255,255,255,0.6)" font-size="10">🏥 Medical Bay</text>
        <text x="350" y="290" fill="rgba(255,255,255,0.6)" font-size="10">🍔 Food Court</text>
        <text x="220" y="217" fill="rgba(255,255,255,0.5)" font-size="18">⚽</text>
        <text x="480" y="217" fill="rgba(255,255,255,0.5)" font-size="18">⚽</text>
      </g>

      <!-- Compass -->
      <g transform="translate(660,30)">
        <circle r="16" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.3)" stroke-width="1"/>
        <text y="-8" text-anchor="middle" fill="rgba(0,212,255,0.9)" font-size="8" font-weight="700">N</text>
        <text y="12" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="7">S</text>
        <text x="-11" y="4" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="7">W</text>
        <text x="11" y="4" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="7">E</text>
      </g>

      <!-- AI Route (animated dashed) -->
      <path id="ai-route" d="M350,108 L350,128 L280,128 L280,200 L220,200" 
            fill="none" stroke="#00D4FF" stroke-width="2.5" stroke-dasharray="8 4" 
            opacity="0.8" stroke-linecap="round" style="animation: dashMove 1s linear infinite;"/>
      <circle cx="220" cy="200" r="6" fill="#00D4FF" opacity="0.9">
        <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <text x="215" y="190" fill="#00D4FF" font-size="8" text-anchor="middle">📍 You</text>
    `;

    container.appendChild(svg);

    // Zone click handlers
    svg.querySelectorAll('.heatmap-zone-svg').forEach(el => {
      el.addEventListener('click', () => {
        const zone = el.dataset.zone;
        const responseEl = document.getElementById('nav-ai-response');
        if (responseEl) {
          const responses = [
            `🗺️ **${zone} Navigation Guide:**\n\nCurrently operating at normal capacity. Nearest facilities:\n- Restrooms: 80m ahead\n- Food concession: 120m right\n- Medical station: Level 1, west side\n\n💡 AI Tip: Use the internal corridor to avoid the busy main concourse.`,
            `📍 **${zone} Info:**\n\nCurrent capacity: ${Math.floor(Math.random()*30)+60}%\nRecommended gates: Gate ${Math.floor(Math.random()*5)+1} or Gate ${Math.floor(Math.random()*5)+6}\n\n🤖 AI is routing you optimally. Estimated walk from Main Entrance: ${Math.floor(Math.random()*5)+3} minutes.`
          ];
          responseEl.innerHTML = `<div class="ai-insight animate-scale-in">
            <div class="ai-insight-icon">🤖</div>
            <div class="ai-insight-body">
              <div class="ai-insight-label">ARIA Navigation AI</div>
              <div class="ai-insight-text">${window.markdownToHtml(responses[Math.floor(Math.random()*responses.length)])}</div>
            </div>
          </div>`;
        }
      });
    });
  }

  // ── CROWD MANAGEMENT INIT ─────────────────────
  function initCrowd() {
    const container = document.getElementById('crowd-heatmap-grid');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    renderCrowdHeatmap(container);
    startLiveCrowdUpdates(container);
  }

  function renderCrowdHeatmap(container) {
    container.innerHTML = '';
    const data = AI.generateCrowdData();
    // Batch all card writes via DocumentFragment — one reflow for all 8 zones
    const frag = document.createDocumentFragment();
    data.forEach((zone, i) => {
      const level = zone.capacity > 90 ? 'critical' : zone.capacity > 75 ? 'high' : zone.capacity > 60 ? 'medium' : 'low';
      const color = zone.capacity > 90 ? 'var(--color-danger)' : zone.capacity > 75 ? 'var(--color-warning)' : 'var(--color-success)';
      const card = document.createElement('div');
      card.className = `glass-card stat-card animate-slide-up delay-${(i%6+1)*100}`;
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="flex items-center justify-between mb-md">
          <span class="stat-label">${zone.name}</span>
          <span class="badge badge-${level === 'critical' ? 'danger' : level === 'high' ? 'warning' : level === 'medium' ? 'orange' : 'success'}">${level}</span>
        </div>
        <div class="stat-value" style="color:${color};">${zone.capacity}%</div>
        <div class="progress-bar mt-sm">
          <div class="progress-fill" style="width:${zone.capacity}%;background:${color};"></div>
        </div>
        <div class="flex items-center justify-between mt-sm">
          <span class="text-xs text-muted">Fan Count: ${Math.floor(zone.capacity * 180)}</span>
          <span class="stat-change ${zone.trend === 'up' ? 'up' : 'down'}">${zone.trend === 'up' ? '↑' : '↓'} ${zone.change}%</span>
        </div>
      `;

      frag.appendChild(card);
    });
    container.appendChild(frag);
  }

  function startLiveCrowdUpdates(container) {
    if (state.crowdUpdateInterval) clearInterval(state.crowdUpdateInterval);
    state.crowdUpdateInterval = setInterval(() => {
      renderCrowdHeatmap(container);
    }, 5000);
  }

  // ── MULTILINGUAL INIT ─────────────────────────
  function initMultilingual() {
    const container = document.getElementById('multilingual-container');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    const LANGUAGES = [
      { code: 'en', name: 'English',    flag: '🇺🇸' },
      { code: 'es', name: 'Spanish',    flag: '🇪🇸' },
      { code: 'fr', name: 'French',     flag: '🇫🇷' },
      { code: 'ar', name: 'Arabic',     flag: '🇸🇦' },
      { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
      { code: 'de', name: 'German',     flag: '🇩🇪' },
      { code: 'zh', name: 'Chinese',    flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese',   flag: '🇯🇵' },
      { code: 'ko', name: 'Korean',     flag: '🇰🇷' },
      { code: 'hi', name: 'Hindi',      flag: '🇮🇳' },
      { code: 'ru', name: 'Russian',    flag: '🇷🇺' },
      { code: 'it', name: 'Italian',    flag: '🇮🇹' },
    ];

    const langGrid = document.getElementById('lang-selector-grid');
    LANGUAGES.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = `lang-btn ${lang.code === state.currentLang ? 'active' : ''}`;
      btn.dataset.lang = lang.code;
      btn.innerHTML = `<span class="lang-flag">${lang.flag}</span><span class="lang-name">${lang.name}</span>`;
      btn.addEventListener('click', () => {
        state.currentLang = lang.code;
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateTranslationPreview(lang);
        showToast({ title: '🌍 Language Set', body: `${lang.flag} ${lang.name} selected for all AI interactions` }, 'success');
      });
      if (langGrid) langGrid.appendChild(btn);
    });

    // Translation input
    const transInput = document.getElementById('translation-input');
    const transOutput = document.getElementById('translation-output');
    const transBtn = document.getElementById('translate-btn');

    if (transBtn && transInput && transOutput) {
      transBtn.addEventListener('click', async () => {
        const text = transInput.value.trim();
        if (!text) return;
        transOutput.innerHTML = '<div class="spinner"></div> Translating...';
        await new Promise(r => setTimeout(r, 800));
        const translated = simulateTranslation(text, state.currentLang);
        transOutput.innerHTML = `<div class="animate-scale-in">${translated}</div>`;
      });
    }
  }

  function simulateTranslation(text, targetLang) {
    const greetings = AI.LANG_GREETINGS;
    const responses = {
      en: text,
      es: `[ES] ${text} (Translated to Spanish)`,
      fr: `[FR] ${text} (Traduit en Français)`,
      ar: `[AR] ${text} (مترجم إلى العربية)`,
      de: `[DE] ${text} (Übersetzt auf Deutsch)`,
      zh: `[ZH] ${text} (翻译成中文)`,
      pt: `[PT] ${text} (Traduzido para Português)`,
      ja: `[JA] ${text} (日本語に翻訳)`,
      ko: `[KO] ${text} (한국어로 번역)`,
      hi: `[HI] ${text} (हिंदी में अनुवादित)`,
      ru: `[RU] ${text} (Переведено на русский)`,
      it: `[IT] ${text} (Tradotto in Italiano)`,
    };
    return responses[targetLang] || text;
  }

  function updateTranslationPreview(lang) {
    const el = document.getElementById('lang-preview');
    if (el) {
      el.innerHTML = `<div class="ai-insight animate-scale-in">
        <div class="ai-insight-icon">${lang.flag}</div>
        <div class="ai-insight-body">
          <div class="ai-insight-label">ARIA in ${lang.name}</div>
          <div class="ai-insight-text">${AI.LANG_GREETINGS[lang.code] || AI.LANG_GREETINGS.en}</div>
        </div>
      </div>`;
    }
  }

  // ── TRANSPORT INIT ────────────────────────────
  function initTransport() {
    const container = document.getElementById('transport-list');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    const options = AI.generateTransportData();
    options.forEach((opt, i) => {
      const card = document.createElement('div');
      card.className = `transport-option animate-slide-up delay-${(i+1)*100} hover-lift`;
      card.innerHTML = `
        <div class="transport-icon-wrap" style="background:${opt.color}22;border:1px solid ${opt.color}44;">${opt.icon}</div>
        <div class="transport-details">
          <div class="transport-name">${opt.name} ${opt.eco ? '<span class="badge badge-success" style="font-size:0.6rem;">🌱 Eco</span>' : ''}</div>
          <div class="transport-meta">${opt.via}</div>
          <div class="transport-meta" style="margin-top:2px;">
            <span class="badge ${opt.crowd === 'Low' || opt.crowd === 'Clear' ? 'badge-success' : opt.crowd === 'Moderate' ? 'badge-warning' : 'badge-danger'}" style="font-size:0.65rem;">
              ${opt.crowd === 'Low' || opt.crowd === 'Clear' ? '🟢' : opt.crowd === 'Moderate' ? '🟡' : '🔴'} ${opt.crowd} Crowd
            </span>
          </div>
        </div>
        <div class="transport-eta">${opt.eta}<span>Estimated</span></div>
      `;
      card.addEventListener('click', () => {
        container.querySelectorAll('.transport-option').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const msg = `🚀 **${opt.name}** selected!\n\nYour travel plan has been set. Show this screen to transport staff for priority boarding. Estimated arrival at stadium: ${opt.eta}.\n\n${opt.eco ? '🌱 Great eco-friendly choice! You\'re earning 50 Green Points.' : ''}`;
        const el = document.getElementById('transport-ai-response');
        if (el) el.innerHTML = `<div class="ai-insight animate-scale-in">
          <div class="ai-insight-icon">🚀</div>
          <div class="ai-insight-body">
            <div class="ai-insight-label">Transport AI</div>
            <div class="ai-insight-text">${markdownToHtml(msg)}</div>
          </div>
        </div>`;
      });
      container.appendChild(card);
    });

    // Live countdown
    updateTransportCountdown();
    setInterval(updateTransportCountdown, 1000);
  }

  // Cached once by initTransport before the interval starts
  let _shuttleEl = null;
  function updateTransportCountdown() {
    if (!_shuttleEl) _shuttleEl = document.getElementById('next-shuttle');
    if (!_shuttleEl) return;
    let secs = parseInt(_shuttleEl.dataset.secs || '840');
    secs = Math.max(0, secs - 1);
    _shuttleEl.dataset.secs = secs;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    _shuttleEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (secs === 0) _shuttleEl.dataset.secs = '900';
  }

  // ── ACCESSIBILITY INIT ────────────────────────
  function initAccessibility() {
    document.querySelectorAll('.access-toggle').forEach(toggle => {
      if (toggle.dataset.initialized) return;
      toggle.dataset.initialized = 'true';
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('on');
        const featureName = toggle.closest('.access-feature')?.querySelector('.access-feature-name')?.textContent;
        showToast({
          title: toggle.classList.contains('on') ? '✅ Feature Enabled' : '❌ Feature Disabled',
          body: featureName ? `${featureName} has been ${toggle.classList.contains('on') ? 'activated' : 'deactivated'}` : 'Accessibility setting updated'
        }, toggle.classList.contains('on') ? 'success' : 'info');
      });
    });
  }

  // ── SUSTAINABILITY INIT ───────────────────────
  function initSustainability() {
    const container = document.getElementById('sustainability-gauges');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const data = AI.getSustainabilityData();

    const gauges = [
      { label: 'Renewable Energy', value: data.renewableEnergy, color: '#00E676', unit: '%' },
      { label: 'Waste Recycled', value: data.wasteRecycled, color: '#00D4FF', unit: '%' },
      { label: 'Water Recycled', value: data.waterRecycled, color: '#7B2FBE', unit: '%' },
      { label: 'Green Score', value: data.greenScore * 10, color: '#FFD700', unit: '' },
    ];

    gauges.forEach(g => {
      const circumference = 2 * Math.PI * 46;
      const offset = circumference * (1 - g.value / 100);
      const div = document.createElement('div');
      div.className = 'text-center animate-scale-in';
      div.innerHTML = `
        <div class="radial-gauge">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle class="gauge-track" cx="60" cy="60" r="46"/>
            <circle class="gauge-fill" cx="60" cy="60" r="46"
              stroke="${g.color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"
              data-offset="${offset}"
              style="transition:stroke-dashoffset 1.5s ease;"/>
          </svg>
          <div class="gauge-center-text">
            <div style="font-family:var(--font-heading);font-size:1.3rem;font-weight:700;color:${g.color};">${g.value}${g.unit}</div>
          </div>
        </div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:8px;font-weight:500;">${g.label}</div>
      `;
      container.appendChild(div);
      setTimeout(() => {
        div.querySelector('.gauge-fill').style.strokeDashoffset = offset;
      }, 300);
    });
  }

  // ── OPERATIONS INIT ───────────────────────────
  function initOperations() {
    const container = document.getElementById('alerts-container');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    renderAlerts(container);
    setInterval(() => renderAlerts(container), 30000);
  }

  function renderAlerts(container) {
    const alerts = AI.generateAlerts();
    container.innerHTML = '';
    alerts.forEach((alert, i) => {
      const el = document.createElement('div');
      el.className = `alert-item ${alert.type} animate-slide-up delay-${(i+1)*100}`;
      el.innerHTML = `
        <div class="alert-icon" style="background:${
          alert.type === 'critical' ? 'rgba(244,67,54,0.15)' :
          alert.type === 'warning'  ? 'rgba(255,152,0,0.15)' :
          alert.type === 'resolved' ? 'rgba(0,230,118,0.15)' :
          'rgba(0,212,255,0.15)'}">${alert.icon}</div>
        <div class="alert-body">
          <div class="alert-title">${alert.title} ${alert.ai ? '<span class="badge badge-primary" style="font-size:0.6rem;">🤖 AI</span>' : ''}</div>
          <div class="alert-desc">${alert.desc}</div>
          <div class="alert-time">${alert.time}</div>
        </div>
        <button class="btn btn-sm btn-ghost" onclick="this.closest('.alert-item').style.opacity='0.5'">Acknowledge</button>
      `;
      container.appendChild(el);
    });
  }

  // ── TEST SUITE INIT ────────────────────────────────
  function initTests() {
    const container = document.getElementById('test-results-container');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    if (typeof StadiumTests !== 'undefined') {
      StadiumTests.run(container);
    } else {
      container.innerHTML = '<div class="glass-card-static" style="padding:var(--space-lg);color:var(--color-warning);">Test suite not loaded. Please ensure js/tests.js is included.</div>';
    }
  }

  // ── HELPER UTILITIES ─────────────────────────
  // Delegate directly to the pre-optimised versions in utils.js.
  // The local wrapper functions have been removed to eliminate the extra call hop.
  const escapeHtml    = window.escapeHtml;
  const markdownToHtml = window.markdownToHtml;

  // ── INIT ─────────────────────────────────────
  function init() {
    if (state.initialized) return;
    state.initialized = true;

    buildSidebar();
    startClock();
    startMatchTicker();
    initParticles();

    // Initial page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const dashPage = document.getElementById('page-dashboard');
    if (dashPage) { dashPage.classList.add('active'); initDashboard(); }

    // Handle nav clicks in the main content area (fallback)
    document.addEventListener('click', (e) => {
      const navEl = e.target.closest('[data-nav]');
      if (navEl) navigate(navEl.dataset.nav);
    });

    // Keyboard shortcut: Ctrl+K → focus chat
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('assistant');
        setTimeout(() => document.getElementById('chat-input')?.focus(), 200);
      }
    });

    console.log('%c⚽ StadiumAI — FIFA World Cup 2026', 'color:#00D4FF;font-size:18px;font-weight:bold;');
    console.log('%cGenAI-Powered Stadium Intelligence Platform', 'color:#FF6B35;font-size:12px;');
  }

  // Public
  return { init, navigate, showToast, state, animateCounter };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
