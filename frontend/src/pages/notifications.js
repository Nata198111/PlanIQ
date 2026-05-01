import { toast } from '../services/toast.js';

const mockNotifications = [
  { id: 1, title: 'Час для глибокої роботи', description: 'Ваш найпродуктивніший час починається за 15 хвилин. Підготуйтеся!', time: '10:45', icon: 'auto_awesome', type: 'info', read: false },
  { id: 2, title: 'Дедлайн наближається', description: 'Задача "Підготувати презентацію" має бути завершена через 2 години.', time: '09:00', icon: 'warning', type: 'warning', read: false },
  { id: 3, title: 'Щотижневий звіт', description: 'Ваш звіт продуктивності за минулий тиждень готовий. Виконали 85% задач!', time: 'Вчора', icon: 'analytics', type: 'success', read: true },
  { id: 4, title: 'Перепланування', description: 'Через зміщення графіку, 2 задачі перенесено на завтра.', time: 'Вчора', icon: 'update', type: 'info', read: true },
];

export function renderNotifications() {
  const notifHTML = mockNotifications.map(n => {
    const iconColor = n.type === 'warning' ? 'text-[#ffb2bc]' : (n.type === 'success' ? 'text-[#4ddada]' : 'text-[#c4c0ff]');
    const bgIconColor = n.type === 'warning' ? 'bg-[#ffb2bc]/10' : (n.type === 'success' ? 'bg-[#4ddada]/10' : 'bg-[#c4c0ff]/10');
    
    return `
      <div class="notification-item flex gap-4 p-5 rounded-2xl ${n.read ? 'bg-[#1b1a26] opacity-70' : 'bg-[#1f1e2a] border-l-4 border-[#c4c0ff] shadow-lg'} transition-all hover:bg-[#292935] cursor-pointer" data-id="${n.id}">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgIconColor} ${iconColor}">
          <span class="material-symbols-outlined">${n.icon}</span>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-bold ${n.read ? 'text-[#c7c4d8]' : 'text-white'}">${n.title}</h3>
            <span class="text-xs font-mono text-slate-500">${n.time}</span>
          </div>
          <p class="text-sm text-slate-400">${n.description}</p>
        </div>
        ${!n.read ? '<div class="w-2 h-2 rounded-full bg-[#c4c0ff] mt-2 shrink-0 unread-dot"></div>' : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight mb-2">Сповіщення</h2>
          <p class="text-[#c7c4d8]">Усі системні нагадування та активність</p>
        </div>
        <button id="mark-all-read" class="text-sm font-bold text-[#c4c0ff] hover:text-[#8781ff] transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">done_all</span> Прочитати всі
        </button>
      </div>
      <div class="space-y-4">
        ${notifHTML}
      </div>
    </div>
  `;
}

export function initNotifications() {
  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      if (!item.classList.contains('opacity-70')) {
        item.classList.add('bg-[#1b1a26]', 'opacity-70');
        item.classList.remove('bg-[#1f1e2a]', 'border-l-4', 'border-[#c4c0ff]', 'shadow-lg');
        const h3 = item.querySelector('h3');
        if (h3) h3.classList.replace('text-white', 'text-[#c7c4d8]');
        const dot = item.querySelector('.unread-dot');
        if (dot) dot.remove();
        
        // Mock state update
        const nid = parseInt(item.dataset.id);
        const n = mockNotifications.find(x => x.id === nid);
        if (n) n.read = true;
      }
    });
  });

  const markAllBtn = document.getElementById('mark-all-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.notification-item').forEach(item => {
        item.classList.add('bg-[#1b1a26]', 'opacity-70');
        item.classList.remove('bg-[#1f1e2a]', 'border-l-4', 'border-[#c4c0ff]', 'shadow-lg');
        const h3 = item.querySelector('h3');
        if (h3) h3.classList.replace('text-white', 'text-[#c7c4d8]');
        const dot = item.querySelector('.unread-dot');
        if (dot) dot.remove();
      });
      mockNotifications.forEach(n => n.read = true);
      toast('Усі сповіщення прочитано', 'success');
    });
  }
}
