# Kanji Master Quiz - JLPT N5-N3

Một ứng dụng web tương tác hiện đại giúp bạn học chữ Hán (Kanji - 漢字) tiếng Nhật thông qua các bài kiểm tra trắc nghiệm thông minh. Chinh phục các cấp độ JLPT từ N5 đến N3 bằng cách gõ Romaji, hệ thống sẽ tự động gõ sang Hiragana/Katakana theo thời gian thực cùng với tính năng gợi ý từ (autocomplete).

## 🎌 Tính năng Đặc bật

### Lối chơi Cốt lõi
- **Chọn Cấp độ JLPT**: Chọn giữa N5 (Sơ cấp), N4 (Trung cấp), hoặc N3 (Nâng cao)
- **Chuyển đổi Romaji Thời gian thực**: Gõ tiếng Nhật bằng ký tự Latinh (Romaji) → chuyển đổi ngay lập tức sang Hiragana/Katakana
- **Tự động Hoàn thành Thông minh**: Trình diễn các gợi ý Kanji khớp với nội dung bạn đang gõ
- **Học tập Chi tiết**: Sau khi chọn đáp án, hệ thống sẽ hiển thị toàn bộ thông tin chi tiết về Kanji, bao gồm:
  - Onyomi (音読み) - Âm Hán-Nhật
  - Kunyomi (訓読み) - Âm thuần Nhật  
  - Ý nghĩa (Tiếng Anh & Tiếng Việt)
  - Các từ vựng ví dụ ghép bằng kanji kèm theo bản dịch
- **Theo dõi Tiến độ**: Thanh tiến độ trực quan và tính điểm theo thời gian thực
- **Giao diện Gọn Gàng**: Thiết kế theo chủ nghĩa tối giản mang âm hưởng thẩm mỹ Nhật Bản với tông màu Hồng Anh Đào (Sakura) và Xanh Ngọc (Jade)
- **Tương thích Di động**: Điền chỉnh hoàn hảo trên mọi thiết bị: máy tính, máy tính bảng và điện thoại

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

## 📁 Cấu trúc Dự án

```
kanji-master/
├── src/
│   ├── components/
│   │   ├── LevelSelectScreen.tsx    # Giao diện chọn cấp độ
│   │   ├── QuizGame.tsx             # Cốt lõi logic và điều phối quiz
│   │   ├── AutocompleteInput.tsx    # Ô nhập Romaji có gợi ý
│   │   ├── ResultModal.tsx          # Modal hiển thị kết quả và thông tin
│   │   └── ProgressBar.tsx          # Thanh hiển thị tiến độ
│   ├── data/
│   │   └── kanjiData.json           # Dữ liệu gốc Kanji (có thể mở rộng)
│   ├── App.tsx                      # Component ứng dụng chính
│   ├── App.css                      # CSS của ứng dụng
│   ├── index.css                    # Tailwind + CSS toàn cục
│   └── main.tsx                     # Điểm khởi chạy (Entry)
├── public/                          # Dữ liệu tĩnh
├── tailwind.config.js               # File cũ của Tailwind (nếu còn)
├── postcss.config.js                # PostCSS để biên dịch CSS
├── vite.config.ts                   # Cấu hình Vite
└── package.json                     # Thông tin gói & script
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

- **Frontend Framework**: React 19 kết hợp TypeScript
- **Công cụ Build**: Vite 8 (xử lý siêu tốc)
- **Thiết kế UI (Styling)**: Tailwind CSS 4 + Màu tùy chỉnh
- **Xử lý tiếng Nhật**: Thư viện Wanakana và Kuromoji (Chuyển đổi Romaji ↔ Kana ↔ Kanji)
- **Xử lý CSS**: PostCSS tích hợp Autoprefixer

## 🎮 Hướng dẫn Chơi

1. **Chọn Độ khó**: Bấm vào thẻ N5, N4, hoặc N3 trên màn hình bắt đầu
2. **Xem Kanji**: Quan sát chữ Hán và ngữ nghĩa tương ứng (Việt/Anh)
3. **Nhập Romaji**: Gõ cách đọc bằng dạng chữ Romaji
   - Ví dụ: gõ `taberu` cho 食べる
4. **Xem Gợi ý**: Hệ thống đưa ra các chữ Kanji khớp trong khi gõ
5. **Chọn Đáp án**: Bấm chọn chữ Kanji chính xác từ danh sách
6. **Ôn tập Chi tiết**: Làm quen với Onyomi, Kunyomi, từ vựng ví dụ và ngữ nghĩa
7. **Tiếp Tục**: Bấm "Next Kanji →" để qua chữ mới
8. **Kết Thúc**: Xem điểm tổng kết sau khi hoàn thành tất cả

### Phím tắt
- **↓ Mũi tên xuống**: Chọn gợi ý tiếp theo
- **↑ Mũi tên lên**: Trở về gợi ý trước
- **Enter**: Xác nhận gợi ý đang chọn
- **Escape**: Ẩn bảng gợi ý

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

## 🌐 Tương thích Trình duyệt
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
