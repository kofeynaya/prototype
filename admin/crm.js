/* Бэк-офис — по устройству Starter CRM: Клиенты (RFM, фильтры, «Мои сегменты»), карточка клиента, баллы,
   Сегменты (кластеры RFM), Лояльность (вкладки Starter + наши механики), Статистика, Заказы */
'use strict';
document.head.insertAdjacentHTML('beforeend', `<style>
.cr-h{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.cr-h small{color:var(--muted);font-size:15px}
.cr-fp{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px;border-top:1px solid var(--line);background:var(--surface2)}
.cr-fp .fld{margin:0}
.cr-rng{display:flex;gap:6px}.cr-rng .inp{min-width:0}
.cr-chips{display:flex;gap:6px;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--line)}
.cr-chip{display:inline-flex;gap:6px;align-items:center;background:var(--acc-soft);color:var(--acc);border-radius:16px;padding:3px 6px 3px 10px;font-size:12.5px}
.cr-chip button{border:0;background:none;color:inherit;cursor:pointer;font-size:14px;line-height:1;padding:0 2px}
.cr-tb{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:14px}
.cr-tb .sp{flex:1}
th.srt{cursor:pointer;user-select:none} th.srt:hover{color:var(--ink)} th.srt.on{color:var(--acc)}
.cr-badge{background:var(--acc);color:var(--acc-ink);border-radius:9px;font-size:11px;padding:0 6px;margin-left:4px}
.cr-rfm{font:600 12px ui-monospace,Menlo,monospace;background:var(--surface2);border:1px solid var(--line);border-radius:6px;padding:1px 5px}
.cr-gh{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.cr-gh .t{flex:1;min-width:220px}
.cr-gh h1{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.cr-menu{position:relative}
.cr-menu .dd{right:0;left:auto;top:calc(100% + 6px)}
.cr-menu.open .dd{display:block}
.cr-gg{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;align-items:start}
.cr-fav{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--surface)}
.cr-fav>div{padding:12px 14px}.cr-fav>div+div{border-left:1px solid var(--line)}
.cr-fav h4{margin:0 0 8px;font:600 11.5px var(--f-head);text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.cr-fav li{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 0}
.cr-fav ul{list-style:none;margin:0;padding:0}
.cr-donut{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
.cr-donut svg{width:180px;height:180px;flex:none}
.cr-leg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 16px;font-size:12.5px;flex:1;min-width:240px}
.cr-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:middle}
.cr-lvl{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.cr-card{border-radius:14px;padding:16px;min-height:140px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 6px 18px rgba(0,0,0,.12)}
.cr-card b{font:700 20px var(--f-head)} .cr-card .num{font-size:28px}
.cr-spark{width:100%;height:36px;display:block;margin-top:6px}
.kpi .chg{font-size:12px;font-weight:600}.kpi.main .chg{color:#cfe6d9!important}.kpi .chg.up{color:var(--acc)}.kpi .chg.dn{color:var(--red)}
.cr-top li{display:grid;grid-template-columns:26px 1fr auto 24px;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px}
.cr-top ol{list-style:none;margin:0;padding:0}
.cr-st{border:0;border-radius:14px;padding:3px 8px;font-size:12px;font-weight:600;cursor:pointer}
@media (max-width:860px){.cr-fp{grid-template-columns:1fr 1fr}.cr-gg{grid-template-columns:1fr}.cr-fav{grid-template-columns:1fr}.cr-fav>div+div{border-left:0;border-top:1px solid var(--line)}}
@media (max-width:420px){.cr-fp{grid-template-columns:1fr}}
</style>`);

const hsh2 = s => String(s).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const csv = (name, rows) => { const t = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], {type:'text/csv'})); a.download = name; a.click(); };

/* ── данные: что есть в Starter, но не было у нас ── */
DB.guests.forEach(g => { if (!('push' in g)) g.push = g.id === 'G-000001' || hsh2(g.id) % 100 < 31; });
const ST_LIST = ['Создан','Принят','Готовится','Готов','Доставляется','Завершен','Отменен'];
const ST_COL = {'Создан':'#e0e0e0','Принят':'#cfe3ff','Готовится':'#ffe7b3','Готов':'#d4f0dc','Доставляется':'#e3dcff','Завершен':'#e3f1e9','Отменен':'#fdecea'};
DB.orders.forEach(o => { if (!o.status) { const today = o.at.slice(0, 10) === isoDay(); o.status = o.st === 'Возврат' ? 'Отменен' : today ? ['Принят','Готовится','Готов'][hsh2(o.id) % 3] : 'Завершен'; o.hist = [{s:'Создан', at:o.at, by:'Core'}, ...(o.status !== 'Создан' ? [{s:o.status, at:o.at, by:o.ch === 'Касса' ? 'Pos' : 'Core'}] : [])]; } });

/* ── RFM, как в Starter: R — давность, F — частота, M — средний чек ── */
const rfmDays = () => (DB.cfg2 && DB.cfg2.rfmDays) || 90;
let _gsCache = null, _gsKey = '';
function gStatsAll() {
  const key = DB.orders.length + ':' + DB.orders.filter(o => o.st === 'Возврат').length + ':' + rfmDays() + ':' + DB.guests.length;
  if (_gsCache && _gsKey === key) return _gsCache;
  const m = {}; DB.guests.forEach(g => m[g.id] = {n:0, sum:0, first:'', last:'', spent:0, cats:{}, dishes:{}});
  DB.orders.forEach(o => { const s = m[o.g]; if (!s || o.st === 'Возврат') return; s.n++; s.sum += o.sum; s.spent += o.bonUse || 0; if (!s.first || o.at < s.first) s.first = o.at; if (!s.last || o.at > s.last) s.last = o.at;
    o.lines.forEach(l => { s.dishes[l.n] = (s.dishes[l.n] || 0) + 1; const it = itm(l.id); const c = it ? catName(it.cat) : '—'; s.cats[c] = (s.cats[c] || 0) + 1; }); });
  const D = rfmDays();
  Object.values(m).forEach(s => {
    s.avg = s.n ? Math.round(s.sum / s.n) : 0; s.ago = s.last ? -daysTo(s.last.slice(0, 10)) : null;
    if (!s.n) { s.R = 0; s.F = 0; s.M = 0; s.code = '000'; s.cl = 'Нет заказов'; }
    else if (s.ago > D) { s.R = 1; s.F = 0; s.M = 0; s.code = '100'; s.cl = 'Потерянные'; }
    else { s.R = s.ago <= D / 3 ? 3 : s.ago <= D * 2 / 3 ? 2 : 1; s.F = s.n === 1 ? 0 : s.n <= 3 ? 1 : s.n <= 9 ? 2 : 3; s.M = s.avg < 450 ? 1 : s.avg < 800 ? 2 : 3;
      s.code = `${s.R}${s.F}${s.M}`; s.cl = s.F === 0 ? '1 заказ' : (s.R === 1 ? 'Уходящие ' : s.R === 2 ? 'Спящие ' : '') + (s.R === 3 ? ['','Новички','Постоянные','Лояльные'][s.F] : ['','разовые','постоянные','лояльные'][s.F]); }
    s.score = s.R + s.F + s.M;
  });
  _gsCache = m; _gsKey = key; return m;
}
const GS = id => gStatsAll()[id] || {n:0, sum:0, avg:0, code:'000', cl:'Нет заказов', R:0, F:0, M:0, score:0, spent:0, cats:{}, dishes:{}};
const RFM_NAME = c => { const r = c[0], f = c[1], m = ['','маленький','средний','большой'][c[2]];
  if (c === '000') return 'Нет заказов'; if (c === '100') return 'Потерянные';
  if (f === '0') return `1 заказ, ${r === '1' ? 'уходящие' : r === '2' ? 'спящие' : 'новички'}, ${m} чек`;
  if (r === '3' && f === '3') return ['','Чемпионы','Чемпионы+','VIP'][c[2]];
  return `${{1:'Уходящие',2:'Спящие',3:''}[r]} ${{1:'разовые',2:'постоянные',3:'лояльные'}[f]}`.trim().replace(/^р/, 'Р').replace(/^п/, 'П').replace(/^л/, 'Л') + `, ${m} чек`; };
const CLUSTERS = ['Нет заказов','1 заказ','Уходящие разовые','Уходящие постоянные','Уходящие лояльные','Спящие разовые','Спящие постоянные','Спящие лояльные','Новички','Постоянные','Лояльные','Потерянные'];
const CL_COL = ['#c9cfc9','#9bd9d9','#f0a07a','#e57a5a','#c62828','#c5b4e3','#9575cd','#5e35b1','#a7d2b9','#3f9a72','#0d553f','#8a5a00'];

/* условия сегментов — те же, что фильтры клиентов (как «Мои сегменты» в Starter) */
Object.assign(SEG_F, {
  rfmCl: ['RFM-кластер', () => CLUSTERS, (g, v) => GS(g.id).cl === v],
  rfmCode: ['RFM-код', 'n', (g, v) => +GS(g.id).code === +v],
  lastMin: ['Последний заказ, дней — от', 'n', (g, v) => GS(g.id).ago != null && GS(g.id).ago >= v],
  lastMax: ['Последний заказ, дней — до', 'n', (g, v) => GS(g.id).ago != null && GS(g.id).ago <= v],
  cntMin: ['Всего заказов — от', 'n', (g, v) => GS(g.id).n >= v], cntMax: ['Всего заказов — до', 'n', (g, v) => GS(g.id).n <= v],
  avgMin: ['Средний чек, ₽ — от', 'n', (g, v) => GS(g.id).avg >= v], avgMax: ['Средний чек, ₽ — до', 'n', (g, v) => GS(g.id).avg <= v],
  sumMin: ['Сумма заказов, ₽ — от', 'n', (g, v) => GS(g.id).sum >= v], sumMax: ['Сумма заказов, ₽ — до', 'n', (g, v) => GS(g.id).sum <= v],
  bonMax: ['Бонусов — до', 'n', (g, v) => g.bon <= v],
  regDays: ['С нами, дней — не больше', 'n', (g, v) => -daysTo(g.reg) <= v],
  bdMonth: ['ДР в месяце', () => ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'], (g, v) => !!g.bd && +g.bd.slice(5, 7) - 1 === ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'].indexOf(v)],
  pushOk: ['Получает пуши', ['да','нет'], (g, v) => (v === 'да') === !!g.push],
});

/* ───────── Клиенты ───────── */
let cf = {q:'', c:[], open:false, seg:'', sort:'id', dir:1};
const CF_COLS = [['id','ID'],['n','Имя клиента'],['ph','Телефон'],['first','Первый заказ'],['sum','Сумма заказов'],['cnt','Всего заказов'],['rfm','RFM'],['score','Score'],['R','R'],['F','F'],['M','M — средний чек'],['bon','Баллов'],['spent','Потрачено баллов'],['plus','★'],['ser','🔥 Подряд'],['d7','Дней за 7']];
const cfVal = (g, k) => { const s = GS(g.id); return {id:+g.id.slice(2), n:gName(g), ph:g.ph, first:s.first || '', sum:s.sum, cnt:s.n, rfm:+s.code, score:s.score, R:s.R, F:s.F, M:s.avg, bon:g.bon, spent:s.spent, plus:g.plus ? 1 : 0, ser:g.ser, d7:g.days7}[k]; };
function cfSet(f, v) { cf.c = cf.c.filter(x => x.f !== f); if (v !== '' && v != null && !(typeof v === 'number' && isNaN(v))) cf.c.push({f, v}); cf.seg = ''; render(); }
const cfGet = f => (cf.c.find(x => x.f === f) || {}).v ?? '';
function cfList() {
  const q = cf.q.toLowerCase(), qd = q.replace(/\D/g, '');
  let L = DB.guests.filter(g => (!q || gName(g).toLowerCase().includes(q) || (qd && g.ph.replace(/\D/g, '').includes(qd)) || g.id.toLowerCase().includes(q)) && cf.c.every(x => SEG_F[x.f] && SEG_F[x.f][2](g, x.v)));
  L.sort((a, b) => { const x = cfVal(a, cf.sort), y = cfVal(b, cf.sort); return (x > y ? 1 : x < y ? -1 : 0) * cf.dir; });
  return L;
}
PAGES.customers = () => {
  if (!can('guests.view')) return ph('Клиенты') + noPerm('guests.view');
  const L = cfList(), sel = (f, opts, ph_) => `<label class="fld"><span>${ph_}</span><select class="inp" onchange="cfSet('${f}',this.value)"><option value="">Все</option>${opts.map(o => `<option ${String(cfGet(f)) === String(o) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  const rng = (a, b, t) => `<label class="fld"><span>${t}</span><span class="cr-rng"><input class="inp" inputmode="numeric" placeholder="от" value="${cfGet(a)}" onchange="cfSet('${a}',this.value===''?'':+this.value)"><input class="inp" inputmode="numeric" placeholder="до" value="${cfGet(b)}" onchange="cfSet('${b}',this.value===''?'':+this.value)"></span></label>`;
  const one = (f, t) => `<label class="fld"><span>${t}</span><input class="inp" inputmode="numeric" value="${cfGet(f)}" onchange="cfSet('${f}',this.value===''?'':+this.value)"></label>`;
  const nF = cf.c.length;
  return `<div class="ph"><div class="t"><div class="cr-h"><h1>Клиенты</h1><small>${nf(DB.guests.length)}</small><a href="#/blacklist">Чёрный список ›</a></div><p>Поиск, фильтры как в Starter (RFM, ДР, суммы, баллы) и наши: подписка, 🔥 подряд, дней с покупкой за неделю. Нажмите на строку — карточка клиента</p></div>
    <div class="btns"><button class="btn" onclick="cfImport()">⤒ Импорт сегмента</button><button class="btn" ${can('system') ? '' : 'disabled title="Нужно право «Интеграции и резервная копия»"'} onclick="cfExport()">⤓ Экспорт клиентов</button>${can('push.send') ? `<button class="btn pri" onclick="cfMail()">📣 Создать рассылку</button>` : ''}</div></div>
  <div class="card" style="padding:0;overflow:visible">
    <div class="cr-tb"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Искать по телефону, имени…" value="${esc(cf.q)}" oninput="cf.q=this.value;clearTimeout(window._ct);window._ct=setTimeout(()=>{render();const i=document.querySelector('.cr-tb .search input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)"></div>
      <span class="sp"></span><select class="inp" style="width:auto;min-width:200px" onchange="cfSeg(this.value)"><option value="">Мои сегменты</option>${DB.segments.map(s => `<option value="${s.id}" ${cf.seg === s.id ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select>
      <button class="btn ${cf.open ? 'pri' : ''}" onclick="cf.open=!cf.open;render()">⚙︎ Фильтры${nF ? `<span class="cr-badge">${nF}</span>` : ''}</button></div>
    ${cf.open ? `<div class="cr-fp">${sel('shop', DB.shops.map(s => s.n), 'Ресторан')}${sel('rfmCl', CLUSTERS, 'RFM-кластер')}${one('rfmCode', 'RFM-код (например, 311)')}${sel('bdMonth', SEG_F.bdMonth[1](), 'День рождения — месяц')}
      ${one('bd', 'ДР через дней — до')}${one('regDays', 'С нами, дней — до')}${rng('lastMin', 'lastMax', 'Последний заказ: дней')}${rng('cntMin', 'cntMax', 'Всего заказов: шт')}
      ${rng('avgMin', 'avgMax', 'Средний чек: ₽')}${rng('sumMin', 'sumMax', 'Сумма заказов: ₽')}${rng('bon', 'bonMax', 'Всего баллов')}${sel('plus', ['есть','нет'], '★ Кофейная+')}
      ${one('ser', '🔥 Подряд — от')}${rng('days7', 'days7m', 'Дней с покупкой за 7')}${sel('pushOk', ['да','нет'], 'Получает пуши')}${sel('lvl', C('tiers', 'list').map(t => t.n), 'Уровень')}</div>` : ''}
    ${nF ? `<div class="cr-chips">${cf.c.map(x => `<span class="cr-chip">${esc(SEG_F[x.f][0])}${SEG_F[x.f][1] === 'n' ? ': ' : ' — '}${esc(x.v)}<button onclick="cfSet('${x.f}','')" aria-label="Убрать">×</button></span>`).join('')}
      <button class="btn sm" onclick="cf.c=[];cf.seg='';render()">Сбросить</button><button class="btn sm" onclick="cfSave()">💾 Сохранить как сегмент</button><span class="small muted" style="align-self:center">Найдено ${nf(L.length)}</span></div>` : ''}
    <div class="tw" style="border:0;border-top:1px solid var(--line);border-radius:0 0 var(--r) var(--r)"><table><thead><tr>${CF_COLS.map(([k, t]) => `<th class="srt ${cf.sort === k ? 'on' : ''}" onclick="cf.dir=cf.sort==='${k}'?-cf.dir:1;cf.sort='${k}';render()">${t}${cf.sort === k ? (cf.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead><tbody>
    ${L.slice(0, 400).map(g => { const s = GS(g.id); return `<tr class="click" onclick="location.hash='#/guest/${g.id}'"><td>${+g.id.slice(2)}</td><td class="nowrap">${esc(gName(g))}${g.blocked ? ' <span class="pill red">блок</span>' : ''}</td><td class="nowrap">${esc(g.ph)}</td><td class="nowrap small">${s.first ? dShort(s.first) + '.' + s.first.slice(2, 4) : '—'}</td>
      <td class="r nowrap">${rub(s.sum)}</td><td class="c">${s.n}</td><td><span class="cr-rfm" title="${esc(RFM_NAME(s.code))}">${s.code}</span></td><td class="c">${s.score}</td><td class="c">${s.R}</td><td class="c">${s.F}</td><td class="r">${rub(s.avg)}</td><td class="r">${nf(g.bon)}</td><td class="r">${nf(s.spent)}</td>
      <td class="c">${g.plus ? '<span class="star">★</span>' : ''}</td><td class="c">${g.ser || ''}</td><td class="c">${g.days7}</td></tr>`; }).join('')}</tbody></table>${L.length ? '' : '<div class="empty">Никого не нашли — измените фильтры</div>'}</div></div>
  <p class="small muted">RFM считается по заказам за ${rfmDays()} дней (меняется в «Настройках проекта»). Код: R — давность (3 — недавно), F — частота (0 — один заказ … 3 — лояльные), M — средний чек</p>`;
};
function cfSeg(id) { const s = DB.segments.find(x => x.id === id); cf.c = s ? clone(s.c).filter(x => SEG_F[x.f]) : []; cf.seg = id; cf.open = true; render(); }
function cfSave() { modal({t:'Сохранить сегмент', body:`<p class="muted small" style="margin-top:0">${esc(segTxt(cf.c))}</p><label class="fld"><span>Название</span><input class="inp" id="sgn2" placeholder="Например, VIP, последний заказ неделю назад"></label>`, ok:'Сохранить', onOk:() => { const n = val('sgn2'); if (n.length < 3) { toast('Назовите сегмент'); return false; } const s = {id:'s' + Date.now().toString(36), n, c:clone(cf.c)}; DB.segments.push(s); cf.seg = s.id; audit('Новый сегмент', esc(n) + ': ' + esc(segTxt(s.c))); save(); render(); }}); }
function cfExport() {
  const L = cfList();
  modal({t:'Экспорт клиентов', body:`<p style="margin-top:0">Выгрузим ${nf(L.length)} ${plural(L.length, 'клиента', 'клиентов', 'клиентов')} с телефонами — это персональные данные. Действие попадёт в журнал</p>${reasonBox(['Рассылка через подрядчика','Сверка с iiko','Отчёт','Другое'])}`, ok:'Скачать', onOk:() => { const why = needReason(); if (!why) return false;
    csv(`klienty-${isoDay()}.csv`, [CF_COLS.map(c => c[1]), ...L.map(g => CF_COLS.map(([k]) => k === 'rfm' ? GS(g.id).code : cfVal(g, k)))]); audit('Экспорт клиентов', `${L.length} строк · ${esc(why)}`); save(); }});
}
function cfMail() { const s = {id:'tmp-' + Date.now().toString(36), n:'Фильтр клиентов ' + new Date().toTimeString().slice(0, 5), c:clone(cf.c)};
  if (cf.c.length) { if (cf.seg) s.id = cf.seg; else { DB.segments.push(s); save(); } mailSeg(s.id); } else mailSeg(); }
let impTab = 'file';
function cfImport() {
  modal({t:'Импорт сегмента', body:`<p class="small muted" style="margin-top:0">Список телефонов → сегмент для рассылки. Подходят XLSX/CSV с телефонами в первом столбце или список вручную</p>
    <div class="seg" style="margin-bottom:12px"><button class="${impTab === 'file' ? 'on' : ''}" onclick="impTab='file';closeModal();cfImport()">Загрузить файл</button><button class="${impTab === 'hand' ? 'on' : ''}" onclick="impTab='hand';closeModal();cfImport()">Указать вручную</button></div>
    ${impTab === 'file' ? '<label class="btn">📂 Выбрать CSV<input type="file" accept=".csv,.txt" hidden onchange="this.files[0].text().then(t=>{document.getElementById(\'imt\').value=t;toast(\'Файл прочитан — проверьте и сохраните\')})"></label><textarea class="inp" id="imt" style="margin-top:10px" placeholder="Содержимое файла появится здесь"></textarea>' : '<textarea class="inp" id="imt" rows="8" placeholder="+7 911 177-07-77\n89101234567"></textarea>'}
    <label class="fld" style="margin-top:10px"><span>Название сегмента</span><input class="inp" id="imn" placeholder="Например, гости с дегустации"></label>`,
    ok:'Сохранить', onOk:() => { const ph = [...new Set((val('imt').match(/(\+?7|8)?[\s(-]*9\d{2}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g) || []).map(x => x.replace(/\D/g, '').slice(-10)))];
      if (!ph.length) { toast('Не нашёл ни одного мобильного номера'); return false; } if (val('imn').length < 3) { toast('Назовите сегмент'); return false; }
      const ids = DB.guests.filter(g => ph.includes(g.ph.replace(/\D/g, '').slice(-10))).map(g => g.id);
      DB.segments.push({id:'s' + Date.now().toString(36), n:val('imn'), c:[{f:'ids', v:ids.join(',')}]}); audit('Импорт сегмента', `${esc(val('imn'))}: ${ph.length} номеров, из них наших гостей ${ids.length}`); save(); render();
      toast(`Сегмент сохранён: ${ids.length} из ${ph.length} номеров — наши гости`); }});
}
SEG_F.ids = ['Список телефонов (импорт)', 'n', (g, v) => String(v).split(',').includes(g.id)];

/* ───────── Карточка клиента — отдельная страница, как в Starter ───────── */
const GT = [['main','Общие'],['wallet','Кошелёк'],['visits','Посещения'],['perks','Выгоды и подарки'],['orders','Заказы'],['msgs','Сообщения'],['log','Журнал'],['utm','UTM'],['dev','Device ID']];
openGuest = function (id, tab) { gTab = tab || gTab; const h = '#/guest/' + id; if (location.hash !== h) location.hash = h; else render(); };
gUpd = function (g, what, detail) { audit(what, detail, {g:g.id}); save(); render(); };
GTAB.utm = g => `<div class="card"><h3>UTM-метки</h3><p class="muted">${GS(g.id).n ? 'Пришёл из приложения напрямую — меток нет' : 'Для этого клиента нет UTM-меток'}</p></div>`;
GTAB.dev = g => `<div class="card"><h3>Устройство</h3><dl class="kv" style="margin-top:10px"><dt>Платформа</dt><dd>${hsh2(g.id) % 2 ? 'iOS' : 'Android'}</dd><dt>Пуш-уведомления</dt><dd>${g.push ? 'разрешены' : 'не разрешены'}</dd><dt>Analytics ID</dt><dd class="small">${hsh2(g.id + 'a').toString(16)}…</dd></dl><p class="small muted">IP и рекламный ID — персональные данные: показываем только владельцу по запросу</p></div>`;
GTAB.main = g => { const s = GS(g.id), top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const ord = DB.orders.filter(o => o.g === g.id), done = ord.filter(o => o.status === 'Завершен'), work = ord.filter(o => !['Завершен','Отменен'].includes(o.status)), canc = ord.filter(o => o.status === 'Отменен');
  const ev = [...ord.slice(0, 6).map(o => [o.at.replace('T', ' '), `Заказ ${o.id} · ${o.ch}`, o.ch === 'Касса' ? '🧾' : '📱']), ...DB.audit.filter(a => a.g === g.id).slice(0, 4).map(a => [tm(a.at), a.what, '🧑‍💼']), [g.reg + ' 10:00', 'Регистрация в приложении', '📱']].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8);
  window._gOrd = window._gOrd || 'done';
  return `<div class="cr-gg"><div class="card"><dl class="kv"><dt>Дата регистрации</dt><dd>${dLong(g.reg)}</dd><dt>Средний чек</dt><dd>${rub(s.avg)}</dd><dt>Общая сумма покупок</dt><dd>${rub(s.sum)}</dd>
      <dt>Всего баллов</dt><dd>${nf(g.bon)} <a href="javascript:gPoints('${g.id}')" class="pill ok" style="text-decoration:none">История и управление</a></dd>${g.gbon ? `<dt>Подарочные бонусы</dt><dd>${nf(g.gbon)}</dd>` : ''}<dt>Депозит</dt><dd>${rub(g.dep)}</dd>
      <dt>RFM</dt><dd><span class="cr-rfm">${s.code}</span> ${esc(RFM_NAME(s.code))}</dd><dt>Кофейная+</dt><dd>${g.plus ? `<span class="pill prem">★ ${esc(g.plus.t)}</span> до ${dLong(g.plus.till)}` : 'нет'}</dd>
      <dt>🔥 Подряд</dt><dd>${g.ser} · 👑 ${g.best} · всего ${g.total} · ${esc(g.lvl)}</dd></dl>
      <hr style="border:0;border-top:1px solid var(--line);margin:14px 0"><dl class="kv"><dt>Имя</dt><dd>${esc(g.n)}</dd><dt>Фамилия</dt><dd>${esc(g.l) || '—'}</dd><dt>Пол</dt><dd>${g.sex === 'f' ? 'Женский' : 'Мужской'}</dd><dt>День рождения</dt><dd>${g.bd ? dLong(g.bd) : '—'}</dd><dt>Любимая кофейня</dt><dd>${esc(g.shop)}</dd><dt>Язык</dt><dd>RU</dd><dt>Пуши</dt><dd>${g.push ? 'получает' : 'не разрешил'}</dd></dl>
      <dl class="kv" style="margin-top:12px"><dt>iikoCard</dt><dd>${esc(g.iiko) || '—'}</dd><dt>Starter</dt><dd>${esc(g.starter) || '—'}</dd></dl></div>
    <div><div class="cr-fav"><div><h4>Любимые категории</h4>${s.n ? `<ul>${top(s.cats).map(([k, v]) => `<li><span>${esc(k)}</span><b>${v}</b></li>`).join('')}</ul>` : '<p class="muted small">Пока нет данных</p>'}</div><div><h4>Любимые блюда</h4>${s.n ? `<ul>${top(s.dishes).map(([k, v]) => `<li><span>${esc(k)}</span><b>${v}</b></li>`).join('')}</ul>` : '<p class="muted small">Пока нет данных</p>'}</div></div>
      <div class="card" style="margin-top:16px"><h3>История</h3><div class="tw" style="margin-top:8px"><table><thead><tr><th>Время</th><th>Событие</th><th></th></tr></thead><tbody>${ev.map(e => `<tr><td class="nowrap small">${esc(e[0].slice(0, 16))}</td><td class="small">${esc(e[1])}</td><td>${e[2]}</td></tr>`).join('')}</tbody></table></div></div></div></div>
  <div class="card"><h3>Заказы</h3><div class="tabs" style="margin-top:8px">${[['done','Завершённые',done],['work','В работе',work],['canc','Отменённые',canc]].map(([k, t, a]) => `<button class="${_gOrd === k ? 'on' : ''}" onclick="_gOrd='${k}';render()">${t} <span class="pill">${a.length}</span></button>`).join('')}</div>
    ${(() => { const a = {done, work, canc}[_gOrd]; return a.length ? ordersTable(a) : '<div class="empty">Заказов нет</div>'; })()}</div>`; };
PAGES.guest = r => {
  const g = G(r[1]); if (!g) return ph('Клиент не найден') + '<a href="#/customers">← Клиенты</a>';
  if (r[2] && GTAB[r[2]]) gTab = r[2]; if (!GTAB[gTab]) gTab = 'main';
  if (!can('guests.view')) return noPerm('guests.view');
  return `<p style="margin:0 0 8px"><a href="#/customers">← Клиенты</a></p><div class="cr-gh"><div class="t"><h1>${ava(g)} ${esc(gName(g))}${g.blocked ? ' <span class="pill red">в чёрном списке</span>' : ''}</h1>
      <div class="muted small" style="margin-top:4px">${g.id} · ${esc(g.ph)} <button class="btn sm ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText('${esc(g.ph)}');toast('Телефон скопирован')">⧉</button></div></div>
    <div class="btns"><div class="cr-menu" id="gmn"><button class="btn" onclick="document.getElementById('gmn').classList.toggle('open')">⚙︎ Настройки ▾</button><div class="dd">
      ${[['guests.edit','✏️ Изменить профиль',`gEdit('${g.id}')`],['guests.block',g.blocked ? 'Разблокировать' : '⛔ В чёрный список',`gBlock('${g.id}')`],['guests.edit','Выйти на всех устройствах',`gLogout('${g.id}')`],['system','🗑 Удалить пользователя',`gDel('${g.id}')`]].map(([p, t, f]) => can(p) ? `<a href="javascript:${f}">${t}</a>` : '').join('')}</div></div>
      ${can('guests.bonus') ? `<button class="btn" onclick="gPoints('${g.id}')">🪙 Баллы</button>` : ''}${can('push.send') ? `<button class="btn pri" onclick="pushTo('${g.id}')">📣 Отправить уведомление</button>` : ''}</div></div>
  <div class="card" style="margin-bottom:16px;padding:12px 18px"><div class="btns">${act('guests.depo', '₽ Депозит', `gDepo('${g.id}')`)}${act('guests.sub', '★ Подписка', `gSub('${g.id}')`)}${act('guests.streak', '🔥 Посещения', `gStreak('${g.id}')`)}${act('guests.streak', '❄️ Заморозки', `gFz('${g.id}')`)}${act('guests.streak', '🎁 Подарок', `gGift('${g.id}')`)}${act('support.reply', '💬 Чат', `gChat('${g.id}')`)}</div></div>
  <div class="tabs">${GT.map(([k, t]) => `<button class="${gTab === k ? 'on' : ''}" onclick="gTab='${k}';render()">${t}</button>`).join('')}</div>${GTAB[gTab](g)}`;
};
function gDel(id) { const g = G(id);
  modal({t:'Удалить пользователя?', body:`<p style="margin-top:0">${esc(gName(g))} пропадёт из базы вместе с бонусами (${nf(g.bon)}), депозитом (${rub(g.dep)}) и посещениями. Заказы останутся без имени. Отменить нельзя</p><label class="fld"><span>Чтобы подтвердить, введите последние 4 цифры телефона</span><input class="inp" id="dl4" inputmode="numeric"></label>${reasonBox(['Гость попросил удалить данные','Дубликат','Другое'])}`,
    ok:'Удалить', cls:'red', onOk:() => { if (val('dl4') !== g.ph.replace(/\D/g, '').slice(-4)) { toast('Цифры не совпали'); return false; } if (g.dep > 0) { toast(`Сначала верните депозит ${rub(g.dep)} — это деньги гостя`); return false; } const why = needReason(); if (!why) return false;
      DB.guests.splice(DB.guests.indexOf(g), 1); audit('Удалили пользователя', `${g.id} · ${esc(why)}`); save(); location.hash = '#/customers'; }});
}

/* ── «История и управление» баллами (как в Starter) ── */
const EARN = () => (DB.loy && DB.loy.lvls && DB.loy.lvls[0] ? DB.loy.lvls[0].pct : 3) / 100;
function gPoints(id) {
  const g = G(id), ords = DB.orders.filter(o => o.g === id), ev = [];
  ords.forEach(o => { if (o.st !== 'Возврат') ev.push({at:o.at, ord:o.id, sum:o.sum, d:Math.round(o.sum * EARN()), c:'Кэшбэк за заказ', t:'Начисление', st:'Проведена'}); if (o.bonUse) ev.push({at:o.at, ord:o.id, sum:o.sum, d:-o.bonUse, c:'Оплата баллами', t:'Списание', st: o.st === 'Возврат' ? 'Отменена' : 'Проведена'}); });
  DB.ops.filter(o => o.g === id && o.kind === 'bon').forEach(o => ev.push({at:new Date(o.at).toISOString().slice(0, 16), ord:'', sum:'', d:o.d, c:o.why, t:'Ручное', st:'Проведена'}));
  ev.sort((a, b) => b.at.localeCompare(a.at)); let bal = g.bon; ev.forEach(e => { e.bal = bal; if (e.st === 'Проведена') bal -= e.d; });
  window._pev = ev;
  modal({t:'Баллы клиента', wide:1, ok:'', cancel:'Закрыть', body:`<div class="grid g2"><div class="card"><h3>Гость</h3><dl class="kv" style="margin-top:8px"><dt>Телефон</dt><dd>${esc(g.ph)}</dd><dt>Имя</dt><dd>${esc(gName(g))}</dd><dt>Баланс</dt><dd><b>${nf(g.bon)}</b> ${g.gbon ? `+ ${nf(g.gbon)} подарочных` : ''}</dd></dl></div>
    <div class="card"><h3>Управление баллами</h3>${can('guests.bonus') ? `<div class="row" style="margin-top:8px;align-items:end"><div class="seg" style="flex:0"><button class="on" id="ps1" onclick="this.classList.add('on');document.getElementById('ps0').classList.remove('on')">＋</button><button id="ps0" onclick="this.classList.add('on');document.getElementById('ps1').classList.remove('on')">−</button></div><label class="fld" style="margin:0"><span>Сумма</span><input class="inp" id="pa" inputmode="numeric"></label></div>
      <label class="fld" style="margin-top:10px"><span>Комментарий *</span><input class="inp" id="pc" placeholder="Обязательно: зачем меняем"></label><label class="chk" style="margin-bottom:10px"><input type="checkbox" id="pp" checked> Сообщить гостю пушем</label><button class="btn pri" onclick="gPtsDo('${id}')">Изменить баланс</button>
      <p class="small muted">Лимит без подтверждения: ${lim('bonus') ? nf(lim('bonus')) : 'нет'}. ${C('bonus', 'ledger') === 'iikoCard (вариант A)' || (DB.loy && DB.loy.prov === 'iiko Cloud') ? 'Баланс ведёт iiko — изменение уйдёт туда' : ''}</p>` : noPerm('guests.bonus')}</div></div>
    <div class="card"><div class="card-h"><h3>История транзакций</h3><span class="sp"></span><button class="btn sm" onclick="csv('bally-${id}.csv',[['Дата','Заказ','Сумма заказа','Баллы','Баланс','Комментарий','Статус','Тип'],..._pev.map(e=>[e.at,e.ord,e.sum,e.d,e.bal,e.c,e.st,e.t])])">Экспортировать</button></div>
    ${ev.length ? `<div class="tw" style="max-height:360px"><table><thead><tr><th>Дата</th><th>Заказ №</th><th class="r">Сумма заказа</th><th class="r">Баллы</th><th class="r">Баланс</th><th>Комментарий</th><th>Статус</th><th>Тип</th></tr></thead><tbody>${ev.map(e => `<tr><td class="nowrap small">${esc(e.at.replace('T', ' '))}</td><td>${e.ord}</td><td class="r">${e.sum === '' ? '' : rub(e.sum)}</td><td class="r" style="color:${e.d > 0 ? 'var(--acc)' : 'var(--red)'}">${e.d > 0 ? '+' : '−'}${nf(Math.abs(e.d))}</td><td class="r">${nf(e.bal)}</td><td class="small">${esc(e.c)}</td><td class="small">${e.st}</td><td class="small">${e.t}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Операций с баллами пока не было</div>'}</div>`});
}
function gPtsDo(id) {
  const g = G(id), a = parseInt(val('pa').replace(/\D/g, ''), 10), s = document.getElementById('ps1').classList.contains('on') ? 1 : -1, c = val('pc');
  if (!a) { toast('Введите количество баллов'); return; } if (c.length < 4) { document.getElementById('pc').classList.add('err'); toast('Комментарий обязателен'); return; }
  if (s < 0 && a > g.bon) { toast(`Столько нет — у гостя ${nf(g.bon)}`); return; }
  const op = {type:'bonus', g:id, k:'bon', d:s * a, why:'Ручное изменение · ' + c, push:val('pp')}; closeModal();
  if (lim('bonus') && a > lim('bonus')) askApproval(op, `${s > 0 ? '+' : '−'}${nf(a)} бонусов`); else applyOp(op);
}

/* ───────── Сегменты — кластеры RFM, как в Starter ───────── */
const _segMine = PAGES.segments;
let segOpen = '';
PAGES.segments = () => {
  const by = {}; CLUSTERS.forEach(c => by[c] = []); DB.guests.forEach(g => (by[GS(g.id).cl] || by['Нет заказов']).push(g));
  const money = a => a.reduce((x, g) => x + GS(g.id).sum, 0), tot = DB.guests.reduce((x, g) => x + GS(g.id).sum, 0) || 1, push = a => a.filter(g => g.push).length;
  let ang = 0; const arcs = CLUSTERS.map((c, i) => { const v = money(by[c]) / tot; if (!v) return ''; const a0 = ang, a1 = ang + v * Math.PI * 2; ang = a1; const L = v > .5 ? 1 : 0, p = (a, r) => `${90 + r * Math.sin(a)} ${90 - r * Math.cos(a)}`;
    return `<path d="M${p(a0, 80)}A80 80 0 ${L} 1 ${p(a1 - .0001, 80)}L${p(a1 - .0001, 50)}A50 50 0 ${L} 0 ${p(a0, 50)}Z" fill="${CL_COL[i]}"/>`; }).join('');
  const all = DB.guests.length, pu = push(DB.guests);
  return ph('Сегменты', `Клиенты по RFM: давность, частота, средний чек за ${rfmDays()} дней. Из ${nf(all)} гостей пуши получают ${nf(pu)} (${Math.round(pu / all * 100)}%)`, `<a class="btn" href="#/customers">Клиенты</a>${can('push.send') ? '<a class="btn pri" href="#/mailings">Рассылки</a>' : ''}`)
  + `<div class="card"><h2>Доход по кластерам</h2><div class="cr-donut" style="margin-top:10px"><svg viewBox="0 0 180 180">${arcs}<text x="90" y="86" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">всего</text><text x="90" y="104" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${nf(tot / 1000)} тыс</text></svg>
    <div class="cr-leg">${CLUSTERS.map((c, i) => `<span><i style="background:${CL_COL[i]}"></i>${c} · ${Math.round(money(by[c]) / tot * 100)}%</span>`).join('')}</div></div></div>
  <div class="tw" style="margin-top:16px"><table><thead><tr><th>Кластер</th><th class="r">Клиентов</th><th class="r">Push</th><th class="r">Принесли денег</th><th class="r">Дней с покупкой за 7 (ср.)</th><th></th></tr></thead><tbody>${CLUSTERS.map((c, i) => { const a = by[c], d7 = a.length ? (a.reduce((x, g) => x + g.days7, 0) / a.length).toFixed(1).replace('.', ',') : '—';
    return `<tr class="click" onclick="segOpen=segOpen==='${c}'?'':'${c}';render()"><td><i class="sw-c" style="background:${CL_COL[i]};width:12px;height:12px;border-radius:3px;margin-right:8px"></i><b>${c}</b></td><td class="r">${nf(a.length)}</td><td class="r">${nf(push(a))}</td><td class="r">${rub(money(a))}</td><td class="r">${d7}</td><td class="r small">${segOpen === c ? '▲' : '▼'}</td></tr>
    ${segOpen === c ? `<tr><td colspan="6" style="background:var(--surface2)">${segCl(c, a)}</td></tr>` : ''}`; }).join('')}</tbody></table></div>
  <h2 style="margin:26px 0 10px">Мои сегменты</h2>` + _segMine().replace(/^<div class="ph">[\s\S]*?<\/div><\/div>/, '').replace(/^<div class="ph">[\s\S]*?<\/p><\/div>/, '');
};
function segCl(c, a) {
  const codes = {}; a.forEach(g => (codes[GS(g.id).code] = codes[GS(g.id).code] || []).push(g));
  return `<div class="btns" style="margin:4px 0 10px"><button class="btn sm" onclick="csv('segment.csv',[['ID','Имя','Телефон','RFM'],...DB.guests.filter(g=>GS(g.id).cl==='${c}').map(g=>[g.id,gName(g),g.ph,GS(g.id).code])]);audit('Экспорт сегмента','${c}');save()">Экспортировать</button>${can('push.send') ? `<button class="btn sm pri" onclick="segMailCl('${c}')">Создать рассылку</button>` : ''}</div>
  <div class="tw"><table><thead><tr><th>Сегмент</th><th class="c">R</th><th class="c">F</th><th class="c">M</th><th>RFM</th><th class="r">Клиентов</th><th class="r">Push</th><th class="r">Принесли денег</th></tr></thead><tbody>${Object.entries(codes).sort().map(([k, L]) => `<tr><td>${esc(RFM_NAME(k))}</td><td class="c">${k[0]}</td><td class="c">${k[1]}</td><td class="c">${k[2]}</td><td><span class="cr-rfm">${k}</span></td><td class="r">${L.length}</td><td class="r">${L.filter(g => g.push).length}</td><td class="r">${rub(L.reduce((x, g) => x + GS(g.id).sum, 0))}</td></tr>`).join('')}</tbody></table></div>`;
}
function segMailCl(c) { let s = DB.segments.find(x => x.c.length === 1 && x.c[0].f === 'rfmCl' && x.c[0].v === c); if (!s) { s = {id:'s' + Date.now().toString(36), n:'RFM: ' + c, c:[{f:'rfmCl', v:c}]}; DB.segments.push(s); save(); } mailSeg(s.id); }

/* ───────── Лояльность — вкладки Starter + наши механики ───────── */
DB.loy = DB.loy || {
  prov:'iiko Cloud', name:'Бонусная программа NEW', accr:'iiko Cloud', wo:'iiko Cloud',
  share:99, withPromo:false, withDisc:false, afterDisc:true, onDelivery:true, onSite:true, showBack:true,
  grow:'sum',
  lvls:[{n:'Бронза', from:0, pct:3, bg:'#b87333', fg:'#ffffff'}, {n:'Серебро', from:20000, pct:4, bg:'#9e9e9e', fg:'#ffffff'}, {n:'Золото', from:40000, pct:5, bg:'#f2c230', fg:'#212221'}],
  reg:{t:'Активируйте баллы', d:'Заполните анкету — и баллы можно будет тратить', fields:[['Имя','Строка',1,1],['Фамилия','Строка',1,1],['Пол','Список',1,1],['День рождения','Дата',0,1],['Эл. почта','Строка',0,0],['Согласие на рассылку','Логический',0,1]], btnOut:['Получать бонусы и скидки','Войдите по номеру телефона'], btnIn:['Активировать баллы','Заполните анкету — это минута']},
  welcome:{auth:[false,0], first:[false,0], form:[false,0], t:'🎁 Вам начислены баллы', b:'{{ welcome_bonuses }} баллов уже на счёте — потратьте на любимый кофе'},
  burn:{cash:25, welcome:2, warn:true},
  rules:[['Что такое кэшбэк','С каждого заказа возвращаем часть суммы баллами'],['Как повышать кэшбэк','Чем больше сумма заказов за всё время, тем выше уровень'],['Что такое баллы','1 балл = 1 ₽. Можно оплатить до 99% заказа. Нельзя вместе со скидками и акциями'],['Сколько уровней кэшбэка','Бронза 3% · Серебро 4% от 20 000 ₽ · Золото 5% от 40 000 ₽']],
  lim:{noEarn:false, noSpend:false, cats:[], dishes:[]},
};
let loyTab = 'connect', loyD = null;
const LOY_T = [['connect','Подключение'],['levels','Уровни'],['points','Баллы'],['reg','Регистрация'],['welcome','Приветственные баллы'],['burn','Сгорание баллов'],['rules','Правила ПЛ'],['limits','Ограничения'],['ours','Наши механики']];
const lset = (path, v) => { const p = path.split('.'); let o = loyD; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; render(); };
PAGES.loyalty = r => {
  if (r[1] && LOY_T.some(t => t[0] === r[1])) loyTab = r[1];
  if (!loyD) loyD = clone(DB.loy);
  const ro = !can('mech.edit'), dis = ro ? 'disabled' : '', dirty = JSON.stringify(loyD) !== JSON.stringify(DB.loy), L = loyD;
  const inp = (path, v, t = 'text', extra = '') => `<input class="inp" ${dis} ${t === 'n' ? 'inputmode="numeric"' : ''} value="${esc(v)}" onchange="lset('${path}',${t === 'n' ? '+this.value.replace(/[^0-9.]/g,\'\')' : 'this.value'})" ${extra}>`;
  const chk = (path, v, t, hint = '') => `<label class="chk" style="margin:8px 0"><input type="checkbox" ${dis} ${v ? 'checked' : ''} onchange="lset('${path}',this.checked)"> <span>${t}${hint ? `<br><span class="small muted">${hint}</span>` : ''}</span></label>`;
  const ext = L.prov !== 'Starter' && L.prov !== 'Свой сервис (наш backend)';
  let b = '';
  if (loyTab === 'connect') b = `<div class="card"><h3>Программа лояльности</h3><p class="small muted">Одна на выбор. Сейчас в Starter выбрана iiko Cloud — баллы начисляет и списывает iiko</p><div class="grid g3" style="margin-top:10px">${['Starter','iiko Card','iiko Cloud','Prime Hill','Premium Bonus','Pro Bonus','Свой сервис (наш backend)'].map(p => `<label class="card" style="cursor:pointer;margin:0;${L.prov === p ? 'border-color:var(--acc);box-shadow:0 0 0 2px var(--acc-soft)' : ''}"><input type="radio" name="lp" ${dis} ${L.prov === p ? 'checked' : ''} onchange="lset('prov','${p}')"> <b>${p}</b>${p.startsWith('Свой') ? '<div class="small muted">Наши механики целиком: ритм, посещения подряд, 6-й, депозит. Нужно согласие Starter</div>' : ''}</label>`).join('')}</div>
    <label class="fld" style="margin-top:14px"><span>Название программы лояльности *</span>${inp('name', L.name)}<small>Из кабинета iiko biz → «Программы»</small></label>
    <div class="fld"><span>Client Secret API программы лояльности *</span><input class="inp" disabled value="•••••••• хранится на сервере"></div></div>
    <div class="grid g2"><div class="card"><h3>Кто начисляет баллы</h3>${['iiko Cloud','Starter','Наш сервис'].map(p => `<label class="chk" style="margin:8px 0"><input type="radio" name="la" ${dis} ${L.accr === p ? 'checked' : ''} onchange="lset('accr','${p}')"> Пополняет баллы ${p}</label>`).join('')}<p class="small muted">Выберите одно — иначе баллы начислятся дважды. Выключите начисление в кассе, если начисляет не она</p></div>
    <div class="card"><h3>Кто списывает баллы</h3>${['iiko Cloud','Starter','Наш сервис'].map(p => `<label class="chk" style="margin:8px 0"><input type="radio" name="lw" ${dis} ${L.wo === p ? 'checked' : ''} onchange="lset('wo','${p}')"> Списывает баллы ${p}</label>`).join('')}</div></div>
    ${L.accr !== L.wo ? '<div class="note red">⚠️ <span>Начисляет одна система, списывает другая — баланс разойдётся. Так можно только при общем балансе</span></div>' : ''}`;
  if (loyTab === 'levels') b = `<div class="card"><div class="tog"><span><b>Уровень растёт по</b><br><span class="small muted">В Starter — сумма заказов за всё время. У нас — посещения подряд (Серебряный / Золотой / Платиновый)</span></span>
      <div class="seg"><button class="${L.grow === 'sum' ? 'on' : ''}" ${dis} onclick="lset('grow','sum')">Сумме заказов</button><button class="${L.grow === 'visits' ? 'on' : ''}" ${dis} onclick="lset('grow','visits')">Посещениям подряд</button></div></div>
      ${L.grow === 'visits' ? `<div class="note blue" style="margin-top:12px">ℹ️ <span>Уровни по посещениям настраиваются в <a href="#/m/tiers">правилах «Уровни»</a>: ${C('tiers', 'list').map(t => `${esc(t.n)} с ${t.from}`).join(' · ')}</span></div>` : ''}
      ${ext && L.grow === 'sum' ? `<div class="note" style="margin-top:12px">⚠️ <span>Уровни сейчас ведёт ${esc(L.prov)} — здесь они должны совпадать с настройками там</span></div>` : ''}</div>
    ${L.grow === 'sum' ? `<div class="cr-lvl">${L.lvls.map((l, i) => `<div class="card" style="margin:0"><div class="cr-card" style="background:${l.bg};color:${l.fg}"><b>${esc(l.n)}</b><div><div class="num">${l.pct}%</div><div class="small" style="opacity:.85">кэшбэк · от ${rub(l.from)}</div></div></div>
      <label class="fld" style="margin-top:12px"><span>Название *</span>${inp(`lvls.${i}.n`, l.n)}</label><div class="row"><label class="fld"><span>Сумма заказов за всё время, ₽ *</span>${inp(`lvls.${i}.from`, l.from, 'n', i ? '' : 'disabled title="Базовый — с 0"')}</label><label class="fld"><span>Начислять, % *</span>${inp(`lvls.${i}.pct`, l.pct, 'n')}</label></div>
      <div class="row"><label class="fld"><span>Цвет карты</span><input type="color" ${dis} value="${l.bg}" onchange="lset('lvls.${i}.bg',this.value)" style="width:100%;height:38px;border:1px solid var(--line2);border-radius:9px;background:none"></label><label class="fld"><span>Цвет текста</span><select class="inp" ${dis} onchange="lset('lvls.${i}.fg',this.value)"><option value="#212221" ${l.fg === '#212221' ? 'selected' : ''}>Чёрный</option><option value="#ffffff" ${l.fg === '#ffffff' ? 'selected' : ''}>Белый</option></select></label></div>
      ${i && !ro ? `<button class="btn sm ghost" style="color:var(--red)" onclick="loyD.lvls.splice(${i},1);render()">Удалить уровень</button>` : ''}</div>`).join('')}
      ${ro || L.lvls.length >= 6 ? '' : '<button class="btn" style="min-height:140px" onclick="loyD.lvls.push({n:\'Новый уровень\',from:(loyD.lvls[loyD.lvls.length-1].from||0)+20000,pct:loyD.lvls[loyD.lvls.length-1].pct+1,bg:\'#0d553f\',fg:\'#ffffff\'});render()">＋ Добавить уровень</button>'}</div><p class="small muted">Оптимально 3–5 уровней</p>` : ''}`;
  if (loyTab === 'points') b = `<div class="card"><label class="fld"><span>% от суммы заказа можно погасить баллами</span><div class="u-wrap" style="max-width:200px">${inp('share', L.share, 'n')}<i>%</i></div><small>В Starter сейчас 99%. В наших правилах — ${C('bonus', 'maxShare')}% (<a href="#/m/bonus">правила бонусов</a>)</small></label>
    ${L.share !== C('bonus', 'maxShare') ? `<div class="note" style="margin-bottom:10px">⚠️ <span>Здесь ${L.share}%, а в правилах приложения ${C('bonus', 'maxShare')}% — гость увидит разные цифры. Выберите одно</span></div>` : ''}
    <h3 style="margin-top:14px">Применение баллов и акций в заказе</h3>${chk('withPromo', L.withPromo, 'Можно сочетать баллы и промокод')}${chk('withDisc', L.withDisc, 'Можно сочетать баллы и скидки', 'У нас — да: на строку одна лучшая скидка, поверх бонусы и депозит')}${chk('afterDisc', L.afterDisc, 'Начислять баллы с заказа за вычетом баллов и скидок')}
    <h3 style="margin-top:14px">Где начислять и списывать</h3>${chk('onDelivery', L.onDelivery, 'Можно накопить и списать баллы на услугу доставки')}${chk('onSite', L.onSite, 'Можно списать баллы на сайте', 'По умолчанию — только в приложении')}
    <h3 style="margin-top:14px">В корзине</h3>${chk('showBack', L.showBack, 'Показать строку «Вернётся баллами»')}</div>`;
  if (loyTab === 'reg') b = `<div class="card"><h3>Анкета активации баллов</h3><p class="small muted">Пока гость не заполнит анкету, тратить баллы нельзя. В нашем приложении после кода из СМС обязательны имя, фамилия и пол, день рождения — по желанию</p>
    <div class="row"><label class="fld"><span>Заголовок *</span>${inp('reg.t', L.reg.t)}</label><label class="fld"><span>Описание *</span>${inp('reg.d', L.reg.d)}</label></div>
    <div class="tw"><table><thead><tr><th>Поле</th><th>Тип</th><th class="c">Обязательное</th><th class="c">При активации</th><th></th></tr></thead><tbody>${L.reg.fields.map((f, i) => `<tr><td>${inp(`reg.fields.${i}.0`, f[0])}</td><td><select class="inp" ${dis} onchange="lset('reg.fields.${i}.1',this.value)">${['Строка','Дата','Список','Логический','Число'].map(o => `<option ${o === f[1] ? 'selected' : ''}>${o}</option>`).join('')}</select></td>
      <td class="c"><input type="checkbox" ${dis} ${f[2] ? 'checked' : ''} onchange="lset('reg.fields.${i}.2',this.checked?1:0)"></td><td class="c"><input type="checkbox" ${dis} ${f[3] ? 'checked' : ''} onchange="lset('reg.fields.${i}.3',this.checked?1:0)"></td><td>${ro ? '' : `<button class="x" onclick="loyD.reg.fields.splice(${i},1);render()">✕</button>`}</td></tr>`).join('')}</tbody></table></div>
    ${ro ? '' : '<button class="btn sm" style="margin-top:10px" onclick="loyD.reg.fields.push([\'Новое поле\',\'Строка\',0,0]);render()">＋ Добавить поле</button>'}</div>
    <div class="grid g2"><div class="card"><h3>Кнопка к анкете: клиент не вошёл</h3><label class="fld"><span>Заголовок *</span>${inp('reg.btnOut.0', L.reg.btnOut[0])}</label><label class="fld"><span>Описание *</span>${inp('reg.btnOut.1', L.reg.btnOut[1])}</label></div>
    <div class="card"><h3>Кнопка к анкете: клиент вошёл</h3><label class="fld"><span>Заголовок *</span>${inp('reg.btnIn.0', L.reg.btnIn[0])}</label><label class="fld"><span>Описание *</span>${inp('reg.btnIn.1', L.reg.btnIn[1])}</label></div></div>`;
  if (loyTab === 'welcome') b = `<div class="card">${[['auth','За первую авторизацию в приложении'],['first','За первый заказ в приложении'],['form','За заполнение анкеты']].map(([k, t]) => `<div class="prm"><div class="l"><b>${t}</b><p>Начислим только тем, кто сделает это впервые после включения</p></div><div style="display:flex;gap:10px;align-items:center;justify-content:flex-end"><div class="u-wrap" style="max-width:150px">${inp(`welcome.${k}.1`, L.welcome[k][1], 'n')}<i>баллов</i></div>${sw('w' + k, L.welcome[k][0], dis + ` onchange="lset('welcome.${k}.0',this.checked)"`)}</div></div>`).join('')}</div>
    <div class="card"><h3>Пуш о начислении</h3><label class="fld"><span>Заголовок * · до 30</span>${inp('welcome.t', L.welcome.t, 'text', 'maxlength="30"')}</label><label class="fld"><span>Текст * · до 140</span>${inp('welcome.b', L.welcome.b, 'text', 'maxlength="140"')}</label>${pzWarn(textCheck(L.welcome.t, L.welcome.b))}
    <p class="small muted">Переменные: {{ username }} · {{ welcome_bonuses }} · {{ balance }}. Напоминания о сгорании — за 7 дней и за сутки</p></div>`;
  if (loyTab === 'burn') b = `${L.prov !== 'Starter' ? `<div class="note" style="margin-bottom:12px">ℹ️ <span>В Starter сгорание работает только с программой лояльности Starter. Сейчас выбрана ${esc(L.prov)}. По нашим правилам бонусы не сгорают (<a href="#/m/bonus">правила бонусов</a>)</span></div>` : ''}
    <div class="card"><div class="prm"><div class="l"><b>Срок жизни баллов кэшбэка</b><p>Рекомендуется 13 или 25 недель, минимум 3</p></div><div class="u-wrap">${inp('burn.cash', L.burn.cash, 'n')}<i>недель</i></div></div>
    <div class="prm"><div class="l"><b>Срок жизни приветственных баллов</b><p>Рекомендуется 2–4 недели</p></div><div class="u-wrap">${inp('burn.welcome', L.burn.welcome, 'n')}<i>недель</i></div></div>
    <div class="prm"><div class="l"><b>Пуши о сгорании за неделю и за день</b></div><div style="display:flex;justify-content:flex-end">${sw('bw', L.burn.warn, dis + ` onchange="lset('burn.warn',this.checked)"`)}</div></div></div>`;
  if (loyTab === 'rules') b = `<p class="muted">Тексты, которые гость видит в разделе «Правила». Наша справка «Как всё устроено» — в <a href="#/content">«Экраны и тексты»</a></p>` + L.rules.map((x, i) => `<div class="card"><label class="fld"><span>Заголовок *</span>${inp(`rules.${i}.0`, x[0])}</label><label class="fld"><span>Описание *</span><textarea class="inp" ${dis} onchange="lset('rules.${i}.1',this.value)">${esc(x[1])}</textarea></label>${pzWarn(textCheck(x[0], x[1]))}${ro ? '' : `<button class="btn sm ghost" style="color:var(--red)" onclick="loyD.rules.splice(${i},1);render()">Удалить блок</button>`}</div>`).join('') + (ro ? '' : '<button class="btn" onclick="loyD.rules.push([\'\',\'\']);render()">＋ Добавить блок</button>');
  if (loyTab === 'limits') { const q = window._limQ || ''; b = `<div class="card"><h3>Ограничения по меню</h3><p class="small muted">Категории и блюда, на которые баллы не начисляются или не списываются</p>${chk('lim.noEarn', L.lim.noEarn, 'Баллы не начисляются')}${chk('lim.noSpend', L.lim.noSpend, 'Баллы не списываются')}
    <h3 style="margin-top:12px">Разделы</h3><div class="btns" style="margin-top:6px">${DB.cats.map(c => `<label class="chk pill" style="padding:6px 10px"><input type="checkbox" ${dis} ${L.lim.cats.includes(c.id) ? 'checked' : ''} onchange="loyD.lim.cats=this.checked?[...loyD.lim.cats,'${c.id}']:loyD.lim.cats.filter(x=>x!=='${c.id}');render()"> ${esc(c.name)}</label>`).join('')}</div>
    <h3 style="margin-top:14px">Блюда · выбрано ${L.lim.dishes.length}</h3><div class="search" style="margin:8px 0">${SEARCH_SVG}<input class="inp" placeholder="Найти блюдо" value="${esc(q)}" onchange="window._limQ=this.value;render()"></div>
    <div class="tw" style="max-height:300px"><table><tbody>${allItems().filter(m => !q || m.n.toLowerCase().includes(q.toLowerCase()) || L.lim.dishes.includes(m.id)).slice(0, 60).map(m => `<tr><td style="width:36px"><input type="checkbox" ${dis} ${L.lim.dishes.includes(m.id) ? 'checked' : ''} onchange="loyD.lim.dishes=this.checked?[...loyD.lim.dishes,'${m.id}']:loyD.lim.dishes.filter(x=>x!=='${m.id}');render()"></td><td>${esc(m.n)}</td><td class="small muted">${esc(catName(m.cat))}</td><td class="r">${rub(m.p)}</td></tr>`).join('')}</tbody></table></div></div>`; }
  if (loyTab === 'ours') b = PAGES.mech().replace(/^<div class="ph">[\s\S]*?<\/p><\/div>/, '');
  return ph('Лояльность', 'Как в Starter: подключение, уровни, баллы, анкета, приветственные баллы, сгорание, правила, ограничения. Плюс наши механики — последней вкладкой')
    + (ro ? noPerm('mech.edit') : '') + `<div class="tabs">${LOY_T.map(([k, t]) => `<button class="${loyTab === k ? 'on' : ''}" onclick="loyTab='${k}';render()">${t}</button>`).join('')}</div>` + b
    + (ro || loyTab === 'ours' ? '' : `<div class="savebar"><span>${dirty ? '<b>Есть несохранённые изменения</b>' : '<span class="muted">Изменений нет</span>'}</span><span class="sp"></span><button class="btn" ${dirty ? '' : 'disabled'} onclick="loyD=clone(DB.loy);render()">Отменить</button><button class="btn pri" ${dirty ? '' : 'disabled'} onclick="loySave()">Сохранить</button></div>`);
};
function loySave() {
  const L = loyD; if (!L.name.trim()) { toast('Название программы обязательно'); return; }
  for (let i = 1; i < L.lvls.length; i++) if (!(L.lvls[i].from > L.lvls[i - 1].from)) { toast('Пороги уровней — по возрастанию'); return; }
  if (L.lvls.some(l => !l.n.trim() || !(l.pct >= 0 && l.pct <= 100))) { toast('У каждого уровня — название и процент от 0 до 100'); return; }
  if (!(L.share >= 0 && L.share <= 100)) { toast('Доля оплаты баллами — от 0 до 100%'); return; }
  if (L.rules.some(r => !r[0].trim() || !r[1].trim())) { toast('В правилах есть пустые блоки'); return; }
  const ch = Object.keys(L).filter(k => JSON.stringify(L[k]) !== JSON.stringify(DB.loy[k]));
  const NM = {prov:'программа', name:'название', accr:'кто начисляет', wo:'кто списывает', share:'% оплаты баллами', withPromo:'баллы+промокод', withDisc:'баллы+скидки', afterDisc:'начисление после скидок', onDelivery:'баллы на доставку', onSite:'списание на сайте', showBack:'«Вернётся баллами»', grow:'рост уровня', lvls:'уровни', reg:'анкета', welcome:'приветственные баллы', burn:'сгорание', rules:'правила ПЛ', lim:'ограничения по меню'};
  modal({t:'Сохранить изменения?', body:`<p style="margin-top:0">Меняем: ${ch.map(k => NM[k] || k).join(', ')}</p>${reasonBox(['Решение владельца','Сверка со Starter','Тест','Другое'])}`, ok:'Сохранить', onOk:() => { const why = needReason(); if (!why) return false;
    const d = ch.map(k => typeof L[k] !== 'object' ? `${NM[k] || k}: <s>${esc(DB.loy[k])}</s> → <ins>${esc(L[k])}</ins>` : NM[k] || k);
    DB.loy = clone(L); audit('Лояльность', `<span class="diff">${d.join('; ')}</span> · ${esc(why)}`); save(); render(); toast('Сохранено'); }});
}
addEventListener('hashchange', () => { if (!location.hash.startsWith('#/loyalty') && loyD && JSON.stringify(loyD) !== JSON.stringify(DB.loy)) { toast('Изменения в «Лояльности» не сохранены — они ждут вас там'); } });

/* ───────── Статистика — как в Starter, плюс наша главная метрика ───────── */
let stP = 'month', stShopF = '';
const ST_P = [['ym','За год по месяцам'],['yw','За год по неделям'],['month','За месяц'],['week','За неделю'],['day','За день']];
PAGES.dash = () => {
  const now = new Date(isoDay() + 'T23:59'), DAY = 864e5;
  const cfg = {ym:[12, 'm'], yw:[52, 'w'], month:[30, 'd'], week:[7, 'd'], day:[24, 'h']}[stP];
  const span = {ym:365, yw:364, month:30, week:7, day:1}[stP];
  const from = new Date(now - span * DAY), pfrom = new Date(now - 2 * span * DAY);
  const O = DB.orders.filter(o => o.st !== 'Возврат' && (!stShopF || o.shop === stShopF)), inP = (o, a, b) => { const t = new Date(o.at); return t > a && t <= b; };
  const cur = O.filter(o => inP(o, from, now)), prev = O.filter(o => inP(o, pfrom, from));
  const bucket = o => { const t = new Date(o.at); return cfg[1] === 'h' ? t.getHours() : Math.min(cfg[0] - 1, Math.floor((t - from) / ((now - from) / cfg[0]))); };
  const series = (arr, f) => { const b = Array(cfg[1] === 'h' ? 24 : cfg[0]).fill(0); arr.forEach(o => { const i = bucket(o); if (i >= 0 && i < b.length) b[i] += f(o); }); return b; };
  const rev = a => a.reduce((x, o) => x + o.sum, 0), newG = (a, b) => DB.guests.filter(g => { const t = new Date(g.reg + 'T12:00'); return t > a && t <= b; }).length;
  const chg = (x, y) => y ? Math.round((x - y) / y * 100) : null;
  const spark = arr => { const mx = Math.max(...arr, 1); return `<svg class="cr-spark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--acc2)" stroke-width="2" vector-effect="non-scaling-stroke" points="${arr.map((v, i) => `${arr.length > 1 ? i / (arr.length - 1) * 100 : 50},${28 - v / mx * 26}`).join(' ')}"/></svg>`; };
  const card = (t, v, c, sp, main) => `<div class="kpi ${main ? 'main' : ''}"><span>${t}</span><b>${v}</b>${c == null ? '<small>нет данных за прошлый период</small>' : `<small class="chg ${c >= 0 ? 'up' : 'dn'}">${c >= 0 ? '↑' : '↓'} ${Math.abs(c)}% к прошлому периоду</small>`}${sp || ''}</div>`;
  const days = a => { const m = {}; a.forEach(o => { (m[o.g] = m[o.g] || new Set()).add(o.at.slice(0, 10)); }); const v = Object.values(m); return v.length ? v.reduce((x, s) => x + s.size, 0) / v.length : 0; };
  const wkDays = a => { const m = {}; a.forEach(o => { const w = Math.floor((now - new Date(o.at)) / (7 * DAY)); const k = o.g + ':' + w; (m[k] = m[k] || new Set()).add(o.at.slice(0, 10)); }); const v = Object.values(m); return v.length ? v.reduce((x, s) => x + s.size, 0) / v.length : 0; };
  const sOrd = series(cur, () => 1), sRev = series(cur, o => o.sum);
  const lbl = i => cfg[1] === 'h' ? `${i}` : cfg[1] === 'm' ? MONG[(new Date(from.getTime() + (i + .5) * (now - from) / cfg[0])).getMonth()].slice(0, 3) : cfg[0] <= 7 ? ['вс','пн','вт','ср','чт','пт','сб'][(new Date(from.getTime() + (i + .5) * DAY)).getDay()] : '';
  const cnt = a => { const m = {}; a.forEach(o => o.lines.forEach(l => m[l.n] = (m[l.n] || 0) + l.q)); return m; };
  const cc = cnt(cur), pc = cnt(prev), top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const act = DB.guests.filter(g => g.days7 > 0), dist = [1,2,3,4,5,6,7].map(d => act.filter(g => g.days7 === d).length), mx = Math.max(...dist, 1);
  const bars = (arr, money) => { const m = Math.max(...arr, 1); return `<div class="chart" style="height:160px;gap:${arr.length > 31 ? 1 : 4}px">${arr.map((v, i) => `<div class="c" title="${money ? rub(v) : v}"><i style="height:${Math.max(2, v / m * 100)}%"></i><small>${arr.length <= 31 ? lbl(i) : ''}</small></div>`).join('')}</div>`; };
  return ph('Статистика', 'Как в Starter: выручка, заказы, новые клиенты, средний чек, популярные блюда. Сверху — наша главная цель: больше разных дней с покупкой в неделю у одного гостя. Данные вымышленные')
  + `<div class="filters"><div class="seg">${ST_P.map(([k, t]) => `<button class="${stP === k ? 'on' : ''}" onclick="stP='${k}';render()">${t}</button>`).join('')}</div><select class="inp" style="width:auto" onchange="stShopF=this.value;render()"><option value="">Все заведения</option>${DB.shops.map(s => `<option ${stShopF === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></div>
  ${DB.approvals.some(a => a.st === 'wait') || DB.tickets.some(t => t.st === 'new') ? `<div class="note" style="margin-bottom:14px">⏳ <span>${DB.approvals.filter(a => a.st === 'wait').length ? `Ждут подтверждения: <a href="#/approvals">${DB.approvals.filter(a => a.st === 'wait').length}</a>. ` : ''}${DB.tickets.filter(t => t.st === 'new').length ? `Новых обращений гостей: <a href="#/support">${DB.tickets.filter(t => t.st === 'new').length}</a>` : ''}</span></div>` : ''}
  <div class="kpis">${card('Дней с покупкой на гостя в неделю', wkDays(cur).toFixed(1).replace('.', ','), chg(wkDays(cur), wkDays(prev)), '', 1)}${card('Выручка', rub(rev(cur)), chg(rev(cur), rev(prev)), spark(sRev))}${card('Заказов', nf(cur.length), chg(cur.length, prev.length), spark(sOrd))}
    ${card('Новых клиентов', nf(newG(from, now)), chg(newG(from, now), newG(pfrom, from)))}${card('Средний чек', rub(cur.length ? rev(cur) / cur.length : 0), chg(cur.length ? rev(cur) / cur.length : 0, prev.length ? rev(prev) / prev.length : 0))}${card('С Кофейная+', nf(DB.guests.filter(g => g.plus).length), null)}</div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h2>Заказы</h2>${bars(sOrd)}</div><div class="card"><h2>Выручка</h2>${bars(sRev, 1)}</div></div>
  <div class="grid g2"><div class="card"><h2>Сколько дней в неделю приходят</h2><p class="muted small">Активные гости по числу дней с покупкой за последние 7 дней</p><div class="chart">${dist.map((n, i) => `<div class="c"><b>${n}</b><i style="height:${Math.max(4, n / mx * 100)}%;${i + 1 >= C('streak', 'serMin') ? '' : 'opacity:.45'}"></i><small>${i + 1} ${plural(i + 1, 'день', 'дня', 'дней')}</small></div>`).join('')}</div><p class="small muted" style="margin:8px 0 0">Бледные — ниже нормы (${C('streak', 'serMin')} в неделю): у них сгорит счётчик</p></div>
    <div class="card"><h2>Популярные блюда</h2>${top.length ? `<ol class="cr-top">${top.map(([n, v], i) => { const p = pc[n] || 0; return `<li><span class="muted">${i + 1}</span><span>${esc(n)}</span><b>${v}</b><span style="color:${v >= p ? 'var(--acc)' : 'var(--red)'}">${v > p ? '↑' : v < p ? '↓' : '→'}</span></li>`; }).join('')}</ol>` : '<div class="empty">За этот период заказов нет</div>'}</div></div>`;
};

/* ───────── Заказы — фильтры и колонки как в Starter ───────── */
let of_ = {q:'', open:false, st:[], date:'', shop:'', ch:'', src:'', sort:'at', dir:-1};
const OD = [['today','Сегодня',0,0],['yday','Вчера',1,1],['week7','Последние 7 дней',6,0],['d30','Последние 30 дней',29,0],['tmonth','Этот месяц','m',0]];
function ofList() { const t = isoDay(), q = of_.q.toLowerCase();
  return DB.orders.filter(o => { const d = o.at.slice(0, 10), ago = -daysTo(d), od = OD.find(x => x[0] === of_.date);
    if (od) { if (od[2] === 'm') { if (d.slice(0, 7) !== t.slice(0, 7)) return false; } else if (ago > od[2] || ago < od[3]) return false; }
    return (!of_.st.length || of_.st.includes(o.status)) && (!of_.shop || o.shop === of_.shop) && (!of_.ch || o.ch === of_.ch) && (!of_.src || (of_.src === 'Без акции' ? !o.lines.some(l => l.k) : o.lines.some(l => l.k === of_.src)))
      && (!q || o.id.toLowerCase().includes(q) || G(o.g) && (gName(G(o.g)).toLowerCase().includes(q) || G(o.g).ph.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '¤'))); })
    .sort((a, b) => { const k = of_.sort, x = k === 'sum' ? a.sum : k === 'bon' ? a.bonUse : a.at, y = k === 'sum' ? b.sum : k === 'bon' ? b.bonUse : b.at; return (x > y ? 1 : x < y ? -1 : 0) * of_.dir; }); }
const stPill2 = (o) => `<span class="cr-st" style="background:${ST_COL[o.status]};color:#212221">${o.status}</span>`;
PAGES.orders = () => {
  const L = ofList(), nF = of_.st.length + !!of_.date + !!of_.shop + !!of_.ch + !!of_.src;
  const th = (k, t) => `<th class="srt r ${of_.sort === k ? 'on' : ''}" onclick="of_.dir=of_.sort==='${k}'?-of_.dir:-1;of_.sort='${k}';render()">${t}${of_.sort === k ? (of_.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`;
  return `<div class="ph"><div class="t"><div class="cr-h"><h1>Заказы</h1><small>${nf(L.length)} · ${rub(L.reduce((x, o) => x + (o.st === 'Возврат' ? 0 : o.sum), 0))}</small></div><p>Касса и онлайн-заказы. Несколько чеков за день — один день с покупкой. Нажмите на строку — карточка заказа</p></div></div>
  <div class="card" style="padding:0;overflow:visible"><div class="cr-tb"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Номер заказа или телефон" value="${esc(of_.q)}" onchange="of_.q=this.value;render()"></div><span class="sp"></span><button class="btn ${of_.open ? 'pri' : ''}" onclick="of_.open=!of_.open;render()">⚙︎ Фильтры${nF ? `<span class="cr-badge">${nF}</span>` : ''}</button></div>
  ${of_.open ? `<div style="padding:14px;border-top:1px solid var(--line);background:var(--surface2)"><div class="fld"><span>Статусы</span><div class="btns">${ST_LIST.map(s => `<label class="chk pill" style="padding:5px 10px"><input type="checkbox" ${of_.st.includes(s) ? 'checked' : ''} onchange="of_.st=this.checked?[...of_.st,'${s}']:of_.st.filter(x=>x!=='${s}');render()"> ${s}</label>`).join('')}</div></div>
    <div class="cr-fp" style="padding:0;border:0;background:none"><label class="fld"><span>По дате получения</span><select class="inp" onchange="of_.date=this.value;render()"><option value="">Всё время</option>${OD.map(d => `<option value="${d[0]}" ${of_.date === d[0] ? 'selected' : ''}>${d[1]}</option>`).join('')}</select></label>
    <label class="fld"><span>Ресторан</span><select class="inp" onchange="of_.shop=this.value;render()"><option value="">Все</option>${DB.shops.map(s => `<option ${of_.shop === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></label>
    <label class="fld"><span>Тип заказа</span><select class="inp" onchange="of_.ch=this.value;render()"><option value="">Все</option>${['Касса','Самовывоз','Доставка','За столик'].map(s => `<option ${of_.ch === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
    <label class="fld"><span>Акция</span><select class="inp" onchange="of_.src=this.value;render()"><option value="">Все</option>${['Без акции','Предложение дня','Цена недели','Шестое','День рождения'].map(s => `<option ${of_.src === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
    ${nF ? '<button class="btn sm" onclick="of_={...of_,st:[],date:\'\',shop:\'\',ch:\'\',src:\'\'};render()">Сбросить</button>' : ''}</div>` : ''}
  <div class="tw" style="border:0;border-top:1px solid var(--line);border-radius:0 0 var(--r) var(--r)"><table><thead><tr><th>Статус</th><th class="srt ${of_.sort === 'at' ? 'on' : ''}" onclick="of_.dir=of_.sort==='at'?-of_.dir:-1;of_.sort='at';render()">№ / время${of_.sort === 'at' ? (of_.dir > 0 ? ' ↑' : ' ↓') : ''}</th><th>Тип</th><th>Точка</th><th>Клиент</th>${th('sum', 'Сумма')}${th('bon', 'Баллами')}<th>Оплата</th><th>Акции</th><th>Заметка</th></tr></thead><tbody>
  ${L.slice(0, 300).map(o => { const g = G(o.g); return `<tr class="click" onclick="openOrder('${o.id}')"><td>${stPill2(o)}</td><td class="nowrap"><b>${o.id}</b><div class="small muted">${dShort(o.at)} ${o.at.slice(11, 16)}</div></td><td class="small">${o.ch}</td><td class="small nowrap">${esc(o.shop)}</td>
    <td class="small">${g ? `${esc(gName(g))}<div class="muted">${esc(g.ph)}</div>` : '<span class="muted">удалён</span>'}</td><td class="r nowrap">${rub(o.sum)}</td><td class="r">${o.bonUse ? nf(o.bonUse) : '—'}</td><td class="small">${esc(o.pay)}</td><td class="small">${[...new Set(o.lines.map(l => l.k).filter(Boolean))].join(', ') || '—'}</td><td class="small muted">${esc(o.note || '')}</td></tr>`; }).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Заказов не нашлось — измените фильтры</div>'}</div></div>`;
};
let ordTab = 'main';
openOrder = function (id, tab) {
  ordTab = tab || 'main'; const o = DB.orders.find(x => x.id === id), g = G(o.g), sv = o.lines.reduce((a, l) => a + l.d, 0), earn = o.st === 'Возврат' ? 0 : Math.round(o.sum * EARN());
  const T = [['main','Общие'],['hist','История изменений'],['utm','UTM']];
  closeModal();
  modal({t:`Заказ ${o.id} · ${o.at.slice(11, 16)}, ${dLong(o.at)}`, wide:1, ok: o.st !== 'Возврат' && can('orders.refund') ? 'Оформить возврат' : '', cls:'red', cancel:'Закрыть', onOk:() => { setTimeout(() => refund(id), 0); },
    body:`<div class="btns" style="margin-bottom:10px">${stPill2(o)}${can('orders.refund') ? `<select class="inp" style="width:auto;min-height:32px;padding:4px 8px" onchange="ordSt('${o.id}',this.value)"><option value="">Сменить статус…</option>${ST_LIST.filter(s => s !== o.status).map(s => `<option>${s}</option>`).join('')}</select>` : ''}</div>
    <div class="seg" style="margin-bottom:12px">${T.map(([k, t]) => `<button class="${ordTab === k ? 'on' : ''}" onclick="openOrder('${o.id}','${k}')">${t}</button>`).join('')}</div>
    ${ordTab === 'hist' ? `<div class="tw"><table><thead><tr><th>Переведён в статус</th><th>Когда</th><th>Кем</th></tr></thead><tbody>${(o.hist || []).map(h => `<tr><td>${h.s}</td><td class="small">${esc(String(h.at).replace('T', ' ').slice(0, 16))}</td><td class="small">${esc(h.by)}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Core — Starter, Pos — касса, иначе — сотрудник</p>`
    : ordTab === 'utm' ? '<p class="muted">Для этого заказа нет UTM-меток</p>'
    : `<dl class="kv"><dt>Клиент</dt><dd>${g ? `<a href="#/guest/${g.id}" onclick="closeModal()">${esc(gName(g))}</a> · ${esc(g.ph)}` : '—'}</dd><dt>Тип</dt><dd>${esc(o.ch)}</dd><dt>Приготовят здесь</dt><dd>${esc(o.shop)}</dd></dl>
    <div class="tw" style="margin-top:12px"><table><thead><tr><th>Наименование</th><th class="r">Цена</th><th class="c">Кол-во</th><th class="r">Скидка</th><th>Источник</th><th class="r">Сумма</th></tr></thead><tbody>${o.lines.map(l => `<tr><td>${esc(l.n)}</td><td class="r">${rub(l.p)}</td><td class="c">${l.q}</td><td class="r">${l.d ? '−' + rub(l.d) : '—'}</td><td class="small">${esc(l.k) || '—'}</td><td class="r">${rub(l.p * l.q - l.d)}</td></tr>`).join('')}</tbody></table></div>
    <dl class="kv" style="margin-top:12px"><dt>Итого</dt><dd>${rub(o.sum + (o.bonUse || 0))}</dd><dt>Баллами</dt><dd>${nf(o.bonUse || 0)}</dd><dt>К оплате</dt><dd>${rub(o.sum)} · ${esc(o.pay)}</dd><dt>Экономия гостя</dt><dd>${rub(sv)}</dd><dt>Вернётся баллами</dt><dd>${nf(earn)}</dd><dt>Статус оплаты</dt><dd>${o.st === 'Возврат' ? '<span class="pill red">Возврат</span>' : '<span class="pill ok">Заказ оплачен</span>'}</dd></dl>
    <label class="fld" style="margin-top:12px"><span>Заметка к заказу</span><textarea class="inp" id="onote">${esc(o.note || '')}</textarea></label><button class="btn sm" onclick="const v=val('onote');if(v!==(DB.orders.find(x=>x.id==='${o.id}').note||'')){DB.orders.find(x=>x.id==='${o.id}').note=v;audit('Заметка к заказу','${o.id}: '+esc(v));save();render();toast('Заметка сохранена')}">Сохранить заметку</button>`}`});
};
function ordSt(id, s) { if (!s) return; const o = DB.orders.find(x => x.id === id);
  modal({t:`Перевести в «${s}»?`, body:`<p style="margin-top:0">Гость получит пуш о статусе, если он включён в «Триггерных рассылках»</p>`, ok:'Перевести', cls: s === 'Отменен' ? 'red' : 'pri', onOk:() => { const w = o.status; o.status = s; (o.hist = o.hist || []).push({s, at:new Date().toISOString(), by:ME().n}); audit('Статус заказа', `${o.id}: <span class="diff"><s>${w}</s> → <ins>${s}</ins></span>`, {g:o.g}); save(); render(); setTimeout(() => openOrder(id, 'hist'), 0); }}); }
