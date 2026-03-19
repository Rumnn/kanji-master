import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import QuizPlay from './pages/QuizPlay';
import './App.css';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-600 hover:text-sakura-500 font-medium transition-colors">
                  Welcome, {user.fullName}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-2 bg-jade-100 text-jade-700 rounded-lg text-sm font-bold hover:bg-jade-200 transition-colors">
                    Admin Panel
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
                <Link to="/login" className="text-gray-600 hover:text-sakura-500 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Login />;
  
  if (requireAdmin && user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-rose-500">Access Denied</div>;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
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

              {/* Admin Routes */}
              <Route path="/admin" element={
                <PrivateRoute requireAdmin={true}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
