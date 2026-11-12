/* [목업 전용] localStorage('damsCertCancel'·'damsInteg')로 연계확인서 발급 취소·시도 통합 발급 상태를 화면·창 사이에 시연 — 개발 시 서버 데이터 조회로 대체 */
/* 연계확인서 점검실행 | 재난 예경보 통합관리시스템 */
/* 샘플 데이터 ORG → cert_check.data.js */
var Q = new URLSearchParams(location.search),
  KEY = ORG[Q.get('org')] ? Q.get('org') : 'bucheon',
  D = ORG[KEY];
var S = { ran: false, issued: false, running: false, days: [] },
  R = {};
function $(id) {
  return document.getElementById(id);
}
function pad(n) {
  return (n < 10 ? '0' : '') + n;
}
function ymd(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function rate(a, b) {
  return b ? ((a / b) * 100).toFixed(1) + '%' : '-';
}
function orgName() {
  return D.level === 'sido' ? D.name + ' (광역)' : D.name + ' (' + D.parent + ')';
}
function judge(ok, why) {
  if (!S.ran) return '<span class="c-dis">-</span>';
  return ok
    ? '<span class="badge sc">적합</span>'
    : '<span class="badge dg">부적합</span>' +
        (why ? ' <span class="c-dg" style="font-size:12px">' + why + '</span>' : '');
}
function badge(id, k, t) {
  var e = $(id);
  e.className = 'badge ' + k;
  e.textContent = t;
  e.hidden = !t;
}
function ttl(n, all, ok, ng) {
  return !S.ran
    ? n + ' 목록 <small class="c-dis" style="font-weight:400;font-size:13px">(전체 ' + all + '건)</small>'
    : n +
        ' 점검내역 <small style="font-weight:400;font-size:13px">(전체 ' +
        all +
        '건 중 <b class="c-sc">적합 ' +
        ok +
        '건</b> · <b class="c-dg">부적합 ' +
        ng +
        '건</b>)</small>';
}
function periodDays() {
  var p = function (v) {
    var a = v.split(/[-\/]/);
    return new Date(+a[0], a[1] - 1, +a[2]);
  };
  var f = p($('dfrom').value),
    t = p($('dto').value);
  if (isNaN(f) || isNaN(t) || t < f) return null;
  var o = [];
  for (var d = new Date(f); d <= t && o.length < 31; d.setDate(d.getDate() + 1)) o.push(ymd(d));
  return o;
}
function setStatus() {
  var st = S.issued
    ? ['발급완료', 'sc', 2, '발급 승인']
    : S.ran
      ? ['점검완료', 'pri', 1, '점검결과']
      : ['발급대기', '', 1, '점검결과'];
  $('iStat').textContent = st[0];
  $('iStat').className = 'badge ' + st[1];
  $('pgSub').textContent = st[3];
  [].forEach.call($('steps').children, function (li, i) {
    li.className = i < st[2] ? 'done' : i === st[2] ? 'on' : '';
  });
}
function build() {
  var n = S.days.length,
    noti = D.noti.filter(function (r) {
      return r[0] < n;
    }),
    st = S.days.map(function (d, i) {
      var m = D.stMiss[i] || 0;
      return { day: d, recv: 24 - m, miss: m };
    });
  var recv = st.reduce(function (a, r) {
    return a + r.recv;
  }, 0);
  R = {
    noti: noti,
    conn: (D.conn || []).filter(function (r) {
      return r[0] < n;
    }),
    st: st,
    notiNg: noti.filter(function (r) {
      return r[5];
    }).length,
    stRecv: recv,
    stExpect: n * 24
  };
  R.stPass = recv / R.stExpect >= 0.95;
  R.pass = !R.notiNg && R.stPass && noti.length > 0;
}
function render() {
  build();
  var h = '',
    na = D.level !== 'sido';
  $('connNA').hidden = !na;
  $('connTbl').hidden = na;
  if (na)
    $('ttlConn').innerHTML = '연결상태 <small class="c-dis" style="font-weight:400;font-size:13px">(해당없음)</small>';
  else {
    R.conn.forEach(function (r, i) {
      h +=
        '<tr><td>' +
        (i + 1) +
        '</td><td>' +
        S.days[r[0]] +
        ' ' +
        r[1] +
        '</td><td>' +
        (r[2] === '-' ? '-' : S.days[r[0]] + ' ' + r[2]) +
        '</td><td>' +
        (r[2] === '-' ? '유지 중' : '2분 35초 단절') +
        '</td><td class="t-l">' +
        r[3] +
        '</td><td>' +
        judge(true) +
        '</td></tr>';
    });
    $('tbodyConn').innerHTML = h || '<tr class="nodata"><td colspan="6">검색된 결과가 없습니다.</td></tr>';
    $('ttlConn').innerHTML = ttl('연결상태', R.conn.length, R.conn.length, 0);
  }
  h = '';
  R.noti.forEach(function (r, i) {
    h +=
      '<tr' +
      (S.ran && r[5] ? ' class="ng"' : '') +
      '><td>' +
      (i + 1) +
      '</td><td class="t-l">' +
      r[2].replace('>', ' &gt; ') +
      '</td><td class="t-l">' +
      r[3] +
      '</td><td>' +
      S.days[r[0]] +
      ' ' +
      r[1] +
      '</td><td class="t-l">' +
      r[4] +
      '</td><td>' +
      (r[5] ? '응답없음' : '발령성공') +
      '</td><td>' +
      judge(!r[5], r[5]) +
      '</td></tr>';
  });
  $('tbodyNoti').innerHTML = h || '<tr class="nodata"><td colspan="7">검색된 결과가 없습니다.</td></tr>';
  $('ttlNoti').innerHTML = ttl('통보문', R.noti.length, R.noti.length - R.notiNg, R.notiNg);
  h = '';
  var last = S.days[S.days.length - 1];
  D.src.forEach(function (r, i) {
    h +=
      '<tr><td>' +
      (i + 1) +
      '</td><td>' +
      r[0] +
      '</td><td class="t-l">' +
      r[1] +
      '</td><td>11/11</td><td>통과</td><td>' +
      last +
      '</td><td>' +
      judge(true) +
      '</td></tr>';
  });
  $('tbodySrc').innerHTML = h;
  $('ttlSrc').innerHTML = ttl('단말 제원정보', D.src.length, D.src.length, 0);
  h = '';
  R.st.forEach(function (r, i) {
    h +=
      '<tr><td>' +
      (i + 1) +
      '</td><td>' +
      r.day +
      '</td><td class="t-r">24</td><td class="t-r">' +
      r.recv +
      '</td><td class="t-r">' +
      r.miss +
      '</td><td class="t-r">' +
      rate(r.recv, 24) +
      '</td><td>' +
      (S.ran && r.miss ? '<span class="badge wn">적합(허용범위)</span>' : judge(true)) +
      '</td></tr>';
  });
  $('tbodySt').innerHTML = h;
  $('ttlSt').innerHTML = ttl('단말 상태정보', R.stExpect, R.stRecv, R.stExpect - R.stRecv)
    .replace('적합 ', '수신 ')
    .replace('부적합 ', '결손 ');
}
function reset() {
  S.ran = false;
  $('judge').hidden = true;
  ['tbC', 'tbN', 'tbS', 'tbT'].forEach(function (id) {
    badge(id, '', '');
  });
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function () {
  if (S.running || S.issued) return false;
  var d = periodDays();
  if (!d) {
    alertMsg('점검기간을 올바르게 입력해 주세요.', { ico: 'wn', focus: '#dfrom' });
    return false;
  }
  if (d.length >= 31 && $('dto').value !== d[30]) {
    alertMsg('점검기간은 최대 31일까지 선택할 수 있습니다.', { ico: 'wn', focus: '#dto' });
    return false;
  }
  S.days = d;
  reset();
  runCheck();
  msg(d[0] + ' ~ ' + d[d.length - 1] + ' 기간으로 다시 점검하였습니다.');
  return false;
};
/* [점검 시작]으로 들어오면 별도 [점검 실행] 없이 바로 평가 결과를 표시(점검기간 변경 후 [검색]하면 다시 평가) */
function runCheck() {
  if (S.issued) return;
  if (!checkReq($('periodBox'))) return;
  S.ran = false;
  doneRun();
}
function doneRun() {
  S.running = false;
  S.ran = true;
  setStatus();
  render();
  badge('tbC', D.level === 'sido' ? 'sc' : '', D.level === 'sido' ? '적합' : '해당없음');
  badge('tbN', R.notiNg ? 'dg' : 'sc', R.notiNg ? '부적합' : '적합');
  badge('tbS', 'sc', '적합');
  badge('tbT', R.stPass ? 'sc' : 'dg', R.stPass ? '적합' : '부적합');
  var j = $('judge');
  if (R.pass) {
    j.className = 'result-box sc mt16';
    j.innerHTML =
      '<i class="ri-checkbox-circle-line"></i><div><b>총괄판정 : 적합</b><span>연계확인서 발급이 가능합니다. 연계확인서 발급 승인 절차를 진행해 주세요.</span></div><button type="button" class="btn l btn-pri" onclick="approveAsk()"><i class="ri-award-line"></i>연계확인서 발급 승인</button>';
  } else {
    j.className = 'result-box dg mt16';
    j.innerHTML =
      '<i class="ri-close-circle-line"></i><div><b>총괄판정 : 부적합</b><span>하단 탭에서 부적합 항목과 사유를 확인한 후 재점검해 주세요.' +
      (R.notiNg ? ' (통보문 ' + R.notiNg + '건 부적합)' : '') +
      '</span></div><button type="button" class="btn l btn-dg" onclick="ngReport()"><i class="ri-file-warning-line"></i>부적합 결과서</button>';
    document.querySelector('[data-tab="tab-noti"]').click();
  }
  j.hidden = false;
  msg(
    R.pass ? '점검이 완료되었습니다. 전 항목 적합입니다.' : '점검이 완료되었습니다. 부적합 항목이 있습니다.',
    !R.pass
  );
}
/* 부적합 결과서(UI-DA09-002-P02): 점검 결과를 쿼리 d로 넘김 */
function ngReport() {
  if (!S.ran || R.pass) return;
  var per = S.days[0] + ' ~ ' + S.days[S.days.length - 1] + ' (' + S.days.length + '일)',
    sd = D.level === 'sido';
  var items = [
    [
      '연결상태',
      sd ? '적합' : '해당없음',
      sd ? '접속 이력 ' + R.conn.length + '건 · 정상 유지' : '시군구 — NDMS 직접 연계 대상 아님'
    ],
    [
      '통보문',
      R.notiNg ? '부적합' : R.noti.length ? '적합' : '부적합',
      '전체 ' + R.noti.length + '건 중 적합 ' + (R.noti.length - R.notiNg) + '건 · 부적합 ' + R.notiNg + '건'
    ],
    ['단말 제원정보', '적합', '단말 ' + D.src.length + '기 · 필수 필드 11/11 · 코드 검사 통과'],
    ['단말 상태정보', R.stPass ? '적합' : '부적합', '수신율 ' + rate(R.stRecv, R.stExpect) + ' (기준 95% 이상)']
  ];
  var ng = R.noti
    .filter(function (r) {
      return r[5];
    })
    .map(function (r) {
      return [
        '통보문',
        '[' + r[2].replace('>', ' > ') + '] ' + r[3] + ' (' + r[4] + ')',
        S.days[r[0]] + ' ' + r[1],
        r[5]
      ];
    });
  if (!R.stPass)
    ng.push(['단말 상태정보', '상태정보 수신 ' + R.stRecv + ' / 예상 ' + R.stExpect + '건', per, '수신율 95% 미만']);
  if (!R.noti.length) ng.push(['통보문', '점검기간 내 통보문 수신 없음', per, '통보문 미수신']);
  openPop(
    'pop/UI-DA09-002-P02.html?d=' +
      encodeURIComponent(
        JSON.stringify({
          org: orgName(),
          lv: sd ? '시도' : '시군구',
          per: per,
          chkDt: D.checkDate,
          chk: D.checker,
          items: items,
          ng: ng
        })
      ),
    900
  );
}
function approveAsk() {
  if (!S.ran || !R.pass) return;
  openPop(
    'pop/UI-DA09-002-P01.html?org=' +
      encodeURIComponent(orgName()) +
      '&period=' +
      encodeURIComponent(S.days[0] + ' ~ ' + S.days[S.days.length - 1] + ' (' + S.days.length + '일)') +
      '&checker=' +
      encodeURIComponent(D.checker + ' · ' + D.checkDate) +
      '&sido=' +
      (D.level === 'sido' ? 1 : 0),
    760
  );
}
window.onPopOk = function (k, d) {
  if (k === 'issue') doIssue(d);
};
function doIssue(d) {
  if (S.issued) return;
  S.issued = true;
  S.integ = (d && d.sgg) || [];
  /* 연계기관현황과 공유(목업): 시도는 통합 발급 시군구·발급일 저장, 발급 취소 기록은 지움 */
  try {
    var nm = D.level === 'sido' ? D.name : D.parent + ' ' + D.name,
      iss = ymd(new Date()),
      I = JSON.parse(localStorage.getItem('damsInteg') || '{}'),
      C = JSON.parse(localStorage.getItem('damsCertCancel') || '{}');
    if (D.level === 'sido') I[nm] = { sgg: S.integ, iss: iss };
    else I['@' + nm] = { iss: iss };
    delete C[nm];
    localStorage.setItem('damsInteg', JSON.stringify(I));
    localStorage.setItem('damsCertCancel', JSON.stringify(C));
  } catch (e) {}
  ['dfrom', 'dto'].forEach(function (id) {
    $(id).readOnly = true;
  });
  ['btnSearch', 'periodNote', 'judge', 'tabArea'].forEach(function (id) {
    $(id).hidden = true;
  });
  genDoc();
  $('docSec').hidden = false;
  setStatus();
  msg(
    '연계확인서가 발급되었습니다. 해당 기관이 운영 상태로 전환되었습니다.' +
      (S.integ.length ? ' (통합 발급 시군구 ' + S.integ.length + '곳)' : '')
  );
}
function genDoc() {
  var per = S.days[0] + ' ~ ' + S.days[S.days.length - 1] + ' (' + S.days.length + '일)',
    now = ymd(new Date(2026, 9, 30)) + ' 10:30';
  var sec = function (n, t, sum, head, rows) {
    return (
      '<div class="sub-head"><h3 class="h4">' +
      n +
      '. ' +
      t +
      '</h3><span class="cnt">' +
      sum +
      '</span></div><div class="grid-wrap"><table class="grid"><caption class="blind">' +
      t +
      '</caption><thead><tr>' +
      head
        .map(function (h) {
          return '<th>' + h + '</th>';
        })
        .join('') +
      '</tr></thead><tbody>' +
      (rows.length
        ? rows
            .map(function (r) {
              return (
                '<tr>' +
                r
                  .map(function (c) {
                    return '<td>' + c + '</td>';
                  })
                  .join('') +
                '</tr>'
              );
            })
            .join('')
        : '<tr><td colspan="' + head.length + '">' + sum + '</td></tr>') +
      '</tbody></table></div>'
    );
  };
  $('docArea').innerHTML =
    '<h2>연계확인서</h2><p class="doc-sub">재난 예·경보 단말 데이터 연계 적합성 확인 · 시스템 자동 생성</p>' +
    '<table class="tbl"><caption class="blind">연계확인서 발급 정보</caption><colgroup><col style="width:110px"><col><col style="width:110px"><col></colgroup><tbody>' +
    '<tr><th>기관명</th><td>' +
    orgName() +
    '</td><th>확인 기간</th><td>' +
    per +
    '</td></tr>' +
    '<tr><th>0. 연결상태</th><td>' +
    (D.level === 'sido' ? '적합 — 접속 이력 ' + R.conn.length + '건' : '해당없음 (시군구)') +
    '</td><th>1. 통보문</th><td>적합 — 총 ' +
    R.noti.length +
    '건</td></tr>' +
    '<tr><th>2. 제원정보</th><td>적합 — 단말 ' +
    D.src.length +
    '기</td><th>3. 상태정보</th><td>적합 — 수신율 ' +
    rate(R.stRecv, R.stExpect) +
    '</td></tr>' +
    (S.integ && S.integ.length
      ? '<tr><th>통합 발급<br>시군구</th><td colspan="3">' +
        S.integ.length +
        '곳 — ' +
        S.integ.join(', ') +
        '<br><span class="f-msg mt0">자체 플랫폼 없이 ' +
        D.name +
        ' 플랫폼으로 연계하여 본 연계확인서로 함께 발급</span></td></tr>'
      : '') +
    '<tr><th>총괄 판정</th><td><b>발급 가능</b></td><th>연계 시작일</th><td><b>' +
    now +
    '</b></td></tr>' +
    '<tr><th>점검자</th><td colspan="3">' +
    D.checker +
    ' (' +
    D.checkDate +
    ')</td></tr></tbody></table>' +
    sec(
      1,
      '통보문',
      '전체 ' + R.noti.length + '건 · 적합 ' + R.noti.length + '건',
      ['No', '재난분류명', '제목', '발령시각', '발령지역', '판정'],
      R.noti.map(function (r, i) {
        return [i + 1, r[2].replace('>', ' &gt; '), r[3], S.days[r[0]] + ' ' + r[1], r[4], '적합'];
      })
    ) +
    sec(
      2,
      '단말 제원정보',
      '단말 ' + D.src.length + '기 · 적합 ' + D.src.length + '기',
      ['No', '단말 ID', '설치 위치', '필수 필드', '코드 검사', '판정'],
      D.src.map(function (r, i) {
        return [i + 1, r[0], r[1], '11/11', '통과', '적합'];
      })
    ) +
    '<p class="f-msg mt16">· 본 서식은 점검 결과로 자동 생성되며, 공문 별첨용으로 다운로드합니다. · 발급 승인 시점부터 해당 기관의 데이터는 운영 상태로 전환됩니다.</p>';
}
/* 점검기간 변경(달력 선택·직접 입력) 시 바로 다시 점검 — 발급 후에는 변경 불가(readonly) */
['dfrom', 'dto'].forEach(function (id) {
  $(id).addEventListener('change', function () {
    if (!S.issued && !S.running) window.onSearch();
  });
});
function goList() {
  if (S.running) {
    confirmMsg(
      '점검이 진행 중입니다.\n목록으로 이동하시겠습니까?',
      function () {
        location.href = 'cert_request.html';
      },
      { ico: 'wn', danger: true }
    );
    return;
  }
  location.href = 'cert_request.html';
}
$('iOrg').textContent = orgName();
$('iDate').textContent = D.checkDate;
$('iChecker').textContent = D.checker;
S.days = periodDays();
runCheck();
