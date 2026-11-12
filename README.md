# DAMS
재난 예경보 통합관리시스템_Disaster Alert Management System.

화면설계 목업(sahwasa/DAMS-mockup)을 이 저장소의 퍼블 구조(gulp + file-include, SCSS 분할)로 옮긴 결과물이다.
화면 내용·디자인 기준은 목업과 같다(UI 표준정의서 NDMS-DE33 v1.1, 화면정의서 DAMS-DE21 v0.3, 웹스타일가이드 DAMS-DE32).

## 빌드
```bash
npm install
npx gulp          # dev → dist 빌드 + 감시 + browser-sync(index.html)
npx gulp build    # 빌드만
npm run format    # JS·SCSS 형식 정리(prettier 3.3.3, 설정 .prettierrc — 한 줄 120자, 작은따옴표)
```

## 개발 인계 메모 (먼저 읽기)
퍼블은 화면 동작까지 확인할 수 있는 **목업**이라, 서버 연동 자리는 가짜 동작·샘플 데이터로 채워져 있다.

| 구분 | 위치 | 개발 시 |
|---|---|---|
| **샘플 데이터** | `js/pages/화면.data.js` (26개 화면). 화면 JS에는 `/* 샘플 데이터 변수명 → 화면.data.js */` 표시 | 서버 API 응답(또는 JSP 출력)으로 대체. 변수명·배열 열 순서는 화면 JS가 읽는 형식 그대로 |
| **검색** | 화면 JS의 `window.onSearch = function(form){…}` 앞 `TODO(API)` 주석 | 검색 조건으로 목록 조회 API 호출 → 목록·건수·페이징 갱신 |
| **저장·삭제·다운로드** | `common.js` `[목업 가짜 동작]` — `doSave(cb)` `doDelete(cb)` `doExcel(name)` `doDown(name)` | 확인창은 그대로 쓰고, 확인 뒤 API 호출 → 성공 시 `msg()`·`cb()` |
| **처리결과 문구** | `msg(text, err)` → 브라우저 **콘솔** 출력(화면 상태바는 시안에 없어 삭제) | 필요하면 토스트 등으로 표시 |
| **로딩** | `loading(문구, ms, cb)` — ms 뒤 cb | 실제 요청 시작·완료에 맞춰 표시/제거 |
| **새 재난 알림** | `toast(제목,{kind})` | 서버 푸시(웹소켓·폴링) 수신 때 호출. 목업의 첫 진입 알림 시연·GNB 5번 클릭 시연은 퍼블에서 제거 |
| **목업 전용 창 연동** | 파일 맨 위 `[목업 전용] localStorage(...)` 주석 — 연계기관현황·연계확인서 발급(새 창)·점검실행의 발급 취소(`damsCertCancel`)·통합 발급(`damsInteg`) 상태 공유 | 서버 데이터 조회로 대체(localStorage 코드 삭제) |
| **[미확정] 화면 버전 전환** | 푸터 왼쪽 [기본 \| 넓은 화면] 버튼(`layInit`·`setLayout`, `LAYOUT_DEFAULT='basic'`) — 두 레이아웃 비교 시연 | 확정되면 `LAYOUT_DEFAULT`만 남기고 전환 버튼 제거 |
| **팝업 바로 열기** | 화면 주소 `?pop=팝업ID`(index.html [화면에서 열기]용) | 필요 없으면 제거 |
| 개인 설정(유지) | localStorage `damsFav`(즐겨찾기)·`damsSound`(장애 경고음)·`damsLayout`, sessionStorage `damsNoti`(알림 목록) | 사용자 설정을 서버에 저장한다면 대체 |

- 입력 항목 `id`·`name`은 DB 영문 컬럼명 기준(화면정의서 입출력 내역). 화면 목록의 화면ID ↔ 파일명은 아래 표.
- 날짜·시각 입력은 브라우저 기본 `<input type="date|time">`(값 YYYY-MM-DD / HH:MM).
- 아이콘은 Remixicon(`<i class="ri-…">`), 차트는 ECharts, 지도는 `js/gismap.js`(GeoMap) + 통계청 2013 행정경계(`js/geo/kr-geo.js`, 실제 운영은 VWorld 등으로 교체).
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

## 공통 함수(js/common.js)
| 함수 | 용도 |
|---|---|
| `alertMsg(text,{ico:'in\|wn\|dg\|sc',focus,code,detail})` | 메시지창. `focus`=닫은 뒤 포커스할 요소, `code`·`detail`이면 오류 메시지창(오류코드·상세 펼침) |
| `confirmMsg(text, ok, {danger:true})` | 질의형 [취소][확인]. `danger`면 '취소'가 기본 포커스(데이터 손실 확인) |
| `checkReq(scope)` | 범위 안 빈 `[required]` → 메시지 후 해당 필드 포커스(문구는 `data-label`). false면 중단 |
| `openPop(url, 폭)` · `closePop()` · `popOk(key,data)` | 팝업(아래 '팝업' 절). 폭 900·760·540·360·270 |
| `showTab(버튼)` | 탭 전환(`.tab li > button[data-tab="패널id"]`, 패널은 `hidden`). 전환 시 `window.onTab(id)` |
| `initPaging()` | `<div class="paging" data-total="전체 페이지" data-page="현재">`를 그림 |
| `sortInit()` · `sortCol(th)` | `th.sort` 정렬 헤더: 클릭·Enter·Space → `.asc/.desc`·`aria-sort` → `window.onSort(키,'asc'\|'desc',th)`. 키 = `data-sort`(DB 컬럼명) 또는 열 제목. **실제 정렬은 서버** |
| `toast(제목,{kind:'occur\|issue\|alarm'})` · `alarm(문구,{sound,href})` | 새 재난·장애 알림(화면 아래 가운데, 10초 뒤 닫힘, GNB 알림 목록에 쌓임). `soundOn()`·`setSound(v)` 장애 경고음 |
| `chartPng(차트명)` · `tglTbl(event,표id)` | 통계: 차트 이미지 저장 · 표 펼침/접힘 |
| `pwEye(버튼,보이기)` · `pwGen(길이)` | 비밀번호 보기/숨기기 · 자동 생성(기본 12자, 영문 대·소문자·숫자·특수문자) |
| `doPrint(name)` | 인쇄 확인창 → 인쇄(팝업이 열려 있으면 팝업만) |
| `scrollFocus()` · `thScope()` | 접근성 자동 처리: 넘치는 스크롤 영역에 `tabindex=0`·`aria-label`, 표 `th`에 `scope`(DOM이 바뀌면 자동 재실행) |
| `markOn()` | 현재 파일명으로 GNB·LNB·MDI `.on` 표시(_view·_write는 목록 화면 메뉴) |

화면에서 정의하면 공통 동작이 불러주는 훅: `window.onSearch(form)`(검색 submit, false면 기본 문구 생략) · `window.onTab(id)` · `window.onSort(키,방향,th)` · `window.onPopOk(key,data)`(팝업 결과). 검색 폼 `.sch-box`의 submit은 `checkReq` → `onSearch` → '조회가 완료되었습니다.', reset은 초기화 문구.

## 공통 클래스(scss/components)
```
레이아웃  .wrap > header.gnb + .body > (.lnb + .main > .mdi + main.work#content) + footer.ft   LNB 접기 body.lnb-off
타이틀    .page-head(.tit .star .bread .btns) / .sub-head(h3|h4 .cnt .btns)  — 제목 단계만 바꿀 땐 <h3 class="h4">처럼 모양 클래스
버튼      .btn + .btn-crud(목록·삭제·취소·저장·신규) .btn-sch(검색) .btn-rst(초기화) .btn-line(그리드·폼 기본) .btn-dark(엑셀·강조)
          색 .btn-pri|sec|dg|wn|sc|in (+ -o 외곽선형)  크기 .s .l .ico
입력      .inp .sel .txa .inp-ico.inp-date .range .chk .rdo .tgl .inp-file  상태 :disabled [readonly] .err + .f-msg.err  필수 .req
검색      form.sch-box > .rows(.r1 한 줄) > .it(.c2 .c3 .c4)(> label|.lb + 컨트롤) + .ctrl(초기화·검색)  3줄 이상 .sch-toggle + .sch-more
그리드    .grid-wrap > table.grid(.fix-head 안쪽 스크롤·헤더 고정)  th.sort  tr.on|grp|sum|tot|nodata  a.lk   모바일 카드형 .mcard(자동)
상세/입력 table.tbl(th 왼쪽 헤더 — <th><label for="입력id">, td.ro 읽기)
탭        .tab .tab-s .tab-v   스텝 .steps(li.done .on)   페이징 .paging
팝업      .pop.w760 > .pop-head(h2#popTit .close) + .pop-body + .pop-foot   메시지창 .pop.msg
기타      .help-box(.wh .dg .wn .sc, details.help-box) .badge(.pri .sec .dg .wn .sc .in + .f 채움 .r 둥근) .card .kpi .legend .blind(화면 숨김·낭독)
          .t-l .t-c .t-r(정렬) .c-pri .c-dg .c-wn .c-sc .c-dis(보조 글자) .lk-u(본문 링크 밑줄) .flex .col2 .col-lr
```
- 색·크기는 `scss/abstracts/_tokens.scss` 토큰(`$pri` `$sec` `$g0~$g90` `$dg` `$wn` `$sc` `$in`…)을 쓴다. 화면·팝업 SCSS의 색도 토큰과 같은 값은 토큰 변수로 바꿔 두었다(토큰에 없는 색만 숫자).
- 반응형: PC ≥1280(기준 1600×900, 가로 스크롤 없음) · 태블릿 768~1279 · 모바일 ≤767 — `layout/_responsive.scss`. 팝업 안 반응형 규칙은 `html:not(.pc-pop)` 접두.

## 웹접근성(KWCAG 2.2 · axe WCAG 2.1 AA 점검 위반 0)
- 건너뛰기 링크 `.skip`(본문 `#content`·주메뉴 `#gnbMenu`·서브메뉴 `#lnbMenu`, 대상 `tabindex="-1"`), 랜드마크(header·nav·main·footer, MDI `role="navigation"`).
- 글자 대비 4.5:1 — 보조 글자 `#707070`, 회색·연한 배경 위 작은 글자 `#505050`(`#8e8e8e`는 비활성·장식에만).
- 입력에는 `<label for>` 또는 `title`(한 항목에 입력 2개인 기간·시도+시군구), 표에는 `<caption class="blind">`.
- 새 창 링크는 `title="…(새 창)"`, 팝업은 `role="dialog" aria-modal aria-labelledby="popTit"`.

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
목업 저장소의 `bash tools/dams/run.sh [이 저장소 경로]`가 dev/를 목업 기준으로 다시 만든다(dev/html·inc·scss·js·images·font를 지우고 새로 생성 → SCSS 중첩 → 시연 기능 제거·주석 → 샘플 데이터 분리 → prettier → 색 토큰 치환 → gulp build → 기준 CSS와 비교 → 링크 검사).
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
