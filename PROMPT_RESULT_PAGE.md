# 🔍 PROMPT 2 — Halaman Hasil Analisis (ResultPage)

> **Cara pakai:** Kerjakan prompt ini setelah `PROMPT_DASHBOARD.md` selesai.  
> Copy seluruh isi prompt ini, paste ke Claude AI / ChatGPT / Cursor / Windsurf.

---

## 📋 KONTEKS

Kamu sedang melanjutkan development **FakeShield** frontend. Dashboard sudah selesai. Sekarang kita akan membangun halaman **Hasil Analisis** (`src/pages/ResultPage.jsx`).

Halaman ini tampil setelah user submit artikel dari Dashboard. URL-nya: `/result/:id` di mana `:id` adalah ID hasil analisis yang dikembalikan API setelah POST /api/checks.

---

## 🎯 TUJUAN HALAMAN RESULT PAGE

Halaman ini menampilkan hasil analisis **secara detail dan visual** kepada user. Ini adalah halaman paling penting dari sisi UX karena di sinilah user mendapat "jawaban" apakah berita yang mereka cek adalah hoaks atau tidak.

Informasi yang ditampilkan:
1. **Kategori hasil** berdasarkan confidence score (bukan sekadar "Hoaks" atau "Valid")
2. **Confidence bar** animasi yang menunjukkan seberapa yakin model AI
3. **Kata-kata mencurigakan** yang terdeteksi model
4. **Distribusi kategori publik** (pie chart)
5. **Disclaimer** dan panduan verifikasi mandiri

---

## 📊 SISTEM KATEGORI (INTI HALAMAN INI)

Ini adalah logika paling penting. Ubah `confidence` (nilai float 0-1) menjadi kategori:

```js
// src/utils/helpers.js — tambahkan fungsi ini jika belum ada

export const getCategory = (confidence) => {
  if (confidence >= 0.90) {
    return {
      label: 'Sangat Terindikasi Hoaks',
      emoji: '🔴',
      description: 'Artikel ini memiliki karakteristik hoaks yang sangat kuat berdasarkan analisis AI.',
      colorClass: 'text-red-600',
      bgClass: 'bg-red-600',
      bgLightClass: 'bg-red-50',
      borderClass: 'border-red-600',
      badgeClass: 'bg-red-100 text-red-800',
      recommendation: 'Sangat disarankan untuk TIDAK menyebarkan konten ini. Laporkan ke Kominfo atau Mafindo.',
    };
  } else if (confidence >= 0.70) {
    return {
      label: 'Terindikasi Hoaks',
      emoji: '🟠',
      description: 'Artikel ini memiliki beberapa indikasi hoaks yang perlu diwaspadai.',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-600',
      bgLightClass: 'bg-orange-50',
      borderClass: 'border-orange-500',
      badgeClass: 'bg-orange-100 text-orange-800',
      recommendation: 'Verifikasi ke sumber terpercaya sebelum menyebarkan konten ini.',
    };
  } else if (confidence >= 0.50) {
    return {
      label: 'Perlu Verifikasi',
      emoji: '🟡',
      description: 'Artikel ini memiliki beberapa elemen yang meragukan dan perlu dicek lebih lanjut.',
      colorClass: 'text-yellow-600',
      bgClass: 'bg-yellow-500',
      bgLightClass: 'bg-yellow-50',
      borderClass: 'border-yellow-500',
      badgeClass: 'bg-yellow-100 text-yellow-800',
      recommendation: 'Periksa ke situs fact-checker seperti Cek Fakta Kompas atau Tempo Cek Fakta.',
    };
  } else {
    return {
      label: 'Kemungkinan Valid',
      emoji: '🟢',
      description: 'Artikel ini tampak tidak mengandung karakteristik hoaks yang signifikan.',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-600',
      bgLightClass: 'bg-green-50',
      borderClass: 'border-green-500',
      badgeClass: 'bg-green-100 text-green-800',
      recommendation: 'Tetap bijak dalam berbagi informasi. Selalu cek sumber sebelum menyebarkan.',
    };
  }
};
```

---

## 🏗️ LANGKAH 1 — Fetch Data di ResultPage

Buatkan `src/pages/ResultPage.jsx` yang:

1. Ambil `:id` dari URL params menggunakan `useParams()`
2. Fetch data hasil analisis dari `GET /api/checks/:id`
3. Fetch data distribusi kategori dari `GET /api/categories` (untuk pie chart)
4. Panggil keduanya secara **paralel** dengan `Promise.all`

**API yang dipanggil:**

```
GET /api/checks/:id
  Header:  Authorization: Bearer <token> (jika ada)
  Success: {
    id: string,
    text: string,              // teks artikel asli yang dicek
    label: "HOAX" | "VALID",
    confidence: float,         // 0.0 - 1.0
    suspiciousWords: string[], // kata-kata yang terdeteksi mencurigakan
    createdAt: string          // ISO timestamp
  }
  Error 404: { message: "Data tidak ditemukan" }
  Error 403: { message: "Tidak punya akses" }

GET /api/categories
  Header:  Authorization: Bearer <token> (opsional)
  Success: [
    { name: "Sangat Terindikasi Hoaks", count: 45 },
    { name: "Terindikasi Hoaks", count: 30 },
    { name: "Perlu Verifikasi", count: 15 },
    { name: "Kemungkinan Valid", count: 10 }
  ]
```

---

## 🏗️ LANGKAH 2 — Layout Halaman ResultPage

```
<Navbar />

<main className="max-w-4xl mx-auto px-4 py-8">
  
  {/* Tombol kembali */}
  <button onClick={() => navigate(-1)}>← Kembali ke Dashboard</button>

  {/* SECTION A: Hero Result Card */}
  <ResultHeroCard result={result} />

  {/* SECTION B: Detail Analysis */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    
    {/* Kiri: Suspicious Words */}
    <SuspiciousWordsCard words={result.suspiciousWords} />
    
    {/* Kanan: Distribusi Kategori Pie Chart */}
    <CategoryDistributionCard categories={categoriesData} currentCategory={category} />
    
  </div>

  {/* SECTION C: Teks Artikel yang Dicek */}
  <ArticleTextCard text={result.text} suspiciousWords={result.suspiciousWords} />

  {/* SECTION D: Rekomendasi & Disclaimer */}
  <RecommendationCard category={category} />

  {/* SECTION E: CTA */}
  <CTASection />

</main>
```

---

## 🏗️ LANGKAH 3 — Komponen ResultCard (Hero)

Ini adalah card utama yang pertama dilihat user. Buatkan sebagai bagian dari `ResultPage.jsx` atau komponen terpisah `src/components/ResultCard.jsx`:

**Design:**
```
┌─────────────────────────────────────────────────────┐
│  [BADGE BESAR]                                      │
│  🔴 SANGAT TERINDIKASI HOAKS                        │
│                                                     │
│  Keyakinan Model AI                          91%    │
│  ████████████████████████████████████░░░░░  ▓▓▓▓▓  │
│                                                     │
│  "Artikel ini memiliki karakteristik hoaks          │
│   yang sangat kuat berdasarkan analisis AI."        │
│                                                     │
│  Dianalisis: 28 Apr 2026, 10:30                     │
└─────────────────────────────────────────────────────┘
```

**Spesifikasi:**
- Border kiri tebal 4px dengan warna sesuai kategori (`border-l-4`)
- Background ringan sesuai kategori (`bgLightClass`)
- Badge besar di atas: emoji + label, background sesuai `bgClass`
- ConfidenceBar dengan animasi dari 0% ke nilai aktual

### Komponen ConfidenceBar

Buatkan `src/components/ConfidenceBar.jsx`:

```jsx
// Props: value (0-100), colorClass (string Tailwind)
// Contoh: <ConfidenceBar value={91} colorClass="bg-red-600" />

function ConfidenceBar({ value, colorClass }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Keyakinan Model AI</span>
        <span className="text-lg font-bold text-gray-800">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full animate-bar-fill ${colorClass}`}
          style={{ '--bar-width': `${value}%`, width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

---

## 🏗️ LANGKAH 4 — Suspicious Words Card

Card yang menampilkan kata-kata yang terdeteksi mencurigakan oleh model AI:

```
┌─────────────────────────────────┐
│ 🔍 Kata-kata Terdeteksi         │
├─────────────────────────────────┤
│ [kata1] [kata2] [virus] [hoaks] │
│ [klaim] [terbukti palsu]        │
│                                 │
│ ℹ️ Kata-kata ini sering muncul   │
│    di berita hoaks menurut      │
│    analisis model AI.           │
└─────────────────────────────────┘
```

**Spesifikasi:**
- Setiap kata ditampilkan sebagai chip/badge: `bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium`
- Jika `suspiciousWords` kosong: tampilkan "Tidak ada kata mencurigakan terdeteksi" dengan ikon ✅
- Tampilkan maksimal 20 kata, jika lebih: tombol "Lihat semua"

---

## 🏗️ LANGKAH 5 — Category Distribution Chart

Pie chart yang menunjukkan distribusi semua analisis di platform:

```jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'Sangat Terindikasi Hoaks': '#DC2626',
  'Terindikasi Hoaks': '#EA580C',
  'Perlu Verifikasi': '#D97706',
  'Kemungkinan Valid': '#16A34A',
};

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-gray-600">{payload[0].value} artikel</p>
      </div>
    );
  }
  return null;
};

// Di dalam komponen:
<div className="bg-white rounded-xl p-6 border border-gray-100">
  <h3 className="font-semibold text-gray-800 mb-1">📊 Distribusi Kategori</h3>
  <p className="text-xs text-gray-400 mb-4">Berdasarkan semua analisis di platform</p>
  
  {/* Highlight kategori saat ini */}
  <div className={`rounded-lg p-3 mb-4 ${category.bgLightClass}`}>
    <p className="text-sm">
      {category.emoji} Hasil kamu masuk kategori <strong>{category.label}</strong>
    </p>
  </div>

  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie data={categoriesData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" nameKey="name">
        {categoriesData.map((entry) => (
          <Cell key={entry.name} fill={COLORS[entry.name] || '#94A3B8'} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" iconSize={10} />
    </PieChart>
  </ResponsiveContainer>
</div>
```

---

## 🏗️ LANGKAH 6 — Article Text Card (dengan Highlight)

Tampilkan teks artikel asli dengan kata-kata mencurigakan di-highlight:

```jsx
function ArticleTextCard({ text, suspiciousWords }) {
  // Fungsi untuk highlight suspicious words dalam teks
  const highlightText = (text, words) => {
    if (!words || words.length === 0) return text;
    
    const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (words.some(w => w.toLowerCase() === part.toLowerCase())) {
        return (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const [showFull, setShowFull] = useState(false);
  const isLong = text.length > 500;
  const displayText = isLong && !showFull ? text.slice(0, 500) + '...' : text;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 mt-6">
      <h3 className="font-semibold text-gray-800 mb-4">📄 Teks yang Dianalisis</h3>
      <div className="text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-lg p-4">
        {highlightText(displayText, suspiciousWords)}
      </div>
      {isLong && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          {showFull ? 'Tampilkan lebih sedikit ↑' : 'Tampilkan teks lengkap ↓'}
        </button>
      )}
    </div>
  );
}
```

---

## 🏗️ LANGKAH 7 — Recommendation Card

Card berisi rekomendasi tindakan berdasarkan kategori dan link ke fact-checker:

```
┌─────────────────────────────────────────────────────┐
│ 💡 Apa yang Harus Dilakukan?                        │
├─────────────────────────────────────────────────────┤
│ [Pesan rekomendasi dari getCategory()]              │
│                                                     │
│ 🔗 Verifikasi ke sumber terpercaya:                 │
│ • Cek Fakta Kompas → cekfakta.kompas.com            │
│ • Tempo Cek Fakta → cekfakta.tempo.co               │
│ • Mafindo → mafindo.or.id                           │
│ • Kominfo → s.id/aduankonten                        │
│                                                     │
│ ⚠️ Disclaimer: Hasil ini adalah prediksi model AI   │
│ dan tidak menjamin keakuratan 100%. Selalu          │
│ verifikasi secara mandiri.                          │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ LANGKAH 8 — CTA Section (di bagian bawah)

```
┌─────────────────────────────────────────────────────┐
│          Ingin cek berita lainnya?                  │
│                                                     │
│   [← Cek Artikel Lain]    [Lihat History Saya →]   │
└─────────────────────────────────────────────────────┘
```

- "Cek Artikel Lain": navigate ke `/` (kembali ke Dashboard)
- "Lihat History Saya": hanya tampil jika user sudah login, navigate ke `/` dan scroll ke section Recent Activity

---

## 🏗️ LANGKAH 9 — Loading & Error States ResultPage

**Loading State:**
```jsx
// Tampil saat fetch data
<div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
  <div className="h-8 w-48 bg-gray-200 rounded mb-6" />           {/* back button */}
  <div className="bg-white rounded-xl p-8 border">
    <div className="h-10 w-64 bg-gray-200 rounded mb-4" />         {/* badge */}
    <div className="h-6 w-full bg-gray-200 rounded mb-2" />        {/* bar */}
    <div className="h-4 w-3/4 bg-gray-200 rounded" />              {/* description */}
  </div>
  <div className="grid grid-cols-2 gap-6 mt-6">
    <div className="bg-white rounded-xl p-6 border h-64 bg-gray-100" />
    <div className="bg-white rounded-xl p-6 border h-64 bg-gray-100" />
  </div>
</div>
```

**Error State (404 - tidak ditemukan):**
```jsx
<div className="text-center py-20">
  <p className="text-6xl mb-4">🔍</p>
  <h2 className="text-xl font-bold text-gray-800 mb-2">Hasil Tidak Ditemukan</h2>
  <p className="text-gray-500 mb-6">Data analisis ini tidak tersedia atau sudah dihapus.</p>
  <button onClick={() => navigate('/')} className="btn-primary">
    Kembali ke Dashboard
  </button>
</div>
```

---

## 📱 Responsif Requirements ResultPage

| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column, semua card stack |
| Desktop | 2 kolom untuk Suspicious Words + Pie Chart |

---

## 🎨 Visual Summary Semua State

```
confidence = 0.95 → 🔴 border-red-600, bg-red-50, badge merah
confidence = 0.75 → 🟠 border-orange-500, bg-orange-50, badge oranye  
confidence = 0.60 → 🟡 border-yellow-500, bg-yellow-50, badge kuning
confidence = 0.30 → 🟢 border-green-500, bg-green-50, badge hijau
```

---

## ✅ Checklist ResultPage

- [ ] Fetch data dengan `GET /api/checks/:id` berhasil
- [ ] Fetch `GET /api/categories` berhasil
- [ ] Kategori ditampilkan berdasarkan confidence score (bukan sekadar HOAX/VALID)
- [ ] ConfidenceBar animasi berjalan smooth
- [ ] Suspicious words di-highlight di teks artikel
- [ ] Pie chart distribusi kategori tampil
- [ ] Rekomendasi dan link fact-checker tampil
- [ ] Tombol "Cek Artikel Lain" kembali ke Dashboard
- [ ] Loading skeleton tampil saat fetch
- [ ] Error state tampil jika data tidak ditemukan
- [ ] Responsif di mobile

---

## 🔗 Lanjutkan ke

Setelah ResultPage selesai, kerjakan **`PROMPT_AUTH.md`** untuk halaman Login & Register.
