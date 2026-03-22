# 🎌 KANJI MASTER QUIZ - Hướng dẫn Cài đặt & Triển khai Toàn diện

**Phiên bản**: v2.0.0 (Multi-Page + Authentication)  
**Trạng thái**: ✅ Máy chủ Dev (Development Server) đang chạy tại http://localhost:5173

## 📦 Tổng quan Dự án v2.0

Một **nền tảng học tập Kanji hoàn toàn** (Full-Stack) với hệ thống người dùng, xác thực, và quản trị. Kết hợp React frontend với backend API để quản lý tài khoản, điểm số, và dữ liệu Kanji.

### ✨ Những Gì Bạn Nhận Được (v2.0)

✅ **Frontend React/TypeScript Hoàn chỉnh**
- 8 React components (5 quiz gốc + 3 mới cho multi-page)
- 6 pages chính: Home, Login, Register, Profile, QuizPlay, AdminDashboard
- React Router v7 cho multi-page navigation
- Tailwind CSS v4 với bảng màu cảm hứng từ Nhật Bản
- Không có lỗi build (0 errors) hay cảnh báo (0 warnings)

✅ **Hệ thống Xác thực & Tài khoản**
- Login/Register với JWT token management
- localStorage persistence cho session
- Role-based access control (User vs Admin)
- Quản lý hồ sơ người dùng

✅ **Xử lý tiếng Nhật Thông minh**
- Wanakana: Romaji ↔ Hiragana/Katakana conversion
- Kuromoji: Japanese morphological analysis
- Gợi ý từ thông minh (Autocomplete) theo thời gian thực

✅ **Giao diện Ứng dụng Modern & Responsive**
- Multi-page design với smooth transitions
- Mobile-first responsive layout
- User navigation bar với logout
- Admin panel cho quản lý dữ liệu

✅ **Backend Integration & Data Management**
- Axios HTTP client cho API calls
- JWT-based authentication
- CSV/Excel import (PapaParse + XLSX)
- Đóp dữ liệu Kanji từ Database

✅ **Tài liệu Hướng dẫn Từ A đến Z**
- **README.md**: Tổng quan & hướng dẫn bắt đầu
- **ARCHITECTURE.md**: Kiến trúc kỹ thuật chuyên sâu (v2.0)
- **UPDATE_LOG.md**: Danh sách thay đổi chi tiết
- **ADDING_KANJI.md**: Cách nhồi dữ liệu Kanji
- **PROJECT_STATUS.md**: Tóm tắt nhanh v2.0 updates
- **File này**: Hướng dẫn triển khai & deployment v2.0

## 🚀 Trạng thái Hiện tại - v2.0

### Frontend (React + Vite)
```bash
npm run dev
# Đang chạy tại: http://localhost:5173
```

**Pages Đang Sống**:
- ✅ **Home** - Trang chủ
- ✅ **Login/Register** - Xác thực người dùng
- ✅ **QuizPlay** - Quiz game (kế thừa từ v1)
- ✅ **Profile** - Xem lịch sử & thống kê
- ✅ **AdminDashboard** - Quản lý Kanji (admin only)

### Backend (Node.js + Express) ⚠️ In Progress
```bash
cd server
npm start
# Chạy tại: http://localhost:3000 (hoặc port khác)
```

**API Endpoints**:
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /api/profile` - Lấy hồ sơ (protected)
- `POST /api/quiz/save-result` - Lưu điểm (protected)
- `GET /api/admin/users` - Danh sách người dùng (admin only)
- `POST /api/admin/import-kanji` - Import Kanji (admin only)

### Trạng thái Build (Xuất bản)
```bash
npm run build
```
- Không lỗi ✅
- Không cảnh báo ✅
- Sẵn sàng đem đi khoe ✅

## 📁 Cấu trúc File v2.0 (Full-Stack)

```
kanji-master/
├── Frontend Files
├── 📄 README.md                 [Giới thiệu & cài đặt]
├── 📄 ARCHITECTURE.md           [Kiến trúc kỹ thuật v2.0]
├── 📄 UPDATE_LOG.md             [Danh sách thay đổi]
├── 📄 ADDING_KANJI.md           [Cách thêm dữ liệu Kanji]
├── 📄 PROJECT_STATUS.md         [Tóm tắt nhanh v2.0]
├── 📄 DEPLOYMENT.md             [File này]
│
├── src/                         [Frontend Source Code]
│   ├── 🎨 App.tsx               [Router + Navigation (CẬP NHẬT)]
│   ├── 🎨 App.css
│   │
│   ├── pages/                   [✨ MỚI - Multi-page]
│   │   ├── Home.tsx             [Trang chủ]
│   │   ├── Login.tsx            [Đăng nhập]
│   │   ├── Register.tsx         [Đăng ký]
│   │   ├── Profile.tsx          [Hồ sơ người dùng]
│   │   ├── QuizPlay.tsx         [Trang cho quiz]
│   │   └── AdminDashboard.tsx   [Admin panel]
│   │
│   ├── components/              [Original + Enhanced]
│   │   ├── LevelSelectScreen.tsx
│   │   ├── QuizGame.tsx
│   │   ├── AutocompleteInput.tsx (+ Kuromoji)
│   │   ├── ResultModal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Navigation.tsx        [✨ MỚI]
│   │
│   ├── context/                 [✨ MỚI - State Management]
│   │   └── AuthContext.tsx      [JWT + user state]
│   │
│   ├── data/
│   │   └── kanjiData.json
│   │
│   ├── assets/                  [✨ MỚI]
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── 🎨 index.css
│   └── 📄 main.tsx
│
├── 🔧 vite.config.ts            [Vite config]
├── 🔧 tsconfig.json             [TypeScript config]
├── 🔧 tailwind.config.js        [Tailwind theme]
├── 🔧 postcss.config.js         [PostCSS + Tailwind v4]
├── 🔧 package.json              [Dependencies v2.0]
│
├── Backend Files (✨ MỚI)
├── server/                      [Backend Source]
│   ├── config/
│   │   └── db.js                [MongoDB connection]
│   │
│   ├── routes/
│   │   ├── auth.js              [/auth endpoints]
│   │   ├── quiz.js              [/api/quiz endpoints]
│   │   └── admin.js             [/api/admin endpoints]
│   │
│   ├── models/
│   │   ├── User.js              [User schema]
│   │   └── Quiz.js              [Quiz result schema]
│   │
│   ├── middleware/
│   │   ├── auth.js              [JWT verification]
│   │   └── validation.js        [Input validation]
│   │
│   ├── .env                     [⚠️ GIẤU - API keys]
│   ├── package.json             [Backend dependencies]
│   └── server.js                [Entry point]
│
├── public/                      [Static assets]
├── dist/                        [Frontend build output]
├── 📄 .env.example              [Sample env variables]
├── 📄 .gitignore
└── node_modules/                [Dependencies]
```

## 🎯 Các Bước Tiếp Theo

## 🎯 Hướng dẫn Cài đặt & Chạy v2.0

### 1️⃣ Cài đặt Frontend

```bash
# Tải về dependencies
npm install

# Chạy dev server
npm run dev
# Truy cập: http://localhost:5173
```

### 2️⃣ Cài đặt Backend (⚠️ Nếu API đã hoàn thành)

```bash
# Vào thư mục backend
cd server

# Cài đặt dependencies backend
npm install

# Tạo file .env với config
# Xem .env.example để biết các biến cần thiết

# Chạy backend server
npm start
# Server chạy tại: http://localhost:3000
```

### 3️⃣ Environment Variables

#### Frontend (.env.local - Development)
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Kanji Master Quiz
```

#### Frontend (.env.production - Production)
```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Kanji Master Quiz
```

#### Backend (.env - Server)
```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kanji-master

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 🔐 Quyền truy cập (Access Control)

| Route | Công khai | Yêu cầu Login | Admin only |
|-------|-----------|---------------|-----------|
| `/` (Home) | ✅ | - | - |
| `/login` | ✅ | - | - |
| `/register` | ✅ | - | - |
| `/quiz` | - | ✅ | - |
| `/profile` | - | ✅ | - |
| `/admin/*` | - | ✅ | ✅ |

### 🔄 Nguyên tắc hoạt động

**1. Người dùng mới**
```
[Register] → Backend tạo User → Token lưu vào localStorage → Auto redirect
```

**2. Người dùng quay lại**
```
[Token trong localStorage] → Auto login (RestoreSession) → `useEffect` trong AuthContext
```

**3. Admin**
```
Nếu user.role === 'admin' → Hiển thị Admin menu → Truy cập admin routes
```

---

## 📋 Các Bước Tiếp Theo (Tasks)

### Ngắn hạn (Tuần này)
- [ ] Chạy frontend dev server: `npm run dev`
- [ ] Thử đăng ký & đăng nhập luồng
- [ ] Chơi quiz & xem kết quả được lưu
- [ ] Kiểm tra localStorage có token hay không
- [ ] (Nếu backend sẵn sàng) Chạy backend: `cd server && npm start`
- [ ] Test full authentication flow

### Trung hạn (2 tuần)
- [ ] Kết nối frontend với backend API
- [ ] Xác thực JWT tokens hoạt động
- [ ] Lưu điểm quiz vào database
- [ ] AdminDashboard import Kanji từ Excel/CSV
- [ ] Test role-based access control

### Dài hạn (Tháng này)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Deploy backend (Heroku/Railway/Azure)
- [ ] Setup MongoDB Atlas database
- [ ] Cấu hình CORS chính xác
- [ ] SSL certificate cho HTTPS
- [ ] Monitoring & Logging

---

## 📊 Deployment Options - v2.0

### Frontend Deployment

#### Cách 1: Vercel (Khuyên Dùng)
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Deploy
vercel
```
- **Giá**: Free vĩnh viễn
- **Thời gian**: < 2 phút
- **Domain**: `.vercel.app` hoặc custom domain

#### Cách 2: Netlify
- Tạo tài khoản: [netlify.com](https://netlify.com)
- Kết nối GitHub repo
- Tự động build & deploy khi push code

#### Cách 3: GitHub Pages
```bash
# Cập nhật vite.config.ts
export default {
  base: '/kanji-master/',
}

# Build
npm run build

# Deploy dist/ lên GitHub Pages
```

### Backend Deployment

#### Cách 1: Heroku ⚠️ (Free tier ngừng 2022)
Kiếm lựa chọn khác

#### Cách 2: Railway ✅ (Khuyên Dùng)
```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```
- **Free tier**: $5/month credits
- **Database**: MongoDB Atlas free tier

#### Cách 3: Render
- Tạo tài khoản: [render.com](https://render.com)
- Kết nối GitHub
- Tự động deploy

#### Cách 4: DigitalOcean / AWS / Azure
- Tự quản lý server
- Full control nhưng phức tạp hơn

### Database (MongoDB)

#### MongoDB Atlas (Cloud - Khuyên Dùng)
```bash
# 1. Tạo tài khoản: https://www.mongodb.com/cloud/atlas
# 2. Tạo cluster m0 (free tier)
# 3. Tạo database user
# 4. Get connection string
# 5. Đặt vào .env

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kanji-master
```

#### MongoDB Local (Development)
```bash
# Cài MongoDB Community
# Chạy mongod
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/kanji-master
```

---

## 🏗️ Architecture Deployment

### Development (Local)
```
┌─────────────────────────────────────────┐
│   Your Computer                         │
├─────────────────────────────────────────┤
│ Frontend (React)     Backend (Node)     │
│ localhost:5173       localhost:3000     │
│         │                    │          │
│         └────────────────────┘          │
│              API Calls                  │
│                                         │
│         MongoDB (Local/Atlas)           │
└─────────────────────────────────────────┘
```

### Production (Deployed)
```
┌──────────────────────────────────────────────────────────┐
│   Internet                                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │ Frontend        │         │ Backend          │      │
│  │ (Vercel)        │────────→│ (Railway/Render) │      │
│  │ example.com     │         │ api.example.com  │      │
│  └─────────────────┘         └──────────┬───────┘      │
│                                         │               │
│                              ┌──────────▼──────────┐    │
│                              │ MongoDB Atlas       │    │
│                              │ Database            │    │
│                              └─────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Checklist

- [ ] JWT secret key an toàn (không publish trên GitHub)
- [ ] MongoDB credentials trong .env (không public)
- [ ] CORS chỉ cho phép origin được phép
- [ ] Password hashed (bcryptjs)
- [ ] API rate limiting cấu hình
- [ ] HTTPS bật (SSL certificate)
- [ ] Environment variables xoá khỏi .git
- [ ] Validate tất cả user input trên backend

## 🧪 Danh sách Rà soát trước khi Tung Web v2.0 (Checklist)

### Frontend Tests
- [ ] Home page hiển thị đúng
- [ ] Register form hoạt động (validation, error messages)
- [ ] Login form hoạt động
- [ ] Token lưu vào localStorage sau login
- [ ] Redirect tới home sau login
- [ ] Logout xóa token & redirect tới home
- [ ] Quiz page chỉ accessible khi logged in
- [ ] Profile page hiển thị user info đúng
- [ ] Quiz game logic hoạt động (ở QuizPlay page)
- [ ] Romaji → Hiragana conversion mượt (Wanakana + Kuromoji)
- [ ] Autocomplete gợi ý chính xác
- [ ] Điểm được lưu/hiển thị
- [ ] Progress bar chính xác
- [ ] Mobile responsive tất cả pages
- [ ] F12 Console không có error

### Backend Tests (Nếu có)
- [ ] Server chạy không crash
- [ ] Register endpoint tạo user mới
- [ ] Login endpoint trả về token
- [ ] JWT token có thể parse & verify
- [ ] Protected routes yêu cầu token
- [ ] Admin routes kiểm tra role
- [ ] Quiz save-result endpoint lưu vào DB
- [ ] Database connection hoạt động
- [ ] Error handling xử lý đúng
- [ ] Validation đẩy lùi invalid requests

### Authentication Flow
- [ ] New user: Register → Auto login → Home
- [ ] Existing user: Login → Home
- [ ] Token refresh: Reload page → Auto login (localStorage)
- [ ] Admin: Login as admin → See admin link in navbar
- [ ] Logout: Clear token → Redirect → Can't access protected

### Styling & UI
- [ ] Colors match design (Sakura pink, Jade green)
- [ ] Fonts render correctly (Japanese + English)
- [ ] Buttons have hover effects
- [ ] Forms have proper spacing
- [ ] Mobile menu responsive
- [ ] Dark mode (if implemented)
- [ ] No overlapping text or elements

### Performance
- [ ] App loads in < 2 seconds
- [ ] No memory leaks in console
- [ ] Images optimized
- [ ] API calls show loading states
- [ ] No unnecessary re-renders
- [ ] Animations smooth (60fps)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Form labels present
- [ ] Error messages descriptive

---

## 🐛 Fix Lỗi Thường Gặp

### ❌ Login không hoạt động
**Triệu chứng**: Stuck on login page, no error message  
**Nguyên nhân**: Backend không chạy hoặc API URL sai
```bash
# Kiểm tra:
1. Backend server chạy? cd server && npm start
2. .env có VITE_API_URL đúng?
3. F12 → Network tab → Xem login request có error 401/500?
4. Check backend logs
```

### ❌ Token không lưu
**Triệu chứng**: Reload page → Mất login
```bash
# Kiểm tra:
1. F12 → Application → localStorage
2. Token có được lưu không?
3. AuthContext useEffect chạy không?
4. Check browser localStorage permissions
```

### ❌ Admin route trả 403
**Nguyên nhân**: User không phải admin  
```bash
# Kiểm tra:
1. user.role === 'admin'?
2. Token chứa role info?
3. Backend kiểm tra role?
```

### ❌ Vite build fail
**Triệu chứng**: "Cannot find module '@tailwindcss/postcss'"
```bash
npm install --save-dev @tailwindcss/postcss@4.2.1
npm run build
```

### ❌ API CORS error
**Triệu chứng**: Console error "Access to XMLHttpRequest blocked by CORS"
```bash
# Backend:
# app.use(cors({
#   origin: process.env.CORS_ORIGIN,
#   credentials: true
# }))
```

### ❌ Node modules lỗi
**Giải pháp**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Tài liệu & Resources

| Tài liệu | Mục đích |
|----------|----------|
| [Vite Docs](https://vitejs.dev) | Build tool |
| [React Docs](https://react.dev) | Frontend framework |
| [TypeScript](https://www.typescriptname.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [React Router](https://reactrouter.com) | Multi-page routing |
| [Wanakana](https://github.com/WaniKani/WanaKana) | Romaji ↔ Kana |
| [Kuromoji](https://github.com/takuyaa/kuromoji.js) | Japanese NLP |
| [MongoDB](https://docs.mongodb.com) | Database |
| [Express.js](https://expressjs.com) | Backend framework |
| [JWT](https://jwt.io) | Authentication |
| [Vercel](https://vercel.com/docs) | Frontend hosting |
| [Railway](https://railway.app/docs) | Backend hosting |

---

## 📞 Support & Troubleshooting

### Xem Log & Debug
```bash
# Frontend error log
F12 → Console tab → Xem messages

# Backend error log
Terminal where you ran `npm start`

# Network requests
F12 → Network tab

# Storage
F12 → Application → localStorage/sessionStorage
```

### Yêu cầu Support
Cung cấp:
1. Error message chính xác
2. Steps to reproduce
3. Browser/Node version
4. Logs từ console/terminal
# Chuyển cổng khác gõ web cho xong
npm run dev -- --port 3000
```

### Lỗi Parse JSON Data Error
Hơi nặng tay sửa file `.json` làm dấu ngoặc nhọn `{` hoặc dấu phẩy `,` tàn hình ở đau đó. Hãy dò lại 

## 📞 Nguồn viện trợ Toàn Cầu

### Cẩm nang Kĩ Sư Frontend
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)

### Nguồn tự học Kanji Nhật 
- Hướng dẫn JLPT [jlpt.jp](https://www.jlpt.jp)
- Jisho.org (Tra từ siêu hạng)
- Wanakana ([Tài liệu Git WanaKana](https://github.com/WaniKani/WanaKana))

---

**Made with ❤️ for Japanese learners**

学習頑張ってください！(Ganba tte kudasai!) - Cố gắng học thật tốt nhé!
