/* DAMS mockup common.js — 레이아웃·탭·정렬·페이징·팝업·메시지 */
(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var inFrame=window.parent!==window;
if(inFrame&&document.body&&document.body.classList.contains('pop-only'))document.documentElement.classList.add('in-frame');
/* PC에서 연 팝업 iframe은 폭(≤900)이 모바일 기준(767) 이하라도 PC 스타일을 쓰도록 pc-pop 표시(반응형 규칙은 html:not(.pc-pop) 한정). 부모가 모바일이면 openPop이 _m=1을 붙인다 */
/* 단, 실제 팝업 폭이 설계 폭(.pop.wNNN)보다 눈에 띄게 좁아지면(창 축소 등, 최대 600 기준) 모바일 스타일로 전환 */
(function(){var h=document.documentElement;if(!h.classList.contains('in-frame')||/[?&]_m=1/.test(location.search))return;function f(){var p=document.querySelector('.pop'),m=p&&/\bw(\d+)\b/.exec(p.className),dw=m?+m[1]:900;h.classList.toggle('pc-pop',innerWidth>=Math.min(600,dw-20))}f();addEventListener('resize',f)})();
var MOBQ=window.matchMedia?matchMedia('(max-width:767px)'):{matches:false};

/* ---------- 메뉴 데이터 (전체메뉴·메뉴검색) ---------- */
var MENU=[
 ['GIS상황판',[['gis','GIS상황판']]],
 ['재난 예경보 현황',[['warn_monitor','연계현황 모니터링'],['warn_occur','재난발생현황'],['warn_issue','재난발령현황']]],
 ['통합플랫폼관리',[['plat_org','연계기관현황'],['plat_account','계정관리'],['plat_device','단말기현황']]],
 ['통계',[['stat_event','재난발령통계'],['stat_device','단말기통계']]],
 ['이용안내',[['guide_intro','시스템 소개'],['guide_manual','시스템 매뉴얼'],['guide_notice','공지사항'],['guide_faq','FAQ']]],
 ['시스템관리',[['sys_user','사용자관리'],['sys_menu','메뉴관리'],['sys_code','공통코드관리'],['sys_disaster','재난코드관리'],['sys_auth','사용자 권한관리'],['sys_resource','시스템 자원 모니터링']]],
 ['시스템 이력',[['log_sms','문자전송이력'],['log_access','시스템 사용이력'],['log_job','작업이력'],['log_dsblty','장애이력'],['log_syslog','시스템 로그'],['log_data','데이터송수신이력'],['log_privacy','개인정보 접근이력']]]
];
/* 화면ID 기준 메뉴(메뉴관리·사용자 권한관리 화면 데이터용) — 위 MENU는 파일명 기준(링크용) */
window.DAMS_MENU=[
 ['GIS상황판',[['UI-DA02-001','GIS상황판']]],
 ['재난 예경보 현황',[['UI-DA03-001','연계현황 모니터링'],['UI-DA03-002','재난발생현황'],['UI-DA03-003','재난발령현황']]],
 ['통합플랫폼관리',[['UI-DA04-001','연계기관현황'],['UI-DA04-002','계정관리'],['UI-DA04-003','단말기현황']]],
 ['통계',[['UI-DA05-001','재난발령통계'],['UI-DA05-002','단말기통계']]],
 ['이용안내',[['UI-DA06-001','시스템 소개'],['UI-DA06-002','시스템 매뉴얼'],['UI-DA06-003','공지사항'],['UI-DA06-004','FAQ']]],
 ['시스템관리',[['UI-DA07-001','사용자관리'],['UI-DA07-002','메뉴관리'],['UI-DA07-003','공통코드관리'],['UI-DA07-004','재난코드관리'],['UI-DA07-005','사용자 권한관리'],['UI-DA07-006','시스템 자원 모니터링']]],
 ['시스템 이력',[['UI-DA08-001','문자전송이력'],['UI-DA08-002','시스템 사용이력'],['UI-DA08-003','작업이력'],['UI-DA08-004','장애이력'],['UI-DA08-005','시스템 로그'],['UI-DA08-006','데이터송수신이력'],['UI-DA08-007','개인정보 접근이력']]]
];

/* ---------- 화면 버전 비교(2026-11-11, 미확정): 기본(LNB 메뉴/즐겨찾기/최근접속 탭 + MDI 탭) ↔ 넓은 화면(html.wide: LNB 메뉴만, MDI 탭·화면명 ☆ 없음) ---------- */
/* 설정값 LAYOUT_DEFAULT로 기본 버전 지정, 사용자가 고른 값은 localStorage damsLayout에 유지 */
var LAYOUT_DEFAULT='basic',LS=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
/* 게시 환경(샌드박스)에서 localStorage가 막히면 같은 탭 안 페이지 이동에도 유지되는 window.name(damsLay=…)에 함께 저장 */
var LAYQ=(/[?&]lay=(wide|basic)\b/.exec(location.search)||[])[1]||null;
function layGet(){if(LAYQ)return LAYQ;var v=LS('damsLayout');if(v)return v;var m=/(?:^|;)damsLay=(\w+)/.exec(window.name||'');return m?m[1]:null}
function laySet(v){LAYQ=v;LS('damsLayout',v);try{window.name=(window.name||'').replace(/(?:^|;)damsLay=\w+/g,'')+';damsLay='+v}catch(e){}}
if(LAYQ)laySet(LAYQ);
function isWide(){return (layGet()||LAYOUT_DEFAULT)==='wide'}
/* 화면 링크로 이동할 때 주소에 lay=… 를 붙여 새로 열린 페이지도 같은 버전 유지(저장소가 모두 막힌 환경 대비) */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target||e.defaultPrevented)return;var h=a.getAttribute('href'),v=layGet();if(!v||!/^[\w\-\/.]+\.html(\?|#|$)/.test(h))return;a.setAttribute('href',h.replace(/([?&])lay=\w+&?/,'$1').replace(/[?&]$/,'').replace(/^([^#]*?)(#.*)?$/,function(m,u,hs){return u+(u.indexOf('?')>-1?'&':'?')+'lay='+v+(hs||'')}))},true);
if(isWide()&&!(document.body&&document.body.classList.contains('pop-only')))document.documentElement.classList.add('wide');
window.setLayout=function(w){laySet(w?'wide':'basic');document.documentElement.classList.toggle('wide',!!w);if(w&&$('.lnb-tab'))lnbPanel('menu');$$('.lay-sw button').forEach(function(b){b.classList.toggle('on',(b.dataset.lay==='wide')===!!w)});closeLayers();msg(w?'넓은 화면(MDI 탭·즐겨찾기 없음)으로 전환되었습니다.':'기본 화면으로 전환되었습니다.');dispatchEvent(new Event('resize'))};
/* 즐겨찾기: 화면명 옆 ☆ 상태를 localStorage damsFav(화면ID 목록)에 유지 — LNB [즐겨찾기] 탭·모바일 메뉴 공통 */
var CUR=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
function favGet(){try{return JSON.parse(LS('damsFav')||'null')}catch(e){return null}}
function favList(){var f=favGet()||[],r=[];MENU.forEach(function(g){g[1].forEach(function(m){if(f.indexOf(m[0])>-1)r.push(m)})});return r}
function favSet(on){var f=favGet()||[],i=f.indexOf(CUR);if(on&&i<0)f.push(CUR);if(!on&&i>-1)f.splice(i,1);LS('damsFav',JSON.stringify(f))}
var FAV_EMPTY='즐겨찾기한 메뉴가 없습니다.<br>화면명 옆 ☆을 눌러 추가하세요.';
/* 현재 화면 표시: inc/header·lnb 조각은 공통이라 .on 없이 두고, 파일명(상세·쓰기 화면은 목록 화면)으로 GNB 1Depth·LNB 메뉴에 .on */
function markOn(){var b=CUR.replace(/_(view|write)$/,'');
 $$('.gnb .menu>li').forEach(function(li){var g=null,t=$('a',li).textContent.trim();MENU.forEach(function(x){if(x[0]===t)g=x});li.classList.toggle('on',!!g&&g[1].some(function(m){return m[0]===b}))});
 $$('.lnb-menu .d2>li').forEach(function(li){var a=$('a',li);li.classList.toggle('on',!!a&&a.getAttribute('href').split('?')[0]===b+'.html')})}
/* 프레임 화면에 전환 버튼 추가 */
function layInit(){
 if(!$('.mdi')||!$('.gnb .util'))return;
 var s=document.createElement('div');s.className='lay-sw';s.title='화면 버전 비교(미확정 — 목업 시연용)';
 s.innerHTML='<span>화면 버전</span><button type="button" data-lay="basic">기본</button><button type="button" data-lay="wide">넓은 화면</button>';
 s.onclick=function(e){var b=e.target.closest('button');b&&setLayout(b.dataset.lay==='wide')};document.body.appendChild(s);
 $$('button',s).forEach(function(b){b.classList.toggle('on',(b.dataset.lay==='wide')===isWide())});
 /* 저장된 즐겨찾기 상태를 화면명 ☆에 반영 */
 var st=$('.page-head .star'),f=favGet();if(st&&f){var on=f.indexOf(CUR)>-1;st.classList.toggle('on',on);$('i',st).className=on?'ri-star-fill':'ri-star-line'}
}

/* ---------- 상태바 ---------- */
/* 처리결과 메시지: 화면 상태바 없음(NDMS 시안 기준, 사용자 결정) → 브라우저 콘솔로 출력 */
function msg(t,err){(err?console.warn:console.info)('[DAMS] '+t)}
window.msg=msg;

/* ---------- 메시지창 alert / confirm ---------- */
var ICO={in:'ri-information-line',wn:'ri-error-warning-line',dg:'ri-close-circle-line',sc:'ri-checkbox-circle-line',q:'ri-question-line'};
function msgBox(o){
 if(o.code)return errBox(o);
 var d=document.createElement('div');d.className='pop-dim msg-dim';
 var k=o.ico||(o.confirm?'q':'in');
 d.innerHTML='<div class="pop msg" role="alertdialog" aria-modal="true"><div class="msg-ico '+(k==='q'?'pri':k)+'"><i class="'+ICO[k]+'"></i></div><p class="msg-txt"></p>'+(o.code?'<p class="msg-code">'+o.code+'</p>':'')+(o.detail?'<div class="msg-detail"></div>':'')+'<div class="btns">'+(o.confirm?'<button type="button" class="btn btn-line" data-r="0">취소</button>':'')+'<button type="button" class="btn btn-pri" data-r="1">확인</button></div></div>';
 $('.msg-txt',d).innerHTML=String(o.text).replace(/\n/g,'<br>');
 if(o.detail)$('.msg-detail',d).textContent=o.detail;
 popHost().appendChild(d);
 $$('[data-r]',d).forEach(function(b){b.onclick=function(){d.remove();var r=b.dataset.r==='1';if(r&&o.ok)o.ok();if(!r&&o.cancel)o.cancel();if(o.focus){var f=typeof o.focus==='string'?$(o.focus):o.focus;f&&f.focus()}}});
 $('[data-r="'+(o.confirm&&o.danger?'0':'1')+'"]',d).focus();
 return d;
}
/* 오류 메시지창(스타일가이드 1.5 Popup 2/2): 파랑 헤더 + 오류코드·오류내용 + 상세내용 펼침 */
function errBox(o){
 var d=document.createElement('div');d.className='pop-dim msg-dim';
 d.innerHTML='<div class="pop err-pop" role="alertdialog" aria-modal="true"><div class="pop-head"><h2>오류 메세지</h2><button type="button" class="close" title="닫기" data-r="1"><i class="ri-close-line"></i></button></div><div class="pop-body"><div class="er"><b>오류코드</b><div class="ro"></div></div><div class="er"><b>오류내용</b><div class="txt"></div></div>'+(o.detail?'<button type="button" class="er-more">상세내용 <i class="ri-arrow-down-s-line"></i></button><div class="er-det" hidden></div>':'')+'<div class="er-ft"><button type="button" class="btn btn-pri" data-r="1" style="min-width:72px">확인</button></div></div></div>';
 $('.ro',d).textContent=String(o.code).replace(/^오류코드\s*:\s*/,'');$('.txt',d).textContent=o.text;
 if(o.detail){$('.er-det',d).textContent=o.detail;$('.er-more',d).onclick=function(){var x=$('.er-det',d);x.hidden=!x.hidden;this.innerHTML='상세내용 <i class="ri-arrow-'+(x.hidden?'down':'up')+'-s-line"></i>'}}
 popHost().appendChild(d);
 $$('[data-r]',d).forEach(function(b){b.onclick=function(){d.remove();o.ok&&o.ok();if(o.focus){var f=typeof o.focus==='string'?$(o.focus):o.focus;f&&f.focus()}}});
 $('.er-ft .btn',d).focus();return d;
}
/* 로딩(스타일가이드 1.2 Controller 4/4): loading(문구,ms,cb) 데이터 로딩 / pageLoading(문구,ms,cb) 페이지 로딩 */
window.loading=function(t,ms,cb){var d=document.createElement('div');d.className='ld-dim';d.innerHTML='<div class="ld-box" role="status"><p>'+(t||'조회중 입니다.')+'</p><div class="ld-bar"></div></div>';popHost().appendChild(d);setTimeout(function(){d.remove();cb&&cb()},ms||500);return d};
window.pageLoading=function(t,ms,cb){var d=document.createElement('div');d.className='ld-page';d.innerHTML='<div class="ld-logo"><img src="images/gov_logo_w.png" alt="">재난 예경보 통합관리시스템</div><p>'+(t||'로그인 중 입니다.')+'</p><div class="ld-bar"></div>';document.body.appendChild(d);setTimeout(function(){cb?cb():d.remove()},ms||1200);return d};
window.alertMsg=function(text,o){o=o||{};o.text=text;return msgBox(o)};
window.confirmMsg=function(text,ok,o){o=o||{};o.text=text;o.ok=ok;o.confirm=true;return msgBox(o)};
/* 공통 가짜 동작 */
window.doSave=function(cb){confirmMsg('저장하시겠습니까?',function(){msg('저장이 완료되었습니다.');cb&&cb()})};
window.doDelete=function(cb){confirmMsg('선택한 항목을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',function(){msg('삭제가 완료되었습니다.');cb&&cb()},{ico:'wn',danger:true})};
window.doExcel=function(name){msg((name||'목록')+' 엑셀 다운로드를 시작합니다.')};
window.goBoardSystem=function(){confirmMsg('재해문자전광판 시스템으로 이동하시겠습니까?\n새 창으로 열립니다.',function(){msg('재해문자전광판 시스템을 새 창으로 엽니다. (목업: 연계 주소 협의 필요)')})};
/* 보고서 인쇄(SFR-02): 확인 후 브라우저 인쇄 — 인쇄용 CSS(common.scss 23절)가 메뉴·검색영역을 숨김 */
window.doPrint=function(name){confirmMsg((name||'보고서')+'를 인쇄하시겠습니까?\n현재 검색 조건의 목록이 인쇄됩니다.',function(){msg((name||'보고서')+' 인쇄를 시작합니다.');var w=document.querySelector('.work');if(w)w.dataset.printTitle=name||'';setTimeout(function(){window.print()},50)})};
/* 장애 알림(SFR-04): 빨간 토스트(시각, 자리 차지 없음, 15초 후 닫힘·알림 목록에 쌓임) + 경고음(청각, Web Audio). alarm(문구,{sound:true,href:'장애이력'}) */
function beep(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;var c=new A();[0,.35,.7].forEach(function(t){var o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=880;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+.2)})}catch(e){}}
window.alarm=function(t,o){o=o||{};toast(t,{kind:'alarm',cls:'dg',sub:o.href?'장애이력을 보려면 이 알림을 클릭하세요.':'',href:o.href,ms:o.ms||10000});
 if(o.sound!==false&&soundOn())beep();msg('[장애 알림] '+t+(soundOn()?'':' (경고음 꺼짐)'),true)};
/* 장애 경고음 켜기/끄기: GNB 알림 레이어 맨 위 토글(모든 화면 공통, 브라우저에 저장) */
window.soundOn=function(){try{return localStorage.getItem('damsSound')!=='off'}catch(e){return true}}
window.setSound=function(v){var i=document.querySelector('.nl-snd i');if(i)i.className=v?'ri-volume-up-line':'ri-volume-mute-line';try{localStorage.setItem('damsSound',v?'on':'off')}catch(e){}msg(v?'장애 경고음을 켰습니다.':'장애 경고음을 껐습니다.')};
/* ---------- 토스트 알림(새 재난발생·재난발령 정보 도착) ----------
   toast(제목,{kind:'occur'|'issue'}) 화면 가운데 아래, 10초 후 자동 닫힘, GNB 알림 목록에도 쌓임. 여러 건이면 위로 쌓지 않고 새 알림이 맨 앞(카드 겹침).
   알림 클릭: GIS상황판이면 새로고침, 다른 화면이면 GIS상황판으로 이동. X는 닫기 */
function toastBox(){var b=$('.toast-stack');if(!b){b=document.createElement('div');b.className='toast-stack';b.setAttribute('aria-live','polite');document.body.appendChild(b)}return b}
function toastLay(){var a=$$('.toast-stack .toast');a.reverse().forEach(function(t,i){t.style.zIndex=100-i;t.style.transform='translateY('+(-i*10)+'px) scale('+(1-i*.04)+')';t.style.opacity=i>2?0:1;t.classList.toggle('back',i>0)})}
window.toast=function(t,o){o=o||{};var d=new Date(),p2=function(n){return String(n).padStart(2,'0')};notiAdd({k:o.kind==='issue'?'발령':o.kind==='alarm'?'장애':'발생',href:o.href,t:t,tm:d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())+' '+p2(d.getHours())+':'+p2(d.getMinutes())});var b=toastBox(),el=document.createElement('div');el.className='toast'+(o.cls?' '+o.cls:'');el.setAttribute('role','status');
 el.innerHTML='<p><b></b><span>'+(o.sub!=null?o.sub:'현재 화면 새로고침 또는 GIS 상황판으로 이동하시려면<br>이 알림을 클릭하세요.')+'</span></p><button type="button" class="toast-x" title="알림 닫기"><i class="ri-close-line"></i></button>';
 $('b',el).textContent=t;b.appendChild(el);toastLay();
 var close=function(){if(!el.parentNode)return;el.classList.add('out');setTimeout(function(){el.parentNode&&el.parentNode.removeChild(el);toastLay()},200)};
 $('.toast-x',el).onclick=function(e){e.stopPropagation();close()};
 el.onclick=function(){if(o.href){location.href=o.href;return}var gis=/UI-DA02-001\.html/.test(location.pathname);if(gis)location.reload();else location.href='gis.html'};
 setTimeout(close,o.ms||10000);msg('[알림] '+t);return el};
window.doDown=function(name){msg(name+' 파일 다운로드를 시작합니다.')};
/* 차트 이미지 다운로드(목업): 파일명 = 차트명_조회조건.png (개발 시 차트 영역을 PNG로 저장) */
window.chartPng=function(n,b){var card=b&&b.closest?b.closest('.card'):null,ce=card&&card.querySelector('[data-cond]'),c=(ce||document.querySelector('[data-cond]')||{}).textContent||'',fn=n+(c?'_'+c.replace(/ · /g,'_'):'')+'.png',d=card&&card.querySelector('[_echarts_instance_]'),inst=d&&window.echarts&&echarts.getInstanceByDom(d);
 /* ECharts 차트는 실제 PNG 저장(흰 배경·2배 해상도), 그 밖(GIS 지도 등)은 목업 문구 */
 if(inst){var a=document.createElement('a');a.href=inst.getDataURL({type:'png',pixelRatio:2,backgroundColor:'#fff'});a.download=fn;document.body.appendChild(a);a.click();document.body.removeChild(a);msg(fn+' 이미지를 저장했습니다.');return}doDown(fn)};
/* 표 펼치기/접기: 제목 줄(아코디언) 클릭 — 엑셀다운로드 버튼 클릭은 제외 */
window.tglTbl=function(e,id){if(e.target.closest('.btn-dark'))return;var w=document.getElementById(id),a=document.getElementById(id+'Acc'),off=!w.hidden;w.hidden=off;a.classList.toggle('open',!off);a.querySelector('.acc-lb').textContent=off?'표 펼치기':'표 접기';msg(off?'표를 접었습니다.':'표를 펼쳤습니다.')};
/* 필수값 검사: 빈 [required] → 메시지 후 포커스 */
window.checkReq=function(scope){var e=$$('[required]',scope).filter(function(x){return !x.value.trim()})[0];if(!e)return true;var lb=e.dataset.label||e.title||'필수 항목';e.classList.add('err');alertMsg(lb+'은(는) 필수 입력 항목입니다.',{ico:'wn',focus:e});e.addEventListener('input',function(){e.classList.remove('err')},{once:true});return false};

/* ---------- 팝업 (화면 안 dialog) ----------
 팝업 마크업은 inc/pop/팝업ID.html의 <template id="pop-팝업ID">, 동작은 js/pop/팝업ID.js(DAMS_POP[팝업ID])에 둔다.
 openPop('pop/팝업ID.html?쿼리',폭) → template을 <dialog class="pop-dlg">로 띄우고 DAMS_POP[팝업ID](location,dlg)를 실행(location.search = 쿼리).
 팝업 스크립트의 함수·window 속성은 열려 있는 동안만 전역에 두고 닫을 때 원래대로 돌린다(화면 함수와 이름이 겹쳐도 됨). */
window.DAMS_POP=window.DAMS_POP||{};
function popHost(){var a=$$('dialog.pop-dlg[open]');return a.length?a[a.length-1]:document.body}
window.popHost=popHost;
function popId(url){var m=String(url).match(/UI-(?:DA\d\d-\d\d\d|CO)-P\d\d/);return m?m[0]:''}
function dlgClose(d){if(!d||d._closed)return;d._closed=1;var s=d._saved||{};Object.keys(s).forEach(function(k){if(s[k]===undefined){try{delete window[k]}catch(e){window[k]=undefined}}else window[k]=s[k]});if(d.open)d.close();d.remove()}
window.openPop=function(url,w){
 var id=popId(url),t=document.getElementById('pop-'+id);
 if(!t){alertMsg('팝업 템플릿이 없습니다. ('+id+')',{ico:'wn'});return}
 var i=String(url).indexOf('?'),q=i>-1?String(url).slice(i):'',fn=DAMS_POP[id];
 var d=document.createElement('dialog');d.className='pop-dlg';d.dataset.pop=id;d.setAttribute('aria-label',(t.content.querySelector('.pop-head h2')||{}).textContent||'팝업');
 d.appendChild(t.content.cloneNode(true));
 d._ok=window.onPopOk;d._saved={};((fn&&fn.names)||[]).forEach(function(k){d._saved[k]=window[k]});
 d.addEventListener('cancel',function(e){e.preventDefault();if($('.msg-dim',d)||$('.layer',d)||$('.tip-layer',d))return;dlgClose(d)});
 d.autofocus=true;document.body.appendChild(d);d.showModal();
 var loc={search:q,hash:'',pathname:location.pathname,get href(){return location.href},set href(v){location.href=v},assign:function(v){location.href=v},replace:function(v){location.replace(v)},reload:function(){location.reload()}};
 if(fn){var r=fn(loc,d)||{};Object.keys(r).forEach(function(k){if(r[k])window[k]=r[k]})}
 initPaging(d);sortInit(d);txaCnt();mSch();mGridInit(d);$$('form',d).forEach(function(f){f.noValidate=true});
 return d;
};
/* 닫기: 맨 위 팝업 / 확인: 연 화면(또는 팝업)의 onPopOk(key,data) 호출 후 닫기 */
window.closePop=function(){dlgClose(popHost()===document.body?null:popHost())};
window.popOk=function(key,data){var d=popHost();if(d===document.body){msg('처리가 완료되었습니다.');return}var h=d._ok;dlgClose(d);if(h)h(key,data||null)};
/* 인덱스·링크에서 ?pop=팝업ID 로 들어오면 그 팝업을 바로 연다 */
document.addEventListener('DOMContentLoaded',function(){var m=/[?&]pop=([\w-]+)/.exec(location.search);if(m&&document.getElementById('pop-'+m[1]))setTimeout(function(){openPop(m[1])},300)});
/* ---------- 레이어팝업 드래그: 팝업 제목줄(메시지창은 본문 전체)을 잡아 이동. iframe 팝업은 postMessage로 부모에 시작 좌표를 넘기고, 부모가 화면 전체 덮개로 이동을 처리(모바일 전체화면 팝업 제외) */
var DRG=null;
/* 이동 계산: 시작 화면좌표(sx,sy) 대비 이동량, 제목줄이 화면 밖으로 나가지 않게 제한 */
function dragStart(el,sx,sy){if(!el)return null;var b=(el.dataset.drag||'0,0').split(',').map(Number),r=el.getBoundingClientRect(),d=[b[0],b[1]];
 return {mv:function(e){var dx=e.screenX-sx,dy=e.screenY-sy;dx=Math.max(-r.left-r.width+80,Math.min(innerWidth-r.left-80,dx));dy=Math.max(-r.top,Math.min(innerHeight-r.top-40,dy));d=[b[0]+dx,b[1]+dy];el.style.transform='translate('+d[0]+'px,'+d[1]+'px)'},up:function(){el.dataset.drag=d.join(',')}}}
/* 같은 문서 안의 레이어(메시지창) 드래그 */
function dragEl(el,sx,sy){if(!el||MOBQ.matches)return;var g=dragStart(el,sx,sy),mv=function(e){g.mv(e)},up=function(){g.up();removeEventListener('mousemove',mv);removeEventListener('mouseup',up)};
 addEventListener('mousemove',mv);addEventListener('mouseup',up)}
window.dragEl=dragEl;
document.addEventListener('mousedown',function(e){if(e.button!==0||(MOBQ.matches&&!document.documentElement.classList.contains('pc-pop')))return;var t=e.target;if(t.closest('button,a,input,select,textarea,label'))return;
 var h=t.closest('.pop-head'),dg=t.closest('dialog.pop-dlg');
 if(dg&&h&&!t.closest('.msg-dim')){e.preventDefault();dlgDrag(dg,e);return}
 var p=t.closest('.msg-dim .pop');if(p&&(h||p.classList.contains('msg'))){e.preventDefault();dragEl(p,e.screenX,e.screenY)}});
/* 화면 안 팝업(dialog) 끌어 옮기기: 제목줄을 잡고 이동, 제목줄이 화면 밖으로 나가지 않게 */
function dlgDrag(d,e){var r=d.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;d.style.margin='0';d.style.left=r.left+'px';d.style.top=r.top+'px';
 var mv=function(ev){d.style.left=Math.max(80-r.width,Math.min(innerWidth-80,ev.clientX-ox))+'px';d.style.top=Math.max(0,Math.min(innerHeight-40,ev.clientY-oy))+'px'},up=function(){removeEventListener('mousemove',mv);removeEventListener('mouseup',up)};addEventListener('mousemove',mv);addEventListener('mouseup',up)}
window.popResize=function(){};

/* ---------- 레이어 (전체메뉴/메뉴검색/알림/툴팁) ---------- */
function closeLayers(ex){$$('.layer').forEach(function(l){if(l!==ex)l.remove()})}
function menuLayer(focus){
 var l=$('.mlayer');if(l){l.remove();return}
 l=document.createElement('div');l.className='layer mlayer';
 l.innerHTML='<div class="layer-h"><i class="ri-apps-line"></i>전체메뉴<span class="inp-ico" style="width:260px;margin-left:12px"><input class="inp" placeholder="메뉴명 검색" title="메뉴검색"><i class="ri-search-line"></i></span><button type="button" class="close" title="닫기"><i class="ri-close-line"></i></button></div><div class="layer-b"></div>';
 $('.gnb').appendChild(l);
 var draw=function(q){var h='';MENU.forEach(function(g){var it=g[1].filter(function(m){return !q||m[1].indexOf(q)>-1});if(it.length)h+='<dl><dt>'+g[0]+'</dt>'+it.map(function(m){return '<dd><a href="'+m[0]+'.html">'+(q?m[1].replace(q,'<mark>'+q+'</mark>'):m[1])+'</a></dd>'}).join('')+'</dl>'});$('.layer-b',l).innerHTML=h||'<p class="nodata">검색된 메뉴가 없습니다.</p>'};
 draw('');var i=$('input',l);i.oninput=function(){draw(i.value.trim())};i.onkeydown=function(e){if(e.key==='Enter'){var a=$('.layer-b a',l);a&&(location.href=a.href)}};
 $('.close',l).onclick=function(){l.remove()};closeLayers(l);if(focus)i.focus();
}
/* 알림 목록: 토스트로 받은 알림을 세션에 쌓아(최신 순) GNB 알림 레이어 맨 위에 표시 */
function notiGet(){try{return JSON.parse(sessionStorage.getItem('damsNoti')||'[]')}catch(e){return []}}
function notiAdd(o){var a=notiGet();a.unshift(o);try{sessionStorage.setItem('damsNoti',JSON.stringify(a.slice(0,20)))}catch(e){}
 var g=$('.gnb [title="알림"]');if(g&&!$('.badge',g))g.insertAdjacentHTML('beforeend','<span class="badge"></span>');var l=$('.nlayer .layer-b');if(l)l.insertAdjacentHTML('afterbegin',notiItems([o]))}
function notiItems(a){return (a||notiGet()).map(function(n){return '<li class="new"><a href="'+(n.href||'gis.html')+'">['+n.k+'] '+n.t+'<em>'+n.tm+'</em></a></li>'}).join('')}
function notiLayer(){
 var l=$('.nlayer');if(l){l.remove();return}
 l=document.createElement('div');l.className='layer nlayer';
 l.innerHTML='<div class="layer-h"><i class="ri-notification-3-line"></i>알림<button type="button" class="close" title="닫기"><i class="ri-close-line"></i></button></div><div class="nl-snd"><span><i class="'+(soundOn()?'ri-volume-up-line':'ri-volume-mute-line')+'"></i>장애 경고음<em>장애·오류 발생 시 소리로 알림</em></span><label class="tgl" title="장애 경고음 켜기/끄기"><input type="checkbox" id="nlSound"'+(soundOn()?' checked':'')+' onchange="setSound(this.checked)"><span class="blind">장애 경고음</span></label></div><ul class="layer-b">'+notiItems()+'<li><a href="log_dsblty.html">[장애] 충남 아산시 연계서버 응답 지연<em>2026-10-27 16:50</em></a></li><li><a href="warn_issue.html">[발령] 천안시 원성천 하천범람 대피 긴급방송<em>2026-10-27 16:42</em></a></li><li><a href="guide_notice.html">[공지] 11월 정기 점검 안내<em>2026-10-26 09:00</em></a></li></ul>';
 $('.gnb').appendChild(l);$('.close',l).onclick=function(){l.remove()};closeLayers(l);
 var b=$('.gnb [title="알림"] .badge');b&&b.remove();
}
/* 비밀번호 보기/숨기기(.inp-ico 안 눈 아이콘 버튼) · 자동생성(영문 대·소문자·숫자·특수문자 포함 12자) */
/* 날짜 입력은 브라우저 기본 date 입력(type="date", 값 YYYY-MM-DD) — 2026-11-10 사용자 결정 */
window.pwEye=function(b,show){var i=b.parentNode.querySelector('.inp'),on=show==null?i.type==='password':show;i.type=on?'text':'password';b.title=on?'비밀번호 숨기기':'비밀번호 보기';b.innerHTML='<i class="ri-eye'+(on?'-off':'')+'-line"></i>'}
window.pwGen=function(n){n=n||12;var S=['ABCDEFGHJKLMNPQRSTUVWXYZ','abcdefghijkmnpqrstuvwxyz','23456789','!@#$%^&*'],A=S.join(''),r=function(m){var a=new Uint32Array(1);(window.crypto||{getRandomValues:function(x){x[0]=Math.random()*4294967296;return x}}).getRandomValues(a);return a[0]%m},p=S.map(function(s){return s[r(s.length)]});
 while(p.length<n)p.push(A[r(A.length)]);for(var i=p.length-1;i>0;i--){var j=r(i+1),t=p[i];p[i]=p[j];p[j]=t}return p.join('')}
function tip(el){
 var t=$('.tip-layer');if(t){var same=t._el===el;t.remove();if(same)return}
 t=document.createElement('div');t.className='tip-layer';t.textContent=el.dataset.tip;t._el=el;var H=popHost();H.appendChild(t);
 var r=el.getBoundingClientRect(),o=H===document.body?{left:-scrollX,top:-scrollY}:H.getBoundingClientRect();t.style.left=(r.left-o.left)+'px';t.style.top=(r.bottom-o.top+4)+'px';
}

/* ---------- 페이징 ---------- */
function paging(p){
 var tot=+p.dataset.total||1,cur=+p.dataset.page||1;
 var b=function(k,ico,t,dis){return '<button type="button" data-pg="'+k+'" title="'+t+'"'+(dis?' class="dis"':'')+'><i class="'+ico+'"></i></button>'};
 var s=Math.floor((cur-1)/10)*10+1,e=Math.min(s+9,tot),h=b('first','ri-skip-left-line','처음',cur===1)+b('prev','ri-arrow-left-s-line','이전',cur===1);
 for(var i=s;i<=e;i++)h+=i===cur?'<strong>'+i+'</strong>':'<button type="button" data-pg="'+i+'">'+i+'</button>';
 p.innerHTML=h+b('next','ri-arrow-right-s-line','다음',cur===tot)+b('last','ri-skip-right-line','마지막',cur===tot);
}
window.initPaging=function(scope){$$('.paging[data-total]',scope).forEach(paging)};

/* ---------- 탭 ---------- */
window.showTab=function(btn){
 var li=btn.closest('li'),ul=li.parentNode;
 $$(':scope>li',ul).forEach(function(x){x.classList.toggle('on',x===li);var b=$('[data-tab]',x);if(b){var p=document.getElementById(b.dataset.tab);p&&(p.hidden=x!==li)}});
 if(window.onTab)window.onTab(btn.dataset.tab);
};

/* ---------- 목록 정렬 헤더(th.sort) ----------
 퍼블 범위: 정렬 상태 표시(.asc/.desc 화살표 + aria-sort)·키보드 조작(Tab 이동, Enter/Space)까지.
 실제 데이터 정렬은 개발에서 서버 정렬(ORDER BY, 1페이지부터 다시 조회)로 구현 — window.onSort(키, 방향, th) 연결점 제공.
 키 = th의 data-sort(개발 시 DB 컬럼명 지정), 없으면 열 제목. 방향 = 'asc' | 'desc'. */
function sortInit(sc){$$('.grid thead th.sort',sc).forEach(function(th){if(th._si)return;th._si=1;th.tabIndex=0;
 th.setAttribute('aria-sort',th.classList.contains('asc')?'ascending':th.classList.contains('desc')?'descending':'none');
 if(!th.title)th.title=th.textContent.trim()+' 정렬'})}
window.sortInit=sortInit;
function sortCol(th){var d=th.classList.contains('asc')?'desc':'asc',k=th.dataset.sort||th.textContent.trim();
 $$('th.sort',th.closest('thead')).forEach(function(x){x.classList.remove('asc','desc');x.setAttribute('aria-sort','none')});
 th.classList.add(d);th.setAttribute('aria-sort',d==='asc'?'ascending':'descending');
 if(window.onSort&&window.onSort(k,d,th)===false)return;
 msg(th.textContent.trim()+(d==='asc'?' 오름차순':' 내림차순')+'으로 정렬되었습니다. (정렬 키: '+k+')')}
window.sortCol=sortCol;
document.addEventListener('keydown',function(e){var th=e.target.closest&&e.target.closest('.grid thead th.sort');if(th&&(e.key==='Enter'||e.key===' ')){e.preventDefault();sortCol(th)}});

/* ---------- 웹접근성: 건너뛰기 링크·스크롤 영역 포커스 ----------
 건너뛰기 링크 대상이 숨겨져 있으면(LNB 접힘·태블릿/모바일 햄버거 메뉴) 햄버거 버튼 → 없으면 본문으로.
 스크롤 영역(overflow auto/scroll이고 실제로 넘치는 요소) 중 안에 포커스 가능한 요소가 없으면 tabindex=0(+aria-label)을 붙여
 키보드로 선택해 방향키로 스크롤할 수 있게 함(KWCAG 키보드 사용 보장, axe scrollable-region-focusable). 넘치지 않게 되면 다시 뺌. */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.skip a');if(!a)return;var t=document.querySelector(a.getAttribute('href'));
 if(t&&t.getClientRects().length&&getComputedStyle(t).visibility!=='hidden')return;e.preventDefault();var h=document.querySelector('.m-ham')||document.getElementById('content');if(h){h.focus();if(h.scrollIntoView)h.scrollIntoView({block:'nearest'})}});
var FOC='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),summary,iframe';
function sfLabel(el){var h=el.getAttribute('aria-label');if(h)return h;var c=el.closest('section,.card,.mon-box,.pop')||el.parentNode,t=c&&c.querySelector('h2,h3,h4,.card-h,caption');return t?t.textContent.replace(/\s+/g,' ').trim().slice(0,40)+' 영역':'스크롤 영역'}
function scrollFocus(){$$('body *').forEach(function(el){if(el.closest('.skip,svg'))return;var cs=getComputedStyle(el),oy=/auto|scroll/.test(cs.overflowY),ox=/auto|scroll/.test(cs.overflowX);
  var sc=(oy&&el.scrollHeight>el.clientHeight+1)||(ox&&el.scrollWidth>el.clientWidth+1);
  if(sc&&!el.hasAttribute('tabindex')&&!el.querySelector(FOC)&&el.getClientRects().length){el.setAttribute('tabindex','0');el.setAttribute('data-sf','');if(!el.hasAttribute('aria-label')){el.setAttribute('aria-label',sfLabel(el));el.setAttribute('data-sf-l','')}}
  else if(!sc&&el.hasAttribute('data-sf')){el.removeAttribute('tabindex');el.removeAttribute('data-sf');if(el.hasAttribute('data-sf-l')){el.removeAttribute('aria-label');el.removeAttribute('data-sf-l')}}})}
window.scrollFocus=scrollFocus;
var sfT;function sfLater(){clearTimeout(sfT);sfT=setTimeout(scrollFocus,250)}
window.addEventListener('resize',sfLater);window.addEventListener('load',sfLater);
document.addEventListener('DOMContentLoaded',function(){if(window.MutationObserver)new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(ms[i].type==='childList'||!(t.hasAttribute&&t.hasAttribute('data-sf'))){sfLater();return}}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style','open']})});

/* ---------- 이벤트 위임 ---------- */
document.addEventListener('click',function(e){
 var t=e.target,c;
 if(!t.closest('.layer')&&!t.closest('[data-layer]'))closeLayers();
 if(!t.closest('[data-tip]')){var tl=$('.tip-layer');tl&&tl.remove()}
 if((c=t.closest('[data-tab]'))&&c.closest('.tab,.tab-s,.tab-v')){showTab(c);return}
 if((c=t.closest('[data-tip]'))){e.preventDefault();tip(c);return}
 if((c=t.closest('[data-layer]'))){e.preventDefault();c.dataset.layer==='noti'?notiLayer():menuLayer(c.dataset.layer==='search');return}
 if((c=t.closest('.lnb-menu .fav'))){e.preventDefault();e.stopPropagation();c.classList.toggle('on');c.classList.toggle('ri-star-fill');c.classList.toggle('ri-star-line');var a=c.parentNode;msg(a.textContent.trim()+(c.classList.contains('on')?' 즐겨찾기에 추가되었습니다.':' 즐겨찾기에서 해제되었습니다.'));if($('.lnb-tab .on')&&$('.lnb-tab .on').dataset.lnb==='fav')lnbPanel('fav');return}
 if((c=t.closest('.page-head .star'))){var on=c.classList.toggle('on');$('i',c).className=on?'ri-star-fill':'ri-star-line';favSet(on);if($('.lnb-tab .on')&&$('.lnb-tab .on').dataset.lnb==='fav')setTimeout(function(){lnbPanel('fav')});var lf=$('.lnb-menu li.on .fav');if(lf&&lf.classList.contains('on')!==on)lf.click();else msg(on?'즐겨찾기에 추가되었습니다.':'즐겨찾기에서 해제되었습니다.');return}
 if((c=t.closest('.lnb-menu .has>a'))){e.preventDefault();c.parentNode.classList.toggle('open');return}
 if((c=t.closest('.lnb-tab button'))){lnbPanel(c.dataset.lnb);return}
 if((c=t.closest('.lnb-fold'))){document.body.classList.toggle('lnb-off');return}
 if((c=t.closest('.grid thead th.sort'))){sortCol(c);return}
 if((c=t.closest('.paging [data-pg]'))){var p=c.closest('.paging'),tot=+p.dataset.total||1,cur=+p.dataset.page||1,k=c.dataset.pg;p.dataset.page=k==='first'?1:k==='last'?tot:k==='prev'?Math.max(1,cur-1):k==='next'?Math.min(tot,cur+1):k;paging(p);if(window.onPage)window.onPage(+p.dataset.page,p);msg(p.dataset.page+' 페이지를 조회하였습니다.');return}
 if((c=t.closest('.sch-toggle'))){var o=c.closest('.sch-box').classList.toggle('open');c.innerHTML='<i class="ri-arrow-'+(o?'up':'down')+'-s-fill"></i>';c.title=o?'상세조건 닫기':'상세조건 열기';return}
 if((c=t.closest('.box-fold .fold-btn'))){c.closest('.box-fold').classList.toggle('closed');return}
 if((c=t.closest('.mdi-tabs li>button'))){var li=c.parentNode,nx=li.classList.contains('on')&&(li.nextElementSibling||li.previousElementSibling);li.remove();if(nx)location.href=$('a',nx).href;return}
 if((c=t.closest('.mdi-ctrl button'))){var on2=$('.mdi-tabs li.on'),k2=c.dataset.mdi;if(k2==='all'){$$('.mdi-tabs li:not(.on)').forEach(function(x){x.remove()});msg('현재 화면을 제외한 탭을 닫았습니다.')}else{var s=on2&&(k2==='prev'?on2.previousElementSibling:on2.nextElementSibling);s?location.href=$('a',s).href:msg(k2==='prev'?'첫 번째 탭입니다.':'마지막 탭입니다.')}return}
 if((c=t.closest('.gnb .sess button'))){sess=3600;msg('세션 시간이 연장되었습니다.');return}
 if((c=t.closest('.gnb .fsz button'))){fsz=Math.max(80,Math.min(130,fsz+(c.dataset.fsz==='up'?10:-10)));document.body.style.zoom=fsz/100;$('.gnb .fsz-v').textContent=fsz+'%';return}
 if((c=t.closest('[data-logout]'))){e.preventDefault();confirmMsg('로그아웃 하시겠습니까?',function(){location.href=c.getAttribute('href')});return}
 if((c=t.closest('[data-help]'))){e.preventDefault();alertMsg('['+document.title.split('|')[0].trim()+'] 화면 도움말\n검색조건을 지정한 뒤 [검색]을 누르면 목록이 조회됩니다.');return}
});
document.addEventListener('change',function(e){if(e.target.matches('.grid-top .sel'))msg('목록 노출 건수가 '+e.target.value+'건으로 변경되었습니다.')});
document.addEventListener('submit',function(e){var f=e.target;if(!f.matches('.sch-box'))return;e.preventDefault();if(!checkReq(f))return;loading('조회중 입니다.',450,function(){if(window.onSearch&&window.onSearch(f)===false)return;msg('조회가 완료되었습니다.')})});
document.addEventListener('reset',function(e){if(e.target.matches('.sch-box'))setTimeout(function(){msg('검색조건이 초기화되었습니다.')})});
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;var m=$$('.msg-dim').pop();if(m){m.remove();return}if($('.layer')){closeLayers();return}});

/* ---------- LNB 패널 (메뉴/즐겨찾기/최근접속) ---------- */
function lnbPanel(k){
 $$('.lnb-tab button').forEach(function(b){b.classList.toggle('on',b.dataset.lnb===k)});
 var m=$('.lnb-menu .d2'),x=$('.lnb-menu .lnb-alt');if(!m)return;
 if(!x){x=document.createElement('ul');x.className='d2 lnb-alt';m.parentNode.appendChild(x)}
 m.hidden=k!=='menu';x.hidden=k==='menu';
 $('.lnb-tit').textContent=k==='menu'?$('.lnb-tit').dataset.t:k==='fav'?'즐겨찾기':'최근접속';
 if(k==='fav'){x.innerHTML=favList().map(function(m){return '<li'+(m[0]===CUR?' class="on"':'')+'><a href="'+m[0]+'.html">'+m[1]+'</a></li>'}).join('')||'<li class="lnb-empty">'+FAV_EMPTY+'</li>'}
 if(k==='recent')x.innerHTML=$$('.mdi-tabs li a').map(function(a){return '<li><a href="'+a.getAttribute('href')+'">'+a.textContent+'</a></li>'}).join('');
}

/* ---------- 세션 타이머 ---------- */
var sess=3550,fsz=100;
function tick(){var s=$('.gnb .sess b');if(!s)return;sess=Math.max(0,sess-1);s.textContent=String(Math.floor(sess/60)).padStart(2,'0')+':'+String(sess%60).padStart(2,'0')}

/* 글자수 표시(스타일가이드 1.2 Controller 1/4): maxlength 있는 .txa 아래 "n / max" 자동 추가(화면에 .f-cnt가 이미 있으면 생략) */
function txaCnt(){$$('.txa[maxlength]:not([readonly]):not(:disabled)').forEach(function(t){if(t._cnt||$('.f-cnt',t.parentNode))return;var c=document.createElement('span');c.className='f-cnt auto';c.innerHTML='<b>'+t.value.length+'</b> / <em>'+(+t.maxLength).toLocaleString()+'</em>';t.after(c);t._cnt=c;t.addEventListener('input',function(){$('b',c).textContent=t.value.length.toLocaleString()})})}
/* ---------- 반응형(모바일 UI 표준정의서·화면정의서 7p) ---------- */
/* 모바일 헤더: 로고 · 화면명+☆ · 햄버거 */
function mHead(){
 var g=$('.gnb');if(!g||$('.m-ham',g))return;
 var lg=$('.logo a',g);if(lg)[].slice.call(lg.childNodes).forEach(function(n){if(n.nodeType===3&&n.textContent.trim()){var sp=document.createElement('span');sp.className='lt';sp.textContent=n.textContent;lg.replaceChild(sp,n)}});
 var pt=$('.page-head .tit'),ps=$('.page-head .star');
 if(pt){var t=document.createElement('div');t.className='m-tit m-only';t.innerHTML='<span></span>'+(ps?'<button type="button" class="star" title="즐겨찾기"><i></i></button>':'');$('span',t).textContent=pt.childNodes[0].textContent.trim();g.insertBefore(t,$('.menu',g));
  var sync=function(){var b=$('.star',t);if(b){b.classList.toggle('on',ps.classList.contains('on'));$('i',b).className=ps.classList.contains('on')?'ri-star-fill':'ri-star-line'}};sync();
  if(ps){$('.star',t).onclick=function(){ps.click();sync()};ps.addEventListener('click',function(){setTimeout(sync)})}}
 var h=document.createElement('button');h.type='button';h.className='m-ham';h.title='전체메뉴';h.innerHTML='<i class="ri-menu-line"></i>';h.onclick=mNav;g.appendChild(h);
}
/* 햄버거 전체 화면 메뉴: 사용자 정보·로그아웃·닫기 / 연계확인서 발급 / 메뉴 검색 / 메뉴·즐겨찾기 탭 / 2단 메뉴(1Depth 왼쪽, 2Depth 오른쪽) */
function mNav(){
 var u=$('.gnb .user'),lo=$('.gnb [data-logout]'),ce=$('.gnb .util a[href*="UI-DA09-001"]'),cur=location.pathname.split('/').pop(),gi=0;
 MENU.forEach(function(g,i){g[1].forEach(function(m){if(m[0]+'.html'===cur)gi=i})});
 var d=document.createElement('div');d.className='mnav';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
 d.innerHTML='<div class="mnav-h"><b>'+(u?u.childNodes[0].textContent.replace(/\s*님\s*$/,'').trim()+' 님':'')+'</b><em>'+(u&&$('em',u)?$('em',u).textContent.replace(/[()]/g,''):'')+'</em>'+(lo?'<a class="out" href="'+lo.getAttribute('href')+'" data-logout><i class="ri-logout-box-r-line"></i>로그아웃</a>':'')+'<button type="button" class="close" title="닫기"><i class="ri-close-line"></i></button></div>'
  +(ce?'<a class="mnav-cert" href="'+ce.getAttribute('href')+'">연계확인서 발급<i class="ri-arrow-right-s-line"></i></a>':'')
  +'<div class="mnav-sch"><span class="inp-ico"><input class="inp" placeholder="메뉴명을 입력하세요" title="메뉴 검색"><i class="ri-search-line"></i></span></div>'
  +'<div class="mnav-tab"><button type="button" class="on" data-k="menu">메뉴</button><button type="button" data-k="fav">즐겨찾기</button></div><div class="mnav-b"><div class="mnav-d1"></div><div class="mnav-d2"></div></div>';
 document.body.appendChild(d);document.body.style.overflow='hidden';
 var d1=$('.mnav-d1',d),d2=$('.mnav-d2',d),inp=$('.mnav-sch input',d),k='menu';
 var lk=function(m,q){return '<a href="'+m[0]+'.html"'+(m[0]+'.html'===cur?' class="on"':'')+'>'+(q?m[1].replace(q,'<mark>'+q+'</mark>'):m[1])+'</a>'};
 var draw=function(){var q=inp.value.trim();
  if(k==='fav'){d1.hidden=true;var fl=favList();d2.innerHTML=fl.length?fl.map(function(m){return lk(m)}).join(''):'<p class="nodata">'+FAV_EMPTY+'</p>';return}
  if(q){d1.hidden=true;var h='';MENU.forEach(function(g){g[1].forEach(function(m){if(m[1].indexOf(q)>-1)h+=lk(m,q)})});d2.innerHTML=h||'<p class="nodata">검색된 메뉴가 없습니다.</p>';return}
  d1.hidden=false;d1.innerHTML=MENU.map(function(g,i){return '<button type="button" data-i="'+i+'"'+(i===gi?' class="on"':'')+'>'+g[0]+'</button>'}).join('');
  d2.innerHTML=MENU[gi][1].map(function(m){return lk(m)}).join('')};
 draw();
 d1.onclick=function(e){var b=e.target.closest('button');if(!b)return;gi=+b.dataset.i;draw()};
 inp.oninput=draw;$('.mnav-tab',d).onclick=function(e){var b=e.target.closest('button');if(!b)return;k=b.dataset.k;$$('.mnav-tab button',d).forEach(function(x){x.classList.toggle('on',x===b)});draw()};
 $('.close',d).onclick=function(){d.remove();document.body.style.overflow=''};
}
window.mNav=mNav;
/* 검색영역: 모바일 접이식 검색필터 */
function mSch(){$$('.sch-box').forEach(function(f){if($('.sch-mtog',f))return;var b=document.createElement('button');b.type='button';b.className='sch-mtog';b.innerHTML='<i class="ri-equalizer-line"></i>검색조건';b.onclick=function(){f.classList.toggle('m-open')};f.insertBefore(b,f.firstChild)})}
/* 그리드: 단순 목록은 모바일 카드형(data-th 라벨), 복합 헤더·입력 그리드는 가로 스크롤 */
var NO=/^(no|번호|순번|선택)$/i;
function mGrid(t){
 var hr=$$('thead tr',t);if(hr.length!==1||$('thead th[colspan],thead th[rowspan]',t))return;
 var th=$$('th',hr[0]).map(function(x){return x.querySelector('input')?'':x.textContent.trim()});
 var lab=function(){$$('tbody tr',t).forEach(function(r){var cs=$$(':scope>td',r);if(cs.length===1)return;cs.forEach(function(c,i){c.dataset.th=th[i]||'';c.classList.toggle('mc-no',NO.test(th[i]||''))})})};
 if($('tbody input:not([type=checkbox]),tbody select,tbody textarea',t))return;
 t.classList.add('mcard');lab();var b=$('tbody',t);b&&new MutationObserver(lab).observe(b,{childList:true});
}
window.mGridInit=function(sc){$$('table.grid',sc).forEach(mGrid)};
document.addEventListener('DOMContentLoaded',function(){txaCnt();
 /* 목업 시연: 프레임 화면에서 브라우저 세션당 1회, 재난발생 → 재난발령 알림 */
 if($('.gnb .util')){var seen=null;try{seen=sessionStorage.getItem('damsToast')}catch(e){}
  if(!seen){try{sessionStorage.setItem('damsToast','1')}catch(e){}
   setTimeout(function(){toast('새로운 재난발생 정보가 도착했습니다.',{kind:'occur'})},2500);
   setTimeout(function(){toast('새로운 재난발령 정보가 도착했습니다.',{kind:'issue'})},4000)}}
 /* 시연용 숨은 이벤트: 헤더(GNB) 빈 곳을 2초 안에 5번 클릭 → 재난발생 토스트 */
 var gn=$('.gnb');if(gn){var hc=0,ht=0;gn.addEventListener('click',function(e){if(e.target.closest('a,button,input,select,label'))return;var t=Date.now();hc=t-ht<2000?hc+1:1;ht=t;if(hc>=5){hc=0;toast('새로운 재난발생 정보가 도착했습니다.',{kind:'occur'})}})}markOn();layInit();sortInit();mHead();mSch();mGridInit();
 initPaging();
 $$('form').forEach(function(f){f.noValidate=true});
 var lt=$('.lnb-tit');lt&&(lt.dataset.t=lt.textContent);
 if($('.gnb .sess b'))setInterval(tick,1000);
});
})();
