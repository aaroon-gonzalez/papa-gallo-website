/* ═══════════════════════════════════════════════════════════
   Papa Gallo Boutique — main.js
   • Navbar: transparent → solid on scroll
   • Mobile nav: hamburger toggle
   • Gallery: ZoomParallax scroll handler
     (pure JS equivalent of framer-motion ZoomParallax)
   • Scroll reveal: IntersectionObserver for .reveal & .exp-card
═══════════════════════════════════════════════════════════ */

'use strict';


/* ─── NAVBAR ────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});


/* ─── ZOOM PARALLAX ─────────────────────────────────────── */
/*
  Replicates ZoomParallax (framer-motion):
    - useScroll offset ['start start', 'end end'] on the 300vh container
    - 7 layers with scale transforms: 1→4, 1→5, 1→6, 1→5, 1→6, 1→8, 1→9
    - rAF-throttled for 60fps performance
*/
const parallaxSection = document.getElementById('parallaxSection');
const parallaxItems   = parallaxSection
  ? Array.from(parallaxSection.querySelectorAll('.parallax-item'))
  : [];

let parallaxTicking = false;

function updateParallax() {
  const rect         = parallaxSection.getBoundingClientRect();
  const scrollable   = parallaxSection.offsetHeight - window.innerHeight;
  // progress: 0 when section top hits viewport top, 1 when section bottom hits viewport bottom
  const progress     = Math.max(0, Math.min(1, -rect.top / scrollable));

  parallaxItems.forEach(item => {
    const maxScale = parseFloat(item.dataset.maxScale) || 4;
    const scale    = 1 + (maxScale - 1) * progress;
    item.style.transform = `scale(${scale})`;
  });

  parallaxTicking = false;
}

if (parallaxSection) {
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }, { passive: true });

  // Set initial state (in case page loads mid-scroll)
  updateParallax();
}


/* ─── CLOTHING CAROUSEL ─────────────────────────────────── */
/*
  Replicates feature-carousel (feature-carousel.tsx):
    - 3D perspective: center full-size + adjacent scaled/blurred
    - translateX(offset * 45%) scale() rotateY() per item
    - Auto-advances every 4s; resets timer on manual nav
*/
const clothingCarousel = document.getElementById('clothingCarousel');
if (clothingCarousel) {
  const ccItems   = Array.from(clothingCarousel.querySelectorAll('.cc-item'));
  const ccTotal   = ccItems.length;
  let   ccCurrent = 0;
  let   ccAuto;

  function renderCC() {
    ccItems.forEach((item, i) => {
      let offset = i - ccCurrent;
      if (offset >  Math.floor(ccTotal / 2)) offset -= ccTotal;
      if (offset < -Math.floor(ccTotal / 2)) offset += ccTotal;

      const isCenter  = offset === 0;
      const isVisible = Math.abs(offset) <= 1;

      item.style.visibility = isVisible ? 'visible' : 'hidden';
      item.style.opacity    = isCenter ? '1' : '0.4';
      item.style.zIndex     = isCenter ? '10' : '5';
      item.style.filter     = isCenter ? 'none' : 'blur(4px)';
      item.style.transform  = [
        `translateX(${offset * 45}%)`,
        `scale(${isCenter ? 1 : 0.83})`,
        `rotateY(${offset * -10}deg)`
      ].join(' ');
    });
  }

  function ccNext() { ccCurrent = (ccCurrent + 1) % ccTotal; renderCC(); }
  function ccPrev() { ccCurrent = (ccCurrent - 1 + ccTotal) % ccTotal; renderCC(); }

  function resetCCAuto() {
    clearInterval(ccAuto);
    ccAuto = setInterval(ccNext, 4000);
  }

  clothingCarousel.querySelector('.cc-btn--prev')
    .addEventListener('click', () => { ccPrev(); resetCCAuto(); });
  clothingCarousel.querySelector('.cc-btn--next')
    .addEventListener('click', () => { ccNext(); resetCCAuto(); });

  renderCC();
  resetCCAuto();
}


/* ─── SCROLL REVEAL ─────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal, .exp-card').forEach(el => {
  revealObserver.observe(el);
});


/* ─── SMOOTH SCROLL (Safari / older browser fallback) ───── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
