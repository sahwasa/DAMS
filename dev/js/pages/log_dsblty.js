/* 장애이력 | 재난 예경보 통합관리시스템 */
var TOTAL = 23;
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
        if (s.dataset.m === 'st') v = v.indexOf('미복구') > -1 ? '미복구' : '복구완료';
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
/* 샘플 데이터 ROWS → log_dsblty.data.js */
function openEdit(i) {
  document.querySelectorAll('#histBody tbody tr').forEach(function (x, k) {
    x.classList.toggle('on', k === i);
  });
  if (i == null) {
    openPop('pop/UI-DA08-004-P01.html', 760);
    return;
  }
  var r = ROWS[i];
  var tds = document.querySelectorAll('#histBody tbody tr')[i].cells;
  openPop(
    popUrl('pop/UI-DA08-004-P01.html', {
      mode: 'edit',
      se: r[0],
      srv: r[1],
      org: tds[3].textContent,
      ds: tds[4].textContent,
      cn: r[2],
      oc: r[3],
      rs: r[4],
      nm: r[5],
      act: r[6]
    }),
    760
  );
}
window.onPopOk = function (k) {
  msg(
    k === 'delete'
      ? '장애이력이 삭제되었습니다.'
      : k === 'edit'
        ? '장애 조치내용이 수정되었습니다.'
        : '장애가 접수되었습니다.'
  );
};
