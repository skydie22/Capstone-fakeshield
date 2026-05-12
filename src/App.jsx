import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ResultPage from './pages/ResultPage';
import Auth from './pages/Auth';
import History from './pages/History';
import Navbar from './components/Navbar';

// Fallback untuk halaman 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
    <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
    <p className="text-gray-500 mb-8">Halaman tidak ditemukan.</p>
    <a href="/" className="bg-[#1E293B] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
      Ke Beranda
    </a>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;