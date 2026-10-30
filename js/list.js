(() => {
  'use strict';
  const key = 'winterlist.items';
  const form = document.querySelector('#add-form');
  const input = document.querySelector('#item-input');
  const message = document.querySelector('#form-message');
  const list = document.querySelector('#bucket-list');
  const empty = document.querySelector('#empty-message');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let filter = 'all';
  let editing = null;
  let items = [];
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const defaults = ['눈 오는 날 따뜻한 음료 마시기', '크리스마스 마켓 가보기', '겨울 바다 보러 가기', '집에서 쿠키 만들기', '따뜻한 카페에서 책 읽기', '새해 다짐 정리하기'];
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(items)); return true; }
    catch { message.textContent = '저장 공간에 접근할 수 없어요. 현재 변경은 새로고침하면 사라질 수 있어요.'; return false; }
  }
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      items = defaults.map((text, i) => ({id: uid(), text, done: [0, 1, 4].includes(i), createdAt: new Date().toISOString()}));
      persist();
    } else {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || !parsed.every(item => item && typeof item.id === 'string' && typeof item.text === 'string' && typeof item.done === 'boolean' && !Number.isNaN(Date.parse(item.createdAt)))) throw new Error('Invalid data');
      items = parsed;
    }
  } catch {
    message.textContent = '저장된 목록을 불러오지 못했어요. 원래 데이터는 그대로 보존했어요.';
  }
  function button(label, className, action) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = className; el.setAttribute('aria-label', label); el.title = label;
    el.addEventListener('click', action); return el;
  }
  function icon(kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', kind === 'edit' ? 'M4 16 16 4l4 4L8 20l-5 1 1-5ZM13 7l4 4' : 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7');
    svg.append(path); return svg;
  }
  function render(focusId, focusKind = 'edit') {
    list.replaceChildren();
    const done = items.filter(item => item.done).length;
    const counts = {all: items.length, active: items.length - done, done};
    filters.forEach(tab => {
      const selected = tab.dataset.filter === filter;
      tab.classList.toggle('active', selected); tab.setAttribute('aria-pressed', String(selected));
      tab.querySelector('span').textContent = counts[tab.dataset.filter];
    });
    const visible = items.filter(item => filter === 'all' || (filter === 'done' ? item.done : !item.done));
    empty.hidden = visible.length > 0;
    empty.textContent = items.length === 0 ? '아직 비어 있는 겨울이에요. 하고 싶은 일을 하나 적어보세요.' : filter === 'done' ? '아직 완료한 일이 없어요. 하나씩 천천히 해봐요.' : '진행 중인 일이 없어요. 새로운 겨울 계획을 적어보세요.';
    visible.forEach(item => {
      const row = document.createElement('li'); row.className = `bucket-row${item.done ? ' is-done' : ''}`;
      const check = button(`${item.text}: ${item.done ? '완료 취소' : '완료하기'}`, 'check-button', () => {
        item.done = !item.done; persist(); render(item.id, 'check');
      });
      check.textContent = '✓'; check.setAttribute('aria-pressed', String(item.done));
      const content = document.createElement('div'); content.className = 'item-content';
      const actions = document.createElement('div'); actions.className = 'item-actions';
      if (editing === item.id) {
        const field = document.createElement('input'); field.className = 'edit-input'; field.value = item.text; field.maxLength = 80;
        field.setAttribute('aria-label', '목록 제목 수정');
        const save = () => {
          const value = field.value.trim();
          if (!value) { message.textContent = '수정할 내용을 입력해 주세요.'; field.focus(); return; }
          item.text = value; editing = null; message.textContent = ''; persist(); render(item.id);
        };
        const cancel = () => { editing = null; message.textContent = ''; render(item.id); };
        field.addEventListener('keydown', event => {
          if (event.isComposing) return;
          if (event.key === 'Enter') { event.preventDefault(); save(); }
          if (event.key === 'Escape') cancel();
        });
        content.append(field);
        const saveButton = button('수정 저장', 'text-action', save); saveButton.textContent = '저장';
        const cancelButton = button('수정 취소', 'text-action', cancel); cancelButton.textContent = '취소';
        actions.append(saveButton, cancelButton);
      } else {
        const title = document.createElement('p'); title.className = 'item-title'; title.textContent = item.text;
        content.append(title);
        const edit = button(`${item.text} 수정`, 'icon-button', () => { editing = item.id; render(); list.querySelector('.edit-input').focus(); list.querySelector('.edit-input').select(); });
        edit.dataset.item = item.id; edit.dataset.kind = 'edit'; edit.append(icon('edit'));
        const remove = button(`${item.text} 삭제`, 'icon-button', () => {
          if (!confirm(`“${item.text}” 항목을 삭제할까요?`)) return;
          items = items.filter(entry => entry.id !== item.id); persist(); render(); input.focus();
        });
        remove.append(icon('delete')); actions.append(edit, remove);
      }
      const date = new Date(item.createdAt);
      const time = document.createElement('time'); time.dateTime = item.createdAt;
      time.textContent = `${date.getFullYear()}. ${String(date.getMonth()+1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
      content.append(time);
      check.dataset.item = item.id; check.dataset.kind = 'check';
      row.append(check, content, actions); list.append(row);
    });
    if (focusId) {
      const target = [...list.querySelectorAll('[data-item]')].find(el => el.dataset.item === focusId && el.dataset.kind === focusKind);
      (target || filters.find(tab => tab.dataset.filter === filter)).focus();
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) { message.textContent = '하고 싶은 일을 입력해 주세요.'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    input.removeAttribute('aria-invalid'); message.textContent = '';
    items.push({id: uid(), text, done: false, createdAt: new Date().toISOString()});
    editing = null; filter = 'all'; persist(); input.value = ''; render(); input.focus();
  });
  input.setAttribute('aria-describedby', 'form-message');
  input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); message.textContent = ''; });
  filters.forEach(tab => tab.addEventListener('click', () => { filter = tab.dataset.filter; editing = null; render(); }));
  render();
})();
