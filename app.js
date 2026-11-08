
// ==============================================================================
// موتور داینامیک دسته‌بندی‌های گالری آثار استودیو (Studio Gallery Categories Engine)
// ==============================================================================
const DEFAULT_GALLERY_CATEGORIES = [
  { id: 'character', title: 'کاراکتر دیزاین' },
  { id: 'environment', title: 'کانسپت و فضا' },
  { id: 'creature', title: 'موجودات و هیولا' },
  { id: 'keyframe', title: 'کی‌فریم و کاور' },
  { id: 'props', title: 'تجهیزات و پراپ' },
  { id: 'comic', title: 'کمیک و وب‌تون' },
  { id: '2d', title: 'تصویرسازی ۲ بعدی' }
];

let galleryCategories = [];
try {
  galleryCategories = JSON.parse(localStorage.getItem('tajinkart_gallery_categories_v1')) || DEFAULT_GALLERY_CATEGORIES;
} catch(e) {
  galleryCategories = DEFAULT_GALLERY_CATEGORIES;
}

window.renderFloatingCategoryDropdown = function() {
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (!dropdown) return;

  let itemsHtml = `
    <div class="cat-dropdown-item ${currentGalleryFilter === 'all' ? 'active' : ''}" onclick="filterGalleryByCategory('all', 'همه آثار')">
      <span>همه آثار</span>
    </div>
  `;

  galleryCategories.forEach(cat => {
    const isActive = currentGalleryFilter === cat.id;
    itemsHtml += `
      <div class="cat-dropdown-item ${isActive ? 'active' : ''}" onclick="filterGalleryByCategory('${cat.id}', '${cat.title}')">
        <span>${cat.title}</span>
      </div>
    `;
  });

  dropdown.innerHTML = itemsHtml;
};

window.renderAdminGalleryCategories = function() {
  const container = document.getElementById('adminGalleryCategoriesList');
  if (!container) return;

  container.innerHTML = galleryCategories.map((cat, idx) => `
    <div style="background:#090d16; border:1px solid var(--border-subtle); border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="color:#fff; font-size:12.5px; display:block;">${cat.title}</strong>
        <span class="font-mono" style="font-size:10px; color:var(--cyan-electric);">${cat.id}</span>
      </div>
      <button type="button" onclick="adminDeleteGalleryCategory('${cat.id}')" style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; border-radius:6px; padding:4px 9px; font-size:11px; cursor:pointer;" title="حذف این دسته">
        حذف
      </button>
    </div>
  `).join('');
};

window.adminOpenAddCategoryModal = function() {
  const title = prompt('عنوان فارسی دسته‌بندی جدید را وارد کنید (مثال: تصویرسازی سه‌بعدی):');
  if (!title || !title.trim()) return;
  const cleanTitle = title.trim();

  const id = prompt('شناسه انگلیسی کوتاه دسته‌بندی را وارد کنید (مثال: 3d):', 'cat_' + Date.now().toString().slice(-4));
  if (!id || !id.trim()) return;
  const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (galleryCategories.some(c => c.id === cleanId)) {
    showToast('این شناسه قبلاً ثبت شده است.', 'error');
    return;
  }

  galleryCategories.push({ id: cleanId, title: cleanTitle });
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  renderAdminGalleryCategories();
  renderFloatingCategoryDropdown();
  showToast(`دسته‌بندی «${cleanTitle}» با موفقیت به گالری اضافه شد.`, 'success');
};

window.adminDeleteGalleryCategory = function(catId) {
  const cat = galleryCategories.find(c => c.id === catId);
  const catName = cat ? cat.title : catId;
  if (!confirm(`آیا از حذف دسته‌بندی «${catName}» اطمینان دارید؟`)) return;

  galleryCategories = galleryCategories.filter(c => c.id !== catId);
  safeSetStorage('tajinkart_gallery_categories_v1', JSON.stringify(galleryCategories));
  renderAdminGalleryCategories();
  renderFloatingCategoryDropdown();
  showToast(`دسته‌بندی «${catName}» با موفقیت حذف شد.`, 'info');
};

window.openChatConsultation = function() {
  switchView('store');
  switchStoreTab('commissions', document.querySelector('.store-dual-nav .store-dual-btn'));
  showToast('بخش مشاوره و ثبت سفارش باز شد. درخواست خود را مطرح نمایید.', 'info');
};

// اجرای لود اولیه در هنگام آماده شدن صفحه
document.addEventListener('DOMContentLoaded', () => {
  renderFloatingCategoryDropdown();
  renderAdminGalleryCategories();
  if (typeof renderAdminTgChannelsList === 'function') renderAdminTgChannelsList();
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

if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
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
      if (labelEl) labelEl.textContent = 'حساب اعضا';
      const adminGate = document.getElementById('adminLoginGate');
      const adminWorkspace = document.getElementById('adminWorkspace');
      if (adminWorkspace) adminWorkspace.classList.add('hidden');
      if (adminGate) adminGate.classList.remove('hidden');
      return;
    }

    if (session && session.user) {
      if (isRecoveryFlowActive) {
        // در حالت بازیابی رمز، نشست برای ثبت رمز آماده است اما ویو نباید به ادمین یا داشبورد بپرد
        applyLoggedInMember(session.user, false);
      } else {
        // تشخیص قطعی ورود تازه از طریق گوگل (چه توکن هنوز در هش باشد چه کلاینت آن را پردازش کرده باشد)
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
    name: isDirectorAdmin ? 'سید سروش تاج' : name,
    email: user.email,
    contact: phone || user.email,
    tier: tier,
    isDirector: isDirectorAdmin,
    isGoogleUser: isGoogleUser,
    assetsBought: meta.assetsBought || []
  };

  const labelEl = document.getElementById('rightMemberLabel');
  if (labelEl) {
    labelEl.textContent = isDirectorAdmin ? '👑 مدیر استودیو' : currentMember.name;
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
        showToast('درود بر مدیر استودیو، سید سروش تاج. پنل کنترل استودیو باز شد! 👑', 'success', 6000);
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
      showToast(`خوش آمدید، ${currentMember.name}! حساب کاربری شما با موفقیت فعال شد. ✨`, 'success', 5000);
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
      showToast('هویت شما از طریق ایمیل تایید شد. لطفاً رمز عبور جدید حسابتان را تعیین فرمایید.', 'info', 6000);
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
          colorSpace: row.color_space || 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
          lore: row.lore || 'جهان اکستوپیا',
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
const AVAILABLE_PLATFORMS = [
  { id: 'telegram', name: 'تلگرام', icon: '✈️', placeholder: 'متن و توضیحات اختصاصی برای کانال تلگرام...' },
  { id: 'artstation', name: 'آرت‌استیشن', icon: '🎨', placeholder: 'توضیحات و مشخصات تکنیکال آرت‌استیشن...' },
  { id: 'cara', name: 'کارا (Cara)', icon: '🛡️', placeholder: 'متن و کپشن پورتفولیو در پلتفرم ضد هوش‌مصنوعی کارا...' },
  { id: 'pinterest', name: 'پینترست', icon: '📌', placeholder: 'توضیحات پین، تگ‌های بصری و متادیتای پینترست...' },
  { id: 'instagram', name: 'اینستاگرام', icon: '📷', placeholder: 'کپشن، داستان شکل‌گیری اثر و هشتگ‌های اصلی اینستاگرام...' },
  { id: 'reels', name: 'اینستاگرام ریلز', icon: '🎬', placeholder: 'توضیحات و قلاب مخاطب (Hook) برای ویدیوی ریلز...' },
  { id: 'threads', name: 'تردز (Threads)', icon: '🧵', placeholder: 'متن گفت‌وگومحور و روایت کانسپت در تردز...' },
  { id: 'reddit', name: 'ردیت (Reddit)', icon: '🤖', placeholder: 'عنوان تاپیک، ساب‌ردیت و توضیحات سابمیشن ردیت...' },
  { id: 'x', name: 'توییتر (X)', icon: '🐦', placeholder: 'متن خلاصه توییت (زیر ۲۸۰ کاراکتر) و هشتگ‌ها...' },
  { id: 'bluesky', name: 'بلواسکای', icon: '🦋', placeholder: 'متن پست در شبکه غیرمتمرکز بلواسکای...' },
  { id: 'shorts', name: 'یوتیوب شورتس', icon: '📹', placeholder: 'عنوان و توضیحات ویدیوی شورتس در چنل یوتیوب...' },
  { id: 'discord', name: 'دیسکورد', icon: '🎮', placeholder: 'پیام مخابره به روم شوکیس کامیونیتی دیسکورد...' },
  { id: 'linkedin', name: 'لینکدین', icon: '💼', placeholder: 'متن بیزینس و کاربرد تجاری اثر در لینکدین...' }
];

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
    <!-- ستون ۱: لیست عمودی شیک و قابل اسکرول پلتفرم‌ها (طرح منوی تاج‌اینک‌آرت) -->
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
            <input type="checkbox" onclick="event.stopPropagation()" onchange="togglePhaseSocialPlatform(${idx}, '${plat.id}', this.checked)" ${isChecked ? 'checked' : ''} style="accent-color:var(--gold); cursor:pointer; width:15px; height:15px;" title="فعال/غیرفعال کردن ارسال به ${plat.name}" />
          </div>
        `;
      }).join('')}
    </div>

    <!-- ستون ۲: باکس تنظیمات و متن کاملاً اختصاصی پلتفرم انتخاب شده -->
    <div style="background:#04060c; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; flex-wrap:wrap; gap:6px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="font-size:18px;">${activePlat.icon}</span>
          <span style="font-size:12.5px; font-weight:800; color:var(--gold);">تنظیمات و متن اختصاصی ${activePlat.name}</span>
        </div>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; cursor:pointer; color:${isCurrentPlatChecked ? 'var(--gold)' : 'var(--text-muted)'}; background:rgba(255,255,255,0.04); padding:4px 10px; border-radius:6px; border:1px solid ${isCurrentPlatChecked ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.08)'};">
          <input type="checkbox" onchange="togglePhaseSocialPlatform(${idx}, '${activePlat.id}', this.checked)" ${isCurrentPlatChecked ? 'checked' : ''} style="accent-color:var(--gold); cursor:pointer;" />
          <span style="font-weight:700;">ارسال این شیت به ${activePlat.name}</span>
        </label>
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">متن / کپشن اختصاصی برای ${activePlat.name}:</label>
        <textarea rows="3" placeholder="${activePlat.placeholder}" oninput="setPhaseSocialCaption(${idx}, '${activePlat.id}', this.value)" style="font-size:11.5px; padding:8px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a14; width:100%; box-sizing:border-box;">${(p.socialCaptions && p.socialCaptions[activePlat.id]) || ''}</textarea>
      </div>

      <!-- تنظیمات انحصاری برای تلگرام -->
      ${activePlat.id === 'telegram' ? `
        <div style="background:rgba(0,240,255,0.04); border:1px dashed rgba(0,240,255,0.25); border-radius:8px; padding:10px 12px; margin-top:2px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:11.5px; color:var(--cyan-electric); font-weight:700;">
            <input type="checkbox" onchange="setPhaseTelegramButton(${idx}, this.checked)" ${p.tgIncludeButton ? 'checked' : ''} style="accent-color:var(--cyan-electric); cursor:pointer; width:16px; height:16px;" />
            <span>افزودن دکمه شیشه‌ای لینک مستقیم به همین اثر در سایت (انحصاری همین اثر)</span>
          </label>
          <p style="font-size:10px; color:var(--text-muted); margin:4px 0 0 24px;">در صورت غیرفعال بودن، پیام تلگرام بدون هیچ دکمه‌ای در زیر پست ارسال می‌شود.</p>
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
    badgeEl.textContent = activeSocials.length > 0 ? `${activeSocials.length} شبکه فعال (${activeSocials.join('، ')})` : 'توزیع خودکار: خاموش';
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

function renderStagingPhasesHtml() {
  if (!stagingProjectPhases || stagingProjectPhases.length === 0) {
    return `<div style="font-size:12px; color:var(--text-muted); padding:20px; text-align:center; background:#04060a; border-radius:10px; border:1px dashed rgba(255,255,255,0.15);">
      هیچ شیتی وجود ندارد. روی دکمه «+ افزودن شیت تکمیلی به این اثر» کلیک کنید.
    </div>`;
  }

  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};

  return stagingProjectPhases.map((p, idx) => {
    const pipeKey = p.pipelineKey || 'sketch1';
    const subcats = (pipelines[pipeKey] && pipelines[pipeKey].subcategories) ? pipelines[pipeKey].subcategories : ['طراحی و اجرای استاندارد'];
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
        
        <!-- پیش‌نمایش واقعی تصویر یا کادر بارگذاری فایل -->
        ${hasImage ? `
          <div style="background:rgba(0,0,0,0.65); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.18)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'}; border:1px solid ${isCover ? 'rgba(250,204,21,0.35)' : 'rgba(0,240,255,0.3)'};">
                ${isCover ? '🖼️ کاور اصلی و تصویر شاخص پروژه (شیت ۱)' : `شیت تکمیلی شماره ${idx + 1}`}
              </span>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" onclick="document.getElementById('phaseFileInput_${idx}').click()" class="btn-secondary" style="font-size:11px; padding:4px 12px; border-color:rgba(255,255,255,0.25); cursor:pointer;">
                  🔄 تغییر تصویر
                </button>
                ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:3px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="حذف این شیت">✕</button>` : ''}
              </div>
              <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />
            </div>

            <!-- نمایش ابعاد ارگانیک اثر با کادر فاخر -->
            <div style="position:relative; width:100%; max-height:280px; min-height:160px; background:#020306; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;">
              <img src="${imgSrc}" style="max-width:100%; max-height:268px; width:auto; height:auto; object-fit:contain; display:block; border-radius:8px;" alt="پیش‌نمایش اثر" />
            </div>

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">عنوان این شیت:</label>
              <input type="text" value="${p.name || ''}" placeholder="عنوان دقیق این فاز (مثال: مدل‌شیت سه‌نما / طراحی مسکات / اثر نهایی)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px; background:rgba(250,204,21,0.03); border:1.5px dashed ${isCover ? 'rgba(250,204,21,0.6)' : 'rgba(0,240,255,0.5)'}; border-radius:12px; padding:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span class="font-mono" style="font-size:10.5px; padding:3px 10px; border-radius:6px; font-weight:800; background:${isCover ? 'rgba(250,204,21,0.15)' : 'rgba(0,240,255,0.15)'}; color:${isCover ? 'var(--gold)' : 'var(--cyan-electric)'};">
                ${isCover ? '🖼️ کاور اصلی و تصویر شاخص پروژه (شیت ۱)' : `شیت شماره ${idx + 1}`}
              </span>
              ${stagingProjectPhases.length > 1 ? `<button type="button" onclick="removeStagingPhase(${idx})" style="color:var(--crimson); font-size:18px; padding:2px 8px; cursor:pointer; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px;" title="حذف این شیت">✕</button>` : ''}
            </div>

            <div onclick="document.getElementById('phaseFileInput_${idx}').click()" style="cursor:pointer; background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:26px 16px; text-align:center; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.12)'">
              <div style="font-size:32px; margin-bottom:6px;">📁</div>
              <div style="font-size:13px; font-weight:800; color:var(--gold);">کلیک کنید تا تصویر ${isCover ? 'کاور اصلی اثر' : 'این شیت'} را از سیستم انتخاب و بارگذاری کنید</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">پشتیبانی از فرمت‌های JPG, PNG, WEBP با حفظ ابعاد واقعی تصویر و بهینه‌سازی خودکار</div>
            </div>
            <input type="file" id="phaseFileInput_${idx}" accept="image/*" style="display:none;" onchange="handlePhaseImageUpload(${idx}, this)" />

            <div>
              <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">عنوان این شیت:</label>
              <input type="text" value="${p.name || ''}" placeholder="عنوان شیت (مثال: تصویر نهایی اثر / کانسپت)..." onchange="stagingProjectPhases[${idx}].name = this.value.trim()" style="font-size:12px; font-weight:700; padding:7px 12px; margin:0;" />
            </div>
          </div>
        `}

        <!-- انتخاب مستقل پایپلاین و زیرشاخه اختصاصی برای این فریم مشخص -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div>
            <label style="font-size:10.5px; color:var(--gold); font-weight:700; display:block; margin-bottom:2px;">پایپلاین اختصاصی این عکس:</label>
            <select onchange="handlePhasePipelineChange(${idx}, this.value)" style="font-size:11px; padding:5px 8px; margin:0; width:100%;">
              <option value="sketch1" ${pipeKey === 'sketch1' ? 'selected' : ''}>کاراکتر و شخصیت</option>
              <option value="sketch_creature" ${pipeKey === 'sketch_creature' ? 'selected' : ''}>موجودات و هیولاها</option>
              <option value="sketch2" ${pipeKey === 'sketch2' ? 'selected' : ''}>فضا و معماری دنیا</option>
              <option value="sketch3" ${pipeKey === 'sketch3' ? 'selected' : ''}>کاور و کی‌فریم</option>
              <option value="sketch4" ${pipeKey === 'sketch4' ? 'selected' : ''}>تجهیزات، پراپ و UI</option>
              <option value="sketch5" ${pipeKey === 'sketch5' ? 'selected' : ''}>کمیک و استوری‌بورد</option>
            </select>
          </div>
          <div>
            <label style="font-size:10.5px; color:var(--cyan-electric); font-weight:700; display:block; margin-bottom:2px;">زیرشاخه اختصاصی سفارش:</label>
            <select onchange="stagingProjectPhases[${idx}].subcategory = this.value" style="font-size:11px; padding:5px 8px; margin:0; width:100%;">
              ${subcats.map(s => `<option value="${s}" ${currentSub === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <textarea rows="2" placeholder="توضیحات تخصصی این فاز (کاربرد صنعتی، تفاوت با اثر پایه و چرایی هزینه مستقل)..." onchange="stagingProjectPhases[${idx}].desc = this.value.trim()" style="font-size:11px; padding:6px 10px; margin:0; line-height:1.6; resize:vertical; background:#070a12;">${p.desc || p.description || ''}</textarea>

        <!-- مقاصد انتشار چندکاناله استودیو (دراور شیک و اسکرول‌پذیر با باکس متن کاملاً اختصاصی هر شبکه) -->
        <details id="phaseSocialDetails_${idx}" ontoggle="stagingProjectPhases[${idx}].isSocialOpen = this.open" ${p.isSocialOpen ? 'open' : ''} style="background:#070a14; border:1px solid rgba(250,204,21,0.25); border-radius:12px; padding:10px 14px; margin-top:2px;">
          <summary style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; user-select:none; outline:none;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11.5px; color:var(--gold); font-weight:800;">📡 مقاصد انتشار در شبکه‌ها (توزیع اختصاصی این شیت):</span>
              <span id="phaseSocialBadge_${idx}" class="font-mono" style="font-size:9.5px; color:${activeSocials.length > 0 ? 'var(--gold)' : 'var(--text-muted)'}; background:${activeSocials.length > 0 ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)'}; padding:2px 8px; border-radius:4px;">
                ${activeSocials.length > 0 ? `${activeSocials.length} شبکه فعال (${activeSocials.join('، ')})` : 'توزیع خودکار: خاموش'}
              </span>
            </div>
            <span style="font-size:11px; color:var(--cyan-electric); font-weight:800; display:flex; align-items:center; gap:5px;">
              <span>مدیریت شبکه‌ها</span>
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
  const defSub = (pipelines[defPipe] && pipelines[defPipe].subcategories) ? pipelines[defPipe].subcategories[0] : 'طراحی و اجرای استاندارد';

  stagingProjectPhases.push({
    name: `شیت تکمیلی ${nextNum}`,
    img: '',
    image: '',
    pipelineKey: defPipe,
    subcategory: defSub,
    desc: '',
    customCaption: '',
    socialTelegram: false
  });
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhasePipelineChange = function(idx, newPipe) {
  if (!stagingProjectPhases || !stagingProjectPhases[idx]) return;
  stagingProjectPhases[idx].pipelineKey = newPipe;
  const pipelines = typeof PIPELINE_DATA !== 'undefined' ? PIPELINE_DATA : {};
  const subcats = (pipelines[newPipe] && pipelines[newPipe].subcategories) ? pipelines[newPipe].subcategories : ['طراحی و اجرای استاندارد'];
  stagingProjectPhases[idx].subcategory = subcats[0] || '';
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.removeStagingPhase = function(idx) {
  if (stagingProjectPhases.length <= 1) {
    stagingProjectPhases[0].img = '';
    stagingProjectPhases[0].image = '';
    stagingProjectPhases[0].name = 'کاور و شیت اصلی اثر';
  } else {
    stagingProjectPhases.splice(idx, 1);
  }
  const container = document.getElementById('adminProjectPhasesList');
  if (container) container.innerHTML = renderStagingPhasesHtml();
};

window.handlePhaseImageUpload = async function(idx, inputEl) {
  if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  showToast('در حال بارگذاری و پردازش تصویر...', 'info', 2500);

  try {
    let cloudUrl = await uploadFileToCloudinary(file);
    if (cloudUrl) {
      if (stagingProjectPhases[idx]) {
        stagingProjectPhases[idx].img = cloudUrl;
        stagingProjectPhases[idx].image = cloudUrl;
      }
      const container = document.getElementById('adminProjectPhasesList');
      if (container) container.innerHTML = renderStagingPhasesHtml();
      showToast('تصویر با موفقیت در فضای ابری کلودیناری بارگذاری شد!', 'success');
      return;
    }

    const compressed = await compressImageForStorage(file, 1600, 1600, 0.82);
    if (stagingProjectPhases[idx]) {
      stagingProjectPhases[idx].img = compressed;
      stagingProjectPhases[idx].image = compressed;
    }
    const container = document.getElementById('adminProjectPhasesList');
    if (container) container.innerHTML = renderStagingPhasesHtml();
    showToast('تصویر با کیفیت عالی آماده و ذخیره شد.', 'success');
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
      showToast('تصویر بارگذاری شد.', 'success');
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
    showToast('لطفاً حداقل یک تصویر برای پروژه اضافه کنید.', 'error');
    return;
  }

  // بررسی وجود حداقل یک تصویر معتبر
  const validPhases = stagingProjectPhases.filter(p => Boolean(p.img || p.image));
  if (validPhases.length === 0) {
    showToast('لطفاً تصویر کاور اصلی اثر را انتخاب و بارگذاری کنید.', 'error', 5000);
    return;
  }

  const primaryPhase = validPhases[0];
  const img = primaryPhase.img || primaryPhase.image || '';
  const pipe = primaryPhase.pipelineKey || 'sketch1';
  const cat = PIPELINE_TO_CATEGORY_MAP[pipe] || 'character';
  const colorSpace = 'مستر 4K / ۱۶ بیتی ProPhoto RGB';

  try {
    const assembledPhases = JSON.parse(JSON.stringify(validPhases));

    if (isCreatingNewArt && stagingNewArt) {
      const newArtRecord = {
        id: stagingNewArt.id || Date.now(),
        tag: cat,
        category: cat,
        shortSlug: slug || stagingNewArt.shortSlug || title || 'کانسپت جدید',
        title: title || 'کانسپت جدید استودیو',
        desc: desc,
        isProductionPack: isPack,
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
      showToast('اثر جدید با موفقیت به گالری اضافه شد!', 'success');

      // توزیع چندکاناله و مقاصد انتشار (زیرساخت POSSE):
      // بررسی تک‌تک فازها/شیت‌ها؛ هر شیتی که تیک تلگرام داشته باشد مخابره می‌شود
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
          else showToast('اثر جدید در دیتابیس ابری ثبت و همگام شد!', 'success');
        });
      }
    } else if (showcaseArtworks[currentSelectedArtIdx]) {
      const art = showcaseArtworks[currentSelectedArtIdx];
      art.title = title || art.title;
      art.shortSlug = slug || art.shortSlug;
      art.tag = cat;
      art.category = cat;
      art.pipelineKey = pipe;
      art.image = img;
      art.desc = desc;
      art.isProductionPack = isPack;
      art.phases = assembledPhases;

      safeSetStorage(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      closeAdminArtEditor();
      renderShowcaseGrid();
      renderAdminSketch2();
      showToast('تغییرات پروژه با موفقیت ذخیره شد!', 'success');

      // در زمان ویرایش اثر، به درخواست مدیر استودیو هیچ پیامی به شبکه‌ها یا تلگرام ارسال نمی‌شود تا تکراری نباشد.

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
  if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories();
  if (typeof renderAdminTgChannelsList === 'function') renderAdminTgChannelsList();
  const rateEl = document.getElementById('setUsdRate');
  if (rateEl) rateEl.value = siteSettings.usdRate || 72000;
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
function renderShowcaseGrid() {
  const grid = document.getElementById('showcaseGrid');
  if (!grid) return;

  const filteredArtworks = (currentGalleryFilter && currentGalleryFilter !== 'all')
    ? showcaseArtworks.filter(art => {
        // ۱. بررسی تطابق مستقیم دسته‌بندی و پایپلاین کاور اصلی پروژه
        const cat = art.category || art.tag || (art.pipelineKey ? (PIPELINE_TO_CATEGORY_MAP[art.pipelineKey] || 'character') : 'character');
        const pipe = art.pipelineKey;
        const mainMatch = cat === currentGalleryFilter || 
                          pipe === currentGalleryFilter || 
                          (PIPELINE_TO_CATEGORY_MAP[pipe] && PIPELINE_TO_CATEGORY_MAP[pipe] === currentGalleryFilter) ||
                          art.tag === currentGalleryFilter;
        if (mainMatch) return true;

        // ۲. فیلتر عمیق شیت‌ها و فازهای الحاقی (Deep Supplemental Phase Matching):
        // حتی اگر اثر در شاخه کاراکتر باشد اما شیت دوم/سوم آن فضاسازی یا پراپ باشد، در دسته‌بندی مربوطه کشف می‌شود
        if (art.phases && Array.isArray(art.phases) && art.phases.length > 0) {
          return art.phases.some(p => {
            const pPipe = p.pipelineKey;
            const pCat = pPipe ? (PIPELINE_TO_CATEGORY_MAP[pPipe] || '') : '';
            const pSub = p.subcategory || '';
            if (pCat === currentGalleryFilter || pPipe === currentGalleryFilter) return true;
            if (currentGalleryFilter === 'environment' && (pSub.includes('محیط') || pSub.includes('فضا') || pSub.includes('معماری'))) return true;
            if (currentGalleryFilter === 'character' && (pSub.includes('کاراکتر') || pSub.includes('شخصیت') || pSub.includes('مسکات') || pSub.includes('Mascot'))) return true;
            if (currentGalleryFilter === 'creature' && (pSub.includes('موجود') || pSub.includes('هیولا') || pSub.includes('باس'))) return true;
            if (currentGalleryFilter === 'keyframe' && (pSub.includes('کی‌فریم') || pSub.includes('کاور') || pSub.includes('اسپلش'))) return true;
            if (currentGalleryFilter === 'props' && (pSub.includes('پراپ') || pSub.includes('سلاح') || pSub.includes('UI'))) return true;
            if (currentGalleryFilter === 'comic' && (pSub.includes('کمیک') || pSub.includes('استوری‌بورد'))) return true;
            return false;
          });
        }
        return false;
      })
    : showcaseArtworks;

  if (filteredArtworks.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); width: 100%;">
        <p style="font-size: 15px; margin-bottom: 12px; color: #fff;">اثری در این دسته‌بندی یافت نشد.</p>
        <button onclick="filterGalleryByCategory('all', 'همه آثار')" class="btn-gold" style="font-size: 12px; padding: 7px 16px;">نمایش تمام آثار گالری</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredArtworks.map((art, i) => {
    const spanClass = getAutoSpanClass(art);
    const richAlt = `${art.title} — کانسپت آرت و طراحی دنیا استودیو TAJINKART`;
    const imgSrc = art.image || art.img || '';

    // جلوگیری از تکرار عبارت یکسان در اسلاگ و عنوان
    let slug = art.shortSlug || '';
    if (!slug || slug === art.title) {
      slug = art.tag ? art.tag.toUpperCase() : 'CONCEPT';
    }

    let tileImg = imgSrc;
    let targetPhaseIdx = 0;
    let displayTitle = art.title;
    let displaySlug = slug;
    let activeKey = art.tag || art.category || art.pipelineKey || 'character';

    // تایل داینامیک: اگر دسته‌بندی خاصی فیلتر شده و شیت دوم یا سوم به آن تعلق دارد، تایل همان شیت، عنوان و رنگ نئون آن را می‌گیرد
    if (currentGalleryFilter && currentGalleryFilter !== 'all' && art.phases && Array.isArray(art.phases)) {
      const matchIdx = art.phases.findIndex((p, pIdx) => {
        const pPipe = p.pipelineKey;
        const pCat = pPipe ? (PIPELINE_TO_CATEGORY_MAP[pPipe] || '') : '';
        const pSub = p.subcategory || '';
        if (pCat === currentGalleryFilter || pPipe === currentGalleryFilter) return true;
        if (currentGalleryFilter === 'environment' && (pSub.includes('محیط') || pSub.includes('فضا') || pSub.includes('معماری'))) return true;
        if (currentGalleryFilter === 'character' && (pSub.includes('کاراکتر') || pSub.includes('شخصیت') || pSub.includes('مسکات') || pSub.includes('Mascot'))) return true;
        if (currentGalleryFilter === 'creature' && (pSub.includes('موجود') || pSub.includes('هیولا') || pSub.includes('باس'))) return true;
        if (currentGalleryFilter === 'keyframe' && (pSub.includes('کی‌فریم') || pSub.includes('کاور') || pSub.includes('اسپلش'))) return true;
        if (currentGalleryFilter === 'props' && (pSub.includes('پراپ') || pSub.includes('سلاح') || pSub.includes('UI'))) return true;
        if (currentGalleryFilter === 'comic' && (pSub.includes('کمیک') || pSub.includes('استوری‌بورد'))) return true;
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
    const neonMap = {
      'character': { border: '#facc15', glow: 'rgba(250, 204, 21, 0.65)', soft: 'rgba(250, 204, 21, 0.25)' },
      'sketch1': { border: '#facc15', glow: 'rgba(250, 204, 21, 0.65)', soft: 'rgba(250, 204, 21, 0.25)' },
      'creature': { border: '#ef4444', glow: 'rgba(239, 68, 68, 0.72)', soft: 'rgba(239, 68, 68, 0.28)' },
      'sketch_creature': { border: '#ef4444', glow: 'rgba(239, 68, 68, 0.72)', soft: 'rgba(239, 68, 68, 0.28)' },
      'environment': { border: '#00f0ff', glow: 'rgba(0, 240, 255, 0.72)', soft: 'rgba(0, 240, 255, 0.28)' },
      'sketch2': { border: '#00f0ff', glow: 'rgba(0, 240, 255, 0.72)', soft: 'rgba(0, 240, 255, 0.28)' },
      'keyframe': { border: '#c084fc', glow: 'rgba(192, 132, 252, 0.75)', soft: 'rgba(192, 132, 252, 0.3)' },
      'sketch3': { border: '#c084fc', glow: 'rgba(192, 132, 252, 0.75)', soft: 'rgba(192, 132, 252, 0.3)' },
      'props': { border: '#fbbf24', glow: 'rgba(251, 191, 36, 0.72)', soft: 'rgba(251, 191, 36, 0.28)' },
      'sketch4': { border: '#fbbf24', glow: 'rgba(251, 191, 36, 0.72)', soft: 'rgba(251, 191, 36, 0.28)' },
      'comic': { border: '#38bdf8', glow: 'rgba(56, 189, 248, 0.72)', soft: 'rgba(56, 189, 248, 0.28)' },
      'sketch5': { border: '#38bdf8', glow: 'rgba(56, 189, 248, 0.72)', soft: 'rgba(56, 189, 248, 0.28)' }
    };
    const neon = neonMap[activeKey] || neonMap['character'];

    return `
      <div class="mosaic-tile ${spanClass}" id="galleryTile_${art.id}" 
           style="--neon-border:${neon.border}; --neon-glow:${neon.glow}; --neon-soft:${neon.soft};" 
           onclick="openArtModalWithPhase(${art.id}, ${targetPhaseIdx})">
        <div class="tile-center-title">
          <span class="tile-slug" style="color:${neon.border}; text-shadow:0 0 12px ${neon.glow};">/ ${displaySlug} /</span>
          <span class="tile-divider" style="background:${neon.border}; box-shadow:0 0 12px ${neon.glow};"></span>
          <span class="tile-sub">${displayTitle}</span>
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
  showToast('پکیج کامل پروداکشن این اثر در محاسبه‌گر آتلیه بارگذاری شد.', 'success', 4500);
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

  const mainTitle = art.title || 'کانسپت بدون عنوان';
  const mainDesc = art.desc || 'کانسپت آرت و طراحی اختصاصی استودیو تاج‌اینک‌آرت.';
  const mainPipe = art.pipelineKey || 'sketch1';
  const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[mainPipe]) ? PIPELINE_DATA[mainPipe] : { topSub: 'آتلیه کانسپت آرت' };
  const mainPipeName = pipeData.topSub;
  const artLore = art.lore || 'جهان اکستوپیا';

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
      phaseNum: '۰۱',
      desc: mainDesc,
      pipe: mainPipe,
      sub: ''
    });
  }

  if (art.phases && Array.isArray(art.phases) && art.phases.length > 0) {
    art.phases.forEach((p, pIdx) => {
      const pSrc = p.img || p.image;
      if (pSrc && pSrc !== mainSrc) {
        const phaseName = p.name || `شیت پروژه • فاز ${imageList.length + 1}`;
        const phaseDesc = p.desc || p.description || p.note || '';
        const phasePipe = p.pipelineKey || mainPipe;
        const phaseSub = p.subcategory || '';
        imageList.push({
          src: pSrc,
          name: phaseName,
          phaseNum: (imageList.length + 1 < 10 ? `۰${imageList.length + 1}` : `${imageList.length + 1}`),
          desc: phaseDesc,
          pipe: phasePipe,
          sub: phaseSub
        });
      }
    });
  }

  // رندر تک‌تک فریم‌های استریم عمودی همراه با یادداشت‌های فنی بین تصاویر
  imageList.forEach((item, idx) => {
    const pipeInfo = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[item.pipe]) ? PIPELINE_DATA[item.pipe].topSub : 'آتلیه طراحی';
    streamHtml += `
      <div class="artstation-img-card project-stream-item" 
           data-index="${idx}"
           data-title="${escapeQuotes(item.name)}">
        <img src="${item.src}" alt="${item.name}" loading="${idx === 0 ? 'eager' : 'lazy'}" class="elastic-pinch-target" onclick="toggleImageZoom(this, event)" title="کلیک برای بزرگنمایی و زوم اثر" />
        <div class="stream-phase-note">
          <h3 class="stream-phase-title">${item.phaseNum} • ${item.name}</h3>
          ${item.desc ? `<p class="stream-phase-desc">${item.desc}</p>` : ''}
          <div class="stream-phase-meta-footer">
            <span class="stream-phase-pipe font-mono">${pipeInfo}${item.sub ? ` • ${item.sub}` : ''}</span>
          </div>
        </div>
      </div>
    `;
  });

  // ۳. کارت باوقار سفارش پکیج کامل در انتهای اثر (در صورت فعال بودن در اثر)
  if (art.isProductionPack !== false) {
    streamHtml += `
      <div class="production-pack-card">
        <span class="pack-badge font-mono">/ COMPLETE PRODUCTION PACK /</span>
        <h3 class="pack-title">سفارش پکیج کامل این پروژه</h3>
        <p class="pack-desc">تولید کامل این زنجیره کانسپت (شامل تمامی اتودها، مدل‌شیت‌ها و فضاسازی‌های این اثر) به صورت یکپارچه با فرمول تعرفه آتلیه.</p>
        <button type="button" onclick="orderProjectPack('${art.id}')" class="btn-gold pack-order-btn">
          سفارش این پکیج در محاسبه‌گر آتلیه ←
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
  // غیرفعال در موبایل جهت ممانعت از قفل شدن تصویر؛ در موبایل فقط زوم لمسی الاستیک اینستاگرام عمل می‌کند
  if (window.innerWidth <= 992 || (e && e.pointerType === 'touch')) return;
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

// closeArtModalDirect handled uniformly above

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
      isProductionPack: document.getElementById('editArtIsPackCheckbox') ? document.getElementById('editArtIsPackCheckbox').checked : true,
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
      <input type="text" value="${escapeQuotes(ch)}" placeholder="مثال: @tajinkart یا -100123456789 یا 12345678" class="font-mono tg-channel-input" style="flex:1; font-size:11.5px; padding:8px 10px; background:#04060a; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:#fff; box-sizing:border-box;" oninput="updateTgChannelVal(${idx}, this.value)" />
      ${siteSettings.tgChannels.length > 1 ? `
        <button type="button" onclick="removeTgChannel(${idx})" style="color:var(--crimson); background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:6px; font-size:15px; padding:6px 10px; cursor:pointer;" title="حذف این کانال">✕</button>
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
  showToast('تنظیمات ربات و کانال‌های تلگرام با موفقیت ثبت و ذخیره شد! ✓', 'success', 4000);
};


window.autoDetectTelegramChannelId = async function() {
  const token = document.getElementById('setTgToken')?.value.trim() || siteSettings.tgToken;
  if (!token) {
    showToast('لطفاً ابتدا توکن ربات تلگرام را وارد کنید.', 'error', 4500);
    return;
  }

  showToast('در حال استعلام و شناسایی خودکار کانال‌های متصل به ربات...', 'info', 3000);

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await resp.json();

    if (!data.ok) {
      showToast(`خطای تلگرام: ${data.description || 'توکن نامعتبر است'}`, 'error', 5000);
      return;
    }

    const detected = [];
    const seen = new Set();

    (data.result || []).forEach(u => {
      const ch = u.my_chat_member?.chat || u.channel_post?.chat || u.message?.chat;
      if (ch && ch.id && !seen.has(ch.id)) {
        seen.add(ch.id);
        detected.push({ id: String(ch.id), title: ch.title || ch.username || ch.first_name || 'کانال' });
      }
    });

    if (detected.length > 0) {
      siteSettings.tgChannels = detected.map(d => d.id);
      siteSettings.tgChat = detected[0].id;
      renderAdminTgChannelsList();
      saveTelegramSettingsDirect();
      showToast(`کانال «${detected[0].title}» با شناسه عددی ${detected[0].id} شناسایی و ذخیره شد! 🎉`, 'success', 6000);
    } else {
      showToast('کانال یافت نشد! لطفاً یک پیام دلخواه داخل کانال بفرستید، سپس دوباره این دکمه را بزنید.', 'info', 7000);
    }
  } catch(e) {
    showToast('خطا در ارتباط با سرور تلگرام (بررسی فیلترشکن).', 'error', 5000);
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
    showToast('لطفاً ابتدا توکن ربات و حداقل یک آیدی کانال یا چت تلگرام را وارد کنید.', 'error', 4500);
    return;
  }

  showToast(`در حال ارسال پیام تست به ${channels.length} کانال/چت تلگرام...`, 'info', 3000);

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
      const testMsg = `👑 *تست اتصال موفق وب‌سایت TAJINKART*\n\n` +
                      `ربات رسمی *@tajinkart_bot* با موفقیت به وب‌سایت استودیو متصل گردید.\n` +
                      `سیستم آماده توزیع خودکار کانسپت‌ها و دریافت هشدارهای سفارش‌های جدید است!\n\n` +
                      `🌐 [ورود به سایت رسمی استودیو](https://tajinkart.github.io)`;

      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat,
          text: testMsg,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: "🎨 ورود به آتلیه رسمی", url: "https://tajinkart.github.io" }
            ]]
          }
        })
      });

      const res = await resp.json();
      if (res.ok) {
        successCount++;
      } else {
        lastError = res.description || 'نامشخص';
      }
    } catch(e) {
      lastError = e.message || 'خطای شبکه';
    }
  }

  if (successCount > 0) {
    showToast(`پیام تست با موفقیت به ${successCount} مقصد تلگرام ارسال شد! 🎉`, 'success', 5000);
  } else {
    showToast(`خطای تلگرام: ${lastError}`, 'error', 6000);
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
  const title = phase.name || art.title || 'کانسپت جدید استودیو TAJINKART';
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
        { text: "👁️ مشاهده این اثر در گالری TAJINKART", url: `https://tajinkart.github.io/?art=${art.id}` }
      ]]
    });
  }

  showToast(`در حال مخابره شیت «${title}» به تلگرام...`, 'info', 2500);

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
        showToast(`شیت «${title}» با موفقیت به تلگرام ارسال شد! ✈️`, 'success', 5000);
      } else {
        console.warn('[Telegram Error Details]:', resData);
        showToast(`خطای تلگرام: ${resData.description || 'عدم دسترسی به کانال'}`, 'error', 6500);
      }
    } catch(err) {
      console.warn('Telegram broadcast network error:', err);
      showToast('خطای شبکه در ارتباط با سرور تلگرام (بررسی فیلترشکن).', 'error', 5000);
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
  document.body.setAttribute('data-view', vKey);
  if (typeof unlockBodyScroll === 'function') unlockBodyScroll();
  const openArtModal = document.getElementById('artDetailModal');
  if (openArtModal) {
    openArtModal.classList.remove('active');
    openArtModal.style.display = 'none';
  }
  currentView = vKey;
  document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(`view-${vKey}`);
  if (target) target.classList.remove('hidden');

  const topBar = document.getElementById('topCenterBrandBar');
  const dock = document.getElementById('rightVerticalNav');
  const homeBtn = document.getElementById('rightDockHomeBtn');

  // آپدیت وضعیت دکمه‌های ناوبری موبایل
  if (dock) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
  }

  const catMenu = document.getElementById('floatingGalleryCategoryMenu');
  if (vKey === 'showcase') {
    if (catMenu) catMenu.style.display = 'block';
    renderShowcaseGrid();
    if (homeBtn) homeBtn.classList.add('hidden');
    if (window.scrollY <= 140) {
      if (dock) dock.classList.remove('dock-collapsed');
      if (topBar) topBar.classList.remove('visible');
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
  const topBar = document.getElementById('topCenterBrandBar');
  const hero = document.getElementById('stickyBrandHero');

  if (currentView === 'showcase') {
    const scrolled = window.scrollY || window.pageYOffset || 0;

    // بارگذاری سریع و بدون معطلی نشان برند و دسته بندی در اولین حرکت اسکرول
    if (scrolled > 40) {
      if (dock) dock.classList.add('dock-collapsed');
      if (topBar) topBar.classList.add('visible');
      const catMenu = document.getElementById('floatingGalleryCategoryMenu');
      if (catMenu) catMenu.classList.add('visible');
    } else {
      if (dock) {
        dock.classList.remove('dock-collapsed');
        dock.classList.remove('dock-open');
      }
      if (topBar) topBar.classList.remove('visible');
      const catMenu = document.getElementById('floatingGalleryCategoryMenu');
      if (catMenu) catMenu.classList.remove('visible');
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
        if (scrolled < 300) {
          const opacity = Math.max(1 - (scrolled / 260), 0.25);
          hero.style.opacity = opacity;
        } else {
          hero.style.opacity = '0.25';
        }
      }
    }
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
    showToast('پنل مدیریت استودیو باز شد.', 'info');
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
    showToast('جهت خروج از این بخش، لطفاً رمز جدید تعیین کنید یا دکمه انصراف را در پایین فرم بزنید.', 'info', 4000);
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
    showToast('جهت تکمیل، لطفاً رمز عبور جدید را وارد کنید یا روی دکمه «انصراف» بزنید.', 'info', 4000);
    return;
  }
  closeMemberModal();
};

window.cancelPasswordReset = async function() {
  if (confirm('آیا از فرآیند تعیین رمز انصراف می‌دهید؟\nدر این صورت رمز عبور قبلی شما تغییری نخواهد کرد.')) {
    isRecoveryFlowActive = false;
    sessionStorage.removeItem('tajinkart_recovering_password');
    if (window.supabaseClient && window.supabaseClient.auth) {
      try { await window.supabaseClient.auth.signOut(); } catch(e) {}
    }
    currentMember = null;
    const labelEl = document.getElementById('rightMemberLabel');
    if (labelEl) labelEl.textContent = 'حساب اعضا';

    const adminGate = document.getElementById('adminLoginGate');
    const adminWorkspace = document.getElementById('adminWorkspace');
    if (adminWorkspace) adminWorkspace.classList.add('hidden');
    if (adminGate) adminGate.classList.remove('hidden');

    const modal = document.getElementById('memberModal');
    if (modal) modal.style.display = 'none';
    switchView('showcase');
    try { window.history.replaceState(null, '', window.location.pathname); } catch(e) {}
    showToast('فرآیند بازیابی لغو شد.', 'info');
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
  if (labelEl) labelEl.textContent = 'حساب اعضا';

  const adminWorkspace = document.getElementById('adminWorkspace');
  const adminGate = document.getElementById('adminLoginGate');
  if (adminWorkspace) adminWorkspace.classList.add('hidden');
  if (adminGate) adminGate.classList.remove('hidden');

  switchView('showcase');
  showToast('از حساب مدیریت خارج شدید و پنل استودیو قفل شد.', 'info', 4000);
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

  if (tabKey === 'artworks') { renderAdminSketch2(); if (typeof renderAdminGalleryCategories === 'function') renderAdminGalleryCategories(); }
  if (tabKey === 'pipelines') renderAdminSketch1();
  if (tabKey === 'products') renderAdminProductsTab();
  if (tabKey === 'members') renderAdminSketch3();
  if (tabKey === 'orders') renderAdminLists();
  if (tabKey === 'settings') renderAdminSettingsTab();
  if (tabKey === 'terms') renderAdminTerms();
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
         data-admin-idx="${idx}"
         draggable="true"
         ondragstart="isDraggingAdminCard = true; handleAdminArtDragStart(event, ${idx})"
         ondragover="handleAdminArtDragOver(event)"
         ondragenter="handleAdminArtDragEnter(event, ${idx})"
         ondragleave="handleAdminArtDragLeave(event, ${idx})"
         ondrop="handleAdminArtDrop(event, ${idx})"
         ondragend="setTimeout(() => { isDraggingAdminCard = false; }, 150); handleAdminArtDragEnd(event)"
         onclick="handleAdminCardClick(event, ${idx})" 
         title="با انگشت شست یا اشاره نگه دارید تا کارت بلند شود، سپس بکشید و رها کنید">
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
// شناسه و پرونده رسمی و ابدی خالق، سازنده و معمار جهان استودیو
const CREATOR_MASTER_RECORD = {
  id: 'creator_seyed_soroush_taj',
  name: 'سید سروش تاج',
  email: 'tajinkart@gmail.com',
  contact: 'دفتر مرکزی استودیو (ارتباط مستقیم مدیریت)',
  tier: 'CREATOR',
  balance: '$∞ (صاحب امتیاز)',
  withdrawn: 'فرماندهی استودیو',
  totalSpent: 'مالکیت ۱۰۰٪ 👑',
  isCreator: true,
  assetsBought: [
    'حق امتیاز کامل پایپلاین‌های شش‌گانه کانسپت آرت',
    'حق مالکیت تجاری و معنوی جهان‌های TAJINKART',
    'توسعه بصری و دارایی‌های اورجینال استودیو',
    'کلید دسترسی کامل ادمین با تایید ۲ مرحله‌ای گوگل'
  ]
};

let isCreatorSelected = true;

function renderAdminSketch3(filterText = '', tierFilter = currentMemberTierFilter) {
  const listEl = document.getElementById('adminMembersListContainer');
  if (!listEl) return;

  let showCreator = false;
  if (tierFilter === 'all' || tierFilter === 'CREATOR') {
    if (!filterText || 
        CREATOR_MASTER_RECORD.name.toLowerCase().includes(filterText.toLowerCase()) || 
        CREATOR_MASTER_RECORD.email.toLowerCase().includes(filterText.toLowerCase())) {
      showCreator = true;
    }
  }

  let filtered = siteMembersData.filter(m => m.email && m.email.toLowerCase() !== 'tajinkart@gmail.com');
  if (filterText) {
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(filterText.toLowerCase()) ||
      m.email.toLowerCase().includes(filterText.toLowerCase()) ||
      m.contact.includes(filterText)
    );
  }
  if (tierFilter !== 'all' && tierFilter !== 'CREATOR') {
    filtered = filtered.filter(m => m.tier === tierFilter);
  }

  let htmlStr = '';

  // نمایش کارت فوق‌العاده سلطنتی و انحصاری خالق و سازنده اثر در صدر لیست
  if (showCreator) {
    htmlStr += `
      <div class="member-list-item creator-crown-card ${isCreatorSelected ? 'active' : ''}" onclick="selectAdminCreator()">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 0 12px rgba(245,158,11,0.5);">👑</div>
          <div>
            <div style="font-size:13.5px; font-weight:900; color:#fbbf24;">${CREATOR_MASTER_RECORD.name}</div>
            <div class="font-mono" style="font-size:11px; color:rgba(255,255,255,0.7); margin-top:2px;">${CREATOR_MASTER_RECORD.email}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="tier-tag tier-creator">خالق اثر 👑</span>
        </div>
      </div>
    `;
  }

  // نمایش لیست اعضای مشتریان
  if (tierFilter !== 'CREATOR') {
    htmlStr += filtered.map((m, idx) => `
      <div class="member-list-item ${(!isCreatorSelected && idx === selectedMemberIdx) ? 'active' : ''}" onclick="selectAdminMember(${idx})">
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
  }

  listEl.innerHTML = htmlStr;

  if (isCreatorSelected) {
    renderAdminMemberDetail(CREATOR_MASTER_RECORD);
  } else {
    renderAdminMemberDetail(filtered[selectedMemberIdx] || filtered[0] || CREATOR_MASTER_RECORD);
  }
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
    col.innerHTML = `
      <div style="padding:18px; background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(15,23,42,0.95)); border-radius:14px; border:1px solid #fbbf24; margin-bottom:14px; box-shadow:0 6px 25px rgba(245,158,11,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">👑</span>
            <h3 style="font-size:17px; font-weight:900; color:#fbbf24;">${m.name}</h3>
          </div>
          <span class="tier-tag tier-creator" style="font-size:11px;">خالق و معمار جهان 👑</span>
        </div>
        <div class="font-mono" style="font-size:12px; color:#fff; margin-top:8px;">حساب رسمی گوگل: <span style="color:var(--cyan-electric); font-weight:700;">${m.email}</span> (متصل به 2FA ✓)</div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">جایگاه: <span style="color:var(--gold); font-weight:700;">کارگردان هنری و مالک IP استودیو TAJINKART</span></div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">
          <div style="font-size:11px; color:var(--text-muted);">سطح دسترسی مالی:</div>
          <div class="font-mono" style="font-size:15px; font-weight:800; color:#fbbf24; margin-top:3px;">صاحب‌امتیاز کل</div>
        </div>
        <div style="padding:12px; background:#080c14; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">
          <div style="font-size:11px; color:var(--text-muted);">وضعیت حساب:</div>
          <div class="font-mono" style="font-size:15px; font-weight:800; color:var(--emerald); margin-top:3px;">مدیر ارشد انحصاری 👑</div>
        </div>
      </div>

      <div>
        <h5 style="font-size:12.5px; font-weight:800; margin-bottom:8px; color:#fff;">اختیارات و مجوزهای انحصاری خالق:</h5>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${(m.assetsBought || []).map(a => `
            <div style="padding:8px 10px; background:#070a10; border-radius:8px; border:1px solid rgba(245,158,11,0.25); font-size:12px; display:flex; justify-content:space-between; align-items:center;">
              <span style="color:#fef3c7;">${a}</span>
              <span style="color:var(--gold); font-size:11px; font-weight:800;">✓ انحصاری مالک</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--border-subtle); text-align:center;">
        <span style="font-size:11px; color:var(--text-muted); padding:6px 14px; border-radius:999px; background:rgba(255,255,255,0.04); border:1px solid var(--border-subtle); display:inline-block;">
          🔒 حساب رسمی و غیرقابل تغییر مدیر استودیو
        </span>
      </div>
    `;
    return;
  }

  // پرونده اعضای عادی
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
  if (window.event && window.event.target) window.event.target.classList.add('active');
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
  const isDirector = window.isDirectorEmail(currentMember.email);

  document.getElementById('dashMemberName').innerHTML = isDirector ? 'سید سروش تاج <span style="font-size:11px; color:var(--gold); font-weight:800; border:1px solid rgba(250,204,21,0.35); padding:2px 8px; border-radius:999px;">مدیر استودیو 👑</span>' : currentMember.name;
  
  const googleBadge = currentMember.isGoogleUser ? ' <span style="color:var(--emerald); font-size:11px; font-weight:700;">(متصل به Google ✓)</span>' : '';
  document.getElementById('dashMemberEmail').innerHTML = currentMember.email + googleBadge;
  document.getElementById('dashMemberContact').textContent = currentMember.contact || 'ارتباط استودیو';

  const passBtn = document.getElementById('dashChangePassBtn');
  if (passBtn) {
    if (currentMember.isGoogleUser) {
      passBtn.innerHTML = '🔑 ایجاد رمز عبور مستقل (اختیاری)';
      passBtn.title = 'شما با حساب امن گوگل وارد شده‌اید؛ در صورت تمایل می‌توانید یک رمز مستقل نیز تعریف فرمایید.';
    } else {
      passBtn.innerHTML = '🔑 تغییر رمز عبور';
      passBtn.title = 'تغییر یا بازنشانی رمز عبور این حساب';
    }
  }

  const adminBtn = document.getElementById('dashAdminPanelBtn');
  if (adminBtn) {
    adminBtn.classList.toggle('hidden', !isDirector);
  }

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

// ورود مدیر استودیو منحصراً از طریق تایید هویت Google OAuth انجام می‌شود

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
            applyLoggedInMember(data.user, true);
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

      // ۱. اعتبارسنجی نام کاربری (ممانعت از نام‌های جعلی یا حروف تکراری متوالی)
      const isRepeatedName = /(.)\1{2,}/.test(name);
      if (name.length < 3 || isRepeatedName) {
        showToast('نام وارد شده نامعتبر است! لطفاً یک نام یا لقب معتبر (حداقل ۳ حرف بدون تکرار متوالی کاراکتر) وارد فرمایید.', 'error');
        document.getElementById('signupName')?.focus();
        return;
      }

      // ۲. اعتبارسنجی دقیق سینتکس و پسوند ایمیل
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showToast('آدرس ایمیل نامعتبر است! لطفاً یک ایمیل کامل با دامنه معتبر (مانند user@gmail.com) وارد فرمایید.', 'error');
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
          showToast('طول شماره تلفن وارد شده نامعتبر است (باید بین ۷ تا ۱۵ رقم باشد).', 'error');
          document.getElementById('signupPhone')?.focus();
          return;
        }
        fullContactNumber = (countryCode === 'other' ? '' : countryCode + ' ') + cleanDigits;
      }

      // ۲. اعتبارسنجی قدرت رمز
      if (password.length < 6 || /^(123456|12345678|111111|000000)$/.test(password) || /^[0-9]+$/.test(password)) {
        showToast('رمز عبور بسیار ضعیف است! رمز عبور نمی‌تواند صرفاً از ارقام ساده یا ترتیبی تشکیل شود؛ لطفاً از ترکیب حروف و عدد استفاده کنید.', 'error');
        document.getElementById('signupPass')?.focus();
        return;
      }

      // ۳. تطابق رمز عبور و تکرار آن
      if (password !== passwordConfirm) {
        showToast('رمز عبور و تکرار آن یکسان نیستند! لطفاً مجدداً بررسی فرمایید.', 'error');
        document.getElementById('signupPassConfirm')?.focus();
        return;
      }

      // ۴. بررسی تایید قوانین استودیو (بررسی تیک چک‌باکس)
      const agreeBox = document.getElementById('signupAgreeTerms');
      if (!agreeBox || !agreeBox.checked) {
        showToast('لطفاً تیک مطالعه و پذیرش قوانین و شرایط خدمات استودیو را علامت بزنید.', 'error');
        agreeBox?.focus();
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
              showToast('این آدرس ایمیل قبلاً در استودیو ثبت‌نام شده است. لطفاً وارد حساب خود شوید.', 'error', 6000);
              switchAuthView('login');
              const loginEmailEl = document.getElementById('loginEmail');
              if (loginEmailEl) loginEmailEl.value = email;
            } else if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
              showToast('تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه دیگر مجدداً تلاش فرمایید.', 'error', 6000);
            } else if (msg.includes('password should be') || msg.includes('weak password')) {
              showToast('رمز عبور وارد شده بسیار ضعیف است؛ حداقل ۶ کاراکتر ترکیبی وارد فرمایید.', 'error');
            } else {
              showToast('خطا در ثبت‌نام: ' + (error.message || 'ثبت حساب در سرور ابری انجام نشد'), 'error', 6000);
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
              showToast('حساب ایجاد شد! جهت تایید هویت و صدور لایسنس، لطفاً لینک ارسالی به ایمیل خود را تایید نمایید.', 'warning', 8000);
            } else {
              showToast('حساب کاربری شما با موفقیت ایجاد شد! خوش آمدید.', 'success');
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
      showToast('حساب کاربری جدید ایجاد شد.', 'success');
    });
  }

  // فرم بازیابی رمز عبور با بررسی وجود داشتن ایمیل در سیستم استودیو
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const iden = document.getElementById('forgotIdentifier')?.value.trim().toLowerCase();

      if (!iden || !iden.includes('@')) {
        showToast('لطفاً یک آدرس ایمیل معتبر وارد فرمایید.', 'error');
        return;
      }

      showToast('در حال بررسی و اعتبارسنجی حساب کاربری...', 'info');

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
        showToast('حساب کاربری با این آدرس ایمیل در سیستم یافت نشد! لطفاً ایمیل را بررسی کرده یا ابتدا ثبت‌نام فرمایید.', 'error', 6000);
        return;
      }

      showToast('در حال صدور لینک امن بازیابی به ایمیل شما...', 'info');

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

          showToast('لینک امن بازیابی رمز عبور با موفقیت به ایمیل شما صادر شد. صندوق ورودی (یا اسپم) را بررسی فرمایید.', 'success', 7000);
          switchAuthView('login');
          return;
        } catch (err) {
          console.warn('[Supabase Reset Exception]', err);
        }
      }

      showToast('سرویس احراز هویت ابری در دسترس نیست.', 'error');
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

      showToast('در حال اعتبارسنجی نشست و ذخیره رمز جدید...', 'info');

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
            showToast('نشست امنیتی شما یافت نشد یا منقضی شده است! لطفاً مجدداً از بخش «فراموشی رمز عبور» درخواست لینک جدید فرمایید.', 'error', 7000);
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
              showToast('لینک بازیابی منقضی شده یا نامعتبر است! لطفاً مجدداً از بخش «فراموشی رمز عبور» لینک جدید دریافت کنید.', 'error', 7000);
            } else if (msg.includes('should be different') || msg.includes('same password')) {
              showToast('رمز عبور جدید نمی‌تواند با رمز عبور قبلی یکسان باشد! لطفاً رمز متفاوتی انتخاب فرمایید.', 'error');
            } else {
              showToast('خطا در به‌روزرسانی رمز: ' + (error.message || 'لطفاً دوباره امتحان کنید'), 'error');
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
            showToast('رمز عبور جدید با موفقیت ذخیره شد. خوش آمدید!', 'success', 6000);
            return;
          }
        } catch (updateErr) {
          console.warn('[Supabase Password Update Exception]', updateErr);
          showToast('خطا در ارتباط با سرور احراز هویت. لطفاً مجدداً تلاش فرمایید.', 'error');
          return;
        }
      }

      showToast('سرویس احراز هویت ابری در دسترس نیست.', 'error');
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


// =========================================================
// سامانه مدیریت پویا و زنده منشور قوانین، لایسنس و شرایط استودیو
// =========================================================

const DEFAULT_STUDIO_TERMS = `### ۱. اصل صحت اطلاعات و سلب مسئولیت اشتباهات کاربر (Accuracy of Information)
کاربر با ثبت‌نام در وب‌سایت یا ثبت هرگونه سفارش صراحتاً اقرار و ضمانت می‌نماید که کلیه مشخصات هویتی و ارتباطی ارائه‌شده (شامل نام، لقب، آدرس ایمیل و شماره تماس) واقعی، دقیق و متعلق به خود اوست. استودیو تاج‌اینک‌آرت هیچ‌گونه مسئولیتی در قبال تایپ اشتباه آدرس جیمیل، عدم دریافت ایمیل‌های فعال‌سازی، فراموشی رمز عبور، یا از دست رفتن دسترسی به فایل‌ها ناشی از خطای کاربر ندارد و بار حقوقی هرگونه خسارت انحصاراً بر عهده خود کاربر است.

### ۲. تفکیک قوانین عمومی ورود از قرارداد خرید (ToS vs Commission SLA)
تایید قوانین در مرحله ثبت‌نام صرفاً به منزله پذیرش مقررات عمومی پلتفرم، سن مجاز (۱۶+ سال) و حفاظت از کلیت مالکیت فکری استودیو است. شروط مالی سنگین نظیر ودیعه ۵۰٪ غیرقابل‌استرداد، ددلاین‌ها، سقف ادیت‌ها و توافقات محرمانگی، منحصراً در لحظه ثبت قطعی فرم سفارش و پیش از پرداخت فعال شده و به امضای طرفین می‌رسد.

### ۳. شفافیت جغرافیایی، منطقه زمانی و کانال‌های ارتباطی (Regional & Communication Transparency)
استودیو تاج‌اینک‌آرت با مدیریت سید سروش تاج به‌صورت مستقل در ایران مستقر بوده و به شکل فریلنس و بین‌المللی با کارفرمایان سراسر جهان همکاری می‌نماید. ساعات کاری رسمی استودیو بر پایه منطقه زمانی ایران (UTC+3:30) تنظیم شده است. در صورت وقوع هرگونه اختلال یا کندی موقت در شبکه زیرساخت اینترنت منطقه‌ای، استودیو از کانال‌های امن و پایدار پشتیبان (شامل تلگرام و ایمیل‌های رمزنگاری‌شده) جهت حفظ پیوستگی ارتباطات استفاده می‌نماید.

### ۴. روش‌های پرداخت بین‌المللی و تسویه ارزی (Global Payments & Cryptocurrency)
سفارش‌دهندگان بین‌المللی می‌توانند پیش‌پرداخت و تسویه نهایی سفارش‌های خود را از طریق استیبل‌کوین‌های معتبر نظیر تتر (USDT بر بستر TRC20 یا ERC20) یا سایر روش‌های تسویه ارزی مورد توافق استودیو پرداخت نمایند. نوسانات نرخ ارز یا کارمزدهای شبکه انتقال بر عهده پرداخت‌کننده است. برای مشتریان داخلی، تسویه بر پایه معادل تومانی نرخ روز صورت می‌پذیرد.

### ۵. تضمین اصالت رفرنس‌های ارسالی مشتری (Client Materials Indemnity)
مشتری متعهد و ضامن است که تمامی تصاویر، کانسپت‌ها، لوگوها و فایل‌های متنی که به عنوان بریف یا رفرنس به استودیو ارسال می‌کند، یا در مالکیت قانونی اوست یا حق بهره‌برداری از آن‌ها را دارد. در صورت بروز هرگونه ادعای نقض کپی‌رایت توسط اشخاص ثالث علیه استودیو ناشی از مواد ارائه‌شده توسط مشتری، مسئولیت حقوقی و جبران کامل خسارت منحصراً متوجه مشتری خواهد بود.

### ۶. بند بلاتکلیفی و رهاسازی سفارش (Inactivity & Abandonment Clause)
پس از ارسال اتودها یا فازهای رندر توسط آرتیست، مشتری موظف است حداکثر ظرف مدت ۱۴ روز کاری نظرات و اصلاحات خود را اعلام نماید. در صورت عدم پاسخگویی و سکوت مشتری بیش از ۳۰ روز تقویمی، پروژه به عنوان «رهاشده (Abandoned)» تلقی گردیده، تعهد زمانی استودیو لغو، ودیعه ۵۰٪ به عنوان خسارت اشغال ظرفیت آتلیه ضبط و سفارش بدون حق ادعا مختومه می‌شود. بازگشایی مجدد نیازمند عقد متمم جدید خواهد بود.

### ۷. سیاست مدرن هوش مصنوعی و هدایت هنری (Modern AI Transparency)
استودیو تاج‌اینک‌آرت استفاده از فناوری‌های نوین و مدل‌های هوش مصنوعی را به عنوان کپیلوت (دستیار فنی، کدنویسی و تسریع پایپلاین) به کار می‌بندد؛ با این وجود، جهان‌سازی جنسیس، داستان‌ها، نژادها، کاراکترهای اورجینال و هدایت بصری، دستاورد فکری سید سروش تاج است. هرگونه کپی‌برداری تجاری، آموزش مدل‌های اختصاصی (مانند LoRA) جهت بازتولید عامدانه کاراکترهای استودیو، یا جعل هویت تجاری تاج‌اینک‌آرت ممنوع و دارای پیگرد است.

### ۸. لایسنس دارایی‌های دانلودی و ممنوعیت افشا (EULA & Anti-Leak)
خرید هرگونه دارایی دیجیتال (آرت‌بوک، براش، مدل سه‌بعدی و تکسچر) دسترسی مادام‌العمر شخصی به فایل‌ها و به‌روزرسانی‌های آینده را به خریدار اعطا می‌کند. هرگونه فروش مجدد، اشتراک‌گذاری در کانال‌های عمومی، وب‌سایت‌های تورنت و دانلود غیرمجاز تخلف قطعی بوده و منجر به مسدودسازی دائمی حساب و پیگرد قانونی خواهد شد.

### ۹. سلب مسئولیت حوادث قهریه و زیرساخت ابری (Force Majeure)
سایت بر پایه زیرساخت‌های بین‌المللی GitHub Pages، Supabase و Cloudinary اداره می‌شود. استودیو در قبال اختلالات موقت ناشی از تحریم‌ها، فیلترینگ، قطعی سرورهای بالادستی یا حوادث خارج از کنترل انسانی (فورس ماژور) ضامن خسارت مالی نخواهد بود، هرچند حداکثر تمهیدات جهت حفظ سلامت و بک‌آپ دیتای کاربران اتخاذ شده است.

### ۱۰. سقف مسئولیت مالی و عدم استرداد (Limitation of Liability & No Refund)
کالاهای دانلودی دیجیتال به دلیل ماهیت دسترسی فوری، پس از خرید غیرقابل‌استرداد هستند. در کلیه دعاوی حقوقی، حداکثر سقف مسئولیت مالی استودیو محدود به همان مبلغ دریافتی از مشتری برای همان سفارش مشخص خواهد بود.

### ۱۱. حق امضا و نمایش در پورتفولیو (Moral Rights & Credit)
استودیو تاج‌اینک‌آرت حق نمایش آثار نهایی را در وب‌سایت، شبکه‌های اجتماعی و پورتفولیوی رسمی خود (با ذکر مالکیت تجاری کارفرما) جهت ارتقای برند برای خود محفوظ می‌دارد، مگر آنکه کارفرما پیش از شروع پروژه قرارداد محرمانگی انحصاری (NDA) با هزینه مشخص منعقد کرده باشد.

### ۱۲. حل و فصل اختلافات و داوری (Dispute Resolution)
طرفین متعهد می‌شوند پیش از هرگونه اقدام حقوقی، ظرف مدت ۳۰ روز از طریق مکاتبه رسمی با پشتیبانی استودیو و مذاکره دوستانه نسبت به حل اختلاف اقدام نمایند.`;

// واکشی متن ذخیره‌شده یا پیش‌فرض
window.getStudioTermsContent = function() {
  const saved = localStorage.getItem('tajinkart_studio_terms');
  return saved && saved.trim().length > 30 ? saved : DEFAULT_STUDIO_TERMS;
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
    showToast('متن قوانین نمی‌تواند خالی یا کمتر از ۲۰ کاراکتر باشد.', 'error');
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
  showToast('منشور قوانین و لایسنس استودیو با موفقیت ذخیره و در سایت منتشر شد!', 'success');
};

// بازنشانی متن به استاندارد رسمی
window.resetStudioTermsToDefault = function() {
  if (!confirm('آیا از بازنشانی متن منشور قوانین به نسخه رسمی استاندارد (Master Spec) اطمینان دارید؟')) return;
  const textarea = document.getElementById('adminTermsContentInput');
  if (textarea) {
    textarea.value = DEFAULT_STUDIO_TERMS;
  }
  localStorage.removeItem('tajinkart_studio_terms');
  renderTermsModal();
  showToast('متن قوانین به نسخه پیش‌فرض بازگردانی شد. جهت اعمال دکمه ذخیره را بزنید.', 'info');
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

  // بررسی الگوهای به‌شدت ناامن و متوالی مانند 123456، aaaaaa، password
  const isSequential = /^(123456|12345678|abcdef|qwerty|111111|000000|password)/i.test(pass);
  const isOnlyDigits = /^[0-9]+$/.test(pass);
  const isOnlyLetters = /^[a-zA-Z]+$/.test(pass);

  // محاسبه تنوع گونه‌های کاراکتری
  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  // اگر کمتر از ۶ کاراکتر باشد یا فقط عدد/فقط حروف متوالی باشد -> قطعاً ضعیف
  if (pass.length < 6 || isSequential || (pass.length <= 8 && isOnlyDigits) || (pass.length <= 7 && isOnlyLetters)) {
    bar.style.width = '25%';
    bar.style.background = 'var(--crimson)';
    text.textContent = 'سطح امنیت: بسیار ضعیف و آسیب‌پذیر';
    text.style.color = 'var(--crimson)';
    if (hint) hint.textContent = isOnlyDigits ? 'رمز نباید فقط عدد باشد' : 'ترکیب حروف و علائم اضافه کنید';
    return;
  }

  // سطح متوسط: حداقل ۶ تا ۷ کاراکتر با تنوع حداقل ۲ نوع (مثلاً حرف + عدد)
  if (pass.length >= 6 && varietyCount === 2) {
    bar.style.width = '50%';
    bar.style.background = 'var(--amber)';
    text.textContent = 'سطح امنیت: متوسط';
    text.style.color = 'var(--amber)';
    if (hint) hint.textContent = 'افزودن حروف بزرگ و نمادها (@#!%)';
    return;
  }

  // سطح خوب: حداقل ۸ کاراکتر با تنوع ۳ نوع
  if (pass.length >= 8 && varietyCount >= 3 && !hasSpecial) {
    bar.style.width = '75%';
    bar.style.background = 'var(--cyan-electric)';
    text.textContent = 'سطح امنیت: خوب و استاندارد';
    text.style.color = 'var(--cyan-electric)';
    if (hint) hint.textContent = 'برای ارتقا به حداکثر، نماد خاص اضافه کنید';
    return;
  }

  // سطح عالی: حداقل ۸ کاراکتر به بالا با تنوع کامل ۴ نوع (کوچک، بزرگ، عدد، نماد)
  if (pass.length >= 8 && varietyCount >= 3 && hasSpecial) {
    bar.style.width = '100%';
    bar.style.background = 'var(--emerald)';
    text.textContent = 'سطح امنیت: فوق‌العاده قوی و نفوذناپذیر ✓';
    text.style.color = 'var(--emerald)';
    if (hint) hint.textContent = 'بالاترین مقاومت در برابر سرقت';
    return;
  }

  // حالت پیش‌فرض برای طول بالا
  bar.style.width = '75%';
  bar.style.background = 'var(--cyan-electric)';
  text.textContent = 'سطح امنیت: مناسب';
  text.style.color = 'var(--cyan-electric)';
  if (hint) hint.textContent = 'مقاوم و قابل قبول';
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
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> فرمت ایمیل هنوز ناقص است (مثال: user@gmail.com)';
    emailInput.style.borderColor = 'var(--crimson)';
    return;
  }

  // تشخیص هوشمند جا افتادن حرف آخر در دامنه‌های معروف (مانند gmail.co یا yahoo.co)
  const commonTypos = ['@gmail.co', '@yahoo.co', '@hotmail.co', '@outlook.co'];
  for (const typo of commonTypos) {
    if (cleanEmail.endsWith(typo)) {
      notice.style.color = 'var(--crimson)';
      notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> پسوند دامنه ناقص به نظر می‌رسد! آیا منظورتان ' + typo + 'm بود؟';
      emailInput.style.borderColor = 'var(--crimson)';
      return;
    }
  }

  // بررسی عدم تکراری بودن در حافظه کلاینت
  const localExists = siteMembersData.some(m => m.email && m.email.toLowerCase() === cleanEmail);
  if (localExists) {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> این ایمیل قبلاً در استودیو ثبت شده است';
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
          notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> این ایمیل قبلاً در سیستم ثبت‌نام شده است';
          emailInput.style.borderColor = 'var(--crimson)';
        } else {
          notice.style.color = 'var(--emerald)';
          notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> فرمت ایمیل معتبر و آزاد است';
          emailInput.style.borderColor = 'var(--emerald)';
        }
      } catch(e) {
        notice.style.color = 'var(--emerald)';
        notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> فرمت ایمیل معتبر است';
        emailInput.style.borderColor = 'var(--emerald)';
      }
    } else {
      notice.style.color = 'var(--emerald)';
      notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> فرمت ایمیل معتبر است';
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
    notice.innerHTML = '<span style="color:var(--emerald); font-weight:700;">✓</span> شماره تلفن معتبر است';
    phoneInput.style.borderColor = 'var(--emerald)';
  } else {
    notice.style.color = 'var(--crimson)';
    notice.innerHTML = '<span style="color:var(--crimson); font-weight:700;">✕</span> طول شماره تلفن نامعتبر است (' + val.length + ' رقم - استاندارد: بین ۷ تا ۱۵ رقم)';
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
    notice.textContent = '✕ نام حداقل باید ۲ حرف باشد';
    nameInput.style.borderColor = 'var(--crimson)';
  } else {
    notice.style.color = 'var(--emerald)';
    notice.textContent = '✓ نام معتبر است';
    nameInput.style.borderColor = 'var(--emerald)';
  }
};


// تابع ارسال مجدد لینک تایید ایمیل به کاربر در صورت عدم تایید اولیه
window.resendConfirmationEmail = async function(emailAddress) {
  if (!window.supabaseClient) {
    showToast('سامانه ابری سوپابیس در دسترس نیست.', 'error');
    return;
  }
  const email = emailAddress || (window.currentUser && window.currentUser.email);
  if (!email) {
    showToast('آدرس ایمیلی جهت ارسال مجدد یافت نشد.', 'error');
    return;
  }
  try {
    const { error } = await window.supabaseClient.auth.resend({
      type: 'signup',
      email: email
    });
    if (error) {
      showToast('خطا در ارسال مجدد ایمیل: ' + error.message, 'error');
    } else {
      showToast('لینک تایید جدید با موفقیت به ' + email + ' ارسال گردید.', 'success', 5000);
    }
  } catch(e) {
    showToast('خطای شبکه در ارسال ایمیل تایید.', 'error');
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
  showToast(`اثر «${movedItem.shortSlug || movedItem.title}» به جایگاه ${toIdx + 1} منتقل شد.`, 'success');
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
          showToast(`✓ چیدمان اثر با موفقیت جابجا شد.`, 'success');
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
let currentGalleryFilter = 'all';

window.toggleCategoryFilterMenu = function(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('categoryFilterDropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
};

document.addEventListener('click', (e) => {
  const menuWrapper = document.getElementById('floatingGalleryCategoryMenu');
  if (menuWrapper && !menuWrapper.contains(e.target)) {
    const dropdown = document.getElementById('categoryFilterDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }
});

window.filterGalleryByCategory = function(categoryKey, categoryName) {
  currentGalleryFilter = categoryKey;
  const labelEl = document.getElementById('currentCategoryPillLabel');
  if (labelEl) labelEl.textContent = categoryName;

  document.querySelectorAll('.cat-dropdown-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(categoryName));
  });

  const dropdown = document.getElementById('categoryFilterDropdown');
  if (dropdown) dropdown.classList.add('hidden');

  renderShowcaseGrid();
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
// کشوی شیک و پرستیژدار تشریح فازهای تخصصی (Phase Scope Drawer)
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
    // در موبایل: باز شدن کشوی مشخصات فنی فاز به سبک Bottom Sheet
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
  if (titleEl) titleEl.textContent = phaseTitle || 'بررسی جزئیات کانسپت';
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
  if (titleEl) titleEl.textContent = phaseTitle || 'فاز تخصصی پروداکشن';

  const pipeData = (typeof PIPELINE_DATA !== 'undefined' && PIPELINE_DATA[currentDrawerPipelineKey]) ? 
                   PIPELINE_DATA[currentDrawerPipelineKey] : { topSub: 'طراحی کاراکتر و کانسپت' };
  
  const pipeEl = document.getElementById('drawerPhasePipeline');
  if (pipeEl) {
    pipeEl.textContent = pipeData.topSub + (customSub ? ` • ${customSub}` : '');
  }

  const purposeEl = document.getElementById('drawerPhasePurpose');
  if (purposeEl) {
    if (customDesc && customDesc.trim().length > 0) {
      purposeEl.textContent = customDesc.trim();
    } else if (phaseTitle.includes('سه‌نما') || phaseTitle.includes('ارتوگرافیک') || phaseTitle.includes('Turnaround')) {
      purposeEl.textContent = 'این شیت برای تثبیت زوایای تراز ارتوگرافیک (روبرو، نیم‌رخ و پشت) طراحی شده است و به عنوان نقشه فنی اصلی در اختیار تیم مدلسازی سه‌بعدی و انیمیشن قرار می‌گیرد.';
    } else if (phaseTitle.includes('اکسپرشن') || phaseTitle.includes('چهره') || phaseTitle.includes('حالات')) {
      purposeEl.textContent = 'این فاز به بررسی حالات روحی، احساسات دینامیک و میمیک چهره کاراکتر در شرایط نبرد، خشم، تمرکز و دیالوگ اختصاص دارد تا روح روایی اثر حفظ گردد.';
    } else if (phaseTitle.includes('اتود') || phaseTitle.includes('سیلوئت') || phaseTitle.includes('اسکچ')) {
      purposeEl.textContent = 'کشف فرم اولیه، تناسبات هندسی و هویت سیلوئت کلی اثر در فاز کانسپت پایه؛ این مرحله پایه تصمیم‌گیری‌های پروداکشن و تعیین مسیر نهایی طراحی است.';
    } else if (phaseTitle.includes('رندر') || phaseTitle.includes('مستر') || phaseTitle.includes('نور')) {
      purposeEl.textContent = 'تفکیک متریال‌ها، نورپردازی مقداری، پردازش بافت‌های پوستی/فلزی و خروجی باکیفیت پولیش نهایی با قابلیت چاپ و استفاده مستقیم در پروموشن تجاری.';
    } else {
      purposeEl.textContent = 'این ماژول به عنوان بخش مکمل فرآیند توسعه بصری استودیو پیاده‌سازی شده و استانداردهای صنعتی تحویل دارایی را تضمین می‌نماید.';
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
  showToast('به پایپلاین سفارش آتلیه منتقل شدید. فرمول محاسبه هزینه فعال است.', 'info', 4000);
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
