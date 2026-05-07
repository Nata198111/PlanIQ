import { taskApi } from './task-api.js';

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

class TaskStore {
  constructor() {
    this._tasks = [];
    this._categories = this._loadCustomCategories();
    this._loaded = false;
  }

  // ── Категорії ─────────────────────────────────────────────

  _loadCustomCategories() {
    try {
      const custom = JSON.parse(localStorage.getItem('PlaniQ_Custom_Cats') || '{}');
      return { ...DEFAULT_CATEGORIES, ...custom };
    } catch { return { ...DEFAULT_CATEGORIES }; }
  }

  getCategories() { return this._categories; }

  addCategory(name) {
    const id = name.toUpperCase().replace(/\s+/g, '_');
    if (this._categories[id]) return id;
    const color = COLOR_PALETTE[Object.keys(this._categories).length % COLOR_PALETTE.length];
    this._categories[id] = { label: name.toUpperCase(), color };
    const custom = {};
    Object.keys(this._categories).forEach(k => {
      if (!DEFAULT_CATEGORIES[k]) custom[k] = this._categories[k];
    });
    localStorage.setItem('PlaniQ_Custom_Cats', JSON.stringify(custom));
    window.dispatchEvent(new CustomEvent('categories-update'));
    return id;
  }

  // ── Локальний кеш ─────────────────────────────────────────

  _notify() {
    window.dispatchEvent(new CustomEvent('task-store-update'));
  }

  // ── API методи (async) ────────────────────────────────────

  async loadFromAPI() {
    try {
      const tasks = await taskApi.getAll();
      this._tasks = tasks;
      this._loaded = true;
      this._notify();
      return tasks;
    } catch (err) {
      console.error('Failed to load tasks:', err);
      return [];
    }
  }

  async addTask(data) {
    const task = await taskApi.create(data);
    this._tasks.push(task);
    this._notify();
    return task;
  }

  async updateTask(id, updates) {
    const task = await taskApi.update(id, updates);
    const idx = this._tasks.findIndex(t => t.id === id);
    if (idx !== -1) this._tasks[idx] = task;
    this._notify();
    return task;
  }

  async deleteTask(id) {
    await taskApi.delete(id);
    this._tasks = this._tasks.filter(t => t.id !== id);
    this._notify();
  }

  // ── Синхронні геттери (для сумісності з існуючим кодом) ──

  getAll()      { return this._tasks; }
  getById(id)   { return this._tasks.find(t => t.id === id) || null; }
  isLoaded()    { return this._loaded; }
}

export const taskStore = new TaskStore();
export const CATEGORIES = taskStore.getCategories();
