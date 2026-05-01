import { renderAIInsight } from '../components/ai-insight.js';
import { renderTaskAIActions, initTaskAIActions } from '../components/task-ai-actions.js';
import { toast } from '../services/toast.js';
import { taskStore, CATEGORIES } from '../services/task-store.js';
import { renderTaskForm, initTaskForm } from '../components/task-form.js';

const STATUS_CFG = {
  'В процесі': 'bg-[#00b3b3]/20 text-[#4ddada]',
  'Очікує': 'bg-[#343440] text-slate-400',
  'Виконано': 'bg-[#4ddada]/20 text-[#4ddada]',
  'Терміново': 'bg-[#93000a]/30 text-[#ffb4ab]',
};

const fmtDt = d => { 
  const dt = new Date(d); 
  const m = ['січ.','лют.','берез.','квіт.','трав.','черв.','лип.','серп.','верес.','жовт.','листоп.','груд.']; 
  return `${dt.getDate()} ${m[dt.getMonth()]} ${dt.getFullYear()}`; 
};

function renderItem(t) {
  const isDone = t.status === 'Виконано';
  const cat = CATEGORIES[t.category] || { label: t.category, color: '#c4c0ff' };
  const stCls = STATUS_CFG[t.status] || STATUS_CFG['Очікує'];
  
  return `<div class="task-item group relative flex items-center gap-4 p-4 rounded-xl border border-transparent bg-[#1b1a26] hover:bg-[#1f1e2a] hover:border-[#c4c0ff]/10 transition-all glow-hover ${isDone?'opacity-50':''}" data-id="${t.id}">
  <div class="flex-shrink-0"><button class="task-check w-6 h-6 rounded-full border-2 border-[#c4c0ff]/40 flex items-center justify-center transition-colors ${isDone?'bg-[#c4c0ff] border-transparent':''}">${isDone?'<span class="material-symbols-outlined text-[14px] text-[#12121d] font-bold">check</span>':''}</button></div>
  <div class="flex-1 min-w-0 task-body-click cursor-pointer">
    <div class="flex items-center gap-3 mb-1"><h4 class="font-bold truncate text-white ${isDone?'line-through opacity-50':''}">${t.title}</h4><span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono" style="background:${cat.color}15;color:${cat.color}">${cat.label}</span></div>
    <div class="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
      <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">psychology</span><span>${t.complexity}/10</span></div>
      <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">event</span><span>${fmtDt(t.date)}</span></div>
      <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">schedule</span><span>${t.duration}</span></div>
    </div>
  </div>
  <div class="flex items-center gap-3">
    <button class="task-status-chip px-3 py-1 rounded-full ${stCls} text-[10px] font-bold uppercase tracking-wider hover:ring-1 hover:ring-white/10 transition-all">${t.status}</button>
    <div class="relative">
      <button class="task-more-btn opacity-0 group-hover:opacity-100 p-1 hover:bg-[#343440] rounded-md transition-all"><span class="material-symbols-outlined text-slate-400 text-sm">more_vert</span></button>
      <div class="task-ctx-menu absolute right-0 top-full mt-1 w-44 bg-[#292935] border border-white/5 rounded-xl shadow-xl hidden z-50 overflow-hidden">
        <button class="ctx-act w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 flex items-center gap-2" data-act="done"><span class="material-symbols-outlined text-[14px]">check_circle</span>Виконано</button>
        <button class="ctx-act w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 flex items-center gap-2" data-act="edit"><span class="material-symbols-outlined text-[14px]">edit</span>Редагувати</button>
        <button class="ctx-act w-full text-left px-4 py-2.5 text-xs font-medium text-[#f35c7b] hover:bg-[#f35c7b]/10 flex items-center gap-2" data-act="del"><span class="material-symbols-outlined text-[14px]">delete</span>Видалити</button>
      </div>
    </div>
  </div>
</div>`;
}

function renderGroup(lbl, lCls, cCls, items) {
  if (!items.length) return '';
  const w = items.length === 1 ? 'ЗАДАЧА' : (items.length < 5 ? 'ЗАДАЧІ' : 'ЗАДАЧ');
  return `<section class="mb-12"><div class="flex items-center gap-3 mb-6"><h3 class="text-xl font-bold tracking-tight ${lCls}">${lbl}</h3><span class="px-2 py-0.5 rounded-full ${cCls} text-[10px] font-bold font-mono">${items.length} ${w}</span></div><div class="space-y-3">${items.map(renderItem).join('')}</div></section>`;
}

function buildTaskListHTML(tasks) {
  const now = new Date().toISOString().slice(0, 10);
  const today = tasks.filter(t => t.date === now);
  const overdue = tasks.filter(t => t.date < now && t.status !== 'Виконано');
  const future = tasks.filter(t => t.date > now || (t.date === now && t.status === 'Виконано') || (t.date < now && t.status === 'Виконано'));
  
  // Actually, let's group by Today / Future / Completed if we want to be clean
  return renderGroup('Сьогодні', '', 'bg-[#c4c0ff]/10 text-[#c4c0ff]', today.filter(t => t.status !== 'Виконано')) + 
         renderGroup('Прострочені', 'text-[#ffb4ab]', 'bg-[#93000a]/30 text-[#ffb4ab]', overdue) +
         renderGroup('Інші задачі', 'opacity-60', 'bg-[#343440] text-slate-400', future.filter(t => t.status !== 'Виконано')) +
         renderGroup('Виконані', 'opacity-40', 'bg-[#343440] text-slate-500', tasks.filter(t => t.status === 'Виконано'));
}

export function renderTasks() {
  return `<div class="p-8 max-w-6xl w-full mx-auto">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
    <div class="relative group flex-1 max-w-md">
      <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
      <input id="task-search" class="w-full bg-[#1b1a26] border-none rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none" placeholder="🔍 Пошук задач..." />
    </div>
    <div class="flex gap-3">
      ${['status','complexity','deadline'].map(f => `<div class="relative"><button class="dropdown-trigger flex items-center gap-2 px-4 py-2 bg-[#1b1a26] hover:bg-[#292935] rounded-lg text-xs font-medium text-slate-300 transition-colors capitalize" data-type="${f}">${f === 'status'?'Статус':f==='complexity'?'Складність':'Дедлайн'} <span class="material-symbols-outlined text-sm">expand_more</span></button>
        <div class="dropdown-menu absolute left-0 top-full mt-2 w-48 bg-[#292935] border border-white/5 rounded-xl shadow-xl hidden z-50 overflow-hidden" id="f-${f}"></div></div>`).join('')}
    </div>
  </div>
  <div class="mb-10">${renderAIInsight({title:'AI Аналітик ПланІQ', message:'Ви помітили, що задачі з тегом <span class="text-[#4ddada]">CORE AI</span> зазвичай займають на 15% більше часу.', icon:'auto_awesome', actions:[{label:'Застосувати'}, {label:'Ігнорувати'}]})}</div>
  <div id="task-list-cont"></div>
  <div id="task-empty" class="hidden text-center py-20"><span class="material-symbols-outlined text-5xl text-slate-600 mb-3 block">search_off</span><p class="text-lg font-bold text-slate-500">Нічого не знайдено</p></div>
</div>
<div id="drawer-overlay" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 hidden opacity-0 transition-opacity duration-300"></div>
<div id="task-drawer" class="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-[#1b1a26] border-l border-white/5 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 overflow-y-auto">
  <div class="p-6 space-y-5">
    <div class="flex justify-between items-center"><h2 class="text-lg font-bold" id="drawer-title"></h2><button id="drawer-close" class="p-2 hover:bg-[#292935] rounded-lg"><span class="material-symbols-outlined text-[18px]">close</span></button></div>
    <div id="drawer-view-mode" class="space-y-5">
      <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Опис</span><p class="text-sm text-slate-300 leading-relaxed" id="drawer-desc"></p></div>
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Категорія</span><span id="drawer-cat" class="text-sm font-semibold"></span></div>
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Пріоритет</span><span id="drawer-pri" class="text-sm font-semibold"></span></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Дата / Час</span><span id="drawer-datetime" class="text-sm font-mono text-white"></span></div>
        <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Тривалість</span><span id="drawer-duration" class="text-sm font-mono text-white"></span></div>
      </div>
      <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-1 tracking-wider">Складність</span><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-[#343440] rounded-full overflow-hidden"><div class="h-full bg-[#c4c0ff] transition-all" id="drawer-cx-bar"></div></div><span id="drawer-cx-val" class="text-xs font-mono text-[#c4c0ff]"></span></div></div>
      <div><span class="text-[10px] font-bold text-[#c7c4d8] uppercase block mb-2 tracking-wider">Статус</span><div class="flex flex-wrap gap-2" id="drawer-status-group"></div></div>
      ${renderTaskAIActions('task-drawer')}
      <div class="flex gap-3 pt-3 border-t border-white/5"><button id="drawer-edit-btn" class="flex-1 flex items-center justify-center gap-2 bg-[#292935] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#343440]"><span class="material-symbols-outlined text-sm">edit</span>Редагувати</button><button id="drawer-del-btn" class="p-3 bg-[#292935] text-[#f35c7b] rounded-xl hover:bg-[#f35c7b]/10"><span class="material-symbols-outlined text-sm">delete</span></button></div>
    </div>
    <div id="drawer-edit-mode" class="hidden">
       <div id="drawer-form-container"></div>
       <div class="flex gap-3 pt-6"><button id="drawer-save" class="flex-1 bg-[#c4c0ff] text-[#2000a4] py-3.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">Зберегти зміни</button><button id="drawer-cancel" class="flex-1 bg-[#292935] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#343440] transition-all">Скасувати</button></div>
    </div>
  </div>
</div>
<div id="status-pop" class="fixed bg-[#292935] border border-white/5 rounded-xl shadow-xl z-50 hidden w-40 overflow-hidden"></div>
<div id="new-task-modal" class="fixed inset-0 z-50 hidden">
  <div class="fixed inset-0 bg-[#0d0d18]/70 backdrop-blur-md" id="modal-backdrop"></div>
  <div class="fixed inset-0 flex items-center justify-center p-4">
    <div class="relative w-full max-w-[600px] bg-[#15141f] rounded-2xl border border-[#464555]/15 shadow-2x overflow-hidden">
      <div class="px-7 py-5 flex items-center justify-between border-b border-white/5"><div class="flex items-center gap-3"><div class="w-9 h-9 bg-[#c4c0ff] rounded-xl flex items-center justify-center"><span class="material-symbols-outlined text-[18px] text-[#1b0091]">add_task</span></div><h2 class="text-lg font-bold text-white">Нова задача</h2></div><button class="p-2 hover:bg-[#292935] rounded-xl" id="modal-close"><span class="material-symbols-outlined">close</span></button></div>
      <div class="px-7 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar" id="modal-form-container"></div>
      <div class="px-7 py-5 flex items-center justify-between border-t border-white/5 bg-[#15141f]"><button id="nt-cancel" class="text-[#c7c4d8] font-semibold hover:text-white">Скасувати</button><button id="nt-submit" class="px-7 py-3 bg-gradient-to-r from-[#c4c0ff] to-[#8781ff] text-[#1b0091] rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">Створити задачу</button></div>
    </div>
  </div>
</div>`;
}

export function initTasks() {
  const fOpts = { status: ['all','Очікує','В процесі','Виконано','Терміново'], complexity: ['all','low','mid','high'], deadline: ['all','today','week','overdue'] };
  let filters = { status:'all', complexity:'all', deadline:'all' }, query = '', curId = null, formInstance = null;

  const render = () => {
    const now = new Date().toISOString().slice(0, 10);
    const filtered = taskStore.getAll().filter(t => {
      const mS = t.title.toLowerCase().includes(query) || (CATEGORIES[t.category]?.label || '').toLowerCase().includes(query);
      const mSt = filters.status === 'all' || t.status === filters.status;
      const mCx = filters.complexity === 'all' || (filters.complexity==='high'?t.complexity>=7:filters.complexity==='mid'?(t.complexity>=4&&t.complexity<=6):t.complexity<=3);
      const mD = filters.deadline === 'all' || (filters.deadline==='today'?t.date===now : filters.deadline==='week'? (new Date(t.date) - new Date(now)) < 7*86400000 : t.date < now);
      return mS && mSt && mCx && mD;
    });
    const cont = document.getElementById('task-list-cont'), empty = document.getElementById('task-empty');
    if(filtered.length) { cont.innerHTML = buildTaskListHTML(filtered); cont.classList.remove('hidden'); empty.classList.add('hidden'); }
    else { cont.innerHTML = ''; cont.classList.add('hidden'); empty.classList.remove('hidden'); }
    document.querySelectorAll('.dropdown-trigger').forEach(b => {
      const active = filters[b.dataset.type] !== 'all';
      b.classList.toggle('text-[#c4c0ff]', active); b.classList.toggle('bg-[#c4c0ff]/10', active);
    });
    bind();
  };

  const bind = () => {
    document.querySelectorAll('.task-check').forEach(b => b.onclick = e => { e.stopPropagation(); const id = b.closest('.task-item').dataset.id, t = taskStore.getById(id); taskStore.update(id, { status: t.status==='Виконано'?'Очікує':'Виконано' }); render(); });
    document.querySelectorAll('.task-body-click').forEach(e => e.onclick = () => open(e.closest('.task-item').dataset.id));
    document.querySelectorAll('.task-status-chip').forEach(b => b.onclick = e => { e.stopPropagation(); popupStatus(b, b.closest('.task-item').dataset.id); });
    document.querySelectorAll('.task-more-btn').forEach(b => b.onclick = e => { e.stopPropagation(); document.querySelectorAll('.task-ctx-menu').forEach(m=>m.classList.add('hidden')); b.nextElementSibling.classList.remove('hidden'); });
    document.querySelectorAll('.ctx-act').forEach(b => b.onclick = () => { const id = b.closest('.task-item').dataset.id, act = b.dataset.act; if(act==='del') taskStore.delete(id); else if(act==='done') taskStore.update(id, { status:'Виконано' }); else if(act==='edit') open(id, true); render(); });
  };

  const open = (id, edit = false) => {
    curId = id; const t = taskStore.getById(id); if(!t) return;
    document.getElementById('drawer-title').textContent = t.title;
    document.getElementById('drawer-desc').textContent = t.description || 'Опис відсутній';
    const cat = CATEGORIES[t.category] || { label: t.category, color: '#c4c0ff' };
    document.getElementById('drawer-cat').textContent = cat.label;
    document.getElementById('drawer-cat').style.color = cat.color;
    document.getElementById('drawer-pri').textContent = t.priority;
    document.getElementById('drawer-datetime').textContent = `${fmtDt(t.date)} о ${t.time}`;
    document.getElementById('drawer-duration').textContent = t.duration;
    document.getElementById('drawer-cx-bar').style.width = `${t.complexity*10}%`;
    document.getElementById('drawer-cx-val').textContent = `${t.complexity}/10`;
    const sg = document.getElementById('drawer-status-group');
    sg.innerHTML = ['Очікує','В процесі','Виконано','Терміново'].map(s => `<button class="drawer-status-btn px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${s===t.status ? (STATUS_CFG[s] || '') : 'bg-[#1b1a26] text-slate-500'}" data-status="${s}">${s}</button>`).join('');
    sg.querySelectorAll('.drawer-status-btn').forEach(b => b.onclick = () => { taskStore.update(id, { status: b.dataset.status }); open(id); render(); });
    
    document.getElementById('drawer-view-mode').classList.toggle('hidden', edit);
    document.getElementById('drawer-edit-mode').classList.toggle('hidden', !edit);
    if(edit) {
      document.getElementById('drawer-form-container').innerHTML = renderTaskForm(t);
      formInstance = initTaskForm(document.getElementById('drawer-form-container'), t, document.getElementById('drawer-save'));
    }
    initTaskAIActions('task-drawer');
    document.getElementById('task-drawer').classList.remove('translate-x-full'); document.getElementById('drawer-overlay').classList.remove('hidden');
    setTimeout(()=>document.getElementById('drawer-overlay').classList.remove('opacity-0'),10);
  };

  const close = () => { document.getElementById('task-drawer').classList.add('translate-x-full'); document.getElementById('drawer-overlay').classList.add('opacity-0'); setTimeout(()=>document.getElementById('drawer-overlay').classList.add('hidden'),300); };
  document.getElementById('drawer-close').onclick = close; document.getElementById('drawer-overlay').onclick = close;
  document.getElementById('drawer-edit-btn').onclick = () => open(curId, true);
  document.getElementById('drawer-cancel').onclick = () => open(curId, false);
  document.getElementById('drawer-save').onclick = () => { if(formInstance.isValid()) { taskStore.update(curId, formInstance.getData()); open(curId, false); render(); toast('Збережено'); } };
  document.getElementById('drawer-del-btn').onclick = () => { taskStore.delete(curId); close(); render(); toast('Видалено'); };

  const popupStatus = (chip, id) => {
    const p = document.getElementById('status-pop'), r = chip.getBoundingClientRect();
    p.style.top = `${r.bottom+5}px`; p.style.left = `${Math.min(r.left, window.innerWidth-170)}px`;
    p.innerHTML = ['Очікує','В процесі','Виконано','Терміново'].map(s => `<button class="p-pick w-full text-left px-4 py-2 text-[11px] font-bold hover:bg-white/10 text-slate-300" data-status="${s}">${s}</button>`).join('');
    p.classList.remove('hidden');
    p.querySelectorAll('.p-pick').forEach(b => b.onclick = () => { taskStore.update(id, { status: b.dataset.status }); p.classList.add('hidden'); render(); });
  };

  document.querySelectorAll('.dropdown-trigger').forEach(b => b.onclick = e => {
    e.stopPropagation(); const type = b.dataset.type, menu = document.getElementById(`f-${type}`);
    const isHidden = menu.classList.contains('hidden');
    document.querySelectorAll('.dropdown-menu').forEach(m=>m.classList.add('hidden'));
    if(isHidden) {
      menu.innerHTML = fOpts[type].map(v => `<button class="f-opt w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${filters[type]===v?'text-white':'text-slate-400'}" data-val="${v}">${v==='all'?'Всі':v}</button>`).join('');
      menu.classList.remove('hidden');
      menu.querySelectorAll('.f-opt').forEach(opt => opt.onclick = () => { filters[type]=opt.dataset.val; menu.classList.add('hidden'); render(); });
    }
  });

  const modal = document.getElementById('new-task-modal');
  let modalForm = null;
  document.querySelectorAll('#topbar-new-task').forEach(b=>b.onclick=()=>{ 
    modal.classList.remove('hidden'); 
    document.getElementById('modal-form-container').innerHTML = renderTaskForm();
    modalForm = initTaskForm(document.getElementById('modal-form-container'), null, document.getElementById('nt-submit'));
  });
  document.getElementById('modal-close').onclick = () => modal.classList.add('hidden');
  document.getElementById('nt-cancel').onclick = () => modal.classList.add('hidden');
  document.getElementById('nt-submit').onclick = () => { if(modalForm.isValid()) { taskStore.add(modalForm.getData()); modal.classList.add('hidden'); render(); toast('Створено'); } };

  window.addEventListener('task-store-update', render);
  render();
}
