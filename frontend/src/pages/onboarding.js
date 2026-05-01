import { toast } from '../services/toast.js';

export function renderOnboarding() {
  return `
<main class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
  <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c4c0ff]/10 blur-[120px] rounded-full z-0"></div>
  <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ddada]/10 blur-[120px] rounded-full z-0"></div>

  <div class="relative z-10 w-full max-w-[800px] flex flex-col gap-8">
    <header class="flex justify-between items-center w-full px-6 py-4">
      <span class="text-xl font-bold tracking-widest text-[#6C63FF]">ПланІQ</span>
      <div class="flex items-center gap-4">
        <span class="material-symbols-outlined text-slate-400 cursor-pointer">help_outline</span>
      </div>
    </header>

    <div class="px-6 flex flex-col gap-2">
      <div class="flex justify-between items-center mb-1">
        <span id="onb-step-label" class="text-[10px] font-medium tracking-widest text-[#c4c0ff] uppercase">Крок 1 з 3</span>
        <span class="text-[10px] font-medium text-slate-500 uppercase">Прогрес налаштування</span>
      </div>
      <div class="flex gap-2 h-1.5 w-full">
        <div id="onb-bar-1" class="flex-1 bg-[#8781ff] rounded-full shadow-[0_0_8px_rgba(108,99,255,0.4)]"></div>
        <div id="onb-bar-2" class="flex-1 bg-[#343440] rounded-full"></div>
        <div id="onb-bar-3" class="flex-1 bg-[#343440] rounded-full"></div>
      </div>
    </div>

    <section class="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#c4c0ff]/10 blur-[100px] rounded-full"></div>
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4ddada]/5 blur-[100px] rounded-full"></div>

      <div class="relative z-10" id="onb-step-content"></div>

      <div class="mt-12 pt-8 border-t border-[#464555]/10 flex justify-between items-center">
        <button id="onb-back" class="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden">
          ← Назад
        </button>
        <button id="onb-skip" class="text-slate-400 hover:text-white text-sm font-medium transition-colors">
          Пропустити
        </button>
        <button id="onb-next" class="bg-[#c4c0ff] hover:bg-[#e3dfff] text-[#1b0091] font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#c4c0ff]/10">
          Далі
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </section>

    <footer class="text-center py-4">
      <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">Керовано вашим фокусом • ПланІQ 2024</p>
    </footer>
  </div>
</main>`;
}

function renderStep1() {
  return `
    <div class="mb-10 text-center md:text-left">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">Налаштуй свій ритм</h1>
      <p class="text-[#c7c4d8] text-lg max-w-md">Вкажи, коли ти зазвичай працюєш. Це допоможе AI ПланІQ підібрати ідеальний час для твоїх завдань.</p>
    </div>
    <div class="flex flex-col gap-6 overflow-x-auto pb-4">
      <div class="inline-grid grid-cols-[auto_repeat(7,1fr)] gap-2 min-w-[600px]" id="schedule-grid">
        <div></div>
        <div class="text-center text-[11px] font-bold text-slate-400 pb-2">ПН</div>
        <div class="text-center text-[11px] font-bold text-slate-400 pb-2">ВТ</div>
        <div class="text-center text-[11px] font-bold text-slate-400 pb-2">СР</div>
        <div class="text-center text-[11px] font-bold text-slate-400 pb-2">ЧТ</div>
        <div class="text-center text-[11px] font-bold text-slate-400 pb-2">ПТ</div>
        <div class="text-center text-[11px] font-bold text-[#ffb2bc] pb-2">СБ</div>
        <div class="text-center text-[11px] font-bold text-[#ffb2bc] pb-2">НД</div>
      </div>
    </div>
    <div class="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="flex gap-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-[#8781ff] shadow-[0_0_8px_rgba(108,99,255,0.4)]"></div>
          <span class="text-xs font-medium text-[#c7c4d8]">Робочий час</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-[#252540]"></div>
          <span class="text-xs font-medium text-[#c7c4d8]">Вільний час</span>
        </div>
      </div>
      <div class="flex items-start gap-3 p-4 rounded-xl bg-[#343440]/40 border-l-2 border-[#4ddada] max-w-xs">
        <span class="material-symbols-outlined text-[#4ddada] text-sm">psychology</span>
        <p class="text-[11px] text-[#c7c4d8] leading-relaxed">
          <span class="text-[#4ddada] font-bold">Порада:</span> Більшість користувачів продуктивніші зранку. Спробуй виділити 09:00-11:00 для глибокої роботи.
        </p>
      </div>
    </div>`;
}

function renderStep2() {
  return `
    <div class="mb-10 text-center md:text-left">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">Що ти плануєш?</h1>
      <p class="text-[#c7c4d8] text-lg max-w-md">Обери категорії, які найчастіше зустрічаються у твоєму житті. Це допоможе AI краще організувати твої задачі.</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="category-grid">
      <button class="category-btn selected p-5 rounded-2xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95" data-cat="university">
        <span class="text-3xl">🎓</span>
        <span class="text-sm font-bold text-white">Університет</span>
      </button>
      <button class="category-btn p-5 rounded-2xl bg-[#1b1a26] border border-[#464555]/20 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 hover:border-[#6C63FF]/30" data-cat="work">
        <span class="text-3xl">💼</span>
        <span class="text-sm font-bold text-white">Робота</span>
      </button>
      <button class="category-btn selected p-5 rounded-2xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95" data-cat="personal">
        <span class="text-3xl">🏠</span>
        <span class="text-sm font-bold text-white">Особисте</span>
      </button>
      <button class="category-btn p-5 rounded-2xl bg-[#1b1a26] border border-[#464555]/20 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 hover:border-[#6C63FF]/30" data-cat="fitness">
        <span class="text-3xl">🏋️</span>
        <span class="text-sm font-bold text-white">Спорт</span>
      </button>
      <button class="category-btn p-5 rounded-2xl bg-[#1b1a26] border border-[#464555]/20 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 hover:border-[#6C63FF]/30" data-cat="hobby">
        <span class="text-3xl">🎨</span>
        <span class="text-sm font-bold text-white">Хобі</span>
      </button>
      <button class="category-btn p-5 rounded-2xl bg-[#1b1a26] border border-[#464555]/20 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 hover:border-[#6C63FF]/30" data-cat="health">
        <span class="text-3xl">❤️</span>
        <span class="text-sm font-bold text-white">Здоров'я</span>
      </button>
    </div>
    <p class="mt-6 text-xs text-slate-500 text-center">Обери щонайменше 1 категорію. Ти зможеш змінити це пізніше.</p>`;
}

function renderStep3() {
  return `
    <div class="px-0 pb-6">
      <div class="flex justify-between items-end mb-2">
        <h1 class="text-3xl font-bold tracking-tight text-white">Коли ти на піку?</h1>
        <span class="mono text-[#4ddada] text-sm font-medium">3 з 3</span>
      </div>
      <p class="text-[#c7c4d8]">Система поставить складні задачі саме в цей час</p>
    </div>
    <div class="relative bg-[#0d0d18] rounded-2xl p-6 border border-[#464555]/20 mb-8">
      <div class="flex justify-between items-center mb-6">
        <span class="mono text-xs text-slate-500">06:00</span>
        <div class="h-[1px] flex-1 mx-4 bg-gradient-to-r from-transparent via-[#464555] to-transparent"></div>
        <span class="mono text-xs text-slate-500">24:00</span>
      </div>
      <div class="grid grid-cols-[repeat(18,1fr)] h-32 w-full gap-1 items-end">
        <div class="bg-[#343440] rounded-t-lg h-1/4 transition-all hover:bg-[#c4c0ff]/20"></div>
        <div class="bg-[#343440] rounded-t-lg h-1/3 transition-all hover:bg-[#c4c0ff]/20"></div>
        <div class="energy-mid rounded-t-lg h-1/2 opacity-60"></div>
        <div class="energy-mid rounded-t-lg h-2/3 opacity-80"></div>
        <div class="energy-peak rounded-t-lg h-5/6"></div>
        <div class="energy-peak rounded-t-lg h-full"></div>
        <div class="energy-peak rounded-t-lg h-5/6"></div>
        <div class="energy-mid rounded-t-lg h-3/4"></div>
        <div class="energy-mid rounded-t-lg h-2/3"></div>
        <div class="bg-[#343440] rounded-t-lg h-1/2"></div>
        <div class="bg-[#343440] rounded-t-lg h-1/3"></div>
        <div class="energy-low rounded-t-lg h-1/4 opacity-40"></div>
        <div class="energy-low rounded-t-lg h-1/5 opacity-40"></div>
        <div class="energy-mid rounded-t-lg h-1/3"></div>
        <div class="energy-peak rounded-t-lg h-2/3"></div>
        <div class="energy-peak rounded-t-lg h-3/4"></div>
        <div class="energy-mid rounded-t-lg h-1/2"></div>
        <div class="bg-[#343440] rounded-t-lg h-1/4"></div>
      </div>
      <div class="flex justify-between mt-4 px-1">
        <span class="mono text-[10px] text-slate-600">Ранок</span>
        <span class="mono text-[10px] text-slate-600">День</span>
        <span class="mono text-[10px] text-slate-600">Вечір</span>
        <span class="mono text-[10px] text-slate-600">Ніч</span>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4 mb-8">
      <button class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#1b1a26] border border-[#464555]/30 hover:bg-[#292935] transition-all active:scale-95">
        <div class="w-4 h-4 rounded-full bg-[#7f1d1d]"></div>
        <span class="font-medium text-sm">Низька</span>
      </button>
      <button class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#1b1a26] border border-[#464555]/30 hover:bg-[#292935] transition-all active:scale-95">
        <div class="w-4 h-4 rounded-full bg-[#d97706]"></div>
        <span class="font-medium text-sm">Середня</span>
      </button>
      <button class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#c4c0ff]/10 border border-[#c4c0ff]/30 hover:bg-[#c4c0ff]/20 transition-all active:scale-95">
        <div class="w-4 h-4 rounded-full energy-peak"></div>
        <span class="font-bold text-sm text-[#c4c0ff]">Висока/Пік</span>
      </button>
    </div>
    <div class="bg-[#343440]/40 border-l-2 border-[#4ddada] p-5 rounded-r-xl relative overflow-hidden group">
      <div class="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-[#4ddada] animate-pulse">insights</span>
      </div>
      <div class="flex gap-4">
        <span class="text-xl">💡</span>
        <div>
          <p class="text-sm font-medium text-white mb-1">Порада:</p>
          <p class="text-sm text-[#c7c4d8] leading-relaxed opacity-90">Більшість людей мають пік між <span class="text-[#4ddada] mono">09:00</span> і <span class="text-[#4ddada] mono">12:00</span>. Спробуй позначити цей період як свій "Пік" для максимальної продуктивності.</p>
        </div>
      </div>
    </div>`;
}

function buildScheduleGrid() {
  const grid = document.getElementById('schedule-grid');
  if (!grid) return;
  for (let h = 6; h <= 24; h++) {
    const timeStr = h < 10 ? `0${h}:00` : `${h}:00`;
    const timeDiv = document.createElement('div');
    timeDiv.className = 'text-[10px] font-mono text-slate-500 flex items-center pr-4 h-[28px]';
    timeDiv.textContent = timeStr;
    grid.appendChild(timeDiv);
    for (let d = 0; d < 7; d++) {
      const cell = document.createElement('div');
      const isActive = (h >= 9 && h <= 18 && d < 5);
      cell.className = `grid-cell rounded-md cursor-pointer ${isActive ? 'active bg-[#8781ff]/80 border border-[#c4c0ff]/20' : 'bg-[#252540] hover:bg-[#2f2f50]'}`;
      cell.addEventListener('click', () => {
        cell.classList.toggle('active');
        cell.classList.toggle('bg-[#8781ff]/80');
        cell.classList.toggle('border');
        cell.classList.toggle('border-[#c4c0ff]/20');
        cell.classList.toggle('bg-[#252540]');
      });
      grid.appendChild(cell);
    }
  }
}

export function initOnboarding() {
  let currentStep = 1;
  const stepContent = document.getElementById('onb-step-content');
  const stepLabel = document.getElementById('onb-step-label');
  const bar1 = document.getElementById('onb-bar-1');
  const bar2 = document.getElementById('onb-bar-2');
  const bar3 = document.getElementById('onb-bar-3');
  const backBtn = document.getElementById('onb-back');
  const skipBtn = document.getElementById('onb-skip');
  const nextBtn = document.getElementById('onb-next');

  function showStep(step) {
    currentStep = step;
    stepLabel.textContent = `Крок ${step} з 3`;

    const activeClass = 'bg-[#8781ff] rounded-full shadow-[0_0_8px_rgba(108,99,255,0.4)]';
    const inactiveClass = 'bg-[#343440] rounded-full';

    [bar1, bar2, bar3].forEach((bar, i) => {
      bar.className = `flex-1 ${i < step ? activeClass : inactiveClass}`;
    });

    backBtn.classList.toggle('hidden', step === 1);

    if (step === 3) {
      nextBtn.innerHTML = 'Завершити налаштування <span class="material-symbols-outlined text-sm">check_circle</span>';
      nextBtn.className = 'bg-[#4CAF82] hover:bg-[#45a076] text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-[#4CAF82]/20 transition-all hover:translate-y-[-2px] active:scale-95';
    } else {
      nextBtn.innerHTML = 'Далі <span class="material-symbols-outlined text-sm">arrow_forward</span>';
      nextBtn.className = 'bg-[#c4c0ff] hover:bg-[#e3dfff] text-[#1b0091] font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#c4c0ff]/10';
    }

    if (step === 1) {
      stepContent.innerHTML = renderStep1();
      buildScheduleGrid();
    } else if (step === 2) {
      stepContent.innerHTML = renderStep2();
      initCategoryGrid();
    } else {
      stepContent.innerHTML = renderStep3();
    }
  }

  function initCategoryGrid() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        btn.classList.toggle('bg-[#6C63FF]/20');
        btn.classList.toggle('border-[#6C63FF]/40');
        btn.classList.toggle('bg-[#1b1a26]');
        btn.classList.toggle('border-[#464555]/20');
      });
    });
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < 3) {
      showStep(currentStep + 1);
    } else {
      toast('Налаштування завершено! Ласкаво просимо!', 'success');
      setTimeout(() => { window.location.hash = '#/dashboard'; }, 400);
    }
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  skipBtn.addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  showStep(1);
}
