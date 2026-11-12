/* 데이터송수신이력 | 재난 예경보 통합관리시스템 */
var TOTAL = 19524;
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
    ss = [].slice.call(f.querySelectorAll('select[data-f]')),
    tb = document.querySelector('.grid tbody'),
    n = 0;
  var on =
    k ||
    ss.some(function (s) {
      return s.value;
    });
  tb.querySelectorAll('tr:not(.nodata)').forEach(function (tr) {
    var ok =
      (!k || tr.textContent.indexOf(k) > -1) &&
      ss.every(function (s) {
        var v = tr.cells[+s.dataset.f].textContent.trim();
        return !s.value || (s.dataset.m === 'has' ? v.indexOf(s.value) > -1 : v === s.value);
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
/* 샘플 데이터 ROWS·SGG → log_data.data.js */
function setSgg(v) {
  document.getElementById('sgg_select').innerHTML =
    '<option value="">시군구 전체</option>' +
    (SGG[v] || [])
      .map(function (s) {
        return '<option>' + s + '</option>';
      })
      .join('');
}
function openCap(i) {
  var r = ROWS[i];
  document.querySelectorAll('#dataLogTbl tbody tr').forEach(function (x, k) {
    x.classList.toggle('on', k === i);
  });
  openPop(popUrl('pop/UI-DA08-006-P01.html', { org: r[0], io: r[1], se: r[2], rs: r[3], dt: r[4], id: r[6] }), 760);
}
