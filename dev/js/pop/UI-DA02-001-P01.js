/* UI-DA02-001-P01 재난발령 상세 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA02-001-P01'] = function (location, dlg) {
  /* GIS상황판 지방정부발령 [상세보기]에서 쿼리로 발령 정보를 넘겨받는다(목업). 단독 실행 시 기본 샘플 */
  var Q = new URLSearchParams(location.search),
    g = function (k, d) {
      return Q.get(k) || d;
    },
    $ = function (i) {
      return document.getElementById(i);
    };
  var D = {
    sys: g('sys', '울산 동구 통합플랫폼'),
    org: g('org', '울산 동구'),
    cat: g('cat', '자연재난 > 강풍 > 강풍주의보'),
    tit: g('tit', '강풍주의보 발표에 따른 시설물 안전 유의'),
    tm: g('tm', '2026-10-30 15:00:30'),
    end: g('end', '2026-10-30 21:00:00'),
    rg: g('rg', '울산 동구'),
    md: g('md', 'VNO:3:2:1:0,LDB:4:2:1:1,VBS:2:2:0:0')
      .split(',')
      .map(function (x) {
        var a = x.split(':');
        return [a[0], +a[1], +a[2], +a[3], +a[4]];
      }),
    pl: g('pl', '나사등대,진하해변,울산교,방어진항,일산해수욕장,화정동 경로당').split(',')
  };
  var MDN = {
    VNO: ['자동음성통보', '음성경보사이렌'],
    LDB: ['재해문자전광판(지자체)', '전광판'],
    CDB: ['재해문자전광판(행안부)', '재해문자전광판'],
    VBS: ['마을방송', '마을방송'],
    RAS: ['자동우량경보', '우량경보']
  };
  var nm = D.cat.split(' > ').pop(),
    rgs = D.rg.split(', '),
    esc = function (t) {
      return String(t).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    };
  $('pOrg').textContent = D.org;
  $('pTit').textContent = D.tit;
  $('popTit').textContent = '재난발령 상세 — ' + D.org;
  var t = $('issue-summary'),
    set = function (k, v) {
      t.querySelector('[data-k=' + k + ']').textContent = v;
    };
  var med = D.md.map(function (m) {
    return (MDN[m[0]] || [m[0]])[0];
  });
  set('sys', D.sys);
  set('cat', D.cat);
  set('med', med.concat('문자방송').join(', '));
  set('tm', D.tm);
  set('end', D.end);
  set('rgn', D.rg);
  var has = function (c) {
      return D.md.some(function (m) {
        return m[0] === c;
      });
    },
    none = '<span class="c-dis">해당 매체로 발령되지 않았습니다.</span>';
  $('msgBoard').innerHTML = has('LDB') || has('CDB') ? esc('[' + D.org + '] ' + nm + ' 발령\n' + D.tit) : none;
  var v = has('VNO') || has('VBS') || has('RAS');
  $('msgVoice').innerHTML = v
    ? esc(
        '주민 여러분께 알려드립니다. ' +
          D.org +
          ' 지역에 ' +
          nm +
          '이(가) 발령되었습니다. ' +
          D.tit +
          '. 안전에 유의하여 주시기 바랍니다.'
      )
    : none;
  $('msgSms').innerHTML = esc(
    '[' + D.org + '] ' + D.tm.slice(11, 16) + ' ' + nm + ' 발령. ' + D.tit + '. 행동요령을 확인 바랍니다.'
  );
  /* 단말기 목록: 매체별 [전체,성공,실패,미수신] 건수로 생성 */
  var DEV = [],
    REASON = ['단말기 응답 시간 초과(30초)', '통신 모듈 오류', '전원 차단 상태'];
  D.md.forEach(function (m) {
    var n = MDN[m[0]] || [m[0], '단말'],
      r = ['성공', m[2], '실패', m[3], '미수신', m[4]];
    for (var j = 0, k = 0; j < 3; j++)
      for (var c = 0; c < r[j * 2 + 1]; c++, k++) {
        var s = new Date(D.tm.replace(' ', 'T'));
        s.setSeconds(s.getSeconds() + 3 + DEV.length * 2);
        DEV.push({
          md: n[0],
          nm: D.pl[DEV.length % D.pl.length] + ' ' + n[1] + (k + 1),
          rg: rgs[k % rgs.length],
          tm: r[j * 2] === '미수신' ? '-' : s.toTimeString().slice(0, 8),
          rs: r[j * 2],
          why: REASON[k % 3]
        });
      }
  });
  $('device_media_type').innerHTML =
    '<option value="">전체</option>' +
    med
      .map(function (x) {
        return '<option>' + x + '</option>';
      })
      .join('');
  function drawDev(f) {
    var mt = f ? f.device_media_type.value : '',
      rs = f ? f.device_rslt.value : '',
      a = DEV.filter(function (d) {
        return (!mt || d.md === mt) && (!rs || d.rs === rs);
      }),
      grp = {},
      h = '',
      n = [0, 0, 0],
      k = 0;
    a.forEach(function (d) {
      (grp[d.md] = grp[d.md] || []).push(d);
    });
    Object.keys(grp).forEach(function (s) {
      var b = grp[s],
        c = [0, 0, 0];
      b.forEach(function (d) {
        c[d.rs === '성공' ? 0 : d.rs === '실패' ? 1 : 2]++;
      });
      h +=
        '<tr class="grp"><td colspan="6">' +
        s +
        '<em>전체 ' +
        b.length +
        ' · 성공 ' +
        c[0] +
        ' · 실패 ' +
        c[1] +
        ' · 미수신 ' +
        c[2] +
        '</em></td></tr>';
      b.forEach(function (d) {
        var bd =
          d.rs === '성공'
            ? '<span class="badge sc">성공</span>'
            : d.rs === '실패'
              ? '<span class="badge dg tip" data-tip="실패사유: ' + esc(d.why) + '">실패</span>'
              : '<span class="badge">미수신</span>';
        h +=
          '<tr><td>' +
          ++k +
          '</td><td>' +
          esc(d.md) +
          '</td><td class="t-l">' +
          esc(d.nm) +
          '</td><td class="t-l">' +
          esc(d.rg) +
          '</td><td>' +
          (d.tm === '-' ? '-' : D.tm.slice(0, 10) + ' ' + d.tm) +
          '</td><td>' +
          bd +
          '</td></tr>';
        n[d.rs === '성공' ? 0 : d.rs === '실패' ? 1 : 2]++;
      });
    });
    document.querySelector('#device_table tbody').innerHTML =
      h || '<tr class="nodata"><td colspan="6">검색된 결과가 없습니다.</td></tr>';
    $('devCnt').innerHTML =
      '전체<b>' +
      a.length +
      '</b>건 / 성공 <b class="c-sc">' +
      n[0] +
      '</b>건 / 실패 <b>' +
      n[1] +
      '</b>건 / 미수신 <b class="c-wn">' +
      n[2] +
      '</b>건';
    popResize();
  }
  drawDev();
  /* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
  window.onSearch = function (f) {
    drawDev(f);
    msg('단말기 발령이력을 조회하였습니다.');
    return false;
  };
  $('devSch').addEventListener('reset', function () {
    setTimeout(function () {
      drawDev();
    });
  });
  window.onTab = function () {
    popResize();
  };
  return { drawDev: typeof drawDev === 'function' ? drawDev : undefined };
};
DAMS_POP['UI-DA02-001-P01'].names = ['drawDev', 'onSearch', 'onTab'];
