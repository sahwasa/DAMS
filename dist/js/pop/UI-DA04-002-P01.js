/* UI-DA04-002-P01 통합플랫폼 계정 등록 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA04-002-P01']=function(location,dlg){
var $=function(i){return document.getElementById(i)},idOk=false;
var SGG={31:['중구','남구','동구','북구','울주군'],41:['수원시','성남시','부천시'],43:['청주시','충주시','제천시'],44:['천안시','공주시','보령시','아산시','서산시','논산시']};
/* 운영 중 & 계정 미등록 기관 (시도코드: [기관코드, 기관명, IP, 시군구]) */
var INST={31:[['3130000','울산광역시 남구','10.131.13.22','남구'],['3160000','울산광역시 북구','10.131.16.9','북구']],41:[['4113000','경기도 성남시','10.110.33.25','성남시']],43:[],44:[['4498000','충청남도 서산시','10.120.55.14','서산시'],['4480000','충청남도 논산시','10.120.57.6','논산시']]};
function fillSgg(v){$('reg_sgg').innerHTML='<option value="">시군구 전체</option>'+(SGG[v]||[]).map(function(x){return '<option>'+x+'</option>'}).join('')}
function searchOperInst(){
  if(!checkReq($('reg_sido').parentNode))return;
  var sg=$('reg_sgg').value,l=(INST[$('reg_sido').value]||[]).filter(function(x){return !sg||x[3]===sg}),s=$('reg_inst');
  s.innerHTML='<option value="">연계기관 선택 ('+l.length+'건)</option>'+l.map(function(x,i){return '<option value="'+x[0]+'" data-ip="'+x[2]+'">'+x[1]+'</option>'}).join('');
  s.disabled=!l.length;$('instMsg').textContent=l.length?'운영 중·계정 미등록 기관 '+l.length+'건이 조회되었습니다.':'검색된 결과가 없습니다.';
  $('instMsg').className='f-msg'+(l.length?'':' err');pickInst(s);
}
function pickInst(s){var o=s.selectedOptions[0];$('regCd').textContent=s.value||'-';$('reg_ip').value=s.value?o.dataset.ip:'';if(s.value&&!$('reg_id').value){$('reg_id').value='dams_'+s.value;idOk=false}}
function checkId(){var v=$('reg_id').value.trim();if(!v){alertMsg('ID를 입력하세요.',{ico:'wn',focus:'#reg_id'});return}if(v==='ulsan_dams'){idOk=false;alertMsg('이미 사용 중인 ID입니다.\n다른 ID를 입력하세요.',{ico:'dg',focus:'#reg_id'});return}idOk=true;alertMsg('사용 가능한 ID입니다.',{ico:'sc'})}
function saveAccount(){
  var s=$('reg_inst');
  if(s.disabled){alertMsg('법정동을 선택해 연계기관을 먼저 검색하세요.',{ico:'wn',focus:'#reg_sido'});return}
  if(!checkReq($('acntForm')))return;
  if(!idOk){alertMsg('ID 중복확인을 해주세요.',{ico:'wn',focus:'#btnChkId'});return}
  var o=s.selectedOptions[0];
  confirmMsg('['+o.textContent+'] 기관을 계정관리 대상으로 등록하시겠습니까?',function(){popOk('acnt',{cd:s.value,nm:o.textContent,ip:$('reg_ip').value})});
}
return {checkId:typeof checkId==='function'?checkId:undefined,fillSgg:typeof fillSgg==='function'?fillSgg:undefined,pickInst:typeof pickInst==='function'?pickInst:undefined,saveAccount:typeof saveAccount==='function'?saveAccount:undefined,searchOperInst:typeof searchOperInst==='function'?searchOperInst:undefined};
};
DAMS_POP['UI-DA04-002-P01'].names=["checkId", "fillSgg", "pickInst", "saveAccount", "searchOperInst"];
