import { showDecomposeModal } from './decompose-modal.js';
import { taskStore } from '../services/task-store.js';

export function renderTaskAIActions(idPrefix = '') {
  const pfx = idPrefix ? `${idPrefix}-` : '';
  return `<div class="task-ai-actions pt-3">
    <button id="${pfx}ai-subtasks-btn" class="w-full flex items-center justify-center gap-2 bg-[#c4c0ff]/10 text-[#c4c0ff] py-3 rounded-xl font-bold text-sm hover:bg-[#c4c0ff]/20 border border-[#c4c0ff]/20 transition-all active:scale-[0.98]">
      <span class="material-symbols-outlined text-sm">auto_awesome</span>
      ШІ: розбити на підзадачі
    </button>
  </div>`;
}
 

export function initTaskAIActions(idPrefix = '', taskId = null, onCreated = null) {
  const pfx = idPrefix ? `${idPrefix}-` : '';
  const btn = document.getElementById(`${pfx}ai-subtasks-btn`);

  if (!btn) return;

  btn.onclick = async (e) => {
    e.stopPropagation();

    if (!taskId) {
      console.warn('initTaskAIActions: taskId не передано');
      return;
    }

    const task = taskStore.getById(taskId);
    if (!task) {
      console.warn('initTaskAIActions: задачу не знайдено в store');
      return;
    }

    await showDecomposeModal(task, async(createdSubtasks) => {
      await taskStore.loadFromAPI();
      if (onCreated) onCreated(createdSubtasks);
    });
  };
}
