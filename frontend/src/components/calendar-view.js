import { taskStore, CATEGORIES } from '../services/task-store.js';

const MONTHS_UA = ['СІЧЕНЬ','ЛЮТИЙ','БЕРЕЗЕНЬ','КВІТЕНЬ','ТРАВЕНЬ','ЧЕРВЕНЬ','ЛИПЕНЬ','СЕРПЕНЬ','ВЕРЕСЕНЬ','ЖОВТЕНЬ','ЛИСТОПАД','ГРУДЕНЬ'];
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
const HOURS_LIST = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
const PX_PER_HOUR = 60;

function sameDay(a, b) { 
    return a.getFullYear() === b.getFullYear() && 
           a.getMonth() === b.getMonth() && 
           a.getDate() === b.getDate(); 
}

export function renderCalendarView(options = {}) {
    const { expanded = false, anchorDate, viewMode = 'week' } = options;
    const padding = expanded ? 'p-8' : 'p-6';
    const gridMinHeight = expanded ? 'min-h-[1200px]' : 'min-h-[840px]';
    const hourHeight = expanded ? 80 : 60; // Larger hours in expanded mode
    
    if (viewMode === 'week') {
        return renderWeekGrid(anchorDate, expanded, hourHeight, gridMinHeight);
    } else {
        return renderMonthGrid(anchorDate, expanded);
    }
}

function renderWeekGrid(anchor, expanded, hHeight, minH) {
    let startOfWeek = new Date(anchor);
    let day = startOfWeek.getDay();
    let diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    let hdr = '<div class="h-12"></div>';
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek); d.setDate(d.getDate() + i);
        const isToday = sameDay(d, new Date());
        hdr += isToday
            ? `<div class="h-12 flex items-center justify-center flex-col bg-[#c4c0ff]/5 border-x border-white/5"><span class="text-[10px] text-[#c4c0ff] font-bold uppercase">${DAYS_SHORT[i]}</span><span class="text-xs font-mono text-[#c4c0ff] font-bold underline">${d.getDate()}</span></div>`
            : `<div class="h-12 flex items-center justify-center flex-col"><span class="text-[10px] text-[#c7c4d8] font-bold uppercase">${DAYS_SHORT[i]}</span><span class="text-xs font-mono">${d.getDate()}</span></div>`;
    }

    const tasks = taskStore.getAll();
    let tc = `<div class="border-r border-[#464555]/10 text-[9px] font-mono text-[#c7c4d8]/60 flex flex-col justify-between py-2 text-right pr-2">`;
    HOURS_LIST.forEach(h => { tc += `<div style="height:${hHeight}px">${h}</div>`; });
    tc += '</div>';

    let cols = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek); d.setDate(d.getDate() + i);
        const isToday = sameDay(d, new Date());
        
        // Filter tasks for this day
        const dayTasks = tasks.filter(t => {
            if (!t.date) return false;
            // Support both YYYY-MM-DD and DD.MM.YYYY matching correctly gracefully
            let isoCheck = t.date === d.toISOString().slice(0, 10);
            return isoCheck || t.date === `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth()+1).padStart(2, '0')}.${d.getFullYear()}`;
        });
        
        let blocksHtml = '';

        // Render actual tasks
        dayTasks.forEach(t => {
            const startStr = t.time || '09:00';
            const [h, m] = startStr.split(':').map(Number);
            const startHour = h + (m/60);
            const top = (startHour - 8) * hHeight;
            
            // Duration parsing (simple)
            let durHrs = 1;
            if (t.duration?.includes('год')) durHrs = parseFloat(t.duration) || 1;
            else if (t.duration?.includes('хв')) durHrs = (parseFloat(t.duration) || 30) / 60;
            
            const height = Math.max(30, durHrs * hHeight);
            const cat = CATEGORIES[t.category] || { color: '#c4c0ff' };
            
            blocksHtml += `
                <div class="cal-event absolute left-1 right-1 rounded-xl p-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group border-l-4 shadow-xl overflow-hidden" 
                     style="top:${top}px;height:${height}px;background:${cat.color}20;border-left-color:${cat.color};" 
                     data-task="${t.id}">
                    <p class="text-[10px] font-bold leading-tight text-white group-hover:text-[#c4c0ff] transition-colors truncate">${t.title}</p>
                    ${height > 40 ? `<p class="text-[8px] font-mono text-[#c7c4d8] mt-1 truncate">${startStr}</p>` : ''}
                </div>`;
        });

        const border = i < 6 ? ' border-r border-[#464555]/10' : '';
        cols += `<div class="relative ${border} ${isToday ? 'bg-[#c4c0ff]/5' : ''}">${blocksHtml}</div>`;
    }

    const showNow = new Date() >= startOfWeek && new Date() <= new Date(startOfWeek.getTime() + 6*86400000);
    const mNow = new Date();
    const nowTop = ((mNow.getHours() + mNow.getMinutes()/60) - 8) * hHeight;
    const nowLine = showNow ? `<div class="absolute w-full left-0 z-40 flex items-center pointer-events-none" style="top:${nowTop}px"><div class="w-full border-t-2 border-error/50 relative"><div class="absolute -top-1.5 -left-1 w-3 h-3 bg-error rounded-full shadow-[0_0_12px_rgba(255,180,171,0.6)]"></div></div></div>` : '';

    return `
        <div class="h-full flex flex-col">
            <div class="grid grid-cols-[44px_repeat(7,1fr)] border-b border-white/5">${hdr}</div>
            <div class="flex-1 relative overflow-y-auto custom-scrollbar bg-[#0d0d18]/50">
                ${nowLine}
                <div class="grid grid-cols-[44px_repeat(7,1fr)] relative ${minH}">${tc}${cols}</div>
            </div>
        </div>
    `;
}

function renderMonthGrid(anchor, expanded) {
    const y = anchor.getFullYear(), m = anchor.getMonth();
    let firstDay = new Date(y, m, 1).getDay();
    if (firstDay === 0) firstDay = 7;
    firstDay--;

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const tasks = taskStore.getAll();
    
    let html = `
        <div class="${expanded ? 'p-8' : 'p-4'} h-full flex flex-col">
            <div class="grid grid-cols-7 gap-2 mb-4">
                ${DAYS_SHORT.map(d => `<div class="text-center text-[10px] font-bold text-slate-500 uppercase py-2 tracking-widest">${d}</div>`).join('')}
            </div>
            <div class="grid grid-cols-7 gap-2 flex-1">
    `;

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="rounded-2xl border border-white/5 bg-[#1b1a26]/20"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const curDate = new Date(y, m, d);
        const isToday = sameDay(curDate, new Date());
        const isoDate = curDate.toISOString().slice(0, 10);
        const altDate = `${String(d).padStart(2, '0')}.${String(m+1).padStart(2, '0')}.${y}`;
        const dayTasks = tasks.filter(t => t.date === isoDate || t.date === altDate);
        
        const bg = isToday ? 'bg-[#c4c0ff]/10 border-[#c4c0ff]/30' : 'bg-[#1b1a26]/50 hover:bg-[#1b1a26] border-white/5';
        
        html += `
            <div class="cal-month-day rounded-2xl border ${bg} ${expanded ? 'p-4' : 'p-2'} cursor-pointer transition-all flex flex-col group min-h-[80px]" data-day="${d}">
                <span class="text-xs font-mono ${isToday ? 'text-[#c4c0ff] font-bold' : 'text-slate-500 group-hover:text-white'}">${d}</span>
                <div class="flex flex-wrap gap-1 mt-auto">
                    ${dayTasks.map(t => {
                        const cat = CATEGORIES[t.category] || { color: '#c4c0ff' };
                        return `<div class="w-1.5 h-1.5 rounded-full shadow-sm" style="background:${cat.color}"></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    html += `</div></div>`;
    return html;
}

export function initCalendarView(container, options = {}) {
    const { onTaskClick, onDayClick } = options;
    
    container.addEventListener('click', (e) => {
        const eventEl = e.target.closest('.cal-event');
        if (eventEl && onTaskClick) {
            onTaskClick(eventEl.dataset.task);
            return;
        }
        
        const dayEl = e.target.closest('.cal-month-day');
        if (dayEl && onDayClick) {
            onDayClick(parseInt(dayEl.dataset.day));
            return;
        }
    });
}
