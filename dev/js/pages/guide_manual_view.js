/* 시스템 매뉴얼 상세 | 재난 예경보 통합관리시스템 */
var Q = new URLSearchParams(location.search),
  $i = function (id) {
    return document.getElementById(id);
  };
/* 샘플 데이터 D → guide_manual_view.data.js */ /* sn,구분,제목,작성자,작성일,조회수,첨부 */
var ix = Math.max(
    0,
    D.findIndex(function (r) {
      return r[0] === Q.get('sn');
    })
  ),
  R = D[ix];
var SZ = ['2.4MB', '1.1MB', '860KB', '3.2MB', '540KB', '1.8MB'];
function fileLi(ul, n, sz, saved, edit) {
  var li = document.createElement('li');
  li.innerHTML =
    '<i class="ri-file-text-line"></i><span></span><em class="c-wn" style="font-style:normal">' +
    sz +
    '</em>' +
    (saved
      ? '<button type="button" title="다운로드" onclick="doDown(this.parentNode.querySelector(\'span\').textContent)"><i class="ri-download-2-line"></i></button>'
      : '') +
    (edit ? '<button type="button" title="삭제" onclick="rmFile(this)"><i class="ri-close-line"></i></button>' : '');
  li.querySelector('span').textContent = n;
  if (saved && edit) li.lastChild.style.marginLeft = '0';
  ul.appendChild(li);
  ul.hidden = false;
}
function BODY(r) {
  return (
    '본 문서는 [' +
    r[2] +
    ']에 대한 안내 자료입니다.\n\n1. 화면 구성 및 메뉴 이동 방법\n2. 주요 기능별 처리 절차\n3. 오류 발생 시 확인 사항 및 문의처\n\n상세한 내용은 첨부된 파일을 참조하시기 바랍니다.\n문의: 재난예경보 통합상황실 (044-205-1234)'
  );
}
function TIT(r) {
  return r[2];
}
function WR(r) {
  return r[3];
}
function DT(r) {
  return r[4];
}
function VW(r) {
  return r[5];
}
function FL(r) {
  return r[6];
}
function goEdit() {
  location.href = 'guide_manual_write.html?mode=edit&sn=' + encodeURIComponent(R[0]);
}
function goList() {
  location.href = 'guide_manual.html';
}
function remove() {
  confirmMsg(
    '시스템 매뉴얼을(를) 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    function () {
      location.href = 'guide_manual.html?done=delete';
    },
    { danger: true }
  );
}
(function () {
  var t = $i('vTit');
  t.textContent = TIT(R);
  t.insertAdjacentHTML('afterbegin', '<span class="badge pri"></span>');
  t.firstChild.textContent = R[1];
  $i('vWriter').textContent = WR(R);
  $i('vViews').textContent = (VW(R) + 1).toLocaleString();
  $i('vDate').textContent = DT(R);
  $i('vMod').textContent = WR(R);
  $i('vModDt').textContent = DT(R);
  $i('vBody').textContent = BODY(R);
  var ul = $i('fileList');
  if (FL(R)) fileLi(ul, FL(R), SZ[ix % SZ.length], true, false);
  else ul.innerHTML = '<li class="c-dis">첨부파일이 없습니다.</li>';
  var nav = $i('vNav');
  [
    ['이전글', 'ri-arrow-up-s-line', D[ix + 1]],
    ['다음글', 'ri-arrow-down-s-line', D[ix - 1]]
  ].forEach(function (p) {
    var li = document.createElement('li');
    li.innerHTML = '<span><i class="' + p[1] + '"></i>' + p[0] + '</span>';
    if (p[2]) {
      var a = document.createElement('a');
      a.href = 'guide_manual_view.html?sn=' + encodeURIComponent(p[2][0]);
      a.textContent = TIT(p[2]);
      li.appendChild(a);
      var e = document.createElement('em');
      e.textContent = DT(p[2]);
      li.appendChild(e);
    } else li.insertAdjacentHTML('beforeend', '<span class="none">' + p[0] + '이 없습니다.</span>');
    nav.appendChild(li);
  });
  var DONE = { save: '등록이 완료되었습니다.', update: '수정이 완료되었습니다.', delete: '삭제가 완료되었습니다.' }[
    Q.get('done')
  ];
  msg(DONE || '시스템 매뉴얼 상세를 조회하였습니다.');
  if (DONE)
    try {
      var _q = new URLSearchParams(location.search);
      _q.delete('done');
      history.replaceState(null, '', location.pathname + (String(_q) ? '?' + _q : ''));
    } catch (e) {}
})();
