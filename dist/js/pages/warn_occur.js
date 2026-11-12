/* 재난발생현황 | 재난 예경보 통합관리시스템 */
var CODE2 = {
  T1: ['호우', '강풍', '풍랑', '태풍', '홍수', '산사태', '산불', '지진', '지진해일', '대설'],
  T2: ['화재', '미세먼지', '감염병', '교통사고'],
  T3: ['안내방송', '민방위']
};
function setCode2(v) {
  var s = document.getElementById('code2');
  s.innerHTML =
    '<option value="">중분류 전체</option>' +
    (CODE2[v] || [])
      .map(function (x) {
        return '<option>' + x + '</option>';
      })
      .join('');
  if (v) msg('선택한 대분류의 중분류 목록이 설정되었습니다.');
}
document.querySelector('.sch-box').addEventListener('reset', function () {
  setTimeout(function () {
    setCode2('');
  });
});
/* TODO(API): 검색 조건(form)으로 목록 조회 API 호출 후 목록·건수·페이징 갱신 */
window.onSearch = function (f) {
  var d = document.querySelector('.paging');
  d.dataset.page = 1;
  initPaging(d.parentNode);
  msg('재난발생 목록을 조회하였습니다. (전체 133건)');
  return false;
};
