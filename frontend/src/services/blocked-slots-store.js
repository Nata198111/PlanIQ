import { blockedSlotsApi } from './blocked-slots-api.js';

class BlockedSlotsStore {
  constructor() {
    this._slots = [];
    this._loaded = false;
    this._loading = null;
  }

  _notify() {
    window.dispatchEvent(new CustomEvent('blocked-slots-update', {
      detail: { slots: this._slots },
    }));
  }

  async load() {
    if (this._loading) return this._loading;

    this._loading = blockedSlotsApi.getAll()
      .then(data => {
        this._slots = data || [];
        this._loaded = true;
        this._loading = null;
        this._notify();
        return this._slots;
      })
      .catch(err => {
        this._loading = null;
        console.warn('Не вдалося завантажити заблоковані слоти:', err);
        return [];
      });

    return this._loading;
  }

  async addSlot(data) {
    const slot = await blockedSlotsApi.create(data);
    this._slots.push(slot);
    this._notify();
    return slot;
  }

  async deleteSlot(id) {
    await blockedSlotsApi.delete(id);
    this._slots = this._slots.filter(slot => slot.id !== id);
    this._notify();
  }

  getAll() {
    return this._slots;
  }

  isLoaded() {
    return this._loaded;
  }
}

export const blockedSlotsStore = new BlockedSlotsStore();