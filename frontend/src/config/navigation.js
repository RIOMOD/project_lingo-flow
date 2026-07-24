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
    title: "Không gian khám phá khóa học",
    description: "Dành cho khách vãng lai tìm hiểu khóa học và học thử.",
    homePath: demoPaths.home,
    accent: "#2364db",
  },
  student: {
    label: "Student",
    title: "Không gian học tập cá nhân",
    description: "Tập trung vào học bài, tiến độ, bài tập, AI và giao dịch.",
    homePath: demoPaths.studentDashboard,
    accent: "#008f8c",
  },
  teacher: {
    label: "Teacher",
    title: "Trung tâm xây dựng khóa học",
    description: "Quản lý nội dung khóa học, học viên và doanh thu khóa của mình.",
    homePath: demoPaths.teacherDashboard,
    accent: "#ff8a3d",
  },
  admin: {
    label: "Admin",
    title: "Bảng điều phối vận hành",
    description: "Điều phối duyệt khóa học, giao dịch, báo cáo và bảo mật vận hành.",
    homePath: demoPaths.adminDashboard,
    accent: "#7a52f4",
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
      title: "Khám phá",
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
      title: "Tài khoản",
      items: [
        { label: "Đăng nhập", to: demoPaths.login },
        { label: "Đăng ký", to: demoPaths.register },
      ],
    },
  ],
  student: [
    {
      title: "Tổng quan",
      icon: "⌂",
      items: [
        { label: "Tổng quan", to: demoPaths.studentDashboard, icon: "⌂" },
      ],
    },
    {
      title: "Học tập",
      icon: "▤",
      items: [
        { label: "Khóa học của tôi", to: demoPaths.studentMyCourses, icon: "▣" },
        { label: "Lộ trình học", to: demoPaths.studentPath, icon: "↗" },
        { label: "Bài tập", to: demoPaths.studentExercise, icon: "✓" },
        { label: "Bài kiểm tra", to: demoPaths.studentTest, icon: "◷" },
      ],
    },
    {
      title: "Ôn luyện",
      icon: "↻",
      items: [
        { label: "Từ vựng", to: demoPaths.studentVocabulary, icon: "A" },
        { label: "Ngữ pháp", to: demoPaths.studentGrammar, icon: "¶" },
        { label: "Luyện phát âm AI", to: demoPaths.studentPronunciation, icon: "🎙" },
      ],
    },
    {
      title: "Công cụ AI",
      icon: "✦",
      items: [
        { label: "Chatbot AI", to: demoPaths.studentChatbot, icon: "◇" },
        { label: "AI sửa Writing", to: demoPaths.studentWriting, icon: "✎" },
      ],
    },
    {
      title: "Tiến độ & Thi đua",
      icon: "◎",
      items: [
        { label: "Tiến độ học tập", to: demoPaths.studentProgress, icon: "◎" },
        { label: "Bảng xếp hạng 🔥", to: demoPaths.studentLeaderboard, icon: "🏆" },
      ],
    },
  ],
  teacher: [
    {
      title: "Nội dung",
      items: [
        { label: "Dashboard", to: demoPaths.teacherDashboard },
        { label: "Quản lý khóa học", to: demoPaths.teacherCourses },
        { label: "Tạo khóa học", to: demoPaths.teacherCourseCreate },
        { label: "Sửa khóa học", to: demoPaths.teacherCourseEdit },
        { label: "Lesson builder", to: demoPaths.teacherLessonBuilder },
        { label: "Từ vựng", to: demoPaths.teacherVocabulary },
        { label: "Ngữ pháp", to: demoPaths.teacherGrammar },
        { label: "Question bank", to: demoPaths.teacherQuestionBank },
        { label: "Gửi duyệt", to: demoPaths.teacherSubmission },
      ],
    },
    {
      title: "Vận hành",
      items: [
        { label: "Theo dõi học viên", to: demoPaths.teacherStudents },
        { label: "Doanh thu", to: demoPaths.teacherRevenue },
        { label: "Hồ sơ", to: demoPaths.teacherProfile },
      ],
    },
  ],
  admin: [
    {
      title: "Quản trị",
      items: [
        { label: "Dashboard", to: demoPaths.adminDashboard },
        { label: "Người dùng", to: demoPaths.adminUsers },
        { label: "Teacher", to: demoPaths.adminTeachers },
        { label: "Role", to: demoPaths.adminRoles },
        { label: "Hoạt động hệ thống", to: demoPaths.adminSystemActivity },
      ],
    },
    {
      title: "Khóa học",
      items: [
        { label: "Duyệt khóa học", to: demoPaths.adminCourseApproval },
        { label: "Xuất bản khóa học", to: demoPaths.adminCoursePublish },
      ],
    },
    {
      title: "Thương mại",
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
  guestHome: {
    roleKey: "guest",
    title: "Trang chu",
    description: "Diem vao chung de gioi thieu san pham, nhom khóa học nội bat va dieu huong sang catalog.",
    stats: [stat("2", "Loai khóa học"), stat("6", "Ky nang học"), stat("AI", "Tinh nang thông minh")],
    actions: [
      action("Xem danh sach khóa học", demoPaths.guestCourseList),
      action("Xem khóa học mau", demoPaths.guestCourseDetail, "secondary"),
      action("Đăng ký", demoPaths.register, "ghost"),
    ],
    panels: [
      panel("Muc tieu man hinh", ["Giới thiệu gia tri he thông", "Dan người dung vao catalog", "Tao diem vao cho dang ky va dang nhap"]),
      panel("Lien ket chinh", ["Trang chi tiết khóa học", "Trang dang ky tài khóan", "Trang học thu bài preview"]),
    ],
  },
  guestCourseList: {
    roleKey: "guest",
    title: "Danh sách khóa học",
    description: "Catalog cong khai cho phep Guest hoac Student xem bo loc, gia va muc do khóa học.",
    stats: [stat("FREE", "Hỗ trợ"), stat("PAID", "Hỗ trợ"), stat("1 click", "Di vao chi tiết")],
    actions: [
      action("Mo chi tiết khóa học", demoPaths.guestCourseDetail),
      action("Ve trang chu", demoPaths.home, "secondary"),
      action("Đăng nhập de mua", demoPaths.login, "ghost"),
    ],
    panels: [
      panel("Thanh phan nen co", ["Bo loc cấp do", "Bo loc FREE/PAID", "The khóa học, gia, giao vien, CTA"]),
      panel("Lien ket xuong luong sau", ["Chi tiết khóa học", "Hoc thu bài mo", "Đăng ký hoac dang nhap"]),
    ],
  },
  guestCourseDetail: {
    roleKey: "guest",
    title: "Chi tiết khóa học",
    description: "Hien thi gia, giao vien, curriculum, bài preview va cac nut chuyen doi sang dang ky hoac mua.",
    stats: [stat("12", "Bai học"), stat("4", "Chu de"), stat("1", "Bai preview")],
    actions: [
      action("Hoc thu bài preview", demoPaths.guestPreviewLesson),
      action("Đăng nhập", demoPaths.login, "secondary"),
      action("Đăng ký tài khóan", demoPaths.register, "ghost"),
    ],
    panels: [
      panel("Muc thông tin", ["Tong quan khóa học", "Chuong trinh học", "Thong tin giao vien", "Gia va uu dai"]),
      panel("Quy tac lien quan", ["Guest chi học bài preview", "Khoa FREE co the dang ky ngay khi da login", "Khoa PAID can thanh toan de học day du"]),
    ],
  },
  guestPreviewLesson: {
    roleKey: "guest",
    title: "Hoc thu bài preview",
    description: "Trang nay mo phong trai nghiem học thu cho bài co isPreview=true.",
    stats: [stat("Preview", "Quyen truy cấp"), stat("1", "Bai học mo"), stat("CTA", "Chuyen doi mua học")],
    actions: [
      action("Xem chi tiết khóa học", demoPaths.guestCourseDetail),
      action("Đăng ký học ngay", demoPaths.register, "secondary"),
      action("Đăng nhập", demoPaths.login, "ghost"),
    ],
    panels: [
      panel("Cần kiem soat", ["Chi cho truy cấp bài preview", "Chan bài không phai preview", "Hien CTA ro rang sang dang ky hoac mua"]),
      panel("Trai nghiem de xuat", ["Player nội dung học thu", "Tom tat loi ich khóa học", "Nut mua hoac dang ky nhanh"]),
    ],
  },
  guestLogin: {
    roleKey: "guest",
    title: "Đăng nhập",
    description: "Diem vao cho Student, Teacher va Admin sau khi da co tài khóan hop le.",
    stats: [stat("RBAC", "Phan quyen"), stat("3", "Vai trò"), stat("Secure", "Đăng nhập")],
    actions: [
      action("Đăng ký tài khóan moi", demoPaths.register),
      action("Ve trang chu", demoPaths.home, "secondary"),
      action("Thu catalog", demoPaths.guestCourseList, "ghost"),
    ],
    panels: [
      panel("Dieu huong sau login", ["Student ve dashboard học tap", "Teacher ve dashboard quan ly khóa học", "Admin ve bang dieu phoi vận hành"]),
      panel("Luu y nghiep vu", ["Tài khoản tu dang ky la Student", "Teacher phai được Admin tao hoac phe duyệt"]),
    ],
  },
  guestRegister: {
    roleKey: "guest",
    title: "Đăng ký",
    description: "Form tao tài khóan moi, mac dinh sinh role STUDENT theo quy tac nghiep vu.",
    stats: [stat("STUDENT", "Role mac dinh"), stat("1", "Tài khoản moi"), stat("Ngay", "Có the học FREE")],
    actions: [
      action("Đăng nhập neu da co tài khóan", demoPaths.login),
      action("Xem khóa học", demoPaths.guestCourseList, "secondary"),
      action("Ve trang chu", demoPaths.home, "ghost"),
    ],
    panels: [
      panel("Sau khi dang ky", ["Có the dang ky khóa FREE", "Có the mua khóa PAID", "Có the truy cấp dashboard Student"]),
      panel("Cần validate", ["Email hoac so dien thoai", "Mat khau manh", "Chong spam dang ky"]),
    ],
  },
  guestAbout: {
    roleKey: "guest",
    title: "Giới thiệu",
    description: "Tong quan ve he thông học tiếng Anh thông minh, cac vai tro va cac luong chinh.",
    stats: [stat("4", "Vai trò"), stat("AI", "Hỗ trợ học tap"), stat("Payment", "Thương mại")],
    actions: [
      action("Xem khóa học", demoPaths.guestCourseList),
      action("Liên hệ", demoPaths.contact, "secondary"),
      action("Đăng ký", demoPaths.register, "ghost"),
    ],
    panels: [
      panel("Gia tri cot loi", ["Hoc tap co tiến do", "Noi dung co duyệt", "Thương mại minh bach", "AI phan hoi an toan"]),
      panel("Vai trò", ["Guest kham pha", "Student học", "Teacher tao nội dung", "Admin vận hành"]),
    ],
  },
  guestContact: {
    roleKey: "guest",
    title: "Liên hệ",
    description: "Trang tiep nhan cau hoi ve khóa học, tài khóan, thanh toan va ho tro su dung he thông.",
    stats: [stat("Support", "Hỗ trợ"), stat("Course", "Tu van"), stat("Account", "Tài khoản")],
    actions: [
      action("Xem khóa học", demoPaths.guestCourseList),
      action("Giới thiệu", demoPaths.about, "secondary"),
      action("Đăng nhập", demoPaths.login, "ghost"),
    ],
    panels: [
      panel("Kenh ho tro", ["Khóa học", "Thanh toán", "Tài khoản", "AI"]),
      panel("Sau nay co the nội backend", ["Tao ticket", "Gui email", "Thong bao Admin"]),
    ],
  },
  studentDashboard: {
    roleKey: "student",
    title: "Dashboard Student",
    description: "Man tong quan cho học tap, cac khóa học da mua, tiến do va cac tac vu can quay lai.",
    stats: [stat("3", "Khóa học dang học"), stat("78%", "Tiến độ TB"), stat("2", "Tac vu can hoan thanh")],
    actions: [
      action("Mo khóa học cua toi", demoPaths.studentMyCourses),
      action("Tiep tuc học bài", demoPaths.studentLearning, "secondary"),
      action("Dung chatbot AI", demoPaths.studentChatbot, "ghost"),
    ],
    panels: [
      panel("Widget nen co", ["Thong ke tiến do", "Bai học dang do", "Don hang gan day", "Goi y bài học tiep theo"]),
      panel("Lien ket nhanh", ["My Courses", "Progress", "Order History"]),
    ],
  },
  studentMyCourses: {
    roleKey: "student",
    title: "Khóa học của tôi",
    description: "Danh sách khóa học FREE va PAID ma Student da so huu, kem nut vao học ngay.",
    stats: [stat("Owned", "Trang thai"), stat("FREE", "Hỗ trợ"), stat("PAID", "Hỗ trợ")],
    actions: [
      action("Vao học", demoPaths.studentLearning),
      action("Mua them khóa học", demoPaths.guestCourseList, "secondary"),
      action("Xem tiến do", demoPaths.studentProgress, "ghost"),
    ],
    panels: [
      panel("Thong tin moi the khóa học", ["Anh dai dien", "Gia tri so huu", "Tiến độ", "Bai học gan nhat"]),
      panel("Quy tac", ["Không hien khóa học chua so huu", "Chi khóa da được cấp quyen moi vao học day du"]),
    ],
  },
  studentCart: {
    roleKey: "student",
    title: "Giỏ hàng",
    description: "Quan ly cac khóa học PAID truoc khi sang buoc coupon va thanh toan.",
    stats: [stat("Unique", "Moi khóa học 1 dong"), stat("No FREE", "Loai tru"), stat("Server", "Tinh gia")],
    actions: [
      action("Sang thanh toan", demoPaths.studentCheckout),
      action("Them khóa học", demoPaths.guestCourseList, "secondary"),
      action("Xem lich su mua", demoPaths.studentOrders, "ghost"),
    ],
    panels: [
      panel("Backend phai kiem tra", ["Không them khóa da so huu", "Không them khóa FREE", "Không cho trung dong trong gio"]),
      panel("UI nen the hien", ["Tong tam tinh", "Ma giam gia", "Thong bao backend se tinh lai gia"]),
    ],
  },
  studentCheckout: {
    roleKey: "student",
    title: "Thanh toán",
    description: "Xac nhan don hang, ap coupon, xem tong tiến sau khi backend tinh lai va chuyen qua gateway.",
    stats: [stat("Webhook", "Xu ly ket qua"), stat("Idempotent", "Bat buoc"), stat("No trust", "Frontend tong tiến")],
    actions: [
      action("Xem gio hang", demoPaths.studentCart),
      action("Xem lich su mua", demoPaths.studentOrders, "secondary"),
      action("Ve dashboard", demoPaths.studentDashboard, "ghost"),
    ],
    panels: [
      panel("Buoc nghiep vu", ["Tao order pending", "Redirect sang payment gateway", "Cho webhook xac minh thành công"]),
      panel("Cần tranh", ["Cap quyen học truoc webhook", "Dung tong tiến do client gửi len"]),
    ],
  },
  studentOrderHistory: {
    roleKey: "student",
    title: "Lich su mua hang",
    description: "Theo doi cac don hang, trang thai thanh toan, giao dich va thông tin refund neu co.",
    stats: [stat("PAID", "Trang thai thành công"), stat("FAILED", "Trang thai that bài"), stat("REFUND", "Có the hiển thị")],
    actions: [
      action("Mua them khóa học", demoPaths.guestCourseList),
      action("Ve checkout", demoPaths.studentCheckout, "secondary"),
      action("Mo khóa học da mua", demoPaths.studentMyCourses, "ghost"),
    ],
    panels: [
      panel("Cần hiển thị", ["Ma don hang", "Ngay mua", "Tong tiến", "Trang thai thanh toan", "Nut xem chi tiết"]),
      panel("Lien ket su kien", ["Thanh toán thành công", "Thanh toán that bài", "Refund da được duyệt"]),
    ],
  },
  studentCourseLearning: {
    roleKey: "student",
    title: "Hoc bài",
    description: "Man học bài day du cho Student da co quyen học, bao gom nội dung, navigator bài học va cấp nhat tiến do.",
    stats: [stat("Preview/Full", "Quyen truy cấp"), stat("Auto save", "Tiến độ"), stat("Lesson", "Dieu huong tiep")],
    actions: [
      action("Mo bài tap", demoPaths.studentExercise),
      action("Mo bài kiem tra", demoPaths.studentTest, "secondary"),
      action("Xem tu vung", demoPaths.studentVocabulary, "ghost"),
    ],
    panels: [
      panel("Cần phoi hop", ["Sidebar chuong bài", "Noi dung bài học", "Danh dau hoan thanh", "Tiến độ khóa học"]),
      panel("Kiem tra truy cấp", ["Cho phep neu da co enrollment", "Cho phep neu la bài preview", "Chan neu khóa PAID chua mua"]),
    ],
  },
  studentExercise: {
    roleKey: "student",
    title: "Bai tap",
    description: "Lam bài tap theo bài học hoac theo chu de, lưu bài nop va ket qua cham.",
    stats: [stat("Submission", "Luu bài"), stat("Score", "Cham diem"), stat("Retry", "Neu chinh sach cho phep")],
    actions: [
      action("Ve bài học", demoPaths.studentLearning),
      action("Sang bài kiem tra", demoPaths.studentTest, "secondary"),
      action("Xem tiến do", demoPaths.studentProgress, "ghost"),
    ],
    panels: [
      panel("Loai thanh phan", ["Trac nghiem", "Dien tu", "Noi cau", "Tap viet ngan"]),
      panel("Sau khi nop", ["Luu diem", "Hien dap an neu được phep", "Cap nhat progress"]),
    ],
  },
  studentTest: {
    roleKey: "student",
    title: "Bai kiem tra",
    description: "Kiem tra tong hop theo chu de hoac cuoi khóa, co quy dinh thoi gian va cach cham.",
    stats: [stat("Timed", "Có the ap dung"), stat("Final", "Tong hop"), stat("Recorded", "Luu diem")],
    actions: [
      action("Ve bài học", demoPaths.studentLearning),
      action("Xem tiến do", demoPaths.studentProgress, "secondary"),
      action("Mo chatbot AI", demoPaths.studentChatbot, "ghost"),
    ],
    panels: [
      panel("Cần hiển thị", ["Danh sach cau hoi", "Dong ho dem nguoc", "Nut nop bài", "Tong hop ket qua"]),
      panel("Luu y nghiep vu", ["Không sua sau khi nop neu policy không cho", "Luu lich su lam bài de teacher xem"]),
    ],
  },
  studentVocabulary: {
    roleKey: "student",
    title: "Hoc tu vung",
    description: "Trang học tu vung co the theo bài học, theo chu de va theo muc do nho.",
    stats: [stat("Flashcard", "Cach hiển thị"), stat("Topic", "Nhom tu"), stat("Review", "Lap lai")],
    actions: [
      action("Ve bài học", demoPaths.studentLearning),
      action("Mo grammar", demoPaths.studentGrammar, "secondary"),
      action("Xem progress", demoPaths.studentProgress, "ghost"),
    ],
    panels: [
      panel("Noi dung", ["Tu moi", "Phat am", "Vi du", "Nghia", "Muc do ghi nho"]),
      panel("Ket nội", ["Lien ket lesson", "Lien ket bài tap", "Cap nhat tiến do học tu vung"]),
    ],
  },
  studentGrammar: {
    roleKey: "student",
    title: "Học ngữ pháp",
    description: "Tổng hợp các điểm ngữ pháp theo bài học và trình độ, có ví dụ và bài tập thực hành.",
    stats: [stat("Rule", "Cấu trúc"), stat("Example", "Ví dụ"), stat("Practice", "Bài tập")],
    actions: [
      action("Về bài học", demoPaths.studentLearning),
      action("Sang học từ vựng", demoPaths.studentVocabulary, "secondary"),
      action("Mở bài tập", demoPaths.studentExercise, "ghost"),
    ],
    panels: [
      panel("Nội dung mong đợi", ["Công thức", "Cách dùng", "Lỗi thường gặp", "Ví dụ ngữ cảnh"]),
      panel("Giá trị UX", ["Học nhanh theo card", "Bài tập áp dụng ngay"]),
    ],
  },
  studentProgress: {
    roleKey: "student",
    title: "Tiến độ học tập",
    description: "Tổng hợp tiến độ khóa học, bài đã học, bài tập, kiểm tra và xu hướng học tập.",
    stats: [stat("100%", "Tiến độ học"), stat("Bài đã học", "Học tập"), stat("Nhiệm vụ", "Mục tiêu")],
    actions: [
      action("Quay lại khóa học", demoPaths.studentMyCourses),
      action("Tiếp tục học", demoPaths.studentLearning, "secondary"),
      action("Mở AI writing", demoPaths.studentWriting, "ghost"),
    ],
    panels: [
      panel("Báo cáo", ["Theo khóa học", "Theo kỹ năng", "Theo tuần học", "Theo điểm bài kiểm tra"]),
      panel("Mục đích", ["Giúp học viên thấy sự tiến bộ", "Theo dõi kết quả"]),
    ],
  },
  studentChatbot: {
    roleKey: "student",
    title: "Chatbot AI",
    description: "Luyện hội thoại, hỏi đáp ngữ pháp và thực hành tình huống theo bài học.",
    stats: [stat("AI", "Hội thoại"), stat("Context", "Bài học"), stat("History", "Lưu phiên")],
    actions: [
      action("Mở bài học", demoPaths.studentLearning),
      action("AI sửa writing", demoPaths.studentWriting, "secondary"),
      action("Về dashboard", demoPaths.studentDashboard, "ghost"),
    ],
    panels: [
      panel("Cần có", ["Khung chat", "Câu hỏi gợi ý", "Chủ đề bài học", "Lịch sử trò chuyện"]),
      panel("Kiểm soát", ["Hạn mức sử dụng", "Thời gian chờ", "Nội dung an toàn"]),
    ],
  },
  studentWritingCorrection: {
    roleKey: "student",
    title: "AI sửa bài viết",
    description: "Nhập bài viết, gửi AI phân tích, sửa lỗi và đề xuất câu văn hay hơn.",
    stats: [stat("Grammar", "Sua loi"), stat("Tone", "Nhan xet"), stat("Rewrite", "Goi y viet lai")],
    actions: [
      action("Dung chatbot AI", demoPaths.studentChatbot),
      action("Ve progress", demoPaths.studentProgress, "secondary"),
      action("Ve ho so", demoPaths.studentProfile, "ghost"),
    ],
    panels: [
      panel("Dau ra nen co", ["Ban goc", "Ban được sua", "Giai thich loi", "Goi y nang cấp tu vung"]),
      panel("Luu y nghiep vu", ["Luu lich su gửi bài", "Có the tinh quota theo ngay hoac goi"]),
    ],
  },
  studentProfile: {
    roleKey: "student",
    title: "Hồ sơ học viên",
    description: "Quản lý thông tin cá nhân, mục tiêu học tập và các tùy chọn tài khoản.",
    stats: [stat("Editable", "Thong tin"), stat("Goal", "Muc tieu học"), stat("History", "Mua va học")],
    actions: [
      action("Ve dashboard", demoPaths.studentDashboard),
      action("Xem lich su mua", demoPaths.studentOrders, "secondary"),
      action("Mo AI writing", demoPaths.studentWriting, "ghost"),
    ],
    panels: [
      panel("Thong tin can cấp nhat", ["Avatar", "Ho ten", "Muc tieu học", "Thong tin lien he"]),
      panel("Ket nội nghiep vu", ["Tiến độ học tap", "Lich su mua hang", "Lich su su dung AI"]),
    ],
  },
  teacherDashboard: {
    roleKey: "teacher",
    title: "Dashboard Teacher",
    description: "Tong quan khóa học, luot mua, học vien dang học va cac khóa học can xu ly.",
    stats: [stat("5", "Khóa học quan ly"), stat("124", "Hoc vien"), stat("8", "Muc can duyệt")],
    actions: [
      action("Quản lý khóa học", demoPaths.teacherCourses),
      action("Tạo khóa học moi", demoPaths.teacherCourseCreate, "secondary"),
      action("Xem doanh thu", demoPaths.teacherRevenue, "ghost"),
    ],
    panels: [
      panel("Widget quan trong", ["Khóa học gan day", "Trang thai duyệt", "Luot học vien moi", "Doanh thu thang"]),
      panel("Luot nghiep vu", ["Tao nội dung", "Gui duyệt", "Theo dõi học viên"]),
    ],
  },
  teacherCourseManagement: {
    roleKey: "teacher",
    title: "Quản lý khóa học",
    description: "Danh sách khóa học do chinh Teacher tao, kem trang thai duyệt, gia va hanh dong chinh.",
    stats: [stat("Mine only", "Phan quyen"), stat("Draft", "Cho phep"), stat("Submitted", "Cho duyệt")],
    actions: [
      action("Tạo khóa học", demoPaths.teacherCourseCreate),
      action("Sửa khóa học mau", demoPaths.teacherCourseEdit, "secondary"),
      action("Gui duyệt", demoPaths.teacherSubmission, "ghost"),
    ],
    panels: [
      panel("Cần hiển thị", ["Trang thai khóa học", "Gia de xuat", "Ngay cấp nhat", "So học vien", "Luot mua"]),
      panel("Quy tac", ["Teacher chi sua khóa học cua minh", "Không tu duyệt khóa học", "Không tu xac nhan thanh toan"]),
    ],
  },
  teacherCourseCreate: {
    roleKey: "teacher",
    title: "Tạo khóa học",
    description: "Khoi tao khóa học moi voi thông tin co ban, loai FREE/PAID va muc tieu học tap.",
    stats: [stat("FREE/PAID", "Loai"), stat("Draft", "Trang thai khoi tao"), stat("Admin", "Se duyệt")],
    actions: [
      action("Ve quan ly khóa học", demoPaths.teacherCourses),
      action("Sang lesson builder", demoPaths.teacherLessonBuilder, "secondary"),
      action("Gui duyệt sau", demoPaths.teacherSubmission, "ghost"),
    ],
    panels: [
      panel("Form nen co", ["Ten khóa học", "Mo ta", "Cap do", "Loai khóa học", "Gia de xuat neu PAID"]),
      panel("Sau khi tao", ["Them chuong bài", "Danh dau bài preview", "Bo sung question bank"]),
    ],
  },
  teacherCourseEdit: {
    roleKey: "teacher",
    title: "Sửa khóa học",
    description: "Cap nhat thông tin khóa học, curriculum, gia de xuat va phan preview truoc khi gửi duyệt.",
    stats: [stat("Owner", "Bat buoc"), stat("Revision", "Nen lưu"), stat("Re-submit", "Neu bi reject")],
    actions: [
      action("Mo lesson builder", demoPaths.teacherLessonBuilder),
      action("Mo question bank", demoPaths.teacherQuestionBank, "secondary"),
      action("Gui duyệt", demoPaths.teacherSubmission, "ghost"),
    ],
    panels: [
      panel("Cần tranh", ["Sửa khóa học cua người khac", "Xuat ban boi Teacher", "Bypass quy trinh duyệt gia"]),
      panel("Khi khóa học da publish", ["Neu thay doi lon thi nen submit lai de duyệt"]),
    ],
  },
  teacherLessonBuilder: {
    roleKey: "teacher",
    title: "Lesson Builder",
    description: "Noi Teacher tao chuong, bài học, vocab, grammar va chon bài preview.",
    stats: [stat("Chapter", "Cau truc"), stat("Lesson", "Noi dung"), stat("Preview", "Danh dau")],
    actions: [
      action("Quản lý khóa học", demoPaths.teacherCourses),
      action("Sửa khóa học", demoPaths.teacherCourseEdit, "secondary"),
      action("Mo question bank", demoPaths.teacherQuestionBank, "ghost"),
    ],
    panels: [
      panel("Khoi nội dung", ["Chapter list", "Lesson editor", "Vocabulary section", "Grammar section", "Preview toggle"]),
      panel("Lien ket nghiep vu", ["Bai học học thu cho Guest", "Bai học day du cho Student da co quyen"]),
    ],
  },
  teacherQuestionBank: {
    roleKey: "teacher",
    title: "Question Bank",
    description: "Quan ly ngan hang cau hoi de dung lai cho bài tap va bài kiem tra.",
    stats: [stat("Reuse", "Muc dich"), stat("Exercise", "Lien ket"), stat("Test", "Lien ket")],
    actions: [
      action("Mo lesson builder", demoPaths.teacherLessonBuilder),
      action("Gui duyệt khóa học", demoPaths.teacherSubmission, "secondary"),
      action("Ve dashboard", demoPaths.teacherDashboard, "ghost"),
    ],
    panels: [
      panel("Loai cau hoi", ["Trac nghiem", "Dien tu", "Noi cau", "Sap xep"]),
      panel("Nen quan ly", ["Do kho", "Chu de", "Giai thich dap an", "Trang thai su dung"]),
    ],
  },
  teacherCourseSubmission: {
    roleKey: "teacher",
    title: "Gui khóa học duyệt",
    description: "Tong hop khóa học da san sang, kiem tra dieu kien va gửi sang Admin phe duyệt.",
    stats: [stat("Submitted", "Trang thai"), stat("Price review", "Có tach rieng"), stat("Reject/Approve", "Ket qua")],
    actions: [
      action("Ve quan ly khóa học", demoPaths.teacherCourses),
      action("Xem doanh thu", demoPaths.teacherRevenue, "secondary"),
      action("Ve dashboard", demoPaths.teacherDashboard, "ghost"),
    ],
    panels: [
      panel("Checklist truoc submit", ["Thong tin khóa học day du", "Có bài preview", "Gia de xuat neu la PAID", "Có bài học/chuong"]),
      panel("Ket qua co the xay ra", ["Duoc approve", "Bi reject kem ly do", "Cần sua va submit lai"]),
    ],
  },
  teacherStudentTracking: {
    roleKey: "teacher",
    title: "Theo dõi học viên",
    description: "Theo doi so học vien, tiến do, diem bài tap va bài test trong cac khóa học cua chinh Teacher.",
    stats: [stat("Student", "Theo doi"), stat("Progress", "Quan sat"), stat("Score", "Bao cao")],
    actions: [
      action("Ve dashboard", demoPaths.teacherDashboard),
      action("Xem doanh thu", demoPaths.teacherRevenue, "secondary"),
      action("Quản lý khóa học", demoPaths.teacherCourses, "ghost"),
    ],
    panels: [
      panel("Cần hiển thị", ["Danh sach học vien", "Tiến độ khóa học", "Diem bài tap", "Diem test", "Bai dang cham"]),
      panel("Quy tac", ["Teacher chi xem du lieu khóa học cua minh", "Không quan ly user toan he thông"]),
    ],
  },
  teacherRevenue: {
    roleKey: "teacher",
    title: "Doanh thu khóa học",
    description: "Theo doi luot mua, doanh thu va xu huong ban hang cua khóa học do Teacher so huu.",
    stats: [stat("Gross", "Tong doanh thu"), stat("Orders", "Luot mua"), stat("Trend", "Theo thoi gian")],
    actions: [
      action("Ve dashboard", demoPaths.teacherDashboard),
      action("Theo dõi học viên", demoPaths.teacherStudents, "secondary"),
      action("Quản lý khóa học", demoPaths.teacherCourses, "ghost"),
    ],
    panels: [
      panel("Bao cao nen co", ["Theo khóa học", "Theo thang", "Theo trang thai thanh toan", "Theo refund"]),
      panel("Gioi han", ["Teacher chi xem doanh thu khóa cua minh"]),
    ],
  },
  teacherProfile: {
    roleKey: "teacher",
    title: "Ho so Teacher",
    description: "Quan ly thông tin giao vien, mo ta chuyen mon va thông tin hiển thị cong khai tren khóa học.",
    stats: [stat("Public", "Thong tin giao vien"), stat("Editable", "Profile"), stat("Controlled", "Tài khoản")],
    actions: [
      action("Ve dashboard", demoPaths.teacherDashboard),
      action("Quản lý khóa học", demoPaths.teacherCourses, "secondary"),
      action("Xem doanh thu", demoPaths.teacherRevenue, "ghost"),
    ],
    panels: [
      panel("Thong tin nen co", ["Avatar", "Tieu su", "Chuyen mon", "Kinh nghiem", "Lien ket xa hoi neu can"]),
      panel("Rang buoc", ["Tài khoản Teacher phai do Admin tao hoac phe duyệt"]),
    ],
  },
  adminDashboard: {
    roleKey: "admin",
    title: "Dashboard Admin",
    description: "Bang tong quan he thông de theo doi user, khóa học, giao dich va canh bao vận hành.",
    stats: [stat("360", "Tài khoản"), stat("42", "Don hang tuan"), stat("6", "Khóa học cho duyệt")],
    actions: [
      action("Duyệt khóa học", demoPaths.adminCourseApproval),
      action("Quan ly don hang", demoPaths.adminOrders, "secondary"),
      action("Xem báo cáo", demoPaths.adminReports, "ghost"),
    ],
    panels: [
      panel("The thông ke", ["User moi", "Doanh thu hom nay", "Refund mo", "Canh bao thanh toan"]),
      panel("Tac vu uu tiến", ["Duyệt khóa học", "Kiem tra giao dich loi", "Xu ly refund"]),
    ],
  },
  adminUserManagement: {
    roleKey: "admin",
    title: "Quan ly người dung",
    description: "Danh sach va tac vu khóa mo tài khóan, tim kiem, loc va xem thông tin role cua user.",
    stats: [stat("Lock/Unlock", "Tac vu"), stat("Search", "Bat buoc"), stat("Audit", "Cần lưu")],
    actions: [
      action("Quan ly Teacher", demoPaths.adminTeachers),
      action("Quan ly Role", demoPaths.adminRoles, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Cần co", ["Bang user", "Trang thai tài khóan", "Role", "Ngay tao", "Hanh dong khóa/mo"]),
      panel("Bao mat", ["Moi thay doi quan trong can ghi audit log"]),
    ],
  },
  adminTeacherManagement: {
    roleKey: "admin",
    title: "Quan ly Teacher",
    description: "Tao, phe duyệt va quan ly cac tài khóan Teacher trong he thông.",
    stats: [stat("Create", "Admin tao"), stat("Approve", "Admin phe duyệt"), stat("Lock", "Neu can")],
    actions: [
      action("Quan ly user", demoPaths.adminUsers),
      action("Duyệt khóa học", demoPaths.adminCourseApproval, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Quy trinh", ["Tao teacher", "Phe duyệt teacher", "Cap quyen hoat dong"]),
      panel("Quy tac", ["Teacher không được tu nang cấp role", "Teacher không được tu duyệt khóa học"]),
    ],
  },
  adminCourseApproval: {
    roleKey: "admin",
    title: "Duyệt khóa học va gia",
    description: "Noi Admin kiem tra chat luong nội dung, bài preview va gia de xuat truoc khi cho phep xuất bản.",
    stats: [stat("Approve", "Có the"), stat("Reject", "Có the"), stat("Price review", "Bat buoc voi PAID")],
    actions: [
      action("Xuất bản khóa học", demoPaths.adminCoursePublish),
      action("Quan ly Teacher", demoPaths.adminTeachers, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Checklist duyệt", ["Cau truc chuong bài", "Bai preview hop le", "Noi dung du chat luong", "Gia de xuat hop ly"]),
      panel("Ket qua", ["Approve", "Reject kem ly do", "Yeu cau Teacher sua va nop lai"]),
    ],
  },
  adminCoursePublish: {
    roleKey: "admin",
    title: "Xuat ban va an khóa học",
    description: "Dieu khien viec hiển thị catalog cong khai sau khi khóa học da được duyệt.",
    stats: [stat("Published", "Cong khai"), stat("Hidden", "Tam an"), stat("Catalog", "Tac dong")],
    actions: [
      action("Ve duyệt khóa học", demoPaths.adminCourseApproval),
      action("Xem catalog", demoPaths.guestCourseList, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Quy tac", ["Chi khóa da duyệt moi được publish", "Guest chi thay khóa da publish"]),
      panel("Tac dong", ["Anh huong den trang chu", "Anh huong den danh sach khóa học", "Anh huong den luong mua"]),
    ],
  },
  adminOrderManagement: {
    roleKey: "admin",
    title: "Quan ly don hang",
    description: "Theo doi don hang pending, paid, failed, canceled va cac thao tac ho tro vận hành.",
    stats: [stat("Order", "Theo doi"), stat("Status", "Da dang"), stat("Support", "Van hanh")],
    actions: [
      action("Quan ly giao dich", demoPaths.adminTransactions),
      action("Quan ly refund", demoPaths.adminRefunds, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Cần co", ["Ma don", "Hoc vien", "Tong tiến", "Trang thai", "Thoi gian", "Nguon thanh toan"]),
      panel("Không được lam", ["Không cấp quyen học thu cong neu payment chua xac minh"]),
    ],
  },
  adminTransactionManagement: {
    roleKey: "admin",
    title: "Quan ly giao dich",
    description: "Theo doi giao dich thanh toan, webhook, retry va doi soat du lieu tài chinh.",
    stats: [stat("Webhook", "Nguon cấp nhat"), stat("Signature", "Cần xac minh"), stat("Idempotent", "Bat buoc")],
    actions: [
      action("Quan ly don hang", demoPaths.adminOrders),
      action("Xem refund", demoPaths.adminRefunds, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Cần kiem soat", ["Duplicate webhook", "Giao dich that bài", "Giao dich thành công", "Ma tham chieu gateway"]),
      panel("Muc dich", ["Dam bao chi xu ly moi giao dich mot lan"]),
    ],
  },
  adminCouponManagement: {
    roleKey: "admin",
    title: "Quan ly coupon",
    description: "Tao, sua, khóa, gioi han va theo doi viec su dung ma giam gia trong he thông.",
    stats: [stat("Code", "Dinh danh"), stat("Quota", "Gioi han"), stat("Valid window", "Thoi gian")],
    actions: [
      action("Ve don hang", demoPaths.adminOrders),
      action("Xem báo cáo", demoPaths.adminReports, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Cần quan ly", ["Loai giam gia", "Dieu kien ap dung", "Thoi gian hieu luc", "So lan dung"]),
      panel("Quy tac", ["Backend la nội quyet dinh coupon hop le hay không"]),
    ],
  },
  adminRefundManagement: {
    roleKey: "admin",
    title: "Quan ly refund",
    description: "Xu ly yeu cau hoan tiến, ghi nhan ket qua refund va thu hoi quyen học khi can.",
    stats: [stat("Approve", "Có the"), stat("Reject", "Có the"), stat("Revoke", "Quyen học")],
    actions: [
      action("Quan ly giao dich", demoPaths.adminTransactions),
      action("Quan ly don hang", demoPaths.adminOrders, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Quy trinh", ["Tiep nhan yeu cau", "Kiem tra chinh sach", "Thuc hien refund", "Thu hoi enrollment neu can"]),
      panel("Cần lưu", ["Ly do refund", "Nguoi phe duyệt", "Thoi diem xu ly"]),
    ],
  },
  adminReport: {
    roleKey: "admin",
    title: "Bao cao",
    description: "Tong hop doanh thu, don hang, giao dich, refund, học vien va xu huong vận hành.",
    stats: [stat("Revenue", "Tong hop"), stat("Orders", "Chuyen doi"), stat("Trend", "Theo thoi gian")],
    actions: [
      action("Xem dashboard", demoPaths.adminDashboard),
      action("Xem giao dich", demoPaths.adminTransactions, "secondary"),
      action("Xem coupon", demoPaths.adminCoupons, "ghost"),
    ],
    panels: [
      panel("Bao cao nen co", ["Doanh thu theo thang", "Top khóa học", "Refund rate", "Ty le thanh toan thành công"]),
      panel("Nguon du lieu", ["Order", "Payment transaction", "Enrollment", "Refund"]),
    ],
  },
  adminSystemActivity: {
    roleKey: "admin",
    title: "Hoat dong he thông",
    description: "Theo doi audit log, su kien nhay cam, loi he thông va canh bao vận hành.",
    stats: [stat("Audit", "Bat buoc"), stat("Alert", "Canh bao"), stat("Monitoring", "He thông")],
    actions: [
      action("Ve dashboard", demoPaths.adminDashboard),
      action("Quan ly user", demoPaths.adminUsers, "secondary"),
      action("Xem giao dich", demoPaths.adminTransactions, "ghost"),
    ],
    panels: [
      panel("Su kien nen lưu", ["Khoa mo tài khóan", "Approve/reject khóa học", "Refund", "Xu ly webhook", "Đăng nhập Admin"]),
      panel("Gia tri", ["Tim loi nhanh", "Dieu tra su co", "Kiem toan he thông"]),
    ],
  },
  adminRoleManagement: {
    roleKey: "admin",
    title: "Quan ly role",
    description: "Dieu phoi role va quyen trong he thông, giu cho RBAC ro rang va an toan.",
    stats: [stat("RBAC", "Có che"), stat("Least privilege", "Nguyen tac"), stat("Admin", "Phe duyệt")],
    actions: [
      action("Quan ly user", demoPaths.adminUsers),
      action("Quan ly Teacher", demoPaths.adminTeachers, "secondary"),
      action("Ve dashboard", demoPaths.adminDashboard, "ghost"),
    ],
    panels: [
      panel("Role hien tài", ["Guest", "Student", "Teacher", "Admin"]),
      panel("Cần lưu y", ["Tài khoản dang ky mac dinh la Student", "Teacher can do Admin tao hoac phe duyệt"]),
    ],
  },
};


