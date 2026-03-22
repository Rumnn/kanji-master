# ⚡ QUICK START - Kanji Master v2.0

**Chỉ cần 3 bước để chạy ứng dụng!**

---

## 🚀 Bước 1: Chuẩn bị

### Yêu cầu hệ thống
- Node.js 18+ ([Download](https://nodejs.org))
- npm (đi kèm Node.js)
- Git (tùy chọn)

### Kiểm tra cài đặt
```bash
node --version  # v18.0.0 hoặc cao hơn
npm --version   # 9.0.0 hoặc cao hơn
```

---

## 🎯 Bước 2: Chạy Frontend

```bash
# Vào thư mục dự án
cd kanji-master

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

**Kết quả**:
```
  VITE v4.5.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 🎉 Bước 3: Mở trình duyệt

1. Truy cập: http://localhost:5173
2. Bạn sẽ thấy **Kanji Master Quiz Home Page**
3. Nhấn "Register" để tạo tài khoản
4. Nhập thông tin: Tên, Email, Password
5. Nhấn "Tạo tài khoản"
6. Tự động redirect → Nhấn "Chơi Quiz"
7. Chọn cấp độ N5 → Chơi!

---

## ✨ Luồng Sử Dụng Nhanh

### Người Dùng Mới
```
[Home] → [Register] → Nhập info → [Play Quiz] → Chơi → Lưu điểm
```

### Người Dùng Quay Lại
```
[Home] → [Login] → Nhập email/password → [Play Quiz] → Tiếp tục học
```

---

## 🔐 Tài Khoản Test

### Tạo tài khoản test
```
Email: test@example.com
Password: Test12345!
Name: Test User
```

### Đăng nhập
```
1. Nhấn "Login"
2. Nhập: test@example.com / Test12345!
3. Nhấn "Đăng nhập"
```

---

## 🎮 Chơi Quiz - Hướng dẫn

### N5 Level (Người mới bắt đầu)
1. Chọn "N5"
2. Gõ Romaji để đoán Kanji
3. Ví dụ: gõ "tabe" → kết quả: 食べ

### Lệnh Keyboard
- **↑↓**: Di chuyển trong gợi ý
- **Enter**: Chọn từ gợi ý
- **Esc**: Xóa input

### Điểm Số
- ✅ Đúng: +10 điểm
- ❌ Sai: 0 điểm
- **Total**: Tổng điểm = Tổng đúng × 10

---

## 📱 Xem Hồ Sơ

### Sau khi login
1. Nhấn "👤 Profile" trong navbar (hoặc tên user)
2. Xem:
   - Thông tin cá nhân
   - Lịch sử quiz
   - Tống điểm
   - Tỉ lệ thành công

---

## ⚙️ Cấu Hình Backend (Nâng cao)

**Nếu backend đã sẵn sàng**:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (ở thư mục server)
cd server
npm install
npm start
```

### Env file (.env.local)
```env
VITE_API_URL=http://localhost:3000
```

---

## 🐛 Gặp Lỗi?

### ❌ Port 5173 đã được sử dụng
```bash
# Tắt app chạy port 5173 khác
# Hoặc chạy ở port khác:
npm run dev -- --port 3456
```

### ❌ "Cannot find module"
```bash
rm -rf node_modules
npm install
npm run dev
```

### ❌ Console errors
Nhấn **F12** → **Console tab** → Xem error message → Tìm trong:
- [UPDATE_LOG.md](UPDATE_LOG.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Tài liệu

| File | Mục đích |
|------|----------|
| [README.md](README.md) | Giới thiệu chi tiết |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Kiến trúc code |
| [UPDATE_LOG.md](UPDATE_LOG.md) | Thay đổi v2.0 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy lên production |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Tóm tắt v2.0 |

---

## 🎁 Tính năng v2.0

✅ Multi-page routing  
✅ User authentication (Login/Register)  
✅ User profiles  
✅ Admin dashboard  
✅ Quiz scoring & history  
✅ Romaji + Kuromoji NLP  
✅ 100% TypeScript  
✅ Beautiful Tailwind UI  

---

## 🚀 Tiếp Theo?

### Học thêm
- Đọc [ARCHITECTURE.md](ARCHITECTURE.md) để hiểu code structure
- Xem [ADDING_KANJI.md](ADDING_KANJI.md) cách thêm dữ liệu

### Deploy
- Đọc [DEPLOYMENT.md](DEPLOYMENT.md) cho hướng dẫn deploy

### Phát triển thêm
- Thêm features mới
- Customize UI
- Kết nối backend

---

## 💬 Hỏi Đáp

**Q: Có cần backend để chạy không?**  
A: Không. Frontend hoạt động độc lập. Backend là tùy chọn để lưu điểm vào database.

**Q: Dữ liệu được lưu ở đâu?**  
A: Hiện tại: localStorage (tạm). Sau deploy: MongoDB database.

**Q: Có thể chơi offline không?**  
A: Có, miễn là không reload trang (vì offline mode chưa implement).

**Q: Admin panel là gì?**  
A: Trang để import Kanji từ Excel/CSV (chỉ admin access).

---

## 📞 Cần giúp?

1. Xem console (F12)
2. Kiểm tra error log
3. Đọc lại file README.md
4. Xem video hướng dẫn (nếu có)

---

**Ready? Vào http://localhost:5173 và chơi nào!** 🎮

**Last Updated**: 22 Mar 2026 | **Version**: v2.0.0
