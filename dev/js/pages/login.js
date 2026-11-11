/* 로그인 | 재난 예경보 통합관리시스템 */
var fail=0,MAX=5,GO='gis.html';
function $(id){return document.getElementById(id)}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){return null}}
function loginPage(){var id=store('damsUserId');if(id){$('userId').value=id;$('remember').checked=true;$('password').focus()}else $('userId').focus()}
/* 재난발생현황(GIS상황판 재난발생 샘플과 동일) */
var EVS=[
 {tm:'2026-10-30 14:50:00',cls:'자연재난 > 강풍',tit:'[강풍주의보] 울산 동구·북구·울주군 해안가 강풍주의보 발표',rg:'울산광역시 동구, 북구, 울주군',bd:'울산 동구·북구·울주군 해안가에 강풍주의보가 발표되었습니다.\n순간풍속 20m/s 이상이 예상되니 시설물 관리와 해안가 접근에 유의하시기 바랍니다.',iss:'매칭 재난발령 3건'},
 {tm:'2026-10-27 16:40:00',cls:'자연재난 > 호우',tit:'[호우경보] 충남 천안·아산 일대 호우경보 발표',rg:'충청남도 천안시, 아산시',bd:'시간당 50mm 이상의 강한 비가 내리고 있습니다.\n하천변·지하차도 출입을 자제하고 저지대 주민은 대피 준비를 하시기 바랍니다.',iss:'매칭 재난발령 3건'},
 {tm:'2026-10-27 11:30:00',cls:'사회재난 > 산불',tit:'[산불주의보] 경북 안동시·의성군 일원 산불주의보',rg:'경상북도 안동시, 의성군',bd:'건조한 날씨로 산불 위험이 높습니다.\n산림 인접지 소각 행위를 금지하고 입산 시 화기 소지를 삼가시기 바랍니다.',iss:'매칭 재난발령 2건'},
 {tm:'2026-10-16 02:14:00',cls:'자연재난 > 지진',tit:'[지진속보] 경북 포항시 북구 북쪽 8km 지역 규모 3.1 지진',rg:'경상북도 포항시, 경주시',bd:'경북 포항시 북구 북쪽 8km 지역에서 규모 3.1 지진이 발생했습니다.\n여진에 대비하여 낙하물에 주의하시기 바랍니다.',iss:'매칭 재난발령 2건'}
],ei=0;
function evShow(){var e=EVS[ei];$('evIdx').textContent=ei+1;$('evCnt').textContent=EVS.length;$('evTm').textContent=e.tm;$('evTit').textContent=e.tit;
 $('evBody').innerHTML='<b>[재난분류]</b>'+e.cls+'<b>[발생시각]</b>'+e.tm+'<b>[발생지역]</b>'+e.rg+'<b>[내용]</b>'+e.bd+'<b>[연계]</b>'+e.iss}
function evNav(d){ei=(ei+d+EVS.length)%EVS.length;evShow()}
function togglePw(b){var p=$('password'),v=p.type==='password';p.type=v?'text':'password';b.firstChild.className=v?'ri-eye-off-line':'ri-eye-line'}
function gpkiLogin(){
 pageLoading('GPKI 인증서로 로그인 중 입니다.',1300,function(){location.href=GO});
}
function login(){
 if(fail>=MAX){alertMsg('비밀번호 5회 연속 오류로 잠긴 계정입니다.\n시스템 관리자에게 문의하세요.',{ico:'dg'});return}
 if(!checkReq($('loginForm')))return;
 var id=$('userId').value.trim(),pw=$('password');
 if(pw.value==='fail'){
  fail++;pw.value='';$('fldBox').classList.add('err');$('failInfo').innerHTML='<b class="c-dg">비밀번호 오류 '+fail+' / '+MAX+'회</b>';
  if(fail>=MAX){$('lockNotice').hidden=false;alertMsg('비밀번호를 5회 잘못 입력하여 계정이 잠겼습니다.\n시스템 관리자에게 잠금 해제를 요청하세요.',{ico:'dg',code:'오류코드 : AUTH-LOCK'})}
  else alertMsg('아이디 또는 비밀번호가 일치하지 않습니다.\n(오류 '+fail+'회 / 5회 초과 시 계정 잠금)',{ico:'wn',focus:pw});
  return;
 }
 store('damsUserId',$('remember').checked?id:null);
 if(id==='dup'){confirmMsg('이미 다른 PC에서 접속 중인 계정입니다.\n기존 접속을 종료하고 로그인하시겠습니까?',function(){pageLoading('로그인 중 입니다.',1200,function(){location.href=GO})},{ico:'wn'});return}
 pageLoading('로그인 중 입니다.',1200,function(){location.href=GO});
}
$('password').addEventListener('input',function(){$('fldBox').classList.remove('err')});evShow();
loginPage();
