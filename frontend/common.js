// Shared helpers: auth guard, escaping, logout.
const token = localStorage.getItem('token'); // Saved at login, sent with every API request.

function requireAuth() {
  if (!token) { window.location.href = 'login.html'; return false; }
  return true;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let clerkLoading = null;
function loadClerk() {
  return clerkLoading ||= (async () => {
    if (!window.Clerk || typeof window.Clerk.load !== 'function') {
      const cfg = await (await fetch('/api/config')).json();
      if (!cfg.publishableKey) return null;
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/clerk-js/5.103.1/clerk.browser.min.js';
        s.setAttribute('data-clerk-publishable-key', cfg.publishableKey);
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    if (!window.Clerk.loaded) await window.Clerk.load();
    return window.Clerk;
  })();
}

function tokenSecondsLeft(t) {
  try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp - Date.now() / 1000; }
  catch (err) { return 0; }
}

// Clerk session tokens expire after ~60s; reuse the stored one while it is fresh, else get a new one from Clerk.
const plainFetch = window.fetch.bind(window);
window.fetch = async (url, opts = {}) => {
  if (opts.headers && opts.headers.Authorization) {
    let t = localStorage.getItem('token');
    if (!t || tokenSecondsLeft(t) <= 15) {
      try {
        const clerk = await loadClerk();
        t = (clerk && clerk.session && await clerk.session.getToken()) || t;
        if (t) localStorage.setItem('token', t);
      } catch (err) { /* fall back to the stored token; the API returns 401 if it is stale */ }
    }
    opts = { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${t}` } };
  }
  return plainFetch(url, opts);
};

async function handleLogout() {
  ['token', 'student', 'role', 'pendingProfile'].forEach(k => localStorage.removeItem(k));
  try {  // end the Clerk session too; API logout already happened by dropping the token
    const clerk = await loadClerk();
    if (clerk) await clerk.signOut();
  } catch (err) { /* token already cleared; nothing left to guard */ }
  window.location.href = 'login.html';
}

// JSON request: throws with the server's message (and .status), sends 401s to login.
async function apiRequest(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) { window.location.href = 'login.html'; throw new Error('Please log in again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data.detail;
    const err = new Error(Array.isArray(d) ? 'Please fill in every required field correctly.' : (d || 'Request failed'));
    err.status = res.status;
    throw err;
  }
  return data;
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

// Unread in-app notifications, shown at the top of the doubts, teacher and admin pages.
async function showNotifications(elId) {
  const el = document.getElementById(elId);
  try {
    const list = (await apiRequest('GET', '/api/notifications')).notifications || [];
    el.classList.toggle('hidden', !list.length);
    el.innerHTML = `
      <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h2 class="text-lg font-bold text-black">Notifications (${list.length} new)</h2>
        <button onclick="readNotifications('${elId}')" class="border border-gray-300 px-3 py-1 text-sm">Mark all as read</button>
      </div>
      <ul class="text-sm">${list.map(n => `
        <li class="py-1 border-t border-gray-100">
          ${n.link ? `<a href="${escapeHtml(n.link)}" class="underline">${escapeHtml(n.message)}</a>` : escapeHtml(n.message)}
          <span class="text-gray-500">· ${formatDate(n.created_at)}</span>
        </li>`).join('')}</ul>`;
  } catch (err) { el.classList.add('hidden'); }
}
async function readNotifications(elId) {
  try { await apiRequest('POST', '/api/notifications/read'); } catch (err) { /* list just stays as it was */ }
  showNotifications(elId);
}

// nav links only; every teacher/admin endpoint is still checked on the server
function applyRoleLinks() {
  const role = localStorage.getItem('role');
  document.getElementById('teacher-link')?.classList.toggle('hidden', role !== 'teacher' && role !== 'admin');
  document.getElementById('admin-link')?.classList.toggle('hidden', role !== 'admin');
}
document.addEventListener('DOMContentLoaded', () => {
  applyRoleLinks();
  if (!document.getElementById('teacher-link')) return;
  apiRequest('GET', '/api/auth/me')  // the stored role goes stale when an admin approves or removes a teacher
    .then(me => { localStorage.setItem('role', me.role); applyRoleLinks(); }).catch(() => {});
});
