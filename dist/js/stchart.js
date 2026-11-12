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
    c.setOption(opt, true);
    return c;
  };
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
  window.ecVal = function (o) {
    return Object.assign(
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: C.gray, fontSize: 11 },
        splitLine: { lineStyle: { color: C.gl } }
      },
      o || {}
    );
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
