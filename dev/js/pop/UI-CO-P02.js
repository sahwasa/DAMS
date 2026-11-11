/* UI-CO-P02 비밀번호 변경 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-CO-P02']=function(location,dlg){
var USER='hong.gd';
function $(id){return document.getElementById(id)}
function check(v){
 var seq=/(.)\1\1/.test(v)||/(abc|bcd|cde|def|123|234|345|456|567|678|789|890|qwe|asd)/i.test(v);
 return {len:v.length>=9&&v.length<=20,mix:/[a-z]/i.test(v)&&/\d/.test(v)&&/[^a-z\d]/i.test(v),seq:!!v&&!seq,id:!!v&&v.toLowerCase().indexOf(USER.split('.')[0])<0};
}
function rule(){var r=check($('newPassword').value);[].forEach.call($('ruleList').children,function(li){li.classList.toggle('ok',r[li.dataset.r])});if($('newPasswordCfm').value)same()}
function same(){var a=$('newPassword').value,b=$('newPasswordCfm').value,m=$('cfmMsg'),ok=a===b;m.textContent=!b?'새 비밀번호를 한 번 더 입력하세요.':ok?'새 비밀번호가 일치합니다.':'새 비밀번호가 일치하지 않습니다.';m.className='f-msg'+(b&&!ok?' err':'');m.style.color=b&&ok?'#006e18':'';return ok}
function save(){
 if(!checkReq($('pwForm')))return;
 var n=$('newPassword'),r=check(n.value),bad=Object.keys(r).filter(function(k){return !r[k]});
 if(n.value===$('curPassword').value){alertMsg('현재 비밀번호와 다른 비밀번호를 입력해 주세요.',{ico:'wn',focus:n});return}
 if(bad.length){n.classList.add('err');alertMsg('비밀번호 작성 규칙에 맞지 않습니다.\n('+bad.map(function(k){return document.querySelector('[data-r="'+k+'"]').textContent}).join(', ')+')',{ico:'wn',focus:n});return}
 n.classList.remove('err');
 if(!same()){$('newPasswordCfm').classList.add('err');alertMsg('새 비밀번호가 일치하지 않습니다.',{ico:'wn',focus:'#newPasswordCfm'});return}
 $('newPasswordCfm').classList.remove('err');
 confirmMsg('비밀번호를 변경하시겠습니까?',function(){alertMsg('비밀번호가 변경되었습니다.\n다음 로그인부터 새 비밀번호를 사용하세요.',{ico:'sc',ok:function(){popOk('password')}})});
}
return {$:typeof $==='function'?$:undefined,check:typeof check==='function'?check:undefined,rule:typeof rule==='function'?rule:undefined,same:typeof same==='function'?same:undefined,save:typeof save==='function'?save:undefined};
};
DAMS_POP['UI-CO-P02'].names=["$", "check", "rule", "same", "save"];
