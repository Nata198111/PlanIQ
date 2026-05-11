import { notificationsApi } from './notifications-api.js';
 
class NotificationsStore {
  constructor() {
    this._items  = [];
    this._loaded = false;
    this._loading = null;
  }
 
  // ── Завантаження ───────────────────────────────────────────────
 
  async load() {
    if (this._loading) return this._loading;
    this._loading = notificationsApi.getAll()
      .then(data => {
        this._items   = data;
        this._loaded  = true;
        this._loading = null;
        this._emit();
        return data;
      })
      .catch(err => {
        this._loading = null;
        console.warn('Не вдалося завантажити сповіщення:', err);
        return [];
      });
    return this._loading;
  }
 
  // ── Геттери ────────────────────────────────────────────────────
 
  getAll()     { return this._items; }
  isLoaded()   { return this._loaded; }
  unreadCount(){ return this._items.filter(n => !n.read).length; }
 
  // ── Мутації (оптимістичні — міняємо локально, потім API) ───────
 
  async markRead(id) {
    const n = this._items.find(x => x.id === id);
    if (!n || n.read) return;
    n.read = true;          // оптимістично
    this._emit();
    try {
      await notificationsApi.markRead(id);
    } catch {
      n.read = false;       // відкат при помилці
      this._emit();
    }
  }
 
  async markAllRead() {
    const hadUnread = this._items.some(n => !n.read);
    if (!hadUnread) return 0;
    this._items.forEach(n => n.read = true);
    this._emit();
    try {
      const { marked } = await notificationsApi.markAll();
      return marked;
    } catch {
      await this.load();    // відкат — перезавантажуємо
      return 0;
    }
  }
 
  async delete(id) {
    const prev = [...this._items];
    this._items = this._items.filter(n => n.id !== id);
    this._emit();
    try {
      await notificationsApi.delete(id);
    } catch {
      this._items = prev;
      this._emit();
    }
  }
 
  // ── Events ─────────────────────────────────────────────────────
 
  _emit() {
    window.dispatchEvent(new CustomEvent('notifications-update', {
      detail: { unread: this.unreadCount(), items: this._items },
    }));
  }
}
 
export const notificationsStore = new NotificationsStore();