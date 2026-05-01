export function renderProfile() {
  return `
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-0">
      <div class="mb-10 flex items-center gap-6">
         <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#292935] bg-gradient-to-tr from-[#6C63FF] to-[#3ECFCF] flex items-center justify-center text-3xl sm:text-5xl font-black text-[#1b1a26] shadow-2xl">
            ОЛ
         </div>
         <div>
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">Олександр Лисиця</h1>
            <p class="text-[#c4c0ff] mt-1 font-medium font-mono">Pro Plan Member</p>
            <div class="flex items-center gap-3 mt-4">
              <button class="bg-[#292935] hover:bg-[#343440] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Редагувати профіль</button>
              <button class="bg-[#1b1a26] hover:bg-white/5 border border-white/10 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors" onclick="window.location.hash='#/settings'">Налаштування</button>
            </div>
         </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div class="bg-[#1b1a26] p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group">
           <div class="absolute right-[-20px] top-[-20px] text-[100px] text-[#c4c0ff] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform"><span class="material-symbols-outlined" style="font-size:inherit">task_alt</span></div>
           <p class="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Всього задач</p>
           <h3 class="text-4xl font-black text-white relative z-10">1,248</h3>
        </div>
        <div class="bg-[#1b1a26] p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group">
           <div class="absolute right-[-20px] top-[-20px] text-[100px] text-[#4ddada] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform"><span class="material-symbols-outlined" style="font-size:inherit">local_fire_department</span></div>
           <p class="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Ударний темп</p>
           <h3 class="text-4xl font-black text-[#4ddada] relative z-10">14 <span class="text-xl text-slate-400 font-medium">днів</span></h3>
        </div>
        <div class="bg-[#1b1a26] p-6 rounded-3xl border border-white/5 space-y-2 relative overflow-hidden group">
           <div class="absolute right-[-20px] top-[-20px] text-[100px] text-[#ffb2bc] opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform"><span class="material-symbols-outlined" style="font-size:inherit">stars</span></div>
           <p class="text-sm font-bold text-slate-500 uppercase tracking-widest relative z-10">Рівень фокусу</p>
           <h3 class="text-4xl font-black text-white relative z-10">92%</h3>
        </div>
      </div>
      
      <h2 class="text-xl font-bold text-white mb-6">Нещодавня активність</h2>
      <div class="bg-[#1b1a26] rounded-3xl border border-white/5 overflow-hidden">
        <div class="p-4 border-b border-white/5 flex items-center justify-between hover:bg-[#292935] transition-colors cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-[#4ddada]/10 flex items-center justify-center text-[#4ddada]"><span class="material-symbols-outlined">check_circle</span></div>
            <div><p class="text-white font-medium">Завершено дизайн системної архітектури</p><p class="text-xs text-slate-500 mt-0.5">Сьогодні, 14:30</p></div>
          </div>
        </div>
        <div class="p-4 border-b border-white/5 flex items-center justify-between hover:bg-[#292935] transition-colors cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-[#c4c0ff]/10 flex items-center justify-center text-[#c4c0ff]"><span class="material-symbols-outlined">edit_note</span></div>
            <div><p class="text-white font-medium">Оновлено робочі години в налаштуваннях</p><p class="text-xs text-slate-500 mt-0.5">Вчора, 09:15</p></div>
          </div>
        </div>
        <div class="p-4 flex items-center justify-between hover:bg-[#292935] transition-colors cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><span class="material-symbols-outlined">emoji_events</span></div>
            <div><p class="text-white font-medium">Досягнуто 10 днів ударного темпу!</p><p class="text-xs text-slate-500 mt-0.5">25 Березня, 18:00</p></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initProfile() {
  console.log("Profile initialized");
}
