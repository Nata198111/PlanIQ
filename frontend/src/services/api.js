const BASE_URL = 'http://localhost:8000/api/v1';

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem('planiq_auth') || '{}');
    return auth.token || null;
  } catch {
    return null;
  }
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, config);

  if (response.status === 401) {
    localStorage.removeItem('planiq_auth');
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Помилка запиту');
  }

  return data;
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};