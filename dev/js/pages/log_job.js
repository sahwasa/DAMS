/* 작업이력 | 재난 예경보 통합관리시스템 */
var TOTAL=47;
function setCnt(n,pages){document.getElementById('totCnt').textContent=n.toLocaleString();var p=document.getElementById('pgBtns');p.dataset.total=pages;p.dataset.page=1;initPaging(p.parentNode)}
window.onSearch=function(f){
  var k=f.searchKeyword?f.searchKeyword.value.trim():'',ss=[].slice.call(f.querySelectorAll('select[data-f]')),tb=document.querySelector('.grid tbody'),n=0;
  var on=k||ss.some(function(s){return s.value});
  tb.querySelectorAll('tr:not(.nodata)').forEach(function(tr){var ok=(!k||tr.textContent.indexOf(k)>-1)&&ss.every(function(s){var v=tr.cells[+s.dataset.f].textContent.trim();return !s.value||(s.dataset.m==='has'?v.indexOf(s.value)>-1:v===s.value)});tr.hidden=!ok;if(ok)n++});
  tb.querySelector('.nodata').hidden=n>0;
  if(on)setCnt(n,1);else setCnt(TOTAL,Math.ceil(TOTAL/+document.getElementById('pageSize').value));
  msg(n?'조회가 완료되었습니다.':'검색된 결과가 없습니다.');return false;
};
document.getElementById('schForm').addEventListener('reset',function(){setTimeout(function(){document.querySelectorAll('.grid tbody tr').forEach(function(tr){tr.hidden=tr.classList.contains('nodata')});setCnt(TOTAL,Math.ceil(TOTAL/+document.getElementById('pageSize').value))})});
function applySize(){var s=+document.getElementById('pageSize').value,c=+document.getElementById('totCnt').textContent.replace(/,/g,'');setCnt(c,Math.max(1,Math.ceil(c/s)));msg('페이지당 '+s+'건으로 목록을 조회하였습니다.')}
function popUrl(u,o){return u+'?'+new URLSearchParams(o).toString()}
var ROWS=[["2026-10-30 10:15", "공통코드 변경", "[공통코드] job_se_cd 그룹코드 '작업이력 구분' 추가 (상세코드 7건)", "없음", "홍*동"], ["2026-10-29 22:00", "정기점검", "정기점검 및 보안패치 적용 (WEB·WAS 서버)", "없음", "이*영"], ["2026-10-29 16:40", "공통코드 변경", "[공통코드] media_se_cd 상세코드 'VMS' 추가", "없음", "홍*동"], ["2026-10-28 09:30", "긴급점검", "DB 정기 백업 결과 확인", "디스크 여유공간 부족 경고 (잔여 12%)", "이*영"], ["2026-10-27 17:05", "긴급점검", "충남 아산시 연계서버 응답지연 긴급점검", "GW 세션 재기동 후에도 간헐 지연 지속 (기관 회선 점검 요청)", "김*호"], ["2026-10-27 14:10", "공통코드 변경", "[공통코드] dsblty_se_cd 상세코드 '단말기통신' 추가", "없음", "박*수"], ["2026-10-26 10:20", "데이터 동기화", "재난코드 동기화 배치 수동 실행", "신규 재난코드 3건 반영", "박*수"], ["2026-10-24 15:40", "마이그레이션", "단말기 제원정보 일괄 마이그레이션 (울산 남구)", "좌표 누락 4건 수기 보정", "최*진"], ["2026-10-22 02:30", "배치작업", "3분기 재난발령·수신이력 인덱스 재구성", "없음 (야간 무중단 처리)", "강*수"], ["2026-10-21 11:00", "정기점검", "세종특별자치시 연계 인터페이스 2차 점검", "통신 패킷 암호화 검증 완료", "이*영"], ["2026-10-20 13:30", "기타", "WAS서버 1호 힙 메모리 설정 변경 (4GB → 6GB)", "재기동 중 3분간 서비스 지연", "김*호"], ["2026-10-17 09:00", "데이터 동기화", "연계기관 담당자 정보 일괄 현행화", "반송 메일 7건 담당자 재확인 필요", "최*진"], ["2026-10-16 11:20", "공통코드 변경", "[공통코드] user_authrt_cd 코드명 변경 ('운영자(과)' → '운영자')", "없음", "홍*동"], ["2026-10-15 22:00", "정기점검", "정기점검 및 OS 보안패치 적용 (DB 서버)", "없음", "이*영"], ["2026-10-14 16:20", "배치작업", "통계 집계 배치 재처리 (10/13분)", "배치 지연으로 누락된 312건 재집계", "박*수"]];
function openEdit(i){document.querySelectorAll('#histBody tbody tr').forEach(function(x,k){x.classList.toggle('on',k===i)});if(i==null){openPop('pop/UI-DA08-003-P01.html',540);return}var r=ROWS[i];openPop(popUrl('pop/UI-DA08-003-P01.html',{mode:'edit',dt:r[0],se:r[1],cn:r[2],issue:r[3],nm:r[4]}),540)}
window.onPopOk=function(k){msg(k==='delete'?'작업이력이 삭제되었습니다.':k==='edit'?'작업이력이 수정되었습니다.':'작업이력이 등록되었습니다.')};
