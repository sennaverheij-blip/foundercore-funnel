/* ============================================================
   HIBOO.NL — Main JavaScript
   ============================================================ */

// ---- Navigation scroll effect ----
const nav = document.querySelector('.nav');
function handleScroll() {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// ---- Mobile menu ----
const mobileBtn = document.querySelector('.nav-mobile-btn');
const mobileMenu = document.querySelector('.nav-mobile');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Active nav link ----
const navLinks = document.querySelectorAll('.nav-links a');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ---- FAQ accordion ----
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    // Open clicked if was closed
    if (!isOpen) item.classList.add('open');
  });
});

// ---- Scroll reveal ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Countdown timer ----
function initCountdown(targetDateStr) {
  const target = new Date(targetDateStr).getTime();
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };
  if (!els.days) return;

  function update() {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.days)    els.days.textContent    = String(d).padStart(2, '0');
    if (els.hours)   els.hours.textContent   = String(h).padStart(2, '0');
    if (els.minutes) els.minutes.textContent = String(m).padStart(2, '0');
    if (els.seconds) els.seconds.textContent = String(s).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

// Webinar date: first Tuesday of next month at 20:00 CET
(function setWebinarCountdown() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  // Find first Tuesday (day 2)
  while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
  d.setHours(20, 0, 0, 0);
  const dateStr = d.toISOString();
  // Store for display
  window.HIBOO_WEBINAR_DATE = d;
  initCountdown(dateStr);
})();

// ---- Form submission (placeholder) ----
document.querySelectorAll('.hiboo-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Even geduld...';
    btn.disabled = true;

    // Simulate async (replace with actual endpoint)
    await new Promise(r => setTimeout(r, 1200));

    const redirect = form.dataset.redirect;
    if (redirect) {
      window.location.href = redirect;
    } else {
      btn.textContent = '✓ Verstuurd!';
      btn.style.background = 'var(--success)';
    }
  });
});

// ---- Smooth anchor scroll ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---- Copy to clipboard ----
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Gekopieerd!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    });
  });
});

// ---- Webinar date display ----
function formatDate(d) {
  const days = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
  const months = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
document.querySelectorAll('.webinar-date-display').forEach(el => {
  if (window.HIBOO_WEBINAR_DATE) {
    el.textContent = formatDate(window.HIBOO_WEBINAR_DATE) + ' om 20:00 uur';
  }
});
