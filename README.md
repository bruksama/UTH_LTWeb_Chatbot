# UTH Chatbot

Đồ án website chatbot đơn giản được xây dựng với Node.js, Express và giao diện tĩnh sử dụng HTML, CSS, JavaScript và Bootstrap.

## Cấu trúc dự án & Quy trình làm việc

Dự án này tuân theo cấu trúc tiêu chuẩn của một ứng dụng web với backend Node.js và frontend tĩnh. Dưới đây là mô tả các thư mục và tệp chính:

```plaintext
UTH_Chatbot/
├── public/                   # Chứa tất cả tài nguyên frontend tĩnh
│   ├── assets/               # Chứa các tài nguyên phụ thuộc, như Bootstrap, các hình ảnh,...
│   ├── css/
│   │   └── style.css         # CSS chính cho website
│   ├── js/
│   │   └── script.js         # JavaScript chính cho website, thực hiện xử lý phía Client
│   └── index.html            # Tệp HTML chính
│
├── src/                      # Chứa mã nguồn backend
│   └── server.js             # Triển khai logic API
│
├── package.json              # Danh sách các thư viện phụ thuộc và script
├── package-lock.json         # Ghi lại chính xác phiên bản của các thư viện
└── README.md                 # Tệp này: tổng quan dự án và hướng dẫn cài đặt
```

**Giải thích quy trình làm việc:**

1.  **Thư mục `public/`**: Đây là nơi chứa tất cả các tệp phía client sẽ được phục vụ trực tiếp tới trình duyệt người dùng.

    - **`public/assets/`**: Chứa các tài nguyên phụ thuộc như hình ảnh, thư viện,...
    - **`public/css/style.css`**: Chứa các quy tắc tạo kiểu giao diện. Định nghĩa cách các thành phần trong `index.html` hiển thị (màu sắc, bố cục, phông chữ, ...).
    - **`public/js/script.js`**: Xử lý toàn bộ logic tương tác phía frontend, bao gồm:
      - Lắng nghe nhập liệu của người dùng (gõ tin nhắn, nhấn gửi).
      - Gửi tin nhắn của người dùng tới backend API.
      - Nhận phản hồi từ backend API.
      - Hiển thị tin nhắn của người dùng và bot lên giao diện chat (`index.html`).
    - **`public/index.html`**: Trang chính mà người dùng nhìn thấy. Cấu trúc giao diện chat (trường nhập liệu, khu vực hiển thị tin nhắn) và liên kết tới `style.css` (tạo kiểu) và `script.js` (chức năng). Bao gồm cả Bootstrap để sử dụng các thành phần UI dựng sẵn.

2.  **Thư mục `src/`**: Chứa logic phía server.

    - **`src/server.js`**: Sử dụng Node.js và Express để:
      - Tạo HTTP server.
      - Phục vụ các tệp tĩnh từ thư mục `public/` (khi người dùng truy cập website, `index.html` sẽ được gửi về).
      - Định nghĩa các endpoint API.

3.  **`package.json`**: Tệp manifest cho dự án Node.js.

    - Liệt kê thông tin dự án (tên, phiên bản, tác giả).
    - Đặc biệt, định nghĩa `dependencies` là các thư viện cần thiết để chạy dự án, và `devDependencies` chỉ dùng trong quá trình phát triển.
    - Chứa các `scripts` là các lệnh tắt để chạy các tác vụ phổ biến, ví dụ `npm start` để chạy server hoặc `npm run dev` để chạy với `nodemon` (tự động khởi động lại server khi có thay đổi).

4.  **`package-lock.json`**: Được tạo/cập nhật tự động bởi `npm`. Ghi lại chính xác phiên bản của tất cả các thư viện đã cài đặt và các phụ thuộc con của chúng. Đảm bảo rằng bất kỳ ai cài đặt dự án cũng sẽ có đúng các phiên bản này, giúp dự án hoạt động nhất quán.

5.  **`README.md`**: Cung cấp thông tin về dự án, cấu trúc và hướng dẫn sử dụng.

**Luồng dữ liệu (Khi người dùng gửi tin nhắn):**

1.  Người dùng nhập tin nhắn trên trình duyệt (`public/index.html`) và nhấn "Send".
2.  `public/js/script.js` bắt sự kiện và lấy nội dung tin nhắn.
3.  `script.js` gửi yêu cầu HTTP POST tới endpoint trên server, kèm theo tin nhắn trong body.
4.  `src/server.js` (ứng dụng Express) nhận yêu cầu.
5.  Logic phía server xử lý tin nhắn.
6.  `server.js` gửi phản hồi HTTP về cho client (trình duyệt), thường ở dạng JSON.
7.  `script.js` nhận phản hồi và cập nhật `index.html` để hiển thị tin nhắn của bot trong khung chat.

## Cài đặt và chạy Chatbot

**Yêu cầu:**

- [Node.js](https://nodejs.org/) (bao gồm cả npm)
- [Gemini API Key](https://aistudio.google.com/apikey)

**Cài đặt:**

1.  Clone repository (hoặc tải về các tệp):

    ```bash
    git clone <repository-url>
    ```

2.  Cài đặt các thư viện phụ thuộc:

    ```bash
    npm install
    ```

3.  Đổi tên tệp `.env.exapmple` thành `.env`, sau đó tùy chỉnh:

- `GEMINI_API_KEY`: dán key đã chuẩn bị
- `PORT`: nếu để trống, cổng mặc định là 3000

**Khởi chạy:**

1.  **Chạy ở chế độ production:**

    ```bash
    npm start
    ```

    Lệnh này sẽ khởi động server bằng Node trực tiếp.

2.  **Chạy ở chế độ phát triển (tự động khởi động lại khi có thay đổi):**
    ```bash
    npm run dev
    ```
    Sử dụng `nodemon` để theo dõi thay đổi trong mã nguồn và tự động khởi động lại server.

Sau khi server chạy, bạn có thể truy cập chatbot bằng cách mở trình duyệt và vào địa chỉ:

[http://localhost:3000](http://localhost:3000) hoặc cổng được tùy chỉnh trong `.env`

## Việc cần làm / Định hướng phát triển

- Tích hợp với dịch vụ NLP/AI nâng cao để phản hồi bot.
- Thêm chức năng xác thực người dùng.
- Lưu lịch sử chat vào cơ sở dữ liệu.
- Bổ sung các thành phần UI tương tác hơn.
