import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Brain, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

interface ReviewItem {
  _id: string;
  itemType: 'kanji' | 'it_vocab' | 'grammar' | 'jlpt_vocab';
  itemKey: string;
  label: string;
  level?: string;
  category?: string;
  attempts: number;
  correct: number;
  incorrect: number;
  mastery: number;
}

export default function ReviewToday() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(0);
  const [remembered, setRemembered] = useState(0);

  const currentItem = items[currentIndex];
  const itemTypeLabel = (itemType: ReviewItem['itemType']) => {
    if (itemType === 'kanji') return 'Kanji';
    if (itemType === 'grammar') return 'Ngữ pháp';
    if (itemType === 'jlpt_vocab') return 'Từ vựng JLPT';
    return 'IT Vocab';
  };

  useEffect(() => {
    const fetchDueItems = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('/api/progress/due?limit=20', config);
        setItems(data);
      } catch (err: unknown) {
        const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
        setError(message || 'Khong the tai danh sach on tap.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDueItems();
    }
  }, [user]);

  const progressPercent = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round((completed / items.length) * 100);
  }, [completed, items.length]);

  const submitReview = async (isCorrect: boolean) => {
    if (!currentItem || saving) return;

    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put('/api/progress/batch', {
        items: [{
          itemType: currentItem.itemType,
          itemKey: currentItem.itemKey,
          label: currentItem.label,
          level: currentItem.level || '',
          category: currentItem.category || '',
          correct: isCorrect
        }]
      }, config);

      setCompleted((value) => value + 1);
      if (isCorrect) setRemembered((value) => value + 1);

      if (currentIndex < items.length - 1) {
        setCurrentIndex((value) => value + 1);
        setRevealed(false);
      } else {
        setCurrentIndex(items.length);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || 'Khong the luu ket qua on tap.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-200 border-t-sakura-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center bg-white/80 border border-white rounded-3xl p-10 shadow-sm">
        <div className="text-4xl font-black text-rose-500 mb-3">!</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Co loi xay ra</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
        >
          Quay lai Profile
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white/80 border border-white rounded-3xl p-12 shadow-sm animate-fade-in-up">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-jade-50 text-jade-500 flex items-center justify-center mb-6">
          <CheckCircle2 size={42} />
        </div>
        <h1 className="text-3xl font-black text-gray-800 mb-3">Hom nay chua co muc can on</h1>
        <p className="text-gray-500 mb-8">
          Hay lam them mot vai bai quiz. Cac muc sai hoac moi hoc se tu dong xuat hien o day theo lich on tap.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate('/quiz/mcq')}
            className="px-6 py-3 rounded-xl bg-sakura-500 text-white font-bold hover:bg-sakura-600 transition-colors"
          >
            Lam quiz Kanji
          </button>
          <button
            onClick={() => navigate('/quiz/grammar')}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
          >
            Ôn ngữ pháp
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 rounded-xl bg-white text-gray-700 font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Xem Profile
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    const scorePercent = items.length > 0 ? Math.round((remembered / items.length) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto bg-white/80 border border-white rounded-3xl p-12 shadow-sm text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
          <Brain size={42} />
        </div>
        <h1 className="text-4xl font-black text-gray-800 mb-3">Da on xong</h1>
        <p className="text-gray-500 mb-8">
          Ban nho duoc <span className="font-black text-emerald-600">{remembered}/{items.length}</span> muc trong phien nay.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
            <p className="text-3xl font-black text-emerald-500">{scorePercent}%</p>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Da nho</p>
          </div>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
            <p className="text-3xl font-black text-amber-500">{items.length - remembered}</p>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Can on lai</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 rounded-xl bg-sakura-500 text-white font-bold hover:bg-sakura-600 transition-colors"
          >
            Ve Profile
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-white text-gray-700 font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Trang chu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 text-gray-600 font-bold border border-white hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} />
          Profile
        </button>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tien do</p>
          <p className="text-xl font-black text-gray-800">{completed}/{items.length}</p>
        </div>
      </div>

      <div className="h-3 bg-white/80 rounded-full overflow-hidden mb-8 border border-white">
        <div
          className="h-full bg-gradient-to-r from-sakura-500 to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="bg-white/85 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl p-8 sm:p-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest">
            {itemTypeLabel(currentItem.itemType)}
          </span>
          {(currentItem.level || currentItem.category) && (
            <span className="px-3 py-1 rounded-full bg-sakura-50 text-sakura-600 text-xs font-black uppercase tracking-widest">
              {currentItem.level || currentItem.category}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest">
            Mastery {currentItem.mastery}/5
          </span>
        </div>

        <div className="min-h-52 flex flex-col items-center justify-center">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Ban co nho muc nay khong?
          </p>
          <div className="text-7xl sm:text-8xl font-black text-gray-800 jp-text mb-6">
            {currentItem.label}
          </div>
          {revealed ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 w-full text-left">
              <p className="text-sm text-gray-500 mb-2">
                Muc on tap: <span className="font-bold text-gray-700">{currentItem.label}</span>
              </p>
              <p className="text-xs text-gray-400">
                Da gap {currentItem.attempts} lan, dung {currentItem.correct}, sai {currentItem.incorrect}. Hay tu danh dau theo muc do ban vua nho duoc.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={18} />
              Lat the
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => submitReview(false)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-black hover:bg-rose-100 transition-colors disabled:opacity-60"
          >
            <XCircle size={22} />
            Chua nho
          </button>
          <button
            onClick={() => submitReview(true)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black hover:bg-emerald-100 transition-colors disabled:opacity-60"
          >
            <CheckCircle2 size={22} />
            Da nho
          </button>
        </div>
      </div>
    </div>
  );
}
