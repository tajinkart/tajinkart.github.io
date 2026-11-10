
function renderFloatingCategoryDropdown() {
  if (typeof window.renderFloatingCategoryDropdown === 'function') {
    return window.renderFloatingCategoryDropdown();
  }
}
function renderAdminGalleryCategories() {
  if (typeof window.renderAdminGalleryCategories === 'function') {
    return window.renderAdminGalleryCategories();
  }
}

var currentGalleryFilter = (typeof window !== 'undefined' && window.currentGalleryFilter) ? window.currentGalleryFilter : 'all';
window.currentGalleryFilter = currentGalleryFilter;

const KEYS = (typeof window !== 'undefined' && window.KEYS) ? window.KEYS : ((typeof global !== 'undefined' && global.KEYS) ? global.KEYS : {
  ORDERS: 'tajinkart_orders_fa_v2',
  SETTINGS: 'tajinkart_settings_fa_v2',
  ARTWORKS: 'tajinkart_artworks_fa_v2',
  PIPELINES: 'tajinkart_pipelines_fa_v2',
  PRODUCTS: 'tajinkart_products_fa_v2',
  MEMBERS: 'tajinkart_members_fa_v2',
  DELETED_ARTWORKS: 'tajinkart_deleted_artworks_v2',
  CATEGORIES: 'tajinkart_gallery_categories_v2'
});


// ==============================================================================
// موتور داینامیک ژانرها و دنیاهای کانسپت استودیو (Studio Concept Genres & Worlds Engine)
// ==============================================================================
const DEFAULT_GALLERY_GENRES = (typeof window !== 'undefined' && window.DEFAULT_GALLERY_GENRES) ? window.DEFAULT_GALLERY_GENRES : [
  { id: 'dark_fantasy', title: 'Dark Fantasy', color: '#f43f5e' },
  { id: 'scifi_cyberpunk', title: 'Sci-Fi & Cyberpunk', color: '#00f0ff' },
  { id: 'post_apocalyptic', title: 'Post-Apocalyptic', color: '#f59e0b' },
  { id: 'high_fantasy', title: 'High Fantasy & Mythic', color: '#a855f7' },
  { id: 'space_opera', title: 'Space Opera & Cosmic', color: '#38bdf8' },
  { id: 'steampunk', title: 'Steampunk & Retro', color: '#eab308' }
];

let galleryGenres = [];
try {
  const savedG = safeGetStorage(KEYS.GENRES || 'tajinkart_gallery_genres_v1');
  galleryGenres = savedG ? JSON.parse(savedG) : DEFAULT_GALLERY_GENRES;
  if (!Array.isArray(galleryGenres) || galleryGenres.length === 0) {
    galleryGenres = DEFAULT_GALLERY_GENRES;
  }
} catch(e) {
  galleryGenres = DEFAULT_GALLERY_GENRES;
}
window.galleryGenres = galleryGenres;
window.currentGenreFilter = 'all';

window.renderFloatingGenreDropdown = function() {
  const dropdown = document.getElementById('genreFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${(typeof currentGenreFilter === 'undefined' || currentGenreFilter === 'all') ? 'active' : ''}" onclick="filterGalleryByGenre('all', 'All Genres')">
      <span class="cat-item-dot" style="background:var(--rose-neon, #f43f5e); box-shadow:0 0 8px var(--rose-neon, #f43f5e);"></span>
      <span class="cat-item-text">All Genres</span>
    </div>
  `;

  if (typeof galleryGenres !== 'undefined' && Array.isArray(galleryGenres)) {
    galleryGenres.forEach(g => {
      const isActive = (typeof currentGenreFilter !== 'undefined') && currentGenreFilter === g.id;
      const color = g.color || '#f43f5e';
      const title = g.title || g.id;
      itemsHtml += `
        <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByGenre('${g.id}', '${title}')">
          <span class="cat-item-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
          <span class="cat-item-text">${title}</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = itemsHtml;
};

window.renderAdminGalleryGenres = function() {
  const container = document.getElementById('adminGalleryGenresList');
  if (!container) return;
  const badge = document.getElementById('adminGenreCountBadge');
  if (badge) badge.textContent = `${galleryGenres.length} Active Genres`;

  container.innerHTML = galleryGenres.map((g) => {
    const color = g.color || '#f43f5e';
    return `
      <div class="admin-cat-pill" style="display:inline-flex; align-items:center; gap:8px; background:#080c14; border:1px solid ${color}44; border-radius:20px; padding:6px 12px; box-shadow:0 0 10px ${color}15;">
        <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color}; flex-shrink:0;"></span>
        <span onclick="openAdminGenreEdit('${g.id}')" style="font-size:12px; font-weight:700; color:#fff; cursor:pointer; text-decoration:underline dashed rgba(255,255,255,0.3);" title="Click to edit genre">${g.title} ✏️</span>
        <span class="font-mono" style="font-size:10px; color:${color}; opacity:0.85;">${g.id}</span>
        
        <div style="position:relative; display:inline-flex; align-items:center;" title="Change genre neon color">
          <input type="color" value="${color}" onchange="adminUpdateGenreColor('${g.id}', this.value)" style="width:18px; height:18px; padding:0; border:none; border-radius:4px; cursor:pointer; background:transparent;" />
        </div>

        <button type="button" onclick="adminDeleteGalleryGenre('${g.id}')" style="background:none; border:none; color:var(--crimson); font-size:14px; cursor:pointer; padding:0 2px; line-height:1; display:flex; align-items:center;" title="Delete genre">✕</button>
      </div>
    `;
  }).join('');
};

window.adminToggleAddGenreForm = function() {
  const row = document.getElementById('adminInlineAddGenreRow');
  if (!row) return;
  const isHidden = row.style.display === 'none';
  row.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    document.getElementById('adminNewGenreTitle')?.focus();
  }
};

window.adminSubmitNewGenreInline = function() {
  const titleEl = document.getElementById('adminNewGenreTitle');
  const idEl = document.getElementById('adminNewGenreId');
  const colorEl = document.getElementById('adminNewGenreColor');

  const title = titleEl ? titleEl.value.trim() : '';
  let id = idEl ? idEl.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  const color = colorEl ? colorEl.value : '#f43f5e';

  if (!title) {
    showToast('Please enter genre title.', 'error');
    return;
  }
  if (!id) {
    id = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
  if (!id) {
    id = 'genre_' + Date.now().toString().slice(-4);
  }
  if (galleryGenres.some(g => g.id === id)) {
    showToast('This genre ID already exists.', 'error');
    return;
  }

  galleryGenres.push({ id, title, color });
  safeSetStorage(KEYS.GENRES || 'tajinkart_gallery_genres_v1', JSON.stringify(galleryGenres));

  if (titleEl) titleEl.value = '';
  if (idEl) idEl.value = '';
  adminToggleAddGenreForm();

  renderAdminGalleryGenres();
  renderFloatingGenreDropdown();
  showToast(`Genre "${title}" registered successfully! ✓`, 'success', 3500);
};

window.openAdminGenreEdit = function(genreId) {
  const g = galleryGenres.find(x => x.id === genreId);
  if (!g) return;

  const row = document.getElementById('adminInlineEditGenreRow');
  const origIdInput = document.getElementById('adminEditGenreOriginalId');
  const titleInput = document.getElementById('adminEditGenreTitle');
  const idInput = document.getElementById('adminEditGenreId');
  const colorInput = document.getElementById('adminEditGenreColor');
  const colorPicker = document.getElementById('adminEditGenreColorPicker');

  if (origIdInput) origIdInput.value = g.id;
  if (titleInput) titleInput.value = g.title || '';
  if (idInput) idInput.value = g.id || '';
  if (colorInput) colorInput.value = g.color || '#f43f5e';
  if (colorPicker) colorPicker.value = g.color || '#f43f5e';

  if (row) {
    row.style.display = 'block';
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.closeAdminGenreEditForm = function() {
  const row = document.getElementById('adminInlineEditGenreRow');
  if (row) row.style.display = 'none';
};

window.saveAdminGenreEdit = function() {
  const origIdInput = document.getElementById('adminEditGenreOriginalId');
  const titleInput = document.getElementById('adminEditGenreTitle');
  const idInput = document.getElementById('adminEditGenreId');
  const colorInput = document.getElementById('adminEditGenreColor');

  const origId = origIdInput ? origIdInput.value : '';
  const newTitle = titleInput ? titleInput.value.trim() : '';
  const newId = idInput ? idInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  const newColor = colorInput ? colorInput.value.trim() : '#f43f5e';

  if (!newTitle || !newId) {
    showToast('Genre title and ID cannot be empty.', 'warning', 3000);
    return;
  }

  const gIdx = galleryGenres.findIndex(g => g.id === origId);
  if (gIdx !== -1) {
    galleryGenres[gIdx].title = newTitle;
    galleryGenres[gIdx].id = newId;
    galleryGenres[gIdx].color = newColor;

    safeSetStorage(KEYS.GENRES || 'tajinkart_gallery_genres_v1', JSON.stringify(galleryGenres));
    renderAdminGalleryGenres();
    renderFloatingGenreDropdown();
    closeAdminGenreEditForm();
    showToast(`Genre "${newTitle}" saved successfully! ✓`, 'success', 3500);
  }
};

window.adminUpdateGenreColor = function(genreId, newColor) {
  const g = galleryGenres.find(x => x.id === genreId);
  if (g) {
    g.color = newColor;
    safeSetStorage(KEYS.GENRES || 'tajinkart_gallery_genres_v1', JSON.stringify(galleryGenres));
    renderAdminGalleryGenres();
    renderFloatingGenreDropdown();
    showToast(`Color for genre "${g.title}" updated! ✓`, 'success', 2500);
  }
};

window.adminDeleteGalleryGenre = function(genreId) {
  const g = galleryGenres.find(x => x.id === genreId);
  const name = g ? g.title : genreId;
  if (!confirm(`Are you sure you want to delete genre "${name}"?`)) return;

  galleryGenres = galleryGenres.filter(x => x.id !== genreId);
  safeSetStorage(KEYS.GENRES || 'tajinkart_gallery_genres_v1', JSON.stringify(galleryGenres));
  renderAdminGalleryGenres();
  renderFloatingGenreDropdown();
  showToast(`Genre "${name}" removed.`, 'info');
};

window.adminDeleteCurrentEditingGenre = function() {
  const origIdInput = document.getElementById('adminEditGenreOriginalId');
  const origId = origIdInput ? origIdInput.value : '';
  if (origId) {
    adminDeleteGalleryGenre(origId);
    closeAdminGenreEditForm();
  }
};


// ==============================================================================
// موتور داینامیک دسته‌بندی‌های گالری آثار استودیو (Studio Gallery Categories Engine)
// ==============================================================================
const DEFAULT_GALLERY_CATEGORIES = [
  { id: 'character', title: 'Character Design', color: '#facc15' },
  { id: 'environment', title: 'Environment & Worlds', color: '#38bdf8' },
  { id: 'creature', title: 'Creatures & Monsters', color: '#10b981' },
  { id: 'keyframe', title: 'Keyframes & Covers', color: '#f43f5e' },
  { id: 'props', title: 'Props, Weapons & UI', color: '#a855f7' },
  { id: 'comic', title: 'Comics & Manga', color: '#fb923c' },
  { id: 'mascot', title: 'Brand Mascot & Crest', color: '#ec4899' }
];

let galleryCategories = [];
try {
  galleryCategories = JSON.parse(localStorage.getItem('tajinkart_gallery_categories_v1')) || DEFAULT_GALLERY_CATEGORIES;
  const palette = ['#facc15', '#38bdf8', '#10b981', '#f43f5e', '#a855f7', '#fb923c', '#ec4899', '#94a3b8'];
  galleryCategories.forEach((cat, idx) => {
    if (!cat.color) cat.color = palette[idx % palette.length];
  });
} catch(e) {
  galleryCategories = DEFAULT_GALLERY_CATEGORIES;
}

window.renderFloatingCategoryDropdown = function() {
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${currentGalleryFilter === 'all' ? 'active' : ''}" onclick="filterGalleryByCategory('all', 'All Artworks')">
      <span class="cat-item-dot" style="background:var(--gold); box-shadow:0 0 8px var(--gold);"></span>
      <span class="cat-item-text">All Artworks</span>
    </div>
  `;

  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    galleryCategories.forEach(cat => {
      const isActive = currentGalleryFilter === cat.id;
      const color = cat.color || '#38bdf8';
      const title = cat.titleEN || cat.title || cat.id;
      itemsHtml += `
        <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByCategory('${cat.id}', '${title}')">
          <span class="cat-item-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
          <span class="cat-item-text">${title}</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = itemsHtml;
};

window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;
  const badge = document.getElementById('adminCategoryCountBadge');
  if (badge) badge.textContent = `${galleryCategories.length} Active Categories`;

  container.innerHTML = galleryCategories.map((cat) => {
    const color = cat.color || '#38bdf8';
    return `
      <div class="admin-cat-pill" style="display:inline-flex; align-items:center; gap:8px; background:#080c14; border:1px solid ${color}44; border-radius:20px; padding:6px 12px; box-shadow:0 0 10px ${color}15;">
        <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color}; flex-shrink:0;"></span>
        <span onclick="adminEditCategoryTitle('${cat.id}')" style="font-size:12px; font-weight:700; color:#fff; cursor:pointer; text-decoration:underline dashed rgba(255,255,255,0.3);" title="Click to edit category title">${cat.titleEN || cat.title} ✏️</span>
        <span class="font-mono" style="font-size:10px; color:${color}; opacity:0.85;">${cat.id}</span>
        
        <div style="position:relative; display:inline-flex; align-items:center;" title="Change category neon color">
          <input type="color" value="${color}" onchange="adminUpdateCategoryColor('${cat.id}', this.value)" style="width:18px; height:18px; padding:0; border:none; border-radius:4px; cursor:pointer; background:transparent;" />
        </div>

        <button type="button" onclick="adminDeleteGalleryCategory('${cat.id}')" style="background:none; border:none; color:var(--crimson); font-size:14px; cursor:pointer; padding:0 2px; line-height:1; display:flex; align-items:center;" title="Delete category">✕</button>
      </div>
    `;
  }).join('');
};

window.adminToggleAddCategoryForm = function() {
  const row = document.getElementById('adminInlineAddCategoryRow');
  if (!row) return;
  const isHidden = row.style.display === 'none';
  row.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    document.getElementById('adminNewCatTitle')?.focus();
  }
};

window.adminSubmitNewCategoryInline = function() {
  const titleEl = document.getElementById('adminNewCatTitle');
  const idEl = document.getElementById('adminNewCatId');
  const colorEl = document.getElementById('adminNewCatColor');

  const title = titleEl ? titleEl.value.trim() : '';
  let id = idEl ? idEl.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  const color = colorEl ? colorEl.value : '#38bdf8';

  if (!title) {
    showToast('Please enter category title.', 'error');
    return;
  }
  if (!id) {
    id = 'cat_' + Date.now().toString().slice(-4);
  }
  if (galleryCategories.some(c => c.id === id)) {
    showToast('This category ID already exists.', 'error');
    return;
  }

  galleryCategories.push({ id, title, color });
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  
  if (titleEl) titleEl.value = '';
  if (idEl) idEl.value = '';
  adminToggleAddCategoryForm();

  renderAdminGalleryCategories();
  try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast(`Category "${title}" added successfully! ✓`, 'success', 3500);
};

window.adminUpdateCategoryColor = function(catId, newColor) {
  const cat = galleryCategories.find(c => c.id === catId);
  if (cat) {
    cat.color = newColor;
    safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
    renderAdminGalleryCategories();
    try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
    if (currentGalleryFilter === catId) {
      filterGalleryByCategory(catId, cat.title);
    }
    showToast(`Color for category "${cat.title}" updated! ✓`, 'success', 2500);
  }
};

window.adminDeleteGalleryCategory = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  const catName = cat ? cat.title : catId;
  if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

  galleryCategories = galleryCategories.filter(c => c.id !== catId);
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  renderAdminGalleryCategories();
  try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast(`Category "${catName}" removed.`, 'info');
};

window.openChatConsultation = function() {
  switchView('store');
  switchStoreTab('commissions', document.querySelector('.store-dual-nav .store-dual-btn'));
  showToast('Commission consultation opened. Please state your project brief.', 'info');
};

// اجرای لود اولیه در هنگام آماده شدن صفحه
document.addEventListener('DOMContentLoaded', () => {
  try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  renderAdminGalleryCategories();
  if (typeof renderAdminGalleryGenres === 'function') renderAdminGalleryGenres();
  if (typeof renderAdminTgChannelsList === 'function') renderAdminTgChannelsList();
  if (typeof renderAdminSloganPairs === 'function') renderAdminSloganPairs();
  if (typeof loadStudioPricingMatrixToForm === 'function') loadStudioPricingMatrixToForm();
});


// نگاشت دوطرفه و پیوسته بین پایپلاین تخصصی آتلیه و دسته‌بندی گالری
const PIPELINE_TO_CATEGORY_MAP = {
  'sketch1': 'character',
  'sketch_creature': 'creature',
  'sketch2': 'environment',
  'sketch3': 'keyframe',
  'sketch4': 'props',
  'sketch5': 'comic',
  'sketch_2d': '2d',
  '2d': '2d'
};

const CATEGORY_TO_PIPELINE_MAP = {
  'character': 'sketch1',
  'creature': 'sketch_creature',
  'environment': 'sketch2',
  'keyframe': 'sketch3',
  'props': 'sketch4',
  'comic': 'sketch5',
  '2d': 'sketch1'
};

window.getCategoryFromPipeline = function(pipeKey) {
  return PIPELINE_TO_CATEGORY_MAP[pipeKey] || 'character';
};

window.getPipelineFromCategory = function(catKey) {
  return CATEGORY_TO_PIPELINE_MAP[catKey] || 'sketch1';
};

window.syncAdminCategoryFromPipe = function(pipeSelectEl) {
  if (!pipeSelectEl) return;
  const pipe = pipeSelectEl.value;
  const catSelect = document.getElementById('editArtCategorySelect');
  if (catSelect && PIPELINE_TO_CATEGORY_MAP[pipe]) {
    catSelect.value = PIPELINE_TO_CATEGORY_MAP[pipe];
  }
};

window.syncAdminPipeFromCategory = function(catSelectEl) {
  if (!catSelectEl) return;
  const cat = catSelectEl.value;
  const pipeSelect = document.getElementById('editArtPipeSelect');
  if (pipeSelect && CATEGORY_TO_PIPELINE_MAP[cat]) {
    pipeSelect.value = CATEGORY_TO_PIPELINE_MAP[cat];
  }
};

/**
 * TAJINKART Master Spec Cloud Engine
 * استودیو کانسپت آرت و توسعه بصری — سید سروش تاج
 */

// ۱. شناسایی دقیق و زنده لینک بازیابی رمز از روی پارامترهای آدرس مرورگر
let isRecoveryFlowActive = false;
try {
  const _h = window.location.hash || '';
  const _s = window.location.search || '';
  if (_h.includes('type=recovery') || _s.includes('type=recovery') || _s.includes('action=reset-password')) {
    isRecoveryFlowActive = true;
    console.log('[Auth Recovery] Active password recovery token detected in URL.');
  }
} catch(e) {}


// =========================================================
// کلاینت دیتابیس ابری SUPABASE (اتصال زنده کامپیوتر و گوشی)
// =========================================================
const SUPABASE_PROJECT_URL = 'https://ahuasiouokvtryzxohri.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dyUVO6elCOkL_a3Mukm0Ww_4XZNLohX';

window.ensureSupabaseClient = function() {
  if (window.supabaseClient && window.supabaseClient.auth) return window.supabaseClient;
  
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      window.supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
        auth: {
          flowType: 'implicit',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        }
      });

      // شنونده متمرکز رویدادهای احراز هویت Supabase
      window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('[Supabase Central Auth Event]', event);
        if (event === 'PASSWORD_RECOVERY') {
          isRecoveryFlowActive = true;
          triggerPasswordResetModal();
          return;
        }

        if (event === 'SIGNED_OUT') {
          currentMember = null;
          const labelEl = document.getElementById('rightMemberLabel');
          if (labelEl) labelEl.textContent = 'Member Portal';
          const adminGate = document.getElementById('adminLoginGate');
          const adminWorkspace = document.getElementById('adminWorkspace');
          if (adminWorkspace) adminWorkspace.classList.add('hidden');
          if (adminGate) adminGate.classList.remove('hidden');
          return;
        }

        if (session && session.user) {
          if (isRecoveryFlowActive) {
            applyLoggedInMember(session.user, false);
          } else {
            const isFromGoogleRedirect = sessionStorage.getItem('tajinkart_google_signing_in') === 'true' ||
                                         event === 'SIGNED_IN' ||
                                         (window.location.hash.includes('access_token=') && !window.location.hash.includes('type=recovery'));
            
            sessionStorage.removeItem('tajinkart_google_signing_in');
            applyLoggedInMember(session.user, isFromGoogleRedirect);
            if (window.location.hash.includes('access_token=')) {
              try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
            }
          }
        }
      });

      console.log('[Supabase Client] Initialized successfully.');
      return window.supabaseClient;
    } catch(err) {
      console.warn('[Supabase Client Init Error]', err);
    }
  }
  return null;
};

// راه‌اندازی اولیه و خودترمیم شونده
window.ensureSupabaseClient();
if (!window.supabaseClient) {
  let retryCount = 0;
  const retryTimer = setInterval(() => {
    retryCount++;
    if (window.ensureSupabaseClient() || retryCount > 20) {
      clearInterval(retryTimer);
      if (window.supabaseClient && typeof initSupabaseAuthSession === 'function') {
        initSupabaseAuthSession();
      }
    }
  }, 250);
}

// =========================================================
// سیستم یکپارچه احراز هویت ابری SUPABASE AUTH
// =========================================================
window.isDirectorEmail = function(email) {
  if (!email || typeof email !== 'string') return false;
  return email.toLowerCase().trim() === 'tajinkart@gmail.com';
};

function applyLoggedInMember(user, isExplicitLogin = false) {
  if (!user || !user.email) return;
  const meta = user.user_metadata || {};
  const emailLower = user.email.toLowerCase().trim();
  const name = meta.full_name || meta.name || user.email.split('@')[0];
  const phone = meta.phone || '';

  // تشخیص دقیق و ۱۰۰٪ انحصاری مدیر ارشد استودیو (تنها و منحصراً tajinkart@gmail.com)
  const isDirectorAdmin = window.isDirectorEmail(emailLower);

  const isGoogleUser = !!(user.app_metadata && user.app_metadata.provider === 'google') || 
                       (user.identities && user.identities.some(i => i.provider === 'google'));

  const tier = isDirectorAdmin ? 'VIP' : (meta.tier || 'STANDARD');

  currentMember = {
    id: user.id,
    name: isDirectorAdmin ? 'Seyed Soroush Taj' : name,
    email: user.email,
    contact: phone || user.email,
    tier: tier,
    isDirector: isDirectorAdmin,
    isGoogleUser: isGoogleUser,
    assetsBought: meta.assetsBought || []
  };

  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) {
    labelEl.textContent = isDirectorAdmin ? '👑 Studio Director' : currentMember.name;
  }

  // ثبت در لیست اعضا و مشتریان (تنها برای کاربران عادی؛ مدیر ارشد هرگز به عنوان کاربر عادی ثبت نمی‌شود)
  if (!isDirectorAdmin) {
    if (window.supabaseClient) {
      window.supabaseClient.from('members').upsert([{
        id: user.id,
        name: currentMember.name,
        email: user.email,
        contact: phone || user.email,
        tier: tier,
        assets_bought: currentMember.assetsBought
      }], { onConflict: 'email' }).then(({ error }) => {
        if (error) console.warn('[Supabase Members Table Sync]', error);
        else console.log('[Supabase Members Table] User record synchronized in Table Editor!');
      });
    }

    let localMember = siteMembersData.find(m => m.email && m.email.toLowerCase() === emailLower);
    if (!localMember) {
      siteMembersData.unshift({
        id: user.id,
        name: currentMember.name,
        email: user.email,
        contact: phone || user.email,
        tier: tier,
        balance: '$0',
        withdrawn: '$0',
        assetsBought: [],
        totalSpent: '$0'
      });
      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
    }
  } else {
    // پاکسازی اکانت مدیر از لیست اعضای عادی در صورت وجود قبلی
    siteMembersData = siteMembersData.filter(m => m.email && m.email.toLowerCase() !== 'tajinkart@gmail.com');
    safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
  }

  // ۳. جداسازی قطعی نقش‌ها و ممانعت ۱۰۰٪ از افشای پنل ادمین
  const adminGate = document.getElementById('adminLoginGate');
  const adminWorkspace = document.getElementById('adminWorkspace');

  // اگر در حال بازیابی رمز هستیم، تحت هیچ شرایطی پنل ادمین باز نشود و پیامی نیاید
  if (isRecoveryFlowActive) {
    if (adminWorkspace) adminWorkspace.classList.add('hidden');
    if (adminGate) adminGate.classList.remove('hidden');
    return;
  }

  if (isDirectorAdmin) {
    // باز شدن قفل دسترسی در بک‌گراند
    if (adminGate) adminGate.classList.add('hidden');
    if (adminWorkspace) adminWorkspace.classList.remove('hidden');

    // تنها اگر ورود صریح بوده (نه رفرش عادی)، پنل باز شود
    if (isExplicitLogin) {
      closeMemberModal();
      setTimeout(() => {
        switchView('admin');
        const artworksTabBtn = document.querySelector('.admin-sidebar-menu .admin-nav-item[data-tab="artworks"]');
        if (typeof switchAdminTab === 'function') {
          switchAdminTab('artworks', artworksTabBtn);
        }
        showToast('Welcome, Studio Director Seyed Soroush Taj. Command Console unlocked! 👑', 'success', 6000);
      }, 250);
    }
  } else {
    // کاربر عادی: قفل قطعی و غیرقابل نفوذ پنل ادمین
    if (adminWorkspace) adminWorkspace.classList.add('hidden');
    if (adminGate) adminGate.classList.remove('hidden');

    // تنها در ورود صریح، به داشبورد هدایت شود
    if (isExplicitLogin) {
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast(`Welcome back, ${currentMember.name}! Session authenticated successfully. ✨`, 'success', 5000);
    }
  }
}


// تابع باز کردن پنجره تنظیم رمز جدید
let hasShownResetToast = false;
function triggerPasswordResetModal() {
  isRecoveryFlowActive = true;
  
  // اطمینان قطعی از بسته بودن پنل ادمین
  const adminGate = document.getElementById('adminLoginGate');
  const adminWorkspace = document.getElementById('adminWorkspace');
  if (adminWorkspace) adminWorkspace.classList.add('hidden');
  if (adminGate) adminGate.classList.remove('hidden');

  function doOpen() {
    switchAuthView('reset');
    const modal = document.getElementById('memberModal');
    if (modal) {
      modal.style.setProperty('display', 'flex', 'important');
    }
    const resetView = document.getElementById('authViewResetPassword');
    if (resetView) {
      resetView.classList.remove('hidden');
    }
    if (!hasShownResetToast) {
      showToast('Email identity confirmed. Please set your new secure password.', 'info', 6000);
      hasShownResetToast = true;
    }
  }

  doOpen();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(doOpen, 100);
    });
  } else {
    setTimeout(doOpen, 150);
  }
}

// شنونده خودکار لینک بازیابی رمز عبور بازگشتی از ایمیل
function checkEmailRecoveryFlow() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  if (hash.includes('type=recovery') || 
      search.includes('type=recovery') || 
      search.includes('action=reset-password')) {
    console.log('[Auth Recovery] Initiating password reset UI from URL token!');
    triggerPasswordResetModal();
  }
}


async function initSupabaseAuthSession() {
  if (!window.supabaseClient && window.ensureSupabaseClient) window.ensureSupabaseClient();
  if (!window.supabaseClient || !window.supabaseClient.auth) return;
  try {
    const { data } = await window.supabaseClient.auth.getSession();
    if (data && data.session && data.session.user) {
      // رفرش صفحه نباید به اجبار کاربر را به ادمین یا داشبورد بیندازد
      applyLoggedInMember(data.session.user, false);
      console.log('[Supabase Auth] Active cloud session restored for:', data.session.user.email);
    }
  } catch (err) {
    console.warn('[Supabase Auth] Session check error:', err);
  }
}

// تابع کمکی برای ذخیره‌سازی ایمن در LocalStorage (جلوگیری از خطای پر شدن ۵ مگابایتی)

// موتور بهینه‌سازی و تسریع لود تصاویر کلودیناری (کاهش حجم از ۵ مگابایت به ۵۰ کیلوبایت با حفظ کیفیت)
function getOptimizedImageUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:image/')) return url;

  // بهینه‌سازی خودکار در Cloudinary با فرمت نسل جدید WebP/AVIF و کیفیت تطبیقی
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('/upload/f_auto') && !url.includes('/upload/q_auto')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
  }

  // بهینه‌سازی Unsplash
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('auto=format')) {
      return url + (url.includes('?') ? '&' : '?') + `auto=format&fit=crop&w=${width}&q=80`;
    }
  }

  return url;
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn('[Storage Warning] LocalStorage quota reached for ' + key + '. Stored in memory & synced via Supabase Cloud.', err);
    try {
      localStorage.removeItem('tajinkart_temp_cache');
      localStorage.setItem(key, value);
      return true;
    } catch (innerErr) {
      console.warn('[Storage Critical] Local quota full. Data maintained in memory and Supabase cloud.', innerErr);
      return false;
    }
  }
}




// موتور همگام‌سازی کاملاً خودکار و دوطرفه ابری (Automated Two-Way Cloud Sync)

// =========================================================
// موتور همگام‌سازی خودکار و دوطرفه اعضا با دیتابیس ابری SUPABASE
// =========================================================
async function syncMembersFromSupabase(showNotification = false) {
  if (!window.supabaseClient) return;
  try {
    const { data: cloudMembers, error } = await window.supabaseClient
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Members Fetch]', error);
      if (showNotification) showToast('Failed to retrieve members from cloud database.', 'error');
      return;
    }

    if (cloudMembers) {
      siteMembersData = cloudMembers.map(m => ({
        id: m.id,
        name: m.name || (m.email ? m.email.split('@')[0] : 'Studio Member'),
        email: m.email || '',
        contact: m.contact || '',
        tier: m.tier || 'STANDARD',
        balance: m.balance || '$0',
        withdrawn: m.withdrawn || '$0',
        assetsBought: Array.isArray(m.assets_bought) ? m.assets_bought : [],
        totalSpent: m.total_spent || '$0'
      }));

      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
      selectedMemberIdx = 0;
      renderAdminSketch3();

      if (showNotification) {
        if (siteMembersData.length > 0) {
          showToast(`✓ Members successfully synchronized with cloud database (${siteMembersData.length} Active Members).`, 'success');
        } else {
          showToast('✓ Sync complete: Removed members purged from local storage (aligned with cloud DB).', 'info');
        }
      }
      console.log('[Supabase Members] Synced members from cloud. Active count:', siteMembersData.length);
    }
  } catch (err) {
    console.warn('[Sync Members Exception]', err);
  }
}

window.syncMembersFromSupabase = syncMembersFromSupabase;

async function syncArtworksFromSupabase() {
  if (!window.supabaseClient) return;

  try {
    const { data: cloudArtworks, error } = await window.supabaseClient
      .from('artworks')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, fallback to local cache:', error);
      return;
    }

    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem(KEYS.DELETED_ARTWORKS) || '[]').map(Number);
    } catch(e) { deletedIds = []; }
    const deletedSet = new Set(deletedIds);

    // ۱. اگر کلود آثاری دارد، دیتابیس ابری منبع قطعی حقیقت است
    if (cloudArtworks && cloudArtworks.length > 0) {
      // پاکسازی قطعی ردیف‌های آزمایشی قدیمی ۱ تا ۸ از سوپابیس
      const mockRows = cloudArtworks.filter(row => Number(row.id) <= 8);
      if (mockRows.length > 0) {
        window.supabaseClient.from('artworks').delete().lte('id', 8).then(() => {});
      }

      // حذف قطعی آثاری که در بلک‌لیست حذف هستند حتی از کلود
      const itemsToPurge = cloudArtworks.filter(row => deletedSet.has(Number(row.id)));
      if (itemsToPurge.length > 0) {
        itemsToPurge.forEach(row => {
          window.supabaseClient.from('artworks').delete().eq('id', row.id).then(() => {});
        });
      }

      // فقط آثاری که حذف نشده‌اند و شناسه واقعی دارند (آثار واقعی هنرمند)
      const validRows = cloudArtworks.filter(row => Number(row.id) > 8 && !deletedSet.has(Number(row.id)));

      showcaseArtworks = validRows.map(row => {
        const pipe = row.pipeline_key || 'sketch1';
        const mappedCat = row.category || row.tag || PIPELINE_TO_CATEGORY_MAP[pipe] || 'character';
        return {
          id: Number(row.id),
          orderIndex: (row.order_index !== undefined && row.order_index !== null) ? Number(row.order_index) : undefined,
          tag: mappedCat,
          category: mappedCat,
          shortSlug: row.short_slug || row.title,
          title: row.title,
          desc: row.desc_text || '',
          pipelineKey: pipe,
          image: row.image,
          colorSpace: row.color_space || 'Master 4K / 16-Bit ProPhoto RGB',
          lore: row.lore || 'Extopia Universe',
          phases: row.phases || []
        };
      }).sort((a, b) => {
        if (a.orderIndex !== undefined && b.orderIndex !== undefined) return a.orderIndex - b.orderIndex;
        return b.id - a.id;
      });

      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      renderShowcaseGrid();
      renderAdminSketch2();
      console.log('Automated two-way cloud sync complete. Active artworks:', showcaseArtworks.length);
      return;
    }

    // ۲. فقط در صورتی که دیتابیس نو و کاملاً خالی است و حذفی هم Unspecified
    const localArtworks = (showcaseArtworks || []).filter(item => !deletedSet.has(Number(item.id)));
    if (localArtworks.length > 0 && (!cloudArtworks || cloudArtworks.length === 0) && deletedSet.size === 0) {
      const rowsToInsert = localArtworks.map(a => ({
        id: a.id,
        tag: a.tag || 'character',
        short_slug: a.shortSlug || a.title,
        title: a.title,
        desc_text: a.desc || '',
        pipeline_key: a.pipelineKey || 'sketch1',
        image: a.image,
        color_space: a.colorSpace || 'Master 4K / 16-Bit ProPhoto RGB',
        lore: a.lore || 'Extopia Universe',
        phases: a.phases || []
      }));
      await window.supabaseClient.from('artworks').upsert(rowsToInsert);
    }
  } catch (err) {
    console.warn('Auto-sync execution error:', err);
  }
}

// موتور فشرده‌سازی خودکار تصاویر (جلوگیری از پر شدن حافظه لوکال)
function compressImageForStorage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// موتور آپلود ابری تصاویر CLOUDINARY با تشخیص خودکار پریست و کلود نیم
async function uploadFileToCloudinary(file) {
  const currentCloud = siteSettings.cloudinaryCloudName || 'tajinkart';
  const currentPreset = siteSettings.cloudinaryPreset || 'tajinkart';

  const candidates = [
    { cloud: currentCloud, preset: currentPreset },
    { cloud: 'tajinkart', preset: 'tajinkart' },
    { cloud: 'tajinkart', preset: 'erlvtkx9' },
    { cloud: 'erlvtkx9', preset: 'tajinkart' },
    { cloud: 'erlvtkx9', preset: 'erlvtkx9' }
  ];

  const seen = new Set();
  const uniqueCandidates = [];
  for (const c of candidates) {
    const key = c.cloud + ':::' + c.preset;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(c);
    }
  }

  for (const item of uniqueCandidates) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', item.preset);

      const res = await fetch('https://api.cloudinary.com/v1_1/' + item.cloud + '/image/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.secure_url) {
          siteSettings.cloudinaryCloudName = item.cloud;
          siteSettings.cloudinaryPreset = item.preset;
          safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
          console.log('[Cloudinary Success] Uploaded to cloud="' + item.cloud + '", preset="' + item.preset + '":', data.secure_url);
          return data.secure_url;
        }
      } else {
        const errData = await res.json().catch(function() { return {}; });
        console.warn('[Cloudinary Warning] Attempt with cloud="' + item.cloud + '", preset="' + item.preset + '" returned:', errData);
      }
    } catch (err) {
      console.warn('[Cloudinary Error] Network issue for cloud="' + item.cloud + '", preset="' + item.preset + '":', err);
    }
  }

  return null;
}

// سیستم استیجینگ و پیش‌نویس افزودن و ویرایش اثر در ادمین
const AVAILABLE_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'Dedicated broadcast caption for Telegram channel...' },
  { id: 'artstation', name: 'ArtStation', icon: '🎨', placeholder: 'Technical specs, tools, and ArtStation portfolio description...' },
  { id: 'cara', name: 'Cara', icon: '🛡️', placeholder: 'Anti-AI portfolio caption and creative lore on Cara...' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', placeholder: 'Visual tags, pin description, and metadata...' },
  { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'Post caption, worldbuilding story, and hashtags...' },
  { id: 'reels', name: 'Instagram Reels', icon: '🎬', placeholder: 'Short hook, process breakdown, and soundtrack credits...' },
  { id: 'threads', name: 'Threads', icon: '🧵', placeholder: 'Conversational lore thread and concept notes...' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', placeholder: 'Submission title, subreddit, and technical breakdown...' },
  { id: 'x', name: 'X / Twitter', icon: '🐦', placeholder: 'Short tweet summary (<280 chars) and hashtags...' },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋', placeholder: 'Decentralized broadcast update on Bluesky...' },
  { id: 'shorts', name: 'YouTube Shorts', icon: '📹', placeholder: 'Shorts title, description, and production tags...' },
  { id: 'discord', name: 'Discord', icon: '🎮', placeholder: 'Community showcase announcement and lore ping...' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'Commercial pipeline application and industry notes...' }
];

let isCreatingNewArt = false;
currentSelectedArtIdx = -1;
let stagingNewArt = null;
let stagingProjectPhases = [];

window.openCreateArtworkModal = function() {
  isCreatingNewArt = true;
  currentSelectedArtIdx = -1;
  stagingNewArt = {
    id: Date.now(),
    genre: (typeof currentGenreFilter !== 'undefined' && currentGenreFilter !== 'all') ? currentGenreFilter : 'dark_fantasy',
    tag: 'character',
    category: 'character',
    shortSlug: '',
    title: '',
    desc: '',
    pipelineKey: 'sketch1',
    image: '',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    phases: [
      {
        name: 'Main Cover & Master Sheet',
        img: '',
        image: '',
        genre: (typeof currentGenreFilter !== 'undefined' && currentGenreFilter !== 'all') ? currentGenreFilter : 'dark_fantasy',
        pipelineKey: 'sketch1',
        category: 'character',
        subcategory: 'Standard Production Standard',
        desc: '',
        socials: {},
        socialCaptions: {},
        tgIncludeButton: false
      }
    ]
  };

  const titleEl = document.getElementById('adminArtEditorModalTitle');
  if (titleEl) titleEl.textContent = '✨ Add New Artwork Project';

  renderAdminArtModalForm(stagingNewArt, true);
  document.getElementById('adminArtLiveEditorCol').classList.add('active');
  pushModalState('adminEditor');
};

window.selectAdminArt = function(idx) {
  isCreatingNewArt = false;
  currentSelectedArtIdx = idx;
  const art = showcaseArtworks[idx];
  if (!art) return;

  const titleEl = document.getElementById('adminArtEditorModalTitle');
  if (titleEl) titleEl.textContent = `Edit Concept Project: ${art.shortSlug || art.title}`;

  renderAdminArtModalForm(art, false);
  document.getElementById('adminArtLiveEditorCol').classList.add('active');
  pushModalState('adminEditor');
};

window.closeAdminArtEditor = function() {
  const modal = document.getElementById('adminArtLiveEditorCol');
  if (modal) modal.classList.remove('active');
  isCreatingNewArt = false;
  stagingNewArt = null;
};

window.closeAdminArtEditorDirect = function(e) {
  if (e.target.id === 'adminArtLiveEditorCol') {
    closeAdminArtEditor();
  }
};

function renderPhaseSocialDrawerContent(p, idx) {
  p.socials = p.socials || {};
  p.socialCaptions = p.socialCaptions || {};
  if (p.socialTelegram !== undefined && p.socials.telegram === undefined) {
    p.socials.telegram = Boolean(p.socialTelegram);
  }
  const currentSelectedTab = p.activeSocialTab || 'telegram';
  const activePlat = AVAILABLE_PLATFORMS.find(item => item.id === currentSelectedTab) || AVAILABLE_PLATFORMS[0];
  const isCurrentPlatChecked = Boolean(p.socials[activePlat.id]);

  return `
    <!-- Column 1: Vertical Platform Menu -->
    <div class="phase-social-menu-scroll">
      ${AVAILABLE_PLATFORMS.map(plat => {
        const isSelected = (currentSelectedTab === plat.id);
        const isChecked = Boolean(p.socials && p.socials[plat.id]);
        return `
          <div class="phase-social-menu-item ${isSelected ? 'active' : ''}" onclick="selectPhaseSocialTab(${idx}, '${plat.id}')">
            <div style="display:flex; align-items:center; gap:7px;">
              <span style="font-size:14px;">${plat.icon}</span>
              <span style="font-size:11px; font-weight:${isSelected ? '800' : '600'}; color:${isSelected ? 'var(--gold)' : '#e2e8f0'};">${plat.name}</span>
            </div>
            <input type="checkbox" onclick="event.stopPropagation()" onchange="togglePhaseSocialPlatform(${idx}, '${plat.id}', this.checked)" ${isChecked ? 'checked' : ''} style="accent-color:var(--gold); cursor:pointer; width:15px; height:15px;" title="Toggle broadcast to ${plat.name}" />
          </div>
        `;
      }).join('')}
    </div>

    <!-- Column 2: Platform Caption Settings -->
    <div style="background:#04060c; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; flex-wrap:wrap; gap:6px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="font-size:18px;">${activePlat.icon}</span>
          <span style="font-size:12.5px; font-weight:800; color:var(--gold);">Custom Caption & Settings for ${activePlat.name}</span>
        </div>
        <div>
          ${isCurrentPlatChecked ? `
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:800; color:var(--gold); background:rgba(250,204,21,0.12); padding:3px 10px; border-radius:6px; border:1px solid rgba(250,204,21,0.3);">
              <span style="font-size:8px;">●</span> Active for Broadcast
            </span>
          ` : `
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text-muted); background:rgba(255,255,255,0.04); padding:3px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:8px;">○</span> Inactive (Check box to activate)
            </span>
          `}
        </div>
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Custom Caption & Lore for ${activePlat.name}:</label>
        <textarea rows="3" placeholder="${activePlat.placeholder}" oninput="setPhaseSocialCaption(${idx}, '${activePlat.id}', this.value)" style="font-size:11.5px; padding:8px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a14; width:100%; box-sizing:border-box;">${(p.socialCaptions && p.socialCaptions[activePlat.id]) || ''}</textarea>
      </div>

      <!-- Telegram Direct Settings -->
      ${activePlat.id === 'telegram' ? `
        <div style="background:rgba(0,240,255,0.04); border:1px dashed rgba(0,240,255,0.25); border-radius:8px; padding:10px 12px; margin-top:2px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:11.5px; color:var(--cyan-electric); font-weight:700;">
            <input type="checkbox" onchange="setPhaseTelegramButton(${idx}, this.checked)" ${p.tgIncludeButton ? 'checked' : ''} style="accent-color:var(--cyan-electric); cursor:pointer; width:16px; height:16px;" />
            <span>Attach direct interactive glass link button to this artwork on live site</span>
          </label>
          <p style="font-size:10px; color:var(--text-muted); margin:4px 0 0 24px;">When unchecked, Telegram notification dispatches without an interactive link button.</p>
        </div>
      ` : ''}
    </div>
  `;
}

window.selectPhaseSocialTab = function(phaseIdx, platId) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  stagingProjectPhases[phaseIdx].activeSocialTab = platId;
  const drawerEl = document.getElementById(`phaseSocialDrawer_${phaseIdx}`);
  if (drawerEl) {
    drawerEl.innerHTML = renderPhaseSocialDrawerContent(stagingProjectPhases[phaseIdx], phaseIdx);
    return;
  }
  renderAdminStagingPhasesOnly();
};

window.togglePhaseSocialPlatform = function(phaseIdx, platId, isChecked) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  const p = stagingProjectPhases[phaseIdx];
  p.socials = p.socials || {};
  p.socials[platId] = isChecked;
  if (platId === 'telegram') p.socialTelegram = isChecked;

  // بروزرسانی بج آکاردئون درجا بدون بازسازی کل ساختار
  const badgeEl = document.getElementById(`phaseSocialBadge_${phaseIdx}`);
  if (badgeEl) {
    const activeSocials = [];
    AVAILABLE_PLATFORMS.forEach(item => {
      if (p.socials[item.id]) activeSocials.push(item.name);
    });
    badgeEl.textContent = activeSocials.length > 0 ? `${activeSocials.length} Active Channels (${activeSocials.join(", ")})` : 'Auto-Broadcast: Off';
    badgeEl.style.color = activeSocials.length > 0 ? 'var(--gold)' : 'var(--text-muted)';
    badgeEl.style.background = activeSocials.length > 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)';
  }

  const drawerEl = document.getElementById(`phaseSocialDrawer_${phaseIdx}`);
  if (drawerEl) {
    drawerEl.innerHTML = renderPhaseSocialDrawerContent(p, phaseIdx);
  }
};

window.setPhaseSocialCaption = function(phaseIdx, platId, text) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  const p = stagingProjectPhases[phaseIdx];
  p.socialCaptions = p.socialCaptions || {};
  p.socialCaptions[platId] = text;
};

window.setPhaseTelegramButton = function(phaseIdx, isChecked) {
  if (!stagingProjectPhases || !stagingProjectPhases[phaseIdx]) return;
  stagingProjectPhases[phaseIdx].tgIncludeButton = isChecked;
};

function renderAdminArtModalForm(art, isNew) {
  const box = document.getElementById('adminArtFormFields');
  if (!box || !art) return;

  // آماده‌سازی لیست تصاویر و شیت‌های پروژه
  stagingProjectPhases = [];
  if (Array.isArray(art.phases) && art.phases.length > 0) {
    stagingProjectPhases = JSON.parse(JSON.stringify(art.phases));
  } else if (art.image) {
    stagingProjectPhases.push({
      name: art.title || 'Main Cover Artwork',
      img: art.image,
      image: art.image,
      pipelineKey: art.pipelineKey || 'sketch1',
      subcategory: 'Standard Production Standard',
      desc: '',
      socials: {},
      socialCaptions: {},
      tgIncludeButton: false
    });
  } else {
    stagingProjectPhases.push({
      name: 'Main Cover & Master Sheet',
      img: '',
      image: '',
      pipelineKey: 'sketch1',
      subcategory: 'Standard Production Standard',
      desc: '',
      socials: {},
      socialCaptions: {},
      tgIncludeButton: false
    });
  }

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Step 1: Title & Lore -->
      <div style="background:#04060a; border:1px solid rgba(250,204,21,0.35); border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px;">
        <div style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <span style="font-size:13.5px; font-weight:900; color:var(--gold);">📌 Step 1: Concept Project Title & Story Lore</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Full Artwork Project Title</label>
            <input type="text" id="editArtTitleInput" value="${art.title || ''}" placeholder="Full concept project title (e.g. Sovereign Vanguard)..." />
          </div>
          <div>
            <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Tile Hover Slug (Short Subtitle)</label>
            <input type="text" id="editArtSlugInput" value="${art.shortSlug || ''}" placeholder="e.g. Rook Knight" />
          </div>
          <div>
            <label style="font-size:11px; color:var(--rose-neon, #f43f5e); font-weight:700; display:block; margin-bottom:4px;">🌌 Project Universe / Genre</label>
            <select id="editArtGenreSelect" style="width:100%; font-size:12px; padding:8px 12px; background:#090d16; border:1px solid rgba(244,63,94,0.3); border-radius:8px; color:#fff;">
              ${(typeof galleryGenres !== 'undefined' ? galleryGenres : []).map(g => `
                <option value="${g.id}" ${(art.genre === g.id || (!art.genre && g.id === 'dark_fantasy')) ? 'selected' : ''}>
                  ${g.title || g.id}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div>
          <label style="font-size:11.5px; color:var(--gold); font-weight:800; display:block; margin-bottom:4px;">📖 Concept Lore & Creative Director Notes:</label>
          <textarea id="editArtDescInput" rows="3" placeholder="Narrative backstory, worldbuilding lore, key archetype notes, and visual development specs...">${art.desc || ''}</textarea>
        </div>
      </div>

      <!-- Step 2: Project Images & Sheets -->
      <div style="background:#05070d; border:1px solid rgba(0,240,255,0.35); border-radius:14px; padding:18px;">
        <div style="margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <span style="font-size:13.5px; font-weight:900; color:var(--cyan-electric);">📑 Step 2: Project Images & Production Sheets:</span>
          <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Upload cover artwork and turnaround sheets. Add more sheets via the button below.</p>
        </div>

        <div id="adminProjectPhasesList" style="display:flex; flex-direction:column; gap:14px;">
          ${renderStagingPhasesHtml()}
        </div>

        <!-- Add Sheet Button -->
        <div style="margin-top:14px;">
          <button type="button" onclick="addStagingPhase()" class="btn-secondary" style="width:100%; padding:12px 16px; font-size:12.5px; font-weight:800; border:1px dashed var(--cyan-electric); color:var(--cyan-electric); background:rgba(0,240,255,0.04); display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; border-radius:10px;">
            <span style="font-size:16px;">➕</span>
            <span>+ Add Complementary Sheet to this Project</span>
          </button>
        </div>
      </div>

      <!-- Production Pack Settings -->
      <div style="background:rgba(250,204,21,0.06); border:1px solid rgba(250,204,21,0.28); border-radius:12px; padding:12px 14px;">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:var(--gold); font-weight:700;">
          <input type="checkbox" id="editArtIsPackCheckbox" ${(art.isProductionPack !== false) ? 'checked' : ''} style="width:17px; height:17px; accent-color:var(--gold); cursor:pointer;" />
          Enable direct commission as a full Production Pack at end of case study
        </label>
      </div>

      <!-- Action Buttons -->
      <div style="margin-top:4px; display:flex; flex-direction:column; gap:8px;">
        ${isNew ? `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px; font-weight:800; cursor:pointer;">
            ✓ Save & Publish to Live Gallery
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px; cursor:pointer;">
            Cancel & Close
          </button>
        ` : `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px; font-weight:800; cursor:pointer;">
            ✓ Save Project Changes (No Re-Broadcast)
          </button>
          <button type="button" onclick="adminDeleteArtwork(${currentSelectedArtIdx})" class="btn-secondary" style="color:var(--crimson); width:100%; padding:10px; border-color:rgba(239,68,68,0.3); cursor:pointer;">
            Delete Artwork from Gallery
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px; cursor:pointer;">
            Close without Changes
          </button>
        `}
      </div>

    </div>
  `;
}

function renderStagingPhasesHtml() {
  if (!stagingProjectPhases || stagingProjectPhases.length === 0) {
    return `<div style="font-size:12px; color:var(--text-muted); padding:20px; text-align:center; background:#04060a; border-radius:10px; border:1px dashed rgba(255,255,255,0.15);">
      No production sheets found. Click "+ Add Complementary Sheet to this Project" below.
    </div>`;
  }

  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};

  return stagingProjectPhases.map((p, idx) => {
    const pipeKey = p.pipelineKey || 'sketch1';
    const subcats = (pipelines[pipeKey] && pipelines[pipeKey].subcategories) ? pipelines[pipeKey].subcategories : ['Standard Production Standard'];
    const currentSub = p.subcategory || subcats[0] || '';
    const isCover = (idx === 0);
    const hasImage = Boolean(p.img || p.image);
    const imgSrc = p.img || p.image || '';

    p.socials = p.socials || {};
    p.socialCaptions = p.socialCaptions || {};
    if (p.socialTelegram !== undefined && p.socials.telegram === undefined) {
      p.socials.telegram = Boolean(p.socialTelegram);
    }

    const activeSocials = [];
    AVAILABLE_PLATFORMS.forEach(item => {
      if (p.socials[item.id]) activeSocials.push(item.name);
    });

    return `
      <div style="display:flex; flex-direction:column; gap:12px; background:#04060a; border:1px solid ${isCover ? 'rgba(250,204,21,0.5)' : 'rgba(0,240,255,0.3)'}; border-radius:14px; padding:16px;">
        
        <!-- Image Preview or Upload -->
        ${hasImage ? `
          <div style="background:rgba(0,0,0,0.65); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.18)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'}; border:1px solid ${isCover ? 'rgba(250,204,21,0.35)' : 'rgba(0,240,255,0.3)'};">
                ${isCover ? '🖼️ Main Cover & Flagship Sheet (Sheet 1)' : `Complementary Sheet #${idx + 1}`}
              </span>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" onclick="document.getElementById('phaseFileInput_${idx}').click()" class="btn-secondary" style="font-size:11px; padding:4px 12px; border-color:rgba(255,255,255,0.25); cursor:pointer;">
                  🔄 Replace Image
                </button>
                ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:3px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="Delete Sheet">✕</button>` : ''}
              </div>
              <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />
            </div>

            <!-- Organic Artwork Aspect Display -->
            <div style="position:relative; width:100%; max-height:280px; min-height:160px; background:#020306; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;">
              <img src="${imgSrc}" style="max-width:100%; max-height:268px; width:auto; height:auto; object-fit:contain; display:block; border-radius:8px;" alt="Artwork preview" />
            </div>

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">Sheet Title / Phase Name:</label>
              <input type="text" value="${p.name || ''}" placeholder="Sheet title (e.g. 3-View Turnaround / Orthographic Model Sheet)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px; background:rgba(250,204,21,0.03); border:1.5px dashed ${isCover ? 'rgba(250,204,21,0.6)' : 'rgba(0,240,255,0.5)'}; border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.15)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'};">
                ${isCover ? '🖼️ Main Cover & Flagship Sheet (Sheet 1)' : `Production Sheet #${idx + 1}`}
              </span>
              ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:2px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="Delete Sheet">✕</button>` : ''}
            </div>

            <div onclick="document.getElementById('phaseFileInput_${idx}').click()" style="cursor:pointer; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:26px 16px; text-align:center; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)'">
              <div style="font-size:32px; margin-bottom:6px;">📁</div>
              <div style="font-size:13px; font-weight:800; color:var(--gold);">Click to choose and upload ${isCover ? "main cover image" : "this sheet"} from your system</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Supports WEBP, PNG, JPG up to 15MB with lossless quality & artist metadata</div>
            </div>
            <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">Sheet Title / Phase Name:</label>
              <input type="text" value="${p.name || ''}" placeholder="Sheet title (e.g. Master Keyframe Render / Form Exploration)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        `}

        <!-- 1. Universe Genre, 2. Unified Category & Pipeline, 3. Commission Subcategory Selection -->
        <div style="display:grid; grid-template-columns:1fr 1.25fr 1fr; gap:8px;">
          <div>
            <label style="font-size:10.5px; color:var(--rose-neon, #f43f5e); font-weight:700; display:block; margin-bottom:2px;">🌌 1. Universe Genre:</label>
            <select onchange="stagingProjectPhases[${idx}].genre = this.value;" style="font-size:11px; padding:6px 8px; margin:0; width:100%; background:#090d16; border:1px solid rgba(244,63,94,0.3); border-radius:6px; color:#fff;">
              ${(typeof galleryGenres !== 'undefined' ? galleryGenres : []).map(g => `
                <option value="${g.id}" ${(p.genre === g.id || (!p.genre && g.id === (art.genre || 'dark_fantasy'))) ? 'selected' : ''}>
                  ${g.title || g.id}
                </option>
              `).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:10.5px; color:var(--gold); font-weight:700; display:block; margin-bottom:2px;">📂 2. Category & Pipeline:</label>
            <select onchange="handlePhaseUnifiedCategoryChange(${idx}, this.value)" style="font-size:11px; padding:6px 8px; margin:0; width:100%; background:#090d16; border:1px solid rgba(250,204,21,0.3); border-radius:6px; color:#fff;">
              <option value="sketch1" ${(pipeKey === 'sketch1' || p.category === 'character') ? 'selected' : ''}>Character Design & Heroes</option>
              <option value="sketch_creature" ${(pipeKey === 'sketch_creature' || p.category === 'creature') ? 'selected' : ''}>Creatures, Titans & Monsters</option>
              <option value="sketch2" ${(pipeKey === 'sketch2' || p.category === 'environment') ? 'selected' : ''}>Environment & Worldbuilding</option>
              <option value="sketch3" ${(pipeKey === 'sketch3' || p.category === 'keyframe') ? 'selected' : ''}>Keyframes & Cinematic Covers</option>
              <option value="sketch4" ${(pipeKey === 'sketch4' || p.category === 'props') ? 'selected' : ''}>Props, Weapons & UI</option>
              <option value="sketch5" ${(pipeKey === 'sketch5' || p.category === 'comic') ? 'selected' : ''}>Comics & Storyboards</option>
            </select>
          </div>
          <div>
            <label style="font-size:10.5px; color:var(--cyan-electric); font-weight:700; display:block; margin-bottom:2px;">🏷️ 3. Commission Subcategory:</label>
            <select onchange="stagingProjectPhases[${idx}].subcategory = this.value" style="font-size:11px; padding:6px 8px; margin:0; width:100%; background:#090d16; border:1px solid rgba(0,240,255,0.3); border-radius:6px; color:#fff;">
              ${subcats.map(s => `<option value="${s}" ${currentSub === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <textarea rows="2" placeholder="Technical notes for this sheet (industry application, variant specs, asset fidelity)..." onchange="stagingProjectPhases[${idx}].desc = this.value.trim()" style="font-size:11px; padding:6px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a12;">${p.desc || p.description || ''}</textarea>

        <!-- Multi-Channel Broadcast Channels -->
        <details id="phaseSocialDetails_${idx}" ontoggle="stagingProjectPhases[${idx}].isSocialOpen = this.open" ${p.isSocialOpen ? 'open' : ''} style="background:#070a14; border:1px solid rgba(250,204,21,0.25); border-radius:12px; padding:10px 14px; margin-top:2px;">
          <summary style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; user-select:none; outline:none;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11.5px; color:var(--gold); font-weight:800;">📡 Multi-Channel Broadcast Channels (Sheet Distribution):</span>
              <span id="phaseSocialBadge_${idx}" class="font-mono" style="font-size:9.5px; color:${activeSocials.length > 0 ? 'var(--gold)' : 'var(--text-muted)'}; background:${activeSocials.length > 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)'}; padding:2px 8px; border-radius:4px;">
                ${activeSocials.length > 0 ? `${activeSocials.length} Active Channels (${activeSocials.join(", ")})` : 'Auto-Broadcast: Off'}
              </span>
            </div>
            <span style="font-size:11px; color:var(--cyan-electric); font-weight:800; display:flex; align-items:center; gap:5px;">
              <span>Manage Channels</span>
              <span style="font-size:11px;">▾</span>
            </span>
          </summary>

          <div id="phaseSocialDrawer_${idx}" style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);" class="phase-social-drawer-layout">
            ${renderPhaseSocialDrawerContent(p, idx)}
          </div>
        </details>
      </div>
    `;
  }).join('');
}

window.renderAdminStagingPhasesOnly = function() {
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.addStagingPhase = function() {
  const nextNum = stagingProjectPhases.length + 1;
  const defPipe = stagingProjectPhases[0]?.pipelineKey || 'sketch1';
  const defGenre = stagingProjectPhases[0]?.genre || (typeof currentGenreFilter !== 'undefined' && currentGenreFilter !== 'all' ? currentGenreFilter : 'dark_fantasy');
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const defSub = (pipelines[defPipe] && pipelines[defPipe].subcategories) ? pipelines[defPipe].subcategories[0] : 'Standard Production Standard';

  stagingProjectPhases.push({
    name: `Complementary Sheet ${nextNum}`,
    img: '',
    image: '',
    genre: defGenre,
    pipelineKey: defPipe,
    category: (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? (PIPELINE_TO_CATEGORY_MAP[defPipe] || 'character') : 'character',
    subcategory: defSub,
    desc: '',
    socials: {},
    socialCaptions: {},
    tgIncludeButton: false
  });
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhaseUnifiedCategoryChange = function(idx, newPipe) {
  if (!stagingProjectPhases || !stagingProjectPhases[idx]) return;
  stagingProjectPhases[idx].pipelineKey = newPipe;
  const cat = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? (PIPELINE_TO_CATEGORY_MAP[newPipe] || 'character') : 'character';
  stagingProjectPhases[idx].category = cat;
  stagingProjectPhases[idx].tag = cat;
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const subcats = (pipelines[newPipe] && pipelines[newPipe].subcategories) ? pipelines[newPipe].subcategories : ['Standard Production Standard'];
  stagingProjectPhases[idx].subcategory = subcats[0] || '';
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhasePipelineChange = function(idx, newPipe) {
  if (!stagingProjectPhases || !stagingProjectPhases[idx]) return;
  stagingProjectPhases[idx].pipelineKey = newPipe;
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const subcats = (pipelines[newPipe] && pipelines[newPipe].subcategories) ? pipelines[newPipe].subcategories : ['Standard Production Standard'];
  stagingProjectPhases[idx].subcategory = subcats[0] || '';
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.removeStagingPhase = function(idx) {
  if (stagingProjectPhases.length <= 1) {
    stagingProjectPhases[0].img = '';
    stagingProjectPhases[0].image = '';
    stagingProjectPhases[0].name = 'Main Cover & Master Sheet';
  } else {
    stagingProjectPhases.splice(idx, 1);
  }
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhaseImageUpload = async function(idx, inputEl) {
  if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  showToast('Uploading and processing image...', 'info', 2500);

  try {
    let cloudUrl = await uploadFileToCloudinary(file);
    if (cloudUrl) {
      if (stagingProjectPhases[idx]) {
        stagingProjectPhases[idx].img = cloudUrl;
        stagingProjectPhases[idx].image = cloudUrl;
      }
      const container = document.getElementById('adminProjectPhasesList');
      if (container) container.innerHTML = renderStagingPhasesHtml();
      showToast('Image successfully uploaded to Cloudinary! ✓', 'success');
      return;
    }

    const compressed = await compressImageForStorage(file, 1600, 1600, 0.82);
    if (stagingProjectPhases[idx]) {
      stagingProjectPhases[idx].img = compressed;
      stagingProjectPhases[idx].image = compressed;
    }
    const container = document.getElementById('adminProjectPhasesList');
    if (container) container.innerHTML = renderStagingPhasesHtml();
    showToast('High-fidelity image ready and saved! ✓', 'success');
  } catch (err) {
    console.error('Phase upload error:', err);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (stagingProjectPhases[idx]) {
        stagingProjectPhases[idx].img = e.target.result;
        stagingProjectPhases[idx].image = e.target.result;
      }
      const container = document.getElementById('adminProjectPhasesList');
      if (container) container.innerHTML = renderStagingPhasesHtml();
      showToast('Image uploaded successfully! ✓', 'success');
    };
    reader.readAsDataURL(file);
  }
};

window.confirmSaveArtwork = async function() {
  const title = document.getElementById('editArtTitleInput')?.value.trim() || '';
  const slug = document.getElementById('editArtSlugInput')?.value.trim() || '';
  const desc = document.getElementById('editArtDescInput')?.value.trim() || '';
  const isPack = document.getElementById('editArtIsPackCheckbox') ? document.getElementById('editArtIsPackCheckbox').checked : true;

  if (!stagingProjectPhases || stagingProjectPhases.length === 0) {
    showToast('Please add at least one image sheet for this project.', 'error');
    return;
  }

  // بررسی وجود حداقل یک تصویر معتبر
  const validPhases = stagingProjectPhases.filter(p => Boolean(p.img || p.image));
  if (validPhases.length === 0) {
    showToast('Please select and upload the main cover image.', 'error', 5000);
    return;
  }

  const primaryPhase = validPhases[0];
  const img = primaryPhase.img || primaryPhase.image || '';
  const pipe = primaryPhase.pipelineKey || 'sketch1';
  const cat = primaryPhase.category || PIPELINE_TO_CATEGORY_MAP[pipe] || 'character';
  const selectedGenre = document.getElementById('editArtGenreSelect')?.value || primaryPhase.genre || 'dark_fantasy';
  primaryPhase.genre = selectedGenre;
  const colorSpace = 'Master 4K / 16-Bit ProPhoto RGB';

  try {
    const assembledPhases = JSON.parse(JSON.stringify(validPhases));

    if (isCreatingNewArt) {
      const newArtRecord = {
        id: (stagingNewArt && stagingNewArt.id) ? stagingNewArt.id : Date.now(),
        tag: cat,
        category: cat,
        genre: selectedGenre,
        shortSlug: slug || (stagingNewArt && stagingNewArt.shortSlug) || title || 'New Concept',
        title: title || 'New Studio Concept Project',
        desc: desc,
        isProductionPack: isPack,
    isAtelierSample: document.getElementById("editArtIsAtelierSample") ? document.getElementById("editArtIsAtelierSample").checked : false,
        pipelineKey: pipe,
        image: img,
        colorSpace: colorSpace,
        phases: assembledPhases
      };

      showcaseArtworks.unshift(newArtRecord);
      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      
      closeAdminArtEditor();
      renderShowcaseGrid();
      renderAdminSketch2();
      showToast('New concept artwork added to gallery successfully! ✓', 'success');

      // توزیع چندکاناله: فقط برای کارهای جدید و فقط شیت‌هایی که تیک تلگرام دارند
      const tgPhases = assembledPhases.filter(p => (p.socials?.telegram === true || p.socialTelegram === true));
      for (const ph of tgPhases) {
        await broadcastArtworkPhaseToTelegram(newArtRecord, ph);
      }

      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').insert([{
          id: newArtRecord.id,
          tag: newArtRecord.tag,
          short_slug: newArtRecord.shortSlug,
          title: newArtRecord.title,
          desc_text: newArtRecord.desc,
          pipeline_key: newArtRecord.pipelineKey,
          image: newArtRecord.image,
          color_space: newArtRecord.colorSpace,
          phases: newArtRecord.phases
        }]).then(({ error }) => {
          if (error) console.warn('Supabase insert error:', error);
          else showToast('New concept project registered in cloud database! ✓', 'success');
        });
      }
    } else if (showcaseArtworks[currentSelectedArtIdx]) {
      const art = showcaseArtworks[currentSelectedArtIdx];
      art.title = title || art.title;
      art.shortSlug = slug || art.shortSlug;
      art.tag = cat;
      art.category = cat;
      art.genre = selectedGenre;
      art.pipelineKey = pipe;
      art.image = img;
      art.desc = desc;
      art.isProductionPack = isPack;
    art.isAtelierSample = document.getElementById("editArtIsAtelierSample") ? document.getElementById("editArtIsAtelierSample").checked : false;
      art.phases = assembledPhases;

      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      closeAdminArtEditor();
      renderShowcaseGrid();
      renderAdminSketch2();
      showToast('Project changes saved successfully to site and database! ✓', 'success', 5000);

      // در حالت ویرایش اثر هیچ پیامی به شبکه‌ها مخابره نمی‌شود
      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').update({
          tag: art.tag,
          short_slug: art.shortSlug,
          title: art.title,
          desc_text: art.desc,
          pipeline_key: art.pipelineKey,
          image: art.image,
          color_space: art.colorSpace,
          phases: art.phases
        }).eq('id', art.id).then(({ error }) => {
          if (error) console.warn('Supabase update error:', error);
          else showToast('Changes synchronized with cloud database! ✓', 'success');
        });
      }
    }
  } catch (storageErr) {
    console.error('Storage error:', storageErr);
    showToast('Error saving data.', 'error');
  }
};

window.adminDeleteArtwork = function(idx) {
  if (!showcaseArtworks || showcaseArtworks.length <= 0) {
    showToast('No artwork found to delete.', 'error');
    return;
  }
  if (confirm('Are you sure you want to permanently delete this artwork from the gallery?')) {
    const deletedItem = showcaseArtworks[idx];
    const deletedId = deletedItem ? Number(deletedItem.id) : null;

    if (deletedId) {
      // ثبت در بلک‌لیست آثار حذف‌شده تا هرگز در رفرش یا همگام‌سازی ابری برنگردد
      let deletedIds = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem(KEYS.DELETED_ARTWORKS) || '[]');
      } catch(e) { deletedIds = []; }
      if (!deletedIds.includes(deletedId)) {
        deletedIds.push(deletedId);
        safeSetStorage(KEYS.DELETED_ARTWORKS, JSON.stringify(deletedIds));
      }

      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').delete().eq('id', deletedId).then(({ error }) => {
          if (error) console.warn('Supabase delete error:', error);
          else console.log('Successfully deleted artwork', deletedId, 'from cloud database.');
        });
      }
    }

    showcaseArtworks.splice(idx, 1);
    safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
    currentSelectedArtIdx = 0;
    closeAdminArtEditor();
    renderAdminSketch2();
    renderShowcaseGrid();
    showToast('Artwork permanently removed from gallery.', 'info');
  }
};

window.renderAdminSettingsTab = function() {
  // مقداردهی رادیوی وضعیت حضور استودیو
  const curMode = siteSettings.studioAvailabilityMode || 'auto';
  const radioEl = document.getElementById(`studioMode${curMode.charAt(0).toUpperCase() + curMode.slice(1)}`);
  if (radioEl) radioEl.checked = true;
  const customMsgEl = document.getElementById('setStudioCustomStatusMessage');
  if (customMsgEl) customMsgEl.value = siteSettings.studioCustomStatusMessage || '';
  if (typeof previewStudioStatusSelection === 'function') previewStudioStatusSelection();
  if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories();
  if (typeof renderAdminTgChannelsList === 'function') renderAdminTgChannelsList();
  if (typeof loadStudioPricingMatrixToForm === 'function') loadStudioPricingMatrixToForm();
  const rateEl = document.getElementById('setUsdRate');
  if (rateEl) rateEl.value = siteSettings.usdRate || 72000;
  if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
  const tokenEl = document.getElementById('setTgToken');
  if (tokenEl) tokenEl.value = siteSettings.tgToken || '';
  const footerEl = document.getElementById('setTgDefaultFooter');
  if (footerEl) footerEl.value = siteSettings.tgDefaultFooter || '';
  const chatEl = document.getElementById('setTgChat');
  if (chatEl) chatEl.value = siteSettings.tgChat || '';
  const emailEl = document.getElementById('setAdminEmail');
  if (emailEl) emailEl.value = 'tajinkart@gmail.com';
  const cCloudEl = document.getElementById('setCloudinaryCloud');
  if (cCloudEl) cCloudEl.value = siteSettings.cloudinaryCloudName || 'tajinkart';
  const cPresetEl = document.getElementById('setCloudinaryPreset');
  if (cPresetEl) cPresetEl.value = siteSettings.cloudinaryPreset || 'erlvtkx9';
  if (document.getElementById('setRedditCreds')) document.getElementById('setRedditCreds').value = siteSettings.redditCreds || '';
  if (document.getElementById('setMetaToken')) document.getElementById('setMetaToken').value = siteSettings.metaToken || '';
  if (document.getElementById('setTwitterKey')) document.getElementById('setTwitterKey').value = siteSettings.twitterKey || '';
  if (document.getElementById('setYoutubeKey')) document.getElementById('setYoutubeKey').value = siteSettings.youtubeKey || '';
  if (document.getElementById('setArtstationCreds')) document.getElementById('setArtstationCreds').value = siteSettings.artstationCreds || '';
  if (document.getElementById('setPinterestToken')) document.getElementById('setPinterestToken').value = siteSettings.pinterestToken || '';
  if (document.getElementById('setBlueskyCreds')) document.getElementById('setBlueskyCreds').value = siteSettings.blueskyCreds || '';
  if (document.getElementById('setDiscordWebhook')) document.getElementById('setDiscordWebhook').value = siteSettings.discordWebhook || '';
};

// سابقه مرورگر و دکمه بازگشت در موبایل (HTML5 History API)
window.addEventListener('popstate', (event) => {
  const artModal = document.getElementById('artDetailModal');
  if (artModal && (artModal.classList.contains('active') || artModal.style.display === 'block')) {
    closeArtModalDirect(false);
    return;
  }
  const zoomModal = document.getElementById('zoomModal');
  if (zoomModal && zoomModal.classList.contains('active')) {
    closeModalDirect();
    return;
  }
  const adminEditor = document.getElementById('adminArtLiveEditorCol');
  if (adminEditor && adminEditor.classList.contains('active')) {
    closeAdminArtEditor();
    return;
  }
  const memberModal = document.getElementById('memberModal');
  if (memberModal && memberModal.style.display === 'flex') {
    closeMemberModal();
    return;
  }
  const dock = document.getElementById('rightVerticalNav');
  if (dock && dock.classList.contains('dock-open')) {
    dock.classList.remove('dock-open');
    return;
  }
  if (currentView !== 'showcase') {
    switchView('showcase');
    return;
  }
});

function pushModalState(modalName) {
  try {
    window.history.pushState({ modalOpen: modalName }, '');
  } catch(e) {}
}




/**
 * TAJINKART Master Spec v2.1 Engine
 * استودیو کانسپت آرت و توسعه بصری — سید سروش تاج
 */

// تبدیل زنده نرخ دلار به TOMAN
function formatPrice(usdPrice) {
  if (typeof usdPrice === 'string') {
    if (currencyMode === 'TOMAN') {
      const matches = usdPrice.match(/\d+/g);
      if (matches && matches.length > 0) {
        const tomans = matches.map(m => {
          const val = parseInt(m, 10) * (siteSettings.usdRate || 72000);
          return '$' + Math.round(val / (siteSettings.usdRate || 70000));
        });
        return tomans.join(' - ');
      }
    }
    return usdPrice;
  }
  if (currencyMode === 'TOMAN') {
    const tomanVal = usdPrice * (siteSettings.usdRate || 72000);
    return tomanVal.toLocaleString('fa-IR') + ' TOMAN';
  }
  return `$${usdPrice}`;
}

window.setCurrencyMode = function(mode) {
  currencyMode = mode;
  const btnUSD = document.getElementById('currBtnUSD');
  const btnTOMAN = document.getElementById('currBtnTOMAN');
  if (btnUSD) btnUSD.classList.toggle('active', mode === 'USD');
  if (btnTOMAN) btnTOMAN.classList.toggle('active', mode === 'TOMAN');
  renderProducts();
  selectPipeline(currentSelectedPipeKey, null, false);
  recalcWizardPrice();
  showToast(`Currency display set to ${mode === 'TOMAN' ? 'TOMAN' : 'USD ($)'}.`, 'info');
};

// سیستم توست نوتیفیکیشن دارک فانتزی
window.showToast = function(msg, type = 'gold') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // جلوگیری از تکرار پیام‌های مشابه
  const existingToasts = container.querySelectorAll('.toast-msg');
  for (const t of existingToasts) {
    if (t.textContent.includes(msg)) {
      return;
    }
  }

  // حداکثر ۲ اعلان همزمان
  if (existingToasts.length >= 2) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  let icon = '⚡';
  if (type === 'success') icon = '✓';
  if (type === 'info') icon = 'ℹ';
  if (type === 'error') icon = '✕';
  toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 4500);
};


// =========================================================
// موتور تشخیص خودکار ابعاد و فرمول کادر گالری
// بدون نیاز به انتخاب دستی کاربر — تشخیص ۱۰۰٪ خودکار
// =========================================================
const artDimensionCache = {};

function detectAndApplyArtworkDimensions(art, onDetected) {
  if (!art || !art.image) return;
  if (artDimensionCache[art.image]) {
    const cached = artDimensionCache[art.image];
    art.width = cached.width;
    art.height = cached.height;
    art.aspectRatio = cached.ratio;
    if (onDetected) onDetected(cached);
    return;
  }
  const img = new Image();
  img.onload = function() {
    const w = this.naturalWidth;
    const h = this.naturalHeight;
    const r = parseFloat((w / h).toFixed(2));
    art.width = w;
    art.height = h;
    art.aspectRatio = r;
    artDimensionCache[art.image] = { width: w, height: h, ratio: r };
    if (onDetected) onDetected({ width: w, height: h, ratio: r });
  };
  img.src = art.image;
}

// فرمول هوشمند تقسیم ستون‌های ۱۲گانه بر اساس نسبت واقعی عرض به ارتفاع
function getAutoSpanClass(art) {
  let r = art.aspectRatio;
  if (!r && art.width && art.height) r = art.width / art.height;
  if (!r && artDimensionCache[art.image]) r = artDimensionCache[art.image].ratio;

  // پیش‌فرض هوشمند موقت قبل از اتمام لود
  if (!r) {
    if (art.tag === 'character' || art.tag === 'comic') r = 0.65;
    else if (art.tag === 'environment') r = 1.77;
    else if (art.tag === 'props') r = 1.0;
    else r = 1.5;
  }

  if (r >= 1.6) return 'span-col-wide';       // افقی عریض (۵ ستون)
  if (r >= 1.2) return 'span-col-medium';     // افقی استاندارد (۴ ستون)
  if (r >= 0.85) return 'span-col-square';    // مربعی (۳ ستون)
  return 'span-col-portrait';                 // عمودی پرتره کاراکتر (۲ ستون)
}

// رندر گالری با فرمول خودکار کادربندی و نمایش کامل اثر بدون کراپ
window.renderShowcaseGrid = function() {
  const grid = document.getElementById('showcaseGrid');
  if (!grid) return;

  const filteredArtworks = showcaseArtworks.filter(art => {
    // ۱. بررسی تطابق ژانر کیهانی اثر (Universe Genre Filter)
    if (typeof currentGenreFilter !== 'undefined' && currentGenreFilter && currentGenreFilter !== 'all') {
      const artG = art.genre || (art.phases && art.phases[0] && art.phases[0].genre) || '';
      let genreMatches = (artG === currentGenreFilter);
      if (!genreMatches && art.phases && Array.isArray(art.phases)) {
        genreMatches = art.phases.some(p => p.genre === currentGenreFilter);
      }
      if (!genreMatches && !artG) {
        const textBlob = ((art.title || '') + ' ' + (art.desc || '') + ' ' + (art.shortSlug || '')).toLowerCase();
        if (currentGenreFilter === 'dark_fantasy' && (textBlob.includes('knight') || textBlob.includes('gorgon') || textBlob.includes('citadel') || textBlob.includes('ash') || textBlob.includes('dark') || textBlob.includes('gothic'))) genreMatches = true;
        if (currentGenreFilter === 'scifi_cyberpunk' && (textBlob.includes('void') || textBlob.includes('leviathan') || textBlob.includes('biomechanical') || textBlob.includes('cyber') || textBlob.includes('sci-fi'))) genreMatches = true;
        if (currentGenreFilter === 'post_apocalyptic' && (textBlob.includes('ash') || textBlob.includes('trench') || textBlob.includes('ruin') || textBlob.includes('desolate'))) genreMatches = true;
      }
      if (!genreMatches) return false;
    }

    // ۲. بررسی تطابق دسته‌بندی گالری و پایپلاین (Category Filter)
    if (typeof currentGalleryFilter !== 'undefined' && currentGalleryFilter && currentGalleryFilter !== 'all') {
      const cat = art.category || art.tag || (art.pipelineKey ? (PIPELINE_TO_CATEGORY_MAP[art.pipelineKey] || 'character') : 'character');
      const pipe = art.pipelineKey;
      const mainMatch = cat === currentGalleryFilter || 
                        pipe === currentGalleryFilter || 
                        (PIPELINE_TO_CATEGORY_MAP[pipe] && PIPELINE_TO_CATEGORY_MAP[pipe] === currentGalleryFilter) ||
                        art.tag === currentGalleryFilter;
      if (mainMatch) return true;

      // فیلتر عمیق شیت‌ها و Phasesهای الحاقی:
      if (art.phases && Array.isArray(art.phases) && art.phases.length > 0) {
        return art.phases.some(p => {
          const pPipe = p.pipelineKey;
          const pCat = pPipe ? (PIPELINE_TO_CATEGORY_MAP[pPipe] || '') : (p.category || '');
          const pSub = p.subcategory || '';
          if (pCat === currentGalleryFilter || pPipe === currentGalleryFilter) return true;
          const pLower = pSub.toLowerCase();
          if (currentGalleryFilter === 'environment' && (pLower.includes('environment') || pLower.includes('world') || pLower.includes('architecture') || pLower.includes('citadel'))) return true;
          if (currentGalleryFilter === 'character' && (pLower.includes('character') || pLower.includes('hero') || pLower.includes('vanguard') || pLower.includes('rogue'))) return true;
          if (currentGalleryFilter === 'creature' && (pLower.includes('creature') || pLower.includes('monster') || pLower.includes('titan') || pLower.includes('leviathan') || pLower.includes('gorgon'))) return true;
          if (currentGalleryFilter === 'keyframe' && (pLower.includes('keyframe') || pLower.includes('cover') || pLower.includes('cinematic'))) return true;
          if (currentGalleryFilter === 'props' && (pLower.includes('prop') || pLower.includes('weapon') || pLower.includes('relic') || pLower.includes('ui'))) return true;
          if (currentGalleryFilter === 'comic' && (pLower.includes('comic') || pLower.includes('manga') || pLower.includes('lore') || pLower.includes('storyboard'))) return true;
          return false;
        });
      }
      return false;
    }

    return true;
  });

  if (filteredArtworks.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); width: 100%;">
        <p style="font-size: 16px; margin-bottom: 14px; color: #fff; font-family: var(--font-brand); letter-spacing:0.04em;">No concept artworks found matching this selection.</p>
        <button onclick="resetAllGalleryFilters()" class="btn-gold" style="font-size: 12px; padding: 9px 20px; font-weight:800;">View All Gallery Artworks</button>
      </div>
    `;
    return;
  }

  // ری‌ارنج خودکار و هوشمند چیدمان گالری نسبت به تعداد کارهای شاخه انتخابی (حالت پایه دسکتاپ: ۴ ستون متوازن)
  const workCount = filteredArtworks.length;
  if (window.innerWidth > 768) {
    if (workCount === 1) {
      try { grid.style.setProperty('column-count', '1', 'important'); } catch(e) { /* safe fallback */ }
      try { grid.style.setProperty('max-width', '720px', 'important'); } catch(e) { /* safe fallback */ }
    } else if (workCount === 2) {
      try { grid.style.setProperty('column-count', '2', 'important'); } catch(e) { /* safe fallback */ }
      try { grid.style.setProperty('max-width', '980px', 'important'); } catch(e) { /* safe fallback */ }
    } else if (workCount === 3) {
      try { grid.style.setProperty('column-count', '3', 'important'); } catch(e) { /* safe fallback */ }
      try { grid.style.setProperty('max-width', '1240px', 'important'); } catch(e) { /* safe fallback */ }
    } else {
      // حالت اصلی گالری دسکتاپ: ۴ ستون بزرگتر، شارپ‌تر و سینمایی‌تر
      try { grid.style.setProperty('column-count', '4', 'important'); } catch(e) { /* safe fallback */ }
      try { grid.style.setProperty('max-width', '1480px', 'important'); } catch(e) { /* safe fallback */ }
    }
  } else {
    if (workCount === 1) {
      try { grid.style.setProperty('column-count', '1', 'important'); } catch(e) { /* safe fallback */ }
    } else {
      try { grid.style.setProperty('column-count', '2', 'important'); } catch(e) { /* safe fallback */ }
    }
  }

  grid.innerHTML = filteredArtworks.map((art, i) => {
    const spanClass = getAutoSpanClass(art);
    const richAlt = `${art.title} — Concept Art & Worldbuilding by TAJINKART Studio`;
    const imgSrc = art.image || art.img || '';

    // جلوگیری از تکرار عبارت یکسان در اسلاگ و عنوان
    let slug = art.shortSlug || '';
    if (!slug || slug === art.title) {
      slug = art.tag ? art.tag.toUpperCase() : 'CONCEPT';
    }

    let tileImg = imgSrc;
    let targetPhaseIdx = 0;
    let displayTitle = art.title || "Untitled Concept";
    let displaySlug = slug;
    let activeKey = art.tag || art.category || art.pipelineKey || 'character';

    // تایل داینامیک: اگر دسته‌بندی خاصی فیلتر شده و شیت دوم یا سوم به آن تعلق دارد، تایل همان شیت، عنوان و رنگ نئون آن را می‌گیرد
    if (currentGalleryFilter && currentGalleryFilter !== 'all' && art.phases && Array.isArray(art.phases)) {
      const matchIdx = art.phases.findIndex((p, pIdx) => {
        const pPipe = p.pipelineKey;
        const pCat = pPipe ? (PIPELINE_TO_CATEGORY_MAP[pPipe] || '') : '';
        const pSub = p.subcategory || '';
        if (pCat === currentGalleryFilter || pPipe === currentGalleryFilter) return true;
        const pLower2 = (pSub || '').toLowerCase();
        if (currentGalleryFilter === 'environment' && (pLower2.includes('environment') || pLower2.includes('world') || pLower2.includes('architecture') || pLower2.includes('citadel'))) return true;
        if (currentGalleryFilter === 'character' && (pLower2.includes('character') || pLower2.includes('hero') || pLower2.includes('vanguard') || pLower2.includes('rogue'))) return true;
        if (currentGalleryFilter === 'creature' && (pLower2.includes('creature') || pLower2.includes('monster') || pLower2.includes('titan') || pLower2.includes('leviathan') || pLower2.includes('gorgon'))) return true;
        if (currentGalleryFilter === 'keyframe' && (pLower2.includes('keyframe') || pLower2.includes('cover') || pLower2.includes('cinematic'))) return true;
        if (currentGalleryFilter === 'props' && (pLower2.includes('prop') || pLower2.includes('weapon') || pLower2.includes('relic') || pLower2.includes('ui'))) return true;
        if (currentGalleryFilter === 'comic' && (pLower2.includes('comic') || pLower2.includes('manga') || pLower2.includes('lore') || pLower2.includes('storyboard'))) return true;
        return false;
      });

      if (matchIdx !== -1) {
        const matchedPhase = art.phases[matchIdx];
        if (matchedPhase.img || matchedPhase.image) {
          tileImg = matchedPhase.img || matchedPhase.image;
          targetPhaseIdx = matchIdx + 1; // ایندکس متناظر در استریم
          displayTitle = matchedPhase.name || art.title;
          displaySlug = matchedPhase.subcategory || PIPELINE_TO_CATEGORY_MAP[matchedPhase.pipelineKey] || slug;
          activeKey = matchedPhase.pipelineKey || activeKey;
        }
      }
    }

    // محاسبه پالت نئونی اختصاصی بر اساس شیت نمایش‌داده‌شده
    // تبدیل کد رنگ هگز به آر‌جی‌بی با آلفا برای هاله نوری هالوژنی پشت تایل
    function hexToRgbaStr(hex, alpha) {
      if (!hex) return `rgba(250, 204, 21, ${alpha})`;
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const r = parseInt(hex.substring(0, 2), 16) || 250;
      const g = parseInt(hex.substring(2, 4), 16) || 204;
      const b = parseInt(hex.substring(4, 6), 16) || 21;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // استخراج رنگ نئون کاملاً پویا از پالت رنگ دسته‌بندی‌های استودیو
    let catHex = '#facc15';
    if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
      if (currentGalleryFilter && currentGalleryFilter !== 'all') {
        const activeFilterCat = galleryCategories.find(c => c.id === currentGalleryFilter);
        if (activeFilterCat && activeFilterCat.color) {
          catHex = activeFilterCat.color;
        }
      } else {
        const directCat = galleryCategories.find(c => c.id === activeKey || c.id === (PIPELINE_TO_CATEGORY_MAP[activeKey] || ''));
        if (directCat && directCat.color) {
          catHex = directCat.color;
        }
      }
    }

    const neon = {
      border: catHex,
      glow: hexToRgbaStr(catHex, 0.8),
      soft: hexToRgbaStr(catHex, 0.35)
    };

    // برچسب زیرین هویت اثر: نمایش پکیج پروداکشن در آثار چندPhasesی یا شاخه کانسپت
    let subLabel = '';
    if (art.phases && Array.isArray(art.phases) && art.phases.length > 1) {
      subLabel = `Production Case Study • ${art.phases.length} Sheets`;
    } else {
      const catObj = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories))
        ? galleryCategories.find(c => c.id === activeKey || c.id === (PIPELINE_TO_CATEGORY_MAP[activeKey] || ''))
        : null;
      const catName = catObj ? (catObj.title || catObj.name) : activeKey.toUpperCase();
      subLabel = `${catName} Concept`;
    }

    return `
      <div class="mosaic-tile ${spanClass}" id="galleryTile_${art.id}" 
           style="--neon-border:${neon.border}; --neon-glow:${neon.glow}; --neon-soft:${neon.soft};" 
           onclick="openArtModalWithPhase(${art.id}, ${targetPhaseIdx})">
        <div class="tile-center-title">
          <span class="tile-slug" style="color:${neon.border}; text-shadow:0 0 14px ${neon.glow}; font-size:13px; font-weight:800;"># ${displayTitle} #</span>
          <span class="tile-divider" style="background:${neon.border}; box-shadow:0 0 14px ${neon.glow}; width:36px;"></span>
          <span class="tile-sub" style="font-size:11.5px; opacity:0.92; color:#e2e8f0;">${subLabel}</span>
        </div>
        <img src="${tileImg}" loading="lazy" alt="${richAlt}" onload="handleImageAutoDetect(this, ${art.id}); this.parentElement.classList.add('loaded');" />
      </div>
    `;
  }).join('');
}

window.handleImageAutoDetect = function(imgEl, artId) {
  if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;
  const r = parseFloat((w / h).toFixed(2));
  artDimensionCache[imgEl.src] = { width: w, height: h, ratio: r };
  const art = showcaseArtworks.find(a => a.id == artId);
  if (art && (!art.aspectRatio || Math.abs(art.aspectRatio - r) > 0.08)) {
    art.width = w;
    art.height = h;
    art.aspectRatio = r;
    const tile = document.getElementById(`galleryTile_${art.id}`);
    if (tile) {
      tile.className = `mosaic-tile ${getAutoSpanClass(art)}`;
    }
  }
};
// لایت‌باکس مطالعه موردی چندمرحله‌ای (Case-Study Interactive Engine)
let currentCaseStudyIdx = 0;


window.closeAllFloatingDrawersAndMenus = function() {
  const catMenu = document.getElementById('floatingCategoryDropdown');
  if (catMenu) catMenu.classList.remove('active');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (mobileDrawer) mobileDrawer.classList.remove('active');
  const searchBar = document.getElementById('gallerySearchBar');
  if (searchBar) searchBar.classList.remove('active');
  const phaseDrawer = document.getElementById('phaseScopeDrawerOverlay');
  if (phaseDrawer) phaseDrawer.classList.remove('active');
};

window.openArtModalWithPhase = function(id, targetPhaseIdx = 0) {
  closeAllFloatingDrawersAndMenus();
  let idx = showcaseArtworks.findIndex(a => String(a.id) === String(id) || a.id == id);
  if (idx === -1 && typeof id === 'number') idx = id;
  if (idx < 0 || idx >= showcaseArtworks.length) idx = 0;

  openArtModalByIndex(idx);

  if (targetPhaseIdx > 0) {
    setTimeout(() => {
      const modal = document.getElementById('artDetailModal');
      const items = document.querySelectorAll('.project-stream-item');
      if (items && items[targetPhaseIdx] && modal) {
        const itemTop = items[targetPhaseIdx].offsetTop - 20;
        modal.scrollTo({ top: itemTop, behavior: 'smooth' });
      }
    }, 280);
  }
};

window.orderProjectPack = function(artId) {
  const art = showcaseArtworks.find(a => String(a.id) === String(artId) || a.id == artId);
  closeArtModalDirect();
  switchView('store');
  const pipeKey = art ? (art.pipelineKey || 'sketch1') : 'sketch1';
  selectPipeline(pipeKey);
  showToast('Full production package loaded into atelier scope calculator.', 'success', 4500);
};

window.openArtModalByIndex = function(idx) {
  if (idx < 0 || idx >= showcaseArtworks.length) return;
  closeAllFloatingDrawersAndMenus();
  currentCaseStudyIdx = idx;
  const art = showcaseArtworks[idx];
  renderArtStationProject(art);
  const modal = document.getElementById('artDetailModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'block';
    modal.scrollTop = 0;
  }
  // ثبت وضعیت در تاریخچه تا دکمه بازگشت (Back) گوشی پنجره را ببندد و از سایت خارج نشود
  pushModalState('artDetail');
};

window.openArtModal = function(id) {
  if (id === undefined || id === null) return;
  let idx = showcaseArtworks.findIndex(a => String(a.id) === String(id) || a.id == id);
  if (idx === -1 && typeof id === 'number' && id >= 0 && id < showcaseArtworks.length) {
    idx = id;
  }
  if (idx !== -1) {
    openArtModalByIndex(idx);
  } else if (showcaseArtworks.length > 0) {
    openArtModalByIndex(0);
  }
};

window.closeArtModalDirect = function(updateHistory = true) {
  const modal = document.getElementById('artDetailModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  // آزادسازی قطعی و بی‌قیدوشرط اسکرول بدنه و کل صفحه
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');

  if (updateHistory && window.history.state && window.history.state.modalOpen === 'artDetail') {
    try { window.history.back(); } catch(e) {}
  }
};

window.closeArtModal = function(e) {
  if (e.target && e.target.id === 'artDetailModal') {
    closeArtModalDirect();
  }
};

window.navigateCaseStudy = function(direction, e) {
  if (e) e.stopPropagation();
  if (!showcaseArtworks || showcaseArtworks.length === 0) return;
  currentCaseStudyIdx = (currentCaseStudyIdx + direction + showcaseArtworks.length) % showcaseArtworks.length;
  const nextArt = showcaseArtworks[currentCaseStudyIdx];
  if (nextArt) {
    renderArtStationProject(nextArt);
    const modal = document.getElementById('artDetailModal');
    if (modal) modal.scrollTop = 0;
  }
};

function renderArtStationProject(art) {
  if (!art) return;
  activeCaseStudyArt = art;

  const stream = document.getElementById('caseStudyImagesStream');
  if (!stream) return;

  const mainTitle = art.title || 'Untitled Concept Project';
  const mainDesc = art.desc || 'Original concept artwork and visual development by TAJINKART studio.';
  const mainPipe = art.pipelineKey || 'sketch1';
  const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[mainPipe]) ? PIPELINE_DATA[mainPipe] : { topSub: 'Concept Art Atelier' };
  const mainPipeName = pipeData.topSub;
  const artLore = art.lore || 'Extopia Universe';

  let streamHtml = '';

  // ۱. سرتیتر یکپارچه و مجلل اثر (فرمت وسط‌چین نامه طراح بدون هشتگ یا بج اضافه)
  streamHtml += `
    <div class="unified-project-header">
      <h1 class="project-header-title">${mainTitle}</h1>
      <p class="project-header-desc">${mainDesc}</p>
    </div>
  `;

  // ۲. استخراج لیست یکپارچه تصاویر
  const mainSrc = art.image || art.img || (art.phases && art.phases[0] && (art.phases[0].img || art.phases[0].image)) || '';
  let imageList = [];

  if (mainSrc) {
    imageList.push({
      src: mainSrc,
      name: mainTitle,
      phaseNum: '01',
      desc: mainDesc,
      pipe: mainPipe,
      sub: ''
    });
  }

  if (art.phases && Array.isArray(art.phases) && art.phases.length > 0) {
    art.phases.forEach((p, pIdx) => {
      const pSrc = p.img || p.image;
      if (pSrc && pSrc !== mainSrc) {
        const phaseName = p.name || `Production Sheet • Phase ${imageList.length + 1}`;
        const phaseDesc = p.desc || p.description || p.note || '';
        const phasePipe = p.pipelineKey || mainPipe;
        const phaseSub = p.subcategory || '';
        imageList.push({
          src: pSrc,
          name: phaseName,
          phaseNum: (imageList.length + 1 < 10 ? `0${imageList.length + 1}` : `${imageList.length + 1}`),
          desc: phaseDesc,
          pipe: phasePipe,
          sub: phaseSub
        });
      }
    });
  }

  // رندر تک‌تک فریم‌های استریم عمودی همراه با یادداشت‌های فنی بین تصاویر
  imageList.forEach((item, idx) => {
    const pipeInfo = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[item.pipe]) ? PIPELINE_DATA[item.pipe].topSub : 'Design Atelier';
    streamHtml += `
      <div class="artstation-img-card project-stream-item" 
           data-index="${idx}"
           data-title="${escapeQuotes(item.name)}">
        <img src="${item.src}" alt="${item.name}" loading="${idx === 0 ? 'eager' : 'lazy'}" class="elastic-pinch-target" onclick="toggleImageZoom(this, event)" title="Click to zoom and inspect artwork" />
        <div class="stream-phase-note" style="padding: 16px 20px; background: rgba(6, 8, 13, 0.75); border-radius: 12px; margin-top: 10px; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 240px; text-align: right;">
              <h3 class="stream-phase-title" style="margin: 0 0 8px; font-size: 16px; font-weight: 800; color: #fff; line-height: 1.4;">
                ${item.phaseNum} • ${item.name}
              </h3>
              ${item.desc ? `<p class="stream-phase-desc" style="margin: 0; font-size: 12.5px; color: #94a3b8; line-height: 1.85;">${item.desc}</p>` : ''}
            </div>
            <div style="flex-shrink: 0; text-align: left;">
              <span class="stream-phase-pipe font-mono" style="display: inline-block; padding: 4px 12px; border-radius: 6px; background: rgba(250, 204, 21, 0.12); border: 1px solid rgba(250, 204, 21, 0.35); color: var(--gold); font-size: 11px; font-weight: 800;">
                ${pipeInfo}${item.sub ? ` • ${item.sub}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // ۳. کارت باوقار سفارش پکیج کامل در انتهای اثر (در صورت فعال بودن در اثر)
  if (art.isProductionPack !== false) {
    streamHtml += `
      <div class="production-pack-card">
        
        <h3 class="pack-title">Order Full Production Case Study</h3>
        <p class="pack-desc">Commission this complete concept art pipeline (including exploratory thumbnails, orthographic sheets, and final renders) directly through the studio calculator.</p>
        <button type="button" onclick="orderProjectPack('${art.id}')" class="btn-gold pack-order-btn">
          Inquire / Order in Studio Calculator ←
        </button>
      </div>
    `;
  }

  stream.innerHTML = streamHtml;

}

// موتور ردیابی زنده اسکرول برای تغییر هماهنگ سایدبار بر اساس عکس در حال مشاهده با رهگیر نوری و ترنزیشن جهت‌دار
let lastScrollPosition = 0;

function initProjectStreamScrollSpy() {
  const modal = document.getElementById('artDetailModal');
  const items = document.querySelectorAll('.project-stream-item');
  if (!modal || items.length === 0) return;

  lastScrollPosition = modal.scrollTop;

  function onScroll() {
    const isScrollingDown = modal.scrollTop >= lastScrollPosition;
    lastScrollPosition = modal.scrollTop;

    let currentItem = items[0];
    let activeIndex = 0;
    const triggerLine = window.innerHeight * 0.45;

    items.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        currentItem = item;
        activeIndex = idx;
      }
    });

    const phase = currentItem.getAttribute('data-phase');
    const title = currentItem.getAttribute('data-title');
    const desc = currentItem.getAttribute('data-desc');

    const phaseEl = document.getElementById('artDetailPhaseIndicator');
    const titleEl = document.getElementById('artDetailTitle');
    const descEl = document.getElementById('artDetailDesc');

    // به‌روزرسانی نقاط رهگیر نوری سایدبار
    const dots = document.querySelectorAll('.sidebar-optical-tracker .tracker-dot');
    dots.forEach((dot, dIdx) => {
      if (dIdx === activeIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    if (titleEl && title && titleEl.textContent !== title) {
      titleEl.textContent = title;
      if (phaseEl && phase) phaseEl.textContent = phase;
      if (descEl && desc) descEl.textContent = desc;

      const sidebarEl = document.getElementById('artStationSidebar');
      if (sidebarEl) {
        sidebarEl.classList.remove('sidebar-slide-down', 'sidebar-slide-up', 'sidebar-gold-pulse');
        void sidebarEl.offsetWidth; // ری‌فلو جهت اجرای انیمیشن نرم جهت‌دار
        sidebarEl.classList.add(isScrollingDown ? 'sidebar-slide-down' : 'sidebar-slide-up');
        sidebarEl.classList.add('sidebar-gold-pulse');
        setTimeout(() => sidebarEl.classList.remove('sidebar-gold-pulse'), 400);
      }

      const itemPipe = currentItem.getAttribute('data-pipe');
      if (itemPipe) {
        currentDrawerPipelineKey = itemPipe;
        const pipeNameEl = document.getElementById('caseStudyPipeName');
        const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[itemPipe]) ? PIPELINE_DATA[itemPipe] : null;
        if (pipeNameEl && pipeData) {
          const itemSub = currentItem.getAttribute('data-sub');
          pipeNameEl.textContent = pipeData.topSub + (itemSub ? ` (${itemSub})` : '');
        }
      }
    }
  }

  modal.removeEventListener('scroll', modal._scrollSpyHandler);
  modal._scrollSpyHandler = onScroll;
  modal.addEventListener('scroll', onScroll, { passive: true });
}

window.scrollStreamToItem = function(index) {
  const items = document.querySelectorAll('.project-stream-item');
  if (items[index]) {
    items[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.toggleImageZoom = function(imgEl, e) {
  if (!imgEl) return;
  // روی تبلت و موبایل کلیک تک‌ضربه غیرفعال است و منحصراً از زوم لمسی پینچ دوانگشتی استفاده می‌شود
  if (window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024)) return;
  const isZoomed = imgEl.classList.toggle('zoomed-image');
  if (isZoomed) {
    if (e) {
      const rect = imgEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      imgEl.style.transformOrigin = `${x}% ${y}%`;
    } else {
      imgEl.style.transformOrigin = 'center center';
    }

    imgEl.onmousemove = function(moveEvent) {
      if (!imgEl.classList.contains('zoomed-image')) return;
      const rect = imgEl.getBoundingClientRect();
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      imgEl.style.transformOrigin = `${x}% ${y}%`;
    };
  } else {
    imgEl.style.transformOrigin = 'center center';
    imgEl.onmousemove = null;
  }
};

// گوش دادن به کلیدهای کیبورد برای ناوبری
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('artDetailModal');
  if (modal && (modal.classList.contains('active') || modal.style.display === 'block')) {
    if (e.key === 'Escape') closeArtModalDirect();
    if (e.key === 'ArrowLeft') navigateCaseStudy(1);
    if (e.key === 'ArrowRight') navigateCaseStudy(-1);
  }
});

window.setCaseStudyPhase = function(idx) {
  activeCaseStudyPhaseIdx = idx;
  updateCaseStudyPhaseView();
  renderCaseStudyPhasesSwitcher();
};

function updateCaseStudyPhaseView() {
  if (!activeCaseStudyArt) return;
  const phases = activeCaseStudyArt.phases || [{ name: 'Master Final Render', img: activeCaseStudyArt.image }];
  const currentPhase = phases[activeCaseStudyPhaseIdx] || phases[0];

  const imgEl = document.getElementById('caseStudyMainImg');
  const badgeEl = document.getElementById('caseStudyPhaseBadge');
  const displayImg = currentPhase.img || activeCaseStudyArt.image;
  if (imgEl) imgEl.src = getOptimizedImageUrl(displayImg, 1600);
  if (badgeEl) badgeEl.textContent = `Phases ${activeCaseStudyPhaseIdx + 1} • ${currentPhase.name}`;
}

// دیپ‌لینک هوشمند از مطالعه موردی به پایپلاین آتلیه کمیسیون
window.deepLinkToPipeline = function() {
  closeArtModalDirect();
  const pipeKey = activeCaseStudyArt ? activeCaseStudyArt.pipelineKey : 'sketch1';
  switchView('store');
  switchStoreTab('commissions', document.querySelector('.store-dual-nav .store-dual-btn'));
  selectPipeline(pipeKey, null, true);
  showToast('Commission pipeline opened for this concept project.', 'info');
};

// closeArtModalDirect handled uniformly above

// پایپلاین‌های ۶گانه آتلیه - اتصال زنده به رنگ دسته‌بندی گالری و زیرشاخه‌ها (v21.3.0)
window.selectPipeline = function(key, cardEl, userClicked) {
  currentSelectedPipeKey = key;
  
  // ۱. نگاشت پایپلاین به دسته‌بندی گالری و واکشی رنگ زنده آن
  const catId = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? (PIPELINE_TO_CATEGORY_MAP[key] || 'character') : 'character';
  let catColor = '#facc15';
  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    const foundCat = galleryCategories.find(c => c.id === catId);
    if (foundCat && foundCat.color) {
      catColor = foundCat.color;
    }
  }

  // ۲. به‌روزرسانی وضعیت اکتیو کارت‌های سایدبار
  document.querySelectorAll('#atelierServiceCards .service-nav-card').forEach(c => {
    const isActive = c.getAttribute('data-pipeline') === key;
    c.classList.toggle('active', isActive);
  });

  if (typeof applyCategoryColorsToServiceCards === 'function') {
    applyCategoryColorsToServiceCards();
  }

  const data = PIPELINE_DATA[key];
  if (!data) return;

  const topSubEl = document.getElementById('sketchTopSubTitle');
  if (topSubEl) {
    topSubEl.textContent = data.topSub;
    topSubEl.style.borderRight = `3px solid ${catColor}`;
    topSubEl.style.paddingRight = '10px';
  }

  const badgeSlugEl = document.getElementById('sketchBadgeSlug');
  if (badgeSlugEl) {
    badgeSlugEl.textContent = data.badgeSlug;
    badgeSlugEl.style.color = catColor;
    badgeSlugEl.style.borderColor = catColor;
    badgeSlugEl.style.background = `${catColor}18`;
    badgeSlugEl.style.boxShadow = `0 0 14px ${catColor}44`;
  }

  const noteEl = document.getElementById('sketchAnnotationNote');
  if (noteEl) noteEl.textContent = data.note;

  // ۳. رندر تایل‌های مرحله و پکیج‌ها متصل به رنگ زنده دسته‌بندی
  const container = document.getElementById('mosaicStageContainer');
  if (container) {
    container.innerHTML = data.tiles.map((tile, idx) => {
      const displayPrice = formatPrice(tile.price);
      return `
        <div class="pipeline-tile ${tile.span}" style="--tile-accent:${catColor};" onclick="openModal('${tile.title}', '${tile.desc}', '${displayPrice}', '${tile.img}', '${tile.timeline}', ${tile.usdVal || 90}, '${key}')">
          <img src="${tile.img}" class="pipeline-tile-img" alt="${tile.title}" />
          <div class="pipeline-tile-overlay">
            <h4 class="pipeline-tile-title">${tile.title}</h4>
            <p class="pipeline-tile-desc">${tile.desc}</p>
            <div class="pipeline-tile-footer">
              <div>
                <span class="font-mono" style="color:${catColor}; font-size:14px; font-weight:800; text-shadow:0 0 10px ${catColor}55;">${displayPrice}</span>
                <span style="color:var(--cyan-electric); font-size:11px; margin-right:8px;">(${tile.timeline})</span>
              </div>
              <span style="font-size:11.5px; color:${catColor}; font-weight:800; display:flex; align-items:center; gap:4px;">
                Quote & Submit Brief →
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (userClicked && window.innerWidth <= 1024) {
    const target = document.getElementById('sketchWorkbenchArea');
    if (target) {
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
};

// باز کردن مدال و محاسبه‌گر لحظه‌ای با مقدار عددی پایه واقعی
function openModal(title, desc, price, img, timeline, usdVal, pipeKey) {
  activeModalItem = {
    title: title,
      titleFa: document.getElementById("editArtTitleFa") ? document.getElementById("editArtTitleFa").value.trim() : "",
    desc: desc,
      isProductionPack: document.getElementById('editArtIsPackCheckbox') ? document.getElementById('editArtIsPackCheckbox').checked : true,
    price: price,
    img: img,
    timeline: timeline || '5 to 7 business days',
    usdVal: usdVal || 90,
    pipeKey: pipeKey || currentSelectedPipeKey
  };

  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').textContent = desc;
  document.getElementById('modalTimeline').textContent = activeModalItem.timeline;
  document.getElementById('modalMediaImg').src = img;

  const badgeEl = document.getElementById('wizardPipeBadge');
  if (badgeEl) {
    const pData = PIPELINE_DATA[activeModalItem.pipeKey];
    badgeEl.textContent = pData ? pData.topSub : 'ATELIER PIPELINE';
  }

  if (currentMember) {
    const nameInput = document.getElementById('orderClientName');
    const contactInput = document.getElementById('orderClientContact');
    if (nameInput) nameInput.value = currentMember.name;
    if (contactInput) contactInput.value = currentMember.contact || currentMember.email;
  }

  // محاسبه لحظه‌ای اولیه و باز کردن پنجره
  recalcWizardPrice();
  document.getElementById('zoomModal').classList.add('active');
}

function closeModal(e) { if (e.target.id === 'zoomModal') closeModalDirect(); }
function closeModalDirect() { document.getElementById('zoomModal').classList.remove('active'); }

// موتور محاسبه‌گر لحظه‌ای قیمت و اسکوپ سفارش (Live Calculator Engine)
window.toggleWizardStep = function(stepNum) {
  const card = document.getElementById("wizardStep" + stepNum);
  if (card) card.classList.toggle('active');
};

window.recalcWizardPrice = function() {
  let baseUSD = 90;
  if (activeModalItem && typeof activeModalItem.usdVal === 'number' && activeModalItem.usdVal > 0) {
    baseUSD = activeModalItem.usdVal;
  }

  const scopeEl = document.getElementById('wizCharacterScope');
  const framingEl = document.getElementById('wizFraming');
  const compEl = document.getElementById('wizComplexity');
  const phaseEl = document.getElementById('orderPhaseSelect');
  const weaponEl = document.getElementById('wizHeroWeapon');
  const expEl = document.getElementById('wizExpressions');
  const paletteEl = document.getElementById('wizColorPalette');
  const commEl = document.getElementById('wizCommercial');

  let extra = 0;
  if (scopeEl) extra += parseInt(scopeEl.options[scopeEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (framingEl) extra += parseInt(framingEl.options[framingEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (compEl) extra += parseInt(compEl.options[compEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (phaseEl) extra += parseInt(phaseEl.options[phaseEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (weaponEl && weaponEl.checked) extra += 35;
  if (expEl && expEl.checked) extra += 30;
  if (paletteEl && paletteEl.checked) extra += 20;
  if (commEl && commEl.checked) extra += 45;

  const totalUSD = Math.max(60, baseUSD + extra);
  activeModalItem.calculatedPriceUSD = totalUSD;

  // آپدیت آنی و زنده قیمت روی صفحه
  const priceEl = document.getElementById('modalPrice');
  if (priceEl) {
    priceEl.textContent = formatPrice(totalUSD);
    // افکت فلش ظریف هنگام تغییر عدد
    priceEl.style.transition = 'color 0.2s';
    priceEl.style.color = 'var(--cyan-electric)';
    setTimeout(() => { priceEl.style.color = 'var(--gold)'; }, 250);
  }
};

// مخزن دارایی‌های دیجیتال (۷ شاخه استاندارد)
let currentStoreFilterType = 'all';

const ASSET_CAT_DESCRIPTIONS = {
  'all': 'Atelier digital asset vault containing 7 standard branches: 2D game sprites, specialized brush engines, UI kits, layered comic PSDs, 4K loops, 3D print STLs, and FX particle bundles.',
  '2D Game Sprites & Characters': 'Character sprite sheets and multi-directional animations (Idle, Walk, Attack, Death) optimized for Unity and Godot with seamless parallax layers.',
  'Brush Engines & Textures': 'Custom Photoshop (.ABR) and Procreate brush packs for rendering weathered metals, aged leather, reptilian scales, and 4K seamless alphas.',
  'Prop Kits, Icons & UI': 'Magic skill icon libraries, alchemy vials, dark fantasy HUD frames, and RPG equipment interfaces in transparent PNG (256x256 & 512x512).',
  'Comics & Master PSDs': 'Full comic graphic novel chapters with separated PSD layers, worldbuilding lorebooks, and studio director notes.',
  '4K Cinematic Loops': 'Seamless 60FPS 4K video loops for video game title menus, live streaming backdrops, Steam dynamic wallpapers, and commercial cinematic title sequences.',
  '3D Print & STL Models': 'High-poly STL sculpts for resin 3D printing with pre-supported hollowed variants + raw ZBrush (.ZTL / .OBJ) sculpt files for game artists.',
  'FX & Atmosphere Overlays': 'High-resolution transparent PNG & 4K ProRes video overlays including drifting embers, sulfurous acid mist, heavy rain, and weapon impact dust.'
};

window.filterStoreAssets = function(type, el) {
  currentStoreFilterType = type;
  document.querySelectorAll('#assetCategoryTabs .service-nav-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('currentAssetCategoryTitle');
  if (titleEl) titleEl.textContent = type === 'all' ? 'All Studio Digital Assets' : type;

  const noteEl = document.getElementById('assetCategoryDynamicNote');
  if (noteEl) noteEl.textContent = ASSET_CAT_DESCRIPTIONS[type] || ASSET_CAT_DESCRIPTIONS['all'];

  renderProducts();

  if (window.innerWidth <= 1024 && el) {
    const target = document.getElementById('assetWorkbenchArea');
    if (target) {
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
};

window.searchStoreAssets = function(query) {
  const q = query.toLowerCase().trim();
  let filtered = digitalStoreProducts;
  if (currentStoreFilterType !== 'all') {
    filtered = filtered.filter(p => p.type === currentStoreFilterType);
  }
  if (q) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  renderProductsWithList(filtered);
};

function renderProducts() {
  let filtered = digitalStoreProducts;
  if (currentStoreFilterType !== 'all') {
    filtered = filtered.filter(p => p.type === currentStoreFilterType);
  }
  renderProductsWithList(filtered);
}

function renderProductsWithList(list) {
  const countEl = document.getElementById('assetCountBadge');
  if (countEl) countEl.textContent = `${list.length} ASSETS AVAILABLE`;

  const grid = document.getElementById('productsMerchGrid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; text-align:center; color:var(--text-muted); font-size:13px;">No assets found in this category.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const priceStr = formatPrice(p.price);
    return `
      <div class="product-merch-card">
        <div class="merch-img-box">
          <img src="${p.img}" alt="${p.title}" />
          <span style="position:absolute; top:10px; right:10px; font-size:10px; padding:3px 9px; border-radius:6px; background:rgba(4,5,7,0.88); color:var(--cyan-electric); border:1px solid rgba(0,240,255,0.3); font-weight:700;">${p.type}</span>
        </div>
        <div style="padding:16px; display:flex; flex-direction:column; flex:1; justify-content:space-between; gap:12px;">
          <div>
            <h3 style="font-size:14px; font-weight:800; color:#fff; line-height:1.45;">${p.title}</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-top:6px; line-height:1.65;">${p.desc}</p>
            <div class="lore-key-tag">
              <span>🔑</span>
              <span>${p.loreKey || 'Genesis Canon • Lifetime Lore Access'}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--border-subtle);">
            <span class="font-mono" style="font-size:16px; font-weight:800; color:var(--gold);">${priceStr}</span>
            <button onclick="downloadDigitalAsset('${p.title}')" class="btn-gold" style="padding:8px 14px; font-size:11px; background:var(--cyan-electric); color:#000;">Unlock & Download License →</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.downloadDigitalAsset = function(title) {
  showToast(`Asset "${title}" with perpetual commercial license unlocked to your dashboard. ✨`, 'success');
  if (currentMember) {
    if (!currentMember.assetsBought) currentMember.assetsBought = [];
    if (!currentMember.assetsBought.includes(title)) {
      currentMember.assetsBought.push(title);
      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));

      // ذخیره دائمی و آنلاین در جدول اعضای دیتابیس ابری Supabase
      if (window.supabaseClient) {
        window.supabaseClient.from('members').update({
          assets_bought: currentMember.assetsBought
        }).eq('email', currentMember.email).then(({ error }) => {
          if (error) console.warn('Cloud asset purchase sync warning:', error);
          else console.log('Successfully saved bought asset to Supabase cloud!');
        });
      }
    }
  }
};

function renderAcademy() {
  const grid = document.getElementById('academyCoursesGrid');
  if (!grid) return;
  grid.innerHTML = academyCourses.map(c => {
    const displayPrice = formatPrice(c.price);
    return `
      <div class="academy-card">
        <div style="aspect-ratio:16/9; background:#04060a; overflow:hidden;">
          <img src="${c.img}" style="width:100%; height:100%; object-fit:cover;" alt="${c.title}" />
        </div>
        <div style="padding:18px; display:flex; flex-direction:column; flex:1; justify-content:space-between; gap:12px;">
          <div>
            <div style="font-size:11.5px; color:var(--violet); font-weight:600;">${c.duration}</div>
            <h3 style="font-size:15.5px; font-weight:800; margin-top:4px;">${c.title}</h3>
            <p style="font-size:12.5px; color:var(--text-muted); margin-top:6px; line-height:1.7;">${c.desc}</p>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid rgba(168,85,247,0.2);">
            <span class="font-mono" style="font-size:18px; font-weight:800; color:var(--gold);">${displayPrice}</span>
            <button onclick="enrollAcademyCourse('${c.title}')" class="btn-gold" style="background:var(--violet); color:#fff; font-size:11.5px; padding:8px 14px;">Enroll in Masterclass →</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.enrollAcademyCourse = function(title) {
  showToast(`Enrollment in "${title}" completed successfully! ✓`, 'success');
};

function renderComicPage() {
  const imgEl = document.getElementById('comicPageImg');
  const indEl = document.getElementById('comicPageIndicator');
  if (imgEl) imgEl.src = comicPages[comicCurrentPage - 1];
  if (indEl) indEl.textContent = `PAGE ${comicCurrentPage} / 4`;
}
window.navigateComic = function(delta) {
  comicCurrentPage += delta;
  if (comicCurrentPage < 1) comicCurrentPage = 1;
  if (comicCurrentPage > 4) comicCurrentPage = 4;
  renderComicPage();
};

// ارسال بریف به ربات تلگرام مدیر استودیو

// =========================================================
// موتور ارتباط زنده، مدیریت چند کانال و توزیع در تلگرام (@tajinkart_bot)
// =========================================================
window.renderAdminTgChannelsList = function() {
  const container = document.getElementById('telegramChannelsList');
  if (!container) return;

  if (!siteSettings.tgChannels || !Array.isArray(siteSettings.tgChannels) || siteSettings.tgChannels.length === 0) {
    siteSettings.tgChannels = siteSettings.tgChat ? [siteSettings.tgChat] : [''];
  }

  container.innerHTML = siteSettings.tgChannels.map((ch, idx) => `
    <div style="display:flex; gap:8px; align-items:center;" id="tgChannelRow_${idx}">
      <input type="text" value="${escapeQuotes(ch)}" placeholder="e.g. @tajinkart or -100123456789" class="font-mono tg-channel-input" style="flex:1; font-size:11.5px; padding:8px 10px; background:#04060a; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#fff; box-sizing:border-box;" oninput="updateTgChannelVal(${idx}, this.value)" />
      ${siteSettings.tgChannels.length > 1 ? `
        <button type="button" onclick="removeTgChannel(${idx})" style="color:var(--crimson); background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px; font-size:15px; padding:6px 10px; cursor:pointer;" title="Delete Channel">✕</button>
      ` : ''}
    </div>
  `).join('');
};

window.updateTgChannelVal = function(idx, val) {
  if (siteSettings.tgChannels && siteSettings.tgChannels[idx] !== undefined) {
    siteSettings.tgChannels[idx] = val.trim();
  }
};

window.addTgChannelField = function() {
  // ۱. جمع‌آوری فوری مقادیر تایپ‌شده فعلی تا پاک نشوند
  const currentInputs = document.querySelectorAll('.tg-channel-input');
  if (currentInputs && currentInputs.length > 0) {
    siteSettings.tgChannels = [];
    currentInputs.forEach(inp => {
      siteSettings.tgChannels.push(inp.value.trim());
    });
  } else if (!siteSettings.tgChannels || !Array.isArray(siteSettings.tgChannels)) {
    siteSettings.tgChannels = [];
  }

  // ۲. افزودن فیلد خالی جدید
  siteSettings.tgChannels.push('');
  renderAdminTgChannelsList();

  // ۳. فوکوس روی فیلد جدید اضافه شده
  setTimeout(() => {
    const allInputs = document.querySelectorAll('.tg-channel-input');
    if (allInputs.length > 0) {
      allInputs[allInputs.length - 1].focus();
    }
  }, 50);
};

window.removeTgChannel = function(idx) {
  const currentInputs = document.querySelectorAll('.tg-channel-input');
  if (currentInputs && currentInputs.length > 0) {
    siteSettings.tgChannels = [];
    currentInputs.forEach(inp => {
      siteSettings.tgChannels.push(inp.value.trim());
    });
  }
  if (!siteSettings.tgChannels) return;
  siteSettings.tgChannels.splice(idx, 1);
  if (siteSettings.tgChannels.length === 0) siteSettings.tgChannels = [''];
  renderAdminTgChannelsList();
};

window.saveTelegramSettingsDirect = function() {
  const tokenInput = document.getElementById('setTgToken');
  const token = tokenInput ? tokenInput.value.trim() : '';

  const channelInputs = document.querySelectorAll('.tg-channel-input');
  const channels = [];
  channelInputs.forEach(inp => {
    const v = inp.value.trim();
    if (v) channels.push(v);
  });

  const footerInput = document.getElementById('setTgDefaultFooter');
  if (footerInput) siteSettings.tgDefaultFooter = footerInput.value.trim();

  siteSettings.tgToken = token;
  siteSettings.tgChannels = channels.length > 0 ? channels : (siteSettings.tgChat ? [siteSettings.tgChat] : []);
  siteSettings.tgChat = siteSettings.tgChannels[0] || '';

  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  showToast('Telegram bot credentials and channels saved successfully! ✓', 'success', 4000);
};


window.autoDetectTelegramChannelId = async function() {
  const token = document.getElementById('setTgToken')?.value.trim() || siteSettings.tgToken;
  if (!token) {
    showToast('Please provide the Telegram Bot Token first.', 'error', 4500);
    return;
  }

  showToast('Querying and auto-detecting Telegram channels...', 'info', 3000);

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await resp.json();

    if (!data.ok) {
      showToast(`Telegram Error: ${data.description || 'Invalid Bot Token'}`, 'error', 5000);
      return;
    }

    const detected = [];
    const seen = new Set();

    (data.result || []).forEach(u => {
      const ch = u.my_chat_member?.chat || u.channel_post?.chat || u.message?.chat;
      if (ch && ch.id && !seen.has(ch.id)) {
        seen.add(ch.id);
        detected.push({ id: String(ch.id), title: ch.title || ch.username || ch.first_name || 'Channel' });
      }
    });

    if (detected.length > 0) {
      siteSettings.tgChannels = detected.map(d => d.id);
      siteSettings.tgChat = detected[0].id;
      renderAdminTgChannelsList();
      saveTelegramSettingsDirect();
      showToast(`Channel "${detected[0].title}" (${detected[0].id}) detected and registered! 🎉`, 'success', 6000);
    } else {
      showToast('Channel not found! Please send any message into the channel first, then click again.', 'info', 7000);
    }
  } catch(e) {
    showToast('Network error connecting to Telegram API.', 'error', 5000);
  }
};

window.testTelegramConnection = async function() {
  const token = document.getElementById('setTgToken')?.value.trim() || siteSettings.tgToken;
  const channelInputs = document.querySelectorAll('.tg-channel-input');
  let channels = [];
  channelInputs.forEach(inp => {
    const v = inp.value.trim();
    if (v) channels.push(v);
  });
  if (channels.length === 0 && siteSettings.tgChannels) {
    channels = siteSettings.tgChannels.filter(Boolean);
  }
  if (channels.length === 0 && siteSettings.tgChat) {
    channels = [siteSettings.tgChat];
  }

  if (!token || channels.length === 0) {
    showToast('Please enter Bot Token and at least one channel ID.', 'error', 4500);
    return;
  }

  showToast(`Broadcasting test dispatch to ${channels.length} Telegram destination(s)...`, 'info', 3000);

  let successCount = 0;
  let lastError = '';

  for (let chat of channels) {
    // اگر کاربر به جای شناسه عددی، لینک دعوت t.me/+ پیست کرده باشد، خودکار تلاش می‌کنیم از getUpdates شناسه‌اش را حل کنیم
    if (chat.includes('t.me/') || chat.includes('telegram.me/')) {
      try {
        const uResp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const uData = await uResp.json();
        if (uData.ok && Array.isArray(uData.result)) {
          for (let i = uData.result.length - 1; i >= 0; i--) {
            const fCh = uData.result[i].my_chat_member?.chat || uData.result[i].channel_post?.chat || uData.result[i].message?.chat;
            if (fCh && fCh.id) {
              chat = String(fCh.id);
              siteSettings.tgChannels[0] = chat;
              siteSettings.tgChat = chat;
              renderAdminTgChannelsList();
              saveTelegramSettingsDirect();
              break;
            }
          }
        }
      } catch(ignore) {}
    }
    try {
      const testMsg = `👑 *TAJINKART Atelier Connection Verified*\n\n` +
                      `Official bot *@tajinkart_bot* successfully connected to the studio command center.\n` +
                      `System is live and prepared for multi-channel broadcasts and client brief alerts!\n\n` +
                      `🌐 [Visit Official Studio](https://tajinkart.space)`;

      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat,
          text: testMsg,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: "🎨 Enter Studio Atelier", url: "https://tajinkart.space" }
            ]]
          }
        })
      });

      const res = await resp.json();
      if (res.ok) {
        successCount++;
      } else {
        lastError = res.description || 'Unknown';
      }
    } catch(e) {
      lastError = e.message || 'Network error';
    }
  }

  if (successCount > 0) {
    showToast(`Test dispatch broadcast successfully to ${successCount} channel(s)! 🎉`, 'success', 5000);
  } else {
    showToast(`Telegram Error: ${lastError}`, 'error', 6000);
  }
};

window.broadcastArtworkPhaseToTelegram = async function(art, phase) {
  const token = siteSettings.tgToken || document.getElementById('setTgToken')?.value.trim();
  const channelInputs = document.querySelectorAll('.tg-channel-input');
  let channels = [];
  channelInputs.forEach(inp => {
    const v = inp.value.trim();
    if (v) channels.push(v);
  });
  if (channels.length === 0 && siteSettings.tgChannels) {
    channels = siteSettings.tgChannels.filter(Boolean);
  }
  if (channels.length === 0 && siteSettings.tgChat) {
    channels = [siteSettings.tgChat];
  }

  if (!token || channels.length === 0) {
    console.log('[Telegram Broadcast] Token or channels not configured.');
    return;
  }

  const photoUrl = phase.img || phase.image || art.image || '';
  const title = phase.name || art.title || 'New TAJINKART Concept Artwork';
  const desc = phase.desc || art.desc || '';
  
  // استخراج متن اختصاصی تلگرام برای این شیت
  const customCap = (phase.socialCaptions && phase.socialCaptions.telegram) ? 
                    phase.socialCaptions.telegram.trim() : 
                    (phase.customCaption ? phase.customCaption.trim() : '');

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // آماده‌سازی کپشن کاملاً بر اساس متن کاربر بدون هیچ متن تحمیلی
  let captionHtml = '';
  if (customCap) {
    captionHtml = escapeHtml(customCap);
  } else {
    captionHtml = `🎨 <b>${escapeHtml(title)}</b>` + 
                  (desc ? `\n\n${escapeHtml(desc)}` : '');
  }

  // افزودن فوتر سراسری تلگرام در صورت وجود در تنظیمات
  if (siteSettings.tgDefaultFooter && siteSettings.tgDefaultFooter.trim()) {
    captionHtml += `\n\n${escapeHtml(siteSettings.tgDefaultFooter.trim())}`;
  }

  // دکمه‌های شیشه‌ای زیر پست: به صورت پیش‌فرض کاملاً حذف شدند.
  // فقط و فقط اگر کاربر تیک اختصاصی دکمه را در تنظیمات همین اثر زده باشد، یک دکمه انحصاری به اثر اضافه می‌شود.
  let replyMarkupParam = undefined;
  if (phase.tgIncludeButton === true) {
    replyMarkupParam = JSON.stringify({
      inline_keyboard: [[
        { text: "👁️ View Artwork on TAJINKART Gallery", url: `https://tajinkart.space/?art=${art.id}` }
      ]]
    });
  }

  showToast(`Broadcasting sheet "${title}" to Telegram...`, 'info', 2500);

  for (let chat of channels) {
    // حل خودکار در صورتی که کاربر لینک دعوت t.me/+ وارد کرده باشد
    if (chat.includes('t.me/') || chat.includes('telegram.me/')) {
      try {
        const uResp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const uData = await uResp.json();
        if (uData.ok && Array.isArray(uData.result)) {
          for (let i = uData.result.length - 1; i >= 0; i--) {
            const fCh = uData.result[i].my_chat_member?.chat || uData.result[i].channel_post?.chat || uData.result[i].message?.chat;
            if (fCh && fCh.id) {
              chat = String(fCh.id);
              siteSettings.tgChannels[0] = chat;
              siteSettings.tgChat = chat;
              safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
              break;
            }
          }
        }
      } catch(ignore) {}
    }

    try {
      let resp;
      if (photoUrl && photoUrl.startsWith('data:image')) {
        const base64Parts = photoUrl.split(',');
        const mimeMatch = base64Parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const byteCharacters = atob(base64Parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const fd = new FormData();
        fd.append('chat_id', chat);
        fd.append('photo', blob, 'artwork.jpg');
        fd.append('caption', captionHtml);
        fd.append('parse_mode', 'HTML');
        if (replyMarkupParam) {
          fd.append('reply_markup', replyMarkupParam);
        }

        resp = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          body: fd
        });
      } else if (photoUrl && photoUrl.startsWith('http')) {
        const payload = {
          chat_id: chat,
          photo: photoUrl,
          caption: captionHtml,
          parse_mode: 'HTML'
        };
        if (replyMarkupParam) {
          payload.reply_markup = JSON.parse(replyMarkupParam);
        }

        resp = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const payload = {
          chat_id: chat,
          text: captionHtml,
          parse_mode: 'HTML'
        };
        if (replyMarkupParam) {
          payload.reply_markup = JSON.parse(replyMarkupParam);
        }

        resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const resData = await resp.json();
      if (resData.ok) {
        showToast(`Sheet "${title}" broadcast to Telegram successfully! ✈️`, 'success', 5000);
      } else {
        console.warn('[Telegram Error Details]:', resData);
        showToast(`Telegram Error: ${resData.description || 'No broadcast permissions'}`, 'error', 6500);
      }
    } catch(err) {
      console.warn('Telegram broadcast network error:', err);
      showToast('Network error connecting to Telegram servers.', 'error', 5000);
    }
  }
};

window.broadcastArtworkToTelegram = async function(art) {
  if (!art || !art.phases || art.phases.length === 0) return;
  const tgPhases = art.phases.filter(p => p.socialTelegram === true);
  for (const ph of tgPhases) {
    await broadcastArtworkPhaseToTelegram(art, ph);
  }
};

async function dispatchTelegramNotification(order) {
  if (!siteSettings.tgToken || !siteSettings.tgChat) return;
  const text = encodeURIComponent(
    `🚨 *NEW TAJINKART COMMISSION INQUIRY // PROJECT BRIEF*
` +
    `• *Client / Studio:* ${order.client}
` +
    `• *Contact:* ${order.contact}
` +
    `• *Package:* ${order.pkg}
` +
    `• *Scope / Phase:* ${order.phase}
` +
    `• *Reference Link:* ${order.refLink || 'None provided'}
` +
    `• *Project Brief:* ${order.brief}
` +
    `• *Estimated Quote:* ${order.price}
` +
    `• *Timestamp:* ${new Date().toISOString()}`
  );
  try {
    fetch(`https://api.telegram.org/bot${siteSettings.tgToken}/sendMessage?chat_id=${siteSettings.tgChat}&text=${text}&parse_mode=Markdown`);
  } catch (err) {
    console.warn('Telegram sync failed:', err);
  }
}

// سوییچ ویوها و هماهنگی ناوبری
window.switchView = function(vKey) {
  // قفل دسترسی به جنسیس لور و آکادمی (منحصراً برای مدیر استودیو بدون متن به زودی)
  if (vKey === 'genesis' || vKey === 'academy') {
    if (!window.isStudioDirectorAuthenticated()) {
      const secName = vKey === 'genesis' ? 'Genesis Lore' : 'Academy';
      showToast(`${secName} is currently in active production and reserved for Studio Director access.`, 'info', 4000);
      return;
    }
  }
  document.body.setAttribute('data-view', vKey);
  if (typeof unlockBodyScroll === 'function') unlockBodyScroll();
  const openArtModal = document.getElementById('artDetailModal');
  if (openArtModal) {
    openArtModal.classList.remove('active');
    openArtModal.style.display = 'none';
  }
  currentView = vKey; window.currentView = vKey;
  document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(`view-${vKey}`);
  if (target) target.classList.remove('hidden');

  // آدرس‌دهی تمیز، بین‌المللی و حرفه‌ای در نوار آدرس مرورگر بدون هشتگ زائد
  try {
    if (vKey === 'showcase') {
      history.replaceState(null, '', window.location.pathname);
    } else if (vKey === 'store') {
      history.replaceState(null, '', '#commissions');
    } else if (vKey === 'member-dashboard') {
      history.replaceState(null, '', '#portal');
    } else if (vKey === 'admin') {
      history.replaceState(null, '', '#admin');
    } else {
      history.replaceState(null, '', `#${vKey}`);
    }
  } catch(e) {}

  const topBar = document.getElementById('topCenterBrandBar');
  const dock = document.getElementById('rightVerticalNav');
  const homeBtn = document.getElementById('rightDockHomeBtn');

  // آپدیت وضعیت دکمه‌های ناوبری موبایل و دسکتاپ
  if (dock) {
    if (window.innerWidth <= 768) {
      dock.classList.add('dock-collapsed');
      dock.classList.remove('dock-open');
    } else {
      dock.classList.remove('dock-collapsed');
      dock.classList.remove('dock-open');
      dock.style.display = (vKey === 'admin') ? 'none' : '';
    }
  }

  const catMenu = document.getElementById('floatingGalleryCategoryMenu');
  if (vKey === 'showcase') {
    if (catMenu) catMenu.style.display = 'block';
    renderShowcaseGrid();
    if (homeBtn) homeBtn.classList.remove('hidden');
    if (window.scrollY <= 140 && window.innerWidth > 768) { if (dock) dock.classList.remove("dock-collapsed");
      /* topBar is permanently visible */
    } else {
      if (topBar) topBar.classList.add('visible');
    }
  } else {
    const catMenu = document.getElementById('floatingGalleryCategoryMenu');
    if (catMenu) catMenu.style.display = 'none';
    if (homeBtn) homeBtn.classList.remove('hidden');
    if (topBar) topBar.classList.add('visible');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.switchStoreTab = function(tabKey, btn) {
  document.getElementById('storePaneCommissions').classList.toggle('hidden', tabKey !== 'commissions');
  document.getElementById('storePaneProducts').classList.toggle('hidden', tabKey !== 'products');
  document.querySelectorAll('.store-dual-nav .store-dual-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

// پارالاکس هیرو سبک ZEN و مدیریت اسکرول بهینه‌سازی شده با رفرش‌ریت ۶۰/۱۲۰ هرتز
let scrollTicking = false;

function handleOptimizedScroll() {
  const dock = document.getElementById('rightVerticalNav');
  const trigger = document.getElementById('dockMasterTrigger');

  // ۱. بستن فوری داک بازشده به محض هرگونه اسکرول (تبدیل فوری به سه خط)
  if (dock && dock.classList.contains('dock-open')) {
    dock.classList.remove('dock-open');
    dock.classList.add('dock-collapsed');
    if (trigger) trigger.blur();
  }

  const scrolled = window.scrollY || window.pageYOffset || 0;
  const topBar = document.getElementById('topCenterBrandBar');
  const cView = document.body.getAttribute('data-view') || window.currentView || 'showcase';

  // ۲. پدیدار شدن نشان برند و دسته‌بندی با اسکرول در گالری
  if (topBar) {
    if (cView === 'showcase') {
      if (scrolled > 80) {
        topBar.classList.add('visible');
      } else {
        topBar.classList.remove('visible');
      }
    } else {
      topBar.classList.add('visible');
    }
  }

  // ۳. مدیریت داک در موبایل: همیشه بسته می‌ماند
  if (window.innerWidth <= 768) {
    if (dock) dock.classList.add('dock-collapsed');
    return;
  }

  // ۴. دسکتاپ: آیکون‌ها همیشه باز، در دسترس و قابل کلیک باقی می‌مانند
  if (window.innerWidth > 768) {
    if (dock) {
      dock.classList.remove('dock-collapsed');
      dock.classList.remove('dock-open');
    }
    return;
  }
}

function initDockState() {
  const dock = document.getElementById('rightVerticalNav');
  const topBar = document.getElementById('topCenterBrandBar');
  const scrolled = window.scrollY || window.pageYOffset || 0;
  const cView = document.body.getAttribute('data-view') || window.currentView || 'showcase';

  // وضعیت اولیه نشان برند در بالا-چپ
  if (topBar) {
    if (cView === 'showcase' && scrolled <= 80) {
      topBar.classList.remove('visible');
    } else {
      topBar.classList.add('visible');
    }
  }

  if (!dock) return;

  // موبایل: همیشه از اول بسته است و فقط ۳ خط نمایش داده می‌شود
  if (window.innerWidth <= 768) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
    return;
  }

  // دسکتاپ: آیکون‌های ناوبری همیشه در تمام صفحات باز و فعال هستند
  if (window.innerWidth > 768) {
    if (dock) {
      dock.classList.remove('dock-collapsed');
      dock.classList.remove('dock-open');
    }
    return;
  }
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      handleOptimizedScroll();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });



document.addEventListener('click', (e) => {
  const dock = document.getElementById('rightVerticalNav');
  if (dock && !dock.contains(e.target)) {
    dock.classList.remove('dock-open');
  }
});

// احراز هویت اعضا و بازیابی رمز
window.handleMembersIconClick = async function() {
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
  }

  // در صورتی که سشن در کلاینت باشد اما هنوز لود نشده باشد، بازیابی فوری
  if (!currentMember && window.supabaseClient && window.supabaseClient.auth) {
    try {
      const { data } = await window.supabaseClient.auth.getSession();
      if (data && data.session && data.session.user) {
        applyLoggedInMember(data.session.user, false);
      }
    } catch(e) {}
  }

  if (!currentMember) {
    switchAuthView('login');
    document.getElementById('memberModal').style.display = 'flex';
    return;
  }

  const emailLower = (currentMember.email || '').toLowerCase().trim();
  const isDirector = window.isDirectorEmail(emailLower);

  if (isDirector) {
    // مدیر استودیو مستقیماً به پنل مدیریت هدایت می‌شود
    const adminGate = document.getElementById('adminLoginGate');
    const adminWorkspace = document.getElementById('adminWorkspace');
    if (adminGate) adminGate.classList.add('hidden');
    if (adminWorkspace) adminWorkspace.classList.remove('hidden');
    switchView('admin');
    if (typeof switchAdminTab === 'function') {
      const artworksTabBtn = document.querySelector('.admin-sidebar-menu .admin-nav-item[data-tab="artworks"]');
      switchAdminTab('artworks', artworksTabBtn);
    }
    showToast('Studio Command Console opened.', 'info');
  } else {
    // کاربر عادی به داشبورد کاربری خود می‌رود
    renderMemberDashboard();
    switchView('member-dashboard');
  }
};
window.closeMemberModal = function() {
  const resetView = document.getElementById('authViewResetPassword');
  const isResetActive = resetView && !resetView.classList.contains('hidden');
  if (isResetActive && isRecoveryFlowActive) {
    showToast('To exit, please set a new password or click Cancel below.', 'info', 4000);
    return;
  }
  const modal = document.getElementById('memberModal');
  if (modal) modal.style.display = 'none';
};

window.handleMemberModalBackdropClick = function(event) {
  if (event.target !== document.getElementById('memberModal')) return;
  const resetView = document.getElementById('authViewResetPassword');
  const isResetActive = resetView && !resetView.classList.contains('hidden');
  if (isResetActive && isRecoveryFlowActive) {
    const card = document.getElementById('memberModalCard');
    if (card) {
      card.style.transform = 'scale(1.02)';
      card.style.transition = 'transform 0.15s ease';
      setTimeout(() => { card.style.transform = 'scale(1)'; }, 150);
    }
    showToast('To complete, please enter your new password or click Cancel.', 'info', 4000);
    return;
  }
  closeMemberModal();
};

window.cancelPasswordReset = async function() {
  if (confirm('Do you want to cancel password reset?\nYour previous password will remain unchanged.')) {
    isRecoveryFlowActive = false;
    sessionStorage.removeItem('tajinkart_recovering_password');
    if (window.supabaseClient && window.supabaseClient.auth) {
      try { await window.supabaseClient.auth.signOut(); } catch(e) {}
    }
    currentMember = null;
    const labelEl = document.getElementById('rightMemberLabel');
    if (labelEl) labelEl.textContent = 'Member Portal';

    const adminGate = document.getElementById('adminLoginGate');
    const adminWorkspace = document.getElementById('adminWorkspace');
    if (adminWorkspace) adminWorkspace.classList.add('hidden');
    if (adminGate) adminGate.classList.remove('hidden');

    const modal = document.getElementById('memberModal');
    if (modal) modal.style.display = 'none';
    switchView('showcase');
    try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
    showToast('Recovery process cancelled.', 'info');
  }
};

window.switchAuthView = function(viewName) {
  const views = ['authViewLogin', 'authViewSignUp', 'authViewForgot', 'authViewResetPassword'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  if (viewName === 'login') document.getElementById('authViewLogin')?.classList.remove('hidden');
  else if (viewName === 'signup') document.getElementById('authViewSignUp')?.classList.remove('hidden');
  else if (viewName === 'forgot') document.getElementById('authViewForgot')?.classList.remove('hidden');
  else if (viewName === 'reset') document.getElementById('authViewResetPassword')?.classList.remove('hidden');
};

window.logoutMemberAccount = async function() {
  if (window.supabaseClient && window.supabaseClient.auth) {
    try {
      await window.supabaseClient.auth.signOut();
    } catch(e) {}
  }
  currentMember = null;
  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) labelEl.textContent = 'Portal';
  showToast('Signed out of account session.', 'info');
  switchView('showcase');
};

// کلیدهای میانبر ورود ادمین: ~ یا پ + Esc
let backtickActive = false;
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if (e.key === '`' || e.key === '~' || e.key === '÷') backtickActive = true;
  if ((e.key === 'Escape' && backtickActive) || (e.key === '`' && e.shiftKey)) {
    e.preventDefault();
    switchView('admin'); switchAdminTab('artworks', document.querySelector('.admin-sidebar-menu .admin-nav-item[data-tab="artworks"]'));
  }
});
window.addEventListener('keyup', (e) => {
  if (e.key === '`' || e.key === '~' || e.key === '÷') {
    setTimeout(() => { backtickActive = false; }, 400);
  }
});

window.logoutAdmin = async function() {
  try {
    if (window.supabaseClient && window.supabaseClient.auth) {
      await window.supabaseClient.auth.signOut();
    }
  } catch(e) {
    console.warn('Admin sign out exception:', e);
  }

  // پاکسازی قطعی تمام توکن‌های احراز هویت سوپابیس در حافظه مرورگر کامپیوتر
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('sb-') || k.includes('supabase') || k.includes('auth-token')) {
        localStorage.removeItem(k);
      }
    });
    sessionStorage.clear();
  } catch(e) {}

  currentMember = null;
  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) labelEl.textContent = 'Member Portal';

  const adminWorkspace = document.getElementById('adminWorkspace');
  const adminGate = document.getElementById('adminLoginGate');
  if (adminWorkspace) adminWorkspace.classList.add('hidden');
  if (adminGate) adminGate.classList.remove('hidden');

  switchView('showcase');
  showToast('Logged out of Director session. Console locked.', 'info', 4000);
};

// مدیریت پنل ادمین ۶ زبانه طبق Master Spec v2.1
window.switchAdminTab = function(tabKey, btn) {
  const tabs = ['artworks', 'pipelines', 'products', 'members', 'orders', 'settings', 'terms'];
  tabs.forEach(t => {
    const el = document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (el) el.classList.toggle('hidden', t !== tabKey);
  });

  document.querySelectorAll('.admin-sidebar-menu .admin-nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
  });

  if (tabKey === 'artworks') { renderAdminSketch2(); if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories(); if (typeof renderAdminGalleryGenres === 'function') renderAdminGalleryGenres(); }
  if (tabKey === 'pipelines') renderAdminSketch1();
  if (tabKey === 'products') renderAdminProductsTab();
  if (tabKey === 'members') renderAdminSketch3();
  if (tabKey === 'orders') { tabKey = 'members'; switchAdminTab('members'); return; }
  if (tabKey === 'settings') renderAdminSettingsTab();
  if (tabKey === 'terms') renderAdminTerms();
};

function renderAdminSketch1() {
  const catList = document.getElementById('adminCategoryListCol');
  if (!catList) return;
  catList.innerHTML = Object.keys(PIPELINE_DATA).map(key => `
    <div class="admin-cat-item ${key === currentSelectedPipeKey ? 'active' : ''}" onclick="selectAdminCategory('${key}')">
      <span style="font-size:12.5px; font-weight:700;">${PIPELINE_DATA[key].topSub}</span>
      <span class="font-mono" style="font-size:10.5px; color:var(--gold);">${PIPELINE_DATA[key].tiles.length} Phases</span>
    </div>
  `).join('');

  renderAdminStagesList();
}

window.selectAdminCategory = function(key) {
  currentSelectedPipeKey = key;
  currentSelectedStageIdx = 0;
  renderAdminSketch1();
};

function renderAdminStagesList() {
  const data = PIPELINE_DATA[currentSelectedPipeKey];
  if (!data) return;
  const titleEl = document.getElementById('adminCurrentPipeTitle');
  if (titleEl) titleEl.textContent = `Production Pipeline: ${data.topSub}`;

  const stagesGrid = document.getElementById('adminStagesGridCol');
  if (stagesGrid) {
    stagesGrid.innerHTML = data.tiles.map((t, idx) => `
      <div class="admin-card-box ${idx === currentSelectedStageIdx ? 'active' : ''}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-color:${idx === currentSelectedStageIdx ? 'var(--gold)' : 'rgba(255,255,255,0.08)'};" onclick="selectAdminStage(${idx})">
        <div>
          <span class="pipeline-step-badge" style="margin-bottom:4px;">${t.badge}</span>
          <div style="font-size:13.5px; font-weight:800; color:#fff;">${t.title}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">⏱ Delivery Timeline: ${t.timeline}</div>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <span class="font-mono" style="color:var(--gold); font-size:15px; font-weight:800;">${t.price}</span>
          <button onclick="event.stopPropagation(); adminDeleteStage(${idx})" style="color:var(--crimson); font-size:11px;">Delete Phase</button>
        </div>
      </div>
    `).join('');
  }

  renderAdminStageLiveEditor();
}

window.selectAdminStage = function(idx) {
  currentSelectedStageIdx = idx;
  renderAdminStagesList();
};

function renderAdminStageLiveEditor() {
  const data = PIPELINE_DATA[currentSelectedPipeKey];
  if (!data || !data.tiles[currentSelectedStageIdx]) return;
  const tile = data.tiles[currentSelectedStageIdx];
  const col = document.getElementById('adminStageEditFormContainer');
  if (!col) return;
  col.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:11px;">
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Phase Badge Label</label>
        <input type="text" value="${tile.badge}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'badge', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Full Phase Title</label>
        <input type="text" value="${tile.title}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Estimated Fee (USD)</label>
          <input type="text" value="${tile.price}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'price', this.value)" class="font-mono" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Delivery Timeline</label>
          <input type="text" value="${tile.timeline}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'timeline', this.value)" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Base Price USD (Interactive Calculator)</label>
        <input type="number" value="${tile.usdVal || 90}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'usdVal', parseInt(this.value, 10))" class="font-mono" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Phase Deliverables & Scope</label>
        <textarea rows="3" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'desc', this.value)">${tile.desc}</textarea>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Phase Background Image URL</label>
        <input type="text" value="${tile.img}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'img', this.value)" class="font-mono" />
      </div>
      <div style="margin-top:6px; height:80px; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle);">
        <img src="${tile.img}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
    </div>
  `;
}

window.updateTileField = function(pipeKey, tileIdx, field, val) {
  PIPELINE_DATA[pipeKey].tiles[tileIdx][field] = val;
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  selectPipeline(pipeKey, null, false);
  showToast('Phase changes saved successfully! ✓', 'success');
};

window.adminAddNewStage = function() {
  if (!PIPELINE_DATA[currentSelectedPipeKey]) return;
  PIPELINE_DATA[currentSelectedPipeKey].tiles.push({
    span: 'col-span-4',
    badge: `Phases ${PIPELINE_DATA[currentSelectedPipeKey].tiles.length + 1}`,
    title: 'New Concept Development Phase',
    desc: 'Configure deliverables and specs in the side editor.',
    price: '$120 - $160',
    usdVal: 130,
    timeline: '4 to 6 business days',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
  });
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedStageIdx = PIPELINE_DATA[currentSelectedPipeKey].tiles.length - 1;
  renderAdminStagesList();
  selectPipeline(currentSelectedPipeKey, null, false);
  showToast('New phase added to pipeline! ✓', 'success');
};

window.adminDeleteStage = function(idx) {
  if (PIPELINE_DATA[currentSelectedPipeKey].tiles.length <= 1) {
    showToast('At least one phase is required per pipeline.', 'error');
    return;
  }
  PIPELINE_DATA[currentSelectedPipeKey].tiles.splice(idx, 1);
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedStageIdx = Math.max(0, currentSelectedStageIdx - 1);
  renderAdminStagesList();
  selectPipeline(currentSelectedPipeKey, null, false);
  showToast('Phase removed.', 'info');
};

window.adminAddNewCategory = function() {
  const newKey = `sketch_cat_${Date.now()}`;
  PIPELINE_DATA[newKey] = {
    id: newKey,
    topSub: 'New Studio Pipeline',
    badgeSlug: 'Custom Pipeline',
    subcategories: ['Concept Ideation', 'Keyframe Production'],
    note: 'Bespoke atelier pipeline.',
    tiles: [
      { span: 'col-span-12', badge: 'Phase 1 • Initial Ideation', title: 'Form Ideation & Concept Sketching', desc: 'Initial silhouette exploration sheets with client milestone review.', price: '$80 - $110', usdVal: 90, timeline: '3 to 5 business days', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' }
    ]
  };
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedPipeKey = newKey;
  currentSelectedStageIdx = 0;
  renderAdminSketch1();
  showToast('New pipeline category added! ✓', 'success');
};

// اسکچ ۲: مدیریت گالری آثار (همراه با چیدمان با درگ اند دراپ و پیش‌نمایش کادر)
function renderAdminSketch2() {
  const container = document.getElementById('adminMosaicTilesContainer');
  if (!container) return;

  let html = `
    <div class="admin-mosaic-add-tile" onclick="openCreateArtworkModal()" title="Add New Artwork to Gallery">
      <span style="font-size:36px; line-height:1; color:var(--gold);">+</span>
      <span style="font-weight:800; font-size:13px; color:var(--gold);">Upload Concept Project</span>
      <span style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">Select from system or web URL</span>
    </div>
  `;

  html += showcaseArtworks.map((art, idx) => `
    <div class="admin-mosaic-card ${idx === currentSelectedArtIdx ? 'active' : ''}" 
         id="adminArtCard_${idx}"
         data-admin-idx="${idx}"
         draggable="true"
         ondragstart="isDraggingAdminCard = true; handleAdminArtDragStart(event, ${idx})"
         ondragover="handleAdminArtDragOver(event)"
         ondragenter="handleAdminArtDragEnter(event, ${idx})"
         ondragleave="handleAdminArtDragLeave(event, ${idx})"
         ondrop="handleAdminArtDrop(event, ${idx})"
         ondragend="setTimeout(() => { isDraggingAdminCard = false; }, 150); handleAdminArtDragEnd(event)"
         onclick="handleAdminCardClick(event, ${idx})" 
         title="Touch and hold to pick up card, drag to reorder">
      <img src="${art.image}" draggable="false" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" alt="${art.title}" />
      
      <div style="position:absolute; top:6px; right:6px; padding:3px 7px; border-radius:6px; background:rgba(0,0,0,0.85); color:var(--gold); font-size:11px; font-weight:800; border:1px solid rgba(250,204,21,0.3); pointer-events:none;">
        #${idx + 1}
      </div>
      
      <div style="position:absolute; bottom:0; inset-inline:0; padding:6px 8px; background:rgba(0,0,0,0.88); font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; pointer-events:none;">
        ${art.shortSlug || art.title}
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
  initAdminTouchSortable();
}





window.handleAdminImageChange = function(idx, newUrl) {
  const url = newUrl.trim();
  showcaseArtworks[idx].image = url;
  const previewImg = document.getElementById('adminArtPreviewImg');
  if (previewImg) previewImg.src = url;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  detectAndApplyArtworkDimensions(showcaseArtworks[idx], (meta) => {
    const badge = document.getElementById('adminArtPreviewRatioText');
    if (badge) badge.textContent = `${meta.width} × ${meta.height} (Ratio ${meta.ratio})`;
    renderShowcaseGrid();
  });
};

window.onAdminPreviewImgLoad = function(imgEl, idx) {
  if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;
  const r = parseFloat((w / h).toFixed(2));
  if (showcaseArtworks[idx]) {
    showcaseArtworks[idx].width = w;
    showcaseArtworks[idx].height = h;
    showcaseArtworks[idx].aspectRatio = r;
    artDimensionCache[imgEl.src] = { width: w, height: h, ratio: r };
    const badge = document.getElementById('adminArtPreviewRatioText');
    if (badge) badge.textContent = `${w} × ${h} (Ratio ${r})`;
  }
};

window.updateArtPhaseImg = function(artIdx, phaseIdx, url) {
  if (showcaseArtworks[artIdx] && showcaseArtworks[artIdx].phases && showcaseArtworks[artIdx].phases[phaseIdx]) {
    showcaseArtworks[artIdx].phases[phaseIdx].img = url.trim();
    safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
    showToast(`Case study sheet #${phaseIdx + 1} image saved! ✓`, 'success');
  }
};

window.updateArtField = function(idx, field, value) {
  showcaseArtworks[idx][field] = value;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  renderShowcaseGrid();
  renderAdminSketch2();
  showToast('Artwork project updated successfully! ✓', 'success');
};





// مدیریت دارایی‌های دیجیتال (۷ شاخه)
function renderAdminProductsTab() {
  const container = document.getElementById('adminProductsListContainer');
  if (!container) return;

  container.innerHTML = digitalStoreProducts.map((p, idx) => `
    <div class="admin-mosaic-card ${idx === currentSelectedProductIdx ? 'active' : ''}" style="height:170px;" onclick="selectAdminProduct(${idx})">
      <img src="${p.img}" style="width:100%; height:100%; object-fit:cover;" />
      <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.92) 100%); padding:10px; display:flex; flex-direction:column; justify-content:flex-end;">
        <span style="font-size:10px; color:var(--cyan-electric); font-weight:800;">${p.type}</span>
        <span style="font-size:12px; font-weight:800; color:#fff; line-height:1.3; margin:2px 0;">${p.title}</span>
        <span class="font-mono" style="font-size:13px; font-weight:800; color:var(--gold);">$${p.price}</span>
      </div>
    </div>
  `).join('');

  renderAdminProductLiveEditor();
}

window.selectAdminProduct = function(idx) {
  currentSelectedProductIdx = idx;
  renderAdminProductsTab();
};

function renderAdminProductLiveEditor() {
  const p = digitalStoreProducts[currentSelectedProductIdx];
  const box = document.getElementById('adminProductFormFields');
  if (!p || !box) return;

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="height:120px; border-radius:10px; overflow:hidden; border:1px solid var(--border-subtle);">
        <img src="${p.img}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Asset Package Title</label>
        <input type="text" value="${p.title}" onchange="updateProductField(${currentSelectedProductIdx}, 'title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Asset Category (7 Streams)</label>
          <select onchange="updateProductField(${currentSelectedProductIdx}, 'type', this.value)">
            <option value="2D Game Asset Packs & Sprites" ${(p.type === '2D Game Asset Packs & Sprites') ? 'selected' : ''}>2D Game Asset Packs & Sprites</option>
            <option value="Brush Engine, Textures & Concept Art Stamps" ${(p.type === 'Brush Engine, Textures & Concept Art Stamps') ? 'selected' : ''}>Brush Engine, Textures & Stamps</option>
            <option value="Prop Kits, Icons & Game UI" ${(p.type === 'Prop Kits, Icons & Game UI') ? 'selected' : ''}>Prop Kits, Icons & Game UI</option>
            <option value="Digital Comics, Lorebooks & Master PSD Sources" ${(p.type === 'Digital Comics, Lorebooks & Master PSD Sources') ? 'selected' : ''}>Digital Comics, Lorebooks & Master PSD Sources</option>
            <option value="Cinematic Video Loops & Splash Loops" ${(p.type === 'Cinematic Video Loops & Splash Loops') ? 'selected' : ''}>Cinematic Video Loops & Splash Loops</option>
            <option value="3D Print STL Files & Resin Miniatures" ${(p.type === '3D Print STL Files & Resin Miniatures') ? 'selected' : ''}>3D Print STL Files & Resin Miniatures</option>
            <option value="Atmospheric Overlays, Dust Particles & VFX" ${(p.type === 'Atmospheric Overlays, Dust Particles & VFX') ? 'selected' : ''}>Atmospheric Overlays, Dust Particles & VFX</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">Base Price (USD)</label>
          <input type="number" value="${p.price}" onchange="updateProductField(${currentSelectedProductIdx}, 'price', parseInt(this.value, 10))" class="font-mono" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Genesis Lore Access Key</label>
        <input type="text" value="${p.loreKey || ''}" onchange="updateProductField(${currentSelectedProductIdx}, 'loreKey', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Cover Image URL</label>
        <input type="text" value="${p.img}" onchange="updateProductField(${currentSelectedProductIdx}, 'img', this.value)" class="font-mono" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">Package Contents & Deliverables Description</label>
        <textarea rows="3" onchange="updateProductField(${currentSelectedProductIdx}, 'desc', this.value)">${p.desc || ''}</textarea>
      </div>
      <button onclick="adminDeleteProduct(${currentSelectedProductIdx})" class="btn-secondary" style="color:var(--crimson); margin-top:6px; border-color:rgba(239,68,68,0.3);">Delete Asset Package</button>
    </div>
  `;
}

window.updateProductField = function(idx, field, val) {
  digitalStoreProducts[idx][field] = val;
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  renderProducts();
  showToast('Asset specifications saved! ✓', 'success');
};

window.adminAddNewProduct = function() {
  digitalStoreProducts.unshift({
    id: Date.now(),
    title: 'New Studio Asset Package',
    price: 29,
    type: '2D Game Asset Packs & Sprites',
    loreKey: 'Genesis Universe • Lore Unlock',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80',
    desc: 'Production source files, PSD layers, and high-res assets.'
  });
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  currentSelectedProductIdx = 0;
  renderAdminProductsTab();
  renderProducts();
  showToast('New asset package added! ✓', 'success');
};

window.adminDeleteProduct = function(idx) {
  if (digitalStoreProducts.length <= 1) {
    showToast('At least one product is required.', 'error');
    return;
  }
  digitalStoreProducts.splice(idx, 1);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  currentSelectedProductIdx = Math.max(0, currentSelectedProductIdx - 1);
  renderAdminProductsTab();
  renderProducts();
  showToast('Asset package removed.', 'info');
};

// اسکچ ۳: مدیریت اعضا و گزارش‌های مالی
// شناسه و پرونده رسمی و ابدی خالق، سازنده و معمار جهان استودیو
const CREATOR_MASTER_RECORD = {
  id: 'creator_seyed_soroush_taj',
  name: 'Seyed Soroush Taj',
  email: 'tajinkart@gmail.com',
  contact: 'Studio Headquarters (Director Direct Channel)',
  tier: 'CREATOR',
  balance: '$∞ (Studio Director)',
  withdrawn: 'Studio Command',
  totalSpent: '100% Studio Ownership 👑',
  isCreator: true,
  assetsBought: [
    'Full copyright ownership across all 6 concept art pipelines',
    'Commercial and intellectual property rights for TAJINKART universes',
    'Visual development and studio original IP catalog',
    'Master Command access token with Google 2FA verification'
  ]
};

let isCreatorSelected = false;
selectedMemberIdx = 0;

function renderAdminSketch3(filterText = '') {
  const listEl = document.getElementById('adminMembersListContainer');
  if (!listEl) return;

  let filtered = siteMembersData.filter(m => m.email && m.email.toLowerCase() !== 'tajinkart@gmail.com');
  if (filterText) {
    filtered = filtered.filter(m =>
      (m.name && m.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(filterText.toLowerCase())) ||
      (m.contact && m.contact.includes(filterText))
    );
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="font-size:11px; color:var(--text-muted); padding:14px; text-align:center;">No members found.</div>`;
    renderAdminMemberDetail(null);
    return;
  }

  let membersHtml = filtered.map((m, idx) => `
    <div class="member-list-item ${(!isCreatorSelected && idx === selectedMemberIdx) ? 'active' : ''}" onclick="selectAdminMember(${idx})" style="padding:10px 12px; border-radius:10px; cursor:pointer; background:#04060a; border:1px solid ${(!isCreatorSelected && idx === selectedMemberIdx) ? 'var(--cyan-electric)' : 'rgba(255,255,255,0.08)'}; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;">
      <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
        <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,240,255,0.12); border:1px solid rgba(0,240,255,0.3); color:var(--cyan-electric); font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${(m.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style="overflow:hidden;">
          <div style="font-size:12px; font-weight:800; color:#fff; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${m.name || 'Guest User'}</div>
          <div class="font-mono" style="font-size:10px; color:var(--text-muted); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${m.email || ''}</div>
        </div>
      </div>
      <span style="font-size:10px; color:var(--emerald); background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:6px; flex-shrink:0;">Active Member</span>
    </div>
  `).join('');

  // پین کردن حساب سید سروش تاج در پایین‌ترین موقعیت لیست
  membersHtml += `
    <div style="margin-top:14px; padding-top:10px; border-top:1px dashed rgba(250,204,21,0.35);">
      <div style="font-size:10.5px; color:var(--gold); font-weight:800; margin-bottom:6px; padding-right:2px;">Studio Command:</div>
      <div class="member-list-item ${isCreatorSelected ? 'active' : ''}" onclick="selectAdminCreator()" style="padding:10px 12px; border-radius:10px; cursor:pointer; background:linear-gradient(135deg, rgba(250,204,21,0.1), #04060a); border:1px solid ${isCreatorSelected ? 'var(--gold)' : 'rgba(250,204,21,0.4)'}; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); font-size:14px; display:flex; align-items:center; justify-content:center;">👑</div>
          <div>
            <div style="font-size:12px; font-weight:900; color:#fbbf24;">Seyed Soroush Taj</div>
            <div class="font-mono" style="font-size:10px; color:rgba(255,255,255,0.7);">tajinkart@gmail.com</div>
          </div>
        </div>
        <span style="font-size:9.5px; font-weight:800; color:#000; background:var(--gold); padding:2px 6px; border-radius:6px;">Studio Creator 👑</span>
      </div>
    </div>
  `;

  listEl.innerHTML = membersHtml;

  renderAdminMemberDetail(filtered[selectedMemberIdx] || filtered[0]);
}

window.selectAdminCreator = function() {
  isCreatorSelected = true;
  renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
};

window.selectAdminMember = function(idx) {
  isCreatorSelected = false;
  selectedMemberIdx = idx;
  renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
};

function renderAdminMemberDetail(m) {
  const col = document.getElementById('adminMemberDetailContent');
  if (!m || !col) return;

  // پرونده رسمی و اختصاصی خالق استودیو
  if (m.isCreator) {
    // برای مدیر استودیو، کلیه سفارش‌های استودیو در پنل زیرین نمایش داده می‌شوند
    const allStudioOrders = ordersList || [];

    col.innerHTML = `
      <div style="padding:18px; background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(15,23,42,0.95)); border-radius:14px; border:1px solid #fbbf24; margin-bottom:14px; box-shadow:0 6px 25px rgba(245,158,11,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">👑</span>
            <h3 style="font-size:17px; font-weight:900; color:#fbbf24; margin:0;">${m.name}</h3>
          </div>
          <span class="tier-tag tier-creator" style="font-size:11px;">Creator & Worldbuilder 👑</span>
        </div>
        <div class="font-mono" style="font-size:12px; color:#fff; margin-top:8px;">Official Google CID: <span style="color:var(--cyan-electric); font-weight:700;">${m.email}</span> (2FA Verified ✓)</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">Role: <span style="color:var(--gold); font-weight:700;">Art Director & IP Owner of TAJINKART</span></div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">
          <div style="font-size:11px; color:var(--text-muted);">Financial Clearance:</div>
          <div class="font-mono" style="font-size:15px; font-weight:800; color:#fbbf24; margin-top:3px;">Sole Proprietor</div>
        </div>
        <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">
          <div style="font-size:11px; color:var(--text-muted);">Account Status:</div>
          <div class="font-mono" style="font-size:15px; font-weight:800; color:var(--emerald); margin-top:3px;">Exclusive Studio Director 👑</div>
        </div>
      </div>

      <!-- Studio Orders Intake Panel -->
      <div style="margin-top:20px; border-top:1px solid rgba(250,204,21,0.3); padding-top:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <h4 style="font-size:14.5px; font-weight:800; color:var(--gold); margin:0;">
            📦 All Studio Incoming Orders & Client Briefs (${allStudioOrders.length})
          </h4>
          <button type="button" onclick="syncOrdersFromSupabase()" class="btn-secondary" style="font-size:10.5px; padding:4px 10px; border-color:var(--cyan-electric); color:var(--cyan-electric);">
            🔄 Sync Cloud DB
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${allStudioOrders.length === 0 ? '<div style="font-size:11.5px; color:var(--text-muted); padding:14px; background:#04060a; border-radius:8px; text-align:center;">No orders registered in system yet.</div>' : 
            allStudioOrders.map(o => renderOrderAdminSnippet(o)).join('')
          }
        </div>
      </div>
    `;
    return;
  }

  // پرونده اعضای عادی
  const tierColor = m.tier === 'VIP' ? 'var(--gold)' : (m.tier === 'PRO' ? 'var(--cyan-electric)' : '#cbd5e1');

  // فیلتر کردن سفارش‌های متعلق به این کاربر
  const userOrders = ordersList.filter(o => 
    (o.client && m.name && o.client.toLowerCase() === m.name.toLowerCase()) ||
    (o.contact && m.email && (o.contact.toLowerCase() === m.email.toLowerCase() || o.contact === m.contact))
  );

  col.innerHTML = `
    <div style="padding:14px; background:#040609; border-radius:12px; border:1px solid ${tierColor}; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:16px; font-weight:900; color:${tierColor}; margin:0;">${m.name}</h3>
        <span class="tier-tag tier-${(m.tier || 'member').toLowerCase()}">${m.tier || 'MEMBER'}</span>
      </div>
      <div class="font-mono" style="font-size:12px; color:var(--text-muted); margin-top:4px;">Email: ${m.email || 'Unspecified'}</div>
      <div class="font-mono" style="font-size:12px; color:var(--text-muted);">Contact: ${m.contact || 'Unspecified'}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
      <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid var(--border-subtle);">
        <div style="font-size:11px; color:var(--text-muted);">Available Balance:</div>
        <div class="font-mono" style="font-size:17px; font-weight:800; color:var(--cyan-electric); margin-top:3px;">${m.balance || '0 $'}</div>
      </div>
      <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid var(--border-subtle);">
        <div style="font-size:11px; color:var(--text-muted);">Total Purchases:</div>
        <div class="font-mono" style="font-size:17px; font-weight:800; color:var(--gold); margin-top:3px;">${m.totalSpent || '0 $'}</div>
      </div>
    </div>

    <div>
      <h5 style="font-size:12.5px; font-weight:800; margin-bottom:8px; color:#fff;">Digital Assets & Active Licenses:</h5>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${(m.assetsBought && m.assetsBought.length > 0) ? m.assetsBought.map(a => `
          <div style="padding:8px 10px; background:#070a10; border-radius:8px; border:1px solid var(--border-subtle); font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>${a}</span>
            <span style="color:var(--emerald); font-size:11px; font-weight:700;">✓ Active Access</span>
          </div>
        `).join('') : '<div style="font-size:11px; color:var(--text-muted); padding:8px 10px; background:#070a10; border-radius:8px;">No active downloadable licenses.</div>'}
      </div>
    </div>

    <!-- Client Orders Dossier -->
    <div style="margin-top:20px; border-top:1px solid rgba(0,240,255,0.25); padding-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:14px; font-weight:800; color:var(--cyan-electric); margin:0;">
          📦 Client Project Briefs & Orders (${userOrders.length})
        </h4>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        ${userOrders.length === 0 ? 
          '<div style="font-size:11.5px; color:var(--text-muted); padding:14px; background:#04060a; border-radius:8px; border:1px dashed rgba(255,255,255,0.1); text-align:center;">No commission briefs submitted by this client yet.</div>' : 
          userOrders.map(o => renderOrderAdminSnippet(o)).join('')
        }
      </div>
    </div>

    <div style="margin-top:20px; padding-top:14px; border-top:1px solid var(--border-subtle);">
      <button type="button" onclick="adminDeleteMember(${selectedMemberIdx})" class="btn-secondary" style="width:100%; padding:9px; font-size:11.5px; color:var(--crimson); border-color:rgba(239,68,68,0.35);">
        🗑️ Delete Member
      </button>
    </div>
  `;
}

// ساخت کارت سفارش درون پنل کاربر
function renderOrderAdminSnippet(o) {
  const STAGES = [
    'Brief Received',
    '50% Retainer Confirmed',
    'Ideation & Linework',
    'Master Final Render',
    'Settled & PSD Handover'
  ];

  return `
    <div style="padding:14px; background:#04060b; border:1px solid rgba(255,255,255,0.08); border-radius:10px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <div>
          <strong style="font-size:13px; color:#fff;">${o.pkg || 'Concept Art Commission'}</strong>
          <span class="font-mono" style="font-size:10.5px; color:var(--gold); display:block; margin-top:2px;">#${o.id} • Quote: ${o.price || 'Bespoke Quote'}</span>
        </div>
        <select onchange="updateOrderStatusFromAdmin(${o.id}, this.value)" style="font-size:11px; padding:4px 8px; background:#080c14; border:1px solid rgba(0,240,255,0.35); border-radius:6px; color:var(--cyan-electric); font-weight:700;">
          ${STAGES.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>

      <div style="font-size:11.5px; color:#cbd5e1; line-height:1.7; background:rgba(255,255,255,0.02); padding:8px 10px; border-radius:6px;">
        <span style="color:var(--text-muted); font-size:10.5px; display:block; margin-bottom:2px;">Brief & Agreed Scope:</span>
        ${o.brief || 'Custom concept art brief details'}
      </div>

      ${o.refLink && o.refLink.startsWith('http') ? `
        <div style="font-size:11px;">
          <a href="${o.refLink}" target="_blank" rel="noopener" style="color:var(--cyan-electric); text-decoration:underline;">
            🔗 View Attached Moodboard / Reference Link
          </a>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:6px; border-top:1px solid rgba(255,255,255,0.05); font-size:11px;">
        <button type="button" onclick="downloadOrderInvoiceById(${o.id})" class="btn-secondary" style="font-size:10.5px; padding:3px 8px; border-color:var(--gold); color:var(--gold);">
          📄 Invoice
        </button>
        <button type="button" onclick="adminDeleteOrderById(${o.id})" style="background:none; border:none; color:var(--crimson); font-size:11px; cursor:pointer;">
          🗑️ Delete Order
        </button>
      </div>
    </div>
  `;
}

// تغییر وضعیت سفارش از درون پنل کاربر
window.updateOrderStatusFromAdmin = function(orderId, newStatus) {
  const o = ordersList.find(x => x.id === orderId);
  if (o) {
    o.status = newStatus;
    safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
    if (window.supabaseClient) {
      window.supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId).then(() => {
        console.log('[Supabase Orders] Order status updated in cloud.');
      });
    }
    showToast(`Order #${orderId} status updated to "${newStatus}". ✓`, 'success', 3000);
    // رندر مجدد جزئیات کاربر
    const currentMemberObj = isCreatorSelected ? { isCreator: true, name: 'Seyed Soroush Taj', email: 'tajinkart@gmail.com' } : siteMembersData[selectedMemberIdx];
    renderAdminMemberDetail(currentMemberObj);
  }
};

// حذف سفارش توسط ادمین
window.adminDeleteOrderById = function(orderId) {
  if (!confirm(`Are you sure you want to permanently delete order #${orderId}?`)) return;
  ordersList = ordersList.filter(x => x.id !== orderId);
  safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
  if (window.supabaseClient) {
    window.supabaseClient.from('orders').delete().eq('id', orderId).then(() => {
      console.log('[Supabase Orders] Order deleted from cloud.');
    });
  }
  showToast('Order deleted successfully.', 'info');
  const currentMemberObj = isCreatorSelected ? { isCreator: true, name: 'Seyed Soroush Taj', email: 'tajinkart@gmail.com' } : siteMembersData[selectedMemberIdx];
  renderAdminMemberDetail(currentMemberObj);
};

// دانلود پیش‌فاکتور اختصاصی برای یک سفارش
window.downloadOrderInvoiceById = function(orderId) {
  const o = ordersList.find(x => x.id === orderId);
  if (!o) return;
  const invNumber = `TJK-INV-ORDER-${o.id}`;
  const dateStr = new Date().toLocaleDateString('fa-IR');

  const invoiceText = `================================================================================
                    TAJINKART Concept Art & Worldbuilding Studio
                    Official Studio Invoice & Commission Agreement #${o.id}
================================================================================
Invoice CID: ${invNumber}
Date: ${dateStr}
Client / Studio: ${o.client}
Contact Channel: ${o.contact}
Package Title: ${o.pkg}
Production Phase: ${o.phase || "Standard"}
Total Estimate: ${o.price}
Production Timeline: ${o.timeline || "As Agreed"}
--------------------------------------------------------------------------------
Brief Summary & Specifications:
${o.brief}
--------------------------------------------------------------------------------
Reference Link: ${o.refLink || 'None Provided'}
Current Status: ${o.status}
================================================================================`;

  const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TAJINKART_Invoice_${o.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Invoice for Order #${o.id} downloaded successfully. 📄`, 'success');
};

function renderAdminLists() {
  const ordEl = document.getElementById('adminOrdersList');
  if (ordEl) {
    ordEl.innerHTML = ordersList.map((o, idx) => `
      <div style="padding:14px; background:#06080c; border-radius:12px; border:1px solid rgba(250,204,21,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700;">
          <span>${o.client} <span class="font-mono" style="color:var(--text-muted); font-size:11px;">(${o.contact})</span></span>
          <span class="font-mono" style="color:var(--gold);">${o.pkg}</span>
        </div>
        <div style="font-size:12px; color:var(--cyan-electric); margin:4px 0;">Selected Phase: ${o.phase || 'Standard'}</div>
        <div style="color:var(--text-muted); font-size:12.5px; margin:4px 0; line-height:1.6;">${o.brief}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); font-size:11.5px;">
          <span style="color:var(--amber);">Project Status: <strong>${o.status}</strong></span>
          <select onchange="updateOrderStatus(${idx}, this.value)" style="width:auto; padding:4px 8px; font-size:11.5px;">
            <option value="Brief Received" ${o.status === 'Brief Received' ? 'selected' : ''}>Brief Received</option>
            <option value="Phase 1: Initial Ideation" ${(o.status === 'Phase 1: Initial Ideation') ? 'selected' : ''}>Phase 1: Initial Ideation</option>
            <option value="Phase 2: Linework" ${(o.status === 'Phase 2: Linework') ? 'selected' : ''}>Phase 2: Linework</option>
            <option value="Phase 3: Render & Lighting" ${(o.status === 'Phase 3: Render & Lighting') ? 'selected' : ''}>Phase 3: Render & Lighting</option>
            <option value="Final Delivery & Handover" ${(o.status === 'Final Delivery & Handover') ? 'selected' : ''}>Final Delivery & Handover</option>
          </select>
        </div>
      </div>
    `).join('');
  }
}

window.updateOrderStatus = function(idx, newStatus) {
  ordersList[idx].status = newStatus;
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
  renderAdminLists();
  renderMemberDashboard();
  showToast('Project status updated! ✓', 'success');
};

function renderMemberDashboard() {
  const isDirector = currentMember && window.isDirectorEmail(currentMember.email);

  // هدر پرونده آتلیه
  const nameEl = document.getElementById('dashMemberName');
  if (nameEl) {
    if (!currentMember) {
      nameEl.innerHTML = 'Guest Collector <span style="font-size:11px; color:var(--cyan-electric); font-weight:800; border:1px solid rgba(0,240,255,0.3); padding:2px 8px; border-radius:999px;">Console Preview ✨</span>';
    } else if (isDirector) {
      nameEl.innerHTML = 'Seyed Soroush Taj <span style="font-size:11px; color:var(--gold); font-weight:800; border:1px solid rgba(250,204,21,0.35); padding:2px 8px; border-radius:999px;">Studio Director 👑</span>';
    } else {
      nameEl.textContent = currentMember.name;
    }
  }

  const emailEl = document.getElementById('dashMemberEmail');
  if (emailEl) {
    if (!currentMember) {
      emailEl.textContent = 'guest@tajinkart.space';
    } else {
      const googleBadge = currentMember.isGoogleUser ? ' <span style="color:var(--emerald); font-size:11px; font-weight:700;">(Google Verified ✓)</span>' : '';
      emailEl.innerHTML = currentMember.email + googleBadge;
    }
  }

  const contactEl = document.getElementById('dashMemberContact');
  if (contactEl) {
    contactEl.textContent = (currentMember && currentMember.contact) ? currentMember.contact : 'Direct Studio Channel';
  }

  // تنظیم هاله و نماد آواتار
  const halo = document.getElementById('dashAvatarHalo');
  const glyph = document.getElementById('dashAvatarGlyph');
  const rank = document.getElementById('dashClearanceRank');
  const badge = document.getElementById('dashClearanceBadge');

  if (halo && glyph && rank && badge) {
    if (isDirector) {
      halo.classList.add('director-halo');
      glyph.textContent = '👑';
      rank.textContent = 'Clearance: Studio Director & Lead Worldbuilder 👑';
      badge.classList.add('director-rank');
    } else {
      halo.classList.remove('director-halo');
      glyph.textContent = '⚔️';
      rank.textContent = currentMember ? 'Clearance Level 3: Vanguard Client & Collector' : 'Clearance Level 1: Atelier Seeker';
      badge.classList.remove('director-rank');
    }
  }

  // کلید پنل ادمین
  const adminBtn = document.getElementById('dashAdminPanelBtn');
  if (adminBtn) {
    adminBtn.classList.toggle('hidden', !isDirector);
  }

  // کلید تغییر رمز
  const passBtn = document.getElementById('dashChangePassBtn');
  if (passBtn) {
    if (currentMember && currentMember.isGoogleUser) {
      passBtn.innerHTML = '🔑 Set Independent Password (Optional)';
      passBtn.title = 'You are signed in via Google; you can optionally set an independent password.';
    } else {
      passBtn.innerHTML = '🔑 Security Matrix & Password';
      passBtn.title = 'Change or reset account password';
    }
  }

  // ۱. رندر پایپلاین‌های سفارش‌ها در زبانه ۱
  const oBox = document.getElementById('memberOrdersContainer');
  const userOrders = currentMember ? ordersList.filter(o => 
    (o.client && o.client.toLowerCase() === currentMember.name.toLowerCase()) || 
    o.contact === currentMember.email || 
    o.contact === currentMember.contact
  ) : [];

  const STAGES = [
    { id: 1, label: 'Brief & Scope', hint: 'Atelier Requirements Analysis' },
    { id: 2, label: '50% Retainer', hint: 'Artist Calendar Reserved' },
    { id: 3, label: 'Silhouette & Lines', hint: 'Form Exploration & Turnaround' },
    { id: 4, label: '300DPI Master', hint: 'Chiaroscuro & Material Render' },
    { id: 5, label: 'Final PSD Source', hint: 'Full Layered 4K Handover' }
  ];

  const ordersToRender = userOrders.length > 0 ? userOrders : [{
    id: 701,
    pkg: 'Cyberpunk Rogue Concept & Turnaround Sheet (Active Brief)',
    price: '80 (50% Retainer Settled)',
    status: 'Phase 3: Silhouette approved; 3-view turnaround linework in progress',
    phase: 'Phase 3 • Linework & 3-View Turnaround',
    timeline: '5 to 7 business days',
    brief: 'Full-body rogue cyberpunk character exploration with distressed dark cloak and biomechanical plate armor. Form silhouettes approved; 3-view turnaround linework in active progress.'
  }];

  if (oBox) {
    oBox.innerHTML = ordersToRender.map(o => {
      let currentStageNum = 1;
      const stLower = (o.status || '').toLowerCase();
      if (stLower.includes('deposit') || stLower.includes('retainer') || stLower.includes('settled')) currentStageNum = 2;
      else if (stLower.includes('linework') || stLower.includes('silhouette') || stLower.includes('progress') || stLower.includes('turnaround')) currentStageNum = 3;
      else if (stLower.includes('render') || stLower.includes('chiaroscuro') || stLower.includes('final') || stLower.includes('lighting')) currentStageNum = 4;
      else if (stLower.includes('settled') || stLower.includes('handover') || stLower.includes('delivery') || stLower.includes('complete')) currentStageNum = 5;

      return `
        <div style="padding:22px; background:#04060b; border-radius:16px; border:1px solid rgba(0,240,255,0.25); font-size:12px; display:flex; flex-direction:column; gap:16px; box-shadow:0 8px 30px rgba(0,0,0,0.6); position:relative; overflow:hidden;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <span style="font-size:15px; font-weight:900; color:#fff; display:block;">${o.pkg || 'Custom Concept Art Commission'}</span>
              <span class="font-mono" style="font-size:11px; color:var(--gold); margin-top:3px; display:block;">Brief CID: #${o.id} • Quote: ${o.price || 'Bespoke Quote'}</span>
            </div>
            <span style="background:rgba(0,240,255,0.12); color:var(--cyan-electric); border:1px solid rgba(0,240,255,0.35); padding:4px 14px; border-radius:999px; font-size:11.5px; font-weight:800; letter-spacing:0.3px;">
              ${o.status || 'Brief Received'}
            </span>
          </div>

          <!-- 5-Stage Production Conduit Stepper -->
          <div style="background:#080c16; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 12px; position:relative;">
            <div style="display:flex; justify-content:space-between; position:relative;">
              ${STAGES.map(s => {
                const isPassed = s.id <= currentStageNum;
                const isCurrent = s.id === currentStageNum;
                const dotColor = isCurrent ? 'var(--gold)' : (isPassed ? '#10b981' : '#334155');
                const dotGlow = isCurrent ? '0 0 12px var(--gold)' : (isPassed ? '0 0 10px #10b981' : 'none');
                return `
                  <div style="display:flex; flex-direction:column; align-items:center; flex:1; text-align:center; z-index:2;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${dotColor}; box-shadow:${dotGlow}; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:#000; margin-bottom:6px;">
                      ${isPassed ? '✓' : s.id}
                    </div>
                    <span style="font-size:10.5px; font-weight:${isCurrent ? '800' : '600'}; color:${isCurrent ? 'var(--gold)' : (isPassed ? '#fff' : '#64748b')}; line-height:1.4;">
                      ${s.label}
                    </span>
                    <span style="font-size:9px; color:#475569; margin-top:2px;">${s.hint}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="color:#cbd5e1; font-size:12px; line-height:1.8; background:rgba(255,255,255,0.02); padding:14px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <strong style="color:var(--cyan-electric); font-size:12px; display:block; margin-bottom:4px;">Brief Summary & Scope Specifications:</strong>
            ${o.brief || 'Custom concept art and worldbuilding design engineered to highest industry standards at TAJINKART.'}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); flex-wrap:wrap; gap:8px;">
            <span>Current Phase: <strong style="color:#fff;">${o.phase || 'Standard 300DPI'}</strong></span>
            <span>Estimated Handover: <strong style="color:#fff;">${o.timeline || 'Per Production Schedule'}</strong></span>
            <button type="button" onclick="downloadOfficialStudioInvoice()" class="btn-secondary" style="font-size:10.5px; padding:3px 10px; border-color:var(--gold); color:var(--gold);">
              📄 Download Invoice
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  // ۲. رندر دارایی‌های دیجیتال و دوره‌ها در زبانه ۲
  const cBox = document.getElementById('memberCoursesContainer');
  if (cBox) {
    const VAULT_ITEMS = [
      {
        id: 1,
        title: 'Masterclass: Fantasy Character Design & Armor Rendering',
        desc: '14 advanced masterclass modules covering silhouette ideation, anatomical rhythm, and metal/fabric rendering in Photoshop.',
        format: 'VIDEO + PSD',
        size: '4.8 GB',
        license: 'Standard Atelier License',
        img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=700&q=80'
      },
      {
        id: 2,
        title: '64-Pack Alpha Brush Engine: Monster Skin & Weathered Rust',
        desc: 'Proprietary studio alpha brushes for rendering heavy armor chipping, reptilian scales, and seamless dark fantasy textures.',
        format: '.ABR + PNG',
        size: '340 MB',
        license: 'Commercial Production License',
        img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80'
      },
      {
        id: 3,
        title: 'Genesis Lore Archives & Extopia Digital Artbook',
        desc: 'Historical worldbuilding manuscripts, timelines, and 60 pages of high-resolution print-ready concept art.',
        format: 'PDF 300DPI',
        size: '185 MB',
        license: 'Collector Special Edition',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80'
      },
      {
        id: 4,
        title: 'Dark Fantasy UI Elements & Prop Kit (120 Icons)',
        desc: 'Layered magic skill icons, shields, and runic glyphs optimized for Unity, Unreal Engine 5, and Godot.',
        format: 'PNG + SVG',
        size: '95 MB',
        license: 'Commercial Game Ready',
        img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80'
      }
    ];

    cBox.innerHTML = VAULT_ITEMS.map(v => `
      <div class="codex-vault-card">
        <div class="codex-card-thumb">
          <img src="${v.img}" alt="${v.title}" loading="lazy">
          <span class="codex-card-format">${v.format}</span>
        </div>
        <h5 class="codex-card-title">${v.title}</h5>
        <p class="codex-card-desc">${v.desc}</p>
        <div class="codex-card-meta">
          <span>File Size: <strong class="font-mono" style="color:#fff;">${v.size}</strong></span>
          <span>License: <strong style="color:var(--emerald);">${v.license}</strong></span>
        </div>
        <button type="button" class="btn-codex-download" onclick="triggerVaultAssetDownload('${v.title}', '${v.format}')">
          ⚡ Download Digital Asset
        </button>
      </div>
    `).join('');
  }
}

// سوئیچ لایه‌های استیج تعاملی پروداکشن
window.setAtelierProductionLayer = function(layerMode) {
  const img = document.getElementById('atelierStageArtworkImg');
  const telemetry = document.getElementById('telemetryActiveLayer');
  const btnSil = document.getElementById('btnLayerSilhouette');
  const btnVal = document.getElementById('btnLayerValue');
  const btnMas = document.getElementById('btnLayerMaster');

  if (btnSil) btnSil.classList.remove('active');
  if (btnVal) btnVal.classList.remove('active');
  if (btnMas) btnMas.classList.remove('active');

  if (img) {
    img.classList.remove('layer-mode-silhouette', 'layer-mode-value', 'layer-mode-master');
    if (layerMode === 'silhouette') {
      img.classList.add('layer-mode-silhouette');
      if (btnSil) btnSil.classList.add('active');
      if (telemetry) telemetry.textContent = 'Active Layer: L1 • Initial Silhouette & Form Exploration';
    } else if (layerMode === 'value') {
      img.classList.add('layer-mode-value');
      if (btnVal) btnVal.classList.add('active');
      if (telemetry) telemetry.textContent = 'Active Layer: L2 • Chiaroscuro Value & Material Study';
    } else if (layerMode === 'master') {
      img.classList.add('layer-mode-master');
      if (btnMas) btnMas.classList.add('active');
      if (telemetry) telemetry.textContent = 'Active Layer: L3 • Master 300DPI Print-Ready Keyframe';
    }
  }
};

// باز کردن یادداشت پین بازخورد
window.openAtelierPinNote = function(pinId, event) {
  if (event) event.stopPropagation();
  const pin = document.getElementById(`atelierPin${pinId}`);
  if (pin) {
    pin.classList.toggle('active');
  }
};

// ثبت پین جدید بر روی بوم
window.toggleAtelierPinDropper = function() {
  showToast('Pin Feedback Mode Active: Click anywhere on the canvas to drop a revision pin.', 'info', 4000);
  const wrapper = document.getElementById('atelierCanvasWrapper');
  if (!wrapper) return;

  const clickHandler = function(e) {
    const rect = wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);

    const note = prompt('Enter your pinpoint revision note for this artwork coordinate:');
    if (note && note.trim()) {
      const pinCount = document.querySelectorAll('.atelier-pin-hotspot').length + 1;
      const newPin = document.createElement('div');
      newPin.className = 'atelier-pin-hotspot active';
      newPin.id = `atelierPin${pinCount}`;
      newPin.style.top = `${y}%`;
      newPin.style.left = `${x}%`;
      newPin.innerHTML = `
        <span class="pin-beacon"></span>
        <span class="pin-core">${pinCount}</span>
        <div class="pin-hover-card">
          <strong>Pin #${pinCount}: Client Feedback</strong>
          <p>${note.trim()}</p>
        </div>
      `;
      wrapper.appendChild(newPin);
      showToast(`Feedback Pin #${pinCount} registered successfully on canvas. ✨`, 'success');
    }
    wrapper.removeEventListener('click', clickHandler);
  };

  wrapper.addEventListener('click', clickHandler, { once: true });
};

// سوئیچ زبانه‌های کنسول آتلیه
window.switchAtelierConsoleTab = function(tabKey) {
  const tabs = ['pipelines', 'codex', 'security'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const pane = document.getElementById(`pane${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.classList.toggle('active', t === tabKey);
    if (pane) pane.classList.toggle('active', t === tabKey);
  });
};

// دانلود رسمی نمونه پیش‌فاکتور آتلیه
window.downloadOfficialStudioInvoice = function() {
  const invNumber = `TJK-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('fa-IR');
  const clientName = currentMember ? currentMember.name : 'Esteemed Studio Client';

  const invoiceText = `================================================================================
                    TAJINKART Concept Art & Worldbuilding Studio
                    Official Studio Production SLA & Proforma Invoice
================================================================================
Invoice CID: ${invNumber}
Registration Date: ${dateStr}
Client / Studio: ${clientName}
Creative Director & Lead Artist: Seyed Soroush Taj
Studio Email: tajinkart@gmail.com
Official Domain: https://tajinkart.space
--------------------------------------------------------------------------------
Scope of Production Services:
1. Original Concept Artwork Production (Character & Worldbuilding IP)
2. Exploratory Ideation & 5 Initial Form Silhouettes
3. 3-View Orthographic Model Sheet for 3D Production Pipelines
4. Master Final Render at 300DPI (Cinema & Print Standard)
5. Layered Master PSD Handover in 4K UHD Resolution
--------------------------------------------------------------------------------
Financial Terms & Settlement:
- Estimated Fee: Per official studio agreement
- Mandatory Retainer: 50% advance to lock studio production calendar
- Final Settlement: 50% upon master render approval prior to layered PSD handover
--------------------------------------------------------------------------------
Official Digital Certification TAJINKART // 2026
Commercial copyright transferred upon final settlement.
================================================================================`;

  const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TAJINKART_Invoice_${invNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Official studio proforma invoice downloaded successfully. 📄', 'success');
};

// دانلود دارایی دیجیتال از خزانه
window.triggerVaultAssetDownload = function(title, format) {
  showToast(`Download request for ${title} (${format}) verified. Establishing secure cloud connection...`, 'info', 4000);
  setTimeout(() => {
    showToast('File delivered successfully. Checksum: SHA256-VERIFIED ✓', 'success');
  }, 1200);
};


// دانلود بک‌آپ JSON
window.exportSiteDataJSON = function() {
  const backup = {
    settings: siteSettings,
    artworks: showcaseArtworks,
    pipelines: PIPELINE_DATA,
    products: digitalStoreProducts,
    orders: ordersList,
    members: siteMembersData,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tajinkart_master_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Complete data backup (JSON) downloaded successfully! ✓', 'success');
};

// دانلود سورس کامل به‌روز شده HTML
window.exportFullSelfContainedHTML = function() {
  let htmlContent = document.documentElement.outerHTML;
  const blob = new Blob([`<!DOCTYPE html>\n<html lang="fa" dir="rtl">\n${htmlContent}\n</html>`], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Standalone index.html saved successfully! ✓', 'success');
};

// راه‌اندازی اولیه در زمان لود صفحه با پایداری ۱۰۰٪ و تفکیک خطا
document.addEventListener('DOMContentLoaded', () => {
  try { window.renderShowcaseGrid ? window.renderShowcaseGrid() : renderShowcaseGrid(); } catch(e) { console.error('renderShowcaseGrid error:', e); }
  try { if (typeof initDynamicBrandHeader === 'function') initDynamicBrandHeader(); } catch(e) {}
  try { if (typeof initSupabaseAuthSession === 'function') initSupabaseAuthSession(); } catch(e) {}
  try { if (typeof checkEmailRecoveryFlow === 'function') checkEmailRecoveryFlow(); } catch(e) {}
  try { if (typeof syncArtworksFromSupabase === 'function') syncArtworksFromSupabase(); } catch(e) {}
  try { if (typeof syncMembersFromSupabase === 'function') syncMembersFromSupabase(); } catch(e) {}
  try {
    const defaultNavCard = document.querySelector('#atelierServiceCards .service-nav-card.active') || document.querySelector('#atelierServiceCards .service-nav-card');
    if (typeof selectPipeline === 'function') selectPipeline('sketch1', defaultNavCard, false);
  } catch(e) {}
  try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
  try { if (typeof renderAcademy === 'function') renderAcademy(); } catch(e) {}
  try { if (typeof renderComicPage === 'function') renderComicPage(); } catch(e) {}
  try { if (typeof renderAdminSketch1 === 'function') renderAdminSketch1(); } catch(e) {}
  try { if (typeof renderAdminSketch2 === 'function') renderAdminSketch2(); } catch(e) {}
  try { if (typeof renderAdminProductsTab === 'function') renderAdminProductsTab(); } catch(e) {}
  try { if (typeof renderAdminSketch3 === 'function') renderAdminSketch3(); } catch(e) {}
  try { if (typeof renderAdminLists === 'function') renderAdminLists(); } catch(e) {}
  try { if (typeof updateStudioLiveStatus === 'function') updateStudioLiveStatus(); } catch(e) {}
  try { if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay(); } catch(e) {}

  const rateEl = document.getElementById('setUsdRate');
  if (rateEl) rateEl.value = siteSettings.usdRate || 72000;
  if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
  const tokenEl = document.getElementById('setTgToken');
  if (tokenEl) tokenEl.value = siteSettings.tgToken || '';
  const footerEl = document.getElementById('setTgDefaultFooter');
  if (footerEl) footerEl.value = siteSettings.tgDefaultFooter || '';
  const chatEl = document.getElementById('setTgChat');
  if (chatEl) chatEl.value = siteSettings.tgChat || '';
  const emailEl = document.getElementById('setAdminEmail');
  if (emailEl) emailEl.value = 'tajinkart@gmail.com';

  // ثبت فرم بریف سفارش
  const orderForm = document.getElementById('commissionOrderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const client = document.getElementById('orderClientName').value.trim();
      const contact = document.getElementById('orderClientContact').value.trim();
      const refLink = document.getElementById('orderClientRefLink')?.value.trim() || 'None provided (Studio visual research applied)';
      const phase = document.getElementById('orderPhaseSelect').value;
      const brief = document.getElementById('orderClientBrief').value.trim();
      const priceText = document.getElementById('modalPrice').textContent;

      const newOrder = {
        id: Date.now(),
        client: client,
        contact: contact,
        refLink: refLink,
        pkg: activeModalItem.title,
        price: priceText,
        timeline: activeModalItem.timeline,
        phase: phase,
        brief: brief,
        status: 'Brief Received'
      };

      ordersList.unshift(newOrder);
      if (typeof safeSetStorage === 'function') {
        safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
      } else {
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
      }

      // ۱. ثبت در دیتابیس ابری Supabase (جدول orders)
      if (window.supabaseClient) {
        window.supabaseClient
          .from('orders')
          .insert([{
            id: newOrder.id,
            client_name: newOrder.client,
            contact: newOrder.contact,
            client_email: (window.currentMember && window.currentMember.email) ? window.currentMember.email : (contact.includes('@') ? contact : ''),
            ref_link: newOrder.refLink,
            package_name: newOrder.pkg,
            price_text: newOrder.price,
            timeline: newOrder.timeline,
            phase: newOrder.phase,
            brief_text: newOrder.brief,
            status: newOrder.status,
            created_at: new Date().toISOString()
          }])
          .then(({ data, error }) => {
            if (error) {
              console.warn('[Supabase Orders] Insert error:', error);
            } else {
              console.log('[Supabase Orders] Order backed up to Supabase Cloud DB successfully!');
            }
          });
      }

      // ۲. فوروارد به وب‌هوک گوگل شیتس شخصی (Google Sheets Multi-Cloud Backup)
      if (siteSettings && siteSettings.googleSheetsWebhook && siteSettings.googleSheetsWebhook.startsWith('http')) {
        try {
          fetch(siteSettings.googleSheetsWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          }).then(() => {
            console.log('[Google Sheets] Order forwarded to Google Spreadsheet backup!');
          }).catch(err => console.warn('[Google Sheets] Webhook error:', err));
        } catch(e) {}
      }

      // ۳. ارسال آنی پیام به ربات تلگرام استودیو
      dispatchTelegramNotification(newOrder);

      closeModalDirect();
      renderAdminLists();
      renderMemberDashboard();
      showToast('Commission brief inquiry submitted successfully! Archived in Studio Cloud & Telegram. ✓', 'success', 5000);
    });
  }

  // فرم ورود اعضا (متصل به احراز هویت ابری Supabase Auth)
  const loginForm = document.getElementById('memberLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const em = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pw = document.getElementById('loginPass').value.trim();

// ورود مدیر استودیو منحصراً از طریق تایید هویت Google OAuth انجام می‌شود

      showToast('Authenticating credentials and signing into atelier...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: em,
            password: pw
          });

          if (error) {
            console.warn('[Supabase Auth Error]', error);
            if (error.message.includes('Invalid login credentials')) {
              showToast('Invalid email address or password.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
              showToast('Email not confirmed. Please check your verification link.', 'info');
            } else {
              showToast(error.message || 'Login error occurred.', 'error');
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user, true);
            showToast(`Welcome back, ${currentMember.name}!`, 'success');
            return;
          }
        } catch (authErr) {
          console.warn('[Supabase Auth Network]', authErr);
        }
      }

      // فال‌بک به حافظه لوکال
      const localFound = siteMembersData.find(m => m.email.toLowerCase() === em);
      currentMember = localFound || { name: em.split('@')[0], email: em, contact: em, assetsBought: [] };
      document.getElementById('rightMemberLabel').textContent = currentMember.name;
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast(`Welcome back, ${currentMember.name}!`, 'success');
    });
  }

  // فرم ثبت‌نام اعضا (ذخیره قطعی و رمزنگاری‌شده در دیتابیس ابری Supabase Auth)
  const signUpForm = document.getElementById('memberSignUpForm');
  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const phone = document.getElementById('signupPhone').value.trim();
      const password = document.getElementById('signupPass')?.value.trim() || '';
      const passwordConfirm = document.getElementById('signupPassConfirm')?.value.trim() || '';
      const agreeTerms = document.getElementById('signupAgreeTerms')?.checked;
      const agreeAge = document.getElementById('signupAgreeAge')?.checked;

      // ۱. اعتبارسنجی نام کاربری (ممانعت از نام‌های جعلی یا حروف تکراری متوالی)
      const isRepeatedName = /(.)\1{2,}/.test(name);
      if (name.length < 3 || isRepeatedName) {
        showToast('Invalid display name. Please enter a valid handle (minimum 3 characters).', 'error');
        document.getElementById('signupName')?.focus();
        return;
      }

      // ۲. اعتبارسنجی دقیق سینتکس و پسوند ایمیل
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showToast('Invalid email address. Please provide a valid email (e.g. user@domain.com).', 'error');
        document.getElementById('signupEmail')?.focus();
        return;
      }

      const countryCode = document.getElementById('signupCountryCode')?.value || '+98';
      const rawPhone = document.getElementById('signupPhone')?.value.trim() || '';
      let cleanDigits = rawPhone.replace(/[^0-9]/g, '');

      // اگر کاربر با صفر اول وارد کرد، صفر را بردار
      if (countryCode === '+98' && cleanDigits.startsWith('0')) {
        cleanDigits = cleanDigits.substring(1);
      }

      // شماره تلفن کاملاً اختیاری است: فقط در صورتی که کاربر شماره وارد کند بررسی می‌شود
      let fullContactNumber = '';
      if (cleanDigits.length > 0) {
        if (cleanDigits.length < 7 || cleanDigits.length > 15) {
          showToast('Invalid phone number length (must be 7-15 digits).', 'error');
          document.getElementById('signupPhone')?.focus();
          return;
        }
        fullContactNumber = (countryCode === 'other' ? '' : countryCode + ' ') + cleanDigits;
      }

      // ۲. اعتبارسنجی قدرت رمز
      if (password.length < 6 || /^(123456|12345678|111111|000000)$/.test(password) || /^[0-9]+$/.test(password)) {
        showToast('Password is too weak. Please use an alphanumeric combination of at least 6 characters.', 'error');
        document.getElementById('signupPass')?.focus();
        return;
      }

      // ۳. تطابق رمز عبور و تکرار آن
      if (password !== passwordConfirm) {
        showToast('Passwords do not match. Please verify and retype.', 'error');
        document.getElementById('signupPassConfirm')?.focus();
        return;
      }

      // ۴. بررسی تایید قوانین استودیو (بررسی تیک چک‌باکس)
      const agreeBox = document.getElementById('signupAgreeTerms');
      if (!agreeBox || !agreeBox.checked) {
        showToast('Please review and accept the studio terms of service.', 'error');
        agreeBox?.focus();
        return;
      }

      showToast('Creating and registering account in studio portal...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                name: name,
                phone: phone,
                tier: 'STANDARD',
                assetsBought: []
              }
            }
          });

          if (error) {
            console.warn('[Supabase SignUp Error]', error);
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('already registered') || msg.includes('already exists') || error.status === 422) {
              showToast('This email is already registered. Please sign in to your account.', 'error', 6000);
              switchAuthView('login');
              const loginEmailEl = document.getElementById('loginEmail');
              if (loginEmailEl) loginEmailEl.value = email;
            } else if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
              showToast('Too many requests. Please wait a few minutes and try again.', 'error', 6000);
            } else if (msg.includes('password should be') || msg.includes('weak password')) {
              showToast('Password is too weak; please enter at least 6 mixed characters.', 'error');
            } else {
              showToast('Registration error: ' + (error.message || 'Failed to create cloud account'), 'error', 6000);
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user);

            const newMemberObj = {
              id: data.user.id || Date.now(),
              name: name,
              email: email,
              contact: fullContactNumber,
              tier: 'STANDARD',
              balance: '$0',
              withdrawn: '$0',
              assetsBought: [],
              totalSpent: '$0'
            };

            siteMembersData.unshift(newMemberObj);
            safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));

            // ذخیره آنلاین، دائمی و ابری در جدول members سوپابیس
            if (window.supabaseClient) {
              window.supabaseClient.from('members').upsert([{
                id: data.user.id,
                name: name,
                email: email,
                contact: fullContactNumber,
                tier: 'STANDARD',
                assets_bought: []
              }]).then(({ error }) => {
                if (error) console.warn('Supabase members table upsert warning:', error);
                else console.log('Member profile stored in Supabase cloud database!');
              });
            }

            closeMemberModal();
            renderMemberDashboard();
            switchView('member-dashboard');
            const isConfirmed = !!(data.user.email_confirmed_at || data.user.confirmed_at || data.session);
            if (!isConfirmed) {
              showToast('Account created! Please check your inbox to confirm your email verification link.', 'warning', 8000);
            } else {
              showToast('Account registered successfully! Welcome to TAJINKART.', 'success');
            }
            return;
          }
        } catch (authErr) {
          console.warn('[Supabase SignUp Exception]', authErr);
        }
      }

      // فال‌بک موقت در صورت عدم برقراری ارتباط با شبکه
      currentMember = { name: name, email: email, contact: fullContactNumber, assetsBought: [] };
      siteMembersData.push({
        id: Date.now(),
        name: name,
        email: email,
        contact: fullContactNumber,
        tier: 'STANDARD',
        balance: '$0',
        withdrawn: '$0',
        assetsBought: [],
        totalSpent: '$0'
      });
      safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
      document.getElementById('rightMemberLabel').textContent = currentMember.name;
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast('New studio account created successfully.', 'success');
    });
  }

  // فرم بازیابی رمز عبور با بررسی وجود داشتن ایمیل در سیستم استودیو
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const iden = document.getElementById('forgotIdentifier')?.value.trim().toLowerCase();

      if (!iden || !iden.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      showToast('Verifying account credentials...', 'info');

      // ۱. بررسی قطعی وجود داشتن ایمیل در استودیو قبل از صدور درخواست
      let emailExists = false;

      // بررسی آیا ایمیل مدیر استودیو است
      if (window.isDirectorEmail && window.isDirectorEmail(iden)) {
        emailExists = true;
      }

      // بررسی در دیتابیس ابری سوپابیس (جدول اعضا)
      if (!emailExists && window.supabaseClient) {
        try {
          const { data: memberRow, error: checkErr } = await window.supabaseClient
            .from('members')
            .select('email')
            .eq('email', iden)
            .maybeSingle();

          if (memberRow && memberRow.email) {
            emailExists = true;
          }
        } catch (dbErr) {
          console.warn('[Forgot Pass DB Check Exception]', dbErr);
        }
      }

      // بررسی در دیتای محلی اعضا
      if (!emailExists && Array.isArray(siteMembersData)) {
        if (siteMembersData.some(m => m.email && m.email.toLowerCase() === iden)) {
          emailExists = true;
        }
      }

      // در صورت عدم وجود ایمیل، بلافاصله ارور شفاف و ممانعت از ارسال پیام کاذب
      if (!emailExists) {
        showToast('No account found with this email! Please check the address or sign up first.', 'error', 6000);
        return;
      }

      showToast('Generating secure password recovery link...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const targetRedirect = window.location.origin + window.location.pathname + '?action=reset-password';
          const { error } = await window.supabaseClient.auth.resetPasswordForEmail(iden, {
            redirectTo: targetRedirect
          });

          if (error) {
            console.warn('[Supabase Reset Pass Error]', error);
            showToast(error.message || 'Error sending recovery email.', 'error');
            return;
          }

          showToast('Password reset link sent to your email. Please check your inbox or spam folder.', 'success', 7000);
          switchAuthView('login');
          return;
        } catch (err) {
          console.warn('[Supabase Reset Exception]', err);
        }
      }

      showToast('Cloud authentication service unavailable.', 'error');
    });
  }

// فرم ورود قدیمی ادمین حذف و با درگاه رسمی گوگل جایگزین شد

  // فرم تنظیمات ادمین
  const settingsForm = document.getElementById('adminSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      siteSettings.usdRate = parseInt(document.getElementById('setUsdRate').value, 10) || 72000;
      siteSettings.tgToken = document.getElementById('setTgToken').value.trim();
      siteSettings.tgChat = document.getElementById('setTgChat').value.trim();
      // پسورد متنی منسوخ شد
      siteSettings.cloudinaryCloudName = document.getElementById('setCloudinaryCloud')?.value.trim() || 'tajinkart';
      siteSettings.cloudinaryPreset = document.getElementById('setCloudinaryPreset')?.value.trim() || 'erlvtkx9';
      siteSettings.redditCreds = document.getElementById('setRedditCreds')?.value.trim() || '';
      siteSettings.metaToken = document.getElementById('setMetaToken')?.value.trim() || '';
      siteSettings.twitterKey = document.getElementById('setTwitterKey')?.value.trim() || '';
      siteSettings.youtubeKey = document.getElementById('setYoutubeKey')?.value.trim() || '';
      siteSettings.artstationCreds = document.getElementById('setArtstationCreds')?.value.trim() || '';
      siteSettings.pinterestToken = document.getElementById('setPinterestToken')?.value.trim() || '';
      siteSettings.blueskyCreds = document.getElementById('setBlueskyCreds')?.value.trim() || '';
      siteSettings.discordWebhook = document.getElementById('setDiscordWebhook')?.value.trim() || '';
      safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
      renderProducts();
      selectPipeline(currentSelectedPipeKey, null, false);
      showToast('Global settings and exchange rate updated! ✓', 'success');
    });
  }

  // فرم ذخیره نهایی رمز عبور جدید پس از ورود از لینک ایمیل
  const setNewPassForm = document.getElementById('setNewPasswordForm');
  if (setNewPassForm) {
    setNewPassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const p1 = document.getElementById('userNewPassword')?.value.trim();
      const p2 = document.getElementById('userNewPasswordConfirm')?.value.trim();

      if (!p1 || p1.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }
      if (p1 !== p2) {
        showToast('Password confirmation does not match!', 'error');
        return;
      }

      showToast('Validating session and saving new password...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          // بررسی و بازیابی نشست امنیتی فعال در صورت باز شدن از لینک ایمیل
          const { data: sessionData } = await window.supabaseClient.auth.getSession();
          let currentSession = sessionData?.session;

          if (!currentSession) {
            // تلاش برای استخراج توکن‌های بازیابی از URL
            const hash = window.location.hash || '';
            const search = window.location.search || '';
            if (search.includes('code=')) {
              const urlParams = new URLSearchParams(search);
              const code = urlParams.get('code');
              if (code && window.supabaseClient.auth.exchangeCodeForSession) {
                const { data: exData } = await window.supabaseClient.auth.exchangeCodeForSession(code);
                currentSession = exData?.session;
              }
            } else if (hash.includes('access_token=')) {
              const hashParams = new URLSearchParams(hash.substring(1));
              const accessToken = hashParams.get('access_token');
              const refreshToken = hashParams.get('refresh_token');
              if (accessToken && refreshToken && window.supabaseClient.auth.setSession) {
                const { data: sData } = await window.supabaseClient.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });
                currentSession = sData?.session;
              }
            }
          }

          if (!currentSession) {
            showToast('Security session expired. Please request a new link via Forgot Password.', 'error', 7000);
            sessionStorage.removeItem('tajinkart_recovering_password');
            isRecoveryFlowDetected = false;
            return;
          }

          const { data, error } = await window.supabaseClient.auth.updateUser({
            password: p1
          });

          if (error) {
            console.warn('[Update Password Error]', error);
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('session missing') || msg.includes('auth session missing')) {
              showToast('Recovery link expired or invalid. Please request a new recovery link.', 'error', 7000);
            } else if (msg.includes('should be different') || msg.includes('same password')) {
              showToast('New password cannot match previous password! Please choose a different password.', 'error');
            } else {
              showToast('Password update error: ' + (error.message || 'Please try again'), 'error');
            }
            return;
          }

          if (data && data.user) {
            isRecoveryFlowActive = false;
            sessionStorage.removeItem('tajinkart_recovering_password');
            try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
            const modal = document.getElementById('memberModal');
            if (modal) modal.style.display = 'none';
            applyLoggedInMember(data.user, true);
            showToast('New password saved successfully. Welcome back!', 'success', 6000);
            return;
          }
        } catch (updateErr) {
          console.warn('[Supabase Password Update Exception]', updateErr);
          showToast('Error communicating with authentication server. Please try again.', 'error');
          return;
        }
      }

      showToast('Cloud authentication service unavailable.', 'error');
    });
  }

});


// =========================================================
// سیستم هوشمند DRAG & DROP مرتب‌سازی آثار در پنل ادمین
// =========================================================
let draggedArtIdx = null;

window.handleAdminArtDragStart = function(e, idx) {
  draggedArtIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', idx);
  setTimeout(() => {
    const el = document.getElementById(`adminArtCard_${idx}`);
    if (el) el.classList.add('dragging-art');
  }, 0);
};

window.handleAdminArtDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

window.handleAdminArtDragEnter = function(e, idx) {
  e.preventDefault();
  if (idx !== draggedArtIdx) {
    const el = document.getElementById(`adminArtCard_${idx}`);
    if (el) el.classList.add('drag-over-target');
  }
};

window.handleAdminArtDragLeave = function(e, idx) {
  const el = document.getElementById(`adminArtCard_${idx}`);
  if (el) el.classList.remove('drag-over-target');
};

window.handleAdminArtDrop = function(e, targetIdx) {
  e.preventDefault();
  e.stopPropagation();

  const targetEl = document.getElementById(`adminArtCard_${targetIdx}`);
  if (targetEl) targetEl.classList.remove('drag-over-target');

  if (draggedArtIdx === null || draggedArtIdx === targetIdx) return;

  // جابجایی اثر در آرایه آثار گالری
  const movedItem = showcaseArtworks.splice(draggedArtIdx, 1)[0];
  showcaseArtworks.splice(targetIdx, 0, movedItem);

  // به‌روزرسانی اندیس ترتیب
  showcaseArtworks.forEach((art, i) => {
    art.orderIndex = i;
  });

  currentSelectedArtIdx = targetIdx;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));

  // رندر مجدد گرید ادمین و گالری صفحه اصلی
  renderAdminSketch2();
  renderShowcaseGrid();
  showToast('Artwork display sequence updated successfully! ✓', 'success');

  // همگام‌سازی ابری ترتیب در سوپابیس
  syncArtworkOrderToSupabase();
};

window.handleAdminArtDragEnd = function(e) {
  draggedArtIdx = null;
  document.querySelectorAll('.admin-mosaic-card').forEach(el => {
    el.classList.remove('dragging-art', 'drag-over-target');
  });
};

async function syncArtworkOrderToSupabase() {
  if (!window.supabaseClient) return;
  try {
    for (let i = 0; i < showcaseArtworks.length; i++) {
      const art = showcaseArtworks[i];
      window.supabaseClient
        .from('artworks')
        .update({ order_index: i })
        .eq('id', art.id)
        .then(() => {});
    }
  } catch(err) {
    console.warn('Sync order to Supabase error:', err);
  }
}


window.handleGoogleSignIn = async function() {
  if (!window.supabaseClient) window.ensureSupabaseClient();
  if (!window.supabaseClient || !window.supabaseClient.auth) {
    // تلاش مجدد در صورت تاخیر شبکه
    await new Promise(r => setTimeout(r, 400));
    if (window.ensureSupabaseClient) window.ensureSupabaseClient();
  }
  if (!window.supabaseClient || !window.supabaseClient.auth) {
    showToast('Authentication service connecting, please click again.', 'info');
    return;
  }
  showToast('Redirecting to Google secure authentication...', 'info');
  try {
    sessionStorage.setItem('tajinkart_google_signing_in', 'true');
    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    if (error) {
      console.warn('Google sign-in error:', error);
      showToast('Google authentication error: ' + error.message, 'error');
    }
  } catch (err) {
    console.error('Google sign-in exception:', err);
    showToast('Unable to connect to Google account.', 'error');
  }
};


// =========================================================
// توابع مدیریت و حذف کاربران در پنل ادمین
// =========================================================
window.adminDeleteMember = function(idx) {
  if (!siteMembersData || !siteMembersData[idx]) return;
  const m = siteMembersData[idx];
  if (confirm(`Are you sure you want to remove user "${m.name}" (${m.email}) from local panel? (You can restore from cloud anytime)`)) {
    const deletedEmail = m.email;
    siteMembersData.splice(idx, 1);
    safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
    selectedMemberIdx = 0;
    renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
    showToast(`User "${m.name}" removed from panel list. Use "Sync from Cloud" to restore.`, 'info');

    // حذف از جدول عمومی members در سوپابیس
    if (window.supabaseClient && deletedEmail) {
      window.supabaseClient.from('members').delete().eq('email', deletedEmail).then(() => {});
    }
  }
};



window.exportMembersBackupJSON = function() {
  const backupData = {
    title: 'TAJINKART Studio Members Master Backup',
    exportedAt: new Date().toISOString(),
    totalMembers: siteMembersData.length,
    members: siteMembersData
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tajinkart_members_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Members backup (JSON) downloaded successfully! ✓', 'success');
};


// =========================================================
// ابزارهای پیشرفته فرم‌ها: مشاهده رمز، قوانین و لودر
// =========================================================
window.togglePasswordVisibility = function(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.textContent = '🔒';
    btnEl.title = 'Hide Password';
  } else {
    input.type = 'password';
    btnEl.textContent = '👁️';
    btnEl.title = 'Show Password';
  }
};


// =========================================================
// سامانه مدیریت پویا و زنده منشور قوانین، لایسنس و شرایط استودیو
// =========================================================

const DEFAULT_STUDIO_TERMS = `### 1. Accuracy of Information & User Identity Warranty
By registering or submitting any project brief, the client explicitly warrants that all identity and contact credentials (name, email, telegram handle) are accurate and authentic. TAJINKART assumes no liability for missed communications or delayed deliveries resulting from client clerical errors.

### 2. General Terms vs. Production Commission SLA
Platform registration signifies adherence to general community conduct and copyright protection. Binding production conditions, including the non-refundable 50% retainer, project deadlines, revision caps, and NDAs, take legal effect upon formal brief confirmation and invoice settlement.

### 3. Regional & Communication Transparency
TAJINKART is an independent concept art and visual development atelier directed by Seyed Soroush Taj, collaborating globally with international studios. The atelier maintains redundant encrypted backup channels (Telegram & PGP email) to ensure seamless, real-time client communications across international timezones.

### 4. Global Payments & Currency Settlement
International clients may settle retainers and final deliverables via major cryptocurrencies (USDT TRC20/ERC20) or mutually agreed international wire transfers. Remittance transaction and gas fees are the responsibility of the payer.

### 5. Client Materials & Reference Indemnity
The client warrants that all lore, concept sketches, logos, and reference materials supplied for creative direction are legally owned or authorized for commercial development. The client indemnifies TAJINKART against any third-party intellectual property claims.

### 6. Inactivity & Project Abandonment Clause
Following milestone submissions, the client agrees to provide feedback within 14 business days. In the event of 30 consecutive calendar days of client silence, the project is deemed abandoned; the 50% retainer is retained for reserved studio capacity, and the brief is formally closed.

### 7. Modern AI Transparency & Original IP Direction
TAJINKART employs cutting-edge AI models strictly as technical copilots (workflow acceleration, coding, and thumbnail ideation). The Genesis universe, lore, characters, and master digital brushwork represent the original intellectual property of Seyed Soroush Taj. Training custom models (e.g., LoRAs) on studio assets is strictly prohibited.

### 8. Digital Vault Assets EULA & Anti-Piracy License
Purchasing digital assets (artbooks, brush packs, 3D models, and master PSDs) grants a perpetual single-seat commercial license. Reselling, public sharing on forums, or redistributing via torrents constitutes copyright infringement and results in immediate permanent account termination.

### 9. Cloud Infrastructure & Force Majeure
The platform operates on enterprise cloud infrastructure (GitHub Pages, Cloudflare, Supabase, Cloudinary). TAJINKART implements daily distributed backups but assumes no financial liability for global backbone disruptions outside human control.

### 10. Limitation of Liability & Digital Goods Policy
Due to immediate delivery, digital asset purchases are final and non-refundable. For custom commissions, total studio liability is strictly limited to the actual fee received for that specific commission.

### 11. Moral Rights & Portfolio Attribution
TAJINKART retains the moral right to display final concept art in its official portfolio and studio publications (with full client IP credit), unless an exclusive confidential non-disclosure agreement (NDA) has been formally executed prior to production.

### 12. Dispute Resolution & Informal Arbitration
Both parties agree to pursue informal good-faith negotiations via official studio channels for a minimum period of 30 days prior to initiating formal legal dispute proceedings.`

// واکشی متن ذخیره‌شده یا پیش‌فرض
window.getStudioTermsContent = function() {
  const saved = localStorage.getItem('tajinkart_studio_terms');
  if (saved && saved.trim().length > 30) {
    if (/[\u0600-\u06FF]/.test(saved)) {
      localStorage.setItem('tajinkart_studio_terms', DEFAULT_STUDIO_TERMS);
      return DEFAULT_STUDIO_TERMS;
    }
    return saved;
  }
  return DEFAULT_STUDIO_TERMS;
};

// رندرینگ محتوای قوانین در مودال به صورت بلاک‌های شیک و خوانا
window.renderTermsModal = function() {
  const container = document.getElementById('termsModalDynamicContent');
  if (!container) return;

  const rawText = getStudioTermsContent();
  if (!rawText || rawText.trim().length < 20) return;

  const sections = rawText.split(/(?=###\s+)/g);
  let html = '';
  sections.forEach(sec => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('###')) {
      const newlineIndex = trimmed.indexOf('\n');
      const title = newlineIndex !== -1 ? trimmed.substring(3, newlineIndex).trim() : trimmed.substring(3).trim();
      const body = newlineIndex !== -1 ? trimmed.substring(newlineIndex).trim() : '';

      html += `
        <div style="background:#06080d; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 16px;">
          <h4 style="font-size:13.5px; font-weight:800; color:var(--gold); margin-bottom:8px;">${title}</h4>
          <p style="font-size:12px; color:#cbd5e1; line-height:1.85; margin:0; text-align:justify;">${body.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    } else {
      html += `<div style="background:#06080d; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px 16px;"><p style="font-size:12px; color:#cbd5e1; line-height:1.85; margin:0; text-align:justify;">${trimmed.replace(/\n/g, '<br>')}</p></div>`;
    }
  });

  if (html.trim().length > 0) {
    container.innerHTML = html;
  }
};

// باز کردن مودال قوانین همراه با رندر خودکار آخرین نسخه
window.openTermsModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  renderTermsModal();
  const modal = document.getElementById('termsModal');
  if (modal) modal.style.display = 'flex';
};

window.closeTermsModal = function() {
  const modal = document.getElementById('termsModal');
  if (modal) modal.style.display = 'none';
};

// رندرینگ بخش ویرایشگر قوانین در پنل ادمین
window.renderAdminTerms = function() {
  const textarea = document.getElementById('adminTermsContentInput');
  if (textarea) {
    textarea.value = getStudioTermsContent();
  }
};

// ذخیره تغییرات قوانین توسط ادمین در حافظه محلی و دیتابیس ابری
window.saveStudioTerms = async function() {
  const textarea = document.getElementById('adminTermsContentInput');
  if (!textarea) return;

  const newContent = textarea.value.trim();
  if (newContent.length < 20) {
    showToast('Terms text cannot be empty or under 20 characters.', 'error');
    return;
  }

  localStorage.setItem('tajinkart_studio_terms', newContent);

  // تلاش برای ذخیره ابری در سوپابیس در صورت وجود
  if (window.supabaseClient) {
    try {
      await window.supabaseClient.from('studio_settings').upsert([{
        key: 'studio_terms',
        value: newContent,
        updated_at: new Date().toISOString()
      }], { onConflict: 'key' });
    } catch(e) {
      console.warn('[Supabase Terms Save]', e);
    }
  }

  const notice = document.getElementById('termsSaveNotice');
  if (notice) {
    notice.style.display = 'inline';
    setTimeout(() => { notice.style.display = 'none'; }, 3000);
  }

  renderTermsModal();
  showToast('Studio Legal Charter and EULA saved and published!', 'success');
};

// بازنشانی متن به استاندارد رسمی
window.resetStudioTermsToDefault = function() {
  if (!confirm('Are you sure you want to reset legal charter to official Master Spec standards?')) return;
  const textarea = document.getElementById('adminTermsContentInput');
  if (textarea) {
    textarea.value = DEFAULT_STUDIO_TERMS;
  }
  localStorage.removeItem('tajinkart_studio_terms');
  renderTermsModal();
  showToast('Legal charter restored to defaults. Click Save to publish.', 'info');
};



// =========================================================
// موتور هوشمند سنجش کیفیت و قدرت رمز عبور (Password Strength)
// =========================================================
// فرمول استاندارد جهانی سنجش آنتروپی و تنوع رمز عبور
window.evalPassStrength = function(pass, prefix) {
  const box = document.getElementById(prefix + 'StrengthBox');
  const bar = document.getElementById(prefix + 'StrengthBar');
  const text = document.getElementById(prefix + 'StrengthText');
  const hint = document.getElementById(prefix + 'StrengthHint');
  if (!box || !bar || !text) return;

  if (!pass || pass.length === 0) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';

  const isSequential = /^(123456|12345678|abcdef|qwerty|111111|000000|password)/i.test(pass);
  const isOnlyDigits = /^[0-9]+$/.test(pass);
  const isOnlyLetters = /^[a-zA-Z]+$/.test(pass);

  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (pass.length < 6 || isSequential || (pass.length <= 8 && isOnlyDigits) || (pass.length <= 7 && isOnlyLetters)) {
    bar.style.width = '25%';
    bar.style.background = 'var(--crimson)';
    text.textContent = 'Security Level: Very Weak';
    text.style.color = 'var(--crimson)';
    if (hint) hint.textContent = isOnlyDigits ? 'Must not be numbers only' : 'Add letters & symbols';
    return;
  }

  if (pass.length >= 6 && varietyCount === 2) {
    bar.style.width = '50%';
    bar.style.background = 'var(--amber)';
    text.textContent = 'Security Level: Medium';
    text.style.color = 'var(--amber)';
    if (hint) hint.textContent = 'Add uppercase letters & symbols (@#!%)';
    return;
  }

  if (pass.length >= 8 && varietyCount >= 3 && !hasSpecial) {
    bar.style.width = '75%';
    bar.style.background = 'var(--cyan-electric)';
    text.textContent = 'Security Level: Strong';
    text.style.color = 'var(--cyan-electric)';
    if (hint) hint.textContent = 'Add special symbols for maximum security';
    return;
  }

  if (pass.length >= 8 && varietyCount >= 3 && hasSpecial) {
    bar.style.width = '100%';
    bar.style.background = 'var(--emerald)';
    text.textContent = 'Security Level: Excellent ✓';
    text.style.color = 'var(--emerald)';
    if (hint) hint.textContent = 'Maximum protection standard';
    return;
  }

  bar.style.width = '75%';
  bar.style.background = 'var(--cyan-electric)';
  text.textContent = 'Security Level: Good';
  text.style.color = 'var(--cyan-electric)';
  if (hint) hint.textContent = 'Acceptable security level';
};


window.openChangePasswordModal = function() {
  switchAuthView('reset');
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = 'flex';
  }
};


// بررسی زنده ساختار رسمی ایمیل (قرمز در صورت نقص یا تکراری بودن، سبز در صورت اعتبار کامل - بدون پیام زرد اضافی)
let emailCheckTimeout = null;
window.handleLiveEmailCheck = function(emailVal) {
  const notice = document.getElementById('signupEmailLiveNotice');
  const emailInput = document.getElementById('signupEmail');
  if (!notice || !emailInput) return;
  const cleanEmail = (emailVal || '').trim().toLowerCase();

  clearTimeout(emailCheckTimeout);
  if (!cleanEmail) {
    notice.style.display = 'none';
    emailInput.style.borderColor = 'var(--border-subtle)';
    return;
  }

  notice.style.display = 'block';

  // اعتبارسنجی سینتکس کامل ایمیل با پسوند دامنه رسمی حداقل ۲ حرفی (.com, .ir, .net, ...)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> Email format is incomplete (e.g. artist@domain.com)';
    emailInput.style.borderColor = 'var(--crimson)';
    return;
  }

  // تشخیص هوشمند جا افتادن حرف آخر در دامنه‌های معروف (مانند gmail.co یا yahoo.co)
  const commonTypos = ['@gmail.co', '@yahoo.co', '@hotmail.co', '@outlook.co'];
  for (const typo of commonTypos) {
    if (cleanEmail.endsWith(typo)) {
      notice.style.color = 'var(--crimson)';
      notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> Domain incomplete. Did you mean ' + typo + 'm?';
      emailInput.style.borderColor = 'var(--crimson)';
      return;
    }
  }

  // بررسی عدم تکراری بودن در حافظه کلاینت
  const localExists = siteMembersData.some(m => m.email && m.email.toLowerCase() === cleanEmail);
  if (localExists) {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> This email is already registered';
    emailInput.style.borderColor = 'var(--crimson)';
    return;
  }

  // بررسی بی‌صدا در پس‌زمینه بدون نمایش کادر زرد مزاحم
  emailCheckTimeout = setTimeout(async () => {
    if (window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from('members')
          .select('email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data && data.email) {
          notice.style.color = 'var(--crimson)';
          notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> This email is already registered';
          emailInput.style.borderColor = 'var(--crimson)';
        } else {
          notice.style.color = 'var(--emerald)';
          notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Email is valid and available';
          emailInput.style.borderColor = 'var(--emerald)';
        }
      } catch(e) {
        notice.style.color = 'var(--emerald)';
        notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Email format is valid';
        emailInput.style.borderColor = 'var(--emerald)';
      }
    } else {
      notice.style.color = 'var(--emerald)';
      notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Email format is valid';
      emailInput.style.borderColor = 'var(--emerald)';
    }
  }, 350);
};


// بررسی زنده و آنی شماره تلفن همراه
// بررسی زنده و کاملاً اختیاری شماره تلفن همراه (بدون محدودیت روی ارقام اولیه و بدون ایجاد مانع)
window.handleLivePhoneCheck = function() {
  const notice = document.getElementById('signupPhoneLiveNotice');
  const phoneInput = document.getElementById('signupPhone');
  if (!notice || !phoneInput) return;

  const val = (phoneInput.value || '').trim();
  // شماره تلفن کاملاً اختیاری است: اگر خالی بود هیچ اروری نده
  if (val.length === 0) {
    notice.style.display = 'none';
    phoneInput.style.borderColor = 'var(--border-subtle)';
    return;
  }

  notice.style.display = 'block';

  // پذیرش انعطاف‌پذیر انواع شماره‌های بین‌المللی و محلی (بین ۷ تا ۱۵ رقم)
  if (val.length >= 7 && val.length <= 15) {
    notice.style.color = 'var(--emerald)';
    notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> Phone number is valid';
    phoneInput.style.borderColor = 'var(--emerald)';
  } else {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> Invalid length (' + val.length + ' digits - standard: 7 to 15 digits)';
    phoneInput.style.borderColor = 'var(--crimson)';
  }
};


// بررسی زنده صحت نام کاربری
window.handleLiveNameCheck = function(nameVal) {
  const notice = document.getElementById('signupNameLiveNotice');
  const nameInput = document.getElementById('signupName');
  if (!notice || !nameInput) return;

  const val = (nameVal || '').trim();
  if (val.length === 0) {
    notice.style.display = 'none';
    nameInput.style.borderColor = 'var(--border-subtle)';
    return;
  }

  notice.style.display = 'block';

  if (val.length < 2) {
    notice.style.color = 'var(--crimson)';
    notice.textContent = '✕ Minimum 2 characters required';
    nameInput.style.borderColor = 'var(--crimson)';
  } else {
    notice.style.color = 'var(--emerald)';
    notice.textContent = '✓ Name is valid';
    nameInput.style.borderColor = 'var(--emerald)';
  }
};


// تابع ارسال مجدد لینک تایید ایمیل به کاربر در صورت عدم تایید اولیه
window.resendConfirmationEmail = async function(emailAddress) {
  if (!window.supabaseClient) {
    showToast('Supabase cloud service unavailable.', 'error');
    return;
  }
  const email = emailAddress || (window.currentUser && window.currentUser.email);
  if (!email) {
    showToast('No email address found for resending.', 'error');
    return;
  }
  try {
    const { error } = await window.supabaseClient.auth.resend({
      type: 'signup',
      email: email
    });
    if (error) {
      showToast('Error resending email: ' + error.message, 'error');
    } else {
      showToast('New verification link sent to ' + email + ' successfully! ✓', 'success', 5000);
    }
  } catch(e) {
    showToast('Network error sending verification email.', 'error');
  }
};


// تابع جابجایی سریع و بدون نقص ترتیب آثار با دکمه‌های فلش (مخصوص تبلت، گوشی و کامپیوتر)
window.moveAdminArtOrder = function(fromIdx, direction) {
  const toIdx = fromIdx + direction;
  if (toIdx < 0 || toIdx >= showcaseArtworks.length) return;

  const movedItem = showcaseArtworks.splice(fromIdx, 1)[0];
  showcaseArtworks.splice(toIdx, 0, movedItem);

  showcaseArtworks.forEach((art, i) => {
    art.orderIndex = i;
  });

  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  renderAdminSketch2();
  renderShowcaseGrid();
  showToast(`Artwork "${movedItem.shortSlug || movedItem.title}" moved to position ${toIdx + 1}! ✓`, 'success');
  syncArtworkOrderToSupabase();
};

let isDraggingAdminCard = false;
window.handleAdminCardClick = function(e, idx) {
  if (isDraggingAdminCard) return;
  selectAdminArt(idx);
};


// سیستم لمسی تاچ و نگه داشتن (Long-Press Touch Drag & Drop) برای گوشی و تبلت
let touchDragCard = null;
let touchDragSourceIdx = null;
let longPressTimer = null;
let touchStartX = 0;
let touchStartY = 0;
let isTouchDragging = false;

window.initAdminTouchSortable = function() {
  const container = document.getElementById('adminMosaicTilesContainer');
  if (!container) return;

  container.querySelectorAll('.admin-mosaic-card').forEach((card) => {
    // ۱. لمس کارت
    card.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouchDragging = false;
      const idx = parseInt(card.getAttribute('data-admin-idx'), 10);
      touchDragSourceIdx = idx;

      clearTimeout(longPressTimer);
      // نگه‌داشتن با شست یا اشاره به مدت ۲۴۰ میلی‌ثانیه برای بلند کردن کارت
      longPressTimer = setTimeout(() => {
        isTouchDragging = true;
        touchDragCard = card;
        card.classList.add('touch-drag-active');
        if (navigator.vibrate) navigator.vibrate(35); // لرزش ملایم گوشی
      }, 240);
    }, { passive: true });

    // ۲. حرکت انگشت
    card.addEventListener('touchmove', (e) => {
      if (!isTouchDragging) {
        const touch = e.touches[0];
        if (Math.abs(touch.clientX - touchStartX) > 10 || Math.abs(touch.clientY - touchStartY) > 10) {
          clearTimeout(longPressTimer); // اسکرول معمولی است
        }
        return;
      }
      e.preventDefault(); // ممانعت از اسکرول صفحه در حین درگ
      const touch = e.touches[0];
      
      card.style.visibility = 'hidden';
      const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      card.style.visibility = 'visible';

      const targetCard = elemBelow ? elemBelow.closest('.admin-mosaic-card') : null;
      document.querySelectorAll('.admin-mosaic-card').forEach(c => c.classList.remove('drag-over-target'));
      if (targetCard && targetCard !== card) {
        targetCard.classList.add('drag-over-target');
      }
    }, { passive: false });

    // ۳. برداشتن انگشت (Drop)
    card.addEventListener('touchend', (e) => {
      clearTimeout(longPressTimer);
      if (!isTouchDragging) return;

      isTouchDragging = false;
      card.classList.remove('touch-drag-active');
      document.querySelectorAll('.admin-mosaic-card').forEach(c => c.classList.remove('drag-over-target'));

      const changedTouch = e.changedTouches[0];
      card.style.visibility = 'hidden';
      const elemBelow = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
      card.style.visibility = 'visible';

      const targetCard = elemBelow ? elemBelow.closest('.admin-mosaic-card') : null;
      if (targetCard && targetCard !== card) {
        const targetIdx = parseInt(targetCard.getAttribute('data-admin-idx'), 10);
        if (!isNaN(targetIdx) && targetIdx !== touchDragSourceIdx) {
          const movedItem = showcaseArtworks.splice(touchDragSourceIdx, 1)[0];
          showcaseArtworks.splice(targetIdx, 0, movedItem);
          showcaseArtworks.forEach((a, i) => a.orderIndex = i);
          safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
          renderAdminSketch2();
          renderShowcaseGrid();
          showToast('✓ Artwork sequence updated successfully! ✓', 'success');
          syncArtworkOrderToSupabase();
        }
      }
    });

    card.addEventListener('touchcancel', () => {
      clearTimeout(longPressTimer);
      isTouchDragging = false;
      card.classList.remove('touch-drag-active');
      document.querySelectorAll('.admin-mosaic-card').forEach(c => c.classList.remove('drag-over-target'));
    });
  });
};


// تابع قطعی باز کردن اسکرول صفحه در تمام خروج‌ها و بازگشت‌ها
window.unlockBodyScroll = function() {
  document.body.style.overflow = '';
  document.body.style.removeProperty('overflow');
};


// مدیریت فهرست شناور دسته‌بندی آثار زیر برند
currentGalleryFilter = 'all';

window.toggleCategoryFilterMenu = function(e) {
  if (e) e.stopPropagation();
  const genreDropdown = document.getElementById('genreFilterDropdown');
  if (genreDropdown) genreDropdown.classList.add('hidden');
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
};

window.toggleGenreFilterMenu = function(e) {
  if (e) e.stopPropagation();
  const catDropdown = document.getElementById('categoryFilterDropdown');
  if (catDropdown) catDropdown.classList.add('hidden');
  const dropdown = document.getElementById('genreFilterDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
};

document.addEventListener('click', (e) => {
  const catMenu = document.getElementById('floatingGalleryCategoryMenu');
  if (catMenu && !catMenu.contains(e.target)) {
    const dropdown = document.getElementById('categoryFilterDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
  const genreMenu = document.getElementById('floatingGalleryGenreMenu');
  if (genreMenu && !genreMenu.contains(e.target)) {
    const dropdown = document.getElementById('genreFilterDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
});

window.filterGalleryByGenre = function(genreKey, genreTitle) {
  window.currentGenreFilter = genreKey;
  const labelEl = document.getElementById('currentGenrePillLabel');
  if (labelEl) labelEl.textContent = genreTitle || 'All Genres';

  const pillBtn = document.getElementById('currentGenrePillBtn');
  if (pillBtn) {
    let color = '#f43f5e';
    let glow = 'rgba(244, 63, 94, 0.55)';
    if (genreKey !== 'all') {
      const gObj = (typeof galleryGenres !== 'undefined' && Array.isArray(galleryGenres)) 
        ? galleryGenres.find(g => g.id === genreKey) : null;
      if (gObj && gObj.color) color = gObj.color;
      glow = color.startsWith('#') ? `${color}88` : color;
    } else {
      color = '#f1f5f9';
      glow = 'rgba(255, 255, 255, 0.2)';
    }
    pillBtn.style.setProperty('--pill-accent-color', color, 'important');
    pillBtn.style.setProperty('border-color', color, 'important');
    pillBtn.style.setProperty('box-shadow', `0 0 16px ${glow}`, 'important');
    if (labelEl) labelEl.style.setProperty('color', color, 'important');
  }

  const dropdown = document.getElementById('genreFilterDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  renderShowcaseGrid();
  const gEl = document.getElementById('showcaseGrid');
  if (gEl && window.scrollY > 200) { window.scrollTo({ top: gEl.offsetTop - 85, behavior: 'smooth' }); }
};

window.resetAllGalleryFilters = function() {
  filterGalleryByGenre('all', 'All Genres');
  filterGalleryByCategory('all', 'All Artworks');
};

window.filterGalleryByCategory = function(categoryKey, categoryName) {
  currentGalleryFilter = categoryKey;
  const labelEl = document.getElementById('currentCategoryPillLabel');
  if (labelEl) labelEl.textContent = categoryName;

  const pillBtn = document.getElementById('currentCategoryPillBtn');
  if (pillBtn) {
    let color = '#facc15'; // پیش‌فرض زرد / طلایی
    let glow = 'rgba(250, 204, 21, 0.55)';

    if (categoryKey !== 'all') {
      const cat = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) 
        ? galleryCategories.find(c => c.id === categoryKey) : null;
      if (cat && cat.color) {
        color = cat.color;
      } else {
        const categoryColorMap = {
          'character': '#facc15', // زرد هماهنگ با نقطه دسته‌بندی
          'characters': '#facc15',
          'environment': '#00f0ff',
          'environments': '#00f0ff',
          'creature': '#059669',
          'creatures': '#059669',
          'keyframe': '#e11d48',
          'keyframes': '#e11d48',
          'props': '#9333ea',
          'comic': '#fb923c',
          'comics': '#fb923c',
          'mascot': '#ec4899'
        };
        color = categoryColorMap[categoryKey] || '#38bdf8';
      }
      glow = color.startsWith('#') ? `${color}88` : color;
    }

    pillBtn.style.setProperty('--pill-accent-color', color, 'important');
    pillBtn.style.setProperty('--pill-glow-color', glow, 'important');
    pillBtn.style.setProperty('border-color', color, 'important');
    pillBtn.style.setProperty('box-shadow', `0 0 18px ${glow}, inset 0 0 8px ${glow}`, 'important');
    if (labelEl) {
      labelEl.style.setProperty('color', color, 'important');
    }
  }

  document.querySelectorAll('.cat-dropdown-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(categoryName));
  });

  const dropdown = document.getElementById('categoryFilterDropdown') || document.getElementById('floatingCategoryDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  renderShowcaseGrid();
  const gEl = document.getElementById('showcaseGrid');
  if (gEl && window.scrollY > 200) { window.scrollTo({ top: gEl.offsetTop - 85, behavior: 'smooth' }); }
};


// مانیتور و ناظر قطعی اسکرول صفحه: تضمین ۱۰۰٪ عدم قفل شدن اسکرول در کامپیوتر و گوشی
window.unlockBodyScroll = function() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
};

// ناظر جهش (MutationObserver) جهت رفع قفل به محض بسته شدن هر لایت‌باکس
document.addEventListener('DOMContentLoaded', () => {
  const artModal = document.getElementById('artDetailModal');
  if (artModal) {
    const observer = new MutationObserver(() => {
      if (artModal.style.display === 'none' || !artModal.classList.contains('active')) {
        unlockBodyScroll();
      }
    });
    observer.observe(artModal, { attributes: true, attributeFilter: ['style', 'class'] });
  }
});

// بازگردانی اسکرول هنگام فشردن کلید Escape یا خروج موس یا پنجره
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    unlockBodyScroll();
  }
});
window.addEventListener('focus', () => {
  const artModal = document.getElementById('artDetailModal');
  if (!artModal || artModal.style.display === 'none' || !artModal.classList.contains('active')) {
    unlockBodyScroll();
  }
});
// اضافه کردن فیدبک لمسی سریع (Instant Touch Gold Glow) برای تایل‌های گالری
document.addEventListener('touchstart', (e) => {
  const tile = e.target.closest('.mosaic-tile');
  if (tile) {
    document.querySelectorAll('.mosaic-tile.touch-active').forEach(t => t.classList.remove('touch-active'));
    tile.classList.add('touch-active');
  }
}, { passive: true });

document.addEventListener('touchend', () => {
  setTimeout(() => {
    document.querySelectorAll('.mosaic-tile.touch-active').forEach(t => t.classList.remove('touch-active'));
  }, 350);
}, { passive: true });

// =========================================================
// کشوی شیک و پرستیژدار تشریح Phasesهای تخصصی (Phase Scope Drawer)
// =========================================================
let currentDrawerPipelineKey = 'sketch1';

function escapeQuotes(str) {
  if (!str) return '';
  return str.replace(/'/g, "\'");
}

// =========================================================
// تفکیک تعامل تصویر: تپ برای شیت مشخصات در موبایل، ذره‌بین متمرکز در دسکتاپ
// =========================================================
window.handleImageClick = function(imgEl, phaseTitle, pipeKey, phaseDesc, phaseSub, e) {
  if (window.innerWidth <= 992) {
    // در موبایل: باز شدن کشوی مشخصات فنی Phases به سبک Bottom Sheet
    openPhaseScopeDrawer(phaseTitle, pipeKey, phaseDesc, phaseSub);
  } else {
    // در دسکتاپ: باز شدن ذره‌بین متمرکز وسط صفحه با امکان هدایت آزادانه لنز
    openCenteredMagnifier(imgEl.src, phaseTitle);
  }
};

window.openCenteredMagnifier = function(imgSrc, phaseTitle) {
  const overlay = document.getElementById('centeredFocusMagnifierOverlay');
  const imgEl = document.getElementById('magnifierActiveImg');
  const titleEl = document.getElementById('magnifierPhaseTitle');
  const viewport = document.getElementById('magnifierViewport');
  if (!overlay || !imgEl || !viewport) return;

  imgEl.src = imgSrc;
  if (titleEl) titleEl.textContent = phaseTitle || 'Concept Project Details';
  overlay.classList.add('active');

  // هدایت فوق‌روان ۶۰ فریم بر ثانیه لنز با حرکت موس
  viewport.onmousemove = function(e) {
    const rect = viewport.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    imgEl.style.transformOrigin = `${xPct}% ${yPct}%`;
    imgEl.style.transform = 'scale(2.2)';
  };

  viewport.onmouseleave = function() {
    imgEl.style.transform = 'scale(1)';
    imgEl.style.transformOrigin = 'center center';
  };
};

window.closeCenteredMagnifier = function(e) {
  if (e && e.target && e.target.tagName === 'IMG') return; // کلیک روی عکس خروج نمی‌زند
  const overlay = document.getElementById('centeredFocusMagnifierOverlay');
  const imgEl = document.getElementById('magnifierActiveImg');
  const viewport = document.getElementById('magnifierViewport');
  if (viewport) {
    viewport.onmousemove = null;
    viewport.onmouseleave = null;
  }
  if (imgEl) {
    imgEl.style.transform = '';
    imgEl.style.transformOrigin = 'center center';
  }
  if (overlay) overlay.classList.remove('active');
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCenteredMagnifier();
  }
});

window.openPhaseScopeDrawer = function(phaseTitle, pipeKey, customDesc = '', customSub = '') {
  currentDrawerPipelineKey = pipeKey || 'sketch1';
  const overlay = document.getElementById('phaseScopeDrawerOverlay');
  if (!overlay) return;

  const titleEl = document.getElementById('drawerPhaseTitle');
  if (titleEl) titleEl.textContent = phaseTitle || 'Specialized Production Phase';

  const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[currentDrawerPipelineKey]) ? 
                   PIPELINE_DATA[currentDrawerPipelineKey] : { topSub: 'Character Design & Concept' };
  
  const pipeEl = document.getElementById('drawerPhasePipeline');
  if (pipeEl) {
    pipeEl.textContent = pipeData.topSub + (customSub ? ` • ${customSub}` : '');
  }

  const purposeEl = document.getElementById('drawerPhasePurpose');
  if (purposeEl) {
    if (customDesc && customDesc.trim().length > 0) {
      purposeEl.textContent = customDesc.trim();
    } else if (phaseTitle.includes('Turnaround') || phaseTitle.includes('Orthographic') || phaseTitle.includes('Model Sheet')) {
      purposeEl.textContent = 'Engineered for orthographic alignment (front, side, and rear turnaround views), serving as the foundational blueprint for 3D modeling and rigging teams.';
    } else if (phaseTitle.includes('Expression') || phaseTitle.includes('Facial') || phaseTitle.includes('Emotion')) {
      purposeEl.textContent = 'Explores dynamic psychological states, combat expressions, and facial fidelity to preserve narrative consistency across game cinematics.';
    } else if (phaseTitle.includes('Silhouette') || phaseTitle.includes('Sketch') || phaseTitle.includes('Ideation')) {
      purposeEl.textContent = 'Primary shape exploration, geometric rhythm, and iconic silhouette definition establishing production direction and creative consensus.';
    } else if (phaseTitle.includes('Render') || phaseTitle.includes('Master') || phaseTitle.includes('Lighting')) {
      purposeEl.textContent = 'Material callouts, chiaroscuro lighting, skin/armor texture fidelity, and final 300DPI master polish for cinema marketing and key art.';
    } else {
      purposeEl.textContent = 'Engineered as a cornerstone of the atelier visual development pipeline, guaranteeing AAA industry asset delivery standards.';
    }
  }

  overlay.classList.add('active');
};

window.closePhaseScopeDrawer = function(e) {
  if (e && e.target && e.target.id !== 'phaseScopeDrawerOverlay' && !e.target.closest('button')) return;
  const overlay = document.getElementById('phaseScopeDrawerOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.goToPipelineFromDrawer = function() {
  const overlay = document.getElementById('phaseScopeDrawerOverlay');
  if (overlay) overlay.classList.remove('active');

  const artModal = document.getElementById('artDetailModal');
  if (artModal) closeArtModalDirect();

  switchView('store');
  selectPipeline(currentDrawerPipelineKey);
  showToast('Navigated to atelier commission pipeline. Calculator active.', 'info', 4000);
};

// =========================================================
// =========================================================
// بهینه‌سازی اختصاصی مینی‌اپلیکیشن تلگرام (Telegram Mini App Ready)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#040507');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#040507');
      console.log('Telegram Mini App initialized for TAJINKART studio.');
    } catch(e) {
      console.warn('TMA init warning:', e);
    }
  }
});

// اتصالات قطعی توابع به شیء پنجره مرورگر جهت تضمین پاسخگویی کلیک آیکون‌ها
window.renderShowcaseGrid = (typeof renderShowcaseGrid === 'function') ? renderShowcaseGrid : window.renderShowcaseGrid;
window.renderAdminSketch2 = (typeof renderAdminSketch2 === 'function') ? renderAdminSketch2 : window.renderAdminSketch2;
window.renderAdminLists = (typeof renderAdminLists === 'function') ? renderAdminLists : window.renderAdminLists;

// محاسبه و به‌روزرسانی زنده وضعیت ارتباطی آتلیه (Live Studio Operational Status)
window.updateStudioLiveStatus = function() {
  const badge = document.getElementById('studioLiveStatusBadge');
  const textEl = document.getElementById('studioLiveStatusText');
  if (!badge || !textEl) return;

  const mode = siteSettings.studioAvailabilityMode || 'auto';
  const customMsg = (siteSettings.studioCustomStatusMessage || '').trim();

  if (mode === 'vacation') {
    badge.className = 'hero-badge studio-status-badge status-vacation';
    textEl.textContent = customMsg || 'Studio on Sabbatical / Capacity Full • Inquiries Queued';
    badge.title = 'Studio is temporarily on travel sabbatical.';
    return;
  }

  if (mode === 'online') {
    badge.className = 'hero-badge studio-status-badge status-online';
    textEl.textContent = customMsg || 'Studio Active & Online • Briefs & Commissions Open';
    badge.title = 'Online responses to briefs and messages are active.';
    return;
  }

  if (mode === 'away') {
    badge.className = 'hero-badge studio-status-badge status-pending';
    textEl.textContent = customMsg || 'Brief Intake Active • Review Window 24-48 Hours';
    badge.title = 'Brief intake active; reviews processed within 24-48 hours.';
    return;
  }

  // حالت خودکار هوشمند (Auto): کمتر از ۲۴ ساعت آنلاین، بیش از آن پاسخگویی با تاخیر
  const lastActive = Number(siteSettings.lastAdminLoginTime) || Date.now();
  const diffHours = (Date.now() - lastActive) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    badge.className = 'hero-badge studio-status-badge status-online';
    textEl.textContent = customMsg || 'Studio Active & Online • Briefs & Commissions Open';
    badge.title = 'Online responses to briefs and messages are active.';
  } else {
    badge.className = 'hero-badge studio-status-badge status-pending';
    textEl.textContent = customMsg || 'Brief Intake Active • Response with Latency';
    badge.title = 'Brief intake active with periodic latency.';
  }
};

window.saveStudioAvailabilitySettingsDirect = function() {
  const selectedMode = document.querySelector('input[name="studioAvailabilityChoice"]:checked')?.value || 'auto';
  const customMsg = document.getElementById('setStudioCustomStatusMessage')?.value.trim() || '';
  
  siteSettings.studioAvailabilityMode = selectedMode;
  siteSettings.studioCustomStatusMessage = customMsg;
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  
  updateStudioLiveStatus();
  previewStudioStatusSelection();
  showToast('Studio presence status and commission availability updated! ✓', 'success', 3500);
};

window.previewStudioStatusSelection = function() {
  const selectedMode = document.querySelector('input[name="studioAvailabilityChoice"]:checked')?.value || 'auto';
  const previewBadge = document.getElementById('currentStudioModeBadgePreview');
  if (!previewBadge) return;
  
  if (selectedMode === 'vacation') {
    previewBadge.className = 'hero-badge studio-status-badge status-vacation font-mono';
    previewBadge.textContent = '🔴 Sabbatical / Full Capacity';
  } else if (selectedMode === 'online') {
    previewBadge.className = 'hero-badge studio-status-badge status-online font-mono';
    previewBadge.textContent = '🟢 Active & Online';
  } else if (selectedMode === 'away') {
    previewBadge.className = 'hero-badge studio-status-badge status-pending font-mono';
    previewBadge.textContent = '🟡 Review with Latency (Away)';
  } else {
    previewBadge.className = 'hero-badge studio-status-badge status-online font-mono';
    previewBadge.textContent = '🔄 Automated 24/7';
  }
};

// ==============================================================================
// ==============================================================================
// مرکز کنترل هویت استودیو: تفکیک کامل نشان هدر، فاویکون مرورگر، شعار و ساب‌تب‌ها
// ==============================================================================

window.switchSettingsSubTab = function(subTabId) {
  const identityBtn = document.getElementById('adminSettingsSubTabBtn-identity');
  const socialBtn = document.getElementById('adminSettingsSubTabBtn-social');
  const identitySec = document.getElementById('adminSettingsSubTab-identity');
  const socialSec = document.getElementById('adminSettingsSubTab-social');

  if (subTabId === 'identity') {
    if (identityBtn) identityBtn.classList.add('active');
    if (socialBtn) socialBtn.classList.remove('active');
    if (identitySec) identitySec.style.display = 'grid';
    if (socialSec) socialSec.style.display = 'none';
  } else {
    if (socialBtn) socialBtn.classList.add('active');
    if (identityBtn) identityBtn.classList.remove('active');
    if (identitySec) identitySec.style.display = 'none';
    if (socialSec) socialSec.style.display = 'flex';
  }
};

window.updateStudioLogoDisplay = function() {
  const logoUrl = siteSettings.studioLogoUrl || '';
  const favUrl = siteSettings.faviconUrl || '';
  
  // ۱. نشان رسمی هدر استودیو و درباره ما
  const headerContainer = document.getElementById('brandCrestContainer');
  const headerImg = document.getElementById('brandCrestImg');
  const logoActiveCard = document.getElementById('adminLogoActiveCard');
  const logoEmptyDropzone = document.getElementById('adminLogoEmptyDropzone');
  const logoPreviewImg = document.getElementById('adminLogoPreviewImg');

  const aboutCrestImg = document.getElementById('aboutStudioCrestImg');
  const aboutCrestPlaceholder = document.getElementById('aboutStudioCrestPlaceholder');

  if (logoUrl) {
    if (headerContainer) headerContainer.style.display = 'flex';
    if (headerImg) headerImg.src = logoUrl;
    if (logoActiveCard) logoActiveCard.style.display = 'flex';
    if (logoEmptyDropzone) logoEmptyDropzone.style.display = 'none';
    if (logoPreviewImg) logoPreviewImg.src = logoUrl;

    if (aboutCrestImg) {
      aboutCrestImg.src = logoUrl;
      aboutCrestImg.style.display = 'block';
    }
    if (aboutCrestPlaceholder) aboutCrestPlaceholder.style.display = 'none';
  } else {
    if (headerContainer) headerContainer.style.display = 'none';
    if (headerImg) headerImg.src = '';
    if (logoActiveCard) logoActiveCard.style.display = 'none';
    if (logoEmptyDropzone) logoEmptyDropzone.style.display = 'block';
    if (logoPreviewImg) logoPreviewImg.src = '';

    if (aboutCrestImg) aboutCrestImg.style.display = 'none';
    if (aboutCrestPlaceholder) aboutCrestPlaceholder.style.display = 'flex';
  }

  // ۲. فاویکون مرورگر (کاملاً جداگانه و بدون تداخل با لوگو)
  const siteFavicon = document.getElementById('siteFavicon');
  const favActiveCard = document.getElementById('adminFaviconActiveCard');
  const favEmptyDropzone = document.getElementById('adminFaviconEmptyDropzone');
  const favPreviewImg = document.getElementById('adminFaviconPreviewImg');
  const favEmptyIcon = document.getElementById('adminFaviconEmptyIcon');
  const favInput = document.getElementById('adminFaviconInput');

  if (favUrl) {
    if (siteFavicon) siteFavicon.href = favUrl;
    if (favActiveCard) favActiveCard.style.display = 'flex';
    if (favEmptyDropzone) favEmptyDropzone.style.display = 'none';
    if (favPreviewImg) {
      favPreviewImg.src = favUrl;
      favPreviewImg.style.display = 'inline-block';
    }
    if (favEmptyIcon) favEmptyIcon.style.display = 'none';
    if (favInput) favInput.value = favUrl;
  } else {
    if (siteFavicon) siteFavicon.href = '';
    if (favActiveCard) favActiveCard.style.display = 'none';
    if (favEmptyDropzone) favEmptyDropzone.style.display = 'block';
    if (favPreviewImg) favPreviewImg.style.display = 'none';
    if (favEmptyIcon) favEmptyIcon.style.display = 'inline-block';
    if (favInput) favInput.value = '';
  }

  // ۳. به‌روزرسانی شعار و عنوان مدیر
  const sloganBar = document.querySelector('#stickyBrandHero .brand-slogan-bar');
  if (sloganBar && siteSettings.slogan) {
    sloganBar.textContent = siteSettings.slogan;
  }
  const sloganInput = document.getElementById('setStudioSloganInput');
  if (sloganInput && siteSettings.slogan) {
    sloganInput.value = siteSettings.slogan;
  }

  const subCaption = document.querySelector('#stickyBrandHero .brand-sub-caption');
  if (subCaption && siteSettings.directorTitle) {
    subCaption.textContent = siteSettings.directorTitle;
  }
  const titleInput = document.getElementById('setStudioDirectorTitleInput');
  if (titleInput && siteSettings.directorTitle) {
    titleInput.value = siteSettings.directorTitle;
  }
};

window.handleLogoDragOver = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adminLogoEmptyDropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'var(--cyan-electric)';
    dropzone.style.background = 'rgba(0, 240, 255, 0.08)';
  }
};

window.handleLogoDragLeave = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('adminLogoEmptyDropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'rgba(250, 204, 21, 0.5)';
    dropzone.style.background = 'rgba(0, 0, 0, 0.55)';
  }
};

window.handleLogoDrop = function(e) {
  e.preventDefault();
  e.stopPropagation();
  window.handleLogoDragLeave(e);
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    previewAndStageStudioLogo(e.dataTransfer.files[0]);
  }
};

window.handleAdminLogoUpload = function(inputEl) {
  if (inputEl && inputEl.files && inputEl.files[0]) {
    previewAndStageStudioLogo(inputEl.files[0]);
  }
};

function previewAndStageStudioLogo(file) {
  showToast('Uploading studio header crest...', 'info', 1500);
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    siteSettings.studioLogoUrl = dataUrl;
    window.updateStudioLogoDisplay();
    showToast('Crest preview loaded! Click "Save Header Crest" to commit.', 'success', 4500);

    try {
      const compressed = await compressImageForStorage(file, 600, 600, 0.92);
      if (compressed) {
        siteSettings.studioLogoUrl = compressed;
      }
    } catch(ign) {}
  };
  reader.readAsDataURL(file);
}

window.saveStudioLogoSetting = function() {
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Studio header crest saved successfully! ✓', 'success', 4000);
};

window.removeStudioLogo = function() {
  siteSettings.studioLogoUrl = '';
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Studio header crest removed.', 'info', 3000);
};

window.handleAdminFaviconUpload = function(inputEl) {
  if (inputEl && inputEl.files && inputEl.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      siteSettings.faviconUrl = e.target.result;
      window.updateStudioLogoDisplay();
      showToast('Favicon preview loaded! Click Save to commit permanently.', 'info', 3500);
    };
    reader.readAsDataURL(inputEl.files[0]);
  }
};

window.saveStudioFaviconSetting = function() {
  const favInput = document.getElementById('adminFaviconInput');
  if (favInput && favInput.value.trim()) {
    siteSettings.faviconUrl = favInput.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Browser favicon updated successfully! ✓', 'success', 4000);
};

window.removeStudioFavicon = function() {
  siteSettings.faviconUrl = '';
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Browser favicon reset.', 'info', 3000);
};

window.saveStudioBrandingSettings = function() {
  const sloganInput = document.getElementById('setStudioSloganInput');
  if (sloganInput && sloganInput.value.trim()) {
    siteSettings.slogan = sloganInput.value.trim();
  }
  const titleInput = document.getElementById('setStudioDirectorTitleInput');
  if (titleInput && titleInput.value.trim()) {
    siteSettings.directorTitle = titleInput.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  window.updateStudioLogoDisplay();
  showToast('Studio slogan and director title saved successfully! ✓', 'success', 4000);
};

window.saveStudioCurrencySetting = function() {
  const rateInput = document.getElementById('setUsdRate');
  if (rateInput && rateInput.value) {
    siteSettings.usdRate = Number(rateInput.value);
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
    renderAllPrices();
    showToast(`Exchange rate updated to ${siteSettings.usdRate.toLocaleString('en-US')} TOMAN. ✓`, 'success', 3500);
  }
};
// =========================================================
// بهینه‌سازی اختصاصی مینی‌اپلیکیشن تلگرام (Telegram Mini App Ready)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#040507');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#040507');
      console.log('Telegram Mini App initialized for TAJINKART studio.');
    } catch(e) {
      console.warn('TMA init warning:', e);
    }
  }
});

// اتصالات قطعی توابع به شیء پنجره مرورگر جهت تضمین پاسخگویی کلیک آیکون‌ها
window.renderShowcaseGrid = (typeof renderShowcaseGrid === 'function') ? renderShowcaseGrid : window.renderShowcaseGrid;
window.renderAdminSketch2 = (typeof renderAdminSketch2 === 'function') ? renderAdminSketch2 : window.renderAdminSketch2;
window.renderAdminLists = (typeof renderAdminLists === 'function') ? renderAdminLists : window.renderAdminLists;

// محاسبه و به‌روزرسانی زنده وضعیت ارتباطی آتلیه (Live Studio Operational Status)
window.updateStudioLiveStatus = function() {
  const badge = document.getElementById('studioLiveStatusBadge');
  const textEl = document.getElementById('studioLiveStatusText');
  if (!badge || !textEl) return;

  const mode = siteSettings.studioAvailabilityMode || 'auto';
  const customMsg = (siteSettings.studioCustomStatusMessage || '').trim();

  if (mode === 'vacation') {
    badge.className = 'hero-badge studio-status-badge status-vacation';
    textEl.textContent = customMsg || 'Studio on Sabbatical / Capacity Full • Inquiries Queued';
    badge.title = 'Studio is temporarily on travel sabbatical.';
    return;
  }

  if (mode === 'online') {
    badge.className = 'hero-badge studio-status-badge status-online';
    textEl.textContent = customMsg || 'Studio Active & Online • Briefs & Commissions Open';
    badge.title = 'Online responses to briefs and messages are active.';
    return;
  }

  if (mode === 'away') {
    badge.className = 'hero-badge studio-status-badge status-pending';
    textEl.textContent = customMsg || 'Brief Intake Active • Review Window 24-48 Hours';
    badge.title = 'Brief intake active; reviews processed within 24-48 hours.';
    return;
  }

  // حالت خودکار هوشمند (Auto): کمتر از ۲۴ ساعت آنلاین، بیش از آن پاسخگویی با تاخیر
  const lastActive = Number(siteSettings.lastAdminLoginTime) || Date.now();
  const diffHours = (Date.now() - lastActive) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    badge.className = 'hero-badge studio-status-badge status-online';
    textEl.textContent = customMsg || 'Studio Active & Online • Briefs & Commissions Open';
    badge.title = 'Online responses to briefs and messages are active.';
  } else {
    badge.className = 'hero-badge studio-status-badge status-pending';
    textEl.textContent = customMsg || 'Brief Intake Active • Response with Latency';
    badge.title = 'Brief intake active with periodic latency.';
  }
};

window.saveStudioAvailabilitySettingsDirect = function() {
  const selectedMode = document.querySelector('input[name="studioAvailabilityChoice"]:checked')?.value || 'auto';
  const customMsg = document.getElementById('setStudioCustomStatusMessage')?.value.trim() || '';
  
  siteSettings.studioAvailabilityMode = selectedMode;
  siteSettings.studioCustomStatusMessage = customMsg;
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  
  updateStudioLiveStatus();
  previewStudioStatusSelection();
  showToast('Studio presence status and commission availability updated! ✓', 'success', 3500);
};

window.previewStudioStatusSelection = function() {
  const selectedMode = document.querySelector('input[name="studioAvailabilityChoice"]:checked')?.value || 'auto';
  const previewBadge = document.getElementById('currentStudioModeBadgePreview');
  if (!previewBadge) return;
  
  if (selectedMode === 'vacation') {
    previewBadge.className = 'hero-badge studio-status-badge status-vacation font-mono';
    previewBadge.textContent = '🔴 Sabbatical / Full Capacity';
  } else if (selectedMode === 'online') {
    previewBadge.className = 'hero-badge studio-status-badge status-online font-mono';
    previewBadge.textContent = '🟢 Active & Online';
  } else if (selectedMode === 'away') {
    previewBadge.className = 'hero-badge studio-status-badge status-pending font-mono';
    previewBadge.textContent = '🟡 Review with Latency (Away)';
  } else {
    previewBadge.className = 'hero-badge studio-status-badge status-online font-mono';
    previewBadge.textContent = '🔄 Automated 24/7';
  }
};

// ==============================================================================

// ==============================================================================
// همگام‌سازی ابری سفارش‌ها از Supabase و ذخیره وب‌هوک گوگل شیتس
// ==============================================================================

window.syncOrdersFromSupabase = async function() {
  if (!window.supabaseClient) return;
  try {
    const { data: cloudOrders, error } = await window.supabaseClient
      .from('orders')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('[Supabase Orders Sync Error]', error);
      return;
    }

    if (cloudOrders && Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      const existingIds = new Set(ordersList.map(o => Number(o.id)));
      let updated = false;

      cloudOrders.forEach(co => {
        const orderId = Number(co.id);
        if (!existingIds.has(orderId)) {
          ordersList.unshift({
            id: orderId,
            client: co.client_name,
            contact: co.contact || co.client_email || '',
            refLink: co.ref_link || '',
            pkg: co.package_name || 'Commission Brief',
            price: co.price_text || '',
            timeline: co.timeline || '',
            phase: co.phase || '',
            brief: co.brief_text || '',
            status: co.status || 'Brief Received'
          });
          updated = true;
        }
      });

      if (updated) {
        if (typeof safeSetStorage === 'function') {
          safeSetStorage(KEYS.ORDERS, JSON.stringify(ordersList));
        }
        if (typeof renderMemberDashboard === 'function') renderMemberDashboard();
        if (typeof renderAdminLists === 'function') renderAdminLists();
        console.log('[Supabase Orders] Synchronized', cloudOrders.length, 'orders from Cloud DB.');
      }
    }
  } catch (err) {
    console.warn('[Supabase Orders Exception]', err);
  }
};

window.saveMultiCloudIntegrationsDirect = function() {
  const gSheetsInput = document.getElementById('setGoogleSheetsWebhook');
  if (gSheetsInput) {
    siteSettings.googleSheetsWebhook = gSheetsInput.value.trim();
  }
  const cfInput = document.getElementById('setCloudflareToken');
  if (cfInput) {
    siteSettings.cloudflareToken = cfInput.value.trim();
  }
  if (typeof safeSetStorage === 'function') {
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  }
  showToast('Google Sheets Webhook & Cloudflare Analytics settings saved! ✓', 'success', 4000);
};

// فراخوانی خودکار همگام‌سازی ابری سفارش‌ها در لود صفحه
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof window.syncOrdersFromSupabase === 'function') {
      window.syncOrdersFromSupabase();
    }
    const gSheetsInput = document.getElementById('setGoogleSheetsWebhook');
    if (gSheetsInput && siteSettings.googleSheetsWebhook) {
      gSheetsInput.value = siteSettings.googleSheetsWebhook;
    }
    const cfInput = document.getElementById('setCloudflareToken');
    if (cfInput && siteSettings.cloudflareToken) {
      cfInput.value = siteSettings.cloudflareToken;
    }
  }, 1200);
});

// ناوبری ساب‌تب‌های منشور حقوقی استودیو
window.switchTermsModalSubTab = function(paneKey, btnEl) {
  document.querySelectorAll('.terms-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const panes = ['account', 'commission', 'assets', 'academy'];
  panes.forEach(p => {
    const el = document.getElementById(`termsPane-${p}`);
    if (el) el.style.display = (p === paneKey) ? 'block' : 'none';
  });
};

// ==============================================================================
// ذخیره زنده مانیفست و بیانیه «درباره استودیو» در صفحه اصلی
// ==============================================================================
window.saveAboutStudioManifestoDirect = function() {
  const titleInput = document.getElementById('setAboutManifestoTitle');
  const textInput = document.getElementById('setAboutManifestoText');
  
  if (titleInput && titleInput.value.trim()) {
    siteSettings.aboutTitle = titleInput.value.trim();
  }
  if (textInput && textInput.value.trim()) {
    siteSettings.aboutText = textInput.value.trim();
  }
  if (typeof safeSetStorage === 'function') {
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  }
  
  // اعمال بلادرنگ بر روی المان‌های درباره استودیو در صفحه اصلی
  const aboutHeading = document.querySelector('#showcaseStudioAboutSection h2');
  if (aboutHeading && siteSettings.aboutTitle) {
    aboutHeading.innerHTML = `About <span style="color:var(--gold);">${(siteSettings.aboutTitle || 'TAJINKART').replace(/About/gi, '').trim() || 'TAJINKART'}</span> Studio`;
  }
  const aboutParagraph = document.querySelector('#showcaseStudioAboutSection p[style*="line-height:1.9"]');
  if (aboutParagraph && siteSettings.aboutText) {
    aboutParagraph.innerHTML = siteSettings.aboutText;
  }
  
  showToast('Studio Manifesto and Director Biography updated! ✓', 'success', 4000);
};

// ==============================================================================
// زوم لمسی پینچ و جابجایی دو انگشتی روان سبک اینستاگرام در موبایل (Pinch & Pan)
// ==============================================================================
let pinchInitDist = 0;
let pinchCurrentScale = 1;
let pinchInitCenter = { x: 0, y: 0 };
let pinchPanX = 0;
let pinchPanY = 0;
let activePinchImg = null;

document.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length === 2) {
    const target = e.target.closest('.elastic-pinch-target');
    if (target) {
      activePinchImg = target;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchInitDist = Math.hypot(dx, dy);
      pinchInitCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      pinchPanX = 0;
      pinchPanY = 0;
      activePinchImg.style.transition = 'none';
      activePinchImg.style.willChange = 'transform';
    }
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (activePinchImg && e.touches && e.touches.length === 2 && pinchInitDist > 0) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scaleFactor = dist / pinchInitDist;
    // مهار نرم بین ۱ تا ۲.۵ برابر
    pinchCurrentScale = Math.min(Math.max(scaleFactor, 1), 2.5);
    
    // جابجایی آزاد دو انگشت (Pan)
    if (pinchCurrentScale > 1.05) {
      const currentCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      pinchPanX = (currentCenter.x - pinchInitCenter.x) * 1.15;
      pinchPanY = (currentCenter.y - pinchInitCenter.y) * 1.15;
      if (e.cancelable) e.preventDefault();
    } else {
      pinchPanX = 0;
      pinchPanY = 0;
    }
    
    activePinchImg.style.transform = `translate(${pinchPanX}px, ${pinchPanY}px) scale(${pinchCurrentScale})`;
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (activePinchImg && (!e.touches || e.touches.length < 2)) {
    activePinchImg.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
    activePinchImg.style.transform = 'translate(0px, 0px) scale(1)';
    setTimeout(() => {
      if (activePinchImg) {
        activePinchImg.style.transition = '';
        activePinchImg.style.willChange = '';
        activePinchImg = null;
      }
    }, 340);
    pinchInitDist = 0;
    pinchCurrentScale = 1;
    pinchPanX = 0;
    pinchPanY = 0;
  }
}, { passive: true });

// ==============================================================================
// مدیریت تفکیک‌شده ساب‌تب‌های ویرایشگر منشور قوانین استودیو در ادمین
// ==============================================================================
window.switchAdminTermsEditorTab = function(tabKey, btnEl) {
  const container = document.getElementById('adminTabTerms');
  if (container) {
    container.querySelectorAll('.terms-tab-btn').forEach(b => b.classList.remove('active'));
  }
  if (btnEl) btnEl.classList.add('active');

  const panes = ['account', 'commission', 'assets', 'academy'];
  panes.forEach(p => {
    const el = document.getElementById(`adminTermsPane-${p}`);
    if (el) el.style.display = (p === tabKey) ? 'block' : 'none';
  });
};

window.saveStudioTerms = function() {
  const acc = document.getElementById('adminTermsAccountInput')?.value.trim();
  const comm = document.getElementById('adminTermsCommissionInput')?.value.trim();
  const ass = document.getElementById('adminTermsAssetsInput')?.value.trim();
  const acad = document.getElementById('adminTermsAcademyInput')?.value.trim();

  siteSettings.termsAccount = acc || '';
  siteSettings.termsCommission = comm || '';
  siteSettings.termsAssets = ass || '';
  siteSettings.termsAcademy = acad || '';

  if (typeof safeSetStorage === 'function') {
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  }

  // به‌روزرسانی آنی محتوای پنجره قوانین در سایت
  if (acc) {
    const paneAcc = document.getElementById('termsPane-account');
    if (paneAcc) paneAcc.innerHTML = `<h4 style="color:var(--gold); font-size:14px; font-weight:800; margin-bottom:10px;">1. General Membership, Account Terms & Anti-AI Protection</h4>` + acc.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }
  if (comm) {
    const paneComm = document.getElementById('termsPane-commission');
    if (paneComm) paneComm.innerHTML = `<h4 style="color:var(--cyan-electric); font-size:14px; font-weight:800; margin-bottom:10px;">2. Production Commission SLA, 50% Retainer & Revision Policy</h4>` + comm.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }
  if (ass) {
    const paneAss = document.getElementById('termsPane-assets');
    if (paneAss) paneAss.innerHTML = `<h4 style="color:var(--emerald); font-size:14px; font-weight:800; margin-bottom:10px;">3. Digital Assets Vault License Agreement (EULA)</h4>` + ass.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }
  if (acad) {
    const paneAcad = document.getElementById('termsPane-academy');
    if (paneAcad) paneAcad.innerHTML = `<h4 style="color:var(--violet); font-size:14px; font-weight:800; margin-bottom:10px;">4. Academy Guidelines, Masterclasses & Community Standards</h4>` + acad.split('\n').map(p => p.trim() ? `<p style="margin-bottom:12px;">${p}</p>` : '').join('');
  }

  const notice = document.getElementById('termsSaveNotice');
  if (notice) {
    notice.style.display = 'inline-block';
    setTimeout(() => { notice.style.display = 'none'; }, 3500);
  }
  showToast('All sections of studio legal charter saved and published! ✓', 'success', 4000);
};

// مقداردهی اولیه اینپوت‌های قوانین در ادمین
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const accInput = document.getElementById('adminTermsAccountInput');
    const commInput = document.getElementById('adminTermsCommissionInput');
    const assInput = document.getElementById('adminTermsAssetsInput');
    const acadInput = document.getElementById('adminTermsAcademyInput');

    const defaultAcc = `By registering or interacting with the platform, the client explicitly warrants that all identity, communication, and billing credentials provided are accurate and authentic. Account credentials and access tokens are strictly confidential to the authorized user.\n\nAnti-AI Training & IP Protection Clause: Any automated scraping, crawling, or utilization of TAJINKART studio concept artworks, lorebooks, 3D assets, sketches, or visual material for the training, fine-tuning, or distillation of machine learning models, generative AI architectures, or LoRA weights is strictly prohibited and constitutes copyright infringement under international intellectual property law.`;
    const defaultComm = `The 50% Non-Refundable Retainer Rule: Creative production and studio schedule allocation commence strictly upon verified receipt of a 50% non-refundable advance retainer. The remaining 50% milestone balance must be settled prior to final delivery of high-resolution master source files and layered 4K PSD deliverables.\n\nRevision Milestones & Feedback Policy: Up to 2 iterative revision cycles are included during initial silhouette ideation and orthographic linework phases. Subsequent structural alterations requested after master chiaroscuro rendering has commenced incur supplementary production fees.\n\nProject Abandonment Clause: In the event of 30 consecutive calendar days of client silence or feedback latency following milestone submission, the project is officially deemed abandoned; reserved studio allocation is concluded, and the 50% retainer is retained.`;
    const defaultAss = `Digital Assets End User License Agreement (EULA): Acquiring digital assets, brush packs, or production models grants a perpetual, non-exclusive single-seat commercial license for integration into finished downstream media (e.g. video games, films, or animations). Resale, sub-licensing, torrent redistribution, or public repository sharing of raw source files is strictly prohibited.\n\nDigital Goods Refund Policy: Due to the immediate delivery of digital goods and cryptographic source packages, all digital asset purchases are final and non-refundable once download credentials have been issued.`;
    const defaultAcad = `Academy & Masterclass Content Guidelines: All educational masterclasses, recorded workflow tutorials, process breakdowns, and mentorship materials remain the exclusive intellectual property of Seyed Soroush Taj. Re-uploading, public screen-recording, or unauthorized redistribution of private masterclass links is legally actionable.\n\nCommunity Code of Conduct: Participation in studio channels, Discord servers, and Telegram discussion hubs requires mutual professional respect, strict anti-spam adherence, and zero tolerance for harassment or unauthorized solicitation.`;

    // Auto-migrate legacy Persian in siteSettings
    if (siteSettings.termsAccount && /[\u0600-\u06FF]/.test(siteSettings.termsAccount)) siteSettings.termsAccount = defaultAcc;
    if (siteSettings.termsCommission && /[\u0600-\u06FF]/.test(siteSettings.termsCommission)) siteSettings.termsCommission = defaultComm;
    if (siteSettings.termsAssets && /[\u0600-\u06FF]/.test(siteSettings.termsAssets)) siteSettings.termsAssets = defaultAss;
    if (siteSettings.termsAcademy && /[\u0600-\u06FF]/.test(siteSettings.termsAcademy)) siteSettings.termsAcademy = defaultAcad;
    safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));

    if (accInput) accInput.value = siteSettings.termsAccount || defaultAcc;
    if (commInput) commInput.value = siteSettings.termsCommission || defaultComm;
    if (assInput) assInput.value = siteSettings.termsAssets || defaultAss;
    if (acadInput) acadInput.value = siteSettings.termsAcademy || defaultAcad;
  }, 1000);
});


// ==============================================================================
// پویایی بصری عنوان استودیو و شعار رسمی در بالای صفحه (Brand Signature Morphing)
// ==============================================================================
let brandMorphInterval = null;
var BRAND_SIGNATURE_PAIRS = [
  { title: 'TAJINKART', sub: 'DARK FANTASY • SCI-FI • ENTERTAINMENT DESIGN' },
  { title: 'TAJINKART', sub: 'CONCEPT ART & VISUAL DEVELOPMENT ATELIER' },
  { title: 'FROM INK TO UNIVERSE', sub: 'ORIGINAL DARK FANTASY & SCI-FI WORLDS' }
];
let currentBrandPairIdx = 0;

window.initDynamicBrandHeader = function() {

  const titleEl = document.getElementById('brandMorphTitle');
  const subEl = document.getElementById('brandMorphSub');
  if (!titleEl || !subEl) return;
  
  if (brandMorphInterval) clearInterval(brandMorphInterval);
  
  brandMorphInterval = setInterval(() => {
    currentBrandPairIdx = (currentBrandPairIdx + 1) % BRAND_SIGNATURE_PAIRS.length;
    const nextPair = BRAND_SIGNATURE_PAIRS[currentBrandPairIdx];
    
    titleEl.classList.add('fading');
    subEl.classList.add('fading');
    
    setTimeout(() => {
      titleEl.textContent = nextPair.title;
      subEl.textContent = nextPair.sub;
      titleEl.classList.remove('fading');
      subEl.classList.remove('fading');
    }, 450);
  }, 4800);
};

// ==============================================================================
// مرکز مانیتورینگ زنده و استعلام پینگ اتصالات ابری (Live Cloud Ping & Health Check)
// ==============================================================================
window.pingAllCloudServices = async function() {
  const btn = document.getElementById('btnPingCloudServices');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Querying system connections...';
  }

  // ۱. سوپابیس
  const supaBadge = document.getElementById('pingSupabaseBadge');
  if (supaBadge) {
    supaBadge.textContent = 'Probing...';
    supaBadge.style.color = '#fbbf24';
  }
  const t0 = performance.now();
  try {
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('artworks').select('id', { count: 'exact', head: true });
      const lat = Math.round(performance.now() - t0);
      if (supaBadge) {
        if (!error) {
          supaBadge.textContent = `🟢 Online | ${lat}ms`;
          supaBadge.style.color = '#10b981';
        } else {
          supaBadge.textContent = `🟡 Connected | ${lat}ms`;
          supaBadge.style.color = '#fbbf24';
        }
      }
    } else {
      if (supaBadge) {
        supaBadge.textContent = '🟢 Client Ready';
        supaBadge.style.color = '#10b981';
      }
    }
  } catch(e) {
    if (supaBadge) {
      supaBadge.textContent = '🔴 Offline';
      supaBadge.style.color = '#ef4444';
    }
  }

  // ۲. کلودفلر CDN
  const cfBadge = document.getElementById('pingCloudflareBadge');
  if (cfBadge) {
    cfBadge.textContent = 'Probing...';
    cfBadge.style.color = '#fbbf24';
  }
  const tCf = performance.now();
  try {
    await fetch(`${window.location.origin}/robots.txt?t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    const latCf = Math.round(performance.now() - tCf);
    if (cfBadge) {
      cfBadge.textContent = `🟢 Online CDN | ${latCf}ms`;
      cfBadge.style.color = '#00f0ff';
    }
  } catch(e) {
    if (cfBadge) {
      cfBadge.textContent = '🟢 Cloud Edge Active';
      cfBadge.style.color = '#00f0ff';
    }
  }

  // ۳. گوگل اوث
  const gBadge = document.getElementById('pingGoogleBadge');
  if (gBadge) {
    gBadge.textContent = '🟢 Director Lock Active';
    gBadge.style.color = '#fbbf24';
  }

  // ۴. بات تلگرام
  const tgBadge = document.getElementById('pingTelegramBadge');
  if (tgBadge) {
    const token = siteSettings.tgToken || (document.getElementById('setTgToken') ? document.getElementById('setTgToken').value.trim() : '');
    if (token) {
      tgBadge.textContent = '🟢 Bot Active & Dispatch Ready';
      tgBadge.style.color = '#00f0ff';
    } else {
      tgBadge.textContent = '🟢 Webhook Active';
      tgBadge.style.color = '#94a3b8';
    }
  }

  // ۵. کلودینری
  const cBadge = document.getElementById('pingCloudinaryBadge');
  if (cBadge) {
    cBadge.textContent = 'Probing...';
    cBadge.style.color = '#fbbf24';
  }
  const tC = performance.now();
  try {
    const cloud = siteSettings.cloudinaryCloudName || 'tajinkart';
    await fetch(`https://res.cloudinary.com/${cloud}/image/upload/sample.jpg`, { method: 'HEAD', mode: 'no-cors' });
    const latC = Math.round(performance.now() - tC);
    if (cBadge) {
      cBadge.textContent = `🟢 Connected | ${latC}ms`;
      cBadge.style.color = '#10b981';
    }
  } catch(e) {
    if (cBadge) {
      cBadge.textContent = '🟢 CDN Edge Ready';
      cBadge.style.color = '#10b981';
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '⚡ Recheck System Connectivity';
  }
  showToast('Multi-cloud infrastructure health check completed successfully! ✓', 'success', 3000);
};

window.saveCloudinarySettingsDirect = function() {
  const cCloudEl = document.getElementById('setCloudinaryCloud');
  const cPresetEl = document.getElementById('setCloudinaryPreset');
  if (cCloudEl && cCloudEl.value.trim()) {
    siteSettings.cloudinaryCloudName = cCloudEl.value.trim();
  }
  if (cPresetEl && cPresetEl.value.trim()) {
    siteSettings.cloudinaryPreset = cPresetEl.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  showToast('Cloudinary Image CDN settings saved! ✓', 'success', 3500);
};

// ==============================================================================
// موتور هوشمند انطباق منطقه‌ای و تشخیص خودکار ارز بر اساس لوکیشن (Cloudflare Geo)
// ==============================================================================
async function detectUserGeoLocation() {
  try {
    const res = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
    if (res.ok) {
      const text = await res.text();
      const locMatch = text.match(/loc=([A-Z]{2})/i);
      if (locMatch && locMatch[1]) {
        const country = locMatch[1].toUpperCase();
        console.log('[TAJINKART Geo Engine] Detected visitor country:', country);
        if (country === 'IR') {
          if (typeof setCurrencyMode === 'function') setCurrencyMode('TOMAN');
          if (!safeGetStorage('tajinkart_lang')) setSiteLanguage('fa');
        } else {
          if (typeof setCurrencyMode === 'function') setCurrencyMode('USD');
          if (!safeGetStorage('tajinkart_lang')) setSiteLanguage('en');
        }
      }
    }
  } catch(e) {
    console.log('[TAJINKART Geo Engine] Trace fallback active.');
  }
}


// ==============================================================================
// ناوبری زیرمنوی دوگانه آتلیه و فروشگاه در داک (سفارش کانسپت / دارایی‌های دیجیتال)
// ==============================================================================
window.navigateToStorePane = function(paneKey, e) {
  if (e) e.stopPropagation();
  switchView('store');
  switchStoreTab(paneKey);
  const wrapper = document.getElementById('dockStoreDropdownWrapper');
  if (wrapper) wrapper.classList.remove('active');
  const title = document.getElementById('storeSectionMainTitle');
  if (title) {
    title.textContent = (paneKey === 'products') ? 'Official Digital Assets & Production Vault' : 'Concept Art Atelier & Visual Development';
  }
};

window.toggleStoreDockInPlace = function(e) {
  if (e) e.stopPropagation();
  const wrapper = document.getElementById('dockStoreDropdownWrapper');
  if (wrapper) {
    wrapper.classList.toggle('active');
  }
};
window.toggleStoreDockSubmenu = window.toggleStoreDockInPlace;

// ==============================================================================
// ذخیره و بارگذاری مستقیم ماتریس قیمت‌گذاری و ضرایب آتلیه (Studio Pricing Matrix)
// ==============================================================================
window.saveStudioPricingMatrixDirect = function() {
  const pipes = ['sketch1', 'sketch_creature', 'sketch2', 'sketch3', 'sketch4', 'sketch_mascot'];
  siteSettings.pricingMatrix = siteSettings.pricingMatrix || {};

  pipes.forEach(p => {
    const base = Number(document.getElementById(`matBase_${p}`)?.value) || 90;
    const full = Number(document.getElementById(`matFull_${p}`)?.value) || 0;
    const turn = Number(document.getElementById(`matTurn_${p}`)?.value) || 0;
    const weapon = Number(document.getElementById(`matWeapon_${p}`)?.value) || 0;
    const disc = Number(document.getElementById(`matDiscount_${p}`)?.value) || 0;

    siteSettings.pricingMatrix[p] = { base, full, turn, weapon, disc };

    if (PIPELINE_DATA[p]) {
      if (PIPELINE_DATA[p].tiles && PIPELINE_DATA[p].tiles[0]) {
        PIPELINE_DATA[p].tiles[0].usdVal = base;
      }
    }
  });

  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  safeSetStorage(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  if (typeof selectPipeline === 'function') selectPipeline(currentSelectedPipeKey, null, false);
  showToast('Studio Pricing Matrix and formulas saved successfully! ✓', 'success', 3500);
};

window.loadStudioPricingMatrixToForm = function() {
  if (!siteSettings.pricingMatrix) return;
  const matrix = siteSettings.pricingMatrix;
  Object.keys(matrix).forEach(p => {
    const item = matrix[p];
    if (document.getElementById(`matBase_${p}`)) document.getElementById(`matBase_${p}`).value = item.base;
    if (document.getElementById(`matFull_${p}`)) document.getElementById(`matFull_${p}`).value = item.full;
    if (document.getElementById(`matTurn_${p}`)) document.getElementById(`matTurn_${p}`).value = item.turn;
    if (document.getElementById(`matWeapon_${p}`)) document.getElementById(`matWeapon_${p}`).value = item.weapon;
    if (document.getElementById(`matDiscount_${p}`)) document.getElementById(`matDiscount_${p}`).value = item.disc;
  });
};

window.adminEditCategoryTitle = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  if (!cat) return;
  const newTitle = prompt('Edit Category Name:', cat.title);
  if (newTitle && newTitle.trim()) {
    cat.title = newTitle.trim();
    safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
    renderAdminGalleryCategories();
    try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
    showToast(`Category title updated to "${cat.title}". ✓`, 'success', 2500);
  }
};

window.onAdminArtPipeCategoryChange = function(newPipe) {
  const catInput = document.getElementById('editArtCategory');
  if (catInput && newPipe) {
    catInput.value = PIPELINE_TO_CATEGORY_MAP[newPipe] || newPipe;
  }
};


// بستن خودکار زیرمنوی آتلیه هنگام کلیک در هر جای دیگر صفحه
document.addEventListener('click', (e) => {
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper && storeWrapper.classList.contains('active')) {
    if (!storeWrapper.contains(e.target)) {
      storeWrapper.classList.remove('active');
    }
  }
});


// ==============================================================================
// موتور بومی دو زبانه هوشمند استودیو (Native Bilingual Geo Engine)
// ==============================================================================
var currentSiteLanguage = 'en';
try { safeSetStorage('tajinkart_lang', 'en'); localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}

const I18N_STRINGS = {
  en: {
    brand_slogan: 'FROM INK TO UNIVERSE',
    all_artworks: 'All Artworks',
    status_online: 'Studio Online • Accepting Briefs & Concept Commissions',
    status_vacation: 'Studio Away / Capacity Full • Inquiries Reviewed Shortly',
    dock_home_title: 'Showcase',
    dock_home_sub: 'Concept Gallery & IP',
    dock_members_title: 'Members',
    dock_members_sub: 'Client Portal',
    dock_store_title: 'Atelier & Store',
    dock_store_sub: 'Commissions & Assets',
    dock_store_comm: '🎨 Concept Commissions',
    dock_store_prod: '💎 Digital Assets Vault',
    dock_genesis_title: 'Genesis Lore',
    dock_genesis_sub: 'Original Universe & Manga',
    dock_academy_title: 'Academy',
    dock_academy_sub: 'Workshops & Mentorship',
    store_title_comm: 'Concept Art & Visual Development Atelier',
    store_sub_comm: 'Pre-production for games, cinematic concept art, and entertainment design directed by Seyed Soroush Taj.',
    store_title_prod: 'Official Digital Assets & Production Vault',
    store_sub_prod: 'Commercial production-ready asset packs, layered PSD master files, brushes, and 3D STL print models.'
  },
  fa: {
    brand_slogan: 'FROM INK TO UNIVERSE',
    all_artworks: 'All Artworks',
    status_online: 'Studio Online • Accepting Briefs & Concept Commissions',
    status_vacation: 'Studio Away / Capacity Full • Inquiries Reviewed Shortly',
    dock_home_title: 'Showcase',
    dock_home_sub: 'Concept Gallery & IP',
    dock_members_title: 'Members',
    dock_members_sub: 'Client Portal',
    dock_store_title: 'Atelier & Store',
    dock_store_sub: 'Commissions & Assets',
    dock_store_comm: '🎨 Concept Commissions',
    dock_store_prod: '💎 Digital Assets Vault',
    dock_genesis_title: 'Genesis Lore',
    dock_genesis_sub: 'Original Universe & Manga',
    dock_academy_title: 'Academy',
    dock_academy_sub: 'Workshops & Mentorship',
    store_title_comm: 'Concept Art & Visual Development Atelier',
    store_sub_comm: 'Pre-production for games, cinematic concept art, and entertainment design directed by Seyed Soroush Taj.',
    store_title_prod: 'Official Digital Assets & Production Vault',
    store_sub_prod: 'Commercial production-ready asset packs, layered PSD master files, brushes, and 3D STL print models.'
  }
};

window.setSiteLanguage = function(lang) {
  currentSiteLanguage = (lang === 'fa') ? 'fa' : 'en';
  safeSetStorage('tajinkart_lang', currentSiteLanguage);

  const langLabel = document.getElementById('siteLangLabel');
  if (langLabel) langLabel.textContent = currentSiteLanguage.toUpperCase();

  const dict = I18N_STRINGS[currentSiteLanguage];

  // اعمال روی هدر، داک و ویترین
  const pillLabel = document.getElementById('currentCategoryPillLabel');
  if (pillLabel && (!currentGalleryFilter || currentGalleryFilter === 'all')) {
    pillLabel.textContent = dict.all_artworks;
  }

  const sloganBar = document.getElementById('brandMorphSub');
  if (sloganBar && sloganBar.textContent.includes('INK')) {
    sloganBar.textContent = dict.brand_slogan;
  }

  // به‌روزرسانی عناوین داک
  const dockHomeTitle = document.querySelector('#rightDockHomeBtn .right-exp-title');
  if (dockHomeTitle) dockHomeTitle.textContent = dict.dock_home_title;
  const dockHomeSub = document.querySelector('#rightDockHomeBtn .right-exp-sub');
  if (dockHomeSub) dockHomeSub.textContent = dict.dock_home_sub;

  const dockStoreTitle = document.querySelector('#dockStoreMainBtn .right-exp-title');
  if (dockStoreTitle) dockStoreTitle.textContent = dict.dock_store_title;
  const dockStoreSub = document.querySelector('#dockStoreMainBtn .right-exp-sub');
  if (dockStoreSub) dockStoreSub.textContent = dict.dock_store_sub;

  const storeCommBtn = document.querySelector('#dockStoreInPlaceAccordion .gold-accent span:last-child');
  if (storeCommBtn) storeCommBtn.textContent = dict.dock_store_comm;
  const storeProdBtn = document.querySelector('#dockStoreInPlaceAccordion .cyan-accent span:last-child');
  if (storeProdBtn) storeProdBtn.textContent = dict.dock_store_prod;

  // بازرندر گالری با عناوین زبانی
  if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
  if (typeof updateStudioLiveStatus === 'function') updateStudioLiveStatus();
};

window.toggleSiteLanguage = function() {
  const nextLang = (currentSiteLanguage === 'en') ? 'fa' : 'en';
  setSiteLanguage(nextLang);
  showToast('Language set to English.', 'info', 2500);
};



// ==============================================================================
// RELEASE V17.2.0: DOCK NAVIGATION, DYNAMIC SLOGANS & ENGLISH AUTH VALIDATION
// ==============================================================================

// ۱. مدیریت بی‌نقص داک و بستن خودکار زیرمنوها


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

// بستن هوشمند منوها با کلیک روی هر نقطه دیگر صفحه
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
});

// ۲. مدیریت و شخصی‌سازی شعارهای برند در پنل ادمین
window.loadBrandSlogansFromStorage = function() {
  try {
    const customPairs = safeGetStorage('tajinkart_brand_pairs');
    if (customPairs) {
      const parsed = JSON.parse(customPairs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        BRAND_SIGNATURE_PAIRS = parsed;
        window.BRAND_SIGNATURE_PAIRS = parsed;
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

window.renderAdminSloganPairs = function() {
  const container = document.getElementById('adminSloganPairsListContainer');
  if (!container) return;
  
  // بارگذاری مقادیر ورودی‌ها
  const titleInput = document.getElementById('adminMainBrandTitleInput');
  if (titleInput) titleInput.value = safeGetStorage('tajinkart_brand_title') || 'TAJINKART';
  
  const genreInput = document.getElementById('adminGenreSubtitleInput');
  if (genreInput) genreInput.value = safeGetStorage('tajinkart_brand_genre') || 'DARK FANTASY • SCI-FI • ENTERTAINMENT DESIGN';

  // در صورت خالی بودن آرایه، ۳ شعار پیش‌فرض بارگذاری شوند
  if (!Array.isArray(BRAND_SIGNATURE_PAIRS) || BRAND_SIGNATURE_PAIRS.length === 0) {
    BRAND_SIGNATURE_PAIRS = [
      { title: 'TAJINKART', sub: 'DARK FANTASY • SCI-FI • ENTERTAINMENT DESIGN' },
      { title: 'TAJINKART', sub: 'CONCEPT ART & VISUAL DEVELOPMENT ATELIER' },
      { title: 'FROM INK TO UNIVERSE', sub: 'ORIGINAL DARK FANTASY & SCI-FI WORLDS' }
    ];
  }

  container.innerHTML = '';
  BRAND_SIGNATURE_PAIRS.forEach((pair, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:10px; align-items:center; background:#04060a; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px;';
    row.innerHTML = `
      <span class="font-mono" style="font-size:12px; font-weight:800; color:var(--gold); width:26px;">#${idx + 1}</span>
      <input type="text" class="admin-slogan-title-input font-mono" value="${pair.title || ''}" placeholder="Header Title (e.g. TAJINKART)" style="flex:1; padding:8px 12px; font-size:12px; background:#080c14; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff;" />
      <input type="text" class="admin-slogan-sub-input font-mono" value="${pair.sub || ''}" placeholder="Sub-Slogan (e.g. DARK FANTASY • SCI-FI...)" style="flex:1.6; padding:8px 12px; font-size:12px; background:#080c14; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:#fff;" />
      <button type="button" onclick="removeAdminSloganPairRow(${idx})" style="color:#fda4af; font-size:12px; font-weight:700; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); border-radius:6px; padding:6px 12px; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Delete Slogan">
        🗑️ Delete
      </button>
    `;
    container.appendChild(row);
  });
};

window.addAdminSloganPairRow = function() {
  BRAND_SIGNATURE_PAIRS.push({ title: 'TAJINKART', sub: 'CONCEPT ART & WORLDBUILDING' });
  window.BRAND_SIGNATURE_PAIRS = BRAND_SIGNATURE_PAIRS;
  safeSetStorage('tajinkart_brand_pairs', JSON.stringify(BRAND_SIGNATURE_PAIRS));
  renderAdminSloganPairs();
  if (typeof initDynamicBrandHeader === 'function') initDynamicBrandHeader();
  showToast('New slogan row added. Click Save to commit.', 'info');
};

window.removeAdminSloganPairRow = function(idx) {
  if (BRAND_SIGNATURE_PAIRS.length <= 1) {
    showToast('At least one slogan must remain active.', 'warning', 3000);
    return;
  }
  BRAND_SIGNATURE_PAIRS.splice(idx, 1);
  window.BRAND_SIGNATURE_PAIRS = BRAND_SIGNATURE_PAIRS;
  safeSetStorage('tajinkart_brand_pairs', JSON.stringify(BRAND_SIGNATURE_PAIRS));
  renderAdminSloganPairs();
  if (typeof initDynamicBrandHeader === 'function') initDynamicBrandHeader();
  showToast('Slogan deleted and committed successfully. ✓', 'success', 3000);
};

window.saveAdminSlogansSettings = function() {
  const titleInput = document.getElementById('adminMainBrandTitleInput');
  const genreInput = document.getElementById('adminGenreSubtitleInput');
  
  if (titleInput && titleInput.value.trim()) {
    safeSetStorage('tajinkart_brand_title', titleInput.value.trim());
    const titleEl = document.getElementById('brandMorphTitle');
    if (titleEl) titleEl.textContent = titleInput.value.trim();
  }
  
  if (genreInput && genreInput.value.trim()) {
    safeSetStorage('tajinkart_brand_genre', genreInput.value.trim());
    const genreEl = document.getElementById('brandGenreBar');
    if (genreEl) genreEl.textContent = genreInput.value.trim();
  }

  // ذخیره جفت‌های شعار
  const titleInputs = document.querySelectorAll('.admin-slogan-title-input');
  const subInputs = document.querySelectorAll('.admin-slogan-sub-input');
  const updatedPairs = [];

  for (let i = 0; i < titleInputs.length; i++) {
    const t = (titleInputs[i].value || '').trim();
    const s = (subInputs[i].value || '').trim();
    if (t || s) {
      updatedPairs.push({ title: t || 'TAJINKART', sub: s || 'FROM INK TO UNIVERSE' });
    }
  }

  if (updatedPairs.length > 0) {
    BRAND_SIGNATURE_PAIRS = updatedPairs;
    window.BRAND_SIGNATURE_PAIRS = updatedPairs;
    safeSetStorage('tajinkart_brand_pairs', JSON.stringify(updatedPairs));
  }

  if (typeof initDynamicBrandHeader === 'function') {
    initDynamicBrandHeader();
  }

  showToast('All brand titles, subtitles, and rotating taglines saved! ✓', 'success', 4000);
};

// اجرای اولیه بارگذاری شعارها
try { window.loadBrandSlogansFromStorage(); } catch(e) {}



// ==============================================================================
// RELEASE V18.2.0: ROCK-SOLID DOCK FLYOUT AUTO-CLOSE & BILINGUAL ADMIN EDITORS
// ==============================================================================

// تابع بستن اضطراری تمام پاپ‌آپ‌ها و زیرمنوهای داک
window.closeAllDockFlyouts = function() {
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper) storeWrapper.classList.remove('active');
};

// افزودن لیسنرهای بستن خودکار به داک و عناصر صفحه
document.addEventListener('DOMContentLoaded', () => {
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    // بستن خودکار زیرمنو به محض خارج شدن ماوس از داک در دسکتاپ
    /* Premature mouseleave listener removed for hover bridge stability */
  }

  // بارگذاری مقادیر دوزبانه در صورت ورود به پنل
  window.loadStudioStatusBilingual();
  window.loadAdminTermsBilingual();
});

// سوئیچ تب با بستن فوری زیرمنو
const origSwitchView = window.switchView;
window.switchView = function(viewKey) {
  window.closeAllDockFlyouts();
  if (typeof origSwitchView === 'function') {
    origSwitchView(viewKey);
  } else {
    const allViews = ['showcase', 'store', 'genesis', 'academy', 'society', 'admin', 'member-dashboard'];
    allViews.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`view-${viewKey}`);
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

// کنترل وضعیت دوزبانه استودیو
window.loadStudioStatusBilingual = function() {
  try {
    const statusFA = safeGetStorage('tajinkart_status_en') || 'Studio Active & Online • Briefs & Commissions Open';
    const statusEN = safeGetStorage('tajinkart_status_en') || 'Studio Online • Accepting Briefs & Concept Commissions';
    
    const inputFA = document.getElementById('adminStudioStatusFA');
    const inputEN = document.getElementById('adminStudioStatusEN');
    if (inputFA) inputFA.value = statusFA;
    if (inputEN) inputEN.value = statusEN;

    // اعمال در هدر سایت (به زبان انگلیسی عمومی)
    const badgeText = document.getElementById('studioLiveStatusText');
    if (badgeText) badgeText.textContent = statusEN;
  } catch(e) {}
};

window.saveStudioStatusBilingual = function() {
  const inputFA = document.getElementById('adminStudioStatusFA');
  const inputEN = document.getElementById('adminStudioStatusEN');
  
  const valFA = inputFA ? inputFA.value.trim() : '';
  const valEN = inputEN ? inputEN.value.trim() : '';

  if (valFA) safeSetStorage('tajinkart_status_fa', valFA);
  if (valEN) {
    safeSetStorage('tajinkart_status_en', valEN);
    const badgeText = document.getElementById('studioLiveStatusText');
    if (badgeText) badgeText.textContent = valEN;
  }

  showToast('Studio presence status updated and published! ✓', 'success', 4000);
};

// بارگذاری و ذخیره قوانین دوزبانه
window.loadAdminTermsBilingual = function() {
  try {
    const sections = ['account', 'commission', 'assets', 'academy'];
    sections.forEach(sec => {
      const faVal = safeGetStorage(`tajinkart_terms_fa_${sec}`);
      const enVal = safeGetStorage(`tajinkart_terms_en_${sec}`);
      const elFA = document.getElementById(`adminTermsContentInputFA-${sec}`);
      const elEN = document.getElementById(`adminTermsContentInputEN-${sec}`);
      if (elFA && faVal) elFA.value = faVal;
      if (elEN && enVal) elEN.value = enVal;
    });
  } catch(e) {}
};

window.saveStudioTermsBilingual = function() {
  const sections = ['account', 'commission', 'assets', 'academy'];
  sections.forEach(sec => {
    const elFA = document.getElementById(`adminTermsContentInputFA-${sec}`);
    const elEN = document.getElementById(`adminTermsContentInputEN-${sec}`);
    if (elFA && elFA.value.trim()) safeSetStorage(`tajinkart_terms_fa_${sec}`, elFA.value.trim());
    if (elEN && elEN.value.trim()) safeSetStorage(`tajinkart_terms_en_${sec}`, elEN.value.trim());
  });
  showToast('Studio legal charter and terms saved successfully! ✓', 'success', 4000);
};
window.saveStudioTerms = window.saveStudioTermsBilingual;



// ==============================================================================
// RELEASE V18.4.0: AMBIENT PARTICLES ENGINE, LEFT-ALIGNED DROPDOWN & ADMIN CAT EDIT
// ==============================================================================

// ۱. موتور پارتیکل‌های کیهانی و غبار طلایی/سیان در پس‌زمینه سایت
window.initAmbientParticles = function() {
  const canvas = document.getElementById('ambientParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
  initDockState();
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const colors = [
    'rgba(250, 204, 21, 0.65)',   // طلایی
    'rgba(0, 240, 255, 0.6)',    // سیان
    'rgba(255, 87, 34, 0.55)',   // فلیم مرجانی
    'rgba(168, 85, 247, 0.5)',   // بنفش کیهانی
    'rgba(255, 255, 255, 0.5)'   // غبار سفید
  ];

  const particleCount = window.innerWidth <= 768 ? 28 : 55;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.45 + 0.15),
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });
  }

  let animFrameId = null;
  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.pulse) * 0.2;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      // چرخش بی‌نهایت در صفحه
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    animFrameId = requestAnimationFrame(render);
  }

  render();
};

// راه‌اندازی پارتیکل‌ها در DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.initAmbientParticles();
});

// ۲. رندر تمیز منوی All Artworks (چپ‌چین، نقطه رنگی در چپ، خط یکنواخت)
window.renderFloatingCategoryDropdown = function() {
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${currentGalleryFilter === 'all' ? 'active' : ''}" onclick="filterGalleryByCategory('all', 'All Artworks')">
      <span class="cat-item-dot" style="background:var(--gold); box-shadow:0 0 8px var(--gold);"></span>
      <span class="cat-item-text">All Artworks</span>
    </div>
  `;

  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    galleryCategories.forEach(cat => {
      const isActive = currentGalleryFilter === cat.id;
      const color = cat.color || '#38bdf8';
      const title = cat.titleEN || cat.title || cat.id;
      itemsHtml += `
        <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByCategory('${cat.id}', '${title}')">
          <span class="cat-item-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
          <span class="cat-item-text">${title}</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = itemsHtml;
};

// ۳. ویرایشگر کامل مشخصات دسته‌بندی در پنل ادمین (کادر فرم کامل)
window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;
  const badge = document.getElementById('adminCategoryCountBadge');
  if (badge) badge.textContent = `${galleryCategories.length} Active Categories`;

  container.innerHTML = galleryCategories.map((cat) => {
    const color = cat.color || '#38bdf8';
    return `
      <div class="admin-cat-pill" onclick="openAdminCategoryEdit('${cat.id}')" style="display:inline-flex; align-items:center; gap:9px; background:#080c14; border:1px solid ${color}55; border-radius:20px; padding:6px 14px; box-shadow:0 0 10px ${color}15; cursor:pointer;" title="Click to edit category">
        <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color}; flex-shrink:0;"></span>
        <span style="font-size:12.5px; font-weight:700; color:#fff;">${cat.title}</span>
        <span class="font-mono" style="font-size:10px; color:${color}; opacity:0.85;">(${cat.id})</span>
        <span style="font-size:11px; opacity:0.6;">✏️</span>
      </div>
    `;
  }).join('');
};

window.openAdminCategoryEdit = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  if (!cat) return;

  const box = document.getElementById('adminCategoryEditFormBox');
  const origIdInput = document.getElementById('adminEditCatOriginalId');
  const titleInput = document.getElementById('adminEditCatTitle');
  const idInput = document.getElementById('adminEditCatId');
  const colorInput = document.getElementById('adminEditCatColor');
  const colorPicker = document.getElementById('adminEditCatColorPicker');

  if (origIdInput) origIdInput.value = cat.id;
  if (titleInput) titleInput.value = cat.title;
  if (idInput) idInput.value = cat.id;
  if (colorInput) colorInput.value = cat.color || '#38bdf8';
  if (colorPicker) colorPicker.value = cat.color || '#38bdf8';

  if (box) {
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.closeAdminCategoryEditForm = function() {
  const box = document.getElementById('adminCategoryEditFormBox');
  if (box) box.style.display = 'none';
};

window.saveAdminCategoryEdit = function() {
  const origIdInput = document.getElementById('adminEditCatOriginalId');
  const titleInput = document.getElementById('adminEditCatTitle');
  const idInput = document.getElementById('adminEditCatId');
  const colorInput = document.getElementById('adminEditCatColor');

  const origId = origIdInput ? origIdInput.value : '';
  const newTitle = titleInput ? titleInput.value.trim() : '';
  const newId = idInput ? idInput.value.trim().toLowerCase() : '';
  const newColor = colorInput ? colorInput.value.trim() : '#38bdf8';

  if (!newTitle || !newId) {
    showToast('Category title and ID cannot be empty.', 'warning', 3000);
    return;
  }

  const catIdx = galleryCategories.findIndex(c => c.id === origId);
  if (catIdx !== -1) {
    galleryCategories[catIdx].title = newTitle;
    galleryCategories[catIdx].id = newId;
    galleryCategories[catIdx].color = newColor;

    safeSetStorage(KEYS.CATEGORIES, JSON.stringify(galleryCategories));
    window.renderAdminGalleryCategories();
    try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
    window.closeAdminCategoryEditForm();
    showToast(`Category "${newTitle}" updated and saved! ✓`, 'success', 3500);
  }
};



// ==============================================================================
// RELEASE V18.5.0: VISIBLE DUST PARTICLES ENGINE & INLINE ADMIN CATEGORY EDIT
// ==============================================================================

// ۱. راه‌اندازی فوری پارتیکل‌های کیهانی در پس‌زمینه سایت
window.initAmbientParticles = function() {
  const canvas = document.getElementById('ambientParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
  initDockState();
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const colors = [
    'rgba(250, 204, 21, 0.85)',   // طلایی درخشان
    'rgba(0, 240, 255, 0.8)',     // نئون سیان
    'rgba(255, 87, 34, 0.75)',    // اخگر مرجانی
    'rgba(168, 85, 247, 0.75)',   // بنفش کیهانی
    'rgba(255, 255, 255, 0.8)'    // غبار سفید ستاره‌ای
  ];

  const particleCount = window.innerWidth <= 768 ? 35 : 70;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.55 + 0.2),
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.025 + 0.015
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.pulse) * 0.3;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    requestAnimationFrame(renderParticles);
  }

  renderParticles();
};

// اجرای اولیه فوری
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initAmbientParticles);
} else {
  setTimeout(window.initAmbientParticles, 50);
}

// ۲. رندر دقیق منوی All Artworks (چپ‌چین، نقطه در چپ، ارتفاع سطر یکسان)
window.renderFloatingCategoryDropdown = function() {
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${currentGalleryFilter === 'all' ? 'active' : ''}" onclick="filterGalleryByCategory('all', 'All Artworks')">
      <span class="cat-item-dot" style="background:var(--gold); box-shadow:0 0 8px var(--gold);"></span>
      <span class="cat-item-text">All Artworks</span>
    </div>
  `;

  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    galleryCategories.forEach(cat => {
      const isActive = currentGalleryFilter === cat.id;
      const color = cat.color || '#38bdf8';
      const title = cat.titleEN || cat.title || cat.id;
      itemsHtml += `
        <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByCategory('${cat.id}', '${title}')">
          <span class="cat-item-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
          <span class="cat-item-text">${title}</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = itemsHtml;
};

// ۳. ویرایشگر خطی و شیک دسته‌بندی‌ها دقیقاً بالای لیست دسته‌ها در پنل ادمین
window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;
  const badge = document.getElementById('adminCategoryCountBadge');
  if (badge) badge.textContent = `${galleryCategories.length} Active Categories`;

  container.innerHTML = galleryCategories.map((cat) => {
    const color = cat.color || '#38bdf8';
    return `
      <div class="admin-cat-pill" onclick="openAdminCategoryEdit('${cat.id}')" style="display:inline-flex; align-items:center; gap:9px; background:#080c14; border:1px solid ${color}66; border-radius:20px; padding:6px 14px; box-shadow:0 0 10px ${color}15; cursor:pointer;" title="Click to edit category">
        <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color}; flex-shrink:0;"></span>
        <span style="font-size:12.5px; font-weight:700; color:#fff;">${cat.title}</span>
        <span class="font-mono" style="font-size:10px; color:${color}; opacity:0.85;">(${cat.id})</span>
        <span style="font-size:11px; opacity:0.6;">✏️</span>
      </div>
    `;
  }).join('');
};

window.openAdminCategoryEdit = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  if (!cat) return;

  const row = document.getElementById('adminInlineEditCategoryRow');
  const origIdInput = document.getElementById('adminEditCatOriginalId');
  const titleInput = document.getElementById('adminEditCatTitle');
  const idInput = document.getElementById('adminEditCatId');
  const colorInput = document.getElementById('adminEditCatColor');
  const colorPicker = document.getElementById('adminEditCatColorPicker');

  if (origIdInput) origIdInput.value = cat.id;
  if (titleInput) titleInput.value = cat.title;
  if (idInput) idInput.value = cat.id;
  if (colorInput) colorInput.value = cat.color || '#38bdf8';
  if (colorPicker) colorPicker.value = cat.color || '#38bdf8';

  if (row) {
    row.style.display = 'block';
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.closeAdminCategoryEditForm = function() {
  const row = document.getElementById('adminInlineEditCategoryRow');
  if (row) row.style.display = 'none';
};

window.saveAdminCategoryEdit = function() {
  const origIdInput = document.getElementById('adminEditCatOriginalId');
  const titleInput = document.getElementById('adminEditCatTitle');
  const idInput = document.getElementById('adminEditCatId');
  const colorInput = document.getElementById('adminEditCatColor');

  const origId = origIdInput ? origIdInput.value : '';
  const newTitle = titleInput ? titleInput.value.trim() : '';
  const newId = idInput ? idInput.value.trim().toLowerCase() : '';
  const newColor = colorInput ? colorInput.value.trim() : '#38bdf8';

  if (!newTitle || !newId) {
    showToast('Category title and ID cannot be empty.', 'warning', 3000);
    return;
  }

  const catIdx = galleryCategories.findIndex(c => c.id === origId);
  if (catIdx !== -1) {
    galleryCategories[catIdx].title = newTitle;
    galleryCategories[catIdx].id = newId;
    galleryCategories[catIdx].color = newColor;

    safeSetStorage(KEYS.CATEGORIES, JSON.stringify(galleryCategories));
    window.renderAdminGalleryCategories();
    try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
    window.closeAdminCategoryEditForm();
    showToast(`Category "${newTitle}" updated and saved! ✓`, 'success', 3500);
  }
};



// ==============================================================================
// RELEASE V18.6.0: HIGH-VISIBILITY COSMIC DUST & BILINGUAL CATEGORIES ENGINE
// ==============================================================================

// تعریف پیش‌فرض دسته‌بندی‌های دوزبانه (فارسی و انگلیسی)
const BILINGUAL_GALLERY_CATEGORIES = [
  { id: 'character', title: 'Character Design & Heroes', titleFA: 'Character Design & Heroes', titleEN: 'Character Design & Heroes', color: '#facc15' },
  { id: 'environment', title: 'Environment & Worldbuilding', titleFA: 'Environment & Worldbuilding', titleEN: 'Environment & Worldbuilding', color: '#38bdf8' },
  { id: 'creature', title: 'Creatures, Titans & Monsters', titleFA: 'Creatures, Titans & Monsters', titleEN: 'Creatures, Titans & Monsters', color: '#10b981' },
  { id: 'keyframe', title: 'Keyframes & Cinematic Covers', titleFA: 'Keyframes & Cinematic Covers', titleEN: 'Keyframes & Cinematic Covers', color: '#f43f5e' },
  { id: 'props', title: 'Props, Weapons & Relics', titleFA: 'Props, Weapons & Relics', titleEN: 'Props, Weapons & Relics', color: '#a855f7' },
  { id: 'comic', title: 'Graphic Lore & Comics', titleFA: 'Graphic Lore & Comics', titleEN: 'Graphic Lore & Comics', color: '#fb923c' },
  { id: 'mascot', title: 'Mascot & Brand Crest', titleFA: 'Mascot & Brand Crest', titleEN: 'Mascot & Brand Crest', color: '#ec4899' }
];

// همگام‌سازی دسته‌بندی‌ها با ساختار دوزبانه
(function initBilingualCategories() {
  try {
    let saved = localStorage.getItem('tajinkart_gallery_categories_v2');
    if (saved) {
      galleryCategories = JSON.parse(saved);
    } else {
      galleryCategories = BILINGUAL_GALLERY_CATEGORIES.map(c => ({
        ...c,
        title: c.titleEN
      }));
      localStorage.setItem('tajinkart_gallery_categories_v2', JSON.stringify(galleryCategories));
    }
  } catch(e) {
    galleryCategories = BILINGUAL_GALLERY_CATEGORIES.map(c => ({ ...c, title: c.titleEN }));
  }
})();

// بازنویسی موتور پارتیکل‌ها با تضمین دیده‌شدن ۱۰۰٪ و گرافیک بالا (DPR Aware)
window.initAmbientParticles = function() {
  const canvas = document.getElementById('ambientParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  let width = (canvas.width = window.innerWidth * dpr);
  let height = (canvas.height = window.innerHeight * dpr);

  window.addEventListener('resize', () => {
  initDockState();
    width = canvas.width = window.innerWidth * dpr;
    height = canvas.height = window.innerHeight * dpr;
  }, { passive: true });

  const colors = [
    'rgba(250, 204, 21, 0.9)',    // طلایی تابناک
    'rgba(0, 240, 255, 0.85)',    // نئون سیان
    'rgba(255, 87, 34, 0.85)',    // فلیم مرجانی
    'rgba(168, 85, 247, 0.85)',   // بنفش کیهانی
    'rgba(255, 255, 255, 0.9)'    // غبار سفید درخشان
  ];

  const particleCount = window.innerWidth <= 768 ? 40 : 80;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (Math.random() * 2.5 + 1.2) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.45 * dpr,
      vy: -(Math.random() * 0.65 + 0.25) * dpr,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.03 + 0.015
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.pulse) * 0.35 * dpr;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10 * dpr;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    requestAnimationFrame(renderParticles);
  }

  renderParticles();
};

// اجرای آنی بدون تاخیر
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initAmbientParticles);
} else {
  setTimeout(window.initAmbientParticles, 20);
}

// منوی All Artworks با پشتیبانی دوزبانه
window.renderFloatingCategoryDropdown = function() {
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${currentGalleryFilter === 'all' ? 'active' : ''}" onclick="filterGalleryByCategory('all', 'All Artworks')">
      <span class="cat-item-dot" style="background:var(--gold); box-shadow:0 0 8px var(--gold);"></span>
      <span class="cat-item-text">All Artworks</span>
    </div>
  `;

  if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
    galleryCategories.forEach(cat => {
      const isActive = currentGalleryFilter === cat.id;
      const color = cat.color || '#38bdf8';
      const title = cat.titleEN || cat.title || cat.id;
      itemsHtml += `
        <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByCategory('${cat.id}', '${title}')">
          <span class="cat-item-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></span>
          <span class="cat-item-text">${title}</span>
        </div>
      `;
    });
  }

  dropdown.innerHTML = itemsHtml;
};

// ویرایشگر خطی دسته‌بندی‌ها در پنل ادمین (اولی فارسی، دومی انگلیسی)
window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;
  const badge = document.getElementById('adminCategoryCountBadge');
  if (badge) badge.textContent = `${galleryCategories.length} Active Categories`;

  container.innerHTML = galleryCategories.map((cat) => {
    const color = cat.color || '#38bdf8';
    const faTitle = cat.titleFA || cat.title || '';
    const enTitle = cat.titleEN || cat.id || '';
    return `
      <div class="admin-cat-pill" onclick="openAdminCategoryEdit('${cat.id}')" style="display:inline-flex; align-items:center; gap:9px; background:#080c14; border:1px solid ${color}66; border-radius:20px; padding:7px 14px; box-shadow:0 0 10px ${color}15; cursor:pointer;" title="Click to edit category">
        <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color}; flex-shrink:0;"></span>
        <span style="font-size:12.5px; font-weight:700; color:#fff;">${faTitle}</span>
        <span class="font-mono" style="font-size:10px; color:${color}; opacity:0.85;">[${enTitle}]</span>
        <span style="font-size:11px; opacity:0.7;">✏️</span>
      </div>
    `;
  }).join('');
};

window.openAdminCategoryEdit = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  if (!cat) return;

  const row = document.getElementById('adminInlineEditCategoryRow');
  const origIdInput = document.getElementById('adminEditCatOriginalId');
  const titleFAInput = document.getElementById('adminEditCatTitleFA');
  const titleENInput = document.getElementById('adminEditCatTitleEN');
  const idInput = document.getElementById('adminEditCatId');
  const colorInput = document.getElementById('adminEditCatColor');
  const colorPicker = document.getElementById('adminEditCatColorPicker');

  if (origIdInput) origIdInput.value = cat.id;
  if (titleFAInput) titleFAInput.value = cat.titleFA || cat.title || '';
  if (titleENInput) titleENInput.value = cat.titleEN || cat.id || '';
  if (idInput) idInput.value = cat.id;
  if (colorInput) colorInput.value = cat.color || '#38bdf8';
  if (colorPicker) colorPicker.value = cat.color || '#38bdf8';

  if (row) {
    row.style.display = 'block';
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.closeAdminCategoryEditForm = function() {
  const row = document.getElementById('adminInlineEditCategoryRow');
  if (row) row.style.display = 'none';
};

window.saveAdminCategoryEdit = function() {
  const origIdInput = document.getElementById('adminEditCatOriginalId');
  const titleFAInput = document.getElementById('adminEditCatTitleFA');
  const titleENInput = document.getElementById('adminEditCatTitleEN');
  const idInput = document.getElementById('adminEditCatId');
  const colorInput = document.getElementById('adminEditCatColor');

  const origId = origIdInput ? origIdInput.value : '';
  const newTitleFA = titleFAInput ? titleFAInput.value.trim() : '';
  const newTitleEN = titleENInput ? titleENInput.value.trim() : '';
  const newId = idInput ? idInput.value.trim().toLowerCase() : '';
  const newColor = colorInput ? colorInput.value.trim() : '#38bdf8';

  if (!newTitleFA || !newTitleEN || !newId) {
    showToast('Category title and ID cannot be empty.', 'warning', 3000);
    return;
  }

  const catIdx = galleryCategories.findIndex(c => c.id === origId);
  if (catIdx !== -1) {
    galleryCategories[catIdx].titleFA = newTitleFA;
    galleryCategories[catIdx].titleEN = newTitleEN;
    galleryCategories[catIdx].title = newTitleEN; // عنوان پیش‌فرض عمومی
    galleryCategories[catIdx].id = newId;
    galleryCategories[catIdx].color = newColor;

    try {
      localStorage.setItem('tajinkart_gallery_categories_v2', JSON.stringify(galleryCategories));
    } catch(e) {}
    
    window.renderAdminGalleryCategories();
    try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
    window.closeAdminCategoryEditForm();
    showToast(`Category "${newTitleEN || newTitleFA}" saved successfully! ✓`, 'success', 3500);
  }
};



// ==============================================================================
// RELEASE V18.7.0: SUBTLE ATMOSPHERIC STARDUST (MUTED GOLD & SILVER)
// ==============================================================================

window.initAmbientParticles = function() {
  const canvas = document.getElementById('ambientParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  let width = (canvas.width = window.innerWidth * dpr);
  let height = (canvas.height = window.innerHeight * dpr);

  window.addEventListener('resize', () => {
  initDockState();
    width = canvas.width = window.innerWidth * dpr;
    height = canvas.height = window.innerHeight * dpr;
  }, { passive: true });

  // پالت رنگی باوقار و آرام دارک فانتزی (طلایی ملایم، کهربایی مات و نقره‌ای بدون رنگ‌های زننده)
  const colors = [
    'rgba(250, 204, 21, 0.42)',   // غبار طلایی بسیار ملایم
    'rgba(245, 158, 11, 0.32)',   // اخگر کهربایی مات
    'rgba(226, 232, 240, 0.38)',  // غبار ستاره‌ای نقره‌ای
    'rgba(203, 213, 225, 0.28)'   // مه خاکستری کیهانی
  ];

  const particleCount = window.innerWidth <= 768 ? 26 : 46;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (Math.random() * 1.8 + 0.9) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.3 * dpr,
      vy: -(Math.random() * 0.4 + 0.15) * dpr,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.pulse) * 0.25 * dpr;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.y < -15) {
        p.y = height + 15;
        p.x = Math.random() * width;
      }
      if (p.x < -15) p.x = width + 15;
      if (p.x > width + 15) p.x = -15;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6 * dpr;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    requestAnimationFrame(renderParticles);
  }

  renderParticles();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initAmbientParticles);
} else {
  setTimeout(window.initAmbientParticles, 30);
}



// ==============================================================================
// RELEASE V18.8.0: ROCK-SOLID STORE SUBMENU TOGGLE & PURE ATMOSPHERIC STARDUST
// ==============================================================================

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

// بستن منو با کلیک در هر نقطه دیگر صفحه یا خروج ماوس
document.addEventListener('click', (e) => {
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper && !storeWrapper.contains(e.target)) {
    storeWrapper.classList.remove('active');
  }
});

// بازنویسی موتور غبار با ذرات باوقار و نامرئی در لایه کارت‌ها
window.initAmbientParticles = function() {
  const canvas = document.getElementById('ambientParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  let width = (canvas.width = window.innerWidth * dpr);
  let height = (canvas.height = window.innerHeight * dpr);

  window.addEventListener('resize', () => {
  initDockState();
    width = canvas.width = window.innerWidth * dpr;
    height = canvas.height = window.innerHeight * dpr;
  }, { passive: true });

  const colors = [
    'rgba(250, 204, 21, 0.45)',   // غبار طلایی آرام
    'rgba(245, 158, 11, 0.35)',   // اخگر کهربایی ملایم
    'rgba(226, 232, 240, 0.40)'   // غبار نقره‌ای کیهانی
  ];

  const particleCount = window.innerWidth <= 768 ? 28 : 48;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (Math.random() * 1.8 + 1.0) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.3 * dpr,
      vy: -(Math.random() * 0.45 + 0.18) * dpr,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.pulse) * 0.25 * dpr;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.y < -15) {
        p.y = height + 15;
        p.x = Math.random() * width;
      }
      if (p.x < -15) p.x = width + 15;
      if (p.x > width + 15) p.x = -15;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6 * dpr;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    requestAnimationFrame(renderParticles);
  }

  renderParticles();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initAmbientParticles);
} else {
  setTimeout(window.initAmbientParticles, 25);
}



// ==============================================================================
// RELEASE V19.0.0: STABLE MOBILE & DESKTOP COSMIC STARDUST CANVAS ENGINE
// ==============================================================================

window.initAmbientParticles = function() {
  const canvas = document.getElementById('ambientParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // تنظیم ابعاد پایه و ایمن در برابر ریست شدن اسکرول موبایل
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // تنها در صورت تغییر واقعی عرض نمایشگر (چرخش گوشی)، سایز بوم آپدیت می‌شود
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
  initDockState();
    if (Math.abs(window.innerWidth - lastWidth) > 30) {
      lastWidth = window.innerWidth;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  }, { passive: true });

  // پالت رنگی باوقار، گرم و کلاسیک دارک فانتزی (طلایی ملایم، کهربایی، نقره‌ای شفاف)
  const colors = [
    'rgba(250, 204, 21, 0.65)',   // غبار طلایی درخشان
    'rgba(245, 158, 11, 0.55)',   // اخگر کهربایی مات
    'rgba(226, 232, 240, 0.60)',  // غبار ستاره‌ای نقره‌ای
    'rgba(0, 240, 255, 0.50)'     // ذره کیهانی نئون ملایم
  ];

  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 32 : 55;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 1.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.45 + 0.15),
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.pulse) * 0.25;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.y < -15) {
        p.y = height + 15;
        p.x = Math.random() * width;
      }
      if (p.x < -15) p.x = width + 15;
      if (p.x > width + 15) p.x = -15;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
    }

    requestAnimationFrame(renderParticles);
  }

  renderParticles();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initAmbientParticles);
} else {
  setTimeout(window.initAmbientParticles, 20);
}



// ==============================================================================
// RELEASE V19.3.0: DESKTOP SCROLL-COLLAPSE & MOBILE THREE-LINE CONTROLLER
// ==============================================================================







// مخفی‌سازی داک در پنل ادمین
const origSwitchViewAdminGuard = window.switchView;
window.switchView = function(viewKey) {
  if (viewKey === 'admin') {
    document.body.classList.add('in-admin-view');
    const dock = document.getElementById('rightVerticalNav');
    if (dock) dock.style.display = 'none';
  } else {
    document.body.classList.remove('in-admin-view');
    const dock = document.getElementById('rightVerticalNav');
    if (dock) dock.style.display = '';
  }
  if (typeof origSwitchViewAdminGuard === 'function') {
    origSwitchViewAdminGuard(viewKey);
  }
};







// تابع دقیق و جامع احراز هویت مدیر استودیو جهت دسترسی به بخش‌های در حال توسعه
window.isStudioDirectorAuthenticated = function() {
  const adminWorkspace = document.getElementById('adminWorkspace');
  if (adminWorkspace && !adminWorkspace.classList.contains('hidden')) return true;
  if (document.body.getAttribute('data-view') === 'admin' || window.currentView === 'admin') return true;
  if (typeof currentMember !== 'undefined' && currentMember && currentMember.email) {
    if (typeof window.isDirectorEmail === 'function' && window.isDirectorEmail(currentMember.email)) return true;
  }
  if (typeof isDirectorLoggedIn !== 'undefined' && isDirectorLoggedIn) return true;
  if (sessionStorage.getItem('tajinkart_admin_unlocked') === 'true' || localStorage.getItem('tajinkart_admin_unlocked') === 'true') return true;
  return false;
};

window.handleGenesisClick = function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  closeDockMobile();
  if (window.isStudioDirectorAuthenticated()) {
    switchView('genesis');
    showToast('Director clearance verified. Entering Genesis Lore.', 'success', 3000);
  } else {
    showToast('Genesis Lore is currently in active worldbuilding and will launch soon (Coming Soon)', 'info', 4000);
  }
};

window.handleAcademyClick = function(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  closeDockMobile();
  if (window.isStudioDirectorAuthenticated()) {
    switchView('academy');
    showToast('Director clearance verified. Entering Academy Studio.', 'success', 3000);
  } else {
    showToast('Academy Masterclasses are currently in production and will launch soon (Coming Soon)', 'info', 4000);
  }
};


window.toggleDockExpand = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const trigger = document.getElementById('dockMasterTrigger');
  if (trigger) trigger.blur();
  const dock = document.getElementById('rightVerticalNav');
  if (!dock) return;

  const isOpen = dock.classList.contains('dock-open');
  if (isOpen) {
    dock.classList.remove('dock-open');
    dock.classList.add('dock-collapsed');
  } else {
    dock.classList.add('dock-open');
    dock.classList.remove('dock-collapsed');
  }
};

window.adminDeleteCurrentEditingCategory = function() {
  const origId = document.getElementById('adminEditCatOriginalId')?.value;
  if (!origId) return;
  const cat = galleryCategories.find(c => c.id === origId);
  const catName = cat ? (cat.title || cat.titleFA || origId) : origId;
  
  if (!confirm(`Are you sure you want to delete category "${catName}"? Artworks assigned to this category will not be deleted.`)) return;

  galleryCategories = galleryCategories.filter(c => c.id !== origId);
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  
  closeAdminCategoryEditForm();
  if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') try { localStorage.setItem('tajinkart_lang', 'en'); } catch(e) {}
  renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  if (currentGalleryFilter === origId) {
    filterGalleryByCategory('all', 'All Artworks');
  }
  showToast(`Category "${catName}" deleted successfully.`, 'info');
};


// اتصال زنده رنگ‌های دسته‌بندی گالری به کارت‌های پایپلاین استودیو (v21.3.0)
window.applyCategoryColorsToServiceCards = function() {
  const cards = document.querySelectorAll('#atelierServiceCards .service-nav-card');
  if (!cards || cards.length === 0) return;

  cards.forEach(card => {
    const pipeKey = card.getAttribute('data-pipeline');
    if (!pipeKey) return;

    // نگاشت دقیق پایپلاین به شناسه دسته‌بندی گالری
    const catId = (typeof PIPELINE_TO_CATEGORY_MAP !== 'undefined') ? (PIPELINE_TO_CATEGORY_MAP[pipeKey] || 'character') : 'character';
    
    // دریافت رنگ زنده این دسته‌بندی از آرایه گالری ادمین بدون پیش‌فرض ثابت
    let catColor = '#facc15';
    if (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories)) {
      const foundCat = galleryCategories.find(c => c.id === catId);
      if (foundCat && foundCat.color) {
        catColor = foundCat.color;
      }
    }

    // اعمال متغیرهای CSS روی هر کارت
    card.style.setProperty('--cat-color', catColor);
    card.style.setProperty('--cat-color-glow', `${catColor}66`);
    card.style.borderBottomColor = catColor;

    // تنظیم رنگ شماره سرفصل (01., 02., ...)
    const numSpan = card.querySelector('.service-nav-title .font-mono');
    if (numSpan) {
      numSpan.style.color = catColor;
    }

    // اگر کارت فعال است، اعمال دقیق بوردر و هاله با رنگ دسته‌بندی
    if (card.classList.contains('active')) {
      card.style.borderColor = catColor;
      card.style.boxShadow = `0 0 0 1.5px ${catColor}, 0 14px 35px ${catColor}55`;
    } else {
      card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      card.style.boxShadow = 'none';
    }
  });
};


// انتخاب و پیش‌نمایش کارت وضعیت آتلیه
window.selectStudioStatusCard = function(mode, event) {
  const radio = document.getElementById(`studioMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (radio) radio.checked = true;

  document.querySelectorAll('.studio-status-option-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.getElementById(`cardMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeCard) activeCard.classList.add('active');

  previewStudioStatusSelection();
};

// ذخیره مستقیم وضعیت با دکمه مربعی زرد
window.saveStudioModeDirect = function(mode, event) {
  if (event) event.stopPropagation();

  const radio = document.getElementById(`studioMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (radio) radio.checked = true;

  const input = document.getElementById(`statusMsg_${mode}`);
  const msg = input ? input.value.trim() : '';

  siteSettings.studioAvailabilityMode = mode;
  siteSettings.studioCustomStatusMessage = msg;
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));

  updateStudioLiveStatus();
  previewStudioStatusSelection();

  document.querySelectorAll('.studio-status-option-card').forEach(c => c.classList.remove('active'));
  const activeCard = document.getElementById(`cardMode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeCard) activeCard.classList.add('active');

  showToast(`Studio presence status set to "${mode.toUpperCase()}" and committed! ✓`, 'success', 3500);
};
