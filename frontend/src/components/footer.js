export function renderFooter() {
  return `<footer class="w-full py-12 border-t border-white/5 bg-[#0F0F1A]">
    <div class="flex flex-col md:flex-row justify-between items-center px-8 gap-6 max-w-7xl mx-auto">
      <div class="space-y-2">
        <div class="text-lg font-bold text-white flex items-center gap-2">
          <span class="text-[#6C63FF] material-symbols-outlined">insights</span>
          ПланІQ
        </div>
        <p class="font-mono text-[10px] text-slate-500 uppercase tracking-widest">© 2026 ПланІQ. Твій цифровий планувальник.</p>
      </div>
      <div class="flex gap-8">
      <a href="#" onclick="document.getElementById('about')?.scrollIntoView({behavior:'smooth'});return false;" class="font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#3ECFCF] transition-colors">Про проєкт</a>
      <a href="#" onclick="document.getElementById('features')?.scrollIntoView({behavior:'smooth'});return false;" class="font-mono text-xs uppercase tracking-widest text-slate-500 hover:text-[#3ECFCF] transition-colors">Можливості</a>
      </div>
      <div class="flex gap-4">
        <a href="https://github.com/Nata198111/PlanIQ" target="_blank" class="w-10 h-10 rounded-full bg-[#292935] flex items-center justify-center text-slate-400 hover:text-[#c4c0ff] hover:bg-[#343440] transition-all" title="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <a href="mailto:ia23.shrubovych.nataliia@gmail.com" class="w-10 h-10 rounded-full bg-[#292935] flex items-center justify-center text-slate-400 hover:text-[#c4c0ff] hover:bg-[#343440] transition-all" title="Email">
          <span class="material-symbols-outlined text-xl">alternate_email</span>
        </a>
      </div>
    </div>
  </footer>`;
}
