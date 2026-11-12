/* 문자전송이력 | 재난 예경보 통합관리시스템 */
var TOTAL = 133;
function setCnt(n, pages) {
  document.getElementById('totCnt').textContent = n.toLocaleString();
  var p = document.getElementById('pgBtns');
  p.dataset.total = pages;
  p.dataset.page = 1;
  initPaging(p.parentNode);
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  var k = f.searchKeyword ? f.searchKeyword.value.trim() : '',
    ss = [].slice.call(f.querySelectorAll('[data-f]')),
    tb = document.querySelector('.grid tbody'),
    n = 0;
  var on =
    k ||
    ss.some(function (s) {
      return s.value.trim();
    });
  tb.querySelectorAll('tr:not(.nodata)').forEach(function (tr) {
    var ok =
      (!k || tr.textContent.indexOf(k) > -1) &&
      ss.every(function (s) {
        var v = tr.cells[+s.dataset.f].textContent.trim();
        var w = s.value.trim();
        return !w || (s.tagName === 'INPUT' || s.dataset.m === 'has' ? v.indexOf(w) > -1 : v === w);
      });
    tr.hidden = !ok;
    if (ok) n++;
  });
  tb.querySelector('.nodata').hidden = n > 0;
  if (on) setCnt(n, 1);
  else setCnt(TOTAL, Math.ceil(TOTAL / +document.getElementById('pageSize').value));
  msg(n ? '조회가 완료되었습니다.' : '검색된 결과가 없습니다.');
  return false;
};
document.getElementById('schForm').addEventListener('reset', function () {
  setTimeout(function () {
    document.querySelectorAll('.grid tbody tr').forEach(function (tr) {
      tr.hidden = tr.classList.contains('nodata');
    });
    setCnt(TOTAL, Math.ceil(TOTAL / +document.getElementById('pageSize').value));
  });
});
function applySize() {
  var s = +document.getElementById('pageSize').value,
    c = +document.getElementById('totCnt').textContent.replace(/,/g, '');
  setCnt(c, Math.max(1, Math.ceil(c / s)));
  msg('페이지당 ' + s + '건으로 목록을 조회하였습니다.');
}
function popUrl(u, o) {
  return u + '?' + new URLSearchParams(o).toString();
}
/* 샘플 데이터 ROWS → log_sms.data.js */
function openDetail(i) {
  var r = ROWS[i];
  document.querySelectorAll('#smsLogTbody tbody tr').forEach(function (x, k) {
    x.classList.toggle('on', k === i);
  });
  openPop(
    popUrl('pop/UI-DA08-001-P01.html', { rs: r[0], se: r[1], cn: r[2], no: r[3], nm: r[4], dt: r[5], err: r[6] }),
    540
  );
}
window.onPopOk = function (k) {
  if (k === 'resend') msg('같은 수신자에게 문자 재발송을 요청하였습니다. (NURI2)');
};
