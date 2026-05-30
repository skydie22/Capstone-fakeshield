# FakeShield API

FastAPI service untuk deteksi hoaks menggunakan model deep learning Keras dengan arsitektur BiLSTM + Bahdanau Attention.

---

## Struktur Proyek

```
fakeshield_api/
├── app/
│   ├── main.py          # FastAPI app, routing, startup
│   ├── predictor.py     # Model loading & inference logic
│   └── schemas.py       # Pydantic request/response schemas
├── models/
│   ├── fakeshield_model (4).keras/   # Folder model Keras 3.x
│   │   ├── config.json               # Arsitektur model
│   │   ├── metadata.json             # Metadata (versi Keras, tanggal simpan)
│   │   └── model.weights.h5          # Bobot model terlatih
│   └── tokenizer (3).json            # Tokenizer Keras (word index + config)
├── tests/
│   └── test_main.py     # Pytest endpoint tests
├── .env                 # Konfigurasi path model & tokenizer
├── requirements.txt     # Python dependencies
└── README.md
```

---

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Pastikan file model tersedia

Struktur folder `models/` harus mengandung:
- `fakeshield_model (4).keras/` — folder model Keras 3.x
- `tokenizer (3).json` — file tokenizer

### 3. Jalankan server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Akses dokumentasi interaktif di: http://localhost:8000/docs

---

## Endpoints

### `POST /predict`

Mendeteksi apakah teks merupakan hoaks atau bukan.

**Request:**
```json
{
  "text": "Teks berita atau klaim yang ingin dianalisis"
}
```

**Response:**
```json
{
  "label": "hoaks",
  "confidence": 0.9123,
  "confidence_raw": 0.9123,
  "confidence_level": "Sangat Terindikasi Hoaks",
  "confidence_color": "red",
  "top_suspicious_words": [
    { "word": "vaksin", "attention_score": 1.0 },
    { "word": "berbahaya", "attention_score": 0.87 }
  ],
  "attention_per_word": {
    "vaksin": 1.0,
    "berbahaya": 0.87
  }
}
```

**Tingkat Kepercayaan (`confidence_level`):**

| Rentang `confidence` | Label | Warna |
|---|---|---|
| ≥ 0.90 | Sangat Terindikasi Hoaks | `red` |
| 0.70 – 0.89 | Terindikasi Hoaks | `orange` |
| 0.50 – 0.69 | Perlu Verifikasi | `yellow` |
| < 0.50 | Kemungkinan Valid | `green` |

---

### `GET /health`

Cek status server dan apakah model & tokenizer sudah termuat.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "tokenizer_loaded": true
}
```

---

### `GET /metrics`

Informasi status runtime sederhana.

**Response:**
```json
{
  "total_requests": "lihat di log terminal",
  "model_version": "1.0.0",
  "status": "running"
}
```

> **Catatan:** Endpoint ini belum terintegrasi Prometheus secara penuh. Untuk monitoring lebih lanjut, pantau log terminal.

---

## Cara Kerja

```
Input Teks
    ↓
Preprocessing (lowercase, hapus URL/mention/angka)
    ↓
Tokenizer (tokenizer (3).json) — vocab ±30.000 kata
    ↓
Padding (max_len = 100 token)
    ↓
Embedding Layer (128 dims)
    ↓
SpatialDropout1D (0.3)
    ↓
BiLSTM (64 units × 2 arah, return_sequences=True)
    ↓
BahdanauAttention (32 units) → Context Vector + Bobot Attention per kata
    ↓
Dense (64 units, ReLU) → Dropout (0.4)
    ↓
Dense (1 unit, Sigmoid) → Probabilitas hoaks
    ↓
Output: label + confidence + top suspicious words
```

---

## Contoh Penggunaan (Python)

```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={"text": "Berita palsu tentang vaksin covid menyebabkan kematian massal"}
)
print(response.json())
```

---

## Testing

```bash
pytest tests/ -v
```

---

## Troubleshooting

### Model tidak ditemukan saat startup
- Pastikan folder `models/fakeshield_model (4).keras/` ada dan berisi `config.json`, `metadata.json`, dan `model.weights.h5`
- Pastikan `models/tokenizer (3).json` ada

### `PermissionError` saat load model
- Periksa permission folder `models/` dan file di dalamnya:
  ```bash
  chmod -R 755 models/
  ```

### Prediksi selalu error
- Jalankan `GET /health` untuk memastikan `model_loaded: true` dan `tokenizer_loaded: true`
- Periksa log terminal untuk pesan error spesifik

---

## Detail Model

| Properti | Nilai |
|---|---|
| Framework | TensorFlow / Keras 3.13.2 |
| Arsitektur | BiLSTM + Bahdanau Attention |
| Max sequence length | 100 token |
| Output | Sigmoid (binary: hoaks / bukan_hoaks) |
| Tanggal simpan | 2026-05-20 |
