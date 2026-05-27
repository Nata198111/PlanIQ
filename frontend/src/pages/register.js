import { renderFooter } from '../components/footer.js';
import { registerAPI } from '../services/auth.js';
import { toast } from '../services/toast.js';
import { preferencesStore } from '../services/preferences-store.js';

export function renderRegister() {
  return `
<main class="flex items-center justify-center p-6 relative overflow-hidden min-h-screen">
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#c4c0ff]/10 blur-[120px] rounded-full"></div>
    <div class="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-[#4ddada]/10 blur-[100px] rounded-full"></div>
  </div>
  <div class="relative z-10 w-full max-w-[440px]">
    <div class="text-center mb-6">
      <a href="#/landing" class="inline-flex items-center justify-center mb-4">
        <span class="text-4xl font-extrabold tracking-tighter text-white">ПланІQ</span>
        <div class="ml-2 w-2 h-2 bg-[#4ddada] rounded-full animate-pulse"></div>
      </a>
      <p class="font-mono text-[10px] uppercase tracking-[0.3em] text-[#918fa1]">AI-планувальник задач</p>
    </div>
    <section class="glass-effect rounded-lg p-6 md:p-8 border border-white/5 relative overflow-hidden">
      <div class="mb-1">
        <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Створити акаунт</h1>
        <p class="text-[#c7c4d8] text-sm">Один акаунт — і всі твої задачі під контролем.</p>
      </div>
      <form id="register-form" class="space-y-3">
        <div class="space-y-2">
          <label class="font-mono text-[11px] uppercase tracking-widest text-[#918fa1] ml-1">Ім'я</label>
          <div class="relative group input-focus-glow transition-all duration-300 rounded-md bg-[#1b1a26]">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] group-focus-within:text-[#c4c0ff] transition-colors">person</span>
            <input id="reg-name" class="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-white placeholder:text-[#918fa1]/50 focus:ring-0 rounded-md outline-none" placeholder="Ваше ім'я" type="text" required />
          </div>
        </div>
        <div class="space-y-2">
          <label class="font-mono text-[11px] uppercase tracking-widest text-[#918fa1] ml-1">Електронна пошта</label>
          <div class="relative group input-focus-glow transition-all duration-300 rounded-md bg-[#1b1a26]">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] group-focus-within:text-[#c4c0ff] transition-colors">mail</span>
            <input id="reg-email" class="w-full bg-transparent border-none py-3.5 pl-12 pr-12 text-white placeholder:text-[#918fa1]/50 focus:ring-0 rounded-md outline-none" placeholder="email@example.com" type="email" required />
            <span id="reg-email-check" class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#4CAF82] hidden" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="font-mono text-[11px] uppercase tracking-widest text-[#918fa1] ml-1">Пароль</label>
          <div class="relative group input-focus-glow transition-all duration-300 rounded-md bg-[#1b1a26] border border-transparent focus-within:border-[#c4c0ff]/30">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1] group-focus-within:text-[#c4c0ff] transition-colors">lock</span>
            <input id="reg-password" class="w-full bg-transparent border-none py-3.5 pl-12 pr-12 text-white placeholder:text-[#918fa1]/50 focus:ring-0 rounded-md outline-none" placeholder="••••••••" type="password" required minlength="6" />
            <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#918fa1] hover:text-white transition-colors toggle-password">
              <span class="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </div>
        <div class="space-y-2">
          <label class="font-mono text-[11px] uppercase tracking-widest text-[#918fa1] ml-1">Підтвердити пароль</label>
          <div class="relative group transition-all duration-300 rounded-md bg-[#1b1a26] border border-transparent" id="reg-confirm-wrapper">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]" id="reg-confirm-icon">lock</span>
            <input id="reg-confirm" class="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-white placeholder:text-[#918fa1]/50 focus:ring-0 rounded-md outline-none" placeholder="••••••••" type="password" required />
          </div>
          <p id="reg-confirm-error" class="text-[#FF6584] text-[11px] ml-1 font-medium hidden">Паролі не збігаються</p>
        </div>
        <div id="register-error" class="hidden text-[#ffb4ab] text-sm text-center p-3 bg-[#93000a]/20 rounded-lg"></div>
        <div class="pt-2">
          <button class="w-full py-4 bg-[#6C63FF] text-white font-bold rounded-xl primary-glow hover:brightness-110 active:scale-[0.98] transition-all duration-200" type="submit">
            Зареєструватися
          </button>
        </div>
      </form>
    </section>
    <p class="text-center mt-3 text-[#c7c4d8] text-sm">
      Вже маєте акаунт?
      <a class="text-[#4ddada] font-bold hover:underline ml-1" href="#/login">Увійти</a>
    </p>
  </div>
</main>
${renderFooter()}`;
}

export function initRegister() {
  const form = document.getElementById('register-form');
  const errorEl = document.getElementById('register-error');
  const emailInput = document.getElementById('reg-email');
  const emailCheck = document.getElementById('reg-email-check');
  const passwordInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm');
  const confirmWrapper = document.getElementById('reg-confirm-wrapper');
  const confirmIcon = document.getElementById('reg-confirm-icon');
  const confirmError = document.getElementById('reg-confirm-error');

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.querySelector('.material-symbols-outlined').textContent = 'visibility_off';
      } else {
        input.type = 'password';
        btn.querySelector('.material-symbols-outlined').textContent = 'visibility';
      }
    });
  });

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
      emailCheck.classList.toggle('hidden', !valid);
    });
  }

  if (confirmInput && passwordInput) {
    confirmInput.addEventListener('input', () => {
      const mismatch = confirmInput.value.length > 0 && confirmInput.value !== passwordInput.value;
      confirmWrapper.classList.toggle('border-[#FF6584]/50', mismatch);
      confirmIcon.classList.toggle('text-[#FF6584]', mismatch);
      confirmError.classList.toggle('hidden', !mismatch);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;

      if (!name || !email || !password || !confirm) {
        errorEl.textContent = 'Будь ласка, заповніть усі поля';
        errorEl.classList.remove('hidden');
        return;
      }
      if (password.length < 6) {
        errorEl.textContent = 'Пароль має містити щонайменше 6 символів';
        errorEl.classList.remove('hidden');
        return;
      }
      if (password !== confirm) {
        errorEl.textContent = 'Паролі не збігаються';
        errorEl.classList.remove('hidden');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Реєстрація...';

      try {
        await registerAPI(name, email, password);
        await preferencesStore.load();
        toast('Реєстрація успішна!', 'success');
        setTimeout(() => { window.location.hash = '#/onboarding'; }, 400);
      } catch (err) {
        errorEl.textContent = err.message || 'Помилка реєстрації';
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Зареєструватися';
      }
    });
  }
}
