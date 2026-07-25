# BUG FIX TASKS
**Project:** Lingo Flow (English Smart Learning)
**Date:** 2026-07-22

| ID | Priority | Module | Problem | Proposed Fix | Complexity | Status |
| -- | -------- | ------ | ------- | ------------ | ---------- | ------ |
| TSK-01 | High | AI Integration | Môi trường thiếu khóa API thật, chưa thể kiểm chứng Live ChatGPT Gateway. | Cập nhật file `application.yml` hoặc inject `OPENAI_API_KEY` Environment Variables trên server Production. | S | Open |
| TSK-02 | High | Commerce | Cổng thanh toán chỉ mới có logic Fake Webhook. HMAC tuy an toàn nhưng chưa cắm API VNPAY/Momo thật. | Tích hợp VNPAY SDK hoặc Momo SDK, viết Service riêng để lấy QR code / URL Redirect. | L | Open |
| TSK-03 | Medium | Auth | Tính năng Quên mật khẩu chỉ đang in ra log (Logger), chưa gửi email khôi phục thật. | Tích hợp JavaMailSender với cấu hình SMTP (như SendGrid hoặc Gmail App Passwords) trong `application.yml`. | M | Open |
| TSK-04 | Medium | Deployment | Lệnh `mvnw spring-boot:run` gặp lỗi "Could not find or load main class" do cấu hình Maven Classpath hoặc do đường dẫn có chứa dấu cách/kí tự đặc biệt. | Đổi đường dẫn project (hiện đang nằm ở `.../Dự án nhóm 3...`) sang đường dẫn tiếng Anh không dấu, hoặc sửa cấu hình Maven Plugin Boot. | S | Open |

---

## Task Details

### Task ID: TSK-01
- **Priority**: High
- **Type**: Missing Feature / Configuration
- **Module**: Chatbot AI
- **File liên quan**: `application.yml`, `OpenAiProvider.java`
- **Điều kiện tái hiện**: Gọi thử API chatbot khi chưa set up key.
- **Kết quả hiện tại**: Fallback AI Provider được kích hoạt và trả về tin nhắn tự sinh.
- **Kết quả mong đợi**: Gọi sang OpenAPI và trả về kết quả GPT.
- **Nguyên nhân dự đoán**: Thiếu Key.
- **Đề xuất cách sửa**: Thiết lập biến môi trường.
- **Complexity**: S
- **Status**: Open

### Task ID: TSK-02
- **Priority**: High
- **Type**: Missing Feature
- **Module**: Payment
- **File liên quan**: `PaymentController.java`, `CommerceServiceImpl.java`
- **Điều kiện tái hiện**: Nhấn nút "Thanh toán".
- **Kết quả hiện tại**: Chạy giả lập và gọi Webhook nội bộ (có dùng HMAC).
- **Kết quả mong đợi**: Redict sang trang ngân hàng thật.
- **Nguyên nhân dự đoán**: Chưa code logic gateway.
- **Đề xuất cách sửa**: Viết VnpayService.
- **Complexity**: L
- **Status**: Open

### Task ID: TSK-03
- **Priority**: Medium
- **Type**: Missing Feature
- **Module**: Auth / Password Reset
- **File liên quan**: `AuthServiceImpl.java`
- **Điều kiện tái hiện**: Nhấn "Quên mật khẩu".
- **Kết quả hiện tại**: Token reset in ra màn hình terminal.
- **Kết quả mong đợi**: Có email gửi về tài khoản người dùng.
- **Nguyên nhân dự đoán**: Chưa có cấu hình SMTP (`spring.mail.*`).
- **Đề xuất cách sửa**: Thêm cấu hình SMTP, sử dụng `JavaMailSender`.
- **Complexity**: M
- **Status**: Open

### Task ID: TSK-04
- **Priority**: Medium
- **Type**: Bug / Environment
- **Module**: Build System
- **File liên quan**: `pom.xml`
- **Điều kiện tái hiện**: Chạy `mvnw spring-boot:run`.
- **Kết quả hiện tại**: Báo lỗi không tìm thấy Main Class.
- **Kết quả mong đợi**: Server start ở port 8080.
- **Nguyên nhân dự đoán**: Thư mục chứa project có ký tự đặc biệt / unicode (Ví dụ: `Dự án nhóm 3 người môn t2 t3`), dẫn đến lỗi Maven classpath trên Windows.
- **Đề xuất cách sửa**: Đổi tên folder sang tiếng Anh hoặc loại bỏ ký tự lạ.
- **Complexity**: S
- **Status**: Open
