import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "../components/common/ScrollToTop";
import GuestGuard from "../guards/GuestGuard";
import CourseAccessRoute from "../guards/CourseAccessRoute";
import RoleRoute from "../guards/RoleRoute";
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import NotFoundPage from "../pages/NotFoundPage";
import CourseApprovalPage from "../pages/admin/CourseApprovalPage";
import CouponManagementPage from "../pages/admin/CouponManagementPage";
import CoursePublishPage from "../pages/admin/CoursePublishPage";
import AdminDashboardPage from "../pages/admin/DashboardPage";
import OrderManagementPage from "../pages/admin/OrderManagementPage";
import RefundManagementPage from "../pages/admin/RefundManagementPage";
import ReportPage from "../pages/admin/ReportPage";
import RoleManagementPage from "../pages/admin/RoleManagementPage";
import SystemActivityPage from "../pages/admin/SystemActivityPage";
import TeacherManagementPage from "../pages/admin/TeacherManagementPage";
import TransactionManagementPage from "../pages/admin/TransactionManagementPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import AboutPage from "../pages/guest/AboutPage";
import ContactPage from "../pages/guest/ContactPage";
import CourseDetailPage from "../pages/guest/CourseDetailPage";
import CourseListPage from "../pages/guest/CourseListPage";
import HomePage from "../pages/guest/HomePage";
import LoginPage from "../pages/guest/LoginPage";
import PreviewLessonPage from "../pages/guest/PreviewLessonPage";
import RegisterPage from "../pages/guest/RegisterPage";
import CartPage from "../pages/student/CartPage";
import ChatbotPage from "../pages/student/ChatbotPage";
import CheckoutPage from "../pages/student/CheckoutPage";
import CourseLearningPage from "../pages/student/CourseLearningPage";
import StudentDashboardPage from "../pages/student/DashboardPage";
import ExercisePage from "../pages/student/ExercisePage";
import GrammarPage from "../pages/student/GrammarPage";
import MyCoursesPage from "../pages/student/MyCoursesPage";
import OrderHistoryPage from "../pages/student/OrderHistoryPage";

import OrderDetailPage from "../pages/student/OrderDetailPage";
import InvoicePage from "../pages/student/InvoicePage";
import PaymentStatusPage from "../pages/student/PaymentStatusPage";
import StudentProfilePage from "../pages/student/ProfilePage";
import ProgressPage from "../pages/student/ProgressPage";
import TestPage from "../pages/student/TestPage";
import VocabularyPage from "../pages/student/VocabularyPage";
import VocabularySessionPage from "../pages/student/VocabularySessionPage";
import WritingCorrectionPage from "../pages/student/WritingCorrectionPage";
import CourseCreatePage from "../pages/teacher/CourseCreatePage";
import CourseEditPage from "../pages/teacher/CourseEditPage";
import CourseManagementPage from "../pages/teacher/CourseManagementPage";
import CoursePreviewPage from "../pages/teacher/CoursePreviewPage";
import CourseSubmissionPage from "../pages/teacher/CourseSubmissionPage";
import TeacherDashboardPage from "../pages/teacher/DashboardPage";
import LessonBuilderPage from "../pages/teacher/LessonBuilderPage";
import VocabularyManagementPage from "../pages/teacher/VocabularyManagementPage";
import GrammarManagementPage from "../pages/teacher/GrammarManagementPage";
import TeacherProfilePage from "../pages/teacher/ProfilePage";
import QuestionBankPage from "../pages/teacher/QuestionBankPage";
import RevenuePage from "../pages/teacher/RevenuePage";
import StudentTrackingPage from "../pages/teacher/StudentTrackingPage";
import AdminCourseReviewPage from "../pages/admin/AdminCourseReviewPage";

export default function AppRoutes() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
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
            <Route path="progress" element={<ProgressPage />} />
            <Route path="path" element={<ProgressPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={["TEACHER", "ADMIN"]} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboardPage />} />
            <Route path="courses" element={<CourseManagementPage />} />
            <Route path="courses/create" element={<CourseCreatePage />} />
            <Route path="courses/:courseId/edit" element={<CourseEditPage />} />
            <Route path="courses/:courseId/content" element={<LessonBuilderPage />} />
            <Route path="courses/:courseId/preview" element={<CoursePreviewPage />} />
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
            <Route path="courses/:courseId/review" element={<AdminCourseReviewPage />} />
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
    </BrowserRouter>
  );
}
