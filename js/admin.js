/**
 * TAJINKART - Studio Director Admin Panel (100% Isolated Persian Architecture)
 */
window.switchAdminTab = function(tabKey, btnEl) {
  const allTabs = ['artworks', 'pipelines', 'orders', 'products', 'members', 'terms', 'settings'];
  
  allTabs.forEach(t => {
    const el = document.getElementById(`adminTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (el) el.classList.add('hidden');
  });

  const targetTab = document.getElementById(`adminTab${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}`);
  if (targetTab) targetTab.classList.remove('hidden');

  // به روزرسانی کلاس دکمه فعال
  document.querySelectorAll('.admin-nav-item').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // فراخوانی رندرهای وابسته به تب
  if (tabKey === 'settings') {
    if (typeof renderAdminSloganPairs === 'function') renderAdminSloganPairs();
    if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
  }
};

window.switchSettingsSubTab = function(subKey) {
  const subIdentity = document.getElementById('adminSettingsSubTab-identity');
  const subSocial = document.getElementById('adminSettingsSubTab-social');
  const btnIdentity = document.getElementById('adminSettingsSubTabBtn-identity');
  const btnSocial = document.getElementById('adminSettingsSubTabBtn-social');

  if (subKey === 'social') {
    if (subIdentity) subIdentity.classList.add('hidden');
    if (subSocial) subSocial.classList.remove('hidden');
    if (btnIdentity) btnIdentity.classList.remove('active');
    if (btnSocial) btnSocial.classList.add('active');
  } else {
    if (subSocial) subSocial.classList.add('hidden');
    if (subIdentity) subIdentity.classList.remove('hidden');
    if (btnSocial) btnSocial.classList.remove('active');
    if (btnIdentity) btnIdentity.classList.add('active');
  }
};

window.saveStudioLogoSetting = function() {
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
  showToast('نشان رسمی هدر استودیو با موفقیت ثبت و ذخیره شد! ✓', 'success', 4000);
};

window.removeStudioLogo = function() {
  siteSettings.studioLogoUrl = '';
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
  showToast('نشان هدر استودیو با موفقیت حذف شد.', 'info', 3000);
};

window.saveStudioFaviconSetting = function() {
  const favInput = document.getElementById('adminFaviconInput');
  if (favInput && favInput.value.trim()) {
    siteSettings.faviconUrl = favInput.value.trim();
  }
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  showToast('فاویکون اختصاصی مرورگر با موفقیت ثبت شد! ✓', 'success', 4000);
};

window.removeStudioFavicon = function() {
  siteSettings.faviconUrl = '';
  safeSetStorage(KEYS.SETTINGS, JSON.stringify(siteSettings));
  showToast('فاویکون تب مرورگر حذف شد.', 'info', 3000);
};

window.handleAdminLogoUpload = function(inputEl) {
  if (inputEl && inputEl.files && inputEl.files[0]) {
    const file = inputEl.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      siteSettings.studioLogoUrl = e.target.result;
      const previewImg = document.getElementById('adminLogoPreviewImg');
      const activeCard = document.getElementById('adminLogoActiveCard');
      const emptyZone = document.getElementById('adminLogoEmptyDropzone');
      if (previewImg) previewImg.src = e.target.result;
      if (activeCard) activeCard.style.display = 'flex';
      if (emptyZone) emptyZone.style.display = 'none';
      if (typeof updateStudioLogoDisplay === 'function') updateStudioLogoDisplay();
      showToast('پیش‌نمایش نشان هدر بارگذاری شد. برای تایید نهایی دکمه ثبت را بزنید.', 'info', 3500);
    };
    reader.readAsDataURL(file);
  }
};
