/* 공통코드관리 | 재난 예경보 통합관리시스템 */
/* 샘플 데이터 G → sys_code.data.js */
var $ = function (s) {
    return document.querySelector(s);
  },
  cur = 0;
function yn(v) {
  return '<span class="badge' + (v === 'Y' ? ' sc' : '') + '">' + v + '</span>';
}
function mng(nd, fe, fd) {
  return nd
    ? '<span style="color:#8e8e8e">-</span>'
    : '<button type="button" class="btn s btn-line" onclick="event.stopPropagation();' +
        fe +
        '">수정</button> <button type="button" class="btn s btn-line" onclick="event.stopPropagation();' +
        fd +
        '">삭제</button>';
}
function loadGroupCodes() {
  var se = $('#srcSeCd').value,
    kw = $('#groupSearchKeyword').value.trim().toLowerCase(),
    n = 0;
  var h = G.map(function (g, i) {
    if ((se && g[0] !== se) || (kw && (g[1] + g[2]).toLowerCase().indexOf(kw) < 0)) return '';
    n++;
    return (
      '<tr class="clk' +
      (i === cur ? ' on' : '') +
      '" onclick="selectGroup(' +
      i +
      ')"><td><span class="badge' +
      (g[0] === 'N' ? ' in' : '') +
      '">' +
      (g[0] === 'N' ? 'NDMS' : '자체') +
      '</span></td><td class="t-l">' +
      g[1] +
      '</td><td class="t-l">' +
      g[2] +
      '</td><td class="t-l" title="' +
      g[3] +
      '">' +
      g[3] +
      '</td><td>' +
      yn(g[4]) +
      '</td><td>' +
      mng(g[0] === 'N', 'openGroup(' + i + ')', 'deleteGroup(' + i + ')') +
      '</td></tr>'
    );
  }).join('');
  $('#groupTableBody').innerHTML = n ? h : '<tr class="nodata"><td colspan="6">검색된 결과가 없습니다.</td></tr>';
  $('#groupCnt').textContent = n;
  var f = $('#groupTableBody tr.on');
  if (f) drawCodes();
  else if (n) $('#groupTableBody tr.clk').click();
  else {
    cur = -1;
    drawCodes();
  }
}
function selectGroup(i) {
  cur = i;
  [].forEach.call($('#groupTableBody').children, function (x) {
    x.classList.toggle('on', x.getAttribute('onclick') === 'selectGroup(' + i + ')');
  });
  drawCodes();
  msg('[' + G[i][1] + '] 상세코드 목록을 조회하였습니다.');
}
function drawCodes() {
  var g = G[cur],
    tb = $('#codeTableBody');
  if (!g) {
    $('#codeTit').textContent = '상세코드';
    $('#codeCnt').textContent = 0;
    tb.innerHTML = '<tr class="nodata"><td colspan="5">그룹코드를 선택하세요.</td></tr>';
    return;
  }
  $('#codeTit').textContent = '(' + g[1] + ') 상세코드';
  $('#codeCnt').textContent = g[5].length;
  var b = $('#btnOpenCodeAdd');
  b.disabled = g[0] === 'N';
  b.title = g[0] === 'N' ? 'NDMS 코드는 추가할 수 없습니다.' : '';
  tb.innerHTML = g[5].length
    ? g[5]
        .map(function (c, j) {
          return (
            '<tr><td>' +
            c[0] +
            '</td><td class="t-l">' +
            c[1] +
            '</td><td class="t-l" title="' +
            c[2] +
            '">' +
            (c[2] || '-') +
            '</td><td>' +
            yn(c[3]) +
            '</td><td>' +
            mng(g[0] === 'N', 'openCode(' + j + ')', 'deleteCode(' + j + ')') +
            '</td></tr>'
          );
        })
        .join('')
    : '<tr class="nodata"><td colspan="5">등록된 상세코드가 없습니다.</td></tr>';
}
function q(o) {
  return Object.keys(o)
    .map(function (k) {
      return k + '=' + encodeURIComponent(o[k]);
    })
    .join('&');
}
function openGroup(i) {
  if (i == null) {
    openPop('pop/UI-DA07-003-P01.html', 540);
    return;
  }
  var g = G[i];
  openPop('pop/UI-DA07-003-P01.html?' + q({ mode: 'edit', cd: g[1], nm: g[2], expln: g[3], use: g[4] }), 540);
}
function openCode(j) {
  var g = G[cur];
  if (!g) {
    alertMsg('그룹코드를 먼저 선택하세요.', { ico: 'wn' });
    return;
  }
  if (j == null) {
    openPop('pop/UI-DA07-003-P02.html?' + q({ group: g[1], gnm: g[2] }), 540);
    return;
  }
  var c = g[5][j];
  openPop(
    'pop/UI-DA07-003-P02.html?' +
      q({ mode: 'edit', group: g[1], gnm: g[2], cd: c[0], nm: c[1], expln: c[2], use: c[3] }),
    540
  );
}
function deleteGroup(i) {
  if (G[i][5].length) {
    alertMsg(
      '하위 상세코드가 있는 그룹코드는 삭제할 수 없습니다.\n상세코드 ' + G[i][5].length + '건을 먼저 삭제하세요.',
      { ico: 'wn' }
    );
    return;
  }
  confirmMsg(
    '[' + G[i][1] + '] 그룹코드를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    function () {
      var cd = G[i][1];
      G.splice(i, 1);
      cur = -1;
      loadGroupCodes();
      msg('[' + cd + '] 그룹코드가 삭제되었습니다. 작업이력에 공통코드 변경으로 기록됩니다.');
    },
    { ico: 'wn', danger: true }
  );
}
function deleteCode(j) {
  var c = G[cur][5][j];
  confirmMsg(
    '[' + c[0] + ' ' + c[1] + '] 코드를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    function () {
      G[cur][5].splice(j, 1);
      drawCodes();
      msg('[' + c[0] + '] 상세코드가 삭제되었습니다. 작업이력에 공통코드 변경으로 기록됩니다.');
    },
    { ico: 'wn', danger: true }
  );
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function () {
  cur = -1;
  loadGroupCodes();
  return true;
};
window.onPopOk = function (k, d) {
  if (!d) return;
  if (k === 'group') {
    var i = G.map(function (g) {
      return g[1];
    }).indexOf(d.cd);
    if (i > -1) {
      G[i][2] = d.nm;
      G[i][3] = d.expln;
      G[i][4] = d.use;
    } else {
      G.push(['S', d.cd, d.nm, d.expln, d.use, []]);
      i = G.length - 1;
    }
    cur = i;
    loadGroupCodes();
    drawCodes();
    msg('[' + d.cd + '] 그룹코드가 저장되었습니다. 작업이력에 공통코드 변경으로 기록됩니다.');
  }
  if (k === 'code') {
    var L = G[cur][5],
      j = L.map(function (c) {
        return c[0];
      }).indexOf(d.cd),
      r = [d.cd, d.nm, d.expln, d.use];
    if (j > -1) L[j] = r;
    else L.push(r);
    drawCodes();
    msg('[' + d.cd + '] 상세코드가 저장되었습니다. 작업이력에 공통코드 변경으로 기록됩니다.');
  }
};
document.getElementById('groupSearch').addEventListener('reset', function () {
  setTimeout(function () {
    cur = 0;
    loadGroupCodes();
  });
});
loadGroupCodes();
