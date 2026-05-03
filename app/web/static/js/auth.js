import { apiGet, apiPut, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, showFieldError, clearFieldErrors, refreshIcons } from './utils.js';
import { getAuthState, setAuthState, getSystemStatus } from './state.js';

const LOGIN_TEMPLATE = `
  <div id="login-screen" class="hero-screen landing-page">
    <div class="lp-header" style="margin-bottom: var(--space-4);">
      <img src="/logotipo-informescreator.png" alt="InformesCreator" class="lp-logo-img">
    </div>
    <div class="lp-tagline-wrap" style="margin-bottom: var(--space-6);">
      <h1 class="lp-tagline-main" style="font-size: 1.5rem;">Iniciar sesión</h1>
      <svg class="lp-tagline-underline" width="140" height="10" viewBox="0 0 140 10" aria-hidden="true" style="width: 100px;">
        <path d="M0,6 Q25,2 50,6 Q75,10 100,5" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
      </svg>
    </div>
    <div style="width: 100%; max-width: 320px;">
      <form id="login-form" class="auth-form" novalidate>
        <div class="auth-field">
          <label for="login-username">Usuario</label>
          <input type="text" id="login-username" placeholder="Tu usuario" autocomplete="username" required>
          <p class="auth-field-error" id="login-username-error" role="alert"></p>
        </div>
        <div class="auth-field">
          <label for="login-password">Contraseña</label>
          <div class="auth-input-wrap">
            <input type="password" id="login-password" placeholder="Tu contraseña" autocomplete="current-password" minlength="4" required>
            <button type="button" class="btn-toggle-password" data-target="login-password" aria-label="Mostrar contraseña">
              <i data-lucide="eye" style="width:16px;height:16px;"></i>
            </button>
          </div>
          <p class="auth-field-error" id="login-password-error" role="alert"></p>
        </div>
        <button type="submit" id="btn-login" class="hero-cta" style="width: 100%; justify-content: center;">Entrar</button>
        <p id="login-error" class="auth-form-error" role="alert"></p>
      </form>
      <p class="hint" style="margin-top: 16px;">¿Primera vez? <a href="#/register" id="link-register" style="color: var(--accent); font-weight: 600;">Crear perfil</a></p>
    </div>
  </div>
`;

const REGISTER_TEMPLATE = `
  <div id="register-screen" class="hero-screen landing-page">
    <div class="lp-header" style="margin-bottom: var(--space-4);">
      <img src="/logotipo-informescreator.png" alt="InformesCreator" class="lp-logo-img">
    </div>
    <div class="lp-tagline-wrap" style="margin-bottom: var(--space-6);">
      <h1 class="lp-tagline-main" style="font-size: 1.5rem;">Crear perfil</h1>
      <svg class="lp-tagline-underline" width="140" height="10" viewBox="0 0 140 10" aria-hidden="true" style="width: 100px;">
        <path d="M0,6 Q25,2 50,6 Q75,10 100,5" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
      </svg>
    </div>
    <div style="width: 100%; max-width: 320px;">
      <form id="register-form" class="auth-form" novalidate>
        <div class="auth-field">
          <label for="reg-username">Usuario</label>
          <input type="text" id="reg-username" placeholder="Elegí un usuario" autocomplete="username" required>
          <p class="auth-field-error" id="reg-username-error" role="alert"></p>
        </div>
        <div class="auth-field">
          <label for="reg-display-name">Nombre completo (opcional)</label>
          <input type="text" id="reg-display-name" placeholder="Ej: Marta Lopez" autocomplete="name">
        </div>
        <div class="auth-field">
          <label for="reg-password">Contraseña</label>
          <div class="auth-input-wrap">
            <input type="password" id="reg-password" placeholder="Elegí una contraseña" autocomplete="new-password" minlength="4" required>
            <button type="button" class="btn-toggle-password" data-target="reg-password" aria-label="Mostrar contraseña">
              <i data-lucide="eye" style="width:16px;height:16px;"></i>
            </button>
          </div>
          <p class="auth-field-error" id="reg-password-error" role="alert"></p>
        </div>
        <div class="auth-field">
          <label for="reg-password-confirm">Repetí la contraseña</label>
          <div class="auth-input-wrap">
            <input type="password" id="reg-password-confirm" placeholder="Repetí la contraseña" autocomplete="new-password" minlength="4" required>
            <button type="button" class="btn-toggle-password" data-target="reg-password-confirm" aria-label="Mostrar contraseña">
              <i data-lucide="eye" style="width:16px;height:16px;"></i>
            </button>
          </div>
          <p class="auth-field-error" id="reg-password-confirm-error" role="alert"></p>
        </div>
        <button type="submit" id="btn-register" class="hero-cta" style="width: 100%; justify-content: center;">Crear perfil</button>
        <p id="register-error" class="auth-form-error" role="alert"></p>
      </form>
      <p class="hint" style="margin-top: 16px;"><a href="#/login" id="link-login" style="color: var(--accent); font-weight: 600;">Ya tengo perfil</a></p>
    </div>
  </div>
`;

function bindAuthListeners() {
  $('login-form').addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
  $('register-form').addEventListener('submit', (e) => { e.preventDefault(); doRegister(); });
  $('link-register').addEventListener('click', (e) => { e.preventDefault(); navigateTo('#/register'); });
  $('link-login').addEventListener('click', (e) => { e.preventDefault(); navigateTo('#/login'); });

  ['login-username', 'login-password'].forEach(id => {
    $(id).addEventListener('input', () => {
      import('./utils.js').then(m => {
        m.clearFieldErrors(['login-username-error', 'login-password-error']);
      });
      $('login-error').textContent = '';
    });
  });

  ['reg-username', 'reg-password', 'reg-password-confirm'].forEach(id => {
    $(id).addEventListener('input', () => {
      import('./utils.js').then(m => {
        m.clearFieldErrors(['reg-username-error', 'reg-password-error', 'reg-password-confirm-error']);
      });
      $('register-error').textContent = '';
    });
  });
}

export function showLoginScreen() {
  const root = $('auth-root');
  if (!root) return;
  root.innerHTML = LOGIN_TEMPLATE;
  if (window.lucide) lucide.createIcons({ nodes: [root] });
  bindAuthListeners();
}

export function showRegisterScreen() {
  const root = $('auth-root');
  if (!root) return;
  root.innerHTML = REGISTER_TEMPLATE;
  if (window.lucide) lucide.createIcons({ nodes: [root] });
  bindAuthListeners();
}

export function clearAuthScreen() {
  const root = $('auth-root');
  if (root) root.innerHTML = '';
}

export function hideAuthScreen() {
  hide($('auth-root'));
}

export function loadAuthState() {
  try {
    const raw = localStorage.getItem('informescreator_auth');
    if (raw) {
      setAuthState(JSON.parse(raw));
    }
  } catch (e) {
    setAuthState({ loggedIn: false, username: '' });
  }
}

export function saveAuthState() {
  localStorage.setItem('informescreator_auth', JSON.stringify(getAuthState()));
}

export function navigateTo(hash) {
  import('./state.js').then(mod => {
    if (mod.getIsNavigating()) return;
    mod.setIsNavigating(true);
  });
  window.location.hash = hash;
  setTimeout(() => {
    import('./state.js').then(mod => mod.setIsNavigating(false));
  }, 0);
}

export async function initAuth() {
  loadAuthState();
  const authState = getAuthState();
  if (authState.loggedIn) {
    const headerUsername = $('sidebar-username');
    if (headerUsername) headerUsername.textContent = authState.username;
    return;
  }
  try {
    const profile = await apiGet('/auth/me');
    if (profile.username) {
      setAuthState({ loggedIn: true, username: profile.display_name || profile.username });
      saveAuthState();
      const headerUsername = $('sidebar-username');
      if (headerUsername) headerUsername.textContent = profile.display_name || profile.username;
    }
  } catch (err) {
  }
}

export async function doLogin() {
  const username = $('login-username').value.trim();
  const password = $('login-password').value;
  const formErrorEl = $('login-error');
  formErrorEl.textContent = '';
  clearFieldErrors(['login-username-error', 'login-password-error']);
  let valid = true;
  if (!username) {
    showFieldError('login-username-error', 'Ingresa tu usuario.');
    valid = false;
  }
  if (!password) {
    showFieldError('login-password-error', 'Ingresa tu contraseña.');
    valid = false;
  } else if (password.length < 4) {
    showFieldError('login-password-error', 'La contraseña debe tener al menos 4 caracteres.');
    valid = false;
  }
  if (!valid) return;
  setLoading(true);
  try {
    const res = await apiPost('/auth/login', { username, password });
    setAuthState({ loggedIn: true, username: res.username });
    saveAuthState();
    $('sidebar-username').textContent = res.display_name || res.username;
    clearAuthScreen();
    navigateTo('#/');
    import('./app.js').then(mod => {
      mod.showHero();
      mod.preloadSystemStatus();
    });
  } catch (err) {
    if (err.status === 401) {
      formErrorEl.textContent = 'Usuario o contraseña incorrectos.';
    } else {
      formErrorEl.textContent = 'No se pudo iniciar sesión. ' + (err.message || '');
    }
  } finally {
    setLoading(false);
  }
}

export async function doRegister() {
  const username = $('reg-username').value.trim();
  const displayName = $('reg-display-name').value.trim();
  const password = $('reg-password').value;
  const passwordConfirm = $('reg-password-confirm').value;
  const formErrorEl = $('register-error');
  formErrorEl.textContent = '';
  clearFieldErrors(['reg-username-error', 'reg-password-error', 'reg-password-confirm-error']);
  let valid = true;
  if (!username) {
    showFieldError('reg-username-error', 'Elegi un usuario.');
    valid = false;
  }
  if (!password) {
    showFieldError('reg-password-error', 'Elegí una contraseña.');
    valid = false;
  } else if (password.length < 4) {
    showFieldError('reg-password-error', 'La contraseña debe tener al menos 4 caracteres.');
    valid = false;
  }
  if (!passwordConfirm) {
    showFieldError('reg-password-confirm-error', 'Repetí la contraseña.');
    valid = false;
  } else if (password !== passwordConfirm) {
    showFieldError('reg-password-confirm-error', 'Las contraseñas no coinciden.');
    valid = false;
  }
  if (!valid) return;
  setLoading(true);
  try {
    await apiPost('/auth/register', { username, password, display_name: displayName || undefined });
    showToast('Perfil creado exitosamente. Por favor, iniciá sesión.', 'success');
    navigateTo('#/login');
  } catch (err) {
    formErrorEl.textContent = (err.detail || err.message) || 'No se pudo crear el perfil.';
  } finally {
    setLoading(false);
  }
}

export async function doLogout() {
  try {
    await apiPost('/auth/logout', {});
  } catch (err) {
  }
  setAuthState({ loggedIn: false, username: '' });
  saveAuthState();
  closeProfileModal();
  navigateTo('#/login');
}

const PROFILE_MODAL_TEMPLATE = `
  <div id="profile-modal" class="help-modal">
    <div class="help-overlay"></div>
    <div class="help-panel" style="max-width: 460px;">
      <div class="help-header">
        <h3>Mi Perfil</h3>
        <button id="btn-close-profile" class="btn-ghost btn-sm">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div id="profile-content">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <i data-lucide="user" style="width:32px;height:32px;"></i>
          </div>
          <div class="profile-user-info">
            <span class="profile-user-label">Usuario</span>
            <span id="profile-username" class="profile-user-value"></span>
          </div>
        </div>
        <form id="profile-edit-form" class="auth-form" novalidate>
          <div class="profile-section-title">
            <i data-lucide="pencil" style="width:14px;height:14px;"></i>
            Datos personales
          </div>
          <div class="auth-field">
            <label for="profile-display-name">Nombre para mostrar</label>
            <input type="text" id="profile-display-name" placeholder="Ej: Marta Lopez">
          </div>
          <div class="profile-section-title" style="margin-top: var(--space-4);">
            <i data-lucide="lock" style="width:14px;height:14px;"></i>
            Cambiar contrasena
          </div>
          <div class="auth-field">
            <label for="profile-new-password">Nueva contrasena</label>
            <input type="password" id="profile-new-password" placeholder="Dejar vacio para no cambiar" minlength="4">
            <p class="auth-field-error" id="profile-password-error" role="alert"></p>
          </div>
          <div class="auth-field">
            <label for="profile-confirm-password">Repetir nueva contrasena</label>
            <input type="password" id="profile-confirm-password" placeholder="Repetir nueva contrasena" minlength="4">
            <p class="auth-field-error" id="profile-confirm-password-error" role="alert"></p>
          </div>
          <button type="submit" id="btn-save-profile" class="btn-primary" style="width:100%; margin-top: var(--space-3); justify-content: center;">
            <i data-lucide="save" style="width:16px;height:16px;"></i> Guardar cambios
          </button>
          <p id="profile-save-error" class="auth-form-error" role="alert"></p>
        </form>
        <div class="profile-divider"></div>
        <div class="profile-section-title">
          <i data-lucide="folder" style="width:14px;height:14px;"></i>
          Carpeta de trabajo
        </div>
        <div class="profile-folder-box">
          <span id="profile-folder-path" class="profile-folder-text">Sin configurar</span>
          <button id="btn-change-folder" class="btn-secondary btn-sm">
            <i data-lucide="folder-search" style="width:14px;height:14px;"></i> Cambiar
          </button>
        </div>
        <div class="profile-divider"></div>
        <button id="btn-logout" class="btn-danger" style="width:100%; justify-content: center;">
          <i data-lucide="log-out" style="width:16px;height:16px;"></i> Cerrar sesion
        </button>
      </div>
    </div>
  </div>
`;

function bindProfileListeners() {
  $('btn-close-profile').addEventListener('click', closeProfileModal);
  $('btn-change-folder').addEventListener('click', doChangeFolder);
  $('btn-logout').addEventListener('click', doLogout);
  $('profile-modal').addEventListener('click', function onBackdrop(e) {
    if (e.target === $('profile-modal') || e.target.classList.contains('help-overlay')) {
      closeProfileModal();
    }
  });
  $('profile-edit-form').addEventListener('submit', (e) => { e.preventDefault(); saveProfile(); });
  ['profile-new-password', 'profile-confirm-password'].forEach(id => {
    $(id).addEventListener('input', () => {
      import('./utils.js').then(m => {
        m.clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
      });
      $('profile-save-error').textContent = '';
    });
  });
}

export async function openProfileModal() {
  const root = $('profile-root');
  if (!root) return;
  root.innerHTML = PROFILE_MODAL_TEMPLATE;
  if (window.lucide) lucide.createIcons({ nodes: [root] });
  bindProfileListeners();

  try {
    const cfg = await apiGet('/config');
    $('profile-folder-path').textContent = cfg.base_path || 'Sin configurar';
  } catch (err) {
    $('profile-folder-path').textContent = 'Error cargando config';
  }
  try {
    const profile = await apiGet('/auth/me');
    $('profile-username').textContent = profile.username || getAuthState().username || '';
    $('profile-display-name').value = profile.display_name || '';
  } catch (err) {
    $('profile-username').textContent = getAuthState().username || '';
    $('profile-display-name').value = '';
  }
  $('profile-new-password').value = '';
  $('profile-confirm-password').value = '';
  clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
  $('profile-save-error').textContent = '';
  const btn = $('btn-save-profile');
  btn.classList.remove('btn-saved');
  btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar cambios';
  if (window.lucide) lucide.createIcons({ nodes: [btn] });
  show($('profile-modal'));
}

export function closeProfileModal() {
  hide($('profile-modal'));
  const root = $('profile-root');
  if (root) root.innerHTML = '';
}

export async function saveProfile() {
  const displayName = $('profile-display-name').value.trim();
  const newPassword = $('profile-new-password').value;
  const confirmPassword = $('profile-confirm-password').value;
  const errorEl = $('profile-save-error');
  errorEl.textContent = '';
  clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
  if (newPassword && newPassword.length < 4) {
    showFieldError('profile-password-error', 'La contraseña debe tener al menos 4 caracteres.');
    return;
  }
  if (newPassword && newPassword !== confirmPassword) {
    showFieldError('profile-confirm-password-error', 'Las contraseñas no coinciden.');
    return;
  }
  const payload = {};
  if (displayName) payload.display_name = displayName;
  if (newPassword) payload.password = newPassword;
  if (!payload.display_name && !payload.password) {
    showToast('No hay cambios para guardar.', 'info');
    return;
  }
  try {
    const res = await apiPut('/auth/profile', payload);
    if (res.display_name) {
      $('sidebar-username').textContent = res.display_name;
    }
    const btn = $('btn-save-profile');
    btn.classList.add('btn-saved');
    btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> Guardado';
    if (window.lucide) lucide.createIcons({ nodes: [btn] });
    $('profile-new-password').value = '';
    $('profile-confirm-password').value = '';
    showToast('Perfil actualizado correctamente.', 'success');
    setTimeout(() => {
      btn.classList.remove('btn-saved');
      btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar cambios';
      if (window.lucide) lucide.createIcons({ nodes: [btn] });
    }, 2000);
  } catch (err) {
    errorEl.textContent = (err.detail || err.message) || 'No se pudo actualizar el perfil.';
  }
}

export async function doChangeFolder() {
  try {
    setLoading(true);
    const data = await import('./api.js').then(m => m.apiGet('/pick-folder'));
    setLoading(false);
    if (data.error) {
      showToast('No se pudo abrir el selector. Intenta de nuevo.', 'error');
      return;
    }
    if (data.cancelled || !data.path) {
      return;
    }
    await apiPost('/config', { base_path: data.path });
    $('profile-folder-path').textContent = data.path;
    showToast('Carpeta actualizada.', 'success');
    const coursesGrid = $('courses-grid');
    if (coursesGrid && !coursesGrid.classList.contains('hidden')) {
      import('./app.js').then(mod => mod.loadCoursesGrid());
    }
  } catch (err) {
    setLoading(false);
    showToast('No se pudo cambiar la carpeta. Intenta de nuevo.', 'error');
  }
}
