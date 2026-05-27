import { toast } from '../services/toast.js';
import { preferencesStore } from '../services/preferences-store.js';

export function renderOnboarding() {
  return `
<main class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
  <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c4c0ff]/10 blur-[120px] rounded-full z-0"></div>
  <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ddada]/10 blur-[120px] rounded-full z-0"></div>

  <div class="relative z-10 w-full max-w-[800px] flex flex-col gap-8">
    <header class="flex justify-between items-center w-full px-6 py-4">
      <span class="text-xl font-bold tracking-widest text-[#6C63FF]">ПланІQ</span>
    </header>

    <div class="px-6 flex flex-col gap-2">
      <div class="flex justify-between items-center mb-1">
        <span id="onb-step-label" class="text-[10px] font-medium tracking-widest text-[#c4c0ff] uppercase">Крок 1 з 2</span>
        <span class="text-[10px] font-medium text-slate-500 uppercase">Прогрес налаштування</span>
      </div>
      <div class="flex gap-2 h-1.5 w-full">
        <div id="onb-bar-1" class="flex-1 bg-[#8781ff] rounded-full shadow-[0_0_8px_rgba(108,99,255,0.4)]"></div>
        <div id="onb-bar-2" class="flex-1 bg-[#343440] rounded-full"></div>
      </div>
    </div>

    <section class="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#c4c0ff]/10 blur-[100px] rounded-full"></div>
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4ddada]/5 blur-[100px] rounded-full"></div>
      <div class="relative z-10" id="onb-step-content"></div>
      <div class="mt-12 pt-8 border-t border-[#464555]/10 flex justify-between items-center">
        <button id="onb-back" class="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden" style="position:relative;z-index:50">← Назад</button>
        <button id="onb-skip" class="text-slate-400 hover:text-white text-sm font-medium transition-colors" style="position:relative;z-index:50">Пропустити</button>
        <button id="onb-next" class="bg-[#c4c0ff] hover:bg-[#e3dfff] text-[#1b0091] font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#c4c0ff]/10">
          Далі <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </section>

    <footer class="text-center py-4">
      <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">ПланІQ • Дипломний проєкт 2026</p>
    </footer>
  </div>
</main>`;
}

function renderStep1(wh, workDays) {
  const days = [
    { label: 'Пн', value: 0 },
    { label: 'Вт', value: 1 },
    { label: 'Ср', value: 2 },
    { label: 'Чт', value: 3 },
    { label: 'Пт', value: 4 },
    { label: 'Сб', value: 5 },
    { label: 'Нд', value: 6 },
  ];

  return `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Налаштуй свій графік</h1>
      <p class="text-[#c7c4d8]">Вкажи робочі дні та години — система планує задачі тільки в цей час.</p>
    </div>
    <div class="space-y-6">
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Робочі дні</p>
        <div class="grid grid-cols-7 gap-2">
          ${days.map(day => `
            <button type="button"
              class="work-day-btn py-3 rounded-xl text-sm font-black border transition-all ${workDays.includes(day.value)
                ? 'active bg-[#6C63FF]/30 border-[#c4c0ff]/40 text-white'
                : 'bg-[#0d0d18] border-white/5 text-slate-500 hover:text-white hover:bg-[#292935]'
              }" data-day="${day.value}">
              ${day.label}
            </button>
          `).join('')}
        </div>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Робочий час</p>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Початок</label>
            <input type="time" id="onb-work-start" value="${wh.start}"
              class="w-full bg-[#0d0d18] border border-white/5 rounded-xl px-4 py-3 text-white font-mono outline-none focus:ring-2 focus:ring-[#c4c0ff]/30" />
          </div>
          <div>
            <label class="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Кінець</label>
            <input type="time" id="onb-work-end" value="${wh.end}"
              class="w-full bg-[#0d0d18] border border-white/5 rounded-xl px-4 py-3 text-white font-mono outline-none focus:ring-2 focus:ring-[#c4c0ff]/30" />
          </div>
        </div>
      </div>
    </div>`;
}

function renderStep2(protectPeak) {
  return `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Коли ти на піку?</h1>
      <p class="text-[#c7c4d8]">Система ставитиме складні задачі саме в цей час.</p>
    </div>
    <div class="space-y-6">
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Пікові години</p>
        <div class="grid grid-cols-3 gap-3" id="peak-selector">
          <button class="peak-btn p-4 rounded-xl border transition-all text-center bg-[#0d0d18] border-white/5 hover:border-[#c4c0ff]/40" data-peak="morning">
            <div class="text-2xl mb-2">🌅</div>
            <p class="font-bold text-white text-sm">Ранок</p>
            <p class="text-xs text-slate-400 font-mono mt-1">09:00 — 11:00</p>
          </button>
          <button class="peak-btn p-4 rounded-xl border transition-all text-center bg-[#0d0d18] border-white/5 hover:border-[#c4c0ff]/40" data-peak="afternoon">
            <div class="text-2xl mb-2">☀️</div>
            <p class="font-bold text-white text-sm">День</p>
            <p class="text-xs text-slate-400 font-mono mt-1">13:00 — 15:00</p>
          </button>
          <button class="peak-btn p-4 rounded-xl border transition-all text-center bg-[#0d0d18] border-white/5 hover:border-[#c4c0ff]/40" data-peak="evening">
            <div class="text-2xl mb-2">🌙</div>
            <p class="font-bold text-white text-sm">Вечір</p>
            <p class="text-xs text-slate-400 font-mono mt-1">18:00 — 20:00</p>
          </button>
        </div>
      </div>
      <div class="flex items-center justify-between p-4 bg-[#1b1a26] rounded-xl border border-white/5">
        <div>
          <p class="font-bold text-white text-sm">Захищати пікові години</p>
          <p class="text-xs text-slate-400 mt-0.5">Складні задачі (7+) ставитимуться тільки в пікові години</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="onb-protect-peak" class="sr-only peer" ${protectPeak ? 'checked' : ''}/>
          <div class="w-11 h-6 bg-[#343440] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c4c0ff]"></div>
        </label>
      </div>
    </div>`;
}

export function initOnboarding() {
  let currentStep = 1;
  let savedWorkHours = { start: '09:00', end: '18:00' };
  let savedWorkDays = [0, 1, 2, 3, 4];

  const stepContent = document.getElementById('onb-step-content');
  const stepLabel   = document.getElementById('onb-step-label');
  const bar1        = document.getElementById('onb-bar-1');
  const bar2        = document.getElementById('onb-bar-2');
  const backBtn     = document.getElementById('onb-back');
  const skipBtn     = document.getElementById('onb-skip');
  const nextBtn     = document.getElementById('onb-next');

  const activeBar   = 'flex-1 bg-[#8781ff] rounded-full shadow-[0_0_8px_rgba(108,99,255,0.4)]';
  const inactiveBar = 'flex-1 bg-[#343440] rounded-full';

  function showStep(step) {
    currentStep = step;
    stepLabel.textContent = `Крок ${step} з 2`;
    bar1.className = step >= 1 ? activeBar : inactiveBar;
    bar2.className = step >= 2 ? activeBar : inactiveBar;

    backBtn.classList.toggle('hidden', step === 1);

    if (step === 2) {
      nextBtn.innerHTML = 'Завершити налаштування <span class="material-symbols-outlined text-sm">check_circle</span>';
      nextBtn.className = 'bg-[#4CAF82] hover:bg-[#45a076] text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95';
    } else {
      nextBtn.innerHTML = 'Далі <span class="material-symbols-outlined text-sm">arrow_forward</span>';
      nextBtn.className = 'bg-[#c4c0ff] hover:bg-[#e3dfff] text-[#1b0091] font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#c4c0ff]/10';
    }

    const prefs = preferencesStore.get();

    if (step === 1) {
      const wh = prefs?.work_hours || { start: '09:00', end: '18:00' };
      const workDays = prefs?.work_days?.length ? prefs.work_days : [0, 1, 2, 3, 4];
      stepContent.innerHTML = renderStep1(wh, workDays);
      document.querySelectorAll('.work-day-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const active = btn.classList.contains('active');
          if (active) {
            btn.classList.remove('active', 'bg-[#6C63FF]/30', 'border-[#c4c0ff]/40', 'text-white');
            btn.classList.add('bg-[#0d0d18]', 'border-white/5', 'text-slate-500');
          } else {
            btn.classList.add('active', 'bg-[#6C63FF]/30', 'border-[#c4c0ff]/40', 'text-white');
            btn.classList.remove('bg-[#0d0d18]', 'border-white/5', 'text-slate-500');
          }
        });
      });
    } else {
      const protectPeak = prefs?.protect_peak_hours ?? false;
      stepContent.innerHTML = renderStep2(protectPeak);
      document.querySelectorAll('.peak-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.peak-btn').forEach(b => {
            b.classList.remove('active', 'bg-[#6C63FF]/20', 'border-[#c4c0ff]/40');
            b.classList.add('bg-[#0d0d18]', 'border-white/5');
          });
          btn.classList.add('active', 'bg-[#6C63FF]/20', 'border-[#c4c0ff]/40');
          btn.classList.remove('bg-[#0d0d18]', 'border-white/5');
        });
      });
      const morning = document.querySelector('.peak-btn[data-peak="morning"]');
      if (morning) morning.click();
    }
  }

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  skipBtn.addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  nextBtn.addEventListener('click', async () => {
    if (currentStep < 2) {
      savedWorkHours = {
        start: document.getElementById('onb-work-start')?.value || '09:00',
        end:   document.getElementById('onb-work-end')?.value   || '18:00',
      };
      savedWorkDays = [...document.querySelectorAll('.work-day-btn.active')]
        .map(b => parseInt(b.dataset.day))
        .filter(d => !isNaN(d))
        .sort((a, b) => a - b);
      showStep(2);
      return;
    }

    nextBtn.disabled = true;
    nextBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Зберігаємо...';

    const selected = document.querySelector('.peak-btn.active');
    const peakMap = {
      morning:   ['09:00', '10:00', '11:00'],
      afternoon: ['13:00', '14:00', '15:00'],
      evening:   ['18:00', '19:00', '20:00'],
    };

    try {
      await preferencesStore.put({
        work_hours:         savedWorkHours,
        work_days:          savedWorkDays,
        peak_hours:         peakMap[selected?.dataset?.peak] || ['09:00', '10:00', '11:00'],
        protect_peak_hours: document.getElementById('onb-protect-peak')?.checked ?? false,
      });
      toast('Налаштування збережено! Ласкаво просимо! 🎉', 'success');
      setTimeout(() => { window.location.hash = '#/dashboard'; }, 400);
    } catch (err) {
      console.error('Onboarding save error:', err);
      toast('Не вдалося зберегти, але продовжуємо', 'info');
      setTimeout(() => { window.location.hash = '#/dashboard'; }, 400);
    } finally {
      nextBtn.disabled = false;
    }
  });

  preferencesStore.load().finally(() => showStep(1));
}