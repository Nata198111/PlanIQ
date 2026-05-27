import { renderFooter } from '../components/footer.js';

export function renderLanding() {
  return `
<nav class="fixed top-0 w-full z-50 bg-[#0F0F1A]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
  <div class="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
    <div class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
      <span class="text-[#6C63FF] material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">insights</span>
      ПланІQ
    </div>
    <div class="hidden md:flex items-center gap-8 font-bold text-lg tracking-wide">
      <a class="text-[#6C63FF] font-semibold hover:drop-shadow-[0_0_8px_rgba(108,99,255,0.5)] transition-all active:scale-95 duration-200" href="#/landing">Головна</a>
      <a class="..." href="#" onclick="document.getElementById('about')?.scrollIntoView({behavior:'smooth'});return false;">Про проєкт</a>
      <a class="..." href="#" onclick="document.getElementById('features')?.scrollIntoView({behavior:'smooth'});return false;">Можливості</a>
    </div>
    <div class="flex items-center gap-4">
      <a href="#/login" class="text-slate-400 font-medium hover:text-white transition-colors active:scale-95 duration-200 px-4 py-2">Увійти</a>
      <a href="#/register" class="bg-[#6C63FF] text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all active:scale-95 duration-200 inline-block">Реєстрація</a>
    </div>
  </div>
</nav>

<main class="relative pt-20">
  <section class="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
    <div class="absolute inset-0 hero-gradient -z-10"></div>
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c4c0ff]/10 blur-[120px] rounded-full animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4ddada]/10 blur-[120px] rounded-full"></div>
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#292935] border border-[#464555]/20 text-[#4ddada] font-mono text-xs uppercase tracking-widest mb-4">
        <span class="w-2 h-2 rounded-full bg-[#4ddada] animate-pulse"></span>
        Нове покоління планування
      </div>
      <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none">
        План<span class="text-[#c4c0ff] drop-shadow-[0_0_15px_rgba(108,99,255,0.3)]">ІQ</span>
      </h1>
      <p class="text-3xl md:text-5xl font-bold text-[#c7c4d8] leading-tight max-w-3xl mx-auto">
        Плануй розумно. <br/>
        <span class="text-white">Досягай більше.</span>
      </p>
      <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
        Система, що адаптується до твого ритму життя, перетворюючи хаос завдань на структурований потік досягнень.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
        <a href="#/register" class="group relative px-8 py-4 bg-[#c4c0ff] text-[#2000a4] font-bold text-lg rounded-3xl hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] transition-all duration-300 active:scale-95 inline-block">
          Спробувати
          <span class="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </a>
        <a href="#/login" class="px-8 py-4 bg-[#292935] text-white font-bold text-lg rounded-3xl hover:bg-[#343440] transition-all active:scale-95 inline-block">
          Увійти
        </a>
      </div>
    </div>
    <div class="flex flex-col items-center gap-2 text-slate-500 pt-12 pb-4">
      <span class="font-mono text-[10px] uppercase tracking-widest">Дослідити</span>
      <span class="material-symbols-outlined animate-bounce">expand_more</span>
    </div>
  </section>

  <section id="features" class="max-w-7xl mx-auto px-6 py-24">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="group relative p-8 rounded-3xl bg-[#1b1a26] hover:bg-[#1f1e2a] transition-all duration-500 overflow-hidden glow-effect">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-[#c4c0ff]/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div class="relative z-10 space-y-6">
          <div class="w-14 h-14 rounded-2xl bg-[#8781ff]/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-[#c4c0ff] text-3xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight">Розумне планування</h3>
          <p class="text-[#c7c4d8] leading-relaxed">
            Алгоритм сам розставить задачі у твій графік, враховуючи пріоритети та вільні вікна.
          </p>
        </div>
      </div>
      <div class="group relative p-8 rounded-3xl bg-[#1b1a26] hover:bg-[#1f1e2a] transition-all duration-500 overflow-hidden glow-effect">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-[#4ddada]/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div class="relative z-10 space-y-6">
          <div class="w-14 h-14 rounded-2xl bg-[#00b3b3]/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-[#4ddada] text-3xl" style="font-variation-settings: 'FILL' 1;">priority_high</span>
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight">Пріоритизація</h3>
          <p class="text-[#c7c4d8] leading-relaxed">
            Найважливіше завжди буде першим. Система фокусує твою увагу на тому, що дійсно має значення.
          </p>
        </div>
      </div>
      <div class="group relative p-8 rounded-3xl bg-[#1b1a26] hover:bg-[#1f1e2a] transition-all duration-500 overflow-hidden glow-effect">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-[#ffb2bc]/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div class="relative z-10 space-y-6">
          <div class="w-14 h-14 rounded-2xl bg-[#f35c7b]/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-[#ffb2bc] text-3xl" style="font-variation-settings: 'FILL' 1;">hub</span>
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight">AI декомпозиція</h3>
          <p class="text-[#c7c4d8] leading-relaxed">
            Розбивай складні задачі на підзадачі автоматично. Штучний інтелект аналізує завдання і пропонує структурований план виконання.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
    <div class="text-center mb-16 space-y-4">
      <h2 class="text-4xl md:text-5xl font-black text-white">Як це працює</h2>
      <div class="h-1 w-24 bg-[#c4c0ff] rounded-full mx-auto"></div>
      <p class="text-lg text-slate-400 max-w-xl mx-auto">Три кроки до структурованого робочого дня</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      <!-- Лінія між кроками -->
      <div class="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#c4c0ff]/0 via-[#c4c0ff]/30 to-[#c4c0ff]/0"></div>

      <div class="relative p-8 rounded-3xl bg-[#1b1a26] border border-white/5 text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-[#c4c0ff]/20 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-[#c4c0ff] text-3xl" style="font-variation-settings: 'FILL' 1;">add_task</span>
        </div>
        <div class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#c4c0ff] text-[#2000a4] font-black text-sm flex items-center justify-center shadow-lg">1</div>
        <h3 class="text-xl font-bold text-white">Додай задачі</h3>
        <p class="text-slate-400 leading-relaxed">Створи задачі з дедлайнами, пріоритетами та тривалістю. Або розбий складну задачу на підзадачі через AI.</p>
      </div>

      <div class="relative p-8 rounded-3xl bg-[#1b1a26] border border-white/5 text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-[#4ddada]/20 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-[#4ddada] text-3xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <div class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#4ddada] text-[#0d0d18] font-black text-sm flex items-center justify-center shadow-lg">2</div>
        <h3 class="text-xl font-bold text-white">Натисни "Запланувати"</h3>
        <p class="text-slate-400 leading-relaxed">Система автоматично розподілить задачі по твоєму робочому графіку з урахуванням пріоритетів і дедлайнів.</p>
      </div>

      <div class="relative p-8 rounded-3xl bg-[#1b1a26] border border-white/5 text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-[#ffb2bc]/20 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-[#ffb2bc] text-3xl" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
        </div>
        <div class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#ffb2bc] text-[#1b1a26] font-black text-sm flex items-center justify-center shadow-lg">3</div>
        <h3 class="text-xl font-bold text-white">Отримай готовий план</h3>
        <p class="text-slate-400 leading-relaxed">Переглядай розклад у календарі, отримуй сповіщення про дедлайни і виконуй задачі вчасно.</p>
      </div>
    </div>
  </section>
  <section id="about" class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
    <div class="max-w-3xl mx-auto text-center space-y-6">
      <h2 class="text-4xl font-black text-white">Про проєкт</h2>
      <div class="h-1 w-24 bg-[#c4c0ff] rounded-full mx-auto"></div>
      <p class="text-lg text-slate-400 leading-relaxed">
        PlanIQ — дипломний проєкт з розробки системи інтелектуального планування задач. 
        Веб-застосунок з AI-підтримкою для автоматичного розподілу завдань у робочому графіку користувача.
      </p>
      <div class="flex flex-wrap justify-center gap-3 pt-4">
        <span class="px-4 py-2 rounded-full bg-[#292935] text-[#c4c0ff] text-sm font-mono">FastAPI</span>
        <span class="px-4 py-2 rounded-full bg-[#292935] text-[#c4c0ff] text-sm font-mono">MongoDB</span>
        <span class="px-4 py-2 rounded-full bg-[#292935] text-[#c4c0ff] text-sm font-mono">Gemini AI</span>
        <span class="px-4 py-2 rounded-full bg-[#292935] text-[#c4c0ff] text-sm font-mono">Vanilla JS</span>
        <span class="px-4 py-2 rounded-full bg-[#292935] text-[#c4c0ff] text-sm font-mono">Tailwind CSS</span>
      </div>
      <p class="text-sm text-slate-500 font-mono pt-4">Дипломний проєкт · 2026</p>
    </div>
  </section>
</main>

${renderFooter()}`;
}
