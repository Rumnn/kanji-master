# Kanji Master Quiz - Cẩm nang Kiến trúc & Triển khai

**Phiên bản**: v2.0.0 (Multi-page với Authentication)  
**Ngày cập nhật**: 22 Tháng 3, 2026

## 📋 Tổng quan Dự án

Tài liệu này cung cấp hướng dẫn chi tiết về cấu trúc của ứng dụng **Kanji Master Quiz v2.0**, một ứng dụng web nhiều trang (multi-page) với hệ thống xác thực, quản lý người dùng, và bảng điều khiển quản trị viên.

## 🏗️ Kiến trúc Hệ thống Mới (v2.0)

### Sơ đồ Kiến trúc Tổng Thể
```
┌─────────────────────────────────────────────────────┐
│                    React App                         │
│              (with React Router v7)                  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐          ┌────▼──────────┐
   │ AuthFlow │          │  PublicFlow   │
   └────┬─────┘          └────┬──────────┘
        │                     │
    [Login]               [Home Page]
    ↓  ↓  ↓
[Register] → [AuthContext with JWT]
    ↓
[Protected Routes]
    ├── [Profile]
    ├── [QuizPlay]
    └── [AdminDashboard] ← Role-based access
```

### Luồng Hoạt động Người Dùng (User Flow)

#### Người dùng Mới (New User)
```
[HomePage] → [Register] → [AuthContext saves token] → [QuizPlay]
```

#### Người dùng Hiện tại (Existing User)
```
[HomePage] → [Login] → [AuthContext restores user] → [HomePage/QuizPlay]
```

#### Luồng Quiz Chi Tiết
```
[QuizPlay]
    ↓
[LevelSelectScreen] - Chọn N5, N4, hoặc N3
    ↓
[QuizGame] - Trình điều phối trò chơi chính
    ├── [ProgressBar] - Hiển thị tiến độ hiện tại
    ├── [AutocompleteInput] - Xử lý Romaji và ghép Kanji
    └── [ResultModal] - Hiển thị kết quả & thông tin chi tiết
    ↓
[Màn hình Điểm Số] - Hiển thị kết quả tổng và thống kê
    ↓
[Lưu vào Database qua API]
```

## � Hệ thống Xác thực (Authentication)

### AuthContext (`src/context/AuthContext.tsx`)

**Mục đích**: Quản lý trạng thái người dùng toàn bộ ứng dụng

**Dữ liệu người dùng (User Data)**:
```typescript
interface User {
  _id: string                    // ID từ MongoDB
  fullName: string               // Tên đầy đủ
  email: string                  // Email
  role: string                   // "user" hoặc "admin"
  token: string                  // JWT token
}
```

**Các phương thức chính**:
- `login(userData)` - Lưu người dùng khi đăng nhập
- `logout()` - Xoá người dùng, xoá localStorage
- `isLoading` - Trạng thái đang tải dữ liệu

**Cách sử dụng**:
```typescript
const { user, login, logout, isLoading } = useContext(AuthContext)

// Kiểm tra nếu người dùng đã đăng nhập
if (user?.role === 'admin') {
  // Hiển thị Admin Panel
}
```

---

## 📄 Các Page Mới (Pages)

### 1. Home.tsx (`src/pages/Home.tsx`)
**Mục đích**: Trang chủ ứng dụng

**Nội dung**:
- Giới thiệu về ứng dụng
- Nút "Register" / "Login" (nếu chưa đăng nhập)
- Nút "Play Quiz" (nếu đã đăng nhập)
- Hiển thị thống kê người dùng

**Điều kiện**:
```typescript
if (!user) {
  // Hiển thị nút Login/Register
} else {
  // Hiển thị nút Play Quiz
}
```

### 2. Login.tsx (`src/pages/Login.tsx`)
**Mục đích**: Trang đăng nhập

**Fields**:
- Email
- Password

**Luồng xử lý**:
1. Người dùng nhập email + password
2. Gửi request lên backend via Axios
3. Lấy JWT token từ API response
4. Lưu vào AuthContext
5. Chuyển hướng đến HomePage hoặc Quiz

### 3. Register.tsx (`src/pages/Register.tsx`)
**Mục đích**: Trang đăng ký tài khoản

**Fields**:
- Full Name
- Email
- Password
- Password Confirmation

**Validation**:
- Email phải hợp lệ (regex)
- Password >= 6 ký tự
- Mật khẩu phải khớp nhau
- Email không được trùng

### 4. Profile.tsx (`src/pages/Profile.tsx`)
**Mục đích**: Hồ sơ người dùng cá nhân

**Thông tin hiển thị**:
- Tên người dùng
- Email
- Ngày tham gia
- Điểm cao nhất
- Số lần chơi
- Tỉ lệ thành công
- Lịch sử quiz (danh sách bài kiểm tra đã làm)

**Chức năng**:
- [ ] Thay đổi thông tin cá nhân
- [ ] Xuất điểm sang Excel
- [ ] Xem chi tiết từng lần chơi

### 5. QuizPlay.tsx (`src/pages/QuizPlay.tsx`)
**Mục đích**: Trang chơi quiz (tích hợp components cũ)

**Cấu trúc**:
```
[Navigation Navbar]
    ↓
[QuizGame] - Sử dụng các component cũ:
    ├── LevelSelectScreen
    ├── QuizGame
    ├── AutocompleteInput
    ├── ResultModal
    └── ProgressBar
    ↓
[Lưu kết quả qua API]
```

**Khác biệt từ v1**:
- Yêu cầu đăng nhập trước khi chơi
- Lưu kết quả vào database của người dùng
- Theo dõi thống kê cá nhân

### 6. AdminDashboard.tsx (`src/pages/AdminDashboard.tsx`)
**Mục đích**: Bảng điều khiển cho quản trị viên

**Tính năng**:
- Import Kanji từ file Excel/CSV
- Xem thống kê người dùng
- Xem danh sách người dùng
- Xem thống kê quiz (Tổng lần chơi, tỉ lệ hoàn thành)
- Quản lý vai trò người dùng (Promote/Demote)

**Bảo vệ vai trò**:
```typescript
if (user?.role !== 'admin') {
  return <Navigate to="/" />  // Chuyển hướng nếu không phải admin
}
```

---

## �🔄 Chi tiết Thành phần

### 1. LevelSelectScreen (`src/components/LevelSelectScreen.tsx`)
**Mục đích**: Giao diện UI ban đầu để người dùng chọn cấp độ JLPT

**Tính năng**:
- Ba thẻ tương tác (N5, N4, N3)
- Hiệu ứng hover mượt mà
- Hướng dẫn cho người dùng mới
- Mã hóa màu sắc theo độ khó

**Trạng thái (State)**: Không có (chỉ là component trình bày)

**Props**:
```typescript
onLevelSelect: (level: 'N5' | 'N4' | 'N3') => void
```

---

### 2. QuizGame (`src/components/QuizGame.tsx`)
**Mục đích**: Điều phối chính và chứa logic cốt lõi của bài quiz

**Nhiệm vụ**:
- Quản lý chỉ số (index) câu hỏi hiện tại
- Theo dõi điểm số
- Hiển thị tiến trình
- Xử lý khi hoàn thành quiz
- Hiển thị kết quả tổng quát

**Trạng thái (State) Quan trọng**:
```typescript
const [currentIndex, setCurrentIndex] = useState(0)    // Vị trí Kanji hiện tại
const [selectedKanji, setSelectedKanji] = useState()   // Lựa chọn của người dùng
const [score, setScore] = useState(0)                   // Điểm số trả lời đúng
const [gameEnded, setGameEnded] = useState(false)      // Trạng thái hoàn thành
```

**Luồng Trò chơi (Game Flow)**:
1. Hiển thị nghĩa Kanji + thanh ProgressBar
2. Hiện ô nhập AutocompleteInput
3. Người dùng chọn Kanji → ResultModal xuất hiện
4. Kiểm tra đúng/sai → Cập nhật điểm
5. Hiển thị nút "Next" → Đi tiếp hoặc kết thúc
6. Màn hình cuối cùng với bảng thống kê

**Props**:
```typescript
level: 'N5' | 'N4' | 'N3'
kanjiList: Kanji[]
onBack: () => void
```

---

### 3. AutocompleteInput (`src/components/AutocompleteInput.tsx`)
**Mục đích**: Ô nhập Romaji có khả năng chuyển đổi thời gian thực và hệ thống gợi ý

**Công nghệ chính**:
- **Wanakana/Kuromoji**: Chuyển đổi Romaji sang Hiragana và phân tách ngữ âm Kanji
- **Dò chuỗi (String Matching)**: Lọc Kanji dựa theo cách đọc

**Trạng thái (State)**:
```typescript
const [input, setInput] = useState('')              // Đầu vào Romaji thô
const [hiragana, setHiragana] = useState('')        // Chữ đã chuyển đổi
const [suggestions, setSuggestions] = useState([])  // Kanji khớp với đầu vào
const [showSuggestions, setShowSuggestions] = useState(false)
const [selectedIndex, setSelectedIndex] = useState(-1)  // Điều hướng phím
```

**Logic chuyển đổi**:
```typescript
// Sử dụng thư viện wanakana
import * as wanakana from 'wanakana'

const converted = wanakana.toHiragana('taberu')
// Kết quả: "たべる"
```

**Thuật toán Ghép (Matching)**:
```typescript
const matches = kanjiList.filter(kanji => {
  const kunyomiHira = kanji.kunyomi.replace(/[ぁ-ん].*/, '')
  return kunyomiHira.includes(converted)
})
```

**Điều hướng Bàn phím**:
- ↓ Mũi tên xuống: Gợi ý tiếp theo
- ↑ Mũi tên lên: Gợi ý trước đó
- Enter: Chọn mục đang bôi sáng
- Escape: Đóng danh sách thả xuống

**Props**:
```typescript
kanjiList: Kanji[]
currentKanji: Kanji
onSelect: (kanji: Kanji) => void
```

---

### 4. ResultModal (`src/components/ResultModal.tsx`)
**Mục đích**: Hiển thị kết quả câu hỏi và thông tin chi tiết về Kanji

**Tính năng**:
- Phản hồi trực quan báo Thành công/Lỗi
- Hiển thị chữ Kanji mục tiêu nếu trả lời sai
- Bảng thông tin Kanji đầy đủ
- Câu ví dụ kèm bản dịch (Tiếng Việt/Anh, Romaji)
- Điều hướng tới Kanji tiếp theo

**Các phân vùng**:
1. **Tiêu đề (Header)**: Báo đúng/sai
2. **Thông tin Mục tiêu**: Đáp án đúng (khi làm sai)
3. **Chi tiết Kanji**: Chữ, cách đọc, nghĩa
4. **Ví dụ**: Từ ghép và ví dụ thực tế
5. **Footer**: Nút "Kanji Tiếp theo" (Next)

**Props**:
```typescript
kanji: Kanji                    // Chữ Kanji đã chọn
isCorrect: boolean              // Biến kiểm tra đáp án
targetKanji: Kanji              // Đáp án chuẩn
onNext: () => void              // Đẩy sang câu tiếp
```

---

### 5. ProgressBar (`src/components/ProgressBar.tsx`)
**Mục đích**: Cột mốc hiển thị tiến độ bằng hình ảnh

**Tính năng**:
- Thanh tiến độ bo góc chạy hiệu ứng (animated)
- Bộ đếm dạng phân số (X / Tổng)
- Hiệu ứng màu gradient
- Chuyển động mượt mà (smooth transitions)

**Props**:
```typescript
current: number    // Tiến trình hiện tại (tự đếm từ 1)
total: number      // Tổng số Kanji trong quiz
```

---

## 📊  Sơ đồ Luồng Dữ liệu (Data Flow)

```
┌─────────────────────────────────────────┐
│         kanjiData.json                  │
│  (Cơ sở dữ liệu Kanji gốc)              │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  App.tsx                                │
│  - Quản trị State của toàn Game         │
│  - Điều hướng màn hình (Routing)        │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
LevelSelect      QuizGame
Screen           (Main State)
    │                 │
    │            ┌────┼────┬──────────┐
    │            │    │    │          │
    │            ↓    ↓    ↓          ↓
    │         Progress Autocomplete Result
    │         Bar      Input        Modal
    │            │      │            │
    └────────────┴──────┴────────────┘
                 │
                 ↓
      Tương tác Người dùng (User)
```

## 🔤 Tích hợp Wanakana & Kuromoji

### Wanakana là gì?
Wanakana là thư viện JavaScript phục vụ chuyển đổi giữa các hệ thống Romaji ↔ Hiragana ↔ Katakana. Gần đây, hệ thống còn được nâng cấp Kuromoji để lấy từ vựng chính xác từ câu tiếng Nhật.

### Áp dụng trong AutocompleteInput
```typescript
import * as wanakana from 'wanakana'

// Chuyển đổi cốt lõi
wanakana.toHiragana('taberu')   // → たべる
wanakana.toKatakana('taberu')   // → タベル
wanakana.toRomaji('たべる')     // → taberu

// Kiểm tra chữ Kana
wanakana.isHiragana('あ')       // → true
wanakana.isKatakana('ア')       // → true
wanakana.isKana('あア')         // → true
```

### Logic ghép từ Âm Kun (Kunyomi)
```typescript
// Input: "ta" (Một phần của 食べる)
const input = "ta"
const converted = wanakana.toHiragana(input)  // → "た"

const kunyomi = "た.べる"  // Chú ý dấu chấm!
const kunyomiBase = kunyomi.replace(/[ぁ-ん].*/, '')  // → "た"

// Kiểm tra khớp nhau
const matches = kunyomiBase.includes(converted)  // → true!
```

## 📈 Chiến lược Mở rộng: Nâng từ 15 lên 10.000+ Kanji

### Trạng thái Hiện tại (Nền móng)
- **Kích cỡ**: 15 Kanji (5 chữ mỗi cấp)
- **Định dạng**: JSON tĩnh (Static)
- **Tốc độ tải**: ~5ms
- **Bộ nhớ**: ~50KB

### Cấp độ 1: Tối ưu dữ liệu tĩnh (Khuyên dùng cho N5-N3)
**Mục tiêu**: Mốc 1,500 Kanji cơ bản (300 chữ N5, 500 chữ N4, 700 chữ N3)

**Những thay đổi Cần thiết**:
1. Đập thêm dữ liệu đầy đủ JLPT vào file `kanjiData.json`
2. Không cần can thiệp bất kỳ dòng code nào
3. Chia nhỏ các file ra nếu file trên vượt quá tầm chịu đựng của Editor.

**Dung lượng File**: ~2-3 MB (Ổn cho mọi trình duyệt)

**Ví dụ Cấu trúc**:
```
kanjiData.json
├── N5: [Chứa 300 Object Kanji]
├── N4: [Chứa 500 Object Kanji]
└── N3: [Chứa 700 Object Kanji]
```

### Cấp độ 2: Tích hợp API Backend
**Mục tiêu**: Sức chứa từ 5,000+ chữ với hệ thống tải động

**Kiến trúc**:
```
Client (React)
    ↓
API Gateway
    ↓
Backend Service (Node.js/Python/Java)
    ↓
Database (MongoDB/PostgreSQL)
    ↓
External APIs (Tuỳ chọn)
```

**Ví dụ thực hành**:
```typescript
// src/hooks/useFetchKanji.ts
import { useState, useEffect } from 'react'

export function useFetchKanji(level: 'N5' | 'N4' | 'N3') {
  const [kanji, setKanji] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Phương án 1: Backend API
    fetch(`https://api.example.com/kanji/${level}`)
      .then(res => res.json())
      .then(data => setKanji(data))
      .finally(() => setLoading(false))
      
    // Phương án 2: Import Static JSON như cách làm hiện hành
  }, [level])
  
  return { kanji, loading }
}
```

**Ví dụ API Backend Đơn giản** (Bằng Node.js):
```javascript
// backend/routes/kanji.js
app.get('/api/kanji/:level', (req, res) => {
  const { level } = req.params
  const { limit = 50, offset = 0 } = req.query
  
  const kanji = db.kanji
    .filter(k => k.jlptLevel === parseInt(level.replace('N', '')))
    .skip(offset)
    .limit(limit)
    .exec()
  
  res.json(kanji)
})
```

### Cấp độ 3: Các Tính năng Cao cấp Dành cho Tương lai
**Sau khi đạt mốc 5,000+ Kanji**:

1. **Quản lý Tài khoản & Điểm số (Account Systems)**
   - Theo dõi hành trình đã qua
   - Xếp hạng lưu điểm số
   - Gợi ý cá nhân hóa

2. **Lặp lại Cải tiến (Spaced Repetition)**
   - Thuật toán kéo Kanji khó hiện ra thường xuyên hơn
   - Lên lịch ôn thi theo đường lãng quên (Forgetting curve)

3. **Yếu tố Đa phương tiện**
   - Ảnh động / Animation viết nét chữ (Stroke Order)
   - Phát âm bằng giọng thật (Audio Voice)
   - Nhận diện chữ viết tay qua cảm ứng

4. **Tính năng Xã hội (Social Features)**
   - Bảng xếp hạng thi đua
   - Khoe điểm lên MXH
   - Lập Group thi vòng xoay

## 🗂️ Quy chuẩn Sắp xếp Thư mục (Best Practices)

### Cấu trúc Mặc định
```
src/
├── components/
│   ├── LevelSelectScreen.tsx
│   ├── QuizGame.tsx
│   ├── AutocompleteInput.tsx
│   ├── ResultModal.tsx
│   └── ProgressBar.tsx
├── data/
│   └── kanjiData.json
├── hooks/          ← Tuỳ chọn nếu thêm logic tái chế (Reusable)
├── utils/          ← Tuỳ chọn cho hàm tính toán phụ 
├── types/          ← Tuỳ chọn cho định nghĩa Typescript type
└── App.tsx
```

## 🔐 Độ an toàn Kiểu dữ liệu (TypeScript Type Safety)

### Định nghĩa chính
```typescript
// types/kanji.ts
export interface Kanji {
  id: string
  kanji: string
  onyomi: string
  kunyomi: string
  meaning: string
  meaningVi: string
  examples: Example[]
}

export interface Example {
  kana: string
  romaji: string
  meaning: string
  meaningVi: string
}

export type JLPTLevel = 'N5' | 'N4' | 'N3'

export interface GameState {
  level: JLPTLevel
  currentIndex: number
  score: number
  isCompleted: boolean
}
```

## 🚀 Các bí quyết Tối ưu Hiệu năng

### 1. Phân luồng Code (Code Splitting)
```typescript
// Lazy Loading ngắt quãng tải cấp
const kanjiN5 = React.lazy(() => import('./data/kanjiN5.json'))
const kanjiN4 = React.lazy(() => import('./data/kanjiN4.json'))
```

### 2. Memoization
```typescript
const MemoizedSuggestionItem = React.memo(SuggestionItem)
```

### 3. Tái tạo Danh sách lớn hiệu quả
```typescript
import { FixedSizeList } from 'react-window'
// Bắt buộc nếu cuộn hơn 1000 items
```

### 4. Bắt giật (Debounce Input)
```typescript
const debouncedSearch = debounce(searchKanji, 300)
```

## ✅ Bảng kiểm Testing nội bộ

- [x] Tính năng chuyển hướng Romaji hoạt động trên các Input Test
- [x] Bảng Autocomplete bung chuẩn xác
- [x] Lực đẩy bàn phím (Mũi tên lên xuống/Enter) chuẩn
- [x] Cách cộng tính số câu làm đúng xuất hiện chuẩn không lỗi
- [x] Redirect trang khi Done 
- [x] Kiểm tra tương tác Mobile Phone responsive tuyệt đối
- [x] Không còn mã nhúng đỏ Console (Console errors)

---

**Cập nhật lần cuối**: Tháng 3 năm 2026

Mọi chi tiết xin theo dõi bên README nhé!
