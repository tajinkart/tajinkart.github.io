/**
 * TAJINKART - Navigation, Dock & View Switcher Module
 */
window.switchView = function(viewKey) {
  const allViews = [
    'showcase', 'store', 'genesis', 'academy', 'society', 
    'admin', 'member-dashboard'
  ];
  
  allViews.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('hidden');
  });

  const targetView = document.getElementById(`view-${viewKey}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // مدیریت دیده‌شدن نشانگر بازگشت به خانه در داک
  const homeBtn = document.getElementById('rightDockHomeBtn');
  if (homeBtn) {
    if (viewKey === 'showcase') {
      homeBtn.classList.add('hidden');
    } else {
      homeBtn.classList.remove('hidden');
    }
  }

  // بستن منوهای باز
  if (typeof closeDockMobile === 'function') closeDockMobile();
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper) storeWrapper.classList.remove('active');
};

window.toggleDockExpand = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    const isCurrentlyOpen = dock.classList.contains('dock-open');
    if (isCurrentlyOpen) {
      dock.classList.remove('dock-open');
      dock.classList.add('dock-collapsed');
    } else {
      dock.classList.add('dock-open');
      dock.classList.remove('dock-collapsed');
    }
  }
};

window.closeDockMobile = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    dock.classList.remove('dock-open');
    dock.classList.add('dock-collapsed');
  }
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper) storeWrapper.classList.remove('active');
};

window.toggleStoreDockInPlace = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const wrapper = document.getElementById('dockStoreDropdownWrapper');
  if (wrapper) {
    wrapper.classList.toggle('active');
  }
};
window.toggleStoreDockSubmenu = window.toggleStoreDockInPlace;

window.navigateToStorePane = function(paneKey, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  switchView('store');
  if (typeof switchStoreTab === 'function') {
    switchStoreTab(paneKey);
  }
  const wrapper = document.getElementById('dockStoreDropdownWrapper');
  if (wrapper) wrapper.classList.remove('active');
  
  const title = document.getElementById('storeSectionMainTitle');
  if (title) {
    title.textContent = (paneKey === 'products') ? 'Official Digital Assets & Studio Vault' : 'Concept Art & Visual Development Atelier';
  }
};

window.toggleCategoryFilterMenu = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
};

// بستن هوشمند دراور و زیرمنوها با کلیک روی هر نقطه دیگر صفحه
document.addEventListener('click', (e) => {
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper && !storeWrapper.contains(e.target)) {
    storeWrapper.classList.remove('active');
  }
  const dock = document.getElementById('rightVerticalNav');
  if (dock && !dock.contains(e.target) && window.innerWidth <= 768) {
    dock.classList.remove('dock-open');
    dock.classList.add('dock-collapsed');
  }
  const catDropdown = document.getElementById('categoryFilterDropdown');
  const catBtn = document.getElementById('currentCategoryPillBtn');
  if (catDropdown && catBtn && !catDropdown.contains(e.target) && !catBtn.contains(e.target)) {
    catDropdown.classList.add('hidden');
  }
});
