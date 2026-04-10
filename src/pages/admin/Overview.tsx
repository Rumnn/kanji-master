import { useEffect, useState } from 'react';
import axios from 'axios';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Users, BookA, Swords } from 'lucide-react';

export default function Overview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/admin/analytics', config);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Đang tải dữ liệu tổng quan...</div>;

  const statCards = [
    { title: 'Tổng người dùng', value: data?.summary?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Lượng Kanji', value: data?.summary?.totalKanji || 0, icon: BookA, color: 'text-jade-500', bg: 'bg-jade-100' },
    { title: 'Số trận đấu / Quiz', value: data?.summary?.totalMatches || 0, icon: Swords, color: 'text-rose-500', bg: 'bg-rose-100' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-black text-gray-800 mb-8">Tổng quan Hệ thống</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-black text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Tăng trưởng Người dùng (7 Ngày)</h2>
        <div className="h-80 w-full">
          {data?.usersByDate && data.usersByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.usersByDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#f472b6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 font-medium">
              Chưa có dữ liệu đăng ký trong 7 ngày qua.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
