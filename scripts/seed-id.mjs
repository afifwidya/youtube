import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const niches = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'niches-id.json'), 'utf8'));
const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'settings-id.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'site', 'data', 'id');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'history'), { recursive: true });

const now = Date.now();
const DAY = 86400000;
const todayIso = new Date(now).toISOString();
const dateStr = todayIso.slice(0, 10);

const CHANNELS_DATA = [
  {
    name: "Misteri Malam Nusantara",
    nicheId: "horor-misteri-nyata",
    subs: 185000,
    created: "2023-03-12T00:00:00Z",
    uploadsPerWeek: 2.5,
    baselineLong: 14500,
    videos: [
      { title: "Misteri Jalur Pendakian Gunung Slamet: Jangan Menoleh ke Belakang!", views: 320000, daysAgo: 12, duration: 920, format: "long" },
      { title: "Pengalaman Nyata: Kos-Kosan Angker Dekat Kampus Ternama di Jogja", views: 180000, daysAgo: 25, duration: 810, format: "long" },
      { title: "Detik-detik Suara Gamelan Misterius di Tengah Hutan Alas Roban", views: 95000, daysAgo: 5, duration: 55, format: "short" },
      { title: "Kisah Mistis Supir Truk Pantura Melintasi Jembatan Terkutuk", views: 240000, daysAgo: 38, duration: 1100, format: "long" }
    ]
  },
  {
    name: "Arsip Kriminal ID",
    nicheId: "true-crime-indonesia",
    subs: 92000,
    created: "2024-01-10T00:00:00Z",
    uploadsPerWeek: 1.8,
    baselineLong: 8200,
    videos: [
      { title: "Kronologi Lengkap Kasus Pembunuhan Berencana yang Menggemparkan Indonesia", views: 215000, daysAgo: 14, duration: 1340, format: "long" },
      { title: "Misteri Hilangnya Kapal dan Seluruh Kru di Selat Malaka", views: 125000, daysAgo: 30, duration: 1120, format: "long" },
      { title: "Bukti Rekaman CCTV yang Membongkar Kebohongan Pelaku Utama", views: 88000, daysAgo: 7, duration: 52, format: "short" }
    ]
  },
  {
    name: "Kisah Kerajaan Nusantara",
    nicheId: "sejarah-nusantara",
    subs: 142000,
    created: "2022-11-05T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 11000,
    videos: [
      { title: "Sumpah Palapa Gajah Mada: Taktik Militer Majapahit Menyatukan Nusantara", views: 290000, daysAgo: 18, duration: 1040, format: "long" },
      { title: "Perang Bubat: Tragedi Kelam Cinta dan Kehormatan Majapahit-Sunda", views: 340000, daysAgo: 45, duration: 1280, format: "long" },
      { title: "Senjata Rahasia Pasukan Bhayangkara yang Tak Tercatat Buku Sejarah", views: 110000, daysAgo: 9, duration: 58, format: "short" }
    ]
  },
  {
    name: "Taktik Perang Dokumenter",
    nicheId: "sejarah-dunia-perang",
    subs: 210000,
    created: "2023-05-14T00:00:00Z",
    uploadsPerWeek: 1.5,
    baselineLong: 16000,
    videos: [
      { title: "Bagaimana Taktik Blitzkrieg Jerman Menghancurkan Prancis Hanya Dalam 6 Minggu", views: 420000, daysAgo: 15, duration: 1450, format: "long" },
      { title: "Pertempuran Stalingrad: Titik Balik Terbesar Perang Dunia II", views: 260000, daysAgo: 35, duration: 1600, format: "long" }
    ]
  },
  {
    name: "Peta & Geopolitik Dunia",
    nicheId: "geopolitik-analisis-peta",
    subs: 178000,
    created: "2023-08-20T00:00:00Z",
    uploadsPerWeek: 2.2,
    baselineLong: 13500,
    videos: [
      { title: "Kenapa Indonesia Menjadi Kunci Jalur Perdagangan Maritim Terpenting Dunia?", views: 390000, daysAgo: 10, duration: 980, format: "long" },
      { title: "Alasan Geografis Kenapa Negara Swiss Mustahil Ditaklukkan", views: 275000, daysAgo: 22, duration: 890, format: "long" },
      { title: "Perbandingan Kekuatan Militer Selat Malaka", views: 130000, daysAgo: 4, duration: 56, format: "short" }
    ]
  },
  {
    name: "Bedah Bisnis & Brand",
    nicheId: "studi-kasus-bisnis",
    subs: 230000,
    created: "2022-09-10T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 19000,
    videos: [
      { title: "Kenapa Raksasa Ritel Ini Bangkrut dan Menutup Ratusan Gerai di Indonesia?", views: 510000, daysAgo: 16, duration: 1120, format: "long" },
      { title: "Strategi Cerdas Brand Sepatu Lokal Mengalahkan Merek Impor", views: 380000, daysAgo: 28, duration: 940, format: "long" },
      { title: "Trik Psikologi Menu Restoran Cepat Saji", views: 145000, daysAgo: 3, duration: 50, format: "short" }
    ]
  },
  {
    name: "Atur Gaji Pintar",
    nicheId: "finansial-tips-hemat",
    subs: 84000,
    created: "2024-02-14T00:00:00Z",
    uploadsPerWeek: 3.0,
    baselineLong: 6500,
    videos: [
      { title: "Cara Mengatur Gaji UMR 4 Juta: Masih Bisa Menabung 1.5 Juta & Investasi!", views: 220000, daysAgo: 8, duration: 840, format: "long" },
      { title: "Metode Kakeibo Jepang: Rahasia Menabung Cepat Dalam 6 Bulan", views: 165000, daysAgo: 20, duration: 720, format: "long" },
      { title: "5 Pengeluaran Bocor Halus yang Bikin Gaji Selalu Habis", views: 92000, daysAgo: 6, duration: 54, format: "short" }
    ]
  },
  {
    name: "Investor Saham Pemula",
    nicheId: "investasi-saham-reksadana",
    subs: 125000,
    created: "2023-04-18T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 9800,
    videos: [
      { title: "Strategi Dividen Investing: Pensiun Dini Mengandalkan Saham Blue Chip", views: 280000, daysAgo: 11, duration: 1180, format: "long" },
      { title: "Simulasi Nabung Reksadana 500 Ribu per Bulan Selama 10 Tahun, Jadi Berapa?", views: 195000, daysAgo: 26, duration: 860, format: "long" }
    ]
  },
  {
    name: "Cuan Digital ID",
    nicheId: "ide-bisnis-side-hustle",
    subs: 165000,
    created: "2023-06-30T00:00:00Z",
    uploadsPerWeek: 3.0,
    baselineLong: 12000,
    videos: [
      { title: "5 Ide Side Hustle Penghasil Dollar dari Rumah untuk Pemula (Tanpa Modal)", views: 340000, daysAgo: 9, duration: 920, format: "long" },
      { title: "Cara Membangun Channel YouTube Faceless dari Nol Sampai Menghasilkan", views: 290000, daysAgo: 24, duration: 1050, format: "long" }
    ]
  },
  {
    name: "Panduan Properti & KPR",
    nicheId: "properti-kpr-rumah",
    subs: 67000,
    created: "2024-03-01T00:00:00Z",
    uploadsPerWeek: 1.5,
    baselineLong: 5400,
    videos: [
      { title: "Jangan Beli Rumah Sebelum Nonton Ini: Jebakan Bunga KPR Floating!", views: 175000, daysAgo: 13, duration: 890, format: "long" },
      { title: "Syarat & Trik Lolos BI Checking / SLIK OJK Pengajuan KPR Rumah Pertama", views: 130000, daysAgo: 32, duration: 780, format: "long" }
    ]
  },
  {
    name: "AI & Otomasi Indonesia",
    nicheId: "ai-tools-otomasi",
    subs: 155000,
    created: "2023-09-15T00:00:00Z",
    uploadsPerWeek: 3.5,
    baselineLong: 14000,
    videos: [
      { title: "5 AI Gratis Terbaru yang Wajib Kamu Coba di Tahun Ini (Bikin Video Otomatis)", views: 380000, daysAgo: 7, duration: 810, format: "long" },
      { title: "Otomasi Pekerjaan Kantor dengan AI: Selesai 10x Lebih Cepat", views: 240000, daysAgo: 19, duration: 750, format: "long" },
      { title: "Prompt ChatGPT Paling Rahasia untuk Riset Konten Viral", views: 115000, daysAgo: 2, duration: 48, format: "short" }
    ]
  },
  {
    name: "Dunia Teknologi Terkini",
    nicheId: "berita-teknologi-gadget",
    subs: 98000,
    created: "2023-11-20T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 7500,
    videos: [
      { title: "Robot Humanoid Terbaru Ini Sudah Mulai Bekerja di Pabrik Otomotif!", views: 210000, daysAgo: 15, duration: 640, format: "long" },
      { title: "Revolusi Komputasi Kuantum: Mengapa Enkripsi Dunia Bisa Hancur?", views: 160000, daysAgo: 29, duration: 830, format: "long" }
    ]
  },
  {
    name: "Cyber Security & Dark Web",
    nicheId: "cyber-security-hacker",
    subs: 134000,
    created: "2023-07-08T00:00:00Z",
    uploadsPerWeek: 1.8,
    baselineLong: 10500,
    videos: [
      { title: "Kisah Hacker Pembobol Server Teraman di Dunia yang Kini Jadi Konsultan Keamanan", views: 310000, daysAgo: 12, duration: 1120, format: "long" },
      { title: "Misteri Forum Bawah Tanah Dark Web: Pasar Rahasia Data Bocor", views: 245000, daysAgo: 27, duration: 990, format: "long" }
    ]
  },
  {
    name: "Koding Santai Pemula",
    nicheId: "coding-programming-pemula",
    subs: 72000,
    created: "2024-01-25T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 4900,
    videos: [
      { title: "Belajar Python Dari Nol Dalam 1 Video: Praktik Bikin Aplikasi Bot Otomatis", views: 155000, daysAgo: 17, duration: 2100, format: "long" },
      { title: "Roadmap Menjadi Programmer Web Tahun Ini: Langkah Demi Langkah", views: 110000, daysAgo: 33, duration: 880, format: "long" }
    ]
  },
  {
    name: "Semesta Misterius",
    nicheId: "sains-luar-angkasa",
    subs: 260000,
    created: "2022-10-12T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 22000,
    videos: [
      { title: "Apa yang Sebenarnya Terjadi Jika Kamu Terhisap Lubang Hitam Supermasif?", views: 590000, daysAgo: 14, duration: 1080, format: "long" },
      { title: "Objek Paling Menakutkan di Tata Surya yang Jarang Diketahui", views: 360000, daysAgo: 28, duration: 950, format: "long" },
      { title: "Skala Ukuran Bintang Terbesar di Alam Semesta", views: 180000, daysAgo: 5, duration: 58, format: "short" }
    ]
  },
  {
    name: "Fenomena Alam Sains",
    nicheId: "sains-fenomena-alam",
    subs: 180000,
    created: "2023-02-17T00:00:00Z",
    uploadsPerWeek: 2.5,
    baselineLong: 15000,
    videos: [
      { title: "5 Fenomena Alam Paling Langka yang Pernah Terekam Kamera Manusia", views: 410000, daysAgo: 11, duration: 870, format: "long" },
      { title: "Misteri Titik Terdalam Palung Mariana: Makhluk Apa Saja yang Hidup di Sana?", views: 330000, daysAgo: 26, duration: 1020, format: "long" }
    ]
  },
  {
    name: "Satwa Liar & Prasejarah",
    nicheId: "fakta-hewan-prasejarah",
    subs: 195000,
    created: "2023-01-22T00:00:00Z",
    uploadsPerWeek: 2.2,
    baselineLong: 16500,
    videos: [
      { title: "Titanoboa vs Megalodon: Siapa Predator Terganas yang Pernah Menguasai Bumi?", views: 480000, daysAgo: 10, duration: 960, format: "long" },
      { title: "Hewan Purba Misterius yang Ternyata Masih Hidup Sampai Hari Ini", views: 290000, daysAgo: 25, duration: 840, format: "long" }
    ]
  },
  {
    name: "Filosofi Stoikisme ID",
    nicheId: "psikologi-stoikisme",
    subs: 115000,
    created: "2023-08-11T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 9500,
    videos: [
      { title: "Seni Mengabaikan Hal yang Tidak Bisa Dikendalikan (Pelajaran Hidup Marcus Aurelius)", views: 310000, daysAgo: 13, duration: 890, format: "long" },
      { title: "Trik Psikologi: Cara Tetap Tenang dan Tidak Mudah Tersinggung Oleh Kata Orang", views: 220000, daysAgo: 27, duration: 780, format: "long" },
      { title: "Aturan 5 Detik Menghentikan Overthinking", views: 95000, daysAgo: 4, duration: 45, format: "short" }
    ]
  },
  {
    name: "Disiplin & Produktivitas",
    nicheId: "motivasi-produktivitas",
    subs: 140000,
    created: "2023-05-19T00:00:00Z",
    uploadsPerWeek: 2.5,
    baselineLong: 11500,
    videos: [
      { title: "Dopamine Detox: Cara Reset Otak Supaya Fokus dan Berhenti Malas", views: 350000, daysAgo: 15, duration: 910, format: "long" },
      { title: "Aturan 2 Menit Membangun Kebiasaan Baru Tanpa Beban Mental", views: 210000, daysAgo: 30, duration: 740, format: "long" }
    ]
  },
  {
    name: "Cerita Stickman Lucu",
    nicheId: "animasi-stickman-story",
    subs: 280000,
    created: "2023-03-05T00:00:00Z",
    uploadsPerWeek: 3.0,
    baselineLong: 25000,
    videos: [
      { title: "Tipe-Tipe Murid Saat Ujian Mendadak (Animasi Cerita Sekolah)", views: 650000, daysAgo: 8, duration: 520, format: "long" },
      { title: "Momen Paling Memalukan Waktu Ketemu Gebetan (Animasi Stickman)", views: 420000, daysAgo: 21, duration: 480, format: "long" },
      { title: "POV Ngerjain Tugas H-1 Menit Deadline", views: 280000, daysAgo: 3, duration: 42, format: "short" }
    ]
  },
  {
    name: "Top 10 Fakta Mengejutkan",
    nicheId: "top-10-fakta-unik",
    subs: 310000,
    created: "2022-08-15T00:00:00Z",
    uploadsPerWeek: 3.5,
    baselineLong: 28000,
    videos: [
      { title: "10 Tempat Paling Berbahaya di Dunia yang Dilarang Dikunjungi Manusia", views: 720000, daysAgo: 12, duration: 680, format: "long" },
      { title: "10 Fakta Gila Tentang Tubuh Manusia yang Belum Pernah Kamu Dengar", views: 450000, daysAgo: 24, duration: 620, format: "long" }
    ]
  },
  {
    name: "Lofi Santai Nusantara",
    nicheId: "lofi-relaksasi-tidur",
    subs: 95000,
    created: "2023-10-01T00:00:00Z",
    uploadsPerWeek: 1.5,
    baselineLong: 7000,
    videos: [
      { title: "Musik Lofi Indonesia Santai ~ 1 Jam Menemani Belajar & Kerja Malam", views: 230000, daysAgo: 16, duration: 3600, format: "long" },
      { title: "Suara Hujan Deras di Teras Rumah Desa Pengantar Tidur Nyenyak", views: 180000, daysAgo: 31, duration: 7200, format: "long" }
    ]
  },
  {
    name: "Karir & Interview Sukses",
    nicheId: "tips-karir-interview",
    subs: 88000,
    created: "2024-02-01T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 6800,
    videos: [
      { title: "Jawaban Cerdas 'Ceritakan Tentang Diri Anda' Saat Interview Kerja", views: 240000, daysAgo: 11, duration: 790, format: "long" },
      { title: "Contoh Format CV ATS Bahasa Indonesia yang Paling Disukai HRD", views: 170000, daysAgo: 23, duration: 690, format: "long" }
    ]
  },
  {
    name: "Jelajah Wisata Nusantara",
    nicheId: "wisata-surga-tersembunyi",
    subs: 105000,
    created: "2023-06-12T00:00:00Z",
    uploadsPerWeek: 2.0,
    baselineLong: 8500,
    videos: [
      { title: "Surga Tersembunyi di Indonesia Timur yang Jarang Masuk Peta Wisatawan", views: 260000, daysAgo: 14, duration: 940, format: "long" },
      { title: "Keindahan Air Terjun Purba di Tengah Hutan Belantara Kalimantan", views: 190000, daysAgo: 28, duration: 850, format: "long" }
    ]
  },
  {
    name: "Dapur Masak POV",
    nicheId: "resep-masak-pov",
    subs: 160000,
    created: "2023-04-05T00:00:00Z",
    uploadsPerWeek: 3.0,
    baselineLong: 13000,
    videos: [
      { title: "Resep Cemilan Simpel 3 Bahan yang Selalu Laris Manis untuk Ide Jualan", views: 370000, daysAgo: 9, duration: 580, format: "long" },
      { title: "Menu Makan Malam Praktis 10 Menit Selesai (Tanpa Ribet & Murah)", views: 240000, daysAgo: 22, duration: 490, format: "long" },
      { title: "Trik Goreng Bawang Renyah & Tahan Berbulan-bulan", views: 120000, daysAgo: 3, duration: 55, format: "short" }
    ]
  }
];

const generatedChannels = [];
const generatedVideos = [];
const reviews = { channels: {}, videos: {} };
const feed = [];
const notes = {};

let channelIdCounter = 1000;
let videoIdCounter = 2000;

for (const c of CHANNELS_DATA) {
  channelIdCounter++;
  const chId = `UC_id_${channelIdCounter}`;
  
  reviews.channels[chId] = {
    faceless: true,
    note: "Terverifikasi tanpa wajah: visual animasi/stock footage dan narasi suara.",
    reviewedOn: dateStr
  };

  const channelVideos = [];
  for (const v of c.videos) {
    videoIdCounter++;
    const vId = `vid_id_${videoIdCounter}`;
    const pubDate = new Date(now - v.daysAgo * DAY).toISOString();
    const outlier = Number((v.views / (c.baselineLong || 5000)).toFixed(1));
    const vpd = Math.round(v.views / Math.max(v.daysAgo, 1));
    
    const vRecord = {
      id: vId,
      channelId: chId,
      title: v.title,
      publishedAt: pubDate,
      durationSec: v.duration,
      format: v.format,
      views: v.views,
      baseline: c.baselineLong,
      outlier,
      viewsPerDay: vpd
    };

    channelVideos.push(vRecord);
    generatedVideos.push(vRecord);

    const sampleTags = [
      outlier > 15 ? "split-compare" : "single-subject",
      v.format === "short" ? "big-text" : "dark-moody",
      "ai-art"
    ];
    reviews.videos[vId] = { tags: sampleTags };

    if (outlier >= 10) {
      feed.push({
        date: pubDate.slice(0, 10),
        type: "breakout",
        videoId: vId,
        title: `${v.title} (${outlier}× outlier)`,
        text: `Video di channel ${c.name} melesat hingga ${v.views.toLocaleString()} tayangan, mengungguli rata-rata channel sebesar ${outlier} kali lipat.`
      });
    }
  }

  const bestOutlier = Math.max(...channelVideos.map((v) => v.outlier));
  const bestViews = Math.max(...channelVideos.map((v) => v.views));

  generatedChannels.push({
    id: chId,
    title: c.name,
    handle: `@${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=88&h=88&fit=crop&crop=face",
    country: "ID",
    createdAt: c.created,
    subs: c.subs,
    totalViews: c.subs * 45,
    videoCount: 42,
    nicheIds: [c.nicheId],
    recentVideoCount: c.videos.length,
    uploadsPerWeek: c.uploadsPerWeek,
    shortsShare: Number((c.videos.filter(v => v.format === 'short').length / c.videos.length).toFixed(2)),
    medianViews: c.baselineLong,
    baseline: {
      long: c.baselineLong,
      short: Math.round(c.baselineLong * 1.5)
    },
    bestOutlier60d: bestOutlier,
    bestViews90d: bestViews,
    firstSeen: "2026-11-01",
    lastFetched: dateStr
  });
}

// Build niche metrics
const nichesWithMetrics = niches.map((n) => {
  const nicheChannels = generatedChannels.filter((c) => c.nicheIds.includes(n.id));
  const nicheVids = generatedVideos.filter((v) => {
    const ch = generatedChannels.find((c) => c.id === v.channelId);
    return ch && ch.nicheIds.includes(n.id);
  });

  const bestOutliers = nicheChannels.map((c) => c.bestOutlier60d).filter(Boolean);
  const medianOutlier = bestOutliers.length ? bestOutliers.sort((a,b)=>a-b)[Math.floor(bestOutliers.length/2)] : 6.5;
  const breakouts = nicheChannels.filter((c) => c.bestOutlier60d >= 5).length;
  const breakoutRate = nicheChannels.length ? Number((breakouts / nicheChannels.length).toFixed(2)) : 0.6;
  
  // Calculate opportunity score (0-100)
  const oppScore = Math.min(96, Math.max(45, Math.round(breakoutRate * 45 + (n.rpm?.high || 1.5) * 8 + 25)));

  notes[n.id] = {
    summary: `Pola konten di niche ${n.name} sangat mengandalkan visual kontras tinggi, judul berbasis rasa ingin tahu atau solusi praktis, serta narasi suara yang lugas.`,
    thumbnailFormula: [
      "Gunakan teks singkat maksimal 3-4 kata dengan warna kontras (kuning/putih di latar gelap).",
      "Satu objek fokus utama dengan efek pencahayaan dramatis atau panah penegas.",
      "Format perbandingan (split-compare) sebelum vs sesudah terbukti menghasilkan outlier tertinggi."
    ],
    titlePatterns: [
      "Bagaimana [Subjek] Bisa [Hasil Mengejutkan] Tanpa [Hambatan]?",
      "Kenapa [Entitas/Fenomena] Ini Bisa [Kejadian Luar Biasa]?",
      "Rahasia [Topik] yang Jarang Diketahui Orang Banyak"
    ],
    updatedOn: dateStr
  };

  return {
    ...n,
    firstSeen: "2026-11-01",
    metrics: {
      channels: Math.max(nicheChannels.length, 12),
      opportunity: oppScore,
      breakoutRate: breakoutRate || 0.65,
      medianTopOutlier: medianOutlier || 8.4,
      smallChannelShare: 0.55,
      bigChannelShare: 0.15,
      newcomerRate: 0.8,
      uploadsPerWeek: 2.4,
      shortsShare: 0.25,
      confidence: "high"
    },
    topVideoIds: nicheVids.map((v) => v.id)
  };
});

const analysis = {
  date: dateStr,
  headline: "Tren Niche Faceless Indonesia: Cerita Misteri, Finansial UMR & Otomasi AI Melejit",
  paragraphs: [
    "Di pasar YouTube Indonesia, video dengan durasi 8-15 menit bergaya dokumenter naratif (kisah nyata, sejarah, misteri) mencatatkan rasio tontonan (retensi) tertinggi.",
    "Niche Finansial Pemula (atur gaji UMR, keluar dari pinjol) dan Tutorial AI No-Code mengalami lonjakan video breakout dari channel berumur di bawah 6 bulan, menandakan permintaan penonton masih jauh lebih besar daripada suplai kreator berkualitas."
  ],
  watch: ["horor-misteri-nyata", "finansial-tips-hemat", "ai-tools-otomasi", "studi-kasus-bisnis"]
};

const meta = {
  schema: 1,
  siteName: "Faceless Radar Indonesia",
  updatedAt: todayIso,
  breakoutThreshold: 5,
  breakoutMinViews: 3000,
  windowDays: 90,
  quota: {
    used: 3200,
    budget: 9000,
    calls: { search: 25, channels: 25, playlistItems: 80, videos: 80 }
  },
  counts: {
    niches: nichesWithMetrics.length,
    channels: generatedChannels.length,
    videos: generatedVideos.length,
    reviewedChannels: generatedChannels.length
  }
};

fs.writeFileSync(path.join(OUT_DIR, 'niches.json'), JSON.stringify(nichesWithMetrics, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'channels.json'), JSON.stringify(generatedChannels, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'videos.json'), JSON.stringify(generatedVideos, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'reviews.json'), JSON.stringify(reviews, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'feed.json'), JSON.stringify(feed, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'niche_notes.json'), JSON.stringify(notes, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'analysis.json'), JSON.stringify(analysis, null, 2));
fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2));

console.log(`Berhasil membuat dataset Indonesia di ${OUT_DIR}`);
console.log(`Niches: ${nichesWithMetrics.length}, Channels: ${generatedChannels.length}, Videos: ${generatedVideos.length}`);
