import { useContext, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Send, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

interface FeedbackReporterProps {
  itemType?: 'kanji' | 'it_vocab' | 'quiz_question' | 'general';
  itemKey?: string;
  compact?: boolean;
}

const FEEDBACK_TYPES = [
  { value: 'answer_error', label: 'Bao loi dap an' },
  { value: 'meaning_suggestion', label: 'Gop y nghia' },
  { value: 'example_suggestion', label: 'Gop y vi du' },
  { value: 'general_bug', label: 'Loi khac' },
];

export default function FeedbackReporter({ itemType = 'general', itemKey = '', compact = false }: FeedbackReporterProps) {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(FEEDBACK_TYPES[0].value);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submitFeedback = async () => {
    if (!content.trim() || saving) return;

    setSaving(true);
    setMessage('');
    try {
      await axios.post('/api/feedback', {
        type,
        content,
        itemType,
        itemKey,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setContent('');
      setMessage('Da gui feedback. Cam on ban!');
      setTimeout(() => setOpen(false), 900);
    } catch (error: unknown) {
      const text = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      setMessage(text || 'Khong the gui feedback.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition-colors ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
      >
        <AlertCircle size={compact ? 14 : 18} />
        Bao loi
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-amber-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="font-black text-gray-800 text-sm">Gui feedback {itemKey ? `cho ${itemKey}` : ''}</p>
        <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-700"
        >
          {FEEDBACK_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={submitFeedback}
          disabled={saving || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-black hover:bg-amber-600 disabled:opacity-50"
        >
          <Send size={16} />
          {saving ? 'Dang gui...' : 'Gui'}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
        placeholder="Mo ta dap an sai, nghia chua on, hoac vi du can sua..."
      />
      {message && <p className="text-xs font-bold text-gray-500 mt-2">{message}</p>}
    </div>
  );
}
