const dialog=document.querySelector('#lightbox');
const image=document.querySelector('#lightbox-image');
const caption=document.querySelector('#lightbox-caption');
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{image.src=button.dataset.photo;image.alt=button.querySelector('img').alt;caption.textContent=button.dataset.caption;dialog.showModal();}));
document.querySelector('#close-photo').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
