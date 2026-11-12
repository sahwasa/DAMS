/* UI-DA08-006-P01 CAP 전문보기 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA08-006-P01'] = function (location, dlg) {
  var Q = new URLSearchParams(location.search),
    $id = function (i) {
      return document.getElementById(i);
    };
  var org = Q.get('org') || '울산광역시 남구',
    io = Q.get('io') || '수신',
    se = Q.get('se') || '통보문',
    dt = Q.get('dt') || '2026-10-30 14:15:31',
    id = Q.get('id') || 'KR.ULSAN-NAM-20261030141531.118',
    rs = Q.get('rs') || '성공';
  $id('v_org').textContent = org;
  $id('v_io').textContent = io;
  $id('v_se').textContent = se;
  $id('v_dt').textContent = dt;
  $id('v_id').textContent = id;
  $id('v_rs').innerHTML =
    rs === '성공'
      ? '<span class="badge sc">성공</span>'
      : '<span class="badge dg">실패</span> <span class="c-dg" style="font-size:13px">' +
        (se === '통보문'
          ? '(E102 필수항목 누락: info/area)'
          : se === '단말기제원'
            ? '(E201 좌표값 형식 오류)'
            : '(E301 응답 시간 초과)') +
        '</span>';
  var iso = dt.replace(/\//g, '-').replace(' ', 'T') + '+09:00';
  var X = {
    통보문:
      '<?xml version="1.0" encoding="UTF-8"?>\n<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">\n  <identifier>' +
      id +
      '</identifier>\n  <sender>' +
      org +
      '</sender>\n  <sent>' +
      iso +
      '</sent>\n  <status>Actual</status>\n  <msgType>Alert</msgType>\n  <scope>Public</scope>\n  <info>\n    <language>ko-KR</language>\n    <category>Met</category>\n    <event>호우경보</event>\n    <urgency>Immediate</urgency>\n    <severity>Severe</severity>\n    <certainty>Observed</certainty>\n    <headline>하천 범람 우려 대피 안내</headline>\n    <description>현재 ' +
      org +
      ' 지역에 호우경보가 발효 중입니다. 하천변·저지대 주민은 인근 대피소로 대피하여 주시기 바랍니다.</description>\n' +
      (rs === '성공'
        ? '    <area>\n      <areaDesc>' +
          org +
          '</areaDesc>\n      <geocode><valueName>LAWD_CD</valueName><value>3114000000</value></geocode>\n    </area>\n'
        : '') +
      '  </info>\n</alert>',
    단말기제원:
      '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n  <header><msgId>' +
      id +
      '</msgId><orgNm>' +
      org +
      '</orgNm><sendDt>' +
      iso +
      '</sendDt></header>\n  <deviceList count="2">\n    <device><devId>DV-0412</devId><devSe>재해문자전광판</devSe><devNm>시청 앞 교차로</devNm><lat>' +
      (rs === '성공' ? '36.7899' : 'N/A') +
      '</lat><lon>127.0018</lon><useYn>Y</useYn></device>\n    <device><devId>DV-0413</devId><devSe>자동음성통보</devSe><devNm>온천천 수위국</devNm><lat>36.7812</lat><lon>127.0102</lon><useYn>Y</useYn></device>\n  </deviceList>\n</data>',
    단말기통보결과:
      '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n  <resultCode>' +
      (rs === '성공' ? '200' : '504') +
      '</resultCode>\n  <result>\n    <capId>' +
      id +
      '</capId>\n    <orgNm>' +
      org +
      '</orgNm>\n    <total>32</total><success>' +
      (rs === '성공' ? '30' : '0') +
      '</success><fail>' +
      (rs === '성공' ? '1' : '0') +
      '</fail><noResponse>' +
      (rs === '성공' ? '1' : '32') +
      '</noResponse>\n    <resultDt>' +
      iso +
      '</resultDt>\n  </result>\n</data>'
  };
  $id('capCn').value = X[se] || X['통보문'];
  function copyCap() {
    var t = $id('capCn');
    t.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    msg('전문 내용을 클립보드에 복사하였습니다.');
  }
  return { copyCap: typeof copyCap === 'function' ? copyCap : undefined };
};
DAMS_POP['UI-DA08-006-P01'].names = ['copyCap'];
