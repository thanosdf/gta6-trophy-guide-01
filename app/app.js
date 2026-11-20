// Leonida Trophy Guide: a checklist, a roadmap and a missables watch list
// for the 55 official GTA VI trophies. Everything runs offline: the only
// file it loads is data/trophies.json, from the same folder. Progress lives
// in this browser's localStorage and nowhere else.

import { ROADMAP } from './roadmap.js';

const STORE_KEY = 'gta6-trophy-guide-v1';
const KIND_LABELS = {
  story: 'Story',
  activities: 'Activities',
  collectibles: 'Collectibles',
  crime: 'Crime & money',
  contacts: 'Contacts & strangers',
  completion: 'Completion',
  misc: 'Everything else',
};

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let saved = { earned: [], spoiler: true };
try {
  const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
  if (raw && Array.isArray(raw.earned)) saved = { earned: raw.earned, spoiler: raw.spoiler !== false };
} catch {
  saved = { earned: [], spoiler: true };
}
const earned = new Set(saved.earned.filter((id) => byId.has(id)));
let spoilerOn = saved.spoiler;
let selectedId = trophies[0].id;

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const detailEl = $('detail');

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned], spoiler: spoilerOn }));
}

function isHidden(t) {
  return spoilerOn && t.hidden && !earned.has(t.id);
}

function gradeBadge(t) {
  return `<span class="grade-badge grade-${t.grade}">${t.grade}</span>`;
}

function visibleTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const grade = $('grade-filter').value;
  const kind = $('kind-filter').value;
  const earnedOnly = $('earned-only').checked;
  return trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (kind === 'watch' && !t.watch) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'watch' && kind !== 'online' && t.kind !== kind) return false;
    if (q) {
      const hay = isHidden(t) ? '' : `${t.name} ${t.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  $('progress-text').textContent = `${done} of ${total} earned`;
  $('progress-pct').textContent = `${Math.round((done / total) * 100)}%`;
  $('progress-fill').style.width = `${(done / total) * 100}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${g} ${have}/${all}`;
  });
  $('grade-counts').textContent = counts.join('  ·  ');
}

function renderList() {
  const kind = $('kind-filter').value;
  const shown = visibleTrophies();
  listEl.replaceChildren();
  if (kind === 'online') {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No online trophies: no trophy in the official list mentions online play, so all 55 are earned in single-player.';
    listEl.append(li);
  }
  if (shown.length === 0 && kind !== 'online') {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Nothing matches those filters. Clear the search or widen the grade and kind.';
    listEl.append(li);
  }
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = `${earned.has(t.id) ? 'earned' : ''} ${t.id === selectedId ? 'selected' : ''}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${isHidden(t) ? 'hidden story trophy' : t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    const body = document.createElement('div');
    if (isHidden(t)) {
      body.innerHTML = `<div class="trophy-name">Hidden story trophy</div><div class="trophy-desc spoiler-note">Spoilers are on: earn it to reveal the name and description.</div><div class="trophy-meta">Story &middot; hidden until earned</div>`;
    } else {
      const name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = t.name;
      const desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = t.description;
      const meta = document.createElement('div');
      meta.className = 'trophy-meta';
      meta.textContent = `${KIND_LABELS[t.kind]}${t.count ? ` · target ${t.count.toLocaleString()}` : ''}${t.watch ? ' · watch list' : ''}`;
      body.append(name, desc, meta);
    }
    const badge = document.createElement('span');
    badge.innerHTML = gradeBadge(t);
    li.append(box, body, badge);
    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
  $('list-count').textContent = kind === 'online'
    ? '0 trophies: the official list has no online trophies.'
    : `Showing ${shown.length} of ${trophies.length} trophies`;
}

function renderDetail() {
  const t = byId.get(selectedId) ?? trophies[0];
  detailEl.replaceChildren();
  if (isHidden(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.className = 'official';
    p.textContent = 'Spoilers are on, so this story trophy stays hidden until you earn it. Turn spoilers off in the checklist controls to see it early.';
    const row = document.createElement('div');
    row.className = 'earn-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Mark earned';
    btn.addEventListener('click', () => {
      earned.add(t.id);
      save();
      renderAll();
    });
    row.append(btn);
    detailEl.append(h, p, row);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const badge = document.createElement('p');
  badge.innerHTML = gradeBadge(t);
  const officialLabel = document.createElement('p');
  officialLabel.className = 'label';
  officialLabel.textContent = 'Official description';
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = t.description;
  const facts = document.createElement('p');
  facts.textContent = `${KIND_LABELS[t.kind]} · ${t.grade} · roadmap stage ${t.stage}${t.count ? ` · target ${t.count.toLocaleString()}` : ''} · ${t.missable ? 'missable' : 'not missable'}${t.watch ? ' · on the watch list' : ''}`;
  const guideLabel = document.createElement('p');
  guideLabel.className = 'label';
  guideLabel.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const sourceLabel = document.createElement('p');
  sourceLabel.className = 'label';
  sourceLabel.textContent = 'Sources';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    sources.append(li);
  }
  const row = document.createElement('div');
  row.className = 'earn-row';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = earned.has(t.id) ? 'Earned ✓' : 'Mark earned';
  btn.className = earned.has(t.id) ? 'earned' : '';
  btn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderAll();
  });
  row.append(btn);
  detailEl.append(h, badge, officialLabel, official, facts, guideLabel, guide, sourceLabel, sources, row);
}

function renderRoadmap() {
  const wrap = $('roadmap');
  wrap.replaceChildren();
  for (const stage of ROADMAP) {
    const card = document.createElement('div');
    card.className = 'stage-card';
    const done = stage.ids.filter((id) => earned.has(id)).length;
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.stage}: ${stage.title} — ${done} of ${stage.ids.length} earned`;
    const note = document.createElement('p');
    note.textContent = stage.note;
    const chips = document.createElement('div');
    chips.className = 'stage-chips';
    for (const id of stage.ids) {
      const t = byId.get(id);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip${earned.has(id) ? ' done' : ''}`;
      chip.textContent = isHidden(t) ? 'Hidden story trophy' : t.name;
      chip.addEventListener('click', () => {
        selectedId = id;
        switchTab('checklist');
        renderAll();
      });
      chips.append(chip);
    }
    card.append(h, note, chips);
    wrap.append(card);
  }
}

function renderWatchList() {
  const wrap = $('watch-list');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.watch)) {
    const card = document.createElement('div');
    card.className = 'stage-card';
    const h = document.createElement('h3');
    h.textContent = t.name;
    const p = document.createElement('p');
    p.textContent = t.guide;
    const why = document.createElement('p');
    why.innerHTML = '<span class="watch-flag">Watch, not confirmed missable:</span> the official description does not say this can be missed. It is listed here because it needs a partner beside you, or a second attempt, and that chance may not come again.';
    card.append(h, p, why);
    wrap.append(card);
  }
}

function renderAbout() {
  const g = data.grades;
  $('about-stats').textContent = `55 trophies: ${g.platinum} platinum, ${g.gold} gold, ${g.silver} silver and ${g.bronze} bronze. ${data.hiddenCount} of the 55 are hidden on PlayStation until earned.`;
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderWatchList();
  renderAbout();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
}
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

$('search').addEventListener('input', renderList);
$('grade-filter').addEventListener('change', renderList);
$('kind-filter').addEventListener('change', renderList);
$('earned-only').addEventListener('change', renderList);
$('spoiler-toggle').checked = spoilerOn;
$('spoiler-toggle').addEventListener('change', (e) => {
  spoilerOn = e.target.checked;
  save();
  renderAll();
});

$('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const next = new Set(ids.map(Number).filter((id) => byId.has(id)));
    earned.clear();
    for (const id of next) earned.add(id);
    save();
    renderAll();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  e.target.value = '';
});

$('reset-btn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned.clear();
  save();
  renderAll();
});

renderAll();
