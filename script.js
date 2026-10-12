// Navigation stays usable without JavaScript; enhancement adds the compact menu.
const header = document.querySelector('.header');
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const compactNavigation = matchMedia('(max-width: 900px)');
header.classList.add('has-menu');
menuToggle.hidden = false;
function closeMenu(returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(opening));
  navigation.classList.toggle('is-open', opening);
});
navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  if (compactNavigation.matches) {
    const target = document.querySelector(link.hash);
    target?.setAttribute('tabindex', '-1');
    target?.focus({preventScroll: true});
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!siteHeader.contains(event.target)) closeMenu();
});
compactNavigation.addEventListener('change', () => closeMenu());

// One light scroll update per frame: section cue, header edge, and reading line.
const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const navSections = navLinks.map(link => document.querySelector(link.hash));
const progress = document.querySelector('.reading-progress');
let scrollQueued = false;
function updateScroll() {
  const scrollTop = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${scrollRange > 0 ? Math.min(1, scrollTop / scrollRange) : 0})`;
  siteHeader.classList.toggle('is-scrolled', scrollTop > 20);
  let current = -1;
  navSections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= 160) current = index;
  });
  navLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
function queueScroll() {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}
window.addEventListener('scroll', queueScroll, {passive: true});
window.addEventListener('resize', queueScroll);
window.addEventListener('load', queueScroll);
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', queueScroll));
updateScroll();

// Animate only when entering a desktop viewport. Content is always visible
// before enhancement, on touch screens, and when reduced motion is requested.
const desktopMotion = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const entranceAnimations = new Set();
if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      if (!desktopMotion.matches) return;
      const animation = entry.target.animate([
        {opacity: .25, transform: 'translateY(18px)'},
        {opacity: 1, transform: 'translateY(0)'}
      ], {duration: 650, easing: 'cubic-bezier(.2,.65,.3,1)'});
      entranceAnimations.add(animation);
      animation.onfinish = () => entranceAnimations.delete(animation);
    });
  }, {threshold: .12});
  document.querySelectorAll('.story>div,.pork-grid>*,.buying-steps li,.section-heading,.gallery figure,.journal,.visiting>div,.contact-grid>div').forEach(element => reveal.observe(element));
  desktopMotion.addEventListener('change', () => {
    if (!desktopMotion.matches) {
      entranceAnimations.forEach(animation => animation.cancel());
      entranceAnimations.clear();
    }
  });
}

const dialog = document.querySelector('#lightbox');
const image = document.querySelector('#lightbox-image');
const caption = document.querySelector('#lightbox-caption');
const photoButtons = [...document.querySelectorAll('[data-photo]')];
const photos = photoButtons.map(button => ({
  src: button.dataset.photo,
  alt: button.querySelector('img').alt,
  caption: button.dataset.caption
})).concat(JSON.parse(document.querySelector('#gallery-extras').textContent));
const count = document.querySelector('#photo-count');
let activePhoto = 0;
let opener;
function showPhoto(index) {
  activePhoto = (index + photos.length) % photos.length;
  const photo = photos[activePhoto];
  image.src = photo.src;
  image.alt = photo.alt;
  caption.textContent = photo.caption;
  count.textContent = `${activePhoto + 1} / ${photos.length}`;
}
function openGallery(button, index) {
  opener = button;
  showPhoto(index);
  dialog.showModal();
  document.body.classList.add('photo-open');
}
photoButtons.forEach((button, index) => button.addEventListener('click', () => openGallery(button, index)));
const viewAllPhotos = document.querySelector('.gallery-view-all');
viewAllPhotos.hidden = false;
viewAllPhotos.addEventListener('click', () => openGallery(viewAllPhotos, 0));
document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(activePhoto - 1));
document.querySelector('#next-photo').addEventListener('click', () => showPhoto(activePhoto + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showPhoto(activePhoto + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('photo-open');
  opener?.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
