/* [목업 전용] localStorage('damsCertCancel'·'damsInteg')로 연계확인서 발급 취소·시도 통합 발급 상태를 화면·창 사이에 시연 — 개발 시 서버 데이터 조회로 대체 */
/* 연계기관현황 | 재난 예경보 통합관리시스템 */
/* 시도 코드(법정동 앞 2자리, 전남광주 46) · 시군구(행정안전부 직제순) — 검색 선택상자 */
/* 샘플 데이터 SDC·SGG → plat_org.data.js */
function fillSigungu(v) {
  document.getElementById('sgg_select').innerHTML =
    '<option value="">시군구 전체</option>' +
    (SGG[v] || [])
      .map(function (x) {
        return '<option>' + x + '</option>';
      })
      .join('');
  if (v) msg('선택한 시도의 시군구 목록이 설정되었습니다.');
}
document.querySelector('.sch-box').addEventListener('reset', function () {
  setTimeout(function () {
    fillSigungu('');
    FIL = ORG.slice();
    PG = 1;
    render();
  });
});
/* 시도 통합 발급: 시도 연계확인서 발급 승인 때 함께 통합 발급한 관할 시군구(자체 플랫폼 없이 시도 플랫폼으로 연계, 직제순) — 발급 승인 팝업(UI-DA09-002-P01)에서 선택 */
var INTEG = {
  울산광역시: ['북구', '울주군'],
  경기도: [
    '의정부시',
    '동두천시',
    '과천시',
    '구리시',
    '오산시',
    '의왕시',
    '하남시',
    '양주시',
    '포천시',
    '여주시',
    '연천군',
    '가평군',
    '양평군'
  ],
  충청북도: ['보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
  충청남도: ['계룡시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군']
};
var BASE = {};
Object.keys(INTEG).forEach(function (k) {
  BASE[k] = INTEG[k].slice();
});
/* 연계기관 245건(16개 시도 + 229개 시군구, 직제순): [No, 연계기관, 시도코드, 시군구, 기관코드, 운영 Y/N, 운영시작일자, 연계확인서 발급일|''(미발급)|'cancel'(발급취소)|'integoff'(통합 해제), 사용 Y/N, 계정연계 1/0]
   — 시도 통합 시군구는 시도 운영시작일자·연계확인서를 따름 */
/* 샘플 데이터 ORG → plat_org.data.js */
var FIL = ORG.slice(),
  PG = 1;
function lsGet(k) {
  try {
    return JSON.parse(localStorage.getItem(k) || '{}');
  } catch (e) {
    return {};
  }
}
function lsSet(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}
function byNm(nm) {
  for (var i = 0; i < ORG.length; i++) if (ORG[i][1] === nm) return ORG[i];
  return null;
}
function integOf(nm) {
  return INTEG[nm] && INTEG[nm].length ? INTEG[nm] : null;
}
function viaOf(nm) {
  var w = nm.split(' '),
    sd = w[0],
    sg = w.slice(1).join(' ');
  return sg && INTEG[sd] && INTEG[sd].indexOf(sg) > -1 ? sd : '';
}
function nmOf(tr) {
  return tr.cells[1].firstChild.textContent.trim();
}
var CHIP = function (nm, d) {
  return (
    '<button type="button" class="cert-chip" name="btnCertView" title="' +
    nm +
    ' 연계확인서 보기" onclick="openCert(this)"><i class="ri-file-shield-2-line"></i>연계확인서<em>' +
    d +
    '</em></button>'
  );
};
/* 담당자 샘플(기관마다 고정): 성명·소속부서(pic_ogdp_dept_nm)·직급(가칭)·연락처(기관 일반전화, DB entlno 암호화 저장) */
/* 샘플 데이터 AREA·SUR·GIV·DSD·DSG·JB → plat_org.data.js */
ORG.forEach(function (o) {
  var h = 0,
    k = o[4] + o[1];
  for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  o[10] = SUR[h % SUR.length] + GIV[(h >>> 5) % GIV.length];
  o[11] = o[3] ? DSG[(h >>> 9) % DSG.length] : DSD[(h >>> 9) % DSD.length];
  o[12] = JB[(h >>> 12) % JB.length];
  var a = o[2] === '46' && /^(동구|서구|남구|북구|광산구)$/.test(o[3]) ? '062' : AREA[o[2]] || '02';
  o[13] =
    a + '-' + (o[3] ? 200 + ((h >>> 14) % 700) : 120 + ((h >>> 14) % 80)) + '-' + String(1000 + ((h >>> 4) % 9000));
});
function certCell(o) {
  var sd = viaOf(o[1]),
    s = sd && byNm(sd);
  if (sd && s && /^\d{4}-/.test(s[7]))
    return (
      '<button type="button" class="cert-chip integ" name="btnCertView" title="' +
      sd +
      ' 연계확인서(통합 발급) 보기" onclick="openCertOf(\'' +
      sd +
      '\',this)"><i class="ri-file-shield-2-line"></i>시도 통합<em>' +
      s[7] +
      '</em></button>'
    );
  if (o[7] === 'cancel') return '<span class="cert-none" title="연계확인서 발급 취소">발급취소</span>';
  if (o[7] === 'integoff')
    return '<span class="cert-none" title="시도 통합 해제 — 자체 플랫폼 점검·발급 대기">통합 해제</span>';
  return o[7] ? CHIP(o[1], o[7]) : '<span class="cert-none">미발급</span>';
}
function rowHtml(o) {
  var q =
      'sd=' +
      o[2] +
      '&amp;sg=' +
      o[3] +
      '&amp;cd=' +
      o[4] +
      '&amp;op=' +
      o[5] +
      '&amp;use=' +
      o[8] +
      (o[10]
        ? '&amp;pic=' +
          encodeURIComponent(o[10]) +
          '&amp;dept=' +
          encodeURIComponent(o[11]) +
          '&amp;jbgd=' +
          encodeURIComponent(o[12]) +
          '&amp;tel=' +
          o[13]
        : ''),
    run = o[5] === 'Y';
  return (
    '<tr' +
    (o[3] ? '' : ' class="sd-st"') +
    (o[9] ? ' data-acnt="1"' : '') +
    '><td>' +
    o[0] +
    '</td><td class="t-l">' +
    o[1] +
    '</td><td class="lm"></td><td><span class="badge' +
    (run ? ' sc' : '') +
    '">' +
    (run ? '운영' : '미운영') +
    '</span></td><td>' +
    (run ? o[6] : '-') +
    '</td><td>' +
    certCell(o) +
    '</td><td title="' +
    (o[13] || '') +
    '">' +
    (o[10] || '-') +
    '</td><td class="t-l" title="' +
    (o[12] ? o[11] + ' ' + o[12] : '') +
    '">' +
    (o[11] || '-') +
    '</td><td><span class="badge' +
    (o[8] === 'Y' ? ' sc' : '') +
    '">' +
    o[8] +
    '</span></td>' +
    '<td><span class="op-btns flex" style="justify-content:center"><button type="button" class="btn s btn-line" name="btnDestEdit" onclick="openDest(\'edit\',\'' +
    q +
    '\')"><i class="ri-edit-line"></i>수정</button><button type="button" class="btn s btn-dg-o" name="btnDestDelete" onclick="delDest(this)"><i class="ri-delete-bin-line"></i>삭제</button></span><button type="button" class="btn s btn-line usr-btn" onclick="openDest(\'view\',\'' +
    q +
    '\')" hidden><i class="ri-file-list-3-line"></i>상세보기</button></td></tr>'
  );
}
/* 통합 발급 열: 통합 n ▾(시도 — 클릭 시 통합 시군구 툴팁) / 시도 통합(통합 발급된 시군구) / - */
function drawMethod(tr) {
  var nm = nmOf(tr),
    a = integOf(nm),
    sd = viaOf(nm),
    h = [];
  if (a && tr.querySelector('.cert-chip'))
    h.push(
      '<button type="button" class="integ-chip" title="시도 연계확인서로 통합 발급된 시군구 보기" onclick="integTip(event,\'' +
        nm +
        '\')">통합 ' +
        a.length +
        '<i class="ri-arrow-down-s-line"></i></button>'
    );
  if (sd)
    h.push(
      '<span class="lm-via" title="' +
        sd +
        ' 연계확인서로 통합 발급(자체 플랫폼 없이 시도 플랫폼으로 연계)">시도 통합</span>'
    );
  tr.cells[2].innerHTML = h.length ? h.join('<i class="lm-dot">·</i>') : '<span class="c-dis">-</span>';
}
function counts() {
  var op = FIL.filter(function (o) {
    return o[5] === 'Y';
  }).length;
  document.getElementById('cntAll').textContent = FIL.length;
  document.getElementById('cntOp').textContent = op;
  document.getElementById('cntNo').textContent = FIL.length - op;
}
function render() {
  var a = FIL,
    tb = document.getElementById('destTableBody');
  tb.innerHTML =
    a.map(rowHtml).join('') +
    '<tr class="nodata"' +
    (a.length ? ' hidden' : '') +
    '><td colspan="10">검색된 결과가 없습니다.</td></tr>';
  [].forEach.call(tb.rows, function (tr) {
    if (tr.cells[2]) drawMethod(tr);
  });
  document.getElementById('destWrap').scrollTop = 0;
  counts();
}
/* 다른 화면(연계확인서 발급 승인·발급 취소)에서 저장한 상태 반영(목업: localStorage damsInteg·damsCertCancel) */
function applySaved() {
  var I = lsGet('damsInteg'),
    C = lsGet('damsCertCancel');
  Object.keys(I).forEach(function (k) {
    var nm = k.replace(/^@/, ''),
      v = I[k],
      o = byNm(nm);
    if (k[0] !== '@') INTEG[nm] = v.sgg || [];
    if (o && v.iss) {
      o[5] = 'Y';
      if (!o[6] || o[6] === '-') o[6] = v.iss;
      o[7] = v.iss;
    }
  });
  Object.keys(C).forEach(function (nm) {
    var v = String(C[nm]).split('|'),
      o = byNm(nm);
    if (v[1] !== 'integ' && INTEG[nm]) INTEG[nm] = [];
    if (o) {
      o[5] = 'N';
      o[6] = '-';
      o[7] = v[1] === 'integ' ? 'integoff' : 'cancel';
    }
  });
  syncInteg();
}
/* 통합 상태 맞추기: 통합 시군구는 시도 운영시작일자를 따르고, 통합에서 빠진 샘플 시군구는 미운영·미발급 */
function syncInteg() {
  Object.keys(SDC).forEach(function (sd) {
    var s = byNm(sd),
      cur = INTEG[sd] || [],
      base = BASE[sd] || [];
    cur.forEach(function (g) {
      var o = byNm(sd + ' ' + g);
      if (o && s && /^\d{4}-/.test(s[7])) {
        o[5] = 'Y';
        o[6] = s[6];
        o[7] = '';
      }
    });
    base.forEach(function (g) {
      var o = byNm(sd + ' ' + g);
      if (cur.indexOf(g) < 0 && o && o[7] !== 'integoff' && o[7] !== 'cancel') {
        o[5] = 'N';
        o[6] = '-';
        o[7] = '';
      }
    });
  });
}
function integTip(e, sd) {
  e.stopPropagation();
  var o = document.getElementById('integTip');
  if (o) {
    o.remove();
    if (o.dataset.sd === sd) return;
  }
  var a = INTEG[sd],
    t = document.createElement('div');
  t.className = 'layer integ-tip';
  t.id = 'integTip';
  t.dataset.sd = sd;
  t.innerHTML =
    '<div class="layer-h">' +
    sd +
    ' 통합 발급 시군구 <b class="c-pri">' +
    a.length +
    '</b>곳<button type="button" class="close" title="닫기" onclick="this.closest(\'.integ-tip\').remove()"><i class="ri-close-line"></i></button></div><p>자체 플랫폼 없이 시도 플랫폼으로 연계 — 시도 연계확인서 발급 시 함께 발급</p><ul>' +
    a
      .map(function (g) {
        return '<li>' + g + '</li>';
      })
      .join('') +
    '</ul>';
  document.body.appendChild(t);
  var r = e.currentTarget.getBoundingClientRect();
  t.style.left = Math.min(innerWidth - t.offsetWidth - 8, r.left + scrollX) + 'px';
  t.style.top = r.bottom + scrollY + 6 + 'px';
}
document.addEventListener('click', function (e) {
  var t = document.getElementById('integTip');
  if (t && !t.contains(e.target)) t.remove();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var t = document.getElementById('integTip');
    t && t.remove();
  }
});
function openCertOf(sd, b) {
  var s = byNm(sd);
  openPop(
    'pop/UI-DA04-001-P02.html?' +
      new URLSearchParams({
        nm: sd,
        iss: b.querySelector('em').textContent,
        op: s ? s[6] : '',
        lv: 'sido',
        integ: (INTEG[sd] || []).join(','),
        hl: nmOf(b.closest('tr')).split(' ').slice(1).join(' ')
      }).toString(),
    900
  );
}
/* 연계확인서 보기: 발급 승인 시 자동 등록된 연계확인서 팝업 */
function openCert(b) {
  var tr = b.closest('tr'),
    nm = nmOf(tr),
    q = {
      nm: nm,
      iss: b.querySelector('em').textContent,
      op: tr.cells[4].textContent.trim(),
      lv: nm.indexOf(' ') > -1 ? 'sgg' : 'sido'
    };
  if (INTEG[nm]) q.integ = INTEG[nm].join(',');
  openPop('pop/UI-DA04-001-P02.html?' + new URLSearchParams(q).toString(), 900);
}
var CUR = null;
function openDest(mode, q) {
  var e = window.event,
    tr = e && e.target && e.target.closest && e.target.closest('tr'),
    c = tr && tr.querySelector('.cert-chip em');
  CUR = mode === 'new' ? null : tr;
  if (c) q += '&iss=' + c.textContent;
  else if (tr) q += '&cert=N';
  if (tr && tr.dataset.acnt) q += '&ac=1';
  if (tr && tr.cells[4].textContent.trim() !== '-') q += '&opdt=' + tr.cells[4].textContent.trim();
  if (tr) {
    var n0 = nmOf(tr);
    if (integOf(n0)) q += '&integ=' + encodeURIComponent(INTEG[n0].join(','));
    if (viaOf(n0)) q += '&via=' + encodeURIComponent(viaOf(n0));
  }
  openPop('pop/UI-DA04-001-P01.html?mode=' + mode + (q ? '&' + q : ''), 760);
}
function delDest(b) {
  var tr = b.closest('tr'),
    o = byNm(nmOf(tr));
  confirmMsg(
    '[' + nmOf(tr) + '] 연계기관을 삭제하시겠습니까?\n연계 계정 정보도 함께 삭제되며 복구할 수 없습니다.',
    function () {
      ORG.splice(ORG.indexOf(o), 1);
      FIL = FIL.filter(function (x) {
        return x !== o;
      });
      render();
      msg('삭제가 완료되었습니다.');
    },
    { ico: 'wn', danger: true }
  );
}
/* 연계확인서 발급 취소 → 연계확인서 발급(발급대상기관, 새 창 UI-DA09-001)에서 해당 기관을 발급완료 → 발급대기로(목업: localStorage damsCertCancel 공유) */
function certCancelSave(nm, integ) {
  try {
    var m = JSON.parse(localStorage.getItem('damsCertCancel') || '{}'),
      d = new Date(),
      p = function (n) {
        return String(n).padStart(2, '0');
      };
    m[nm] = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + (integ ? '|integ' : '');
    localStorage.setItem('damsCertCancel', JSON.stringify(m));
  } catch (e) {}
}
/* 등록/수정 팝업 저장 → 데이터 반영 후 목록 다시 그림(운영여부·운영시작일자·연계확인서 발급 취소·통합 해제·사용여부) */
window.onPopOk = function (k, d) {
  if (k !== 'dest') return;
  if (d && d.mode !== 'new' && CUR) {
    var o = byNm(nmOf(CUR));
    if (o) {
      o[5] = d.op;
      o[6] = d.op === 'Y' ? d.opdt : '-';
      o[8] = d.use;
      if (d.pic != null) {
        o[10] = d.pic;
        o[11] = d.dept;
        o[12] = d.jbgd;
        o[13] = d.tel;
      }
      if (d.cert === 'cancel' && d.via) {
        INTEG[d.via] = (INTEG[d.via] || []).filter(function (x) {
          return x !== o[3];
        });
        var I1 = lsGet('damsInteg');
        I1[d.via] = { sgg: INTEG[d.via], iss: (I1[d.via] && I1[d.via].iss) || '' };
        lsSet('damsInteg', I1);
        certCancelSave(o[1], 1);
        o[5] = 'N';
        o[6] = '-';
        o[7] = 'integoff';
      } else if (d.cert === 'cancel') {
        certCancelSave(o[1]);
        o[7] = 'cancel';
        var gone = INTEG[o[1]] || [];
        if (gone.length) {
          INTEG[o[1]] = [];
          var I = lsGet('damsInteg');
          I[o[1]] = { sgg: [], iss: '' };
          lsSet('damsInteg', I);
          gone.forEach(function (g) {
            var x = byNm(o[1] + ' ' + g);
            if (x) {
              x[5] = 'N';
              x[6] = '-';
              x[7] = '';
            }
          });
        }
      }
    }
  }
  render();
  msg(
    d && d.mode === 'new'
      ? '연계기관이 등록되었습니다.'
      : '연계기관 정보가 저장되었습니다.' +
          (d && d.cert === 'cancel'
            ? d.via
              ? ' (시도 통합 해제 — 연계확인서 발급 대상기관에 발급대기로 등록됩니다)'
              : ' (연계확인서 발급 취소 — 연계확인서 발급 목록에서 발급대기로 바뀝니다)'
            : '')
  );
};
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  var sd = f.sido_select,
    sdT = sd.value ? sd.options[sd.selectedIndex].text : '',
    sg = f.sgg_select.value,
    op = f.oper_select.value,
    w = f.srch_pic_nm.value.trim();
  var hit = function (o) {
    return !w || (o[10] || '').indexOf(w) > -1;
  };
  FIL = ORG.filter(function (o) {
    return (!sdT || o[1].indexOf(sdT) === 0) && (!sg || o[3] === sg) && (!op || o[5] === op) && hit(o);
  });
  PG = 1;
  render();
  msg(FIL.length ? '연계기관 목록을 조회하였습니다. (' + FIL.length + '건)' : '검색된 결과가 없습니다.');
  return false;
};
applySaved();
render();
