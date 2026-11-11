/* UI-DA08-004-P01 장애 접수 및 조치 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA08-004-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),$id=function(i){return document.getElementById(i)};
var edit=Q.get('mode')==='edit';
function stat(){var v=$id('m_rstr_dt').value.trim();$id('stat').innerHTML=v?'<span class="badge sc">복구완료</span>':'<span class="badge wn">미복구</span> 복구시각을 입력하면 복구완료로 처리됩니다.'}
if(edit){
  document.title=document.title.replace('접수 및 조치','조치 수정');$id('popTit').textContent='장애 접수 및 조치 (수정)';
  $id('m_srvr_cd').value=Q.get('srv')||'';if(Q.get('org'))$id('m_inst_cd').value=Q.get('org');if(Q.get('ds'))$id('m_data_se_cd').value=Q.get('ds');$id('m_dsblty_se_cd').value=Q.get('se')||'';
  var a=(Q.get('oc')||'').split(' '),b=(Q.get('rs')||'').split(' ');
  $id('m_ocrn_dt').value=a[0]||'';$id('m_ocrn_dt_tm').value=a[1]||'';$id('m_rstr_dt').value=b[0]||'';$id('m_rstr_dt_tm').value=b[1]||'';
  $id('m_dsblty_cn').value=Q.get('cn')||'';$id('m_prcs_rslt_cn').value=Q.get('act')||'';$id('m_prcr_nm').value=Q.get('nm')||'';
  $id('btnDel').hidden=false;$id('btnSave').innerHTML='<i class="ri-save-line"></i>수정';
}
stat();$id('m_rstr_dt').addEventListener('input',stat);
function save(){if(!checkReq(document.querySelector('.pop-body')))return;confirmMsg(edit?'수정하시겠습니까?':'저장하시겠습니까?',function(){popOk(edit?'edit':'save')})}
function remove(){confirmMsg('장애이력을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',function(){popOk('delete')},{ico:'wn',danger:true})}
return {remove:typeof remove==='function'?remove:undefined,save:typeof save==='function'?save:undefined,stat:typeof stat==='function'?stat:undefined};
};
DAMS_POP['UI-DA08-004-P01'].names=["remove", "save", "stat"];
