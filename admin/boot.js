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
fixLinks(document);
}, true);
/* и для «открыть в новой вкладке»: настоящий адрес ссылки — admin/#/… */
const fixLinks = root => (root.querySelectorAll ? root.querySelectorAll('a[href^="#"]') : []).forEach(a => a.setAttribute('href', 'admin/' + a.getAttribute('href')));
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches('a[href^="#"]')) n.setAttribute('href', 'admin/' + n.getAttribute('href')); fixLinks(n); } }))).observe(document.body, {childList:true, subtree:true});
render();
fixLinks(document);
