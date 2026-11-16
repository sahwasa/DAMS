/* 오류 안내 | 재난 예경보 통합관리시스템 */
/* 오류 유형: ?code=404(기본)|403|500|503 — 서버 오류 응답 시 같은 화면에 문구만 바꿔 표시 */
/* 샘플 데이터 ER → error.data.js */
(function () {
  var c = (location.search.match(/[?&]code=(\d+)/) || [])[1],
    e = ER[c] || ER['404'];
  document.getElementById('erCode').textContent = e[0];
  document.getElementById('erTit').textContent = e[1];
  document.getElementById('erMsg').innerHTML = e[2];
  var i = document.getElementById('erIco');
  i.className = 'er-ico' + (e[4] ? ' ' + e[4] : '');
  i.innerHTML = '<i class="' + e[3] + '" aria-hidden="true"></i>';
  document.title = e[1] + ' | 재난 예경보 통합관리시스템';
})();
function goBack() {
  if (history.length > 1 && document.referrer) history.back();
  else location.href = 'login.html';
}
