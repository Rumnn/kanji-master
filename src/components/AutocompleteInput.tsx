import { useState, useEffect } from 'react'
import * as wanakana from 'wanakana'

interface Kanji {
  id: string
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

interface AutocompleteInputProps {
  kanjiList: Kanji[]
  currentKanji: Kanji
  onSelect: (kanji: Kanji) => void
}

export default function AutocompleteInput({
  kanjiList,
  currentKanji: _currentKanji, // unused but kept for interface compliance
  onSelect,
}: AutocompleteInputProps) {
  const [input, setInput] = useState('')
  const [hiragana, setHiragana] = useState('')
  const [suggestions, setSuggestions] = useState<Kanji[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Convert Romaji to Hiragana
  useEffect(() => {
    if (input.length > 0) {
      const converted = wanakana.toHiragana(input)
      setHiragana(converted)

      // Find matching Kanji based on kunyomi
      const matches = kanjiList.filter((kanji) => {
        const kunyomiHira = wanakana.toHiragana(kanji.kunyomi.replace('ご.', '').replace('え.', '').replace('あ.', '').replace('い.', '').replace('う.', '').replace('お.', '').replace('.', ''))
        const onyomiHira = wanakana.toHiragana(kanji.onyomi.toLowerCase())
        return kunyomiHira.includes(converted) || onyomiHira.includes(converted)
      })

      setSuggestions(matches.length > 0 ? matches : [])
      setShowSuggestions(matches.length > 0)
      setSelectedIndex(-1)
    } else {
      setHiragana('')
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }, [input, kanjiList])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  const handleSelectSuggestion = (kanji: Kanji) => {
    onSelect(kanji)
    setInput('')
    setHiragana('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20">
      <div className="mb-6">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input.length > 0 && setShowSuggestions(true)}
            placeholder="Type in romaji (e.g., taberu, nomu)..."
            className="w-full px-8 py-5 text-xl font-medium text-gray-800 bg-white/90 backdrop-blur-xl border-2 border-gray-200 rounded-3xl shadow-lg focus:outline-none focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 transition-all duration-300 placeholder-gray-400"
            autoComplete="off"
            spellCheck="false"
          />
          {hiragana && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-sakura-50/80 rounded-2xl border border-sakura-100 shadow-sm backdrop-blur-md">
              <span className="jp-text text-xl font-bold text-sakura-600">{hiragana}</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform animate-fade-in-up z-50">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {suggestions.length} Match{suggestions.length !== 1 ? 'es' : ''} Found
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto w-full p-2 space-y-1">
            {suggestions.map((kanji, index) => (
              <button
                key={kanji.id}
                onClick={() => handleSelectSuggestion(kanji)}
                className={`w-full px-6 py-4 text-left rounded-2xl transition-all duration-200 group flex items-center gap-6 ${
                  index === selectedIndex
                    ? 'bg-sakura-50 border-l-4 border-l-sakura-500 shadow-sm'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="text-5xl font-black text-gray-800 jp-text group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                  {kanji.kanji}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-lg font-bold text-sakura-600 mb-1">
                    {kanji.meaningVi}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">Kun: {kanji.kunyomi || '-'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">On: {kanji.onyomi || '-'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {input && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 mt-4 p-6 bg-white/95 backdrop-blur-2xl rounded-3xl border border-rose-100 shadow-2xl z-50 animate-fade-in-up flex items-center justify-center gap-3">
          <span className="text-2xl">🤔</span>
          <p className="text-rose-600 font-bold text-lg">
            No kanji found for "{hiragana || input}"
          </p>
        </div>
      )}
    </div>
  )
}
