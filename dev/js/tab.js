// tab.js
(function (global) {
  'use strict';

  function initTab(root) {
    const tabWrap = root instanceof Element ? root : document.querySelector(root);
    if (!tabWrap) return;

    const tabBtnGroup = tabWrap.querySelector('.tab__btn');
    if (!tabBtnGroup) return;

    // 중첩 탭 방지: 자기 자신에게 속한 요소만 스코핑
    const isOwn = el => el.closest('.tab__wrap') === tabWrap;

    const tabBtns = Array.from(tabBtnGroup.querySelectorAll('.btn')).filter(isOwn);
    const tabConts = Array.from(tabWrap.querySelectorAll('.tab__cont')).filter(isOwn);

    tabBtnGroup.addEventListener('click', handleTabClick);

    setInitialTab();

    function handleTabClick(e) {
      const btn = e.target.closest('.btn');
      if (!btn || !tabBtnGroup.contains(btn) || !isOwn(btn)) return;

      const targetId = btn.dataset.tab;
      if (!targetId) return;

      setActiveTab(btn, targetId);
    }

    function setActiveTab(btn, targetId) {
      tabBtns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');

      tabConts.forEach(cont => {
        cont.style.display = cont.id === targetId ? '' : 'none';
      });
    }

    function setInitialTab() {
      if (!tabBtns.length) return;

      tabBtns.forEach((b, i) => b.classList.toggle('on', i === 0));

      tabConts.forEach((cont, i) => {
        cont.style.display = i === 0 ? '' : 'none';
      });
    }
  }

  function initTabAll(selector = '.tab__wrap') {
    document.querySelectorAll(selector).forEach(initTab);
  }

  global.initTab = initTab;
  global.initTabAll = initTabAll;
})(window);