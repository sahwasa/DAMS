/* UI-DA01-001-P01 NDMS 권한신청 안내 — openPop()이 열 때마다 실행(location = 팝업 주소의 쿼리, dlg = 팝업 dialog) */
DAMS_POP['UI-DA01-001-P01']=function(location,dlg){
function goNdms(){alertMsg('NDMS 포털(행정망)로 이동합니다.\n목업에서는 외부 시스템으로 연결하지 않습니다.',{ico:'in'})}
return {goNdms:typeof goNdms==='function'?goNdms:undefined};
};
DAMS_POP['UI-DA01-001-P01'].names=["goNdms"];
