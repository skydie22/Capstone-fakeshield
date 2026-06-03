# FakeShield Dashboard

> Aplikasi analisis dan deteksi berita hoaks berbahasa Indonesia berbasis Deep Learning

FakeShield mengklasifikasikan berita Indonesia sebagai **Hoaks** atau **Valid** menggunakan model **BiLSTM + Bahdanau Attention**, dilengkapi dashboard eksplorasi dataset interaktif.

**Live Demo:** [fakeshield.streamlit.app](https://fakeshield.streamlit.app)

---

## Fitur

### Dashboard Analisis Dataset
Eksplorasi interaktif dataset berita Indonesia yang telah dibersihkan dan diseimbangkan:
- Distribusi berita Hoaks vs Valid
- Analisis kategori berita
- Pengaruh panjang teks terhadap klasifikasi
- Analisis kata kunci dengan TF-IDF
- Tren publikasi berita periode 2024–2026

### Demo Prediksi
Input teks berita dan dapatkan:
- Klasifikasi **Hoaks** / **Valid**
- Confidence score
- Visualisasi kata berpengaruh via Bahdanau Attention

---

## Struktur Proyek

```
FakeShield/
├── app.py
├── requirements.txt
├── README.md
├── data/
│   └── dataset_fakeshield_FINAL_ENGINEERED 39K.csv
└── models/
    ├── tokenizer (6).json
    ├── scaler (3).pkl
    └── fakeshield_model (7).keras/
        ├── config.json
        ├── metadata.json
        └── model.weights.h5
```

---

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Jalankan aplikasi
```bash
streamlit run app.py
```

Buka di browser: `http://localhost:8501`

> **Catatan:** Pastikan folder `models/` dan `data/` sudah ada sesuai struktur di atas sebelum menjalankan aplikasi.

---

## Arsitektur Model

| Layer | Detail |
|---|---|
| Embedding | 50.000 vocab, dim 256 |
| BiLSTM | 128 units per arah, max_len 150 |
| Attention | Bahdanau Additive Attention (64 units) |
| Output | Dense + Sigmoid (biner) |

**Fitur input:**
- Teks berita (tokenized, max 150 token)
- Rasio huruf kapital
- Jumlah tanda seru
- Jumlah tanda tanya
- Jumlah kata

---

## Dataset

| Properti | Nilai |
|---|---|
| Total artikel | ~339.667 |
| Periode | 2024–2026 |
| Bahasa | Indonesia |
| Label | Hoaks & Valid |