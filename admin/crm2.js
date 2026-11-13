/* Бэк-офис — исправления по проверке критика (docs/admin/qa-critic.md):
   деньги и статусы заказа, карточка заказа страницей, список заказов как в Starter, стоп-листы как в Starter,
   статистика без противоречий, «Сохранить изменения?» при уходе, рассылка без мусорных сегментов, мелочи */
'use strict';
document.head.insertAdjacentHTML('beforeend', `<style>
tr.late td{background:#fde8ec!important}
:root[data-theme="dark"] tr.late td{background:#3a1f25!important}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) tr.late td{background:#3a1f25!important}}
.oc-list{display:none}
.oc{display:block;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:8px;text-decoration:none;color:inherit}
.oc.late{border-color:#e57373;background:#fde8ec}
.oc .r1{display:flex;gap:8px;align-items:center;justify-content:space-between}
.oc .r2{display:flex;gap:8px;justify-content:space-between;font-size:13px;margin-top:6px;color:var(--muted)}
@media (max-width:860px){.oc-list{display:block}.oc-tw{display:none}}
.op-blk{border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--surface)}
.op-blk h3{margin-bottom:10px}
.st-g{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface2);border-bottom:1px solid var(--line);flex-wrap:wrap}
.st-g b{font-family:var(--f-head);font-size:15px}
.ax{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px}
</style>`);

/* ── «Дней с покупкой за 7 дней» — из настоящих заказов, а не отдельной цифрой (иначе Статистика спорит сама с собой) ── */
function syncDays7() { const t = isoDay(), m = {}; DB.orders.forEach(o => { if (o.st === 'Возврат') return; const a = -daysTo(o.at.slice(0, 10)); if (a >= 0 && a < 7) (m[o.g] = m[o.g] || new Set()).add(o.at.slice(0, 10)); }); DB.guests.forEach(g => g.days7 = m[g.id] ? m[g.id].size : 0); }
syncDays7();
DB.orders.forEach(o => { if (o.st === 'Возврат' && o.status !== 'Отменен') o.status = 'Отменен'; });

/* ── деньги заказа: o.sum — после скидок, до баллов; деньгами = o.sum − баллы ── */
const paidMoney = o => o.sum - (o.bonUse || 0);
const isLate = o => { if (['Завершен','Отменен'].includes(o.status)) return false; const t = new Date(o.at); t.setMinutes(t.getMinutes() + (o.ch === 'Доставка' ? 75 : 25)); return t < new Date(); };
const readyAt = o => { const t = new Date(o.at); t.setMinutes(t.getMinutes() + (o.ch === 'Доставка' ? 75 : o.ch === 'Касса' ? 5 : 25)); return t.toTimeString().slice(0, 5); };
const fmtTs = s => { s = String(s); const d = s.slice(0, 10), t = s.slice(11, 16); return `${d.slice(8, 10)}.${d.slice(5, 7)}${d.slice(0, 4) !== String(new Date().getFullYear()) ? '.' + d.slice(2, 4) : ''}${t ? ' ' + t : ''}`; };
const billOf = o => { try { return typeof opBills === 'function' ? opBills().find(b => b.o === o.id) : null; } catch (e) { return null; } };

refund = function (id) {
  const o = DB.orders.find(x => x.id === id), g = G(o.g), money = paidMoney(o);
  if (o.st === 'Возврат') { toast('По этому заказу уже сделан возврат'); return; }
  modal({t:'Возврат ' + o.id, body:`<p style="margin-top:0">Что произойдёт:</p><ul style="margin:0 0 12px;padding-left:18px"><li>Вернём ${rub(money)} — ${o.pay === 'Депозит' ? 'на депозит' : o.pay === 'Наличные' ? 'наличными на кассе' : 'на карту'}</li>${o.bonUse ? `<li>Вернём ${nf(o.bonUse)} ${plural(o.bonUse, 'бонус', 'бонуса', 'бонусов')}, которыми платили</li>` : ''}<li>Заказ станет «Отменен», счёт — «Возвращён»</li><li>Экономия гостя пересчитается</li><li>День с покупкой останется, если в этот день были другие чеки</li></ul>${reasonBox(['Ошибка в заказе','Гость отказался','Не привезли','Двойное списание','Другое'])}`,
    ok:`Вернуть ${rub(money)}`, cls:'red', onOk:() => { const why = needReason(); if (!why) return false;
      o.st = 'Возврат'; const w = o.status; o.status = 'Отменен'; (o.hist = o.hist || []).push({s:'Отменен', at:new Date().toISOString(), by:ME().n + ' · возврат'});
      if (g) { if (o.bonUse) g.bon += o.bonUse; if (o.pay === 'Депозит') g.dep += money; }
      audit('Возврат ' + o.id, `${rub(money)}${o.bonUse ? ` и ${nf(o.bonUse)} бонусов` : ''} · статус <span class="diff"><s>${w}</s> → <ins>Отменен</ins></span> · ${esc(why)}`, {g:o.g}); syncDays7(); save(); render(); toast('Возврат оформлен'); }});
};
ordSt = function (id, s) { if (!s) return; const o = DB.orders.find(x => x.id === id);
  const go = () => { const w = o.status; o.status = s; (o.hist = o.hist || []).push({s, at:new Date().toISOString(), by:ME().n}); audit('Статус заказа', `${o.id}: <span class="diff"><s>${w}</s> → <ins>${s}</ins></span>`, {g:o.g}); save(); render(); };
  if (s === 'Отменен' && o.st !== 'Возврат' && paidMoney(o) > 0 && o.pay !== 'Наличные') { refund(id); return; }
  modal({t:`Перевести в «${s}»?`, body:`<p style="margin-top:0">Гость получит пуш о статусе, если он включён в «Триггерных рассылках»</p>`, ok:'Перевести', onOk:go}); render(); };

/* ── карточка заказа — страница, как в Starter (/admin/order?code=…) ── */
openOrder = function (id) { location.hash = '#/order/' + id; };
let ordTab2 = 'main'; const ordNote = {};
PAGES.order = r => {
  const o = DB.orders.find(x => x.id === r[1]); if (!o) return ph('Заказ не найден') + backLink('#/orders', 'Заказы');
  if (r[2]) ordTab2 = r[2]; const g = G(o.g), b = billOf(o), sv = o.lines.reduce((a, l) => a + l.d, 0), earn = o.st === 'Возврат' ? 0 : Math.round(o.sum * EARN());
  if (!(o.id in ordNote)) ordNote[o.id] = o.note || '';
  const T = [['main','Общие'],['utm','UTM'],['an','Analytics ID'],['dev','Device ID']];
  return backLink('#/orders', 'Заказы') + `<div class="cr-gh"><div class="t"><h1>Заказ ${o.id} · ${o.at.slice(11, 16)}, ${dLong(o.at)}</h1><div class="small muted" style="margin-top:4px">${esc(o.ch)} · ${esc(o.shop)} · ${esc(o.src || '')}</div></div>
    <div class="btns"><button class="btn" onclick="ordHist('${o.id}')">🕘 История изменений заказа</button>${stPill2(o)}${can('orders.refund') ? `<select class="inp" style="width:auto" onchange="ordSt('${o.id}',this.value)"><option value="">Сменить статус…</option>${ST_LIST.filter(s => s !== o.status).map(s => `<option>${s}</option>`).join('')}</select>` : ''}</div></div>
  <div class="tabs">${T.map(([k, t]) => `<button class="${ordTab2 === k ? 'on' : ''}" onclick="ordTab2='${k}';render()">${t}</button>`).join('')}</div>
  ${ordTab2 === 'utm' ? '<div class="card muted">Для этого заказа нет UTM-меток</div>' : ordTab2 === 'an' ? `<div class="card"><dl class="kv"><dt>user_id</dt><dd class="small">${hsh2(o.g + 'u').toString(16)}${hsh2(o.id).toString(16)}</dd></dl></div>` : ordTab2 === 'dev' ? '<div class="card muted">IP и рекламный ID устройства — персональные данные. Показываем только владельцу по запросу</div>' : `
  <div class="grid g2"><div class="op-blk"><h3>Общие</h3><dl class="kv"><dt>Клиент</dt><dd>${g ? `<a href="#/guest/${g.id}">${esc(gName(g))}</a> · ${esc(g.ph)}` : 'удалён'}</dd><dt>Тип</dt><dd>${esc(o.ch)}</dd><dt>Приготовят здесь</dt><dd>${esc(o.shop)}</dd><dt>Готово к</dt><dd>${readyAt(o)}${isLate(o) ? ' <span class="pill red">опаздывает</span>' : ''}</dd><dt>Источник</dt><dd>${esc(o.src || '—')}</dd><dt>Промокод</dt><dd>${esc(o.promo || '—')}</dd></dl></div>
    <div class="op-blk"><h3>${o.ch === 'Доставка' ? 'Доставка' : o.ch === 'За столик' ? 'За столиком' : 'Получение'}</h3><dl class="kv">${o.ch === 'Доставка' ? `<dt>Доставить к</dt><dd>${readyAt(o)}–${(() => { const t = new Date(o.at); t.setMinutes(t.getMinutes() + 95); return t.toTimeString().slice(0, 5); })()}</dd><dt>Тип доставки</dt><dd>Курьер · Яндекс.Доставка</dd><dt>Адрес</dt><dd class="muted">скрыт — персональные данные</dd>` : o.ch === 'За столик' ? `<dt>Стол</dt><dd>№ ${hsh2(o.id) % 12 + 1}</dd>` : `<dt>Где</dt><dd>${esc(o.shop)}</dd>`}</dl>
      <label class="fld" style="margin-top:10px"><span>Заметка к заказу</span><textarea class="inp" oninput="ordNote['${o.id}']=this.value">${esc(ordNote[o.id])}</textarea></label><button class="btn sm" ${ordNote[o.id] === (o.note || '') ? 'disabled' : ''} onclick="ordNoteSave('${o.id}')">Сохранить заметку</button></div></div>
  <div class="card" style="margin-top:16px"><h3>Список позиций в заказе</h3><div class="tw" style="margin-top:8px"><table><thead><tr><th>Наименование</th><th>Топпинги</th><th class="r">Цена</th><th class="c">Кол-во</th><th class="r">Скидка</th><th>Источник скидки</th><th class="r">Сумма</th></tr></thead><tbody>${o.lines.map(l => `<tr><td>${esc(l.n)}</td><td class="small muted">${esc(l.top || '—')}</td><td class="r">${rub(l.p)}</td><td class="c">${l.q}</td><td class="r">${l.d ? '−' + rub(l.d) : '—'}</td><td class="small">${esc(l.k) || '—'}</td><td class="r">${rub(l.p * l.q - l.d)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="op-blk"><h3>Оплата</h3><dl class="kv"><dt>Сумма заказа</dt><dd>${rub(o.sum)}</dd><dt>Баллами</dt><dd>${nf(o.bonUse || 0)}</dd><dt>${o.pay === 'Наличные' ? 'Наличными' : o.pay === 'Депозит' ? 'С депозита' : 'Картой'}</dt><dd><b>${rub(paidMoney(o))}</b> · ${esc(o.pay)}</dd><dt>Экономия гостя</dt><dd>${rub(sv)}</dd><dt>Вернётся баллами</dt><dd>${nf(earn)}</dd><dt>Статус</dt><dd>${o.st === 'Возврат' ? '<span class="pill red">Возврат</span>' : '<span class="pill ok">Заказ оплачен</span>'}</dd></dl></div>
    <div class="op-blk"><h3>Счёт</h3>${b ? `<dl class="kv"><dt>Номер</dt><dd><a href="#/bills">${esc(b.id)}</a></dd><dt>Статус</dt><dd>${esc(b.st)}</dd><dt>Сумма</dt><dd>${rub(b.sum)}</dd><dt>Возврат</dt><dd>${o.st === 'Возврат' ? rub(b.sum) : '—'}</dd></dl>` : `<p class="muted small" style="margin:0 0 10px">${o.pay === 'Наличные' || o.ch === 'Касса' ? 'Оплата на кассе — счёта эквайринга нет' : 'Счёт не найден'}</p>`}
      ${o.st !== 'Возврат' && can('orders.refund') ? `<button class="btn red" style="margin-top:10px" onclick="refund('${o.id}')">Оформить возврат · ${rub(paidMoney(o))}</button>` : ''}</div></div>`}`;
};
function ordNoteSave(id) { const o = DB.orders.find(x => x.id === id), v = ordNote[id]; audit('Заметка к заказу', `${id}: ${esc(v)}`, {g:o.g}); o.note = v; save(); render(); toast('Заметка сохранена'); }
function ordHist(id) { const o = DB.orders.find(x => x.id === id); modal({t:'История изменений заказа', ok:'', cancel:'Закрыть', body:`<div class="tw"><table><thead><tr><th>Переведён в статус</th><th>Когда</th><th>Кем</th></tr></thead><tbody>${(o.hist || []).map(h => `<tr><td>${h.s}</td><td class="small">${fmtTs(h.at)}</td><td class="small">${esc(h.by)}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Core — Starter, Pos — касса, иначе — сотрудник</p>`}); }
addEventListener('hashchange', () => { if (!location.hash.startsWith('#/order/')) Object.keys(ordNote).forEach(k => delete ordNote[k]); });

/* ── «Назад» — туда, откуда пришёл ── */
const hashHist = []; addEventListener('hashchange', e => { const f = (e.oldURL.split('#')[1] || ''); if (f) { hashHist.push('#' + f); if (hashHist.length > 30) hashHist.shift(); } });
function backLink(def, t) { const own = location.hash.split('/').slice(0, 3).join('/'); const prev = [...hashHist].reverse().find(h => !h.startsWith(own));
  return `<p style="margin:0 0 8px"><a href="${prev || def}">← ${prev ? 'Назад' : esc(t)}</a></p>`; }

/* ── список заказов, как в Starter: колонки, опоздания, промокоды, живой поиск, на телефоне — карточки ── */
const OD2 = [['today','Сегодня',0,0],['yday','Вчера',1,1],['tweek','Эта неделя','w',0],['tmonth','Этот месяц','m',0],['pmonth','Прошлый месяц','pm',0],['week7','Последние 7 дней',6,0],['d30','Последние 30 дней',29,0],['y12','Последние 12 месяцев',365,0],['custom','Указать период…','c',0]];
of_.limit = 50; of_.promo = ''; of_.from = ''; of_.to = '';
ofList = function () { const t = isoDay(), q = of_.q.toLowerCase(), qd = q.replace(/\D/g, '');
  const mon = new Date(); mon.setDate(mon.getDate() - (mon.getDay() + 6) % 7); const monI = isoDay(mon), pm = new Date(); pm.setMonth(pm.getMonth() - 1); const pmI = isoDay(pm).slice(0, 7);
  return DB.orders.filter(o => { const d = o.at.slice(0, 10), ago = -daysTo(d), od = OD2.find(x => x[0] === of_.date);
    if (od) { if (od[2] === 'm') { if (d.slice(0, 7) !== t.slice(0, 7)) return false; } else if (od[2] === 'pm') { if (d.slice(0, 7) !== pmI) return false; } else if (od[2] === 'w') { if (d < monI) return false; } else if (od[2] === 'c') { if ((of_.from && d < of_.from) || (of_.to && d > of_.to)) return false; } else if (ago > od[2] || ago < od[3]) return false; }
    return (!of_.st.length || of_.st.includes(o.status)) && (!of_.shop || o.shop === of_.shop) && (!of_.ch || o.ch === of_.ch) && (!of_.promo || o.promo === of_.promo) && (!of_.src || (of_.src === 'Без акции' ? !o.lines.some(l => l.k) && !o.promo : o.lines.some(l => l.k === of_.src)))
      && (!q || o.id.toLowerCase().includes(q) || (G(o.g) && (gName(G(o.g)).toLowerCase().includes(q) || (qd.length > 2 && G(o.g).ph.replace(/\D/g, '').includes(qd))))); })
    .sort((a, b) => { const k = of_.sort, x = k === 'sum' ? a.sum : k === 'bon' ? a.bonUse : a.at, y = k === 'sum' ? b.sum : k === 'bon' ? b.bonUse : b.at; return (x > y ? 1 : x < y ? -1 : 0) * of_.dir; }); };
PAGES.orders = () => {
  const L = ofList(), nF = of_.st.length + !!of_.date + !!of_.shop + !!of_.ch + !!of_.src + !!of_.promo, V = L.slice(0, of_.limit);
  const th = (k, t) => `<th class="srt r ${of_.sort === k ? 'on' : ''}" onclick="of_.dir=of_.sort==='${k}'?-of_.dir:-1;of_.sort='${k}';render()">${t}${of_.sort === k ? (of_.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`;
  const promos = [...new Set(DB.orders.map(o => o.promo).filter(Boolean))];
  const acts = ['Без акции','Предложение дня','Цена недели','Шестое','День рождения', ...((DB.mk && DB.mk.promos) || []).map(p => p.n).filter(Boolean)];
  return `<div class="ph"><div class="t"><div class="cr-h"><h1>Заказы</h1><small>${nf(L.length)} · ${rub(L.reduce((x, o) => x + (o.st === 'Возврат' ? 0 : o.sum), 0))}</small></div><p>Касса и онлайн-заказы. Опаздывающие — розовым. Нажмите на заказ — откроется его карточка</p></div></div>
  <div class="card" style="padding:0;overflow:visible"><div class="cr-tb"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Номер или телефон" value="${esc(of_.q)}" oninput="of_.q=this.value;clearTimeout(window._ot);window._ot=setTimeout(()=>{render();const i=document.querySelector('.cr-tb .search input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)"></div><span class="sp"></span><button class="btn ${of_.open ? 'pri' : ''}" onclick="of_.open=!of_.open;render()">⚙︎ Фильтры${nF ? `<span class="cr-badge">${nF}</span>` : ''}</button></div>
  ${of_.open ? `<div style="padding:14px;border-top:1px solid var(--line);background:var(--surface2)"><div class="fld"><span>Статусы</span><div class="btns">${ST_LIST.map(s => `<label class="chk pill" style="padding:5px 10px"><input type="checkbox" ${of_.st.includes(s) ? 'checked' : ''} onchange="of_.st=this.checked?[...of_.st,'${s}']:of_.st.filter(x=>x!=='${s}');render()"> ${s}</label>`).join('')}</div></div>
    <div class="cr-fp" style="padding:0;border:0;background:none"><label class="fld"><span>По дате получения</span><select class="inp" onchange="of_.date=this.value;render()"><option value="">Всё время</option>${OD2.map(d => `<option value="${d[0]}" ${of_.date === d[0] ? 'selected' : ''}>${d[1]}</option>`).join('')}</select></label>
    ${of_.date === 'custom' ? `<label class="fld"><span>С — по</span><span class="cr-rng"><input class="inp" type="date" value="${of_.from}" onchange="of_.from=this.value;render()"><input class="inp" type="date" value="${of_.to}" onchange="of_.to=this.value;render()"></span></label>` : ''}
    <label class="fld"><span>Ресторан</span><select class="inp" onchange="of_.shop=this.value;render()"><option value="">Все</option>${DB.shops.map(s => `<option ${of_.shop === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></label>
    <label class="fld"><span>Тип заказа</span><select class="inp" onchange="of_.ch=this.value;render()"><option value="">Все</option>${['Касса','Самовывоз','Доставка','За столик'].map(s => `<option ${of_.ch === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
    <label class="fld"><span>Акция</span><select class="inp" onchange="of_.src=this.value;render()"><option value="">Все</option>${acts.map(s => `<option ${of_.src === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
    <label class="fld"><span>Промокод</span><select class="inp" onchange="of_.promo=this.value;render()"><option value="">Все</option>${promos.map(s => `<option ${of_.promo === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label></div>
    ${nF ? '<button class="btn sm" onclick="Object.assign(of_,{st:[],date:\'\',shop:\'\',ch:\'\',src:\'\',promo:\'\'});render()">Сбросить</button>' : ''}</div>` : ''}
  <div class="tw oc-tw" style="border:0;border-top:1px solid var(--line);border-radius:0 0 var(--r) var(--r)"><table><thead><tr><th>Статус</th><th class="srt ${of_.sort === 'at' ? 'on' : ''}" onclick="of_.dir=of_.sort==='at'?-of_.dir:-1;of_.sort='at';render()">№ / время${of_.sort === 'at' ? (of_.dir > 0 ? ' ↑' : ' ↓') : ''}</th><th>Тип</th><th>Адрес</th><th>Кухня</th><th>Клиент</th><th>Курьер</th>${th('sum', 'Сумма')}${th('bon', 'Баллами')}<th>Оплата</th><th>Промокоды</th><th>Источник</th><th>Заметка</th></tr></thead><tbody>
  ${V.map(o => { const g = G(o.g), late = isLate(o); return `<tr class="click ${late ? 'late' : ''}" onclick="openOrder('${o.id}')"><td>${stPill2(o)}</td><td class="nowrap"><b>${o.id}</b><div class="small muted">${fmtTs(o.at)}</div></td><td class="small">${o.ch === 'За столик' ? 'Зал' : o.ch}</td><td class="small nowrap">${o.ch === 'За столик' ? `Стол № ${hsh2(o.id) % 12 + 1}<br>` : ''}<span class="muted">${esc(o.shop)}</span></td>
    <td class="small nowrap" style="${late ? 'color:var(--red);font-weight:600' : ''}">${late ? '⏰ ' : ''}${readyAt(o)}</td><td class="small">${g ? `${esc(gName(g))}<div class="muted">${esc(g.ph)}</div>` : '<span class="muted">удалён</span>'}</td><td class="small">${o.ch === 'Доставка' ? 'Яндекс.Доставка' : '—'}</td><td class="r nowrap">${rub(o.sum)}</td><td class="r">${o.bonUse ? nf(o.bonUse) : '—'}</td><td class="small">${esc(o.pay)}</td><td class="small">${esc(o.promo || '—')}</td><td class="small">${esc(o.src || '—')}</td><td class="small muted">${esc(o.note || '')}</td></tr>`; }).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Заказов не нашлось — измените фильтры</div>'}</div>
  <div class="oc-list" style="padding:10px">${V.map(o => { const g = G(o.g), late = isLate(o); return `<a class="oc ${late ? 'late' : ''}" href="#/order/${o.id}"><div class="r1"><b>${o.id}</b>${stPill2(o)}</div><div class="r2"><span>${fmtTs(o.at)} · ${o.ch} · ${esc(o.shop)}</span><b style="color:var(--ink)">${rub(o.sum)}</b></div><div class="r2"><span>${g ? esc(gName(g)) : 'удалён'}</span><span>${late ? '⏰ опаздывает' : 'готово к ' + readyAt(o)}</span></div></a>`; }).join('')}${L.length ? '' : '<div class="empty">Заказов не нашлось</div>'}</div>
  ${L.length > of_.limit ? `<div style="padding:12px;text-align:center;border-top:1px solid var(--line)"><button class="btn" onclick="of_.limit+=50;render()">Показать ещё · осталось ${L.length - of_.limit}</button></div>` : ''}</div>`;
};
/* заказы внутри карточки клиента — со статусом заказа, а не «Выполнен» */
const ordersTable2 = os => `<div class="tw"><table><thead><tr><th>Статус</th><th>№ / время</th><th>Тип</th><th>Точка</th><th>Состав</th><th class="r">Сумма</th><th class="r">Баллами</th></tr></thead><tbody>${os.slice(0, 200).map(o => `<tr class="click" onclick="openOrder('${o.id}')"><td>${stPill2(o)}</td><td class="nowrap"><b>${o.id}</b><div class="small muted">${fmtTs(o.at)}</div></td><td class="small">${o.ch}</td><td class="small">${esc(o.shop)}</td><td class="small">${o.lines.map(l => esc(l.n)).join(', ')}</td><td class="r nowrap">${rub(o.sum)}</td><td class="r">${o.bonUse ? nf(o.bonUse) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
GTAB.orders = g => { const os = DB.orders.filter(o => o.g === g.id); return os.length ? ordersTable2(os) : '<div class="empty">Покупок пока нет — гость у нас недавно</div>'; };
{ const m0 = GTAB.main; GTAB.main = g => m0(g).replace(/<div class="tw"><table><thead><tr><th>Чек<\/th>[\s\S]*?<\/table><\/div>/, () => { const ord = DB.orders.filter(o => o.g === g.id), a = {done:ord.filter(o => o.status === 'Завершен'), work:ord.filter(o => !['Завершен','Отменен'].includes(o.status)), canc:ord.filter(o => o.status === 'Отменен')}[_gOrd]; return ordersTable2(a); })
  .replace(/>(\d{4}-\d{2}-\d{2} \d{2}:\d{2})</g, (x, d) => '>' + fmtTs(d) + '<'); }

/* ── карточка клиента: вкладки в адресе, меню «Настройки» закрывается, «Назад» — туда, откуда пришёл ── */
{ const pg = PAGES.guest; PAGES.guest = r => { const h = pg(r).replace(/onclick="gTab='(\w+)';render\(\)"/g, (x, k) => `onclick="location.hash='#/guest/${r[1]}/${k}'"`).replace(/<p style="margin:0 0 8px"><a href="#\/customers">← Клиенты<\/a><\/p>/, backLink('#/customers', 'Клиенты'));
  return h.replace(/<a href="javascript:([^"]+)">/g, (x, f) => `<a href="javascript:document.getElementById('gmn').classList.remove('open');${f}">`); }; }
openGuest = function (id, tab) { const h = '#/guest/' + id + (tab ? '/' + tab : ''); if (tab) gTab = tab; if (!location.hash.startsWith('#/guest/' + id) || tab) location.hash = h; else render(); };
document.addEventListener('click', e => { const m = $('#gmn.open'); if (m && !e.target.closest('#gmn')) m.classList.remove('open'); });

/* ── «Создать рассылку» из фильтра и кластера — без мусорных «Моих сегментов» ── */
const TMP_SEG = 'tmp-filter';
function tmpSeg(n, c) { DB.segments = DB.segments.filter(s => s.id !== TMP_SEG); DB.segments.push({id:TMP_SEG, n, c:clone(c), tmp:1}); return TMP_SEG; }
cfMail = function () { if (cf.seg) mailSeg(cf.seg); else if (cf.c.length) mailSeg(tmpSeg('Текущий фильтр клиентов', cf.c)); else mailSeg(); };
segMailCl = function (c) { const n = DB.guests.filter(g => GS(g.id).cl === c).length; if (!n) { toast('В этом кластере нет клиентов — рассылать некому'); return; } mailSeg(tmpSeg('RFM: ' + c, [{f:'rfmCl', v:c}])); };
{ const sv = save; save = function () { const t = DB.segments.filter(s => s.tmp); DB.segments = DB.segments.filter(s => !s.tmp); const ok = sv(); DB.segments.push(...t); return ok; }; }
{ const pc = PAGES.customers; PAGES.customers = r => pc(r).replace(/<option value="(tmp-filter)"[^>]*>[^<]*<\/option>/, ''); }
{ const ps = PAGES.segments; PAGES.segments = r => ps(r).replace(/<tr class="click" onclick="editSeg\('tmp-filter'\)">[\s\S]*?<\/tr>/, ''); }
/* импорт сегмента: введённое не теряется при смене вкладки */
{ const ci = cfImport; let keep = {t:'', n:''}; cfImport = function () { ci(); const t = $('#imt'), n = $('#imn'); if (t) { t.value = keep.t; t.oninput = () => keep.t = t.value; } if (n) { n.value = keep.n; n.oninput = () => keep.n = n.value; } }; }

/* ── баллы клиента: понятный лимит и даты одним видом ── */
{ const gp = gPoints; gPoints = function (id) { gp(id); const m = [...$$('[data-modal]')].pop(); if (!m) return; m.querySelectorAll('td.nowrap.small').forEach(td => { if (/^\d{4}-\d{2}-\d{2}/.test(td.textContent)) td.textContent = fmtTs(td.textContent.replace(' ', 'T')); });
  m.querySelectorAll('p.small.muted').forEach(p => p.innerHTML = p.innerHTML.replace('Лимит без подтверждения: нет', lim('bonus') ? '' : 'Без лимита: подтверждение второго сотрудника не нужно')); }; }

/* ── «Сохранить изменения?» при уходе со страницы с черновиком (Лояльность) ── */
let _leaving = false;
addEventListener('hashchange', e => {
  if (_leaving) { _leaving = false; return; }
  const from = '#' + (e.oldURL.split('#')[1] || '');
  if (from.startsWith('#/loyalty') && !location.hash.startsWith('#/loyalty') && loyD && JSON.stringify(loyD) !== JSON.stringify(DB.loy)) {
    const to = location.hash; _leaving = true; location.hash = from;
    setTimeout(() => askSave(() => { _saveThenGo = to; loySave(); }, () => { loyD = clone(DB.loy); location.hash = to; }, 'В «Лояльности» есть несохранённые изменения'), 30);
  }
});
let _saveThenGo = '';
{ const ls = loySave; loySave = function () { ls(); const go = _saveThenGo; _saveThenGo = ''; if (go) { const m = [...$$('[data-modal]')].pop(); if (m && m._onOk) { const f = m._onOk; m._onOk = () => { const r = f(); if (r !== false) setTimeout(() => { location.hash = go; }, 0); return r; }; } } }; }
addEventListener('beforeunload', e => { if (loyD && JSON.stringify(loyD) !== JSON.stringify(DB.loy)) { e.preventDefault(); e.returnValue = ''; } });

/* ── одни настройки в одном месте: «Лояльность» — главная, правила механик показывают то же значение ── */
if (DB.loy && !DB.loy._v2) { DB.loy.share = C('bonus', 'maxShare'); DB.loy.withDisc = true; DB.loy._v2 = 1; }
function loySync() { const L = DB.loy, b = DB.cfg.bonus;
  b.maxShare = L.share; b.withDiscounts = L.withDisc; b.withPromo = L.withPromo; b.earnBase = L.afterDisc ? 'Суммы после скидок и бонусов' : 'Полной суммы';
  b.ledger = L.prov === 'Свой сервис (наш backend)' ? 'Свой учёт (вариант B)' : 'iikoCloud «Бонусная программа NEW» (вариант A)';
  DB.cfg.triggers = DB.cfg.triggers || {}; DB.cfg.triggers.welcome = [L.welcome.auth[0] ? L.welcome.auth[1] : 0, L.welcome.first[0] ? L.welcome.first[1] : 0, L.welcome.form[0] ? L.welcome.form[1] : 0]; }
loySync();
{ const sv2 = save; save = function () { loySync(); return sv2(); }; }
SCHEMA.forEach(s => s.fields.forEach(f => { const k = s.id + '.' + f.k;
  const where = {'bonus.maxShare':'loyalty/points','bonus.withDiscounts':'loyalty/points','bonus.withPromo':'loyalty/points','bonus.earnBase':'loyalty/points','bonus.ledger':'loyalty/connect','triggers.welcome':'loyalty/welcome'}[k];
  if (where) { f.lock = true; f.d = (f.d ? f.d + '. ' : '') + `Меняется в «Маркетинг → Лояльность» (#/${where}) — одно значение на всю панель`; f.code = (f.code ? f.code + ' · ' : '') + 'DB.loy'; } }));
{ const fr = fieldRow; fieldRow = function (s, f, d, cur, ro) { if (f.lock) d[f.k] = clone(cur[f.k]); return fr(s, f, d, cur, ro).replace(/\(#\/(loyalty\/\w+)\)/, '— <a href="#/$1">открыть</a>'); }; }

/* ── стоп-листы, как в Starter: все точки сразу, вкладки, источник стопа, остаток, история, «Добавить стоп» ── */
DB.stops = DB.stops || (() => { const a = []; allItems().forEach(m => (m.stop || []).forEach(sn => a.push({shop:sn, id:m.id, src:'Стартер', left:null, at:new Date().toISOString()})));
  DB.shops.forEach((s, i) => allItems().filter(m => hsh2(s.n + m.id) % 23 === 0).slice(0, 6).forEach(m => { if (!a.some(x => x.shop === s.n && x.id === m.id)) a.push({shop:s.n, id:m.id, src:'POS', left: hsh2(m.id) % 3 ? null : hsh2(s.n) % 5 + 1, at:new Date(Date.now() - (hsh2(m.id) % 300) * 6e4).toISOString()}); })); return a; })();
const stopSync = () => { const by = {}; DB.stops.forEach(x => (by[x.id] = by[x.id] || []).push(x.shop)); allItems().forEach(m => { const want = by[m.id] || [], has = m.stop || []; if (want.sort().join() !== [...has].sort().join()) (DB.menuOv[m.id] = DB.menuOv[m.id] || {}).stop = want; }); };
stopSync();
let sl = {tab:'stop', q:'', shop:'', src:''};
const inactive = (m, s) => m.hidden || (s.kind !== 'kitchen' && !BAR_CATS.includes(m.cat));
PAGES.stop = () => {
  const ro = !can('shops.edit'), q = sl.q.toLowerCase(), shops = DB.shops.filter(s => !sl.shop || s.n === sl.shop);
  const rows = s => allItems().map(m => ({m, st:DB.stops.find(x => x.shop === s.n && x.id === m.id), ina:inactive(m, s)})).filter(x => (sl.tab === 'stop' ? x.st : sl.tab === 'off' ? x.ina : true) && (!q || x.m.n.toLowerCase().includes(q) || catName(x.m.cat).toLowerCase().includes(q) || x.m.id.includes(q)) && (!sl.src || (x.st && x.st.src === sl.src)));
  const cnt = k => DB.shops.reduce((a, s) => a + allItems().filter(m => k === 'stop' ? DB.stops.some(x => x.shop === s.n && x.id === m.id) : k === 'off' ? inactive(m, s) : true).length, 0);
  return ph('Стоп-листы и неактивные блюда', 'В стопе — блюда, которые закончились: стоп из кассы (POS) или поставленный здесь. Если у стопа в кассе есть остаток, блюдо можно заказать, пока остаток не кончится', `<button class="btn" onclick="slHist()">🕘 История изменений</button>`)
  + (ro ? noPerm('shops.edit') : '')
  + `<div class="tabs">${[['stop','В стопе'],['off','Неактивные'],['all','Все']].map(([k, t]) => `<button class="${sl.tab === k ? 'on' : ''}" onclick="sl.tab='${k}';render()">${t} <span class="pill">${nf(cnt(k))}</span></button>`).join('')}</div>
  <div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Категория, блюдо или артикул" value="${esc(sl.q)}" oninput="sl.q=this.value;clearTimeout(window._st);window._st=setTimeout(()=>{render();const i=document.querySelector('.filters .search input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)"></div>
    <select class="inp" style="width:auto" onchange="sl.shop=this.value;render()"><option value="">Все рестораны</option>${DB.shops.map(s => `<option ${sl.shop === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select>
    <select class="inp" style="width:auto" onchange="sl.src=this.value;render()"><option value="">Любой источник стопа</option><option ${sl.src === 'POS' ? 'selected' : ''}>POS</option><option ${sl.src === 'Стартер' ? 'selected' : ''}>Стартер</option></select></div>`
  + shops.map(s => { const R = rows(s); return `<div class="card" style="padding:0;overflow:hidden;margin-bottom:14px"><div class="st-g"><b>${esc(s.n)}</b><span class="pill">${R.length}</span>${s.closed ? `<span class="pill red">${esc(s.closed)}</span>` : '<span class="pill ok">Включена</span>'}<span class="small muted">обновлено из кассы ${(hsh2(s.n) % 50) + 5} мин назад</span><span style="flex:1"></span><button class="btn sm" onclick="toast('Стоп-лист ${esc(s.n)} обновлён из кассы')">⟳ Обновить из POS</button>${ro ? '' : `<button class="btn sm pri" onclick="slAdd('${esc(s.n)}')">＋ Добавить стоп</button>`}</div>
    ${R.length ? `<div class="tw" style="border:0;border-radius:0"><table><thead><tr><th>Позиция</th><th class="r">Цена</th><th>Статус</th><th>Источник стопа</th><th></th></tr></thead><tbody>${R.slice(0, 80).map(({m, st, ina}) => `<tr><td><div class="cell-n">${m.img ? `<img class="thumb" loading="lazy" src="${m.img}" alt="">` : '<span class="thumb"></span>'}<div><b>${esc(m.n)}</b><span class="small muted">${m.vars && m.vars[0] && m.vars[0].w ? m.vars[0].w + ' г · ' : ''}${m.id} · ${esc(catName(m.cat))}</span></div></div></td><td class="r nowrap">${rub(m.p)}</td>
      <td>${st ? (st.left ? `<span class="pill amb">Остаток: ${st.left}</span>` : '<span class="pill red">В стопе</span>') : ina ? '<span class="pill">Неактивно</span>' : '<span class="pill ok">В продаже</span>'}</td><td class="small">${st ? (st.src === 'POS' ? '🧾 POS' : '⚡ Стартер') + ` · ${fmtTs(st.at)}` : '—'}</td>
      <td class="r">${ro ? '' : st ? `<button class="btn sm" onclick="slOff('${esc(s.n)}','${m.id}')">Снять со стопа</button>` : ina ? '' : `<button class="btn sm" onclick="slOn('${esc(s.n)}','${m.id}')">В стоп</button>`}</td></tr>`).join('')}</tbody></table>${R.length > 80 ? `<div class="small muted" style="padding:8px 14px">Показаны первые 80 из ${R.length} — уточните поиск</div>` : ''}</div>` : '<div class="empty" style="padding:18px">Ничего нет</div>'}</div>`; }).join('');
};
function slOn(shop, id, left) { modal({t:'Поставить в стоп?', body:`<p style="margin-top:0"><b>${esc(itm(id).n)}</b> в «${esc(shop)}» — гость увидит «Закончилось» и не сможет заказать</p><label class="fld"><span>Остаток (пусто — сразу в стоп)</span><input class="inp" id="sll" inputmode="numeric" value="${left || ''}"></label>`, ok:'В стоп', cls:'red', onOk:() => { const l = parseInt(val('sll'), 10) || null; DB.stops.push({shop, id, src:'Стартер', left:l, at:new Date().toISOString()}); stopSync(); audit('Поставили в стоп', `${esc(itm(id).n)} · ${esc(shop)}${l ? ' · остаток ' + l : ''}`); save(); render(); }}); }
function slOff(shop, id) { const st = DB.stops.find(x => x.shop === shop && x.id === id); modal({t:'Снять со стопа?', body:`<p style="margin-top:0"><b>${esc(itm(id).n)}</b> снова можно будет заказать в «${esc(shop)}»${st.src === 'POS' ? '<br><span class="small muted">Стоп пришёл из кассы — если там его не снять, при следующем обновлении он вернётся</span>' : ''}</p>`, ok:'Снять со стопа', onOk:() => { DB.stops = DB.stops.filter(x => x !== st); stopSync(); audit('Сняли со стопа', `${esc(itm(id).n)} · ${esc(shop)}`); save(); render(); }}); }
function slAdd(shop) { modal({t:'Добавить стоп · ' + esc(shop), body:`<label class="fld"><span>Блюдо</span><select class="inp" id="sla">${allItems().filter(m => !m.hidden && !DB.stops.some(x => x.shop === shop && x.id === m.id)).map(m => `<option value="${m.id}">${esc(m.n)} · ${esc(catName(m.cat))}</option>`).join('')}</select></label><label class="fld"><span>Остаток (пусто — сразу в стоп)</span><input class="inp" id="sll" inputmode="numeric"></label>`, ok:'Добавить', onOk:() => { const id = val('sla'), l = parseInt(val('sll'), 10) || null; DB.stops.push({shop, id, src:'Стартер', left:l, at:new Date().toISOString()}); stopSync(); audit('Поставили в стоп', `${esc(itm(id).n)} · ${esc(shop)}`); save(); render(); }}); }
function slHist() { modal({t:'История изменений стоп-листов', ok:'', cancel:'Закрыть', wide:1, body:auditList(DB.audit.filter(a => /стоп/i.test(a.what)).slice(0, 100))}); }
stopSet = function (id, on) { const s = DB.shops[stShop].n; DB.stops = DB.stops.filter(x => !(x.shop === s && x.id === id)); if (on) DB.stops.push({shop:s, id, src:'Стартер', left:null, at:new Date().toISOString()}); stopSync(); audit(on ? 'Поставили в стоп' : 'Сняли со стопа', `${esc(itm(id).n)} · ${esc(s)}`); save(); };
{ const si = saveItem; saveItem = function () { const id = ed && ed.id, want = ed && ed.stop ? [...ed.stop] : null; si(); if (want) { DB.stops = DB.stops.filter(x => x.id !== id || want.includes(x.shop)); want.forEach(s => { if (!DB.stops.some(x => x.id === id && x.shop === s)) DB.stops.push({shop:s, id, src:'Стартер', left:null, at:new Date().toISOString()}); }); save(); } }; }

/* ── Статистика: одна метрика дней с покупкой, точка влияет на все плитки, у графиков есть даты ── */
{ const d0 = PAGES.dash; PAGES.dash = () => {
  let h = d0();
  const inShop = g => !stShopF || g.shop === stShopF, act = DB.guests.filter(g => inShop(g) && g.days7 > 0);
  const avg7 = act.length ? act.reduce((a, g) => a + g.days7, 0) / act.length : 0;
  h = h.replace(/<span>Дней с покупкой на гостя в неделю<\/span><b>[^<]*<\/b>(<small[^>]*>[^<]*<\/small>)?/, `<span>Дней с покупкой за неделю у активного гостя</span><b>${avg7.toFixed(1).replace('.', ',')}</b><small>за последние 7 дней · цель — 4 и больше</small>`)
    .replace(/<span>С Кофейная\+<\/span><b>[^<]*<\/b>/, `<span>С Кофейная+${stShopF ? ' · любят эту точку' : ''}</span><b>${nf(DB.guests.filter(g => inShop(g) && g.plus).length)}</b>`)
    .replace('Активные гости по числу дней с покупкой за последние 7 дней', `Гости, которые покупали за последние 7 дней (${act.length}), по числу разных дней с покупкой — та же цифра, что в первой плитке`);
  if (stShopF) h = h.replace(/(<span>Новых клиентов<\/span><b>)[^<]*(<\/b>)/, (x, a, b) => a + nf(DB.guests.filter(g => g.shop === stShopF && -daysTo(g.reg) <= {ym:365, yw:364, month:30, week:7, day:1}[stP]).length) + b);
  const lbls = (() => { const n = {ym:12, yw:52, month:30, week:7, day:24}[stP], span = {ym:365, yw:364, month:30, week:7, day:1}[stP], now = new Date(); const from = new Date(now - span * 864e5);
    const f = i => { if (stP === 'day') return i + ':00'; const t = new Date(from.getTime() + (i + .5) * (now - from) / n); return stP === 'ym' ? MONG[t.getMonth()].slice(0, 3) : `${String(t.getDate()).padStart(2, '0')}.${String(t.getMonth() + 1).padStart(2, '0')}`; };
    return `<div class="ax"><span>${f(0)}</span><span>${f(Math.floor(n / 2))}</span><span>${f(n - 1)}</span></div>`; })();
  return h.replace(/(<h2>Заказы<\/h2><div class="chart"[\s\S]*?<\/div><\/div>)(<\/div>)/, `$1${lbls}$2`).replace(/(<h2>Выручка<\/h2><div class="chart"[\s\S]*?<\/div><\/div>)(<\/div>)/, `$1${lbls}$2`);
}; }

/* ── меню: стартовая страница — Заказы, как в Starter; «Зоны доставки» — в Точках; триггеры Starter ── */
(() => { const del = NAV.find(n => n.t === 'Доставка'); del.sub = del.sub.filter(x => x[0] !== 'shops');
  const pts = NAV.find(n => n.t === 'Точки'); if (!pts.sub.some(x => x[0] === 'zones')) pts.sub.push(['zones', 'Зоны доставки']);
  const mk = NAV.find(n => n.t === 'Маркетинг'); mk.sub = mk.sub.map(x => Array.isArray(x) && x[0] === 'autos' ? ['triggers', 'Триггерные рассылки'] : x); mk.also = [...(mk.also || []), 'autos'];
  const ord = NAV.find(n => n.id === 'orders'); ord.also = ['order']; })();
{ const r0 = render; render = function () { if (!location.hash || location.hash === '#' || location.hash === '#/') history.replaceState(null, '', location.pathname + '#/orders'); return r0(); }; }
document.querySelectorAll('a.brand').forEach(a => a.setAttribute('href', '#/orders'));

/* ── опасное — только с подтверждением ── */
const confirmDo = (t, body, fn) => modal({t, body:`<p style="margin-top:0">${body}</p>`, ok:'Удалить', cls:'red', onOk:fn});
document.addEventListener('click', e => {
  const b = e.target.closest('button.x'); if (!b || b.dataset.ok) return;
  const oc = b.getAttribute('onclick') || '';
  if (/DB\.week\.splice|DB\.acc\.splice|DB\.zones\.splice/.test(oc)) { e.preventDefault(); e.stopImmediatePropagation();
    confirmDo('Удалить?', /week/.test(oc) ? 'Блюдо уйдёт из цен недели со следующей недели' : /acc/.test(oc) ? 'Цвет больше не будет выпадать в предложении дня' : 'Зона доставки пропадёт: туда нельзя будет заказать', () => { b.dataset.ok = 1; b.click(); }); }
}, true);
