/* Бэк-офис — Доставка, точки, комплектация, онлайн-оплата, чёрный список, настройки проекта, тикеты (как в Starter CRM, §05, §17–28) */
'use strict';
document.head.insertAdjacentHTML('beforeend', `<style>
.op-back{display:inline-flex;align-items:center;gap:6px;font:600 12px/1 var(--f-head);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);text-decoration:none;margin-bottom:8px}
.op-more{position:relative}
.op-menu{position:absolute;right:0;top:calc(100% + 6px);background:var(--surface);border:1px solid var(--line);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);z-index:30;min-width:230px;padding:6px;display:none}
.op-menu.on{display:block}
.op-menu button{display:block;width:100%;text-align:left;border:0;background:none;padding:9px 10px;border-radius:7px;cursor:pointer}
.op-menu button:hover{background:var(--surface2)}
.op-acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.op-act{border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;background:var(--surface)}
.op-act.on{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc-soft)}
.op-act p{margin:0;color:var(--muted);font-size:13px}
.op-act .btn{margin-top:auto;align-self:flex-start}
.op-days{display:flex;gap:4px;flex-wrap:wrap}
.op-day{border:1px solid var(--line2);background:var(--surface);border-radius:8px;min-width:38px;padding:6px 0;cursor:pointer;font-size:13px}
.op-day.on{background:var(--acc);color:var(--acc-ink);border-color:transparent}
.op-day:disabled{cursor:not-allowed;opacity:.6}
.op-grp{display:flex;gap:10px 14px;align-items:center;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--line)}
.op-grp .inp{width:118px}
.op-side2{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;align-items:start}
.op-help{background:var(--surface2);border-radius:10px;padding:14px;font-size:13px}
.op-help b{display:block;margin-bottom:4px}
.op-help+.op-help{margin-top:10px}
.op-sec{padding:16px 0;border-top:1px solid var(--line)} .op-sec:first-child{border-top:0;padding-top:0}
.op-sec h3{margin-bottom:8px}
.op-lp{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:16px;align-items:start}
.op-modes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:var(--surface2);border-radius:14px;padding:6px;margin:8px 0 18px}
.op-mode{border:0;background:none;border-radius:10px;padding:16px 6px;cursor:pointer;text-align:center;font:600 16px/1.2 var(--f-head);color:var(--ink)}
.op-mode small{display:block;font:400 13px/1.2 var(--f-body);color:var(--muted);margin-top:4px}
.op-mode.on{background:var(--acc);color:var(--acc-ink)} .op-mode.on small{color:inherit;opacity:.85}
.op-mode:disabled{cursor:not-allowed;opacity:.5}
.op-stops{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.op-stop{border:1px solid var(--line);background:var(--surface2);border-radius:12px;padding:16px 10px;cursor:pointer;font:600 15px/1.2 var(--f-head);display:flex;gap:8px;align-items:center;justify-content:center;text-align:center;color:var(--ink)}
.op-stop i{font-style:normal;color:#f57c00;font-weight:700}
.op-stop.on{background:var(--red);color:#fff;border-color:transparent} .op-stop.on i{color:#fff}
.op-stop:disabled{cursor:not-allowed;opacity:.5}
.op-dark{background:#1f2321;color:#eef1ee;border-radius:14px;padding:14px}
.op-dark h3{color:#b9c2bc;font:500 14px var(--f-body);margin:4px 0 8px}
.op-zone{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.07);border-radius:10px;padding:12px;border-left:4px solid #3f9a72;margin-top:8px;font-size:14px}
.op-zone.off{opacity:.5;border-left-color:#777}
.op-zone b{margin-left:auto;font:600 20px/1.1 var(--f-head);white-space:nowrap;text-align:right;padding-left:12px;border-left:1px solid rgba(255,255,255,.15)}
.op-zone b small{display:block;font:400 11px var(--f-body);opacity:.7;text-align:center}
.op-fl{display:flex;gap:6px;flex-wrap:wrap}
.op-fl button{border:1px solid rgba(255,255,255,.22);background:none;color:inherit;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:13px}
.op-fl button.on{background:rgba(255,255,255,.16)}
.op-ph-frame{background:var(--surface2);border-radius:12px;padding:18px 16px 0;display:flex;justify-content:center;overflow:hidden;margin-bottom:14px}
.op-ph{width:250px;max-width:100%;background:#fff;color:#212221;border-radius:22px 22px 0 0;padding:14px 16px 18px;box-shadow:0 6px 24px rgba(0,0,0,.12)}
.op-ph::before{content:"";display:block;width:40px;height:4px;border-radius:3px;background:#d6d9d5;margin:0 auto 12px}
.op-ph h4{margin:0 0 6px;font:700 18px/1.2 var(--f-head)} .op-ph p{margin:0 0 12px;font-size:12.5px;color:#555}
.op-ph .ct{border:1px dashed #cfd4cd;border-radius:10px;padding:10px;font-size:12px;color:#444;line-height:1.5}
.op-ph .ct.e{color:#999;text-align:center}
.op-cart{border:1px solid var(--line);border-radius:16px;padding:14px;background:var(--surface)}
.op-cl{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.op-cl img,.op-cl .ic{width:36px;height:36px;border-radius:8px;object-fit:cover;flex:none;background:var(--surface2);display:grid;place-items:center}
.op-cl .n{flex:1;min-width:0;font-size:13.5px}
.op-cl .n small{display:block;color:var(--muted);font-size:11.5px}
.op-q{display:inline-flex;align-items:center;gap:8px;flex:none}
.op-q button{width:26px;height:26px;border-radius:50%;border:1px solid var(--line2);background:var(--surface);cursor:pointer;line-height:1;padding:0}
.op-q b{min-width:16px;text-align:center}
.op-box{background:var(--surface2);border-radius:12px;padding:6px 10px;margin-top:10px}
.op-box .op-cl:last-child{border-bottom:0}
.op-eco{color:var(--acc);font-size:12.5px;display:flex;gap:6px;padding:6px 0}
.op-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.op-step i{font-style:normal;font-weight:700;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--acc-soft);color:var(--acc);margin-bottom:6px}
.op-chips{display:flex;gap:6px;flex-wrap:wrap}
.op-map svg{width:100%;height:auto;display:block}
.op-pos{display:grid;grid-template-columns:minmax(0,1fr) 92px 64px 92px 30px;gap:6px;align-items:center;margin-bottom:6px}
.op-pos .inp{min-height:34px;padding:6px 8px}
.op-pos .s{text-align:right;font-weight:500;white-space:nowrap}
.op-pos.h{font-size:12px;color:var(--muted);margin-bottom:4px}
.op-total{font:600 15px var(--f-head);margin:6px 0 0}
.op-tlist td .pill{margin:1px 0}
.op-dl{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.op-dl .inp{width:auto}
@media (max-width:860px){
  .op-acts,.op-lp,.op-side2,.op-steps{grid-template-columns:1fr}
  .op-modes{grid-template-columns:repeat(2,minmax(0,1fr))}
  .op-pos{grid-template-columns:minmax(0,1fr) 72px 52px 30px} .op-pos .s{display:none}
  .op-grp .inp{width:108px}
}
</style>`);

/* ───────── общее ───────── */
const opH = s => [...String(s)].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7);
const opDig = s => { let d = String(s || '').replace(/\D/g, ''); if (d.length === 11 && /^[78]/.test(d)) d = d.slice(1); return d; };
const opPhF = s => { const d = opDig(s); return d.length === 10 ? `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}` : String(s || ''); };
const opRO = p => can(p) ? '' : 'disabled';
const opNow = () => isoDay() + 'T' + new Date().toTimeString().slice(0, 5);
const opDiff = (a, b) => `<span class="diff"><s>${esc(a)}</s> → <ins>${esc(b)}</ins></span>`;
const opOpt = (list, cur) => list.map(([v, t]) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('');
const opDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const opMin = s => { const m = String(s || '').match(/\d+/g); return m ? m.map(Number) : []; };
function opCsv(name, head, rows) {
  const q = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const txt = '﻿' + [head, ...rows].map(r => r.map(q).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type: 'text/csv;charset=utf-8'})); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function opModalBtn(label, fn, cls = '') {   /* третья кнопка в подвале окна (например, «Сохранить и создать ещё») */
  const f = [...$$('[data-modal]')].pop().querySelector('.md-f'), b = document.createElement('button');
  b.className = 'btn ' + cls; b.textContent = label; b.onclick = fn; f.insertBefore(b, f.querySelector('#mdOk'));
}
function opNested(o) {   /* окно поверх окна: если второе закрыли без «ОК», первому возвращаем его кнопку */
  const prev = _onOk, ok = o.onOk; let done = false;
  modal({...o, onOk: () => { done = true; const r = ok(); if (r === false) done = false; return r; }});
  const el = [...$$('[data-modal]')].pop(), mo = new MutationObserver(() => { if (!el.isConnected) { mo.disconnect(); if (!done) _onOk = prev; } });
  mo.observe($('#layer'), {childList: true});
}
document.addEventListener('click', e => { if (!e.target.closest('.op-more')) $$('.op-menu.on').forEach(m => m.classList.remove('on')); });

/* ───────── данные ───────── */
DB.cfg2 = DB.cfg2 || {};
DB.cfg2 = {vk: true, ya: false, rfmDays: 90, reviewUrl: '', metabase: '', ...DB.cfg2};
DB.ops2 = DB.ops2 || {};
DB.ops2 = {
  main: 4,
  bl: {set: false, msg: {ph: '', mail: '', t: 'Не удалось войти', d: 'Свяжитесь с поддержкой для уточнения информации', sch: ''}, list: []},
  couriers: [{id: 1, l: 'Яндекс.Доставка', n: '', m: '', ph: ''}, {id: 2, l: 'Тестовый', n: 'Курьер', m: '', ph: '+7 (900) 000-00-01'}, {id: 3, l: '', n: '', m: '', ph: ''}],
  pkg: {simple: {on: true, def: 'none', eco: true, limit: true, lim: 5, remember: false}, sets: {on: false, eco: false, round: 'math', list: []}},
  legal: [
    {id: 'L1', n: 'ООО «Кофейная»', inn: '0000000001', boss: 'Петров П. П.', on: [4, 0, 1], wait: []},
    {id: 'L2', n: 'ИП Кофейная-1', inn: '000000000002', boss: 'Сидорова А. В.', on: [2, 3], wait: []},
    {id: 'L3', n: 'ИП Кофейная-2', inn: '000000000003', boss: 'Орлов Д. С.', on: [6], wait: [5]},
  ],
  bills: [], billNo: 900001,
  tk: [
    {id: 4512, type: 'Задача 2 линии', t: 'Изменение отображения обязательных модификаторов', d: 'Обязательные добавки в карточке блюда показываются свёрнутыми — гости их не замечают', st: 'Передано в разработку', pr: 'Средний', at: isoDay(new Date(Date.now() - 19 * 864e5)), note: '', log: []},
    {id: 4538, type: 'Bug', t: 'Проверить разлогин пользователя в приле', d: 'Часть гостей выкидывает из приложения после обновления — приходится входить заново по СМС', st: 'Передано в разработку', pr: 'Средний', at: isoDay(new Date(Date.now() - 9 * 864e5)), note: '', log: []},
    {id: 4561, type: 'Bug', t: 'Недоступность CRM и приложения', d: 'Около 20 минут не открывались CRM и приложение, заказы не проходили', st: 'Передано в разработку', pr: 'Высокий', at: isoDay(new Date(Date.now() - 3 * 864e5)), note: 'Просили разбор причин и компенсацию', log: []},
  ],
  ...DB.ops2,
};
const WAY_T = {pickup: 'Самовывоз', table: 'За столик', delivery: 'Доставка'};
const LOAD_M = [[-10, 'Мало заказов', '−10 мин'], [0, 'Стандарт', '0 мин'], [10, 'Загружено', '+10 мин'], [20, 'Высокий спрос', '+20 мин']];
const DSVC = [['none', 'Нет', 'Доставляем своими курьерами'], ['yandex', 'Яндекс Доставка', 'Курьер вызывается автоматически, Claim_ID приходит в заявку'], ['onesync', 'OneSync', 'Агрегатор курьерских служб'], ['whitecabs', 'White Cabs', 'Такси-доставка, нужен ключ и location ID'], ['retailcrm', 'RetailCRM', 'Заявки уходят в RetailCRM'], ['kuper', 'Купер', 'Курьеры Купера']];

function opParseHr(s) { const m = String(s || '').match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/); return m ? [m[1].padStart(2, '0') + ':' + m[2], m[3].padStart(2, '0') + ':' + m[4]] : ['08:00', '22:00']; }
const opHrShort = t => t.replace(/^0(\d)/, '$1');
function opShopFix(s) {
  if (!s.sched) { const a = opParseHr(s.wd), b = opParseHr(s.we); s.sched = {mode: 'common', common: a[0] === b[0] && a[1] === b[1] ? [{d: [0, 1, 2, 3, 4, 5, 6], f: a[0], t: a[1]}] : [{d: [0, 1, 2, 3, 4], f: a[0], t: a[1]}, {d: [5, 6], f: b[0], t: b[1]}], byway: {}}; }
  if (!s.act) s.act = s.closed ? 'closed' : 'on';
  if (s.closeMsg == null) s.closeMsg = s.closed || 'Временно не принимаем заказы';
  if (!s.load) s.load = {urgent: 'interval', panel: 'time', reset: '04:00', kitchen: 0, couriers: 0, stopDel: false, stopAll: s.closed === 'Временно не принимаем заказы'};
  ['fa', 'emerg', 'tg', 'max'].forEach(k => { if (s[k] == null) s[k] = ''; });
  if (s.asm == null) s.asm = opMin(s.eta)[0] || 15;
  if (!s.dsvc) s.dsvc = (s.t || []).includes('delivery') ? 'yandex' : 'none';
  if (s.outZone == null) s.outZone = false;
  if (!s.ytar) s.ytar = 'courier';
  if (!s.pre) s.pre = {on: true, off: false, mode: 'common', slots: {common: {iv: 30, step: 30, max: ''}}};
  return s;
}
const opFixAll = () => DB.shops.forEach(opShopFix);
opFixAll();
const opDow = () => (new Date().getDay() + 6) % 7;
function opGroups(s, way) { return way === 'common' ? s.sched.common : (s.sched.byway[way] = s.sched.byway[way] || clone(s.sched.common)); }
function opTodayHr(s) {
  const g = (s.sched.mode === 'common' ? s.sched.common : (s.sched.byway.pickup || s.sched.common)).find(x => x.d.includes(opDow()));
  return g ? `${opHrShort(g.f)}–${opHrShort(g.t)}` : 'Выходной';
}
function opActPill(s) {
  if (s.act === 'off') return '<span class="pill red">Отключена</span>';
  if (s.load.stopAll) return '<span class="pill red">Приём заказов на стопе</span>';
  if (s.act === 'closed') return '<span class="pill amb">Временно закрыта</span>';
  return '<span class="pill ok">Включена</span>';
}
const opActKey = s => s.act === 'off' ? 'off' : s.load.stopAll ? 'stop' : s.act;
const opLoadName = s => s.load.panel === 'none' ? 'Без панели' : (LOAD_M.find(m => m[0] === s.load.kitchen) || LOAD_M[1])[1];

/* ═════════ Точки продаж: список (§19) ═════════ */
let opS2 = {q: '', act: '', load: ''};
PAGES.shops2 = () => {
  opFixAll();
  const q = opS2.q.toLowerCase(), qd = opDig(opS2.q);
  const L = DB.shops.map((s, i) => [s, i]).filter(([s]) => (!q || (s.n + ' ' + s.a).toLowerCase().includes(q) || (qd.length > 2 && opDig(s.phone).includes(qd)))
    && (!opS2.act || opActKey(s) === opS2.act) && (!opS2.load || String(s.load.kitchen) === opS2.load && s.load.panel !== 'none'));
  return ph('Точки продаж', `Всего ${DB.shops.length} ${plural(DB.shops.length, 'точка', 'точки', 'точек')}. Нажмите на точку — откроются активность, график, загрузка, контакты, сборка, доставка и предзаказ`,
    `<a class="btn" href="#/loadpanel/${DB.ops2.main}">⏱ Панель загрузки</a>`)
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Название, адрес или телефон" value="${esc(opS2.q)}" onchange="opS2.q=this.value;render()"></div>
    <select class="inp" style="width:auto" onchange="opS2.act=this.value;render()">${opOpt([['', 'Любая активность'], ['on', 'Включена'], ['closed', 'Временно закрыта'], ['stop', 'Приём заказов на стопе'], ['off', 'Отключена']], opS2.act)}</select>
    <select class="inp" style="width:auto" onchange="opS2.load=this.value;render()">${opOpt([['', 'Любая загрузка'], ...LOAD_M.map(m => [String(m[0]), m[1]])], opS2.load)}</select>
    <span class="small muted">${L.length} из ${DB.shops.length}</span></div>
  <div class="tw"><table><thead><tr><th>Название</th><th>Активность</th><th>Загрузка</th><th>График сегодня</th><th>Адрес</th><th>Телефон</th><th>Сервис доставки</th><th class="r">Сборка</th><th>Предзаказ</th><th></th></tr></thead><tbody>
  ${L.map(([s, i]) => `<tr class="click" onclick="location.hash='#/shop/${i}'"><td class="nowrap"><b>${esc(s.n)}</b>${i === DB.ops2.main ? ' <span class="star" title="Главная точка проекта">★</span>' : ''}</td>
    <td>${opActPill(s)}${s.load.stopDel ? '<br><span class="pill red">Доставка на стопе</span>' : ''}</td>
    <td class="nowrap">${s.load.panel === 'none' ? '<span class="muted">Без панели</span>' : s.load.kitchen ? `<span class="pill amb">${opLoadName(s)}</span>` : 'Стандарт'}</td>
    <td class="nowrap">${opTodayHr(s)}</td><td class="small">${esc(s.a)}</td><td class="nowrap small">${s.phone ? esc(s.phone) : '<span class="muted">—</span>'}</td>
    <td class="small">${(s.t || []).includes('delivery') ? (DSVC.find(d => d[0] === s.dsvc) || DSVC[0])[1] : '<span class="muted">нет доставки</span>'}</td>
    <td class="r nowrap">${s.asm} мин</td><td>${s.pre.on ? '<span class="pill ok">вкл</span>' : '<span class="pill">выкл</span>'}</td>
    <td onclick="event.stopPropagation()"><a class="btn sm" href="#/loadpanel/${i}" title="Панель управления загрузкой">⏱</a></td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Ничего не нашли — измените поиск или фильтры</div>'}</div>`;
};

/* ═════════ Карточка точки (§19) ═════════ */
let opSD = null;   /* черновик: {i, s, tab, way, pway} — «Сохранить изменения» переносит его в DB.shops[i] */
function opDraft(i) {
  if (!opSD || opSD.i !== i) opSD = {i, s: clone(opShopFix(DB.shops[i])), tab: 'act', way: 'pickup', pway: 'pickup'};
  return opSD.s;
}
const opDirty = () => opSD && JSON.stringify(opSD.s) !== JSON.stringify(DB.shops[opSD.i]);
function opSet(p, v, rr = 1) { const ks = p.split('.'); let o = opSD.s; ks.slice(0, -1).forEach(k => { o = o[k] = o[k] ?? {}; }); o[ks[ks.length - 1]] = v; if (rr) render(); }
const OPT_TABS = [['act', 'Активность'], ['sched', 'График работы'], ['load', 'Управление загрузкой'], ['cont', 'Контакты и адрес'], ['asm', 'Сборка заказа'], ['dsvc', 'Сервисы доставки'], ['pre', 'Предзаказ']];
PAGES.shop = r => {
  opFixAll();
  const i = +r[1];
  if (!DB.shops[i] || isNaN(i)) return ph('Точка не найдена') + '<div class="card empty">Такой точки нет. <a href="#/shops2">К списку точек</a></div>';
  const s = opDraft(i), ro = opRO('shops.edit'), live = DB.shops[i];
  if (r[2] && OPT_TABS.some(t => t[0] === r[2])) opSD.tab = r[2];   /* вкладка — в адресе: #/shop/4/load */
  const dirty = opDirty();
  return `<a class="op-back" href="#/shops2">← Назад</a>`
  + ph(`${esc(live.n)}${i === DB.ops2.main ? ' <span class="star" title="Главная точка">★</span>' : ''} ${opActPill(live)}`, esc(live.a),
    `<button class="btn pri" ${dirty && !ro ? '' : 'disabled'} onclick="opShopSave()">Сохранить изменения</button>${dirty ? `<button class="btn" onclick="opSD=null;render()">Отменить</button>` : ''}
     <span class="op-more"><button class="btn" aria-label="Ещё" onclick="this.nextElementSibling.classList.toggle('on')">⋯</button><span class="op-menu">
     <button onclick="opShopHist(${i})">История изменений</button><button ${ro} onclick="opShopRename(${i})">Редактировать название</button>${i !== DB.ops2.main ? `<button ${ro} onclick="opShopMain(${i})">★ Сделать главной точкой</button>` : ''}</span></span>`)
  + (ro ? noPerm('shops.edit') : '') + (dirty ? '<div class="note" style="margin-bottom:12px">✏️ <span>Есть несохранённые изменения — нажмите «Сохранить изменения»</span></div>' : '')
  + `<div class="card"><div class="tabs">${OPT_TABS.map(([k, t]) => `<button class="${opSD.tab === k ? 'on' : ''}" onclick="opSD.tab='${k}';location.hash='#/shop/${i}/${k}'">${t}</button>`).join('')}</div>${OPT[opSD.tab](s, i, ro)}</div>`;
};
const opHelp = arr => arr.map(([t, p]) => `<div class="op-help"><b>${t}</b>${p}</div>`).join('');
const OPT = {
  act: (s, i, ro) => { const cur = DB.shops[i].act;
    return `<p class="muted" style="margin-top:0">Активность меняется сразу по кнопке «Применить» — гости увидят это в приложении. ${DB.shops[i].load.stopAll ? '<b>Сейчас приём заказов остановлен с панели загрузки.</b>' : ''}</p>
    <div class="op-acts">
      <div class="op-act ${cur === 'on' ? 'on' : ''}"><h3>🟢 Включена</h3><p>Точка работает по графику, гости могут заказывать всеми включёнными способами</p>${cur === 'on' ? '<span class="pill ok">Сейчас</span>' : `<button class="btn pri" ${ro} onclick="opAct(${i},'on')">Применить</button>`}</div>
      <div class="op-act ${cur === 'closed' ? 'on' : ''}"><h3>🟡 Временно закрыта</h3><p>Точку видно, но заказать нельзя. Гость увидит сообщение:</p>
        <textarea class="inp" ${ro} id="opCm" maxlength="120" style="min-height:60px" onchange="opSet('closeMsg',this.value,0)">${esc(s.closeMsg)}</textarea>
        ${cur === 'closed' && s.closeMsg === DB.shops[i].closed ? '<span class="pill amb">Сейчас</span>' : `<button class="btn" ${ro} onclick="opAct(${i},'closed')">Применить</button>`}</div>
      <div class="op-act ${cur === 'off' ? 'on' : ''}"><h3>⚫ Отключена</h3><p>Точку не видно в приложении: ни в списке кофеен, ни на карте</p>${cur === 'off' ? '<span class="pill red">Сейчас</span>' : `<button class="btn red" ${ro} onclick="opAct(${i},'off')">Применить</button>`}</div>
    </div>`; },
  sched: (s, i, ro) => { const ways = s.t.length ? s.t : ['pickup'], way = s.sched.mode === 'common' ? 'common' : (ways.includes(opSD.way) ? opSD.way : ways[0]); opSD.way = way;
    const gs = opGroups(s, way), used = gs.flatMap(g => g.d), off = opDays.filter((d, k) => !used.includes(k));
    return `<div class="op-side2"><div>
      <div class="seg" style="margin-bottom:12px"><button class="${s.sched.mode === 'common' ? 'on' : ''}" ${ro} onclick="opSet('sched.mode','common')">Общий</button><button class="${s.sched.mode === 'byway' ? 'on' : ''}" ${ro} onclick="opSet('sched.mode','byway')">Зависит от способа получения</button></div>
      ${way !== 'common' ? `<div class="tabs" style="margin-bottom:6px">${ways.map(w => `<button class="${w === way ? 'on' : ''}" onclick="opSD.way='${w}';render()">${WAY_T[w]}</button>`).join('')}</div>` : ''}
      ${gs.map((g, k) => `<div class="op-grp"><div class="op-days">${opDays.map((d, n) => `<button class="op-day ${g.d.includes(n) ? 'on' : ''}" ${ro} onclick="opDay('${way}',${k},${n})">${d}</button>`).join('')}</div>
        <input class="inp" type="time" ${ro} value="${g.f}" aria-label="С" onchange="opGroups(opSD.s,'${way}')[${k}].f=this.value;render()"> — <input class="inp" type="time" ${ro} value="${g.t}" aria-label="До" onchange="opGroups(opSD.s,'${way}')[${k}].t=this.value;render()">
        ${gs.length > 1 ? `<button class="x" ${ro} title="Убрать группу" onclick="opGroups(opSD.s,'${way}').splice(${k},1);render()">✕</button>` : ''}</div>`).join('')}
      <div class="op-grp"><button class="btn sm" ${ro || (off.length ? '' : 'disabled')} onclick="opGroups(opSD.s,'${way}').push({d:[],f:'09:00',t:'21:00'});render()">＋ Группа дней</button>
        <span class="small"><b>Выходные:</b> ${off.length ? off.join(', ') : 'нет'}</span></div>
      <div class="op-grp"><b>Применить настройки ко всем точкам?</b><span class="sp" style="flex:1"></span><button class="btn sm" ${ro} onclick="opAll(${i},'sched')">Применить ко всем</button></div>
    </div><div>${opHelp([['Как задать график', 'Отметьте дни и время. День, не попавший ни в одну группу, — выходной: заказать в этот день можно только предзаказом'], ['Зависит от способа получения', 'Например, за столик — до 22:00, а доставка — до 21:00, потому что курьеру нужно время']])}</div></div>`; },
  load: (s, i, ro) => `<div class="op-side2"><div>
    <div class="op-sec"><div class="card-h" style="margin:0 0 8px"><h3 style="margin:0">Время получения срочного заказа</h3><span class="sp"></span><a class="btn sm" href="#/loadpanel/${i}">⏱ Панель управления</a></div>
      <div class="seg"><button class="${s.load.urgent === 'exact' ? 'on' : ''}" ${ro} onclick="opSet('load.urgent','exact')">Точное время</button><button class="${s.load.urgent === 'interval' ? 'on' : ''}" ${ro} onclick="opSet('load.urgent','interval')">Интервалы</button></div>
      <p class="small muted">${s.load.urgent === 'exact' ? 'Гость увидит одно время: «Готово к 12:40»' : 'Подойдёт при высокой загрузке и сложной логистике. Гость увидит интервал: «Готово к 12:35–12:45»'}</p></div>
    <div class="op-sec"><h3>Панель управления загрузкой</h3>
      <div class="seg"><button class="${s.load.panel === 'time' ? 'on' : ''}" ${ro} onclick="opSet('load.panel','time')">С изменением времени</button><button class="${s.load.panel === 'none' ? 'on' : ''}" ${ro} onclick="opSet('load.panel','none')">Без изменения времени</button></div>
      <p class="small muted">${s.load.panel === 'time' ? 'Сотрудники в часы пик добавляют время по кухне и курьерам — гость сразу видит новое время в приложении' : 'Панель только для сотрудников: время для гостя не меняется'}</p></div>
    <div class="op-sec"><h3>Время возврата точки к стандартной загрузке</h3>
      <div class="row" style="max-width:360px"><input class="inp" type="time" ${ro} value="${s.load.reset}" onchange="opSet('load.reset',this.value)"></div>
      <p class="small muted">Каждую ночь в это время панель сама вернётся к «Стандарт», чтобы утро не началось с «Высокого спроса»</p></div>
    <div class="op-sec op-grp"><b>Применить настройки ко всем точкам?</b><span style="flex:1"></span><button class="btn sm" ${ro} onclick="opAll(${i},'load')">Применить ко всем</button></div>
  </div><div>${opHelp([['Что такое управление загрузкой', 'Набор настроек, чтобы заказы были готовы и приезжали вовремя'], ['Что входит', 'Вид времени для гостя, панель для сотрудников с режимами «Кухня» и «Курьеры», стопы доставки и приёма заказов и ночной сброс']])}</div></div>`,
  cont: (s, i, ro) => `<div class="grid g2"><div>
    <label class="fld"><span>Адрес</span><input class="inp" disabled value="${esc(s.a)}"><small>Приходит из кассы iiko. Здесь только чтение</small></label>
    <label class="fld"><span>Фактический адрес</span><input class="inp" ${ro} value="${esc(s.fa)}" placeholder="Например: вход со двора" onchange="opSet('fa',this.value)"><small>Для курьеров, если вход не с улицы</small></label>
    <label class="fld"><span>Телефон</span><input class="inp" ${ro} value="${esc(s.phone)}" inputmode="tel" placeholder="+7 (900) 000-00-00" onchange="opSet('phone',opPhF(this.value))"></label>
    <label class="fld"><span>Экстренный контакт</span><input class="inp" ${ro} value="${esc(s.emerg)}" inputmode="tel" placeholder="Телефон управляющего" onchange="opSet('emerg',opPhF(this.value))"></label>
  </div><div>
    <label class="fld"><span>Telegram id чата точки</span><input class="inp" ${ro} value="${esc(s.tg)}" placeholder="-100…" onchange="opSet('tg',this.value)"><small>Сюда приходят новые заказы и уведомления</small></label>
    <label class="fld"><span>MAX id чата точки</span><input class="inp" ${ro} value="${esc(s.max)}" onchange="opSet('max',this.value)"></label>
  </div></div>`,
  asm: (s, i, ro) => `<div class="op-side2"><div>
    <label class="fld" style="max-width:280px"><span>Время готовки (сборки)</span><div class="u-wrap"><input class="inp" ${ro} type="number" min="1" max="180" value="${s.asm}" onchange="opSet('asm',Math.max(1,Math.min(180,parseInt(this.value)||1)))"><i>мин</i></div></label>
    <div class="note blue">ℹ️ <span>Гость увидит: <b>«Готовим за ${s.asm}–${s.asm + 10} мин»</b>. Панель загрузки прибавляет или убавляет время к этому числу</span></div>
  </div><div>${opHelp([['Где используется', 'В расчёте времени получения: самовывоз, за столик и доставка (плюс время курьера по зоне)']])}</div></div>`,
  dsvc: (s, i, ro) => { const del = s.t.includes('delivery');
    return `${del ? '' : '<div class="note" style="margin-bottom:12px">⚠️ <span>У точки не включён способ «Доставка» — сервис доставки не используется</span></div>'}
    <div class="op-side2"><div><div class="fld"><span>Сервис доставки</span>${DSVC.map(([k, t, p]) => `<label class="chk" style="padding:8px 0;border-top:1px solid var(--line)"><input type="radio" name="opDs" ${ro} ${s.dsvc === k ? 'checked' : ''} onchange="opSet('dsvc','${k}')"><span><b>${t}</b><br><span class="small muted">${p}</span></span></label>`).join('')}</div>
      ${s.dsvc !== 'none' ? `<div class="card" style="box-shadow:none;background:var(--surface2)"><h3>Подключение — ${(DSVC.find(d => d[0] === s.dsvc) || [])[1]}</h3>
        <dl class="kv" style="margin-top:8px">${s.dsvc === 'yandex' ? `<dt>Ключ API</dt><dd><span class="pill">🔒 хранится на сервере</span></dd><dt>Тариф</dt><dd><select class="inp" ${ro} style="width:auto" onchange="opSet('ytar',this.value)">${opOpt([['courier', 'Курьер'], ['express', 'Экспресс']], s.ytar)}</select></dd>`
          : s.dsvc === 'whitecabs' ? '<dt>Ключ</dt><dd><span class="pill">🔒 хранится на сервере</span></dd><dt>Location ID</dt><dd><span class="pill">🔒 хранится на сервере</span></dd>'
          : '<dt>Client ID и Secret</dt><dd><span class="pill">🔒 хранятся на сервере</span></dd>'}</dl>
        <p class="small muted" style="margin:8px 0 0">Ключи в панели не вводят и не показывают — их кладёт разработчик на сервер</p></div>` : ''}
      <label class="chk" style="margin-top:14px"><input type="checkbox" ${ro} ${s.outZone ? 'checked' : ''} onchange="opSet('outZone',this.checked)"> Запрос на доставку вне зоны — гость оставит заявку, если адрес вне зон</label>
    </div><div>${opHelp([['Стартер Логист', 'Свой сервис Starter: подбирает курьера среди нескольких служб. Подключается через поставщика'], ['Заявки на доставку', 'Все вызовы курьеров видны в разделе <a href="#/deliveries">«Доставки»</a> с Claim_ID внешней службы']])}</div></div>`; },
  pre: (s, i, ro) => { const ways = s.t.length ? s.t : ['pickup'], k = s.pre.mode === 'common' ? 'common' : (ways.includes(opSD.pway) ? opSD.pway : ways[0]); opSD.pway = k;
    const sl = s.pre.slots[k] = s.pre.slots[k] || clone(s.pre.slots.common || {iv: 30, step: 30, max: ''});
    const g = (s.sched.common.find(x => x.d.includes(opDow())) || {f: '09:00'}), st = opMin(g.f), t0 = st[0] * 60 + (st[1] || 0);
    const fm = m => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;
    const ex = sl.iv ? [0, 1, 2].map(n => `${fm(t0 + n * (sl.step || 30))}–${fm(t0 + n * (sl.step || 30) + sl.iv)}`) : [0, 1, 2].map(n => fm(t0 + n * (sl.step || 30)));
    return `<div class="op-side2"><div>
      <div class="op-sec"><h3>Предзаказ</h3>
        <label class="tog" style="max-width:420px;margin-bottom:8px"><span>Можно делать предзаказ</span>${sw('opPre1', s.pre.on, `${ro} onchange="opSet('pre.on',this.checked)"`)}</label>
        <label class="tog" style="max-width:420px"><span>Можно делать предзаказ в нерабочее время точки</span>${sw('opPre2', s.pre.off, `${ro || (s.pre.on ? '' : 'disabled')} onchange="opSet('pre.off',this.checked)"`)}</label></div>
      <div class="op-sec"><h3>Настройка слотов</h3>
        <div class="btns" style="margin-bottom:10px"><label class="chk"><input type="radio" name="opPm" ${ro} ${s.pre.mode === 'common' ? 'checked' : ''} onchange="opSet('pre.mode','common')"> Общая</label><label class="chk"><input type="radio" name="opPm" ${ro} ${s.pre.mode === 'byway' ? 'checked' : ''} onchange="opSet('pre.mode','byway')"> Зависит от способа получения</label></div>
        ${k !== 'common' ? `<div class="tabs" style="margin-bottom:8px">${ways.map(w => `<button class="${w === k ? 'on' : ''}" onclick="opSD.pway='${w}';render()">${WAY_T[w]}</button>`).join('')}</div>` : ''}
        ${[['iv', 'Интервал', 'От 10 мин, кратно 5. 0 — гость выбирает точное время', 'минут'], ['step', 'Шаг между слотами', 'От 10 мин, кратно 5', 'минут'], ['max', 'Максимум заказов на слот', 'От 5. Пусто — без ограничений', 'заказов']].map(([f, t, p, u]) =>
          `<div class="prm" style="grid-template-columns:minmax(0,1fr) 170px"><div class="l"><b>${t}</b><p>${p}</p></div><div class="u-wrap"><input class="inp" ${ro} inputmode="numeric" value="${esc(sl[f])}" onchange="opSet('pre.slots.${k}.${f}',this.value===''?'':+this.value.replace(/\\D/g,''))"><i>${u}</i></div></div>`).join('')}
      </div>
      <div class="op-sec op-grp"><b>Применить настройки ко всем точкам?</b><span style="flex:1"></span><button class="btn sm" ${ro} onclick="opAll(${i},'pre')">Применить ко всем</button></div>
    </div><div>${opHelp([['Так увидит гость', `Первые слоты сегодня: <br>${ex.map(x => `<span class="pill" style="margin:4px 4px 0 0">${x}</span>`).join('')}${sl.max ? `<br><span class="small muted">В слоте не больше ${sl.max} заказов — дальше слот скрывается</span>` : ''}`],
      ['Маленькие или большие слоты', 'Маленькие — когда готовим быстро и курьер везёт один заказ. Большие — когда готовка долгая или курьер везёт несколько заказов']])}</div></div>`; },
};
function opDay(way, k, n) {
  const gs = opGroups(opSD.s, way), g = gs[k];
  if (g.d.includes(n)) g.d = g.d.filter(x => x !== n); else { gs.forEach(x => { x.d = x.d.filter(y => y !== n); }); g.d.push(n); g.d.sort(); }
  render();
}
function opSchedCheck(s) {
  const all = [s.sched.common, ...(s.sched.mode === 'byway' ? Object.entries(s.sched.byway).filter(([w]) => s.t.includes(w)).map(e => e[1]) : [])];
  for (const gs of all) for (const g of gs) {
    if (!g.d.length) return 'В группе не выбран ни один день — отметьте дни или уберите группу';
    if (!/^\d{2}:\d{2}$/.test(g.f) || !/^\d{2}:\d{2}$/.test(g.t)) return 'Укажите время работы, например 08:00 — 22:00';
    if (g.f >= g.t) return 'Время закрытия должно быть позже открытия';
  }
  return '';
}
function opPreCheck(s) {
  for (const [w, sl] of Object.entries(s.pre.slots)) {
    const nm = w === 'common' ? '' : ` (${WAY_T[w]})`;
    if (sl.iv !== 0 && (sl.iv < 10 || sl.iv % 5)) return 'Интервал — 0 или от 10 минут, кратно 5' + nm;
    if (!sl.step || sl.step < 10 || sl.step % 5) return 'Шаг между слотами — от 10 минут, кратно 5' + nm;
    if (sl.max !== '' && sl.max < 5) return 'Максимум заказов на слот — от 5 или пусто' + nm;
  }
  return '';
}
function opSyncHours(s) {   /* «Будни / выходные» для приложения — из общего графика */
  const g = d => s.sched.common.find(x => x.d.includes(d));
  const a = g(0), b = g(5); if (a) s.wd = `${opHrShort(a.f)}–${opHrShort(a.t)}`; if (b) s.we = `${opHrShort(b.f)}–${opHrShort(b.t)}`;
  s.eta = `${s.asm}–${s.asm + 10} мин`;
}
const OP_SEC = {sched: 'график', load: 'управление загрузкой', fa: 'фактический адрес', phone: 'телефон', emerg: 'экстренный контакт', tg: 'Telegram id', max: 'MAX id', asm: 'время сборки', dsvc: 'сервис доставки', outZone: 'заявки вне зоны', ytar: 'тариф Яндекс Доставки', pre: 'предзаказ', closeMsg: 'сообщение о закрытии'};
function opShopSave() {
  if (!can('shops.edit')) return;
  const i = opSD.i, s = opSD.s, old = DB.shops[i];
  const e = opSchedCheck(s) || opPreCheck(s); if (e) { toast(e); return; }
  opSyncHours(s);
  const ch = Object.keys(OP_SEC).filter(k => JSON.stringify(old[k]) !== JSON.stringify(s[k])).map(k =>
    ['asm', 'phone', 'fa', 'emerg', 'tg', 'max', 'dsvc', 'closeMsg'].includes(k) ? `${OP_SEC[k]} ${opDiff(old[k] || '—', s[k] || '—')}` : OP_SEC[k]);
  const live = {...s, act: old.act, closed: old.closed, load: {...s.load, kitchen: old.load.kitchen, couriers: old.load.couriers, stopAll: old.load.stopAll, stopDel: old.load.stopDel}};
  DB.shops[i] = live; opSD.s = clone(live);
  audit('Изменили точку ' + old.n, ch.join(' · ') || 'без изменений', {shop: i}); save(); render(); toast('Сохранено ✓');
}
function opAct(i, a) {
  if (!can('shops.edit')) return;
  const s = DB.shops[i], msg = a === 'closed' ? (val('opCm') || 'Временно не принимаем заказы') : '';
  const T = {on: 'Включена', closed: 'Временно закрыта', off: 'Отключена'};
  const go = () => {
    const was = T[s.act] + (s.closed ? ` («${s.closed}»)` : '');
    s.act = a; s.closed = a === 'on' ? '' : a === 'closed' ? msg : 'Кофейная не работает'; if (a === 'closed') s.closeMsg = msg;
    if (a === 'on') s.load.stopAll = false;
    opSD.s.act = s.act; opSD.s.closed = s.closed; opSD.s.closeMsg = s.closeMsg; opSD.s.load.stopAll = s.load.stopAll;
    audit('Активность точки ' + s.n, opDiff(was, T[a] + (a === 'closed' ? ` («${msg}»)` : '')), {shop: i}); save(); render(); toast(`${s.n}: ${T[a].toLowerCase()}`);
  };
  if (a === 'on') return go();
  modal({t: a === 'off' ? 'Отключить точку?' : 'Временно закрыть точку?', body: `<p style="margin-top:0">${a === 'off' ? `<b>${esc(s.n)}</b> пропадёт из приложения: из списка кофеен и с карты. Заказы, которые уже приняты, нужно довести до конца` : `Гости увидят <b>${esc(s.n)}</b>, но заказать не смогут. Сообщение: «${esc(msg)}»`}</p>`,
    ok: 'Применить', cls: a === 'off' ? 'red' : 'pri', onOk: go});
}
function opAll(i, sec) {
  if (!can('shops.edit')) return;
  const s = opSD.s, T = {sched: 'график работы', load: 'управление загрузкой', pre: 'предзаказ'};
  const e = sec === 'sched' ? opSchedCheck(s) : sec === 'pre' ? opPreCheck(s) : ''; if (e) { toast(e); return; }
  modal({t: 'Применить ко всем точкам?', body: `<p style="margin-top:0">Настройки «${T[sec]}» из <b>${esc(DB.shops[i].n)}</b> заменят такие же настройки во всех ${DB.shops.length} точках. Вернуть прежние значения кнопкой не получится — только вручную в каждой точке</p>`,
    ok: 'Применить ко всем', cls: 'red', onOk: () => {
      DB.shops.forEach((x, k) => {
        if (sec === 'load') x.load = {...x.load, urgent: s.load.urgent, panel: s.load.panel, reset: s.load.reset};
        else { x[sec] = clone(s[sec]); if (sec === 'sched') { if (k !== i) x.sched.byway = Object.fromEntries(Object.entries(x.sched.byway).filter(([w]) => x.t.includes(w))); opSyncHours(x); } }
      });
      const L = DB.shops[i]; if (sec === 'load') ['urgent', 'panel', 'reset'].forEach(k => { opSD.s.load[k] = L.load[k]; }); else { opSD.s[sec] = clone(L[sec]); opSD.s.wd = L.wd; opSD.s.we = L.we; opSD.s.eta = L.eta; }
      audit('Применили ко всем точкам', `${T[sec]} — как в ${esc(DB.shops[i].n)}`, {shop: i}); save(); render(); toast(`Готово: ${T[sec]} во всех точках`);
    }});
}
function opShopHist(i) {
  const s = DB.shops[i], L = DB.audit.filter(a => a.shop === i || (a.shop == null && /кофейн|стоп|точк/i.test(a.what) && String(a.detail).includes(s.n)));
  modal({t: 'История изменений · ' + esc(s.n), wide: 1, body: auditList(L.slice(0, 100)), ok: '', cancel: 'Закрыть'});
}
function opShopRename(i) {
  const s = DB.shops[i];
  modal({t: 'Название точки', body: `<label class="fld"><span>Название</span><input class="inp" id="opRn" maxlength="40" value="${esc(s.n)}"></label><p class="small muted">Новое название сразу появится в приложении, стоп-листах, заказах и отчётах</p>`,
    ok: 'Сохранить', onOk: () => {
      const n = val('opRn'), old = s.n;
      if (n.length < 2) { toast('Название — от 2 букв'); return false; }
      if (DB.shops.some((x, k) => k !== i && x.n === n)) { toast('Такое название уже есть'); return false; }
      if (n === old) return;
      s.n = n; if (opSD && opSD.i === i) opSD.s.n = n;
      allItems().forEach(m => { if ((m.stop || []).includes(old)) { const ov = DB.menuOv[m.id] = DB.menuOv[m.id] || {}; ov.stop = m.stop.map(x => x === old ? n : x); } });
      DB.orders.forEach(o => { if (o.shop === old) o.shop = n; }); DB.guests.forEach(g => { if (g.shop === old) g.shop = n; });
      audit('Переименовали точку', opDiff(old, n), {shop: i}); save(); render();
    }});
}
function opShopMain(i) { const w = DB.shops[DB.ops2.main]; DB.ops2.main = i; audit('Главная точка проекта', opDiff(w ? w.n : '—', DB.shops[i].n), {shop: i}); save(); render(); }

/* ═════════ Панель управления загрузкой (§20) ═════════ */
let opLP = {tab: 'load', zf: 'all'};
const opShift = s => s.load.panel === 'none' ? 0 : s.load.kitchen;
const opRange = (a, b, d) => `${Math.max(5, a + d)} – ${Math.max(10, b + d)}`;
PAGES.loadpanel = r => {
  opFixAll();
  const i = DB.shops[+r[1]] ? +r[1] : DB.ops2.main, s = DB.shops[i], ro = opRO('shops.edit'), del = s.t.includes('delivery');
  const zs = DB.zones.map((z, k) => [z, k]), act = zs.filter(([z]) => !z.off), zl = opLP.zf === 'on' ? act : opLP.zf === 'off' ? zs.filter(([z]) => z.off) : zs;
  const modes = (k, dis) => `<div class="op-modes">${LOAD_M.map(([v, t, sub]) => `<button class="op-mode ${s.load[k] === v ? 'on' : ''}" ${ro || dis} onclick="opMode(${i},'${k}',${v})">${t}<small>${sub}</small></button>`).join('')}</div>`;
  const pk = s.asm, kd = opShift(s), cd = s.load.panel === 'none' ? 0 : s.load.couriers;
  return `<a class="op-back" href="#/shops2">← Точки продаж</a>`
  + `<div class="filters"><select class="inp" style="width:auto;font-weight:600" onchange="location.hash='#/loadpanel/'+this.value">${DB.shops.map((x, k) => `<option value="${k}" ${k === i ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select>
    <div class="seg"><button class="${opLP.tab === 'load' ? 'on' : ''}" onclick="opLP.tab='load';render()">⏱ Загрузка</button><button class="${opLP.tab === 'map' ? 'on' : ''}" onclick="opLP.tab='map';render()">📍 Карта доставки</button></div>
    <span style="flex:1"></span>${opActPill(s)}<a class="btn sm" href="#/shop/${i}/load">Настройки точки</a></div>`
  + (ro ? noPerm('shops.edit') : '')
  + (s.load.panel === 'none' ? '<div class="note blue" style="margin-bottom:12px">ℹ️ <span>У точки панель «без изменения времени»: режимы видны сотрудникам, но время для гостя не меняется. Поменять — в «Настройки точки → Управление загрузкой»</span></div>' : '')
  + (opLP.tab === 'map' ? opMap(s, i, ro) : `<div class="op-lp"><div class="card">
      <h2>🍳 Кухня</h2>${modes('kitchen', '')}
      <h2>🛵 Курьеры</h2>${del ? modes('couriers', '') : '<p class="muted">У точки нет доставки — режим курьеров не нужен</p>'}
      <div class="op-stops" style="margin-top:6px">
        <button class="op-stop ${s.load.stopDel ? 'on' : ''}" ${ro || (del ? '' : 'disabled')} onclick="opStop(${i},'stopDel')">${s.load.stopDel ? '▶ Возобновить доставку' : '<i>❚❚</i> СТОП Доставка'}</button>
        <button class="op-stop ${s.load.stopAll ? 'on' : ''}" ${ro} onclick="opStop(${i},'stopAll')">${s.load.stopAll ? '▶ Возобновить приём' : '<i>❚❚</i> СТОП Приём заказов'}</button></div>
      <p class="small muted" style="margin:12px 0 0">В ${esc(s.load.reset)} панель сама вернётся к «Стандарт». Стопы ночью не снимаются</p></div>
    <div class="op-dark"><h3>Самовывоз</h3><div class="op-zone">${esc(s.n)}<b>${s.load.stopAll ? '—' : opRange(pk, pk + 10, kd)}<small>${s.load.stopAll ? 'стоп' : 'мин'}</small></b></div>
      <h3 style="margin-top:16px">Доставка</h3>${del ? `<div class="op-fl">${[['all', 'Все', zs.length], ['on', 'Активные', act.length], ['off', 'Неактивные', zs.length - act.length]].map(([k, t, n]) => `<button class="${opLP.zf === k ? 'on' : ''}" onclick="opLP.zf='${k}';render()">${t} · ${n}</button>`).join('')}</div>
      ${zl.map(([z]) => { const m = opMin(z.eta); return `<div class="op-zone ${z.off ? 'off' : ''}">${esc(z.n)}<b>${s.load.stopDel || s.load.stopAll || z.off ? '—' : opRange(m[0] || 60, m[1] || m[0] || 80, kd + cd)}<small>${s.load.stopDel || s.load.stopAll ? 'стоп' : z.off ? 'выкл' : 'мин'}</small></b></div>`; }).join('') || '<p class="small" style="opacity:.7">Зон нет</p>'}`
      : '<p class="small" style="opacity:.7">Точка не доставляет</p>'}</div></div>`);
};
function opMode(i, k, v) {
  const s = DB.shops[i], w = s.load[k]; if (w === v || !can('shops.edit')) return;
  const nm = x => (LOAD_M.find(m => m[0] === x) || [])[1];
  s.load[k] = v; if (opSD && opSD.i === i) opSD.s.load[k] = v;
  audit(`Загрузка ${s.n}: ${k === 'kitchen' ? 'кухня' : 'курьеры'}`, opDiff(nm(w), nm(v)), {shop: i}); save(); render();
  toast(`${k === 'kitchen' ? 'Кухня' : 'Курьеры'}: ${nm(v)}${s.load.panel === 'none' ? '' : ' — время в приложении обновилось'}`);
}
function opStop(i, k) {
  const s = DB.shops[i]; if (!can('shops.edit')) return;
  const on = !s.load[k], all = k === 'stopAll';
  const go = () => {
    s.load[k] = on;
    if (all) { if (on) { s.prevAct = {act: s.act, closed: s.closed}; s.act = 'closed'; s.closed = 'Временно не принимаем заказы'; } else { const p = s.prevAct && s.prevAct.act !== 'closed' ? s.prevAct : {act: 'on', closed: ''}; s.act = p.act; s.closed = p.closed; delete s.prevAct; } }
    if (opSD && opSD.i === i) { opSD.s.load[k] = on; opSD.s.act = s.act; opSD.s.closed = s.closed; }
    audit(`${on ? 'СТОП' : 'Сняли стоп'}: ${all ? 'приём заказов' : 'доставка'} · ${s.n}`, all ? `активность: ${on ? 'приём заказов на стопе' : 'включена'}` : '', {shop: i}); save(); render();
    toast(on ? `${s.n}: ${all ? 'приём заказов остановлен' : 'доставка остановлена'}` : `${s.n}: ${all ? 'приём заказов возобновлён' : 'доставка снова работает'}`);
  };
  if (!on) return go();
  modal({t: all ? 'Остановить приём заказов?' : 'Остановить доставку?', body: `<p style="margin-top:0">${all ? `<b>${esc(s.n)}</b> перестанет принимать заказы из приложения — гости увидят «Временно не принимаем заказы». Активность точки сменится на «Приём заказов на стопе»` : `В <b>${esc(s.n)}</b> нельзя будет заказать доставку. Самовывоз и «за столик» работают`}</p><p class="small muted">Снять стоп — той же кнопкой</p>`,
    ok: all ? 'СТОП приём заказов' : 'СТОП доставка', cls: 'red', onOk: go});
}
function opMap(s, i, ro) {
  const zs = DB.zones, n = zs.length || 1, C = 180, R = k => 46 + (k + 1) * (120 / n);
  return `<div class="grid g-side"><div class="card op-map"><svg viewBox="0 0 360 360" role="img" aria-label="Схема зон доставки">
    <rect width="360" height="360" rx="14" style="fill:var(--surface2)"/>
    <path d="M0 120 H360 M0 250 H360 M110 0 V360 M250 0 V360" stroke-width="6" opacity=".55" style="stroke:var(--line2)"/>
    ${zs.map((z, k) => k).reverse().map(k => { const z = zs[k]; return `<circle cx="${C}" cy="${C}" r="${R(k)}" fill="${z.off ? 'transparent' : ['#3f9a72', '#00657f', '#5e35b1', '#b23a00'][k % 4]}" fill-opacity=".14" stroke="${z.off ? '#8a908b' : ['#3f9a72', '#00657f', '#5e35b1', '#b23a00'][k % 4]}" stroke-width="2" ${z.off ? 'stroke-dasharray="6 5"' : ''}/>
      <text x="${C}" y="${C - R(k) + 16}" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--ink)">${esc(z.n)} · ${esc(z.eta)}</text>`; }).join('')}
    <circle cx="${C}" cy="${C}" r="9" fill="#e53935" stroke="#fff" stroke-width="3"/><text x="${C}" y="${C + 26}" text-anchor="middle" font-size="12" font-weight="700" style="fill:var(--ink)">${esc(s.n)}</text></svg>
    <p class="small muted" style="margin:8px 0 0">Схема без подложки карты: в продукте зоны рисуются на карте города</p></div>
    <div class="card"><h3>Зоны доставки</h3><p class="small muted">Выключенная зона пропадает у гостя при выборе адреса. Цены и минимальный заказ — в «Кофейни и доставка»</p>
    ${zs.map((z, k) => `<label class="tog" style="padding:10px 0;border-top:1px solid var(--line)"><span><b>${esc(z.n)}</b><br><span class="small muted">${esc(z.eta)} · от ${rub(z.min)}</span></span>${sw('opZ' + k, !z.off, `${ro} onchange="opZone(${k},this.checked)"`)}</label>`).join('') || '<div class="empty">Зон нет</div>'}</div></div>`;
}
function opZone(k, on) { const z = DB.zones[k]; z.off = !on; audit(on ? 'Включили зону доставки' : 'Выключили зону доставки', esc(z.n)); save(); render(); }

/* ═════════ Курьеры (§17) ═════════ */
PAGES.couriers = () => {
  const ro = opRO('shops.edit'), L = DB.ops2.couriers;
  return ph('Курьеры', 'Свои курьеры сети. Курьеров внешних служб (Яндекс Доставка и др.) вызывают автоматически — см. «Доставки»', ro ? '' : '<button class="btn pri" onclick="opCour()">＋ Создать</button>')
  + (ro ? noPerm('shops.edit') : '')
  + `<div class="tw"><table><thead><tr><th>ID</th><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>Телефон</th><th>Действия</th></tr></thead><tbody>
  ${L.map(c => `<tr><td>${c.id}</td><td>${esc(c.l) || '<span class="muted">—</span>'}</td><td>${esc(c.n) || '<span class="muted">—</span>'}</td><td>${esc(c.m) || '<span class="muted">—</span>'}</td><td class="nowrap">${esc(c.ph) || '<span class="muted">—</span>'}</td>
    <td class="nowrap"><button class="btn sm" ${ro} onclick="opCour(${c.id})">Редактировать</button> <button class="x" ${ro} title="Удалить" onclick="opCourDel(${c.id})">✕</button></td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Курьеров пока нет</div>'}</div>`;
};
function opCour(id) {
  const c = DB.ops2.couriers.find(x => x.id === id) || {l: '', n: '', m: '', ph: ''};
  const ok = more => {
    const n = {l: val('opCl'), n: val('opCn'), m: val('opCm2'), ph: val('opCp') ? opPhF(val('opCp')) : ''};
    if (!n.l && !n.n) { toast('Укажите фамилию или имя'); return false; }
    if (n.ph && opDig(n.ph).length !== 10) { toast('Проверьте телефон: нужно 10 цифр после +7'); return false; }
    if (id) { const was = `${c.l} ${c.n}`.trim(); Object.assign(c, n); audit('Изменили курьера', `${c.id}: ${opDiff(was, `${n.l} ${n.n}`.trim())}`); }
    else { const nid = Math.max(0, ...DB.ops2.couriers.map(x => x.id)) + 1; DB.ops2.couriers.push({id: nid, ...n}); audit('Новый курьер', `${nid}: ${esc(`${n.l} ${n.n}`.trim())}`); }
    save(); render();
    if (more) { closeModal(); opCour(); toast('Курьер сохранён — можно добавить следующего'); }
  };
  modal({t: id ? 'Курьер ' + id : 'Новый курьер', body: `<div class="row"><label class="fld"><span>Фамилия</span><input class="inp" id="opCl" value="${esc(c.l)}"></label><label class="fld"><span>Имя</span><input class="inp" id="opCn" value="${esc(c.n)}"></label></div>
    <div class="row"><label class="fld"><span>Отчество</span><input class="inp" id="opCm2" value="${esc(c.m)}"></label><label class="fld"><span>Телефон</span><input class="inp" id="opCp" inputmode="tel" placeholder="+7 (900) 000-00-00" value="${esc(c.ph)}"></label></div>`,
    ok: 'Сохранить', cancel: 'Отменить', onOk: () => ok(false)});
  if (!id) opModalBtn('Сохранить и создать ещё', () => ok(true));
}
function opCourDel(id) {
  const c = DB.ops2.couriers.find(x => x.id === id);
  modal({t: 'Удалить курьера?', body: `<p style="margin-top:0">${esc(`${c.l} ${c.n}`.trim() || 'Курьер ' + id)} пропадёт из списка. Прошлые доставки останутся</p>`, ok: 'Удалить', cls: 'red',
    onOk: () => { DB.ops2.couriers = DB.ops2.couriers.filter(x => x.id !== id); audit('Удалили курьера', `${id}: ${esc(`${c.l} ${c.n}`.trim())}`); save(); render(); }});
}

/* ═════════ Доставки (§18) ═════════ */
let opDF = {st: '', q: ''};
function opDeliveries() {
  const os = DB.orders.filter(o => o.ch === 'Доставка').slice().sort((a, b) => a.at.localeCompare(b.at)), today = isoDay();
  return os.map((o, k) => { const h = opH(o.id), sh = DB.shops.findIndex(s => s.n === o.shop);
    const st = o.st === 'Возврат' ? 'Отменена' : o.at.slice(0, 10) === today ? ['Ищем курьера', 'Курьер едет в кофейню', 'Курьер в пути', 'Доставка окончена'][h % 4] : 'Доставка окончена';
    return {id: 40001 + k, o, st, adm: h % 9 === 0 ? 'Ирина Гусева' : 'Автовызов', claim: (h.toString(16) + opH(o.id + 'c').toString(16) + '0000000000000000').slice(0, 32), svc: sh >= 0 ? (DSVC.find(d => d[0] === DB.shops[sh].dsvc) || DSVC[0])[1] : '—'}; }).reverse();
}
PAGES.deliveries = () => {
  const all = opDeliveries(), grp = d => d.st === 'Отменена' ? 'cancel' : d.st === 'Доставка окончена' ? 'done' : 'work';
  const L = all.filter(d => (!opDF.st || grp(d) === opDF.st) && (!opDF.q || d.o.id.toLowerCase().includes(opDF.q.toLowerCase()) || String(d.id).includes(opDF.q)));
  const pill = st => st === 'Отменена' ? 'red' : st === 'Доставка окончена' ? 'ok' : 'amb';
  return ph('Доставки', `Всего ${nf(all.length)} ${plural(all.length, 'заявка', 'заявки', 'заявок')} на доставку. Заявка создаётся, когда для заказа вызывают курьера: автоматически или вручную`)
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="ID заявки или № заказа" value="${esc(opDF.q)}" onchange="opDF.q=this.value;render()"></div>
    <div class="seg">${[['', 'Все'], ['work', 'В работе'], ['done', 'Окончены'], ['cancel', 'Отменены']].map(([k, t]) => `<button class="${opDF.st === k ? 'on' : ''}" onclick="opDF.st='${k}';render()">${t}</button>`).join('')}</div></div>
  <div class="tw"><table><thead><tr><th>ID</th><th>Статус</th><th>Создана</th><th>Администратор</th><th>№ заказа</th><th>Точка</th><th>Служба</th><th>Claim_ID</th></tr></thead><tbody>
  ${L.slice(0, 200).map(d => `<tr><td>${d.id}</td><td><span class="pill ${pill(d.st)}">${d.st}</span></td><td class="nowrap small">${dShort(d.o.at)} ${d.o.at.slice(11, 16)}</td><td class="small">${d.adm}</td>
    <td><a href="javascript:void 0" onclick="openOrder('${d.o.id}')">${d.o.id}</a></td><td class="small nowrap">${esc(d.o.shop)}</td><td class="small">${d.svc}</td><td class="small muted" title="${d.claim}" style="font-family:ui-monospace,Menlo,monospace">${d.claim.slice(0, 12)}…</td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Заявок нет</div>'}</div>${L.length > 200 ? `<p class="small muted">Показаны последние 200 из ${nf(L.length)}</p>` : ''}`;
};

/* ═════════ Комплектация заказа (§22) ═════════ */
const opFind = n => allItems().find(m => m.n === n) || allItems()[0];
let opPk = null;
function opPkInit() {
  if (opPk) return;
  opPk = {shop: DB.ops2.main, way: 'delivery', cart: [opFind('Капучино'), opFind('Латте')].filter(Boolean).map(m => ({id: m.id, q: 1})), cut: null, add: {}};
}
const opRound = (x, how) => how === 'up' ? Math.ceil(x) : how === 'down' ? Math.floor(x) : Math.round(x);
PAGES.package = () => {
  opPkInit();
  const P = DB.ops2.pkg, ro = opRO('shops.edit'), sp = P.simple, st = P.sets;
  const DEF = {none: 'Без приборов', one: '1 комплект', item: 'По числу блюд'};
  return ph('Комплектация заказа', 'Приборы, сахар, палочки и соусы, которые гость получает к заказу. Справа — демо-корзина: как это видит гость')
  + (ro ? noPerm('shops.edit') : '')
  + `<div class="grid g-side"><div>
    <div class="card"><div class="card-h"><div class="tog" style="gap:10px">${sw('opSp', sp.on, `${ro} onchange="opPkSet('simple.on',this.checked)"`)}<h3>Простые приборы</h3></div><span class="sp"></span><button class="btn sm" ${ro} onclick="opPkSimple()">⚙️ Настройки</button></div>
      <div class="op-chips">${[`По умолчанию: ${DEF[sp.def]}`, `Эко-сообщение: ${sp.eco ? 'вкл' : 'откл'}`, `Лимит: ${sp.limit ? sp.lim + ' шт' : 'откл'}`, `Запоминать выбор гостя: ${sp.remember ? 'вкл' : 'откл'}`].map(x => `<span class="pill">${x}</span>`).join('')}</div>
      <p class="small muted" style="margin:8px 0 0">Гость сам выбирает, сколько комплектов приборов положить. Для доставки и самовывоза</p></div>
    <div class="card"><div class="card-h"><div class="tog" style="gap:10px">${sw('opSt', st.on, `${ro} onchange="opPkSet('sets.on',this.checked)"`)}<h3>Наборы по блюдам</h3></div><span class="sp"></span><button class="btn sm" ${ro} onclick="opPkSet2()">⚙️ Настройки</button><button class="btn sm" ${ro} onclick="opSetEd()">＋ Создать набор</button></div>
      <div class="op-chips">${[`Эко-сообщение: ${st.eco ? 'вкл' : 'откл'}`, `Округление: ${{math: 'математическое', up: 'вверх', down: 'вниз'}[st.round]}`].map(x => `<span class="pill">${x}</span>`).join('')}</div>
      ${st.list.length ? `<div class="tw" style="margin-top:12px"><table><thead><tr><th>Набор</th><th>К блюдам</th><th>Что кладём</th><th></th></tr></thead><tbody>${st.list.map(x => `<tr class="click" onclick="opSetEd('${x.id}')"><td><b>${esc(x.n)}</b></td><td class="small">${x.items.map(id => esc((itm(id) || {}).n || id)).slice(0, 4).join(', ')}${x.items.length > 4 ? ` и ещё ${x.items.length - 4}` : ''}</td>
        <td class="small">${x.adds.map(a => `${esc(a.n)} — ${a.free} бесплатно${a.p ? `, дальше ${rub(a.p)}` : ''}`).join('<br>')}</td><td onclick="event.stopPropagation()"><button class="x" ${ro} title="Удалить набор" onclick="opSetDel('${x.id}')">✕</button></td></tr>`).join('')}</tbody></table></div>`
        : `<div class="empty">Автоматически добавляйте приборы, сахар и соусы к блюдам в корзине<br><button class="btn sm" style="margin-top:10px" ${ro} onclick="opSetEd()">＋ Создать набор</button></div>`}</div>
  </div><div>${opPkCart()}</div></div>`;
};
function opPkSet(p, v) { if (!can('shops.edit')) return; const ks = p.split('.'), o = DB.ops2.pkg[ks[0]], w = o[ks[1]]; o[ks[1]] = v; opPk.cut = null; audit('Комплектация заказа', `${ks[0] === 'simple' ? 'Простые приборы' : 'Наборы по блюдам'}: ${opDiff(w ? 'вкл' : 'выкл', v ? 'вкл' : 'выкл')}`); save(); render(); }
function opPkSimple() {
  const sp = DB.ops2.pkg.simple;
  modal({t: 'Простые приборы', body: `<label class="fld"><span>По умолчанию в корзине</span><select class="inp" id="opPd">${opOpt([['none', 'Без приборов'], ['one', '1 комплект'], ['item', 'По числу блюд']], sp.def)}</select><small>«Без приборов» — меньше отходов: гость добавит сам, если нужно</small></label>
    <label class="chk" style="margin-bottom:10px"><input type="checkbox" id="opPe" ${sp.eco ? 'checked' : ''}> Эко-сообщение «Отказываясь от одноразовых приборов, вы помогаете природе»</label>
    <div class="row" style="align-items:center"><label class="chk"><input type="checkbox" id="opPl" ${sp.limit ? 'checked' : ''}> Лимит на заказ</label><div class="u-wrap"><input class="inp" id="opPn" inputmode="numeric" value="${sp.lim}"><i>шт</i></div></div>
    <label class="chk" style="margin-top:10px"><input type="checkbox" id="opPr" ${sp.remember ? 'checked' : ''}> Запоминать выбор гостя — в следующий раз подставим так же</label>`,
    ok: 'Сохранить', onOk: () => {
      const n = {...sp, def: val('opPd'), eco: val('opPe'), limit: val('opPl'), lim: Math.max(1, parseInt(val('opPn')) || 1), remember: val('opPr')};
      const was = JSON.stringify(sp); Object.assign(sp, n); opPk.cut = null;
      if (was !== JSON.stringify(sp)) audit('Комплектация: простые приборы', `по умолчанию «${{none: 'без приборов', one: '1 комплект', item: 'по числу блюд'}[n.def]}», лимит ${n.limit ? n.lim : 'откл'}, эко ${n.eco ? 'вкл' : 'откл'}, запоминать ${n.remember ? 'вкл' : 'откл'}`);
      save(); render();
    }});
}
function opPkSet2() {
  const st = DB.ops2.pkg.sets;
  modal({t: 'Наборы по блюдам', body: `<label class="chk" style="margin-bottom:12px"><input type="checkbox" id="opSe" ${st.eco ? 'checked' : ''}> Эко-сообщение в корзине</label>
    <label class="fld"><span>Округление</span><select class="inp" id="opSr">${opOpt([['math', 'Математическое (0,5 → 1)'], ['up', 'Вверх'], ['down', 'Вниз']], st.round)}</select><small>Если бесплатно, например, 0,5 штуки на блюдо, а в корзине 3 блюда</small></label>`,
    ok: 'Сохранить', onOk: () => { st.eco = val('opSe'); st.round = val('opSr'); audit('Комплектация: наборы', `эко ${st.eco ? 'вкл' : 'откл'}, округление ${st.round}`); save(); render(); }});
}
let opSE = null;
function opSetEd(id) {
  const x = DB.ops2.pkg.sets.list.find(s => s.id === id);
  opSE = x ? clone(x) : {id: 'P' + Date.now(), n: '', items: [], adds: [{n: '', free: 1, p: 0}]}; opSE.q = '';
  modal({t: x ? 'Набор: ' + esc(x.n) : 'Новый набор', wide: 1, body: `<div id="opSeB">${opSetBody()}</div>`, ok: 'Сохранить набор', onOk: () => {
    opSE.n = val('opSn');
    if (opSE.n.length < 2) { toast('Назовите набор'); return false; }
    if (!opSE.items.length) { toast('Выберите хотя бы одно блюдо'); return false; }
    const adds = opSE.adds.filter(a => a.n.trim()); if (!adds.length) { toast('Добавьте, что кладём к блюду'); return false; }
    const L = DB.ops2.pkg.sets.list, n = {id: opSE.id, n: opSE.n, items: opSE.items, adds}, k = L.findIndex(s => s.id === n.id);
    if (k >= 0) L[k] = n; else L.push(n);
    audit(k >= 0 ? 'Изменили набор комплектации' : 'Новый набор комплектации', `${esc(n.n)}: ${n.items.length} ${plural(n.items.length, 'блюдо', 'блюда', 'блюд')} · ${adds.map(a => esc(a.n)).join(', ')}`); save(); render();
  }});
}
function opSetBody() {
  const L = allItems().filter(m => !m.hidden && (!opSE.q || m.n.toLowerCase().includes(opSE.q.toLowerCase()))).slice(0, 60);
  return `<label class="fld"><span>Название набора</span><input class="inp" id="opSn" value="${esc(opSE.n)}" placeholder="Например: К кофе — сахар и палочка" oninput="opSE.n=this.value"></label>
    <div class="fld"><span>Что кладём к каждому блюду</span>
      <div class="op-pos h"><span>Название</span><span>Бесплатно, шт</span><span>Цена дальше</span><span class="s"></span><span></span></div>
      ${opSE.adds.map((a, k) => `<div class="op-pos"><input class="inp" value="${esc(a.n)}" placeholder="Сахар" oninput="opSE.adds[${k}].n=this.value"><input class="inp" inputmode="decimal" value="${a.free}" oninput="opSE.adds[${k}].free=Math.max(0,parseFloat(this.value.replace(',','.'))||0)"><input class="inp" inputmode="numeric" value="${a.p}" oninput="opSE.adds[${k}].p=Math.max(0,parseInt(this.value)||0)"><span class="s small muted">₽ за шт</span><button class="x" onclick="opSE.adds.splice(${k},1);opSeR()">✕</button></div>`).join('')}
      <button class="btn sm" onclick="opSE.adds.push({n:'',free:1,p:0});opSeR()">＋ Добавить</button></div>
    <div class="fld"><span>К каким блюдам · выбрано ${opSE.items.length}</span><input class="inp" placeholder="Найти блюдо" value="${esc(opSE.q)}" onchange="opSE.q=this.value;opSeR()" style="margin-bottom:8px">
      <div class="dish-grid">${L.map(m => `<button class="${opSE.items.includes(m.id) ? 'on' : ''}" onclick="opSeT('${m.id}')">${m.img ? `<img loading="lazy" src="${esc(m.img)}" alt="">` : ''}${esc(m.n)}</button>`).join('')}</div></div>`;
}
function opSeR() { opSE.n = val('opSn') || opSE.n; const b = $('#opSeB'); if (b) b.innerHTML = opSetBody(); }
function opSeT(id) { opSE.items = opSE.items.includes(id) ? opSE.items.filter(x => x !== id) : [...opSE.items, id]; opSeR(); }
function opSetDel(id) { const L = DB.ops2.pkg.sets.list, x = L.find(s => s.id === id); modal({t: 'Удалить набор?', body: `<p style="margin-top:0">«${esc(x.n)}» больше не будет добавляться в корзину</p>`, ok: 'Удалить', cls: 'red', onOk: () => { DB.ops2.pkg.sets.list = L.filter(s => s.id !== id); audit('Удалили набор комплектации', esc(x.n)); save(); render(); }}); }
function opPkCart() {
  const P = DB.ops2.pkg, s = DB.shops[opPk.shop] || DB.shops[0], ways = s.t.length ? s.t : ['pickup'];
  if (!ways.includes(opPk.way)) opPk.way = ways[0];
  const cart = opPk.cart.map(c => ({...c, m: itm(c.id)})).filter(c => c.m), qty = cart.reduce((a, c) => a + c.q, 0), table = opPk.way === 'table';
  const sp = P.simple, cap = sp.limit ? sp.lim : 99;
  const defCut = sp.def === 'none' ? 0 : sp.def === 'one' ? Math.min(1, qty) : qty;
  const cut = Math.min(cap, opPk.cut == null ? defCut : opPk.cut);
  const sets = P.sets.on ? P.sets.list.map(x => ({x, q: cart.filter(c => x.items.includes(c.id)).reduce((a, c) => a + c.q, 0)})).filter(z => z.q) : [];
  let extra = 0;
  const setRows = sets.flatMap(({x, q}) => x.adds.map((a, k) => { const key = x.id + '_' + k, free = opRound(a.free * q, P.sets.round), n = opPk.add[key] ?? free, paid = Math.max(0, n - free) * a.p; extra += paid;
    return `<div class="op-cl"><span class="ic">🧂</span><span class="n">${esc(a.n)}<small>${free} бесплатно${a.p ? ` · дальше +${rub(a.p)}` : ''}${paid ? ` · <b>+${rub(paid)}</b>` : ''}</small></span><span class="op-q"><button onclick="opPk.add['${key}']=Math.max(0,${n}-1);render()">−</button><b>${n}</b><button onclick="opPk.add['${key}']=${n}+1;render()">+</button></span></div>`; }));
  const sum = cart.reduce((a, c) => a + c.m.p * c.q, 0) + extra;
  return `<div class="card-h" style="margin-bottom:6px"><span class="small muted" style="text-transform:uppercase;letter-spacing:.06em">Демо-корзина</span><span class="sp"></span><select class="inp" style="width:auto;min-height:32px;padding:4px 8px" onchange="opPk.shop=+this.value;render()">${DB.shops.map((x, k) => `<option value="${k}" ${k === opPk.shop ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select></div>
  <div class="op-cart"><h2 style="margin-bottom:10px">Корзина</h2>
    <div class="seg" style="display:flex;margin-bottom:8px">${ways.map(w => `<button style="flex:1" class="${opPk.way === w ? 'on' : ''}" onclick="opPk.way='${w}';render()">${WAY_T[w]}</button>`).join('')}</div>
    ${cart.map((c, k) => `<div class="op-cl">${c.m.img ? `<img src="${esc(c.m.img)}" alt="">` : '<span class="ic">☕</span>'}<span class="n">${esc(c.m.n)}<small>${rub(c.m.p)}</small></span><span class="op-q"><button onclick="opPkQ(${k},-1)">−</button><b>${c.q}</b><button onclick="opPkQ(${k},1)">+</button></span></div>`).join('')}
    <div class="op-cl"><span class="ic">＋</span><select class="inp" style="flex:1;min-height:32px;padding:4px 8px" onchange="if(this.value){opPk.cart.push({id:this.value,q:1});opPk.cut=null;render()}"><option value="">Добавить блюдо</option>${allItems().filter(m => !m.hidden).slice(0, 150).map(m => `<option value="${m.id}">${esc(m.n)}</option>`).join('')}</select></div>
    ${table ? '<p class="small muted" style="margin:10px 0 0">За столиком приборы даёт бариста — в корзине их нет</p>'
      : (sp.on ? `<div class="op-box"><div class="op-cl"><span class="ic">🍴</span><span class="n">Приборы${sp.limit ? `<small>не больше ${sp.lim}</small>` : ''}</span><span class="op-q"><button onclick="opPk.cut=Math.max(0,${cut}-1);render()">−</button><b>${cut}</b><button ${cut >= cap ? 'disabled' : ''} onclick="opPk.cut=Math.min(${cap},${cut}+1);render()">+</button></span></div>
        ${sp.eco ? '<div class="op-eco">🌱 <span>Отказываясь от одноразовых приборов, вы помогаете природе</span></div>' : ''}</div>` : '')
        + (setRows.length ? `<div class="op-box"><div class="small muted" style="padding-top:6px">Приборы и добавки к блюдам</div>${setRows.join('')}${P.sets.eco ? '<div class="op-eco">🌱 <span>Возьмите столько, сколько нужно</span></div>' : ''}</div>` : '')}
    <div class="op-cl" style="border:0;margin-top:6px"><span class="n"><b>Итого</b></span><b>${rub(sum)}</b></div>
    ${sp.remember && !table ? '<p class="small muted" style="margin:0">В следующий раз гостю подставим его выбор приборов</p>' : ''}</div>`;
}
function opPkQ(k, d) { const c = opPk.cart[k]; c.q += d; if (c.q <= 0) opPk.cart.splice(k, 1); opPk.cut = null; render(); }

/* ═════════ Онлайн-оплата: юрлица (§24) ═════════ */
let opPO = {q: '', shop: ''};
PAGES.payonline = () => {
  const ro = opRO('system'), L = DB.ops2.legal.filter(l => (!opPO.q || (l.n + ' ' + l.inn + ' ' + l.boss).toLowerCase().includes(opPO.q.toLowerCase())) && (opPO.shop === '' || [...l.on, ...l.wait].includes(+opPO.shop)));
  const chip = (k, ok, l) => `<button class="pill ${ok ? 'ok' : 'amb'}" style="cursor:${ok || ro ? 'default' : 'pointer'};margin:2px" ${ok || ro ? '' : `onclick="opLgOk('${l.id}',${k})" title="Банк одобрил? Нажмите, чтобы включить оплату"`}>${ok ? '✓' : '🏦'} ${esc((DB.shops[k] || {}).n || '—')}</button>`;
  const free = DB.shops.map((s, k) => k).filter(k => !DB.ops2.legal.some(l => l.on.includes(k) || l.wait.includes(k)));
  return ph('Онлайн-оплата', 'Через какое юрлицо и в каких точках гости платят картой и SberPay в приложении. Реквизиты и имена — вымышленные', ro ? '' : '<button class="btn pri" onclick="opLgAdd()">＋ Добавить юрлицо</button>')
  + (ro ? noPerm('system') : '')
  + `<div class="card"><h3>Как подключить?</h3><div class="op-steps" style="margin-top:10px">${[['Выберите юрлицо', 'Или добавьте новое: ООО или ИП'], ['Выберите точки и реквизиты', 'Каждая точка — только у одного юрлица'], ['Документы и включение', 'Банк проверяет заявку, затем оплата включается сама']].map(([t, p], k) => `<div class="op-step"><i>${k + 1}</i><b>${t}</b><div class="small muted">${p}</div></div>`).join('')}</div>
    ${free.length ? `<p class="small" style="margin:12px 0 0">Без онлайн-оплаты: ${free.map(k => `<span class="pill">${esc(DB.shops[k].n)}</span>`).join(' ')}</p>` : ''}</div>
  <div class="filters" style="margin-top:16px"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Юрлицо, ИНН или руководитель" value="${esc(opPO.q)}" onchange="opPO.q=this.value;render()"></div>
    <select class="inp" style="width:auto" onchange="opPO.shop=this.value;render()">${opOpt([['', 'Все точки'], ...DB.shops.map((s, k) => [String(k), s.n])], opPO.shop)}</select></div>
  <div class="tw"><table><thead><tr><th>Юрлицо</th><th>ИНН</th><th>Руководитель</th><th>Оплата подключена</th><th>Заявка в работе</th><th></th></tr></thead><tbody>
  ${L.map(l => `<tr><td><b>${esc(l.n)}</b></td><td class="nowrap small">${esc(l.inn)}</td><td class="small">${esc(l.boss)}</td><td>${l.on.map(k => chip(k, 1, l)).join('') || '<span class="muted small">—</span>'}</td><td>${l.wait.map(k => chip(k, 0, l)).join('') || '<span class="muted small">—</span>'}</td>
    <td><button class="btn sm" ${ro || (free.length ? '' : 'disabled')} onclick="opLgShops('${l.id}')">＋ Точки</button></td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Ничего не нашли</div>'}</div>`;
};
const opShopChecks = (ks, cls) => `<div class="btns">${ks.map(k => `<label class="chk pill" style="padding:6px 10px"><input type="checkbox" class="${cls}" value="${k}"> ${esc(DB.shops[k].n)}</label>`).join('') || '<span class="muted small">Все точки уже подключены</span>'}</div>`;
const opFreeShops = () => DB.shops.map((s, k) => k).filter(k => !DB.ops2.legal.some(l => l.on.includes(k) || l.wait.includes(k)));
function opLgAdd() {
  modal({t: 'Новое юрлицо', body: `<div class="row"><label class="fld" style="max-width:120px"><span>Форма</span><select class="inp" id="opLk"><option>ООО</option><option>ИП</option></select></label><label class="fld"><span>Название</span><input class="inp" id="opLn" placeholder="Кофейная-3"></label></div>
    <div class="row"><label class="fld"><span>ИНН</span><input class="inp" id="opLi" inputmode="numeric" placeholder="10 цифр — ООО, 12 — ИП"></label><label class="fld"><span>Руководитель</span><input class="inp" id="opLb" placeholder="Фамилия И. О."></label></div>
    <div class="fld"><span>Точки — сразу отправим заявку в банк</span>${opShopChecks(opFreeShops(), 'opLs')}</div>`,
    ok: 'Добавить', onOk: () => {
      const k = val('opLk'), n = val('opLn'), inn = val('opLi').replace(/\D/g, ''), boss = val('opLb');
      if (n.length < 2) { toast('Укажите название'); return false; }
      if (inn.length !== (k === 'ООО' ? 10 : 12)) { toast(`ИНН ${k === 'ООО' ? 'ООО — 10' : 'ИП — 12'} цифр`); return false; }
      if (boss.length < 3) { toast('Укажите руководителя'); return false; }
      const nm = k === 'ООО' ? `ООО «${n.replace(/^ООО\s*/, '').replace(/[«»"]/g, '')}»` : `ИП ${n.replace(/^ИП\s*/, '')}`, w = $$('.opLs').filter(x => x.checked).map(x => +x.value);
      DB.ops2.legal.push({id: 'L' + Date.now(), n: nm, inn, boss, on: [], wait: w});
      audit('Добавили юрлицо', `${esc(nm)}${w.length ? ' · заявка: ' + w.map(x => esc(DB.shops[x].n)).join(', ') : ''}`); save(); render(); toast('Юрлицо добавлено' + (w.length ? ' — заявка ушла в банк' : ''));
    }});
}
function opLgShops(id) {
  const l = DB.ops2.legal.find(x => x.id === id);
  modal({t: 'Подключить точки · ' + esc(l.n), body: `<p class="small muted" style="margin-top:0">Отправим заявку в банк. Пока банк проверяет, точка в колонке «Заявка в работе»</p>${opShopChecks(opFreeShops(), 'opLs')}`, ok: 'Отправить заявку', onOk: () => {
    const w = $$('.opLs').filter(x => x.checked).map(x => +x.value); if (!w.length) { toast('Отметьте точки'); return false; }
    l.wait.push(...w); audit('Заявка на онлайн-оплату', `${esc(l.n)}: ${w.map(x => esc(DB.shops[x].n)).join(', ')}`); save(); render(); }});
}
function opLgOk(id, k) {
  const l = DB.ops2.legal.find(x => x.id === id);
  modal({t: 'Банк одобрил заявку?', body: `<p style="margin-top:0">Включим онлайн-оплату в <b>${esc(DB.shops[k].n)}</b> через ${esc(l.n)}. Гости сразу смогут платить картой и SberPay в приложении</p>`, ok: 'Включить оплату', onOk: () => {
    l.wait = l.wait.filter(x => x !== k); l.on.push(k); audit('Онлайн-оплата подключена', `${esc(DB.shops[k].n)} · ${esc(l.n)}`); save(); render(); }});
}
const opOrgOf = shopName => { const k = DB.shops.findIndex(s => s.n === shopName), l = DB.ops2.legal.find(x => x.on.includes(k)) || DB.ops2.legal.find(x => x.wait.includes(k)); return l ? l.n : '—'; };

/* ═════════ Счета (§25) и транзакции (§26) ═════════ */
function opBills() {
  const auto = DB.orders.filter(o => o.ch !== 'Касса' && (o.pay === 'Карта' || o.pay === 'SberPay')).map(o => {
    const h = opH(o.id), g = G(o.g), paid = new Date(new Date(o.at).getTime() + 60000 * (1 + h % 3));
    return {id: 'B' + (300000 + (parseInt(o.id.replace(/\D/g, '')) || 0)), st: o.st === 'Возврат' ? 'Возвращен' : 'Оплачен', sum: o.sum - (o.bonUse || 0), at: o.at, paid: isoDay(paid) + 'T' + paid.toTimeString().slice(0, 5),
      pos: 'POS-' + (h % 900000 + 100000), o: o.id, shop: o.shop, org: opOrgOf(o.shop), type: 'Автоматический', ph: g ? g.ph : '—', card: o.pay === 'SberPay' ? 'SberPay' : '•• ' + (1000 + h % 9000), lines: o.lines.map(l => ({n: l.n, p: l.p - l.d, q: l.q || 1}))};
  });
  const fail = auto.filter(b => opH(b.o) % 41 === 0).map(b => ({...b, id: b.id + '-1', st: 'Отменен', paid: '', card: '—'}));   /* брошенные оплаты */
  return [...DB.ops2.bills, ...auto, ...fail].sort((a, b) => b.at.localeCompare(a.at));
}
let opBF = {from: '', to: '', st: '', min: '', max: '', type: '', shop: '', org: '', lim: 100};
const opBillOk = b => (!opBF.from || b.at.slice(0, 10) >= opBF.from) && (!opBF.to || b.at.slice(0, 10) <= opBF.to) && (!opBF.st || b.st === opBF.st) && (opBF.min === '' || b.sum >= +opBF.min) && (opBF.max === '' || b.sum <= +opBF.max)
  && (!opBF.type || b.type === opBF.type) && (!opBF.shop || b.shop === opBF.shop) && (!opBF.org || b.org === opBF.org);
const opBPill = st => `<span class="pill ${{'Оплачен': 'ok', 'Возвращен': 'blue', 'Отменен': 'red', 'Не оплачен': 'amb'}[st] || ''}">${st}</span>`;
const opOrgs = () => [...new Set(DB.ops2.legal.map(l => l.n))];
PAGES.bills = () => {
  const ro = opRO('system'), all = opBills(), L = all.filter(opBillOk), sum = L.reduce((a, b) => a + b.sum, 0);
  const f = (k, v) => `onchange="opBF.${k}=this.value;opBF.lim=100;render()"`;
  return ph('Счета', `Всего ${nf(L.length)} ${plural(L.length, 'счёт', 'счёта', 'счетов')} на ${rub(sum)}. Счёт создаётся на каждую онлайн-оплату заказа; ручной счёт — ссылка на оплату, которую отправляем гостю`,
    `<button class="btn" onclick="opBillCsv()">⇩ Экспортировать</button>${ro ? '' : '<button class="btn pri" onclick="opBillNew()">＋ Создать счёт</button>'}`)
  + (ro ? noPerm('system') : '')
  + `<div class="filters"><span class="op-dl"><input class="inp" type="date" value="${opBF.from}" aria-label="С" ${f('from')}>—<input class="inp" type="date" value="${opBF.to}" aria-label="По" ${f('to')}></span>
    <select class="inp" style="width:auto" ${f('st')}>${opOpt([['', 'Все статусы'], ['Не оплачен', 'Не оплачен'], ['Оплачен', 'Оплачен'], ['Возвращен', 'Возвращен'], ['Отменен', 'Отменен']], opBF.st)}</select>
    <span class="op-dl"><input class="inp" style="width:96px" inputmode="numeric" placeholder="Сумма от" value="${esc(opBF.min)}" ${f('min')}>—<input class="inp" style="width:96px" inputmode="numeric" placeholder="до" value="${esc(opBF.max)}" ${f('max')}></span>
    <select class="inp" style="width:auto" ${f('type')}>${opOpt([['', 'Любой тип'], ['Ручной', 'Ручной'], ['Автоматический', 'Автоматический']], opBF.type)}</select>
    <select class="inp" style="width:auto" ${f('shop')}>${opOpt([['', 'Все точки'], ...DB.shops.map(s => [s.n, s.n])], opBF.shop)}</select>
    <select class="inp" style="width:auto" ${f('org')}>${opOpt([['', 'Все организации'], ...opOrgs().map(o => [o, o])], opBF.org)}</select>
    ${Object.entries(opBF).some(([k, v]) => k !== 'lim' && v !== '') ? `<button class="btn sm ghost" onclick="opBF={from:'',to:'',st:'',min:'',max:'',type:'',shop:'',org:'',lim:100};render()">Сбросить</button>` : ''}</div>
  <div class="tw"><table><thead><tr><th>№</th><th>Статус</th><th class="r">Сумма</th><th>Создан</th><th>Оплачен</th><th>№ заказа POS</th><th>№ заказа</th><th>Организация</th><th>Тип счёта</th><th>Телефон клиента</th><th>Карта</th><th class="c">Чеки</th></tr></thead><tbody>
  ${L.slice(0, opBF.lim).map(b => `<tr class="click" onclick="opBill('${b.id}')"><td class="nowrap">${b.id}</td><td>${opBPill(b.st)}</td><td class="r nowrap">${rub(b.sum)}</td><td class="nowrap small">${dShort(b.at)} ${b.at.slice(11, 16)}</td><td class="nowrap small">${b.paid ? `${dShort(b.paid)} ${b.paid.slice(11, 16)}` : '—'}</td>
    <td class="small">${b.pos || '—'}</td><td onclick="event.stopPropagation()">${b.o ? `<a href="javascript:void 0" onclick="openOrder('${b.o}')">${b.o}</a>` : '—'}</td><td class="small nowrap">${esc(b.org)}</td><td class="small">${b.type}</td><td class="nowrap small">${esc(b.ph)}</td><td class="nowrap small">${esc(b.card)}</td><td class="c">${b.st === 'Оплачен' || b.st === 'Возвращен' ? '🧾' : ''}</td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Счетов по этим условиям нет</div>'}</div>
  ${L.length > opBF.lim ? `<div class="btns" style="margin-top:10px"><button class="btn" onclick="opBF.lim+=200;render()">Показать ещё</button><span class="small muted">показано ${nf(opBF.lim)} из ${nf(L.length)}</span></div>` : ''}`;
};
function opBillCsv() {
  const L = opBills().filter(opBillOk);
  opCsv(`scheta-${isoDay()}.csv`, ['№', 'Статус', 'Сумма', 'Создан', 'Оплачен', '№ заказа POS', '№ заказа', 'Точка', 'Организация', 'Тип счёта', 'Телефон', 'Карта'],
    L.map(b => [b.id, b.st, b.sum, b.at.replace('T', ' '), (b.paid || '').replace('T', ' '), b.pos, b.o, b.shop, b.org, b.type, b.ph, b.card]));
  audit('Экспорт счетов', `${nf(L.length)} ${plural(L.length, 'счёт', 'счёта', 'счетов')}`); save(); toast(`Выгрузил ${nf(L.length)} ${plural(L.length, 'счёт', 'счёта', 'счетов')} в CSV`);
}
function opBill(id) {
  const b = opBills().find(x => x.id === id); if (!b) return;
  const man = b.type === 'Ручной', ro = !can('system');
  modal({t: 'Счёт ' + b.id, wide: 1, body: `<p class="muted small" style="margin-top:0">${opBPill(b.st)} · ${b.type} · ${esc(b.shop)} · ${esc(b.org)}</p>
    <div class="tw"><table><thead><tr><th>Позиция</th><th class="r">Цена</th><th class="r">Кол-во</th><th class="r">Сумма</th></tr></thead><tbody>${b.lines.map(l => `<tr><td>${esc(l.n)}</td><td class="r">${rub(l.p)}</td><td class="r">${l.q}</td><td class="r">${rub(l.p * l.q)}</td></tr>`).join('')}</tbody></table></div>
    <dl class="kv" style="margin-top:12px"><dt>Сумма</dt><dd>${rub(b.sum)}</dd><dt>Создан</dt><dd>${dLong(b.at)} ${b.at.slice(11, 16)}</dd><dt>Оплачен</dt><dd>${b.paid ? `${dLong(b.paid)} ${b.paid.slice(11, 16)}` : '—'}</dd>
    ${man ? `<dt>Получение</dt><dd>${dLong(b.get)} ${b.get.slice(11, 16)}</dd><dt>Создал</dt><dd>${esc(b.by)}</dd>` : `<dt>Заказ</dt><dd><a href="javascript:void 0" onclick="closeModal();openOrder('${b.o}')">${b.o}</a></dd>`}<dt>Телефон</dt><dd>${esc(b.ph)}</dd><dt>Карта</dt><dd>${esc(b.card)}</dd></dl>
    ${man && b.st === 'Не оплачен' ? `<div class="btns" style="margin-top:14px"><button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText('https://pay.kofeynaya.example/${b.id}');toast('Ссылка на оплату скопирована')">🔗 Скопировать ссылку</button>
      <button class="btn" ${ro ? 'disabled' : ''} onclick="opBillSt('${b.id}','Оплачен')">Гость оплатил (проверка)</button><button class="btn red" ${ro ? 'disabled' : ''} onclick="opBillSt('${b.id}','Отменен')">Отменить счёт</button></div>` : ''}`,
    ok: '', cancel: 'Закрыть'});
}
function opBillSt(id, st) {
  const b = DB.ops2.bills.find(x => x.id === id);
  const go = () => { b.st = st; if (st === 'Оплачен') { b.paid = opNow(); b.card = '•• ' + (1000 + opH(id) % 9000); } closeModal(); audit(st === 'Оплачен' ? 'Счёт оплачен' : 'Отменили счёт', `${id} · ${rub(b.sum)}`); save(); render(); toast(st === 'Оплачен' ? 'Счёт оплачен — транзакция появилась в «Транзакциях»' : 'Счёт отменён — ссылка больше не работает'); };
  if (st === 'Оплачен') return go();
  opNested({t: 'Отменить счёт?', body: `<p style="margin-top:0">Ссылка на оплату ${rub(b.sum)} перестанет работать</p>`, ok: 'Отменить счёт', cls: 'red', cancel: 'Не отменять', onOk: () => { closeModal(); go(); return false; }});
}
let opNB = null;
function opBillNew() {
  const t = new Date(Date.now() + 3600e3);
  opNB = {lines: [{n: '', p: '', q: 1}]};
  modal({t: 'Создать счёт', wide: 1, body: `<div class="row"><label class="fld"><span>Телефон*</span><input class="inp" id="opBp" inputmode="tel" placeholder="+7 (900) 000-00-00"></label>
      <label class="fld"><span>Заведение*</span><select class="inp" id="opBs">${DB.shops.map((s, k) => `<option value="${k}" ${k === DB.ops2.main ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></label>
      <label class="fld"><span>Получение заказа*</span><input class="inp" id="opBt" type="datetime-local" value="${isoDay(t)}T${t.toTimeString().slice(0, 5)}"><small>Нужно для чека</small></label></div>
    <datalist id="opBdl">${allItems().filter(m => !m.hidden).map(m => `<option value="${esc(m.n)}">`).join('')}</datalist>
    <div id="opBl">${opBillLines()}</div>
    <div class="note blue" style="margin-top:12px">ℹ️ <span>Наименования попадут в чек как есть — пишите так, как в меню. Неточное название в чеке — риск штрафа ФНС</span></div>`,
    ok: 'Создать счёт', onOk: opBillCreate});
  opBillBtn();
}
function opBillLines() {
  return `<div class="op-pos h"><span>Наименование</span><span>Цена, ₽</span><span>Кол-во</span><span class="s">Сумма</span><span></span></div>`
  + opNB.lines.map((l, k) => `<div class="op-pos"><input class="inp" list="opBdl" value="${esc(l.n)}" placeholder="Капучино" onchange="opBlN(${k},this.value)"><input class="inp" inputmode="numeric" value="${esc(l.p)}" oninput="opNB.lines[${k}].p=parseInt(this.value)||'';opBillBtn()"><input class="inp" inputmode="numeric" value="${l.q}" oninput="opNB.lines[${k}].q=Math.max(1,parseInt(this.value)||1);opBillBtn()">
    <span class="s" id="opBs${k}">${rub((+l.p || 0) * l.q)}</span><button class="x" ${opNB.lines.length > 1 ? '' : 'disabled'} onclick="opNB.lines.splice(${k},1);$('#opBl').innerHTML=opBillLines();opBillBtn()">✕</button></div>`).join('')
  + `<button class="btn sm" onclick="opNB.lines.push({n:'',p:'',q:1});$('#opBl').innerHTML=opBillLines();opBillBtn()">＋ Добавить позицию</button>`;
}
function opBlN(k, v) { const l = opNB.lines[k]; l.n = v; const m = allItems().find(x => x.n === v); if (m && !l.p) l.p = m.p; $('#opBl').innerHTML = opBillLines(); opBillBtn(); }
const opNBsum = () => opNB.lines.reduce((a, l) => a + (+l.p || 0) * l.q, 0);
function opBillBtn() { const b = $('#mdOk'); if (b) b.textContent = `Создать счёт на ${rub(opNBsum())}`; opNB.lines.forEach((l, k) => { const e = $('#opBs' + k); if (e) e.textContent = rub((+l.p || 0) * l.q); }); }
function opBillCreate() {
  const ph_ = opDig(val('opBp')), k = +val('opBs'), t = val('opBt'), lines = opNB.lines.filter(l => l.n.trim() && +l.p > 0), sum = lines.reduce((a, l) => a + l.p * l.q, 0);
  if (ph_.length !== 10) { toast('Проверьте телефон: 10 цифр после +7'); return false; }
  if (!t) { toast('Укажите время получения заказа'); return false; }
  if (!lines.length || lines.length !== opNB.lines.length) { toast('У каждой позиции — название и цена больше 0'); return false; }
  opNested({t: 'Создать счёт на ' + rub(sum) + '?', body: `<p style="margin-top:0">Гостю ${opPhF(ph_)} придёт СМС со ссылкой на оплату. ${esc(DB.shops[k].n)}, получение ${dLong(t)} в ${t.slice(11, 16)}</p><ul style="margin:0;padding-left:18px">${lines.map(l => `<li>${esc(l.n)} — ${l.q} × ${rub(l.p)}</li>`).join('')}</ul>`,
    ok: 'Создать счёт', onOk: () => {
      const id = 'B' + DB.ops2.billNo++;
      DB.ops2.bills.unshift({id, st: 'Не оплачен', sum, at: opNow(), paid: '', get: t, pos: '', o: '', shop: DB.shops[k].n, org: opOrgOf(DB.shops[k].n), type: 'Ручной', ph: opPhF(ph_), card: '—', lines: lines.map(l => ({n: l.n.trim(), p: +l.p, q: l.q})), by: ME().n});
      audit('Создали счёт', `${id} на ${rub(sum)} · ${opPhF(ph_)} · ${esc(DB.shops[k].n)}`); save(); closeModal(); render(); toast(`Счёт ${id} на ${rub(sum)} создан — ссылка ушла гостю`);
    }});
  return false;
}
function opTrans() {
  const out = [];
  opBills().forEach(b => {
    const h = opH(b.id);
    if (b.st === 'Оплачен' || b.st === 'Возвращен') out.push({id: 7000000 + h % 2999999, st: 'Успех', type: 'Приход', sum: b.sum, at: b.at, done: b.paid, b});
    if (b.st === 'Возвращен') { const d = new Date(new Date(b.at).getTime() + 3600e3 * (2 + h % 30)); out.push({id: 7000000 + (h >> 3) % 2999999 + 1, st: 'Успех', type: 'Возврат', sum: b.sum, at: isoDay(d) + 'T' + d.toTimeString().slice(0, 5), done: isoDay(d) + 'T' + d.toTimeString().slice(0, 5), b}); }
    if (b.st === 'Отменен' && b.type === 'Автоматический') out.push({id: 7000000 + (h >> 2) % 2999999, st: 'Отмена', type: 'Приход', sum: b.sum, at: b.at, done: '', b});
  });
  return out.sort((a, b) => b.at.localeCompare(a.at));
}
let opTF = {st: '', type: '', from: '', to: '', shop: '', org: '', lim: 100};
const opTrOk = t => (!opTF.st || t.st === opTF.st) && (!opTF.type || t.type === opTF.type) && (!opTF.from || t.at.slice(0, 10) >= opTF.from) && (!opTF.to || t.at.slice(0, 10) <= opTF.to) && (!opTF.shop || t.b.shop === opTF.shop) && (!opTF.org || t.b.org === opTF.org);
PAGES.transactions = () => {
  const L = opTrans().filter(opTrOk), sum = L.reduce((a, t) => a + (t.st === 'Успех' ? (t.type === 'Возврат' ? -t.sum : t.sum) : 0), 0);
  const f = k => `onchange="opTF.${k}=this.value;opTF.lim=100;render()"`;
  return ph('Транзакции', `Всего ${nf(L.length)} ${plural(L.length, 'транзакция', 'транзакции', 'транзакций')}, итог ${rub(sum)} (приход минус возвраты). Каждая попытка оплаты и каждый возврат по счёту`, '<button class="btn" onclick="opTrCsv()">⇩ Экспортировать</button>')
  + (can('system') ? '' : noPerm('system'))
  + `<div class="filters"><select class="inp" style="width:auto" ${f('st')}>${opOpt([['', 'Любой статус'], ['Успех', 'Успех'], ['Отмена', 'Отмена']], opTF.st)}</select>
    <select class="inp" style="width:auto" ${f('type')}>${opOpt([['', 'Любой тип'], ['Приход', 'Приход'], ['Возврат', 'Возврат']], opTF.type)}</select>
    <span class="op-dl"><input class="inp" type="date" value="${opTF.from}" aria-label="С" ${f('from')}>—<input class="inp" type="date" value="${opTF.to}" aria-label="По" ${f('to')}></span>
    <select class="inp" style="width:auto" ${f('shop')}>${opOpt([['', 'Все точки'], ...DB.shops.map(s => [s.n, s.n])], opTF.shop)}</select>
    <select class="inp" style="width:auto" ${f('org')}>${opOpt([['', 'Все организации'], ...opOrgs().map(o => [o, o])], opTF.org)}</select></div>
  <div class="tw"><table><thead><tr><th>№</th><th>Статус</th><th>Тип</th><th class="r">Сумма</th><th>Создана</th><th>Исполнена</th><th>Счёт</th><th>Номер телефона</th><th>Карта</th></tr></thead><tbody>
  ${L.slice(0, opTF.lim).map(t => `<tr><td>${t.id}</td><td>${t.st === 'Успех' ? '<span class="pill ok">Успех</span>' : '<span class="pill red">Отмена</span>'}</td><td>${t.type === 'Возврат' ? '<span class="pill blue">Возврат</span>' : 'Приход'}</td><td class="r nowrap">${t.type === 'Возврат' ? '−' : ''}${rub(t.sum)}</td>
    <td class="nowrap small">${dShort(t.at)} ${t.at.slice(11, 16)}</td><td class="nowrap small">${t.done ? `${dShort(t.done)} ${t.done.slice(11, 16)}` : '—'}</td><td><a href="javascript:void 0" onclick="opBill('${t.b.id}')">${t.b.id}</a></td><td class="nowrap small">${esc(t.b.ph)}</td><td class="nowrap small">${esc(t.b.card)}</td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Транзакций нет</div>'}</div>
  ${L.length > opTF.lim ? `<div class="btns" style="margin-top:10px"><button class="btn" onclick="opTF.lim+=200;render()">Показать ещё</button><span class="small muted">показано ${nf(opTF.lim)} из ${nf(L.length)}</span></div>` : ''}`;
};
function opTrCsv() {
  const L = opTrans().filter(opTrOk);
  opCsv(`tranzakcii-${isoDay()}.csv`, ['№', 'Статус', 'Тип', 'Сумма', 'Создана', 'Исполнена', 'Счёт', 'Точка', 'Организация', 'Телефон', 'Карта'], L.map(t => [t.id, t.st, t.type, (t.type === 'Возврат' ? -1 : 1) * t.sum, t.at.replace('T', ' '), (t.done || '').replace('T', ' '), t.b.id, t.b.shop, t.b.org, t.b.ph, t.b.card]));
  audit('Экспорт транзакций', `${nf(L.length)} ${plural(L.length, 'транзакция', 'транзакции', 'транзакций')}`); save(); toast(`Выгрузил ${nf(L.length)} в CSV`);
}

/* ═════════ Чёрный список (§05) ═════════ */
let opBQ = '';
function opBlList() {
  const B = DB.ops2.bl;
  B.list = B.list.filter(e => { const g = DB.guests.find(x => opDig(x.ph) === e.d); return !g || g.blocked; });   /* разблокировали в карточке гостя — убираем и отсюда */
  const rows = B.list.map(e => ({...e, g: DB.guests.find(x => opDig(x.ph) === e.d)}));
  DB.guests.filter(g => g.blocked && !rows.some(r => r.d === opDig(g.ph))).forEach(g => { const a = DB.audit.find(x => x.g === g.id && x.what === 'Заблокировали');
    rows.push({d: opDig(g.ph), why: a ? a.detail : 'Из карточки гостя', at: a ? a.at : 0, by: a ? a.by : '—', g, card: 1}); });
  return rows.sort((a, b) => b.at - a.at);
}
PAGES.blacklist = () => {
  const B = DB.ops2.bl, ro = opRO('guests.block');
  if (!B.set) {
    const n = DB.guests.filter(g => g.blocked).length;
    return ph('Чёрный список', '', `<button class="btn" onclick="opBlHow()">❔ Как пользоваться</button>`) + (ro ? noPerm('guests.block') : '')
    + `<div class="card empty"><div style="font-size:40px">⛔</div><h2 style="color:var(--ink);margin:6px 0">Чёрный список ещё не настроен</h2><p>Сначала напишите, что увидит заблокированный гость при входе. Потом можно блокировать номера</p>
      ${n ? `<p class="small">Уже заблокировано в карточках гостей: <b>${n}</b> — появятся в списке после настройки</p>` : ''}<button class="btn pri" ${ro} onclick="opBlCfg()">Настроить</button></div>`;
  }
  const all = opBlList(), q = opDig(opBQ), ql = opBQ.toLowerCase(), L = all.filter(r => !opBQ || (q && r.d.includes(q)) || (r.g && gName(r.g).toLowerCase().includes(ql)));
  return ph('Чёрный список', `Номера, с которыми нельзя войти в приложение и на сайт. Гость увидит: «${esc(B.msg.t)}». ${all.length} ${plural(all.length, 'номер', 'номера', 'номеров')}`,
    `<button class="btn" onclick="opBlHow()">❔ Как пользоваться</button><button class="btn" ${ro} onclick="opBlCfg()">⚙️ Сообщение</button><button class="btn pri" ${ro} onclick="opBlAdd()">＋ Заблокировать номер</button>`)
  + (ro ? noPerm('guests.block') : '')
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Телефон или имя" value="${esc(opBQ)}" onchange="opBQ=this.value;render()"></div></div>
  <div class="tw"><table><thead><tr><th>Телефон</th><th>Гость</th><th>Причина</th><th>Кто</th><th>Когда</th><th></th></tr></thead><tbody>
  ${L.map(r => `<tr><td class="nowrap"><b>${opPhF(r.d)}</b></td><td>${r.g ? `<a href="#/guest/${r.g.id}">${esc(gName(r.g))}</a>` : '<span class="muted small">не гость приложения</span>'}</td><td class="small">${r.why}${r.card ? ' <span class="pill">из карточки</span>' : ''}</td>
    <td class="small">${esc(r.by)}</td><td class="nowrap small">${r.at ? tm(r.at) : '—'}</td><td><button class="btn sm" ${ro} onclick="opBlDel('${r.d}')">Убрать</button></td></tr>`).join('')}
  </tbody></table>${L.length ? '' : `<div class="empty">${all.length ? 'Никого не нашли' : 'Список пуст — никто не заблокирован'}</div>`}</div>`;
};
function opBlHow() {
  modal({t: 'Как пользоваться', body: `<ol style="margin:0;padding-left:20px;line-height:1.6"><li>Настройте сообщение: его увидит гость с заблокированным номером при входе</li><li>Добавьте номер и причину. Если это наш гость — он сразу выйдет из приложения, бонусы и акции для него остановятся</li><li>Заблокировать можно и из карточки гостя — номер появится здесь</li><li>«Убрать» — гость снова сможет войти по коду из СМС. Его покупки и бонусы сохранятся</li></ol>`, ok: '', cancel: 'Понятно'});
}
function opBlPv() {
  const m = {ph: val('opBp1'), mail: val('opBm'), t: val('opBt1') || 'Заголовок', d: val('opBd') || 'Описание', sch: val('opBs1')};
  const ct = m.ph || m.mail ? `<div class="ct">${m.ph ? `📞 ${esc(opPhF(m.ph))}<br>` : ''}${m.mail ? `✉️ ${esc(m.mail)}<br>` : ''}${m.sch ? `<span style="color:#888">${esc(m.sch)}</span>` : ''}</div>` : '<div class="ct e">Укажите контакты поддержки</div>';
  const e = $('#opBlPv'); if (e) e.innerHTML = `<div class="op-ph"><h4>${esc(m.t)}</h4><p>${esc(m.d)}</p>${ct}</div>`;
}
function opBlCfg() {
  const m = DB.ops2.bl.msg; opBlCfg._warned = 0;
  modal({t: 'Сообщение для заблокированных гостей', body: `<div class="op-ph-frame" id="opBlPv"></div>
    <b>Контакты поддержки</b><div class="row" style="margin-top:6px"><label class="fld"><span>Телефон</span><input class="inp" id="opBp1" inputmode="tel" placeholder="+7 (900) 000-00-00" value="${esc(m.ph)}" oninput="opBlPv()"></label><label class="fld"><span>Эл. почта</span><input class="inp" id="opBm" type="email" placeholder="help@kofeynaya.example" value="${esc(m.mail)}" oninput="opBlPv()"></label></div>
    <p class="small muted">Заблокированные гости увидят это сообщение, когда попробуют войти на сайте или в приложении</p>
    <label class="fld"><span>Заголовок *</span><input class="inp" id="opBt1" maxlength="40" value="${esc(m.t)}" oninput="opBlPv()"></label>
    <label class="fld"><span>Описание *</span><input class="inp" id="opBd" maxlength="140" value="${esc(m.d)}" oninput="opBlPv()"></label>
    <label class="fld"><span>График работы поддержки</span><input class="inp" id="opBs1" placeholder="Например: каждый день с 8:30 до 22:30" value="${esc(m.sch)}" oninput="opBlPv()"></label><div id="opBw"></div>`,
    ok: 'Сохранить', cancel: 'Отменить', onOk: () => {
      const n = {ph: val('opBp1') ? opPhF(val('opBp1')) : '', mail: val('opBm'), t: val('opBt1'), d: val('opBd'), sch: val('opBs1')};
      if (!n.t || !n.d) { toast('Заголовок и описание обязательны'); return false; }
      if (n.ph && opDig(n.ph).length !== 10) { toast('Проверьте телефон поддержки'); return false; }
      if (n.mail && !/^\S+@\S+\.\S+$/.test(n.mail)) { toast('Проверьте почту'); return false; }
      const w = typeof textCheck === 'function' ? textCheck(n.t, n.d) : [];
      if (w.length && !opBlCfg._warned) { opBlCfg._warned = 1; $('#opBw').innerHTML = `<div class="note">⚠️ <span>${w.map(esc).join('<br>')}<br>Нажмите «Сохранить» ещё раз, если всё верно</span></div>`; return false; }
      opBlCfg._warned = 0;
      const first = !DB.ops2.bl.set; DB.ops2.bl.msg = n; DB.ops2.bl.set = true;
      audit(first ? 'Настроили чёрный список' : 'Изменили сообщение для заблокированных', `«${esc(n.t)}» · ${esc(n.d)}`); save(); render(); toast(first ? 'Готово — теперь можно блокировать номера' : 'Сообщение сохранено');
    }});
  opBlPv();
}
function opBlAdd() {
  modal({t: 'Заблокировать номер', body: `<label class="fld"><span>Телефон</span><input class="inp" id="opBn" inputmode="tel" placeholder="+7 (900) 000-00-00" oninput="opBlWho()"><small id="opBwho">Только мобильные номера</small></label>
    ${reasonBox(['Обман с приглашениями', 'Обман с днём рождения', 'Чужая карта', 'Грубость с персоналом', 'Другое'])}`, ok: 'Заблокировать', cls: 'red', onOk: () => {
    const d = opDig(val('opBn'));
    if (d.length !== 10 || d[0] !== '9') { toast('Нужен мобильный номер: +7 (9XX) XXX-XX-XX'); return false; }
    if (opBlList().some(r => r.d === d)) { toast('Этот номер уже в чёрном списке'); return false; }
    const why = needReason(); if (!why) return false;
    const g = DB.guests.find(x => opDig(x.ph) === d);
    DB.ops2.bl.list.unshift({d, why: esc(why), at: Date.now(), by: ME().n});
    if (g) { g.blocked = true; audit('Заблокировали', esc(why) + ' · через чёрный список', {g: g.id}); } else audit('Чёрный список: добавили номер', `${opPhF(d)} · ${esc(why)}`);
    save(); render(); toast(g ? `${esc(gName(g))} заблокирован — сессии отозваны` : `Номер ${opPhF(d)} заблокирован`);
  }});
}
function opBlWho() { const d = opDig(val('opBn')), g = d.length === 10 && DB.guests.find(x => opDig(x.ph) === d), e = $('#opBwho'); if (e) e.innerHTML = g ? `Это гость <b>${esc(gName(g))}</b> (${g.id}) — бонусов ${nf(g.bon)}, депозит ${rub(g.dep)}. Деньги и бонусы останутся у него` : 'Только мобильные номера'; }
function opBlDel(d) {
  const g = DB.guests.find(x => opDig(x.ph) === d);
  modal({t: 'Убрать из чёрного списка?', body: `<p style="margin-top:0">${g ? esc(gName(g)) : opPhF(d)} снова сможет войти по коду из СМС</p>${reasonBox(['Разобрались', 'Ошибка', 'Другое'])}`, ok: 'Убрать', onOk: () => {
    const why = needReason(); if (!why) return false;
    DB.ops2.bl.list = DB.ops2.bl.list.filter(e => e.d !== d);
    if (g) { g.blocked = false; audit('Разблокировали', esc(why) + ' · из чёрного списка', {g: g.id}); } else audit('Чёрный список: убрали номер', `${opPhF(d)} · ${esc(why)}`);
    save(); render(); toast('Убрали из чёрного списка');
  }});
}

/* ═════════ Настройки проекта (§27) ═════════ */
PAGES.settings = () => {
  const c = DB.cfg2, ro = opRO('system');
  return ph('Настройки проекта', 'Общие настройки: вход в приложение, RFM, отзывы. Токены и ключи хранятся только на сервере')
  + (ro ? noPerm('system') : '')
  + `<div class="card" style="max-width:720px">
    <div class="op-sec"><h3>Вход для гостей</h3>
      <label class="tog" style="padding:6px 0"><span>Авторизация через VK ID</span>${sw('opVk', c.vk, ro)}</label>
      <label class="tog" style="padding:6px 0"><span>Авторизация через Яндекс ID</span>${sw('opYa', c.ya, ro)}</label>
      <p class="small muted" style="margin:4px 0 0">Вход по номеру и коду из СМС работает всегда</p></div>
    <div class="op-sec"><h3>Клиенты</h3><label class="fld" style="max-width:300px"><span>Срок активности клиента в RFM</span><div class="u-wrap"><input class="inp" id="opRfm" ${ro} inputmode="numeric" value="${c.rfmDays}"><i>дней</i></div>
      <small>Гость без покупок дольше этого срока — «неактивный» в сегментах и отчётах</small></label></div>
    <div class="op-sec"><h3>Отзывы и аналитика</h3>
      <label class="fld"><span>Ссылка сервиса для получения отзывов</span><input class="inp" id="opRev" ${ro} placeholder="https://…" value="${esc(c.reviewUrl)}"></label>
      <label class="fld"><span>Metabase Dashboard ID</span><input class="inp" id="opMb" ${ro} inputmode="numeric" value="${esc(c.metabase)}"></label></div>
    <div class="op-sec"><h3>Токены</h3><dl class="kv"><dt>Токен MapBox</dt><dd><span class="pill">🔒 хранится на сервере</span></dd><dt>Токен для Стартер Логиста</dt><dd><span class="pill">🔒 хранится на сервере</span></dd></dl>
      <p class="small muted" style="margin:6px 0 0">В панели токены не показываем и не вводим — их кладёт разработчик на сервер</p></div>
    <div class="btns" style="margin-top:8px"><button class="btn" onclick="render()">Отменить</button><button class="btn pri" ${ro} onclick="opCfgSave()">Сохранить</button></div></div>`;
};
function opCfgSave() {
  if (!can('system')) return;
  const c = DB.cfg2, rfm = parseInt(val('opRfm'), 10), url = val('opRev');
  if (!rfm || rfm < 7 || rfm > 730) { toast('Срок активности — от 7 до 730 дней'); return; }
  if (url && !/^https:\/\/\S+\.\S+/.test(url)) { toast('Ссылка должна начинаться с https://'); return; }
  const n = {vk: val('opVk'), ya: val('opYa'), rfmDays: rfm, reviewUrl: url, metabase: val('opMb')};
  const L = {vk: 'VK ID', ya: 'Яндекс ID', rfmDays: 'срок активности RFM', reviewUrl: 'ссылка отзывов', metabase: 'Metabase'};
  const ch = Object.keys(n).filter(k => c[k] !== n[k]).map(k => `${L[k]} ${opDiff(typeof c[k] === 'boolean' ? (c[k] ? 'вкл' : 'выкл') : c[k] || '—', typeof n[k] === 'boolean' ? (n[k] ? 'вкл' : 'выкл') : n[k] || '—')}`);
  if (!ch.length) { toast('Ничего не изменилось'); return; }
  Object.assign(c, n); audit('Настройки проекта', ch.join(' · ')); save(); render(); toast('Сохранено ✓');
}

/* ═════════ Тикеты (§28) — обращения сети к поставщику и разработчикам ═════════ */
const TK_ST = ['Новый', 'В работе', 'Передано в разработку', 'Ждёт ответа сети', 'Решён', 'Закрыт'];
const TK_TYPE = ['Задача 2 линии', 'Bug', 'Идея'], TK_PR = ['Низкий', 'Средний', 'Высокий'];
const tkOpen = t => !['Решён', 'Закрыт'].includes(t.st);
let opTk = {v: 'act', q: '', st: '', type: ''};
PAGES.tickets = () => {
  const T = DB.ops2.tk, ro = opRO('system'), act = T.filter(tkOpen).length;
  const L = T.filter(t => (opTk.v === 'all' || (opTk.v === 'act') === tkOpen(t)) && (!opTk.st || t.st === opTk.st) && (!opTk.type || t.type === opTk.type)
    && (!opTk.q || String(t.id).includes(opTk.q) || t.t.toLowerCase().includes(opTk.q.toLowerCase()))).sort((a, b) => b.id - a.id);
  const prP = p => `<span class="pill ${p === 'Высокий' ? 'red' : p === 'Средний' ? 'amb' : ''}">${p}</span>`;
  return ph('Тикеты', 'Обращения сети к поставщику приложения и разработчикам: ошибки, задачи, идеи. Обращения гостей — в <a href="#/support">«Поддержке»</a>',
    `<button class="btn" onclick="opTkChat()">💬 Чат с поддержкой</button>${ro ? '' : '<button class="btn pri" onclick="opTkNew()">＋ Создать тикет</button>'}`)
  + (ro ? noPerm('system') : '')
  + `<div class="filters"><select class="inp" style="width:auto;font-weight:600" onchange="opTk.v=this.value;render()">${opOpt([['act', `Активные · ${act}`], ['done', `Закрытые · ${T.length - act}`], ['all', `Все · ${T.length}`]], opTk.v)}</select>
    <div class="search">${SEARCH_SVG}<input class="inp" placeholder="Номер или название" value="${esc(opTk.q)}" onchange="opTk.q=this.value;render()"></div>
    <select class="inp" style="width:auto" onchange="opTk.st=this.value;render()">${opOpt([['', 'Любой статус'], ...TK_ST.map(x => [x, x])], opTk.st)}</select>
    <select class="inp" style="width:auto" onchange="opTk.type=this.value;render()">${opOpt([['', 'Любой тип'], ...TK_TYPE.map(x => [x, x])], opTk.type)}</select></div>
  <div class="tw"><table><thead><tr><th>Номер</th><th>Тип тикета</th><th>Название</th><th>Статус</th><th>Приоритет</th><th>Дата создания</th><th>Заметка</th></tr></thead><tbody>
  ${L.map(t => `<tr class="click" onclick="opTkOpen(${t.id})"><td>#${t.id}</td><td class="nowrap"><span class="pill ${t.type === 'Bug' ? 'red' : t.type === 'Идея' ? 'blue' : ''}">${t.type}</span></td><td><b>${esc(t.t)}</b></td>
    <td class="nowrap"><span class="pill ${tkOpen(t) ? 'amb' : 'ok'}">${t.st}</span></td><td>${prP(t.pr)}</td><td class="nowrap small">${dLong(t.at)}</td><td class="small muted">${esc(t.note) || '—'}</td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Тикетов нет</div>'}</div>`;
};
function opTkChat() { modal({t: 'Чат с поддержкой поставщика', body: '<p style="margin-top:0">Срочные вопросы — в чате поддержки Starter в Telegram. Ссылку на чат даёт менеджер поставщика; всё, что требует доработки, оформляйте тикетом — так ничего не потеряется</p>', ok: '', cancel: 'Понятно'}); }
function opTkNew() {
  modal({t: 'Новый тикет', body: `<div class="row"><label class="fld"><span>Тип</span><select class="inp" id="opTt">${opOpt(TK_TYPE.map(x => [x, x]), 'Bug')}</select></label><label class="fld"><span>Приоритет</span><select class="inp" id="opTp">${opOpt(TK_PR.map(x => [x, x]), 'Средний')}</select></label></div>
    <label class="fld"><span>Название</span><input class="inp" id="opTn" maxlength="120" placeholder="Коротко: что не так"></label>
    <label class="fld"><span>Описание</span><textarea class="inp" id="opTd" placeholder="Где это было, что нажимали, что ожидали и что получили. Номер заказа, если есть"></textarea></label>`,
    ok: 'Создать тикет', onOk: () => {
      const t = {id: Math.max(4500, ...DB.ops2.tk.map(x => x.id)) + 1, type: val('opTt'), pr: val('opTp'), t: val('opTn'), d: val('opTd'), st: 'Новый', at: isoDay(), note: '', log: [{at: Date.now(), by: ME().n, t: 'Создан'}]};
      if (t.t.length < 5) { toast('Напишите название — хотя бы пару слов'); return false; }
      if (t.d.length < 10) { toast('Опишите подробнее: где и что случилось'); return false; }
      DB.ops2.tk.push(t); audit('Создали тикет', `#${t.id} · ${t.type} · ${esc(t.t)}`); save(); render(); toast(`Тикет #${t.id} создан`);
    }});
}
function opTkOpen(id) {
  const t = DB.ops2.tk.find(x => x.id === id), ro = can('system') ? '' : 'disabled';
  modal({t: `#${t.id} · ${esc(t.t)}`, wide: 1, body: `<p class="small muted" style="margin-top:0">${t.type} · создан ${dLong(t.at)}</p><p>${esc(t.d) || '<span class="muted">Без описания</span>'}</p>
    <div class="row"><label class="fld"><span>Статус</span><select class="inp" id="opTs" ${ro}>${opOpt(TK_ST.map(x => [x, x]), t.st)}</select></label><label class="fld"><span>Приоритет</span><select class="inp" id="opTp2" ${ro}>${opOpt(TK_PR.map(x => [x, x]), t.pr)}</select></label></div>
    <label class="fld"><span>Заметка — видна в списке</span><textarea class="inp" id="opTnote" ${ro} maxlength="200">${esc(t.note)}</textarea></label>
    ${(t.log || []).length ? `<div class="log">${t.log.slice().reverse().map(e => `<div class="e"><div class="w">${tm(e.at)}<br>${esc(e.by)}</div><div>${e.t}</div></div>`).join('')}</div>` : ''}`,
    ok: ro ? '' : 'Сохранить', cancel: 'Закрыть', onOk: () => {
      const n = {st: val('opTs'), pr: val('opTp2'), note: val('opTnote')}, ch = [];
      if (n.st !== t.st) ch.push('статус ' + opDiff(t.st, n.st)); if (n.pr !== t.pr) ch.push('приоритет ' + opDiff(t.pr, n.pr)); if (n.note !== t.note) ch.push('заметка');
      if (!ch.length) return;
      Object.assign(t, n); t.log = t.log || []; t.log.push({at: Date.now(), by: ME().n, t: ch.join(' · ')});
      audit('Тикет #' + t.id, ch.join(' · ')); save(); render(); toast('Тикет обновлён');
    }});
}
