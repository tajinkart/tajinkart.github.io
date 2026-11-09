/**
 * TAJINKART - Gallery, Lightbox & Artwork Detail Module
 */
window.renderShowcaseGrid = function() {
  const grid = document.getElementById('showcaseGrid');
  if (!grid) return;

  const filteredArtworks = (typeof currentGalleryFilter !== 'undefined' && currentGalleryFilter && currentGalleryFilter !== 'all')
    ? showcaseArtworks.filter(a => a.category === currentGalleryFilter || (a.pipeline && a.pipeline.includes(currentGalleryFilter)))
    : showcaseArtworks;

  grid.innerHTML = '';
  filteredArtworks.forEach((art, index) => {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.onclick = () => openArtModal(art.id);

    const aspectClass = art.aspect || 'aspect-4-5';
    card.innerHTML = `
      <div class="artwork-img-box ${aspectClass}">
        <img src="${art.image}" alt="${art.title}" loading="lazy" />
        <div class="artwork-hover-overlay">
          <span class="artwork-hover-title font-brand">${art.title}</span>
          <span class="artwork-hover-cat font-mono">${art.category || 'Concept Art'}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
};

window.openArtModal = function(artId) {
  const art = showcaseArtworks.find(a => a.id === artId);
  if (!art) return;

  const modal = document.getElementById('artDetailModal');
  const modalImg = document.getElementById('modalMediaImg');
  const modalTitle = document.getElementById('artDetailTitle');
  const modalDesc = document.getElementById('artDetailDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalTimeline = document.getElementById('modalTimeline');

  if (modalTitle) modalTitle.textContent = art.title || '';
  if (modalDesc) modalDesc.textContent = art.desc || art.description || '';
  if (modalPrice) modalPrice.textContent = art.price ? `$${art.price}` : 'Commission Inquiry';
  if (modalTimeline) modalTimeline.textContent = art.timeline || '2-3 Weeks';
  if (modalImg) {
    modalImg.src = art.image || '';
    modalImg.onclick = () => openCenteredMagnifier(art.image, art.title);
  }

  if (modal) modal.style.display = 'flex';
};

window.closeArtModal = function() {
  const modal = document.getElementById('artDetailModal');
  if (modal) modal.style.display = 'none';
};
window.closeArtModalDirect = window.closeArtModal;

window.openCenteredMagnifier = function(imgSrc, title) {
  const overlay = document.getElementById('centeredFocusMagnifierOverlay');
  const img = document.getElementById('magnifierActiveImg');
  const titleEl = document.getElementById('magnifierPhaseTitle');
  if (img) img.src = imgSrc;
  if (titleEl) titleEl.textContent = title || '';
  if (overlay) overlay.style.display = 'flex';
};

window.closeCenteredMagnifier = function() {
  const overlay = document.getElementById('centeredFocusMagnifierOverlay');
  if (overlay) overlay.style.display = 'none';
};
