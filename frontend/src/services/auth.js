const AUTH_KEY = 'planiq_auth';

export function isLoggedIn() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
    return auth.loggedIn === true;
  } catch { return false; }
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
  } catch { return {}; }
}

export function setAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
