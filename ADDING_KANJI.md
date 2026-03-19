# Bắt đầu Nhanh: Thêm Dữ liệu Kanji

Hướng dẫn này chỉ cho bạn cách thêm nhiều chữ Hán (Kanji) hơn vào cơ sở dữ liệu.

## 📝 Phương pháp Đơn giản: Thêm vào file JSON

### Bước 1: Mở File Dữ liệu
```
src/data/kanjiData.json
```

### Bước 2: Thêm Một Mục Kanji Mới

Mỗi một mục Kanji có cấu trúc như sau:
```json
{
  "id": "n5_006",
  "kanji": "火",
  "onyomi": "カ",
  "kunyomi": "ひ",
  "meaning": "fire",
  "meaningVi": "lửa",
  "examples": [
    {
      "kana": "火事",
      "romaji": "kaji",
      "meaning": "fire, conflagration",
      "meaningVi": "hỏa hoạn"
    },
    {
      "kana": "火曜日",
      "romaji": "kayoubi",
      "meaning": "Tuesday",
      "meaningVi": "thứ ba"
    },
    {
      "kana": "火傷",
      "romaji": "yakedo",
      "meaning": "burn",
      "meaningVi": "bỏng"
    }
  ]
}
```

### Bước 3: Đưa vào Cấp độ Phù hợp

**N5 (Sơ cấp)** - Các Kanji đơn giản và thông dụng nhất (Tổng cộng ~300)
**N4 (Trung cấp)** - Phức tạp hơn môt chút (Tổng cộng ~500)
**N3 (Trung-Cao cấp)** - Phức tạp, hiếm gặp hơn (Tổng cộng ~700)

Ví dụ:
```json
{
  "N5": [
    { các kanji đã có sẵn... },
    { kanji bạn vừa thêm... }
  ]
}
```

### Bước 4: Quy tắc Đặt tên ID

- Định dạng: `n{cấp_độ}_{số_thứ_tự}`
- Ví dụ: `n5_001`, `n5_002`, `n4_001`, `n3_005`
- Việc đánh số có thể linh hoạt (không bắt buộc phải liên tiếp tăng dần)

## 📚 Nguồn Lấy Dữ liệu

### Các Trợ thủ Đắc lực

#### 1. JISHO.org
- Website: https://jisho.org
- Tra cứu bất kỳ chữ Kanji nào
- Xem cách đọc, ý nghĩa, và câu/từ ví dụ
- **Mẹo hay**: Nhấn vào nút "Filter by JLPT" (Lọc theo JLPT)

#### 2. KanjiAlive
- Website: https://kanjialive.com
- Bao gồm hướng dẫn cách viết từng nét (animation)
- Phân tách cấu tạo bộ thủ (radicals)
- Nguồn gốc của từ (Etymology)

#### 3. WANIKANI
- Website: https://www.wanikani.com
- Hệ thống giáo trình Kanji toàn diện
- Các mẹo nhớ mẹo vặt học từ cộng đồng
- (Yêu cầu phải có tài khoản)

#### 4. KANJIDIC Project
- Nguồn dữ liệu từ điển Kanji miễn phí
- Điểm tham chiếu chuẩn cho tất cả phần mềm Kanji hiện nay

### Ví dụ: Cóp nhặt Kanji từ JISHO

1. Truy cập https://jisho.org
2. Gõ tìm chữ Kanji ban muốn: `火`
3. Ghi lại các thông tin:
   - **Meaning** (Ý nghĩa): fire (Từ này dịch sang tiếng Việt: lửa)
   - **On** (Âm Ôn): カ (Onyomi)
   - **Kun** (Âm Cún): ひ (Kunyomi)
   - **Sentences/Words**: Dùng mấy cái này làm câu ví dụ

## ✅ Danh sách Rà soát trước khi Lưu

Trước khi lưu file phân phối Kanji, hãy đảm bảo:

- [ ] **ID là duy nhất**: Không có ID nào bị trùng lặp trong file
- [ ] **Kanji hợp lệ**: Rõ ràng là 1 ký tự Kanji chuẩn Unicode
- [ ] **Onyomi**: Phải viết bằng Katakana (VD: カ, tuyệt đối không dùng か)
- [ ] **Kunyomi**: Phải viết bằng Hiragana với dấu chấm ngắt (VD: ひ.ける)
- [ ] **Meaning**: Đoạn dịch tiếng Anh ngắn gọn, rõ nghĩa
- [ ] **MeaningVi**: Đoạn dịch tiếng Việt ngắn gọn, thuần Việt 
- [ ] **Examples**: Ít nhất có 2-3 từ ghép làm ví dụ
- [ ] **Example Kana**: Viết đúng Hiragana/Kanji
- [ ] **JSON hợp lệ**: Không dư thiếu dấu phẩy/ngoặc (hãy dùng tool check JSON)

## 🔍 Xác nhận File JSON

### Dùng VS Code
1. Cài Extension có tên "JSON Formatter"
2. Chuột phải → Format Document
3. Nó sẽ gạch chân đỏ nêú bạn thiếu dấu phẩy hoặc dư dấu ngoặc.

### Dùng Web Kiểm tra
- https://jsonlint.com
- https://www.json-lint.com

### Dùng Command Line (Node.js) chạy thử
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/kanjiData.json')))"
```

Nếu không có chữ Error màu đỏ nào văng ra, file JSON của bạn hoàn hảo ✅

## 📦 Cách Đẩy Kanji Hàng Loạt (Dành cho Dân khối kỹ thuật)

### Phương án 1: Viết Script bằng JavaScript

Tạo file `scripts/addKanji.js`:

```javascript
const fs = require('fs')

const newKanjiList = [
  {
    id: "n5_006",
    kanji: "火",
    onyomi: "カ",
    kunyomi: "ひ",
    meaning: "fire",
    meaningVi: "lửa",
    examples: [...]
  }
  // Thêm chục ngàn từ nữa ở đây
]

// Đọc data cũ
const data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'))

// Push đống mới và mảng N5
data.N5.push(...newKanjiList)

// Lưu lại file
fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(data, null, 2))

console.log('Thêm Kanji thành công mỹ mãn!')
```

Chạy file:
```bash
node scripts/addKanji.js
```

### Phương án 2: Script bằng Python

```python
import json

with open('src/data/kanjiData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_kanji = {
    "id": "n5_006",
    "kanji": "火",
    "onyomi": "カ",
    "kunyomi": "ひ",
    "meaning": "fire",
    "meaningVi": "lửa",
    "examples": [
        {
            "kana": "火事",
            "romaji": "kaji",
            "meaning": "fire",
            "meaningVi": "hỏa hoạn"
        }
    ]
}

data['N5'].append(new_kanji)

with open('src/data/kanjiData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Đã thêm Kanji!")
```

## 🔄 Kiểm tra Thành Quả Của Bạn

1. **Nhấn Lưu (Save) file JSON**
2. **App sẽ tự động Reload** (do đang chạy `npm run dev`)
3. **Mở giao diện Web**, bấm vào cấp độ chữ bạn vừa nhồi
4. **Chữ Tự Nổi Lên** trong danh sách câu đố của Quiz
5. **Gõ Romaji thử** xem bộ gõ Autocomplete còn nhận diện được từ mới này không

### Gỡ Lỗi (Troubleshooting)

**App vẫn hiện bộ từ vựng cũ**
- Xóa bộ đệm duyệt web (Ctrl+Shift+Delete)
- F5 tải lại trang liên tục
- Mở F12 soi tab Error

**Ô Gợi ý (Autocomplete) không hiện chữ Kanji mới thêm**
- Check kỹ xem chỗ Kunyomi có ghi sai định dạng Hiragana không
- Coi chừng gõ nhầm chữ ở phần "kana"
- Đảm bảo gõ Romaji khớp với chữ Hiragana đã ghi vào. (Gồm cả romaji được import ở phần examples)

**JSON Syntax Error báo đổ máu web**
- Xài chức năng check lỗi của VS Code
- Đặc biệt chú ý dấu ngoặc kép phẳng (`"` chứ không phải `”`)
- Cấm để dấu phẩy ở phần tử cuối cùng của mảng json.

## 📈 Danh sách Kanji thông dụng chia theo tần suất

### 50 Từ Kanji N5 Thấy Quen Thuộc Nhất
一, 二, 三, 四, 五, 六, 七, 八, 九, 十, 百, 千, 万, 円, 人, 日, 月, 火, 水, 木, 金, 土, 天, 地, 山, 川, 雨, 風, 雲, 雪, 海, 湖, 島, 森, 草, 花, 木, 樹, 竹, 石, 砂, 土, 水, 火, 田, 畑, 道, 路, 街, 町

### 1 Số từ Kanji N4 Hay Bám Rễ
運, 動, 夜, 昼, 朝, 昼, 午, 前, 後, 中, 外, 内, 上, 下, 左, 右, 東, 西, 南, 北, 学, 校, 先, 生, 用, 事, 家, 族, 親, 子

## 💾 Nhớ Sao Lưu Trước Khi Vọc (Backup)

Khi bạn muốn xóa sửa hàng loạt, chạy lệnh sau cho lành:

```bash
# Tạo bản phân thân an toàn
cp src/data/kanjiData.json src/data/kanjiData.json.backup

# Ôi không! Lỡ tay xoá mịa mất code. Đừng lo, phục hồi lại bằng tệp Backup thôi:
cp src/data/kanjiData.json.backup src/data/kanjiData.json
```

---

**Cần Xếp Hạng Hỗ Trợ?**
- Qua `/ARCHITECTURE.md` lôi kiến thức kỹ thuật
- Lật `/README.md` xem thiết lập cơ bản
- Mở `/src/data/kanjiData.json` mà bắt chước cách họ làm

Mãi yêu việc học tiếng Nhật! 学習頑張ってください！
