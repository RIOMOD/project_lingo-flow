# STUDENT LEARNING UX FIX REPORT

Ngày kiểm tra: 22/07/2026  
Phạm vi: React frontend, Spring Boot backend, MySQL `english_learning`.

## 1. Vấn đề ban đầu

- Sidebar Student là danh sách phẳng, có Quick Switch role, checkout/order chiếm menu chính và không có chế độ thu gọn.
- Dashboard chưa chỉ ra chính xác bài cần học tiếp; “Khóa học của tôi” dùng progress `34%` hard-code.
- API chapter khóa gần như toàn bộ lesson không-preview, trong khi API lesson chỉ kiểm tra quyền course và cho phép vượt khóa bằng URL.
- Nút “Đánh dấu hoàn thành” tin request frontend, không kiểm tra tỷ lệ nội dung hoặc checkpoint.
- `learning_progress` chưa lưu vị trí media, tỷ lệ nội dung, checkpoint và thời gian heartbeat.
- Exercise/Test hiển thị mọi câu cùng lúc, không có autosave state khi reload, timer, flag, cảnh báo rời trang hoặc phân tích kết quả đầy đủ.

## 2. File đã sửa

Backend (20 file tracked + 2 file mới):

- `CourseController`, `ProgressController`.
- DTO: `AttemptResponse`, `LessonResponse`, `CourseProgressResponse`, `LessonProgressRequest`, `ProgressDashboardResponse`.
- Entity: `Lesson`, `LearningProgress`.
- Exception: `GlobalExceptionHandler`, `ForbiddenException` (mới).
- Repository: `LessonRepository`, `LearningProgressRepository` (được dùng lại), `TestAttemptRepository`, `VocabularyProgressRepository`.
- Service: `CourseService`, `ProgressService`, `AssessmentServiceImpl`, `CourseServiceImpl`, `ProgressServiceImpl`.
- Test mới: `ProgressServiceImplLearningTest`.

Frontend (13 file tracked + 2 component mới):

- `AppShell.jsx`, `LessonMedia.jsx` (source mới trong worktree), `AssessmentQuestion.jsx` (mới).
- `navigation.js`, `AppRoutes.jsx`.
- `DashboardPage.jsx`, `CourseLearningPage.jsx`, `ExercisePage.jsx`, `TestPage.jsx`, `MyCoursesPage.jsx`.
- `progressService.js`, `assessmentService.js`, `global.css`.

Database:

- `database/migrations/003_student_learning_progress.sql` (mới).
- `database/seed/001_seed_sample_data.sql`.

## 3. Component đã tạo mới

- `AssessmentQuestion`: render single choice, multiple choice, true/false, listening choice, fill blank, writing, sentence ordering và matching; dùng cùng một contract autosave.
- `LessonMedia`: resume native video/audio và YouTube IFrame API, heartbeat tiến độ, giữ vị trí, hạn chế seek vượt quá phần đã xem.
- `AppShell` được tái cấu trúc thành sidebar nhóm có collapse/hamburger, account footer và header actions.

## 4. API đã sửa hoặc thêm

- `GET /api/courses/{courseId}/chapters`: nhận authentication, trả `locked`, `lockReason`, `progressStatus`, media/content progress và checkpoint state theo đúng user.
- `GET /api/courses/{courseId}/lessons/{lessonId}`: trả HTTP 403 nếu bài chưa mở.
- `PUT /api/progress/lessons/{lessonId}`: lưu heartbeat, media position/duration và content percent.
- `POST /api/progress/lessons/{lessonId}/start`: kiểm tra quyền course và prerequisite lesson.
- `POST /api/progress/lessons/{lessonId}/complete`: backend tự kiểm tra >=85%, checkpoint, quyền và trạng thái mở; idempotent nếu request lặp.
- `GET /api/progress/dashboard`: thêm tên, mục tiêu, exercise count, average score, due vocabulary, khóa/bài tiếp tục và last access.
- Assessment attempt trả lại answer đã autosave cả khi `IN_PROGRESS`; kết quả có total points, percentage, pass/fail, correct/incorrect, elapsed time và explanations.

## 5. Database migration

Migration `003_student_learning_progress.sql` thêm:

- Lesson: `checkpoint_question`, `checkpoint_answer`, `checkpoint_explanation`.
- Progress: `study_time_seconds`, `media_position_seconds`, `media_duration_seconds`, `content_progress_percent`, `checkpoint_score`, `checkpoint_passed`, `checkpoint_attempts`.
- Check constraints cho percent, media position và study seconds.

Migration đã chạy thành công trên MySQL thật. Seed có checkpoint riêng cho 18 lesson.

## 6. Logic mở khóa lesson

- Course owner/enrollment: lesson đầu tiên mở.
- Lesson N chỉ mở khi progress lesson N-1 là `COMPLETED` và không phải preview-only.
- Thứ tự tính theo `chapter.position`, sau đó `lesson.position`, nên chuyển chapter đúng.
- Cùng một hàm quy tắc được áp ở danh sách, mở lesson, start/track/complete; URL bypass trả 403 cùng lý do cụ thể.
- Sau completion, frontend tải lại roadmap ngay và hiển thị nút tới `nextLessonId`; không cần reload trang.

## 7. Điều kiện hoàn thành lesson

- Text: frontend theo dõi vùng nội dung đã đọc; backend yêu cầu tối thiểu 85% và ít nhất khoảng 30 giây heartbeat liên tục.
- Video/audio: lưu current position/duration, coverage và resume; frontend chặn seek xa hơn phần đã xem, backend giới hạn coverage theo tổng heartbeat hợp lệ.
- Khoảng nghỉ/offline trên 45 giây không được tính là thời gian học.
- Checkpoint đúng mới set `checkpoint_passed`, `checkpoint_score=100`, `completed_at`; sai tăng attempts nhưng giữ nguyên content progress.
- Request completion lặp lại không cộng checkpoint/time và trả progress hiện tại.

## 8. Logic exercise và quiz

- Một câu tại một thời điểm, question map, previous/next, progress, autosave và before-unload warning.
- Confirm khi nộp và nêu số câu bỏ trống.
- Test có timer từ `dueAt`, cảnh báo 5 phút cuối, auto-submit hết giờ và flag câu cần xem lại.
- Kết quả có điểm, phần trăm, đúng/sai, thời gian, đạt/chưa đạt, explanation từng câu, retry và link tiếp tục học.
- Answer autosave được backend trả lại khi reload attempt; correct answer vẫn bị ẩn trước submit.

## 9. Cấu trúc sidebar mới

- Tổng quan.
- Học tập: Khóa học của tôi, Lộ trình học, Bài tập, Bài kiểm tra.
- Ôn luyện: Từ vựng, Ngữ pháp.
- Công cụ AI: Chatbot AI, AI sửa Writing.
- Tiến độ.
- Account footer: avatar, tên, hồ sơ/cài đặt, đăng xuất.
- Checkout chỉ còn trong flow; order history ở account menu; cart/search/notification/avatar ở sticky header.
- Student không render Teacher/Admin hoặc Quick Switch. Quick Switch của role khác chỉ render khi `import.meta.env.DEV`.

## 10. Kết quả build frontend

- `npm.cmd run build`: PASS.
- `npm.cmd install`: PASS, dependencies đã up to date (audit báo 1 moderate và 1 high vulnerability; chưa tự động `--force` vì có thể gây breaking change).
- Vite 5.4.21, 116 modules transformed.
- Output JS 335.71 kB (gzip 94.86 kB), CSS 54.59 kB (gzip 10.84 kB).
- Dev server hiện chạy tại `http://localhost:5174`, HTTP smoke test trả 200.
- `git diff --check` trên toàn bộ file thuộc phạm vi: PASS, không có whitespace error.

## 11. Kết quả test backend

- `mvnw.cmd clean test package`: PASS.
- 17 test, 17 pass, 0 failure, 0 error, 0 skipped.
- Trong đó có 3 test mới: first lesson unlocked, next lesson forbidden, completion dưới threshold bị từ chối.
- `mvnw.cmd spring-boot:run` đã được gọi nhưng Maven fork lỗi classpath vì đường dẫn workspace có Unicode. Workaround đã kiểm chứng: package JAR, copy sang `C:\tmp\lingoflow-backend.jar`, chạy `java -jar`; backend hiện chạy cổng 8080 và kết nối MySQL thành công.

## 12. Test case pass/fail

| # | Test case | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Student mới chỉ mở lesson đầu | PASS | Unit test + API Student 2 |
| 2 | Lesson sau có lý do khóa | PASS | API response có `lockReason` |
| 3 | Chưa đủ coverage không hoàn thành | PASS | HTTP 400 + unit test |
| 4 | Đủ coverage nhưng thiếu/sai checkpoint | PASS | HTTP 400; attempts lưu DB |
| 5 | Trả lời đúng hoàn thành | PASS | HTTP 200; DB COMPLETED |
| 6 | Lesson tiếp theo mở ngay | PASS | API roadmap ngay sau complete |
| 7 | Nút bài tiếp theo dùng đúng ID | PASS (build/code) | Route `/learn/:courseId/:lessonId` |
| 8 | Reload không mất progress | PASS | Reload attempt/roadmap qua API |
| 9 | Logout/login lại giữ progress | PASS | Đăng nhập lại Student 2 |
| 10 | URL lesson khóa bị chặn | PASS | HTTP 403 |
| 11 | Cuối chapter sang chapter tiếp | PASS | Lesson 2 mở lesson 3/chapter 2 |
| 12 | Cuối course có tổng kết | PASS (build/code) | `courseComplete` UI branch; chưa chạy hết 4 bài |
| 13 | Exercise lưu đáp án | PASS | Save + GET attempt vẫn có answer |
| 14 | Quiz tự động lưu | PASS | Save + attempt response |
| 15 | Quiz có kết quả/explanation | PASS | API có 100%, pass, explanation |
| 16 | Sidebar collapse | PASS (build/code) | State + CSS; chưa browser automation |
| 17 | Mobile hamburger | PASS (build/code) | Breakpoint 840px; chưa device lab |
| 18 | Student không có Quick Switch | PASS | Conditional render khóa Student |
| 19 | Student không có Admin/Teacher | PASS | Navigation theo role Student |
| 20 | Dashboard không dùng số thống kê hard-code | PASS | Tất cả stat từ `/progress/dashboard` |

Kịch bản tích hợp đã làm thay đổi dữ liệu test hợp lệ: `student2@example.com` hoàn thành lesson 1 và 2 của course 1, đồng thời tạo một exercise attempt và một test attempt.

## 13. Chức năng chưa hoàn thành

- Chưa áp prerequisite “exercise bắt buộc” hoặc “quiz cuối chapter” vào unlock vì schema hiện không có `is_required`, `minimum_score` cho exercise và không có quan hệ test-chapter. Không tự suy đoán mọi exercise hiện có là bắt buộc để tránh khóa nhầm course đang chạy.
- `study_schedules` có table SQL nhưng backend hiện chưa có entity/repository/API; dashboard dùng empty state/gợi ý thay vì mock lịch.
- Notification icon mới là entry point UI, chưa có notification dropdown realtime.
- Không có browser E2E framework trong project; collapse/mobile/final-course được build và code-review nhưng chưa tự động click bằng browser.

## 14. Rủi ro còn lại

- Media ngoài native file/YouTube không cung cấp playback telemetry chuẩn; iframe lạ không thể xác minh coverage chính xác.
- Client telemetry không thể chống gian lận tuyệt đối; backend đã cap bằng server heartbeat và bỏ thời gian offline nhưng không phải DRM.
- Course progress hiện lấy danh sách enrollment active; dữ liệu production cần đảm bảo paid ownership luôn đồng bộ enrollment hoặc mở rộng query union ownership.
- Cần migration tiếp theo cho mandatory exercise/chapter quiz trước khi bật prerequisite này.
- Workspace có nhiều thay đổi tồn tại từ trước và tracked build artifacts trong `backend/target`; không được nhầm toàn bộ worktree diff là riêng task này.

## Git diff và source đầu ra

Task scope (tracked): 30 file, 1,293 insertions, 649 deletions.  
Task scope (new/untracked, gồm báo cáo): 6 file, 440 dòng.  
Tổng task scope: 36 file, xấp xỉ 1,733 insertions và 649 deletions.

`git diff --shortstat` toàn worktree hiện tại (bao gồm thay đổi có sẵn và build artifacts):

```text
380 files changed, 2449 insertions(+), 3378 deletions(-)
```

Toàn bộ source đã sửa nằm trực tiếp trong các file liệt kê ở mục 2; không có mockup tĩnh hoặc source rút gọn thay thế.
