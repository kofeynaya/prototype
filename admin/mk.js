/* Бэк-офис — раздел «Маркетинг» как в Starter CRM: рассылки, отзывы, акции и промокоды, массовые промокоды,
   реферальная программа, сторис, внешний маркетинг, маркетинговые источники. Свои данные — только в DB.mk */
'use strict';

document.head.insertAdjacentHTML('beforeend', `<style>
.mk-chips{display:flex;gap:6px;flex-wrap:wrap}
.mk-chip{border:1px solid var(--line2);background:var(--surface);border-radius:20px;padding:5px 12px;font-size:13px;cursor:pointer;white-space:nowrap;color:var(--ink)}
.mk-chip.on{background:var(--acc);border-color:var(--acc);color:var(--acc-ink)}
.mk-chip b{font-weight:600;opacity:.75;margin-left:4px}
.mk-chip:disabled{opacity:.45;cursor:not-allowed}
.mk-tc{display:inline-block;margin-left:6px;font-size:11.5px;padding:0 7px;border-radius:10px;background:var(--surface2);color:var(--muted)}
.tabs button.on .mk-tc{background:var(--acc-soft);color:var(--acc)}
.mk-ttl{max-width:320px;min-width:200px}
.mk-ttl b{display:block;font-weight:500}
.mk-ttl span{display:block;color:var(--muted);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.mk-head{display:flex;gap:18px;flex-wrap:wrap;align-items:center;border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--surface2);margin-bottom:12px}
.mk-head div span{display:block;font-size:12px;color:var(--muted)}
.mk-head div b{font-weight:600}
.mk-head p{flex:1;min-width:200px;margin:0;font-size:12.5px;color:var(--muted)}
.mk-2{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:18px;align-items:start}
.mk-tpls{display:flex;flex-direction:column;gap:6px;max-height:260px;overflow:auto;margin-bottom:12px}
.mk-tpl{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;text-align:left;border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:8px 10px;cursor:pointer;font-size:13px;color:var(--ink)}
.mk-tpl.on{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc-soft)}
.mk-tpl i{font-style:normal;width:34px;height:34px;border-radius:9px;background:#f2c230;display:grid;place-items:center;font-size:17px}
.mk-tpl b{display:block;font-weight:600}
.mk-vars{display:flex;gap:6px;flex-wrap:wrap;margin:-4px 0 12px}
.mk-vars button{border:1px dashed var(--line2);background:var(--surface2);border-radius:7px;padding:3px 8px;font:12px ui-monospace,Menlo,monospace;cursor:pointer;color:var(--ink)}
.mk-stars{color:#f2a900;letter-spacing:1px;white-space:nowrap}
.mk-stars s{color:var(--line2);text-decoration:none}
.mk-tag{display:inline-block;font-size:11.5px;border-radius:12px;padding:1px 8px;margin:1px 2px 1px 0;background:var(--surface2);border:1px solid var(--line);white-space:nowrap}
.mk-tag.neg{background:var(--red-soft);border-color:transparent;color:var(--red)}
.mk-tag.pos{background:var(--acc-soft);border-color:transparent;color:var(--acc)}
.mk-addtag{border:0;background:none;color:var(--acc);cursor:pointer;font-size:12px;padding:1px 4px}
.mk-st{border:1px solid var(--line2);border-radius:8px;padding:3px 6px;font-size:12.5px;background:var(--surface)}
.mk-dd{position:relative}
.mk-dd>summary{list-style:none;cursor:pointer}
.mk-dd>summary::-webkit-details-marker{display:none}
.mk-dd .mk-pop{position:absolute;z-index:30;top:calc(100% + 4px);left:0;min-width:230px;max-height:300px;overflow:auto;background:var(--surface);border:1px solid var(--line2);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.15);padding:8px}
.mk-dd.r .mk-pop{left:auto;right:0}
.mk-pop .chk{padding:4px 2px;font-size:13px}
.mk-pop button.it{display:block;width:100%;text-align:left;border:0;background:none;padding:7px 9px;border-radius:7px;cursor:pointer;font-size:13.5px;color:var(--ink)}
.mk-pop button.it:hover{background:var(--surface2)}
.mk-dots{border:1px solid var(--line2);background:var(--surface);border-radius:8px;width:32px;height:30px;display:grid;place-items:center;font-weight:700}
/* большое окно акции */
.mk-ov{position:fixed;inset:0;background:rgba(10,16,13,.45);z-index:50;display:flex;justify-content:center;align-items:center;padding:16px}
.mk-win{background:var(--surface);border-radius:16px;width:min(1000px,100%);height:min(760px,94vh);display:grid;grid-template-rows:auto minmax(0,1fr) auto;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
.mk-wh{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line)}
.mk-wh>div{flex:1;min-width:0}
.mk-wh h2{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mk-wh code{font:11.5px ui-monospace,Menlo,monospace;color:var(--muted)}
.mk-wm{display:grid;grid-template-columns:200px minmax(0,1fr);min-height:0}
.mk-nav{border-right:1px solid var(--line);padding:10px;display:flex;flex-direction:column;gap:2px;background:var(--surface2);overflow:auto}
.mk-nav button{border:0;background:none;text-align:left;padding:9px 11px;border-radius:9px;cursor:pointer;font-size:14px;color:var(--ink);display:flex;gap:8px;align-items:center;white-space:nowrap}
.mk-nav button.on{background:var(--surface);box-shadow:var(--sh);font-weight:600}
.mk-nav button:disabled{opacity:.4;cursor:not-allowed}
.mk-nav .sp{flex:1}
.mk-wb{overflow:auto;padding:16px 18px 30px;background:var(--bg)}
.mk-wb .card{padding:16px}
.mk-wb .card h3{margin-bottom:10px}
.mk-wf{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 18px;border-top:1px solid var(--line)}
.mk-wf .sp{flex:1}
.mk-req::after{content:" *";color:var(--red)}
.mk-opt{display:flex;flex-direction:column;gap:8px}
.mk-opt label{display:flex;gap:9px;align-items:flex-start;cursor:pointer;font-size:13.5px}
.mk-opt input{margin-top:3px;accent-color:var(--acc2);width:16px;height:16px;flex:none}
.mk-opt small{display:block;color:var(--muted);font-size:12px}
.mk-days{display:flex;gap:6px;flex-wrap:wrap}
.mk-days button{width:42px;height:36px;border-radius:9px;border:1px solid var(--line2);background:var(--surface);cursor:pointer;color:var(--ink)}
.mk-days button.on{background:var(--acc);border-color:var(--acc);color:var(--acc-ink)}
.mk-items{max-height:240px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:4px 8px;background:var(--surface)}
.mk-items label{display:flex;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line);font-size:13px;cursor:pointer}
.mk-items label:last-child{border-bottom:0}
.mk-items img{width:30px;height:30px;border-radius:6px;object-fit:cover;flex:none;background:var(--surface2)}
.mk-items input{accent-color:var(--acc2);flex:none}
.mk-codes{font:12.5px ui-monospace,Menlo,monospace;display:flex;gap:6px;flex-wrap:wrap}
.mk-codes span{background:var(--surface2);border:1px solid var(--line);border-radius:6px;padding:2px 7px}
.mk-goal{display:flex;gap:8px;align-items:center;margin-top:10px}
.mk-goal i{width:26px;height:26px;border-radius:50%;border:2px dashed var(--line2);display:grid;place-items:center;font-style:normal;font-size:13px}
.mk-goal i.on{background:var(--acc2);border:0;color:#fff}
/* сторис */
.mk-sthumb{width:40px;height:62px;border-radius:7px;object-fit:cover;background:var(--surface2);flex:none;border:1px solid var(--line)}
.mk-slides{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.mk-slide{border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--surface);cursor:pointer}
.mk-slide.on{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc-soft)}
.mk-slide .pic{aspect-ratio:9/16;border-radius:9px;background:var(--surface2) center/cover no-repeat;position:relative;display:flex;align-items:flex-end;justify-content:center;padding:8px}
.mk-slide .pic em{font-style:normal;font-size:11px;background:#fff;color:#111;border-radius:14px;padding:4px 9px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mk-slide .n{position:absolute;top:6px;left:6px;background:rgba(0,0,0,.55);color:#fff;border-radius:10px;font-size:11px;padding:0 7px}
.mk-slide .btns{margin-top:6px;justify-content:center}
.mk-ph9{width:220px;max-width:100%;aspect-ratio:9/16;border-radius:22px;background:#172f28 center/cover no-repeat;position:relative;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.2)}
.mk-ph9 .bars{position:absolute;top:8px;left:8px;right:8px;display:flex;gap:3px}
.mk-ph9 .bars i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.4)}
.mk-ph9 .bars i.on{background:#fff}
.mk-ph9 .cta{position:absolute;left:14px;right:14px;bottom:16px;background:#fff;color:#111;border-radius:22px;text-align:center;padding:10px;font-weight:600;font-size:13px}
/* внешний маркетинг, источники */
.mk-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.mk-pick label{border:1px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer;background:var(--surface);display:flex;gap:10px;align-items:flex-start}
.mk-pick label.on{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc-soft)}
.mk-pick input{accent-color:var(--acc2);margin-top:3px;flex:none}
.mk-pick b{display:block}
.mk-pick small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
.mk-tree td:first-child{min-width:230px}
.mk-tree button.tg{border:0;background:none;cursor:pointer;width:22px;color:var(--muted);padding:0}
.mk-tree tr.lv0 td{font-weight:600}
.mk-tree tr.tot td{font-weight:700;background:var(--surface2)}
.mk-dl{font-size:11.5px;margin-left:4px}
.mk-dl.up{color:var(--acc)} .mk-dl.dn{color:var(--red)}
.mk-qa{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--surface);margin-bottom:10px}
.mk-wb .seg{display:flex;max-width:100%}.mk-wb .seg button{flex:1 1 auto}
.mk-sg{grid-template-columns:minmax(0,1fr) 230px}
.mk-2>div:last-child{position:sticky;top:0}
.mk-md{width:min(940px,100%);display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.mk-md>.md-b{overflow:auto;padding-top:4px}
.mk-md>.md-f{border-top:1px solid var(--line);padding-top:12px;margin:0}
.mk-tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start}
.mk-st-row{border-top:1px solid var(--line);padding:12px 0}
.mk-st-row:first-child{border-top:0}
.mk-back{display:inline-flex;gap:6px;align-items:center;font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);text-decoration:none;margin-bottom:8px}
@media (max-width:860px){
  .mk-2,.mk-sg{grid-template-columns:1fr}
  .mk-2>div:last-child{position:static}
  .mk-tt>*{flex:1 1 100%}
  .ov.c:has(>.mk-md){padding:0}
  .ov.c>.mk-md{height:100%;max-height:none;border-radius:0}
  .mk-sg .mk-ph9{margin:0 auto}
  .mk-ov{padding:0}
  .mk-win{height:100%;border-radius:0}
  .mk-wm{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
  .mk-nav{flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--line);padding:6px 8px;scrollbar-width:none}
  .mk-nav .sp{display:none}
  .mk-nav button{padding:7px 11px;font-size:13px}
  .mk-wb{padding:12px 12px 24px}
  .mk-wf{padding:10px 12px}
  .mk-wf .btn{padding:7px 10px}
}
</style>`);

/* ───────── общее ───────── */
const mkH = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } h ^= h >>> 13; h = Math.imul(h, 2246822507) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
const mkNow = () => Date.now();
const mkDT = ts => { const d = new Date(ts); return `${dShort(isoDay(d))}.${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const mkStrip = s => String(s ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const mkPush = g => 'push' in g ? g.push !== false : mkH('push' + g.id) % 100 < 31;
const mkDis = ok => ok ? '' : 'disabled';
const mkDiff = (a, b) => `<span class="diff"><s>${esc(a)}</s> → <ins>${esc(b)}</ins></span>`;
const mkStars = n => `<span class="mk-stars" title="${n} из 5">${'★'.repeat(n)}<s>${'★'.repeat(5 - n)}</s></span>`;
function mkCSV(name, head, rows) {
  const q = c => '"' + mkStrip(c).replace(/"/g, '""') + '"';
  const txt = '﻿' + [head, ...rows].map(r => r.map(q).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type:'text/csv;charset=utf-8'}));
  a.download = name + '-' + isoDay() + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast(`Выгрузил ${nf(rows.length)} ${plural(rows.length, 'строку', 'строки', 'строк')} в CSV`);
}
/* поиск без потери фокуса: перерисовать страницу и вернуть курсор в поле */
function mkRefocus(id) {
  clearTimeout(window._mkT);
  window._mkT = setTimeout(() => { render(); const i = document.getElementById(id); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 220);
}
const mkSearch = (id, v, set, ph_) => `<div class="search">${SEARCH_SVG}<input class="inp" id="${id}" placeholder="${esc(ph_)}" value="${esc(v)}" oninput="${set}=this.value;mkRefocus('${id}')"></div>`;
const mkTabs = (list, cur, fn) => `<div class="tabs">${list.map(([k, t, n]) => `<button class="${cur === k ? 'on' : ''}" onclick="${fn}('${k}')">${t}${n != null ? `<span class="mk-tc">${n}</span>` : ''}</button>`).join('')}</div>`;
const mkTrans = s => { const m = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
  return String(s).toLowerCase().split('').map(c => c in m ? m[c] : c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'story'; };
/* свои окна (акция, рассылка, сторис) с вопросом «Сохранить изменения?», как в Starter.
   Помечены data-guard — общий обработчик Esc/клика мимо из app.js их пропускает, закрытие решает mkClose() */
const MK_G = {};
function mkWin(html, id, o = {}) {
  let el = document.getElementById(id);
  if (el) { const b = el.firstElementChild, sc = b.querySelector('[data-scroll]') || b, y = sc.scrollTop; b.innerHTML = html; (b.querySelector('[data-scroll]') || b).scrollTop = y; return el; }
  el = document.createElement('div'); el.className = o.ov || 'mk-ov'; el.dataset.modal = 1; el.dataset.guard = 1; el.id = id;
  el.innerHTML = `<div class="${o.box || 'mk-win'}">${html}</div>`;
  el.addEventListener('mousedown', e => { if (e.target === el) mkClose(id); });
  $('#layer').appendChild(el); return el;
}
function mkGuard(id, dirty, save_, txt) { MK_G[id] = {dirty, save:save_, txt}; }
function mkWinRemove(id) { const e = document.getElementById(id); if (e) e.remove(); delete MK_G[id]; }
function mkClose(id) {
  const g = MK_G[id];
  if (!g || !g.dirty()) { mkWinRemove(id); return; }
  askSave(g.save, () => mkWinRemove(id), g.txt || 'Вы что-то поменяли и не сохранили');
}
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return; const m = [...document.querySelectorAll('[data-modal]')].pop();
  if (m && m.dataset.guard && m.id in MK_G) { e.stopImmediatePropagation(); e.preventDefault(); mkClose(m.id); }
}, true);
addEventListener('beforeunload', e => { if (Object.values(MK_G).some(g => g.dirty()) || (typeof mkTD !== 'undefined' && mkTDirty())) { e.preventDefault(); e.returnValue = ''; } });

/* ───────── данные раздела ───────── */
const MK_TOPICS = [
  ['Выходные', '🛋️', [['☀️ Выходные без будильника', 'Приходи на завтрак к 9:00 — сырники и капучино уже ждут'], ['🥐 Суббота — день круассана', '{{ username }}, загляни сегодня: свежая выпечка с самого утра']]],
  ['Извинения', '🙏', [['Прости, что так вышло', 'Вчера заказ задержался. Мы уже разобрались — в следующий раз всё будет вовремя'], ['Мы ошиблись 😔', '{{ username }}, исправили ошибку в заказе. Спасибо, что сказал нам']]],
  ['Изменение времени', '🕒', [['🕒 Новые часы работы', 'С понедельника открываемся в 7:30 — успеешь на кофе до работы'], ['Сегодня закроемся раньше', 'Кофейная 2 работает до 20:00. Остальные — как обычно']]],
  ['Любимое блюдо', '❤️', [['{{ favorite_dish }} ждёт тебя', 'Заглядывай — приготовим как ты любишь'], ['Соскучился по {{ favorite_dish }}?', 'Закажи в приложении — заберёшь без очереди']]],
  ['Новости', '📰', [['☕ Открыли Кофейную 8', 'Новая кофейня на ул. Ленина, 12 — приходи знакомиться'], ['Новое осеннее меню 🍂', 'Тыквенный латте и пирог с яблоком уже в меню']]],
  ['Обратная связь', '💬', [['Как тебе у нас?', 'Оцени последний заказ — это займёт 10 секунд'], ['{{ username }}, нужен твой совет', 'Расскажи, что сделать лучше — читаем каждое сообщение']]],
  ['Ответ на отзыв', '⭐', [['Спасибо за отзыв 💛', 'Передали команде — очень приятно'], ['Мы прочитали твой отзыв', 'Уже исправляем. Напиши в поддержку, если что-то ещё не так']]],
  ['Погода', '🌧️', [['🌧️ Дождь — повод для какао', 'Согрейся: горячие напитки в приложении без очереди'], ['☀️ Жара — время айс-латте', 'Холодные напитки уже в меню']]],
  ['Подарки', '🎁', [['🎁 Тебе подарок', 'Один напиток на выбор −30% — забери до воскресенья'], ['Подари другу кофе', 'Отправь латте по номеру телефона — он заберёт в любой кофейной']]],
  ['Праздник', '🎉', [['🎂 С днём рождения!', 'Скидка в день рождения уже работает — до {{ birth_date }}'], ['🎉 С праздником!', 'Сегодня в каждой кофейной — десерт дня −30%']]],
  ['Сгорание баллов', '🔥', [['🔥 Посещения могут сгореть', 'Приходи сегодня или завтра — и счётчик сохранится'], ['У тебя {{ balance }} бонусов', 'Ими можно оплатить до 30% заказа — загляни в меню']]],
  ['Скидки и акции', '%', [['−20% на выпечку вечером', 'Каждый день с 21:00 до 23:00 — круассаны и десерты дешевле'], ['Промокод FIRST15', 'Скидка 15% на первый заказ в приложении'], ['★ Цены недели обновились', 'Персональные цены на то, что ты любишь — держатся всю неделю']]],
];
const MK_TIC = Object.fromEntries(MK_TOPICS.map(t => [t[0], t[1]]));
const MK_VARS = [['{{ username }}', 10, 'Аня'], ['{{ balance }}', 5, '2 048'], ['{{ favorite_dish }}', 15, 'Капучино'], ['{{ birth_date }}', 5, '11.04']];
const mkLen = s => MK_VARS.reduce((a, [v, n]) => a.split(v).join('x'.repeat(n)), s || '').length;
const mkVarPrev = s => MK_VARS.reduce((a, [v, , x]) => a.split(v).join(x), s || '');
const FB_TAGS = [['Быстрая доставка', 1], ['Долгая доставка', 0], ['Инородное тело', 0], ['Неполный заказ', 0], ['Опоздание', 0], ['Плохая упаковка', 0], ['Плохое качество', 0], ['Плохой сервис', 0], ['Проблема с сайтом/приложением', 0], ['Хорошее качество', 1], ['Хороший сервис', 1]];
const FB_POS = Object.fromEntries(FB_TAGS);

function mkD() {
  if (DB.mk && DB.mk.v === 1) return DB.mk;
  const day = 864e5, now = mkNow(), act = DB.guests.filter(g => !g.blocked);
  const segIds = sid => { const s = (DB.segments || []).find(x => x.id === sid); return (s ? segMatch(s.c) : act).filter(mkPush).map(g => g.id); };
  const allIds = () => act.filter(mkPush).map(g => g.id);
  const M = (id, topic, ti, d, h, aud, seg) => { const tp = MK_TOPICS.find(t => t[0] === topic), [t, b] = tp[2][ti];
    const at = new Date(now + d * day); at.setHours(h, d > 0 ? 0 : 10, 0, 0);
    const ids = aud === 'seg' ? segIds(seg) : allIds();
    return {id, topic, t:nbspFix(t), b:nbspFix(b), link: LINKS[topic === 'Скидки и акции' ? 1 : 0], st: d > 0 ? 'plan' : 'sent', at:+at, aud:{k:aud, seg}, ids, n:ids.length, by: d % 2 ? 'Дарья Ким' : 'Владелец'}; };
  const mails = [
    M(101, 'Новости', 1, -41, 11, 'all'), M(102, 'Скидки и акции', 0, -36, 18, 'all'), M(103, 'Сгорание баллов', 0, -30, 12, 'seg', 's1'),
    M(104, 'Погода', 0, -26, 10, 'all'), M(105, 'Любимое блюдо', 0, -21, 15, 'seg', 's2'), M(106, 'Праздник', 0, -17, 10, 'seg', 's3'),
    M(107, 'Выходные', 1, -12, 9, 'all'), M(108, 'Скидки и акции', 2, -8, 11, 'seg', 's4'), M(109, 'Обратная связь', 0, -5, 16, 'all'),
    M(110, 'Сгорание баллов', 1, -2, 13, 'seg', 's1'), M(111, 'Выходные', 0, 1, 9, 'all'), M(112, 'Подарки', 1, 3, 12, 'seg', 's4'),
  ];
  /* отзывы — по настоящим заказам */
  const C5 = ['Очень вкусный капучино, спасибо!', 'Быстро и вежливо', 'Круассан свежий, как всегда', 'Любимая кофейня ❤️', '', 'Бариста — молодцы', 'Сырники лучшие в городе', ''];
  const C4 = ['Вкусно, но долго ждали', 'Всё хорошо, только кофе чуть остыл', 'Хорошо, но мало сиропа'];
  const C3 = ['Нормально, но раньше было вкуснее', 'Забыли сироп', 'Долго собирали заказ'];
  const C2 = ['Долго везли, всё остыло', 'Не положили десерт', 'Помялась упаковка'];
  const C1 = ['Заказ привезли через полтора часа', 'Приложение не дало списать бонусы', 'В салате был волос'];
  const POS = ['Быстрая доставка', 'Хорошее качество', 'Хороший сервис'], NEG = ['Долгая доставка', 'Неполный заказ', 'Опоздание', 'Плохая упаковка', 'Плохое качество', 'Плохой сервис', 'Проблема с сайтом/приложением', 'Инородное тело'];
  const feeds = DB.orders.filter(o => o.st !== 'Возврат' && mkH('fb' + o.id) % 100 < 22).slice(0, 42).map((o, i) => {
    const h = mkH('fbr' + o.id), r = h % 100 < 76 ? 5 : h % 100 < 88 ? 4 : h % 100 < 93 ? 3 : h % 100 < 97 ? 2 : 1;
    const pool = [, C1, C2, C3, C4, C5][r], tags = r >= 4 ? (h % 3 ? [POS[h % 3]] : []) : [NEG[h % NEG.length]].concat(r === 1 && h % 2 ? [NEG[(h >>> 4) % NEG.length]] : []);
    const at = new Date(o.at); at.setMinutes(at.getMinutes() + 35);
    return {id:'F-' + (3757 - i), g:o.g, o:o.id, shop:o.shop, ch:o.ch, at:+at, r, c:pool[(h >>> 5) % pool.length], tags:[...new Set(tags)], st: i > 6 && h % 4 ? 'Обработан' : 'Принят', reply: r <= 2 && i > 6 ? 'Прости, пожалуйста — так быть не должно. Вернули бонусами стоимость блюда' : ''};
  });
  /* акции */
  const bake = (DB.cats.find(c => /выпеч/i.test(c.name)) || DB.cats[0] || {}).id;
  const cro = (allItems().find(m => /круассан/i.test(m.n)) || {}).id || '';
  const P = (o) => mkPromoNew(o.kind, o);
  const codeGen = (pre, n, len, used) => Array.from({length:n}, (_, i) => ({c: pre + mkRand(len, 'm' + pre + i), st: i < used ? 'used' : i === n - 1 ? 'off' : 'active', used: i < used ? 1 : 0}));
  const promos = [
    P({kind:'disc', id:'pr1', n:'вечерняя скидка на выпечку', on:true, type:'pct', val:20, order:2, stop:true, uses:60, created: now - 120 * day, r:{time:{mode:'only', from:'', to:'', days:[], ints:[{f:'21:00', t:'23:00'}]}, menu:{mode:'only', cats: bake ? [bake] : [], items:[]}}}),
    P({kind:'disc', id:'pr2', n:'Скидка 20% от друга — неактуально', on:false, type:'pct', val:20, order:1, uses:387, special:{bd:false, ref:true}, lim:{firstOnly:true}, created: now - 400 * day}),
    P({kind:'code', id:'pr3', n:'Тест −99%', on:true, codeType:'single', code:'TEST99', type:'pct', val:99, uses:3, lim:{allOn:true, allN:10}, created: now - 90 * day}),
    P({kind:'code', id:'pr4', n:'Первый заказ в приложении −15%', on:true, codeType:'single', code:'FIRST15', type:'pct', val:15, uses:41, lim:{firstOnly:true}, place:'app', created: now - 200 * day}),
    P({kind:'code', id:'pr5', n:'Круассан в подарок', on:false, codeType:'single', code:'CROISSANT', type:'free', val:1, freeDish:cro, uses:18, minMode:'all', min:{all:500}, created: now - 300 * day}),
    P({kind:'code', id:'pr6', n:'Извинение за опоздание', on:false, codeType:'single', code:'SORRY300', type:'rub', val:300, uses:7, lim:{guestOn:true, guestN:1}, created: now - 250 * day}),
    P({kind:'code', id:'pr7', n:'День рождения −15%', on:false, codeType:'single', code:'BDAY15', type:'pct', val:15, uses:52, special:{bd:true, ref:false}, created: now - 330 * day}),
    P({kind:'code', id:'pr8', n:'Вернись за капучино −30%', on:true, codeType:'mass', type:'pct', val:30, uses:9, mass:{n:24, prefix:'BACK', len:6, codes:codeGen('BACK', 24, 6, 9)}, lim:{perCodeN:1, perActN:24}, created: now - 14 * day}),
  ];
  promos[0].hist = [{at: now - 120 * day, by:'Владелец', ev:'Создана', ch:''}, {at: now - 45 * day, by:'Ирина Гусева', ev:'Изменена', ch:mkDiff('Время: ежедневно 20:00–23:00', 'ежедневно 21:00–23:00')}];
  promos[1].hist = [{at: now - 400 * day, by:'Владелец', ev:'Создана', ch:''}, {at: now - 60 * day, by:'Владелец', ev:'Выключена', ch:mkDiff('Активная', 'Неактивная')}];
  /* сторис — из «Контента», не трогая его */
  const stories = ((DB.content || {}).stories || []).map((s, i) => ({id:'st' + (i + 1), t:s.t, place:'Сайт и приложение', st: s.on ? 'pub' : 'draft', at: now - (60 - i * 9) * day,
    slides:[{img:s.img, btn: s.cta ? {t:s.cta, link:'Меню'} : null}, {img:'img/bn' + ((i + 1) % 5 + 1) + '.jpg', btn:null}], seo:{slug:mkTrans(s.t), title:s.t, d:s.body || ''}}));
  stories.push({id:'st9', t:'Летнее меню', place:'Сайт и приложение', st:'arch', at: now - 140 * day, slides:[{img:'img/bn5.jpg', btn:{t:'Смотреть', link:'Меню'}}], seo:{slug:'letnee-menyu', title:'Летнее меню', d:'Холодные напитки и лёгкие салаты'}});
  DB.mk = {v:1, mails, feeds,
    feedCfg:{extra:{web:true, ios:true, android:true, link:'https://yandex.ru/maps/org/kofeynaya/', t:'Спасибо за пять звёзд!', d:'Поделись впечатлением на Яндекс Картах — это очень помогает нам', btn:'Оценить на Яндекс Картах'},
      ai:{all:'Обращаемся на «ты», по имени. Коротко, без канцелярита. Не обещаем то, чего не можем', pos:'Благодарим и зовём снова. Можно упомянуть блюдо из отзыва', neg:'Извиняемся без оправданий, говорим, что уже разбираемся, и зовём в поддержку в приложении'}},
    promos, ref:{on:false, cli:250, refl:250, min:500, firstPromo:'pr2', btn:true, msg:'Держи {{ referral_bonuses }} бонусов на первый заказ в Кофейной по моей ссылке {{ referral_link }} — а я возьму {{ favorite_dish }} 😉',
      rules:[{q:'Как применить промокод?', a:'Перейди по ссылке друга или введи промокод в корзине'}, {q:'Когда я получу бонусы?', a:'Когда друг купит в 3 разных дня — бонусы придут сразу'}, {q:'Что получит друг?', a:'1 000 бонусов на счёт после своих трёх покупок'}, {q:'Если друг уже заказывал?', a:'Не сработает: приглашение — только для нового номера'}, {q:'Сколько друзей можно пригласить?', a:'До 5 в месяц'}]},
    stories, ext:{k:'none', mbApi:'api.mindbox.ru', mb:{web:'kofeynaya.website', ios:'kofeynaya.ios', android:'kofeynaya.android', back:'kofeynaya.backend'}, own:{url:'https://api.kofeynaya.app/starter', ev:{cart:true, order:true, login:true, contact:false}}},
  };
  save(); return DB.mk;
}
function mkRand(len, seed) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = '', h = seed != null ? mkH(seed) : 0; for (let i = 0; i < len; i++) { h = seed != null ? mkH(h + ':' + i) : Math.random() * 4294967296 >>> 0; s += A[h % A.length]; } return s; }

/* ═════════ 1. РАССЫЛКИ ═════════ */
let mkMF = 'all', mkMQ = '';
const mkMailSt = m => m.st === 'plan' && m.at <= mkNow() ? 'sent' : m.st;
/* общий список: наши рассылки + пуши со страницы «Пуши» (DB.pushes, только чтение) */
function mkMailsAll() {
  const own = mkD().mails.map(m => ({...m, src:'mk'}));
  const ext = (DB.pushes || []).map(p => { const plan = p.later && new Date(p.later) > new Date();
    return {id:'p' + p.at, src:'push', topic: p.to ? 'Персональный пуш' : 'Пуш из бэк-офиса', t:p.t, b:p.b, link:p.link || '', st: plan ? 'plan' : 'sent', at: p.later ? +new Date(p.later) : p.at,
      aud: p.to ? {k:'one', g:p.to} : {k:'txt', txt:p.aud || ''}, ids: p.ids || (p.to ? [p.to] : []), n:p.n, by:p.by}; });
  return own.concat(ext).sort((a, b) => b.at - a.at);
}
const mkSegName = id => ((DB.segments || []).find(s => s.id === id) || {}).n || 'сегмент удалён';
function mkAudCell(m) {
  if (m.aud.k === 'one') return `<span class="small">Гость: <a href="#/guest/${m.aud.g}">${esc(gName(G(m.aud.g)))}</a></span>`;
  if (m.aud.k === 'seg') { const s = (DB.segments || []).find(x => x.id === m.aud.seg); return `<b class="small">${esc(mkSegName(m.aud.seg))}</b>${s ? `<div class="mk-chips" style="margin-top:4px">${s.c.map(x => `<span class="pill">${esc(segTxt([x]))}</span>`).join('')}</div>` : ''}`; }
  if (m.aud.k === 'txt') return `<span class="small">${esc(m.aud.txt || 'Вся база')}</span>`;
  return '<span class="small">Вся база</span>';
}
PAGES.mailings = () => {
  const D = mkD(), ok = can('push.send'), L = mkMailsAll();
  const F = {all:['Все', () => 1], plan:['Запланированные', m => mkMailSt(m) === 'plan'], sent:['Отправленные', m => mkMailSt(m) === 'sent'], cancel:['Отменённые', m => m.st === 'cancel']};
  const q = mkMQ.toLowerCase(), list = L.filter(F[mkMF][1]).filter(m => !q || (m.t + ' ' + m.b + ' ' + m.topic + ' ' + m.id).toLowerCase().includes(q));
  const stp = m => { const s = mkMailSt(m); return s === 'plan' ? '<span class="pill amb">Запланирована</span>' : s === 'cancel' ? '<span class="pill red">Отменена</span>' : '<span class="pill ok">Отправлена</span>'; };
  return ph(`Рассылки <span class="muted" style="font-size:16px">${nf(L.length)}</span>`, 'Массовые пуши всей базе, сегменту или одному гостю. Пуш получат только те, кто разрешил уведомления. По каждой рассылке — отчёт: кто открыл приложение и кто купил',
    `<a class="btn" href="#/segments">🎯 Сегменты</a>${ok ? '<button class="btn pri" onclick="mkMailNew()">＋ Создать рассылку</button>' : ''}`)
  + (ok ? '' : noPerm('push.send') + '<div style="height:12px"></div>')
  + `<div class="filters">${mkSearch('mkq-mail', mkMQ, 'mkMQ', 'Тема, заголовок или ID')}<div class="seg">${Object.entries(F).map(([k, [t]]) => `<button class="${mkMF === k ? 'on' : ''}" onclick="mkMF='${k}';render()">${t}</button>`).join('')}</div></div>
  <div class="tw"><table><thead><tr><th>ID</th><th>Тема</th><th>Рассылка</th><th>Статус</th><th>Время отправки</th><th class="r">Контакты</th><th>Сегмент</th><th></th></tr></thead><tbody>
  ${list.map(m => `<tr class="click" onclick="location.hash='#/mailing/${m.id}'"><td class="nowrap small"><span class="muted">#</span>${esc(String(m.id).replace(/^p(\d{6}).*/, 'П-$1'))} <button class="x" title="Скопировать ID" onclick="event.stopPropagation();mkCopy('${m.id}')">⧉</button></td>
    <td class="small nowrap">${MK_TIC[m.topic] || '📣'} ${esc(m.topic)}</td><td><div class="mk-ttl"><b>${esc(m.t)}</b><span>${esc(m.b)}</span></div></td><td>${stp(m)}</td>
    <td class="nowrap small">${mkDT(m.at)}</td><td class="r">${nf(m.n)}</td><td>${mkAudCell(m)}</td>
    <td>${m.src === 'mk' && mkMailSt(m) === 'plan' ? `<button class="btn sm" ${mkDis(ok)} title="Отменить" onclick="event.stopPropagation();mkMailCancel(${m.id})">⊘ Отменить</button>` : ''}</td></tr>`).join('')}
  </tbody></table>${list.length ? '' : '<div class="empty">Рассылок нет — попробуйте другой фильтр</div>'}</div>`;
};
function mkCopy(t) { try { navigator.clipboard.writeText(t); } catch (e) {} toast('Скопировал: ' + esc(t)); }
function mkMailCancel(id) {
  const m = mkD().mails.find(x => x.id === id); if (!m || !can('push.send')) return;
  modal({t:'Отменить рассылку?', body:`<p style="margin-top:0">«${esc(m.t)}» не уйдёт ${dLong(isoDay(new Date(m.at)))} — ${nf(m.n)} ${plural(m.n, 'гость', 'гостя', 'гостей')} её не получат</p>`, ok:'Отменить рассылку', cls:'red', cancel:'Оставить',
    onOk:() => { m.st = 'cancel'; audit('Отменили рассылку', `#${m.id} «${esc(m.t)}» · ${mkDiff('Запланирована', 'Отменена')}`); save(); render(); toast('Рассылка отменена'); }});
}

/* форма «Создать рассылку» — как в Starter §04/§07 */
let mkM = null, mkMLast = 'mkm-t';
/* gid — один гость; opts = {ids:[…], label:'…'} — разовая аудитория (фильтр клиентов, кластер) без сохранения сегмента */
const mkMCore = () => ({aud:mkM.aud, seg:mkM.seg, g:mkM.g, ids:mkM.ids, label:mkM.label, topic:mkM.topic, tpl:mkM.tpl, t:mkM.t, b:mkM.b, link:mkM.link, test:mkM.test, at:mkM.at});
function mkMailNew(gid, opts) {
  if (!can('push.send')) { toast('Нет права отправлять пуши'); return; }
  const D = mkD(), seg0 = (DB.segments || [])[0];
  if (!gid && !opts && D.mailDraft) mkM = {...clone(D.mailDraft), restored:1};
  else mkM = {aud: gid ? 'one' : opts && opts.ids ? 'list' : seg0 ? 'seg' : '', seg: seg0 ? seg0.id : '', g: gid || '', ids: (opts && opts.ids) || [], label: (opts && opts.label) || '',
    topic:'Скидки и акции', tpl:-1, t:'', b:'', link:LINKS[0], test:'', at:''};
  const snap = JSON.stringify(mkMCore());
  mkGuard('mkmw', () => JSON.stringify(mkMCore()) !== snap && (mkM.t.trim() || mkM.b.trim() || mkM.restored), () => mkMailKeep(), 'Рассылка не отправлена. Сохранить черновик — он откроется при следующем «Создать рассылку»?');
  mkMailDraw();
}
function mkMailKeep() { mkD().mailDraft = mkMCore(); save(); mkWinRemove('mkmw'); toast('Черновик рассылки сохранён'); }
function mkMailFresh() { delete mkD().mailDraft; save(); mkWinRemove('mkmw'); mkMailNew(); }
function mkMailIds() {
  const act = DB.guests.filter(g => !g.blocked);
  const base = mkM.aud === 'one' ? (G(mkM.g) ? [G(mkM.g)] : []) : mkM.aud === 'seg' ? segMatch(((DB.segments || []).find(s => s.id === mkM.seg) || {c:[]}).c)
    : mkM.aud === 'list' ? mkM.ids.map(G).filter(g => g && !g.blocked) : mkM.aud === 'all' ? act : [];
  return {base, push: base.filter(mkPush)};
}
function mkMailDraw() {
  const {base, push} = mkMailIds(), tp = MK_TOPICS.find(t => t[0] === mkM.topic), p = base.length ? Math.round(push.length / base.length * 100) : 0;
  const head = !mkM.aud ? '<div class="note red" style="margin-bottom:12px">👥 <span>Выберите, кому отправить: сегмент, одного гостя или всю базу</span></div>' : mkM.aud === 'one' ? `<div class="mk-head"><div><span>Гость</span><b>${esc(gName(G(mkM.g)))}</b></div><div><span>Получит пуш</span><b>${push.length ? '✓ Да' : 'Нет'}</b></div><p>${push.length ? 'Гость разрешил уведомления' : 'Гость не разрешил уведомления — пуш не придёт. Лучше написать в чат поддержки'}</p></div>`
    : `<div class="mk-head"><div><span>${mkM.aud === 'seg' ? 'В сегменте' : mkM.aud === 'list' ? esc(mkM.label || 'Выбранные гости') : 'Вся база'}</span><b>${nf(base.length)} ${plural(base.length, 'контакт', 'контакта', 'контактов')}</b></div><div><span>Получат пуш</span><b>${nf(push.length)} (${p}%)</b></div>
      <p>Пуш получат только гости, которые разрешили уведомления. ${mkM.aud === 'all' ? 'Чем больше база, тем труднее написать одно сообщение для всех — <a href="#/segments" onclick="mkWinRemove(\'mkmw\')">сегментируйте гостей</a>' : ''}${base.length && !push.length ? '<br><b style="color:var(--red)">Никто из них не получит пуш</b>' : ''}</p></div>`;
  const body = `${mkM.restored ? `<div class="note blue" style="margin-bottom:12px">📝 <span>Открыл сохранённый черновик · <a href="javascript:void 0" onclick="mkMailFresh()">Начать заново</a></span></div>` : ''}<div id="mkmf" class="mk-2"><div>
    <div class="fld"><span>Кому</span><div class="seg">${(mkM.aud === 'list' ? [['list', esc(mkM.label || 'Выбранные')]] : []).concat([['seg', 'Сегмент'], ['one', 'Один гость'], ['all', 'Вся база']]).map(([k, t]) => `<button class="${mkM.aud === k ? 'on' : ''}" onclick="mkM.aud='${k}';mkMailDraw()">${t}</button>`).join('')}</div></div>
    ${mkM.aud === 'seg' ? `<label class="fld"><span>Сегмент</span><select class="inp" onchange="mkM.seg=this.value;mkMailDraw()">${DB.segments.map(s => `<option value="${s.id}" ${s.id === mkM.seg ? 'selected' : ''}>${esc(s.n)} · ${segMatch(s.c).length}</option>`).join('')}</select></label>` : ''}
    ${mkM.aud === 'one' ? `<label class="fld"><span>Гость</span><select class="inp" onchange="mkM.g=this.value;mkMailDraw()"><option value="">Выберите…</option>${DB.guests.filter(g => !g.blocked).map(g => `<option value="${g.id}" ${g.id === mkM.g ? 'selected' : ''}>${esc(gName(g))} · ${esc(g.ph)}${mkPush(g) ? '' : ' · без пушей'}</option>`).join('')}</select></label>` : ''}
    ${head}
    <label class="fld"><span>О чём будет пуш? Тема влияет на шаблоны и картинку уведомления</span><select class="inp" onchange="mkM.topic=this.value;mkM.tpl=-1;mkMailDraw()">${MK_TOPICS.map(([t, ic, tl]) => `<option ${t === mkM.topic ? 'selected' : ''} value="${t}">${ic} ${t} · ${tl.length}</option>`).join('')}</select></label>
    <div class="fld"><span>Шаблоны</span><div class="mk-tpls">${tp[2].map(([t, b], i) => `<button class="mk-tpl ${mkM.tpl === i ? 'on' : ''}" onclick="mkMailTpl(${i})"><i>${tp[1]}</i><span><b>${esc(t)}</b>${esc(b)}</span></button>`).join('')}
      <button class="mk-tpl ${mkM.tpl === -2 ? 'on' : ''}" onclick="mkMailTpl(-2)"><i style="background:var(--surface2)">✏️</i><span><b>Без шаблона</b>Напишу сам</span></button></div></div>
    <label class="fld"><span class="mk-req" id="mkm-tl">Заголовок · ${mkLen(mkM.t)}/30</span><input class="inp" id="mkm-t" value="${esc(mkM.t)}" placeholder="🔥 Осталось 2 дня" onfocus="mkMLast=this.id" oninput="mkM.t=this.value;mkMailLive()"></label>
    <label class="fld"><span class="mk-req" id="mkm-bl">Текст · ${mkLen(mkM.b)}/140</span><textarea class="inp" id="mkm-b" placeholder="Приходи сегодня — и счётчик не сгорит" onfocus="mkMLast=this.id" oninput="mkM.b=this.value;mkMailLive()">${esc(mkM.b)}</textarea></label>
    <div class="mk-vars">${MK_VARS.map(([v, n]) => `<button type="button" title="Займёт ${n} знаков" onclick="mkVarIns('${v}')">${v}</button>`).join('')}</div>
    <div id="mkm-w">${pzWarn(textCheck(mkVarPrev(mkM.t), mkVarPrev(mkM.b)))}</div>
    <label class="fld"><span>Ссылка — какой экран откроется</span><select class="inp" onchange="mkM.link=this.value">${LINKS.map(l => `<option ${l === mkM.link ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <div class="row" style="align-items:flex-end"><label class="fld"><span>Тестовый номер</span><input class="inp" id="mkm-test" value="${esc(mkM.test)}" placeholder="+7 (9XX) XXX-XX-XX" oninput="mkM.test=this.value"></label>
      <div class="fld" style="flex:0"><button class="btn" onclick="mkMailTest()">Отправить тестовый push</button></div></div>
    <label class="fld"><span>Время отправки — пусто, значит сразу</span><input class="inp" type="datetime-local" value="${esc(mkM.at)}" onchange="mkM.at=this.value;mkMailDraw()"></label>
  </div><div>
    <div class="phone-prev"><div class="tm">${mkM.at ? mkM.at.slice(11, 16) : new Date().toTimeString().slice(0, 5)}</div><div class="push"><span class="ic"><svg viewBox="0 0 360 262"><use href="#k-mark"/></svg></span><div><small>${mkM.at ? 'запланирован' : 'сейчас'}</small><b id="mkm-pt">${esc(mkVarPrev(mkM.t) || 'Заголовок')}</b><p id="mkm-pb">${esc(mkVarPrev(mkM.b) || 'Текст пуша')}</p></div></div></div>
    <p class="small muted" style="margin-top:10px">Переменные в предпросмотре — на примере гостя Ани. «Поймёт ли это человек, который видит приложение впервые?»</p></div></div>`;
  mkWin(`<div class="md-h"><h2>Создать рассылку</h2><button class="cls" onclick="mkClose('mkmw')" aria-label="Закрыть">${X_SVG}</button></div>
    <div class="md-b" data-scroll>${body}</div><div class="md-f"><button class="btn" onclick="mkClose('mkmw')">Отмена</button><button class="btn pri" id="mkmOk" onclick="mkMailSend()">${mkMailBtn(push.length)}</button></div>`, 'mkmw', {ov:'ov c', box:'md mk-md'});
}
const mkMailBtn = n => !mkM.aud ? 'Выберите получателей' : mkM.at ? `Запланировать · ${nf(n)}` : `Отправить сейчас · ${nf(n)}`;
function mkMailTpl(i) { const tp = MK_TOPICS.find(t => t[0] === mkM.topic); mkM.tpl = i; if (i >= 0) { mkM.t = nbspFix(tp[2][i][0]); mkM.b = nbspFix(tp[2][i][1]); } else { mkM.t = ''; mkM.b = ''; } mkMailDraw(); }
function mkMailLive() {
  const s = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
  s('mkm-tl', `Заголовок · ${mkLen(mkM.t)}/30`); s('mkm-bl', `Текст · ${mkLen(mkM.b)}/140`);
  $('#mkm-tl').style.color = mkLen(mkM.t) > 30 ? 'var(--red)' : ''; $('#mkm-bl').style.color = mkLen(mkM.b) > 140 ? 'var(--red)' : '';
  s('mkm-pt', mkVarPrev(mkM.t) || 'Заголовок'); s('mkm-pb', mkVarPrev(mkM.b) || 'Текст пуша');
  $('#mkm-w').innerHTML = pzWarn(textCheck(mkVarPrev(mkM.t), mkVarPrev(mkM.b)));
}
function mkVarIns(v) {
  const e = document.getElementById(mkMLast) || document.getElementById('mkm-t'), a = e.selectionStart ?? e.value.length, b = e.selectionEnd ?? e.value.length;
  e.value = e.value.slice(0, a) + v + e.value.slice(b); e.focus(); e.setSelectionRange(a + v.length, a + v.length);
  if (e.id === 'mkm-t') mkM.t = e.value; else mkM.b = e.value; mkMailLive();
}
function mkMailTest() {
  const d = mkM.test.replace(/\D/g, '');
  if (d.length !== 11 || !/^[78]9/.test(d)) { toast('Тестовый номер: мобильный, 11 цифр — +7 (9XX) XXX-XX-XX'); return; }
  if (mkM.t.trim().length < 2) { toast('Сначала напишите заголовок'); return; }
  toast(`Тестовый пуш «${esc(mkVarPrev(mkM.t))}» ушёл на +7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`);
}
function mkMailSend() {
  const {push} = mkMailIds();
  if (!mkM.aud) { toast('Выберите, кому отправить'); return; }
  if (mkM.aud === 'one' && !G(mkM.g)) { toast('Выберите гостя'); return; }
  if (mkM.t.trim().length < 2 || mkM.b.trim().length < 2) { toast('Нужны заголовок и текст'); return; }
  if (mkLen(mkM.t) > 30) { toast('Заголовок — до 30 знаков (переменные считаются по длине)'); return; }
  if (mkLen(mkM.b) > 140) { toast('Текст — до 140 знаков'); return; }
  if (mkM.at && new Date(mkM.at) <= new Date()) { toast('Время отправки — в будущем или пусто'); return; }
  if (!push.length) { toast('Никто не получит пуш: у этих гостей уведомления выключены'); return; }
  const n = push.length, w = textCheck(mkVarPrev(mkM.t), mkVarPrev(mkM.b));
  modal({t: mkM.at ? `Запланировать на ${mkDT(+new Date(mkM.at))}?` : `Отправить ${nf(n)} ${plural(n, 'гостю', 'гостям', 'гостям')} сейчас?`,
    body:`<p style="margin-top:0">${mkM.at ? 'До отправки рассылку можно отменить в списке' : '<b>Отменить будет нельзя</b> — пуш придёт сразу'}</p>
      <div class="push" style="border:1px solid var(--line);background:var(--surface2);color:var(--ink)"><span class="ic"><svg viewBox="0 0 360 262"><use href="#k-mark"/></svg></span><div><b>${esc(mkVarPrev(mkM.t))}</b><p>${esc(mkVarPrev(mkM.b))}</p></div></div>
      ${w.length ? `<div style="margin-top:10px">${pzWarn(w)}</div>` : ''}`,
    ok: mkM.at ? 'Запланировать' : `Отправить ${nf(n)}`, cancel:'Вернуться', onOk:() => { mkMailDo(); }});
}
function mkMailDo() {
  const {push} = mkMailIds(), D = mkD();
  const id = Math.max(100, ...D.mails.map(m => m.id)) + 1;
  const m = {id, topic:mkM.topic, t:nbspFix(mkM.t), b:nbspFix(mkM.b), link:mkM.link, st: mkM.at ? 'plan' : 'sent', at: mkM.at ? +new Date(mkM.at) : mkNow(),
    aud: mkM.aud === 'one' ? {k:'one', g:mkM.g} : mkM.aud === 'seg' ? {k:'seg', seg:mkM.seg} : mkM.aud === 'list' ? {k:'txt', txt:mkM.label || 'Выбранные гости'} : {k:'all'}, ids:push.map(g => g.id), n:push.length, by:ME().n};
  D.mails.unshift(m); delete D.mailDraft;
  audit(m.st === 'plan' ? 'Запланировали рассылку' : 'Отправили рассылку', `#${id} «${esc(m.t)}» · ${esc(m.topic)} · ${m.aud.k === 'seg' ? 'сегмент «' + esc(mkSegName(m.aud.seg)) + '»' : m.aud.k === 'one' ? esc(gName(G(m.aud.g))) : m.aud.k === 'txt' ? esc(m.aud.txt) : 'вся база'} · ${nf(m.n)} ${plural(m.n, 'контакт', 'контакта', 'контактов')}${m.st === 'plan' ? ' · на ' + mkDT(m.at) : ''}`, m.aud.k === 'one' ? {g:m.aud.g} : {});
  save(); mkWinRemove('mkmw'); render(); toast(m.st === 'plan' ? `Рассылка #${id} запланирована на ${mkDT(m.at)}` : `Рассылка #${id} отправлена — ${nf(m.n)} ${plural(m.n, 'гостю', 'гостям', 'гостям')}`);
}

/* отчёт по рассылке */
let mkRT = 'ok', mkRC = 'all';
function mkRecip(m) {
  return m.ids.map(gid => { const g = G(gid); if (!g) return null; const h = mkH(m.id + '|' + gid), del = h % 100 < 86, vis = del && (h >>> 7) % 100 < 32, ord = vis && (h >>> 12) % 100 < 44;
    const vt = m.at + ((h >>> 3) % 240 + 2) * 60e3, codes = mkD().promos.filter(p => p.kind === 'code' && p.codeType === 'single' && p.on);
    return {g, del, vis, ord, vt, dev: (h >>> 17) & 1 ? 'iPhone' : 'Android', on: 'K-' + (60000 + h % 9000), sum: 290 + ((h >>> 9) % 140) * 10, promo: ord && codes.length && (h >>> 21) % 5 === 0 ? codes[(h >>> 23) % codes.length].code : ''}; }).filter(Boolean);
}
PAGES.mailing = r => {
  const m = mkMailsAll().find(x => String(x.id) === r[1]);
  const back = '<a class="mk-back" href="#/mailings">← Рассылки</a>';
  if (!m) return back + ph('Рассылка не найдена') + '<div class="card empty">Такой рассылки нет — возможно, её удалили</div>';
  const st = mkMailSt(m), sent = st === 'sent';
  const R = sent ? mkRecip(m) : [], ok_ = R.filter(x => x.del), bad = R.filter(x => !x.del);
  const vis = R.filter(x => x.vis).length, ord = R.filter(x => x.ord).length, money = R.filter(x => x.ord).reduce((a, x) => a + x.sum, 0);
  const pool = mkRT === 'ok' ? ok_ : mkRT === 'bad' ? bad : R;
  const CH = {all:['Все', () => 1], ord:['Заказы', x => x.ord], vis:['Визиты', x => x.vis], vno:['Визиты без заказов', x => x.vis && !x.ord]};
  const rows = pool.filter(CH[mkRC][1]);
  const pc = n => R.length ? (n / R.length * 100).toFixed(1).replace('.', ',') + '%' : '—';
  return back + ph(esc(m.t), `${st === 'plan' ? '<span class="pill amb">Запланирована</span>' : st === 'cancel' ? '<span class="pill red">Отменена</span>' : '<span class="pill ok">Отправлена</span>'} ${mkDT(m.at)} · ${MK_TIC[m.topic] || '📣'} ${esc(m.topic)} · ${esc(m.by)}`,
    sent ? `<button class="btn" onclick="mkMailExport('${m.id}')">⤓ Экспортировать</button>` : m.src === 'mk' && st === 'plan' && can('push.send') ? `<button class="btn" onclick="mkMailCancel(${m.id})">⊘ Отменить</button>` : '')
  + `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
    <div class="card"><div class="push" style="border:1px solid var(--line);background:var(--surface2);color:var(--ink)"><span class="ic"><svg viewBox="0 0 360 262"><use href="#k-mark"/></svg></span><div><b>${esc(m.t)}</b><p>${esc(m.b)}</p></div></div>
      <p class="small muted" style="margin:10px 0 0">Откроет: ${esc(m.link || '—')}</p></div>
    <div class="card"><dl class="kv"><dt>Визиты</dt><dd>${sent ? nf(vis) : '—'}</dd><dt>Заказы</dt><dd>${sent ? nf(ord) + (ord ? ` · ${rub(money)}` : '') : '—'}</dd><dt>Доставлено пушей</dt><dd>${sent ? pc(ok_.length) : '—'}</dd><dt>Не доставлено</dt><dd>${sent ? pc(bad.length) : '—'}</dd></dl>
      <p class="small muted" style="margin:10px 0 0">Визит — открыл приложение в течение 4 часов после пуша. Цифры вымышленные</p></div>
    <div class="card"><h3 style="margin-bottom:8px">Кому</h3>${mkAudCell(m)}<p class="small muted" style="margin:8px 0 0">${nf(m.n)} ${plural(m.n, 'контакт', 'контакта', 'контактов')} с разрешёнными пушами</p></div></div>
  <div class="card">${sent ? mkTabs([['ok', 'Доставлено', ok_.length], ['bad', 'Не доставлено', bad.length], ['all', 'Все контакты', R.length]], mkRT, 'mkRTab')
    + `<div class="mk-chips" style="margin-bottom:12px">${Object.entries(CH).map(([k, [t, f]]) => `<button class="mk-chip ${mkRC === k ? 'on' : ''}" onclick="mkRC='${k}';render()">${t}<b>${pool.filter(f).length}</b></button>`).join('')}</div>
    <div class="tw"><table><thead><tr><th>Имя</th><th>Телефон</th><th>Визит</th><th>Заказ</th><th class="r">Сумма заказа</th><th>Промокод</th></tr></thead><tbody>
    ${rows.map(x => `<tr><td><a href="#/guest/${x.g.id}">${esc(gName(x.g))}</a></td><td class="nowrap small">${esc(x.g.ph)}</td><td class="nowrap small">${x.vis ? `${mkDT(x.vt)} · ${x.dev === 'iPhone' ? '📱 iPhone' : '📱 Android'}` : ''}</td>
      <td class="small">${x.ord ? x.on : ''}</td><td class="r">${x.ord ? rub(x.sum) : ''}</td><td class="small">${esc(x.promo)}</td></tr>`).join('')}</tbody></table>${rows.length ? '' : '<div class="empty">Никого</div>'}</div>`
    : `<div class="empty">${st === 'cancel' ? 'Рассылку отменили — она никому не ушла' : `Рассылка уйдёт ${mkDT(m.at)}. Отчёт появится после отправки`}</div>`}</div>`;
};
function mkRTab(k) { mkRT = k; render(); }
function mkMailExport(id) {
  const m = mkMailsAll().find(x => String(x.id) === id), R = mkRecip(m);
  mkCSV('rassylka-' + id, ['Имя', 'Телефон', 'Доставлено', 'Визит', 'Устройство', 'Заказ', 'Сумма заказа', 'Промокод'],
    R.map(x => [gName(x.g), x.g.ph, x.del ? 'да' : 'нет', x.vis ? mkDT(x.vt) : '', x.vis ? x.dev : '', x.ord ? x.on : '', x.ord ? x.sum : '', x.promo]));
  audit('Экспорт отчёта рассылки', '#' + esc(id));
  save();
}

/* ═════════ 2. ОТЗЫВЫ ═════════ */
let mkF = {per:'30', shop:'', rt:[], tags:[], st:'', rep:''};
const mkFbOk = () => can('support.reply') || can('push.send');
function mkFbList() {
  const D = mkD(), now = mkNow();
  return D.feeds.filter(f => (mkF.per === 'all' || now - f.at <= +mkF.per * 864e5) && (!mkF.shop || f.shop === mkF.shop) && (!mkF.rt.length || mkF.rt.includes(f.r))
    && (!mkF.tags.length || mkF.tags.some(t => f.tags.includes(t))) && (!mkF.st || f.st === mkF.st) && (!mkF.rep || (mkF.rep === 'yes' ? !!f.reply : !f.reply))).sort((a, b) => b.at - a.at);
}
PAGES.feedbacks = () => {
  const D = mkD(), L = mkFbList(), ok = mkFbOk(), avg = L.length ? L.reduce((a, f) => a + f.r, 0) / L.length : 0;
  const nAct = (mkF.per !== '30') + !!mkF.shop + (mkF.rt.length > 0) + (mkF.tags.length > 0) + !!mkF.st + !!mkF.rep;
  return ph(`Отзывы <span class="muted" style="font-size:16px">${nf(L.length)} из ${nf(D.feeds.length)} · Ср. оценка ${avg ? avg.toFixed(2).replace('.', ',') : '—'}</span>`, 'Оценки гостей после заказа. Плохие — разбираем и отвечаем; пятёрочникам приложение само предлагает оценить нас на Яндекс Картах',
    `<button class="btn" onclick="mkFbExport()">⤓ Экспортировать</button><button class="btn" onclick="mkFbCfg()">⚙️ Настройки</button>`)
  + (ok ? '' : noPerm('support.reply') + '<div style="height:12px"></div>')
  + `<div class="filters">
    <select class="inp" style="width:auto" onchange="mkF.per=this.value;render()">${[['1', 'Сегодня'], ['7', '7 дней'], ['30', '30 дней'], ['90', '90 дней'], ['all', 'Всё время']].map(([k, t]) => `<option value="${k}" ${mkF.per === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
    <select class="inp" style="width:auto" onchange="mkF.shop=this.value;render()"><option value="">Все кофейни</option>${DB.shops.map(s => `<option ${mkF.shop === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select>
    <div class="mk-chips">${[5, 4, 3, 2, 1].map(n => `<button class="mk-chip ${mkF.rt.includes(n) ? 'on' : ''}" onclick="mkFbRt(${n})">${n} ★</button>`).join('')}</div>
    <details class="mk-dd"><summary class="btn">Теги${mkF.tags.length ? ` · ${mkF.tags.length}` : ''} ▾</summary><div class="mk-pop">${FB_TAGS.map(([t]) => `<label class="chk"><input type="checkbox" ${mkF.tags.includes(t) ? 'checked' : ''} onchange="mkFbTag('${t}')"> ${t}</label>`).join('')}</div></details>
    <select class="inp" style="width:auto" onchange="mkF.st=this.value;render()"><option value="">Любой статус</option>${['Принят', 'Обработан'].map(s => `<option ${mkF.st === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <select class="inp" style="width:auto" onchange="mkF.rep=this.value;render()"><option value="">Ответ — любой</option><option value="yes" ${mkF.rep === 'yes' ? 'selected' : ''}>Есть ответ</option><option value="no" ${mkF.rep === 'no' ? 'selected' : ''}>Нет ответа</option></select>
    ${nAct ? `<button class="btn ghost sm" onclick="mkF={per:'30',shop:'',rt:[],tags:[],st:'',rep:''};render()">Сбросить</button>` : ''}</div>
  <div class="tw"><table><thead><tr><th>ID</th><th>Статус</th><th>Отправлен</th><th>Клиент</th><th>№ заказа</th><th>Рейтинг</th><th>Комментарий</th><th>Теги</th><th>Ответ</th></tr></thead><tbody>
  ${L.map(f => { const g = G(f.g); return `<tr><td class="nowrap small">${f.id}</td>
    <td><select class="mk-st" ${mkDis(ok)} onchange="mkFbSt('${f.id}',this.value)">${['Принят', 'Обработан'].map(s => `<option ${f.st === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td class="nowrap small">${mkDT(f.at)}</td><td class="small"><a href="#/guest/${f.g}">${esc(gName(g))}</a><div class="muted">${esc(f.shop)}</div></td>
    <td class="nowrap small">${DB.orders.some(o => o.id === f.o) ? `<a href="javascript:void 0" onclick="openOrder('${f.o}')">${f.o}</a>` : f.o}<div class="muted">${esc(f.ch)}</div></td>
    <td>${mkStars(f.r)}</td><td class="small" style="min-width:180px">${esc(f.c) || '<span class="muted">без комментария</span>'}</td>
    <td style="min-width:150px">${f.tags.map(t => `<span class="mk-tag ${FB_POS[t] ? 'pos' : 'neg'}">${esc(t)}${ok ? ` <a href="javascript:void 0" title="Убрать" onclick="mkFbTagDel('${f.id}','${t}')">✕</a>` : ''}</span>`).join('')}${ok ? `<button class="mk-addtag" onclick="mkFbTagAdd('${f.id}')">＋ Добавить тег</button>` : ''}</td>
    <td>${f.reply ? `<button class="btn sm" onclick="mkFbReply('${f.id}')">✓ Ответ</button>` : `<button class="btn sm ${f.r <= 3 ? 'pri' : ''}" ${mkDis(ok)} onclick="mkFbReply('${f.id}')">Ответить</button>`}</td></tr>`; }).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Отзывов по этим фильтрам нет</div>'}</div>`;
};
function mkFbRt(n) { const i = mkF.rt.indexOf(n); if (i >= 0) mkF.rt.splice(i, 1); else mkF.rt.push(n); render(); }
function mkFbTag(t) { const i = mkF.tags.indexOf(t); if (i >= 0) mkF.tags.splice(i, 1); else mkF.tags.push(t); render(); const d = $('details.mk-dd'); if (d) d.open = true; }
const mkFb = id => mkD().feeds.find(f => f.id === id);
function mkFbSt(id, v) { const f = mkFb(id), w = f.st; if (w === v) return; f.st = v; audit('Статус отзыва', `${id} · ${mkDiff(w, v)}`, {g:f.g}); save(); render(); toast(`Отзыв ${id}: ${v}`); }
function mkFbTagDel(id, t) { const f = mkFb(id); f.tags = f.tags.filter(x => x !== t); audit('Тег отзыва убран', `${id} · ${esc(t)}`, {g:f.g}); save(); render(); }
function mkFbTagAdd(id) {
  const f = mkFb(id), free = FB_TAGS.filter(([t]) => !f.tags.includes(t));
  modal({t:'Добавить тег', body:`<p class="muted small" style="margin-top:0">${f.id} · ${mkStars(f.r)} ${esc(f.c)}</p><label class="fld"><span>Тег</span><select class="inp" id="mkft">${free.map(([t, p]) => `<option>${t}</option>`).join('')}</select></label>`, ok:'Добавить',
    onOk:() => { const t = val('mkft'); if (!t) return false; f.tags.push(t); audit('Тег отзыва', `${id} · ＋ ${esc(t)}`, {g:f.g}); save(); render(); }});
}
function mkFbAi(f) {
  const g = G(f.g), n = g ? g.n : '';
  if (f.r >= 4) return `${n}, спасибо за ${f.r === 5 ? 'пять звёзд' : 'отзыв'}! ${f.c ? 'Передали команде — очень приятно' : 'Рады, что понравилось'} — ждём тебя снова ☕`;
  return `${n}, прости, пожалуйста — так быть не должно. Уже разбираемся с кофейней. Напиши нам в поддержку в приложении — всё исправим`;
}
function mkFbReply(id) {
  const f = mkFb(id), g = G(f.g), ok = mkFbOk();
  modal({t:'Ответ на отзыв ' + f.id, wide:1, body:`<div class="note blue" style="margin-bottom:12px">${mkStars(f.r)} <span><b>${esc(gName(g))}</b> · ${mkDT(f.at)} · ${esc(f.shop)}<br>${esc(f.c) || 'без комментария'}${f.tags.length ? '<br>' + f.tags.map(t => `<span class="mk-tag ${FB_POS[t] ? 'pos' : 'neg'}">${esc(t)}</span>`).join('') : ''}</span></div>
    <label class="fld"><span>Ответ гостю — придёт пушем и появится в истории заказа</span><textarea class="inp" id="mkfr" ${mkDis(ok)} oninput="document.getElementById('mkfw').innerHTML=pzWarn(textCheck('',this.value))">${esc(f.reply)}</textarea></label>
    <div id="mkfw">${pzWarn(textCheck('', f.reply))}</div>
    ${ok ? `<div class="btns" style="margin:8px 0"><button class="btn sm" onclick="document.getElementById('mkfr').value=mkFbAi(mkFb('${id}'));document.getElementById('mkfw').innerHTML=pzWarn(textCheck('',document.getElementById('mkfr').value))">✨ Подсказать ответ</button><span class="small muted">по правилам AI-ответов из «Настроек»</span></div>` : ''}
    <label class="chk"><input type="checkbox" id="mkfd" checked ${mkDis(ok)}> Отметить отзыв обработанным</label>`,
    ok: ok ? 'Сохранить ответ' : '', cancel:'Закрыть', onOk:() => {
      const v = nbspFix(val('mkfr')); if (v.length < 3) { toast('Напишите ответ'); return false; }
      const w = f.reply; f.reply = v; if (val('mkfd')) f.st = 'Обработан';
      audit(w ? 'Изменили ответ на отзыв' : 'Ответили на отзыв', `${f.id} · ${w ? mkDiff(w, v) : esc(v.slice(0, 90))}`, {g:f.g}); save(); render(); toast('Ответ сохранён — гостю придёт пуш');
    }});
}
function mkFbExport() {
  const L = mkFbList();
  mkCSV('otzyvy', ['ID', 'Статус', 'Отправлен', 'Клиент', 'Телефон', 'Кофейня', 'Заказ', 'Оценка', 'Комментарий', 'Теги', 'Ответ'],
    L.map(f => { const g = G(f.g); return [f.id, f.st, mkDT(f.at), gName(g), g ? g.ph : '', f.shop, f.o, f.r, f.c, f.tags.join(', '), f.reply]; }));
  audit('Экспорт отзывов', `${L.length} шт.`); save();
}
function mkFbCfg(tab) {
  const c = mkD().feedCfg, ok = mkFbOk(), t = tab || 'extra', dis = mkDis(ok);
  const body = `<div id="mkfc">${mkTabs([['extra', 'Запрос дополнительного отзыва'], ['ai', 'Правила AI-ответов']], t, 'mkFbCfgTab')}
  ${t === 'extra' ? `<p class="muted small" style="margin-top:0">Гостям, поставившим 5 звёзд, приложение само предложит оценить нас на сторонней площадке</p>
    <div class="fld"><span>Где показывать</span><div class="mk-opt">${[['web', 'Сайт'], ['ios', 'iOS'], ['android', 'Android']].map(([k, l]) => `<label><input type="checkbox" id="mkx-${k}" ${c.extra[k] ? 'checked' : ''} ${dis}><span>${l}</span></label>`).join('')}</div>
      <small>Если выключить — приложение попросит оценку в App Store, Google Play или RuStore</small></div>
    <label class="fld"><span class="mk-req">Ссылка</span><input class="inp" id="mkx-link" ${dis} value="${esc(c.extra.link)}"></label>
    <label class="fld"><span class="mk-req">Заголовок</span><input class="inp" id="mkx-t" ${dis} value="${esc(c.extra.t)}"></label>
    <label class="fld"><span class="mk-req">Описание</span><textarea class="inp" id="mkx-d" ${dis}>${esc(c.extra.d)}</textarea></label>
    <label class="fld"><span class="mk-req">Текст на кнопке</span><input class="inp" id="mkx-btn" ${dis} value="${esc(c.extra.btn)}"></label>`
  : `<p class="muted small" style="margin-top:0">Базовые правила заданы системой. Здесь — наши дополнения: как отвечать гостям. Подсказка «✨ Подсказать ответ» учитывает их</p>
    <label class="fld"><span>Общие правила для всех отзывов</span><textarea class="inp" id="mka-all" ${dis}>${esc(c.ai.all)}</textarea></label>
    <label class="fld"><span>Правила для позитивных</span><textarea class="inp" id="mka-pos" ${dis}>${esc(c.ai.pos)}</textarea></label>
    <label class="fld"><span>Правила для негативных</span><textarea class="inp" id="mka-neg" ${dis}>${esc(c.ai.neg)}</textarea></label>`}</div>`;
  const ex = $('#mkfc'); if (ex) { ex.closest('.md-b').innerHTML = body; return; }
  modal({t:'Настройки отзывов', wide:1, body, ok: ok ? 'Сохранить' : '', cancel:'Закрыть', onOk:() => mkFbCfgSave()});
}
function mkFbCfgTab(t) { mkFbCfgSave(true); mkFbCfg(t); }
function mkFbCfgSave(quiet) {
  if (!mkFbOk()) return;
  const c = mkD().feedCfg, ch = [];
  const set = (o, k, v, l) => { if (v !== undefined && o[k] !== v) { ch.push(`${l}: ${mkDiff(o[k], v)}`); o[k] = v; } };
  const g = id => { const e = document.getElementById(id); return e ? (e.type === 'checkbox' ? e.checked : e.value.trim()) : undefined; };
  set(c.extra, 'web', g('mkx-web'), 'Сайт'); set(c.extra, 'ios', g('mkx-ios'), 'iOS'); set(c.extra, 'android', g('mkx-android'), 'Android');
  set(c.extra, 'link', g('mkx-link'), 'Ссылка'); set(c.extra, 't', g('mkx-t'), 'Заголовок'); set(c.extra, 'd', g('mkx-d'), 'Описание'); set(c.extra, 'btn', g('mkx-btn'), 'Кнопка');
  set(c.ai, 'all', g('mka-all'), 'AI: общие'); set(c.ai, 'pos', g('mka-pos'), 'AI: позитивные'); set(c.ai, 'neg', g('mka-neg'), 'AI: негативные');
  if (ch.length) { audit('Настройки отзывов', ch.join('; ')); save(); if (!quiet) toast('Настройки отзывов сохранены'); }
}

/* ═════════ 3. АКЦИИ ═════════ */
const MK_KIND = {disc:'Скидка', code:'Промокод', sur:'Надбавка'};
const MK_TYPE = {pct:'В процентах', rub:'В рублях', free:'Бесплатное блюдо', double:'Удвоение блюд'};
const MK_APPLY = {items:'К цене позиций', total:'К общей сумме заказа', delivery:'К цене доставки'};
const MK_PLACE = {all:'Везде', app:'Только в приложении', site:'Только на сайте'};
const MK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
function mkPromoNew(kind, o = {}) {
  const base = {id:'pr' + Date.now().toString(36) + Math.floor(Math.random() * 99), uuid:'', kind, n:'', on:false, arch:false, codeType:'single', code:'', mass:{n:100, prefix:'', len:6, codes:[]},
    type:'pct', val:10, freeDish:'', order:1, applyTo:'items', place:'all', stop:false,
    lim:{guestOn:false, guestN:1, allOn:false, allN:100, firstOnly:false, perCodeN:1, perActN:0}, special:{bd:false, ref:false},
    minMode:'none', min:{all:0, delivery:0, pickup:0, table:0},
    r:{time:{mode:'only', from:'', to:'', days:[], ints:[]}, menu:{mode:'only', cats:[], items:[]}, shops:{mode:'only', list:[]}, ways:{mode:'only', list:[]}},
    goal:{on:false, t:'', n:6}, uses:0, created:mkNow(), hist:[]};
  const p = {...base, ...o, lim:{...base.lim, ...(o.lim || {})}, special:{...base.special, ...(o.special || {})}, min:{...base.min, ...(o.min || {})}, mass:{...base.mass, ...(o.mass || {})},
    r:{...base.r, ...(o.r || {})}};
  ['time', 'menu', 'shops', 'ways'].forEach(k => p.r[k] = {...base.r[k], ...((o.r || {})[k] || {})});
  p.uuid = p.uuid || [8, 4, 4, 4, 12].map((n, i) => mkH(p.id + i).toString(16).padStart(8, '0').repeat(2).slice(0, n)).join('-');
  if (!p.hist.length && o.n) p.hist = [{at:p.created, by:'Владелец', ev:'Создана', ch:''}];
  return p;
}
const mkVal = p => p.type === 'pct' ? `−${p.val}%` : p.type === 'rub' ? `−${rub(p.val)}` : p.type === 'free' ? `🎁 ${esc((itm(p.freeDish) || {}).n || 'блюдо')}` : '2 по цене 1';
const mkValSur = p => p.type === 'pct' ? `+${p.val}%` : `+${rub(p.val)}`;
function mkPeriod(p) {
  const t = p.r.time, d = t.from || t.to ? `${t.from ? 'с ' + dShort(t.from) : ''}${t.to ? ' по ' + dShort(t.to) : ''}`.trim() : '', ex = t.mode === 'except' ? 'кроме: ' : '';
  const days = t.days.length && t.days.length < 7 ? t.days.slice().sort().map(i => MK_DAYS[i]).join(', ') : (d ? '' : 'ежедневно');
  const ints = t.ints.map(i => `${i.f}–${i.t}`).join(', ');
  return (ex + [d, days, ints].filter(Boolean).join(' · ')) || 'всегда';
}
function mkMinTxt(p) { return p.minMode === 'none' ? '—' : p.minMode === 'all' ? (p.min.all ? 'от ' + rub(p.min.all) : '—') : 'по способу: ' + ['delivery', 'pickup', 'table'].filter(k => p.min[k]).map(k => `${WAYS[k].toLowerCase()} ${rub(p.min[k])}`).join(', '); }
function mkLimTxt(p) {
  const a = [];
  if (p.lim.firstOnly) a.push('только первый заказ'); if (p.lim.guestOn) a.push(`гостю ${p.lim.guestN} ${plural(p.lim.guestN, 'раз', 'раза', 'раз')}`); if (p.lim.allOn) a.push(`всем ${p.lim.allN} ${plural(p.lim.allN, 'раз', 'раза', 'раз')}`);
  if (p.kind === 'code') { if (p.lim.perCodeN) a.push(`код — ${p.lim.perCodeN} ${plural(p.lim.perCodeN, 'раз', 'раза', 'раз')}`); if (p.lim.perActN) a.push(`акция — ${p.lim.perActN}`); }
  return a.join(', ') || 'без лимитов';
}
const mkModeT = m => m === 'except' ? 'ко всем, кроме' : 'только к';
function mkPSum(p) {
  return {'Название':p.n, 'Статус': p.arch ? 'В архиве' : p.on ? 'Активная' : 'Неактивная', 'Код': p.kind === 'code' ? (p.codeType === 'single' ? p.code : `массовый ${p.mass.prefix}… × ${p.mass.codes.length}`) : '',
    'Тип': MK_TYPE[p.type], 'Размер': p.kind === 'sur' ? mkValSur(p) : mkStrip(mkVal(p)), 'Порядок': String(p.order), 'К чему': MK_APPLY[p.applyTo], 'Место': MK_PLACE[p.place], 'Стоп других': p.stop ? 'да' : 'нет',
    'Лимиты': mkLimTxt(p), 'Особые сценарии': [p.special.bd && 'день рождения', p.special.ref && 'реферальная'].filter(Boolean).join(', ') || 'нет', 'Мин. сумма': mkStrip(mkMinTxt(p)),
    'Время': mkPeriod(p), 'Ассортимент': p.r.menu.cats.length + p.r.menu.items.length ? `${mkModeT(p.r.menu.mode)}: ${[...p.r.menu.cats.map(catName), ...p.r.menu.items.map(i => (itm(i) || {}).n || i)].join(', ')}` : 'всё меню',
    'Заведения': p.r.shops.list.length ? `${mkModeT(p.r.shops.mode)}: ${p.r.shops.list.join(', ')}` : 'все', 'Способ получения': p.r.ways.list.length ? `${mkModeT(p.r.ways.mode)}: ${p.r.ways.list.map(w => WAYS[w]).join(', ')}` : 'любой',
    'Виджет цели': p.goal.on ? `да, ${p.goal.n} покупок` : 'нет'};
}
let mkPT = 'disc', mkPQ = '', mkPS = '', mkPCT = '';
const mkPOk = () => can('offers.edit');
PAGES.promos = r => {
  const D = mkD(); if (r[1] && ['disc', 'code', 'sur', 'offers', 'week'].includes(r[1])) mkPT = r[1];
  const T = [['disc', 'Скидки', D.promos.filter(p => p.kind === 'disc' && !p.arch).length], ['code', 'Промокоды', D.promos.filter(p => p.kind === 'code' && !p.arch).length], ['sur', 'Надбавки', D.promos.filter(p => p.kind === 'sur' && !p.arch).length], ['offers', '🎯 Предложение дня'], ['week', '★ Цены недели']];
  const ok = mkPOk();
  let b;
  if (mkPT === 'offers' || mkPT === 'week') {
    const html = (PAGES[mkPT] ? PAGES[mkPT](['x']) : '').replace('<div class="ph">', '<div class="ph" style="margin-bottom:12px">').replace(/<h1>/, '<h2>').replace(/<\/h1>/, '</h2>');
    b = `<div class="note blue" style="margin-bottom:14px">ℹ️ <span>Наши персональные выгоды — их в Starter нет: там акции не нацелить на гостя. Отдельной страницей — <a href="#/${mkPT}">${mkPT === 'offers' ? '«Предложения дня»' : '«Цены недели»'} ›</a></span></div>` + html;
  } else {
    const q = mkPQ.toLowerCase();
    const L = D.promos.filter(p => p.kind === mkPT && (mkPS === 'arch' ? p.arch : !p.arch) && (!mkPS || mkPS === 'arch' || (mkPS === 'on' ? p.on : !p.on))
      && (!mkPCT || p.codeType === mkPCT) && (!q || (p.n + ' ' + p.code + ' ' + p.mass.prefix).toLowerCase().includes(q))).sort((a, b) => b.on - a.on || b.created - a.created);
    const name = {disc:'скидку', code:'промокод', sur:'надбавку'}[mkPT];
    b = `<div class="filters">${mkSearch('mkq-pr', mkPQ, 'mkPQ', 'Поиск по названию или коду')}
      <select class="inp" style="width:auto" onchange="mkPS=this.value;render()"><option value="">Статус: все</option><option value="on" ${mkPS === 'on' ? 'selected' : ''}>Активная</option><option value="off" ${mkPS === 'off' ? 'selected' : ''}>Неактивная</option><option value="arch" ${mkPS === 'arch' ? 'selected' : ''}>В архиве</option></select>
      ${mkPT === 'code' ? `<select class="inp" style="width:auto" onchange="mkPCT=this.value;render()"><option value="">Все типы</option><option value="single" ${mkPCT === 'single' ? 'selected' : ''}>Одиночный</option><option value="mass" ${mkPCT === 'mass' ? 'selected' : ''}>Массовый</option></select>` : ''}
      <span class="sp" style="flex:1"></span>${ok ? `<button class="btn pri" onclick="mkOpenPromo('','${mkPT}')">＋ Создать ${name}</button>` : ''}</div>
    ${L.length ? `<div class="tw"><table><thead><tr><th>Название</th><th>Статус</th>${mkPT === 'code' ? '<th>Тип промокода</th><th>Код</th>' : ''}<th>${mkPT === 'sur' ? 'Надбавка' : 'Вознаграждение'}</th><th>Мин. сумма</th><th>Период</th><th class="r">Использований</th><th></th></tr></thead><tbody>
    ${L.map(p => `<tr class="click" onclick="mkOpenPromo('${p.id}')"><td><b>${esc(p.n)}</b>${p.special.bd ? ' <span class="pill amb">🎂 ДР</span>' : ''}${p.special.ref ? ' <span class="pill blue">👫 реферальная</span>' : ''}</td>
      <td>${p.arch ? '<span class="pill">В архиве</span>' : p.on ? '<span class="pill ok">Активная</span>' : '<span class="pill red">Неактивная</span>'}</td>
      ${mkPT === 'code' ? `<td class="small">${p.codeType === 'mass' ? 'Массовый' : 'Одиночный'}</td><td class="nowrap"><code>${p.codeType === 'mass' ? esc(p.mass.prefix) + '… · ' + p.mass.codes.length : esc(p.code)}</code></td>` : ''}
      <td class="nowrap"><b>${p.kind === 'sur' ? mkValSur(p) : mkVal(p)}</b></td><td class="small">${mkMinTxt(p)}</td><td class="small">${esc(mkPeriod(p))}</td><td class="r">${nf(p.uses)}</td>
      <td class="nowrap" onclick="event.stopPropagation()">${p.arch ? `<button class="btn sm" ${mkDis(ok)} onclick="mkPromoArch('${p.id}')">Вернуть</button>` : `${sw('mkon-' + p.id, p.on, (ok ? '' : 'disabled ') + `onchange="mkPromoToggle('${p.id}')"`)} <button class="btn sm ghost" title="В архив" ${mkDis(ok)} onclick="mkPromoArch('${p.id}')">🗄</button>`}</td></tr>`).join('')}
    </tbody></table></div>` : `<div class="card empty">${mkPT === 'sur' && !mkPQ && !mkPS ? 'Создайте первую надбавку к стоимости заказа — например, за упаковку или ночную доставку' : 'Ничего не нашли'}${ok && !mkPQ ? `<div style="margin-top:12px"><button class="btn pri" onclick="mkOpenPromo('','${mkPT}')">＋ Создать ${name}</button></div>` : ''}</div>`}`;
  }
  setTimeout(() => { const t = $('#page .tabs button.on'); if (t && t.parentNode.scrollWidth > t.parentNode.clientWidth) t.parentNode.scrollLeft = t.offsetLeft - 16; }, 0);
  return ph('Акции', 'Скидки, промокоды и надбавки — как в Starter: с приоритетом, стопом других скидок, лимитами и ограничениями по времени, меню, кофейням и способу получения. Плюс наши персональные выгоды',
    `<button class="btn" onclick="mkPromoLog()">📜 История изменений</button>`)
  + (ok ? '' : noPerm('offers.edit') + '<div style="height:12px"></div>') + mkTabs(T, mkPT, 'mkPTab') + b;
};
function mkPTab(k) { location.hash = '#/promos/' + k; }
const mkPr = id => mkD().promos.find(p => p.id === id);
function mkPHist(p, ev, ch) { p.hist.unshift({at:mkNow(), by:ME().n, ev, ch}); audit(`${MK_KIND[p.kind]} «${p.n}»: ${ev.toLowerCase()}`, ch); }
function mkPromoToggle(id) {
  const p = mkPr(id); if (!mkPOk()) return;
  if (!p.on && p.kind === 'code' && p.codeType === 'single' && mkD().promos.some(x => x !== p && x.on && !x.arch && x.code === p.code)) { toast(`Код ${esc(p.code)} уже работает в другой акции`); render(); return; }
  p.on = !p.on; mkPHist(p, p.on ? 'Включена' : 'Выключена', mkDiff(p.on ? 'Неактивная' : 'Активная', p.on ? 'Активная' : 'Неактивная')); save(); render(); toast(`«${esc(p.n)}» ${p.on ? 'включена' : 'выключена'}`);
}
function mkPromoArch(id) {
  const p = mkPr(id); if (!mkPOk()) return;
  if (!p.arch) { modal({t:'В архив?', body:`<p style="margin-top:0">«${esc(p.n)}» выключится и уйдёт в архив. Вернуть можно в фильтре «В архиве»</p>`, ok:'В архив', onOk:() => { p.arch = true; p.on = false; mkPHist(p, 'В архив', mkDiff('в работе', 'в архиве')); save(); mkWinRemove('mkpw'); render(); }}); return; }
  p.arch = false; mkPHist(p, 'Из архива', mkDiff('в архиве', 'неактивная')); save(); render();
}
function mkPromoLog() {
  const D = mkD(), H = D.promos.flatMap(p => p.hist.map(h => ({...h, p}))).sort((a, b) => b.at - a.at);
  modal({t:'История изменений', wide:1, cancel:'Закрыть', ok:'', body: H.length ? `<div class="tw" style="max-height:62vh"><table><thead><tr><th>Акция</th><th>Тип</th><th>Событие</th><th>Изменения</th><th>Когда</th><th>Пользователь</th></tr></thead><tbody>
    ${H.map(h => `<tr><td><b>${esc(h.p.n)}</b></td><td class="small">${MK_KIND[h.p.kind]}</td><td class="small">${esc(h.ev)}</td><td class="small" style="min-width:220px">${h.ch || '—'}</td><td class="nowrap small">${mkDT(h.at)}</td><td class="small">${esc(h.by)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Изменений пока не было</div>'});
}

/* карточка акции — большое окно с меню слева */
let mkP = null, mkPSec = 'main', mkPIQ = '';
function mkOpenPromo(id, kind, sec) {
  const src = id ? mkPr(id) : null;
  mkP = src ? clone(src) : mkPromoNew(kind || 'disc', {n:'', mass:{n:100, prefix:'', len:6, codes:[]}, codeType: kind === 'code' && sec === 'mass' ? 'mass' : 'single'});
  mkP.isNew = !src; mkPSec = 'main'; mkPIQ = ''; const snap = JSON.stringify(mkP);
  mkGuard('mkpw', () => JSON.stringify(mkP) !== snap, () => mkPromoSave(), 'Изменения в акции не сохранены'); mkPDraw();
}
function mkPDraw() {
  const p = mkP, ok = mkPOk(), dis = mkDis(ok);
  const S = [['main', '☰', 'Основное'], ['set', '⚙️', 'Настройки'], ['lim', '⏷', 'Ограничения'], ['goal', '◎', 'Отображать как цель'], ['hist', '🕘', 'История']];
  const nav = S.map(([k, i, t]) => (k === 'hist' ? '<span class="sp"></span>' : '') + `<button class="${mkPSec === k ? 'on' : ''}" ${k === 'goal' && p.kind === 'sur' ? 'disabled' : ''} onclick="mkPSec='${k}';mkPDraw()"><span>${i}</span>${t}</button>`).join('');
  const st = p.arch ? '<span class="pill">В архиве</span>' : p.on ? '<span class="pill ok">Активная</span>' : '<span class="pill red">Неактивная</span>';
  const html = `<div class="mk-wh"><div><h2>${esc(p.n) || (p.isNew ? {disc:'Новая скидка', code:'Новый промокод', sur:'Новая надбавка'}[p.kind] : 'Без названия')}</h2><code>#${p.uuid}</code></div>${p.isNew ? '' : st}<button class="cls" onclick="mkClose('mkpw')" aria-label="Закрыть">${X_SVG}</button></div>
    <div class="mk-wm"><nav class="mk-nav">${nav}</nav><div class="mk-wb" data-scroll>${ok ? '' : noPerm('offers.edit') + '<div style="height:12px"></div>'}${MK_PSEC[mkPSec](p, dis)}</div></div>
    <div class="mk-wf">${p.isNew ? '' : `<button class="btn" ${dis} onclick="mkPromoArch('${p.id}')">🗄 ${p.arch ? 'Из архива' : 'Архивировать'}</button><button class="btn" ${dis} onclick="mkP.on=!mkP.on;mkPDraw()">⏻ ${p.on ? 'Отключить' : 'Включить'}</button>`}
      <span class="sp"></span><button class="btn ghost" onclick="mkClose('mkpw')">Отмена</button>${ok ? `<button class="btn pri" onclick="mkPromoSave()">${p.isNew ? 'Создать' : 'Сохранить изменения'}</button>` : ''}</div>`;
  mkWin(html, 'mkpw');
}
/* короткие помощники для полей окна: меняют mkP по пути и, если нужно, перерисовывают */
function mkPSet(path, v, redraw) { const k = path.split('.'); let o = mkP; k.slice(0, -1).forEach(x => o = o[x]); o[k[k.length - 1]] = v; if (redraw) mkPDraw(); }
const mkPI = (path, v, dis, attrs = '') => `<input class="inp" ${dis} value="${esc(v)}" onchange="mkPSet('${path}',this.value)" ${attrs}>`;
const mkPN = (path, v, dis, u, rd = 0) => { const i = `<input class="inp" ${dis} inputmode="numeric" value="${esc(v)}" onchange="mkPSet('${path}',+this.value.replace(/[^0-9.]/g,'')||0,${rd})">`; return u ? `<div class="u-wrap">${i}<i>${u}</i></div>` : i; };
const mkPSel = (path, v, opts, dis, redraw = 1) => `<select class="inp" ${dis} onchange="mkPSet('${path}',this.value,${redraw})">${Object.entries(opts).map(([k, t]) => `<option value="${k}" ${String(v) === k ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
const mkPChk = (path, v, label, dis, sub = '') => `<label><input type="checkbox" ${v ? 'checked' : ''} ${dis} onchange="mkPSet('${path}',this.checked,1)"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span></label>`;
const mkPMode = (path, v, dis) => `<div class="seg" style="margin-bottom:10px">${[['only', 'Только к выбранным'], ['except', 'Ко всем, кроме выбранных']].map(([k, t]) => `<button ${dis} class="${v === k ? 'on' : ''}" onclick="mkPSet('${path}','${k}',1)">${t}</button>`).join('')}</div>`;
function mkPTog(path, x) { const k = path.split('.'); let o = mkP; k.forEach(y => o = o[y]); const i = o.indexOf(x); if (i >= 0) o.splice(i, 1); else o.push(x); mkPDraw(); }
const MK_PSEC = {
  main: (p, dis) => `<div class="card"><h3>Основное</h3>
    <label class="fld"><span class="mk-req">Название акции — гость видит его в корзине</span><input class="inp" ${dis} maxlength="255" value="${esc(p.n)}" oninput="mkP.n=this.value;document.querySelector('.mk-wh h2').textContent=this.value||'Без названия'" placeholder="Например: вечерняя скидка на выпечку"></label>
    ${p.kind === 'code' ? `<div class="fld"><span class="mk-req">Тип промокода</span><div class="seg">${[['single', 'Одиночный'], ['mass', 'Массовый']].map(([k, t]) => `<button ${dis} class="${p.codeType === k ? 'on' : ''}" onclick="mkPSet('codeType','${k}',1)">${t}</button>`).join('')}</div>
      <small>${p.codeType === 'single' ? 'Один код для всех — например, для рассылки или баннера' : 'Набор уникальных кодов — у каждого гостя свой. Так в Starter делается персональная цена'}</small></div>
    ${p.codeType === 'single' ? `<div class="row" style="align-items:flex-end"><label class="fld"><span class="mk-req">Промокод · до 16 знаков, A–Z, 0–9, - и _</span><input class="inp" id="mkpc" ${dis} maxlength="16" value="${esc(p.code)}" oninput="this.value=this.value.toUpperCase();mkP.code=this.value" style="font-family:ui-monospace,Menlo,monospace"></label>
        <div class="fld" style="flex:0"><button class="btn" ${dis} onclick="mkP.code=mkRand(8);mkPDraw()">Сгенерировать</button></div></div>
        <div class="note blue">🔗 <span>Автоприменение: ссылка <code>kofeynaya.ru?promocode=${esc(p.code || 'КОД')}</code> — можно поставить в баннер или рассылку, код подставится сам</span></div>`
    : `<div class="row"><label class="fld"><span class="mk-req">Количество</span>${mkPN('mass.n', p.mass.n, dis)}</label><label class="fld"><span class="mk-req">Префикс · до 8</span><input class="inp" ${dis} maxlength="8" value="${esc(p.mass.prefix)}" oninput="this.value=this.value.toUpperCase()" onchange="mkPSet('mass.prefix',this.value,0)"></label><label class="fld"><span class="mk-req">Длина случайной части</span>${mkPN('mass.len', p.mass.len, dis)}</label></div>
      <div class="btns" style="margin-bottom:10px"><button class="btn pri" ${dis} onclick="mkPGen()">Сгенерировать</button><button class="btn" ${dis} onclick="mkPImport()">Импортировать</button>${p.mass.codes.length ? `<a class="btn ghost" href="#/masscodes" onclick="mkWinRemove('mkpw')">Все коды ›</a>` : ''}</div>
      ${p.mass.codes.length ? `<div class="fld"><span>Сейчас ${nf(p.mass.codes.length)} ${plural(p.mass.codes.length, 'код', 'кода', 'кодов')}, использовано ${p.mass.codes.filter(c => c.st === 'used').length}. Примеры</span><div class="mk-codes">${p.mass.codes.slice(0, 8).map(c => `<span>${esc(c.c)}</span>`).join('')}</div></div>`
        : `<div class="fld"><span>Примеры кодов</span><div class="mk-codes">${[0, 1, 2].map(i => `<span>${esc((p.mass.prefix || 'PREFIX'))}${mkRand(Math.min(12, Math.max(3, p.mass.len || 6)), 'ex' + i)}</span>`).join('')}</div></div>`}`}` : ''}
    <dl class="kv" style="margin-top:12px"><dt>Тип</dt><dd>${MK_KIND[p.kind]}</dd>${p.isNew ? '' : `<dt>Создана</dt><dd>${mkDT(p.created)}</dd><dt>Использований</dt><dd>${nf(p.uses)}</dd>`}</dl></div>`,
  set: (p, dis) => `<div class="card"><h3>${p.kind === 'sur' ? 'Надбавка' : 'Вознаграждение'}</h3><div class="row">
      <label class="fld"><span class="mk-req">${p.kind === 'sur' ? 'Тип надбавки' : 'Тип скидки'}</span>${mkPSel('type', p.type, p.kind === 'sur' ? {pct:'В процентах', rub:'В рублях'} : MK_TYPE, dis)}</label>
      ${p.type === 'free' ? `<label class="fld"><span class="mk-req">Блюдо в подарок</span><select class="inp" ${dis} onchange="mkPSet('freeDish',this.value,1)"><option value="">Выберите…</option>${allItems().map(m => `<option value="${m.id}" ${p.freeDish === m.id ? 'selected' : ''}>${esc(m.n)} · ${rub(m.p)}</option>`).join('')}</select></label>`
      : p.type === 'double' ? `<div class="fld"><span>Размер</span><div class="note">Второе такое же блюдо — бесплатно. Блюда выберите в «Ограничения → Ассортимент»</div></div>`
      : `<label class="fld"><span class="mk-req">Размер</span>${mkPN('val', p.val, dis, p.type === 'pct' ? '%' : '₽')}</label>`}</div></div>
    <div class="card"><h3>Применение</h3><div class="row"><label class="fld"><span class="mk-req">Порядок применения</span>${mkPN('order', p.order, dis)}<small>Чем больше число, тем дальше акция в очереди</small></label>
      <label class="fld"><span class="mk-req">К чему применять</span>${mkPSel('applyTo', p.applyTo, MK_APPLY, dis)}</label></div>
      <label class="fld"><span>Место применения</span>${mkPSel('place', p.place, MK_PLACE, dis)}</label>
      <div class="mk-opt">${mkPChk('stop', p.stop, 'Остановить применение других скидок после этой', dis, 'Кроме бонусов. У нас на строку чека и так одна лучшая выгода')}</div></div>
    <div class="card"><h3>Лимиты использования</h3><div class="mk-opt">
      ${mkPChk('lim.guestOn', p.lim.guestOn, 'Ограничить для одного гостя', dis)}${p.lim.guestOn ? `<div style="max-width:220px;margin-left:25px">${mkPN('lim.guestN', p.lim.guestN, dis, 'раз')}</div>` : ''}
      ${mkPChk('lim.allOn', p.lim.allOn, 'Ограничить для всех гостей', dis)}${p.lim.allOn ? `<div style="max-width:220px;margin-left:25px">${mkPN('lim.allN', p.lim.allN, dis, 'раз')}</div>` : ''}
      ${mkPChk('lim.firstOnly', p.lim.firstOnly, 'Только на первый заказ', dis)}</div>
      ${p.kind === 'code' ? `<div class="row" style="margin-top:12px"><label class="fld"><span>На каждый промокод</span>${mkPN('lim.perCodeN', p.lim.perCodeN, dis, 'раз')}<small>Например, 1 — каждый код сработает один раз</small></label><label class="fld"><span>На всю акцию</span>${mkPN('lim.perActN', p.lim.perActN, dis, 'раз')}<small>0 — без предела</small></label></div>` : ''}</div>
    ${p.kind === 'sur' ? '' : `<div class="card"><h3>Особые сценарии</h3><div class="mk-opt">
      ${mkPChk('special.bd', p.special.bd, 'Акция на день рождения', dis, 'Работает в период вокруг ДР. Наша скидка в ДР = возраст — в <a href="#/m/bd" onclick="mkWinRemove(\'mkpw\')">правилах</a>')}
      ${mkPChk('special.ref', p.special.ref, 'Акция для реферальной программы', dis, 'Достаётся другу по реферальной ссылке — выбирается в «Реферальной программе»')}</div></div>`}
    <div class="card"><h3>Минимальная сумма корзины</h3><div class="mk-opt">${[['none', 'Без ограничений'], ['all', 'Общая для всех способов получения'], ['way', 'Зависит от способа получения']].map(([k, t]) => `<label><input type="radio" name="mkmin" ${p.minMode === k ? 'checked' : ''} ${dis} onchange="mkPSet('minMode','${k}',1)"><span>${t}</span></label>`).join('')}</div>
      ${p.minMode === 'all' ? `<div style="max-width:240px;margin-top:10px">${mkPN('min.all', p.min.all, dis, '₽')}</div>` : p.minMode === 'way' ? `<div class="row" style="margin-top:10px">${['delivery', 'pickup', 'table'].map(k => `<label class="fld"><span>${WAYS[k]}</span>${mkPN('min.' + k, p.min[k], dis, '₽')}</label>`).join('')}</div>` : ''}</div>`,
  lim: (p, dis) => { const t = p.r.time, mi = p.r.menu, q = mkPIQ.toLowerCase();
    const items = allItems().filter(m => !q || m.n.toLowerCase().includes(q)).slice(0, 60);
    return `<div class="card"><h3>По времени</h3>${mkPMode('r.time.mode', t.mode, dis)}
      <div class="row"><label class="fld"><span>С даты</span><input class="inp" type="date" ${dis} value="${t.from}" onchange="mkPSet('r.time.from',this.value,1)"></label><label class="fld"><span>По дату</span><input class="inp" type="date" ${dis} value="${t.to}" onchange="mkPSet('r.time.to',this.value,1)"></label></div>
      <div class="fld"><span>Дни недели — ничего не выбрано, значит каждый день</span><div class="mk-days">${MK_DAYS.map((d, i) => `<button ${dis} class="${t.days.includes(i) ? 'on' : ''}" onclick="mkPTog('r.time.days',${i})">${d}</button>`).join('')}</div></div>
      <div class="fld"><span>Интервалы времени</span>${t.ints.map((x, i) => `<div class="row" style="margin-bottom:6px;align-items:center"><input class="inp" type="time" ${dis} value="${x.f}" onchange="mkP.r.time.ints[${i}].f=this.value;mkPDraw()"><input class="inp" type="time" ${dis} value="${x.t}" onchange="mkP.r.time.ints[${i}].t=this.value;mkPDraw()"><button class="x" style="flex:0" ${dis} onclick="mkP.r.time.ints.splice(${i},1);mkPDraw()">✕</button></div>`).join('')}
        <button class="btn sm" ${dis} onclick="mkP.r.time.ints.push({f:'12:00',t:'15:00'});mkPDraw()">＋ Интервал</button></div>
      <p class="small muted" style="margin:0">Сейчас: <b>${esc(mkPeriod(p))}</b></p></div>
    <div class="card"><h3>Ассортимент</h3>${mkPMode('r.menu.mode', mi.mode, dis)}
      <div class="fld"><span>Разделы меню</span><div class="mk-chips">${DB.cats.map(c => `<button class="mk-chip ${mi.cats.includes(c.id) ? 'on' : ''}" ${dis} onclick="mkPTog('r.menu.cats','${c.id}')">${esc(c.name)}</button>`).join('')}</div></div>
      <div class="fld"><span>Блюда${mi.items.length ? ` · выбрано ${mi.items.length}` : ''}</span>
        ${mi.items.length ? `<div class="mk-chips" style="margin-bottom:8px">${mi.items.map(id => `<span class="pill">${esc((itm(id) || {}).n || id)} <a href="javascript:void 0" onclick="mkPTog('r.menu.items','${id}')">✕</a></span>`).join('')}</div>` : ''}
        <input class="inp" id="mkpiq" placeholder="Найти блюдо" value="${esc(mkPIQ)}" oninput="mkPIQ=this.value;mkPItems()" style="margin-bottom:6px">
        <div class="mk-items" id="mkpil">${mkPItemsHtml(items, mi.items, dis)}</div></div></div>
    <div class="card"><h3>Заведения</h3>${mkPMode('r.shops.mode', p.r.shops.mode, dis)}<div class="mk-chips">${DB.shops.map(s => `<button class="mk-chip ${p.r.shops.list.includes(s.n) ? 'on' : ''}" ${dis} onclick="mkPTog('r.shops.list','${esc(s.n)}')">${esc(s.n)}</button>`).join('')}</div><p class="small muted" style="margin:8px 0 0">Ничего не выбрано — во всех кофейнях</p></div>
    <div class="card"><h3>Способ получения</h3>${mkPMode('r.ways.mode', p.r.ways.mode, dis)}<div class="mk-chips">${Object.entries(WAYS).map(([k, t]) => `<button class="mk-chip ${p.r.ways.list.includes(k) ? 'on' : ''}" ${dis} onclick="mkPTog('r.ways.list','${k}')">${t}</button>`).join('')}</div><p class="small muted" style="margin:8px 0 0">Ничего не выбрано — при любом способе</p></div>`; },
  goal: (p, dis) => `<div class="card"><h3>Отображать как цель</h3>
    ${p.type !== 'free' ? `<div class="note">ℹ️ <span>Виджет цели работает только для типа «Бесплатное блюдо». Сейчас тип — «${MK_TYPE[p.type]}». Поменять — в «Настройках»</span></div>` : ''}
    <div class="mk-opt" style="margin-top:10px">${mkPChk('goal.on', p.goal.on, 'Показывать виджет цели', p.type === 'free' ? dis : 'disabled', 'Гость видит, сколько покупок осталось до подарка. Похоже на наш «Каждый 6-й»')}</div>
    ${p.goal.on && p.type === 'free' ? `<div class="row" style="margin-top:12px"><label class="fld"><span>Заголовок цели</span>${mkPI('goal.t', p.goal.t, dis, 'placeholder="Шестой круассан — в подарок"')}</label><label class="fld"><span>Покупок до подарка</span>${mkPN('goal.n', p.goal.n, dis, '', 1)}</label></div>
      <div class="note ok" style="display:block"><b>${esc(p.goal.t || 'Цель')}</b><div class="mk-goal">${Array.from({length:Math.min(12, p.goal.n || 1)}, (_, i) => `<i class="${i < 2 ? 'on' : ''}">${i === Math.min(12, p.goal.n || 1) - 1 ? '🎁' : i < 2 ? '✓' : ''}</i>`).join('')}</div><small class="muted">Так увидит гость: 2 из ${p.goal.n}</small></div>` : ''}</div>`,
  hist: p => `<div class="card"><h3>История</h3>${p.hist.length ? `<div class="log">${p.hist.map(h => `<div class="e"><div class="w">${mkDT(h.at)}<br>${esc(h.by)}</div><div><b>${esc(h.ev)}</b><div class="small">${h.ch || ''}</div></div></div>`).join('')}</div>` : '<div class="empty">Изменений ещё не было</div>'}</div>`,
};
const mkPItemsHtml = (items, sel, dis) => items.map(m => `<label><input type="checkbox" ${dis} ${sel.includes(m.id) ? 'checked' : ''} onchange="mkPTog('r.menu.items','${m.id}')">${m.img ? `<img src="${m.img}" alt="" loading="lazy">` : ''}<span style="flex:1">${esc(m.n)}</span><span class="muted">${rub(m.p)}</span></label>`).join('') || '<div class="empty" style="padding:14px">Не нашли</div>';
function mkPItems() { const q = mkPIQ.toLowerCase(), el = $('#mkpil'); if (el) el.innerHTML = mkPItemsHtml(allItems().filter(m => !q || m.n.toLowerCase().includes(q)).slice(0, 60), mkP.r.menu.items, mkDis(mkPOk())); }
function mkPGen() {
  const m = mkP.mass, n = Math.round(m.n), len = Math.round(m.len);
  if (!/^[A-Z0-9_-]{1,8}$/.test(m.prefix)) { toast('Префикс: от 1 до 8 знаков — A–Z, 0–9, - и _'); return; }
  if (!(n >= 1 && n <= 5000)) { toast('Количество — от 1 до 5 000'); return; }
  if (!(len >= 4 && len <= 12)) { toast('Длина случайной части — от 4 до 12'); return; }
  const have = new Set(m.codes.map(c => c.c)), add = [];
  let guard = 0; while (add.length < n && guard++ < n * 20) { const c = m.prefix + mkRand(len); if (!have.has(c)) { have.add(c); add.push({c, st:'active', used:0}); } }
  m.codes = m.codes.concat(add); mkPDraw(); toast(`Сгенерировал ${nf(add.length)} ${plural(add.length, 'код', 'кода', 'кодов')} — сохранятся вместе с акцией`);
}
function mkPImport() {
  modal({t:'Импорт промокодов', body:`<label class="fld"><span>Коды — каждый с новой строки. A–Z, 0–9, - и _, до 16 знаков</span><textarea class="inp" id="mkpimp" style="min-height:160px;font-family:ui-monospace,Menlo,monospace" placeholder="BACK7KQ2M9&#10;BACKP3XH2A"></textarea></label>`, ok:'Добавить',
    onOk:() => { const have = new Set(mkP.mass.codes.map(c => c.c)), L = val('mkpimp').toUpperCase().split(/\s+/).filter(Boolean), bad = L.filter(c => !/^[A-Z0-9_-]{3,16}$/.test(c)), good = [...new Set(L.filter(c => /^[A-Z0-9_-]{3,16}$/.test(c) && !have.has(c)))];
      if (!good.length) { toast(bad.length ? `Не подошли: ${esc(bad.slice(0, 3).join(', '))}` : 'Новых кодов нет'); return false; }
      mkP.mass.codes = mkP.mass.codes.concat(good.map(c => ({c, st:'active', used:0}))); setTimeout(mkPDraw, 0); toast(`Добавил ${good.length}${bad.length ? `, пропустил ${bad.length} с ошибкой` : ''}`); }});
}
function mkPromoSave() {
  const p = mkP, D = mkD(); if (!mkPOk()) return;
  const bad = (sec, t) => { mkPSec = sec; mkPDraw(); toast(t); };
  p.n = p.n.trim();
  if (p.n.length < 3) return bad('main', 'Напишите название акции — гость увидит его в корзине');
  if (p.kind === 'code' && p.codeType === 'single') { if (!/^[A-Z0-9_-]{3,16}$/.test(p.code)) return bad('main', 'Промокод: от 3 до 16 знаков — A–Z, 0–9, - и _');
    if (D.promos.some(x => x.id !== p.id && !x.arch && x.code === p.code)) return bad('main', `Код ${esc(p.code)} уже есть в другой акции`); }
  if (p.kind === 'code' && p.codeType === 'mass' && !p.mass.codes.length) return bad('main', 'Сгенерируйте или импортируйте коды');
  if (p.type === 'free' && !p.freeDish) return bad('set', 'Выберите блюдо в подарок');
  if ((p.type === 'pct' || p.type === 'rub') && !(p.val > 0)) return bad('set', 'Размер должен быть больше 0');
  if (p.type === 'pct' && p.val > 100) return bad('set', 'Процент — не больше 100');
  if (p.r.time.from && p.r.time.to && p.r.time.to < p.r.time.from) return bad('lim', 'Конец периода раньше начала');
  if (p.r.time.ints.some(i => !i.f || !i.t || i.f >= i.t)) return bad('lim', 'В интервале времени конец должен быть позже начала');
  if (p.type === 'double' && !p.r.menu.items.length && !p.r.menu.cats.length) return bad('lim', 'Для «Удвоения блюд» выберите блюда или разделы в «Ассортименте»');
  if (p.goal.on && p.type !== 'free') p.goal.on = false;
  const isNew = p.isNew; delete p.isNew;
  if (p.type === 'free' || p.type === 'double') p.val = p.val || 1;
  if (isNew) { p.created = mkNow(); p.hist = []; D.promos.unshift(p); mkPHist(p, 'Создана', `${MK_KIND[p.kind]} · ${esc(mkPSum(p)['Размер'])} · ${esc(mkPeriod(p))}`); }
  else { const i = D.promos.findIndex(x => x.id === p.id), old = D.promos[i], a = mkPSum(old), b = mkPSum(p);
    const ch = Object.keys(b).filter(k => a[k] !== b[k]).map(k => `${k}: ${mkDiff(a[k] || '—', b[k] || '—')}`);
    p.hist = old.hist; D.promos[i] = p;
    if (!ch.length) { mkWinRemove('mkpw'); toast('Изменений нет'); return; }
    mkPHist(p, a['Статус'] !== b['Статус'] && ch.length === 1 ? (p.on ? 'Включена' : 'Выключена') : 'Изменена', ch.join('<br>')); }
  save(); mkWinRemove('mkpw'); render(); toast(isNew ? `«${esc(p.n)}» создана${p.on ? '' : ' — пока выключена, включите в списке'}` : 'Сохранено');
}

/* ═════════ 4. МАССОВЫЕ ПРОМОКОДЫ ═════════ */
let mkCT = 'active', mkCQ = '', mkCA = '';
PAGES.masscodes = () => {
  const D = mkD(), ok = mkPOk(), acts = D.promos.filter(p => p.kind === 'code' && p.codeType === 'mass');
  const all = acts.flatMap(p => p.mass.codes.map((c, i) => ({p, c, i, st: c.st === 'used' ? 'used' : (c.st === 'off' || !p.on || p.arch) ? 'off' : 'active'})));
  if (!acts.length) return ph('Массовые промокоды') + `<div class="card empty">Сначала создайте акцию с массовыми промокодами${ok ? `<div style="margin-top:12px"><button class="btn pri" onclick="location.hash='#/promos/code';setTimeout(()=>mkOpenPromo('','code','mass'),50)">Создать акцию ↗</button></div>` : ''}</div>`;
  const q = mkCQ.toUpperCase(), base = all.filter(x => (!mkCA || x.p.id === mkCA) && (!q || x.c.c.includes(q)));
  const L = base.filter(x => mkCT === 'all' || x.st === mkCT), ST = {active:'<span class="pill ok">Активный</span>', used:'<span class="pill blue">Использован</span>', off:'<span class="pill red">Отключён</span>'};
  return ph(`Массовые промокоды <span class="muted" style="font-size:16px">${nf(all.length)}</span>`, 'Уникальные коды — у каждого гостя свой. В Starter это единственный способ дать гостю персональную цену. Коды создаются в карточке акции',
    `<button class="btn" onclick="mkCSV('promokody',['Промокод','Акция','Статус','Лимит на гостя','Лимит на всех','Уже использовано'],mkCodesRows())">⤓ Экспортировать</button>${ok ? `<button class="btn pri" onclick="location.hash='#/promos/code';setTimeout(()=>mkOpenPromo('','code','mass'),50)">＋ Создать акцию ↗</button>` : ''}`)
  + (ok ? '' : noPerm('offers.edit') + '<div style="height:12px"></div>')
  + mkTabs([['active', 'Активные', base.filter(x => x.st === 'active').length], ['used', 'Использованные', base.filter(x => x.st === 'used').length], ['off', 'Отключённые', base.filter(x => x.st === 'off').length], ['all', 'Все', base.length]], mkCT, 'mkCTab')
  + `<div class="filters">${mkSearch('mkq-codes', mkCQ, 'mkCQ', 'Найти промокод')}<select class="inp" style="width:auto" onchange="mkCA=this.value;render()"><option value="">Все акции</option>${acts.map(p => `<option value="${p.id}" ${mkCA === p.id ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select></div>
  <div class="tw"><table><thead><tr><th>Промокод</th><th>Акция</th><th>Статус</th><th class="r">Лимит на гостя</th><th class="r">Лимит на всех</th><th class="r">Уже использовано</th><th></th></tr></thead><tbody>
  ${L.slice(0, 400).map(x => `<tr><td class="nowrap"><code>${esc(x.c.c)}</code> <button class="x" title="Скопировать" onclick="mkCopy('${esc(x.c.c)}')">⧉</button></td><td><a href="javascript:void 0" onclick="mkOpenPromo('${x.p.id}')">${esc(x.p.n)}</a>${x.p.on && !x.p.arch ? '' : ' <span class="small muted">· акция выключена</span>'}</td>
    <td>${ST[x.st]}</td><td class="r">${x.p.lim.guestOn ? x.p.lim.guestN : '—'}</td><td class="r">${x.p.lim.perCodeN || '—'}</td><td class="r">${x.c.used || 0}</td>
    <td>${x.st === 'used' ? '' : `<button class="btn sm" ${mkDis(ok && x.p.on && !x.p.arch)} onclick="mkCodeTog('${x.p.id}',${x.i})">${x.c.st === 'off' ? 'Включить' : 'Отключить'}</button>`}</td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Кодов нет</div>'}${L.length > 400 ? `<div class="small muted" style="padding:10px 12px">Показаны первые 400 из ${nf(L.length)} — уточните поиск</div>` : ''}</div>`;
};
function mkCTab(k) { mkCT = k; render(); }
function mkCodesRows() { const S = {active:'Активный', used:'Использован', off:'Отключён'}; return mkD().promos.filter(p => p.kind === 'code' && p.codeType === 'mass').flatMap(p => p.mass.codes.map(c => [c.c, p.n, S[c.st === 'used' ? 'used' : (c.st === 'off' || !p.on || p.arch) ? 'off' : 'active'], p.lim.guestOn ? p.lim.guestN : '', p.lim.perCodeN || '', c.used || 0])); }
function mkCodeTog(pid, i) { const p = mkPr(pid), c = p.mass.codes[i], w = c.st; c.st = c.st === 'off' ? 'active' : 'off'; mkPHist(p, 'Промокод ' + c.c, mkDiff(w === 'off' ? 'отключён' : 'активный', c.st === 'off' ? 'отключён' : 'активный')); save(); render(); }

/* ═════════ 5. РЕФЕРАЛЬНАЯ ПРОГРАММА ═════════ */
let mkRefT = 'cond';
const MK_RVARS = ['{{ favorite_dish }}', '{{ referral_promocode }}', '{{ referral_bonuses }}', '{{ referrer_bonuses }}', '{{ referral_link }}', '{{ referral_promotion }}'];
PAGES.referral = () => {
  const D = mkD(), R = D.ref, ok = mkPOk(), dis = mkDis(ok), S = SCHEMA.find(s => s.id === 'ref'), cfg = DB.cfg.ref || {};
  const fv = f => { const v = cfg[f.k]; return f.t === 'bool' ? (v ? 'да' : 'нет') : f.t === 'money' ? rub(v) : f.t === 'days' ? `${v} ${plural(v, 'день', 'дня', 'дней')}` : `${typeof v === 'number' ? nf(v) : esc(v)}${f.u ? ' ' + f.u : ''}`; };
  const refPromos = D.promos.filter(p => p.special.ref && !p.arch);
  return ph('Реферальная программа', 'Гость зовёт друга — оба получают бонусы. Условия Starter и наши правила защиты от обмана в одном месте',
    `<span class="small muted">${R.on ? 'Включена' : 'Выключена'}</span>${sw('mkrefon', R.on, (ok ? '' : 'disabled ') + 'onchange="mkRefOn(this.checked)"')}`)
  + (ok ? '' : noPerm('offers.edit') + '<div style="height:12px"></div>')
  + `<div class="note" style="margin-bottom:14px">⚖️ <span><b>Сейчас в Starter:</b> выключена, 250 / 250 баллов от 500 ₽ — <b>у нас</b> ${nf(cfg.reward)} / ${nf(cfg.reward)} бонусов после ${cfg.days} ${plural(cfg.days, 'дня', 'дней', 'дней')} с покупкой</span></div>`
  + mkTabs([['cond', 'Условия'], ['rules', 'Правила', R.rules.length]], mkRefT, 'mkRefTab')
  + (mkRefT === 'cond' ? `<div class="grid g-side"><div class="card"><h2>Условия Starter</h2><p class="small muted">Так программа настроена в Starter. Для нашего приложения работают наши правила справа</p>
      <div class="row" style="margin-top:12px"><label class="fld"><span class="mk-req">Получит клиент — тот, кто пригласил</span><div class="u-wrap"><input class="inp" id="mkr-cli" ${dis} inputmode="numeric" value="${R.cli}"><i>баллов</i></div></label>
      <label class="fld"><span class="mk-req">Получит реферал — приглашённый</span><div class="u-wrap"><input class="inp" id="mkr-refl" ${dis} inputmode="numeric" value="${R.refl}"><i>баллов</i></div></label></div>
      <label class="fld"><span class="mk-req">Минимальная сумма заказа</span><div class="u-wrap" style="max-width:260px"><input class="inp" id="mkr-min" ${dis} inputmode="numeric" value="${R.min}"><i>₽</i></div></label>
      <label class="fld"><span>Акция на первый заказ — из «реферальных» акций</span><select class="inp" id="mkr-pr" ${dis}><option value="">Без акции</option>${refPromos.map(p => `<option value="${p.id}" ${R.firstPromo === p.id ? 'selected' : ''}>${esc(p.n)}${p.on ? '' : ' · неактивна'}</option>`).join('')}</select>
        <small>Акция становится «реферальной» галочкой в её настройках — <a href="#/promos/disc">Акции ›</a></small></label>
      <div class="tog" style="margin-bottom:12px"><span><b style="font-weight:500">Показывать кнопку «Баллы за друга»</b><small class="muted" style="display:block">На главном экране, гостям с 2+ заказами</small></span>${sw('mkr-btn', R.btn, dis)}</div>
      <label class="fld"><span class="mk-req">Текст реферального сообщения</span><textarea class="inp" id="mkr-msg" ${dis} oninput="document.getElementById('mkr-w').innerHTML=pzWarn(textCheck('',this.value))">${esc(R.msg)}</textarea></label>
      <div class="mk-vars">${MK_RVARS.map(v => `<button type="button" ${dis} onclick="mkRefVar('${v}')">${v}</button>`).join('')}</div>
      <div id="mkr-w">${pzWarn(textCheck('', R.msg))}</div>
      <p class="small muted">Ссылка выглядит так: <code>kofeynaya.ru?promocode=ANNA7Q</code></p>
      ${ok ? '<div class="btns" style="margin-top:12px"><button class="btn pri" onclick="mkRefSave()">Сохранить</button></div>' : ''}</div>
    <div class="card"><div class="card-h"><h2>Наши правила</h2><span class="sp"></span><a class="btn sm" href="#/m/ref">Изменить ›</a></div>
      <p class="small muted" style="margin:0 0 10px">${esc(S ? S.d : '')}. Защита от обмана — только у нас, в Starter её нет</p>
      <dl class="kv">${(S ? S.fields : []).map(f => `<dt>${esc(f.l)}</dt><dd>${fv(f)}</dd>`).join('')}</dl></div></div>`
  : `${R.rules.map((x, i) => `<div class="mk-qa"><div class="row" style="align-items:flex-start"><label class="fld" style="flex:1"><span class="mk-req">Вопрос</span><input class="inp" ${dis} value="${esc(x.q)}" onchange="mkRefRule(${i},'q',this.value)"></label>
      <button class="x" style="flex:0;margin-top:24px" ${dis} title="Удалить блок" onclick="mkRefRuleDel(${i})">✕</button></div>
      <label class="fld" style="margin:0"><span class="mk-req">Ответ</span><textarea class="inp" ${dis} onchange="mkRefRule(${i},'a',this.value)">${esc(x.a)}</textarea></label></div>`).join('')}
    ${ok ? '<button class="btn" onclick="mkRefRuleAdd()">＋ Добавить блок</button>' : ''}<p class="small muted">Гость видит эти блоки на экране «Пригласить друга» по кнопке «Как это работает». Сохраняется сразу</p>`);
};
function mkRefTab(k) { mkRefT = k; render(); }
function mkRefOn(on) {
  const R = mkD().ref;
  modal({t: on ? 'Включить реферальную программу?' : 'Выключить реферальную программу?', body:`<p style="margin-top:0">${on ? 'Гости увидят «Пригласить друга», а приглашённые получат бонусы по нашим правилам' : 'Новые приглашения перестанут работать. Друзья, которые уже в пути, получат бонусы по старым условиям'}</p>`,
    ok: on ? 'Включить' : 'Выключить', cls: on ? 'pri' : 'red', onOk:() => { R.on = on; audit('Реферальная программа', mkDiff(on ? 'выключена' : 'включена', on ? 'включена' : 'выключена')); save(); render(); }});
  const c = document.getElementById('mkrefon'); if (c) c.checked = R.on;
}
function mkRefVar(v) { const e = document.getElementById('mkr-msg'), a = e.selectionStart ?? e.value.length; e.value = e.value.slice(0, a) + v + e.value.slice(e.selectionEnd ?? a); e.focus(); e.setSelectionRange(a + v.length, a + v.length); }
function mkRefSave() {
  const R = mkD().ref, n = id => parseInt(val(id).replace(/\D/g, ''), 10);
  const nv = {cli:n('mkr-cli'), refl:n('mkr-refl'), min:n('mkr-min'), firstPromo:val('mkr-pr'), btn:val('mkr-btn'), msg:nbspFix(val('mkr-msg'))};
  if (![nv.cli, nv.refl, nv.min].every(x => Number.isInteger(x) && x >= 0)) { toast('Баллы и сумма — целые числа от 0'); return; }
  if (nv.msg.length < 10) { toast('Напишите текст сообщения'); return; }
  if (!nv.msg.includes('{{ referral_link }}') && !nv.msg.includes('{{ referral_promocode }}')) { toast('В тексте нужна ссылка {{ referral_link }} или промокод {{ referral_promocode }} — иначе друг не сможет прийти'); return; }
  const L = {cli:'Получит клиент', refl:'Получит реферал', min:'Мин. сумма', firstPromo:'Акция на первый заказ', btn:'Кнопка «Баллы за друга»', msg:'Текст'};
  const show = (k, v) => k === 'firstPromo' ? ((mkPr(v) || {}).n || 'без акции') : k === 'btn' ? (v ? 'да' : 'нет') : String(v);
  const ch = Object.keys(nv).filter(k => R[k] !== nv[k]).map(k => `${L[k]}: ${mkDiff(show(k, R[k]), show(k, nv[k]))}`);
  if (!ch.length) { toast('Изменений нет'); return; }
  Object.assign(R, nv); audit('Реферальная программа: условия', ch.join('; ')); save(); render(); toast('Условия сохранены');
}
function mkRefRule(i, k, v) { const x = mkD().ref.rules[i], w = x[k]; if (w === v.trim()) return; x[k] = nbspFix(v.trim()); audit('Реферальная программа: правила', `${k === 'q' ? 'Вопрос' : 'Ответ'}: ${mkDiff(w, x[k])}`); save(); toast('Сохранено'); }
function mkRefRuleAdd() { mkD().ref.rules.push({q:'Новый вопрос', a:''}); audit('Реферальная программа: правила', '＋ блок'); save(); render(); }
function mkRefRuleDel(i) { const R = mkD().ref, x = R.rules[i]; modal({t:'Удалить блок?', body:`<p style="margin-top:0">«${esc(x.q)}»</p>`, ok:'Удалить', cls:'red', onOk:() => { R.rules.splice(i, 1); audit('Реферальная программа: правила', `удалён блок «${esc(x.q)}»`); save(); render(); }}); }

/* ═════════ 6. СТОРИС ═════════ */
let mkST = 'pub';
const MK_SPLACE = ['Сайт и приложение', 'Только приложение', 'Только сайт'];
function mkStStat(s) {
  if (s.st === 'draft') return {o:0, i:0, ip:0, sh:0, dp:0, dn:0};
  const h = mkH('st' + s.id), o = 400 + h % 2600, ip = 6 + (h >>> 5) % 22, n = s.slides.length, dp = n > 1 ? 45 + (h >>> 9) % 50 : 100;
  return {o, i:Math.round(o * ip / 100), ip, sh:(h >>> 13) % 40, dp, dn:Math.max(1, Math.round(n * dp / 100))};
}
PAGES.stories = () => {
  const D = mkD(), ok = can('content.edit'), cnt = k => D.stories.filter(s => s.st === k).length, L = D.stories.filter(s => s.st === mkST);
  const pub = s => s.st === 'pub' ? `<span class="pill ok">${s.place === 'Сайт и приложение' ? 'На сайте, в приложении' : s.place === 'Только сайт' ? 'На сайте' : 'В приложении'}</span>` : s.st === 'arch' ? '<span class="pill">В архиве</span>' : '<span class="pill amb">Не опубликована</span>';
  return ph('Сторис', 'Кружки сверху экрана «Турбо» и на сайте. До 10 слайдов 9:16, на слайде — кнопка, которая ведёт в нужный экран', ok ? '<button class="btn pri" onclick="mkStEdit()">＋ Создать сторис</button>' : '')
  + (ok ? '' : noPerm('content.edit') + '<div style="height:12px"></div>')
  + mkTabs([['pub', 'Опубликованные', cnt('pub')], ['draft', 'Неопубликованные', cnt('draft')], ['arch', 'Архив', cnt('arch')]], mkST, 'mkSTab')
  + `<div class="tw"><table><thead><tr><th>Название</th><th class="r">Открытия</th><th class="r">Взаимодействия</th><th class="r">Поделились</th><th class="r">Глубина просмотра</th><th>Публикация</th><th>Дата создания</th><th></th></tr></thead><tbody>
  ${L.map(s => { const x = mkStStat(s); return `<tr class="click" onclick="mkStEdit('${s.id}')"><td><div class="cell-n">${s.slides[0] && s.slides[0].img ? `<img class="mk-sthumb" src="${esc(s.slides[0].img)}" alt="">` : '<span class="mk-sthumb"></span>'}<div><b>${esc(s.t)}</b><span class="small muted">${s.slides.length} ${plural(s.slides.length, 'слайд', 'слайда', 'слайдов')}</span></div></div></td>
    <td class="r">${nf(x.o)}</td><td class="r">${nf(x.i)} <span class="small muted">${x.ip}%</span></td><td class="r">${nf(x.sh)}</td><td class="r nowrap">${x.dp}% <span class="small muted">${x.dn} из ${s.slides.length}</span></td>
    <td>${pub(s)}</td><td class="nowrap small">${mkDT(s.at)}</td>
    <td class="nowrap" onclick="event.stopPropagation()"><button class="x" title="Скопировать ссылку" onclick="mkCopy('https://kofeynaya.ru/stories/${esc(s.seo.slug)}')">🔗</button>
      <details class="mk-dd r" style="display:inline-block"><summary class="mk-dots">…</summary><div class="mk-pop" style="min-width:180px">
        <button class="it" onclick="mkStEdit('${s.id}')">✏️ Редактировать</button>
        ${ok ? (s.st === 'arch' ? `<button class="it" onclick="mkStMove('${s.id}','draft')">↩︎ Вернуть из архива</button>` : `<button class="it" onclick="mkStMove('${s.id}','arch')">🗄 Архивировать</button>`) + (s.st === 'pub' ? `<button class="it" onclick="mkStMove('${s.id}','draft')">⏸ Снять с публикации</button>` : '') : ''}
        <button class="it" onclick="mkCopy('https://kofeynaya.ru/stories/${esc(s.seo.slug)}')">🔗 Копировать ссылку</button></div></details></td></tr>`; }).join('')}
  </tbody></table>${L.length ? '' : `<div class="empty">${mkST === 'arch' ? 'Архив пуст' : mkST === 'draft' ? 'Черновиков нет' : 'Опубликованных сторис нет'}</div>`}</div>`;
};
function mkSTab(k) { mkST = k; render(); }
function mkStMove(id, st) { const s = mkD().stories.find(x => x.id === id), T = {pub:'опубликована', draft:'не опубликована', arch:'в архиве'}, w = s.st; s.st = st; audit(`Сторис «${s.t}»`, mkDiff(T[w], T[st])); save(); render(); toast(`«${esc(s.t)}» — ${T[st]}`); }
let mkSE = null, mkSEi = 0;
function mkStEdit(id) {
  const s = id ? mkD().stories.find(x => x.id === id) : null;
  mkSE = s ? clone(s) : {id:'st' + Date.now().toString(36), t:'', place:MK_SPLACE[0], st:'draft', at:mkNow(), slides:[], seo:{slug:'', title:'', d:''}, isNew:1};
  mkSEi = 0; const snap = JSON.stringify(mkSE);
  mkGuard('mkstw', () => JSON.stringify(mkSE) !== snap, () => mkStSave(mkSE.st), 'Изменения в сторис не сохранены'); mkStDraw();
}
function mkStDraw() {
  const s = mkSE, ok = can('content.edit'), dis = mkDis(ok), cur = s.slides[mkSEi];
  const html = `${ok ? '' : noPerm('content.edit')}
  <div class="row"><label class="fld" style="flex:2"><span class="mk-req">Название — видно под кружком</span><input class="inp" ${dis} maxlength="40" value="${esc(s.t)}" oninput="mkSE.t=this.value"></label>
    <label class="fld"><span>Где показывать</span><select class="inp" ${dis} onchange="mkSE.place=this.value">${MK_SPLACE.map(p => `<option ${p === s.place ? 'selected' : ''}>${p}</option>`).join('')}</select></label></div>
  <div class="card-h" style="margin:4px 0 8px"><h3>Слайды · ${s.slides.length}/10</h3><span class="sp"></span>${ok && s.slides.length < 10 ? `<label class="btn sm">📷 Загрузить<input type="file" accept="image/*" hidden onchange="mkStUp(this,-1)"></label><button class="btn sm" onclick="mkSE.slides.push({img:'',btn:null});mkSEi=mkSE.slides.length-1;mkStDraw()">＋ По адресу</button>` : ''}</div>
  ${s.slides.length ? `<div class="mk-slides">${s.slides.map((x, i) => `<div class="mk-slide ${i === mkSEi ? 'on' : ''}" onclick="mkSEi=${i};mkStDraw()"><div class="pic" style="background-image:url('${esc(x.img)}')"><span class="n">${i + 1}</span>${x.btn ? `<em>${esc(x.btn.t)}</em>` : ''}</div>
      <div class="btns" onclick="event.stopPropagation()"><button class="btn sm" ${ok && i ? '' : 'disabled'} title="Раньше" onclick="mkStMv(${i},-1)">←</button><button class="btn sm" ${ok && i < s.slides.length - 1 ? '' : 'disabled'} title="Позже" onclick="mkStMv(${i},1)">→</button><button class="btn sm" ${dis} title="Удалить" onclick="mkSE.slides.splice(${i},1);mkSEi=Math.max(0,Math.min(mkSEi,mkSE.slides.length-1));mkStDraw()">🗑</button></div></div>`).join('')}</div>`
    : '<div class="card empty">Слайдов пока нет. Картинка 9:16 — PNG или JPG. Загрузите с компьютера или вставьте адрес</div>'}
  ${cur ? `<div class="grid mk-sg" style="margin-top:16px"><div class="card"><h3>Слайд ${mkSEi + 1}</h3>
      <label class="fld"><span>Адрес картинки</span><input class="inp" ${dis} value="${esc(cur.img.startsWith('data:') ? '' : cur.img)}" placeholder="${cur.img.startsWith('data:') ? 'Загружена с компьютера' : 'img/bn1.jpg или https://…'}" onchange="mkSE.slides[mkSEi].img=this.value.trim();setTimeout(mkStDraw,250)"></label>
      ${ok ? `<label class="btn sm" style="margin-bottom:12px">🔁 Заменить файлом<input type="file" accept="image/*" hidden onchange="mkStUp(this,mkSEi)"></label>` : ''}
      <div class="tog" style="margin-bottom:10px"><b style="font-weight:500">Кнопка на слайде</b>${sw('mkse-btn', !!cur.btn, dis + ' onchange="mkSE.slides[mkSEi].btn=this.checked?{t:\'Смотреть\',link:LINKS[1]}:null;mkStDraw()"')}</div>
      ${cur.btn ? `<div class="row"><label class="fld"><span>Текст кнопки</span><input class="inp" ${dis} maxlength="24" value="${esc(cur.btn.t)}" oninput="mkSE.slides[mkSEi].btn.t=this.value.trim()"></label>
        <label class="fld"><span>Куда ведёт</span><select class="inp" ${dis} onchange="mkSE.slides[mkSEi].btn.link=this.value">${LINKS.map(l => `<option ${l === cur.btn.link ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>` : ''}</div>
    <div><div class="mk-ph9" style="background-image:url('${esc(cur.img)}')"><div class="bars">${s.slides.map((_, i) => `<i class="${i <= mkSEi ? 'on' : ''}"></i>`).join('')}</div>${cur.btn ? `<div class="cta">${esc(cur.btn.t)}</div>` : ''}</div><p class="small muted">Так увидит гость</p></div></div>` : ''}
  <div class="card" style="margin-top:16px"><div class="card-h"><h3>SEO настройки</h3><span class="sp"></span><button class="btn sm" onclick="mkStSeo()">Изменить</button></div>
    <dl class="kv"><dt>Ссылка</dt><dd>kofeynaya.ru/stories/${esc(s.seo.slug || mkTrans(s.t || 'story'))}</dd><dt>Title</dt><dd>${esc(s.seo.title || s.t) || '—'}</dd><dt>Description</dt><dd>${esc(s.seo.d) || '—'}</dd></dl></div>
  ${ok ? `<div class="btns" style="margin-top:16px"><button class="btn pri" onclick="mkStSave('pub')">${s.st === 'pub' ? 'Опубликовать изменения' : 'Опубликовать'}</button><button class="btn" onclick="mkStSave(${s.st === 'pub' ? "'pub'" : "'draft'"},1)">${s.st === 'pub' ? 'Сохранить' : 'Сохранить черновик'}</button>${s.isNew ? '' : `<button class="btn ghost" onclick="mkStSave('arch')">🗄 В архив</button>`}</div>` : ''}`;
  mkWin(`<div class="dr-h"><div style="flex:1;min-width:0"><h2>${s.isNew ? 'Новая сторис' : esc(s.t)}</h2><div class="small muted">${s.isNew ? 'До 10 картинок 9:16' : `создана ${mkDT(s.at)}`}</div></div><button class="cls" onclick="mkClose('mkstw')" aria-label="Закрыть">${X_SVG}</button></div><div class="dr-b">${html}</div>`, 'mkstw', {ov:'ov', box:'dr'});
}
function mkStMv(i, d) { const a = mkSE.slides, j = i + d; [a[i], a[j]] = [a[j], a[i]]; mkSEi = j; mkStDraw(); }
function mkStUp(inp, at) {
  const f = inp.files[0]; if (!f) return; if (f.size > 10 * 1048576) { toast('Картинка больше 10 МБ'); return; }
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 900 / im.height, 520 / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); const url = c.toDataURL('image/jpeg', .78);
    if (at < 0) { mkSE.slides.push({img:url, btn:null}); mkSEi = mkSE.slides.length - 1; } else mkSE.slides[at].img = url;
    mkStDraw(); toast(Math.abs(im.width / im.height - 9 / 16) > .08 ? 'Загрузил. Картинка не 9:16 — края обрежутся' : 'Загрузил'); }; im.src = r.result; };
  r.readAsDataURL(f);
}
function mkStSeo() {
  const s = mkSE, slug = s.seo.slug || mkTrans(s.t || 'story');
  modal({t:'SEO настройки', body:`<label class="fld"><span>Ссылка — kofeynaya.ru/stories/…</span><input class="inp" id="mks-slug" value="${esc(slug)}"><small>Если поменять, старая ссылка перестанет работать</small></label>
    <label class="fld"><span id="mks-tl">Title · для поиска и соцсетей · ${(s.seo.title || s.t).length}/60</span><input class="inp" id="mks-t" maxlength="60" value="${esc(s.seo.title || s.t)}" oninput="document.getElementById('mks-tl').textContent='Title · для поиска и соцсетей · '+this.value.length+'/60'"></label>
    <label class="fld"><span id="mks-dl">Description · ${s.seo.d.length}/155</span><textarea class="inp" id="mks-d" maxlength="155" oninput="document.getElementById('mks-dl').textContent='Description · '+this.value.length+'/155'">${esc(s.seo.d)}</textarea></label>`,
    ok:'Готово', onOk:() => { const sl = val('mks-slug').toLowerCase(); if (!/^[a-z0-9-]{2,60}$/.test(sl)) { toast('Ссылка: латиница, цифры и дефис, от 2 знаков'); return false; }
      if (mkD().stories.some(x => x.id !== s.id && x.seo.slug === sl)) { toast('Такая ссылка уже у другой сторис'); return false; }
      s.seo = {slug:sl, title:val('mks-t'), d:val('mks-d')}; setTimeout(mkStDraw, 0); }});
}
function mkStSave(st, stay) {
  const s = mkSE, D = mkD();
  if (s.t.trim().length < 2) { toast('Назовите сторис'); return; }
  if (st === 'pub' && !s.slides.length) { toast('Добавьте хотя бы один слайд'); return; }
  if (s.slides.some(x => !x.img)) { toast('У каждого слайда должна быть картинка'); return; }
  if (s.slides.some(x => x.btn && !x.btn.t)) { toast('Напишите текст кнопки'); return; }
  s.t = s.t.trim(); if (!s.seo.slug) s.seo.slug = mkTrans(s.t); if (!s.seo.title) s.seo.title = s.t;
  if (D.stories.some(x => x.id !== s.id && x.seo.slug === s.seo.slug)) s.seo.slug += '-' + s.id.slice(-3);
  const isNew = s.isNew; delete s.isNew; const i = D.stories.findIndex(x => x.id === s.id), old = i >= 0 ? D.stories[i] : null, T = {pub:'опубликована', draft:'черновик', arch:'в архиве'};
  const ch = []; if (old) { if (old.t !== s.t) ch.push('название: ' + mkDiff(old.t, s.t)); if (old.slides.length !== s.slides.length) ch.push('слайдов: ' + mkDiff(old.slides.length, s.slides.length)); else if (JSON.stringify(old.slides) !== JSON.stringify(s.slides)) ch.push('слайды изменены');
    if (old.st !== st) ch.push(mkDiff(T[old.st], T[st])); if (old.place !== s.place) ch.push('место: ' + mkDiff(old.place, s.place)); if (JSON.stringify(old.seo) !== JSON.stringify(s.seo)) ch.push('SEO изменено'); }
  s.st = st; if (i >= 0) D.stories[i] = clone(s); else D.stories.unshift(clone(s));
  if (!save()) return;
  audit(isNew ? 'Новая сторис' : 'Сторис изменена', `«${esc(s.t)}» · ${isNew ? T[st] + ' · ' + s.slides.length + ' сл.' : ch.join('; ') || 'без изменений'}`);
  save(); mkST = st; mkWinRemove('mkstw'); render(); toast(st === 'pub' ? `«${esc(s.t)}» опубликована` : st === 'arch' ? 'Сторис в архиве' : 'Черновик сохранён');
}

/* ═════════ 7. ВНЕШНИЙ МАРКЕТИНГ ═════════ */
const MK_EXT = [['none', 'Нет', 'Starter работает сам, события никуда не уходят'], ['mindbox', 'Mindbox', 'События, пуши и in-app по событиям, аналитика'], ['remarked', 'ReMarked', 'События корзины и заказа, пуши по событиям, аналитика'], ['own', 'Свой сервис лояльности', 'Наш backend: события Starter → наши механики']];
let mkEX = null;
PAGES.external = () => {
  const E = mkD().ext, ok = can('system'), dis = mkDis(ok); if (!mkEX) mkEX = E.k;
  const key = l => `<label class="fld"><span>${l}</span><input class="inp" disabled value="•••••••• хранится на сервере"><small>Ключи в бэк-офис не вводятся и в браузер не попадают — их кладёт разработчик в секреты сервера</small></label>`;
  const k = mkEX;
  return ph('Внешний маркетинг', 'Маркетинговая платформа, которой Starter отдаёт события приложения и сайта: вход, корзина, заказ. Это штатная точка, через которую можно подключить наши механики к Starter')
  + (ok ? '' : noPerm('system') + '<div style="height:12px"></div>')
  + `<div class="card"><h2>Маркетинговая платформа</h2><div class="mk-pick" style="margin-top:12px">${MK_EXT.map(([v, t, d]) => `<label class="${k === v ? 'on' : ''}"><input type="radio" name="mkext" ${k === v ? 'checked' : ''} ${dis} onchange="mkEX='${v}';render()"><span><b>${t}${E.k === v ? ' <span class="pill ok">сейчас</span>' : ''}</b><small>${d}</small></span></label>`).join('')}</div></div>
  ${k === 'mindbox' ? `<div class="card"><h3>Mindbox</h3><p class="small muted">Отслеживание событий (вход, авторизация…), push и in-app в ответ на события, сбор данных для аналитики</p>
    <label class="fld" style="max-width:340px"><span>Адрес API</span><select class="inp" id="mkx-api" ${dis}>${['api.mindbox.ru', 'api.s.mindbox.ru'].map(a => `<option ${E.mbApi === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
    <div class="tw"><table><thead><tr><th>Точка интеграции</th><th>Системное имя</th><th>Ключ</th></tr></thead><tbody>${[['web', 'Сайт'], ['ios', 'iOS'], ['android', 'Android'], ['back', 'Операции Backend']].map(([kk, t]) => `<tr><td>${t}</td><td><input class="inp" id="mkx-${kk}" ${dis} value="${esc(E.mb[kk])}"></td><td class="small muted nowrap">🔒 хранится на сервере</td></tr>`).join('')}</tbody></table></div></div>`
  : k === 'remarked' ? `<div class="card"><h3>ReMarked</h3><p class="small muted">События: вход, изменение корзины, оформление заказа, нажатие на контакт ресторана. Пуши по событиям и аналитика</p>${key('Ключ интеграции')}</div>`
  : k === 'own' ? `<div class="card"><h3>Свой сервис лояльности — наш backend</h3>
    <div class="note blue" style="margin:8px 0 12px">💡 <span><b>Это и есть путь подключить наши механики к Starter.</b> Персональные цены, предложение дня, бонусы за ритм и «каждый 6-й» должны посчитаться <b>до оплаты</b>. В публичном POS-Gateway такого интерфейса нет — просим Starter подключить нас как внешнюю платформу (как Mindbox) с синхронным ответом на событие корзины</span></div>
    <ol class="small" style="margin:0 0 12px;padding-left:18px;line-height:1.7"><li>Гость меняет корзину в Starter → событие уходит к нам</li><li>Наш движок считает выгоду (Quote): маржа, бюджет, лимиты, одна лучшая выгода на строку</li><li>Starter показывает цену и проводит оплату → мы фиксируем (Commit), бонусы — в одном балансе</li><li>Возврат → Refund, экономия и бонусы пересчитываются</li></ol>
    <label class="fld"><span>Адрес нашего сервиса</span><input class="inp" id="mkx-url" ${dis} value="${esc(E.own.url)}"></label>
    <div class="fld"><span>Какие события принимать</span><div class="mk-opt">${[['login', 'Вход и авторизация'], ['cart', 'Изменение корзины — нужен ответ с ценой до оплаты'], ['order', 'Оформление и оплата заказа'], ['contact', 'Нажатие на контакт кофейни']].map(([kk, t]) => `<label><input type="checkbox" id="mkx-ev-${kk}" ${E.own.ev[kk] ? 'checked' : ''} ${dis}><span>${t}</span></label>`).join('')}</div></div>
    ${key('Ключ подписи событий')}
    <p class="small muted" style="margin:0">Не заменяем действующий webhook Starter → iiko и не отправляем заказы в iiko второй раз. Вопросы к Starter — раздел 15 документа передачи</p></div>`
  : `<div class="card empty">Платформа не подключена — события Starter никуда не уходят</div>`}
  ${ok ? `<div class="btns" style="margin-top:16px"><button class="btn pri" onclick="mkExtSave()">Сохранить</button>${mkEX !== E.k ? `<button class="btn" onclick="mkEX=null;render()">Отменить выбор</button>` : ''}</div>` : ''}`;
};
function mkExtSave() {
  const E = mkD().ext, T = Object.fromEntries(MK_EXT.map(x => [x[0], x[1]])), ch = [];
  if (E.k !== mkEX) ch.push('платформа: ' + mkDiff(T[E.k], T[mkEX]));
  if (mkEX === 'mindbox') { const a = val('mkx-api'); if (a !== E.mbApi) { ch.push('API: ' + mkDiff(E.mbApi, a)); E.mbApi = a; } ['web', 'ios', 'android', 'back'].forEach(k => { const v = val('mkx-' + k); if (v !== E.mb[k]) { ch.push(`${k}: ${mkDiff(E.mb[k], v)}`); E.mb[k] = v; } }); }
  if (mkEX === 'own') { const u = val('mkx-url'); if (!/^https:\/\/[^\s/]+\.[^\s]+$/.test(u)) { toast('Адрес сервиса — https://…'); return; } if (u !== E.own.url) { ch.push('адрес: ' + mkDiff(E.own.url, u)); E.own.url = u; }
    ['login', 'cart', 'order', 'contact'].forEach(k => { const v = val('mkx-ev-' + k); if (v !== E.own.ev[k]) { ch.push(`событие ${k}: ${v ? 'вкл' : 'выкл'}`); E.own.ev[k] = v; } }); }
  if (!ch.length) { toast('Изменений нет'); return; }
  E.k = mkEX; audit('Внешний маркетинг', ch.join('; ')); save(); render(); toast('Сохранено');
}

/* ═════════ 8. МАРКЕТИНГОВЫЕ ИСТОЧНИКИ ═════════ */
const MK_SRC = [
  ['SEO', 'yandex', 'organic', '(not set)', 9], ['SEO', 'google', 'organic', '(not set)', 4], ['SEO', 'yandex.maps', 'referral', 'kartochka', 3],
  ['SMM', 'vk', 'social', 'osen_menu', 2], ['SMM', 'telegram', 'social', 'kanal_kofeynaya', 2], ['SMM', 'vk', 'social', 'konkurs_noyabr', 1],
  ['Таргетированная реклама', 'vk_ads', 'cpc', 'dostavka_centr', 1], ['Таргетированная реклама', 'yandex_direct', 'cpc', 'zavtraki', 1],
];
let mkSrcPer = '30', mkSrcCmp = false, mkSrcShop = '', mkSrcSplit = false, mkSrcOpen = {}, mkSrcFrom = '', mkSrcTo = '';
let _mkSrcData = null;
function mkSrcData() {
  if (_mkSrcData) return _mkSrcData;
  const out = [], today = new Date(isoDay()).getTime();
  for (let d = 0; d < 180; d++) MK_SRC.forEach((s, li) => { const h = mkH(`src${d}|${li}`), n = h % 100 < s[4] * 3.2 ? 1 + ((h >>> 8) % 100 < 12) : 0;
    for (let j = 0; j < n; j++) { const hh = mkH(`o${d}|${li}|${j}`); out.push({day:today - d * 864e5, li, shop:'Кофейная ' + [1, 2, 3, 4, 5, 5, 5, 7][hh % 8], isNew:(hh >>> 4) % 100 < 38, sum:600 + ((hh >>> 9) % 110) * 10, cli:'c' + (hh >>> 12) % 260}); } });
  return (_mkSrcData = out);
}
function mkSrcRange() {
  const t = new Date(isoDay()).getTime();
  if (mkSrcPer === 'custom' && mkSrcFrom && mkSrcTo) { const a = new Date(mkSrcFrom).getTime(), b = new Date(mkSrcTo).getTime(); return [Math.min(a, b), Math.max(a, b)]; }
  const n = +mkSrcPer || 30; return [t - (n - 1) * 864e5, t];
}
function mkSrcAgg(a, b) {
  const rows = mkSrcData().filter(o => o.day >= a && o.day <= b && (!mkSrcShop || o.shop === mkSrcShop)), T = {};
  rows.forEach(o => { const s = MK_SRC[o.li], keys = [s[0], s[0] + '›' + s[1], s[0] + '›' + s[1] + '›' + s[2], s[0] + '›' + s[1] + '›' + s[2] + '›' + s[3], '∑'];
    keys.forEach(k => { const x = T[k] || (T[k] = {o:0, c:new Set(), r:0, on:0, oc:0, rn:0, rc:0}); x.o++; x.c.add(o.cli); x.r += o.sum; if (o.isNew) { x.on++; x.rn += o.sum; } else { x.oc++; x.rc += o.sum; } }); });
  return T;
}
PAGES.sources = () => {
  const [a, b] = mkSrcRange(), len = Math.round((b - a) / 864e5) + 1, T = mkSrcAgg(a, b), P = mkSrcCmp ? mkSrcAgg(a - len * 864e5, a - 864e5) : null;
  const tree = []; const seen = new Set();
  MK_SRC.forEach(s => { [s[0], s[0] + '›' + s[1], s[0] + '›' + s[1] + '›' + s[2], s[0] + '›' + s[1] + '›' + s[2] + '›' + s[3]].forEach((k, lv) => { if (!seen.has(k) && T[k]) { seen.add(k); tree.push({k, lv, name: k.split('›')[lv]}); } }); });
  const vis = r => r.k.split('›').slice(0, r.lv).every((_, i, arr) => mkSrcOpen[r.k.split('›').slice(0, i + 1).join('›')]);
  const dl = (cur, prev) => { if (!P) return ''; if (!prev) return cur ? ' <span class="mk-dl up">новое</span>' : ''; const p = Math.round((cur - prev) / prev * 100); return ` <span class="mk-dl ${p >= 0 ? 'up' : 'dn'}">${p >= 0 ? '+' : ''}${p}%</span>`; };
  const cells = (k, x) => { const p = P && P[k]; return mkSrcSplit ? `<td class="r">${nf(x.on)}${dl(x.on, p && p.on)}</td><td class="r">${nf(x.oc)}${dl(x.oc, p && p.oc)}</td><td class="r">${nf(x.c.size)}</td><td class="r nowrap">${rub(x.rn)}</td><td class="r nowrap">${rub(x.rc)}</td>`
    : `<td class="r">${nf(x.o)}${dl(x.o, p && p.o)}</td><td class="r">${nf(x.c.size)}${dl(x.c.size, p && p.c.size)}</td><td class="r nowrap">${rub(x.r)}${dl(x.r, p && p.r)}</td>`; };
  const tot = T['∑'] || {o:0, c:new Set(), r:0, on:0, oc:0, rn:0, rc:0};
  return ph('Маркетинговые источники', 'Только заказы с сайта с UTM-метками — заказы из приложения сюда не попадают. Канал › Источник › Medium › Campaign. Цифры вымышленные',
    `<button class="btn" onclick="mkSrcExport()">⤓ Экспортировать</button>`)
  + `<div class="filters"><select class="inp" style="width:auto" onchange="mkSrcPer=this.value;render()">${[['7', '7 дней'], ['30', '30 дней'], ['90', '90 дней'], ['custom', '📅 Свой период']].map(([k, t]) => `<option value="${k}" ${mkSrcPer === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
    ${mkSrcPer === 'custom' ? `<input class="inp" type="date" style="width:auto" value="${mkSrcFrom}" max="${isoDay()}" onchange="mkSrcFrom=this.value;render()"><input class="inp" type="date" style="width:auto" value="${mkSrcTo}" max="${isoDay()}" onchange="mkSrcTo=this.value;render()">` : ''}
    <label class="chk"><input type="checkbox" ${mkSrcCmp ? 'checked' : ''} onchange="mkSrcCmp=this.checked;render()"> Сравнивать периоды</label>
    <select class="inp" style="width:auto" onchange="mkSrcShop=this.value;render()"><option value="">Все точки продаж</option>${DB.shops.map(s => `<option ${mkSrcShop === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select>
    <label class="chk"><input type="checkbox" ${mkSrcSplit ? 'checked' : ''} onchange="mkSrcSplit=this.checked;render()"> Разделять на новых и текущих</label>
    ${mkSrcPer !== '30' || mkSrcCmp || mkSrcShop || mkSrcSplit ? `<button class="btn ghost sm" onclick="mkSrcPer='30';mkSrcCmp=false;mkSrcShop='';mkSrcSplit=false;render()">Сбросить фильтры</button>` : ''}</div>
  <p class="small muted" style="margin:-4px 0 10px">${dLong(isoDay(new Date(a)))} — ${dLong(isoDay(new Date(b)))}${P ? ` · сравниваем с ${len} ${plural(len, 'днём', 'днями', 'днями')} до этого` : ''}</p>
  <div class="tw"><table class="mk-tree"><thead><tr><th>Канал › Источник › Medium › Campaign</th>${mkSrcSplit ? '<th class="r">Заказы новых</th><th class="r">Заказы текущих</th><th class="r">Клиенты</th><th class="r">Доход новых</th><th class="r">Доход текущих</th>' : '<th class="r">Заказы</th><th class="r">Клиенты</th><th class="r">Доход</th>'}</tr></thead><tbody>
  ${tree.filter(vis).map(r => { const leaf = r.lv === 3; return `<tr class="lv${r.lv}"><td style="padding-left:${12 + r.lv * 20}px">${leaf ? '<span style="display:inline-block;width:22px"></span>' : `<button class="tg" onclick="mkSrcOpen['${esc(r.k)}']=!mkSrcOpen['${esc(r.k)}'];render()">${mkSrcOpen[r.k] ? '▾' : '▸'}</button>`}${esc(r.name)}</td>${cells(r.k, T[r.k])}</tr>`; }).join('')}
  <tr class="tot"><td>Итого</td>${cells('∑', tot)}</tr></tbody></table>${tree.length ? '' : '<div class="empty">За этот период заказов с метками нет</div>'}</div>`;
};
function mkSrcExport() {
  const [a, b] = mkSrcRange(), T = mkSrcAgg(a, b), rows = [];
  MK_SRC.forEach(s => { const k = s.slice(0, 4).join('›'); if (T[k]) rows.push([s[0], s[1], s[2], s[3], T[k].o, T[k].c.size, T[k].r, T[k].on, T[k].oc]); });
  mkCSV('istochniki', ['Канал', 'Источник', 'Medium', 'Campaign', 'Заказы', 'Клиенты', 'Доход', 'Заказы новых', 'Заказы текущих'], rows);
}

/* ═════════ 9. ТРИГГЕРНЫЕ РАССЫЛКИ (Starter §15) + наши авто-сообщения ═════════
   Флаги и числа, которые есть в SCHEMA 'triggers', — в DB.cfg.triggers; тексты и остальное — в DB.mk.trig; наши — DB.autos.
   Всё правится в черновике mkTD и сохраняется кнопкой «Сохранить» */
const MK_STS = {
  delivery:[['acc', 'Принят', 'Заказ №{{ORDER_NUMBER}} принят', 'Привезём к {{DELIVERY_TIME}}'], ['cook', 'Готовится', 'Готовим заказ', 'Скоро передадим курьеру'], ['go', 'Доставляется', 'Курьер уже едет', 'Будет у тебя к {{DELIVERY_TIME}}'],
    ['near', 'Курьер рядом', 'Курьер рядом', 'Будет минут через 10', 'За ~10 минут. Работает с Стартер Логист, Яндекс Доставкой, White Cabs, One Sync или Купером'], ['door', 'Курьер у дома', 'Курьер у дома', 'Встречай — заказ уже у двери', 'За ~3 минуты, при тех же интеграциях'],
    ['done', 'Доставлен', 'Приятного аппетита!', 'Заказ №{{ORDER_NUMBER}} доставлен'], ['cancel', 'Отменён', 'Заказ отменён', 'Деньги вернутся на карту •• {{USER_LAST_FOUR_DIGITS}}']],
  pickup:[['acc', 'Принят', 'Заказ №{{ORDER_NUMBER}} принят', 'Приготовим к {{DELIVERY_TIME}}'], ['cook', 'Готовится', 'Готовим заказ', 'Скоро будет готово'], ['ready', 'Готов', 'Заказ готов ☕', 'Забирай на стойке — назови номер {{ORDER_NUMBER}}'],
    ['done', 'Выдан', 'Приятного аппетита!', 'Спасибо, что заглянул'], ['cancel', 'Отменён', 'Заказ отменён', 'Деньги вернутся на карту •• {{USER_LAST_FOUR_DIGITS}}']],
  table:[['acc', 'Принят', 'Заказ №{{ORDER_NUMBER}} принят', 'Скоро принесём к столику'], ['cook', 'Готовится', 'Готовим заказ', 'Уже почти'], ['ready', 'Готов', 'Несём заказ', 'Приятного аппетита!'],
    ['cancel', 'Отменён', 'Заказ отменён', 'Деньги вернутся на карту •• {{USER_LAST_FOUR_DIGITS}}']],
};
const MK_STW = {delivery:'Доставка', pickup:'Самовывоз', table:'Из зала'};
const MK_TVARS = ['{{bonuses}}', '{{ORDER_NUMBER}}', '{{ORDER_CODE}}', '{{DELIVERY_TIME}}', '{{USER_LAST_FOUR_DIGITS}}'];
const MK_TCFG = ['winback', 'winbackDays', 'winbackBon', 'balPush', 'review', 'reviewEvery', 'bdPush'];
function mkTrig() {
  const D = mkD();
  if (!D.trig) {
    const st = {}; Object.entries(MK_STS).forEach(([w, L]) => { st[w] = {on:true}; L.forEach(([k, , t, b]) => st[w][k] = {t, b}); });
    /* тексты Starter — как сейчас в CRM (на «вы»: проверка текста подсветит) */
    D.trig = {review:{min:30, t:'Вам понравилось❓', b:'Нам важно ваше мнение — расскажите о ваших впечатлениях от заказа'},
      bal:{min:4320, minBal:100, t:'У вас есть {{bonuses}} бонусов', b:'Потратьте их на следующий заказ: 1 бонус = 1 ₽'},
      bd:{days:0, t:'С днём рождения! 🎂', b:'Загляни в кофейную — для тебя скидка в день рождения'},
      win:{t:'Вам 200 бонусов 💰', b:'Мы начислили вам 200 бонусов, потому что мы соскучились'}, st};
  }
  return D.trig;
}
const mkTSaved = () => ({cfg:Object.fromEntries(MK_TCFG.map(k => [k, DB.cfg.triggers[k]])), trig:mkTrig(), autos:(DB.autos || []).map(a => ({on:a.on, t:a.t, b:a.b}))});
let mkTD = null, mkTT = 'review', mkTST = 'delivery', mkTLast = '';
const mkTDirty = () => !!mkTD && JSON.stringify(mkTD) !== JSON.stringify(mkTSaved());
const mkTGet = path => path.split('.').reduce((o, k) => o[k], mkTD);
function mkTSet(path, v, rr) {
  const k = path.split('.'); let o = mkTD; k.slice(0, -1).forEach(x => o = o[x]); o[k[k.length - 1]] = v;
  if (rr) { render(); return; }
  const bar = $('#mktbar'); if (bar) bar.innerHTML = mkTBar();
  const m = path.match(/^(.*)\.(t|b)$/); if (m) { const w = document.getElementById('mkw-' + m[1].replace(/\./g, '-')); if (w) { const x = mkTGet(m[1]); w.innerHTML = pzWarn(textCheck(x.t, x.b)); } }
}
const mkTBar = () => mkTDirty() ? `<b>Есть несохранённые изменения</b><span class="sp"></span><button class="btn" onclick="mkTD=null;render()">Отменить</button><button class="btn pri" onclick="mkTSave()">Сохранить</button>` : '<span class="muted">Изменений нет</span>';
const mkTTxt = (base, ok, lt = 30, lb = 140) => { const x = mkTGet(base), id = base.replace(/\./g, '-');
  return `<div class="row mk-tt"><label class="fld"><span class="mk-req">Заголовок · до ${lt}</span><input class="inp" id="mkt-${id}-t" maxlength="${lt}" ${mkDis(ok)} value="${esc(x.t)}" onfocus="mkTLast=this.id" oninput="mkTSet('${base}.t',this.value)"></label>
    <label class="fld" style="flex:2"><span class="mk-req">Текст · до ${lb}</span><textarea class="inp" id="mkt-${id}-b" maxlength="${lb}" style="min-height:58px" ${mkDis(ok)} onfocus="mkTLast=this.id" oninput="mkTSet('${base}.b',this.value)">${esc(x.b)}</textarea></label></div>
    <div id="mkw-${id}">${pzWarn(textCheck(x.t, x.b))}</div>`; };
const mkTNum = (path, u, ok, w = 200) => `<div class="u-wrap" style="max-width:${w}px"><input class="inp" inputmode="numeric" ${mkDis(ok)} value="${esc(mkTGet(path))}" oninput="mkTSet('${path}',+this.value.replace(/\\D/g,'')||0)"><i>${u}</i></div>`;
const mkTSw = (path, ok, label, sub = '') => `<div class="tog" style="margin-bottom:12px"><span><b style="font-weight:500">${label}</b>${sub ? `<small class="muted" style="display:block">${sub}</small>` : ''}</span>${sw('mkts-' + path.replace(/\./g, '-'), mkTGet(path), (ok ? '' : 'disabled ') + `onchange="mkTSet('${path}',this.checked,1)"`)}</div>`;
function mkTVar(v) {
  const e = document.getElementById(mkTLast); if (!e) { toast('Сначала поставьте курсор в заголовок или текст'); return; }
  const a = e.selectionStart ?? e.value.length; e.value = e.value.slice(0, a) + v + e.value.slice(e.selectionEnd ?? a); e.focus(); e.setSelectionRange(a + v.length, a + v.length); e.dispatchEvent(new Event('input'));
}
PAGES.triggers = () => {
  if (!mkTD) mkTD = clone(mkTSaved());
  const ok = can('push.send'), okB = ok && can('mech.edit'), c = mkTD.cfg, t = mkTD.trig, risk = ((SCHEMA.find(x => x.id === 'triggers') || {fields:[]}).fields.find(f => f.k === 'winback') || {}).risk;
  const anyOn = c.winback || c.balPush || c.review || c.bdPush || Object.values(t.st).some(x => x.on);
  const T = [['review', `${c.review ? '🟢' : '⚪'} Отзыв`], ['bal', `${c.balPush ? '🟢' : '⚪'} Бонусы`], ['bd', `${c.bdPush ? '🟢' : '⚪'} День рождения`], ['win', `${c.winback ? '🟢' : '⚪'} Возврат клиента`], ['st', 'Статусы заказа'], ['autos', 'Наши авто-сообщения', mkTD.autos.filter(a => a.on).length]];
  const vars = `<div class="mk-vars" style="margin:0 0 12px">${MK_TVARS.map(v => `<button type="button" ${mkDis(ok)} onmousedown="event.preventDefault()" onclick="mkTVar('${v}')">${v}</button>`).join('')}</div>`;
  let b = '';
  if (mkTT === 'review') b = `<div class="card">${mkTSw('cfg.review', ok, 'Запрос отзыва', 'Пуш после завершения заказа — оценки попадают в <a href="#/feedbacks">«Отзывы»</a>')}
    <div class="row"><label class="fld"><span>Через сколько после завершения заказа</span>${mkTNum('trig.review.min', 'мин', ok)}</label><label class="fld"><span>Не чаще раза в — наше, не после каждого кофе</span>${mkTNum('cfg.reviewEvery', 'дней', ok)}</label></div>${vars}${mkTTxt('trig.review', ok)}</div>`;
  else if (mkTT === 'bal') b = `<div class="card">${mkTSw('cfg.balPush', ok, 'Напомнить о бонусах', 'Если на счёте много бонусов — пуш, чтобы гость вернулся их потратить')}
    <div class="row"><label class="fld"><span>Через сколько после заказа</span>${mkTNum('trig.bal.min', 'мин', ok)}<small>4 320 мин = 3 дня</small></label><label class="fld"><span>Если на счёте не меньше</span>${mkTNum('trig.bal.minBal', 'бонусов', ok)}</label></div>${vars}${mkTTxt('trig.bal', ok)}</div>`;
  else if (mkTT === 'bd') b = `<div class="card">${mkTSw('cfg.bdPush', ok, 'Поздравить с днём рождения')}
    <div class="note blue" style="margin-bottom:12px">🎂 <span>У нас уже есть авто-сообщение «Скоро день рождения» за 7 дней — во вкладке «Наши авто-сообщения». Включать оба — гость получит два пуша</span></div>
    <label class="fld"><span>За сколько дней до дня рождения — 0, значит в сам день</span>${mkTNum('trig.bd.days', 'дней', ok)}</label>${vars}${mkTTxt('trig.bd', ok)}</div>`;
  else if (mkTT === 'win') b = `<div class="card">${mkTSw('cfg.winback', okB, 'Вернуть гостя бонусами', 'Через N дней без заказа начислить бонусы и прислать пуш')}
    ${risk ? `<div class="note" style="margin-bottom:12px">⚠️ <span><b>Критик:</b> ${esc(risk)}</span></div>` : ''}${okB ? '' : noPerm('mech.edit') + '<div style="height:10px"></div>'}
    <div class="row"><label class="fld"><span>Через сколько дней после заказа</span>${mkTNum('cfg.winbackDays', 'дней', okB)}</label><label class="fld"><span>Начислить</span>${mkTNum('cfg.winbackBon', 'бонусов', okB)}</label></div>
    <p class="small muted" style="margin-top:0">Бонусы начисляет один баланс — наши механики их второй раз не начисляют</p>${vars}${mkTTxt('trig.win', ok)}</div>`;
  else if (mkTT === 'st') b = `<div class="seg" style="margin-bottom:12px">${Object.entries(MK_STW).map(([k, l]) => `<button class="${mkTST === k ? 'on' : ''}" onclick="mkTST='${k}';render()">${l}</button>`).join('')}</div>
    <div class="card">${mkTSw(`trig.st.${mkTST}.on`, ok, `Пуши о статусе · ${MK_STW[mkTST]}`)}${vars}
    ${MK_STS[mkTST].map(([k, l, , , note]) => `<div class="mk-st-row"><h3 style="margin-bottom:8px">${l}</h3>${note ? `<p class="small muted" style="margin:-4px 0 8px">${note}</p>` : ''}${mkTTxt(`trig.st.${mkTST}.${k}`, ok)}</div>`).join('')}</div>`;
  else b = `<p class="muted" style="margin-top:0">Пуши, которые шлёт наше приложение по своим событиям. Числа в текстах — пример</p>` + (DB.autos || []).map((a, i) => `<div class="card"><div class="card-h"><div style="flex:1"><h3>${esc(a.n)}</h3><div class="small muted">${esc(a.when)}</div></div>${sw('mkta-' + i, mkTD.autos[i].on, (ok ? '' : 'disabled ') + `onchange="mkTSet('autos.${i}.on',this.checked,1)"`)}</div>${mkTTxt('autos.' + i, ok, 40, 140)}</div>`).join('');
  return ph('Триггерные рассылки', 'Пуши, которые уходят сами по событию: после заказа, при бонусах, в день рождения, по статусу заказа. Как в Starter, плюс наши авто-сообщения. Всё меняется черновиком и сохраняется кнопкой',
    ok ? `<button class="btn" ${anyOn ? '' : 'disabled'} onclick="mkTOff()">⏻ Отключить все</button>` : '')
  + (ok ? '' : noPerm('push.send') + '<div style="height:12px"></div>')
  + mkTabs(T, mkTT, 'mkTTab') + b + (ok ? `<div class="savebar" id="mktbar">${mkTBar()}</div>` : '');
};
function mkTTab(k) { mkTT = k; render(); }
function mkTOff() { const c = mkTD.cfg; c.winback = c.balPush = c.review = c.bdPush = false; Object.values(mkTD.trig.st).forEach(x => x.on = false); render(); toast('Все триггеры Starter выключены в черновике — нажмите «Сохранить»'); }
function mkTFlat(o, p = '', out = {}) { Object.entries(o).forEach(([k, v]) => { const q = p ? p + '.' + k : k; if (v && typeof v === 'object') mkTFlat(v, q, out); else out[q] = v; }); return out; }
function mkTLabel(path) {
  const W = {cfg:'', trig:'', review:'Отзыв', reviewEvery:'Отзыв: не чаще раза в дней', balPush:'Бонусы', bal:'Бонусы', bdPush:'День рождения', bd:'День рождения', win:'Возврат клиента', winback:'Возврат клиента', winbackDays:'Возврат клиента: через дней', winbackBon:'Возврат клиента: бонусов',
    st:'Статусы', t:'заголовок', b:'текст', min:'через мин', minBal:'от бонусов', days:'за дней', on:'вкл', autos:'', ...MK_STW};
  const k = path.split('.'), out = [];
  k.forEach((x, i) => { if (k[i - 1] === 'autos') out.push('Авто-сообщение «' + ((DB.autos[+x] || {}).n || x) + '»'); else if (k[i - 2] === 'st') out.push((MK_STS[k[i - 1]].find(s => s[0] === x) || [, x])[1]); else if (x in W) { if (W[x]) out.push(W[x]); } else out.push(x); });
  return out.join(' · ') + (k[0] === 'cfg' && ['review', 'balPush', 'bdPush', 'winback'].includes(k[1]) ? ': вкл' : '');
}
function mkTSave(force) {
  const D = mkD(), d = mkTD, warn = [], bad = [];
  [['trig.review.min', 1], ['trig.bal.min', 1], ['cfg.winbackDays', 1], ['cfg.reviewEvery', 0], ['trig.bal.minBal', 0], ['cfg.winbackBon', 0]].forEach(([p, mn]) => { if (!(mkTGet(p) >= mn)) bad.push(mkTLabel(p)); });
  const texts = Object.entries(mkTFlat(d)).filter(([p]) => /\.(t|b)$/.test(p));
  texts.forEach(([p, v]) => { if (!String(v).trim()) bad.push(mkTLabel(p) + ' — пусто'); });
  if (bad.length) { toast('Проверьте: ' + esc(bad.slice(0, 3).join('; '))); return; }
  texts.filter(([p]) => p.endsWith('.t')).forEach(([p]) => { const base = p.slice(0, -2), x = mkTGet(base), w = textCheck(x.t, x.b); if (w.length) warn.push(`<b>${esc(mkTLabel(base))}</b>: ${w.map(esc).join('; ')}`); });
  if (warn.length && !force) { modal({t:'В текстах есть замечания', wide:1, body:`<div class="note">✏️ <span>${warn.join('<br>')}</span></div><p class="small muted">Тексты Starter написаны на «вы» — у нас обращение на «ты». Неразрывный пробел перед ₽ и % поставлю сам</p>`, ok:'Сохранить как есть', cancel:'Исправить', onOk:() => { setTimeout(() => mkTSave(1), 0); }}); return; }
  texts.forEach(([p, v]) => { const k = p.split('.'); let o = d; k.slice(0, -1).forEach(x => o = o[x]); o[k[k.length - 1]] = nbspFix(String(v)); });
  const A = mkTFlat(mkTSaved()), B = mkTFlat(d), sh = v => v === true ? 'вкл' : v === false ? 'выкл' : String(v);
  const ch = Object.keys(B).filter(k => A[k] !== B[k]).map(k => `${esc(mkTLabel(k))}: ${mkDiff(sh(A[k]), sh(B[k]))}`);
  if (!ch.length) { mkTD = null; render(); toast('Изменений нет'); return; }
  MK_TCFG.forEach(k => DB.cfg.triggers[k] = d.cfg[k]); D.trig = clone(d.trig); d.autos.forEach((a, i) => { if (DB.autos[i]) Object.assign(DB.autos[i], a); });
  audit('Триггерные рассылки', ch.join('<br>')); save(); mkTD = null; render(); toast(`Сохранено: ${ch.length} ${plural(ch.length, 'изменение', 'изменения', 'изменений')}`);
}
