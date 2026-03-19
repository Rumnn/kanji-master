import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-sakura-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 z-0"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-center text-gray-800 mb-8 tracking-tight">
            Welcome Back
          </h2>

          {error && <div className="bg-rose-100/80 text-rose-700 p-4 rounded-xl mb-6 text-sm font-medium border border-rose-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-3 rounded-xl bg-white/80 border border-gray-200 focus:border-sakura-400 focus:ring focus:ring-sakura-200 focus:ring-opacity-50 transition-all font-medium text-gray-800 outline-none"
                placeholder="student@kanji.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-3 rounded-xl bg-white/80 border border-gray-200 focus:border-sakura-400 focus:ring focus:ring-sakura-200 focus:ring-opacity-50 transition-all font-medium text-gray-800 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-sakura-500 to-sakura-600 hover:shadow-sakura-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sakura-500 transform hover:-translate-y-0.5 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-sakura-600 hover:text-sakura-500 font-bold transition-colors">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
