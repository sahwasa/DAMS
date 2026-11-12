/* 목업 인덱스 | 재난 예경보 통합관리시스템 */
/* 샘플 데이터 REQ → index.data.js */
/* 요구사항 번호 클릭 → 행 아래에 해당 화면의 요구사항 상세(명칭·정의·세부내용) 펼침, 같은 번호 다시 클릭 시 접기 */
function esc(t) {
  return String(t).replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
  });
}
function rqOpen(b) {
  var tr = b.closest('tr'),
    nx = tr.nextElementSibling,
    on = b.classList.contains('on');
  if (nx && nx.classList.contains('rq-row')) nx.remove();
  tr.querySelectorAll('.rq').forEach(function (x) {
    x.classList.remove('on');
  });
  if (on) {
    msg('요구사항 상세를 접었습니다.');
    return;
  }
  var ids = [].map.call(tr.querySelectorAll('.rq'), function (x) {
      return x.dataset.rq;
    }),
    cur = b.dataset.rq;
  var hl = {};
  tr.querySelectorAll('.rq').forEach(function (x) {
    hl[x.dataset.rq] = (x.dataset.hl || '').split(',').filter(String).map(Number);
  });
  var ap = {};
  tr.querySelectorAll('.rq[data-ap]').forEach(function (x) {
    ap[x.dataset.rq] = x.dataset.ap;
  });
  ids.sort(function (a, c) {
    return (a !== cur) - (c !== cur);
  });
  b.classList.add('on');
  var r = document.createElement('tr');
  r.className = 'rq-row';
  r.innerHTML =
    '<td colspan="' +
    tr.children.length +
    '"><div class="rq-box">' +
    ids
      .map(function (id) {
        var q = REQ[id];
        return (
          '<div class="rq-it"><h4><span class="badge pri f">' +
          id +
          '</span>' +
          esc(q.nm) +
          '<em>' +
          esc(q.cat) +
          '</em></h4><dl>' +
          (ap[id] ? '<dt class="ap">목업 반영</dt><dd class="ap">' + esc(ap[id]) + '</dd>' : '') +
          '<dt>정의</dt><dd>' +
          esc(q.def) +
          '</dd><dt>세부내용</dt><dd class="det">' +
          q.det
            .split(String.fromCharCode(10))
            .map(function (l, i) {
              return hl[id].indexOf(i) > -1 ? '<mark>' + esc(l) + '</mark>' : esc(l);
            })
            .join(String.fromCharCode(10)) +
          '</dd></dl></div>'
        );
      })
      .join('') +
    '</div></td>';
  tr.after(r);
  msg(tr.dataset.sid + ' 관련 요구사항 ' + ids.join(', ') + ' 상세를 표시했습니다.');
}
