/* 연계현황 모니터링 | 재난 예경보 통합관리시스템 */
document.querySelector('.page-head').appendChild(document.getElementById('headBtns'));
var T = new Date(2026, 9, 30, 15, 20, 30),
  timer = null;
function p2(n) {
  return String(n).padStart(2, '0');
}
function refreshDashboard() {
  T = new Date(T.getTime() + 30000);
  document.getElementById('lastUpdateTime').textContent =
    T.getFullYear() +
    '-' +
    p2(T.getMonth() + 1) +
    '-' +
    p2(T.getDate()) +
    ' ' +
    p2(T.getHours()) +
    ':' +
    p2(T.getMinutes()) +
    ':' +
    p2(T.getSeconds());
  msg('연계현황을 갱신하였습니다. (' + document.getElementById('lastUpdateTime').textContent + ')');
}
function setAuto(on) {
  clearInterval(timer);
  timer = on ? setInterval(refreshDashboard, 30000) : null;
  msg(on ? '자동갱신을 시작합니다. (30초 주기)' : '자동갱신을 중지하였습니다.');
}
/* 연계기관 데이터(계정관리 등록 10개 기관, 직제순): [기관, 세션 ok|dg(정상/끊김), 금일 발령, 제원정보 최종 수신시각, 전체 단말기, 수신 단말기, 연결, 끊김, 전일대비 증감, 상태정보 최종 수신시각] — 단말기현황(394/387/7)과 맞춤 */
/* 샘플 데이터 SD → warn_monitor.data.js */
var ST = { ok: ['정상', 'sc'], dg: ['끊김', 'dg'] };
/* 금일 발령 상세(시도 → 하위 시군구): 시도 통합플랫폼은 본청 + 관할 시군구 발령, 시군구 통합플랫폼은 해당 시군구 발령 — 직제순 */
/* 샘플 데이터 ISS → warn_monitor.data.js */
function orgTip(e, i) {
  e.stopPropagation();
  var old = document.getElementById('orgTip'),
    d = SD[i];
  if (old) {
    old.remove();
    if (old.dataset.i == i) return;
  }
  var nm = d[0].replace(/청$/, ''),
    w = nm.split(' '),
    sd = w[0],
    sg = w.slice(1).join(' '),
    SDN = {
      서울특별시: '서울특별시',
      대구: '대구광역시',
      울산광역시: '울산광역시',
      경기: '경기도',
      강원: '강원특별자치도',
      충북: '충청북도',
      충남: '충청남도',
      전남광주: '전남광주통합특별시'
    },
    rows = ISS[d[0]] || [[sg, d[2]]],
    full = SDN[sd] || sd,
    t = document.createElement('div'),
    w2 = rows.length > 8,
    cell = function (r) {
      return (
        '<th' +
        (r[1] ? '' : ' class="z"') +
        '><i class="ri-corner-down-right-line"></i>' +
        r[0] +
        '</th><td' +
        (r[1] ? '' : ' class="z"') +
        '>' +
        r[1] +
        '건</td>'
      );
    };
  t.className = 'layer org-tip' + (w2 ? ' w2' : '');
  t.id = 'orgTip';
  t.dataset.i = i;
  t.innerHTML =
    '<div class="layer-h">' +
    nm +
    ' 금일 발령 <b class="c-pri">' +
    d[2] +
    '</b>건<button type="button" class="close" title="닫기" onclick="this.closest(\'.org-tip\').remove()"><i class="ri-close-line"></i></button></div>' +
    '<p class="ot-sd">' +
    (ISS[d[0]] ? '시도 통합플랫폼 — 본청 + 관할 시군구 발령' : '시군구 통합플랫폼 — 해당 시군구 발령') +
    '</p><table class="ot-t"><tbody>' +
    '<tr class="p"><th' +
    (w2 ? ' colspan="3"' : '') +
    '>' +
    full +
    '</th><td>' +
    d[2] +
    '건</td></tr>' +
    (w2
      ? rows
          .reduce(function (a, r, k) {
            if (k % 2 === 0) a.push([r]);
            else a[a.length - 1].push(r);
            return a;
          }, [])
          .map(function (pr) {
            return '<tr>' + pr.map(cell).join('') + (pr.length < 2 ? '<th></th><td></td>' : '') + '</tr>';
          })
          .join('')
      : rows
          .map(function (r) {
            return '<tr' + (r[1] ? '' : ' class="z"') + '>' + cell(r) + '</tr>';
          })
          .join('')) +
    '</tbody></table>';
  document.body.appendChild(t);
  var r = e.currentTarget.getBoundingClientRect();
  t.style.left = Math.min(innerWidth - t.offsetWidth - 8, r.left + scrollX) + 'px';
  var top = r.bottom + 6;
  if (top + t.offsetHeight > innerHeight - 8) top = Math.max(8, innerHeight - 8 - t.offsetHeight);
  t.style.top = top + scrollY + 'px';
}
document.addEventListener('click', function (e) {
  var t = document.getElementById('orgTip');
  if (t && !t.contains(e.target)) t.remove();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var t = document.getElementById('orgTip');
    t && t.remove();
  }
});
/* 연계기관 현황: 세션 체크 결과(정상/끊김)만 세로 한 줄씩 */
function drawTiles() {
  document.getElementById('monTiles').innerHTML = SD.map(function (d, i) {
    var st = ST[d[1]];
    return (
      '<li class="' +
      d[1] +
      '"><i class="dot"></i><b>' +
      d[0].replace(/청$/, '') +
      '</b><button type="button" class="n" title="시도·시군구별 발령 건수 보기" onclick="orgTip(event,' +
      i +
      ')">발령 <b>' +
      d[2] +
      '</b>건</button><span class="badge ' +
      st[1] +
      '">' +
      st[0] +
      '</span></li>'
    );
  }).join('');
  var ok = SD.filter(function (d) {
    return d[1] === 'ok';
  }).length;
  document.getElementById('orgSum').innerHTML =
    '<span>정상<b class="c-sc">' +
    ok +
    '</b>· 끊김<b class="c-dg">' +
    (SD.length - ok) +
    '</b></span><span>금일 발령 <b class="c-pri">' +
    SD.reduce(function (a, d) {
      return a + d[2];
    }, 0) +
    '</b>건</span>';
}
/* 단말기 수신정보(상태정보+제원정보 통합) */
function drawTerm() {
  var t = [0, 0, 0, 0];
  document.querySelector('#rcvTerminal tbody').innerHTML = SD.map(function (d) {
    t[0] += d[4];
    t[1] += d[5];
    t[2] += d[6];
    t[3] += d[7];
    var dv = d[8] === '0' ? '0' : '<span class="' + (d[8][0] === '+' ? 'c-sc' : 'c-dg') + '">' + d[8] + '</span>';
    return (
      '<tr' +
      (d[1] === 'dg' ? ' class="ng"' : '') +
      '><td class="t-l">' +
      d[0].replace(/청$/, '') +
      '</td><td' +
      (d[1] === 'dg' ? ' class="c-dg"' : '') +
      '>' +
      d[9] +
      '</td><td class="t-r">' +
      d[6] +
      '</td><td class="t-r' +
      (d[7] ? ' c-dg' : '') +
      '">' +
      d[7] +
      '</td><td>' +
      d[3] +
      '</td><td class="t-r">' +
      d[5] +
      '</td><td class="t-r">' +
      dv +
      '</td></tr>'
    );
  }).join('');
  document.getElementById('termCnt').innerHTML =
    '전체<b>' + t[0] + '</b>대 / 연결 <b class="c-sc">' + t[2] + '</b>대 / 끊김 <b class="c-dg">' + t[3] + '</b>대';
}
/* 금일 수신 현황(재난정보·발령정보 통합, 최신순) */
/* 샘플 데이터 FEED·FK → warn_monitor.data.js */
function feedTab(b, k) {
  FK = k;
  [].forEach.call(document.querySelectorAll('#feedTab li'), function (l) {
    l.classList.toggle('on', l.contains(b));
  });
  drawFeed();
}
/* 재난정보 출처(연계 수신 원천): 기상특보·지진/지진해일=기상청, 산사태·산불=산림청, 홍수예보=발표기관명(권역별 홍수통제소, dams_if.tb_flod_frcst_trn.prsntn_inst_nm — 수신 여부 확인 필요) */
var FSRC = {
  '15:00:31': '낙동강홍수통제소',
  '09:30:29': '금강홍수통제소',
  '03:30:33': '한강홍수통제소',
  '14:20:27': '산림청',
  '08:50:35': '산림청'
};
function drawFeed() {
  var a = FEED.filter(function (f) {
    return !FK || f[1] === FK;
  });
  document.getElementById('monFeed').innerHTML = a
    .map(function (f) {
      var o = f[1] === 'occur';
      return (
        '<li class="' +
        (o ? 'oc' : 'is') +
        '" onclick="location.href=\'' +
        (o ? 'warn_occur' : 'warn_issue') +
        '.html\'"><time>' +
        f[0] +
        '</time><span class="tl-k">' +
        (o ? '재난정보' : '발령정보') +
        '</span>' +
        (o ? '<span class="tl-src">출처: ' + (FSRC[f[0]] || '기상청') + '</span>' : '') +
        '<p>' +
        f[2] +
        '<em>' +
        f[3] +
        '</em></p></li>'
      );
    })
    .join('');
  var n = FEED.filter(function (f) {
    return f[1] === 'occur';
  }).length;
  document.getElementById('feedCnt').innerHTML =
    '재난정보<b>' + n + '</b>건 / 발령정보<b>' + (FEED.length - n) + '</b>건';
}
/* 종합 상태 */
(function () {
  var N = SD.length,
    ok = SD.filter(function (d) {
      return d[1] === 'ok';
    }).length,
    nO = FEED.filter(function (f) {
      return f[1] === 'occur';
    }).length,
    dev = SD.reduce(function (a, d) {
      return a + d[4];
    }, 0),
    rcv = SD.reduce(function (a, d) {
      return a + (d[1] === 'ok' ? d[5] : 0);
    }, 0),
    bad = SD.reduce(function (a, d) {
      return a + d[7];
    }, 0);
  document.getElementById('monKpi').innerHTML =
    '<div><dl><dt>NDMS 메인포털</dt><dd>정상</dd><dd class="s" title="최종 수신 15:20:29">15:20:29</dd></dl></div>' +
    '<div class="' +
    (ok < N ? 'dg' : '') +
    '"><dl><dt>연계기관 연결상태</dt><dd>' +
    ok +
    '<small>/ ' +
    N +
    '</small></dd><dd class="s">' +
    (N - ok ? '<span class="c-dg">끊김 ' + (N - ok) + '</span>' : '전 기관 정상') +
    '</dd></dl></div>' +
    '<div class="' +
    (ok < N ? 'wn' : '') +
    '"><dl><dt>단말기 상태정보</dt><dd>' +
    ok +
    '<small>/ ' +
    N +
    '</small></dd><dd class="s">끊김 <span class="c-dg">' +
    bad +
    '</span>대</dd></dl></div>' +
    '<div><dl><dt>단말기 제원정보</dt><dd>' +
    N +
    '<small>/ ' +
    N +
    '</small></dd></dl></div>' +
    '<div class="in"><dl><dt>금일 재난정보 수신</dt><dd>' +
    nO +
    '<small>건</small></dd><dd class="s" title="최근 15:10 기상특보">최근 15:10</dd></dl></div>' +
    '<div class="in"><dl><dt>금일 재난발령 수신</dt><dd>' +
    (FEED.length - nO) +
    '<small>건</small></dd><dd class="s" title="최근 15:00 울산 강풍주의보">최근 15:00</dd></dl></div>';
})();
drawTiles();
drawFeed();
drawTerm();

timer = setInterval(refreshDashboard, 30000);
/* 장애 알림(SFR-04): 시각(배너) + 청각(경고음) — 목업은 화면 진입 1초 후 1회 */
setTimeout(function () {
  alarm('연계 장애 1건: 강원 철원군 연계서버 연결 끊김', { href: 'log_dsblty.html' });
}, 1000);
