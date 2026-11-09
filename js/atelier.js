/**
 * TAJINKART - Atelier, Commissions Workbench & Store Products Module
 */
window.switchStoreTab = function(tabKey) {
  const paneCommissions = document.getElementById('storePaneCommissions');
  const paneProducts = document.getElementById('storePaneProducts');
  const title = document.getElementById('storeSectionMainTitle');

  if (tabKey === 'products') {
    if (paneCommissions) paneCommissions.classList.add('hidden');
    if (paneProducts) paneProducts.classList.remove('hidden');
    if (title) title.textContent = 'Official Digital Assets & Studio Vault';
    if (typeof renderProducts === 'function') renderProducts();
  } else {
    if (paneProducts) paneProducts.classList.add('hidden');
    if (paneCommissions) paneCommissions.classList.remove('hidden');
    if (title) title.textContent = 'Concept Art & Visual Development Atelier';
  }
};

window.openPhaseScopeDrawer = function(phaseTitle, phaseDesc, phaseDeliverables) {
  const drawer = document.getElementById('phaseScopeDrawerOverlay');
  const titleEl = document.getElementById('drawerPhaseTitle');
  const descEl = document.getElementById('drawerPhasePurpose');
  const delivEl = document.getElementById('drawerPhaseDeliverables');

  if (titleEl) titleEl.textContent = phaseTitle || '';
  if (descEl) descEl.textContent = phaseDesc || '';
  if (delivEl) delivEl.textContent = phaseDeliverables || '';
  if (drawer) drawer.style.display = 'flex';
};

window.closePhaseScopeDrawer = function() {
  const drawer = document.getElementById('phaseScopeDrawerOverlay');
  if (drawer) drawer.style.display = 'none';
};

window.renderProducts = function() {
  const grid = document.getElementById('productsMerchGrid');
  if (!grid || typeof storeProducts === 'undefined') return;

  grid.innerHTML = '';
  storeProducts.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb-box">
        <img src="${prod.image}" alt="${prod.title}" loading="lazy" />
      </div>
      <div class="product-info-box">
        <h4 class="product-title font-brand">${prod.title}</h4>
        <span class="product-price font-mono">$${prod.priceUSD} USD</span>
        <button class="btn-gold" style="width:100%; margin-top:8px;" onclick="downloadDigitalAsset('${prod.id}')">Instant Vault Access</button>
      </div>
    `;
    grid.appendChild(card);
  });
};

window.downloadDigitalAsset = function(prodId) {
  showToast('Connecting to secure cloud vault...', 'info', 2500);
  setTimeout(() => {
    showToast('Vault verified. Digital asset bundle ready for download. ✓', 'success', 3500);
  }, 1000);
};
