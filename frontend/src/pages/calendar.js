import { taskStore, CATEGORIES } from '../services/task-store.js';
import { renderTaskAIActions, initTaskAIActions } from '../components/task-ai-actions.js';
import { toast } from '../services/toast.js';
import { renderTaskForm, initTaskForm } from '../components/task-form.js';
import { renderCalendarView, initCalendarView } from '../components/calendar-view.js';

const MONTHS_UA = [ 'СІЧЕНЬ', 'ЛЮТИЙ', 'БЕРЕЗЕНЬ', 'КВІТЕНЬ', 'ТРАВЕНЬ', 'ЧЕРВЕНЬ', 'ЛИПЕНЬ', 'СЕРПЕНЬ', 'ВЕРЕСЕНЬ', 'ЖОВТЕНЬ', 'ЛИСТОПАД', 'ГРУДЕНЬ',];

let cs = {
  anchor: new Date(),
  viewMode: 'week',
};

function getStartOfWeek(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return start;
}

function calLabel() {
  const sh = (full) => full.charAt(0).toUpperCase() + full.slice(1, 3).toLowerCase();

  if (cs.viewMode === 'week') {
    const start = getStartOfWeek(cs.anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const m1 = sh(MONTHS_UA[start.getMonth()]);
    const m2 = sh(MONTHS_UA[end.getMonth()]);

    return m1 === m2
      ? `${m1} ${start.getDate()}–${end.getDate()}`
      : `${start.getDate()} ${m1} – ${end.getDate()} ${m2}`;
  }

  return `${sh(MONTHS_UA[cs.anchor.getMonth()])} ${cs.anchor.getFullYear()}`;
}

export function renderCalendar() {
  return `
<div class="h-full max-w-[1600px] mx-auto px-8 py-6 flex flex-col relative overflow-hidden">
  <div class="flex-1 flex flex-col bg-[#0d0d18] rounded-3xl overflow-hidden border border-[#464555]/10 shadow-2xl">
    <div class="p-8 flex items-center justify-between bg-[#1b1a26]">
      <div class="flex items-center gap-6">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <span class="material-symbols-outlined text-[#c4c0ff] text-3xl">calendar_month</span>
          План
        </h2>

        <div class="flex items-center gap-3 text-[#c7c4d8] bg-[#0d0d18] px-4 py-2 rounded-xl border border-white/5 flex-shrink-0">
          <button class="p-1 hover:text-white transition-colors flex-shrink-0" id="cal-prev">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <span class="text-xs font-mono font-bold tracking-wider min-w-[200px] px-2 whitespace-nowrap text-center" id="cal-date-label">${calLabel()}</span>

          <button class="p-1 hover:text-white transition-colors flex-shrink-0" id="cal-next">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <div class="flex gap-2 p-1 bg-[#0d0d18] rounded-xl border border-white/5">
        <button id="toggle-week" class="cal-view-btn px-6 py-2 rounded-lg text-xs font-bold transition-all outline-none ${
          cs.viewMode === 'week'
            ? 'bg-[#343440] text-white shadow-lg'
            : 'text-slate-500 hover:text-slate-300'
        }">Тиждень</button>

        <button id="toggle-month" class="cal-view-btn px-6 py-2 rounded-lg text-xs font-bold transition-all outline-none ${
          cs.viewMode === 'month'
            ? 'bg-[#343440] text-white shadow-lg'
            : 'text-slate-500 hover:text-slate-300'
        }">Місяць</button>
      </div>
    </div>

    <div id="calendar-main-body" class="flex-1 overflow-hidden relative">
      ${renderCalendarView({ anchorDate: cs.anchor, viewMode: cs.viewMode, expanded: true })}
    </div>
  </div>

  <div id="calendar-drawer-overlay" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300"></div>

  <div id="calendar-task-drawer" class="fixed top-0 right-0 h-full w-[450px] max-w-[90vw] bg-[#1b1a26] border-l border-white/5 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 overflow-y-auto">
    <div class="p-8 space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold" id="cal-drawer-title">Деталі задачі</h2>

        <button id="cal-drawer-close" class="p-2 hover:bg-[#292935] rounded-xl transition-colors">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div id="cal-drawer-view-mode" class="space-y-6">
        <div>
          <span class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-[0.2em]">Опис</span>
          <p class="text-sm text-slate-300 leading-relaxed" id="cal-drawer-desc"></p>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <span class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-[0.2em]">Категорія</span>
            <span id="cal-drawer-cat" class="text-sm font-semibold"></span>
          </div>

          <div>
            <span class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-[0.2em]">Пріоритет</span>
            <span id="cal-drawer-pri" class="text-sm font-semibold"></span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <span class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-[0.2em]">Дата</span>
            <span id="cal-drawer-date" class="text-sm font-mono text-white"></span>
          </div>

          <div>
            <span class="text-[10px] font-bold text-slate-500 uppercase block mb-2 tracking-[0.2em]">Час</span>
            <span id="cal-drawer-time" class="text-sm font-mono text-white"></span>
          </div>
        </div>

        <div>
          <span class="text-[10px] font-bold text-slate-500 uppercase block mb-3 tracking-[0.2em]">Складність</span>

          <div class="flex items-center gap-4">
            <div class="flex-1 h-2.5 bg-[#343440] rounded-full overflow-hidden">
              <div class="h-full bg-[#c4c0ff] transition-all duration-500 shadow-[0_0_8px_#c4c0ff40]" id="cal-drawer-cx-bar"></div>
            </div>

            <span id="cal-drawer-cx-val" class="text-sm font-mono font-bold text-[#c4c0ff]"></span>
          </div>
        </div>

        <div>
          <span class="text-[10px] font-bold text-slate-500 uppercase block mb-3 tracking-[0.2em]">Статус</span>
          <div class="flex flex-wrap gap-2" id="cal-drawer-status-group"></div>
        </div>

        ${renderTaskAIActions('cal-drawer')}

        <div class="flex gap-4 pt-6 border-t border-white/5">
          <button id="cal-drawer-edit-btn" class="flex-1 flex items-center justify-center gap-3 bg-[#292935] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#343440] active:scale-95 transition-all">
            <span class="material-symbols-outlined text-sm">edit</span>Редагувати
          </button>

          <button id="cal-drawer-delete" class="p-4 bg-[#292935] text-[#f35c7b] rounded-2xl hover:bg-[#f35c7b]/10 active:scale-95 transition-all">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      <div id="cal-drawer-edit-mode" class="hidden">
        <div id="cal-drawer-form-container"></div>

        <div class="flex gap-4 pt-8">
          <button id="cal-drawer-save" class="flex-1 bg-[#c4c0ff] text-[#2000a4] py-4 rounded-2xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">Зберегти</button>
          <button id="cal-drawer-cancel" class="flex-1 bg-[#292935] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#343440] transition-all">Скасувати</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

export async function initCalendar() {
  const calBody = document.getElementById('calendar-main-body');
  const calLabelEl = document.getElementById('cal-date-label');
  const drawer = document.getElementById('calendar-task-drawer');
  const overlay = document.getElementById('calendar-drawer-overlay');

  let curTid = null;
  let formInstance = null;

  const updateViewButtons = () => {
    const weekBtn = document.getElementById('toggle-week');
    const monthBtn = document.getElementById('toggle-month');

    if (!weekBtn || !monthBtn) return;

    if (cs.viewMode === 'week') {
      weekBtn.className =
        'cal-view-btn px-6 py-2 rounded-lg text-xs font-bold transition-all outline-none bg-[#343440] text-white shadow-lg';

      monthBtn.className =
        'cal-view-btn px-6 py-2 rounded-lg text-xs font-bold transition-all outline-none text-slate-500 hover:text-slate-300';
    } else {
      monthBtn.className =
        'cal-view-btn px-6 py-2 rounded-lg text-xs font-bold transition-all outline-none bg-[#343440] text-white shadow-lg';

      weekBtn.className =
        'cal-view-btn px-6 py-2 rounded-lg text-xs font-bold transition-all outline-none text-slate-500 hover:text-slate-300';
    }
  };

  const refreshCalendar = () => {
    if (!calBody) return;

    calBody.innerHTML = renderCalendarView({
      anchorDate: cs.anchor,
      viewMode: cs.viewMode,
      expanded: true,
    });

    if (calLabelEl) {
      calLabelEl.textContent = calLabel();
    }

    updateViewButtons();
    bindEvents();
  };

  const closeDrawer = () => {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');

    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300);
  };

  const openDrawer = (id, edit = false) => {
    curTid = id;

    const task = taskStore.getById(id);
    if (!task) return;

    document.getElementById('cal-drawer-title').textContent = task.title;
    document.getElementById('cal-drawer-desc').textContent = task.description || 'Опис відсутній';

    const category = CATEGORIES[task.category] || {
      label: task.category,
      color: '#c4c0ff',
    };

    document.getElementById('cal-drawer-cat').textContent = category.label;
    document.getElementById('cal-drawer-cat').style.color = category.color;

    document.getElementById('cal-drawer-pri').textContent = task.priority || '—';
    document.getElementById('cal-drawer-date').textContent = task.scheduled_date ? `План: ${task.scheduled_date} · Дедлайн: ${task.date || '—'}` : task.date || '—';
    document.getElementById('cal-drawer-time').textContent = task.scheduled_time ? `План: ${task.scheduled_time} · Дедлайн: ${task.time || '—'}` : task.time || '—';

    document.getElementById('cal-drawer-cx-bar').style.width = `${(task.complexity || 0) * 10}%`;
    document.getElementById('cal-drawer-cx-val').textContent = `${task.complexity || 0}/10`;

    const statusGroup = document.getElementById('cal-drawer-status-group');
    const statuses = ['Очікує', 'В процесі', 'Виконано', 'Терміново'];

    const statusClasses = {
      'В процесі': 'bg-[#c4c0ff]/20 text-[#c4c0ff]',
      'Очікує': 'bg-[#343440] text-slate-400',
      'Виконано': 'bg-[#4ddada]/20 text-[#4ddada]',
      'Терміново': 'bg-[#93000a]/30 text-[#ffb4ab]',
    };

    statusGroup.innerHTML = statuses
      .map((status) => {
        const activeClass =
          status === task.status
            ? statusClasses[status]
            : 'bg-[#1b1a26] text-slate-500';

        return `<button class="cal-drawer-status-btn px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${activeClass}" data-status="${status}">${status}</button>`;
      })
      .join('');

    statusGroup.querySelectorAll('.cal-drawer-status-btn').forEach((button) => {
      button.onclick = async () => {
        try {
          await taskStore.updateTask(id, { status: button.dataset.status });
          openDrawer(id, false);
          refreshCalendar();
          toast('Статус оновлено', 'success');
        } catch (err) {
          console.error('Не вдалося оновити статус:', err);
          toast('Не вдалося оновити статус', 'error');
        }
      };
    });

    document.getElementById('cal-drawer-view-mode').classList.toggle('hidden', edit);
    document.getElementById('cal-drawer-edit-mode').classList.toggle('hidden', !edit);

    if (edit) {
      document.getElementById('cal-drawer-form-container').innerHTML = renderTaskForm(task);

      formInstance = initTaskForm(
        document.getElementById('cal-drawer-form-container'),
        task,
        document.getElementById('cal-drawer-save')
      );
    }

    initTaskAIActions('cal-drawer', curTid, () => refreshCalendar());

    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');

    setTimeout(() => {
      overlay.classList.remove('opacity-0');
    }, 10);
  };

  const bindEvents = () => {
    if (calBody && calBody.dataset.calendarViewBound !== 'true') {
      initCalendarView(calBody, {
        onTaskClick: (id) => openDrawer(id),
        onDayClick: (day) => {
          cs.anchor = new Date(cs.anchor.getFullYear(), cs.anchor.getMonth(), day);
          cs.viewMode = 'week';
          refreshCalendar();
          toast('Перехід до тижневого перегляду', 'info');
        },
      });

      calBody.dataset.calendarViewBound = 'true';
    }

    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    const weekBtn = document.getElementById('toggle-week');
    const monthBtn = document.getElementById('toggle-month');

    if (prevBtn) {
      prevBtn.onclick = () => {
        cs.anchor.setDate(cs.anchor.getDate() - (cs.viewMode === 'week' ? 7 : 30));
        refreshCalendar();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        cs.anchor.setDate(cs.anchor.getDate() + (cs.viewMode === 'week' ? 7 : 30));
        refreshCalendar();
      };
    }

    if (weekBtn) {
      weekBtn.onclick = () => {
        cs.viewMode = 'week';
        refreshCalendar();
      };
    }

    if (monthBtn) {
      monthBtn.onclick = () => {
        cs.viewMode = 'month';
        refreshCalendar();
      };
    }
  };

  document.getElementById('cal-drawer-close').onclick = closeDrawer;
  overlay.onclick = closeDrawer;

  document.getElementById('cal-drawer-edit-btn').onclick = () => {
    if (!curTid) return;
    openDrawer(curTid, true);
  };

  document.getElementById('cal-drawer-cancel').onclick = () => {
    if (!curTid) return;
    openDrawer(curTid, false);
  };

  document.getElementById('cal-drawer-save').onclick = async () => {
    if (!curTid || !formInstance) return;

    if (formInstance.isValid()) {
      try {
        await taskStore.updateTask(curTid, formInstance.getData());
        openDrawer(curTid, false);
        refreshCalendar();
        toast('Зміни збережено', 'success');
      } catch (err) {
        console.error('Не вдалося зберегти зміни:', err);
        toast('Не вдалося зберегти зміни', 'error');
      }
    }
  };

  document.getElementById('cal-drawer-delete').onclick = async () => {
    if (!curTid) return;

    try {
      await taskStore.deleteTask(curTid);
      closeDrawer();
      refreshCalendar();
      toast('Задачу видалено', 'success');
    } catch (err) {
      console.error('Не вдалося видалити задачу:', err);
      toast('Не вдалося видалити задачу', 'error');
    }
  };

  window.addEventListener('task-store-update', refreshCalendar);

  refreshCalendar();

  try {
    await taskStore.loadFromAPI();
    refreshCalendar();
  } catch (err) {
    console.error('Не вдалося завантажити задачі:', err);
    toast('Не вдалося завантажити задачі', 'error');
    refreshCalendar();
  }
}