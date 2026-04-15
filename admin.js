// admin.js — Mode édition avec sauvegarde GitHub
// Usage : bouton ✏️ (coin bas-droite) → mot de passe → édition → 💾 Sauvegarder
// Le contenu est écrit directement dans le repo via l'API GitHub.

const ADMIN = (() => {
  // Hash SHA-256 du mot de passe (avec sel 'lolo-salt-2026'). Ne pas modifier.
  const STORED_HASH = '61570811ecb276b96ca0fff57f39d5286994ffd2d66efb0961b5fb474a483834';
  const TOKEN_KEY  = 'lolo_gh_token';
  const REPO_OWNER = 'dgeeb';
  const REPO_NAME  = 'lolo';
  const BRANCH     = 'main';

  let isUnlocked = false;

  // ── Inject UI ──────────────────────────────────────────────────────────────
  function injectUI() {
    // Floating edit button
    const fab = document.createElement('button');
    fab.id = 'admin-fab';
    fab.title = 'Mode édition';
    fab.textContent = '✏️';
    fab.addEventListener('click', handleFabClick);
    document.body.appendChild(fab);

    // Admin bar (bottom strip, visible when unlocked)
    const bar = document.createElement('div');
    bar.id = 'admin-bar';
    bar.innerHTML = `
      <span class="admin-bar-label">✏️ Mode édition</span>
      <button id="admin-save-btn">💾 Sauvegarder</button>
      <button id="admin-token-btn">🔑 Token</button>
      <button id="admin-lock-btn">🔒 Quitter</button>
    `;
    document.body.appendChild(bar);

    document.getElementById('admin-save-btn').addEventListener('click', saveToGitHub);
    document.getElementById('admin-token-btn').addEventListener('click', promptToken);
    document.getElementById('admin-lock-btn').addEventListener('click', lock);

    // Modal backdrop
    const modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.innerHTML = `
      <div id="admin-modal-box">
        <div id="admin-modal-title"></div>
        <div id="admin-modal-body"></div>
      </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
  }

  // ── Modal helpers ──────────────────────────────────────────────────────────
  function openModal(title, bodyHTML) {
    document.getElementById('admin-modal-title').textContent = title;
    document.getElementById('admin-modal-body').innerHTML = bodyHTML;
    document.getElementById('admin-modal').classList.add('active');
    const first = document.querySelector('#admin-modal-body input');
    if (first) setTimeout(() => first.focus(), 50);
  }

  function closeModal() {
    document.getElementById('admin-modal').classList.remove('active');
  }

  // ── Password (SHA-256) ─────────────────────────────────────────────────────
  async function hashPassword(password) {
    const data = new TextEncoder().encode(password + 'lolo-salt-2026');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function handleFabClick() {
    openModal('Mode édition', `
      <p>Entrez le mot de passe pour activer l'édition des fiches.</p>
      <input type="password" id="a-pwd" placeholder="Mot de passe" autocomplete="current-password">
      <button id="a-submit">Déverrouiller</button>
    `);
    const submit = document.getElementById('a-submit');
    submit.addEventListener('click', async () => {
      const pwd = document.getElementById('a-pwd').value;
      if (await hashPassword(pwd) === STORED_HASH) {
        closeModal();
        unlock();
      } else {
        showToast('Mot de passe incorrect', 'error');
      }
    });
    document.getElementById('a-pwd').addEventListener('keydown', e => {
      if (e.key === 'Enter') submit.click();
    });
  }

  function unlock() {
    isUnlocked = true;
    document.getElementById('admin-bar').classList.add('active');
    document.getElementById('admin-fab').classList.add('hidden');

    // Make section bodies editable
    document.querySelectorAll('.sec-body').forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('admin-editable');
    });
    // Also make header editable
    document.querySelectorAll('.header h1, .header > p').forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('admin-editable');
    });

    showToast('Mode édition activé — modifiez puis cliquez 💾', 'success');
  }

  function lock() {
    isUnlocked = false;
    document.getElementById('admin-bar').classList.remove('active');
    document.getElementById('admin-fab').classList.remove('hidden');
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.classList.remove('admin-editable');
    });
    showToast('Mode édition désactivé');
  }

  // ── GitHub Token ───────────────────────────────────────────────────────────
  function promptToken() {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    openModal('Token GitHub', `
      <p>
        Générez un <strong>Personal Access Token</strong> (classic) sur GitHub
        avec la permission <code>repo</code>, puis collez-le ici.<br>
        Il sera stocké uniquement dans votre navigateur (localStorage).
      </p>
      <a href="https://github.com/settings/tokens/new?scopes=repo&description=Lolo+Editor" target="_blank" rel="noopener">
        → Créer un token sur GitHub.com
      </a>
      ${hasToken ? '<p class="admin-hint">✅ Un token est déjà enregistré.</p>' : ''}
      <input type="password" id="a-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off">
      <button id="a-submit">Enregistrer le token</button>
      ${hasToken ? '<button id="a-del-token" class="admin-btn-danger">Supprimer le token enregistré</button>' : ''}
    `);
    document.getElementById('a-submit').addEventListener('click', () => {
      const tok = document.getElementById('a-token').value.trim();
      if (!tok) return showToast('Token requis', 'error');
      if (!tok.startsWith('ghp_') && !tok.startsWith('github_pat_')) {
        return showToast('Le token doit commencer par ghp_ ou github_pat_', 'error');
      }
      localStorage.setItem(TOKEN_KEY, tok);
      closeModal();
      showToast('Token enregistré ✅', 'success');
    });
    const delBtn = document.getElementById('a-del-token');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        localStorage.removeItem(TOKEN_KEY);
        closeModal();
        showToast('Token supprimé');
      });
    }
  }

  // ── Save to GitHub ─────────────────────────────────────────────────────────
  async function saveToGitHub() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      showToast('Token GitHub manquant — cliquez sur 🔑 Token', 'error');
      return;
    }

    const filename = window.location.pathname.split('/').pop() || '';
    if (!filename.endsWith('.html')) {
      showToast("Cette page ne peut pas être sauvegardée via l'API", 'error');
      return;
    }

    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;
    const saveBtn = document.getElementById('admin-save-btn');
    saveBtn.disabled = true;
    showToast('Sauvegarde en cours…');

    try {
      // 1. Get current file SHA (required by GitHub API for updates)
      const getResp = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (!getResp.ok) {
        const err = await getResp.json().catch(() => ({}));
        if (getResp.status === 401) throw new Error('Token invalide ou expiré. Vérifiez votre token.');
        if (getResp.status === 404) throw new Error('Fichier introuvable dans le repo. Vérifiez REPO_OWNER/REPO_NAME dans admin.js.');
        throw new Error(err.message || `Erreur GitHub ${getResp.status}`);
      }
      const { sha } = await getResp.json();

      // 2. Build clean HTML (strip admin UI before saving)
      const clone = document.documentElement.cloneNode(true);
      ['admin-fab', 'admin-bar', 'admin-modal'].forEach(id => {
        const el = clone.querySelector('#' + id);
        if (el) el.remove();
      });
      clone.querySelectorAll('.admin-toast').forEach(el => el.remove());
      clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
      clone.querySelectorAll('.admin-editable').forEach(el => el.classList.remove('admin-editable'));

      const html = '<!DOCTYPE html>\n' + clone.outerHTML + '\n';
      // btoa with UTF-8 support
      const encoded = btoa(unescape(encodeURIComponent(html)));

      // 3. Commit via PUT
      const putResp = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `✏️ Edit ${filename} via Lolo app`,
          content: encoded,
          sha,
          branch: BRANCH,
        }),
      });

      if (!putResp.ok) {
        const err = await putResp.json().catch(() => ({}));
        throw new Error(err.message || `Erreur PUT ${putResp.status}`);
      }

      showToast('✅ Sauvegardé sur GitHub !', 'success');
      lock();

    } catch (e) {
      console.error('Admin save error:', e);
      showToast('Erreur : ' + e.message, 'error');
    } finally {
      saveBtn.disabled = false;
    }
  }

  // ── Toast notifications ────────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `admin-toast${type !== 'info' ? ' toast-' + type : ''}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.classList.add('toast-fade');
      setTimeout(() => t.remove(), 400);
    }, 2800);
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', injectUI);

  return { unlock, lock, saveToGitHub };
})();
