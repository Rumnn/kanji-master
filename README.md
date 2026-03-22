# Kanji Master Quiz - JLPT N5-N3

**Phiên bản**: v2.0.0 (Multi-Page + Authentication)

Một ứng dụng web tương tác hiện đại giúp bạn học chữ Hán (Kanji - 漢字) tiếng Nhật thông qua các bài kiểm tra trắc nghiệm thông minh. Chinh phục các cấp độ JLPT từ N5 đến N3 bằng cách gõ Romaji, hệ thống sẽ tự động gõ sang Hiragana/Katakana theo thời gian thực cùng với tính năng gợi ý từ (autocomplete).

**Mới lạ**: Hệ thống quản lý tài khoản, lưu tiến độ, và admin panel để quản lý dữ liệu Kanji. 🆕

## 🎌 Tính năng Đặc bật

### Lối chơi Cốt lõi (v1.0 - Bảo lưu)
- **Chọn Cấp độ JLPT**: Chọn giữa N5 (Sơ cấp), N4 (Trung cấp), hoặc N3 (Nâng cao)
- **Chuyển đổi Romaji Thời gian thực**: Gõ tiếng Nhật bằng ký tự Latinh (Romaji) → chuyển đổi ngay lập tức sang Hiragana/Katakana
- **Tự động Hoàn thành Thông minh**: Trình diễn các gợi ý Kanji khớp với nội dung bạn đang gõ
- **Học tập Chi tiết**: Sau khi chọn đáp án, hệ thống sẽ hiển thị toàn bộ thông tin chi tiết về Kanji
- **Theo dõi Tiến độ**: Thanh tiến độ trực quan và tính điểm theo thời gian thực
- **Giao diện Gọn Gàng**: Thiết kế theo chủ nghĩa tối giản mang âm hưởng thẩm mỹ Nhật Bản
- **Tương thích Di động**: Điền chỉnh hoàn hảo trên mọi thiết bị

### ✨ Tính năng Mới v2.0 (Full-Stack)
- **Hệ thống Tài khoản**: Đăng ký & Đăng nhập với JWT authentication
- **Lưu Tiến độ**: Điểm số được lưu vào database (không mất khi reload page)
- **Hồ sơ Người dùng**: Xem lịch sử quiz, thống kê hiệu suất (tỉ lệ thành công, tổng điểm)
- **Multi-Page Navigation**: React Router v7 cho navigating mượt mà giữa các page
- **Admin Dashboard**: Import Kanji từ Excel/CSV, quản lý dữ liệu
- **Role-based Access Control**: Phân quyền User vs Admin
- **Advanced NLP**: Kuromoji + Wanakana cho xử lý tiếng Nhật chuyên sâu
- **Data Import/Export**: PapaParse + XLSX support

## 🚀 Khởi động Nhanh

### Yêu cầu Hệ thống
- Node.js 18 trở lên
- npm hoặc yarn

### Cài đặt & Khởi chạy

```bash
# Di chuyển vào dự án
cd kanji-master

# Cài đặt thư viện
npm install

# Khởi chạy máy chủ dev
npm run dev
```

Mở http://localhost:5173 trên trình duyệt của bạn

### Build cho Môi trường Thực tế (Production)
```bash
npm run build
```

## 📁 Cấu trúc Dự án (v2.0)

```
kanji-master/
├── src/
│   ├── pages/                      [✨ MỚI - Multi-page]
│   │   ├── Home.tsx                # Trang chủ
│   │   ├── Login.tsx               # Đăng nhập
│   │   ├── Register.tsx            # Đăng ký
│   │   ├── Profile.tsx             # Hồ sơ & thống kê người dùng
│   │   ├── QuizPlay.tsx            # Trang chơi quiz
│   │   └── AdminDashboard.tsx      # Admin panel
│   │
│   ├── context/                    [✨ MỚI - State Management]
│   │   └── AuthContext.tsx         # JWT authentication & user state
│   │
│   ├── components/                 [Lõi - Quiz Logic]
│   │   ├── LevelSelectScreen.tsx   # Giao diện chọn cấp độ
│   │   ├── QuizGame.tsx            # Cốt lõi logic và điều phối quiz
│   │   ├── AutocompleteInput.tsx   # Ô nhập Romaji có gợi ý
│   │   ├── ResultModal.tsx         # Modal hiển thị kết quả
│   │   ├── ProgressBar.tsx         # Thanh tiến độ
│   │   └── Navigation.tsx          # Navigation bar (CẬP NHẬT)
│   │
│   ├── data/
│   │   └── kanjiData.json          # Dữ liệu gốc Kanji
│   │
│   ├── assets/                     [✨ MỚI - Images/Icons]
│   │   ├── hero.png                # Hero image
│   │   ├── react.svg               # React icon
│   │   └── vite.svg                # Vite icon
│   │
│   ├── App.tsx                     # Router setup (CẬP NHẬT)
│   ├── App.css
│   ├── index.css                   # Tailwind + CSS toàn cục
│   └── main.tsx                    # Entry point
│
├── server/                         [✨ MỚI - Backend Optional]
│   ├── config/
│   │   └── db.js                   # Database connection
│   ├── routes/
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── quiz.js                 # Quiz endpoints
│   │   └── admin.js                # Admin endpoints
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Quiz.js                 # Quiz result schema
│   └── server.js                   # Backend entry point
│
├── public/                         # Static assets
├── dist/                           # Build output
├── .env.example                    # Environment variables template
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS with Tailwind v4
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies & scripts
```

## 📚 Cấu trúc Dữ liệu & Schema

Dữ liệu Kanji được lưu trữ trong `src/data/kanjiData.json` được tổ chức theo cấp bậc:

### Ví dụ về Cấu trúc JSON
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
          "romaji": "taberu",
          "meaning": "to eat",
          "meaningVi": "ăn"
        },
        {
          "kana": "朝食",
          "romaji": "choushoku",
          "meaning": "breakfast",
          "meaningVi": "bữa sáng"
        }
      ]
    }
  ],
  "N4": [...],
  "N3": [...]
}
```

### Tham chiếu Các trường Dữ liệu
| Trường | Kiểu | Mô tả | Ví dụ |
|-------|------|-------------|---------|
| **id** | String | Định danh biểu trưng | `"n5_001"` |
| **kanji** | String | Ký tự Hán r (Kanji) | `"食"` |
| **onyomi** | String | Âm Hán-Nhật (Katakana) | `"ショク"` |
| **kunyomi** | String | Âm Nhật bản địa (với dấu chấm) | `"た.べる"` |
| **meaning** | String | Ý nghĩa tiếng Anh | `"to eat"` |
| **meaningVi** | String | Ý nghĩa tiếng Việt | `"ăn"` |
| **examples** | Array | Chữ ghép sử dụng từ Kanji này | Xem cấu trúc bên dưới |

## 🔧 Công nghệ Áp dụng

### Frontend (v1.0 - Preserved)
- **Frontend Framework**: React 19 kết hợp TypeScript 5.9+
- **Công cụ Build**: Vite 8 (xây dựng siêu tốc)
- **Thiết kế UI**: Tailwind CSS 4 + Custom colors
- **Xử lý tiếng Nhật**: Wanakana + Kuromoji
- **Xử lý CSS**: PostCSS tích hợp Autoprefixer

### Frontend (v2.0 - New)
- **Routing**: React Router DOM v7.13 (Multi-page navigation)
- **State Management**: React Context API + AuthContext
- **HTTP Client**: Axios v1.13 (API communication)
- **Data Handling**: PapaParse v5.5 (CSV parser) + XLSX v0.18 (Excel)
- **Type Safety**: 100% TypeScript coverage

### Backend (v2.0 - Optional)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Input validation middleware

### Deployment (v2.0)
- **Frontend Hosting**: Vercel / Netlify / GitHub Pages
- **Backend Hosting**: Railway / Render / Heroku
- **Database Hosting**: MongoDB Atlas (Cloud)

## 🎮 Hướng dẫn Chơi

### Với v1.0 (Quiz Game)
1. **Chọn Độ khó**: Bấm vào thẻ N5, N4, hoặc N3 trên màn hình bắt đầu
2. **Xem Kanji**: Quan sát chữ Hán và ngữ nghĩa tương ứng
3. **Nhập Romaji**: Gõ cách đọc bằng dạng chữ Romaji (ví dụ: `taberu` cho 食べる)
4. **Xem Gợi ý**: Hệ thống đưa ra các chữ Kanji khớp trong khi gõ
5. **Chọn Đáp án**: Bấm chọn chữ Kanji chính xác từ danh sách
6. **Ôn tập Chi tiết**: Làm quen với Onyomi, Kunyomi, từ vựng ví dụ
7. **Tiếp Tục**: Bấm "Next Kanji →" để qua chữ mới
8. **Kết Thúc**: Xem điểm tổng kết

### Với v2.0 (Full Features)
1. **Tạo Tài khoản** → Bấm Register, nhập thông tin
2. **Đăng Nhập** → Email + Password
3. **Chơi Quiz** (Quiz points được lưu)
4. **Xem Profile** → Check tiến độ & thống kê
5. **Admin** (nếu có quyền) → Import Kanji từ Excel

### Phím tắt
- **↓ Mũi tên xuống**: Chọn gợi ý tiếp theo
- **↑ Mũi tên lên**: Trở về gợi ý trước
- **Enter**: Xác nhận gợi ý đang chọn
- **Escape**: Ẩn bảng gợi ý

---

## 🆕 Bắt đầu với v2.0

### 1. Đăng ký Tài khoản
```
1. Nhấn "Register" trên Home page
2. Nhập: Tên đầy đủ, Email, Password
3. Nhấn "Tạo tài khoản"
4. → Auto login + redirect Home
```

### 2. Chơi Quiz
```
1. Nhấn "Chơi Quiz" hoặc vào /quiz
2. Chọn cấp độ N5/N4/N3
3. Chơi như bình thường (Quiz memory tương tự v1)
4. Điểm được lưu tự động
```

### 3. Xem Hồ sơ
```
1. Nhấn "👤 Profile" hoặc tên user
2. Xem: Thông tin cá nhân, lịch sử quiz, thống kê
```

### 4. Admin Panel (Admin only)
```
1. Đăng nhập với tài khoản admin
2. Navbar hiển thị "Admin Panel"
3. Nhấn để mở Admin Dashboard
4. Import Kanji từ Excel/CSV
```

---

## 📈 Kế hoạch Mở rộng hàng ngàn Kanji

### Chiến lược 1: Thêm vào JSON (Cách làm hiện tại)
**Phù hợp với:** < 5,000 Kanji
**Hướng dẫn:** Thêm các object theo cùng format.

### Chiến lược 2: Tích hợp API Backend
**Phù hợp với:** > 5,000 Kanji hoặc cần cập nhật động. Tạo backend bằng Node/Express hoặc Spring Boot để gọi ra chữ Hán.

### Chiến lược 3: Dùng API bên thứ Ba
Sử dụng các API phổ biến như KanjiAlive, Jisho.org, WG API.

## 🎨 Tùy biến Mở rộng

Bạn có thể chỉnh sửa màu sắc trong cấu trúc `index.css` sử dụng biến của Tailwind V4, hoặc can thiệp vào `src/components/QuizGame.tsx` để đổi số câu hỏi và luật tính điểm.

## 📝 Cách thêm mới Kanji

1. Mở `src/data/kanjiData.json`
2. Thêm vào mảng N-level tương ứng:

```json
{
  "id": "n3_006",
  "kanji": "突",
  "onyomi": "トツ",
  "kunyomi": "つ.く",
  "meaning": "thrust, suddenly",
  "meaningVi": "đâm, đột ngột",
  "examples": [
    { "kana": "突く", "romaji": "tsuku", "meaning": "to thrust", "meaningVi": "đâm" }
  ]
}
```

## 📚 Tài liệu & Hướng dẫn

| File | Mục đích | Dành cho |
|------|----------|----------|
| **[QUICK_START.md](QUICK_START.md)** | Hướng dẫn 3 bước chạy app | Người mới |
| **[FAQ.md](FAQ.md)** | Câu hỏi thường gặp & trả lời | Mọi người |
| **[UPDATE_LOG.md](UPDATE_LOG.md)** | Danh sách thay đổi v2.0 | Dev/Updated |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Kiến trúc kỹ thuật chuyên sâu | Dev/Developers |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Deploy lên production | DevOps/Hosting |
| **[PROJECT_STATUS.md](PROJECT_STATUS.md)** | Status & completion v2.0 | Project Manager |
| **[ADDING_KANJI.md](ADDING_KANJI.md)** | Hướng dẫn thêm dữ liệu | Content Admin |

## 📖 Đọc tiếp Nào

- **Người mới**: Đọc [QUICK_START.md](QUICK_START.md)
- **Có câu hỏi**: Xem [FAQ.md](FAQ.md)
- **Developer**: Đọc [ARCHITECTURE.md](ARCHITECTURE.md)
- **Cần deploy**: Đọc [DEPLOYMENT.md](DEPLOYMENT.md)
- **Thêm Kanji**: Đọc [ADDING_KANJI.md](ADDING_KANJI.md)
- **Xem thay đổi**: Đọc [UPDATE_LOG.md](UPDATE_LOG.md)

---
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+  
- ✅ Edge 90+
- ✅ Trình duyệt Di động (iOS Safari, Chrome Mobile)

## 💡 Mẹo Học Hiệu Quả
1. **Thực hành Mỗi ngày**: Học 5-10 Kanji hàng ngày
2. **Viết Ra Giấy**: Viết tay để cải thiện trí nhớ cơ bắp
3. **Sử dụng Ví dụ**: Tập trung vào ví dụ từ vựng để hiểu cách dùng trong câu
4. **Lặp Lại Có Ngắt Quãng**: Học lại những Kanji bạn gặp khó khăn

---

**学習頑張ってください！ (Ganbatte kudasai!) - Chúc bạn học thật tốt nhé!** 

Được tạo bằng ❤️ dành cho người học tiếng Nhật toàn cầu.
