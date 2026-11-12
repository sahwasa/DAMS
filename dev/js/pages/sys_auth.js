/* 사용자 권한관리 | 재난 예경보 통합관리시스템 */
var AUTH=[['관리자','DAMS_ADM','시스템 관리자(행정안전부)',3,'Y',[0,1,2,3,4,5,6,7],'ALL'],
 ['운영자','DAMS_OPR01','재난정보통신과 운영자',8,'Y',[0,1,2,3,4,5,7],'ALL'],
 ['사용자','DAMS_USR01','행정안전부 중앙재난안전상황실 근무자',14,'Y',[0,1,2,3,4],['UI-DA03-003:DWN','UI-DA05-001:DWN','UI-DA05-002:DWN']],
 ['사용자','DAMS_USR02','행정안전부 재난대응정책과 사용자',53,'N',[0,1,2,3,4],['UI-DA03-003:DWN','UI-DA05-001:DWN','UI-DA05-002:DWN']],
 ['사용자','DAMS_USR03','행정안전부 자연·사회재난대응 부서 사용자',47,'N',[0,1,'UI-DA04-001','UI-DA04-003',3,4],[]],
 ['사용자','DAMS_USR04','행정안전부 기타 부서 조회 사용자',8,'N',[0,1,3,4],[]]];
/* 권한 대상 메뉴 = GNB 메뉴 + 연계확인서(새 창, GNB 우측 버튼) */
var MENU=DAMS_MENU.map(function(g){return [g[0],g[1].filter(function(m){return m[0].indexOf('-ASIS')<0})]}).concat([['연계확인서',[['UI-DA09-001','연계확인서 목록'],['UI-DA09-002','점검실행·발급승인']]]]);
/* 페이지별 기능(그 페이지에 있는 기능만): EDT 편집(등록·수정·삭제) · DWN 다운(파일 다운로드 — 엑셀·PDF·CAP 등 형식 무관) · CHK 점검 · ISS 발급·승인 */
var FN={EDT:'편집',DWN:'다운',CHK:'점검',ISS:'발급·승인'},PFN={'UI-DA04-001':['EDT'],'UI-DA04-002':['EDT'],'UI-DA04-003':['DWN'],'UI-DA03-003':['DWN'],'UI-DA05-001':['DWN'],'UI-DA05-002':['DWN'],'UI-DA06-002':['EDT'],'UI-DA06-003':['EDT'],'UI-DA06-004':['EDT'],'UI-DA07-001':['EDT'],'UI-DA07-002':['EDT'],'UI-DA07-003':['EDT'],'UI-DA07-004':['EDT'],'UI-DA07-005':['EDT'],'UI-DA07-006':['EDT'],'UI-DA08-001':['EDT'],'UI-DA08-003':['EDT'],'UI-DA08-004':['EDT'],'UI-DA09-001':['CHK','DWN'],'UI-DA09-002':['ISS','DWN']};
function fns(id){return (PFN[id]||[]).length?'<div class="fns">'+PFN[id].map(function(f){return '<label class="chk"><input type="checkbox" name="fn_yn" value="'+id+':'+f+'" data-m="'+id+'" onchange="dirty=true"><span>'+FN[f]+'</span></label>'}).join('')+'</div>':''}
var $=function(s){return document.querySelector(s)},cur=0,dirty=false;
(function(){$('#authTableBody').innerHTML=AUTH.map(function(a,i){return '<tr class="clk'+(i?'':' on')+'" onclick="selectAuth('+i+')"><td><span class="badge '+(a[0]==='관리자'?'pri':a[0]==='운영자'?'in':'')+'">'+a[0]+'</span></td><td>'+a[1]+'</td><td class="t-l" title="'+a[2]+'">'+a[2]+'</td><td class="t-r">'+a[3]+'</td></tr>'}).join('')+'<tr class="tot"><td colspan="3">합계</td><td class="t-r">'+AUTH.reduce(function(s,a){return s+a[3]},0)+'</td></tr>';
 $('#menuAuthTree').innerHTML=MENU.map(function(g,i){var leaf=g[1].length===1&&g[1][0][1]===g[0];
  return '<li><label class="chk"><input type="checkbox" data-g="'+i+'"'+(leaf?' value="'+g[1][0][0]+'" name="inq_yn"':'')+' onchange="toggleMenu(this)"><span>'+g[0]+'</span></label>'+(leaf?'':'<ul>'+g[1].map(function(m){return '<li><label class="chk"><input type="checkbox" name="inq_yn" value="'+m[0]+'" data-p="'+i+'" onchange="toggleMenu(this)"><span>'+m[1]+'</span></label>'+fns(m[0])+'</li>'}).join('')+'</ul>')+'</li>'}).join('');
 $('#menuTot').textContent=document.querySelectorAll('[name=inq_yn]').length})();
function sync(){document.querySelectorAll('#menuAuthTree [data-g]').forEach(function(p){var c=document.querySelectorAll('[data-p="'+p.dataset.g+'"]');if(!c.length)return;var n=[].filter.call(c,function(x){return x.checked}).length;p.checked=n===c.length;p.indeterminate=n>0&&n<c.length});
 $('#menuCnt').textContent=document.querySelectorAll('[name=inq_yn]:checked').length;
 document.querySelectorAll('[name=fn_yn]').forEach(function(f){var m=document.querySelector('[name=inq_yn][value="'+f.dataset.m+'"]');f.disabled=!m.checked;if(f.disabled)f.checked=false})}
function toggleMenu(el){if(el.dataset.g!=null)document.querySelectorAll('[data-p="'+el.dataset.g+'"]').forEach(function(x){x.checked=el.checked});sync();dirty=true}
function checkAllMenu(v){document.querySelectorAll('#menuAuthTree input').forEach(function(x){x.checked=v});sync();dirty=true;msg(v?'전체 메뉴를 선택하였습니다.':'전체 메뉴 선택을 해제하였습니다.')}
function draw(){var a=AUTH[cur],s=a[5];$('#authTit').textContent=a[0]+' · '+a[1];
 document.querySelectorAll('[name=inq_yn]').forEach(function(x){var g=x.dataset.p!=null?+x.dataset.p:+x.dataset.g;x.checked=s.indexOf(g)>-1||s.indexOf(x.value)>-1});
 document.querySelectorAll('[name=fn_yn]').forEach(function(f){f.checked=a[6]==='ALL'||a[6].indexOf(f.value)>-1});sync();dirty=false}
function selectAuth(i){if(i===cur)return;var go=function(){cur=i;[].forEach.call($('#authTableBody').children,function(x,k){x.classList.toggle('on',k===i)});draw();msg('['+AUTH[i][0]+' · '+AUTH[i][1]+'] 메뉴접근 권한을 조회하였습니다.')};
 if(dirty)confirmMsg('변경한 메뉴접근 권한이 저장되지 않았습니다.\n저장하지 않고 이동하시겠습니까?',go,{ico:'wn',danger:true});else go()}
function save(){var a=AUTH[cur];confirmMsg('['+a[0]+' · '+a[1]+'] 권한을 저장하시겠습니까?',function(){
 a[5]=[].map.call(document.querySelectorAll('[name=inq_yn]:checked'),function(x){return x.value});a[6]=[].map.call(document.querySelectorAll('[name=fn_yn]:checked'),function(x){return x.value});dirty=false;msg('['+a[1]+'] 메뉴접근·페이지별 기능 권한이 저장되었습니다.')})}
draw();
