export const routePatterns = {
  home: "/",
  guestCourseList: "/courses",
  guestCourseDetail: "/courses/:courseSlug",
  guestPreviewLesson: "/preview/:courseId/:lessonId",
  about: "/about",
  contact: "/contact",
  login: "/login",
  register: "/register",
  studentDashboard: "/student",
  studentMyCourses: "/student/courses",
  studentPath: "/student/path",
  studentCart: "/student/cart",
  studentCheckout: "/student/checkout",
  studentOrders: "/student/orders",
  studentLearning: "/student/learn/:courseId",
  studentExercise: "/student/exercises",
  studentTest: "/student/tests",
  studentVocabulary: "/student/vocabulary",
  studentGrammar: "/student/grammar",
  studentPronunciation: "/student/pronunciation",
  studentLeaderboard: "/student/leaderboard",
  studentProgress: "/student/progress",
  studentChatbot: "/student/chatbot",
  studentWriting: "/student/writing",
  studentProfile: "/student/profile",
  studentSettings: "/student/settings",
  teacherDashboard: "/teacher",
  teacherCourses: "/teacher/courses",
  teacherCourseCreate: "/teacher/courses/create",
  teacherCourseEdit: "/teacher/courses/:courseId/edit",
  teacherLessonBuilder: "/teacher/lessons",
  teacherVocabulary: "/teacher/vocabulary",
  teacherGrammar: "/teacher/grammar",
  teacherQuestionBank: "/teacher/question-bank",
  teacherSubmission: "/teacher/submission",
  teacherStudents: "/teacher/students",
  teacherRevenue: "/teacher/revenue",
  teacherProfile: "/teacher/profile",
  adminDashboard: "/admin",
  adminUsers: "/admin/users",
  adminTeachers: "/admin/teachers",
  adminCourseApproval: "/admin/course-approval",
  adminCoursePublish: "/admin/course-publish",
  adminOrders: "/admin/orders",
  adminTransactions: "/admin/transactions",
  adminCoupons: "/admin/coupons",
  adminRefunds: "/admin/refunds",
  adminReports: "/admin/reports",
  adminSystemActivity: "/admin/system-activity",
  adminRoles: "/admin/roles",
};

export const demoPaths = {
  home: "/",
  guestCourseList: "/courses",
  guestCourseDetail: "/courses/foundation-english",
  guestPreviewLesson: "/preview/1/1",
  about: "/about",
  contact: "/contact",
  login: "/login",
  register: "/register",
  studentDashboard: "/student",
  studentMyCourses: "/student/courses",
  studentPath: "/student/path",
  studentCart: "/student/cart",
  studentCheckout: "/student/checkout",
  studentOrders: "/student/orders",
  studentLearning: "/student/learn/foundation-english",
  studentExercise: "/student/exercises",
  studentTest: "/student/tests",
  studentVocabulary: "/student/vocabulary",
  studentGrammar: "/student/grammar",
  studentPronunciation: "/student/pronunciation",
  studentLeaderboard: "/student/leaderboard",
  studentProgress: "/student/progress",
  studentChatbot: "/student/chatbot",
  studentWriting: "/student/writing",
  studentProfile: "/student/profile",
  studentSettings: "/student/settings",
  teacherDashboard: "/teacher",
  teacherCourses: "/teacher/courses",
  teacherCourseCreate: "/teacher/courses/create",
  teacherCourseEdit: "/teacher/courses/foundation-english/edit",
  teacherLessonBuilder: "/teacher/lessons",
  teacherVocabulary: "/teacher/vocabulary",
  teacherGrammar: "/teacher/grammar",
  teacherQuestionBank: "/teacher/question-bank",
  teacherSubmission: "/teacher/submission",
  teacherStudents: "/teacher/students",
  teacherRevenue: "/teacher/revenue",
  teacherProfile: "/teacher/profile",
  adminDashboard: "/admin",
  adminUsers: "/admin/users",
  adminTeachers: "/admin/teachers",
  adminCourseApproval: "/admin/course-approval",
  adminCoursePublish: "/admin/course-publish",
  adminOrders: "/admin/orders",
  adminTransactions: "/admin/transactions",
  adminCoupons: "/admin/coupons",
  adminRefunds: "/admin/refunds",
  adminReports: "/admin/reports",
  adminSystemActivity: "/admin/system-activity",
  adminRoles: "/admin/roles",
};

export const roleMeta = {
  guest: {
    label: "Guest",
    title: "Khám phá khóa học",
    description: "Dành cho khách vãng lai tìm hiểu khóa học và học thử.",
    homePath: demoPaths.home,
    accent: "#0d9488",
  },
  student: {
    label: "Student",
    title: "Không gian học tập",
    description: "Tập trung vào học bài, tiến độ, bài tập, AI và giao dịch.",
    homePath: demoPaths.studentDashboard,
    accent: "#0d9488",
  },
  teacher: {
    label: "Teacher",
    title: "Trung tâm giảng dạy",
    description: "Quản lý nội dung khóa học, học viên và doanh thu.",
    homePath: demoPaths.teacherDashboard,
    accent: "#0d9488",
  },
  admin: {
    label: "Admin",
    title: "Quản trị hệ thống",
    description: "Điều phối duyệt khóa học, giao dịch, báo cáo và bảo mật.",
    homePath: demoPaths.adminDashboard,
    accent: "#0d9488",
  },
};

export const roleSwitches = [
  { label: "Guest", to: demoPaths.home },
  { label: "Student", to: demoPaths.studentDashboard },
  { label: "Teacher", to: demoPaths.teacherDashboard },
  { label: "Admin", to: demoPaths.adminDashboard },
];

export const navigationByRole = {
  guest: [
    {
      title: "KHÁM PHÁ",
      items: [
        { label: "Trang chủ", to: demoPaths.home },
        { label: "Danh sách khóa học", to: demoPaths.guestCourseList },
        { label: "Chi tiết khóa học", to: demoPaths.guestCourseDetail },
        { label: "Học thử", to: demoPaths.guestPreviewLesson },
        { label: "Giới thiệu", to: demoPaths.about },
        { label: "Liên hệ", to: demoPaths.contact },
      ],
    },
    {
      title: "TÀI KHOẢN",
      items: [
        { label: "Đăng nhập", to: demoPaths.login },
        { label: "Đăng ký", to: demoPaths.register },
      ],
    },
  ],
  student: [
    { label: "Tổng quan", to: demoPaths.studentDashboard },
    {
      title: "HỌC TẬP",
      items: [
        { label: "Khóa học của tôi", to: demoPaths.studentMyCourses },
        { label: "Lộ trình học", to: demoPaths.studentPath },
        { label: "Bài tập", to: demoPaths.studentExercise },
        { label: "Bài kiểm tra", to: demoPaths.studentTest },
      ],
    },
    {
      title: "ÔN LUYỆN",
      items: [
        { label: "Từ vựng", to: demoPaths.studentVocabulary },
        { label: "Ngữ pháp", to: demoPaths.studentGrammar },
        { label: "Luyện phát âm AI", to: demoPaths.studentPronunciation },
      ],
    },
    {
      title: "CÔNG CỤ AI",
      items: [
        { label: "Chatbot AI", to: demoPaths.studentChatbot },
        { label: "AI sửa Writing", to: demoPaths.studentWriting },
      ],
    },
    {
      title: "TIẾN ĐỘ & THI ĐUA",
      items: [
        { label: "Tiến độ học tập", to: demoPaths.studentProgress },
        { label: "Bảng xếp hạng 🔥", to: demoPaths.studentLeaderboard },
      ],
    },
  ],
  teacher: [
    { label: "Tổng quan", to: demoPaths.teacherDashboard },
    {
      title: "NỘI DUNG",
      items: [
        { label: "Quản lý khóa học", to: demoPaths.teacherCourses },
        { label: "Tạo khóa học", to: demoPaths.teacherCourseCreate },
        { label: "Sửa khóa học", to: demoPaths.teacherCourseEdit },
        { label: "Lesson builder", to: demoPaths.teacherLessonBuilder },
        { label: "Từ vựng", to: demoPaths.teacherVocabulary },
        { label: "Ngữ pháp", to: demoPaths.teacherGrammar },
        { label: "Ngân hàng câu hỏi", to: demoPaths.teacherQuestionBank },
        { label: "Gửi duyệt khóa học", to: demoPaths.teacherSubmission },
      ],
    },
    {
      title: "VẬN HÀNH",
      items: [
        { label: "Theo dõi học viên", to: demoPaths.teacherStudents },
        { label: "Báo cáo doanh thu", to: demoPaths.teacherRevenue },
        { label: "Hồ sơ cá nhân", to: demoPaths.teacherProfile },
      ],
    },
  ],
  admin: [
    { label: "Tổng quan", to: demoPaths.adminDashboard },
    {
      title: "QUẢN TRỊ",
      items: [
        { label: "Người dùng", to: demoPaths.adminUsers },
        { label: "Giảng viên", to: demoPaths.adminTeachers },
        { label: "Phân quyền", to: demoPaths.adminRoles },
        { label: "Hoạt động hệ thống", to: demoPaths.adminSystemActivity },
      ],
    },
    {
      title: "KHÓA HỌC",
      items: [
        { label: "Duyệt khóa học", to: demoPaths.adminCourseApproval },
        { label: "Xuất bản khóa học", to: demoPaths.adminCoursePublish },
      ],
    },
    {
      title: "THƯƠNG MẠI",
      items: [
        { label: "Đơn hàng", to: demoPaths.adminOrders },
        { label: "Giao dịch", to: demoPaths.adminTransactions },
        { label: "Mã giảm giá", to: demoPaths.adminCoupons },
        { label: "Hoàn tiền", to: demoPaths.adminRefunds },
        { label: "Báo cáo", to: demoPaths.adminReports },
      ],
    },
  ],
};

const stat = (value, label) => ({ value, label });
const action = (label, to, tone = "primary") => ({ label, to, tone });
const panel = (title, items) => ({ title, items });

export const pageConfigs = {
  studentDashboard: {
    roleKey: "student",
    title: "Tổng quan",
    description: "Tổng quan bài học, tiến độ cá nhân và lối tắt ôn tập.",
    stats: [stat("3", "Khóa học đang học"), stat("78%", "Tiến độ TB"), stat("2", "Bài tập đến hạn")],
    actions: [
      action("Mở khóa học của tôi", demoPaths.studentMyCourses),
      action("Tiếp tục học bài", demoPaths.studentLearning, "secondary"),
    ],
    panels: [
      panel("Tiến độ gần đây", ["Khóa học đang học", "Tiến độ từ vựng", "Bài kiểm tra"]),
    ],
  },
};
