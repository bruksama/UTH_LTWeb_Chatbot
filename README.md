# UTH_LTWeb_Chatbot

Website chatbot AI đa phong cách, xây dựng với Node.js, Express, Gemini API, Firebase và giao diện tĩnh sử dụng HTML, CSS, JavaScript, Bootstrap 5.

## 1. Tổng quan dự án

- Chatbot AI trả lời tự nhiên, đa phong cách
- Xác thực người dùng qua Firebase OAuth
- Lưu trữ lịch sử chat theo từng phiên, từng user trên Firestore
- Giao diện responsive, tối ưu UI/UX, toast/modal chuẩn accessibility

## 2. Cấu trúc dự án

```plaintext
UTH_LTWeb_Chatbot/
├── public/                # Tài nguyên frontend tĩnh (HTML, CSS, JS, assets)
├── src/
│   ├── backend/           # Mã nguồn backend (API, service, middleware)
│   └── shared/            # Tài nguyên dùng chung khác, style bot, util
├── package.json           # Thư viện phụ thuộc & script
├── pnpm-lock.yaml         # Quản lý version phụ thuộc
└── README.md              # Tài liệu này
```

## 3. Luồng hoạt động

1. Người dùng đăng nhập qua Firebase OAuth
2. Truy cập giao diện chính `/`
3. Lấy danh sách phiên chat `/api/chat/sessions`
4. Tạo phiên mới `/api/chat/newSession` (chọn style)
5. Gửi tin nhắn `/api/chat/sendMessage` (backend xử lý, lưu, trả kết quả)
6. Lưu toàn bộ lịch sử chat trên Firestore

## 4. API Backend

| Method | Endpoint              | Chức năng                                 |
| ------ | --------------------- | ----------------------------------------- |
| POST   | /api/auth/login       | Xác thực Firebase ID token                |
| GET    | /api/chat/sessions    | Lấy danh sách phiên chat của user         |
| POST   | /api/chat/newSession  | Tạo phiên chat mới, chọn style            |
| GET    | /api/chat/session/:id | Lấy toàn bộ tin nhắn trong một phiên      |
| POST   | /api/chat/sendMessage | Gửi message, gọi Gemini API, lưu & trả về |

## 5. Firestore Structure

```
users (collection)
  └─ {userId} (document)
      ├─ email, displayName
      └─ sessions (subcollection)
          └─ {sessionId} (document)
              ├─ title, botStyle, debugMode
              └─ messages (subcollection)
                  └─ {messageId} (sender, content, timestamp)
```

## 6. Cài đặt & chạy dự án

### Yêu cầu

- Node.js >= 18
- pnpm (hoặc npm)
- Gemini API Key
- Firebase Service Account (Firestore, Auth)

### Cài đặt

```bash
# Clone repo
$ git clone <repository-url>
$ cd UTH_LTWeb_Chatbot

# Cài đặt phụ thuộc
$ pnpm install
# hoặc
$ npm install
```

### Thiết lập cấu hình

- Tạo file `.env` từ mẫu `.env.example` và điền:
  - `GEMINI_API_KEY`: API key Gemini
  - `FIREBASE_SERVICE_ACCOUNT`: Thông tin service account Firebase (JSON)
  - `PORT`: (tuỳ chọn, mặc định 3000)

### Khởi chạy

```bash
# Production
$ pnpm start
# hoặc
$ npm start

# Phát triển (tự reload khi code thay đổi)
$ pnpm run dev
# hoặc
$ npm run dev
```

Truy cập: [http://localhost:3000](http://localhost:3000)

## 7. Bảo mật & tối ưu

- Tích hợp rate limit (60 request/phút/IP) cho API
- Kiểm soát trạng thái chờ trả lời (isPendingReply) ở mỗi session: mỗi session chỉ gửi được 1 tin nhắn tại một thời điểm, không thể gửi song song khi bot chưa trả lời xong.
- Validate dữ liệu đầu vào, sanitize dữ liệu trả về
- Không hardcode thông tin bí mật, bảo mật token
- Thường xuyên cập nhật dependencies, kiểm tra lỗ hổng

## 8. Định hướng phát triển

- Bổ sung các style bot mới, tuỳ biến sâu hơn
- Thêm phân tích biểu đồ, gợi ý hỏi tiếp
- Tối ưu UI/UX, accessibility, trạng thái toast
- Bổ sung unit test cho backend
- Tích hợp thêm dịch vụ AI khác nếu cần

---

**Mọi góp ý, báo lỗi hoặc đề xuất vui lòng tạo issue trên repository.**
