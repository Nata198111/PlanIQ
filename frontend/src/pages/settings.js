import { renderAIInsight } from '../components/ai-insight.js';
import { toast } from '../services/toast.js';
import { getUser, clearAuth, updateProfileAPI, changePasswordAPI, deleteAccountAPI } from '../services/auth.js';
import { preferencesStore } from '../services/preferences-store.js';
import { blockedSlotsStore } from '../services/blocked-slots-store.js';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function getInitials(name) {
  return (name || 'Користувач')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

export function renderSettings() {
  return `
<div class="max-w-6xl mx-auto flex gap-8">
  <nav class="w-[200px] flex-shrink-0 space-y-1" id="settings-nav">
    <a href="#" class="settings-tab flex items-center gap-3 px-4 py-3 rounded-xl bg-[#292935] text-[#c4c0ff] font-bold transition-all shadow-sm" data-tab="profile">
      <span class="text-lg">👤</span> Профіль
    </a>
    <a href="#" class="settings-tab flex items-center gap-3 px-4 py-3 rounded-xl text-[#c7c4d8] hover:bg-[#1f1e2a] transition-all" data-tab="hours">
      <span class="text-lg">🕐</span> Робочі години
    </a>
    <a href="#" class="settings-tab flex items-center gap-3 px-4 py-3 rounded-xl text-[#c7c4d8] hover:bg-[#1f1e2a] transition-all" data-tab="notifications">
      <span class="text-lg">🔔</span> Сповіщення
    </a>
    <a href="#" class="settings-tab flex items-center gap-3 px-4 py-3 rounded-xl text-[#c7c4d8] hover:bg-[#1f1e2a] transition-all" data-tab="algorithm">
      <span class="text-lg">🧠</span> Алгоритм
    </a>
    <a href="#" class="settings-tab flex items-center gap-3 px-4 py-3 rounded-xl text-[#c7c4d8] hover:bg-[#1f1e2a] transition-all" data-tab="security">
      <span class="text-lg">🔒</span> Безпека
    </a>
  </nav>
  <div class="flex-1 space-y-8" id="settings-content"></div>
</div>`;
}

function profileTab() {
  const auth = getUser();
  const user = auth.user || {};
  const prefs = preferencesStore.get();

  const name = user.name || 'Користувач';
  const email = user.email || '';
  const initials = getInitials(name);
  const timezone = prefs?.timezone || 'Europe/Kyiv';

  const selected = value => timezone === value ? 'selected' : '';

  return `
<section class="bg-[#1f1e2a] p-8 rounded-2xl glow-primary">
  <h2 class="text-2xl font-bold mb-8 flex items-center gap-3">
    <span class="w-1.5 h-6 bg-[#c4c0ff] rounded-full"></span>
    Особисті дані
  </h2>

  <div class="flex flex-col md:flex-row gap-12 items-start">
    <div class="relative group" id="avatar-container">
      <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-[#292935] relative bg-gradient-to-tr from-[#6C63FF] to-[#3ECFCF] flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-black/20" id="avatar-preview">
        ${escapeHTML(initials)}
      </div>
      <button class="mt-4 w-full text-center text-[10px] font-mono text-[#918fa1] uppercase tracking-widest cursor-not-allowed opacity-60" type="button">
        Фото незабаром
      </button>
    </div>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div class="space-y-2">
        <label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Ім'я</label>
        <input
          id="profile-name"
          class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none"
          type="text"
          value="${escapeHTML(name)}"/>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Електронна пошта</label>
        <input
          id="profile-email"
          class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-slate-400 outline-none cursor-not-allowed"
          type="email"
          value="${escapeHTML(email)}"
          readonly/>
      </div>

      <div class="space-y-2 md:col-span-2">
        <label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Часовий пояс</label>
        <div class="relative">
          <select
            id="profile-timezone"
            class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none">
            <option value="Europe/Kyiv" ${selected('Europe/Kyiv')}>UTC+2 / UTC+3 Київ</option>
            <option value="Europe/Warsaw" ${selected('Europe/Warsaw')}>UTC+1 / UTC+2 Варшава</option>
            <option value="Europe/London" ${selected('Europe/London')}>UTC+0 / UTC+1 Лондон</option>
          </select>
          <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#918fa1]">expand_more</span>
        </div>
      </div>

      <div class="md:col-span-2 pt-4">
        <button
          class="bg-[#c4c0ff] text-[#2000a4] px-8 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#c4c0ff]/20 transition-all active:scale-95"
          id="save-profile">
          Зберегти зміни
        </button>
      </div>
    </div>
  </div>
</section>`;
}

function securityTab() {
  return `
<section class="bg-[#1f1e2a] p-8 rounded-2xl">
  <h2 class="text-2xl font-bold mb-8 flex items-center gap-3"><span class="w-1.5 h-6 bg-[#4ddada] rounded-full"></span>Безпека</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="space-y-2"><label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Поточний пароль</label><input id="current-pw" class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#4ddada]/20 transition-all outline-none" placeholder="••••••••" type="password"/></div>
    <div class="space-y-2"><label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Новий пароль</label><input id="new-pw" class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#4ddada]/20 transition-all outline-none" placeholder="••••••••" type="password"/></div>
    <div class="space-y-2"><label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Підтвердити</label><input id="confirm-pw" class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#4ddada]/20 transition-all outline-none" placeholder="••••••••" type="password"/></div>
    <div class="md:col-span-3 pt-4"><p id="pw-error" class="text-[#ffb2bc] text-sm font-medium mb-3 hidden"></p><button class="bg-[#292935] text-[#4ddada] border border-[#4ddada]/20 px-8 py-3 rounded-full font-bold text-sm hover:bg-[#4ddada]/10 transition-all active:scale-95" id="change-pw">Змінити пароль</button></div>
  </div>
</section>
${renderAIInsight({ title: 'AI Порада', message: 'Регулярно змінюй пароль та не використовуй однакові паролі для різних сервісів.', icon: 'psychology' })}
<section class="bg-[#1b1a26] p-8 rounded-2xl border border-[#ffb2bc]/10">
  <h2 class="text-2xl font-bold mb-8 text-[#ffb2bc] flex items-center gap-3"><span class="material-symbols-outlined">warning</span>Небезпечна зона</h2>
  <div class="bg-[#ffb2bc]/5 border border-[#ffb2bc]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
    <div><div class="text-lg font-bold text-white flex items-center gap-2">⚠️ Видалення акаунту</div><p class="text-[#c7c4d8] text-sm mt-1">Всі ваші дані будуть видалені назавжди.</p></div>
    <button class="border-2 border-[#ffb2bc] text-[#ffb2bc] px-8 py-3 rounded-full font-bold text-sm hover:bg-[#ffb2bc] hover:text-[#670023] transition-all active:scale-95" id="delete-account">Видалити акаунт</button>
  </div>
</section>`;
}

function algorithmTab() {
  return `
<div class="mb-8">
  <h2 class="text-3xl font-black text-white tracking-tight mb-2">Налаштування алгоритму</h2>
  <p class="text-[#c7c4d8] max-w-2xl">Керуйте інтелектуальними функціями ПланІQ.</p>
</div>
${renderAIInsight({ title: 'AI Аналітика', message: 'Налаштуй алгоритм під свій стиль роботи — система врахує всі параметри при наступному плануванні.', icon: 'auto_awesome' })}
<div class="space-y-4 mt-6">
  <div class="glass-card p-6 rounded-2xl flex items-center justify-between group hover:bg-[#1f1e2a] transition-all">
    <div class="flex-1"><div class="flex items-center gap-2 mb-1"><h3 class="font-bold text-white">Коефіцієнт реальності</h3><span class="bg-[#c4c0ff]/20 text-[#c4c0ff] text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">Smart</span></div><p class="text-sm text-[#c7c4d8]">Автоматично збільшує оцінку часу.</p></div>
    <div class="flex items-center gap-6"><span class="font-mono text-sm text-[#c4c0ff]">+20%</span><div id="toggle-reality" class="w-12 h-6 bg-[#c4c0ff] rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="true"><div class="w-4 h-4 bg-[#2000a4] rounded-full translate-x-6 transition-transform toggle-knob"></div></div></div>
  </div>
  <div class="glass-card p-6 rounded-2xl flex items-center justify-between group hover:bg-[#1f1e2a] transition-all">
    <div class="flex-1"><h3 class="font-bold text-white mb-1">Автоматичне перепланування</h3><p class="text-sm text-[#c7c4d8]">AI перенесе невиконану задачу на наступне вікно.</p></div>
    <div id="toggle-reschedule" class="w-12 h-6 bg-[#c4c0ff] rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="true"><div class="w-4 h-4 bg-[#2000a4] rounded-full translate-x-6 transition-transform toggle-knob"></div></div>
  </div>
  <div class="glass-card p-6 rounded-2xl flex items-center justify-between group hover:bg-[#1f1e2a] transition-all">
    <div class="flex-1"><h3 class="font-bold text-white mb-1">Захист пікових годин</h3><p class="text-sm text-[#c7c4d8]">Резервувати години піку для Deep Work.</p></div>
    <div id="toggle-peak" class="w-12 h-6 bg-[#c4c0ff] rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="true"><div class="w-4 h-4 bg-[#2000a4] rounded-full translate-x-6 transition-transform toggle-knob"></div></div>
  </div>
  <div class="glass-card p-6 rounded-2xl space-y-4">
    <div class="flex items-center justify-between"><h3 class="font-bold text-white">Буфер між задачами</h3><span class="text-xs font-mono text-[#4ddada]">Рекомендовано: 15 хв</span></div>
    <p class="text-sm text-[#c7c4d8]">Пауза для відпочинку та перемикання контексту.</p>
    <div class="flex p-1 bg-[#1b1a26] rounded-xl buffer-group">
      <button class="flex-1 py-2 text-xs font-bold text-[#c7c4d8] hover:text-white buffer-btn">5 хв</button>
      <button class="flex-1 py-2 text-xs font-bold bg-[#343440] text-[#c4c0ff] rounded-lg shadow-sm buffer-btn active">10 хв</button>
      <button class="flex-1 py-2 text-xs font-bold text-[#c7c4d8] hover:text-white buffer-btn">15 хв</button>
      <button class="flex-1 py-2 text-xs font-bold text-[#c7c4d8] hover:text-white buffer-btn">30 хв</button>
    </div>
  </div>
  <div class="glass-card p-6 rounded-2xl space-y-4">
    <h3 class="font-bold text-white">Нагадування перед задачею</h3>
    <div class="flex p-1 bg-[#1b1a26] rounded-xl reminder-group">
      <button class="flex-1 py-2 text-xs font-bold text-[#c7c4d8] hover:text-white reminder-btn">Вимкнено</button>
      <button class="flex-1 py-2 text-xs font-bold bg-[#343440] text-[#c4c0ff] rounded-lg shadow-sm reminder-btn active">5 хв</button>
      <button class="flex-1 py-2 text-xs font-bold text-[#c7c4d8] hover:text-white reminder-btn">15 хв</button>
      <button class="flex-1 py-2 text-xs font-bold text-[#c7c4d8] hover:text-white reminder-btn">30 хв</button>
    </div>
  </div>
  <footer class="pt-12 pb-10">
    <button class="w-full py-4 bg-[#c4c0ff] text-[#2000a4] font-black rounded-2xl shadow-[0_10px_40px_-10px_rgba(108,99,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3" id="save-algorithm">
      <span class="material-symbols-outlined">save</span>Зберегти налаштування алгоритму
    </button>
  </footer>
</div>`;
}

function hoursTab() {
  const prefs = preferencesStore.get();
  const wh = prefs?.work_hours || { start: '09:00', end: '18:00' };
  const lb = prefs?.lunch_break || { enabled: true, start: '12:00', end: '13:00' };
  const workDays = prefs?.work_days || [0, 1, 2, 3, 4];

  const days = [
    { label: 'Пн', value: 0 },
    { label: 'Вт', value: 1 },
    { label: 'Ср', value: 2 },
    { label: 'Чт', value: 3 },
    { label: 'Пт', value: 4 },
    { label: 'Сб', value: 5 },
    { label: 'Нд', value: 6 },
  ];

  const blockedSlots = blockedSlotsStore.getAll();

  const blockedSlotsHTML = blockedSlots.length
    ? blockedSlots.map(slot => {
        const dayLabel = days.find(d => d.value === slot.day_of_week)?.label || '—';
        return `
          <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0d0d18] border border-white/5">
            <div class="min-w-0">
              <p class="text-sm font-bold text-white truncate">${escapeHTML(slot.title)}</p>
              <p class="text-xs text-slate-500 font-mono">${dayLabel} · ${slot.start_time}–${slot.end_time}</p>
            </div>
            <button class="delete-blocked-slot p-2 rounded-lg hover:bg-[#f35c7b]/10 text-[#f35c7b]" data-id="${slot.id}">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>`;
      }).join('')
    : `<div class="p-4 rounded-xl bg-[#0d0d18] text-sm text-slate-500 text-center">
        Заблокованих слотів ще немає
      </div>`;

  const isActiveDay = day => workDays.includes(day);

  const activePreset =
    wh.start === '06:00' && wh.end === '15:00' && workDays.join(',') === '0,1,2,3,4'
      ? 'morning'
      : wh.start === '16:00' && wh.end === '23:00' && workDays.join(',') === '0,1,2,3,4'
        ? 'night'
        : wh.start === '09:00' && wh.end === '18:00' && workDays.join(',') === '0,1,2,3,4'
          ? 'standard'
          : '';

  const presetClass = id =>
    activePreset === id
      ? 'bg-[#343440]/40 border-[#c4c0ff]/40 glow-primary active-preset'
      : 'glass-card border-white/5 hover:border-[#c4c0ff]/50';

  const presetCheck = id =>
    activePreset === id
      ? `<span class="ml-auto material-symbols-outlined text-[#c4c0ff] preset-check" style="font-variation-settings: 'FILL' 1;">check_circle</span>`
      : '';

  return `
<div class="mb-8">
  <div class="flex items-start justify-between mb-6">
    <div>
      <h2 class="text-2xl font-black text-white">Робочі години</h2>
      <p class="text-[#c7c4d8] mt-1">Налаштуй дні та час, коли система може планувати задачі.</p>
    </div>
    <button class="bg-[#c4c0ff] hover:bg-[#8781ff] text-[#2000a4] font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl glow-primary shrink-0" id="save-hours">
      <span class="material-symbols-outlined">save</span>
      Зберегти налаштування
    </button>
  </div>
</div>

<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
  <section class="xl:col-span-8 space-y-6">
    <div class="bg-[#1b1a26] rounded-3xl p-8 border border-white/5">
      <div class="flex justify-between items-start gap-4 mb-8">
        <div>
          <h2 class="text-xl font-bold text-white mb-2">Робочі дні</h2>
          <p class="text-sm text-slate-500">Обери дні, у які система може планувати задачі.</p>
        </div>
        <button class="px-5 py-2.5 rounded-full text-sm font-medium text-slate-400 hover:bg-white/5 transition-all active:scale-95" id="clear-days">
          Очистити
        </button>
      </div>

      <div class="grid grid-cols-7 gap-3 mb-10">
        ${days.map(day => `
          <button type="button"
            class="work-day-btn py-4 rounded-2xl text-sm font-black border transition-all ${isActiveDay(day.value)
              ? 'active bg-[#6C63FF]/30 border-[#c4c0ff]/40 text-white shadow-lg shadow-[#6C63FF]/10'
              : 'bg-[#0d0d18] border-white/5 text-slate-500 hover:text-white hover:bg-[#292935]'
            }" data-day="${day.value}">
            ${day.label}
          </button>
        `).join('')}
      </div>

      <div class="border-t border-white/5 pt-8">
        <h2 class="text-xl font-bold text-white mb-2">Робочий час</h2>
        <p class="text-sm text-slate-500 mb-6">Цей часовий проміжок застосовується до вибраних робочих днів.</p>
        <div class="grid grid-cols-2 gap-5">
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Початок</label>
            <input type="time" id="work-start" value="${wh.start}"
              class="w-full bg-[#0d0d18] border border-white/5 rounded-2xl px-5 py-4 text-white font-mono outline-none focus:ring-2 focus:ring-[#c4c0ff]/30" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-widest">Кінець</label>
            <input type="time" id="work-end" value="${wh.end}"
              class="w-full bg-[#0d0d18] border border-white/5 rounded-2xl px-5 py-4 text-white font-mono outline-none focus:ring-2 focus:ring-[#c4c0ff]/30" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-[#1b1a26] rounded-3xl p-8 border border-white/5">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[#4ddada]">restaurant</span>
          <div>
            <h3 class="font-bold text-white">Обідня перерва</h3>
            <p class="text-xs text-slate-500 mt-0.5">Система не буде планувати задачі в цей проміжок</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input ${lb.enabled ? 'checked' : ''} class="sr-only peer" type="checkbox" id="lunch-toggle"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ddada]"></div>
        </label>
      </div>
      <div class="flex items-end gap-4 transition-opacity ${lb.enabled ? '' : 'opacity-50 pointer-events-none grayscale'}" id="lunch-block">
        <div class="flex-1">
          <label class="text-[10px] text-slate-500 font-mono uppercase mb-2 block">З</label>
          <input type="time" id="lunch-start" value="${lb.start}"
            class="w-full bg-[#0d0d18] border border-white/5 rounded-2xl px-5 py-4 text-white font-mono outline-none focus:ring-2 focus:ring-[#4ddada]/20" />
        </div>
        <div class="pb-3 text-slate-600 flex-shrink-0 text-xl">—</div>
        <div class="flex-1">
          <label class="text-[10px] text-slate-500 font-mono uppercase mb-2 block">До</label>
          <input type="time" id="lunch-end" value="${lb.end}"
            class="w-full bg-[#0d0d18] border border-white/5 rounded-2xl px-5 py-4 text-white font-mono outline-none focus:ring-2 focus:ring-[#4ddada]/20" />
        </div>
      </div>
    </div>
    ${renderAIInsight({
      title: 'AI Аналітика',
      message: 'Ці налаштування будуть використані для майбутнього інтелектуального планування задач.',
      icon: 'psychology'
    })}
  </section>

  <aside class="xl:col-span-4 space-y-6">
    <div class="bg-[#1b1a26] rounded-3xl p-6 border border-white/5">
      <h3 class="text-base font-bold text-white mb-4">Швидкі пресети</h3>
      <div class="space-y-3" id="preset-list">
        <div class="${presetClass('morning')} preset-card p-4 rounded-2xl border transition-all cursor-pointer" data-preset="morning">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#00b3b3]/20 rounded-xl flex items-center justify-center text-[#00b3b3] flex-shrink-0">
              <span class="material-symbols-outlined text-sm">wb_sunny</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-white text-sm">Ранкова людина</h4>
              <p class="text-xs text-slate-400 font-mono">06:00 — 15:00</p>
            </div>
            ${presetCheck('morning')}
          </div>
        </div>

        <div class="${presetClass('standard')} preset-card p-4 rounded-2xl border transition-all cursor-pointer" data-preset="standard">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#8781ff]/20 rounded-xl flex items-center justify-center text-[#c4c0ff] flex-shrink-0">
              <span class="material-symbols-outlined text-sm">work</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-white text-sm">Стандартний</h4>
              <p class="text-xs text-slate-400 font-mono">09:00 — 18:00</p>
            </div>
            ${presetCheck('standard')}
          </div>
        </div>

        <div class="${presetClass('night')} preset-card p-4 rounded-2xl border transition-all cursor-pointer" data-preset="night">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#f35c7b]/20 rounded-xl flex items-center justify-center text-[#ffb2bc] flex-shrink-0">
              <span class="material-symbols-outlined text-sm">dark_mode</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-white text-sm">Нічна сова</h4>
              <p class="text-xs text-slate-400 font-mono">16:00 — 23:00</p>
            </div>
            ${presetCheck('night')}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-[#1b1a26] rounded-3xl p-6 border border-white/5">
      <div class="flex items-center gap-3 mb-6">
        <span class="material-symbols-outlined text-[#c4c0ff]">block</span>
        <div>
          <h3 class="font-bold text-white">Заблоковані слоти</h3>
          <p class="text-xs text-slate-500">Час, у який система не буде планувати задачі.</p>
        </div>
      </div>

      <div class="space-y-3 mb-5">
        <input id="blocked-title"
          class="w-full bg-[#0d0d18] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#c4c0ff]/20"
          placeholder="Назва" />
        <select id="blocked-day"
          class="w-full bg-[#0d0d18] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#c4c0ff]/20">
          ${days.map(day => `<option value="${day.value}">${day.label}</option>`).join('')}
        </select>
        <div class="grid grid-cols-2 gap-3">
          <input id="blocked-start" type="time" value="09:00"
            class="w-full bg-[#0d0d18] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#c4c0ff]/20" />
          <input id="blocked-end" type="time" value="10:00"
            class="w-full bg-[#0d0d18] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#c4c0ff]/20" />
        </div>
        <button id="add-blocked-slot"
          class="w-full bg-[#292935] hover:bg-[#343440] text-[#c4c0ff] font-medium py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
          <span class="material-symbols-outlined text-sm">add</span>
          Додати заблокований слот
        </button>
      </div>

      <div id="blocked-slots-list" class="space-y-3 max-h-[148px] overflow-y-auto custom-scrollbar pr-1">
        ${blockedSlotsHTML}
      </div>
    </div>
  </aside>
</div>`;
}

function notificationsTab() {
  const prefs = preferencesStore.get();
  const notificationSettings = prefs?.notifications || {};

  const enabled = notificationSettings.enabled ?? prefs?.notifications_enabled ?? true;
  const deadlineSoon = notificationSettings.deadline_soon ?? true;
  const taskOverdue = notificationSettings.task_overdue ?? true;
  const rescheduled = notificationSettings.rescheduled ?? true;
  const planningDone = notificationSettings.planning_done ?? true;
  const weeklyDigest = notificationSettings.weekly_digest ?? false;
  const motivation = notificationSettings.motivation ?? false;
  const deadlineWarningHours = notificationSettings.deadline_warning_hours ?? 3;

  const checked = value => value ? 'checked' : '';

  return `
<div class="mb-8">
  <h2 class="text-3xl font-black text-white tracking-tight mb-2">Сповіщення</h2>
  <p class="text-[#c7c4d8] leading-relaxed max-w-2xl">Керуй тим, які системні нагадування створює ПланІQ.</p>
</div>

<div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
  <div class="xl:col-span-12 flex flex-col gap-4">
    ${renderAIInsight({
      title: 'Розумна оптимізація',
      message: 'Ці налаштування визначають, які сповіщення система створюватиме автоматично.',
      icon: 'auto_awesome'
    })}

    <div class="space-y-3 mt-4">
      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff]">
            <span class="material-symbols-outlined">notifications</span>
          </div>
          <div>
            <p class="text-white font-medium">Увімкнути сповіщення</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">Main switch</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input ${checked(enabled)} class="sr-only peer notify-toggle" type="checkbox" id="notif-enabled"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>

      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#ffb2bc]/10 flex items-center justify-center text-[#ffb2bc]">
            <span class="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p class="text-white font-medium">Попередження про дедлайн</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">deadline_soon</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <select id="deadline-warning-hours" class="bg-[#343440] text-[#ffb2bc] text-sm font-bold rounded-lg px-3 py-2 outline-none">
            <option value="1" ${deadlineWarningHours === 1 ? 'selected' : ''}>1 год</option>
            <option value="3" ${deadlineWarningHours === 3 ? 'selected' : ''}>3 год</option>
            <option value="6" ${deadlineWarningHours === 6 ? 'selected' : ''}>6 год</option>
            <option value="24" ${deadlineWarningHours === 24 ? 'selected' : ''}>24 год</option>
          </select>
          <label class="relative inline-flex items-center cursor-pointer">
            <input ${checked(deadlineSoon)} class="sr-only peer notify-toggle" type="checkbox" id="notif-deadline-soon"/>
            <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
          </label>
        </div>
      </div>

      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#ffb2bc]/10 flex items-center justify-center text-[#ffb2bc]">
            <span class="material-symbols-outlined">notification_important</span>
          </div>
          <div>
            <p class="text-white font-medium">Прострочені задачі</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">task_overdue</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input ${checked(taskOverdue)} class="sr-only peer notify-toggle" type="checkbox" id="notif-task-overdue"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>

      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#4ddada]/10 flex items-center justify-center text-[#4ddada]">
            <span class="material-symbols-outlined">update</span>
          </div>
          <div>
            <p class="text-white font-medium">Сповіщення про перенесення задач</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">rescheduled</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input ${checked(rescheduled)} class="sr-only peer notify-toggle" type="checkbox" id="notif-rescheduled"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>

      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#4ddada]/10 flex items-center justify-center text-[#4ddada]">
            <span class="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <p class="text-white font-medium">AI-сповіщення</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">planning_done</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input ${checked(planningDone)} class="sr-only peer notify-toggle" type="checkbox" id="notif-planning-done"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>
    </div>
  </div>
</div>

<div class="mt-8 pt-4">
  <button id="save-notifications" class="px-8 py-3 bg-[#c4c0ff] hover:bg-[#8781ff] text-[#2000a4] font-bold rounded-xl shadow-lg shadow-[#c4c0ff]/20 active:scale-95 transition-all">
    Зберегти зміни
  </button>
</div>`;
}

export async function initSettings() {
  const content = document.getElementById('settings-content');
  const tabs = document.querySelectorAll('.settings-tab');

  if (!preferencesStore.isLoaded()) {
    await preferencesStore.load();
  }
  if (!blockedSlotsStore.isLoaded()) {
    await blockedSlotsStore.load();
  }

  function setToggleSwitch(sw, value) {
    if (!sw) return;
    const knob = sw.querySelector('.toggle-knob');
    sw.dataset.on = value ? 'true' : 'false';

    if (value) {
      sw.classList.remove('bg-slate-700');
      sw.classList.add('bg-[#c4c0ff]');
      if (knob) {
        knob.classList.remove('translate-x-0', 'bg-slate-400');
        knob.classList.add('translate-x-6', 'bg-[#2000a4]');
      }
    } else {
      sw.classList.remove('bg-[#c4c0ff]');
      sw.classList.add('bg-slate-700');
      if (knob) {
        knob.classList.remove('translate-x-6', 'bg-[#2000a4]');
        knob.classList.add('translate-x-0', 'bg-slate-400');
      }
    }
  }

  function setActiveChoice(groupClass, value) {
    document.querySelectorAll(`.${groupClass}-btn`).forEach(btn => {
      const text = btn.textContent.trim();
      const isActive =
        text === `${value} хв` ||
        (value === 0 && text === 'Вимкнено');

      if (isActive) {
        btn.classList.add('active', 'bg-[#343440]', 'text-[#c4c0ff]', 'rounded-lg', 'shadow-sm');
        btn.classList.remove('text-[#c7c4d8]');
      } else {
        btn.classList.remove('active', 'bg-[#343440]', 'text-[#c4c0ff]', 'rounded-lg', 'shadow-sm');
        btn.classList.add('text-[#c7c4d8]');
      }
    });
  }

  function hydrateHoursTab() {
    const prefs = preferencesStore.get();
    const wh = prefs?.work_hours || { start: '09:00', end: '18:00' };
    const lb = prefs?.lunch_break || { enabled: true, start: '12:00', end: '13:00' };

    const startInput = document.getElementById('work-start');
    const endInput = document.getElementById('work-end');
    if (startInput) startInput.value = wh.start;
    if (endInput) endInput.value = wh.end;

    const lunchToggle = document.getElementById('lunch-toggle');
    const lunchBlock = document.getElementById('lunch-block');
    if (lunchToggle) {
      lunchToggle.checked = lb.enabled;
      if (lunchBlock) {
        lunchBlock.classList.toggle('opacity-50', !lb.enabled);
        lunchBlock.classList.toggle('pointer-events-none', !lb.enabled);
        lunchBlock.classList.toggle('grayscale', !lb.enabled);
      }
    }
  }

  function hydrateAlgorithmTab() {
    const algo = preferencesStore.getAlgorithm();
    setToggleSwitch(document.getElementById('toggle-reality'), algo.reality_coefficient > 1);
    setToggleSwitch(document.getElementById('toggle-reschedule'), algo.auto_reschedule);
    setToggleSwitch(document.getElementById('toggle-peak'), algo.protect_peak_hours);
    setActiveChoice('buffer', algo.buffer_minutes);
    setActiveChoice('reminder', algo.reminder_minutes);
  }

  function hydrateNotificationsTab() {
    const prefs = preferencesStore.get();
    const settings = prefs?.notifications || {};

    const setChecked = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.checked = value;
    };

    setChecked('notif-enabled', settings.enabled ?? prefs?.notifications_enabled ?? true);
    setChecked('notif-deadline-soon', settings.deadline_soon ?? true);
    setChecked('notif-task-overdue', settings.task_overdue ?? true);
    setChecked('notif-rescheduled', settings.rescheduled ?? true);
    setChecked('notif-planning-done', settings.planning_done ?? true);
    setChecked('notif-weekly-digest', settings.weekly_digest ?? false);
    setChecked('notif-motivation', settings.motivation ?? false);

    const warningSelect = document.getElementById('deadline-warning-hours');
    if (warningSelect) warningSelect.value = String(settings.deadline_warning_hours ?? 3);
  }

  function clearActivePreset() {
    document.querySelectorAll('.preset-card').forEach(card => {
      card.className = 'glass-card preset-card p-5 rounded-2xl border border-white/5 hover:border-[#c4c0ff]/50 transition-all cursor-pointer';
      const check = card.querySelector('.preset-check');
      if (check) check.remove();
    });
  }

  function setActiveDays(days) {
    document.querySelectorAll('.work-day-btn').forEach(btn => {
      const day = parseInt(btn.dataset.day, 10);
      const active = days.includes(day);
      btn.className = active
        ? 'work-day-btn py-4 rounded-2xl text-sm font-black border transition-all active bg-[#6C63FF]/30 border-[#c4c0ff]/40 text-white shadow-lg shadow-[#6C63FF]/10'
        : 'work-day-btn py-4 rounded-2xl text-sm font-black border transition-all bg-[#0d0d18] border-white/5 text-slate-500 hover:text-white hover:bg-[#292935]';
    });
  }

  function setActivePreset(card) {
    clearActivePreset();
    card.className = 'bg-[#343440]/40 p-5 rounded-2xl border border-[#c4c0ff]/40 transition-all glow-primary preset-card active-preset cursor-pointer';
    const row = card.querySelector('.flex.items-center.gap-4');
    if (row && !row.querySelector('.preset-check')) {
      row.innerHTML += `<span class="ml-auto material-symbols-outlined text-[#c4c0ff] preset-check" style="font-variation-settings: 'FILL' 1;">check_circle</span>`;
    }
  }

  function applyPreset(start, end, days, presetId) {
    const startInput = document.getElementById('work-start');
    const endInput = document.getElementById('work-end');
    if (startInput) startInput.value = start;
    if (endInput) endInput.value = end;
    setActiveDays(days);
    const card = document.querySelector(`.preset-card[data-preset="${presetId}"]`);
    if (card) setActivePreset(card);
  }

  function showTab(tabId) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === tabId;
      t.className = `settings-tab flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
        ? 'bg-[#292935] text-[#c4c0ff] font-bold shadow-sm'
        : 'text-[#c7c4d8] hover:bg-[#1f1e2a]'}`;
    });

    if (tabId === 'profile') content.innerHTML = profileTab();
    else if (tabId === 'algorithm') content.innerHTML = algorithmTab();
    else if (tabId === 'hours') content.innerHTML = hoursTab();
    else if (tabId === 'notifications') content.innerHTML = notificationsTab();
    else if (tabId === 'security') content.innerHTML = securityTab();

    if (tabId === 'hours') hydrateHoursTab();
    if (tabId === 'algorithm') hydrateAlgorithmTab();
    if (tabId === 'notifications') hydrateNotificationsTab();

    initTabInteractions(tabId);
  }

  function initTabInteractions(tabId) {
    if (tabId === 'profile') {
      const saveProfile = document.getElementById('save-profile');
      if (saveProfile) {
        saveProfile.addEventListener('click', async () => {
          saveProfile.disabled = true;
          saveProfile.textContent = 'Зберігаємо...';
          try {
            const name = document.getElementById('profile-name')?.value?.trim() || '';
            const timezone = document.getElementById('profile-timezone')?.value || 'Europe/Kyiv';
            if (name.length < 2) {
              toast('Ім\'я має містити щонайменше 2 символи', 'error');
              return;
            }
            const user = await updateProfileAPI(name);
            await preferencesStore.patch({ timezone });
            window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: user }));
            toast('Профіль збережено!', 'success');
          } catch (err) {
            console.error('Save profile error:', err);
            toast(err.message || 'Помилка збереження профілю', 'error');
          } finally {
            saveProfile.disabled = false;
            saveProfile.textContent = 'Зберегти зміни';
          }
        });
      }
    }

    if (tabId === 'hours') {
      document.querySelectorAll('.work-day-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const active = btn.classList.contains('active');
          if (active) {
            btn.className = 'work-day-btn py-4 rounded-2xl text-sm font-black border transition-all bg-[#0d0d18] border-white/5 text-slate-500 hover:text-white hover:bg-[#292935]';
          } else {
            btn.className = 'work-day-btn py-4 rounded-2xl text-sm font-black border transition-all active bg-[#6C63FF]/30 border-[#c4c0ff]/40 text-white shadow-lg shadow-[#6C63FF]/10';
          }
          clearActivePreset();
        });
      });

      const clearDays = document.getElementById('clear-days');
      if (clearDays) {
        clearDays.addEventListener('click', () => {
          setActiveDays([]);
          clearActivePreset();
          toast('Робочі дні очищено', 'info');
        });
      }

      document.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
          const preset = card.dataset.preset;
          if (preset === 'morning') applyPreset('06:00', '15:00', [0, 1, 2, 3, 4], 'morning');
          else if (preset === 'night') applyPreset('16:00', '23:00', [0, 1, 2, 3, 4], 'night');
          else applyPreset('09:00', '18:00', [0, 1, 2, 3, 4], 'standard');
          toast('Пресет графіку застосовано!', 'success');
        });
      });

      const lunchToggle = document.getElementById('lunch-toggle');
      if (lunchToggle) {
        lunchToggle.addEventListener('change', e => {
          const block = document.getElementById('lunch-block');
          if (!block) return;
          if (!e.target.checked) {
            block.classList.add('opacity-50', 'pointer-events-none', 'grayscale');
            toast('Обідня перерва вимкнена', 'info');
          } else {
            block.classList.remove('opacity-50', 'pointer-events-none', 'grayscale');
            toast('Обідня перерва увімкнена', 'success');
          }
        });
      }

      const addBlockedSlot = document.getElementById('add-blocked-slot');
      if (addBlockedSlot) {
        addBlockedSlot.addEventListener('click', async () => {
          const title = document.getElementById('blocked-title')?.value?.trim() || '';
          const day = parseInt(document.getElementById('blocked-day')?.value || '0', 10);
          const start = document.getElementById('blocked-start')?.value || '09:00';
          const end = document.getElementById('blocked-end')?.value || '10:00';

          if (!title) { toast('Вкажи назву заблокованого слота', 'error'); return; }
          if (start >= end) { toast('Час завершення має бути пізніше за початок', 'error'); return; }

          addBlockedSlot.disabled = true;
          addBlockedSlot.textContent = 'Додаємо...';
          try {
            await blockedSlotsStore.addSlot({ title, day_of_week: day, start_time: start, end_time: end, color: '#4ddada' });
            toast('Заблокований слот додано', 'success');
            showTab('hours');
          } catch (err) {
            console.error('Add blocked slot error:', err);
            toast(err.message || 'Не вдалося додати слот', 'error');
          } finally {
            addBlockedSlot.disabled = false;
            addBlockedSlot.innerHTML = '<span class="material-symbols-outlined text-sm">add</span> Додати заблокований слот';
          }
        });
      }

      document.querySelectorAll('.delete-blocked-slot').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (!id) return;
          btn.disabled = true;
          try {
            await blockedSlotsStore.deleteSlot(id);
            toast('Заблокований слот видалено', 'success');
            showTab('hours');
          } catch (err) {
            console.error('Delete blocked slot error:', err);
            toast(err.message || 'Не вдалося видалити слот', 'error');
          }
        });
      });

      const saveHours = document.getElementById('save-hours');
      if (saveHours) {
        saveHours.addEventListener('click', async () => {
          saveHours.disabled = true;
          saveHours.textContent = 'Зберігаємо...';
          try {
            const workDays = [...document.querySelectorAll('.work-day-btn.active')]
              .map(btn => parseInt(btn.dataset.day, 10))
              .filter(day => !Number.isNaN(day))
              .sort((a, b) => a - b);
            const start = document.getElementById('work-start')?.value || '09:00';
            const end = document.getElementById('work-end')?.value || '18:00';
            const lunchEnabled = document.getElementById('lunch-toggle')?.checked ?? true;
            const lunchStart = document.getElementById('lunch-start')?.value || '12:00';
            const lunchEnd = document.getElementById('lunch-end')?.value || '13:00';
            await preferencesStore.patch({
              work_hours: { start, end },
              work_days: workDays,
              lunch_break: { enabled: lunchEnabled, start: lunchStart, end: lunchEnd },
            });
            toast('Графік робочих годин збережено!', 'success');
          } catch (err) {
            console.error('Save hours error:', err);
            toast('Помилка збереження графіку', 'error');
          } finally {
            saveHours.disabled = false;
            saveHours.innerHTML = '<span class="material-symbols-outlined">save</span> Зберегти налаштування';
          }
        });
      }
    }

    if (tabId === 'algorithm') {
      document.querySelectorAll('#toggle-reality, #toggle-reschedule, #toggle-peak').forEach(sw => {
        sw.addEventListener('click', () => {
          setToggleSwitch(sw, sw.dataset.on !== 'true');
        });
      });

      ['buffer', 'reminder'].forEach(group => {
        document.querySelectorAll(`.${group}-btn`).forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll(`.${group}-btn`).forEach(b => {
              b.classList.remove('active', 'bg-[#343440]', 'text-[#c4c0ff]', 'rounded-lg', 'shadow-sm');
              b.classList.add('text-[#c7c4d8]');
            });
            btn.classList.add('active', 'bg-[#343440]', 'text-[#c4c0ff]', 'rounded-lg', 'shadow-sm');
            btn.classList.remove('text-[#c7c4d8]');
          });
        });
      });

      const saveAlgo = document.getElementById('save-algorithm');
      if (saveAlgo) {
        saveAlgo.addEventListener('click', async () => {
          saveAlgo.disabled = true;
          saveAlgo.textContent = 'Зберігаємо...';
          try {
            const bufferBtn = document.querySelector('.buffer-btn.active');
            const reminderBtn = document.querySelector('.reminder-btn.active');
            const bufferText = bufferBtn?.textContent?.trim() || '10 хв';
            const reminderText = reminderBtn?.textContent?.trim() || '15 хв';
            const bufferMinutes = parseInt(bufferText, 10) || 10;
            const reminderMinutes = reminderText === 'Вимкнено' ? 0 : (parseInt(reminderText, 10) || 15);
            await preferencesStore.patch({
              reality_coefficient: document.getElementById('toggle-reality')?.dataset.on === 'true' ? 1.2 : 1.0,
              auto_reschedule: document.getElementById('toggle-reschedule')?.dataset.on === 'true',
              protect_peak_hours: document.getElementById('toggle-peak')?.dataset.on === 'true',
              buffer_minutes: bufferMinutes,
              reminder_minutes: reminderMinutes,
            });
            toast('Налаштування алгоритму збережено!', 'success');
          } catch (err) {
            console.error('Save algorithm error:', err);
            toast('Помилка збереження алгоритму', 'error');
          } finally {
            saveAlgo.disabled = false;
            saveAlgo.innerHTML = '<span class="material-symbols-outlined">save</span>Зберегти налаштування алгоритму';
          }
        });
      }
    }

    if (tabId === 'notifications') {
      document.querySelectorAll('.notify-toggle').forEach(toggle => {
        toggle.addEventListener('change', e => {
          if (e.target.checked) toast('Опцію сповіщень увімкнено', 'success');
          else toast('Опцію сповіщень вимкнено', 'info');
        });
      });

      const saveNotif = document.getElementById('save-notifications');
      if (saveNotif) {
        saveNotif.addEventListener('click', async () => {
          saveNotif.disabled = true;
          saveNotif.textContent = 'Зберігаємо...';
          try {
            const settings = {
              enabled: document.getElementById('notif-enabled')?.checked ?? true,
              deadline_soon: document.getElementById('notif-deadline-soon')?.checked ?? true,
              task_overdue: document.getElementById('notif-task-overdue')?.checked ?? true,
              rescheduled: document.getElementById('notif-rescheduled')?.checked ?? true,
              planning_done: document.getElementById('notif-planning-done')?.checked ?? true,
              weekly_digest: document.getElementById('notif-weekly-digest')?.checked ?? false,
              motivation: document.getElementById('notif-motivation')?.checked ?? false,
              deadline_warning_hours: parseInt(document.getElementById('deadline-warning-hours')?.value || '3', 10),
              reminder_minutes: 15,
            };
            await preferencesStore.patch({
              notifications_enabled: settings.enabled,
              notifications: settings,
            });
            toast('Налаштування сповіщень збережено!', 'success');
          } catch (err) {
            console.error('Save notifications error:', err);
            toast('Помилка збереження сповіщень', 'error');
          } finally {
            saveNotif.disabled = false;
            saveNotif.textContent = 'Зберегти зміни';
          }
        });
      }
    }

    if (tabId === 'security') {
      const changePw = document.getElementById('change-pw');
      const errorBox = document.getElementById('pw-error');

      const showPasswordError = (message) => {
        if (!errorBox) return;
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
      };

      const clearPasswordError = () => {
        if (!errorBox) return;
        errorBox.textContent = '';
        errorBox.classList.add('hidden');
      };

      if (changePw) {
        changePw.addEventListener('click', async () => {
          clearPasswordError();
          const currentPassword = document.getElementById('current-pw')?.value || '';
          const newPassword = document.getElementById('new-pw')?.value || '';
          const confirmPassword = document.getElementById('confirm-pw')?.value || '';

          if (!currentPassword || !newPassword || !confirmPassword) {
            showPasswordError('Заповни всі поля пароля.');
            return;
          }
          if (newPassword.length < 6) {
            showPasswordError('Новий пароль має містити щонайменше 6 символів.');
            return;
          }
          if (newPassword !== confirmPassword) {
            showPasswordError('Новий пароль і підтвердження не збігаються.');
            return;
          }

          changePw.disabled = true;
          changePw.textContent = 'Змінюємо...';
          try {
            await changePasswordAPI(currentPassword, newPassword);
            document.getElementById('current-pw').value = '';
            document.getElementById('new-pw').value = '';
            document.getElementById('confirm-pw').value = '';
            toast('Пароль успішно змінено!', 'success');
          } catch (err) {
            console.error('Change password error:', err);
            showPasswordError(err.message || 'Не вдалося змінити пароль.');
            toast('Помилка зміни пароля', 'error');
          } finally {
            changePw.disabled = false;
            changePw.textContent = 'Змінити пароль';
          }
        });
      }

      const deleteAccount = document.getElementById('delete-account');
      if (deleteAccount) {
        deleteAccount.addEventListener('click', () => {
          const existing = document.getElementById('delete-confirm-box');
          if (existing) { existing.remove(); return; }

          const box = document.createElement('div');
          box.id = 'delete-confirm-box';
          box.className = 'mt-4 p-4 bg-[#93000a]/20 border border-[#ffb2bc]/30 rounded-2xl space-y-3';
          box.innerHTML = `
            <p class="text-sm text-[#ffb2bc] font-medium">Ти впевнений? Всі задачі, налаштування та сповіщення будуть видалені назавжди.</p>
            <div class="flex gap-3">
              <button id="delete-confirm-yes" class="flex-1 py-2 bg-[#ffb2bc] text-[#670023] font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all">Так, видалити</button>
              <button id="delete-confirm-no" class="flex-1 py-2 bg-[#292935] text-slate-300 font-bold rounded-xl text-sm hover:bg-[#343440] active:scale-95 transition-all">Скасувати</button>
            </div>`;

          deleteAccount.parentElement.appendChild(box);
          document.getElementById('delete-confirm-no').onclick = () => box.remove();
          document.getElementById('delete-confirm-yes').onclick = async () => {
            const yesBtn = document.getElementById('delete-confirm-yes');
            yesBtn.disabled = true;
            yesBtn.textContent = 'Видаляємо...';
            try {
              await deleteAccountAPI();
              clearAuth();
              preferencesStore.clear();
              toast('Акаунт видалено', 'info');
              setTimeout(() => { window.location.hash = '#/landing'; }, 400);
            } catch (err) {
              toast(err.message || 'Помилка видалення акаунту', 'error');
              box.remove();
            }
          };
        });
      }
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      showTab(tab.dataset.tab);
    });
  });

  showTab('profile');
}