-- Seed default roles and sample application data

INSERT INTO roles (id, code, name, description) VALUES
  (1, 'ADMIN', 'Quản trị viên', 'Quản trị toàn hệ thống'),
  (2, 'TEACHER', 'Giảng viên', 'Tạo và quản lý khóa học'),
  (3, 'STUDENT', 'Học viên', 'Vai trò mặc định khi đăng ký');

INSERT INTO users (id, role_id, email, password_hash, full_name, phone, avatar_url, status, email_verified_at) VALUES
  (1, 1, 'admin@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Quản trị hệ thống', '0900000001', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP),
  (2, 2, 'teacher@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Nguyễn Minh Anh', '0900000002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP),
  (3, 3, 'student@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Trần Hà Linh', '0900000003', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP),
  (4, 3, 'student2@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Phạm Quốc Bảo', '0900000004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP),
  (5, 2, 'teacher2@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Lê Hoàng Nam', '0900000005', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO user_profiles (user_id, gender, english_level, learning_goal, bio) VALUES
  (1, 'OTHER', 'ADVANCED', 'Vận hành và kiểm duyệt hệ thống', 'Tài khoản admin mẫu dùng để test quản trị.'),
  (2, 'FEMALE', 'ADVANCED', 'Xây dựng khóa học giao tiếp và IELTS', 'Giảng viên tiếng Anh với kinh nghiệm dạy giao tiếp cho người đi làm.'),
  (3, 'FEMALE', 'BEGINNER', 'Tự tin giao tiếp trong công việc', 'Học viên mẫu đã sở hữu khóa FREE và một khóa PAID.'),
  (4, 'MALE', 'ELEMENTARY', 'Cải thiện phát âm và từ vựng', 'Học viên mẫu dùng để test cart, order pending và progress.'),
  (5, 'MALE', 'ADVANCED', 'Xây dựng nội dung luyện thi', 'Giảng viên mẫu thứ hai dùng để test phân quyền Teacher.');

INSERT INTO course_categories (id, name, slug, description, status) VALUES
  (1, 'Giao tiếp tiếng Anh', 'giao-tiep-tieng-anh', 'Khóa học giao tiếp cho học tập và công việc', 'ACTIVE'),
  (2, 'IELTS Foundation', 'ielts-foundation', 'Nền tảng IELTS cho người mới bắt đầu', 'ACTIVE'),
  (3, 'Phát âm', 'phat-am', 'Luyện phát âm, trọng âm và ngữ điệu', 'ACTIVE'),
  (4, 'Business English', 'business-english', 'Tiếng Anh cho môi trường công sở', 'ACTIVE');

INSERT INTO courses (
  id, category_id, teacher_id, title, slug, short_description, description,
  thumbnail_url, level, course_type, original_price, sale_price, sale_start_at,
  sale_end_at, status, published_at
) VALUES
  (1, 1, 2, 'Giao tiếp tiếng Anh cho người mới bắt đầu', 'giao-tiep-tieng-anh-cho-nguoi-moi-bat-dau', 'Khóa FREE giúp bạn làm quen hội thoại hằng ngày.', 'Học cách chào hỏi, giới thiệu bản thân, hỏi đường, gọi món và xử lý các tình huống giao tiếp cơ bản bằng tiếng Anh.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80', 'BEGINNER', 'FREE', 0.00, NULL, NULL, NULL, 'PUBLISHED', CURRENT_TIMESTAMP),
  (2, 2, 2, 'IELTS Foundation: Từ vựng và ngữ pháp nền tảng', 'ielts-foundation-tu-vung-va-ngu-phap-nen-tang', 'Khóa PAID xây nền tảng IELTS cho band 4.0-5.0.', 'Tập trung vào từ vựng học thuật, ngữ pháp cốt lõi, kỹ năng đọc hiểu và bài kiểm tra nền tảng để chuẩn bị cho IELTS.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 'INTERMEDIATE', 'PAID', 1200000.00, 799000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),
  (3, 3, 5, 'Phát âm chuẩn và nghe hiểu cơ bản', 'phat-am-chuan-va-nghe-hieu-co-ban', 'Luyện âm, trọng âm và nghe hiểu câu ngắn.', 'Khóa học giúp học viên nhận diện âm khó, luyện nối âm, ngữ điệu và cải thiện khả năng nghe trong giao tiếp thường ngày.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80', 'ELEMENTARY', 'PAID', 900000.00, 590000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),
  (4, 4, 5, 'Business English: Email và họp công sở', 'business-english-email-va-hop-cong-so', 'Tiếng Anh cho email, meeting và thuyết trình ngắn.', 'Học cách viết email chuyên nghiệp, mở đầu cuộc họp, trình bày quan điểm và phản hồi lịch sự trong môi trường làm việc.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80', 'ADVANCED', 'PAID', 1500000.00, 1090000.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PUBLISHED', CURRENT_TIMESTAMP),
  (5, 2, 2, 'IELTS Writing Task 2 Intensive', 'ielts-writing-task-2-intensive', 'Khóa đang chờ Admin duyệt để test màn duyệt khóa học.', 'Nội dung luyện viết luận Task 2 theo cấu trúc, tiêu chí chấm điểm và phản hồi chi tiết.', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80', 'ADVANCED', 'PAID', 1800000.00, 1290000.00, NULL, NULL, 'SUBMITTED', NULL);

INSERT INTO chapters (id, course_id, title, description, position, status) VALUES
  (1, 1, 'Bắt đầu giao tiếp', 'Làm quen với câu chào hỏi và giới thiệu bản thân', 1, 'PUBLISHED'),
  (2, 1, 'Tình huống hằng ngày', 'Hỏi đường, gọi món và nói chuyện ngắn', 2, 'PUBLISHED'),
  (3, 2, 'IELTS Basics', 'Tổng quan bài thi và chiến lược học nền tảng', 1, 'PUBLISHED'),
  (4, 2, 'Academic Language', 'Từ vựng và cấu trúc học thuật', 2, 'PUBLISHED'),
  (5, 3, 'Pronunciation Core', 'Âm khó, trọng âm và nối âm', 1, 'PUBLISHED'),
  (6, 3, 'Listening Practice', 'Nghe câu ngắn và hội thoại đơn giản', 2, 'PUBLISHED'),
  (7, 4, 'Workplace Email', 'Viết email công sở', 1, 'PUBLISHED'),
  (8, 4, 'Meetings', 'Họp và trình bày ý kiến', 2, 'PUBLISHED');

INSERT INTO lessons (
  id, chapter_id, title, lesson_type, content, audio_url, video_url,
  position, duration_minutes, is_preview, status
) VALUES
  (1, 1, 'Chào hỏi và giới thiệu bản thân', 'MIXED', 'Hello, nice to meet you. My name is Linh. I am learning English for work.', NULL, 'https://www.youtube.com/watch?v=DywRyvzWoYY', 1, 15, TRUE, 'PUBLISHED'),
  (2, 1, 'Hỏi thăm và phản hồi lịch sự', 'MIXED', 'Học các mẫu câu hỏi thăm sức khỏe, tâm trạng và cách phản hồi lịch sự trong tiếng Anh hằng ngày:\n\n1. How are you today? (Bạn hôm nay thế nào?)\n- I am doing great, thank you! (Tôi rất tốt, cảm ơn bạn!)\n- Pretty good, how about you? (Khá tốt, còn bạn thì sao?)\n- Not bad, thanks. (Không tệ, cảm ơn bạn.)\n\n2. How is it going? (Mọi chuyện thế nào rồi?)\n- Everything is fine! (Mọi thứ đều ổn!)\n- Couldn''t be better! (Không thể tốt hơn!)\n\n3. Luyện tập theo video bài giảng để nắm vững phát âm và ngữ điệu hội thoại tự nhiên.', NULL, 'https://www.youtube.com/watch?v=DywRyvzWoYY', 2, 18, FALSE, 'PUBLISHED'),
  (3, 2, 'Gọi món tại quán cà phê', 'TEXT', 'Can I have a latte, please? Would you like anything else?', NULL, NULL, 1, 20, FALSE, 'PUBLISHED'),
  (4, 2, 'Hỏi đường trong thành phố', 'AUDIO', 'Excuse me, how can I get to the nearest station?', 'https://www.oxfordonlineenglish.com/wp-content/uploads/2013/09/directions.mp3', NULL, 2, 22, FALSE, 'PUBLISHED'),
  (5, 3, 'Tổng quan IELTS', 'VIDEO', 'IELTS includes Listening, Reading, Writing and Speaking. Each skill needs a clear strategy.', NULL, 'https://www.youtube.com/embed?listType=user_uploads&list=IELTSofficial', 1, 25, TRUE, 'PUBLISHED'),
  (6, 3, 'Cách đặt mục tiêu band điểm', 'TEXT', 'A realistic study plan helps you improve step by step.', NULL, NULL, 2, 20, FALSE, 'PUBLISHED'),
  (7, 4, 'Từ vựng học thuật thường gặp', 'TEXT', 'Analyze, evaluate, significant, approach and evidence are common academic words.', NULL, NULL, 1, 30, FALSE, 'PUBLISHED'),
  (8, 4, 'Câu phức trong IELTS Writing', 'TEXT', 'Although the topic is difficult, a clear outline can improve your response.', NULL, NULL, 2, 28, FALSE, 'PUBLISHED'),
  (9, 5, 'Âm /θ/ và /ð/', 'MIXED', 'Practice: think, three, this, mother. Put your tongue lightly between your teeth.', NULL, 'https://www.youtube.com/watch?v=ruI2tdQzprg', 1, 18, TRUE, 'PUBLISHED'),
  (10, 5, 'Trọng âm trong từ hai âm tiết', 'TEXT', 'Some nouns stress the first syllable, while many verbs stress the second syllable.', NULL, NULL, 2, 20, FALSE, 'PUBLISHED'),
  (11, 6, 'Nghe câu hỏi ngắn', 'AUDIO', 'Listen for question words: what, where, when, why and how.', 'https://magoosh-company-site.s3.amazonaws.com/wp-content/uploads/toefl/files/2016/08/17165619/Q1Advanced.mp3', NULL, 1, 18, FALSE, 'PUBLISHED'),
  (12, 6, 'Nghe hội thoại tại sân bay', 'AUDIO', 'Could you show me your passport, please?', 'https://www.espressoenglish.net/wp-content/uploads/2013/06/16a.mp3', NULL, 2, 24, FALSE, 'PUBLISHED'),
  (13, 7, 'Cấu trúc email chuyên nghiệp', 'MIXED', 'Start with a clear greeting, state your purpose, give details and close politely.', NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk', 1, 22, TRUE, 'PUBLISHED'),
  (14, 7, 'Xin lỗi và dời lịch họp', 'TEXT', 'I apologize for the inconvenience. Could we reschedule the meeting to Friday?', NULL, NULL, 2, 20, FALSE, 'PUBLISHED'),
  (15, 8, 'Mở đầu cuộc họp', 'MIXED', 'Thank you for joining. Today, we will discuss the project timeline.', NULL, 'https://www.youtube.com/watch?v=5MFQH5IHOFk', 1, 25, FALSE, 'PUBLISHED'),
  (16, 8, 'Trình bày quan điểm lịch sự', 'TEXT', 'From my perspective, we should prioritize customer feedback.', NULL, NULL, 2, 24, FALSE, 'PUBLISHED'),
  (17, 3, 'Reading preview: Skimming', 'TEXT', 'Skimming helps you understand the general idea before reading details.', NULL, NULL, 3, 16, FALSE, 'PUBLISHED'),
  (18, 5, 'Minimal pairs practice', 'AUDIO', 'Listen and repeat: ship/sheep, bit/beat, live/leave.', 'https://www.adelescorner.org/pronunciation/minimal_pairs/ship_sheep/ship.mp3', NULL, 3, 18, FALSE, 'PUBLISHED');
