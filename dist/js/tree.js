/* 예경보 통합플랫폼 트리
 * - 펼침/접힘: 토글 버튼 aria-expanded (표시/숨김은 CSS)
 * - 체크: 상위 → 하위 전체 반영, 하위 전부 선택 시에만 상위 checked
 * - 변경 시 'tree:change' 이벤트 발생 → e.detail.values = 체크된 최하위 value 배열
 */
(() => {
  const tree = document.getElementById('platformTree');
  if (!tree) return;

  const $$ = (el, sel) => [...el.querySelectorAll(sel)];
  const isLeaf = li => !li.querySelector('ul');
  const boxOf = li => li.querySelector(':scope > .tree__check > input');
  const leavesOf = li => $$(li, 'li').filter(isLeaf).map(boxOf);

  // 하위 상태 기준으로 해당 노드의 체크 상태 계산
  const refresh = li => {
    const leaves = leavesOf(li);
    const n = leaves.filter(i => i.checked).length;
    const box = boxOf(li);
    box.checked = n > 0 && n === leaves.length;
  };

  const refreshAncestors = li => {
    let p = li.parentElement.closest('li');
    while (p) { refresh(p); p = p.parentElement.closest('li'); }
  };

  const getValues = () =>
    $$(tree, 'input[value]').filter(i => i.checked).map(i => i.value);

  const emit = () =>
    tree.dispatchEvent(new CustomEvent('tree:change', { detail: { values: getValues() } }));

  // 체크박스 변경
  tree.addEventListener('change', e => {
    const input = e.target;
    if (!input.matches('input[type=checkbox]')) return;
    const li = input.closest('li');

    if (!isLeaf(li)) {
      $$(li, 'input[type=checkbox]').forEach(i => { i.checked = input.checked; });
    }
    refreshAncestors(li);
    emit();
  });

  // 펼침/접힘
  tree.addEventListener('click', e => {
    const btn = e.target.closest('.tree__toggle');
    if (!btn) return;
    btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') !== 'true');
  });

  // 초기 상태 (마크업에 checked가 있어도 하위 → 상위 순으로 정합성 맞춤)
  $$(tree, 'li').filter(li => !isLeaf(li)).reverse().forEach(refresh);

  // 외부 제어용 (예: 지도 클러스터 클릭 시 해당 플랫폼만 선택)
  window.PlatformTree = {
    getValues,
    setValues(values = []) {
      $$(tree, 'input[value]').forEach(i => { i.checked = values.includes(i.value); });
      $$(tree, 'li').filter(li => !isLeaf(li)).reverse().forEach(refresh);
      emit();
    },
    expandAll(open = true) {
      $$(tree, '.tree__toggle').forEach(b => b.setAttribute('aria-expanded', open));
    }
  };

  emit();
})();

/* 사용 예
document.getElementById('platformTree').addEventListener('tree:change', e => {
  console.log(e.detail.values); // ['seoul_jongno', 'busan_jung', ...]
  // → 지도 마커 / 목록 테이블 필터링
});
*/