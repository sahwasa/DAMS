/* UI-DA03-003-P01 단말기 위치 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA03-003-P01'] = function (location, dlg) {
  /* 재난발령현황 > 단말기 발령이력 [전체화면 보기]: 쿼리 t=발령제목, rg=발령지역, d=단말기 JSON [[매체,단말기명,설치지역,결과],...] */
  var Q = new URLSearchParams(location.search),
    TIT = Q.get('t') || '강풍주의보 발표에 따른 시설물 안전 유의',
    RG = Q.get('rg') || '울산 동구',
    DEV = JSON.parse(
      Q.get('d') ||
        '[["자동음성통보","나사등대","울산광역시 울주군 서생면","성공"],["재해문자전광판","방어진항","울산광역시 동구 방어동","실패"],["마을방송","일산해수욕장","울산광역시 동구 일산동","성공"]]'
    );
  var MD_OF = { 재해문자전광판: 'LDB', 마을방송: 'VBS', 자동음성통보: 'VNO', 자동우량경보: 'RAS' },
    RNG_M = { VBS: 900, VNO: 600, RAS: 500 },
    MAP = null,
    RNG = true,
    MDON = {},
    MODE = 1,
    LGOPEN = true,
    SEL = -1;
  var esc = function (t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  document.getElementById('popTit').textContent = '단말기 위치 — ' + TIT;
  /* 지도 높이: 부모 화면 높이(h)의 90%에서 제목·요약·버튼 영역을 뺀 값(iframe 안 vh는 iframe 높이라 쓰지 않음) */
  var PH = +Q.get('h') || 900;
  document.getElementById('devMapFull').style.height =
    Math.max(300, Math.round(PH * 0.9) - (document.documentElement.classList.contains('pc-pop') ? 190 : 170)) + 'px';
  var n = [0, 0, 0];
  DEV.forEach(function (x) {
    n[x[3] === '성공' ? 0 : x[3] === '실패' ? 1 : 2]++;
  });
  document.getElementById('dvSum').innerHTML =
    '발령지역 <b>' +
    esc(RG) +
    '</b> · 단말기 전체<b>' +
    DEV.length +
    '</b>대 / 성공 <b class="c-sc">' +
    n[0] +
    '</b> / 실패 <b class="c-dg">' +
    n[1] +
    '</b> / 미수신 <b>' +
    n[2] +
    '</b><span class="r">휠: 확대/축소 · 드래그: 이동 · 심볼 클릭: 단말기 확대</span>';
  function draw() {
    var el = document.getElementById('devMapFull'),
      cnt = {},
      PT = DEV.map(function (x) {
        cnt[x[2]] = (cnt[x[2]] || 0) + 1;
        return GeoMap.point(x[2], cnt[x[2]]);
      });
    MAP = GeoMap.mount(el, { region: RG, pad: 0.1, points: PT, dim: false });
    var h = '',
      rg = '';
    DEV.forEach(function (x, k) {
      var md = MD_OF[x[0]] || 'LDB';
      if (MDON[md] === false) return;
      var c = PT[k] || GeoMap.centroid(MAP.features[0]),
        st = x[3] === '성공' ? 'ok' : x[3] === '실패' ? 'ng' : 'off';
      if (RNG && RNG_M[md])
        rg +=
          '<span class="gm-rng" style="' +
          GeoMap.at(MAP.P, c) +
          ';width:' +
          RNG_M[md] / 25 +
          'px;height:' +
          RNG_M[md] / 25 +
          'px"></span>';
      h += GeoMap.dev(
        MAP.P,
        c[0],
        c[1],
        md,
        st,
        'data-k="' + k + '" title="' + esc(x[1]) + ' (' + esc(x[0]) + ' · ' + x[3] + ')" onclick="pick(' + k + ')"',
        SEL === k
      );
    });
    MAP.sym.innerHTML = rg + h;
    el.querySelectorAll('.gm-lgd,.gm-mode,.gm-zoom').forEach(function (x) {
      x.remove();
    });
    el.insertAdjacentHTML(
      'beforeend',
      GeoMap.modeBtns(MODE, 'devMode') +
        GeoMap.legendDevice(MDON, RNG, {
          open: LGOPEN,
          off: '미수신',
          only: DEV.map(function (x) {
            return MD_OF[x[0]] || 'LDB';
          })
        }) +
        '<div class="gm-zoom"><button type="button" title="확대" onclick="MAP.api.zoom(1.4)"><i class="ri-add-line"></i></button><button type="button" title="축소" onclick="MAP.api.zoom(.7)"><i class="ri-subtract-line"></i></button><button type="button" title="처음 위치" onclick="MAP.api.reset()"><i class="ri-focus-3-line"></i></button></div>'
    );
    el.classList.remove('m1', 'm2', 'm3');
    el.classList.add('m' + MODE);
  }
  function pick(k) {
    SEL = k;
    document.querySelectorAll('#devMapFull .dev-sym').forEach(function (p) {
      p.classList.toggle('on', +p.dataset.k === k);
    });
    var b = document.querySelector('#devMapFull .dev-sym[data-k="' + k + '"]');
    if (b && MAP) MAP.api.focus(parseFloat(b.style.left), parseFloat(b.style.top), 3);
    msg(DEV[k][1] + ' 단말기 위치로 이동하였습니다.');
  }
  function devMode(m) {
    MODE = m;
    draw();
    msg('배경지도를 ' + ['기본', '2D', '위성'][m - 1] + '으로 전환했습니다.');
  }
  document.addEventListener(
    'toggle',
    function (e) {
      if (e.target.closest && e.target.closest('#devMapFull')) LGOPEN = e.target.open;
    },
    true
  );
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.closest('#devMapFull')) return;
    if (t.dataset.md) {
      MDON[t.dataset.md] = t.checked;
      draw();
    } else if (t.hasAttribute('data-rng')) {
      RNG = t.checked;
      draw();
    }
  });
  window.addEventListener('load', function () {
    draw();
    popResize();
  });
  return {
    devMode: typeof devMode === 'function' ? devMode : undefined,
    draw: typeof draw === 'function' ? draw : undefined,
    pick: typeof pick === 'function' ? pick : undefined
  };
};
DAMS_POP['UI-DA03-003-P01'].names = ['devMode', 'draw', 'pick'];
