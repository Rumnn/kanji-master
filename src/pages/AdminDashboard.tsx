import { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    kanji: '',
    level: 'N5',
    onyomi: '',
    kunyomi: '',
    meaning: '',
    meaningVi: '',
  });

  const [examples, setExamples] = useState([{ kana: '', romaji: '', meaning: '', meaningVi: '' }]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          kanji: row.kanji || row.Kanji,
          level: row.level || row.Level || 'N5',
          onyomi: row.onyomi || row.Onyomi || '',
          kunyomi: row.kunyomi || row.Kunyomi || '',
          meaning: row.meaning || row.Meaning || '',
          meaningVi: row.meaningVi || row['Meaning (Vi)'] || row.MeaningVi || '',
          examples: []
        }));

        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const response = await axios.post('/api/kanji/batch', { kanjis: formattedData }, config);
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
          complete: (results) => {
            processData(results.data);
          },
          error: (_error: any) => {
            setMessage({ type: 'error', text: 'Error parsing CSV file' });
            setUploading(false);
          }
        });
      } else {
        try {
          const arrayBuffer = evt.target?.result as ArrayBuffer;
          const wb = XLSX.read(arrayBuffer, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processData(data);
        } catch (error) {
          setMessage({ type: 'error', text: 'Error parsing Excel file' });
          setUploading(false);
        }
      }
    };

    if (isCSV) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExampleChange = (index: number, field: string, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  const addExample = () => {
    setExamples([...examples, { kana: '', romaji: '', meaning: '', meaningVi: '' }]);
  };

  const removeExample = (index: number) => {
    const newExamples = [...examples];
    newExamples.splice(index, 1);
    setExamples(newExamples);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      await axios.post('/api/kanji', { ...formData, examples }, config);
      setMessage({ type: 'success', text: 'Kanji added successfully to the database!' });
      
      // Reset form
      setFormData({
        kanji: '', level: 'N5', onyomi: '', kunyomi: '', meaning: '', meaningVi: ''
      });
      setExamples([{ kana: '', romaji: '', meaning: '', meaningVi: '' }]);
      
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error adding Kanji' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-jade-100 text-jade-700 rounded-2xl shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Manage Kanji Database</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800">
            Add New Kanji Entry
          </h2>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              {uploading ? 'Processing...' : 'Upload Excel / CSV'}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold border ${message.type === 'success' ? 'bg-jade-50 text-jade-700 border-jade-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kanji Character *</label>
              <input type="text" required value={formData.kanji} onChange={e => setFormData({...formData, kanji: e.target.value})} className="w-full px-4 py-3 text-2xl text-center rounded-xl bg-gray-50 border border-gray-200 focus:border-jade-400 focus:ring focus:ring-jade-200 focus:ring-opacity-50 transition-all jp-text" placeholder="e.g. 火" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">JLPT Level *</label>
              <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-jade-400 focus:ring focus:ring-jade-200 focus:ring-opacity-50 font-bold text-gray-700 h-full cursor-pointer">
                <option value="N5">N5 (Beginner)</option>
                <option value="N4">N4 (Intermediate)</option>
                <option value="N3">N3 (Advanced)</option>
                <option value="N2">N2 (Upper Advanced)</option>
                <option value="N1">N1 (Master)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Onyomi (Katakana)</label>
              <input type="text" value={formData.onyomi} onChange={e => setFormData({...formData, onyomi: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-jade-400 focus:ring focus:ring-jade-200 focus:ring-opacity-50 jp-text" placeholder="e.g. カ" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kunyomi (Hiragana)</label>
              <input type="text" value={formData.kunyomi} onChange={e => setFormData({...formData, kunyomi: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-jade-400 focus:ring focus:ring-jade-200 focus:ring-opacity-50 jp-text" placeholder="e.g. ひ" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meaning (English) *</label>
              <input type="text" required value={formData.meaning} onChange={e => setFormData({...formData, meaning: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-jade-400 focus:ring focus:ring-jade-200 focus:ring-opacity-50" placeholder="e.g. fire" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meaning (Vietnamese) *</label>
              <input type="text" required value={formData.meaningVi} onChange={e => setFormData({...formData, meaningVi: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-jade-400 focus:ring focus:ring-jade-200 focus:ring-opacity-50" placeholder="e.g. lửa" />
            </div>
          </div>

          {/* Examples Section */}
          <div className="mt-8">
            <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-800">Examples & Compounds</h3>
              <button type="button" onClick={addExample} className="text-sm font-bold text-jade-600 hover:text-jade-700 bg-jade-50 px-3 py-1.5 rounded-lg flex items-center transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Add Example
              </button>
            </div>

            <div className="space-y-4">
              {examples.map((example, index) => (
                <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 relative group">
                  {examples.length > 1 && (
                    <button type="button" onClick={() => removeExample(index)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Kana/Kanji *</label>
                      <input type="text" required value={example.kana} onChange={e => handleExampleChange(index, 'kana', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm jp-text" placeholder="e.g. 火事" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Romaji</label>
                      <input type="text" value={example.romaji} onChange={e => handleExampleChange(index, 'romaji', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="e.g. kaji" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Meaning (End) *</label>
                      <input type="text" required value={example.meaning} onChange={e => handleExampleChange(index, 'meaning', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="e.g. fire" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Meaning (Vi) *</label>
                      <input type="text" required value={example.meaningVi} onChange={e => handleExampleChange(index, 'meaningVi', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="e.g. hỏa hoạn" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-black text-white bg-gradient-to-r from-jade-500 to-jade-600 hover:shadow-jade-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider">
              {loading ? 'Processing...' : 'Save to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
