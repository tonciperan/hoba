/* ===== WHATSAPP BROJ — zamijeni stvarnim brojem prije deploya ===== */
const WHATSAPP_BROJ = '3850994439530';

/* ===== iOS SCROLL LOCK ===== */
let _savedScrollY = 0;
function lockScroll() {
  _savedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${_savedScrollY}px`;
  document.body.style.width = '100%';
  document.body.style.overflowY = 'scroll';
}
function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflowY = '';
  window.scrollTo(0, _savedScrollY);
}
function unlockScrollNoJump() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflowY = '';
}

/* ===== NAV SCROLL ===== */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ===== HAMBURGER MENU ===== */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navBackdrop = document.querySelector('.nav-backdrop');

function navOpen() {
  navMenu.scrollTop = 0;
  hamburger.classList.add('open');
  navMenu.classList.add('open');
  navBackdrop?.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
}

function navClose() {
  hamburger.classList.remove('open');
  navMenu.classList.remove('open');
  navBackdrop?.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.contains('open') ? navClose() : navOpen();
  });

  navBackdrop?.addEventListener('click', navClose);

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        // Same-page anchor: close nav immediately so smooth-scroll works
        navClose();
      } else {
        // Cross-page: defer close so iOS doesn't cancel navigation
        // when the nav-menu CSS transition starts during the click
        requestAnimationFrame(navClose);
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) navClose();
  });
}

/* ===== HERO BG LOAD ===== */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  const bgImg = new Image();
  const bgSrc = getComputedStyle(heroBg).backgroundImage.replace(/^url\(["']?|["']?\)$/g, '');
  if (bgSrc && bgSrc !== 'none') {
    bgImg.onload = () => heroBg.classList.add('loaded');
    bgImg.src = bgSrc;
  }
}

/* ===== FADE-IN OBSERVER ===== */
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  fadeEls.forEach(el => observer.observe(el));
}

/* ===== UNIFIED LIGHTBOX ===== */
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lbCaption = document.querySelector('.lightbox-caption');
const lbName = document.querySelector('.lightbox-caption-name');
const lbDesc = document.querySelector('.lightbox-caption-desc');
const lbPrice = document.querySelector('.lightbox-caption-price');

let lbItems = [];
let lbIdx = 0;

function lbShow(i) {
  const item = lbItems[i];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt || '';
  if (lbCaption) {
    const hasCaption = !!item.name;
    lbCaption.hidden = !hasCaption;
    if (hasCaption) {
      if (lbName) lbName.textContent = item.name;
      if (lbDesc) lbDesc.textContent = item.desc || '';
      if (lbPrice) lbPrice.textContent = item.price || '';
    }
  }
}

function lbOpen(items, index) {
  lbItems = items;
  lbIdx = ((index % items.length) + items.length) % items.length;
  lbShow(lbIdx);
  lightbox.classList.add('open');
  lockScroll();
}

function lbClose() {
  lightbox.classList.remove('open');
  unlockScroll();
  setTimeout(() => { if (lightboxImg) lightboxImg.src = ''; }, 300);
}

function lbPrev() { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; lbShow(lbIdx); }
function lbNext() { lbIdx = (lbIdx + 1) % lbItems.length; lbShow(lbIdx); }

if (lightbox && lightboxImg) {
  document.querySelectorAll('.gallery-item').forEach((item, i, arr) => {
    item.addEventListener('click', () => {
      lbOpen(Array.from(arr).map(el => ({
        src: el.querySelector('img').src,
        alt: el.querySelector('img').alt,
        name: null,
      })), i);
    });
  });

  document.querySelectorAll('.carousel-slide .menu-card').forEach((card, i, arr) => {
    card.addEventListener('click', () => {
      lbOpen(Array.from(arr).map(c => ({
        src: c.querySelector('img').src,
        alt: c.querySelector('img').alt,
        name: c.querySelector('.menu-card-name')?.textContent || '',
        desc: c.querySelector('.menu-card-desc')?.textContent || '',
        price: c.querySelector('.menu-card-price')?.textContent || '',
      })), i);
    });
  });

  document.querySelector('.lightbox-close')?.addEventListener('click', lbClose);
  document.querySelector('.lightbox-prev')?.addEventListener('click', lbPrev);
  document.querySelector('.lightbox-next')?.addEventListener('click', lbNext);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lbClose(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbPrev();
    if (e.key === 'ArrowRight') lbNext();
  });

  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? lbNext() : lbPrev();
  });
}

/* ===== MENU PEEK CAROUSEL (mobile only) ===== */
function initMenuPeekCarousel(wrapperEl) {
  const track = wrapperEl.querySelector('.carousel-track');
  const viewport = wrapperEl.querySelector('.carousel-viewport');
  const dotsEl = wrapperEl.querySelector('.carousel-dots');
  if (!track || !viewport) return;

  const origSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  const n = origSlides.length;
  if (n < 2) return;

  const cloneLast = origSlides[n - 1].cloneNode(true);
  const cloneFirst = origSlides[0].cloneNode(true);
  [cloneLast, cloneFirst].forEach(c => c.setAttribute('aria-hidden', 'true'));
  track.insertBefore(cloneLast, origSlides[0]);
  track.appendChild(cloneFirst);

  const all = Array.from(track.querySelectorAll('.carousel-slide'));
  let idx = 1;
  let jumping = false;

  function setStyle(slide, active) {
    slide.style.opacity = active ? '1' : '0.55';
    slide.style.transform = active ? 'scale(1)' : 'scale(0.92)';
    slide.style.filter = active ? '' : 'brightness(0.45)';
  }

  function calcOffset(i) {
    const sw = all[0].offsetWidth;
    const vw = viewport.offsetWidth;
    return -(i * sw) + (vw - sw) / 2;
  }

  function goTo(i, animate = true) {
    track.style.transition = animate ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    idx = i;
    track.style.transform = `translateX(${calcOffset(i)}px)`;
    all.forEach((s, j) => setStyle(s, j === i));
    if (dotsEl) {
      const di = i <= 0 ? n - 1 : i >= n + 1 ? 0 : i - 1;
      dotsEl.querySelectorAll('.carousel-dot').forEach((d, j) => d.classList.toggle('active', j === di));
    }
  }

  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slika ${i + 1}`);
      d.addEventListener('click', () => goTo(i + 1));
      dotsEl.appendChild(d);
    }
  }

  wrapperEl.querySelector('.carousel-prev')?.addEventListener('click', () => goTo(idx - 1));
  wrapperEl.querySelector('.carousel-next')?.addEventListener('click', () => goTo(idx + 1));

  track.addEventListener('transitionend', e => {
    if (e.target !== track || e.propertyName !== 'transform' || jumping) return;
    if (idx === 0) {
      jumping = true; goTo(n, false);
      requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; }));
    } else if (idx === n + 1) {
      jumping = true; goTo(1, false);
      requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; }));
    }
  });

  let tx = 0, ty = 0;
  viewport.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    if (!e.cancelable) return;
    const dx = tx - e.touches[0].clientX;
    const dy = ty - e.touches[0].clientY;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });
  viewport.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) goTo(idx + (dx > 0 ? 1 : -1));
  });

  all.forEach((s, i) => {
    s.addEventListener('click', e => {
      if (i !== idx) { e.stopImmediatePropagation(); goTo(i); }
    }, true);
  });

  requestAnimationFrame(() => goTo(1, false));
}

/* ===== CAROUSEL FACTORY ===== */
function initCarousel(wrapperEl) {
  if (!wrapperEl) return;
  if (window.innerWidth <= 768 && wrapperEl.querySelector('.menu-carousel')) {
    initMenuPeekCarousel(wrapperEl);
    return;
  }
  const track = wrapperEl.querySelector('.carousel-track');
  if (!track) return;
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const dotsEl = wrapperEl.querySelector('.carousel-dots');
  const prevBtn = wrapperEl.querySelector('.carousel-prev');
  const nextBtn = wrapperEl.querySelector('.carousel-next');
  let idx = 0;

  function spv() { return window.innerWidth <= 768 ? 1 : 3; }
  function maxPage() { return Math.ceil(slides.length / spv()); }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < maxPage(); i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Stranica ${i + 1}`);
      d.addEventListener('click', () => goTo(i * spv()));
      dotsEl.appendChild(d);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    const page = Math.floor(idx / spv());
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === page));
  }

  function goTo(newIdx) {
    const perView = spv();
    const maxIdx = slides.length - perView;
    if (newIdx > maxIdx) newIdx = 0;
    if (newIdx < 0) newIdx = Math.max(0, Math.floor(maxIdx / perView) * perView);
    idx = newIdx;
    track.style.transform = `translateX(-${idx * (100 / perView)}%)`;
    updateDots();
  }

  prevBtn?.addEventListener('click', () => goTo(idx - spv()));
  nextBtn?.addEventListener('click', () => goTo(idx + spv()));

  const touchTarget = wrapperEl.querySelector('.carousel-viewport') || track;
  let touchX = 0, touchY = 0;
  touchTarget.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  touchTarget.addEventListener('touchmove', e => {
    if (!e.cancelable) return;
    const dx = touchX - e.touches[0].clientX;
    const dy = touchY - e.touches[0].clientY;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });
  touchTarget.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      goTo(idx + (dx > 0 ? spv() : -spv()));
    }
  });

  // Only reset on width changes — height-only changes (mobile browser chrome) must not reset position
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; idx = 0; buildDots(); goTo(0); }
  }, { passive: true });
  buildDots();
}

document.querySelectorAll('.carousel-wrapper').forEach(initCarousel);

/* ===== GALLERY CENTER-PEEK CAROUSEL (mobile only) ===== */
function initGalleryCarousel() {
  if (window.innerWidth > 768) return;

  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  const origItems = Array.from(grid.querySelectorAll('.gallery-item'));
  if (origItems.length < 2) return;

  origItems.forEach(item => {
    item.classList.remove('fade-in', 'fade-in-delay-1', 'fade-in-delay-2', 'fade-in-delay-3', 'fade-in-delay-4');
  });

  const track = document.createElement('div');
  track.className = 'gallery-track';

  const cloneLast = origItems[origItems.length - 1].cloneNode(true);
  const cloneFirst = origItems[0].cloneNode(true);
  [cloneLast, cloneFirst].forEach(c => c.setAttribute('aria-hidden', 'true'));
  track.appendChild(cloneLast);
  origItems.forEach(item => track.appendChild(item));
  track.appendChild(cloneFirst);
  grid.appendChild(track);

  const all = Array.from(track.children);
  const n = origItems.length;
  let idx = 1;
  let jumping = false;

  function setStyle(item, active) {
    item.style.opacity = active ? '1' : '0.5';
    item.style.filter = active ? '' : 'brightness(0.35)';
    item.style.transform = active ? 'scale(1)' : 'scale(0.88)';
  }

  function calcOffset(i) {
    const iw = all[0].offsetWidth;
    const cw = grid.offsetWidth;
    return -(i * iw) + (cw - iw) / 2;
  }

  function goTo(i, animate = true) {
    track.style.transition = animate ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    idx = i;
    track.style.transform = `translateX(${calcOffset(i)}px)`;
    all.forEach((item, j) => setStyle(item, j === i));
  }

  track.addEventListener('transitionend', e => {
    if (e.target !== track || e.propertyName !== 'transform' || jumping) return;
    if (idx === 0) {
      jumping = true; goTo(n, false);
      requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; }));
    } else if (idx === n + 1) {
      jumping = true; goTo(1, false);
      requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; }));
    }
  });

  let tx = 0, ty = 0;
  grid.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  grid.addEventListener('touchmove', e => {
    if (!e.cancelable) return;
    const dx = tx - e.touches[0].clientX;
    const dy = ty - e.touches[0].clientY;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });
  grid.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    const dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) goTo(idx + (dx > 0 ? 1 : -1));
  });

  all.forEach((item, i) => {
    item.addEventListener('click', e => {
      if (i !== idx) { e.stopImmediatePropagation(); goTo(i); }
    }, true);
  });

  requestAnimationFrame(() => goTo(1, false));
}

initGalleryCarousel();

/* ===== REZERVACIJA FORMA (HR) ===== */
const formHR = document.getElementById('rezervacija-forma');
if (formHR) {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = formHR.querySelector('#datum');
  if (dateInput) dateInput.min = today;

  formHR.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(formHR)) return;
    const ime = formHR.querySelector('#ime').value.trim();
    const gosti = formHR.querySelector('#gosti').value;
    const datum = formatDatum(formHR.querySelector('#datum').value);
    const vrijeme = formHR.querySelector('#vrijeme').value;
    const telefon = formHR.querySelector('#telefon').value.trim();
    const napomena = formHR.querySelector('#napomena').value.trim();
    let poruka = `Pozdrav! Želim rezervirati stol u restoranu HOBA.\n\nIme i prezime: ${ime}\nBroj gostiju: ${gosti}\nDatum: ${datum}\nVrijeme: ${vrijeme}\nTelefon: ${telefon}`;
    if (napomena) poruka += `\n\nNapomena: ${napomena}`;
    window.open(`https://wa.me/${WHATSAPP_BROJ}?text=${encodeURIComponent(poruka)}`, '_blank', 'noopener');
  });
}

/* ===== REZERVACIJA FORMA (EN) ===== */
const formEN = document.getElementById('reservation-form');
if (formEN) {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = formEN.querySelector('#datum');
  if (dateInput) dateInput.min = today;

  formEN.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(formEN)) return;
    const ime = formEN.querySelector('#ime').value.trim();
    const gosti = formEN.querySelector('#gosti').value;
    const datum = formatDatumEN(formEN.querySelector('#datum').value);
    const vrijeme = formEN.querySelector('#vrijeme').value;
    const telefon = formEN.querySelector('#telefon').value.trim();
    const napomena = formEN.querySelector('#napomena').value.trim();
    let poruka = `Hello! I'd like to book a table at restaurant HOBA.\n\nName: ${ime}\nGuests: ${gosti}\nDate: ${datum}\nTime: ${vrijeme}\nPhone: ${telefon}`;
    if (napomena) poruka += `\n\nNote: ${napomena}`;
    window.open(`https://wa.me/${WHATSAPP_BROJ}?text=${encodeURIComponent(poruka)}`, '_blank', 'noopener');
  });
}

/* ===== HELPERS ===== */
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) { group?.classList.add('has-error'); valid = false; }
    else { group?.classList.remove('has-error'); }
  });
  return valid;
}
function formatDatum(d) { if (!d) return d; const [y,m,dd]=d.split('-'); return `${dd}.${m}.${y}.`; }
function formatDatumEN(d) {
  if (!d) return d;
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
