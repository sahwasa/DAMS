/* UI-DA08-001-P01 문자 전송 상세 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA08-001-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),$id=function(i){return document.getElementById(i)};
var rs=Q.get('rs')||'실패',err=Q.get('err')||'통신사 단말기 음영지역 오류 : 4001';
if(Q.get('no'))$id('d_rcvr').textContent=Q.get('no');
if(Q.get('nm'))$id('d_rcvr_nm').textContent=Q.get('nm');
if(Q.get('dt'))$id('d_trsm_dt').textContent=Q.get('dt');
if(Q.get('se'))$id('d_se').textContent=Q.get('se');
if(Q.get('cn'))$id('d_cn').textContent=Q.get('cn');
$id('d_rslt').innerHTML=rs==='성공'?'<span class="badge sc">전송성공</span>':'<span class="badge dg">전송실패</span> <span class="c-dg" style="font-size:13px">('+err+')</span>';
function resend(){confirmMsg('같은 수신자에게 문자를 재발송하시겠습니까?',function(){popOk('resend')})}
return {resend:typeof resend==='function'?resend:undefined};
};
DAMS_POP['UI-DA08-001-P01'].names=["resend"];
