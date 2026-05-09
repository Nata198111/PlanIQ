// frontend/src/services/preferences-store.js
import { preferencesApi } from './preferences-api.js';

// Дефолтні вбудовані категорії — завжди присутні для всіх
export const DEFAULT_CATEGORIES = {
  'UNIVERSITY': { label: 'УНІВЕРСИТЕТ', color: '#4ddada' },
  'WORK':       { label: 'РОБОТА',      color: '#8781ff' },
  'PERSONAL':   { label: 'ОСОБИСТЕ',   color: '#464555' },
  'HOBBY':      { label: 'ХОБІ',        color: '#c4c0ff' },
  'HEALTH':     { label: "ЗДОРОВʼЯ",   color: '#4CAF82' },
  'HOME':       { label: 'ПОБУТ',       color: '#EF9F27' },
  'PROJECTS':   { label: 'ПРОЄКТИ',     color: '#818cf8' },
  'OTHER':      { label: 'ІНШЕ',        color: '#888780' },
};

const COLOR_PALETTE = ['#4ddada', '#8781ff', '#c4c0ff', '#818cf8', '#ffb4ab', '#3ecfcf', '#6c63ff'];

class PreferencesStore {
  constructor() {
    this._prefs   = null;   // сирі дані з бекенду
    this._loaded  = false;
    this._loading = null;   // Promise щоб не робити подвійний запит
  }
  
  clear() {
    this._prefs = null;
    this._loaded = false;
    this._loading = null;
  }


  // ── Завантаження ───────────────────────────────────────────────

  async load() {
    if (this._loading) return this._loading;
    this._loading = preferencesApi.get().then(data => {
      this._prefs  = data;
      this._loaded = true;
      this._loading = null;
      window.dispatchEvent(new CustomEvent('preferences-loaded', { detail: data }));
      return data;
    }).catch(err => {
      this._loading = null;
      console.warn('Не вдалося завантажити preferences, використовуємо дефолт', err);
      // Якщо не авторизований або помилка — не падаємо
      return null;
    });
    return this._loading;
  }

  isLoaded() { return this._loaded; }

  // ── Читання ────────────────────────────────────────────────────

  get() { return this._prefs; }

  /**
   * Повертає об'єкт категорій для поточного юзера:
   * DEFAULT_CATEGORIES + кастомні зі selected_categories (якщо є незнайомі ключі).
   *
   * selected_categories з бекенду — масив рядків типу ['WORK', 'PERSONAL', 'MY_CUSTOM'].
   * Дефолтні вже є в DEFAULT_CATEGORIES. Кастомні — ті яких немає в DEFAULT_CATEGORIES.
   */
  getCategories() {
    if (!this._prefs) return { ...DEFAULT_CATEGORIES };

    const result = { ...DEFAULT_CATEGORIES };

    // Кастомні категорії: є в selected_categories але не в DEFAULT_CATEGORIES
    const selected = this._prefs.selected_categories || [];
    selected.forEach((catId, idx) => {
      if (!DEFAULT_CATEGORIES[catId]) {
        result[catId] = {
          label: catId.replace(/_/g, ' '),
          color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        };
      }
    });

    return result;
  }

  /**
   * Масив обраних при onboarding категорій (для підсвічування активних у settings).
   */
  getSelectedCategories() {
    return this._prefs?.selected_categories || ['PERSONAL'];
  }

  getWorkHours()    { return this._prefs?.work_hours    || { start: '09:00', end: '18:00' }; }
  getLunchBreak()   { return this._prefs?.lunch_break   || { enabled: true, start: '12:00', end: '13:00' }; }
  getWorkDays()     { return this._prefs?.work_days     || [0,1,2,3,4]; }
  getPeakHours()    { return this._prefs?.peak_hours    || ['09:00','10:00','11:00']; }
  getTimezone()     { return this._prefs?.timezone      || 'Europe/Kyiv'; }

  getAlgorithm() {
    return {
      reality_coefficient: this._prefs?.reality_coefficient ?? 1.2,
      auto_reschedule:     this._prefs?.auto_reschedule     ?? true,
      protect_peak_hours:  this._prefs?.protect_peak_hours  ?? false,
      buffer_minutes:      this._prefs?.buffer_minutes      ?? 10,
      reminder_minutes:    this._prefs?.reminder_minutes    ?? 15,
    };
  }

  getNotificationsEnabled() {
    return this._prefs?.notifications_enabled ?? true;
  }

  // ── Оновлення ──────────────────────────────────────────────────

  async patch(updates) {
    const data = await preferencesApi.patch(updates);
    this._prefs = data;
    window.dispatchEvent(new CustomEvent('preferences-updated', { detail: data }));
    return data;
  }

  async put(updates) {
    const data = await preferencesApi.put(updates);
    this._prefs = data;
    window.dispatchEvent(new CustomEvent('preferences-updated', { detail: data }));
    return data;
  }

  // ── Категорії ──────────────────────────────────────────────────

  /**
   * Додає кастомну категорію: генерує id, зберігає в preferences.
   * Повертає новий catId.
   */
  async addCategory(name) {
    const id = name.trim().toUpperCase();

    if (!id) return null;

    // Якщо вже є — просто повертаємо id
    if (this.getCategories()[id]) return id;

    const current = this.getSelectedCategories();
    const updated = [...new Set([...current, id])];

    await this.patch({ selected_categories: updated });
    window.dispatchEvent(new CustomEvent('categories-update'));

    return id;
  }
}

export const preferencesStore = new PreferencesStore();