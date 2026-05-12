# 📡 API CONTRACT — FakeShield

> **Dokumen ini adalah kontrak antara Frontend dan Backend.**  
> Setiap perubahan WAJIB didiskusikan di Discord `#api-contract` sebelum diimplementasikan.  
> Team ID: CC26-PSU184

---

## 📌 Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000` |
| Production | `https://YOUR-APP.railway.app` |

Frontend menggunakan environment variable `VITE_API_URL` untuk menentukan base URL.

---

## 🔐 Autentikasi

Sistem menggunakan **JWT (JSON Web Token)** dengan mekanisme Bearer Token.

### Cara Frontend Mengirim Token
```
Header: Authorization: Bearer <token>
```

Token disimpan di `localStorage` dengan key `fs_token`. Axios interceptor secara otomatis menambahkan header ini di setiap request jika token tersedia.

### Middleware di Backend
- **`authenticateJWT`** — WAJIB login. Return 401 jika tidak ada token.
- **`optionalJWT`** — Opsional login. Tidak return error jika tidak ada token, tapi populate `req.user` jika ada.

---

## 📋 Format Response Standar

### Sukses
```json
// Objek tunggal
{
  "id": "uuid-or-int",
  "field1": "value",
  "field2": "value"
}

// Array
[
  { "id": 1, "name": "..." },
  { "id": 2, "name": "..." }
]

// Dengan pagination
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error (WAJIB konsisten)
```json
{
  "message": "Pesan error yang bisa ditampilkan ke user",
  "errors": {
    "fieldName": "Pesan error field ini"
  }
}
```

> **Catatan:** Field `message` adalah WAJIB di setiap response error. Frontend menggunakan field ini untuk menampilkan pesan ke user.

---

## 🔑 AUTH ENDPOINTS

### `POST /api/auth/register`

Mendaftarkan akun baru.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "name": "Wahyu Alamsyah",
  "email": "wahyu@email.com",
  "password": "Password123"
}
```

**Validasi Backend (wajib):**
- `name`: string, minimal 2 karakter, wajib
- `email`: format email valid, unik di database, wajib
- `password`: minimal 8 karakter, wajib

**Response Sukses `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Wahyu Alamsyah",
    "email": "wahyu@email.com",
    "created_at": "2026-04-28T10:00:00.000Z"
  }
}
```

**Response Error:**
```json
// 409 Conflict - email sudah dipakai
{ "message": "Email sudah terdaftar" }

// 400 Bad Request - validasi gagal
{
  "message": "Validasi gagal",
  "errors": {
    "name": "Nama minimal 2 karakter",
    "email": "Format email tidak valid",
    "password": "Password minimal 8 karakter"
  }
}
```

---

### `POST /api/auth/login`

Login dengan email dan password.

**Auth:** Tidak diperlukan

**Request Body:**
```json
{
  "email": "wahyu@email.com",
  "password": "Password123"
}
```

**Response Sukses `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Wahyu Alamsyah",
    "email": "wahyu@email.com",
    "created_at": "2026-04-28T10:00:00.000Z"
  }
}
```

**Response Error:**
```json
// 401 Unauthorized
{ "message": "Email atau password salah" }

// 400 Bad Request
{ "message": "Email dan password wajib diisi" }
```

---

### `GET /api/auth/me`

Validasi token dan mendapatkan data user yang sedang login.

**Auth:** `authenticateJWT` (WAJIB token)

**Response Sukses `200 OK`:**
```json
{
  "id": 1,
  "name": "Wahyu Alamsyah",
  "email": "wahyu@email.com",
  "created_at": "2026-04-28T10:00:00.000Z"
}
```

**Response Error:**
```json
// 401 Unauthorized - token tidak valid atau expired
{ "message": "Token tidak valid atau sudah kadaluarsa" }
```

> **Catatan Frontend:** Endpoint ini dipanggil saat aplikasi pertama kali load (di `AuthContext` useEffect) untuk memvalidasi token yang tersimpan di localStorage.

---

## 📝 CHECKS ENDPOINTS

### `POST /api/checks`

Submit teks artikel untuk dianalisis oleh AI model.

**Auth:** `optionalJWT` — anonymous user boleh, tapi history tidak tersimpan

**Request Body:**
```json
{
  "text": "Teks artikel atau judul berita yang ingin dicek..."
}
```

**Validasi Backend:**
- `text`: string, minimal 10 karakter, wajib

**Response Sukses `201 Created`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "text": "Teks artikel yang dicek...",
  "label": "HOAX",
  "confidence": 0.87,
  "suspiciousWords": ["kata1", "kata2", "kata3"],
  "createdAt": "2026-04-28T10:00:00.000Z"
}
```

> **Penting untuk Frontend:**
> - `label`: hanya `"HOAX"` atau `"VALID"` — Frontend menggunakan `confidence` untuk kategori detail
> - `confidence`: float 0.0 - 1.0 (bukan persentase!)
> - `suspiciousWords`: bisa array kosong `[]` jika tidak ada kata mencurigakan

**Setelah response sukses:** Frontend navigate ke `/result/{id}`

**Response Error:**
```json
// 400 Bad Request
{ "message": "Teks terlalu pendek, minimal 10 karakter" }

// 503 Service Unavailable - AI service tidak bisa diakses
{ "message": "Layanan analisis sedang tidak tersedia, coba lagi nanti" }
```

---

### `GET /api/checks/:id`

Mendapatkan detail satu hasil analisis berdasarkan ID.

**Auth:** `optionalJWT` — anonymous bisa akses hasil mereka sendiri via session? *(koordinasikan dengan backend)*

**Response Sukses `200 OK`:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "text": "Teks artikel yang dicek...",
  "label": "HOAX",
  "confidence": 0.87,
  "suspiciousWords": ["kata1", "kata2"],
  "createdAt": "2026-04-28T10:00:00.000Z"
}
```

**Response Error:**
```json
// 404 Not Found
{ "message": "Data tidak ditemukan" }

// 403 Forbidden - bukan milik user ini
{ "message": "Tidak punya akses ke data ini" }
```

---

### `GET /api/checks/history`

Mendapatkan riwayat cek artikel milik user yang sedang login.

**Auth:** `authenticateJWT` (WAJIB token)

**Query Parameters:**
```
?page=1        (default: 1)
?limit=10      (default: 10, max: 50)
```

**Response Sukses `200 OK`:**
```json
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "text": "Teks artikel yang dicek...",
      "label": "HOAX",
      "confidence": 0.87,
      "createdAt": "2026-04-28T10:00:00.000Z"
    },
    {
      "id": "b2c3d4e5-...",
      "text": "Teks artikel lainnya...",
      "label": "VALID",
      "confidence": 0.23,
      "createdAt": "2026-04-27T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "totalPages": 3
  }
}
```

> **Catatan:** Data diurutkan dari terbaru ke terlama (DESC by createdAt).  
> `text` boleh di-truncate di backend menjadi 200 karakter untuk efisiensi.

**Response Error:**
```json
// 401 Unauthorized
{ "message": "Silakan login terlebih dahulu" }
```

---

## 📊 STATISTICS & TRENDS ENDPOINTS

### `GET /api/stats`

Mendapatkan statistik agregat platform (data publik).

**Auth:** Tidak diperlukan

**Response Sukses `200 OK`:**
```json
{
  "totalChecks": 10234,
  "totalHoax": 3421,
  "accuracy": 94.2
}
```

> **Digunakan di:** Dashboard → 3 Summary Cards  
> **Catatan:** `accuracy` adalah persentase (0-100), bukan float (0-1)

---

### `GET /api/trends`

Mendapatkan data tren hoaks 7 hari terakhir.

**Auth:** `authenticateJWT` (WAJIB token)

**Response Sukses `200 OK`:**
```json
[
  { "date": "2026-04-22", "hoaxCount": 12, "validCount": 34 },
  { "date": "2026-04-23", "hoaxCount": 18, "validCount": 28 },
  { "date": "2026-04-24", "hoaxCount": 9,  "validCount": 41 },
  { "date": "2026-04-25", "hoaxCount": 25, "validCount": 31 },
  { "date": "2026-04-26", "hoaxCount": 14, "validCount": 38 },
  { "date": "2026-04-27", "hoaxCount": 20, "validCount": 25 },
  { "date": "2026-04-28", "hoaxCount": 17, "validCount": 33 }
]
```

> **WAJIB:** Array harus berisi tepat 7 item, diurutkan dari terlama ke terbaru (ASC by date).  
> **Digunakan di:** Dashboard → AreaChart Recharts  
> **Format tanggal:** `YYYY-MM-DD`

---

### `GET /api/categories`

Mendapatkan distribusi kategori berdasarkan confidence score.

**Auth:** `optionalJWT` — jika login, tampilkan data user; jika tidak, tampilkan data global

**Response Sukses `200 OK`:**
```json
[
  { "name": "Sangat Terindikasi Hoaks", "count": 45 },
  { "name": "Terindikasi Hoaks", "count": 30 },
  { "name": "Perlu Verifikasi", "count": 15 },
  { "name": "Kemungkinan Valid", "count": 10 }
]
```

> **WAJIB:** `name` harus persis seperti di atas karena Frontend menggunakan string ini untuk mapping warna chart.  
> **Kategori backend:** Backend perlu menghitung kategori berdasarkan range confidence:
> - confidence >= 0.90 → "Sangat Terindikasi Hoaks"
> - confidence >= 0.70 → "Terindikasi Hoaks"
> - confidence >= 0.50 → "Perlu Verifikasi"
> - confidence < 0.50 → "Kemungkinan Valid"
>
> **Digunakan di:** Dashboard → PieChart + ResultPage → PieChart

---

## 🚨 Error HTTP Status Codes

| Status | Kapan Digunakan |
|--------|----------------|
| `200 OK` | Request berhasil, ada data dikembalikan |
| `201 Created` | Resource baru berhasil dibuat |
| `400 Bad Request` | Validasi input gagal |
| `401 Unauthorized` | Token tidak ada, tidak valid, atau expired |
| `403 Forbidden` | Token valid tapi tidak punya izin akses resource ini |
| `404 Not Found` | Resource tidak ditemukan |
| `409 Conflict` | Konflik data (contoh: email sudah terdaftar) |
| `500 Internal Server Error` | Error server yang tidak terduga |
| `503 Service Unavailable` | AI service (FastAPI) tidak bisa diakses |

---

## 🌐 Konfigurasi CORS (WAJIB untuk Backend)

Backend Express.js WAJIB mengizinkan request dari origin berikut:

```js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',                    // Vite dev server (default)
  'http://localhost:5174',                    // Vite alternate port
  'https://fakeshield-frontend.vercel.app',   // Domain Vercel production
  process.env.FRONTEND_URL,                  // Dynamic dari .env Railway
];

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan requests tanpa origin (Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

---

## 🔧 Environment Variables Backend (Railway)

| Variable | Contoh | Keterangan |
|----------|--------|------------|
| `PORT` | `3000` | Port server Express |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` | Koneksi PostgreSQL |
| `JWT_SECRET` | `super-secret-key-min-32-chars` | Secret untuk sign JWT (min 32 karakter) |
| `JWT_EXPIRES_IN` | `7d` | Masa berlaku token JWT |
| `AI_SERVICE_URL` | `http://localhost:8000` | URL FastAPI inference service |
| `FRONTEND_URL` | `https://fakeshield.vercel.app` | URL frontend untuk CORS |
| `NODE_ENV` | `production` | Environment mode |
| `BCRYPT_ROUNDS` | `12` | Cost factor bcrypt hashing |

---

## ✅ Checklist Integrasi Frontend ↔ Backend

Gunakan checklist ini saat weekly review tim:

### Auth
- [ ] `POST /api/auth/register` — Frontend bisa daftar akun baru
- [ ] `POST /api/auth/login` — Frontend bisa login dan dapat token
- [ ] `GET /api/auth/me` — Session validasi berfungsi saat refresh halaman

### Checks
- [ ] `POST /api/checks` (anonymous) — Cek tanpa login berhasil
- [ ] `POST /api/checks` (dengan token) — Cek dengan login berhasil, data tersimpan
- [ ] `GET /api/checks/:id` — ResultPage bisa load data hasil analisis
- [ ] `GET /api/checks/history` — Dashboard Recent Activity tampil data

### Stats & Trends
- [ ] `GET /api/stats` — 3 Summary Cards di Dashboard terisi data
- [ ] `GET /api/trends` — AreaChart di Dashboard tampil dengan data 7 hari
- [ ] `GET /api/categories` — PieChart di Dashboard dan ResultPage tampil

### Cross-cutting
- [ ] CORS tidak memblock request dari localhost:5173
- [ ] CORS tidak memblock request dari domain Vercel
- [ ] Token expired → Frontend otomatis redirect ke /auth
- [ ] All error response memiliki field `message`

---

## 📞 Kontak & Koordinasi

| Peran | PIC | Discord |
|-------|-----|---------|
| Frontend | Wahyu Alamsyah | @wahyu |
| Frontend | Ezhar Mahesa | @ezhar |
| Backend | *(nama BE developer)* | @backend |
| AI Engineer | Maulana Dzaky | @maulana |

**Protocol perubahan API:**
1. Diskusi di `#api-contract` Discord
2. Update dokumen ini
3. Inform semua pihak yang terdampak
4. Baru implementasi di code

> ⚠️ **Jangan langsung ubah endpoint yang sudah jalan tanpa koordinasi. Perubahan mendadak bisa break frontend/backend production.**
