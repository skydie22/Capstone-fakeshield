# 🛡️ FakeShield Master Technical Documentation
> **PANDUAN KOMPREHENSIF FRONTEND — Tim CC26-PSU184**

FakeShield adalah platform deteksi berita hoaks berbasis **Natural Language Processing (NLP)** yang dirancang untuk memperkuat literasi digital masyarakat Indonesia. Dokumentasi ini memberikan panduan teknis mendalam mengenai arsitektur, spesifikasi UI/UX, dan logika bisnis frontend.

---

## 🏗️ 1. Arsitektur & Alur Data

Frontend dirancang dengan pola **Backend-for-Frontend (BFF)**, di mana aplikasi React berinteraksi dengan sebuah Express.js Middleware sebelum akhirnya mencapai Service AI.

```text
[ CLIENT SIDE ]             [ MIDDLEWARE LAYER ]          [ AI ENGINE ]
React (Vite)  ───────────▶  Express.js (BFF)  ─────────▶  FastAPI (NLP)
(Tailwind CSS)              (Prisma/Postgres)             (TensorFlow/Keras)
```

- **Client Side**: Menangani visualisasi data, interaksi pengguna, dan manajemen session.
- **Middleware**: Menangani autentikasi (JWT), penyimpanan riwayat, dan agregasi data statistik.
- **AI Engine**: Core engine yang memproses teks menggunakan model Deep Learning.

---

## 🎨 2. Spesifikasi Desain (UI/UX)

### 💎 Identitas Visual
Aplikasi mengusung konsep **"Clean & Trustworthy"** dengan aksen warna fungsional untuk merepresentasikan tingkat bahaya informasi.

- **Sistem Warna**:
  - `Neutral`: Slate-900 (Text), Gray-50 (Background), Gray-200 (Border).
  - `Danger`: Red-600 (#DC2626) — Sangat Terindikasi Hoaks.
  - `Warning`: Orange-600 (#EA580C) — Terindikasi Hoaks.
  - `Caution`: Yellow-500 (#EAB308) — Perlu Verifikasi.
  - `Success`: Green-600 (#16A34A) — Kemungkinan Valid.

### 🖋️ Tipografi
- **Sans-Serif**: Inter / System Sans (untuk UI, tombol, dan navigasi).
- **Serif**: Georgia / Times New Roman (khusus untuk teks berita yang dianalisis agar menyerupai koran fisik).

---

## ⚙️ 3. Spesifikasi Teknis

### 📦 Core Library
- **React 19**: Framework utama dengan arsitektur Functional Components.
- **Vite 8**: Tooling build untuk performa pengembangan super cepat.
- **Tailwind CSS 3**: Framework CSS untuk styling modular dan responsif.
- **Axios**: Library HTTP dengan implementasi *Request/Response Interceptors*.
- **Recharts**: Library visualisasi data untuk Tren dan Distribusi Kategori.

### 🔐 Manajemen Session (Auth)
Autentikasi dikelola melalui `AuthContext` yang menyediakan state global:
- `user`: Objek profil pengguna (id, name, email).
- `token`: JWT yang disimpan secara persisten di `localStorage`.
- `isAuthenticated`: Flag untuk proteksi rute (Guarded Routes).

---

## 📂 4. Arsitektur Folder

```text
src/
├── api/          # Konfigurasi Axios & Centralized API Calls
├── components/   # Atomic Design:
│   ├── Navbar    # Navigasi utama & User Profile
│   ├── CheckForm # Input teks & Logic submission
│   ├── StatCard  # Komponen kecil penampil angka
│   └── ResultCard# Ringkasan hasil analisis
├── context/      # AuthContext: Provider data global
├── hooks/        # Custom hooks (useAuth, useChecks)
├── pages/        # Komponen Halaman:
│   ├── Dashboard # Utama: Statistik & Form input
│   ├── Result    # Detail: Visualisasi Word Attention
│   ├── History   # Riwayat: Daftar pemeriksaan user
│   └── Auth      # Login & Register
└── utils/        # Helper functions & Logic Category Mapping
```

---

## 📡 5. Referensi API & Kontrak Data

Aplikasi mewajibkan semua response backend memiliki struktur konsisten:
`{ "success": boolean, "data": Object/Array, "message": string }`

### 🔹 Endpoint Autentikasi
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Pendaftaran akun baru |
| `POST` | `/api/auth/login` | Mendapatkan JWT & User Profile |
| `GET` | `/api/auth/me` | Validasi token & ambil data user login |

### 🔹 Endpoint Deteksi
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/checks` | Kirim teks (`text`) untuk dianalisis AI |
| `GET` | `/api/checks/:id` | Ambil detail hasil (termasuk `wordScores`) |
| `GET` | `/api/history` | Riwayat user (Query: `page`, `limit`) |

### 🔹 Endpoint Analytics
- `GET /api/stats`: Mengembalikan `totalChecks`, `totalHoax`, `accuracy`.
- `GET /api/trends`: Data array 7 hari terakhir untuk Area Chart.
- `GET /api/categories`: Agregasi jumlah per kategori untuk Pie Chart.

---

## 🧠 6. Logika Pemetaan Kategori (Business Logic)

Frontend melakukan pemetaan otomatis berdasarkan skor `confidence` (0.0 - 1.0) yang diterima dari backend:

| Skor Confidence | Label Kategori | Emoji | Penanganan UI |
| :--- | :--- | :--- | :--- |
| **≥ 0.90** | Sangat Terindikasi Hoaks | 🔴 | Warna Merah, Peringatan Keras |
| **0.70 - 0.89** | Terindikasi Hoaks | 🟠 | Warna Oranye, Saran Verifikasi |
| **0.50 - 0.69** | Perlu Verifikasi | 🟡 | Warna Kuning, Cek Fact-checker |
| **< 0.50** | Kemungkinan Valid | 🟢 | Warna Hijau, Tetap Waspada |

---

## 🚀 7. Instalasi & Pengembangan

### Setup Environment
1. Clone repositori.
2. Jalankan `npm install`.
3. Buat file `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Jalankan Aplikasi
- **Dev Mode**: `npm run dev` (Akses di port 5173).
- **Build**: `npm run build` (Output siap deploy di folder `dist`).

---

## 🛡️ 8. Keamanan & Performa
- **JWT Guard**: Setiap request secara otomatis menyertakan token di header `Authorization`.
- **Auto-Logout**: Jika API merespons status `401`, sistem akan menghapus session dan mengalihkan ke halaman login.
- **Robust Data Handling**: Frontend mendukung dua format metadata pagination (`meta` atau `pagination`) untuk fleksibilitas integrasi.

---
© 2026 FakeShield. Dibuat dengan standar teknis tinggi oleh **Tim CC26-PSU184**.
Indonesia Cerdas Informasi.
