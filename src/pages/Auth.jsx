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
          ? '"Framework ini memberikan fondasi yang sangat kuat bagi integritas UX aplikasi kami."' 
          : '"FakeShield memberikan ketenangan pikiran dalam mengelola aset digital kami. Keandalan sistemnya tidak tertandingi dalam kategori ini."'}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">{mode === 'register' ? 'Desainer Senior' : 'Aditya Pratama'}</p>
          <p className="text-[12px] text-gray-500">{mode === 'register' ? 'Wireframe Framework Corp.' : 'CTO, TechVision Corp'}</p>
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
      await login(formData.email, formData.password);
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
             <a href="#" className="text-[12px] font-medium text-gray-500 hover:text-gray-800">Lupa password?</a>
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
        
        {/* Remember me */}
        <div className="flex items-center">
          <input id="remember" type="checkbox" className="w-4 h-4 text-[#334155] border-gray-300 rounded focus:ring-[#334155] cursor-pointer" />
          <label htmlFor="remember" className="ml-2 text-[13px] text-gray-600 cursor-pointer">Tetap masuk selama 30 hari</label>
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
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      onError('Semua field wajib diisi'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      onError('Konfirmasi kata sandi tidak cocok'); return;
    }
    if (!agreed) {
      onError('Anda harus menyetujui syarat & ketentuan'); return;
    }
    
    setIsLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      onSuccess(result.message || 'Akun berhasil dibuat!');
    } catch (err) {
      onError(err.message || 'Gagal mendaftar. Email mungkin sudah digunakan.');
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

        {/* Terms */}
        <div className="flex items-start pt-1">
          <input 
             id="terms" 
             type="checkbox" 
             checked={agreed}
             onChange={(e) => setAgreed(e.target.checked)}
             className="mt-1 w-4 h-4 text-[#334155] border-gray-300 rounded focus:ring-[#334155] cursor-pointer" 
          />
          <label htmlFor="terms" className="ml-2.5 text-[13px] text-gray-600 cursor-pointer leading-tight">
            Saya menyetujui <span className="font-semibold text-gray-900 underline">Syarat Layanan</span> dan <span className="font-semibold text-gray-900 underline">Kebijakan Privasi</span> FakeShield.
          </label>
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
          Mode tamu hanya untuk melihat dashboard publik. Login diperlukan untuk analisis berita dan riwayat pemeriksaan.
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
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-white px-4 text-gray-400 font-bold">
                  {mode === 'login' ? 'ATAU LANJUTKAN DENGAN' : 'ATAU DAFTAR DENGAN'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-[13px] font-medium text-gray-700 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                  Google
               </button>
               <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-[13px] font-medium text-gray-700 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  Github
               </button>
            </div>

            <p className="text-center text-[13px] text-gray-500 mb-6">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-bold text-gray-900 hover:underline">
                {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </div>

        {/* Minimal Footer below form */}
        <footer className="w-full max-w-[440px] mt-10 pt-6 flex flex-col items-center justify-center text-[10px] text-gray-400 font-semibold tracking-widest uppercase border-t border-gray-100">
          <p className="mb-3">&copy; 2026 FAKESHIELD. WIREFRAME FRAMEWORK.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900 transition-colors">TERMS</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-gray-900 transition-colors">PRIVACY</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-gray-900 transition-colors">SUPPORT</a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Auth;
