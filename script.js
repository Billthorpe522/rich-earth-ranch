const dialog = document.querySelector('#lightbox');
const image = document.querySelector('#lightbox-image');
const caption = document.querySelector('#lightbox-caption');
const photos = [...document.querySelectorAll('[data-photo]')];
const count = document.querySelector('#photo-count');
let activePhoto = 0;
let opener;
function showPhoto(index) {
  activePhoto = (index + photos.length) % photos.length;
  const photo = photos[activePhoto];
  image.src = photo.dataset.photo;
  image.alt = photo.querySelector('img').alt;
  caption.textContent = photo.dataset.caption;
  count.textContent = `${activePhoto + 1} / ${photos.length}`;
}
photos.forEach((button, index) => button.addEventListener('click', () => {
  opener = button;
  showPhoto(index);
  dialog.showModal();
  document.body.classList.add('photo-open');
}));
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
