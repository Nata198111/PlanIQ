export function renderAIInsight({ title = 'AI Підказка', message, icon = 'auto_awesome', actions = null }) {
  const actionsHTML = actions ? `
    <div class="mt-4 flex items-center gap-3">
      ${actions.map((a, i) => {
        if (i === 0) return `<button class="text-xs font-bold text-[#4ddada] hover:underline">${a.label}</button>`;
        return `<span class="w-1 h-1 rounded-full bg-slate-700"></span><button class="text-xs font-medium text-slate-500 hover:text-slate-300">${a.label}</button>`;
      }).join('')}
    </div>` : '';

  return `<div class="bg-[#343440]/50 p-5 rounded-2xl border-l-2 border-[#4ddada] relative overflow-hidden ai-glow">
    <div class="absolute -top-2 -right-2 w-12 h-12 bg-[#4ddada]/5 rounded-full blur-xl animate-pulse"></div>
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-lg bg-[#4ddada]/20 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[#4ddada]" style="font-variation-settings: 'FILL' 1;">${icon}</span>
      </div>
      <div>
        <h5 class="text-[10px] font-bold uppercase tracking-widest text-[#4ddada] mb-1">${title}</h5>
        <p class="text-sm leading-relaxed text-[#c7c4d8]">${message}</p>
        ${actionsHTML}
      </div>
    </div>
    <div class="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#4ddada] rounded-full animate-pulse shadow-[0_0_8px_rgba(62,207,207,0.8)]"></div>
  </div>`;
}
