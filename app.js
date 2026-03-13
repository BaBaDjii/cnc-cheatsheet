/* ===== CNC CHEATSHEET APP ===== */

// ─── Theme Toggle ───────────────────────────────────────────────────────────
(function () {
  const html = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');

  // Init theme from system preference
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);
  updateToggleIcon(toggle, currentTheme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', currentTheme);
      updateToggleIcon(toggle, currentTheme);
    });
  }

  function updateToggleIcon(btn, theme) {
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
      btn.setAttribute('aria-label', 'Переключить на светлую тему');
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      btn.setAttribute('aria-label', 'Переключить на тёмную тему');
    }
  }
})();

// ─── Brand Filter ────────────────────────────────────────────────────────────
const activeBrands = new Set(['fanuc', 'siemens', 'heidenhain']);

document.querySelectorAll('.brand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const brand = btn.dataset.brand;
    if (activeBrands.has(brand)) {
      // prevent deactivating all
      if (activeBrands.size > 1) {
        activeBrands.delete(brand);
        btn.classList.remove('active');
      }
    } else {
      activeBrands.add(brand);
      btn.classList.add('active');
    }
    applyBrandFilter();
  });
});

function applyBrandFilter() {
  // Table rows
  document.querySelectorAll('tr[data-brands]').forEach(row => {
    const rowBrands = row.dataset.brands.split(' ');
    const visible = rowBrands.some(b => activeBrands.has(b));
    row.style.display = visible ? '' : 'none';
  });

  // Cards
  document.querySelectorAll('[data-brands]').forEach(el => {
    if (el.tagName === 'TR') return;
    const brands = el.dataset.brands.split(' ');
    const visible = brands.some(b => activeBrands.has(b));
    el.style.display = visible ? '' : 'none';
  });

  // Table columns
  updateColumnVisibility();
}

function updateColumnVisibility() {
  const colMap = {
    fanuc: document.querySelectorAll('.fanuc-col'),
    siemens: document.querySelectorAll('.siemens-col'),
    heidenhain: document.querySelectorAll('.heidenhain-col'),
  };

  Object.entries(colMap).forEach(([brand, cells]) => {
    cells.forEach(cell => {
      cell.style.display = activeBrands.has(brand) ? '' : 'none';
    });
  });
}

// ─── Active Nav on Scroll ────────────────────────────────────────────────────
const sections = document.querySelectorAll('.content-section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
);

sections.forEach(s => observer.observe(s));

// Smooth click on nav links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('section-highlight');
      setTimeout(() => target.classList.remove('section-highlight'), 700);
    }
  });
});

// ─── Tabs ────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    const tabBar = btn.closest('.tab-bar');
    const tabsContainer = btn.closest('.programs-tabs');

    tabBar.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', String(b === btn));
    });

    tabsContainer.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
  });
});

// ─── Copy Buttons ────────────────────────────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.dataset.copy;
    const pre = document.getElementById(targetId);
    if (!pre) return;
    const text = pre.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = '✓ Скопировано';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Копировать';
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      btn.textContent = 'Ошибка';
      setTimeout(() => { btn.textContent = 'Копировать'; }, 1500);
    }
  });
});

// ─── Checklist ───────────────────────────────────────────────────────────────
const TOTAL_CHECKS = document.querySelectorAll('.check-item').length;
let checkedCount = 0;

document.querySelectorAll('.check-item').forEach(item => {
  item.addEventListener('click', () => toggleCheck(item));
  item.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleCheck(item);
    }
  });
});

function toggleCheck(item) {
  const checked = item.getAttribute('aria-checked') === 'true';
  const newState = !checked;
  item.setAttribute('aria-checked', String(newState));
  checkedCount = document.querySelectorAll('.check-item[aria-checked="true"]').length;
  updateProgress();
}

function updateProgress() {
  const pct = TOTAL_CHECKS > 0 ? (checkedCount / TOTAL_CHECKS) * 100 : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressLabel').textContent =
    `${checkedCount} / ${TOTAL_CHECKS} выполнено`;

  if (checkedCount === TOTAL_CHECKS && TOTAL_CHECKS > 0) {
    document.getElementById('progressLabel').style.color = 'var(--color-success)';
    document.getElementById('progressLabel').textContent = `✓ Готово к запуску! (${TOTAL_CHECKS}/${TOTAL_CHECKS})`;
  } else {
    document.getElementById('progressLabel').style.color = '';
  }
}

document.getElementById('resetChecklist').addEventListener('click', () => {
  document.querySelectorAll('.check-item').forEach(item => {
    item.setAttribute('aria-checked', 'false');
  });
  checkedCount = 0;
  updateProgress();
});

// Init progress
updateProgress();

// ─── Search ──────────────────────────────────────────────────────────────────

// Build search index from DOM
const searchIndex = [];

function buildSearchIndex() {
  // Tables
  document.querySelectorAll('.comparison-table tbody tr').forEach(row => {
    if (!row.dataset.brands) return;
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;
    const func = cells[0]?.textContent?.trim() || '';
    const fanuc = cells[1]?.textContent?.trim() || '';
    const siemens = cells[2]?.textContent?.trim() || '';
    const heidenhain = cells[3]?.textContent?.trim() || '';
    const note = cells[4]?.textContent?.trim() || '';
    const section = row.closest('section');
    searchIndex.push({
      title: func,
      snippet: `Fanuc: ${fanuc} | Siemens: ${siemens} | Heidenhain: ${heidenhain}`,
      section: section?.querySelector('.section-title')?.textContent?.trim() || '',
      anchor: '#' + (section?.id || ''),
    });
  });

  // Danger cards
  document.querySelectorAll('.danger-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent?.trim() || '';
    const body = card.querySelector('p')?.textContent?.trim() || '';
    searchIndex.push({
      title,
      snippet: body.slice(0, 120),
      section: 'Опасные различия',
      anchor: '#dangerous',
    });
  });

  // Program blocks
  document.querySelectorAll('.prog-block').forEach(block => {
    const header = block.querySelector('.prog-header span')?.textContent?.trim() || '';
    const code = block.querySelector('code')?.textContent?.slice(0, 100) || '';
    searchIndex.push({
      title: header,
      snippet: code,
      section: 'Примеры программ',
      anchor: '#programs',
    });
  });

  // Info cards
  document.querySelectorAll('.info-card').forEach(card => {
    const brand = card.querySelector('.brand-badge')?.textContent?.trim() || '';
    const title = card.querySelector('h3')?.textContent?.trim() || '';
    const body = card.querySelector('.card-body')?.textContent?.trim().slice(0, 120) || '';
    const section = card.closest('section');
    searchIndex.push({
      title: `${brand}: ${title}`,
      snippet: body,
      section: section?.querySelector('.section-title')?.textContent?.trim() || '',
      anchor: '#' + (section?.id || ''),
    });
  });
}

buildSearchIndex();

const searchInput = document.getElementById('globalSearch');
const searchOverlay = document.getElementById('searchResults');
const searchList = document.getElementById('searchResultsList');

let searchTimeout = null;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(performSearch, 120);
});

searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) performSearch();
});

document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !searchOverlay.contains(e.target)) {
    searchOverlay.hidden = true;
  }
});

// Ctrl+K shortcut
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    searchOverlay.hidden = true;
    searchInput.blur();
  }
});

function performSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchOverlay.hidden = true;
    return;
  }

  const results = searchIndex.filter(item => {
    const text = (item.title + ' ' + item.snippet + ' ' + item.section).toLowerCase();
    return text.includes(q);
  }).slice(0, 12);

  if (results.length === 0) {
    searchList.innerHTML = `<div class="search-no-results">Ничего не найдено по запросу «${escapeHtml(q)}»</div>`;
  } else {
    searchList.innerHTML = results.map(r => {
      const highlighted = highlight(r.snippet, q);
      return `
        <div class="search-result-item" data-anchor="${r.anchor}" tabindex="0">
          <div class="search-result-title">${highlight(r.title, q)}</div>
          <div class="search-result-section">${escapeHtml(r.section)}</div>
          ${r.snippet ? `<div class="search-result-snippet">${highlighted}</div>` : ''}
        </div>`;
    }).join('');

    searchList.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const anchor = item.dataset.anchor;
        const target = document.querySelector(anchor);
        if (target) {
          searchOverlay.hidden = true;
          searchInput.value = '';
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('section-highlight');
          setTimeout(() => target.classList.remove('section-highlight'), 700);
        }
      });
    });
  }

  searchOverlay.hidden = false;
}

function highlight(text, q) {
  if (!q) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(q)})`, 'gi');
  return escaped.replace(regex, '<mark>$1</mark>');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
