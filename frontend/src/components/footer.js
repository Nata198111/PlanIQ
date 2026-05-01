export function renderFooter() {
  return `<footer class="w-full py-12 border-t border-white/5 bg-[#0F0F1A]">
    <div class="flex flex-col md:flex-row justify-between items-center px-8 gap-6 max-w-7xl mx-auto">
      <div class="space-y-2">
        <div class="text-lg font-bold text-white flex items-center gap-2">
          <span class="text-[#6C63FF] material-symbols-outlined">insights</span>
          ПланІQ
        </div>
        <p class="font-mono text-[10px] text-slate-500 uppercase tracking-widest">© 2024 ПланІQ. Когнітивне Святилище.</p>
      </div>
      <div class="flex gap-8">
        <a href="#" class="font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#3ECFCF] transition-colors">Про нас</a>
        <a href="#" class="font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#3ECFCF] transition-colors">Тарифи</a>
        <a href="#" class="font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#3ECFCF] transition-colors">Конфіденційність</a>
        <a href="#" class="font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#3ECFCF] transition-colors">Підтримка</a>
      </div>
      <div class="flex gap-4">
        <div class="w-10 h-10 rounded-full bg-[#292935] flex items-center justify-center text-slate-400 hover:text-[#c4c0ff] hover:bg-[#343440] cursor-pointer transition-all">
          <span class="material-symbols-outlined text-xl">language</span>
        </div>
        <div class="w-10 h-10 rounded-full bg-[#292935] flex items-center justify-center text-slate-400 hover:text-[#c4c0ff] hover:bg-[#343440] cursor-pointer transition-all">
          <span class="material-symbols-outlined text-xl">alternate_email</span>
        </div>
      </div>
    </div>
  </footer>`;
}
