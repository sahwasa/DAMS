/* 데이터송수신이력 | 재난 예경보 통합관리시스템 */
var TOTAL = 19524;
function setCnt(n, pages) {
  document.getElementById('totCnt').textContent = n.toLocaleString();
  var p = document.getElementById('pgBtns');
  p.dataset.total = pages;
  p.dataset.page = 1;
  initPaging(p.parentNode);
}
function searchCap(f) {
  var k = f.searchKeyword ? f.searchKeyword.value.trim() : '',
    ss = [].slice.call(f.querySelectorAll('select[data-f]')),
    tb = document.querySelector('.grid tbody'),
    n = 0;
  var on =
    k ||
    ss.some(function (s) {
      return s.value;
    });
  tb.querySelectorAll('tr:not(.nodata)').forEach(function (tr) {
    var ok =
      (!k || tr.textContent.indexOf(k) > -1) &&
      ss.every(function (s) {
        var v = tr.cells[+s.dataset.f].textContent.trim();
        return !s.value || (s.dataset.m === 'has' ? v.indexOf(s.value) > -1 : v === s.value);
      });
    tr.hidden = !ok;
    if (ok) n++;
  });
  tb.querySelector('.nodata').hidden = n > 0;
  if (on) setCnt(n, 1);
  else setCnt(TOTAL, Math.ceil(TOTAL / +document.getElementById('pageSize').value));
  msg(n ? '조회가 완료되었습니다.' : '검색된 결과가 없습니다.');
  return false;
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  return f.id === 'dsForm' ? dsSearch(f) : searchCap(f);
};
document.getElementById('schForm').addEventListener('reset', function () {
  setTimeout(function () {
    document.querySelectorAll('#dataLogTbl tbody tr').forEach(function (tr) {
      tr.hidden = tr.classList.contains('nodata');
    });
    setCnt(TOTAL, Math.ceil(TOTAL / +document.getElementById('pageSize').value));
  });
});
function applySize() {
  var s = +document.getElementById('pageSize').value,
    c = +document.getElementById('totCnt').textContent.replace(/,/g, '');
  setCnt(c, Math.max(1, Math.ceil(c / s)));
  msg('페이지당 ' + s + '건으로 목록을 조회하였습니다.');
}
function popUrl(u, o) {
  return u + '?' + new URLSearchParams(o).toString();
}
/* 샘플 데이터 ROWS·SGG → log_data.data.js */
function setSgg(v) {
  document.getElementById('sgg_select').innerHTML =
    '<option value="">시군구 전체</option>' +
    (SGG[v] || [])
      .map(function (s) {
        return '<option>' + s + '</option>';
      })
      .join('');
}
function openCap(i) {
  var r = ROWS[i];
  document.querySelectorAll('#dataLogTbl tbody tr').forEach(function (x, k) {
    x.classList.toggle('on', k === i);
  });
  openPop(popUrl('pop/log_data_cap.html', { org: r[0], io: r[1], se: r[2], rs: r[3], dt: r[4], id: r[6] }), 760);
}
/* NDMS 데이터셋 연계 — 데이터셋 연계 현황표(2026-11-16): [ID, 인터페이스명, 방식, 기관, 연계주기, 망] */
/* 샘플 데이터 IFS → log_data.data.js */
var DS_NOW = new Date(2026, 9, 30, 14, 16, 0),
  DS_ERR = {
    'GIS-EI-461': '인터넷망 파일 수신 시간 초과(연계 서버 응답 없음)',
    'GIS-EI-153': '원천 DB 접속 오류(ORA-12541)',
    'GIS-EI-086': '대상 데이터 없음(관측 자료 미생성)'
  };
function dsPeriod(c) {
  var m;
  if ((m = c.match(/^매(\d+)초마다/))) return { p: +m[1] };
  if ((m = c.match(/^매(\d+)분0초마다/))) return { p: m[1] * 60 };
  if ((m = c.match(/^매분(\d+)초/))) return { p: 60, o: +m[1] };
  if ((m = c.match(/^매시간(\d+)분(\d+)초/))) return { p: 3600, o: m[1] * 60 + +m[2] };
  if ((m = c.match(/^매일(\d+)시(\d+)분(\d+)초/))) return { p: 86400, o: m[1] * 3600 + m[2] * 60 + +m[3] };
  if (/^매달/.test(c)) return { p: 0 };
  return { p: 86400 };
}
function dsTimes(c, k) {
  var d = dsPeriod(c),
    r = [],
    t;
  if (!d.p) {
    r.push(new Date(2026, 9, 1, 0, 0, 0));
    return r;
  }
  var base = new Date(2026, 9, 30).getTime() / 1000,
    now = DS_NOW.getTime() / 1000,
    o = d.o || 0;
  t = base + o + Math.floor((now - base - o) / d.p) * d.p;
  if (t > now) t -= d.p;
  for (var i = 0; i < k; i++) {
    r.push(new Date((t - i * d.p) * 1000));
  }
  return r;
}
function dsFmt(d) {
  function z(n) {
    return (n < 10 ? '0' : '') + n;
  }
  return (
    d.getFullYear() +
    '-' +
    z(d.getMonth() + 1) +
    '-' +
    z(d.getDate()) +
    ' ' +
    z(d.getHours()) +
    ':' +
    z(d.getMinutes()) +
    ':' +
    z(d.getSeconds())
  );
}
function dsHash(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
  return h;
}
/* 인터페이스마다 최근 처리 4회(목업) → 처리일시 역순 */
var DS_POOL = [];
IFS.forEach(function (f) {
  dsTimes(f[4], 4).forEach(function (t, i) {
    var h = dsHash(f[0] + i),
      ng = DS_ERR[f[0]] && i === 0,
      cnt = ng ? 0 : /초마다|매분/.test(f[4]) ? h % 4 : /분0초마다|매시간/.test(f[4]) ? 1 + (h % 60) : 20 + (h % 900);
    DS_POOL.push({ f: f, t: t, cnt: cnt, ng: ng });
  });
});
DS_POOL.sort(function (a, b) {
  return b.t - a.t;
});
var dsList = DS_POOL;
function dsDraw() {
  var n = +document.getElementById('dsPageSize').value,
    b = document.getElementById('dsBody'),
    rows = dsList.slice(0, n);
  b.innerHTML = rows.length
    ? rows
        .map(function (e, i) {
          var f = e.f;
          return (
            '<tr' +
            (e.ng ? ' class="ng"' : '') +
            '><td>' +
            (dsList.length - i).toLocaleString() +
            '</td><td>' +
            f[0] +
            '</td><td class="t-l" title="' +
            f[1] +
            ' (' +
            f[3] +
            ')">' +
            f[1] +
            '</td><td>' +
            f[2] +
            '</td><td>' +
            f[4] +
            '</td><td>' +
            f[5] +
            '</td><td class="t-r">' +
            e.cnt.toLocaleString() +
            '</td><td><span class="badge ' +
            (e.ng ? 'dg">실패' : 'sc">성공') +
            '</span></td><td>' +
            dsFmt(e.t) +
            '</td><td class="t-l' +
            (e.ng ? ' c-dg' : '') +
            '" title="' +
            (e.ng ? DS_ERR[f[0]] : '') +
            '">' +
            (e.ng ? DS_ERR[f[0]] : '-') +
            '</td></tr>'
          );
        })
        .join('')
    : '<tr class="nodata"><td colspan="10">검색된 결과가 없습니다.</td></tr>';
  document.getElementById('dsCnt').textContent = dsList.length.toLocaleString();
  var p = document.getElementById('dsPg');
  p.dataset.total = Math.max(1, Math.ceil(dsList.length / n));
  p.dataset.page = 1;
  initPaging(p.parentNode);
}
function dsSearch(f) {
  var id = f.ifId.value,
    net = f.ifNet.value,
    rs = f.ifRslt.value;
  dsList = DS_POOL.filter(function (e) {
    return (!id || e.f[0] === id) && (!net || e.f[5] === net) && (!rs || (rs === '실패') === e.ng);
  });
  dsDraw();
  msg(dsList.length ? '조회가 완료되었습니다.' : '검색된 결과가 없습니다.');
  return false;
}
function dsApply() {
  dsDraw();
  msg('페이지당 ' + document.getElementById('dsPageSize').value + '건으로 목록을 조회하였습니다.');
}
document.getElementById('dsForm').addEventListener('reset', function () {
  setTimeout(function () {
    dsList = DS_POOL;
    dsDraw();
  });
});
dsDraw();
