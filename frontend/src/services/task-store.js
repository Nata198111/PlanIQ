// All tasks are managed dynamically; no mock payload fallback.

const DEFAULT_CATEGORIES = {
  'UNIVERSITY': { label: 'УНІВЕРСИТЕТ', color: '#4ddada' },
  'WORK': { label: 'РОБОТА', color: '#8781ff' },
  'PERSONAL': { label: 'ОСОБИСТЕ', color: '#464555' },
  'HOBBY': { label: 'ХОБІ', color: '#c4c0ff' },
  'MANAGEMENT': { label: 'MANAGEMENT', color: '#818cf8' },
  'FINANCE': { label: 'FINANCE', color: '#c4c0ff' },
  'CORE AI': { label: 'CORE AI', color: '#4ddada' }
};

const COLOR_PALETTE = ['#4ddada', '#8781ff', '#c4c0ff', '#818cf8', '#ffb4ab', '#3ecfcf', '#6c63ff'];

class TaskStore {
  constructor() {
    this.tasks = this.load();
    this.categories = this.loadCategories();
  }

  load() {
    const data = localStorage.getItem('PlaniQ_Tasks_V2');
    let loaded = data ? JSON.parse(data) : [];
    
    // Purge legacy mock data seeded from previous executions to protect true task environment
    const mIds = ['focus', 'task-kupyty', 'task-zustrich', 'task-ai', 't1', 't2', 't3', 't4', 't5', 't6'];
    const p = loaded.filter(t => !mIds.includes(t.id));
    if(p.length !== loaded.length) {
      localStorage.setItem('PlaniQ_Tasks_V2', JSON.stringify(p));
      loaded = p;
    }
    return loaded;
  }

  loadCategories() {
    const data = localStorage.getItem('PlaniQ_Custom_Cats');
    const custom = data ? JSON.parse(data) : {};
    return { ...DEFAULT_CATEGORIES, ...custom };
  }

  save() {
    localStorage.setItem('PlaniQ_Tasks_V2', JSON.stringify(this.tasks));
    window.dispatchEvent(new CustomEvent('task-store-update'));
  }

  saveCategories() {
    const custom = {};
    Object.keys(this.categories).forEach(k => {
      if (!DEFAULT_CATEGORIES[k]) custom[k] = this.categories[k];
    });
    localStorage.setItem('PlaniQ_Custom_Cats', JSON.stringify(custom));
    window.dispatchEvent(new CustomEvent('categories-update'));
  }

  getAll() { return this.tasks; }
  getById(id) { return this.tasks.find(t => t.id === id); }
  getCategories() { return this.categories; }

  addCategory(name) {
    const id = name.toUpperCase().replace(/\s+/g, '_');
    if (this.categories[id]) return id;
    const color = COLOR_PALETTE[Object.keys(this.categories).length % COLOR_PALETTE.length];
    this.categories[id] = { label: name.toUpperCase(), color };
    this.saveCategories();
    return id;
  }

  add(task) {
    const newTask = { ...task, id: 't' + Date.now() };
    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  update(id, updates) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...updates };
      this.save();
      return this.tasks[idx];
    }
    return null;
  }

  delete(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }
}

export const taskStore = new TaskStore();
export const CATEGORIES = taskStore.getCategories(); // Shared reference
