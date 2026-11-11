/* UI-DA07-003-P01 그룹코드 등록 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA07-003-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),edit=Q.get('mode')==='edit',f=document.getElementById('codeForm');
if(edit){document.getElementById('popTit').textContent='그룹코드 수정';document.title=document.title.replace('등록','수정');
  f.m_code_cd.value=Q.get('cd');f.m_code_cd.readOnly=true;document.getElementById('cdMsg').textContent='그룹코드는 수정할 수 없습니다.';
  f.m_code_nm.value=Q.get('nm')||'';f.m_code_expln.value=Q.get('expln')||'';f.m_code_use.checked=Q.get('use')!=='N';f.m_code_use.onchange();}
function saveCode(){if(!checkReq(f))return;var cd=f.m_code_cd.value.trim();
  if(!/^[a-z0-9_]+$/.test(cd)){f.m_code_cd.classList.add('err');alertMsg('그룹코드는 영문 소문자, 숫자, _ 만 입력할 수 있습니다.',{ico:'wn',focus:f.m_code_cd});return}
  if(!edit&&['user_authrt_cd','srvr_cd','rsrc_thrhld_cd','prcs_se_cd','prcs_stts_cd','clmty_lclsf_cd','media_se_cd','job_se_cd'].indexOf(cd)>-1){f.m_code_cd.classList.add('err');alertMsg('이미 등록된 그룹코드입니다.',{ico:'wn',focus:f.m_code_cd});return}
  confirmMsg('저장하시겠습니까?\n변경 내용은 작업이력에 공통코드 변경으로 기록됩니다.',function(){popOk('group',{cd:cd,nm:f.m_code_nm.value.trim(),expln:f.m_code_expln.value.trim(),use:f.m_code_use.checked?'Y':'N'})})}
return {saveCode:typeof saveCode==='function'?saveCode:undefined};
};
DAMS_POP['UI-DA07-003-P01'].names=["saveCode"];
