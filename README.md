# Fakeshield

Fakeshield adalah aplikasi web berbasis AI yang membantu pengguna untuk deteksi berita Hoaks berbahasa indonesia berbasis deep learning 

Project ini dikembangkan sebagai Capstone Project Coding Camp 2026 by DBS Bank oleh tim CC26-PSU184.

## Tujuan Projek

Fakeshield dibuat untuk memberikan alat bantu pendeteksi awal berita palsu atau hoaks yang beredar di masyarakat. Aplikasi ini ditujukan bagi masyarakat umum, pelajar, jurnalis, dan pemerhati literasi digital untuk membantu memverifikasi kebenaran sebuah teks berita. Hasil prediksi dari aplikasi ini memberikan indikasi probabilitas kebenaran berita dan disarankan untuk digunakan bersamaan dengan verifikasi manual dari sumber berita yang tepercaya (pengecekan fakta).

## Fitur Utama

- Deteksi teks berita hoaks berbahasa Indonesia melalui input teks atau tautan (URL).
- Hasil analisis berbasis model Machine Learning / Deep Learning (NLP).
- Informasi confidence score (tingkat keyakinan model) dari hasil prediksi.
- Riwayat hasil pengecekan berita oleh pengguna.
- Dashboard ringkasan aktivitas scan teks.
- Autentikasi pengguna: register, login.

## Label Deteksi Model

Pada versi pilot, model Fakeshield mendukung 2 label berikut:

| Label Model | Keterangan |
|---|---|
| `Hoaks` | Teks terindikasi sebagai berita palsu, manipulasi, atau hoaks |
| `Valid` | Teks terindikasi sebagai berita valid atau fakta yang dapat dipertanggungjawabkan |

## Teknologi yang Digunakan

Project Fakeshield terdiri dari beberapa bagian utama:

| Bagian | Teknologi |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js, JWT Authentication, Prisma | 
| Machine Learning | TensorFlow/Keras |
| Model Format | `.keras` |
| Storage | Railway |
| Deployment Frontend | Vercel |
| Deployment Backend/ML Service | Railway, HuggingFace |

## Struktur Repository

```text
Fakeshield/
├── backend/              # Source code REST API dan dokumentasi endpoint
├── frontend/             # Source code aplikasi web
├── AI/                   # Service/API untuk menjalankan model Machine Learning
├── DS/                   # source kode aplikasi streamlit dan dataset
├── README.md             # Dokumentasi utama repository
└── .gitignore            # Daftar file/folder yang tidak di-push ke GitHub
```

> Catatan: Struktur folder dapat disesuaikan dengan isi repository final. Jika nama folder berbeda, sesuaikan bagian ini sebelum push ke GitHub.

## Dokumentasi Folder

Untuk detail teknis, lihat README pada masing-masing folder:

- [`frontend/README.md`](frontend/README.md) — panduan menjalankan dan memahami aplikasi frontend.
- [`backend/README.md`](backend/README.md) — dokumentasi REST API, autentikasi, klasifikasi, dashboard, dan data penyakit.
- [`AI/README.md`](AI/README.md) — panduan menjalankan service prediksi model, jika tersedia.
- [`DS/README.md`](DS/README.md) — panduan menjalankan streamlit, jika tersedia.

## Cara Menjalankan Project

Secara umum, project dijalankan melalui beberapa service berikut:

1. Jalankan ML service untuk inferensi/prediksi teks.
2. Jalankan backend API.
3. Jalankan frontend web app.
4. Hubungkan frontend ke backend melalui environment variable.
5. Hubungkan backend ke ML service dan storage sesuai konfigurasi `.env`.

Instruksi detail dapat dilihat di README masing-masing folder.

## Model Machine Learning

Model Machine Learning yang digunakan pada project ini adalah model pemrosesan bahasa alami (NLP) untuk klasifikasi teks dengan format .keras. Jika ukuran model terlalu besar untuk GitHub, simpan model pada layanan eksternal seperti Google Drive, Hugging Face, Railway, atau penyimpanan cloud lain, lalu cantumkan tautannya pada bagian ini.

```text
Model file: fakeshield_model(7).keras
Tokenizer: tokenizer(6).json
Scaler : scaler(3).pkl
```

## Tim Pengembang

| Nama | Peran | Student ID |
|---|---|---|
|Maulana Dzaky Putra Irawan| AI Engineer | CACC009D6Y1495
|Ahmad Mulki Thunasin| AI Engineer | CACC009D6Y1432   
|Hegar Pancawala Radji|Data Scientist| CDCC009D6Y2500   
|Alma Aulia Syaharani|Data Scientist|CDCC009D6X1855
|Wahyu Alamsyah|Full-Stack Web Developer|CFCC009D6Y2254
|Ezhar Mahesa|Full-Stack Web Developer|CFCC009D6Y1098

## Status Project

Project ini masih berada pada tahap pengembangan awal/pilot. Saat ini, Fakeshield berfokus pada deteksi berita hoaks berbentuk teks berbahasa Indonesia dengan 2 label utama (Fakta dan Hoaks). Pengembangan berikutnya dapat berupa penyempurnaan model.

## License

Project ini menggunakan MIT License.

Dataset, model, library, dan aset pihak ketiga yang digunakan dalam project ini tetap mengikuti lisensi dari sumber masing-masing.
