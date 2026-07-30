import { matchPath } from "react-router-dom";
import {
  demoPaths,
  navigationByRole,
  pageConfigs,
  routePatterns,
} from "./navigation";

const pageEntries = [
  { pattern: routePatterns.home, pageKey: "guestHome", roleKey: "guest" },
  {
    pattern: routePatterns.guestCourseList,
    pageKey: "guestCourseList",
    roleKey: "guest",
  },
  {
    pattern: routePatterns.guestCourseDetail,
    pageKey: "guestCourseDetail",
    roleKey: "guest",
  },
  {
    pattern: routePatterns.guestPreviewLesson,
    pageKey: "guestPreviewLesson",
    roleKey: "guest",
  },
  { pattern: routePatterns.login, pageKey: "guestLogin", roleKey: "guest" },
  {
    pattern: routePatterns.register,
    pageKey: "guestRegister",
    roleKey: "guest",
  },
  { pattern: routePatterns.about, pageKey: "guestAbout", roleKey: "guest" },
  { pattern: routePatterns.contact, pageKey: "guestContact", roleKey: "guest" },
  {
    pattern: routePatterns.studentDashboard,
    pageKey: "studentDashboard",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentMyCourses,
    pageKey: "studentMyCourses",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentCart,
    pageKey: "studentCart",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentCheckout,
    pageKey: "studentCheckout",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentOrders,
    pageKey: "studentOrderHistory",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentLearning,
    pageKey: "studentCourseLearning",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentExercise,
    pageKey: "studentExercise",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentTest,
    pageKey: "studentTest",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentVocabulary,
    pageKey: "studentVocabulary",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentGrammar,
    pageKey: "studentGrammar",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentProgress,
    pageKey: "studentProgress",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentChatbot,
    pageKey: "studentChatbot",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentWriting,
    pageKey: "studentWritingCorrection",
    roleKey: "student",
  },
  {
    pattern: routePatterns.studentProfile,
    pageKey: "studentProfile",
    roleKey: "student",
  },
  {
    pattern: routePatterns.teacherDashboard,
    pageKey: "teacherDashboard",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherCourses,
    pageKey: "teacherCourseManagement",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherCourseCreate,
    pageKey: "teacherCourseCreate",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherCourseEdit,
    pageKey: "teacherCourseEdit",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherLessonBuilder,
    pageKey: "teacherLessonBuilder",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherQuestionBank,
    pageKey: "teacherQuestionBank",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherSubmission,
    pageKey: "teacherCourseSubmission",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherStudents,
    pageKey: "teacherStudentTracking",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherRevenue,
    pageKey: "teacherRevenue",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.teacherProfile,
    pageKey: "teacherProfile",
    roleKey: "teacher",
  },
  {
    pattern: routePatterns.adminDashboard,
    pageKey: "adminDashboard",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminUsers,
    pageKey: "adminUserManagement",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminTeachers,
    pageKey: "adminTeacherManagement",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminCourseApproval,
    pageKey: "adminCourseApproval",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminCoursePublish,
    pageKey: "adminCoursePublish",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminOrders,
    pageKey: "adminOrderManagement",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminTransactions,
    pageKey: "adminTransactionManagement",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminCoupons,
    pageKey: "adminCouponManagement",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminRefunds,
    pageKey: "adminRefundManagement",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminReports,
    pageKey: "adminReport",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminSystemActivity,
    pageKey: "adminSystemActivity",
    roleKey: "admin",
  },
  {
    pattern: routePatterns.adminRoles,
    pageKey: "adminRoleManagement",
    roleKey: "admin",
  },
];

const navMatchOverrides = {
  [demoPaths.guestCourseList]: [
    routePatterns.guestCourseList,
    routePatterns.guestCourseDetail,
    routePatterns.guestPreviewLesson,
  ],
  [demoPaths.guestCourseDetail]: [routePatterns.guestCourseDetail],
  [demoPaths.guestPreviewLesson]: [routePatterns.guestPreviewLesson],
  [demoPaths.studentLearning]: [routePatterns.studentLearning],
  [demoPaths.teacherCourseEdit]: [routePatterns.teacherCourseEdit],
};

function matchesPath(pattern, pathname) {
  if (!pattern || typeof pattern !== "string" || !pathname) return false;
  return Boolean(matchPath({ path: pattern, end: true }, pathname));
}

export function resolvePageContext(pathname) {
  const entry = pageEntries.find((item) => matchesPath(item.pattern, pathname));

  if (!entry) {
    return null;
  }

  return {
    ...entry,
    config: pageConfigs[entry.pageKey],
  };
}

export function isNavigationItemActive(item, pathname) {
  if (!item || !item.to || typeof item.to !== "string") return false;
  const patterns = navMatchOverrides[item.to] ?? [item.to];

  return patterns
    .filter((pattern) => pattern && typeof pattern === "string")
    .some((pattern) => matchesPath(pattern, pathname));
}

export function resolveNavigationSection(roleKey, pathname) {
  const sections = navigationByRole[roleKey] ?? [];

  return (
    sections.find((section) => {
      if (section?.to && isNavigationItemActive(section, pathname)) return true;
      return (section?.items ?? []).some((item) => isNavigationItemActive(item, pathname));
    }) ?? null
  );
}
