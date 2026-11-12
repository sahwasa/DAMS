/* 공지사항 상세 | 재난 예경보 통합관리시스템 */
var Q = new URLSearchParams(location.search),
  $i = function (id) {
    return document.getElementById(id);
  };
/* 샘플 데이터 D → guide_notice_view.data.js */ /* sn,제목,작성자,작성일,조회수,첨부 */
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
  var t = r[1];
  return /연계확인서 발급요청/.test(t)
    ? '행정안전부 재난정보통신과에서 안내드립니다.\n\n재난 예경보 통합관리시스템(DAMS)과 연계하려는 지방정부는 연계확인서 발급요청 공문을 보내 주시기 바랍니다. 공문을 받으면 행정안전부에서 요청한 점검 기간으로 통보문·단말기 상태정보·제원정보·연결상태를 점검하고, 적합하면 연계확인서를 발급합니다(부적합이면 부적합 결과서를 보내 드립니다).\n\n○ 대상 : 16개 시도 및 229개 시군구 중 DAMS 연계(예정) 기관\n○ 점검 조건 : 점검 기간 내 통보문 3건 이상 수신(점검 기간 최대 31일)\n○ 접수 기간 : 2026-11-01 ~ 2026-11-30\n○ 문의처 : 재난예경보 통합상황실 (044-205-1234)'
    : '행정안전부 재난정보통신과에서 안내드립니다.\n\n[' +
        t +
        '] 관련 내용을 아래와 같이 알려드립니다.\n\n○ 적용 일자 : ' +
        r[3] +
        '\n○ 대상 : DAMS 사용자 및 지방정부 담당자\n○ 문의처 : 재난예경보 통합상황실 (044-205-1234)\n\n자세한 사항은 첨부파일을 확인하시기 바랍니다.';
}
function TIT(r) {
  return r[1];
}
function WR(r) {
  return r[2];
}
function DT(r) {
  return r[3];
}
function VW(r) {
  return r[4];
}
function FL(r) {
  return r[5];
}
function goEdit() {
  location.href = 'guide_notice_write.html?mode=edit&sn=' + encodeURIComponent(R[0]);
}
function goList() {
  location.href = 'guide_notice.html';
}
function remove() {
  confirmMsg(
    '공지사항을(를) 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    function () {
      location.href = 'guide_notice.html?done=delete';
    },
    { danger: true }
  );
}
(function () {
  var t = $i('vTit');
  t.textContent = TIT(R);
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
      a.href = 'guide_notice_view.html?sn=' + encodeURIComponent(p[2][0]);
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
  msg(DONE || '공지사항 상세를 조회하였습니다.');
  if (DONE)
    try {
      var _q = new URLSearchParams(location.search);
      _q.delete('done');
      history.replaceState(null, '', location.pathname + (String(_q) ? '?' + _q : ''));
    } catch (e) {}
})();
