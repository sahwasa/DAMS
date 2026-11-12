/* 시스템 매뉴얼 | 재난 예경보 통합관리시스템 */
var TOTAL = +document.getElementById('totCnt').textContent;
function applySize() {
  var v = +document.getElementById('pageSize').value,
    p = document.getElementById('pgBtns');
  p.dataset.total = Math.max(1, Math.ceil(TOTAL / v));
  p.dataset.page = 1;
  initPaging(p.parentNode);
  msg('페이지당 ' + v + '건으로 목록을 조회하였습니다.');
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  var k = f.searchKeyword.value.trim(),
    ty = f.searchType.value,
    n = 0,
    rows = document.querySelectorAll('#listBody tr[data-sn]');
  rows.forEach(function (tr) {
    var t = ty === 'writer' ? tr.dataset.w : tr.dataset.t + (ty === 'titleCn' ? ' ' + (tr.dataset.cn || '') : '');
    var ok = !k || t.indexOf(k) >= 0;
    tr.hidden = !ok;
    if (tr.nextElementSibling && tr.nextElementSibling.classList.contains('ans')) tr.nextElementSibling.hidden = true;
    if (ok && !tr.classList.contains('notice')) n++;
  });
  document.getElementById('noData').hidden = !!document.querySelector('#listBody tr[data-sn]:not([hidden])');
  document.getElementById('totCnt').textContent = k ? n : TOTAL;
  var p = document.getElementById('pgBtns');
  p.dataset.total = k ? 1 : Math.ceil(TOTAL / document.getElementById('pageSize').value);
  p.dataset.page = 1;
  initPaging(p.parentNode);
};
document.querySelector('.sch-box').addEventListener('reset', function () {
  setTimeout(function () {
    document.querySelectorAll('#listBody tr[data-sn]').forEach(function (tr) {
      tr.hidden = false;
    });
    document.getElementById('noData').hidden = true;
    document.getElementById('totCnt').textContent = TOTAL;
    applySize();
    msg('검색조건이 초기화되었습니다.');
  });
});
var DONE = { save: '등록이 완료되었습니다.', update: '수정이 완료되었습니다.', delete: '삭제가 완료되었습니다.' }[
  new URLSearchParams(location.search).get('done')
];
if (DONE) {
  msg(DONE);
  try {
    var _q = new URLSearchParams(location.search);
    _q.delete('done');
    history.replaceState(null, '', location.pathname + (String(_q) ? '?' + _q : ''));
  } catch (e) {}
}
