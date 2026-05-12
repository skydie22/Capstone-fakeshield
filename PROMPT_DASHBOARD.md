## 📋 KONTEKS PROYEK

Kamu adalah senior frontend developer yang membantu saya membangun halaman **Dashboard** untuk aplikasi **FakeShield** — platform deteksi berita hoaks berbahasa Indonesia berbasis AI.

Tech stack yang digunakan:
- **React 18 + Vite**
- **Tailwind CSS v3**
- **Axios** untuk HTTP calls
- **Recharts** untuk visualisasi data
- **React Router DOM v6**
- **React Context API** untuk auth state

---

## 🎯 TUJUAN HALAMAN DASHBOARD

Halaman Dashboard (`src/pages/Dashboard.jsx`) adalah **halaman utama** aplikasi. Ini yang pertama dilihat user saat membuka FakeShield. Di halaman ini terdapat:

1. **Header** — judul aplikasi + info user
2. **Form Input Artikel** — user memasukkan teks berita untuk dianalisis
3. **Summary Cards** — 3 box statistik ringkasan
4. **Charts Section** — tren hoaks + distribusi kategori
5. **Recent Activity** — riwayat cek terbaru user

---

## 🏗️ LANGKAH 1 — Setup Awal Project

Buatkan saya setup lengkap project React + Vite + Tailwind:

```bash
# Jalankan perintah ini satu per satu
npm create vite@latest fakeshield-frontend -- --template react
cd fakeshield-frontend
npm install
npm install react-router-dom@6 axios recharts
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Setelah itu, buatkan file-file konfigurasi berikut:

### `tailwind.config.js`
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A5F',
          cyan: '#00B4D8',
        },
        category: {
          'sangat-hoaks': '#DC2626',
          'hoaks': '#EA580C',
          'verifikasi': '#D97706',
          'valid': '#16A34A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'bar-fill': 'barFill 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 1.5s ease-in-out infinite',
      },
      keyframes: {
        barFill: {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' }
        },
      },
    },
  },
  plugins: [],
}
```

### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}
```

### Struktur folder yang harus dibuat:
```
src/
├── api/
│   └── axios.js
├── components/
│   ├── CheckForm.jsx
│   ├── ResultCard.jsx
│   ├── ConfidenceBar.jsx
│   ├── StatCard.jsx
│   └── Navbar.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useChecks.js
├── pages/
│   ├── Dashboard.jsx
│   ├── ResultPage.jsx
│   └── Auth.jsx
├── utils/
│   └── helpers.js
├── App.jsx
└── main.jsx
```

---

## 🏗️ LANGKAH 2 — File Konfigurasi Axios

Buatkan `src/api/axios.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: otomatis attach JWT token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🏗️ LANGKAH 3 — AuthContext (Global State)

Buatkan `src/context/AuthContext.jsx`:

**Requirements:**
- Gunakan React Context API + useReducer
- State yang dikelola: `{ user, token, isLoading, isAuthenticated }`
- Saat komponen mount, cek `localStorage` untuk token yang tersimpan
- Jika token ada, call `GET /api/auth/me` untuk validasi dan populate user state
- Expose: `user`, `isAuthenticated`, `isLoading`, `login(email, password)`, `logout()`

**Detail fungsi `login()`:**
- Call `POST /api/auth/login` dengan body `{ email, password }`
- Jika sukses: simpan token ke localStorage, update state
- Jika gagal: throw error dengan message dari response API

**Detail fungsi `logout()`:**
- Hapus `fs_token` dan `fs_user` dari localStorage
- Reset state ke initial (user: null, isAuthenticated: false)
- Redirect ke `/`

**Endpoint yang dipanggil:**
```
POST /api/auth/login
  Body:    { email: string, password: string }
  Success: { token: string, user: { id, name, email, created_at } }
  Error:   { message: "Email atau password salah" }

GET /api/auth/me
  Header:  Authorization: Bearer <token>
  Success: { id, name, email, created_at }
  Error 401: auto logout
```

Buatkan juga custom hook `src/hooks/useAuth.js`:
```js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 🏗️ LANGKAH 4 — Utility Functions

Buatkan `src/utils/helpers.js` dengan fungsi-fungsi berikut:

```js
// Format tanggal: "28 Apr 2026, 10:30"
export const formatDate = (isoString) => { ... }

// Potong teks panjang: "Ini adalah teks yang sangat pan..."
export const truncateText = (text, maxLength = 100) => { ... }

// Konversi confidence score ke kategori
// 0.90-1.00 → { label: "Sangat Terindikasi Hoaks", color: "red", emoji: "🔴", bgClass: "bg-red-600" }
// 0.70-0.89 → { label: "Terindikasi Hoaks", color: "orange", emoji: "🟠", bgClass: "bg-orange-600" }
// 0.50-0.69 → { label: "Perlu Verifikasi", color: "yellow", emoji: "🟡", bgClass: "bg-yellow-500" }
// 0.00-0.49 → { label: "Kemungkinan Valid", color: "green", emoji: "🟢", bgClass: "bg-green-600" }
export const getCategory = (confidence) => { ... }

// Format angka: 10234 → "10.234"
export const formatNumber = (num) => { ... }

// Hitung "berapa lama yang lalu": "2 jam lalu", "3 hari lalu"
export const timeAgo = (isoString) => { ... }
```

---

## 🏗️ LANGKAH 5 — Routing di App.jsx

Buatkan `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ResultPage from './pages/ResultPage';
import Auth from './pages/Auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## 🏗️ LANGKAH 6 — Komponen Navbar

Buatkan `src/components/Navbar.jsx`:

**Design:**
- Background: `bg-[#1E3A5F]` (navy)
- Fixed di atas, full width, z-index tinggi
- Tinggi: `h-16`

**Struktur:**
```
[🛡️ FakeShield]                    [Dashboard] [History] [Login/Daftar]
                                                           atau
                                                      [👤 Nama User ▼]
```

**Behavior:**
- Gunakan `useAuth()` untuk cek status login
- Jika **belum login**: tampilkan tombol "Masuk" (outline putih) + "Daftar" (bg cyan)
- Jika **sudah login**: tampilkan avatar (inisial nama) + nama user + dropdown (Logout)
- Mobile: hamburger menu dengan slide-down menu
- Gunakan `<NavLink>` dari react-router-dom, active link diberi underline cyan

---

## 🏗️ LANGKAH 7 — Komponen StatCard

Buatkan `src/components/StatCard.jsx`:

**Props:** `{ title, value, icon, colorClass, subtitle }`

**Design:**
```
┌─────────────────────────────┐
│  [icon]   NILAI BESAR        │
│           Title             │
│           subtitle kecil    │
└─────────────────────────────┘
```

- Card: `bg-white rounded-xl shadow-sm p-6 border border-gray-100`
- Icon: circle `w-12 h-12 rounded-full flex items-center justify-center text-2xl`
- Value: `text-3xl font-bold text-gray-800`
- Title: `text-sm text-gray-500`
- Subtitle: `text-xs text-gray-400`

---

## 🏗️ LANGKAH 8 — Komponen CheckForm

Buatkan `src/components/CheckForm.jsx`:

**Props:** `{ onResult(resultId), onLoading(bool) }`

**State:** `text`, `charCount`, `isSubmitting`, `error`

**Design:**
```
┌─────────────────────────────────────────────────┐
│  Textarea besar (min 140px)                     │
│  placeholder: "Tempel judul atau isi berita..."  │
│                                    0 / 2000     │
└─────────────────────────────────────────────────┘
│ 💡 Tips: Tempel minimal 20 kata untuk hasil...  │  ← hanya muncul jika charCount < 20
[              Analisis Sekarang →               ]  ← tombol full width
```

**Logic submit:**
1. Validasi: teks minimal 10 karakter
2. Call `POST /api/checks` dengan body `{ text }`
3. Jika user **belum login**: request tetap dikirim tanpa Authorization header (backend support anonymous via `optionalJWT` middleware)
4. Jika user **sudah login**: request dikirim dengan Authorization header (otomatis via Axios interceptor)
5. Saat loading: tombol disabled + spinner + "Menganalisis..."
6. Jika sukses: panggil `onResult(response.data.id)` → navigate ke `/result/:id`
7. Jika error: tampilkan pesan error di bawah form

**API yang dipanggil:**
```
POST /api/checks
  Body:    { text: string }
  Success 201: { id: string, label: "HOAX"|"VALID", confidence: float, suspiciousWords: string[], createdAt: string }
  Error 400: { message: "Teks terlalu pendek" }
```

**Penting:** Setelah sukses, navigate ke `/result/{id}` menggunakan `useNavigate()` dari React Router.

---

## 🏗️ LANGKAH 9 — Halaman Dashboard Utama

Buatkan `src/pages/Dashboard.jsx` dengan **4 section utama**:

### Section A — Header
```jsx
<header className="bg-white border-b border-gray-200 px-6 py-4">
  <h1>🛡️ FakeShield</h1>
  <p>Deteksi berita hoaks berbahasa Indonesia dengan AI</p>
  // Jika login: "Selamat datang, [Nama]!"
  // Jika tidak login: "Login untuk menyimpan riwayat pemeriksaan"
</header>
```

### Section B — Form Input + Summary Cards
Layout 2 kolom (pada desktop):
- **Kiri (60%):** CheckForm component
- **Kanan (40%):** 3 StatCards

**Data untuk 3 StatCards** diambil dari `GET /api/stats`:
```
Response: {
  totalChecks: number,    → StatCard "Total Artikel Dianalisis"  📄
  totalHoax: number,      → StatCard "Hoaks Terdeteksi"         ⚠️
  accuracy: number        → StatCard "Akurasi Model AI"          🎯
}
```
- Fetch saat komponen mount
- Jika fetch gagal: tampilkan `—` sebagai placeholder

### Section C — Charts (hanya tampil jika user sudah login)
Layout 2 kolom (desktop), stack (mobile):

**Chart Kiri — Area/Line Chart "Tren Berita 7 Hari Terakhir"**
```
Data dari: GET /api/trends
Response: [
  { date: "2026-04-22", hoaxCount: 12, validCount: 34 },
  { date: "2026-04-23", hoaxCount: 18, validCount: 28 },
  ...7 items total, urut dari terlama ke terbaru
]
```

Gunakan Recharts `<AreaChart>`:
```jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

<ResponsiveContainer width="100%" height={250}>
  <AreaChart data={trendsData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
    <XAxis dataKey="date" tickFormatter={(d) => formatDateShort(d)} />
    <YAxis />
    <Tooltip />
    <Legend />
    <Area type="monotone" dataKey="hoaxCount" name="Hoaks" stroke="#DC2626" fill="#FEE2E2" />
    <Area type="monotone" dataKey="validCount" name="Valid" stroke="#16A34A" fill="#DCFCE7" />
  </AreaChart>
</ResponsiveContainer>
```

**Chart Kanan — Pie/Donut Chart "Distribusi Kategori"**
```
Data dari: GET /api/categories
Response: [
  { name: "Sangat Terindikasi Hoaks", count: 45 },
  { name: "Terindikasi Hoaks", count: 30 },
  { name: "Perlu Verifikasi", count: 15 },
  { name: "Kemungkinan Valid", count: 10 }
]
```

Gunakan Recharts `<PieChart>`:
```jsx
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#DC2626', '#EA580C', '#D97706', '#16A34A'];

<PieChart width={300} height={250}>
  <Pie data={categoriesData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="count">
    {categoriesData.map((entry, index) => (
      <Cell key={index} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(value, name) => [value + ' artikel', name]} />
  <Legend />
</PieChart>
```

**Jika user belum login:** Tampilkan placeholder card dengan pesan:
```
🔒 Login untuk melihat tren dan distribusi kategori hoaks
[Masuk Sekarang]
```

### Section D — Recent Activity (hanya tampil jika user sudah login)
```
Data dari: GET /api/checks/history?limit=5
Response: {
  data: [
    { id, text, label, confidence, createdAt },
    ...
  ]
}
```

Tampilkan sebagai list/tabel dengan kolom:
| Status | Cuplikan Teks | Confidence | Waktu | Aksi |
|--------|---------------|------------|-------|------|
| 🔴 Badge | "Teks artikel dipot..." | 91% | "2 jam lalu" | [Lihat] |

- Badge status: gunakan fungsi `getCategory(confidence)` dari helpers.js
- Tombol "Lihat": navigate ke `/result/:id`
- Jika belum ada history: tampilkan empty state "Belum ada riwayat. Cek berita pertamamu!"
- Loading state: skeleton 5 baris

**Jika user belum login:** Tampilkan placeholder card dengan pesan:
```
🔒 Login untuk melihat riwayat pemeriksaan kamu
[Masuk Sekarang]
```

---

## 🏗️ LANGKAH 10 — Loading & Error States

Pastikan setiap API call memiliki:

1. **Loading state:** Skeleton placeholder (div abu-abu animasi pulse)
2. **Error state:** Alert card merah dengan pesan error + tombol "Coba Lagi"
3. **Empty state:** Ilustrasi/ikon + pesan informatif + CTA button

Contoh loading skeleton untuk StatCard:
```jsx
<div className="bg-white rounded-xl p-6 border animate-pulse">
  <div className="h-12 w-12 bg-gray-200 rounded-full mb-4" />
  <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
  <div className="h-4 w-32 bg-gray-200 rounded" />
</div>
```

---

## 📱 Responsif Requirements

| Breakpoint | Layout Dashboard |
|------------|-----------------|
| Mobile `< 768px` | Single column, semua section stack |
| Tablet `768px - 1024px` | 2 kolom untuk StatCards, charts stack |
| Desktop `> 1024px` | 2 kolom untuk form+cards, 2 kolom untuk charts |

Gunakan Tailwind classes:
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `flex flex-col md:flex-row`

---

## 🎨 Warna & Styling Reference

```
Background halaman:   bg-gray-50 atau bg-[#F8FAFC]
Card:                 bg-white rounded-xl shadow-sm border border-gray-100
Navbar:               bg-[#1E3A5F] text-white
Tombol utama:         bg-[#1E3A5F] hover:bg-[#152d4a] text-white rounded-lg px-6 py-3
Tombol aksen:         bg-[#00B4D8] hover:bg-[#0090ad] text-white
Input/Textarea focus: border-[#00B4D8] ring-2 ring-[#00B4D8] ring-opacity-30
Badge Sangat Hoaks:   bg-red-600 text-white
Badge Hoaks:          bg-orange-600 text-white
Badge Perlu Verif:    bg-yellow-500 text-white
Badge Valid:          bg-green-600 text-white
```

---

## ✅ Checklist Sebelum Lanjut ke Prompt Berikutnya

Pastikan hal-hal ini sudah berfungsi:
- [ ] `npm run dev` berjalan tanpa error
- [ ] Halaman Dashboard tampil dengan benar
- [ ] Form input bisa diisi dan submit
- [ ] Setelah submit sukses, navigate ke `/result/:id`
- [ ] StatCards menampilkan data dari `/api/stats`
- [ ] Charts tampil jika user sudah login
- [ ] Recent Activity tampil jika user sudah login
- [ ] Responsive di mobile dan desktop
- [ ] Loading state tampil saat fetch data

---

## 🔗 Prompt Berikutnya

Setelah Dashboard selesai, lanjutkan ke:
- **`PROMPT_RESULT_PAGE.md`** — Halaman detail hasil analisis
- **`PROMPT_AUTH.md`** — Halaman Login & Register
