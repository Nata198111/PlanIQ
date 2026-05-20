export function renderTaskAIActions(idPrefix = '') {
  const pfx = idPrefix ? `${idPrefix}-` : '';
  return `<div class="task-ai-actions space-y-2 pt-3">
    <button id="${pfx}ai-subtasks-btn" class="w-full flex items-center justify-center gap-2 bg-[#292935] text-[#c4c0ff] py-3 rounded-xl font-bold text-sm hover:bg-[#343440] border border-[#c4c0ff]/10 transition-all active:scale-[0.98]">
      <span class="material-symbols-outlined text-sm">auto_awesome</span>ШІ: розбити на підзадачі
    </button>
  </div>`;
}

export function initTaskAIActions(idPrefix = '', onAction) {
  const pfx = idPrefix ? `${idPrefix}-` : '';
  const subtasksBtn = document.getElementById(`${pfx}ai-subtasks-btn`);

  if (subtasksBtn) {
    subtasksBtn.onclick = (e) => {
      e.stopPropagation();
      if (onAction) onAction('ai-subtasks');
    };
  }
}
