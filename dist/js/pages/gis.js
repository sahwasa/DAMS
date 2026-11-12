/* GIS상황판 | 재난 예경보 통합관리시스템 */
/* ---------- 샘플 데이터 ---------- */
var LV = { d: ['경보', '#ef4444', 'dg'], a: ['주의보', '#f5930b', 'wn'], i: ['정보·해제', '#22c55e', 'sc'] };
function hzi(lv, ic, cls, alt) {
  return (
    '<i class="hz-ico lv-' +
    lv +
    (cls ? ' ' + cls : '') +
    '">' +
    (ic ? '<img src="' + hz(ic) + '" alt="' + (alt || '') + '">' : '') +
    '</i>'
  );
}
var MD = {
  VNO: ['자동음성통보', 'ri-volume-up-line', '음성경보사이렌', 1200],
  LDB: ['재해문자전광판(지자체)', 'ri-tv-2-line', '전광판', 0],
  CDB: ['재해문자전광판(행안부)', 'ri-tv-2-line', '재해문자전광판', 0],
  VBS: ['마을방송', 'ri-broadcast-line', '마을방송', 800],
  BIS: ['버스정보시스템', 'ri-bus-line', '버스정보안내기', 0]
};
/* 단말기 발령 실패사유(샘플) */
var FR = [
  '응답시간 초과(Timeout)',
  '단말기 통신 장애',
  '전광판 표출 오류',
  '음성 송출 실패(앰프 이상)',
  '전원 차단',
  '인증 실패(키 불일치)'
];
var RS = { s: ['성공', 'sc', '#008a1e'], f: ['실패', 'dg', '#eb003b'], n: ['미수신', '', '#8e8e8e'] };
var CAT = { 자연재난: ['호우', '강풍', '지진', '대설', '태풍'], 사회재난: ['산불', '미세먼지', '화재'] };
var SGG = {
  충청남도: ['천안시', '아산시', '보령시', '서산시', '태안군'],
  울산광역시: ['동구', '남구', '북구', '울주군'],
  경상북도: ['안동시', '의성군', '포항시', '경주시']
};
/* 재난발생정보 (최근 1년, 발표일시 내림차순) */
/* 샘플 데이터 EV → gis.data.js */
/* 재난발령정보: md=[매체코드,전체,성공,실패,미수신] */
/* 샘플 데이터 IS → gis.data.js */
var LOCAL = ['I20', 'I19', 'I18', 'I6', 'I11', 'I12', 'I7', 'I1', 'I9', 'I2', 'I4', 'I5', 'I14', 'I10', 'I8', 'I16'];
/* 사건분류코드(ev) → 심볼 아이콘·단계(js/hazard.js, 연동 가이드라인 별첨6) */
[]
  .concat(
    EV,
    Object.keys(IS).map(function (k) {
      return IS[k];
    })
  )
  .forEach(function (x) {
    var h = x.ev && HZ[x.ev];
    if (h) {
      x.lv = h[2];
      x.ic = h[1];
    }
  });
var EVM = {};
EV.forEach(function (e) {
  EVM[e.id] = e;
});
Object.keys(IS).forEach(function (k) {
  IS[k].id = k;
});
var GIS = document.querySelector('.gis');
var S = {
  ly: { lk: true, nc: true, un: true },
  tab: 'occur',
  ev: null,
  is: null,
  mode: 1,
  rng: true,
  media: {},
  lg: { hz: !matchMedia('(max-width:767px)').matches, dv: !matchMedia('(max-width:767px)').matches },
  evList: EV.slice(),
  mList: [],
  lList: LOCAL.slice(),
  dv: [],
  dsel: null
};

/* ---------- 유틸 ---------- */
function $(id) {
  return document.getElementById(id);
}
function hz(ic) {
  return 'images/hazard_icon/' + ic + '.png';
}
/* 발령 주체 표시명: '울산 동구 통합플랫폼' → '울산 동구', '행정안전부 재해문자전광판' → '행정안전부' */
function org(i) {
  var n = i.sys.replace(/\s*(통합플랫폼|재해문자전광판)$/, '');
  return /^(행정안전부|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남광주|전남|경북|경남|제주)/.test(
    n
  )
    ? n
    : (SH[i.sido] ? SH[i.sido] + ' ' : '') + n;
}
function tot(i) {
  return i.md.reduce(
    function (a, m) {
      return [a[0] + m[1], a[1] + m[2], a[2] + m[3], a[3] + m[4]];
    },
    [0, 0, 0, 0]
  );
}
function chips(a, n) {
  return (
    '<div class="chips">' +
    a
      .slice(0, n)
      .map(function (t) {
        return '<span>' + t + '</span>';
      })
      .join('') +
    (a.length > n
      ? '<button type="button" data-more="' +
        a.slice(n).join('|') +
        '" title="발령지역 더보기">+' +
        (a.length - n) +
        '</button>'
      : '') +
    '</div>'
  );
}
function sh(nm) {
  return nm.replace(/^(\S+)\s/, '');
}

/* ---------- 목록 ---------- */
function evCard(e) {
  var l = LV[e.lv];
  return (
    '<li class="gis-card' +
    (S.ev === e.id ? ' on' : '') +
    '" data-ev="' +
    e.id +
    '"><div class="gc-h"><span class="badge ' +
    l[2] +
    '">' +
    e.c.join(' &gt; ') +
    '</span><span>' +
    e.tm +
    '</span><span class="r">매칭 발령 <b class="c-pri">' +
    e.iss.length +
    '</b>건</span></div><div class="gc-t">' +
    hzi(e.lv, e.ic, 's', e.c[1]) +
    '<span title="' +
    e.tit +
    '">' +
    e.tit +
    '</span></div>' +
    chips(e.rg, 3) +
    '</li>'
  );
}
function isCard(id) {
  var i = IS[id],
    t = tot(i),
    on = S.is === id;
  return (
    '<li class="gis-card' +
    (on ? ' on' : '') +
    '" data-iss="' +
    id +
    '"><div class="gc-h"><span class="badge ' +
    LV[i.lv][2] +
    '" title="' +
    i.sys +
    '">' +
    org(i) +
    '</span><span class="r">' +
    i.tm.slice(0, 16) +
    '</span></div><div class="gc-t">' +
    hzi(i.lv, i.ic, 's') +
    '<span title="' +
    i.tit +
    '">' +
    i.tit +
    '</span></div>' +
    chips(i.rg, 2) +
    '<div class="gc-f">전체 <b>' +
    t[0] +
    '</b><span class="c-sc">성공 <b>' +
    t[1] +
    '</b></span><span class="c-dg">실패 <b>' +
    t[2] +
    '</b></span><span class="na">미수신 <b>' +
    t[3] +
    '</b></span>' +
    ('<button type="button" class="btn s btn-line gc-dtl" onclick="event.stopPropagation();openIssue(\'' +
      id +
      '\')"><i class="ri-file-list-3-line"></i>상세보기</button>') +
    '</div>' +
    (on ? isDetail(i) : '') +
    '</li>'
  );
}
/* 지방정부발령 [상세보기] → 재난발령 상세 팝업(재난발령현황 하단 상세와 같은 내용, GIS·이미지 제외) */
var IC = {
  CW: ['자연재난', '한파'],
  HW: ['자연재난', '강풍'],
  HR: ['자연재난', '호우'],
  MF: ['사회재난', '산불'],
  EQ: ['자연재난', '지진'],
  HS: ['자연재난', '대설']
};
function openIssue(id) {
  var i = IS[id],
    c = IC[i.ic] || ['자연재난', ''],
    nm = (i.tit.match(/^\[([^\]]+)\]/) || [0, ''])[1],
    o = {
      sys: i.sys,
      org: org(i),
      cat: c[0] + ' > ' + c[1] + (nm ? ' > ' + nm : ''),
      tit: i.tit.replace(/^\[[^\]]+\]\s*/, ''),
      tm: i.tm,
      end: i.end,
      rg: i.rg.join(', '),
      md: i.md
        .map(function (m) {
          return m.join(':');
        })
        .join(','),
      pl: i.pl.join(',')
    };
  openPop('pop/UI-DA02-001-P01.html?' + new URLSearchParams(o).toString(), 900);
}
function isDetail(i) {
  return (
    '<div class="gc-d"><dl><dt>발령시각</dt><dd>' +
    i.tm +
    '</dd><dt>종료시각</dt><dd>' +
    i.end +
    '</dd><dt>발령지역</dt><dd>' +
    i.rg.join(', ') +
    '</dd></dl><table class="grid mini"><colgroup><col><col style="width:44px"><col style="width:44px"><col style="width:44px"><col style="width:50px"></colgroup><thead><tr><th>매체구분</th><th>전체</th><th>성공</th><th>실패</th><th>미수신</th></tr></thead><tbody>' +
    i.md
      .map(function (m) {
        return (
          '<tr><td class="t-l" title="' +
          MD[m[0]][0] +
          '">' +
          MD[m[0]][0] +
          '</td><td class="t-r">' +
          m[1] +
          '</td><td class="t-r">' +
          m[2] +
          '</td><td class="t-r">' +
          m[3] +
          '</td><td class="t-r">' +
          m[4] +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}
function drawOccur() {
  $('gisDisasterList').innerHTML =
    S.evList.map(evCard).join('') || '<li class="gis-empty">검색된 결과가 없습니다.</li>';
  $('cntOccur').textContent = S.evList.length;
}
function drawMatch() {
  $('gisResultList').innerHTML =
    S.mList.map(isCard).join('') ||
    '<li class="gis-empty">매칭되는 재난발령이 없습니다.' +
      (S.ev && !EVM[S.ev].iss.length
        ? '<br><small>재난발생지역 중 연계지역은 지도에 미발령지역으로 표시됩니다.</small>'
        : '') +
      '</li>';
  $('cntMatch').textContent = S.mList.length + '건';
}
function drawLocal() {
  $('localIssueList').innerHTML = S.lList.map(isCard).join('') || '<li class="gis-empty">검색된 결과가 없습니다.</li>';
  $('cntLocal').textContent = S.lList.length;
}
function drawLists() {
  drawOccur();
  if (S.ev) drawMatch();
  drawLocal();
}

/* ---------- 지도 (GeoMap: 통계청 행정경계 기본도) ---------- */
var MAP = $('gisMap'),
  ST = $('gmStage'),
  MAPI = GeoMap.interact(MAP, ST),
  CUR = {},
  MODE_NM = ['기본', '2D', '위성'];
var SH = { 충청남도: '충남', 울산광역시: '울산', 경상북도: '경북' };
function gq(n, sd) {
  n = n.replace(/\s*전역$/, '');
  return /^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남광주|전남|경북|경남|제주)/.test(n)
    ? n
    : (SH[sd] ? SH[sd] + ' ' : '') + n;
}
function uniqF(a) {
  var m = {};
  return a.filter(function (f) {
    return m[f[0]] ? 0 : (m[f[0]] = 1);
  });
}
/* 미연계지역: 지방정부 재난 예경보 통합플랫폼이 DAMS와 연계되지 않은 시군구(샘플) — 지도에 회색 빗금 */
var NC_RG = [
    '충남 당진시',
    '충남 홍성군',
    '충남 예산군',
    '경북 영천시',
    '경북 청송군',
    '경북 영양군',
    '경북 영덕군',
    '경북 예천군',
    '경남 양산시'
  ],
  NC = null;
function ncF() {
  return S.ly.nc
    ? NC ||
        (NC = uniqF(
          [].concat.apply(
            [],
            NC_RG.map(function (n) {
              return GeoMap.find(n);
            })
          )
        ))
    : [];
}
/* 연계지역: 계정관리 등록 9개 기관 관할(군위군은 2013 경계상 경북) — 파란 테두리 */
var LK_RG = [
    '전남 구례군',
    '전남 보성군',
    '전남 함평군',
    '울산',
    '경기 안성시',
    '강원 철원군',
    '충북 청주시',
    '충남 공주시',
    '경북 군위군'
  ],
  LK = null;
function lkAll() {
  return (
    LK ||
    (LK = uniqF(
      [].concat.apply(
        [],
        LK_RG.map(function (n) {
          return GeoMap.find(n);
        })
      )
    ))
  );
}
function lkF() {
  return S.ly.lk ? lkAll() : [];
}
/* 미발령지역 = 재난발생지역 ∩ 연계지역 중 매칭 발령이 나가지 않은 읍면동(전국 재난은 시군구) — 점무늬 */
function unF(ev, hl) {
  if (!ev || !S.ly.un) return [];
  var m = hl.map(function (f) {
      return f[0];
    }),
    hit = function (c) {
      return m.some(function (x) {
        return c.indexOf(x) === 0 || x.indexOf(c) === 0;
      });
    };
  var units = ev.nat
    ? KRGEO.sgg
    : [].concat.apply(
        [],
        ev.fs.map(function (f) {
          return f[0].length <= 5
            ? KRGEO[f[0].length === 2 ? 'sgg' : 'emd'].filter(function (e) {
                return e[0].indexOf(f[0]) === 0;
              })
            : [f];
        })
      );
  var lk = lkAll().map(function (f) {
      return f[0];
    }),
    inLk = function (c) {
      return lk.some(function (x) {
        return c.indexOf(x) === 0 || x.indexOf(c) === 0;
      });
    };
  return units.filter(function (u) {
    return inLk(u[0]) && !hit(u[0]);
  });
}
function feats(rg, sd) {
  return uniqF(
    [].concat.apply(
      [],
      rg.map(function (n) {
        return GeoMap.find(gq(n, sd));
      })
    )
  );
}
/* 발령지역 안 단말기 기준점: 읍면동 중심(시군구 단위 발령이면 그 안의 읍면동) */
function anchors(fs) {
  return [].concat
    .apply(
      [],
      fs.map(function (f) {
        return f[0].length > 5
          ? [f]
          : KRGEO.emd.filter(function (e) {
              return e[0].indexOf(f[0]) === 0;
            });
      })
    )
    .map(GeoMap.centroid);
}
/* 기본도: fs(강조 지역) 없으면 전국 */
/* keep=밝게 둘 지역(재난발생지역, 없으면 발령지역), hl=노란 강조(선택한 발령의 발령지역) */
/* focus=지도 범위를 맞출 지역(재난 선택 중이면 재난발생지역 고정 → 발령을 골라도 화면 이동 없음) */
function base(keep, hl, focus, hl2, un, evb) {
  hl = hl || [];
  hl2 = hl2 || [];
  un = un || [];
  var all = uniqF(keep.concat(hl, hl2)),
    fz = focus && focus.length ? focus : hl.length ? hl : all,
    key = fz
      .map(function (f) {
        return f[0];
      })
      .join(','),
    r = MAP.getBoundingClientRect(),
    w = r.width,
    h = r.height,
    nat = !all.length;
  var P = GeoMap.proj(
      GeoMap.fit(
        nat
          ? [124.6, 33.05, 131, 38.7]
          : (function (b) {
              var d = (b[2] - b[0]) * 0.5;
              return [b[0], b[1], b[2] + d, b[3]];
            })(GeoMap.bbox(fz)),
        w,
        h,
        nat ? 0.02 : 0.16
      )
    ),
    sd = uniqF(
      all.map(function (f) {
        return [f[0].slice(0, 2)];
      })
    ).map(function (x) {
      return x[0];
    });
  var wide =
    !nat &&
    keep.length > 5 &&
    keep.every(function (f) {
      return f[0].length === 2;
    }); /* 전국 단위 재난: 읍면동 경계·라벨 생략, 시도 라벨만 */
  ST.innerHTML =
    GeoMap.svg(
      P,
      nat
        ? { emd: false, nc: ncF(), lk: lkF() }
        : { hl: hl, hl2: hl2, keep: keep, emdIn: sd, emd: !wide, nc: ncF(), un: un, lk: lkF(), evb: evb }
    ) +
    '<div class="gm-ly-lbl">' +
    (nat
      ? GeoMap.labels(P, 'sido') + GeoMap.labels(P, 'sgg')
      : wide
        ? GeoMap.labels(P, 'sido')
        : GeoMap.autoLabels(P, all)) +
    '</div><div class="gm-ly-sym" id="lySym"></div>';
  MAP.classList.toggle('nat', nat);
  var same = !nat && CUR.key === key && CUR.w === w && CUR.h === h;
  CUR = { P: P, w: w, h: h, nat: nat, emd: !nat, key: key };
  if (!same) MAPI.reset();
  return P;
}
/* 전국 보기에서 확대(zl≥2)하면 읍면동 경계를 한 번만 추가 */
new MutationObserver(function () {
  if (CUR.nat && !CUR.emd && +MAP.dataset.zl > 1) {
    CUR.emd = true;
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'gm-emd');
    p.setAttribute('d', GeoMap.path(KRGEO.emd, CUR.P));
    var g = ST.querySelector('.gm-sgg');
    g.parentNode.insertBefore(p, g);
  }
}).observe(MAP, { attributes: true, attributeFilter: ['data-zl'] });
function px(c) {
  var q = CUR.P(c);
  return [(q[0] * CUR.w) / 100, (q[1] * CUR.h) / 100];
}
function ll(p) {
  var B = CUR.P.B;
  return [B.x0 + (p[0] / CUR.w) * (B.x1 - B.x0), B.y1 - (p[1] / CUR.h) * (B.y1 - B.y0)];
}
/* 재난 심볼(전국 보기): 화면상 28px 안에 겹치면 빨간 클러스터 */
function sym1(x, kind) {
  var P = CUR.P;
  if (kind === 'ev')
    return (
      '<button type="button" class="gm-sym hz ev' +
      (S.ev === x.id ? ' on' : '') +
      '" style="' +
      GeoMap.at(P, x.pos) +
      '" data-ev="' +
      x.id +
      '" title="' +
      x.tit +
      '">' +
      hzi(x.lv, x.ic, 'l', x.nm) +
      '<em>[' +
      x.rg[0].replace(/^\S+\s/, '') +
      '] ' +
      x.nm +
      '</em></button>'
    );
  return (
    '<button type="button" class="gm-sym hz is' +
    (S.is === x.id ? ' on' : '') +
    '" style="' +
    GeoMap.at(CUR.P, x.pos) +
    '" data-iss="' +
    x.id +
    '" title="' +
    x.tit +
    '">' +
    hzi(x.lv, x.ic, '', x.tit) +
    '</button>'
  );
}
function hzSyms(list, kind) {
  var g = [];
  list = [].concat.apply(
    [],
    list.map(function (x) {
      return x.parts || [x];
    })
  );
  /* 전국 재난의 시도별 심볼(piece)은 묶지 않고 시도마다 표시 */
  list.forEach(function (x) {
    var p = px(x.pos);
    if (
      x.piece === 2 &&
      g.some(function (c) {
        return c.a[0].id === x.id && Math.hypot(c.p[0] - p[0], c.p[1] - p[1]) < 28;
      })
    )
      return;
    var c = x.piece
      ? null
      : g.filter(function (c) {
          return !c.pc && Math.hypot(c.p[0] - p[0], c.p[1] - p[1]) < 28;
        })[0];
    c ? c.a.push(x) : g.push({ p: p, a: [x], pc: x.piece });
  });
  return g
    .map(function (c) {
      var a = c.a;
      return a.length > 1
        ? GeoMap.cluster(
            CUR.P,
            a[0].pos[0],
            a[0].pos[1],
            a.length,
            'data-cl="' +
              kind +
              ':' +
              a
                .map(function (x) {
                  return x.id;
                })
                .join(',') +
              '"'
          )
        : sym1(a[0], kind);
    })
    .join('');
}
/* 단말기: 매체별 실패·미수신 우선 3대는 개별 심볼, 나머지는 도넛 클러스터 */
function devList(i) {
  var a = [],
    rest = [0, 0, 0];
  i.md.forEach(function (m) {
    if (S.media[m[0]] === false) return;
    var r = [],
      x;
    for (x = 0; x < m[3]; x++) r.push('f');
    for (x = 0; x < m[4]; x++) r.push('n');
    for (x = 0; x < m[2]; x++) r.push('s');
    r.forEach(function (v, j) {
      if (j < 3 || r.length < 5) a.push({ md: m[0], r: v });
      else rest[v === 's' ? 0 : v === 'f' ? 1 : 2]++;
    });
  });
  return { a: a, rest: rest };
}
/* 겹치지 않게 나선형으로 자리 찾기 — 심볼 테두리까지 1순위 발령지역 안, 2순위 내륙(바다에 걸치지 않게), 3순위 중심만 내륙, 없으면 겹침만 피함 */
function place(items) {
  var done = [];
  items.forEach(function (it) {
    var p = it.p,
      t,
      c,
      k,
      free = function (c) {
        return done.every(function (d) {
          return Math.hypot(d.q[0] - c[0], d.q[1] - c[1]) >= d.r + it.r;
        });
      },
      pts = function (c, m) {
        return [
          [0, 0],
          [m, 0],
          [-m, 0],
          [0, m],
          [0, -m],
          [m * 0.7, m * 0.7],
          [-m * 0.7, m * 0.7],
          [m * 0.7, -m * 0.7],
          [-m * 0.7, -m * 0.7]
        ].map(function (d) {
          return ll([c[0] + d[0], c[1] + d[1]]);
        });
      },
      inFs = function (c, m) {
        return (
          it.fs &&
          pts(c, m).every(function (g) {
            return it.fs.some(function (f) {
              return GeoMap.inFeat(f, g[0], g[1]);
            });
          })
        );
      },
      land = function (c, m) {
        return pts(c, m).every(function (g) {
          return GeoMap.onLand(g[0], g[1]);
        });
      },
      m = it.r - 2,
      tests = [
        function (c) {
          return inFs(c, m);
        },
        function (c) {
          return land(c, m);
        },
        function (c) {
          return land(c, 0);
        },
        function () {
          return true;
        }
      ];
    for (k = 0; k < tests.length; k++) {
      for (t = 0; t < 600; t++) {
        var an = t * 2.39996,
          rd = 6 * Math.sqrt(t);
        c = [p[0] + Math.cos(an) * rd, p[1] + Math.sin(an) * rd];
        if (free(c) && tests[k](c)) break;
      }
      if (t < 600) break;
    }
    it.q = c;
    done.push(it);
  });
}
function devView(ids) {
  var it = [],
    P = CUR.P,
    B = P.B,
    mpp = ((B.x1 - B.x0) * 111320 * Math.cos((((B.y0 + B.y1) / 2) * Math.PI) / 180)) / CUR.w;
  S.dv = [];
  ids.forEach(function (id) {
    var i = IS[id],
      d = devList(i),
      n = d.rest[0] + d.rest[1] + d.rest[2];
    d.a.forEach(function (v, k) {
      v.iss = id;
      v.nm = i.pl[k % i.pl.length] + ' ' + MD[v.md][2];
      v.k = S.dv.length;
      S.dv.push(v);
      var q = px(i.anc[k % i.anc.length]);
      it.push({ v: v, fs: i.fs, p: [q[0], q[1] + 20], r: 15 });
    });
    if (n) it.push({ don: d.rest, n: n, iss: id, fs: i.fs, p: px(GeoMap.centroid(i.fs[0])), r: n < 20 ? 23 : 29 });
  });
  place(
    it
      .filter(function (x) {
        return x.v;
      })
      .concat(
        it.filter(function (x) {
          return x.don;
        })
      )
  );
  var rg = '',
    h = '';
  it.forEach(function (x) {
    var c = ll(x.q);
    if (x.don) {
      h += GeoMap.donut(P, c[0], c[1], x.n, x.don[0], x.don[1], 'data-dcl="' + x.iss + '"');
      return;
    }
    var v = x.v,
      m = MD[v.md];
    if (S.rng && m[3]) {
      var d = ((2 * m[3]) / mpp).toFixed(1);
      rg += '<span class="gm-rng" style="' + GeoMap.at(P, c) + ';width:' + d + 'px;height:' + d + 'px"></span>';
    }
    h += GeoMap.dev(
      P,
      c[0],
      c[1],
      v.md,
      { s: 'ok', f: 'ng', n: 'off' }[v.r],
      'data-dev="' + v.k + '" title="' + v.nm + ' (' + RS[v.r][0] + ')"',
      S.dsel === v.k
    );
  });
  return rg + h;
}
/* 범례 레이어 토글(가청범위처럼 on/off): 연계지역 테두리·미연계지역·미발령지역(재난 선택 시) */
function LYI(k, cl, t) {
  return (
    '<li class="ly"><label><input type="checkbox" data-ly="' +
    k +
    '"' +
    (S.ly[k] ? ' checked' : '') +
    '><i class="lg-a ' +
    cl +
    '"></i>' +
    t +
    '</label></li>'
  );
}
var NCL = '';
function lyList() {
  return (
    LYI('lk', 'lk', '연계지역') +
    LYI('nc', 'nc', '미연계지역') +
    (S.tab === 'occur' && S.ev ? LYI('un', 'un', '미발령지역') : '')
  );
}
function legend(kind, area, only) {
  var sel = S.is || (S.tab === 'occur' && S.ev),
    ex = sel
      ? '<ul class="ar">' +
        (area ? '<li><i class="lg-a"></i>' + area + '</li>' : '') +
        (S.tab === 'occur' && S.ev ? '<li><i class="lg-a lt"></i>매칭 발령지역</li>' : '') +
        (S.tab === 'occur' && S.ev
          ? '<li><i class="lg-a ev"></i>재난발생지역</li>'
          : '<li><i class="lg-a dim"></i>발령지역 외</li>') +
        lyList() +
        '</ul>'
      : '<ul class="ar">' + lyList() + '</ul>';
  var h =
    kind === 'hz'
      ? GeoMap.legendHazard((sel ? '<li><i class="lg-a ev"></i>재난발생지역</li>' : '') + lyList())
      : GeoMap.legendDevice(S.media, S.rng, { off: '미수신', only: only, extra: ex, open: S.lg.dv });
  $('gmLgd').innerHTML = h;
  var d = $('gmLgd').firstChild;
  d.dataset.k = kind;
  if (kind === 'hz') d.open = S.lg.hz;
}
function mediaOf(ids) {
  var m = {};
  ids.forEach(function (id) {
    IS[id].md.forEach(function (x) {
      m[x[0]] = 1;
    });
  });
  return Object.keys(m);
}
/* 지도 그리기. symOnly=true면 기본도·확대 상태 유지하고 심볼만 다시 그림 */
function render(symOnly) {
  var h = '',
    lb,
    ids = null,
    keep = [],
    hl = [],
    hl2 = [],
    ev = S.tab === 'occur' && S.ev ? EVM[S.ev] : null;
  hideTip();
  /* 재난 선택: 발생지역 밖 dim / 발령까지 선택: + 발령지역 노랑. 지방정부발령 탭에서 발령만 선택: 발령지역 밖 dim + 노랑 */
  if (S.is) {
    ids = [S.is];
    hl = IS[S.is].fs;
    keep = ev ? ev.fs : hl;
    lb = org(IS[S.is]) + ' · ' + IS[S.is].tit;
  } else if (ev) {
    ids = S.mList;
    keep = ev.fs;
    lb = ev.nm + ' · 재난발생지역 · ' + (ids.length ? '매칭 발령 ' + ids.length + '건 단말기' : '매칭 발령 없음');
  }
  /* 재난 선택 시 매칭 발령지역 전체 연한 노랑(선택 발령은 진한 노랑) */
  if (ev)
    hl2 = uniqF(
      [].concat.apply(
        [],
        S.mList
          .filter(function (k) {
            return k !== S.is;
          })
          .map(function (k) {
            return IS[k].fs;
          })
      )
    );
  if (!symOnly || !CUR.P) base(keep, hl, ev ? ev.fs : null, hl2, unF(ev, hl.concat(hl2)), ev && !ev.nat ? ev.fs : null);
  if (!ids) {
    h =
      S.tab === 'occur'
        ? hzSyms(S.evList, 'ev')
        : hzSyms(
            S.lList.map(function (k) {
              return IS[k];
            }),
            'is'
          );
    legend('hz');
    lb = '전국';
  } else if (ids.length) {
    h = devView(ids);
    legend('dv', hl.length ? '발령지역' : '', mediaOf(ids));
  } else legend('hz', '');
  if (ev && ev.epi)
    h +=
      '<span class="gm-epi" style="' +
      GeoMap.at(CUR.P, ev.epi) +
      '" title="진앙 ' +
      ev.epi[1] +
      'N, ' +
      ev.epi[0] +
      'E">' +
      hzi(ev.lv, ev.ic, 'l', ev.nm) +
      '<em>진앙</em></span>';
  $('lySym').innerHTML = h;
  $('mapLbl').textContent = '배경지도: ' + MODE_NM[S.mode - 1] + ' · ' + lb;
}
function mapMode(n) {
  S.mode = n;
  MAP.classList.remove('m1', 'm2', 'm3');
  MAP.classList.add('m' + n);
  $('gmMode').innerHTML = GeoMap.modeBtns(n, 'mapMode');
  $('mapLbl').textContent = $('mapLbl').textContent.replace(/배경지도: \S+/, '배경지도: ' + MODE_NM[n - 1]);
  msg('배경지도를 ' + ['기본(행정경계)', '2D(VWorld)', '위성(VWorld)'][n - 1] + '으로 전환했습니다.');
}
function resetView() {
  S.ev = null;
  S.is = null;
  $('asideDetail').hidden = true;
  GIS.classList.remove('dtl-on');
  drawLists();
  render();
  msg('전국 범위로 지도를 초기화했습니다.');
}

/* ---------- 툴팁 ---------- */
function tipBox(t, b) {
  return (
    '<div class="th"><b title="' +
    t +
    '">' +
    t +
    '</b><button type="button" data-x title="닫기"><i class="ri-close-line"></i></button></div><div class="tb">' +
    b +
    '</div>'
  );
}
function tip(el, html, pin) {
  var t = $('gisTip'),
    mb = $('gisMap').getBoundingClientRect(),
    r = el.getBoundingClientRect();
  t.innerHTML = html;
  t.hidden = false;
  t.dataset.pin = pin ? '1' : '';
  var x = r.right - mb.left + 8;
  if (x + 280 > mb.width) x = r.left - mb.left - 278;
  t.style.left = Math.max(8, x) + 'px';
  t.style.top = Math.max(8, Math.min(r.top - mb.top - 8, mb.height - t.offsetHeight - 8)) + 'px';
}
function hideTip() {
  $('gisTip').hidden = true;
}
function isTip(i) {
  var t = tot(i);
  return tipBox(
    org(i),
    '<dl><dt>발령제목</dt><dd>' +
      i.tit +
      '</dd><dt>발령시각</dt><dd>' +
      i.tm +
      '</dd><dt>발령지역</dt><dd>' +
      i.rg.join(', ') +
      '</dd><dt>전송결과</dt><dd>전체 ' +
      t[0] +
      ' · <span class="c-sc">성공 ' +
      t[1] +
      '</span> · <span class="c-dg">실패 ' +
      t[2] +
      '</span> · 미수신 ' +
      t[3] +
      '</dd></dl>'
  );
}
function sumBox(a) {
  return (
    '<div class="gis-sum"><div>전체<b>' +
    a[0] +
    '</b></div><div class="c-sc">성공<b class="c-sc">' +
    a[1] +
    '</b></div><div class="c-dg">실패<b class="c-dg">' +
    a[2] +
    '</b></div><div>미수신<b>' +
    a[3] +
    '</b></div></div>'
  );
}

/* ---------- 동작 ---------- */
function selectGroup(id) {
  S.ev = id;
  S.is = null;
  $('asideDetail').hidden = false;
  GIS.classList.add('dtl-on');
  var e = EVM[id];
  $('dtlCtx').innerHTML = '선택한 재난발생정보<b>' + e.c.join(' &gt; ') + ' · ' + e.tit + '</b>';
  $('fMatch').reset();
  $('selGisPlatform2').innerHTML = '<option value="">시군구 전체</option>';
  applyDetailFilter();
  drawOccur();
  render();
  msg('[' + e.nm + '] 재난과 매칭되는 재난발령 ' + S.mList.length + '건을 조회하였습니다.');
}
function selectIssue(id) {
  S.is = S.is === id ? null : id;
  S.dsel = null;
  drawLists();
  render();
  if (S.is) {
    var c = document.querySelector(
      '.gis-pnl:not([hidden]) [data-iss="' + id + '"],#gisResultList [data-iss="' + id + '"]'
    );
    c && c.scrollIntoView({ block: 'nearest' });
    var t = tot(IS[id]);
    msg(
      '발령 단말기 ' + t[0] + '대를 지도에 표출했습니다. (성공 ' + t[1] + ' · 실패 ' + t[2] + ' · 미수신 ' + t[3] + ')'
    );
  } else msg('발령 선택을 해제했습니다.');
}
/* 모바일: 매칭 재난발령만 보이는 상태에서 재난발생현황 목록으로 돌아가기(선택·지도 유지) */
function backList() {
  GIS.classList.remove('dtl-on');
  var c = document.querySelector('#gisDisasterList .on');
  c && c.scrollIntoView({ block: 'nearest' });
  msg('재난발생현황 목록으로 돌아왔습니다.');
}
function closeDetail() {
  S.ev = null;
  S.is = null;
  $('asideDetail').hidden = true;
  GIS.classList.remove('dtl-on');
  drawLists();
  render();
  msg('상세 패널을 닫았습니다.');
}
function inRange(tm, fr, to) {
  var d = tm.slice(0, 10);
  return (!fr || d >= fr) && (!to || d <= to);
}
function badRange(a, b) {
  if ($(a).value && $(b).value && $(a).value > $(b).value) {
    alertMsg('기간 시작일이 종료일보다 늦습니다.', { ico: 'wn', focus: '#' + a });
    return true;
  }
}
function loadEvents() {
  if (badRange('dtGisFr', 'dtGisTo')) return;
  var l = $('selGisLclsf').value,
    c = $('selGisCategory').value,
    kw = $('keywordGis').value.trim(),
    fr = $('dtGisFr').value,
    to = $('dtGisTo').value;
  S.evList = EV.filter(function (e) {
    return (
      (!l || e.c[0] === l) &&
      (!c || e.c[1] === c) &&
      inRange(e.tm, fr, to) &&
      (!kw || (e.tit + e.nm + e.rg.join(' ')).indexOf(kw) > -1)
    );
  });
  if (
    S.ev &&
    !S.evList.some(function (e) {
      return e.id === S.ev;
    })
  ) {
    S.ev = null;
    S.is = null;
    $('asideDetail').hidden = true;
    GIS.classList.remove('dtl-on');
  }
  drawOccur();
  render();
  msg('재난발생정보 ' + S.evList.length + '건을 조회하였습니다.');
}
function applyDetailFilter(m) {
  var sd = $('selGisPlatform').value,
    sg = $('selGisPlatform2').value,
    kw = $('keywordGisArea').value.trim();
  S.mList = EVM[S.ev].iss.filter(function (k) {
    var i = IS[k];
    return (!sd || i.sido === sd) && (!sg || i.sgg === sg) && (!kw || (i.sys + i.rg.join(' ')).indexOf(kw) > -1);
  });
  if (S.is && S.mList.indexOf(S.is) < 0) S.is = null;
  drawMatch();
  if (m) {
    render();
    msg('매칭 재난발령 ' + S.mList.length + '건으로 필터링하였습니다.');
  }
}
function loadLocalIssues() {
  if (badRange('dtLocalFr', 'dtLocalTo')) return;
  var sd = $('selLocalSido').value,
    sg = $('selLocalSgg').value,
    kw = $('keywordLocal').value.trim(),
    fr = $('dtLocalFr').value,
    to = $('dtLocalTo').value;
  S.lList = LOCAL.filter(function (k) {
    var i = IS[k];
    return (
      (!sd || i.sido === sd) &&
      (!sg || i.sgg === sg) &&
      inRange(i.tm, fr, to) &&
      (!kw || (i.sys + i.tit + i.rg.join(' ')).indexOf(kw) > -1)
    );
  });
  if (S.is && S.lList.indexOf(S.is) < 0) S.is = null;
  drawLocal();
  render();
  msg('지방정부 예·경보 발령 ' + S.lList.length + '건을 조회하였습니다.');
}
function fillCategory() {
  var a = CAT[$('selGisLclsf').value] || [];
  $('selGisCategory').innerHTML =
    '<option value="">중분류 전체</option>' +
    a
      .map(function (x) {
        return '<option>' + x + '</option>';
      })
      .join('');
}
function fillSigungu(s, t) {
  var a = SGG[s.value] || [];
  $(t).innerHTML =
    '<option value="">시군구 전체</option>' +
    a
      .map(function (x) {
        return '<option>' + x + '</option>';
      })
      .join('');
}
function toggleFlt(b) {
  var f = b.closest('.gis-flt'),
    off = f.classList.toggle('off');
  b.lastElementChild.className = off ? 'ri-add-line' : 'ri-subtract-line';
}
window.onTab = function (id) {
  S.tab = id === 'pnlOccur' ? 'occur' : 'local';
  S.ev = null;
  S.is = null;
  $('asideDetail').hidden = true;
  GIS.classList.remove('dtl-on');
  drawLists();
  render();
  msg(
    S.tab === 'occur' ? '재난발생현황 목록으로 전환했습니다.' : '지방정부 예·경보 발령 목록(최근 1년)으로 전환했습니다.'
  );
};

/* 목록 클릭 */
document.querySelector('.gis').addEventListener('click', function (e) {
  var t = e.target,
    c;
  if ((c = t.closest('[data-more]'))) {
    e.stopPropagation();
    c.outerHTML = c.dataset.more
      .split('|')
      .map(function (x) {
        return '<span>' + x + '</span>';
      })
      .join('');
    return;
  }
  if (t.closest('#gisMap') || t.closest('.gc-d')) return;
  if ((c = t.closest('[data-ev]'))) selectGroup(c.dataset.ev);
  else if ((c = t.closest('[data-iss]'))) selectIssue(c.dataset.iss);
});
/* 지도 클릭·오버 */
MAP.addEventListener('click', function (e) {
  var t = e.target,
    c;
  if (t.closest('[data-x]')) {
    hideTip();
    return;
  }
  if ((c = t.closest('[data-cl]'))) {
    var p = c.dataset.cl.split(':'),
      ids = p[1].split(','),
      ev = p[0] === 'ev';
    tip(
      c,
      tipBox(
        '겹친 ' + (ev ? '재난발생정보' : '재난발령정보') + ' ' + ids.length + '건',
        '<ul class="tl">' +
          ids
            .map(function (k) {
              var x = ev ? EVM[k] : IS[k];
              return (
                '<li class="clk" data-' +
                (ev ? 'ev' : 'iss') +
                '="' +
                k +
                '">' +
                hzi(x.lv, x.ic, 's') +
                '<span title="' +
                x.tit +
                '">' +
                x.tit +
                '</span><em>' +
                x.tm.slice(5, 16) +
                '</em></li>'
              );
            })
            .join('') +
          '</ul>'
      ),
      1
    );
    return;
  }
  if ((c = t.closest('[data-ev]'))) {
    selectGroup(c.dataset.ev);
    return;
  }
  if ((c = t.closest('[data-iss]'))) {
    selectIssue(c.dataset.iss);
    return;
  }
  if ((c = t.closest('[data-dev]'))) {
    var v = S.dv[+c.dataset.dev],
      i = IS[v.iss],
      m = MD[v.md];
    S.dsel = v.k;
    MAP.querySelectorAll('.dev-sym').forEach(function (b) {
      b.classList.toggle('on', b === c);
    });
    tip(
      c,
      tipBox(
        v.nm,
        '<dl><dt>매체구분</dt><dd>' +
          m[0] +
          '</dd><dt>예경보 서버</dt><dd>' +
          i.sys +
          '</dd><dt>단말기주소</dt><dd>' +
          i.rg[0] +
          ' ' +
          v.nm.split(' ')[0] +
          ' 일원</dd><dt>발령결과</dt><dd><span class="badge ' +
          RS[v.r][1] +
          '">' +
          RS[v.r][0] +
          '</span> ' +
          (v.r === 's'
            ? i.tm.slice(11)
            : v.r === 'f'
              ? '<span class="c-dg">(실패: ' +
                FR[
                  [].reduce.call(
                    String(v.k) + v.nm,
                    function (h, ch) {
                      return h + ch.charCodeAt(0);
                    },
                    0
                  ) % FR.length
                ] +
                ')</span>'
              : '') +
          '</dd><dt>메모</dt><dd>' +
          (v.r === 'f'
            ? '재전송 1회 실패 · 담당자 확인 필요'
            : v.r === 'n'
              ? '수신 응답 없음 · 전원/통신 점검 필요'
              : '-') +
          '</dd><dt>가청범위</dt><dd>' +
          (m[3] ? m[3].toLocaleString() + 'm' : '-') +
          '</dd></dl>'
      ),
      1
    );
    return;
  }
  if ((c = t.closest('[data-dcl]'))) {
    var r = devList(IS[c.dataset.dcl]).rest,
      n = r[0] + r[1] + r[2];
    tip(
      c,
      tipBox(
        '단말기 클러스터 · ' + IS[c.dataset.dcl].sys,
        '<p style="margin-bottom:6px">겹친 단말기 ' + n + '대의 발령결과 요약</p>' + sumBox([n, r[0], r[1], r[2]])
      ),
      1
    );
    return;
  }
  if (!t.closest('.gm-tip,.gm-lgd')) hideTip();
});
MAP.addEventListener('mouseover', function (e) {
  var c = e.target.closest('.gm-sym.is');
  if (!c || ($('gisTip').dataset.pin === '1' && !$('gisTip').hidden)) return;
  tip(c, isTip(IS[c.dataset.iss]), 0);
});
MAP.addEventListener('mouseout', function (e) {
  var c = e.target.closest('.gm-sym.is');
  if (c && $('gisTip').dataset.pin !== '1') hideTip();
});
MAP.addEventListener('wheel', hideTip, { passive: true });
MAP.addEventListener('change', function (e) {
  var t = e.target;
  if (t.dataset.ly) {
    S.ly[t.dataset.ly] = t.checked;
    var k = CUR.key;
    render();
    msg(
      { lk: '연계지역', nc: '미연계지역', un: '미발령지역' }[t.dataset.ly] +
        ' 레이어를 ' +
        (t.checked ? '켰습니다.' : '껐습니다.')
    );
    return;
  }
  if (t.dataset.md) {
    S.media[t.dataset.md] = t.checked;
    render(true);
    msg(MD[t.dataset.md][0] + ' 단말기 표출을 ' + (t.checked ? '켰습니다.' : '껐습니다.'));
  } else if (t.hasAttribute('data-rng')) {
    S.rng = t.checked;
    render(true);
    msg('단말기 가청범위 표출을 ' + (t.checked ? '켰습니다.' : '껐습니다.'));
  }
});
MAP.addEventListener(
  'toggle',
  function (e) {
    var d = e.target;
    if (d.classList && d.classList.contains('gm-lgd')) S.lg[d.dataset.k] = d.open;
  },
  true
);
var RSZ;
window.addEventListener('resize', function () {
  clearTimeout(RSZ);
  RSZ = setTimeout(function () {
    render();
  }, 150);
});

/* 최초 로드 (loadMeta/loadEvents): 지역명 → 행정경계 피처, 심볼 위치는 발령·발생지역 중심으로 보정 */
(function init() {
  /* 전국 단위 재난(nat): 발생지역 = 16개 시도 전체, 지도 심볼은 시도마다 하나씩(parts) */
  var SDC = ['11', '36', '21', '22', '23', '25', '26', '29', '31', '32', '33', '34', '35', '37', '38', '39'],
    SDN = {
      11: '서울',
      21: '부산',
      22: '대구',
      23: '인천',
      25: '대전',
      26: '울산',
      29: '세종',
      31: '경기',
      32: '강원',
      33: '충북',
      34: '충남',
      35: '전북',
      36: '전남광주',
      37: '경북',
      38: '경남',
      39: '제주'
    };
  EV.forEach(function (e) {
    if (e.nat) {
      e.fs = uniqF(
        [].concat.apply(
          [],
          SDC.map(function (c) {
            return GeoMap.find(c);
          })
        )
      );
      e.parts = e.fs.map(function (f) {
        var o = Object.create(e);
        o.pos = f[0] === '29' ? [127.27, 36.56] : GeoMap.centroid(f);
        o.rg = [SDN[f[0]] || f[1]];
        o.piece = 1;
        return o;
      });
      return;
    }
    /* 심볼 위치 규칙: 위·경도가 있는 재난(지진 진앙 epi)은 그 지점 1개, 그 밖은 발생지역마다 1개 */
    e.fs = feats(e.rg);
    if (e.epi) {
      e.pos = e.epi;
      return;
    }
    if (e.fs.length) e.pos = GeoMap.centroid(e.fs[0]);
    if (e.rg.length > 1)
      e.parts = e.rg.map(function (r) {
        var f = feats([r]),
          o = Object.create(e);
        o.pos = f.length ? GeoMap.centroid(f[0]) : e.pos;
        o.rg = [r];
        o.piece = 2;
        return o;
      });
  });
  Object.keys(IS).forEach(function (k) {
    var i = IS[k];
    i.fs = feats(i.rg, i.sido);
    i.anc = anchors(i.fs);
    if (i.fs.length) i.pos = GeoMap.centroid(i.fs[0]);
  });
  $('gmMode').innerHTML = GeoMap.modeBtns(1, 'mapMode');
  fillCategory();
  drawLists();
  render();
})();
