// frontend/src/services/task-store.js
import { taskApi } from './task-api.js';
import { planningApi } from './planning-api.js';
import { preferencesStore, DEFAULT_CATEGORIES } from './preferences-store.js';
import { notificationsStore } from './notifications-store.js';

export { DEFAULT_CATEGORIES };

class TaskStore {
  constructor() {
    this._tasks  = [];
    this._loaded = false;
  }

  // ── Категорії — тепер делегуємо в preferencesStore ───────────

  getCategories() {
    return preferencesStore.getCategories();
  }

  /**
   * Додає категорію через preferencesStore (зберігає в preferences на бекенді).
   * Повертає Promise<catId> — форма має чекати на результат.
   */
  addCategory(name) {
    return preferencesStore.addCategory(name);
  }

  // ── Локальний кеш ──────────────────────────────────────────────

  _notify() {
    window.dispatchEvent(new CustomEvent('task-store-update'));
  }

  _refreshNotifications() {
    notificationsStore.load().catch(err => {
      console.warn('Failed to refresh notifications:', err);
    });
  }

  _upsertTask(task) {
    if (!task) return;

    const idx = this._tasks.findIndex(t => t.id === task.id);

    if (idx !== -1) {
      this._tasks[idx] = task;
    } else {
      this._tasks.push(task);
    }
  }

  _upsertTasks(tasks = []) {
    tasks.forEach(task => this._upsertTask(task));
  }  

  // ── API методи ────────────────────────────────────────────────

  async loadFromAPI() {
    try {
      const tasks  = await taskApi.getAll();
      this._tasks  = tasks;
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
    this._refreshNotifications();
    return task;
  }

  async updateTask(id, updates) {
    const task = await taskApi.update(id, updates);
    const idx  = this._tasks.findIndex(t => t.id === id);
    if (idx !== -1) this._tasks[idx] = task;
    this._notify();
    this._refreshNotifications();
    return task;
  }

  async deleteTask(id) {
    await taskApi.delete(id);
    this._tasks = this._tasks.filter(t => t.id !== id);
    this._notify();
    this._refreshNotifications();
  }

  async scheduleTasks(daysAhead = 7) {
    const result = await planningApi.schedule(daysAhead);

    this._upsertTasks(result.scheduled || []);
    this._notify();
    this._refreshNotifications();

    return result;
  }

  async rescheduleTask(id) {
    const task = await planningApi.reschedule(id);

    if (task) {
      this._upsertTask(task);
      this._notify();
      this._refreshNotifications();
    }

    return task;
  }

  // ── Синхронні геттери ──────────────────────────────────────────

  getAll()    { return this._tasks; }
  getById(id) { return this._tasks.find(t => t.id === id) || null; }
  isLoaded()  { return this._loaded; }
}

export const taskStore = new TaskStore();

// CATEGORIES — живий проксі: завжди повертає актуальні категорії
// (використовується як `CATEGORIES[catId]` в tasks.js, calendar.js і т.д.)
export const CATEGORIES = new Proxy({}, {
  get(_, prop) {
    return taskStore.getCategories()[prop];
  },
  ownKeys() {
    return Object.keys(taskStore.getCategories());
  },
  has(_, prop) {
    return prop in taskStore.getCategories();
  },
  getOwnPropertyDescriptor(_, prop) {
    const cats = taskStore.getCategories();
    if (prop in cats) return { value: cats[prop], enumerable: true, configurable: true, writable: false };
    return undefined;
  },
});