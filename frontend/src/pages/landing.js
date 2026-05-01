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
      <a class="text-slate-400 hover:text-[#6C63FF] hover:drop-shadow-[0_0_8px_rgba(108,99,255,0.5)] transition-all active:scale-95 duration-200" href="#">Про нас</a>
      <a class="text-slate-400 hover:text-[#6C63FF] hover:drop-shadow-[0_0_8px_rgba(108,99,255,0.5)] transition-all active:scale-95 duration-200" href="#">Тарифи</a>
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
          Розпочати безкоштовно
          <span class="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </a>
        <a href="#/login" class="px-8 py-4 bg-[#292935] text-white font-bold text-lg rounded-3xl hover:bg-[#343440] transition-all active:scale-95 inline-block">
          Увійти
        </a>
      </div>
    </div>
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
      <span class="font-mono text-[10px] uppercase tracking-widest">Дослідити</span>
      <span class="material-symbols-outlined animate-bounce">expand_more</span>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-6 py-24">
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
            <span class="material-symbols-outlined text-[#ffb2bc] text-3xl" style="font-variation-settings: 'FILL' 1;">psychology</span>
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight">Адаптація</h3>
          <p class="text-[#c7c4d8] leading-relaxed">
            Система навчається твоєму темпу роботи та автоматично коригує дедлайни під твої можливості.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
    <div class="flex flex-col lg:flex-row items-center gap-16">
      <div class="flex-1 space-y-8">
        <div class="space-y-4">
          <h2 class="text-4xl md:text-5xl font-black text-white leading-tight">Простір для глибокої концентрації</h2>
          <div class="h-1 w-24 bg-[#c4c0ff] rounded-full"></div>
        </div>
        <p class="text-xl text-slate-400 font-medium">
          Ми відмовилися від хаотичних інтерфейсів на користь чистоти та фокусу. Ваш робочий день стає візуальною історією вашого успіху.
        </p>
        <div class="p-6 rounded-2xl bg-[#343440] border-l-2 border-[#4ddada]/50 glow-effect">
          <div class="flex items-start gap-4">
            <span class="material-symbols-outlined text-[#4ddada] pt-1">lightbulb</span>
            <div class="space-y-1">
              <span class="font-mono text-xs text-[#4ddada] uppercase tracking-widest">AI Insight</span>
              <p class="text-white font-medium italic">"Сьогодні ваш пік продуктивності очікується між 10:00 та 12:00. Ми забронювали цей час для вашого головного проекту."</p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 w-full aspect-square relative">
        <div class="absolute inset-0 bg-[#c4c0ff]/20 blur-[100px] rounded-full"></div>
        <div class="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 glass-panel shadow-2xl flex items-center justify-center">
          <div class="text-center space-y-4 p-12">
            <span class="material-symbols-outlined text-[#6C63FF] text-8xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
            <p class="text-2xl font-bold text-white">Інтелектуальне планування</p>
            <p class="text-slate-400">Ваш AI-асистент, що працює 24/7</p>
          </div>
          <div class="absolute inset-0 bg-gradient-to-tr from-[#12121d] via-transparent to-transparent"></div>
          <div class="absolute bottom-8 left-8 p-6 glass-panel rounded-2xl border border-white/5 max-w-xs">
            <div class="flex gap-2 mb-2">
              <div class="w-8 h-1 bg-[#4ddada] rounded-full"></div>
              <div class="w-4 h-1 bg-white/20 rounded-full"></div>
              <div class="w-4 h-1 bg-white/20 rounded-full"></div>
            </div>
            <p class="text-sm font-bold text-white">Автоматична реструктуризація дня...</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

${renderFooter()}`;
}
