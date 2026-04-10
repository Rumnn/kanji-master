import { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Clock } from 'lucide-react';

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      const { data } = await axios.get('/api/admin/feedbacks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const stored = localStorage.getItem('userInfo');
      const token = stored ? JSON.parse(stored).token : null;
      await axios.put(`/api/admin/feedbacks/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="text-sakura-500" size={28} />
        <h1 className="text-2xl font-black text-gray-800">Quản lý Phản hồi & Báo lỗi</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải phản hồi...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Chưa có phản hồi nào từ người dùng.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb._id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-800">{fb.user?.fullName}</span>
                    <span className="text-xs text-gray-500 ml-2">({fb.user?.email})</span>
                  </div>
                  <select
                    value={fb.status}
                    onChange={(e) => updateStatus(fb._id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none
                      ${fb.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 
                        fb.status === 'reviewed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="reviewed">Đang xem xét</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="dismissed">Bỏ qua</option>
                  </select>
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded-md mr-2">
                    {fb.type}
                  </span>
                  {fb.kanji && <span className="jp-text font-bold bg-gray-200 px-2 py-1 rounded-md text-sm">Về chữ: {fb.kanji.kanji}</span>}
                </div>
                <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-100 text-sm mt-2">{fb.content}</p>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={12} /> {new Date(fb.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
