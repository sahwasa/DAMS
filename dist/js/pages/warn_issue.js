/* 재난발령현황 | 재난 예경보 통합관리시스템 */
/* 샘플 데이터 ROWS → warn_issue.data.js */
/* 샘플 데이터 DET → warn_issue.data.js */
var CUR = 0,
  PINS = [
    [22, 62],
    [26, 72],
    [32, 80],
    [52, 40],
    [66, 34],
    [76, 48],
    [72, 60],
    [60, 28],
    [56, 52],
    [40, 30],
    [44, 66],
    [84, 36],
    [30, 46],
    [64, 74],
    [48, 20],
    [80, 70]
  ];
function esc(t) {
  return String(t).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function render(i) {
  var r = ROWS[i],
    d = DET[i],
    t = document.getElementById('issue-summary'),
    $ = function (x) {
      return document.getElementById(x);
    };
  CUR = i;
  $('dtlTitle').textContent = r[2];
  t.querySelector('[data-k=sys]').textContent = d.sys;
  t.querySelector('[data-k=cat]').textContent = r[1].split('>').join(' > ');
  t.querySelector('[data-k=med]').textContent = d.med.join(', ');
  t.querySelector('[data-k=tm]').textContent = r[3];
  t.querySelector('[data-k=end]').textContent = d.end;
  t.querySelector('[data-k=rgn]').textContent = r[4];
  var has = function (m) {
      return d.med.indexOf(m) > -1;
    },
    none = '<span class="c-dis">해당 매체로 발령되지 않았습니다.</span>';
  $('msgBoard').innerHTML = has('재해문자전광판') ? esc(d.board) : none;
  var v = has('마을방송') || has('자동음성통보') || has('자동우량경보');
  $('msgVoice').innerHTML = v ? esc(d.voice) : none;
  $('msgSms').innerHTML = has('문자방송') ? esc(d.sms) : none;
  /* 단말기 발령이력 */
  var h = '',
    g = '',
    n = [0, 0, 0],
    grp = {};
  d.dev.forEach(function (x) {
    (grp[x[0]] = grp[x[0]] || []).push(x);
  });
  var k = 0,
    pins = '';
  Object.keys(grp).forEach(function (s) {
    var a = grp[s],
      c = [0, 0, 0];
    a.forEach(function (x) {
      c[x[5] === '성공' ? 0 : x[5] === '실패' ? 1 : 2]++;
    });
    h +=
      '<tr class="grp"><td colspan="6">' +
      s +
      '<em>전체 ' +
      a.length +
      ' · 성공 ' +
      c[0] +
      ' · 실패 ' +
      c[1] +
      ' · 미수신 ' +
      c[2] +
      '</em></td></tr>';
    a.forEach(function (x) {
      var b =
          x[5] === '성공'
            ? '<span class="badge sc">성공</span>'
            : x[5] === '실패'
              ? '<span class="badge dg tip" data-tip="실패사유: ' + esc(x[6]) + '">실패</span>'
              : '<span class="badge">미수신</span>',
        cl = x[5] === '성공' ? 'cl-sc' : x[5] === '실패' ? 'cl-dg' : 'cl-na',
        q = PINS[k % PINS.length];
      h +=
        '<tr class="clk" onclick="focusDevice(this,' +
        k +
        ')" data-sgg="' +
        esc(x[3]) +
        '"><td>' +
        (k + 1) +
        '</td><td>' +
        x[1] +
        '</td><td class="t-l">' +
        esc(x[2]) +
        '</td><td class="t-l">' +
        esc(x[3]) +
        '</td><td>' +
        x[4] +
        '</td><td>' +
        b +
        '</td></tr>';
      k++;
      n[x[5] === '성공' ? 0 : x[5] === '실패' ? 1 : 2]++;
    });
  });
  document.querySelector('#device_table tbody').innerHTML = h;
  $('devCnt').innerHTML =
    '전체<b>' +
    d.dev.length +
    '</b>건 / 성공 <b class="c-sc">' +
    n[0] +
    '</b>건 / 실패 <b>' +
    n[1] +
    '</b>건 / 미수신 <b class="c-wn">' +
    n[2] +
    '</b>건';
  if (!$('pnlDevice').hidden) drawDevMap();
  var sg = $('device_addr2');
  sg.innerHTML =
    '<option value="">시군구 전체</option>' +
    d.sgg
      .map(function (x) {
        return '<option>' + esc(x) + '</option>';
      })
      .join('');
}
function selectRow(tr, i) {
  [].forEach.call(tr.parentNode.children, function (x) {
    x.classList.toggle('on', x === tr);
  });
  render(i);
  msg('[' + ROWS[i][2] + '] 발령 상세를 조회하였습니다.');
}
/* 발령보고서: 선택한 발령을 보고서 팝업으로(팝업에서 인쇄) */
function openReport() {
  openPop('pop/UI-DA03-003-P02.html?d=' + encodeURIComponent(JSON.stringify({ r: ROWS[CUR], d: DET[CUR] })), 900);
}
render(0);
document.querySelector('#history_table tbody tr').classList.add('on');
var MAP = null,
  RNG = true,
  MDON = {},
  MD_OF = { 재해문자전광판: 'LDB', 마을방송: 'VBS', 자동음성통보: 'VNO', 자동우량경보: 'RAS' },
  RNG_M = { VBS: 900, VNO: 600, RAS: 500 };
function drawDevMap(sel) {
  var el = document.getElementById('devMap'),
    d = DET[CUR],
    r = ROWS[CUR];
  var cnt = {},
    PT = d.dev.map(function (x) {
      cnt[x[3]] = (cnt[x[3]] || 0) + 1;
      return GeoMap.point(x[3], cnt[x[3]]);
    });
  MAP = GeoMap.mount(el, { region: r[4], pad: 0.1, points: PT, dim: false });
  var h = '',
    rg = '';
  d.dev.forEach(function (x, k) {
    var md = MD_OF[x[1]] || 'LDB';
    if (MDON[md] === false) return;
    var c = PT[k] || GeoMap.centroid(MAP.features[0]);
    var st = x[5] === '성공' ? 'ok' : x[5] === '실패' ? 'ng' : 'off',
      q = MAP.P(c);
    if (RNG && RNG_M[md])
      rg +=
        '<span class="gm-rng" style="' +
        GeoMap.at(MAP.P, c) +
        ';width:' +
        RNG_M[md] / 40 +
        'px;height:' +
        RNG_M[md] / 40 +
        'px"></span>';
    h += GeoMap.dev(
      MAP.P,
      c[0],
      c[1],
      md,
      st,
      'data-k="' + k + '" title="' + esc(x[2]) + ' (' + x[5] + ')" onclick="focusDevice(null,' + k + ')"',
      sel === k
    );
  });
  MAP.sym.innerHTML = rg + h;
  el.querySelectorAll('.gm-lgd,.gm-mode,.gm-zoom,.lbl').forEach(function (x) {
    x.remove();
  });
  el.insertAdjacentHTML(
    'beforeend',
    GeoMap.modeBtns(MODE, 'devMode') +
      GeoMap.legendDevice(MDON, RNG, {
        open: LGOPEN,
        off: '미수신',
        only: d.dev.map(function (x) {
          return MD_OF[x[1]] || 'LDB';
        })
      }) +
      '<div class="gm-zoom"><button type="button" title="확대" onclick="MAP.api.zoom(1.4)"><i class="ri-add-line"></i></button><button type="button" title="축소" onclick="MAP.api.zoom(.7)"><i class="ri-subtract-line"></i></button><button type="button" title="처음 위치" onclick="MAP.api.reset()"><i class="ri-focus-3-line"></i></button></div><span class="lbl">' +
      esc(r[4]) +
      ' · 단말기 ' +
      d.dev.length +
      '개소</span>'
  );
  el.classList.remove('m1', 'm2', 'm3');
  el.classList.add('m' + MODE);
}
var LGOPEN = false;
document.addEventListener(
  'toggle',
  function (e) {
    if (e.target.closest && e.target.closest('#devMap')) LGOPEN = e.target.open;
  },
  true
);
var MODE = 1;
function devMode(n) {
  MODE = n;
  drawDevMap();
  msg('배경지도를 ' + ['기본', '2D', '위성'][n - 1] + '으로 전환했습니다.');
}
document.addEventListener('change', function (e) {
  var t = e.target;
  if (!t.closest('#devMap')) return;
  if (t.dataset.md) {
    MDON[t.dataset.md] = t.checked;
    drawDevMap();
    msg((t.checked ? '표출: ' : '숨김: ') + t.parentNode.textContent.trim());
  } else if (t.hasAttribute('data-rng')) {
    RNG = t.checked;
    drawDevMap();
  }
});
function focusDevice(tr, i) {
  tr = tr || document.querySelectorAll('#device_table tbody tr.clk')[i];
  document.querySelectorAll('#device_table tbody tr').forEach(function (x) {
    x.classList.toggle('on', x === tr);
  });
  document.querySelectorAll('#devMap .dev-sym').forEach(function (p) {
    p.classList.toggle('on', +p.dataset.k === i);
  });
  var b = document.querySelector('#devMap .dev-sym[data-k="' + i + '"]');
  if (b && MAP) {
    var st = b.style;
    MAP.api.focus(parseFloat(st.left), parseFloat(st.top), 3);
  }
  msg(tr.cells[2].textContent + ' 단말기 위치로 이동하였습니다.');
}
/* 단말기 위치 [전체화면 보기] → 큰 지도 팝업(UI-DA03-003-P01): 현재 발령의 단말기 목록을 쿼리로 전달 */
function openDevFull() {
  var d = DET[CUR],
    r = ROWS[CUR],
    q = new URLSearchParams({
      t: r[2],
      rg: r[4],
      h: innerHeight,
      d: JSON.stringify(
        d.dev.map(function (x) {
          return [x[1], x[2], x[3], x[5]];
        })
      )
    });
  openPop('pop/UI-DA03-003-P01.html?' + q.toString(), Math.max(760, Math.min(innerWidth - 80, 1600)));
  msg('단말기 위치를 전체화면으로 표시합니다.');
}
window.onTab = function (id) {
  if (id === 'pnlDevice') {
    drawDevMap();
    msg('선택한 발령의 단말기 발령이력을 조회하였습니다.');
  }
};
