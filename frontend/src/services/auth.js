import { api } from './api.js';

const AUTH_KEY = 'planiq_auth';

export function isLoggedIn() {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
    return !!auth.token;
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

export async function registerAPI(name, email, password) {
  const data = await api.post('/auth/register', { name, email, password });
  // data = { access_token, token_type, user }
  setAuth({
    token: data.access_token,
    user: data.user,
  });
  return data.user;
}

export async function loginAPI(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setAuth({
    token: data.access_token,
    user: data.user,
  });
  return data.user;
}

export async function fetchMe() {
  const data = await api.get('/auth/me');
  // Оновлюємо дані юзера в localStorage
  const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
  setAuth({ ...auth, user: data });
  return data;
}

export function updateStoredUser(userUpdates) {
  const auth = getUser();
  const currentUser = auth.user || {};

  setAuth({
    ...auth,
    user: {
      ...currentUser,
      ...userUpdates,
    },
  });
}

export async function updateProfileAPI(name) {
  const data = await api.patch('/auth/me', { name });
  updateStoredUser(data);
  return data;
}

export async function changePasswordAPI(currentPassword, newPassword) {
  return api.patch('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}