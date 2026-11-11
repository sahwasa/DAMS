/* 단말기현황 | 재난 예경보 통합관리시스템 */
var Q=function(s){return [].slice.call(document.querySelectorAll(s))},stF='';
var ADDR={31:['중구','동구','울주군'],43:['청주시 상당구','청주시 흥덕구'],44:['공주시'],41:['안성시'],51:['철원군']},EMD={'동구':['방어동','일산동','화정동','대송동'],'중구':['학성동','태화동'],'울주군':['서생면','온산읍'],'천안시 동남구':['문성동','중앙동','신안동'],'공주시':['중학동'],'아산시':['배방읍']};
function loadAddress(lv,v){
  var o=lv===2?(ADDR[v]||[]):(EMD[v]||[]);
  document.getElementById('addr'+lv).innerHTML='<option value="">'+(lv===2?'시군구':'읍면동')+' 전체</option>'+o.map(function(x){return '<option>'+x+'</option>'}).join('');
  if(lv===2)document.getElementById('addr3').innerHTML='<option value="">읍면동 전체</option>';
  if(v)msg('하위 법정동 목록이 설정되었습니다.');
}
document.querySelector('.sch-box').addEventListener('reset',function(){setTimeout(function(){loadAddress(2,'');search(true)})});
function treeAll(o){Q('#platformTree li').forEach(function(l){if(l.querySelector('ul'))l.classList.toggle('open',o)})}
/* 전체 펼침/접기 토글: 버튼 글자는 다음 동작 */
var TREE_OPEN=false;function treeTgl(){TREE_OPEN=!TREE_OPEN;treeAll(TREE_OPEN);var b=document.getElementById('treeTgl');b.innerHTML='<i class="ri-'+(TREE_OPEN?'contract':'expand')+'-up-down-line"></i>전체 '+(TREE_OPEN?'접기':'펼침')}
/* 단말기 위치 전체화면(같은 지도·선택 상태 유지, ESC·[전체화면 닫기]로 복귀) */
function mapFull(on){var r=document.querySelector('.dv-r');on=on==null?!r.classList.contains('full'):on;r.classList.toggle('full',on);document.body.style.overflow=on?'hidden':'';var b=byId('btnMapFull');b.innerHTML=on?'<i class="ri-fullscreen-exit-line"></i>전체화면 닫기':'<i class="ri-fullscreen-line"></i>전체화면 보기';draw();if(SEL!=null)mark(SEL);msg(on?'단말기 위치를 전체화면으로 표시합니다.':'전체화면을 닫았습니다.')}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.querySelector('.dv-r.full')&&!document.querySelector('.pop-dim'))mapFull(false)});
/* 미연계지역 보기(라벨 '전체'): 기본 숨김 */
function ncView(on){document.getElementById('platformTree').classList.toggle('nc-off',!on)}ncView(false);
/* 지도 — 연계기관: [관할지역, 기관 위치(도넛)] */
var ORG={o11:['서울특별시','서울특별시 중구'],o26:['부산광역시','부산광역시 연제구'],o27:['대구광역시','대구광역시 중구'],o28:['인천광역시','인천광역시 남동구'],o29:['전남광주통합특별시','광주광역시 서구'],o30:['대전광역시','대전광역시 서구'],o3020:['대전광역시 유성구'],
 o31:['울산광역시','울산광역시 남구'],o3111:['울산광역시 중구'],o3114:['울산광역시 동구'],o3115:['울산광역시 울주군'],o36:['세종특별자치시'],o41:['경기도','경기도 수원시 팔달구'],o4111:['경기도 수원시','경기도 수원시 권선구'],o4113:['경기도 부천시','경기도 부천시 원미구'],
 o42:['강원특별자치도','강원특별자치도 춘천시'],o43:['충청북도','충청북도 청주시 상당구'],o4311:['충청북도 청주시','충청북도 청주시 흥덕구'],o44:['충청남도','충청남도 홍성군'],o4413:['충청남도 천안시','충청남도 천안시 동남구'],o4415:['충청남도 공주시'],o4418:['충청남도 보령시'],o4420:['충청남도 아산시'],
 o45:['전북특별자치도','전북특별자치도 전주시 완산구'],o46:['전남광주통합특별시','전남광주통합특별시 무안군'],o2772:['경상북도 군위군'],o4155:['경기도 안성시'],o4278:['강원특별자치도 철원군'],o4673:['전남광주통합특별시 구례군'],o4678:['전남광주통합특별시 보성군'],o4686:['전남광주통합특별시 함평군'],o50:['제주특별자치도','제주특별자치도 제주시'],o47:['경상북도','경상북도 안동시'],o48:['경상남도','경상남도 창원시 의창구']};
var ROWS=Q('#devTbody tr[data-org]'),MAP=null,MODE=1,RNG=true,MDON={},LGOPEN=false,REG=null,SEL=-1,DN=[],RNG_M={VBS:80,VNS:1500,VNI:1500,VNO:1500,RAS:500};
var byId=function(i){return document.getElementById(i)},PT=(function(){var n={};return ROWS.map(function(tr){var a=tr.cells[6].textContent.trim(),k=n[a]||0;n[a]=k+1;return GeoMap.point(a,k)})})();
function mdOf(tr){return tr.dataset.md||GeoMap.MEDIA_BY_NAME[tr.dataset.media]||'LDB'}
function stOf(tr){return tr.dataset.st==='0'?'ok':tr.dataset.st==='9'?'ng':'off'}
function setReg(q){REG=q?{q:q,lv:q.split(' ').length>1?'sg':'sd'}:null}
/* 체크된 기관별 건수(트리) → 도넛, 화면 거리 R(px) 안이면 합침 */
function orgItems(){return Q('#platformTree input[data-org]:checked').map(function(c){var o=ORG[c.dataset.org],e=+c.dataset.e,ng=stF==='0'?0:e,ok=stF==='9'?0:+c.dataset.n-e;return {reg:o[0],c:GeoMap.point(o[1]||o[0]),n:ok+ng,ok:ok,ng:ng,nm:c.nextElementSibling.textContent}}).filter(function(x){return x.n&&x.c})}
function clus(a,R,zn){var el=byId('termMap'),w=el.clientWidth,h=el.clientHeight,o=[];
  a.slice().sort(function(x,y){return y.n-x.n}).forEach(function(it){var q=MAP.P(it.c),x=q[0]*w/100,y=q[1]*h/100,m=o.filter(function(d){return Math.hypot(d.x-x,d.y-y)<R})[0];
    if(m){m.n+=it.n;m.ok+=it.ok;m.ng+=it.ng;m.nm.push(it.nm);m.reg=null}else o.push({x:x,y:y,c:it.c,n:it.n,ok:it.ok,ng:it.ng,nm:[it.nm],reg:it.reg,zn:zn})});return o}
function dia(m,lat){var B=MAP.P.B;return (2*m/(111320*Math.cos(lat*Math.PI/180))/(B.x1-B.x0)*100).toFixed(2)}
function draw(){
  var el=byId('termMap'),lv=REG?REG.lv:'n',it=orgItems(),dn='',rg='',h='',vis=0;hideTip();DN=[];
  MAP=GeoMap.mount(el,{region:REG?REG.q:null,pad:lv==='n'?.03:.08});
  function put(a,at){a.forEach(function(d){DN.push(d);dn+=GeoMap.donut(MAP.P,d.c[0],d.c[1],d.n,d.ok,d.ng,at+' title="'+d.nm.join(', ')+' · 단말기 '+d.n.toLocaleString()+'대 (연결 '+d.ok.toLocaleString()+' · 끊김 '+d.ng+')" onclick="dnGo('+(DN.length-1)+')"')})}
  if(lv==='n'){var g={};it.forEach(function(x){var s=x.reg.split(' ')[0],o=g[s]||(g[s]={reg:s,c:GeoMap.point(s),n:0,ok:0,ng:0,nm:s});o.n+=x.n;o.ok+=x.ok;o.ng+=x.ng});
    put(clus(Object.keys(g).map(function(k){return g[k]}),54,2.6),'data-u="1"');put(clus(it,54/2.6,6.2),'data-z="2" data-u="2"')}
  else if(lv==='sd')put(clus(it.filter(function(x){return x.reg.indexOf(REG.q)===0}),54,2.6),'data-u="1"');
  var za=lv==='n'?'3':lv==='sd'?'2':'',sy=[],inR=0;
  ROWS.forEach(function(tr,i){var c=PT[i],md=mdOf(tr);if(tr.hidden||!c||MDON[md]===false)return;vis++;if(!REG||tr.cells[6].textContent.indexOf(REG.q)===0)inR++;sy.push({i:i,c:c,md:md,st:stOf(tr),z:za})});
  /* 시군구 화면: 겹친 심볼(22px 이내)은 도넛으로 묶고 확대 시 개별 심볼 */
  if(lv==='sg'){var w=byId('termMap').clientWidth,hh=byId('termMap').clientHeight,gs=[];
    sy.forEach(function(s){var q=MAP.P(s.c);s.x=q[0]*w/100;s.y=q[1]*hh/100;if(q[0]<0||q[0]>100||q[1]<0||q[1]>100)return;var g=gs.filter(function(g){return g.m.some(function(m){return Math.hypot(m.x-s.x,m.y-s.y)<22})})[0];if(g)g.m.push(s);else gs.push({m:[s]})});
    gs.forEach(function(g){if(g.m.length<2)return;var n=g.m.length,ok=0,ng=0,cx=0,cy=0;g.m.forEach(function(m){m.z='2';ok+=m.st==='ok';ng+=m.st==='ng';cx+=m.c[0]/n;cy+=m.c[1]/n});
      DN.push({c:[cx,cy],n:n,ok:ok,ng:ng,nm:g.m.map(function(m){return ROWS[m.i].cells[5].textContent}),reg:null,zn:2.6});
      dn+=GeoMap.donut(MAP.P,cx,cy,n,ok,ng,'data-u="1" title="'+DN[DN.length-1].nm.join(', ')+' (연결 '+ok+' · 끊김 '+ng+')" onclick="dnGo('+(DN.length-1)+')"')})}
  sy.forEach(function(s){var tr=ROWS[s.i],c=s.c,z=s.z?' data-z="'+s.z+'"':'';
    if(RNG&&RNG_M[s.md])rg+='<span class="gm-rng" data-k="'+s.i+'"'+z+' style="'+GeoMap.at(MAP.P,c)+';width:'+dia(RNG_M[s.md],c[1])+'%"></span>';
    h+=GeoMap.dev(MAP.P,c[0],c[1],s.md,s.st,'data-k="'+s.i+'"'+z+' title="'+tr.cells[5].textContent+' ('+tr.cells[1].textContent+')" onclick="symClick('+s.i+')" ondblclick="symDbl('+s.i+')"',SEL===s.i)});
  MAP.sym.innerHTML=rg+dn+h;
  el.querySelectorAll('.gm-lgd,.gm-mode,.gm-zoom,.lbl').forEach(function(x){x.remove()});
  var lg=GeoMap.legendDevice(MDON,RNG,{open:LGOPEN,off:false,only:ROWS.map(mdOf)}).replace('</i>성공<','</i>연결<').replace('</i>실패<','</i>끊김<');
  el.insertAdjacentHTML('beforeend',GeoMap.modeBtns(MODE,'devMode')+lg+'<div class="gm-zoom"><button type="button" title="확대" onclick="hideTip();MAP.api.zoom(1.4)"><i class="ri-add-line"></i></button><button type="button" title="축소" onclick="hideTip();MAP.api.zoom(.7)"><i class="ri-subtract-line"></i></button><button type="button" title="처음 위치" onclick="hideTip();MAP.api.reset()"><i class="ri-focus-3-line"></i></button></div>'+
    '<span class="lbl">'+(lv==='n'?'전국 · 시도별 집계 (확대 시 기관별 → 단말기 표출)':lv==='sd'?REG.q+' · 기관별 집계 (확대 시 단말기 표출)':REG.q+' · 단말기 '+inR+'개소')+'</span>');
  el.classList.remove('m1','m2','m3');el.classList.add('m'+MODE);
  byId('mapInfo').textContent=(REG?REG.q:'전국')+' · 목록 단말기 '+inR+'개소'+(vis>inR?' (지역 밖 '+(vis-inR)+'개소)':'');
}
function dnGo(k){var d=DN[k];if(d.reg){setReg(d.reg);selTree(null);draw();msg(d.reg+' 지역으로 지도를 이동하였습니다.')}else{var q=MAP.P(d.c);MAP.api.focus(q[0],q[1],d.zn);msg(d.nm.join(', ')+' 영역을 확대하였습니다.')}}
function devMode(n){MODE=n;draw();msg('배경지도를 '+['기본','2D','위성'][n-1]+'으로 전환했습니다.')}
document.addEventListener('toggle',function(e){if(e.target.closest&&e.target.closest('#termMap'))LGOPEN=e.target.open},true);
document.addEventListener('change',function(e){var t=e.target;if(!t.closest('#termMap'))return;if(t.dataset.md){MDON[t.dataset.md]=t.checked;draw();msg((t.checked?'표출: ':'숨김: ')+t.parentNode.textContent.trim())}else if(t.hasAttribute('data-rng')){RNG=t.checked;draw();msg('가청범위 표시를 '+(RNG?'켰':'껐')+'습니다.')}});
byId('termMap').addEventListener('mousedown',function(e){if(!e.target.closest('.gm-tip,.gm-sym'))hideTip()});
byId('termMap').addEventListener('wheel',hideTip);
/* 툴팁 */
function hideTip(){var t=byId('devTip');if(t)t.remove()}
function showTip(i){hideTip();var el=byId('termMap'),b=el.querySelector('.dev-sym[data-k="'+i+'"]');if(!b)return;
  var tr=ROWS[i],md=mdOf(tr),st=stOf(tr),mn=GeoMap.MEDIA.filter(function(m){return m[0]===md})[0][1],t=document.createElement('div');t.className='gm-tip';t.id='devTip';
  t.innerHTML='<div class="tip-h"><b>'+tr.cells[5].textContent+'</b><button type="button" class="tip-x" title="닫기" onclick="hideTip()"><i class="ri-close-line"></i></button></div><ul><li><em>유형</em>'+mn+'</li><li><em>예경보시스템</em>'+tr.cells[3].textContent+'</li><li><em>상태</em>'+tr.cells[1].innerHTML+'</li><li><em>설치지역</em>'+tr.cells[6].textContent+'</li><li><em>가청범위</em>'+(RNG_M[md]?'0 ~ '+RNG_M[md].toLocaleString()+'m':'-')+'</li><li class="clk" onclick="symDbl('+i+')"><i class="ri-file-list-3-line"></i>상세정보 보기 (더블클릭)</li></ul>';
  el.appendChild(t);var R=el.getBoundingClientRect(),r=b.getBoundingClientRect(),x=r.left-R.left+r.width/2,y=r.top-R.top,w=t.offsetWidth,hh=t.offsetHeight,L,T;
  if(y-hh-6>8){T=y-hh-6;L=x-w/2}else if(r.bottom-R.top+hh+6<R.height-8){T=r.bottom-R.top+6;L=x-w/2}else{T=y+r.height/2-hh/2;L=x+w+30<R.width-240?x+18:x-w-18}
  t.style.left=Math.max(8,Math.min(R.width-w-8,L))+'px';t.style.top=Math.max(8,Math.min(R.height-hh-8,T))+'px'}
function mark(i){SEL=i;ROWS.forEach(function(x,k){x.classList.toggle('on',k===i)});Q('#termMap .dev-sym').forEach(function(p){p.classList.toggle('on',+p.dataset.k===i)})}
function symClick(i){mark(i);showTip(i);msg(ROWS[i].cells[5].textContent+' 단말기 정보를 표시합니다. (더블클릭: 상세정보)')}
function symDbl(i){ROWS[i].ondblclick.call(ROWS[i])}
/* 목록 행 → 해당 시군구로 이동·확대, 선택 핀 */
function focusDev(tr,i){
  tr=tr||ROWS[i];var a=tr.cells[6].textContent.trim(),c=PT[i];mark(i);
  if(!c){msg('설치지역 좌표를 찾을 수 없습니다.',true);return}
  if(!REG||a.indexOf(REG.q)!==0){setReg(a.split(' ').slice(0,-1).join(' '));selTree(null);draw();mark(i)}
  var b=byId('termMap').querySelector('.dev-sym[data-k="'+i+'"]');
  if(!b){msg(tr.cells[5].textContent+' 단말기는 범례에서 숨긴 매체입니다.');return}
  var q=MAP.P(c);MAP.api.focus(q[0],q[1],REG.lv==='sd'?3:2.5);showTip(i);
  msg(tr.cells[5].textContent+' 단말기 위치로 이동하였습니다.');
}
/* 트리 노드 지도 이동 버튼 */
Q('.tree-box .nd').forEach(function(nd){var b=document.createElement('button');b.type='button';b.className='go';b.title='지도에서 보기';b.setAttribute('onclick','goTree(this)');var t=nd.querySelector('.chk span');if(t)t.title=t.textContent.trim();b.innerHTML='<i class="ri-map-pin-2-line"></i>';nd.insertBefore(b,nd.querySelector('em'))});
function selTree(nd){Q('.tree-box .nd.sel').forEach(function(x){x.classList.remove('sel')});if(nd)nd.classList.add('sel')}
function goTree(b){var nd=b.parentNode,c=nd.querySelector('input'),q=null;
  if(c.dataset.org)q=ORG[c.dataset.org][0];else if(c.classList.contains('p'))q=ORG[nd.parentNode.querySelector('input[data-org]').dataset.org][0].split(' ')[0];
  selTree(nd);setReg(q);SEL=-1;draw();mark(-1);msg((q||'전국')+' 지역으로 지도를 이동하였습니다.')}
/* 체크가 한 시도(또는 한 시군구 기관)로 좁혀지면 그 지역으로 이동 */
function autoReg(){var all=Q('#platformTree input[data-org]:not(:disabled)'),ck=all.filter(function(c){return c.checked});if(!ck.length||ck.length===all.length)return;
  var rs=ck.map(function(c){return ORG[c.dataset.org][0]}),sd=rs.map(function(r){return r.split(' ')[0]}).filter(function(v,k,a){return a.indexOf(v)===k});
  if(sd.length===1){setReg(rs.length===1?rs[0]:sd[0]);selTree(null)}else if(REG&&sd.indexOf(REG.q.split(' ')[0])<0){setReg(null);selTree(null)}}
/* 트리 체크·검색조건 → 목록·건수·지도 재조회 */
/* 단말기 목록 시도별 묶음 행: 보이는 단말기가 있는 시도만 표시, 건수는 트리에서 체크된 기관 합계 */
function grpRows(){Q('#devTbody tr.grp').forEach(function(g){var sd=g.dataset.sd,vis=ROWS.some(function(tr){return tr.dataset.sd===sd&&!tr.hidden}),li=Q('#platformTree>li').filter(function(l){return l.querySelector('.nd span').textContent===sd})[0],n=0,e=0;
 if(li)[].forEach.call(li.querySelectorAll('input[data-org]:checked'),function(c){n+=+c.dataset.n;e+=+c.dataset.e});g.hidden=!vis;
 var ok=stF==='9'?0:n-e,ng=stF==='0'?0:e;g.querySelector('em').innerHTML='단말기 <b>'+(ok+ng).toLocaleString()+'</b>대 · 연결 <b class="c-sc">'+ok.toLocaleString()+'</b> · 끊김 <b class="c-dg">'+ng+'</b>'})}
function search(silent){
  var on={},n=0,e=0;
  Q('#platformTree input[data-org]').forEach(function(c){if(c.checked){on[c.dataset.org]=1;n+=+c.dataset.n;e+=+c.dataset.e}});
  byId('count_all').textContent=n.toLocaleString();byId('count_0').textContent=(n-e).toLocaleString();byId('count_9').textContent=e;
  var a1=byId('addr1'),pre=[a1.value?a1.options[a1.selectedIndex].text:'',byId('addr2').value,byId('addr3').value].filter(Boolean).join(' '),ty=byId('dev_type').value,kw=byId('termKeyword').value.trim(),vis=0;
  ROWS.forEach(function(tr,i){var s=on[tr.dataset.org]&&(!stF||tr.dataset.st===stF)&&(!pre||tr.cells[6].textContent.indexOf(pre)===0)&&(!ty||tr.dataset.media===ty)&&(!kw||tr.cells[5].textContent.indexOf(kw)>-1);tr.hidden=!s;if(s)vis++;else if(SEL===i)SEL=-1});
  document.querySelector('#devTbody .nodata').hidden=vis>0;
  grpRows();

  draw();
  if(!silent)msg('체크된 연계기관의 단말기 목록을 조회하였습니다. (전체 '+n.toLocaleString()+'대)');
}
document.getElementById('platformTree').addEventListener('change',function(e){
  var c=e.target,li=c.closest('li');
  if(c.classList.contains('p'))Q('#platformTree li').filter(function(x){return x.parentNode.closest('li')===li}).forEach(function(x){var i=x.querySelector('input');if(!i.disabled)i.checked=c.checked});
  else{var pl=li.parentNode.closest('li'),k=[].slice.call(pl.querySelectorAll('ul input:not(:disabled)')),cnt=k.filter(function(x){return x.checked}).length,p=pl.querySelector('input.p');p.checked=cnt===k.length;p.indeterminate=cnt>0&&cnt<k.length}
  var all=Q('#platformTree input[data-org]:not(:disabled)'),ck=all.filter(function(x){return x.checked}).length,a=document.getElementById('treeAllChk');a.checked=ck===all.length;a.indeterminate=ck>0&&ck<all.length;
  autoReg();search();
});
document.getElementById('treeAllChk').addEventListener('change',function(){var v=this.checked;Q('#platformTree input:not(:disabled)').forEach(function(x){x.checked=v;x.indeterminate=false});search()});
function filterStatus(b,s){
  stF=s;Q('#stFilter button').forEach(function(x){x.className='btn s '+(x===b?'btn-pri':'btn-line')});search(true);
  msg((s==='0'?'연결':s==='9'?'끊김':'전체')+' 단말기만 표출합니다.');
}
function openDetail(q){var n=new URLSearchParams(q).get('n'),c=PT[ROWS.map(function(tr){return tr.cells[5].textContent}).indexOf(n)];if(c)q+='&lat='+c[1].toFixed(5)+'&lng='+c[0].toFixed(4);openPop('pop/UI-DA04-003-P01.html?'+q,900)}
window.onSearch=function(){var a1=byId('addr1');if(a1.value){setReg(a1.options[a1.selectedIndex].text+(byId('addr2').value?' '+byId('addr2').value:''));selTree(null)}search(true);msg('단말기 목록을 조회하였습니다.');return false};
search(true);
