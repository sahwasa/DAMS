/* 단말기통계 | 재난 예경보 통합관리시스템 */
function changePeriodType(v){
  var m={year:['selYear'],month:['selYear','selMonth'],quarter:['selYear','selQuarter'],custom:['periodRange']}[v];
  ['selYear','selMonth','selQuarter','periodRange'].forEach(function(id){document.getElementById(id).hidden=m.indexOf(id)<0});
}
/* 지역 레벨: 시도별(원본) / 시군구별(시도 값을 시군구로 나눠 생성 — 합계 동일) */
var UNIT='sido',ORIG={},SPLIT={'전남광주통합특별시':['전남광주',['구례군','보성군','함평군']],'대전광역시':['대전',['중구','서구','유성구']],'울산광역시':['울산',['중구','동구','울주군']],'경기도':['경기',['수원시','부천시','안성시']],'강원특별자치도':['강원',['춘천시','강릉시','철원군']],'충청남도':['충남',['천안시','공주시','아산시']],'경상북도':['경북',['포항시','경주시','안동시']]},W=[.46,.32,.22],ADJ=[1.08,.94,.98];
function num(t){return +String(t).replace(/[^0-9.]/g,'')}
function split(n){var a=W.map(function(w){return Math.floor(n*w)}),r=n-a[0]-a[1]-a[2],i=0;while(r-->0)a[i++%3]++;return a}
/* 시군구마다 끊김 건수에 편차(합계는 유지) */
function splitAdj(n){var a=split(n),b=[Math.round(a[0]*ADJ[0]),Math.round(a[1]*ADJ[1])];b.push(n-b[0]-b[1]);return b}
function hli(nm,ok,ng){var T=ok+ng,d=(ng/T*100).toFixed(1);return '<li title="'+nm+' — 연결 '+ok.toLocaleString()+' · 끊김 '+ng.toLocaleString()+'"><span class="lb">'+nm+'</span><span class="bar"><span class="cl-sc" style="width:'+(ok/T*100).toFixed(2)+'%"></span><span class="cl-dg" style="width:'+(ng/T*100).toFixed(2)+'%"></span></span><span class="v">연결 <b class="c-sc">'+(100-d).toFixed(1)+'%</b> · 끊김 <b class="c-dg">'+d+'%</b></span></li>'}
function hc(v){return v<1.6?'h1':v<2.2?'h2':v<2.8?'h3':'h4'}
function grpRow(tr){return tr.outerHTML.replace(/^<tr[^>]*>/,'<tr class="grp">').replace(/class="heat h\d"/g,'class="t-r"').replace(/ title="[^"]*"/g,'')}
function setUnit(u){UNIT=u;var SL=document.getElementById('rgSido');SL.hidden=u!=='sgg';var SEL=u==='sgg'?SL.value:'';var tb=document.getElementById('deviceRegionTbody'),hb=document.querySelector('#deviceRegionHeatmap tbody'),ch=document.getElementById('deviceRegionChart');
 if(!ORIG.tb){ORIG.tb=tb.innerHTML;ORIG.hb=hb?hb.innerHTML:"";ORIG.ch=ch.innerHTML}
 var sg=u==='sgg',lb=sg?'시군구':'시도';document.getElementById('regionColTh').textContent=lb;document.getElementById('unitSub').textContent='('+lb+' 단위)';document.getElementById('regTit').textContent=lb+'별 통계';
 if(!sg){tb.innerHTML=ORIG.tb;ch.innerHTML=ORIG.ch}else{
  var t=document.createElement('tbody'),h=document.createElement('tbody');t.innerHTML=ORIG.tb;h.innerHTML=ORIG.hb;var rows=[],hrows=[],etc='',hetc='',tot='',htot='',li=[];
  [].forEach.call(t.rows,function(tr){var c=tr.cells,nm=c[0].textContent,sp=SPLIT[nm];if(tr.classList.contains('tot')){tot=SEL?'':tr.outerHTML;return}if(!sp){if(SEL)return;etc=tr.outerHTML.replace('기타 시도','기타 시군구');li.push({nm:'기타 시군구',ok:num(c[3].textContent),ng:num(c[4].textContent),etc:1});return}if(SEL&&nm!==SEL)return;rows.push({h:grpRow(tr)});
   var v=[1,2,4].map(function(i){return (i===4?splitAdj:split)(num(c[i].textContent))});sp[1].forEach(function(g,j){var tot2=v[1][j],ng=v[2][j],ok=tot2-ng,rt=(ok/tot2*100).toFixed(1)+'%',n=sp[0]+' '+g;
    rows.push({k:ng/tot2,h:'<tr class="clk sgc" onclick="showRegionDetail(this)"><td class="t-l">'+n+'</td><td class="t-r">'+v[0][j]+'</td><td class="t-r">'+tot2.toLocaleString()+'</td><td class="t-r">'+ok.toLocaleString()+'</td><td class="t-r">'+ng.toLocaleString()+'</td><td class="t-r">'+rt+'</td></tr>'});li.push({nm:n,ok:ok,ng:ng,k:ng/tot2})})});
  [].forEach.call(h.rows,function(tr){var c=tr.cells,nm=c[0].textContent,sp=SPLIT[nm];if(tr.classList.contains('tot')){htot=SEL?'':tr.outerHTML;return}if(!sp){hetc=SEL?'':tr.outerHTML.replace(/기타 시도/g,'기타 시군구');return}if(SEL&&nm!==SEL)return;hrows.push(grpRow(tr));
   sp[1].forEach(function(g,j){var n=sp[0]+' '+g,td='';for(var i=1;i<c.length;i++){var b=num(c[i].textContent),ng=Math.max(.5,(100-b)*ADJ[j]),r=(100-ng).toFixed(1),m=/설치 (\d+)대/.exec(c[i].title||''),ins=m?split(+m[1])[j]:0,md=(c[i].title||'').split(' — ')[0].replace(nm+' ','');
     td+=i<c.length-1?'<td class="heat '+hc(ng)+'" title="'+n+' '+md+' — 설치 '+ins+'대 · 수신율 '+r+'%">'+r+'%</td>':'<td class="t-r"><b>'+r+'%</b></td>'}hrows.push(td?'<tr class="sgc"><td class="t-l">'+n+'</td>'+td+'</tr>':'')})});
  /* 직제순 유지(정렬하지 않음) */tb.innerHTML=rows.map(function(r){return r.h}).join('')+etc+tot;
  li.sort(function(a,b){return a.etc?1:b.etc?-1:0});ch.innerHTML=li.map(function(x){return hli(x.nm,x.ok,x.ng)}).join('')}
 window.onSearch(document.getElementById('schForm'));drawRg();
 msg((sg?'시군구별'+(SEL?'('+SEL+')':''):'시도별')+' 비교로 지역별 단말기 통계를 조회하였습니다.')}
/* 지역별 단말기 상태(연결·끊김 비율): 지역별 표의 지역 행(시도별 = 시도 + 기타, 시군구별 = 시군구 + 기타)에서 그림 */
function drawRg(){var el=document.getElementById('rgChart');if(!el)return;var D=[].filter.call(document.querySelectorAll('#deviceRegionTbody tr.clk'),function(tr){return !tr.hidden}).map(function(tr){var c=tr.cells,ok=num(c[3].textContent),ng=num(c[4].textContent),t=ok+ng;return {n:c[0].textContent,ins:num(c[1].textContent),ok:ok,ng:ng,rr:(ok/t*100).toFixed(1),rt:(ng/t*100).toFixed(1)}}),
 N=D.map(function(d){return d.n}),sh=function(n){if(/^기타/.test(n))return n;if(n.indexOf(' ')>0)return n.split(' ').pop();return n.replace(/통합특별시$/,'').replace(/(특별자치도|특별자치시|광역시|특별시|도)$/,'').replace(/^(충청|전라|경상)(남|북)$/,function(m,a,b){return a[0]+b})},
 tt=function(d){return d.n+'<br>설치 '+d.ins.toLocaleString()+'대 · 연결 '+d.ok.toLocaleString()+' · 끊김 '+d.ng.toLocaleString()+'<br>수신율 '+d.rr+'%'};
 document.getElementById('rgTit2').textContent=(UNIT==='sgg'?'시군구별':'시도별')+' 설치 현황';
 var nar=ecNar(el);el.style.height=(RGM==='h'?Math.max(220,D.length*32+44):Math.max(320,D.length*20+60))+'px';var ch=echarts.getInstanceByDom(el);if(ch){ch.clear();ch.resize()}
 if(RGM==='d'){var ins=D.reduce(function(s,d){return s+d.ins},0),P=['#3e55e1','#2b9bd8','#00a37a','#f5930b','#8e6bd6','#e0587a','#5cb85c','#d8a227','#4b7bec','#20b2aa','#ff7f50','#9aa6ee','#6c8ebf','#c97b63','#7fb069','#b07fc0','#8e8e8e'];
  return EC(el,{tooltip:{trigger:'item',formatter:function(p){return p.marker+tt(D[p.dataIndex])+'<br>설치 비중 '+p.percent+'%'}},
   title:{text:ins.toLocaleString(),subtext:'설치 대수',left:'30%',top:'42%',textAlign:'center',textStyle:{fontSize:22,fontWeight:700,color:STC.tt},subtextStyle:{fontSize:12,color:STC.gray},itemGap:2},
   legend:ecLegend({type:'scroll',orient:'vertical',top:'middle',right:'2%',icon:'circle',itemGap:8,formatter:function(n){var d=D.filter(function(x){return x.n===n})[0];return sh(n)+'  '+(d.ins/ins*100).toFixed(1)+'%  (수신율 '+d.rr+'%)'}}),
   series:[{type:'pie',radius:['44%','72%'],center:['30%','52%'],label:{show:false},itemStyle:{borderColor:'#fff',borderWidth:2},data:D.map(function(d,i){return {name:d.n,value:d.ins,itemStyle:{color:/기타/.test(d.n)?'#c6c6c6':P[i%P.length]}}})}]})}
 /* 설치 대수가 중심(막대 길이), 수신율은 보조 — 전체 수신율보다 낮은 지역은 빨강으로 표시 */
 var tok=D.reduce(function(s,d){return s+d.ok},0),tall=D.reduce(function(s,d){return s+d.ok+d.ng},0),avg=tall?+(tok/tall*100).toFixed(1):100,low=function(d){return +d.rr<avg},NOTE=[{type:'text',left:8,bottom:4,style:{text:'수신율 빨강 = 전체 수신율('+avg+'%) 미만',fill:STC.gray,fontSize:11}}];
 if(RGM==='v'){var mn=Math.floor(Math.min.apply(null,D.map(function(d){return +d.rr}))-1);
  return EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:function(ps){return tt(D[ps[0].dataIndex])}},legend:ecLegend({data:['설치 대수','수신율']}),grid:{left:52,right:48,top:34,bottom:D.length>6?78:44},graphic:NOTE,
   xAxis:ecCat(N.map(sh),{axisLabel:{color:STC.tx,fontSize:11,interval:0,rotate:D.length>6?35:0}}),
   yAxis:[ecVal({name:'대',nameTextStyle:{color:STC.gray,fontSize:11},axisLabel:{color:STC.gray,fontSize:11,formatter:function(v){return v.toLocaleString()}}}),ecVal({min:Math.min(95,mn),max:100,interval:1,splitLine:{show:false},axisLabel:{color:STC.gray,fontSize:11,formatter:'{value}%'}})],
   series:[{name:'설치 대수',type:'bar',barMaxWidth:32,itemStyle:{color:STC.pri||'#3e55e1',borderRadius:[3,3,0,0]},label:{show:D.length<=12,position:'top',fontSize:11,fontWeight:600,color:STC.tt,formatter:function(p){return p.value.toLocaleString()}},data:D.map(function(d){return d.ins})},
    {name:'수신율',type:'line',yAxisIndex:1,symbol:'circle',symbolSize:7,lineStyle:{width:2,color:STC.sc},itemStyle:{color:STC.sc},data:D.map(function(d){return {value:+d.rr,itemStyle:{color:low(d)?STC.dg:STC.sc}}})}]})}
 EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:function(ps){return tt(D[ps[0].dataIndex])}},legend:{show:false},grid:{left:nar?64:130,right:nar?118:168,top:12,bottom:28},graphic:NOTE,
  xAxis:ecVal({splitLine:{show:false},axisLabel:{show:false}}),yAxis:ecCat(nar?N.map(sh):N,{inverse:true,axisLabel:{color:STC.tt,fontSize:12,fontWeight:600,interval:0,width:nar?56:120,overflow:'truncate'}}),
  series:[{name:'설치 대수',type:'bar',barMaxWidth:16,itemStyle:{color:STC.pri||'#3e55e1',borderRadius:[0,3,3,0]},data:D.map(function(d){return d.ins}),
   label:{show:true,position:'right',formatter:function(p){var d=D[p.dataIndex];return '{b|'+d.ins.toLocaleString()+'대}{a|  수신율 }'+(low(d)?'{c|':'{g|')+d.rr+'%}'},rich:{a:{color:STC.tx,fontSize:12},b:{color:STC.tt,fontWeight:700,fontSize:12},g:{color:STC.sc,fontWeight:700,fontSize:12},c:{color:STC.dg,fontWeight:700,fontSize:12}}}}]})}
function showRegionDetail(tr){
  tr.parentNode.querySelectorAll('tr').forEach(function(x){x.classList.toggle('on',x===tr)});
  msg(tr.cells[0].textContent+' 단말기 상태 통계를 표출합니다.');
}
/* 매체구분별 단말기 상태 [매체, 설치, 전체(기대 수신), 연결, 끊김] — 매체별 표와 같은 값. DMM(2026-11-12 설치 대수 주요·수신율 보조): h 가로 막대(설치 대수 + 수신율 라벨) · v 세로 막대(설치 대수) + 수신율 선(오른쪽 축) · d 비율(설치 대수 비중 도넛) */
/* 차트 종류 전환(공통): 버튼 그룹 선택 표시 → 모드 변수 저장 → 다시 그림 */
var RGM='h',DSM='c';
function chMode(b,v,m,f){b.parentNode.querySelectorAll('button').forEach(function(x){x.className='btn s ico '+(x===b?'btn-pri':'btn-line')});window[v]=m;window[f]();msg(b.closest('.card-h').firstChild.textContent.trim()+' 차트를 '+b.title+'(으)로 표시합니다.')}
var DM=[['자동음성통보',580,4217760,4141885,75875],['재해문자전광판',360,2617920,2581402,36518],['마을방송',412,2996064,2921993,74071],['자동우량경보',100,727200,710072,17128]],DMM='h',MPAL=['#3e55e1','#2b9bd8','#00a37a','#f5930b'];
function dmMode(b,m){b.parentNode.querySelectorAll('button').forEach(function(x){x.className='btn s ico '+(x===b?'btn-pri':'btn-line')});DMM=m;drawDm();msg('매체구분별 단말기 설치 현황을 '+b.title+'(으)로 표시합니다.')}
function drawDm(){var el=document.getElementById('deviceTypeChart');var D=DM.map(function(r){return {n:r[0],ins:r[1],t:r[2],ok:r[3],ng:r[4],rt:(r[4]/r[2]*100).toFixed(1),rr:(r[3]/r[2]*100).toFixed(1)}}),N=D.map(function(d){return d.n}),ins=D.reduce(function(s,d){return s+d.ins},0),
 tt=function(d){return d.n+'<br>설치 '+d.ins+'대 · 연결 '+d.ok.toLocaleString()+' · 끊김 '+d.ng.toLocaleString()+'<br>수신율 '+d.rr+'%'};
 if(DMM==='d')return EC(el,{tooltip:{trigger:'item',formatter:function(p){return p.marker+tt(D[p.dataIndex])+' · 설치 비중 '+p.percent+'%'}},
   title:{text:ins.toLocaleString(),subtext:'설치 대수',left:'26%',top:'40%',textAlign:'center',textStyle:{fontSize:22,fontWeight:700,color:STC.tt},subtextStyle:{fontSize:12,color:STC.gray},itemGap:2},
   legend:ecLegend({orient:'vertical',top:'middle',right:'4%',icon:'circle',itemGap:12,formatter:function(n){var d=D.filter(function(x){return x.n===n})[0];return n+'  '+(d.ins/ins*100).toFixed(1)+'%  (수신율 '+d.rr+'%)'}}),
   series:[{type:'pie',radius:['46%','76%'],center:['26%','52%'],label:{show:false},itemStyle:{borderColor:'#fff',borderWidth:2},data:D.map(function(d,i){return {name:d.n,value:d.ins,itemStyle:{color:MPAL[i]}}})}]});
 /* 주요 지표 = 설치 대수(막대), 보조 지표 = 수신율 — 전체 수신율보다 낮은 매체는 빨강 */
 var tok=D.reduce(function(s,d){return s+d.ok},0),tall=D.reduce(function(s,d){return s+d.t},0),avg=+(tok/tall*100).toFixed(1),low=function(d){return +d.rr<avg},
  NOTE=[{type:'text',left:8,bottom:4,style:{text:'수신율 빨강 = 전체 수신율('+avg+'%) 미만',fill:STC.gray,fontSize:11}}];
 if(DMM==='v')return EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:function(ps){return tt(D[ps[0].dataIndex])}},legend:ecLegend({data:['설치 대수','수신율']}),grid:{left:52,right:48,top:34,bottom:44},graphic:NOTE,
   xAxis:ecCat(N,{axisLabel:{color:STC.tx,fontSize:12,interval:0}}),
   yAxis:[ecVal({name:'대',nameTextStyle:{color:STC.gray,fontSize:11},axisLabel:{color:STC.gray,fontSize:11}}),ecVal({min:95,max:100,interval:1,splitLine:{show:false},axisLabel:{color:STC.gray,fontSize:11,formatter:'{value}%'}})],
   series:[{name:'설치 대수',type:'bar',barMaxWidth:56,itemStyle:{color:STC.pri,borderRadius:[3,3,0,0]},label:{show:true,position:'top',fontSize:12,fontWeight:600,color:STC.tt,formatter:function(p){return p.value.toLocaleString()+'대'}},data:D.map(function(d){return d.ins})},
    {name:'수신율',type:'line',yAxisIndex:1,symbol:'circle',symbolSize:8,lineStyle:{width:2,color:STC.sc},itemStyle:{color:STC.sc},label:{show:true,position:'top',distance:6,fontSize:11,fontWeight:700,backgroundColor:'#fff',borderColor:'#d8d8d8',borderWidth:1,borderRadius:3,padding:[2,4],formatter:function(p){return p.value+'%'},color:STC.sc},data:D.map(function(d){return {value:+d.rr,itemStyle:{color:low(d)?STC.dg:STC.sc},label:{color:low(d)?STC.dg:STC.sc}}})}]});
 var nar=ecNar(el);EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:function(ps){return tt(D[ps[0].dataIndex])}},legend:{show:false},grid:{left:nar?92:104,right:nar?118:168,top:12,bottom:28},graphic:NOTE,
  xAxis:ecVal({splitLine:{show:false},axisLabel:{show:false}}),yAxis:ecCat(N,{inverse:true,axisLabel:{color:STC.tt,fontSize:12,fontWeight:600,interval:0}}),
  series:[{name:'설치 대수',type:'bar',barMaxWidth:18,itemStyle:{color:STC.pri,borderRadius:[0,3,3,0]},data:D.map(function(d){return d.ins}),
   label:{show:true,position:'right',formatter:function(p){var d=D[p.dataIndex];return '{b|'+d.ins.toLocaleString()+'대}{a|  수신율 }'+(low(d)?'{c|':'{g|')+d.rr+'%}'},rich:{a:{color:STC.tx,fontSize:12},b:{color:STC.tt,fontWeight:700,fontSize:12},g:{color:STC.sc,fontWeight:700,fontSize:12},c:{color:STC.dg,fontWeight:700,fontSize:12}}}}]})}
/* 기간 구분: 연도·분기·기간 = 월별(2026년 12월은 집계 전), 월 = 일별 */
function days(y,m){return new Date(y,m,0).getDate()}
function stSer(){var f=document.getElementById('schForm'),t=f.selPeriodType.value,yy=parseInt(f.selYear.value),fu=function(m){return yy===2026&&m>=12};
 if(t==='month'){var m=parseInt(f.selMonth.value),d=days(yy,m),lb=[];for(var k=1;k<=d;k++)lb.push(k);return {tit:'일별',lb:lb,mo:lb.map(function(){return m}),yr:lb.map(function(){return yy}),unit:'일',step:5,day:1,dd:d}}
 if(t==='quarter'){var q=parseInt(f.selQuarter.value),a=[1,2,3].map(function(i){return (q-1)*3+i});return {tit:'월별',lb:a,mo:a,yr:a.map(function(){return yy}),unit:'월',fu:a.map(fu)}}
 if(t==='custom'){var A=f.startDate.value.split('-'),B=f.endDate.value.split('-'),lb2=[],mo=[],yr=[],cy=+A[0],cm=+A[1];while(cy<+B[0]||(cy===+B[0]&&cm<=+B[1])){lb2.push((+A[0]!==+B[0]?String(cy).slice(2)+'.':'')+cm);mo.push(cm);yr.push(cy);cm++;if(cm>12){cm=1;cy++}if(lb2.length>24)break}return {tit:'월별',lb:lb2,mo:mo,yr:yr,unit:'월'}}
 var a2=[1,2,3,4,5,6,7,8,9,10,11,12];return {tit:'월별',lb:a2,mo:a2,yr:a2.map(function(){return yy}),unit:'월',fu:a2.map(fu)}}
/* 설치 대수 추이(2026-11-12): 현재(2026-11 말) 설치 대수에서 이후 월별 신규 설치(TA, 전체)를 비중대로 빼서 과거 값을 만든다 — 매체별·지역별 합계가 같게 */
var TA=[14,10,16,20,24,18,12,15,22,17,13,9],NOW=[2026,11];
function insRem(y,m){var s=0,yy=y,mm=m;while(yy<NOW[0]||(yy===NOW[0]&&mm<NOW[1])){mm++;if(mm>12){mm=1;yy++}s+=TA[mm-1]}return s}
function insSer(fin,tot,S){return S.lb.map(function(lb,i){var y=S.yr[i],m=S.mo[i];if(y>NOW[0]||(y===NOW[0]&&m>NOW[1]))return null;var r=insRem(y,m);if(S.day){var part=TA[m-1]*(1-lb/S.dd);if(y===NOW[0]&&m===NOW[1])part=0;r+=part}return Math.max(0,Math.round(fin-r*fin/tot))})}
/* 매체별 수신율 추이(꺾은선) — 수신율 = 100 − (매체 기준 끊김률 + 월별 변동: 여름철 장마·태풍기 하락) */
var DMV=[[-.3,-.3,-.2,-.1,0,.3,.8,.6,.2,-.1,-.2,0],[-.2,-.2,-.1,0,0,.2,.5,.4,.1,0,-.1,0],[-.4,-.3,-.2,0,.2,.6,1.3,1,.3,-.1,-.2,0],[-.6,-.5,-.3,-.1,.3,.9,1.6,1.2,.2,-.2,-.3,0]];
function drawDmTrend(){var el=document.getElementById('dmTrend');if(!el)return;var S=stSer();document.getElementById('dmTrTit').textContent=S.tit+' 설치 대수·수신율 추이';var L=S.lb.map(function(x){return x+S.unit});
 var ch=echarts.getInstanceByDom(el);if(ch)ch.clear();
 var IN=DM.map(function(md){return insSer(md[1],1452,S)}),RR=DM.map(function(md,k){var base=md[4]/md[2]*100;return S.lb.map(function(lb,i){if(IN[k][i]==null)return null;var v=base+DMV[k][S.mo[i]-1]+(S.day?Math.sin(i*1.7+k*2.3)*.35+Math.sin(i*.45+k)*.25:0);return Math.min(100,Math.round((100-Math.max(0,v))*10)/10)})});
 EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:function(ps){var i=ps[0].dataIndex;if(IN[0][i]==null)return ps[0].axisValue+'<br>집계 전';var t=IN.reduce(function(a,r){return a+r[i]},0);
   return ps[0].axisValue+'<br>'+DM.map(function(md,k){return '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px;background:'+MPAL[k]+'"></span>'+md[0]+' '+IN[k][i].toLocaleString()+'대 · 수신율 '+RR[k][i]+'%'}).join('<br>')+'<br><b>설치 합계 '+t.toLocaleString()+'대</b>'}},
  legend:ecLegend({left:52,right:'auto',data:DM.map(function(md){return md[0]}),icon:'rect',itemHeight:10,itemWidth:10}),grid:{left:52,right:44,top:34,bottom:26},
  xAxis:ecCat(L,{axisLabel:{color:STC.tx,fontSize:11,interval:S.step?function(i){return i===0||(i+1)%S.step===0}:0}}),
  yAxis:[ecVal({min:0,axisLabel:{color:STC.gray,fontSize:11,formatter:function(v){return v.toLocaleString()}}}),ecVal({min:95,max:100,interval:1,splitLine:{show:false},axisLabel:{color:STC.gray,fontSize:11,formatter:'{value}%'}})],
  series:DM.map(function(md,k){return {name:md[0],type:'bar',stack:'ins',barMaxWidth:S.day?10:22,itemStyle:{color:MPAL[k],opacity:.35},emphasis:{itemStyle:{opacity:.6}},data:IN[k]}}).concat(
   DM.map(function(md,k){return {name:md[0],type:'line',yAxisIndex:1,symbolSize:S.day?3:6,lineStyle:{width:2},itemStyle:{color:MPAL[k]},z:3,data:RR[k]}}))})}
/* 상태별 표 데이터(2026-11-12): 기간 유형이 월이면 일자별, 그 밖(연도·분기·기간)은 월별 — 전체(기대 수신) = 설치 대수 × 24시간 × 일수, 수신율은 월별 계절 변동(장마·태풍기 하락) + 일별 변동 */
function buildStatus(){var S=stSer(),tb=document.getElementById('deviceStatusTbody'),rows=[],T=[0,0,0];
 S.lb.forEach(function(lb,i){var y=S.yr[i],m=S.mo[i];if(y>NOW[0]||(y===NOW[0]&&m>NOW[1]))return;
  var ins=insSer(1452,1452,{lb:[lb],yr:[y],mo:[m],day:S.day,dd:S.dd})[0],dv=DMV.reduce(function(a,r){return a+r[m-1]},0)/DMV.length,
   n=S.day?1:(y===NOW[0]&&m===NOW[1]?11:days(y,m)),rr=98.1-dv+(S.day?Math.sin(lb*1.3+m)*.35+Math.sin(lb*.47)*.2:Math.sin(m*1.9+y)*.08),t=ins*24*n,ng=Math.round(t*(100-rr)/100),ok=t-ng;
  if(S.day&&y===NOW[0]&&m===NOW[1]&&lb>11)return;
  T[0]+=t;T[1]+=ok;T[2]+=ng;
  rows.unshift('<tr><td'+(!S.day&&y===NOW[0]&&m===NOW[1]?' title="집계 중(11일까지)"':'')+'>'+y+'-'+String(m).padStart(2,'0')+(S.day?'-'+String(lb).padStart(2,'0'):'')+'</td><td class="t-r">'+t.toLocaleString()+'</td><td class="t-r">'+ok.toLocaleString()+'</td><td class="t-r">'+ng.toLocaleString()+'</td><td class="t-r">'+(ok/t*100).toFixed(1)+'%</td></tr>')});
 tb.innerHTML=rows.join('')+'<tr class="tot"><td>합계</td><td class="t-r">'+T[0].toLocaleString()+'</td><td class="t-r">'+T[1].toLocaleString()+'</td><td class="t-r">'+T[2].toLocaleString()+'</td><td class="t-r">'+(T[0]?(T[1]/T[0]*100).toFixed(1):'0.0')+'%</td></tr>';
 document.getElementById('dsTh').textContent=S.day?'일자':'월';document.getElementById('dsCnt').textContent=rows.length;document.getElementById('dsTit').textContent=(S.day?'일자별':'월별')+' 연결·끊김 추이';
 if(!document.getElementById('tabStatus').hidden)drawStatus()}
/* 일자별 연결·끊김 추이: 상태별 표 데이터로 그림(연결=선·왼쪽 축, 끊김=막대·오른쪽 축) */
function drawStatus(){var el=document.getElementById('deviceStatusChart');if(!el)return;var R=[].filter.call(document.querySelectorAll('#deviceStatusTbody tr'),function(tr){return !tr.classList.contains('tot')}).map(function(tr){var k=tr.cells[0].textContent;return {k:k,d:k.length===7?+k.slice(5)+'월'+(+k.slice(0,4)===NOW[0]&&+k.slice(5)===NOW[1]?'(~11일)':''):k.slice(5),ok:num(tr.cells[2].textContent),ng:num(tr.cells[3].textContent)}}).sort(function(a,b){return a.k<b.k?-1:1}),X=ecCat(R.map(function(r){return r.d}));
 var ch=echarts.getInstanceByDom(el);if(ch)ch.clear();
 document.getElementById('dsSub').textContent=DSM==='c'?'(건, 연결=왼쪽 축·끊김=오른쪽 축)':DSM==='s'?'(%, 연결+끊김=100)':'(%, 수신율 = 연결 ÷ 전체 × 100)';
 if(DSM==='s')return EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},formatter:function(ps){var r=R[ps[0].dataIndex];return ps[0].name+'<br>연결 '+r.ok.toLocaleString()+'건 ('+ps[0].value+'%)<br>끊김 '+r.ng.toLocaleString()+'건 ('+ps[1].value+'%)'}},legend:ecLegend(),grid:{left:44,right:12,top:34,bottom:26},
  xAxis:X,yAxis:ecVal({min:90,max:100,interval:2,axisLabel:{color:STC.gray,fontSize:11,formatter:'{value}%'}}),
  series:[{name:'연결',type:'bar',stack:'t',barMaxWidth:28,itemStyle:{color:STC.sc},data:R.map(function(r){return +(r.ok/(r.ok+r.ng)*100).toFixed(1)})},{name:'끊김',type:'bar',stack:'t',barMaxWidth:28,itemStyle:{color:STC.dg},data:R.map(function(r){return +(r.ng/(r.ok+r.ng)*100).toFixed(1)})}]});
 if(DSM==='l')return EC(el,{tooltip:{trigger:'axis',formatter:function(ps){var r=R[ps[0].dataIndex];return ps[0].name+'<br>수신율 '+ps[0].value+'%<br>연결 '+r.ok.toLocaleString()+' · 끊김 '+r.ng.toLocaleString()}},legend:ecLegend({data:['수신율']}),grid:{left:44,right:64,top:34,bottom:26},
  xAxis:ecCat(R.map(function(r){return r.d}),{boundaryGap:false}),yAxis:ecVal({min:96,max:100,interval:1,axisLabel:{color:STC.gray,fontSize:11,formatter:'{value}%'}}),
  series:[{name:'수신율',type:'line',symbolSize:6,lineStyle:{width:2,color:STC.sc},itemStyle:{color:STC.sc},areaStyle:{color:'rgba(0,138,30,.08)'},label:{show:R.length<=16,position:'top',fontSize:11,color:STC.tt,formatter:'{c}%'},markLine:{silent:true,symbol:'none',lineStyle:{color:STC.dg,type:'dashed'},label:{formatter:'기준 98%',color:STC.dg,fontSize:11},data:[{yAxis:98}]},data:R.map(function(r){return +(r.ok/(r.ok+r.ng)*100).toFixed(1)})}]});
 EC(el,{tooltip:{trigger:'axis',axisPointer:{type:'shadow'},valueFormatter:function(v){return v.toLocaleString()+'건'}},legend:ecLegend(),grid:{left:64,right:52,top:34,bottom:26},
  xAxis:X,
  yAxis:[ecVal({scale:true,axisLabel:{color:STC.gray,fontSize:11,formatter:function(v){return v>=1e6?(v/1e6).toFixed(1)+'M':v.toLocaleString()}}}),ecVal({min:0,position:'right',splitLine:{show:false},axisLabel:{color:STC.gray,fontSize:11,formatter:function(v){return v>=1e3?(v/1e3)+'k':v}}})],
  series:[{name:'끊김',type:'bar',yAxisIndex:1,barMaxWidth:28,itemStyle:{color:STC.dg,opacity:.45},emphasis:{itemStyle:{opacity:.85}},data:R.map(function(r){return r.ng})},
   {name:'연결',type:'line',yAxisIndex:0,symbolSize:6,lineStyle:{width:2,color:STC.sc},itemStyle:{color:STC.sc},data:R.map(function(r){return r.ok}),z:3}]})}
function ymd(s){var p=s.split(/[-\/]/);return new Date(+p[0],p[1]-1,+p[2])}
/* 초기화 시 지역 레벨·시도 선택도 시도별로 */
document.querySelector('.sch-box').addEventListener('reset',function(){setTimeout(function(){if(UNIT!=='sido')setUnit('sido')})});
window.onTab=function(id){
  if(id==='tabType'){drawDmTrend();drawDm()}if(id==='tabStatus')drawStatus();if(id==='tabRegion')drawRg();
  msg({tabType:'매체별',tabRegion:'지역별',tabStatus:'상태별'}[id]+' 단말기 통계를 조회하였습니다.');
};
window.onSearch=function(f){
  var top=document.getElementById('schForm');
  var t=f.selPeriodType,p=t.value==='custom'?f.startDate.value+' ~ '+f.endDate.value:f.selYear.value+(t.value==='month'?' '+f.selMonth.value:t.value==='quarter'?' '+f.selQuarter.value:'');
  if(t.value==='custom'){var a2=ymd(f.startDate.value),b2=ymd(f.endDate.value);if(isNaN(a2)||isNaN(b2)||a2>b2||(b2-a2)/864e5>365){alertMsg('조회 기간은 최대 1년까지 선택할 수 있습니다.',{ico:'wn',focus:'#startDate'});return false}}
  /* 차트 제목 옆 조회조건: 기간 · 지역(전국/시도) · 매체(전체면 '전체 매체') */
  var sd=UNIT==='sgg'&&f.rgSido.value?f.rgSido.value:'',md=f.selDevice.value?f.selDevice.selectedOptions[0].text:'전체 매체',v=p+' · '+(sd||'전국')+' · '+md;
  document.querySelectorAll('[data-cond]').forEach(function(e){e.textContent=v;e.title='조회기간: '+p+' | 지역: '+regionText(f)+' | 매체: '+md});
  drawDm();drawDmTrend();buildStatus();if(!document.getElementById('tabRegion').hidden)drawRg();
};
window.onSearch(document.getElementById('schForm'));
document.getElementById('schForm').addEventListener('reset',function(){setTimeout(function(){window.onSearch(document.getElementById('schForm'))})});
function regionText(f){return UNIT==='sgg'?'시군구별'+(f.rgSido.value?'('+f.rgSido.value+')':''):'시도별'}
