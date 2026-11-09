/**
 * TAJINKART - Grand Hero & Slogans Module
 */
let brandMorphInterval = null;
let currentBrandPairIdx = 0;

window.loadBrandSlogansFromStorage = function() {
  try {
    const customPairs = safeGetStorage('tajinkart_brand_pairs');
    if (customPairs) {
      const parsed = JSON.parse(customPairs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        BRAND_SIGNATURE_PAIRS = parsed;
      }
    }
    const customTitle = safeGetStorage('tajinkart_brand_title');
    if (customTitle) {
      const titleEl = document.getElementById('brandMorphTitle');
      if (titleEl) titleEl.textContent = customTitle;
    }
    const customGenre = safeGetStorage('tajinkart_brand_genre');
    if (customGenre) {
      const genreEl = document.getElementById('brandGenreBar');
      if (genreEl) genreEl.textContent = customGenre;
    }
  } catch(e) {}
};

window.initDynamicBrandHeader = function() {
  const titleEl = document.getElementById('brandMorphTitle');
  const subEl = document.getElementById('brandMorphSub');
  if (!titleEl || !subEl) return;
  
  if (brandMorphInterval) clearInterval(brandMorphInterval);
  
  brandMorphInterval = setInterval(() => {
    if (!BRAND_SIGNATURE_PAIRS || BRAND_SIGNATURE_PAIRS.length === 0) return;
    currentBrandPairIdx = (currentBrandPairIdx + 1) % BRAND_SIGNATURE_PAIRS.length;
    const nextPair = BRAND_SIGNATURE_PAIRS[currentBrandPairIdx];
    
    titleEl.classList.add('fading');
    subEl.classList.add('fading');
    
    setTimeout(() => {
      // اگر کاربر عنوان ثابت تعریف کرده باشد، آن را حفظ می‌کند، در غیر این صورت چرخشی
      const customTitle = safeGetStorage('tajinkart_brand_title');
      titleEl.textContent = customTitle || nextPair.title || 'TAJINKART';
      subEl.textContent = nextPair.sub || 'FROM INK TO UNIVERSE';
      titleEl.classList.remove('fading');
      subEl.classList.remove('fading');
    }, 450);
  }, 4800);
};

window.updateStudioLogoDisplay = function() {
  try {
    const logoUrl = siteSettings.studioLogoUrl || '';
    const headerContainer = document.getElementById('brandCrestContainer');
    const headerImg = document.getElementById('brandCrestImg');
    if (headerContainer && headerImg) {
      if (logoUrl) {
        headerImg.src = logoUrl;
        headerContainer.style.display = 'block';
      } else {
        headerContainer.style.display = 'none';
      }
    }
  } catch(e) {}
};
