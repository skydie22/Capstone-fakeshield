# 🔐 PROMPT 3 — Halaman Login & Register (Auth)

> **Cara pakai:** Kerjakan setelah `PROMPT_DASHBOARD.md` dan `PROMPT_RESULT_PAGE.md` selesai.  
> Copy seluruh isi prompt ini, paste ke Claude AI / ChatGPT / Cursor / Windsurf.

---

## 📋 KONTEKS

Kamu sedang melanjutkan development **FakeShield** frontend. Dashboard dan ResultPage sudah selesai. Sekarang kita akan membangun halaman **Auth** (`src/pages/Auth.jsx`) yang menangani Login dan Register.

Halaman ini diakses di route `/auth`. Jika user sudah login, otomatis redirect ke `/`.

---

## 🎯 TUJUAN HALAMAN AUTH

- Memungkinkan user **mendaftar** akun baru
- Memungkinkan user **masuk** ke akun yang sudah ada
- Setelah sukses: simpan token JWT, update AuthContext, redirect ke `/`
- Fitur ini **sekunder** — user yang tidak login tetap bisa pakai FakeShield (anonymous check), tapi tidak bisa lihat history dan charts

---

## 👤 Data User (dari Backend)

Sesuai skema database yang didefinisikan Backend:

```
users table:
  id          UUID/INT   PK
  name        STRING     Nama lengkap user
  email       STRING     Unique
  password    STRING     Hash bcrypt (tidak pernah dikirim ke FE)
  created_at  TIMESTAMP
  updated_at  TIMESTAMP
```

---

## 🏗️ LANGKAH 1 — Struktur Halaman Auth

Halaman Auth memiliki **2 mode** yang bisa di-toggle:
- Mode `login` (default)
- Mode `register`

Jika user sudah login (`isAuthenticated === true`), langsung redirect ke `/` dengan `<Navigate to="/" />`.

**Layout Split-Screen (Desktop):**
```
┌───────────────────┬──────────────────────────────┐
│                   │                              │
│   PANEL KIRI      │      PANEL KANAN             │
│   (Branding)      │      (Form)                  │
│   40% width       │      60% width               │
│   bg-[#1E3A5F]    │      bg-white                │
│                   │                              │
└───────────────────┴──────────────────────────────┘
```

**Layout Mobile:** Hanya tampil panel kanan (form), panel kiri disembunyikan (`hidden md:flex`).

---

## 🏗️ LANGKAH 2 — Panel Kiri (Branding)

```jsx
<div className="hidden md:flex flex-col justify-center items-start p-12 bg-[#1E3A5F] text-white w-2/5">
  
  {/* Logo */}
  <div className="text-5xl mb-4">🛡️</div>
  <h1 className="text-4xl font-bold mb-2">FakeShield</h1>
  <p className="text-[#00B4D8] text-lg mb-8">Jaga Kebenaran, Lawan Hoaks</p>
  
  {/* 3 Benefit */}
  <ul className="space-y-4">
    <li className="flex items-start gap-3">
      <span className="text-[#00B4D8] mt-1">✓</span>
      <div>
        <p className="font-semibold">Deteksi Instan Berbasis AI</p>
        <p className="text-gray-300 text-sm">Analisis BeRta dalam hitungan detik menggunakan deep learning</p>
      </div>
    </li>
    <li className="flex items-start gap-3">
      <span className="text-[#00B4D8] mt-1">✓</span>
      <div>
        <p className="font-semibold">Riwayat Pemeriksaan Tersimpan</p>
        <p className="text-gray-300 text-sm">Akses kembali semua berita yang pernah kamu cek</p>
      </div>
    </li>
    <li className="flex items-start gap-3">
      <span className="text-[#00B4D8] mt-1">✓</span>
      <div>
        <p className="font-semibold">Dashboard Tren Real-time</p>
        <p className="text-gray-300 text-sm">Lihat pola hoaks yang sedang beredar di Indonesia</p>
      </div>
    </li>
  </ul>

  {/* Quote */}
  <div className="mt-12 border-l-4 border-[#00B4D8] pl-4">
    <p className="text-gray-300 italic text-sm">"Setiap klik share adalah pilihan. Pastikan kamu memilih kebenaran."</p>
  </div>

</div>
```

---

## 🏗️ LANGKAH 3 — Panel Kanan (Form)

Panel kanan menampilkan form Login atau Register tergantung `mode` state:

```jsx
<div className="flex flex-col justify-center items-center p-8 md:p-12 w-full md:w-3/5 bg-white min-h-screen">
  
  {/* Mode toggle tabs */}
  <div className="flex bg-gray-100 rounded-lg p-1 mb-8 w-full max-w-sm">
    <button
      onClick={() => setMode('login')}
      className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
        mode === 'login' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
      }`}
    >
      Masuk
    </button>
    <button
      onClick={() => setMode('register')}
      className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
        mode === 'register' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
      }`}
    >
      Daftar
    </button>
  </div>

  {/* Form */}
  {mode === 'login' ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}
  
</div>
```

---

## 🏗️ LANGKAH 4 — Form Login

**Fields:**
- Email (type email)
- Password (type password, dengan toggle show/hide)

**Validasi client-side:**
- Email: tidak boleh kosong, format email valid (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Password: tidak boleh kosong, minimal 6 karakter

**Flow:**
1. User isi form dan klik "Masuk"
2. Set `isLoading = true`
3. Panggil `login(email, password)` dari `useAuth()`
4. Jika sukses: `navigate('/')` dengan `replace: true`
5. Jika gagal: tampilkan pesan error dari API

**API yang dipanggil (sudah di-handle di AuthContext):**
```
POST /api/auth/login
  Body:    { email: string, password: string }
  Success: { token: string, user: { id, name, email, created_at } }
  Error 401: { message: "Email atau password salah" }
  Error 400: { message: "Email dan password wajib diisi" }
```

**Design Form Login:**
```
┌─────────────────────────────────┐
│  Selamat Datang Kembali 👋      │
│  Masuk untuk menyimpan riwayat  │
│                                 │
│  Email                          │
│  [nama@email.com              ] │
│                                 │
│  Password                       │
│  [••••••••••••••••        👁  ] │
│                                 │
│  [Error message jika ada]       │
│                                 │
│  [        Masuk →              ]│
│                                 │
│  ──────── atau ────────         │
│                                 │
│  Belum punya akun?              │
│  [Daftar di sini]               │
└─────────────────────────────────┘
```

**Kode LoginForm:**
```jsx
function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');
    
    try {
      await login(formData.email, formData.password);
      onSuccess();
    } catch (err) {
      setApiError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Masuk untuk menyimpan riwayat pemeriksaan</p>
      </div>

      {/* Error API */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          ⚠️ {apiError}
        </div>
      )}

      {/* Field Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
          placeholder="nama@email.com"
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] ${
            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Field Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            className={`w-full px-4 py-3 pr-12 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8] ${
              errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1E3A5F] hover:bg-[#152d4a] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Memproses...
          </>
        ) : (
          'Masuk →'
        )}
      </button>
    </form>
  );
}
```

---

## 🏗️ LANGKAH 5 — Form Register

**Fields:**
- Nama Lengkap (`name`)
- Email
- Password
- Konfirmasi Password

**Validasi client-side:**
- Nama: tidak boleh kosong, minimal 2 karakter
- Email: tidak boleh kosong, format valid
- Password: tidak boleh kosong, minimal 8 karakter, mengandung minimal 1 huruf besar dan 1 angka
- Konfirmasi Password: harus sama dengan password

**Password Strength Indicator:**
- Hitung skor kekuatan password (0-4):
  - +1 jika panjang >= 8
  - +1 jika ada huruf besar
  - +1 jika ada angka
  - +1 jika ada karakter spesial
- Tampilkan sebagai 4 segmen bar:
  - 1 segmen merah = Lemah
  - 2 segmen oranye = Cukup
  - 3 segmen kuning = Kuat
  - 4 segmen hijau = Sangat Kuat

**API yang dipanggil:**
```
POST /api/auth/register
  Body:    { name: string, email: string, password: string }
  Success: { token: string, user: { id, name, email, created_at } }
  Error 409: { message: "Email sudah terdaftar" }
  Error 400: { message: "Validasi gagal", errors: { name?, email?, password? } }
```

**Flow setelah register sukses:**
1. Simpan token dan user ke localStorage (atau panggil `login()` internal)
2. Update AuthContext state
3. Redirect ke `/` dengan `replace: true`

**Design Form Register:**
```
┌─────────────────────────────────┐
│  Buat Akun Baru ✨              │
│  Gratis selamanya              │
│                                 │
│  Nama Lengkap                   │
│  [Wahyu Alamsyah             ] │
│                                 │
│  Email                          │
│  [nama@email.com              ] │
│                                 │
│  Password                       │
│  [••••••••••••••••        👁  ] │
│  [🔴][  ][  ][  ] Lemah        │  ← password strength
│                                 │
│  Konfirmasi Password            │
│  [••••••••••••••••        👁  ] │
│                                 │
│  [Error message jika ada]       │
│                                 │
│  [      Daftar Sekarang →     ] │
│                                 │
│  Sudah punya akun?              │
│  [Masuk di sini]                │
└─────────────────────────────────┘
```

---

## 🏗️ LANGKAH 6 — Komponen PasswordStrength

```jsx
function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const textColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= strength ? colors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[strength]}`}>
        {strength > 0 ? `Kekuatan password: ${labels[strength]}` : ''}
      </p>
    </div>
  );
}
```

---

## 🏗️ LANGKAH 7 — Handle Success & Redirect

Buatkan fungsi `handleSuccess` di komponen parent `Auth.jsx`:

```jsx
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Auth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');

  // Jika sudah login, redirect ke home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <LeftBrandingPanel />
      <div className="flex flex-col justify-center items-center p-8 md:p-12 w-full md:w-3/5">
        {/* Toggle tabs */}
        <ModeToggle mode={mode} setMode={setMode} />
        
        {/* Animasi transisi antar form */}
        <div key={mode} className="w-full max-w-sm animate-fade-in">
          {mode === 'login' 
            ? <LoginForm onSuccess={handleSuccess} onSwitchMode={() => setMode('register')} />
            : <RegisterForm onSuccess={handleSuccess} onSwitchMode={() => setMode('login')} />
          }
        </div>
      </div>
    </div>
  );
}
```

---

## 🏗️ LANGKAH 8 — Update AuthContext untuk Register

Tambahkan fungsi `register` ke dalam `AuthContext.jsx`:

```js
const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  const { token, user } = response.data;
  
  localStorage.setItem('fs_token', token);
  localStorage.setItem('fs_user', JSON.stringify(user));
  
  dispatch({ type: 'LOGIN', payload: { user, token } });
  return user;
};

// Expose register dari context
return (
  <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, register }}>
    {children}
  </AuthContext.Provider>
);
```

---

## 🏗️ LANGKAH 9 — Toast Notification (Opsional tapi Disarankan)

Tambahkan notifikasi singkat setelah login/register berhasil. Buatkan komponen `Toast` sederhana:

```jsx
// src/components/Toast.jsx
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${styles[type]} text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up flex items-center gap-2`}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
```

---

## ✅ Checklist Halaman Auth

- [ ] Redirect ke `/` jika sudah login
- [ ] Toggle antara mode Login dan Register smooth
- [ ] Form Login: validasi client-side berfungsi
- [ ] Form Login: API error ditampilkan (misalnya "Email atau password salah")
- [ ] Form Login: loading spinner saat submit
- [ ] Form Register: semua 4 field ada
- [ ] Form Register: password strength indicator berfungsi
- [ ] Form Register: validasi konfirmasi password
- [ ] Form Register: error 409 (email sudah terdaftar) ditampilkan
- [ ] Setelah sukses: redirect ke `/` dan user tercermin di Navbar
- [ ] Panel kiri branding tampil di desktop, tersembunyi di mobile
- [ ] Responsif di mobile (hanya form, tanpa panel kiri)

---

## 🔗 Setelah Auth Selesai

Lakukan **end-to-end testing**:

1. Buka `http://localhost:5173/auth`
2. Daftar akun baru → pastikan redirect ke Dashboard
3. Logout → pastikan Navbar berubah ke Guest mode
4. Login kembali → pastikan charts dan history tampil
5. Cek artikel → pastikan navigate ke ResultPage
6. Lihat kategori di ResultPage → pastikan sesuai confidence score
