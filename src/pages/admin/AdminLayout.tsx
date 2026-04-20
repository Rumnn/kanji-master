import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Swords, 
  MessageSquare,
  LogOut 
} from 'lucide-react';

export default function AdminLayout() {
  const { user } = useContext(AuthContext);

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Khách hàng', path: '/admin/users', icon: Users },
    { name: 'CMS Kanji', path: '/admin/kanji', icon: BookOpen },
    { name: 'CMS IT Vocab', path: '/admin/it-vocab', icon: BookOpen },
    { name: 'PvP & Giải đấu', path: '/admin/pvp', icon: Swords },
    { name: 'Phản hồi', path: '/admin/feedback', icon: MessageSquare },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 rounded-2xl overflow-hidden shadow-xl border border-white/50 backdrop-blur-sm -mt-4">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-sakura-500/10 to-transparent">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-sakura-500 to-sakura-600 rounded-lg text-white shadow-sm">
              <LayoutDashboard size={18} />
            </span>
            Control Panel
          </h2>
          <p className="text-xs text-gray-500 mt-2 font-medium">Welcome, {user.fullName}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-amber-500' : 'bg-jade-500'} animate-pulse`}></span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{user.role}</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-sakura-500 to-sakura-600 text-white shadow-md transform scale-[1.02]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={18} strokeWidth={2.5} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavLink 
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-semibold text-sm hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Thoát Admin
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50/30">
        <Outlet />
      </main>
    </div>
  );
}
