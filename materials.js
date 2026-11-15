/* Filtering enhances the fully readable static PDF notebook. No study state is changed. */
'use strict';
window.JojuMaterials={mount(container=document){
  const sections = [...container.querySelectorAll('[data-section]')];
  const entries = [...container.querySelectorAll('[data-entry]')];
  const links = [...container.querySelectorAll('[data-filter]')];
  const search = container.querySelector('#'+'pdf-search');
  const count = container.querySelector('#'+'pdf-count');
  let selected = 'all';
  const normalize = value => value.toLocaleLowerCase('ko').replace(/\s+/g, '').normalize('NFKC');
  const texts = new Map(entries.map(entry => [entry, normalize(entry.textContent)]));
  const apply = () => {
    const query = normalize(search.value);
    let shown = 0;
    for (const section of sections) {
      let visible = 0;
      for (const entry of section.querySelectorAll('[data-entry]')) {
        entry.hidden = (selected !== 'all' && selected !== section.dataset.section) || !texts.get(entry).includes(query);
        if (!entry.hidden) visible++;
      }
      section.hidden = visible === 0;
      shown += visible;
    }
    links.forEach(a => {
      if (a.dataset.filter === selected) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    count.textContent = `${shown}개 항목`;
    container.querySelector('#'+'pdf-empty').hidden = shown > 0;
  };
  const revealHash = (scroll = false) => {
    let id;
    try { id = decodeURIComponent(location.hash.split('/').slice(1).join('/')); } catch { id = ''; }
    const direct = links.find(a => a.dataset.filter === id);
    const target = id ? container.querySelector('#'+id) : null;
    if (direct) selected = id;
    else if (target?.closest('[data-section]')) {
      selected = target.closest('[data-section]').dataset.section;
      for (let parent = target; parent; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
    } else selected = 'all';
    search.value = '';
    apply();
    if (scroll && target) target.scrollIntoView({block: 'start'});
  };
  links.forEach(a => a.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', a.getAttribute('href'));
    selected = a.dataset.filter;
    search.value = '';
    apply();
  }));
  search.addEventListener('input', () => { selected = 'all'; apply(); });
  container.querySelector('#'+'pdf-clear').addEventListener('click', () => {
    search.value = '';
    selected = 'all';
    apply();
    search.focus();
  });
  container.querySelector('.pdf-searchbar').hidden = false;
  revealHash(Boolean(location.hash));
}};
