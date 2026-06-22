// assets/api-client.js
// Small client helper to call the PHP API endpoints in /api/
// Use relative paths so it works when the site lives in a subfolder (e.g. http://localhost/overdrive)

async function apiFetch(path, options = {}) {
  const res = await fetch('api/' + path, Object.assign({
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin' // send cookies for session auth
  }, options));

  // Throw if non-JSON or http error
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || { error: res.statusText };
    return data;
  } catch (err) {
    // rethrow parsed JSON or text
    if (err && err.error) throw err;
    throw { error: text || 'Invalid JSON response' };
  }
}

// Auth
async function register(username, password) {
  return apiFetch('auth.php?action=register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

async function login(username, password) {
  return apiFetch('auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

async function logout() {
  return apiFetch('auth.php?action=logout', { method: 'POST' });
}

async function getCurrentUser() {
  return apiFetch('auth.php?action=me', { method: 'GET' });
}

// Announcements
async function fetchAnnouncements() {
  return apiFetch('announcements.php', { method: 'GET' });
}

async function addAnnouncement(title, body) {
  return apiFetch('announcements.php', { method: 'POST', body: JSON.stringify({ title, body }) });
}

async function deleteAnnouncement(id) {
  return apiFetch('announcements.php?id=' + encodeURIComponent(id), { method: 'DELETE' });
}
