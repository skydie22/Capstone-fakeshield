# 🛡️ FakeShield Master Technical Documentation
> **PANDUAN INTEGRASI BACKEND (BFF) — Tim CC26-PSU184**

Dokumen ini disusun untuk memberikan pemahaman mendalam bagi tim Backend mengenai arsitektur, kebutuhan data, dan logika bisnis yang diharapkan oleh Frontend FakeShield.

---

## 🏗️ 1. Arsitektur Sistem
Frontend dirancang untuk berinteraksi dengan **Express.js Backend** sebagai API Gateway / BFF (Backend For Frontend).

```text
[ FRONTEND (Vite/React) ] 
          │
          ▼ (REST API + JWT)
[ BACKEND (Express.js) ] ◀───▶ [ DATABASE (PostgreSQL) ]
          │
          ▼ (HTTP Request)
[ AI SERVICE (FastAPI) ] ◀───▶ [ ML MODEL (.keras) ]
```

---

## 🔐 2. Autentikasi & Security
- **Header:** `Authorization: Bearer <token>`
- **Token Storage:** `localStorage` (key: `fs_token`)
- **JWT Standard:** `HS256`, Payload: `{ id: "uuid" }`

---

## 📡 3. Spesifikasi API Lengkap (JSON Request/Response)

### 🔹 AUTHENTICATION (`/api/auth`)

#### `POST /register`
- **Request Body:**
  ```json
  { "name": "Wahyu", "email": "wahyu@email.com", "password": "password123" }
  ```
- **Response (201 Success):**
  ```json
  {
    "message": "Registrasi berhasil, silakan login untuk melanjutkan",
    "user": { "id": "uuid", "name": "Wahyu", "email": "wahyu@email.com", "created_at": "ISO-Date" }
  }
  ```
- **Error (409):** `{ "message": "Email sudah terdaftar" }`

#### `POST /login`
- **Request Body:**
  ```json
  { "email": "wahyu@email.com", "password": "password123" }
  ```
- **Response (200 Success):**
  ```json
  {
    "token": "eyJhbG...",
    "user": { "id": "uuid", "name": "Wahyu", "email": "wahyu@email.com", "created_at": "ISO-Date" }
  }
  ```

#### `GET /me`
- **Auth Required:** Yes
- **Response (200 Success):**
  ```json
  { "id": "uuid", "name": "Wahyu", "email": "wahyu@email.com", "created_at": "ISO-Date" }
  ```

---

### 🔹 DETECTION ENGINE (`/api/checks`)

#### `POST /`
Submit teks untuk dianalisis AI. Backend harus meneruskan ke FastAPI `/predict`.
- **Auth Required:** Yes
- **Request Body:** `{ "text": "Isi berita minimal 10 karakter..." }`
- **Response (201 Success):**
  ```json
  {
    "id": "uuid",
    "text": "Full text...",
    "label": "HOAX",
    "confidence": 0.87,
    "suspiciousWords": ["hoax", "menipu"],
    "createdAt": "ISO-Date"
  }
  ```
- **Error (503):** `{ "message": "Layanan analisis sedang tidak tersedia" }` (FastAPI Down)

#### `GET /history`
- **Auth Required:** Yes
- **Query Params:** `?page=1&limit=10`
- **Response (200 Success):**
  ```json
  {
    "data": [
      { "id": "uuid", "text": "Truncated text...", "label": "HOAX", "confidence": 0.95, "createdAt": "ISO-Date" }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
  }
  ```

---

### 🔹 STATS & TRENDS (`/api/stats`, `/api/trends`, `/api/categories`, `/api/news`)

#### `GET /stats`
- **Auth:** Optional (Jika ada token, kembalikan statistik user; jika tidak, kembalikan statistik global).
- **Response:**
  ```json
  { "totalChecks": 1500, "totalHoax": 450, "accuracy": 92.5 }
  ```

#### `GET /trends`
- **Auth Required:** Yes
- **Response:** Array 7 objek (7 hari terakhir).
  ```json
  [
    { "date": "2026-05-12", "hoaxCount": 5, "validCount": 10 }
  ]
  ```

#### `GET /categories`
- **Auth:** Optional
- **Logika Mapping (PENTING):**
  - Confidence >= 0.90 ➔ `"Sangat Terindikasi Hoaks"`
  - Confidence 0.70 - 0.89 ➔ `"Terindikasi Hoaks"`
  - Confidence 0.50 - 0.69 ➔ `"Perlu Verifikasi"`
  - Confidence < 0.50 ➔ `"Kemungkinan Valid"`
- **Response:**
  ```json
  [ { "name": "Sangat Terindikasi Hoaks", "count": 45 }, ... ]
  ```

#### `GET /api/news`
Mengambil berita terbaru dari NewsAPI.
- **Response (200):**
  ```json
  [
    { "title": "Judul Berita", "source": "Detik", "url": "http...", "publishedAt": "ISO-Date" }
  ]
  ```

---

## 🚨 4. Penanganan Error (Standar Backend)
Backend **WAJIB** mengirimkan field `message` dalam setiap respons error agar UI dapat menampilkan pesan yang sesuai di UI.

- **Status 400:** Validasi input gagal.
- **Status 401:** Token expired/tidak valid (Frontend akan otomatis logout).
- **Status 403:** Tidak punya hak akses ke resource.
- **Status 404:** Data tidak ditemukan.
- **Status 503:** Service AI (FastAPI) tidak merespons.

---

## 🌐 5. CORS Configuration
Backend harus mengizinkan origin: `http://localhost:5173` dan domain production.

---

## 👥 Tim CC26-PSU184
- **Frontend:** Wahyu Alamsyah, Ezhar Mahesa
- **AI Engineer:** Maulana Dzaky
