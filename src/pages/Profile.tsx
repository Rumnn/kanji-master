import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface QuizRecord {
  _id: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
        const { data } = await axios.get('/api/history', config);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchHistory();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sakura-400 to-sakura-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {user?.fullName}
            </h1>
            <p className="text-gray-500 font-medium mt-1">{user?.email}</p>
            <div className="mt-3 px-3 py-1 bg-gray-100 inline-block rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
              {user?.role} student
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="bg-jade-100 text-jade-700 p-2 rounded-xl mr-3 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </span>
        Your Learning Journey
      </h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-200 border-t-sakura-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-3xl border border-gray-200 border-dashed p-12 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Quizzes Taken Yet</h3>
          <p className="text-gray-500">Go to the home page and start your first Kanji quiz to see your progress here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((record) => (
            <div key={record._id} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-white/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{record.quizName}</h4>
                <p className="text-sm text-gray-500 font-medium">
                  {new Date(record.createdAt).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Score</div>
                  <div className="text-2xl font-black text-gray-800">
                    <span className={record.score === record.totalQuestions ? 'text-jade-500' : 'text-sakura-500'}>
                      {record.score}
                    </span>
                    <span className="text-gray-300 mx-1">/</span>
                    {record.totalQuestions}
                  </div>
                </div>
                {/* Visual circle progress */}
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-gray-100 stroke-current" strokeWidth="4" cx="28" cy="28" r="24" fill="transparent"></circle>
                    <circle 
                      className={`${record.score === record.totalQuestions ? 'text-jade-500' : 'text-sakura-500'} stroke-current`} 
                      strokeWidth="4" 
                      strokeDasharray={150.7} 
                      strokeDashoffset={150.7 - (150.7 * record.score) / record.totalQuestions}
                      strokeLinecap="round" 
                      cx="28" cy="28" r="24" fill="transparent"
                    ></circle>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
