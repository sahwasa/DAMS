/* UI-DA09-002-P02 연계 점검 부적합 결과서 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA09-002-P02']=function(location,dlg){
/* 점검실행(UI-DA09-002)·발급대상기관(UI-DA09-001)에서 쿼리 d(JSON)로 점검 결과를 넘겨받는다(목업). 단독 실행 시 청주시 샘플 */
var $=function(i){return document.getElementById(i)},esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var P=null;try{P=JSON.parse(new URLSearchParams(location.search).get('d'))}catch(e){}
P=P||{org:'청주시 (충청북도)',lv:'시군구',per:'2026-10-08 ~ 2026-10-21 (14일)',chkDt:'2026-10-22',chk:'이점검(Admin)',
 items:[['연결상태','해당없음','시군구 — NDMS 직접 연계 대상 아님'],['통보문','부적합','전체 6건 중 적합 5건 · 부적합 1건'],['단말 제원정보','적합','단말 5기 · 필수 필드 11/11 · 코드 검사 통과'],['단말 상태정보','적합','수신율 99.4% (기준 95% 이상)']],
 ng:[['통보문','[기타 > 개별단말] 개별 단말 테스트 발령 (ST-CJ-0066)','2026-10-11 14:02','발령결과 피드백 미수신']]};
var Q=new URLSearchParams(location.search);if(Q.get('org')&&!Q.get('d')){P.org=Q.get('org');if(Q.get('chkDt')&&Q.get('chkDt')!=='-'){P.chkDt=Q.get('chkDt');var e0=new Date(P.chkDt+'T00:00:00');e0.setDate(e0.getDate()-1);var s0=new Date(e0);s0.setDate(s0.getDate()-13);var f0=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};P.per=f0(s0)+' ~ '+f0(e0)+' (14일)'}if(Q.get('lv'))P.lv=Q.get('lv')}/* 목록에서 열면 기관명·점검일자만 반영(나머지는 샘플) */
/* 적합(발급완료 기관, 쿼리 ok=1): 항목 모두 적합·부적합 상세·조치 요청 없음 */
var OK=Q.get('ok')==='1';
if(OK){P.items=[['연결상태',P.lv==='시도'?'적합':'해당없음',P.lv==='시도'?'세션 유지율 100% · 재접속 0회':'시군구 — NDMS 직접 연계 대상 아님'],['통보문','적합','전체 8건 중 적합 8건'],['단말 제원정보','적합','필수 필드 11/11 · 코드 검사 통과'],['단말 상태정보','적합','수신율 99.6% (기준 95% 이상)']];P.ng=[];
 document.title='연계 점검 결과서 | 재난 예경보 통합관리시스템';$('popTit').textContent='점검 결과서';$('rH1').textContent='연계 점검 결과서(적합)';
 $('rVer').className='verdict ok';$('rVer').innerHTML='<i class="ri-checkbox-circle-line" style="font-size:20px"></i><span>총괄판정 <b>적합</b> — 모든 점검 항목이 기준을 충족하여 연계확인서를 발급하였습니다'+(Q.get('iss')?' (발급일자 '+esc(Q.get('iss'))+')':'')+'.</span>';
 $('ngArea').hidden=true;$('rNote').textContent='※ 본 결과서는 연계 점검 결과로 자동 생성됩니다.'}
var p2=function(n){return String(n).padStart(2,'0')},nw=new Date(),dt=nw.getFullYear()+'-'+p2(nw.getMonth()+1)+'-'+p2(nw.getDate());
$('rNo').textContent='재난정보통신과-'+nw.getFullYear()+p2(nw.getMonth()+1)+p2(nw.getDate())+(OK?'-OK':'-NG');$('rDate').textContent=dt;
$('rOrg').textContent=P.org;$('rLv').textContent=P.lv;$('rPer').textContent=P.per;$('rChkDt').textContent=P.chkDt;$('rChk').textContent=P.chk;
var BD={'적합':'sc','부적합':'dg','해당없음':''};
$('rItems').innerHTML=P.items.map(function(r){return '<tr'+(r[1]==='부적합'?' class="ng"':'')+'><td class="t-l">'+esc(r[0])+'</td><td><span class="badge '+BD[r[1]]+'">'+esc(r[1])+'</span></td><td class="t-l">'+esc(r[2])+'</td></tr>'}).join('');
$('rNg').innerHTML=P.ng.length?P.ng.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td>'+esc(r[0])+'</td><td class="t-l">'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td class="t-l c-dg">'+esc(r[3])+'</td></tr>'}).join(''):'<tr class="nodata"><td colspan="5">부적합 상세 내역이 없습니다.</td></tr>';
/* 부적합 항목별 조치 요청 문구 */
var REQ={'연결상태':'NDMS 연계 세션(접속·재접속) 설정을 점검하고 연결이 끊기지 않도록 조치해 주십시오.','통보문':'발령 후 발령결과(성공·실패) 피드백이 DAMS로 전송되도록 연계 프로그램 설정을 확인해 주십시오.','단말 제원정보':'단말 제원정보 필수 항목·코드값을 연계규격서 기준으로 보완해 주십시오.','단말 상태정보':'단말 상태정보가 1시간 주기로 빠짐없이 전송되도록 수집·전송 주기를 확인해 주십시오.'};
var ng=P.items.filter(function(r){return r[1]==='부적합'}).map(function(r){return r[0]});
$('rReq').innerHTML=ng.map(function(k){return '<li><b>'+esc(k)+'</b> : '+REQ[k]+'</li>'}).join('')+'<li>조치 완료 후 연계확인서 발급요청 공문을 다시 보내 주십시오. 요청한 점검기간(최대 31일, 통보문 3건 이상)으로 재점검합니다.</li>';
function printReport(){msg((OK?'':'부적합 ')+'결과서 인쇄를 시작합니다.');window.print()}
return {printReport:typeof printReport==='function'?printReport:undefined};
};
DAMS_POP['UI-DA09-002-P02'].names=["printReport"];
