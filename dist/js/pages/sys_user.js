/* 사용자관리 | 재난 예경보 통합관리시스템 */
/* 샘플 데이터 USERS → sys_user.data.js */ /* [10] 계정잠금여부 acnt_lck_yn · [11] 계정잠금일시 acnt_lck_dt */
function selRow(tr) {
  [].forEach.call(tr.parentNode.children, function (x) {
    x.classList.toggle('on', x === tr);
  });
}
var curRow = null;
function openDetail(btn, i) {
  var u = USERS[i],
    tr = btn.closest('tr');
  selRow(tr);
  curRow = tr;
  var q = ['id', 'nm', 'inst', 'dept', 'jbps', 'code', 'use', 'sms', 'lck', 'lckdt'],
    v = [u[1], u[2], u[3], u[4], u[5], u[7], u[8], u[9], u[10], u[11]];
  openPop(
    'pop/UI-DA07-001-P01.html?' +
      q
        .map(function (k, j) {
          return k + '=' + encodeURIComponent(v[j]);
        })
        .join('&'),
    760
  );
}
function applySize() {
  var n = +document.getElementById('pageSize').value,
    p = document.getElementById('pgBtns');
  p.dataset.total = Math.ceil(10 / n);
  p.dataset.page = 1;
  initPaging(p.parentNode);
  msg('한 페이지에 ' + n + '건씩 표시합니다.');
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  var k = f.userSearchKeyword.value.trim(),
    tb = document.getElementById('userTableBody'),
    sm = f.smsRcptnYn.value,
    lk = f.acntLckYn.value,
    nv = 0;
  [].forEach.call(tb.querySelectorAll('tr.clk'), function (tr, i) {
    var h = (!!sm && USERS[i][9] !== sm) || (!!lk && USERS[i][10] !== lk);
    tr.hidden = h;
    if (!h) nv++;
  });
  if (sm || lk) document.getElementById('userCnt').textContent = nv;
  if (k === '없음') {
    tb.innerHTML = '<tr class="nodata"><td colspan="10">검색된 결과가 없습니다.</td></tr>';
    document.getElementById('userCnt').textContent = 0;
    document.getElementById('pgBtns').dataset.total = 1;
    initPaging(tb.closest('.work'));
  }
};
window.onPopOk = function (k, d) {
  if (k === 'auth' && curRow && d) {
    var i = [].indexOf.call(curRow.parentNode.children, curRow),
      b = curRow.cells[1].querySelector('.badge');
    USERS[i][0] = d.grp;
    USERS[i][7] = d.code;
    b.className = 'badge ' + ({ 관리자: 'pri', 운영자: 'in' }[d.grp] || '');
    b.textContent = d.grp;
    msg('[' + d.id + '] 권한이 ' + d.code + '(으)로 변경되었습니다.');
    return;
  }
  if (k === 'useYn' && curRow && d) {
    var ix = [].indexOf.call(curRow.parentNode.children, curRow),
      b = curRow.querySelector('[data-use]'),
      y = d.use === 'Y',
      sb = curRow.querySelector('[data-sms]'),
      sy = d.sms === 'Y';
    b.className = 'badge' + (y ? ' sc' : '');
    b.textContent = y ? '사용' : '미사용';
    sb.className = 'badge' + (sy ? ' in' : '');
    sb.textContent = sy ? '수신' : '미수신';
    USERS[ix][8] = d.use;
    USERS[ix][9] = d.sms;
    if (d.lck === 'N' && USERS[ix][10] === 'Y') {
      USERS[ix][10] = 'N';
      USERS[ix][11] = '';
      var lb = curRow.querySelector('[data-lck]');
      lb.className = 'badge';
      lb.textContent = '정상';
      lb.removeAttribute('title');
    }
    msg('[' + d.id + '] 사용자 정보(사용여부·문자수신·계정잠금)가 변경되었습니다.');
  }
};
