// frontend/src/components/task-form.js
import { taskStore } from '../services/task-store.js';

function getLocalDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function renderTaskForm(task = null) {
  const isEdit = !!task;
  const categories = taskStore.getCategories();
  const priorities = ['Low', 'Mid', 'High'];
  const statuses = ['Очікує', 'В процесі', 'Виконано', 'Терміново'];

  return `
    <style>
      .custom-dropdown-menu {
        animation: slideDown 0.2s ease-out;
        transform-origin: top;
      }
      @keyframes slideDown {
        from { opacity: 0; transform: scaleY(0.95); }
        to { opacity: 1; transform: scaleY(1); }
      }
      .form-chip.active {
        background: rgba(196, 192, 255, 0.2);
        color: #c4c0ff;
        border-color: rgba(196, 192, 255, 0.3);
      }
      .form-chip.priority-active {
        background: rgba(255, 180, 171, 0.2);
        color: #ffb4ab;
        border-color: rgba(255, 180, 171, 0.3);
      }
      .submit-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        filter: grayscale(0.5);
      }
      input[type="date"]::-webkit-calendar-picker-indicator,
      input[type="time"]::-webkit-calendar-picker-indicator {
        display: none !important;
        -webkit-appearance: none;
      }
    </style>
    <div class="task-form space-y-6" id="unified-task-form">
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Назва задачі</label>
        <input type="text" id="form-title" value="${task?.title || ''}"
           class="w-full bg-[#1b1a26] border border-white/5 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-[#c4c0ff]/30 outline-none transition-all placeholder:text-slate-600"
           placeholder="Що потрібно зробити?" />
      </div>

      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Опис</label>
        <textarea id="form-desc" rows="2"
           class="w-full bg-[#1b1a26] border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#c4c0ff]/30 outline-none transition-all resize-none placeholder:text-slate-600"
          placeholder="Деталі (необов'язково)...">${task?.description || ''}</textarea>
      </div>

      <div class="space-y-3">
        <label class="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Категорія</label>
        <div class="flex flex-wrap gap-2" id="form-category-group">
          ${Object.keys(categories).map(catId => `
            <button type="button" class="form-chip px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-transparent
               ${task?.category === catId ? 'active' : 'bg-[#1b1a26] text-slate-500 hover:text-slate-300'}"
               data-val="${catId}">${categories[catId].label}</button>
          `).join('')}
          <button type="button" id="add-cat-btn" class="w-8 h-8 rounded-lg bg-[#1b1a26] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:border-[#c4c0ff]/30 transition-all">
            <span class="material-symbols-outlined text-sm">add</span>
          </button>
          <div id="new-cat-inline" class="hidden items-center gap-2">
            <input type="text" id="new-cat-input" class="bg-[#1b1a26] border border-[#c4c0ff]/30 rounded-lg px-2 py-1 text-[10px] text-white outline-none w-24" placeholder="Назва..." />
            <button type="button" id="new-cat-save" class="text-[#c4c0ff] hover:text-white transition-colors"><span class="material-symbols-outlined text-sm">check</span></button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-wider">Пріоритет</label>
          <div class="flex gap-2" id="form-priority-group">
            ${priorities.map(p => `
              <button type="button" class="form-chip flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-transparent
                ${(task?.priority || 'Mid') === p ? 'priority-active' : 'bg-[#1b1a26] text-slate-500 hover:text-slate-300'}"
                 data-val="${p}">${p}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase mb-3 block tracking-wider">Статус</label>
          <div class="relative custom-dropdown" id="status-dropdown-cont">
            <button type="button" id="status-dropdown-trigger" class="w-full flex items-center justify-between bg-[#1b1a26] border border-white/5 rounded-xl py-3 px-4 text-xs text-white hover:bg-[#292935] transition-all">
              <span id="trigger-label">${task?.status || 'Очікує'}</span>
              <span class="material-symbols-outlined text-slate-500 text-sm">expand_more</span>
            </button>
            <div id="status-dropdown-menu" class="hidden absolute top-full left-0 right-0 mt-2 bg-[#292935] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden custom-dropdown-menu backdrop-blur-xl">
              ${statuses.map(s => `
                <button type="button" class="dropdown-item w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all ${task?.status === s ? 'text-[#c4c0ff] font-bold' : ''}" data-val="${s}">${s}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-[#1b1a26]/50 p-5 rounded-2xl border border-white/5 space-y-4">
        <div>
          <div class="flex justify-between items-center mb-3">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Складність</label>
            <span class="text-xs font-mono text-[#c4c0ff] font-bold" id="form-cx-display">${task?.complexity || 5}/10</span>
          </div>
          <input type="range" id="form-cx" min="1" max="10" value="${task?.complexity || 5}"
             class="w-full h-1.5 bg-[#343440] rounded-lg appearance-none cursor-pointer accent-[#c4c0ff]" />
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="relative active-selector-cont" id="date-selector-cont">
          <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Дата</label>
          <div class="relative group cursor-pointer" id="date-trigger">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white text-[16px] pointer-events-none group-hover:text-[#c4c0ff] transition-colors" id="date-icon-trigger">calendar_today</span>
            <input type="text" id="form-date" value="${task?.date || getLocalDateKey()}" readonly
              class="w-full bg-[#1b1a26] border border-white/5 rounded-xl py-3 pl-10 pr-3 text-xs text-white outline-none cursor-pointer group-hover:bg-[#292935] transition-all font-mono" />
          </div>
          <div id="date-picker-menu" class="hidden absolute bottom-full mb-2 left-0 w-64 bg-[#292935] border border-white/10 rounded-xl shadow-2xl z-[200] overflow-hidden custom-dropdown-menu backdrop-blur-xl p-4">
          </div>
        </div>
        <div class="relative active-selector-cont" id="time-selector-cont">
          <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Час</label>
          <div class="relative group cursor-pointer" id="time-trigger">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white text-[16px] pointer-events-none group-hover:text-[#c4c0ff] transition-colors" id="time-icon-trigger">schedule</span>
            <input type="text" id="form-time" value="${task?.time || '09:00'}" readonly
              class="w-full bg-[#1b1a26] border border-white/5 rounded-xl py-3 pl-10 pr-3 text-xs text-white outline-none cursor-pointer group-hover:bg-[#292935] transition-all font-mono" />
          </div>
          <div id="time-picker-menu" class="hidden absolute bottom-full mb-2 left-0 w-40 max-h-60 bg-[#292935] border border-white/10 rounded-xl shadow-2xl z-[200] overflow-y-auto custom-scrollbar custom-dropdown-menu backdrop-blur-xl">
          </div>
        </div>
        <div class="relative col-span-2 md:col-span-1">
          <label class="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Тривалість</label>
          <div class="relative group">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white text-[16px] pointer-events-none group-focus-within:text-[#c4c0ff] transition-colors">timer</span>
            <input type="text" id="form-duration" value="${task?.duration || '1 год'}"
               class="w-full bg-[#1b1a26] border border-white/5 rounded-xl py-3 pl-10 pr-3 text-xs text-white outline-none focus:ring-1 focus:ring-[#c4c0ff]/40 transition-all font-mono" placeholder="напр. 2 год" />
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initTaskForm(container, task = null, submitBtn = null) {
  const form = container.querySelector('#unified-task-form');
  if (!form) return;

  let state = {
    category:     task?.category || null,
    priority:     task?.priority || 'Mid',
    status:       task?.status   || 'Очікує',
    selectedDate: task?.date     || getLocalDateKey(),
  };

  const validate = () => {
    const title   = form.querySelector('#form-title').value.trim();
    const isValid = title.length > 0 && state.category !== null;
    if (submitBtn) {
      submitBtn.disabled = !isValid;
      submitBtn.classList.toggle('submit-btn', true);
    }
    return isValid;
  };

  form.querySelector('#form-title').addEventListener('input', validate);

  // ── Категорії ──────────────────────────────────────────────────

  const catGroup = form.querySelector('#form-category-group');

  const updateCatSelection = () => {
    catGroup.querySelectorAll('.form-chip').forEach(btn => {
      const active = btn.dataset.val === state.category;
      btn.className = `form-chip px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
        active ? 'active' : 'bg-[#1b1a26] border-transparent text-slate-500 hover:text-slate-300'
      }`;
    });
    validate();
  };

  catGroup.addEventListener('click', (e) => {
    const chip = e.target.closest('.form-chip');
    if (chip && chip.dataset.val) {
      state.category = chip.dataset.val;
      updateCatSelection();
    }
  });

  const addBtn      = form.querySelector('#add-cat-btn');
  const inlineInput = form.querySelector('#new-cat-inline');
  const catField    = form.querySelector('#new-cat-input');
  const catSaveBtn  = form.querySelector('#new-cat-save');

  addBtn.onclick = () => {
    addBtn.classList.add('hidden');
    inlineInput.classList.remove('hidden');
    inlineInput.classList.add('flex');
    catField.focus();
  };

  // ── КЛЮЧОВА ЗМІНА: addCategory тепер async → чекаємо відповідь бекенду
  catSaveBtn.onclick = async () => {
    const name = catField.value.trim();
    if (!name) return;

    catSaveBtn.disabled = true;

    try {
      // Зберігає в preferences на бекенді, повертає id
      const newId = await taskStore.addCategory(name);

      state.category = newId;

      // Додаємо чіп у DOM
      const cats   = taskStore.getCategories();
      const newChip = document.createElement('button');
      newChip.type      = 'button';
      newChip.className = 'form-chip px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border bg-[#1b1a26] border-transparent text-slate-500 hover:text-slate-300';
      newChip.dataset.val  = newId;
      newChip.textContent  = cats[newId]?.label || name.toUpperCase();
      catGroup.insertBefore(newChip, addBtn);

      inlineInput.classList.add('hidden');
      inlineInput.classList.remove('flex');
      addBtn.classList.remove('hidden');
      catField.value = '';

      updateCatSelection();
    } catch (err) {
      console.error('Не вдалося зберегти категорію:', err);
    } finally {
      catSaveBtn.disabled = false;
    }
  };

  // Enter у полі категорії
  catField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); catSaveBtn.onclick(); }
  });

  // ── Пріоритет ──────────────────────────────────────────────────

  const priGroup = form.querySelector('#form-priority-group');
  priGroup.querySelectorAll('.form-chip').forEach(btn => {
    btn.onclick = () => {
      priGroup.querySelectorAll('.form-chip').forEach(b => {
        b.className = 'form-chip flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-transparent bg-[#1b1a26] text-slate-500 hover:text-slate-300';
      });
      btn.className = 'form-chip flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-[#ffb4ab]/30 priority-active';
      state.priority = btn.dataset.val;
      validate();
    };
  });

  // ── Статус ─────────────────────────────────────────────────────

  const drpTrigger = form.querySelector('#status-dropdown-trigger');
  const drpMenu    = form.querySelector('#status-dropdown-menu');
  const drpLabel   = form.querySelector('#trigger-label');

  function closeAllSelects(exceptMenu = null) {
    form.querySelectorAll('.custom-dropdown-menu').forEach(m => {
      if (m !== exceptMenu) m.classList.add('hidden');
    });
  }

  drpTrigger.onclick = (e) => {
    e.stopPropagation();
    closeAllSelects(drpMenu);
    drpMenu.classList.toggle('hidden');
  };

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) closeAllSelects();
  });

  drpMenu.querySelectorAll('.dropdown-item').forEach(item => {
    item.onclick = () => {
      state.status = item.dataset.val;
      drpLabel.textContent = item.dataset.val;
      drpMenu.classList.add('hidden');
      drpMenu.querySelectorAll('.dropdown-item').forEach(i => {
        i.classList.toggle('text-[#c4c0ff]', i.dataset.val === state.status);
        i.classList.toggle('font-bold',      i.dataset.val === state.status);
      });
      validate();
    };
  });

  // ── Time picker ────────────────────────────────────────────────

  const timeInput   = form.querySelector('#form-time');
  const timeTrigger = form.querySelector('#time-trigger');
  const timeMenu    = form.querySelector('#time-picker-menu');

  function initTimePicker() {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    timeMenu.innerHTML = times.map(t =>
      `<button type="button" class="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all font-mono" data-val="${t}">${t}</button>`
    ).join('');
    timeMenu.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => { timeInput.value = btn.dataset.val; timeMenu.classList.add('hidden'); validate(); };
    });
  }
  initTimePicker();

  timeTrigger.onclick = (e) => {
    e.stopPropagation();
    const isHidden = timeMenu.classList.contains('hidden');
    closeAllSelects(timeMenu);
    timeMenu.classList.toggle('hidden', !isHidden);
  };

  // ── Date picker ────────────────────────────────────────────────

  const dateInput   = form.querySelector('#form-date');
  const dateTrigger = form.querySelector('#date-trigger');
  const dateMenu    = form.querySelector('#date-picker-menu');

  function renderCalendar(year, month) {
    const daysArr   = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
    const monthsArr = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

    let firstDay = new Date(year, month, 1).getDay();
    if (firstDay === 0) firstDay = 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div class="flex justify-between items-center mb-4">
        <button type="button" id="cal-prev-mo" class="p-1 hover:text-[#c4c0ff]"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">${monthsArr[month]} ${year}</span>
        <button type="button" id="cal-next-mo" class="p-1 hover:text-[#c4c0ff]"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center mb-2">
        ${daysArr.map(d => `<span class="text-[8px] font-bold text-slate-600 uppercase">${d}</span>`).join('')}
      </div>
      <div class="grid grid-cols-7 gap-1">`;

    for (let i = 1; i < firstDay; i++) html += `<div class="h-6"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const active = state.selectedDate === ds;
      html += `<button type="button" class="h-7 w-7 rounded-lg text-[10px] flex items-center justify-center transition-all
        ${active ? 'bg-[#c4c0ff] text-[#2000a4] font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
        data-date="${ds}">${d}</button>`;
    }
    html += `</div>`;

    dateMenu.innerHTML = html;

    dateMenu.querySelector('#cal-prev-mo').onclick = (e) => {
      e.stopPropagation();
      renderCalendar(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
    };
    dateMenu.querySelector('#cal-next-mo').onclick = (e) => {
      e.stopPropagation();
      renderCalendar(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1);
    };
    dateMenu.querySelectorAll('[data-date]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        state.selectedDate = btn.dataset.date;
        dateInput.value    = state.selectedDate;
        dateMenu.classList.add('hidden');
        validate();
      };
    });
  }

  dateTrigger.onclick = (e) => {
    e.stopPropagation();
    const isHidden = dateMenu.classList.contains('hidden');
    closeAllSelects(dateMenu);
    if (isHidden) {
      const d = new Date(state.selectedDate);
      renderCalendar(d.getFullYear(), d.getMonth());
      dateMenu.classList.remove('hidden');
    }
  };

  // ── Складність ────────────────────────────────────────────────

  const cxInput   = form.querySelector('#form-cx');
  const cxDisplay = form.querySelector('#form-cx-display');
  cxInput.oninput = (e) => { cxDisplay.textContent = `${e.target.value}/10`; };

  validate();

  return {
    getData: () => ({
      title:       form.querySelector('#form-title').value,
      description: form.querySelector('#form-desc').value,
      category:    state.category,
      priority:    state.priority,
      complexity:  parseInt(form.querySelector('#form-cx').value),
      date:        form.querySelector('#form-date').value,
      time:        form.querySelector('#form-time').value,
      duration:    form.querySelector('#form-duration').value,
      status:      state.status,
    }),
    isValid: validate,
  };
}