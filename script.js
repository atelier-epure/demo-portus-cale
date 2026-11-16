// Portus Cale — preview Atelier Épure. Vanilla JS, zéro dépendance.
(() => {
  // La classe .js (qui active l'état « caché avant animation ») n'est posée QUE si ce fichier s'exécute :
  // si le script ne charge pas, tout le contenu reste visible.
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Nav : fond au scroll ---
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Burger mobile ---
  const burger = document.querySelector('.nav-burger');
  const navMobile = document.getElementById('navMobile');
  const toggleMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    navMobile.hidden = !open;
    nav.classList.toggle('nav--menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu(burger.getAttribute('aria-expanded') !== 'true'));
  navMobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });

  // --- Reveal mot par mot (titres) + fade-up (blocs) ---
  document.querySelectorAll('.reveal-words').forEach((el) =>
    el.querySelectorAll('.word').forEach((w, i) => w.style.setProperty('--i', i)));
  // Révélation déterministe : on mesure la position de chaque bloc au scroll (pas d'IntersectionObserver,
  // qui ne se déclenchait pas de façon fiable et laissait le contenu invisible).
  // Tout bloc dont le haut est passé sous 92 % de la hauteur d'écran (ou déjà dépassé) est révélé.
  let pending = Array.from(document.querySelectorAll('.reveal-words, .fade-up'));
  const revealAll = () => { pending.forEach((el) => el.classList.add('visible')); pending = []; };
  const check = () => {
    const limit = window.innerHeight * 0.92;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < limit) { el.classList.add('visible'); return false; }
      return true;
    });
  };
  if (reduceMotion) {
    revealAll();
  } else {
    let queued = false;
    const onMove = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; check(); }); } };
    check();
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    window.addEventListener('load', check);
    window.addEventListener('hashchange', check);
    // Filets de sécurité : impression, ou n'importe quel souci → le contenu finit toujours par s'afficher.
    window.addEventListener('beforeprint', revealAll);
    const safety = setInterval(() => { if (pending.length) check(); else clearInterval(safety); }, 600);
  }

  // --- Parallax hero (scroll-based, pas de Ken Burns CSS en parallèle) ---
  const heroImg = document.querySelector('.hero-image');
  if (heroImg && !reduceMotion) {
    let ticking = false;
    const parallax = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) heroImg.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
  }

  // --- Bandeau maquette ---
  const banner = document.getElementById('previewBanner');
  banner.querySelector('button').addEventListener('click', () => { banner.hidden = true; });
})();
