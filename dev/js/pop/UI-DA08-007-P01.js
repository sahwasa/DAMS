/* UI-DA08-007-P01 개인정보 접근이력 상세 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA08-007-P01'] = function (location, dlg) {
  var Q = new URLSearchParams(location.search),
    $id = function (i) {
      return document.getElementById(i);
    };
  var SEB = { 조회: 'in', 입력: 'pri', 수정: 'wn', 삭제: 'dg', 다운로드: 'sc' },
    se = Q.get('se') || '입력',
    cnt = +(Q.get('cnt') || 1250),
    subj = Q.get('subj') || '홍*동 외 1,249명';
  if (Q.get('dt')) {
    $id('v_dt').textContent = Q.get('dt');
    $id('v_user').textContent = Q.get('uid') + ' / ' + Q.get('nm') + ' (' + Q.get('org') + ')';
    $id('v_ip').textContent = Q.get('ip');
    $id('v_menu').textContent = Q.get('menu');
    $id('v_rsn').textContent = Q.get('rsn');
  }
  $id('rsnRow').hidden = se !== '다운로드';
  $id('v_se').innerHTML = '<span class="badge ' + SEB[se] + '">' + se + '</span>';
  $id('v_cnt').textContent = cnt.toLocaleString() + '건';
  $id('v_tot').textContent = cnt.toLocaleString();
  /* 개인정보 항목: 성명·사용자 ID·소속·부서/직급·권한(휴대전화번호·이메일은 수집하지 않음, 2026-11-10 사용자 결정) */
  var ITEM = {
    조회: '성명, 소속',
    입력: '성명, 소속, 부서/직급',
    수정: '소속, 부서/직급',
    삭제: '계정 전체',
    다운로드: '성명, 사용자 ID, 소속, 부서/직급'
  }[se];
  var NM = ['김*영', '이*호', '박*수', '최*진', '정*민'],
    ID = ['mois_usr01', 'mois_usr02', 'mois_usr03', 'mois_usr04', 'mois_usr05'],
    h = '';
  var first = subj.split(/,| 외/)[0];
  for (var i = 0; i < Math.min(cnt, 5); i++)
    h +=
      '<tr><td>' +
      (i + 1) +
      '</td><td>' +
      (i === 0 ? first : NM[i]) +
      '</td><td>' +
      ID[i] +
      '</td><td class="t-l">' +
      ITEM +
      '</td></tr>';
  $id('v_list').innerHTML = h;
  $id('v_pg').dataset.total = Math.ceil(cnt / 5);
  initPaging(document.querySelector('.pop-body'));
  return {};
};
DAMS_POP['UI-DA08-007-P01'].names = [];
