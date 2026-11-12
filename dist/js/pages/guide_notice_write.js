/* 공지사항 등록 | 재난 예경보 통합관리시스템 */
var Q = new URLSearchParams(location.search),
  isEdit = Q.get('mode') === 'edit',
  $i = function (id) {
    return document.getElementById(id);
  };
/* 샘플 데이터 D → guide_notice_write.data.js */ /* sn,제목,작성자,작성일,조회수,첨부 */
var R =
  D.find(function (r) {
    return r[0] === Q.get('sn');
  }) || D[0];
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
function rmFile(b) {
  var li = b.parentNode,
    n = li.querySelector('span').textContent;
  confirmMsg(
    '첨부파일 [' + n + ']을(를) 삭제하시겠습니까?',
    function () {
      li.remove();
      $i('fileList').hidden = !$i('fileList').children.length;
      msg('첨부파일이 삭제되었습니다.');
    },
    { danger: true }
  );
}
function addFiles(inp) {
  [].forEach.call(inp.files, function (f) {
    fileLi($i('fileList'), f.name, (f.size / 1024 / 1024).toFixed(1) + 'MB', false, true);
  });
  if (inp.files.length) {
    $i('m_file_nm').value = inp.files[0].name + (inp.files.length > 1 ? ' 외 ' + (inp.files.length - 1) + '건' : '');
    msg(inp.files.length + '개 파일이 선택되었습니다.');
  }
  inp.value = '';
}
function cnt(t) {
  var c = t.parentNode.querySelector('.f-cnt b');
  if (c) c.textContent = t.value.length.toLocaleString();
}
function save() {
  if (!checkReq($i('wForm'))) return;
  confirmMsg(isEdit ? '수정하시겠습니까?' : '등록하시겠습니까?', function () {
    location.href =
      'guide_notice_view.html?sn=' +
      encodeURIComponent(isEdit ? R[0] : D[0][0]) +
      '&done=' +
      (isEdit ? 'update' : 'save');
  });
}
function cancelW() {
  confirmMsg(
    '작성을 취소하시겠습니까?\n입력한 내용은 저장되지 않습니다.',
    function () {
      if (history.length > 1) history.back();
      else location.href = BACK;
    },
    { danger: true }
  );
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
var BACK = 'guide_notice.html';
document.querySelectorAll('textarea[oninput]').forEach(cnt);
if (isEdit) {
  document.querySelectorAll('.ed').forEach(function (e) {
    e.hidden = false;
  });
  $i('fTit').textContent = '공지사항 수정';
  document.title = '공지사항 수정 | 재난 예경보 통합관리시스템';
  var bl = document.querySelector('.bread li:last-child a');
  bl.textContent = '수정';
  bl.href = 'guide_notice_write.html?mode=edit&sn=' + encodeURIComponent(R[0]);
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
  $i('dWriter').textContent = R[2];
  $i('dDate').textContent = R[3];
  $i('m_title').value = R[1];
  $i('m_body').value = BODY(R);
  if (R[5]) fileLi($i('fileList'), R[5], '0.8MB', true, true);
  BACK = 'guide_notice_view.html?sn=' + R[0];
  document.querySelectorAll('textarea[oninput]').forEach(cnt);
  msg('공지사항 수정 화면입니다. 내용을 변경한 뒤 [저장]을 누르세요.');
} else msg('항목을 입력한 뒤 [저장]을 누르세요.');
