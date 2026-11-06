/**
 * TAJINKART Master Spec Cloud Engine
 * استودیو کانسپت آرت و توسعه بصری — سید سروش تاج
 */

// ۱. شناسایی فوری لینک بازیابی رمز قبل از پاکسازی توکن‌ها توسط کلاینت‌ها
let isRecoveryFlowDetected = false;
try {
  const _href = window.location.href || '';
  const _h = window.location.hash || '';
  const _s = window.location.search || '';
  if (_href.includes('recovery') || _h.includes('recovery') || _s.includes('recovery') || _s.includes('reset') || _href.includes('reset-password') || (_h.includes('access_token=') && !_h.includes('provider=google'))) {
    isRecoveryFlowDetected = true;
    sessionStorage.setItem('tajinkart_recovering_password', 'true');
    console.log('[Early Recovery Flag] Detected password reset link in URL!');
  }
} catch(e) {}


// =========================================================
// کلاینت دیتابیس ابری SUPABASE (اتصال زنده کامپیوتر و گوشی)
// =========================================================
const SUPABASE_PROJECT_URL = 'https://ahuasiouokvtryzxohri.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dyUVO6elCOkL_a3Mukm0Ww_4XZNLohX';

if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  window.supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  });

  // شنونده فوری سشن‌ها بدون فوت وقت جهت گرفتن رویداد بازیابی رمز
  window.supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase Immediate Auth Event]', event);
    if (event === 'PASSWORD_RECOVERY') {
      isRecoveryFlowDetected = true;
      sessionStorage.setItem('tajinkart_recovering_password', 'true');
      triggerPasswordResetModal();
    } else if (session && session.user && !isRecoveryFlowDetected && sessionStorage.getItem('tajinkart_recovering_password') !== 'true') {
      applyLoggedInMember(session.user);
    }
  });
}

// =========================================================
// سیستم یکپارچه احراز هویت ابری SUPABASE AUTH
// =========================================================
function applyLoggedInMember(user) {
  if (!user) return;
  const meta = user.user_metadata || {};
  const name = meta.name || user.email.split('@')[0];
  const phone = meta.phone || '';
  currentMember = {
    id: user.id,
    name: name,
    email: user.email,
    contact: phone || user.email,
    tier: meta.tier || 'STANDARD',
    assetsBought: meta.assetsBought || []
  };
  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) labelEl.textContent = currentMember.name;
}



// تابع باز کردن قطعی و نفوذناپذیر پنجره تنظیم رمز جدید
function triggerPasswordResetModal() {
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
    showToast('لطفاً رمز عبور جدید حسابتان را تعیین فرمایید.', 'info');
  }

  // تلاش مکرر تا اطمینان از لود کامل المان‌های DOM
  doOpen();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(doOpen, 100);
      setTimeout(doOpen, 500);
    });
  } else {
    setTimeout(doOpen, 200);
    setTimeout(doOpen, 600);
  }
}

// شنونده خودکار لینک بازیابی رمز عبور بازگشتی از ایمیل
function checkEmailRecoveryFlow() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  if (isRecoveryFlowDetected || 
      sessionStorage.getItem('tajinkart_recovering_password') === 'true' || 
      hash.includes('type=recovery') || 
      search.includes('type=recovery') || 
      search.includes('action=reset-password') || 
      (hash.includes('access_token=') && !hash.includes('provider='))) {
    console.log('[Auth Recovery] Initiating password reset UI!');
    triggerPasswordResetModal();
  }
}


async function initSupabaseAuthSession() {
  if (!window.supabaseClient || !window.supabaseClient.auth) return;
  try {
    const { data } = await window.supabaseClient.auth.getSession();
    if (data && data.session && data.session.user) {
      applyLoggedInMember(data.session.user);
      console.log('[Supabase Auth] Active cloud session restored for:', data.session.user.email);
    }

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Auth Event]', event);
      if (event === 'PASSWORD_RECOVERY') {
        switchAuthView('reset');
        const modal = document.getElementById('memberModal');
        if (modal) modal.style.display = 'flex';
        showToast('لطفاً رمز عبور جدید حسابتان را وارد فرمایید.', 'info');
      } else if (session && session.user) {
        applyLoggedInMember(session.user);
      }
    });
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
      if (showNotification) showToast('خطا در دریافت لیست اعضا از سرور ابری.', 'error');
      return;
    }

    if (cloudMembers) {
      siteMembersData = cloudMembers.map(m => ({
        id: m.id,
        name: m.name || (m.email ? m.email.split('@')[0] : 'عضو استودیو'),
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
          showToast(`✓ لیست اعضا با موفقیت از دیتابیس ابری همگام شد (${siteMembersData.length} عضو فعال).`, 'success');
        } else {
          showToast('✓ همگام‌سازی کامل شد: تمام اعضای حذف‌شده از پنل سایت نیز پاک شدند (لیست همگام با دیتابیس ابری شد).', 'info');
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

      showcaseArtworks = validRows.map(row => ({
        id: Number(row.id),
        tag: row.tag || 'character',
        shortSlug: row.short_slug || row.title,
        title: row.title,
        desc: row.desc_text || '',
        pipelineKey: row.pipeline_key || 'sketch1',
        image: row.image,
        colorSpace: row.color_space || 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
        lore: row.lore || 'جهان اکستوپیا',
        phases: row.phases || []
      })).sort((a, b) => b.id - a.id);

      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      renderShowcaseGrid();
      renderAdminSketch2();
      console.log('Automated two-way cloud sync complete. Active artworks:', showcaseArtworks.length);
      return;
    }

    // ۲. فقط در صورتی که دیتابیس نو و کاملاً خالی است و حذفی هم ثبت نشده
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
        color_space: a.colorSpace || 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
        lore: a.lore || 'جهان اکستوپیا',
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
      img.onerror = () => reject(new Error('خطا در لود تصویر'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
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
let isCreatingNewArt = false;
let stagingNewArt = null;

window.openCreateArtworkModal = function() {
  isCreatingNewArt = true;
  stagingNewArt = {
    id: Date.now(),
    tag: 'character',
    shortSlug: '',
    title: '',
    desc: '',
    pipelineKey: 'sketch1',
    image: '',
    colorSpace: 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
    lore: 'جهان اکستوپیا',
    phases: [
      { name: 'اتود اولیه و سیلوئت', img: '' },
      { name: 'لاین‌آرت فنی و کادر', img: '' },
      { name: 'مطالعه نوری و مقداری', img: '' },
      { name: 'رندر متریال نهایی', img: '' }
    ]
  };

  const titleEl = document.getElementById('adminArtEditorModalTitle');
  if (titleEl) titleEl.textContent = '✨ افزودن اثر جدید به گالری';

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
  if (titleEl) titleEl.textContent = `ویرایش آرت‌ورک: ${art.shortSlug || art.title}`;

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

function renderAdminArtModalForm(art, isNew) {
  const box = document.getElementById('adminArtFormFields');
  if (!box || !art) return;

  const previewDisplay = art.image ? 'block' : 'none';
  const emptyPreviewDisplay = art.image ? 'none' : 'flex';

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      
      <!-- پیش‌نمایش تصویر -->
      <div style="background:#04060a; border:1px solid var(--border-subtle); border-radius:14px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:11.5px; font-weight:700; color:var(--gold);">پیش‌نمایش تصویر اثر:</span>
          <span id="adminArtPreviewRatioText" class="font-mono" style="font-size:10.5px; color:var(--cyan-electric);">
            ${art.image ? 'تصویر انتخاب شد' : 'هنوز عکسی انتخاب نشده'}
          </span>
        </div>
        <div style="max-height:220px; min-height:120px; border-radius:10px; overflow:hidden; background:#020306; border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center; position:relative;">
          <img id="adminArtPreviewImg" src="${art.image || ''}" style="max-width:100%; max-height:220px; object-fit:contain; display:${previewDisplay};" alt="پیش‌نمایش" />
          <div id="adminArtEmptyPreviewPlaceholder" style="display:${emptyPreviewDisplay}; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:var(--text-muted); font-size:12px; padding:20px;">
            <span>📷</span>
            <span>برای نمایش پیش‌نمایش، تصویر را آپلود کنید یا لینک آن را قرار دهید.</span>
          </div>
        </div>
      </div>

      <!-- آپلود مستقیم عکس از کامپیوتر یا لینک وب -->
      <div style="background:#05070d; border:1px solid var(--border-subtle); border-radius:12px; padding:14px;">
        <label style="font-size:11.5px; font-weight:700; color:var(--cyan-electric); display:block; margin-bottom:6px;">
          📁 انتخاب تصویر (از حافظه سیستم یا لینک مستقیم):
        </label>
        <div style="display:flex; gap:8px; margin-bottom:8px;">
          <button type="button" onclick="document.getElementById('adminLocalArtFilePicker').click()" class="btn-gold" style="flex:1; background:var(--cyan-electric); color:#000; font-size:11.5px; padding:9px 14px;">
            📁 انتخاب عکس از کامپیوتر (با ارسال ابری به کلودیناری)
          </button>
          <input type="file" id="adminLocalArtFilePicker" accept="image/*" style="display:none;" onchange="handleAdminLocalFileUpload(this)" />
        </div>
        <label style="font-size:10.5px; color:var(--text-muted); display:block; margin-bottom:3px;">یا درج لینک وب (URL):</label>
        <input type="text" id="editArtImageInput" value="${art.image || ''}" oninput="handleAdminImageLiveChange(this.value)" placeholder="https://images.unsplash.com/..." class="font-mono" style="font-size:11.5px;" />
      </div>

      <!-- فیلدهای مشخصات -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">عنوان اثر</label>
          <input type="text" id="editArtTitleInput" value="${art.title || ''}" placeholder="عنوان کامل اثر..." />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">اسلاگ هاور (عنوان کوتاه)</label>
          <input type="text" id="editArtSlugInput" value="${art.shortSlug || ''}" placeholder="مثال: شوالیه سرخ" />
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">پایپلاین دیپ‌لینک به آتلیه</label>
          <select id="editArtPipeSelect">
            <option value="sketch1" ${art.pipelineKey === 'sketch1' ? 'selected' : ''}>کاراکتر و شخصیت</option>
            <option value="sketch_creature" ${art.pipelineKey === 'sketch_creature' ? 'selected' : ''}>موجودات و هیولاها</option>
            <option value="sketch2" ${art.pipelineKey === 'sketch2' ? 'selected' : ''}>فضا و معماری دنیا</option>
            <option value="sketch3" ${art.pipelineKey === 'sketch3' ? 'selected' : ''}>کاور و کی‌فریم</option>
            <option value="sketch4" ${art.pipelineKey === 'sketch4' ? 'selected' : ''}>تجهیزات، پراپ و UI</option>
            <option value="sketch5" ${art.pipelineKey === 'sketch5' ? 'selected' : ''}>کمیک و استوری‌بورد</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">لور داستانی</label>
          <input type="text" id="editArtLoreInput" value="${art.lore || 'جهان اکستوپیا'}" placeholder="جهان جنسیس / اکستوپیا" />
        </div>
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted);">مشخصات فنی و فضای رنگی</label>
        <input type="text" id="editArtColorSpaceInput" value="${art.colorSpace || 'مستر 4K / ۱۶ بیتی ProPhoto RGB'}" />
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted);">شرح و توضیحات تکمیلی اثر</label>
        <textarea id="editArtDescInput" rows="2" placeholder="توضیحات و بریف هنری اثر...">${art.desc || ''}</textarea>
      </div>

      <!-- دکمه‌های عملیاتی -->
      <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
        ${isNew ? `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px;">
            ✓ تایید و افزودن قطعی به گالری
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px;">
            انصراف و لغو
          </button>
        ` : `
          <button type="button" onclick="confirmSaveArtwork()" class="btn-gold" style="width:100%; padding:13px; font-size:12.5px;">
            ✓ ذخیره تغییرات اثر
          </button>
          <button type="button" onclick="adminDeleteArtwork(${currentSelectedArtIdx})" class="btn-secondary" style="color:var(--crimson); width:100%; padding:10px; border-color:rgba(239,68,68,0.3);">
            حذف این اثر از گالری
          </button>
          <button type="button" onclick="closeAdminArtEditor()" class="btn-secondary" style="width:100%; padding:10px;">
            بستن بدون تغییر
          </button>
        `}
      </div>

    </div>
  `;
}

window.handleAdminImageLiveChange = function(url) {
  const cleanUrl = url.trim();
  const previewImg = document.getElementById('adminArtPreviewImg');
  const emptyPlaceholder = document.getElementById('adminArtEmptyPreviewPlaceholder');
  const ratioText = document.getElementById('adminArtPreviewRatioText');

  if (isCreatingNewArt && stagingNewArt) {
    stagingNewArt.image = cleanUrl;
  } else if (showcaseArtworks[currentSelectedArtIdx]) {
    showcaseArtworks[currentSelectedArtIdx].image = cleanUrl;
  }

  if (cleanUrl) {
    if (previewImg) {
      previewImg.src = cleanUrl;
      previewImg.style.display = 'block';
    }
    if (emptyPlaceholder) emptyPlaceholder.style.display = 'none';
    if (ratioText) ratioText.textContent = 'تصویر وارد شد';
  } else {
    if (previewImg) previewImg.style.display = 'none';
    if (emptyPlaceholder) emptyPlaceholder.style.display = 'flex';
    if (ratioText) ratioText.textContent = 'هنوز عکسی انتخاب نشده';
  }
};

window.handleAdminLocalFileUpload = async function(inputEl) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  showToast('در حال آپلود و ذخیره در فضای ابری Cloudinary...', 'info');

  try {
    const cloudUrl = await uploadFileToCloudinary(file);
    if (cloudUrl) {
      handleAdminImageLiveChange(cloudUrl);
      const urlInput = document.getElementById('editArtImageInput');
      if (urlInput) urlInput.value = cloudUrl;
      showToast('تصویر با موفقیت در فضای ابری کلودیناری ذخیره شد و لینک جهانی دریافت کرد!', 'success');
      return;
    }

    showToast('کلودیناری هنوز وصل نشده؛ در حال بهینه‌سازی خودکار HD برای سوپابیس...', 'info');
    const compressedBase64 = await compressImageForStorage(file, 1200, 1200, 0.78);
    handleAdminImageLiveChange(compressedBase64);
    const urlInput = document.getElementById('editArtImageInput');
    if (urlInput) urlInput.value = compressedBase64;
    showToast('تصویر با کیفیت HD آماده و همگام با دیتابیس سوپابیس شد.', 'success');
  } catch (err) {
    console.error('Upload failed:', err);
    showToast('خطا در بارگذاری تصویر. لطفاً دوباره امتحان کنید.', 'error');
  }
};

window.confirmSaveArtwork = function() {
  const title = document.getElementById('editArtTitleInput')?.value.trim() || '';
  const slug = document.getElementById('editArtSlugInput')?.value.trim() || '';
  const pipe = document.getElementById('editArtPipeSelect')?.value || 'sketch1';
  const lore = document.getElementById('editArtLoreInput')?.value.trim() || 'جهان اکستوپیا';
  const colorSpace = document.getElementById('editArtColorSpaceInput')?.value.trim() || 'مستر 4K / ۱۶ بیتی ProPhoto RGB';
  const desc = document.getElementById('editArtDescInput')?.value.trim() || '';

  let img = '';
  if (isCreatingNewArt && stagingNewArt) {
    img = stagingNewArt.image || document.getElementById('editArtImageInput')?.value.trim() || '';
  } else if (showcaseArtworks[currentSelectedArtIdx]) {
    img = showcaseArtworks[currentSelectedArtIdx].image || document.getElementById('editArtImageInput')?.value.trim() || '';
  }

  if (!img) {
    showToast('لطفاً ابتدا تصویر اثر را از کامپیوتر انتخاب کنید یا لینک آن را وارد نمایید.', 'error');
    return;
  }

  try {
    if (isCreatingNewArt && stagingNewArt) {
      // ایجاد شیء مستقل قبل از بستن مودال تا دسترسی به اطلاعات قطع نشود
      const isBase64Img = img.startsWith('data:image/');
      const phaseSecondaryImg = isBase64Img ? '' : img;
      const newArtRecord = {
        id: stagingNewArt.id || Date.now(),
        tag: stagingNewArt.tag || 'character',
        shortSlug: slug || stagingNewArt.shortSlug || title || 'کانسپت جدید',
        title: title || 'کانسپت مستر جدید استودیو',
        desc: desc,
        pipelineKey: pipe,
        image: img,
        colorSpace: colorSpace,
        lore: lore,
        phases: [
          { name: 'اتود اولیه و سیلوئت', img: img },
          { name: 'لاین‌آرت فنی و کادر', img: phaseSecondaryImg },
          { name: 'مطالعه نوری و مقداری', img: phaseSecondaryImg },
          { name: 'رندر متریال نهایی', img: phaseSecondaryImg }
        ]
      };

      showcaseArtworks.unshift(newArtRecord);
      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      
      closeAdminArtEditor();
      renderShowcaseGrid();
      renderAdminSketch2();
      showToast('اثر جدید با موفقیت تایید و به گالری اضافه شد!', 'success');

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
          lore: newArtRecord.lore,
          phases: newArtRecord.phases
        }]).then(({ error }) => {
          if (error) console.warn('Supabase insert error:', error);
          else showToast('اثر جدید در دیتابیس ابری ثبت و در تمام جهان همگام شد!', 'success');
        });
      }
    } else if (showcaseArtworks[currentSelectedArtIdx]) {
      const art = showcaseArtworks[currentSelectedArtIdx];
      art.title = title || art.title;
      art.shortSlug = slug || art.shortSlug;
      art.pipelineKey = pipe;
      art.image = img;
      art.lore = lore;
      art.colorSpace = colorSpace;
      art.desc = desc;

      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      closeAdminArtEditor();
      renderShowcaseGrid();
      renderAdminSketch2();
      showToast('تغییرات اثر با موفقیت ذخیره شد.', 'success');

      if (window.supabaseClient) {
        window.supabaseClient.from('artworks').update({
          tag: art.tag,
          short_slug: art.shortSlug,
          title: art.title,
          desc_text: art.desc,
          pipeline_key: art.pipelineKey,
          image: art.image,
          color_space: art.colorSpace,
          lore: art.lore,
          phases: art.phases
        }).eq('id', art.id).then(({ error }) => {
          if (error) console.warn('Supabase update error:', error);
          else showToast('تغییرات در دیتابیس ابری ذخیره و همگام شد.', 'success');
        });
      }
    }
  } catch (storageErr) {
    console.error('Storage error:', storageErr);
    showToast('خطا در ذخیره‌سازی داده‌ها.', 'error');
  }
};

window.adminDeleteArtwork = function(idx) {
  if (!showcaseArtworks || showcaseArtworks.length <= 0) {
    showToast('اثری برای حذف وجود ندارد.', 'error');
    return;
  }
  if (confirm('آیا از حذف قطعی این اثر از گالری اطمینان دارید؟')) {
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
    showToast('اثر مورد نظر با موفقیت حذف شد و دیگر برنخواهد گشت.', 'info');
  }
};

window.renderAdminSettingsTab = function() {
  const rateEl = document.getElementById('setUsdRate');
  if (rateEl) rateEl.value = siteSettings.usdRate || 72000;
  const tokenEl = document.getElementById('setTgToken');
  if (tokenEl) tokenEl.value = siteSettings.tgToken || '';
  const chatEl = document.getElementById('setTgChat');
  if (chatEl) chatEl.value = siteSettings.tgChat || '';
  const passEl = document.getElementById('setAdminPass');
  if (passEl) passEl.value = siteSettings.adminPass || 'tajinkart';
  const cCloudEl = document.getElementById('setCloudinaryCloud');
  if (cCloudEl) cCloudEl.value = siteSettings.cloudinaryCloudName || 'tajinkart';
  const cPresetEl = document.getElementById('setCloudinaryPreset');
  if (cPresetEl) cPresetEl.value = siteSettings.cloudinaryPreset || 'erlvtkx9';
};

// سابقه مرورگر و دکمه بازگشت در موبایل (HTML5 History API)
window.addEventListener('popstate', (event) => {
  const artModal = document.getElementById('artDetailModal');
  if (artModal && artModal.classList.contains('active')) {
    closeArtModalDirect();
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

window.toggleDockExpand = function(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    const isOpen = dock.classList.contains('dock-open');
    if (isOpen) {
      dock.classList.remove('dock-open');
      dock.classList.add('dock-collapsed');
    } else {
      dock.classList.add('dock-open');
      dock.classList.remove('dock-collapsed');
    }
  }
};


/**
 * TAJINKART Master Spec v2.1 Engine
 * استودیو کانسپت آرت و توسعه بصری — سید سروش تاج
 */

// تبدیل زنده نرخ دلار به تومان
function formatPrice(usdPrice) {
  if (typeof usdPrice === 'string') {
    if (currencyMode === 'TOMAN') {
      const matches = usdPrice.match(/\d+/g);
      if (matches && matches.length > 0) {
        const tomans = matches.map(m => {
          const val = parseInt(m, 10) * (siteSettings.usdRate || 72000);
          return (val / 1000).toLocaleString('fa-IR') + ' هزار تومان';
        });
        return tomans.join(' تا ');
      }
    }
    return usdPrice;
  }
  if (currencyMode === 'TOMAN') {
    const tomanVal = usdPrice * (siteSettings.usdRate || 72000);
    return tomanVal.toLocaleString('fa-IR') + ' تومان';
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
  showToast(`واحد پولی نمایش داده شده به ${mode === 'TOMAN' ? 'تومان' : 'دلار ($)'} تغییر یافت.`, 'info');
};

// سیستم توست نوتیفیکیشن دارک فانتزی
window.showToast = function(msg, type = 'gold') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
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
  }, 6500);
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
function renderShowcaseGrid() {
  const grid = document.getElementById('showcaseGrid');
  if (!grid) return;
  grid.innerHTML = showcaseArtworks.map((art, i) => {
    const spanClass = getAutoSpanClass(art);
    const richAlt = `${art.title} — کانسپت آرت و طراحی دنیا استودیو TAJINKART`;
    return `
      <div class="mosaic-tile ${spanClass}" id="galleryTile_${art.id}" onclick="openArtModal(${art.id})">
        <div class="tile-center-title">
          <span class="tile-slug">/ ${art.shortSlug} /</span>
          <span class="tile-divider"></span>
          <span class="tile-sub">${art.title}</span>
        </div>
        <img src="${art.image}" loading="lazy" alt="${richAlt}" onload="handleImageAutoDetect(this, ${art.id}); this.parentElement.classList.add('loaded');" />
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
  const art = showcaseArtworks.find(a => a.id === artId);
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
window.openArtModal = function(id) {
  const art = showcaseArtworks.find(a => a.id === id);
  if (!art) return;
  activeCaseStudyArt = art;
  activeCaseStudyPhaseIdx = 0;

  document.getElementById('artDetailTitle').textContent = art.title;
  document.getElementById('artDetailDesc').textContent = art.desc;
  document.getElementById('caseStudyColorSpace').textContent = art.colorSpace || 'مستر 4K / ۱۶ بیتی ProPhoto RGB';
  document.getElementById('caseStudyLore').textContent = art.lore || 'جهان اکستوپیا';

  const pipeData = PIPELINE_DATA[art.pipelineKey] || PIPELINE_DATA['sketch1'];
  document.getElementById('caseStudyPipeName').textContent = pipeData.topSub;

  renderCaseStudyPhasesSwitcher();
  updateCaseStudyPhaseView();

  document.getElementById('artDetailModal').classList.add('active');
};

function renderCaseStudyPhasesSwitcher() {
  const switcher = document.getElementById('caseStudyPhasesSwitcher');
  if (!switcher || !activeCaseStudyArt) return;
  const phases = activeCaseStudyArt.phases || [
    { name: 'اتود اولیه و سیلوئت', img: activeCaseStudyArt.image },
    { name: 'لاین‌آرت فنی و کادر', img: activeCaseStudyArt.image },
    { name: 'مطالعه نوری و مقداری', img: activeCaseStudyArt.image },
    { name: 'رندر متریال نهایی', img: activeCaseStudyArt.image }
  ];

  switcher.innerHTML = phases.map((p, idx) => `
    <button type="button" onclick="setCaseStudyPhase(${idx})" class="case-phase-btn ${idx === activeCaseStudyPhaseIdx ? 'active' : ''}">
      ${p.name}
    </button>
  `).join('');
}

window.setCaseStudyPhase = function(idx) {
  activeCaseStudyPhaseIdx = idx;
  updateCaseStudyPhaseView();
  renderCaseStudyPhasesSwitcher();
};

function updateCaseStudyPhaseView() {
  if (!activeCaseStudyArt) return;
  const phases = activeCaseStudyArt.phases || [{ name: 'رندر نهایی اثر', img: activeCaseStudyArt.image }];
  const currentPhase = phases[activeCaseStudyPhaseIdx] || phases[0];

  const imgEl = document.getElementById('caseStudyMainImg');
  const badgeEl = document.getElementById('caseStudyPhaseBadge');
  const displayImg = currentPhase.img || activeCaseStudyArt.image;
  if (imgEl) imgEl.src = getOptimizedImageUrl(displayImg, 1600);
  if (badgeEl) badgeEl.textContent = `فاز ${activeCaseStudyPhaseIdx + 1} • ${currentPhase.name}`;
}

// دیپ‌لینک هوشمند از مطالعه موردی به پایپلاین آتلیه کمیسیون
window.deepLinkToPipeline = function() {
  closeArtModalDirect();
  const pipeKey = activeCaseStudyArt ? activeCaseStudyArt.pipelineKey : 'sketch1';
  switchView('store');
  switchStoreTab('commissions', document.querySelector('.store-dual-nav .store-dual-btn'));
  selectPipeline(pipeKey, null, true);
  showToast('پایپلاین تخصصی سفارش این اثر باز شد.', 'info');
};

window.closeArtModal = function(e) { if (e.target.id === 'artDetailModal') closeArtModalDirect(); };
window.closeArtModalDirect = function() { document.getElementById('artDetailModal').classList.remove('active'); };

// پایپلاین‌های ۶گانه آتلیه
window.selectPipeline = function(key, cardEl, userClicked) {
  currentSelectedPipeKey = key;
  document.querySelectorAll('#atelierServiceCards .service-nav-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-pipeline') === key);
  });

  const data = PIPELINE_DATA[key];
  if (!data) return;

  document.getElementById('sketchTopSubTitle').textContent = data.topSub;
  document.getElementById('sketchAnnotationNote').textContent = data.note;
  document.getElementById('sketchBadgeSlug').textContent = data.badgeSlug;

  const container = document.getElementById('mosaicStageContainer');
  if (container) {
    container.innerHTML = data.tiles.map((tile, idx) => {
      const displayPrice = formatPrice(tile.price);
      return `
        <div class="pipeline-tile ${tile.span}" onclick="openModal('${tile.title}', '${tile.desc}', '${displayPrice}', '${tile.img}', '${tile.timeline}', ${tile.usdVal || 90}, '${key}')">
          <img src="${tile.img}" class="pipeline-tile-img" alt="${tile.title}" />
          <div class="pipeline-tile-overlay">
            <span class="pipeline-step-badge">${tile.badge}</span>
            <h4 class="pipeline-tile-title">${tile.title}</h4>
            <p class="pipeline-tile-desc">${tile.desc}</p>
            <div class="pipeline-tile-footer">
              <div>
                <span class="font-mono" style="color:var(--gold); font-size:13.5px; font-weight:800;">${displayPrice}</span>
                <span style="color:var(--cyan-electric); font-size:11px; margin-right:8px;">(${tile.timeline})</span>
              </div>
              <span style="font-size:11.5px; color:var(--iris); font-weight:700;">محاسبه فاکتور و ثبت بریف ←</span>
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
    desc: desc,
    price: price,
    img: img,
    timeline: timeline || '۵ تا ۷ روز کاری',
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

  const framingEl = document.getElementById('wizFraming');
  const compEl = document.getElementById('wizComplexity');
  const phaseEl = document.getElementById('orderPhaseSelect');
  const expEl = document.getElementById('wizExpressions');
  const vfxEl = document.getElementById('wizVFX');
  const commEl = document.getElementById('wizCommercial');

  let extra = 0;
  if (framingEl) extra += parseInt(framingEl.options[framingEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (compEl) extra += parseInt(compEl.options[compEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (phaseEl) extra += parseInt(phaseEl.options[phaseEl.selectedIndex].getAttribute('data-usd') || 0, 10);
  if (expEl && expEl.checked) extra += 35;
  if (vfxEl && vfxEl.checked) extra += 25;
  if (commEl && commEl.checked) extra += 45;

  const totalUSD = Math.max(50, baseUSD + extra);
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
  'all': 'مخزن دارایی‌های دیجیتال استودیو شامل ۷ شاخه اسست‌های دوبعدی بازی، براش‌های تخصصی، کیت‌های UI، کمیک‌های لایه‌باز، لوپ‌های 4K، فایل‌های پرینت ۳D و بسته‌های FX.',
  'بسته‌های اسست بازی و اسپریت ۲D': 'اسپرایت‌شیت‌های کاراکتر و انیمیشن‌های چندجهته (حرکت، حمله، آسیب، مرگ) بهینه‌شده برای Unity و Godot به همراه تایل‌ست‌ها و لایه‌های پارالاکس.',
  'موتور براش، تکسچر و استمپ‌های کانسپت آرت': 'ست‌های اختصاصی براش فتوشاپ (.ABR) و پروکریت برای رندر متریال‌های زنگ‌زدگی، چرم کهنه، فلس و بافت‌های آلفای یکپارچه (Seamless Alphas).',
  'کیت‌های پراپ، آیکون و اینترفیس بازی': 'پکیج‌های آیکون مهارت جادویی، شیشه‌های معجون، فریم‌های دارک‌فانتزی HUD و المان‌های RPG با رزولوشن 256x256 و 512x512 ترنسپرنت.',
  'کمیک دیجیتال، آرت‌بوک و سورس‌فایل‌های مستر': 'چپترهای کمیک با رزولوشن فوق‌العاده بالا به همراه فایل‌های تفکیک‌شده لایه‌باز PSD، آرت‌بوک‌های لور جهان جنسیس و یادداشت‌های کارگردانی.',
  'فوتیج‌های متحرک، لوپ‌های سینمایی و اسپلش': 'ویدیوهای لوپ پیوسته بدون درز (Seamless 4K MP4 / WebM) مناسب برای منوی اصلی بازی‌ها، والپیپر استیم و پس‌زمینه‌های تیزر تبلیغاتی.',
  'فایل‌های پرینت سه‌بعدی STL و مینیاتوری‌های رزینی': 'فایل‌های بهینه‌سازی‌شده .STL و .OBJ سر هیولاها و مینیاتوری‌های دارک‌فانتزی مناسب پرینترهای رزینی همراه با بیس‌مش خام (Base Mesh) برای ZBrush.',
  'اوورلی‌های اتمسفریک، ذرات و افکت‌های بصری': 'فایل‌های PNG ترنسپرنت و ویدیوهای لوپ بلک‌اسکرین از ذرات معلق اتر، مه سنگین، باران گوگردی و پاشش خون آماده استفاده در فتوشاپ و افتر افکت.'
};

window.filterStoreAssets = function(type, el) {
  currentStoreFilterType = type;
  document.querySelectorAll('#assetCategoryTabs .service-nav-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('currentAssetCategoryTitle');
  if (titleEl) titleEl.textContent = type === 'all' ? 'همه دارایی‌های استودیو' : type;

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
    grid.innerHTML = `<div style="grid-column:1/-1; padding:40px; text-align:center; color:var(--text-muted); font-size:13px;">هیچ آیتمی در این دسته‌بندی یافت نشد.</div>`;
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
              <span>${p.loreKey || 'جهان جنسیس • دسترسی لور مادام‌العمر'}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--border-subtle);">
            <span class="font-mono" style="font-size:16px; font-weight:800; color:var(--gold);">${priceStr}</span>
            <button onclick="downloadDigitalAsset('${p.title}')" class="btn-gold" style="padding:8px 14px; font-size:11px; background:var(--cyan-electric); color:#000;">دریافت و آنلاک لایسنس ←</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.downloadDigitalAsset = function(title) {
  showToast(`دارایی «${title}» همراه با لایسنس دائمی و کلید لور به داشبورد شما اضافه شد.`, 'success');
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
            <button onclick="enrollAcademyCourse('${c.title}')" class="btn-gold" style="background:var(--violet); color:#fff; font-size:11.5px; padding:8px 14px;">ثبت‌نام در دوره ←</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.enrollAcademyCourse = function(title) {
  showToast(`ثبت‌نام شما در دوره «${title}» با موفقیت انجام شد!`, 'success');
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
async function dispatchTelegramNotification(order) {
  if (!siteSettings.tgToken || !siteSettings.tgChat) return;
  const text = encodeURIComponent(
    `🚨 *ثبت بریف کانسپت آرت جدید TAJINKART*\n` +
    `• *کارفرما:* ${order.client}\n` +
    `• *تماس:* ${order.contact}\n` +
    `• *پکیج:* ${order.pkg}\n` +
    `• *فاز:* ${order.phase}\n` +
    `• *لینک رفرنس:* ${order.refLink || 'ندارد'}\n` +
    `• *توضیحات بریف:* ${order.brief}\n` +
    `• *تعرفه محاسبه‌شده:* ${order.price}`
  );
  try {
    await fetch(`https://api.telegram.org/bot${siteSettings.tgToken}/sendMessage?chat_id=${siteSettings.tgChat}&text=${text}&parse_mode=Markdown`);
  } catch (err) {
    console.warn('Telegram sync failed:', err);
  }
}

// سوییچ ویوها و هماهنگی ناوبری
window.switchView = function(vKey) {
  currentView = vKey;
  document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(`view-${vKey}`);
  if (target) target.classList.remove('hidden');

  const topBar = document.getElementById('topCenterBrandBar');
  const dock = document.getElementById('rightVerticalNav');
  const homeBtn = document.getElementById('rightDockHomeBtn');

  // آپدیت وضعیت دکمه‌های ناوبری موبایل
  document.querySelectorAll('#mobileBottomNav .mob-nav-btn').forEach((btn, idx) => {
    const keys = ['showcase', 'store', 'genesis', 'academy', 'member-dashboard'];
    btn.classList.toggle('active', keys[idx] === vKey);
  });

  if (dock) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
  }

  if (vKey === 'showcase') {
    renderShowcaseGrid();
    if (homeBtn) homeBtn.classList.add('hidden');
    if (window.scrollY <= 140) {
      if (dock) dock.classList.remove('dock-collapsed');
      if (topBar) topBar.classList.remove('visible');
    } else {
      if (topBar) topBar.classList.add('visible');
    }
  } else {
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

// پارالاکس هیرو سبک ZEN در اسکرول
window.addEventListener('scroll', () => {
  const dock = document.getElementById('rightVerticalNav');
  const topBar = document.getElementById('topCenterBrandBar');
  const hero = document.getElementById('stickyBrandHero');

  if (currentView === 'showcase') {
    const scrolled = window.scrollY;

    // رفتار محبوب کاربر: داک در بالای صفحه باز است و با اسکرول به پایین جمع می‌شود
    if (scrolled > 120) {
      if (dock) dock.classList.add('dock-collapsed');
      if (topBar) topBar.classList.add('visible');
    } else {
      if (dock) {
        dock.classList.remove('dock-collapsed');
        dock.classList.remove('dock-open');
      }
      if (topBar) topBar.classList.remove('visible');
    }

    if (hero) {
      if (window.innerWidth > 768) {
        if (scrolled < 650) {
          const ratio = Math.min(scrolled / 500, 1);
          const scale = 1 - (ratio * 0.08);
          const translateY = scrolled * 0.28;
          const opacity = Math.max(1 - (ratio * 0.75), 0.15);
          hero.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
          hero.style.opacity = opacity;
        } else {
          hero.style.transform = 'translate3d(0, 140px, 0) scale(0.92)';
          hero.style.opacity = '0.15';
        }
      } else {
        if (scrolled < 400) {
          const opacity = Math.max(1 - (scrolled / 320), 0.25);
          hero.style.opacity = opacity;
          hero.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`;
        } else {
          hero.style.opacity = '0.25';
          hero.style.transform = 'translate3d(0, 80px, 0)';
        }
      }
    }
  }
}, { passive: true });

window.toggleDockExpand = function() {
  const dock = document.getElementById('rightVerticalNav');
  if (dock) dock.classList.toggle('dock-open');
};

document.addEventListener('click', (e) => {
  const dock = document.getElementById('rightVerticalNav');
  if (dock && !dock.contains(e.target)) {
    dock.classList.remove('dock-open');
  }
});

// احراز هویت اعضا و بازیابی رمز
window.handleMembersIconClick = function() {
  const dock = document.getElementById('rightVerticalNav');
  if (dock) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
  }
  if (currentMember) {
    renderMemberDashboard();
    switchView('member-dashboard');
  } else {
    switchAuthView('login');
    document.getElementById('memberModal').style.display = 'flex';
  }
};
window.closeMemberModal = function() { document.getElementById('memberModal').style.display = 'none'; };

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

window.handleSendResetCode = function() {
  const iden = document.getElementById('forgotIdentifier').value.trim();
  if (!iden) {
    showToast('لطفاً ایمیل یا شماره همراه خود را وارد کنید.', 'error');
    return;
  }
  document.getElementById('forgotStep1').classList.add('hidden');
  document.getElementById('forgotStep2').classList.remove('hidden');
  showToast('کد تایید ۶ رقمی به ایمیل/شماره شما صادر گردید.', 'info');
};

window.logoutMemberAccount = async function() {
  if (window.supabaseClient && window.supabaseClient.auth) {
    try {
      await window.supabaseClient.auth.signOut();
    } catch(e) {}
  }
  currentMember = null;
  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) labelEl.textContent = 'پورتال اعضا';
  showToast('از حساب کاربری خارج شدید.', 'info');
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

window.logoutAdmin = function() {
  document.getElementById('adminWorkspace').classList.add('hidden');
  document.getElementById('adminLoginGate').classList.remove('hidden');
  switchView('showcase');
};

// مدیریت پنل ادمین ۶ زبانه طبق Master Spec v2.1
window.switchAdminTab = function(tabKey, btn) {
  const tabs = ['artworks', 'pipelines', 'products', 'members', 'orders', 'settings'];
  tabs.forEach(t => {
    const el = document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (el) el.classList.toggle('hidden', t !== tabKey);
  });

  document.querySelectorAll('.admin-sidebar-menu .admin-nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
  });

  if (tabKey === 'artworks') renderAdminSketch2();
  if (tabKey === 'pipelines') renderAdminSketch1();
  if (tabKey === 'products') renderAdminProductsTab();
  if (tabKey === 'members') renderAdminSketch3();
  if (tabKey === 'orders') renderAdminLists();
  if (tabKey === 'settings') renderAdminSettingsTab();
};

function renderAdminSketch1() {
  const catList = document.getElementById('adminCategoryListCol');
  if (!catList) return;
  catList.innerHTML = Object.keys(PIPELINE_DATA).map(key => `
    <div class="admin-cat-item ${key === currentSelectedPipeKey ? 'active' : ''}" onclick="selectAdminCategory('${key}')">
      <span style="font-size:12.5px; font-weight:700;">${PIPELINE_DATA[key].topSub}</span>
      <span class="font-mono" style="font-size:10.5px; color:var(--gold);">${PIPELINE_DATA[key].tiles.length} فاز</span>
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
  if (titleEl) titleEl.textContent = `مراحل: ${data.topSub}`;

  const stagesGrid = document.getElementById('adminStagesGridCol');
  if (stagesGrid) {
    stagesGrid.innerHTML = data.tiles.map((t, idx) => `
      <div class="admin-card-box ${idx === currentSelectedStageIdx ? 'active' : ''}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-color:${idx === currentSelectedStageIdx ? 'var(--gold)' : 'rgba(255,255,255,0.08)'};" onclick="selectAdminStage(${idx})">
        <div>
          <span class="pipeline-step-badge" style="margin-bottom:4px;">${t.badge}</span>
          <div style="font-size:13.5px; font-weight:800; color:#fff;">${t.title}</div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">⏱ زمان تحویل: ${t.timeline}</div>
        </div>
        <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <span class="font-mono" style="color:var(--gold); font-size:15px; font-weight:800;">${t.price}</span>
          <button onclick="event.stopPropagation(); adminDeleteStage(${idx})" style="color:var(--crimson); font-size:11px;">حذف فاز</button>
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
        <label style="font-size:11px; color:var(--text-muted);">عنوان مرحله (بج)</label>
        <input type="text" value="${tile.badge}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'badge', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">عنوان کامل فاز</label>
        <input type="text" value="${tile.title}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">تعرفه تخمینی (دلار)</label>
          <input type="text" value="${tile.price}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'price', this.value)" class="font-mono" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">زمان تحویل</label>
          <input type="text" value="${tile.timeline}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'timeline', this.value)" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">قیمت پایه عددی دلار (جهت محاسبه‌گر لحظه‌ای)</label>
        <input type="number" value="${tile.usdVal || 90}" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'usdVal', parseInt(this.value, 10))" class="font-mono" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">شرح خروجی مرحله</label>
        <textarea rows="3" onchange="updateTileField('${currentSelectedPipeKey}', ${currentSelectedStageIdx}, 'desc', this.value)">${tile.desc}</textarea>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">لینک تصویر زمینه فاز</label>
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
  showToast('تغییرات فاز ذخیره شد.', 'success');
};

window.adminAddNewStage = function() {
  if (!PIPELINE_DATA[currentSelectedPipeKey]) return;
  PIPELINE_DATA[currentSelectedPipeKey].tiles.push({
    span: 'col-span-4',
    badge: `فاز ${PIPELINE_DATA[currentSelectedPipeKey].tiles.length + 1}`,
    title: 'فاز جدید توسعه کانسپت',
    desc: 'مشخصات خروجی این فاز را در فرم ستون کناری تکمیل فرمایید.',
    price: '$120 - $160',
    usdVal: 130,
    timeline: '۴ تا ۶ روز کاری',
    img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
  });
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedStageIdx = PIPELINE_DATA[currentSelectedPipeKey].tiles.length - 1;
  renderAdminStagesList();
  selectPipeline(currentSelectedPipeKey, null, false);
  showToast('فاز جدید به پایپلاین اضافه شد.', 'success');
};

window.adminDeleteStage = function(idx) {
  if (PIPELINE_DATA[currentSelectedPipeKey].tiles.length <= 1) {
    showToast('حداقل یک مرحله برای هر پایپلاین الزامی است.', 'error');
    return;
  }
  PIPELINE_DATA[currentSelectedPipeKey].tiles.splice(idx, 1);
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedStageIdx = Math.max(0, currentSelectedStageIdx - 1);
  renderAdminStagesList();
  selectPipeline(currentSelectedPipeKey, null, false);
  showToast('فاز مورد نظر حذف شد.', 'info');
};

window.adminAddNewCategory = function() {
  const newKey = `sketch_cat_${Date.now()}`;
  PIPELINE_DATA[newKey] = {
    id: newKey,
    topSub: 'سرویس جدید استودیو',
    badgeSlug: 'سرویس سفارشی',
    subcategories: ['زیرشاخه ۱', 'زیرشاخه ۲'],
    note: 'پایپلاین سفارشی استودیو.',
    tiles: [
      { span: 'col-span-12', badge: 'فاز ۱ • اتود اولیه', title: 'ایده‌پردازی و اسکچ مفهومی', desc: 'خروجی اولیه همراه با تاییدیه کارفرما.', price: '$80 - $110', usdVal: 90, timeline: '۳ تا ۵ روز کاری', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' }
    ]
  };
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  currentSelectedPipeKey = newKey;
  currentSelectedStageIdx = 0;
  renderAdminSketch1();
  showToast('دسته‌بندی جدید خدمات اضافه شد.', 'success');
};

// اسکچ ۲: مدیریت گالری آثار (همراه با چیدمان با درگ اند دراپ و پیش‌نمایش کادر)
function renderAdminSketch2() {
  const container = document.getElementById('adminMosaicTilesContainer');
  if (!container) return;

  let html = `
    <div class="admin-mosaic-add-tile" onclick="openCreateArtworkModal()" title="افزودن اثر جدید به گالری">
      <span style="font-size:36px; line-height:1; color:var(--gold);">+</span>
      <span style="font-weight:800; font-size:13px; color:var(--gold);">افزودن اثر از اینجا</span>
      <span style="font-size:10.5px; color:var(--text-muted); margin-top:2px;">انتخاب از سیستم یا لینک وب</span>
    </div>
  `;

  html += showcaseArtworks.map((art, idx) => `
    <div class="admin-mosaic-card ${idx === currentSelectedArtIdx ? 'active' : ''}" 
         id="adminArtCard_${idx}"
         draggable="true"
         ondragstart="handleAdminArtDragStart(event, ${idx})"
         ondragover="handleAdminArtDragOver(event)"
         ondragenter="handleAdminArtDragEnter(event, ${idx})"
         ondragleave="handleAdminArtDragLeave(event, ${idx})"
         ondrop="handleAdminArtDrop(event, ${idx})"
         ondragend="handleAdminArtDragEnd(event)"
         onclick="selectAdminArt(${idx})" 
         title="برای جابجایی بکشید و رها کنید (Drag & Drop) یا برای ویرایش کلیک کنید">
      <img src="${art.image}" draggable="false" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" alt="${art.title}" />
      <div style="position:absolute; top:6px; right:6px; padding:3px 7px; border-radius:6px; background:rgba(0,0,0,0.8); color:var(--gold); font-size:10.5px; font-weight:800; border:1px solid rgba(250,204,21,0.3); pointer-events:none; display:flex; align-items:center; gap:3px;">
        <span>⋮⋮</span>
        <span>#${idx + 1}</span>
      </div>
      <div style="position:absolute; bottom:0; inset-inline:0; padding:6px 8px; background:rgba(0,0,0,0.88); font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; pointer-events:none;">
        ${art.shortSlug || art.title}
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}





window.handleAdminImageChange = function(idx, newUrl) {
  const url = newUrl.trim();
  showcaseArtworks[idx].image = url;
  const previewImg = document.getElementById('adminArtPreviewImg');
  if (previewImg) previewImg.src = url;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  detectAndApplyArtworkDimensions(showcaseArtworks[idx], (meta) => {
    const badge = document.getElementById('adminArtPreviewRatioText');
    if (badge) badge.textContent = `${meta.width} × ${meta.height} (نسبت ${meta.ratio})`;
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
    if (badge) badge.textContent = `${w} × ${h} (نسبت ${r})`;
  }
};

window.updateArtPhaseImg = function(artIdx, phaseIdx, url) {
  if (showcaseArtworks[artIdx] && showcaseArtworks[artIdx].phases && showcaseArtworks[artIdx].phases[phaseIdx]) {
    showcaseArtworks[artIdx].phases[phaseIdx].img = url.trim();
    safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
    showToast(`تصویر فاز ${phaseIdx + 1} مطالعه موردی ذخیره شد.`, 'success');
  }
};

window.updateArtField = function(idx, field, value) {
  showcaseArtworks[idx][field] = value;
  safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  renderShowcaseGrid();
  renderAdminSketch2();
  showToast('اثر با موفقیت ویرایش شد.', 'success');
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
        <label style="font-size:11px; color:var(--text-muted);">عنوان دارایی / پکیج</label>
        <input type="text" value="${p.title}" onchange="updateProductField(${currentSelectedProductIdx}, 'title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted);">شاخه دارایی (۷ شاخه)</label>
          <select onchange="updateProductField(${currentSelectedProductIdx}, 'type', this.value)">
            <option value="بسته‌های اسست بازی و اسپریت ۲D" ${p.type === 'بسته‌های اسست بازی و اسپریت ۲D' ? 'selected' : ''}>بسته‌های اسست بازی و اسپریت ۲D</option>
            <option value="موتور براش، تکسچر و استمپ‌های کانسپت آرت" ${p.type === 'موتور براش، تکسچر و استمپ‌های کانسپت آرت' ? 'selected' : ''}>موتور براش، تکسچر و استمپ‌ها</option>
            <option value="کیت‌های پراپ، آیکون و اینترفیس بازی" ${p.type === 'کیت‌های پراپ، آیکون و اینترفیس بازی' ? 'selected' : ''}>کیت‌های پراپ و UI</option>
            <option value="کمیک دیجیتال، آرت‌بوک و سورس‌فایل‌های مستر" ${p.type === 'کمیک دیجیتال، آرت‌بوک و سورس‌فایل‌های مستر' ? 'selected' : ''}>کمیک و سورس‌فایل مستر</option>
            <option value="فوتیج‌های متحرک، لوپ‌های سینمایی و اسپلش" ${p.type === 'فوتیج‌های متحرک، لوپ‌های سینمایی و اسپلش' ? 'selected' : ''}>لوپ‌های سینمایی 4K</option>
            <option value="فایل‌های پرینت سه‌بعدی STL و مینیاتوری‌های رزینی" ${p.type === 'فایل‌های پرینت سه‌بعدی STL و مینیاتوری‌های رزینی' ? 'selected' : ''}>فایل‌های پرینت ۳D و STL</option>
            <option value="اوورلی‌های اتمسفریک، ذرات و افکت‌های بصری" ${p.type === 'اوورلی‌های اتمسفریک، ذرات و افکت‌های بصری' ? 'selected' : ''}>اوورلی ذرات و افکت FX</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted);">قیمت پایه (دلار)</label>
          <input type="number" value="${p.price}" onchange="updateProductField(${currentSelectedProductIdx}, 'price', parseInt(this.value, 10))" class="font-mono" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">کلید دسترسی لور (Genesis Key)</label>
        <input type="text" value="${p.loreKey || ''}" onchange="updateProductField(${currentSelectedProductIdx}, 'loreKey', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">لینک تصویر کاور</label>
        <input type="text" value="${p.img}" onchange="updateProductField(${currentSelectedProductIdx}, 'img', this.value)" class="font-mono" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted);">توضیحات و محتویات بسته</label>
        <textarea rows="3" onchange="updateProductField(${currentSelectedProductIdx}, 'desc', this.value)">${p.desc || ''}</textarea>
      </div>
      <button onclick="adminDeleteProduct(${currentSelectedProductIdx})" class="btn-secondary" style="color:var(--crimson); margin-top:6px; border-color:rgba(239,68,68,0.3);">حذف این دارایی</button>
    </div>
  `;
}

window.updateProductField = function(idx, field, val) {
  digitalStoreProducts[idx][field] = val;
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  renderProducts();
  showToast('مشخصات دارایی ذخیره شد.', 'success');
};

window.adminAddNewProduct = function() {
  digitalStoreProducts.unshift({
    id: Date.now(),
    title: 'بسته دارایی جدید استودیو',
    price: 29,
    type: 'بسته‌های اسست بازی و اسپریت ۲D',
    loreKey: 'جهان جنسیس • آنلاک لور',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=700&q=80',
    desc: 'محتویات و سورس‌فایل‌های لایه‌باز این بسته دیجیتال.'
  });
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  currentSelectedProductIdx = 0;
  renderAdminProductsTab();
  renderProducts();
  showToast('دارایی جدید افزوده شد.', 'success');
};

window.adminDeleteProduct = function(idx) {
  if (digitalStoreProducts.length <= 1) {
    showToast('حداقل یک محصول الزامی است.', 'error');
    return;
  }
  digitalStoreProducts.splice(idx, 1);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  currentSelectedProductIdx = Math.max(0, currentSelectedProductIdx - 1);
  renderAdminProductsTab();
  renderProducts();
  showToast('دارایی حذف شد.', 'info');
};

// اسکچ ۳: مدیریت اعضا و گزارش‌های مالی
function renderAdminSketch3(filterText = '', tierFilter = currentMemberTierFilter) {
  const listEl = document.getElementById('adminMembersListContainer');
  if (!listEl) return;

  let filtered = siteMembersData;
  if (filterText) {
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(filterText.toLowerCase()) ||
      m.email.toLowerCase().includes(filterText.toLowerCase()) ||
      m.contact.includes(filterText)
    );
  }
  if (tierFilter !== 'all') {
    filtered = filtered.filter(m => m.tier === tierFilter);
  }

  listEl.innerHTML = filtered.map((m, idx) => `
    <div class="member-list-item ${idx === selectedMemberIdx ? 'active' : ''}" onclick="selectAdminMember(${idx})">
      <div>
        <div style="font-size:13.5px; font-weight:800; color:#fff;">${m.name}</div>
        <div class="font-mono" style="font-size:11px; color:var(--text-muted); margin-top:2px;">${m.email}</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="tier-tag tier-${m.tier.toLowerCase()}">${m.tier}</span>
        <span class="font-mono" style="color:var(--gold); font-size:12px; font-weight:800;">${m.totalSpent}</span>
      </div>
    </div>
  `).join('');

  renderAdminMemberDetail(filtered[selectedMemberIdx] || filtered[0] || siteMembersData[0]);
}

window.selectAdminMember = function(idx) {
  selectedMemberIdx = idx;
  renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
};

function renderAdminMemberDetail(m) {
  const col = document.getElementById('adminMemberDetailContent');
  if (!m || !col) return;
  const tierColor = m.tier === 'VIP' ? 'var(--gold)' : (m.tier === 'PRO' ? 'var(--cyan-electric)' : '#cbd5e1');

  col.innerHTML = `
    <div style="padding:14px; background:#040609; border-radius:12px; border:1px solid ${tierColor}; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:16px; font-weight:900; color:${tierColor};">${m.name}</h3>
        <span class="tier-tag tier-${m.tier.toLowerCase()}">${m.tier}</span>
      </div>
      <div class="font-mono" style="font-size:12px; color:var(--text-muted); margin-top:4px;">ایمیل: ${m.email}</div>
      <div class="font-mono" style="font-size:12px; color:var(--text-muted);">تماس: ${m.contact}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
      <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid var(--border-subtle);">
        <div style="font-size:11px; color:var(--text-muted);">موجودی قابل برداشت:</div>
        <div class="font-mono" style="font-size:17px; font-weight:800; color:var(--cyan-electric); margin-top:3px;">${m.balance}</div>
      </div>
      <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid var(--border-subtle);">
        <div style="font-size:11px; color:var(--text-muted);">مجموع خریدهای ثبت‌شده:</div>
        <div class="font-mono" style="font-size:17px; font-weight:800; color:var(--gold); margin-top:3px;">${m.totalSpent}</div>
      </div>
    </div>

    <div>
      <h5 style="font-size:12.5px; font-weight:800; margin-bottom:8px; color:#fff;">دارایی‌های دیجیتال و لایسنس‌های فعال:</h5>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${(m.assetsBought || []).map(a => `
          <div style="padding:8px 10px; background:#070a10; border-radius:8px; border:1px solid var(--border-subtle); font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>${a}</span>
            <span style="color:var(--emerald); font-size:11px; font-weight:700;">✓ دسترسی فعال</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- دکمه عملیاتی حذف کاربر در پنل ادمین -->
    <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--border-subtle);">
      <button type="button" onclick="adminDeleteMember(${selectedMemberIdx})" class="btn-secondary" style="width:100%; padding:9px; font-size:11.5px; color:var(--crimson); border-color:rgba(239,68,68,0.35);">
        🗑️ حذف این کاربر
      </button>
    </div>
  `;
}

window.filterAdminMembers = function(val) {
  renderAdminSketch3(val, currentMemberTierFilter);
};

window.filterMembersByTier = function(tier) {
  currentMemberTierFilter = tier;
  document.querySelectorAll('#adminTabMembers .gallery-filter-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', tier);
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
        <div style="font-size:12px; color:var(--cyan-electric); margin:4px 0;">فاز انتخابی: ${o.phase || 'استاندارد'}</div>
        <div style="color:var(--text-muted); font-size:12.5px; margin:4px 0; line-height:1.6;">${o.brief}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); font-size:11.5px;">
          <span style="color:var(--amber);">وضعیت پروژه: <strong>${o.status}</strong></span>
          <select onchange="updateOrderStatus(${idx}, this.value)" style="width:auto; padding:4px 8px; font-size:11.5px;">
            <option value="بریف دریافت شد" ${o.status === 'بریف دریافت شد' ? 'selected' : ''}>بریف دریافت شد</option>
            <option value="فاز ۱: اتود اولیه" ${o.status === 'فاز ۱: اتود اولیه' ? 'selected' : ''}>فاز ۱: اتود اولیه</option>
            <option value="فاز ۲: لاین‌آرت" ${o.status === 'فاز ۲: لاین‌آرت' ? 'selected' : ''}>فاز ۲: لاین‌آرت</option>
            <option value="فاز ۳: رندر و نور" ${o.status === 'فاز ۳: رندر و نور' ? 'selected' : ''}>فاز ۳: رندر و نور</option>
            <option value="تحویل نهایی و تکمیل" ${o.status === 'تحویل نهایی و تکمیل' ? 'selected' : ''}>تحویل نهایی و تکمیل</option>
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
  showToast('وضعیت پروژه به‌روزرسانی شد.', 'success');
};

function renderMemberDashboard() {
  if (!currentMember) return;
  document.getElementById('dashMemberName').textContent = currentMember.name;
  document.getElementById('dashMemberEmail').textContent = currentMember.email;
  document.getElementById('dashMemberContact').textContent = currentMember.contact || 'ارتباط استودیو';

  const oBox = document.getElementById('memberOrdersContainer');
  const userOrders = ordersList.filter(o => o.client.toLowerCase() === currentMember.name.toLowerCase() || o.contact === currentMember.email || o.contact === currentMember.contact);

  if (userOrders.length === 0) {
    oBox.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:10px;">هنوز سفارشی ثبت نکرده‌اید. برای شروع به بخش آتلیه مراجعه فرمایید.</div>`;
  } else {
    oBox.innerHTML = userOrders.map(o => `
      <div style="padding:12px; background:#070a10; border-radius:10px; border:1px solid rgba(0,240,255,0.3); font-size:12px;">
        <div style="display:flex; justify-content:space-between; font-weight:700;">
          <span>${o.pkg}</span>
          <span style="color:var(--cyan-electric); font-size:11px;">${o.status}</span>
        </div>
        <div style="color:var(--text-muted); font-size:11px; margin-top:3px;">فاز: ${o.phase || 'در حال اجرا'}</div>
        <p style="color:var(--text-muted); margin-top:4px;">${o.brief}</p>
      </div>
    `).join('');
  }

  const cBox = document.getElementById('memberCoursesContainer');
  if (cBox) {
    cBox.innerHTML = `
      <div style="padding:12px; background:#070a10; border-radius:10px; border:1px solid rgba(168,85,247,0.3); font-size:12px;">
        <strong>مسترکلاس طراحی کاراکتر فانتزی و متریال زره</strong>
        <div style="color:var(--violet); font-size:11px; margin-top:3px;">جلسات ۱ تا ۱۴ آماده مشاهده و دانلود مستقیم</div>
      </div>
      <div style="margin-top:8px; padding:12px; background:#070a10; border-radius:10px; border:1px solid rgba(0,240,255,0.25); font-size:11.5px;">
        <strong style="color:var(--cyan-electric);">کلیدهای دسترسی لور جنسیس (Genesis Keys):</strong>
        <div style="color:var(--text-muted); margin-top:4px;">۳ سند لور پنهان و والپیپر اختصاصی در حساب شما آنلاک است.</div>
      </div>
    `;
  }
}

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
  showToast('بک‌آپ کامل داده‌ها (JSON) دانلود شد.', 'success');
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
  showToast('فایل کامل index.html مستقل ذخیره شد!', 'success');
};

// راه‌اندازی اولیه در زمان لود صفحه
document.addEventListener('DOMContentLoaded', () => {
  renderShowcaseGrid();
  initSupabaseAuthSession();
  checkEmailRecoveryFlow();
  syncArtworksFromSupabase();
  syncMembersFromSupabase();
  selectPipeline('sketch1', document.querySelector('#atelierServiceCards .service-nav-card.active'), false);
  renderProducts();
  renderAcademy();
  renderComicPage();

  renderAdminSketch1();
  renderAdminSketch2();
  renderAdminProductsTab();
  renderAdminSketch3();
  renderAdminLists();

  const rateEl = document.getElementById('setUsdRate');
  if (rateEl) rateEl.value = siteSettings.usdRate || 72000;
  const tokenEl = document.getElementById('setTgToken');
  if (tokenEl) tokenEl.value = siteSettings.tgToken || '';
  const chatEl = document.getElementById('setTgChat');
  if (chatEl) chatEl.value = siteSettings.tgChat || '';
  const passEl = document.getElementById('setAdminPass');
  if (passEl) passEl.value = siteSettings.adminPass || 'tajinkart';

  // ثبت فرم بریف سفارش
  const orderForm = document.getElementById('commissionOrderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const client = document.getElementById('orderClientName').value.trim();
      const contact = document.getElementById('orderClientContact').value.trim();
      const refLink = document.getElementById('orderClientRefLink')?.value.trim() || 'ارائه نشده (ریسرچ بصری با استودیو)';
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
        status: 'بریف دریافت شد'
      };

      ordersList.unshift(newOrder);
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(ordersList));
      dispatchTelegramNotification(newOrder);
      closeModalDirect();
      renderAdminLists();
      renderMemberDashboard();
      showToast('بریف کمیسیون با موفقیت ثبت شد و به تلگرام استودیو ارجاع گردید.', 'success');
    });
  }

  // فرم ورود اعضا (متصل به احراز هویت ابری Supabase Auth)
  const loginForm = document.getElementById('memberLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const em = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pw = document.getElementById('loginPass').value.trim();

      // ورود اختصاصی مدیر استودیو
      if (em === 'soroush') {
        if (pw === (siteSettings.adminPass || 'tajinkart')) {
          closeMemberModal();
          document.getElementById('adminLoginGate').classList.add('hidden');
          document.getElementById('adminWorkspace').classList.remove('hidden');
          switchView('admin'); switchAdminTab('artworks', document.querySelector('.admin-sidebar-menu .admin-nav-item[data-tab="artworks"]'));
          showToast('مرکز کنترل و پنل مدیریت استودیو گشوده شد.', 'success');
          return;
        } else {
          showToast('رمز عبور مدیر استودیو نامعتبر است.', 'error');
          return;
        }
      }

      showToast('در حال تایید هویت و ورود به استودیو...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: em,
            password: pw
          });

          if (error) {
            console.warn('[Supabase Auth Error]', error);
            if (error.message.includes('Invalid login credentials')) {
              showToast('ایمیل یا رمز عبور وارد شده نادرست است.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
              showToast('ایمیل تایید نشده است. لطفاً لینک فعال‌سازی ایمیل را بررسی کنید.', 'info');
            } else {
              showToast(error.message || 'خطا در ورود به حساب.', 'error');
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user);
            closeMemberModal();
            renderMemberDashboard();
            switchView('member-dashboard');
            showToast(`خوش آمدید، ${currentMember.name}`, 'success');
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
      showToast(`خوش آمدید، ${currentMember.name}`, 'success');
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

      // ۱. اعتبارسنجی سخت‌گیرانه شماره تماس / تلگرام
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      const isTelegram = phone.startsWith('@') && phone.length >= 4;
      const isDigitsPhone = /^[0-9+]{10,15}$/.test(cleanPhone);

      if (!isTelegram && !isDigitsPhone) {
        showToast('شماره تماس نامعتبر است! لطفاً شماره موبایل کامل (حداقل ۱۰ رقم مانند 0912...) یا آیدی تلگرام با @ وارد کنید.', 'error');
        document.getElementById('signupPhone')?.focus();
        return;
      }

      // ۲. اعتبارسنجی طول و یکسان نبودن با مقدار پیش‌فرض
      if (password.length < 6) {
        showToast('رمز عبور باید حداقل ۶ کاراکتر باشد.', 'error');
        return;
      }

      // ۳. تطابق رمز عبور و تکرار آن
      if (password !== passwordConfirm) {
        showToast('رمز عبور و تکرار آن یکسان نیستند! لطفاً مجدداً بررسی فرمایید.', 'error');
        document.getElementById('signupPassConfirm')?.focus();
        return;
      }

      // ۴. بررسی تایید قوانین و رده‌بندی سنی ۱۶+
      if (!agreeTerms || !agreeAge) {
        showToast('لطفاً تیک پذیرش قوانین استودیو و تایید شرط سنی ۱۶+ را علامت بزنید.', 'error');
        return;
      }

      showToast('در حال تایید مشخصات و ایجاد حساب در پورتال استودیو...', 'info');

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
              showToast('این ایمیل قبلاً در سیستم ثبت‌نام شده است. لطفاً وارد شوید.', 'error');
              switchAuthView('login');
              const loginEmailEl = document.getElementById('loginEmail');
              if (loginEmailEl) loginEmailEl.value = email;
            } else {
              showToast('خطای سامانه احراز هویت: ' + (error.message || 'ثبت‌نام ناموفق بود'), 'error');
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user);

            const newMemberObj = {
              id: data.user.id || Date.now(),
              name: name,
              email: email,
              contact: phone,
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
                contact: phone,
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
            showToast('حساب کاربری شما با موفقیت ایجاد شد! خوش آمدید.', 'success');
            return;
          }
        } catch (authErr) {
          console.warn('[Supabase SignUp Exception]', authErr);
        }
      }

      // فال‌بک موقت در صورت عدم برقراری ارتباط با شبکه
      currentMember = { name: name, email: email, contact: phone, assetsBought: [] };
      siteMembersData.push({
        id: Date.now(),
        name: name,
        email: email,
        contact: phone,
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
      showToast('حساب کاربری جدید ایجاد شد.', 'success');
    });
  }

  // فرم بازیابی رمز عبور واقعی از طریق ارسال لینک به جیمیل (Supabase Auth)
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const iden = document.getElementById('forgotIdentifier')?.value.trim().toLowerCase();

      if (!iden || !iden.includes('@')) {
        showToast('لطفاً یک آدرس ایمیل معتبر وارد فرمایید.', 'error');
        return;
      }

      showToast('در حال صدور لینک امن بازیابی به صندوق جیمیل...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const targetRedirect = window.location.origin + window.location.pathname + '?action=reset-password';
          const { error } = await window.supabaseClient.auth.resetPasswordForEmail(iden, {
            redirectTo: targetRedirect
          });

          if (error) {
            console.warn('[Supabase Reset Pass Error]', error);
            showToast(error.message || 'خطا در ارسال ایمیل بازیابی.', 'error');
            return;
          }

          showToast('لینک امن بازیابی با موفقیت به جیمیل شما صادر شد. صندوق ورودی را چک کنید.', 'success');
          switchAuthView('login');
          return;
        } catch (err) {
          console.warn('[Supabase Reset Exception]', err);
        }
      }

      showToast('درخواست شما ثبت شد. در صورت وجود حساب، لینک به جیمیل ارسال می‌شود.', 'info');
      switchAuthView('login');
    });
  }

  // فرم ورود ادمین
  const adminForm = document.getElementById('adminLoginForm');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUsernameInput').value.trim().toLowerCase();
      const p = document.getElementById('adminPasswordInput').value.trim();
      if (u === 'soroush' && p === (siteSettings.adminPass || 'tajinkart')) {
        document.getElementById('adminLoginGate').classList.add('hidden');
        document.getElementById('adminWorkspace').classList.remove('hidden');
        showToast('مرکز کنترل استودیو گشوده شد.', 'success');
      } else {
        showToast('اطلاعات ورود مدیر صحیح نیست.', 'error');
      }
    });
  }

  // فرم تنظیمات ادمین
  const settingsForm = document.getElementById('adminSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      siteSettings.usdRate = parseInt(document.getElementById('setUsdRate').value, 10) || 72000;
      siteSettings.tgToken = document.getElementById('setTgToken').value.trim();
      siteSettings.tgChat = document.getElementById('setTgChat').value.trim();
      siteSettings.adminPass = document.getElementById('setAdminPass').value.trim() || 'tajinkart';
      siteSettings.cloudinaryCloudName = document.getElementById('setCloudinaryCloud')?.value.trim() || 'tajinkart';
      siteSettings.cloudinaryPreset = document.getElementById('setCloudinaryPreset')?.value.trim() || 'erlvtkx9';
      safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
      renderProducts();
      selectPipeline(currentSelectedPipeKey, null, false);
      showToast('تنظیمات سراسری ذخیره و نرخ دلار به‌روزرسانی شد!', 'success');
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
        showToast('رمز عبور باید حداقل ۶ کاراکتر باشد.', 'error');
        return;
      }
      if (p1 !== p2) {
        showToast('تکرار رمز عبور با رمز واردشده مطابقت ندارد!', 'error');
        return;
      }

      showToast('در حال ذخیره رمز عبور جدید در سرورهای ابری...', 'info');

      if (window.supabaseClient && window.supabaseClient.auth) {
        try {
          const { data, error } = await window.supabaseClient.auth.updateUser({
            password: p1
          });

          if (error) {
            console.warn('[Update Password Error]', error);
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('should be different') || msg.includes('same password')) {
              showToast('رمز عبور جدید نمی‌تواند با رمز عبور قبلی شما یکسان باشد! لطفاً یک رمز تازه و متفاوت انتخاب فرمایید.', 'error');
            } else {
              showToast('خطا در به‌روزرسانی رمز: ' + (error.message || 'لطفاً دوباره امتحان کنید'), 'error');
            }
            return;
          }

          if (data && data.user) {
            applyLoggedInMember(data.user);
            closeMemberModal();
            renderMemberDashboard();
            switchView('member-dashboard');
            showToast('✓ رمز عبور جدید شما با موفقیت ثبت شد! خوش آمدید.', 'success');
            // پاکسازی نشست بازیابی و بازنشانی آدرس‌بار
            sessionStorage.removeItem('tajinkart_recovering_password');
            isRecoveryFlowDetected = false;
            try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
            return;
          }
        } catch (err) {
          console.error('[Update Password Exception]', err);
          showToast('خطا در اتصال به سرور جهت تغییر رمز.', 'error');
        }
      }
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
  showToast('ترتیب نمایش آثار با موفقیت تغییر یافت!', 'success');

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
  if (!window.supabaseClient || !window.supabaseClient.auth) {
    showToast('سرویس احراز هویت در دسترس نیست. لطفاً با ایمیل ثبت‌نام کنید.', 'error');
    return;
  }
  showToast('در حال انتقال به صفحه امن ورود گوگل...', 'info');
  try {
    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) {
      console.warn('Google sign-in error:', error);
      showToast('خطا در اتصال به گوگل: ' + error.message, 'error');
    }
  } catch (err) {
    console.error('Google sign-in exception:', err);
    showToast('امکان اتصال به حساب گوگل وجود ندارد.', 'error');
  }
};


// =========================================================
// توابع مدیریت و حذف کاربران در پنل ادمین
// =========================================================
window.adminDeleteMember = function(idx) {
  if (!siteMembersData || !siteMembersData[idx]) return;
  const m = siteMembersData[idx];
  if (confirm(`آیا از حذف کاربر «${m.name}» (${m.email}) از پنل اطمینان دارید؟ (با دکمه بازیابی ابری همیشه می‌توانید آن را برگردانید)`)) {
    const deletedEmail = m.email;
    siteMembersData.splice(idx, 1);
    safeSetStorage(KEYS.MEMBERS, JSON.stringify(siteMembersData));
    selectedMemberIdx = 0;
    renderAdminSketch3(document.getElementById('adminMemberSearchInput')?.value || '', currentMemberTierFilter);
    showToast(`کاربر «${m.name}» از لیست پنل حذف شد. با دکمه «بازیابی از سرور ابری» می‌توانید بازگردانیدش.`, 'info');

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
  showToast('نسخه پشتیبان کامل اطلاعات اعضا (JSON) با موفقیت دانلود شد.', 'success');
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
    btnEl.title = 'مخفی‌سازی رمز';
  } else {
    input.type = 'password';
    btnEl.textContent = '👁️';
    btnEl.title = 'نمایش رمز';
  }
};

window.openTermsModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const modal = document.getElementById('termsModal');
  if (modal) modal.style.display = 'flex';
};

window.closeTermsModal = function() {
  const modal = document.getElementById('termsModal');
  if (modal) modal.style.display = 'none';
};


// =========================================================
// موتور هوشمند سنجش کیفیت و قدرت رمز عبور (Password Strength)
// =========================================================
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

  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) {
    bar.style.width = '25%';
    bar.style.background = 'var(--crimson)';
    text.textContent = 'سطح امنیت: بسیار ضعیف';
    text.style.color = 'var(--crimson)';
    if (hint) hint.textContent = 'افزودن عدد و علامت الزامی است';
  } else if (score === 2) {
    bar.style.width = '50%';
    bar.style.background = 'var(--amber)';
    text.textContent = 'سطح امنیت: متوسط';
    text.style.color = 'var(--amber)';
    if (hint) hint.textContent = 'افزودن حروف بزرگ یا نماد خاص';
  } else if (score === 3 || score === 4) {
    bar.style.width = '75%';
    bar.style.background = 'var(--cyan-electric)';
    text.textContent = 'سطح امنیت: خوب و ایمن';
    text.style.color = 'var(--cyan-electric)';
    if (hint) hint.textContent = 'استاندارد و مناسب';
  } else {
    bar.style.width = '100%';
    bar.style.background = 'var(--emerald)';
    text.textContent = 'سطح امنیت: فوق‌العاده قوی ✓';
    text.style.color = 'var(--emerald)';
    if (hint) hint.textContent = 'حداکثر مقاومت امنیتی';
  }
};


window.openChangePasswordModal = function() {
  switchAuthView('reset');
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = 'flex';
  }
};
