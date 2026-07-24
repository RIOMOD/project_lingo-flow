# Project Audit and Fix Plan

## 1. Project Overview
The project is a full-stack smart English learning platform (Lingo Flow).
- **Frontend**: React 18, Vite, React Router DOM (no standard state management library like Redux/Zustand is visible at a glance).
- **Backend**: Spring Boot 3.3.5, Java 21, Spring Data JPA, Spring Security, JWT (jjwt), MySQL.
- **Goal**: Audit code, identify missing connections, detect bugs & security vulnerabilities, and propose a prioritized fix plan.

## 2. Build and Run Results
- **Frontend**: Successfully verified `package.json` and build scripts.
- **Backend**: Successfully verified `pom.xml`. Backend is using standard Spring Boot structure.
- **Environment**: `.env.example` verified for both frontend and backend. Backend requires MySQL.
- *Note: Deep functionality verification is done via source code static analysis.*

## 3. Frontend–Backend Connection Matrix
| Module | Page | API gọi đến | Backend endpoint | Trạng thái | Vấn đề |
| ------ | ---- | ----------- | ---------------- | ---------- | ------ |
| Admin | Course Publish | `GET /api/admin/courses` | `/api/admin/courses` | Dùng Mock / Lỗi | Code chứa hard-coded data/TODO. |
| Student | Vocabulary / Grammar | `GET /api/progress/...` | N/A | Chỉ có UI/Mock | Đang dùng mock data hoặc placeholder. |
| Student | Writing Correction | `POST /api/ai/correct` | `/api/ai/...` | Dùng Mock | Có file chứa mock data. |
| Teacher| Question Bank | `GET /api/teacher/questions` | `/api/teacher/questions` | Dùng Mock / Lỗi | Có file chứa placeholder/mock. |
| Guest | Auth (Login/Reg) | `POST /api/auth/...` | `/api/auth/...` | Đã kết nối | Có thể còn lỗi UI state / validation. |
| Student | Cart/Checkout | `POST /api/cart/...` | `/api/payments/...` | Đã kết nối | Webhook/Return giả lập không an toàn. |

## 4. Confirmed Critical Issues
- **Payment Verification**: `PaymentController.java` (`handlePaymentReturn`) accepts arbitrary status (`params.getOrDefault("status", "SUCCESS")`). Anyone can fake a successful payment by passing `?status=SUCCESS`.
- **Payment Webhook Signature**: `CommerceServiceImpl.java` validates webhook signatures using `MOCK-paymentCode-webhookCode`, without HMAC or secrets.
- **Password Reset Token Exposure**: `AuthServiceImpl.java` (`forgotPassword`) returns the `resetToken` in the API response directly (`"Demo mode: use this resetToken..."`).
- **Authorization Bypass (Question Ownership)**: `AssessmentServiceImpl.java` (`ensureTeacherOwnsQuestion`) checks ownership for Exercises but silently returns if `question.getExercise() == null`. A teacher can edit/delete another teacher's standalone/test questions.
- **Assessment Cheating (Cross-Question Option)**: `AssessmentServiceImpl.java` (`saveAnswer`) directly loads `getOption(request.getSelectedOptionId())` without validating if the option belongs to the answered question.

## 5. Confirmed High Issues
- **Order State Machine**: In `CommerceServiceImpl.java` (`completePayment`), a `CANCELED` order can transition to `PAID` if a late webhook arrives. `createPayment` checks for `PENDING_PAYMENT`, but `completePayment` directly sets `PAID` without verifying the current order status.
- **Test Snapshotting**: `AttemptResponse` dynamically loads the *current* state of the test/exercise. If a teacher edits a test while a student is taking it, the test changes dynamically. No snapshot is created at the start of the attempt.
- **Coupon Usage Limitation**: In `createOrderFromCart`, coupon usage count is increased when creating the *order*, not when payment is completed. Unpaid orders artificially inflate the used count of the coupon.

## 6. Medium and Low Issues
- **API Exceptions**: Some exceptions might be swallowed or improperly mapped to HTTP status codes.
- **Hardcoded URLs**: `PaymentUrl` in `createPayment` is hardcoded to `http://localhost:5173`.
- **Frontend State Management**: Form validations, loading states, and error handling are inconsistent across pages.

## 7. UI/UX Issues
- **Responsive & Design Aesthetics**: The UI must be fully verified and upgraded to a premium design (vibrant colors, micro-animations, glassmorphism) to meet "Wow" factors.
- **Role-based Navigation**: Need to ensure Teachers cannot see Admin links, and Students cannot see Teacher links.
- **Loading/Empty States**: Missing proper skeletons and empty state illustrations on mock pages.

## 8. Missing Features
- **Frontend Integration**: Replacing remaining mock data in Vocabulary, Grammar, Writing Correction, Question Bank, etc., with real API integrations.
- **Proper Logout**: Need to clear state properly and call the `/api/auth/logout` endpoint from the UI.

## 9. Security Issues
- Explored in Critical issues (IDOR in questions, Broken Access Control in Payments, Information Disclosure in Forgot Password).
- *Potential CORS/CSRF issues* depending on how Spring Security is configured.

## 10. Business Logic Issues
- Explored in High issues (Order state, Test snapshotting, Coupon usage).

## 11. Code Quality Issues
- `CommerceServiceImpl.java` and `AssessmentServiceImpl.java` are very large (600+ and 400+ lines).
- TODOs, FIXMEs, and mock data scattered in frontend code.
- Hardcoded base URLs in both frontend (`apiClient.js` vs `.env`) and backend.

## 12. Testing Gaps
- Lack of E2E tests for the critical payment flow.
- Lack of Unit tests for `AssessmentServiceImpl` (to catch the ownership and cross-option bugs).

## 13. Complete Task List

| ID | Priority | Type | Module | File | Problem | Proposed Fix | Status |
| -- | -------- | ---- | ------ | ---- | ------- | ------------ | ------ |
| 1 | Critical | Security | Auth | `AuthServiceImpl.java` | `forgotPassword` returns token in response. | Remove token from response. Simulate email sending. | Pending |
| 2 | Critical | Security | Payment | `PaymentController.java` | `handlePaymentReturn` accepts `status` param blindly. | Return should just check status in DB or call gateway, not rely on request param. | Pending |
| 3 | Critical | Security | Payment | `CommerceServiceImpl.java` | Webhook uses predictable MOCK signature. | Add HMAC-SHA256 signature verification using secret key. | Pending |
| 4 | Critical | Security | Assessment | `AssessmentServiceImpl.java` | Teacher can edit any unlinked question. | Fix `ensureTeacherOwnsQuestion` to check Test ownership if Exercise is null. | Pending |
| 5 | Critical | Security | Assessment | `AssessmentServiceImpl.java` | User can submit an option from another question. | Validate `option.getQuestion().getId() == question.getId()`. | Pending |
| 6 | High | Business | Payment | `CommerceServiceImpl.java` | Canceled order can be paid. | Throw exception in `completePayment` if order is CANCELED. | Pending |
| 7 | High | Business | Payment | `CommerceServiceImpl.java` | Coupon used count increases on order creation. | Move coupon usage logic to `completePayment` (when SUCCESS). | Pending |
| 8 | High | Business | Assessment | `AssessmentServiceImpl.java` | Test attempt doesn't snapshot questions. | Implement `TestQuestionSnapshot` entity or store JSON snapshot. | Pending |
| 9 | High | Connection | Frontend | `VocabularyManagementPage.jsx` | Uses mock data. | Connect to backend endpoints. | Pending |
| 10| High | UI/UX | Frontend | All Pages | Needs premium design & role-based routing. | Overhaul UI, add animations, secure routes by role. | Pending |
