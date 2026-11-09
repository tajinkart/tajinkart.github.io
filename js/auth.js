/**
 * TAJINKART - Member Auth, Security & Terms Module
 */
window.openMemberModal = function() {
  const modal = document.getElementById('memberModal');
  if (modal) modal.style.display = 'flex';
};

window.closeMemberModal = function() {
  const modal = document.getElementById('memberModal');
  if (modal) modal.style.display = 'none';
};

window.handleMemberModalBackdropClick = function(e) {
  if (e.target && e.target.id === 'memberModal') {
    closeMemberModal();
  }
};

window.switchAuthView = function(view) {
  const views = ['Login', 'SignUp', 'Forgot'];
  views.forEach(v => {
    const el = document.getElementById(`authView${v}`);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(`authView${view === 'login' ? 'Login' : view === 'signup' ? 'SignUp' : 'Forgot'}`);
  if (target) target.classList.remove('hidden');
};

window.handleMembersIconClick = function() {
  openMemberModal();
};

window.handleGoogleSignIn = function() {
  showToast('Redirecting to secure Google Sign-In...', 'info', 3000);
  setTimeout(() => {
    showToast('Demo Environment: Signed in as Verified Studio Member.', 'success', 3500);
    closeMemberModal();
  }, 1200);
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

window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🔒';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
};
