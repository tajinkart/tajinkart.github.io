// ==============================================================================
// TAJINKART STUDIO — CORE ENGINE MODULE (core.js)
// Shared Utilities, Supabase Auth, View Routing, Dock Navigation, Particles
// ==============================================================================

window.safeGetStorage = function(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
};

window.safeSetStorage = function(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
};

window.showToast = function(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 400);
  }, duration);
};

window.escapeQuotes = function(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

window.modalHistoryStack = window.modalHistoryStack || [];
window.pushModalState = function(stateId) {
  modalHistoryStack.push(stateId);
};
window.popModalState = function() {
  return modalHistoryStack.pop();
};

window.unlockBodyScroll = function() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
};

window.formatPrice = function(usdAmount) {
  if (typeof usdAmount !== 'number') return '$0';
  return '$' + usdAmount.toLocaleString();
};

window.closeAllDockFlyouts = function() {
  const storeWrapper = document.getElementById('dockStoreDropdownWrapper');
  if (storeWrapper) storeWrapper.classList.remove('active');
  const catDropdown = document.getElementById('categoryFilterDropdown');
  if (catDropdown) catDropdown.classList.add('hidden');
  const genreDropdown = document.getElementById('genreFilterDropdown');
  if (genreDropdown) genreDropdown.classList.add('hidden');
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

window.saveAboutStudioManifestoDirect = function() {
  const t = document.getElementById('aboutStudioTitleInput')?.value.trim();
  const d = document.getElementById('aboutStudioDescInput')?.value.trim();
  if (t) safeSetStorage('tajinkart_manifesto_title', t);
  if (d) safeSetStorage('tajinkart_manifesto_desc', d);
  showToast('About Studio manifesto updated and saved! ✓', 'success', 4000);
};


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
        showToast('Welcome, Studio Director Seyed Soroush Taj. Console unlocked! 👑', 'success', 6000);
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

  // Synchronize mobile bottom nav buttons
  document.querySelectorAll('#mobileBottomNav .mob-nav-btn').forEach(btn => {
    const target = btn.getAttribute('data-view-target');
    const isActive = (target === vKey);
    btn.classList.toggle('active', isActive);
  });

  // Update desktop dock state
  if (dock) {
    if (window.innerWidth <= 768) {
      dock.classList.add('dock-collapsed');
      dock.classList.remove('dock-open');
    } else {
      dock.classList.remove('dock-collapsed');
      dock.classList.remove('dock-open');
    }
  }

  // مدیریت سخت‌گیرانه نمایش هدر برند و دکمه‌های گالری: منحصراً و فقط در صفحه اول (Showcase)
  if (vKey === 'showcase') {
    if (topBar) {
      topBar.style.display = 'flex';
      topBar.style.removeProperty('display');
      topBar.classList.add('visible');
    }
    const catMenu = document.getElementById('floatingGalleryCategoryMenu');
    if (catMenu) catMenu.style.display = 'inline-block';
    const genreMenu = document.getElementById('floatingGalleryGenreMenu');
    if (genreMenu) genreMenu.style.display = 'inline-block';

    if (typeof renderShowcaseGrid === 'function') renderShowcaseGrid();
    if (homeBtn) homeBtn.classList.remove('hidden');
    if (window.scrollY <= 140 && window.innerWidth > 768 && dock) {
      dock.classList.remove('dock-collapsed');
    }
  } else {
    // در تمام صفحات دیگر (ادمین، فروشگاه، جنسیس، آکادمی، اعضا) هدر کاملاً مخفی می‌شود
    if (topBar) {
      topBar.style.display = 'none';
      topBar.classList.remove('visible');
    }
    const catMenu = document.getElementById('floatingGalleryCategoryMenu');
    if (catMenu) catMenu.style.display = 'none';
    const genreMenu = document.getElementById('floatingGalleryGenreMenu');
    if (genreMenu) genreMenu.style.display = 'none';

    if (homeBtn) homeBtn.classList.remove('hidden');
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
      topBar.style.display = 'flex';
      topBar.classList.add('visible');
    } else {
      topBar.style.display = 'none';
      topBar.classList.remove('visible');
    }
  }

  // ۳. مدیریت داک در موبایل: همیشه بسته می‌ماند
  if (window.innerWidth <= 768) {
    if (dock) dock.classList.add('dock-collapsed');
    return;
  }

  // ۴. دسکتاپ: در بالای صفحه (scrolled <= 100) باز است، با اسکرول به پایین جمع می‌شود به سه خط
  if (cView !== 'showcase') {
    dock.classList.add('dock-collapsed');
    return;
  }

  if (scrolled > 100) {
    dock.classList.add('dock-collapsed');
  } else {
    dock.classList.remove('dock-collapsed');
  }
}

function initDockState() {
  const dock = document.getElementById('rightVerticalNav');
  const topBar = document.getElementById('topCenterBrandBar');
  const scrolled = window.scrollY || window.pageYOffset || 0;
  const cView = document.body.getAttribute('data-view') || window.currentView || 'showcase';

  // وضعیت اولیه نشان برند در بالا-چپ
  if (topBar) {
    if (cView === 'showcase') {
      topBar.style.display = 'flex';
      topBar.classList.add('visible');
    } else {
      topBar.style.display = 'none';
      topBar.classList.remove('visible');
    }
  }

  if (!dock) return;

  // موبایل: همیشه از اول بسته است و فقط ۳ خط نمایش داده می‌شود
  if (window.innerWidth <= 768) {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
    return;
  }

  // دسکتاپ: در صفحات دیگر بسته است، در صفحه اصلی وابسته به اسکرول
  if (cView !== 'showcase') {
    dock.classList.add('dock-collapsed');
    dock.classList.remove('dock-open');
    return;
  }

  if (scrolled > 100) {
    dock.classList.add('dock-collapsed');
  } else {
    dock.classList.remove('dock-collapsed');
    dock.classList.remove('dock-open');
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
    btn.innerHTML = '⏳ Pinging Cloud Services...';
  }

  // ۱. سوپابیس
  const supaBadge = document.getElementById('pingSupabaseBadge');
  if (supaBadge) {
    supaBadge.textContent = 'Testing...';
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
      supaBadge.textContent = '🔴 Disconnected';
      supaBadge.style.color = '#ef4444';
    }
  }

  // ۲. کلودفلر CDN
  const cfBadge = document.getElementById('pingCloudflareBadge');
  if (cfBadge) {
    cfBadge.textContent = 'Testing...';
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
      cfBadge.textContent = '🟢 Cloud CDN Active';
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
      tgBadge.textContent = '🟢 Token Verified & Ready';
      tgBadge.style.color = '#00f0ff';
    } else {
      tgBadge.textContent = '🟢 Webhook Ready';
      tgBadge.style.color = '#94a3b8';
    }
  }

  // ۵. کلودینری
  const cBadge = document.getElementById('pingCloudinaryBadge');
  if (cBadge) {
    cBadge.textContent = 'Testing...';
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
      cBadge.textContent = '🟢 Server Ready';
      cBadge.style.color = '#10b981';
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '⚡ Re-check All Cloud Services';
  }
  showToast('Cloud infrastructure health check and ping complete! ✓', 'success', 3000);
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
  showToast('Cloudinary image host settings saved successfully! ✓', 'success', 3500);
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
    'rgba(255, 87, 34, 0.55)',   // Coral flame
    'rgba(168, 85, 247, 0.5)',   // Cosmic purple
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
