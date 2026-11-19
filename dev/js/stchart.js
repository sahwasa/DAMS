/* 통계 차트 공통(ECharts 5.6.0, lib/echarts — 폐쇄망 로컬 사본) — 재난발령통계·단말기통계
   EC(el,option): 보이는 요소에만 그림(숨은 탭은 탭 전환 시 다시 그림), 같은 요소면 인스턴스 재사용
   STC: 디자인 토큰 색, ecAxis(): 축 공통 모양 */
(function () {
  var C = {
    pri: '#3e55e1',
    c2: '#2b9bd8',
    c3: '#f5930b',
    navy: '#182146',
    sc: '#008a1e',
    dg: '#eb003b',
    na: '#c6c6c6',
    gray: '#8e8e8e',
    ax: '#c6c6c6',
    gl: '#f0f0f0',
    tx: '#505050',
    tt: '#101010',
    pal: ['#3e55e1', '#2b9bd8', '#00a37a', '#f5930b', '#e5484d', '#8e5cd9', '#c77700', '#c6c6c6']
  };
  var FONT = "'Pretendard GOV Variable','Pretendard GOV',sans-serif";
  window.STC = C;
  window.EC = function (el, opt) {
    if (!el || !el.offsetWidth || !window.echarts) return null;
    var c = echarts.getInstanceByDom(el) || echarts.init(el);
    opt.textStyle = Object.assign({ fontFamily: FONT, color: C.tx, fontSize: 12 }, opt.textStyle || {});
    opt.animationDuration = opt.animationDuration || 350;
    if (opt.tooltip)
      opt.tooltip = Object.assign(
        {
          backgroundColor: '#182146',
          borderWidth: 0,
          textStyle: { color: '#fff', fontSize: 12, fontFamily: FONT },
          confine: true
        },
        opt.tooltip
      );
    /* 좁은 화면(<500): 가로 범주축 라벨이 겹치면 자동으로 건너뜀(모바일) */
    if (el.offsetWidth < 500)
      [].concat(opt.xAxis || []).forEach(function (x) {
        if (x && x.type === 'category' && x.axisLabel && x.axisLabel.interval === 0 && !x.axisLabel.rotate) {
          x.axisLabel.interval = 'auto';
          x.axisLabel.hideOverlap = true;
        }
      });
    dualAx(opt);
    c.setOption(opt, true);
    return c;
  };
  /* 좌우 2축 차트(2026-11-19): ① 두 축 눈금 칸 수를 같게(가로 보조선·양쪽 끝 눈금이 한 줄로) — min·max·interval이 모두 정해진 축의 칸 수를 따르고(없으면 5칸),
   나머지 축은 데이터(누적 막대는 합계) 범위로 1·2·2.5·3·4·5 단위 눈금을 맞춤 ② 축 이름을 눈금 글자 바깥 끝에 맞춤(왼쪽 축은 왼쪽 끝, 오른쪽 축은 오른쪽 끝) */
  var CV;
  function tw(t) {
    CV = CV || document.createElement('canvas').getContext('2d');
    CV.font = '11px ' + FONT;
    return CV.measureText(String(t)).width;
  }
  function nice(r) {
    var e = Math.pow(10, Math.floor(Math.log10(r))),
      f = r / e;
    return (
      [1, 2, 2.5, 3, 4, 5, 10]
        .map(function (k) {
          return k * e;
        })
        .filter(function (x) {
          return x >= r - 1e-9;
        })[0] || 10 * e
    );
  }
  function dualAx(opt) {
    var Y = opt.yAxis;
    if (
      !Array.isArray(Y) ||
      Y.length !== 2 ||
      Y.some(function (y) {
        return !y || y.type !== 'value';
      })
    )
      return;
    var ext = [0, 1].map(function (ai) {
      var lo = Infinity,
        hi = -Infinity,
        st = {};
      [].concat(opt.series || []).forEach(function (s) {
        if ((s.yAxisIndex || 0) !== ai) return;
        (s.data || []).forEach(function (d, i) {
          var v = d && typeof d === 'object' ? d.value : d;
          if (v == null || isNaN(v)) return;
          v = +v;
          if (s.stack) {
            var k = s.stack + '|' + i;
            v = st[k] = (st[k] || 0) + v;
          }
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        });
      });
      return [lo, hi];
    });
    var fix = Y.map(function (y) {
        return y.min != null && y.max != null && y.interval;
      }),
      N = 5;
    Y.forEach(function (y, i) {
      if (fix[i]) N = Math.round((y.max - y.min) / y.interval);
    });
    Y.forEach(function (y, i) {
      if (fix[i] || !isFinite(ext[i][1])) return;
      var lo = y.min != null ? y.min : y.scale ? ext[i][0] : Math.min(0, ext[i][0]),
        hi = ext[i][1],
        st = nice(Math.max(hi - lo, 1) / N),
        mn;
      for (var g = 0; g < 20; g++) {
        mn = y.min != null ? y.min : Math.floor(lo / st) * st;
        if (mn + st * N >= hi) break;
        st = nice(st * 1.0001 + 1e-9);
      }
      y.min = mn;
      y.max = mn + st * N;
      y.interval = st;
    });
    Y.forEach(function (y, i) {
      if (!y.name || !y.nameTextStyle) return;
      var f = y.axisLabel && y.axisLabel.formatter,
        w = 0;
      for (var v = y.min; v <= y.max + 1e-9; v += y.interval) {
        var t = typeof f === 'function' ? f(+v.toFixed(6)) : String(+v.toFixed(6));
        w = Math.max(w, tw(t));
      }
      y.nameTextStyle.padding = i ? [0, -Math.round(8 + w), 0, 0] : [0, 0, 0, -Math.round(8 + w)];
    });
  }
  window.ecNar = function (el) {
    return el && el.offsetWidth < 500;
  };
  /* 축 공통: 카테고리 축 / 값 축 */
  window.ecCat = function (data, o) {
    return Object.assign(
      {
        type: 'category',
        data: data,
        axisLine: { lineStyle: { color: C.gray } },
        axisTick: { show: false },
        axisLabel: { color: C.tx, fontSize: 11, interval: 0 }
      },
      o || {}
    );
  };
  /* 값 축 숫자 단위: 1천 이상은 천, 1만 이상은 만, 1억 이상은 억(K·M 대신, 2026-11-18) — 축 라벨에 formatter가 없으면 기본 적용 */
  window.krNum = function (v) {
    var a = Math.abs(v),
      r = function (x) {
        return +x.toFixed(1);
      };
    return a >= 1e8 ? r(v / 1e8) + '억' : a >= 1e4 ? r(v / 1e4) + '만' : a >= 1e3 ? r(v / 1e3) + '천' : v;
  };
  /* 좌우 2축 차트의 축 이름(어느 값의 축인지): ecAxName('연결(건)') — 축 위쪽에 회색 작은 글자 */
  window.ecAxName = function (n, right) {
    return {
      name: n,
      nameLocation: 'end',
      nameGap: 12,
      nameTextStyle: {
        color: C.tx,
        fontSize: 11,
        fontWeight: 600,
        align: right ? 'right' : 'left',
        padding: right ? [0, -6, 0, 0] : [0, 0, 0, -30]
      }
    };
  };
  window.ecVal = function (o) {
    var v = Object.assign(
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: C.gray, fontSize: 11 },
        splitLine: { lineStyle: { color: C.gl } }
      },
      o || {}
    );
    if (!v.axisLabel.formatter) v.axisLabel = Object.assign({}, v.axisLabel, { formatter: krNum });
    return v;
  };
  window.ecLegend = function (o) {
    return Object.assign(
      { top: 0, right: 4, itemWidth: 10, itemHeight: 10, itemGap: 12, textStyle: { fontSize: 12, color: C.tx } },
      o || {}
    );
  };
  /* 창 크기 변경 시 모든 차트 맞춤 */
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      document.querySelectorAll('[_echarts_instance_]').forEach(function (d) {
        var c = echarts.getInstanceByDom(d);
        if (c) c.resize();
      });
    }, 120);
  });
})();
