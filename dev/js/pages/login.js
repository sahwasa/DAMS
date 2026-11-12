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
/* 재난발생현황(GIS상황판 재난발생 샘플과 동일) */
/* 샘플 데이터 EVS·ei → login.data.js */
function evShow() {
  var e = EVS[ei];
  $('evIdx').textContent = ei + 1;
  $('evCnt').textContent = EVS.length;
  $('evTm').textContent = e.tm;
  $('evTit').textContent = e.tit;
  $('evBody').innerHTML =
    '<b>[재난분류]</b>' +
    e.cls +
    '<b>[발생시각]</b>' +
    e.tm +
    '<b>[발생지역]</b>' +
    e.rg +
    '<b>[내용]</b>' +
    e.bd +
    '<b>[연계]</b>' +
    e.iss;
}
function evNav(d) {
  ei = (ei + d + EVS.length) % EVS.length;
  evShow();
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
    $('failInfo').innerHTML = '<b class="c-dg">비밀번호 오류 ' + fail + ' / ' + MAX + '회</b>';
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
evShow();
loginPage();
