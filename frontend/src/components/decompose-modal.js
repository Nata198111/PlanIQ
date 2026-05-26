
import { decomposeApi } from '../services/decompose-api.js';
import { toast } from '../services/toast.js';

export async function showDecomposeModal(task, onConfirm) {
  document.getElementById('decompose-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'decompose-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="fixed inset-0 bg-[#0d0d18]/80 backdrop-blur-md" id="decompose-backdrop"></div>
    <div class="relative w-full max-w-[600px] bg-[#15141f] rounded-2xl border border-[#464555]/20 shadow-2xl overflow-hidden">
      
      <!-- Header -->
      <div class="px-7 py-5 flex items-center justify-between border-b border-white/5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-[#c4c0ff]/10 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px] text-[#c4c0ff]">auto_awesome</span>
          </div>
          <div>
            <h2 class="text-base font-bold text-white">AI Декомпозиція</h2>
            <p class="text-[11px] text-slate-500 truncate max-w-[300px]">${escapeHtml(task.title)}</p>
          </div>
        </div>
        <button id="decompose-close" class="p-2 hover:bg-[#292935] rounded-xl transition-colors">
          <span class="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>

      <!-- Content -->
      <div id="decompose-content" class="px-7 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div class="flex flex-col items-center justify-center py-12 gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-[#c4c0ff]/30 border-t-[#c4c0ff] animate-spin"></div>
          <p class="text-sm text-slate-400">Gemini AI аналізує задачу...</p>
        </div>
      </div>

      <!-- Footer -->
      <div id="decompose-footer" class="px-7 py-5 border-t border-white/5 bg-[#15141f] hidden">
        <div class="flex items-center justify-between">
          <p class="text-xs text-slate-500" id="decompose-count"></p>
          <div class="flex gap-3">
            <button id="decompose-cancel" class="px-5 py-2.5 text-slate-400 font-semibold hover:text-white transition-colors text-sm">
              Скасувати
            </button>
            <button id="decompose-confirm" class="px-6 py-2.5 bg-[#c4c0ff] text-[#2000a4] rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">check</span>
              Створити підзадачі
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById('decompose-close').onclick  = close;
  document.getElementById('decompose-backdrop').onclick = close;

  let subtasks = [];
  try {
    const result = await decomposeApi.preview(task.id);
    subtasks = result.subtasks || [];
    renderPreview(subtasks);
  } catch (err) {
    console.error('Decompose error:', err);
    renderError(err.message || 'Не вдалося отримати підзадачі від AI');
    return;
  }

  document.getElementById('decompose-confirm').onclick = async () => {
    const btn = document.getElementById('decompose-confirm');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span>Зберігаємо...';

    try {
      const edited = collectEditedSubtasks(subtasks);
      const created = await decomposeApi.confirm(task.id, edited);
      close();
      toast(`Створено ${created.length} підзадач і заплановано в календарі 🎉`, 'success');
      if (onConfirm) onConfirm(created);
    } catch (err) {
      console.error('Confirm error:', err);
      toast(err.message || 'Помилка збереження підзадач', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span>Створити підзадачі';
    }
  };

  document.getElementById('decompose-cancel').onclick = close;
}


function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
}


function renderPreview(subtasks) {
  const content = document.getElementById('decompose-content');
  const footer  = document.getElementById('decompose-footer');
  const count   = document.getElementById('decompose-count');

  if (!subtasks.length) {
    content.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-600">search_off</span>
        <p class="text-slate-400 font-bold">AI не зміг розбити цю задачу</p>
        <p class="text-xs text-slate-500">Спробуй додати більш детальний опис до задачі</p>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="mb-4">
      <div class="flex items-start gap-3 p-4 bg-[#4ddada]/5 border border-[#4ddada]/20 rounded-xl mb-5">
        <span class="material-symbols-outlined text-[#4ddada] text-sm flex-shrink-0 mt-0.5">info</span>
        <p class="text-xs text-slate-300 leading-relaxed">
          AI згенерував підзадачі на основі аналізу назви, опису та складності. 
          Ти можеш відредагувати назви і тривалість перед збереженням.
          Після підтвердження вони будуть автоматично розплановані в твій календар.
        </p>
      </div>
    </div>
    <div class="space-y-3" id="subtasks-preview-list">
      ${subtasks.map((s, i) => renderSubtaskItem(s, i)).join('')}
    </div>`;

  footer.classList.remove('hidden');
  count.textContent = `${subtasks.length} підзадач буде створено`;
}


function renderSubtaskItem(subtask, index) {
  const durations = ['15 хв', '30 хв', '45 хв', '1 год', '1.5 год', '2 год', '3 год', '4 год'];

  return `
    <div class="subtask-preview-item bg-[#1b1a26] rounded-xl border border-white/5 p-4 hover:border-[#c4c0ff]/20 transition-colors" data-index="${index}">
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 rounded-full bg-[#c4c0ff]/10 text-[#c4c0ff] flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
          ${subtask.sequence_order}
        </div>
        <div class="flex-1 min-w-0 space-y-3">
          <input
            class="subtask-title w-full bg-[#0d0d18] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-medium outline-none focus:border-[#c4c0ff]/30 focus:ring-1 focus:ring-[#c4c0ff]/20 transition-all"
            value="${escapeHtml(subtask.title)}"
            data-field="title"
            placeholder="Назва підзадачі" />
          
          ${subtask.description ? `<p class="text-[11px] text-slate-500 leading-relaxed px-1">${escapeHtml(subtask.description)}</p>` : ''}
          
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Тривалість</span>
              <select class="subtask-duration bg-[#0d0d18] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#c4c0ff]/30 transition-all" data-field="duration">
                ${durations.map(d => `<option value="${d}" ${d === subtask.duration ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Складність</span>
              <span class="text-xs font-mono text-[#c4c0ff] font-bold">${subtask.complexity}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}


function collectEditedSubtasks(originalSubtasks = []) {
  const items = document.querySelectorAll('.subtask-preview-item');
  const result = [];

  items.forEach((item, i) => {
    const original = originalSubtasks[i] || {};

    const title = item.querySelector('.subtask-title')?.value?.trim() || original.title || `Підзадача ${i + 1}`;

    const duration = item.querySelector('.subtask-duration')?.value || original.duration || '30 хв';

    result.push({
      title,
      description: original.description || '',
      duration,
      complexity: original.complexity || 5,
      sequence_order: original.sequence_order || i + 1,
    });
  });

  return result;
}


function renderError(message) {
  const content = document.getElementById('decompose-content');
  content.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div class="w-12 h-12 rounded-full bg-[#93000a]/20 flex items-center justify-center">
        <span class="material-symbols-outlined text-[#ffb4ab]">error</span>
      </div>
      <div>
        <p class="text-white font-bold mb-1">Помилка AI</p>
        <p class="text-xs text-slate-400 max-w-[300px] leading-relaxed">${escapeHtml(message)}</p>
      </div>
    </div>`;
}