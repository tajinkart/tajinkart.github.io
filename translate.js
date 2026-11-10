// ==============================================================================
// TAJINKART STUDIO — TRANSLATE MODULE (translate.js)
// Floating Google Translate Controller (Alphabetical, Searchable & Multi-Language)
// ==============================================================================

window.toggleGoogleTranslateMenu = function(e) {
  if (e) e.stopPropagation();
  const flyout = document.getElementById('googleTranslateMenuFlyout');
  if (!flyout) return;
  const widget = document.getElementById('floatingGoogleTranslateWidget');
  const isOpening = flyout.classList.contains('hidden');
  if (widget) widget.classList.toggle('open', isOpening);
  flyout.classList.toggle('hidden');
  if (isOpening) {
    const searchInput = document.getElementById('googleTranslateSearchInput');
    if (searchInput) {
      searchInput.value = '';
      window.filterGoogleTranslateLanguages('');
      setTimeout(() => searchInput.focus(), 80);
    }
  }
};

// فیلتر هوشمند، دقیق و دینامیک زبان‌ها: جستجوی حروفی با اولویت پیشوند
window.filterGoogleTranslateLanguages = function(query) {
  const q = (query || '').trim().toLowerCase();
  const container = document.getElementById('googleTranslateLanguagesList');
  if (!container) return;
  const cards = Array.from(container.querySelectorAll('.lang-option-card'));

  if (!q) {
    cards.forEach(card => {
      card.style.display = 'flex';
    });
    return;
  }

  const scored = [];

  cards.forEach(card => {
    const langCode = (card.getAttribute('data-lang') || '').toLowerCase();
    const searchData = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
    const searchWords = searchData.split(/\s+/);
    const nativeName = (card.querySelector('.lang-native')?.textContent || '').toLowerCase();
    const engName = (card.querySelector('.lang-eng')?.textContent || '').toLowerCase();

    let score = 0;

    // ۱. تطابق دقیق با کد زبان (مثلاً en، ar، fa، es)
    if (langCode === q) {
      score = 1000;
    }
    // ۲. کد زبان با عبارت شروع شود (مثلاً en با e، ar با a)
    else if (langCode.startsWith(q)) {
      score = 800;
    }
    // ۳. نام انگلیسی زبان با عبارت شروع شود (مثلاً English با e، en، eng)
    else if (engName.startsWith(q)) {
      score = 600;
    }
    // ۴. نام بومی زبان با عبارت شروع شود (مثلاً Español با e یا es، یا فارسی با ف یا فا)
    else if (nativeName.startsWith(q)) {
      score = 500;
    }
    // ۵. هر کلمه‌ای از واژگان جستجو با عبارت شروع شود (مثلاً انگلیسی با ان، عربی با عر)
    else if (searchWords.some(w => w.startsWith(q))) {
      score = 400;
    }
    // ۶. در ورودی‌های ۲ حرفی یا بیشتر: کلماتی که شامل عبارت هستند
    else if (q.length >= 2) {
      if (engName.includes(q)) score = 200;
      else if (nativeName.includes(q)) score = 150;
      else if (searchWords.some(w => w.includes(q))) score = 100;
    }

    if (score > 0) {
      card.style.display = 'flex';
      scored.push({ card, score });
    } else {
      card.style.display = 'none';
    }
  });

  // مرتب‌سازی نتایج تا زبان‌های دقیقاً منطبق در بالاترین ردیف قرار گیرند
  scored.sort((a, b) => b.score - a.score);
  scored.forEach(item => {
    container.appendChild(item.card);
  });
};

window.selectStudioLanguage = function(langCode, shortLabel, fullLabel) {
  const lbl = document.getElementById('activeLanguageLabel');
  if (lbl) lbl.textContent = shortLabel;

  try {
    localStorage.setItem('tajinkart_user_lang', langCode);
    localStorage.setItem('tajinkart_user_lang_label', shortLabel);
  } catch(e) {}

  // 1. Try to set the native Google Translate select box
  let selectChanged = false;
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = langCode;
    combo.dispatchEvent(new Event('change'));
    selectChanged = true;
  }

  // 2. Set googtrans cookie for persistence across entire domain
  const host = window.location.hostname;
  const cookieVal = (langCode === 'en') ? '/en/en' : `/en/${langCode}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  if (host) {
    document.cookie = `googtrans=${cookieVal}; domain=.${host}; path=/;`;
  }

  // Close flyout
  const flyout = document.getElementById('googleTranslateMenuFlyout');
  if (flyout) flyout.classList.add('hidden');
  const widget = document.getElementById('floatingGoogleTranslateWidget');
  if (widget) widget.classList.remove('open');

  showToast(`Language set to ${fullLabel}`, 'info', 2500);

  // If combo wasn't ready or to ensure full page translation
  if (!selectChanged || !document.querySelector('.goog-te-banner-frame')) {
    setTimeout(() => {
      window.location.reload();
    }, 450);
  }
};

document.addEventListener('click', (e) => {
  const widget = document.getElementById('floatingGoogleTranslateWidget');
  if (widget && !widget.contains(e.target)) {
    const flyout = document.getElementById('googleTranslateMenuFlyout');
    if (flyout) flyout.classList.add('hidden');
    if (widget) widget.classList.remove('open');
  }
});

// Sync language button label on page load
document.addEventListener('DOMContentLoaded', () => {
  try {
    const savedLabel = localStorage.getItem('tajinkart_user_lang_label');
    if (savedLabel) {
      const lbl = document.getElementById('activeLanguageLabel');
      if (lbl) lbl.textContent = savedLabel;
    } else {
      const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z\-]+)/);
      if (match && match[1]) {
        const cCode = match[1].toUpperCase();
        const lbl = document.getElementById('activeLanguageLabel');
        if (lbl) lbl.textContent = (cCode === 'FA') ? 'FA' : (cCode === 'ZH-CN' ? 'ZH' : cCode);
      }
    }
  } catch(e) {}
});

window.googleTranslateElementInit = function() {
  try {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'fa,en,ar,tr,fr,de,es,ru,ja,ko,zh-CN,it,pt,nl,sv,pl,hi,id',
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
    }
  } catch(e) {
    console.warn('Google Translate initialization:', e);
  }
};
