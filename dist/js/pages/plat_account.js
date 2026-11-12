/* 계정관리 | 재난 예경보 통합관리시스템 */
var SGG = {
  11: [],
  46: ['구례군', '보성군', '함평군'],
  27: ['군위군'],
  31: ['중구', '남구', '동구', '북구', '울주군'],
  41: ['안성시'],
  42: ['철원군'],
  43: ['청주시'],
  44: ['공주시']
};
function fillSgg(v) {
  document.getElementById('acnt_sgg').innerHTML =
    '<option value="">시군구 전체</option>' +
    (SGG[v] || [])
      .map(function (x) {
        return '<option>' + x + '</option>';
      })
      .join('');
  if (v) msg('선택한 시도의 시군구 목록이 설정되었습니다.');
}
document.querySelector('.sch-box').addEventListener('reset', function () {
  setTimeout(function () {
    fillSgg('');
  });
});
function editAcnt(q) {
  openPop('pop/UI-DA04-001-P01.html?mode=edit&acnt=1&' + q, 760);
}
function cnt(d) {
  var c = document.getElementById('cntAll');
  c.textContent = +c.textContent + d;
}
function delAcnt(b) {
  var tr = b.closest('tr');
  confirmMsg(
    '[' +
      tr.cells[2].textContent +
      '] 계정을 계정관리 대상에서 삭제하시겠습니까?\n연계기관현황의 기관 정보는 삭제되지 않습니다.',
    function () {
      tr.remove();
      cnt(-1);
      msg('계정관리 대상에서 삭제되었습니다.');
    },
    { ico: 'wn', danger: true }
  );
}
window.onPopOk = function (k, d) {
  if (k === 'dest') {
    msg('연계기관 정보가 저장되었습니다.');
    return;
  }
  if (k !== 'acnt' || !d) return;
  var tb = document.getElementById('acntTbody'),
    tr = tb.rows[0].cloneNode(true);
  tr.cells[0].textContent = +tb.rows[0].cells[0].textContent + 1;
  tr.cells[1].textContent = d.cd;
  tr.cells[2].textContent = d.nm;
  tr.cells[3].textContent = d.ip;
  tr.cells[4].innerHTML = '<span class="badge sc">Y</span>';
  tr.querySelector('[name=btnAcntEdit]').setAttribute(
    'onclick',
    "editAcnt('cd=" + d.cd + '&nm=' + d.nm + '&ip=' + d.ip + "&op=Y&use=Y')"
  );
  tb.querySelectorAll('tr').forEach(function (x) {
    x.classList.remove('on');
  });
  tr.classList.add('on');
  tb.insertBefore(tr, tb.firstChild);
  cnt(1);
  msg('[' + d.nm + '] 계정이 등록되었습니다.');
};
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function () {
  msg('계정 목록을 조회하였습니다.');
  return false;
};
