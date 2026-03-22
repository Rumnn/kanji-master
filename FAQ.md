# ❓ FAQ - Kanji Master v2.0

**Những câu hỏi thường gặp & câu trả lời**

---

## 🚀 Installation & Setup

### Q: Cần môi trường gì để chạy?
**A**: Chỉ cần:
- Node.js 18+ ([Download](https://nodejs.org))
- npm (đi kèm Node.js)
- Một trình duyệt web bình thường

Không cần MongoDB/backend nếu chỉ play local.

### Q: Lệnh chạy là gì?
**A**:
```bash
npm install
npm run dev
```

Rồi mở http://localhost:5173

### Q: Port 5173 bị chiếm rồi?
**A**: Chạy ở port khác:
```bash
npm run dev -- --port 3456
```

### Q: Cài đặt bao lâu?
**A**: 
- `npm install`: 2-5 phút (tùy tốc độ internet)
- `npm run dev`: 10-30 giây

---

## 🔐 Authentication & Accounts

### Q: Cần tạo tài khoản không?
**A**: 
- **Frontend local**: Không bắt buộc (có thể chơi anonymous)
- **Với backend**: Bắt buộc để lưu điểm

### Q: Quên password làm sao?
**A**: Backend phải implement "Forgot Password" feature. Hiện tại chưa có.

### Q: Có thể dùng Google/Facebook login?
**A**: Chưa support. Phải implement OAuth nếu muốn.

### Q: Tài khoản admin là gì?
**A**: Tài khoản có quyền:
- Import Kanji từ Excel/CSV
- Xem danh sách Users
- Quản lý dữ liệu

Được tạo khi setup backend (thường là first user).

### Q: Logout xóa data sao?
**A**: Không. Data được lưu server (nếu có backend).
- Token bị xóa khỏi localStorage
- Server vẫn có history

---

## 💾 Data & Storage

### Q: Dữ liệu được lưu ở đâu?
**A**:
| Scenario | Lưu ở đâu |
|----------|----------|
| Frontend local | localStorage (máy bạn) |
| Với backend | MongoDB (server) |
| Kanji data | kanjiData.json + Database |

### Q: Reload page có mất điểm không?
**A**: 
- **Browser (localStorage)**: Không mất
- **Server (Database)**: Không mất
- **Tắt hết thì**: Tùy backend có sync không

### Q: Có thể export data?
**A**: 
- Hiện tại: Chưa (admin có thể export via Excel)
- Sắp tới: Sẽ thêm personal export

### Q: Có bao nhiêu Kanji?
**A**: 
- **Sample data**: ~15 (5 per level)
- **Có thể thêm**: Hàng ngàn (via admin import)
- **JLPT full**: ~2,140 kanji

---

## 🎮 Gameplay Questions

### Q: Làm sao để gõ Romaji đúng?
**A**: 
```
Hepburn Romaji standard:
- a i u e o → Basic vowels
- ka ki ku ke ko → ka row
- sa si su se so → sa row (hoặc: sha shu sho)
- ta ti tu te to → ta row (hoặc: cha chu cho)
- na ni nu ne no → na row
- ha hi hu he ho → ha row (hoặc: fa fi fe fo)
- ma mi mu me mo → ma row
- ya yu yo → ya row (special)
- ra ri ru re ro → ra row
- wa wo n → Remaining

Ví dụ:
- 食べる → taberu
- 読む → yomu
- 見る → miru
- 行く → iku
```

### Q: Autocomplete làm sao?
**A**: Khi gõ một số ký tự:
1. Wanakana convert Romaji → Hiragana
2. Kuromoji match với Kanji database
3. Suggestion list hiển thị
4. Dùng arrow keys + Enter để chọn

### Q: Sai làm sao?
**A**:
- Quiz vẫn tiếp tục (không game over)
- Điểm = 0 cho câu sai
- Hiển thị đáp án đúng cho referenece

### Q: Tính điểm như thế nào?
**A**:
- Mỗi câu đúng: +10 điểm
- Mỗi câu sai: +0 điểm
- Total = (đúng × 10)
- Ví dụ: 7/10 đúng = 70 điểm

### Q: Có khó độ khác không?
**A**: Hiện tại:
- N5 (Beginner - dễ nhất)
- N4 (Intermediate - trung bình)
- N3 (Advanced - khó nhất)

Sắp tới có thể thêm N2/N1.

### Q: Có timer không?
**A**: Không (unlimited time). Dự định thêm speed mode trong tương lai.

---

## 📱 UI/UX & Compatibility

### Q: Hỗ trợ mobile không?
**A**: Có, responsive design:
- ✅ iPhone/iPad
- ✅ Android phones
- ✅ Tablets
- ✅ Desktop

### Q: Dark mode?
**A**: Không có. Có thể thêm sau.

### Q: Font tiếng Nhật hiển thị sao không?
**A**: Kiểm tra:
1. Browser có support không (thường OK)
2. Font cài đầy đủ? (macOS/Windows OK)
3. Console (F12) có error không?

### Q: Chậm sao?
**A**: 
- Xóa browser cache
- Restart browser
- Kiểm tra internet speed
- Xem console (F12) có error không?

---

## 🖥️ Backend & Deployment

### Q: Cần backend không?
**A**: 
- **Chơi local**: Không bắt buộc
- **Lưu điểm lâu dài**: Cần
- **Team/Production**: Cần

### Q: Cách setup backend?
**A**: Xem [DEPLOYMENT.md](DEPLOYMENT.md#backend-deployment)

### Q: Database là gì?
**A**: MongoDB:
- NoSQL database
- Phổ biến cho JavaScript apps
- Free tier: MongoDB Atlas

### Q: Cách deploy?
**A**: 
- **Frontend**: Vercel/Netlify (free)
- **Backend**: Railway/Render ($5-10/month)
- **Database**: MongoDB Atlas (free tier available)

Xem [DEPLOYMENT.md](DEPLOYMENT.md) chi tiết.

### Q: CORS error?
**A**: Khi frontend ≠ backend URL:
```javascript
// Backend cần:
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
```

---

## 🐛 Troubleshooting

### Q: "Cannot find module"?
**A**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Q: Build fail?
**A**: Check:
```bash
npm run build
# Xem error message
# Thường là tailwind v4 issue
npm install --save-dev @tailwindcss/postcss@4.2.1
npm run build
```

### Q: Logout không hoạt động?
**A**:
1. Xem F12 → localStorage (có token không?)
2. Xem F12 → Console (error không?)
3. Xem backend logs
4. Restart browser

### Q: Đăng ký thất bại?
**A**: 
1. Network error? (offline mode)
2. Server down? (backend chạy chưa?)
3. Email already exist?
4. Password không đủ mạnh?

### Q: Quiz điểm không lưu?
**A**: 
- Backend enabled? (npm start server/)
- Network tab (POST request có 200 OK không?)
- Browser console có error không?
- Database connection OK không?

---

## 🆘 Still Stuck?

### Bước debug:

1. **F12 Console**:
   - Red errors at top
   - Có message gì?

2. **Network Tab**:
   - API requests successful?
   - 200 OK hay error codes?

3. **Terminal**:
   - Frontend error message?
   - Backend crash?

4. **Check Docs**:
   - [QUICK_START.md](QUICK_START.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)

5. **Google It**:
   - Search error message
   - StackOverflow có giải pháp

---

## 💡 Tips & Tricks

### Learning Tips
1. **Daily Practice**: 5-10 kanji/day
2. **Write by Hand**: Improve muscle memory
3. **Flashcards**: Supplement with Anki
4. **Context**: Learn with example sentences

### Technical Tips
1. **Speed Up Dev**: Use `npm run dev` not `npm start`
2. **Debug Faster**: Console.log heavily
3. **Commit Early**: Version control saves lives
4. **Ask Questions**: Open issues on GitHub

### Performance Tips
1. **Lazy Load**: Import components on demand
2. **Optimize Images**: Compress before upload
3. **Cache Aggressively**: Use service workers
4. **Monitor Bundle**: `npm run build -- --visualize`

---

## 📖 Related Documents

- [README.md](README.md) - Main documentation
- [QUICK_START.md](QUICK_START.md) - 3-step setup
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical deep-dive
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy guide
- [UPDATE_LOG.md](UPDATE_LOG.md) - What's new
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Status summary

---

## 🎌 Gombatte! (頑張って!)

**Keep Learning!** 📚  
**Happy Coding!** 💻  
**Good Luck!** 🍀

---

**Last Updated**: 22 Mar 2026 | **Version**: v2.0.0 | **Status**: Active
