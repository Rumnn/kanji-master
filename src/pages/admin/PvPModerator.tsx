import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Swords, Eye, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function PvPModerator() {
  const { user } = useContext(AuthContext);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveMatches = async () => {
    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      const { data } = await axios.get('/api/admin/matches/live', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveMatches(data);
    } catch (error) {
      console.error('Error fetching live matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleResetLeaderboard = async () => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ dữ liệu lịch sử đấu và đưa mọi người chơi về 0 điểm. Bạn thực sự muốn Reset Season?')) return;
    
    // Yêu cầu nhập mã xác nhận an toàn
    const confirmText = window.prompt("Gõ chữ 'RESET' (viết hoa) để xác nhận hành động nguy hiểm này:", "");
    if (confirmText !== "RESET") {
      alert("Đã hủy bỏ vì mã xác nhận không hợp lệ.");
      return;
    }

    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      const { data } = await axios.post('/api/admin/reset-leaderboard', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(data.message);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-black text-gray-800 mb-8">Quản lý Giải đấu & PvP</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Matches List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Swords size={20} className="text-rose-500" /> Live Battles 
                <span className="flex h-2 w-2 relative ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </h2>
              <p className="text-sm text-gray-500">Các trận đang diễn ra (tự làm mới mỗi 5 giây)</p>
            </div>
            <button onClick={fetchLiveMatches} className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors" title="Làm mới">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tìm các trận đấu...</div>
            ) : liveMatches.length === 0 ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                <Eye size={48} className="mb-4 opacity-50" />
                <p>Không có trận đấu nào đang diễn ra ngay lúc này.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {liveMatches.map(match => (
                  <div key={match._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Room: {match.roomCode}</div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">{match.hostName}</span>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-lg text-xs font-black italic">VS</span>
                        <span className={`font-bold ${match.guestName ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                          {match.guestName || 'Waiting...'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border 
                        ${match.status === 'playing' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}
                      `}>
                        {match.status === 'playing' ? 'Đang thi đấu' : 'Phòng chờ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Settings & Danger Zone */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ShieldAlert className="text-rose-600" /> Danger Zone
            </h2>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <h3 className="font-bold text-rose-800 mb-2">Reset Leaderboard (New Season)</h3>
              <p className="text-xs text-rose-600 mb-4">Xóa toàn bộ điểm số đấu hạng xếp hạng CỦA TOÀN MÁY CHỦ để tái khởi động một Season mới.</p>
              
              {user?.role === 'admin' ? (
                <button 
                  onClick={handleResetLeaderboard}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex justify-center items-center gap-2"
                >
                  <AlertTriangle size={16} /> Tiết lộ Reset
                </button>
              ) : (
                <button disabled className="w-full py-2.5 bg-gray-300 text-gray-500 rounded-lg text-sm font-bold cursor-not-allowed">
                  Chỉ danh cho Admin
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
