import { renderAIInsight } from '../components/ai-insight.js';
import { taskStore, CATEGORIES } from '../services/task-store.js';

export function renderAnalytics() {
  const heatColors = ['#252540', '#3a3a60', '#5252a0', '#6C63FF'];
  function rH() { return heatColors[Math.floor(Math.random() * heatColors.length)]; }

  let hm = '';
  for (let i = 0; i < 84; i++) {
    hm += `<div class="w-3 h-3 rounded-sm" style="background:${rH()}"></div>`;
  }

  function devBadge() {
    return `<div class="absolute inset-0 bg-[#0d0d18]/60 backdrop-blur-[2px] z-20 flex min-h-full items-center justify-center rounded-2xl transition-all hover:backdrop-blur-0">
      <span class="bg-[#1b1a26]/90 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-white/20 shadow-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">У розробці 🚧</span>
    </div>`;
  }

  return `<div class="max-w-[1400px] mx-auto">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <div class="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative">
    <div class="flex justify-between items-start"><span class="text-slate-400 text-xs font-medium uppercase tracking-wider">✅ Виконано</span><span class="material-symbols-outlined text-[#c4c0ff]/60">task_alt</span></div>
    <div><div class="text-5xl font-black text-white mb-2 tracking-tighter" id="stat-completed-count">0</div><div class="text-[11px] text-slate-500 font-medium">всього задач</div></div>
    <div class="text-[10px] font-bold text-[#c7c4d8] flex items-center gap-1 uppercase tracking-widest">Динамічно з бази</div>
  </div>

  <div class="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative">
    <div class="flex justify-between items-start"><span class="text-slate-400 text-xs font-medium uppercase tracking-wider">⏱ Середній час</span><span class="material-symbols-outlined text-[#ffb2bc]/60">schedule</span></div>
    <div><div class="text-5xl font-black text-white mb-2 tracking-tighter" id="stat-avg-time">0 <span class="text-xl font-medium opacity-50">год</span></div><div class="text-[11px] text-slate-500 font-medium">на виконану задачу</div></div>
    <div class="text-[10px] font-bold text-[#c7c4d8] flex items-center gap-1 uppercase tracking-widest">Реальний трекінг</div>
  </div>

  <div class="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative group overflow-hidden">
    ${devBadge()}
    <div class="flex justify-between items-start">
      <div><span class="text-slate-400 text-xs font-medium uppercase tracking-wider">🎯 Коефіцієнт</span><div class="text-4xl font-black text-white mt-2">82%</div></div>
      <div class="relative w-14 h-14"><svg class="w-full h-full -rotate-90"><circle cx="28" cy="28" fill="transparent" r="24" stroke="rgba(255,255,255,0.05)" stroke-width="6"/><circle cx="28" cy="28" fill="transparent" r="24" stroke="#4ddada" stroke-dasharray="150" stroke-dashoffset="27" stroke-width="6"/></svg><span class="absolute inset-0 flex items-center justify-center text-[10px] font-mono">82%</span></div>
    </div>
    <div class="text-[11px] font-bold text-[#4ddada] flex items-center gap-1"><span class="material-symbols-outlined text-xs">trending_up</span>↑+5%</div>
  </div>

  <div class="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 relative overflow-hidden group">
    ${devBadge()}
    <div class="absolute -right-4 -bottom-4 opacity-10"><span class="material-symbols-outlined text-9xl text-[#ffb2bc]" style="font-variation-settings:'FILL' 1">local_fire_department</span></div>
    <div class="flex justify-between items-start"><span class="text-slate-400 text-xs font-medium uppercase tracking-wider">🔥 Серія</span><span class="material-symbols-outlined text-[#ffb2bc]" style="font-variation-settings:'FILL' 1">local_fire_department</span></div>
    <div><div class="text-4xl font-black text-white mb-1">7 днів</div><div class="text-[11px] text-slate-500">поспіль</div></div>
    <div class="w-full h-1 bg-[#343440] rounded-full overflow-hidden mt-2"><div class="h-full bg-gradient-to-r from-[#ffb2bc] to-amber-500 w-[70%]"></div></div>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-8">
  <div class="lg:col-span-6 glass-card p-8 rounded-2xl flex flex-col">
    <div class="flex justify-between items-center mb-8">
      <h3 class="font-bold text-lg">Продуктивність (виконані задачі)</h3>
      <div class="flex bg-[#1b1a26] p-1.5 rounded-xl border border-white/5" id="prod-period-toggles">
        <button class="prod-btn px-4 py-1.5 text-xs font-bold rounded-lg bg-[#c4c0ff] text-[#2000a4] shadow-md transition-all active:scale-95" data-val="Тиждень">Тиждень</button>
        <button class="prod-btn px-4 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95" data-val="Місяць">Місяць</button>
        <button class="prod-btn px-4 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95" data-val="Квартал">Квартал</button>
      </div>
    </div>
    <div class="w-full overflow-x-auto custom-scrollbar pb-2 flex-1 flex items-end">
       <div class="h-64 border-b border-white/5 flex items-end justify-between gap-2 sm:gap-4 px-2 min-w-[400px] w-full" id="analytics-prod-chart"></div>
    </div>
  </div>

  <div class="lg:col-span-4 glass-card p-8 rounded-2xl flex flex-col items-center">
    <div class="flex justify-between items-center w-full mb-6">
      <h3 class="font-bold text-lg">Розподіл за категоріями</h3>
    </div>
    <div class="flex w-full bg-[#1b1a26] p-1.5 rounded-xl border border-white/5 mb-8" id="cat-period-toggles">
      <button class="cat-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-[#343440] text-white shadow-md transition-all active:scale-95" data-val="7">7 днів</button>
      <button class="cat-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95" data-val="30">30 днів</button>
      <button class="cat-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95" data-val="90">90 днів</button>
      <button class="cat-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95" data-val="all">Усі</button>
    </div>
    <div id="analytics-cat-chart" class="w-full flex-1 flex flex-col items-center justify-center"></div>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
  ${devBadge()}
  <div class="glass-card p-8 rounded-2xl overflow-hidden relative group">
    <div class="flex justify-between items-center mb-6"><h3 class="font-bold text-lg">Теплова карта</h3>
      <div class="flex items-center gap-2"><span class="text-[10px] text-slate-500">Less</span><div class="flex gap-1"><div class="w-3 h-3 rounded-sm bg-[#252540]"></div><div class="w-3 h-3 rounded-sm bg-[#3a3a60]"></div><div class="w-3 h-3 rounded-sm bg-[#5252a0]"></div><div class="w-3 h-3 rounded-sm bg-[#6C63FF]"></div></div><span class="text-[10px] text-slate-500">More</span></div>
    </div>
    <div class="flex gap-2"><div class="flex flex-col gap-[3px] text-[8px] font-mono text-slate-500 pt-1"><span>Mon</span><div class="h-3"></div><span>Wed</span><div class="h-3"></div><span>Fri</span><div class="h-3"></div><span>Sun</span></div><div class="flex-1 overflow-x-auto no-scrollbar"><div class="grid grid-flow-col grid-rows-7 gap-[3px] w-max">${hm}</div></div></div>
  </div>

  <div class="glass-card p-8 rounded-2xl flex flex-col relative group">
    <h3 class="font-bold text-lg mb-6">Найпродуктивніший час</h3>
    <div class="flex-1 space-y-4 mb-8">
      <div class="flex items-center gap-4"><span class="w-10 text-[10px] font-mono text-slate-500">06:00</span><div class="flex-1 h-3 bg-[#1b1a26] rounded-full overflow-hidden"><div class="h-full bg-[#c4c0ff]/20" style="width:15%"></div></div></div>
      <div class="flex items-center gap-4"><span class="w-10 text-[10px] font-mono text-white font-bold">10:00</span><div class="flex-1 h-3 bg-[#1b1a26] rounded-full overflow-hidden"><div class="h-full bg-[#4ddada] ai-insight-glow" style="width:85%"></div></div><span class="material-symbols-outlined text-[#4ddada] text-sm" style="font-variation-settings:'FILL' 1">bolt</span></div>
      <div class="flex items-center gap-4"><span class="w-10 text-[10px] font-mono text-slate-500">13:00</span><div class="flex-1 h-3 bg-[#1b1a26] rounded-full overflow-hidden"><div class="h-full bg-[#c4c0ff]/20" style="width:30%"></div></div></div>
      <div class="flex items-center gap-4"><span class="w-10 text-[10px] font-mono text-white font-bold">16:00</span><div class="flex-1 h-3 bg-[#1b1a26] rounded-full overflow-hidden"><div class="h-full bg-[#4ddada] ai-insight-glow" style="width:95%"></div></div><span class="material-symbols-outlined text-[#4ddada] text-sm" style="font-variation-settings:'FILL' 1">bolt</span></div>
      <div class="flex items-center gap-4"><span class="w-10 text-[10px] font-mono text-slate-500">20:00</span><div class="flex-1 h-3 bg-[#1b1a26] rounded-full overflow-hidden"><div class="h-full bg-[#c4c0ff]/20" style="width:40%"></div></div></div>
    </div>
    ${renderAIInsight({ title: 'AI Insight', message: '<b class="text-white">Ти закриваєш найбільше задач</b> у вівторок з 14:00 до 16:00.', icon: 'lightbulb' })}
  </div>
</div>
</div>`;
}

export async function initAnalytics() {
  const prodChart = document.getElementById('analytics-prod-chart');
  const catChart = document.getElementById('analytics-cat-chart');
  const statCompleted = document.getElementById('stat-completed-count');
  const statAvgTime = document.getElementById('stat-avg-time');

  let as = {
    prodPeriod: 'Тиждень',
    catPeriod: '7',
    anchorDate: new Date(),
  };

  const getLocalDateKey = (date) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDayStr = getLocalDateKey;

const normalizePlannedDate = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      const [day, month, year] = value.split('.');
      return `${year}-${month}-${day}`;
    }
  }

  return getLocalDateKey(value);
};

const normalizeCompletedDate = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
      const safeValue = hasTimezone ? value : `${value}Z`;

      return getLocalDateKey(safeValue);
    }

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      const [day, month, year] = value.split('.');
      return `${year}-${month}-${day}`;
    }
  }

  return getLocalDateKey(value);
};

const getCompletedDateKey = (task) => {
  const completed = task.completed_at || task.completedAt;

  if (completed) {
    return normalizeCompletedDate(completed);
  }

  const updated = task.updated_at || task.updatedAt;

  if (updated) {
    return normalizeCompletedDate(updated);
  }
  return '';
};

  const parseDuration = (str) => {
    if (!str) return 0;

    if (str.includes('год')) return parseFloat(str) || 1;
    if (str.includes('хв')) return (parseFloat(str) || 30) / 60;

    return parseFloat(str) || 0;
  };

  const getCompletedTasks = () => {
    return taskStore.getAll().filter(t => t.status === 'Виконано');
  };

  const calculateCoreStats = (completedTasks) => {
    statCompleted.textContent = completedTasks.length;

    let totalHrs = 0;
    let countWithTime = 0;

    completedTasks.forEach(t => {
      if (t.duration) {
        totalHrs += parseDuration(t.duration);
        countWithTime++;
      }
    });

    if (countWithTime > 0) {
      statAvgTime.innerHTML = `${(totalHrs / countWithTime).toFixed(1)} <span class="text-xl font-medium opacity-50">год</span>`;
    } else {
      statAvgTime.innerHTML = `— <span class="text-xl font-medium opacity-50">год</span>`;
    }
  };

  const renderProdChart = () => {
    const tasks = getCompletedTasks();
    const anchor = as.anchorDate;

    const labels = [];
    const counts = [];

    if (as.prodPeriod === 'Тиждень') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(anchor);
        d.setDate(anchor.getDate() - i);

        const dayKey = getDayStr(d);

        labels.push(['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()]);
        counts.push(tasks.filter(t => getCompletedDateKey(t) === dayKey).length);
      }
    }

    if (as.prodPeriod === 'Місяць') {
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(anchor);
        weekEnd.setDate(anchor.getDate() - (i * 7));

        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        const startKey = getDayStr(weekStart);
        const endKey = getDayStr(weekEnd);

        labels.push(`Тижд ${4 - i}`);

        counts.push(tasks.filter(t => {
          const doneKey = getCompletedDateKey(t);
          return doneKey && doneKey >= startKey && doneKey <= endKey;
        }).length);
      }
    }

    if (as.prodPeriod === 'Квартал') {
      const mNames = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'];

      for (let i = 3; i >= 0; i--) {
        const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);

        labels.push(mNames[d.getMonth()]);

        counts.push(tasks.filter(t => {
          const doneKey = getCompletedDateKey(t);
          if (!doneKey) return false;

          const td = new Date(`${doneKey}T00:00:00`);

          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
        }).length);
      }
    }

    const maxVal = Math.max(...counts, 4);

    prodChart.innerHTML = labels.map((label, i) => {
      const count = counts[i];
      const height = Math.max(5, (count / maxVal) * 100);
      const selected = i === labels.length - 1;

      return `<div class="flex flex-col items-center gap-3 flex-1 group h-full justify-end" style="animation-delay:${i * 0.05}s">
        <div class="w-full bg-gradient-to-t from-[#c4c0ff]/20 to-[#4ddada]/60 rounded-t-lg transition-all duration-300 ease-out group-hover:to-[#4ddada] group-hover:shadow-[0_0_15px_rgba(77,218,218,0.3)] border-t border-[#4ddada]/50${selected ? ' shadow-[0_0_20px_rgba(108,99,255,0.2)]' : ''} relative" style="height:${height}%">
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#292935] px-2.5 py-1 rounded-md shadow-xl text-[10px] font-bold text-white pointer-events-none transition-all duration-200 border border-white/10 z-10">${count}</div>
        </div>
        <span class="text-[10px] font-mono whitespace-nowrap pt-1 ${selected ? 'text-white font-bold underline underline-offset-4 decoration-[#c4c0ff]' : 'text-slate-500'}">${label}</span>
      </div>`;
    }).join('');
  };

  const renderCatChart = () => {
    let tasks = taskStore.getAll();

    if (as.catPeriod !== 'all') {
      const days = parseInt(as.catPeriod, 10);
      const limit = new Date(as.anchorDate);
      limit.setDate(limit.getDate() - days);

      const limitKey = getDayStr(limit);

      tasks = tasks.filter(t => {
        const taskKey = normalizePlannedDate(t.date || t.created_at || t.createdAt);
        return taskKey && taskKey >= limitKey;
      });
    }

    if (tasks.length === 0) {
      catChart.innerHTML = `<div class="h-48 flex flex-col items-center justify-center w-full opacity-50"><span class="material-symbols-outlined text-4xl mb-4 text-slate-500">pie_chart</span><span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Немає задач за період</span></div>`;
      return;
    }

    const catCounts = {};

    tasks.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

    const topCats = [];
    let othersCount = 0;

    sorted.forEach((item, index) => {
      if (index < 4) {
        topCats.push({ id: item[0], count: item[1] });
      } else {
        othersCount += item[1];
      }
    });

    if (othersCount > 0) {
      topCats.push({ id: 'others', count: othersCount });
    }

    const total = tasks.length;
    const palette = ['#6C63FF', '#4ddada', '#ffb2bc', '#fbbf24', '#8b8a9d'];
    const circumference = 2 * Math.PI * 40;

    let svgHtml = '';
    let legendHtml = '';
    let currentOffset = 0;

    topCats.forEach((item, i) => {
      const fraction = item.count / total;
      const strokeLen = fraction * circumference;
      const color = palette[i];
      const name = item.id === 'others' ? 'Інші' : (CATEGORIES[item.id]?.label || item.id);
      const pct = Math.round(fraction * 100);

      svgHtml += `<circle cx="50" cy="50" fill="transparent" r="40" stroke="${color}" stroke-dasharray="${strokeLen} ${circumference}" stroke-dashoffset="${-currentOffset}" stroke-width="12" class="transition-all duration-1000 ease-out origin-center cursor-pointer hover:stroke-[15px]" />`;

      currentOffset += strokeLen;

      legendHtml += `<div class="flex items-center gap-3 bg-[#1b1a26] p-2 rounded-xl group hover:bg-[#292935] transition-colors">
        <div class="w-2.5 h-2.5 rounded-full ring-2 ring-white/5" style="background:${color}"></div>
        <span class="text-xs text-slate-400 capitalize truncate font-medium group-hover:text-white transition-colors" title="${name}">${name}</span>
        <span class="text-xs font-mono ml-auto font-bold text-white">${pct}%</span>
      </div>`;
    });

    catChart.innerHTML = `
      <div class="relative w-48 h-48 mb-8 group">
        <svg class="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">${svgHtml}</svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-110 duration-300">
          <span class="text-4xl font-black text-white leading-none">${total}</span>
          <span class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">задач</span>
        </div>
      </div>
      <div class="w-full grid grid-cols-2 gap-3 px-2">${legendHtml}</div>`;
  };

  const refreshAnalytics = () => {
    const completedTasks = getCompletedTasks();

    calculateCoreStats(completedTasks);
    renderProdChart();
    renderCatChart();
  };

  document.querySelectorAll('.prod-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.prod-btn').forEach(b => {
        b.className = 'prod-btn px-4 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95';
      });

      btn.className = 'prod-btn px-4 py-1.5 text-xs font-bold rounded-lg bg-[#c4c0ff] text-[#2000a4] shadow-md transition-all active:scale-95';

      as.prodPeriod = btn.dataset.val;
      refreshAnalytics();
    };
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = 'cat-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg text-slate-400 hover:text-white transition-all active:scale-95';
      });

      btn.className = 'cat-btn flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-[#343440] text-white shadow-md transition-all active:scale-95';

      as.catPeriod = btn.dataset.val;
      refreshAnalytics();
    };
  });

  window.addEventListener('task-store-update', refreshAnalytics);

  try {
    await taskStore.loadFromAPI();
    refreshAnalytics();
  } catch (err) {
    console.error('Не вдалося завантажити задачі:', err);
    refreshAnalytics();
  }
}