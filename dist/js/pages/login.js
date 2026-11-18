/* 로그인 | 재난 예경보 통합관리시스템 */
var fail = 0,
  MAX = 5,
  GO = 'gis.html';
function $(id) {
  return document.getElementById(id);
}
function store(k, v) {
  try {
    if (v === undefined) return localStorage.getItem(k);
    v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
  } catch (e) {
    return null;
  }
}
function loginPage() {
  var id = store('damsUserId');
  if (id) {
    $('userId').value = id;
    $('remember').checked = true;
    $('password').focus();
  } else $('userId').focus();
}
function togglePw(b) {
  var p = $('password'),
    v = p.type === 'password';
  p.type = v ? 'text' : 'password';
  b.firstChild.className = v ? 'ri-eye-off-line' : 'ri-eye-line';
}
function gpkiLogin() {
  pageLoading('GPKI 인증서로 로그인 중 입니다.', 1300, function () {
    location.href = GO;
  });
}
function login() {
  if (fail >= MAX) {
    alertMsg('비밀번호 5회 연속 오류로 잠긴 계정입니다.\n시스템 관리자에게 문의하세요.', { ico: 'dg' });
    return;
  }
  if (!checkReq($('loginForm'))) return;
  var id = $('userId').value.trim(),
    pw = $('password');
  if (pw.value === 'fail') {
    fail++;
    pw.value = '';
    $('fldBox').classList.add('err');
    $('failInfo').innerHTML = '<b>비밀번호 오류 ' + fail + ' / ' + MAX + '회</b>';
    if (fail >= MAX) {
      $('lockNotice').hidden = false;
      alertMsg('비밀번호를 5회 잘못 입력하여 계정이 잠겼습니다.\n시스템 관리자에게 잠금 해제를 요청하세요.', {
        ico: 'dg',
        code: '오류코드 : AUTH-LOCK'
      });
    } else
      alertMsg('아이디 또는 비밀번호가 일치하지 않습니다.\n(오류 ' + fail + '회 / 5회 초과 시 계정 잠금)', {
        ico: 'wn',
        focus: pw
      });
    return;
  }
  store('damsUserId', $('remember').checked ? id : null);
  if (id === 'dup') {
    confirmMsg(
      '이미 다른 PC에서 접속 중인 계정입니다.\n기존 접속을 종료하고 로그인하시겠습니까?',
      function () {
        pageLoading('로그인 중 입니다.', 1200, function () {
          location.href = GO;
        });
      },
      { ico: 'wn' }
    );
    return;
  }
  pageLoading('로그인 중 입니다.', 1200, function () {
    location.href = GO;
  });
}
$('password').addEventListener('input', function () {
  $('fldBox').classList.remove('err');
});
/* Caps Lock 안내 */
['userId', 'password'].forEach(function (k) {
  $(k).addEventListener('keyup', capsChk);
  $(k).addEventListener('keydown', capsChk);
});
function capsChk(e) {
  if (e.getModifierState) $('capsMsg').hidden = !e.getModifierState('CapsLock');
}
loginPage();
