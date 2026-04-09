

interface Kanji {
  id: string
  _id: string
  kanji: string
  onyomi: string
  kunyomi: string
  meaning: string
  meaningVi: string
  examples: Array<{
    kana: string
    romaji: string
    meaning: string
    meaningVi: string
  }>
}

interface ResultModalProps {
  kanji: Kanji
  isCorrect: boolean
  targetKanji: Kanji
  onNext: () => void
}

export default function ResultModal({
  kanji,
  isCorrect,
  targetKanji,
  onNext,
}: ResultModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden transform animate-slide-in-up border border-white/50">
        
        {/* Header Ribbon */}
        <div
          className={`relative p-8 text-white text-center overflow-hidden ${
            isCorrect
              ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500'
          }`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="text-7xl font-black mb-4 drop-shadow-md">
              {isCorrect ? '✓' : '✗'}
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-sm">
              {isCorrect ? 'Outstanding!' : 'Not Quite Right'}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12">
          {/* Correction Section */}
          {!isCorrect && (
            <div className="mb-10 p-8 bg-amber-50/80 backdrop-blur-md rounded-3xl border border-amber-200 shadow-inner">
              <p className="text-amber-800 font-semibold mb-3 tracking-wide uppercase text-sm">The correct answer was:</p>
              <div className="text-7xl font-black text-center text-gray-800 jp-text mb-4 drop-shadow-sm">
                {targetKanji.kanji}
              </div>
              <p className="text-center text-xl text-amber-900 font-medium">
                {targetKanji.meaningVi} 
                <span className="mx-3 opacity-50">•</span> 
                {targetKanji.meaning}
              </p>
            </div>
          )}

          {/* Kanji Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-10 rounded-3xl flex flex-col items-center justify-center border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-sakura-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-8xl font-black text-gray-800 text-center jp-text mb-4 relative z-10 drop-shadow-sm">
                {kanji.kanji}
              </h3>
              <p className="text-center text-2xl text-sakura-600 font-bold relative z-10">
                {kanji.meaningVi}
              </p>
              <p className="text-center text-gray-500 font-medium relative z-10 mt-1">
                {kanji.meaning}
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-sakura-200 transition-colors">
                <p className="text-sm font-bold text-sakura-500 uppercase tracking-widest mb-2">Kunyomi (訓読み)</p>
                <p className="text-3xl font-bold text-gray-800 jp-text">
                  {kanji.kunyomi || "None"}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-jade-200 transition-colors">
                <p className="text-sm font-bold text-jade-500 uppercase tracking-widest mb-2">Onyomi (音読み)</p>
                <p className="text-3xl font-bold text-gray-800 jp-text">
                  {kanji.onyomi || "None"}
                </p>
              </div>
            </div>
          </div>

          {/* Vocabulary Grid */}
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <h4 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Example Words
              </h4>
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 font-medium jp-text">用例</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kanji.examples.map((example, index) => (
                <div key={index} className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-sakura-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <p className="jp-text text-3xl font-bold text-gray-800 group-hover:text-sakura-600 transition-colors">
                      {example.kana}
                    </p>
                  </div>
                  <p className="text-sakura-500 font-medium italic mb-3 tracking-wide">
                    {example.romaji}
                  </p>
                  <div className="flex flex-col gap-1 text-sm bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-800 font-medium">{example.meaningVi}</span>
                    <span className="text-gray-500">{example.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-gray-50/80 backdrop-blur-md flex justify-end gap-4 rounded-b-[3rem] border-t border-gray-200">
          <button
            onClick={onNext}
            className="px-10 py-5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-black hover:to-gray-800 transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-3"
          >
            Next Kanji <span className="text-2xl leading-none">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  )
}
