import { renderAIInsight } from '../components/ai-insight.js';
import { renderTaskAIActions, initTaskAIActions } from '../components/task-ai-actions.js';
import { toast } from '../services/toast.js';
import { registerCleanup } from '../utils/cleanup.js';
import { taskStore, CATEGORIES } from '../services/task-store.js';
import { renderTaskForm, initTaskForm } from '../components/task-form.js';
import { renderCalendarView, initCalendarView } from '../components/calendar-view.js';
import { blockedSlotsStore } from '../services/blocked-slots-store.js';
import { preferencesStore } from '../services/preferences-store.js';

const MOCK_TODAY = new Date();
const MONTHS_UA = ['СІЧЕНЬ','ЛЮТИЙ','БЕРЕЗЕНЬ','КВІТЕНЬ','ТРАВЕНЬ','ЧЕРВЕНЬ','ЛИПЕНЬ','СЕРПЕНЬ','ВЕРЕСЕНЬ','ЖОВТЕНЬ','ЛИСТОПАД','ГРУДЕНЬ'];

function getLocalDateKey(date = MOCK_TODAY) {
  const d = new Date(date);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function getTaskPlanDate(task) {
  return task.scheduled_date || task.date || '';
}

function getTaskPlanTime(task) {
  return task.scheduled_time || task.time || '23:59';
}

function getTaskPlanDateTime(task) {
  const planDate = getTaskPlanDate(task);
  const planTime = getTaskPlanTime(task);

  if (!planDate) return null;

  const dt = new Date(`${planDate}T${planTime}`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const _saved = JSON.parse(localStorage.getItem('focus-ds') || '{}');
let ds = {
  timerId: null,
  seconds: _saved.seconds || 0,
  paused: false,
  stopped: false,
  calMode: _saved.calMode || 'week',
  filter: 'all',
  priFilter: _saved.priFilter || 'all',
  lastFocusId: _saved.lastFocusId || null,
  started: _saved.started || false,
};
ds.anchor = new Date();

function calLabel() {
  const sh = (full) => full.charAt(0).toUpperCase() + full.slice(1, 3).toLowerCase();
  if (ds.calMode === 'week') {
    // Рахуємо той самий понеділок що і renderWeekGrid
    const startOfWeek = new Date(ds.anchor);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);
    const m1 = sh(MONTHS_UA[startOfWeek.getMonth()]);
    const m2 = sh(MONTHS_UA[end.getMonth()]);
    return m1 === m2
      ? `${m1} ${startOfWeek.getDate()}–${end.getDate()}`
      : `${startOfWeek.getDate()} ${m1} – ${end.getDate()} ${m2}`;
  }
  return `${sh(MONTHS_UA[ds.anchor.getMonth()])} ${ds.anchor.getFullYear()}`;
}

function renderPrioritiesList(filterType) {
  let tasks = taskStore.getAll().filter(t => t.status !== 'Виконано');
  const fmtToday = getLocalDateKey();

  if (filterType === 'today') {
    tasks = tasks.filter(t => getTaskPlanDate(t) === fmtToday);
  } else if (filterType === 'urgent') {
    tasks = tasks.filter(t => t.status === 'Терміново' || t.priority === 'High');
  }

  tasks.sort((a, b) => {
    if (a.status === 'Терміново' && b.status !== 'Терміново') return -1;
    if (a.status !== 'Терміново' && b.status === 'Терміново') return 1;

    const pWeight = { High: 3, Mid: 2, Low: 1 };
    const wa = pWeight[a.priority] || 0;
    const wb = pWeight[b.priority] || 0;

    if (wa !== wb) return wb - wa;

    const aDateTime = getTaskPlanDateTime(a);
    const bDateTime = getTaskPlanDateTime(b);

    if (aDateTime && bDateTime && aDateTime.getTime() !== bDateTime.getTime()) {
      return aDateTime - bDateTime;
    }

    if (aDateTime && !bDateTime) return -1;
    if (!aDateTime && bDateTime) return 1;

    return (b.complexity || 0) - (a.complexity || 0);
  });

  const topTasks = tasks.slice(0, 3);

  if (topTasks.length === 0) {
    return `<div class="flex flex-col items-center justify-center py-8 text-center text-[#c7c4d8] border border-dashed border-white/10 rounded-xl bg-white/5"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">task_alt</span><p class="text-sm font-bold">Немає задач</p><p class="text-[10px] opacity-70 mt-1">Змініть фільтр</p></div>`;
  }

  const dotColors = { High: '#ffb4ab', Mid: '#4ddada', Low: '#c7c4d8', 'Терміново': '#ffb4ab' };

  return topTasks.map((t, idx) => {
    const num = idx + 1;
    const isTop = num === 1;
    const numBg = isTop ? 'bg-[#c4c0ff]' : 'bg-[#343440]';
    const numText = isTop ? 'text-[#2000a4]' : 'text-[#c7c4d8]';
    const numBorder = !isTop;
    const priLabel = t.priority || 'Mid';
    const pulse = (priLabel === 'High' || t.status === 'Терміново') ? ' animate-pulse' : '';
    const planDate = getTaskPlanDate(t) || '—';

    return `<div class="pri-card bg-[#1b1a26] p-4 rounded-2xl flex gap-4 group hover:bg-[#292935] transition-all cursor-pointer${priLabel === 'Low' ? ' opacity-80' : ''}" data-task="${t.id}" data-pri="${priLabel}">
      <div class="flex-shrink-0 w-8 h-8 ${numBg} ${numText} rounded-xl flex items-center justify-center font-mono text-sm font-black${numBorder ? ' border border-[#464555]/20' : ' shadow-lg shadow-[#c4c0ff]/20'}">${num}</div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start mb-2 gap-3"><h4 class="text-sm font-bold group-hover:text-[#c4c0ff] transition-colors truncate">${t.title}</h4><span class="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5${pulse}" style="background:${dotColors[priLabel] || '#c7c4d8'}"></span></div>
        <div class="flex items-center justify-between text-[10px] font-mono text-[#c7c4d8] mb-3"><span class="flex items-center gap-1 flex-shrink-0"><span class="material-symbols-outlined text-[12px]">calendar_today</span> ${planDate}</span><span class="bg-[#343440] px-1.5 py-0.5 rounded flex-shrink-0 ml-2 truncate max-w-[80px] text-center">${priLabel}</span></div>
        <div class="space-y-1"><div class="flex justify-between text-[8px] font-bold uppercase tracking-wider text-[#c7c4d8]"><span>Складність</span><span class="text-[#c4c0ff]">${t.complexity || 0}/10</span></div><div class="h-1 bg-[#343440] rounded-full overflow-hidden"><div class="h-full bg-[#c4c0ff]" style="width:${(t.complexity || 0) * 10}%"></div></div></div>
      </div>
    </div>`;
  }).join('');
}

function getFocusTask() {
  const tasks = taskStore.getAll();
  const skipped = ds.skippedIds || [];
  const fmtToday = [
    MOCK_TODAY.getFullYear(),
    String(MOCK_TODAY.getMonth() + 1).padStart(2, '0'),
    String(MOCK_TODAY.getDate()).padStart(2, '0')
  ].join('-');

  const sortByRelevance = (a, b) => {
    const getDate = (t) => t.scheduled_date || t.date || '9999';
    const getTime = (t) => t.scheduled_time || t.time || '23:59';
    const da = getDate(a);
    const db = getDate(b);
    const aOrder = da === fmtToday ? 0 : da > fmtToday ? 1 : 2;
    const bOrder = db === fmtToday ? 0 : db > fmtToday ? 1 : 2;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (da !== db) return da.localeCompare(db);
    return getTime(a).localeCompare(getTime(b));
  };

  const inProgress = tasks
    .filter(t => t.status === 'В процесі' && !skipped.includes(t.id))
    .sort(sortByRelevance);
  let focus = inProgress[0] || null;

  if (!focus) {
    const urgent = tasks
      .filter(t => t.status === 'Терміново' && !skipped.includes(t.id))
      .sort(sortByRelevance);
    focus = urgent[0] || null;
  }
  if (!focus) {
    const fmtToday = [
      MOCK_TODAY.getFullYear(),
      String(MOCK_TODAY.getMonth() + 1).padStart(2, '0'),
      String(MOCK_TODAY.getDate()).padStart(2, '0')
    ].join('-');
    const upcoming = tasks.filter(t => (t.scheduled_date === fmtToday || (!t.scheduled_date && t.date === fmtToday)) && t.status !== 'Виконано');
    const skipped = ds.skippedIds || [];
    const filtered = upcoming.filter(t => !skipped.includes(t.id));
    if (filtered.length > 0) {
      focus = filtered[0];
    } else {
      ds.skippedIds = []; // скидаємо якщо більше нема куди скіпати
      focus = upcoming[0];
    }
  }
  return focus || { id: 'none', title: 'Немає активної задачі', category: 'NONE', complexity: 0, time: '—', duration: '—', status: 'Очікує' };
}

function renderUpcomingTasksHTML(focusId) {
  const tasks = taskStore.getAll();
  const fmtToday = getLocalDateKey();

  let upcoming = tasks.filter(t =>
    getTaskPlanDate(t) === fmtToday &&
    t.status !== 'Виконано' &&
    t.id !== focusId
  );

  upcoming.sort((a, b) => {
    const aDt = getTaskPlanDateTime(a);
    const bDt = getTaskPlanDateTime(b);

    if (aDt && bDt) return aDt - bDt;
    if (aDt && !bDt) return -1;
    if (!aDt && bDt) return 1;
    return 0;
  });

  upcoming = upcoming.slice(0, 4);

  if (upcoming.length === 0) {
    return `<div class="flex flex-col items-center justify-center py-6 text-center text-[#c7c4d8] border border-dashed border-white/10 rounded-xl bg-white/5"><span class="material-symbols-outlined text-3xl mb-2 opacity-50">free_cancellation</span><p class="text-[11px] font-bold">Немає більше задач на сьогодні</p></div>`;
  }

  return upcoming.map(t => {
    const c = CATEGORIES[t.category] || { color: '#c7c4d8', label: t.category };
    return `<div class="next-task-item bg-[#1b1a26] p-4 rounded-xl flex items-center justify-between hover:bg-[#292935] transition-colors group cursor-pointer w-full gap-3 overflow-hidden border border-white/5" data-task="${t.id}">
      <div class="flex items-center gap-4 flex-1 overflow-hidden">
        <div class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)] flex-shrink-0" style="background:${c.color}"></div>
        <div class="flex-1 overflow-hidden">
          <p class="text-sm font-semibold group-hover:text-[#c4c0ff] transition-colors truncate">${t.title}</p>
          <p class="text-[11px] font-mono text-[#c7c4d8] mt-0.5 uppercase truncate">${c.label}</p>
        </div>
      </div>
      <span class="text-xs font-mono text-[#c7c4d8] flex-shrink-0">${getTaskPlanTime(t)}</span>
    </div>`;
  }).join('');
}

function fmtTime(s)  { const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }
function fmtShort(s) { const h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }

export function renderDashboard() {
  const focusTask = getFocusTask();
  ds.curFocusId = focusTask.id;
  const cat = CATEGORIES[focusTask.category] || { label: focusTask.category, color: '#c7c4d8' };

  return `
<div class="grid xl:grid-cols-12 gap-8 items-start max-w-[1400px] mx-auto mb-12 px-6 overflow-hidden">
  
  <div class="flex flex-col space-y-6 overflow-hidden max-w-full xl:col-span-3 min-w-0">
    <section id="focus-section" class="glass-card glow-border-primary p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden max-w-full">
      <div class="flex justify-between items-center w-full mb-6 relative z-10">
        <h2 class="text-sm font-bold tracking-widest text-[#c4c0ff] uppercase truncate pr-4">⚡ Зараз у фокусі</h2>
        <button class="material-symbols-outlined text-[#4ddada] cursor-pointer p-1 -m-1 hover:text-white transition-colors flex-shrink-0" id="focus-more-btn">more_horiz</button>
        <div id="focus-dropdown" class="absolute right-0 top-8 bg-[#292935] border border-white/5 rounded-xl shadow-xl w-44 overflow-hidden hidden z-[100] text-left">
          <button id="dd-edit" class="w-full px-4 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 flex items-center gap-2"><span class="material-symbols-outlined text-[14px]">edit</span>Редагувати</button>
          <button id="dd-pause" class="w-full px-4 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 flex items-center gap-2"><span class="material-symbols-outlined text-[14px]">pause</span>Зупинити</button>
          <button id="dd-cancel" class="w-full px-4 py-3 text-xs font-bold text-[#f35c7b] hover:bg-[#f35c7b]/10 transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-[14px]">cancel</span>Відмінити</button>
        </div>
      </div>
      
      <div id="focus-full-view" class="w-full flex flex-col items-center overflow-hidden">
        <div class="relative w-48 h-48 mb-6 flex items-center justify-center flex-shrink-0">
          <svg class="w-full h-full -rotate-90"><circle class="text-[#343440]" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-width="8"></circle><circle class="text-[#c4c0ff]" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-dasharray="553" stroke-dashoffset="150" stroke-width="8" id="focus-progress"></circle></svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-3xl font-mono font-bold tracking-tighter" id="focus-timer">${fmtTime(ds.seconds)}</span>
            <span class="text-[10px] text-[#c7c4d8] font-mono uppercase mt-1" id="focus-status-label">залишилось</span>
          </div>
        </div>
        <h3 class="text-xl font-bold leading-tight mb-2 transition-colors truncate w-full px-2" id="focus-task-title">${focusTask.title}</h3>
        <div class="flex items-center gap-2 mb-6 max-w-full overflow-hidden justify-center"><span class="text-[11px] px-2 py-0.5 rounded-full border border-white/10 font-semibold tracking-wide uppercase truncate block max-w-full" id="focus-cat-label" style="background:${cat.color}15;color:${cat.color}">${cat.label}</span></div>
        <div class="w-full bg-[#343440] h-1.5 rounded-full mb-2 relative overflow-hidden"><div class="absolute top-0 left-0 h-full bg-[#c4c0ff] w-2/3 rounded-full"></div></div>
        <div class="flex justify-between w-full text-[10px] font-mono text-[#c7c4d8] mb-8"><span id="focus-time-label">${getTaskPlanTime(focusTask)}</span><span id="focus-dur-label">${focusTask.duration || '—'}</span></div>
      </div>
      
      <div id="focus-compact-view" class="hidden w-full overflow-hidden">
        <div class="flex items-center gap-3 justify-center py-3">
          <div class="w-12 h-12 rounded-full border-2 border-[#c4c0ff] flex items-center justify-center flex-shrink-0"><span class="text-sm font-mono font-bold" id="focus-timer-mini">${fmtShort(ds.seconds)}</span></div>
          <div class="text-left overflow-hidden"><p class="text-sm font-bold truncate max-w-[120px]" id="focus-title-mini">${focusTask.title}</p><p class="text-[10px] text-[#c7c4d8] font-mono" id="focus-status-mini">Таймер активний</p></div>
        </div>
      </div>
      
      <div id="focus-start-wrap" class="${ds.started ? 'hidden' : ''}  w-full">
        <button class="w-full flex items-center justify-center gap-2 bg-[#c4c0ff] text-[#2000a4] py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all" id="focus-start-btn">
          <span class="material-symbols-outlined text-[16px]">play_arrow</span>Почати задачу
        </button>
      </div>
      <div id="focus-action-wrap" class="${ds.started ? '' : 'hidden'} flex gap-3 w-full">
        <button class="flex-1 flex items-center justify-center gap-1.5 bg-[#c4c0ff] text-[#2000a4] py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all px-2 border border-transparent whitespace-nowrap" id="focus-done-btn"><span class="material-symbols-outlined text-[16px]">check_circle</span>Виконати</button>
        <button class="flex-[0.7] flex items-center justify-center gap-1.5 bg-[#292935] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#343440] active:scale-95 transition-all px-2 border border-white/5" id="focus-skip-btn">Скіп</button>
      </div>
    </section>

    <section class="flex flex-col border border-white/5 bg-[#0d0d18]/50 rounded-2xl p-5 overflow-hidden max-w-full">
      <h2 class="text-lg font-bold mb-4 flex items-center justify-between"><span class="truncate pr-2">Наступні задачі</span></h2>
      <div class="space-y-3 custom-scrollbar overflow-y-auto pr-2 w-full max-h-[400px]" id="upcoming-tasks-list">
        ${renderUpcomingTasksHTML(ds.curFocusId)}
      </div>
    </section>
  </div>

  <div class="flex flex-col h-[740px] bg-[#0d0d18] rounded-3xl overflow-hidden border border-[#464555]/10 shadow-2xl relative xl:col-span-6 min-w-0 w-full">
    <div id="cal-dashboard-header" class="px-6 py-5 flex items-center justify-between bg-[#1b1a26] border-b border-[#464555]/10 flex-shrink-0 overflow-hidden text-clip cursor-pointer hover:bg-[#201f2e] transition-colors">
      <div class="flex items-center justify-between w-full gap-4 overflow-hidden pointer-events-none">
        <div class="flex flex-1 items-center gap-3 min-w-0 pointer-events-auto">
          <div class="flex items-center gap-1.5 lg:gap-2 text-[#c7c4d8] flex-shrink-0 bg-[#0d0d18] px-2 py-1.5 rounded-xl border border-white/5">
            <button class="p-1 hover:text-white transition-colors flex-shrink-0 flex items-center justify-center" id="cal-prev"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
            <span class="text-[11px] sm:text-xs font-mono font-bold tracking-wider whitespace-nowrap px-3 text-center min-w-[160px] inline-block" id="cal-date-label">${calLabel()}</span>
            <button class="p-1 hover:text-white transition-colors flex-shrink-0 flex items-center justify-center" id="cal-next"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
        <div class="flex bg-[#0d0d18] rounded-xl p-1 border border-white/5 hidden md:flex flex-shrink-0 pointer-events-auto">
          <button class="cal-mode-btn ${ds.calMode === 'week' ? 'bg-[#343440] text-white shadow' : 'text-[#c7c4d8] hover:text-white'} px-4 py-1.5 rounded-lg text-[11px] uppercase font-bold transition-all" data-view="week">Тиждень</button>
          <button class="cal-mode-btn ${ds.calMode === 'month' ? 'bg-[#343440] text-white shadow' : 'text-[#c7c4d8] hover:text-white'} px-4 py-1.5 rounded-lg text-[11px] uppercase font-bold transition-all" data-view="month">Місяць</button>
        </div>
      </div>
    </div>
    <div id="calendar-body" class="flex-1 relative overflow-hidden w-full"></div>
  </div>

  <div class="flex flex-col space-y-6 overflow-hidden w-full max-w-[320px] ml-auto xl:col-span-3 min-w-0">
    <section class="flex flex-col border border-white/5 bg-[#0d0d18]/50 rounded-2xl p-5 overflow-hidden max-w-full">
      <div class="mb-5 flex flex-col gap-3">
        <h2 class="text-lg font-bold whitespace-normal break-words w-full">🎯 Пріоритети</h2>
        <div class="flex gap-2">
          <button class="pri-filter-btn px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${ds.priFilter === 'all' || !ds.priFilter ? 'bg-[#c4c0ff] text-[#2000a4]' : 'bg-[#1b1a26] text-[#c7c4d8] border border-white/10 hover:bg-[#292935]'}" data-filter="all">Всі</button>
          <button class="pri-filter-btn px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${ds.priFilter === 'today' ? 'bg-[#c4c0ff] text-[#2000a4]' : 'bg-[#1b1a26] text-[#c7c4d8] border border-white/10 hover:bg-[#292935]'}" data-filter="today">Сьогодні</button>
          <button class="pri-filter-btn px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${ds.priFilter === 'urgent' ? 'bg-[#c4c0ff] text-[#2000a4]' : 'bg-[#1b1a26] text-[#c7c4d8] border border-white/10 hover:bg-[#292935]'}" data-filter="urgent">Термінові</button>
        </div>
      </div>
      <div class="space-y-4 overflow-y-auto custom-scrollbar pr-2 w-full max-h-[400px]" id="pri-list">
        ${renderPrioritiesList(ds.priFilter || 'all')}
      </div>
    </section>
    <div class="overflow-hidden max-w-full w-full">
      ${renderAIInsight({ title: 'AI Підказка', message: 'Ваш ранковий пік продуктивності — найкращий час для завершення пріоритетних задач.', icon: 'auto_awesome' })}
    </div>
  </div>

</div>

<div id="drawer-overlay" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300"></div>
<div id="task-drawer" class="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-[#1b1a26] border-l border-white/5 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 overflow-y-auto">
  <div class="p-6 space-y-5">
    <div class="flex justify-between items-center"><h2 class="text-lg font-bold" id="drawer-title"></h2><button id="drawer-close" class="p-2 hover:bg-[#292935] rounded-lg"><span class="material-symbols-outlined text-[18px]">close</span></button></div>
    <div id="drawer-view-mode" class="space-y-5">
      <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1">Опис</span><p class="text-sm text-slate-300 leading-relaxed" id="drawer-desc"></p></div>
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1">Категорія</span><span id="drawer-cat" class="text-sm font-semibold"></span></div>
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Пріоритет</span><span id="drawer-pri" class="text-sm font-semibold"></span><p id="drawer-pri-reason" class="text-[10px] text-slate-500 mt-1 leading-relaxed hidden"></p></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1">Дата</span><span id="drawer-date" class="text-sm font-mono text-white"></span></div>
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1">Час</span><span id="drawer-time" class="text-sm font-mono text-white"></span></div>
      </div>
      <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1">Складність</span><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-[#343440] rounded-full overflow-hidden"><div class="h-full bg-[#c4c0ff] transition-all" id="drawer-cx-bar"></div></div><span id="drawer-cx-val" class="text-xs font-mono text-[#c4c0ff]"></span></div></div>
      <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-2 tracking-wider">Статус</span><div class="flex flex-wrap gap-2" id="drawer-status-group"></div></div>
      <div class="flex gap-3 pt-3 border-t border-white/5"><button id="drawer-edit-btn" class="flex-1 flex items-center justify-center gap-2 bg-[#292935] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#343440]"><span class="material-symbols-outlined text-sm">edit</span>Редагувати</button><button id="drawer-delete" class="p-3 bg-[#292935] text-[#f35c7b] rounded-xl hover:bg-[#f35c7b]/10"><span class="material-symbols-outlined text-sm">delete</span></button></div>
    </div>
    <div id="drawer-edit-mode" class="hidden">
       <div id="drawer-form-container"></div>
       <div class="flex gap-3 pt-6"><button id="drawer-save" class="flex-1 bg-[#c4c0ff] text-[#2000a4] py-3.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">Зберегти зміни</button><button id="drawer-cancel" class="flex-1 bg-[#292935] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#343440] transition-all">Скасувати</button></div>
    </div>
  </div>
</div>`;
}

export async function initDashboard() {
  const calPrevEl = document.getElementById('cal-prev');
  const calNextEl = document.getElementById('cal-next');
  console.log('cal-prev exists:', !!calPrevEl, 'cal-next exists:', !!calNextEl);
  
  // ── 1. DOM елементи ────────────────────────────────────────
  const timerEl    = document.getElementById('focus-timer');
  const timerMini  = document.getElementById('focus-timer-mini');
  const progressEl = document.getElementById('focus-progress');
  const titleEl    = document.getElementById('focus-task-title');
  const doneBtn    = document.getElementById('focus-done-btn');
  const skipBtn    = document.getElementById('focus-skip-btn');
  const dropdown   = document.getElementById('focus-dropdown');
  const calBody    = document.getElementById('calendar-body');
  const calLabelEl = document.getElementById('cal-date-label');
  const drawer     = document.getElementById('task-drawer');
  const overlay    = document.getElementById('drawer-overlay');

  let curTid = null, formInstance = null;

  // ── 2. Таймер ─────────────────────────────────────────────
  function tickTimer() {
    if (!ds.started || ds.paused || ds.stopped || ds.seconds <= 0) return;
    ds.seconds--;
    localStorage.setItem('focus-ds', JSON.stringify({
      seconds: ds.seconds,
      calMode: ds.calMode,
      priFilter: ds.priFilter,
      lastFocusId: ds.lastFocusId,
      started: ds.started,
    }));
    if (timerEl)   timerEl.textContent  = fmtTime(ds.seconds);
    if (timerMini) timerMini.textContent = fmtShort(ds.seconds);
    const offset = 553 - (553 * (1 - ds.seconds / 5040));
    if (progressEl) progressEl.setAttribute('stroke-dashoffset', String(Math.max(0, offset)));
  }
  ds.timerId = setInterval(tickTimer, 1000);
  if (progressEl) {
    const offset = 553 - (553 * (1 - ds.seconds / 5040));
    progressEl.setAttribute('stroke-dashoffset', String(Math.max(0, offset)));
  }
  registerCleanup(() => clearInterval(ds.timerId));

  // ── 3. Функція оновлення UI ────────────────────────────────
  const refreshDashboard = () => {
    const dashboardRoot = document.getElementById('focus-section');

    if (!dashboardRoot) {
      return;
    }
    const focusTask = getFocusTask();
    ds.curFocusId = focusTask.id;

    if (focusTask.id === 'none') {
      ds.seconds = 0;
      ds.started = false;
      ds.lastFocusId = 'none';
      if (timerEl) timerEl.textContent = '00:00:00';
      if (progressEl) progressEl.setAttribute('stroke-dashoffset', '553');
      document.getElementById('focus-start-wrap')?.classList.add('hidden');
      document.getElementById('focus-action-wrap')?.classList.add('hidden');
    } else if (ds.lastFocusId !== focusTask.id) {
      ds.lastFocusId = focusTask.id;
      ds.paused = false;
      ds.stopped = false;
      ds.started = false;
      const durStr = focusTask.duration || '1 год';
      if (durStr.includes('год')) {
        ds.seconds = Math.round((parseFloat(durStr) || 1) * 3600);
      } else if (durStr.includes('хв')) {
        ds.seconds = Math.round((parseFloat(durStr) || 30) * 60);
      } else {
        ds.seconds = 3600;
      }
      localStorage.setItem('focus-ds', JSON.stringify({
        seconds: ds.seconds,
        calMode: ds.calMode,
        priFilter: ds.priFilter,
        lastFocusId: ds.lastFocusId,
        started: false,
      }));
      if (timerEl) timerEl.textContent = fmtTime(ds.seconds);
      if (timerMini) timerMini.textContent = fmtShort(ds.seconds);
      const offset = 553 - (553 * (1 - ds.seconds / 5040));
      if (progressEl) progressEl.setAttribute('stroke-dashoffset', String(Math.max(0, offset)));
      document.getElementById('focus-start-wrap')?.classList.remove('hidden');
      document.getElementById('focus-action-wrap')?.classList.add('hidden');
    }

    if (titleEl) titleEl.textContent = focusTask.title;
    const titleMiniEl = document.getElementById('focus-title-mini');
    if (titleMiniEl) titleMiniEl.textContent = focusTask.title;

    const focusCatEl = document.getElementById('focus-cat-label');
    if (focusCatEl) {
      const c = CATEGORIES[focusTask.category] || { color: '#c7c4d8', label: focusTask.category || 'NONE' };
      focusCatEl.textContent = c.label;
      focusCatEl.style.background = `${c.color}15`;
      focusCatEl.style.color = c.color;
    }
    const focusTimeEl = document.getElementById('focus-time-label');
    if (focusTimeEl) focusTimeEl.textContent = getTaskPlanTime(focusTask);
    const focusDurEl = document.getElementById('focus-dur-label');
    if (focusDurEl) focusDurEl.textContent = focusTask.duration || '—';

    const upcomingList = document.getElementById('upcoming-tasks-list');
    if (upcomingList) upcomingList.innerHTML = renderUpcomingTasksHTML(ds.curFocusId);

    document.querySelectorAll('.cal-mode-btn').forEach(b => {
      b.className = `cal-mode-btn ${b.dataset.view === ds.calMode ? 'bg-[#343440] text-white shadow' : 'text-[#c7c4d8] hover:text-white'} px-4 py-1.5 rounded-lg text-[11px] uppercase font-bold transition-all`;
    });

    const wh = preferencesStore.getWorkHours();
    const workStart = parseInt(wh.start.split(':')[0]);
    const workEnd = parseInt(wh.end.split(':')[0]);
    if (calBody) calBody.innerHTML = renderCalendarView({
      anchorDate: ds.anchor,
      viewMode: ds.calMode,
      expanded: false,
      blockedSlots: blockedSlotsStore.getAll(),
      workStart,
      workEnd,
    });
    if (calLabelEl) calLabelEl.textContent = calLabel();

    const priList = document.getElementById('pri-list');
    if (priList) priList.innerHTML = renderPrioritiesList(ds.priFilter || 'all');

    bindEvents();
  };

  // ── 4. Прив'язка подій ─────────────────────────────────────
  const bindEvents = () => {
    console.log('bindEvents called, prevBtn:', !!document.getElementById('cal-prev'));
    initCalendarView(calBody, {
      onTaskClick: (id) => openDrawer(id),
      onDayClick:  (d)  => { ds.anchor = new Date(ds.anchor.getFullYear(), ds.anchor.getMonth(), d); ds.calMode = 'week'; refreshDashboard(); }
    });

    const headerEl = document.getElementById('cal-dashboard-header');
    if (headerEl) headerEl.onclick = (e) => { if (e.target.closest('button')) return; window.location.hash = '#/calendar'; };

    document.querySelectorAll('.cal-mode-btn').forEach(btn => btn.onclick = (e) => { ds.calMode = e.target.dataset.view; refreshDashboard(); });
    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    if (prevBtn) prevBtn.onclick = () => {
      if (ds.calMode === 'week') {
        ds.anchor.setDate(ds.anchor.getDate() - 7);
      } else {
        ds.anchor = new Date(ds.anchor.getFullYear(), ds.anchor.getMonth() - 1, 1);
      }
      refreshDashboard();
    };
    if (nextBtn) nextBtn.onclick = () => {
      if (ds.calMode === 'week') {
        ds.anchor.setDate(ds.anchor.getDate() + 7);
      } else {
        ds.anchor = new Date(ds.anchor.getFullYear(), ds.anchor.getMonth() + 1, 1);
      }
      refreshDashboard();
    };
    document.querySelectorAll('.pri-card[data-task], .next-task-item[data-task]').forEach(el => el.onclick = () => openDrawer(el.dataset.task));

    document.querySelectorAll('.pri-filter-btn').forEach(btn => {
      btn.onclick = () => {
        ds.priFilter = btn.dataset.filter;
        document.querySelectorAll('.pri-filter-btn').forEach(b => {
          b.className = b.dataset.filter === ds.priFilter
            ? 'pri-filter-btn px-3 py-1 rounded-full text-[11px] font-bold transition-colors bg-[#c4c0ff] text-[#2000a4]'
            : 'pri-filter-btn px-3 py-1 rounded-full text-[11px] font-bold transition-colors bg-[#1b1a26] text-[#c7c4d8] border border-white/10 hover:bg-[#292935]';
        });
        const priList = document.getElementById('pri-list');
        if (priList) {
          priList.innerHTML = renderPrioritiesList(ds.priFilter);
          priList.querySelectorAll('.pri-card[data-task]').forEach(el => el.onclick = () => openDrawer(el.dataset.task));
        }
      };
    });

    const moreBtn = document.getElementById('focus-more-btn');
    const startBtn = document.getElementById('focus-start-btn');
    if (startBtn) {
      startBtn.onclick = () => {
        ds.started = true;
        ds.paused = false;
        ds.stopped = false;
        document.getElementById('focus-start-wrap')?.classList.add('hidden');
        document.getElementById('focus-action-wrap')?.classList.remove('hidden');
        localStorage.setItem('focus-ds', JSON.stringify({
          seconds: ds.seconds, calMode: ds.calMode, priFilter: ds.priFilter,
          lastFocusId: ds.lastFocusId, started: true,
        }));
      };
    }
    if (moreBtn && dropdown) moreBtn.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); };
    if (!ds._dropdownListenerAdded) {
      ds._dropdownListenerAdded = true;
      document.addEventListener('click', (e) => { if (dropdown && !dropdown.contains(e.target)) dropdown.classList.add('hidden'); });
    }

    const ddEdit = document.getElementById('dd-edit');
    const ddPause = document.getElementById('dd-pause');
    const ddCancel = document.getElementById('dd-cancel');

    if (ddEdit) {
      ddEdit.onclick = () => {
        dropdown.classList.add('hidden');
        openDrawer(ds.curFocusId, true);
      };
    }

    if (ddPause) {
      ddPause.onclick = () => {
        ds.paused = !ds.paused;
        toast(ds.paused ? 'Таймер зупинено' : 'Таймер відновлено');
        dropdown.classList.add('hidden');
      };
    }

    if (ddCancel) {
      ddCancel.onclick = () => {
        ds.stopped = true;
        ds.started = false;
        // не скидаємо lastFocusId — задача залишається та сама
        // але повертаємо її таймер на початок
        const durStr = taskStore.getById(ds.curFocusId)?.duration || '1 год';
        if (durStr.includes('год')) {
          ds.seconds = Math.round((parseFloat(durStr) || 1) * 3600);
        } else if (durStr.includes('хв')) {
          ds.seconds = Math.round((parseFloat(durStr) || 30) * 60);
        } else {
          ds.seconds = 3600;
        }
        if (timerEl) timerEl.textContent = fmtTime(ds.seconds);
        if (progressEl) {
          const offset = 553 - (553 * (1 - ds.seconds / 5040));
          progressEl.setAttribute('stroke-dashoffset', String(Math.max(0, offset)));
        }
        document.getElementById('focus-start-wrap')?.classList.remove('hidden');
        document.getElementById('focus-action-wrap')?.classList.add('hidden');
        localStorage.setItem('focus-ds', JSON.stringify({
          seconds: ds.seconds,
          calMode: ds.calMode,
          priFilter: ds.priFilter,
          lastFocusId: ds.lastFocusId,
          started: false,
        }));
        toast('Фокус скасовано');
        dropdown.classList.add('hidden');
      };
    }
    if (doneBtn) doneBtn.onclick = async () => {
  if (!ds.curFocusId || ds.curFocusId === 'none') {
    toast('Немає активної задачі', 'info');
    return;
  }

  ds.stopped = true;
  await taskStore.updateTask(ds.curFocusId, { status: 'Виконано' });
  toast('Виконано 🎉', 'success');
  refreshDashboard();
};
    if (skipBtn) skipBtn.onclick = () => {
      if (!ds.skippedIds) ds.skippedIds = [];
      ds.skippedIds.push(ds.curFocusId);
      ds.stopped = true;
      ds.started = false;
      ds.lastFocusId = null;
      localStorage.setItem('focus-ds', JSON.stringify({
        seconds: ds.seconds,
        calMode: ds.calMode,
        priFilter: ds.priFilter,
        lastFocusId: null,
        started: false,
      }));
      toast('Пропущено');
      // перевіряємо чи є наступна задача
      const next = getFocusTask();
      if (next.id === 'none' || ds.skippedIds.includes(next.id)) {
        // більше нема — очищуємо повністю
        ds.seconds = 0;
        ds.lastFocusId = 'none';
        if (timerEl) timerEl.textContent = '00:00:00';
        if (progressEl) progressEl.setAttribute('stroke-dashoffset', '553');
        document.getElementById('focus-start-wrap')?.classList.add('hidden');
        document.getElementById('focus-action-wrap')?.classList.add('hidden');
        if (titleEl) titleEl.textContent = 'Немає активних задач';
        const catEl = document.getElementById('focus-cat-label');
        if (catEl) { catEl.textContent = ''; catEl.style.background = 'transparent'; }
      }
      refreshDashboard();
    };
  };

  // ── 5. Drawer (деталі задачі) ──────────────────────────────
  const openDrawer = (id, edit = false) => {
    curTid = id;
    const t = taskStore.getById(id);
    if (!t) return;

    document.getElementById('drawer-title').textContent = t.title;
    document.getElementById('drawer-desc').textContent  = t.description || 'Опис відсутній';
    const cat = CATEGORIES[t.category] || { label: t.category, color: '#c4c0ff' };
    document.getElementById('drawer-cat').textContent = cat.label;
    document.getElementById('drawer-cat').style.color = cat.color;
    document.getElementById('drawer-pri').textContent = t.priority;
    document.getElementById('drawer-date').textContent = t.date;
    document.getElementById('drawer-time').textContent = t.time;
    document.getElementById('drawer-cx-bar').style.width = `${t.complexity * 10}%`;
    document.getElementById('drawer-cx-val').textContent = `${t.complexity}/10`;

    const priReasonEl = document.getElementById('drawer-pri-reason');
    if (priReasonEl) {
      priReasonEl.textContent = t.priority_reason || '';
      priReasonEl.classList.toggle('hidden', !t.priority_reason);
    }

    const sg = document.getElementById('drawer-status-group');
    const ss = ['Очікує', 'В процесі', 'Виконано', 'Терміново'];
    const sc = { 'В процесі': 'bg-[#c4c0ff]/20 text-[#c4c0ff]', 'Очікує': 'bg-[#343440] text-slate-400', 'Виконано': 'bg-[#4ddada]/20 text-[#4ddada]', 'Терміново': 'bg-[#93000a]/30 text-[#ffb4ab]' };
    sg.innerHTML = ss.map(s => `<button class="drawer-status-btn px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${s === t.status ? sc[s] : 'bg-[#1b1a26] text-slate-500'}" data-status="${s}">${s}</button>`).join('');
    sg.querySelectorAll('.drawer-status-btn').forEach(b => b.onclick = async () => {
      await taskStore.updateTask(id, { status: b.dataset.status });
      openDrawer(id);
    });

    document.getElementById('drawer-view-mode').classList.toggle('hidden', edit);
    document.getElementById('drawer-edit-mode').classList.toggle('hidden', !edit);
    if (edit) {
      document.getElementById('drawer-form-container').innerHTML = renderTaskForm(t);
      formInstance = initTaskForm(document.getElementById('drawer-form-container'), t, document.getElementById('drawer-save'));
    }
    initTaskAIActions('dash-drawer', id, () => {openDrawer(id); });
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.remove('opacity-0'), 10);
  };

  const closeDrawer = () => {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  };

  document.getElementById('drawer-close').onclick   = closeDrawer;
  overlay.onclick                                    = closeDrawer;
  document.getElementById('drawer-edit-btn').onclick = () => openDrawer(curTid, true);
  document.getElementById('drawer-cancel').onclick   = () => openDrawer(curTid, false);

  document.getElementById('drawer-save').onclick = async () => {
    if (formInstance.isValid()) {
      await taskStore.updateTask(curTid, formInstance.getData());
      openDrawer(curTid, false);
      toast('Збережено');
    }
  };

  document.getElementById('drawer-delete').onclick = async () => {
    await taskStore.deleteTask(curTid);
    closeDrawer();
    toast('Видалено');
  };

  // ── 6. Підписуємось на оновлення ПЕРЕД завантаженням ───────
  window.addEventListener('task-store-update', refreshDashboard);

  registerCleanup(() => {
    window.removeEventListener('task-store-update', refreshDashboard);
  });

  // ── 7. Завантажуємо задачі з API ───────────────────────────
  try {
    await Promise.all([taskStore.loadFromAPI(), blockedSlotsStore.load()]);
    refreshDashboard();
  } catch (err) {
    console.error('Не вдалося завантажити задачі:', err);
    toast('Не вдалося завантажити задачі', 'error');
    refreshDashboard(); // показуємо порожній стан
  }
}