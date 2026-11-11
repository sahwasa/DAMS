/* UI-DA09-001-P01 연계확인서 발급 이력 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA09-001-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),org=Q.get('org')||'대전광역시';
/* 목록에서 발급일자(iss)·점검일자(chk)를 받아 이력 생성(목업) — 기관명 해시로 일부는 재점검·재발급 이력(v1.1) */
var iss=Q.get('iss')||'2026-09-09',chk=Q.get('chk')||'2026-09-08',hv=0;org.split('').forEach(function(c){hv=(hv*31+c.charCodeAt(0))%9973});
var f0=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},ad=function(t,n){var d=new Date(t+'T00:00:00');d.setDate(d.getDate()+n);return f0(d)};
chk=ad(iss,-1);var re=hv%3===0,p1=ad(chk,-14),p2=ad(chk,-1),tm=function(n){return ('0'+(9+n%8)).slice(-2)+':'+('0'+(n*7%60)).slice(-2)+':'+('0'+(n*13%60)).slice(-2)};
var H=re?[['v1.1',iss+' '+tm(hv),'발급','재점검 적합에 따른 연계확인서 재발급','이점검(Admin)'],
          ['-',chk+' '+tm(hv+3),'재점검','점검기간 '+p1+' ~ '+p2+' · 총괄판정 적합','이점검(Admin)'],
          ['v1.0',ad(iss,-182)+' '+tm(hv+5),'발급','연계확인서 발급 승인 · 운영 상태 전환','이점검(Admin)']]
        :[['v1.0',iss+' '+tm(hv),'발급','점검기간 '+p1+' ~ '+p2+' 총괄판정 적합 · 연계확인서 발급 승인 · 운영 상태 전환','이점검(Admin)']];
document.getElementById('hFirst').textContent=H[H.length-1][1].slice(0,10);document.getElementById('hVer').textContent=H[0][0];
document.getElementById('hPeriod').textContent=p1+' ~ '+p2+' (14일'+(re?', 재점검':'')+')';document.getElementById('hCnt').textContent=H.length;
document.getElementById('hOrg').textContent=org+(org.indexOf(' ')<0?' (광역)':'');
/* 시도: 통합 발급 시군구(발급 취소·통합 해제 제외, 목록에서 integ로 전달), 통합 시군구에서 열면 hl 강조 */
var IG=(Q.get('integ')||'').split(',').filter(Boolean),HL=Q.get('hl')||'';
if(IG.length){document.getElementById('hIgRow').hidden=false;document.getElementById('hIg').innerHTML=IG.length+'곳 — '+IG.map(function(g){return g===HL?'<b class="c-pri">'+g+'</b>':g}).join(', ')+'<br><span class="f-msg mt0">자체 플랫폼 없이 '+org+' 플랫폼으로 연계하여 '+org+' 연계확인서로 함께 발급</span>'}
if(org.indexOf(' ')>-1)document.getElementById('hRes').firstElementChild.outerHTML='<span class="badge">연결상태 해당없음</span>';
document.getElementById('hBody').innerHTML=H.map(function(r,i){return '<tr><td>'+(H.length-i)+'</td><td>'+r[0]+'</td><td>'+r[1]+'</td><td><span class="badge'+(r[2]==='발급'?' sc':' pri')+'">'+r[2]+'</span></td><td class="t-l" title="'+r[3]+'">'+r[3]+'</td><td>'+r[4]+'</td><td>'+(r[0]==='-'?'-':'<button type="button" class="btn s btn-line" data-v="'+r[0]+'">PDF</button>')+'</td></tr>'}).join('');
document.getElementById('hBody').addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(b)doDown(org+' 연계확인서 '+b.dataset.v+'(PDF)')});
return {};
};
DAMS_POP['UI-DA09-001-P01'].names=[];
