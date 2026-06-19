/* =========================================================
   DURBAN CONNECT — script.js
   All state lives in memory only (no backend yet), so refreshing
   the page resets RSVPs / follows — that's expected for now.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initActiveLink();
  initImageFallback();
  initReveal();
  initBackToTop();
  initFooterYear();
  initContactForm();
  initSubmitForm();
  initEventCards();
  initEventSearch();
  initFollowButton();
});

/* ---------- Mobile nav toggle ---------- */
function initNav(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if(!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu when a link is tapped (mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Highlight the current page in the nav ---------- */
function initActiveLink(){
  const links = document.querySelectorAll('.site-nav a');
  const current = window.location.pathname.split('/').pop() || 'home.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if(href === current){
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ---------- Graceful image fallback ----------
   If an image fails to load (e.g. the asset hasn't been added
   to /images yet), swap it for a labelled placeholder instead
   of showing a broken-image icon. */
function initImageFallback(){
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      if(img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';

      const placeholder = document.createElement('div');
      placeholder.className = img.className ? img.className + ' img-placeholder' : 'img-placeholder';
      placeholder.setAttribute('role', 'img');
      placeholder.setAttribute('aria-label', img.alt || 'Image unavailable');
      placeholder.textContent = img.alt || 'Image coming soon';

      img.replaceWith(placeholder);
    }, { once: true });
  });
}

/* ---------- Scroll reveal animations ---------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;

  if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

/* ---------- Back to top button ---------- */
function initBackToTop(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 420);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Auto-update the copyright year ---------- */
function initFooterYear(){
  const span = document.getElementById('year');
  if(span) span.textContent = new Date().getFullYear();
}

/* ---------- Shared toast notification ---------- */
function showToast(message){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  // re-trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ---------- Shared field validation helper ---------- */
function validateField(input){
  const group = input.closest('.input-group');
  if(!group) return true;
  let errorEl = group.querySelector('.field-error');
  if(!errorEl){
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    group.appendChild(errorEl);
  }

  if(!input.checkValidity()){
    group.classList.add('invalid');
    if(input.validity.valueMissing) errorEl.textContent = 'This field is required.';
    else if(input.validity.typeMismatch && input.type === 'email') errorEl.textContent = 'Enter a valid email address.';
    else errorEl.textContent = 'Please check this field.';
    return false;
  }

  group.classList.remove('invalid');
  errorEl.textContent = '';
  return true;
}

function validateForm(form){
  let valid = true;
  form.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
    if(!validateField(input)) valid = false;
  });
  return valid;
}

/* ---------- Contact form ---------- */
function initContactForm(){
  const form = document.querySelector('.contact-form');
  if(!form) return;

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!validateForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    // No backend yet — simulate the round-trip so the form feels real.
    setTimeout(() => {
      showToast("Message sent — we'll get back to you shortly.");
      form.reset();
      if(submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }, 700);
  });
}

/* ---------- Submit-event form ---------- */
function initSubmitForm(){
  const form = document.querySelector('.event-form');
  if(!form) return;

  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
  });

  // Live character count for the description field
  const description = form.querySelector('#description');
  if(description){
    const counter = document.createElement('span');
    counter.className = 'char-count';
    description.closest('.input-group').appendChild(counter);
    const updateCount = () => { counter.textContent = `${description.value.length} characters`; };
    description.addEventListener('input', updateCount);
    updateCount();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!validateForm(form)) return;

    const submitBtn = form.querySelector('.submit-btn');
    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }

    setTimeout(() => {
      showToast('Event submitted — our team will review it shortly.');
      form.reset();
      const counter = form.querySelector('.char-count');
      if(counter) counter.textContent = '0 characters';
      if(submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Event';
      }
    }, 700);
  });
}

/* ---------- Events page: RSVP / Buy Tickets ---------- */
function initEventCards(){
  document.querySelectorAll('.event-card').forEach(card => {
    const rsvpBtn = card.querySelector('.rsvp-btn');
    const ticketBtn = card.querySelector('.tickets-btn');

    if(rsvpBtn){
      rsvpBtn.addEventListener('click', () => {
        const going = rsvpBtn.dataset.going === 'true';
        rsvpBtn.dataset.going = (!going).toString();
        rsvpBtn.textContent = going ? 'RSVP' : "You're going ✓";
        showToast(going ? 'RSVP cancelled.' : "You're on the list!");
      });
    }

    if(ticketBtn){
      ticketBtn.addEventListener('click', () => {
        if(ticketBtn.disabled) return;
        ticketBtn.textContent = 'Reserved ✓';
        ticketBtn.disabled = true;
        showToast('Tickets reserved — check your email for confirmation.');
      });
    }
  });
}

/* ---------- Events page: search + category filter ---------- */
function initEventSearch(){
  const input = document.getElementById('eventSearch');
  const cards = document.querySelectorAll('.event-card');
  const pills = document.querySelectorAll('.filter-pill');
  const noResults = document.getElementById('noResults');
  if(!cards.length) return;

  let activeCategory = 'All';

  function applyFilters(){
    const query = (input ? input.value : '').trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
      const category = card.dataset.category || '';
      const matchesQuery = title.includes(query);
      const matchesCategory = activeCategory === 'All' || category === activeCategory;
      const visible = matchesQuery && matchesCategory;
      card.hidden = !visible;
      if(visible) visibleCount++;
    });

    if(noResults) noResults.classList.toggle('show', visibleCount === 0);
  }

  if(input) input.addEventListener('input', applyFilters);

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.setAttribute('aria-pressed', 'false'));
      pill.setAttribute('aria-pressed', 'true');
      activeCategory = pill.dataset.category;
      applyFilters();
    });
  });
}

/* ---------- Profile page: follow button ---------- */
function initFollowButton(){
  const btn = document.querySelector('.follow-btn');
  const countEl = document.getElementById('followerCount');
  if(!btn) return;

  let count = parseInt(countEl?.dataset.base || '2000', 10);

  btn.addEventListener('click', () => {
    const following = btn.dataset.following === 'true';
    btn.dataset.following = (!following).toString();
    btn.textContent = following ? 'Follow' : 'Following';
    count += following ? -1 : 1;
    if(countEl) countEl.textContent = formatCount(count);
  });
}

function formatCount(n){
  if(n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}
