import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "../components/common/ErrorBoundary";
import ScrollToTop from "../components/common/ScrollToTop";
import { LoadingState } from "../components/common/UiState";
import CourseAccessRoute from "../guards/CourseAccessRoute";
import GuestGuard from "../guards/GuestGuard";
import RoleRoute from "../guards/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";

// ─── Lazy Loaded Pages (Code Splitting) ──────────────────────────────────────
const HomePage = lazy(() => import("../pages/guest/HomePage"));
const CourseListPage = lazy(() => import("../pages/guest/CourseListPage"));
const CourseDetailPage = lazy(() => import("../pages/guest/CourseDetailPage"));
const PreviewLessonPage = lazy(() => import("../pages/guest/PreviewLessonPage"));
const AboutPage = lazy(() => import("../pages/guest/AboutPage"));
const ContactPage = lazy(() => import("../pages/guest/ContactPage"));
const LoginPage = lazy(() => import("../pages/guest/LoginPage"));
const RegisterPage = lazy(() => import("../pages/guest/RegisterPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Student Pages
const StudentDashboardPage = lazy(() => import("../pages/student/DashboardPage"));
const MyCoursesPage = lazy(() => import("../pages/student/MyCoursesPage"));
const CartPage = lazy(() => import("../pages/student/CartPage"));
const CheckoutPage = lazy(() => import("../pages/student/CheckoutPage"));
const OrderHistoryPage = lazy(() => import("../pages/student/OrderHistoryPage"));
const OrderDetailPage = lazy(() => import("../pages/student/OrderDetailPage"));
const InvoicePage = lazy(() => import("../pages/student/InvoicePage"));
const PaymentStatusPage = lazy(() => import("../pages/student/PaymentStatusPage"));
const CourseLearningPage = lazy(() => import("../pages/student/CourseLearningPage"));
const ExercisePage = lazy(() => import("../pages/student/ExercisePage"));
const TestPage = lazy(() => import("../pages/student/TestPage"));
const VocabularyPage = lazy(() => import("../pages/student/VocabularyPage"));
const VocabularySessionPage = lazy(() => import("../pages/student/VocabularySessionPage"));
const GrammarPage = lazy(() => import("../pages/student/GrammarPage"));
const PronunciationPage = lazy(() => import("../pages/student/PronunciationPage"));
const LeaderboardPage = lazy(() => import("../pages/student/LeaderboardPage"));
const ChatbotPage = lazy(() => import("../pages/student/ChatbotPage"));
const WritingCorrectionPage = lazy(() => import("../pages/student/WritingCorrectionPage"));
const ProgressPage = lazy(() => import("../pages/student/ProgressPage"));
const StudentProfilePage = lazy(() => import("../pages/student/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/student/SettingsPage"));

// Teacher Pages
const TeacherDashboardPage = lazy(() => import("../pages/teacher/DashboardPage"));
const CourseManagementPage = lazy(() => import("../pages/teacher/CourseManagementPage"));
const CourseCreatePage = lazy(() => import("../pages/teacher/CourseCreatePage"));
const CourseEditPage = lazy(() => import("../pages/teacher/CourseEditPage"));
const LessonBuilderPage = lazy(() => import("../pages/teacher/LessonBuilderPage"));
const VocabularyManagementPage = lazy(() => import("../pages/teacher/VocabularyManagementPage"));
const GrammarManagementPage = lazy(() => import("../pages/teacher/GrammarManagementPage"));
const QuestionBankPage = lazy(() => import("../pages/teacher/QuestionBankPage"));
const CourseSubmissionPage = lazy(() => import("../pages/teacher/CourseSubmissionPage"));
const StudentTrackingPage = lazy(() => import("../pages/teacher/StudentTrackingPage"));
const RevenuePage = lazy(() => import("../pages/teacher/RevenuePage"));
const TeacherProfilePage = lazy(() => import("../pages/teacher/ProfilePage"));

// Admin Pages
const AdminDashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const UserManagementPage = lazy(() => import("../pages/admin/UserManagementPage"));
const TeacherManagementPage = lazy(() => import("../pages/admin/TeacherManagementPage"));
const CourseApprovalPage = lazy(() => import("../pages/admin/CourseApprovalPage"));
const CoursePublishPage = lazy(() => import("../pages/admin/CoursePublishPage"));
const OrderManagementPage = lazy(() => import("../pages/admin/OrderManagementPage"));
const TransactionManagementPage = lazy(() => import("../pages/admin/TransactionManagementPage"));
const CouponManagementPage = lazy(() => import("../pages/admin/CouponManagementPage"));
const RefundManagementPage = lazy(() => import("../pages/admin/RefundManagementPage"));
const ReportPage = lazy(() => import("../pages/admin/ReportPage"));
const SystemActivityPage = lazy(() => import("../pages/admin/SystemActivityPage"));
const RoleManagementPage = lazy(() => import("../pages/admin/RoleManagementPage"));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Suspense fallback={<LoadingState title="Đang tải trang..." />}>
          <Routes>
            <Route path="/" element={<GuestLayout />}>
              <Route index element={<HomePage />} />
              <Route path="courses" element={<CourseListPage />} />
              <Route path="courses/:courseSlug" element={<CourseDetailPage />} />
              <Route path="preview/:courseId/:lessonId" element={<PreviewLessonPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route element={<GuestGuard />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute roles={["STUDENT", "ADMIN"]} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<StudentDashboardPage />} />
                <Route path="courses" element={<MyCoursesPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrderHistoryPage />} />
                <Route path="orders/:orderCode" element={<OrderDetailPage />} />
                <Route path="orders/:orderCode/invoice" element={<InvoicePage />} />
                <Route path="payment/:status" element={<PaymentStatusPage />} />
                <Route element={<CourseAccessRoute />}>
                  <Route path="learn/:courseId/:lessonId?" element={<CourseLearningPage />} />
                </Route>
                <Route path="exercises" element={<ExercisePage />} />
                <Route path="tests" element={<TestPage />} />
                <Route path="vocabulary" element={<VocabularyPage />} />
                <Route path="vocabulary/session" element={<VocabularySessionPage />} />
                <Route path="grammar" element={<GrammarPage />} />
                <Route path="pronunciation" element={<PronunciationPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="chatbot" element={<ChatbotPage />} />
                <Route path="writing" element={<WritingCorrectionPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="path" element={<ProgressPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute roles={["TEACHER", "ADMIN"]} />}>
              <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherDashboardPage />} />
                <Route path="courses" element={<CourseManagementPage />} />
                <Route path="courses/create" element={<CourseCreatePage />} />
                <Route path="courses/:courseId/edit" element={<CourseEditPage />} />
                <Route path="lessons" element={<LessonBuilderPage />} />
                <Route path="vocabulary" element={<VocabularyManagementPage />} />
                <Route path="grammar" element={<GrammarManagementPage />} />
                <Route path="question-bank" element={<QuestionBankPage />} />
                <Route path="submission" element={<CourseSubmissionPage />} />
                <Route path="students" element={<StudentTrackingPage />} />
                <Route path="revenue" element={<RevenuePage />} />
                <Route path="profile" element={<TeacherProfilePage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute roles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="teachers" element={<TeacherManagementPage />} />
                <Route path="course-approval" element={<CourseApprovalPage />} />
                <Route path="course-publish" element={<CoursePublishPage />} />
                <Route path="orders" element={<OrderManagementPage />} />
                <Route path="transactions" element={<TransactionManagementPage />} />
                <Route path="coupons" element={<CouponManagementPage />} />
                <Route path="refunds" element={<RefundManagementPage />} />
                <Route path="reports" element={<ReportPage />} />
                <Route path="system-activity" element={<SystemActivityPage />} />
                <Route path="roles" element={<RoleManagementPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
