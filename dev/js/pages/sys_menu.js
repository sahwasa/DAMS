/* 메뉴관리 | 재난 예경보 통합관리시스템 */
/* 메뉴 기능(사용자 권한관리에서 권한 그룹별로 부여): EDT 편집(등록·수정·삭제) / DWN 다운(엑셀·PDF·CAP) */
/* 샘플 데이터 FN·FNM → sys_menu.data.js */
function fnTxt(v) {
  return v
    ? v
        .split(',')
        .map(function (k) {
          return '<span class="badge ' + (k === 'EDT' ? 'pri' : 'in') + '">' + FN[k] + '</span>';
        })
        .join(' ')
    : '-';
}
var MENUS = [];
(function () {
  var P = {
    'UI-DA02-001': '/gis/situation.do',
    'UI-DA03-001': '/warn/link-monitor.do',
    'UI-DA03-002': '/warn/occur.do',
    'UI-DA03-003': '/warn/issue.do',
    'UI-DA04-001': '/plat/org.do',
    'UI-DA04-002': '/plat/account.do',
    'UI-DA04-003': '/plat/device.do',
    'UI-DA05-001': '/stat/event.do',
    'UI-DA05-002': '/stat/device.do',
    'UI-DA06-001': '/guide/intro.do',
    'UI-DA06-002': '/guide/manual.do',
    'UI-DA06-003': '/guide/notice.do',
    'UI-DA06-004': '/guide/faq.do',
    'UI-DA07-001': '/sys/user.do',
    'UI-DA07-002': '/sys/menu.do',
    'UI-DA07-003': '/sys/code.do',
    'UI-DA07-004': '/sys/disaster.do',
    'UI-DA07-005': '/sys/auth.do',
    'UI-DA07-006': '/sys/resource.do',
    'UI-DA08-001': '/log/sms.do',
    'UI-DA08-002': '/log/access.do',
    'UI-DA08-003': '/log/job.do',
    'UI-DA08-004': '/log/dsblty.do',
    'UI-DA08-005': '/log/syslog.do',
    'UI-DA08-006': '/log/data.do',
    'UI-DA08-007': '/log/privacy.do'
  };
  DAMS_MENU.forEach(function (g, i) {
    var id = 'M' + String(i + 1).padStart(2, '0'),
      leaf = g[1].length === 1 && g[1][0][1] === g[0];
    MENUS.push({
      id: id,
      up: '-',
      nm: g[0],
      path: leaf ? P[g[1][0][0]] : '/' + P[g[1][0][0]].split('/')[1] + '/main.do',
      seq: i + 1,
      use: 'Y',
      fn: leaf ? FNM[g[1][0][0]] || '' : ''
    });
    if (!leaf)
      g[1].forEach(function (m, j) {
        MENUS.push({
          id: id + String(j + 1).padStart(2, '0'),
          up: id,
          nm: m[1],
          path: P[m[0]],
          seq: j + 1,
          use: m[0] === 'UI-DA08-007' ? 'N' : 'Y',
          fn: FNM[m[0]] || ''
        });
      });
  });
})();
function nm(id) {
  var m = MENUS.filter(function (x) {
    return x.id === id;
  })[0];
  return m ? m.nm : '-';
}
function kids(id) {
  return MENUS.filter(function (x) {
    return x.up === id;
  });
}
var $ = function (s) {
    return document.querySelector(s);
  },
  sel = null;
function drawSelect() {
  var s = $('#upMenuSelect'),
    v = s.value;
  s.innerHTML =
    '<option value="">전체</option>' +
    MENUS.filter(function (x) {
      return x.up === '-';
    })
      .map(function (x) {
        return '<option value="' + x.id + '">' + x.nm + '</option>';
      })
      .join('');
  s.value = v;
}
function ordered() {
  var o = [];
  MENUS.filter(function (x) {
    return x.up === '-';
  })
    .sort(function (a, b) {
      return a.seq - b.seq;
    })
    .forEach(function (r) {
      o.push(r);
      kids(r.id)
        .sort(function (a, b) {
          return a.seq - b.seq;
        })
        .forEach(function (c) {
          o.push(c);
        });
    });
  return o;
}
function load() {
  var up = $('#upMenuSelect').value,
    kw = $('#menuSearchKeyword').value.trim();
  var L = ordered().filter(function (x) {
      return (!up || x.id === up || x.up === up) && (!kw || x.nm.indexOf(kw) > -1);
    }),
    n = L.length,
    tb = $('#menuTableBody');
  tb.innerHTML = n
    ? L.slice(0, 15)
        .map(function (r, i) {
          var c = r.up !== '-';
          return (
            '<tr class="clk' +
            (r.id === sel ? ' on' : '') +
            '" data-id="' +
            r.id +
            '" onclick="rowClick(this)"><td><label class="chk only" onclick="event.stopPropagation()"><input type="checkbox" name="chkMenu" value="' +
            r.id +
            '" title="선택"><span class="blind">선택</span></label></td><td>' +
            (n - i) +
            '</td><td class="t-l">' +
            (c ? nm(r.up) : '-') +
            '</td><td class="t-l">' +
            (c ? '<i class="ri-corner-down-right-line" style="color:#8e8e8e"></i> ' : '<b>') +
            r.nm +
            (c ? '' : '</b>') +
            '</td><td class="t-l">' +
            r.path +
            '</td><td>' +
            fnTxt(r.fn) +
            '</td><td>' +
            r.seq +
            '</td><td><span class="badge' +
            (r.use === 'Y' ? ' sc' : '') +
            '">' +
            (r.use === 'Y' ? 'Y' : 'N') +
            '</span></td><td><button type="button" class="btn s ico btn-line" name="btnMenuEdit" title="수정" onclick="event.stopPropagation();openModal(\'' +
            r.id +
            '\')"><i class="ri-edit-line"></i></button> <button type="button" class="btn s ico btn-line" name="btnMenuDelete" title="삭제" onclick="event.stopPropagation();removeMenu(\'' +
            r.id +
            '\')"><i class="ri-delete-bin-line"></i></button></td></tr>'
          );
        })
        .join('')
    : '<tr class="nodata"><td colspan="9">검색된 결과가 없습니다.</td></tr>';
  $('#menuCnt').textContent = n;
  var p = $('#menuPaging');
  p.dataset.total = Math.max(1, Math.ceil(n / 15));
  p.dataset.page = 1;
  initPaging(p.parentNode);
  $('#chkAllMenu').checked = false;
}
function rowClick(tr) {
  sel = tr.dataset.id;
  document.querySelectorAll('#menuTableBody tr').forEach(function (x) {
    x.classList.toggle('on', x === tr);
  });
}
function checkAll(c) {
  document.querySelectorAll('[name=chkMenu]').forEach(function (x) {
    x.checked = c.checked;
  });
}
function openModal(id) {
  if (!id) {
    var c =
      sel &&
      MENUS.filter(function (x) {
        return x.id === sel;
      })[0];
    openPop('pop/UI-DA07-002-P01.html' + (c ? '?up=' + (c.up === '-' ? c.id : c.up) : ''), 540);
    return;
  }
  var m = MENUS.filter(function (x) {
    return x.id === id;
  })[0];
  openPop(
    'pop/UI-DA07-002-P01.html?mode=edit&' +
      ['id', 'up', 'nm', 'path', 'seq', 'use', 'fn']
        .map(function (k) {
          return k + '=' + encodeURIComponent(m[k]);
        })
        .join('&'),
    540
  );
}
function del(ids) {
  MENUS = MENUS.filter(function (x) {
    return ids.indexOf(x.id) < 0;
  });
  if (ids.indexOf(sel) > -1) sel = null;
  drawSelect();
  load();
}
function removeMenu(id) {
  if (kids(id).length) {
    alertMsg('하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.\n하위 메뉴를 먼저 삭제하세요.', { ico: 'wn' });
    return;
  }
  doDelete(function () {
    del([id]);
  });
}
function deleteSelected() {
  var ids = [].map.call(document.querySelectorAll('[name=chkMenu]:checked'), function (x) {
    return x.value;
  });
  if (!ids.length) {
    alertMsg('삭제할 메뉴를 선택하세요.', { ico: 'wn' });
    return;
  }
  var bad = ids.filter(function (id) {
    return kids(id).some(function (k) {
      return ids.indexOf(k.id) < 0;
    });
  });
  if (bad.length) {
    alertMsg('하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.\n(' + bad.map(nm).join(', ') + ')', { ico: 'wn' });
    return;
  }
  confirmMsg(
    '선택한 메뉴 ' + ids.length + '건을 삭제하시겠습니까?\n삭제된 메뉴는 복구할 수 없습니다.',
    function () {
      del(ids);
      msg('메뉴 ' + ids.length + '건이 삭제되었습니다.');
    },
    { ico: 'wn', danger: true }
  );
}
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function () {
  load();
  return true;
};
window.onPopOk = function (k, d) {
  if (k === 'menuDel') {
    if (kids(d.id).length) {
      alertMsg('하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.\n하위 메뉴를 먼저 삭제하세요.', { ico: 'wn' });
      return;
    }
    del([d.id]);
    msg('메뉴가 삭제되었습니다.');
    return;
  }
  if (k !== 'menu' || !d) return;
  var m = MENUS.filter(function (x) {
    return x.id === d.id;
  })[0];
  d.seq = +d.seq;
  if (m) Object.assign(m, d);
  else MENUS.push(d);
  sel = d.id;
  drawSelect();
  load();
  msg('[' + d.nm + '] 메뉴가 ' + (m ? '수정' : '등록') + '되었습니다.');
};
document.getElementById('menuSearch').addEventListener('reset', function () {
  setTimeout(function () {
    sel = null;
    load();
  });
});
drawSelect();
load();
