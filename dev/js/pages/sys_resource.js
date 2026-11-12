/* 시스템 자원 모니터링 | 재난 예경보 통합관리시스템 */
/* 위험 서버 알림(SFR-04): 시각+청각 */
setTimeout(function () {
  alarm('WAS-02 CPU 사용률 86% (위험 임계 80% 초과)', { href: 'log_dsblty.html' });
}, 1000);
function reload() {
  var d = new Date(),
    p = function (n) {
      return String(n).padStart(2, '0');
    },
    t = '2026-10-30 ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  document.getElementById('baseTm').textContent = t + ' 기준';
  msg('서버 자원 현황과 연계 프로세스 감시 결과를 다시 조회하였습니다. (' + t + ' 기준)');
}
