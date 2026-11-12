/* UI-DA07-001-P01 사용자 상세정보 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA07-001-P01'] = function (location, dlg) {
  var Q = new URLSearchParams(location.search),
    M = { id: 'd_user_id', nm: 'd_user_nm', inst: 'd_inst_nm', dept: 'd_dept_nm', jbps: 'd_jbps_nm' };
  Object.keys(M).forEach(function (k) {
    if (Q.get(k)) document.getElementById(M[k]).textContent = Q.get(k);
  });
  var sel = document.getElementById('d_auth_cd'),
    orgAuth = Q.get('code') || 'DAMS_ADM';
  sel.value = orgAuth;
  var tg = document.getElementById('d_use_yn'),
    org = Q.get('use') || 'Y';
  tg.checked = org === 'Y';
  setTxt();
  var stg = document.getElementById('d_sms_rcptn_yn'),
    orgSms = Q.get('sms') || 'N';
  stg.checked = orgSms === 'Y';
  smsTxt();
  var lck = Q.get('lck') === 'Y',
    orgLck = lck;
  function lckView() {
    var b = document.getElementById('d_acnt_lck_yn');
    b.className = 'badge' + (lck ? ' dg' : '');
    b.textContent = lck ? '잠김' : '정상';
    document.getElementById('d_lck_info').textContent = lck
      ? (Q.get('lckdt') || '') + ' 잠김 · 비밀번호 오류 5회'
      : '비밀번호 오류 0회';
    document.getElementById('btnUnlock').hidden = !lck;
  }
  lckView();
  function unlockAcnt() {
    confirmMsg(
      '[' +
        document.getElementById('d_user_id').textContent +
        '] 계정 잠금을 해제하시겠습니까?\n비밀번호 오류 횟수가 0회로 초기화되며 바로 로그인할 수 있습니다.',
      function () {
        lck = false;
        lckView();
        alertMsg('계정 잠금이 해제되었습니다.', { ico: 'sc' });
      }
    );
  }
  function smsTxt() {
    document.getElementById('d_sms_txt').textContent = stg.checked ? '수신' : '미수신';
  }
  function smsChg(el) {
    var v = el.checked;
    el.checked = !v;
    confirmMsg(
      '문자수신을 [' +
        (v ? '수신' : '미수신') +
        ']으로 변경하시겠습니까?' +
        (v
          ? '\n장애·긴급 알림 문자가 이 사용자의 휴대전화번호로 발송됩니다.'
          : '\n이 사용자에게 알림 문자가 발송되지 않습니다.'),
      function () {
        el.checked = v;
        smsTxt();
        alertMsg('문자수신 여부가 변경되었습니다.', { ico: 'sc' });
      }
    );
  }
  function setTxt() {
    document.getElementById('d_use_txt').textContent = tg.checked ? '사용' : '미사용';
  }
  function authChg() {
    var m = document.getElementById('authMsg');
    m.className = 'f-msg' + (sel.value !== orgAuth ? ' c-pri' : '');
    m.textContent =
      sel.value !== orgAuth
        ? '변경 전: ' + orgAuth + ' → 변경 후: ' + sel.value + ' — [권한 저장]을 눌러야 적용됩니다.'
        : '권한을 바꾸면 사용자 권한관리에 설정된 그 권한 그룹의 메뉴접근·기능 권한이 적용됩니다.';
  }
  function updateUseYn(el) {
    var v = el.checked;
    el.checked = !v;
    confirmMsg(
      '사용여부를 [' +
        (v ? '사용' : '미사용') +
        ']으로 변경하시겠습니까?' +
        (v ? '' : '\n미사용 시 해당 사용자는 로그인할 수 없습니다.'),
      function () {
        el.checked = v;
        setTxt();
        alertMsg('사용여부가 변경되었습니다.', { ico: 'sc' });
      },
      v ? {} : { ico: 'wn', danger: true }
    );
  }
  function saveAuth() {
    if (sel.value === orgAuth) {
      alertMsg('변경된 권한이 없습니다.', { ico: 'in' });
      return;
    }
    var o = sel.selectedOptions[0];
    confirmMsg(
      '사용자 권한을 [' +
        o.textContent +
        ']으로 변경하시겠습니까?\n다음 로그인부터 적용되며 권한 변경 이력에 기록됩니다.',
      function () {
        popOk('auth', {
          id: document.getElementById('d_user_id').textContent,
          code: sel.value,
          grp: o.dataset.g,
          use: tg.checked ? 'Y' : 'N'
        });
      }
    );
  }
  function closeDetail() {
    var u = tg.checked ? 'Y' : 'N',
      m = stg.checked ? 'Y' : 'N';
    if (u !== org || m !== orgSms || lck !== orgLck)
      popOk('useYn', { id: document.getElementById('d_user_id').textContent, use: u, sms: m, lck: lck ? 'Y' : 'N' });
    else closePop();
  }
  return {
    authChg: typeof authChg === 'function' ? authChg : undefined,
    closeDetail: typeof closeDetail === 'function' ? closeDetail : undefined,
    saveAuth: typeof saveAuth === 'function' ? saveAuth : undefined,
    setTxt: typeof setTxt === 'function' ? setTxt : undefined,
    smsChg: typeof smsChg === 'function' ? smsChg : undefined,
    smsTxt: typeof smsTxt === 'function' ? smsTxt : undefined,
    unlockAcnt: typeof unlockAcnt === 'function' ? unlockAcnt : undefined,
    updateUseYn: typeof updateUseYn === 'function' ? updateUseYn : undefined
  };
};
DAMS_POP['UI-DA07-001-P01'].names = [
  'authChg',
  'closeDetail',
  'saveAuth',
  'setTxt',
  'smsChg',
  'smsTxt',
  'unlockAcnt',
  'updateUseYn'
];
