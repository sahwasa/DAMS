/* UI-DA03-003-P02 재난발령 보고서 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA03-003-P02']=function(location,dlg){
/* 재난발령현황에서 선택한 발령(목록 행 r + 상세 d)을 쿼리 d로 넘겨받는다(목업). 단독 실행 시 기본 샘플 */
var $=function(i){return document.getElementById(i)},esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var P=null;try{P=JSON.parse(new URLSearchParams(location.search).get('d'))}catch(e){}
P=P||{r:['울산광역시','자연재난>강풍>강풍주의보','강풍주의보 발표에 따른 시설물 안전 유의','2026-10-30 15:00:30','울산 동구'],d:{sys:'울산예경보 통합플랫폼',end:'2026-10-30 21:00:00',med:['재해문자전광판','마을방송','자동음성통보','문자방송'],board:'[울산 동구] 강풍주의보 발령\n강풍주의보 발표에 따른 시설물 안전 유의',voice:'주민 여러분께 알려드립니다. 울산 동구 지역에 강풍주의보가 발령되었습니다.',sms:'[울산광역시] 15:00 강풍주의보 발령. 행동요령을 확인 바랍니다.',
 dev:[['울산자동음성통보시스템','자동음성통보','나사등대','울산광역시 울주군 서생면','2026-10-30 15:00:41','성공',''],['울산 마을방송시스템','마을방송','화정동 경로당','울산광역시 동구 화정동','-','미수신',''],['울산 재해문자전광판시스템','재해문자전광판','방어진항','울산광역시 동구 방어동','2026-10-30 15:00:52','실패','응답시간 초과(Timeout)']]}};
var r=P.r,d=P.d,p2=function(n){return String(n).padStart(2,'0')},nw=new Date();
$('rDate').textContent=nw.getFullYear()+'-'+p2(nw.getMonth()+1)+'-'+p2(nw.getDate())+' '+p2(nw.getHours())+':'+p2(nw.getMinutes());
$('rOrg').textContent=r[0];$('rSys').textContent=d.sys;$('rCat').textContent=r[1].split('>').join(' > ');$('rRgn').textContent=r[4];
$('rTm').textContent=r[3];$('rEnd').textContent=d.end;$('rTit').textContent=r[2];$('rMed').textContent=d.med.join(', ');
var has=function(m){return d.med.indexOf(m)>-1},none='<span class="c-dis">해당 매체로 발령되지 않았습니다.</span>';
$('rBoard').innerHTML=has('재해문자전광판')?esc(d.board):none;
$('rVoice').innerHTML=has('마을방송')||has('자동음성통보')||has('자동우량경보')?esc(d.voice):none;
$('rSms').innerHTML=has('문자방송')?esc(d.sms):none;
/* 매체별 결과 요약 + 합계 */
var G={},T=[0,0,0,0];d.dev.forEach(function(x){var g=G[x[1]]=G[x[1]]||[0,0,0,0];g[0]++;T[0]++;var k=x[5]==='성공'?1:x[5]==='실패'?2:3;g[k]++;T[k]++});
var row=function(nm,a,c){return '<tr'+(c?' class="sum"':'')+'><td class="t-l">'+nm+'</td><td class="t-r">'+a[0]+'</td><td class="t-r c-sc">'+a[1]+'</td><td class="t-r'+(a[2]?' c-dg':'')+'">'+a[2]+'</td><td class="t-r">'+a[3]+'</td><td class="t-r">'+(a[0]?(a[1]/a[0]*100).toFixed(1):'0.0')+'%</td></tr>'};
$('rSum').innerHTML=Object.keys(G).map(function(k){return row(esc(k),G[k])}).join('')+row('합계',T,1);
var F=d.dev.filter(function(x){return x[5]!=='성공'});
$('rFail').innerHTML=F.length?F.map(function(x){return '<tr><td>'+esc(x[1])+'</td><td class="t-l">'+esc(x[2])+'</td><td class="t-l">'+esc(x[3])+'</td><td><span class="badge'+(x[5]==='실패'?' dg':'')+'">'+x[5]+'</span></td><td class="t-l">'+esc(x[6]||(x[5]==='미수신'?'수신 응답 없음':''))+'</td></tr>'}).join(''):'<tr class="nodata"><td colspan="5">실패·미수신 단말기가 없습니다.</td></tr>';
$('popTit').textContent='발령보고서 — '+r[2];
function printReport(){msg('발령보고서 인쇄를 시작합니다.');window.print()}
return {printReport:typeof printReport==='function'?printReport:undefined};
};
DAMS_POP['UI-DA03-003-P02'].names=["printReport"];
