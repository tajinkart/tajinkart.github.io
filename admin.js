
// ذخیره و بازیابی کلیدهای ۱۲ شبکه اجتماعی (پینترست، اینستاگرام، دیسکورد، ایکس و...)
window.saveSocialOmnichannelSettingsDirect = function() {
  siteSettings.socials = siteSettings.socials || {};
  
  const fields = {
    artstation: 'setArtstationCreds',
    pinterest: 'setPinterestToken',
    reddit: 'setRedditCreds',
    meta: 'setMetaToken',
    twitter: 'setTwitterKey',
    bluesky: 'setBlueskyCreds',
    youtube: 'setYoutubeKey',
    discord: 'setDiscordWebhook'
  };

  for (const [key, id] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) siteSettings.socials[key] = el.value.trim();
  }

  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));

  if (window.supabaseClient) {
    window.supabaseClient.from('studio_settings').upsert([{
      key: 'social_settings',
      value: siteSettings.socials,
      updated_at: new Date().toISOString()
    }], { onConflict: 'key' }).then(() => {
      console.log('[Supabase Cloud] Omnichannel keys synced to cloud.');
    }).catch(e => console.warn('[Cloud Sync Warning]', e));
  }

  showToast('Omnichannel & Social keys saved to cloud successfully! ✓', 'success', 3500);
};


window.syncStudioSettingsToCloud = async function() {
  if (!window.supabaseClient) return;
  try {
    const s = (typeof siteSettings !== 'undefined' && siteSettings) ? siteSettings : {};
    await window.supabaseClient.from('studio_settings').upsert([{
      key: 'site_settings',
      value: s,
      updated_at: new Date().toISOString()
    }], { onConflict: 'key' });
    console.log('[Cloud Settings] Synchronized studio settings to Supabase cloud.');
  } catch(e) {
    console.warn('[Cloud Settings Save Error]', e);
  }
};


window.handleNewCategoryTitleInput = function(val) {
  const idInp = document.getElementById('adminNewCatId');
  if (idInp) {
    idInp.value = (val || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }
};

window.adminDeleteCategoryDirect = function(catId) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  galleryCategories = (galleryCategories || []).filter(c => c.id !== catId);
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category deleted.', 'info');
};


function generateSafeArtworkId() {
  const arts = (typeof showcaseArtworks !== 'undefined' && Array.isArray(showcaseArtworks)) ? showcaseArtworks : (window.showcaseArtworks || []);
  const existingIds = arts.map(a => Number(a.id)).filter(n => !isNaN(n) && n > 0 && n < 2000000000);
  return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 201;
}


// ==============================================================================
// موتور آپلود ابری تصاویر CLOUDINARY با تشخیص خودکار پریست و کلود نیم
// ==============================================================================
async function uploadFileToCloudinary(file) {
  const s = (typeof siteSettings !== 'undefined' && siteSettings) ? siteSettings : {};
  const currentCloud = s.cloudinaryCloudName || 'tajinkart';
  const currentPreset = s.cloudinaryPreset || 'tajinkart';

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
          s.cloudinaryCloudName = item.cloud;
          s.cloudinaryPreset = item.preset;
          if (typeof safeSetStorage === 'function') {
            safeSetStorage(KEYS.SETTINGS, JSON.stringify(s));
          }
          console.log('[Cloudinary Success]:', data.secure_url);
          return data.secure_url;
        }
      }
    } catch (err) {
      console.warn('[Cloudinary Network Note]:', err);
    }
  }

  return null;
}

// فشرده‌سازی هوشمند تصاویر محلی جهت تضمین عدم پر شدن حافظه مرورگر
function compressImageForStorage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
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
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

// ==============================================================================
// پلتفرم‌های انتشار اثر در استودیو
// ==============================================================================
const AVAILABLE_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'Custom caption for Telegram channel...' },
  { id: 'artstation', name: 'ArtStation', icon: '🎨', placeholder: 'Technical breakdown for ArtStation...' },
  { id: 'cara', name: 'Cara', icon: '🛡️', placeholder: 'Anti-AI portfolio post for Cara...' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', placeholder: 'Pin description and metadata...' },
  { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'Instagram caption, lore & hashtags...' },
  { id: 'reels', name: 'Reels', icon: '🎬', placeholder: 'Hook & audio caption for Reels video...' },
  { id: 'threads', name: 'Threads', icon: '🧵', placeholder: 'Narrative post for Threads...' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', placeholder: 'Title and sub-reddit body...' },
  { id: 'x', name: 'X / Twitter', icon: '🐦', placeholder: 'Short tweet (<280 chars) and hashtags...' },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋', placeholder: 'Post copy for Bluesky...' },
  { id: 'shorts', name: 'YouTube Shorts', icon: '📹', placeholder: 'Title and description for Shorts...' },
  { id: 'discord', name: 'Discord', icon: '🎮', placeholder: 'Showcase announcement for Discord...' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'Professional entertainment design copy...' }
];
window.AVAILABLE_PLATFORMS = AVAILABLE_PLATFORMS;

// ==============================================================================
// TAJINKART STUDIO — ADMIN MANAGEMENT MODULE (admin.js)
// Showcase Curation, Genres & Categories, Pipelines, Products, Members, Settings
// ==============================================================================

window.adminToggleAddGenreForm = function() {
  const row = document.getElementById('adminInlineAddGenreRow');
  if (!row) return;
  const isHidden = (row.style.display === 'none' || getComputedStyle(row).display === 'none');
  row.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) {
    const input = document.getElementById('adminNewGenreTitle');
    if (input) setTimeout(() => input.focus(), 80);
  }
};

window.adminSubmitNewGenreInline = function() {
  const input = document.getElementById('adminNewGenreTitle');
  const val = input ? input.value.trim() : '';
  if (!val) {
    showToast('Please enter a genre name.', 'warning');
    return;
  }
  if (!Array.isArray(studioGenres)) studioGenres = [...DEFAULT_STUDIO_GENRES];
  if (studioGenres.some(g => g.toLowerCase() === val.toLowerCase())) {
    showToast('This genre already exists in studio directory.', 'info');
    return;
  }
  studioGenres.push(val);
  try {
    localStorage.setItem('tajinkart_studio_genres_v1', JSON.stringify(studioGenres));
  } catch(e) {}
  if (input) input.value = '';
  window.adminToggleAddGenreForm();
  window.renderAdminStudioGenres();
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  showToast(`Genre '${val}' added successfully!`, 'success');
};

window.adminDeleteStudioGenre = function(genreName) {
  if (!Array.isArray(studioGenres) || studioGenres.length <= 1) {
    showToast('At least one studio genre must remain active.', 'warning');
    return;
  }
  studioGenres = studioGenres.filter(g => g !== genreName);
  try {
    localStorage.setItem('tajinkart_studio_genres_v1', JSON.stringify(studioGenres));
  } catch(e) {}
  window.renderAdminStudioGenres();
  if (typeof renderFloatingGenreDropdown === 'function') renderFloatingGenreDropdown();
  showToast(`Genre '${genreName}' removed.`, 'info');
};

window.renderAdminStudioGenres = function() {
  const container = document.getElementById('adminStudioGenresList');
  if (!container) return;
  const genres = (typeof studioGenres !== 'undefined' && Array.isArray(studioGenres) && studioGenres.length > 0) ? studioGenres : DEFAULT_STUDIO_GENRES;
  const badge = document.getElementById('adminGenreCountBadge');
  if (badge) badge.textContent = `${genres.length} Active Genres`;

  container.innerHTML = genres.map(g => `
    <div style="display:inline-flex; align-items:center; gap:8px; background:#080c14; border:1px solid rgba(0,240,255,0.4); border-radius:20px; padding:6px 14px; box-shadow:0 0 10px rgba(0,240,255,0.15); font-size:12px; color:#fff;">
      <span style="color:var(--cyan-electric); font-size:11px;">🌌</span>
      <span style="font-weight:700;">${g}</span>
      <button type="button" onclick="adminDeleteStudioGenre('${g}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:12px; padding:0 2px; margin-left:4px; line-height:1;" title="Delete this genre" onmouseover="this.style.color='var(--crimson)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
    </div>
  `).join('');
};

window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;
  const cats = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories) && galleryCategories.length > 0) ? galleryCategories : (typeof SIX_PIPELINE_CATEGORIES !== 'undefined' ? SIX_PIPELINE_CATEGORIES : (typeof DEFAULT_GALLERY_CATEGORIES !== 'undefined' ? DEFAULT_GALLERY_CATEGORIES : []));
  const badge = document.getElementById('adminCategoryCountBadge');
  if (badge) badge.textContent = `${cats.length} Active Categories`;

  container.innerHTML = cats.map(cat => {
    const color = cat.color || '#38bdf8';
    return `
      <div class="admin-cat-pill" onclick="openAdminCategoryEdit('${cat.id}')" style="display:inline-flex; align-items:center; gap:8px; background:#080c14; border:1px solid ${color}88; border-radius:20px; padding:6px 14px; box-shadow:0 0 10px ${color}20; cursor:pointer; font-size:12px; color:#fff;" title="Edit Category">
        <span style="width:8px; height:8px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color};"></span>
        <span style="font-weight:700;">${cat.titleEN || cat.title || cat.id}</span>
        <span style="font-size:11px; opacity:0.7;">✏️</span>
        <span onclick="event.stopPropagation(); adminDeleteCategoryDirect('${cat.id}')" style="font-size:12px; color:#ef4444; opacity:0.7; padding:2px 4px; border-radius:4px;" title="Delete Category" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">✕</span>
      </div>
    `;
  }).join('');
};

window.adminToggleAddCategoryForm = function() {
  const row = document.getElementById('adminInlineAddCategoryRow');
  if (!row) return;
  const isHidden = (row.style.display === 'none' || getComputedStyle(row).display === 'none');
  row.style.display = isHidden ? 'flex' : 'none';
};

window.adminSubmitNewCategoryInline = function() {
  const titleInp = document.getElementById('adminNewCatTitle');
  const idInp = document.getElementById('adminNewCatId');
  const colorInp = document.getElementById('adminNewCatColor');

  const title = titleInp ? titleInp.value.trim() : '';
  const id = idInp ? idInp.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  const color = colorInp ? colorInp.value : '#38bdf8';

  if (!title || !id) {
    showToast('Please enter both title and slug ID.', 'warning');
    return;
  }
  if (!Array.isArray(galleryCategories)) galleryCategories = [];
  galleryCategories.push({ id, title, titleEN: title, titleFA: title, color });
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  if (titleInp) titleInp.value = '';
  if (idInp) idInp.value = '';
  window.adminToggleAddCategoryForm();
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category created successfully!', 'success');
};

window.openAdminCategoryEdit = function(catId) {
  const cats = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories) && galleryCategories.length > 0) ? galleryCategories : (window.galleryCategories || window.SIX_PIPELINE_CATEGORIES || []);
  const cat = cats.find(c => c.id === catId);
  if (!cat) return;
  const row = document.getElementById('adminInlineEditCategoryRow');
  if (!row) return;
  const origIdEl = document.getElementById('adminEditCatOriginalId');
  if (origIdEl) origIdEl.value = cat.id;
  const titleFAEl = document.getElementById('adminEditCatTitleFA');
  if (titleFAEl) titleFAEl.value = cat.titleFA || cat.title || '';
  const titleENEl = document.getElementById('adminEditCatTitleEN');
  if (titleENEl) titleENEl.value = cat.titleEN || cat.title || '';
  const idEl = document.getElementById('adminEditCatId');
  if (idEl) idEl.value = cat.id;
  const colorEl = document.getElementById('adminEditCatColor');
  if (colorEl) colorEl.value = cat.color || '#38bdf8';
  const pickerEl = document.getElementById('adminEditCatColorPicker');
  if (pickerEl) pickerEl.value = cat.color || '#38bdf8';
  row.style.display = 'block';
};

window.closeAdminCategoryEditForm = function() {
  const row = document.getElementById('adminInlineEditCategoryRow');
  if (row) row.style.display = 'none';
};

window.saveAdminCategoryEdit = function() {
  const origId = document.getElementById('adminEditCatOriginalId')?.value;
  if (!Array.isArray(galleryCategories)) galleryCategories = (window.galleryCategories || window.SIX_PIPELINE_CATEGORIES || []).slice();
  const cat = galleryCategories.find(c => c.id === origId);
  if (!cat) return;
  const titleFAEl = document.getElementById('adminEditCatTitleFA');
  if (titleFAEl) cat.titleFA = titleFAEl.value.trim() || cat.title;
  const titleENEl = document.getElementById('adminEditCatTitleEN');
  if (titleENEl) cat.titleEN = titleENEl.value.trim() || cat.title;
  cat.title = cat.titleEN || cat.titleFA || cat.title;
  const colorEl = document.getElementById('adminEditCatColor');
  if (colorEl && colorEl.value) cat.color = colorEl.value;
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  window.closeAdminCategoryEditForm();
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category updated successfully!', 'success');
};

window.adminDeleteCurrentEditingCategory = function() {
  const origId = document.getElementById('adminEditCatOriginalId')?.value;
  if (!origId) return;
  galleryCategories = (galleryCategories || []).filter(c => c.id !== origId);
  window.galleryCategories = galleryCategories;
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  window.closeAdminCategoryEditForm();
  window.renderAdminGalleryCategories();
  if (typeof renderFloatingCategoryDropdown === 'function') renderFloatingCategoryDropdown();
  if (typeof applyCategoryColorsToServiceCards === 'function') applyCategoryColorsToServiceCards();
  showToast('Category deleted.', 'info');
};

window.filterAdminMembers = function(val) {
  renderAdminSketch3(val);
};

window.logoutAdmin = async function() {
  const adminWorkspace = document.getElementById('adminWorkspace');
  if (adminWorkspace) adminWorkspace.classList.add('hidden');
  const adminGate = document.getElementById('adminLoginGate');
  if (adminGate) adminGate.classList.remove('hidden');

  try {
    if (window.supabaseClient && window.supabaseClient.auth) {
      await window.supabaseClient.auth.signOut();
    }
  } catch(e) {}

  window.currentMember = null;
  try {
    sessionStorage.removeItem('tajinkart_admin_unlocked');
    localStorage.removeItem('tajinkart_admin_unlocked');
    localStorage.removeItem('tajinkart_member_session');
  } catch(e) {}

  if (typeof switchView === 'function') switchView('showcase');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Studio Command Console locked and signed out. ✓', 'info', 3000);
};

setTimeout(() => {
  if (typeof renderAdminStudioGenres === 'function') renderAdminStudioGenres();
  if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories();
}, 60);


window.openCreateArtworkModal = function() {
  isCreatingNewArt = true;
  currentSelectedArtIdx = -1;
  stagingNewArt = {
    id: generateSafeArtworkId(),
    tag: 'character',
    shortSlug: '',
    title: '',
    desc: '',
    pipelineKey: 'sketch1',
    image: '',
    colorSpace: 'Master 4K / 16-Bit ProPhoto RGB',
    phases: [
      {
        name: 'Primary Cover & Master Sheet',
        img: '',
        image: '',
        pipelineKey: 'sketch1',
        subcategory: 'Standard Concept Execution',
        desc: '',
        socials: {},
        socialCaptions: {},
        tgIncludeButton: false
      }
    ]
  };

  const titleEl = document.getElementById('adminArtEditorModalTitle');
  if (titleEl) titleEl.textContent = '✨ Add New Artwork to Showcase';

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
  if (titleEl) titleEl.textContent = `Edit Artwork: ${art.shortSlug || art.title}`;

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
    <!-- Column 1: Vertical scrollable platform menu -->
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
            <input type="checkbox" onclick="event.stopPropagation()" onchange="togglePhaseSocialPlatform(${idx}, '${plat.id}', this.checked)" ${isChecked ? 'checked' : ''} style="accent-color:var(--gold); cursor:pointer; width:15px; height:15px;" title="Enable/disable dispatch to ${plat.name}" />
          </div>
        `;
      }).join('')}
    </div>

    <!-- Column 2: Channel settings and custom copy -->
    <div style="background:#04060c; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; flex-wrap:wrap; gap:6px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="font-size:18px;">${activePlat.icon}</span>
          <span style="font-size:12.5px; font-weight:800; color:var(--gold);">Custom Caption & Settings for ${activePlat.name}</span>
        </div>
        <div>
          ${isCurrentPlatChecked ? `
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:800; color:var(--gold); background:rgba(250,204,21,0.12); padding:3px 10px; border-radius:6px; border:1px solid rgba(250,204,21,0.3);">
              <span style="font-size:8px;">●</span> Enabled for Dispatch
            </span>
          ` : `
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text-muted); background:rgba(255,255,255,0.04); padding:3px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:8px;">○</span> Disabled (Toggle in list)
            </span>
          `}
        </div>
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Custom caption / copy for ${activePlat.name}:</label>
        <textarea rows="3" placeholder="${activePlat.placeholder}" oninput="setPhaseSocialCaption(${idx}, '${activePlat.id}', this.value)" style="font-size:11.5px; padding:8px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a14; width:100%; box-sizing:border-box;">${(p.socialCaptions && p.socialCaptions[activePlat.id]) || ''}</textarea>
      </div>

      <!-- Telegram-specific dispatch options -->
      ${activePlat.id === 'telegram' ? `
        <div style="background:rgba(0,240,255,0.04); border:1px dashed rgba(0,240,255,0.25); border-radius:8px; padding:10px 12px; margin-top:2px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:11.5px; color:var(--cyan-electric); font-weight:700;">
            <input type="checkbox" onchange="setPhaseTelegramButton(${idx}, this.checked)" ${p.tgIncludeButton ? 'checked' : ''} style="accent-color:var(--cyan-electric); cursor:pointer; width:16px; height:16px;" />
            <span>Include direct interactive button linking to this artwork</span>
          </label>
          <p style="font-size:10px; color:var(--text-muted); margin:4px 0 0 24px;">If disabled, Telegram message sends without interactive buttons below.</p>
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
    badgeEl.textContent = activeSocials.length > 0 ? `${activeSocials.length} Active Channels (${activeSocials.join(', ')})` : 'Auto-Dispatch: Off';
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
      name: art.title || 'Primary Cover Image',
      img: art.image,
      image: art.image,
      pipelineKey: art.pipelineKey || 'sketch1',
      subcategory: 'Standard Concept Execution',
      desc: '',
      socials: {},
      socialCaptions: {},
      tgIncludeButton: false
    });
  } else {
    stagingProjectPhases.push({
      name: 'Primary Cover & Master Sheet',
      img: '',
      image: '',
      pipelineKey: 'sketch1',
      subcategory: 'Standard Concept Execution',
      desc: '',
      socials: {},
      socialCaptions: {},
      tgIncludeButton: false
    });
  }

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      
      <!-- Step 1: Title and narrative lore -->
      <div style="background:#04060a; border:1px solid rgba(250,204,21,0.35); border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px;">
        <div style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <span style="font-size:13.5px; font-weight:900; color:var(--gold);">📌 Step 1: Title & Narrative Lore</span>
        </div>

        <!-- ردیف اول: عنوان کامل اثر در کنار ژانر اصلی یونیورس (حذف اسلاگ دستی) -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:start;">
          <div>
            <label style="font-size:11.5px; color:var(--gold); font-weight:800; display:block; margin-bottom:4px;">📌 Full Artwork Title</label>
            <input type="text" id="editArtTitleInput" value="${art.title || ''}" placeholder="e.g. The Obsidian Vanguard" style="font-size:12.5px; font-weight:700;" />
          </div>
          <div>
            <label style="font-size:11.5px; color:var(--cyan-electric); font-weight:800; display:block; margin-bottom:4px;">🌌 Primary Universe Genre</label>
            <select id="editArtGenreSelect" style="width:100%; padding:9px 12px; background:#080c14; border:1px solid rgba(0,240,255,0.45); border-radius:8px; color:var(--cyan-electric); font-weight:800; font-size:12px; outline:none; height:41px;">
              ${(function() {
                const currentGenres = (typeof studioGenres !== 'undefined' && Array.isArray(studioGenres) && studioGenres.length > 0)
                  ? studioGenres
                  : ((window.studioGenres && Array.isArray(window.studioGenres) && window.studioGenres.length > 0)
                      ? window.studioGenres
                      : (typeof DEFAULT_STUDIO_GENRES !== 'undefined' ? DEFAULT_STUDIO_GENRES : ['Dark Fantasy', 'Cyberpunk', 'Sci-Fi', 'Mythic & Ancient', 'Post-Apocalyptic', 'Horror & Eldritch', 'High Fantasy', 'Steampunk', 'Mecha & Industrial', 'Anime & Stylized', 'Historical & Military']));
                const artGenre = art.genre || 'Dark Fantasy';
                return currentGenres.map(g => `<option value="${g}" ${g === artGenre ? 'selected' : ''}>${g}</option>`).join('');
              })()}
            </select>
          </div>
        </div>

        <!-- ساب‌ژانرها و تگ‌های کراس‌اور تکمیلی با تیک چندگانه -->
        <div style="background:rgba(0,240,255,0.03); border:1px solid rgba(0,240,255,0.22); border-radius:10px; padding:12px 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <label style="font-size:11px; color:var(--cyan-electric); font-weight:800; display:flex; align-items:center; gap:6px;">
              <span>⚡ Optional Sub-Genres & Crossover Tags:</span>
            </label>
            <span style="font-size:10px; color:var(--text-muted);">Check all that apply for cross-filter discovery</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${(function() {
              const currentGenres = (typeof studioGenres !== 'undefined' && Array.isArray(studioGenres) && studioGenres.length > 0)
                ? studioGenres
                : ((window.studioGenres && Array.isArray(window.studioGenres) && window.studioGenres.length > 0)
                    ? window.studioGenres
                    : (typeof DEFAULT_STUDIO_GENRES !== 'undefined' ? DEFAULT_STUDIO_GENRES : []));
              const artSubs = (art.subgenres && Array.isArray(art.subgenres)) ? art.subgenres : [];
              return currentGenres.map(g => {
                const isChecked = artSubs.includes(g);
                return `
                  <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; background:${isChecked ? 'rgba(0,240,255,0.14)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${isChecked ? 'var(--cyan-electric)' : 'rgba(255,255,255,0.12)'}; padding:4px 10px; border-radius:6px; font-size:11px; color:${isChecked ? '#fff' : 'var(--text-muted)'}; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--cyan-electric)'" onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='rgba(255,255,255,0.12)'">
                    <input type="checkbox" name="editArtSubgenres" value="${g}" ${isChecked ? 'checked' : ''} style="width:13px; height:13px; accent-color:var(--cyan-electric); cursor:pointer;" onchange="this.parentElement.style.background=this.checked?'rgba(0,240,255,0.14)':'rgba(255,255,255,0.04)'; this.parentElement.style.borderColor=this.checked?'var(--cyan-electric)':'rgba(255,255,255,0.12)'; this.parentElement.style.color=this.checked?'#fff':'var(--text-muted)';" />
                    <span style="font-weight:700;">${g}</span>
                  </label>
                `;
              }).join('');
            })()}
          </div>
        </div>

        <div>
          <label style="font-size:11.5px; color:var(--gold); font-weight:800; display:block; margin-bottom:4px;">📖 Narrative Lore & Artist Notes:</label>
          <textarea id="editArtDescInput" rows="3" placeholder="Backstory lore, character archetype, visual development notes...">${art.desc || ''}</textarea>
        </div>
      </div>

      <!-- Step 2: Project sheets and artwork imagery -->
      <div style="background:#05070d; border:1px solid rgba(0,240,255,0.35); border-radius:14px; padding:18px;">
        <div style="margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <span style="font-size:13.5px; font-weight:900; color:var(--cyan-electric);">📑 Step 2: Case Study Sheets & Imagery:</span>
          <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Upload the cover and project sheets. Click the button below to add additional sheets.</p>
        </div>

        <div id="adminProjectPhasesList" style="display:flex; flex-direction:column; gap:14px;">
          ${renderStagingPhasesHtml()}
        </div>

        <!-- Add sheet button -->
        <div style="margin-top:14px;">
          <button type="button" onclick="addStagingPhase()" class="btn-secondary" style="width:100%; padding:12px 16px; font-size:12.5px; font-weight:800; border:1px dashed var(--cyan-electric); color:var(--cyan-electric); background:rgba(0,240,255,0.04); display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; border-radius:10px;">
            <span style="font-size:16px;">➕</span>
            <span>Add Supplemental Production Sheet</span>
          </button>
        </div>
      </div>

      <!-- Full production package order settings -->
      <div style="background:rgba(250,204,21,0.06); border:1px solid rgba(250,204,21,0.28); border-radius:12px; padding:12px 14px;">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:var(--gold); font-weight:700;">
          <input type="checkbox" id="editArtIsPackCheckbox" ${(art.isProductionPack !== false) ? 'checked' : ''} style="width:17px; height:17px; accent-color:var(--gold); cursor:pointer;" />
          Enable 'Order Full Production Case Study' prompt at bottom of artwork
        </label>
      </div>

      <!-- Action buttons -->
      <div style="margin-top:4px; display:flex; flex-direction:column; gap:8px;">
        ${isNew ? `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px; font-weight:800; cursor:pointer;">
            ✓ Confirm & Add to Showcase Gallery
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px; cursor:pointer;">
            Cancel
          </button>
        ` : `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px; font-weight:800; cursor:pointer;">
            ✓ Save Project Changes
          </button>
          <button type="button" onclick="adminDeleteArtwork(${currentSelectedArtIdx})" class="btn-secondary" style="color:var(--crimson); width:100%; padding:10px; border-color:rgba(239,68,68,0.3); cursor:pointer;">
            Delete this Artwork from Gallery
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px; cursor:pointer;">
            Close Without Saving
          </button>
        `}
      </div>

    </div>
  `;
}

function renderStagingPhasesHtml() {
  if (!stagingProjectPhases || stagingProjectPhases.length === 0) {
    return `<div style="font-size:12px; color:var(--text-muted); padding:20px; text-align:center; background:#04060a; border-radius:10px; border:1px dashed rgba(255,255,255,0.15);">
      No sheets added. Click '+ Add Supplemental Production Sheet' below.
    </div>`;
  }

  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};

  return stagingProjectPhases.map((p, idx) => {
    const pipeKey = p.pipelineKey || 'sketch1';
    const subcats = (pipelines[pipeKey] && pipelines[pipeKey].subcategories) ? pipelines[pipeKey].subcategories : ['Standard Concept Execution'];
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
        
        <!-- Image preview or upload dropzone -->
        ${hasImage ? `
          <div style="background:rgba(0,0,0,0.65); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.18)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'}; border:1px solid ${isCover ? 'rgba(250,204,21,0.35)' : 'rgba(0,240,255,0.3)'};">
                ${isCover ? '🖼️ Primary Cover & Featured Shot (Sheet 1)' : `Supplemental Sheet #${idx + 1}`}
              </span>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" onclick="document.getElementById('phaseFileInput_${idx}').click()" class="btn-secondary" style="font-size:11px; padding:4px 12px; border-color:rgba(255,255,255,0.25); cursor:pointer;">
                  🔄 Change Image
                </button>
                ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:3px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="Delete Sheet">✕</button>` : ''}
              </div>
              <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />
            </div>

            <!-- Artwork aspect ratio display container -->
            <div style="position:relative; width:100%; max-height:280px; min-height:160px; background:#020306; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;">
              <img src="${imgSrc}" style="max-width:100%; max-height:268px; width:auto; height:auto; object-fit:contain; display:block; border-radius:8px;" alt="Artwork preview" />
            </div>

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">Sheet Title:</label>
              <input type="text" value="${p.name || ''}" placeholder="Sheet title (e.g. Orthographic Turnaround / Master Render)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px; background:rgba(250,204,21,0.03); border:1.5px dashed ${isCover ? 'rgba(250,204,21,0.6)' : 'rgba(0,240,255,0.5)'}; border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.15)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'};">
                ${isCover ? '🖼️ Primary Cover & Featured Shot (Sheet 1)' : `Sheet #${idx + 1}`}
              </span>
              ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:2px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="Delete Sheet">✕</button>` : ''}
            </div>

            <div onclick="document.getElementById('phaseFileInput_${idx}').click()" style="cursor:pointer; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:26px 16px; text-align:center; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)'">
              <div style="font-size:32px; margin-bottom:6px;">📁</div>
              <div style="font-size:13px; font-weight:800; color:var(--gold);">Click to select and upload ${isCover ? 'primary cover image' : 'sheet image'} from device</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Supports JPG, PNG, WEBP with original aspect ratio preserved</div>
            </div>
            <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">Sheet Title:</label>
              <input type="text" value="${p.name || ''}" placeholder="Sheet title (e.g. Master Render / Final Concept)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        `}

        <!-- Sheet Production Metadata: Pipeline, Subcategory, Rendering Stage, Complexity -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
          <div>
            <label style="font-size:11px; color:var(--gold); font-weight:800; display:block; margin-bottom:3px;">📂 Sheet Category & Pipeline:</label>
            <select onchange="handlePhaseUnifiedCategoryChange(${idx}, this.value)" style="font-size:11.5px; font-weight:700; padding:7px 10px; margin:0; width:100%; background:#080c14; border:1px solid rgba(250,204,21,0.35); border-radius:8px; color:#fff; outline:none;">
              ${(function() {
                const availableCats = (typeof galleryCategories !== 'undefined' && Array.isArray(galleryCategories) && galleryCategories.length > 0)
                  ? galleryCategories
                  : (typeof SIX_PIPELINE_CATEGORIES !== 'undefined' ? SIX_PIPELINE_CATEGORIES : []);
                if (availableCats && availableCats.length > 0) {
                  return availableCats.map(c => {
                    const val = c.pipeKey || c.id;
                    const isSelected = (pipeKey === val || p.category === c.id || pipeKey === c.id);
                    return `<option value="${val}" ${isSelected ? 'selected' : ''} style="color:${c.color || '#facc15'};">● ${c.title || c.titleEN || c.id}</option>`;
                  }).join('');
                }
                return `
                  <option value="sketch1" ${(pipeKey === 'sketch1' || p.category === 'character') ? 'selected' : ''}>🟡 Character Design & Heroes</option>
                  <option value="sketch_creature" ${(pipeKey === 'sketch_creature' || p.category === 'creature') ? 'selected' : ''}>🟢 Creatures, Titans & Monsters</option>
                  <option value="sketch2" ${(pipeKey === 'sketch2' || p.category === 'environment') ? 'selected' : ''}>🔵 Environment, Worlds & Architecture</option>
                  <option value="sketch3" ${(pipeKey === 'sketch3' || p.category === 'keyframe') ? 'selected' : ''}>🔴 Cinematic Keyframes & Covers</option>
                  <option value="sketch4" ${(pipeKey === 'sketch4' || p.category === 'props') ? 'selected' : ''}>🟣 Props, Weapons & Artifacts</option>
                  <option value="sketch5" ${(pipeKey === 'sketch5' || p.category === 'comic') ? 'selected' : ''}>🟠 Comics, Manga & Sequential Art</option>
                `;
              })()}
            </select>
          </div>

          <div>
            <label style="font-size:10.5px; color:var(--cyan-electric); font-weight:700; display:block; margin-bottom:2px;">📐 Specialized Subcategory:</label>
            <select onchange="stagingProjectPhases[${idx}].subcategory = this.value" style="font-size:11px; padding:7px 10px; margin:0; width:100%; background:#090d16; border:1px solid var(--border-subtle); border-radius:8px; color:#fff;">
              ${subcats.map(s => `<option value="${s}" ${currentSub === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="font-size:10.5px; color:#f43f5e; font-weight:800; display:block; margin-bottom:2px;">🎨 مرحله پرداخت (Rendering Stage):</label>
            <select onchange="stagingProjectPhases[${idx}].stage = this.value" style="font-size:11px; font-weight:700; padding:7px 10px; margin:0; width:100%; background:#090d16; border:1px solid rgba(244,63,94,0.35); border-radius:8px; color:#fff;">
              <option value="sketch" ${p.stage === 'sketch' ? 'selected' : ''}>✏️ اسکچ و اتود اولیه (Sketch)</option>
              <option value="lineart_value" ${p.stage === 'lineart_value' ? 'selected' : ''}>✒️ لاین‌آرت و سایه‌زنی ولیو (Line-art & Values)</option>
              <option value="render" ${(p.stage === 'render' || (!p.stage && isCover)) ? 'selected' : ''}>👑 رندر نهایی و کامل (Master Render)</option>
            </select>
          </div>

          <div>
            <label style="font-size:10.5px; color:#a855f7; font-weight:800; display:block; margin-bottom:2px;">⚡ درجه پیچیدگی (Complexity):</label>
            <select onchange="stagingProjectPhases[${idx}].complexity = this.value" style="font-size:11px; font-weight:700; padding:7px 10px; margin:0; width:100%; background:#090d16; border:1px solid rgba(168,85,247,0.35); border-radius:8px; color:#fff;">
              <option value="minimal" ${p.complexity === 'minimal' ? 'selected' : ''}>🟢 ساده / مینیمال (Minimal / Clean)</option>
              <option value="moderate" ${(p.complexity === 'moderate' || !p.complexity) ? 'selected' : ''}>🟡 متوسط / استاندارد (Moderate / Detailed)</option>
              <option value="complex" ${p.complexity === 'complex' ? 'selected' : ''}>🔴 پیچیده / جزئیات سنگین (Complex / High-Fidelity)</option>
            </select>
          </div>
        </div>

        <textarea rows="2" placeholder="Technical description, industrial application, and milestone notes..." onchange="stagingProjectPhases[${idx}].desc = this.value.trim()" style="font-size:11px; padding:6px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a12;">${p.desc || p.description || ''}</textarea>

        <!-- Omnichannel social dispatches drawer -->
        <details id="phaseSocialDetails_${idx}" ontoggle="stagingProjectPhases[${idx}].isSocialOpen = this.open" ${p.isSocialOpen ? 'open' : ''} style="background:#070a14; border:1px solid rgba(250,204,21,0.25); border-radius:12px; padding:10px 14px; margin-top:2px;">
          <summary style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; user-select:none; outline:none;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11.5px; color:var(--gold); font-weight:800;">📡 Omnichannel Social Dispatch:</span>
              <span id="phaseSocialBadge_${idx}" class="font-mono" style="font-size:9.5px; color:${activeSocials.length > 0 ? 'var(--gold)' : 'var(--text-muted)'}; background:${activeSocials.length > 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)'}; padding:2px 8px; border-radius:4px;">
                ${activeSocials.length > 0 ? `${activeSocials.length} Active Channels (${activeSocials.join(', ')})` : 'Auto-Dispatch: Off'}
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
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const defSub = (pipelines[defPipe] && pipelines[defPipe].subcategories) ? pipelines[defPipe].subcategories[0] : 'Standard Concept Execution';

  stagingProjectPhases.push({
    name: `Supplemental Sheet #${nextNum}`,
    img: '',
    image: '',
    pipelineKey: defPipe,
    subcategory: defSub,
    desc: '',
    socials: {},
    socialCaptions: {},
    tgIncludeButton: false
  });
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhaseUnifiedCategoryChange = function(idx, newPipeOrCat) {
  if (!stagingProjectPhases || !stagingProjectPhases[idx]) return;

  const pipeToCat = {
    'sketch1': 'character',
    'sketch_creature': 'creature',
    'sketch2': 'environment',
    'sketch3': 'keyframe',
    'sketch4': 'props',
    'sketch_mascot': 'mascot',
    'sketch5': 'comic'
  };
  const catToPipe = {
    'character': 'sketch1',
    'creature': 'sketch_creature',
    'environment': 'sketch2',
    'keyframe': 'sketch3',
    'props': 'sketch4',
    'mascot': 'sketch_mascot',
    'comic': 'sketch5'
  };

  let resolvedPipe = newPipeOrCat;
  let resolvedCat = newPipeOrCat;

  if (pipeToCat[newPipeOrCat]) {
    resolvedPipe = newPipeOrCat;
    resolvedCat = pipeToCat[newPipeOrCat];
  } else if (catToPipe[newPipeOrCat]) {
    resolvedPipe = catToPipe[newPipeOrCat];
    resolvedCat = newPipeOrCat;
  }

  stagingProjectPhases[idx].pipelineKey = resolvedPipe;
  stagingProjectPhases[idx].category = resolvedCat;

  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const subcats = (pipelines[resolvedPipe] && pipelines[resolvedPipe].subcategories) ? pipelines[resolvedPipe].subcategories : ['Standard Concept Execution'];
  stagingProjectPhases[idx].subcategory = subcats[0] || '';

  if (idx === 0) {
    if (typeof stagingNewArt === 'object' && stagingNewArt) {
      stagingNewArt.pipelineKey = resolvedPipe;
      stagingNewArt.category = resolvedCat;
      stagingNewArt.tag = resolvedCat;
    }
  }
};


