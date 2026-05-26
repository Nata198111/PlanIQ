import { taskStore, CATEGORIES } from '../services/task-store.js';

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const HOURS_LIST = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

function getLocalDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeTaskDate(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      const [day, month, year] = value.split('.');
      return `${year}-${month}-${day}`;
    }
  }

  return getLocalDateKey(value);
}

function getTaskDisplayDate(task) {
  return normalizeTaskDate(task.scheduled_date || task.date);
}

function getTaskDisplayTime(task) {
  return task.scheduled_time || task.time || '09:00';
}

function isTaskScheduled(task) {
  return Boolean(task.scheduled_date && task.scheduled_time);
}

function getCalendarTasks() {
  const tasks = taskStore.getAll();

  const parentIdsWithSubtasks = new Set(
    tasks
      .map(task => task.parent_task_id)
      .filter(Boolean)
  );

  return tasks.filter(task => !parentIdsWithSubtasks.has(task.id));
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function renderCalendarView(options = {}) {
  const { expanded = false, anchorDate = new Date(), viewMode = 'week' } = options;

  const gridMinHeight = expanded ? 'min-h-[1200px]' : 'min-h-[840px]';
  const hourHeight = expanded ? 80 : 60;

  if (viewMode === 'week') {
    return renderWeekGrid(anchorDate, hourHeight, gridMinHeight);
  }

  return renderMonthGrid(anchorDate, expanded);
}

function renderWeekGrid(anchor, hHeight, minH) {
  const startOfWeek = new Date(anchor);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);

  startOfWeek.setDate(diff);

  let headerHtml = '<div class="h-12"></div>';

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(currentDate.getDate() + i);

    const isToday = sameDay(currentDate, new Date());

    headerHtml += isToday
      ? `<div class="h-12 flex items-center justify-center flex-col bg-[#c4c0ff]/5 border-x border-white/5">
          <span class="text-[10px] text-[#c4c0ff] font-bold uppercase">${DAYS_SHORT[i]}</span>
          <span class="text-xs font-mono text-[#c4c0ff] font-bold underline">${currentDate.getDate()}</span>
        </div>`
      : `<div class="h-12 flex items-center justify-center flex-col">
          <span class="text-[10px] text-[#c7c4d8] font-bold uppercase">${DAYS_SHORT[i]}</span>
          <span class="text-xs font-mono">${currentDate.getDate()}</span>
        </div>`;
  }

  const tasks = getCalendarTasks();

  let timeColumnHtml =
    `<div class="border-r border-[#464555]/10 text-[9px] font-mono text-[#c7c4d8]/60 flex flex-col justify-between py-2 text-right pr-2">`;

  HOURS_LIST.forEach(hour => {
    timeColumnHtml += `<div style="height:${hHeight}px">${hour}</div>`;
  });

  timeColumnHtml += '</div>';

  let columnsHtml = '';

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(currentDate.getDate() + i);

    const currentDateKey = getLocalDateKey(currentDate);
    const isToday = sameDay(currentDate, new Date());

    const dayTasks = tasks.filter(task => {
      return getTaskDisplayDate(task) === currentDateKey;
    });

    let blocksHtml = '';

    dayTasks.forEach(task => {
      const startStr = getTaskDisplayTime(task);
      const [hours, minutes] = startStr.split(':').map(Number);

      const safeHours = Number.isFinite(hours) ? hours : 9;
      const safeMinutes = Number.isFinite(minutes) ? minutes : 0;

      const startHour = safeHours + safeMinutes / 60;
      const top = Math.max(0, (startHour - 8) * hHeight);

      let durationHours = 1;

      if (task.duration?.includes('год')) {
        durationHours = parseFloat(task.duration) || 1;
      } else if (task.duration?.includes('хв')) {
        durationHours = (parseFloat(task.duration) || 30) / 60;
      }

      const height = Math.max(30, durationHours * hHeight);
      const category = CATEGORIES[task.category] || { color: '#c4c0ff' };

      blocksHtml += `
        <div class="cal-event absolute left-1 right-1 rounded-xl p-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group border-l-4 shadow-xl overflow-hidden"
             style="top:${top}px;height:${height}px;background:${category.color}20;border-left-color:${category.color};"
             data-task="${task.id}">
          <p class="text-[10px] font-bold leading-tight text-white group-hover:text-[#c4c0ff] transition-colors truncate">${task.title}</p>
          ${height > 40 ? `<p class="text-[8px] font-mono text-[#c7c4d8] mt-1 truncate">${startStr}${isTaskScheduled(task) ? ' · план' : ' · дедлайн'}</p>` : ''}
        </div>`;
    });

    const border = i < 6 ? ' border-r border-[#464555]/10' : '';

    columnsHtml += `<div class="relative ${border} ${isToday ? 'bg-[#c4c0ff]/5' : ''}">
      ${blocksHtml}
    </div>`;
  }

  const now = new Date();
  const weekEnd = new Date(startOfWeek);
  weekEnd.setDate(startOfWeek.getDate() + 6);

  const showNow = now >= startOfWeek && now <= weekEnd;
  const nowTop = ((now.getHours() + now.getMinutes() / 60) - 8) * hHeight;

  const nowLine = showNow
    ? `<div class="absolute w-full left-0 z-40 flex items-center pointer-events-none" style="top:${nowTop}px">
        <div class="w-full border-t-2 border-error/50 relative">
          <div class="absolute -top-1.5 -left-1 w-3 h-3 bg-error rounded-full shadow-[0_0_12px_rgba(255,180,171,0.6)]"></div>
        </div>
      </div>`
    : '';

  return `
    <div class="h-full flex flex-col">
      <div class="grid grid-cols-[44px_repeat(7,1fr)] border-b border-white/5">
        ${headerHtml}
      </div>

      <div class="flex-1 relative overflow-y-auto custom-scrollbar bg-[#0d0d18]/50">
        ${nowLine}
        <div class="grid grid-cols-[44px_repeat(7,1fr)] relative ${minH}">
          ${timeColumnHtml}
          ${columnsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderMonthGrid(anchor, expanded) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  let firstDay = new Date(year, month, 1).getDay();

  if (firstDay === 0) firstDay = 7;
  firstDay--;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tasks = getCalendarTasks();

  let html = `
    <div class="${expanded ? 'p-8' : 'p-4'} h-full flex flex-col">
      <div class="grid grid-cols-7 gap-2 mb-4">
        ${DAYS_SHORT.map(dayName => `<div class="text-center text-[10px] font-bold text-slate-500 uppercase py-2 tracking-widest">${dayName}</div>`).join('')}
      </div>

      <div class="grid grid-cols-7 gap-2 flex-1">
  `;

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="rounded-2xl border border-white/5 bg-[#1b1a26]/20"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const currentDateKey = getLocalDateKey(currentDate);
    const isToday = sameDay(currentDate, new Date());

    const dayTasks = tasks.filter(task => {
      return getTaskDisplayDate(task) === currentDateKey;
    });

    const bg = isToday
      ? 'bg-[#c4c0ff]/10 border-[#c4c0ff]/30'
      : 'bg-[#1b1a26]/50 hover:bg-[#1b1a26] border-white/5';

    html += `
      <div class="cal-month-day rounded-2xl border ${bg} ${expanded ? 'p-4' : 'p-2'} cursor-pointer transition-all flex flex-col group min-h-[80px]" data-day="${day}">
        <span class="text-xs font-mono ${isToday ? 'text-[#c4c0ff] font-bold' : 'text-slate-500 group-hover:text-white'}">${day}</span>

        <div class="flex flex-wrap gap-1 mt-auto">
          ${dayTasks.map(task => {
            const category = CATEGORIES[task.category] || { color: '#c4c0ff' };
            return `<div class="w-1.5 h-1.5 rounded-full shadow-sm" style="background:${category.color}"></div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  html += `</div></div>`;

  return html;
}

export function initCalendarView(container, options = {}) {
  const { onTaskClick, onDayClick } = options;

  container.addEventListener('click', (event) => {
    const eventEl = event.target.closest('.cal-event');

    if (eventEl && onTaskClick) {
      onTaskClick(eventEl.dataset.task);
      return;
    }

    const dayEl = event.target.closest('.cal-month-day');

    if (dayEl && onDayClick) {
      onDayClick(parseInt(dayEl.dataset.day, 10));
    }
  });
}