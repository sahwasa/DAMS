/* UI-DA04-001-P02 연계확인서 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA04-001-P02']=function(location,dlg){
/* 연계기관현황 [연계확인서]에서 기관명(nm)·발급일(iss)·운영시작일(op)·구분(lv: sido|sgg)을 넘겨받는다(목업). */
var Q=new URLSearchParams(location.search),$=function(i){return document.getElementById(i)};
var nm=Q.get('nm')||'충청남도 천안시',iss=Q.get('iss')||'2025-02-25',op=Q.get('op')||'2025-03-01',lv=Q.get('lv')||(nm.indexOf(' ')>-1?'sgg':'sido');
var d=new Date(iss),day=function(n){var x=new Date(d);x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)},from=day(15),to=day(2);
var rg=nm.split(' ').pop(),IG=(Q.get('integ')||'').split(',').filter(Boolean),HL=Q.get('hl')||'';
var NOTI=[['자연재난 > 호우','호우주의보 발령',day(14)+' 10:20',rg+' 전역'],['자연재난 > 강풍','강풍주의보 발표',day(10)+' 09:05',rg+' 해안'],['사회재난 > 미세먼지','미세먼지 주의보',day(7)+' 16:44',rg+' 전역'],['자연재난 > 폭염','폭염특보 안내',day(3)+' 10:00',rg+' 전역']];
var SRC=[['ST-'+(lv==='sido'?'SD':'SG')+'-0001',rg+' 중앙로'],['ST-'+(lv==='sido'?'SD':'SG')+'-0012',rg+' 시민로']];
var sec=function(n,t,sum,head,rows){return '<div class="sub-head"><h4>'+n+'. '+t+'</h4><span class="cnt">'+sum+'</span></div><div class="grid-wrap"><table class="grid"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'};
$('popTit').textContent='연계확인서 — '+nm;$('issInfo').textContent='(발급일 '+iss+')';
$('docArea').innerHTML='<h2>연계확인서</h2><p class="doc-sub">재난 예·경보 단말 데이터 연계 적합성 확인 · 시스템 자동 생성</p>'+
 '<table class="tbl"><colgroup><col style="width:110px"><col><col style="width:110px"><col></colgroup><tbody>'+
 '<tr><th>기관명</th><td>'+nm+' ('+(lv==='sido'?'시도':'시군구')+')</td><th>확인 기간</th><td>'+from+' ~ '+to+' (14일)</td></tr>'+
 (IG.length?'<tr><th>통합 발급<br>시군구</th><td colspan="3">'+IG.length+'곳 — '+IG.map(function(g){return g===HL?'<b class="c-pri">'+g+'</b>':g}).join(', ')+'<br><span class="f-msg mt0">자체 플랫폼 없이 '+nm+' 플랫폼으로 연계하여 본 연계확인서로 함께 발급</span></td></tr>':'')+
 '<tr><th>0. 연결상태</th><td>'+(lv==='sido'?'적합 — 접속 이력 3건':'해당없음 (시군구)')+'</td><th>1. 통보문</th><td>적합 — 총 '+NOTI.length+'건</td></tr>'+
 '<tr><th>2. 제원정보</th><td>적합 — 단말 '+SRC.length+'기</td><th>3. 상태정보</th><td>적합 — 수신율 99.6%</td></tr>'+
 '<tr><th>총괄 판정</th><td><b>발급</b></td><th>연계 시작일</th><td><b>'+op+'</b></td></tr>'+
 '<tr><th>발급일</th><td>'+iss+'</td><th>발급 승인</th><td>이점검(Admin) · 재난정보통신과</td></tr></tbody></table>'+
 sec(1,'통보문','전체 '+NOTI.length+'건 · 적합 '+NOTI.length+'건',['No','재난분류명','제목','발령시각','발령지역','판정'],NOTI.map(function(r,i){return [i+1,r[0].replace('>','&gt;'),r[1],r[2],r[3],'적합']}))+
 sec(2,'단말 제원정보','단말 '+SRC.length+'기 · 적합 '+SRC.length+'기',['No','단말 ID','설치 위치','필수 필드','코드 검사','판정'],SRC.map(function(r,i){return [i+1,r[0],r[1],'11/11','통과','적합']}))+
 '<p class="f-msg mt16">· 본 확인서는 연계 점검 결과로 자동 생성되었으며, 발급 승인 시점부터 해당 기관의 데이터는 운영 상태로 전환되었습니다.</p>';
return {};
};
DAMS_POP['UI-DA04-001-P02'].names=[];
