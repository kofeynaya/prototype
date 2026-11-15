/* Бэк-офис — запуск и связки между частями (последним, после всех файлов со страницами) */
'use strict';
/* «Отправить уведомление» и «Создать рассылку» — везде одна форма, как в Starter */
function mailSeg(sid) {
  if (location.hash !== '#/mailings') location.hash = '#/mailings';
  setTimeout(() => { mkMailNew(); if (sid) { mkM.aud = 'seg'; mkM.seg = sid; mkMailDraw(); } }, 60);
}
pushTo = function (gid) { mkMailNew(gid); };
pushSeg = function (sid) { mailSeg(sid); };
/* ⚠️ В index.html стоит <base href="../"> (меню и фото общие с приложением) — из-за него ссылка href="#/раздел"
   вела на ../#/раздел, то есть в приложение гостя. Все внутренние ссылки «#/…» перехватываем и меняем только хеш */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"],a[href^="admin/#"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault(); const h = a.getAttribute('href').replace(/^admin\//, ''); if (location.hash !== h) location.hash = h; else render();
}, true);
/* и для «открыть в новой вкладке»: настоящий адрес ссылки — admin/#/… */
const fixLinks = root => (root.querySelectorAll ? root.querySelectorAll('a[href^="#"]') : []).forEach(a => a.setAttribute('href', 'admin/' + a.getAttribute('href')));
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches('a[href^="#"]')) n.setAttribute('href', 'admin/' + n.getAttribute('href')); fixLinks(n); } }))).observe(document.body, {childList:true, subtree:true});

/* ── один словарь цветов статусов на всю панель (владелец 13.11: «всё белым, отменён еле розовый — нужен красным»)
   Сплошная плашка, белый текст. Смысл → цвет: красный — отменено/стоп/ошибка/срочно; зелёный — работает/оплачено/готово;
   оранжевый — в процессе/внимание; синий — запланировано/принято; фиолетовый — «Готов» (ждёт выдачи); серый — выключено ── */
document.head.insertAdjacentHTML('beforeend', `<style>
.pill.t-red{background:#d32f2f!important;color:#fff!important;border-color:transparent!important}
.pill.t-green{background:#e3f3e6!important;color:#1b6b2a!important;border-color:#b9dfc1!important}
.pill.t-green::before{content:'';width:7px;height:7px;border-radius:50%;background:#2e7d32;margin-right:6px;display:inline-block}
:root[data-theme="dark"] .pill.t-green{background:#173a22!important;color:#8fd9a2!important;border-color:#24543a!important}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .pill.t-green{background:#173a22!important;color:#8fd9a2!important;border-color:#24543a!important}}
.pill.t-orange{background:#f57c00!important;color:#fff!important;border-color:transparent!important}
.pill.t-blue{background:#1e88e5!important;color:#fff!important;border-color:transparent!important}
.pill.t-purple{background:#8e24aa!important;color:#fff!important;border-color:transparent!important}
.pill.t-grey{background:#78909c!important;color:#fff!important;border-color:transparent!important}
.pill[class*="t-"]{font-weight:600;padding:3px 10px}
</style>`);
const TONE = [
  [/^мало заказов/i, 't-grey'], [/^стандарт/i, 't-green'], [/^загружено/i, 't-orange'], [/^высокий спрос/i, 't-red'],
  [/^(отмен|возвращ|возврат|в стопе|приём заказов на стопе|доставка на стопе|временно не принимаем|bug|высокий$|блок|в чёрном списке|новое|не оплачен|ошибк|опаздыва|не доставлен|отклонил)/i, 't-red'],
  [/^(активн|включен|оплачен|успех|отправлен|доставка окончена|решено|заверш|доставлен|подключен|работает|опубликован|подтвердил|приход)/i, 't-green'],
  [/^(временно закрыт|ищем курьера|средний|остаток|ждём|ждет|ждёт|готовится|в работе|курьер в пути|не подключено|ждём ответа)/i, 't-orange'],
  [/^(запланирован|принят|курьер едет|передано в разработку|создан|новый|в пути)/i, 't-blue'],
  [/^(готов$|готов к выдаче)/i, 't-purple'],
  [/^(вкл|видно|есть|заказ оплачен|в продаже)$/i, 't-green'], [/^(скрыто|выкл|неактивно)$/i, 't-grey'],
  [/^(хит)$/i, 't-orange'], [/^(новинка)$/i, 't-blue'], [/^(от шефа)$/i, 't-purple'],
  [/^(неактивн|отключ|выключ|в архиве|архив|низкий|задача 2 линии|черновик|неактивно)/i, 't-grey'],
];
const SEL_TONE = {'Принят':'#1e88e5','Обработан':'#2e7d32','Новый':'#d32f2f'};
function selTone(root) { (root.querySelectorAll ? root.querySelectorAll('select.mk-st') : []).forEach(s => { const c = SEL_TONE[s.value]; if (c) { s.style.background = c + ' url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\'%3E%3Cpath d=\'M1.5 1.5L6 6l4.5-4.5\' stroke=\'white\' stroke-width=\'1.8\' fill=\'none\'/%3E%3C/svg%3E") no-repeat right 10px center'; s.style.color = '#fff'; s.style.borderColor = 'transparent'; s.style.fontWeight = 600; } if (!s._st) { s._st = 1; s.addEventListener('change', () => selTone(s.parentNode)); } }); }
function toneFix(root) { selTone(root); (root.querySelectorAll ? root.querySelectorAll('.pill') : []).forEach(e => { if (e.classList.contains('prem') || [...e.classList].some(c => c.startsWith('t-'))) return;
  const t = e.textContent.replace(/^[^A-Za-zА-Яа-яЁё]+/, '').trim(); const m = TONE.find(([rx]) => rx.test(t)); if (m) e.classList.add(m[1]); }); }
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.classList && n.classList.contains('pill')) toneFix(n.parentNode || n); else toneFix(n); } }))).observe(document.body, {childList:true, subtree:true});
render();
fixLinks(document);
toneFix(document);
