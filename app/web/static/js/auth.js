import { apiGet, apiPut, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, showFieldError, clearFieldErrors, refreshIcons } from './utils.js';
import { getAuthState, setAuthState, getSystemStatus, setSkipOnboardingOnce } from './state.js';

function detectDefaultAuthTab() {
  // Smart default: show Register if no valid session exists, Login otherwise
  const raw = localStorage.getItem('informescreator_auth');
  if (!raw) return 'register';
  try {
    const state = JSON.parse(raw);
    return state.loggedIn ? 'login' : 'register';
  } catch {
    return 'register';
  }
}

export async function renderAuthCard(mode = 'login') {
  const m = await import('./utils.js');
  const root = $('auth-root');
  if (!root) return;
  
  const loginHidden = mode === 'login' ? '' : 'hidden';
  const regHidden = mode === 'register' ? '' : 'hidden';
  const loginActive = mode === 'login' ? 'active' : '';
  const regActive = mode === 'register' ? 'active' : '';

  root.innerHTML = `
  <div class="auth-card">
    <div class="auth-header">
      <div class="auth-tabs">
        <button class="auth-tab ${loginActive}" id="tab-login">Ingresar</button>
        <button class="auth-tab ${regActive}" id="tab-register">Registrarse</button>
      </div>
    </div>

    <div class="auth-form-container">
      <div id="pane-login" class="auth-form-pane ${loginHidden}">
        <form id="login-form" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="login-username">Usuario</label>
            <input type="text" id="login-username" placeholder="Tu usuario" autocomplete="username" required>
            <p class="auth-field-error" id="login-username-error" role="alert"></p>
          </div>
          <div class="auth-field">
            <label for="login-password">Contraseña</label>
            <div class="auth-input-wrap">
              <input type="password" id="login-password" placeholder="Tu contraseña" autocomplete="current-password" required>
              <button type="button" class="btn-toggle-password" data-target="login-password" aria-label="Mostrar contraseña">
                ${m.icon('eye', 18)}
              </button>
            </div>
            <p class="auth-field-error" id="login-password-error" role="alert"></p>
          </div>
          <button type="submit" id="btn-login" class="auth-btn">
            Entrar
          </button>
          <p id="login-error" class="auth-form-error" role="alert"></p>
        </form>
      </div>

      <div id="pane-register" class="auth-form-pane ${regHidden}">
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
                ${m.icon('eye', 18)}
              </button>
            </div>
            <p class="auth-field-error" id="reg-password-error" role="alert"></p>
          </div>
          <div class="auth-field">
            <label for="reg-password-confirm">Repetí la contraseña</label>
            <div class="auth-input-wrap">
              <input type="password" id="reg-password-confirm" placeholder="Repetí la contraseña" autocomplete="new-password" minlength="4" required>
              <button type="button" class="btn-toggle-password" data-target="reg-password-confirm" aria-label="Mostrar contraseña">
                ${m.icon('eye', 18)}
              </button>
            </div>
            <p class="auth-field-error" id="reg-password-confirm-error" role="alert"></p>
          </div>
          <button type="submit" id="btn-register" class="auth-btn">
            Crear perfil
          </button>
          <p id="register-error" class="auth-form-error" role="alert"></p>
        </form>
      </div>
    </div>
  </div>
`;
  
  bindAuthListeners();
}

function bindAuthListeners() {
  const loginForm = $('login-form');
  const registerForm = $('register-form');
  if (loginForm) loginForm.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
  if (registerForm) registerForm.addEventListener('submit', (e) => { e.preventDefault(); doRegister(); });

  const tabLogin = $('tab-login');
  const tabRegister = $('tab-register');
  const paneLogin = $('pane-login');
  const paneRegister = $('pane-register');

  const switchTab = (mode) => {
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      paneLogin.classList.remove('hidden');
      paneRegister.classList.add('hidden');
      window.location.hash = '#/login';
    } else {
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      paneLogin.classList.add('hidden');
      paneRegister.classList.remove('hidden');
      window.location.hash = '#/register';
    }
  };

  if (tabLogin) tabLogin.addEventListener('click', () => switchTab('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => switchTab('register'));

  ['login-username', 'login-password', 'reg-username', 'reg-password', 'reg-password-confirm'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', () => {
      clearFieldErrors(['login-username-error', 'login-password-error', 'reg-username-error', 'reg-password-error', 'reg-password-confirm-error']);
      const loginError = $('login-error');
      const regError = $('register-error');
      if (loginError) loginError.textContent = '';
      if (regError) regError.textContent = '';
    });
  });

  document.querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = $(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      import('./utils.js').then(m => {
        btn.innerHTML = m.icon(isPassword ? 'eye-off' : 'eye', 18);
      });
    });
  });
}

export function showLoginScreen() {
  renderAuthCard('login');
}

export function showRegisterScreen() {
  renderAuthCard('register');
}

export function clearAuthScreen() {
  const root = $('auth-root');
  if (root) setTimeout(() => { root.innerHTML = ''; }, 400);
}

export function hideAuthScreen() {
  const root = $('auth-root');
  if (root) setTimeout(() => { root.classList.add('hidden'); }, 400);
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
  if (window._isNavigating) return;
  window._isNavigating = true;
  window.location.hash = hash;
  setTimeout(() => {
    window._isNavigating = false;
  }, 50);
}

export async function initAuth() {
  loadAuthState();
  const authState = getAuthState();

  try {
    const profile = await apiGet('/auth/me');
    if (profile.username) {
      setAuthState({ 
        loggedIn: true, 
        username: profile.display_name || profile.username,
        display_name: profile.display_name
      });
      saveAuthState();
      const headerUsername = $('sidebar-username');
      if (headerUsername) headerUsername.textContent = profile.display_name || profile.username;
    } else {
      setAuthState({ loggedIn: false, username: '' });
      saveAuthState();
    }
  } catch (err) {
    setAuthState({ loggedIn: false, username: '' });
    saveAuthState();
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

  try {
    setLoading(true);
    const res = await apiPost('/auth/login', { username, password });
    setLoading(false);
    setAuthState({ 
      loggedIn: true, 
      username: res.display_name || res.username,
      display_name: res.display_name
    });
    saveAuthState();
    
    const headerUsername = $('sidebar-username');
    if (headerUsername) headerUsername.textContent = res.display_name || res.username;
    
    showToast(`¡Hola, ${res.display_name || res.username}!`, 'success');
    
    // Redirect to courses
    navigateTo('#/courses');
  } catch (err) {
    setLoading(false);
    formErrorEl.textContent = err.detail || 'Error al ingresar. Revisa tus credenciales.';
  }
}

export async function doRegister() {
  const username = $('reg-username').value.trim();
  const displayName = $('reg-display-name').value.trim();
  const password = $('reg-password').value;
  const confirm = $('reg-password-confirm').value;
  const formErrorEl = $('register-error');
  formErrorEl.textContent = '';
  clearFieldErrors(['reg-username-error', 'reg-password-error', 'reg-password-confirm-error']);
  
  let valid = true;
  if (!username) { showFieldError('reg-username-error', 'Elegí un usuario.'); valid = false; }
  if (!password) { showFieldError('reg-password-error', 'Ingresá una contraseña.'); valid = false; }
  else if (password.length < 4) { showFieldError('reg-password-error', 'Mínimo 4 caracteres.'); valid = false; }
  if (password !== confirm) { showFieldError('reg-password-confirm-error', 'Las contraseñas no coinciden.'); valid = false; }
  if (!valid) return;

  try {
    setLoading(true);
    await apiPost('/auth/register', { username, password, display_name: displayName });
    setLoading(false);
    showToast('Perfil creado con éxito. Ya podés ingresar.', 'success');
    renderAuthCard('login');
  } catch (err) {
    setLoading(false);
    formErrorEl.textContent = err.detail || 'No se pudo crear el perfil.';
  }
}

export async function doLogout() {
  try {
    await apiPost('/auth/logout', {});
  } catch (err) {}
  
  setAuthState({ loggedIn: false, username: '' });
  saveAuthState();
  closeProfileModal();
  navigateTo('#/login');
}

const PROFILE_MODAL_TEMPLATE = `
  <div id="profile-modal" class="help-modal">
    <div class="help-overlay"></div>
    <div class="help-panel">
      <div class="help-header">
        <h3>Mi Perfil</h3>
        <button id="btn-close-profile" class="btn-ghost icon-btn" aria-label="Cerrar">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>
      <div class="help-content">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <i data-lucide="user" style="width:32px;height:32px;"></i>
          </div>
          <div class="profile-user-info">
            <span class="profile-user-label">Usuario</span>
            <span id="profile-username" class="profile-user-value">Docente</span>
          </div>
        </div>

        <form id="profile-edit-form" class="profile-form">
          <div class="profile-section-title">
            <i data-lucide="settings" style="width:14px;height:14px;"></i> Datos Personales
          </div>
          <div class="auth-field">
            <label for="profile-display-name">Nombre completo</label>
            <input type="text" id="profile-display-name" placeholder="Ej: Marta Lopez">
          </div>
          
          <div class="profile-divider"></div>
          
          <div class="profile-section-title">
            <i data-lucide="folder" style="width:14px;height:14px;"></i> Almacenamiento
          </div>
          <p class="hint" style="margin-bottom:var(--space-2)">Carpeta donde se guardan tus cursos y alumnos:</p>
          <div class="profile-folder-box">
            <span id="profile-folder-path" class="profile-folder-text">C:\\Users\\...</span>
            <button type="button" id="btn-profile-change-folder" class="btn-secondary btn-sm">Cambiar</button>
          </div>

          <div class="profile-divider"></div>

          <div class="profile-section-title">
            <i data-lucide="lock" style="width:14px;height:14px;"></i> Seguridad
          </div>
          <div class="auth-field">
            <label for="profile-new-password">Nueva contraseña (deja en blanco para no cambiar)</label>
            <div class="auth-input-wrap">
              <input type="password" id="profile-new-password" placeholder="Mínimo 4 caracteres">
              <button type="button" class="btn-toggle-password" data-target="profile-new-password" aria-label="Mostrar">
                <i data-lucide="eye" style="width:18px;height:18px;"></i>
              </button>
            </div>
            <p class="auth-field-error" id="profile-password-error" role="alert"></p>
          </div>
          <div class="auth-field">
            <label for="profile-confirm-password">Confirmar nueva contraseña</label>
            <div class="auth-input-wrap">
              <input type="password" id="profile-confirm-password">
              <button type="button" class="btn-toggle-password" data-target="profile-confirm-password" aria-label="Mostrar">
                <i data-lucide="eye" style="width:18px;height:18px;"></i>
              </button>
            </div>
            <p class="auth-field-error" id="profile-confirm-password-error" role="alert"></p>
          </div>
          
          <p id="profile-save-error" class="auth-form-error" role="alert"></p>
          
          <button type="submit" id="btn-save-profile" class="btn-primary" style="width:100%; margin-top:var(--space-4);">
            Guardar cambios
          </button>
        </form>

        <div class="profile-divider"></div>
        
        <button id="btn-logout" class="btn-danger" style="width:100%; justify-content: center;">
          <i data-lucide="log-out" style="width:16px;height:16px;"></i> Cerrar sesion
        </button>
      </div>
    </div>
  </div>
`;

export async function openProfileModal() {
  const root = $('profile-root');
  if (!root) return;
  root.innerHTML = PROFILE_MODAL_TEMPLATE;
  
  // Inject icons synchronously
  refreshIcons(root);

  bindProfileListeners();

  try {
    const cfg = await apiGet('/config');
    $('profile-folder-path').textContent = cfg.base_path || 'Sin configurar';
    const authState = getAuthState();
    $('profile-username').textContent = authState.username;
    $('profile-display-name').value = authState.display_name || '';
  } catch (err) {
    console.error('Error loading profile config:', err);
  }
}

function bindProfileListeners() {
  $('btn-close-profile').addEventListener('click', closeProfileModal);
  const btnChange = $('btn-profile-change-folder');
  if (btnChange) btnChange.addEventListener('click', doChangeFolder);
  $('btn-logout').addEventListener('click', doLogout);
  
  $('profile-modal').addEventListener('click', (e) => {
    if (e.target === $('profile-modal') || e.target.classList.contains('help-overlay')) {
      closeProfileModal();
    }
  });

  $('profile-edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile();
  });

  // Password toggles in profile
  $('profile-modal').querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = $(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      import('./utils.js').then(m => {
        btn.innerHTML = m.icon(isPassword ? 'eye-off' : 'eye', 18);
      });
    });
  });
}

export function closeProfileModal() {
  const root = $('profile-root');
  if (root) root.innerHTML = '';
}

async function saveProfile() {
  const displayName = $('profile-display-name').value.trim();
  const newPassword = $('profile-new-password').value;
  const confirmPassword = $('profile-confirm-password').value;
  const errorEl = $('profile-save-error');
  
  errorEl.textContent = '';
  clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
  
  if (newPassword && newPassword.length < 4) {
    showFieldError('profile-password-error', 'Minimo 4 caracteres.');
    return;
  }
  if (newPassword && newPassword !== confirmPassword) {
    showFieldError('profile-confirm-password-error', 'No coincide.');
    return;
  }

  const payload = { display_name: displayName };
  if (newPassword) payload.password = newPassword;

  try {
    setLoading(true);
    const res = await apiPut('/auth/profile', payload);
    setLoading(false);
    
    setAuthState({ ...getAuthState(), display_name: res.display_name });
    saveAuthState();
    
    const sidebarUser = $('sidebar-username');
    if (sidebarUser) sidebarUser.textContent = res.display_name || getAuthState().username;
    
    showToast('Perfil actualizado', 'success');
    closeProfileModal();
  } catch (err) {
    setLoading(false);
    errorEl.textContent = err.message || 'Error al guardar';
  }
}

export async function doChangeFolder() {
  try {
    setLoading(true);
    const data = await apiGet('/pick-folder');
    setLoading(false);
    if (data.error) { showToast('No se pudo abrir el selector.', 'error'); return; }
    if (data.cancelled || !data.path) return;
    
    await apiPost('/config', { base_path: data.path });
    $('profile-folder-path').textContent = data.path;
    showToast('Carpeta actualizada', 'success');
    
    // Refresh sidebar and grid if needed
    const appMod = await import('./app.js');
    const status = await appMod.preloadSystemStatus();
    appMod.loadCoursesGrid();
    import('./sidebar.js').then(m => m.renderSidebarCourses());
    const dot = $('sidebar-status-dot');
    const text = $('sidebar-status-text');
    if (dot) dot.className = 'dropdown-status-dot ' + (status.ollamaRunning ? 'ok' : 'error');
    if (text) text.textContent = status.ollamaRunning ? 'Ollama conectado' : 'Ollama desconectado';
    const pathAlias = $('sidebar-path-alias');
    if (pathAlias) pathAlias.textContent = status.basePath || data.path;
  } catch (err) {
    setLoading(false);
    showToast('Error al cambiar carpeta', 'error');
  }
}
