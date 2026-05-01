import { renderAIInsight } from '../components/ai-insight.js';
import { toast } from '../services/toast.js';
import { clearAuth } from '../services/auth.js';

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
    <a href="#" class="settings-tab flex items-center gap-3 px-4 py-3 rounded-xl text-[#c7c4d8] hover:bg-[#1f1e2a] transition-all" data-tab="appearance">
      <span class="text-lg">🎨</span> Вигляд
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
  return `
<section class="bg-[#1f1e2a] p-8 rounded-2xl glow-primary">
  <h2 class="text-2xl font-bold mb-8 flex items-center gap-3"><span class="w-1.5 h-6 bg-[#c4c0ff] rounded-full"></span>Особисті дані</h2>
  <div class="flex flex-col md:flex-row gap-12 items-start">
    <div class="relative group" id="avatar-container">
      <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-[#292935] relative bg-gradient-to-tr from-[#6C63FF] to-[#3ECFCF] flex items-center justify-center text-4xl font-black text-white hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-black/20" id="avatar-preview">ОП</div>
      <button class="mt-4 w-full text-center text-[10px] font-mono text-[#918fa1] hover:text-white uppercase tracking-widest transition-colors outline-none cursor-pointer" id="avatar-trigger">Змінити фото</button>
      
      <input type="file" id="avatar-upload" class="hidden" accept="image/png, image/jpeg, image/webp" />
      
      <div id="avatar-popup" class="absolute left-1/2 -translate-x-1/2 top-[120px] w-48 bg-[#292935] border border-white/10 rounded-xl shadow-xl hidden z-50 overflow-hidden">
        <button class="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors border-b border-white/5 flex items-center gap-2 outline-none" id="btn-upload-photo">
          <span class="material-symbols-outlined text-[16px]">upload</span> Завантажити
        </button>
        <div class="p-3 border-b border-white/5 bg-black/10">
          <span class="text-[9px] font-mono text-slate-500 uppercase mb-3 block text-center">Стандартні</span>
          <div class="flex gap-3 justify-center">
            <button class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffb4ab] to-amber-500 hover:scale-110 transition-transform default-avatar-btn shadow-lg outline-none" data-color="from-[#ffb4ab] to-amber-500"></button>
            <button class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4ddada] to-emerald-400 hover:scale-110 transition-transform default-avatar-btn shadow-lg outline-none" data-color="from-[#4ddada] to-emerald-400"></button>
            <button class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c4c0ff] to-indigo-500 hover:scale-110 transition-transform default-avatar-btn shadow-lg outline-none" data-color="from-[#c4c0ff] to-indigo-500"></button>
          </div>
        </div>
        <button class="w-full text-left px-4 py-3 text-xs font-bold text-[#ffb2bc] hover:bg-[#ffb2bc]/10 transition-colors flex items-center gap-2 outline-none" id="btn-remove-photo">
          <span class="material-symbols-outlined text-[16px]">delete</span> Видалити фото
        </button>
      </div>
    </div>
    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div class="space-y-2"><label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Ім'я</label><input class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none" type="text" value="Олександр Петренко"/></div>
      <div class="space-y-2"><label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Електронна пошта</label><input class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none" type="email" value="alex@example.com"/></div>
      <div class="space-y-2 md:col-span-2"><label class="text-xs font-bold text-[#918fa1] uppercase tracking-widest ml-1">Часовий пояс</label><div class="relative"><select class="w-full bg-[#1b1a26] border-none rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none"><option>UTC+2 Київ</option><option>UTC+1 Варшава</option><option>UTC+0 Лондон</option></select><span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#918fa1]">expand_more</span></div></div>
      <div class="md:col-span-2 pt-4"><button class="bg-[#c4c0ff] text-[#2000a4] px-8 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#c4c0ff]/20 transition-all active:scale-95" id="save-profile">Зберегти зміни</button></div>
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
${renderAIInsight({title:'AI Insight: Безпека',message:'Ми рекомендуємо увімкнути двофакторну автентифікацію для захисту ваших інтелектуальних планів.',icon:'psychology'})}
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
<div class="mb-8"><h2 class="text-3xl font-black text-white tracking-tight mb-2">Налаштування алгоритму</h2><p class="text-[#c7c4d8] max-w-2xl">Керуйте інтелектуальними функціями ПланІQ.</p></div>
${renderAIInsight({title:'AI Аналітика',message:'Ваші вечірні задачі зазвичай займають на 15% більше часу. Алгоритм готовий автоматично коригувати ці блоки.',icon:'auto_awesome'})}
<div class="space-y-4 mt-6">
  <div class="glass-card p-6 rounded-2xl flex items-center justify-between group hover:bg-[#1f1e2a] transition-all">
    <div class="flex-1"><div class="flex items-center gap-2 mb-1"><h3 class="font-bold text-white">Коефіцієнт реальності</h3><span class="bg-[#c4c0ff]/20 text-[#c4c0ff] text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">Smart</span></div><p class="text-sm text-[#c7c4d8]">Автоматично збільшує оцінку часу.</p></div>
    <div class="flex items-center gap-6"><span class="font-mono text-sm text-[#c4c0ff]">+20%</span><div class="w-12 h-6 bg-[#c4c0ff] rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="true"><div class="w-4 h-4 bg-[#2000a4] rounded-full translate-x-6 transition-transform toggle-knob"></div></div></div>
  </div>
  <div class="glass-card p-6 rounded-2xl flex items-center justify-between group hover:bg-[#1f1e2a] transition-all">
    <div class="flex-1"><h3 class="font-bold text-white mb-1">Автоматичне перепланування</h3><p class="text-sm text-[#c7c4d8]">AI перенесе невиконану задачу на наступне вікно.</p></div>
    <div class="w-12 h-6 bg-[#c4c0ff] rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="true"><div class="w-4 h-4 bg-[#2000a4] rounded-full translate-x-6 transition-transform toggle-knob"></div></div>
  </div>
  <div class="glass-card p-6 rounded-2xl flex items-center justify-between group hover:bg-[#1f1e2a] transition-all">
    <div class="flex-1"><h3 class="font-bold text-slate-400 mb-1">Захист пікових годин</h3><p class="text-sm text-slate-500">Резервувати години піку для Deep Work.</p></div>
    <div class="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="false"><div class="w-4 h-4 bg-slate-400 rounded-full transition-transform toggle-knob"></div></div>
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
</div>
<footer class="pt-12 pb-10">
  <button class="w-full py-4 bg-[#c4c0ff] text-[#2000a4] font-black rounded-2xl shadow-[0_10px_40px_-10px_rgba(108,99,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3" id="save-algorithm">
    <span class="material-symbols-outlined">save</span>Зберегти налаштування алгоритму
  </button>
  <div class="mt-6 text-center"><p class="text-xs text-slate-500 font-mono">Версія AI Engine: 4.2.0-stable</p></div>
</footer>`;
}

function hoursTab() {
  return `
<div class="mb-8">
  <h2 class="text-3xl font-black text-white tracking-tight mb-2">Робочі години</h2>
  <p class="text-[#c7c4d8] max-w-2xl">Налаштуй свій робочий графік. Система не буде планувати задачі поза цим часом.</p>
</div>
<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
  <section class="xl:col-span-8">
    <div class="bg-[#1b1a26] rounded-3xl p-8 border border-white/5">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 class="text-xl font-bold text-white">Щотижневий графік</h2>
        <div class="flex gap-3">
          <button class="px-5 py-2.5 rounded-full text-sm font-medium text-slate-400 hover:bg-white/5 transition-all active:scale-95" id="clear-hours">Очистити все</button>
          <button class="px-5 py-2.5 rounded-full text-sm font-medium bg-[#292935] text-[#4ddada] hover:brightness-110 transition-all active:scale-95" id="default-hours">Робочі дні 9-18</button>
        </div>
      </div>
      <div class="overflow-x-auto no-scrollbar">
        <div class="min-w-[700px]">
          <div class="grid grid-cols-[60px_repeat(19,1fr)] gap-1 mb-4">
            <div></div>
            ${[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0].map(h => `<div class="text-[10px] font-mono ${(h>=9&&h<=18)?'text-white/80 font-bold':'text-slate-500'} text-center">${String(h).padStart(2,'0')}</div>`).join('')}
          </div>
          <div class="space-y-2">
            ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт'].map(d => `
            <div class="grid grid-cols-[60px_repeat(19,1fr)] gap-1 h-10 items-center">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">${d}</span>
              ${Array(19).fill(0).map((_,i) => {
                const isActive = (i >= 3 && i <= 12);
                return `<div class="h-full ${isActive ? 'bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/20 active-cell' : 'bg-[#343440] border border-white/5'} rounded-sm cursor-pointer hover:brightness-125 transition-colors hours-cell" data-hour="${i}"></div>`;
              }).join('')}
            </div>`).join('')}
            ${['Сб', 'Нд'].map(d => `
            <div class="grid grid-cols-[60px_repeat(19,1fr)] gap-1 h-10 items-center">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">${d}</span>
              <div class="h-full bg-[#12121d] border border-white/5 opacity-50 rounded-sm col-span-[19]"></div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="mt-8 flex items-center gap-2">
        <span class="text-slate-500 text-sm font-medium">💾 Зміни збережено автоматично</span>
      </div>
    </div>
  </section>
  <aside class="xl:col-span-4 space-y-8">
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-white px-1">Швидкі пресети</h3>
      <div class="space-y-3">
        <div class="glass-card preset-card p-5 rounded-2xl border border-white/5 hover:border-[#c4c0ff]/50 transition-all cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#00b3b3]/20 rounded-xl flex items-center justify-center text-[#00b3b3]"><span class="material-symbols-outlined">wb_sunny</span></div>
            <div>
              <h4 class="font-bold text-white transition-colors">Ранкова людина</h4>
              <p class="text-xs text-slate-400 font-mono uppercase">06:00 — 15:00</p>
            </div>
          </div>
        </div>
        <div class="bg-[#343440]/40 p-5 rounded-2xl border border-[#c4c0ff]/40 transition-all glow-primary preset-card active-preset">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#8781ff]/20 rounded-xl flex items-center justify-center text-[#c4c0ff]"><span class="material-symbols-outlined">work</span></div>
            <div>
              <h4 class="font-bold text-white">Стандартний офіс</h4>
              <p class="text-xs text-slate-400 font-mono uppercase">09:00 — 18:00</p>
            </div>
            <span class="ml-auto material-symbols-outlined text-[#c4c0ff]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          </div>
        </div>
        <div class="glass-card preset-card p-5 rounded-2xl border border-white/5 hover:border-[#c4c0ff]/50 transition-all cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#f35c7b]/20 rounded-xl flex items-center justify-center text-[#ffb2bc]"><span class="material-symbols-outlined">dark_mode</span></div>
            <div>
              <h4 class="font-bold text-white transition-colors">Нічна сова</h4>
              <p class="text-xs text-slate-400 font-mono uppercase">16:00 — 01:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-[#1b1a26] rounded-3xl p-6 border border-white/5">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3"><span class="material-symbols-outlined text-[#4ddada]">restaurant</span><h3 class="font-bold text-white">Обідня перерва</h3></div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input checked class="sr-only peer" type="checkbox" id="lunch-toggle"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ddada]"></div>
        </label>
      </div>
      <div class="flex items-center gap-4 transition-opacity" id="lunch-block">
        <div class="flex-1">
          <label class="text-[10px] text-slate-500 font-mono uppercase mb-2 block">З</label>
          <div class="bg-[#343440] rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#464555] transition-colors"><span class="font-mono text-white">12:00</span><span class="material-symbols-outlined text-xs text-slate-500">schedule</span></div>
        </div>
        <div class="pt-6 text-slate-600">—</div>
        <div class="flex-1">
          <label class="text-[10px] text-slate-500 font-mono uppercase mb-2 block">До</label>
          <div class="bg-[#343440] rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#464555] transition-colors"><span class="font-mono text-white">13:00</span><span class="material-symbols-outlined text-xs text-slate-500">schedule</span></div>
        </div>
      </div>
      <p class="mt-4 text-xs text-slate-400 leading-relaxed italic">*AI автоматично зміщує задачі, щоб звільнити цей проміжок часу.</p>
    </div>
    <button class="w-full bg-[#c4c0ff] hover:bg-[#8781ff] text-[#2000a4] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl glow-primary" id="save-hours">
      <span class="material-symbols-outlined">save</span> Зберегти налаштування
    </button>
  </aside>
</div>
${renderAIInsight({title:'AI Аналітика',message:'Ваш поточний графік має найвищу продуктивність у вівторок з 10:00 до 12:00. <br class="hidden lg:block"/>Рекомендую зарезервувати цей час для "Глибокої роботи" (Deep Work) над проектом "ПланІQ".',icon:'psychology'})}
`;
}

function notificationsTab() {
  return `
<div class="mb-8">
  <h2 class="text-3xl font-black text-white tracking-tight mb-2">Сповіщення</h2>
  <p class="text-[#c7c4d8] leading-relaxed max-w-2xl">Керуй тим, як і коли ПланІQ нагадує тобі про задачі</p>
</div>
<div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
  <div class="xl:col-span-8 flex flex-col gap-4">
    ${renderAIInsight({title:'Розумна оптимізація',message:'Ми виявили, що ви продуктивніші, коли отримуєте нагадування за 15 хвилин до початку. Ваші поточні налаштування оптимальні.',icon:'auto_awesome'})}
    <div class="space-y-3 mt-4">
      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff]"><span class="material-symbols-outlined">timer</span></div>
          <div>
            <p class="text-white font-medium">Нагадування перед задачею</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">Focus Reminder</p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <span class="text-sm font-medium px-3 py-1 bg-[#343440] rounded-lg text-[#c4c0ff]">15 хв</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input checked class="sr-only peer notify-toggle" type="checkbox"/>
            <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
          </label>
        </div>
      </div>
      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#ffb2bc]/10 flex items-center justify-center text-[#ffb2bc]"><span class="material-symbols-outlined">notification_important</span></div>
          <div>
            <p class="text-white font-medium">Попередження про дедлайн</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">Critical alert</p>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <span class="text-sm font-medium px-3 py-1 bg-[#343440] rounded-lg text-[#ffb2bc]">3 год</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input checked class="sr-only peer notify-toggle" type="checkbox"/>
            <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
          </label>
        </div>
      </div>
      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#4ddada]/10 flex items-center justify-center text-[#4ddada]"><span class="material-symbols-outlined">update</span></div>
          <div>
            <p class="text-white font-medium">Сповіщення про перепланування</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">System Sync</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input checked class="sr-only peer notify-toggle" type="checkbox"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>
      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#343440] flex items-center justify-center text-slate-400"><span class="material-symbols-outlined">analytics</span></div>
          <div>
            <p class="text-white font-medium">Щотижневий звіт</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">Weekly digest</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input class="sr-only peer notify-toggle" type="checkbox"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>
      <div class="group flex items-center justify-between p-5 rounded-xl bg-[#1b1a26] hover:bg-[#292935] transition-all duration-300">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-[#343440] flex items-center justify-center text-slate-400"><span class="material-symbols-outlined">rocket_launch</span></div>
          <div>
            <p class="text-white font-medium">Мотиваційні нагадування</p>
            <p class="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">Mindset</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input class="sr-only peer notify-toggle" type="checkbox"/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>
    </div>
  </div>
  <div class="xl:col-span-4 space-y-6">
    <div class="bg-[#1f1e2a] p-6 rounded-2xl border border-white/5 h-full flex flex-col">
      <h3 class="font-bold text-xl text-white mb-6 flex items-center gap-2"><span class="material-symbols-outlined text-[#c4c0ff]">hub</span> Канали сповіщень</h3>
      <div class="space-y-4 flex-1">
        <div class="notify-channel p-4 rounded-xl border-l-4 border-[#c4c0ff] bg-[#292935] hover:translate-x-1 transition-transform cursor-pointer" data-state="active" id="channel-browser">
          <div class="flex items-center justify-between mb-2">
            <span class="material-symbols-outlined icon text-[#c4c0ff]">language</span>
            <span class="badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-[#c4c0ff]/20 text-[#c4c0ff] rounded">Active</span>
          </div>
          <p class="text-white font-bold">Браузер</p>
          <p class="status-text text-xs text-slate-400">Увімкнено</p>
        </div>
        <div class="notify-channel p-4 rounded-xl border-l-4 border-slate-700 bg-[#1b1a26] hover:translate-x-1 transition-transform cursor-pointer opacity-70" data-state="disabled" id="channel-email">
          <div class="flex items-center justify-between mb-2">
            <span class="material-symbols-outlined icon text-slate-500">mail</span>
            <span class="badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-[#343440] text-slate-500 rounded">Disabled</span>
          </div>
          <p class="text-white font-bold">Email</p>
          <p class="status-text text-xs text-slate-400">Вимкнено</p>
        </div>
        <div class="notify-channel p-4 rounded-xl border-l-4 border-slate-700 bg-[#1b1a26] hover:translate-x-1 transition-transform cursor-pointer opacity-70 group" data-state="disabled" data-locked="true" id="channel-mobile">
          <div class="absolute -right-2 -top-2 text-4xl rotate-12 opacity-5 text-[#4ddada] transition-transform group-hover:scale-110"><span class="material-symbols-outlined" style="font-size: 80px;">smartphone</span></div>
          <div class="flex items-center justify-between mb-2 relative z-10">
            <span class="material-symbols-outlined icon text-[#4ddada] opacity-50">smartphone</span>
            <span class="badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-[#4ddada]/10 text-[#4ddada] rounded">Coming soon</span>
          </div>
          <p class="text-white font-bold relative z-10">Мобільний</p>
          <p class="status-text text-xs text-slate-400 relative z-10">Незабаром</p>
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-white/5">
        <p class="text-xs text-[#c7c4d8] italic">Налаштуйте критичні сповіщення для отримання інформації навіть у режимі "Не турбувати".</p>
      </div>
    </div>
  </div>
</div>
<div class="mt-8 flex justify-start items-center gap-4 pt-4">
  <button id="save-notifications" class="px-8 py-3 bg-[#c4c0ff] hover:bg-[#8781ff] text-[#2000a4] font-bold rounded-xl shadow-lg shadow-[#c4c0ff]/20 active:scale-95 transition-all">Зберегти зміни</button>
  <button id="cancel-notifications" class="px-8 py-3 text-slate-400 font-medium hover:text-white transition-colors">Скасувати</button>
</div>
`;
}

function appearanceTab() {
  return `
<div class="mb-8">
  <h2 class="text-3xl font-black text-white tracking-tight mb-2">Вигляд</h2>
  <p class="text-[#c7c4d8] leading-relaxed max-w-2xl">Персоналізуй інтерфейс під свої вподобання</p>
</div>

<div class="space-y-12">
  <section>
    <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-[#c4c0ff] mb-6">Тема оформлення</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="relative group cursor-pointer theme-card" data-theme="dark">
        <div class="aspect-video rounded-2xl bg-[#0d0d18] border-2 border-[#c4c0ff] shadow-[0_0_20px_rgba(196,192,255,0.2)] p-4 flex flex-col justify-between overflow-hidden theme-box">
          <div class="flex gap-2"><div class="w-8 h-2 rounded-full bg-[#343440]"></div><div class="w-4 h-2 rounded-full bg-[#343440] opacity-50"></div></div>
          <div class="space-y-2"><div class="h-2 w-full bg-[#c4c0ff]/20 rounded"></div><div class="h-2 w-2/3 bg-[#c4c0ff]/20 rounded"></div></div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="font-bold text-white">Темна</span>
          <span class="material-symbols-outlined text-[#c4c0ff] text-sm theme-check" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>
      </div>
      <div class="relative group cursor-pointer theme-card" data-theme="light">
        <div class="aspect-video rounded-2xl bg-[#e3e0f1] p-4 flex flex-col justify-between border border-white/5 overflow-hidden theme-box">
          <div class="flex gap-2"><div class="w-8 h-2 rounded-full bg-[#c7c4d8]"></div><div class="w-4 h-2 rounded-full bg-[#c7c4d8]/50"></div></div>
          <div class="space-y-2"><div class="h-2 w-full bg-[#1b1a26]/20 rounded"></div><div class="h-2 w-2/3 bg-[#1b1a26]/20 rounded"></div></div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="font-medium text-slate-500">Світла</span>
        </div>
      </div>
      <div class="relative group opacity-50 grayscale cursor-not-allowed">
        <div class="aspect-video rounded-2xl overflow-hidden flex border border-white/5">
          <div class="flex-1 bg-[#0d0d18] p-4"></div>
          <div class="flex-1 bg-[#e3e0f1] p-4"></div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="font-medium text-slate-500">Авто</span>
          <span class="text-[10px] bg-[#343440] text-[#c7c4d8] px-2 py-0.5 rounded-full font-mono uppercase tracking-tighter">Незабаром</span>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-[#c4c0ff] mb-6">Акцентний колір</h3>
    <div class="flex flex-wrap gap-4" id="accent-presets-container">
      <button class="w-12 h-12 rounded-full bg-[#c4c0ff] ring-4 ring-[#c4c0ff]/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 accent-preset" data-hex="#c4c0ff" data-ring="ring-[#c4c0ff]/20">
        <span class="material-symbols-outlined text-[#12121d] text-xl font-bold">check</span>
      </button>
      <button class="w-12 h-12 rounded-full bg-[#3ECFCF] hover:ring-4 hover:ring-[#3ECFCF]/50 transition-all hover:scale-110 active:scale-95 accent-preset" data-hex="#3ECFCF" data-ring="ring-[#3ECFCF]/20"></button>
      <button class="w-12 h-12 rounded-full bg-[#FF6584] hover:ring-4 hover:ring-[#FF6584]/50 transition-all hover:scale-110 active:scale-95 accent-preset" data-hex="#FF6584" data-ring="ring-[#FF6584]/20"></button>
      <button class="w-12 h-12 rounded-full bg-[#FFD93D] hover:ring-4 hover:ring-[#FFD93D]/50 transition-all hover:scale-110 active:scale-95 accent-preset" data-hex="#FFD93D" data-ring="ring-[#FFD93D]/20"></button>
      <button class="w-12 h-12 rounded-full bg-[#4CAF50] hover:ring-4 hover:ring-[#4CAF50]/50 transition-all hover:scale-110 active:scale-95 accent-preset" data-hex="#4CAF50" data-ring="ring-[#4CAF50]/20"></button>
      <button class="w-12 h-12 rounded-full bg-[#9C27B0] hover:ring-4 hover:ring-[#9C27B0]/50 transition-all hover:scale-110 active:scale-95 accent-preset" data-hex="#9C27B0" data-ring="ring-[#9C27B0]/20"></button>
    </div>
  </section>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
    <section>
      <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-[#c4c0ff] mb-6">Розмір тексту</h3>
      <div class="bg-[#1b1a26] p-8 rounded-3xl">
        <div class="relative w-full h-1 bg-[#343440] rounded-full mb-6 mt-4">
          <div class="absolute w-full h-full inset-0 flex justify-between z-10">
             <div class="w-1/3 h-8 -mt-4 cursor-pointer text-size-click" data-size="14px" data-pos="0"></div>
             <div class="w-1/3 h-8 -mt-4 cursor-pointer text-size-click" data-size="16px" data-pos="50%"></div>
             <div class="w-1/3 h-8 -mt-4 cursor-pointer text-size-click" data-size="18px" data-pos="100%"></div>
          </div>
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-[#c4c0ff] rounded-full transition-all duration-300 pointer-events-none" id="text-slider-fill"></div>
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#c4c0ff] rounded-full ring-4 ring-[#c4c0ff]/20 transition-all duration-300 pointer-events-none" id="text-slider-thumb"></div>
          <div class="absolute left-0 top-6 text-xs font-mono text-slate-500 font-bold slider-label" id="label-small">Малий</div>
          <div class="absolute left-1/2 -translate-x-1/2 top-6 text-xs font-mono text-[#c4c0ff] font-bold slider-label" id="label-standard">Стандарт</div>
          <div class="absolute right-0 top-6 text-xs font-mono text-slate-500 font-bold slider-label" id="label-large">Великий</div>
        </div>
        <div class="mt-14 p-4 bg-[#0d0d18] rounded-xl border border-white/5">
          <p class="text-sm text-[#c7c4d8] italic">Прев'ю тексту: Ваші завдання будуть відображатися з таким розміром шрифту.</p>
        </div>
      </div>
    </section>
    
    <section class="space-y-6">
      <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-[#c4c0ff] mb-6">Додаткові налаштування</h3>
      <div class="flex items-center justify-between p-4 bg-[#1b1a26] rounded-2xl hover:bg-[#1f1e2a] transition-colors">
        <div>
          <h4 class="font-bold text-white mb-1">Компактний режим</h4>
          <p class="text-slate-400 text-xs">Зменшує відступи між елементами</p>
        </div>
        <div class="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="false"><div class="w-4 h-4 bg-slate-400 rounded-full transition-transform toggle-knob"></div></div>
      </div>
      <div class="flex items-center justify-between p-4 bg-[#1b1a26] rounded-2xl hover:bg-[#1f1e2a] transition-colors">
        <div>
          <h4 class="font-bold text-white mb-1">Анімації</h4>
          <p class="text-slate-400 text-xs">Плавні переходи та візуальні ефекти</p>
        </div>
        <div class="w-12 h-6 bg-[#c4c0ff] rounded-full relative cursor-pointer flex items-center px-1 toggle-switch" data-on="true"><div class="w-4 h-4 bg-[#2000a4] translate-x-6 rounded-full transition-transform toggle-knob"></div></div>
      </div>
    </section>
  </div>

  <div class="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
    <div class="flex items-start gap-4 p-4 bg-[#00b3b3]/10 border-l-2 border-[#4ddada] rounded-r-xl max-w-md">
      <span class="material-symbols-outlined text-[#4ddada] text-xl">auto_awesome</span>
      <p class="text-xs text-slate-300 leading-relaxed"><span class="text-[#4ddada] font-bold">Порада ПланІQ:</span> Темна тема та компактний режим найкраще підходять для вечірнього планування, зменшуючи навантаження на очі.</p>
    </div>
    <button id="save-appearance" class="w-full sm:w-auto px-10 py-4 bg-[#c4c0ff] hover:bg-[#8781ff] text-[#2000a4] font-bold rounded-2xl shadow-lg shadow-[#c4c0ff]/20 transition-all active:scale-95 flex items-center justify-center gap-2">Зберегти зміни</button>
  </div>
</div>
`;
}

function placeholderTab(title) {
  return `<div class="glass-card p-12 rounded-2xl text-center"><span class="material-symbols-outlined text-6xl text-[#c4c0ff]/30 mb-4">construction</span><h3 class="text-xl font-bold text-white mb-2">${title}</h3><p class="text-[#c7c4d8]">Ця секція знаходиться в розробці.</p></div>`;
}

export function initSettings() {
  const content = document.getElementById('settings-content');
  const tabs = document.querySelectorAll('.settings-tab');

  function showTab(tabId) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === tabId;
      t.className = `settings-tab flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#292935] text-[#c4c0ff] font-bold shadow-sm' : 'text-[#c7c4d8] hover:bg-[#1f1e2a]'}`;
    });

    if (tabId === 'profile') content.innerHTML = profileTab();
    else if (tabId === 'algorithm') content.innerHTML = algorithmTab();
    else if (tabId === 'hours') content.innerHTML = hoursTab();
    else if (tabId === 'notifications') content.innerHTML = notificationsTab();
    else if (tabId === 'appearance') content.innerHTML = appearanceTab();
    else if (tabId === 'security') content.innerHTML = securityTab();
    else content.innerHTML = placeholderTab({appearance:'Вигляд'}[tabId] || tabId);

    initTabInteractions();
  }

  function initTabInteractions() {
    const saveProfile = document.getElementById('save-profile');
    if (saveProfile) saveProfile.addEventListener('click', () => toast('Профіль збережено!', 'success'));

    const changePw = document.getElementById('change-pw');
    if (changePw) changePw.addEventListener('click', () => {
      const currentPw = document.getElementById('current-pw');
      const newPw = document.getElementById('new-pw');
      const confirmPw = document.getElementById('confirm-pw');
      const err = document.getElementById('pw-error');
      
      err.className = 'text-[#ffb2bc] text-sm font-medium mb-3 hidden';
      err.textContent = '';
      newPw.classList.remove('ring-2', 'ring-[#ffb2bc]/50');
      confirmPw.classList.remove('ring-2', 'ring-[#ffb2bc]/50');

      if (!currentPw.value || !newPw.value || !confirmPw.value) {
        err.textContent = 'Будь ласка, заповніть всі поля';
        err.classList.remove('hidden');
        return;
      }
      
      if (newPw.value !== confirmPw.value) {
        err.textContent = 'Новий пароль та підтвердження не співпадають!';
        err.classList.remove('hidden');
        newPw.classList.add('ring-2', 'ring-[#ffb2bc]/50');
        confirmPw.classList.add('ring-2', 'ring-[#ffb2bc]/50');
        return;
      }
      
      toast('Пароль успішно змінено!', 'success');
      currentPw.value = '';
      newPw.value = '';
      confirmPw.value = '';
    });

    const deleteAcc = document.getElementById('delete-account');
    if (deleteAcc) deleteAcc.addEventListener('click', () => {
      if (confirm('Ви впевнені, що хочете видалити акаунт?')) {
        clearAuth();
        window.location.hash = '#/landing';
      }
    });

    const saveAlgo = document.getElementById('save-algorithm');
    if (saveAlgo) saveAlgo.addEventListener('click', () => toast('Налаштування алгоритму збережено!', 'success'));

    document.querySelectorAll('.toggle-switch').forEach(sw => {
      sw.addEventListener('click', () => {
        const on = sw.dataset.on === 'true';
        const knob = sw.querySelector('.toggle-knob');
        if (on) {
          sw.dataset.on = 'false';
          sw.className = sw.className.replace('bg-[#c4c0ff]', 'bg-slate-700');
          knob.className = knob.className.replace('translate-x-6', 'translate-x-0').replace('bg-[#2000a4]', 'bg-slate-400');
        } else {
          sw.dataset.on = 'true';
          sw.className = sw.className.replace('bg-slate-700', 'bg-[#c4c0ff]');
          knob.className = knob.className.replace('translate-x-0', 'translate-x-6').replace('bg-slate-400', 'bg-[#2000a4]');
        }
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

    const saveHours = document.getElementById('save-hours');
    if (saveHours) saveHours.addEventListener('click', () => toast('Графік робочих годин збережено!', 'success'));

    const setGridHours = (startIdx, endIdx) => {
      document.querySelectorAll('.hours-cell').forEach(cell => {
        const h = parseInt(cell.dataset.hour);
        const shouldAct = h >= startIdx && h < endIdx;
        if (shouldAct) {
          cell.className = 'h-full bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/20 rounded-sm cursor-pointer hover:brightness-125 transition-colors hours-cell active-cell';
        } else {
          cell.className = 'h-full bg-[#343440] border border-white/5 rounded-sm cursor-pointer hover:brightness-125 transition-colors hours-cell';
        }
      });
    };

    document.querySelectorAll('.hours-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const isActive = cell.classList.contains('active-cell');
        if (isActive) {
          cell.className = 'h-full bg-[#343440] border border-white/5 rounded-sm cursor-pointer hover:brightness-125 transition-colors hours-cell';
        } else {
          cell.className = 'h-full bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/20 rounded-sm cursor-pointer hover:brightness-125 transition-colors hours-cell active-cell';
        }
      });
    });

    const clearHours = document.getElementById('clear-hours');
    if (clearHours) clearHours.addEventListener('click', () => {
      setGridHours(-1, -1);
      toast('Щотижневий графік очищено', 'info');
    });

    const defaultHours = document.getElementById('default-hours');
    if (defaultHours) defaultHours.addEventListener('click', () => {
      setGridHours(3, 12);
      toast('Пресет "Робочі дні 9-18" застосовано', 'success');
    });

    const presetCards = document.querySelectorAll('.preset-card');
    presetCards.forEach(card => {
      card.addEventListener('click', () => {
        presetCards.forEach(c => {
          c.className = 'glass-card preset-card p-5 rounded-2xl border border-white/5 hover:border-[#c4c0ff]/50 transition-all cursor-pointer';
          const check = c.querySelector('.text-\\[\\#c4c0ff\\].material-symbols-outlined.check_circle');
          if (check && !c.querySelector('div').contains(check)) check.remove();
        });
        
        card.className = 'bg-[#343440]/40 p-5 rounded-2xl border border-[#c4c0ff]/40 transition-all glow-primary preset-card active-preset';
        if(!card.innerHTML.includes('check_circle')) {
            card.querySelector('.flex.items-center.gap-4').innerHTML += '<span class="ml-auto material-symbols-outlined text-[#c4c0ff] check_circle" style="font-variation-settings: \'FILL\' 1;">check_circle</span>';
        }

        const title = card.querySelector('h4').textContent;
        if (title.includes('Ранкова')) setGridHours(0, 9);
        else if (title.includes('Нічна')) setGridHours(10, 19);
        else setGridHours(3, 12);
        
        toast('Пресет графіку застосовано!', 'success');
      });
    });

    const lunchToggle = document.getElementById('lunch-toggle');
    if (lunchToggle) {
      lunchToggle.addEventListener('change', (e) => {
        const block = document.getElementById('lunch-block');
        if (!e.target.checked) {
          block.classList.add('opacity-50', 'pointer-events-none', 'grayscale');
          toast('Обідня перерва вимкнена', 'info');
        } else {
          block.classList.remove('opacity-50', 'pointer-events-none', 'grayscale');
          toast('Обідня перерва увімкнена', 'success');
        }
      });
    }

    const saveNotif = document.getElementById('save-notifications');
    if (saveNotif) saveNotif.addEventListener('click', () => toast('Налаштування сповіщень збережено!', 'success'));

    const cancelNotif = document.getElementById('cancel-notifications');
    if (cancelNotif) cancelNotif.addEventListener('click', () => toast('Зміни скасовано', 'info'));
    
    document.querySelectorAll('.notify-toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        if (e.target.checked) toast('Опцію сповіщень увімкнено', 'success');
        else toast('Опцію сповіщень вимкнено', 'info');
      });
    });

    document.querySelectorAll('.notify-channel').forEach(channel => {
      channel.addEventListener('click', () => {
        if (channel.dataset.locked === "true") {
          toast('Цей канал ще розробляється', 'info');
          return;
        }
        
        const isEmail = channel.id === 'channel-email';
        const colorClassText = isEmail ? 'text-[#4ddada]' : 'text-[#c4c0ff]';
        const colorClassBg = isEmail ? 'bg-[#4ddada]/20' : 'bg-[#c4c0ff]/20';
        const colorClassBorder = isEmail ? 'border-[#4ddada]' : 'border-[#c4c0ff]';

        const state = channel.dataset.state;
        const icon = channel.querySelector('.icon');
        const badge = channel.querySelector('.badge');
        const statusText = channel.querySelector('.status-text');

        if (state === 'disabled') {
          channel.dataset.state = 'active';
          channel.className = `notify-channel p-4 rounded-xl border-l-4 ${colorClassBorder} bg-[#292935] hover:translate-x-1 transition-transform cursor-pointer`;
          icon.className = `material-symbols-outlined icon ${colorClassText}`;
          badge.className = `badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${colorClassBg} ${colorClassText} rounded`;
          badge.textContent = 'Active';
          statusText.textContent = 'Увімкнено';
          toast('Канал сповіщень увімкнено', 'success');
        } else {
          channel.dataset.state = 'disabled';
          channel.className = 'notify-channel p-4 rounded-xl border-l-4 border-slate-700 bg-[#1b1a26] hover:translate-x-1 transition-transform cursor-pointer opacity-70';
          icon.className = 'material-symbols-outlined icon text-slate-500';
          badge.className = 'badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-[#343440] text-slate-500 rounded';
          badge.textContent = 'Disabled';
          statusText.textContent = 'Вимкнено';
          toast('Канал сповіщень вимкнено', 'info');
        }
      });
    });

    const saveApp = document.getElementById('save-appearance');
    if (saveApp) saveApp.addEventListener('click', () => toast('Налаштування вигляду збережено!', 'success'));

    if (!document.getElementById('appearance-styles')) {
      const style = document.createElement('style');
      style.id = 'appearance-styles';
      style.textContent = `
        .light-mode { filter: invert(0.9) hue-rotate(180deg); background-color: #f1f2f8; }
        .light-mode img, .light-mode .avatar-preview, .light-mode .theme-box { filter: invert(1) hue-rotate(180deg); }
      `;
      document.head.appendChild(style);
    }

    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const theme = card.dataset.theme;
        document.querySelectorAll('.theme-card').forEach(c => {
          c.querySelector('.theme-box').classList.remove('border-2', 'border-[#c4c0ff]', 'shadow-[0_0_20px_rgba(196,192,255,0.2)]');
          c.querySelector('.theme-box').classList.add('border', 'border-white/5');
          const check = c.querySelector('.theme-check');
          if (check) check.remove();
          c.querySelector('span:first-of-type').classList.replace('font-bold', 'font-medium');
          c.querySelector('span:first-of-type').classList.replace('text-white', 'text-slate-500');
        });
        
        const box = card.querySelector('.theme-box');
        box.classList.replace('border', 'border-2');
        box.classList.replace('border-white/5', 'border-[#c4c0ff]');
        box.classList.add('shadow-[0_0_20px_rgba(196,192,255,0.2)]');
        
        card.querySelector('span:first-of-type').classList.replace('font-medium', 'font-bold');
        card.querySelector('span:first-of-type').classList.replace('text-slate-500', 'text-white');
        
        const checkHTML = '<span class="material-symbols-outlined text-[#c4c0ff] text-sm theme-check" style="font-variation-settings: \'FILL\' 1;">check_circle</span>';
        card.querySelector('.mt-3').innerHTML += checkHTML;

        if (theme === 'light') {
          document.documentElement.classList.add('light-mode');
          toast('Світла тема симульована', 'success');
        } else {
          document.documentElement.classList.remove('light-mode');
          toast('Темна тема увімкнена', 'success');
        }
      });
    });

    const installAccentStyle = (hex) => {
      let ds = document.getElementById('dynamic-accent');
      if(!ds) {
         ds = document.createElement('style');
         ds.id = 'dynamic-accent';
         document.head.appendChild(ds);
      }
      ds.textContent = `
         .bg-\\[\\#c4c0ff\\] { background-color: ${hex} !important; color: #12121d !important; }
         .text-\\[\\#c4c0ff\\] { color: ${hex} !important; }
         .border-\\[\\#c4c0ff\\] { border-color: ${hex} !important; }
         .ring-\\[\\#c4c0ff\\]\\/20 { --tw-ring-color: ${hex}33 !important; }
         .shadow-\\[\\#c4c0ff\\]\\/20 { --tw-shadow-color: ${hex}33 !important; }
         .from-\\[\\#c4c0ff\\] { --tw-gradient-from: ${hex} !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      `;
    };

    document.querySelectorAll('.accent-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.accent-preset').forEach(b => {
          b.innerHTML = '';
          b.className = b.className.replace('ring-4', '').replace(/ring-\[.*\]/, '').replace('hover:ring-4', 'hover:ring-2');
        });
        btn.innerHTML = '<span class="material-symbols-outlined text-[#12121d] text-xl font-bold">check</span>';
        btn.classList.add('ring-4', btn.dataset.ring);
        
        installAccentStyle(btn.dataset.hex);
        toast('Акцентний колір застосовано', 'success');
      });
    });

    document.querySelectorAll('.text-size-click').forEach(clickable => {
      clickable.addEventListener('click', () => {
        const size = clickable.dataset.size;
        const pos = clickable.dataset.pos;
        
        document.getElementById('text-slider-fill').style.width = pos;
        document.getElementById('text-slider-thumb').style.left = pos;
        
        document.querySelectorAll('.slider-label').forEach(lbl => {
          lbl.classList.replace('text-[#c4c0ff]', 'text-slate-500');
        });
        
        if (size === '14px') document.getElementById('label-small').classList.replace('text-slate-500', 'text-[#c4c0ff]');
        if (size === '16px') document.getElementById('label-standard').classList.replace('text-slate-500', 'text-[#c4c0ff]');
        if (size === '18px') document.getElementById('label-large').classList.replace('text-slate-500', 'text-[#c4c0ff]');

        document.documentElement.style.fontSize = size;
        toast(`Розмір шрифту оновлено до ${size}`, 'success');
      });
    });

    const avatarPreview = document.getElementById('avatar-preview');
    const avatarTrigger = document.getElementById('avatar-trigger');
    const avatarPopup = document.getElementById('avatar-popup');
    const uploadInput = document.getElementById('avatar-upload');
    const btnUpload = document.getElementById('btn-upload-photo');
    const btnRemove = document.getElementById('btn-remove-photo');
    
    if (avatarPreview && avatarPopup && uploadInput) {
      const defaultInitials = 'ОП';
      const baseGradient = 'from-[#6C63FF] to-[#3ECFCF]';

      const togglePopup = (e) => {
        e.stopPropagation();
        avatarPopup.classList.toggle('hidden');
      };

      avatarPreview.addEventListener('click', togglePopup);
      avatarTrigger.addEventListener('click', togglePopup);

      document.addEventListener('click', (e) => {
        if (!avatarPopup.contains(e.target) && e.target !== avatarPreview && e.target !== avatarTrigger) {
          avatarPopup.classList.add('hidden');
        }
      });

      btnUpload.addEventListener('click', () => {
        uploadInput.click();
        avatarPopup.classList.add('hidden');
      });

      uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            avatarPreview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover" />`;
            avatarPreview.className = 'w-32 h-32 rounded-full overflow-hidden border-4 border-[#292935] relative flex items-center justify-center hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-black/20 opacity-0 animate-fade-in';
            setTimeout(() => avatarPreview.classList.remove('opacity-0', 'animate-fade-in'), 300);
            toast('Аватар успішно оновлено', 'success');
          };
          reader.readAsDataURL(file);
        }
      });

      btnRemove.addEventListener('click', () => {
        avatarPreview.className = `w-32 h-32 rounded-full overflow-hidden border-4 border-[#292935] relative bg-gradient-to-tr ${baseGradient} flex items-center justify-center text-4xl font-black text-white hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-black/20`;
        avatarPreview.innerHTML = defaultInitials;
        uploadInput.value = '';
        avatarPopup.classList.add('hidden');
        toast('Фото видалено, встановлено стандартне', 'info');
      });

      document.querySelectorAll('.default-avatar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const color = e.target.dataset.color;
          avatarPreview.className = `w-32 h-32 rounded-full overflow-hidden border-4 border-[#292935] relative bg-gradient-to-tr ${color} flex items-center justify-center text-4xl font-black text-white hover:brightness-110 transition-all cursor-pointer shadow-xl shadow-black/20`;
          avatarPreview.innerHTML = defaultInitials;
          avatarPopup.classList.add('hidden');
          toast('Аватар змінено на стандартний', 'success');
        });
      });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showTab(tab.dataset.tab);
    });
  });

  showTab('profile');
}
