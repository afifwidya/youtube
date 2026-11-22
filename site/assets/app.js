// Faceless Radar Front-End (Bahasa Indonesia & Multi-Region Support)
// Tanpa dependensi eksternal, render instan di browser.
// Semua teks data di-escape sebelum masuk ke innerHTML untuk keamanan.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const view = $('#view');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeId = (s) => (/^[A-Za-z0-9_-]{3,64}$/.test(s || '') ? s : null);
const DAY = 86_400_000;
const ytVideo = (id) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
const ytChannel = (id) => `https://www.youtube.com/channel/${encodeURIComponent(id)}`;
const thumbUrl = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;

/* ---------- pemformatan angka & tanggal ---------- */
const fmtNum = (n) => {
  if (n === null || n === undefined) return 'disembunyikan';
  const t = (x, d) => x.toFixed(d).replace(/\.0$/, '');
  if (n >= 1e9) return `${t(n / 1e9, 1)} Miliar`;
  if (n >= 1e6) return `${t(n / 1e6, n >= 1e7 ? 0 : 1)} Jt`;
  if (n >= 1e3) return `${t(n / 1e3, n >= 1e5 ? 0 : 1)} rb`;
  return String(Math.round(n));
};
const fmtX = (x) => (x === null || x === undefined ? '–' : `${x >= 10 ? Math.round(x) : x.toFixed(1)}×`);
const fmtPct = (x) => (x === null || x === undefined ? '–' : `${Math.round(x * 100)}%`);
const ageDays = (iso) => (Date.now() - Date.parse(iso)) / DAY;
const ago = (iso) => {
  if (!iso) return 'belum pernah';
  const h = (Date.now() - Date.parse(iso)) / 3_600_000;
  if (h < 1) return 'baru saja';
  if (h < 24) return `${Math.round(h)} jam yang lalu`;
  const d = Math.round(h / 24);
  return d === 1 ? 'kemarin' : `${d} hari yang lalu`;
};
const dayLabel = (iso) => {
  try {
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};
const plural = (n, label) => `${n} ${label}`;

/* ---------- state & data loading ---------- */
const D = {};
let currentRegion = 'id';
try {
  currentRegion = localStorage.getItem('fr.region') || 'id';
} catch {
  currentRegion = 'id';
}

const settings = { verifiedOnly: false };
try {
  settings.verifiedOnly = localStorage.getItem('fr.verified') === '1';
} catch {
  /* storage fallback */
}

async function load(region = currentRegion) {
  const get = async (name, fallback) => {
    try {
      // Prioritas 1: folder region spesifik (misal: data/id/ atau data/us/)
      let res = await fetch(`data/${region}/${name}.json`, { cache: 'no-cache' });
      if (!res.ok) {
        // Prioritas 2: fallback ke root data/
        res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
      }
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const [meta, niches, channels, videos, feed, reviews, notes, analysis] = await Promise.all([
    get('meta', null),
    get('niches', null),
    get('channels', []),
    get('videos', []),
    get('feed', []),
    get('reviews', { channels: {}, videos: {} }),
    get('niche_notes', {}),
    get('analysis', null),
  ]);

  if (!niches) {
    throw new Error('File data tidak ditemukan. Jalankan website melalui server lokal (npm run serve) bukan klik langsung file index.html.');
  }

  Object.assign(D, { meta: meta || {}, niches, channels, videos, feed, reviews, notes, analysis });
  D.nicheById = new Map(niches.map((n) => [n.id, n]));
  D.channelById = new Map(channels.map((c) => [c.id, c]));
  D.videoById = new Map(videos.map((v) => [v.id, v]));
}

const verdict = (channelId) => D.reviews.channels?.[channelId]?.faceless; // true, false, atau undefined
const channelVisible = (c) => c && verdict(c.id) !== false && (!settings.verifiedOnly || verdict(c.id) === true);
const visibleChannels = () => D.channels.filter(channelVisible);
const visibleVideos = () => D.videos.filter((v) => channelVisible(D.channelById.get(v.channelId)));
const hasData = () => D.videos.length > 0;
const verifiedCount = () => Object.values(D.reviews.channels || {}).filter((r) => r.faceless === true).length;

/* ---------- komponen UI ---------- */
const checkIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function faceBadge(channelId) {
  return verdict(channelId) === true ? `<span class="ok">${checkIcon}Terverifikasi Faceless</span>` : '';
}
function badgeOrPending(channelId) {
  return verdict(channelId) === true ? faceBadge(channelId) : '<span>Belum ditinjau</span>';
}

function meter(value, max = 100, tip = '') {
  if (value === null || value === undefined) return '<span class="muted">–</span>';
  return `<span class="meter" data-tip="${esc(tip)}"><span class="track"><i style="width:${Math.max(2, (value / max) * 100)}%"></i></span><b>${value}</b></span>`;
}

function rpmRange(rpm) {
  if (!rpm) return '<span class="muted small rpm-none">tanpa estimasi publik</span>';
  if (rpm.low === null || rpm.low === undefined) {
    return rpm.tier ? `<span class="muted small rpm-none">${esc(rpm.tier)}, tanpa angka</span>` : '<span class="muted small rpm-none">tanpa estimasi publik</span>';
  }
  const max = currentRegion === 'id' ? 6 : 30;
  const left = Math.min(100, (rpm.low / max) * 100);
  const width = Math.max(3, (Math.min(rpm.high, max) - rpm.low) / max * 100);
  const tip = `Estimasi pihak ketiga: $${rpm.low} sampai $${rpm.high} per 1.000 views. Skala grafik: $0 sampai $${max}.`;
  return `<span class="range" data-tip="${esc(tip)}"><span class="track"><i style="left:${left}%;width:${width}%"></i></span><span>$${rpm.low} s/d $${rpm.high}</span></span>`;
}

function nicheOf(channel) {
  return channel ? D.nicheById.get(channel.nicheIds[0]) : null;
}

function baseBar(v) {
  const pct = v.baseline && v.views ? Math.min(100, Math.max(1, (v.baseline / v.views) * 100)) : 0;
  const tip = `Video ini: ${fmtNum(v.views)} views. Rata-rata normal ${v.format === 'short' ? 'Shorts' : 'video'} channel ini: ${fmtNum(v.baseline)}.`;
  return `<div class="base" data-tip="${esc(tip)}" aria-hidden="true"><i></i><b style="left:${pct}%"></b></div>`;
}

function thumbBlock(v) {
  const id = safeId(v.id);
  if (!id) return '';
  return `<a class="tthumb" href="${ytVideo(id)}" target="_blank" rel="noopener noreferrer" aria-label="Tonton di YouTube: ${esc(v.title)}">
    <img src="${thumbUrl(id)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">
    <span class="mult">${fmtX(v.outlier)}</span>${v.format === 'short' ? '<span class="fmt">Shorts</span>' : ''}</a>`;
}

function signalCard(v) {
  const ch = D.channelById.get(v.channelId);
  const niche = nicheOf(ch);
  return `<article class="sig">${thumbBlock(v)}
    <h3 class="ttitle">${esc(v.title)}</h3>
    <div class="tmeta"><a href="#/channel/${esc(v.channelId)}">${esc(ch?.title)}</a>${niche ? `<a href="#/niche/${esc(niche.id)}">${esc(niche.name)}</a>` : ''}</div>
    ${baseBar(v)}
    <p class="tcap">${fmtNum(v.views)} views vs rata-rata ${fmtNum(v.baseline)}, rilis ${Math.round(ageDays(v.publishedAt))} hari lalu</p></article>`;
}

const TAG_LABELS = {
  'big-text': 'teks tebal',
  'text-free': 'tanpa teks',
  'number-or-countdown': 'angka / countdown',
  'ai-art': 'visual ai',
  'stock-footage': 'footage stok',
  'map': 'animasi peta',
  'silhouette': 'siluet misterius',
  'split-compare': 'split komparasi',
  'arrow-or-circle': 'panah penegas',
  'dark-moody': 'gelap mencekam',
  'bright-saturated': 'warna mencolok',
  'single-subject': 'objek tunggal',
  'collage': 'kolase gambar',
  'screenshot-ui': 'rekam layar UI',
  'chart-graph': 'grafik data',
  'illustration-animation': 'ilustrasi animasi',
  '3d-render': 'render 3d',
};

function thumbCard(v) {
  const ch = D.channelById.get(v.channelId);
  const niche = nicheOf(ch);
  const tags = (D.reviews.videos?.[v.id]?.tags || []).slice(0, 4);
  return `<article class="tcard">${thumbBlock(v)}
    <h3 class="ttitle">${esc(v.title)}</h3>
    <div class="tmeta"><a href="#/channel/${esc(v.channelId)}">${esc(ch?.title)}</a><span>${fmtNum(ch?.subs)} subscriber</span></div>
    ${baseBar(v)}
    <p class="tcap">${fmtNum(v.views)} views vs rata-rata ${fmtNum(v.baseline)}, rilis ${Math.round(ageDays(v.publishedAt))} hari lalu</p>
    <div class="tmeta">${niche ? `<a href="#/niche/${esc(niche.id)}">${esc(niche.name)}</a>` : ''}${faceBadge(v.channelId)}</div>
    ${tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">${esc(TAG_LABELS[t] || String(t).replace(/-/g, ' '))}</span>`).join('')}</div>` : ''}</article>`;
}

function waitingPanel() {
  const isIndo = currentRegion === 'id';
  return `<div class="waiting"><h2>Menunggu Pengambilan Data YouTube</h2>
    <p class="muted">Website sudah berjalan, namun data YouTube untuk wilayah ini belum dikumpulkan secara live. Cara mengumpulkannya:</p>
    <ol><li>Masukkan YouTube Data API Key Anda ke dalam file <code>.env</code> atau GitHub Secrets: <code>YOUTUBE_API_KEY</code>.</li>
    <li>Jalankan perintah pengumpulan: <code>npm run collect:${isIndo ? 'id' : 'us'}</code> di terminal.</li>
    <li>Muat ulang (refresh) halaman ini setelah proses selesai. Script juga bisa dijadwalkan otomatis setiap hari.</li></ol></div>`;
}

function reviewNote() {
  if (!hasData() || settings.verifiedOnly) return '';
  const all = visibleChannels().length;
  const done = verifiedCount();
  if (done >= all) return '';
  return `<p class="review-note">${done} dari ${all} channel yang dilacak telah ditinjau dan terverifikasi tanpa wajah (faceless). Sisanya belum ditinjau dan mungkin menampilkan wajah presenter.</p>`;
}

function verifiedNote() {
  if (!settings.verifiedOnly) return '';
  return verifiedCount() === 0
    ? '<p class="muted small" style="margin-bottom:16px">Belum ada channel yang terverifikasi tanpa wajah di wilayah ini, sehingga filter menyembunyikan semua data. Nonaktifkan "Hanya tanpa wajah" untuk melihat semua channel terlacak.</p>'
    : '';
}

/* ---------- halaman & views ---------- */
function renderHome() {
  const regLabel = currentRegion === 'id' ? 'Indonesia 🇮🇩' : 'Amerika Serikat 🇺🇸';
  document.title = `Breakouts (Viral) - ${regLabel} | Faceless Radar`;
  const nicheCount = D.niches.length;
  let html = `<header class="page-head"><h1>Video Breakout Viral (${regLabel})</h1>
    <p class="lede">Video dari channel faceless yang berhasil melampaui rata-rata tayangan normal channelnya dengan margin tertinggi. Melacak ${plural(nicheCount, 'niche')}${hasData() ? ` dan ${plural(visibleChannels().length, 'channel')}` : ''}.</p></header>`;
  
  if (!hasData()) {
    view.innerHTML = `${html}${waitingPanel()}<section><div class="sec-head"><h2>Daftar Niche yang Dilacak</h2></div>${nicheListByGroup()}</section>`;
    return;
  }

  const vids = visibleVideos();
  let list = vids.filter((v) => ageDays(v.publishedAt) <= 21);
  if (list.length < 4) list = vids;
  list = list.sort((a, b) => b.outlier - a.outlier).slice(0, 10);

  html += `${verifiedNote()}${reviewNote()}<section><div class="sec-head"><h2>Outlier Terbesar (Paling Meledak)</h2>
    <p>Garis di bawah thumbnail menunjukkan tayangan video. Titik putih menandai rata-rata normal video di channel tersebut.</p></div>
    <div class="signal">${list.map(signalCard).join('')}</div></section>`;

  const top = [...D.niches].filter((n) => n.metrics && n.metrics.opportunity !== null)
    .sort((a, b) => (b.metrics?.opportunity ?? 0) - (a.metrics?.opportunity ?? 0)).slice(0, 8);
  const feed = (D.feed || []).slice(0, 8);

  html += `<section class="two"><div><div class="sec-head"><h2>Niche dengan Peluang Terbesar</h2>
    <p>Diurutkan berdasarkan Skor Peluang (Opportunity Score). <a href="#/niches">Lihat semua niche</a>, atau pelajari kalkulasinya di halaman <a href="#/about">Metodologi</a>.</p></div>
    <div class="scroll"><table><thead><tr><th>Niche</th><th>Skor Peluang</th><th class="num">Rasio Breakout</th><th>Est. RPM</th></tr></thead><tbody>
    ${top.map((n) => `<tr><td><div class="cell-name"><a href="#/niche/${esc(n.id)}">${esc(n.name)}</a></div></td>
      <td>${meter(n.metrics.opportunity, 100, scoreTip(n))}</td><td class="num">${fmtPct(n.metrics.breakoutRate)}</td><td>${rpmRange(n.rpm)}</td></tr>`).join('')}
    </tbody></table></div></div>
    <aside><div class="sec-head"><h2>Catatan Analisis Tren</h2></div>${analysisBlock()}
    ${feed.length ? `<ul class="feed">${feed.map(feedItem).join('')}</ul>` : '<p class="muted">Feed pembaruan akan terisi otomatis setelah proses run harian.</p>'}</aside></section>`;

  view.innerHTML = html;
}

function analysisBlock() {
  const a = D.analysis;
  if (!a || !a.headline) return '';
  const watch = (a.watch || []).map((id) => D.nicheById.get(id)).filter(Boolean);
  return `<div class="note" style="margin-bottom:18px"><h3>${esc(a.headline)}</h3>
    ${(a.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('')}
    ${watch.length ? `<p class="small muted">Niche menarik ditinjau: ${watch.map((n) => `<a href="#/niche/${esc(n.id)}">${esc(n.name)}</a>`).join(', ')}</p>` : ''}
    <p class="small muted">Dianalisis: ${esc(a.date || '')}</p></div>`;
}

function feedItem(e) {
  const link = e.type === 'breakout' && safeId(e.videoId)
    ? `<a href="${ytVideo(e.videoId)}" target="_blank" rel="noopener noreferrer">${esc(e.title)}</a>`
    : e.nicheId && D.nicheById.has(e.nicheId) ? `<a href="#/niche/${esc(e.nicheId)}">${esc(e.title)}</a>` : esc(e.title);
  return `<li><time datetime="${esc(e.date)}">${esc(dayLabel(e.date))}</time><div>${link}<p>${esc(e.text)}</p></div></li>`;
}

function nicheListByGroup() {
  const groups = new Map();
  for (const n of D.niches) groups.set(n.group, [...(groups.get(n.group) || []), n]);
  return [...groups].map(([g, items]) => `<p style="margin:14px 0 4px"><strong>${esc(g)}</strong></p>
    <p class="muted">${items.map((n) => `<a href="#/niche/${esc(n.id)}">${esc(n.name)}</a>`).join(', ')}</p>`).join('');
}

function scoreTip(n) {
  const m = n.metrics;
  return `Skor Peluang ${m.opportunity} dari 100, dari ${plural(m.channels, 'channel')} (tingkat keyakinan: ${m.confidence}).`;
}

/* Tabel Niche */
const NICHE_COLS = [
  { key: 'name', label: 'Niche', get: (n) => n.name.toLowerCase(), cls: '' },
  { key: 'opportunity', label: 'Peluang', get: (n) => n.metrics?.opportunity },
  { key: 'breakout', label: 'Rasio Breakout', get: (n) => n.metrics?.breakoutRate, cls: 'num' },
  { key: 'outlier', label: 'Outlier Terbaik', get: (n) => n.metrics?.medianTopOutlier, cls: 'num' },
  { key: 'channels', label: 'Jumlah Channel', get: (n) => n.metrics?.channels, cls: 'num' },
  { key: 'small', label: '< 100K Subs', get: (n) => n.metrics?.smallChannelShare, cls: 'num' },
  { key: 'rpm', label: 'Est. RPM', get: (n) => (n.rpm && n.rpm.low != null ? (n.rpm.low + n.rpm.high) / 2 : null) },
];
const nicheSort = { key: 'opportunity', dir: -1 };

function nicheRow(n) {
  const m = n.metrics || {};
  return `<tr><td><div class="cell-name"><a href="#/niche/${esc(n.id)}">${esc(n.name)}</a><span class="muted small">${esc(n.group)}</span></div></td>
    <td>${meter(m.opportunity, 100, m.opportunity === null ? 'Belum cukup sampel channel.' : scoreTip(n))}</td>
    <td class="num">${fmtPct(m.breakoutRate)}</td><td class="num">${fmtX(m.medianTopOutlier)}</td>
    <td class="num ${m.confidence === 'low' ? 'conf-low' : ''}" data-tip="${esc(`Kepercayaan data: ${m.confidence}`)}">${m.channels ?? 0}</td>
    <td class="num">${fmtPct(m.smallChannelShare)}</td><td>${rpmRange(n.rpm)}</td></tr>`;
}

function renderNiches() {
  const regLabel = currentRegion === 'id' ? 'Indonesia 🇮🇩' : 'Amerika Serikat 🇺🇸';
  document.title = `Niche & Topik (${regLabel}) | Faceless Radar`;
  const groups = [...new Set(D.niches.map((n) => n.group))];
  view.innerHTML = `<header class="page-head"><h1>Daftar Niche & Kategori (${regLabel})</h1>
    <p class="lede">Semua niche faceless yang dilacak, seberapa sering video di dalamnya meledak (breakout), dan estimasi potensi penghasilannya (RPM).</p></header>
    <div class="controls"><label class="field">Cari Niche<input type="search" id="nq" placeholder="Ketik nama niche..."></label>
    <label class="field">Kategori<select id="ng"><option value="">Semua Kategori</option>${groups.map((g) => `<option>${esc(g)}</option>`).join('')}</select></label></div>
    ${hasData() ? '' : waitingPanel()}
    <div class="scroll"><table id="ntable"><thead><tr>${NICHE_COLS.map((c) => `<th class="${c.cls || ''}" data-col="${c.key}"><button type="button">${esc(c.label)}</button></th>`).join('')}</tr></thead><tbody></tbody></table></div>
    <p class="muted small" style="margin-top:14px;max-width:70ch">Angka RPM adalah estimasi dari artikel & data riset pihak ketiga. Angka ini bervariasi tergantung negara penonton dan musim, jadi gunakan sebagai perbandingan potensi relatif. Klik salah satu niche untuk membuka detail formula thumbnail dan channelnya.</p>`;
  
  const body = $('#ntable tbody');
  const draw = () => {
    const q = $('#nq').value.trim().toLowerCase();
    const g = $('#ng').value;
    const col = NICHE_COLS.find((c) => c.key === nicheSort.key);
    const rows = D.niches.filter((n) => (!g || n.group === g) && (!q || n.name.toLowerCase().includes(q)))
      .sort((a, b) => {
        const x = col.get(a); const y = col.get(b);
        if (x === null || x === undefined) return y === null || y === undefined ? 0 : 1;
        if (y === null || y === undefined) return -1;
        return (x < y ? -1 : x > y ? 1 : 0) * nicheSort.dir;
      });
    body.innerHTML = rows.map(nicheRow).join('') || '<tr><td colspan="7" class="muted">Tidak ada niche yang cocok dengan pencarian tersebut.</td></tr>';
    for (const th of $$('#ntable th')) {
      if (th.dataset.col === nicheSort.key) th.setAttribute('aria-sort', nicheSort.dir === 1 ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    }
  };

  $('#ntable thead').addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (!th) return;
    const key = th.dataset.col;
    if (nicheSort.key === key) nicheSort.dir *= -1;
    else { nicheSort.key = key; nicheSort.dir = key === 'name' ? 1 : -1; }
    draw();
  });
  $('#nq').addEventListener('input', draw);
  $('#ng').addEventListener('change', draw);
  draw();
}

function renderNiche(id) {
  const n = D.nicheById.get(id);
  if (!n) return notFound('Niche tersebut belum dilacak.');
  document.title = `${n.name} | Faceless Radar`;
  const m = n.metrics || {};
  const note = D.notes?.[id];
  const chans = visibleChannels().filter((c) => c.nicheIds.includes(id))
    .sort((a, b) => (b.bestOutlier60d ?? -1) - (a.bestOutlier60d ?? -1));
  const vids = visibleVideos().filter((v) => D.channelById.get(v.channelId)?.nicheIds?.includes(id))
    .sort((a, b) => b.outlier - a.outlier);
  const sources = (n.rpm?.sources || []).map((s) => /^https:\/\//.test(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>` : esc(s.label)).join(', ');

  view.innerHTML = `<a class="back" href="#/niches">← Kembali ke semua niche</a>
    <header class="page-head" style="margin-top:10px"><h1>${esc(n.name)}</h1><p class="lede">${esc(n.description)}</p></header>
    <dl class="facts">
      <div><dt>Skor Peluang</dt><dd>${m.opportunity ?? '–'}<small>${m.confidence === 'none' ? 'Belum ada sampel channel' : `${plural(m.channels, 'channel')} dianalisis, keyakinan: ${m.confidence}`}</small></dd></div>
      <div><dt>Rasio Breakout</dt><dd>${fmtPct(m.breakoutRate)}<small>channel dengan video ${D.meta.breakoutThreshold ?? 5}× (${fmtNum(D.meta.breakoutMinViews ?? 0)}+ views) dlm 60 hari</small></dd></div>
      <div><dt>Outlier Terbaik Rata-rata</dt><dd>${fmtX(m.medianTopOutlier)}<small>median antar channel</small></dd></div>
      <div><dt>Porsi Channel Kecil</dt><dd>${fmtPct(m.smallChannelShare)}<small>di bawah 100K subscribers</small></dd></div>
      <div><dt>Kecepatan Upload</dt><dd>${m.uploadsPerWeek ?? '–'}<small>video per minggu (median)</small></dd></div>
      <div><dt>Porsi Shorts</dt><dd>${fmtPct(m.shortsShare)}<small>dari upload terkini</small></dd></div>
    </dl>
    <section><div class="sec-head"><h2>Estimasi Pendapatan (RPM)</h2></div>
      <p>${rpmRange(n.rpm)}</p>
      <p class="muted small" style="margin-top:8px;max-width:70ch">${n.rpm?.note ? `${esc(n.rpm.note)} ` : ''}${sources ? `Sumber: ${sources}.` : 'Belum ada estimasi publik spesifik.'} RPM adalah pendapatan kreator per 1.000 views, sangat dipengaruhi oleh demografi negara penonton dan jenis iklan.</p></section>
    <section><div class="sec-head"><h2>Formula Thumbnail yang Berhasil</h2></div>${formulaBlock(note)}</section>
    <section><div class="sec-head"><h2>Thumbnail Terbaik (Outlier Tertinggi)</h2><p>Video dengan rasio outlier tertinggi di niche ini. <a href="#/thumbnails?niche=${esc(id)}">Buka di galeri thumbnail</a>.</p></div>
      ${verifiedNote()}${reviewNote()}${vids.length ? `<div class="tgrid">${vids.slice(0, 8).map(thumbCard).join('')}</div>` : '<p class="muted">Belum ada video yang terkumpul untuk niche ini.</p>'}</section>
    <section><div class="sec-head"><h2>Daftar Channel</h2></div>${channelTable(chans)}</section>`;
}

function formulaBlock(note) {
  if (!note || (!note.summary && !(note.thumbnailFormula || []).length)) {
    return '<p class="muted" style="max-width:70ch">Belum dianalisis. Review harian AI membedah thumbnail terbaik di tiap niche dan merangkum polanya di sini.</p>';
  }
  const list = (items) => (items?.length ? `<ul class="formula">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  return `${note.summary ? `<p style="max-width:70ch;margin-bottom:12px">${esc(note.summary)}</p>` : ''}${list(note.thumbnailFormula)}
    ${note.titlePatterns?.length ? `<h3 style="margin:18px 0 8px">Pola Judul Viral</h3>${list(note.titlePatterns)}` : ''}
    ${note.updatedOn ? `<p class="muted small" style="margin-top:10px">Ditinjau: ${esc(note.updatedOn)}</p>` : ''}`;
}

function channelTable(chans) {
  if (!chans.length) return '<p class="muted">Belum ada channel untuk ditampilkan.</p>';
  return `<div class="scroll"><table><thead><tr><th>Channel</th><th class="num">Subscribers</th><th class="num">Outlier Terbaik</th><th class="num">Upload / Minggu</th><th class="num">Porsi Shorts</th><th>Status Faceless</th></tr></thead><tbody>
    ${chans.slice(0, 40).map((c) => `<tr><td><div class="cell-ch">${avatar(c)}<a href="#/channel/${esc(c.id)}">${esc(c.title)}</a></div></td>
      <td class="num">${fmtNum(c.subs)}</td><td class="num">${fmtX(c.bestOutlier60d)}</td><td class="num">${c.uploadsPerWeek ?? '–'}</td>
      <td class="num">${fmtPct(c.shortsShare)}</td><td>${badgeOrPending(c.id)}</td></tr>`).join('')}</tbody></table></div>`;
}

function avatar(c) {
  return c.avatar && /^https:\/\//.test(c.avatar)
    ? `<img class="avatar" src="${esc(c.avatar)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span class="avatar"></span>';
}

/* Galeri Thumbnail */
function renderThumbs(_, params) {
  const regLabel = currentRegion === 'id' ? 'Indonesia 🇮🇩' : 'Amerika Serikat 🇺🇸';
  document.title = `Galeri Thumbnail (${regLabel}) | Faceless Radar`;
  const f = {
    niche: params.get('niche') || '', format: params.get('format') || 'all', min: Number(params.get('min') ?? 3),
    sort: params.get('sort') || 'outlier', q: params.get('q') || '',
  };
  let shown = 48;
  const nicheOpts = [...D.niches].sort((a, b) => a.name.localeCompare(b.name))
    .map((n) => `<option value="${esc(n.id)}" ${n.id === f.niche ? 'selected' : ''}>${esc(n.name)}</option>`).join('');
  const sel = (val, opts) => opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(val) ? 'selected' : ''}>${l}</option>`).join('');

  view.innerHTML = `<header class="page-head"><h1>Galeri Thumbnail (${regLabel})</h1>
    <p class="lede">Jelajahi visual thumbnail dari video-video breakout. Filter berdasarkan niche, format durasi, dan seberapa besar video mengungguli rata-rata channelnya.</p></header>
    <div class="controls">
      <label class="field">Niche<select id="fn"><option value="">Semua Niche</option>${nicheOpts}</select></label>
      <div class="field">Format<div class="seg" role="group" aria-label="Format Video">
        ${[['all', 'Semua'], ['long', 'Video Panjang'], ['short', 'Shorts']].map(([v, l]) => `<button type="button" data-format="${v}" aria-pressed="${f.format === v}">${l}</button>`).join('')}</div></div>
      <label class="field">Minimal Outlier<select id="fm">${sel(f.min, [[1, 'Semua'], [3, '3× atau lebih'], [5, '5× atau lebih'], [10, '10× atau lebih'], [20, '20× atau lebih']])}</select></label>
      <label class="field">Urutkan<select id="fs">${sel(f.sort, [['outlier', 'Skor Outlier'], ['views', 'Total Views'], ['vpd', 'Views per Hari'], ['recent', 'Terbaru']])}</select></label>
      <label class="field">Cari Judul<input type="search" id="fq" value="${esc(f.q)}" placeholder="Ketik kata kunci judul..."></label>
    </div>${hasData() ? verifiedNote() + reviewNote() : waitingPanel()}
    <p class="muted small" id="count" style="margin-bottom:16px" aria-live="polite"></p>
    <div class="tgrid" id="grid"></div><div class="more" id="more"></div>`;

  const grid = $('#grid');
  const draw = (reset = true) => {
    if (reset) shown = 48;
    const q = f.q.trim().toLowerCase();
    const sorters = {
      outlier: (a, b) => b.outlier - a.outlier, views: (a, b) => b.views - a.views,
      vpd: (a, b) => b.viewsPerDay - a.viewsPerDay, recent: (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    };
    const list = visibleVideos().filter((v) =>
      (!f.niche || D.channelById.get(v.channelId)?.nicheIds?.includes(f.niche)) &&
      (f.format === 'all' || v.format === f.format) && v.outlier >= f.min && (!q || v.title.toLowerCase().includes(q)),
    ).sort(sorters[f.sort] || sorters.outlier);

    grid.innerHTML = list.slice(0, shown).map(thumbCard).join('');
    $('#count').textContent = hasData() ? `${plural(list.length, 'video')} ditemukan.` : '';
    $('#more').innerHTML = list.length > shown ? '<button class="btn" type="button" id="moreBtn">Tampilkan lebih banyak</button>' : '';
    if (!list.length && hasData()) grid.innerHTML = '<p class="muted">Tidak ada video yang cocok dengan filter ini. Coba turunkan batas minimal outlier atau bersihkan pencarian kata kunci.</p>';
    
    const qs = new URLSearchParams({ ...(f.niche && { niche: f.niche }), ...(f.format !== 'all' && { format: f.format }), min: f.min, sort: f.sort, ...(f.q && { q: f.q }) });
    history.replaceState(null, '', `#/thumbnails?${qs}`);
    $('#moreBtn')?.addEventListener('click', () => { shown += 48; draw(false); });
  };

  $('#fn').addEventListener('change', (e) => { f.niche = e.target.value; draw(); });
  $('#fm').addEventListener('change', (e) => { f.min = Number(e.target.value); draw(); });
  $('#fs').addEventListener('change', (e) => { f.sort = e.target.value; draw(); });
  $('#fq').addEventListener('input', (e) => { f.q = e.target.value; draw(); });
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    f.format = b.dataset.format;
    $$('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));
  draw();
}

function renderChannel(id) {
  const c = D.channelById.get(id);
  if (!c || !channelVisible(c)) return notFound('Channel tersebut tidak ditemukan dalam data.');
  document.title = `${c.title} | Faceless Radar`;
  const vids = D.videos.filter((v) => v.channelId === id).sort((a, b) => b.outlier - a.outlier);
  const niches = c.nicheIds.map((n) => D.nicheById.get(n)).filter(Boolean);
  const review = D.reviews.channels?.[id];

  view.innerHTML = `<a class="back" href="#/niches">← Kembali ke semua niche</a>
    <header class="page-head" style="margin-top:10px"><div class="cell-ch">${avatar(c)}<h1>${esc(c.title)}</h1></div>
    <p class="lede">${niches.map((n) => `<a href="#/niche/${esc(n.id)}">${esc(n.name)}</a>`).join(', ')}</p>
    <p><a href="${ytChannel(safeId(c.id) || '')}" target="_blank" rel="noopener noreferrer">Buka Channel di YouTube ↗</a></p></header>
    <dl class="facts">
      <div><dt>Subscribers</dt><dd>${fmtNum(c.subs)}</dd></div>
      <div><dt>Rata-rata Video Panjang</dt><dd>${fmtNum(c.baseline?.long)}<small>views per video</small></dd></div>
      <div><dt>Rata-rata Shorts</dt><dd>${fmtNum(c.baseline?.short)}<small>views per Shorts</small></dd></div>
      <div><dt>Outlier Terbaik (60 hari)</dt><dd>${fmtX(c.bestOutlier60d)}<small>kelipatan rekor</small></dd></div>
      <div><dt>Kecepatan Upload</dt><dd>${c.uploadsPerWeek ?? '–'}<small>video per minggu</small></dd></div>
      <div><dt>Mulai Dibuat</dt><dd>${c.createdAt ? new Date(c.createdAt).getFullYear() : '–'}<small>${badgeOrPending(c.id)}</small></dd></div>
    </dl>
    ${review?.note ? `<p class="muted" style="margin-top:16px;max-width:70ch">${esc(review.note)}</p>` : ''}
    <section><div class="sec-head"><h2>Video Paling Meledak</h2></div>
    ${vids.length ? `<div class="tgrid">${vids.map(thumbCard).join('')}</div>` : '<p class="muted">Belum ada video yang melampaui rata-rata normal channel ini dalam 90 hari terakhir.</p>'}</section>`;
}

function renderAbout() {
  document.title = 'Metodologi | Faceless Radar';
  const t = D.meta.breakoutThreshold ?? 5;
  view.innerHTML = `<header class="page-head"><h1>Metodologi Riset</h1><p class="lede">Bagaimana angka-angka ini dihitung dan batasannya.</p></header>
  <div class="prose">
    <h2>Dari Mana Data Berasal</h2>
    <p>Setiap hari sistem mengeksekusi pencarian ke YouTube Data API v3 untuk setiap niche yang dilacak, mengumpulkan channel di balik video-video terkini dengan views tertinggi, lalu membaca histori upload terbaru masing-masing channel. Thumbnail dimuat langsung dari CDN YouTube. Tidak ada data yang di-scrape dari alat riset pihak ketiga lainnya.</p>
    <h2>Skor Outlier (Outlier Score)</h2>
    <p>Skor outlier dihitung dengan membagi jumlah views sebuah video dengan <strong>median views dari 30 video terakhir</strong> pada channel tersebut dengan format yang sama (Video Panjang atau Shorts). Skor 12× berarti video tersebut memperoleh 12 kali lipat lebih banyak views dibanding performa normal channelnya. Video yang berusia kurang dari 2 hari dilewati agar views stabil terlebih dahulu.</p>
    <h2>Skor Peluang (Opportunity Score: 0 - 100)</h2>
    <p>Heuristik 0 hingga 100 yang memberi bobot pada 4 komponen:</p>
    <ul>
      <li><strong>Hingga 40 poin untuk Breakout Rate:</strong> Persentase channel di niche tersebut yang berhasil memproduksi video ${t}× dalam 60 hari terakhir. Video harus memiliki minimal ${fmtNum(D.meta.breakoutMinViews ?? 0)} views agar channel mikro tidak menggelembungkan skor secara semu.</li>
      <li><strong>Hingga 25 poin untuk Peluang Channel Baru:</strong> Persentase channel berusia di bawah 1 tahun yang mampu menembus lebih dari 50.000 views.</li>
      <li><strong>Hingga 20 poin untuk Estimasi RPM:</strong> Niche dengan nilai RPM lebih tinggi memperoleh poin lebih besar. Niche tanpa data publik memperoleh nilai netral 10.</li>
      <li><strong>Hingga 15 poin untuk Saturasi Rendah:</strong> Semakin sedikit channel raksasa (di atas 1 juta subscriber), semakin tinggi poin yang didapat.</li>
    </ul>
    <h2>Verifikasi Channel Faceless</h2>
    <p>YouTube API tidak memiliki label otomatis apakah sebuah channel menampilkan wajah atau tidak. Kueri pencarian diarahkan pada format faceless, kemudian proses review AI memverifikasi visual thumbnail dan judul video untuk menandai channel sebagai <em>Verified Faceless</em>. Anda dapat mengaktifkan filter "Hanya tanpa wajah" di sidebar untuk menyaring hanya channel yang telah terverifikasi.</p>
    <h2>Estimasi Penghasilan (RPM)</h2>
    <p>Angka RPM dikumpulkan dari artikel dan data industri publik. Angka aktual sangat bergantung pada lokasi geografis penonton (negara audiens tier-1 seperti US/UK jauh lebih tinggi dibanding pasar berkembang) dan musim periklanan (kuartal ke-4 biasanya tertinggi).</p>
  </div>`;
}

function notFound(msg = 'Halaman tidak ditemukan.') {
  view.innerHTML = `<header class="page-head"><h1>Halaman Tidak Ditemukan</h1><p class="lede">${esc(msg)} <a href="#/">Kembali ke halaman utama</a>.</p></header>`;
}

/* ---------- router ---------- */
const ROUTES = [
  [/^\/?$/, 'home', renderHome],
  [/^\/niches$/, 'niches', renderNiches],
  [/^\/niche\/([\w-]+)$/, 'niches', renderNiche],
  [/^\/thumbnails$/, 'thumbnails', renderThumbs],
  [/^\/channel\/([\w-]+)$/, 'niches', renderChannel],
  [/^\/about$/, 'about', renderAbout],
];

function route(scroll = true) {
  const [path, qs = ''] = (location.hash.slice(1) || '/').split('?');
  for (const [re, key, fn] of ROUTES) {
    const m = re.exec(path);
    if (!m) continue;
    $$('.links a').forEach((a) => (a.dataset.route === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    try {
      fn(m[1], new URLSearchParams(qs));
    } catch (err) {
      view.innerHTML = `<p class="error">Terjadi kendala saat merender halaman: ${esc(err.message)}</p>`;
    }
    if (scroll) { window.scrollTo(0, 0); view.focus({ preventScroll: true }); }
    return;
  }
  notFound();
}

const tip = $('#tip');
function showTip(el) {
  tip.textContent = el.getAttribute('data-tip');
  tip.hidden = false;
  const r = el.getBoundingClientRect();
  const x = Math.max(8, Math.min(r.left + r.width / 2 - tip.offsetWidth / 2, innerWidth - tip.offsetWidth - 8));
  const y = r.top - tip.offsetHeight - 8 < 8 ? r.bottom + 8 : r.top - tip.offsetHeight - 8;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest?.('[data-tip]');
  if (el && el.getAttribute('data-tip')) showTip(el); else tip.hidden = true;
});
document.addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });
document.addEventListener('error', (e) => {
  if (e.target instanceof HTMLImageElement) e.target.style.visibility = 'hidden';
}, true);

/* ---------- boot ---------- */
async function boot() {
  const regSelect = $('#regionSelect');
  if (regSelect) {
    regSelect.value = currentRegion;
    regSelect.addEventListener('change', async (e) => {
      currentRegion = e.target.value;
      try { localStorage.setItem('fr.region', currentRegion); } catch { /* ignore */ }
      try {
        await load(currentRegion);
        $('#updated').textContent = D.meta.updatedAt ? `Diperbarui ${ago(D.meta.updatedAt)}` : 'Belum ada data';
        route(false);
      } catch (err) {
        view.innerHTML = `<p class="error">${esc(err.message)}</p>`;
      }
    });
  }

  try {
    await load(currentRegion);
  } catch (err) {
    view.innerHTML = `<p class="error">${esc(err.message)}</p>`;
    return;
  }

  $('#updated').textContent = D.meta.updatedAt ? `Diperbarui ${ago(D.meta.updatedAt)}` : 'Belum ada data';
  const toggle = $('#verifiedOnly');
  if (toggle) {
    toggle.checked = settings.verifiedOnly;
    toggle.addEventListener('change', () => {
      settings.verifiedOnly = toggle.checked;
      try { localStorage.setItem('fr.verified', toggle.checked ? '1' : '0'); } catch { /* ignore */ }
      route(false);
    });
  }

  window.addEventListener('hashchange', () => route());
  route();
}

boot();
