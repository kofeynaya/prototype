/* Бэк-офис — меню, разделы, кофейни, стоп-лист, правила механик (с версиями), предложения дня, цены недели, герои */
'use strict';
const BASE = window.MENU_ITEMS || [], BASE_CATS = window.MENU_CATS || [];
const SHOPS0 = [
  {n:'Кофейная 1', a:'бул. Энтузиастов, 2А', d:'Только выпечка и кофе', wd:'7:30–22:20', we:'8:30–22:20', img:'img/shop1.jpg', t:['pickup','table'], eta:'20 мин', phone:'', closed:'', kind:'bar'},
  {n:'Кофейная 2', a:'ул. Советская, 161', d:'Только выпечка и кофе', wd:'7:30–22:20', we:'8:30–22:20', img:'img/shop2.jpg', t:['pickup','table'], eta:'5 мин', phone:'', closed:'Временно не принимаем заказы', kind:'bar'},
  {n:'Кофейная 3', a:'ул. Советская, 83', d:'Только выпечка и кофе', wd:'7:30–22:20', we:'8:30–22:20', img:'img/shop3.jpg', t:['pickup','table'], eta:'5 мин', phone:'', closed:'Принимаем заказы только в кофейне', kind:'bar'},
  {n:'Кофейная 4', a:'ул. Ореховая, 13', d:'Только выпечка и кофе', wd:'7:30–22:20', we:'8:30–22:20', img:'img/shop4.jpg', t:['pickup','table','delivery'], eta:'10–20 мин', phone:'', closed:'', kind:'bar'},
  {n:'Кофейная 5', a:'ул. Советская, 17', d:'Большое меню с кухней', wd:'8:00–23:00', we:'9:00–23:00', img:'img/shop5.jpg', t:['pickup','table','delivery'], eta:'30–40 мин', phone:'+7 (902) 727-85-55', closed:'', kind:'kitchen'},
  {n:'Кофейная 6', a:'ул. Советская, 99А', d:'Маленький островок у главного входа с выпечкой и кофе', wd:'10:00–21:00', we:'10:00–21:00', img:'img/shop6.jpg', t:['pickup'], eta:'15 мин', phone:'', closed:'', kind:'bar'},
  {n:'Кофейная 7', a:'ул. Советская, 74', d:'Только выпечка и кофе', wd:'7:30–22:20', we:'8:30–22:20', img:'img/shop7.jpg', t:['pickup','table'], eta:'20 мин', phone:'', closed:'', kind:'bar'},
];
const WAYS = {pickup:'Самовывоз', table:'За столик', delivery:'Доставка'};
DB.shops = DB.shops || clone(SHOPS0);
DB.zones = DB.zones || [{n:'Центр', min:700, fee:150, free:1500, eta:'70–90 мин'}, {n:'Дальние районы', min:1000, fee:250, free:1500, eta:'135–155 мин'}];
DB.cats = DB.cats || BASE_CATS.map(c => ({id:c.id, name:c.name, hours:c.hours, on:true}));
const BAR_CATS = ['chernii_kofe','kofeinaya_klassika1','vipechka_i_deserti','kakao','sezonnoe_menyu__kofe','letnee_menyu'];

/* ── меню: база из menu.js + правки из бэк-офиса ── */
const itm = id => { const b = BASE.find(x => x.id === id) || DB.newItems.find(x => x.id === id); return b ? {...b, ...(DB.menuOv[id] || {})} : null; };
const allItems = () => [...BASE, ...DB.newItems].map(x => itm(x.id)).filter(x => !x.deleted);
const catName = id => (DB.cats.find(c => c.id === id) || {}).name || id;
const LABELS = {'':'—', new:'Новинка', hit:'Хит', chef:'От шефа'};
const imgSrc = m => m && m.img ? m.img : '';
let mq = '', mcat = 'all';
PAGES.menu = () => {
  const L = allItems().filter(m => (mcat === 'all' || m.cat === mcat) && (!mq || m.n.toLowerCase().includes(mq.toLowerCase())));
  return ph('Блюда и цены', `Всё меню приложения: название, состав, цена, размеры, добавки, фото, метки. ${nf(allItems().length)} ${plural(allItems().length, 'блюдо', 'блюда', 'блюд')}. Цена на кассе берётся из iiko — здесь цена для приложения`,
    can('menu.edit') ? `<button class="btn pri" onclick="newItem()">＋ Новое блюдо</button>` : '')
  + (can('menu.edit') ? '' : noPerm('menu.edit'))
  + `<div class="filters"><div class="search">${SEARCH_SVG}<input class="inp" placeholder="Найти блюдо" value="${esc(mq)}" onchange="mq=this.value;render()"></div>
    <select class="inp" style="width:auto" onchange="mcat=this.value;render()"><option value="all">Все разделы</option>${DB.cats.map(c => `<option value="${c.id}" ${mcat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><span class="small muted">${L.length} шт.</span></div>
  <div class="tw"><table><thead><tr><th>Блюдо</th><th>Раздел</th><th class="r">Цена</th><th>Размеры</th><th>Метка</th><th>Стоп</th><th>В приложении</th></tr></thead><tbody>
  ${L.map(m => `<tr class="click" onclick="editItem('${m.id}')"><td><div class="cell-n">${imgSrc(m) ? `<img class="thumb" src="${imgSrc(m)}" loading="lazy" alt="">` : '<span class="thumb"></span>'}<div><b>${esc(m.n)}</b><span class="small muted">${esc((m.c || '').slice(0, 60))}</span></div></div></td>
    <td class="small">${esc(catName(m.cat))}</td><td class="r nowrap">${rub(m.p)}${DB.menuOv[m.id] && 'p' in DB.menuOv[m.id] ? ' <span class="pill amb">изм.</span>' : ''}</td><td class="small">${(m.vars || []).length > 1 ? m.vars.map(v => esc(v.l)).join(', ') : '—'}</td>
    <td>${m.b ? `<span class="pill">${LABELS[m.b] || m.b}</span>` : ''}</td><td>${(m.stop || []).length ? `<span class="pill red">${m.stop.length} ${plural(m.stop.length, 'точка', 'точки', 'точек')}</span>` : ''}</td><td>${m.hidden ? '<span class="pill">скрыто</span>' : '<span class="pill ok">видно</span>'}</td></tr>`).join('')}
  </tbody></table>${L.length ? '' : '<div class="empty">Ничего не нашли</div>'}</div>`;
};
let ed = null, edVar = 0;
function editItem(id) { ed = clone(itm(id)); ed.vars = ed.vars || []; edVar = 0; drawItem(); }
function newItem() {
  const id = 'n' + Date.now().toString(36);
  ed = {id, n:'', c:'', p:0, b:'new', cat:DB.cats[0].id, img:'', vars:[{l:'Стандарт', p:0, w:0, vol:0, g:[]}], hidden:true, isNew:true}; edVar = 0; drawItem();
}
function drawItem() {
  const m = ed, ro = !can('menu.edit') ? 'disabled' : '', v = m.vars[edVar] || {g:[]};
  const imgs = [...new Set([...BASE.map(x => x.img), 'img/bn1.jpg','img/bn2.jpg','img/bn3.jpg','img/bn4.jpg','img/bn5.jpg'].filter(Boolean))];
  const html = `${ro ? noPerm('menu.edit') : ''}
  <div class="card"><h3>Главное</h3><div style="margin-top:12px">
    <label class="fld"><span>Название</span><input class="inp" ${ro} value="${esc(m.n)}" oninput="ed.n=this.value"></label>
    <label class="fld"><span>Состав</span><textarea class="inp" ${ro} oninput="ed.c=this.value">${esc(m.c)}</textarea></label>
    <div class="row">${m.vars.length > 1 ? `<label class="fld"><span>Цена «от»</span><input class="inp" disabled value="${rub(Math.min(...m.vars.map(v => v.p || 0)))}"><small>Самый дешёвый размер — цены меняются ниже, в «Размерах»</small></label>` : `<label class="fld"><span>Цена</span><div class="u-wrap"><input class="inp" ${ro} inputmode="numeric" value="${m.p}" oninput="ed.p=+this.value.replace(/\\D/g,'');if(ed.vars[0])ed.vars[0].p=ed.p"><i>₽</i></div></label>`}
      <label class="fld"><span>Раздел</span><select class="inp" ${ro} onchange="ed.cat=this.value">${DB.cats.map(c => `<option value="${c.id}" ${m.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label class="fld"><span>Метка</span><select class="inp" ${ro} onchange="ed.b=this.value">${Object.entries(LABELS).map(([k, t]) => `<option value="${k}" ${m.b === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
    <div class="tog" style="margin-top:4px"><span>Показывать в приложении</span>${sw('ih', !m.hidden, ro + ' onchange="ed.hidden=!this.checked"')}</div>
    <div class="tog" style="margin-top:10px"><span>Можно выбрать в «Каждом 6-м»</span>${sw('i6', m.six !== false, ro + ' onchange="ed.six=this.checked"')}</div>
    <div class="tog" style="margin-top:10px"><span>Может быть предложением дня</span>${sw('io', m.offer !== false, ro + ' onchange="ed.offer=this.checked"')}</div></div></div>
  <div class="card"><h3>Фото</h3><div class="img-pick" style="margin-top:10px"><img id="iprev" src="${esc(m.img)}" alt="">
    <div class="btns"><label class="btn ${ro ? '' : ''}" ${ro ? 'style="pointer-events:none;opacity:.45"' : ''}>📷 Загрузить своё<input type="file" accept="image/*" hidden onchange="upImg(this)"></label>
    <select class="inp" ${ro} style="width:auto" onchange="ed.img=this.value;document.getElementById('iprev').src=this.value"><option value="">Выбрать из готовых…</option>${imgs.map(s => `<option ${s === m.img ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div>
    <p class="small muted">Загруженное фото ужмём до 800 px. В продукте — хранилище картинок, а не браузер</p></div>
  <div class="card"><div class="card-h"><h3>Размеры</h3><span class="sp"></span>${ro ? '' : '<button class="btn sm" onclick="ed.vars.push({l:\'Новый размер\',p:ed.p,w:0,vol:0,g:clone((ed.vars[0]||{g:[]}).g)});drawItem()">＋ Размер</button>'}</div>
    <div class="tw"><table><thead><tr><th>Название</th><th>Цена, ₽</th><th>Вес, г</th><th>Объём, мл</th><th></th></tr></thead><tbody>${m.vars.map((x, i) => `<tr><td><input class="inp" ${ro} value="${esc(x.l)}" oninput="ed.vars[${i}].l=this.value"></td>
      <td><input class="inp" ${ro} inputmode="numeric" value="${x.p}" onchange="ed.vars[${i}].p=+this.value.replace(/\\D/g,'');drawItem()"></td><td><input class="inp" ${ro} inputmode="numeric" value="${x.w || ''}" oninput="ed.vars[${i}].w=+this.value"></td>
      <td><input class="inp" ${ro} inputmode="numeric" value="${x.vol || ''}" oninput="ed.vars[${i}].vol=+this.value"></td><td>${ro || m.vars.length < 2 ? '' : `<button class="x" onclick="ed.vars.splice(${i},1);edVar=0;drawItem()">✕</button>`}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><div class="card-h"><h3>Добавки</h3><span class="sp"></span>${m.vars.length > 1 ? `<div class="seg">${m.vars.map((x, i) => `<button class="${i === edVar ? 'on' : ''}" onclick="edVar=${i};drawItem()">${esc(x.l)}</button>`).join('')}</div>` : ''}</div>
    <p class="small muted" style="margin-top:0">Каждая строка — «Название = цена». Пусто или 0 — бесплатно</p>
    ${(v.g || []).map((gr, j) => `<div style="border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:10px">
      <div class="row"><label class="fld"><span>Группа</span><input class="inp" ${ro} value="${esc(gr.t)}" oninput="curG(${j}).t=this.value"></label>
      <label class="fld" style="max-width:110px"><span>Минимум</span><input class="inp" ${ro} inputmode="numeric" value="${gr.min}" oninput="curG(${j}).min=+this.value"></label>
      <label class="fld" style="max-width:110px"><span>Максимум</span><input class="inp" ${ro} inputmode="numeric" value="${gr.max}" oninput="curG(${j}).max=+this.value"></label>
      <label class="fld" style="max-width:150px"><span>Обязательно</span><select class="inp" ${ro} onchange="curG(${j}).req=this.value==='1'"><option value="1" ${gr.req ? 'selected' : ''}>Да</option><option value="0" ${gr.req ? '' : 'selected'}>Нет</option></select></label></div>
      <textarea class="inp" ${ro} rows="4" oninput="curG(${j}).v=this.value.split('\\n').map(s=>s.trim()).filter(Boolean).map(s=>{const p=s.split('=');return [p[0].trim(),+(p[1]||0)]})">${gr.v.map(o => `${o[0]} = ${o[1]}`).join('\n')}</textarea>
      ${ro ? '' : `<button class="btn sm ghost" style="margin-top:6px;color:var(--red)" onclick="ed.vars[edVar].g.splice(${j},1);drawItem()">Удалить группу</button>`}</div>`).join('') || '<div class="muted small">Добавок нет</div>'}
    ${ro ? '' : `<div class="btns" style="margin-top:10px"><button class="btn sm" onclick="(ed.vars[edVar].g=ed.vars[edVar].g||[]).push({t:'Новая группа',min:0,max:1,req:false,v:[]});drawItem()">＋ Группа добавок</button>${m.vars.length > 1 ? '<button class="btn sm" onclick="ed.vars.forEach((x,i)=>{if(i!==edVar)x.g=clone(ed.vars[edVar].g)});toast(\'Добавки скопированы во все размеры\')">Такие же во всех размерах</button>' : ''}</div>`}</div>
  <div class="card"><h3>Стоп-лист по кофейням</h3><p class="small muted">Отметьте, где блюда сейчас нет. В продукте — из iiko автоматически</p><div class="btns" style="margin-top:8px">${DB.shops.map(s => `<label class="chk pill" style="padding:6px 10px"><input type="checkbox" ${ro} ${(m.stop || []).includes(s.n) ? 'checked' : ''} onchange="ed.stop=ed.stop||[];this.checked?ed.stop.push('${s.n}'):ed.stop=ed.stop.filter(x=>x!=='${s.n}')"> ${esc(s.n)}</label>`).join('')}</div></div>
  ${ro ? '' : `<div class="savebar"><button class="btn pri" onclick="saveItem()">Сохранить блюдо</button><button class="btn" onclick="closeDrawer()">Отмена</button><span class="sp"></span>${m.isNew ? '' : `<button class="btn ghost" style="color:var(--red)" onclick="delItem()">Убрать из меню</button>`}</div>`}`;
  const d = $('#drw'); if (d && d.dataset.item === m.id) { const y = $('.dr').scrollTop; $('#drb').innerHTML = html; $('.dr').scrollTop = y; return; }
  drawer(m.isNew ? 'Новое блюдо' : esc(m.n), html, m.isNew ? '' : `${m.id} · ${esc(catName(m.cat))}`); $('#drw').dataset.item = m.id;
}
const curG = j => ed.vars[edVar].g[j];
function upImg(inp) {
  const f = inp.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ed.img = c.toDataURL('image/jpeg', .8); document.getElementById('iprev').src = ed.img; toast('Фото загружено — не забудьте «Сохранить»'); }; im.src = r.result; };
  r.readAsDataURL(f);
}
function saveItem() {
  const m = ed;
  if (m.n.trim().length < 2) { toast('Напишите название'); return; }
  if (!(m.p > 0) || m.vars.some(v => !(v.p > 0) || !v.l.trim())) { toast('У блюда и каждого размера должны быть название и цена больше 0'); return; }
  if (m.vars.some(v => (v.g || []).some(g => g.min > g.max || (g.req && g.min < 1)))) { toast('В добавках: минимум не больше максимума, у обязательной группы минимум от 1'); return; }
  m.p = Math.min(...m.vars.map(v => v.p));
  const base = BASE.find(x => x.id === m.id), ch = [];
  if (m.isNew) { delete m.isNew; DB.newItems.push(m); audit('Новое блюдо', esc(m.n) + ' · ' + rub(m.p)); }
  else {
    const old = itm(m.id), ov = DB.menuOv[m.id] = DB.menuOv[m.id] || {};
    ['n','c','p','b','cat','img','hidden','six','offer','stop','vars'].forEach(k => { if (JSON.stringify(old[k]) !== JSON.stringify(m[k])) { ov[k] = clone(m[k]); if (k === 'p') ch.push(`цена <s>${rub(old.p)}</s> → <ins>${rub(m.p)}</ins>`); else if (k === 'n') ch.push(`название <s>${esc(old.n)}</s> → <ins>${esc(m.n)}</ins>`); else ch.push({c:'состав', b:'метка', cat:'раздел', img:'фото', hidden:'видимость', six:'«6-й»', offer:'«предложение дня»', stop:'стоп-лист', vars:'размеры/добавки'}[k]); } });
    if (base && DB.newItems.find(x => x.id === m.id)) Object.assign(DB.newItems.find(x => x.id === m.id), m);
    if (!ch.length) { closeDrawer(); return; }
    audit('Изменили блюдо', `${esc(m.n)}: <span class="diff">${ch.join(', ')}</span>`);
  }
  if (!save()) return; closeDrawer(); render();
  toast(ch.some(x => String(x).startsWith('цена')) ? 'Сохранено. Новая цена — для новых заказов; выданные предложения и цены недели держат свои условия' : 'Сохранено');
}
function delItem() {
  modal({t:'Убрать блюдо из меню?', body:`<p style="margin-top:0">«${esc(ed.n)}» пропадёт из приложения. В истории заказов останется. Если оно стоит в чьём-то «Каждом 6-м» — отметки сохранятся, гость выберет замену</p>`, ok:'Убрать', cls:'red', onOk:() => {
    const nI = DB.newItems.findIndex(x => x.id === ed.id); if (nI >= 0) DB.newItems.splice(nI, 1); else (DB.menuOv[ed.id] = DB.menuOv[ed.id] || {}).deleted = true;
    audit('Убрали блюдо', esc(ed.n)); save(); closeDrawer(); render(); }});
}

/* ── разделы ── */
PAGES.cats = () => ph('Разделы меню', 'Порядок, названия, часы работы раздела и видимость. Порядок здесь = порядок в приложении')
  + (can('menu.edit') ? '' : noPerm('menu.edit'))
  + `<div class="tw"><table><thead><tr><th></th><th>Раздел</th><th>Часы (пусто — весь день)</th><th class="c">Блюд</th><th>Видно</th></tr></thead><tbody>${DB.cats.map((c, i) => `<tr>
    <td class="nowrap">${can('menu.edit') ? `<button class="x" ${i ? '' : 'disabled'} onclick="catMove(${i},-1)">↑</button><button class="x" ${i < DB.cats.length - 1 ? '' : 'disabled'} onclick="catMove(${i},1)">↓</button>` : ''}</td>
    <td><input class="inp" ${can('menu.edit') ? '' : 'disabled'} value="${esc(c.name)}" onchange="catSet(${i},'name',this.value)"></td>
    <td><input class="inp" ${can('menu.edit') ? '' : 'disabled'} placeholder="10:00–22:30" value="${esc(c.hours)}" onchange="catSet(${i},'hours',this.value)"></td>
    <td class="c">${allItems().filter(m => m.cat === c.id).length}</td><td>${sw('c' + i, c.on, (can('menu.edit') ? '' : 'disabled ') + `onchange="catSet(${i},'on',this.checked)"`)}</td></tr>`).join('')}</tbody></table></div>
  ${can('menu.edit') ? `<div class="btns" style="margin-top:12px"><button class="btn" onclick="catAdd()">＋ Новый раздел</button></div>` : ''}`;
function catMove(i, d) { const a = DB.cats; [a[i], a[i + d]] = [a[i + d], a[i]]; audit('Порядок разделов', esc(a[i + d].name) + (d < 0 ? ' выше' : ' ниже')); save(); render(); }
function catSet(i, k, v) { const c = DB.cats[i], w = c[k]; if (k === 'hours' && v && !/^\d{1,2}:\d{2}[–-]\d{1,2}:\d{2}$/.test(v)) { toast('Часы так: 10:00–22:30'); render(); return; } c[k] = k === 'hours' ? v.replace('-', '–') : v; audit('Раздел меню', `${esc(c.name)}: ${k === 'on' ? (v ? 'показан' : 'скрыт') : `<span class="diff"><s>${esc(w)}</s> → <ins>${esc(v)}</ins></span>`}`); save(); render(); }
function catAdd() { modal({t:'Новый раздел', body:'<label class="fld"><span>Название</span><input class="inp" id="cn"></label>', ok:'Добавить', onOk:() => { const n = val('cn'); if (n.length < 2) return false; DB.cats.push({id:'c' + Date.now().toString(36), name:n, hours:'', on:true}); audit('Новый раздел', esc(n)); save(); render(); }}); }

/* ── кофейни и доставка ── */
PAGES.shops = () => ph('Кофейни и доставка', 'Адреса, часы, способы получения, временное закрытие, фото и зоны доставки', can('shops.edit') ? '<button class="btn pri" onclick="editShop(-1)">＋ Кофейня</button>' : '')
  + `<div class="grid g3">${DB.shops.map((s, i) => `<div class="card" style="padding:0;overflow:hidden;cursor:pointer" onclick="editShop(${i})"><img src="${esc(s.img)}" alt="" style="width:100%;height:120px;object-fit:cover;display:block;background:var(--surface2)">
    <div style="padding:12px 14px"><h3>${esc(s.n)}</h3><div class="small muted">${esc(s.a)}</div><div class="small" style="margin-top:6px">Будни ${esc(s.wd)} · выходные ${esc(s.we)}</div>
    <div class="btns" style="margin-top:8px">${s.t.map(t => `<span class="pill">${WAYS[t]}</span>`).join('')}${s.closed ? `<span class="pill red">${esc(s.closed)}</span>` : ''}</div></div></div>`).join('')}</div>
  <div class="card"><div class="card-h"><h2>Зоны доставки</h2><span class="sp"></span>${can('shops.edit') ? '<button class="btn sm" onclick="DB.zones.push({n:\'Новая зона\',min:700,fee:150,free:1500,eta:\'60–80 мин\'});save();render()">＋ Зона</button>' : ''}</div>
  <div class="tw"><table><thead><tr><th>Зона</th><th>Минимальный заказ, ₽</th><th>Доставка, ₽</th><th>Бесплатно от, ₽</th><th>Время</th><th></th></tr></thead><tbody>${DB.zones.map((z, i) => `<tr>${['n','min','fee','free','eta'].map(k => `<td><input class="inp" ${can('shops.edit') ? '' : 'disabled'} value="${esc(z[k])}" onchange="zoneSet(${i},'${k}',this.value)"></td>`).join('')}<td>${can('shops.edit') ? `<button class="x" onclick="DB.zones.splice(${i},1);audit('Убрали зону доставки','');save();render()">✕</button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
function zoneSet(i, k, v) { const z = DB.zones[i], w = z[k]; if (['min','fee','free'].includes(k)) { v = +v.replace(/\D/g, ''); } z[k] = v; audit('Зона доставки', `${esc(z.n)}: <span class="diff"><s>${esc(w)}</s> → <ins>${esc(v)}</ins></span>`); save(); render(); }
function editShop(i) {
  const s = i < 0 ? {n:'Кофейная ' + (DB.shops.length + 1), a:'', d:'', wd:'8:00–22:00', we:'9:00–22:00', img:'', t:['pickup'], eta:'15 мин', phone:'', closed:'', kind:'bar'} : clone(DB.shops[i]), ro = can('shops.edit') ? '' : 'disabled';
  window._shop = s;
  modal({t: i < 0 ? 'Новая кофейня' : esc(s.n), wide:1, body:`${ro ? noPerm('shops.edit') : ''}<div class="row"><label class="fld"><span>Название</span><input class="inp" ${ro} id="s_n" value="${esc(s.n)}"></label><label class="fld"><span>Адрес</span><input class="inp" ${ro} id="s_a" value="${esc(s.a)}"></label></div>
    <label class="fld"><span>Описание</span><input class="inp" ${ro} id="s_d" value="${esc(s.d)}"></label>
    <div class="row"><label class="fld"><span>Будни</span><input class="inp" ${ro} id="s_wd" value="${esc(s.wd)}"></label><label class="fld"><span>Выходные</span><input class="inp" ${ro} id="s_we" value="${esc(s.we)}"></label><label class="fld"><span>Готовим за</span><input class="inp" ${ro} id="s_eta" value="${esc(s.eta)}"></label></div>
    <div class="row"><label class="fld"><span>Телефон</span><input class="inp" ${ro} id="s_ph" value="${esc(s.phone)}"></label><label class="fld"><span>Меню</span><select class="inp" ${ro} id="s_k"><option value="bar" ${s.kind === 'bar' ? 'selected' : ''}>Только выпечка и кофе</option><option value="kitchen" ${s.kind === 'kitchen' ? 'selected' : ''}>Полное меню с кухней</option></select></label></div>
    <div class="fld"><span>Способы получения</span><div class="btns">${Object.entries(WAYS).map(([k, t]) => `<label class="chk pill" style="padding:6px 10px"><input type="checkbox" ${ro} class="s_t" value="${k}" ${s.t.includes(k) ? 'checked' : ''}> ${t}</label>`).join('')}</div></div>
    <label class="fld"><span>Временно закрыта — что написать гостю (пусто — работает)</span><input class="inp" ${ro} id="s_c" placeholder="Временно не принимаем заказы" value="${esc(s.closed)}"></label>
    <label class="fld"><span>Фото (адрес картинки)</span><input class="inp" ${ro} id="s_i" value="${esc(s.img)}"></label>`,
    ok: ro ? '' : 'Сохранить', onOk:() => {
      const n = {n:val('s_n'), a:val('s_a'), d:val('s_d'), wd:val('s_wd'), we:val('s_we'), eta:val('s_eta'), phone:val('s_ph'), kind:val('s_k'), closed:val('s_c'), img:val('s_i'), t:$$('.s_t').filter(x => x.checked).map(x => x.value)};
      const HR = /^\d{1,2}:\d{2}[–-]\d{1,2}:\d{2}$/;
      if (n.n.length < 2 || n.a.length < 3) { toast('Название и адрес обязательны'); return false; }
      if (!HR.test(n.wd) || !HR.test(n.we)) { toast('Часы так: 8:00–22:00'); return false; }
      if (!n.t.length) { toast('Отметьте хотя бы один способ получения'); return false; }
      n.wd = n.wd.replace('-', '–'); n.we = n.we.replace('-', '–');
      if (i < 0) DB.shops.push(n); else DB.shops[i] = {...DB.shops[i], ...n};
      audit(i < 0 ? 'Новая кофейня' : 'Изменили кофейню', esc(n.n) + (n.closed ? ` · закрыта: ${esc(n.closed)}` : '')); save(); render();
    }});
}

/* ── стоп-лист ── */
let stShop = 0, stq = '';
PAGES.stop = () => {
  const s = DB.shops[stShop], ro = !can('shops.edit');
  const L = allItems().filter(m => !m.hidden && (!stq || m.n.toLowerCase().includes(stq.toLowerCase())) && (s.kind === 'kitchen' || BAR_CATS.includes(m.cat)));
  const off = L.filter(m => (m.stop || []).includes(s.n)).length;
  return ph('Стоп-лист', 'Что закончилось в кофейне прямо сейчас. Гость увидит «Закончилось» и не сможет заказать. В продукте приходит из iiko само, здесь — ручная правка')
  + (ro ? noPerm('shops.edit') : '')
  + `<div class="filters"><select class="inp" style="width:auto" onchange="stShop=+this.value;render()">${DB.shops.map((x, i) => `<option value="${i}" ${i === stShop ? 'selected' : ''}>${esc(x.n)} · ${esc(x.a)}</option>`).join('')}</select>
  <div class="search">${SEARCH_SVG}<input class="inp" placeholder="Найти блюдо" value="${esc(stq)}" onchange="stq=this.value;render()"></div><span class="small muted">${off ? `<span class="pill red">${off} в стопе</span>` : 'Всё в наличии'}</span></div>
  ${s.kind === 'bar' ? '<div class="note blue" style="margin-bottom:12px">ℹ️ <span>Эта кофейня — «только выпечка и кофе»: кухни в её меню нет</span></div>' : ''}
  <div class="tw"><table><thead><tr><th>Блюдо</th><th>Раздел</th><th>Есть в наличии</th></tr></thead><tbody>${L.map(m => `<tr><td><div class="cell-n">${m.img ? `<img class="thumb" loading="lazy" src="${m.img}" alt="">` : ''}<b>${esc(m.n)}</b></div></td><td class="small">${esc(catName(m.cat))}</td>
  <td>${sw('st' + m.id, !(m.stop || []).includes(s.n), (ro ? 'disabled ' : '') + `onchange="stopSet('${m.id}',!this.checked)"`)}</td></tr>`).join('')}</tbody></table></div>`;
};
function stopSet(id, on) { const s = DB.shops[stShop].n, ov = DB.menuOv[id] = DB.menuOv[id] || {}, cur = itm(id).stop || []; ov.stop = on ? [...new Set([...cur, s])] : cur.filter(x => x !== s); audit(on ? 'Поставили в стоп' : 'Убрали из стопа', `${esc(itm(id).n)} · ${esc(s)}`); save(); render(); }

/* ── правила механик: схема → форма, черновик, версии ── */
const draft = {};
const FLAG = id => DB.cfg[id].__off;
PAGES.mech = () => ph('Правила механик', 'Каждая механика разобрана на параметры. Меняете → смотрите, что изменилось → публикуете с датой начала и причиной. Каждая публикация — новая версия условий, её можно вернуть')
  + `<div class="note" style="margin-bottom:16px">⚠️ <span><b>Числа живут и в текстах приложения</b> («99 ₽ в месяц», «5 отметок», лестница кэшбэка). В продукте тексты должны брать числа из этих настроек — иначе приложение пообещает старое. Пока это прототип: правила здесь сохраняются, а приложение /1/ их ещё не читает</span></div>`
  + MECH_GROUPS.map(([g, t]) => `<h2 style="margin:22px 0 10px">${t}</h2><div class="mech-grid">${SCHEMA.filter(s => s.grp === g).map(s => { const v = (DB.ver[s.id] || []).length;
    return `<a class="mech" href="#/m/${s.id}"><span class="sec-ic" style="background:${s.c};color:${s.fg || '#212221'}">${s.ic}</span><span style="min-width:0"><b>${esc(s.t)}</b><span>${esc(s.d)}</span><em>${s.fields.length} ${plural(s.fields.length, 'параметр', 'параметра', 'параметров')}${v ? ` · версия ${v + 1}` : ''}${FLAG(s.id) ? ' · <span style="color:var(--red)">выключена</span>' : ''}</em></span></a>`; }).join('')}</div>`).join('');
PAGES.m = r => {
  const s = SCHEMA.find(x => x.id === r[1]); if (!s) return PAGES.mech();
  const cur = DB.cfg[s.id], d = draft[s.id] = draft[s.id] || clone(cur), ro = !can('mech.edit');
  const changed = s.fields.filter(f => JSON.stringify(d[f.k]) !== JSON.stringify(cur[f.k]));
  const vers = DB.ver[s.id] || [];
  return `<p style="margin:0 0 10px"><a href="#/mech">← Все механики</a></p>`
  + ph(`<span class="sec-ic" style="display:inline-grid;vertical-align:middle;margin-right:10px;background:${s.c};color:${s.fg || '#212221'}">${s.ic}</span>${esc(s.t)}`, esc(s.d))
  + (ro ? noPerm('mech.edit') : '')
  + `<div class="card" style="margin-bottom:16px"><div class="tog"><span><b>Механика работает</b><br><span class="small muted">Аварийный выключатель: выключили — гость не видит её, касса не считает. Уже выданное доживает свой срок</span></span>${sw('kill', !cur.__off, (ro ? 'disabled ' : '') + `onchange="killSw('${s.id}',this.checked)"`)}</div></div>`
  + `<div class="card">${s.fields.map(f => fieldRow(s, f, d, cur, ro)).join('')}</div>`
  + `<div class="card"><div class="card-h"><h2>Версии условий</h2><span class="sp"></span><span class="small muted">Гость, которому выдали условия, держит их до конца срока</span></div>
    ${vers.length ? `<div class="log">${vers.map((v, i) => `<div class="e"><div class="w">v${vers.length - i + 1} · ${tm(v.at)}<br>${esc(v.by)}</div><div><b>Действует ${esc(v.from)}</b> · ${esc(v.why)}<div>${v.diff.map(x => `<span class="diff">${x}</span>`).join(' ')}</div>${ro ? '' : `<button class="btn sm" style="margin-top:6px" onclick="verBack('${s.id}',${i})">Вернуть как было до неё</button>`}</div></div>`).join('')}<div class="e"><div class="w">v1</div><div>Исходные условия прототипа</div></div></div>` : '<div class="muted small">v1 — исходные условия прототипа. Изменений ещё не было</div>'}</div>`
  + (ro ? '' : `<div class="savebar"><span>${changed.length ? `<b>${changed.length}</b> ${plural(changed.length, 'изменение', 'изменения', 'изменений')} не опубликовано` : '<span class="muted">Изменений нет</span>'}</span><span class="sp"></span>
    <button class="btn" ${changed.length ? '' : 'disabled'} onclick="delete draft['${s.id}'];render()">Отменить</button><button class="btn" onclick="toDefault('${s.id}')">Как в прототипе</button><button class="btn pri" ${changed.length ? '' : 'disabled'} onclick="publish('${s.id}')">Опубликовать…</button></div>`);
};
function fieldRow(s, f, d, cur, ro) {
  const v = d[f.k], ch = JSON.stringify(v) !== JSON.stringify(cur[f.k]), dis = ro || f.lock ? 'disabled' : '';
  if (f.dep) { const neg = f.dep[0] === '!', dv = d[f.dep.replace('!', '')]; if (neg ? dv : !dv) return ''; }
  const at = `data-s="${s.id}" data-k="${f.k}" ${dis}`;
  const U = {money:'₽', pct:'%', days:'дн.', int: f.u || ''}[f.t];
  let inp = '';
  if (['int','money','pct','days'].includes(f.t)) inp = `<div class="u-wrap"><input class="inp" inputmode="numeric" ${at} data-t="n" value="${v}">${U ? `<i>${U}</i>` : ''}</div>`;
  else if (f.t === 'bool') inp = `<div style="display:flex;justify-content:flex-end">${sw('f_' + f.k, v, at + ' data-t="b"')}</div>`;
  else if (f.t === 'select') inp = `<select class="inp" ${at}>${f.opts.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  else if (f.t === 'date' || f.t === 'time') inp = `<input class="inp" type="${f.t}" ${at} value="${esc(v)}">`;
  else if (f.t === 'list') inp = `<div class="list-ed">${v.map((x, i) => `<div class="li"><input class="inp" ${at} data-i="${i}" ${f.num ? 'data-t="n" inputmode="numeric"' : ''} value="${esc(x)}">${dis ? '' : `<button class="x" onclick="lsDel('${s.id}','${f.k}',${i})">✕</button>`}</div>`).join('')}${dis ? '' : `<button class="btn sm" style="align-self:flex-start" onclick="lsAdd('${s.id}','${f.k}',${f.num ? 1 : 0})">＋ Добавить</button>`}</div>`;
  else if (f.t === 'table') inp = '';
  else inp = `<input class="inp" ${at} value="${esc(v)}">`;
  const tbl = f.t === 'table' ? `<div class="tw" style="margin-top:10px;grid-column:1/-1"><table><thead><tr>${f.cols.map(c => `<th>${c.l}</th>`).join('')}<th></th></tr></thead><tbody>${v.map((row, r) => `<tr>${f.cols.map(c => `<td>${c.t === 'bool' ? sw(`t_${f.k}_${r}_${c.k}`, row[c.k], at + ` data-r="${r}" data-c="${c.k}" data-t="b"`) : c.t === 'select' ? `<select class="inp" ${at} data-r="${r}" data-c="${c.k}">${c.opts.map(o => `<option ${o === row[c.k] ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>` : `<input class="inp" ${at} data-r="${r}" data-c="${c.k}" ${c.t === 'text' ? '' : 'data-t="n" inputmode="numeric"'} value="${esc(row[c.k])}">`}</td>`).join('')}<td>${dis ? '' : `<button class="x" onclick="rowDel('${s.id}','${f.k}',${r})">✕</button>`}</td></tr>`).join('')}</tbody></table></div>${dis ? '' : `<div style="grid-column:1/-1"><button class="btn sm" onclick="rowAdd('${s.id}','${f.k}')">＋ Строка</button></div>`}` : '';
  return `<div class="prm ${ch ? 'chg' : ''}"><div class="l"><b>${esc(f.l)}</b>${f.d ? `<p>${esc(f.d)}</p>` : ''}${ch ? `<div class="cur">Сейчас действует: ${fmtVal(f, cur[f.k])}</div>` : ''}${f.risk ? `<div class="risk">⚠️ ${esc(f.risk)}</div>` : ''}${f.code ? `<div class="code">${esc(f.code)}</div>` : ''}${f.lock ? '<div class="risk">🔒 Принцип проекта — не меняется</div>' : ''}</div><div>${inp}</div>${tbl}</div>`;
}
function fmtVal(f, v) {
  if (f.t === 'bool') return v ? 'включено' : 'выключено';
  if (f.t === 'money') return rub(v); if (f.t === 'pct') return pct(v); if (f.t === 'days') return `${v} ${plural(v, 'день', 'дня', 'дней')}`;
  if (f.t === 'date') return dLong(v);
  if (f.t === 'list') return v.join(', ');
  if (f.t === 'table') return v.map(r => f.cols.map(c => c.t === 'bool' ? (r[c.k] ? 'да' : 'нет') : r[c.k]).join(' · ')).join('; ');
  return esc(v) + (f.u ? ' ' + f.u : '');
}
document.addEventListener('change', e => {
  const el = e.target; if (!el.dataset || !el.dataset.s) return;
  const d = draft[el.dataset.s], k = el.dataset.k; let v = el.dataset.t === 'b' ? el.checked : el.dataset.t === 'n' ? +String(el.value).replace(',', '.').replace(/[^\d.\-]/g, '') : el.value;
  const f = SCHEMA.find(x => x.id === el.dataset.s).fields.find(x => x.k === k);
  if (el.dataset.t === 'n' && (isNaN(v) || v < 0)) { toast('Только число от 0'); render(); return; }
  if (f.t === 'pct' && v > 100) { toast('Процент — не больше 100'); render(); return; }
  if (el.dataset.r != null) d[k][+el.dataset.r][el.dataset.c] = v; else if (el.dataset.i != null) d[k][+el.dataset.i] = v; else d[k] = v;
  render();
});
function lsAdd(s, k, num) { draft[s][k].push(num ? 0 : ''); render(); }
function lsDel(s, k, i) { draft[s][k].splice(i, 1); render(); }
function rowAdd(s, k) { const f = SCHEMA.find(x => x.id === s).fields.find(x => x.k === k), r = {}; f.cols.forEach(c => r[c.k] = c.t === 'text' ? '' : c.t === 'bool' ? true : c.t === 'select' ? c.opts[0] : 0); draft[s][k].push(r); render(); }
function rowDel(s, k, i) { draft[s][k].splice(i, 1); render(); }
function toDefault(id) { const s = SCHEMA.find(x => x.id === id); draft[id] = {...clone(DB.cfg[id])}; s.fields.forEach(f => draft[id][f.k] = clone(f.v)); render(); toast('Подставил значения прототипа — проверьте и опубликуйте'); }
function validate(s, d) {
  const e = [];
  if (s.id === 'tiers') { const L = d.list; if (!L.length || L[0].from !== 0) e.push('Первый уровень должен начинаться с 0'); for (let i = 1; i < L.length; i++) if (L[i].from <= L[i - 1].from) e.push('Пороги уровней — по возрастанию'); }
  if (s.id === 'chest') { const w = d.prizes.reduce((a, p) => a + p.w, 0); if (w !== 100) e.push(`Шансы призов в сумме ${w}%, а должно быть 100%`); }
  if (s.id === 'six' && d.offNew < d.offOld) e.push('Скидка на новое меньше, чем на привычное — механика перестанет толкать к новому');
  if (s.id === 'depo') { for (let i = 1; i < d.steps.length; i++) if (d.steps[i].sum <= d.steps[i - 1].sum) e.push('Ступени кэшбэка — по возрастанию суммы'); }
  if (s.id === 'rhythm' && d.perDay * 7 < d.cap) e.push(`За 7 дней набирается ${d.perDay * 7}%, а максимум ${d.cap}% — максимум недостижим`);
  if (s.id === 'plus' && d.tariffs.some(t => !t.n || !(t.p > 0))) e.push('У каждого тарифа — название и цена');
  if (s.id === 'mile') { const n = d.list.map(x => x.n); if (new Set(n).size !== n.length) e.push('Две одинаковые вехи'); }
  if (s.id === 'bd' && (d.before > 30 || d.after > 30)) e.push('Окно дня рождения — не больше 30 дней в каждую сторону');
  s.fields.forEach(f => { if (f.t === 'table' && d[f.k].some(r => f.cols.some(c => c.t === 'text' && !String(r[c.k]).trim()))) e.push(`«${f.l}»: есть пустые строки`); });
  return e;
}
function publish(id) {
  const s = SCHEMA.find(x => x.id === id), d = draft[id], cur = DB.cfg[id], err = validate(s, d);
  if (err.length) { modal({t:'Нельзя опубликовать', body:`<ul style="margin:0;padding-left:18px">${err.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`, ok:'', cancel:'Понятно'}); return; }
  const diff = s.fields.filter(f => JSON.stringify(d[f.k]) !== JSON.stringify(cur[f.k])).map(f => `${esc(f.l)}: <s>${fmtVal(f, cur[f.k])}</s> → <ins>${fmtVal(f, d[f.k])}</ins>`);
  const mon = (() => { const t = new Date(); t.setDate(t.getDate() + ((8 - t.getDay()) % 7 || 7)); return isoDay(t); })();
  modal({t:'Опубликовать изменения', wide:1, body:`<p style="margin-top:0">Что изменится:</p>${diff.map(x => `<div class="diff" style="display:block;margin-bottom:6px">${x}</div>`).join('')}
    <label class="fld" style="margin-top:12px"><span>Когда начнёт действовать</span><select class="inp" id="pf"><option value="now">Сразу</option><option value="tom" selected>С завтра</option><option value="mon">С понедельника, ${dLong(mon)}</option><option value="date">С даты…</option></select></label>
    <label class="fld"><span>Дата (если «с даты»)</span><input class="inp" type="date" id="pd" min="${isoDay()}"></label>
    <label class="fld"><span>Зачем меняем — попадёт в версию</span><textarea class="inp" id="pw" placeholder="Например: тест повышенного кэшбэка до конца месяца"></textarea></label>
    <div class="note">⚠️ <span>Гостям, у которых уже есть выданные условия (предложение, цена недели, подарок), они сохранятся до конца срока. Не забудьте тексты: «Как всё устроено», онбординг, пуши</span></div>`,
    ok:'Опубликовать', onOk:() => {
      const why = val('pw'); if (why.length < 4) { toast('Напишите, зачем меняем'); return false; }
      const pf = val('pf'), from = pf === 'now' ? 'сразу' : pf === 'tom' ? 'с ' + dLong(isoDay(new Date(Date.now() + 864e5))) : pf === 'mon' ? 'с ' + dLong(mon) : val('pd') ? 'с ' + dLong(val('pd')) : '';
      if (!from) { toast('Выберите дату'); return false; }
      (DB.ver[id] = DB.ver[id] || []).unshift({at:Date.now(), by:ME().n, from, why, diff, snap:clone(cur)});
      DB.cfg[id] = clone(d); delete draft[id];
      audit('Правила: ' + s.t, `${diff.join('; ')} · действует ${esc(from)} · ${esc(why)}`); save(); render(); toast('Опубликовано — новая версия условий');
    }});
}
function verBack(id, i) {
  const s = SCHEMA.find(x => x.id === id), v = DB.ver[id][i];
  modal({t:'Вернуть условия?', body:`<p style="margin-top:0">Вернём параметры, которые действовали до изменения от ${tm(v.at)}. Это тоже станет новой версией</p>`, ok:'Подставить в черновик', onOk:() => { draft[id] = {...clone(v.snap), __off: DB.cfg[id].__off}; render(); toast('Подставил — проверьте и опубликуйте'); }});
}
function killSw(id, on) {
  const s = SCHEMA.find(x => x.id === id);
  modal({t: on ? `Включить «${esc(s.t)}»?` : `Выключить «${esc(s.t)}»?`, body:`<p style="margin-top:0">${on ? 'Механика снова начнёт работать у всех гостей' : 'Гости перестанут её видеть, касса — считать. Выданное доживёт свой срок'}</p>${reasonBox(['Сбой','Злоупотребления','Тест','Плановое','Другое'])}`, ok: on ? 'Включить' : 'Выключить', cls: on ? 'pri' : 'red',
    onOk:() => { const why = needReason(); if (!why) return false; DB.cfg[id].__off = !on; if (draft[id]) draft[id].__off = !on; audit((on ? 'Включили: ' : 'Выключили: ') + s.t, esc(why)); save(); render(); }});
  setTimeout(() => { const k = document.getElementById('kill'); if (k) k.checked = !DB.cfg[id].__off; }, 0);
}

/* ── предложения дня ── */
const MECH_T = {pct:'Скидка %', price:'Спеццена', gift:'В подарок к заказу', combo:'Комбо'};
const hsh = s => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
if (!DB.offers) {
  const pick = n => (BASE.find(x => x.n === n) || BASE[0]).id;
  DB.offers = [
    {id:'o1', dish:pick('Капучино'), m:'pct', v:20, w:'любая', on:true}, {id:'o2', dish:pick('Капучино'), m:'pct', v:15, w:'дождь', on:true},
    {id:'o3', dish:pick('Латте'), m:'price', v:220, w:'любая', on:true}, {id:'o4', dish:pick('Круассан'), m:'gift', v:0, w:'любая', on:true},
    {id:'o5', dish:pick('Флэт уайт'), m:'pct', v:25, w:'холодно', on:true}, {id:'o6', dish:pick('Американо'), m:'combo', v:320, d2:pick('Круассан'), w:'любая', on:true},
  ];
}
DB.campaigns = DB.campaigns || [{id:'c1', n:'Салат в обед для 10 гостей', dish:(BASE.find(x => x.cat === 'salati') || BASE[0]).id, m:'price', v:290, who:'10 гостей', from:'12:00', to:'14:00', date:isoDay(), on:true}];
let offTab = 'list';
PAGES.offers = () => {
  const ro = !can('offers.edit');
  const st = o => { const h = hsh(o.id + o.dish), a = 200 + h % 300, s = Math.round(a * (.55 + (h % 30) / 100)), op = Math.round(s * (.45 + (h % 20) / 100)), b = Math.round(op * (.4 + (h % 25) / 100)); return [a, s, op, b]; };
  const offTxt = o => o.m === 'pct' ? `−${o.v}%` : o.m === 'price' ? `за ${rub(o.v)}` : o.m === 'gift' ? 'в подарок к заказу' : `+ ${esc((itm(o.d2) || {}).n)} = ${rub(o.v)}`;
  return ph('Предложения дня', `Из этих вариантов ИИ выбирает каждому гостю одно в день; цену считает движок по <a href="#/m/offer">правилам</a> (до ${C('offer', 'maxPct')}%, маржа от ${C('offer', 'minMargin')}%, бюджет ${rub(C('offer', 'budget'))} в день). ${C('offer', 'explore')}% показов — новое для гостя`, ro ? '' : `<button class="btn pri" onclick="editOffer()">＋ Вариант</button>`)
  + `<div class="tabs">${[['list','Варианты'],['camp','Точечные кампании'],['fun','Воронка']].map(([k, t]) => `<button class="${offTab === k ? 'on' : ''}" onclick="offTab='${k}';render()">${t}</button>`).join('')}</div>`
  + (offTab === 'list' ? `<div class="tw"><table><thead><tr><th>Блюдо</th><th>Выгода</th><th>Когда</th><th class="r">Обычная</th><th>Вкл.</th></tr></thead><tbody>${DB.offers.map(o => { const m = itm(o.dish) || {};
      return `<tr class="click" onclick="editOffer('${o.id}')"><td><div class="cell-n">${m.img ? `<img class="thumb" src="${m.img}" alt="">` : ''}<b>${esc(m.n)}</b></div></td><td><b>${offTxt(o)}</b><div class="small muted">${MECH_T[o.m]}</div></td><td class="small">${o.w === 'любая' ? 'Любая погода' : 'Погода: ' + esc(o.w)}</td><td class="r">${rub(m.p)}</td><td onclick="event.stopPropagation()">${sw('of' + o.id, o.on, (ro ? 'disabled ' : '') + `onchange="offOn('${o.id}',this.checked)"`)}</td></tr>`; }).join('')}</tbody></table></div>`
  : offTab === 'camp' ? `<p class="muted">Пример заказчика: спеццена на салат для 10 выбранных гостей в обед. Кампания идёт поверх ИИ: эти гости в это время получат именно её</p>
    <div class="tw"><table><thead><tr><th>Кампания</th><th>Кому</th><th>Когда</th><th>Выгода</th><th>Вкл.</th></tr></thead><tbody>${DB.campaigns.map(c => `<tr><td><b>${esc(c.n)}</b><div class="small muted">${esc((itm(c.dish) || {}).n)}</div></td><td>${esc(c.who)}</td><td class="small">${dLong(c.date)}, ${c.from}–${c.to}</td><td>${offTxt(c)}</td><td>${sw('cp' + c.id, c.on, (ro ? 'disabled ' : '') + `onchange="DB.campaigns.find(x=>x.id==='${c.id}').on=this.checked;audit('Кампания','${esc(c.n)}: '+(this.checked?'вкл':'выкл'));save()"`)}</td></tr>`).join('')}</tbody></table></div>
    ${ro ? '' : '<div class="btns" style="margin-top:12px"><button class="btn" onclick="editCamp()">＋ Кампания</button></div>'}`
  : `<div class="note blue" style="margin-bottom:12px">ℹ️ <span>Шаги: назначено → показано → открыто → в корзине → куплено. «Назначено, но не показано» — не отказ. Цифры вымышленные</span></div>
    <div class="tw"><table><thead><tr><th>Вариант</th><th class="r">Назначено</th><th class="r">Показано</th><th class="r">Открыто</th><th class="r">Куплено</th><th class="r">Из показанных</th></tr></thead><tbody>${DB.offers.map(o => { const [a, s, op, b] = st(o);
      return `<tr><td>${esc((itm(o.dish) || {}).n)} ${offTxt(o)}</td><td class="r">${a}</td><td class="r">${s}</td><td class="r">${op}</td><td class="r"><b>${b}</b></td><td class="r">${Math.round(b / s * 100)}%</td></tr>`; }).join('')}</tbody></table></div>`);
};
function offOn(id, on) { const o = DB.offers.find(x => x.id === id); o.on = on; audit('Предложение дня', `${esc((itm(o.dish) || {}).n)}: ${on ? 'включено' : 'выключено'}`); save(); }
function dishSelect(id, cur) { return `<select class="inp" id="${id}">${allItems().filter(m => m.offer !== false).map(m => `<option value="${m.id}" ${m.id === cur ? 'selected' : ''}>${esc(m.n)} · ${rub(m.p)}</option>`).join('')}</select>`; }
function editOffer(id) {
  const o = id ? DB.offers.find(x => x.id === id) : {id:'o' + Date.now().toString(36), dish:BASE[0].id, m:'pct', v:15, w:'любая', on:true};
  modal({t: id ? 'Вариант предложения' : 'Новый вариант', body:`<label class="fld"><span>Блюдо</span>${dishSelect('od', o.dish)}</label>
    <div class="row"><label class="fld"><span>Механика</span><select class="inp" id="om">${Object.entries(MECH_T).map(([k, t]) => `<option value="${k}" ${o.m === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
    <label class="fld"><span>Значение (% или ₽)</span><input class="inp" id="ov" inputmode="numeric" value="${o.v}"></label></div>
    <label class="fld"><span>Второе блюдо (для комбо)</span>${dishSelect('o2', o.d2)}</label>
    <label class="fld"><span>Погода</span><select class="inp" id="ow">${['любая','дождь','холодно','жарко','снег'].map(x => `<option ${o.w === x ? 'selected' : ''}>${x}</option>`).join('')}</select><small>Пример заказчика: дождь → −15% на капучино</small></label>`,
    ok: can('offers.edit') ? 'Сохранить' : '', onOk:() => {
      const n = {...o, dish:val('od'), m:val('om'), v:+val('ov'), d2:val('o2'), w:val('ow')}, p = itm(n.dish).p;
      if (n.m === 'pct' && !(n.v > 0 && n.v <= C('offer', 'maxPct'))) { toast(`Скидка от 1 до ${C('offer', 'maxPct')}% — так в правилах`); return false; }
      if (n.m === 'price' && !(n.v > 0 && n.v < p)) { toast(`Спеццена должна быть меньше обычной (${rub(p)})`); return false; }
      if (n.m === 'price' && (1 - n.v / p) * 100 > C('offer', 'maxPct')) { toast(`Это скидка ${Math.round((1 - n.v / p) * 100)}% — больше предела ${C('offer', 'maxPct')}%`); return false; }
      if (id) Object.assign(o, n); else DB.offers.push(n);
      audit(id ? 'Изменили вариант предложения' : 'Новый вариант предложения', esc(itm(n.dish).n) + ' · ' + MECH_T[n.m]); save(); render();
    }});
}
function editCamp() {
  modal({t:'Точечная кампания', body:`<label class="fld"><span>Название для себя</span><input class="inp" id="cn" placeholder="Салат в обед"></label><label class="fld"><span>Блюдо</span>${dishSelect('cd')}</label>
    <div class="row"><label class="fld"><span>Спеццена, ₽</span><input class="inp" id="cv" inputmode="numeric"></label><label class="fld"><span>Кому</span><select class="inp" id="cw"><option>10 гостей</option><option>50 гостей</option>${segList().map(s => `<option>Сегмент: ${esc(s.n)}</option>`).join('')}</select></label></div>
    <div class="row"><label class="fld"><span>День</span><input class="inp" type="date" id="cdt" value="${isoDay()}"></label><label class="fld"><span>С</span><input class="inp" type="time" id="cf" value="12:00"></label><label class="fld"><span>До</span><input class="inp" type="time" id="ct" value="14:00"></label></div>`,
    ok:'Создать', onOk:() => { const p = itm(val('cd')).p, v = +val('cv'); if (val('cn').length < 3) { toast('Назовите кампанию'); return false; } if (!(v > 0 && v < p)) { toast(`Цена меньше обычной (${rub(p)})`); return false; } if (val('cf') >= val('ct')) { toast('«С» раньше «до»'); return false; }
      DB.campaigns.push({id:'c' + Date.now().toString(36), n:val('cn'), dish:val('cd'), m:'price', v, who:val('cw'), date:val('cdt'), from:val('cf'), to:val('ct'), on:true}); audit('Новая кампания', esc(val('cn'))); save(); render(); }});
}

/* ── цены недели ── */
DB.week = DB.week || ['Капучино','Латте','Круассан','Флэт уайт','Раф'].map((n, i) => { const m = BASE.find(x => x.n.startsWith(n)) || BASE[i]; return {dish:m.id, p:Math.round(m.p * .9 / 5) * 5, on:true}; });
PAGES.week = () => {
  const ro = !can('offers.edit');
  return ph('★ Цены недели', `Пул блюд, из которых каждому подписчику подбирается ${C('week', 'perGuest')} ${plural(C('week', 'perGuest'), 'блюдо', 'блюда', 'блюд')} на неделю. Цена держится всю неделю, снижение — не больше ${C('week', 'maxPct')}%`, ro ? '' : '<button class="btn pri" onclick="weekAdd()">＋ Блюдо</button>')
  + `<div class="tw"><table><thead><tr><th>Блюдо</th><th class="r">Обычная</th><th>Цена недели</th><th class="r">Снижение</th><th>В пуле</th><th></th></tr></thead><tbody>${DB.week.map((w, i) => { const m = itm(w.dish) || {p:0}, d = Math.round((1 - w.p / m.p) * 100);
    return `<tr><td><div class="cell-n">${m.img ? `<img class="thumb" src="${m.img}" alt="">` : ''}<b>${esc(m.n)}</b></div></td><td class="r">${rub(m.p)}</td><td style="max-width:140px"><div class="u-wrap"><input class="inp" ${ro ? 'disabled' : ''} inputmode="numeric" value="${w.p}" onchange="weekSet(${i},+this.value)"><i>₽</i></div></td>
    <td class="r">${d > C('week', 'maxPct') || d <= 0 ? `<span class="pill red">${d}%</span>` : `−${d}%`}</td><td>${sw('wk' + i, w.on, (ro ? 'disabled ' : '') + `onchange="DB.week[${i}].on=this.checked;audit('Цены недели','${esc(m.n)}: '+(this.checked?'в пуле':'убрано'));save()"`)}</td><td>${ro ? '' : `<button class="x" onclick="DB.week.splice(${i},1);audit('Цены недели','убрали ${esc(m.n)}');save();render()">✕</button>`}</td></tr>`; }).join('')}</tbody></table></div>
  <p class="small muted">Новая цена — со следующей недели: гостям, которым уже выдали цену на эту неделю, она сохраняется</p>`;
};
function weekSet(i, p) { const w = DB.week[i], m = itm(w.dish); if (!(p > 0 && p < m.p)) { toast(`Цена недели должна быть меньше обычной (${rub(m.p)})`); render(); return; } if ((1 - p / m.p) * 100 > C('week', 'maxPct')) toast(`Внимание: снижение больше ${C('week', 'maxPct')}% — движок не выдаст эту цену`); audit('Цена недели', `${esc(m.n)}: <span class="diff"><s>${rub(w.p)}</s> → <ins>${rub(p)}</ins></span>`); w.p = p; save(); render(); }
function weekAdd() { modal({t:'Блюдо в цены недели', body:`<label class="fld"><span>Блюдо</span>${dishSelect('wd')}</label><label class="fld"><span>Цена недели, ₽</span><input class="inp" id="wp" inputmode="numeric"></label>`, ok:'Добавить', onOk:() => { const m = itm(val('wd')), p = +val('wp'); if (!(p > 0 && p < m.p)) { toast(`Меньше обычной (${rub(m.p)})`); return false; } DB.week.push({dish:m.id, p, on:true}); audit('Цены недели', 'добавили ' + esc(m.n)); save(); render(); }}); }

/* ── герои дня и цвета (берём прямо из приложения /1/) ── */
let ARTS = null;
const ACC0 = ['#b0124f','#00657f','#b23a00','#5e35b1','#f2c230','#0d553f','#c62828','#2b2b93','#8a5a00'];
DB.acc = DB.acc || clone(ACC0);
function loadArts() {
  if (ARTS) return; ARTS = 'loading';
  fetch('1/index.html').then(r => r.text()).then(t => { const m = t.match(/const ARTS = (\[.*?\]);\n/s); ARTS = m ? JSON.parse(m[1]) : []; if (route[0] === 'heroes') render(); }).catch(() => { ARTS = []; if (route[0] === 'heroes') render(); });
}
PAGES.heroes = () => {
  loadArts(); const ro = !can('content.edit');
  const BG = {'var(--pink)':'#ecccce','var(--aqua)':'#9bd9d9','var(--sage)':'#a7d2b9','var(--cream)':'#fef2e9'};
  return ph('Герои дня и цвета', 'Герой на карточке предложения дня берётся по номеру дня. Выключенный пропускается. Новых героев рисуем плоским SVG 140×160 в том же стиле; персонажей под чужими правами — нельзя')
  + `<div class="card"><div class="card-h"><h2>Цвета выгоды</h2><span class="sp"></span><span class="small muted">Каждый день свой; близкие к фону и к герою отсеиваются сами</span></div>
    <div class="btns">${DB.acc.map((c, i) => `<label style="display:flex;align-items:center;gap:6px"><input type="color" ${ro ? 'disabled' : ''} value="${c}" onchange="DB.acc[${i}]=this.value;audit('Цвет выгоды','${c} → '+this.value);save();render()" style="width:38px;height:32px;border:0;background:none;padding:0"><code class="small">${c}</code>${ro ? '' : `<button class="x" onclick="DB.acc.splice(${i},1);save();render()">✕</button>`}</label>`).join('')}
    ${ro ? '' : '<button class="btn sm" onclick="DB.acc.push(\'#444444\');save();render()">＋ Цвет</button>'}</div>
    <p class="small muted">Контраст с пастельными фонами — не меньше 3,3:1, иначе «−15%» не прочитается</p></div>
  <div class="card"><div class="card-h"><h2>Герои</h2><span class="sp"></span>${Array.isArray(ARTS) ? `<span class="small muted">${ARTS.length - DB.heroesOff.length} из ${ARTS.length} включены</span>` : ''}</div>
  ${ARTS === 'loading' || !ARTS ? '<div class="empty">Загружаю героев из приложения…</div>' : !ARTS.length ? '<div class="empty">Не получилось загрузить героев (откройте панель по адресу сайта, а не файлом)</div>'
    : `<div class="hero-grid">${ARTS.map((a, i) => `<div class="hero ${DB.heroesOff.includes(i) ? 'off' : ''}" ${ro ? '' : `onclick="heroTog(${i})"`}><svg viewBox="0 0 140 160" style="background:${BG[a.bg] || a.bg}">${a.svg}</svg>${esc(a.t)}</div>`).join('')}</div>`}</div>`;
};
function heroTog(i) { const k = DB.heroesOff.indexOf(i); if (k >= 0) DB.heroesOff.splice(k, 1); else DB.heroesOff.push(i); audit('Герой дня', `${esc(ARTS[i].t)}: ${k >= 0 ? 'включён' : 'выключен'}`); save(); render(); }
