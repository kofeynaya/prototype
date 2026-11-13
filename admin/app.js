/* Бэк-офис «Кофейная» — ядро: хранилище, права, журнал, окна, обзор, гости, заказы, поддержка, подтверждения */
'use strict';
const KEY = 'kofeynaya-admin-v1';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = n => Math.round(+n || 0).toLocaleString('ru-RU').replace(/\s/g, ' ');
const rub = n => nf(n) + ' ₽';
const pct = n => nf(n) + ' %';
const clone = o => JSON.parse(JSON.stringify(o));
const isoDay = (d = new Date()) => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
const MONG = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const dLong = iso => { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return `${d} ${MONG[m - 1]}${y !== new Date().getFullYear() ? ' ' + y : ''}`; };
const dShort = iso => { if (!iso) return '—'; const [, m, d] = iso.slice(0, 10).split('-').map(Number); return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}`; };
const tm = ts => { const d = new Date(ts); return `${dShort(isoDay(d))} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const daysTo = iso => Math.round((new Date(iso) - new Date(isoDay())) / 864e5);
const plural = (n, a, b, c) => { const m = Math.abs(n) % 100, k = m % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };
const X_SVG = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const SEARCH_SVG = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
const AV_BG = ['#a7d2b9','#ecccce','#9bd9d9','#fef2e9','#f2c230','#c5b4e3','#f9b77d'];
const ava = g => `<span class="ava" style="background:${AV_BG[(g.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AV_BG.length]}">${esc((g.n || '?')[0])}</span>`;
const gName = g => g ? `${g.n} ${g.l || ''}`.trim() : '—';

/* ───────── роли и права ───────── */
const ROLES = ['Владелец', 'Управляющий', 'Маркетолог', 'Поддержка', 'Старший бариста'];
const PERMS = [
  ['guests.view',  'Видеть гостей и их историю'],
  ['guests.edit',  'Менять профиль гостя (имя, телефон, ДР)'],
  ['guests.bonus', 'Начислять и списывать бонусы'],
  ['guests.depo',  'Менять депозит'],
  ['guests.sub',   'Выдавать и отключать Кофейная+'],
  ['guests.streak','Править посещения, заморозки, подарки'],
  ['guests.block', 'Блокировать гостя'],
  ['orders.refund','Делать возвраты'],
  ['menu.edit',    'Менять меню, цены и фото'],
  ['shops.edit',   'Менять кофейни, часы и стоп-лист'],
  ['mech.edit',    'Менять правила механик'],
  ['offers.edit',  'Предложения дня и цены недели'],
  ['push.send',    'Отправлять пуши'],
  ['content.edit', 'Тексты, сторис, баннеры, онбординг'],
  ['support.reply','Отвечать в поддержке'],
  ['staff.edit',   'Сотрудники и права'],
  ['system',       'Интеграции и резервная копия'],
];
const PERM_DEF = {
  'Владелец':        Object.fromEntries(PERMS.map(p => [p[0], true])),
  'Управляющий':     {'guests.view':1,'guests.edit':1,'guests.bonus':1,'guests.depo':1,'guests.sub':1,'guests.streak':1,'guests.block':1,'orders.refund':1,'menu.edit':1,'shops.edit':1,'offers.edit':1,'push.send':1,'support.reply':1},
  'Маркетолог':      {'guests.view':1,'offers.edit':1,'push.send':1,'content.edit':1,'mech.edit':0},
  'Поддержка':       {'guests.view':1,'guests.edit':1,'guests.bonus':1,'guests.streak':1,'orders.refund':1,'support.reply':1},
  'Старший бариста': {'guests.view':1,'shops.edit':1},
};
const LIMIT_DEF = {'Владелец':{bonus:0, depo:0}, 'Управляющий':{bonus:5000, depo:5000}, 'Маркетолог':{bonus:0, depo:0}, 'Поддержка':{bonus:500, depo:0}, 'Старший бариста':{bonus:0, depo:0}};

/* ───────── хранилище ───────── */
function freshDB() {
  const cfg = {}; SCHEMA.forEach(s => { cfg[s.id] = {}; s.fields.forEach(f => cfg[s.id][f.k] = clone(f.v)); });
  return {
    v: 2, me: 's1', cfg, ver: {},
    perms: clone(PERM_DEF), limits: clone(LIMIT_DEF),
    staff: [
      {id:'s1', n:'Вы', role:'Владелец', shops:'Все', on:true},
      {id:'s2', n:'Ирина Гусева', role:'Управляющий', shops:'Все', on:true},
      {id:'s3', n:'Дарья Ким', role:'Маркетолог', shops:'Все', on:true},
      {id:'s4', n:'Анна Белова', role:'Поддержка', shops:'Все', on:true},
      {id:'s5', n:'Олег Седов', role:'Старший бариста', shops:'Кофейная 5', on:true},
    ],
    guests: clone(SEED.guests), orders: clone(SEED.orders), tickets: clone(SEED.tickets),
    ops: [], approvals: [], audit: [], pushes: [], gifts: [],
    menuOv: {}, newItems: [], cats: null, shops: null, zones: null,
    offers: null, campaigns: [], week: null, segments: null, autos: null, content: null, search: null, heroesOff: [], acc: null,
  };
}
let DB;
try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { DB = null; }
if (!DB || DB.v !== 2) DB = freshDB();
SCHEMA.forEach(s => { DB.cfg[s.id] = DB.cfg[s.id] || {}; s.fields.forEach(f => { if (!(f.k in DB.cfg[s.id])) DB.cfg[s.id][f.k] = clone(f.v); }); });
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(DB)); return true; }
  catch (e) { toast('Не сохранилось: память браузера заполнена. Удалите загруженные фото или сделайте сброс'); return false; }
}
const ME = () => DB.staff.find(s => s.id === DB.me) || DB.staff[0];
const can = p => !!(DB.perms[ME().role] || {})[p];
const lim = k => (DB.limits[ME().role] || {})[k] || 0;
const G = id => DB.guests.find(g => g.id === id);
const C = (sec, k) => DB.cfg[sec][k];

function audit(what, detail = '', extra = {}) {
  DB.audit.unshift({at: Date.now(), by: ME().n, role: ME().role, what, detail, ...extra});
  if (DB.audit.length > 3000) DB.audit.length = 3000;
}
const noPerm = p => `<div class="note red">🔒 <span>У роли «${esc(ME().role)}» нет права: <b>${esc((PERMS.find(x => x[0] === p) || [, p])[1])}</b>. Смените роль сверху или попросите владельца</span></div>`;

/* ───────── окна ───────── */
let toastT;
function toast(t) { t = String(t); $$('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = t; document.body.appendChild(d); clearTimeout(toastT); toastT = setTimeout(() => d.remove(), 5000); d.onclick = () => d.remove(); }
/* окна — стопкой: у каждого свой обработчик «Готово» (раньше вложенное окно затирало обработчик родителя) */
function modal({t, body, ok = 'Готово', cls = 'pri', onOk, cancel = 'Отмена', wide}) {
  const el = document.createElement('div'); el.className = 'ov c'; el.dataset.modal = 1; el._onOk = onOk || null;
  el.innerHTML = `<div class="md" style="${wide ? 'width:min(760px,100%)' : ''}"><div class="md-h"><h2>${t}</h2><button class="cls" onclick="tryClose(this)" aria-label="Закрыть">${X_SVG}</button></div>
    <div class="md-b">${body}</div><div class="md-f">${cancel ? `<button class="btn" onclick="tryClose(this)">${cancel}</button>` : ''}${ok ? `<button class="btn ${cls}" id="mdOk" onclick="modalOk(this)">${ok}</button>` : ''}</div></div>`;
  el.addEventListener('mousedown', e => { if (e.target === el) tryClose(el); });
  el.addEventListener('input', () => { el.dataset.dirty = 1; });
  $('#layer').appendChild(el);
  const f = el.querySelector('input:not([type=checkbox]):not([type=radio]),textarea,select'); if (f && innerWidth > 860) f.focus();
}
const topModal = b => (b && b.closest && b.closest('[data-modal]')) || [...$$('[data-modal]')].pop();
function modalOk(b) { const m = topModal(b); if (!m) return; if (!m._onOk || m._onOk() !== false) m.remove(); }
function closeModal(b) { const m = topModal(b); if (m) m.remove(); }
/* закрытие крестиком, «Отмена», Esc, кликом мимо: если что-то вводили — спросить, как в Starter */
function tryClose(b) {
  const m = b && b.dataset && b.dataset.modal ? b : topModal(b); if (!m) return;
  if (m.dataset.guard) return;
  if (!m.dataset.dirty || !m._onOk) { m.remove(); return; }
  askSave(() => { if (m._onOk() !== false) m.remove(); }, () => m.remove());
}
function askSave(onSave, onDrop, txt = 'Вы что-то поменяли и не сохранили') {
  const el = document.createElement('div'); el.className = 'ov c'; el.dataset.modal = 1; el.dataset.ask = 1;
  el.innerHTML = `<div class="md" style="width:min(440px,100%)"><div class="md-h"><h2>Сохранить изменения?</h2></div><div class="md-b"><p style="margin:0">${txt}</p></div>
    <div class="md-f"><button class="btn" data-a="stay">Остаться</button><button class="btn" data-a="drop">Выйти без сохранения</button>${onSave ? '<button class="btn pri" data-a="save">Сохранить</button>' : ''}</div></div>`;
  el.addEventListener('click', e => { const a = e.target.dataset && e.target.dataset.a; if (!a) return; el.remove(); if (a === 'save') onSave(); if (a === 'drop') onDrop(); });
  $('#layer').appendChild(el);
}
function drawer(title, html, sub = '') {
  closeDrawer(true);
  const el = document.createElement('div'); el.className = 'ov'; el.id = 'drw';
  el.innerHTML = `<div class="dr"><div class="dr-h"><div style="flex:1;min-width:0"><h2>${title}</h2>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><button class="cls" onclick="closeDrawer()" aria-label="Закрыть">${X_SVG}</button></div><div class="dr-b" id="drb">${html}</div></div>`;
  el.addEventListener('mousedown', e => { if (e.target === el) closeDrawer(); });
  el.addEventListener('input', () => { el.dataset.dirty = 1; });
  $('#layer').appendChild(el);
}
function closeDrawer(silent, force) { const d = $('#drw'); if (d && !force && !silent && d.dataset.dirty) { askSave(null, () => closeDrawer(silent, 1), 'Изменения в этой карточке не сохранены'); return; } if (d) d.remove(); if (!silent && location.hash.split('/').length > 3) { history.replaceState(null, '', location.pathname + location.hash.split('/').slice(0, 3).join('/')); } }
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const o = $$('.tn>.it.open'); if (o.length) { o.forEach(x => x.classList.remove('open')); return; } const m = [...$$('[data-modal]')].pop(); if (m) { if (m.dataset.ask) m.remove(); else tryClose(m); } else if ($('#drw')) closeDrawer(); });
const val = id => { const e = document.getElementById(id); return e ? (e.type === 'checkbox' ? e.checked : e.value.trim()) : ''; };
const reasonBox = (list, id = 'rsn') => `<label class="fld"><span>Причина</span><select class="inp" id="${id}">${list.map(x => `<option>${x}</option>`).join('')}</select></label>
  <label class="fld"><span>Комментарий — попадёт в журнал</span><textarea class="inp" id="${id}c" placeholder="Например: номер обращения, что случилось"></textarea></label>`;
const needReason = (id = 'rsn') => { const c = val(id + 'c'); if (c.length < 4) { document.getElementById(id + 'c').classList.add('err'); toast('Напишите комментарий: зачем это делаем'); return null; } return `${val(id)} · ${c}`; };
const sw = (id, on, attrs = '') => `<label class="sw"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} ${attrs}><i></i></label>`;

/* ───────── навигация: верхнее меню, как в Starter CRM ───────── */
const NAV = [
  {t:'Заказы', ic:'🧾', id:'orders'},
  {t:'Клиенты', ic:'👥', id:'customers', also:['guests','guest','blacklist']},
  {t:'Маркетинг', ic:'📣', sub:[['segments','Сегменты'],['mailings','Рассылки'],['feedbacks','Отзывы'],['loyalty','Лояльность'],['referral','Реферальная программа'],['stories','Сторис'],['external','Внешний маркетинг'],['promos','Акции'],['masscodes','Массовые промокоды'],['autos','Триггерные рассылки'],['sources','Маркетинговые источники'],'Наше приложение',['mech','Правила механик'],['offers','Предложения дня'],['week','★ Цены недели'],['heroes','Герои дня и цвета'],['content','Экраны и тексты'],['push','Быстрый пуш']], also:['m','mailing']},
  {t:'Доставка', ic:'🛵', sub:[['couriers','Курьеры'],['deliveries','Доставки'],['shops','Зоны доставки']]},
  {t:'Точки', ic:'📍', sub:[['shops2','Точки продаж'],['loadpanel','Панель управления загрузкой']], also:['shop']},
  {t:'Каталог', ic:'☕', sub:[['menu','Блюда и цены'],['cats','Разделы меню'],['stop','Стоп-листы'],['package','Комплектация заказа'],['search','Поиск в приложении']]},
  {t:'Статистика', ic:'📊', id:'dash'},
  {t:'Онлайн-оплата', ic:'💳', sub:[['payonline','Онлайн-оплата'],['bills','Счета'],['transactions','Транзакции']]},
  {t:'Поддержка', ic:'💬', id:'support', cnt:() => DB.tickets.filter(t => t.st === 'new').length},
  {t:() => ME().n, ic:'👤', right:1, cnt:() => DB.approvals.filter(a => a.st === 'wait').length, sub:[['settings','Настройки проекта'],['staff','Сотрудники и права'],['approvals','Подтверждения', () => DB.approvals.filter(a => a.st === 'wait').length],['audit','Журнал действий'],['tickets','Тикеты'],['integr','Интеграции'],['backup','Резервная копия'],['risks','Что решить до запуска']]},
];
const PAGES = {};
let route = ['dash'];
const navOn = n => n.id === route[0] || (n.also || []).includes(route[0]) || (n.sub || []).some(x => Array.isArray(x) && x[0] === route[0]);
function navHtml() {
  return NAV.map((n, i) => { const c = n.cnt ? n.cnt() : 0, t = typeof n.t === 'function' ? n.t() : n.t, cn = c ? `<span class="cnt">${c}</span>` : '';
    if (!n.sub) return `<div class="it ${navOn(n) ? 'on' : ''}"><a href="#/${n.id}"><span class="i">${n.ic}</span>${esc(t)}${cn}</a></div>`;
    return `<div class="it ${navOn(n) ? 'on' : ''} ${n.right ? 'right' : ''}" data-i="${i}"><button onclick="navTog(${i})" aria-haspopup="true"><span class="i">${n.ic}</span>${esc(t)}${cn}<span class="car">▾</span></button>
      <div class="dd">${n.right ? `<label class="who">Вы вошли как${whoHtml()}</label>` : ''}${n.sub.map(x => typeof x === 'string' ? `<div class="dd-g">${x}</div>` : (() => { const k = x[2] ? x[2]() : 0; return `<a href="#/${x[0]}" class="${route[0] === x[0] ? 'on' : ''}">${x[1]}${k ? ` <span class="pill red" style="margin-left:auto">${k}</span>` : ''}</a>`; })()).join('')}</div></div>`; }).join('');
}
function navTog(i) { $$('.tn>.it').forEach(e => { if (+e.dataset.i !== i) e.classList.remove('open'); }); const e = $(`.tn>.it[data-i="${i}"]`); if (e) e.classList.toggle('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.tn')) $$('.tn>.it.open').forEach(x => x.classList.remove('open')); if (e.target.closest('.dd a')) { $$('.tn>.it.open').forEach(x => x.classList.remove('open')); document.body.classList.remove('nav-open'); } });
function whoHtml() {
  return `<select onchange="DB.me=this.value;save();render();toast('Теперь вы — '+esc(ME().n)+' ('+ME().role+')')">${DB.staff.filter(s => s.on).map(s => `<option value="${s.id}" ${s.id === DB.me ? 'selected' : ''}>${esc(s.n)} · ${esc(s.role)}</option>`).join('')}</select>`;
}
const ALIAS = {guests:'customers'};
function render() {
  route = (location.hash.replace(/^#\/?/, '') || 'dash').split('/').map(decodeURIComponent);
  if (ALIAS[route[0]] && PAGES[ALIAS[route[0]]]) route[0] = ALIAS[route[0]];
  const page = PAGES[route[0]] || PAGES.dash;
  $('#tn').innerHTML = navHtml();
  const sy = scrollY, same = render._last === route.join('/');
  $('#page').innerHTML = page(route);
  render._last = route.join('/');
  if (!same) scrollTo(0, 0); else scrollTo(0, sy);
  document.body.classList.remove('nav-open');
}
addEventListener('hashchange', () => { $$('[data-modal]').forEach(m => m.remove()); const d = $('#drw'); if (d && !location.hash.startsWith('#/guest/')) d.remove(); render(); });
const ph = (t, p, btns = '') => `<div class="ph"><div class="t"><h1>${t}</h1>${p ? `<p>${p}</p>` : ''}</div>${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;

/* ───────── Обзор ───────── */
PAGES.dash = () => {
  const gs = DB.guests, act = gs.filter(g => g.days7 > 0), avg = act.reduce((a, g) => a + g.days7, 0) / (act.length || 1);
  const dist = [1,2,3,4,5,6,7].map(d => act.filter(g => g.days7 === d).length), mx = Math.max(...dist, 1);
  const subs = gs.filter(g => g.plus).length, bon = gs.reduce((a, g) => a + g.bon, 0), dep = gs.reduce((a, g) => a + g.dep, 0);
  const wk = isoDay(new Date(Date.now() - 7 * 864e5)), o7 = DB.orders.filter(o => o.at >= wk && o.st !== 'Возврат');
  const rev = o7.reduce((a, o) => a + o.sum, 0), chk = rev / (o7.length || 1);
  const appr = DB.approvals.filter(a => a.st === 'wait').length, nt = DB.tickets.filter(t => t.st === 'new').length;
  const fun = [['Назначено', 1840], ['Показано', 1212], ['Открыто', 655], ['В корзине', 402], ['Куплено', 287]];
  return ph('Обзор', 'Главная цель — больше разных дней с покупкой в неделю у одного гостя (3 → 4, 5 → 6). Клики и «использования» — не цель. Данные вымышленные')
  + `${appr || nt ? `<div class="note" style="margin-bottom:16px">⏳ <span>${appr ? `<b>${appr}</b> ${plural(appr, 'действие ждёт', 'действия ждут', 'действий ждут')} подтверждения — <a href="#/approvals">открыть</a>. ` : ''}${nt ? `<b>${nt}</b> ${plural(nt, 'новое обращение', 'новых обращения', 'новых обращений')} в поддержке — <a href="#/support">ответить</a>` : ''}</span></div>` : ''}
  <div class="kpis">
    <div class="kpi main"><span>Дней с покупкой в неделю</span><b>${avg.toFixed(1).replace('.', ',')}</b><small>в среднем у активного гостя · цель 4+</small></div>
    <div class="kpi"><span>Активных за 7 дней</span><b>${nf(act.length)}</b><small>из ${nf(gs.length)} гостей</small></div>
    <div class="kpi"><span>С Кофейная+</span><b>${nf(subs)}</b><small>${Math.round(subs / gs.length * 100)}% гостей</small></div>
    <div class="kpi"><span>Выручка за 7 дней</span><b>${rub(rev)}</b><small>средний чек ${rub(chk)}</small></div>
    <div class="kpi"><span>Бонусов на счетах</span><b>${nf(bon)}</b><small>обязательство ≈ ${rub(bon * C('bonus', 'rate'))}</small></div>
    <div class="kpi"><span>Депозиты гостей</span><b>${rub(dep)}</b><small>деньги гостей у нас</small></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h2>Сколько дней в неделю приходят</h2><p class="muted small">Активные гости по числу дней с покупкой за последние 7 дней</p>
      <div class="chart">${dist.map((n, i) => `<div class="c"><b>${n}</b><i style="height:${Math.max(4, n / mx * 100)}%;${i + 1 >= C('streak', 'serMin') ? '' : 'opacity:.45'}"></i><small>${i + 1} ${plural(i + 1, 'день', 'дня', 'дней')}</small></div>`).join('')}</div>
      <p class="small muted" style="margin:8px 0 0">Бледные — ниже нормы (${C('streak', 'serMin')} в неделю): у них сгорит счётчик посещений</p></div>
    <div class="card"><h2>Предложение дня: воронка за неделю</h2><p class="muted small">Непоказанное — не отказ. Считаем по шагам</p>
      <div class="fun" style="margin-top:12px">${fun.map(([t, n]) => `<div><span>${t}</span><div class="bar"><i style="width:${n / fun[0][1] * 100}%"></i></div><b class="r">${nf(n)}</b></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">Купили из показанных: <b>${Math.round(287 / 1212 * 100)}%</b>. Подробно по вариантам — в <a href="#/offers">«Предложения дня»</a></p></div>
  </div>
  <div class="card"><div class="card-h"><h2>Последние действия сотрудников</h2><span class="sp"></span><a class="btn sm" href="#/audit">Весь журнал</a></div>${auditList(DB.audit.slice(0, 8))}</div>`;
};
function auditList(arr) {
  if (!arr.length) return '<div class="empty">Пока ничего не меняли. Любое изменение попадёт сюда: кто, когда, что было и что стало</div>';
  return `<div class="log">${arr.map(a => `<div class="e"><div class="w">${tm(a.at)}<br>${esc(a.by)}</div><div><b>${esc(a.what)}</b>${a.g ? ` · <a href="#/guest/${a.g}">${esc(gName(G(a.g)))}</a>` : ''}<div class="small muted">${a.detail}</div></div></div>`).join('')}</div>`;
}

/* ───────── Гости ───────── */
let gq = '', gf = 'all';
PAGES.guests = () => {
  if (!can('guests.view')) return ph('Гости') + noPerm('guests.view');
  const q = gq.toLowerCase().replace(/\D/g, '') , ql = gq.toLowerCase();
  let list = DB.guests.filter(g => !gq || gName(g).toLowerCase().includes(ql) || g.ph.replace(/\D/g, '').includes(q || '¤') || g.id.toLowerCase().includes(ql));
  const F = {all:['Все', () => 1], plus:['С Кофейная+', g => g.plus], free:['Без подписки', g => !g.plus], risk:['Счётчик может сгореть', g => g.ser > 0 && g.days7 < C('streak', 'serMin')], bd:['ДР в ближайшие 14 дней', g => bdIn(g) <= 14], lost:['Не были 14+ дней', g => daysTo(g.last) <= -14], block:['Заблокированы', g => g.blocked]};
  list = list.filter(F[gf][1]);
  return ph('Гости', 'Поиск по имени, телефону или внутреннему номеру. Нажмите на гостя — откроется карточка со всеми действиями', can('push.send') ? `<a class="btn" href="#/push">📣 Пуш сегменту</a>` : '')
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Имя, телефон или G-000001" value="${esc(gq)}" oninput="gq=this.value;clearTimeout(window._gt);window._gt=setTimeout(()=>{render();const i=document.querySelector('.search input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},200)"></div>
    <select class="inp" style="width:auto" onchange="gf=this.value;render()">${Object.entries(F).map(([k, [t]]) => `<option value="${k}" ${gf === k ? 'selected' : ''}>${t}</option>`).join('')}</select><span class="muted small">${nf(list.length)} ${plural(list.length, 'гость', 'гостя', 'гостей')}</span></div>
  <div class="tw"><table><thead><tr><th>Гость</th><th>Телефон</th><th>Подписка</th><th class="r">Бонусы</th><th class="r">Депозит</th><th class="c">🔥 Подряд</th><th class="c">Дней за 7</th><th>Был</th></tr></thead><tbody>
  ${list.slice(0, 300).map(g => `<tr class="click" onclick="location.hash='#/guest/${g.id}'"><td><div class="cell-n">${ava(g)}<div><b>${esc(gName(g))}</b><span class="small muted">${g.id}${g.blocked ? ' · <span class="pill red">заблокирован</span>' : ''}</span></div></div></td>
    <td class="nowrap">${esc(g.ph)}</td><td>${g.plus ? `<span class="pill prem">★ до ${dShort(g.plus.till)}</span>` : '<span class="muted small">нет</span>'}</td>
    <td class="r">${nf(g.bon)}${g.gbon ? `<div class="small muted">+${nf(g.gbon)} подар.</div>` : ''}</td><td class="r">${g.dep ? rub(g.dep) : '<span class="muted">—</span>'}</td>
    <td class="c">${g.ser ? '🔥 ' + g.ser : '<span class="muted">0</span>'}</td><td class="c">${g.days7 < C('streak', 'serMin') && g.ser ? `<span class="pill amb">${g.days7}</span>` : g.days7}</td><td class="nowrap small">${daysTo(g.last) === 0 ? 'сегодня' : dShort(g.last)}</td></tr>`).join('')}
  </tbody></table>${list.length ? '' : '<div class="empty">Никого не нашли. Проверьте номер или имя</div>'}</div>`;
};
function bdIn(g) { if (!g.bd) return 999; const t = new Date(isoDay()), b = new Date(t.getFullYear(), +g.bd.slice(5, 7) - 1, +g.bd.slice(8, 10)); if (b < t) b.setFullYear(t.getFullYear() + 1); return Math.round((b - t) / 864e5); }
const age = g => { if (!g.bd) return null; const t = new Date(), b = new Date(g.bd); let a = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };

PAGES.guest = r => { setTimeout(() => openGuest(r[1], r[2] || 'main'), 0); return PAGES.guests(); };
let gTab = 'main';
function openGuest(id, tab) {
  const g = G(id); if (!g) { toast('Гость не найден'); return; }
  gTab = tab || gTab;
  const T = [['main','Обзор'],['wallet','Кошелёк'],['visits','Посещения'],['perks','Выгоды и подарки'],['orders','Заказы'],['msgs','Сообщения'],['log','Журнал']];
  const body = `<div class="tabs">${T.map(([k, t]) => `<button class="${gTab === k ? 'on' : ''}" onclick="openGuest('${id}','${k}')">${t}</button>`).join('')}</div>${GTAB[gTab](g)}`;
  const d = $('#drw');
  if (d && d.dataset.g === id) { $('#drb').innerHTML = body; return; }
  drawer(`${esc(gName(g))}${g.blocked ? ' <span class="pill red">заблокирован</span>' : ''}`, body, `${g.id} · ${esc(g.ph)} · с нами с ${dLong(g.reg)}`);
  $('#drw').dataset.g = id;
}
const act = (perm, label, fn, cls = '') => can(perm) ? `<button class="btn sm ${cls}" onclick="${fn}">${label}</button>` : `<button class="btn sm" disabled title="Нет права">${label}</button>`;
const GTAB = {
  main: g => `<div class="grid g2">
    <div class="card"><h3>Профиль</h3><dl class="kv" style="margin-top:10px"><dt>Имя</dt><dd>${esc(g.n)}</dd><dt>Фамилия</dt><dd>${esc(g.l) || '—'}</dd><dt>Пол</dt><dd>${g.sex === 'f' ? 'Женский' : g.sex === 'm' ? 'Мужской' : '—'}</dd>
      <dt>Телефон</dt><dd>${esc(g.ph)}</dd><dt>День рождения</dt><dd>${g.bd ? `${dLong(g.bd)} · ${age(g)} ${plural(age(g), 'год', 'года', 'лет')}${bdIn(g) <= 14 ? ` <span class="pill amb">через ${bdIn(g)} ${plural(bdIn(g), 'день', 'дня', 'дней')}</span>` : ''}` : '—'}</dd>
      <dt>Любимая кофейня</dt><dd>${esc(g.shop)}</dd><dt>В рейтинге</dt><dd>${g.rating ? 'Показан' : 'Скрыт'}</dd></dl>
      <div class="btns" style="margin-top:14px">${act('guests.edit', '✏️ Изменить профиль', `gEdit('${g.id}')`)}${act('guests.block', g.blocked ? 'Разблокировать' : '⛔ Заблокировать', `gBlock('${g.id}')`)}${act('guests.edit', 'Выйти на всех устройствах', `gLogout('${g.id}')`)}</div></div>
    <div class="card"><h3>Коротко</h3><div class="kpis" style="margin-top:10px;grid-template-columns:repeat(2,minmax(0,1fr))">
      <div class="kpi"><span>Бонусы</span><b>${nf(g.bon)}</b>${g.gbon ? `<small>+${nf(g.gbon)} подарочных</small>` : ''}</div>
      <div class="kpi"><span>Депозит</span><b>${rub(g.dep)}</b></div>
      <div class="kpi"><span>🔥 Подряд</span><b>${g.ser}</b><small>👑 рекорд ${g.best} · всего ${g.total}</small></div>
      <div class="kpi"><span>Уровень</span><b class="t">${g.lvl}</b><small>${g.days7} ${plural(g.days7, 'день', 'дня', 'дней')} за неделю</small></div></div>
      <p style="margin:12px 0 0">${g.plus ? `<span class="pill prem">★ Кофейная+ · ${esc(g.plus.t)}</span> до ${dLong(g.plus.till)}` : '<span class="pill">Без подписки</span> выгоды под замком'}</p></div></div>
    <div class="card"><h3>Быстрые действия</h3><div class="btns" style="margin-top:10px">
      ${act('guests.bonus', '🪙 Начислить / списать бонусы', `gBonus('${g.id}')`)}${act('guests.depo', '₽ Депозит', `gDepo('${g.id}')`)}${act('guests.sub', '★ Подписка', `gSub('${g.id}')`)}
      ${act('guests.streak', '🔥 Посещения', `gStreak('${g.id}')`)}${act('guests.streak', '🎁 Выдать подарок', `gGift('${g.id}')`)}${act('push.send', '📣 Пуш гостю', `pushTo('${g.id}')`)}${act('support.reply', '💬 Написать в чат', `gChat('${g.id}')`)}</div></div>
    <div class="card"><h3>Сопоставления</h3><p class="small muted">Внутренний номер — главный. Телефон и номера iiko/Starter — только связи</p>
      <dl class="kv" style="margin-top:10px"><dt>Внутренний</dt><dd>${g.id}</dd><dt>iikoCard</dt><dd>${esc(g.iiko) || '—'}</dd><dt>Starter</dt><dd>${esc(g.starter) || '<span class="muted">не связан</span>'}</dd></dl></div>`,
  wallet: g => { const ops = DB.ops.filter(o => o.g === g.id);
    return `<div class="kpis"><div class="kpi"><span>Бонусы</span><b>${nf(g.bon)}</b><small>до ${C('bonus', 'maxShare')}% чека</small></div><div class="kpi"><span>Подарочные бонусы</span><b>${nf(g.gbon)}</b><small>без предела, не сгорают</small></div><div class="kpi"><span>Депозит</span><b>${rub(g.dep)}</b></div></div>
    <div class="btns" style="margin:14px 0">${act('guests.bonus', '🪙 Начислить / списать бонусы', `gBonus('${g.id}')`, 'pri')}${act('guests.depo', '₽ Изменить депозит', `gDepo('${g.id}')`)}</div>
    <div class="card"><h3>Ручные операции</h3>${ops.length ? `<div class="log" style="margin-top:6px">${ops.map(o => `<div class="e"><div class="w">${tm(o.at)}<br>${esc(o.by)}</div><div><b>${o.d > 0 ? '+' : '−'}${o.kind === 'depo' ? rub(Math.abs(o.d)) : nf(Math.abs(o.d)) + (o.kind === 'gbon' ? ' подарочных бонусов' : ' бонусов')}</b><div class="small muted">${esc(o.why)}</div></div></div>`).join('')}</div>` : '<div class="empty">Ручных операций не было</div>'}</div>`; },
  visits: g => `<div class="kpis"><div class="kpi"><span>🔥 Посещений подряд</span><b>${g.ser}</b></div><div class="kpi"><span>👑 Рекорд</span><b>${g.best}</b></div><div class="kpi"><span>📅 Всего</span><b>${g.total}</b></div><div class="kpi"><span>❄️ Заморозки</span><b>${g.fzAll - g.fz}<span style="font-size:15px"> из ${g.fzAll}</span></b><small>осталось</small></div></div>
    <div class="note blue" style="margin-top:14px">ℹ️ <span>Правило: рекорд ≥ подряд, всего ≥ рекорда. Посещений раньше регистрации (${dLong(g.reg)}) не бывает. Панель не даст нарушить</span></div>
    <div class="btns" style="margin-top:14px">${act('guests.streak', '✏️ Исправить счётчик', `gStreak('${g.id}')`, 'pri')}${act('guests.streak', '❄️ Дать заморозки', `gFz('${g.id}')`)}${act('guests.streak', '↩︎ Вернуть сгоревший счётчик', `gRestore('${g.id}')`)}</div>`,
  perks: g => { const gifts = DB.gifts.filter(x => x.g === g.id);
    return `<div class="card"><div class="card-h"><h3>Кофейная+</h3><span class="sp"></span>${act('guests.sub', 'Изменить', `gSub('${g.id}')`)}</div>${g.plus ? `<span class="pill prem">★ ${esc(g.plus.t)}</span> до ${dLong(g.plus.till)} · ${daysTo(g.plus.till)} ${plural(daysTo(g.plus.till), 'день', 'дня', 'дней')}` : 'Не подключена — все выгоды под замком'}</div>
    <div class="card"><div class="card-h"><h3>Подарки гостю</h3><span class="sp"></span>${act('guests.streak', '🎁 Выдать', `gGift('${g.id}')`)}</div>${gifts.length ? `<div class="log">${gifts.map(x => `<div class="e"><div class="w">${tm(x.at)}</div><div><b>${esc(x.t)}</b><div class="small muted">до ${dLong(x.till)} · ${esc(x.why)}</div></div></div>`).join('')}</div>` : '<div class="muted small">Выданных вручную подарков нет</div>'}</div>
    <div class="card"><h3>День рождения</h3><p class="small muted">${g.bd ? `${dLong(g.bd)} — скидка ${C('bd', 'ageIsPct') ? Math.min(age(g), C('bd', 'maxPct')) : C('bd', 'fixPct')}%, с ${C('bd', 'before')} дней до по ${C('bd', 'after')} дней после` : 'Дата не указана'}. Меняется только через поддержку, с проверкой документа</p>${act('guests.edit', 'Изменить дату', `gEdit('${g.id}')`)}</div>`; },
  orders: g => { const os = DB.orders.filter(o => o.g === g.id); return os.length ? ordersTable(os) : '<div class="empty">Покупок пока нет — гость у нас недавно</div>'; },
  msgs: g => { const ps = DB.pushes.filter(p => p.to === g.id || (p.seg && p.ids && p.ids.includes(g.id))), ts = DB.tickets.filter(t => t.g === g.id);
    return `<div class="btns" style="margin-bottom:12px">${act('push.send', '📣 Отправить пуш', `pushTo('${g.id}')`, 'pri')}${act('support.reply', '💬 Написать в чат поддержки', `gChat('${g.id}')`)}</div>
    <div class="card"><h3>Пуши</h3>${ps.length ? `<div class="log">${ps.map(p => `<div class="e"><div class="w">${tm(p.at)}<br>${esc(p.by)}</div><div><b>${esc(p.t)}</b><div class="small">${esc(p.b)}</div></div></div>`).join('')}</div>` : '<div class="muted small">Пушей не отправляли</div>'}</div>
    <div class="card"><h3>Поддержка</h3>${ts.length ? ts.map(t => `<div style="margin-top:8px"><a href="#/support/${t.id}">${t.id} · ${esc(t.topic)}</a> ${stPill(t.st)}</div>`).join('') : '<div class="muted small">Обращений не было</div>'}</div>`; },
  log: g => auditList(DB.audit.filter(a => a.g === g.id)),
};
function gUpd(g, what, detail) { audit(what, detail, {g: g.id}); save(); openGuest(g.id); render(); }

function gBonus(id) {
  const g = G(id), L = lim('bonus');
  modal({t:'Бонусы гостю', body:`<p class="muted small" style="margin-top:0">${esc(gName(g))} · сейчас ${nf(g.bon)} бонусов${g.gbon ? ` и ${nf(g.gbon)} подарочных` : ''}</p>
    <div class="row"><label class="fld"><span>Что делаем</span><select class="inp" id="bs"><option value="1">Начислить</option><option value="-1">Списать</option></select></label>
    <label class="fld"><span>Какие</span><select class="inp" id="bk"><option value="bon">Обычные</option><option value="gbon">Подарочные</option></select></label>
    <label class="fld"><span>Сколько</span><div class="u-wrap"><input class="inp" id="ba" inputmode="numeric" placeholder="300"><i>бонусов</i></div></label></div>
    ${reasonBox(['Компенсация за ошибку','Жалоба гостя','Не пришли бонусы за покупку','Конкурс или акция','Исправление ошибки начисления','Другое'])}
    <label class="chk"><input type="checkbox" id="bp" checked> Сообщить гостю пушем</label>
    <p class="small muted">${L ? `Ваш лимит без подтверждения — ${nf(L)} бонусов за раз. Больше — уйдёт на подтверждение другому сотруднику` : 'Ваша роль — без лимита'}. Бонусы уходят в единый баланс; дважды не начисляем</p>`,
    ok:'Провести', onOk:() => {
      const a = parseInt(val('ba').replace(/\D/g, ''), 10), s = +val('bs'), k = val('bk');
      if (!a) { toast('Введите количество бонусов'); return false; }
      if (s < 0 && a > g[k]) { toast(`Столько нет — у гостя ${nf(g[k])}`); return false; }
      const why = needReason(); if (!why) return false;
      const op = {type:'bonus', g:id, k, d:s * a, why, push: val('bp')};
      if (L && a > L) return askApproval(op, `${s > 0 ? '+' : '−'}${nf(a)} ${k === 'gbon' ? 'подарочных ' : ''}бонусов`);
      applyOp(op);
    }});
}
function gDepo(id) {
  const g = G(id), L = lim('depo');
  modal({t:'Депозит гостя', body:`<p class="muted small" style="margin-top:0">Сейчас ${rub(g.dep)}. Это деньги гостя — каждое изменение видно в выписке</p>
    <div class="row"><label class="fld"><span>Что делаем</span><select class="inp" id="bs"><option value="1">Зачислить</option><option value="-1">Списать</option></select></label>
    <label class="fld"><span>Сумма</span><div class="u-wrap"><input class="inp" id="ba" inputmode="numeric"><i>₽</i></div></label></div>
    ${reasonBox(['Возврат за заказ','Ошибка оплаты','Подарок не забрали — вернуть деньги','Возврат депозита гостю','Другое'])}
    <p class="small muted">${L ? `Без подтверждения — до ${rub(L)}` : 'Ваша роль — без лимита'}</p>`,
    ok:'Провести', onOk:() => {
      const a = parseInt(val('ba').replace(/\D/g, ''), 10), s = +val('bs');
      if (!a) { toast('Введите сумму'); return false; }
      if (s < 0 && a > g.dep) { toast(`На депозите только ${rub(g.dep)}`); return false; }
      const why = needReason(); if (!why) return false;
      const op = {type:'depo', g:id, k:'dep', d:s * a, why};
      if (L && a > L) return askApproval(op, `${s > 0 ? '+' : '−'}${rub(a)} депозит`);
      applyOp(op);
    }});
}
function askApproval(op, t) {
  DB.approvals.unshift({id:'A' + Date.now(), at:Date.now(), by:ME().n, byId:DB.me, st:'wait', t, op});
  audit('Запрос на подтверждение', `${t} · ${esc(op.why)}`, {g: op.g}); save(); render(); if ($('#drw')) openGuest(op.g);
  toast('Сумма больше вашего лимита — отправил на подтверждение. Его увидит владелец или управляющий');
}
function applyOp(op, by) {
  const g = G(op.g);
  if (op.d < 0 && g[op.k] < -op.d) { toast('У гостя уже меньше — операцию не провёл'); return false; }
  g[op.k] += op.d;
  DB.ops.unshift({g:op.g, at:Date.now(), kind: op.type === 'depo' ? 'depo' : op.k, d:op.d, why: op.why + (by ? ` · подтвердил ${by}` : ''), by: ME().n});
  const lbl = op.type === 'depo' ? rub(Math.abs(op.d)) : `${nf(Math.abs(op.d))} ${op.k === 'gbon' ? 'подарочных ' : ''}бонусов`;
  if (op.push) DB.pushes.unshift({at:Date.now(), by:ME().n, to:op.g, t: op.d > 0 ? `+${lbl}` : `Списали ${lbl}`, b: op.why.split(' · ')[0], n:1});
  gUpd(g, op.type === 'depo' ? (op.d > 0 ? 'Зачислили на депозит' : 'Списали с депозита') : (op.d > 0 ? 'Начислили бонусы' : 'Списали бонусы'), `${op.d > 0 ? '+' : '−'}${lbl} · ${esc(op.why)}`);
  toast(`Готово: ${op.d > 0 ? '+' : '−'}${lbl}`);
}
function gSub(id) {
  const g = G(id), T = C('plus', 'tariffs');
  modal({t:'Кофейная+ гостю', body:`<p class="muted small" style="margin-top:0">${g.plus ? `Сейчас: ${esc(g.plus.t)} до ${dLong(g.plus.till)}` : 'Сейчас без подписки'}</p>
    <label class="fld"><span>Что делаем</span><select class="inp" id="sa"><option value="give">${g.plus ? 'Продлить / изменить' : 'Подключить'}</option>${g.plus ? '<option value="off">Отключить</option>' : ''}</select></label>
    <div class="row"><label class="fld"><span>Тариф</span><select class="inp" id="st">${T.map(t => `<option ${g.plus && g.plus.t === t.n ? 'selected' : ''}>${esc(t.n)}</option>`).join('')}</select></label>
    <label class="fld"><span>Действует до</span><input class="inp" type="date" id="sd" value="${g.plus ? g.plus.till : C('plus', 'freeUntil')}"></label></div>
    ${reasonBox(['Компенсация','Сбой оплаты подписки','Подарок от кофейни','Гость попросил отключить','Другое'])}
    <p class="small muted">Без подписки выгоды уходят под замок, но посещения записываются. Заморозки на отпуск — по тарифу</p>`,
    ok:'Сохранить', onOk:() => {
      const why = needReason(); if (!why) return false;
      if (val('sa') === 'off') { g.plus = null; gUpd(g, 'Отключили Кофейная+', esc(why)); return; }
      const till = val('sd'); if (!till || daysTo(till) < 0) { toast('Дата должна быть не раньше сегодня'); return false; }
      const tf = T.find(t => t.n === val('st')); g.plus = {t:tf.n, till}; g.fzAll = C('streak', 'fzMonth') + (+tf.vac || 0);
      gUpd(g, 'Подписка: ' + tf.n, `до ${dLong(till)} · ${esc(why)}`);
    }});
}
function gStreak(id) {
  const g = G(id);
  modal({t:'Исправить посещения', body:`<div class="row"><label class="fld"><span>🔥 Подряд</span><input class="inp" id="s1" inputmode="numeric" value="${g.ser}"></label>
    <label class="fld"><span>👑 Рекорд</span><input class="inp" id="s2" inputmode="numeric" value="${g.best}"></label><label class="fld"><span>📅 Всего</span><input class="inp" id="s3" inputmode="numeric" value="${g.total}"></label></div>
    ${reasonBox(['Покупка не засчиталась','Сбой кассы','Счётчик сгорел по ошибке','Другое'])}
    <p class="small muted">Уровень пересчитается сам. Вехи (праздники), пройденные после правки, сработают как обычно — один раз</p>`,
    ok:'Сохранить', onOk:() => {
      const a = +val('s1'), b = +val('s2'), c = +val('s3'), maxD = 1 - daysTo(g.reg);
      if ([a, b, c].some(x => !Number.isInteger(x) || x < 0)) { toast('Только целые числа от 0'); return false; }
      if (b < a || c < b) { toast('Так не бывает: рекорд не меньше «подряд», «всего» не меньше рекорда'); return false; }
      if (c > maxD) { toast(`Гость с нами ${maxD} ${plural(maxD, 'день', 'дня', 'дней')} — посещений больше быть не может`); return false; }
      const why = needReason(); if (!why) return false;
      const was = `${g.ser}/${g.best}/${g.total}`; Object.assign(g, {ser:a, best:b, total:c, lvl: lvlOf(a)});
      gUpd(g, 'Исправили посещения', `<span class="diff">подряд/рекорд/всего: <s>${was}</s> → <ins>${a}/${b}/${c}</ins></span> · ${esc(why)}`);
    }});
}
const lvlOf = n => { const L = C('tiers', 'list').slice().sort((a, b) => a.from - b.from); return L.filter(t => n >= t.from).pop().n; };
function gFz(id) {
  const g = G(id);
  modal({t:'❄️ Дать заморозки', body:`<p class="muted small" style="margin-top:0">Осталось ${g.fzAll - g.fz} из ${g.fzAll}. Заморозки не копятся: сгорят в конце месяца</p>
    <label class="fld"><span>Сколько добавить</span><input class="inp" id="fa" inputmode="numeric" value="1"></label>${reasonBox(['Компенсация','Болезнь или отъезд','Другое'])}`,
    ok:'Добавить', onOk:() => { const a = +val('fa'); if (!(a > 0 && a <= 14)) { toast('От 1 до 14'); return false; } const why = needReason(); if (!why) return false; g.fzAll += a; gUpd(g, `Добавили ${a} ❄️`, esc(why)); }});
}
function gRestore(id) {
  const g = G(id);
  modal({t:'Вернуть сгоревший счётчик', body:`<p style="margin-top:0">Поставим «подряд» обратно — например, если неделя сгорела из-за сбоя кассы</p>
    <label class="fld"><span>Вернуть до</span><input class="inp" id="ra" inputmode="numeric" value="${g.best}"></label>${reasonBox(['Сбой кассы','Покупка не дошла из Starter','Другое'])}`,
    ok:'Вернуть', onOk:() => { const a = +val('ra'); if (!(a >= 0 && a <= g.best)) { toast(`Не больше рекорда (${g.best})`); return false; } const why = needReason(); if (!why) return false; const w = g.ser; g.ser = a; g.lvl = lvlOf(a); gUpd(g, 'Вернули счётчик', `<span class="diff"><s>${w}</s> → <ins>${a}</ins></span> · ${esc(why)}`); }});
}
const GIFT_T = ['Один напиток −30%','Один напиток −50%','Один напиток в подарок','Один десерт −50%','Один десерт в подарок','Напиток + десерт в подарок'];
function gGift(id) {
  const g = G(id);
  modal({t:'🎁 Выдать подарок', body:`<label class="fld"><span>Подарок</span><select class="inp" id="ga">${GIFT_T.map(x => `<option>${x}</option>`).join('')}</select><small>1 штука — на одну покупку</small></label>
    <label class="fld"><span>Живёт дней</span><input class="inp" id="gd" inputmode="numeric" value="${C('chest', 'giftDays')}"></label>${reasonBox(['Извинение за ошибку','Постоянный гость','Конкурс','Другое'])}
    <label class="chk"><input type="checkbox" id="gp" checked> Сообщить гостю пушем</label>`,
    ok:'Выдать', onOk:() => { const d = +val('gd'); if (!(d > 0 && d <= 60)) { toast('Срок от 1 до 60 дней'); return false; } const why = needReason(); if (!why) return false;
      const till = isoDay(new Date(Date.now() + d * 864e5)), t = val('ga');
      DB.gifts.unshift({g:id, at:Date.now(), t, till, why});
      if (val('gp')) DB.pushes.unshift({at:Date.now(), by:ME().n, to:id, t:'🎁 Тебе подарок', b:`${t} — забери до ${dLong(till)}`, n:1});
      gUpd(g, 'Выдали подарок', `${esc(t)} до ${dLong(till)} · ${esc(why)}`); }});
}
function gEdit(id) {
  const g = G(id);
  modal({t:'Профиль гостя', body:`<div class="row"><label class="fld"><span>Имя</span><input class="inp" id="e1" value="${esc(g.n)}"></label><label class="fld"><span>Фамилия</span><input class="inp" id="e2" value="${esc(g.l)}"></label></div>
    <div class="row"><label class="fld"><span>Пол</span><select class="inp" id="e3"><option value="f" ${g.sex === 'f' ? 'selected' : ''}>Женский</option><option value="m" ${g.sex === 'm' ? 'selected' : ''}>Мужской</option></select></label>
    <label class="fld"><span>Телефон</span><input class="inp" id="e4" value="${esc(g.ph)}"></label></div>
    <div class="row"><label class="fld"><span>День рождения</span><input class="inp" type="date" id="e5" value="${g.bd}"></label><label class="fld" style="align-self:end"><span></span><label class="chk"><input type="checkbox" id="e6"> Документ проверен</label></label></div>
    <label class="chk" style="margin-bottom:12px"><input type="checkbox" id="e7" ${g.rating ? 'checked' : ''}> Показывать в рейтинге</label>
    ${reasonBox(['Обращение в поддержку','Ошибка при регистрации','Смена номера','Другое'])}`,
    ok:'Сохранить', onOk:() => {
      const n = val('e1'), l = val('e2'), ph = val('e4'), bd = val('e5');
      const NM = /^[A-Za-zА-Яа-яЁё]+(?:[ -][A-Za-zА-Яа-яЁё]+)*$/;
      if (!NM.test(n) || n.length < 2 || !NM.test(l) || l.length < 2) { toast('Имя и фамилия — только буквы, от 2 букв'); return false; }
      if (ph.replace(/\D/g, '').length !== 11) { toast('Телефон: 11 цифр, +7 (9XX) XXX-XX-XX'); return false; }
      if (DB.guests.some(x => x.id !== id && x.ph.replace(/\D/g, '') === ph.replace(/\D/g, ''))) { toast('Этот номер уже у другого гостя'); return false; }
      if (bd !== g.bd && !val('e6')) { toast('Дату рождения меняем только после проверки документа — поставьте галочку'); return false; }
      const why = needReason(); if (!why) return false;
      const ch = []; [['n', n, 'имя'], ['l', l, 'фамилия'], ['sex', val('e3'), 'пол'], ['ph', ph, 'телефон'], ['bd', bd, 'ДР'], ['rating', val('e7'), 'рейтинг']].forEach(([k, v, t]) => { if (g[k] !== v) { ch.push(`${t}: <s>${esc(g[k])}</s> → <ins>${esc(v)}</ins>`); g[k] = v; } });
      if (!ch.length) return;
      gUpd(g, 'Изменили профиль', `<span class="diff">${ch.join('; ')}</span> · ${esc(why)}`);
    }});
}
function gBlock(id) {
  const g = G(id);
  modal({t: g.blocked ? 'Разблокировать гостя' : 'Заблокировать гостя', body:`${g.blocked ? '' : '<p style="margin-top:0">Заблокированный гость не получает и не тратит бонусы, не участвует в акциях и рейтинге. Покупать может</p>'}${reasonBox(g.blocked ? ['Разобрались','Ошибка','Другое'] : ['Обман с приглашениями','Обман с днём рождения','Чужая карта','Другое'])}`,
    ok: g.blocked ? 'Разблокировать' : 'Заблокировать', cls: g.blocked ? 'pri' : 'red', onOk:() => { const why = needReason(); if (!why) return false; g.blocked = !g.blocked; gUpd(g, g.blocked ? 'Заблокировали' : 'Разблокировали', esc(why)); }});
}
function gLogout(id) { const g = G(id); modal({t:'Выйти на всех устройствах?', body:'<p style="margin-top:0">Сессии и пуш-токены гостя отзовём. Данные не пропадут — вернётся по номеру и коду из СМС</p>', ok:'Выйти везде', onOk:() => { gUpd(g, 'Вышли на всех устройствах', 'сессии отозваны'); toast('Готово'); }}); }
function gChat(id) {
  let t = DB.tickets.find(x => x.g === id && x.st !== 'done');
  if (!t) { t = {id:'T-' + (1043 + DB.tickets.length), g:id, topic:'💬 Другое', st:'wait', at:isoDay() + 'T' + new Date().toTimeString().slice(0, 5), msgs:[]}; DB.tickets.unshift(t); save(); }
  closeDrawer(true); location.hash = '#/support/' + t.id;
}

/* ───────── Заказы ───────── */
let oq = '', ost = 'all';
const ordersTable = os => `<div class="tw"><table><thead><tr><th>Чек</th><th>Когда</th><th>Гость</th><th>Где</th><th>Состав</th><th class="r">Сумма</th><th>Статус</th></tr></thead><tbody>${os.slice(0, 200).map(o => { const g = G(o.g);
  return `<tr class="click" onclick="openOrder('${o.id}')"><td class="nowrap">${o.id}</td><td class="nowrap small">${dShort(o.at)} ${o.at.slice(11, 16)}</td><td>${esc(gName(g))}</td><td class="small">${esc(o.ch)}<br><span class="muted">${esc(o.shop)}</span></td>
  <td class="small">${o.lines.map(l => esc(l.n)).join(', ')}</td><td class="r nowrap">${rub(o.sum)}${o.bonUse ? `<div class="small muted">−${nf(o.bonUse)} бонусами</div>` : ''}</td><td>${o.st === 'Возврат' ? '<span class="pill red">Возврат</span>' : '<span class="pill ok">Выполнен</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
PAGES.orders = () => {
  let os = DB.orders.filter(o => (ost === 'all' || (ost === 'ref' ? o.st === 'Возврат' : o.ch === ost)) && (!oq || o.id.toLowerCase().includes(oq.toLowerCase()) || gName(G(o.g)).toLowerCase().includes(oq.toLowerCase())));
  return ph('Заказы и чеки', 'Касса и онлайн-заказы в одном списке. Несколько чеков за день — один день с покупкой. Возврат пересчитывает экономию и бонусы')
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Номер чека или гость" value="${esc(oq)}" onchange="oq=this.value;render()"></div>
  <div class="seg">${[['all','Все'],['Касса','Касса'],['Самовывоз','Самовывоз'],['Доставка','Доставка'],['За столик','За столик'],['ref','Возвраты']].map(([k, t]) => `<button class="${ost === k ? 'on' : ''}" onclick="ost='${k}';render()">${t}</button>`).join('')}</div></div>${ordersTable(os)}`;
};
function openOrder(id) {
  const o = DB.orders.find(x => x.id === id), g = G(o.g), save_ = o.lines.reduce((a, l) => a + l.d, 0);
  modal({t:`Чек ${o.id}`, wide:1, body:`<p class="muted small" style="margin-top:0">${dLong(o.at)} в ${o.at.slice(11, 16)} · ${esc(o.ch)} · ${esc(o.shop)} · <a href="#/guest/${g.id}" onclick="closeModal()">${esc(gName(g))}</a></p>
    <div class="tw"><table><thead><tr><th>Позиция</th><th class="r">Обычная цена</th><th class="r">Скидка</th><th>Источник</th></tr></thead><tbody>${o.lines.map(l => `<tr><td>${esc(l.n)}</td><td class="r">${rub(l.p)}</td><td class="r">${l.d ? '−' + rub(l.d) : '—'}</td><td class="small">${esc(l.k) || '—'}</td></tr>`).join('')}</tbody></table></div>
    <dl class="kv" style="margin-top:12px"><dt>Итого</dt><dd>${rub(o.sum)}</dd><dt>Экономия гостя</dt><dd>${rub(save_)}</dd><dt>Бонусами</dt><dd>${nf(o.bonUse)}</dd><dt>Оплата</dt><dd>${esc(o.pay)}</dd><dt>Статус</dt><dd>${esc(o.st)}</dd></dl>`,
    ok: o.st !== 'Возврат' && can('orders.refund') ? 'Оформить возврат' : '', cls:'red', cancel:'Закрыть', onOk:() => { setTimeout(() => refund(id), 0); }});
}
function refund(id) {
  const o = DB.orders.find(x => x.id === id), g = G(o.g);
  modal({t:'Возврат ' + o.id, body:`<p style="margin-top:0">Что произойдёт:</p><ul style="margin:0 0 12px;padding-left:18px"><li>Вернём ${rub(o.sum)} — ${o.pay === 'Депозит' ? 'на депозит' : o.pay === 'Наличные' ? 'наличными на кассе' : 'на карту'}</li>${o.bonUse ? `<li>Вернём ${nf(o.bonUse)} бонусов, которыми платили</li>` : ''}<li>Экономия гостя пересчитается</li><li>День с покупкой останется, если в этот день были другие чеки</li></ul>${reasonBox(['Ошибка в заказе','Гость отказался','Не привезли','Двойное списание','Другое'])}`,
    ok:'Вернуть', cls:'red', onOk:() => { const why = needReason(); if (!why) return false; o.st = 'Возврат'; if (o.bonUse) g.bon += o.bonUse; if (o.pay === 'Депозит') g.dep += o.sum;
      audit('Возврат ' + o.id, `${rub(o.sum)}${o.bonUse ? ` и ${nf(o.bonUse)} бонусов` : ''} · ${esc(why)}`, {g:g.id}); save(); render(); toast('Возврат оформлен'); }});
}

/* ───────── Поддержка ───────── */
const stPill = s => s === 'new' ? '<span class="pill red">новое</span>' : s === 'wait' ? '<span class="pill amb">ждём гостя</span>' : '<span class="pill ok">решено</span>';
const SUP_TPL = ['Здравствуйте! Уже разбираюсь — напишу в течение 5 минут', 'Извините за неудобство! Начислили бонусы — проверьте в приложении', 'Пришлите, пожалуйста, фото документа — поменяем дату', 'Передала разработчикам — когда исправим, напишу здесь', 'Спасибо, что написали! Рады помочь 😊'];
PAGES.support = r => {
  if (!can('guests.view') && !can('support.reply')) return ph('Поддержка') + noPerm('support.reply');
  const cur = r[1] && DB.tickets.find(t => t.id === r[1]);
  const list = DB.tickets.slice().sort((a, b) => (a.st === 'new' ? 0 : a.st === 'wait' ? 1 : 2) - (b.st === 'new' ? 0 : b.st === 'wait' ? 1 : 2) || b.at.localeCompare(a.at));
  return ph('Поддержка', `Чат с гостями. Обещаем ответить за ${C('support', 'sla')} мин, работаем с ${C('support', 'from')} до ${C('support', 'to')}. Настройки — в <a href="#/m/support">правилах</a>`)
  + `<div class="grid g-list">
  <div class="tw" style="align-self:start">${list.map(t => { const g = G(t.g); return `<a href="#/support/${t.id}" style="display:block;padding:11px 14px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;${cur && cur.id === t.id ? 'background:var(--acc-soft)' : ''}">
    <div style="display:flex;gap:8px;align-items:center"><b style="flex:1">${esc(gName(g))}</b>${stPill(t.st)}</div><div class="small muted">${esc(t.topic)} · ${dShort(t.at)} ${t.at.slice(11, 16)}</div>
    <div class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc((t.msgs[t.msgs.length - 1] || {}).t || 'Пока пусто')}</div></a>`; }).join('')}</div>
  <div>${cur ? ticketView(cur) : '<div class="card empty">Выберите обращение слева</div>'}</div></div>`;
};
function ticketView(t) {
  const g = G(t.g);
  return `<div class="card"><div class="card-h"><div>${ava(g)}</div><div style="flex:1"><h3><a href="#/guest/${g.id}">${esc(gName(g))}</a></h3><div class="small muted">${t.id} · ${esc(t.topic)} · ${g.plus ? '★ Кофейная+' : 'без подписки'} · бонусы ${nf(g.bon)}</div></div>${stPill(t.st)}</div>
  <div class="chat" id="chat">${t.msgs.length ? t.msgs.map(m => `<div class="msg ${m.me ? 'me' : ''}">${esc(m.t)}<small>${m.me ? esc(m.by || C('support', 'agent')) + ' · ' : ''}${m.at}</small></div>`).join('') : '<div class="muted small">Сообщений пока нет — напишите первым</div>'}${t.rate ? `<div class="small muted" style="text-align:center">Гость ответил на «Помогли?»: ${t.rate === 'yes' ? '👍 Да' : '👎 Нет'}</div>` : ''}</div>
  ${can('support.reply') ? `<div class="btns" style="margin:10px 0">${SUP_TPL.map((x, i) => `<button class="btn sm" onclick="document.getElementById('rep').value=SUP_TPL[${i}]">${esc(x.slice(0, 28))}…</button>`).join('')}</div>
  <textarea class="inp" id="rep" placeholder="Ответ гостю. Видно в приложении от имени «${esc(C('support', 'agent'))}»"></textarea>
  <div class="btns" style="margin-top:10px"><button class="btn pri" onclick="supSend('${t.id}')">Отправить</button>${t.st !== 'done' ? `<button class="btn" onclick="supDone('${t.id}')">✓ Решено</button>` : ''}
  ${act('guests.bonus', '🪙 Бонусы', `gBonus('${g.id}')`)}${act('orders.refund', '🧾 Заказы гостя', `location.hash='#/guest/${g.id}/orders'`)}</div>` : noPerm('support.reply')}</div>`;
}
function supSend(id) { const t = DB.tickets.find(x => x.id === id), v = val('rep'); if (!v) { toast('Напишите ответ'); return; } t.msgs.push({me:1, t:v, by:ME().n, at:new Date().toTimeString().slice(0, 5)}); t.st = 'wait'; audit('Ответ в поддержке', `${t.id}: ${esc(v.slice(0, 80))}`, {g:t.g}); save(); render(); }
function supDone(id) { const t = DB.tickets.find(x => x.id === id); t.st = 'done'; audit('Обращение решено', t.id, {g:t.g}); save(); render(); toast('Отметил как решённое — гостю придёт «Помогли? Да / Нет»'); }

/* ───────── Подтверждения (второй сотрудник) ───────── */
PAGES.approvals = () => {
  const w = DB.approvals.filter(a => a.st === 'wait'), d = DB.approvals.filter(a => a.st !== 'wait');
  const row = a => { const g = G(a.op.g), self = a.byId === DB.me, ok = a.op.type === 'depo' ? can('guests.depo') : can('guests.bonus'), L = lim(a.op.type === 'depo' ? 'depo' : 'bonus'), big = L && Math.abs(a.op.d) > L;
    return `<div class="card"><div class="card-h"><div style="flex:1"><h3>${esc(a.t)} · <a href="#/guest/${g.id}">${esc(gName(g))}</a></h3><div class="small muted">${tm(a.at)} · попросил ${esc(a.by)} · ${esc(a.op.why)}</div></div>
    ${a.st === 'wait' ? (self ? '<span class="small muted">Подтверждает другой сотрудник</span>' : !ok || big ? '<span class="small muted">Нужна роль с бо́льшим лимитом</span>' : `<button class="btn" onclick="apprDo('${a.id}',0)">Отклонить</button><button class="btn pri" onclick="apprDo('${a.id}',1)">Подтвердить</button>`) : a.st === 'ok' ? `<span class="pill ok">подтвердил ${esc(a.who)}</span>` : `<span class="pill red">отклонил ${esc(a.who)}</span>`}</div></div>`; };
  return ph('Подтверждения', 'Крупные ручные операции с бонусами и депозитом проводит второй сотрудник. Лимиты ролей — в <a href="#/staff">«Сотрудники и права»</a>')
    + (w.length ? w.map(row).join('') : '<div class="card empty">Ничего не ждёт подтверждения</div>') + (d.length ? '<h2 style="margin:22px 0 10px">Решённые</h2>' + d.slice(0, 30).map(row).join('') : '');
};
function apprDo(id, yes) {
  const a = DB.approvals.find(x => x.id === id);
  if (yes && applyOp(a.op, ME().n) === false) return;
  a.st = yes ? 'ok' : 'no'; a.who = ME().n;
  if (!yes) { audit('Отклонили операцию', `${a.t} · просил ${esc(a.by)}`, {g:a.op.g}); }
  save(); render();
}
