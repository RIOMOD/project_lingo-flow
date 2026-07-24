# 9. Ban do file giao dien

## 9.1 Layout va route

| File | Vai tro |
|---|---|
| `frontend/src/routes/AppRoutes.jsx` | Cau hinh route tong |
| `frontend/src/layouts/GuestLayout.jsx` | Layout cho Guest |
| `frontend/src/layouts/StudentLayout.jsx` | Layout cho Student |
| `frontend/src/layouts/TeacherLayout.jsx` | Layout cho Teacher |
| `frontend/src/layouts/AdminLayout.jsx` | Layout cho Admin |

## 9.2 Man hinh Guest

| File | Vai tro |
|---|---|
| `frontend/src/pages/guest/HomePage.jsx` | Trang chu |
| `frontend/src/pages/guest/CourseListPage.jsx` | Danh sach khoa hoc |
| `frontend/src/pages/guest/CourseDetailPage.jsx` | Chi tiet khoa hoc |
| `frontend/src/pages/guest/PreviewLessonPage.jsx` | Hoc thu bai preview |
| `frontend/src/pages/guest/LoginPage.jsx` | Dang nhap |
| `frontend/src/pages/guest/RegisterPage.jsx` | Dang ky |

## 9.3 Man hinh Student

| File | Vai tro |
|---|---|
| `frontend/src/pages/student/DashboardPage.jsx` | Tong quan hoc tap |
| `frontend/src/pages/student/MyCoursesPage.jsx` | Danh sach khoa hoc da so huu |
| `frontend/src/pages/student/CartPage.jsx` | Gio hang |
| `frontend/src/pages/student/CheckoutPage.jsx` | Thanh toan |
| `frontend/src/pages/student/OrderHistoryPage.jsx` | Lich su mua hang |
| `frontend/src/pages/student/CourseLearningPage.jsx` | Hoc bai hoc |
| `frontend/src/pages/student/ExercisePage.jsx` | Lam bai tap |
| `frontend/src/pages/student/TestPage.jsx` | Lam bai kiem tra |
| `frontend/src/pages/student/VocabularyPage.jsx` | Hoc tu vung |
| `frontend/src/pages/student/GrammarPage.jsx` | Hoc ngu phap |
| `frontend/src/pages/student/ProgressPage.jsx` | Theo doi tien do |
| `frontend/src/pages/student/ChatbotPage.jsx` | Chatbot AI |
| `frontend/src/pages/student/WritingCorrectionPage.jsx` | AI sua bai viet |
| `frontend/src/pages/student/ProfilePage.jsx` | Ho so ca nhan |

## 9.4 Man hinh Teacher

| File | Vai tro |
|---|---|
| `frontend/src/pages/teacher/DashboardPage.jsx` | Tong quan Teacher |
| `frontend/src/pages/teacher/CourseManagementPage.jsx` | Danh sach khoa hoc cua Teacher |
| `frontend/src/pages/teacher/CourseCreatePage.jsx` | Tao khoa hoc |
| `frontend/src/pages/teacher/CourseEditPage.jsx` | Sua khoa hoc |
| `frontend/src/pages/teacher/LessonBuilderPage.jsx` | Tao bai hoc, vocab, grammar |
| `frontend/src/pages/teacher/QuestionBankPage.jsx` | Ngan hang cau hoi |
| `frontend/src/pages/teacher/CourseSubmissionPage.jsx` | Gui khoa hoc cho Admin duyet |
| `frontend/src/pages/teacher/StudentTrackingPage.jsx` | Theo doi hoc vien, diem, tien do |
| `frontend/src/pages/teacher/RevenuePage.jsx` | Doanh thu khoa hoc cua minh |
| `frontend/src/pages/teacher/ProfilePage.jsx` | Ho so Teacher |

## 9.5 Man hinh Admin

| File | Vai tro |
|---|---|
| `frontend/src/pages/admin/DashboardPage.jsx` | Tong quan Admin |
| `frontend/src/pages/admin/UserManagementPage.jsx` | Quan ly user |
| `frontend/src/pages/admin/TeacherManagementPage.jsx` | Quan ly Teacher |
| `frontend/src/pages/admin/CourseApprovalPage.jsx` | Duyet khoa hoc va gia |
| `frontend/src/pages/admin/CoursePublishPage.jsx` | Xuat ban va an khoa hoc |
| `frontend/src/pages/admin/OrderManagementPage.jsx` | Quan ly don hang |
| `frontend/src/pages/admin/TransactionManagementPage.jsx` | Quan ly giao dich |
| `frontend/src/pages/admin/CouponManagementPage.jsx` | Quan ly coupon |
| `frontend/src/pages/admin/RefundManagementPage.jsx` | Quan ly hoan tien |
| `frontend/src/pages/admin/ReportPage.jsx` | Bao cao doanh thu |
| `frontend/src/pages/admin/SystemActivityPage.jsx` | Theo doi hoat dong he thong |
| `frontend/src/pages/admin/RoleManagementPage.jsx` | Quan ly role |

## 9.6 Goi y prompt tiep theo

- `Tao UI hien dai cho frontend/src/pages/guest/HomePage.jsx`.
- `Tao giao dien course detail cho frontend/src/pages/guest/CourseDetailPage.jsx`.
- `Tao dashboard Student cho frontend/src/pages/student/DashboardPage.jsx`.
- `Tao giao dien checkout cho frontend/src/pages/student/CheckoutPage.jsx`.
- `Tao trang duyet khoa hoc cho frontend/src/pages/admin/CourseApprovalPage.jsx`.
