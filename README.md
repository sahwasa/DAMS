# DAMS
재난 예경보 통합관리시스템_Disaster Alert Management System.

화면설계 목업(sahwasa/DAMS-mockup)을 이 저장소의 퍼블 구조(gulp + file-include, SCSS 분할)로 옮긴 결과물이다.
화면 내용·디자인 기준은 목업과 같다(UI 표준정의서 NDMS-DE33 v1.1, 화면정의서 DAMS-DE21 v0.3, 웹스타일가이드 DAMS-DE32).

## 빌드
```bash
npm install
npx gulp          # dev → dist 빌드 + 감시 + browser-sync(index.html)
npx gulp build    # 빌드만
```
결과는 `dist/`(화면 html은 dist 바로 아래). `dist/index.html`이 전체 화면·팝업 목록이다.

## 폴더 구조
```
dev/
  html/                 화면 (파일명 = 기존 퍼블 이름 체계, 아래 표)
  inc/                  공통 조각(@@include)
    top.html            <head> — @@include('../inc/top.html',{"title":"…","css":"화면"}) css가 있으면 css/pages/화면.css 연결
    header.html         GNB (현재 1Depth .on은 js/common.js markOn()이 파일명으로 표시)
    lnb-warn|plat|stat|guide|sys|log.html   LNB (현재 메뉴 .on도 markOn())
    mdi.html · mdi-gis.html                 MDI 탭 {"file","name"}
    breadcrumb.html     {"d1","d1h","d2","d2h"}
    footer.html · script.html · pop-common.html · script-common.html
    pop/팝업ID.html     팝업 마크업 <template id="pop-팝업ID">
  scss/
    main.scss           진입점 → css/main.css (원본 common.scss 절 순서 그대로 @use)
    abstracts/          _tokens(디자인 토큰) · _mixin(버튼 색 세트)
    base/ layout/ components/
    pages/화면.scss      화면 전용 → css/pages/화면.css (그 화면에서만 읽음)
    pop/_팝업ID.scss     팝업 전용 — .pop-dlg[data-pop="팝업ID"] 안으로 한정
  js/
    common.js           공통(레이아웃·탭·정렬·페이징·메시지창·팝업·화면 버전 전환)
    gismap.js · geo/kr-geo.js   GIS 기본도(통계청 2013 행정경계)
    hazard.js           재난 사건코드 222종·심볼
    stchart.js          통계 차트(ECharts)
    pages/화면.js        화면 동작
    pop/팝업ID.js        팝업 동작 DAMS_POP['팝업ID']
    vendor/echarts.min.js   Apache ECharts 5.6.0 (Apache-2.0, echarts.LICENSE·NOTICE)
  images/               gov_logo_w.png, 단말기 심볼(device_ico_*), map_type.png, hazard_icon/(재난 심볼 50종)
  font/                 pretendard-gov(Pretendard GOV), remixicon(아이콘)
```

## 팝업(화면 안 dialog)
- 마크업은 `inc/pop/팝업ID.html`의 `<template>`, 동작은 `js/pop/팝업ID.js`. 팝업을 여는 화면이 둘 다 include 한다.
- `openPop('pop/팝업ID.html?쿼리', 폭)` → `<dialog class="pop-dlg" data-pop="팝업ID">`로 띄우고(showModal) 팝업 스크립트를 실행한다. 스크립트 안의 `location.search`는 넘긴 쿼리다.
- `closePop()` 맨 위 팝업 닫기 / `popOk(key,data)` 팝업을 연 화면의 `window.onPopOk(key,data)` 호출 후 닫기. 팝업 위에 팝업(중첩)·ESC·제목줄 끌어 옮기기 지원.
- 팝업 스크립트의 함수는 열려 있는 동안만 전역에 두고 닫으면 원래대로 돌린다(화면 함수와 이름이 겹쳐도 됨).
- 메시지창(alertMsg·confirmMsg)·로딩·툴팁은 열린 팝업 안(최상위 층)에 그린다. 팝업에서 인쇄하면 팝업만 인쇄된다.
- 화면 주소에 `?pop=팝업ID`를 붙이면 그 팝업을 바로 연다(index.html의 [화면에서 열기]).

## 화면 목록
| 화면ID | 화면명 | 파일 |
|---|---|---|
| UI-DA01-001 | 로그인 | login.html |
| UI-DA01-002 | 개인정보 처리방침 | privacy.html |
| UI-DA02-001 | GIS상황판 | gis.html |
| UI-DA03-001 | 연계현황 모니터링 | warn_monitor.html |
| UI-DA03-002 | 재난발생현황 | warn_occur.html |
| UI-DA03-003 | 재난발령현황 | warn_issue.html |
| UI-DA04-001 | 연계기관현황 | plat_org.html |
| UI-DA04-002 | 계정관리 | plat_account.html |
| UI-DA04-003 | 단말기현황 | plat_device.html |
| UI-DA05-001 | 재난발령통계 | stat_event.html |
| UI-DA05-002 | 단말기통계 | stat_device.html |
| UI-DA06-001 | 시스템 소개 | guide_intro.html |
| UI-DA06-002 (-V01·-W01) | 시스템 매뉴얼 (상세·등록/수정) | guide_manual.html (guide_manual_view·_write) |
| UI-DA06-003 (-V01·-W01) | 공지사항 (상세·등록/수정) | guide_notice.html (guide_notice_view·_write) |
| UI-DA06-004 (-W01) | FAQ (등록/수정) | guide_faq.html (guide_faq_write) |
| UI-DA07-001 | 사용자관리 | sys_user.html |
| UI-DA07-002 | 메뉴관리 | sys_menu.html |
| UI-DA07-003 | 공통코드관리 | sys_code.html |
| UI-DA07-004 | 재난코드관리 | sys_disaster.html |
| UI-DA07-005 | 사용자 권한관리 | sys_auth.html |
| UI-DA07-006 | 시스템 자원 모니터링 | sys_resource.html |
| UI-DA08-001 | 문자전송이력 | log_sms.html |
| UI-DA08-002 | 시스템 사용이력 | log_access.html |
| UI-DA08-003 | 작업이력 | log_job.html |
| UI-DA08-004 | 장애이력 | log_dsblty.html |
| UI-DA08-005 | 시스템 로그 | log_syslog.html |
| UI-DA08-006 | 데이터송수신이력 | log_data.html |
| UI-DA08-007 | 개인정보 접근이력 | log_privacy.html |
| UI-DA09-001 | 연계확인서 발급-발급대상기관(새 창) | cert_request.html |
| UI-DA09-002 | 연계확인서 점검실행(새 창) | cert_check.html |

## 목업에서 다시 옮기기
목업 저장소의 `bash tools/dams/run.sh [이 저장소 경로]`가 dev/를 목업 기준으로 다시 만든다(dev/html·inc·scss·js·images·font를 지우고 새로 생성 → gulp build → 링크 검사).
이 저장소에서 직접 고친 내용은 덮어써지므로, 목업과 함께 고치거나 옮긴 뒤에는 이 저장소에서만 고친다.

## dist 커밋 규칙(충돌 방지)
- dist는 개발자가 gulp 없이 바로 쓰도록 **저장소에 올린다**.
- 같은 소스면 누가 빌드해도 dist가 같게: `.gitattributes`로 텍스트 파일 **LF 고정**, 소스맵은 **기본 생성 안 함**(`dist/css/maps/`는 저장소 제외 — 필요하면 `npx gulp --map`).
- 의존성 버전은 `package-lock.json` 기준: 처음 설치는 `npm ci`.
- pull 전에 로컬 빌드로 바뀐 dist가 있으면 `git restore dist`(소스를 고친 게 아니면 버려도 같은 결과).

## SCSS 구조(중첩)
- `dev/scss`는 **중첩 구조**: 같은 부모로 시작하는 연속 규칙을 묶음(`.grid{ thead{ th{ &.sort{..} } } }`). 목업(평평한 SCSS)에서 옮길 때 자동 변환(`tools/dams/nest.py`).
- CSS 우선순위가 바뀌지 않도록 **연속한 규칙만** 묶고 순서는 그대로 — 그래서 같은 부모가 두 번 나올 수 있음(중간에 다른 규칙이 끼어 있는 경우).
- 변환할 때마다 평평한 SCSS로 만든 CSS와 중첩 SCSS로 만든 CSS를 비교(주석·공백 제외 동일해야 통과).
