/* Бэк-офис — пуши, авто-сообщения, сегменты, контент, поиск, сотрудники, журнал, интеграции, копия */
'use strict';

/* ── сегменты ── */
const SEG_F = {
  plus:  ['Кофейная+', ['есть','нет'], (g, v) => v === 'есть' ? !!g.plus : !g.plus],
  lvl:   ['Уровень', () => C('tiers', 'list').map(t => t.n), (g, v) => g.lvl === v],
  days7: ['Дней с покупкой за 7 дней не меньше', 'n', (g, v) => g.days7 >= v],
  days7m:['Дней с покупкой за 7 дней не больше', 'n', (g, v) => g.days7 <= v],
  lost:  ['Не был дней — не меньше', 'n', (g, v) => -daysTo(g.last) >= v],
  ser:   ['🔥 Подряд — не меньше', 'n', (g, v) => g.ser >= v],
  risk:  ['Счётчик может сгореть', ['да'], g => g.ser > 0 && g.days7 < C('streak', 'serMin')],
  bd:    ['ДР через дней — не больше', 'n', (g, v) => bdIn(g) <= v],
  bon:   ['Бонусов не меньше', 'n', (g, v) => g.bon >= v],
  dep:   ['Депозит', ['есть','нет'], (g, v) => v === 'есть' ? g.dep > 0 : !g.dep],
  shop:  ['Любимая кофейня', () => DB.shops.map(s => s.n), (g, v) => g.shop === v],
  sex:   ['Пол', ['Женский','Мужской'], (g, v) => g.sex === (v === 'Женский' ? 'f' : 'm')],
};
DB.segments = DB.segments || [
  {id:'s1', n:'Могут потерять счётчик', c:[{f:'risk', v:'да'}]},
  {id:'s2', n:'Давно не были', c:[{f:'lost', v:14}]},
  {id:'s3', n:'Скоро день рождения', c:[{f:'bd', v:14}]},
  {id:'s4', n:'Без подписки, ходят часто', c:[{f:'plus', v:'нет'}, {f:'days7', v:3}]},
];
const segList = () => DB.segments;
const segMatch = c => DB.guests.filter(g => !g.blocked && c.every(x => SEG_F[x.f][2](g, x.v)));
const segTxt = c => c.map(x => `${SEG_F[x.f][0]}${SEG_F[x.f][1] === 'n' ? ': ' + x.v : ' — ' + x.v}`).join(' и ');
PAGES.segments = () => ph('Сегменты', 'Группы гостей по правилам. Состав пересчитывается сам каждый раз. Используются в пушах и точечных кампаниях', can('push.send') || can('offers.edit') ? '<button class="btn pri" onclick="editSeg()">＋ Сегмент</button>' : '')
  + `<div class="tw"><table><thead><tr><th>Сегмент</th><th>Правила</th><th class="r">Гостей сейчас</th><th></th></tr></thead><tbody>${DB.segments.map(s => `<tr class="click" onclick="editSeg('${s.id}')"><td><b>${esc(s.n)}</b></td><td class="small">${esc(segTxt(s.c))}</td><td class="r"><b>${segMatch(s.c).length}</b></td>
    <td>${can('push.send') ? `<button class="btn sm" onclick="event.stopPropagation();pushSeg('${s.id}')">📣 Пуш</button>` : ''}</td></tr>`).join('')}</tbody></table></div>
  <p class="small muted">Заблокированные гости в сегменты не попадают</p>`;
let segEd;
function editSeg(id) { segEd = id ? clone(DB.segments.find(s => s.id === id)) : {id:'s' + Date.now().toString(36), n:'', c:[{f:'plus', v:'есть'}], isNew:1}; segDraw(); }
function segDraw() {
  const opt = f => { const o = SEG_F[f][1]; return o === 'n' ? null : typeof o === 'function' ? o() : o; };
  const body = `<label class="fld"><span>Название</span><input class="inp" id="sgn" value="${esc(segEd.n)}" oninput="segEd.n=this.value"></label><div class="fld"><span>Правила — все сразу</span>
    ${segEd.c.map((x, i) => `<div class="row" style="margin-bottom:6px;align-items:center"><select class="inp" onchange="segEd.c[${i}]={f:this.value,v:SEG_F[this.value][1]==='n'?1:(typeof SEG_F[this.value][1]==='function'?SEG_F[this.value][1]():SEG_F[this.value][1])[0]};segDraw()">${Object.entries(SEG_F).map(([k, f]) => `<option value="${k}" ${k === x.f ? 'selected' : ''}>${f[0]}</option>`).join('')}</select>
      ${opt(x.f) ? `<select class="inp" onchange="segEd.c[${i}].v=this.value;segDraw()">${opt(x.f).map(o => `<option ${o === x.v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>` : `<input class="inp" inputmode="numeric" value="${x.v}" onchange="segEd.c[${i}].v=+this.value;segDraw()">`}
      <button class="x" style="flex:0" onclick="segEd.c.splice(${i},1);segDraw()">✕</button></div>`).join('')}
    <button class="btn sm" onclick="segEd.c.push({f:'days7',v:3});segDraw()">＋ Правило</button></div>
    <div class="note ok">👥 <span>Сейчас подходит <b>${segMatch(segEd.c).length}</b> ${plural(segMatch(segEd.c).length, 'гость', 'гостя', 'гостей')}</span></div>`;
  if ($('[data-modal] #sgn')) { $('[data-modal] .md-b').innerHTML = body; return; }
  modal({t: segEd.isNew ? 'Новый сегмент' : 'Сегмент', body, ok:'Сохранить', onOk:() => { if (segEd.n.trim().length < 3) { toast('Назовите сегмент'); return false; } if (!segEd.c.length) { toast('Нужно хотя бы одно правило'); return false; }
    const i = DB.segments.findIndex(s => s.id === segEd.id), n = {id:segEd.id, n:segEd.n.trim(), c:segEd.c}; if (i >= 0) DB.segments[i] = n; else DB.segments.push(n); audit('Сегмент', esc(n.n) + ': ' + esc(segTxt(n.c))); save(); render(); }});
}

/* ── проверка текста по правилам владельца ── */
const BANNED = [['серия','«посещений подряд»'],['огонёк','«посещений подряд»'],['механик','простое слово'],['статус','«уровень»'],['баланс','«депозит» или «бонусы»'],['активир','«работает само»'],['отпускные','«дни заморозки на отпуск»'],['что-нибудь','«любое блюдо или напиток»'],['позиция','«блюдо или напиток»'],['вы ','обращение на «ты»'],['вас ','обращение на «ты»'],['ваш','обращение на «ты»']];
function textCheck(t, b) {
  const s = (t + ' ' + b).toLowerCase() + ' ', w = [];
  BANNED.forEach(([x, r]) => { if (s.includes(x)) w.push(`«${x.trim()}» — лучше ${r}`); });
  [t, b].forEach(x => { if (/[₽%]\.\s*$/.test(x)) w.push('После ₽ и % точку не ставим'); else if (/^[^.!?]+\.$/.test(x.trim())) w.push('В одной фразе точку в конце не ставим'); });
  if (/\d [₽%]/.test(t + b)) w.push('Между числом и ₽/% — неразрывный пробел (исправлю сам при отправке)');
  return w;
}
const nbspFix = s => s.replace(/(\d) ([₽%])/g, '$1 $2');

/* ── пуши ── */
DB.pushCfg = DB.pushCfg || {quietFrom:'22:00', quietTo:'09:00', maxDay:1, maxWeek:3};
const LINKS = ['Турбо (главный экран)','Меню','Корзина','Кофейная+','Депозит','Мои подарки','Пригласить друга','День рождения','Поддержка','Заряд выгоды'];
let pz = {aud:'all', seg:'s1', g:'', t:'', b:'', link:LINKS[0], when:'now', at:''};
function pushTo(gid) { closeDrawer(true); pz = {...pz, aud:'one', g:gid}; location.hash = '#/push'; render(); }
function pushSeg(sid) { pz = {...pz, aud:'seg', seg:sid}; location.hash = '#/push'; render(); }
PAGES.push = () => {
  if (!can('push.send')) return ph('Пуши') + noPerm('push.send');
  const ids = pz.aud === 'one' ? (G(pz.g) ? [pz.g] : []) : pz.aud === 'seg' ? segMatch((DB.segments.find(s => s.id === pz.seg) || {c:[]}).c).map(g => g.id) : DB.guests.filter(g => !g.blocked && (pz.aud === 'all' || !!g.plus === (pz.aud === 'plus'))).map(g => g.id);
  const today = isoDay(), sentToday = new Set(DB.pushes.filter(p => isoDay(new Date(p.at)) === today && !p.svc).flatMap(p => p.ids || [p.to]));
  const skip = pz.aud === 'one' ? 0 : ids.filter(i => sentToday.has(i)).length, w = textCheck(pz.t, pz.b);
  return ph('Пуши', `Персонально, сегменту или всем. Не больше ${DB.pushCfg.maxDay} рекламного пуша в день и ${DB.pushCfg.maxWeek} в неделю на гостя; тишина с ${DB.pushCfg.quietFrom} до ${DB.pushCfg.quietTo}`, `<button class="btn" onclick="pushCfg()">⚙️ Ограничения</button>`)
  + `<div class="grid g-side">
  <div class="card"><h2>Новый пуш</h2>
    <div class="fld" style="margin-top:12px"><span>Кому</span><div class="seg">${[['all','Всем'],['plus','С подпиской'],['free','Без подписки'],['seg','Сегменту'],['one','Одному гостю']].map(([k, t]) => `<button class="${pz.aud === k ? 'on' : ''}" onclick="pz.aud='${k}';render()">${t}</button>`).join('')}</div></div>
    ${pz.aud === 'seg' ? `<label class="fld"><span>Сегмент</span><select class="inp" onchange="pz.seg=this.value;render()">${DB.segments.map(s => `<option value="${s.id}" ${s.id === pz.seg ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select></label>` : ''}
    ${pz.aud === 'one' ? `<label class="fld"><span>Гость</span><select class="inp" onchange="pz.g=this.value;render()"><option value="">Выберите…</option>${DB.guests.map(g => `<option value="${g.id}" ${g.id === pz.g ? 'selected' : ''}>${esc(gName(g))} · ${esc(g.ph)}</option>`).join('')}</select></label>` : ''}
    <label class="fld"><span>Заголовок · ${pz.t.length}/40</span><input class="inp" maxlength="40" value="${esc(pz.t)}" oninput="pz.t=this.value;pzLive()" placeholder="🔥 Осталось 2 дня"></label>
    <label class="fld"><span>Текст · ${pz.b.length}/120</span><textarea class="inp" maxlength="120" oninput="pz.b=this.value;pzLive()" placeholder="Приходи сегодня — и счётчик не сгорит">${esc(pz.b)}</textarea></label>
    <div class="row"><label class="fld"><span>Нажатие откроет</span><select class="inp" onchange="pz.link=this.value">${LINKS.map(l => `<option ${l === pz.link ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="fld"><span>Когда</span><select class="inp" onchange="pz.when=this.value;render()"><option value="now" ${pz.when === 'now' ? 'selected' : ''}>Сейчас</option><option value="later" ${pz.when === 'later' ? 'selected' : ''}>Запланировать</option></select></label>
    ${pz.when === 'later' ? `<label class="fld"><span>Дата и время</span><input class="inp" type="datetime-local" value="${pz.at}" onchange="pz.at=this.value"></label>` : ''}</div>
    <div id="pzw">${pzWarn(w)}</div>
    <div class="note ${ids.length ? 'ok' : 'red'}" style="margin-top:10px">👥 <span>Получат <b>${nf(ids.length - skip)}</b> ${plural(ids.length - skip, 'гость', 'гостя', 'гостей')}${skip ? ` · ${skip} пропустим — им сегодня уже писали` : ''}</span></div>
    <div class="btns" style="margin-top:14px"><button class="btn pri" onclick="pushSend()">${pz.when === 'later' ? 'Запланировать' : 'Отправить'}</button></div></div>
  <div><div class="phone-prev"><div class="tm">${new Date().toTimeString().slice(0, 5)}</div><div class="push"><span class="ic"><svg viewBox="0 0 360 262"><use href="#k-mark"/></svg></span><div><small>сейчас</small><b id="pvt">${esc(pz.t || 'Заголовок')}</b><p id="pvb">${esc(pz.b || 'Текст пуша')}</p></div></div></div>
    <p class="small muted" style="margin-top:10px">«Поймёт ли это человек, который видит приложение впервые?»</p></div></div>
  <div class="card"><h2>Отправленные и запланированные</h2>${DB.pushes.length ? `<div class="tw" style="margin-top:10px"><table><thead><tr><th>Когда</th><th>Кому</th><th>Пуш</th><th class="r">Получили</th><th>Кто</th></tr></thead><tbody>${DB.pushes.slice(0, 60).map(p => `<tr><td class="nowrap small">${p.later ? '⏰ ' + esc(p.later.replace('T', ' ')) : tm(p.at)}</td><td class="small">${p.to ? `<a href="#/guest/${p.to}">${esc(gName(G(p.to)))}</a>` : esc(p.aud)}</td><td><b>${esc(p.t)}</b><div class="small">${esc(p.b)}</div></td><td class="r">${nf(p.n)}</td><td class="small">${esc(p.by)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Пушей ещё не отправляли</div>'}</div>`;
};
const pzWarn = w => w.length ? `<div class="note">✏️ <span><b>Проверь текст:</b><br>${w.map(esc).join('<br>')}</span></div>` : '';
function pzLive() { const t = document.getElementById('pvt'), b = document.getElementById('pvb'); if (t) t.textContent = pz.t || 'Заголовок'; if (b) b.textContent = pz.b || 'Текст пуша'; $$('.fld>span').forEach(s => { if (s.textContent.startsWith('Заголовок')) s.textContent = `Заголовок · ${pz.t.length}/40`; if (s.textContent.startsWith('Текст')) s.textContent = `Текст · ${pz.b.length}/120`; }); $('#pzw').innerHTML = pzWarn(textCheck(pz.t, pz.b)); }
function pushSend() {
  if (pz.t.trim().length < 3 || pz.b.trim().length < 3) { toast('Нужны заголовок и текст'); return; }
  if (pz.aud === 'one' && !G(pz.g)) { toast('Выберите гостя'); return; }
  if (pz.when === 'later' && (!pz.at || new Date(pz.at) < new Date())) { toast('Выберите время в будущем'); return; }
  const go = () => {
    const today = isoDay(), sent = new Set(DB.pushes.filter(p => isoDay(new Date(p.at)) === today).flatMap(p => p.ids || [p.to]));
    let ids = pz.aud === 'one' ? [pz.g] : pz.aud === 'seg' ? segMatch(DB.segments.find(s => s.id === pz.seg).c).map(g => g.id) : DB.guests.filter(g => !g.blocked && (pz.aud === 'all' || !!g.plus === (pz.aud === 'plus'))).map(g => g.id);
    if (pz.aud !== 'one') ids = ids.filter(i => !sent.has(i));
    const aud = {all:'Всем', plus:'С подпиской', free:'Без подписки', seg:'Сегмент: ' + (DB.segments.find(s => s.id === pz.seg) || {}).n, one:''}[pz.aud];
    DB.pushes.unshift({at:Date.now(), by:ME().n, to: pz.aud === 'one' ? pz.g : '', aud, ids: pz.aud === 'one' ? undefined : ids, t:nbspFix(pz.t), b:nbspFix(pz.b), link:pz.link, n:ids.length, later: pz.when === 'later' ? pz.at : ''});
    audit(pz.when === 'later' ? 'Запланировали пуш' : 'Отправили пуш', `${esc(pz.t)} · ${aud || esc(gName(G(pz.g)))} · ${ids.length} ${plural(ids.length, 'гость', 'гостя', 'гостей')}`, pz.aud === 'one' ? {g:pz.g} : {});
    save(); pz = {...pz, t:'', b:''}; render(); toast(pz.when === 'later' ? 'Запланировано' : 'Отправлено');
  };
  const n = pz.aud === 'one' ? 1 : 0, h = new Date().getHours() * 60 + new Date().getMinutes(), [qf, qt] = [DB.pushCfg.quietFrom, DB.pushCfg.quietTo].map(x => +x.slice(0, 2) * 60 + +x.slice(3));
  const quiet = pz.when === 'now' && (h >= qf || h < qt);
  if (!n || quiet) modal({t:'Отправить?', body:`<p style="margin-top:0">${quiet ? `⏰ Сейчас тихие часы (${DB.pushCfg.quietFrom}–${DB.pushCfg.quietTo}). Лучше запланировать на утро. ` : ''}${n ? '' : 'Пуш уйдёт многим гостям — отменить уже нельзя'}</p><div class="push" style="border:1px solid var(--line)"><span class="ic"><svg viewBox="0 0 360 262"><use href="#k-mark"/></svg></span><div><b>${esc(pz.t)}</b><p>${esc(pz.b)}</p></div></div>`, ok:'Отправить', onOk:go});
  else go();
}
function pushCfg() {
  modal({t:'Ограничения пушей', body:`<div class="row"><label class="fld"><span>Тихо с</span><input class="inp" type="time" id="q1" value="${DB.pushCfg.quietFrom}"></label><label class="fld"><span>До</span><input class="inp" type="time" id="q2" value="${DB.pushCfg.quietTo}"></label></div>
    <div class="row"><label class="fld"><span>Рекламных в день на гостя</span><input class="inp" id="q3" inputmode="numeric" value="${DB.pushCfg.maxDay}"></label><label class="fld"><span>В неделю</span><input class="inp" id="q4" inputmode="numeric" value="${DB.pushCfg.maxWeek}"></label></div>
    <p class="small muted">Служебные (заказ готов, ответ поддержки, подарок) — без ограничений. Ежедневный пуш про предложение дня владелец отклонил: надоедает, и гость выключает всё</p>`,
    ok: can('mech.edit') ? 'Сохранить' : '', onOk:() => { DB.pushCfg = {quietFrom:val('q1'), quietTo:val('q2'), maxDay:+val('q3') || 1, maxWeek:+val('q4') || 3}; audit('Ограничения пушей', `тишина ${DB.pushCfg.quietFrom}–${DB.pushCfg.quietTo}, ${DB.pushCfg.maxDay}/день, ${DB.pushCfg.maxWeek}/неделю`); save(); render(); }});
}

/* ── авто-сообщения ── */
DB.autos = DB.autos || [
  {k:'burn', on:true, n:'Счётчик может сгореть', when:'Когда до конца недели 2 дня, а посещений меньше нормы. Только тем, кто сказал «Да, напомнить»', t:'🔥 Посещения могут сгореть', b:'Приходи сегодня или завтра — и 24 посещения подряд сохранятся'},
  {k:'gift', on:true, n:'Подарок сгорает завтра', when:'За день до конца срока подарка', t:'🎁 Подарок ждёт до завтра', b:'Один напиток −30% — забери в любой кофейной'},
  {k:'ref', on:true, n:'Друг выполнил условия', when:'Сразу после 3-й покупки друга', t:'🎉 +1 000 бонусов за друга', b:'Миша Хвостов купил 3 раза — бонусы уже на счёте'},
  {k:'sub', on:true, n:'Подписка заканчивается', when:'За 5 дней до конца', t:'★ Кофейная+ — ещё 5 дней', b:'Потом выгоды уйдут под замок. Продли за 99 ₽ в месяц'},
  {k:'sup', on:true, n:'Поддержка ответила', when:'Когда оператор ответил, а гость вышел из чата', t:'💬 Поддержка ответила', b:'Открой, чтобы прочитать'},
  {k:'gin', on:true, n:'Тебе подарок', when:'Когда другой гость подарил блюдо или бонусы', t:'🎁 Тебе подарок', b:'Ксения дарит тебе латте'},
  {k:'bd', on:true, n:'Скоро день рождения', when:'За 7 дней до ДР — когда начинает работать скидка', t:'🎂 Скидка в день рождения уже работает', b:'Минус столько процентов, сколько тебе исполняется — неделю до и неделю после'},
  {k:'depo', on:false, n:'Депозит закончился', when:'Когда депозит стал 0', t:'₽ Депозит закончился', b:'Пополни на 3 000 ₽ — вернётся 150 ₽ кэшбэком'},
  {k:'offer', on:false, n:'Новое предложение дня', when:'Каждое утро. Владелец отклонил: надоедает', t:'🎯 Предложение дня', b:'Сегодня для тебя капучино −20%'},
];
PAGES.autos = () => {
  const ro = !can('content.edit') && !can('push.send');
  return ph('Авто-сообщения', 'Пуши, которые приложение шлёт само по событию. Можно выключить или поправить текст. Числа в текстах — пример, в продукте подставятся настоящие')
  + DB.autos.map((a, i) => { const w = textCheck(a.t, a.b); return `<div class="card"><div class="card-h"><div style="flex:1"><h3>${esc(a.n)}</h3><div class="small muted">${esc(a.when)}</div></div>${sw('au' + i, a.on, (ro ? 'disabled ' : '') + `onchange="DB.autos[${i}].on=this.checked;audit('Авто-сообщение','${esc(a.n)}: '+(this.checked?'включено':'выключено'));save()"`)}</div>
    <div class="row"><label class="fld"><span>Заголовок</span><input class="inp" ${ro ? 'disabled' : ''} value="${esc(a.t)}" onchange="autoSet(${i},'t',this.value)"></label><label class="fld" style="flex:2"><span>Текст</span><input class="inp" ${ro ? 'disabled' : ''} value="${esc(a.b)}" onchange="autoSet(${i},'b',this.value)"></label></div>${pzWarn(w)}</div>`; }).join('');
};
function autoSet(i, k, v) { const a = DB.autos[i], w = a[k]; a[k] = nbspFix(v); audit('Текст авто-сообщения', `${esc(a.n)}: <span class="diff"><s>${esc(w)}</s> → <ins>${esc(v)}</ins></span>`); save(); render(); }

/* ── контент: онбординг, сторис, баннеры, справка, тексты ── */
DB.content = DB.content || {
  onb:[{t:'Персональная скидка — каждый день', s:'Приложение подбирает скидку под то, что ты любишь. Покажи QR на кассе или закажи в приложении — скидка посчитается сама'},
       {t:'Ходишь чаще — получаешь больше', s:'3 дня на прошлой неделе = 3% бонусами с каждой покупки. 1 бонус = 1 ₽'},
       {t:'Не пропускай — и копи', s:'Каждое посещение — +1 к счётчику. Приходи 3 раза в неделю — и он не сгорит'},
       {t:'Все выгоды — с Кофейная+', s:'Бесплатно до 1 марта 2027. Потом 99 ₽ в месяц'}],
  stories:[{t:'Гид по пенкам', img:'img/bn1.jpg', body:'Капучино, флэт уайт, латте — чем отличаются пенки и что выбрать', cta:'Кофе с молоком', on:true},
           {t:'Только в октябре', img:'img/bn2.jpg', body:'Пицца-донат с пепперони и острым мёдом', cta:'В меню: Спешл', on:true},
           {t:'Гид по топпингам', img:'img/bn3.jpg', body:'Сиропы, молоко и добавки — что с чем сочетается', cta:'Авторские напитки', on:true},
           {t:'Рекомендация недели', img:'img/bn4.jpg', body:'Что попробовать на этой неделе', cta:'Всё меню', on:true}],
  banners:['img/bn1.jpg','img/bn2.jpg','img/bn3.jpg','img/bn4.jpg','img/bn5.jpg'].map((img, i) => ({img, link:['Кофе с молоком','Спешл','Авторские напитки','Всё меню','Выпечка и десерты'][i], on:true})),
  rules:[{ic:'🎯', t:'Предложение дня', m:'Каждый день новая скидка под твой вкус', f:'Одна порция в день|Добавь в заказ ещё любое блюдо или напиток'},
         {ic:'★', t:'Цены недели', m:'Цены ниже обычной на то, что ты любишь', f:'Держатся всю неделю'},
         {ic:'📈', t:'Твой ритм', m:'Сколько дней придёшь — столько % бонусов со следующей недели', f:'День засчитывается от 150 ₽|До 7% — и уровень добавляет ещё|1 бонус = 1 ₽ · до 30% чека|Бонусы не сгорают'},
         {ic:'🔥', t:'Посещения подряд', m:'+1 за каждый день с покупкой от 150 ₽', f:'Меньше 3 посещений за неделю — счётчик сгорит|❄️ Заморозка · 4 дня в месяц|👑 Лучший результат не сгорает'},
         {ic:'🏷️', t:'Каждый 6-й', m:'Шестое блюдо — дешевле', f:'Новое для тебя −50%|Привычное −20%'},
         {ic:'🎂', t:'День рождения', m:'Скидка = твой возраст', f:'Неделю до и неделю после|До 1 500 ₽ скидки в день'},
         {ic:'₽', t:'Депозит', m:'Пополни — и получи кэшбэк', f:'3 000 ₽ → +150 ₽|5 000 ₽ → +400 ₽|10 000 ₽ → +1 000 ₽'},
         {ic:'👫', t:'Пригласи друга', m:'По 1 000 бонусов тебе и другу', f:'Когда друг купит в 3 разных дня'}],
  texts:[{k:'Замок на выгоде', v:'★ Только с Кофейная+'}, {k:'Срок бесплатного периода', v:'Бесплатно до 1 марта 2027'}, {k:'Цена после', v:'Потом 99 ₽ в месяц'}, {k:'Пустая история новичка', v:'Пока ничего — ты у нас недавно'}, {k:'Подсказка про предложение дня', v:'👉 Добавь ещё любое блюдо или напиток<br>и сработает предложение дня'}, {k:'Выход из приложения', v:'Покупки, бонусы, депозит и посещения подряд сохранятся'}],
};
let ctTab = 'onb';
PAGES.content = () => {
  const ro = !can('content.edit'), c = DB.content, dis = ro ? 'disabled' : '';
  const T = [['onb','Онбординг'],['banners','Баннеры в меню'],['rules','«Как всё устроено»'],['texts','Ключевые тексты']]; if (ctTab === 'stories') ctTab = 'onb';
  const inp = (path, v, ph_ = '', area) => area ? `<textarea class="inp" ${dis} onchange="ctSet('${path}',this.value)" placeholder="${ph_}">${esc(v)}</textarea>` : `<input class="inp" ${dis} value="${esc(v)}" placeholder="${ph_}" onchange="ctSet('${path}',this.value)">`;
  let b = '';
  if (ctTab === 'onb') b = `<p class="muted">4 экрана после первого входа. На каждом — выгода, а не описание механики. Одна мысль на экран</p>` + c.onb.map((o, i) => `<div class="card"><h3>Экран ${i + 1}</h3><label class="fld" style="margin-top:10px"><span>Заголовок</span>${inp(`onb.${i}.t`, o.t)}</label><label class="fld"><span>Текст</span>${inp(`onb.${i}.s`, o.s, '', 1)}</label>${pzWarn(textCheck(o.t, o.s))}</div>`).join('');
  if (ctTab === 'stories') b = `<p class="muted">Кружки сверху «Турбо». Порядок здесь = порядок в приложении</p>` + c.stories.map((s, i) => `<div class="card"><div class="grid" style="grid-template-columns:120px minmax(0,1fr)"><img src="${esc(s.img)}" alt="" style="width:120px;height:120px;border-radius:50%;object-fit:cover;background:var(--surface2)">
    <div><div class="row"><label class="fld"><span>Название</span>${inp(`stories.${i}.t`, s.t)}</label><label class="fld"><span>Кнопка</span>${inp(`stories.${i}.cta`, s.cta)}</label></div><label class="fld"><span>Текст</span>${inp(`stories.${i}.body`, s.body)}</label><label class="fld"><span>Картинка</span>${inp(`stories.${i}.img`, s.img)}</label>
    <div class="btns">${sw('so' + i, s.on, dis + ` onchange="ctSet('stories.${i}.on',this.checked)"`)} <span class="small">Показывать</span>${ro ? '' : `<button class="btn sm" ${i ? '' : 'disabled'} onclick="ctMove('stories',${i},-1)">↑</button><button class="btn sm" ${i < c.stories.length - 1 ? '' : 'disabled'} onclick="ctMove('stories',${i},1)">↓</button><button class="btn sm ghost" style="color:var(--red)" onclick="c_del('stories',${i})">Удалить</button>`}</div></div></div></div>`).join('') + (ro ? '' : `<button class="btn" onclick="DB.content.stories.push({t:'Новая сторис',img:'',body:'',cta:'',on:false});save();render()">＋ Сторис</button>`);
  if (ctTab === 'banners') b = `<p class="muted">Баннеры сверху «Меню». Нажатие ведёт в раздел</p><div class="grid g2">` + c.banners.map((s, i) => `<div class="card"><img src="${esc(s.img)}" alt="" style="width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:10px;background:var(--surface2)"><label class="fld" style="margin-top:10px"><span>Картинка</span>${inp(`banners.${i}.img`, s.img)}</label>
    <label class="fld"><span>Ведёт в раздел</span><select class="inp" ${dis} onchange="ctSet('banners.${i}.link',this.value)">${['Всё меню', ...DB.cats.map(x => x.name)].map(n => `<option ${n === s.link ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label><div class="tog"><span>Показывать</span>${sw('bn' + i, s.on, dis + ` onchange="ctSet('banners.${i}.on',this.checked)"`)}</div></div>`).join('') + '</div>';
  if (ctTab === 'rules') b = `<div class="note" style="margin-bottom:12px">⚠️ <span>Меняете правило механики — сразу правьте его карточку здесь. Раньше тексты устаревали («7 дней на решение», «рейтинг в Турбо»)</span></div>` + c.rules.map((r, i) => `<div class="card"><div class="row"><label class="fld" style="max-width:80px"><span>Значок</span>${inp(`rules.${i}.ic`, r.ic)}</label><label class="fld"><span>Название</span>${inp(`rules.${i}.t`, r.t)}</label></div>
    <label class="fld"><span>Суть одной строкой</span>${inp(`rules.${i}.m`, r.m)}</label><label class="fld"><span>Факты — через «|», без точек</span>${inp(`rules.${i}.f`, r.f)}</label>${pzWarn(textCheck(r.m, r.f))}</div>`).join('');
  if (ctTab === 'texts') b = `<p class="muted">Тексты, которые встречаются на многих экранах. В продукте — один источник, здесь</p><div class="card">` + c.texts.map((t, i) => `<div class="prm"><div class="l"><b>${esc(t.k)}</b></div><div>${inp(`texts.${i}.v`, t.v)}</div></div>`).join('') + '</div>';
  return ph('Экраны и тексты', 'Онбординг, баннеры, справка и ключевые тексты. Сторис — в <a href="#/stories">«Маркетинг → Сторис»</a>. Правила: понятно с первого взгляда, без внутренних слов, точка в конце одной фразы не ставится, ₽ и % не отрываются от числа')
    + (ro ? noPerm('content.edit') : '') + `<div class="tabs">${T.map(([k, t]) => `<button class="${ctTab === k ? 'on' : ''}" onclick="ctTab='${k}';render()">${t}</button>`).join('')}</div>` + b;
};
function ctSet(path, v) { const p = path.split('.'), o = DB.content[p[0]][+p[1]], w = o[p[2]]; o[p[2]] = typeof v === 'string' ? nbspFix(v) : v; audit('Контент: ' + p[0], `${esc(o.t || o.k || o.img || '')}: <span class="diff"><s>${esc(w)}</s> → <ins>${esc(v)}</ins></span>`); save(); render(); }
function ctMove(k, i, d) { const a = DB.content[k]; [a[i], a[i + d]] = [a[i + d], a[i]]; audit('Контент: порядок', k); save(); render(); }
function c_del(k, i) { modal({t:'Удалить?', body:`<p style="margin-top:0">«${esc(DB.content[k][i].t)}» пропадёт из приложения</p>`, ok:'Удалить', cls:'red', onOk:() => { audit('Контент: удалили', esc(DB.content[k][i].t)); DB.content[k].splice(i, 1); save(); render(); }}); }

/* ── поиск ── */
DB.search = DB.search || {syn:[['капучино','капуч, капик, cappuccino'],['латте','лате, latte'],['сладкое','десерт, пирожное, торт, чизкейк'],['без молока','американо, эспрессо, чай, тоник'],['помощь','поддержка, жалоба, оператор, баг, ошибка, идея'],['депозит','баланс, кошелёк, пополнить'],['бонусы','баллы, кэшбэк']],
  pages:[['Депозит','Пополнить, кэшбэк'],['Кофейная+','Подписка, тарифы'],['Посещения подряд','Счётчик, заморозки'],['День рождения','Скидка = возраст'],['Поддержка','Чат, помощь'],['Пригласить друга','+1 000 бонусов']]};
PAGES.search = () => { const ro = !can('content.edit'), dis = ro ? 'disabled' : '';
  return ph('Поиск в приложении', 'Строка «Найти блюдо, скидку или ответ». Понимает опечатки, раскладку и транслит сама. Здесь — разговорные слова и разделы, которые она находит')
  + `<div class="card"><div class="card-h"><h2>Синонимы</h2><span class="sp"></span>${ro ? '' : `<button class="btn sm" onclick="DB.search.syn.push(['','']);save();render()">＋ Слово</button>`}</div>
  <div class="tw"><table><thead><tr><th>Гость пишет</th><th>Ищем также (через запятую)</th><th></th></tr></thead><tbody>${DB.search.syn.map((s, i) => `<tr><td><input class="inp" ${dis} value="${esc(s[0])}" onchange="DB.search.syn[${i}][0]=this.value;audit('Поиск: синоним',esc(this.value));save()"></td><td><input class="inp" ${dis} value="${esc(s[1])}" onchange="DB.search.syn[${i}][1]=this.value;audit('Поиск: синоним',esc(this.value));save()"></td><td>${ro ? '' : `<button class="x" onclick="DB.search.syn.splice(${i},1);save();render()">✕</button>`}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h2>Разделы и ответы в выдаче</h2><div class="tw" style="margin-top:10px"><table><thead><tr><th>Раздел</th><th>Подпись</th></tr></thead><tbody>${DB.search.pages.map((s, i) => `<tr><td>${esc(s[0])}</td><td><input class="inp" ${dis} value="${esc(s[1])}" onchange="DB.search.pages[${i}][1]=this.value;save()"></td></tr>`).join('')}</tbody></table></div>
  <p class="small muted">Новый раздел или механика в приложении — сразу строка сюда</p></div>`; };

/* ── сотрудники и права ── */
PAGES.staff = () => {
  const ro = !can('staff.edit');
  return ph('Сотрудники и права', 'Кто входит в бэк-офис и что может. Владелец может всё. Лимиты — сколько можно провести без второго сотрудника', ro ? '' : '<button class="btn pri" onclick="editStaff()">＋ Сотрудник</button>')
  + (ro ? noPerm('staff.edit') : '')
  + `<div class="tw"><table><thead><tr><th>Сотрудник</th><th>Роль</th><th>Кофейни</th><th>Доступ</th></tr></thead><tbody>${DB.staff.map(s => `<tr class="click" onclick="${ro ? '' : `editStaff('${s.id}')`}"><td><b>${esc(s.n)}</b></td><td>${esc(s.role)}</td><td class="small">${esc(s.shops)}</td><td>${s.on ? '<span class="pill ok">есть</span>' : '<span class="pill">отключён</span>'}</td></tr>`).join('')}</tbody></table></div>
  <div class="card"><h2>Права ролей</h2><div class="tw matrix" style="margin-top:10px"><table><thead><tr><th>Что можно</th>${ROLES.map(r => `<th>${r}</th>`).join('')}</tr></thead><tbody>
  ${PERMS.map(([k, t]) => `<tr><td>${t}</td>${ROLES.map(r => `<td><input type="checkbox" style="width:17px;height:17px;accent-color:var(--acc2)" ${(DB.perms[r] || {})[k] ? 'checked' : ''} ${ro || r === 'Владелец' ? 'disabled' : ''} onchange="permSet('${r}','${k}',this.checked)"></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h2>Лимиты без подтверждения</h2><div class="tw" style="margin-top:10px"><table><thead><tr><th>Роль</th><th>Бонусов за раз</th><th>Депозит за раз, ₽</th></tr></thead><tbody>${ROLES.filter(r => r !== 'Владелец').map(r => `<tr><td>${r}</td>${['bonus','depo'].map(k => `<td><input class="inp" ${ro ? 'disabled' : ''} inputmode="numeric" value="${DB.limits[r][k]}" onchange="limSet('${r}','${k}',+this.value)"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
  <p class="small muted">0 — без лимита (если право есть). У владельца лимита нет</p></div>`;
};
function permSet(r, k, v) { DB.perms[r][k] = v ? 1 : 0; audit('Права роли', `${r}: ${esc(PERMS.find(p => p[0] === k)[1])} — ${v ? 'можно' : 'нельзя'}`); save(); }
function limSet(r, k, v) { const w = DB.limits[r][k]; DB.limits[r][k] = v || 0; audit('Лимит роли', `${r}, ${k === 'bonus' ? 'бонусы' : 'депозит'}: <span class="diff"><s>${w}</s> → <ins>${v}</ins></span>`); save(); render(); }
function editStaff(id) {
  const s = id ? DB.staff.find(x => x.id === id) : {id:'s' + Date.now().toString(36), n:'', role:'Поддержка', shops:'Все', on:true};
  modal({t: id ? 'Сотрудник' : 'Новый сотрудник', body:`<label class="fld"><span>Имя и фамилия</span><input class="inp" id="sn" value="${esc(s.n)}"></label>
    <div class="row"><label class="fld"><span>Роль</span><select class="inp" id="sr" ${s.id === 's1' ? 'disabled' : ''}>${ROLES.map(r => `<option ${r === s.role ? 'selected' : ''}>${r}</option>`).join('')}</select></label><label class="fld"><span>Кофейни</span><select class="inp" id="ss"><option>Все</option>${DB.shops.map(x => `<option ${x.n === s.shops ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select></label></div>
    ${s.id === 's1' ? '' : `<label class="chk"><input type="checkbox" id="so" ${s.on ? 'checked' : ''}> Доступ в бэк-офис есть</label>`}
    <p class="small muted">Вход сотрудника — по рабочему телефону и коду. Уволили — снимите галочку: доступ закроется сразу, журнал сохранится</p>`,
    ok:'Сохранить', onOk:() => { if (val('sn').length < 3) { toast('Имя и фамилия'); return false; } const n = {...s, n:val('sn'), role: s.id === 's1' ? 'Владелец' : val('sr'), shops:val('ss'), on: s.id === 's1' ? true : val('so')};
      if (id) Object.assign(s, n); else DB.staff.push(n); audit(id ? 'Изменили сотрудника' : 'Новый сотрудник', `${esc(n.n)} · ${n.role}${n.on ? '' : ' · доступ закрыт'}`); save(); render(); }});
}

/* ── журнал ── */
let aq = '', aw = 'all';
PAGES.audit = () => { const L = DB.audit.filter(a => (aw === 'all' || a.by === aw) && (!aq || (a.what + a.detail).toLowerCase().includes(aq.toLowerCase())));
  return ph('Журнал действий', 'Всё, что меняли сотрудники: кто, когда, что было и что стало. Записи не удаляются')
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Что искать" value="${esc(aq)}" onchange="aq=this.value;render()"></div><select class="inp" style="width:auto" onchange="aw=this.value;render()"><option value="all">Все сотрудники</option>${DB.staff.map(s => `<option ${aw === s.n ? 'selected' : ''}>${esc(s.n)}</option>`).join('')}</select><span class="small muted">${L.length} записей</span></div>
  <div class="card">${auditList(L.slice(0, 400))}</div>`; };

/* ── интеграции ── */
PAGES.integr = () => ph('Интеграции', 'Связи с внешними системами. Ключи хранятся только на сервере — здесь их не видно и не вводят')
  + `<div class="grid g2">${[
    ['iiko · касса и iikoCard', 'Не подключено', 'Плагин iikoFront ставит скидку по строкам до оплаты. Бонусы: hold → chargeoff / cancel_hold. Нужен доступ к iikoCloud API (v2/access_token)', ['Организация','Терминалы кофеен','Вебхуки (11 событий)','Где живёт баланс: ' + C('bonus', 'ledger')]],
    ['Starter · онлайн-заказы', 'Ждём ответа поставщика', 'Главный блокер: персональная цена должна считаться до оплаты, а в POS-Gateway такого нет. Вопросы поставщику (раздел 15) не отправлены', ['Проект и точки','Callback заказов','Существующий webhook Starter → iiko не трогаем']],
    ['СМС-коды', 'Не подключено', 'Вход по телефону и коду, приглашения и подарки по СМС', [`Код: ${C('auth', 'codeLen')} цифры`, `Повтор через ${C('auth', 'resend')} с`]],
    ['Эквайринг', 'Не подключено', 'Карты, SberPay, проверочное списание 1 ₽, подписка', ['Магазин','Рекуррентные платежи для Кофейная+']],
    ['Пуш-уведомления', 'Не подключено', 'Apple и Google. Токены отзываются при выходе', ['iOS','Android','Веб-пуши PWA']],
    ['Погода', 'Не подключено', 'Для вариантов предложения «дождь», «холодно»', ['Город','Обновление раз в час']],
  ].map(([t, st, d, l]) => `<div class="card"><div class="card-h"><h3 style="flex:1">${t}</h3><span class="pill amb">${st}</span></div><p class="small muted">${d}</p><ul class="small" style="margin:8px 0 12px;padding-left:18px">${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <button class="btn sm" ${can('system') ? '' : 'disabled'} onclick="toast('Связи пока нет — это прототип. Проверка появится, когда дадут доступ')">Проверить связь</button></div>`).join('')}</div>`;

/* ── резервная копия ── */
PAGES.backup = () => ph('Резервная копия', 'Всё, что вы настроили здесь, хранится в этом браузере. Скачайте файл, чтобы перенести на другой компьютер или переслать')
  + (can('system') ? '' : noPerm('system'))
  + `<div class="grid g3"><div class="card"><h3>Скачать</h3><p class="small muted">Файл со всеми настройками, меню, гостями и журналом</p><button class="btn pri" ${can('system') ? '' : 'disabled'} onclick="bkDown()">💾 Скачать файл</button></div>
  <div class="card"><h3>Загрузить</h3><p class="small muted">Заменит всё текущее содержимым файла</p><label class="btn" ${can('system') ? '' : 'style="pointer-events:none;opacity:.45"'}>📂 Выбрать файл<input type="file" accept=".json,application/json" hidden onchange="bkUp(this)"></label></div>
  <div class="card"><h3>Начать заново</h3><p class="small muted">Вернуть всё как в прототипе: правила, меню, гости. Журнал сотрётся</p><button class="btn red" ${can('system') ? '' : 'disabled'} onclick="bkReset()">Сбросить всё</button></div></div>
  <p class="small muted">Занято в браузере: ${nf(JSON.stringify(DB).length / 1024)} КБ из ≈5 000</p>`;
function bkDown() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], {type:'application/json'})); a.download = `kofeynaya-backoffice-${isoDay()}.json`; a.click(); audit('Скачали резервную копию', ''); save(); }
function bkUp(inp) { const f = inp.files[0]; if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (d.v !== 1 || !d.cfg || !d.guests) throw 0; modal({t:'Загрузить копию?', body:'<p style="margin-top:0">Текущие данные заменятся</p>', ok:'Загрузить', cls:'red', onOk:() => { DB = d; audit('Загрузили резервную копию', esc(f.name)); save(); location.reload(); }}); } catch (e) { toast('Это не файл бэк-офиса'); } }); }
function bkReset() { modal({t:'Сбросить всё?', body:'<p style="margin-top:0">Вернём всё как в прототипе. Отменить нельзя — сначала скачайте копию</p>', ok:'Сбросить', cls:'red', onOk:() => { localStorage.removeItem(KEY); location.reload(); }}); }

/* ── что решить до запуска (находки критика) ── */
const RISKS = [
  ['Главное: наше приложение заменяет Starter или живёт рядом?','Если оба останутся у гостей, все конфликты ниже станут постоянными. Критик советует: на пилотных точках у гостей только наше приложение, Starter — движок заказа без своей лояльности','#/m/starter'],
  ['Сверка со Starter: два начисления','iiko даёт 3/4/5%, мы — ритм 1–7% и +1/+2% за уровень. Баланс оставляем в iikoCloud, но начисление выключаем в самой программе iiko, дальше начисляет наш движок','#/loyalty/connect'],
  ['Сверка со Starter: два «уровня»','Бронза/Серебро/Золото по сумме заказов против Серебряного/Золотого/Платинового по посещениям. Уровни Starter убираем в день запуска, прежний % держим 4 недели','#/m/tiers'],
  ['Сверка со Starter: 99% против 30%','В Starter бонусами можно оплатить до 99% чека, балансы до 80 000. Старые бонусы — отдельным кошельком по старым правилам','#/m/bonus'],
  ['Сверка со Starter: «+200 через 30 дней»','Триггер награждает за отсутствие. Выключить на пилоте, вместо него — предложение дня «Давно не были» с контрольной группой','#/m/triggers'],
  ['Сверка со Starter: вечерняя −20% на выпечку','Считается вторым движком скидок. Переносим в наш расчёт как «скидку по времени для всех» и выключаем в Starter в тот же день','#/m/timed'],
  ['Числа зашиты в тексты приложения','«99 ₽» встречается ≈10 раз, лестница кэшбэка — трижды, «5 отметок» — в десятке мест. Поменяли цену здесь — приложение пообещает старое. Решение: все тексты берут числа из настроек','#/content'],
  ['Возвратов нет в правилах','Что откатывается при возврате: бонусы, отметки 6-го, счётчик, лимит дня рождения, подарки, прогресс друга. В панели возврат уже пересчитывает бонусы и депозит — остальное решить','#/orders'],
  ['Депозит без подписки не тратится','1 марта 2027 деньги «заморозятся» у всех, кто не продлит. Деньги гостя должны тратиться всегда — переключатель в правилах депозита','#/m/depo'],
  ['1 марта 2027 — массовое событие','В один день все выгоды уходят под замок у гостей без карты. Нужен план: пуши за 14/7/1 день, что видит гость','#/autos'],
  ['Рейтинг и сообщения между гостями','Видны фото, «о себе», кофейня. Нужно согласие, жалобы, блокировка, модерация','#/m/rating'],
  ['Защита «Пригласи друга» — только словами','Лимит 5 в месяц, только мобильные, «не твоя карта» — в коде не проверяются','#/m/ref'],
  ['Движок не знает маржу и бюджет','Предложение дня и цены недели выбираются из меню случайно. В панели появились предел скидки, минимальная маржа, бюджет — их нужно подключить к движку','#/m/offer'],
  ['День рождения: предела процента не было','60 лет = −60%. В панели — потолок 50%; онлайн-заказ без проверки документа','#/m/bd'],
  ['Пять источников часов работы','Часы кофеен, «готовим с 8:00», 8:00/9:00 предзаказа, 22:45, часы разделов. Меню одно на сеть, а 5 из 7 кофеен — «только выпечка и кофе»','#/shops'],
  ['Тексты расходятся с правилами','Платиновый «каждый понедельник» живёт 3 дня; окно QR пишет «баланс» и «не активировано»; предложение обращается на «вы»','#/content'],
  ['Нет юридического','Согласия на обработку данных, оферта подписки, удаление аккаунта — отсутствуют',''],
  ['Нет статуса «сотрудник»','Бариста-гости получат все выгоды наравне с гостями',''],
  ['Нет A/B-тестов и лимитов на СМС','Чтобы честно мерить рост дней с покупкой, нужна контрольная группа','#/segments'],
];
PAGES.risks = () => ph('Что решить до запуска', 'Критик разобрал приложение на ≈480 параметров и сверил с тем, как сейчас настроен Starter. Ниже — главное, что может сломаться или навредить. Подробно — docs/admin/inventory.md и docs/admin/starter-vs-ours.md')
  + RISKS.map(([t, d, l], i) => `<div class="card"><div class="card-h"><span class="sec-ic" style="background:var(--amber-soft);font:700 16px var(--f-head)">${i + 1}</span><div style="flex:1"><h3>${esc(t)}</h3><p class="small muted" style="margin:4px 0 0">${esc(d)}</p></div>${l ? `<a class="btn sm" href="${l}">Открыть ›</a>` : ''}</div></div>`).join('');

/* ── старт ── */
