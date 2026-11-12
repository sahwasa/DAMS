/* 재난발령통계 | 재난 예경보 통합관리시스템 */
function changePeriodType(v) {
  var m = {
    year: ['selYear'],
    month: ['selYear', 'selMonth'],
    quarter: ['selYear', 'selQuarter'],
    custom: ['periodRange']
  }[v];
  ['selYear', 'selMonth', 'selQuarter', 'periodRange'].forEach(function (id) {
    document.getElementById(id).hidden = m.indexOf(id) < 0;
  });
}
/* 지역별 발령 빈도 지도: 표(regionStatTbody)의 시도별 발령 건수를 버블/단계구분도/히트맵으로 */
var SD = {
  서울특별시: '11',
  부산광역시: '21',
  대구광역시: '22',
  인천광역시: '23',
  광주광역시: '24',
  전남광주통합특별시: '36',
  대전광역시: '25',
  울산광역시: '26',
  세종특별자치시: '29',
  경기도: '31',
  강원특별자치도: '32',
  충청북도: '33',
  충청남도: '34',
  전라북도: '35',
  전남광주통합특별시: '36',
  경상북도: '37',
  경상남도: '38',
  제주특별자치도: '39'
};
var RMODE = '버블',
  RMAP = null,
  NUDGE = { 25: [0.32, -0.1] }; /* 대전은 충남과 겹쳐 오른쪽 아래로 */
/* 지역 레벨: 시도별(원본 표) / 시군구별(시도 값을 연계 시군구로 나눠 생성 — 합계 동일) */
var UNIT = 'sido',
  ORIG = {},
  SPLIT = {
    전남광주통합특별시: ['전남광주', ['구례군', '보성군', '함평군']],
    대전광역시: ['대전', ['중구', '서구', '유성구']],
    울산광역시: ['울산', ['중구', '동구', '울주군']],
    경기도: ['경기', ['수원시', '부천시', '안성시']],
    강원특별자치도: ['강원', ['춘천시', '강릉시', '철원군']],
    충청남도: ['충남', ['천안시', '공주시', '아산시']],
    경상북도: ['경북', ['포항시', '경주시', '안동시']]
  },
  W = [0.46, 0.32, 0.22];
function num(t) {
  return +String(t).replace(/[^0-9.]/g, '');
}
function fmt(n) {
  return n.toLocaleString();
}
function split(n, k) {
  var a = W.map(function (w) {
      return Math.floor(n * w);
    }),
    r =
      n -
      a.reduce(function (x, y) {
        return x + y;
      }, 0),
    i = k || 0;
  while (r-- > 0) {
    a[i % 3]++;
    i++;
  }
  return a;
}
function heat(v) {
  return v <= 0 ? 'h0' : v <= 5 ? 'h1' : v <= 10 ? 'h2' : v <= 20 ? 'h3' : 'h4';
}
function grpRow(tr) {
  return tr.outerHTML
    .replace(/^<tr[^>]*>/, '<tr class="grp">')
    .replace(/class="heat h\d"/g, 'class="t-r"')
    .replace(/ title="[^"]*"/g, '');
}
function setUnit(u) {
  UNIT = u;
  var SL = document.getElementById('rgSido');
  SL.hidden = u === 'sido';
  var SEL = u === 'sido' ? '' : SL.value;
  [].forEach.call(document.getElementsByName('regionUnit'), function (r) {
    r.checked = r.value === u;
  });
  var tb = document.getElementById('regionStatTbody'),
    hb = document.querySelector('#regionHeatmap tbody');
  if (!ORIG.tb) {
    ORIG.tb = tb.innerHTML;
    ORIG.hb = hb.innerHTML;
  }
  var sg = u !== 'sido',
    lb = sg ? '시군구' : '시도';
  document.getElementById('unitTh').textContent = lb;
  document.getElementById('unitTh2').textContent = lb;
  document.getElementById('regTit').textContent = lb + '별 발령·전송 결과';
  document.getElementById('heatTit').textContent = lb + ' × 재난유형 발령 건수';
  if (!sg) {
    tb.innerHTML = ORIG.tb;
    hb.innerHTML = ORIG.hb;
  } else {
    var t = document.createElement('tbody'),
      h = document.createElement('tbody');
    t.innerHTML = ORIG.tb;
    h.innerHTML = ORIG.hb;
    var rows = [],
      hrows = [],
      etc = null,
      hetc = null,
      tot,
      htot;
    [].forEach.call(t.rows, function (tr, k) {
      var c = tr.cells,
        nm = c[0].textContent,
        sp = SPLIT[nm];
      if (tr.classList.contains('tot')) {
        tot = SEL ? '' : tr.outerHTML;
        return;
      }
      if (!sp) {
        etc = SEL ? '' : tr.outerHTML.replace('기타 시도', '기타 시군구');
        return;
      }
      if (SEL && nm !== SEL) return;
      rows.push({ h: grpRow(tr) });
      var v = [1, 2, 3, 4].map(function (i) {
        return split(num(c[i].textContent), k);
      });
      sp[1].forEach(function (g, j) {
        var tx = v[1][j],
          ok = v[2][j];
        rows.push({
          n: v[0][j],
          h:
            '<tr class="clk sgc" data-find="' +
            sp[0] +
            ' ' +
            g +
            '" onclick="showRegionDetail(this)"><td class="t-l">' +
            sp[0] +
            ' ' +
            g +
            '</td><td class="t-r">' +
            v[0][j] +
            '</td><td class="t-r">' +
            fmt(tx) +
            '</td><td class="t-r">' +
            fmt(ok) +
            '</td><td class="t-r">' +
            v[3][j] +
            '</td><td class="t-r">' +
            ((ok / tx) * 100).toFixed(1) +
            '%</td></tr>'
        });
      });
    });
    [].forEach.call(h.rows, function (tr, k) {
      var c = tr.cells,
        nm = c[0].textContent,
        sp = SPLIT[nm];
      if (tr.classList.contains('tot')) {
        htot = SEL ? '' : tr.outerHTML;
        return;
      }
      if (!sp) {
        hetc = SEL ? '' : tr.outerHTML.replace('기타 시도', '기타 시군구');
        return;
      }
      if (SEL && nm !== SEL) return;
      hrows.push({ h: grpRow(tr) });
      var cols = [];
      for (var i = 1; i < c.length - 1; i++) cols.push(split(num(c[i].textContent), k + i));
      sp[1].forEach(function (g, j) {
        var sum = 0,
          td = cols
            .map(function (a) {
              sum += a[j];
              return '<td class="heat ' + heat(a[j]) + '">' + a[j] + '</td>';
            })
            .join('');
        hrows.push({
          n: sum,
          h:
            '<tr class="sgc"><td class="t-l">' +
            sp[0] +
            ' ' +
            g +
            '</td>' +
            td +
            '<td class="t-r"><b>' +
            sum +
            '</b></td></tr>'
        });
      });
    });
    /* 시도 묶음 행(시도 값 = 시군구 합계) 다음에 시군구 행 — 직제순(시도 표 순서 → SPLIT 시군구 순서) */
    tb.innerHTML =
      rows
        .map(function (r) {
          return r.h;
        })
        .join('') +
      (etc || '') +
      tot;
    hb.innerHTML =
      hrows
        .map(function (r) {
          return r.h;
        })
        .join('') +
      (hetc || '') +
      htot;
  }
  applyScope(SEL);
  updCond();
  drawRegionMap();
  msg((sg ? '시군구별' + (SEL ? '(' + SEL + ')' : '') : '시도별') + ' 기준으로 통계를 조회하였습니다.');
}
/* 드릴다운 경로(전국 › 시도): 상위 단계 클릭 시 올라감 */
function drillTo(u, sd) {
  var SL = document.getElementById('rgSido');
  if (u === 'sido') SL.value = '';
  if (sd != null) SL.value = sd;
  setUnit(u);
}
/* 지도 클릭: 시도 → 그 시도의 시군구 / 시군구 → 행 강조 */
function drill(nm) {
  if (UNIT === 'sido' && SPLIT[nm]) return drillTo('sgg', nm);
  pickRegion(nm);
}
var SCOPE0 = {},
  SCOPE_F = 1;
/* 매체별 전송 결과 [매체, 전송, 성공, 실패, 미수신] — 매체별 표와 같은 값. MDM: h 가로 막대(성공·실패·미수신 + 성공률) · v 세로 막대(건수) · d 비율(매체별 전송 비중 도넛) */
var MD = [
    ['재해문자전광판', 1420, 1392, 20, 8],
    ['마을방송', 1560, 1505, 38, 17],
    ['자동음성통보', 2240, 2180, 42, 18],
    ['자동우량경보', 460, 440, 14, 6],
    ['버스정보시스템', 2040, 2001, 25, 14]
  ],
  MDM = 'h',
  MPAL = ['#3e55e1', '#2b9bd8', '#00a37a', '#f5930b', '#8e5cd9'];
function mdMode(b, m) {
  b.parentNode.querySelectorAll('button').forEach(function (x) {
    x.className = 'btn s ico ' + (x === b ? 'btn-pri' : 'btn-line');
  });
  MDM = m;
  drawMd();
  msg('매체별 전송 결과를 ' + b.title + '(으)로 표시합니다.');
}
function drawMd() {
  var el = document.getElementById('mediaResultChart');
  var D = MD.map(function (r) {
      var a = r.slice(1).map(function (x) {
        return Math.round(x * SCOPE_F);
      });
      return { n: r[0], tx: a[0], ok: a[1], ng: a[2], na: a[3], rt: a[0] ? ((a[1] / a[0]) * 100).toFixed(1) : '-' };
    }),
    N = D.map(function (d) {
      return d.n;
    }),
    sum = D.reduce(function (s, d) {
      return s + d.tx;
    }, 0),
    H = MDM === 'h';
  if (MDM === 'd')
    return EC(el, {
      tooltip: {
        trigger: 'item',
        formatter: function (p) {
          var d = D[p.dataIndex];
          return (
            p.marker + d.n + '<br>전송 ' + d.tx.toLocaleString() + '건 · ' + p.percent + '%<br>성공률 ' + d.rt + '%'
          );
        }
      },
      title: {
        text: sum.toLocaleString(),
        subtext: '전송 건',
        left: '26%',
        top: '40%',
        textAlign: 'center',
        textStyle: { fontSize: 22, fontWeight: 700, color: STC.tt },
        subtextStyle: { fontSize: 12, color: STC.gray },
        itemGap: 2
      },
      legend: ecLegend({
        orient: 'vertical',
        top: 'middle',
        right: '4%',
        icon: 'circle',
        itemGap: 12,
        formatter: function (n) {
          var d = D.filter(function (x) {
            return x.n === n;
          })[0];
          return n + '  ' + ((d.tx / sum) * 100).toFixed(1) + '%  (성공률 ' + d.rt + '%)';
        }
      }),
      series: [
        {
          type: 'pie',
          radius: ['46%', '76%'],
          center: ['26%', '52%'],
          label: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          data: D.map(function (d, i) {
            return { name: d.n, value: d.tx, itemStyle: { color: STC.pal[i] } };
          })
        }
      ]
    });
  var S = [
    ['성공', 'ok', STC.sc],
    ['실패', 'ng', STC.dg],
    ['미수신', 'na', STC.na]
  ];
  EC(el, {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (ps) {
        var d = D[ps[0].dataIndex];
        return (
          d.n +
          '<br>' +
          ps
            .map(function (p) {
              return p.marker + p.seriesName + ' ' + p.value.toLocaleString();
            })
            .join('<br>') +
          '<br>전송 ' +
          d.tx.toLocaleString() +
          ' · 성공률 ' +
          d.rt +
          '%'
        );
      }
    },
    legend: ecLegend(),
    grid: H ? { left: 100, right: 56, top: 34, bottom: 8 } : { left: 50, right: 8, top: 34, bottom: 26 },
    xAxis: H ? ecVal({ splitLine: { show: false }, axisLabel: { show: false } }) : ecCat(N),
    yAxis: H
      ? ecCat(N, { inverse: true, axisLabel: { color: STC.tt, fontSize: 12, fontWeight: 600, interval: 0 } })
      : ecVal(),
    series: S.map(function (x, i) {
      return {
        name: x[0],
        type: 'bar',
        stack: 't',
        barMaxWidth: H ? 18 : 40,
        itemStyle: { color: x[2] },
        data: D.map(function (d) {
          return d[x[1]];
        }),
        label: {
          show: i === 2,
          position: H ? 'right' : 'top',
          fontSize: 12,
          fontWeight: 600,
          color: STC.tt,
          formatter: function (p) {
            var d = D[p.dataIndex];
            return H ? d.rt + '%' : d.tx.toLocaleString();
          }
        }
      };
    })
  });
}
/* 재난유형별 발령(실제·훈련·시험) — 재난별 표와 같은 값, 표현 방식 EVM: v 세로 막대 · h 가로 막대 · d 비율(도넛, 상위 7 + 기타) */
/* 샘플 데이터 EV·EVM·PAL → stat_event.data.js */
function evMode(b, m) {
  b.parentNode.querySelectorAll('button').forEach(function (x) {
    x.className = 'btn s ico ' + (x === b ? 'btn-pri' : 'btn-line');
  });
  EVM = m;
  drawEvCat();
  msg('재난유형별 발령 현황을 ' + b.title + '(으)로 표시합니다.');
}
function drawEvCat() {
  var el = document.getElementById('evCat');
  var D = EV.map(function (r) {
      var a = r.slice(1).map(function (x) {
        return Math.round(x * SCOPE_F);
      });
      return { n: r[0], a: a, t: a[0] + a[1] + a[2] };
    }),
    N = D.map(function (d) {
      return d.n;
    }),
    sum = D.reduce(function (s, d) {
      return s + d.t;
    }, 0),
    H = EVM === 'h',
    ETC = '건조·안개·감염병·가축질병·폭풍해일·지진해일';
  if (EVM === 'd') {
    var top = D.slice(0, 7),
      rest = D.slice(7),
      G = top.map(function (d, i) {
        return { name: d.n, value: d.t, itemStyle: { color: STC.pal[i] } };
      });
    G.push({
      name: '기타',
      value: rest.reduce(function (s, d) {
        return s + d.t;
      }, 0),
      itemStyle: { color: STC.pal[7] },
      tip: rest
        .map(function (d) {
          return d.n === '기타' ? ETC : d.n;
        })
        .join('·')
    });
    return EC(el, {
      tooltip: {
        trigger: 'item',
        formatter: function (p) {
          return (
            p.marker +
            p.name +
            (p.data.tip ? ' (' + p.data.tip + ')' : '') +
            '<br>' +
            p.value +
            '건 · ' +
            p.percent +
            '%'
          );
        }
      },
      title: {
        text: String(sum),
        subtext: '건',
        left: '26%',
        top: '40%',
        textAlign: 'center',
        textStyle: { fontSize: 24, fontWeight: 700, color: STC.tt },
        subtextStyle: { fontSize: 12, color: STC.gray },
        itemGap: 2
      },
      legend: ecLegend({
        orient: 'vertical',
        top: 'middle',
        right: '4%',
        icon: 'circle',
        itemGap: 10,
        formatter: function (n) {
          var g = G.filter(function (x) {
            return x.name === n;
          })[0];
          return n + '  ' + ((g.value / sum) * 100).toFixed(1) + '%';
        }
      }),
      series: [
        {
          type: 'pie',
          radius: ['46%', '76%'],
          center: ['26%', '52%'],
          avoidLabelOverlap: false,
          label: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          data: G
        }
      ]
    });
  }
  var S = [
      ['실제', STC.pri],
      ['훈련', STC.c2],
      ['시험', STC.c3]
    ],
    GR = ['#9e9e9e', '#bdbdbd', '#d6d6d6'];
  EC(el, {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (ps) {
        var d = D[ps[0].dataIndex];
        return (
          (d.n === '기타' ? '기타(' + ETC + ')' : d.n) +
          '<br>' +
          ps
            .map(function (p) {
              return p.marker + p.seriesName + ' ' + p.value;
            })
            .join('<br>') +
          '<br>계 ' +
          d.t +
          '건'
        );
      }
    },
    legend: ecLegend(),
    grid: H ? { left: 64, right: 40, top: 30, bottom: 8 } : { left: 36, right: 8, top: 34, bottom: 26 },
    xAxis: H
      ? ecVal({ splitLine: { show: false }, axisLabel: { show: false } })
      : ecCat(N, { axisLabel: { color: STC.tx, fontSize: 11, interval: 0 } }),
    yAxis: H
      ? ecCat(N, { inverse: true, axisLabel: { color: STC.tt, fontSize: 12, fontWeight: 600, interval: 0 } })
      : ecVal(),
    series: S.map(function (x, i) {
      return {
        name: x[0],
        type: 'bar',
        stack: 't',
        barMaxWidth: H ? 12 : 30,
        itemStyle: { color: x[1] },
        data: D.map(function (d) {
          return d.n === '기타' ? { value: d.a[i], itemStyle: { color: GR[i] } } : d.a[i];
        }),
        label: {
          show: i === 2,
          position: H ? 'right' : 'top',
          fontSize: 11,
          fontWeight: 600,
          color: STC.tt,
          formatter: function (p) {
            return D[p.dataIndex].t;
          }
        }
      };
    })
  });
}
/* 월별 발령 건수(2026년: 1~11월, 11월은 조회일까지 / 12월 예정 — 합계 326) */
var MON = {
  '2026년': [12, 10, 14, 18, 26, 41, 62, 55, 38, 24, 26, null],
  '2025년': [10, 9, 12, 15, 22, 35, 58, 52, 30, 22, 25, 18],
  '2024년': [8, 11, 10, 14, 20, 30, 49, 47, 28, 19, 17, 15]
};
function days(y, m) {
  return new Date(y, m, 0).getDate();
}
/* 매체별 성공률 추이(꺾은선, 매체마다 1개) — 기간 구분은 재난 발령 추이와 같음(연도·분기·기간 = 월별, 월 = 일별). 목업: 매체 기준 성공률 + 월별 변동(7월 장마철 마을방송·자동우량경보 하락) */
var MDB = [98.0, 96.5, 97.3, 95.7, 98.1],
  MDV = [
    [0.3, 0.2, -0.1, 0.4, 0.1, -0.6, -1.2, -0.4, 0.2, 0.3, 0.1, 0],
    [0.5, 0.4, 0.2, 0.1, -0.3, -1.1, -2.7, -1.6, 0.3, 0.6, 0.7, 0],
    [0.2, 0.3, 0.1, 0, -0.2, -0.5, -0.9, -0.3, 0.2, 0.4, 0.3, 0],
    [0.8, 0.6, 0.4, 0.2, -0.5, -1.8, -3.4, -2.1, 0.1, 0.7, 0.9, 0],
    [0.1, 0.1, 0, 0.2, 0.1, -0.3, -0.6, -0.2, 0.1, 0.2, 0.1, 0]
  ];
function drawMdTrend() {
  var el = document.getElementById('mdTrend');
  if (!el) return;
  var S = evSeries();
  document.getElementById('mdTrTit').textContent = S.tit.replace('재난 발령', '매체별 성공률');
  var day = S.unit === '일',
    f = document.querySelector('.sch-box'),
    m0 = f.selMonth ? parseInt(f.selMonth.value) : 1,
    L = S.lb.map(function (x) {
      return x + S.unit;
    });
  var val = function (k, i) {
    var lb = S.lb[i],
      mi = day ? m0 - 1 : (parseInt(String(lb).split('.').pop()) || 1) - 1;
    if (S.v[i] == null) return null;
    var r =
      MDB[k] +
      MDV[k][mi] +
      (day
        ? Math.sin(i * 1.7 + k * 2.3) * 0.5 + Math.sin(i * 0.45 + k) * 0.35 + (((i * 13 + k * 7) % 5) - 2) * 0.12
        : 0);
    return Math.min(100, Math.round(r * 10) / 10);
  };
  EC(el, {
    tooltip: {
      trigger: 'axis',
      valueFormatter: function (v) {
        return v == null ? '-' : v.toFixed(1) + '%';
      }
    },
    legend: ecLegend({ left: 36, right: 'auto', icon: 'roundRect', itemHeight: 3, itemWidth: 14 }),
    grid: { left: 44, right: 12, top: 34, bottom: 26 },
    xAxis: ecCat(L, {
      boundaryGap: false,
      axisLabel: {
        color: STC.tx,
        fontSize: 11,
        interval: S.step
          ? function (i) {
              return i === 0 || (i + 1) % S.step === 0;
            }
          : 0
      }
    }),
    yAxis: ecVal({
      min: 90,
      max: 100,
      interval: 2.5,
      axisLabel: { color: STC.gray, fontSize: 11, formatter: '{value}%' }
    }),
    series: MD.map(function (md, k) {
      return {
        name: md[0],
        type: 'line',
        symbolSize: day ? 4 : 6,
        lineStyle: { width: 2 },
        itemStyle: { color: MPAL[k] },
        data: S.lb.map(function (_, i) {
          return val(k, i);
        })
      };
    })
  });
}
function evSeries() {
  var f = document.querySelector('.sch-box'),
    t = f.selPeriodType.value,
    y = f.selYear.value,
    M = MON[y] || MON['2026년'],
    yy = parseInt(y);
  if (t === 'month') {
    var m = parseInt(f.selMonth.value),
      n = M[m - 1] || 0,
      d = days(yy, m),
      w = [],
      k;
    for (k = 0; k < d; k++) w.push(1 + ((k * 7 + m * 3) % 5) + (k % 9 === 4 ? 6 : 0));
    var sw = w.reduce(function (a, b) {
        return a + b;
      }, 0),
      v = w.map(function (x) {
        return Math.floor((n * x) / sw);
      }),
      r =
        n -
        v.reduce(function (a, b) {
          return a + b;
        }, 0);
    for (k = 0; r > 0; k = (k + 3) % d, r--) v[k]++;
    return {
      tit: '일별 재난 발령 추이',
      lb: v.map(function (_, i) {
        return i + 1;
      }),
      v: v,
      unit: '일',
      step: 5
    };
  }
  if (t === 'quarter') {
    var q = parseInt(f.selQuarter.value);
    return {
      tit: '월별 재난 발령 추이',
      lb: [1, 2, 3].map(function (i) {
        return (q - 1) * 3 + i;
      }),
      v: M.slice((q - 1) * 3, q * 3),
      unit: '월'
    };
  }
  if (t === 'custom') {
    var a = f.startDate.value.split('-'),
      b = f.endDate.value.split('-'),
      lb = [],
      v = [],
      cy = +a[0],
      cm = +a[1];
    while (cy < +b[0] || (cy === +b[0] && cm <= +b[1])) {
      var Y = MON[cy + '년'] || MON['2026년'];
      lb.push((cy !== yy || +a[0] !== +b[0] ? String(cy).slice(2) + '.' : '') + cm);
      v.push(Y[cm - 1]);
      cm++;
      if (cm > 12) {
        cm = 1;
        cy++;
      }
      if (lb.length > 24) break;
    }
    return { tit: '월별 재난 발령 추이', lb: lb, v: v, unit: '월' };
  }
  return { tit: '월별 재난 발령 추이', lb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], v: M, unit: '월' };
}
function drawEvTrend() {
  var el = document.getElementById('evTrend');
  if (!el) return;
  var S = evSeries();
  document.getElementById('evTrTit').textContent = S.tit;
  var v = S.v.map(function (x) {
      return x == null ? null : Math.round(x * SCOPE_F);
    }),
    L = S.lb.map(function (x) {
      return x + S.unit;
    }),
    mx = Math.max.apply(
      null,
      v
        .map(function (x) {
          return x || 0;
        })
        .concat([4])
    );
  EC(el, {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (ps) {
        var i = ps[0].dataIndex;
        return L[i] + '<br>' + (v[i] == null ? '집계 전' : '재난 발령 ' + v[i] + '건');
      }
    },
    grid: { left: 36, right: 10, top: 22, bottom: 26 },
    xAxis: ecCat(L, {
      axisLabel: {
        color: STC.tx,
        fontSize: 11,
        interval: S.step
          ? function (i) {
              return i === 0 || (i + 1) % S.step === 0;
            }
          : 0
      }
    }),
    yAxis: ecVal({ minInterval: 1 }),
    series: [
      {
        name: '발령 건수',
        type: 'bar',
        barMaxWidth: 28,
        itemStyle: { color: STC.pri, borderRadius: [3, 3, 0, 0] },
        label: { show: !S.step, position: 'top', fontSize: 11, fontWeight: 600, color: STC.tt },
        data: v.map(function (x) {
          return x == null
            ? {
                value: Math.ceil(mx * 0.12),
                label: { show: false },
                itemStyle: { color: 'transparent', borderColor: STC.na, borderType: 'dashed', borderWidth: 1 }
              }
            : x;
        })
      },
      {
        name: '추이',
        type: 'line',
        data: v,
        symbol: 'none',
        smooth: 0.2,
        connectNulls: false,
        lineStyle: { color: STC.navy, width: 1.5, opacity: 0.5 },
        tooltip: { show: false },
        z: 3
      }
    ]
  });
}
function applyScope(sd) {
  var tb = document.createElement('tbody');
  tb.innerHTML = ORIG.tb || document.getElementById('regionStatTbody').innerHTML;
  var f = 1;
  if (sd)
    [].forEach.call(tb.rows, function (tr) {
      if (tr.cells[0].textContent === sd) f = num(tr.cells[1].textContent) / 326;
    });
  ['tabEvent', 'tabMedia'].forEach(function (id) {
    if (!SCOPE0[id]) {
      var el = document.getElementById(id),
        w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT),
        n;
      SCOPE0[id] = [];
      while ((n = w.nextNode()))
        if (/^\s*\d[\d,]*\s*$/.test(n.nodeValue) && !n.parentNode.closest('thead,#evTrend,#evCat,#mediaResultChart'))
          SCOPE0[id].push([n, num(n.nodeValue)]);
    }
    SCOPE0[id].forEach(function (x) {
      x[0].nodeValue = Math.round(x[1] * f).toLocaleString();
    });
  });
  SCOPE_F = f;
  drawEvTrend();
  drawEvCat();
  drawMd();
  drawMdTrend();
}
function updCond() {
  var e = document.querySelector('[data-cond]');
  if (!e) return;
  window.onSearch(document.querySelector('.sch-box'));
}
function feats(tr) {
  var nm = tr.cells[0].textContent;
  if (tr.dataset.find) return GeoMap.find(tr.dataset.find);
  return KRGEO.sido.filter(function (x) {
    return x[0] === SD[nm];
  });
}
function regionData() {
  return [].map
    .call(document.querySelectorAll('#regionStatTbody tr.clk'), function (tr) {
      var c = tr.cells;
      return {
        nm: c[0].textContent,
        f: feats(tr),
        code: SD[c[0].textContent] || tr.dataset.find,
        n: +c[1].textContent.replace(/,/g, ''),
        tx: +c[2].textContent.replace(/,/g, ''),
        ok: +c[3].textContent.replace(/,/g, ''),
        ng: +c[4].textContent.replace(/,/g, '')
      };
    })
    .filter(function (r) {
      return r.code && r.f.length;
    });
}
function sn(n) {
  return n
    .replace(/통합특별시$/, '')
    .replace(/(특별자치도|특별자치시|광역시|특별시|도)$/, '')
    .replace(/^(충청|전라|경상)(남|북)$/, function (m, a, b) {
      return a[0] + b;
    });
}
function lv(n, mx) {
  var r = n / mx;
  return r > 0.8 ? 4 : r > 0.6 ? 3 : r > 0.4 ? 2 : 1;
}
/* GIS 지역별 발령 빈도(ECharts geo): kr-geo 행정경계(통계청 2013, 전남광주 합침)를 GeoJSON으로 바꿔 등록 — 버블(scatter)·단계구분도(map + 구간 색)·히트맵(heatmap) */
var GJ = {};
function decRings(f) {
  return f[2].map(function (a) {
    var o = [],
      x = a[0],
      y = a[1];
    o.push([x / 1e4, y / 1e4]);
    for (var i = 2; i < a.length; i += 2) {
      x += a[i];
      y += a[i + 1];
      o.push([x / 1e4, y / 1e4]);
    }
    return o;
  });
}
function ringArea(r) {
  var a = 0;
  for (var i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
}
function inRing(p, r) {
  var c = false;
  for (var i = 0, j = r.length - 1; i < r.length; j = i++) {
    var a = r[i],
      b = r[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
/* 링 → 다각형(바깥 링 + 그 안의 구멍 링) */
function polys(f) {
  var R = decRings(f).sort(function (a, b) {
      return ringArea(b) - ringArea(a);
    }),
    P = [];
  R.forEach(function (r) {
    var o = P.filter(function (pg) {
      return inRing(r[0], pg[0]);
    })[0];
    if (o) o.push(r);
    else P.push([r]);
  });
  return P;
}
function geoName(key, fs, nameOf) {
  if (GJ[key]) return key;
  var by = {};
  fs.forEach(function (f) {
    var n = nameOf(f);
    (by[n] = by[n] || []).push(f);
  });
  echarts.registerMap(key, {
    type: 'FeatureCollection',
    features: Object.keys(by).map(function (n) {
      return {
        type: 'Feature',
        properties: { name: n },
        geometry: { type: 'MultiPolygon', coordinates: [].concat.apply([], by[n].map(polys)) }
      };
    })
  });
  GJ[key] = 1;
  return key;
}
function drawRegionMap() {
  var el = document.getElementById('regionMap');
  if (!el.offsetWidth) return;
  if (!el.querySelector('#rgMapEc')) {
    el.innerHTML =
      '<div id="rgMapEc" style="position:absolute;inset:0"></div><button type="button" class="btn s btn-line rg-all" title="전국 보기" onclick="drillTo(\'sido\')"><i class="ri-fullscreen-exit-line"></i>전국</button><div class="gm-zoom"><button type="button" title="확대" onclick="rgZoom(1.4)">+</button><button type="button" title="축소" onclick="rgZoom(1/1.4)">−</button><button type="button" title="처음 위치" onclick="drawRegionMap()"><i class="ri-focus-3-line"></i></button></div><p class="gm-note">※ 행정구역은 현재 GIS 정보로 표출됩니다. (GIS 최종갱신일자 : ' +
      (window.GIS_DATE || '2026-11-03') +
      ')</p>';
  }
  var SDv = document.getElementById('rgSido').value,
    sg = UNIT === 'sgg',
    D = regionData(),
    mx =
      Math.max.apply(
        null,
        D.map(function (r) {
          return r.n;
        })
      ) || 1,
    own = {};
  D.forEach(function (r) {
    r.f.forEach(function (f) {
      own[f[0]] = r.nm;
    });
  });
  var key, fs, box;
  if (!sg) {
    fs = KRGEO.sido;
    key = 'rg-sido';
    box = [125.9, 33.1, 129.7, 38.65];
  } else {
    var pre = SDv ? (SD[SDv] === '36' ? ['24', '36'] : [SD[SDv]]) : null;
    fs = KRGEO.sgg.filter(function (f) {
      return !pre || pre.indexOf(f[0].slice(0, 2)) > -1;
    });
    key =
      'rg-sgg-' +
      (SDv || 'all') +
      '-' +
      D.map(function (r) {
        return r.nm;
      }).join('|');
    box = SDv ? GeoMap.bbox(fs) : [125.9, 33.1, 129.7, 38.65];
  }
  geoName(key, fs, function (f) {
    return own[f[0]] || (sg ? '_' + f[0] : f[1]);
  });
  var short = function (n) {
      return sg ? n.split(' ').pop() : sn(n);
    },
    tip = function (r) {
      return (
        r.nm +
        '<br>발령 ' +
        r.n +
        '건 · 성공률 ' +
        (r.tx ? ((r.ok / r.tx) * 100).toFixed(1) : '-') +
        '%' +
        (sg ? '' : '<br><span style="opacity:.75">클릭: 시군구 보기</span>')
      );
    },
    pt = D.map(function (r) {
      var c = GeoMap.centroid(r.f[0]),
        o = sg ? null : NUDGE[r.code];
      if (o) c = [c[0] + o[0], c[1] + o[1]];
      return { name: r.nm, value: c.concat(r.n), r: r };
    }),
    LV = ['#eef0fc', '#cdd3f6', '#9aa6ee', '#3e55e1'],
    lvC = function (n) {
      return LV[lv(n, mx) - 1];
    },
    lbl = {
      show: true,
      formatter: function (p) {
        return short(p.name) + ' {b|' + p.value[2] + '}';
      },
      backgroundColor: '#fff',
      borderColor: '#182146',
      borderWidth: 1,
      borderRadius: 11,
      padding: [3, 7],
      color: '#182146',
      fontSize: 11,
      rich: { b: { fontWeight: 700, fontSize: 12, color: '#182146' } }
    },
    S = [];
  if (RMODE === '버블')
    S.push({
      type: 'scatter',
      coordinateSystem: 'geo',
      data: pt,
      symbolSize: function (v) {
        return sg ? 26 + (v[2] / mx) * 18 : 34 + (v[2] / mx) * 22;
      },
      itemStyle: { color: 'rgba(62,85,225,.3)', borderColor: '#3e55e1', borderWidth: 2 },
      emphasis: { scale: 1.08, itemStyle: { color: 'rgba(62,85,225,.65)' } },
      label: {
        show: true,
        position: 'inside',
        lineHeight: 13,
        formatter: function (p) {
          return '{a|' + short(p.name) + '}\n{b|' + p.value[2] + '}';
        },
        rich: {
          a: { fontSize: 10, fontWeight: 600, color: '#182146' },
          b: { fontSize: 13, fontWeight: 700, color: '#182146' }
        }
      }
    });
  else if (RMODE === '히트맵') {
    S.push({
      type: 'heatmap',
      coordinateSystem: 'geo',
      data: pt.map(function (d) {
        return d.value;
      }),
      pointSize: sg ? 34 : 58,
      blurSize: sg ? 26 : 44
    });
    S.push({
      type: 'scatter',
      coordinateSystem: 'geo',
      data: pt,
      symbolSize: 1,
      itemStyle: { opacity: 0 },
      label: Object.assign({ position: 'inside' }, lbl)
    });
  } else
    S.push({
      type: 'scatter',
      coordinateSystem: 'geo',
      data: pt,
      symbolSize: 1,
      itemStyle: { opacity: 0 },
      label: Object.assign({ position: 'inside' }, lbl)
    });
  var regions =
    RMODE === '단계구분도'
      ? D.map(function (r) {
          return { name: r.nm, itemStyle: { areaColor: lvC(r.n) } };
        })
      : [];
  var ch = EC(el.querySelector('#rgMapEc'), {
    backgroundColor: '#c9dced',
    tooltip: {
      trigger: 'item',
      formatter: function (p) {
        var d = pt.filter(function (x) {
          return x.name === p.name;
        })[0];
        return d ? tip(d.r) : p.name.charAt(0) === '_' ? '' : p.name;
      }
    },
    visualMap:
      RMODE === '히트맵'
        ? {
            show: false,
            min: 0,
            max: mx,
            seriesIndex: 0,
            inRange: { color: ['rgba(255,183,36,0)', 'rgba(255,183,36,.55)', 'rgba(235,0,59,.85)'] }
          }
        : undefined,
    geo: {
      map: key,
      roam: true,
      boundingCoords: [
        [box[0], box[3]],
        [box[2], box[1]]
      ],
      aspectScale: 0.8,
      scaleLimit: { min: 0.8, max: 12 },
      selectedMode: false,
      itemStyle: { areaColor: '#f4f1e8', borderColor: '#9d978a', borderWidth: sg ? 0.5 : 0.8 },
      emphasis: { itemStyle: { areaColor: '#e7e1cf' }, label: { show: false } },
      label: {
        show: !sg,
        fontSize: 10,
        color: '#8e8e8e',
        formatter: function (p) {
          return D.some(function (r) {
            return r.nm === p.name;
          })
            ? ''
            : sn(p.name);
        }
      },
      regions: regions
    },
    series: S
  });
  if (ch) {
    ch.off('click');
    ch.on('click', function (p) {
      var n = p.name || (p.data && p.data.name);
      if (
        n &&
        D.some(function (r) {
          return r.nm === n;
        })
      )
        drill(n);
    });
  }
  el.querySelectorAll('.rg-lgd').forEach(function (x) {
    x.parentNode.removeChild(x);
  });
  el.insertAdjacentHTML(
    'beforeend',
    '<div class="rg-lgd">' +
      (RMODE === '버블'
        ? '<b>버블 크기</b> = 발령 건수'
        : RMODE === '히트맵'
          ? '<b>히트맵</b> 진할수록 발령 집중'
          : '<b>발령 건수</b><i class="h1"></i>~' +
            Math.round(mx * 0.4) +
            '<i class="h2"></i>~' +
            Math.round(mx * 0.6) +
            '<i class="h3"></i>~' +
            Math.round(mx * 0.8) +
            '<i class="h4"></i>' +
            mx) +
      ' · 기타 ' +
      (sg ? '시군구' : '시도') +
      ' 제외' +
      (sg ? '' : ' · 클릭: 시군구') +
      '</div>'
  );
}
function rgZoom(k) {
  var d = document.getElementById('rgMapEc'),
    c = d && echarts.getInstanceByDom(d);
  if (!c) return;
  var z = (c.getOption().geo[0].zoom || 1) * k;
  c.setOption({ geo: { zoom: Math.max(0.8, Math.min(12, z)) } });
}
function pickRegion(nm) {
  var tr = [].filter.call(document.querySelectorAll('#regionStatTbody tr'), function (x) {
    return x.cells[0].textContent === nm;
  })[0];
  if (tr) showRegionDetail(tr);
}
function changeMapMode(b) {
  b.parentNode.querySelectorAll('button').forEach(function (x) {
    x.className = 'btn s ico ' + (x === b ? 'btn-pri' : 'btn-line');
  });
  RMODE = b.title;
  drawRegionMap();
  msg('지도 표현 방식을 ' + b.title + '(으)로 변경하였습니다.');
}
function swRg(b, k) {
  b.closest('ul')
    .querySelectorAll('li')
    .forEach(function (l) {
      l.classList.toggle('on', l === b.parentNode);
    });
  document.getElementById('rgTbl').hidden = k === 1;
  document.getElementById('rgHeat').hidden = k !== 1;
  msg(b.textContent + '를 표시합니다.');
}
function showRegionDetail(tr) {
  tr.parentNode.querySelectorAll('tr').forEach(function (x) {
    x.classList.toggle('on', x === tr);
  });
  var d = document.getElementById('rgMapEc'),
    c = d && echarts.getInstanceByDom(d),
    nm = tr.cells[0].textContent;
  if (c) {
    c.dispatchAction({ type: 'downplay' });
    c.dispatchAction({ type: 'highlight', seriesIndex: RMODE === '히트맵' ? 1 : 0, name: nm });
    c.dispatchAction({ type: 'showTip', seriesIndex: RMODE === '히트맵' ? 1 : 0, name: nm });
  }
  msg(tr.cells[0].textContent + ' 지역 상세 통계를 표출합니다.');
}
/* 초기화 시 지역 레벨·시도 선택도 시도별로 */
document.querySelector('.sch-box').addEventListener('reset', function () {
  setTimeout(function () {
    if (UNIT !== 'sido') setUnit('sido');
  });
});
window.onTab = function (id) {
  if (id === 'tabRegion') drawRegionMap();
  if (id === 'tabEvent') {
    drawEvTrend();
    drawEvCat();
  }
  if (id === 'tabMedia') {
    drawMdTrend();
    drawMd();
  }
  msg({ tabEvent: '재난별 통계', tabMedia: '매체별 통계', tabRegion: '지역별 통계' }[id] + '을(를) 조회하였습니다.');
};
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  var t = f.selPeriodType,
    p =
      t.value === 'custom'
        ? f.startDate.value + ' ~ ' + f.endDate.value
        : f.selYear.value +
          (t.value === 'month' ? ' ' + f.selMonth.value : t.value === 'quarter' ? ' ' + f.selQuarter.value : '');
  var c = (f.selLclsf.value || '전체') + (f.selCategory.value ? ' > ' + f.selCategory.value : ''),
    s = f.selSituation.selectedOptions[0].textContent;
  /* 차트 제목 옆 조회조건: 기간 · 재난분류 · 재난상황(전체면 생략) */
  var sd = UNIT === 'sgg' && f.rgSido.value ? f.rgSido.value : '',
    v =
      p +
      ' · ' +
      (sd || '전국') +
      ' · ' +
      (f.selLclsf.value ? c : '전체 재난') +
      (f.selSituation.value ? ' · ' + s : '');
  drawEvTrend();
  drawEvCat();
  drawMd();
  drawMdTrend();
  document.querySelectorAll('[data-cond]').forEach(function (e) {
    e.textContent = v;
    e.title = '조회기간: ' + p + ' | 지역: ' + (sd || '전국') + ' | 재난분류: ' + c + ' | 재난상황: ' + s;
  });
};
window.onSearch(document.querySelector('.sch-box'));
document.querySelector('.sch-box').addEventListener('reset', function () {
  setTimeout(function () {
    window.onSearch(document.querySelector('.sch-box'));
  });
});
