/* UI-DA04-003-P01 단말기 상세정보 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA04-003-P01']=function(location,dlg){
var Q=new URLSearchParams(location.search),$=function(i){return document.getElementById(i)};
// 매체별 사양 샘플: 모델명, 제조사, 출력방식, 최소·최대 허용거리(m), 가청범위(m), 설치일자
var SPEC={'자동음성통보':['KAS-AL-2000EX','(주)한국예경보','스피커, 사이렌',0,1600,'0 ~ 1,500','2021-04-20'],'재해문자전광판':['VMS-3216C','(주)대한전광','전광판',0,150,'-','2022-09-05'],'마을방송':['SP-2000A','한국음향','스피커',0,87,'0 ~ 80','2023-06-15'],'자동우량경보':['ARG-500','(주)한국수자원기술','사이렌',0,600,'0 ~ 500','2020-11-10']};
// 법정동코드(10자리) 샘플
var BJD={'울산광역시 중구 태화동':'3111010900','울산광역시 동구 방어동':'3117010100','울산광역시 동구 화정동':'3117010200','울산광역시 동구 일산동':'3117010300','울산광역시 울주군 서생면':'3171025000','경상북도 군위군 군위읍':'4772025000','경기도 안성시 대덕면':'4155031000','강원특별자치도 철원군 갈말읍':'5178025300','강원특별자치도 철원군 동송읍':'5178025000','충청북도 청주시 상당구':'4311110100','충청북도 청주시 흥덕구':'4311310100','충청남도 공주시 중학동':'4415010300','전라남도 구례군 구례읍':'4673025000','전라남도 보성군 보성읍':'4678025000','전라남도 함평군 함평읍':'4686025000'};
var IP={'울산':'10.31.0.','경상북도':'10.47.72.','경기도':'10.41.55.','강원특별자치도':'10.51.78.','충청북도':'10.43.11.','충청남도':'10.44.15.','전라남도':'10.46.'};
function fx(v){return (+v).toFixed(5)}
if(Q.get('n')){
  var t=Q.get('type'),s=SPEC[t]||SPEC['마을방송'],err=Q.get('st')==='9',addr=Q.get('addr'),w=addr.split(' '),city=w.slice(0,2).join(' '),k3=w.slice(0,3).join(' ');
  var ipk=Object.keys(IP).filter(function(k){return addr.indexOf(k)===0})[0];
  $('server_name').textContent=Q.get('sys');$('server_ip').textContent=ipk?IP[ipk]+(w[0]==='전라남도'?{'구례군':'73.21','보성군':'78.21','함평군':'86.21'}[w[1]]||'0.21':'21'):'-';
  $('device_type').textContent=t;$('device_name').textContent=Q.get('n');$('device_id').textContent=Q.get('id');$('device_address').textContent=addr;$('device_bjdong').textContent=BJD[k3]||BJD[city]||'-';
  $('device_lat').textContent=fx(Q.get('lat')||(city.indexOf('충청남도')===0?36.8151:35.5384));$('device_lon').textContent=fx(Q.get('lng')||(city.indexOf('충청남도')===0?127.1139:129.3114));
  [['device_model',0],['device_company',1],['device_output',2],['device_allow_dist_min',3],['device_allow_dist_max',4],['device_audible',5],['device_inst_date',6]].forEach(function(k){var v=s[k[1]];$(k[0]).textContent=typeof v==='number'?v.toLocaleString():v});
  if(err){$('device_status').innerHTML='<span class="badge dg">끊김</span>';$('status_note').textContent='장비 고장 — 스피커 앰프 출력 없음';}
}
$('dv_status_b').outerHTML=$('device_status').innerHTML;
return {fx:typeof fx==='function'?fx:undefined};
};
DAMS_POP['UI-DA04-003-P01'].names=["fx"];
