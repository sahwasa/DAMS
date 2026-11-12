/* UI-DA04-001-P01 연계기관 등록/수정 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA04-001-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),mode=Q.get('mode')||'edit',acnt=Q.get('acnt')==='1',$=function(i){return document.getElementById(i)};
var SGG={"11":["종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구","노원구","은평구","서대문구","마포구","양천구","강서구","구로구","금천구","영등포구","동작구","관악구","서초구","강남구","송파구","강동구"],"46":["목포시","여수시","순천시","나주시","광양시","동구","서구","남구","북구","광산구","담양군","곡성군","구례군","고흥군","보성군","화순군","장흥군","강진군","해남군","영암군","무안군","함평군","영광군","장성군","완도군","진도군","신안군"],"26":["중구","서구","동구","영도구","부산진구","동래구","남구","북구","해운대구","사하구","금정구","강서구","연제구","수영구","사상구","기장군"],"27":["중구","동구","서구","남구","북구","수성구","달서구","달성군","군위군"],"28":["제물포구","영종구","미추홀구","연수구","남동구","부평구","계양구","서해구","검단구","강화군","옹진군"],"30":["동구","중구","서구","유성구","대덕구"],"31":["중구","남구","동구","북구","울주군"],"36":[],"41":["수원시","성남시","의정부시","안양시","부천시","광명시","평택시","동두천시","안산시","고양시","과천시","구리시","남양주시","오산시","시흥시","군포시","의왕시","하남시","용인시","파주시","이천시","안성시","김포시","화성시","광주시","양주시","포천시","여주시","연천군","가평군","양평군"],"42":["춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시","홍천군","횡성군","영월군","평창군","정선군","철원군","화천군","양구군","인제군","고성군","양양군"],"43":["청주시","충주시","제천시","보은군","옥천군","영동군","증평군","진천군","괴산군","음성군","단양군"],"44":["천안시","공주시","당진시","보령시","아산시","서산시","논산시","계룡시","금산군","부여군","서천군","청양군","홍성군","예산군","태안군"],"45":["전주시","군산시","익산시","정읍시","남원시","김제시","완주군","진안군","무주군","장수군","임실군","순창군","고창군","부안군"],"47":["포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시","문경시","경산시","의성군","청송군","영양군","영덕군","청도군","고령군","성주군","칠곡군","예천군","봉화군","울진군","울릉군"],"48":["창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시","의령군","함안군","창녕군","고성군","남해군","하동군","산청군","함양군","거창군","합천군"],"50":["제주시","서귀포시"]};/* 시도 코드별 시군구(행정안전부 직제순 전체) */
function fillDestSigungu(v){$('m_dest_sgg').innerHTML='<option value="">시군구 선택</option>'+(SGG[v]||[]).map(function(x){return '<option>'+x+'</option>'}).join('')}
/* 연계기관명 = 시도(시도 기관) 또는 시도 + 시군구(시군구 기관) */
function setNm(){var sd=$('m_dest_sido'),sg=$('m_dest_sgg').value,v=sd.value?sd.options[sd.selectedIndex].text+(sg?' '+sg:''):'';$('m_dest_nm').value=v;$('m_dest_nm_v').textContent=v?'→ '+v:''}
function viewCert(){var nm=VIA||$('m_dest_nm').value;openPop('pop/UI-DA04-001-P02.html?'+new URLSearchParams({nm:nm,iss:$('m_dest_rsltdoc').children[1].textContent,integ:VIA?'':INTEG.join(','),hl:VIA?$('m_dest_nm').value.split(' ').slice(1).join(' '):''}).toString(),900)}
/* 운영여부 on/off: 운영 전환 시 운영시작일자 = 오늘(이미 있으면 유지) */
var OPDT='';function today(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function operChg(el){var v=el.checked;el.checked=!v;
  if(v&&!document.querySelector('#m_dest_rsltdoc .badge.sc')){alertMsg('연계확인서가 발급되지 않은 기관은 운영으로 바꿀 수 없습니다.\n발급대상기관 목록에서 점검·발급 승인을 받으면 운영으로 전환됩니다.',{ico:'wn'});return}
  confirmMsg('운영여부를 ['+(v?'운영':'미운영')+']으로 변경하시겠습니까?'+(v?'':'\n미운영으로 바꾸면 이 기관의 재난정보 전달·발령 수신이 중지됩니다.'),function(){el.checked=v;el.nextElementSibling.textContent=v?'운영':'미운영';if(v){OPDT=OPDT&&OPDT!=='-'?OPDT:today()}$('m_dest_opdt').textContent=v?OPDT:'-';$('m_dest_opdt').title=v?'':'미운영(마지막 운영시작일자 '+(OPDT||'-')+')';$('m_dest_opend').textContent=v?'-':today()},v?{}:{ico:'wn',danger:true})}
/* 연계확인서 발급 취소 */
var CERT='';function cancelCert(){if(VIA){confirmMsg('['+$('m_dest_nm').value+']을(를) '+VIA+' 시도 통합에서 해제하고\n연계확인서 발급을 취소하시겠습니까?\n자체 플랫폼으로 연계하려면 연계확인서 발급 대상기관(발급대기)에서 점검·발급을 받아야 합니다.',function(){CERT='cancel';$('m_dest_rsltdoc').innerHTML='<span class="badge dg">통합 해제</span><span>'+today()+'</span>';var op=$('m_dest_oper'),was=op.checked;op.checked=false;op.nextElementSibling.textContent='미운영';$('m_dest_opdt').textContent='-';if(was)$('m_dest_opend').textContent=today();$('integMsg').innerHTML='<i class="ri-node-tree"></i> 저장하면 '+VIA+' 시도 통합이 해제되고 연계확인서 발급 대상기관에 발급대기로 등록됩니다.'},{ico:'wn',danger:true});return}
 confirmMsg('['+$('m_dest_nm').value+'] 연계확인서 발급을 취소하시겠습니까?'+(INTEG.length?'\n통합 발급된 시군구 '+INTEG.length+'곳도 함께 취소됩니다.':'')+'\n취소하면 연계확인서가 무효 처리되고 운영여부가 미운영으로 바뀝니다.\n다시 운영하려면 발급대상기관 목록에서 점검·발급해야 합니다.',function(){CERT='cancel';$('m_dest_rsltdoc').innerHTML='<span class="badge dg">발급취소</span><span>'+today()+'</span>';var op=$('m_dest_oper'),was=op.checked;op.checked=false;op.nextElementSibling.textContent='미운영';$('m_dest_opdt').textContent='-';$('m_dest_opdt').title='미운영(마지막 운영시작일자 '+(OPDT||'-')+')';if(was)$('m_dest_opend').textContent=today();$('certMsg').textContent='저장하면 발급 취소가 반영되고 운영여부는 미운영으로 바뀝니다.'+(was?' (재난정보 전달·발령 수신 중지)':'');$('certMsg').className='f-msg err'},{ico:'wn',danger:true})}
function saveDest(){
  if(!checkReq($('destForm')))return;
  confirmMsg(mode==='new'?'연계기관을 등록하시겠습니까?':'변경한 내용을 저장하시겠습니까?',function(){popOk('dest',{mode:mode,nm:$('m_dest_nm').value,op:$('m_dest_oper').checked?'Y':'N',opdt:$('m_dest_opdt').textContent,opend:$('m_dest_opend').textContent,via:VIA,use:$('m_dest_use').checked?'Y':'N',cert:CERT,pic:$('m_pic_nm').value.trim(),dept:$('m_pic_dept_nm').value.trim(),jbgd:$('m_pic_jbgd_nm').value.trim(),tel:$('m_pic_telno').value.trim()})});
}
/* 모드: new(등록) / edit(수정) / view(사용자 권한 상세보기) */
['cd','ip'].forEach(function(k){if(Q.get(k))$('m_dest_'+k).value=Q.get(k)});
/* 담당자 정보(목록 행 → 쿼리 pic·dept·jbgd·tel), 신규 등록은 빈 칸 */
[['pic','m_pic_nm'],['dept','m_pic_dept_nm'],['jbgd','m_pic_jbgd_nm'],['tel','m_pic_telno']].forEach(function(a){var el=$(a[1]);if(mode==='new')el.value='';else if(Q.get(a[0])!=null)el.value=Q.get(a[0])});
if(Q.get('sd')){$('m_dest_sido').value=Q.get('sd');fillDestSigungu(Q.get('sd'));$('m_dest_sgg').value=Q.get('sg')||'';setNm();var nm=$('m_dest_nm').value;$('m_dest_desc').value=nm+' 예경보 통합 연동';$('m_dest_id').value='dams_'+Q.get('cd')}else setNm();
(function(){var r=$('acntInfo'),e=$('m_dest_acnt');if(acnt){r.hidden=true;return}if(Q.get('ac')==='1'){e.textContent='등록됨';e.className='badge in';e.title='계정관리에 등록된 연계기관 — DAMS 직접 연계(연계 프로그램 설치)'}})();
if(acnt)document.querySelectorAll('.acnt-only').forEach(function(r){r.hidden=false;r.querySelectorAll('.inp').forEach(function(e){e.required=true})});
/* 비밀번호 자동생성: 입력란에 채우고 보이게(저장 시 반영) / 초기화: 확인 후 임시 비밀번호 즉시 발급(기존 비밀번호 접속 불가) */
function genPw(){var p=$('m_dest_pw');p.value=pwGen(12);pwEye(p.nextElementSibling,true);$('pwMsg').textContent='자동생성된 비밀번호입니다. [저장]을 눌러야 반영됩니다.';$('pwMsg').className='f-msg c-pri';msg('비밀번호가 자동생성되었습니다.')}
function resetPw(){confirmMsg('비밀번호를 초기화하시겠습니까?\n초기화하면 기존 비밀번호로는 연계 접속이 되지 않습니다.',function(){var p=$('m_dest_pw');p.value=pwGen(12);pwEye(p.nextElementSibling,true);$('pwMsg').textContent='임시 비밀번호가 발급되었습니다. 연계기관 담당자에게 전달하세요.';$('pwMsg').className='f-msg c-sc';alertMsg('비밀번호가 초기화되었습니다.\n임시 비밀번호를 연계기관 담당자에게 전달하세요.',{ico:'sc'})},{danger:true})}
if(Q.get('use')==='N'){$('m_dest_use').checked=false;$('m_dest_use').nextElementSibling.textContent='미사용'}
if(Q.get('iss'))$('m_dest_rsltdoc').children[1].textContent=Q.get('iss');
/* 시도 통합 발급: 시도는 통합 발급 시군구 목록, 통합된 시군구는 시도 연계확인서로 발급됨(발급 취소는 시도에서) */
var INTEG=(Q.get('integ')||'').split(',').filter(Boolean),VIA=Q.get('via')||'';
if(INTEG.length){$('integMsg').innerHTML='<i class="ri-node-tree"></i> 통합 발급 시군구 <b>'+INTEG.length+'</b>곳 : '+INTEG.join(', ');$('integMsg').hidden=false}
if(VIA){var rd=$('m_dest_rsltdoc');rd.querySelector('.badge').outerHTML='<span class="badge pri" title="자체 플랫폼 없이 시도 플랫폼으로 연계">시도 통합 발급</span>';$('btnCertCancel').innerHTML='<i class="ri-close-circle-line"></i>통합 해제(발급 취소)';$('btnCertCancel').title='자체 플랫폼으로 전환할 때 시도 통합을 해제하고 연계확인서 발급을 취소';$('integMsg').innerHTML='<i class="ri-node-tree"></i> '+VIA+' 연계확인서로 통합 발급되었습니다. 자체 플랫폼으로 전환하면 [통합 해제(발급 취소)] 후 연계확인서 발급 대상기관에서 따로 점검·발급을 받습니다.';$('integMsg').hidden=false}
if(Q.get('opdt'))$('m_dest_opdt').textContent=Q.get('opdt');OPDT=$('m_dest_opdt').textContent;
if(Q.get('op')==='N'){$('m_dest_oper').checked=false;$('m_dest_oper').nextElementSibling.textContent='미운영';$('m_dest_opdt').textContent='-'}
if(Q.get('opend'))$('m_dest_opend').textContent=Q.get('opend');
if(Q.get('op')==='N'||Q.get('cert')==='N'){$('m_dest_rsltdoc').innerHTML='<span class="badge">미발급</span>'}
if(mode==='new'){
  $('popTit').textContent='연계기관 등록';$('btnSave').innerHTML='<i class="ri-add-line"></i>등록';
  ['m_dest_cd','m_dest_desc'].forEach(function(i){$(i).value=''});
  $('m_dest_sido').value='';fillDestSigungu('');setNm();
  $('m_dest_reg').textContent='등록 시 자동입력';$('m_dest_oper').checked=false;$('m_dest_oper').nextElementSibling.textContent='미운영';$('m_dest_opdt').textContent='-';OPDT='';$('m_dest_upd').textContent='-';$('m_dest_rsltdoc').innerHTML='<span class="badge">미발급</span>';
}else if(mode==='view'){
  $('popTit').textContent='연계기관 상세정보';
  document.querySelectorAll('#destForm .inp,#destForm .txa').forEach(function(e){e.readOnly=true});
  document.querySelectorAll('#destForm .sel,#m_dest_use,#m_dest_oper').forEach(function(e){e.disabled=true});$('btnCertCancel')&&($('btnCertCancel').hidden=true);
  $('m_dest_sido').closest('td').querySelector('.f-msg').hidden=true;
  document.querySelectorAll('#destForm .req').forEach(function(e){e.classList.remove('req')});
  $('btnSave').hidden=true;$('btnCancel').textContent='닫기';
}
return {fillDestSigungu:typeof fillDestSigungu==='function'?fillDestSigungu:undefined,genPw:typeof genPw==='function'?genPw:undefined,operChg:typeof operChg==='function'?operChg:undefined,resetPw:typeof resetPw==='function'?resetPw:undefined,saveDest:typeof saveDest==='function'?saveDest:undefined,setNm:typeof setNm==='function'?setNm:undefined,viewCert:typeof viewCert==='function'?viewCert:undefined};
};
DAMS_POP['UI-DA04-001-P01'].names=["fillDestSigungu", "genPw", "operChg", "resetPw", "saveDest", "setNm", "viewCert"];
