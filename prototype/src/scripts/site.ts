import { initNeuralPassage } from './neural';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
const toggle = document.querySelector<HTMLButtonElement>('[data-video-toggle]');
const label = document.querySelector<HTMLElement>('[data-video-label]');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const simpleMotion = new URLSearchParams(location.search).get('motion') === 'reduce';
document.documentElement.classList.toggle('reduce-motion', simpleMotion);
let careerIndex = 0;
const header = document.querySelector<HTMLElement>('.site-header');
function updateHeader() {
  const heroBottom = document.querySelector('.hero')?.getBoundingClientRect().bottom ?? 0;
  const careerBox = document.querySelector('.career')?.getBoundingClientRect();
  const infraBox = document.querySelector('.infrastructure')?.getBoundingClientRect();
  const inInfra = (simpleMotion || motion.matches) ? infraBox && infraBox.top < 60 && infraBox.bottom > 60 : careerBox && careerBox.top < 60 && careerBox.bottom > 60 && careerIndex === 2;
  const box = document.querySelector('.connections')?.getBoundingClientRect();
  const evidenceBox = document.querySelector('.evidence')?.getBoundingClientRect();
  const physicalBox = document.querySelector('.physical')?.getBoundingClientRect();
  const inPhysical = physicalBox && physicalBox.top < 60 && physicalBox.bottom > 60;
  const inEvidence = evidenceBox && evidenceBox.top < 60 && evidenceBox.bottom > 60;
  const dark = inPhysical || inEvidence || heroBottom > 60 || inInfra || (box && box.top < 60 && box.bottom > 60 && !document.querySelector('.connections-still')?.classList.contains('at-handoff'));
  header?.classList.toggle('on-dark', Boolean(dark));
}
let headerPending = false;
window.addEventListener('scroll', () => { if (!headerPending) { headerPending = true; requestAnimationFrame(() => { updateHeader(); headerPending = false; }); } }, { passive: true });
updateHeader();
window.addEventListener('papilve-tone', updateHeader);
function videoState(paused: boolean) { if (!video) return; if (paused) video.pause(); else void video.play().catch(() => videoState(true)); toggle?.setAttribute('aria-pressed', String(paused)); if (label) label.textContent = paused ? 'Play film' : 'Pause film'; }
toggle?.addEventListener('click', () => videoState(!video?.paused));
video?.addEventListener('error', () => videoState(true));
const openingTime = 4;
const closingTime = 41;
function enterFilm() {
  if (!video) return;
  const revealAndPlay = () => {
    video.dataset.ready = 'true';
    if (motion.matches || simpleMotion) { videoState(true); return; }
    void video.play().catch(() => videoState(true));
  };
  const seekToOpening = () => {
    // Safari needs the seek to complete before playback starts; otherwise autoplay can race from frame 0.
    if (video.readyState < 1) return;
    if (Math.abs(video.currentTime - openingTime) <= 0.25) { revealAndPlay(); return; }
    video.pause();
    const onSeeked = () => revealAndPlay();
    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = openingTime;
  };
  seekToOpening();
}
video?.addEventListener('loadedmetadata', enterFilm, { once: true });
video?.addEventListener('canplay', () => {
  if (video && video.currentTime < openingTime - 0.25) enterFilm();
}, { once: true });
video?.addEventListener('timeupdate', () => {
  if (video && video.currentTime >= closingTime) {
    video.currentTime = openingTime;
    if (!motion.matches && !simpleMotion) void video.play().catch(() => videoState(true));
  }
});
video?.addEventListener('ended', () => { if (video) { video.currentTime = openingTime; if (!motion.matches && !simpleMotion) videoState(false); } });
if (video && video.readyState >= 1) enterFilm();
document.addEventListener('visibilitychange', () => { if (document.hidden) videoState(true) });
if (motion.matches || simpleMotion) videoState(true);
const scan = document.querySelector<HTMLDialogElement>('.scan-dialog');
const scanOpen = document.querySelector<HTMLButtonElement>('[data-scan-open]');
scanOpen?.addEventListener('click', () => { scan?.showModal(); document.body.style.overflow = 'hidden' });
function closeScan() { scan?.close(); document.body.style.removeProperty('overflow') }
document.querySelector('[data-scan-close]')?.addEventListener('click', closeScan);
scan?.addEventListener('close', () => { document.body.style.removeProperty('overflow'); scanOpen?.focus() });
scan?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    closeScan();
    const marker = document.getElementById(link.hash.slice(1));
    if (!marker) return;
    history.replaceState(null, '', link.hash);
    marker.scrollIntoView({ behavior: 'instant' });
    ScrollTrigger.update();
    requestAnimationFrame(() => {
      const selectors: Record<string, string> = {
        '#physical': '#physical-title',
        '#nasdaq': '#nasdaq-title',
        '#ledger': '#ledger-title',
        '#blockdaemon': '#block-title',
      };
      const target = document.querySelector<HTMLElement>(selectors[link.hash] ?? link.hash);
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    });
  });
});
initNeuralPassage(simpleMotion);
const mm = gsap.matchMedia();
if (!simpleMotion) mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('[data-hero-line]', { y: 35, opacity: 0, duration: 1.1, stagger: .12, ease: 'power3.out' });
  gsap.to('.hero__media', { yPercent: 18, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.timeline({ scrollTrigger: { trigger: '.underneath', start: 'top bottom', end: 'bottom bottom', scrub: 1 } }).from('.portrait-cut', { y: 180, rotation: -10, scale: .65 }, 0).from('.under-still h2', { xPercent: -12 }, 0);
  gsap.timeline({ scrollTrigger: { trigger: '.physical', start: 'top bottom', end: 'bottom bottom', scrub: 1 } }).from('.physical-fruit', { scale: 1.4, xPercent: 15 }, 0).from('.physical h2', { yPercent: 30 }, 0);
  const career = document.querySelector<HTMLElement>('.career');
  const scenes = Array.from(document.querySelectorAll<HTMLElement>('.career-scene'));
  let active = -1;
  scenes.forEach((scene, i) => { scene.inert = i !== 0; scene.setAttribute('aria-hidden', String(i !== 0)); });
  const careerTl = gsap.timeline({
    scrollTrigger: {
      trigger: career, start: 'top top', end: 'bottom bottom', scrub: .7, onUpdate: self => {
        const index = self.progress < .36 ? 0 : self.progress < .62 ? 1 : 2;
        careerIndex = index; updateHeader();
        if (index !== active) { active = index; scenes.forEach((scene, i) => { scene.inert = i !== index; scene.setAttribute('aria-hidden', String(i !== index)); if (i !== index) scene.querySelectorAll<HTMLDetailsElement>('details').forEach(d => d.open = false); }); }
      }
    }
  });
  careerTl.to('.market-slits', { xPercent: 15, scaleX: .65, duration: .8, ease: 'none' }, 0)
    .to('.market .employer', { opacity: 0, xPercent: -7, duration: .14 }, .74)
    .to('.market .career-caption,.market .scene-bridge', { opacity: 0, duration: .12 }, .78)
    .to('.market-slits', { xPercent: 65, scaleX: .12, rotation: -12, duration: .6, ease: 'power2.inOut' }, .86)
    .fromTo('.custody', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .6, ease: 'power2.inOut' }, .86)
    .fromTo('.custody-door span:first-child', { xPercent: 100 }, { xPercent: 0, duration: .6 }, .86)
    .fromTo('.custody-door span:last-child', { xPercent: -100 }, { xPercent: 0, duration: .6 }, .86)
    .fromTo('.custody .employer', { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: .22 }, 1.46)
    .fromTo('.custody .career-caption,.custody .scene-bridge', { opacity: 0 }, { opacity: 1, duration: .22 }, 1.46)
    .to('.custody-door', { scale: 1.8, duration: .6 }, 2.02)
    .to('.custody .employer,.custody .career-caption,.custody .scene-bridge', { opacity: 0, duration: .15 }, 2.02)
    .fromTo('.infrastructure', { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: .6, ease: 'power2.inOut' }, 2.06)
    .fromTo('.infrastructure .employer', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .22 }, 2.66)
    .fromTo('.infrastructure .career-caption', { opacity: 0 }, { opacity: 1, duration: .2 }, 2.66)
    .fromTo('.infra-progression span:nth-child(1)', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: .15 }, 2.7)
    .to('.infra-type span:first-child', { xPercent: -15, yPercent: -35, opacity: .2, duration: .55 }, 2.85)
    .to('.infra-progression span:nth-child(1)', { opacity: .2, duration: .2 }, 3.05)
    .fromTo('.infra-progression span:nth-child(2)', { opacity: .2 }, { opacity: 1, duration: .2 }, 3.05)
    .to('.infra-type span:nth-child(2)', { xPercent: 20, yPercent: -30, opacity: .1, duration: .55 }, 3.1)
    .to('.infra-progression span:nth-child(2)', { opacity: .2, duration: .2 }, 3.55)
    .fromTo('.infra-progression span:nth-child(3)', { opacity: .2 }, { opacity: 1, duration: .2 }, 3.55)
    .fromTo('.infra-commercial', { y: 130, opacity: 0 }, { y: 0, opacity: .55, duration: .55 }, 3.45)
    .to('.infrastructure .employer', { yPercent: -12, scale: .94, duration: .9 }, 3.05)
    .to('.career-thread', { left: '88%', rotation: 90, duration: .6 }, .86)
    .to('.career-thread', { left: '48%', rotation: 0, backgroundColor: '#dfb458', duration: .6 }, 2.06)
    .to({}, { duration: .12 }, 4);
  // Clean up inert state when motion preference changes.
  const restore = () => scenes.forEach(scene => { scene.inert = false; scene.removeAttribute('aria-hidden'); });
  gsap.timeline({ scrollTrigger: { trigger: '.physical', start: 'bottom bottom', end: 'bottom top', scrub: true } }).to('.physical-fruit', { scale: 1.8, filter: 'saturate(0)', duration: 1 }, 0).to('.physical h2', { xPercent: -20, opacity: 0, duration: 1 }, 0);
  gsap.timeline({ scrollTrigger: { trigger: '.evidence', start: 'top top', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true } })
    .fromTo('.evidence-portal', { clipPath: 'polygon(18% 0,100% 0,82% 100%,0 100%)', rotation: -10, rotateY: -18, scale: .88 }, { clipPath: 'polygon(12% 0,100% 0,88% 100%,0 100%)', rotation: -5, rotateY: -8, scale: 1, duration: 1.2 }, 0)
    .to('.evidence h2', { xPercent: -8, yPercent: -12, opacity: .12, duration: .8 }, .55)
    .to('.evidence-portal', { left: () => window.innerWidth > 600 ? '12%' : '3%', width: () => window.innerWidth > 600 ? '86%' : '100%', top: () => window.innerWidth > 600 ? '18%' : '29%', height: () => window.innerWidth > 600 ? '63%' : '48%', rotation: 0, rotateY: 0, clipPath: 'polygon(4% 0,100% 0,96% 100%,0 100%)', duration: .9 }, 1.2);
  gsap.timeline({ scrollTrigger: { trigger: '.building', start: 'top bottom', end: 'bottom bottom', scrub: .6 } })
    .from('.cios-paths svg', { yPercent: 12, scale: 1.08, duration: .7 }, 0)
    .from('.cios-paths span', { y: 50, opacity: 0, stagger: .08, duration: .4 }, .25)
    .to('.cios-paths svg', { xPercent: -5, duration: .5 }, .7);
  return restore;
});
motion.addEventListener('change', () => { if (motion.matches) videoState(true) });
function settleInitialPosition() {
  ScrollTrigger.refresh();
  requestAnimationFrame(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
      ScrollTrigger.update();
    }
    updateHeader();
  });
}
if (document.readyState === 'complete') settleInitialPosition();
else window.addEventListener('load', settleInitialPosition, { once: true });

// Keep the genuine embedded interface fitted to the expanding window.
const portal = document.querySelector<HTMLElement>('.portal-preview');
const preview = document.querySelector<HTMLIFrameElement>('.portal-preview iframe');
if (portal && preview) {
  const fit = new ResizeObserver(([entry]) => {
    if (!entry || !entry.contentRect.width) return;
    const scale = Math.max(entry.contentRect.width / 1280, window.innerWidth < 600 ? .55 : .65);
    preview.style.transform = `scale(${scale})`;
    preview.style.height = `${Math.max(860, entry.contentRect.height / scale)}px`;
  });
  fit.observe(portal);
}
// Escape returns an opened underneath surface to its chapter.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || scan?.open) return;
  const detail = document.activeElement?.closest<HTMLDetailsElement>('details[open]');
  if (detail) { detail.open = false; detail.querySelector('summary')?.focus(); }
});

