# UTH_LTWeb_Chatbot

Đồ án kết thúc môn webapp chatbot đa phong cách, xây dựng theo mô hình full-stack hiện đại: Node.js, Express, Firebase, Gemini API, Bootstrap 5. Hỗ trợ xác thực người dùng, lưu lịch sử chat, giao diện SPA responsive, bảo mật và dễ mở rộng.

---

## Tính năng nổi bật

- **Chatbot đa phong cách**: Chọn giữa các kiểu trả lời (mặc định, sáng tạo, ngắn gọn).
- **Xác thực người dùng**: Đăng nhập an toàn qua Firebase OAuth.
- **Lưu lịch sử chat**: Mỗi user có nhiều phiên chat, lưu trữ trên Firestore.
- **Giao diện SPA**: Responsive, tối ưu accessibility, toast/modal, chuyển đổi phiên mượt mà.
- **Bảo mật**: Rate limit, kiểm tra & làm sạch dữ liệu, không lưu secret trong code.
- **Dễ mở rộng**: Backend/frontend tách biệt, dễ thêm style bot hoặc tính năng mới.
- **Kiểm thử**: Unit test backend với Jest, mock Firebase & Gemini API.

---

## Kiến trúc tổng thể

### Backend (`/src/backend/`)

- **Express API**: Xử lý xác thực, quản lý phiên chat, gửi/nhận tin nhắn.
- **Service**:
  - `authService.js`: Xác thực token Firebase.
  - `firestoreService.js`: CRUD phiên/chat, quản lý trạng thái chờ trả lời.
  - `geminiService.js`: Tích hợp Gemini API cho AI trả lời & gợi ý.
- **Middleware**: `firebaseAuth.js` bảo vệ các endpoint chat.
- **Bảo mật**: Giới hạn 60 req/phút/IP, validate & sanitize dữ liệu.

### Frontend (`/public/`)

- **HTML/CSS/JS**: SPA với Bootstrap 5, responsive, tối ưu accessibility.
- **JS Logic** (`public/js/script.js`):
  - Quản lý trạng thái đăng nhập, CRUD phiên, gửi tin nhắn, cập nhật UI.
  - Điều hướng SPA, modal cài đặt (đổi tên phiên, chọn style, lưu API key Gemini vào localStorage).
  - Hỗ trợ accessibility: trap focus, ARIA, điều hướng bàn phím, toast/modal.

### Shared (`/src/shared/`)

- **botStyles.js**: Định nghĩa các phong cách trả lời của bot.
- **utils.js**: Tiện ích dùng chung (ví dụ: định dạng thời gian).

### Kiểm thử (`/tests/`)

- **Jest**: Unit test cho các service backend (auth, Firestore, Gemini).
- **Mock**: Giả lập Firebase & Gemini API để kiểm thử độc lập.

---

## Mô hình dữ liệu Firestore

```
users (collection)
  └─ {userId} (document)
      ├─ email, displayName
      └─ sessions (subcollection)
          └─ {sessionId} (document)
              ├─ title, botStyle, debugMode, isPendingReply
              └─ messages (subcollection)
                  └─ {messageId} (sender, content, timestamp)
```

---

## API Backend

| Method       | Endpoint              | Chức năng                                         |
| ------------ | --------------------- | ------------------------------------------------- |
| POST         | /api/auth/login       | Xác thực Firebase ID token                        |
| GET          | /api/chat/sessions    | Lấy danh sách phiên chat của user (cần đăng nhập) |
| POST         | /api/chat/newSession  | Tạo phiên chat mới, chọn style                    |
| GET          | /api/chat/session/:id | Lấy toàn bộ tin nhắn trong một phiên              |
| POST         | /api/chat/sendMessage | Gửi tin nhắn, nhận trả lời từ Gemini, lưu kết quả |
| PATCH/DELETE | /api/chat/session/:id | Đổi tên/đổi style/xóa phiên chat                  |

---

## Bảo mật & Best Practices

- **Trạng thái chờ trả lời**: Mỗi phiên chỉ gửi được 1 tin nhắn tại một thời điểm (`isPendingReply`), tránh gửi song song khi bot chưa trả lời xong.
- **Validate & sanitize**: Kiểm tra và làm sạch toàn bộ dữ liệu đầu vào/ra.
- **Không lưu secret trong code**: Sử dụng `.env` cho thông tin nhạy cảm (không commit lên repo).
- **Cập nhật dependencies**: Thường xuyên update và kiểm tra lỗ hổng bảo mật.

---

## Hướng dẫn cài đặt & chạy

### Yêu cầu

- Node.js >= 18
- pnpm (hoặc npm)
- Gemini API Key
- Firebase Service Account (Firestore, Auth)

### Cài đặt

```bash
git clone https://github.com/bruksama/UTH_LTWeb_Chatbot.git
cd UTH_LTWeb_Chatbot

pnpm install
# hoặc
npm install
```

### Thiết lập cấu hình

- Tạo file `.env` từ mẫu `.env.example` và điền:
  - `GEMINI_API_KEY`
  - `FIREBASE_SERVICE_ACCOUNT` (JSON)
  - `PORT` (tùy chọn, mặc định 3000)

### Khởi chạy

```bash
# Production
pnpm start
# hoặc
npm start

# Phát triển (tự reload khi code thay đổi)
pnpm run dev
# hoặc
npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

---

## Đóng góp & phát triển

- Mọi góp ý, báo lỗi hoặc đề xuất vui lòng tạo issue hoặc pull request.
