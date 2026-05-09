import { renderFooter } from '../components/footer.js';
import { loginAPI } from '../services/auth.js';
import { toast } from '../services/toast.js';
import { preferencesStore } from '../services/preferences-store.js';

export function renderLogin() {
  return `
<main class="flex-grow flex items-center justify-center p-6 relative overflow-hidden min-h-screen">
  <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c4c0ff]/10 blur-[120px] rounded-full"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4ddada]/10 blur-[120px] rounded-full"></div>
  <div class="w-full max-w-md z-10">
    <div class="text-center mb-8">
      <a href="#/landing" class="inline-block">
        <h1 class="text-3xl font-extrabold tracking-tight text-white mb-2">ПланІQ</h1>
      </a>
      <p class="font-mono text-xs uppercase tracking-widest text-slate-500">Когнітивне Святилище</p>
    </div>
    <div class="bg-[#1A1A2E] rounded-xl p-8 shadow-2xl border border-white/5 relative">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#c4c0ff]/50 to-transparent blur-sm"></div>
      <h2 class="text-2xl font-bold text-white mb-8 text-center">Вхід до системи</h2>
      <form id="login-form" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#c7c4d8] ml-1">Електронна пошта</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] text-lg">mail</span>
            <input id="login-email" class="w-full bg-[#1b1a26] border-none rounded-lg py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none" placeholder="example@mail.com" type="email" required />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center ml-1">
            <label class="block text-sm font-medium text-[#c7c4d8]">Пароль</label>
            <a id="forgot-pw" class="text-xs text-[#c4c0ff] hover:text-[#8781ff] transition-colors cursor-pointer">Забули пароль?</a>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] text-lg">lock</span>
            <input id="login-password" class="w-full bg-[#1b1a26] border-none rounded-lg py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#c4c0ff]/20 transition-all outline-none" placeholder="••••••••" type="password" required />
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#918fa1] text-lg cursor-pointer hover:text-white toggle-password">visibility</span>
          </div>
        </div>
        <div id="login-error" class="hidden text-[#ffb4ab] text-sm text-center p-3 bg-[#93000a]/20 rounded-lg"></div>
        <button class="w-full bg-[#6C63FF] text-white font-bold py-4 rounded-full glow-button mt-4" type="submit">
          Увійти
        </button>
      </form>
      <div class="mt-10 pt-8 border-t border-white/5 space-y-4">
        <p class="text-center text-xs text-slate-500 uppercase tracking-widest font-mono">Або за допомогою</p>
        <div class="grid grid-cols-2 gap-4">
          <button class="flex items-center justify-center gap-2 bg-[#292935] hover:bg-[#343440] transition-colors py-3 rounded-lg border border-white/5" id="login-google">
            <span class="material-symbols-outlined text-lg">mail</span>
            <span class="text-sm font-medium">Google</span>
          </button>
          <button class="flex items-center justify-center gap-2 bg-[#292935] hover:bg-[#343440] transition-colors py-3 rounded-lg border border-white/5" id="login-apple">
            <span class="material-symbols-outlined text-lg">smartphone</span>
            <span class="text-sm font-medium">Apple</span>
          </button>
        </div>
      </div>
    </div>
    <p class="text-center mt-8 text-[#c7c4d8] text-sm">
      Немає акаунту?
      <a class="text-[#c4c0ff] font-bold hover:underline ml-1" href="#/register">Зареєструватися</a>
    </p>
  </div>
</main>
${renderFooter()}`;
}

export function initLogin() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'visibility_off';
      } else {
        input.type = 'password';
        btn.textContent = 'visibility';
      }
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        errorEl.textContent = 'Будь ласка, заповніть усі поля';
        errorEl.classList.remove('hidden');
        return;
      }

      // Блокуємо кнопку під час запиту
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Вхід...';

      try {
        await loginAPI(email, password);
        await preferencesStore.load();
        toast('Вхід виконано успішно!', 'success');
        setTimeout(() => { window.location.hash = '#/dashboard'; }, 400);
      } catch (err) {
        errorEl.textContent = err.message || 'Невірний email або пароль';
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Увійти';
      }
    });
  }

  ['login-google', 'login-apple'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        toast('Соціальна авторизація буде доступна пізніше', 'info');
      });
    }
  });

  const forgotPw = document.getElementById('forgot-pw');
  if (forgotPw) {
    forgotPw.addEventListener('click', () => {
      toast('Відновлення пароля наразі недоступне', 'info');
    });
  }
}
