# Express AI Proxy

Express.js REST API yang meneruskan request ke AI Engine (FastAPI), dilengkapi dengan autentikasi JWT, PostgreSQL, dan Prisma ORM.

---

## Struktur Folder

```
express-ai-proxy/
├── prisma/
│   └── schema.prisma          # Skema database Prisma
├── src/
│   ├── config/
│   │   └── prisma.js          # Prisma client instance
│   ├── controllers/
│   │   ├── auth.controller.js # Handler register, login, me
│   │   ├── check.controller.js# Handler run check & history
│   │   └── health.controller.js# Handler health check
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   ├── errorHandler.js    # Global error handler
│   │   └── validate.js        # express-validator middleware
│   ├── routes/
│   │   ├── auth.routes.js     # /api/auth/*
│   │   ├── check.routes.js    # /api/checks/*
│   │   └── health.routes.js   # /api/health
│   ├── services/
│   │   ├── ai.service.js      # Proxy ke FastAPI /health & /predict
│   │   ├── auth.service.js    # Logika register & login
│   │   └── check.service.js   # Core business logic (cache, history)
│   ├── app.js                 # Express setup, middleware, routes
│   └── index.js               # Entry point (connect DB, start server)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi lokal
```

`.env` yang dibutuhkan:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/ai_proxy_db"
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
AI_ENGINE_URL=http://localhost:8000
```

### 3. Setup database
```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi
npm run db:migrate
```

### 4. Jalankan server
```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login & dapat token |
| GET | `/api/auth/me` | ✅ | Info user saat ini |

**Register**
```json
POST /api/auth/register
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "Password123"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "budi@example.com",
  "password": "Password123"
}
// Response: { data: { user, token } }
```

---

### Checks

> Semua endpoint membutuhkan header: `Authorization: Bearer <token>`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/checks` | Jalankan prediksi AI pada teks |
| GET | `/api/checks/:id` | Detail satu check |

**POST /api/checks**
```json
{
  "text": "Teks konten yang ingin dicek kebenarannya..."
}
```

Response:
```json
{
  "success": true,
  "message": "Check completed.",
  "data": {
    "id": "uuid",
    "label": "HOAX",
    "confidence": 0.92,
    "suspiciousWords": [{ "word": "konspirasi", "attention_score": 0.87 }],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### History

> Membutuhkan header: `Authorization: Bearer <token>`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/history?page=1&limit=10` | Ambil riwayat semua check user |

Response:
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
}
```

---

### Dashboard (Stats, Trends, Categories)

> Semua endpoint membutuhkan header: `Authorization: Bearer <token>`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/stats` | Summary statistik untuk dashboard |
| GET | `/api/trends` | Data tren hoax per hari untuk chart |
| GET | `/api/categories` | Jumlah per kategori confidence level |

---

### Health

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Status server & AI Engine |

---

### Documentation

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/docs` | Swagger API documentation |

---

## Fitur Utama

- **Caching hasil prediksi**: Teks yang sama tidak akan memanggil AI Engine dua kali — hasil di-cache berdasarkan hash SHA-256 dari teks.
- **Rate Limiting**: 100 request/15 menit secara global, 10 request/15 menit untuk endpoint auth.
- **Validasi input**: Menggunakan `express-validator`.
- **Error handling terpusat**: Semua error Prisma & HTTP ditangani secara konsisten.
