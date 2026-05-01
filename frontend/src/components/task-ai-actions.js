/**
 * Shared AI action buttons for task detail drawers.
 * UI-only placeholders — no backend or state logic.
 * Used across Dashboard, Tasks, Calendar, and any future task detail views.
 */

/**
 * Renders the two secondary AI action buttons.
 * @param {string} [idPrefix=''] – optional prefix for button IDs to avoid collisions when multiple drawers coexist in the DOM.
 * @returns {string} HTML string
 */
export function renderTaskAIActions(idPrefix = '') {
  const pfx = idPrefix ? `${idPrefix}-` : '';
  return `<div class="task-ai-actions space-y-2 pt-3">
    <button id="${pfx}ai-subtasks-btn" class="w-full flex items-center justify-center gap-2 bg-[#292935] text-[#c4c0ff] py-3 rounded-xl font-bold text-sm hover:bg-[#343440] border border-[#c4c0ff]/10 transition-all active:scale-[0.98]">
      <span class="material-symbols-outlined text-sm">auto_awesome</span>ШІ: розбити на підзадачі
    </button>
    <button id="${pfx}ai-reestimate-btn" class="w-full flex items-center justify-center gap-2 bg-[#292935] text-[#c7c4d8] py-3 rounded-xl font-bold text-sm hover:bg-[#343440] border border-white/5 transition-all active:scale-[0.98]">
      <span class="material-symbols-outlined text-sm">update</span>Перерахувати задачу
    </button>
  </div>`;
}

/**
 * Binds click handlers for the AI action buttons (toast placeholder).
 * Call after the HTML is in the DOM.
 * @param {string} [idPrefix='']
 * @param {Function} [onAction] – optional callback(actionName) for future wiring
 */
export function initTaskAIActions(idPrefix = '', onAction) {
  const pfx = idPrefix ? `${idPrefix}-` : '';
  const subtasksBtn = document.getElementById(`${pfx}ai-subtasks-btn`);
  const reestimateBtn = document.getElementById(`${pfx}ai-reestimate-btn`);

  if (subtasksBtn) {
    subtasksBtn.onclick = (e) => {
      e.stopPropagation();
      if (onAction) onAction('ai-subtasks');
      // Placeholder — no logic yet
    };
  }
  if (reestimateBtn) {
    reestimateBtn.onclick = (e) => {
      e.stopPropagation();
      if (onAction) onAction('ai-reestimate');
      // Placeholder — no logic yet
    };
  }
}
