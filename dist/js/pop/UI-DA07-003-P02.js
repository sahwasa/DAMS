/* UI-DA07-003-P02 상세코드 등록 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA07-003-P02'] = function (location, dlg) {
  var Q = new URLSearchParams(location.search),
    edit = Q.get('mode') === 'edit',
    f = document.getElementById('codeForm');
  if (Q.get('group'))
    document.getElementById('m_code_group').textContent =
      Q.get('group') + (Q.get('gnm') ? ' (' + Q.get('gnm') + ')' : '');
  if (edit) {
    document.getElementById('popTit').textContent = '상세코드 수정';
    document.title = document.title.replace('등록', '수정');
    f.m_code_cd.value = Q.get('cd');
    f.m_code_cd.readOnly = true;
    document.getElementById('cdMsg').textContent = '코드는 수정할 수 없습니다.';
    f.m_code_nm.value = Q.get('nm') || '';
    f.m_code_expln.value = Q.get('expln') || '';
    f.m_code_use.checked = Q.get('use') !== 'N';
    f.m_code_use.onchange();
  }
  function saveCode() {
    if (!checkReq(f)) return;
    confirmMsg('저장하시겠습니까?\n변경 내용은 작업이력에 공통코드 변경으로 기록됩니다.', function () {
      popOk('code', {
        cd: f.m_code_cd.value.trim(),
        nm: f.m_code_nm.value.trim(),
        expln: f.m_code_expln.value.trim(),
        use: f.m_code_use.checked ? 'Y' : 'N'
      });
    });
  }
  return { saveCode: typeof saveCode === 'function' ? saveCode : undefined };
};
DAMS_POP['UI-DA07-003-P02'].names = ['saveCode'];
