import { toast } from '../services/toast.js';
import { notificationsStore } from '../services/notifications-store.js';
 
// ── Іконки і кольори по типу ──────────────────────────────────────
const TYPE_CONFIG = {
  deadline_soon: { icon: 'warning',               color: 'text-[#ffb2bc]', bg: 'bg-[#ffb2bc]/10' },
  task_overdue:  { icon: 'notification_important', color: 'text-[#ffb2bc]', bg: 'bg-[#ffb2bc]/10' },
  rescheduled:   { icon: 'update',                 color: 'text-[#c4c0ff]', bg: 'bg-[#c4c0ff]/10' },
  planning_done: { icon: 'auto_awesome',           color: 'text-[#4ddada]', bg: 'bg-[#4ddada]/10' },
  info:          { icon: 'notifications',          color: 'text-[#c4c0ff]', bg: 'bg-[#c4c0ff]/10' },
};
 
function getConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.info;
}
 
function formatTime(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const now  = new Date();
  const diffMs   = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
 
  if (diffMins < 1)   return 'щойно';
  if (diffMins < 60)  return `${diffMins} хв тому`;
  if (diffHrs  < 24)  return `${diffHrs} год тому`;
  if (diffDays === 1) return 'вчора';
  return date.toLocaleDateString('uk', { day: 'numeric', month: 'short' });
}
 
function renderItem(n) {
  const cfg = getConfig(n.type);
  return `
    <div class="notification-item flex gap-4 p-5 rounded-2xl transition-all hover:bg-[#292935] cursor-pointer
      ${n.read ? 'bg-[#1b1a26] opacity-70' : 'bg-[#1f1e2a] border-l-4 border-[#c4c0ff] shadow-lg'}"
      data-id="${n.id}">
      <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}">
        <span class="material-symbols-outlined">${cfg.icon}</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start mb-1 gap-2">
          <h3 class="font-bold truncate ${n.read ? 'text-[#c7c4d8]' : 'text-white'}">${n.title}</h3>
          <span class="text-xs font-mono text-slate-500 shrink-0">${formatTime(n.created_at)}</span>
        </div>
        <p class="text-sm text-slate-400 leading-relaxed">${n.message}</p>
      </div>
      <div class="flex flex-col items-center gap-2 shrink-0">
        ${!n.read ? '<div class="w-2 h-2 rounded-full bg-[#c4c0ff] mt-1 unread-dot"></div>' : '<div class="w-2"></div>'}
        <button class="delete-btn opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-600 hover:text-[#ffb2bc] transition-all" data-id="${n.id}" title="Видалити">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>`;
}
 
function renderEmpty() {
  return `
    <div class="text-center py-20 text-slate-500">
      <span class="material-symbols-outlined text-5xl mb-4 block opacity-30">notifications_off</span>
      <p class="font-bold text-lg mb-1">Немає сповіщень</p>
      <p class="text-sm opacity-60">Коли щось відбудеться — ти дізнаєшся першим</p>
    </div>`;
}
 
// renderNotifications — тепер просто каркас, дані вставляє initNotifications
export function renderNotifications() {
  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight mb-2">Сповіщення</h2>
          <p class="text-[#c7c4d8]" id="notif-subtitle">Усі системні нагадування та активність</p>
        </div>
        <button id="mark-all-read" class="text-sm font-bold text-[#c4c0ff] hover:text-[#8781ff] transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">done_all</span>
          <span class="hidden sm:inline">Прочитати всі</span>
        </button>
      </div>
      <div id="notif-list" class="space-y-3">
        <!-- skeleton поки вантажиться -->
        ${[1,2,3].map(() => `
          <div class="flex gap-4 p-5 rounded-2xl bg-[#1f1e2a] animate-pulse">
            <div class="w-12 h-12 rounded-xl bg-[#292935] shrink-0"></div>
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 bg-[#292935] rounded w-1/3"></div>
              <div class="h-3 bg-[#292935] rounded w-2/3"></div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}
 
export async function initNotifications() {
  const list     = document.getElementById('notif-list');
  const subtitle = document.getElementById('notif-subtitle');
 
  function render() {
    const items = notificationsStore.getAll();
    const unread = notificationsStore.unreadCount();
 
    subtitle.textContent = unread > 0
      ? `${unread} непрочитаних сповіщень`
      : 'Усі сповіщення прочитано';
 
    if (items.length === 0) {
      list.innerHTML = renderEmpty();
      return;
    }
 
    list.innerHTML = `<div class="space-y-3 group">${items.map(renderItem).join('')}</div>`;
 
    // ── Кліки по сповіщенню — позначити прочитаним ──────────────
    list.querySelectorAll('.notification-item').forEach(el => {
      el.addEventListener('click', async (e) => {
        // Не спрацьовувати на кнопку видалення
        if (e.target.closest('.delete-btn')) return;
        const id = el.dataset.id;
        await notificationsStore.markRead(id);
        render();
      });
    });
 
    // ── Кнопки видалення ─────────────────────────────────────────
    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        await notificationsStore.delete(id);
        render();
      });
    });
  }
 
  // ── "Прочитати всі" ──────────────────────────────────────────
  document.getElementById('mark-all-read')?.addEventListener('click', async () => {
    await notificationsStore.markAllRead();
    render();
    toast('Усі сповіщення прочитано', 'success');
  });
 
  // ── Завантажуємо (або беремо з кешу) ─────────────────────────
  if (!notificationsStore.isLoaded()) {
    await notificationsStore.load();
  }
  render();
}