# Kanji Master Quiz - JLPT N5-N3

A modern, interactive web application for learning Japanese Kanji (漢字) through intelligent quizzes. Master JLPT levels N5-N3 by typing Romaji, which converts to Hiragana/Katakana in real-time with autocomplete suggestions.

## 🎌 Features

### Core Gameplay
- **JLPT Level Selection**: Choose N5 (Beginner), N4 (Intermediate), or N3 (Advanced)
- **Real-time Romaji Conversion**: Type romanized Japanese → instant conversion to Hiragana/Katakana
- **Smart Autocomplete**: Displays Kanji suggestions matching your input
- **Detailed Learning**: After selection, view complete Kanji information including:
  - Onyomi (音読み) - Sino-Japanese reading
  - Kunyomi (訓読み) - Native Japanese reading  
  - Meanings (English & Vietnamese)
  - Example compound words with translations
- **Progress Tracking**: Visual progress bar and real-time score
- **Beautiful UI**: Minimalist design inspired by Japanese aesthetics with Sakura pink and Jade green themes
- **Mobile Responsive**: Fully responsive on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation & Running

```bash
# Navigate to project
cd kanji-master

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
kanji-master/
├── src/
│   ├── components/
│   │   ├── LevelSelectScreen.tsx    # Level selection interface
│   │   ├── QuizGame.tsx             # Main quiz logic and orchestration
│   │   ├── AutocompleteInput.tsx    # Romaji input with suggestions
│   │   ├── ResultModal.tsx          # Detailed result & info display
│   │   └── ProgressBar.tsx          # Quiz progress indicator
│   ├── data/
│   │   └── kanjiData.json           # Kanji database (extensible)
│   ├── App.tsx                      # Main application component
│   ├── App.css                      # Application styles
│   ├── index.css                    # Tailwind + global styles
│   └── main.tsx                     # Entry point
├── public/                          # Static assets
├── tailwind.config.js               # Tailwind CSS config with custom colors
├── postcss.config.js                # PostCSS with Tailwind & Autoprefixer
├── vite.config.ts                   # Vite configuration
└── package.json                     # Dependencies & scripts
```

## 📚 Data Structure & Schema

Kanji data is stored in `src/data/kanjiData.json` with hierarchical organization:

### JSON Structure Example
```json
{
  "N5": [
    {
      "id": "n5_001",
      "kanji": "食",
      "onyomi": "ショク",
      "kunyomi": "た.べる",
      "meaning": "to eat",
      "meaningVi": "ăn",
      "examples": [
        {
          "kana": "食べる",
          "meaning": "to eat",
          "meaningVi": "ăn"
        },
        {
          "kana": "朝食",
          "meaning": "breakfast",
          "meaningVi": "bữa sáng"
        },
        {
          "kana": "夕食",
          "meaning": "dinner",
          "meaningVi": "bữa tối"
        }
      ]
    }
  ],
  "N4": [...],
  "N3": [...]
}
```

### Field Reference
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **id** | String | Unique identifier | `"n5_001"` |
| **kanji** | String | The Kanji character | `"食"` |
| **onyomi** | String | Chinese-derived reading (Katakana) | `"ショク"` |
| **kunyomi** | String | Native reading with dot notation | `"た.べる"` |
| **meaning** | String | English translation | `"to eat"` |
| **meaningVi** | String | Vietnamese translation | `"ăn"` |
| **examples** | Array | Compound words using this Kanji | See structure below |

### Example Object Structure
```javascript
{
  "kana": "朝食",      // Word in Hiragana/Kanji
  "meaning": "breakfast",        // English meaning
  "meaningVi": "bữa sáng"        // Vietnamese meaning
}
```

## 🔧 Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8 (ultra-fast bundling)
- **Styling**: Tailwind CSS 4 + Custom colors
- **Japanese Processing**: Wanakana library (Romaji ↔ Kana conversion)
- **CSS Processing**: PostCSS with Autoprefixer

### Key Dependencies
```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "wanakana": "^5.3.0",
  "tailwindcss": "^4.0.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

## 🎮 Gameplay Instructions

1. **Select Difficulty**: Click N5, N4, or N3 card on start screen
2. **View Kanji**: See the character and its meaning (Vietnamese/English)
3. **Type Romaji**: Enter the pronunciation in Romaji format
   - Example: type `taberu` for 食べる
4. **See Suggestions**: System shows matching Kanji as you type
5. **Select Answer**: Click the correct Kanji from suggestions
6. **Review Details**: Learn Onyomi, Kunyomi, examples, and meanings
7. **Continue**: Click "Next Kanji →" to proceed
8. **Finish**: View final score after completing all Kanji

### Keyboard Shortcuts
- **↓ Arrow Down**: Next suggestion
- **↑ Arrow Up**: Previous suggestion
- **Enter**: Select highlighted suggestion
- **Escape**: Close suggestions

## 📈 Scaling to Thousands of Kanji

### Strategy 1: Static JSON Expansion (Current Approach)
**Best for:** < 5,000 Kanji

```json
{
  "N5": [/* ~300 Kanji */],
  "N4": [/* ~500 Kanji */],
  "N3": [/* ~600 Kanji */]
}
```

**Instructions:**
1. Add entries following the same structure
2. Maintain consistent ID format: `{level}_{number}`
3. Use standard Hiragana for kunyomi (no uppercase needed)

### Strategy 2: Backend API Integration
**Best for:** > 5,000 Kanji or dynamic updates

Create a backend endpoint:
```typescript
// src/hooks/useFetchKanji.ts
const [kanji, setKanji] = useState([])

useEffect(() => {
  fetch(`/api/kanji/${level}?limit=50`)
    .then(res => res.json())
    .then(data => setKanji(data))
}, [level])
```

### Strategy 3: Integrate External APIs

#### KanjiAlive API
```typescript
const response = await fetch(`https://api.kanjialive.com/api/public/kanji/${kanji}`)
const kanjiData = await response.json()
// Returns: { character, onyomi, kunyomi, radicals, examples[] }
```

#### Jisho.org API
```typescript
const response = await fetch(`https://jisho.org/api/v1/search/kanji?keyword=食`)
const data = await response.json()
// Returns comprehensive dictionary data
```

#### WANIKANI API
```typescript
// Premium but comprehensive Kanji teaching system
const response = await fetch(`https://api.wanikani.com/v2/kanji`, {
  headers: { 'Authorization': `Bearer ${apiKey}` }
})
```

### Database Schema (for Backend)
```javascript
// MongoDB/Firebase example
{
  "_id": ObjectId,
  "kanji": "食",
  "readings": {
    "onyomi": "ショク",
    "kunyomi": "た.べる"
  },
  "meanings": {
    "en": "to eat, food",
    "vi": "ăn, thức ăn"
  },
  "jlptLevel": 5,
  "examples": [
    {
      "kanji": "食べる",
      "kana": "たべる",
      "meaning": { "en": "to eat", "vi": "ăn" },
      "frequency": 1
    }
  ],
  "strokes": 9,
  "radicals": ["食"],
  "tags": ["food", "consume"],
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

### Performance Best Practices
- **Lazy Loading**: Load Kanji by level on demand
- **Pagination**: Fetch 50-100 Kanji at a time
- **Caching**: Store fetched data in localStorage or state
- **Indexing**: Database indexes on `jlptLevel` & `kanji`
- **Compression**: Gzip responses for API calls

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      sakura: {
        500: '#FF69B4',  // Your color
      },
      jade: {
        500: '#00B894',  // Your color
      }
    }
  }
}
```

### Customize Fonts
Edit `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
```

### Modify Quiz Settings
Edit `src/components/QuizGame.tsx`:
- Change Kanji count per quiz
- Adjust scoring system
- Add practice modes

## 📝 Adding New Kanji

1. Open `src/data/kanjiData.json`
2. Add to appropriate level array:

```json
{
  "id": "n3_006",
  "kanji": "突",
  "onyomi": "トツ",
  "kunyomi": "つ.く",
  "meaning": "thrust, suddenly",
  "meaningVi": "đâm, đột ngột",
  "examples": [
    { "kana": "突く", "meaning": "to thrust", "meaningVi": "đâm" },
    { "kana": "突然", "meaning": "suddenly", "meaningVi": "đột ngột" }
  ]
}
```

## 🌐 Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+  
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Scripts

```bash
npm run dev      # Start dev server on localhost:5173
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## 💡 Tips for Effective Learning

1. **Daily Practice**: Study 5-10 Kanji daily
2. **Write it Down**: Physically write characters to improve retention
3. **Use Examples**: Focus on example words to learn context
4. **Spaced Repetition**: Revisit Kanji you struggle with
5. **Set Goals**: Aim to complete one level per week

## 🏗️ Architecture Notes

### Component Hierarchy
```
App
├── LevelSelectScreen
└── QuizGame
    ├── ProgressBar
    ├── AutocompleteInput (handles Wanakana conversion)
    └── ResultModal (shows detailed Info)
```

### State Management
- Quiz progress and current question index
- User score
- Selected Kanji for comparison
- Game completion state

### Wanakana Integration
The `AutocompleteInput` component uses Wanakana to:
1. Convert Romaji → Hiragana in real-time
2. Match input against Kanji kunyomi/onyomi readings
3. Filter and suggest matching characters

## 🧪 Development Tips

**Hot Module Replacement (HMR)**: Changes to components reflect instantly without page reload

**TypeScript Safety**: All components are fully typed for better development experience

**Responsive Design**: Test on mobile by opening DevTools and toggling device mode

## 📄 License
MIT License - Free for personal and educational use

## 🙏 Acknowledgments
- **Wanakana**: For Romaji/Kana conversion
- **Tailwind CSS**: For beautiful utility-first styling
- **React Team**: For the amazing frontend framework
- **JLPT Community**: For standardized Kanji levels

---

**学習頑張ってください！ (Ganbatte kudasai!) - Good luck with your studies!** 

Made with ❤️ for Japanese learners worldwide
