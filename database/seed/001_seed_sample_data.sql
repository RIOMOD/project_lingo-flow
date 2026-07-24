SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE english_learning;

INSERT INTO roles (id, code, name, description) VALUES
  (1, 'ADMIN', 'Quản trị viên', 'Quản trị toàn hệ thống'),
  (2, 'TEACHER', 'Giảng viên', 'Tạo và quản lý khóa học'),
  (3, 'STUDENT', 'Học viên', 'Vai trò mặc định khi đăng ký');

INSERT INTO users (id, role_id, email, password_hash, full_name, phone, avatar_url, status, email_verified_at) VALUES
  (1, 1, 'admin@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Quản trị hệ thống', '0900000001', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'ACTIVE', NOW()),
  (2, 2, 'teacher@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Nguyễn Minh Anh', '0900000002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'ACTIVE', NOW()),
  (3, 3, 'student@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Trần Hà Linh', '0900000003', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=300&q=80', 'ACTIVE', NOW()),
  (4, 3, 'student2@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Phạm Quốc Bảo', '0900000004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'ACTIVE', NOW()),
  (5, 2, 'teacher2@example.com', '$2a$10$w9eNN974rRtY0XaJmtploOj5LFMNFfyClKmYh6pKSdDXTcTwbCDK2', 'Lê Hoàng Nam', '0900000005', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'ACTIVE', NOW());

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
  (1, 1, 2, 'Giao tiếp tiếng Anh cho người mới bắt đầu', 'giao-tiep-tieng-anh-cho-nguoi-moi-bat-dau', 'Khóa FREE giúp bạn làm quen hội thoại hằng ngày.', 'Học cách chào hỏi, giới thiệu bản thân, hỏi đường, gọi món và xử lý các tình huống giao tiếp cơ bản bằng tiếng Anh.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80', 'BEGINNER', 'FREE', 0.00, NULL, NULL, NULL, 'PUBLISHED', NOW()),
  (2, 2, 2, 'IELTS Foundation: Từ vựng và ngữ pháp nền tảng', 'ielts-foundation-tu-vung-va-ngu-phap-nen-tang', 'Khóa PAID xây nền tảng IELTS cho band 4.0-5.0.', 'Tập trung vào từ vựng học thuật, ngữ pháp cốt lõi, kỹ năng đọc hiểu và bài kiểm tra nền tảng để chuẩn bị cho IELTS.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 'INTERMEDIATE', 'PAID', 1200000.00, 799000.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'PUBLISHED', NOW()),
  (3, 3, 5, 'Phát âm chuẩn và nghe hiểu cơ bản', 'phat-am-chuan-va-nghe-hieu-co-ban', 'Luyện âm, trọng âm và nghe hiểu câu ngắn.', 'Khóa học giúp học viên nhận diện âm khó, luyện nối âm, ngữ điệu và cải thiện khả năng nghe trong giao tiếp thường ngày.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80', 'ELEMENTARY', 'PAID', 900000.00, 590000.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'PUBLISHED', NOW()),
  (4, 4, 5, 'Business English: Email và họp công sở', 'business-english-email-va-hop-cong-so', 'Tiếng Anh cho email, meeting và thuyết trình ngắn.', 'Học cách viết email chuyên nghiệp, mở đầu cuộc họp, trình bày quan điểm và phản hồi lịch sự trong môi trường làm việc.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80', 'ADVANCED', 'PAID', 1500000.00, 1090000.00, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'PUBLISHED', NOW()),
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
  (2, 1, 'Hỏi thăm và phản hồi lịch sự', 'TEXT', 'How are you today? I am good, thank you. How about you?', NULL, NULL, 2, 18, FALSE, 'PUBLISHED'),
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

UPDATE lessons
SET checkpoint_question = CASE id
      WHEN 1 THEN 'Cụm từ tiếng Anh nào dùng để chào hỏi?'
      WHEN 2 THEN 'Câu hỏi thăm sức khỏe trong bài là gì?'
      WHEN 3 THEN 'Cụm từ nào dùng để gọi món lịch sự?'
      WHEN 4 THEN 'Từ tiếng Anh nào có nghĩa là nhà ga?'
      WHEN 5 THEN 'IELTS có bao nhiêu kỹ năng?'
      WHEN 6 THEN 'Một kế hoạch học tập nên như thế nào?'
      WHEN 7 THEN 'Từ nào trong bài có nghĩa là bằng chứng?'
      WHEN 8 THEN 'Từ nối mở đầu câu phức trong bài là gì?'
      WHEN 9 THEN 'Từ nào trong bài có âm /θ/?'
      WHEN 10 THEN 'Danh từ hai âm tiết thường nhấn âm tiết thứ mấy?'
      WHEN 11 THEN 'Từ để hỏi nào dùng để hỏi địa điểm?'
      WHEN 12 THEN 'Giấy tờ cần xuất trình tại sân bay là gì?'
      WHEN 13 THEN 'Phần đầu tiên của email chuyên nghiệp là gì?'
      WHEN 14 THEN 'Động từ nào dùng để đề nghị dời lịch?'
      WHEN 15 THEN 'Từ nào dùng để cảm ơn người tham dự?'
      WHEN 16 THEN 'Cụm nào dùng để nêu quan điểm cá nhân?'
      WHEN 17 THEN 'Kỹ thuật đọc để nắm ý chung là gì?'
      WHEN 18 THEN 'Cặp từ nào được luyện trong bài?'
    END,
    checkpoint_answer = CASE id
      WHEN 1 THEN 'hello' WHEN 2 THEN 'how are you' WHEN 3 THEN 'can i have'
      WHEN 4 THEN 'station' WHEN 5 THEN 'four' WHEN 6 THEN 'realistic'
      WHEN 7 THEN 'evidence' WHEN 8 THEN 'although' WHEN 9 THEN 'think'
      WHEN 10 THEN 'first' WHEN 11 THEN 'where' WHEN 12 THEN 'passport'
      WHEN 13 THEN 'greeting' WHEN 14 THEN 'reschedule' WHEN 15 THEN 'thank you'
      WHEN 16 THEN 'from my perspective' WHEN 17 THEN 'skimming' WHEN 18 THEN 'ship sheep'
    END,
    checkpoint_explanation = 'Hãy xem lại phần nội dung chính ngay phía trên rồi thử lại.'
WHERE id BETWEEN 1 AND 18;

INSERT INTO lesson_contents (lesson_id, content_type, title, body, resource_url, position) VALUES
  (1, 'TEXT', 'Mẫu câu chào hỏi', 'Hello. Hi. Good morning. Nice to meet you. My name is...', NULL, 1),
  (3, 'TEXT', 'Mẫu câu gọi món', 'Can I have...? I would like... How much is it?', NULL, 1),
  (5, 'TEXT', 'Bốn kỹ năng IELTS', 'IELTS gồm Listening, Reading, Writing và Speaking. Hãy học đều từng kỹ năng.', NULL, 1),
  (7, 'TEXT', 'Từ vựng học thuật', 'Analyze means phân tích. Evidence means bằng chứng.', NULL, 1),
  (9, 'TEXT', 'Cách đặt lưỡi', 'Đặt đầu lưỡi nhẹ giữa hai hàm răng và thổi hơi ra.', NULL, 1),
  (13, 'TEXT', 'Khung email', 'Greeting - Purpose - Details - Closing.', NULL, 1);

INSERT INTO vocabularies (
  id, course_id, lesson_id, word, ipa, meaning, part_of_speech,
  example_sentence, example_meaning, audio_url, image_url, level, topic
) VALUES
  (1, 1, 1, 'hello', '/həˈləʊ/', 'xin chào', 'OTHER', 'Hello, my name is Anna.', 'Xin chào, tên tôi là Anna.', NULL, NULL, 'BEGINNER', 'Greetings'),
  (2, 1, 3, 'order', '/ˈɔːrdər/', 'gọi món, đặt hàng', 'VERB', 'I would like to order a coffee.', 'Tôi muốn gọi một ly cà phê.', NULL, NULL, 'BEGINNER', 'Cafe'),
  (3, 2, 7, 'analyze', '/ˈænəlaɪz/', 'phân tích', 'VERB', 'You should analyze the chart carefully.', 'Bạn nên phân tích biểu đồ cẩn thận.', NULL, NULL, 'INTERMEDIATE', 'IELTS Writing'),
  (4, 2, 7, 'evidence', '/ˈevɪdəns/', 'bằng chứng', 'NOUN', 'The essay needs clear evidence.', 'Bài luận cần bằng chứng rõ ràng.', NULL, NULL, 'INTERMEDIATE', 'IELTS Writing'),
  (5, 3, 9, 'think', '/θɪŋk/', 'suy nghĩ', 'VERB', 'I think pronunciation takes practice.', 'Tôi nghĩ phát âm cần luyện tập.', NULL, NULL, 'ELEMENTARY', 'Pronunciation'),
  (6, 3, 11, 'passport', '/ˈpæspɔːrt/', 'hộ chiếu', 'NOUN', 'Please show me your passport.', 'Vui lòng cho tôi xem hộ chiếu.', NULL, NULL, 'ELEMENTARY', 'Airport'),
  (7, 4, 13, 'reschedule', '/ˌriːˈskedʒuːl/', 'dời lịch', 'VERB', 'Could we reschedule the meeting?', 'Chúng ta có thể dời lịch họp không?', NULL, NULL, 'ADVANCED', 'Business Email'),
  (8, 4, 16, 'prioritize', '/praɪˈɔːrətaɪz/', 'ưu tiên', 'VERB', 'We should prioritize customer feedback.', 'Chúng ta nên ưu tiên phản hồi khách hàng.', NULL, NULL, 'ADVANCED', 'Meeting');

INSERT INTO grammar_topics (
  id, course_id, lesson_id, title, description, formula, usage_text, example, note, level
) VALUES
  (1, 1, 2, 'Thì hiện tại đơn', 'Dùng để nói về thói quen, lịch trình và sự thật hiện tại.', 'S + V(s/es)', 'Thói quen, lịch trình, sự thật.', 'I study English every day.', 'Thêm s/es với he, she, it.', 'BEGINNER'),
  (2, 1, 3, 'Câu yêu cầu lịch sự', 'Dùng khi gọi món, nhờ giúp đỡ hoặc hỏi thông tin.', 'Can I have...? / Could you...?', 'Tình huống giao tiếp lịch sự.', 'Could you help me, please?', 'Would/Could lịch sự hơn Can.', 'BEGINNER'),
  (3, 2, 8, 'Câu phức', 'Dùng mệnh đề phụ để mở rộng ý trong IELTS Writing.', 'Subordinating clause + main clause', 'Viết câu phức trong bài luận.', 'Although it is difficult, I keep practicing.', 'Dùng dấu phẩy khi mệnh đề phụ đứng đầu câu.', 'INTERMEDIATE'),
  (4, 3, 10, 'Trọng âm từ', 'Giúp người nghe nhận diện từ rõ hơn.', 'STRESS + weak syllable', 'Phát âm từ nhiều âm tiết.', 'PREsent / preSENT', 'Danh từ và động từ có thể đổi trọng âm.', 'ELEMENTARY'),
  (5, 4, 14, 'Câu xin lỗi trong email', 'Dùng để xin lỗi và đề xuất phương án thay thế.', 'I apologize for... / Could we...?', 'Email công sở.', 'I apologize for the delay.', 'Giữ giọng điệu ngắn gọn và lịch sự.', 'ADVANCED');

INSERT INTO exercises (id, course_id, lesson_id, title, description, exercise_type, duration_minutes, max_attempts, status) VALUES
  (1, 1, 1, 'Greeting Quiz', 'Chọn câu chào hỏi phù hợp.', 'VOCABULARY', 10, 3, 'PUBLISHED'),
  (2, 2, 5, 'IELTS Format Quiz', 'Kiểm tra cấu trúc bài thi IELTS.', 'MIXED', 15, 2, 'PUBLISHED'),
  (3, 3, 9, 'Pronunciation Check', 'Nhận diện âm /θ/ và /ð/.', 'LISTENING', 12, 3, 'PUBLISHED'),
  (4, 4, 13, 'Business Email Practice', 'Chọn câu email công sở lịch sự.', 'GRAMMAR', 15, 2, 'PUBLISHED');

INSERT INTO questions (id, exercise_id, question_type, question_text, explanation, points, correct_answer, position) VALUES
  (1, 1, 'SINGLE_CHOICE', 'Cụm nào có nghĩa là xin chào?', 'Hello nghĩa là xin chào.', 1.00, NULL, 1),
  (2, 2, 'SINGLE_CHOICE', 'IELTS có bao nhiêu kỹ năng?', 'IELTS gồm bốn kỹ năng.', 1.00, NULL, 1),
  (3, 2, 'FILL_IN_THE_BLANK', 'Complete: The essay needs clear _____.', 'Evidence nghĩa là bằng chứng.', 1.00, 'evidence', 2),
  (4, 3, 'SINGLE_CHOICE', 'Từ nào có âm /θ/?', 'Think có âm /θ/.', 1.00, NULL, 1),
  (5, 4, 'SINGLE_CHOICE', 'Câu nào phù hợp để dời lịch họp?', 'Could we reschedule... là cách nói lịch sự.', 1.00, NULL, 1),
  (6, 4, 'WRITING', 'Write a short email to reschedule a meeting.', 'Cần có lời xin lỗi, lý do và thời gian đề xuất.', 3.00, NULL, 2);

INSERT INTO answer_options (question_id, option_text, is_correct, position) VALUES
  (1, 'Hello', TRUE, 1),
  (1, 'Goodbye', FALSE, 2),
  (1, 'See you', FALSE, 3),
  (2, 'Four', TRUE, 1),
  (2, 'Two', FALSE, 2),
  (2, 'Six', FALSE, 3),
  (4, 'Think', TRUE, 1),
  (4, 'This', FALSE, 2),
  (4, 'Mother', FALSE, 3),
  (5, 'Could we reschedule the meeting to Friday?', TRUE, 1),
  (5, 'Move it now.', FALSE, 2),
  (5, 'I cannot come. Bye.', FALSE, 3);

INSERT INTO tests (id, course_id, title, description, duration_minutes, max_attempts, pass_score, status) VALUES
  (1, 1, 'Starter Final Test', 'Bài test cuối khóa giao tiếp miễn phí.', 20, 2, 5.00, 'PUBLISHED'),
  (2, 2, 'IELTS Foundation Test', 'Bài test nền tảng IELTS.', 45, 1, 6.00, 'PUBLISHED'),
  (3, 3, 'Pronunciation Mini Test', 'Bài kiểm tra phát âm và nghe cơ bản.', 25, 2, 5.00, 'PUBLISHED');

INSERT INTO test_questions (test_id, question_id, position, points) VALUES
  (1, 1, 1, 1.00),
  (2, 2, 1, 1.00),
  (2, 3, 2, 1.00),
  (3, 4, 1, 1.00);

INSERT INTO test_attempts (id, user_id, test_id, exercise_id, started_at, due_at, submitted_at, score, status) VALUES
  (1, 3, NULL, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 10 MINUTE), DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 8 MINUTE), 1.00, 'GRADED'),
  (2, 3, 2, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 45 MINUTE), NULL, NULL, 'IN_PROGRESS');

INSERT INTO user_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct, points_earned) VALUES
  (1, 1, 1, NULL, TRUE, 1.00);

INSERT INTO coupons (id, code, name, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, used_count, start_at, end_at, status) VALUES
  (1, 'WELCOME20', 'Giảm 20% cho học viên mới', 'PERCENT', 20.00, 200000.00, 100000.00, 100, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'ACTIVE'),
  (2, 'SAVE100K', 'Giảm trực tiếp 100.000đ', 'FIXED', 100000.00, NULL, 500000.00, 50, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'ACTIVE'),
  (3, 'EXPIRED10', 'Mã hết hạn để test validation', 'PERCENT', 10.00, 100000.00, 0.00, 10, 0, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'EXPIRED');

INSERT INTO carts (id, user_id, coupon_id, status) VALUES
  (1, 3, 2, 'ACTIVE'),
  (2, 4, NULL, 'ACTIVE');

INSERT INTO cart_items (cart_id, course_id) VALUES
  (1, 3),
  (2, 2),
  (2, 4);

INSERT INTO orders (
  id, user_id, coupon_id, order_code, subtotal_amount, discount_amount,
  total_amount, status, note, paid_at, canceled_at
) VALUES
  (1, 3, 1, 'ORD-20260711-0001', 799000.00, 159800.00, 639200.00, 'PAID', 'Đơn hàng mẫu đã thanh toán thành công.', NOW(), NULL),
  (2, 4, NULL, 'ORD-20260711-0002', 1090000.00, 0.00, 1090000.00, 'PENDING_PAYMENT', 'Đơn hàng pending dùng để test thanh toán.', NULL, NULL),
  (3, 4, NULL, 'ORD-20260711-0003', 590000.00, 0.00, 590000.00, 'CANCELED', 'Đơn hàng đã hủy để test lịch sử.', NULL, NOW());

INSERT INTO order_items (
  id, order_id, course_id, course_title_snapshot, course_slug_snapshot,
  teacher_id_snapshot, original_price_snapshot, sale_price_snapshot, final_price
) VALUES
  (1, 1, 2, 'IELTS Foundation: Từ vựng và ngữ pháp nền tảng', 'ielts-foundation-tu-vung-va-ngu-phap-nen-tang', 2, 1200000.00, 799000.00, 639200.00),
  (2, 2, 4, 'Business English: Email và họp công sở', 'business-english-email-va-hop-cong-so', 5, 1500000.00, 1090000.00, 1090000.00),
  (3, 3, 3, 'Phát âm chuẩn và nghe hiểu cơ bản', 'phat-am-chuan-va-nghe-hieu-co-ban', 5, 900000.00, 590000.00, 590000.00);

INSERT INTO payments (id, order_id, provider, payment_code, amount, status, payment_url, paid_at, failed_reason) VALUES
  (1, 1, 'MOCK', 'PAY-20260711-0001', 639200.00, 'SUCCESS', NULL, NOW(), NULL),
  (2, 2, 'MOCK', 'PAY-20260711-0002', 1090000.00, 'INITIATED', 'http://localhost:8080/api/payments/mock/PAY-20260711-0002', NULL, NULL),
  (3, 3, 'MOCK', 'PAY-20260711-0003', 590000.00, 'CANCELED', NULL, NULL, 'Người dùng hủy đơn hàng.');

INSERT INTO payment_transactions (
  payment_id, transaction_code, gateway_transaction_code, amount, status, raw_response, transacted_at
) VALUES
  (1, 'TXN-20260711-0001', 'MOCK-GW-0001', 639200.00, 'SUCCESS', JSON_OBJECT('provider', 'MOCK', 'result', 'SUCCESS'), NOW()),
  (2, 'TXN-20260711-0002', 'MOCK-GW-0002', 1090000.00, 'PENDING', JSON_OBJECT('provider', 'MOCK', 'result', 'PENDING'), NOW());

INSERT INTO payment_webhook_logs (
  payment_id, provider, webhook_code, payload, signature, status, processed_at
) VALUES
  (1, 'MOCK', 'WEBHOOK-MOCK-20260711-0001', JSON_OBJECT('paymentCode', 'PAY-20260711-0001', 'status', 'SUCCESS'), 'mock-signature', 'PROCESSED', NOW()),
  (2, 'MOCK', 'WEBHOOK-MOCK-20260711-0002', JSON_OBJECT('paymentCode', 'PAY-20260711-0002', 'status', 'PENDING'), 'mock-signature', 'RECEIVED', NULL);

INSERT INTO coupon_usages (coupon_id, user_id, order_id, discount_amount) VALUES
  (1, 3, 1, 159800.00);

INSERT INTO invoices (order_id, invoice_code, total_amount, billing_name, billing_email) VALUES
  (1, 'INV-20260711-0001', 639200.00, 'Trần Hà Linh', 'student@example.com');

INSERT INTO course_ownerships (user_id, course_id, order_item_id, ownership_type, status, granted_at) VALUES
  (3, 1, NULL, 'FREE', 'ACTIVE', NOW()),
  (3, 2, 1, 'PURCHASED', 'ACTIVE', NOW()),
  (3, 3, NULL, 'ADMIN_GRANTED', 'ACTIVE', NOW()),
  (3, 4, NULL, 'ADMIN_GRANTED', 'ACTIVE', NOW()),
  (4, 1, NULL, 'FREE', 'ACTIVE', NOW());

INSERT INTO course_enrollments (user_id, course_id, status, completed_at) VALUES
  (3, 1, 'ACTIVE', NULL),
  (3, 2, 'ACTIVE', NULL),
  (3, 3, 'ACTIVE', NULL),
  (3, 4, 'ACTIVE', NULL),
  (4, 1, 'ACTIVE', NULL);

INSERT INTO course_reviews (user_id, course_id, rating, comment, status) VALUES
  (3, 1, 5, 'Khóa học dễ hiểu, phù hợp cho người mới bắt đầu.', 'VISIBLE'),
  (3, 2, 4, 'Nội dung IELTS nền tảng rõ ràng, bài tập vừa sức.', 'VISIBLE'),
  (4, 1, 5, 'Phần hội thoại rất thực tế.', 'VISIBLE');

INSERT INTO learning_progress (
  user_id, course_id, lesson_id, status, progress_percent, score,
  study_time_minutes, preview_only, started_at, last_accessed_at, completed_at
) VALUES
  (3, 1, 1, 'COMPLETED', 100.00, 9.00, 25, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (3, 1, 2, 'IN_PROGRESS', 45.00, NULL, 18, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NULL),
  (3, 2, 5, 'COMPLETED', 100.00, 8.00, 30, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (3, 2, 7, 'IN_PROGRESS', 35.00, NULL, 22, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NULL),
  (4, 1, 1, 'IN_PROGRESS', 60.00, NULL, 12, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NULL);

INSERT INTO vocabulary_progress (user_id, vocabulary_id, mastery_level, remembered, difficult, favorite, reviewed_at, next_review_at) VALUES
  (3, 1, 4, TRUE, FALSE, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
  (3, 3, 2, FALSE, TRUE, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY)),
  (3, 4, 1, FALSE, TRUE, FALSE, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY)),
  (4, 1, 2, FALSE, FALSE, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY));

INSERT INTO study_schedules (user_id, course_id, title, scheduled_at, reminder_at, status) VALUES
  (3, 2, 'Ôn từ vựng IELTS Writing', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 20 HOUR), 'PLANNED'),
  (3, 1, 'Hoàn thành bài Daily Conversation', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 44 HOUR), 'PLANNED'),
  (4, 1, 'Luyện chào hỏi 15 phút', DATE_ADD(NOW(), INTERVAL 1 DAY), NULL, 'PLANNED');

INSERT INTO ai_conversations (id, user_id, title, conversation_type) VALUES
  (1, 3, 'Luyện hội thoại phỏng vấn', 'CHATBOT'),
  (2, 3, 'Sửa đoạn IELTS Writing', 'WRITING_ASSISTANT');

INSERT INTO ai_messages (conversation_id, sender, message, token_count) VALUES
  (1, 'USER', 'Can you help me practice a job interview?', 12),
  (1, 'AI', 'Sure. Let us start with: Tell me about yourself.', 18),
  (2, 'USER', 'Please correct my paragraph about online learning.', 10),
  (2, 'AI', 'Your idea is clear. You should improve article usage and sentence connection.', 22);

INSERT INTO writing_submissions (
  user_id, title, original_text, corrected_text, feedback, score,
  grammar_score, vocabulary_score, coherence_score, task_response_score,
  natural_suggestion, suggested_lessons, status
) VALUES
  (3, 'Online learning paragraph', 'Online learning is convenience and help student save time.', 'Online learning is convenient and helps students save time.', 'Bạn dùng sai dạng từ convenience/convenient và thiếu s ở helps.', 7.00, 7.00, 6.50, 7.00, 7.00, 'Online learning is flexible and can help students manage their schedules more effectively.', 'Ôn thì hiện tại đơn; Ôn collocation về education', 'COMPLETED');

INSERT INTO ai_usage_logs (user_id, feature, provider, prompt_tokens, completion_tokens, total_tokens, estimated_cost) VALUES
  (3, 'CHATBOT', 'MOCK', 120, 180, 300, 0.000000),
  (3, 'WRITING_FEEDBACK', 'MOCK', 180, 260, 440, 0.000000);

INSERT INTO refund_requests (order_id, user_id, reason, amount, status, admin_note, processed_at) VALUES
  (3, 4, 'Mua nhầm khóa học, muốn kiểm tra luồng refund.', 590000.00, 'REQUESTED', NULL, NULL);

INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
  (3, 'PAYMENT', 'Thanh toán thành công', 'Bạn đã sở hữu khóa IELTS Foundation.', FALSE),
  (3, 'AI', 'AI đã chấm bài viết', 'Bài viết Online learning paragraph đã có phản hồi.', FALSE),
  (2, 'COURSE', 'Khóa học đã xuất bản', 'Khóa giao tiếp của bạn đang hiển thị công khai.', TRUE),
  (1, 'COURSE', 'Có khóa học chờ duyệt', 'IELTS Writing Task 2 Intensive đang chờ duyệt.', FALSE);

INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata) VALUES
  (1, 'CREATE_TEACHER', 'users', 2, JSON_OBJECT('email', 'teacher@example.com')),
  (1, 'PUBLISH_COURSE', 'courses', 1, JSON_OBJECT('slug', 'giao-tiep-tieng-anh-cho-nguoi-moi-bat-dau')),
  (1, 'APPROVE_PAYMENT', 'orders', 1, JSON_OBJECT('orderCode', 'ORD-20260711-0001')),
  (2, 'SUBMIT_COURSE_REVIEW', 'courses', 5, JSON_OBJECT('slug', 'ielts-writing-task-2-intensive'));
