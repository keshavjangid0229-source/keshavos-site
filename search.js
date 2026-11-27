'use strict';

function installSpotlight() {
  const overlay = document.getElementById('spotlight');
  const input = document.getElementById('spotInput');
  const closeButton = document.getElementById('spotClose');
  const results = document.getElementById('spotRes');
  let selected = 0;
  let previousFocus;

  function select(index) {
    const buttons = [...results.querySelectorAll('button')];
    if (!buttons.length) return;
    selected = (index + buttons.length) % buttons.length;
    buttons.forEach((button, i) => {
      button.classList.toggle('sel', i === selected);
      button.setAttribute('aria-selected', String(i === selected));
    });
    input.setAttribute('aria-activedescendant', buttons[selected].id);
    buttons[selected].scrollIntoView({ block: 'nearest' });
  }

  function render() {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const entries = Object.entries(APPS).filter(([id, app]) => id !== 'launchpad' &&
      terms.every(term => (app.name + ' ' + app.title + ' ' + (app.keywords || '')).toLowerCase().includes(term)));
    results.replaceChildren();
    input.removeAttribute('aria-activedescendant');
    if (!entries.length) results.textContent = 'No matching apps or projects.';
    for (const [id, app] of entries) {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'spot-result-' + id;
      button.setAttribute('role', 'option');
      button.tabIndex = -1;
      button.innerHTML = app.icon + '<span>' + app.name + '</span><small>' + (app.kind || 'App') + '</small>';
      button.addEventListener('click', () => {
        close(false);
        if (app.ext) window.open(app.ext, '_blank', 'noopener');
        else if (window.IOSMode && IOSMode.active) IOSMode.open(id);
        else openApp(id);
      });
      results.appendChild(button);
    }
    select(0);
  }

  function open() {
    previousFocus = document.activeElement;
    overlay.classList.add('show');
    input.setAttribute('aria-expanded', 'true');
    input.value = '';
    input.focus();
    render();
  }

  function close(restore = true) {
    if (!overlay.classList.contains('show')) return;
    overlay.classList.remove('show');
    input.setAttribute('aria-expanded', 'false');
    if (restore && previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  document.querySelectorAll('#spotBtn, #mobile-search').forEach(button => button.addEventListener('click', open));
  closeButton.addEventListener('click', () => close());
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      (document.activeElement === input ? closeButton : input).focus();
    }
  });
  input.addEventListener('input', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      select(selected + (event.key === 'ArrowDown' ? 1 : -1));
    }
    if (event.key === 'Enter') results.querySelector('.sel')?.click();
  });
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'k' || event.key === ' ')) {
      event.preventDefault();
      if (overlay.classList.contains('show')) close(); else open();
    }
    if (event.key === 'Escape') {
      close(); toggleLaunchpad(false); closeDropdown(); document.getElementById('cc').classList.remove('show'); hideCtx();
    }
  });
  return open;
}
