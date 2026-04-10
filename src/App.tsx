import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import UserManagement from './pages/admin/UserManagement';
import CMSKanji from './pages/admin/CMSKanji';
import PvPModerator from './pages/admin/PvPModerator';
import Feedbacks from './pages/admin/Feedbacks';
import QuizPlay from './pages/QuizPlay';
import MultipleChoiceQuiz from './pages/MultipleChoiceQuiz';
import BattleLobby from './pages/BattleLobby';
import BattlePlay from './pages/BattlePlay';
import BattleResult from './pages/BattleResult';
import Leaderboard from './pages/Leaderboard';
import './App.css';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-sakura-500 to-sakura-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform">
              <span className="mr-2 jp-text text-sakura-500">漢字</span>
              Kanji Master
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/quiz/mcq" className="px-4 py-2 text-gray-600 hover:text-sakura-500 font-semibold transition-colors rounded-lg hover:bg-sakura-50 text-sm">
                  📝 Trắc nghiệm
                </Link>
                <Link to="/battle" className="px-4 py-2 text-gray-600 hover:text-sakura-500 font-semibold transition-colors rounded-lg hover:bg-sakura-50 text-sm">
                  ⚔️ Đấu Solo
                </Link>
                <Link to="/leaderboard" className="px-4 py-2 text-gray-600 hover:text-amber-500 font-semibold transition-colors rounded-lg hover:bg-amber-50 text-sm">
                  🏆 Xếp hạng
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <Link to="/profile" className="text-gray-600 hover:text-sakura-500 font-medium transition-colors text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
                  👤 {user.fullName}
                </Link>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <Link to="/admin" className="px-3 py-2 bg-jade-100 text-jade-700 rounded-lg text-xs font-bold hover:bg-jade-200 transition-colors flex items-center gap-1">
                    {user.role === 'admin' ? '👑 Admin' : '🛡️ Mod'}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/leaderboard" className="px-4 py-2 text-gray-600 hover:text-amber-500 font-semibold transition-colors rounded-lg hover:bg-amber-50 text-sm">
                  🏆 Xếp hạng
                </Link>
                <Link to="/login" className="text-gray-600 hover:text-sakura-500 font-medium transition-colors px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-1 animate-fade-in">
            {user ? (
              <>
                <Link to="/quiz/mcq" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-sakura-50">📝 Trắc nghiệm</Link>
                <Link to="/battle" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-sakura-50">⚔️ Đấu Solo</Link>
                <Link to="/leaderboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-amber-50">🏆 Xếp hạng</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">👤 {user.fullName}</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">🚪 Logout</button>
              </>
            ) : (
              <>
                <Link to="/leaderboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-amber-50">🏆 Xếp hạng</Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sakura-600 font-bold hover:bg-sakura-50">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children, requireAdmin = false, requireModOrAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean, requireModOrAdmin?: boolean }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Login />;
  
  if (requireAdmin && user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-rose-500">Access Denied</div>;
  }

  if (requireModOrAdmin && user.role !== 'admin' && user.role !== 'moderator') {
    return <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-rose-500">Access Denied</div>;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-gray-200 font-sans text-gray-800 antialiased selection:bg-sakura-200 selection:text-sakura-900 flex flex-col relative overflow-x-hidden">
            {/* Decorative background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sakura-200/20 blur-3xl mix-blend-multiply animate-blob"></div>
              <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-jade-200/20 blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] rounded-full bg-blue-200/20 blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            <Navigation />

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* Protected Routes */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/quiz" element={
                  <PrivateRoute>
                    <QuizPlay />
                  </PrivateRoute>
                } />
                <Route path="/quiz/mcq" element={
                  <PrivateRoute>
                    <MultipleChoiceQuiz />
                  </PrivateRoute>
                } />
                <Route path="/battle" element={
                  <PrivateRoute>
                    <BattleLobby />
                  </PrivateRoute>
                } />
                <Route path="/battle/:roomCode/play" element={
                  <PrivateRoute>
                    <BattlePlay />
                  </PrivateRoute>
                } />
                <Route path="/battle/:roomCode/result" element={
                  <PrivateRoute>
                    <BattleResult />
                  </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <PrivateRoute requireModOrAdmin={true}>
                    <AdminLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<Overview />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="kanji" element={<CMSKanji />} />
                  <Route path="pvp" element={<PvPModerator />} />
                  <Route path="feedback" element={<Feedbacks />} />
                </Route>
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
