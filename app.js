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

/* ═══════════════════════════════════════════════════════════════
   PROGRAM GENERATOR
   ═══════════════════════════════════════════════════════════════ */
(function () {

  /* ── Field definitions per operation ────────────────────── */
  const OPERATIONS = {
    drill_simple: {
      label: 'Сверление простое (G81 / CYCLE81 / CYCL 200)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',      type: 'number', def: 1,    min: 1 },
        { id: 'spindle', label: 'Обороты S (об/мин)',        type: 'number', def: 1500, min: 1 },
        { id: 'feed',    label: 'Подача F (мм/мин)',         type: 'number', def: 150,  min: 1 },
        { id: 'x',       label: 'X позиция (мм)',             type: 'number', def: 0 },
        { id: 'y',       label: 'Y позиция (мм)',             type: 'number', def: 0 },
        { id: 'r',       label: 'Уровень подхода R (мм)',     type: 'number', def: 5 },
        { id: 'z',       label: 'Глубина Z (мм, отриц.)',     type: 'number', def: -20 },
      ]
    },
    drill_deep: {
      label: 'Глубокое сверление (G83 / CYCLE83 / CYCL 203)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',       type: 'number', def: 1 },
        { id: 'spindle', label: 'Обороты S',                  type: 'number', def: 1200 },
        { id: 'feed',    label: 'Подача F',                   type: 'number', def: 120 },
        { id: 'x',       label: 'X позиция',                  type: 'number', def: 0 },
        { id: 'y',       label: 'Y позиция',                  type: 'number', def: 0 },
        { id: 'r',       label: 'Уровень R',                  type: 'number', def: 5 },
        { id: 'z',       label: 'Глубина Z',                  type: 'number', def: -40 },
        { id: 'peck',    label: 'Врезание за проход Q (мм)',  type: 'number', def: 5, min: 0.1 },
      ]
    },
    drill_dwell: {
      label: 'Сверление с выдержкой (G82 / CYCLE82 / CYCL 200+P211)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',       type: 'number', def: 1 },
        { id: 'spindle', label: 'Обороты S',                  type: 'number', def: 1000 },
        { id: 'feed',    label: 'Подача F',                   type: 'number', def: 100 },
        { id: 'x',       label: 'X позиция',                  type: 'number', def: 0 },
        { id: 'y',       label: 'Y позиция',                  type: 'number', def: 0 },
        { id: 'r',       label: 'Уровень R',                  type: 'number', def: 5 },
        { id: 'z',       label: 'Глубина Z',                  type: 'number', def: -15 },
        { id: 'dwell',   label: 'Выдержка P (сек)',           type: 'number', def: 0.5, step: 0.1 },
      ]
    },
    tap: {
      label: 'Нарезание резьбы (G84 / CYCLE84 / CYCL 206)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',       type: 'number', def: 1 },
        { id: 'spindle', label: 'Обороты S',                  type: 'number', def: 500 },
        { id: 'x',       label: 'X позиция',                  type: 'number', def: 0 },
        { id: 'y',       label: 'Y позиция',                  type: 'number', def: 0 },
        { id: 'r',       label: 'Уровень R',                  type: 'number', def: 5 },
        { id: 'z',       label: 'Глубина Z',                  type: 'number', def: -20 },
        { id: 'pitch',   label: 'Шаг резьбы (мм)',            type: 'number', def: 1.5, step: 0.25, min: 0.25 },
      ]
    },
    pocket_rect: {
      label: 'Прямоугольный карман (POCKET3 / CYCL 251)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',       type: 'number', def: 1 },
        { id: 'spindle', label: 'Обороты S',                  type: 'number', def: 3000 },
        { id: 'feed',    label: 'Подача F',                   type: 'number', def: 600 },
        { id: 'cx',      label: 'Центр X',                    type: 'number', def: 0 },
        { id: 'cy',      label: 'Центр Y',                    type: 'number', def: 0 },
        { id: 'len',     label: 'Длина (мм)',                  type: 'number', def: 60,  min: 1 },
        { id: 'wid',     label: 'Ширина (мм)',                 type: 'number', def: 40,  min: 1 },
        { id: 'depth',   label: 'Глубина (мм, положит.)',      type: 'number', def: 10, min: 0.1 },
        { id: 'dia',     label: 'Диаметр фрезы (мм)',         type: 'number', def: 10,  min: 0.1 },
      ]
    },
    pocket_circ: {
      label: 'Круглый карман (CYCLE75 / CYCL 252)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',       type: 'number', def: 1 },
        { id: 'spindle', label: 'Обороты S',                  type: 'number', def: 3000 },
        { id: 'feed',    label: 'Подача F',                   type: 'number', def: 500 },
        { id: 'cx',      label: 'Центр X',                    type: 'number', def: 0 },
        { id: 'cy',      label: 'Центр Y',                    type: 'number', def: 0 },
        { id: 'diam',    label: 'Диаметр кармана (мм)',       type: 'number', def: 50,  min: 1 },
        { id: 'depth',   label: 'Глубина (мм)',               type: 'number', def: 15,  min: 0.1 },
        { id: 'dia',     label: 'Диаметр фрезы (мм)',         type: 'number', def: 10,  min: 0.1 },
      ]
    },
    face_mill: {
      label: 'Торцевое фрезерование (CYCLE71 / CYCL 230)',
      fields: [
        { id: 'tool',    label: 'Номер инструмента T',       type: 'number', def: 1 },
        { id: 'spindle', label: 'Обороты S',                  type: 'number', def: 2500 },
        { id: 'feed',    label: 'Подача F',                   type: 'number', def: 800 },
        { id: 'x0',      label: 'Начало X',                   type: 'number', def: 0 },
        { id: 'y0',      label: 'Начало Y',                   type: 'number', def: 0 },
        { id: 'len',     label: 'Длина (мм)',                  type: 'number', def: 100, min: 1 },
        { id: 'wid',     label: 'Ширина (мм)',                 type: 'number', def: 60,  min: 1 },
        { id: 'depth',   label: 'Глубина прохода (мм)',        type: 'number', def: 0.5, min: 0.01, step: 0.1 },
        { id: 'dia',     label: 'Диаметр фрезы (мм)',         type: 'number', def: 50,  min: 1 },
      ]
    },
    probe_corner: {
      label: 'Привязка по угловой точке (CYCLE978 / CYCL 408)',
      fields: [
        { id: 'tool',    label: 'Номер щупа T',               type: 'number', def: 31 },
      ]
    },
    probe_bore: {
      label: 'Привязка по отверстию (CYCLE977 / CYCL 412)',
      fields: [
        { id: 'tool',    label: 'Номер щупа T',               type: 'number', def: 31 },
        { id: 'nom',     label: 'Номинальный диаметр (мм)',    type: 'number', def: 50, min: 1 },
      ]
    },
  };

  /* ── Code generators ─────────────────────────────────────── */
  function genCode(op, sys, v) {
    const t = v.tool || 1, s = v.spindle || 1000, f = v.feed || 200;

    if (op === 'drill_simple') {
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `S${s} M3`,
        `G90 G99 G81`,
        `  X${v.x} Y${v.y}`,
        `  Z${v.z} R${v.r}`,
        `  F${f}`,
        `G80`,
        `M5`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `G54`,
        `S${s} M3`,
        `G90`,
        `CYCLE81(${v.r},0,2,${v.z},,${f})  ; X${v.x} Y${v.y}`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.x} Y${v.y} R0 FMAX`,
        `CYCL DEF 200 DRILLING ~`,
        `  Q200=${v.r}   ; DIST BEZOP`,
        `  Q201=${v.z}   ; GLUBINA`,
        `  Q206=${f}     ; PODACHA`,
        `  Q202=5        ; GLUB WREZ`,
        `  Q210=0        ; VYDER NAVERHU`,
        `  Q203=0        ; COORD POV`,
        `  Q204=50       ; 2-YI BEZOP R`,
        `  Q211=0        ; VYDER VNIZU`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'drill_deep') {
      const q = v.peck || 5;
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `S${s} M3`,
        `G90 G99 G83`,
        `  X${v.x} Y${v.y}`,
        `  Z${v.z} R${v.r}`,
        `  Q${q} F${f}`,
        `G80`,
        `M5`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `S${s} M3`,
        `G90`,
        `CYCLE83(${v.r},0,2,${v.z},,${q},${q},0,0,0,,${f},0)`,
        `; вызов — X${v.x} Y${v.y}`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.x} Y${v.y} R0 FMAX`,
        `CYCL DEF 203 UNIVERSAL DRILLING ~`,
        `  Q200=${v.r}   ; DIST BEZOP`,
        `  Q201=${v.z}   ; GLUBINA`,
        `  Q206=${f}     ; PODACHA`,
        `  Q202=${q}     ; GLUB WREZ`,
        `  Q210=0        ; VYDER NAVERHU`,
        `  Q203=0        ; COORD POV`,
        `  Q204=50       ; 2-YI BEZOP R`,
        `  Q212=0        ; RAZMER SBORA`,
        `  Q213=3        ; CHISLO PERELOMOV`,
        `  Q205=3        ; MIN GLUB WREZ`,
        `  Q211=0.2      ; VYDER VNIZU`,
        `  Q208=99999    ; PODACHA IZVL`,
        `  Q256=0.2      ; OTSTUP DR`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'drill_dwell') {
      const p = v.dwell || 0.5;
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `S${s} M3`,
        `G90 G99 G82`,
        `  X${v.x} Y${v.y}`,
        `  Z${v.z} R${v.r}`,
        `  P${Math.round(p * 1000)} F${f}`,
        `G80`,
        `M5`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `S${s} M3`,
        `G90`,
        `CYCLE82(${v.r},0,2,${v.z},${p},${f})  ; X${v.x} Y${v.y}`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.x} Y${v.y} R0 FMAX`,
        `CYCL DEF 200 DRILLING ~`,
        `  Q200=${v.r}`,
        `  Q201=${v.z}`,
        `  Q206=${f}`,
        `  Q202=5`,
        `  Q210=0`,
        `  Q203=0`,
        `  Q204=50`,
        `  Q211=${p}    ; VYDER VNIZU`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'tap') {
      const pitch = v.pitch || 1.5;
      const feed_tap = Math.round(s * pitch);
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `S${s} M29      ; rigid tap`,
        `G90 G99 G84`,
        `  X${v.x} Y${v.y}`,
        `  Z${v.z} R${v.r}`,
        `  F${feed_tap}`,
        `G80`,
        `M5`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `S${s} M3`,
        `G90`,
        `CYCLE84(${v.r},0,2,${v.z},,${s},${s},${pitch},${pitch},,,,0,,0)`,
        `; X${v.x} Y${v.y}`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.x} Y${v.y} R0 FMAX`,
        `CYCL DEF 206 TAPPING NEW ~`,
        `  Q200=${v.r}       ; DIST BEZOP`,
        `  Q201=${v.z}       ; GLUBINA`,
        `  Q206=${feed_tap}  ; PODACHA`,
        `  Q211=0            ; VYDER`,
        `  Q208=${feed_tap}  ; PODACHA IZVL`,
        `  Q203=0            ; COORD POV`,
        `  Q204=50           ; 2-YI BEZOP R`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'pocket_rect') {
      const step = Math.round(v.dia * 0.7 * 10) / 10;
      if (sys === 'fanuc') {
        const x0 = +(v.cx - v.len / 2 + v.dia / 2).toFixed(3);
        const x1 = +(v.cx + v.len / 2 - v.dia / 2).toFixed(3);
        const y0 = +(v.cy - v.wid / 2 + v.dia / 2).toFixed(3);
        const y1 = +(v.cy + v.wid / 2 - v.dia / 2).toFixed(3);
        return [
          `T${t} M6`,
          `G43 H${t}`,
          `S${s} M3`,
          `G90 G0 X${v.cx} Y${v.cy}`,
          `G0 Z5`,
          `; FANUC — нет встроенного цикла кармана.`,
          `; Используется ручной zigzag:`,
          `G1 Z-${v.depth} F${Math.round(f * 0.3)}   ; врезание`,
          `G1 X${x0} Y${y0} F${f}`,
          `G1 X${x1}`,
          `G1 Y${y1}`,
          `G1 X${x0}`,
          `G1 Y${y0}`,
          `; ... (добавьте проходы по шагу ${step} мм)`,
          `G0 Z50`,
          `M5`,
        ].join('\n');
      }
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `S${s} M3`,
        `G90`,
        `; позиционирование в центр`,
        `G0 X${v.cx} Y${v.cy} Z5`,
        `POCKET3(5,0,2,-${v.depth},${v.len},${v.wid},0,${v.dia / 2},${step},,${f},,${Math.round(f * 0.3)},11,1,,0.1)`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.cx} Y${v.cy} R0 FMAX`,
        `CYCL DEF 251 RECTANGULAR POCKET ~`,
        `  Q218=${v.len}    ; DLINA`,
        `  Q219=${v.wid}    ; SHIRINA`,
        `  Q368=0.1         ; PRIPU SK`,
        `  Q224=0           ; UGOL`,
        `  Q367=0           ; POLOZHENIE KARMANA`,
        `  Q207=${f}        ; PODACHA`,
        `  Q351=1           ; TIP FR (1=poputnoe)`,
        `  Q201=-${v.depth} ; GLUBINA`,
        `  Q202=${step}     ; GLUB WREZ`,
        `  Q206=${Math.round(f * 0.3)} ; PODACHA WREZ`,
        `  Q200=2           ; DIST BEZOP`,
        `  Q203=0           ; COORD POV`,
        `  Q204=50          ; 2-YI BEZOP R`,
        `  Q370=1           ; PERED INSTR`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'pocket_circ') {
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `S${s} M3`,
        `; FANUC — нет стандартного цикла круглого кармана.`,
        `; Используйте макрос G65 P9xxx или ручной контур:`,
        `G0 X${v.cx} Y${v.cy} Z5`,
        `G1 Z-${v.depth} F${Math.round(f * 0.3)}`,
        `G2 I${+(v.diam / 2 - v.dia / 2).toFixed(2)} J0 F${f}  ; контурный проход`,
        `G0 Z50`,
        `M5`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `S${s} M3`,
        `G0 X${v.cx} Y${v.cy} Z5`,
        `CYCLE75(5,0,2,-${v.depth},${v.diam / 2},${+(v.diam / 2 - v.dia / 2).toFixed(2)},${f},${Math.round(f * 0.3)},11,1)`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.cx} Y${v.cy} R0 FMAX`,
        `CYCL DEF 252 CIRCULAR POCKET ~`,
        `  Q223=${v.diam}   ; DIAM KARMANA`,
        `  Q368=0.1         ; PRIPU SK`,
        `  Q207=${f}        ; PODACHA`,
        `  Q351=1           ; TIP FR`,
        `  Q201=-${v.depth} ; GLUBINA`,
        `  Q202=${+(v.diam * 0.15).toFixed(1)} ; GLUB WREZ`,
        `  Q206=${Math.round(f * 0.3)} ; PODACHA WREZ`,
        `  Q200=2           ; DIST BEZOP`,
        `  Q203=0           ; COORD POV`,
        `  Q204=50          ; 2-YI BEZOP R`,
        `  Q370=1           ; PERED INSTR`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'face_mill') {
      const passes = Math.ceil(v.wid / (v.dia * 0.7));
      const stepY = (v.wid / passes).toFixed(2);
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `S${s} M3`,
        `G90 G0 X${+v.x0 - v.dia / 2} Y${v.y0}`,
        `G0 Z5`,
        `G1 Z-${v.depth} F${Math.round(f * 0.3)}`,
        `; ${passes} прохода(ов), шаг Y = ${stepY} мм`,
        `G1 X${+(+v.x0 + +v.len + v.dia / 2).toFixed(2)} F${f}`,
        `G0 X${+v.x0 - v.dia / 2}`,
        `; продолжить по Y...`,
        `G0 Z50`,
        `M5`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `S${s} M3`,
        `G90`,
        `G0 X${v.x0} Y${v.y0} Z5`,
        `CYCLE71("",${-v.depth},2,${v.x0},${v.y0},0,${v.len},${v.wid},0,${stepY},${f},${Math.round(f * 0.3)},71,1,0.1)`,
        `M5`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z S${s}`,
        `L X${v.x0} Y${v.y0} R0 FMAX`,
        `CYCL DEF 230 FACING ~`,
        `  Q218=${v.len}    ; DLINA`,
        `  Q219=${v.wid}    ; SHIRINA`,
        `  Q240=${passes}   ; CHISLO PROHODOV`,
        `  Q207=${f}        ; PODACHA`,
        `  Q209=${Math.round(f * 0.3)} ; PODACHA WREZ`,
        `  Q201=-${v.depth} ; GLUBINA`,
        `  Q200=2           ; DIST BEZOP`,
        `  Q203=0           ; COORD POV`,
        `  Q204=50          ; 2-YI BEZOP R`,
        `CYCL CALL`,
        `M5`,
      ].join('\n');
    }

    if (op === 'probe_corner') {
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `; Вызов макроса привязки по углу`,
        `G65 P9810 Z5. F500.  ; защитное позиционирование`,
        `G65 P9811 X0. Y0. D10. F100.`,
        `; результат записывается в #5001, #5002`,
        `G10 L2 P1 X#5001 Y#5002   ; запись в G54`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `; Привязка по угловой точке`,
        `CYCLE978(,,110,10,,1,0.1,0.5,,,,)`,
        `; результат — WORKPIECE_OFFSET`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z`,
        `; Привязка по угловой точке детали`,
        `CYCL DEF 408 TOUCHPROBE OUTSIDE CORNER ~`,
        `  Q303=+1   ; SPOSOB PEREDACHI`,
        `  Q381=0    ; OS SHUPA`,
        `  Q320=2    ; DIST BEZOP`,
        `  Q260=50   ; BEZ VISOTA`,
        `CYCL CALL`,
        `; результат — W-CS или preset`,
      ].join('\n');
    }

    if (op === 'probe_bore') {
      const nom = v.nom || 50;
      if (sys === 'fanuc') return [
        `T${t} M6`,
        `G43 H${t}`,
        `; Привязка по отверстию, номинал = ${nom} мм`,
        `G65 P9810 Z5. F500.`,
        `G65 P9814 D${nom}. F100.`,
        `; результат: #5001(X), #5002(Y)`,
        `G10 L2 P1 X#5001 Y#5002`,
      ].join('\n');
      if (sys === 'siemens') return [
        `T${t} D1`,
        `M6`,
        `; Привязка по отверстию (номинал ${nom} мм)`,
        `CYCLE977(,,110,${nom},2,0.5,1,0.1,,,,)`,
        `; результат — рабочий сдвиг`,
      ].join('\n');
      if (sys === 'heidenhain') return [
        `TOOL CALL ${t} Z`,
        `; Привязка по отверстию, dnom = ${nom} мм`,
        `CYCL DEF 412 TOUCHPROBE INSIDE ~`,
        `  Q321=+0      ; CENTR X`,
        `  Q322=+0      ; CENTR Y`,
        `  Q262=${nom}  ; NOMINAL DIAM`,
        `  Q325=+0      ; UGOL NACHI`,
        `  Q247=+90     ; SHAG UGLA`,
        `  Q303=+1      ; PEREDACHA`,
        `  Q381=0       ; OSH SHUPA`,
        `  Q320=2       ; DIST BEZOP`,
        `  Q260=50      ; BEZ VISOTA`,
        `CYCL CALL`,
      ].join('\n');
    }

    return '; operation not found';
  }

  /* ── DOM helpers ─────────────────────────────────────────── */
  // IDs used in the HTML
  const OP_SELECT_ID     = 'genOperation';
  const SYS_RADIO_NAME   = 'genSys';
  const FIELDS_CONTAINER = 'genFields';
  const GENERATE_BTN_ID  = 'genBtn';
  const COPY_BTN_ID      = 'genCopyBtn';
  const OUTPUT_PRE_ID    = 'genOutput';
  const OUTPUT_CODE_ID   = 'genOutputCode';
  const RESULT_LABEL_ID  = 'genResultLabel';

  function getSystem() {
    const checked = document.querySelector(`input[name="${SYS_RADIO_NAME}"]:checked`);
    return checked ? checked.value : 'fanuc';
  }

  function renderFields() {
    const opEl = document.getElementById(OP_SELECT_ID);
    const df   = document.getElementById(FIELDS_CONTAINER);
    if (!opEl || !df) return;
    const op  = opEl.value;
    const def = OPERATIONS[op];
    if (!def || !def.fields) { df.innerHTML = ''; return; }
    df.innerHTML = def.fields.map(f => `
      <div class="gen-group">
        <label class="gen-label" for="gf-${f.id}">${f.label}</label>
        <input class="gen-input" type="${f.type || 'number'}"
          id="gf-${f.id}" name="gf-${f.id}"
          value="${f.def !== undefined ? f.def : ''}"
          ${f.min  !== undefined ? `min="${f.min}"` : ''}
          ${f.step !== undefined ? `step="${f.step}"` : ''}
        >
      </div>
    `).join('');
  }

  function getFieldValues() {
    const opEl = document.getElementById(OP_SELECT_ID);
    if (!opEl) return {};
    const op  = opEl.value;
    const def = OPERATIONS[op];
    if (!def) return {};
    const vals = {};
    def.fields.forEach(f => {
      const el = document.getElementById(`gf-${f.id}`);
      vals[f.id] = el ? +el.value : (f.def || 0);
    });
    return vals;
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function generate() {
    const opEl   = document.getElementById(OP_SELECT_ID);
    const codeEl = document.getElementById(OUTPUT_CODE_ID);
    const label  = document.getElementById(RESULT_LABEL_ID);
    const cpBtn  = document.getElementById(COPY_BTN_ID);
    if (!opEl || !codeEl) return;

    const op  = opEl.value;
    const sys = getSystem();

    if (!op) {
      codeEl.textContent = '; Выберите операцию слева\n; и нажмите «Сгенерировать код»';
      if (label) label.textContent = 'Результат появится здесь';
      if (cpBtn) cpBtn.style.display = 'none';
      return;
    }

    const vals = getFieldValues();
    const code = genCode(op, sys, vals);
    codeEl.textContent = code;
    if (label) label.textContent = OPERATIONS[op].label.split('(')[0].trim();
    if (cpBtn) cpBtn.style.display = '';
  }

  /* ── Init ────────────────────────────────────────────────── */
  function initGenerator() {
    const opEl = document.getElementById(OP_SELECT_ID);
    if (!opEl) return;

    // HTML already has hardcoded <option> tags; just wire up events
    renderFields();

    opEl.addEventListener('change', () => { renderFields(); generate(); });

    document.querySelectorAll(`input[name="${SYS_RADIO_NAME}"]`).forEach(r =>
      r.addEventListener('change', () => generate())
    );

    const btn = document.getElementById(GENERATE_BTN_ID);
    if (btn) btn.addEventListener('click', generate);

    const cpBtn = document.getElementById(COPY_BTN_ID);
    if (cpBtn) cpBtn.addEventListener('click', () => {
      const codeEl = document.getElementById(OUTPUT_CODE_ID);
      if (!codeEl) return;
      navigator.clipboard.writeText(codeEl.textContent).then(() => {
        const orig = cpBtn.textContent;
        cpBtn.textContent = '✓ Скопировано';
        setTimeout(() => { cpBtn.textContent = orig; }, 1500);
      }).catch(() => {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGenerator);
  } else {
    initGenerator();
  }

})();

/* ═══════════════════════════════════════════════════════════════
   CUTTING PARAMETER CALCULATOR
   ═══════════════════════════════════════════════════════════════ */
(function () {

  function fmt(n, decimals) {
    if (!isFinite(n) || n <= 0) return '—';
    return n.toFixed(decimals).replace(/\.?0+$/, '') || '0';
  }

  function calcAndRender() {
    const D    = parseFloat(document.getElementById('cc-diam')?.value) || 0;
    const z    = parseInt(document.getElementById('cc-teeth')?.value) || 1;
    const Vc   = parseFloat(document.getElementById('cc-vc')?.value) || 0;
    const fz   = parseFloat(document.getElementById('cc-fz')?.value) || 0;
    const ae   = parseFloat(document.getElementById('cc-ae')?.value) || 0;
    const ap   = parseFloat(document.getElementById('cc-ap')?.value) || 0;
    const kc   = parseFloat(document.getElementById('cc-kc')?.value) || 2000;
    const res  = document.getElementById('cc-results');
    if (!res) return;

    if (!D || !Vc || !fz) {
      res.innerHTML = '<div class="calc-result-placeholder"><span style="font-size:2rem;opacity:.4">⚙️</span><span>Заполни D, Vc и fz</span></div>';
      return;
    }

    // Core calculations
    const n   = (Vc * 1000) / (Math.PI * D);           // об/мин
    const Vf  = n * fz * z;                              // мм/мин
    const MRR = ae * ap * Vf / 1000;                     // см³/мин
    const fpr = fz * z;                                  // мм/об
    const Pc  = (kc * ae * ap * Vf) / (60 * 1e6);       // кВт

    // Warnings
    const warnings = [];
    if (n > 24000) warnings.push('⚠ n > 24 000 об/мин — проверь паспорт шпинделя');
    if (Vf > 15000) warnings.push('⚠ Vf > 15 000 мм/мин — высокие нагрузки на ШВП');
    if (ae / D > 1.0) warnings.push('⚠ ae > D — ширина резания больше диаметра фрезы');
    if (ap / D > 1.5) warnings.push('⚠ ap > 1.5D — глубина резания очень большая');

    // Tips based on ae/D ratio
    const engRatio = ae / D;
    let tipText = '';
    const pct = Math.round(engRatio * 100);
    if (engRatio <= 0.1) tipText = `ae = ${pct}% от D — трохоидальная стратегия. Фреза холодная, служит дольше. Можно увеличить ap.`;
    else if (engRatio <= 0.5) tipText = `ae = ${pct}% от D — нормальный режим. Хорошо для большинства операций.`;
    else tipText = `ae = ${pct}% от D — полное врезание. Большая нагрузка на фрезу и шпиндель. Снизь Vf на 30–50%.`;

    res.innerHTML = `
      <div class="calc-result-grid">
        <div class="calc-result-card highlight">
          <div class="calc-result-label">Частота вращения n</div>
          <div class="calc-result-value">${fmt(n, 0)}<span class="calc-result-unit">об/мин</span></div>
          <div class="calc-result-formula">= Vc·1000 / (π·D)</div>
        </div>
        <div class="calc-result-card highlight-green">
          <div class="calc-result-label">Подача стола Vf</div>
          <div class="calc-result-value">${fmt(Vf, 0)}<span class="calc-result-unit">мм/мин</span></div>
          <div class="calc-result-formula">= n · fz · z</div>
        </div>
        <div class="calc-result-card">
          <div class="calc-result-label">Подача на оборот fpr</div>
          <div class="calc-result-value">${fmt(fpr, 4)}<span class="calc-result-unit">мм/об</span></div>
          <div class="calc-result-formula">= fz · z</div>
        </div>
        <div class="calc-result-card highlight-orange">
          <div class="calc-result-label">Съём материала Q</div>
          <div class="calc-result-value">${fmt(MRR, 2)}<span class="calc-result-unit">см³/мин</span></div>
          <div class="calc-result-formula">= ae · ap · Vf / 1000</div>
        </div>
        <div class="calc-result-card">
          <div class="calc-result-label">Мощность резания Pc</div>
          <div class="calc-result-value">${fmt(Pc, 2)}<span class="calc-result-unit">кВт</span></div>
          <div class="calc-result-formula">= kc · ae · ap · Vf / 60·10⁶</div>
        </div>
        <div class="calc-result-card">
          <div class="calc-result-label">Скорость резания Vc</div>
          <div class="calc-result-value">${fmt(Vc, 1)}<span class="calc-result-unit">м/мин</span></div>
          <div class="calc-result-formula">= π · D · n / 1000</div>
        </div>
      </div>
      ${warnings.map(w => `<div class="calc-warn">${w}</div>`).join('')}
      <div class="calc-tips">💡 ${tipText}</div>
    `;
  }

  function initCalc() {
    const btn = document.getElementById('cc-calc-btn');
    if (!btn) return;

    btn.addEventListener('click', calcAndRender);

    // Auto-calc on input change
    ['cc-diam','cc-teeth','cc-vc','cc-fz','cc-ae','cc-ap','cc-kc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', calcAndRender);
    });

    // Material preset fills Vc
    const matSel = document.getElementById('cc-material');
    const vcInput = document.getElementById('cc-vc');
    const vcGroup = document.getElementById('cc-vc-group');
    if (matSel && vcInput) {
      matSel.addEventListener('change', () => {
        if (matSel.value !== 'custom') {
          vcInput.value = matSel.value;
          if (vcGroup) vcGroup.style.display = 'none';
          calcAndRender();
        } else {
          if (vcGroup) vcGroup.style.display = '';
        }
      });
      // Init: hide manual Vc if material is preset
      if (matSel.value !== 'custom' && vcGroup) {
        vcInput.value = matSel.value;
        vcGroup.style.display = 'none';
      }
    }

    // Initial calc
    calcAndRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalc);
  } else {
    initCalc();
  }
})();
