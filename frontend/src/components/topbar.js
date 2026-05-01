export function renderTopbar(title, options = {}) {
  const { showSearch = false, showNewTask = true } = options;

  const searchHTML = showSearch ? `
    <div class="relative group hidden sm:block">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
      <input type="text" placeholder="Пошук..." class="bg-[#1b1a26] border-none rounded-xl pl-10 pr-4 py-2 text-sm text-[#e3e0f1] focus:ring-1 focus:ring-[#c4c0ff]/50 w-full sm:w-64 transition-all outline-none" />
    </div>` : '';

  const newTaskHTML = showNewTask ? `
    <button id="topbar-new-task" class="bg-[#6C63FF] text-white px-4 md:px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#6C63FF]/20 hover:scale-105 active:scale-95 transition-all">
      <span class="hidden sm:inline">+ Нова задача</span>
      <span class="sm:hidden material-symbols-outlined text-sm m-0 p-0" style="font-variation-settings: 'wght' 700;">add</span>
    </button>` : '';

  return `<header class="h-16 w-full sticky top-0 z-40 bg-[#0F0F1A]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 shadow-[0_1px_10px_rgba(108,99,255,0.05)]">
    <div class="flex items-center gap-4 md:gap-6 w-full">
      <button id="topbar-menu-btn" class="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[#e3e0f1] transition-colors">
         <span class="material-symbols-outlined">menu</span>
      </button>
      <h2 class="font-bold text-lg tracking-tight text-[#e3e0f1] truncate hidden sm:block">${title}</h2>
      ${searchHTML}
    </div>
    <div class="flex items-center gap-3 md:gap-4 flex-shrink-0">
      ${newTaskHTML}
      <div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#292935] overflow-hidden border border-[#464555]/30 cursor-pointer transition-transform hover:scale-105 active:scale-95" id="topbar-avatar" onclick="window.location.hash='#/settings'">
        <div class="w-full h-full bg-gradient-to-tr from-[#6C63FF] to-[#3ECFCF] flex items-center justify-center text-xs font-bold text-[#2000a4]">ОЛ</div>
      </div>
    </div>
  </header>`;
}
