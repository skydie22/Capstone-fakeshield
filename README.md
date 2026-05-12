# FakeShield Frontend

Frontend React + Vite + Tailwind untuk aplikasi FakeShield.

Dokumen ini ditulis supaya tim backend bisa memahami dengan cepat:
- frontend memanggil endpoint apa saja
- data seperti apa yang diharapkan frontend
- halaman mana yang butuh login
- perilaku auth, history, dan result page
- setup lokal, proxy, dan skenario `ngrok`

Dokumen ini menjelaskan kondisi kode **aktual saat ini**, bukan rencana lama.

## Ringkasan

Stack utama:
- React 19
- Vite 8
- Tailwind CSS 3
- React Router DOM 6
- Axios
- Recharts

Tujuan frontend:
- menampilkan dashboard publik
- mengizinkan user register/login
- mengharuskan login untuk analisis berita
- menampilkan result detail analisis
- menampilkan history milik user
- menampilkan berita live dari NewsAPI melalui backend

## Struktur Halaman

Route utama di [App.jsx](/C:/WAHYU/capstone/fakeshield-frontend/src/App.jsx:1)

Route aktif:
- `/` → Dashboard
- `/auth` → Login / Register
- `/result/:id` → Detail hasil analisis
- `/history` → Riwayat analisis user
- `*` → 404

Perilaku akses:
- `Dashboard` bisa diakses guest
- `Auth` untuk login/register
- `History` bisa dibuka guest, tetapi halaman akan meminta login sebelum menampilkan data
- `Result` membutuhkan data result yang dimiliki user login
- `POST /api/checks` sekarang **wajib login**

## Aturan Produk yang Berlaku

Ini penting untuk backend agar tidak salah asumsi:

1. Guest boleh membuka dashboard publik.
2. Guest **tidak** boleh melakukan analisis berita.
3. Guest **tidak** boleh melihat history.
4. Result detail sekarang diasumsikan **owner-only**.
5. Register **tidak** auto-login.
6. Setelah register berhasil, user tetap guest dan harus login manual.

## Auth Flow

Frontend menyimpan token JWT di `localStorage`:
- key token: `fs_token`
- key user: `fs_user`

Flow login:
1. User submit email + password ke `POST /api/auth/login`
2. Backend mengembalikan `token` dan `user`
3. Frontend menyimpan token ke `localStorage`
4. Frontend menganggap user authenticated
5. Saat app reload, frontend memanggil `GET /api/auth/me`

Flow register:
1. User submit `name`, `email`, `password` ke `POST /api/auth/register`
2. Backend **tidak** mengembalikan token
3. Frontend menampilkan pesan sukses
4. Frontend memindahkan UI ke mode login
5. User harus login manual

Flow unauthorized:
- Axios interceptor akan menghapus token lokal jika backend mengembalikan `401`
- setelah itu frontend redirect ke `/auth`

## Integrasi Backend

### Base URL saat development

Frontend secara default memakai base URL relatif:

```js
baseURL: import.meta.env.VITE_API_URL || '/'
```

Artinya:
- jika `VITE_API_URL` kosong, request `/api/...` akan diproxy oleh Vite
- jika `VITE_API_URL` diisi URL absolut, request akan langsung ke URL itu

### Proxy Vite

Pada mode lokal, Vite memproxy:

```txt
/api -> http://localhost:3000
```

Jadi arsitektur lokal:

```txt
Browser -> Vite Frontend (5173) -> Proxy /api -> Express Backend (3000)
```

### Skenario ngrok

Jika frontend di-expose lewat `ngrok`:
- `ngrok` cukup dibuka untuk port frontend
- backend Express tetap lokal
- request `/api/...` tetap lewat proxy Vite ke backend lokal

## Environment Variable Frontend

File utama:
- `.env`

Variable yang dipakai:

### `VITE_API_URL`

Default yang direkomendasikan untuk development:

```env
VITE_API_URL=
```

Kenapa kosong:
- agar frontend memakai path relatif
- agar Vite proxy yang meneruskan request ke backend
- cocok untuk `localhost` dan `ngrok frontend only`

Gunakan URL absolut hanya jika memang ingin bypass proxy.

Contoh:

```env
VITE_API_URL=https://backend.example.com
```

## Cara Menjalankan Frontend

Install dependency:

```bash
npm install
```

Jalankan dev server:

```bash
npm run dev
```

Untuk akses dari device lain atau `ngrok`:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Dependency Backend yang Harus Hidup

Agar frontend bekerja penuh, ini harus aktif:

1. Express backend di `http://localhost:3000`
2. FastAPI inference service di `http://localhost:8000`
3. PostgreSQL untuk backend Express

Kalau FastAPI mati:
- login/register tetap bisa jalan
- analisis berita akan gagal

Kalau backend Express mati:
- frontend hanya bisa render UI statis tanpa data

## Endpoint yang Dipakai Frontend

Berikut adalah endpoint yang benar-benar dipakai oleh frontend saat ini.

### Auth

#### `POST /api/auth/register`

Dipakai oleh halaman register.

Request:

```json
{
  "name": "Nama User",
  "email": "user@email.com",
  "password": "Password123"
}
```

Ekspektasi sukses:

```json
{
  "message": "Registrasi berhasil, silakan login untuk melanjutkan",
  "user": {
    "id": "uuid",
    "name": "Nama User",
    "email": "user@email.com",
    "created_at": "2026-05-12T10:00:00.000Z"
  }
}
```

Catatan penting:
- frontend **tidak** mengharapkan token dari register lagi
- register sukses **tidak** membuat user login

#### `POST /api/auth/login`

Request:

```json
{
  "email": "user@email.com",
  "password": "Password123"
}
```

Ekspektasi sukses:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "Nama User",
    "email": "user@email.com",
    "created_at": "2026-05-12T10:00:00.000Z"
  }
}
```

#### `GET /api/auth/me`

Dipakai saat app load untuk validasi session.

Ekspektasi sukses:

```json
{
  "id": "uuid",
  "name": "Nama User",
  "email": "user@email.com",
  "created_at": "2026-05-12T10:00:00.000Z"
}
```

### Checks

#### `POST /api/checks`

Dipakai oleh `CheckForm`.

Status akses:
- **wajib login**

Request:

```json
{
  "text": "Isi berita yang ingin dianalisis"
}
```

Ekspektasi sukses:

```json
{
  "id": "uuid",
  "text": "Isi berita yang ingin dianalisis",
  "label": "HOAX",
  "confidence": 0.87,
  "suspiciousWords": ["kata1", "kata2"],
  "wordScores": {
    "kata1": 1.0,
    "kata2": 0.84
  },
  "createdAt": "2026-05-12T10:00:00.000Z"
}
```

Catatan:
- `label` harus `"HOAX"` atau `"VALID"`
- `confidence` harus rentang `0.0 - 1.0`
- frontend memakai `wordScores` untuk chart kata

#### `GET /api/checks/:id`

Dipakai oleh:
- Dashboard, setelah analisis sukses
- Result page

Status akses:
- **wajib login**
- **owner-only**

Ekspektasi sukses:

```json
{
  "id": "uuid",
  "text": "Isi berita yang dianalisis",
  "label": "HOAX",
  "confidence": 0.87,
  "suspiciousWords": ["kata1", "kata2"],
  "wordScores": {
    "kata1": 1.0,
    "kata2": 0.84
  },
  "createdAt": "2026-05-12T10:00:00.000Z"
}
```

Error yang penting:
- `401` → belum login / token invalid
- `403` → bukan pemilik result
- `404` → result tidak ditemukan

#### `GET /api/checks/history`

Dipakai oleh:
- widget history di dashboard
- halaman history penuh

Status akses:
- **wajib login**

Query:

```txt
?page=1&limit=10
```

Ekspektasi sukses:

```json
{
  "data": [
    {
      "id": "uuid",
      "text": "Isi berita...",
      "label": "HOAX",
      "confidence": 0.87,
      "createdAt": "2026-05-12T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Stats, Trends, Categories, News

#### `GET /api/stats`

Dipakai untuk 3 summary cards di dashboard.

Ekspektasi sukses saat ini:

```json
{
  "totalChecks": 25,
  "totalHoax": 11,
  "accuracy": null,
  "accuracyStatus": "placeholder",
  "accuracyMessage": "Akurasi model belum dihitung dari data evaluasi terverifikasi"
}
```

Catatan:
- frontend **sengaja** menampilkan `accuracy` sebagai `N/A` jika `null`
- jangan kirim angka palsu/hardcoded lagi

#### `GET /api/trends`

Status akses:
- **wajib login**

Ekspektasi:

```json
[
  { "date": "2026-05-06", "hoaxCount": 2, "validCount": 1 },
  { "date": "2026-05-07", "hoaxCount": 3, "validCount": 4 }
]
```

Aturan:
- tepat 7 item
- urut dari terlama ke terbaru
- format tanggal `YYYY-MM-DD`

#### `GET /api/categories`

Dipakai untuk pie chart.

Ekspektasi:

```json
[
  { "name": "Sangat Terindikasi Hoaks", "count": 4 },
  { "name": "Terindikasi Hoaks", "count": 7 },
  { "name": "Perlu Verifikasi", "count": 3 },
  { "name": "Kemungkinan Valid", "count": 9 }
]
```

Nama kategori harus persis sama, karena frontend memetakan warna berdasarkan string ini.

#### `GET /api/news`

Dipakai untuk card `Berita Terkini`.

Ekspektasi:

```json
[
  {
    "title": "Judul berita terbaru",
    "source": "Kompas.com",
    "url": "https://...",
    "publishedAt": "2026-05-12T10:00:00.000Z"
  }
]
```

Catatan penting untuk backend:
- frontend sekarang menganggap data ini **live dari NewsAPI**
- jangan kembalikan mock statis diam-diam
- jika gagal, lebih baik return error atau array kosong yang jujur

## Komponen dan Perilaku Penting

### Dashboard

File utama:
- `src/pages/Dashboard.jsx`

Dashboard berisi:
- form analisis
- berita terkini
- statistik ringkas
- chart trend
- pie kategori
- preview history user

Perilaku:
- guest tetap bisa membuka dashboard
- guest bisa melihat berita publik
- guest tidak bisa submit analisis
- guest tidak bisa melihat chart/history yang butuh data personal

### Result Page

File utama:
- `src/pages/ResultPage.jsx`

Halaman ini butuh:
- `confidence`
- `suspiciousWords`
- `wordScores`
- `categories`

`wordScores` sangat penting untuk chart pengaruh kata.

### History Page

File utama:
- `src/pages/History.jsx`

Perilaku:
- jika guest masuk `/history`, frontend tidak crash
- guest akan melihat halaman info bahwa history memerlukan login
- data history hanya di-fetch jika user sudah authenticated

## Catatan Integrasi yang Sering Membingungkan

### 1. Register bukan login

Backend jangan mengasumsikan bahwa register harus langsung memberikan token.

Kondisi frontend saat ini:
- register sukses
- tampil toast sukses
- user tetap guest
- user diminta login manual

### 2. Analisis sekarang wajib login

Kalau backend mengubah `POST /api/checks` menjadi anonymous lagi, frontend perlu disesuaikan lagi.

Saat ini frontend sudah dikunci ke:
- analisis berita = login required

### 3. Result sekarang owner-only

Frontend sekarang sudah selaras dengan backend:
- `GET /api/checks/:id` harus protected
- jika owner mismatch, backend kirim `403`

### 4. Accuracy belum tersedia

Frontend sekarang tidak menganggap `accuracy` wajib berupa angka.

Kalau backend belum punya pipeline evaluasi model, biarkan:

```json
{
  "accuracy": null,
  "accuracyStatus": "placeholder",
  "accuracyMessage": "..."
}
```

### 5. News harus live

Frontend tidak lagi dirancang untuk menerima `mock news` diam-diam.

## Struktur Folder Frontend

Folder penting:

```txt
fakeshield-frontend/
├─ public/
├─ src/
│  ├─ api/
│  │  └─ axios.js
│  ├─ components/
│  ├─ context/
│  │  └─ AuthContext.jsx
│  ├─ hooks/
│  ├─ pages/
│  │  ├─ Auth.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ History.jsx
│  │  └─ ResultPage.jsx
│  ├─ utils/
│  │  └─ helpers.js
│  ├─ App.jsx
│  └─ main.jsx
├─ .env
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
└─ vite.config.js
```

## Checklist Backend Saat Integrasi

Gunakan checklist ini jika backend ingin memastikan frontend tidak bingung:

- [ ] `POST /api/auth/register` tidak auto-login user
- [ ] `POST /api/auth/login` mengembalikan `token` dan `user`
- [ ] `GET /api/auth/me` valid untuk token tersimpan
- [ ] `POST /api/checks` butuh login
- [ ] `POST /api/checks` mengembalikan `wordScores`
- [ ] `GET /api/checks/:id` hanya bisa diakses owner
- [ ] `GET /api/checks/history` mengembalikan pagination
- [ ] `GET /api/trends` mengembalikan tepat 7 hari
- [ ] `GET /api/categories` memakai nama kategori yang persis sesuai frontend
- [ ] `GET /api/stats` tidak mengirim angka akurasi palsu
- [ ] `GET /api/news` benar-benar live dari NewsAPI
- [ ] semua error punya field `message`

## Catatan Tentang API_CONTRACT.md

File `API_CONTRACT.md` masih ada sebagai referensi tim, tetapi beberapa bagian historisnya sudah tertinggal dari implementasi aktual.

Jika ada konflik antara:
- README ini
- `API_CONTRACT.md`
- implementasi kode

maka untuk kebutuhan integrasi cepat, verifikasi dulu ke **kode aktual** frontend + backend.

## Rekomendasi Untuk Tim Backend

Jika ingin mengubah kontrak API, lakukan dengan aman:

1. tentukan endpoint yang berubah
2. cek apakah dipakai oleh `Dashboard`, `Auth`, `ResultPage`, atau `History`
3. update backend
4. update frontend
5. update `API_CONTRACT.md`
6. update README ini jika perubahan memengaruhi perilaku frontend

## Kontak File Penting

Jika tim backend ingin cek titik integrasi langsung:
- auth state: [src/context/AuthContext.jsx](/C:/WAHYU/capstone/fakeshield-frontend/src/context/AuthContext.jsx:1)
- axios config: [src/api/axios.js](/C:/WAHYU/capstone/fakeshield-frontend/src/api/axios.js:1)
- dashboard: [src/pages/Dashboard.jsx](/C:/WAHYU/capstone/fakeshield-frontend/src/pages/Dashboard.jsx:1)
- auth page: [src/pages/Auth.jsx](/C:/WAHYU/capstone/fakeshield-frontend/src/pages/Auth.jsx:1)
- history page: [src/pages/History.jsx](/C:/WAHYU/capstone/fakeshield-frontend/src/pages/History.jsx:1)
- result page: [src/pages/ResultPage.jsx](/C:/WAHYU/capstone/fakeshield-frontend/src/pages/ResultPage.jsx:1)
