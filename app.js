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
  }, 3800);
};

// رندر گالری پیوسته ۱۲ ستونه طبق Master Spec
function renderShowcaseGrid() {
  const grid = document.getElementById('showcaseGrid');
  if (!grid) return;
  grid.innerHTML = showcaseArtworks.map((art, i) => `
    <div class="mosaic-tile span-pattern-${i % 8}" onclick="openArtModal(${art.id})">
      <div class="tile-center-title">
        <span class="tile-slug">/ ${art.shortSlug} /</span>
        <span class="tile-divider"></span>
        <span class="tile-sub">${art.title}</span>
      </div>
      <img src="${art.image}" loading="lazy" alt="${art.title}" />
    </div>
  `).join('');
}

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
  if (imgEl) imgEl.src = currentPhase.img;
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
    if (!currentMember.assetsBought.includes(title)) {
      currentMember.assetsBought.push(title);
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(siteMembersData));
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

    if (scrolled > 120) {
      if (dock) dock.classList.add('dock-collapsed');
      if (topBar) topBar.classList.add('visible');
    } else {
      if (dock) dock.classList.remove('dock-collapsed');
      if (topBar) topBar.classList.remove('visible');
    }

    if (hero) {
      if (scrolled < 650) {
        const ratio = Math.min(scrolled / 500, 1);
        const scale = 1 - (ratio * 0.08);
        const translateY = scrolled * 0.28;
        const opacity = Math.max(1 - (ratio * 0.75), 0.15);
        const blur = ratio * 7;

        hero.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        hero.style.opacity = opacity;
        hero.style.filter = `blur(${blur}px)`;
      } else {
        hero.style.transform = 'translate3d(0, 140px, 0) scale(0.92)';
        hero.style.opacity = '0.15';
        hero.style.filter = 'blur(7px)';
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
  document.getElementById('authViewLogin').classList.add('hidden');
  document.getElementById('authViewSignUp').classList.add('hidden');
  document.getElementById('authViewForgot').classList.add('hidden');

  if (viewName === 'login') document.getElementById('authViewLogin').classList.remove('hidden');
  else if (viewName === 'signup') document.getElementById('authViewSignUp').classList.remove('hidden');
  else if (viewName === 'forgot') {
    document.getElementById('authViewForgot').classList.remove('hidden');
    document.getElementById('forgotStep1').classList.remove('hidden');
    document.getElementById('forgotStep2').classList.add('hidden');
  }
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

window.logoutMemberAccount = function() {
  currentMember = null;
  document.getElementById('rightMemberLabel').textContent = 'پورتال اعضا';
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
    switchView('admin');
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
  const tabs = ['pipelines', 'artworks', 'products', 'members', 'orders', 'settings'];
  tabs.forEach(t => {
    const el = document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (el) el.classList.toggle('hidden', t !== tabKey);
  });
  document.querySelectorAll('#adminWorkspace .store-dual-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (tabKey === 'pipelines') renderAdminSketch1();
  if (tabKey === 'artworks') renderAdminSketch2();
  if (tabKey === 'products') renderAdminProductsTab();
  if (tabKey === 'members') renderAdminSketch3();
  if (tabKey === 'orders') renderAdminLists();
  if (tabKey === 'settings') renderAdminEyeControls();
};


// ۲. پایپلاین و مراحل آتلیه در پنل ادمین با استایل بصری و گرید تایل‌ها کاملاً شبیه فروشگاه
function renderAdminSketch1() {
  const sideCards = document.getElementById('adminAtelierServiceCards');
  if (!sideCards) return;

  const defaultImgs = {
    sketch1: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    sketch_creature: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    sketch2: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    sketch3: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    sketch4: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    sketch5: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=80'
  };

  const keys = Object.keys(PIPELINE_DATA);
  let html = keys.map(function(key, idx) {
    const pipe = PIPELINE_DATA[key];
    const num = (idx + 1 < 10 ? '0' : '') + (idx + 1);
    const cover = pipe.tiles && pipe.tiles[0] ? pipe.tiles[0].img : (defaultImgs[key] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80');
    const isActive = (key === currentSelectedPipeKey);

    return '<div onclick="selectAdminCategory(\'' + key + '\')" class="service-nav-card ' + (isActive ? 'active' : '') + '" style="margin-bottom:8px;">' +
      '<img src="' + cover + '" alt="' + pipe.topSub + '" />' +
      '<div class="service-nav-overlay">' +
        '<div class="service-nav-title">' +
          '<span class="font-mono" style="color:var(--gold);">' + num + '.</span>' +
          '<span>' + pipe.topSub + '</span>' +
        '</div>' +
        '<div class="service-nav-desc">' + (pipe.note || pipe.topSub) + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  html += '<button type="button" onclick="adminAddNewCategory()" class="btn-secondary" style="width:100%; margin-top:8px; border-style:dashed; color:var(--gold); font-size:11.5px; padding:10px;">+ افزودن دسته‌بندی جدید به آتلیه</button>';

  sideCards.innerHTML = html;
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

  const topSubEl = document.getElementById('adminSketchTopSubTitle');
  const noteEl = document.getElementById('adminSketchAnnotationNote');
  const slugEl = document.getElementById('adminSketchBadgeSlug');

  if (topSubEl) topSubEl.textContent = data.topSub;
  if (noteEl) noteEl.textContent = data.note;
  if (slugEl) slugEl.textContent = data.badgeSlug;

  const container = document.getElementById('adminMosaicStageContainer');
  if (container) {
    container.innerHTML = data.tiles.map(function(tile, idx) {
      const isSelected = (idx === currentSelectedStageIdx);
      const displayPrice = formatPrice(tile.price);

      return '<div class="pipeline-tile ' + (tile.span || 'col-span-4') + '" style="cursor:pointer; border-color:' + (isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.12)') + '; box-shadow:' + (isSelected ? '0 0 20px rgba(250,204,21,0.35)' : 'none') + ';" onclick="selectAdminStage(' + idx + ')">' +
        '<img src="' + tile.img + '" class="pipeline-tile-img" alt="' + tile.title + '" />' +
        '<div class="pipeline-tile-overlay">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
            '<span class="pipeline-step-badge">' + tile.badge + '</span>' +
            (isSelected ? '<span style="font-size:10px; color:var(--gold); font-weight:800; background:rgba(0,0,0,0.7); padding:2px 8px; border-radius:4px; border:1px solid var(--gold);">✓ در حال ویرایش</span>' : '') +
          '</div>' +
          '<h4 class="pipeline-tile-title">' + tile.title + '</h4>' +
          '<p class="pipeline-tile-desc">' + tile.desc + '</p>' +
          '<div class="pipeline-tile-footer">' +
            '<div>' +
              '<span class="font-mono" style="color:var(--gold); font-size:13.5px; font-weight:800;">' + displayPrice + '</span>' +
              '<span style="color:var(--cyan-electric); font-size:11px; margin-right:8px;">(' + tile.timeline + ')</span>' +
            '</div>' +
            '<button type="button" onclick="event.stopPropagation(); adminDeleteStage(' + idx + ')" style="color:var(--crimson); font-size:11px; background:none; border:none; cursor:pointer;">حذف فاز</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  renderAdminStageLiveEditor();
}

window.selectAdminStage = function(idx) {
  currentSelectedStageIdx = idx;
  renderAdminStagesList();
  const drawer = document.getElementById('adminStageEditDrawer');
  if (drawer && window.innerWidth <= 1024) {
    drawer.scrollIntoView({ behavior: 'smooth' });
  }
};

function renderAdminStageLiveEditor() {
  const data = PIPELINE_DATA[currentSelectedPipeKey];
  if (!data || !data.tiles[currentSelectedStageIdx]) return;
  const tile = data.tiles[currentSelectedStageIdx];
  const col = document.getElementById('adminStageEditFormContainer');
  if (!col) return;

  col.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="display:grid; grid-template-columns:1fr 2fr; gap:10px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">نشان مرحله (بج)</label>
          <input type="text" value="${tile.badge}" onchange="updateCurrentStageField('badge', this.value)" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">عنوان کامل فاز</label>
          <input type="text" value="${tile.title}" onchange="updateCurrentStageField('title', this.value)" />
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">بازه قیمت نمایشی</label>
          <input type="text" value="${tile.price}" onchange="updateCurrentStageField('price', this.value)" class="font-mono" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">قیمت پایه دلار (محاسبه‌گر)</label>
          <input type="number" value="${tile.usdVal || 90}" onchange="updateCurrentStageField('usdVal', parseInt(this.value, 10))" class="font-mono" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">زمان تحویل</label>
          <input type="text" value="${tile.timeline}" onchange="updateCurrentStageField('timeline', this.value)" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">شرح خروجی فاز</label>
        <textarea rows="2" onchange="updateCurrentStageField('desc', this.value)">${tile.desc}</textarea>
      </div>
      
      <!-- بخش آپلود تصویر فاز (هم فایل از کامپیوتر هم لینک URL) -->
      <div style="padding:12px; border-radius:12px; background:#040609; border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:var(--gold);">تصویر پس‌زمینه این فاز:</span>
          <label class="btn-gold" style="cursor:pointer; font-size:11px; padding:6px 14px; background:var(--gold); color:#000; border-radius:8px;">
            📁 انتخاب و آپلود عکس از کامپیوتر
            <input type="file" accept="image/*" style="display:none;" onchange="handleAdminStageFileUpload(event)" />
          </label>
        </div>
        <div>
          <label style="font-size:10.5px; color:var(--text-muted); display:block; margin-bottom:3px;">یا کپی مستقیم لینک تصویر (URL):</label>
          <input type="text" value="${tile.img}" onchange="updateCurrentStageField('img', this.value)" class="font-mono" style="font-size:11px;" />
        </div>
        <div style="height:90px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); margin-top:2px;">
          <img id="adminStagePreviewImg" src="${tile.img}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
      </div>
    </div>
  `;
}

window.updateCurrentStageField = function(field, val) {
  PIPELINE_DATA[currentSelectedPipeKey].tiles[currentSelectedStageIdx][field] = val;
  localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
  selectPipeline(currentSelectedPipeKey, null, false);
  renderAdminStagesList();
  showToast('تغییرات فاز ذخیره شد.', 'success');
};

window.handleAdminStageFileUpload = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    PIPELINE_DATA[currentSelectedPipeKey].tiles[currentSelectedStageIdx].img = dataUrl;
    localStorage.setItem(KEYS.PIPELINES, JSON.stringify(PIPELINE_DATA));
    renderAdminStagesList();
    selectPipeline(currentSelectedPipeKey, null, false);
    showToast('تصویر فاز با موفقیت از سیستم بارگذاری و ذخیره شد!', 'success');
  };
  reader.readAsDataURL(file);
};



// اسکچ ۲: مدیریت گالری آثار (همراه با ویرایش لایت‌باکس مطالعه موردی ۴ فازه و لور)
function renderAdminSketch2() {
  const container = document.getElementById('adminMosaicTilesContainer');
  if (!container) return;

  let html = `
    <div class="admin-mosaic-add-tile" onclick="adminAddNewArtwork()">
      <span style="font-size:32px; line-height:1;">+</span>
      <span>افزودن اثر از اینجا</span>
    </div>
  `;

  html += showcaseArtworks.map((art, idx) => `
    <div class="admin-mosaic-card ${idx === currentSelectedArtIdx ? 'active' : ''}" onclick="selectAdminArt(${idx})">
      <img src="${art.image}" style="width:100%; height:100%; object-fit:cover;" />
      <div style="position:absolute; bottom:0; inset-inline:0; padding:6px 8px; background:rgba(0,0,0,0.85); font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${art.shortSlug}
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
  renderAdminArtLiveEditor();
}

window.selectAdminArt = function(idx) {
  currentSelectedArtIdx = idx;
  renderAdminSketch2();
};

function renderAdminArtLiveEditor() {
  const art = showcaseArtworks[currentSelectedArtIdx];
  const box = document.getElementById('adminArtFormFields');
  if (!art || !box) return;

  if (!art.phases || art.phases.length < 4) {
    art.phases = [
      { name: 'اتود اولیه و سیلوئت', img: art.image },
      { name: 'لاین‌آرت فنی و کادر', img: art.image },
      { name: 'مطالعه نوری و مقداری', img: art.image },
      { name: 'رندر متریال نهایی', img: art.image }
    ];
  }

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="height:140px; border-radius:10px; overflow:hidden; border:1px solid var(--border-subtle);">
        <img id="adminArtPreviewCover" src="${art.image}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
      
      <!-- آپلود کاور اصلی اثر (هم انتخاب فایل هم لینک) -->
      <div style="padding:10px; border-radius:10px; background:#040609; border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; font-weight:800; color:var(--iris);">تصویر اصلی اثر (کاور گالری):</span>
          <label class="btn-gold" style="cursor:pointer; font-size:10.5px; padding:5px 12px; background:var(--iris); color:#fff; border-radius:6px;">
            📁 انتخاب فایل عکس
            <input type="file" accept="image/*" style="display:none;" onchange="handleAdminArtCoverUpload(event)" />
          </label>
        </div>
        <input type="text" value="${art.image}" onchange="updateCurrentArtField('image', this.value)" class="font-mono" style="font-size:11px;" placeholder="https://..." />
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">عنوان کامل اثر</label>
        <input type="text" value="${art.title}" onchange="updateCurrentArtField('title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">اسلاگ هاور گالری</label>
          <input type="text" value="${art.shortSlug}" onchange="updateCurrentArtField('shortSlug', this.value)" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">پایپلاین دیپ‌لینک</label>
          <select onchange="updateCurrentArtField('pipelineKey', this.value)">
            <option value="sketch1" ${art.pipelineKey === 'sketch1' ? 'selected' : ''}>کاراکتر</option>
            <option value="sketch_creature" ${art.pipelineKey === 'sketch_creature' ? 'selected' : ''}>هیولا و موجودات</option>
            <option value="sketch2" ${art.pipelineKey === 'sketch2' ? 'selected' : ''}>فضا و معماری دنیا</option>
            <option value="sketch3" ${art.pipelineKey === 'sketch3' ? 'selected' : ''}>کاور و کی‌فریم</option>
            <option value="sketch4" ${art.pipelineKey === 'sketch4' ? 'selected' : ''}>پراپ و UI</option>
            <option value="sketch5" ${art.pipelineKey === 'sketch5' ? 'selected' : ''}>کمیک و مانگا</option>
          </select>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">لور داستانی</label>
          <input type="text" value="${art.lore || 'جهان اکستوپیا'}" onchange="updateCurrentArtField('lore', this.value)" />
        </div>
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">مشخصات رنگی</label>
          <input type="text" value="${art.colorSpace || 'مستر 4K / ۱۶ بیتی ProPhoto RGB'}" onchange="updateCurrentArtField('colorSpace', this.value)" />
        </div>
      </div>
      
      <!-- تصاویر ۴ فاز مطالعه موردی (هم آپلود فایل هم لینک) -->
      <div style="padding:10px; border-radius:10px; background:#070a10; border:1px solid var(--border-subtle); margin-top:2px;">
        <span style="font-size:11px; font-weight:800; color:var(--gold); display:block; margin-bottom:6px;">تصاویر ۴ فاز لایت‌باکس مطالعه موردی (Case-Study):</span>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${[0, 1, 2, 3].map(pIdx => {
            const phaseNames = ['فاز ۱ (سیلوئت)', 'فاز ۲ (لاین‌آرت)', 'فاز ۳ (والیو/نور)', 'فاز ۴ (رندر نهایی)'];
            const currentImg = (art.phases && art.phases[pIdx]) ? art.phases[pIdx].img : art.image;
            return `
              <div style="padding:6px; background:#040609; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <span style="font-size:10px; color:var(--text-muted); font-weight:700;">${phaseNames[pIdx]}</span>
                  <label class="btn-secondary" style="cursor:pointer; font-size:9.5px; padding:2px 8px; border-radius:4px;">
                    📁 انتخاب عکس
                    <input type="file" accept="image/*" style="display:none;" onchange="handleAdminPhaseFileUpload(event, ${pIdx})" />
                  </label>
                </div>
                <input type="text" value="${currentImg}" onchange="updateArtPhaseImg(${currentSelectedArtIdx}, ${pIdx}, this.value)" class="font-mono" style="font-size:10.5px; padding:4px 8px;" />
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">توضیحات اثر</label>
        <textarea rows="2" onchange="updateCurrentArtField('desc', this.value)">${art.desc || ''}</textarea>
      </div>
      <button type="button" onclick="adminDeleteArtwork(${currentSelectedArtIdx})" class="btn-secondary" style="color:var(--crimson); margin-top:4px; border-color:rgba(239,68,68,0.3);">حذف این اثر از گالری</button>
    </div>
  `;
}

window.updateCurrentArtField = function(field, value) {
  showcaseArtworks[currentSelectedArtIdx][field] = value;
  localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  applySectionVisibility();
  renderShowcaseGrid();
  renderAdminSketch2();
  showToast('اثر با موفقیت ویرایش شد.', 'success');
};

window.handleAdminArtCoverUpload = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    showcaseArtworks[currentSelectedArtIdx].image = dataUrl;
    if (showcaseArtworks[currentSelectedArtIdx].phases && showcaseArtworks[currentSelectedArtIdx].phases[3]) {
      showcaseArtworks[currentSelectedArtIdx].phases[3].img = dataUrl;
    }
    localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
    renderShowcaseGrid();
    renderAdminSketch2();
    showToast('تصویر کاور اثر با موفقیت از سیستم بارگذاری شد!', 'success');
  };
  reader.readAsDataURL(file);
};

window.handleAdminPhaseFileUpload = function(event, phaseIdx) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (showcaseArtworks[currentSelectedArtIdx] && showcaseArtworks[currentSelectedArtIdx].phases && showcaseArtworks[currentSelectedArtIdx].phases[phaseIdx]) {
      showcaseArtworks[currentSelectedArtIdx].phases[phaseIdx].img = dataUrl;
      localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
      renderAdminArtLiveEditor();
      showToast('تصویر فاز ' + (phaseIdx + 1) + ' با موفقیت آپلود شد.', 'success');
    }
  };
  reader.readAsDataURL(file);
};


window.updateArtField = function(idx, field, value) {
  showcaseArtworks[idx][field] = value;
  localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  applySectionVisibility();
  renderShowcaseGrid();
  showToast('اثر با موفقیت ویرایش شد.', 'success');
};

window.adminAddNewArtwork = function() {
  showcaseArtworks.unshift({
    id: Date.now(),
    tag: 'character',
    shortSlug: 'اثر جدید',
    title: 'کانسپت مستر جدید استودیو',
    desc: 'طراحی توسعه بصری توسط سید سروش تاج.',
    pipelineKey: 'sketch1',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    colorSpace: 'مستر 4K / ۱۶ بیتی ProPhoto RGB',
    lore: 'جهان اکستوپیا',
    phases: [
      { name: 'اتود اولیه و سیلوئت', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
      { name: 'لاین‌آرت فنی', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
      { name: 'سایه‌زنی مقداری', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' },
      { name: 'رندر متریال نهایی', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' }
    ]
  });
  localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  currentSelectedArtIdx = 0;
  renderAdminSketch2();
  applySectionVisibility();
  renderShowcaseGrid();
  showToast('آرت‌ورک جدید به گالری اضافه شد.', 'success');
};

window.adminDeleteArtwork = function(idx) {
  showcaseArtworks.splice(idx, 1);
  localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(showcaseArtworks));
  currentSelectedArtIdx = Math.max(0, currentSelectedArtIdx - 1);
  renderAdminSketch2();
  applySectionVisibility();
  renderShowcaseGrid();
  showToast('اثر حذف شد.', 'info');
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
        <img id="adminProductPreviewImg" src="${p.img}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
      
      <!-- بخش آپلود تصویر کاور دارایی دیجیتال (هم فایل هم لینک) -->
      <div style="padding:10px; border-radius:10px; background:#040609; border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; font-weight:800; color:var(--cyan-electric);">تصویر کاور دارایی:</span>
          <label class="btn-gold" style="cursor:pointer; font-size:10.5px; padding:5px 12px; background:var(--cyan-electric); color:#000; border-radius:6px;">
            📁 انتخاب عکس از سیستم
            <input type="file" accept="image/*" style="display:none;" onchange="handleAdminProductCoverUpload(event)" />
          </label>
        </div>
        <input type="text" value="${p.img}" onchange="updateCurrentProductField('img', this.value)" class="font-mono" style="font-size:11px;" placeholder="https://..." />
      </div>

      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">عنوان دارایی / پکیج</label>
        <input type="text" value="${p.title}" onchange="updateCurrentProductField('title', this.value)" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">شاخه دارایی (۷ شاخه)</label>
          <select onchange="updateCurrentProductField('type', this.value)">
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
          <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">قیمت پایه (دلار)</label>
          <input type="number" value="${p.price}" onchange="updateCurrentProductField('price', parseInt(this.value, 10))" class="font-mono" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">کلید دسترسی لور (Genesis Key)</label>
        <input type="text" value="${p.loreKey || ''}" onchange="updateCurrentProductField('loreKey', this.value)" />
      </div>
      <div>
        <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:3px;">توضیحات و محتویات بسته</label>
        <textarea rows="3" onchange="updateCurrentProductField('desc', this.value)">${p.desc || ''}</textarea>
      </div>
      <button type="button" onclick="adminDeleteProduct(${currentSelectedProductIdx})" class="btn-secondary" style="color:var(--crimson); margin-top:4px; border-color:rgba(239,68,68,0.3);">حذف این دارایی از فروشگاه</button>
    </div>
  `;
}

window.updateCurrentProductField = function(field, val) {
  digitalStoreProducts[currentSelectedProductIdx][field] = val;
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
  renderProducts();
  renderAdminProductsTab();
  showToast('مشخصات دارایی ذخیره شد.', 'success');
};

window.handleAdminProductCoverUpload = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    digitalStoreProducts[currentSelectedProductIdx].img = dataUrl;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(digitalStoreProducts));
    renderProducts();
    renderAdminProductsTab();
    showToast('تصویر کاور دارایی با موفقیت بارگذاری و ذخیره شد!', 'success');
  };
  reader.readAsDataURL(file);
};


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
        ${m.assetsBought.map(a => `
          <div style="padding:8px 10px; background:#070a10; border-radius:8px; border:1px solid var(--border-subtle); font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>${a}</span>
            <span style="color:var(--emerald); font-size:11px; font-weight:700;">✓ دسترسی فعال</span>
          </div>
        `).join('')}
      </div>
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
  applySectionVisibility();
  renderShowcaseGrid();
  selectPipeline('sketch1', document.querySelector('#atelierServiceCards .service-nav-card.active'), false);
  renderProducts();
  renderAcademy();
  renderComicPage();

  renderAdminSketch2();
  renderAdminSketch1();
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
      const phase = document.getElementById('orderPhaseSelect').value;
      const brief = document.getElementById('orderClientBrief').value.trim();
      const priceText = document.getElementById('modalPrice').textContent;

      const newOrder = {
        id: Date.now(),
        client: client,
        contact: contact,
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

  // فرم ورود اعضا
  const loginForm = document.getElementById('memberLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const em = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pw = document.getElementById('loginPass').value.trim();

      if (em === 'soroush') {
        if (pw === (siteSettings.adminPass || 'tajinkart')) {
          closeMemberModal();
          document.getElementById('adminLoginGate').classList.add('hidden');
          document.getElementById('adminWorkspace').classList.remove('hidden');
          switchView('admin');
          switchAdminTab('artworks', document.querySelector('#adminWorkspace .store-dual-btn'));
          showToast('مرکز کنترل و پنل مدیریت استودیو گشوده شد.', 'success');
          return;
        } else {
          showToast('رمز عبور مدیر استودیو نامعتبر است.', 'error');
          return;
        }
      }

      currentMember = { name: em.split('@')[0], email: em, contact: em, assetsBought: [] };
      document.getElementById('rightMemberLabel').textContent = currentMember.name;
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast(`خوش آمدید، ${currentMember.name}`, 'success');
    });
  }

  // فرم ثبت‌نام اعضا
  const signUpForm = document.getElementById('memberSignUpForm');
  if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const phone = document.getElementById('signupPhone').value.trim();
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
      localStorage.setItem(KEYS.MEMBERS, JSON.stringify(siteMembersData));

      document.getElementById('rightMemberLabel').textContent = currentMember.name;
      closeMemberModal();
      renderMemberDashboard();
      switchView('member-dashboard');
      showToast('حساب کاربری جدید شما با موفقیت ایجاد شد!', 'success');
    });
  }

  // فرم بازیابی رمز
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('forgotNewPass').value.trim();
      if (newPass.length < 6) {
        showToast('رمز عبور باید حداقل ۶ کاراکتر باشد.', 'error');
        return;
      }
      showToast('رمز عبور جدید شما با موفقیت ذخیره شد. اکنون وارد شوید.', 'success');
      document.getElementById('loginPass').value = newPass;
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
        switchAdminTab('artworks', document.querySelector('#adminWorkspace .store-dual-btn'));
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
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(siteSettings));
      renderProducts();
      selectPipeline(currentSelectedPipeKey, null, false);
      showToast('تنظیمات سراسری ذخیره و نرخ دلار به‌روزرسانی شد!', 'success');
    });
  }
});


// ===================================================
// سیستم کنترل چشم و پنهان/آشکارسازی بخش‌ها و آیکون‌ها (Eye Dropper / Visibility Manager)
// ===================================================

function applySectionVisibility() {
  const vis = siteSettings.sectionVisibility || {
    showcase: true,
    store: true,
    genesis: true,
    academy: true,
    society: true
  };

  const sections = {
    showcase: document.getElementById('view-showcase'),
    store: document.getElementById('view-store'),
    genesis: document.getElementById('view-genesis'),
    academy: document.getElementById('view-academy'),
    society: document.getElementById('view-society')
  };

  for (const [key, el] of Object.entries(sections)) {
    if (el) {
      if (vis[key] === false && currentView !== 'admin') {
        el.setAttribute('data-hidden-by-admin', 'true');
        el.classList.add('hidden');
        if (currentView === key) {
          const firstOpen = Object.keys(vis).find(k => vis[k] === true) || 'showcase';
          switchView(firstOpen);
        }
      } else {
        el.removeAttribute('data-hidden-by-admin');
      }
    }
  }

  renderRightNavItems();
  renderMobileNavItems();
}

function renderRightNavItems() {
  const container = document.getElementById('rightNavItemsContainer');
  if (!container) return;

  const items = siteSettings.navItems || [];
  container.innerHTML = items.map(function(item, idx) {
    if (!item.visible) return '';
    return '<button onclick="' + item.action + '" class="right-exp-btn ' + (item.theme || 'gold-theme') + '" title="' + item.label + '">' +
      '<span class="right-exp-icon">' +
        '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />' +
        '</svg>' +
      '</span>' +
      '<span class="right-exp-text">' +
        '<span class="right-exp-title" style="color:' + (item.color || 'var(--gold)') + ';">' + item.label + '</span>' +
        '<span class="right-exp-sub">' + (item.sub || '') + '</span>' +
      '</span>' +
    '</button>';
  }).join('');
}

function renderMobileNavItems() {
  const container = document.getElementById('mobileBottomNav');
  if (!container) return;

  const vis = siteSettings.sectionVisibility || {};
  const buttons = container.querySelectorAll('.mob-nav-btn');
  const mapping = ['showcase', 'store', 'genesis', 'academy', 'members'];

  buttons.forEach(function(btn, idx) {
    const key = mapping[idx];
    if (key && vis[key] === false) {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'flex';
    }
  });
}

function renderAdminEyeControls() {
  const container = document.getElementById('adminSectionEyeControls');
  if (!container) return;

  const vis = siteSettings.sectionVisibility || {
    showcase: true,
    store: true,
    genesis: true,
    academy: true,
    society: true
  };

  const labels = {
    showcase: '۱. گالری آثار و صفحه اصلی',
    store: '۲. فروشگاه و آتلیه سفارش کانسپت',
    genesis: '۳. جهان جنسیس و کمیک‌خوان',
    academy: '۴. آکادمی طراحی و مسترکلاس‌ها',
    society: '۵. جامعه هنری و شبکه‌ها'
  };

  container.innerHTML = Object.keys(labels).map(function(key) {
    const isVisible = vis[key] !== false;
    return '<div style="padding:10px 14px; background:#070a10; border-radius:10px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">' +
      '<span style="font-size:12.5px; font-weight:700;">' + labels[key] + '</span>' +
      '<button type="button" onclick="toggleSectionVisibility(' + JSON.stringify(key) + ')" class="btn-secondary" style="padding:5px 12px; font-size:11px; display:flex; align-items:center; gap:6px; border-color:' + (isVisible ? 'var(--emerald)' : 'var(--crimson)') + '; color:' + (isVisible ? '#6ee7b7' : '#fca5a5') + ';">' +
        '<span>' + (isVisible ? '👁️ فعال و نمایان' : '🚫 مخفی از اعضا') + '</span>' +
      '</button>' +
    '</div>';
  }).join('');

  renderAdminNavItemsManager();
}

window.toggleSectionVisibility = function(key) {
  if (!siteSettings.sectionVisibility) siteSettings.sectionVisibility = {};
  siteSettings.sectionVisibility[key] = !siteSettings.sectionVisibility[key];
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(siteSettings));
  applySectionVisibility();
  renderAdminEyeControls();
  const stateText = siteSettings.sectionVisibility[key] ? 'نمایان' : 'مخفی';
  showToast('وضعیت بخش «' + key + '» به حالت ' + stateText + ' تغییر یافت.', 'info');
};

function renderAdminNavItemsManager() {
  const container = document.getElementById('adminNavItemsManager');
  if (!container) return;

  const items = siteSettings.navItems || [];
  container.innerHTML = items.map(function(item, idx) {
    return '<div style="padding:10px 12px; background:#070a10; border-radius:10px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
      '<div style="display:flex; flex-direction:column; gap:2px;">' +
        '<span style="font-size:12px; font-weight:800; color:' + (item.color || '#fff') + ';">' + item.label + '</span>' +
        '<span style="font-size:10px; color:var(--text-muted);">' + (item.sub || '') + '</span>' +
      '</div>' +
      '<div style="display:flex; align-items:center; gap:6px;">' +
        '<button type="button" onclick="toggleNavItemEye(' + idx + ')" class="btn-secondary" style="padding:4px 8px; font-size:11px; border-color:' + (item.visible ? 'var(--emerald)' : 'var(--crimson)') + '; color:' + (item.visible ? '#6ee7b7' : '#fca5a5') + ';">' +
          (item.visible ? '👁️' : '🚫') +
        '</button>' +
        '<button type="button" onclick="editNavItemPrompt(' + idx + ')" class="btn-secondary" style="padding:4px 8px; font-size:10px;">ویرایش متن</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

window.toggleNavItemEye = function(idx) {
  if (siteSettings.navItems && siteSettings.navItems[idx]) {
    siteSettings.navItems[idx].visible = !siteSettings.navItems[idx].visible;
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(siteSettings));
    applySectionVisibility();
    renderAdminNavItemsManager();
    showToast('وضعیت آیکون داک ناوبری به‌روزرسانی شد.', 'info');
  }
};

window.editNavItemPrompt = function(idx) {
  const item = siteSettings.navItems[idx];
  if (!item) return;
  const newLabel = prompt('عنوان اصلی آیکون را وارد کنید:', item.label);
  if (newLabel && newLabel.trim()) {
    const newSub = prompt('زیرعنوان یا توضیحات کوچک را وارد کنید:', item.sub || '');
    item.label = newLabel.trim();
    if (newSub !== null) item.sub = newSub.trim();
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(siteSettings));
    applySectionVisibility();
    renderAdminNavItemsManager();
    showToast('عنوان آیکون تغییر یافت.', 'success');
  }
};

window.adminAddNewNavItem = function() {
  const label = prompt('عنوان گزینه ناوبری جدید:');
  if (!label || !label.trim()) return;
  const sub = prompt('توضیح کوتاه زیرعنوان:') || '';
  const newAction = prompt("دستور اجرا در زمان کلیک (مثلاً switchView('store')):", "switchView('store')") || "switchView('store')";

  if (!siteSettings.navItems) siteSettings.navItems = [];
  siteSettings.navItems.push({
    id: 'nav_' + Date.now(),
    label: label.trim(),
    sub: sub.trim(),
    color: 'var(--gold)',
    theme: 'gold-theme',
    visible: true,
    action: newAction
  });
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(siteSettings));
  applySectionVisibility();
  renderAdminNavItemsManager();
  showToast('گزینه ناوبری جدید به داک راست اضافه شد.', 'success');
};
