/* UI-CO-P03 메시지창 샘플 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-CO-P03']=function(location,dlg){
function errSample(){alertMsg('요청을 처리하는 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',{ico:'dg',code:'오류코드 : E-DB-5003',detail:'java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms.\n at /api/issue/list.do (2026-10-30 10:12:44)'})}
return {errSample:typeof errSample==='function'?errSample:undefined};
};
DAMS_POP['UI-CO-P03'].names=["errSample"];
