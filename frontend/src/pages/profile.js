import { getUser } from '../services/auth.js';
import { taskStore } from '../services/task-store.js';

function getInitials(name = '') {
  return name.trim().split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

function fmtDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60)  return `${diffMins} хв тому`;
  if (diffHrs  < 24)  return `Сьогодні, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  if (diffDays === 1) return `Вчора, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  return d.toLocaleDateString('uk', { day: 'numeric', month: 'long' });
}

export function renderProfile() {
  return `<div class="max-w-4xl mx-auto py-8 px-4 sm:px-0" id="profile-root"></div>`;
}

export async function initProfile() {
  const root = document.getElementById('profile-root');
  if (!root) return;

  const user = getUser()?.user || {};
  const name = user.name || 'Користувач';
  const email = user.email || '';
  const initials = getInitials(name);

  if (!taskStore.isLoaded()) {
    await taskStore.loadFromAPI();
  }

  const allTasks   = taskStore.getAll().filter(t => !t.parent_task_id);
  const total      = allTasks.length;
  const done       = allTasks.filter(t => t.status === 'Виконано').length;
  const focusPct   = total > 0 ? Math.round(done / total * 100) : 0;

  // Останні виконані задачі для активності
  const recentDone = allTasks
    .filter(t => t.status === 'Виконано' && t.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 5);

  const activityHTML = recentDone.length > 0
    ? recentDone.map((t, i) => `
        <div class="p-4 ${i < recentDone.length - 1 ? 'border-b border-white/5' : ''} flex items-center gap-4 hover:bg-[#292935] transition-colors">
          <div class="w-10 h-10 rounded-xl bg-[#4ddada]/10 flex items-center justify-center text-[#4ddada] shrink-0">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <div class="min-w-0">
            <p class="text-white font-medium truncate">${t.title}</p>
            <p class="text-xs text-slate-500 mt-0.5">${fmtDate(t.completed_at)}</p>
          </div>
        </div>`).join('')
    : `<div class="p-8 text-center text-slate-500">
        <span class="material-symbols-outlined text-4xl mb-2 block opacity-30">history</span>
        <p class="text-sm">Ще немає виконаних задач</p>
      </div>`;

  root.innerHTML = `
    <div class="mb-10 flex items-center gap-6">
      <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#292935] bg-gradient-to-tr from-[#6C63FF] to-[#3ECFCF] flex items-center justify-center text-3xl sm:text-5xl font-black text-[#1b1a26] shadow-2xl shrink-0">
        ${initials}
      </div>
      <div class="min-w-0">
        <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight truncate">${name}</h1>
        <p class="text-slate-400 mt-1 font-mono text-sm truncate">${email}</p>
        <div class="flex items-center gap-3 mt-4">
          <button onclick="window.location.hash='#/settings'" class="bg-[#292935] hover:bg-[#343440] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            Редагувати профіль
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-[#1b1a26] p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group">
        <div class="absolute right-[-20px] top-[-20px] text-[100px] text-[#c4c0ff] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform">
          <span class="material-symbols-outlined" style="font-size:inherit">task_alt</span>
        </div>
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Всього задач</p>
        <h3 class="text-4xl font-black text-white relative z-10">${total}</h3>
      </div>
      <div class="bg-[#1b1a26] p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group">
        <div class="absolute right-[-20px] top-[-20px] text-[100px] text-[#4ddada] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform">
          <span class="material-symbols-outlined" style="font-size:inherit">check_circle</span>
        </div>
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Виконано</p>
        <h3 class="text-4xl font-black text-[#4ddada] relative z-10">${done}</h3>
      </div>
      <div class="bg-[#1b1a26] p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group">
        <div class="absolute right-[-20px] top-[-20px] text-[100px] text-[#ffb2bc] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform">
          <span class="material-symbols-outlined" style="font-size:inherit">stars</span>
        </div>
        <p class="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Виконано %</p>
        <h3 class="text-4xl font-black text-white relative z-10">${focusPct}<span class="text-xl text-slate-400 font-medium">%</span></h3>
      </div>
    </div>

    <h2 class="text-xl font-bold text-white mb-6">Нещодавня активність</h2>
    <div class="bg-[#1b1a26] rounded-3xl border border-white/5 overflow-hidden">
      ${activityHTML}
    </div>
  `;
}