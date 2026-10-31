const ease = 'cubic-bezier(0.22,1,0.36,1)';
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedByUser = false;
const isReduced = () => motionPreference.matches || reducedByUser;
const ownedAnimations = new Set();
function animate(element, frames, options) {
  const animation = element.animate(frames, options);
  ownedAnimations.add(animation);
  animation.onfinish = animation.oncancel = () => ownedAnimations.delete(animation);
  return animation;
}

export function animateFixtures() {
  if (isReduced()) return;
  document.querySelectorAll('#fixtures .fixture').forEach((row, index) => {
    animate(row, [
      { opacity: 0.45, transform: 'translateX(12px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 350, delay: Math.min(index * 35, 140), easing: ease });
  });
}

export function initMotion() {
  const hero = document.querySelector('.hero');
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const controls = hero.querySelector('.hero-controls');
  const selectors = [...controls.querySelectorAll('[data-slide]')];
  const pauseButton = controls.querySelector('.hero-pause');
  let active = 0;
  let timer;
  let camera;
  let userPaused = false;
  let hovered = false;
  let focused = false;
  let inView = true;
  let menuOpen = false;

  controls.hidden = false;
  hero.classList.add('is-enhanced');

  function isPlaying() {
    return !userPaused && !isReduced() && !document.hidden && inView && !hovered && !focused && !menuOpen;
  }

  function syncPlayback() {
    clearTimeout(timer);
    const paused = userPaused || isReduced();
    pauseButton.classList.toggle('is-paused', paused);
    pauseButton.disabled = isReduced();
    pauseButton.setAttribute('aria-label', isReduced() ? 'Bildwechsel bei reduzierter Bewegung deaktiviert' : paused ? 'Automatischen Bildwechsel starten' : 'Automatischen Bildwechsel pausieren');
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (isPlaying()) {
      if (camera?.playState === 'paused') camera.play();
      timer = setTimeout(() => showSlide((active + 1) % slides.length), 8000);
    } else if (camera?.playState === 'running') {
      camera.pause();
    }
  }

  function enterSlide(slide) {
    camera?.cancel();
    slide.querySelectorAll('.title-line > span, p, .button').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
    if (isReduced()) return;
    slide.querySelectorAll('.title-line > span').forEach((line, index) => {
      animate(line, [
        { transform: 'translateY(110%)', opacity: 0.2 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 800, delay: 100 + index * 110, easing: ease });
    });
    animate(slide.querySelector('p'), [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay: 220, easing: ease });
    animate(slide.querySelector('.button'), [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay: 300, easing: ease });
    camera = animate(slide.querySelector('.slide-image'), [
      { transform: 'scale(1.085)' },
      { transform: 'scale(1.025)' }
    ], { duration: 8000, easing: ease });
  }

  function showSlide(index, manual = false) {
    if (manual) userPaused = true;
    if (index !== active) {
      slides[active].classList.remove('is-active');
      slides[active].setAttribute('aria-hidden', 'true');
      slides[active].inert = true;
      active = index;
      slides[active].classList.add('is-active');
      slides[active].removeAttribute('aria-hidden');
      slides[active].inert = false;
      selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
      enterSlide(slides[active]);
    }
    syncPlayback();
  }

  selectors.forEach((button, index) => button.addEventListener('click', () => showSlide(index, true)));
  pauseButton.addEventListener('click', () => {
    userPaused = !(userPaused || isReduced());
    // Reduced motion stays authoritative even if playback is requested.
    syncPlayback();
  });
  controls.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    showSlide((active + step + slides.length) % slides.length, true);
    selectors[active].focus();
  });
  // Hover only suspends mouse playback; tapping on mobile does not create a sticky hover.
  hero.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; syncPlayback(); } });
  hero.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; syncPlayback(); } });
  hero.addEventListener('focusin', () => { focused = true; syncPlayback(); });
  hero.addEventListener('focusout', () => queueMicrotask(() => { focused = hero.contains(document.activeElement); syncPlayback(); }));
  document.addEventListener('visibilitychange', syncPlayback);
  const motionToggle = document.querySelector('[data-motion-toggle]');
  function applyMotionPreference() {
    if (isReduced()) for (const animation of ownedAnimations) animation.cancel();
    document.body.classList.toggle('reduce-motion', isReduced());
    motionToggle.setAttribute('aria-pressed', String(isReduced()));
    motionToggle.textContent = isReduced() ? 'Reduzierte Bewegung aktiv' : 'Bewegung reduzieren';
    motionToggle.disabled = motionPreference.matches;
    syncPlayback();
  }
  motionToggle.addEventListener('click', () => { reducedByUser = !reducedByUser; applyMotionPreference(); });
  motionPreference.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
  new MutationObserver(() => {
    const open = document.body.classList.contains('menu-open');
    if (open !== menuOpen) { menuOpen = open; syncPlayback(); }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0.15 }).observe(hero);

  new IntersectionObserver(([entry]) => {
    const scrolled = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    document.body.classList.toggle('site-scrolled', scrolled);
  }).observe(document.querySelector('.header-trigger'));

  const sectionEntrance = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      sectionEntrance.unobserve(entry.target);
      if (isReduced()) continue;
      if (entry.target.matches('.team-art')) {
        entry.target.classList.add('motion-ready');
        animate(entry.target.querySelector('img'), [
          { transform: 'translateX(-48px) rotate(-8deg)', opacity: 0.25 },
          { transform: 'translateX(0) rotate(0)', opacity: 1 }
        ], { duration: 850, easing: ease });
      } else {
        animate(entry.target, [
          { transform: 'translateY(32px)', opacity: 0.4 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 700, easing: ease });
      }
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('.next-game, .team-art').forEach(element => sectionEntrance.observe(element));

  document.fonts.ready.then(() => {
    if (inView && !document.hidden) enterSlide(slides[active]);
    syncPlayback();
  });
  syncPlayback();
}


