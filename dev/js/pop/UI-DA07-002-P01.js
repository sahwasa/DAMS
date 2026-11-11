/* UI-DA07-002-P01 메뉴 등록 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA07-002-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),edit=Q.get('mode')==='edit',f=document.getElementById('menuForm');
if(Q.get('up'))f.m_up_menu_id.value=Q.get('up');
if(edit){document.getElementById('popTit').textContent='메뉴 수정';document.title=document.title.replace('등록','수정');
  f.m_menu_id.value=Q.get('id');f.m_menu_id.readOnly=true;document.getElementById('idMsg').textContent='메뉴ID는 수정할 수 없습니다.';
  f.m_menu_nm.value=Q.get('nm')||'';f.m_menu_path.value=Q.get('path')||'';f.m_menu_seq.value=Q.get('seq')||1;
  f.m_use_yn.checked=Q.get('use')!=='N';f.m_use_yn.onchange();
  (Q.get('fn')||'').split(',').forEach(function(v){var c=f.querySelector('[name=m_menu_fn][value="'+v+'"]');if(c)c.checked=true});
  document.getElementById('btnDel').hidden=false;document.getElementById('btnSave').textContent='수정';
  [].forEach.call(f.m_up_menu_id.options,function(o){if(o.value===Q.get('id'))o.disabled=true});}
function save(){if(!checkReq(f))return;
  if(!edit&&['M01','M02','M03','M04','M05','M06','M07'].indexOf(f.m_menu_id.value.trim())>-1){f.m_menu_id.classList.add('err');alertMsg('이미 등록된 메뉴ID입니다.',{ico:'wn',focus:f.m_menu_id});return}
  confirmMsg((edit?'수정':'저장')+'하시겠습니까?',function(){popOk('menu',{id:f.m_menu_id.value.trim(),up:f.m_up_menu_id.value,nm:f.m_menu_nm.value.trim(),path:f.m_menu_path.value.trim(),seq:f.m_menu_seq.value,use:f.m_use_yn.checked?'Y':'N',fn:[].map.call(f.querySelectorAll('[name=m_menu_fn]:checked'),function(c){return c.value}).join(',')})})}
function removeMenu(){confirmMsg('['+f.m_menu_nm.value+'] 메뉴를 삭제하시겠습니까?\n삭제된 메뉴는 복구할 수 없습니다.',function(){popOk('menuDel',{id:f.m_menu_id.value})},{ico:'wn',danger:true})}
return {removeMenu:typeof removeMenu==='function'?removeMenu:undefined,save:typeof save==='function'?save:undefined};
};
DAMS_POP['UI-DA07-002-P01'].names=["removeMenu", "save"];
