import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// --- Toast Component ---
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

// --- Left Branding Panel ---
const LeftBrandingPanel = ({ mode }) => (
  <div className="hidden lg:flex flex-col justify-between p-12 bg-[#F8FAFC] w-[40%] max-w-[500px] border-r border-gray-200">
    {/* Header */}
    <div>
      <h1 className="text-[28px] font-extrabold text-[#1E293B] tracking-tight">FakeShield</h1>
    </div>

    {/* Center Content */}
    <div className="my-auto py-10">
      {mode === 'register' && (
        <h2 className="text-[32px] leading-[1.2] font-bold mb-10 text-[#1E293B]">
          Amankan langkah digital Anda sekarang.
        </h2>
      )}
      
      <ul className="space-y-8">
        <li className="flex items-start gap-4">
          <div className="mt-1 flex-shrink-0 text-gray-700">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <div>
            <p className="font-semibold text-[15px] text-gray-900 mb-1">
              {mode === 'register' ? 'Proteksi Real-time' : 'Keamanan Terjamin'}
            </p>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              {mode === 'register' 
                ? 'Pantau aktivitas mencurigakan secara instan tanpa hambatan.' 
                : 'Proteksi data berlapis dengan enkripsi standar industri terkini untuk setiap transaksi Anda.'}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="mt-1 flex-shrink-0 text-gray-700">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="font-semibold text-[15px] text-gray-900 mb-1">
              {mode === 'register' ? 'Laporan Terperinci' : 'Pemantauan Real-time'}
            </p>
            <p className="text-gray-500 text-[14px] leading-relaxed">
               {mode === 'register'
                 ? 'Akses riwayat keamanan lengkap dengan visualisasi data yang bersih.'
                 : 'Akses dashboard aktivitas Anda kapan saja dan di mana saja dengan transparansi penuh.'}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <div className="mt-1 flex-shrink-0 text-gray-700">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
          </div>
          <div>
            <p className="font-semibold text-[15px] text-gray-900 mb-1">
              {mode === 'register' ? 'Sinkronisasi Awan' : 'Dukungan Prioritas'}
            </p>
            <p className="text-gray-500 text-[14px] leading-relaxed">
               {mode === 'register'
                 ? 'Data Anda aman dan dapat diakses dari perangkat mana pun.'
                 : 'Tim bantuan profesional siap melayani kebutuhan teknis Anda dalam hitungan menit.'}
            </p>
          </div>
        </li>
      </ul>
    </div>

    {/* Footer Quote */}
    <div className="bg-[#E2E8F0]/40 rounded-xl p-6 border border-gray-200/60">
      <p className="text-gray-800 italic text-[14px] leading-relaxed mb-5 font-serif">
        {mode === 'register' 
          ? 'FakeShield memberikan ketenangan pikiran dalam mengelola aset digital kami. Keandalan sistemnya tidak tertandingi dalam kategori ini."' 
          : '"FakeShield memberikan ketenangan pikiran dalam mengelola aset digital kami. Keandalan sistemnya tidak tertandingi dalam kategori ini."'}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">{mode === 'register' ? 'FAKESHIELD' : 'FAKESHIELD'}</p>
          <p className="text-[12px] text-gray-500">{mode === 'register' ? 'Dicoding by DBS' : 'Dicoding by DBS'}</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Password Strength Component ---
function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  if (!password) return null;

  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? colors[strength] : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );
}

// --- Login Form ---
function LoginForm({ onSuccess, onError }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      onError('Email dan kata sandi wajib diisi');
      return;
    }
    setIsLoading(true);
    try {
      // Kirim parameter remember (boolean) ke fungsi login
      await login(formData.email, formData.password, remember);
      onSuccess('Berhasil masuk!');
    } catch (err) {
      onError(err.message || 'Email atau kata sandi salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fade-in space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-[28px] font-bold text-gray-900 mb-2">Selamat Datang Kembali</h2>
        <p className="text-gray-500 text-[14px]">Silakan masukkan detail akun Anda untuk melanjutkan akses ke dashboard.</p>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Alamat Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="nama@email.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
             <label className="block text-[13px] font-medium text-gray-700">Kata Sandi</label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
          </div>
        </div>
        
        {/* Remember me (Logic Updated) */}
        <div className="flex items-center group cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-100 transition-colors">
          <div className="flex items-center flex-1">
            <input 
              id="remember" 
              type="checkbox" 
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 text-[#334155] border-gray-300 rounded focus:ring-[#334155] cursor-pointer" 
            />
            <label htmlFor="remember" className="ml-3 text-[13px] text-gray-700 font-bold uppercase tracking-wider cursor-pointer select-none">
              Tetap masuk selama 7 hari
            </label>
          </div>
          <div className={`w-2 h-2 rounded-full transition-colors ${remember ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#334155] hover:bg-[#1E293B] text-white text-[14px] font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? 'Memproses...' : 'Masuk ke FakeShield'}
          {!isLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
        </button>

        <button 
          type="button" 
          onClick={() => navigate('/')}
          className="w-full py-2 rounded-lg text-[13px] font-bold text-gray-400 hover:text-gray-800 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          Lanjutkan sebagai Tamu
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </button>
        
        <p className="text-[11px] text-center text-gray-400 mt-2">
          Login diperlukan untuk melakukan analisis berita dan menyimpan riwayat pemeriksaan.
        </p>
      </div>
    </form>
  );
}

// --- Register Form ---
function RegisterForm({ onSuccess, onError }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      onError('Semua field wajib diisi'); return;
    }
    
    // Validasi Password (sesuai backend)
    if (formData.password.length < 8) {
      onError('Kata sandi minimal harus 8 karakter'); return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      onError('Kata sandi harus mengandung huruf besar, huruf kecil, dan angka'); return;
    }

    if (formData.password !== formData.confirmPassword) {
      onError('Konfirmasi kata sandi tidak cocok'); return;
    }
    
    setIsLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      onSuccess(result.message || 'Akun berhasil dibuat!');
    } catch (err) {
      // Jika error dari backend berupa array (express-validator)
      if (err.response?.data?.errors) {
        onError(err.response.data.errors[0].message);
      } else {
        onError(err.message || 'Gagal mendaftar. Email mungkin sudah digunakan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fade-in space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-[28px] font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
        <p className="text-gray-500 text-[14px]">Mulai perjalanan keamanan digital Anda hari ini.</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="Masukkan nama lengkap"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            placeholder="contoh@email.com"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
          />
        </div>

        {/* Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Kata Sandi</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors tracking-widest"
            />
            <PasswordStrength password={formData.password} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors tracking-widest"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white text-[14px] font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          {!isLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full py-2 rounded-lg text-[13px] font-bold text-gray-400 hover:text-gray-800 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          Lanjutkan sebagai Tamu
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </button>

        <p className="text-[11px] text-center text-gray-400 mt-2">
          Mode tamu memungkinkan analisis instan. Login diperlukan untuk akses statistik global, riwayat lengkap, dan detail laporan mendalam.
        </p>
      </div>
    </form>
  );
}

// --- Main Auth Page ---
const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState(initialMode);
  const [toast, setToast] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = (msg) => {
    setToast({ message: msg, type: 'success' });
    if (mode === 'register') {
      // Jika baru saja register, pindah ke mode login
      setTimeout(() => setMode('login'), 1500);
    } else {
      // Jika login, baru arahkan ke dashboard
      setTimeout(() => navigate('/', { replace: true }), 1000);
    }
  };

  const handleError = (msg) => {
    setToast({ message: msg, type: 'error' });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Left Panel (Fixed equivalent via Flex) */}
      <LeftBrandingPanel mode={mode} />

      {/* Right Panel (Scrollable area) */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 sm:p-12 lg:p-16 h-screen overflow-y-auto">
        
        {/* Mobile-only Branding Header */}
        <div className="lg:hidden w-full max-w-[440px] mt-4 mb-10 text-center animate-fade-in">
           <div className="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Dicoding by DBS</p>
           </div>
           <h1 className="text-3xl font-black text-[#1E293B] tracking-tighter mb-2">FakeShield</h1>
           <p className="text-[13px] font-medium text-slate-500 italic">"Amankan langkah digital Anda sekarang."</p>
        </div>

        {/* Inner Centered Container */}
        <div className="w-full max-w-[440px] flex-1 flex flex-col justify-center my-auto pt-4">
          
          {/* Pill Toggle aligned center like image */}
          <div className="flex bg-gray-100/80 p-1 rounded-full mb-10 w-[240px] mx-auto border border-gray-200/50">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                mode === 'login' ? 'bg-[#334155] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                mode === 'register' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Form Injection */}
          {mode === 'login' 
            ? <LoginForm onSuccess={handleSuccess} onError={handleError} />
            : <RegisterForm onSuccess={handleSuccess} onError={handleError} />
          }

          {/* Shared OAuth Section underneath the forms */}
          <div className="w-full mt-8 animate-fade-in">
            <p className="text-center text-[13px] text-gray-500 mb-6">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-bold text-gray-900 hover:underline">
                {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </div>

        {/* Minimal Footer below form */}
        <footer className="w-full max-w-[500px] mt-10 pt-6 flex flex-col items-center justify-center text-[10px] text-gray-400 font-semibold tracking-widest uppercase border-t border-gray-100">
          <p className="mb-3">&copy; 2026 FAKESHIELD</p>
        </footer>

      </div>
    </div>
  );
};

export default Auth;
