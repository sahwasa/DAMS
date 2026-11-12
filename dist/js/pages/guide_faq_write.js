/* FAQ 등록 | 재난 예경보 통합관리시스템 */
var Q = new URLSearchParams(location.search),
  isEdit = Q.get('mode') === 'edit',
  $i = function (id) {
    return document.getElementById(id);
  };
/* 샘플 데이터 D → guide_faq_write.data.js */ /* sn,질문,답변,정렬순서,작성자,작성일 */
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
    location.href = 'guide_faq.html?done=' + (isEdit ? 'update' : 'save');
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
    'FAQ을(를) 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    function () {
      location.href = 'guide_faq.html?done=delete';
    },
    { danger: true }
  );
}
var BACK = 'guide_faq.html';
document.querySelectorAll('textarea[oninput]').forEach(cnt);
if (isEdit) {
  document.querySelectorAll('.ed').forEach(function (e) {
    e.hidden = false;
  });
  $i('fTit').textContent = 'FAQ 수정';
  document.title = 'FAQ 수정 | 재난 예경보 통합관리시스템';
  var bl = document.querySelector('.bread li:last-child a');
  bl.textContent = '수정';
  bl.href = 'guide_faq_write.html?mode=edit&sn=' + encodeURIComponent(R[0]);
  $i('dWriter').textContent = R[4];
  $i('dDate').textContent = R[5];
  $i('m_q').value = R[1];
  $i('m_a').value = R[2];
  $i('m_seq').value = R[3];
  document.querySelectorAll('textarea[oninput]').forEach(cnt);
  msg('FAQ 수정 화면입니다. 내용을 변경한 뒤 [저장]을 누르세요.');
} else msg('항목을 입력한 뒤 [저장]을 누르세요.');
