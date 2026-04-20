import { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { UploadCloud, Plus, AlertCircle, Search, TrendingDown } from 'lucide-react';

export default function CMSITVocab() {
  const { user } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState<'upload' | 'stats'>('upload');
  
  const [formData, setFormData] = useState({
    word: '', romaji: '', meaning: '', meaningVi: '', type: 'General IT',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats state
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchVocabStats();
    }
  }, [activeTab]);

  const fetchVocabStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await axios.get('/api/it-vocab');
      setVocabList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const reader = new FileReader();

    const processData = async (data: any[]) => {
      try {
        const formattedData = data.map((row: any) => ({
          word: row.word || row.Word || row.tuvung || row['Từ vựng'],
          romaji: row.romaji || row.Romaji || '',
          meaning: row.meaning || row.Meaning || '',
          meaningVi: row.meaningVi || row['Meaning (Vi)'] || row.MeaningVi || row['Nghĩa TV'] || '',
          type: row.type || row.Type || 'General IT'
        })).filter((v: any) => v.word && v.meaningVi); // basic validation

        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const response = await axios.post('/api/it-vocab/batch', { vocabs: formattedData }, config);
        setMessage({ type: 'success', text: response.data.message });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error: any) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving to database' });
      } finally {
        setUploading(false);
      }
    };

    reader.onload = async (evt) => {
      if (isCSV) {
        const text = evt.target?.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => processData(results.data),
          error: () => { setMessage({ type: 'error', text: 'Error parsing CSV file' }); setUploading(false); }
        });
      } else {
        try {
          const arrayBuffer = evt.target?.result as ArrayBuffer;
          const wb = XLSX.read(arrayBuffer, { type: 'array' });
          const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          processData(data);
        } catch (error) {
          setMessage({ type: 'error', text: 'Error parsing Excel file' });
          setUploading(false);
        }
      }
    };

    if (isCSV) reader.readAsText(file, "UTF-8");
    else reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/it-vocab', formData, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMessage({ type: 'success', text: 'Thêm từ vựng IT thủ công thành công!' });
      setFormData({ word: '', romaji: '', meaning: '', meaningVi: '', type: 'General IT' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error adding vocabulary' });
    } finally {
      setLoading(false);
    }
  };

  const getFailureRate = (stats: any) => {
    if (!stats || stats.timesAppeared === 0) return 0;
    return ((stats.timesIncorrect / stats.timesAppeared) * 100).toFixed(1);
  };

  const filteredVocab = vocabList
    .filter(v => 
      v.word.includes(search) || 
      v.meaningVi.toLowerCase().includes(search.toLowerCase()) ||
      v.romaji.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => Number(getFailureRate(b.stats)) - Number(getFailureRate(a.stats))); // Sort hardest first

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-black text-gray-800 mb-6">Quản trị Từ vựng IT (IT Vocab CMS)</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3 px-6 font-bold text-sm tracking-wide transition-colors border-b-2 ${
            activeTab === 'upload' ? 'border-sakura-500 text-sakura-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Nhập Dữ liệu (Bulk / Manual)
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3 px-6 font-bold text-sm tracking-wide transition-colors border-b-2 ${
            activeTab === 'stats' ? 'border-sakura-500 text-sakura-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Thống kê Độ khó
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${message.type === 'success' ? 'bg-jade-50 text-jade-700 border-jade-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {message.text}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
            <div>
               <h2 className="text-xl font-bold text-gray-800">Cập nhật hàng loạt (Excel/CSV)</h2>
               <p className="text-xs text-gray-500 mt-1">Cột bắt buộc: word, meaningVi</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="file" accept=".csv, .xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center disabled:opacity-50"
              >
                <UploadCloud size={18} className="mr-2"/>
                {uploading ? 'Processing...' : 'Upload Excel / CSV'}
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mt-10 mb-6">Thêm tay (Manual Entry)</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Từ vựng (Tiếng Nhật) *</label>
                <input type="text" required value={formData.word} onChange={e => setFormData({...formData, word: e.target.value})} className="w-full px-4 py-3 text-xl rounded-xl bg-gray-50 border border-gray-200 focus:border-sakura-300 focus:ring focus:ring-sakura-100 jp-text" placeholder="開発" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Romaji</label>
                <input type="text" value={formData.romaji} onChange={e => setFormData({...formData, romaji: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-700" placeholder="kaihatsu" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nghĩa Tiếng Anh *</label>
                <input type="text" required value={formData.meaning} onChange={e => setFormData({...formData, meaning: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" placeholder="development" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nghĩa Tiếng Việt *</label>
                <input type="text" required value={formData.meaningVi} onChange={e => setFormData({...formData, meaningVi: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200" placeholder="phát triển" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 px-6 rounded-xl font-black text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md hover:shadow-lg disabled:opacity-70 transition-all uppercase items-center justify-center flex">
              <Plus className="mr-2" /> {loading ? 'Processing...' : 'Lưu vào Database'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingDown className="text-rose-500" /> Bảng xếp hạng Từ vựng IT khó
              </h2>
              <p className="text-xs text-gray-500 mt-1">Dựa trên tỷ lệ trả lời sai khi người dùng làm trắc nghiệm</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Tìm từ, ý nghĩa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full sm:w-56" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="p-4 pl-6">Từ Vựng</th>
                  <th className="p-4">Ý nghĩa</th>
                  <th className="p-4 text-center">Số CHT</th>
                  <th className="p-4 text-center text-emerald-600">Đúng</th>
                  <th className="p-4 text-center text-rose-600">Sai</th>
                  <th className="p-4 text-right pr-6">Tỷ lệ sai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingStats ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải...</td></tr>
                ) : filteredVocab.map((v) => {
                  const numFails = v.stats?.timesIncorrect || 0;
                  const rate = Number(getFailureRate(v.stats));
                  const isHard = rate >= 50 && (v.stats?.timesAppeared || 0) > 5;

                  return (
                    <tr key={v._id} className={`hover:bg-gray-50/50 transition-colors ${isHard ? 'bg-rose-50/30' : ''}`}>
                      <td className="p-4 pl-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xl font-black text-gray-800 jp-text">{v.word}</span>
                          <span className="text-xs text-gray-500 font-medium">{v.romaji}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800 text-sm">{v.meaningVi}</div>
                        <div className="text-xs text-gray-500">{v.meaning}</div>
                      </td>
                      <td className="p-4 text-center text-sm font-bold text-gray-600">{v.stats?.timesAppeared || 0}</td>
                      <td className="p-4 text-center text-sm font-bold text-emerald-600">{v.stats?.timesCorrect || 0}</td>
                      <td className="p-4 text-center text-sm font-bold text-rose-600">{numFails}</td>
                      <td className="p-4 text-right pr-6">
                        <span className={`inline-flex items-center gap-1 font-black text-sm px-2 py-1 rounded-lg ${
                          rate >= 50 ? 'bg-rose-100 text-rose-700' : rate >= 30 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isHard && <AlertCircle size={14} />}
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
