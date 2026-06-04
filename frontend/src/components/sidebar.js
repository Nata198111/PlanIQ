import { getUser } from "../services/auth.js";
 
export function renderSidebar(activePage, isCollapsed = false, unreadCount = 0) {
  const user = getUser();
  const userName = user.user?.name || 'Користувач';
  const initials = userName.split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
 
  const navItems = [
    { id: 'dashboard', icon: 'home',          label: 'Головна',    route: '#/dashboard' },
    { id: 'tasks',     icon: 'task_alt',       label: 'Мої задачі', route: '#/tasks'     },
    { id: 'calendar',  icon: 'calendar_month', label: 'Календар',   route: '#/calendar'  },
    { id: 'analytics', icon: 'query_stats',    label: 'Аналітика',  route: '#/analytics' },
    { id: 'settings',  icon: 'settings',       label: 'Налаштування', route: '#/settings' },
  ];
 
  const textClass = isCollapsed
    ? 'lg:w-0 lg:opacity-0 lg:hidden'
    : 'whitespace-nowrap transition-all duration-300';
  const pxClass = isCollapsed ? 'lg:px-0 lg:justify-center' : 'px-4';
 
  const navHTML = navItems.map(item => {
    const isActive = item.id === activePage;
    if (isActive) {
      return `<a href="${item.route}" class="bg-[#6C63FF]/10 text-[#6C63FF] border-l-2 border-[#6C63FF] ${isCollapsed ? 'lg:border-l-0 lg:rounded-lg' : ''} ${pxClass} py-3 rounded-r-lg font-semibold flex items-center justify-center lg:justify-start gap-3 transition-all group" data-nav="${item.id}" title="${item.label}">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${item.icon}</span>
        <span class="text-sm ${textClass}">${item.label}</span>
      </a>`;
    }
    return `<a href="${item.route}" class="text-slate-500 ${pxClass} py-3 hover:bg-slate-800/50 rounded-lg mx-2 transition-all flex items-center justify-center lg:justify-start gap-3 group" data-nav="${item.id}" title="${item.label}">
      <span class="material-symbols-outlined group-hover:text-white transition-colors">${item.icon}</span>
      <span class="text-sm ${textClass} group-hover:text-white">${item.label}</span>
    </a>`;
  }).join('');
 
  // Badge для непрочитаних сповіщень
  const badgeHTML = unreadCount > 0
    ? `<span id="notif-badge-sidebar" class="ml-auto bg-[#ffb2bc] text-[#1b1a26] text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${isCollapsed ? 'lg:hidden' : ''}">${unreadCount > 99 ? '99+' : unreadCount}</span>`
    : `<span id="notif-badge-sidebar" class="hidden"></span>`;
 
  // Dot для collapsed режиму
  const collapsedDotHTML = unreadCount > 0 && isCollapsed
    ? `<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ffb2bc]"></span>`
    : '';
 
  const isNotifActive = activePage === 'notifications';
 
  return `
  <!-- Mobile Overlay -->
  <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-black/60 z-40 hidden lg:hidden backdrop-blur-sm transition-opacity opacity-0"></div>
 
  <aside id="sidebar" class="w-[280px] ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-[240px]'} h-screen fixed left-0 top-0 bg-[#0F0F1A] border-r border-white/5 flex flex-col py-6 z-50 shadow-2xl shadow-indigo-500/5 transition-all duration-300 -translate-x-full lg:translate-x-0">
    <div class="px-6 mb-10 flex items-center justify-between h-8">
      <a href="#/dashboard" class="flex flex-col overflow-hidden items-start hover:opacity-80 transition-opacity ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}">
        <h1 class="font-bold text-2xl tracking-tighter text-[#6C63FF]">ПланІQ</h1>
        <p class="text-[10px] text-slate-500 font-mono tracking-widest mt-1">SMART ПЛАНУВАЛЬНИК</p>
      </a>
      <div class="flex items-center gap-2 ${isCollapsed ? 'lg:mx-auto' : ''}">
        <button id="sidebar-collapse-btn" class="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Згорнути/Розгорнути">
          <span class="material-symbols-outlined">${isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
        <button id="mobile-sidebar-close" class="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
 
    <nav class="flex-1 space-y-2 px-2 lg:px-0">
      ${navHTML}
    </nav>
 
    <div class="mt-auto px-2 space-y-1">
      <a href="#/profile" class="px-4 py-3 flex items-center justify-center lg:justify-start gap-3 mb-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent ${activePage === 'profile' ? 'bg-[#292935] border-white/5' : ''}">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr flex-shrink-0 from-[#6C63FF] to-[#3ECFCF] flex items-center justify-center text-xs font-bold text-[#2000a4] group-hover:scale-110 transition-transform shadow-lg shadow-[#6C63FF]/20">
          ${initials}
        </div>
        <div class="flex flex-col overflow-hidden ${textClass}">
          <span class="text-xs font-bold text-[#e3e0f1] truncate">${userName}</span>
          <span class="text-[10px] text-slate-500 truncate group-hover:text-white/70 transition-colors">Профіль користувача</span>
        </div>
      </a>
 
      <a href="#/notifications" class="relative ${isNotifActive ? 'bg-[#6C63FF]/10 text-[#6C63FF] border-l-2 border-[#6C63FF] font-semibold' : 'text-slate-500 hover:bg-slate-800/50'} ${isCollapsed ? 'lg:px-0 lg:border-l-0 lg:rounded-lg lg:justify-center' : 'px-4'} py-3 rounded-lg lg:rounded-r-lg mx-2 lg:mx-0 transition-all flex items-center justify-center lg:justify-start gap-3 group" id="notifications-btn" title="Сповіщення">
        ${collapsedDotHTML}
        <span class="material-symbols-outlined group-hover:text-white transition-colors" ${isNotifActive ? "style=\"font-variation-settings: 'FILL' 1;\"" : ''}>notifications</span>
        <span class="text-sm ${textClass} group-hover:text-white">Сповіщення</span>
        ${badgeHTML}
      </a>
 
      <a href="#" class="text-slate-500 ${isCollapsed ? 'lg:px-0 lg:justify-center' : 'px-4'} py-3 hover:bg-slate-800/50 rounded-lg mx-2 lg:mx-0 transition-all flex items-center justify-center lg:justify-start gap-3 group" id="logout-btn" title="Вихід">
        <span class="material-symbols-outlined text-[#ffb2bc] opacity-80 group-hover:opacity-100 transition-opacity">logout</span>
        <span class="text-sm ${textClass} text-[#ffb2bc] opacity-80 group-hover:opacity-100">Вихід</span>
      </a>
    </div>
  </aside>`;
}