/* 재난코드관리 | 재난 예경보 통합관리시스템 */
/* 대분류 [코드,명,설명,사용] / 중분류 {대분류:[[코드,명,설명,사용],..]} / 상세 {중분류:[[코드,명,사용,통보서식사용]]} */
/* 사건분류코드: 재난 예경보 통합플랫폼 연동 가이드라인 v1.5.3 별첨6(재난 사건코드 정의표) 222종 — 대분류=구분, 중분류=재난명(코드 가칭), 상세=eventCode */
var L = [
  ['T1', '자연재난', '재난코드 대분류(자연)', 'Y'],
  ['T2', '사회재난', '재난코드 대분류(사회)', 'Y'],
  ['T3', '기타재난', '지역재난·시험·재난정보', 'Y']
];
/* 대분류 [코드,명,설명,사용] / 중분류 {대분류:[[코드,명,설명,사용],..]} / 상세 {중분류:[[코드,명,사용,통보서식사용]]} */
/* 샘플 데이터 M → sys_disaster.data.js */
/* 샘플 데이터 D → sys_disaster.data.js */
var $ = function (s) {
    return document.querySelector(s);
  },
  cl = 'T1',
  cm = 'T10106';
function tgl(v, fn) {
  return (
    '<label class="tgl" onclick="event.stopPropagation()"><input type="checkbox" title="사용여부"' +
    (v === 'Y' ? ' checked' : '') +
    ' onchange="' +
    fn +
    '"></label>'
  );
}
function row(on, cells, fn) {
  return '<tr class="clk' + (on ? ' on' : '') + '" onclick="' + fn + '">' + cells + '</tr>';
}
function loadLclas() {
  $('#lclasTableBody').innerHTML = L.map(function (r, i) {
    return row(
      r[0] === cl,
      '<td>' +
        r[0] +
        '</td><td class="t-l">' +
        r[1] +
        '</td><td class="t-l">' +
        r[2] +
        '</td><td>' +
        tgl(r[3], 'updateUseYn(this,L[' + i + "],'대분류')") +
        '</td>',
      "selectLclas('" + r[0] + "')"
    );
  }).join('');
  $('#lclasCnt').textContent = L.length;
}
function drawMclas() {
  var a = M[cl] || [],
    l = L.filter(function (x) {
      return x[0] === cl;
    })[0];
  $('#mclasTit').textContent = l ? '중분류 (' + l[1] + ')' : '재난코드 중분류';
  $('#mclasCnt').textContent = a.length;
  $('#mclasTableBody').innerHTML = a.length
    ? a
        .map(function (r, i) {
          return row(
            r[0] === cm,
            '<td>' +
              r[0] +
              '</td><td class="t-l">' +
              r[1] +
              '</td><td class="t-l">' +
              r[2] +
              '</td><td>' +
              tgl(r[3], 'updateUseYn(this,M[cl][' + i + "],'중분류')") +
              '</td>',
            "selectMclas('" + r[0] + "')"
          );
        })
        .join('')
    : '<tr class="nodata"><td colspan="4">대분류를 선택하세요.</td></tr>';
}
function mName() {
  var m = (M[cl] || []).filter(function (x) {
    return x[0] === cm;
  })[0];
  return m ? m[1] : '';
}
function drawDsstr() {
  var a = cm ? (D[cm] = D[cm] || []) : null;
  $('#dsstrTit').textContent = cm ? '상세 재난코드 (' + mName() + ')' : '상세 재난코드';
  $('#dsstrCnt').textContent = a ? a.length : 0;
  $('#disasterTableBody').innerHTML = !a
    ? '<tr class="nodata"><td colspan="4">중분류를 선택하세요.</td></tr>'
    : a.length
      ? a
          .map(function (r, i) {
            return (
              '<tr><td>' +
              r[0] +
              '</td><td class="t-l">' +
              r[1] +
              '</td><td>' +
              tgl(r[2], 'updateUseYn(this,D[cm][' + i + "],'상세코드',2)") +
              '</td><td><button type="button" class="btn s ico btn-line" name="btnEdit" title="수정" onclick="openModal(' +
              i +
              ')"><i class="ri-edit-line"></i></button> <button type="button" class="btn s ico btn-line" name="btnDelete" title="삭제" onclick="deleteDisaster(' +
              i +
              ')"><i class="ri-delete-bin-line"></i></button></td></tr>'
            );
          })
          .join('')
      : '<tr class="nodata"><td colspan="4">등록된 상세 재난코드가 없습니다.</td></tr>';
}
function selectLclas(c) {
  cl = c;
  cm = null;
  loadLclas();
  drawMclas();
  drawDsstr();
  msg('[' + c + '] 중분류 목록을 조회하였습니다.');
}
function selectMclas(c) {
  cm = c;
  drawMclas();
  drawDsstr();
  msg('[' + c + ' ' + mName() + '] 상세 재난코드 목록을 조회하였습니다.');
}
function updateUseYn(el, r, lb, k) {
  k = k || 3;
  var v = el.checked;
  el.checked = !v;
  confirmMsg(
    '[' + r[0] + ' ' + r[1] + '] ' + lb + ' 사용여부를 [' + (v ? '사용' : '미사용') + ']으로 변경하시겠습니까?',
    function () {
      el.checked = v;
      r[k] = v ? 'Y' : 'N';
      msg('[' + r[0] + '] 사용여부가 ' + (v ? '사용' : '미사용') + '으로 변경되었습니다.');
    },
    v ? {} : { ico: 'wn' }
  );
}
function q(o) {
  return Object.keys(o)
    .map(function (k) {
      return k + '=' + encodeURIComponent(o[k]);
    })
    .join('&');
}
function openModal(i) {
  if (!cm) {
    alertMsg('중분류를 먼저 선택하세요.', { ico: 'wn' });
    return;
  }
  var l = L.filter(function (x) {
      return x[0] === cl;
    })[0],
    o = {
      lclas: cl + ' (' + l[1] + ')',
      mclas: cm + ' (' + mName() + ')',
      codes: D[cm]
        .map(function (x) {
          return x[0];
        })
        .join(',')
    };
  if (i != null) {
    var r = D[cm][i];
    o.mode = 'edit';
    o.cd = r[0];
    o.nm = r[1];
    o.use = r[2];
  }
  openPop('pop/UI-DA07-004-P01.html?' + q(o), 540);
}
function deleteDisaster(i) {
  var r = D[cm][i];
  confirmMsg(
    '[' + r[0] + ' ' + r[1] + '] 코드를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
    function () {
      D[cm].splice(i, 1);
      drawDsstr();
      msg('삭제가 완료되었습니다.');
    },
    { ico: 'wn', danger: true }
  );
}
window.onPopOk = function (k, d) {
  if (k !== 'disaster' || !d) return;
  var a = D[cm],
    j = a
      .map(function (x) {
        return x[0];
      })
      .indexOf(d.cd);
  if (j > -1) {
    a[j][1] = d.nm;
    a[j][2] = d.use;
  } else a.push([d.cd, d.nm, d.use, 0]);
  drawDsstr();
  msg('[' + d.cd + ' ' + d.nm + '] 상세 재난코드가 ' + (j > -1 ? '수정' : '등록') + '되었습니다.');
};
loadLclas();
drawMclas();
drawDsstr();
