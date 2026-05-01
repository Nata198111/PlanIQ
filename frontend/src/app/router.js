import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';
import { renderLanding } from '../pages/landing.js';
import { renderLogin, initLogin } from '../pages/login.js';
import { renderRegister, initRegister } from '../pages/register.js';
import { renderOnboarding, initOnboarding } from '../pages/onboarding.js';
import { renderDashboard, initDashboard } from '../pages/dashboard.js';
import { renderTasks, initTasks } from '../pages/tasks.js';
import { renderAnalytics, initAnalytics } from '../pages/analytics.js';
import { renderSettings, initSettings } from '../pages/settings.js';
import { renderNotifications, initNotifications } from '../pages/notifications.js';
import { renderCalendar, initCalendar } from '../pages/calendar.js';
import { renderProfile, initProfile } from '../pages/profile.js';
import { isLoggedIn, clearAuth } from '../services/auth.js';
import { toast } from '../services/toast.js';
import { runCleanups } from '../utils/cleanup.js';

const routes = {
  '/landing':    { layout: 'public', render: renderLanding,    init: null,           title: 'ПланІQ — Когнітивне Святилище' },
  '/login':      { layout: 'auth',   render: renderLogin,      init: initLogin,      title: 'ПланІQ — Вхід' },
  '/register':   { layout: 'auth',   render: renderRegister,   init: initRegister,   title: 'ПланІQ — Реєстрація' },
  '/onboarding': { layout: 'auth',   render: renderOnboarding, init: initOnboarding, title: 'ПланІQ — Налаштування', protected: true },
  '/dashboard':  { layout: 'app',    render: renderDashboard,  init: initDashboard,  title: 'ПланІQ — Головна',       navId: 'dashboard', topbarTitle: 'Головна',       protected: true },
  '/tasks':      { layout: 'app',    render: renderTasks,      init: initTasks,      title: 'ПланІQ — Мої задачі',    navId: 'tasks',     topbarTitle: 'Мої задачі',    protected: true },
  '/calendar':   { layout: 'app',    render: renderCalendar,   init: initCalendar,   title: 'ПланІQ — Календар',      navId: 'calendar',  topbarTitle: 'Календар',      protected: true },
  '/analytics':  { layout: 'app',    render: renderAnalytics,  init: initAnalytics,  title: 'ПланІQ — Аналітика',     navId: 'analytics', topbarTitle: 'Аналітика',     showSearch: true, protected: true },
  '/settings':   { layout: 'app',    render: renderSettings,   init: initSettings,   title: 'ПланІQ — Налаштування',  navId: 'settings',  topbarTitle: 'Налаштування',  showNewTask: false, protected: true },
  '/notifications':{ layout: 'app',  render: renderNotifications,init: initNotifications,title: 'ПланІQ — Сповіщення',navId: 'notifications',topbarTitle: 'Сповіщення',   protected: true },
  '/profile':    { layout: 'app',    render: renderProfile,    init: initProfile,    title: 'ПланІQ — Профіль',       navId: 'profile',   topbarTitle: 'Профіль користувача', protected: true },
};

function getRoute() {
  return window.location.hash.replace('#', '') || '/landing';
}

function navigate() {
  const path = getRoute();
  const route = routes[path];

  if (!route) {
    window.location.hash = '#/landing';
    return;
  }

  if (route.protected && !isLoggedIn()) {
    window.location.hash = '#/login';
    return;
  }

  if ((path === '/login' || path === '/register') && isLoggedIn()) {
    window.location.hash = '#/dashboard';
    return;
  }

  const app = document.getElementById('app');
  document.title = route.title;

  runCleanups();
  document.body.style.overflow = '';

  app.classList.add('fade-out');

  setTimeout(() => {
    if (route.layout === 'app') {
      const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      const marginClass = isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[240px]';
      
      app.innerHTML = `
        ${renderSidebar(route.navId, isCollapsed)}
        <div class="w-full lg:w-auto ${marginClass} min-h-screen flex flex-col transition-all duration-300" id="main-content-wrapper">
          ${renderTopbar(route.topbarTitle, {
            showSearch: route.showSearch || false,
            showNewTask: route.showNewTask !== false
          })}
          <main class="flex-1 p-4 md:p-8 overflow-x-hidden">${route.render()}</main>
        </div>
      `;
    } else {
      app.innerHTML = route.render();
    }

    if (route.init) route.init();
    initGlobalActions();

    app.classList.remove('fade-out');
    app.classList.add('fade-in');
    window.scrollTo(0, 0);
  }, 200);
}

function initGlobalActions() {
  const sidebar = document.getElementById('sidebar');
  const mainWrapper = document.getElementById('main-content-wrapper');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  
  const toggleMobileSidebar = (forceClose = false) => {
    if (!sidebar || !overlay) return;
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if(isClosed && !forceClose) {
       sidebar.classList.remove('-translate-x-full');
       overlay.classList.remove('hidden');
       setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
       sidebar.classList.add('-translate-x-full');
       overlay.classList.add('opacity-0');
       setTimeout(() => overlay.classList.add('hidden'), 300);
    }
  };

  const topbarMenuBtn = document.getElementById('topbar-menu-btn');
  if (topbarMenuBtn) topbarMenuBtn.addEventListener('click', () => toggleMobileSidebar());

  const mobileCloseBtn = document.getElementById('mobile-sidebar-close');
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => toggleMobileSidebar(true));
  
  if (overlay) overlay.addEventListener('click', () => toggleMobileSidebar(true));

  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      const isNowCollapsed = localStorage.getItem('sidebarCollapsed') !== 'true';
      localStorage.setItem('sidebarCollapsed', isNowCollapsed);
      
      const path = getRoute();
      const route = routes[path];
      
      const newSidebarStr = renderSidebar(route.navId, isNowCollapsed);
      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = newSidebarStr;
      
      const newSidebarNode = tempWrapper.querySelector('#sidebar');
      sidebar.parentNode.replaceChild(newSidebarNode, sidebar);
      
      if (isNowCollapsed) {
        mainWrapper.classList.replace('lg:ml-[240px]', 'lg:ml-[80px]');
      } else {
        mainWrapper.classList.replace('lg:ml-[80px]', 'lg:ml-[240px]');
      }
      
      initGlobalActions();
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuth();
      toast('Ви вийшли з системи', 'info');
      setTimeout(() => { window.location.hash = '#/landing'; }, 300);
    });
  }

  const currentRoute = getRoute();
  const topbarNewTask = document.getElementById('topbar-new-task');
  if (topbarNewTask && currentRoute !== '/tasks') {
    topbarNewTask.addEventListener('click', () => {
      window.location.hash = '#/tasks';
      setTimeout(() => {
        const btn = document.getElementById('topbar-new-task');
        if (btn && typeof btn.onclick === 'function') {
            btn.onclick();
        } else if (btn) {
            btn.click();
        }
      }, 150);
    });
  }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '#/landing';
  } else {
    navigate();
  }
});
