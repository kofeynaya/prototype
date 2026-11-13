/* Бэк-офис — запуск и связки между частями (последним, после всех файлов со страницами) */
'use strict';
/* «Отправить уведомление» и «Создать рассылку» — везде одна форма, как в Starter */
function mailSeg(sid) {
  if (location.hash !== '#/mailings') location.hash = '#/mailings';
  setTimeout(() => { mkMailNew(); if (sid) { mkM.aud = 'seg'; mkM.seg = sid; mkMailDraw(); } }, 60);
}
pushTo = function (gid) { mkMailNew(gid); };
pushSeg = function (sid) { mailSeg(sid); };
render();
