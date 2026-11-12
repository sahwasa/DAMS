/* 개인정보 처리방침 | 재난 예경보 통합관리시스템 */
/* 뒤로가기: 진입한 화면(로그인 또는 프레임 화면 푸터)으로 복귀, 직접 열었으면 로그인으로 */
function goBack(){if(history.length>1&&document.referrer)history.back();else location.href='login.html'}
function chgVer(s){if(s.value!=='v3'){alertMsg(s.options[s.selectedIndex].text+' 시행 처리방침입니다.\n목업에서는 현행 문안만 제공합니다.',{ico:'in'});s.value='v3'}}
var A=[].slice.call(document.querySelectorAll('#toc a'));
addEventListener('scroll',function(){var cur=A[0];A.forEach(function(a){if(document.querySelector(a.getAttribute('href')).getBoundingClientRect().top<120)cur=a});A.forEach(function(a){a.classList.toggle('on',a===cur)})});
dispatchEvent(new Event('scroll'));
