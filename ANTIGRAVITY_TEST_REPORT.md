# ANTIGRAVITY TEST REPORT
**Project:** Lingo Flow (English Smart Learning)
**Date:** 2026-07-22
**Role:** Senior QA Engineer, Security Tester, Full-stack Test Engineer

---

## 1. Test Environment
- **OS**: Windows
- **Backend**: Java 21, Spring Boot 3.3.5
- **Frontend**: Node 24.16.0, React 18, Vite
- **Database**: MySQL (localhost:3306)
- **AI Provider**: OpenAI (Configured in application.yml)

## 2. Build Results
- **Backend Build (`mvnw clean test`)**: `PASS` (Build Success, Time: 28.8s)
- **Frontend Build (`npm install && npm run build`)**: `PASS`
- **Database Migration**: `PASS` (Hibernate Auto-DDL)

## 3. Automated Test Results
- **Total Tests**: 14
- **Passed**: 14
- **Failed**: 0
- **Coverage Highlights**: 
  - `AiServiceImplTest` (Mocked Fallback/Rate Limit)
  - `AssessmentServiceImplSnapshotTest` (Question snapshot logic)
  - `CommerceServiceImplWebhookTest` (Payment status transitions)
  - `AuthServiceImplPasswordResetTest` (Password reset token)

## 4. Frontend–Backend Connection Matrix

| Page | Frontend File | API Called | Backend Endpoint | Data Source | Reload Persists | Status |
| ---- | ------------- | ---------- | ---------------- | ----------- | --------------- | ------ |
| Login | `LoginPage.jsx` | Yes | `/api/auth/login` | DB | Yes | `PASS` |
| Course Detail | `CourseLearningPage.jsx` | Yes | `/api/courses/{id}` | DB | Yes | `PASS` |
| Cart | `CartPage.jsx` | Yes | `/api/commerce/cart` | DB | Yes | `PASS` |
| Assessment | `TestPage.jsx` | Yes | `/api/assessment/*` | DB | Yes | `PASS` |
| Chatbot | `ChatbotPage.jsx` | Yes | `/api/ai/chat` | DB/AI | Yes | `NOT VERIFIED` |
| Teacher Mgmt | `VocabularyManagementPage.jsx`| Yes | `/api/teacher/courses`| DB | Yes | `PASS` |

## 5. Authentication Results
| Scenario | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
| Đăng nhập đúng | Trả về JWT Token | JWT Token hợp lệ | `PASS` |
| Đăng nhập sai | 401 Unauthorized | 401 Unauthorized | `PASS` |
| Truy cập API không token | 401 Unauthorized | 401 Unauthorized | `PASS` |
| Token hết hạn | 401 Unauthorized | 401 Unauthorized | `PASS` |

## 6. Authorization Results
| Scenario | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
| Student truy cập API Admin | 403 Forbidden | 403 Forbidden | `PASS` |
| Teacher sửa khóa học của người khác | 403 Forbidden | 403 Forbidden | `PASS` |
| Teacher tạo bài học | 200 OK / 201 Created | 201 Created | `PASS` |

## 7. Course Results
- **Student xem khóa học**: Hoạt động bình thường. Phân trang và tìm kiếm gọi API đúng.
- **Tiến độ học tập**: Calling `startLessonProgress` and `completeLessonProgress` persists progress properly in DB.
- **Teacher tạo khóa học**: Hoạt động, ID khóa học nay đã dùng UI Dropdown.
- **Status**: `PASS`

## 8. Commerce and Payment Results
- **Thêm vào giỏ hàng**: Kiểm tra điều kiện mua trùng -> `PASS`.
- **Áp dụng mã Coupon**: Logic coupon chỉ tiêu thụ khi Payment hoàn tất -> `PASS`.
- **Trạng thái đơn hàng CANCELED**: CANCELED không chuyển sang PAID -> `PASS`.
- **Payment Webhook HMAC**: Đã bảo mật Webhook bằng thuật toán HmacSHA256 -> `PASS`.
- **Tích hợp cổng thanh toán thật**: 
> REAL PAYMENT PROVIDER: NOT IMPLEMENTED

## 9. Assessment Results
- **IDOR trong bài thi**: Teacher không thể xóa hay chỉnh sửa câu hỏi của Teacher khác. Đã test bảo mật `ensureTeacherOwnsQuestion` -> `PASS`.
- **Data Snapshot**: Khi Student nhấn bắt đầu thi, đề thi được copy JSON snapshot để khóa dữ liệu, sửa đề sau đó không làm thay đổi điểm lịch sử -> `PASS`.

## 10. Chatbot AI Results
- **HTTP Request**: Gọi thành công `/api/ai/chat`.
- **Logic Fallback**: Chạy tốt (Khi mất kết nối AI, trả về `fallback = true`).
- **Lưu lịch sử**: Ghi thành công vào `AiConversation`.
- **Live Integration Test**:
> CHATBOT LIVE INTEGRATION: NOT VERIFIED
*(Thiếu biến môi trường `OPENAI_API_KEY` thực tế để test end-to-end với OpenAI Gateway. Tính năng hiện tại đã được cấu trúc đúng tiêu chuẩn `/v1/chat/completions` nhưng chỉ đang chạy mock test hoặc fallback ở môi trường local này).*

## 11. Password Reset Results
- **API không lộ token**: Response không trả raw token.
- **Email Delivery**: Hệ thống chỉ in ra log (Logger), chưa tích hợp SMTP Server thật.
> PASSWORD RESET EMAIL DELIVERY: NOT IMPLEMENTED

## 12. Database Results
- **Migration**: Auto DDL update hoạt động.
- **Relations**: Khóa ngoại Course -> Lesson, Order -> Transaction chuẩn xác.
- **Transaction Rollback**: Đã áp dụng `@Transactional` -> `PASS`.

## 13. UI/UX Results
- **Theme**: Dark Mode Glassmorphic được tích hợp (Premium Aesthetic).
- **Responsive**: Hỗ trợ Desktop và Mobile.
- **UX**: Forms có trạng thái Loading, báo lỗi bằng thông báo Toast/Red text.
- **Status**: `PASS`

## 14. Security Results
- IDOR (Insecure Direct Object Reference): Đã rà soát ở module Teacher/Assessment.
- JWT Security: API Key và Secret hoàn toàn giữ ở Backend, không trả về Frontend.
- Webhook Replay/Forgery: Được bảo vệ bởi HmacSHA256.
- **Status**: `PASS`

## 15. Failed Test Cases
Không có Test Case FAIL do lỗi kỹ thuật (14/14 automated tests PASS). 

## 16. Not Verified Items
- Cổng thanh toán thật (Real Payment Gateway API).
- AI Provider thực (Real OpenAI API Key).
- Gửi Email Khôi phục Mật khẩu thực (Real SMTP Server).

## 17. Remaining Risks
- Việc thiếu Payment Gateway thực tế có nghĩa là hệ thống Commerce chưa sẵn sàng 100% cho Production.
- Cần có hệ thống Retry Backoff mạnh mẽ hơn cho AI Provider ngoài những gì Spring RestClient hiện cung cấp.

---
**KẾT LUẬN KIỂM THỬ**
- **Tổng số automated test**: 14
- **PASS**: 14
- **FAIL**: 0
- **NOT VERIFIED**: 2 (AI, Payment)
- **NOT IMPLEMENTED**: 1 (Email SMTP)
- **Tổng lỗi Critical**: 0
- **Tổng lỗi High**: 0
- **Đủ điều kiện deploy Staging?**: Có (Cần config API keys thực).
- **Đủ điều kiện deploy Production?**: Chưa (Thiếu Payment Provider & SMTP Server).
