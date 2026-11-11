/* DAMS mockup gismap.js — 행정경계 지도(VWorld 대체) + 심볼·범례 공통
   필요: js/geo/kr-geo.js(window.KRGEO) 먼저 로드.
   좌표계: 지도 요소 안의 % (svg viewBox 0 0 100 100, preserveAspectRatio none) */
(function(){
'use strict';
var G=window.KRGEO||{sido:[],sgg:[],emd:[]};
var SIDO={'서울':'11','부산':'21','대구':'22','인천':'23','광주':'24','대전':'25','울산':'26','세종':'29','경기':'31','강원':'32','충북':'33','충남':'34','전북':'35','전남':'36','전남광주':['24','36'],'경북':'37','경남':'38','제주':'39',
 '서울특별시':'11','부산광역시':'21','대구광역시':'22','인천광역시':'23','광주광역시':'24','대전광역시':'25','울산광역시':'26','세종특별자치시':'29','경기도':'31','강원도':'32','강원특별자치도':'32','충청북도':'33','충청남도':'34','전라북도':'35','전북특별자치도':'35','전라남도':'36','전남광주통합특별시':['24','36'],'경상북도':'37','경상남도':'38','제주특별자치도':'39'};
var DEC={};
/* 2026 광주광역시 + 전라남도 → 전남광주통합특별시: 2013 경계의 시도 피처를 합침(전남의 광주 구멍 링 제거, 광주 시도 피처 삭제). 시군구·읍면동 코드는 그대로(24·36) */
(function(){var a=G.sido.filter(function(f){return f[0]==='24'})[0],b=G.sido.filter(function(f){return f[0]==='36'})[0];if(!a||!b)return;
 var dec=function(r){var x=r[0],y=r[1],o=[[x,y]];for(var i=2;i<r.length;i+=2){x+=r[i];y+=r[i+1];o.push([x,y])}return o},bb=function(ps){var q=[1e9,1e9,-1e9,-1e9];ps.forEach(function(p){q[0]=Math.min(q[0],p[0]);q[1]=Math.min(q[1],p[1]);q[2]=Math.max(q[2],p[0]);q[3]=Math.max(q[3],p[1])});return q};
 var A=bb([].concat.apply([],a[2].map(dec))),t=2000;
 b[2]=b[2].filter(function(r){var q=bb(dec(r));return !(q[0]>=A[0]-t&&q[1]>=A[1]-t&&q[2]<=A[2]+t&&q[3]<=A[3]+t)});
 b[1]='전남광주통합특별시';G.sido=G.sido.filter(function(f){return f!==a})})();
var inSc=function(sc,c){return Array.isArray(sc)?sc.indexOf(c)>-1:sc===c};
function rings(f){var k=f[0];if(DEC[k])return DEC[k];return DEC[k]=f[2].map(function(a){var o=[],x=a[0],y=a[1];o.push([x/1e4,y/1e4]);for(var i=2;i<a.length;i+=2){x+=a[i];y+=a[i+1];o.push([x/1e4,y/1e4])}return o})}
function bbox(fs){var b=[180,90,-180,-90];fs.forEach(function(f){rings(f).forEach(function(r){r.forEach(function(p){if(p[0]<b[0])b[0]=p[0];if(p[1]<b[1])b[1]=p[1];if(p[0]>b[2])b[2]=p[0];if(p[1]>b[3])b[3]=p[1]})})});return b}
function centroid(f){var r=rings(f).reduce(function(a,b){return b.length>a.length?b:a},[]),x=0,y=0,A=0;
 for(var i=0,j=r.length-1;i<r.length;j=i++){var c=r[j][0]*r[i][1]-r[i][0]*r[j][1];A+=c;x+=(r[j][0]+r[i][0])*c;y+=(r[j][1]+r[i][1])*c}
 if(!A){var b=bbox([f]);return [(b[0]+b[2])/2,(b[1]+b[3])/2]}return [x/(3*A),y/(3*A)]}
/* 점이 피처(행정구역) 안에 있는지 — 짝홀 규칙(섬·구멍 링 포함) / 내륙(시군구 어딘가) 판정 */
var FB={};function fbox(f){return FB[f[0]]||(FB[f[0]]=bbox([f]))}
function inFeat(f,x,y){var b=fbox(f);if(x<b[0]||x>b[2]||y<b[1]||y>b[3])return false;var n=0;rings(f).forEach(function(r){for(var i=0,j=r.length-1,c=false;i<r.length;j=i++){if((r[i][1]>y)!==(r[j][1]>y)&&x<(r[j][0]-r[i][0])*(y-r[i][1])/(r[j][1]-r[i][1])+r[i][0])c=!c}if(c)n++});return n%2===1}
function onLand(x,y){return G.sgg.some(function(f){return inFeat(f,x,y)})}
var nz=function(s){return String(s||'').replace(/\s/g,'')};
/* 지역명 → 피처 목록. "울산 동구", "충남 천안시 동남구", "울산광역시 동구 일산동", "26030" 모두 허용 */
function find(q){
 if(/^\d+$/.test(q)){var L=q.length<=2?'sido':q.length<=5?'sgg':'emd';return G[L].filter(function(f){return f[0].indexOf(q)===0})}
 var t=String(q).trim().split(/\s+/),sc=SIDO[t[0]],rest=t.slice(sc?1:0);
 var pool=function(L){return G[L].filter(function(f){return !sc||inSc(sc,f[0].slice(0,2))})};
 if(!rest.length)return sc?G.sido.filter(function(f){return inSc(sc,f[0])}):[];
 var s1=nz(rest.join('')),sgg=pool('sgg').filter(function(f){return s1.indexOf(nz(f[1]))===0||nz(f[1]).indexOf(s1)===0});
 if(!sgg.length){/* 시군구가 구로 나뉜 시(천안시 → 천안시동남구·서북구) */sgg=pool('sgg').filter(function(f){return nz(f[1]).indexOf(nz(rest[0]))===0})}
 var best=sgg.filter(function(f){return s1.indexOf(nz(f[1]))===0}).sort(function(a,b){return b[1].length-a[1].length})[0];
 if(best){var tail=s1.slice(nz(best[1]).length);if(!tail)return [best];
  var e=G.emd.filter(function(f){return f[0].indexOf(best[0])===0&&(nz(f[1])===tail||nz(f[1]).indexOf(tail.replace(/\d*동$/,''))===0)});return e.length?e:[best]}
 if(sgg.length)return sgg;
 return pool('emd').filter(function(f){return nz(f[1])===s1})}
/* 화면 비율에 맞춘 경계 → 투영함수 */
function fit(b,w,h,pad){pad=pad==null?.12:pad;var kx=Math.cos((b[1]+b[3])/2*Math.PI/180),dx=(b[2]-b[0])*kx||.02,dy=(b[3]-b[1])||.02;dx*=1+pad*2;dy*=1+pad*2;
 var r=w/h;if(dx/dy>r)dy=dx/r;else dx=dy*r;var cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,lw=dx/kx;return {x0:cx-lw/2,x1:cx+lw/2,y0:cy-dy/2,y1:cy+dy/2}}
function proj(B){var f=function(lon,lat){if(lon&&lon.length){lat=lon[1];lon=lon[0]}return [(lon-B.x0)/(B.x1-B.x0)*100,(B.y1-lat)/(B.y1-B.y0)*100]};f.B=B;return f}
function path(fs,P,clip){var d='';fs.forEach(function(f){if(clip&&!hit(f,clip))return;rings(f).forEach(function(r){var s='',px,py;r.forEach(function(p,i){var q=P(p),x=q[0].toFixed(2),y=q[1].toFixed(2);if(x===px&&y===py)return;s+=(s?'L':'M')+x+' '+y;px=x;py=y});d+=s+'Z'})});return d}
function hit(f,B){var b=bbox([f]);return !(b[2]<B.x0||b[0]>B.x1||b[3]<B.y0||b[1]>B.y1)}
/* keep(피처) 밖 전부: 시군구 단위로, keep이 읍면동이면 그 시군구 안 나머지 읍면동까지 */
function outside(keep){var k={};keep.forEach(function(f){k[f[0]]=1});if(k['36'])k['24']=1;/* 전남광주통합특별시(36) = 광주(24) 포함 */var o=[];
 G.sgg.forEach(function(g){var c=g[0];if(k[c]||k[c.slice(0,2)])return;var part=keep.some(function(f){return f[0].indexOf(c)===0});
  if(!part){o.push(g);return}G.emd.forEach(function(e){if(e[0].indexOf(c)===0&&!k[e[0]])o.push(e)})});return o}
/* 기본도 SVG: opt.keep(피처)=이 지역 밖 회색, opt {hl:[피처](노랑), hl2:[피처](연한 노랑), nc:[피처](미연계지역 회색 빗금), un:[피처](미발령지역 점무늬), lk:[피처](연계지역 테두리), evb:[피처](재난발생지역 테두리), dim:[보이게 둘 시도코드](그 밖 회색), emd:true(읍면동 경계), clip:true(화면 밖 생략)} */
function svg(P,opt){opt=opt||{};var B=P.B,clip=opt.clip===false?null:B&&{x0:B.x0-.3,x1:B.x1+.3,y0:B.y0-.3,y1:B.y1+.3};
 var h='<svg class="gm-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
 h+='<path class="gm-land" d="'+path(G.sgg,P,clip)+'"/>';
 if(opt.keep&&opt.keep.length)h+='<path class="gm-dim" d="'+path(outside(opt.keep),P,clip)+'"/>';
 else if(opt.dim)h+='<path class="gm-dim" d="'+path(G.sgg.filter(function(f){return opt.dim.indexOf(f[0].slice(0,2))<0}),P,clip)+'"/>';
 if(opt.nc&&opt.nc.length)h+='<defs><pattern id="gmNc" patternUnits="userSpaceOnUse" width=".7" height=".7" patternTransform="rotate(-45)"><rect width=".7" height=".7" class="gm-nc-bg"/><line x1="0" y1="0" x2="0" y2=".7" class="gm-nc-ln"/></pattern></defs><path class="gm-nc" d="'+path(opt.nc,P,clip)+'"/>';
 /* 미발령지역(재난발생지역 중 매칭 발령 없는 곳): 점무늬 */
 if(opt.un&&opt.un.length)h+='<defs><pattern id="gmUn" patternUnits="userSpaceOnUse" width=".55" height=".55"><rect width=".55" height=".55" class="gm-un-bg"/><circle cx=".275" cy=".275" r=".09" class="gm-un-dot"/></pattern></defs><path class="gm-un" d="'+path(opt.un,P,clip)+'"/>';
 if(opt.hl2&&opt.hl2.length)h+='<defs><pattern id="gmHatch" patternUnits="userSpaceOnUse" width=".7" height=".7" patternTransform="rotate(45)"><rect width=".7" height=".7" class="gm-hatch-bg"/><line x1="0" y1="0" x2="0" y2=".7" class="gm-hatch-ln"/></pattern></defs><path class="gm-hl2" d="'+path(opt.hl2,P)+'"/>';
 if(opt.hl&&opt.hl.length)h+='<defs><pattern id="gmCross" patternUnits="userSpaceOnUse" width=".6" height=".6" patternTransform="rotate(45)"><rect width=".6" height=".6" class="gm-cross-bg"/><path d="M.3 0V.6M0 .3H.6" class="gm-cross-ln"/></pattern></defs><path class="gm-hl" d="'+path(opt.hl,P)+'"/>';
 if(opt.emd!==false)h+='<path class="gm-emd" d="'+path(G.emd.filter(function(f){return !opt.emdIn||opt.emdIn.indexOf(f[0].slice(0,2))>-1}),P,clip)+'"/>';
 h+='<path class="gm-sgg" d="'+path(G.sgg,P,clip)+'"/><path class="gm-sido" d="'+path(G.sido,P,clip)+'"/>';
 if(opt.hl2&&opt.hl2.length)h+='<path class="gm-hl2-ln" d="'+path(opt.hl2,P)+'"/>';
 if(opt.hl&&opt.hl.length)h+='<path class="gm-hl-ln" d="'+path(opt.hl,P)+'"/>';
 /* 연계지역(DAMS 연계 기관 관할) 테두리 */
 if(opt.lk&&opt.lk.length)h+='<path class="gm-lk" d="'+path(opt.lk,P,clip)+'"/>';
 /* 재난발생지역 테두리(빨강 점선) */
 if(opt.evb&&opt.evb.length)h+='<path class="gm-evb" d="'+path(opt.evb,P,clip)+'"/>';
 return h+'</svg>'}
function at(P,lon,lat){var q=P(lon,lat);return 'left:'+q[0].toFixed(2)+'%;top:'+q[1].toFixed(2)+'%'}
/* 라벨: level 'sido'|'sgg'|'emd', 화면 안 것만 */
function labels(P,level,filter){var B=P.B;return G[level].filter(function(f){return (!filter||filter(f))&&hit(f,B)}).map(function(f){var c=centroid(f),n=level==='sido'?f[1].replace(/통합특별시$/,'').replace(/(특별자치도|특별자치시|광역시|특별시|도)$/,'').replace(/^(충청|전라|경상)(북|남)$/,function(m,a,b){return a[0]+b}):f[1];return '<span class="gm-lbl '+level+'" style="'+at(P,c)+'">'+n+'</span>'}).join('')}
/* 기본 라벨: 강조 지역의 시군구 안은 읍면동, 나머지는 시군구, 그 밖은 시도 */
function autoLabels(P,fs){if(!fs.length)return labels(P,'sido');var sg={},sd={};fs.forEach(function(f){sg[f[0].slice(0,5)]=1;sd[f[0].slice(0,2)]=1});
 return labels(P,'emd',function(f){return sg[f[0].slice(0,5)]})+labels(P,'sgg',function(f){return sd[f[0].slice(0,2)]&&!sg[f[0]]})+labels(P,'sido',function(f){return !sd[f[0]]})}
/* 매체 코드 */
var MEDIA=[['BIS','버스정보시스템'],['CDB','재해문자전광판(행정안전부)'],['LDB','재해문자전광판(지자체)'],['TDB','교통전광판'],['PDB','전광판(민간)'],['ADD','자율주행표시장치(C-ITS)'],['VBS','마을방송시스템'],['VNS','자동음성통보시스템'],['VNI','자동음성통보시스템(실내)'],['VNO','자동음성통보시스템(실외)'],['RAS','자동우량경보시스템'],['DSB','디지털사이니지']];
var MEDIA_BY_NAME={'재해문자전광판':'LDB','재해문자전광판(행안부)':'CDB','재해문자전광판(지자체)':'LDB','마을방송':'VBS','자동음성통보':'VNO','자동우량경보':'RAS','버스정보시스템':'BIS','교통전광판':'TDB','디지털사이니지':'DSB'};
/* 단말기 심볼: st ok|ng|off */
function dev(P,lon,lat,md,st,attr,on){return '<button type="button" class="gm-sym dev-sym '+md+' '+(st||'ok')+(on?' on':'')+'" style="'+at(P,lon,lat)+'" '+(attr||'')+'><i></i></button>'}
function donut(P,lon,lat,n,ok,ng,attr){var t=n||1;return '<button type="button" class="gm-sym gm-donut'+(n<20?' sm':'')+'" style="'+at(P,lon,lat)+';--ok:'+(ok/t*100).toFixed(1)+'%;--ng:'+(ng/t*100).toFixed(1)+'%" '+(attr||'')+' title="단말기 '+n+'대 (성공 '+ok+' · 실패 '+ng+' · 정지 '+(n-ok-ng)+')"><b>'+n+'</b></button>'}
function cluster(P,lon,lat,n,attr){return '<button type="button" class="gm-sym gm-cl" style="'+at(P,lon,lat)+'" '+(attr||'')+' title="겹친 심볼 '+n+'건"><b>+'+n+'</b></button>'}
/* 범례 */
function MOB(){return window.matchMedia&&matchMedia('(max-width:767px)').matches}
function legendDevice(on,rng,o){on=on||{};o=o||{};return '<details class="gm-lgd"'+(o.open===false||(o.open==null&&MOB())?'':' open')+'><summary>범례(단말기)</summary><div class="gm-lgd-b"><ul class="st"><li><i class="ok"></i>성공</li><li><i class="ng"></i>실패</li>'+(o.off===false?'':'<li><i class="off"></i>'+(o.off||'정지')+'</li>')+'</ul><ul class="md">'+(o.only?MEDIA.filter(function(m){return o.only.indexOf(m[0])>-1}):MEDIA).map(function(m){var c=on[m[0]]!==false;return '<li><label class="'+m[0]+'"><input type="checkbox" data-md="'+m[0]+'"'+(c?' checked':'')+'>'+m[1]+'</label></li>'}).join('')+'</ul>'+(o.extra||'')+
 (rng==null?'':'<div class="etc"><label class="tgl"><input type="checkbox" data-rng'+(rng?' checked':'')+'><span>가청범위</span></label></div>')+'</div></details>'}
function legendHazard(extra){return '<details class="gm-lgd"'+(MOB()?'':' open')+'><summary>범례(재난)</summary><div class="gm-lgd-b"><ul class="hz"><li><i class="hz-ico s lv-d"></i>경보</li><li><i class="hz-ico s lv-a"></i>주의보</li><li><i class="hz-ico s lv-i"></i>정보·해제</li></ul><ul class="hz"><li><i class="gm-cl-i">+2</i>겹친 재난 심볼</li>'+(extra||'')+'</ul></div></details>'}
function modeBtns(cur,fn){return '<div class="gm-mode">'+['기본','2D','위성'].map(function(t,i){return '<button type="button" class="m'+(i+1)+(cur===i+1?' on':'')+'" onclick="'+fn+'('+(i+1)+')"><span>'+t+'</span></button>'}).join('')+'</div>'}
/* 확대·이동: stage 요소에 transform, 심볼은 --z로 역보정 */
/* GIS 안내 문구: 지도(interact/mount)마다 한 번 표시. 갱신일은 GeoMap.GIS_DATE */
var GIS_DATE='2026-11-03';
function note(box){if(box&&!box.querySelector('.gm-note'))box.insertAdjacentHTML('beforeend','<p class="gm-note">※ 행정구역은 현재 GIS 정보로 표출됩니다. (GIS 최종갱신일자 : '+GIS_DATE+')</p>')}
function interact(box,stage,opt){opt=opt||{};note(box);var z=1,tx=0,ty=0,drag=null,min=opt.min||1,max=opt.max||12;
 function ap(){stage.style.transform='translate('+tx+'px,'+ty+'px) scale('+z+')';stage.style.setProperty('--z',z);box.dataset.zl=z>=6?3:z>=2.5?2:1}
 box.addEventListener('wheel',function(e){e.preventDefault();var r=box.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,nz=Math.min(max,Math.max(min,z*(e.deltaY<0?1.25:.8)));tx=mx-(mx-tx)*nz/z;ty=my-(my-ty)*nz/z;z=nz;if(z===1){tx=ty=0}ap()},{passive:false});
 box.addEventListener('mousedown',function(e){if(e.button||e.target.closest('button,a,input,label,details,.gm-tip'))return;drag=[e.clientX-tx,e.clientY-ty];box.classList.add('drag')});
 window.addEventListener('mousemove',function(e){if(!drag)return;tx=e.clientX-drag[0];ty=e.clientY-drag[1];ap()});
 window.addEventListener('mouseup',function(){drag=null;box.classList.remove('drag')});
 var api={zoom:function(f){var r=box.getBoundingClientRect();var nz=Math.min(max,Math.max(min,z*f));tx=r.width/2-(r.width/2-tx)*nz/z;ty=r.height/2-(r.height/2-ty)*nz/z;z=nz;if(z===1)tx=ty=0;ap()},reset:function(){z=1;tx=ty=0;ap()},focus:function(px,py,nz){var r=box.getBoundingClientRect();z=nz;tx=r.width/2-px/100*r.width*z;ty=r.height/2-py/100*r.height*z;ap()}};ap();return api}
/* 한 번에: el(.map-box) 안에 stage(기본도+라벨+심볼층)를 만들고 투영 반환 */
function mount(el,opt){opt=opt||{};var r=el.getBoundingClientRect(),w=r.width||600,h=r.height||400;
 var fs=opt.region?[].concat.apply([],[].concat(opt.region).map(find)):[];var b=opt.bbox||(fs.length?bbox(fs):[124.6,33.1,131,38.7]);
 if(opt.points)opt.points.forEach(function(p){if(!p)return;b=[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])]});
 var P=proj(fit(b,w,h,opt.pad));var sc=fs.length?fs.map(function(f){return f[0].slice(0,2)}).filter(function(c,i,a){return a.indexOf(c)===i}):null;
 var st=el.querySelector('.gm-stage');if(!st){st=document.createElement('div');st.className='gm-stage';el.insertBefore(st,el.firstChild)}
 st.innerHTML=svg(P,{hl:opt.hl===false?null:fs,dim:opt.dim===false||!sc?null:(opt.dim||(sc.indexOf('36')>-1&&sc.indexOf('24')<0?sc.concat('24'):sc)),emdIn:opt.emdIn})+'<div class="gm-ly-lbl">'+(opt.labels===false?'':opt.labels?labels(P,opt.labels,opt.lblFilter):autoLabels(P,fs))+'</div><div class="gm-ly-sym"></div>';
 el.classList.add('gm');if(!el.dataset.gmi){el.dataset.gmi=1;el._gm=interact(el,st,opt)}else el._gm.reset();
 return {P:P,features:fs,stage:st,sym:st.querySelector('.gm-ly-sym'),api:el._gm}}
window.GeoMap={inFeat:inFeat,onLand:onLand,autoLabels:autoLabels,path:path,find:find,bbox:bbox,centroid:centroid,fit:fit,proj:proj,svg:svg,labels:labels,at:at,dev:dev,donut:donut,cluster:cluster,legendDevice:legendDevice,legendHazard:legendHazard,modeBtns:modeBtns,interact:interact,mount:mount,note:note,MEDIA:MEDIA,MEDIA_BY_NAME:MEDIA_BY_NAME,
 /* 지역명의 대표 좌표(읍면동 중심) + 같은 곳 여러 개면 살짝 흩뜨림 */
 point:function(q,k){var f=find(q)[0];if(!f)return null;var c=centroid(f);if(k){var a=k*2.4,d=.004*Math.sqrt(k);c=[c[0]+Math.cos(a)*d,c[1]+Math.sin(a)*d*.8]}return c}};
})();
