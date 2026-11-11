/* UI-DA07-004-P01 상세 재난코드 등록 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA07-004-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),edit=Q.get('mode')==='edit',f=document.getElementById('dsstrForm'),codes=(Q.get('codes')||'').split(',');
if(Q.get('lclas'))document.getElementById('m_dsstr_lclas').textContent=Q.get('lclas');
if(Q.get('mclas'))document.getElementById('m_dsstr_mclas').textContent=Q.get('mclas');
if(edit){document.getElementById('popTit').textContent='상세 재난코드 수정';document.title=document.title.replace('등록','수정');
  f.m_dsstr_code.value=Q.get('cd');f.m_dsstr_code.readOnly=true;document.getElementById('cdMsg').textContent='코드는 수정할 수 없습니다.';
  f.m_dsstr_name.value=Q.get('nm')||'';f.m_dsstr_use.checked=Q.get('use')!=='N';f.m_dsstr_use.onchange();}
function save(){if(!checkReq(f))return;var cd=f.m_dsstr_code.value.trim().toUpperCase();
  if(!/^[A-Z0-9]+$/.test(cd)){f.m_dsstr_code.classList.add('err');alertMsg('코드는 영문 대문자와 숫자만 입력할 수 있습니다.',{ico:'wn',focus:f.m_dsstr_code});return}
  if(!edit&&codes.indexOf(cd)>-1){f.m_dsstr_code.classList.add('err');alertMsg('이미 등록된 코드입니다.',{ico:'wn',focus:f.m_dsstr_code});return}
  confirmMsg('저장하시겠습니까?',function(){popOk('disaster',{cd:cd,nm:f.m_dsstr_name.value.trim(),use:f.m_dsstr_use.checked?'Y':'N'})})}
return {save:typeof save==='function'?save:undefined};
};
DAMS_POP['UI-DA07-004-P01'].names=["save"];
