import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Search, ShieldAlert, ShieldCheck, Ban, LockOpen } from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/admin/users', config);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (userId: string, isCurrentlyBanned: boolean) => {
    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const reason = isCurrentlyBanned ? '' : window.prompt('Nhập lý do khóa tài khoản:', 'Vi phạm luật');
      
      if (!isCurrentlyBanned && reason === null) return; // cancelled

      await axios.put(`/api/admin/users/${userId}/ban`, {
        isBanned: !isCurrentlyBanned,
        banReason: reason
      }, config);
      
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, config);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredUsers = users.filter(u => {
    const name = (u.fullName || '').toLowerCase();
    const emailStr = (u.email || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || emailStr.includes(query);
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-800">Quản lý Người dùng</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm email, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sakura-500 focus:outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  <th className="p-4 pl-6">Người dùng</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right pr-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-gray-800">{u.fullName || 'Ẩn danh'}</div>
                      <div className="text-xs text-gray-500">{u.email || 'Không email'}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {currentUser?.role === 'admin' && u._id !== currentUser._id ? (
                        <select 
                          value={u.role}
                          onChange={(e) => handleChangeRole(u._id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border outline-none
                            ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                              u.role === 'moderator' ? 'bg-jade-50 text-jade-600 border-jade-200' : 
                              'bg-gray-50 text-gray-600 border-gray-200'}
                          `}
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg
                          ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                            u.role === 'moderator' ? 'bg-jade-100 text-jade-700' : 
                            'bg-gray-100 text-gray-700'}
                        `}>
                          {u.role.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {u.isBanned ? (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                          <Ban size={14} /> Đã bị khóa
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <ShieldCheck size={14} /> Hoạt động
                        </div>
                      )}
                      {u.isBanned && u.banReason && (
                        <div className="text-[10px] text-gray-400 mt-1 max-w-[120px] truncate" title={u.banReason}>
                          Lý do: {u.banReason}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      {u._id !== currentUser?._id && u.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggleBan(u._id, u.isBanned)}
                          className={`p-2 rounded-xl transition-all shadow-sm
                            ${u.isBanned 
                              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                              : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}
                          `}
                          title={u.isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          {u.isBanned ? <LockOpen size={16} /> : <ShieldAlert size={16} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Không tìm thấy người dùng nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
