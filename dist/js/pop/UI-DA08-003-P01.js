/* UI-DA08-003-P01 작업이력 등록 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA08-003-P01'] = function (location, dlg) {
  var Q = new URLSearchParams(location.search),
    $id = function (i) {
      return document.getElementById(i);
    };
  var edit = Q.get('mode') === 'edit';
  if (edit) {
    document.title = document.title.replace('등록', '수정');
    $id('popTit').textContent = '작업이력 수정';
    var d = (Q.get('dt') || '').split(' ');
    $id('m_prcs_dt').value = d[0] || '';
    $id('m_prcs_dt_tm').value = d[1] || '';
    $id('m_job_se_cd').value = Q.get('se') || '';
    $id('m_job_cn').value = Q.get('cn') || '';
    $id('m_issue_cn').value = Q.get('issue') || '';
    $id('m_prcr_nm').value = Q.get('nm') || '';
    $id('btnDel').hidden = false;
    $id('btnSave').innerHTML = '<i class="ri-save-line"></i>수정';
  }
  function save() {
    if (!checkReq($id('frm'))) return;
    confirmMsg(edit ? '수정하시겠습니까?' : '저장하시겠습니까?', function () {
      popOk(edit ? 'edit' : 'save');
    });
  }
  function remove() {
    confirmMsg(
      '작업이력을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
      function () {
        popOk('delete');
      },
      { ico: 'wn', danger: true }
    );
  }
  return {
    remove: typeof remove === 'function' ? remove : undefined,
    save: typeof save === 'function' ? save : undefined
  };
};
DAMS_POP['UI-DA08-003-P01'].names = ['remove', 'save'];
